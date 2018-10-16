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
 * @listens SpikeyBot~Command#toggleReact
 * @listens SpikeyBot~Command#help
 * @listens SpikeyBot~Command#updateGame
 * @listens SpikeyBot~Command#reboot
 * @listens SpikeyBot~Command#reload
 * @fires SpikeyBot~Command#*
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
   * The list of all submodules to load.
   *
   * @private
   * @type {string[]}
   */
  let subModuleNames = [];
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
   * Instances of sub-modules currently loaded.
   *
   * @private
   * @type {SubModule[]}
   */
  let subModules = [];
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

  // Parse cli args.
  for (let i = 0; i < process.argv.length; i++) {
    if (process.argv[i] === 'dev' || process.argv[i] === '--dev') {
      setDev = true;
    } else if (process.argv[i].startsWith('--botname')) {
      if (process.argv[i].indexOf('=') > -1) {
        botName = process.argv[i].split('=')[1] || '';
      } else if (process.argv.length > i + 1) {
        botName = process.argv[i + 1] || '';
        i++;
      }
    } else if (
      process.argv[i] === 'minimal' || process.argv[i] === 'onlymusic' ||
        process.argv[i] === '--minimal' || process.argv[i] === '--onlymusic') {
      minimal = true;
    } else if (process.argv[i] === 'test' || process.argv[i] === '--test') {
      testInstance = true;
    } else if (process.argv[i].startsWith('--shards')) {
      enableSharding = true;
      if (process.argv[i].indexOf('=') > -1) {
        numShards = process.argv[i].split('=')[1] * 1 || 0;
      }
    } else if (i > 3 && typeof process.argv[i] === 'string') {
      subModuleNames.push(process.argv[i]);
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
        common.log(
            'Received message from shard ' + shard.id + ': ' +
            JSON.stringify(msg));
        // @TODO: Differentiate between a forced reboot, and a scheduled reboot.
        if (msg === 'reboot hard force') {
          common.log('TRIGGERED HARD REBOOT!');
          manager.shards.forEach((s) => {
            s.process.kill('SIGHUP');
          });
          process.exit(-1);
        } else if (msg === 'reboot hard') {
          common.log('TRIGGERED HARD REBOOT!');
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


  // Attempt to load submodules.
  for (let i = 0; i < subModuleNames.length; i++) {
    if (typeof subModuleNames[i] !== 'string' ||
        subModuleNames[i].startsWith('--')) {
      continue;
    }
    process.stdout.write('Loading ' + subModuleNames[i]);
    try {
      subModules[i] = require(subModuleNames[i]);
      process.stdout.write(': DONE\n');
    } catch (err) {
      process.stdout.write(': ERROR\n');
      console.error(subModuleNames[i], err);
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
   * The Interval in which we will save and purge data on all submodules. Begins
   * after onReady.
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
   * The message sent to the channel where the user asked for help.
   *
   * @private
   * @type {string}
   * @constant
   */
  const helpmessagereply = 'I sent you a DM with commands!';
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
   * The message to send to the user if they attempt a server-only command in a
   * non-server channel.
   *
   * @private
   * @type {string}
   * @constant
   */
  const onlyservermessage = 'This command only works in servers, sorry!';
  /**
   * The message to send to the user if the command they attempted is currently
   * disabled in the channel.
   *
   * @private
   * @type {string}
   * @constant
   */
  const disabledcommandmessage =
      'This command has been disabled in this channel.';

  /**
   * Command event triggering interface.
   * @class
   */
  function Command() {
    /**
     * The function to call when a command is triggered.
     *
     * @callback commandHandler
     * @param {Discord~Message} msg The message sent in Discord.
     */

    /**
     * All tracked commands with handlers.
     *
     * @private
     * @type {Object.<commandHandler>}
     */
    let cmds = {};
    /**
     * List of disabled commands, and the channels they are disabled in.
     *
     * @private
     * @type {Object.<string[]>}
     */
    let blacklist = {};

    /**
     * Trigger a command firing and call it's handler passing in msg as only
     * argument.
     *
     * @param {string} cmd Array of strings or a string of the command to
     * trigger.
     * @param {Discord~Message} msg Message received from Discord to pass to
     * handler.
     * @return {boolean} True if command was handled by us.
     */
    this.trigger = function(cmd, msg) {
      if (cmd.startsWith(msg.prefix)) cmd = cmd.replace(msg.prefix, '');
      cmd = cmd.toLowerCase();
      if (cmds[cmd]) {
        if (cmds[cmd].validOnlyOnServer && msg.guild === null) {
          common.reply(msg, onlyservermessage);
          return true;
        } else if (
          blacklist[cmd] && blacklist[cmd].lastIndexOf(msg.channel.id) > -1) {
          common.reply(msg, disabledcommandmessage);
          return true;
        }
        msg.text = msg.content.replace(msg.prefix + cmd, '');
        try {
          cmds[cmd](msg);
        } catch (err) {
          common.error(cmd + ': FAILED');
          console.log(err);
          common.reply(msg, 'An error occurred! Oh noes!');
        }
        return true;
      } else {
        return false;
      }
    };
    /**
     * Registers a listener for a command.
     *
     * @param {string|string[]} cmd Command to listen for.
     * @param {commandHandler} cb Function to call when command is triggered.
     * @param {boolean} [onlyserver=false] Whether the command is only allowed
     * on a server.
     */
    this.on = function(cmd, cb, onlyserver) {
      if (typeof cb !== 'function') {
        throw new Error('Event callback must be a function.');
      }
      cb.validOnlyOnServer = onlyserver || false;
      if (typeof cmd === 'string') {
        if (cmds[cmd]) {
          common.error(
              'Attempted to register a second handler for event that already ' +
              'exists! (' + cmd + ')');
        } else {
          cmds[cmd] = cb;
        }
      } else if (Array.isArray(cmd)) {
        for (let i = 0; i < cmd.length; i++) cmds[cmd[i]] = cb;
      } else {
        throw new Error('Event must be string or array of strings');
      }
    };
    /**
     * Remove listener for a command.
     *
     * @param {string|string[]} cmd Command to remove listener for.
     */
    this.deleteEvent = function(cmd) {
      if (typeof cmd === 'string') {
        if (cmds[cmd]) {
          delete cmds[cmd];
          delete blacklist[cmd];
        } else {
          common.error(
              'Requested deletion of event handler for event that was never ' +
              'registered! (' + cmd + ')');
        }
      } else if (Array.isArray(cmd)) {
        for (let i = 0; i < cmd.length; i++) {
          if (cmds[cmd[i]]) {
            delete cmds[cmd[i]];
            delete blacklist[cmd[i]];
          } else {
            common.error(
                'Requested deletion of event handler for event that was ' +
                'never registered! (' + cmd[i] + ')');
          }
        }
      } else {
        throw new Error('Event must be string or array of strings');
      }
    };
    /**
     * Temporarily disables calling the handler for the given command in a
     * certain
     * Discord text channel.
     *
     * @param {string} cmd Command to disable.
     * @param {string} channel ID of channel to disable command for.
     */
    this.disable = function(cmd, channel) {
      if (cmds[cmd]) {
        if (!blacklist[cmd] || blacklist[cmd].lastIndexOf(channel) == -1) {
          if (!blacklist[cmd]) {
            blacklist[cmd] = [channel];
          } else {
            blacklist[cmd].push(channel);
          }
        }
      } else {
        common.error(
            'Requested disable for event that was never registered! (' + cmd +
            ')');
      }
    };
    /**
     * Re-enable a command that was disabled previously.
     *
     * @param {string} cmd Command to enable.
     * @param {string} channel ID of channel to enable command for.
     */
    this.enable = function(cmd, channel) {
      if (blacklist[cmd]) {
        let index = blacklist[cmd].lastIndexOf(channel);
        if (index > -1) {
          blacklist[cmd].splice(index, 1);
        } else {
          common.error(
              'Requested enable of event that is enabled! (' + cmd + ')');
        }
      } else {
        common.error(
            'Requested enable for event that is not disabled! (' + cmd + ')');
      }
    };
  }
  /**
   * The current instance of Command.
   *
   * @private
   * @type {SpikeyBot~Command}
   * @constant
   */
  const command = new Command();

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
    // common.log('Changed game to "' + game + '"');
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
    // Initialize all submodules even if we have already initialized the bot,
    // because this will updated the reference to the current client if this was
    // changed during reconnection.
    for (let i in subModules) {
      if (!subModules[i] instanceof Object || !subModules[i].begin) continue;
      try {
        subModules[i].begin(
            defaultPrefix, Discord, client, command, common, self);
      } catch (err) {
        console.log(err);
        if (logChannel) {
          logChannel.send('Failed to initialize ' + subModuleNames[i]);
        }
      }
    }
    if (subModules.length != subModuleNames.length) {
      common.error('Loaded submodules does not match modules to load.');
      if (logChannel) {
        logChannel.send(
            'Failed to compile a submodule. Check log for more info. ' +
            'Previous initialization errors may be incorrect.');
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
   * @fires SpikeyBot~Command
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
      if (msg.content.match(/^\?+$/)) {
        return;
      }
      if (!minimal) {
        if (msg.guild !== null) {
          common.log(
              msg.channel.id + '@' + msg.author.id +
              msg.content.replaceAll('\n', '\\n'));
        } else {
          common.log(
              'PM: @' + msg.author.id + '@' + msg.author.tag +
              msg.content.replaceAll('\n', '\\n'));
        }
      }
      if (!command.trigger(msg.content.split(/ |\n/)[0], msg) &&
          msg.guild === null && !minimal && !testMode) {
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
     * @listens SpikeyBot~Command#toggleReact
     */
    function commandToggleReact(msg) {
      common.reply(
          msg, 'Toggled reactions to Anthony to ' + !reactToAnthony + '. 😮');
      reactToAnthony = !reactToAnthony;
    }

    command.on('help', commandHelp);
    /**
     * Send help message to user who requested it.
     *
     * @private
     * @type {commandHandler}
     * @param {Discord~Message} msg Message that triggered command.
     * @listens SpikeyBot~Command#help
     */
    function commandHelp(msg) {
      try {
        let error = false;
        for (let i in subModules) {
          if (subModules[i] instanceof Object && subModules[i].helpMessage) {
            msg.author.send(subModules[i].helpMessage).catch((err) => {
              if (msg.guild !== null && !error) {
                error = true;
                common
                    .reply(
                        msg, 'Oops! I wasn\'t able to send you the help!\n' +
                            'Did you block me?',
                        err.message)
                    .catch(() => {});
                common.error(
                    'Failed to send help message in DM to user: ' +
                    msg.author.id);
                console.error(err);
              }
            });
          }
        }
        if (msg.guild !== null) {
          common
              .reply(
                  msg, helpmessagereply,
                  'Tip: https://www.spikeybot.com also has more information.')
              .catch((err) => {
                common.error(
                    'Unable to reply to help command in channel: ' +
                    msg.channel.id);
                console.log(err);
              });
        }
      } catch (err) {
        common.reply(msg, blockedmessage);
        common.error('An error occured while sending help message!');
        console.error(err);
      }
    }

    command.on('updategame', commandUpdateGame);
    /**
     * Change current status message.
     *
     * @private
     * @type {commandHandler}
     * @param {Discord~Message} msg Message that triggered command.
     * @listens SpikeyBot~Command#updateGame
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
     * @listens SpikeyBot~Command#changePrefix
     */
    function commandChangePrefix(msg) {
      const perms = msg.member.permissions;
      const confirmEmoji = '✅';
      const newPrefix = msg.text.slice(1);
      if (!perms.has(Discord.Permissions.FLAGS.ADMINISTRATOR)) {
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
                                  common.log(
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
                            common.log(
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
   * @listens SpikeyBot~Command#reboot
   */
  function commandReboot(msg, silent) {
    if (msg.author.id === common.spikeyId) {
      let force = msg.content.indexOf(' force') > -1;
      if (!force) {
        for (let i = 0; i < subModules.length; i++) {
          if (subModules[i] && !subModules[i].unloadable()) {
            if (!silent) {
              common.reply(
                  msg,
                  'Reboot scheduled. Waiting on at least ' + subModuleNames[i]);
            }
            setTimeout(function() {
              commandReboot(msg, true);
            }, 10000);
            return;
          }
        }
      }
      for (let i = 0; i < subModules.length; i++) {
        try {
          if (subModules[i] && subModules[i].save) subModules[i].save();
        } catch (e) {
          common.error(subModuleNames[i] + ' failed to save on reboot.');
          console.error(e);
        }
        try {
          if (subModules[i] && subModules[i].end) subModules[i].end();
        } catch (e) {
          common.error(subModuleNames[i] + ' failed to shutdown properly.');
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

  command.on('reload', commandReload);
  /**
   * Reload all sub modules by unloading then re-requiring.
   *
   * @private
   * @type {commandHandler}
   * @param {Discord~Message} msg Message that triggered command.
   * @listens SpikeyBot~Command#reload
   */
  function commandReload(msg) {
    if (trustedIds.includes(msg.author.id)) {
      let toReload = msg.text.split(' ').splice(1);
      let reloaded = [];
      common.reply(msg, 'Reloading modules...').then((warnMessage) => {
        if (reloadSubModules(toReload, reloaded)) {
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
   * Reloads submodules from file. Reloads all modules if `toReload` is not
   * specified. `reloaded` will contain the list of messages describing which
   * submodules were reloaded, or not.
   * @private
   *
   * @param {?string|string[]} [toReload] Specify submodules to reload, or null
   * to reload all submodules.
   * @param {string[]} [reloaded] Reference to a variable to store output status
   * information about outcomes of attempting to reload submodules.
   * @param {boolean} [schedule=true] Automatically re-schedule reload for
   * submodules if they are in an unloadable state.
   * @return {boolean} True if something failed and not all submodules were
   * reloaded.
   */
  function reloadSubModules(toReload, reloaded, schedule) {
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

    for (let i = 0; i < subModules.length; i++) {
      if (toReload.length > numArg) {
        if (!toReload.find(function(el) {
          return subModuleNames[i] == el;
        })) {
          continue;
        }
      }
      if (!force) {
        try {
          if (fs.statSync(__dirname + '/' + subModuleNames[i]).mtime <=
              subModules[i].loadTime) {
            // reloaded.push('(' + subModuleNames[i] + ': unchanged)');
            continue;
          }
        } catch (err) {
          common.error(
              'Failed to stat submodule: ' + __dirname + '/' +
              subModuleNames[i]);
          console.error(err);
          reloaded.push('(' + subModuleNames[i] + ': failed to stat)');
          // continue;
        }
      }
      if (!noSchedule) {
        if (subModules[i]) {
          if (!subModules[i].unloadable()) {
            if (schedule) {
              reloaded.push('(' + subModuleNames[i] + ': reload scheduled)');
              setTimeout(function() {
                reloadSubModules(subModuleNames[i]);
              }, 10000);
            } else {
              reloaded.push('(' + subModuleNames[i] + ': not unloadable)');
            }
            continue;
          }
        }
      }
      try {
        try {
          if (subModules[i].save) {
            subModules[i].save();
          } else {
            common.error(
                'Submodule ' + subModuleNames[i] +
                ' does not have a save() function.');
          }
          if (subModules[i].end) {
            subModules[i].end();
          } else {
            common.error(
                'Submodule ' + subModuleNames[i] +
                ' does not have an end() function.');
          }
        } catch (err) {
          common.error('Error on unloading ' + subModuleNames[i]);
          console.log(err);
        }
        delete require.cache[require.resolve(subModuleNames[i])];
        process.stdout.write('Loading ' + subModuleNames[i]);
        try {
          subModules[i] = require(subModuleNames[i]);
          process.stdout.write(': DONE\n');
        } catch (err) {
          process.stdout.write(': ERROR\n');
          throw (err);
        }
        subModules[i].begin(
            defaultPrefix, Discord, client, command, common, self);
        reloaded.push(subModuleNames[i]);
      } catch (err) {
        error = true;
        common.error('Failed to reload ' + subModuleNames[i]);
        console.log(err);
      }
    }
    return error;
  }

  /**
   * Check current loaded submodule commit to last modified commit, and reload
   * if the file has changed.
   *
   * @public
   */
  client.reloadUpdatedSubmodules = function() {
    try {
      common.log('Reloading updated submodules.');
      for (let i = 0; i < subModules.length; i++) {
        childProcess
            .exec(
                'git diff-index --quiet ' + subModules[i].commit +
                ' -- ./src/' + subModuleNames[i])
            .on('close', ((name) => {
              return (code, signal) => {
                if (code) {
                  let out = [];
                  reloadSubModules(name, out);
                  if (out) common.log(out.join(' '));
                } else {
                  common.log(name + ' unchanged (' + code + ')');
                }
              };
            })(subModuleNames[i]));
      }
    } catch (err) {
      common.error('Failed to reload updated submodules!');
      console.error(err);
    }
  };

  /**
   * Trigger all submodules to save their data.
   *
   * @private
   */
  function saveAll() {
    for (let i = 0; i < subModules.length; i++) {
      if (typeof subModules[i].save === 'function') {
        try {
          subModules[i].save('async');
        } catch (err) {
          common.error('Saving failed for submodule ' + subModuleNames[i]);
          console.error(err);
        }
      }
    }
  }

  command.on('saveall', commandSaveAll);
  /**
   * Trigger all submodules to save their data.
   * @see {@link SpikeyBot~saveAll()}
   *
   * @private
   * @type {commandHandler}
   * @param {Discord~Message} msg Message that triggered command.
   * @listens SpikeyBot~Command#saveAll
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
   * @listens SpikeyBot~Command#update
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
          client.reloadUpdatedSubmodules();
          if (client.shard) {
            client.shard.broadcastEval('this.reloadUpdatedSubmodules');
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
                  ' Bot update complete, but requires manual reboot.');
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
   * Get array of all submodule names and the commit they were last loaded from.
   *
   * @public
   * @return {Array.<{name: string, commit: string}>}
   */
  this.getSubmoduleCommits = function() {
    return subModules
        .map((el, i) => {
          return {name: subModuleNames[i], commit: el.commit || 'Unknown'};
        })
        .filter((el) => {
          return el.name && el.name.length > 0;
        });
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
          common.log('Finished loading custom prefixes.');
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
