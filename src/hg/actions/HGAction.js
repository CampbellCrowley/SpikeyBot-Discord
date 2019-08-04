// Copyright 2019 Campbell Crowley. All rights reserved.
// Author: Campbell Crowley (dev@campbellcrowley.com)

/**
 * @description Handler function for a generic action.
 * @typedef HungryGames~ActionHandler
 * @type Function
 *
 * @param {HungryGames} hg HG context.
 * @param {HungryGames~GuildGame} game Game context.
 */

/**
 * @description Base for actions to perform in response to certain things that
 * happen during a hunger games.
 *
 * @memberof HungryGames
 * @inner
 * @interface
 */
class HGAction {
  /**
   * @description Create action.
   * @param {HungryGames~ActionHandler} handler Action handler override.
   */
  constructor(handler) {
    if (typeof handler !== 'function') {
      throw new TypeError('Handler is not a function.');
    }
    this.trigger = handler;
  }

  /**
   * @description Trigger the action to be performed.
   *
   * @type {HungryGames~ActionHandler}
   * @public
   * @abstract
   * @param {HungryGames} hg HG context.
   * @param {HungryGames~GuildGame} game Game context.
   */
  trigger(hg, game) {
    hg;
    game;
    throw new Error('Trigger function not overridden.');
  }
}

module.exports = HGAction;
