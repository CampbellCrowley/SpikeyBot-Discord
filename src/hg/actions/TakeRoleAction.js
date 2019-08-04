// Copyright 2019 Campbell Crowley. All rights reserved.
// Author: Campbell Crowley (dev@campbellcrowley.com)
const MemberAction = require('./MemberAction.js');

/**
 * @description Take a role from a member.
 *
 * @memberof HungryGames
 * @inner
 * @augments HungryGames~MemberAction
 */
class TakeRoleAction extends MemberAction {
  /**
   * @description Create an action that will remove a Discord role from a
   * member.
   * @param {external:Discord~Role} role The role to take.
   */
  constructor(role) {
    super((hg, game, member) => member.roles.remove(role, 'HG Automation'));
    this.serializable = {role: role.id};
  }
  /**
   * @description Create action from save data.
   * @public
   * @static
   * @param {external:Discord~Client} client Bot client context to get object
   * references.
   * @param {string} id Guild ID this action is for.
   * @param {object} obj The parsed data from file.
   * @returns {HungryGames~TakeRoleAction} The created action.
   */
  static create(client, id, obj) {
    return new TakeRoleAction(client.guilds.get(id).roles.get(obj.role.id));
  }
}

module.exports = TakeRoleAction;
