// Copyright 2019 Campbell Crowley. All rights reserved.
// Author: Campbell Crowley (dev@campbellcrowley.com)

/**
 * @description A game weapon storing possible {@link HungryGames~Event}s.
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
   * @param {string} [name] The formattable name for this weapon.
   */
  constructor(outcomes, consumable, name) {
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
    /**
     * The formattable string for what to call this weapon.
     *
     * @public
     * @type {?string}
     */
    this.name = name || null;
  }
}

module.exports = WeaponEvent;
