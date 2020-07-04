// Copyright 2019 Campbell Crowley. All rights reserved.
// Author: Campbell Crowley (dev@campbellcrowley.com)
const Action = require('./Action.js');

/**
 * @description Handler function for a action to be performed on a player.
 * @typedef HungryGames~MemberActionHandler
 * @type {Function}
 *
 * @param {HungryGames} hg HG context.
 * @param {HungryGames~GuildGame} game Game context.
 * @param {Discord~GuildMember} member Guild member the player
 * represents.
 */

/**
 * @description Action to perform on a single player.
 *
 * @memberof HungryGames
 * @inner
 * @augments HungryGames~Action
 */
class MemberAction extends Action {
  /**
   * @inheritdoc
   * @param {HungryGames~MemberActionHandler} handler Handler to override.
   * @param {number} [delay=0] Delay calling the handler by this many
   * milliseconds after triggered.
   */
  constructor(handler, delay) {
    super(handler, delay);
  }
}

module.exports = MemberAction;
