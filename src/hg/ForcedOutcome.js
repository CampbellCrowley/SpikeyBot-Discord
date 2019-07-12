// Copyright 2019 Campbell Crowley. All rights reserved.
// Author: Campbell Crowley (dev@campbellcrowley.com)

/**
 * @description An outcome for one or more players in a game.
 * @memberof HungryGames
 * @inner
 */
class ForcedOutcome {
  /**
   * @description Create a single forced outcome.
   * @param {string} id The guild ID in which the users will be affected.
   * @param {string[]} list The array of player IDs of which to affect.
   * @param {string} state The outcome to force the players to have been
   * victims of by the end of the simulated day. ("living", "dead", "wounded",
   * or "thriving").
   * @param {string} text Message to show when the user is affected.
   * @param {boolean} [persists=false] Does this outcome persist to the end of
   * the game, if false it only exists for the next day.
   */
  constructor(id, list, state, text, persists = false) {
    if (typeof id === 'object') {
      persists = id.persists;
      text = id.text;
      state = id.state;
      list = id.list;
      id = id.id;
    }
    /**
     * The guild ID of which the users will be affected.
     *
     * @public
     * @type {string}
     */
    this.id = id;
    /**
     * The array of player IDs of which this concerns.
     *
     * @public
     * @type {string[]}
     */
    this.list = list;
    /**
     * The state to force the players to be in.
     *
     * @public
     * @type {string}
     */
    this.state = state;
    /**
     * Message to show when the user is affected.
     *
     * @public
     * @type {string}
     */
    this.text = text;
    /**
     * Does this outcome persist to the end of the game. False to only exist for
     * a
     * single day.
     *
     * @public
     * @type {boolean}
     * @default false
     */
    this.persists = persists;
  }
}

module.exports = ForcedOutcome;
