// Copyright 2018-2019 Campbell Crowley. All rights reserved.
// Author: Campbell Crowley (dev@campbellcrowley.com)
const dateFormat = require('dateformat');
const Discord = require('discord.js');
const fs = require('fs');
const mkdirp = require('mkdirp');

/**
 * Commonly required things. Helper functions and constants.
 *
 * @class
 */
function Common() {
  const self = this;
  /**
   * The number of characters reserved for the filename of the script.
   * @private
   * @constant
   * @type {number}
   * @default
   */
  const prefixLength = 14;

  /**
   * The color code to prefix log messages with for this script.
   * @private
   * @type {number}
   * @default
   */
  let mycolor = 0;
  /**
   * The script's filename to show in the log.
   * @private
   * @type {string}
   * @constant
   */
  const app = process.argv[1] ?
      process.argv[1].substring(process.argv[1].lastIndexOf('/') + 1) :
      '';
  /**
   * The final formatted filename for logging.
   * @private
   * @type {string}
   */
  let title;

  /**
   * Whether this should be shown as a release version, or a debug version in
   * the log.
   * @type {boolean}
   */
  this.isRelease = false;
  /**
   * Whether this current instance is running as a unit test.
   * @type {boolean}
   */
  this.isTest = false;

  /**
   * Initialize variables and settings for logging properly.
   *
   * @param {boolean} isTest Is this running as a test.
   * @param {boolean} isRelease Is this a release version, or a development
   * version of the app running.
   */
  this.begin = function(isTest, isRelease) {
    self.isRelease = isRelease || false;
    self.isTest = isTest || false;
    switch (app) {
      case 'SpikeyBot.js':
        mycolor = 44;
        break;
    }
    let temptitle = app;
    if (self.isRelease) temptitle = 'R' + temptitle;
    else temptitle = 'D' + temptitle;

    for (let i = temptitle.length; i < prefixLength; i++) {
      temptitle += ' ';
    }
    if (temptitle.length > prefixLength) {
      temptitle = temptitle.substring(0, prefixLength);
    }
    temptitle += ' ';
    title = temptitle;

    self.log(app + ' Begin');
  };

  /**
   * Pad an IP address with zeroes.
   *
   * @param {number} str The ipv4 address as a string to format.
   * @returns {string} The padded address.
   */
  this.padIp = function(str) {
    const dM = str.match(/\./g);
    const cM = str.match(/:/g);
    if (dM && dM.length == 3) {
      const res = str.split('.');
      for (let i = 0; i < res.length; i++) {
        res[i] = ('000' + res[i]).slice(-3);
        res[i] = res[i].replace(':', '0');
      }
      str = res.join('.');
    } else if (cM && cM.length == 7) {
      const res = str.split(':');
      for (let i = 0; i < res.length; i++) {
        res[i] = ('0000' + res[i]).slice(-4);
        // res[i] = res[i].replace(':', '0');
      }
      str = res.join(':');
    }
    for (let i = str.length; i < 45; i++) {
      str += ' ';
    }
    return str.substring(0, 45);
  };

  /**
   * Formats a given IP address by padding with zeroes, or completely replacing
   * with a human readable alias if the address is a known location.
   *
   * @param {string} ip The ip address to format.
   * @returns {string} The formmatted address.
   */
  this.getIPName = function(ip) {
    ip = self.padIp(ip);
    switch (ip) {
      default:
        return ip;
      case '':
      case '   ':
      case '127.000.000.001':
        return 'SELF           ';
      case '205.167.046.140':
      case '205.167.046.157':
      case '205.167.046.15':
      case '204.088.159.118':
        return 'MVHS           ';
    }
  };
  /**
   * Format a prefix for a log message or error. Includes the ip before the
   * message.
   *
   * @param {string} ip The ip to include in the prefix.
   * @returns {string} The formatted prefix for a log message.
   */
  this.updatePrefix = function(ip) {
    if (typeof ip === 'undefined') {
      ip = '               ';
    }
    const formattedIP = self.getIPName(ip.replace('::ffff:', ''));

    const date = dateFormat(new Date(), 'mm-dd HH:MM:ss');
    return `[${title}${date} ${formattedIP}]:`;
  };

  /**
   * Write the final portion of the log message.
   *
   * @private
   * @param {string} message The message to display.
   * @param {string} ip The IP address or unique identifier of the client that
   * caused this event to happen.
   * @param {number} [traceIncrease=0] Increase the distance up the stack to
   * show the in the log.
   */
  function write(message, ip, traceIncrease = 0) {
    process.stdout.write(getTrace(traceIncrease + 1));
    if (self.isRelease) {
      process.stdout.write(`${self.updatePrefix(ip)}\x1B[;${mycolor}m`);
    } else {
      process.stdout.write(`\x1B[;${mycolor}m${self.updatePrefix(ip)}`);
    }
    message = message.toString().replace(/\n/g, '\\n');
    process.stdout.write(` ${message}`);
    process.stdout.write('\x1B[1;0m\n');
  }

  /**
   * Format a log message to be logged. Prefixed with DBG.
   *
   * @param {string} message The message to display.
   * @param {string} ip The IP address or unique identifier of the client that
   * caused this event to happen.
   * @param {number} [traceIncrease=0] Increase the distance up the stack to
   * show the in the log.
   */
  this.logDebug = function(message, ip, traceIncrease = 0) {
    process.stdout.write('DBG:');
    write(message, ip, traceIncrease);
  };

  /**
   * Format a log message to be logged.
   *
   * @param {string} message The message to display.
   * @param {string} ip The IP address or unique identifier of the client that
   * caused this event to happen.
   * @param {number} [traceIncrease=0] Increase the distance up the stack to
   * show the in the log.
   */
  this.log = function(message, ip, traceIncrease = 0) {
    process.stdout.write('INF:');
    write(message, ip, traceIncrease);
  };

  /**
   * Format a log message to be logged. Prefixed with WRN.
   *
   * @param {string} message The message to display.
   * @param {string} ip The IP address or unique identifier of the client that
   * caused this event to happen.
   * @param {number} [traceIncrease=0] Increase the distance up the stack to
   * show the in the log.
   */
  this.logWarning = function(message, ip, traceIncrease = 0) {
    process.stdout.write('WRN:');
    write(message, ip, traceIncrease);
  };

  /**
   * Format an error message to be logged.
   *
   * @param {string} message The message to display.
   * @param {string} ip The IP address or unique identifier of the client that
   * caused this event to happen.
   * @param {number} [traceIncrease=0] Increase the distance up the stack to
   * show the in the log.
   */
  this.error = function(message, ip, traceIncrease = 0) {
    message = `${message}`.replace(/\n/g, '\\n');
    process.stderr.write('ERR:');
    process.stderr.write(getTrace(traceIncrease));
    process.stderr.write('\x1B[;31m');
    process.stderr.write(`${self.updatePrefix(ip)} ${message}`);
    process.stderr.write('\x1B[1;0m\n');
  };

  /**
   * Replies to the author and channel of msg with the given message.
   *
   * @param {Discord~Message} msg Message to reply to.
   * @param {string} text The main body of the message.
   * @param {string} [post] The footer of the message.
   * @returns {?Promise} Promise of Discord~Message that we attempted to send,
   * or null if error occurred before attempting to send.
   */
  this.reply = function(msg, text, post) {
    if (!msg.channel || !msg.channel.send) {
      return null;
    }
    const trace = getTrace(0);
    const perms = msg.channel.permissionsFor &&
        msg.channel.permissionsFor(msg.client.user);
    if (perms && !perms.has('SEND_MESSAGES')) {
      self.logDebug(
          'Failed to send reply to channel ' + msg.channel.id +
              ' due to lack of perms.',
          trace);
      return new Promise((resolve, reject) => {
        reject(new Error('No Perms'));
      });
    }
    if (self.isTest || (perms && !perms.has('EMBED_LINKS'))) {
      return msg.channel
          .send(Common.mention(msg) + '\n```\n' + text + '\n```' + (post || ''))
          .catch((err) => {
            self.error(
                'Failed to send reply to channel: ' + msg.channel.id, trace);
            throw err;
          });
    } else {
      const embed = new Discord.MessageEmbed();
      embed.setColor([255, 0, 255]);
      if (text.length <= 256) {
        embed.setTitle(text);
        if (post) {
          embed.setDescription(post);
        }
      } else {
        embed.setDescription(text + (post ? '\n' + post : ''));
      }
      return msg.channel.send(Common.mention(msg), embed).catch((err) => {
        self.error(
            'Failed to send embed reply to channel: ' + msg.channel.id, trace);
        throw err;
      });
    }
  };


  /**
   * Gets the name and line number of the current function stack.
   *
   * @private
   *
   * @param {number} [traceIncrease=0] Increase the distance up the stack to
   * show the in the log.
   * @returns {string} Formatted string with length 24.
   */
  function getTrace(traceIncrease = 0) {
    if (typeof traceIncrease !== 'number') traceIncrease = 0;
    // let func = __function(traceIncrease) + ':' + __line(traceIncrease);
    let func = __filename(traceIncrease) + ':' + __line(traceIncrease);
    while (func.length < 20) func += ' ';
    func = ('00000' + process.pid).slice(-5) + ' ' +
        func.substr(func.length - 20, 20);
    return func;
  }

  /**
   * Gets the line number of the function that called a log function.
   *
   * @private
   * @param {number} [inc=0] Increase distance up the stack to returns.
   * @returns {number} Line number of call in stack.
   */
  function __line(inc = 0) {
    return __stack()[3 + inc].getLineNumber();
  }

  /**
   * Gets the name of the function that called a log function.
   *
   * @private
   * @param {number} [inc=0] Increase distance up the stack to return.
   * @return {string} Function name in call stack.
   */
  /* function __function(inc = 0) {
    return __stack()[3 + inc].getFunctionName();
  } */

  /**
   * Gets the name of the file that called a log function.
   *
   * @private
   * @param {number} [inc=0] Increase distance up the stack to returns.
   * @returns {string} Filename in call stack.
   */
  function __filename(inc = 0) {
    return __stack()[3 + inc].getFileName();
  }
}

/**
 * SpikeyRobot's Discord ID. If you are self-hosting SpikeyBot, change this to
 * your account ID to be able to give yourself full access to all features of
 * the bot.
 *
 * @type {string}
 * @default
 * @constant
 */
Common.prototype.spikeyId = '124733888177111041';
/**
 * SpikeyRobot's Discord ID
 *
 * @type {string}
 * @default
 * @constant
 */
Common.spikeyId = Common.prototype.spikeyId;

/**
 * Discord IDs that are allowed to reboot the bot, and are overall trusted
 * individuals/accounts.
 *
 * @type {string[]}
 * @constant
 */
Common.prototype.trustedIds = [
  Common.spikeyId,       // Me
  '126464376059330562',  // Rohan
  '479294447184773130',  // DV0RAK
];
/**
 * Trusted IDs.
 * @see {@link Common.prototype.trustedIds}
 *
 * @constant
 * @type {string[]}
 */
Common.trustedIds = Common.prototype.trustedIds;

/**
 * Format a Discord API error.
 *
 * @param {Discord~DiscordAPIError} e DiscordAPIError to format into a string.
 * @returns {string} Error formatted as single line string.
 */
Common.prototype.fmtDAPIErr = function(e) {
  const pid = `00000${process.pid}`.slice(-5);
  return `ERR:${pid}                     [ SpikeyBot.js ` +
      `${e.name}: ${e.message} ${e.method} ${e.code} (${e.path})`;
};

/**
 * Format a Discord API error.
 *
 * @param {Discord~DiscordAPIError} e DiscordAPIError to format into a string.
 * @returns {string} Error formatted as single line string.
 */
Common.fmtDAPIErr = Common.prototype.fmtDAPIErr;

/**
 * The channel id for the channel to send general log messages to.
 *
 * @default
 * @constant
 * @type {string}
 */
Common.prototype.logChannel = '473935520821673991';
/**
 * The channel id for the channel to send general log messages to.
 *
 * @default
 * @constant
 * @type {string}
 */
Common.logChannel = Common.prototype.logChannel;


/**
 * The website base URL for pointing to for more help and documentation.
 *
 * @type {string}
 * @constant
 * @default
 */
Common.prototype.webURL = 'https://www.spikeybot.com/';
/**
 * The website base URL for pointing to for more help and documentation.
 *
 * @type {string}
 * @constant
 */
Common.webURL = Common.prototype.webURL;

/**
 * The website path for more help and documentation.
 *
 * @type {string}
 * @constant
 * @default
 */
Common.prototype.webPath = 'help/';
/**
 * The website path for more help and documentation.
 *
 * @type {string}
 * @constant
 */
Common.webPath = Common.prototype.webPath;

/**
 * The website full URL for commands help page.
 *
 * @type {string}
 * @constant
 * @default
 */
Common.prototype.webHelp = Common.webURL + Common.webPath;
/**
 * The website full URL for commands help page.
 *
 * @type {string}
 * @constant
 */
Common.webHelp = Common.prototype.webHelp;

/**
 * The root file directory for finding saved data related to individual
 * guilds.
 *
 * @type {string}
 * @constant
 * @default
 */
Common.prototype.guildSaveDir = './save/guilds/';
/**
 * The root file directory for finding saved data related to individual
 * guilds.
 *
 * @type {string}
 * @constant
 */
Common.guildSaveDir = Common.prototype.guildSaveDir;

/**
 * The root file directory for finding saved data related to individual
 * users.
 *
 * @type {string}
 * @constant
 * @default
 */
Common.prototype.userSaveDir = './save/users/';
/**
 * The root file directory for finding saved data related to individual
 * users.
 *
 * @type {string}
 * @constant
 */
Common.userSaveDir = Common.prototype.userSaveDir;

/**
 * Creates formatted string for mentioning the author of msg.
 *
 * @param {Discord~Message|Discord~UserResolvable} msg Message to format a
 * mention for the author of.
 * @returns {string} Formatted mention string.
 */
Common.prototype.mention = function(msg) {
  if (msg.author) {
    return `<@${msg.author.id}>`;
  } else if (msg.id) {
    return `<@${msg.id}>`;
  }
};
/**
 * Creates formatted string for mentioning the author of msg.
 *
 * @param {Discord~Message} msg Message to format a mention for the author of.
 * @return {string} Formatted mention string.
 */
Common.mention = Common.prototype.mention;


/**
 * Write data to a file and make sure the directory exists or create it if it
 * doesn't. Async.
 *
 * @see {@link Common~mkAndWriteSync}
 *
 * @public
 * @static
 * @param {string} filename The name of the file including the directory.
 * @param {string} dir The directory path without the file's name.
 * @param {string} data The data to write to the file.
 */
Common.mkAndWrite = function(filename, dir, data) {
  mkdirp(dir, (err) => {
    if (err) {
      this.error(`Failed to make directory: ${dir}`);
      console.error(err);
      return;
    }
    fs.writeFile(filename, data, (err2) => {
      if (err2) {
        this.error(`Failed to save file: ${filename}`);
        console.error(err2);
        return;
      }
    });
  });
};
Common.prototype.mkAndWrite = Common.mkAndWrite;
/**
 * Write data to a file and make sure the directory exists or create it if it
 * doesn't. Synchronous.
 *
 * @see {@link Common~mkAndWrite}
 *
 * @private
 * @param {string} filename The name of the file including the directory.
 * @param {string} dir The directory path without the file's name.
 * @param {string} data The data to write to the file.
 */
Common.mkAndWriteSync = function(filename, dir, data) {
  try {
    mkdirp.sync(dir);
  } catch (err) {
    this.error(`Failed to make directory: ${dir}`);
    console.error(err);
    return;
  }
  try {
    fs.writeFileSync(filename, data);
  } catch (err) {
    this.error(`Failed to save file: ${filename}`);
    console.error(err);
    return;
  }
};
Common.prototype.mkAndWriteSync = Common.mkAndWriteSync;

/* eslint-disable-next-line no-extend-native */
String.prototype.replaceAll = function(search, replacement) {
  const target = this;
  return target.replace(new RegExp(search, 'g'), replacement);
};

/**
 * @description Gets the stack trace of the current function call.
 *
 * @private
 * @returns {Stack} Error stack for logging.
 */
function __stack() {
  const orig = Error.prepareStackTrace;
  Error.prepareStackTrace = function(_, stack) {
    return stack;
  };
  const err = new Error();
  /* eslint-disable-next-line no-caller */
  Error.captureStackTrace(err, arguments.callee);
  const stack = err.stack;
  Error.prepareStackTrace = orig;
  return stack;
}

const oldErr = console.error;
/**
 * @description Augment console.error to reformat DiscordAPIErrors to be more
 * pretty.
 * @param {*} args Arguments to pass through to console.error.
 */
console.error = function(...args) {
  if (args.length == 1 && (args[0] instanceof Discord.DiscordAPIError)) {
    args[0] = Common.fmtDAPIErr(args[0]);
  } else {
    const pid = `00000${process.pid}`.slice(-5);
    oldErr(`ERR:${pid}                     [ SpikeyBot.js  `, ...args);
    return;
  }
  oldErr(...args);
};

module.exports = new Common();
