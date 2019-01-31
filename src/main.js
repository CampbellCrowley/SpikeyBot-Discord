// Copyright 2018 Campbell Crowley. All rights reserved.
// Author: Campbell Crowley (dev@campbellcrowley.com)
const dateFormat = require('dateformat');
const math = require('mathjs');
const algebra = require('algebra.js');
const Jimp = require('jimp');
const fs = require('fs');
const mkdirp = require('mkdirp');
const childProcess = require('child_process');
require('./subModule.js')(Main); // Extends the SubModule class.

math.config({matrix: 'Array'});

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
 * @listens Command#say
 * @listens Command#createDate
 * @listens Command#joinDate
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
 * @listens Command#whoami
 * @listens Command#gettime
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
  require('child_process').exec('git rev-parse HEAD', (err, stdout) => {
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
   * The id of the last user to use the say command.
   *
   * @private
   * @type {string}
   */
  let prevUserSayId = '';
  /**
   * The number of times the say command has been used consecutively by the
   * previous user.
   *
   * @private
   * @type {number}
   */
  let prevUserSayCnt = 0;

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
   * @type {Object.<boolean>}
   */
  const disabledAutoSmite = {};

  /**
   * All guilds that have disabled sending messages when someone is banned.
   *
   * @private
   * @type {Object.<boolean>}
   */
  const disabledBanMessage = {};

  /**
   * The guilds that have disabled the rigged messages.
   *
   * @private
   * @type {Object.<boolean>}
   */
  const disabledRiggedCounter = {};

  /**
   * The guilds with auto-smite enabled, and members who have mentioned
   * @everyone, and the timestamps of these mentions.
   *
   * @private
   * @type {Object.<Object.<string>>}
   */
  const mentionAccumulator = {};

  /**
   * The introduction message the bots sends when pmme is used.
   *
   * @private
   * @type {string}
   * @constant
   */
  const introduction = '\nHello! My name is {username}.\nI was created by ' +
      'SpikeyRobot#0971, so if you wish to add any features, feel free to PM ' +
      'him! (Tip: Use **{prefix}pmspikey**)\n\nThe prefix for commands can ' +
      'be changed with `{prefix}changeprefix`.\nIf you\'d like to know what ' +
      'I can do, type **{prefix}help** in a PM to me and I\'ll let you know!' +
      '\nThe help is also available on my web page: https://www.spikeybot.com/';
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
      'Want to add me to your server? Click this link:\n(You\'ll need to be ' +
      'signed into discord in your browser first)';
  /**
   * The URL that adds the bot to a new server.
   *
   * @private
   * @type {string}
   * @constant
   */
  const addLink = 'https://discordapp.com/oauth2/authorize?' +
      '&client_id={id}&scope=bot';
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
    self.command.on('say', commandSay);
    self.command.on('createdate', commandCreateDate);
    self.command.on('joindate', commandJoinDate, true);
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
    self.command.on('whoami', commandWhoAmI);
    self.command.on('gettime', commandGetTime);

    self.client.on('guildCreate', onGuildCreate);
    self.client.on('guildDelete', onGuildDelete);
    self.client.on('guildBanAdd', onGuildBanAdd);
    self.client.on('message', onMessage);

    // Catch reasons for exiting in order to save first.
    process.on('exit', sigint);
    process.on('SIGINT', sigint);
    process.on('SIGHUP', sigint);
    process.on('SIGTERM', sigint);

    if (!self.client.shard || self.client.shard.id == 0) {
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
      const titleID = encodeURIComponent(obj.title);
      const titleURL = '[web](' + self.common.webHelp + '#' + titleID + ')';
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
      const titleID = encodeURIComponent(obj.title);
      const titleURL = '[web](' + self.common.webHelp + '#' + titleID + ')';
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
       * Receive message from another shard asking for out statistics.
       * @see {@link Main~getStats()}
       *
       * @private
       * @returns {Object} The statistics we collected.
       */
      self.client.getStats = getStats;
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
    self.command.removeListener('say');
    self.command.removeListener('createdate');
    self.command.removeListener('joindate');
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
    self.command.removeListener('whoami');
    self.command.removeListener('gettime');

    self.client.removeListener('guildCreate', onGuildCreate);
    self.client.removeListener('guildDelete', onGuildDelete);
    self.client.removeListener('guildBanAdd', onGuildBanAdd);
    self.client.removeListener('message', onMessage);

    process.removeListener('exit', sigint);
    process.removeListener('SIGINT', sigint);
    process.removeListener('SIGHUP', sigint);
    process.removeListener('SIGTERM', sigint);
  };

  /**
   * Save all data to file.
   *
   * @override
   * @inheritdoc
   */
  this.save = function(opt) {
    if (!self.initialized) return;
    timers.forEach(function(obj) {
      const dir = self.common.userSaveDir + obj.id + '/timers/';
      const filename = dir + obj.time + '.json';
      if (opt == 'async') {
        mkAndWrite(filename, dir, JSON.stringify(obj));
      } else {
        mkAndWriteSync(filename, dir, JSON.stringify(obj));
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
        mkAndWrite(filename, dir, JSON.stringify(obj));
      } else {
        mkAndWriteSync(filename, dir, JSON.stringify(obj));
      }
    });
    if (!self.client.shard || self.client.shard.id == 0) {
      const dir = './save/';
      const filename = dir + 'rigged-counter.txt';
      if (opt == 'async') {
        mkAndWrite(filename, dir, self.client.riggedCounter + '');
      } else {
        mkAndWriteSync(filename, dir, self.client.riggedCounter + '');
      }
    }
  };

  /**
   * Write data to a file and make sure the directory exists or create it if it
   * doesn't. Async
   * @see {@link Main~mkAndWriteSync}
   *
   * @private
   * @param {string} filename The name of the file including the directory.
   * @param {string} dir The directory path without the file's name.
   * @param {string} data The data to write to the file.
   */
  function mkAndWrite(filename, dir, data) {
    mkdirp(dir, function(err) {
      if (err) {
        self.error('Failed to make directory: ' + dir, 'Main');
        console.error(err);
        return;
      }
      fs.writeFile(filename, data, function(err2) {
        if (err2) {
          self.error('Failed to save timer: ' + filename, 'Main');
          console.error(err2);
          return;
        }
      });
    });
  }
  /**
   * Write data to a file and make sure the directory exists or create it if it
   * doesn't. Synchronous
   * @see {@link Main~mkAndWrite}
   *
   * @private
   * @param {string} filename The name of the file including the directory.
   * @param {string} dir The directory path without the file's name.
   * @param {string} data The data to write to the file.
   */
  function mkAndWriteSync(filename, dir, data) {
    try {
      mkdirp.sync(dir);
    } catch (err) {
      self.error('Failed to make directory: ' + dir, 'Main');
      console.error(err);
      return;
    }
    try {
      fs.writeFileSync(filename, data);
    } catch (err) {
      self.error('Failed to save timer: ' + filename, 'Main');
      console.error(err);
      return;
    }
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
    let channel = '';
    let pos = -1;
    try {
      guild.channels.forEach(function(val, key) {
        if (val.type == 'text') {
          const perms = val.permissionsFor(self.client.user);
          if ((pos == -1 || val.position < pos) && perms &&
              perms.has(self.Discord.Permissions.FLAGS.SEND_MESSAGES)) {
            pos = val.position;
            channel = val.id;
          }
        }
      });
      if (!channel || pos < 0) {
        self.error(
            'Unable to send welcome message in new guild due to no ' +
            'available channel: ' + guild.id);
        return;
      }
      self.client.channels.get(channel).send(
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
    if (user.id == self.client.id) return;
    if (disabledBanMessage[guild.id]) return;
    if (!guild.me.hasPermission(
        self.Discord.Permissions.FLAGS.VIEW_AUDIT_LOG)) {
      return;
    }
    let channel = '';
    let pos = -1;
    try {
      guild.channels.forEach(function(val, key) {
        if (val.type != 'voice' && val.type != 'category') {
          if ((pos == -1 || val.position < pos) &&
              val.permissionsFor(self.client.user)
                  .has(self.Discord.Permissions.FLAGS.SEND_MESSAGES)) {
            pos = val.position;
            channel = val.id;
          }
        }
      });
      guild.fetchAuditLogs({limit: 1})
          .then((logs) => {
            if (logs.entries.first().executor.id !== self.client.user.id) {
              self.client.channels.get(channel).send(
                  '`Poof! ' + logs.entries.first().executor.username +
                  ' has ensured ' + user.username +
                  ' will never be seen again...`\nAdmins can disable these ' +
                  'messages with `' + self.bot.getPrefix(guild.id) +
                  'togglebanmessages`.');
            }
          })
          .catch((err) => {
            self.client.channels.get(channel).send(
                '`Poof! ' + user.username + ' was never seen again...`');
            self.error('Failed to find executor of ban.');
            console.log(err);
          });
    } catch (err) {
      self.error('Failed to send ban from guild:' + guild.id);
      console.log(err);
    }
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
    if (msg.author.id != self.client.user.id &&
        msg.author.id != self.common.spikeyId) {
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
          self.debug(
              'Rigged count: ' + self.client.riggedCounter + ' + ' +
              matchCount + ': ' + msg.content.replace(/\n/g, '\\n'));
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

    if (msg.content.endsWith(', I\'m Dad!')) {
      msg.channel.send('Hi Dad, I\'m Spikey!');
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
          msg.guild.roles.forEach(function(val, key) {
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
      msg.content = msg.prefix + 'd ' + msg.content;
      self.command.trigger('d', msg);
    }
  }

  /**
   * Returns the percentage of how similar the two given strings are.
   *
   * @private
   * @param {string} s1
   * @param {string} s2
   * @return {number}
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
   * Calculates the edit distance between the two strings.
   *
   * @private
   * @param {string} s1
   * @param {string} s2
   * @return {number}
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
    self.common.reply(
        msg, addmessage, addLink.replace(/\{id\}/g, self.client.user.id));
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
   * @return {string} Simplified formula.
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
    const equation = msg.text;
    const variables = equation.match(/[A-Za-z]+/gm);
    const equals = equation.match(/=/g);
    if (!variables || variables.length < 1) {
      self.common.reply(
          msg, 'Please ensure you have at least one variable in the equation.');
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
      let formula = msg.text;
      if (formula.indexOf('=') > -1) {
        const split = formula.split('=');
        formula = split[1] + ' - (' + split[0] + ')';
      }
      let simplified = math.eval(formula).toString();
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
        domainMin = math.eval(domainTemp[1]);
        domainMax = math.eval(domainTemp[2]);
      } else {
        domainMin = -10;
        domainMax = 10;
      }
      if (rangeTemp !== null && rangeTemp.length == 3) {
        rangeMin = math.eval(rangeTemp[1]);
        rangeMax = math.eval(rangeTemp[2]);
      }
      xVal = math.range(
          domainMin, domainMax, (domainMax - domainMin) / graphSize / dotSize);
      yVal = xVal.map(function(x) {
        return expr.eval({x: x});
      });
      try {
        let formula = expression;
        if (formula.indexOf('=') > -1) {
          const split = formula.split('=');
          formula = split[1] + ' - (' + split[0] + ')';
        }
        const exprSlope = math.derivative(formula, 'x');
        ypVal = xVal.map(function(x) {
          return exprSlope.eval({x: x});
        });
      } catch (err) {
        console.log(err);
        msg.channel.send('Failed to derive given equation. ' + err.message);
        ypVal = xVal.map(function(x) {
          return 1;
        });
      }
    } catch (err) {
      self.common.reply(msg, err.message);
      return;
    }
    const finalImage = new Jimp(graphSize, graphSize, 0xFFFFFFFF);
    let minY = 0;
    let maxY = 0;
    if (typeof rangeMin === 'undefined') {
      yVal.forEach(function(obj) {
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
    finalImage.getBuffer(Jimp.MIME_PNG, function(err, out) {
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
          timers
              .filter(function(obj) {
                return obj.id == msg.author.id;
              })
              .map(function(obj) {
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
   * The user's message will be deleted and the bot will send an identical
   * message
   * without the command to make it seem like the bot sent the message.
   *
   * @private
   * @type {commandHandler}
   * @param {Discord~Message} msg Message that triggered command.
   * @listens Command#say
   */
  function commandSay(msg) {
    if (msg.delete) msg.delete().catch(() => {});
    const content = msg.text.trim();
    msg.channel.send(content || '\u200B').catch((err) => {
      self.warn(
          'Failed to send message in channel: ' + msg.channel.id + ': ' +
          content);
      console.error(err);
    });
    if (msg.fabricated || prevUserSayId != msg.author.id) {
      prevUserSayId = msg.author.id;
      prevUserSayCnt = 0;
    }
    prevUserSayCnt++;
    if (prevUserSayCnt % 3 === 0) {
      msg.channel.send(
          'Help! ' + self.common.mention(msg) +
          ' is putting words into my mouth!');
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
    if (msg.mentions.users.size === 0) {
      self.common.reply(
          msg, 'You created your discord account on ' +
              dateFormat(msg.author.createdTimestamp));
    } else {
      self.common.reply(
          msg, msg.mentions.users.first().username +
              ' created their discord account on ' +
              dateFormat(msg.mentions.users.first().createdTimestamp));
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
    if (msg.mentions.users.size === 0) {
      self.common.reply(
          msg, 'You joined this server on ' +
              dateFormat(msg.member.joinedTimestamp));
    } else {
      self.common.reply(
          msg, msg.mentions.users.first().username + ' joined this server on ' +
              dateFormat(msg.mentions.users.first().joinedTimestamp));
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
          msg, 'Please write a message to send after the command.',
          msg.prefix + 'pmspikey The bot is on fire!');
      return;
    }
    self.client.users.fetch(self.common.spikeyId)
        .then((user) => {
          user.send(msg.author.id + ': ' + msg.author.tag + ': ' + msg.content)
              .then(() => {
                self.common.reply(msg, 'I sent your message to SpikeyRobot.');
              });
        })
        .catch((err) => {
          console.log(err);
          self.common.reply(
              msg,
              'Something went wrong and I couldn\'t send your message. Sorry ' +
                  'that\'s all I know :(');
        });
  }
  /**
   * Send a PM to a mentioned user semi-anonymously. Messages are copied to
   * SpikeyRobot to monitor for abuse. This command only works for 3 people.
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
    const rand = Math.round(Math.random());
    let url = 'https://www.campbellcrowley.com/heads.png';
    let text = 'Heads!';
    if (rand) {
      url = 'https://www.campbellcrowley.com/tails.png';
      text = 'Tails!';
    }
    const embed = new self.Discord.MessageEmbed({title: text});
    embed.setImage(url);
    msg.channel.send(embed);
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
      self.common.reply(
          msg,
          'I\'m sorry, but I don\'t have permission to delete messages in ' +
              'this channel.\nTo allow me to do this, please give me ' +
              'permission to Manage Messages.');
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
        msg.channel.bulkDelete(num).then(() => {
          if (limited) {
            self.common.reply(
                msg, 'Number of messages deleted limited to 100.');
          }
        });
      }
    }
  }
  /**
   * Ban a mentioed user and send a message saying they were banned.
   *
   * @private
   * @type {commandHandler}
   * @param {Discord~Message} msg Message that triggered command.
   * @listens Command#ban
   */
  function commandBan(msg) {
    if (msg.mentions.members.size === 0) {
      self.common
          .reply(msg, 'You must mention someone to ban after the command.')
          .catch(() => {});
    } else {
      const reason =
          msg.text.replace(self.Discord.MessageMentions.USERS_PATTERN, '')
              .trim();
      msg.mentions.members.forEach(function(toBan) {
        if (msg.guild.ownerID !== msg.author.id &&
            msg.member.roles.highest.comparePositionTo(toBan.roles.highest) <=
                0) {
          self.common
              .reply(
                  msg, 'You can\'t ban ' + toBan.user.username +
                      '! You are not stronger than them!')
              .catch(() => {});
        } else {
          msg.guild.members.fetch(self.client.user).then((me) => {
            const myRole = me.roles.highest;
            if (toBan.roles.highest &&
                myRole.comparePositionTo(toBan.roles.highest) <= 0) {
              self.common
                  .reply(
                      msg, 'I can\'t ban ' + toBan.user.username +
                          '! I am not strong enough!')
                  .catch(() => {});
            } else {
              const banMsg =
                  banMsgs[Math.floor(Math.random() * banMsgs.length)];
              toBan.ban({reason: reason || banMsg})
                  .then(() => {
                    self.common
                        .reply(msg, banMsg, 'Banned ' + toBan.user.username)
                        .catch(() => {});
                  })
                  .catch((err) => {
                    self.common
                        .reply(
                            msg, 'Oops! I wasn\'t able to ban ' +
                                toBan.user.username +
                                '! I\'m not sure why though!')
                        .catch(() => {});
                    self.error('Failed to ban user.');
                    console.log(err);
                  });
            }
          });
        }
      });
    }
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
          msg, 'You must mention someone to ban after the command.');
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
            msg.guild.roles.forEach(function(val, key) {
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
    if (self.client.ping) {
      self.common.reply(
          msg, 'My ping is ' + self.client.ping + 'ms',
          '`' + JSON.stringify(self.client.pings) + '`');
    } else {
      self.common.reply(msg, 'My ping is ' + self.client.ws.ping + 'ms');
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
   * @typedef {Object} Main~Timer
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
    self.client.setTimeout(function() {
      self.client.users.fetch(timer.id).then((user) => {
        user.send(timer.message);
        const now = Date.now();
        timers = timers.filter(function(obj) {
          return obj.time > now;
        });
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
          for (let j = 0; j < match[3] - 1; j++) {
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

    if (allSame && numbers.length > 1) {
      let sum = 0;
      let max = 0;
      let min = outcomes[0];
      const outList = outcomes.slice(0);
      numbers.forEach((el, i) => {
        sum += outcomes[i];
        max = Math.max(max, outcomes[i]);
        min = Math.min(min, outcomes[i]);
      });

      embed.setDescription(outList.join(', '));
      if (outList.length > 3) {
        embed.setFooter(
            'Sum: ' + sum + ', Max: ' + max + ', Min: ' + min + ', Avg: ' +
            (sum / outList.length));
      } else {
        embed.setFooter('Sum: ' + sum);
      }
    } else if (!allSame && numbers.length > 1) {
      let sum = 0;
      let max = 0;
      let min = outcomes[0];
      const outList = numbers.map((el, i) => {
        sum += outcomes[i];
        max = Math.max(max, outcomes[i]);
        min = Math.min(min, outcomes[i]);
        return el + ' --> ' + outcomes[i];
      });

      embed.setDescription('{sides} --> {rolled}\n' + outList.join('\n'));
      if (outList.length > 3) {
        embed.setFooter(
            'Sum: ' + sum + ', Max: ' + max + ', Min: ' + min + ', Avg: ' +
            (sum / outList.length));
      } else {
        embed.setFooter('Sum: ' + sum);
      }
    } else {
      embed.setDescription('Rolled: ' + outcomes[0]);
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
    const mem = msg.member;
    let author = msg.author;

    const id = msg.text.trim();
    if (self.common.spikeyId == msg.author.id && id) {
      author = null;
      chan = self.client.channels.get(id);
      guild = (chan && chan.guild) || self.client.guilds.get(id);
      if (!guild) {
        self.common.reply(
            msg, 'Failed to find channel or guild with that ID.', msg.text);
        return;
      }
    }

    const embed = new self.Discord.MessageEmbed();
    embed.setTitle('Permissions');
    if (chan) {
      embed.addField(
          'Channel ' + chan.id, '```css\n' +
              (author ?
                   prePad(
                       chan.permissionsFor(author).bitfield.toString(2), 31) +
                       ' You\n' :
                   '') +
              prePad(chan.permissionsFor(self.client.user).bitfield.toString(2),
                  31) +
              ' Me```');
    }
    embed.addField(
        'Guild ' + guild.id,
        '```css\n' +
            (author ?
                 prePad(mem.permissions.bitfield.toString(2), 31) + ' You\n' :
                 '') +
            prePad(
                guild.member(self.client.user).permissions.bitfield.toString(2),
                31) +
            ' Me```');

    const allPermPairs = Object.entries(self.Discord.Permissions.FLAGS);
    const formatted = allPermPairs.map((el) => {
      return prePad(el[1].toString(2), 31) + ' ' + el[0];
    }).join('\n');
    embed.setDescription('```css\n' + formatted + '```');
    embed.setFooter(
        'To see permissions for each command type: `' + msg.prefix + 'show`');

    msg.channel.send(embed);
  }
  /**
   * Pad a number with leading zeroes so that it is `digits` long.
   *
   * @private
   * @param {string|number} num The number to pad with zeroes.
   * @param {number} digits The minimum number of digits to make the output
   * have.
   * @return {string} The padded string.
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
      const embed = new self.Discord.MessageEmbed();
      embed.setTitle('SpikeyBot Stats');
      embed.setDescription(
          'These statistics are collected from the entire bot, ' +
          'across all shards.');

      const guildString = 'Number of guilds: ' + values.numGuilds +
          '\nLargest Guild: ' + values.numLargestGuild +
          ' members\nNumber of channels: ' + values.numChannels;
      embed.addField('Guilds', guildString, true);

      const userString = 'Number of users: ' + values.numMembers +
          '\nNumber of cached users: ' + values.numUsers +
          '\nNumber of users that are bots: ' + values.numBots +
          '\nNumber of online users: ' + values.numUsersOnline;
      embed.addField('Users', userString, true);

      const actString = 'Number of activities people are doing: ' +
          Object.keys(values.activities).length +
          '\nMost popular activity:\n`' + values.largestActivity.name +
          '`\n with ' + values.largestActivity.count + ' people.';
      embed.addField('Activities/Games', actString, true);

      const shardUptimes = values.uptimes.map((el, i) => {
        return 'Shard #' + i + ' (' + values.versions[i] + ')\n- up ' + el;
      });
      const shardString = 'Number of shards: ' + values.numShards +
          '\nThis guild/channel is in shard #' + values.reqShard + '\n' +
          shardUptimes.join('\n');
      embed.addField('Shards', shardString, true);

      /* embed.addField(
          'This Shard Version',
          'Shard: ' + version + '\nCommit: ' + commit.slice(0, 7) +
              '\nDiscord.js: ' + (self.Discord.version || 'Unknown') + '\n' +
              self.bot.getSubmoduleCommits()
                  .map((el) => {
                    return el.name + ': ' + el.commit;
                  })
                  .join('\n'),
          true); */

      embed.setColor([0, 100, 255]);

      msg.channel.stopTyping();
      msg.channel.send(self.common.mention(msg), embed);
    });
  }

  /**
   * Fetch the bot's stats from all shards, then combine the data. Public as
   * SpikeyBot.getStats after SubModule.initialize.
   * @private
   * @param {function} cb One parameter that is guarunteed to have an array of
   * stats objeccts.
   */
  function getAllStats(cb) {
    const startTime = Date.now();
    /**
     * The stats object that is the result of this function.
     * @private
     * @default
     */
    const values = {
      numGuilds: 0,
      numLargestGuild: 0,
      shardGuilds: {},
      numUsers: 0,
      numMembers: 0,
      numBots: 0,
      numUsersOnline: 0,
      numChannels: 0,
      uptimes: [],
      activities: {},
      largestActivity: {name: 'Nothing', count: 0},
      versions: [],
      numShards: 0,
      reqShard: 0,
      fullDelta: 0,
    };
    if (self.client.shard) {
      values.numShards = self.client.shard.count;
      values.reqShard = self.client.shard.id;
    }
    /**
     * Callback once all shards have replied with their stats.
     *
     * @private
     * @param {Array.<Object>} res Array of each response object.
     */
    function statsResponse(res) {
      const parseStart = Date.now();
      const delays = new Array(res.length);
      values.uptimes = new Array(res.length);
      values.versions = new Array(res.length);

      const tempActs = {};
      const tempOffline = {};

      for (let i = 0; i < res.length; i++) {
        values.numGuilds += res[i].numGuilds;
        values.shardGuilds[i] = res[i].numGuilds;
        values.numLargestGuild =
            Math.max(res[i].numLargestGuild, values.numLargestGuild);
        values.numUsers += res[i].numUsers;
        values.numMembers += res[i].numMembers;
        values.numBots += res[i].numBots;
        values.numUsersOnline += res[i].numUsersOnline;
        values.numChannels += res[i].numChannels;
        values.uptimes[i] = res[i].uptime;
        values.versions[i] = res[i].version;
        const actVals = Object.entries(res[i].activities);
        for (let j = 0; j < actVals.length; j++) {
          if (tempActs[actVals[j][0]]) {
            Object.assign(tempActs[actVals[j][0]], actVals[j][1]);
          } else {
            tempActs[actVals[j][0]] = actVals[j][1];
          }
        }
        Object.assign(tempOffline, res[i].usersOffline);
        delays[i] = res[i].deltaString;
      }
      values.numUsersOnline = values.numUsers - Object.keys(tempOffline).length;
      const tmpVals = Object.entries(tempActs);
      for (let i = 0; i < tmpVals.length; i++) {
        const count = Object.keys(tmpVals[i][1]).length;
        values.activities[tmpVals[i][0]] = count;

        if (count > values.largestActivity.count) {
          values.largestActivity = {
            name: tmpVals[i][0],
            count: count,
          };
        }
      }
      values.fullDelta = Date.now() - startTime;
      self.debug(
          'Full getStats() delta (ms): ' + values.fullDelta + ' Parse: ' +
          (Date.now() - parseStart) + ' Shards: ' + JSON.stringify(delays));
      cb(values);
    }

    if (self.client.shard) {
      self.client.shard.broadcastEval('this.getStats()').then(statsResponse);
    } else {
      statsResponse([getStats()]);
    }
  }
  /**
   * Fetch our statistics about the bot on this shard.
   *
   * @private
   * @return {Object} The statistics we collected.
   */
  function getStats() {
    const startTime = Date.now();
    const out = {
      numGuilds: 0,
      numLargestGuild: 0,
      numUsers: 0,
      numMembers: 0,
      numBots: 0,
      numChannels: 0,
      usersOffline: {},
      uptime: '0 days',
      activities: {},
      version: version + '#' + commit.slice(0, 7),
      shardId: (self.client.shard || {id: 0}).id,
    };

    out.numGuilds = self.client.guilds.size;
    let maxNum = 0;
    let totalNum = 0;

    let iTime = Date.now();
    self.client.guilds.forEach((g) => {
      maxNum = Math.max(g.memberCount, maxNum);
      totalNum += g.memberCount;

      g.presences.forEach((p) => {
        if (p.status === 'offline') {
          out.usersOffline[p.userID] = 1;
          return;
        }
        if (!p.activity || p.user.bot) return;
        const name = p.activity.name;
        if (!out.activities[name]) out.activities[name] = {};
        out.activities[name][p.userID] = 1;
      });
    });
    const guildDelta = Date.now() - iTime;
    out.numMembers = totalNum;
    out.numLargestGuild = maxNum;

    iTime = Date.now();
    self.client.users.forEach((u) => {
      if (u.bot) out.numBots++;
    });
    const userDelta = Date.now() - iTime;

    out.numUsers = self.client.users.size;
    out.numChannels = self.client.channels.size;

    const ut = self.client.uptime;
    out.uptime = Math.floor(ut / 1000 / 60 / 60 / 24) + ' Days, ' +
        Math.floor(ut / 1000 / 60 / 60) % 24 + ' Hours';
    out.delta = Date.now() - startTime;
    out.deltaString = 'a' + out.delta + 'g' + guildDelta + 'u' + userDelta;
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

    const user = self.client.users.get(id);
    const guild = self.client.guilds.get(id);
    const channel = self.client.channels.get(id);

    if (user) {
      const guilds = [];
      self.client.guilds.forEach((g) => {
        if (g.members.get(id)) guilds.push(g.id);
      });
      msg.channel.send(
          id + ': User: `' + user.tag.replace(/`/g, '\\`') + '`' +
          (user.bot ? ' (bot)' : '') + ' has ' + guilds.length +
          ' mutual guilds:\n```' + guilds.join(', ') + '```');
    }
    if (channel) {
      if (channel.guild) {
        let additional = '';
        if (msg.author.id === self.common.spikeyId) {
          if (channel.members.size > 15) {
            additional = '\nMany Members';
          } else {
            additional = '\nMembers: ' +
                channel.members
                    .map((m) => {
                      return m.id + (m.user.bot ? ' (bot)' : '');
                    })
                    .join(', ');
          }
        }
        msg.channel.send(
            id + ': Guild ' + channel.type + ' Channel: `' +
            channel.name.replace(/`/g, '\\`') + '` with ' +
            channel.members.size + ' members, in guild `' +
            channel.guild.name.replace(/`/g, '\\`') + '` (' + channel.guild.id +
            ')' + additional);
      } else {
        msg.channel.send(
            id + ': Channel: `' + channel.name.replace(/`/g, '\\`') + '`');
      }
    }
    if (guild) {
      msg.channel.send(
          id + ': Guild: `' + guild.name.replace(/`/g, '\\`') + '` has ' +
          guild.members.size + ' members.');
    }

    if (!user && !guild && !channel) {
      self.client.users.fetch(id)
          .then((user) => {
            msg.channel.send(
                id + ': User: `' + user.tag.replace(/`/g, '\\`') + '`' +
                (user.bot ? ' (bot)' : ''));
          })
          .catch((err) => {
            self.error('Failed to lookup id: ' + id);
            // console.error(err);
            msg.channel.send(id + ' Failed to be looked up.');
          });
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
    if (msg.author.id != self.common.spikeyId) return;
    const idString = (msg.text.split(' ')[1] || '').replace(/^@|^<@|>$/g, '');
    if (!idString) {
      self.common.reply(msg, 'Please specify a channel and a message.');
      return;
    }
    const channel = self.client.channels.get(idString);
    const user = self.client.users.get(idString);
    if (channel) {
      channel.send(msg.text.split(' ').slice(2).join(' '))
          .then(() => {
            self.common.reply(msg, 'Message sent!');
          })
          .catch((err) => {
            self.common.reply(
                msg, 'Oops! I am unable to send a message to that channel!',
                err.message);
          });
    } else if (user) {
      user.send(msg.text.split(' ').slice(2).join(' '))
          .then(() => {
            self.common.reply(msg, 'Message sent!');
          })
          .catch((err) => {
            self.common.reply(
                msg, 'Oops! I am unable to send a message to that user!',
                err.message);
          });
    } else {
      self.common.reply(msg, 'I am unable to find that user or channel. :(');
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
   * @private
   *
   * @type {Command~commandHandler}
   * @param {Discord~Message} msg The message that triggered this command.
   * @listens Command#git
   */
  function commandGit(msg) {
    if (msg.author.id === self.common.spikeyId && msg.text.length > 1) {
      childProcess.exec(
          'git' + msg.text, (err, stdout, stderr) => {
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
          (err, stdout, stderr) => {
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
   * Tell the user who they are.
   * @private
   *
   * @type {Command~commandHandler}
   * @param {Discord~Message} msg The message that triggered this command.
   * @listens Command#whoami
   */
  function commandWhoAmI(msg) {
    self.common.reply(
        msg, msg.author.username, msg.author.username + '#' +
            msg.author.descriminator + ' / ' + msg.author.tag + ' (' +
            msg.member.nickname + ')');
  }

  /**
   * Reply with server time and GMT.
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
}
module.exports = new Main();
