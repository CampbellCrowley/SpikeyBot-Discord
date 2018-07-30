// Copyright 2018 Campbell Crowley. All rights reserved.
// Author: Campbell Crowley (dev@campbellcrowley.com)
const Discord = require('discord.js');
const fs = require('fs');
const common = require('./common.js');
const auth = require('../auth.js');
const client = new Discord.Client();

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

  // Parse cli args.
  for (let i in process.argv) {
    if (process.argv[i] === 'dev') {
      setDev = true;
    } else if (
        process.argv[i] === 'minimal' || process.argv[i] === 'onlymusic') {
      minimal = true;
    } else if (process.argv[i] === 'test') {
      testInstance = true;
    } else if (i > 1 && typeof process.argv[i] === 'string') {
      subModuleNames.push(process.argv[i]);
    }
  }
  // Attempt to load submodules.
  for (let i in subModuleNames) {
    if (typeof subModuleNames[i] !== 'string' ||
        !subModuleNames[i].startsWith('./')) {
      continue;
    }
    try {
      subModules[i] = require(subModuleNames[i]);
    } catch (err) {
      console.log(subModuleNames[i], err);
    }
  }

  const isDev = setDev;
  const prefix = isDev ? '~' : '?';

  common.begin(false, !isDev);
  if (minimal) common.log('STARTING IN MINIMAL MODE');

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
      if (cmd.startsWith(prefix)) cmd = cmd.replace(prefix, '');
      if (cmds[cmd]) {
        if (cmds[cmd].validOnlyOnServer && msg.guild === null) {
          common.reply(msg, onlyservermessage);
          return true;
        } else if (
            blacklist[cmd] && blacklist[cmd].lastIndexOf(msg.channel.id) > -1) {
          common.reply(msg, disabledcommandmessage);
          return true;
        }
        msg.text = msg.content.replace(prefix + cmd, '');
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
    return msg.content.startsWith(prefix + cmd);
  }
  /**
   * Changes the bot's status message.
   *
   * @private
   * @param {string} game New message to set game to.
   */
  function updateGame(game) {
    client.user.setPresence({
      activity:
          {name: game, type: 'WATCHING', url: 'https://www.spikeybot.com'},
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
    common.log(`Logged in as ${client.user.tag}!`);
    if (!minimal) {
      if (testInstance) {
        updateGame('Running unit test...');
      } else {
        updateGame(prefix + 'help for help');
      }
    }
    client.users.fetch(common.spikeyId).then((user) => {
      if (testInstance) {
        user.send('Beginning in unit test mode');
      } else {
        user.send('I just rebooted (JS)' + (minimal ? ' MINIMAL' : ' ALL'));
      }
    });
    for (let i in subModules) {
      if (!subModules[i] instanceof Object || !subModules[i].begin) continue;
      try {
        subModules[i].begin(prefix, Discord, client, command, common);
      } catch (err) {
        console.log(err);
        client.users.fetch(common.spikeyId).then((function(i) {
          return function(user) {
            user.send('Failed to initialize ' + subModuleNames[i]);
          };
        })(i));
      }
    }
    if (subModules.length != subModuleNames.length) {
      client.users.fetch(common.spikeyId).then((user) => {
        user.send(
            'Failed to compile a submodule. Check log for more info. ' +
            'Previous initialization errors may be incorrect.');
      });
    }
    if (!minimal) {
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
        msg.content === '~`END UNIT TESTS`~' && msg.channel.id == testChannel) {
      testMode = false;
      msg.channel.send('~`UNIT TEST MODE DISABLED`~');
      return;
    }

    // Only respond to messages in the test channel if we are in unit test mode.
    // In unit test mode, only respond to messages in the test channel.
    if (testMode != (msg.channel.id == testChannel)) return;

    if (!minimal && msg.content.endsWith(', I\'m Dad!')) {
      msg.channel.send('Hi Dad, I\'m Spikey!');
    }
    if (!testMode && msg.author.bot) return;

    // If message is equation we can graph.
    const regexForm = new RegExp('^[yY]\\s*=');
    if (msg.content.match(regexForm)) {
      msg.content = '?graph ' + msg.content;
    }

    if (msg.guild === null && !msg.content.startsWith(prefix)) {
      msg.content = prefix + msg.content;
    }

    if (!minimal && reactToAnthony && msg.author.id == '174030717846552576') {
      msg.react('😮');
    }

    if (isCmd(msg, '')) {
      if (!minimal) {
        if (msg.guild !== null) {
          common.log(
              msg.guild.name + '#' + msg.channel.name + '@' +
              msg.author.username + msg.content.replaceAll('\n', '\\n'));
        } else {
          common.log(
              'PM: @' + msg.author.username +
              msg.content.replaceAll('\n', '\\n'));
        }
      }
      if (!command.trigger(msg.content.split(/ |\n/)[0], msg) &&
          msg.guild === null && !minimal && !testMode) {
        msg.channel.send(
            'Oops! I\'m not sure how to help with that! Type **help** for a ' +
            'list of commands I know how to respond to.');
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
        for (let i in subModules) {
          if (subModules[i] instanceof Object && subModules[i].helpMessage) {
            msg.author.send(subModules[i].helpMessage);
          }
        }
        if (msg.guild !== null) common.reply(msg, helpmessagereply, ':wink:');
      } catch (err) {
        common.reply(msg, blockedmessage);
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
        let game = msg.content.replace(prefix + 'updategame ', '');
        updateGame(game);
        common.reply(msg, 'I changed my status to "' + game + '"!');
      }
    }
  }

  command.on('reboot', commandReboot);
  /**
   * Trigger a reboot of the bot. Actually just gracefully shuts down, and
   * expects to be immediately restarted.
   *
   * @private
   * @type {commandHandler}
   * @param {Discord~Message} msg Message that triggered command.
   * @listens SpikeyBot~Command#reboot
   */
  function commandReboot(msg) {
    if (trustedIds.includes(msg.author.id)) {
      for (let i = 0; i < subModules.length; i++) {
        if (subModules[i] && subModules[i].end) subModules[i].end();
      }
      if (minimal) {
        process.exit(-1);
      } else {
        common.reply(msg, 'Rebooting...').then((msg) => {
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
          process.exit(-1);
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
        let error = false;
        for (let i in subModules) {
          if (!subModules[i] instanceof Object) continue;
          if (toReload.length > 0) {
            if (!toReload.find(function(el) {
                  return subModuleNames[i] == el;
                })) {
              continue;
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
            subModules[i] = require(subModuleNames[i]);
            subModules[i].begin(prefix, Discord, client, command, common);
            reloaded.push(subModuleNames[i]);
          } catch (err) {
            error = true;
            common.error('Failed to reload ' + subModuleNames[i]);
            console.log(err);
          }
        }
        if (error) {
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

  // Dev:
  // https://discordapp.com/oauth2/authorize?&client_id=422623712534200321&scope=bot
  // Rel:
  // https://discordapp.com/oauth2/authorize?&client_id=318552464356016131&scope=bot
  if (isDev) {
    client.login(auth.dev);
  } else {
    client.login(auth.release);
  }
}

module.exports = new SpikeyBot();
