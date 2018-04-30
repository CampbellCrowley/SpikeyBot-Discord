// Copyright 2018 Campbell Crowley. All rights reserved.
// Author: Campbell Crowley (web@campbellcrowley.com)
let dateFormat = require('dateformat');

/**
 * @classdesc Common functions accross my projects. Mostly just logging.
 * @class
 */
function Common() {
  /**
   * The number of characters reserved for the filename of the script.
   * @private
   * @constant
   * @type {number}
   * @default
   */
  const prefixLength = 13;

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
    this.isRelease = isRelease || false;
    switch (app) {
      case 'Master.js':
        mycolor = 32;
        break;
      case 'app.js':
        mycolor = 36;
        break;
      case 'stopwatch.js':
        mycolor = 34;
        break;
      case 'accounts.js':
        mycolor = 35;
        break;
      case 'proxy.js':
        mycolor = 37;
        break;
      case 'trax.js':
        mycolor = 33;
        break;
      case 'SpikeyBot.js':
        mycolor = 44;
        break;
    }
    let temptitle = app;
    if (this.isRelease) temptitle = 'R' + temptitle;
    else temptitle = 'D' + temptitle;

    for (let i = temptitle.length; i < prefixLength; i++) {
      temptitle += ' ';
    }
    if (temptitle.length > prefixLength) {
      temptitle = temptitle.substring(0, prefixLength);
    }
    temptitle += ' ';
    title = temptitle;

    this.log(app + ' Begin');
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
      return res.join('.');
    } else {
      for (let i = str.length; i < 15; i++) {
        str += ' ';
      }
      return str.substring(0, 15);
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
    ip = this.padIp(ip);
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
      case '076.021.061.017':
        return 'HOME           ';
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
      ip = 'SELF           ';
    }
    const formattedIP = this.getIPName(ip.replace('::ffff:', ''));

    const date = dateFormat(new Date(), 'mm-dd hh:MM:ss');
    return '[' + title + date + ' ' + formattedIP + ']:';
  };

  /**
   * Format a log message to be logged.
   *
   * @param {string} message The message to display.
   * @param {string} ip The IP address or unique identifier of the client that
   * caused this event to happen.
   */
  this.log = function(message, ip) {
    if (this.isRelease) {
      console.log(
          getTrace() + this.updatePrefix(ip),
          '\x1B[;' + mycolor + 'm' + message, '\x1B[1;0m');
    } else {
      console.log(
          getTrace() + '\x1B[;' + mycolor + 'm' + this.updatePrefix(ip),
          message, '\x1B[1;0m');
    }
  };
  /**
   * Format an error message to be logged.
   *
   * @param {string} message The message to display.
   * @param {string} ip The IP address or unique identifier of the client that
   * caused this event to happen.
   */
  this.error = function(message, ip) {
    console.log(
        getTrace() + '\x1B[;31m' + this.updatePrefix(ip), message, '\x1B[1;0m');
  };

  /**
   * Gets the name and line number of the current function stack.
   * @private
   *
   * @return {string} Formatted string with length 20.
   */
  function getTrace() {
    let func = __function + ':' + __line;
    while (func.length < 20) func += ' ';
    func = func.substr(func.length - 20, 20);
    return func;
  }
}

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

/**
 * Gets the line number of the function that called a log function.
 */
Object.defineProperty(global, '__line', {
  get: function() {
    return __stack[3].getLineNumber();
  },
});

/**
 * Gets the name of the function that called a log function.
 */
Object.defineProperty(global, '__function', {
  get: function() {
    return __stack[3].getFunctionName();
  },
});

module.exports = new Common();
