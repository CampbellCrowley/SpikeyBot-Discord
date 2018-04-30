/**
 * Base class for all Sub-Modules.
 * @class
 */
function SubModule() {
  /**
   * The help message to show the user in the main help message.
   *
   * @type {string|Discord.MessageEmbed}
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
   * The prefix this submodule uses. Formed by appending this.prefix to
   * this.prePrefix. this.prePrefix must be defined before begin(), otherwise it
   * is ignored.
   *
   * @readonly
   * @type {string}
   */
  this.myPrefix;
  /**
   * The prefix for the global prefix for this subModule. Must be defined before
   * begin(), otherwise it is ignored.
   *
   * @type {string}
   * @default
   */
  this.prePrefix = '';
  /**
   * The current Discord object instance of the bot.
   *
   * @type {Discord}
   */
  this.Discord;
  /**
   * The current bot client.
   *
   * @type {Discord.Client}
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
   * @type {function}
   * @abstract
   */
  this.initialize = function() {};

  /**
   * Initialize this submodule.
   *
   * @param {string} prefix The global prefix for this bot.
   * @param {Discord} Discord The Discord object for the API library.
   * @param {Discord.Client} client The client that represents this bot.
   * @param {Command} command The command instance in which to register command
   * listeners.
   * @param {Object} common Object storing common functions.
   */
  this.begin = function(prefix, Discord, client, command, common) {
    prefix = prefix;
    myPrefix = prePrefix + prefix;
    Discord = Discord;
    client = client;
    command = command;
    common = common;

    this.initialize();
    common.log(this.myName + ' Init', this.myName);
  };

  /**
   * Shutdown and disable this submodule. Removes all event listeners.
   *
   * @abstract
   * type {function}
   */
  exports.end = function() {};

  /**
   * Saves all data to files necessary for saving current state.
   */
  exports.save = function() {};
}

module.exports = new SubModule();
