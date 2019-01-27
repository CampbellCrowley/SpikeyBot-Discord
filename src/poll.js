// Copyright 2018 Campbell Crowley. All rights reserved.
// Author: Campbell Crowley (dev@campbellcrowley.com)
const emojiChecker = require('./lib/twemojiChcker.js');
const fs = require('fs');
const mkdirp = require('mkdirp');
const rimraf = require('rimraf');
require('./subModule.js')(Polling); // Extends the SubModule class.

/**
 * @classdesc Controlls poll and vote commands.
 * @class
 * @augments SubModule
 * @listens Command#poll
 * @listens Command#vote
 * @listens Command#endpoll
 * @listens Command#endvote
 */
function Polling() {
  const self = this;
  /** @inheritdoc */
  this.myName = 'Polling';
  /** @inheritdoc */
  this.helpMessage = null;
  /** @inheritdoc */
  this.initialize = function() {
    self.command.on(['poll', 'vote'], commandPoll, true);
    self.command.on(['endpoll', 'endvote'], commandEndPoll, true);

    self.client.guilds.forEach((g) => {
      const dir = self.common.guildSaveDir + g.id + guildSubDir;
      fs.readdir(dir, (err, files) => {
        if (err) return;
        files.forEach((folder) => {
          fs.readFile(dir + folder + saveFilename, (err, data) => {
            if (err) {
              self.error('Failed to read file: ' + dir + folder + saveFilename);
              console.error(err);
              return;
            }
            parsePollString(data);
          });
        });
      });
    });
  };
  /** @inheritdoc */
  this.shutdown = function() {
    self.command.deleteEvent('poll');
    self.command.deleteEvent('endpoll');

    Object.entries(currentPolls).forEach((p) => {
      if (p[1].timeout) self.client.clearTimeout(p[1].timeout);
    });
  };
  /** @inheritdoc */
  this.save = function(opt) {
    self.client.guilds.forEach((g) => {
      const dir = self.common.guildSaveDir + g.id + guildSubDir;
      if (opt == 'async') {
        rimraf(dir, (err) => {
          if (err) {
            self.error('Failed to clean old polls for guild: ' + g.id);
            console.error(err);
          }
        });
      } else {
        try {
          rimraf.sync(dir);
        } catch (err) {
          self.error('Failed to clean old polls for guild: ' + g.id);
          console.error(err);
        }
      }
    });
    const polls = Object.entries(currentPolls);
    for (let i = 0; i < polls.length; i++) {
      const dir = self.common.guildSaveDir + polls[i][1].request.guild.id +
          guildSubDir + polls[i][1].request.author.id;
      const filename = saveFilename;
      const temp = Object.assign({}, polls[i][1]);
      temp.request = {
        channel: temp.request.channel.id,
        message: temp.request.id,
      };
      temp.message = {
        channel: temp.message.channel.id,
        message: temp.message.id,
      };
      delete temp.timeout;
      const pollString = JSON.stringify(temp);
      if (opt === 'async') {
        mkdirAndWrite(dir, filename, pollString);
      } else {
        mkdirAndWriteSync(dir, filename, pollString);
      }
    }
  };

  /**
   * Parse the saved poll data that has been read from file in JSON format.
   * @private
   * @param {string} string The file data.
   */
  function parsePollString(string) {
    let parsed;
    try {
      parsed = JSON.parse(string);
    } catch (err) {
      self.error('Failed to parse poll data');
      console.error(err);
      return;
    }

    self.client.channels.get(parsed.request.channel)
        .messages.fetch(parsed.request.message)
        .then((request) => {
          self.client.channels.get(parsed.message.channel)
              .messages.fetch(parsed.message.message)
              .then((message) => {
                const poll = currentPolls[parsed.message.message] =
                    new Poll(request, message, parsed);
                addListenersToPoll(poll, parsed.message.message);
              })
              .catch((err) => {
                self.error(
                    'Failed to find message: ' + parsed.message.message +
                    ' in ' + parsed.message.channel);
                console.error(err);
              });
        })
        .catch((err) => {
          self.error(
              'Failed to find request: ' + parsed.request.message + ' in ' +
              parsed.request.channel);
          console.error(err);
        });
  }

  /**
   * Asyncronously create a directory and write a file in the directory.
   * @private
   * @param {string} dir The file path to create and write the file to.
   * @param {string} filename The file name of the file without the path.
   * @param {string} data The data to write to the tile.
   */
  function mkdirAndWrite(dir, filename, data) {
    mkdirp(dir, (err) => {
      if (err) {
        self.error('Failed to mkdirp: ' + dir);
        console.error(err);
        return;
      }
      fs.writeFileSync(dir + filename, data, (err) => {
        if (err) {
          self.error('Failed to write: ' + dir + filename);
          console.error(err);
          return;
        }
      });
    });
  }
  /**
   * Syncronously create a directory and write a file in the directory.
   * @private
   * @param {string} dir The file path to create and write the file to.
   * @param {string} filename The file name of the file without the path.
   * @param {string} data The data to write to the tile.
   */
  function mkdirAndWriteSync(dir, filename, data) {
    try {
      mkdirp.sync(dir);
    } catch (err) {
      self.error('Failed to mkdirp: ' + dir);
      console.error(err);
      return;
    }
    try {
      fs.writeFileSync(dir + filename, data);
    } catch (err) {
      self.error('Failed to write: ' + dir + filename);
      console.error(err);
      return;
    }
  }

  /**
   * The subdirectory in the guild to store all member polls.
   * @private
   * @constant
   * @default
   */
  const guildSubDir = '/polls/';
  /**
   * The filename in the member's subdirectory, in the guild's subdirectory, to
   * save a poll's state.
   * @private
   * @constant
   * @default
   */
  const saveFilename = '/save.json';

  /**
   * The default reaction emojis to use for a poll.
   * @private
   * @default
   * @constant
   */
  const defaultEmojis = ['👍', '👎', '🤷'];

  /**
   * Stores the currently cached data about all active polls. Organized by
   * message id that is collecting the poll data.
   *
   * @private
   * @type {Object.<Polling~Poll>}
   */
  const currentPolls = {};

  /**
   * @classdesc Stores data related to a single poll.
   * @class
   * @private
   *
   * @param {Discord~Message} request The message that was sent that caused this
   * poll to begin.
   * @param {Discord~Message} message The message to watch for the results.
   * @param {Polling~PollOptions} options The settings for this current poll.
   * @property {Discord~Message} request Reference to the Message object that
   * caused this poll to begin.
   * @property {Discord~Message} message Reference to the Message object with
   * the reaction listener.
   * @property {string} title The user defined text associated with this poll.
   * @property {?number} endTime The timestamp at which this poll is scheduled
   * to end.
   * @property {string[]} emojis The emojis to add as reactions to use as
   * buttons.
   * @property {string[]} choices The full string that came with the emoji if
   * the user specified custom response options.
   * @property {string[]} timeout The scheduled timeout when this poll will end.
   */
  function Poll(request, message, options) {
    /**
     * Reference to the Message object that caused this poll to begin.
     * @public
     * @type {Discord~Message}
     */
    this.request = request;
    /**
     * Reference to the Message object with the reaction listener.
     * @public
     * @type {Discord~Message}
     */
    this.message = message;
    /**
     * The user defined text associated with this poll.
     * @public
     * @type {string}
     */
    this.title = options.title;
    /**
     * The timestamp at which this poll is scheduled to end.
     * @public
     * @type {?number}
     */
    this.endTime = options.endTime;
    /**
     * The emojis to add as reactions to use as buttons.
     * @public
     * @type {string[]}
     */
    this.emojis = options.emojis;
    /**
     * The full string that came with the emoji if the user specified custom
     * response options.
     * @public
     * @type {string[]}
     */
    this.choices = options.choices || options.emojis;
    /**
     * The scheduled timeout when this poll will end.
     * @public
     * @type {?Timeout}
     */
    this.timeout = null;
  }

  /**
   * Starts a poll.
   *
   * @private
   * @type {commandHandler}
   * @param {Discord~Message} msg Message that triggered command.
   * @listens Command#poll
   * @listens Command#vote
   */
  function commandPoll(msg) {
    if (Object.values(currentPolls).find((obj) => {
      return obj.request.author.id === msg.author.id &&
              obj.request.guild.id === msg.guild.id;
    })) {
      self.common.reply(
          msg,
          'Sorry, you may only have one poll per server at a time.\nType ' +
              self.bot.getPrefix(msg.guild.id) +
              'endpoll to end your current poll.');
      return;
    }
    const choicesMatch = msg.text.match(/\[[^\]]*\]/g);
    let textString = msg.text;
    if (choicesMatch) {
      choicesMatch.forEach((el) => {
        textString = textString.replace(el, '');
      });
    }
    textString = textString.trim();
    const durationMatch = textString.match(/^(\d+)(\w)(.*)/);

    let duration = 0;
    let timeUnit = 'infinite';
    let emojis = defaultEmojis;
    if (durationMatch) {
      switch (durationMatch[2]) {
        case 's':
          duration = durationMatch[1] * 1000;
          timeUnit = 'second';
          break;
        case 'm':
          duration = durationMatch[1] * 1000 * 60;
          timeUnit = 'minute';
          break;
        case 'h':
          duration = durationMatch[1] * 1000 * 60 * 60;
          timeUnit = 'hour';
          break;
        case 'd':
          duration = durationMatch[1] * 1000 * 60 * 60 * 24;
          timeUnit = 'day';
          break;
      }
      textString = durationMatch[3];
    }

    const embed = new self.Discord.MessageEmbed();
    if (textString) {
      embed.setTitle(textString);
    }
    if (duration) {
      embed.setDescription(
          self.common.mention(msg) + '\'s ' + durationMatch[1] + ' ' +
          timeUnit + ' poll');
    } else {
      embed.setDescription(self.common.mention(msg) + '\'s poll');
    }
    if (choicesMatch) {
      if (choicesMatch.length > 25) {
        self.common.reply(msg, 'Sorry, but that is way too many poll options.');
        return;
      }
      emojis = [];
      let error = null;
      choicesMatch.forEach((el, i, obj) => {
        if (error) return;
        el = obj[i] = el.replace(/^\[|\]$/g, '');
        const matchedEmoji = emojiChecker.match(el);
        if (!matchedEmoji) {
          error = i + 1;
          return;
        }
        emojis.push(matchedEmoji[0]);
        embed.addField(el, '\u200B', true);
      });
      if (error) {
        self.common.reply(
            msg,
            'Sorry, but choice #' + error + ' does not have a valid emoji.');
        return;
      }
    }

    const endTime = duration ? Date.now() + duration : null;
    const options = {
      title: textString,
      endTime: endTime,
      emojis: emojis,
      choices: choicesMatch,
    };

    msg.channel.send(embed).then((msg_) => {
      const poll = new Poll(msg, msg_, options);
      currentPolls[msg_.id] = poll;

      addListenersToPoll(poll, msg_.id);

      addNextReaction(poll)();
    });
  }

  /**
   * Add timeout and possibly other listeners to a poll.
   * @private
   *
   * @param {Polling~Poll} poll The poll to register.
   * @param {string} key The {@link Polling~currentPolls} key to remove the poll
   * from once the poll has ended.
   */
  function addListenersToPoll(poll, key) {
    if (poll.endTime) {
      const duration = poll.endTime - Date.now();
      if (duration > 0) {
        poll.timeout = self.client.setTimeout(
            (function(poll, key) {
              return function() {
                endPoll(poll);
                delete currentPolls[key];
              };
            })(poll, key),
            duration);
      }
    }
  }

  /**
   * Create a callback for adding all reactions to a message.
   * @private
   * @param {Polling~Poll} poll The poll object for adding reactions.
   * @param {number} [index=0] The index of the emoji to add first.
   * @return {function} The callback to run on Promise completion.
   */
  function addNextReaction(poll, index = 0) {
    return function() {
      if (poll.emojis.length <= index) return;
      poll.message.react(poll.emojis[index])
          .then(addNextReaction(poll, index + 1));
    };
  }

  /**
   * Ends a poll.
   *
   * @private
   * @type {commandHandler}
   * @param {Discord~Message} msg Message that triggered command.
   * @listens Command#endpoll
   * @listens Command#endvote
   */
  function commandEndPoll(msg) {
    let poll = Object.entries(currentPolls).find((obj) => {
      return obj[1].request.author.id === msg.author.id &&
          obj[1].request.guild.id === msg.guild.id;
    });
    let key;
    if (poll) {
      key = poll[0];
      poll = poll[1];
    }
    if (!poll || !endPoll(poll)) {
      self.common.reply(msg, 'You don\'t currently have a poll.');
    }
    if (key) {
      delete currentPolls[key];
    }
  }

  /**
   * End a poll. Does not remove it from {@link Polling~currentPolls}.
   * @private
   * @param {Polling~Poll} poll The poll to end.
   * @return {boolean} Was the poll successfully ended.
   */
  function endPoll(poll) {
    if (!poll || !poll.message || !poll.request) {
      return false;
    }
    if (poll.timeout) {
      self.client.clearTimeout(poll.timeout);
      poll.timeout = null;
    }
    const reactions = poll.message.reactions.filter((reaction) => {
      return poll.emojis.concat(reaction.emoji.name);
    });

    const embed = new self.Discord.MessageEmbed();
    if (poll.title) embed.setTitle(poll.title);
    embed.setDescription(
        self.common.mention(poll.request) + '\'s poll results');

    if (!poll.endTime) {
      embed.setFooter('Poll ended manually');
    } else if (Date.now() < poll.endTime) {
      embed.setFooter('Poll ended early');
    } else {
      embed.setFooter('Poll ended at time limit');
    }

    let index = -1;
    let max = 0;
    reactions.forEach((r) => {
      const i = poll.emojis.findIndex((e) => {
        return e == r.emoji.name;
      });
      if (r.count - 1 > max) {
        index = i;
        max = r.count - 1;
      }
      embed.addField(poll.choices[i], r.count - 1, true);
    });
    if (index > -1) {
      embed.addField(
          'Top Choice', (poll.choices[index] || poll.emojis[index]) +
                ' with ' + max + ' votes.');
    }

    poll.message.channel.send(embed)
        .then(() => {
          poll.message.delete().catch(() => {});
        })
        .catch((err) => {
          self.error(
              'Failed to send poll results to channel: ' +
              poll.message.channel.id);
          console.error(err);
        });
    return true;
  }
}
module.exports = new Polling();
