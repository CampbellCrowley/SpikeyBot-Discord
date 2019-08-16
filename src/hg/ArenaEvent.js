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
     * Message sent at the start of the arena event.
     *
     * @public
     * @type {string}
     * @override
     */
    this.message = message;
    /**
     * All possible events in this arena event.
     *
     * @public
     * @type {HungryGames~NormalEvent[]}
     */
    this.outcomes = outcomes;
    /**
     * Outcome probabilities specific to this arena event. Overrides the global
     * arena event outcome probability settings. Null to use global settings.
     *
     * @public
     * @type {?HungryGames~OutcomeProbabilities}
     */
    this.outcomeProbs = outcomeProbs;
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
      return 'BAD_DATA';
    } else if (evt.outcomes) {
      if (evt.outcomes.find((el) => !HungryGames.NormalEvent.validate(el))) {
        return 'BAD_DATA';
      }
    }

    if (evt.outcomeProbs) {
      const keys = ['kill', 'wound', 'thrive', 'revive', 'nothing'];
      const fail = keys.find(
          (key) => evt.outcomeProbs[key] != null &&
              isNaN(evt.outcomeProbs[key] *= 1));
      if (fail) return 'BAD_DATA';
    }

    return null;
  }
}

module.exports = ArenaEvent;
