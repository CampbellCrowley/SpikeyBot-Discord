// Copyright 2019 Campbell Crowley. All rights reserved.
// Author: Campbell Crowley (dev@campbellcrowley.com)
const MemberAction = require('./MemberAction.js');

/**
 * @description Give a role to a member.
 *
 * @memberof HungryGames
 * @inner
 * @augments HungryGames~MemberAction
 */
class GiveRoleAction extends MemberAction {
  /**
   * @description Create an action that will give a member a Discord role.
   * @param {external:Discord~Role} role The role to give.
   */
  constructor(role) {
    super((hg, game, member) => member.roles.add(role, 'HG Automation'));
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
   * @returns {HungryGames~GiveRoleAction} The created action.
   */
  static create(client, id, obj) {
    return new GiveRoleAction(client.guilds.get(id).roles.get(obj.role.id));
  }
}

module.exports = GiveRoleAction;
