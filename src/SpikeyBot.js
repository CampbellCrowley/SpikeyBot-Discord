// Copyright 2018 Campbell Crowley. All rights reserved.
// Author: Campbell Crowley (dev@campbellcrowley.com)
const Discord = require('discord.js');
const fs = require('fs');
const common = require('./common.js');
const auth = require('../auth.js');
const mkdirp = require('mkdirp');
const childProcess = require('child_process');

/**
 * Handler for an unhandledRejection or uncaughtException, to prevent the bot
 * from silently crashing without an error.
 *
 * @private
 * @param {Object} reason Reason for rejection.
 * @param {Promise} p The promise that caused the rejection.
 * @listens Process#unhandledRejection
 * @listens Process#uncaughtException
 */
function unhandledRejection(reason, p) {
  // console.log('Unhandled Rejection at:\n', p /*, '\nreason:', reason*/);
  console.log(reason);
}
process.on('unhandledRejection', unhandledRejection);
process.on('uncaughtException', unhandledRejection);

/**
 * @classdesc Main class that manages the bot.
 * @class
 * @listens Discord~Client#ready
 * @listens Discord~Client#message
 * @listens Command#toggleReact
 * @listens Command#updateGame
 * @listens Command#reboot
 * @listens Command#mainreload
 */
function SpikeyBot() {
  const self = this;
  /**
   * The current bot version parsed from package.json.
   *
   * @private
   * @type {string}
   */
  const version = JSON.parse(fs.readFileSync('package.json')).version + '#' +
      childProcess.execSync('git rev-parse --short HEAD').toString().trim();

  /**
   * Is the bot currently responding as a unit test.
   *
   * @private
   * @type {boolean}
   */
  let testMode = false;
  /**
   * The channel id for the channel to reserve for only unit testing in.
   *
   * @private
   * @default
   * @constant
   * @type {string}
   */
  const testChannel = '439642818084995074';
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
   * The list of all mainModules to load. Always includes {@link
   * SpikeyBot~commandFilename} and {@link SpikeyBot~smListFilename}. Additional
   * mainModules can be loaded from {@link SpikeyBot~mainModuleListFile}.
   *
   * @private
   * @type {string[]}
   */
  let mainModuleNames = [commandFilename, smLoaderFilename];
  try {
    mainModuleNames =
        mainModuleNames.concat(JSON.parse(fs.readFileSync(mainModuleListFile)));
  } catch (err) {
  }
  /**
   * Is this bot running in development mode.
   *
   * @private
   * @type {boolean}
   */
  let setDev = false;
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
  let mainModules = [];
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
   * The name of the client secret to use. Defaults to release either release or
   * dev depending on the --dev flag.
   *
   * @private
   * @default
   * @type {string}
   */
  let botName = null;

  /**
   * Getter for the bot's name. If name is null, it is most likely because there
   * is no custom name and common.isRelease should be used instead.
   * @see {@link SpikeyBot~botName}
   *
   * @public
   * @return {?string} The bot's name or null if it has not been defined yet or
   * there is no custom name.
   */
  this.getBotName = function() {
    return botName;
  };

  /**
   * Getter for the bot's name. If botName is null, this will give either
   * `release` or `dev`.
   * @see {@link SpikeyBot~botName}
   *
   * @public
   * @return {string} The bot's name.
   */
  this.getFullBotName = function() {
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
    } else {
      throw new Error(`Unrecognized argument '${process.argv[i]}'`);
    }
  }

  const isDev = setDev;
  common.begin(false, !isDev);

  if (enableSharding) {
    common.log(
        'Sharding enabled with ' + (numShards || 'auto'), 'ShardingManager');
    const manager = new Discord.ShardingManager('./src/SpikeyBot.js', {
      token: setDev ? auth.dev : auth.release,
      totalShards: numShards || 'auto',
      shardArgs: process.argv.filter((arg) => {
        return !arg.startsWith('--shards');
      }),
    });
    manager.on('shardCreate', (shard) => {
      common.log('Launched shard ' + shard.id, 'ShardingManager');
      shard.on('message', (msg) => {
        common.logDebug(
            'Received message from shard ' + shard.id + ': ' +
            JSON.stringify(msg));
        // @TODO: Differentiate between a forced reboot, and a scheduled reboot.
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
        }
      });
    });
    manager.spawn();
    return;
  }

  // If we are not managing shards, just start normally.
  const client = new Discord.Client();


  // Attempt to load mainmodules.
  for (let i = 0; i < mainModuleNames.length; i++) {
    process.stdout.write(
        'DBG:' + ('00000' + process.pid).slice(-5) + ' Loading ' +
        mainModuleNames[i]);
    try {
      mainModules[i] = require(mainModuleNames[i]);
      if (mainModuleNames[i] == commandFilename) {
        command = mainModules[i];
      } else if (mainModuleNames[i] == smLoaderFilename) {
        smLoader = mainModules[i];
      }
      process.stdout.write(': DONE\n');
    } catch (err) {
      process.stdout.write(': ERROR\n');
      console.error(mainModuleNames[i], err);
    }
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
   * @see {@link SpikeyBot~onReady()}
   * @see {@link SpikeyBot~saveFrequency}
   *
   * @private
   * @type {Interval}
   */
  let saveInterval;
  /**
   * The frequency at which saveInterval will run.
   * @see {@link SpikeyBot~saveInterval}
   *
   * @private
   * @constant
   * @default 30 Minutes
   * @type {number}
   */
  const saveFrequency = 30 * 60 * 1000;

  /**
   * Should we add a reaction to every message that Anthony sends. Overriden if
   * reboot.dat exists.
   *
   * @private
   * @type {boolean}
   */
  let reactToAnthony = true;

  /**
   * Discord IDs that are allowed to reboot the bot.
   *
   * @private
   * @type {string[]}
   * @constant
   */
  const trustedIds = [
    common.spikeyId,       // Me
    '126464376059330562',  // Rohan
  ];

  /**
   * Cache of all loaded guild's command prefixes. Populated asyncronously after
   * client ready event.
   *
   * @private
   * @type {Object.<string>}
   */
  let guildPrefixes = {};

  /**
   * The path in the guild's subdirectory where we store custom prefixes.
   *
   * @private
   * @constant
   * @defaut
   * @type {string}
   */
  const guildPrefixFile = '/prefix.txt';

  /**
   * The path in the guild's subdirectory where we store custom prefixes for
   * bots with custom names.
   *
   * @private
   * @constant
   * @defaut
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
   * @return {boolean} True if msg is the given command.
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
      status: (testInstance ? 'dnd' : 'online'),
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
    common.log(`Logged in as ${client.user.tag} (${version})`);
    if (!minimal) {
      if (testInstance) {
        updateGame('Running unit test...');
      } else if (isDev) {
        updateGame('Version: ' + version);
      } else {
        updateGame(defaultPrefix + 'help for help');
      }
    }
    let logChannel = client.channels.get(common.logChannel);
    if (testInstance) {
      client.users.fetch(common.spikeyId)
          .then((u) => {
            u.send('Beginning in unit test mode (JS' + version + ')');
          })
          .catch((err) => {
            common.error('Failed to find SpikeyRobot\'s DMs');
            logChannel.send(
                'Beginning in unit test mode (JS' + version +
                ') (FAILED TO FIND SpikeyRobot\'s DMs!)');
          });
    } else if (logChannel && !isDev) {
      let additional = '';
      if (client.shard) {
        additional +=
            ' Shard: ' + client.shard.id + ' of ' + client.shard.count;
      }
      if (disconnectReason) {
        additional += ' after disconnecting from Discord!\n' + disconnectReason;
        disconnectReason = null;
      } else if (!initialized) {
        additional += ' from cold stop.';
      }
      logChannel.send(
          'I just rebooted (JS' + version + ') ' +
          (minimal ? 'MINIMAL' : 'FULL') + additional);
    }
    // Initialize all mainmodules even if we have already initialized the bot,
    // because this will updated the reference to the current client if this was
    // changed during reconnection.
    // @TODO: This may be unnecessary to do more than once.
    for (let i in mainModules) {
      if (!mainModules[i] instanceof Object || !mainModules[i].begin) continue;
      try {
        mainModules[i].begin(Discord, client, command, common, self);
      } catch (err) {
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
      fs.readFile('./save/reboot.dat', function(err, file) {
        if (err) return;
        let msg = JSON.parse(file);
        let channel = client.channels.get(msg.channel.id);
        if (channel) {
          channel.messages.fetch(msg.id)
              .then((msg_) => {
                msg_.edit('`Reboot complete.`');
              })
              .catch(() => {});
        }

        if (msg.noReactToAnthony) reactToAnthony = false;
      });
    }
    if (!initialized) {
      loadGuildPrefixes(Array.from(client.guilds.array()));
    }
    // Reset save interval
    clearInterval(saveInterval);
    saveInterval = setInterval(saveAll, saveFrequency);

    initialized = true;
    disconnectReason = 'Unknown reason for disconnect.';
  }

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

  client.on('error', onError);
  /**
   * An error occurred with our websocket connection to Discord.
   *
   * @private
   * @param {Discord~Error} err The websocket error object.
   * @listens Discord~Client#error
   */
  function onError(err) {
    common.error('Websocket encountered an error!');
    console.error(err);
  }

  client.on('warn', onWarn);
  /**
   * A general warning was produced.
   *
   * @private
   * @param {string} info The information.
   * @listens Discord~Client#warn
   */
  function onWarn(info) {
    common.logWarning('Discord Warning: ' + info);
  }

  client.on('debug', onDebug);
  /**
   * A general debug message was produced.
   *
   * @private
   * @param {string} info The information.
   * @listens Discord~Client#debug
   */
  function onDebug(info) {
    if (info.startsWith('[ws] [connection] Heartbeat acknowledged') ||
        info.startsWith('[ws] [connection] Sending a heartbeat')) {
      return;
    }
    common.logDebug('Discord Debug: ' + info);
  }

  client.on('message', onMessage);
  /**
   * Handle a message sent.
   *
   * @private
   * @param {Discord~Message} msg Message that was sent in Discord.
   * @fires Command
   * @listens Discord~Client#message
   */
  function onMessage(msg) {
    if (testInstance) {
      if (!testMode && msg.author.id === client.user.id &&
          msg.channel.id == testChannel) {
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
          msg.channel.id == testChannel) {
        testMode = false;
        msg.channel.send('~`UNIT TEST MODE DISABLED`~');
        return;
      }
    }

    // Only respond to messages in the test channel if we are in unit test mode.
    // In unit test mode, only respond to messages in the test channel.
    if (testMode != (msg.channel.id == testChannel)) return;

    if (!minimal && msg.content.endsWith(', I\'m Dad!')) {
      msg.channel.send('Hi Dad, I\'m Spikey!');
    }
    if (!testMode && msg.author.bot) return;

    msg.prefix = self.getPrefix(msg.guild);

    // If message is equation we can graph.
    const regexForm = new RegExp('^[yY]\\s*=');
    if (msg.content.match(regexForm)) {
      msg.content = msg.prefix + 'graph ' + msg.content;
    }

    if (msg.guild === null && !msg.content.startsWith(msg.prefix)) {
      msg.content = msg.prefix + msg.content;
    }

    if (!minimal && reactToAnthony && msg.author.id == '174030717846552576') {
      msg.react('😮');
    }

    if (isCmd(msg, '')) {
      let commandSuccess = command.validate(msg.content.split(/ |\n/)[0], msg);
      if (!minimal) {
        if (msg.guild !== null) {
          if (!commandSuccess) {
            common.log(
                msg.channel.id + '@' + msg.author.id + ' ' +
                msg.content.replaceAll('\n', '\\n'));
          } else {
            common.logDebug(
                msg.channel.id + '@' + msg.author.id + ' ' + commandSuccess +
                ' ' + msg.content.replaceAll('\n', '\\n'));
          }
        } else {
          if (!commandSuccess) {
            common.log(
                'PM:' + msg.author.id + '@' + msg.author.tag + ' ' +
                msg.content.replaceAll('\n', '\\n'));
          } else {
            common.logDebug(
                'PM:' + msg.author.id + '@' + msg.author.tag + ' ' +
                commandSuccess + ' ' + msg.content.replaceAll('\n', '\\n'));
          }
        }
      }
      commandSuccess = command.trigger(msg.content.split(/ |\n/)[0], msg);
      if (!commandSuccess && msg.guild === null && !minimal && !testMode) {
        if (msg.content.split(/ |\n/)[0].indexOf('chat') < 0 &&
            !command.trigger(msg.prefix + 'chat', msg)) {
          msg.channel.send(
              'Oops! I\'m not sure how to help with that! Type **help** for ' +
              'a list of commands I know how to respond to.');
        }
      }
    }
  }

  if (!minimal) {
    command.on('togglereact', commandToggleReact);
    /**
     * Toggle reactions to Anthony.
     *
     * @private
     * @type {commandHandler}
     * @param {Discord~Message} msg Message that triggered command.
     * @listens Command#toggleReact
     */
    function commandToggleReact(msg) {
      common.reply(
          msg, 'Toggled reactions to Anthony to ' + !reactToAnthony + '. 😮');
      reactToAnthony = !reactToAnthony;
    }

    command.on('updategame', commandUpdateGame);
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
        common.reply(
            msg, 'I\'m sorry, but you are not allowed to do that. :(\n');
      } else {
        let game = msg.content.replace(msg.prefix + 'updategame ', '');
        let first = game.split(' ')[0].toLowerCase();
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

    command.on('changeprefix', commandChangePrefix, true);
    /**
     * Change the custom prefix for the given guild.
     *
     * @private
     * @type {commandHandler}
     * @param {Discord~Message} msg Message that triggered command.
     * @listens Command#changePrefix
     */
    function commandChangePrefix(msg) {
      const perms = msg.member.permissions;
      const confirmEmoji = '✅';
      const newPrefix = msg.text.slice(1);
      if (!perms.has(Discord.Permissions.FLAGS.MANAGE_GUILD)) {
        common.reply(
            msg, 'Sorry, but you must be a server administrator to set a ' +
                'custom prefix.');
        return;
      } else if (newPrefix.length < 1) {
        common.reply(msg, 'Please specify a new prefix after the command.');
      } else if (newPrefix.indexOf('`') > -1) {
        common.reply(
            msg,
            'Sorry, but custom prefixes may not contain the `\\`` character.');
      } else if (newPrefix.match(/\s/)) {
        common.reply(
            msg, 'Sorry, but custom prefixes may not contain any whitespace.');
      } else {
        msg.channel
            .send(
                common.mention(msg) +
                ' Are you sure you wish to change the command prefix for ' +
                'this server from `' + self.getPrefix(msg.guild.id) + '` to `' +
                newPrefix + '`?')
            .then((msg_) => {
              msg_.react(confirmEmoji);
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
                guildPrefixes[msg.guild.id] = newPrefix;
                msg_.edit(
                    common.mention(msg) + ' Prefix changed to `' + newPrefix +
                    '`!');
                if (botName) {
                  fs.readFile(
                      common.guildSaveDir + msg.guild.id +
                          guildCustomPrefixFile,
                      function(err, data) {
                        let finalPrefix = newPrefix;
                        if (data) {
                          let parsed = JSON.parse(data);
                          parsed[botName] = newPrefix;
                          finalPrefix = JSON.stringify(parsed);
                        } else {
                          let newData = {};
                          newData[botName] = newPrefix;
                          finalPrefix = JSON.stringify(newData);
                        }
                        mkdirp(
                            common.guildSaveDir + msg.guild.id,
                            writeBotNamePrefix);
                        /**
                         * Write the custom prefix to file after making the
                         * directory. This is for bots not using the default
                         * name.
                         * @private
                         * @param {Error} err
                         */
                        function writeBotNamePrefix(err) {
                          if (err) {
                            common.error(
                                'Failed to create guild directory! ' +
                                msg.guild.id + ' (' + newPrefix + ')');
                            console.error(err);
                            return;
                          }
                          fs.writeFile(
                              common.guildSaveDir + msg.guild.id +
                                  guildCustomPrefixFile,
                              finalPrefix, function(err) {
                                if (err) {
                                  common.error(
                                      'Failed to save guild custom prefix! ' +
                                      msg.guild.id + ' (' + botName + ': ' +
                                      newPrefix + ')');
                                  console.error(err);
                                } else {
                                  common.logDebug(
                                      'Guild ' + msg.guild.id +
                                      ' updated prefix to ' + botName + ': ' +
                                      newPrefix);
                                }
                              });
                        }
                      });
                } else {
                  mkdirp(common.guildSaveDir + msg.guild.id, function(err) {
                    if (err) {
                      common.error(
                          'Failed to create guild directory! ' + msg.guild.id +
                          ' (' + newPrefix + ')');
                      console.error(err);
                      return;
                    }
                    fs.writeFile(
                        common.guildSaveDir + msg.guild.id + guildPrefixFile,
                        newPrefix, function(err) {
                          if (err) {
                            common.error(
                                'Failed to save guild custom prefix! ' +
                                msg.guild.id + ' (' + newPrefix + ')');
                            console.error(err);
                          } else {
                            common.logDebug(
                                'Guild ' + msg.guild.id +
                                ' updated prefix to ' + newPrefix);
                          }
                        });
                  });
                }
              });
            });
      }
    }
  }

  command.on('reboot', commandReboot);
  /**
   * Trigger a reboot of the bot. Actually just gracefully shuts down, and
   * expects to be immediately restarted.
   * @TODO: Support scheduled reload across multiple shards. Currently the bot
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
    if (msg.author.id === common.spikeyId) {
      let force = msg.content.indexOf(' force') > -1;
      if (!force) {
        for (let i = 0; i < mainModules.length; i++) {
          if (mainModules[i] && !mainModules[i].unloadable()) {
            if (!silent) {
              common.reply(
                  msg, 'Reboot scheduled. Waiting on at least ' +
                      mainModuleNames[i]);
            }
            setTimeout(function() {
              commandReboot(msg, true);
            }, 10000);
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
      const doHardReboot = msg.content.indexOf('hard') > -1;
      const reboot = function(hard) {
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
      };
      if (minimal) {
        reboot(doHardReboot);
      } else {
        const extra = doHardReboot ? ' (HARD)' : '';
        common.reply(msg, 'Rebooting...' + extra).then((msg) => {
          let toSave = {
            id: msg.id,
            channel: {id: msg.channel.id},
            noReactToAnthony: !reactToAnthony,
          };
          try {
            fs.writeFileSync('./save/reboot.dat', JSON.stringify(toSave));
          } catch (err) {
            common.error('Failed to save reboot.dat');
            console.log(err);
          }
          reboot(doHardReboot);
        });
      }
    } else {
      common.reply(
          msg, 'LOL! Good try!',
          'It appears SpikeyRobot doesn\'t trust you enough with this ' +
              'command. Sorry!');
    }
  }

  command.on('mainreload', commandReload);
  /**
   * Reload all mainmodules by unloading then re-requiring.
   *
   * @private
   * @type {commandHandler}
   * @param {Discord~Message} msg Message that triggered command.
   * @listens Command#reload
   */
  function commandReload(msg) {
    if (trustedIds.includes(msg.author.id)) {
      let toReload = msg.text.split(' ').splice(1);
      let reloaded = [];
      common.reply(msg, 'Reloading main modules...').then((warnMessage) => {
        if (reloadMainModules(toReload, reloaded)) {
          warnMessage.edit(
              '`Reload completed with errors.`\n' +
              (reloaded.join(' ') || 'NOTHING reloaded'));
        } else if (minimal) {
          warnMessage.delete();
        } else {
          warnMessage.edit(
              '`Reload complete.`\n' +
              (reloaded.join(' ') || 'NOTHING reloaded'));
        }
      });
    } else {
      common.reply(
          msg, 'LOL! Good try!',
          'It appears SpikeyRobot doesn\'t trust you enough with this ' +
              'command. Sorry!');
    }
  }

  /**
   * Reloads mainmodules from file. Reloads all modules if `toReload` is not
   * specified. `reloaded` will contain the list of messages describing which
   * mainmodules were reloaded, or not.
   * @private
   *
   * @param {?string|string[]} [toReload] Specify mainmodules to reload, or null
   * to reload all mainmodules.
   * @param {string[]} [reloaded] Reference to a variable to store output status
   * information about outcomes of attempting to reload mainmodules.
   * @param {boolean} [schedule=true] Automatically re-schedule reload for
   * mainmodules if they are in an unloadable state.
   * @return {boolean} True if something failed and not all mainmodules were
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
        if (!toReload.find(function(el) {
          return mainModuleNames[i] == el;
        })) {
          continue;
        }
      }
      if (!force) {
        try {
          if (fs.statSync(__dirname + '/' + mainModuleNames[i]).mtime <=
              mainModules[i].loadTime) {
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
              setTimeout(function() {
                reloadMainModules(mainModuleNames[i]);
              }, 10000);
            } else {
              reloaded.push('(' + mainModuleNames[i] + ': not unloadable)');
            }
            continue;
          }
        }
      }
      try {
        try {
          if (mainModules[i].save) {
            mainModules[i].save();
          } else {
            common.error(
                'Mainmodule ' + mainModuleNames[i] +
                ' does not have a save() function.');
          }
          if (mainModules[i].end) {
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
        let exported = mainModules[i].export();
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
        mainModules[i].begin(Discord, client, command, common, self);
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
    common.logDebug('Starting save on all mainModules.');
    for (let i = 0; i < mainModules.length; i++) {
      if (typeof mainModules[i].save === 'function') {
        try {
          mainModules[i].save('async');
        } catch (err) {
          common.error('Saving failed for mainModule ' + mainModuleNames[i]);
          console.error(err);
        }
      }
    }
  }

  command.on('saveall', commandSaveAll);
  /**
   * Trigger all mainModules to save their data.
   * @see {@link SpikeyBot~saveAll()}
   *
   * @private
   * @type {commandHandler}
   * @param {Discord~Message} msg Message that triggered command.
   * @listens Command#saveAll
   */
  function commandSaveAll(msg) {
    if (!trustedIds.includes(msg.author.id)) {
      common.reply(
          msg, 'LOL! Good try!',
          'It appears SpikeyRobot doesn\'t trust you enough with this ' +
              'command. Sorry!');
      return;
    }
    saveAll();
    msg.channel.send(common.mention(msg) + ' `Triggered data save`');
  }

  command.on('update', commandUpdate);
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
    if (!trustedIds.includes(msg.author.id)) {
      common.reply(
          msg, 'LOL! Good try!',
          'It appears SpikeyRobot doesn\'t trust you enough with this ' +
              'command. Sorry!');
      return;
    }
    common.log(
        'Triggered update: ' + __dirname + ' <-- DIR | CWD -->' +
        process.cwd());
    common.reply(msg, 'Updating from git...').then((msg_) => {
      childProcess.exec('npm run update', function(err, stdout, stderr) {
        if (!err) {
          if (stdout && stdout !== 'null') console.log('STDOUT:', stdout);
          if (stderr && stderr !== 'null') console.error('STDERR:', stderr);
          client.reloadUpdatedMainModules();
          if (client.shard) {
            client.shard.broadcastEval('this.reloadUpdatedMainModules');
          }
          try {
            childProcess.execSync(
                'git diff-index --quiet ' + version.split('#')[1] +
                ' -- ./src/' +
                module.filename.slice(
                    __filename.lastIndexOf('/') + 1, module.filename.length));
            msg_.edit(common.mention(msg) + ' Bot update complete!');
          } catch (err) {
            if (err.status === 1) {
              msg_.edit(
                  common.mention(msg) +
                  ' Bot update complete, but requires manual reboot.\n' +
                  err.message);
            } else {
              common.error(
                  'Checking for SpikeyBot.js changes failed: ' + err.status);
              console.error('STDOUT:', err.stdout);
              console.error('STDERR:', err.stderr);
              msg_.edit(
                  common.mention(msg) +
                  ' Bot update complete, but failed to check if ' +
                  'reboot is necessary.');
            }
          }
        } else {
          common.error('Failed to pull latest update.');
          console.error(err);
          if (stdout && stdout !== 'null') console.log('STDOUT:', stdout);
          if (stderr && stderr !== 'null') console.error('STDERR:', stderr);
          msg_.edit(common.mention(msg) + ' Bot update FAILED!');
        }
      });
    });
  }

  /**
   * Check current loaded mainModule commit to last modified commit, and reload
   * if the file has changed for all mainModules.
   *
   * @public
   */
  client.reloadUpdatedMainModules = function() {
    let smReloaded = false;
    try {
      common.log('Reloading updated mainModules.');
      for (let i = 0; i < mainModules.length; i++) {
        childProcess
            .exec(
                'git diff-index --quiet ' + mainModules[i].commit +
                ' -- ./src/' + mainModuleNames[i])
            .on('close', ((name) => {
              return (code, signal) => {
                if (code) {
                  let out = [];
                  reloadMainModules(name, out);
                  if (out) common.log(out.join(' '));
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
   * @public
   *
   * @param {?Discord~Guild|string|number} id The guild id or guild to lookup.
   * @return {string} The prefix for all commands in the given guild.
   */
  this.getPrefix = function(id) {
    if (!id) return defaultPrefix;
    if (typeof id === 'object') id = id.id;
    return guildPrefixes[id] || defaultPrefix;
  };

  /**
   * Load prefixes from file for the given guilds asynchronously.
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

  // Dev:
  // https://discordapp.com/oauth2/authorize?&client_id=422623712534200321&scope=bot
  // Rel:
  // https://discordapp.com/oauth2/authorize?&client_id=318552464356016131&scope=bot
  if (botName) {
    if (!auth[botName]) {
      common.error('Failed to find auth entry for ' + botName);
      process.exit(1);
    } else {
      client.login(auth[botName]);
    }
  } else if (isDev) {
    client.login(auth.dev);
  } else {
    client.login(auth.release);
  }
}

module.exports = new SpikeyBot();
