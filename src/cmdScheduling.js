// Copyright 2018 Campbell Crowley. All rights reserved.
// Author: Campbell Crowley (dev@campbellcrowley.com)
const fs = require('fs');
const mkdirp = require('mkdirp');
require('./subModule.js')(CmdScheduling);  // Extends the SubModule class.

/**
 * @classdesc Provides interface for scheduling a specific time or interval for
 * a command to be run.
 * @class
 * @augments SubModule
 * @listens Command#schedule
 * @listens Command#sch
 * @listens Command#sched
 * @listens Command#scheduled
 */
function CmdScheduling() {
  const self = this;

  /** @inheritdoc */
  this.myName = 'CmdScheduling';

  /** @inheritdoc */
  this.initialize = function() {
    const adminOnlyOpts = new self.command.CommandSetting({
      validOnlyInGuild: true,
      defaultDisabled: true,
      permissions: self.Discord.Permissions.FLAGS.MANAGE_ROLES |
          self.Discord.Permissions.FLAGS.MANAGE_GUILD |
          self.Discord.Permissions.FLAGS.BAN_MEMBERS,
    });
    self.command.on(
        new self.command.SingleCommand(
            ['schedule', 'sch', 'sched', 'scheduled'], commandSchedule,
            adminOnlyOpts));

    const now = Date.now();
    self.client.guilds.forEach((g) => {
      fs.readFile(self.common.guildSaveDir + g.id + saveSubDir, (err, data) => {
        if (err && err.code == 'ENOENT') return;
        if (err) {
          self.warn('Failed to load scheduled command: ' + g.id);
          return;
        }
        try {
          const parsed = JSON.parse(data);
          if (!parsed || parsed.length == 0) {
            self.warn('Failed to parse scheduled commands: ' + g.id);
            return;
          }
          if (!schedules[g.id]) schedules[g.id] = [];
          for (let i = 0; i < parsed.length; i++) {
            if (parsed[i].bot != self.client.user.id) continue;
            if (parsed[i].time < now) {
              while (parsed[i].repeatDelay > 0 &&
                     parsed[i].time < now - parsed[i].repeatDelay) {
                parsed[i].time += parsed[i].repeatDelay;
              }
            }
            schedules[g.id].push(new ScheduledCommand(parsed[i]));
          }
        } catch (err) {
          self.error('Failed to parse data for guild commands: ' + g.id);
          console.error(err);
        }
      });
    });

    longInterval = self.client.setInterval(reScheduleCommands, maxTimeout);
  };
  /**
   * @inheritdoc
   * @fires CmdScheduling#shutdown
   * */
  this.shutdown = function() {
    self.command.deleteEvent('schedule');
    if (longInterval) self.client.clearInterval(longInterval);
    for (const i in schedules) {
      if (!schedules[i] || !schedules[i].length) continue;
      schedules[i].forEach((el) => el.cancel());
    }
    fireEvent('shutdown');
    listeners = {};
  };
  /**
   * @override
   * @inheritdoc
   */
  this.save = function(opt) {
    self.client.guilds.forEach((g) => {
      const dir = self.common.guildSaveDir + g.id;
      const filename = dir + saveSubDir;
      if (opt === 'async') {
        fs.unlink(filename, () => {});
      } else {
        try {
          fs.unlinkSync(filename);
        } catch (err) {
          // Meh.
        }
      }
    });
    for (const i in schedules) {
      if (!schedules[i] || !schedules[i].length) continue;
      schedules[i] = schedules[i].filter((el) => !el.complete);
      const data = schedules[i].map((el) => el.toJSON());
      writeSaveData(i, data, opt);
    }
  };

  /**
   * Write save data for a guild.
   *
   * @private
   *
   * @param {string|number} i The guild ID.
   * @param {Object} data The data to write.
   * @param {string} [opt='sync'] See {@link save}.
   */
  function writeSaveData(i, data, opt) {
    const dir = self.common.guildSaveDir + i;
    const filename = dir + saveSubDir;
    if (opt === 'async') {
      mkdirp(dir, (err) => {
        if (err) {
          self.error('Failed to make directory: ' + dir);
          console.log(err);
          return;
        }
        fs.readFile(filename, (err, rec) => {
          if (!err && rec) {
            try {
              const parsed = JSON.parse(rec);
              if (parsed && parsed.length > 0) {
                data = rec.filter((el) => el.bot != self.client.user.id)
                    .concat(data);
              }
            } catch (e) {
              // No data exists.
            }
          }
          const finalData = JSON.stringify(data);
          fs.writeFile(filename, finalData, (err) => {
            if (err) {
              self.error('Failed to write file: ' + filename);
              console.error(err);
            }
          });
        });
      });
    } else {
      try {
        mkdirp.sync(dir);
      } catch (err) {
        self.error('Failed to make directory: ' + dir);
        console.log(err);
        return;
      }
      try {
        const rec = fs.readFileSync(filename);
        const parsed = JSON.parse(rec);
        if (parsed && parsed.length > 0) {
          data = rec.filter((el) => el.bot != self.client.user.id).concat(data);
        }
      } catch (err) {
        // No data exists.
      }
      try {
        fs.writeFileSync(filename, JSON.stringify(data));
      } catch (err) {
        self.error('Failed to write file: ' + filename);
        console.error(err);
      }
    }
  }

  /**
   * Interval that runs every maxTimeout milliseconds in order to re-schedule
   * commands that were beyond the max timeout duration.
   *
   * @private
   * @type {Interval}
   */
  let longInterval;

  /**
   * The maximum amount of time to set a Timeout for. The JS limit is 24 days
   * (iirc), after which, Timeouts do not work properly.
   *
   * @private
   * @constant
   * @default 14 Days
   * @type {number}
   */
  const maxTimeout = 14 * 24 * 60 * 60 * 1000;

  /**
   * The filename in the guild directory to save the scheduled commands.
   *
   * @private
   * @constant
   * @default
   * @type {string}
   */
  const saveSubDir = '/scheduledCmds.json';

  /**
   * The possible characters that can make up an ID of a scheduled command.
   *
   * @private
   * @constant
   * @default
   * @type {string}
   */
  const idChars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  /**
   * The color to use for embeds sent from this submodule.
   *
   * @private
   * @constant
   * @default
   * @type {number[]}
   */
  const embedColor = [50, 255, 255];

  /**
   * Minimum allowable amount of time in milliseconds from when the scheduled
   * command is registered to when it runs.
   *
   * @public
   * @constant
   * @default 10 Seconds
   * @type {number}
   */
  this.minDelay = 10000;

  /**
   * Minimum allowable amount of time in milliseconds from when the scheduled
   * command is run to when it run may run again.
   *
   * @public
   * @constant
   * @default 30 Seconds
   * @type {number}
   */
  this.minRepeatDelay = 30000;

  /**
   * Currently registered event listeners, mapped by event name.
   *
   * @private
   * @type {Object.<Array.<Function>>}
   */
  let listeners = {};

  /**
   * All of the currently loaded commands to run. Mapped by Guild ID, then
   * sorted arrays by time to run next command.
   *
   * @private
   * @type {Object.<Array.<CmdScheduling.ScheduledCommand>>}
   */
  const schedules = {};

  /**
   * @classdesc Stores information about a specific command that is scheduled.
   * @class
   *
   * @public
   * @param {string|Object} cmd The command to run, or an object instance of
   * this class (exported using toJSON, then parsed into an object).
   * @param {string|number|Discord~TextChannel} channel The channel or channel
   * ID of where to run the command.
   * @param {string|number|Discord~Message} message The message or message ID
   * that created this scheduled command.
   * @param {number} time The Unix timestamp at which to run the command.
   * @param {?number} repeatDelay The delay in milliseconds at which to run the
   * command again, or null if it does not repeat.
   *
   * @property {string} cmd The command to run.
   * @property {number|string} bot The ID of the bot instantiating this command.
   * @property {Discord~TextChannel} channel The channel or channel ID of where
   * to run the command.
   * @property {string|number} channelId The id of the channel where the message
   * was  sent.
   * @property {?Discord~Message} message The message that created this
   * scheduled command, or null if the message was deleted.
   * @property {string|number} messageId The id of the message sent.
   * @property {number} time The Unix timestamp at which to run the command.
   * @property {number} [repeatDelay=0] The delay in milliseconds at which to
   * run the command again. 0 to not repeat.
   * @property {string} id Random base 36, 3-character long id of this command.
   * @property {boolean} complete True if the command has been run, and will not
   * run again.
   * @property {Timeout} timeout The current timeout registered to run the
   * command.
   * @property {Discord~GuildMember} member The author of this ScheduledCommand.
   * @property {string|number} memberId The id of the member.
   */
  function ScheduledCommand(cmd, channel, message, time, repeatDelay = 0) {
    const myself = this;
    if (typeof cmd === 'object') {
      channel = cmd.channel;
      message = cmd.message;
      time = cmd.time;
      repeatDelay = cmd.repeatDelay;
      this.id = cmd.id;
      this.member = cmd.member;
      cmd = cmd.cmd;
    } else {
      this.member = message.member;
      this.id = '';
    }
    if (!this.id || this.id.length < 3) {
      this.id = '';
      for (let i = 0; i < 3; i++) {
        this.id += idChars.charAt(Math.floor(Math.random() * idChars.length));
      }
    }
    this.cmd = cmd;
    this.channel = channel;
    this.channelId = typeof channel === 'object' ? channel.id : channel;
    this.message = message;
    this.messageId = typeof message === 'object' ? message.id : message;
    this.time = time;
    this.repeatDelay = repeatDelay;
    this.memberId =
        typeof this.member === 'object' ? this.member.id : this.member;

    this.bot = self.client.user.id;
    this.complete = false;

    /**
     * Update channel and message with their associated IDs.
     *
     * @private
     */
    function getReferences() {
      if (typeof myself.channel !== 'object') {
        myself.channel = self.client.channels.get(myself.channelId);
      }
      if (typeof myself.channel !== 'object') {
        self.debug(
            'Cancelling command due to channel not existing: ' +
            myself.channelId + '@' + myself.memberId + ': ' + myself.cmd);
        myself.cancel();
        return;
      }
      if (typeof myself.message !== 'object') {
        myself.message = myself.channel.messages.get(myself.messageId);
        if (!myself.message) {
          myself.channel.messages.fetch(myself.messageId)
              .then((msg) => {
                if (!msg) throw new Error();
                myself.message = msg;
                myself.member = msg.member;
                myself.memberId = msg.member.id;
              })
              .catch((err) => {
                self.debug(
                    'Failed to find message: ' + myself.channelId + '@' +
                    myself.memberId + ' ' + myself.messageId + ': ' +
                    myself.cmd);
                myself.message = makeMessage(
                    myself.memberId, myself.channel.guild.id, myself.channel.id,
                    myself.cmd);
                myself.member = myself.message.member;
                myself.memberId = myself.member.id;
              });
        } else {
          myself.member = myself.message.member;
          myself.memberId = myself.message.member.id;
        }
      }
      if (typeof myself.member !== 'object') {
        myself.member = myself.channel.members.get(myself.memberId);
        if (!myself.member) {
          myself.channel.guild.members.fetch(myself.memberId)
              .then((m) => {
                myself.member = m;
              })
              .catch((err) => {
                self.error(
                    'Failed to find member with id: ' + myself.memberId +
                    ' in guild: ' + myself.channel.guild.id);
                console.error(err);
              });
        }
      }
    }

    /**
     * Trigger the command to be run immediately. Automatically fired at the
     * scheduled time. Does not cancel the normally scheduled command.
     * Re-schedules the command if the command should repeat.
     *
     * @public
     */
    this.go = function() {
      if (myself.complete) {
        self.error('Command triggered after being completed!', myself.id);
        self.client.clearTimeout(myself.timeout);
        return;
      }
      const now = Date.now();
      getReferences();
      if (!myself.channel || !myself.channel.send) {
        self.error(
            'ScheduledCmdFailed No Channel: ' + myself.channel.id +
            '@' + myself.memberId + ' ' + myself.cmd);
        myself.complete = true;
        self.client.clearTimeout(myself.timeout);
        return;
      } else if (!myself.message) {
        self.error(
            'ScheduledCmdFailed No Message: ' + myself.channel.guild.id + '#' +
            myself.channel.id + '@' + myself.memberId + ' ' + myself.cmd);
        return;
      } else if (!myself.message.channel || !myself.message.channel.send) {
        self.warn(
            'ScheduledCmdWarning No Message Channel: ' +
            myself.channel.guild.id + '#' + myself.channel.id + '@' +
            myself.memberId + ' ' + myself.cmd);
        myself.message.channel = myself.channel;
      }
      if (!myself.message.guild.members ||
          typeof myself.message.guild.members.get !== 'function') {
        self.error(
            'ScheduledCmdFailed No Members Channel: ' +
            myself.channel.guild.id + '#' + myself.channel.id + '@' +
            myself.memberId + ' ' + myself.cmd);
        return;
      }
      myself.message.content = myself.cmd;
      myself.message.fabricated = true;
      self.debug(
          'ScheduledCmd: ' + myself.message.channel.id + '@' +
          myself.message.author.id + ' ' + myself.message.content);
      try {
        self.command.trigger(myself.message);
      } catch (err) {
        self.error(
            'Failed to trigger ScheduledCmd: ' + myself.message.channel.id +
            '@' + myself.message.author.id + ' ' + myself.message.content);
        console.error(err);
      }
      // If the command was fired at the scheduled time, or if it was fired
      // manually and the the scheduled time is in less than a second, then
      // consider the scheduled command to have been completed.
      if (myself.time - 1000 <= now) {
        self.client.clearTimeout(myself.timeout);
        if (myself.repeatDelay > 0) {
          myself.complete = false;
          myself.time += myself.repeatDelay;
          sortGuildCommands(myself.message.guild.id);
          myself.setTimeout();
        } else {
          myself.complete = true;
        }
      }
    };

    /**
     * Cancel this command and remove Timeout.
     *
     * @public
     */
    this.cancel = function() {
      self.client.clearTimeout(myself.timeout);
      myself.complete = true;
    };

    /**
     * Schedule the Timeout event to call the command at the scheduled time. If
     * the scheduled time to run the command is more than 2 weeks in the future,
     * the command is not scheduled, and this function must be called manually
     * (less than 2 weeks) before the scheduled time for the command to run.
     *
     * @public
     */
    this.setTimeout = function() {
      if (myself.complete) {
        return;  // Command was completed, and should no longer run.
      }
      if (myself.time - Date.now() <= maxTimeout) {
        self.client.clearTimeout(myself.timeout);
        try {
          myself.timeout =
              self.client.setTimeout(myself.go, myself.time - Date.now());
        } catch (err) {
          self.error(
              'ScheduledCmd Failed: ' + myself.channelId + '@' +
              myself.memberId + ' ' + myself.cmd);
          return;
        }
        self.debug(
            'ScheduledCmd Scheduled: ' + myself.channelId + '@' +
            myself.memberId + ' ' + myself.cmd);
      }
    };

    /**
     * Export the relevant data to recreate this object, as a JSON object.
     *
     * @public
     * @returns {Object} JSON formatted object.
     */
    this.toJSON = function() {
      return {
        bot: self.client.user.id,
        cmd: myself.cmd,
        time: myself.time,
        repeatDelay: myself.repeatDelay,
        id: myself.id,
        channel: myself.channelId,
        message: myself.messageId,
        member: myself.memberId,
      };
    };

    getReferences();
    this.setTimeout();
  }
  this.ScheduledCommand = ScheduledCommand;

  /**
   * Register a created {@link CmdScheduling.ScheduledCommand}.
   *
   * @private
   * @fires CmdScheduling#commandRegistered
   *
   * @param {CmdScheduling.ScheduledCommand} sCmd The ScheduledCommand object to
   * register.
   */
  function registerScheduledCommand(sCmd) {
    const gId = sCmd.message.guild.id;
    if (!schedules[gId]) {
      schedules[gId] = [sCmd];
    } else {
      let inserted = false;
      for (let i = 0; i < schedules[gId].length; i++) {
        if (sCmd.time < schedules[gId][i].time) {
          schedules[gId].splice(i, 0, sCmd);
          inserted = true;
          break;
        }
      }
      if (!inserted) schedules[gId].push(sCmd);
    }
    fireEvent('commandRegistered', sCmd, sCmd.message.guild.id);
  }
  /**
   * Register a created {@link CmdScheduling.ScheduledCommand}.
   * @public
   * @see {@link CmdScheduling~registerScheduledCommand}
   */
  this.registerScheduledCommand = registerScheduledCommand;

  /**
   * Allow user to schedule command to be run, or view currently scheduled
   * commands.
   *
   * @private
   * @type {commandHandler}
   * @param {Discord~Message} msg Message that triggered command.
   * @listens Command#schedule
   */
  function commandSchedule(msg) {
    if (!msg.text || !msg.text.trim()) {
      replyWithSchedule(msg);
      return;
    } else if (msg.text.match(/(cancel|remove|delete)/)) {
      cancelAndReply(msg);
      return;
    }

    const splitCmd = msg.text.trim().split(msg.prefix);
    if (!splitCmd || splitCmd.length < 2 || splitCmd[0].trim().length == 0) {
      self.common.reply(
          msg,
          'Oops! Please ensure you have formatted that correctly.\nI wasn\'t' +
              ' able to understand it properly.');
      return;
    }

    let delay = splitCmd.splice(0, 1)[0];
    const cmd = msg.prefix + splitCmd.join(msg.prefix);
    let repeat = 0;

    const invalid = self.command.validate(cmd.split(/\s/)[0], msg);
    if (invalid) {
      self.common.reply(
          msg, 'That command doesn\'t seem to be a usable command.\n' + cmd,
          invalid);
      return;
    }

    if (delay.match(/every|repeat/)) {
      const splitTimes = delay.match(/^(.*?)(every|repeat)(.*)$/);
      delay = splitTimes[1];
      repeat = splitTimes[3];
    }

    delay = stringToMilliseconds(delay);

    /* if (delay < self.minDelay) {
      self.common.reply(msg, 'Sorry, but delays must be more than 10 seconds.');
      return;
    } */

    repeat = stringToMilliseconds(repeat);

    if (repeat && repeat < self.minRepeatDelay) {
      self.common.reply(
          msg, 'Sorry, but repeat delays must be more than 30 seconds.');
      return;
    }

    const newCmd =
        new ScheduledCommand(cmd, msg.channel, msg, delay + Date.now(), repeat);

    registerScheduledCommand(newCmd);

    const embed = new self.Discord.MessageEmbed();
    embed.setTitle('Created Scheduled Command (' + newCmd.id + ')');
    embed.setColor(embedColor);
    let desc = 'Runs in ' + formatDelay(delay);
    if (repeat) {
      desc += '\nRepeats every ' + formatDelay(repeat);
    }
    embed.setDescription(desc);
    embed.addField(
        'To cancel:', `\`${msg.prefix}sch cancel ${newCmd.id}\``, true);
    embed.setFooter(cmd);

    msg.channel.send(self.common.mention(msg), embed);
  }

  /**
   * Sort all scheduled commands in a guild by the next time they will run.
   *
   * @private
   * @param {string|number} id The guild id of which to sort the commands.
   */
  function sortGuildCommands(id) {
    const c = schedules[id];
    if (!c) return;

    let unsorted = true;
    while (unsorted) {
      unsorted = false;
      let spliced;
      for (let i = 1; i < c.length; i++) {
        if (!spliced && c[i - 1].time > c[0].time) {
          spliced = c.splice(i - 1, 1)[0];
          if (c[c.length - 1].time < spliced.time) {
            c.push(spliced);
            spliced = null;
            i--;
          }
        } else if (spliced && c[i].time < spliced.time) {
          c.splice(i + 1, 0, spliced);
          unsorted = true;
          break;
        }
      }
    }
  }

  /**
   * Given a user-inputted string, convert to a number of milliseconds. Input
   * can be on most common time units up to a week.
   *
   * @private
   *
   * @param {string} str The input string to parse.
   * @returns {number} Number of milliseconds parsed from string.
   */
  function stringToMilliseconds(str) {
    let sum = 0;
    str = (str + '')
        .replace(/\b(and|repeat|every|after)\b/g, '')
        .trim()
        .toLowerCase();

    const reg = /([0-9.]+)([^a-z]*)([a-z]*)/g;
    let res;
    while ((res = reg.exec(str)) !== null) {
      sum += numberToUnit(res[1], res[3]);
    }
    if (!sum && str) {
      sum = numberToUnit(1, str);
    }
    /**
     * Convert a number and a unit to the corresponding number of milliseconds.
     *
     * @private
     * @param {number} num The number associated with the unit.
     * @param {string} unit The current unit associated with the num.
     * @returns {number} The given number in milliseconds.
     */
    function numberToUnit(num, unit) {
      switch (unit) {
        case 's':
        case 'sec':
        case 'second':
        case 'seconds':
          return num * 1000;
        case 'm':
        case 'min':
        case 'minute':
        case 'minutes':
          return num * 60 * 1000;
        case 'h':
        case 'hr':
        case 'hour':
        case 'hours':
          return num * 60 * 60 * 1000;
        case 'd':
        case 'dy':
        case 'day':
        case 'days':
          return num * 24 * 60 * 60 * 1000;
        case 'w':
        case 'wk':
        case 'week':
        case 'weeks':
          return num * 7 * 24 * 60 * 60 * 1000;
        default:
          return 0;
      }
    }
    return sum;
  }

  /**
   * Returns an array of references to scheduled commands in a guild.
   *
   * @public
   *
   * @param {string|number} gId The guild id of which to get the commands.
   * @returns {null|CmdScheduling.ScheduledCommand[]} Null if none, or the array
   * of ScheduledCommands.
   */
  function getScheduledCommandsInGuild(gId) {
    let list = schedules[gId];
    if (!list) return null;
    list = list.filter((el) => !el.complete);
    if (!list || list.length == 0) return null;
    return list;
  }
  this.getScheduledCommandsInGuild = getScheduledCommandsInGuild;


  /**
   * Find all scheduled commands for a certain guild, and reply to the message
   * with the list of commands.
   *
   * @private
   * @param {Discord~Message} msg The message to reply to.
   */
  function replyWithSchedule(msg) {
    const embed = new self.Discord.MessageEmbed();
    embed.setTitle('Scheduled Commands');
    embed.setColor(embedColor);
    let list = getScheduledCommandsInGuild(msg.guild.id);
    if (!list) {
      embed.setDescription('No commands are scheduled.');
    } else {
      const n = Date.now();
      list = list.map((el) => {
        return '**' + el.id + '**: In ' + formatDelay(el.time - n) +
            (el.repeatDelay ?
                 (', repeats every ' + formatDelay(el.repeatDelay)) :
                 '') +
            (el.message && ' by <@' + el.message.author.id + '>: ') + el.cmd;
      });
      embed.setDescription(list.join('\n'));
    }
    if (msg.author.id == self.common.spikeyId) {
      const keys = Object.keys(schedules);
      let total = 0;
      keys.forEach((k) => {
        total += Object.keys(schedules[k]).length;
      });
      embed.setFooter(total);
    }
    msg.channel.send(self.common.mention(msg), embed).catch((err) => {
      self.error('Failed to send reply in channel: ' + msg.channel.id);
      console.error(err);
    });
  }

  /**
   * Cancel a scheduled command in a guild.
   *
   * @private
   * @fires CmdScheduling#commandCancelled
   *
   * @param {string|number} gId The guild id of which to cancel the command.
   * @param {string|number} cmdId The ID of the command to cancel.
   * @returns {?CmdScheduling.ScheduledCommand} Null if failed, or object that
   * was cancelled.
   */
  function cancelCmd(gId, cmdId) {
    const list = schedules[gId];
    if (!list || list.length == 0) return null;
    if (!cmdId) return null;
    cmdId = (cmdId + '').toUpperCase();
    for (let i = 0; i < list.length; i++) {
      if (list[i].complete) continue;
      if (list[i].id == cmdId) {
        const removed = list.splice(i, 1)[0];
        removed.cancel();
        fireEvent('commandCancelled', removed.id, removed.message.guild.id);
        return removed;
      }
    }
    return null;
  }
  /**
   * Cancel a scheduled command in a guild.
   * @public
   * @see {@link CmdScheduling~cancelCmd}
   */
  this.cancelCmd = cancelCmd;

  /**
   * Find a scheduled command with the given ID, and remove it from commands to
   * run.
   *
   * @private
   * @param {Discord~Message} msg The message to reply to.
   */
  function cancelAndReply(msg) {
    const embed = new self.Discord.MessageEmbed();
    embed.setColor(embedColor);
    const list = schedules[msg.guild.id];
    if (!list || list.length == 0) {
      embed.setTitle('Cancelling Failed');
      embed.setDescription('There are no scheduled commands in this guild.');
    } else {
      let idSearch = msg.text.match(/(cancel|remove|delete)\W+(\w{3,})\b/);
      if (!idSearch) {
        embed.setTitle('Cancelling Failed');
        embed.setDescription('Please specify a scheduled command ID.');
      } else {
        idSearch = idSearch[2];
        const removed = cancelCmd(msg.guild.id, idSearch);
        if (!removed) {
          embed.setTitle('Cancelling Failed');
          embed.setDescription(
              'Unable to find scheduled command with ID: ' + idSearch);
        } else {
          embed.setTitle('Cancelling Succeeded');
          embed.setDescription(
              'Removed scheduled command ID: ' + idSearch + ', ' + removed.cmd);
        }
      }
    }

    msg.channel.send(self.common.mention(msg), embed).catch((err) => {
      self.error('Failed to send reply in channel: ' + msg.channel.id);
      console.error(err);
    });
  }

  /**
   * Reschedule all future commands that are beyond maxTimeout.
   */
  function reScheduleCommands() {
    for (const g in schedules) {
      if (!schedules[g] || !schedules[g].length) continue;
      for (let i = 0; i < schedules[g].length; i++) {
        schedules[g][i].setTimeout();
      }
    }
  }

  /**
   * Format a duration in milliseconds into a human readable string.
   *
   * @private
   *
   * @param {number} msecs Duration in milliseconds.
   * @returns {string} Formatted string.
   */
  function formatDelay(msecs) {
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

  /**
   * Register an event handler for the given name with the given handler.
   *
   * @public
   * @param {string} name The event name to listen for.
   * @param {Function} handler The function to call when the event is fired.
   */
  this.on = function(name, handler) {
    if (typeof handler !== 'function') {
      throw (new Error('Handler must be a function.'));
    }
    if (!listeners[name]) listeners[name] = [];
    listeners[name].push(handler);
  };

  /**
   * Remove an event handler for the given name.
   *
   * @public
   * @param {string} name The event name to remove the handler for.
   * @param {Function} [handler] THe specific handler to remove, or null for
   * all.
   */
  this.removeListener = function(name, handler) {
    if (!listeners[name]) return;
    if (!handler) {
      delete listeners[name];
    } else {
      for (let i = 0; i < listeners[name].length; i++) {
        if (listeners[name][i] == handler) {
          listeners[name].splice(i, 1);
        }
      }
      if (listeners[name].length == 0) delete listeners[name];
    }
  };

  /**
   * Fires a given event with the associacted data.
   *
   * @private
   * @param {string} name The name of the event to fire.
   * @param {*} ...data The arguments to pass into the function calls.
   */
  function fireEvent(name, ...data) {
    if (!listeners[name]) return;
    for (let i = 0; i < listeners[name].length; i++) {
      try {
        listeners[name][i].apply(this, data);
      } catch (err) {
        self.error('Error in firing event: ' + name);
        console.error(err);
      }
    }
  }
  /**
   * Forms a Discord~Message similar object from given IDs.
   *
   * @private
   * @param {string} uId The id of the user who wrote this message.
   * @param {string} gId The id of the guild this message is in.
   * @param {string} cId The id of the channel this message was 'sent' in.
   * @param {string} msg The message content.
   * @returns {
   *   {
   *     fabricated: boolean,
   *     author: Discord~User,
   *     member: Discord~GuildMember,
   *     guild: Discord~Guild,
   *     channel: Discord~GuildChannel,
   *     text: string,
   *     content: string,
   *     prefix: string
   *   }
   * } The created message-like object.
   */
  function makeMessage(uId, gId, cId, msg) {
    if (!cId) return null;
    const g = self.client.guilds.get(gId);
    if (!g) return null;
    const message = {};
    message.fabricated = true;
    message.member = g.members.get(uId);
    message.author = g.members.get(uId).user;
    message.guild = g;
    message.channel = self.client.channels.get(cId);
    message.text = msg;
    message.content = msg;
    message.prefix = self.bot.getPrefix(gId);
    return message;
  }
}
module.exports = new CmdScheduling();
