const Discord = require('discord.js');
const fs = require('fs');
const common = require('./common.js');
const auth = require('./auth.js');
const client = new Discord.Client();

let testMode = false;
let subModuleNames = [];
let setDev = false;
let onlymusic = false;
let subModules = [];
for (let i in process.argv) {
  if (process.argv[i] === 'dev') {
    setDev = true;
  } else if (process.argv[i] === 'onlymusic') {
    onlymusic = true;
  } else if (i > 1 && typeof process.argv[i] === 'string') {
    subModuleNames.push(process.argv[i]);
  }
}
for (let i in subModuleNames) {
  if (typeof subModuleNames[i] !== 'string') continue;
  try {
    subModules[i] = require(subModuleNames[i]);
  } catch (err) {
    console.log(subModuleNames[i], err);
  }
}

const isDev = setDev;
const prefix = isDev ? '~' : '?';

common.begin(false, !isDev);
if (onlymusic) common.log('STARTING IN MUSIC ONLY MODE');

let reactToAnthony = true;

// Password for changing the game the bot is playing. This doesn't need to be
// secure, and I could probably just remove it.
const password = 'password';
const spikeyId = '124733888177111041';
const trustedIds = [
  spikeyId, // Me
  '126464376059330562', // Rohan
];

const introduction = '\nHello! My name is SpikeyBot.\nI was created by ' +
    'SpikeyRobot#9836, so if you wish to add any features, feel free to PM ' +
    'him! (Tip: Use **' + prefix + 'pmspikey**)\n\nIf you\'d like to know ' +
    'what I can do, type **' + prefix + 'help** in a PM to me and I\'ll let ' +
    'you know!';
const helpmessagereply = 'I sent you a DM with commands!';
const blockedmessage =
    'I couldn\'t send you a message, you probably blocked me :(';
const onlyservermessage = 'This command only works in servers, sorry!';
const disabledcommandmessage =
    'This command has been disabled in this channel.';

/** Defines command event triggering interface. */
function Command() {
  // All tracked commands with handlers.
  let cmds = {};
  // List of disabled commands.
  let blacklist = {};

  /**
   * The function to call when a command is triggered.
   *
   * @callback commandHandler
   * @param {Discord.Message} msg The message sent in Discord.
   */

  /**
   * Trigger a command firing and call it's handler passing in msg as only
   * argument.
   *
   * @param {string} cmd Array of strings or a string of the command to
   * trigger.
   * @param {Discord.Message} msg Message received from Discord to pass to
   * handler.
   * @return {boolean} True if command was handled by us.
   */
  this.trigger = function(cmd, msg) {
    if (cmd.startsWith(prefix)) cmd = cmd.replace(prefix, '');
    if (cmds[cmd]) {
      if (cmds[cmd].validOnlyOnServer && msg.guild === null) {
        reply(msg, onlyservermessage);
        return true;
      } else if (
          blacklist[cmd] && blacklist[cmd].lastIndexOf(msg.channel.id) > -1) {
        reply(msg, disabledcommandmessage);
        return true;
      }
      try {
        cmds[cmd](msg);
      } catch (err) {
        common.error(cmd + ': FAILED');
        console.log(err);
        reply(msg, 'An error occurred! Oh noes!');
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
   * @param {boolean} [onlyserver=false] Whether the command is only allowed on
   * a server.
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
              'Requested deletion of event handler for event that was never ' +
              'registered! (' + cmd[i] + ')');
        }
      }
    } else {
      throw new Error('Event must be string or array of strings');
    }
  };
  /**
   * Temporarily disables calling the handler for the given command in a certain
   * Discord text channel.
   *
   * @param {string} cmd Command to disable.
   * @param {string} channel ID of channel to disable command for.
   */
  this.disable = function(cmd, channel) {
    if (cmds[cmd]) {
      if (!blacklist[cmd] || blacklist[cmd].lastIndexOf(channel) == -1) {
        if (!blacklist[cmd]) blacklist[cmd] = [channel];
        else blacklist[cmd].push(channel);
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
const command = new Command();

/**
 * Checks if given message is the given command.
 *
 * @param {Discord.Message} msg Message from Discord to check if it is the given
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
 * @param {string} password_ Password required to change status.
 * @param {string} game New message to set game to.
 * @return {boolean} True if an error occurred.
 */
function updateGame(password_, game) {
  if (password_ == password) {
    client.user.setActivity(game, {name: game, type: 'WATCHING'});
    common.log('Changed game to "' + game + '"');
    return false;
  } else {
    common.log('Didn\'t change game (' + password_ + ')');
    return true;
  }
}
/**
 * Creates formatted string for mentioning the author of msg.
 *
 * @param {Discord.Message} msg Message to format a mention for the author of.
 * @return {string} Formatted mention string.
 */
function mention(msg) {
  return `<@${msg.author.id}>`;
}
/**
 * Replies to the author and channel of msg with the given message.
 *
 * @param {Discord.Message} msg Message to reply to.
 * @param {string} text The main body of the message.
 * @param {string} post The footer of the message.
 * @return {Promise} Promise of Discord.Message that we attempted to send.
 */
function reply(msg, text, post) {
  post = post || '';
  return msg.channel.send(mention(msg) + '\n```\n' + text + '\n```' + post);
}

// BEGIN //
client.on('ready', () => {
  common.log(`Logged in as ${client.user.tag}!`);
  if (!onlymusic) updateGame(password, prefix + 'help for help');
  client.users.fetch(spikeyId).then((user) => {
    user.send('I just rebooted (JS)' + (onlymusic ? ' ONLYMUSIC' : ' ALL'));
  });
  for (let i in subModules) {
    if (!subModules[i] instanceof Object || !subModules[i].begin) continue;
    try {
      subModules[i].begin(prefix, Discord, client, command, common);
    } catch (err) {
      console.log(err);
      client.users.fetch(spikeyId).then((function(i) {
        return function(user) {
          user.send('Failed to initialize ' + subModuleNames[i]);
        };
      })(i));
    }
  }
  if (subModules.length != subModuleNames.length) {
    client.users.fetch(spikeyId).then((user) => {
      user.send(
          'Failed to compile a submodule. Check log for more info. Previous ' +
          'initialization errors may be incorrect.');
    });
  }
  if (!onlymusic) {
    fs.readFile('reboot.dat', function(err, file) {
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
});

// Handle a message sent.
client.on('message', (msg) => {
  if (!testMode && msg.author.id === client.user.id) {
    if (isDev && msg.content === '~`RUN UNIT TESTS`~') {
      testMode = true;
      msg.channel.send('~`UNIT TEST MODE ENABLED`~');
    }
    return;
  } else if (testMode && msg.author.id !== client.user.id) {
    return;
  } else if (
      testMode && msg.author.id === client.user.id &&
      msg.content === '~`END UNIT TESTS`~') {
    testMode = false;
    msg.channel.send('~`UNIT TEST MODE DISABLED`~');
    return;
  }
  if (!onlymusic && msg.content.endsWith(', I\'m Dad!')) {
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

  if (!onlymusic && reactToAnthony && msg.author.id == '174030717846552576') {
    msg.react('😮');
  }

  if (isCmd(msg, '')) {
    if (!onlymusic) {
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
        msg.guild === null && !onlymusic && !testMode) {
      msg.channel.send(
          'Oops! I\'m not sure how to help with that! Type **help** for a ' +
          'list of commands I know how to respond to.');
    }
  }
});

if (!onlymusic) {
  // Handle being added to a guild.
  client.on('guildCreate', (guild) => {
    common.log('ADDED TO NEW GUILD: ' + guild.id + ': ' + guild.name);
    let channel = '';
    let pos = -1;
    try {
      guild.channels.forEach(function(val, key) {
        if (val.type != 'voice' && val.type != 'category') {
          if (pos == -1 || val.position < pos) {
            pos = val.position;
            channel = val.id;
          }
        }
      });
      client.channels.get(channel).send(introduction);
    } catch (err) {
      common.error('Failed to send welcome to guild:' + guild.id);
      console.log(err);
    }
  });

  // Handle user banned on a guild.
  client.on('guildBanAdd', (guild, user) => {
    let channel = '';
    let pos = -1;
    try {
      guild.channels.forEach(function(val, key) {
        if (val.type != 'voice' && val.type != 'category') {
          if (pos == -1 || val.position < pos) {
            pos = val.position;
            channel = val.id;
          }
        }
      });
      guild.fetchAuditLogs({limit: 1})
          .then((logs) => {
            client.channels.get(channel).send(
                '`Poof! ' + logs.entries.first().executor.username +
                ' has ensured ' + user.username +
                ' will never be seen again...`');
          })
          .catch((err) => {
            client.channels.get(channel).send(
                '`Poof! ' + user.username + ' was never seen again...`');
            common.error('Failed to find executor of ban.');
            console.log(err);
          });
    } catch (err) {
      common.error('Failed to send ban from guild:' + guild.id);
      console.log(err);
    }
  });

  // Toggle reactions to Anthony.
  command.on('togglereact', (msg) => {
    reply(msg, 'Toggled reactions to Anthony to ' + !reactToAnthony + '. 😮');
    reactToAnthony = !reactToAnthony;
  });
  // Send help message to user who requested it.
  command.on('help', (msg) => {
    try {
      for (let i in subModules) {
        if (subModules[i] instanceof Object && subModules[i].helpMessage) {
          msg.author.send(subModules[i].helpMessage);
        }
      }
      if (msg.guild !== null) reply(msg, helpmessagereply, ':wink:');
    } catch (err) {
      reply(msg, blockedmessage);
    }
  });
  // Change current status message.
  command.on('updategame', (msg) => {
    msg.delete();
    let command = msg.content.replace(prefix + 'updategame ', '');
    let password = command.split(' ')[0];
    let game = command.replace(password + ' ', '');
    if (updateGame(password, game)) {
      reply(msg, 'I\'m sorry, but you are not allowed to do that. :(\n');
    } else {
      reply(msg, 'I changed my status to "' + game + '"!');
    }
  });
}

// Trigger a reboot of the bot. Actually just gracefully shuts down, and expects
// to be immediately restarted.
command.on('reboot', (msg) => {
  if (trustedIds.includes(msg.author.id)) {
    if (onlymusic) {
      process.exit(-1);
    } else {
      reply(msg, 'Rebooting...').then((msg) => {
        let toSave = {
          id: msg.id,
          channel: {id: msg.channel.id},
          noReactToAnthony: !reactToAnthony,
        };
        try {
          fs.writeFileSync('reboot.dat', JSON.stringify(toSave));
        } catch (err) {
          common.error('Failed to save reboot.dat');
          console.log(err);
        }
        process.exit(-1);
      });
    }
  } else {
    reply(
        msg, 'LOL! Good try!',
        'It appears SpikeyRobot doesn\'t trust you enough with this command. ' +
            'Sorry!');
  }
});
// Reload all sub modules by unloading then re-requiring.
command.on('reload', (msg) => {
  if (trustedIds.includes(msg.author.id)) {
    reply(msg, 'Reloading modules...').then((warnMessage) => {
      let error = false;
      for (let i in subModules) {
        if (!subModules[i] instanceof Object) continue;
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
        } catch (err) {
          error = true;
          common.error('Failed to reload ' + subModuleNames[i]);
          console.log(err);
        }
      }
      if (error) {
        warnMessage.edit('`Reload completed with errors.`');
      } else if (onlymusic) {
        warnMessage.delete();
      } else {
        warnMessage.edit('`Reload complete.`');
      }
    });
  } else {
    reply(
        msg, 'LOL! Good try!',
        'It appears SpikeyRobot doesn\'t trust you enough with this command. ' +
            'Sorry!');
  }
});

// Dev:
// https://discordapp.com/oauth2/authorize?&client_id=422623712534200321&scope=bot
// Rel:
// https://discordapp.com/oauth2/authorize?&client_id=318552464356016131&scope=bot
if (isDev) {
  client.login(auth.dev);
} else {
  client.login(auth.release);
}
