// Copyright 2019 Campbell Crowley. All rights reserved.
// Author: Campbell Crowley (dev@campbellcrowley.com)
const fs = require('fs');
const SubModule = require('./subModule.js');

/**
 * @description Manages raid blocking commands and configuration.
 * @listens external:Discord~Client#guildMemberAdd
 * @listens Command#raid
 * @listens Command#lockdown
 * @fires RaidBlock#shutdown
 * @fires RaidBlock#lockdown
 * @fires RaidBlock#action
 */
class RaidBlock extends SubModule {
  /**
   * @description SubModule managing echo related commands.
   */
  constructor() {
    super();
    /** @inheritdoc */
    this.myName = 'RaidBlock';
    /**
     * Guild settings for raids mapped by their guild id.
     *
     * @private
     * @type {object.<RaidBlock~RaidSettings>}
     * @default
     */
    this._settings = {};
    /**
     * All event handlers registered.
     *
     * @private
     * @type {object.<Array.<Function>>}
     * @default
     */
    this._events = {};
    this.save = this.save.bind(this);
    this.on = this.on.bind(this);
    this.removeListener = this.removeListener.bind(this);
    this._commandLockdown = this._commandLockdown.bind(this);
    this._onGuildMemberAdd = this._onGuildMemberAdd.bind(this);
  }

  /** @inheritdoc */
  initialize() {
    this.command.on(
        new this.command.SingleCommand(
            ['lockdown', 'raid'], this._commandLockdown, {
              validOnlyInGuild: true,
              defaultDisabled: true,
              permissions: this.Discord.Permissions.FLAGS.MANAGE_ROLES |
                  this.Discord.Permissions.FLAGS.MANAGE_GUILD |
                  this.Discord.Permissions.FLAGS.BAN_MEMBERS,
            }));
    this.client.on('guildMemberAdd', this._onGuildMemberAdd);

    this.client.guilds.forEach((g) => {
      fs.readFile(
          `${this.common.guildSaveDir}${g.id}/raidSettings.json`,
          (err, file) => {
            if (err) return;
            let parsed;
            try {
              parsed = RaidSettings.from(JSON.parse(file));
              this._settings[g.id] = parsed;
            } catch (e) {
              this.error('Failed to parse raidSettings: ' + g.id);
              console.error(e);
              return;
            }
          });
    });
  }
  /** @inheritdoc */
  shutdown() {
    this.command.removeListener('lockdown');
    this.client.removeListener('guildMemberAdd', this._onGuildMemberAdd);
    this._fire('shutdown');
  }
  /** @inheritdoc */
  save(opt) {
    if (!this.initialized) return;

    Object.entries(this._settings).forEach((obj) => {
      const dir = `${this.common.guildSaveDir}${obj[0]}/`;
      const filename = `${dir}raidSettings.json`;
      if (opt == 'async') {
        this.common.mkAndWrite(filename, dir, JSON.stringify(obj[1]));
      } else {
        this.common.mkAndWriteSync(filename, dir, JSON.stringify(obj[1]));
      }
    });
  }

  /**
   * @description Send a message to a guild's moderation channel (if
   * configured), describing the action that took place.
   * @see {@link ModLog}
   *
   * @private
   * @param {*} args The arguments to pass to ModLog.
   */
  _modLog(...args) {
    const modLog = this.bot.getSubmodule('./modLog.js');
    if (!modLog) return;
    modLog.output(...args);
  }

  /**
   * @description Mute a discord guild member.
   * @see {@link Moderation~muteMember}
   *
   * @private
   * @param {external:Discord~GuildMember} member Member to mute.
   * @param {Function} cb Callback function.
   */
  _muteMember(member, cb) {
    const moderation = this.bot.getSubmodule('./moderation.js');
    if (!moderation) return;
    moderation.muteMember(member, cb);
  }

  /**
   * @description Handle a member being added to a guild.
   *
   * @private
   * @param {external:Discord~GuildMember} member The guild member that was
   * added to a guild.
   */
  _onGuildMemberAdd(member) {
    if (!this._settings[member.guild.id]) return;
    const s = this._settings[member.guild.id];
    const now = Date.now();
    while (s.history.length > 0 && now - s.history[0].time > s.timeInterval) {
      s.history.splice(0, 1);
    }
    for (let i = 0; i < s.history.length; i++) {
      if (s.history[i].id == member.id) {
        s.history.splice(i, 1);
        break;
      }
    }
    s.history.push({time: now, id: member.id});
    if (s.enabled) {
      if (s.numJoin <= s.history.length) {
        this._fire('lockdown', {id: member.guild.id, settings: s});
        if (now - s.start >= s.duration) {
          this._modLog(
              member.guild, 'lockdown', null, null,
              'Lockdown Activated Automatically');
          for (let i = 0; s.history[i].time < now; i++) {
            const m = member.guild.members.get(s.history[i].id);
            if (m) this._doAction(m, s);
          }
        }
        s.start = now;
      }

      if (now - s.start < s.duration) {
        this._doAction(member, s);
      }
    }
  }

  /**
   * @description Perform lockdown action on a member with given settings.
   * @private
   * @param {external:Discord~GuildMember} member Member to perform action on.
   * @param {RaidBlock~RaidSettings} s Guild settings for raids.
   */
  _doAction(member, s) {
    this._fire(
        'action', {id: member.guild.id, action: s.action, user: member.user});
    const self = this;
    const go = function() {
      switch (s.action) {
        case 'kick':
          member.kick('Server on raid lockdown.')
              .then((m) => {
                self._modLog(m.guild, s.action, m.user, null, 'Raid Lockdown');
              })
              .catch((err) => {
                self.error('Failed to kick user during raid!');
                console.error(err);
              });
          break;
        case 'ban':
          member.ban({reason: 'Server on raid lockdown.'})
              .then((m) => {
                self._modLog(m.guild, s.action, m.user, null, 'Raid Lockdown');
              })
              .catch((err) => {
                self.error('Failed to kick user during raid!');
                console.error(err);
              });
          break;
        case 'mute':
          self._muteMember(member, (err) => {
            if (err) {
              self._modLog(
                  member.guild, s.action, member.user, null,
                  'Failed to mute: ' + err);
            } else {
              self._modLog(
                  member.guild, s.action, member.user, null, 'Raid Lockdown');
            }
          });
          break;
      }
    };

    if (s.sendWarning) {
      let verb = '';
      switch (s.action) {
        case 'kick':
          verb = 'kicked';
          break;
        case 'ban':
          verb = 'banned';
          break;
        case 'mute':
          verb = 'muted';
          break;
      }
      const finalMessage = s.warnMessage.replace(/\{action\}/, verb)
          .replace(/\{server\}/g, member.guild.name)
          .replace(/\{username\}/g, member.user.username);
      member.send(finalMessage).then(go).catch(go);
    } else {
      go();
    }
  }

  /**
   * @description Initiate a server lockdown, or lift a current lockdown.
   *
   * @private
   * @type {commandHandler}
   * @param {Discord~Message} msg Message that triggered command.
   * @listens Command#lockdown
   * @listens Command#raid
   */
  _commandLockdown(msg) {
    const s = this.getSettings(msg.guild.id);
    const now = Date.now();
    if (msg.text.trim().length == 0) {
      if (!s.enabled) {
        this.common.reply(msg, 'Lockdown Status', 'Not Configured');
        return;
      }
      const finalString = [];
      const active = now - s.start < s.duration;
      finalString.push(`Active: ${active}`);
      if (active) {
        const dateString = new Date(s.start).toString();
        const timeSince = this._formatDelay(now - s.start);
        const timeLeft = this._formatDelay(1 * s.start + 1 * s.duration);
        const durationString = this._formatDelay(s.duration);
        finalString.push(`Since: ${dateString} (${timeSince})`);
        finalString.push(`Duration: ${durationString} (${timeLeft})`);
        finalString.push(`Action: ${s.action}`);
      } else {
        const dateString = s.start ? new Date(s.start).toString() : 'Never';
        const timeSince =
            s.start ? `(${this._formatDelay(now - s.start)} ago})` : '';
        const timeLeft = s.start ?
            `${this._formatDelay(now - (s.start + s.duration))} ago` :
            '';
        const durationString = this._formatDelay(s.duration);
        const intervalString = this._formatDelay(s.timeInterval);
        finalString.push(`Previous: ${dateString} ${timeSince}`);
        finalString.push(`Ended: ${timeLeft}`);
        finalString.push(
            `Activates if ${s.numJoin} join within ${intervalString}.`);
        finalString.push(`Duration: ${durationString}`);
        finalString.push(`Action: ${s.action}`);
      }
      this.common.reply(msg, 'Lockdown Status', finalString.join('\n'));
      return;
    }
    const cmd = msg.text.trim().split(' ')[0];
    const enableCmds = [
      'enable',
      'enabled',
      'start',
      'begin',
      'on',
      'active',
      'activate',
      'protect',
    ];
    const disableCmds = [
      'disable',
      'end',
      'off',
      'finish',
      'deactivate',
      'inactive',
      'disabled',
      'cancel',
      'abort',
      'stop',
    ];
    if (enableCmds.includes(cmd)) {
      s.enabled = true;
      s.start = now;
      this._fire('lockdown', {id: msg.guild.id, settings: s});
      this.common.reply(msg, 'Activated Lockdown');
      this._modLog(
          msg.guild, 'lockdown', null, msg.author,
          'Lockdown Activated Manually');
    } else if (disableCmds.includes(cmd)) {
      if (s.enabled && now - s.start < s.duration) {
        s.start = null;
        this.common.reply(msg, 'Deactivated Lockdown');
        this._modLog(
            msg.guild, 'lockdown', null, msg.author,
            'Lockdown Deactivated Manually');
      } else {
        this.common.reply(msg, 'Lockdown is already deactivated');
      }
    } else {
      this.common.reply(
          msg, 'Oops! I don\'t understand that.',
          'https://www.spikeybot.com/control/ has most settings for this.');
    }
  }

  /**
   * @description Get the settings for a guilds.
   * @public
   * @param {string} gId The ID of the guild to fetch.
   * @returns {RaidBlock~RaidSettings} Reference to settings object. If it does
   * not exist yet, it will first be created with defaults.
   */
  getSettings(gId) {
    if (!this._settings[gId]) this._settings[gId] = new RaidSettings();
    return this._settings[gId];
  }

  /**
   * @description Register an event handler for a specific event. Fires the
   * handler when the event occurs.
   * @public
   * @param {string} event Name of the event to listen for.
   * @param {Function} handler Callback function handler to fire on the event.
   */
  on(event, handler) {
    if (!this._events[event]) this._events[event] = [];
    this._events[event].push(handler);
  }

  /**
   * @description Remove an event handler that was previously registered.
   * @public
   * @param {string} event Name of the event to listen for.
   * @param {Function} handler Callback function handler to fire on the event.
   */
  removeListener(event, handler) {
    if (!this._events[event]) return;
    if (!handler) return;
    const index = this._events[event].findIndex((el) => el === handler);
    if (index < 0) return;
    this._events[event].splice(index, 1);
  }

  /**
   * @description Fire an event on all handlers.
   * @private
   * @param {string} event The event name to fire.
   * @param {*} args The arguments to pass to handlers.
   */
  _fire(event, ...args) {
    if (!this._events[event]) return;
    this._events[event].forEach((el) => el(...args));
  }

  /**
   * Format a duration in milliseconds into a human readable string.
   *
   * @private
   * @param {number} msecs Duration in milliseconds.
   * @returns {string} Formatted string.
   */
  _formatDelay(msecs) {
    let output = '';
    let unit = 7 * 24 * 60 * 60 * 1000;
    if (msecs >= unit) {
      const num = Math.floor(msecs / unit);
      output += num + ' week' + (num == 1 ? '' : 's') + ', ';
      msecs -= num * unit;
    }
    unit /= 7;
    if (msecs >= unit) {
      const num = Math.floor(msecs / unit);
      output += num + ' day' + (num == 1 ? '' : 's') + ', ';
      msecs -= num * unit;
    }
    unit /= 24;
    if (msecs >= unit) {
      const num = Math.floor(msecs / unit);
      output += num + ' hour' + (num == 1 ? '' : 's') + ', ';
      msecs -= num * unit;
    }
    unit /= 60;
    if (msecs >= unit) {
      const num = Math.floor(msecs / unit);
      output += num + ' minute' + (num == 1 ? '' : 's') + ', ';
      msecs -= num * unit;
    }
    unit /= 60;
    if (msecs >= unit) {
      const num = Math.round(msecs / unit);
      output += num + ' second' + (num == 1 ? '' : 's') + '';
    }
    return output.replace(/,\s$/, '');
  }
}

/**
 * Container for RaidBlock related settings.
 *
 * @memberof RaidBlock
 * @inner
 */
class RaidSettings {
  /**
   * @description Create a settings object.
   *
   * @param {boolean} [enabled=false] Is raid protection enabled.
   * @param {number} [numJoin=5] Number of users joined in given time.
   * @param {number} [timeInterval=10000] Time interval for checking number of
   * users joined.
   * @param {number} [duration=600000] Amount of time to be in automated
   * lockdown.
   * @param {string} [action='kick'] Action to perform during lockdown.
   * @param {?string} [warnMessage=null] DM message to send.
   * @param {boolean} [sendWarning=false] Should send DM.
   */
  constructor(
      enabled = false, numJoin = 5, timeInterval = 10000, duration = 600000,
      action = 'kick', warnMessage = null, sendWarning = false) {
    /**
     * @description Is raid protection enabled.
     * @public
     * @type {boolean}
     * @default false
     */
    this.enabled = enabled;
    /**
     * @description Number of users joined within the configured time interval
     * to be considered a raid.
     * @public
     * @type {number}
     * @default 5
     */
    this.numJoin = numJoin;
    /**
     * @description Amount of time for if too many players join, it will be
     * considered a raid. Time in milliseconds.
     * @public
     * @type {number}
     * @default 10000
     */
    this.timeInterval = timeInterval;
    /**
     * @description Amount of time to stay on lockdown after a raid has been
     * detected to have ended.
     * @public
     * @type {number}
     * @default 600000 (10 Minutes)
     */
    this.duration = duration;
    /**
     * @description Action to perform, while on lockdown, to new member who
     * join. Possible values are `kick`, `ban`, or `mute`.
     * @public
     * @type {string}
     * @default 'kick'
     */
    this.action = action;
    if (!['kick', 'ban', 'mute'].includes(this.action)) this.action = 'kick';
    /**
     * @description Current raid block state information. Not null is if server
     * has had a lockdown, start is the last timestamp we consider the raid to
     * be active, or null if no raid is active.
     * @public
     * @type {?number}
     * @default
     */
    this.start = null;
    /**
     * @description History of previous member who joined the server within the
     * time interval. Time is timestamp of join, and id is user's account id.
     * @public
     * @type {Array.<{time: number, id: string}>}
     * @default
     */
    this.history = [];
    /**
     * @description Message to send to users when they are being warned that the
     * raid lockdown is active.
     * @public
     * @type {string}
     * @default
     */
    this.warnMessage = warnMessage ||
        '{username}, you have been {action} in' +
            ' {server} because the server is on lockdown.';
    /**
     * @description Should we additionally send `warnMessage` in a DM to the
     * user prior to performing the action during a lockdown.
     * @public
     * @type {boolean}
     * @default
     */
    this.sendWarning = sendWarning;
  }
}

/**
 * @description Create a RaidSettings object from a similarly structured object.
 * Similar to copy-constructor.
 *
 * @public
 * @static
 * @param {object} obj Object to convert to RaidSettings.
 * @returns {RaidBlock~RaidSettings} Created raidsettings object.
 */
RaidSettings.from = function(obj) {
  const output = new RaidSettings(
      obj.enabled, obj.numJoin, obj.timeInterval, obj.duration, obj.action,
      obj.warnMessage, obj.sendWarning);
  return output;
};

RaidBlock.RaidSettings = RaidSettings;

module.exports = new RaidBlock();
