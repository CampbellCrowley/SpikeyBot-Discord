// Copyright 2018 Campbell Crowley. All rights reserved.
// Author: Campbell Crowley (web@campbellcrowley.com)
var fs = require('fs');
var path = require('path');
var async = require('async');
var dateFormat = require('dateformat');
const prefixLength = 13;

var headerFileLastModified;
var footerFileLastModified;
var stylesFileLastModified;
var headerFile;
var footerFile;
var stylesFile;
var shouldReplaceTags = false;

var mycolor = 0;
const app = process.argv[1].substring(process.argv[1].lastIndexOf('/') + 1);
var title;

var subDom = "dev";
exports.isRelease = false;

exports.begin = function(replaceFileTags, isRelease) {
  exports.isRelease = isRelease || false;
  if (replaceFileTags) {
    shouldReplaceTags = true;
    updateCachedFiles(true);
    setInterval(updateCachedFiles, 5000);
  }
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

  exports.LOG(app + " Begin");
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


exports.res404 = function(res) {
  fs.exists("/var/www/html/404.html", function(exists) {
    if (exists) {
      exports.getFile("/var/www/html/404.html", res, "text/html", true);
    } else {
      exports.ERROR("File not found:  404.html");
      res.end("404");
    }
  });
};

exports.getFile = function(localPath, res, mimeType, is404) {
  is404 = (is404 !== undefined && is404 === true);
  fs.readFile(localPath, function(err, contents_) {
    if (!err) {
      try {
        var contents = contents_.toString();
        subDom = getSubDom(localPath);
        replaceTags(contents, function(contents) {
          if (contents_.toString() !== contents)
            contents_ = Buffer.from(contents);
          res.setHeader("Content-Length", contents_.length);
          res.setHeader("Content-Type", mimeType);
          if (is404) {
            res.statusCode = 404;
          } else {
            res.statusCode = 200;
          }
          res.end(contents_);
        });
      } catch (e) {
        res.setHeader("Content-Length", contents_.length);
        res.setHeader("Content-Type", mimeType || "text/plain");
        if (is404) {
          res.statusCode = 404;
        } else {
          res.statusCode = 200;
        }
        res.end(contents_);
      }
    } else {
      res.writeHead(500);
      res.end();
    }
  });
};

function getSubDom(localPath) {
  localPath = path.normalize(localPath);
  if (localPath.indexOf("/var/www/trax") === 0) return "trax";
  if (localPath.indexOf("/var/www/www") === 0) return "www";
  return "dev";
}
exports.LOG = function(message, ip) {
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
exports.ERROR = function(message, ip) {
  console.log(
      getTrace() + "\033[;31m" + exports.updatePrefix(ip), message,
      "\033[1;0m");
};

function getTrace() {
  var func = __function + ":" + __line;
  while (func.length < 20) func += " ";
  return func;
}

function replaceTags(contents, cb) {
  if (!shouldReplaceTags) cb(contents);

  async.waterfall(
      [
        function(cb) { cb(null, contents); }, replaceHeader, replaceFooter,
        replaceStyles, replaceURLS
      ],
      function(err, contents) {
        if (err) exports.ERROR(err);
        else cb(contents);
      });
}

function replaceHeader(contents, cb) {
  contents = contents.toString();
  var Tag = "<div id=\"mainheader\"></div>";
  if (contents.indexOf(Tag) > -1) {
    contents = contents.replaceAll(Tag, headerFile);
    cb(null, contents);
  } else {
    cb(null, contents);
  }
}
function replaceFooter(contents, cb) {
  contents = contents.toString();
  var Tag = "<div id=\"mainfooter\"></div>";
  if (contents.indexOf(Tag) > -1) {
    contents = contents.replaceAll(Tag, footerFile);
    cb(null, contents);
  } else {
    cb(null, contents);
  }
}
function replaceStyles(contents, cb) {
  contents = contents.toString();
  var Tag = "<style></style>";
  if (contents.indexOf(Tag) > -1) {
    contents = contents.replaceAll(Tag, "<style>" + stylesFile + "</style>");
    cb(null, contents);
  } else {
    cb(null, contents);
  }
}
function replaceURLS(contents, cb) {
  contents = contents.toString();
  if (subDom !== 'dev') {
    contents = contents.replaceAll(
        "dev.campbellcrowley.com/" + subDom, subDom + ".campbellcrowley.com");
    contents = contents.replaceAll(
        "'dev.campbellcrowley.com', {path: '/socket.io/" + subDom + "'",
        "'" + subDom + ".campbellcrowley.com', {");
    cb(null, contents);
  } else {
    cb(null, contents);
  }
}

function updateCachedFiles(force) {
  fs.stat('./header.html', function(err, stats) {
    if (err) {
      exports.ERROR(err);
      return;
    }
    var mtime = stats.mtime + "";
    if (force !== true && headerFileLastModified === mtime &&
        typeof headerFile !== 'undefined')
      return;

    headerFileLastModified = mtime;
    fs.readFile('./header.html', function(err, data) {
      if (err !== null) {
        exports.ERROR(err);
        return;
      }
      exports.LOG("Updating header.html");
      try {
        headerFile = data.toString();
      } catch (e) {
        exports.ERROR(e);
      }
    });
  });
  fs.stat('./footer.html', function(err, stats) {
    if (err) {
      exports.ERROR(err);
      return;
    }
    var mtime = stats.mtime + "";
    if (force !== true && footerFileLastModified === mtime &&
        typeof footerFile !== 'undefined')
      return;

    footerFileLastModified = mtime;
    fs.readFile('./footer.html', function(err, data) {
      if (err !== null) {
        exports.ERROR(err);
        return;
      }
      exports.LOG("Updating footer.html");
      try {
        footerFile = data.toString();
      } catch (e) {
        exports.ERROR(e);
      }
    });
  });
  fs.stat('./styles.css', function(err, stats) {
    if (err) {
      exports.ERROR(err);
      return;
    }
    var mtime = stats.mtime + "";
    if (force !== true && stylesFileLastModified === mtime &&
        typeof stylesFile !== 'undefined')
      return;

    stylesFileLastModified = mtime;
    fs.readFile('./styles.css', function(err, data) {
      if (err !== null) {
        exports.ERROR(err);
        return;
      }
      exports.LOG("Updating styles.css");
      try {
        stylesFile = data.toString();
      } catch (e) {
        exports.ERROR(e);
      }
    });
  });
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
