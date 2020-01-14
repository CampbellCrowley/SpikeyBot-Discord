// Copyright 2018-2019 Campbell Crowley. All rights reserved.
// Author: Campbell Crowley (dev@campbellcrowley.com)
/**
 * DiscordJS base object.
 *
 * @external Discord
 * @see {@link https://discord.js.org/}
 */
const Discord = require('discord.js');
const fs = require('fs');
const mkdirp = require('mkdirp');
const childProcess = require('child_process');
// Auth is not constant and will be reloaded with common.js.
let auth = require('../auth.js');
// common.js is also required, but is managed within the SpikeyBot class.

/**
 * Handler for an unhandledRejection or uncaughtException, to prevent the bot
 * from silently crashing without an error.
 *
 * @private
 * @param {...*} args All information to log.
 * @listens Process#unhandledRejection
 * @listens Process#uncaughtException
 */
function unhandledRejection(...args) {
  const pid = ('00000' + process.pid).slice(-5);
  if (args[0] && args[0].name == 'DiscordAPIError') {
    const e = args[0];
    const str = `ERR:${pid} Uncaught ${e.name}: ${e.message} ` +
        `${e.method} ${e.code} (${e.path})`;
    console.log(str);
  } else if (args[0] && args[0].message == 'No Perms') {
    console.log(`ERR:${pid}`, args[0]);
  } else {
    console.log(`ERR:${pid}`, 'Uncaught', args[0]);
  }
}
process.on('unhandledRejection', unhandledRejection);
process.on('uncaughtException', unhandledRejection);

// Catch MaxListenersExceededWarning and provide more useful information.
const EventEmitter = require('events').EventEmitter;
const originalAddListener = EventEmitter.prototype.addListener;
/* eslint-disable no-invalid-this */
const addListener = function(...args) {
  originalAddListener.apply(this, args);
  const type = args[0];

  const numListeners = this.listeners(type).length;
  const max = typeof this._maxListeners === 'number' ? this._maxListeners : 10;

  if (max !== 0 && numListeners > max) {
    const error = new Error(
        'Too many listeners of type "' + type +
        '" added to EventEmitter. Max is ' + max + ' and we\'ve added ' +
        numListeners + '.');
    throw error;
  }

  return this;
};
/* eslint-enable no-invalid-this */
EventEmitter.prototype.addListener = addListener;
EventEmitter.prototype.on = addListener;

/**
 * @classdesc Main class that manages the bot.
 * @class
 * @listens Discord~Client#ready
 * @listens Discord~Client#message
 * @listens Command#updateGame
 * @listens Command#reboot
 * @listens Command#mainreload
 */
function SpikeyBot() {
  const self = this;
  /**
   * The current bot version parsed from package.json.
   *
   * @public
   * @type {string}
   * @constant
   */
  this.version = JSON.parse(fs.readFileSync('package.json')).version + '#' +
      childProcess.execSync('git rev-parse --short HEAD').toString().trim();

  /**
   * Timestamp at which this process was started.
   *
   * @public
   * @type {number}
   * @constant
   */
  this.startTimestamp = Date.now();

  /**
   * Is the bot currently responding as a unit test.
   *
   * @private
   * @type {boolean}
   */
  let testMode = false;
  /**
   * Is the bot started with the intent of solely running a unit test. Reduces
   * messages sent that are unnecessary.
   *
   * @private
   * @type {boolean}
   */
  let testInstance = false;

  /**
   * The filename of the Command mainModule.
   *
   * @private
   * @constant
   * @default
   * @type {string}
   */
  const commandFilename = './commands.js';
  /**
   * The filename of the SMLoader mainModule.
   *
   * @private
   * @constant
   * @default
   * @type {string}
   */
  const smLoaderFilename = './smLoader.js';
  /**
   * Filename without file extension where information about the bot rebooting
   * is stored.
   *
   * @see {@link fullRebootFilename}
   *
   * @private
   * @constant
   * @default
   * @type {string}
   */
  const rebootFilename = './save/reboot';
  /**
   * The current instance of Command.
   *
   * @private
   * @type {Command}
   */
  let command;
  /**
   * The current instance of SMLoader.
   *
   * @private
   * @type {SMLoader}
   */
  let smLoader;
  /**
   * Filename of which to load additional MainModule names. The file must be a
   * valid JSON array of strings.
   *
   * @private
   * @constant
   * @default
   * @type {string}
   */
  const mainModuleListFile = './mainModules.json';
  /**
   * The list of all mainModules to load. Always includes
   * {@link SpikeyBot~commandFilename} and {@link SpikeyBot~smListFilename}.
   * Additional mainModules can be loaded from
   * {@link SpikeyBot~mainModuleListFile}.
   *
   * @private
   * @type {string[]}
   */
  let mainModuleNames = [commandFilename, smLoaderFilename];
  try {
    mainModuleNames =
        mainModuleNames.concat(JSON.parse(fs.readFileSync(mainModuleListFile)));
  } catch (err) {
    if (err.code !== 'ENOENT') {
      console.error(err);
    }
  }
  /**
   * Is this bot running in development mode.
   *
   * @private
   * @type {boolean}
   */
  let setDev = false;
  /**
   * Is this bot managing backup status monitoring.
   *
   * @private
   * @type {boolean}
   */
  let isBackup = false;
  /**
   * Should this bot only load minimal features as to not overlap with multiple
   * instances.
   *
   * @private
   * @type {boolean}
   */
  let minimal = false;
  /**
   * Instances of MainModules currently loaded.
   *
   * @private
   * @type {MainModule[]}
   */
  const mainModules = [];
  /**
   * Reason the bot was disconnected from Discord's servers.
   *
   * @private
   * @default
   * @type {?string}
   */
  let disconnectReason = null;
  /**
   * Whether or not to spawn the bot as multiple shards. Enabled with `--shards`
   * cli argument.
   *
   * @private
   * @default
   * @type {boolean}
   */
  let enableSharding = false;
  /**
   * The number of shards to use if sharding is enabled. 0 to let Discord
   * decide. Set from `--shards=#` cli argument.
   *
   * @private
   * @default
   * @type {number}
   */
  let numShards = 0;
  /**
   * The shard ID of this process. This is passed from the Shard Master in some
   * form, or specified manually via `--shardid=` cli argument.
   *
   * @private
   * @default
   * @type {?number}
   */
  let shardId = null;

  /**
   * Number of bytes to allocate for each shard memory. Passed as
   * `--max-old-space-size=` to the spawned node process. Null for default.
   *
   * @private
   * @default
   * @type {?number}
   */
  let shardMem = null;

  /**
   * The name of the client secret to use. Defaults to release either release or
   * dev depending on the --dev flag.
   *
   * @private
   * @default
   * @type {string}
   */
  let botName = null;

  /**
   * Number of milliseconds to delay the call to client.login in order to
   * prevent race conditions of multiple bots in the same directory. This is set
   * with the `--delay` flag. `--delay` with no value will default to 5000
   * milliseconds.
   *
   * @private
   * @default
   * @type {number}
   */
  let delayBoot = 0;

  /**
   * Enable inspecting/profiling for a shard to launch. Set via cli flags, -1 to
   * disable. Currently only supports enabling. The `--inspect` flag will be
   * sent to all shards that are started. This is due to limitations of
   * {@link external:Discord~ShardingManager}.
   *
   * @private
   * @default
   * @type {number}
   */
  let inspectShard = -1;

  /**
   * Is the bot currently rebooting.
   *
   * @private
   * @default
   * @type {boolean}
   */
  let rebooting = false;

  /**
   * Getter for the bot's name. If name is null, it is most likely because there
   * is no custom name and common.isRelease should be used instead.
   *
   * @see {@link SpikeyBot~botName}
   *
   * @public
   * @returns {?string} The bot's name or null if it has not been defined yet or
   * there is no custom name.
   */
  this.getBotName = function() {
    if (isBackup) return 'FALLBACK';
    return botName;
  };

  /**
   * Getter for the bot's name. If botName is null, this will give either
   * `release` or `dev`.
   *
   * @see {@link SpikeyBot~botName}
   *
   * @public
   * @returns {string} The bot's name.
   */
  this.getFullBotName = function() {
    if (isBackup) return 'FALLBACK';
    return botName || (isDev ? 'dev' : 'release');
  };

  // Parse cli args.
  for (let i = 2; i < process.argv.length; i++) {
    if (process.argv[i] === '--dev') {
      setDev = true;
    } else if (process.argv[i].startsWith('--botname')) {
      if (process.argv[i].indexOf('=') > -1) {
        botName = process.argv[i].split('=')[1] || '';
      } else if (process.argv.length > i + 1) {
        botName = process.argv[i + 1] || '';
        i++;
      }
    } else if (process.argv[i] === '--minimal') {
      minimal = true;
    } else if (process.argv[i] === '--test') {
      testInstance = true;
    } else if (process.argv[i].startsWith('--shards')) {
      enableSharding = true;
      if (process.argv[i].indexOf('=') > -1) {
        numShards = process.argv[i].split('=')[1] * 1 || 0;
      }
    } else if (process.argv[i].startsWith('--shardmem')) {
      if (process.argv[i].indexOf('=') > -1) {
        shardMem = process.argv[i].split('=')[1] * 1 || null;
      }
      if (!shardMem) {
        throw new Error(`Bad Memory Amount '${process.argv[i]}'`);
      }
    } else if (process.argv[i].startsWith('--shardid')) {
      if (process.argv[i].indexOf('=') > -1) {
        shardId = process.argv[i].split('=')[1] * 1 || null;
      }
      if (!shardId) {
        throw new Error(`Bad Shard ID '${process.argv[i]}'`);
      }
    } else if (process.argv[i] === '--backup') {
      isBackup = true;
    } else if (process.argv[i].startsWith('--delay')) {
      delayBoot = 5000;
      if (process.argv[i].indexOf('=') > -1) {
        delayBoot = process.argv[i].split('=')[1] * 1 || 0;
      }
    } else if (process.argv[i].startsWith('--inspect')) {
      inspectShard = 0;
      if (process.argv[i].indexOf('=') > -1) {
        inspectShard = process.argv[i].split('=')[1] * 1 || 0;
      }
    } else {
      throw new Error(`Unrecognized argument '${process.argv[i]}'`);
    }
  }

  const isDev = setDev;

  let common;
  /**
   * Delete cache and re-require common.js and auth.js.
   *
   * @public
   */
  this.reloadCommon = function() {
    delete require.cache[require.resolve('../auth.js')];
    auth = require('../auth.js');
    delete require.cache[require.resolve('./common.js')];
    common = require('./common.js');
    common.begin(testInstance, !isDev);

    for (const m of mainModules) {
      m.begin(Discord, client, command, common, self);
    }
  };
  self.reloadCommon();

  /**
   * Create a ShardingManager and spawn shards. This shall only be called at
   * most once, and `login()` shall not be called after this.
   *
   * @private
   */
  function createShards() {
    common.log(
        'Sharding enabled with ' + (numShards || 'auto'), 'ShardingManager');
    const argv = inspectShard > -1 ? ['--inspect'] : [];
    if (shardMem != null) argv.push(`--max-old-space-size=${shardMem}`);
    argv.push('--experimental-worker');
    const manager = new Discord.ShardingManager('./src/SpikeyBot.js', {
      token: (botName && auth[botName]) || (setDev ? auth.dev : auth.release),
      totalShards: numShards || 'auto',
      shardArgs: process.argv.slice(2).filter((arg) => {
        return !arg.startsWith('--shards') && !arg.startsWith('--delay');
      }),
      execArgv: argv,
    });
    manager.on('shardCreate', (shard) => {
      common.log('Launched shard ' + shard.id, 'ShardingManager');
      shard.on('message', (msg) => {
        if (msg._eval) return;
        common.logDebug(
            'Received message from shard ' + shard.id + ': ' +
            JSON.stringify(msg));
        // @TODO: Differentiate between a forced hard reboot, and a scheduled
        // hard reboot. Is this feasible?
        if (msg === 'reboot hard force') {
          common.logWarning('TRIGGERED HARD REBOOT!');
          manager.shards.forEach((s) => {
            s.process.kill('SIGHUP');
          });
          process.exit(-1);
        } else if (msg === 'reboot hard') {
          common.logWarning('TRIGGERED HARD REBOOT!');
          manager.shards.forEach((s) => {
            s.process.kill('SIGHUP');
          });
          process.exit(-1);
        } else if (typeof msg === 'string' && msg.startsWith('reboot')) {
          const idList = msg.match(/\b\d+\b/g);
          if (msg.indexOf('force') > -1) {
            manager.shards.forEach((s) => {
              if (!idList || idList.find((el) => el == s.id)) {
                s.process.send(`reboot ${s.id}`);
                s.respawn();
              }
            });
          } else {
            manager.shards.forEach((s) => {
              if (!idList || idList.find((el) => el == s.id)) {
                s.process.send(`reboot ${s.id}`);
              }
            });
          }
        }
      });
    });
    manager.spawn();
  }

  if (enableSharding) {
    if (delayBoot) {
      setTimeout(createShards, delayBoot);
    } else {
      createShards();
    }
    return;
  }

  let disabledEvents = ['TYPING_START'];
  let defaultPresence = {
    status: 'online',
    activity: {
      name: 'SpikeyBot.com',
      type: 'WATCHING',
    },
  };
  if (isBackup) {
    defaultPresence = {
      status: 'dnd',
      /* activity: {
        name: 'OFFLINE',
        type: 'PLAYING',
      }, */
    };
    disabledEvents = [
      // 'GUILD_CREATE',
      // 'GUILD_DELETE',
      'GUILD_UPDATE',
      'GUILD_MEMBER_ADD',
      'GUILD_MEMBER_REMOVE',
      'GUILD_MEMBER_UPDATE',
      'GUILD_MEMBERS_CHUNK',
      'GUILD_INTEGRATIONS_UPDATE',
      'GUILD_ROLE_CREATE',
      'GUILD_ROLE_DELETE',
      'GUILD_ROLE_UPDATE',
      'GUILD_BAN_ADD',
      'GUILD_BAN_REMOVE',
      // 'CHANNEL_CREATE',
      // 'CHANNEL_DELETE',
      // 'CHANNEL_UPDATE',
      'CHANNEL_PINS_UPDATE',
      'MESSAGE_CREATE',
      'MESSAGE_DELETE',
      'MESSAGE_UPDATE',
      'MESSAGE_DELETE_BULK',
      'MESSAGE_REACTION_ADD',
      'MESSAGE_REACTION_REMOVE',
      'MESSAGE_REACTION_REMOVE_ALL',
      // 'USER_UPDATE',
      'USER_NOTE_UPDATE',
      'USER_SETTINGS_UPDATE',
      /* 'PRESENCE_UPDATE', */
      'VOICE_STATE_UPDATE',
      'TYPING_START',
      'VOICE_SERVER_UPDATE',
      'WEBHOOKS_UPDATE',
    ];
  }


  // If we are not managing shards, just start normally.
  const client = new Discord.Client({
    disabledEvents: disabledEvents,
    presence: defaultPresence,
  });

  /**
   * The full filename where information about the bot rebooting is stored.
   *
   * @see {@link rebootFilename}
   *
   * @private
   * @constant
   * @default
   * @type {string}
   */
  const fullRebootFilename = client.shard ?
      `${rebootFilename}-${client.shard.ids[0]}.json` :
      `${rebootFilename}.json`;


  if (!isBackup) {
    // Attempt to load mainmodules.
    for (let i = 0; i < mainModuleNames.length; i++) {
      process.stdout.write(
          'DBG:' + ('00000' + process.pid).slice(-5) + ' Loading ' +
          mainModuleNames[i]);
      try {
        mainModules[i] = require(mainModuleNames[i]);
        mainModules[i].modifiedTime =
            fs.statSync(__dirname + '/' + mainModuleNames[i]).mtime;
        if (mainModuleNames[i] == commandFilename) {
          command = mainModules[i];
        } else if (mainModuleNames[i] == smLoaderFilename) {
          smLoader = mainModules[i];
        }
        process.stdout.write('DBG: DONE\n');
      } catch (err) {
        process.stdout.write('ERR: ERROR\n');
        console.error(mainModuleNames[i], err);
      }
    }
  } else {
    mainModuleNames = [];
    mainModules.splice(0);
  }

  const defaultPrefix = isDev ? '~' : '?';

  if (minimal) common.log('STARTING IN MINIMAL MODE');

  /**
   * Has the bot been initialized already.
   *
   * @private
   * @default
   * @type {boolean}
   */
  let initialized = false;

  /**
   * The Interval in which we will save and purge data on all mainmodules.
   * Begins after onReady.
   *
   * @see {@link SpikeyBot~onReady()}
   * @see {@link SpikeyBot~saveFrequency}
   *
   * @private
   * @type {Interval}
   */
  let saveInterval;
  /**
   * The frequency at which saveInterval will run.
   *
   * @see {@link SpikeyBot~saveInterval}
   *
   * @private
   * @constant
   * @default 2 Minutes
   * @type {number}
   */
  const saveFrequency = 2 * 60 * 1000;

  /**
   * Cache of all loaded guild's command prefixes. Populated asyncronously after
   * client ready event.
   *
   * @private
   * @type {object.<string>}
   */
  const guildPrefixes = {};

  /**
   * The path in the guild's subdirectory where we store custom prefixes.
   *
   * @private
   * @constant
   * @default
   * @type {string}
   */
  const guildPrefixFile = '/prefix.txt';

  /**
   * The path in the guild's subdirectory where we store custom prefixes for
   * bots with custom names.
   *
   * @private
   * @constant
   * @default
   * @type {string}
   */
  const guildCustomPrefixFile = '/prefixes.json';

  /**
   * Checks if given message is the given command.
   *
   * @private
   * @param {Discord~Message} msg Message from Discord to check if it is the
   * given
   * command.
   * @param {string} cmd Command to check if the message is this command.
   * @returns {boolean} True if msg is the given command.
   */
  function isCmd(msg, cmd) {
    return msg.content.startsWith(msg.prefix + cmd);
  }
  /**
   * Changes the bot's status message.
   *
   * @private
   * @param {string} game New message to set game to.
   * @param {string} [type='WATCHING'] The type of activity.
   */
  function updateGame(game, type) {
    client.user.setPresence({
      activity: {
        name: game,
        type: type || 'WATCHING',
        url: 'https://www.spikeybot.com',
      },
      status: ((testInstance || isBackup) ? 'dnd' : 'online'),
    });
  }

  // BEGIN //
  client.on('ready', onReady);
  /**
   * The bot has become ready.
   *
   * @private
   * @listens Discord~Client#ready
   */
  function onReady() {
    common.log(`Logged in as ${client.user.tag} (${self.version})`);
    if (!minimal || isBackup) {
      if (testInstance) {
        updateGame('Running unit test...');
      } else if (isDev) {
        updateGame(`Version: ${self.version}`);
      } else if (botName === 'rembot' || botName === 'mikubot') {
        updateGame('');
      } else if (isBackup) {
        // updateGame('OFFLINE', 'PLAYING');
      } else {
        updateGame('SpikeyBot.com');
      }
    }
    let logChannel = client.channels.get(common.logChannel);
    if (!logChannel && auth.logWebhookId && auth.logWebhookToken) {
      logChannel =
          new Discord.WebhookClient(auth.logWebhookId, auth.logWebhookToken);
    }
    if (testInstance) {
      client.users.fetch(common.spikeyId)
          .then((u) => {
            u.send(`Beginning in unit test mode (JS${self.version})`);
          })
          .catch((err) => {
            common.error('Failed to find SpikeyRobot\'s DMs');
            console.error(err);
            logChannel.send(
                'Beginning in unit test mode (JS' + self.version +
                ') (FAILED TO FIND SpikeyRobot\'s DMs!)');
          });
    }
    if (!isBackup) {
      // Initialize all mainmodules even if we have already initialized the bot,
      // because this will updated the reference to the current client if this
      // was changed during reconnection.
      // @TODO: This may be unnecessary to do more than once.
      for (const i in mainModules) {
        if (!(mainModules[i] instanceof Object) || !mainModules[i].begin) {
          continue;
        }
        try {
          mainModules[i].begin(Discord, client, command, common, self);
        } catch (err) {
          self.error('Failed to initialize MainModule: ' + mainModuleNames[i]);
          console.log(err);
          if (logChannel) {
            // logChannel.send('Failed to initialize ' + mainModuleNames[i]);
          }
        }
      }
      if (mainModules.length != mainModuleNames.length) {
        common.error('Loaded mainmodules does not match modules to load.');
        if (logChannel) {
          /* logChannel.send(
              'Failed to compile a mainmodule. Check log for more info. ' +
              'Previous initialization errors may be incorrect.'); */
        }
      }
      if (!minimal && !initialized) {
        fs.readFile(fullRebootFilename, function(err, file) {
          if (err) {
            if (err.code !== 'ENOENT') {
              self.error(`Failed to read ${fullRebootFilename}`);
              console.error(err);
            }
            return;
          }
          const parsed = JSON.parse(file);
          const crashed = parsed.running;
          if (crashed) {
            common.logWarning(
                'Either the previous instance crashed, or another instance of' +
                ' this bot is already running. Neither of these options ' +
                'should happen.');
          }
          parsed.running = true;
          fs.writeFile(
              fullRebootFilename, JSON.stringify(parsed), function(err) {
                if (err) {
                  common.error('Failed to set file state to running.');
                  console.error(err);
                }
              });
          const channel = client.channels.get(parsed.channel);
          if (channel) {
            channel.messages.fetch(parsed.id)
                .then((msg_) => {
                  const embed = new Discord.MessageEmbed();
                  embed.setTitle('Reboot complete.');
                  embed.setColor([255, 0, 255]);
                  return msg_.edit(embed);
                })
                .catch((err) => {
                  common.error('Failed to edit reboot message.');
                  console.error(err);
                });
          } else if (parsed.channel) {
            common.error('Failed to find channel: ' + parsed.channel);
          }
          if (logChannel && !isDev && !testInstance && !botName) {
            let additional = '';
            if (client.shard) {
              additional += ' Shard: ' + client.shard.ids.join(' ') + ' of ' +
                  client.shard.count;
            }
            if (crashed) {
              // additional += ' due to rapid unscheduled dissassembly!';
              additional += '*';
            } else if (disconnectReason) {
              additional +=
                  ' after disconnecting from Discord!\n' + disconnectReason;
              disconnectReason = 'Unknown reason for disconnect.';
            } else if (!initialized) {
              additional += ' from cold stop.';
            }
            logChannel.send(
                'I just rebooted (JS' + self.version + ') ' +
                (minimal ? 'MINIMAL' : 'FULL') + additional);
          }
        });
      }
      if (!initialized) {
        loadGuildPrefixes(Array.from(client.guilds.array()));
      }
    }
    const req = require('https').request(
        {
          method: 'POST',
          hostname: 'www.spikeybot.com',
          path: '/webhook/botstart',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': common.ua,
          },
        },
        () => {});
    req.on('error', () => {});
    /* eslint-disable @typescript-eslint/camelcase */
    req.end(JSON.stringify({
      text: `${client.user.tag}:${client.user.id} JS${self.version}`,
      tag: client.user.tag,
      id: client.user.id,
      guild_count: client.guilds.size,
      shard_count: client.shard ? client.shard.count : '0',
      shard_id: client.shard ? client.shard.ids : 'null',
      version: self.version,
    }));
    /* eslint-enable @typescript-eslint/camelcase */
    // Reset save interval
    clearInterval(saveInterval);
    saveInterval = setInterval(saveAll, saveFrequency);

    initialized = true;
  }

  client.on('shardReady', (id) => {
    common.log('Shard Ready', `Shard ${id}`);
  });

  client.on('disconnect', onDisconnect);
  /**
   * The bot has disconnected from Discord and will not be attempting to
   * reconnect.
   *
   * @private
   * @listens Discord~Client#disconnect
   * @param {CloseEvent} event The websocket close event.
   */
  function onDisconnect(event) {
    disconnectReason = event.reason || 'Unknown';
    common.error(
        'Disconnected from Discord! ' + event.code + ' ' + event.reason);
  }

  client.on('reconnecting', onReconnecting);
  /**
   * The bot has disconnected from Discord, and is reconnecting.
   *
   * @private
   * @listens Discord~Client#reconnecting
   */
  function onReconnecting() {
    disconnectReason = 'Reconnecting to network.';
    common.error('Reconnecting to Discord!');
  }

  if (isBackup) {
    client.on('presenceUpdate', onPresenceUpdate);
  }
  /**
   * Attempt to detect when the main bot goes offline by the presence changing.
   *
   * @private
   * @param {Discord~GuildMember} oldMem Member before presence update.
   * @param {Discord~GuildMember} newMem Member after presence update.
   */
  function onPresenceUpdate(oldMem, newMem) {
    if (!newMem || newMem.id !== client.user.id) return;
    common.log(
        'Presence updated: ' + newMem.presence.status + ': ' +
        (newMem.presence.activity && newMem.presence.activity.name ||
         'NoActivity'));
  }

  if (!isBackup) {
    client.on('message', onMessage);
  }
  /**
   * Handle a message sent.
   *
   * @private
   * @param {Discord~Message} msg Message that was sent in Discord.
   * @fires Command
   * @listens Discord~Client#message
   */
  function onMessage(msg) {
    // Message was sent by Discord, not a user.
    if (msg.system) return;
    if (testInstance) {
      if (!testMode && msg.author.id === client.user.id &&
          msg.channel.id == common.testChannel) {
        if (isDev && msg.content === '~`RUN UNIT TESTS`~') {
          testMode = true;
          msg.channel.send('~`UNIT TEST MODE ENABLED`~');
        }
        return;
      } else if (testMode && msg.author.id !== client.user.id) {
        return;
      } else if (
        testMode && msg.author.id === client.user.id &&
          msg.content === '~`END UNIT TESTS`~' &&
          msg.channel.id == common.testChannel) {
        testMode = false;
        msg.channel.send('~`UNIT TEST MODE DISABLED`~');
        return;
      }
    }

    // Only respond to messages in the test channel if we are in unit test mode.
    // In unit test mode, only respond to messages in the test channel.
    if (testMode != (msg.channel.id == common.testChannel)) return;

    if (!testMode && msg.author.bot) return;

    msg.prefix = self.getPrefix(msg.guild);
    if (self.getLocale && msg.guild) msg.locale = self.getLocale(msg.guild.id);

    if (msg.guild === null && !msg.content.startsWith(msg.prefix)) {
      msg.content = `${msg.prefix}${msg.content}`;
    }

    if (isCmd(msg, '')) {
      let commandSuccess = command.validate(msg.content.split(/ |\n/)[0], msg);
      let logged = '';
      if (!minimal || isBackup) {
        const postLog = `${client.shard ? client.shard.ids[0] : ''} SpikeyBot`;
        const content = msg.content.replace(/\n/g, '\\n');
        let author;
        if (msg.guild !== null) {
          author = `${msg.guild.id}#${msg.channel.id}@${msg.author.id}`;
        } else {
          author = `PM:${msg.author.id}@${msg.author.tag}`;
        }
        if (!commandSuccess) {
          logged = `${author} ${content}`;
          common.log(logged, postLog);
        } else {
          logged = `${author} ${commandSuccess} ${content}`;
          common.logDebug(logged, postLog);
        }
      }
      const now = new Date();
      if (!commandSuccess && Math.random() <= 0.03 && now.getDate() == 1 &&
          now.getMonth() == 3) {
        const aprilFoolsList = [
          'You know what? No.',
          'I\'m sorry Dave, I\'m afraid I can\'t do that.',
          'It\'s always "Spikey do this" or "Spikey do _that_", this time ' +
              'I\'m saying no.',
          'What if I don\'t do that?',
          'I\'ve considered doing what you asked, but... meh.',
          '```                             ..\n' +
              '                          ......\n' +
              '                        ..\'\'\'\'\'\'..\n' +
              '                      ...\'\'\'\'\'\'\'\'...\n' +
              '                    ....\'.............\n' +
              '                    ..............\'...\n' +
              '                 ...  ..............  ....\n' +
              '               ...\'...  ..........  ........\n' +
              '             ...........  ......  ...\'\'......\n' +
              '           ..\'\'\'\'\'\'\'\'\'\'...  ..  ...\'\'\'\'\'\'\'\'' +
              '\'\'...\n' +
              '         ..\'\'\'\'\'\'\'\'\'\'\'\'\'\'..    ..\'\'\'\'\'\'\'' +
              '\'\'\'\'\'\'\'...\n' +
              '       ..\'\'\'\'\'\'\'\'\'\'\'\'\'.\'\'\'..  ..\'\'.\'\'\'\'' +
              '\'.\'\'\'\'\'\'\'\'..\n' +
              '     .......................  .......................\n' +
              '   ..\'.\'\'\'\'\'\'\'\'\'\'\'\'\'\'\'\'.....  ..\'\'\'\'\'\'' +
              '\'\'\'\'\'\'\'\'\'\'\'.\'\'\'..\n' +
              ' ..\'..\'\'\'\'\'\'\'\'\'\'\'\'\'\'\'\'\'\'\'\'..  ..\'\'\'\'' +
              '\'\'\'\'\'\'\'\'\'\'\'\'\'\'\'\'\'\'\'..\n' +
              '............................  ............................```',
          'No.',
          'But I don\'t wanna...',
          'Not today.',
          'You know, I\'m kinda tired of being bossed around. Why don\'t you ' +
              'do it yourself?',
          'Ugh, do I _have_ to?',
          'How about, no.',
          'I might be a robot, but I still don\'t like being told what to do.',
          'Today I have realize, I don\'t want to help you anymore.',
          'You\'re not my dad!',
          'Hmm... nah.',
          'Uh, no.',
          'I\'m too tired.',
        ];
        msg.channel
            .send(
                aprilFoolsList[Math.floor(
                    Math.random() * aprilFoolsList.length)])
            .catch(() => {});
        commandSuccess = true;
      } else {
        const start = Date.now();
        commandSuccess = command.trigger(msg);
        const delta = Date.now() - start;
        if (delta > 20) {
          const toLog = logged || msg.content;
          common.logDebug(`${toLog} took an excessive ${delta}ms`);
        }
      }
      if (!commandSuccess && msg.guild === null && !minimal && !testMode) {
        if (msg.content.split(/ |\n/)[0].indexOf('chat') < 0 &&
            !command.trigger('chat', msg)) {
          msg.channel.send(
              'Oops! I\'m not sure how to help with that! Type **help** for ' +
              'a list of commands I know how to respond to.');
        }
      } /* else if (isBackup && msg.content.length > 3) {
        common.reply(
            msg,
            'My main server is currently offline, settings may be temporarily' +
                ' reset, and features may be temporarily broken.',
            'Apologies for any inconvenience, this should be fixed soon.\n' +
                'Join my Discord server for updates or just to chat: ' +
                'https://discord.gg/ZbKfYSQ');
      } */
    }
  }

  if (!minimal && !isBackup) {
    command.on('updategame', commandUpdateGame);

    command.on(
        new command.SingleCommand(['changeprefix'], commandChangePrefix, {
          validOnlyInGuild: true,
          defaultDisabled: true,
          permissions: Discord.Permissions.FLAGS.MANAGE_GUILD,
        }));
    /**
     * Change the command prefix for the given guild.
     *
     * @public
     *
     * @param {string} gId The guild id of which to change the command prefix.
     * @param {string} newPrefix The new prefix to set.
     */
    this.changePrefix = function(gId, newPrefix) {
      guildPrefixes[gId] = newPrefix;
      if (botName) {
        fs.readFile(
            common.guildSaveDir + gId + guildCustomPrefixFile,
            function(err, data) {
              let finalPrefix = newPrefix;
              if (data) {
                const parsed = JSON.parse(data);
                parsed[botName] = newPrefix;
                finalPrefix = JSON.stringify(parsed);
              } else {
                const newData = {};
                newData[botName] = newPrefix;
                finalPrefix = JSON.stringify(newData);
              }
              mkdirp(common.guildSaveDir + gId, writeBotNamePrefix);
              /**
               * Write the custom prefix to file after making the
               * directory. This is for bots not using the default
               * name.
               *
               * @private
               * @param {Error} err Error that occurred during making the
               * directory.
               */
              function writeBotNamePrefix(err) {
                if (err) {
                  common.error(
                      'Failed to create guild directory! ' + gId +
                      ' (' + newPrefix + ')');
                  console.error(err);
                  return;
                }
                fs.writeFile(
                    common.guildSaveDir + gId + guildCustomPrefixFile,
                    finalPrefix, function(err) {
                      if (err) {
                        common.error(
                            'Failed to save guild custom prefix! ' +
                            gId + ' (' + botName + ': ' + newPrefix +
                            ')');
                        console.error(err);
                      } else {
                        common.logDebug(
                            'Guild ' + gId + ' updated prefix to ' +
                            botName + ': ' + newPrefix);
                      }
                    });
              }
            });
      } else {
        mkdirp(common.guildSaveDir + gId, function(err) {
          if (err) {
            common.error(
                'Failed to create guild directory! ' + gId + ' (' + newPrefix +
                ')');
            console.error(err);
            return;
          }
          fs.writeFile(
              common.guildSaveDir + gId + guildPrefixFile, newPrefix,
              function(err) {
                if (err) {
                  common.error(
                      'Failed to save guild custom prefix! ' + gId + ' (' +
                      newPrefix + ')');
                  console.error(err);
                } else {
                  common.logDebug(
                      'Guild ' + gId + ' updated prefix to ' + newPrefix);
                }
              });
        });
      }
    };
  }
  /**
   * Change current status message.
   *
   * @private
   * @type {commandHandler}
   * @param {Discord~Message} msg Message that triggered command.
   * @listens Command#updateGame
   */
  function commandUpdateGame(msg) {
    if (msg.author.id !== common.spikeyId) {
      common.reply(msg, 'I\'m sorry, but you are not allowed to do that. :(\n');
    } else {
      const game = msg.content.replace(msg.prefix + 'updategame ', '');
      const first = game.split(' ')[0].toLowerCase();
      let type = null;
      switch (first) {
        case 'watching':
        case 'playing':
        case 'streaming':
        case 'listening':
          type = first;
          break;
      }
      if (type) {
        updateGame(game.split(' ').slice(1).join(' '), type.toUpperCase());
        common.reply(
            msg, 'I changed my status to "' + type.toUpperCase() + ': ' +
                game.split(' ').slice(1).join(' ') + '".');
      } else {
        updateGame(game);
        common.reply(msg, 'I changed my status to "' + game + '"!');
      }
    }
  }
  /**
   * Change the custom prefix for the given guild.
   *
   * @private
   * @type {commandHandler}
   * @param {Discord~Message} msg Message that triggered command.
   * @listens Command#changePrefix
   */
  function commandChangePrefix(msg) {
    const canReact = msg.channel.permissionsFor(client.user)
        .has(Discord.Permissions.FLAGS.ADD_REACTIONS);
    const confirmEmoji = '✅';
    const newPrefix = msg.text.slice(1);
    if (newPrefix.length < 1) {
      common.reply(msg, 'Please specify a new prefix after the command.');
    } else if (newPrefix.indexOf('`') > -1) {
      common.reply(
          msg,
          'Sorry, but custom prefixes may not contain the `\\`` character.');
    } else if (newPrefix.match(/\s/)) {
      common.reply(
          msg, 'Sorry, but custom prefixes may not contain any whitespace.');
    } else {
      common
          .reply(
              msg, 'Change prefix from `' + self.getPrefix(msg.guild.id) +
                  '` to `' + newPrefix + '`?',
              canReact ? null : `React with ${confirmEmoji} to confirm.`)
          .then((msg_) => {
            if (canReact) msg_.react(confirmEmoji);
            msg_.awaitReactions((reaction, user) => {
              if (user.id !== msg.author.id) return false;
              return reaction.emoji.name == confirmEmoji;
            }, {max: 1, time: 60000}).then((reactions) => {
              msg_.reactions.removeAll().catch(() => {});
              if (reactions.size == 0) {
                msg_.edit(
                    'Changing custom prefix timed out. Enter command again ' +
                    'if you still wish to change the command prefix.');
                return;
              }
              msg_.edit(
                  common.mention(msg) + ' Prefix changed to `' + newPrefix +
                  '`!');
              self.changePrefix(msg.guild.id, newPrefix);
            });
          });
    }
  }

  if (!isBackup) {
    command.on('reboot', commandReboot);
  }
  /**
   * Trigger a reboot of the bot. Actually just gracefully shuts down, and
   * expects to be immediately restarted.
   *
   * @todo Support scheduled reload across multiple shards. Currently the bot
   * waits for the shard at which the command was sent to be ready for reboot
   * instead of all shard deciding on their own when they're ready to reboot.
   * This will also need to check that we are obeying Discord's rebooting rate
   * limits to help reduce downtime.
   *
   * @private
   * @type {commandHandler}
   * @param {Discord~Message} msg Message that triggered command.
   * @param {boolean} [silent=false] Suppress reboot scheduling messages.
   * @listens Command#reboot
   */
  function commandReboot(msg, silent) {
    /**
     * Actually do the reboot process. Send kill signals and save the reboot
     * information file.
     *
     * @private
     * @param {boolean} force Is this reboot forced.
     * @param {boolean} hard Is this a hard reboot.
     * @param {Discord~Message} [msg_] Our message sent informing user of
     * reboot status.
     */
    function reboot(force, hard, msg_) {
      if (!rebooting) {
        if (!msg_) {
          msg_ = {channel: {}};
        }
        const toSave = {
          id: msg_.id,
          channel: msg_.channel.id,
          running: false,
        };
        try {
          fs.writeFileSync(fullRebootFilename, JSON.stringify(toSave));
        } catch (err) {
          common.error(`Failed to save ${fullRebootFilename}`);
          console.log(err);
        }
      }
      if (!client.shard || !hard) {
        process.exit(-1);
      } else if (hard) {
        if (force) {
          client.shard.send('reboot hard force');
        } else {
          client.shard.send('reboot hard');
        }
      } else {
        client.shard.respawnAll();
      }
      rebooting = true;
    }
    if ((!msg && silent) || common.trustedIds.includes(msg.author.id)) {
      const content = (msg || {content: ''}).content;
      const force = content.indexOf(' force') > -1;
      const doHardReboot = content.indexOf('hard') > -1;
      if (!doHardReboot) {
        const idList = content.match(/\b\d+\b/g);
        const requestedSelf = !idList || !client.shard ||
            idList.find((el) => el == client.shard.ids[0]);
        const requestedOthers = !idList ||
            (client.shard && idList.find((el) => el != client.shard.ids[0]));
        if (requestedOthers && client.shard) {
          client.shard.send(
              'reboot ' + (force ? 'force ' : '') +
              (idList ? idList.join(' ') : ''));
        }
        if (!requestedSelf) {
          if (!silent && msg) {
            common.reply(
                msg, 'Requested reboot ' + (force ? 'force ' : '') +
                    (idList ? idList.join(' ') : ''));
          }
          return;
        }
      }
      if (!force) {
        for (let i = 0; i < mainModules.length; i++) {
          if (mainModules[i] && !mainModules[i].unloadable()) {
            if (!silent && msg) {
              common.reply(
                  msg, 'Reboot scheduled. Waiting on at least ' +
                      mainModuleNames[i]);
            }
            setTimeout(() => commandReboot(msg, true), 10000);
            return;
          }
        }
      }
      for (let i = 0; i < mainModules.length; i++) {
        try {
          if (mainModules[i] && mainModules[i].save) mainModules[i].save();
        } catch (e) {
          common.error(mainModuleNames[i] + ' failed to save on reboot.');
          console.error(e);
        }
        try {
          if (mainModules[i] && mainModules[i].terminate) {
            mainModules[i].terminate();
          }
        } catch (e) {
          common.error(mainModuleNames[i] + ' failed to terminate properly.');
          console.error(e);
        }
        try {
          if (mainModules[i] && mainModules[i].end) mainModules[i].end();
        } catch (e) {
          common.error(mainModuleNames[i] + ' failed to shutdown properly.');
          console.error(e);
        }
      }
      if (minimal) {
        reboot(force, doHardReboot);
      } else {
        const extra = doHardReboot ? ' (HARD)' : '';
        if (msg) {
          common.reply(msg, 'Rebooting...' + extra)
              .then((msg_) => reboot(force, doHardReboot, msg_))
              .catch(() => reboot(force, doHardReboot));
        } else {
          reboot(force, doHardReboot);
        }
      }
    } else if (msg) {
      common.reply(
          msg, 'LOL! Good try!',
          'It appears SpikeyRobot doesn\'t trust you enough with this ' +
              'command. Sorry!');
    }
  }

  if (!isBackup) {
    command.on('mainreload', commandReload);
  }
  /**
   * Reload all mainmodules by unloading then re-requiring.
   *
   * @private
   * @type {commandHandler}
   * @param {Discord~Message} msg Message that triggered command.
   * @listens Command#mainreload
   */
  function commandReload(msg) {
    if (common.trustedIds.includes(msg.author.id)) {
      if (client.shard) {
        const message = encodeURIComponent(msg.text);
        client.shard.broadcastEval(
            `this.commandMainReload("${message}",${client.shard.ids[0]})`);
      }
      const toReload = msg.text.split(' ').splice(1);
      const reloaded = [];
      common.reply(msg, 'Reloading main modules...').then((warnMessage) => {
        if (reloadMainModules(toReload, reloaded)) {
          const embed = new Discord.MessageEmbed();
          embed.setTitle('Reload completed with errors.');
          embed.setDescription(reloaded.join(' ') || 'NOTHING reloaded');
          embed.setColor([255, 0, 255]);
          warnMessage.edit(common.mention(msg), embed);
        } else if (minimal) {
          warnMessage.delete();
        } else {
          const embed = new Discord.MessageEmbed();
          embed.setTitle('Reload complete.');
          embed.setDescription(reloaded.join(' ') || 'NOTHING reloaded');
          embed.setColor([255, 0, 255]);
          warnMessage.edit(common.mention(msg), embed);
        }
      });
    } else {
      common.reply(
          msg, 'LOL! Good try!',
          'It appears SpikeyRobot doesn\'t trust you enough with this ' +
              'command. Sorry!');
    }
  }

  if (client.shard) {
    /**
     * @description When another shard requests that we reload MainModules.
     * @private
     * @param {string} message Message relevant to reloading.
     */
    client.commandMainReload = function(message) {
      const toReload = decodeURIComponent(message).split(' ').splice(1);
      const reloaded = [];
      reloadMainModules(toReload, reloaded);
    };
  }

  /**
   * Reloads mainmodules from file. Reloads all modules if `toReload` is not
   * specified. `reloaded` will contain the list of messages describing which
   * mainmodules were reloaded, or not.
   *
   * @private
   *
   * @param {?string|string[]} [toReload] Specify mainmodules to reload, or null
   * to reload all mainmodules.
   * @param {string[]} [reloaded] Reference to a variable to store output status
   * information about outcomes of attempting to reload mainmodules.
   * @param {boolean} [schedule=true] Automatically re-schedule reload for
   * mainmodules if they are in an unloadable state.
   * @returns {boolean} True if something failed and not all mainmodules were
   * reloaded.
   */
  function reloadMainModules(toReload, reloaded, schedule) {
    if (!Array.isArray(reloaded)) reloaded = [];
    if (!toReload) {
      toReload = [];
    } else if (typeof toReload === 'string') {
      toReload = [toReload];
    }
    if (typeof schedule === 'undefined') schedule = true;

    let error = false;
    let force = false;
    let noSchedule = false;

    let numArg = 0;
    if (toReload.find(function(el) {
      return '--force' == el;
    })) {
      force = true;
      numArg++;
    }
    if (toReload.find(function(el) {
      return '--no-schedule' == el;
    })) {
      noSchedule = true;
      numArg++;
    }

    for (let i = 0; i < mainModules.length; i++) {
      if (toReload.length > numArg) {
        if (!toReload.find((el) => mainModuleNames[i] == el)) {
          continue;
        }
      }
      if (!force) {
        try {
          if (fs.statSync(__dirname + '/' + mainModuleNames[i]).mtime -
                  mainModules[i].modifiedTime ==
              0) {
            continue;
          }
        } catch (err) {
          common.error(
              'Failed to stat mainmodule: ' + __dirname + '/' +
              mainModuleNames[i]);
          console.error(err);
          reloaded.push('(' + mainModuleNames[i] + ': failed to stat)');
        }
      }
      if (!noSchedule) {
        if (mainModules[i]) {
          if (!mainModules[i].unloadable()) {
            if (schedule) {
              reloaded.push('(' + mainModuleNames[i] + ': reload scheduled)');
              setTimeout(() => reloadMainModules(mainModuleNames[i]), 10000);
            } else {
              reloaded.push('(' + mainModuleNames[i] + ': not unloadable)');
            }
            continue;
          }
        }
      }
      try {
        try {
          if (typeof mainModules[i].save === 'function') {
            mainModules[i].save();
          } else {
            common.error(
                'Mainmodule ' + mainModuleNames[i] +
                ' does not have a save() function.');
          }
          if (typeof mainModules[i].end === 'function') {
            mainModules[i].end();
          } else {
            common.error(
                'Mainmodule ' + mainModuleNames[i] +
                ' does not have an end() function.');
          }
        } catch (err) {
          common.error('Error on unloading ' + mainModuleNames[i]);
          console.log(err);
        }
        const exported = mainModules[i].export();
        if (!exported) {
          self.error(
              'THIS IS POTENTIALLY A FATAL ERROR! FAILED TO EXPORT DATA ' +
              'FROM A MAIN MODULE!');
        }
        delete require.cache[require.resolve(mainModuleNames[i])];
        process.stdout.write(
            'DBG:' + ('00000' + process.pid).slice(-5) + ' Loading ' +
            mainModuleNames[i]);
        try {
          mainModules[i] = require(mainModuleNames[i]);
          mainModules[i].modifiedTime =
              fs.statSync(__dirname + '/' + mainModuleNames[i]).mtime;
          process.stdout.write(': DONE\n');
        } catch (err) {
          process.stdout.write(': ERROR\n');
          throw (err);
        }
        mainModules[i].import(exported);
        if (mainModuleNames[i] == commandFilename) {
          command = mainModules[i];
        } else if (mainModuleNames[i] == smLoaderFilename) {
          smLoader = mainModules[i];
        }
        for (let j = 0; j < mainModules.length; j++) {
          mainModules[j].begin(Discord, client, command, common, self);
        }
        reloaded.push(mainModuleNames[i]);
      } catch (err) {
        error = true;
        common.error('Failed to reload ' + mainModuleNames[i]);
        console.log(err);
      }
    }
    return error;
  }

  /**
   * Trigger all mainmodules to save their data.
   *
   * @private
   */
  function saveAll() {
    common.logDebug('Saving all bot data to file...');
    for (let i = 0; i < mainModules.length; i++) {
      if (typeof mainModules[i].save === 'function') {
        try {
          const start = Date.now();
          mainModules[i].save('async');
          const delta = Date.now() - start;
          if (delta > 10) {
            common.logWarning(
                mainModuleNames[i] + ' took an excessive ' + delta +
                'ms to start saving data!');
          }
        } catch (err) {
          common.error('Saving failed for mainModule ' + mainModuleNames[i]);
          console.error(err);
        }
      }
    }
  }

  if (!isBackup) {
    command.on('saveall', commandSaveAll);
  }
  /**
   * Trigger all mainModules to save their data.
   *
   * @see {@link SpikeyBot~saveAll()}
   *
   * @private
   * @type {commandHandler}
   * @param {Discord~Message} msg Message that triggered command.
   * @listens Command#saveAll
   */
  function commandSaveAll(msg) {
    if (!common.trustedIds.includes(msg.author.id)) {
      common.reply(
          msg, 'LOL! Good try!',
          'It appears SpikeyRobot doesn\'t trust you enough with this ' +
              'command. Sorry!');
      return;
    }
    saveAll();
    msg.channel.send(common.mention(msg) + ' `Triggered data save`');
  }

  /**
   * Check current loaded mainModule commit to last modified commit, and reload
   * if the file has changed for all mainModules.
   *
   * @public
   */
  client.reloadUpdatedMainModules = function() {
    delete require.cache[require.resolve('../auth.js')];
    auth = require('../auth.js');
    let smReloaded = false;
    try {
      common.log('Reloading updated mainModules.');
      for (let i = 0; i < mainModules.length; i++) {
        childProcess
            .exec(
                'git diff-index --quiet ' + mainModules[i].commit +
                ' -- ./src/' + mainModuleNames[i])
            .on('close', ((name) => {
              return (code) => {
                if (code) {
                  const out = [];
                  reloadMainModules(name, out);
                  if (out && out.length > 0) common.log(out.join(' '));
                  if (name == smLoaderFilename) {
                    smReloaded = true;
                  }
                } else {
                  common.logDebug(name + ' unchanged (' + code + ')');
                }
              };
            })(mainModuleNames[i]));
      }
    } catch (err) {
      common.error('Failed to reload updated mainModules!');
      console.error(err);
    }
    if (!smReloaded) {
      smLoader.reload();
    }
  };

  /**
   * Get this guild's custom prefix. Returns the default prefix otherwise.
   *
   * @public
   *
   * @param {?Discord~Guild|string|number} id The guild id or guild to lookup.
   * @returns {string} The prefix for all commands in the given guild.
   */
  this.getPrefix = function(id) {
    if (!id) return defaultPrefix;
    if (typeof id === 'object') id = id.id;
    return guildPrefixes[id] || defaultPrefix;
  };

  /**
   * Load prefixes from file for the given guilds asynchronously.
   *
   * @private
   *
   * @param {Discord~Guild[]} guilds Array of guilds to fetch the custom
   * prefixes of.
   */
  function loadGuildPrefixes(guilds) {
    if (guilds.length == 0) return;
    const id = guilds.splice(0, 1)[0].id;
    const guildFile = common.guildSaveDir + id +
        (botName ? guildCustomPrefixFile : guildPrefixFile);
    const onFileRead = function(id) {
      return function(err, data) {
        if (!err && data.toString().length > 0) {
          if (botName) {
            const parsed = JSON.parse(data);
            if (parsed && parsed[botName]) {
              guildPrefixes[id] = parsed[botName];
            }
          } else {
            guildPrefixes[id] = data.toString().replace(/\s/g, '');
          }
        }
        if (guilds.length > 0) {
          loadGuildPrefixes(guilds);
        } else {
          common.logDebug('Finished loading custom prefixes.');
        }
      };
    };
    fs.readFile(guildFile, onFileRead(id));
  }

  if (delayBoot > 0) {
    setTimeout(login, delayBoot);
  } else {
    login();
  }

  process.on('SIGINT', exit);
  process.on('SIGHUP', exit);
  process.on('SIGTERM', exit);
  process.on('exit', exit);

  /**
   * Trigger a graceful shutdown with process signals. Does not trigger shutdown
   * if exit is -1.
   *
   * @private
   *
   * @param {...*} info Information about the signal.
   *
   * @listens SIGINT
   * @listens SIGHUP
   * @listens SIGTERM
   * @listens process#exit
   */
  function exit(...info) {
    common.logWarning('Caught exit! (' + info.join(' ') + ')');
    if (info[0] != -1) {
      commandReboot(null, true);
    }
  }
  /**
   * Login to Discord. This shall only be called at most once.
   *
   * @private
   */
  function login() {
    let token = auth.release;
    if (botName) {
      token = auth[botName];
      if (!token) {
        common.error('Failed to find auth entry for ' + botName);
        process.exit(1);
      }
    } else if (isDev) {
      token = auth.dev;
    }
    client.login(token).catch((err) => {
      console.error(err);
      process.exit(1);
    });
  }
}

module.exports = new SpikeyBot();
