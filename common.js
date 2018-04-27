// Copyright 2018 Campbell Crowley. All rights reserved.
// Author: Campbell Crowley (web@campbellcrowley.com)
var fs = require('fs');
var path = require('path');
var async = require('async');
var dateFormat = require('dateformat');
const prefixLength = 13;

var mycolor = 0;
const app = process.argv[1].substring(process.argv[1].lastIndexOf('/') + 1);
var title;

exports.isRelease = false;

exports.begin = function(_, isRelease) {
  exports.isRelease = isRelease || false;
  switch(app) {
    case "Master.js":
      mycolor = 32;
      break;
    case "app.js":
      mycolor = 36;
      break;
    case "stopwatch.js":
      mycolor = 34;
      break;
    case "accounts.js":
      mycolor = 35;
      break;
    case "proxy.js":
      mycolor = 37;
      break;
    case "trax.js":
      mycolor = 33;
      break;
    case "SpikeyBot.js":
      mycolor = 44;
      break;
  }
  var temptitle = app;
  if (exports.isRelease) temptitle = "R" + temptitle;
  else temptitle = "D" + temptitle;

  for (var i = temptitle.length; i < prefixLength; i++) {
    temptitle += " ";
  }
  if (temptitle.length > prefixLength)
    temptitle = temptitle.substring(0, prefixLength);
  temptitle += " ";
  title = temptitle;

  exports.log(app + " Begin");
};

exports.padIp = function(str) {
  if (str.match(/\./g) || [] == 3) {
    var res = str.split('.');
    for (var i = 0; i < res.length; i++) {
      res[i] = ("000" + res[i]).slice(-3);
      res[i] = res[i].replace(":", "0");
    }
    return res.join('.');
  } else {
    for (var i = str.length; i < 15; i++) {
      str += " ";
    }
    return str.substring(0, 15);
  }
};

exports.getIPName = function(ip) {
  ip = exports.padIp(ip);
  switch(ip) {
    default:
      return ip;
    case "":
    case "   ":
    case "127.000.000.001":
      return "SELF           ";
    case "192.168.001.116":
      return "RPI            ";
    case "132.241.174.082":
    case "132.241.174.226":
    case "132.241.174.112":
      return "CHICO          ";
    case "076.021.061.017":
      return "HOME           ";
    case "205.167.046.140":
    case "205.167.046.157":
    case "205.167.046.15":
    case "204.088.159.118":
      return "MVHS           ";
  }
};
exports.updatePrefix = function(ip) {
  if (typeof ip === 'undefined') {
    ip = "SELF           ";
  }
  const formattedIP = exports.getIPName(ip.replace("::ffff:", ""));

  const date = dateFormat(new Date(), "mm-dd hh:MM:ss");
  return "[" + title + date + " " + formattedIP + "]:";
};

exports.log = function(message, ip) {
  if (exports.isRelease) {
    console.log(
        getTrace() + exports.updatePrefix(ip),
        "\033[;" + mycolor + "m" + message, "\033[1;0m");
  } else {
    console.log(
        getTrace() + "\033[;" + mycolor + "m" + exports.updatePrefix(ip),
        message, "\033[1;0m");
  }
};
exports.error = function(message, ip) {
  console.log(
      getTrace() + "\033[;31m" + exports.updatePrefix(ip), message,
      "\033[1;0m");
};

function getTrace() {
  var func = __function + ":" + __line;
  while (func.length < 20) func += " ";
  func = func.substr(func.length - 20, 20);
  return func;
}

String.prototype.replaceAll = function(search, replacement) {
  var target = this;
  return target.replace(new RegExp(search, 'g'), replacement);
};

Object.defineProperty(global, '__stack', {
  get: function() {
    var orig = Error.prepareStackTrace;
    Error.prepareStackTrace = function(_, stack) { return stack; };
    var err = new Error();
    Error.captureStackTrace(err, arguments.callee);
    var stack = err.stack;
    Error.prepareStackTrace = orig;
    return stack;
  }
});

Object.defineProperty(
    global, '__line', {get: function() { return __stack[3].getLineNumber(); }});

Object.defineProperty(
    global, '__function',
    {get: function() { return __stack[3].getFunctionName(); }});
