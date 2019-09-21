// Copyright 2018-2019 Campbell Crowley. All rights reserved.
// Author: Campbell Crowley (dev@campbellcrowley.com)
const emojiChecker = require('./lib/twemojiChcker.js');
const childProcess = require('child_process');
const dateFormat = require('dateformat');
const algebra = require('algebra.js');
const mathjs = require('mathjs');
const Jimp = require('jimp');
const fs = require('fs');

require('./subModule.js').extend(Main);  // Extends the SubModule class.

const math = mathjs.create(mathjs.all, {matrix: 'Array'});

/**
 * @classdesc Basic commands and features for the bot.
 * @class
 * @augments SubModule
 * @listens Discord~Client#guildCreate
 * @listens Discord~Client#guildDelete
 * @listens Discord~Client#guildBanAdd
 * @listens Discord~Client#message
 * @listens Command#addMe
 * @listens Command#invite
 * @listens Command#add
 * @listens Command#simplify
 * @listens Command#solve
 * @listens Command#eval
 * @listens Command#evaluate
 * @listens Command#graph
 * @listens Command#derive
 * @listens Command#timer
 * @listens Command#timers
 * @listens Command#remind
 * @listens Command#reminder
 * @listens Command#reminders
 * @listens Command#createDate
 * @listens Command#joinDate
 * @listens Command#server
 * @listens Command#serverInfo
 * @listens Command#pmMe
 * @listens Command#dmMe
 * @listens Command#pmSpikey
 * @listens Command#dmSpikey
 * @listens Command#thotPm
 * @listens Command#pmUser
 * @listens Command#flip
 * @listens Command#coin
 * @listens Command#flipcoin
 * @listens Command#coinflip
 * @listens Command#purge
 * @listens Command#prune
 * @listens Command#fuckYou
 * @listens Command#ban
 * @listens Command#smite
 * @listens Command#profile
 * @listens Command#avatar
 * @listens Command#ping
 * @listens Command#uptime
 * @listens Command#game
 * @listens Command#version
 * @listens Command#roll
 * @listens Command#dice
 * @listens Command#die
 * @listens Command#d
 * @listens Command#toggleMute
 * @listens Command#toggleBanMessages
 * @listens Command#toggleRigged
 * @listens Command#perms
 * @listens Command#stats
 * @listens Command#lookup
 * @listens Command#sendto
 * @listens Command#thanks
 * @listens Command#thx
 * @listens Command#thank
 * @listens Command#thankyou
 * @listens Command#listCommands
 * @listens Command#getPrefix
 * @listens Command#git
 * @listens Command#gettime
 * @listens Command#update
 * @listens Command#bans
 * @listens Command#listbans
 */
function Main() {
  const self = this;
  /** @inheritdoc */
  this.myName = 'Main';

  /**
   * The current bot version parsed from package.json.
   *
   * @private
   * @type {string}
   */
  let version = 'Unknown';
  /**
   * The current commit hash at HEAD.
   *
   * @private
   * @type {string}
   */
  let commit = 'Unknown';
  fs.readFile('package.json', function(err, data) {
    if (err) {
      console.log(err);
      return;
    }
    try {
      version = JSON.parse(data).version;
    } catch (e) {
      console.log(e);
    }
  });
  childProcess.exec('git rev-parse HEAD', (err, stdout) => {
    commit = stdout.toString().trim();
  });

  /*
   * Stores the required permissions for smiting a user. Defined at
   * initialize().
   *
   * @private
   * @type {number}
   */
  let smitePerms;

  /**
   * Array of all timers currently set.
   *
   * @private
   * @type {Main~Timer[]}
   */
  let timers = [];

  /**
   * All guilds that have disabled the auto-smite feature.
   *
   * @private
   * @type {object.<boolean>}
   */
  const disabledAutoSmite = {};

  /**
   * All guilds that have disabled sending messages when someone is banned.
   *
   * @private
   * @type {object.<boolean>}
   */
  const disabledBanMessage = {};

  /**
   * The guilds that have disabled the rigged messages.
   *
   * @private
   * @type {object.<boolean>}
   */
  const disabledRiggedCounter = {};

  /**
   * The guilds with auto-smite enabled, and members who have mentioned
   * "@everyone", and the timestamps of these mentions.
   *
   * @private
   * @type {object.<object.<string>>}
   */
  const mentionAccumulator = {};

  /**
   * Cache storing data about requested user ban information. Mapped by user ID,
   * then array of guild IDs where the user is banned.
   *
   * @private
   * @type {object.<string[]>}
   */
  const banListCache = {};
  /**
   * Data about number of responses expected and completed for a user from all
   * shards.
   *
   * @private
   * @type {object.<{total: number, done: number, callbacks: Function[]}>}
   */
  const banListRequests = {};

  /**
   * Previous ping values and their associated timestamps. Stores up to the
   * previous {@link oldestPing}  worth of pings since a reboot.
   *
   * @private
   * @type {Array.<{time: number, delta: number}>}
   * @default
   */
  let pingHistory = [];
  fs.readFile('./save/pingHistory.json', (err, data) => {
    if (err) return;
    try {
      pingHistory = JSON.parse(data);
    } catch (err) {
      self.error('Failed to parse pingHistory.json');
      console.error(err);
    }
  });

  /**
   * Oldest ping value to store.
   *
   * @private
   * @type {number}
   * @default 24 hours
   */
  const oldestPing = 24 * 60 * 60 * 1000;

  /**
   * The introduction message the bots sends when pmme is used.
   *
   * @private
   * @type {string}
   * @constant
   */
  const introduction = '\nHello! My name is {username}.\nI was created by ' +
      'SpikeyRobot#0971, so if you wish to add any features, feel free to DM ' +
      'him! (Tip: **{prefix}dmspikey** does this)\n\nThe prefix for commands ' +
      'can be changed with `{prefix}changeprefix`.\nIf you\'d like to know ' +
      'what I can do, type **{prefix}help** in a PM to me and I\'ll let you ' +
      'know!\nThe help is also available on my web page: ' +
      'https://www.spikeybot.com/';
  /**
   * The message sent to the channel where the user asked to be DM'd, but we
   * were unable to deliver the DM.
   *
   * @private
   * @type {string}
   * @constant
   */
  const blockedmessage =
      'I couldn\'t send you a message, you probably blocked me :(';
  /**
   * The message with instructions of how to add the bot to a server.
   *
   * @private
   * @type {string}
   * @constant
   */
  const addmessage =
      'Want me on your server or want to join my server?\nMy website has the' +
      ' links for you: <https://www.spikeybot.com>.';
  /**
   * All of the possible messages to show when using the ban command.
   *
   * @private
   * @type {string[]}
   * @constant
   */
  const banMsgs = [
    'It was really nice meeting you!',
    'You\'re a really great person, I\'m sorry I had to do this.',
    'See you soon!',
    'And they were never heard from again...',
    'Poof! Gone like magic!',
    'Does it seem quiet in here? Or is it just me?',
    'And like the trash, they\'re were taken out!',
    'Looks like they made like a tree, and leaf-ed. (sorry)',
    'Oof! Looks like my boot to their behind left a mark!',
    'Between you and me, I didn\'t like them anyways.',
    'Everyone rejoice! The world has been eradicated of one more person that ' +
        'no one liked anyways.',
    'The ban hammer has spoken!',
  ];

  /** @inheritdoc */
  this.helpMessage = 'Loading...';

  /**
   * The object that stores all data to be formatted into the help message.
   *
   * @private
   * @constant
   */
  const helpObject = JSON.parse(fs.readFileSync('./docs/mainHelp.json'));
  /**
   * The object that stores all data to be formatted into the help message for
   * admin commands.
   *
   * @private
   * @constant
   */
  const adminHelpObject = JSON.parse(fs.readFileSync('./docs/adminHelp.json'));

  /** @inheritdoc */
  this.initialize = function() {
    smitePerms = self.Discord.Permissions.FLAGS.CONNECT |
        self.Discord.Permissions.FLAGS.VIEW_CHANNEL;

    const adminOnlyOpts = new self.command.CommandSetting({
      validOnlyInGuild: true,
      defaultDisabled: true,
      permissions: self.Discord.Permissions.FLAGS.MANAGE_ROLES |
          self.Discord.Permissions.FLAGS.MANAGE_GUILD |
          self.Discord.Permissions.FLAGS.BAN_MEMBERS,
    });

    self.command.on(['addme', 'invite'], commandAddMe);
    self.command.on('add', commandAdd);
    self.command.on('simplify', commandSimplify);
    self.command.on('solve', commandSolve);
    self.command.on(['eval', 'evaluate'], commandEvaluate);
    self.command.on('graph', commandGraph);
    self.command.on('derive', commandDerive);
    self.command.on(
        ['timer', 'timers', 'remind', 'reminder', 'reminders'], commandTimer);
    self.command.on('createdate', commandCreateDate);
    self.command.on('joindate', commandJoinDate, true);
    self.command.on(['server', 'serverinfo'], commandServerInfo, true);
    self.command.on(['emoji', 'emote', 'e', 'emojis', 'emotes'], commandEmoji);
    self.command.on(['pmme', 'dmme'], commandPmMe);
    self.command.on(['pmspikey', 'dmspikey'], commandPmSpikey);
    self.command.on('thotpm', commandThotPm);
    self.command.on('pmuser', commandPmUser);
    self.command.on(['flip', 'coin', 'coinflip', 'flipcoin'], commandFlip);
    self.command.on(
        new self.command.SingleCommand(['purge', 'prune'], commandPurge, {
          validOnlyInGuild: true,
          defaultDisabled: true,
          permissions: self.Discord.Permissions.FLAGS.MANAGE_MESSAGES,
        }));
    self.command.on(
        new self.command.SingleCommand(['ban', 'fuckyou'], commandBan, {
          validOnlyInGuild: true,
          defaultDisabled: true,
          permissions: self.Discord.Permissions.FLAGS.BAN_MEMBERS,
        }));
    self.command.on(new self.command.SingleCommand(['smite'], commandSmite, {
      validOnlyInGuild: true,
      defaultDisabled: true,
      permissions: self.Discord.Permissions.FLAGS.MANAGE_ROLES,
    }));
    self.command.on(['profile', 'avatar'], commandAvatar);
    self.command.on('ping', commandPing);
    self.command.on('uptime', commandUptime);
    self.command.on('game', commandGame);
    self.command.on('version', commandVersion);
    self.command.on(['dice', 'die', 'roll', 'd'], commandRollDie);
    self.command.on(
        new self.command.SingleCommand(
            'togglemute', commandToggleMute, adminOnlyOpts));
    self.command.on('perms', commandPerms, true);
    self.command.on('stats', commandStats);
    self.command.on('lookup', commandLookup);
    self.command.on(
        new self.command.SingleCommand(
            'togglebanmessages', commandToggleBanMessages, adminOnlyOpts));
    self.command.on(
        new self.command.SingleCommand(
            'togglerigged', commandToggleRiggedCounter, adminOnlyOpts));
    self.command.on('sendto', commandSendTo);
    self.command.on(['thanks', 'thx', 'thankyou', 'thank'], commandThankYou);
    self.command.on('listcommands', commandListCommands);
    self.command.on('getprefix', commandGetPrefix);
    self.command.on('git', commandGit);
    self.command.on('gettime', commandGetTime);
    self.command.on('update', commandUpdate);
    self.command.on('sweep', commandSweep);
    self.command.on(['bans', 'listbans'], commandListBans);


    self.client.on('debug', onDebug);
    self.client.on('rateLimit', onRateLimit);
    self.client.on('warn', onWarn);
    self.client.on('error', onError);
    self.client.on('guildCreate', onGuildCreate);
    self.client.on('guildDelete', onGuildDelete);
    self.client.on('guildBanAdd', onGuildBanAdd);
    self.client.on('message', onMessage);

    // Catch reasons for exiting in order to save first.
    process.on('exit', sigint);
    process.on('SIGINT', sigint);
    process.on('SIGHUP', sigint);
    process.on('SIGTERM', sigint);
    if (self.client.shard) {
      process.on('message', shardMessage);
    }

    if (!self.client.shard || !self.client.shard.ids ||
        self.client.shard.ids[0] == 0) {
      fs.readdir(self.common.userSaveDir, function(err, items) {
        if (err) return;
        for (let i = 0; i < items.length; i++) {
          const dir = self.common.userSaveDir + items[i] + '/timers/';

          fs.readdir(dir, function(dir) {
            return function(err2, timerItems) {
              if (err2) return;
              for (let j = 0; j < timerItems.length; j++) {
                const filename = dir + timerItems[j];
                fs.readFile(filename, function(filename) {
                  return function(err3, file) {
                    if (err3) return;
                    let parsed;
                    try {
                      parsed = JSON.parse(file);
                    } catch (e) {
                      self.error(
                          'Failed to parse timer file: ' + filename, 'Main');
                      console.error(e);
                      return;
                    }
                    setTimer(parsed);
                    fs.unlink(filename, function(err4) {
                      if (err4) {
                        self.error(
                            'Failed to delete timer save file: ' + filename,
                            'Main');
                        console.error(err4);
                      }
                    });
                  };
                }(filename));
              }
            };
          }(dir));
        }
      });
    }

    self.client.guilds.forEach(function(g) {
      fs.readFile(
          self.common.guildSaveDir + g.id + '/main-config.json',
          function(err, file) {
            if (err) return;
            let parsed;
            try {
              parsed = JSON.parse(file);
            } catch (e) {
              return;
            }
            disabledAutoSmite[g.id] = parsed.disabledAutoSmite || false;
            disabledBanMessage[g.id] = parsed.disabledBanMessage || false;
            disabledRiggedCounter[g.id] = parsed.disabledRiggedCounter || false;
          });
      fs.readFile(
          `${self.common.guildSaveDir}${g.id}/banCache.json`, (err, file) => {
            if (err) return;
            let parsed;
            try {
              parsed = JSON.parse(file);
            } catch (e) {
              return;
            }
            banListCache[g.id] = parsed;
          });
    });

    fs.readFile('./save/rigged-counter.txt', function(err, file) {
      if (err) {
        self.client.riggedCounter = 0;
        console.log(err);
        return;
      }
      const tmp = file * 1;
      if (!isNaN(tmp)) self.client.riggedCounter = tmp;
      else console.log(tmp, 'is not a number');
    });

    // Format help message into rich embed.
    const tmpHelp = new self.Discord.MessageEmbed();
    tmpHelp.setTitle(
        helpObject.title.replaceAll('{prefix}', self.bot.getPrefix()));
    tmpHelp.setURL(self.common.webURL);
    tmpHelp.setDescription(
        helpObject.description.replaceAll('{prefix}', self.bot.getPrefix()));
    helpObject.sections.forEach(function(obj) {
      const titleID = encodeURIComponent(obj.title.replace(/\s/g, '_'));
      const titleURL = `${self.common.webHelp}#${titleID} `;
      tmpHelp.addField(
          obj.title, titleURL + '```js\n' +
              obj.rows
                  .map(function(row) {
                    if (typeof row === 'string') {
                      return self.bot.getPrefix() +
                          row.replaceAll('{prefix}', self.bot.getPrefix());
                    } else if (typeof row === 'object') {
                      return self.bot.getPrefix() +
                          row.command.replaceAll(
                              '{prefix}', self.bot.getPrefix()) +
                          ' // ' +
                          row.description.replaceAll(
                              '{prefix}', self.bot.getPrefix());
                    }
                  })
                  .join('\n') +
              '\n```',
          true);
    });
    tmpHelp.setFooter(
        'Note: If a custom prefix is being used, replace `' +
        self.bot.getPrefix() +
        '` with the custom prefix.\nNote 2: Custom prefixes will not have a ' +
        'space after them.');
    self.helpMessage = tmpHelp;

    // Format admin help message into rich embed.
    const tmpAdminHelp = new self.Discord.MessageEmbed();
    tmpAdminHelp.setTitle(
        adminHelpObject.title.replaceAll('{prefix}', self.bot.getPrefix()));
    tmpAdminHelp.setURL(self.common.webURL);
    tmpAdminHelp.setDescription(
        adminHelpObject.description.replaceAll(
            '{prefix}', self.bot.getPrefix()));
    adminHelpObject.sections.forEach(function(obj) {
      const titleID = encodeURIComponent(obj.title.replace(/\s/g, '_'));
      const titleURL = `${self.common.webHelp}#${titleID} `;
      tmpAdminHelp.addField(
          obj.title, titleURL + '```js\n' +
              obj.rows
                  .map(function(row) {
                    if (typeof row === 'string') {
                      return self.bot.getPrefix() +
                          row.replaceAll('{prefix}', self.bot.getPrefix());
                    } else if (typeof row === 'object') {
                      return self.bot.getPrefix() +
                          row.command.replaceAll(
                              '{prefix}', self.bot.getPrefix()) +
                          ' // ' +
                          row.description.replaceAll(
                              '{prefix}', self.bot.getPrefix());
                    }
                  })
                  .join('\n') +
              '\n```',
          true);
    });
    tmpAdminHelp.setFooter(
        'Note: If a custom prefix is being used, replace `' +
        self.bot.getPrefix() +
        '` with the custom prefix.\nNote 2: Custom prefixes will not have a ' +
        'space after them.');
    self.helpMessage = [self.helpMessage, tmpAdminHelp];

    if (self.client.shard) {
      /* eslint-disable no-unused-vars */
      /**
       * Receive message from another shard telling us to update our "rigged"
       * counter.
       *
       * @private
       * @param {number} newNum The new value to set the counter to.
       */
      self.client.updateRiggedCounter = function(newNum) {
        /* eslint-enable no-unused-vars */
        if (newNum < this.riggedCounter) {
          this.shard.broadcastEval(
              'this.updateRiggedCounter(' + this.riggedCounter + ')');
        } else {
          this.riggedCounter = newNum;
        }
      };
      /* eslint-disable no-unused-vars */
      /**
       * Receive message from another shard asking for our statistics.
       *
       * @see {@link Main~getStats}
       *
       * @private
       * @returns {object} The statistics we collected.
       */
      self.client.getStats = getStats;
      /**
       * Receive message from another shard asking for our permissions in a
       * channel or guild.
       *
       * @see {@link Main~fetchShardPerms}
       *
       * @private
       * @returns {?{0: number, 1: number}} The bitfield numbers, or null if not
       * our guild.
       */
      self.client.fetchPerms = fetchShardPerms;
      /**
       * Receive message from another shard asking for us to lookup an ID.
       *
       * @see {@link Main~lookupId}
       *
       * @private
       * @returns {?string} User-formatted string, or null if unable to find.
       */
      self.client.lookupId = lookupId;
      /**
       * Receive message from another shard asking for us to send a message to a
       * specific channel.
       *
       * @see {@link Main~sendTo}
       *
       * @private
       * @returns {boolean} True if found channel, false otherwise.
       */
      self.client.sendTo = sendTo;
      /**
       * Sweep users from cache to release memory.
       *
       * @see {@link Main~sweepUsers}
       *
       * @public
       */
      self.client.sweepUsers = sweepUsers;
      /**
       * Request this shard broadcast all guilds where a user has been banned.
       *
       * @see {@link Main~broadcastBanList}
       * @see {@link Main~banListResponse}
       * @see {@link Main~commandListBans}
       *
       * @public
       */
      self.client.broadcastBanList = broadcastBanList;
      /**
       * Response from a shard due to {@link Main~broadcastBanList} being
       * called.
       *
       * @see {@link Main~broadcastBanList}
       * @see {@link Main~banListResponse}
       * @see {@link Main~commandListBans}
       *
       * @public
       */
      self.client.banListResponse = banListResponse;
      /* eslint-enable no-unused-vars */
    }
    self.bot.getStats = getAllStats;
  };

  /** @inheritdoc */
  this.shutdown = function() {
    self.command.removeListener('addme');
    self.command.removeListener('add');
    self.command.removeListener('simplify');
    self.command.removeListener('solve');
    self.command.removeListener('eval');
    self.command.removeListener('graph');
    self.command.removeListener('derive');
    self.command.removeListener('timer');
    self.command.removeListener('createdate');
    self.command.removeListener('joindate');
    self.command.removeListener('serverinfo');
    self.command.removeListener('emoji');
    self.command.removeListener('pmme');
    self.command.removeListener('pmspikey');
    self.command.removeListener('thotpm');
    self.command.removeListener('pmuser');
    self.command.removeListener('flip');
    self.command.removeListener('purge');
    self.command.removeListener('fuckyou');
    self.command.removeListener('smite');
    self.command.removeListener('profile');
    self.command.removeListener('ping');
    self.command.removeListener('uptime');
    self.command.removeListener('game');
    self.command.removeListener('version');
    self.command.removeListener('dice');
    self.command.removeListener('togglemute');
    self.command.removeListener('perms');
    self.command.removeListener('stats');
    self.command.removeListener('lookup');
    self.command.removeListener('togglebanmessages');
    self.command.removeListener('togglerigged');
    self.command.removeListener('sendto');
    self.command.removeListener('thanks');
    self.command.removeListener('listcommands');
    self.command.removeListener('getprefix');
    self.command.removeListener('git');
    self.command.removeListener('gettime');
    self.command.removeListener('update');
    self.command.removeListener('sweep');
    self.command.removeListener('bans');

    self.client.removeListener('debug', onDebug);
    self.client.removeListener('rateLimit', onRateLimit);
    self.client.removeListener('warn', onWarn);
    self.client.removeListener('error', onError);
    self.client.removeListener('guildCreate', onGuildCreate);
    self.client.removeListener('guildDelete', onGuildDelete);
    self.client.removeListener('guildBanAdd', onGuildBanAdd);
    self.client.removeListener('message', onMessage);

    process.removeListener('exit', sigint);
    process.removeListener('SIGINT', sigint);
    process.removeListener('SIGHUP', sigint);
    process.removeListener('SIGTERM', sigint);

    timers.forEach((el) => self.client.clearTimeout(el.timeout));
    if (self.client.shard) {
      process.removeListener('message', shardMessage);
      self.client.updateRiggedCounter = null;
      self.client.getStats = null;
      self.client.fetchPerms = null;
      self.client.lookupId = null;
      self.client.sendTo = null;
    }
  };

  /**
   * Save all data to file.
   *
   * @override
   * @inheritdoc
   */
  this.save = function(opt) {
    if (!self.initialized) return;
    timers.forEach((el) => {
      const obj = Object.assign({}, el);
      delete obj.timeout;
      const dir = self.common.userSaveDir + obj.id + '/timers/';
      const filename = dir + obj.time + '.json';
      if (opt == 'async') {
        self.common.mkAndWrite(filename, dir, JSON.stringify(obj));
      } else {
        self.common.mkAndWriteSync(filename, dir, JSON.stringify(obj));
      }
    });
    self.client.guilds.forEach(function(g) {
      const dir = self.common.guildSaveDir + g.id;
      const filename = dir + '/main-config.json';
      const obj = {
        disabledAutoSmite: disabledAutoSmite[g.id],
        disabledBanMessage: disabledBanMessage[g.id],
        disabledRiggedCounter: disabledRiggedCounter[g.id],
      };
      if (opt == 'async') {
        self.common.mkAndWrite(filename, dir, JSON.stringify(obj));
      } else {
        self.common.mkAndWriteSync(filename, dir, JSON.stringify(obj));
      }

      const filename2 = dir + '/banCache.json';
      if (opt == 'async') {
        self.common.mkAndWrite(
            filename2, dir, JSON.stringify(banListCache[g.id]));
      } else {
        self.common.mkAndWriteSync(
            filename2, dir, JSON.stringify(banListCache[g.id]));
      }
    });
    if (!self.client.shard || self.client.shard.ids[0] == 0) {
      const dir = './save/';
      const filename = dir + 'rigged-counter.txt';
      if (opt == 'async') {
        self.common.mkAndWrite(filename, dir, self.client.riggedCounter + '');
      } else {
        self.common.mkAndWriteSync(
            filename, dir, self.client.riggedCounter + '');
      }
    }
    if (opt == 'async') {
      self.common.mkAndWrite(
          './save/pingHistory.json', './save/', JSON.stringify(pingHistory));
    } else {
      self.common.mkAndWriteSync(
          './save/pingHistory.json', './save/', JSON.stringify(pingHistory));
    }
  };

  /**
   * A general debug message was produced.
   *
   * @private
   * @param {string} info The information.
   * @listens external:Discord~Client#debug
   */
  function onDebug(info) {
    const hbRegex = new RegExp(
        '^(\\[ws\\] \\[connection\\] Heartbeat acknowledged|' +
        '\\[connection\\] \\[shard \\d\\] Sending a heartbeat|' +
        '\\[connection\\] \\[shard \\d\\] Heartbeat acknowledged, latency of|' +
        '\\[Shard \\d+\\] Sending a heartbeat|' +
        '\\[Shard \\d+\\] Heartbeat acknowledged, latency of|' +
        '\\[ws\\] \\[connection\\] Sending a heartbeat|' +
        '\\[WS => Shard \\d+\\] Sending a heartbeat|' +
        '\\[WS => Shard \\d+\\] Heartbeat acknowledged|' +
        '\\[WS => Manager\\] There are \\d+ unavailable guilds.|' +
        '\\[VOICE)');
    if (info.match(hbRegex)) {
      pingHistory.push({time: Date.now(), delta: self.client.ws.ping});
      while (pingHistory[0] && Date.now() - pingHistory[0].time > oldestPing) {
        pingHistory.splice(0, 1);
      }
      return;
    }
    self.common.logDebug('Discord Debug: ' + info);
  }

  /**
   * A rate limit message was produced.
   *
   * @private
   * @param {object} info The information.
   * @listens external:Discord~Client#rateLimit
   */
  function onRateLimit(info) {
    info;
    // self.common.logDebug('Discord Rate Limit: ' + JSON.stringify(info));
  }

  /**
   * A general warning was produced.
   *
   * @private
   * @param {string} info The information.
   * @listens Discord~Client#warn
   */
  function onWarn(info) {
    self.common.logWarning('Discord Warning: ' + info);
  }

  /**
   * An error occurred with our websocket connection to Discord.
   *
   * @private
   * @param {Discord~Error} err The websocket error object.
   * @listens Discord~Client#error
   */
  function onError(err) {
    self.common.error('Websocket encountered an error!');
    console.error(err);
  }

  /**
   * Handle being added to a guild.
   *
   * @private
   * @param {Discord~Guild} guild The guild that we just joined.
   * @listens Discord~Client#guildCreate
   */
  function onGuildCreate(guild) {
    self.log('ADDED TO NEW GUILD: ' + guild.id + ': ' + guild.name);
    if (guild.memberCount > 100) return;
    let channel = null;
    let pos = -1;
    try {
      guild.channels.forEach((val) => {
        if (val.type == 'text') {
          const perms = val.permissionsFor(self.client.user);
          if ((pos == -1 || val.position < pos) && perms &&
              perms.has(self.Discord.Permissions.FLAGS.SEND_MESSAGES)) {
            pos = val.position;
            channel = val;
          }
        }
      });
      if (!channel || pos < 0) {
        self.error(
            'Unable to send welcome message in new guild due to no ' +
            'available channel: ' + guild.id);
        return;
      }
      channel.send(
          introduction.replaceAll('{prefix}', self.bot.getPrefix(guild))
              .replaceAll('{username}', self.client.user.username));
    } catch (err) {
      self.error('Failed to send welcome to guild:' + guild.id);
      console.log(err);
    }
  }
  /**
   * Handle being removed from a guild.
   *
   * @private
   * @param {Discord~Guild} guild The guild that we just left.
   * @listens Discord~Client#guildDelete
   */
  function onGuildDelete(guild) {
    self.log('REMOVED FROM GUILD: ' + guild.id + ': ' + guild.name);
  }

  /**
   * Handle user banned on a guild.
   *
   * @private
   * @param {Discord~Guild} guild The guild on which the ban happened.
   * @param {Discord~User} user The user that was banned.
   * @listens Discord~Client#guildBanAdd
   */
  function onGuildBanAdd(guild, user) {
    if (user.id == self.client.user.id) return;
    if (disabledBanMessage[guild.id]) return;
    if (!guild.me.hasPermission(
        self.Discord.Permissions.FLAGS.VIEW_AUDIT_LOG)) {
      return;
    }
    const modLog = self.bot.getSubmodule('./modLog.js');
    if (!modLog) return;
    guild.fetchAuditLogs({limit: 1})
        .then((logs) => {
          const executor = logs.entries.first().executor;
          if (executor.id !== self.client.user.id) {
            modLog.output(
                guild, 'ban', user, executor, '`Poof! ' + executor.username +
                    ' has ensured ' + user.username +
                    ' will never be seen again...');
          }
        })
        .catch((err) => {
          modLog.output(
              guild, 'ban', user, null,
              '`Poof! ' + user.username + ' was never seen again...`');
          self.error('Failed to find executor of ban.');
          console.log(err);
        });
  }

  /**
   * Toggles auto-muting a user for using @everyone too much.
   *
   * @private
   * @type {commandHandler}
   * @param {Discord~Message} msg Message that triggered command.
   * @listens Command#toggleMute
   */
  function commandToggleMute(msg) {
    if (disabledAutoSmite[msg.guild.id]) {
      disabledAutoSmite[msg.guild.id] = false;
      self.common.reply(
          msg, 'Enabled banning mentioning everyone automatically.');
    } else {
      disabledAutoSmite[msg.guild.id] = true;
      self.common.reply(
          msg, 'Disabled banning mentioning everyone automatically.');
    }
  }
  /**
   * Toggles sending a message when a user is banned from a guild.
   *
   * @private
   * @type {commandHandler}
   * @param {Discord~Message} msg Message that triggered command.
   * @listens Command#toggleBanMessages
   */
  function commandToggleBanMessages(msg) {
    if (disabledBanMessage[msg.guild.id]) {
      disabledBanMessage[msg.guild.id] = false;
      self.common.reply(
          msg, 'Enabled showing a message when a user is banned.');
    } else {
      disabledBanMessage[msg.guild.id] = true;
      self.common.reply(
          msg, 'Disabled showing a message when a user is banned.');
    }
  }

  /**
   * Toggles sending a message when a user says 'rigged'.
   *
   * @private
   * @type {commandHandler}
   * @param {Discord~Message} msg Message that triggered command.
   * @listens Command#toggleRigged
   */
  function commandToggleRiggedCounter(msg) {
    if (disabledRiggedCounter[msg.guild.id]) {
      disabledRiggedCounter[msg.guild.id] = false;
      self.common.reply(msg, 'Enabled showing rigged counter.');
    } else {
      disabledRiggedCounter[msg.guild.id] = true;
      self.common.reply(msg, 'Disabled showing rigged counter.');
    }
  }
  /**
   * Handle receiving a message for use on auto-muting users who spam @everyone.
   *
   * @private
   * @param {Discord~Message} msg The message that was sent.
   * @listens Discord~Client#message
   */
  function onMessage(msg) {
    if (!msg.guild) return;
    if (msg.author.bot || msg.author.id == self.client.user.id) return;
    if (msg.author.id != self.common.spikeyId) {
      let riggedSimilarity = 0;
      const matchedRigged = msg.content.toLowerCase().replace(/\W/g, '').match(
          /r[^i]*i[^g]*g[^g]*g[^e]*e[^d]*d/g);
      if (matchedRigged) {
        // let startCount = self.client.riggedCounter;
        let matchCount = 0;
        for (let i = 0; i < matchedRigged.length; i++) {
          const check = matchedRigged[i].replace(/([\S])\1+/g, '$1');
          riggedSimilarity = checkSimilarity('riged', check);
          const similarityCheck = riggedSimilarity > 0.6667 &&
              riggedSimilarity > checkSimilarity('trigered', check);
          if (similarityCheck) {
            matchCount++;
          }
        }
        if (matchCount > 0) {
          if (msg.content !== 'rigged') {
            self.debug(
                'Rigged count: ' + self.client.riggedCounter + ' + ' +
                matchCount + ': ' + msg.content.replace(/\n/g, '\\n'));
          }
          // Disabled multple because people were spamming it.
          /* if (false && matchCount > 1) {
            msg.channel
                .send(
                    '#' + (startCount + 1) + ' - ' +
                    (self.client.riggedCounter += matchCount))
                .catch(() => {});
          } else { */
          self.client.riggedCounter++;
          if (!disabledRiggedCounter[msg.guild.id]) {
            msg.channel.send('#' + self.client.riggedCounter).catch(() => {});
          }
          // }
          if (self.client.shard) {
            self.client.shard.broadcastEval(
                'this.updateRiggedCounter(' + self.client.riggedCounter + ',' +
                matchCount + ')');
          }
        }
      }
    }

    const word = msg.content.match(/\bi'?m\s+(.*)/i);
    if (word) {
      const dadId = '503720029456695306';
      if (msg.channel.members.get(dadId)) {
        msg.channel
            .awaitMessages(
                (m) => m.author.id === dadId,
                {max: 1, time: 10000, errors: ['time']})
            .then(() => {
              msg.channel.send('Hi Dad, I\'m Spikey!');
            })
            .catch(() => {});
      }
    }

    if (!disabledAutoSmite[msg.guild.id]) {
      if (msg.mentions.everyone) {
        if (!mentionAccumulator[msg.guild.id]) {
          mentionAccumulator[msg.guild.id] = {};
        }
        if (!mentionAccumulator[msg.guild.id][msg.author.id]) {
          mentionAccumulator[msg.guild.id][msg.author.id] = [];
        }
        mentionAccumulator[msg.guild.id][msg.author.id].push(
            msg.createdTimestamp);

        const timestamps = mentionAccumulator[msg.guild.id][msg.author.id];
        let count = 0;
        const now = Date.now();
        for (let i = timestamps.length - 1; i >= 0; i--) {
          if (now - timestamps[i] < 2 * 60 * 1000) {
            count++;
          } else {
            timestamps.splice(i, 1);
          }
        }
        if (count == 3) {
          let hasMuteRole = false;
          let muteRole;
          const toMute = msg.member;
          msg.guild.roles.forEach((val) => {
            if (val.name == 'MentionAbuser') {
              hasMuteRole = true;
              muteRole = val;
            }
          });
          const mute = function(role, member) {
            try {
              member.roles.add(role).then(() => {
                self.common.reply(
                    msg, 'I think you need a break from mentioning everyone.');
              });
              member.guild.channels.forEach(function(channel) {
                if (channel.permissionsLocked) return;
                const overwrites = channel.permissionOverwrites.get(role.id);
                if (overwrites) {
                  if (channel.type == 'category') {
                    if (overwrites.deny.has(
                        self.Discord.Permissions.FLAGS.MENTION_EVERYONE)) {
                      return;
                    }
                  } else if (channel.type == 'text') {
                    if (overwrites.deny.has(
                        self.Discord.Permissions.FLAGS.MENTION_EVERYONE)) {
                      return;
                    }
                  }
                }
                channel.updateOverwrite(role, {MENTION_EVERYONE: false})
                    .catch(console.error);
              });
            } catch (err) {
              self.common.reply(
                  msg, 'Oops! I wasn\'t able to mute ' + member.user.username +
                      '! I\'m not sure why though!');
              console.log(err);
            }
          };
          if (!hasMuteRole) {
            msg.guild.roles
                .create({
                  data: {
                    name: 'MentionAbuser',
                    position: 0,
                    hoist: true,
                    color: '#2f3136',
                    permissions: 0,
                    mentionable: true,
                  },
                })
                .then((role) => {
                  mute(role, toMute);
                })
                .catch(() => {
                  self.common.reply(
                      msg, 'I couldn\'t mute ' + toMute.user.username +
                          ' because there isn\'t a "MentionAbuser" role and ' +
                          'I couldn\'t make it!');
                });
          } else {
            mute(muteRole, toMute);
          }
        } else if (count > 3) {
          msg.channel.send(self.common.mention(msg) + ' Please stop.');
        }
      }
    }
    if (msg.content.match(/^[0-9]*[dD][0-9]+\b/)) {
      msg.prefix = self.bot.getPrefix(msg.guild);
      msg.content = `${msg.prefix}d ${msg.content}`;
      self.command.trigger('d', msg);
    }
  }

  /**
   * @description Returns the percentage of how similar the two given strings
   * are.
   *
   * @private
   * @param {string} s1 First string.
   * @param {string} s2 Second string to compare.
   * @returns {number} Number from 0 to 1 of how similar the two strings are.
   */
  function checkSimilarity(s1, s2) {
    let longer = s1;
    let shorter = s2;
    if (s1.length < s2.length) {
      longer = s2;
      shorter = s1;
    }
    const longerLength = longer.length;
    if (longerLength == 0) {
      return 1.0;
    }
    return (longerLength - editDistance(longer, shorter)) /
        parseFloat(longerLength);
  }
  /**
   * @description Calculates the edit distance between the two strings.
   *
   * @private
   * @param {string} s1 First string.
   * @param {string} s2 Second string to compare to the first.
   * @returns {number} Number of characters distance between the two strings.
   */
  function editDistance(s1, s2) {
    s1 = s1.toLowerCase();
    s2 = s2.toLowerCase();

    const costs = [];
    for (let i = 0; i <= s1.length; i++) {
      let lastValue = i;
      for (let j = 0; j <= s2.length; j++) {
        if (i == 0) {
          costs[j] = j;
        } else {
          if (j > 0) {
            let newValue = costs[j - 1];
            if (s1.charAt(i - 1) != s2.charAt(j - 1)) {
              newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
            }
            costs[j - 1] = lastValue;
            lastValue = newValue;
          }
        }
      }
      if (i > 0) costs[s2.length] = lastValue;
    }
    return costs[s2.length];
  }

  /**
   * Replies to message with URL for inviting the bot to a guild.
   *
   * @private
   * @type {commandHandler}
   * @param {Discord~Message} msg Message that triggered command.
   * @listens Command#addMe
   * @listens Command#invite
   */
  function commandAddMe(msg) {
    self.common.reply(msg, addmessage);
  }

  /**
   * Parses message and adds given numbers.
   *
   * @private
   * @type {commandHandler}
   * @param {Discord~Message} msg Message that triggered command.
   * @listens Command#add
   */
  function commandAdd(msg) {
    const splitstring = msg.text.replaceAll('-', ' -')
        .replaceAll('  ', ' ')
        .replaceAll('\\+', ' ')
        .split(' ');
    if (splitstring.join('').match(/[^0-9-]/g)) {
      self.common.reply(
          msg,
          'This command only adds and subtracts numbers. Use "' + msg.prefix +
              'solve" or "' + msg.prefix + 'simplify" for more complex math.',
          'The following characters are not allowed: ' +
              JSON.stringify(splitstring.join('').match(/[^0-9-]/g).join('')));
      return;
    }
    let number = 0;
    let numNonNumber = 0;
    for (const i in splitstring) {
      if (typeof(splitstring[i] * 1) !== 'number') {
        numNonNumber++;
      } else {
        number += splitstring[i] * 1;
      }
    }
    let ending = '';
    let anotherEnding = '';
    if (numNonNumber > 0) {
      ending = 'But you entered the numbers oddly, so I am not sure if I ' +
          'understood you properly.';
    }
    if (number == 69) {
      anotherEnding = ':wink:';
    } else if (number == 420) {
      anotherEnding = ':four_leaf_clover:';
    } else if (number == 666) {
      anotherEnding = ':smiling_imp:';
    } else if (number == 9001) {
      anotherEnding = ':fire:';
    } else if (number == 80085 || number == 58008) {
      anotherEnding = ':ok_hand:';
    }
    self.common.reply(msg, number + '\n' + ending, anotherEnding);
  }

  /**
   * Simplifies equation given in message.
   *
   * @private
   * @type {commandHandler}
   * @param {Discord~Message} msg Message that triggered command.
   * @listens Command#simplify
   */
  function commandSimplify(msg) {
    try {
      const formula = msg.text;
      const simplified = simplify(formula);
      const hasVar = simplified.match(/[A-Za-z]/);
      self.common.reply(msg, (hasVar ? '0 = ' : '') + simplified);
    } catch (err) {
      self.common.reply(msg, err.message);
    }
  }
  /**
   * Simplifies given formula.
   *
   * @private
   * @param {string} formula The formula to attempt to simplify.
   * @returns {string} Simplified formula.
   */
  function simplify(formula) {
    if (formula.indexOf('=') > -1) {
      const split = formula.split('=');
      formula = split[1] + ' - (' + split[0] + ')';
    }
    const simplified = math.simplify(formula).toString();
    return simplified;
  }

  /**
   * Solve an equation.
   *
   * @private
   * @type {commandHandler}
   * @param {Discord~Message} msg Message that triggered command.
   * @listens Command#solve
   */
  function commandSolve(msg) {
    if (msg.content.lastIndexOf('=') != msg.content.indexOf('=')) {
      self.common.reply(
          msg, 'Please ensure your equation has exactly 1 equals sign.');
      return;
    }
    const equation = msg.text.replace(/÷/g, '/');
    const variables = equation.match(/[A-Za-z]+/gm);
    const equals = equation.match(/=/g);
    if (!variables || variables.length < 1) {
      self.common.reply(
          msg, 'Please ensure you have at least one variable in the equation.',
          'Did you mean to use `' + msg.prefix + 'eval`?');
      return;
    } else if (!equals || equals.length < 1) {
      self.common.reply(
          msg, 'Please ensure your equation has exactly 1 equals sign.');
      return;
    }
    let error = '';
    const messages = [];
    for (let i = 0; i < variables.length; i++) {
      let parsed;
      try {
        parsed = algebra.parse(equation);
      } catch (err) {
        error += 'For ' + variables[i] + ': ' + err.message + '\n';
        continue;
      }
      try {
        messages.push(parsed.solveFor(variables[i]).toString());
      } catch (err) {
        error += 'For ' + variables[i] + ': ' + err.message + '\n';
        continue;
      }
    }
    const outMessage = messages
        .map(function(obj, i) {
          return variables[i] + ' = ' + obj;
        })
        .join('\n');
    self.common.reply(
        msg, outMessage || 'Oops, something didn\'t work!', error);
  }
  /**
   * Evaluate a string as an equation with units.
   *
   * @private
   * @type {commandHandler}
   * @param {Discord~Message} msg Message that triggered command.
   * @listens Command#eval
   * @listens Command#evaluate
   */
  function commandEvaluate(msg) {
    try {
      let formula = msg.text.replace(/÷/g, '/');
      if (formula.indexOf('=') > -1) {
        const split = formula.split('=');
        formula = split[1] + ' - (' + split[0] + ')';
      }
      let simplified = math.evaluate(formula).toString();
      simplified = simplified.replace(/ \* ([A-Za-z])/g, '$1');
      self.common.reply(msg, simplified);
    } catch (err) {
      self.common.reply(msg, err.message);
    }
  }

  /**
   * Graph a given equation by plugging in values for X and creating an image
   * based off values.
   *
   * @private
   * @type {commandHandler}
   * @param {Discord~Message} msg Message that triggered command.
   * @listens Command#graph
   */
  function commandGraph(msg) {
    const graphSize = 200;
    const dotSize = 2;
    let xVal;
    let yVal;
    let ypVal;
    let domainMin;
    let domainMax;
    let rangeMin;
    let rangeMax;
    const cmd = msg.text;
    let expression = cmd.replace(/\[.*\]|\n/gm, '');
    try {
      const expr = math.compile(expression);
      const domainTemp = cmd.match(/\[([^,]*),([^\]]*)\]/m);
      const rangeTemp = cmd.match(/\[[^\]]*\][^[]*\[([^,]*),([^\]]*)\]/m);
      if (domainTemp !== null && domainTemp.length == 3) {
        domainMin = math.evaluate(domainTemp[1]);
        domainMax = math.evaluate(domainTemp[2]);
      } else {
        domainMin = -10;
        domainMax = 10;
      }
      if (rangeTemp !== null && rangeTemp.length == 3) {
        rangeMin = math.evaluate(rangeTemp[1]);
        rangeMax = math.evaluate(rangeTemp[2]);
      }
      xVal = math.range(
          domainMin, domainMax, (domainMax - domainMin) / graphSize / dotSize);
      yVal = xVal.map((x) => expr.evaluate({x: x}));
      try {
        let formula = expression;
        if (formula.indexOf('=') > -1) {
          const split = formula.split('=');
          formula = split[1] + ' - (' + split[0] + ')';
        }
        const exprSlope = math.derivative(formula, 'x');
        ypVal = xVal.map((x) => exprSlope.evaluate({x: x}));
      } catch (err) {
        // console.error(err);
        msg.channel.send('Failed to derive given equation. ' + err.message);
        return;
      }
    } catch (err) {
      self.common.reply(msg, err.message);
      return;
    }
    const finalImage = new Jimp(graphSize, graphSize, 0xFFFFFFFF);
    let minY = 0;
    let maxY = 0;
    if (typeof rangeMin === 'undefined') {
      yVal.forEach((obj) => {
        if (minY > obj) minY = obj;
        if (maxY < obj) maxY = obj;
      });
      minY += minY * 0.05;
      maxY += maxY * 0.05;
    } else {
      minY = rangeMin;
      maxY = rangeMax;
    }
    const zeroY = Math.round(-minY / (maxY - minY) * graphSize);
    const zeroX = Math.round(-domainMin / (domainMax - domainMin) * graphSize);
    finalImage.blit(new Jimp(dotSize, graphSize, 0xDDDDDDFF), zeroX, 0);
    finalImage.blit(
        new Jimp(graphSize, dotSize, 0xDDDDDDFF), 0, graphSize - zeroY);

    let lastSlope;
    const turningPoints = [];
    for (let i = 0; i < xVal.length; i++) {
      const y =
          graphSize - Math.round((yVal[i] - minY) / (maxY - minY) * graphSize);
      if (y >= graphSize || y < 0) continue;
      let myColor = 0x000000FF;
      let mySize = dotSize;
      if ((lastSlope < 0 && ypVal[i] >= 0) ||
          (lastSlope > 0 && ypVal[i] <= 0)) {
        myColor = 0xFF0000FF;
        turningPoints.push({x: xVal[i], y: yVal[i]});
        mySize = dotSize * 2;
      }
      lastSlope = ypVal[i];
      finalImage.blit(
          new Jimp(mySize, mySize, myColor), i / xVal.length * graphSize, y);
    }
    const expMatch = expression.match(/^\s?[yY]\s*=(.*)/);
    if (!expMatch) {
      expression = 'y = ' + simplify(expression);
    } else {
      expression = 'y = ' + simplify(expMatch[1]);
    }
    finalImage.getBuffer(Jimp.MIME_PNG, (err, out) => {
      const embed = new self.Discord.MessageEmbed();
      embed.setTitle('Graph of ' + expression);
      embed.setDescription(
          'Plot Domain: [' + domainMin + ', ' + domainMax + ']\nPlot Range: [' +
          minY + ', ' + maxY + ']');
      embed.attachFiles([new self.Discord.MessageAttachment(out, 'graph.png')]);
      embed.setColor([255, 255, 255]);
      if (turningPoints.length > 0) {
        embed.addField(
            'Approximate Turning Points',
            turningPoints
                .map(function(obj) {
                  return '(' + obj.x + ', ' + obj.y + ')';
                })
                .join('\n'),
            false);
      }
      msg.channel.send(embed);
    });
  }
  /**
   * Take the derivative of a given equation in terms of dy/dx.
   *
   * @private
   * @type {commandHandler}
   * @param {Discord~Message} msg Message that triggered command.
   * @listens Command#derive
   */
  function commandDerive(msg) {
    try {
      let formula = msg.text;
      if (formula.indexOf('=') > -1) {
        const split = formula.split('=');
        formula = split[1] + ' - (' + split[0] + ')';
      }
      let simplified = math.derivative(formula, 'x').toString();
      simplified = simplified.replace(/ \* ([A-Za-z])/g, '$1');
      self.common.reply(msg, simplified);
    } catch (err) {
      self.common.reply(msg, err.message);
    }
  }

  /**
   * Set a timer for a certain about of time. After which, the bot will DM the
   * user the message they specified.
   *
   * @private
   * @type {commandHandler}
   * @param {Discord~Message} msg Message that triggered command.
   * @listens Command#timer
   * @listens Command#timers
   * @listens Command#remind
   * @listens Command#reminder
   * @listens Command#reminders
   */
  function commandTimer(msg) {
    const split = msg.content.split(' ').slice(1);
    if (split.length == 0) {
      let num = 0;
      const messages =
          timers.filter((obj) => obj.id == msg.author.id).map((obj) => {
            num++;
            return 'In ' +
                Math.floor((obj.time - Date.now()) / 1000 / 60 * 10) / 10 +
                ' minutes: ' + obj.message;
          });
      self.common.reply(
          msg, 'You have ' + num + ' timers set.\n' + messages.join('\n'));
      return;
    }
    let time = split.splice(0, 1);
    let unit = (split[0] || '').toLowerCase();
    let skipSplice = false;
    const matchUnit = (time + '').match(/(\d+)([a-zA-Z]+)\b/);
    if (matchUnit) {
      time = matchUnit[1];
      unit = matchUnit[2];
      skipSplice = true;
    }
    switch (unit) {
      case 's':
      case 'sec':
      case 'secs':
      case 'second':
      case 'seconds':
        time /= 60;
        if (!skipSplice) split.splice(0, 1);
        break;
      case 'm':
      case 'min':
      case 'minute':
      case 'minutes':
        break;
      case 'h':
      case 'hr':
      case 'hour':
      case 'hours':
        time *= 60;
        if (!skipSplice) split.splice(0, 1);
        break;
      case 'd':
      case 'day':
      case 'days':
        time *= 60 * 24;
        if (!skipSplice) split.splice(0, 1);
        break;
      case 'w':
      case 'week':
        time *= 60 * 24 * 7;
        if (!skipSplice) split.splice(0, 1);
        break;
      case 'mon':
      case 'month':
      case 'months':
        time *= 60 * 24 * 7 * 30;
        if (!skipSplice) split.splice(0, 1);
        break;
    }
    const origMessage = split.join(' ');
    const message = origMessage ||
        'Your timer for ' + time + ' minute' + (time == '1' ? '' : 's') +
            ' is over!';

    if (time > 0) {
      if (time > 2147483647 / 1000 / 60) {
        time = 2147483647 / 1000 / 60;
      }
      setTimer({
        id: msg.author.id,
        message: message,
        time: Date.now() + time * 1000 * 60,
      });

      self.common.reply(
          msg, 'Set timer for ' + time + ' minutes.', origMessage);
    } else {
      self.common.reply(
          msg, 'Oops! Please make sure your time is larger than 0.');
    }
  }

  /**
   * Tell the user the date when they created their Discord account.
   *
   * @private
   * @type {commandHandler}
   * @param {Discord~Message} msg Message that triggered command.
   * @listens Command#createDate
   */
  function commandCreateDate(msg) {
    const mention = msg.mentions.users.first() ||
        msg.softMentions.users.first() || msg.author;
    const perms = msg.channel.permissionsFor &&
        msg.channel.permissionsFor(self.client.user);
    const time = mention.createdAt;
    if (!perms || perms.has('EMBED_LINKS')) {
      const embed = new self.Discord.MessageEmbed();
      embed.setTitle('Account create date');
      embed.setColor([255, 0, 255]);
      embed.setDescription(`<@${mention.id}>: ${time.toUTCString()}`);
      embed.setTimestamp(time);
      msg.channel.send(`<@${msg.author.id}>`, embed);
    } else {
      self.common.reply(
          msg, `${mention.tag} created ${time.toUTCString()}`, mention.id);
    }
  }
  /**
   * Tell the user the date when they joined the server the message was sent
   * from.
   *
   * @private
   * @type {commandHandler}
   * @param {Discord~Message} msg Message that triggered command.
   * @listens Command#joinDate
   */
  function commandJoinDate(msg) {
    const mention = msg.mentions.members.first() ||
        msg.softMentions.members.first() || msg.member;

    const reply = function(member) {
      const perms = msg.channel.permissionsFor &&
          msg.channel.permissionsFor(self.client.user);
      const time = member.joinedAt;
      if (!perms || perms.has('EMBED_LINKS')) {
        const embed = new self.Discord.MessageEmbed();
        embed.setTitle('Server join date');
        embed.setColor([255, 0, 255]);
        embed.setDescription(`<@${member.id}>: ${time.toUTCString()}`);
        embed.setTimestamp(time);
        return msg.channel.send(`<@${msg.author.id}>`, embed);
      } else {
        return self.common.reply(
            msg, `${member.tag} joined ${time.toUTCString()}`, member.id);
      }
    };

    if (!mention.joinedAt) {
      mention.fetch().then(reply).catch((err) => {
        self.error('Failed to send join date: ' + msg.channel.id);
        console.error(err);
        if (err.message != 'No Perms') {
          self.common.reply(msg, 'Oops! Something went wrong...', err.message);
        }
      });
    } else {
      reply(mention).catch((err) => {
        self.error('Failed to send join date: ' + msg.channel.id);
        console.error(err);
        if (err.message != 'No Perms') {
          self.common.reply(msg, 'Oops! Something went wrong...', err.message);
        }
      });
    }
  }
  /**
   * Send information about the current server.
   *
   * @private
   * @type {commandHandler}
   * @param {Discord~Message} msg Message that triggered command.
   * @listens Command#server
   * @listens Command#serverInfo
   */
  function commandServerInfo(msg) {
    const perms = msg.channel.permissionsFor &&
        msg.channel.permissionsFor(self.client.user);
    const guild = msg.guild;
    const icon = guild.iconURL();
    const banner = guild.banner && guild.bannerURL();
    const splash = guild.splash && guild.splashURL();
    const vanity = guild.vanityURLCode;
    if (!perms || perms.has('EMBED_LINKS')) {
      const embed = new self.Discord.MessageEmbed();
      embed.setColor([255, 0, 255]);
      embed.setTitle(guild.name);
      if (splash) {
        embed.setImage(splash);
      } else if (banner) {
        embed.setImage(banner);
      }
      if (icon) embed.setThumbnail(icon);
      if (guild.description) embed.setDescription(guild.description);
      embed.addField(
          'Numbers', 'Members: ' + guild.memberCount + '\nChannels: ' +
              guild.channels.size + '\nRoles: ' + guild.roles.size +
              '\nEmojis: ' + guild.emojis.size,
          true);
      if (!guild.ownerID) {
        embed.addField(
            'Server', 'Created: ' + guild.createdAt.toUTCString() +
                '\nOwner: _Unknown_\nRegion: ' + guild.region +
                '\nVerification: ' + guild.verificationLevel + ' (' +
                guild.verified + ')\nPartnered: ' + guild.partnered,
            true);
      } else {
        embed.addField(
            'Server', 'Created: ' + guild.createdAt.toUTCString() +
                '\nOwner: <@' + guild.ownerID + '>\nRegion: ' + guild.region +
                '\nVerification: ' + guild.verificationLevel + ' (' +
                guild.verified + ')\nPartnered: ' + guild.partnered,
            true);
      }
      embed.addField(
          'Links', ((icon ? `Icon: ${icon}\n` : '') +
                    (banner ? `Banner: ${banner}\n` : '') +
                    (splash ? `Splash: ${splash}\n` : '') +
                    (vanity ? `Vanity: discord.gg/${vanity}\n` : '')) ||
              '*None*',
          true);
      if (guild.shard) embed.setFooter(`Shard #${guild.shard.id}`);
      msg.channel.send(`<@${msg.author.id}>`, embed);
    } else {
      self.common.reply(
          msg, 'Please allow me to embed links to use this command here.');
    }
  }
  /**
   * Send information about the emojis sent in the message.
   *
   * @private
   * @type {commandHandler}
   * @param {Discord~Message} msg Message that triggered command.
   * @listens Command#emoji
   * @listens Command#emote
   * @listens Command#e
   * @listens Command#emojis
   * @listens Command#emotes
   */
  function commandEmoji(msg) {
    const embeddable = (!msg.channel.permissionsFor) ||
        msg.channel.permissionsFor(self.client.user)
            .has(self.Discord.Permissions.FLAGS.EMBED_LINKS);

    const unicode = emojiChecker.match(msg.content);
    const unicodeList = unicode && unicode.map((el) => {
      return el + ': ' + el.replace(/./g, (str) => {
        return '\\u' +
            ((`0000` + str.charCodeAt(0).toString(16)).slice(-4)).toUpperCase();
      });
    }) ||
        [];
    const emojiText = msg.content.match(/<a?:\w+:\d+>/g);
    const emojiIds =
        emojiText && emojiText.map((el) => el.match(/<a?:\w+:(\d+)>/)[1]) || [];
    let emojis = [];

    const finalSend = function() {
      const total = emojiIds.length + unicodeList.length;
      if (total <= 0) {
        self.common.reply(
            msg, 'No emojis specified',
            'Please type an emoji after the command.');
      } else if (embeddable) {
        const embed = new self.Discord.MessageEmbed();
        embed.setColor([255, 0, 255]);
        if (total == 1) {
          embed.setTitle('Emoji');
          if (emojiIds.length > 0) {
            const emoji = emojis[0];
            if (!emoji) {
              embed.setImage(`https://cdn.discordapp.com/emojis/${emojiIds[0]}`);
              embed.setURL(`https://cdn.discordapp.com/emojis/${emojiIds[0]}`);
              embed.setDescription(
                  'I do not know anything about that emoji.' +
                  '\nIt\'s probably not from a server that I am in.' +
                  '\n\nBut here\'s the url: https://cdn.discordapp.com/emojis/' +
                  emojiIds[0]);
              embed.setFooter(`${emojiText[0]} ${emojiIds[0]}`);
            } else {
              const toString =
                  `<${emoji.animated?'a':''}:${emoji.name}:${emoji.id||''}>`;
              embed.setImage(emoji.url);
              const gName = emoji.guild && emoji.guild.name ||
                  emoji.guildName || 'unknown server';
              embed.setDescription(`${toString} from ${gName}`);
              embed.setURL(emoji.url);
              if (emoji.id) embed.setFooter(emoji.id);
              const infoRows = [];
              infoRows.push(`Name: ${emoji.name}`);
              infoRows.push(`Formatted: \\${toString}`);
              infoRows.push(`Animated: ${emoji.animated}`);
              infoRows.push(`Managed: ${emoji.managed}`);
              infoRows.push(`Requires Colons: ${emoji.requiresColons}`);
              infoRows.push(`URL: ${emoji.url}`);
              embed.addField('Info', infoRows.join('\n'), true);
            }
          } else {
            const emoji = unicodeList[0];
            if (!emoji) {
              embed.setDescription(
                  'I do not know anything about that emoji.\nThis is ' +
                  'strange, there isn\'t much to know about that one..');
            } else {
              embed.setDescription(emoji);
              embed.setFooter('Unicode Emoji');
            }
          }
        } else {
          embed.setTitle('Emojis');
          if (unicodeList.length > 0) {
            embed.addField('Unicode Emojis', unicodeList.join('\n'), true);
          }
          if (emojis.length > 0) {
            const list = emojiText.map((el, i) => {
              return `${el}: ${emojis[i] && emojis[i].url || 'Unknown'}`;
            });
            embed.addField('Discord Emojis', list, true);
          }
        }
        msg.channel.send(self.common.mention(msg), embed).catch(console.error);
      } else {
        const emojiList = emojis.map((el) => `${el.toString()}:${el.url}`);
        self.common.reply(
            msg, 'Emojis',
            unicodeList.join('\n') + '\n' + emojiList.join('\n'));
      }
    };

    if (self.client.shard && emojiIds.length > 0) {
      const toSend = JSON.stringify(emojiIds) +
          '.map((el)=>this.emojis.get(el))' +
          '.filter((el)=>el)' +
          '.map((el)=>{el.guildName=el.guild.name;return JSON.stringify(el);})';
      self.client.shard.broadcastEval(toSend)
          .then((res) => {
            res.forEach((el) => {
              if (!el) return;
              el.forEach((emoji) => emojis.push(JSON.parse(emoji)));
            });
            finalSend();
          })
          .catch((err) => {
            self.error('Failed to fetch emojis from shards.');
            console.error(err);
            self.common.reply(msg, 'Oops! Something inside me is broken.');
          });
    } else {
      emojis = emojiIds.map((el) => self.client.emojis.get(el));
      finalSend();
    }
  }
  /**
   * Send the user a PM with a greeting introducing who the bot is.
   *
   * @private
   * @type {commandHandler}
   * @param {Discord~Message} msg Message that triggered command.
   * @listens Command#pmMe
   * @listens Command#dmMe
   */
  function commandPmMe(msg) {
    msg.author
        .send(
            introduction.replaceAll('{prefix}', msg.prefix)
                .replaceAll('{username}', self.client.user.username))
        .then(() => {
          if (msg.guild !== null) {
            self.common.reply(msg, 'I sent you a message.', ':wink:');
          }
        })
        .catch(() => {
          self.common.reply(msg, blockedmessage);
        });
  }
  /**
   * Send a PM to SpikeyRobot with a message.
   *
   * @private
   * @type {commandHandler}
   * @param {Discord~Message} msg Message that triggered command.
   * @listens Command#pmSpikey
   * @listens Command#pmSpikey
   */
  function commandPmSpikey(msg) {
    if (!msg.text || msg.text.trim().length == 0) {
      self.common.reply(
          msg, 'Please write a message to send after the command.\n' +
              'Reminder: this will send the message to my creator.',
          msg.prefix + 'pmspikey The bot is on fire!');
      return;
    }
    self.client.users.fetch(self.common.spikeyId)
        .then((user) => {
          user.send(msg.author.id + ': ' + msg.author.tag + ': ' + msg.content)
              .then(() => {
                if (user.presence.status === 'offline') {
                  self.common.reply(
                      msg, 'I sent your message to SpikeyRobot.',
                      'SpikeyRobot is currently offline, but will get back to' +
                          ' you ASAP.');
                } else {
                  self.common.reply(msg, 'I sent your message to SpikeyRobot.');
                }
              });
        })
        .catch((err) => {
          console.log(err);
          self.common.reply(
              msg, 'Something went wrong and I couldn\'t send your message.',
              'Sorry that\'s all I know :(');
        });
  }
  /**
   * @description Send a PM to a mentioned user semi-anonymously. Messages are
   * copied to SpikeyRobot to monitor for abuse. This command only works for 3
   * people.
   *
   * @private
   * @type {commandHandler}
   * @param {Discord~Message} msg Message that triggered command.
   * @listens Command#thotPm
   */
  function commandThotPm(msg) {
    if (msg.author.id == self.common.spikeyId ||
        msg.author.id == '265418316120719362' ||
        msg.author.id == '126464376059330562') {
      if (msg.guild !== null) msg.delete();
      if (msg.mentions.users.size === 0) return;
      msg.mentions.users.first().send(msg.text);
      self.client.users.fetch(self.common.spikeyId).then((user) => {
        user.send(msg.author.tag + ': ' + msg.content);
      });
    }
  }
  /**
   * Send a PM to a specific user via a given id or name and descriminator.
   *
   * @private
   * @type {commandHandler}
   * @param {Discord~Message} msg Message that triggered command.
   * @listens Command#pmUser
   */
  function commandPmUser(msg) {
    const userString = (msg.text.split(' ')[1] || '').replace(/^@|^<@|>$/g, '');
    if (!userString) {
      self.common.reply(msg, 'Please specify a user and a message.');
      return;
    }
    self.client.users.fetch(userString)
        .then((user) => {
          if (user) {
            sendPm(msg, user, msg.text.split(' ').slice(2).join(' '));
          } else {
            lookupByName();
          }
        })
        .catch(() => {
          lookupByName();
        });
    /**
     * Lookup a user by their tag name.
     *
     * @private
     */
    function lookupByName() {
      const userObject = self.client.users.find((user) => {
        return user.tag.toLowerCase() == userString.toLowerCase();
      });
      if (userObject) {
        sendPm(msg, userObject, msg.text.split(' ').slice(2).join(' '));
      } else {
        self.common.reply(
            msg, 'I was unable to find that user: ' + userString +
                '\nYou may use their account ID or Username with the ' +
                '# and number.');
      }
    }
    /**
     * Send a pm to the user.
     *
     * @private
     * @param {Discord~Message} msg Message that triggered command.
     * @param {Discord~User} user The user to send the pm to.
     * @param {string} message The message to send to the user.
     */
    function sendPm(msg, user, message) {
      user.send(
          msg.author.tag + ' has asked me to send you this message:\n' +
              message)
          .then(() => {
            self.common.reply(
                msg, 'Message sent to ' + user.tag, msg.author.tag +
                    ' has asked me to send you this message:\n' + message);
          })
          .catch((err) => {
            self.common.reply(
                msg, 'Something sent wrong in sending the message.\n' +
                    'This probably wasn\'t your fault.',
                err.message);
            self.error(
                'Failed to send pm to user: ' + user.username + ' ' + user.id);
            self.comon.error(err);
          });
    }
  }
  /**
   * Send an image of a coin, either Heads or Tails.
   *
   * @private
   * @type {commandHandler}
   * @param {Discord~Message} msg Message that triggered command.
   * @listens Command#flip
   */
  function commandFlip(msg) {
    const match = msg.text.match(/\d+/);
    if (!match) {
      const rand = Math.round(Math.random());
      let url = 'https://www.spikeybot.com/heads.png';
      let text = 'Heads!';
      if (rand) {
        url = 'https://www.spikeybot.com/tails.png';
        text = 'Tails!';
      }
      const embed = new self.Discord.MessageEmbed({title: text});
      embed.setImage(url);
      msg.channel.send(embed).catch(() => {
        self.common.reply(
            msg, 'Failed to send reply.',
            'Am I able to embed images and links?');
      });
    } else {
      const h = '🇭 ';
      const t = '🇹 ';
      const num = Math.min(500, match[0]);
      let numH = 0;
      const outList = [];
      for (let i = 0; i < num; i++) {
        const out = Math.random() > 0.5;
        if (out) numH++;
        outList.push(out ? h : t);
      }
      const p = numH / num;
      const percent = Math.round(p * 10000) / 100;
      const embed = new self.Discord.MessageEmbed();
      embed.setTitle(`Flipped ${num} coins`);
      embed.setColor([p * 255, 0, (1 - p) * 255]);
      embed.setDescription(outList.join(''));
      embed.setFooter(
          `${percent}% Heads, ${numH} Heads, ${num-numH} Tails, ${num} Total`);
      msg.channel.send(embed).catch(() => {
        self.common.reply(
            msg, 'Failed to send reply.',
            'Am I able to embed images and links?');
      });
    }
  }
  /**
   * Delete a given number of messages from a text channel.
   *
   * @private
   * @type {commandHandler}
   * @param {Discord~Message} msg Message that triggered command.
   * @listens Command#purge
   */
  function commandPurge(msg) {
    if (!msg.channel.permissionsFor(self.client.user)
        .has(self.Discord.Permissions.FLAGS.MANAGE_MESSAGES)) {
      self.common
          .reply(
              msg,
              'I\'m sorry, but I don\'t have permission to delete messages ' +
                  'in this channel.\nTo allow me to do this, please give me ' +
                  'permission to Manage Messages.')
          .catch(() => {
            self.warn(
                'Unable to reply to user without perms attemping purge: ' +
                msg.channel);
          });
      return;
    }
    const numString = msg.text.replace(/<[^>]*>|\s/g, '');
    let num = (numString * 1) + 1;
    if (numString.length === 0 || isNaN(num)) {
      self.common.reply(
          msg,
          'You must specify the number of messages to purge. (ex: ?purge 5)');
    } else {
      const limited = num > 101;
      if (limited || num == 101) {
        num = 100;
      }
      if (msg.mentions.users.size > 0) {
        if (!limited) num--;
        const toDelete = msg.channel.messages.filter(function(obj) {
          return msg.mentions.users.find(function(mention) {
            return obj.author.id === mention.id;
          });
        });
        msg.channel.bulkDelete(toDelete.first(num))
            .then(() => {
              self.common
                  .reply(
                      msg, 'Deleted ' + num + ' messages by ' +
                          msg.mentions.users
                              .map(function(obj) {
                                return obj.username;
                              })
                              .join(', '))
                  .then((msg_) => {
                    msg_.delete({timeout: 5000});
                  });
            })
            .catch((err) => {
              self.common.reply(
                  msg, 'Oops! Discord didn\'t like that...', err.message);
            });
      } else {
        msg.channel.bulkDelete(num)
            .then(() => {
              if (limited) {
                self.common.reply(
                    msg, 'Number of messages deleted limited to 100.');
              }
            })
            .catch((err) => {
              self.common.reply(
                  msg, 'Oops! Discord didn\'t like that...', err.message);
            });
      }
    }
  }
  /**
   * Ban a mentioed user (or role from ID) and send a message saying they were
   * banned.
   *
   * @private
   * @type {commandHandler}
   * @param {Discord~Message} msg Message that triggered command.
   * @listens Command#ban
   * @listens Command#fuckyou
   */
  function commandBan(msg) {
    const uIds = msg.text.match(/\d{17,19}/g);
    if (!uIds) {
      self.common.reply(
          msg, 'You must mention someone to ban or specify an ID of ' +
              'someone on the server.');
      return;
    }
    const banList = [];
    uIds.forEach((el) => {
      const u = msg.guild.members.get(el);
      if (u) {
        if (!banList.includes(u.id)) banList.push(u);
      } else {
        const r = msg.guild.roles.get(el);
        if (r) {
          r.members.forEach((m) => {
            if (!banList.includes(m.id)) banList.push(m);
          });
        }
      }
    });
    if (banList.length == 0) {
      self.common.reply(
          msg, 'You must mention someone to ban or specify an ID of ' +
              'someone on the server.');
      return;
    }
    let reason =
        msg.text.replace(self.Discord.MessageMentions.USERS_PATTERN, '')
            .replace(self.Discord.MessageMentions.ROLES_PATTERN, '')
            .replace(/\d{17,19}/g)
            .replace(/\s{2,}/g, ' ')
            .trim();
    if (reason == 'undefined') reason = null;
    banList.forEach(function(toBan) {
      if (msg.guild.ownerID !== msg.author.id &&
          msg.member.roles.highest.comparePositionTo(toBan.roles.highest) <=
              0) {
        self.common
            .reply(
                msg, 'You can\'t ban ' + toBan.user.username +
                    '! You are not stronger than them!')
            .catch(() => {});
      } else {
        const me = msg.guild.me;
        const myRole = me.roles.highest;
        const highest = toBan.roles.highest;

        if (!myRole || (highest && myRole.comparePositionTo(highest) <= 0)) {
          self.common
              .reply(
                  msg, 'I can\'t ban ' + toBan.user.username +
                      '! I am not strong enough!')
              .catch(() => {});
        } else {
          const banMsg = banMsgs[Math.floor(Math.random() * banMsgs.length)];
          toBan.ban({reason: reason || banMsg})
              .then(() => {
                self.common.reply(msg, banMsg, 'Banned ' + toBan.user.username)
                    .catch(() => {});
                const modLog = self.bot.getSubmodule('./modLog.js');
                if (modLog) {
                  modLog.output(
                      msg.guild, 'ban', toBan.user, msg.author,
                      reason || banMsg);
                }
              })
              .catch((err) => {
                self.common
                    .reply(
                        msg, 'Oops! I wasn\'t able to ban ' +
                            toBan.user.username + '! I\'m not sure why though!')
                    .catch(() => {});
                self.error('Failed to ban user.');
                console.error(err);
              });
        }
      }
    });
  }
  /**
   * Remove all roles from a user and give them a role that prevents them from
   * doing anything. Checks if all parties involved have permission to do this
   * without the bot's help.
   *
   * @private
   * @type {commandHandler}
   * @param {Discord~Message} msg Message that triggered command.
   * @listens Command#smite
   */
  function commandSmite(msg) {
    if (msg.mentions.members.size === 0) {
      self.common.reply(
          msg, 'You must mention someone to smite after the command.');
    } else {
      const toSmite = msg.mentions.members.first();
      if (msg.guild.ownerID !== msg.author.id &&
          msg.member.roles.highest.comparePositionTo(toSmite.roles.highest) <=
              0) {
        self.common.reply(
            msg, 'You can\'t smite ' + toSmite.user.username +
                '! You are not stronger than them!',
            'Your role is not higher than theirs.');
      } else {
        msg.guild.members.fetch(self.client.user).then((me) => {
          const myRole = me.roles.highest;
          if (toSmite.roles.highest &&
              self.Discord.Role.comparePositions(
                  myRole, toSmite.roles.highest) <= 0) {
            self.common.reply(
                msg, 'I can\'t smite ' + toSmite.user.username +
                    '! I am not strong enough!',
                'I need permission to have a higher role.');
          } else {
            let hasSmiteRole = false;
            let smiteRole;
            msg.guild.roles.forEach((val) => {
              if (val.name == 'Smited') {
                hasSmiteRole = true;
                smiteRole = val;
              }
            });
            const smite = function(role, member) {
              try {
                member.roles.set([role])
                    .then(() => {
                      self.common.reply(
                          msg, 'The gods have struck ' + member.user.username +
                              ' with lightning!');
                      const modLog = self.bot.getSubmodule('./modLog.js');
                      if (modLog) {
                        modLog.output(
                            msg.guild, 'smite', member.user, msg.author);
                      }
                    })
                    .catch((err) => {
                      self.common.reply(
                          msg, 'Oops! I wasn\'t able to smite ' +
                              member.user.username +
                              '! I wasn\'t able to give them the "Smited" ' +
                              'role!');
                      self.error(
                          'Failed to give smited role: ' + msg.guild.id + '@' +
                          member.id);
                      console.log(err);
                    });
                member.guild.channels.forEach(function(channel) {
                  if (channel.permissionsLocked) return;
                  const overwrites = channel.permissionOverwrites.get(role.id);
                  if (overwrites) {
                    if (channel.type == 'category') {
                      if (overwrites.deny.has(
                          self.Discord.Permissions.FLAGS.SPEAK) &&
                          overwrites.deny.has(
                              self.Discord.Permissions.FLAGS.SEND_MESSAGES)) {
                        return;
                      }
                    } else if (channel.type == 'voice') {
                      if (overwrites.deny.has(
                          self.Discord.Permissions.FLAGS.SPEAK)) {
                        return;
                      }
                    } else if (channel.type == 'text') {
                      if (overwrites.deny.has(
                          self.Discord.Permissions.FLAGS.SEND_MESSAGES)) {
                        return;
                      }
                    }
                  }
                  channel
                      .updateOverwrite(
                          role, {SEND_MESSAGES: false, SPEAK: false})
                      .catch(console.error);
                });
              } catch (err) {
                self.common.reply(
                    msg, 'Oops! I wasn\'t able to smite ' +
                        member.user.username + '! I\'m not sure why though!');
                self.error('Failed to smite for unknown reason');
                console.log(err);
              }
            };
            if (!hasSmiteRole) {
              msg.guild.roles
                  .create({
                    data: {
                      name: 'Smited',
                      position: 0,
                      hoist: true,
                      color: '#2f3136',
                      permissions: smitePerms,
                      mentionable: true,
                    },
                  })
                  .then((role) => {
                    smite(role, toSmite);
                  })
                  .catch((err) => {
                    self.error('Failed to create Smited role: ' +msg.guild.id);
                    console.error(err);
                    self.common.reply(
                        msg, 'I couldn\'t smite ' + toSmite.user.username +
                            ' because there isn\'t a "Smited" role and I ' +
                            'couldn\'t make it!');
                  });
            } else {
              smite(smiteRole, toSmite);
            }
          }
        });
      }
    }
  }
  /**
   * Send a larger resolution version of the mentioned user's avatar.
   *
   * @private
   * @type {commandHandler}
   * @param {Discord~Message} msg Message that triggered command.
   * @listens Command#avatar
   */
  function commandAvatar(msg) {
    const embed = new self.Discord.MessageEmbed();
    if (msg.mentions.users.size > 0) {
      embed.setDescription(
          msg.mentions.users.first().username + '\'s profile picture');
      embed.setImage(msg.mentions.users.first().displayAvatarURL({size: 2048}));
    } else {
      embed.setDescription(msg.author.username + '\'s profile picture');
      embed.setImage(msg.author.displayAvatarURL({size: 2048}));
    }
    msg.channel.send(embed);
  }

  /**
   * Reply to user with my ping to the Discord servers.
   *
   * @private
   * @type {commandHandler}
   * @param {Discord~Message} msg Message that triggered command.
   * @listens Command#ping
   */
  function commandPing(msg) {
    const graph = [];
    if (pingHistory.length > 0) {
      const cols = 40;
      const rows = 10;
      const td = oldestPing / cols;
      const now = Date.now();
      let index = pingHistory.length - 1;
      const values = [];
      let max = 500;
      let min = 0;
      for (let c = 0; c < cols; c++) {
        let total = 0;
        let num = 0;
        for (index; index >= 0 && now - pingHistory[index].time < td * (c + 1);
          index--) {
          total += pingHistory[index].delta * 1;
          num++;
        }
        total /= num || 1;
        values.push(total);
        max = Math.max(max, total);
        if (total != 0) min = Math.min(min, total);
      }
      max *= 1.1;
      min *= 0.9;
      const step = (max - min) / rows;
      for (let r = 0; r <= rows; r++) {
        graph[r] = [];
        for (let c = cols - 1; c >= 0; c--) {
          if (r == rows) {
            graph[r].push('_');
            continue;
          }
          const inRange = min + step * (rows - r - 1) <= values[c] &&
              min + step * (rows - r) > values[c];
          let char = ' ';
          if (inRange) {
            if (min + step * (rows - r - 0.5) <= values[c]) {
              char = '-';
            } else {
              char = '_';
            }
          }
          graph[r].push(char);
        }
        graph[r].push('|');
        if (r == 0 || r == rows - 1 || r == Math.floor(rows / 2)) {
          graph[r].push(Math.round(step * (rows - r) + min));
        }
        graph[r] = graph[r].join('');
      }
      /* const dfmt = 'mmm-dd HH:MM Z';
      graph[rows] = '    ' + dateFormat(pingHistory[0].time, dfmt) +
          '       --->       ' +
          dateFormat(pingHistory[pingHistory.length - 1].time, dfmt); */
    }

    const finalGraph = '24 hour history ```' + graph.join('\n') + '```';
    if (self.client.ping) {
      self.common.reply(
          msg, 'My ping is ' + Math.round(self.client.ping * 10) / 10 + 'ms',
          finalGraph);
    } else {
      self.common.reply(
          msg,
          'My current ping ' + Math.round(self.client.ws.ping * 10) / 10 + 'ms',
          finalGraph);
    }
  }

  /**
   * Reply to message with the amount of time since the bot has been running.
   *
   * @private
   * @type {commandHandler}
   * @param {Discord~Message} msg Message that triggered command.
   * @listens Command#uptime
   */
  function commandUptime(msg) {
    const ut = self.client.uptime;
    const formattedUptime = Math.floor(ut / 1000 / 60 / 60 / 24) + ' Days, ' +
        Math.floor(ut / 1000 / 60 / 60) % 24 + ' Hours, ' +
        Math.floor(ut / 1000 / 60) % 60 + ' Minutes, ' +
        Math.floor((ut / 1000) % 60) + ' Seconds.';
    self.common.reply(msg, 'I have been running for ' + formattedUptime);
  }

  /**
   * Reply to message saying what game the mentioned user is playing and
   * possibly other information about their profile.
   *
   * @private
   * @type {commandHandler}
   * @param {Discord~Message} msg Message that triggered command.
   * @listens Command#game
   */
  function commandGame(msg) {
    let user = msg.author;
    if (msg.mentions.users.size !== 0) {
      user = msg.mentions.users.first();
    }
    const p = user.presence;
    if (p.activity) {
      let finalString = p.activity.type + ': ' + p.activity.name + '(' +
          p.activity.url + ')\nDetails: ' + (p.activity.details || 'none') +
          ' (' +
          (JSON.stringify(
              (p.activity.party && p.activity.party.size) || 'No party')) +
          ')';
      if (p.assets) {
        if (p.assets.largeText) {
          finalString += '\n' + p.assets.largeText;
        }
        if (p.assets.smallText) {
          finalString += '\n' + p.assets.smallText;
        }
      }
      self.common.reply(
          msg, user.username + ': ' + p.status, finalString);
    } else {
      self.common.reply(msg, user.username + ': ' + p.status, p.activity);
    }
  }

  /**
   * Read the current version from package.json and show it to the user.
   *
   * @private
   * @type {commandHandler}
   * @param {Discord~Message} msg Message that triggered command.
   * @listens Command#version
   */
  function commandVersion(msg) {
    self.common.reply(
        msg, 'My current version is ' + version + '\nCommit: ' + commit +
            '\nDiscord.js: ' + (self.Discord.version || 'Unknown') +
            '\n\nSubModules:\n' +
            self.bot.getSubmoduleCommits()
                .map((el) => {
                  return el.name + ': ' + el.commit;
                })
                .join('\n'));
  }

  /**
   * An object storing information about a timer.
   *
   * @typedef {object} Main~Timer
   * @property {string} id The id of the user who set the timer.
   * @property {string} message The message for when the timer ends.
   * @property {number} time The time since epoch at which the timer will end.
   */

  /**
   * Sets a timer for an amount of time with a message.
   *
   * @private
   * @param {Main~Timer} timer The settings for the timer.
   */
  function setTimer(timer) {
    timers.push(timer);
    const now = Date.now();
    timer.timeout = self.client.setTimeout(() => {
      self.client.users.fetch(timer.id).then((user) => {
        user.send(timer.message);
        const now = Date.now();
        timers = timers.filter((obj) => obj.time > now);
      });
    }, timer.time - now);
  }

  /**
   * Roll a die with the given number of sides.
   *
   * @private
   * @type {commandHandler}
   * @param {Discord~Message} msg Message that triggered command.
   * @listens Command#roll
   * @listens Command#dice
   * @listens Command#die
   * @listens Command#d
   */
  function commandRollDie(msg) {
    const embed = new self.Discord.MessageEmbed();

    let numbers = msg.text.split(/\s+/).splice(1);
    let allSame = true;
    if (numbers.length === 0) {
      numbers = [6];
    } else {
      let matchNum = 0;
      for (let i = 0; i < numbers.length; i++) {
        const el = numbers[i];
        if (typeof el !== 'string') {
          self.error(`${el} is not a string: ${msg.text}`);
        }
        const match = el.match(/(\d*)([xXdD*])(\d+)/);
        if (!match) {
          const firstNum = el.match(/(\d+)/);
          if (!firstNum) {
            numbers.splice(i, 1);
            i--;
            continue;
          }
          numbers[i] = firstNum[1];
          if (i == 0) {
            matchNum = firstNum[1];
          } else if (firstNum[1] != matchNum) {
            allSame = false;
          }
        } else {
          if (match[2].toLowerCase() == 'd') {
            const temp = match[3];
            match[3] = match[1];
            match[1] = temp;
          }
          if (!match[1] || match[1] <= 0 || isNaN(Number(match[1]))) {
            match[1] = 1;
          }
          if (i == 0) {
            matchNum = match[1];
          } else if (match[1] != matchNum) {
            allSame = false;
          }
          numbers.splice(i, 1, match[1]);
          for (let j = 0; j < match[3] - 1 && j <= 501; j++) {
            numbers.splice(i, 0, match[1]);
          }
        }
      }
    }

    if (numbers.length > 500) {
      embed.setTitle('Sorry, but you may only roll at most 500 dice.');
      msg.channel.send(self.common.mention(msg), embed);
      return;
    }

    const outcomes = [];
    numbers.forEach((el, i) => {
      outcomes[i] = Math.ceil(Math.random() * el);
    });

    if (allSame) {
      embed.setTitle(
          'Rolling ' + numbers.length + ' (' + numbers[0] + ' sided) di' +
          (numbers.length == 1 ? 'e' : 'ce'));
    } else {
      embed.setTitle(
          'Rolling ' + numbers.length + ' di' +
          (numbers.length == 1 ? 'e' : 'ce'));
    }

    if (numbers.length > 1) {
      let outList = [];
      const sorted = outcomes.slice(0).sort();
      const freq = [];
      let sum = 0;
      const max = sorted[sorted.length - 1];
      const min = sorted[0];
      if (allSame) {
        outList = outcomes.slice(0);
        numbers.forEach((el, i) => {
          const num = outcomes[i];
          if (!freq[num]) freq[num] = 0;
          freq[num]++;
          sum += num;
        });

        embed.setDescription(outList.join(', '));
      } else if (!allSame) {
        outList = numbers.map((el, i) => {
          const num = outcomes[i];
          if (!freq[num]) freq[num] = 0;
          freq[num]++;
          sum += num;
          return `${el} --> ${outcomes[i]}`;
        });

        embed.setDescription(`{sides} --> {rolled}\n${outList.join('\n')}`);
      }
      const maxFreq = freq.reduce((a, b, i) => {
        if (a.count < b) return {num: i, count: b};
        return a;
      }, {count: 0, num: 0});
      const modes = [];
      freq.forEach((el, i) => {
        if (el === maxFreq.count) modes.push(i);
      });
      let mode = null;
      if (modes.length < 4 && modes.length < outList.length) {
        mode = `${modes.join(', ')} (${maxFreq.count} times)`;
      }
      const mean = sum / outList.length;
      const median = Math.round(
          (sorted[Math.floor(sorted.length / 2)] +
                          sorted[Math.floor(
                              (sorted.length % 2 == 0 ? sorted.length :
                                                        sorted.length - 1) /
                              2)]) /
                         2 * 10) /
          10;
      if (outList.length > 3) {
        const finalMode = mode ? `, Mode: ${mode}` : '';
        embed.setFooter(
            `Sum: ${sum}, Max: ${max}, Min: ${min}, ` +
            `Mean: ${mean}, Median: ${median}${finalMode}`);
      } else if (outList.length > 2) {
        embed.setFooter(`Sum: ${sum}, Avg: ${mean}`);
      } else {
        embed.setFooter(`Sum: ${sum}`);
      }
    } else {
      embed.setDescription(`Rolled: ${outcomes[0]}`);
    }

    msg.channel.send(self.common.mention(msg), embed).catch((e) => {
      if (e.code == 50035) {
        self.common.reply(
            msg, 'Oops! I wasn\'t able to fit all of the outcomes ' +
                'into a message.\nPlease try again with fewer dice.');
      } else {
        console.error(e);
      }
    });
  }

  /**
   * Send information about permissions for debugging.
   *
   * @private
   * @type {commandHandler}
   * @param {Discord~Message} msg Message that triggered command.
   * @listens Command#perms
   */
  function commandPerms(msg) {
    let chan = msg.channel;
    let guild = msg.guild;
    let mem = msg.member;
    let author = msg.author;

    const idList = msg.text.match(/\b\d{17,19}\b/g);
    if (self.common.trustedIds.includes(msg.author.id) && idList) {
      const id = idList[0];
      const id2 = idList[1];
      chan = self.client.channels.get(id) || self.client.channels.get(id2);
      guild = (chan && chan.guild) || self.client.guilds.get(id) ||
          self.client.guilds.get(id2);
      mem = guild && (guild.members.get(id) || guild.members.get(id2));
      author = mem && mem.user;
      if (!guild) {
        if (self.client.shard) {
          const toEval = `this.fetchPerms('${id}', '${id2}')`;
          self.client.shard.broadcastEval(toEval).then((res) => {
            const index = res.findIndex((el) => el);
            const match = res[index];
            if (!match) {
              self.common.reply(
                  msg, 'Failed to find channel or guild with that ID.',
                  msg.text);
              return;
            }
            const cId = match.cId;
            const cY = match.cY;
            const cM = match.cM;
            const gId = match.gId;
            const gY = match.gY;
            const gM = match.gM;
            const uId = match.uId;
            const embed = new self.Discord.MessageEmbed();
            embed.setTitle(`Permissions (Shard #${index})`);
            replyPerms(msg, gId, gM, gY, cId, cM, cY, uId, embed);
          });
        } else {
          self.common.reply(
              msg, 'Failed to find channel or guild with that ID.', msg.text);
        }
        return;
      }
    }

    const cY = chan && author && chan.permissionsFor(author).bitfield;
    const cM = chan && chan.permissionsFor(self.client.user).bitfield;
    const gY = author && mem.permissions.bitfield;
    const gM = guild.members.get(self.client.user.id).permissions.bitfield;
    const uId = author && author.id;
    replyPerms(msg, guild.id, gM, gY, chan && chan.id, cM, cY, uId);
  }

  /**
   * @description Reply to the given message with the permission information of
   * the given guild, channel, and user.
   * @private
   * @param {external:Discord~Message} msg Message to reply to.
   * @param {string} gId Guild ID for displaying.
   * @param {number} gM Bitfield for self in the guild.
   * @param {number} [gY] Bitfield for user in guild.
   * @param {string} [cId] Channel ID for displaying.
   * @param {number} [cM] Bitfield for self in channel.
   * @param {number} [cY] Bitfield for user in channel.
   * @param {string} [uId] User id to show.
   * @param {external:Discord~MessageEmbed} [embed] Embed object to modify
   * instead of creating a new one.
   */
  function replyPerms(msg, gId, gM, gY, cId, cM, cY, uId, embed) {
    if (!embed) {
      embed = new self.Discord.MessageEmbed();
      embed.setTitle('Permissions');
    }
    const you = uId || 'You';
    if ((cY != null && !isNaN(cY)) || (cM != null && !isNaN(cM))) {
      embed.addField(
          `Channel ${cId}`, '```css\n' +
              (cY == null || isNaN(cY) ?
                   '' :
                   `${prePad(cY.toString(2), 31)} ${you}\n`) +
              prePad(cM.toString(2), 31) + ' Me```');
    }

    embed.addField(
        `Guild ${gId}`, '```css\n' +
            (gY == null || isNaN(gY) ?
                 '' :
                 `${prePad(gY.toString(2), 31)} ${you}\n`) +
            prePad(gM.toString(2), 31) + ' Me```');

    const allPermPairs = Object.entries(self.Discord.Permissions.FLAGS);
    const formatted = allPermPairs
        .map((el) => {
          const cYou = (cY & el[1]) ? 'Y' : ' ';
          const cMe = (cM & el[1]) ? 'M' : ' ';
          const gYou = (gY & el[1]) ? 'Y' : ' ';
          const gMe = (gM & el[1]) ? 'M' : ' ';
          const bits = prePad(el[1].toString(2), 31);
          const flags = `${cYou}${cMe}/${gYou}${gMe}`;
          return `${bits} ${flags} ${el[0]}`;
        })
        .join('\n');
    embed.setDescription('```css\n' + formatted + '```');
    embed.setFooter(
        'To see permissions for each command type: `' + msg.prefix + 'show`');
    msg.channel.send(embed);
  }

  /**
   * @description Fetch the bitfield of permissions for our self or a given user
   * id in the guild or channel with the given id.
   *
   * @this external:Discord~Client
   * @private
   * @param {string} id The channel or guild id or user id to lookup permissions
   * for.
   * @param {string} [id2] The channel or guild id or user id to lookup
   * permissions for.
   * @returns {?{
   *   cId: ?string,
   *   cY: ?number,
   *   cM: ?number,
   *   gId: string,
   *   gY: ?number,
   *   gM: number,
   *   uId: ?string
   * }} Null if unable to find, or an object with found data. Element`cId` is
   * channel id, `gId` is guild id, `cY` is bitfield permissions for user in
   * channel, `cM` is bitfield permissions for self in channel, `gY` is bitfield
   * permissions for user in guild, `gM` is bitfield permissions for self in
   * guild, `uId` is id of matched user.
   */
  function fetchShardPerms(id, id2) {
    const chan = this.channels.get(id) || this.channels.get(id2);
    const guild =
        (chan && chan.guild) || this.guilds.get(id) || this.guilds.get(id2);
    if (guild) {
      const mem = guild.members.get(id) || guild.members.get(id2);

      const cMPerms = chan && chan.permissionsFor(this.user);
      const cM = cMPerms && cMPerms.bitfield;
      const cYPerms = chan && chan.permissionsFor(mem);
      const cY = cYPerms && cYPerms.bitfield;

      const gM = guild.members.get(this.user.id).permissions.bitfield;
      const gY = mem && mem.permissions.bitfield;
      return {
        cId: chan && chan.id,
        cY: cY,
        cM: cM,
        gId: guild.id,
        gY: gY,
        gM: gM,
        uId: mem && mem.id,
      };
    } else {
      return null;
    }
  }
  /**
   * Pad a number with leading zeroes so that it is `digits` long.
   *
   * @private
   * @param {string|number} num The number to pad with zeroes.
   * @param {number} digits The minimum number of digits to make the output
   * have.
   * @returns {string} The padded string.
   */
  function prePad(num, digits) {
    let str = num + '';
    while (str.length < digits) {
      str = '0' + str;
    }
    return str;
  }

  /**
   * Send information about the bot.
   *
   * @private
   * @type {commandHandler}
   * @param {Discord~Message} msg Message that triggered command.
   * @listens Command#stats
   */
  function commandStats(msg) {
    msg.channel.startTyping();
    self.bot.getStats((values) => {
      if (!values) {
        self.common.reply(msg, 'Failed to fetch stats.');
        return;
      }
      const fmtNum = function(num) {
        if (num < 1000) return `${num}`;
        const out = [];
        num *= 1;
        while (num > 999) {
          out.push(Math.floor(((num / 1000) % 1) * 1000));
          num = Math.floor(num / 1000);
        }
        const joined =
            ',' + out.reverse().map((el) => ('000' + el).slice(-3)).join(',');
        return `${num}${joined}`;
      };
      const embed = new self.Discord.MessageEmbed();
      embed.setTitle('SpikeyBot Stats');
      embed.setDescription(
          'These statistics are collected from the entire bot, ' +
          'across all shards.');

      const guildString = 'Number of servers: ' + fmtNum(values.numGuilds) +
          '\nLargest Server: ' + fmtNum(values.numLargestGuild) +
          ' members\nChannels: ' + fmtNum(values.numChannels) + '\nEmojis: ' +
          fmtNum(values.numEmojis) + '\nVerified: ' +
          fmtNum(values.numVerified) + '\nPartnered: ' +
          fmtNum(values.numPartnered);
      embed.addField('Guilds', guildString, true);

      const userString = 'Users: ' + fmtNum(values.numMembers) +
          '\nCached users: ' + fmtNum(values.numUsers);
      embed.addField('Users', userString, true);

      const shardUptimes = values.uptimes.map((el, i) => {
        const mem = values.memory[i];
        return `\`Shard #${i} (${values.versions[i]})\`\n- up ${el}\n- ${mem}`;
      });
      const shardString = 'Number of shards: ' + fmtNum(values.numShards) +
          '\nThis guild/channel is in shard #' + values.reqShard + '\n' +
          shardUptimes.join('\n');
      embed.addField('Shards', shardString, true);

      const systemString = 'Storage used: ' + values.saveData.match(/^\S+/)[0] +
          '\nPing: ' + Math.round(self.client.ws.ping) + 'ms';
      embed.addField('System', systemString, true);

      embed.setColor([0, 100, 255]);

      msg.channel.stopTyping();
      msg.channel.send(self.common.mention(msg), embed);
    });
  }

  /**
   * @description Fetch the bot's stats from all shards, then combine the data.
   * Public as SpikeyBot.getStats after SubModule.initialize.
   *
   * @private
   * @param {Function} cb One parameter that is guarunteed to have an array of
   * stats objeccts.
   */
  function getAllStats(cb) {
    const startTime = Date.now();
    /**
     * The stats object that is the result of this function.
     *
     * @private
     * @default
     */
    const values = {
      numGuilds: 0,
      numLargestGuild: 0,
      shardGuilds: {},
      shardUsers: {},
      numUsers: 0,
      numMembers: 0,
      numUsersOnline: 0,
      numChannels: 0,
      numEmojis: 0,
      numVerified: 0,
      numPartnered: 0,
      uptimes: [],
      memory: [],
      largestActivity: {name: 'Nothing', count: 0},
      versions: [],
      numShards: 0,
      reqShard: 0,
      fullDelta: 0,
    };
    if (self.client.shard) {
      values.numShards = self.client.shard.count;
      values.reqShard = self.client.shard.ids[0];
      if (Array.isArray(values.reqShard)) values.reqShard = values.reqShard[0];
    }
    /**
     * Callback once all shards have replied with their stats.
     *
     * @private
     * @param {?Array<object>} res Array of each response object or null if
     * error.
     */
    function statsResponse(res) {
      const parseStart = Date.now();
      const delays = new Array(res.length);
      values.uptimes = new Array(res.length);
      values.versions = new Array(res.length);

      for (let i = 0; i < res.length; i++) {
        values.numGuilds += res[i].numGuilds;
        values.shardGuilds[i] = res[i].numGuilds;
        values.shardUsers[i] = res[i].numUsers;
        values.numLargestGuild =
            Math.max(res[i].numLargestGuild, values.numLargestGuild);
        values.numUsers += res[i].numUsers;
        values.numMembers += res[i].numMembers;
        values.numChannels += res[i].numChannels;
        values.numEmojis += res[i].numEmojis;
        values.numVerified += res[i].numVerified;
        values.numPartnered += res[i].numPartnered;
        values.uptimes[i] = res[i].uptime;
        values.versions[i] = res[i].version;
        const mem = res[i].memory;
        const used = Math.round(mem.heapUsed / 100000) / 10;
        const heapTotal = Math.round(mem.heapTotal / 100000) / 10;
        const rss = Math.round(mem.rss / 100000) / 10;
        values.memory[i] = `${used}/${heapTotal}MB (${rss}MB)`;
        delays[i] = res[i].deltaString;
      }
      values.fullDelta = Date.now() - startTime;
      self.debug(
          'Full getStats() delta (ms): ' + values.fullDelta + ' Parse: ' +
          (Date.now() - parseStart) + ' Shards: ' + JSON.stringify(delays));
      cb(values);
    }

    childProcess.exec('du -sh ./save/', (err, stdout) => {
      if (err) {
        self.error('Failed to fetch save directory size.');
        console.error(err);
      } else {
        values.saveData = stdout.toString().trim();
      }
      if (self.client.shard) {
        self.client.shard.broadcastEval('this.getStats()')
            .then(statsResponse)
            .catch((err) => {
              self.error('Failed to fetch stats from shards.');
              console.error(err);
              statsResponse(null);
            });
      } else {
        statsResponse([getStats()]);
      }
    });
  }
  /**
   * Fetch our statistics about the bot on this shard.
   *
   * @private
   * @returns {object} The statistics we collected.
   */
  function getStats() {
    const startTime = Date.now();
    const out = {
      numGuilds: 0,
      numLargestGuild: 0,
      numUsers: 0,
      numMembers: 0,
      numChannels: 0,
      numEmojis: 0,
      numVerified: 0,
      numPartnered: 0,
      uptime: '0 days',
      memory: process.memoryUsage(),
      activities: {},
      version: `${version}#${commit.slice(0, 7)}`,
      shardId: (self.client.shard || {id: 0}).id,
    };

    out.numGuilds = self.client.guilds.size;

    let iTime = Date.now();
    self.client.guilds.forEach((g) => {
      out.numLargestGuild = Math.max(g.memberCount, out.numLargestGuild);
      out.numMembers += g.memberCount;
      out.numEmojis += g.emojis.size;
      if (g.verified) out.numVerified++;
      if (g.partnered) out.numPartnered++;
    });
    const guildDelta = Date.now() - iTime;

    iTime = Date.now();
    const userDelta = Date.now() - iTime;

    out.numUsers = self.client.users.size;
    out.numChannels = self.client.channels.size;

    const ut = self.bot.startTimestamp ? Date.now() - self.bot.startTimestamp :
                                         self.client.uptime;
    out.uptime = Math.floor(ut / 1000 / 60 / 60 / 24) + ' Days, ' +
        Math.floor(ut / 1000 / 60 / 60) % 24 + ' Hours';
    out.delta = Date.now() - startTime;
    out.deltaString = `a${out.delta}g${guildDelta}u${userDelta}`;
    return out;
  }

  /**
   * Lookup an ID and give information about what it represents.
   *
   * @private
   * @type {commandHandler}
   * @param {Discord~Message} msg Message that triggered command.
   * @listens Command#lookup
   */
  function commandLookup(msg) {
    const id = msg.text.split(' ')[1];
    const trusted = self.common.trustedIds.includes(msg.author.id);

    if (self.client.shard) {
      self.client.shard.broadcastEval(`this.lookupId('${id}',${trusted})`)
          .then((res) => {
            if (!res.find((el) => el)) {
              self.error(`Failed to lookup id: ${id}`);
              msg.channel.send(`${id} Failed to be looked up.`);
              return;
            }

            const embed = new self.Discord.MessageEmbed();
            embed.setTitle(id);
            res.forEach((el, i) => {
              if (el) embed.addField(`Shard #${i}`, el, true);
            });
            msg.channel.send(embed);
          })
          .catch((err) => {
            self.error('Failed to broadcast lookupId command.');
            console.error(err);
          });
    } else {
      const message = lookupId.call(self.client, id, trusted);
      if (!message) {
        self.error('Failed to lookup id: ' + id);
        msg.channel.send(id + ' Failed to be looked up.');
      } else {
        msg.channel.send(message);
      }
    }
  }

  /**
   * @description Lookup an ID for any data associated with it. This checks
   * guilds, channels, and users.
   * @this external:Discord~Client
   * @private
   * @param {string} id The ID to lookup.
   * @param {boolean} [trusted=false] Include possibly sensitive information in
   * result.
   * @returns {?string} A Discord formatted string to send.
   */
  function lookupId(id, trusted = false) {
    const user = this.users.get(id);
    const guild = this.guilds.get(id);
    const channel = this.channels.get(id);
    const output = [];

    if (user) {
      const guilds = [];
      this.guilds.forEach((g) => {
        if (g.members.get(id)) guilds.push(g.id);
      });
      if (trusted) {
        output.push(
            'User: `' + user.tag.replace(/`/g, '\\`') + '`' +
            (user.bot ? ' (bot)' : '') + ' has ' + guilds.length +
            ' mutual guilds: ' + guilds.join(', '));
      } else {
        output.push(
            'User: `' + user.tag.replace(/`/g, '\\`') + '`' +
            (user.bot ? ' (bot)' : '') + ' has ' + guilds.length +
            ' mutual guilds.');
      }
    }
    if (channel) {
      if (channel.guild) {
        let additional = '';
        if (trusted) {
          if (channel.members.size > 15) {
            additional = '\nMany Members';
          } else {
            additional = '\nMembers: ' +
                channel.members.map((m) => m.id + (m.user.bot ? ' (bot)' : ''))
                    .join(', ');
          }
        }
        output.push(
            'Guild ' + channel.type + ' Channel: `' +
            channel.name.replace(/`/g, '\\`') + '` with ' +
            channel.members.size + '+ members, in guild `' +
            channel.guild.name.replace(/`/g, '\\`') + '` (' + channel.guild.id +
            ')' + additional);
      } else {
        output.push('Channel: `' + channel.name.replace(/`/g, '\\`') + '`');
      }
    }
    if (guild) {
      output.push(
          'Guild: `' + guild.name.replace(/`/g, '\\`') + '` has ' +
          guild.memberCount + ' members.');
    }
    if (output.length > 0) {
      return output.join('\n');
    } else {
      return null;
    }
  }

  /**
   * Lookup an ID and send a message to the given channel or user without
   * telling the recipient who sent the message. Only looks up cached users and
   * channels on the same shard.
   *
   * @private
   * @type {commandHandler}
   * @param {Discord~Message} msg Message that triggered command.
   * @listens Command#sendto
   */
  function commandSendTo(msg) {
    if (!self.common.trustedIds.includes(msg.author.id)) {
      return;
    }
    const idString = (msg.text.split(' ')[1] || '').replace(/^@|^<@|>$/g, '');
    if (!idString) {
      self.common.reply(msg, 'Please specify a channel and a message.');
      return;
    }
    const channel = self.client.channels.get(idString);
    const user = self.client.users.get(idString);
    const message = msg.text.split(' ').slice(2).join(' ');
    if (channel) {
      channel.send(message)
          .then(() => {
            self.common.reply(msg, 'Message sent!');
          })
          .catch((err) => {
            self.common.reply(
                msg, 'Oops! I am unable to send a message to that channel!',
                err.message);
          });
    } else if (user) {
      user.send(message)
          .then(() => {
            self.common.reply(msg, 'Message sent!');
          })
          .catch((err) => {
            self.common.reply(
                msg, 'Oops! I am unable to send a message to that user!',
                err.message);
          });
    } else {
      if (self.client.shard) {
        const toSend = encodeURIComponent(message);
        self.client.shard
            .broadcastEval(`this.sendTo('${idString}',"${toSend}")`)
            .then((res) => {
              const success = res.find((el) => el);
              if (success) {
                self.common.reply(
                    msg, 'Attempted to send from another shard.',
                    'Possibly succeeded, unable to verify.');
              } else {
                self.common.reply(
                    msg, 'I am unable to find that user or channel. :(');
              }
            });
      } else {
        self.common.reply(msg, 'I am unable to find that user or channel. :(');
      }
    }
  }

  /**
   * @description Send a message to a certain channel id.
   * @private
   * @this external:Discord~ClientUser
   * @param {string} id The channel ID to send the message to.
   * @param {string} message The message to send. Will have decodeURIComponent
   * run on before processing.
   * @returns {boolean} True if found channel, false otherwise.
   */
  function sendTo(id, message) {
    message = decodeURIComponent(message);
    const channel = this.channels.get(id);
    const user = this.users.get(id);
    if (channel) {
      const perms = channel.permissionsFor(this.user);
      if (perms && !perms.has('SEND_MESSAGES')) return false;
      channel.send(message).catch(console.error);
      return true;
    } else if (user) {
      user.send(message).catch(console.error);
    } else {
      return false;
    }
  }

  /**
   * Reply saying "you're welcome" unless another user was mentioned, then thank
   * them instead.
   *
   * @private
   * @type {commandHandler}
   * @param {Discord~Message} msg Message that triggered command.
   * @listens Command#thanks
   * @listens Command#thank
   * @listens Command#thx
   * @listens Command#thankyou
   */
  function commandThankYou(msg) {
    if (msg.mentions.members && msg.mentions.members.size > 0) {
      const mentions = msg.mentions.members.map((el) => {
        return '`' + (el.nickname || el.user.username).replace(/`/g, '`') + '`';
      });
      let mentionString = mentions[0];
      for (let i = 1; i < mentions.length; i++) {
        mentionString += ', ';
        if (i == mentions.length - 1) mentionString += 'and ';
        mentionString += mentions[i];
      }
      msg.channel.send('Thanks ' + mentionString + '!');
    } else {
      msg.channel.send('You\'re welcome! 😀');
    }
  }

  /**
   * Fetch all registered commands and send them to the user.
   *
   * @private
   * @type {commandHandler}
   * @param {Discord~Message} msg Message that triggered command.
   * @listens Command#listCommands
   */
  function commandListCommands(msg) {
    const list = self.command.getAllNames().sort();
    self.common.reply(msg, JSON.stringify(list), list.length);
  }

  /**
   * User has requested to view the current prefix for their guild. This is
   * intended to be fired internally, usually through chatbot.js due to no other
   * way to reference this if the user has forgotten the prefix.
   *
   * @private
   *
   * @type {Command~commandHandler}
   * @param {Discord~Message} msg The message that triggered this command.
   * @listens Command#getPrefix
   */
  function commandGetPrefix(msg) {
    self.common.reply(
        msg, 'The current prefix for this guild is',
        self.bot.getPrefix(msg.guild));
  }

  /**
   * Get the graph of the last few git commits.
   *
   * @private
   *
   * @type {Command~commandHandler}
   * @param {Discord~Message} msg The message that triggered this command.
   * @listens Command#git
   */
  function commandGit(msg) {
    if (msg.author.id === self.common.spikeyId && msg.text.length > 1) {
      childProcess.exec(
          'git' + msg.text, (err, stdout) => {
            if (err) {
              msg.channel.send(`<@${msg.author.id}> ${err.message}`);
            } else {
              stdout = stdout.toString().trim().substr(0, 1900);
              const out = `<@${msg.author.id}> \`\`\`md\n${stdout}\`\`\``;
              msg.channel.send(out);
            }
          });
    } else {
      childProcess.exec(
          'git remote -v && echo "" && ' +
              'git log --oneline --decorate=short --graph --all -20',
          (err, stdout) => {
            if (err) {
              self.error('Failed to fetch the current git status.');
              console.error(err);
              self.common.reply(
                  msg, 'Failed to get the current Git status.', err.message);
            } else {
              msg.channel.send(`<@${msg.author.id}> \`\`\`md\n${stdout}\`\`\``);
            }
          });
    }
  }

  /**
   * Reply with server time and GMT.
   *
   * @private
   *
   * @type {Command~commandHandler}
   * @param {Discord~Message} msg The message that triggered this command.
   * @listens Command#gettime
   */
  function commandGetTime(msg) {
    const now = new Date();
    const nowPST = dateFormat(now, 'default');
    const tz = dateFormat(now, 'Z');
    const nowGMT = dateFormat(now, 'GMT:ddd mmm dd yyyy HH:MM:ss');
    self.common.reply(
        msg, `Server Time: ${tz}`, `${tz}: ${nowPST}\nGMT: ${nowGMT}`);
  }

  /**
   * Trigger fetching the latest version of the bot from git, then tell all
   * shards to reload the changes.
   *
   * @private
   * @type {commandHandler}
   * @param {Discord~Message} msg Message that triggered command.
   * @listens Command#update
   */
  function commandUpdate(msg) {
    if (!self.common.trustedIds.includes(msg.author.id)) {
      self.common.reply(
          msg, 'LOL! Good try!',
          'It appears SpikeyRobot doesn\'t trust you enough with this ' +
              'command. Sorry!');
      return;
    }
    self.log(
        `Triggered update: ${__dirname} <-- DIR | CWD -->${process.cwd()}`);
    self.common.reply(msg, 'Updating from git...').then((msg_) => {
      childProcess.exec('npm run update', function(err, stdout, stderr) {
        if (!err) {
          if (stdout && stdout !== 'null') console.log('STDOUT:', stdout);
          if (stderr && stderr !== 'null') console.error('STDERR:', stderr);

          const noReload = msg.content.indexOf('--noreload') > -1;
          if (!noReload) {
            self.bot.reloadCommon();
            if (self.client.shard) {
              self.client.shard.broadcastEval(
                  'this.reloadUpdatedMainModules()', () => {
                    self.client.shard.broadcastEval(
                        'this.reloadUpdatedSubModules()');
                  });
            } else {
              self.client.reloadUpdatedMainModules();
            }
          }
          try {
            childProcess.execSync(
                'git diff-index --quiet ' +
                (self.bot.version.split('#')[1] || commit) +
                ' -- ./src/SpikeyBot.js');
            const embed = new self.Discord.MessageEmbed();
            embed.setTitle('Bot update complete!');
            embed.setColor([255, 0, 255]);
            if (noReload) embed.setDescription('Modules not reloaded.');
            msg_.edit(self.common.mention(msg), embed);
          } catch (err) {
            if (err.status === 1) {
              const embed = new self.Discord.MessageEmbed();
              embed.setTitle(
                  'Bot update complete, but requires manual reboot.');
              embed.setDescription(err.message);
              embed.setColor([255, 0, 255]);
              msg_.edit(self.common.mention(msg), embed);
            } else {
              self.error(
                  'Checking for SpikeyBot.js changes failed: ' + err.status);
              console.error('STDOUT:', err.stdout.toString());
              console.error('STDERR:', err.stderr.toString());
              const embed = new self.Discord.MessageEmbed();
              embed.setTitle(
                  'Bot update complete, but failed to check if ' +
                  'reboot is necessary.');
              embed.setColor([255, 0, 255]);
              msg_.edit(self.common.mention(msg), embed);
            }
          }
        } else {
          self.error('Failed to pull latest update.');
          console.error(err);
          if (stdout && stdout !== 'null') console.log('STDOUT:', stdout);
          if (stderr && stderr !== 'null') console.error('STDERR:', stderr);
          const embed = new self.Discord.MessageEmbed();
          embed.setTitle('Bot update FAILED!');
          embed.setColor([255, 0, 255]);
          msg_.edit(self.common.mention(msg), embed);
        }
      });
    });
  }

  /**
   * Trigger sweeping of users from cache.
   *
   * @private
   * @type {commandHandler}
   * @param {Discord~Message} msg Message that triggered command.
   * @listens Command#sweep
   */
  function commandSweep(msg) {
    if (msg.author.id != self.common.spikeyId) {
      self.common.reply(msg, 'You can\'t use this command.');
      return;
    }
    const num = self.client.users.size;
    if (self.client.shard) {
      self.client.shard.broadcastEval('this.sweepUsers();')
          .then(() => {
            self.common.reply(
                msg, 'Sweeping users.', `${num} --> ${self.client.users.size}`);
          })
          .catch((err) => {
            self.error('Failed to sweep users on shards.');
            console.error(err);
          });
    } else {
      sweepUsers();
      self.common.reply(
          msg, 'Sweeping users.', `${num} --> ${self.client.users.size}`);
    }
  }
  /**
   * Cause stale users to be purged from cache.
   *
   * @private
   */
  function sweepUsers() {
    // const now = Date.now();
    // const maxMsgAge = 15 * 60 * 1000;
    self.client.users.sweep((user) => {
      /* return user.lastMessage ?
          (now - user.lastMessage.createdTimestamp > maxMsgAge ||
           now - user.lastMessage.editedTimestamp > maxMsgAge) :
          user.presence.status === 'offline'; */
      return user.bot || !user.lastMessage ||
          user.presence.status === 'offline';
    });
  }

  /**
   * Fetch all guilds a user has been banned from that we know of.
   *
   * @private
   * @type {commandHandler}
   * @param {Discord~Message} msg Message that triggered command.
   * @listens Command#listbans
   * @listens Command#bans
   */
  function commandListBans(msg) {
    if (msg.author.id != self.common.spikeyId) {
      self.common.reply(
          msg, 'Sorry, this command was disabled temporarily due to Discord ' +
              'rate limit issues.');
      return;
    }
    const user = msg.softMentions.users.first() || msg.author;
    self.common
        .reply(
            msg, 'Loading ban list...',
            'Please wait, this will take a while.\nBan list updates after ' +
                '1 hour. ')
        .then(() => {
          requestBanList(user.id, (res) => {
            const pairs = Object.entries(res);
            if (pairs.length > 5) {
              self.common.reply(
                  msg, `${user.tag} Known Bans`,
                  `${pairs.length} known servers.`);
              return;
            }
            const out = pairs.map((el) => `${el[0]}: ${el[1]}`).join('\n');
            self.common.reply(msg, `${user.tag} Known Bans`, out || 'None');
          });
        });
  }

  /**
   * Request the ban lists for a user from all shards.
   *
   * @private
   * @param {string} userId The ID of the user to fetch.
   * @param {Function} cb The callback once all requests have completed.
   */
  function requestBanList(userId, cb) {
    if (self.client.shard) {
      const num = self.client.shard.count;
      if (!banListRequests[userId]) {
        banListRequests[userId] = {total: 0, done: 0, callbacks: []};
        delete banListCache[userId];
      } else if (banListRequests[userId].done < banListRequests[userId].total) {
        banListRequests[userId].callbacks.push(cb);
        return;
      }
      banListRequests[userId].callbacks.push(cb);
      self.client.shard
          .broadcastEval(`this.broadcastBanList('${userId}',${num})`)
          .catch((err) => {
            self.error('Failed to broadcast for ban list.');
            console.error(err);
          });
    } else {
      let total = 0;
      let done = 0;
      const res = {};
      self.client.guilds.forEach((g) => {
        total++;
        g.fetchBans().then((bans) => {
          bans.forEach((b) => {
            if (b.user.id != userId) return;
            res[g.id] = b.reason || true;
          });
          done++;
          if (done >= total) cb(res);
        }).catch(() => {
          done++;
          if (done >= total) cb(res);
        });
      });
    }
  }

  /**
   * Fired when shard sends the ban list response data.
   *
   * @private
   * @param {string} userId The ID of the user this data is for.
   * @param {object.<string>} res The response data from a shard.
   */
  function banListResponse(userId, res) {
    if (!banListRequests[userId]) {
      banListRequests[userId] = {total: 0, done: 1, callbacks: []};
    } else {
      banListRequests[userId].done++;
    }
    if (!banListCache[userId]) banListCache[userId] = {};
    if (res) {
      for (const g in res) {
        if (!res[g]) continue;
        banListCache[userId][g] = res[g];
      }
    }
    if (banListRequests[userId].done === banListRequests[userId].total) {
      banListRequests[userId].callbacks.forEach((cb) => {
        try {
          cb(banListCache[userId]);
        } catch (err) {
          self.error('Error while firing callback for ban lists: ' + userId);
          console.error(err);
        }
        delete banListRequests[userId];
      });
    }
  }

  /**
   * Fetch the list of guilds the user has been banned from. Responds through a
   * broadcastEval to all shards with an object mapped by guild ID and the value
   * is the ban reason as a string.
   *
   * @private
   * @param {string} userId The ID of the user to fetch.
   * @param {number} numReq The number of additional responses from other shards
   * should be expected.
   */
  function broadcastBanList(userId, numReq) {
    if (!banListRequests[userId]) {
      banListRequests[userId] = {total: numReq, done: 0, callbacks: []};
    } else {
      banListRequests[userId].total += numReq;
    }
    let total = 0;
    let done = 0;
    const res = {};
    const checkDone = function() {
      done++;
      if (done >= total) {
        self.client.shard.broadcastEval(
            `this.banListResponse('${userId}',${JSON.stringify(res)})`);
      }
    };
    self.client.guilds.forEach((g) => {
      if (!g.me.permissions.has('BAN_MEMBERS')) return;
      total++;
      const now = Date.now();
      if (banListCache[g.id] && banListCache[g.id].timestamp &&
          now - banListCache[g.id].timestamp < 60 * 60 * 1000) {
        res[g.id] = banListCache[g.id].users[userId];
        checkDone();
        return;
      } else if (banListCache[g.id]) {
        banListCache[g.id].users = {};
      }
      g.fetchBans()
          .then((bans) => {
            bans.forEach((b) => {
              if (!banListCache[g.id]) banListCache[g.id] = {users: {}};
              banListCache[g.id].timestamp = now;
              banListCache[g.id].users[b.user.id] = b.reason || true;
              if (b.user.id != userId) return;
              res[g.id] = b.reason || true;
            });
            checkDone();
          })
          .catch((err) => {
            console.error(err);
            if (!banListCache[g.id]) banListCache[g.id] = {users: {}};
            banListCache[g.id].timestamp = now;
            checkDone();
          });
    });
  }

  /**
   * Triggered via SIGINT, SIGHUP or SIGTERM. Saves data before exiting.
   *
   * @private
   * @listens Process#SIGINT
   * @listens Process#SIGHUP
   * @listens Process#SIGTERM
   */
  function sigint() {
    if (self.initialized) {
      self.log('Caught exit!', 'Main');
    } else {
      console.log('Main: Caught exit!');
    }
    try {
      self.save();
    } catch (err) {
      console.log('Main: Failed to save', err);
    }
    try {
      self.end();
    } catch (err) {
      console.log('Main: Failed to shutdown', err);
    }
    process.removeListener('exit', sigint);
    process.exit();
  }

  /**
   * @description Received a message from the shard manager.
   * @private
   * @param {*} args Message received.
   */
  function shardMessage(...args) {
    if (args[0] == 'reboot') {
      process.kill(process.pid, 'SIGINT');
    }
  }
}
module.exports = new Main();
