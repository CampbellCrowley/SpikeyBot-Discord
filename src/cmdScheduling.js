// Copyright 2018-2020 Campbell Crowley. All rights reserved.
// Author: Campbell Crowley (dev@campbellcrowley.com)
const fs = require('fs');
const MessageMaker = require('./lib/MessageMaker.js');

require('./subModule.js')
    .extend(CmdScheduling);  // Extends the SubModule class.

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
      permissions: self.Discord.PermissionsBitField.Flags.ManageRoles |
          self.Discord.PermissionsBitField.Flags.ManageGuild |
          self.Discord.PermissionsBitField.Flags.BanMembers,
    });
    self.command.on(
        new self.command.SingleCommand(
            ['schedule', 'sch', 'sched', 'scheduled'], commandSchedule,
            adminOnlyOpts));

    const now = Date.now();
    self.client.guilds.cache.forEach((g) => {
      self.common.readFile(
          `${self.common.guildSaveDir}${g.id}${saveSubDir}`, (err, data) => {
            if (err && err.code == 'ENOENT') return;
            if (err) {
              self.warn('Failed to load scheduled command: ' + g.id);
              return;
            }
            try {
              const parsed = JSON.parse(data);
              if (!parsed && parsed.length !== 0) {
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
                registerScheduledCommand(new ScheduledCommand(parsed[i]), g.id);
              }
            } catch (err) {
              self.error('Failed to parse data for guild commands: ' + g.id);
              console.error(err);
            }
          });
    });

    longInterval = setInterval(reScheduleCommands, maxTimeout);
  };
  /**
   * @inheritdoc
   * @fires CmdScheduling#shutdown
   * */
  this.shutdown = function() {
    self.command.deleteEvent('schedule');
    if (longInterval) clearInterval(longInterval);
    for (const i in schedules) {
      if (!schedules[i] || !schedules[i].length) continue;
      schedules[i] = schedules[i].filter((el) => el.cancel(false) && false);
    }
    fireEvent('shutdown');
    listeners = {};
  };
  /**
   * @override
   * @inheritdoc
   */
  this.save = function(opt) {
    self.client.guilds.cache.forEach((g) => {
      if (!schedulesUpdated[g.id]) return;
      delete schedulesUpdated[g.id];
      if (!schedules[g.id]) schedules[g.id] = [];
      schedules[g.id] = schedules[g.id].filter((el) => !el.complete);
      const data = schedules[g.id].map((el) => el.toJSON());
      writeSaveData(g.id, data, opt);
    });
  };

  /**
   * Write save data for a guild.
   *
   * @private
   *
   * @param {string|number} i The guild ID.
   * @param {object} data The data to write.
   * @param {string} [opt='sync'] See {@link save}.
   */
  function writeSaveData(i, data, opt) {
    const dir = `${self.common.guildSaveDir}${i}`;
    const filename = `${dir}${saveSubDir}`;
    if (opt === 'async') {
      self.common.readAndParse(filename, (err, parsed) => {
        if (!err && parsed && parsed.length > 0) {
          data =
              parsed.filter((el) => el.bot != self.client.user.id).concat(data);
        }
        const finalData = JSON.stringify(data);
        self.common.mkAndWrite(filename, dir, finalData, (err) => {
          if (err) {
            self.error('Failed to write file: ' + filename);
            console.error(err);
          }
        });
      });
    } else {
      try {
        const rec = fs.readFileSync(filename);
        const parsed = JSON.parse(rec);
        if (parsed && parsed.length > 0) {
          data =
              parsed.filter((el) => el.bot != self.client.user.id).concat(data);
        }
      } catch (err) {
        // No data exists.
      }
      self.common.mkAndWriteSync(filename, dir, JSON.stringify(data));
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
   * @type {object.<Array.<Function>>}
   */
  let listeners = {};

  /**
   * @description All of the guilds that have updated their schedules since last
   * save.
   * @private
   * @type {object.<boolean>}
   * @default
   */
  const schedulesUpdated = {};
  /**
   * All of the currently loaded commands to run. Mapped by Guild ID, then
   * sorted arrays by time to run next command.
   *
   * @private
   * @type {object.<Array.<CmdScheduling.ScheduledCommand>>}
   */
  const schedules = {};

  /**
   * @classdesc Stores information about a specific command that is scheduled.
   * @class
   *
   * @public
   * @param {string|object} cmd The command to run, or an object instance of
   * this class (exported using toJSON, then parsed into an object).
   * @param {string|number|Discord~TextChannel} channel The channel or channel
   * id of where to run the command.
   * @param {string|number|Discord~Message} message The message or message id
   * that created this scheduled command.
   * @param {number} time The unix timestamp at which to run the command.
   * @param {?number} repeatDelay The delay in milliseconds at which to run the
   * command again, or null if it does not repeat.
   *
   * @property {string} cmd The command to run.
   * @property {number|string} bot The id of the bot instantiating this command.
   * @property {Discord~TextChannel} channel The channel or channel id of where
   * to run the command.
   * @property {string|number} channelId The id of the channel where the message
   * was sent.
   * @property {?Discord~Message} message The message that created this
   * scheduled command, or null if the message was deleted.
   * @property {string|number} messageId The id of the message sent.
   * @property {number} time The unix timestamp at which to run the command.
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

    let runAfterRefs = false;
    let isFetching = false;

    /**
     * Update channel and message with their associated IDs.
     *
     * @private
     */
    function getReferences() {
      if (!myself.channel || typeof myself.channel !== 'object') {
        myself.channel = self.client.channels.resolve(myself.channelId);
      }
      if (!myself.channel || typeof myself.channel !== 'object' ||
          myself.channel.deleted) {
        self.debug(
            'Cancelling command due to channel not existing: ' +
            myself.channelId + '@' + myself.memberId + ': ' + myself.cmd);
        myself.cancel();
        return;
      }
      if (!myself.message || typeof myself.message !== 'object') {
        myself.message = myself.channel.messages.resolve(myself.messageId);
        if (!myself.message && !isFetching) {
          isFetching = true;
          myself.channel.messages.fetch(myself.messageId)
              .then((msg) => {
                if (!msg) throw new Error();
                myself.message = msg;
                myself.member = msg.member;
                myself.memberId = msg.member.id;
                if (runAfterRefs) myself.go();
              })
              .catch(() => {
                self.debug(
                    'Failed to find message: ' + myself.channelId + '@' +
                    myself.memberId + ' ' + myself.messageId + ': ' +
                    myself.cmd);
                myself.message = makeMessage(
                    myself.memberId, myself.channel.guild.id, myself.channel.id,
                    myself.cmd);
                myself.member = myself.message.member;
                myself.memberId = myself.member.id;
                if (runAfterRefs) myself.go();
              });
        } else if (!isFetching) {
          myself.member = myself.message.member;
          myself.memberId = myself.message.member.id;
          if (runAfterRefs) myself.go();
        }
      }
      if (!myself.member || typeof myself.member !== 'object') {
        myself.member = myself.channel.members.get(myself.memberId);
        if (!myself.member && !isFetching) {
          isFetching = true;
          myself.channel.guild.members.fetch(myself.memberId)
              .then((m) => myself.member = m)
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
        clearTimeout(myself.timeout);
        return;
      }
      const now = Date.now();
      runAfterRefs = false;
      getReferences();
      if (!myself.channel || !myself.channel.send) {
        self.error(
            'ScheduledCmdFailed No Channel: ' + myself.channel.id +
            '@' + myself.memberId + ' ' + myself.cmd);
        myself.complete = true;
        clearTimeout(myself.timeout);
        return;
      } else if (!myself.message) {
        self.error(
            'ScheduledCmdWarning No Message: ' + myself.channel.guild.id + '#' +
            myself.channel.id + '@' + myself.memberId + ' ' + myself.cmd);
        runAfterRefs = true;
        return;
      } else if (!myself.message.channel || !myself.message.channel.send) {
        self.warn(
            'ScheduledCmdWarning No Message Channel: ' +
            myself.channel.guild.id + '#' + myself.channel.id + '@' +
            myself.memberId + ' ' + myself.cmd);
        myself.message.channel = myself.channel;
      }
      if (!myself.message.guild.members ||
          typeof myself.message.guild.members.resolve !== 'function') {
        self.error(
            'ScheduledCmdFailed No Members Channel: ' +
            myself.channel.guild.id + '#' + myself.channel.id + '@' +
            myself.memberId + ' ' + myself.cmd);
        return;
      } else if (!myself.message.channel.permissionsFor(self.client.user)
          .has(self.Discord.PermissionsBitField.Flags.SendMessages)) {
        self.error(
            'ScheduledCmdWarning No perm SEND_MESSAGES: ' +
            myself.channel.guild.id + '#' + myself.channel.id + '@' +
            myself.memberId + ' ' + myself.cmd);
        return;
      } else if (!myself.message.channel.permissionsFor(self.client.user)
          .has(self.Discord.PermissionsBitField.Flags.ViewChannel)) {
        self.error(
            'ScheduledCmdWarning No perm VIEW_CHANNEL: ' +
            myself.channel.guild.id + '#' + myself.channel.id + '@' +
            myself.memberId + ' ' + myself.cmd);
        return;
      }
      myself.message.content = myself.cmd;
      myself.message.fabricated = true;
      myself.message.disableMention = true;
      const cmd = self.command.find(myself.cmd, myself.message);
      if (!cmd) {
        self.error(
            'Unknown ScheduledCmd: ' + myself.message.channel.id + '@' +
            myself.message.author.id + ' ' + myself.cmd + ' ' +
            myself.message.content);
        return;
      }
      if (cmd.getFullName() === self.command.find('sch').getFullName()) {
        self.error(
            'Recursive ScheduledCmd: ' + myself.message.channel.id + '@' +
            myself.message.author.id + ' ' + myself.message.content);
        return;
      }
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
        clearTimeout(myself.timeout);
        if (myself.repeatDelay > 0) {
          myself.complete = false;
          myself.time += myself.repeatDelay;
          sortGuildCommands(myself.message.guild.id);
          myself.setTimeout();
        } else {
          myself.complete = true;
        }
        schedulesUpdated[myself.message.guild.id] = true;
      }
    };

    /**
     * Cancel this command and remove Timeout.
     *
     * @public
     * @param {boolean} [markComplete=true] Should we mark this command as
     *     completed after cancelling.
     */
    this.cancel = function(markComplete = true) {
      clearTimeout(myself.timeout);
      if (markComplete) myself.complete = true;
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
        clearTimeout(myself.timeout);
        try {
          myself.timeout = setTimeout(myself.go, myself.time - Date.now());
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
     * @returns {object} JSON formatted object.
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
    setTimeout(() => this.setTimeout());
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
   * @param {string} [gId] Guild ID if message has not yet been found, or to
   * override the ID found in the given object.
   * @returns {boolean} True if succeeded, False if too close to existing
   * command.
   */
  function registerScheduledCommand(sCmd, gId) {
    if (!gId) gId = sCmd.message.guild.id;
    if (!schedules[gId]) {
      schedules[gId] = [sCmd];
    } else {
      for (let i = 0; i < schedules[gId].length; i++) {
        if (Math.abs(schedules[gId][i].time - sCmd.time) < 5000) {
          sCmd.cancel();
          return false;
        }
      }
      schedules[gId].push(sCmd);
    }
    if (sCmd.message) {
      schedulesUpdated[gId] = true;
      fireEvent('commandRegistered', sCmd, sCmd.message.guild.id);
    }
    return true;
  }
  /**
   * Register a created {@link CmdScheduling.ScheduledCommand}.
   *
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

    if (self.command.find(splitCmd[0]).getFullName() ===
        self.command.find('sch').getFullName()) {
      self.common.reply(msg, 'Commands may not be recursive.', invalid);
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

    if (!registerScheduledCommand(newCmd)) {
      self.common.reply(
          msg, 'Sorry, but commands must be separated by at least 5 seconds.');
      return;
    }

    const embed = new self.Discord.EmbedBuilder();
    embed.setTitle('Created Scheduled Command (' + newCmd.id + ')');
    embed.setColor(embedColor);
    let desc = 'Runs in ' + formatDelay(delay);
    if (repeat) {
      desc += '\nRepeats every ' + formatDelay(repeat);
    }
    embed.setDescription(desc);
    embed.addFields([
      {name: 'To cancel:', value: `\`${msg.prefix}sch cancel ${newCmd.id}\``},
    ]);
    embed.setFooter({text: cmd});

    msg.channel.send({content: self.common.mention(msg), embeds: [embed]});
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
        .replace(/\b(and|repeat|every|after|in)\b/g, '')
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
    const embed = new self.Discord.EmbedBuilder();
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
      embed.setFooter({text: total});
    }
    msg.channel.send({content: self.common.mention(msg), embeds: [embed]})
        .catch((err) => {
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
    cmdId = `${cmdId}`.toUpperCase();
    for (let i = 0; i < list.length; i++) {
      if (list[i].complete) continue;
      if (list[i].id == cmdId) {
        const removed = list.splice(i, 1)[0];
        removed.cancel();
        schedulesUpdated[gId] = true;
        fireEvent(
            'commandCancelled', removed.id,
            removed.channel && removed.channel.guild.id);
        return removed;
      }
    }
    return null;
  }
  /**
   * Cancel a scheduled command in a guild.
   *
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
    const embed = new self.Discord.EmbedBuilder();
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

    msg.channel.send({content: self.common.mention(msg), embeds: [embed]})
        .catch((err) => {
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
        let abort = false;
        for (let j = 0; j < schedules[g].length; j++) {
          if (i == j) continue;
          if (Math.abs(schedules[g][i].time - schedules[g][j].time) < 5000) {
            abort = true;
            break;
          }
        }
        if (abort) {
          schedules[g][i].cancel();
          schedules[g].splice(i, 1);
          schedulesUpdated[g] = true;
        } else {
          schedules[g][i].setTimeout();
        }
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
   * @description Fires a given event with the associated data.
   *
   * @private
   * @param {string} name The name of the event to fire.
   * @param {*} data The arguments to pass into the function calls.
   */
  function fireEvent(name, ...data) {
    for (let i = 0; listeners[name] && i < listeners[name].length; i++) {
      try {
        listeners[name][i](...data);
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
   * @returns {?MessageMaker} The created message-like object, or null if
   * invalid channel.
   */
  function makeMessage(uId, gId, cId, msg) {
    if (!cId) return null;
    const message = new MessageMaker(self, uId, gId, cId, msg);
    return message.guild ? message : null;
  }
}
module.exports = new CmdScheduling();
