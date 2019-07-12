// Copyright 2019 Campbell Crowley. All rights reserved.
// Author: Campbell Crowley (dev@campbellcrowley.com)

/**
 * @description An Arena event storing Events.
 * @memberof HungryGames
 * @inner
 */
class WeaponEvent {
  /**
   * @description Create a basic weapon.
   * @param {HungryGames~Event[]} outcomes All possible events in this weapon
   * event.
   * @param {string} [consumable] The formattable string for what to call this
   * weapons consumable items.
   */
  constructor(outcomes, consumable) {
    /**
     * All possible events for this weapon event.
     *
     * @public
     * @type {HungryGames~Event[]}
     */
    this.outcomes = outcomes;
    /**
     * The formattable string for what to call this weapon's consumable items.
     *
     * @public
     * @type {?string}
     */
    this.consumable = consumable || null;
  }
}

module.exports = WeaponEvent;
