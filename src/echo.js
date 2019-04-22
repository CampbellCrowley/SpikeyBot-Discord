// Copyright 2019 Campbell Crowley. All rights reserved.
// Author: Campbell Crowley (dev@campbellcrowley.com)
const fs = require('fs');
const mkdirp = require('mkdirp');
const SubModule = require('./subModule.js');

/**
 * @description Manges echo-related commands.
 * @listens Discord:external~Client#message
 * @listens Command#say
 * @listens Command#echo
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
    this.save = this.save.bind(this);
    this._commandSay = this._commandSay.bind(this);
    this._commandBecome = this._commandBecome.bind(this);
    this._onMessage = this._onMessage.bind(this);
  }

  /** @inheritdoc */
  initialize() {
    this.command.on(['say', 'echo'], this._commandSay);
    this.command.on(
        new this.command.SingleCommand(
            ['become', 'self', 'be', 'character', 'impersonate'],
            this._commandBecome, {validOnlyInGuild: true}));
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
   * @description Bind a command context.
   * @param {commandHandler} cb Handler to bind to this instance.
   * @returns {commandHandler} Same function, but with `this` bound.
   */
  _cmd(cb) {
    return cb.bind(this);
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
    msg.channel.fetchWebhooks()
        .then((hooks) => {
          const hook = hooks.find((h) => h.owner.id == this.client.user.id);
          if (!hook) return;
          hook.send(msg.content, {
            username: char.username,
            avatarURL: char.avatarURL,
            files: msg.attachments.map((el) => el.url),
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
    if (!this._characters[msg.guild.id][msg.channel.id]) {
      this._characters[msg.guild.id][msg.channel.id] = {};
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
        this._characters[msg.guild.id][msg.channel.id][msg.author.id] =
            new Character(username, url);
      });

      msg.channel.fetchWebhooks()
          .then((hooks) => {
            const hook = hooks.find((h) => h.owner.id == this.client.user.id);
            if (!hook) {
              if (!msg.channel.permissionsFor(msg.guild.me)
                  .has(this.Discord.Permissions.FLAGS.MANAGE_WEBHOOKS)) {
                this.common.reply(
                    msg, 'Failed to create webhook',
                    'I need permission to manage webhooks.');
                return;
              }
              msg.channel
                  .createWebhook(
                      'SpikeyBot NPCs',
                      {reason: 'Used for becoming other characters.'})
                  .then((created) => {
                    this.common.reply(msg, 'Created', username);
                  })
                  .catch((err) => {
                    this.error(
                        'Failed to create webhook for channel: ' +
                        msg.channel.id);
                    console.error(err);
                    this.common.reply(
                        msg, 'Failed to create webhook', err.name);
                  });
            } else {
              this.common.reply(msg, 'Created', username);
            }
          })
          .catch((err) => {
            this.error(
                'Failed to fetch webhooks for channel: ' + msg.channel.id);
            console.error(err);
          });
    } else {
      delete this._characters[msg.guild.id][msg.channel.id][msg.author.id];
      this.common.reply(msg, 'Disabled character');
    }
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
