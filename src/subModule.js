// Copyright 2018 Campbell Crowley. All rights reserved.
// Author: Campbell Crowley (dev@campbellcrowley.com)
/**
 * @classdesc Base class for all Sub-Modules.
 * @class
 */
function SubModule() {
  /**
   * The help message to show the user in the main help message.
   *
   * @type {string|Discord~MessageEmbed}
   */
  this.helpMessage = undefined;

  /**
   * The postfix for the global prefix for this subModule. Must be defined
   * before begin(), otherwise it is ignored.
   *
   * @abstract
   * @type {string}
   * @default
   */
  this.postPrefix = '';
  /**
   * The current Discord object instance of the bot.
   *
   * @type {Discord}
   */
  this.Discord;
  /**
   * The current bot client.
   *
   * @type {Discord~Client}
   */
  this.client;
  /**
   * The command object for registering command listeners.
   *
   * @type {Command}
   */
  this.command;
  /**
   * The common object.
   *
   * @type {Common}
   */
  this.common;

  /**
   * The parent SpikeyBot instance.
   *
   * @type {SpikeyBot}
   */
  this.bot;

  /**
   * The commit at HEAD at the time this module was loaded. Essentially the
   * version of this submodule.
   *
   * @public
   * @constant
   * @type {string}
   */
  this.commit = require('child_process')
      .execSync('git rev-parse --short HEAD')
      .toString()
      .trim();

  /**
   * The time at which this madule was loaded for use in checking if the module
   * needs to be reloaded because the file has been modified since loading.
   *
   * @public
   * @constant
   * @type {number}
   */
  this.loadTime = Date.now();

  /**
   * The name of this submodule. Used for differentiating in the log. Should be
   * defined before begin().
   *
   * @protected
   * @type {string}
   * @abstract
   */
  this.myName = 'SubModule';
  /**
   * The function called at the end of begin() for further initialization
   * specific to the subModule. Must be defined before begin() is called.
   *
   * @protected
   * @abstract
   */
  this.initialize = function() {};

  /**
   * Has this subModule been initialized yet (Has begin() been called).
   *
   * @protected
   * @type {boolean}
   * @default
   * @readonly
   */
  this.initialized = false;

  /**
   * Initialize this submodule.
   *
   * @public
   * @param {Discord} Discord The Discord object for the API library.
   * @param {Discord~Client} client The client that represents this bot.
   * @param {Command} command The command instance in which to
   * register command listeners.
   * @param {Common} common Class storing common functions.
   * @param {SpikeyBot} bot The parent SpikeyBot instance.
   */
  this.begin = function(Discord, client, command, common, bot) {
    this.Discord = Discord;
    this.client = client;
    this.command = command;
    this.common = common;
    this.bot = bot;

    this.log = function(msg) {
      if (this.client.shard) {
        this.common.log(msg, this.client.shard.id + ' ' + this.myName, 1);
      } else {
        this.common.log(msg, this.myName, 1);
      }
    };
    this.debug = function(msg) {
      if (this.client.shard) {
        this.common.logDebug(msg, this.client.shard.id + ' ' + this.myName, 1);
      } else {
        this.common.logDebug(msg, this.myName, 1);
      }
    };
    this.warn = function(msg) {
      if (this.client.shard) {
        this.common.logWarning(
            msg, this.client.shard.id + ' ' + this.myName, 1);
      } else {
        this.common.logWarning(msg, this.myName, 1);
      }
    };
    this.error = function(msg) {
      if (this.client.shard) {
        this.common.error(msg, this.client.shard.id + ' ' + this.myName, 1);
      } else {
        this.common.error(msg, this.myName, 1);
      }
    };

    if (this.initialized) return;
    this.client.setTimeout(() => {
      if (this.initialized) return;
      this.debug(this.myName + ' Initialize...');
      this.initialize();
      this.log(this.myName + ' Initialized');
      this.initialized = true;
    });
  };

  /**
   * Trigger subModule to shutdown and get ready for process terminating.
   *
   * @public
   */
  this.end = function() {
    if (!this.initialized) return;
    this.shutdown();
    this.initialized = false;
    this.log(this.myName + ' Shutdown');
  };

  /**
   * Log using common.log, but automatically set name.
   *
   * @protected
   * @param {string} msg The message to log.
   */
  this.log = function(msg) {
    console.log(msg);
  };
  /**
   * Log using common.logDebug, but automatically set name.
   *
   * @protected
   * @param {string} msg The message to log.
   */
  this.debug = function(msg) {
    console.log(msg);
  };
  /**
   * Log using common.logWarning, but automatically set name.
   *
   * @protected
   * @param {string} msg The message to log.
   */
  this.warn = function(msg) {
    console.log(msg);
  };
  /**
   * Log using common.error, but automatically set name.
   *
   * @protected
   * @param {string} msg The message to log.
   */
  this.error = function(msg) {
    console.error(msg);
  };

  /**
   * Shutdown and disable this submodule. Removes all event listeners.
   *
   * @abstract
   * @protected
   */
  this.shutdown = function() {};

  /**
   * Saves all data to files necessary for saving current state.
   *
   * @param {string} [opt='sync'] Can be 'async', otherwise defaults to
   * synchronous.
   * @abstract
   */
  this.save = function(opt = 'sync') {};

  /**
   * Check if this module is in a state that is ready to be unloaded. If false
   * is returned, this module should not be unloaded and doing such may risk
   * putting the module into an uncontrollable state.
   *
   * @abstract
   * @public
   * @return {boolean} True if can be unloaded, false if cannot.
   */
  this.unloadable = function() {
    return true;
  };
}

/**
 * Extends SubModule as the base class of a child.
 *
 * @param {Object} child The child class to extend.
 */
SubModule.extend = function(child) {
  child.prototype = new SubModule();
  child.prototype.constructor = child;
};

module.exports = SubModule.extend;
