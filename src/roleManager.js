// Copyright 2019 Campbell Crowley. All rights reserved.
// Author: Campbell Crowley (dev@campbellcrowley.com)

require('./subModule.js')(RoleManager);  // Extends the SubModule class.

/**
 * @classdesc Manges advanced role controls and features.
 * @class
 * @augments SubModule
 * @listens Discord#message
 * @listens Command#chat
 */
function RoleManager() {
  const self = this;
  /** @inheritdoc */
  this.myName = 'ChatBot';
  /** @inheritdoc */
  this.initialize = function() {
    self.command.on(
        new self.command.SingleCommand(
            ['role', 'roles'], commandRole, new self.command.CommandSetting({
              validOnlyInGuild: true,
              defaultDisabled: true,
              permissions: self.Discord.Permissions.FLAGS.MANAGE_ROLES |
                  self.Discord.Permissions.FLAGS.MANAGE_GUILD,
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
                permissions: self.Discord.Permissions.FLAGS.MANAGE_ROLES |
                    self.Discord.Permissions.FLAGS.MANAGE_GUILD,
              })),
          new self.command.SingleCommand(
              [
                'add',
                'give',
              ],
              commandRoleAdd, new self.command.CommandSetting({
                validOnlyInGuild: true,
                defaultDisabled: true,
                permissions: self.Discord.Permissions.FLAGS.MANAGE_ROLES |
                    self.Discord.Permissions.FLAGS.MANAGE_GUILD,
              })),
          new self.command.SingleCommand(
              [
                'remove',
                'delete',
                'take',
              ],
              commandRoleRemove, new self.command.CommandSetting({
                validOnlyInGuild: true,
                defaultDisabled: true,
                permissions: self.Discord.Permissions.FLAGS.MANAGE_ROLES |
                    self.Discord.Permissions.FLAGS.MANAGE_GUILD,
              })),
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
  };

  /**
   * Manage the basic fallback for the role command.
   * @TODO: Implement.
   *
   * @private
   * @type {commandHandler}
   * @param {Discord~Message} msg Message that triggered command.
   * @listens Command#role
   */
  function commandRole(msg) {

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

  }

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
}

module.exports = new RoleManager();
