// Copyright 2018-2019 Campbell Crowley. All rights reserved.
// Author: Campbell Crowley (dev@campbellcrowley.com)
/**
 * @description Base class for all Sub-Modules.
 */
class SubModule {
  /**
   * @description Create a subModule.
   */
  constructor() {
    /**
     * The help message to show the user in the main help message.
     *
     * @abstract
     * @type {undefined|string|Discord~MessageEmbed}
     * @default
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
     * The current Discord object instance of the bot. Defaults to require cache
     * value for editor autocompletion, updates to current reference at init.
     *
     * @public
     * @type {Discord}
     */
    this.Discord = require('discord.js');
    /**
     * The current bot client. Defaults to require cache value for editor
     * autocompletion, updates to current reference at init.
     *
     * @public
     * @type {Discord~Client}
     */
    this.client = this.Discord.Client;
    /**
     * The command object for registering command listeners. Defaults to require
     * cache value for editor autocompletion, updates to current reference at
     * init.
     *
     * @public
     * @type {Command}
     */
    this.command = require('./commands.js');
    /**
     * The common object. Defaults to require cache value for editor
     * autocompletion, updates to current reference at init.
     *
     * @public
     * @type {Common}
     */
    this.common = require('./common.js');

    /**
     * The parent SpikeyBot instance. Defaults to required cache value for
     * autocompletion, updates to current reference at init.
     *
     * @public
     * @type {?SpikeyBot}
     */
    this.bot = require('./SpikeyBot.js');

    /**
     * The commit at HEAD at the time this module was loaded. Essentially the
     * version of this submodule.
     *
     * @public
     * @constant
     * @type {string}
     */
    this.commit = '';
    this.commit = require('child_process')
        .execSync('git rev-parse --short HEAD').toString().trim();

    /**
     * The time at which this module was loaded for use in checking if the
     * module needs to be reloaded because the file has been modified since
     * loading.
     *
     * @public
     * @constant
     * @type {number}
     */
    this.loadTime = Date.now();

    /**
     * The name of this submodule. Used for differentiating in the log. Should
     * be defined before begin().
     *
     * @protected
     * @type {string}
     * @abstract
     */
    this.myName = 'SubModule';

    /**
     * Has this subModule been initialized yet (Has begin() been called).
     *
     * @protected
     * @type {boolean}
     * @default
     * @readonly
     */
    this.initialized = false;
  }
  /**
   * The function called at the end of begin() for further initialization
   * specific to the subModule. Must be defined before begin() is called.
   *
   * @protected
   * @abstract
   */
  initialize() {
  }

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
  begin(Discord, client, command, common, bot) {
    this.Discord = Discord;
    this.client = client;
    this.command = command;
    this.common = common;
    this.bot = bot;

    this.log = function(msg) {
      if (this.client.shard) {
        this.common.log(
            msg, `${this.client.shard.ids.join(' ')} ${this.myName}`, 1);
      } else {
        this.common.log(msg, this.myName, 1);
      }
    };
    this.debug = function(msg) {
      if (this.client.shard) {
        this.common.logDebug(
            msg, `${this.client.shard.ids.join(' ')} ${this.myName}`, 1);
      } else {
        this.common.logDebug(msg, this.myName, 1);
      }
    };
    this.warn = function(msg) {
      if (this.client.shard) {
        this.common.logWarning(
            msg, `${this.client.shard.ids.join(' ')} ${this.myName}`, 1);
      } else {
        this.common.logWarning(msg, this.myName, 1);
      }
    };
    this.error = function(msg) {
      if (this.client.shard) {
        this.common.error(
            msg, `${this.client.shard.ids.join(' ')} ${this.myName}`, 1);
      } else {
        this.common.error(msg, this.myName, 1);
      }
    };

    if (this.initialized) return;

    setTimeout(() => {
      if (this.initialized) return;
      this.debug(`${this.myName} Initialize...`);

      this.save = this.save.bind(this);
      this.initialize = this.initialize.bind(this);
      this.shutdown = this.shutdown.bind(this);
      this.log = this.log.bind(this);
      this.warn = this.warn.bind(this);
      this.debug = this.debug.bind(this);
      this.error = this.error.bind(this);

      this.initialize();
      this.log(`${this.myName} Initialized`);
      this.initialized = true;
    });
  }

  /**
   * Trigger subModule to shutdown and get ready for process terminating.
   *
   * @public
   */
  end() {
    if (!this.initialized) return;
    this.shutdown();
    this.initialized = false;
    this.log(`${this.myName} Shutdown`);
  }

  /**
   * Log using common.log, but automatically set name.
   *
   * @protected
   * @param {string} msg The message to log.
   */
  log(msg) {
    console.log(msg);
  }
  /**
   * Log using common.logDebug, but automatically set name.
   *
   * @protected
   * @param {string} msg The message to log.
   */
  debug(msg) {
    console.log(msg);
  }
  /**
   * Log using common.logWarning, but automatically set name.
   *
   * @protected
   * @param {string} msg The message to log.
   */
  warn(msg) {
    console.log(msg);
  }
  /**
   * Log using common.error, but automatically set name.
   *
   * @protected
   * @param {string} msg The message to log.
   */
  error(msg) {
    console.error(msg);
  }

  /**
   * Shutdown and disable this submodule. Removes all event listeners.
   *
   * @abstract
   * @protected
   */
  shutdown() {
  }

  /* eslint-disable @typescript-eslint/no-unused-vars */
  /**
   * Saves all data to files necessary for saving current state.
   *
   * @param {string} [opt='sync'] Can be 'async', otherwise defaults to
   * synchronous.
   * @abstract
   */
  save(opt = 'sync') {
  }
  /* eslint-enable @typescript-eslint/no-unused-vars */

  /**
   * @description Check if this module is in a state that is ready to be
   * unloaded. If false is returned, this module should not be unloaded and
   * doing such may risk putting the module into an uncontrollable state.
   * @see {@link SubModule~reloadable}
   *
   * @abstract
   * @public
   * @returns {boolean} True if can be unloaded, false if cannot.
   */
  unloadable() {
    return true;
  }

  /**
   * @description Check if this module is in a state that is ready to be
   * reloaded. If false is returned, this module should not be unloaded and
   * doing such may risk putting the module into an uncontrollable state. This
   * is different from unloadable, which checks if this module can be stopped
   * completely, this checks if the module can be stopped and restarted.
   * @see {@link SubModule~unloadable}
   *
   * @abstract
   * @public
   * @returns {boolean} True if can be reloaded, false if cannot.
   */
  reloadable() {
    return this.unloadable();
  }
}

/**
 * Extends SubModule as the base class of a child.
 *
 * @public
 * @static
 * @param {object} child The child class to extend.
 */
SubModule.extend = function(child) {
  child.prototype = new SubModule();
  child.prototype.constructor = child;
};

module.exports = SubModule;
