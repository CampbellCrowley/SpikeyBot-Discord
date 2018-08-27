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
   * The main prefix in use for this bot. Only available after begin() is
   * called.
   *
   * @readonly
   * @type {string}
   */
  this.prefix;

  /**
   * The prefix this submodule uses. Formed by prepending this.prefix to
   * this.postPrefix. this.postPrefix must be defined before begin(), otherwise
   * it is ignored.
   *
   * @readonly
   * @type {string}
   */
  this.myPrefix;
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
   * @type {SpikeyBot~Command}
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
   * @param {string} prefix The global prefix for this bot.
   * @param {Discord} Discord The Discord object for the API library.
   * @param {Discord~Client} client The client that represents this bot.
   * @param {SpikeyBot~Command} command The command instance in which to
   * register command listeners.
   * @param {Common} common Class storing common functions.
   * @param {SpikeyBot} bot The parent SpikeyBot instance.
   */
  this.begin = function(prefix, Discord, client, command, common, bot) {
    this.prefix = prefix;
    this.myPrefix = prefix + this.postPrefix;
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
    this.error = function(msg) {
      if (this.client.shard) {
        this.common.error(msg, this.client.shard.id + ' ' + this.myName, 1);
      } else {
        this.common.error(msg, this.myName, 1);
      }
    };

    if (this.initialized) return;
    this.initialize();
    this.log(this.myName + ' Init');
    this.initialized = true;
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
   * @abstract
   */
  this.save = function() {};

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
