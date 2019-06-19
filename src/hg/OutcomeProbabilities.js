// Copyright 2019 Campbell Crowley. All rights reserved.
// Author: Campbell Crowley (dev@campbellcrowley.com)

/**
 * @description Probabilities of each possible outcome from an Event. All
 * probabilities are relative to eachother. For example, if `revive` is 6, and
 * `nothing` is 60, then `nothing` is 10x more likey to be chosen than `revive`.
 * Similarly, if `revive` is 0.6 and `nothing` is 6, `nothing` is still 10x more
 * likely.
 * @memberof HungryGames
 * @inner
 */
class OutcomeProbabilities {
  /**
   * @description Create an object storing relative probabilities.
   * @param {number} [kill] Kill probability.
   * @param {number} [wound] Wound probability.
   * @param {number} [thrive] Thrive probability.
   * @param {number} [revive] Revive probability.
   * @param {number} [nothing] Probability of no outcome change.
   */
  constructor(kill, wound, thrive, revive, nothing) {
    /**
     * The probability of an event being chosen that kills players.
     * @public
     * @type {number}
     * @default
     */
    this.kill = kill || 22;
    /**
     * The probability of an event being chosen that wounds players.
     * @public
     * @type {number}
     * @default
     */
    this.wound = wound || 4;
    /**
     * The probability of an event being chosen that heals players.
     * @public
     * @type {number}
     * @default
     */
    this.thrive = thrive || 8;
    /**
     * The probability of an event being chosen that revives players.
     * @public
     * @type {number}
     * @default
     */
    this.revive = revive || 6;
    /**
     * The probability of an event being chosen that does not have any effect on
     * players.
     * @public
     * @type {number}
     * @default
     */
    this.nothing = nothing || 60;
  }
}
module.exports = OutcomeProbabilities;
