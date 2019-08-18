// Copyright 2019 Campbell Crowley. All rights reserved.
// Author: Campbell Crowley (dev@campbellcrowley.com)
const HungryGames = require('./HungryGames.js');

/**
 * @description A game weapon storing possible {@link HungryGames~NormalEvent}s.
 * @memberof HungryGames
 * @inner
 * @augments HungryGames~Event
 */
class WeaponEvent extends HungryGames.Event {
  /**
   * @description Create a basic weapon.
   * @param {HungryGames~NormalEvent[]} outcomes All possible events in this
   * weapon event.
   * @param {string} [consumable] The formattable string for what to call this
   * weapons consumable items.
   * @param {string} [name] The formattable name for this weapon.
   */
  constructor(outcomes, consumable, name) {
    super('Weapon Message');
    /**
     * All possible events for this weapon event.
     *
     * @public
     * @type {HungryGames~Event[]}
     */
    this.outcomes = outcomes || [];
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
     * @type {string}
     */
    this.name = name || '';
  }
  /**
   * @description Default action template.
   * @public
   * @static
   * @readonly
   * @type {string}
   * @constant
   * @default
   */
  static get action() {
    return '{attacker} {action} {victim} with {weapon}.';
  }
  /**
   * @description Validate that the given data is properly typed and structured
   * to be converted to a WeaponEvent. Also coerces values to correct types if
   * possible.
   * @public
   * @static
   * @param {HungryGames~WeaponEvent} evt The event data to verify.
   * @returns {?string} Error string, or null if no error.
   */
  static validate(evt) {
    const err = HungryGames.Event.validate(evt);
    if (err) return err;

    if (evt.outcomes && !Array.isArray(evt.outcomes)) {
      return 'BAD_OUTCOMES';
    } else if (evt.outcomes) {
      let outerr;
      evt.outcomes.find((el) => outerr = HungryGames.NormalEvent.validate(el));
      if (outerr) {
        return 'BAD_OUTCOME_' + outerr;
      }
    }

    if (evt.consumable &&
        (typeof evt.consumable !== 'string' || evt.consumable.length === 0 ||
         evt.consumable.length > 1000)) {
      return 'BAD_DATA';
    }

    if (typeof evt.name !== 'string' || evt.name.length === 0 ||
        evt.name.length > 1000) {
      return 'BAD_DATA';
    }

    return null;
  }

  /**
   * @description Create a new WeaponEvent object from a WeaponEvent-like
   * object. Similar to copy-constructor.
   *
   * @public
   * @static
   * @param {object} obj Event-like object to copy.
   * @returns {HungryGames~WeaponEvent} Copy of event.
   */
  static from(obj) {
    const out = new WeaponEvent(obj.outcomes, obj.consumable, obj.name || '');
    out.fill(obj);
    return out;
  }
}

module.exports = WeaponEvent;
