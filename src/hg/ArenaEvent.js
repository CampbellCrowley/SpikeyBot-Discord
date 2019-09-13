// Copyright 2019 Campbell Crowley. All rights reserved.
// Author: Campbell Crowley (dev@campbellcrowley.com)
const HungryGames = require('./HungryGames.js');

/**
 * @description An Arena event storing Events.
 * @memberof HungryGames
 * @inner
 * @augments HungryGames~Event
 */
class ArenaEvent extends HungryGames.Event {
  /**
   * @param {string} message The message at the start of the arena event.
   * @param {HungryGames~NormalEvent[]} outcomes All possible events in this
   * arena event.
   * @param {?HungryGames~OutcomeProbabilities} outcomeProbs Overrides the
   * global setting for arena event outcome probabilities for this event.
   */
  constructor(message, outcomes, outcomeProbs) {
    super(message);
    /**
     * All possible events in this arena event.
     *
     * @public
     * @type {HungryGames~NormalEvent[]}
     */
    this.outcomes = outcomes || [];
    /**
     * Outcome probabilities specific to this arena event. Overrides the global
     * arena event outcome probability settings. Null to use global settings.
     *
     * @public
     * @type {?HungryGames~OutcomeProbabilities}
     */
    this.outcomeProbs = outcomeProbs || null;
  }
  /**
   * @description Validate that the given data is properly typed and structured
   * to be converted to a ArenaEvent. Also coerces values to correct types if
   * possible.
   * @public
   * @static
   * @param {HungryGames~ArenaEvent} evt The event data to verify.
   * @returns {?string} Error string, or null if no error.
   */
  static validate(evt) {
    const err = HungryGames.Event.validate(evt);
    if (err) return err;

    if (evt.outcomes && !Array.isArray(evt.outcomes)) {
      return 'BAD_OUTCOMES';
    } else if (evt.outcomes) {
      let outerr;
      let index;
      evt.outcomes.find((el, i) => {
        outerr = HungryGames.NormalEvent.validate(el);
        index = i;
        return outerr;
      });
      if (outerr) {
        return `BAD_OUTCOME_${index}_${outerr}`;
      }
    }

    if (evt.outcomeProbs) {
      const keys = ['kill', 'wound', 'thrive', 'revive', 'nothing'];
      const fail = keys.find(
          (key) => evt.outcomeProbs[key] != null &&
              isNaN(evt.outcomeProbs[key] *= 1));
      if (fail) return 'BAD_OUTCOME_PROBS';
    }

    return null;
  }

  /**
   * @description Create a new ArenaEvent object from a ArenaEvent-like object.
   * Similar to copy-constructor.
   *
   * @public
   * @static
   * @param {object} obj Event-like object to copy.
   * @returns {HungryGames~ArenaEvent} Copy of event.
   */
  static from(obj) {
    const out =
        new ArenaEvent(obj.message, undefined, obj.outcomeProbs || null);

    out.fill(obj);
    if (Array.isArray(obj.outcomes)) {
      obj.outcomes.forEach(
          (el) => out.outcomes.push(HungryGames.NormalEvent.from(el)));
    }
    return out;
  }
}

module.exports = ArenaEvent;
