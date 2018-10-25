// Copyright 2018 Campbell Crowley. All rights reserved.
// Author: Campbell Crowley (dev@campbellcrowley.com)

require('./subModule.js')(Command); // Extends the SubModule class.

/**
 * @classdesc Manages the command event firing for all commands. This is not a
 * normal submodule, and is treated differently in the SpikeyBot class.
 * @class
 * @augments SubModule
 */
function Command() {
  const self = this;
  /** @inheritdoc */
  this.myName = 'Command';

  /** @inheritdoc */
  this.initialize = function() {
  };
  /** @inheritdoc */
  this.shutdown = function() {
  };

  this.import = function(data) {
    cmds = data.cmds;
    blacklist = data.blacklist;
  };
  this.export = function() {
    return {
      cmds: cmds,
      blacklist: blacklist,
    };
  };

  /**
   * The function to call when a command is triggered.
   *
   * @callback commandHandler
   * @param {Discord~Message} msg The message sent in Discord.
   */

  /**
   * All tracked commands with handlers.
   *
   * @private
   * @type {Object.<commandHandler>}
   */
  let cmds = {};
  /**
   * List of disabled commands, and the channels they are disabled in.
   *
   * @private
   * @type {Object.<string[]>}
   */
  let blacklist = {};

  /**
   * The message to send to the user if they attempt a server-only command in a
   * non-server channel.
   *
   * @private
   * @type {string}
   * @constant
   */
  const onlyservermessage = 'This command only works in servers, sorry!';
  /**
   * The message to send to the user if the command they attempted is currently
   * disabled in the channel.
   *
   * @private
   * @type {string}
   * @constant
   */
  const disabledcommandmessage =
      'This command has been disabled in this channel.';

  /**
   * Trigger a command firing and call it's handler passing in msg as only
   * argument.
   *
   * @param {string} cmd Array of strings or a string of the command to
   * trigger.
   * @param {Discord~Message} msg Message received from Discord to pass to
   * handler.
   * @return {boolean} True if command was handled by us.
   */
  this.trigger = function(cmd, msg) {
    let func = self.find(cmd, msg);
    if (func) {
      if (cmd.startsWith(msg.prefix)) {
        cmd = cmd.replace(msg.prefix, '');
      }
      let failure = self.validate(cmd, msg, func);
      if (failure === 'Guild Only') {
        self.common.reply(msg, onlyservermessage);
        return true;
      } else if (failure === 'Disabled In Channel') {
        self.common.reply(msg, disabledcommandmessage);
        return true;
      } else if (failure) {
        self.common.reply(
            msg, 'I am unable to attempt this command for an unknown reason.',
            failure);
        self.common.error('Comand failed: ' + cmd + ': ' + failure);
        return false;
      }
      msg.text = msg.content.replace(msg.prefix + cmd, '');
      try {
        func(msg);
      } catch (err) {
        self.common.error(cmd + ': FAILED');
        console.log(err);
        self.common.reply(msg, 'An error occurred! Oh noes!');
      }
      return true;
    } else {
      return false;
    }
  };
  /**
   * Registers a listener for a command.
   *
   * @param {string|string[]} cmd Command to listen for.
   * @param {commandHandler} cb Function to call when command is triggered.
   * @param {boolean} [onlyserver=false] Whether the command is only allowed
   * on a server.
   */
  this.on = function(cmd, cb, onlyserver) {
    if (typeof cb !== 'function') {
      throw new Error('Event callback must be a function.');
    }
    cb.validOnlyOnServer = onlyserver || false;
    if (typeof cmd === 'string') {
      cmd = cmd.toLowerCase();
      if (cmds[cmd]) {
        self.common.error(
            'Attempted to register a second handler for event that already ' +
            'exists! (' + cmd + ')');
      } else {
        cmds[cmd] = cb;
      }
    } else if (Array.isArray(cmd)) {
      for (let i = 0; i < cmd.length; i++) self.on(cmd[i], cb, onlyserver);
    } else {
      throw new Error('Event must be string or array of strings');
    }
  };
  /**
   * Remove listener for a command.
   *
   * @param {string|string[]} cmd Command to remove listener for.
   */
  this.deleteEvent = function(cmd) {
    if (typeof cmd === 'string') {
      if (cmds[cmd]) {
        delete cmds[cmd];
        delete blacklist[cmd];
      } else {
        self.common.error(
            'Requested deletion of event handler for event that was never ' +
            'registered! (' + cmd + ')');
      }
    } else if (Array.isArray(cmd)) {
      for (let i = 0; i < cmd.length; i++) {
        if (cmds[cmd[i]]) {
          delete cmds[cmd[i]];
          delete blacklist[cmd[i]];
        } else {
          self.common.error(
              'Requested deletion of event handler for event that was ' +
              'never registered! (' + cmd[i] + ')');
        }
      }
    } else {
      throw new Error('Event must be string or array of strings');
    }
  };
  /**
   * Temporarily disables calling the handler for the given command in a
   * certain
   * Discord text channel.
   *
   * @param {string} cmd Command to disable.
   * @param {string} channel ID of channel to disable command for.
   */
  this.disable = function(cmd, channel) {
    if (cmds[cmd]) {
      if (!blacklist[cmd] || blacklist[cmd].lastIndexOf(channel) == -1) {
        if (!blacklist[cmd]) {
          blacklist[cmd] = [channel];
        } else {
          blacklist[cmd].push(channel);
        }
      }
    } else {
      self.common.error(
          'Requested disable for event that was never registered! (' + cmd +
          ')');
    }
  };
  /**
   * Re-enable a command that was disabled previously.
   *
   * @param {string} cmd Command to enable.
   * @param {string} channel ID of channel to enable command for.
   */
  this.enable = function(cmd, channel) {
    if (blacklist[cmd]) {
      let index = blacklist[cmd].lastIndexOf(channel);
      if (index > -1) {
        blacklist[cmd].splice(index, 1);
      } else {
        self.common.error(
            'Requested enable of event that is enabled! (' + cmd + ')');
      }
    } else {
      self.common.error(
          'Requested enable for event that is not disabled! (' + cmd + ')');
    }
  };

  /**
   * Returns the callback function for the given event.
   *
   * @param {string} cmd Command to lookup.
   * @param {Discord~Message} [msg] Message that is to trigger this command.
   * Used for removing prefix from cmd if necessary.
   * @return {function} The event callback.
   */
  this.find = function(cmd, msg) {
    if (!cmd) cmd = msg.content.match(/^\S+/)[0];
    if (!cmd) return;
    if (msg && cmd.startsWith(msg.prefix)) cmd = cmd.replace(msg.prefix, '');
    cmd = cmd.toLowerCase();
    return cmds[cmd];
  };

  /**
   * Checks that the given command can be run with the given context. Does not
   * actually fire the event.
   *
   * @param {string} cmd The command to validate.
   * @param {?Discord~Message} msg The message that will fire the event. If
   * null, checks for channel and guild specific changes will not be
   * validated.
   * @param {commandHandler} [func] A command handler override to use for
   * settings lookup. If this is not specified, the handler associated with
   * cmd will be fetched.
   * @return {?string} Message causing failure, or null if valid.
   */
  this.validate = function(cmd, msg, func) {
    if (!func) func = self.find(cmd, msg);
    if (!func) return 'No Handler';
    if (msg && func.validOnlyOnServer && msg.guild === null) {
      return 'Guild Only';
    }
    if (msg && blacklist[cmd] &&
        blacklist[cmd].lastIndexOf(msg.channel.id) > -1) {
      return 'Disabled In Channel';
    }
    return null;
  };

  /**
   * Fetches a list of all currently registered commands.
   *
   * @return {string[]} Array of all registered commands.
   */
  this.getAllNames = function() {
    return Object.keys(cmds);
  };
}
module.exports = new Command();
