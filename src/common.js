// Copyright 2018-2020 Campbell Crowley. All rights reserved.
// Author: Campbell Crowley (dev@campbellcrowley.com)
const dateFormat = require('dateformat');
const Discord = require('discord.js');
const fs = require('fs');
const mkdirp = require('mkdirp');
const sql = require('mysql');
const auth = require('../auth.js');
const path = require('path');

/**
 * Commonly required things. Helper functions and constants.
 *
 * @class
 */
function Common() {
  const self = this;
  /**
   * The number of characters reserved for the filename of the script.
   *
   * @private
   * @constant
   * @type {number}
   * @default
   */
  const prefixLength = 14;

  /**
   * The color code to prefix log messages with for this script.
   *
   * @private
   * @type {number}
   * @default
   */
  let mycolor = 0;
  /**
   * The script's filename to show in the log.
   *
   * @private
   * @type {string}
   * @constant
   */
  const app = process.argv[1] ?
      process.argv[1].substring(process.argv[1].lastIndexOf('/') + 1) :
      '';
  /**
   * The final formatted filename for logging.
   *
   * @private
   * @type {string}
   */
  let title;

  /**
   * Whether this should be shown as a release version, or a debug version in
   * the log.
   *
   * @type {boolean}
   */
  this.isRelease = false;
  /**
   * Whether this current instance is running as a unit test.
   *
   * @type {boolean}
   */
  this.isTest = false;
  /**
   * @description Is this a shard that is being managed by our sharding system.
   * If this is true, webservers should not attempt to become the master, and
   * instead attempt to connect to the sharding master server. This is specified
   * using the `SHARDING_SLAVE` environment variable.
   *
   * @public
   * @type {boolean}
   * @default false
   */
  this.isSlave = process.env.SHARDING_SLAVE === 'true';
  /**
   * @description Is this a shard that is being managed by our sharding system,
   * and is the master that all children (siblings) will be connecting to. If
   * this is true, webservers should attempt to become the master, and not
   * fallback to a client sibling. This is specified using the `SHARDING_MASTER`
   * environment variable.
   *
   * @public
   * @type {boolean}
   * @default false
   */
  this.isMaster = !this.isSlave && process.env.SHARDING_MASTER === 'true';
  /**
   * @description The network host information where the master node is located
   * for connecting sibling sockets to. This will be populated if `isSlave` is
   * true.
   *
   * @private
   * @type {?object}
   * @default
   */
  this.masterHost = null;

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
      case 'ShardingMaster.js':
      case 'ShardingSlave.js':
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
   * @param {string} prefix The first characters on the line.
   * @param {string} message The message to display.
   * @param {string} ip The IP address or unique identifier of the client that
   * caused this event to happen.
   * @param {number} [traceIncrease=0] Increase the distance up the stack to
   * show the in the log.
   */
  function write(prefix, message, ip, traceIncrease = 0) {
    const output = [prefix];
    output.push(getTrace(traceIncrease + 1));
    if (self.isRelease) {
      output.push(`${self.updatePrefix(ip)}\x1B[;${mycolor}m`);
    } else {
      output.push(`\x1B[;${mycolor}m${self.updatePrefix(ip)}`);
    }
    message = message.toString().replace(/\n/g, '\\n');
    output.push(` ${message}`);
    output.push('\x1B[1;0m\n');
    process.stdout.write(output.join(''));
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
    write('DBG:', message, ip, traceIncrease);
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
    write('INF:', message, ip, traceIncrease);
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
    write('WRN:', message, ip, traceIncrease);
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
    const output = ['ERR:'];
    message = `${message}`.replace(/\n/g, '\\n');
    output.push(getTrace(traceIncrease));
    output.push('\x1B[;31m');
    output.push(`${self.updatePrefix(ip)} ${message}`);
    output.push('\x1B[1;0m\n');
    process.stdout.write(output.join(''));
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
    const perms = msg.channel.permissionsFor && msg.client &&
        msg.channel.permissionsFor(msg.client.user);
    if (perms && !perms.has('SEND_MESSAGES')) {
      self.logDebug(
          'Failed to send reply to channel ' + msg.channel.id +
              ' due to lack of perms.',
          trace);
      if (msg.author) {
        msg.author
            .send(
                'I was unable to send a message in #' + msg.channel.name +
                ' because I do not have permission to send messages there.')
            .catch(() => {});
      }
      return new Promise((resolve, reject) => reject(new Error('No Perms')));
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
        if (post) embed.setDescription(post);
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

  if (this.isSlave) {
    const configDir = './config/';
    const files = fs.readdirSync(configDir);
    const file = files.find((el) => el.match(Common.shardConfigRegex));
    if (!file) {
      this.error(
          'Failed to find shard config file required for sibling sockets.');
    } else {
      let data;
      try {
        data = fs.readFileSync(`${configDir}/${file}`);
      } catch (err) {
        this.error(
            'Failed to read shard config file required for sibling sockets.');
        console.error(err);
      }
      if (data) {
        try {
          const parsed = JSON.parse(data);
          this.masterHost = parsed.host;
        } catch (err) {
          this.error(
              'Failed to parse shard config file required for sibling ' +
              'sockets.');
          console.error(err);
        }
      }
    }
    /**
     * @description Send an SQL query to the master database through our open
     * websocket.
     * @public
     * @param {string} query SQL query to send directly to the database.
     * @param {Function} cb Callback with optional error, otherwise returned
     * rows.
     */
    this.sendSQL = function(query, cb) {
      const listener = (message) => {
        if (!message || message._sSQL !== query) return;
        process.removeListener('message', listener);
        clearTimeout(timeout);
        if (!message._error) {
          cb(null, message._result);
        } else {
          cb(message._error);
        }
      };
      process.on('message', listener);
      const timeout = setTimeout(() => {
        process.removeListener('message', listener);
        cb('SQL IPC Send Timeout');
      }, 10000);

      process.send({_sSQL: query}, (err) => {
        if (!err) return;
        process.removeListener('message', listener);
        cb(err);
        clearTimeout(timeout);
        // Rethrow to force suicide as this is a fatal error and is
        // unrecoverable.
        if (err.code === 'ERR_IPC_CHANNEL_CLOSED') throw err;
      });
    };
    /**
     * @description Request that the ShardingSlave sends a file to
     * the ShardingMaster.
     * @public
     * @param {string} filename The name of the file to send with path relative
     * to project directory.
     * @param {Function} cb Callback with optional error.
     */
    this.sendFile = function(filename, cb) {
      const listener = (message) => {
        if (!message || message._sWriteFile !== filename) return;
        process.removeListener('message', listener);
        clearTimeout(timeout);
        if (!message._error) {
          cb(null, message._result);
        } else {
          cb(message._error);
        }
      };
      process.on('message', listener);
      const timeout = setTimeout(() => {
        process.removeListener('message', listener);
        cb('SendFile IPC Send Timeout');
      }, 30000);

      process.send({_sWriteFile: filename}, (err) => {
        if (!err) return;
        process.removeListener('message', listener);
        cb(err);
        clearTimeout(timeout);
        // Rethrow to force suicide as this is a fatal error and is
        // unrecoverable.
        if (err.code === 'ERR_IPC_CHANNEL_CLOSED') throw err;
      });
    };

    /**
     * @description Request that the ShardingSlave fetches a file from
     * the ShardingMaster.
     * @public
     * @param {string} filename The name of the file to fetch with path relative
     * to project directory.
     * @param {Function} cb Callback with optional error.
     */
    this.getFile = function(filename, cb) {
      const listener = (message) => {
        if (!message || message._sGetFile !== filename) return;
        process.removeListener('message', listener);
        clearTimeout(timeout);
        if (!message._error) {
          cb(null, message._result);
        } else {
          cb(message._error);
        }
      };
      process.on('message', listener);
      const timeout = setTimeout(() => {
        process.removeListener('message', listener);
        cb('GetFile IPC Send Timeout');
      }, 30000);

      process.send({_sGetFile: filename}, (err) => {
        if (!err) return;
        process.removeListener('message', listener);
        cb(err);
        clearTimeout(timeout);
        // Rethrow to force suicide as this is a fatal error and is
        // unrecoverable.
        if (err.code === 'ERR_IPC_CHANNEL_CLOSED') throw err;
      });
    };
  }

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
   * @returns {string} Function name in call stack.
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
 * SpikeyRobot's Discord ID.
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
  '165315069717118979',  // Webb
];
/**
 * Trusted IDs.
 *
 * @see {@link Common.prototype.trustedIds}
 *
 * @constant
 * @type {string[]}
 */
Common.trustedIds = Common.prototype.trustedIds;

/**
 * The channel id for the channel to reserve for only unit testing in.
 *
 * @public
 * @default
 * @constant
 * @type {string}
 */
Common.testChannel = '439642818084995074';
Common.prototype.testChannel = Common.testChannel;

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
 * The website base URL for pointing to for avatar files.
 *
 * @type {string}
 * @constant
 * @default
 */
Common.prototype.avatarURL = 'https://kamino.spikeybot.com/';
/**
 * The website base URL for pointing to for avatar files.
 *
 * @type {string}
 * @constant
 */
Common.avatarURL = Common.prototype.avatarURL;

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
 * @param {Discord~Message|Discord~UserResolvable} msg Message to format a
 * mention for the author of.
 * @returns {string} Formatted mention string.
 */
Common.mention = Common.prototype.mention;

/**
 * @description Regular expression the name of the config file will match for a
 * shard configuration.
 *
 * @type {RegExp}
 * @constant
 * @default
 */
Common.prototype.shardConfigRegex = /^shard_[a-z]+_config\.json$/;
/**
 * @description Regular expression the name of the config file will match for a
 * shard configuration.
 *
 * @type {RegExp}
 * @constant
 * @default
 */
Common.shardConfigRegex = Common.prototype.shardConfigRegex;


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
 * @param {string|object} data The data to write to the file.
 * @param {Function} [cb] Callback to fire on completion. Only parameter is
 * optional error.
 */
Common.mkAndWrite = function(filename, dir, data, cb) {
  if (!dir) dir = path.dirname(filename);
  mkdirp(dir)
      .then(() => {
        if (typeof data === 'object' && !Buffer.isBuffer(data)) {
          data = JSON.stringify(data);
        }
        fs.writeFile(filename, data, (err2) => {
          if (err2) {
            if (this.error) this.error(`Failed to save file: ${filename}`);
            console.error(err2);
            if (typeof cb === 'function') cb(err2);
            return;
          }
          if (this.sendFile) this.sendFile(filename);
          if (typeof cb === 'function') cb();
        });
        fs.unlink(`${filename}.DELETEME`, (err) => {
          if (!err || err.code == 'ENOENT') return;
          if (this.error) {
            this.error(
                `Failed to unlink DELETEME marker: ${filename}.DELETEME`);
          }
          console.error(err);
        });
      })
      .catch((err) => {
        if (err.code !== 'EEXIST') {
          if (this.error) this.error(`Failed to make directory: ${dir}`);
          console.error(err);
          if (typeof cb === 'function') cb(err);
        }
      });
};
Common.prototype.mkAndWrite = Common.mkAndWrite;
/**
 * Write data to a file and make sure the directory exists or create it if it
 * doesn't. Synchronous.
 *
 * @see {@link Common~mkAndWrite}
 *
 * @public
 * @param {string} filename The name of the file including the directory.
 * @param {string} dir The directory path without the file's name.
 * @param {string} data The data to write to the file.
 */
Common.mkAndWriteSync = function(filename, dir, data) {
  if (!dir) dir = path.dirname(filename);
  try {
    mkdirp.sync(dir);
  } catch (err) {
    if (this.error) this.error(`Failed to make directory: ${dir}`);
    console.error(err);
    return;
  }
  if (typeof data === 'object' && !Buffer.isBuffer(data)) {
    data = JSON.stringify(data);
  }
  try {
    fs.writeFileSync(filename, data);
  } catch (err) {
    if (this.error) this.error(`Failed to save file: ${filename}`);
    console.error(err);
    return;
  }
  if (this.sendFile) this.sendFile(filename);
  try {
    fs.unlinkSync(`${filename}.DELETEME`);
  } catch (err) {
    if (err.code != 'ENOENT') {
      if (this.error) {
        this.error(`Failed to unlink DELETEME marker: ${filename}.DELETEME`);
      }
      console.error(err);
      return;
    }
  }
};
Common.prototype.mkAndWriteSync = Common.mkAndWriteSync;

/**
 * Delete data from file, and mark it for deletion from other shards.
 *
 * @public
 * @param {string} filename The name of the file to remove.
 * @param {Function} [cb] Callback once completed, with optional error
 *     parameter.
 */
Common.unlink = function(filename, cb) {
  fs.writeFile(`${filename}.DELETEME`, Date.now(), (err) => {
    if (!err || err.code == 'ENOENT') return;
    if (this.error) {
      this.error(`Failed to mark file for deletion: ${filename}.DELETEME`);
    }
    console.error(err);
  });
  fs.unlink(filename, (err) => {
    if (err && err.code != 'ENOENT') {
      if (this.error) this.error(`Failed to delete file: ${filename}`);
      console.error(err);
      if (cb) cb(err);
    } else {
      if (this.sendFile) this.sendFile(filename);
      if (cb) cb(null);
    }
  });
};
Common.prototype.unlink = Common.unlink;

/**
 * Delete data from file, and mark it for deletion from other shards.
 * Synchronous.
 *
 * @public
 * @param {string} filename The name of the file to remove.
 */
Common.unlinkSync = function(filename) {
  try {
    fs.writeFileSync(`${filename}.DELETEME`, Date.now());
  } catch (err) {
    if (err.code != 'ENOENT') {
      if (this.error) {
        this.error(`Failed to mark file for deletion: ${filename}.DELETEME`);
      }
      console.error(err);
    }
  }
  try {
    fs.unlinkSync(filename);
  } catch (err) {
    if (err.code != 'ENOENT') {
      if (this.error) this.error(`Failed to delete file: ${filename}`);
      console.error(err);
    }
  }
  if (this.sendFile) this.sendFile(filename);
};
Common.prototype.unlinkSync = Common.unlinkSync;

/**
 * Recursively freeze all elements of an object.
 *
 * @public
 * @param {object} object The object to deep freeze.
 * @returns {object} The frozen object.
 */
Common.deepFreeze = function(object) {
  const propNames = Object.getOwnPropertyNames(object);
  for (const name of propNames) {
    const value = object[name];
    object[name] =
        value && typeof value === 'object' ? Common.deepFreeze(value) : value;
  }
  return Object.freeze(object);
};
Common.prototype.deepFreeze = Common.deepFreeze;

/**
 * @description Convert a string in camelcase to a human readable spaces format.
 * (helloWorld --> Hello World).
 *
 * @private
 * @param {string} str The input.
 * @returns {string} The output.
 */
Common.camelToSpaces = function(str) {
  return str.replace(/([A-Z])/g, ' $1').replace(/^./, function(str) {
    return str.toUpperCase();
  });
};
Common.prototype.camelToSpaces = Common.camelToSpaces;

/**
 * The object describing the connection with the SQL server.
 *
 * @global
 * @type {?sql.ConnectionConfig}
 */
global.sqlCon;
/**
 * Create initial connection with sql server. The connection is injected into
 * the global scope as {@link sqlCon}. If a connection still exists, calling
 * this function just returns the current reference.
 *
 * @public
 * @param {boolean} [force=false] Force a new connection to be established.
 * @returns {sql.ConnectionConfig} Current sql connection object.
 */
Common.connectSQL = function(force = false) {
  if (global.sqlCon && !force) return global.sqlCon;
  if (global.sqlCon && global.sqlCon.end) global.sqlCon.end();
  if (this.isSlave) {
    global.sqlCon = {
      query: this.sendSQL,
      format: sql.format,
    };
    if (this.log) {
      this.log('SQL Connection using websocket');
    } else {
      console.log('SQL Connection using websocket');
    }
  } else {
    /* eslint-disable-next-line new-cap */
    global.sqlCon = new sql.createConnection({
      user: auth.sqlUsername,
      password: auth.sqlPassword,
      host: auth.sqlHost,
      database: auth.sqlDatabase,
      port: auth.sqlPort,
    });
    global.sqlCon.on('error', (e) => {
      if (this.error) {
        this.error(`SQL connection fired error: ${e}`);
      } else {
        console.error(e);
      }
      if (e.fatal || e.code === 'PROTOCOL_ENQUEUE_AFTER_FATAL_ERROR') {
        Common.connectSQL(true);
      }
    });
    if (this.log) {
      this.log('SQL Connection created');
    } else {
      console.log('SQL Connection created');
    }
  }
  return global.sqlCon;
};
Common.prototype.connectSQL = Common.connectSQL;

/**
 * @description The User-Agent to send in http request headers.
 * @public
 * @type {string}
 * @constant
 */
Common.ua =
    'Mozilla/5.0 (compatible; SpikeyBot/1.0; +https://www.spikeybot.com/)';
Common.prototype.ua = Common.ua;


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
  } else if (typeof args[0] !== 'string' || !args[0].startsWith('ERR:')) {
    const pid = `00000${process.pid}`.slice(-5);
    oldErr(`ERR:${pid}                     [ SpikeyBot.js  `, ...args);
    return;
  }
  oldErr(...args);
};

module.exports = new Common();
