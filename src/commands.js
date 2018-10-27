// Copyright 2018 Campbell Crowley. All rights reserved.
// Author: Campbell Crowley (dev@campbellcrowley.com)
const fs = require('fs');
require('./mainModule.js')(Command); // Extends the MainModule class.

/**
 * @classdesc Manages the command event firing for all commands. This is not a
 * normal submodule, and is treated differently in the SpikeyBot class.
 * @class
 * @augments MainModule
 */
function Command() {
  const self = this;
  /** @inheritdoc */
  this.myName = 'Command';

  /** @inheritdoc */
  this.initialize = function() {
    self.client.guilds.forEach((g) => {
      const dir = self.common.guildSaveDir + g.id;
      const filename = dir + commandSettingsFile;
      fs.readFile(filename, (err, data) => {
        if (err) {
          if (err.code == 'ENOENT') {
            // File does not exist. No custom settings exist yet.
            return;
          }
          self.error('Failed to read user settings for commands: ' + filename);
          console.error(err);
          return;
        }
        try {
          let parsed = JSON.parse(data);
          if (parsed) {
            userSettings[g.id] = parsed;
          }
        } catch (e) {
        }
      });
    });
  };
  /** @inheritdoc */
  this.save = function(opt) {
    Object.entries(userSettings).forEach((el) => {
      const dir = self.common.guildSaveDir + el[0];
      const filename = dir + commandSettingsFile;

      if (opt == 'async') {
        fs.mkdir(dir, (err) => {
          if (err) {
            self.error('Failed to make guild directory for saving: ' + dir);
            console.error(err);
            return;
          }
          fs.writeFile(filename, JSON.stringify(el[1]), (err) => {
            if (err) {
              self.error(
                  'Failed to write command settings to file: ' + filename);
              console.error(err);
              return;
            }
          });
        });
      } else {
        try {
          fs.mkdirSync(dir);
        } catch (err) {
          self.error('Failed to make guild directory for saving: ' + dir);
          console.error(err);
          return;
        }
        try {
          fs.writeFileSync(filename, JSON.stringify(el[1]));
        } catch (err) {
          self.error('Failed to write command settings to file: ' + filename);
          console.error(err);
          return;
        }
      }
    });
  };

  /** @inheritdoc */
  this.import = function(data) {
    if (!data) return;
    cmds = data.cmds;
    internalBlacklist = data.internalBlacklist;
  };
  /** @inheritdoc */
  this.export = function() {
    return {
      cmds: cmds,
      internalBlacklist: internalBlacklist,
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
   * Object storing information about a single command, it's handler, and
   * default options.
   * @public
   *
   * @param {string|string[]} cmd All commands the handler will fire on.
   * @param {Function} handler The event handler when the command has been
   * triggered.
   * @param {CommandSetting} [opts] The options for this command.
   */
  function SingleCommand(cmd, handler, opts) {
    const me = this;
    if (typeof handler !== 'function') {
      throw new Error('Command handler must be a function.');
    }
    if (typeof cmd === 'string') cmd = [cmd];
    if (!Array.isArray(cmd)) {
      throw new Error(
          'Commands must be specified as a string, or array of strings.');
    }

    /**
     * Get the primary key for this object. The first or only value passed in
     * for `cmd`, and may be used to show the user the command that this object
     * stores information about.
     * @public
     *
     * @return {string} The command string.
     */
    this.getName = function() {
      return me.aliases[0];
    };
    /**
     * All versions of this command that may be used to trigger the same
     * handler.
     * @public
     *
     * @type {string[]}
     */
    this.aliases = cmd.map((el) => {
      return el.toLowerCase();
    });
    /**
     * The function to call when this command has been triggered.
     * @public
     *
     * @param {Discord~Message} msg The message that is triggering this command.
     */
    this.trigger = function(msg) {
      if (me.options.isDisabled(msg)) {
        throw new Error('Attempted to trigger disabled command!');
      }
      handler(msg);
    };
    /**
     * The current options and settings for this command.
     * @public
     * @type {Command~CommandSetting}
     */
    this.options = new CommandSetting(opts);
  }
  this.SingleCommand = SingleCommand;

  /**
   * Stores all settings related to a command.
   * @public
   *
   * @param {Command~CommandSetting} [opts] The options to set, or nothing for
   * default values.
   */
  function CommandSetting(opts) {
    const me = this;
    if (!opts) opts = {};
    /**
     * If the command is only allowed to be used in guilds.
     * @public
     * @type {boolean}
     */
    this.validOnlyInGuild = opts.validOnlyInGuild || false;
    /**
     * Whether this command is disabled for all by default and requires them to
     * be in the list of enabled IDs. If this is false, the command is enabled
     * for everyone, unless they fall under the 'disabled' list.
     */
    this.defaultDisabled = opts.defaultDisabled || false;
    /**
     * The IDs of all places where this command is currently disabled. Any ID
     * will be mapped to a truthy value. Roles will be mapped to the guild ID
     * and the role ID.
     * @public
     * @type {{
     *    guilds: Object.<boolean>,
     *    channels: Object.<boolean>,
     *    users: Object.<boolean>,
     *    roles: Object.<boolean>
     * }}
     */
    this.disabled = opts.disabled || {};
    if (typeof this.disabled.guilds !== 'object') {
      this.disabled.guilds = {};
    }
    if (typeof this.disabled.channels !== 'object') {
      this.disabled.channels = {};
    }
    if (typeof this.disabled.users !== 'object') {
      this.disabled.users = {};
    }
    if (typeof this.disabled.roles !== 'object') {
      this.disabled.roles = {};
    }
    /**
     * The IDs of all places where this command is currently enabled. Any ID
     * will be mapped to a truthy value. Roles will be mapped to the guild ID
     * and the role ID.
     * @public
     * @type {{
     *    guilds: Object.<boolean>,
     *    channels: Object.<boolean>,
     *    users: Object.<boolean>,
     *    roles: Object.<boolean>
     * }}
     */
    this.enabled = opts.enabled || {};
    if (typeof this.enabled.guilds !== 'object') {
      this.enabled.guilds = {};
    }
    if (typeof this.enabled.channels !== 'object') {
      this.enabled.channels = {};
    }
    if (typeof this.enabled.users !== 'object') {
      this.enabled.users = {};
    }
    if (typeof this.enabled.roles !== 'object') {
      this.enabled.roles = {};
    }

    /**
     * Enable, disable, or neutralize this command for the associated guild,
     * channel, user, or role.
     * @public
     *
     * @param {string} value `enabled`|`disabled`|`default` Whether to set this
     * ID to enabled, disabled, or to whatever the default value is.
     * @param {string} type `guild`|`channel`|`user`|`role` The type of ID that
     * is being given.
     * @param {string} id The id to set the value to.
     * @param {string} [id2] The guild ID if `type` is 'role', of where the role
     * is created.
     */
    this.set = function(value, type, id, id2) {
      switch (value) {
        case 'enabled':
        case 'disabled':
        case 'default':
          break;
        default:
          throw new Error(
              'Invalid value to set the command to \'' + value +
              '\'. (Expected \'enabled\', \'disabled\', or \'default\'.)');
      }
      switch (type) {
        case 'guild':
          if (!id || !self.client.guilds.get(id)) {
            throw new Error('Guild ID is invalid for id: ' + id);
          }
          if (value != 'enabled') delete me.enabled.guilds[id];
          else me.enabled.guilds[id] = true;
          if (value != 'disabled') delete me.disabled.guilds[id];
          else me.disabled.guilds[id] = true;
          return;
        case 'channel':
          if (!id || !self.client.channels.get(id)) {
            throw new Error('Channel ID is invalid for id: ' + id);
          }
          if (value != 'enabled') delete me.enabled.channels[id];
          else me.enabled.channels[id] = true;
          if (value != 'disabled') delete me.disabled.channels[id];
          else me.disabled.channels[id] = true;
          return;
        case 'user':
          if (!id || !self.client.users.get(id)) {
            throw new Error('User ID is invalid for id: ' + id);
          }
          if (value != 'enabled') delete me.enabled.users[id];
          else me.enabled.users[id] = true;
          if (value != 'disabled') delete me.disabled.users[id];
          else me.disabled.users[id] = true;
          return;
        case 'role':
          if (!id2 || !self.client.guilds.get(id2)) {
            throw new Error('Guild ID is invalid for id2: ' + id2);
          }
          if (!id || !self.client.guilds.get(id2).roles.get(id)) {
            throw new Error('Role ID is invalid for id: ' + id);
          }
          if (value != 'enabled') delete me.enabled.roles[id2 + '/' + id];
          else me.enabled.roles[id2 + '/' + id] = true;
          if (value != 'disabled') delete me.disabled.roles[id2 + '/' + id];
          else me.disabled.roles[id2 + '/' + id] = true;
          return;
        default:
          throw new Error(
              'Invalid type to set command enabled/disabled status to \'' +
              type +
              '\'. (Expected \'guild\', \'channel\', \'user\', or \'role\'.)');
      }
    };

    /**
     * Check if this command is disabled with the given context.
     * @public
     *
     * @param {Discord~Message} msg The message with the current context of
     * which to check if the command is disabled.
     * @return {boolean} Whether the command has been disabled for any reason.
     */
    this.isDisabled = function(msg) {
      if (!msg) {
        throw new Error('Checking for disabled requires a Discord~Message.');
      }
      if (!msg.guild && me.validOnlyInGuild) return false;
      let disallow = me.defaultDisabled ? me.enabled : me.disabled;
      let matched = findMatch(disallow, msg);
      return (!matched && me.defaultDisabled) ||
          (matched && !me.defaultDisabled);

      /**
       * Searches the given object against the reference data to see if they
       * find any matching IDs.
       * @private
       *
       * @param {Command~CommandSetting.disabled|Command~CommandSetting.enabled}
       * search The search data.
       * @param {Discord~Message} data The context to search for.
       * @return {boolean} Returns if a match was found.
       */
      function findMatch(search, data) {
        if (search.users[msg.author.id]) return true;
        if (search.channels[msg.channel.id]) return true;
        if (msg.guild) {
          if (search.guilds[msg.guild.id]) return true;
          if (msg.member.roles.find((r) => {
            return saerch.roles[r];
          })) {
            return true;
          }
        }
        return false;
      }
    };
    /**
     * Creates a JSON formatted object with the necessary properties for
     * re-creating this object.
     * @public
     *
     * @return {Object} Object ready to be stringified for file saving.
     */
    this.toJSON = function() {
      return {
        validOnlyInGuild: me.validOnlyInGuild,
        defaultDisabled: me.defaultDisabled,
        disabled: me.disabled,
        enabled: me.enabled,
      };
    };
  }
  this.CommandSetting = CommandSetting;

  /**
   * Specific settings defined by users as restrictions on commands. Mapped by
   * guild id, then by the command.
   *
   * @private
   * @type {Object.<Object.<CommandSetting>>}
   */
  let userSettings = {};

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
   * Filename in the guild's subdirectory where command settings are stored.
   *
   * @private
   * @constant
   * @default
   * @type {string}
   */
  const commandSettingsFile = '/commandSettings.js';

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
      } else if (failure === 'Disabled') {
        self.common.reply(msg, 'This command has been temporarily disabled.');
        return true;
      } else if (failure === 'User Disabled') {
        self.common.reply(msg, 'This command has been disabled by a user.');
        return true;
      } else if (failure) {
        self.common.reply(
            msg, 'I am unable to attempt this command for an unknown reason.',
            failure);
        self.error('Comand failed: ' + cmd + ': ' + failure);
        return false;
      }
      msg.text = msg.content.replace(msg.prefix + cmd, '');
      try {
        func(msg);
      } catch (err) {
        self.error(cmd + ': FAILED');
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
   * @param {string|string[]|Command~SingleCommand} cmd Command to listen for.
   * @param {commandHandler} [cb] Function to call when command is triggered.
   * @param {boolean} [onlyserver=false] Whether the command is only allowed
   * on a server.
   */
  this.on = function(cmd, cb, onlyserver) {
    // Legacy mapping.
    if (!(cmd instanceof SingleCommand)) {
      cmd = new SingleCommand(cmd, cb, {validOnlyInGuild: onlyserver});
    }

    let keys = Object.keys(cmds);
    let duplicates = cmd.aliases.filter((el) => {
      return keys.includes(el);
    });
    if (duplicates.length > 0) {
      self.error(
          'Attempted to register a second handler for event that already ' +
          'exists! (' + duplicates.join(', ') + ')');
    } else {
      cmds[cmd.getName()] = cmd;
    }
  };
  /**
   * Remove listener for a command.
   * @public
   *
   * @param {string|string[]} cmd Command or alias of command to remove listener
   * for.
   */
  this.removeListener = function(cmd) {
    if (typeof cmd === 'string') {
      let obj = Object.entries(cmds).find((el) => {
        return el[1].aliases.includes(cmd);
      });
      if (obj) {
        delete cmds[obj[0]];
      } else {
        self.error(
            'Requested deletion of event handler for event that was never ' +
            'registered! (' + cmd + ')');
      }
    } else if (Array.isArray(cmd)) {
      for (let i = 0; i < cmd.length; i++) {
        this.removeListener(cmd[i]);
      }
    } else {
      throw new Error('Event must be string or array of strings');
    }
  };
  /**
   * Alias for {@link Command.removeListener}
   * @deprecated
   * @public
   */
  this.deleteEvent = this.removeListener;
  /**
   * Re-enable a command that was disabled previously. This manages internal
   * blocking, not user-defined settings. Changes made here do not persist
   * accross reboots.
   * @public
   *
   * @param {string} cmd Command to enable.
   * @param {string} channel ID of channel or guild to enable command for.
   */
  this.enable = function(cmd, channel) {
    if (internalBlacklist[cmd]) {
      let index = internalBlacklist[cmd].lastIndexOf(channel);
      if (index > -1) {
        internalBlacklist[cmd].splice(index, 1);
      } else {
        self.error('Requested enable of event that is enabled! (' + cmd + ')');
      }
    } else {
      self.error(
          'Requested enable for event that is not disabled! (' + cmd + ')');
    }
  };

  /**
   * Returns the callback function for the given event.
   * @public
   *
   * @param {string} cmd Command to lookup.
   * @param {Discord~Message} [msg] Message that is to trigger this command.
   * Used for removing prefix from cmd if necessary.
   * @return {Command~SingleCommand} The single command object reference.
   */
  this.find = function(cmd, msg) {
    if (!cmd) cmd = msg.content.match(/^\S+/)[0];
    if (!cmd) return;
    if (msg && cmd.startsWith(msg.prefix)) cmd = cmd.replace(msg.prefix, '');
    cmd = cmd.toLowerCase();
    return Object.values(cmds).find((el) => {
      return el.aliases.includes(cmd);
    });
  };

  /**
   * Checks that the given command can be run with the given context. Does not
   * actually fire the event.
   * @public
   *
   * @param {string} cmd The command to validate.
   * @param {?Discord~Message} msg The message that will fire the event. If
   * null, checks for channel and guild specific changes will not be
   * validated.
   * @param {Command~SingleCommand} [func] A command handler override to use for
   * settings lookup. If this is not specified, the handler associated with
   * cmd will be fetched.
   * @return {?string} Message causing failure, or null if valid.
   */
  this.validate = function(cmd, msg, func) {
    if (!func) func = self.find(cmd, msg);
    if (!func) return 'No Handler';
    if (msg && func.options.validOnlyInGuild && msg.guild === null) {
      return 'Guild Only';
    }
    if (msg) {
      if (func.options.isDisabled(msg)) {
        return 'Disabled';
      }
      let guildValues = userSettings[msg.guild.id];
      if (guildValues) {
        let commandValues = guildValues[func.getName()];
        if (commandValues && commandValues.isDisabled(msg)) {
          return 'User Disabled';
        }
      }
    }
    return null;
  };

  /**
   * Fetches a list of all currently registered commands.
   * @public
   *
   * @return {string[]} Array of all registered commands.
   */
  this.getAllNames = function() {
    return Object.keys(cmds);
  };
}
module.exports = new Command();
