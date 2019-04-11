// Copyright 2019 Campbell Crowley. All rights reserved.
// Author: Campbell Crowley (dev@campbellcrowley.com)
const Day = require('./Day.js');

/**
 * @classdesc The container with current game state within a guild's game.
 * @class HungryGames~Game
 *
 * @param {string} [name] The name of this game.
 * @param {HungryGames~Player[]} [includedUsers] Array of user players that are
 * included in this game.
 * @param {HungryGames~Team[]} [teams] Array of teams that players are on.
 */
function Game(name, includedUsers, teams) {
  /**
   * The name of this game.
   * @public
   * @type {string}
   * @default 'Hungry Games'
   */
  this.name = name || 'Hungry Games';
  /**
   * Is the game currently in progress.
   * @public
   * @type {boolean}
   * @default
   */
  this.inProgress = false;
  /**
   * Array of all users currently in the game.
   * @public
   * @type {HungryGames~Player[]}
   * @default
   */
  this.includedUsers = includedUsers || [];
  /**
   * All teams in the game.
   * @public
   * @type {HungryGames~Team[]}
   * @default []
   */
  this.teams = teams || [];
  /**
   * List of outcomes and players to force before the end of the day. Does not
   * affect the simulation, outcomes are forced by appending events at the end
   * of the simulated day.
   * @public
   * @type {HungryGames~ForcedOutcome[]}
   * @default
   */
  this.forcedOutcomes = [];
  /**
   * Has the game ended.
   * @public
   * @type {boolean}
   * @default
   */
  this.ended = false;
  /**
   * Information about the day that was simulated.
   * @public
   * @type {HungryGames~Day}
   * @default
   */
  this.day = new Day();
  /**
   * The number of players still alive in this game.
   * @public
   * @type {number}
   */
  this.numAlive = this.includedUsers.length;
}

module.exports = Game;
