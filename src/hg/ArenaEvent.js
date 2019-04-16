// Copyright 2019 Campbell Crowley. All rights reserved.
// Author: Campbell Crowley (dev@campbellcrowley.com)

/**
 * @description An Arena event storing Events.
 * @memberof HungryGames
 * @inner
 */
class ArenaEvent {
  /**
   * @param {string} message The message at the start of the arena event.
   * @param {HungryGames~Event[]} outcomes All possible events in this arena
   * event.
   * @param {?HungryGames~OutcomeProbabilities} outcomeProbs Overrides the
   * global setting for arena event outcome probabilities for this event.
   */
  constructor(message, outcomes, outcomeProbs) {
    /**
     * Message sent at the start of the arena event.
     * @public
     * @type {string}
     */
    this.message = message;
    /**
     * All possible events in this arena event.
     * @public
     * @type {HungryGames~Event[]}
     */
    this.outcomes = outcomes;
    /**
     * Outcome probabilities specific to this arena event. Overrides the global
     * arena event outcome probability settings. Null to use global settings.
     * @public
     * @type {?HungryGames~OutcomeProbabilities}
     */
    this.outcomeProbs = outcomeProbs;
  }
}

module.exports = ArenaEvent;
