// Copyright 2019 Campbell Crowley. All rights reserved.
// Author: Campbell Crowley (dev@campbellcrowley.com)
const fs = require('fs');
const SubModule = require('./subModule.js');

/**
 * @description Manages moderator logging on guilds.
 * @augments SubModule
 * @listens Command#setLogChannel
 * @listens Command#logChannel
 */
class ModLog extends SubModule {
  /**
   * @description Creates subModule.
   */
  constructor() {
    super();
    /** @inheritdoc */
    this.myName = 'ModLog';
    /**
     * Guild settings for raids mapped by their guild id.
     *
     * @private
     * @type {object.<ModLog~Settings>}
     * @default
     */
    this._settings = {};
    this.save = this.save.bind(this);
    this.getSettings = this.getSettings.bind(this);
    this._commandSetLogChannel = this._commandSetLogChannel.bind(this);
  }

  /** @inheritdoc */
  initialize() {
    this.command.on(
        new this.command.SingleCommand(
            ['setlogchannel', 'logchannel'], this._commandSetLogChannel, {
              validOnlyInGuild: true,
              defaultDisabled: true,
              permissions: this.Discord.Permissions.FLAGS.MANAGE_ROLES |
                  this.Discord.Permissions.FLAGS.MANAGE_GUILD |
                  this.Discord.Permissions.FLAGS.BAN_MEMBERS |
                  this.Discord.Permissions.FLAGS.KICK_MEMBERS,
            }));

    this.client.guilds.forEach((g) => {
      fs.readFile(
          `${this.common.guildSaveDir}${g.id}/modLog.json`, (err, file) => {
            if (err) return;
            let parsed;
            try {
              parsed = Settings.from(JSON.parse(file));
            } catch (e) {
              return;
            }
            this._settings[g.id] = parsed;
          });
    });
  }
  /** @inheritdoc */
  shutdown() {
    this.command.removeListener('setlogchannel');
  }
  /** @inheritdoc */
  save(opt) {
    if (!this.initialized) return;

    Object.entries(this._settings).forEach((obj) => {
      const dir = `${this.common.guildSaveDir}${obj[0]}/`;
      const filename = `${dir}modLog.json`;
      if (opt == 'async') {
        this.common.mkAndWrite(filename, dir, JSON.stringify(obj[1]));
      } else {
        this.common.mkAndWriteSync(filename, dir, JSON.stringify(obj[1]));
      }
    });
  }

  /**
   * @description Command to set the output logging channel. Changes to the
   * channel the command was run in, or toggles if ran in the same channel.
   *
   * @private
   * @type {commandHandler}
   * @param {Discord~Message} msg Message that triggered command.
   * @listens Command#setLogChannel
   * @listens Command#logChannel
   */
  _commandSetLogChannel(msg) {
    if (this._settings[msg.guild.id] &&
        this._settings[msg.guild.id].channel == msg.channel.id) {
      this.setLogChannel(msg.guild.id, null);
      this.common.reply(msg, 'Disabled Log Channel');
    } else {
      this.setLogChannel(msg.guild.id, msg.channel.id);
      this.common.reply(msg, 'Set Log Channel', msg.channel.name);
    }
  }

  /**
   * @description Set the log channel for a guild.
   * @public
   * @param {string} gId ID of the guild to change the setting for.
   * @param {?string} cId The ID of the channel to set as the output channel.
   */
  setLogChannel(gId, cId) {
    const s = this.getSettings(gId);
    s.channel = cId || null;
  }

  /**
   * @description Obtain reference to settings object for a guild.
   * @public
   * @param {string} gId The ID of the guild to fetch the settings for.
   * @returns {ModLog~Settings} Settings object, creates one with default
   * settings first if it doesn't exist.
   */
  getSettings(gId) {
    if (!this._settings[gId]) this._settings[gId] = new Settings();
    return this._settings[gId];
  }

  /**
   * @description Fetch the human readable action string.
   * @private
   * @param {string} action The action to find the human readable format of.
   * @returns {string} Human readable string.
   */
  _actionString(action) {
    switch (action) {
      case 'kick':
        return 'Kicked';
      case 'ban':
        return 'Banned';
      case 'mute':
        return 'Muted';
      case 'warnAndMute':
        return 'Warned and Muted';
      case 'smite':
        return 'Smited';
      case 'mentionAbuse':
        return 'Mention Abuser';
      case 'messagePurge':
        return 'Purged Messages';
      case 'messageDelete':
      case 'messageBotDelete':
        return 'Deleted a Message';
      case 'messageUpdate':
      case 'messageBotUpdate':
        return 'Edited a Message';
      case 'memberJoin':
        return 'Joined the Server';
      case 'memberLeave':
        return 'Left the Server';
      case 'lockdown':
        return 'Raid Lockdown Started';
      default:
        return `${action[0].toLocaleUpperCase()}${action.slice(1)}`;
    }
  }

  /**
   * @description Fetch the color for the given action.
   * @private
   * @param {string} action The action to lookup.
   * @returns {external:Discord~ColorResolvable} The color for the given action.
   */
  _actionColor(action) {
    switch (action) {
      case 'kick':
        return 'ORANGE';
      case 'ban':
        return 'RED';
      case 'mute':
        return 'YELLOW';
      case 'warnAndMute':
        return 'GOLD';
      case 'smite':
        return 'DARK_GOLD';
      case 'mentionAbuse':
        return 'DARK_PURPLE';
      case 'messagePurge':
        return 'BLUE';
      case 'messageDelete':
      case 'messageBotDelete':
        return 'DARK_BLUE';
      case 'messageUpdate':
      case 'messageBotUpdate':
        return 'DARK_AQUA';
      case 'memberJoin':
        return 'GREEN';
      case 'memberLeave':
        return 'GREY';
      case 'lockdown':
        return 'DARK_NAVY';
      default:
        return 'DEFAULT';
    }
  }

  /**
   * @description Log a message in a guild.
   * @public
   * @param {external:Discord~Guild} guild The guild the action took place in.
   * @param {string} action The action that was performed.
   * @param {?external:Discord~User} [user=null] User that was affected, or null
   * of no user was affected.
   * @param {?external:Discord~User} [owner=null] User that performed the
   * action. Null is for ourself.
   * @param {string} [message=null] Additional information to attach to the log
   * message.
   * @param {string} [message2=null] Additional information to attach to the log
   * message.
   * @param {string} [msgs] Additional messages to attach to the log.
   */
  output(guild, action, user, owner, message, message2, ...msgs) {
    const s = this._settings[guild.id];
    if (!s || !s.channel) return;
    if (!s.check(action)) return;
    const channel = guild.channels.get(s.channel);
    if (!channel) return;
    const embed = new this.Discord.MessageEmbed();
    embed.setTitle(this._actionString(action));
    embed.setColor(this._actionColor(action));
    embed.setFooter(new Date().toString());
    if (user) {
      embed.setThumbnail(user.displayAvatarURL({size: 32}));
      embed.addField(user.tag, `<@${user.id}>\n${user.id}`, true);
    }
    if (owner) embed.addField('Moderator', owner.tag, true);
    if (message) {
      if (message2) {
        embed.addField(message, message2, true);
      } else if (!user && !owner) {
        embed.setDescription(message);
      } else {
        embed.addField('Additional', message, true);
      }
    }
    for (let i = 0; i < msgs.length; i += 2) {
      embed.addField(msgs[i], msgs[i + 1] || '\u200B', true);
    }
    embed.setTimestamp();
    channel.send(embed);
  }
}

/**
 * @description Settings for moderation logging.
 * @memberof ModLog
 * @inner
 */
class Settings {
  /**
   * @description Create default settings.
   */
  constructor() {
    /**
     * @description The channel ID of where to send log messages.
     * @public
     * @type {?string}
     * @default
     */
    this.channel = null;
    /**
     * @description Should the bot log when users are kicked?
     * @public
     * @type {boolean}
     * @default
     */
    this.logKicks = false;
    /**
     * @description Should the bot log when users are banned?
     * @public
     * @type {boolean}
     * @default
     */
    this.logBans = false;
    /**
     * @description Should the bot log when users are muted?
     * @public
     * @type {boolean}
     * @default
     */
    this.logMutes = false;
    /**
     * @description Should the bot log when users abuse mentions?
     * @public
     * @type {boolean}
     * @default
     */
    this.logMentionAbuse = false;
    /**
     * @description Should the bot log when messages are purged?
     * @public
     * @type {boolean}
     * @default
     */
    this.logMessagePurge = false;
    /**
     * @description Should the bot log when a user's message is deleted?
     * @public
     * @type {boolean}
     * @default
     */
    this.logMessageDelete = false;
    /**
     * @description Should the bot log when a bot message is deleted?
     * @public
     * @type {boolean}
     * @default
     */
    this.logMessageBotDelete = false;
    /**
     * @description Should the bot log when a user's message is edited?
     * @public
     * @type {boolean}
     * @default
     */
    this.logMessageUpdate = false;
    /**
     * @description Should the bot log when a bot's message is edited?
     * @public
     * @type {boolean}
     * @default
     */
    this.logMessageBotUpdate = false;
    /**
     * @description Should the bot log when a lockdown is started?
     * @public
     * @type {boolean}
     * @default
     */
    this.logRaidLockdown = false;
    /**
     * Log other actions that have not been classified.
     *
     * @public
     * @type {boolean}
     * @default
     */
    this.logOther = false;
  }

  /**
   * @description Check if the given action should be logged. Ignores if channel
   * is set.
   * @public
   * @param {string} action The action to check if should log.
   * @returns {boolean} True if should log.
   */
  check(action) {
    switch (action) {
      case 'kick':
        return this.logKicks;
      case 'ban':
        return this.logBans;
      case 'mute':
      case 'warnAndMute':
      case 'smite':
        return this.logMutes;
      case 'mentionAbuse':
        return this.logMentionAbuse;
      case 'messagePurge':
        return this.logMessagePurge;
      case 'messageDelete':
        return this.logMessageDelete;
      case 'messageBotDelete':
        return this.logMessageBotDelete;
      case 'messageUpdate':
        return this.logMessageUpdate;
      case 'messageBotUpdate':
        return this.logMessageBotUpdate;
      case 'memberLeave':
        return this.logMemberLeave;
      case 'memberJoin':
        return this.logMemberJoin;
      case 'lockdown':
        return this.logRaidLockdown;
      default:
        return this.logOther;
    }
  }
}

/**
 * @description Create a Settings object from a Settings-like object. Similar to
 * copy-constructor.
 * @public
 * @static
 * @param {object} obj Object to create a Settings object from.
 * @returns {ModLog~Settings} The created object.
 */
Settings.from = function(obj) {
  const output = new Settings();
  output.channel = obj.channel || null;
  output.logKicks = obj.logKicks || false;
  output.logBans = obj.logBans || false;
  output.logMutes = obj.logMutes || false;
  output.logMentionAbuse = obj.logMentionAbuse || false;
  output.logMessagePurge = obj.logMessagePurge || false;
  output.logMessageDelete = obj.logMessageDelete || false;
  output.logMessageBotDelete = obj.logMessageBotDelete || false;
  output.logMessageUpdate = obj.logMessageUpdate || false;
  output.logMessageBotUpdate = obj.logMessageBotUpdate || false;
  output.logMemberLeave = obj.logMemberLeave || false;
  output.logMemberJoin = obj.logMemberJoin || false;
  output.logRaidLockdown = obj.logRaidLockdown || false;
  output.logOther = obj.logOther || false;
  return output;
};

ModLog.Settings = Settings;

module.exports = new ModLog();
