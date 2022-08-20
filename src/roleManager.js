/* eslint-disable */
// Copyright 2018-2019 Campbell Crowley. All rights reserved.
// Author: Campbell Crowley (dev@campbellcrowley.com)
const fs = require('fs');
const mkdirp = require('mkdirp');

require('./subModule.js').extend(RoleManager);  // Extends the SubModule class.

/**
 * @classdesc Manages advanced role controls and features.
 * @class
 * @augments SubModule
 * @listens Discord#message
 * @listens Command#chat
 */
function RoleManager() {
  const self = this;
  /** @inheritdoc */
  this.myName = 'Role Manager';
  /** @inheritdoc */
  this.initialize = function() {
    cmdRoleAdd = new self.command.SingleCommand(
        ['add', 'give'], commandRoleAdd, new self.command.CommandSetting({
          validOnlyInGuild: true,
          defaultDisabled: true,
          permissions: self.Discord.PermissionsBitField.Flags.ManageRoles |
              self.Discord.PermissionsBitField.Flags.ManageGuild,
        }));
    cmdRoleRemove = new self.command.SingleCommand(
        ['remove', 'delete', 'take'], commandRoleRemove,
        new self.command.CommandSetting({
          validOnlyInGuild: true,
          defaultDisabled: true,
          permissions: self.Discord.PermissionsBitField.Flags.ManageRoles |
              self.Discord.PermissionsBitField.Flags.ManageGuild,
        }));
    self.command.on(
        new self.command.SingleCommand(
            ['role', 'roles'], commandRole, new self.command.CommandSetting({
              validOnlyInGuild: true,
              defaultDisabled: true,
              permissions: self.Discord.PermissionsBitField.Flags.ManageRoles |
                  self.Discord.PermissionsBitField.Flags.ManageGuild,
            })),
        [
          new self.command.SingleCommand(
              [
                'manage',
                'edit',
                'modify',
                'change',
                'config',
                'configure',
                'settings',
                'setting',
                'options',
                'option',
                'opt',
              ],
              commandRoleManage, new self.command.CommandSetting({
                validOnlyInGuild: true,
                defaultDisabled: true,
                permissions:
                    self.Discord.PermissionsBitField.Flags.ManageRoles |
                    self.Discord.PermissionsBitField.Flags.ManageGuild,
              })),
          cmdRoleAdd,
          cmdRoleRemove,
        ]);
  };

  /** @inheritdoc */
  this.shutdown = function() {
    self.command.deleteEvent('role');
  };
  /**
   * @override
   * @inheritdoc
   */
  this.save = function(opt) {
    Object.entries(guildPerms).forEach((el) => {
      const id = el[0];
      const data = el[1];
      const dir = self.common.guildSaveDir + id;
      const filename = dir + saveFile;
      const saveStartTime = Date.now();
      if (opt == 'async') {
        self.common.mkAndWrite(filename, dir, JSON.stringify(data), (err) => {
          if (err) {
            self.error(`Failed to save HG data for ${filename}`);
            console.error(err);
          } else if (el[1].accessTimestamp - saveStartTime < -15 * 60 * 1000) {
            delete guildPerms[id];
            self.debug(`Purged ${id}`);
          }
        });
      } else {
        self.common.mkAndWriteSync(filename, dir, JSON.stringify(data));
        if (el[1].accessTimestamp - Date.now() < -15 * 60 * 1000) {
          delete guildPerms[id];
          self.debug('Purged ' + id);
        }
      }
    });
  };

  /**
   * The SingleCommand storing permissions for adding roles.
   * @private
   *
   * @type {Command~SingleCommand}
   */
  let cmdRoleAdd;
  /**
   * The SingleCommand storing permissions for removing roles.
   * @private
   *
   * @type {Command~SingleCommand}
   */
  let cmdRoleRemove;

  /**
   * The roles that each user is allowed to give. Mapped by guild id, then user
   * id, then role id. Cached. Use {@link RoleManager~find} to access the data.
   * @private
   *
   * @type {Object.<Object.<Object.<boolean>>>}
   */
  const guildPerms = {};

  /**
   * The delay after failing to find a guild's data to look for it again.
   *
   * @private
   * @type {number}
   * @constant
   * @default 15 Seconds
   */
  const findDelay = 15000;

  /**
   * The file path to save current state for a specific guild relative to
   * Common~guildSaveDir.
   * @see {@link Common~guildSaveDir}
   *
   * @private
   * @type {string}
   * @constant
   * @default
   */
  const saveFile = '/rolePerms.json';

  /**
   * Manage the basic fallback for the role command.
   *
   * @private
   * @type {commandHandler}
   * @param {Discord~Message} msg Message that triggered command.
   * @listens Command#role
   */
  function commandRole(msg) {
    self.common.reply(
        msg, 'Please specify an action.', '(Ex: Add, remove, manage, etc.');
  }
  /**
   * Handle the user configuring permissions.
   * @TODO: Implement.
   *
   * @private
   * @type {commandHandler}
   * @param {Discord~Message} msg Message that triggered command.
   * @listens Command#roleManage
   */
  function commandRoleManage(msg) {
    let text = '';
    let roles = [];
    let users = [];
    if (!msg.text || msg.text.length == 0) {
      self.common.reply(
          msg,
          'Please specify a role or user to modify, and an action to perform.',
          '`' + msg.prefix + 'role manage @Trusted allow @Role1 @Role2`');
      return;
    }
    const giveActions = ['allow', 'grant', 'give', 'permit'];
    const takeActions = ['deny', 'revoke', 'take', 'remove'];
    const actions = giveActions.concat(takeActions);
    const gRoleRegex = self.Discord.MessageMentions.ROLES_PATTERN;
    const sRoleRegex = new RegExp(gRoleRegex.source);
    const gUserRegex = self.Discord.MessageMentions.USERS_PATTERN;
    const sUserRegex = new RegExp(gUserRegex.source);
    const sRegex = new RegExp(gRoleRegex.source + '|' + gUserRegex);
    const gRegex = new RegExp(gRoleRegex.source + '|' + gUserRegex, 'g');
    const cmdRegex = new RegExp(
        '(' + sRegex.source + ')\s*(' + actions.join('|') + ')\s*' +
        sRoleRegex.source);
    const cmdMatch = msg.text.match(cmdRegex);
    if (!cmdMatch) {
      self.common.reply(
          msg,
          'Please specify a role or user to modify, and an action to perform.',
          '`' + msg.prefix + 'role manage @Trusted allow @Role1 @Role2`');
      return;
    }
    roles = msg.text.match(gRoleRegex);
    users = msg.text.match(gUserRegex);
    text = msg.text.replace(self.Discord.MessageMentions.ROLES_PATTERN, '')
               .replace(/\s+/g, ' ');
    if (text) {
      text.split(/\s/).forEach((el) => {
        const str = el.toLowerCase();
      });
    }
  }

  /**
   * Give a guild member a role.
   * @public
   *
   * @param {string|number|Discord~Guild} guild Guild object, or ID.
   * @param {string|number|Discord~GuildMember} member Guild Member object, ID
   * or name (username, nickname or tag) to lookup.
   * @param {string|number|Discord~Role} role Guild Role object, ID or name to
   * lookup.
   * @return {?string} Null if success, string if error.
   */
  this.giveRole = function(guild, member, role) {

  };

  /**
   * Handle the user attempting to add a role.
   * @TODO: Implement.
   *
   * @private
   * @type {commandHandler}
   * @param {Discord~Message} msg Message that triggered command.
   * @listens Command#roleAdd
   */
  function commandRoleAdd(msg) {

  }
  /**
   * Handle the user attempting to remove a role.
   * @TODO: Implement.
   *
   * @private
   * @type {commandHandler}
   * @param {Discord~Message} msg Message that triggered command.
   * @listens Command#roleRemove
   */
  function commandRoleRemove(msg) {

  }

  /**
   * Returns a guild's data. Returns cached version if that exists, or searches
   * the file system for saved data. Data will only be checked from disk at most
   * once every `RoleManager~findDelay` milliseconds. Returns `null` if data
   * could not be found, or an error occurred.
   *
   * @private
   * @param {number|string} id The guild id to get the data for.
   * @return {?Object} The role data, or null if no data could be loaded.
   */
  function find(id) {
    if (guildPerms[id]) return guildPerms[id];
    if (Date.now() - guildPerms[id].accessTimestamp < findDelay) return null;
    guildPerms[id].accessTimestamp = Date.now();
    try {
      const tmp = fs.readFileSync(self.common.guildSaveDir + id + saveFile);
      try {
        guildPerms[id] = JSON.parse(tmp);
        if (self.initialized) self.debug('Loaded roles from file ' + id);
      } catch (e2) {
        self.error('Failed to parse roles data for guild ' + id);
        return null;
      }
    } catch (e) {
      if (e.code !== 'ENOENT') {
        self.debug('Failed to load role data for guild:' + id);
        console.error(e);
      }
      return null;
    }
    return guildPerms[id];
  }
}

module.exports = new RoleManager();
