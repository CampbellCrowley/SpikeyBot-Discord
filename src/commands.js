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
          const parsed = JSON.parse(data);
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
          self.error('Failed to parse command settings: ' + filename);
          console.error(e);
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
            [
              'show', 'enabled', 'disabled', 'showenabled', 'showdisabled',
              'settings', 'commands', 'permissions',
            ],
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
   * @classdesc Object storing information about a single command, it's handler,
   * and default options.
   * @class
   * @public
   *
   * @param {string|string[]} cmd All commands the handler will fire on.
   * @param {commandHandler} handler The event handler when the command has been
   * triggered.
   * @param {CommandSetting} [opts] The options for this command.
   * @param {SingleCommand|SingleCommand[]} [subCmds] Sub commands that use this
   * command as a fallback. Command names must be separated by white space in
   * order to trigger the sub command.
   */
  function SingleCommand(cmd, handler, opts, subCmds) {
    const me = this;
    if (typeof handler !== 'function') {
      throw new Error('Command handler must be a function.');
    }
    if (typeof cmd === 'string') cmd = [cmd];
    if (!Array.isArray(cmd)) {
      throw new Error(
          'Commands must be specified as a string, or array of strings.');
    }
    if (subCmds && !Array.isArray(subCmds)) subCmds = [subCmds];
    else if (!subCmds) subCmds = [];

    /**
     * The name of the parent command if this is a subcommand.
     * @public
     * @readonly
     * @type {?string}
     */
    this.parentName = null;

    /**
     * Update the parent name for this command and all child commands.
     * @public
     * @param {string} to The parent name to set.
     */
    this.updateParentName = function(to) {
      me.parentName = to;
      const fullName = me.getFullName();
      for (const i in me.subCmds) {
        if (me.subCmds[i].updateParentName) {
          me.subCmds[i].updateParentName(fullName);
        }
      }
    };

    /**
     * Get the full name for this command including parent command
     * @return {string} This command's name prefixed with the parent command's
     * name.
     */
    this.getFullName = function() {
      if (me.parentName) {
        return me.parentName + ' ' + me.getName();
      } else {
        return me.getName();
      }
    };

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
     * Sub commands for this single command. Triggered by commands separated by
     * whitespace. Object mapped by subcommand name, similar to {@link
     * Command~cmds}.
     * @public
     * @type {Object.<SingleCommand>}
     */
    this.subCmds = {};
    for (let i = 0; i < subCmds.length; i++) {
      this.subCmds[subCmds[i].getName()] = subCmds[i];
    }
    this.updateParentName(me.parentName);

    /**
     * The function to call when this command has been triggered.
     * @public
     *
     * @param {Discord~Message} msg The message that is triggering this command.
     */
    this.trigger = function(msg) {
      if (msg.cmd && msg.cmd != me.getFullName() && me.subCmds) {
        const sub = msg.cmd.replace(me.getFullName() + ' ', '').split(' ')[0];
        if (sub) {
          let match = me.subCmds[sub];
          if (!match) {
            match = Object.values(me.subCmds).find((el) => {
              return el.aliases.includes(sub);
            });
          }
          if (match) {
            msg.text =
                msg.text.replace(new RegExp('^.*?' + me.getFullName()), '');
            me.subCmds[sub].trigger(msg);
            return;
          }
        }
      }
      const uIds = msg.text.match(/\d{17,19}/g);
      const uTags = msg.text.replace(/\d{17,19}/g, '')
          .match(/([^@#:\s][^@#:]{0,30}[^@#:\s])(#\d{4})?/g);
      msg.softMentions = {
        users: new self.Discord.UserStore(self.client),
        members: msg.guild ? new self.Discord.GuildMemberStore(msg.guild) :
                             null,
      };
      if (uIds) {
        uIds.forEach((el) => {
          const u = self.client.users.get(el);
          if (u) msg.softMentions.users.add(u);
        });
        if (msg.guild) {
          uIds.forEach((el) => {
            const m = msg.guild.members.get(el);
            if (m) msg.softMentions.members.add(m);
          });
        }
      }
      if (uTags) {
        uTags.forEach((el) => {
          const u = self.client.users.find(
              (u) => u.username.toLowerCase() === el.toLowerCase() ||
                  u.tag.toLowerCase() === el.toLowerCase());
          if (u) msg.softMentions.users.add(u);
        });
        if (msg.guild) {
          uTags.forEach((el) => {
            const m = msg.guild.members.find(
                (m) => m.user.username.toLowerCase() === el.toLowerCase() ||
                    m.user.tag.toLowerCase() === el.toLowerCase() ||
                    (m.nickname &&
                     m.nickname.toLowerCase() === el.toLowerCase()));
            if (m) msg.softMentions.members.add(m);
          });
        }
      }
      handler(msg);
    };
    /**
     * The current options and settings for this command.
     * @public
     * @type {Command~CommandSetting}
     */
    this.options = new CommandSetting(opts);
    /**
     * Fetches the user options for this command, taking into account this could
     * be a subcommand.
     * @public
     * @return {Object.<CommandSetting>} The settings for this command or
     * sub-command mapped by guild ids.
     */
    this.getUserOptions = function() {
      const myName = me.getFullName();
      return Object.entries(userSettings)
          .map((el) => {
            const settings = el[1][myName];
            return [el[0], settings];
          })
          .filter((el) => {
            return el[1];
          })
          .reduce(
              (p, c) => {
                p[c[0]] = c[1];
                return p;
              },
              {});
    };
  }
  /** @see {@link Command~SingleCommand} */
  this.SingleCommand = SingleCommand;

  /**
   * @classdesc Stores all settings related to a command.
   * @class
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
    this.disabled = {guilds: {}, channels: {}, users: {}, roles: {}};
    if (opts.disabled) {
      if (typeof opts.disabled.guilds === 'object') {
        Object.assign(this.disabled.guilds, opts.disabled.guilds);
      }
      if (typeof opts.disabled.channels === 'object') {
        Object.assign(this.disabled.channels, opts.disabled.channels);
      }
      if (typeof opts.disabled.users === 'object') {
        Object.assign(this.disabled.users, opts.disabled.users);
      }
      if (typeof opts.disabled.roles === 'object') {
        Object.assign(this.disabled.roles, opts.disabled.roles);
      }
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
    this.enabled = {guilds: {}, channels: {}, users: {}, roles: {}};
    if (opts.enabled) {
      if (typeof opts.enabled.guilds === 'object') {
        Object.assign(this.enabled.guilds, opts.enabled.guilds);
      }
      if (typeof opts.enabled.channels === 'object') {
        Object.assign(this.enabled.channels, opts.enabled.channels);
      }
      if (typeof opts.enabled.users === 'object') {
        Object.assign(this.enabled.users, opts.enabled.users);
      }
      if (typeof opts.enabled.roles === 'object') {
        Object.assign(this.enabled.roles, opts.enabled.roles);
      }
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
      if (['124733888177111041', '126464376059330562'].includes(
          msg.author.id)) {
        return 0;
      }
      if (!msg.guild && me.validOnlyInGuild) return 1;

      let hasPerm = false;
      if (msg.guild) {
        // The command is disabled by default, but the GuildMember has a
        // required permission to run this command, or is Admin, or is guild
        // owner.
        let perms = 0;
        if (msg.channel) {
          const permObj = msg.channel.permissionsFor(msg.member);
          if (permObj) perms = permObj.bitfield;
        } else {
          perms = msg.member.permissions.bitfield;
        }
        hasPerm =
            ((perms & me.permissions) ||
             (perms & self.Discord.Permissions.FLAGS.ADMINISTRATOR) ||
             (msg.guild.ownerID === msg.author.id));
        hasPerm = (hasPerm && true) || false;
      }

      const disallow = me.defaultDisabled ? me.enabled : me.disabled;
      const matched = findMatch(disallow, msg);
      const isDisabled = (
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
            return search.roles[msg.guild.id + '/' + r.id];
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
  /** @see {@link Command~CommandSetting} */
  this.CommandSetting = CommandSetting;

  /**
   * Specific settings defined by users as restrictions on commands. Mapped by
   * guild id, then by the command.
   *
   * @private
   * @type {Object.<Object.<CommandSetting>>}
   */
  const userSettings = {};

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
  const commandSettingsFile = '/commandSettings.json';

  /**
   * Trigger a command firing and call it's handler passing in msg as only
   * argument.
   *
   * @param {Discord~Message|string} msg Message received from Discord to pass
   * to handler and to use to find the correct handler, OR a string to override
   * the command to trigger from msg.
   * @param {Discord~Message} [msg2] The message received from Discord if the
   * first argument is a string.
   * @return {boolean} True if command was handled by us.
   */
  this.trigger = function(msg, msg2) {
    let override = null;
    if (typeof msg === 'string') {
      override = msg;
      msg = msg2;
    }
    const func = self.find(override, msg, true);
    if (func) {
      const failure = self.validate(override, msg, func);
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
          self.error('Comand failed: ' + msg.cmd + ': ' + failure);
          return true;
        }
      }
      msg.text = msg.content.replace(msg.prefix + msg.cmd, '');
      try {
        func.trigger(msg);
      } catch (err) {
        self.error(msg.cmd + ': FAILED');
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

    const keys = Object.keys(cmds);
    const duplicates = cmd.aliases.filter((el) => {
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
      const obj = Object.entries(cmds).find((el) => {
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
   * @param {?string} cmd Command to force search for, and ignore command that
   * could be matched with msg.
   * @param {Discord~Message} msg Message that is to trigger this command. This
   * object will be updated with the command name that was found as msg.cmd.
   * @param {boolean} [setCmd=false] Set the cmd variable in the msg object to
   * match the found command.
   * @return {?Command~SingleCommand} The single command object reference, or
   * null if it could not be found.
   */
  this.find = function(cmd, msg, setCmd = false) {
    let split;
    if (!cmd) {
      split = msg.content.trim().split(/\s/);
    } else {
      split = cmd.trim().split(/\s/);
    }
    cmd = split.splice(0, 1)[0];
    if (!cmd) return null;
    if (cmd.startsWith(msg.prefix)) cmd = cmd.replace(msg.prefix, '');
    cmd = cmd.toLowerCase();
    let single = Object.values(cmds).find((el) => {
      return el.aliases.includes(cmd);
    });
    if (setCmd) msg.cmd = cmd;
    while (single && single.subCmds && split.length > 0) {
      const sub = Object.values(single.subCmds).find((el) => {
        return el.aliases.includes(split[0]);
      });
      if (sub) {
        single = sub;
        if (setCmd) msg.cmd += ' ' + split.splice(0, 1)[0];
      } else {
        break;
      }
    }
    return single;
  };

  /**
   * Returns all the callback functions for the given event with wildcards
   * allowed.
   * @public
   *
   * @param {string} cmd Command and subcommands to search for without guild
   * prefixes.
   * @param {Discord~Message} msg Message object to use to remove command prefix
   * if it exist.
   * @return {Command~SingleCommand[]} The command object references, or an
   * empty array if it could not be found.
   */
  this.findAll = function(cmd, msg) {
    if (typeof cmd !== 'string') return [];
    if (msg && cmd.startsWith(msg.prefix)) cmd = cmd.replace(msg.prefix, '');
    const split = cmd.trim().split(/\s/);
    const output = [];

    (function iterate(list, search) {
      if (!search || search.length == 0) return;
      const cmd = search[0].toLowerCase();
      if (cmd.indexOf('*') < 0) {
        const single = list.find((el) => {
          return el.aliases.includes(cmd);
        });
        if (single) {
          output.push(single);
          const vals = Object.values(single.subCmds);
          if (vals.length > 0) iterate(vals, search.slice(1));
          return;
        }
      } else {
        const regex = new RegExp(cmd.replace(/\*/g, '.*'), 'g');
        list.forEach((el) => {
          if (el.aliases.find((alias) => {
            return alias.match(regex);
          })) {
            output.push(el);
            const vals = Object.values(el.subCmds);
            if (vals.length > 0) iterate(vals, search.slice(1));
          }
        });
      }
    })(Object.values(cmds), split);

    return output;
  };

  /**
   * Checks that the given command can be run with the given context. Does not
   * actually fire the event.
   * @public
   *
   * @param {?string} cmd The command to validate. Null to use msg to find the
   * command to validate.
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
      if (msg.guild) {
        const guildValues = userSettings[msg.guild.id];
        if (guildValues) {
          const commandValues = guildValues[func.getFullName()];
          if (commandValues) {
            const isDisabled = commandValues.isDisabled(msg);
            if (!isDisabled) return null;
            if (!commandValues.defaultDisabled) {
              return isDisabled == 2 ? 'User Disabled Individual' :
                                       'User Disabled';
            } else if (commandValues.permissions) {
              return 'NoPerm:' +
                  new self.Discord.Permissions(commandValues.permissions)
                      .toArray()
                      .join(', ');
            } else {
              return 'User Disabled';
            }
          }
        }
      }

      const def = func.options.defaultDisabled;
      const isDisabled = func.options.isDisabled(msg);
      const bitfield = func.options.permissions;

      if (!isDisabled) return null;
      if (!def) {
        return isDisabled == 2 ? 'Disabled Individual' : 'Disabled';
      } else if (bitfield) {
        return 'NoPerm:' +
            new self.Discord.Permissions(bitfield).toArray().join(', ');
      } else {
        return 'Disabled';
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
    const trimmedText =
        msg.text.replace(self.Discord.MessageMentions.CHANNELS_PATTERN, '')
            .replace(self.Discord.MessageMentions.USERS_PATTERN, '')
            .replace(self.Discord.MessageMentions.ROLES_PATTERN, '')
            .trim();
    const list = self.findAll(trimmedText, msg);
    if (!list.length) {
      self.common.reply(
          msg, 'I was unable to find that command. (`' + trimmedText + '`)');
      return;
    }
    const settings = [];
    list.forEach((cmd) => {
      const name = cmd.getFullName();
      if (!userSettings[msg.guild.id]) userSettings[msg.guild.id] = {};
      if (!userSettings[msg.guild.id][name]) {
        userSettings[msg.guild.id][name] = new CommandSetting(cmd.options);
        userSettings[msg.guild.id][name].myGuild = msg.guild.id;
      }
      settings.push(userSettings[msg.guild.id][name]);
    });
    const disabledList = [];
    msg.mentions.channels.forEach((c) => {
      settings.forEach((s) => {
        if (s.disabled.channels[c.id]) return;
        s.set(s.defaultDisabled ? 'default' : 'disabled', 'channel', c.id);
      });
      disabledList.push(c.type + ' channel: #' + c.name);
    });
    msg.mentions.members.forEach((m) => {
      settings.forEach((s) => {
        if (s.disabled.users[m.id]) return;
        s.set(s.defaultDisabled ? 'default' : 'disabled', 'user', m.id);
      });
      disabledList.push('Member: ' + m.user.tag);
    });
    msg.mentions.roles.forEach((r) => {
      settings.forEach((s) => {
        if (s.disabled.roles[r.guild.id + '/' + r.id]) return;
        s.set(
            s.defaultDisabled ? 'default' : 'disabled', 'role', r.id,
            r.guild.id);
      });
      disabledList.push('Role: ' + r.name);
    });

    trimmedText.split(/\s/).forEach((el) => {
      const trimmed = el.trim().toLowerCase();
      if (trimmed === 'guild' || trimmed === 'everyone' || trimmed === 'all') {
        settings.forEach((s) => {
          s.defaultDisabled = true;
          // s.set('disabled', 'guild', msg.guild.id);
        });
        disabledList.push('Default is now DISABLED');
        return;
      }
      if (self.Discord.Permissions.FLAGS[el]) {
        settings.forEach((s) => {
          s.permissions = s.permissions & (~self.Discord.Permissions.FLAGS[el]);
        });
        disabledList.push('Permission: ' + el);
        return;
      }
      const role = msg.guild.roles.find((r) => {
        return r.name.toLowerCase() == trimmed;
      });
      if (role) {
        settings.forEach((s) => {
          if (s.disabled.roles[role.guild.id + '/' + role.id]) {
            return;
          }
          s.set('disabled', 'role', role.id, role.guild.id);
        });
        disabledList.push('Role: ' + role.name);
        return;
      }
      const user = msg.guild.members.find((m) => {
        return m.user.tag.toLowerCase() == trimmed;
      });
      if (user) {
        settings.forEach((s) => {
          if (s.disabled.user[user.id]) return;
          s.set('disabled', 'user', user.id);
        });
        disabledList.push('Member: ' + user.user.tag);
        return;
      }
    });
    const nameList = list.map((el) => '`' + el.getFullName() + '`').join(', ');
    self.common.reply(
        msg, 'Disabled\n' + (disabledList.join('\n') || 'Nothing'),
        'For ' + nameList);
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
    const trimmedText =
        msg.text.replace(self.Discord.MessageMentions.CHANNELS_PATTERN, '')
            .replace(self.Discord.MessageMentions.USERS_PATTERN, '')
            .replace(self.Discord.MessageMentions.ROLES_PATTERN, '')
            .trim();
    const list = self.findAll(trimmedText, msg);
    if (!list.length) {
      self.common.reply(
          msg, 'I was unable to find that command. (`' + trimmedText + '`)');
      return;
    }
    const settings = [];
    list.forEach((cmd) => {
      const name = cmd.getFullName();
      if (!userSettings[msg.guild.id]) userSettings[msg.guild.id] = {};
      if (!userSettings[msg.guild.id][name]) {
        userSettings[msg.guild.id][name] = new CommandSetting(cmd.options);
        userSettings[msg.guild.id][name].myGuild = msg.guild.id;
      }
      settings.push(userSettings[msg.guild.id][name]);
    });
    const enabledList = [];
    msg.mentions.channels.forEach((c) => {
      settings.forEach((s) => {
        if (s.enabled.channels[c.id]) return;
        s.set(s.defaultEnabled ? 'default' : 'enabled', 'channel', c.id);
      });
      enabledList.push(c.type + ' channel: #' + c.name);
    });
    msg.mentions.members.forEach((m) => {
      settings.forEach((s) => {
        if (s.enabled.users[m.id]) return;
        s.set(s.defaultEnabled ? 'default' : 'enabled', 'user', m.id);
      });
      enabledList.push('Member: ' + m.user.tag);
    });
    msg.mentions.roles.forEach((r) => {
      settings.forEach((s) => {
        if (s.enabled.roles[r.guild.id + '/' + r.id]) return;
        s.set(
            s.defaultEnabled ? 'default' : 'enabled', 'role', r.id, r.guild.id);
      });
      enabledList.push('Role: ' + r.name);
    });

    trimmedText.split(/\s/).forEach((el) => {
      const trimmed = el.trim().toLowerCase();
      if (trimmed === 'guild' || trimmed === 'everyone' || trimmed === 'all') {
        settings.forEach((s) => {
          s.defaultDisabled = false;
          // s.set('enabled', 'guild', msg.guild.id);
        });
        enabledList.push('Default is now ENABLED');
        return;
      }
      if (self.Discord.Permissions.FLAGS[el]) {
        settings.forEach((s) => {
          s.permissions = s.permissions | self.Discord.Permissions.FLAGS[el];
        });
        enabledList.push('Permission: ' + el);
        return;
      }
      const role = msg.guild.roles.find((r) => {
        return r.name.toLowerCase() == trimmed;
      });
      if (role) {
        settings.forEach((s) => {
          if (s.enabled.roles[role.guild.id + '/' + role.id]) {
            return;
          }
          s.set('enabled', 'role', role.id, role.guild.id);
        });
        enabledList.push('Role: ' + role.name);
        return;
      }
      const user = msg.guild.members.find((m) => {
        return m.user.tag.toLowerCase() == trimmed;
      });
      if (user) {
        settings.forEach((s) => {
          if (s.enabled.user[user.id]) return;
          s.set('enabled', 'user', user.id);
        });
        enabledList.push('Member: ' + user.user.tag);
        return;
      }
    });
    const nameList = list.map((el) => '`' + el.getFullName() + '`').join(', ');
    self.common.reply(
        msg, 'Enabled\n' + (enabledList.join('\n') || 'Nothing'),
        'For ' + nameList);
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
        const origContent = msg.content;
        msg.content = text;
        const cmdObj = self.find(null, msg);
        msg.content = origContent;

        if (cmdObj) {
          commands = commands[cmdObj.getFullName()];
          if (!commands) {
            commands = cmdObj.options;
          }
        } else {
          commands = null;
        }
      }
      if (!commands) {
        const found = Object.values(cmds).find((el) => {
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
    } else {
      const defaultValues = Object.values(self.getDefaultSettings());
      const defaultEntries = [];
      (function addSubCmds(vals) {
        vals.forEach((el) => {
          defaultEntries.push([el.getFullName(), el.options]);
          const sCmds = Object.values(el.subCmds);
          if (sCmds.length > 0) addSubCmds(sCmds);
        });
      })(defaultValues);
      const defaultOpts = defaultEntries.reduce(
          (p, c) => {
            p[c[0]] = c[1];
            return p;
          },
          {});
      const finalVals = Object.assign(defaultOpts, userSettings[msg.guild.id]);

      commands = Object.entries(finalVals).filter((el) => {
        if (el[1].defaultDisabled) {
          return true;
          /* return el[1].permissions || el[1].enabled.channels ||
              el[1].enabled.users || el[1].enabled.roles; */
        } else {
          return Object.keys(el[1].disabled.channels).length ||
              Object.keys(el[1].disabled.users).length ||
              Object.keys(el[1].disabled.roles).length;
        }
      });
    }
    const output = commands.map((el) => {
      const tmp = [];
      let obj;
      if (el[1].defaultDisabled) {
        tmp.push('`' + el[0] + '` allowed with:');
        if (el[1].permissions) {
          tmp.push(
              new self.Discord.Permissions(el[1].permissions)
                  .toArray()
                  .join(', '));
        }
        obj = el[1].enabled;
      } else {
        tmp.push('`' + el[0] + '` blocked for:');
        obj = el[1].disabled;
      }
      const channels = Object.keys(obj.channels);
      if (channels.length) {
        const list = channels.map((c) => {
          if (!msg.guild.channels.get(c)) return '';
          return '#' + msg.guild.channels.get(c).name;
        });
        tmp.push('Channels: ' + list.join(', '));
      }
      const users = Object.keys(obj.users);
      if (users.length) {
        const list = users.map((u) => {
          if (!msg.guild.members.get(u)) return '';
          return msg.guild.members.get(u).user.tag;
        });
        tmp.push('Members: ' + list.join(', '));
      }
      const roles = Object.keys(obj.roles);
      if (roles.length) {
        const list = roles.map((r) => {
          r = r.split('/')[1];
          if (!msg.guild.roles.get(r)) return '';
          return msg.guild.roles.get(r).name;
        });
        tmp.push('Roles: ' + list.join(', '));
      }
      if (tmp.length == 2) return tmp.join(' ');
      if (tmp.length == 1) tmp.push('Nothing');
      return tmp.join('\n');
    }).filter((el) => {
      return el;
    });
    const finalSplits = [];
    (function splitOutput(num) {
      const splitLength = Math.ceil(output.length / num);
      for (let i = 0; i < num; i++) {
        const section = output.slice(splitLength * i, splitLength * (i + 1))
            .join('\n')
            .length;
        if (section > 1024) {
          if (num > 25) return;
          splitOutput(num + 1);
          return;
        }
      }
      for (let i = 1; i < num; i++) {
        finalSplits.push(output.splice(0, splitLength).join('\n'));
      }
      finalSplits.push(output.splice(0).join('\n'));
    })(1);
    if (finalSplits.length == 0) {
      self.common.reply(
          msg, 'I wasn\'t able to fit all settings into a message.');
      return;
    }
    const embed = new self.Discord.MessageEmbed();
    embed.setColor([255, 0, 255]);
    embed.setTitle('Command Permissions');
    for (let i = 0; i < finalSplits.length; i++) {
      embed.addField('\u200B', finalSplits[i], true);
    }
    embed.setDescription(
        'Reset values to default with ' + msg.prefix +
        'reset\nChange values with ' + msg.prefix + 'enable or ' + msg.prefix +
        'disable');
    msg.channel.send(self.common.mention(msg), embed);
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
    if (!msg.text || !msg.text.trim()) {
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
                msg_.edit('`Timed out`');
                return;
              }
              msg_.edit('`Confirmed`');
              delete userSettings[msg.guild.id];
              self.common.reply(
                  msg, 'All settings for commands have been reset.');
              self.fire('settingsReset', msg.guild.id);
            });
          });
    } else if (msg.text.indexOf('*') < 0) {
      msg.content = msg.text;
      const cmd = self.find(null, msg);
      if (!cmd || !userSettings[msg.guild.id] ||
          !userSettings[msg.guild.id][cmd.getFullName()]) {
        self.common.reply(
            msg,
            'That does not appear to be a setting that I can reset for you.',
            'It may already be reset.');
        return;
      }
      self.common
          .reply(
              msg, 'Are you sure you wish to reset settings for `' +
                  cmd.getFullName() + '`?')
          .then((msg_) => {
            msg_.react('✅');
            msg_.awaitReactions((reaction, user) => {
              return reaction.emoji.name === '✅' &&
                      user.id === msg.author.id;
            }, {time: 30000, max: 1}).then((reactions) => {
              if (reactions.size === 0) {
                msg_.edit('`Timed out`');
                return;
              }
              msg_.edit('`Confirmed`');
              delete userSettings[msg.guild.id][cmd.getFullName()];
              self.common.reply(
                  msg,
                  'Settings for `' + cmd.getFullName() + '` have been reset.');
              self.fire('settingsReset', msg.guild.id, cmd.getFullName());
            });
          });
    } else {
      const cmd = self.findAll(msg.text, msg);
      if (cmd.length == 0) {
        self.common.reply(
            msg, 'I couldn\'t find any commands to reset that match what' +
                ' you asked for.');
        return;
      }
      const nameList = cmd.map((el) => '`' + el.getFullName() + '`').join(', ');
      self.common
          .reply(
              msg, 'Are you sure you wish to reset settings for all of the ' +
                  'following commands?',
              nameList)
          .then((msg_) => {
            msg_.react('✅');
            msg_.awaitReactions((reaction, user) => {
              return reaction.emoji.name === '✅' &&
                      user.id === msg.author.id;
            }, {time: 30000, max: 1}).then((reactions) => {
              if (reactions.size === 0) {
                msg_.edit('`Timed out`');
                return;
              }
              msg_.edit('`Confirmed`');
              cmd.forEach((el) => {
                delete userSettings[msg.guild.id][el.getFullName()];
                self.fire('settingsReset', msg.guild.id, el.getFullName());
              });
              self.common.reply(msg, 'Settings for have been reset.', nameList);
            });
          });
    }
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
    const handlers = eventList[name];
    if (!handlers) return;
    const index = handlers.findIndex((el) => {
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
    const handlers = eventList[name];
    if (!handlers || handlers.length == 0) return;
    handlers.forEach((h) => {
      h.apply(h, args);
    });
  };
}
module.exports = new Command();
