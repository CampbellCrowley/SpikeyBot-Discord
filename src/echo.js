// Copyright 2019 Campbell Crowley. All rights reserved.
// Author: Campbell Crowley (dev@campbellcrowley.com)
const fs = require('fs');
const mkdirp = require('mkdirp');
const SubModule = require('./subModule.js');

/**
 * @description Manages echo-related commands.
 * @augments SubModule
 * @listens Discord:external~Client#message
 * @listens Command#say
 * @listens Command#echo
 * @listens Command#become
 * @listens Command#self
 * @listens Command#be
 * @listens Command#character
 * @listens Command#impersonate
 * @listens Command#who
 * @listens Command#whois
 * @listens Command#whoami
 */
class Echo extends SubModule {
  /**
   * @description SubModule managing echo related commands.
   */
  constructor() {
    super();
    /** @inheritdoc */
    this.myName = 'Echo';
    /**
     * @description The id of the last user to use the say command.
     *
     * @private
     * @type {string}
     * @default
     */
    this._prevUserSayId = '';
    /**
     * @description The number of times the say command has been used
     * consecutively by the previous user.
     *
     * @private
     * @type {number}
     * @default
     */
    this._prevUserSayCnt = 0;
    /**
     * @description All npc characters a users are currently being. Mapped by
     * guild id, then channel id, then user id.
     *
     * @private
     * @type {Object}
     * @default
     */
    this._characters = {};
    this._commandSay = this._commandSay.bind(this);
    this._commandBecome = this._commandBecome.bind(this);
    this._commandWhoIs = this._commandWhoIs.bind(this);
    this._commandWhoAmI = this._commandWhoAmI.bind(this);
    this._commandResetCharacters = this._commandResetCharacters.bind(this);
    this._onMessage = this._onMessage.bind(this);
  }

  /** @inheritdoc */
  initialize() {
    this.command.on(['say', 'echo'], this._commandSay);
    this.command.on(
        new this.command.SingleCommand(
            ['become', 'self', 'be', 'character', 'impersonate'],
            this._commandBecome, {
              validOnlyInGuild: true,
              defaultDisabled: true,
              permissions: this.Discord.Permissions.FLAGS.MANAGE_MESSAGES |
                  this.Discord.Permissions.FLAGS.MANAGE_WEBHOOKS |
                  this.Discord.Permissions.FLAGS.MANAGE_GUILD,
            }));
    this.command.on(
        new this.command.SingleCommand(
            ['who', 'whois'], this._commandWhoIs, {validOnlyInGuild: true}));
    this.command.on('whoami', this._commandWhoAmI);
    this.command.on(
        new this.command.SingleCommand(
            ['resetcharacters', 'deletecharacters'],
            this._commandResetCharacters, {
              validOnlyInGuild: true,
              defaultDisabled: true,
              permissions: this.Discord.Permissions.FLAGS.MANAGE_MESSAGES |
                  this.Discord.Permissions.FLAGS.MANAGE_WEBHOOKS |
                  this.Discord.Permissions.FLAGS.MANAGE_GUILD,
            }));
    this.client.on('message', this._onMessage);

    this.client.guilds.forEach((g) => {
      fs.readFile(
          `${this.common.guildSaveDir}${g.id}/characters.json`, (err, file) => {
            if (err) return;
            let parsed;
            try {
              parsed = JSON.parse(file);
            } catch (e) {
              return;
            }
            this._characters[g.id] = parsed;
          });
    });
  }
  /** @inheritdoc */
  shutdown() {
    this.command.removeListener('say');
    this.command.removeListener('become');
    this.command.removeListener('whoami');
    this.command.removeListener('whois');
    this.command.removeListener('resetcharacters');
    this.client.removeListener('message', this._onMessage);
  }
  /** @inheritdoc */
  save(opt) {
    if (!this.initialized) return;

    Object.entries(this._characters).forEach((obj) => {
      const dir = `${this.common.guildSaveDir}${obj[0]}/`;
      const filename = `${dir}characters.json`;
      if (opt == 'async') {
        this._mkAndWrite(filename, dir, JSON.stringify(obj[1]));
      } else {
        this._mkAndWriteSync(filename, dir, JSON.stringify(obj[1]));
      }
    });
  }

  /**
   * Write data to a file and make sure the directory exists or create it if it
   * doesn't. Async.
   *
   * @see {@link Echo~_mkAndWriteSync}
   *
   * @private
   * @param {string} filename The name of the file including the directory.
   * @param {string} dir The directory path without the file's name.
   * @param {string} data The data to write to the file.
   */
  _mkAndWrite(filename, dir, data) {
    mkdirp(dir, (err) => {
      if (err) {
        this.error('Failed to make directory: ' + dir);
        console.error(err);
        return;
      }
      fs.writeFile(filename, data, (err2) => {
        if (err2) {
          this.error('Failed to save echos: ' + filename);
          console.error(err2);
          return;
        }
      });
    });
  }
  /**
   * Write data to a file and make sure the directory exists or create it if it
   * doesn't. Synchronous.
   *
   * @see {@link Echo~_mkAndWrite}
   *
   * @private
   * @param {string} filename The name of the file including the directory.
   * @param {string} dir The directory path without the file's name.
   * @param {string} data The data to write to the file.
   */
  _mkAndWriteSync(filename, dir, data) {
    try {
      mkdirp.sync(dir);
    } catch (err) {
      this.error('Failed to make directory: ' + dir);
      console.error(err);
      return;
    }
    try {
      fs.writeFileSync(filename, data);
    } catch (err) {
      this.error('Failed to save echos: ' + filename);
      console.error(err);
      return;
    }
  }

  /**
   * Handle receiving a message for webhook replacing.
   *
   * @private
   * @param {Discord~Message} msg The message that was sent.
   * @listens Discord~Client#message
   */
  _onMessage(msg) {
    if (!msg.guild || msg.author.bot) return;
    const char = this._characters[msg.guild.id] &&
        this._characters[msg.guild.id][msg.channel.id] &&
        this._characters[msg.guild.id][msg.channel.id][msg.author.id];
    if (!char) {
      return;
    }
    if (!msg.channel.permissionsFor(msg.guild.me)
        .has(this.Discord.Permissions.FLAGS.MANAGE_WEBHOOKS)) {
      return;
    }
    msg.channel.fetchWebhooks()
        .then((hooks) => {
          const hook = hooks.find((h) => h.owner.id == this.client.user.id);
          if (!hook) return;
          hook.send(msg.content, {
            username: char.username,
            avatarURL: char.avatarURL,
            // files: msg.attachments.map((el) => el.url),
          });
          if (msg.channel.permissionsFor(msg.guild.me)
              .has(this.Discord.Permissions.FLAGS.MANAGE_MESSAGES)) {
            msg.delete().catch((err) => {
              this.error('Failed to delete message: ' + msg.channel.id);
              console.error(err);
            });
          }
        })
        .catch((err) => {
          this.error('Unable to fetch webhooks for channel: ' + msg.channel.id);
          console.error(err);
        });
  }

  /**
   * @description The user's message will be deleted and the bot will send an
   * identical message without the command to make it seem like the bot sent the
   * message.
   *
   * @private
   * @type {commandHandler}
   * @param {Discord~Message} msg Message that triggered command.
   * @listens Command#say
   * @listens Command#echo
   */
  _commandSay(msg) {
    if (msg.delete) msg.delete().catch(() => {});
    const content = msg.text.trim();
    msg.channel.send(content || '\u200B').catch((err) => {
      this.warn(
          'Failed to send message in channel: ' + msg.channel.id + ': ' +
          content);
      console.error(err);
    });
    if (msg.fabricated || this._prevUserSayId != msg.author.id) {
      this._prevUserSayId = msg.author.id;
      this._prevUserSayCnt = 0;
    }
    this._prevUserSayCnt++;
    if (this._prevUserSayCnt % 3 === 0) {
      msg.channel.send(
          'Help! ' + this.common.mention(msg) +
          ' is putting words into my mouth!');
    }
  }

  /**
   * @description Replace all following messages from a user with a character.
   *
   * @private
   * @type {commandHandler}
   * @param {Discord~Message} msg Message that triggered command.
   * @listens Command#become
   * @listens Command#self
   * @listens Command#be
   * @listens Command#character
   * @listens Command#imprsonate
   */
  _commandBecome(msg) {
    if (!this._characters[msg.guild.id]) {
      this._characters[msg.guild.id] = {};
    }
    let channel = msg.channel;
    if (msg.mentions.channels.size > 0) {
      channel = msg.mentions.channels.first();
      msg.text =
          msg.text.replace(this.Discord.MessageMentions.CHANNELS_PATTERN, '');
    }
    if (!this._characters[msg.guild.id][channel.id]) {
      this._characters[msg.guild.id][channel.id] = {};
    }
    if (msg.text.length > 1) {
      let url;
      if (msg.attachments.size == 1) {
        const a = msg.attachments.first();
        url = a.proxyURL || a.url;
      } else if (msg.attachments.size == 0) {
        url = msg.text.match(Echo._urlRegex);
        if (url) url = url[0];
      }
      if (typeof url !== 'string' || url.length == 0) {
        /* this.common.reply(
            msg, 'Hmm, you didn\'t give me an image to use as an avatar.');
        return; */
        url = undefined;
      }
      const username = this._formatUsername(msg.text, url);
      if (username.length < 2) {
        this.common.reply(msg, 'Please specify a valid username.', username);
        return;
      }

      // Wait one loop to prevent the command from triggering the event.
      setTimeout(() => {
        this._characters[msg.guild.id][channel.id][msg.author.id] =
            new Character(username, url);
      });

      channel.fetchWebhooks()
          .then((hooks) => {
            const hook = hooks.find((h) => h.owner.id == this.client.user.id);
            if (!hook) {
              if (!channel.permissionsFor(msg.guild.me)
                  .has(this.Discord.Permissions.FLAGS.MANAGE_WEBHOOKS)) {
                this.common.reply(
                    msg, 'Failed to create webhook',
                    'I need permission to manage webhooks.');
                return;
              }
              channel
                  .createWebhook(
                      'SpikeyBot NPCs',
                      {reason: 'Used for becoming other characters.'})
                  .then((created) => {
                    this.common.reply(msg, 'Created', username);
                  })
                  .catch((err) => {
                    this.error(
                        'Failed to create webhook for channel: ' + channel.id);
                    console.error(err);
                    this.common.reply(
                        msg, 'Failed to create webhook', err.message);
                  });
            } else {
              this.common.reply(msg, 'Created', username);
            }
          })
          .catch((err) => {
            this.error('Failed to fetch webhooks for channel: ' + channel.id);
            console.error(err);
            this.common.reply(msg, 'Unable to fetch webhooks.', err.message);
          });
    } else {
      delete this._characters[msg.guild.id][channel.id][msg.author.id];
      this.common.reply(msg, 'Disabled character');
    }
  }

  /**
   * Tell the user who they are.
   *
   * @private
   * @type {Command~commandHandler}
   * @param {Discord~Message} msg The message that triggered this command.
   * @listens Command#whoami
   */
  _commandWhoAmI(msg) {
    const char = msg.guild && this._characters[msg.guild.id] &&
        this._characters[msg.guild.id][msg.channel.id] &&
        this._characters[msg.guild.id][msg.channel.id][msg.author.id];
    if (char) {
      this.common.reply(
          msg, msg.author.tag, msg.author.username + ' (' +
              msg.member.nickname + ')\nCharacter: ' + char.username);
    } else {
      this.common.reply(
          msg, msg.author.tag,
          `${msg.author.username} (${msg.member.nickname})`);
    }
  }

  /**
   * List all characters currently active in all channels of a guild.
   *
   * @private
   * @type {Command~commandHandler}
   * @param {Discord~Message} msg The message that triggered this command.
   * @listens Command#who
   * @listens Command#whois
   */
  _commandWhoIs(msg) {
    const chars = msg.guild && this._characters[msg.guild.id];
    let output = [];
    for (let channel in chars) {
      if (!channel) continue;
      channel = msg.guild.channels.get(channel);
      if (!channel) continue;
      const list = [];

      for (let member in chars[channel.id]) {
        if (!member) continue;
        member = msg.guild.members.get(member);
        if (!member) continue;
        list.push(
            `${member.user.tag}: ${chars[channel.id][member.id].username}`);
      }
      if (list.length > 0) {
        output.push(`**#${channel.name}**`);
        output = output.concat(list);
      }
    }
    this.common.reply(msg, 'Current Characters', output.join('\n') || 'None');
  }

  /**
   * Reset all current characters, and delete all webhooks.
   *
   * @private
   * @type {Command~commandHandler}
   * @param {Discord~Message} msg The message that triggered this command.
   * @listens Command#resetcharacters
   */
  _commandResetCharacters(msg) {
    if (!this._characters[msg.guild.id]) {
      this.common.reply(msg, 'No characters to reset.');
      return;
    }
    const channels = Object.keys(this._characters[msg.guild.id]);

    channels.forEach((el) => {
      const channel = msg.guild.channels.get(el);
      if (!channel) return;
      channel.fetchWebhooks()
          .then((hooks) => {
            const hook = hooks.find((h) => h.owner.id == this.client.user.id);
            hook.delete('Clearing all characaters.').catch(() => {});
          })
          .catch(() => {});
    });
    this._characters[msg.guild.id] = {};
    this.common.reply(msg, 'All characters deleted.');
  }

  /**
   * @description Remove url from username, and format to rules similar to
   * Discord.
   *
   * @private
   * @param {string} u The username.
   * @param {string|RegExp} [remove] A substring or RegExp to remove.
   * @returns {string} Formatted username.
   */
  _formatUsername(u, remove) {
    if (!remove) remove = /a^/;  // Match nothing by default.
    return u.replace(remove, '')
        .replace(/^\s+|\s+$|@|#|:|```/g, '')
        .replace(/\s{2,}/g, ' ')
        .substring(0, 32);
  }
}

/**
 * @description A character to send as a webhook.
 * @memberof Echo
 * @inner
 */
class Character {
  /**
   * @description Create a Character.
   * @param {string} username Username for webhook.
   * @param {string} [url] Avatar url override for webhook.
   */
  constructor(username, url) {
    /**
     * @description Username of this character.
     * @type {string}
     */
    this.username = username;
    /**
     * @description Avatar url of this character.
     * @type {string}
     */
    this.avatarURL = url;
  }
}

Echo.Character = Character;


/**
 * Regex to match all URLs in a string.
 *
 * @private
 * @type {RegExp}
 * @constant
 * @default
 * @static
 */
Echo._urlRegex = new RegExp(
    '(http(s)?:\\/\\/.)?(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{2,256}\\.[a-z]' +
        '{2,6}\\b([-a-zA-Z0-9@:%_\\+.~#?&//=]*)(?![^<]*>)',
    'g');

module.exports = new Echo();
