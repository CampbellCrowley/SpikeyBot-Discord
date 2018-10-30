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
            if (!userSettings[g.id]) userSettings[g.id] = {};
            Object.entries(parsed).forEach((el) => {
              userSettings[g.id][el[0]] = new CommandSetting(el[1]);
            });
          }
          fs.unlink(filename, (err) => {
            if (err) {
              self.error(
                  'Failed to delete command settings file after reading: ' +
                  filename);
              console.error(err);
              return;
            }
          });
        } catch (e) {
        }
      });
    });

    const cmdSettings = new CommandSetting({
      validOnlyInGuild: true,
      defaultDisabled: true,
      permissions: self.Discord.Permissions.FLAGS.MANAGE_GUILD,
    });
    self.on(new SingleCommand(['disable'], commandDisable, cmdSettings));
    self.on(new SingleCommand(['enable'], commandEnable, cmdSettings));
    self.on(
        new SingleCommand(
            ['show', 'enabled', 'disabled', 'showenabled', 'showdisabled'],
            commandShow, cmdSettings));
    self.on(new SingleCommand(['reset'], commandReset, cmdSettings));
  };
  /** @inheritdoc */
  this.shutdown = function() {
    self.removeListener(['disable', 'enable', 'show', 'reset']);
  };
  /** @inheritdoc */
  this.save = function(opt) {
    Object.entries(userSettings).forEach((el) => {
      const dir = self.common.guildSaveDir + el[0];
      const filename = dir + commandSettingsFile;

      if (opt == 'async') {
        fs.mkdir(dir, (err) => {
          if (err) {
            if (err.code !== 'EEXIST') {
              self.error('Failed to make guild directory for saving: ' + dir);
              console.error(err);
              return;
            }
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
          if (err.code !== 'EEXIST') {
            self.error('Failed to make guild directory for saving: ' + dir);
            console.error(err);
            return;
          }
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
    eventList = data.events;
  };
  /** @inheritdoc */
  this.export = function() {
    return {
      cmds: cmds,
      events: eventList,
    };
  };

  /**
   * The function to call when a command is triggered.
   *
   * @callback commandHandler
   * @param {Discord~Message} msg The message sent in Discord.
   */

  /**
   * Currently registered event listeners for non-command events.
   */
  let eventList = {};

  /**
   * All tracked commands mapped by command name.
   *
   * @private
   * @type {Object.<SingleCommand>}
   */
  let cmds = {};

  /**
   * Object storing information about a single command, it's handler, and
   * default options.
   * @public
   *
   * @param {string|string[]} cmd All commands the handler will fire on.
   * @param {commandHandler} handler The event handler when the command has been
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
     * The guild ID of the guild is settings object is for, or null if this
     * instance is not specific to a single guild.
     * @public
     * @type {?string}
     */
    this.myGuild = opts.guildId || null;
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
     * and the role ID. Use {@link Command~CommandSetting.set} to change these
     * values.
     * @public
     * @readonly
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
     * and the role ID. Use {@link Command~CommandSetting.set} to change these
     * values.
     * @public
     * @readonly
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
     * Bitfield representation of the required permissions for a user to have to
     * run this command. Same bitfield used by Discord~Permissions.
     * @public
     * @type {number}
     * @default 0
     */
    this.permissions = opts.permissions;
    if (typeof this.permissions !== 'number') {
      this.permissions = 0;
    }

    /**
     * Enable, disable, or neutralize this command for the associated guild,
     * channel, user, or role.
     * @public
     * @fires Command.events#settingsChanged
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
          break;
        case 'channel':
          if (!id || !self.client.channels.get(id)) {
            throw new Error('Channel ID is invalid for id: ' + id);
          }
          if (value != 'enabled') delete me.enabled.channels[id];
          else me.enabled.channels[id] = true;
          if (value != 'disabled') delete me.disabled.channels[id];
          else me.disabled.channels[id] = true;
          break;
        case 'user':
          if (!id || !self.client.users.get(id)) {
            throw new Error('User ID is invalid for id: ' + id);
          }
          if (value != 'enabled') delete me.enabled.users[id];
          else me.enabled.users[id] = true;
          if (value != 'disabled') delete me.disabled.users[id];
          else me.disabled.users[id] = true;
          break;
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
          break;
        default:
          throw new Error(
              'Invalid type to set command enabled/disabled status to \'' +
              type +
              '\'. (Expected \'guild\', \'channel\', \'user\', or \'role\'.)');
      }
      self.fire('settingsChanged', me.myGuild, value, type, id, id2);
    };

    /**
     * Check if this command is disabled with the given context.
     * @public
     *
     * @param {Discord~Message} msg The message with the current context of
     * which to check if the command is disabled.
     * @return {number} 0 if not disabled, 2 if disabled is specific to user, 1
     * if disabled for any other reason.
     */
    this.isDisabled = function(msg) {
      if (!msg) {
        throw new Error('Checking for disabled requires a Discord~Message.');
      }
      if (!msg.guild && me.validOnlyInGuild) return 1;

      let hasPerm = false;
      if (msg.guild) {
        // The command is disabled by default, but the GuildMember has a
        // required permission to run this command, or is Admin, or is guild
        // owner.
        let perms = 0;
        if (msg.channel) {
          perms = msg.channel.permissionsFor(msg.member).bitfield;
        } else {
          perms = msg.member.permissions.bitfield;
        }
        hasPerm =
            ((perms & me.permissions) ||
             (perms & self.Discord.Permissions.FLAGS.ADMINISTRATOR) ||
             (msg.guild.ownerID === msg.author.id));
        hasPerm = (hasPerm && true) || false;
      }

      let disallow = me.defaultDisabled ? me.enabled : me.disabled;
      let matched = findMatch(disallow, msg);
      let isDisabled = (
        // Command is disabled by default, and context does not explicitly
        // enable the command.
        ((!matched && !hasPerm) && me.defaultDisabled) ||
          // Command is enabled by default, but context explicitly disables
          // the command.
          (matched && !me.defaultDisabled));

      if (!isDisabled) return 0;
      if (me.defaultDisabled) {
        return 1;
      } else {
        return matched;
      }

      /**
       * Searches the given object against the reference data to see if they
       * find any matching IDs.
       * @private
       *
       * @param {Command~CommandSetting.disabled|Command~CommandSetting.enabled}
       * search The search data.
       * @param {Discord~Message} data The context to search for.
       * @return {number} 0 if not disabled, 2 if disabled is specific to user,
       * 1 if disabled for any other reason.
       */
      function findMatch(search, data) {
        if (search.users[msg.author.id]) return 2;
        if (msg.channel && search.channels[msg.channel.id]) return 1;
        if (msg.guild) {
          if (search.guilds[msg.guild.id]) return 1;
          if (msg.member.roles.find((r) => {
            return search.roles[r];
          })) {
            return 2;
          }
        }
        return 0;
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
        permissions: me.permissions,
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
   * Fetch all user-defined settings for a guild.
   * @public
   *
   * @param {string} gId THe guild id of which to fetch the settings.
   * @return {Object.<CommandSetting>} The settings for the guild mapped by
   * command name.
   */
  this.getUserSettings = function(gId) {
    return userSettings[gId];
  };

  /**
   * Fetch all commands and their default setting values.
   * @see {@link Command~cmds}
   * @public
   *
   * @return {Object.<SingleCommand>} All currently registered commands.
   */
  this.getDefaultSettings = function() {
    return cmds;
  };

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
        self.common.reply(msg, 'This command has not been enabled for you.');
        return true;
      } else if (failure === 'Disabled Individual') {
        self.common.reply(msg, 'You do not have permission for this command.');
        return true;
      } else if (failure === 'User Disabled') {
        self.common.reply(msg, 'This command has been disabled by an admin.');
        return true;
      } else if (failure === 'User Disabled Individual') {
        self.common.reply(
            msg, 'An admin has prevented you from using this command.');
        return true;
      } else if (failure) {
        if (failure.startsWith('NoPerm:')) {
          self.common.reply(
              msg, 'You must have one of the following permissions ' +
                  'to use this command:\n' +
                  failure.substring(7, failure.length));
          return true;
        } else {
          self.common.reply(
              msg, 'I am unable to attempt this command for ' +
                  'you due of an unknown reason.',
              failure);
          self.error('Comand failed: ' + cmd + ': ' + failure);
          return true;
        }
      }
      msg.text = msg.content.replace(msg.prefix + cmd, '');
      try {
        func.trigger(msg);
      } catch (err) {
        self.error(cmd + ': FAILED');
        console.error(err);
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
    if (msg && func.options.validOnlyInGuild && !msg.guild) {
      return 'Guild Only';
    }
    if (msg) {
      let def = func.options.defaultDisabled;
      let isDisabledGlobally = func.options.isDisabled(msg);
      let isDisabledLocally = def;
      let bitfield = func.options.permissions;

      if (msg.guild) {
        let guildValues = userSettings[msg.guild.id];
        if (guildValues) {
          let commandValues = guildValues[func.getName()];
          if (commandValues) {
            isDisabledLocally = commandValues.isDisabled(msg);
            bitfield = bitfield | commandValues.permissions;
          }
        }
      }

      if (!def && isDisabledLocally) {
        return isDisabledLocally == 2 ? 'User Disabled Individual' :
                                        'User Disabled';
      } else if (def && !isDisabledLocally) {
        return null;
      } else if (bitfield && def && isDisabledLocally && isDisabledGlobally) {
        return 'NoPerm:' +
            new self.Discord.Permissions(bitfield).toArray().join(', ');
      } else if (isDisabledGlobally) {
        return isDisabledGlobally == 2 ? 'Disabled Individual' : 'Disabled';
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

  /**
   * Allow user to disable a command.
   * @private
   * @type {Command~commandHandler}
   *
   * @param {Discord~Message} msg The message the user sent that triggered this.
   */
  function commandDisable(msg) {
    if (!msg.text || !msg.text.trim()) {
      self.common.reply(
          msg, 'Please specify a command, and where to disable it.');
      return;
    }
    let splitText = msg.text.trim().split(/[\s\n]/);
    let cmd = self.find(splitText[0], msg);
    if (!cmd) {
      self.common.reply(
          'I was unable to find that command. (`' + splitText[0] + '`)');
      return;
    }
    let name = cmd.getName();
    if (!userSettings[msg.guild.id]) userSettings[msg.guild.id] = {};
    if (!userSettings[msg.guild.id][name]) {
      userSettings[msg.guild.id][name] = new CommandSetting();
    }
    let settings = userSettings[msg.guild.id][name];
    let disabledList = [];
    msg.mentions.channels.forEach((c) => {
      if (settings.disabled.channels[c.id]) return;
      settings.set(
          cmd.options.defaultDisabled ? 'default' : 'disabled', 'channel',
          c.id);
      disabledList.push(c.type + ' channel: ' + c.name);
    });
    msg.mentions.members.forEach((m) => {
      if (settings.disabled.users[m.id]) return;
      settings.set(
          cmd.options.defaultDisabled ? 'default' : 'disabled', 'user', m.id);
      disabledList.push('Member: ' + m.user.tag);
    });
    msg.mentions.roles.forEach((r) => {
      if (settings.disabled.roles[r.guild.id + '/' + r.id]) return;
      settings.set(
          cmd.options.defaultDisabled ? 'default' : 'disabled', 'role',
          r.guild.id, r.id);
      disabledList.push('Role: ' + r.name);
    });

    splitText
        .filter(
            (el) => {
              return !(
                el.match(self.Discord.MessageMentions.CHANNELS_PATTERN) ||
                  el.match(self.Discord.MessageMentions.USERS_PATTERN) ||
                  el.match(self.Discord.MessageMentions.ROLES_PATTERN));
            })
        .join(' ')
        .split(',')
        .forEach(
            (el) => {
              let trimmed = el.trim().toLowerCase();
              if (trimmed === 'guild' || trimmed === 'everyone' ||
                  trimmed === 'all') {
                settings.set('disabled', 'guild', msg.guild.id);
                return;
              }
              let role = msg.guild.roles.find((r) => {
                return r.name.toLowerCase() == trimmed;
              });
              if (role) {
                if (settings.disabled.roles[role.guild.id + '/' + role.id]) {
                  return;
                }
                settings.set('disabled', 'role', role.guild.id, rold.id);
                disabledList.push('Role: ' + role.name);
                return;
              }
              let user = msg.guild.members.find((m) => {
                return m.user.tag.toLowerCase() == trimmed;
              });
              if (user) {
                if (settings.disabled.user[user.id]) return;
                settings.set('disabled', 'user', user.id);
                disabledList.push('Member: ' + user.user.tag);
                return;
              }
            });
    self.common.reply(
        msg, 'Disabled `' + name + '` for\n' +
            (disabledList.join('\n') || 'Nothing'));
  }
  /**
   * Allow user to enable a command.
   * @private
   * @type {Command~commandHandler}
   *
   * @param {Discord~Message} msg The message the user sent that triggered this.
   */
  function commandEnable(msg) {
    if (!msg.text || !msg.text.trim()) {
      self.common.reply(
          msg, 'Please specify a command, and where to enable it.');
      return;
    }
    let splitText = msg.text.trim().split(/[\s\n]/);
    let cmd = self.find(splitText[0], msg);
    if (!cmd) {
      self.common.reply(
          'I was unable to find that command. (`' + splitText[0] + '`)');
      return;
    }
    let name = cmd.getName();
    if (!userSettings[msg.guild.id]) userSettings[msg.guild.id] = {};
    if (!userSettings[msg.guild.id][name]) {
      userSettings[msg.guild.id][name] = new CommandSetting();
    }
    let settings = userSettings[msg.guild.id][name];
    let enabledList = [];
    msg.mentions.channels.forEach((c) => {
      if (settings.enabled.channels[c.id]) return;
      settings.set(
          cmd.options.defaultDisabled ? 'enabled' : 'default', 'channel', c.id);
      enabledList.push(c.type + ' channel: ' + c.name);
    });
    msg.mentions.members.forEach((m) => {
      if (settings.enabled.users[m.id]) return;
      settings.set(
          cmd.options.defaultDisabled ? 'enabled' : 'default', 'user', m.id);
      enabledList.push('Member: ' + m.user.tag);
    });
    msg.mentions.roles.forEach((r) => {
      if (settings.enabled.roles[r.guild.id + '/' + r.id]) return;
      settings.set(
          cmd.options.defaultDisabled ? 'enabled' : 'default', 'role',
          r.guild.id, r.id);
      enabledList.push('Role: ' + r.name);
    });

    splitText
        .filter(
            (el) => {
              return !(
                el.match(self.Discord.MessageMentions.CHANNELS_PATTERN) ||
                  el.match(self.Discord.MessageMentions.USERS_PATTERN) ||
                  el.match(self.Discord.MessageMentions.ROLES_PATTERN));
            })
        .join(' ')
        .split(',')
        .forEach(
            (el) => {
              let trimmed = el.trim().toLowerCase();
              if (trimmed === 'guild' || trimmed === 'everyone' ||
                  trimmed === 'all') {
                settings.set('enabled', 'guild', msg.guild.id);
                return;
              }
              let role = msg.guild.roles.find((r) => {
                return r.name.toLowerCase() == trimmed;
              });
              if (role) {
                if (settings.enabled.roles[role.guild.id + '/' + role.id]) {
                  return;
                }
                settings.set('enabled', 'role', role.guild.id, rold.id);
                enabledList.push('Role: ' + role.name);
                return;
              }
              let user = msg.guild.members.find((m) => {
                return m.user.tag.toLowerCase() == trimmed;
              });
              if (user) {
                if (settings.enabled.user[user.id]) return;
                settings.set('enabled', 'user', user.id);
                enabledList.push('Member: ' + user.user.tag);
                return;
              }
            });
    self.common.reply(
        msg, 'Enabled `' + name + '` for\n' +
            (enabledList.join('\n') || 'Nothing'));
  }

  /**
   * Show user the currently configured settings for commands.
   * @private
   * @type {Command~commandHandler}
   *
   * @param {Discord~Message} msg The message the user sent that triggered this.
   */
  function commandShow(msg) {
    let commands;
    if (msg.text && msg.text.trim()) {
      let text = msg.text.trim().toLowerCase();
      if (text.startsWith(msg.prefix)) text = text.replace(msg.prefix, '');
      commands = userSettings[msg.guild.id];
      if (commands) {
        commands = commands[text];
      }
      if (!commands) {
        let found = Object.values(cmds).find((el) => {
          return el.aliases.includes(text);
        });
        if (!found) {
          self.common.reply(msg, 'That is not a valid command to lookup.');
        } else {
          let output = 'That command is using default settings.\n' +
              (found.options.defaultDisabled ? 'Disabled' : 'Enabled') +
              ' by default';
          if (found.options.defaultDisabled && found.options.permissions) {
            output += ' and enabled with the following permissions:\n' +
                new self.Discord.Permissions(found.options.permissions)
                    .toArray()
                    .join(', ');
          }
          self.common.reply(msg, output);
        }
        return;
      }
      commands = [[text, commands]];
    } else if (!userSettings[msg.guild.id]) {
      self.common.reply(
          msg, 'No custom settings for commands have been created.');
      return;
    } else {
      commands = Object.entries(userSettings[msg.guild.id]).filter((el) => {
        if (el[1].defaultDisabled) {
          return el[1].permissions || el[1].enabled.channels ||
              el[1].enabled.users || el[1].enabled.roles;
        } else {
          return el[1].disabled.channels || el[1].disabled.users ||
              el[1].disabled.roles;
        }
      });
    }
    let output = commands.map((el) => {
      let tmp = [];
      let obj;
      if (cmds[el[0]].options.defaultDisabled) {
        tmp.push(el[0] + ' Enabled with the following (disabled by default):');
        if (el[1].permissions) {
          tmp.push(
              new self.Discord
                  .Permissions(
                      el[1].permissions | cmds[el[0]].options.permissions)
                  .toArray()
                  .join(', '));
        }
        obj = el[1].enabled;
      } else {
        tmp.push(el[0] + ' Disabled with the following (enabled by default):');
        obj = el[1].disabled;
      }
      let channels = Object.keys(obj.channels);
      if (channels.length) {
        let list = channels.map((c) => {
          if (!msg.guild.channels.get(c)) return '';
          return msg.guild.channels.get(c).name;
        });
        tmp.push('Channels: ' + list.join(', '));
      }
      let users = Object.keys(obj.users);
      if (users.length) {
        let list = users.map((u) => {
          if (!msg.guild.members.get(u)) return '';
          return msg.guild.members.get(u).user.tag;
        });
        tmp.push('Members: ' + list.join(', '));
      }
      let roles = Object.keys(obj.roles);
      if (roles.length) {
        let list = roles.map((r) => {
          r = r.split('/')[1];
          if (!msg.guild.roles.get(r)) return '';
          return msg.guild.members.get(r).user.tag;
        });
        tmp.push('Roles: ' + list.join(', '));
      }
      if (tmp.length == 1) return '';
      return tmp.join('\n--');
    });
    self.common.reply(
        msg,
        output.join('\n').trim() || 'No comand settings have been defined.');
  }
  /**
   * Reset all custom command settings to default.
   * @private
   * @type {Command~commandHandler}
   * @fires Command.events#settingsReset
   *
   * @param {Discord~Message} msg The message the user sent that triggered this.
   */
  function commandReset(msg) {
    self.common
        .reply(
            msg, 'Are you sure you wish to reset all' +
                ' settings for all commands on this server?')
        .then((msg_) => {
          msg_.react('✅');
          msg_.awaitReactions((reaction, user) => {
            return reaction.emoji.name === '✅' && user.id === msg.author.id;
          }, {time: 30000, max: 1}).then((reactions) => {
            if (reactions.size === 0) {
              msg_.edit('```Timed out```');
              return;
            }
            msg_.edit('```Confirmed```');
            delete userSettings[msg.guild.id];
            self.common.reply(
                msg, 'All settings for commands have been reset.');
            self.fire('settingsReset', msg.guild.id);
          });
        });
  }

  /**
   * Register an event listener.
   * @public
   *
   * @param {string} name The name of the event to listen for.
   * @param {Function} handler The function to call when the event is fired.
   */
  this.addEventListener = function(name, handler) {
    if (!eventList[name]) eventList[name] = [];
    eventList[name].push(handler);
  };
  /**
   * Remove an event listener.
   * @public
   *
   * @param {string} name The name of the event to listen for.
   * @param {Function} handler THe handler that is currently registered to
   * listen on this event.
   */
  this.removeEventListener = function(name, handler) {
    let handlers = eventList[name];
    if (!handlers) return;
    let index = handlers.findIndex((el) => {
      return el == handler;
    });
    if (index < 0) return;
    handlers.splice(index, 0);
  };

  /**
   * Fire all handlers listening for an event.
   * @public
   *
   * @param {string} name The name of the event to fire.
   * @param {*} args The arguments to pass to the handlers.
   */
  this.fire = function(name, ...args) {
    let handlers = eventList[name];
    if (!handlers || handlers.length == 0) return;
    handlers.forEach((h) => {
      h.apply(h, args);
    });
  };
}
module.exports = new Command();
