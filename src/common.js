// Copyright 2018 Campbell Crowley. All rights reserved.
// Author: Campbell Crowley (dev@campbellcrowley.com)
let dateFormat = require('dateformat');

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
  const app = process.argv[1].substring(process.argv[1].lastIndexOf('/') + 1);
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
   * Initialize variables and settings for logging properly.
   *
   * @param {*} _ Unused. Kept to match number of arguments with other versions
   * of common.js.
   * @param {boolean} isRelease Is this a release version, or a development
   * version of the app running.
   */
  this.begin = function(_, isRelease) {
    self.isRelease = isRelease || false;
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
    if (str.match(/\./g) || [] == 3) {
      let res = str.split('.');
      for (let i = 0; i < res.length; i++) {
        res[i] = ('000' + res[i]).slice(-3);
        res[i] = res[i].replace(':', '0');
      }
      return res.join('.') + '                       ';
    } else if (str.match(/:/g) || [] == 7) {
      let res = str.split(':');
      for (let i = 0; i < res.length; i++) {
        res[i] = ('0000' + res[i]).slice(-4);
        // res[i] = res[i].replace(':', '0');
      }
      return res.join(':');
    } else {
      for (let i = str.length; i < 45; i++) {
        str += ' ';
      }
      return str.substring(0, 45);
    }
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

    const date = dateFormat(new Date(), 'mm-dd hh:MM:ss');
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
    console.log(
        'ERR:' + getTrace(traceIncrease) + '\x1B[;31m' + self.updatePrefix(ip),
        message, '\x1B[1;0m');
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
    return __stack[3 + inc].getLineNumber();
  }

  /**
   * Gets the name of the function that called a log function.
   *
   * @private
   * @param {number} [inc=0] Increase distance up the stack to return;
   * @return {string} Function name in call stack.
   */
  /* function __function(inc = 0) {
    return __stack[3 + inc].getFunctionName();
  } */

  /**
   * Gets the name of the file that called a log function.
   *
   * @private
   * @param {number} [inc=0] Increase distance up the stack to return;
   * @return {string} Filename in call stack.
   */
  function __filename(inc = 0) {
    return __stack[3 + inc].getFileName();
  }
}

/**
 * SpikeyRobot's Discord ID
 *
 * @type {string}
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
 * @param {Discord~Message} msg Message to format a mention for the author of.
 * @return {string} Formatted mention string.
 */
Common.prototype.mention = function(msg) {
  return `<@${msg.author.id}>`;
};
/**
 * Creates formatted string for mentioning the author of msg.
 *
 * @param {Discord~Message} msg Message to format a mention for the author of.
 * @return {string} Formatted mention string.
 */
Common.mention = Common.prototype.mention;

/**
 * Replies to the author and channel of msg with the given message.
 *
 * @param {Discord~Message} msg Message to reply to.
 * @param {string} text The main body of the message.
 * @param {string} post The footer of the message.
 * @return {Promise} Promise of Discord~Message that we attempted to send.
 */
Common.prototype.reply = function(msg, text, post) {
  if (!msg.channel || !msg.channel.send) return null;
  return msg.channel.send(
      Common.mention(msg) + '\n```\n' + text + '\n```' + (post || ''));
};
/**
 * Replies to the author and channel of msg with the given message.
 *
 * @param {Discord~Message} msg Message to reply to.
 * @param {string} text The main body of the message.
 * @param {string} post The footer of the message.
 * @return {Promise} Promise of Discord~Message that we attempted to send.
 */
Common.reply = Common.prototype.reply;


/* eslint-disable-next-line no-extend-native */
String.prototype.replaceAll = function(search, replacement) {
  let target = this;
  return target.replace(new RegExp(search, 'g'), replacement);
};

/**
 * Gets the stack trace of the current function call.
 */
Object.defineProperty(global, '__stack', {
  get: function() {
    let orig = Error.prepareStackTrace;
    Error.prepareStackTrace = function(_, stack) {
      return stack;
    };
    let err = new Error();
    /* eslint-disable-next-line no-caller */
    Error.captureStackTrace(err, arguments.callee);
    let stack = err.stack;
    Error.prepareStackTrace = orig;
    return stack;
  },
});

module.exports = new Common();
