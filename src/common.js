// Copyright 2018-2019 Campbell Crowley. All rights reserved.
// Author: Campbell Crowley (dev@campbellcrowley.com)
const dateFormat = require('dateformat');
const Discord = require('discord.js');

/**
 * Commonly required things. Helper functions and constants.
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
   * Pad an IP address with zeroes
   *
   * @param {number} str The ipv4 address as a string to format.
   * @return {string} The padded address.
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
   * @return {string} The formmatted address.
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
      case '192.168.001.116':
        return 'RPI            ';
      case '132.241.174.082':
      case '132.241.174.226':
      case '132.241.174.112':
        return 'CHICO          ';
      case '098.210.161.122':
        return 'HOME           ';
      case '076.021.061.017':
        return 'OLD HOME       ';
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
   * @return {string} The formatted prefix for a log message.
   */
  this.updatePrefix = function(ip) {
    if (typeof ip === 'undefined') {
      ip = '               ';
    }
    const formattedIP = self.getIPName(ip.replace('::ffff:', ''));

    const date = dateFormat(new Date(), 'mm-dd HH:MM:ss');
    return '[' + title + date + ' ' + formattedIP + ']:';
  };

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
    message = ('' + message).replace(/\n/g, '\\n');
    if (self.isRelease) {
      console.log(
          'DBG:' + getTrace(traceIncrease) + self.updatePrefix(ip),
          '\x1B[;' + mycolor + 'm' + message, '\x1B[1;0m');
    } else {
      console.log(
          'DBG:' + getTrace(traceIncrease) + '\x1B[;' + mycolor + 'm' +
              self.updatePrefix(ip),
          message, '\x1B[1;0m');
    }
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
    message = ('' + message).replace(/\n/g, '\\n');
    if (self.isRelease) {
      console.log(
          'INF:' + getTrace(traceIncrease) + self.updatePrefix(ip),
          '\x1B[;' + mycolor + 'm' + message, '\x1B[1;0m');
    } else {
      console.log(
          'INF:' + getTrace(traceIncrease) + '\x1B[;' + mycolor + 'm' +
              self.updatePrefix(ip),
          message, '\x1B[1;0m');
    }
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
    message = ('' + message).replace(/\n/g, '\\n');
    if (self.isRelease) {
      console.log(
          'WRN:' + getTrace(traceIncrease) + self.updatePrefix(ip),
          '\x1B[;' + mycolor + 'm' + message, '\x1B[1;0m');
    } else {
      console.log(
          'WRN:' + getTrace(traceIncrease) + '\x1B[;' + mycolor + 'm' +
              self.updatePrefix(ip),
          message, '\x1B[1;0m');
    }
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
    message = ('' + message).replace(/\n/g, '\\n');
    console.log(
        'ERR:' + getTrace(traceIncrease) + '\x1B[;31m' + self.updatePrefix(ip),
        message, '\x1B[1;0m');
  };

  /**
   * Replies to the author and channel of msg with the given message.
   *
   * @param {Discord~Message} msg Message to reply to.
   * @param {string} text The main body of the message.
   * @param {string} [post] The footer of the message.
   * @return {?Promise} Promise of Discord~Message that we attempted to send, or
   * null if error occurred before attempting to send.
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
   * @private
   *
   * @param {number} [traceIncrease=0] Increase the distance up the stack to
   * show the in the log.
   * @return {string} Formatted string with length 24.
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
   * @param {number} [inc=0] Increase distance up the stack to return;
   * @return {number} Line number of call in stack.
   */
  function __line(inc = 0) {
    return __stack()[3 + inc].getLineNumber();
  }

  /**
   * Gets the name of the function that called a log function.
   *
   * @private
   * @param {number} [inc=0] Increase distance up the stack to return;
   * @return {string} Function name in call stack.
   */
  /* function __function(inc = 0) {
    return __stack()[3 + inc].getFunctionName();
  } */

  /**
   * Gets the name of the file that called a log function.
   *
   * @private
   * @param {number} [inc=0] Increase distance up the stack to return;
   * @return {string} Filename in call stack.
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
 * @return {string} Error formatted as single line string.
 */
Common.prototype.fmtDAPIErr = function(e) {
  return `ERR:${process.pid} ${e.name}: ${e.message}` +
      ` ${e.method} ${e.code} (${e.path})`;
};

/**
 * Format a Discord API error.
 *
 * @param {Discord~DiscordAPIError} e DiscordAPIError to format into a string.
 * @return {string} Error formatted as single line string.
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
 * @return {string} Formatted mention string.
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


/* eslint-disable-next-line no-extend-native */
String.prototype.replaceAll = function(search, replacement) {
  const target = this;
  return target.replace(new RegExp(search, 'g'), replacement);
};

/**
 * Gets the stack trace of the current function call.
 * @private
 * @return {Stack}
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
 * Augment console.error to reformat DiscordAPIErrors to be more pretty.
 */
console.error = function(...args) {
  if (args.length == 1 && (args[0] instanceof Discord.DiscordAPIError)) {
    args[0] = Common.fmtDAPIErr(args[0]);
  }
  oldErr(...args);
};

module.exports = new Common();
