// Copyright 2019 Campbell Crowley. All rights reserved.
// Author: Campbell Crowley (dev@campbellcrowley.com)
const Day = require('./Day.js');
const Player = require('./Player.js');

/**
 * @classdesc The container with current game state within a guild's game.
 * @class HungryGames~Game
 *
 * @param {string} [name] The name of this game.
 * @param {HungryGames~Player[]} [includedUsers] Array of user players that are
 * included in this game.
 */
function Game(name, includedUsers) {
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
   * @default
   */
  this.teams = [];
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

/**
 * Create a new Game from an object. Similar to a copy constructor.
 * @public
 * @param {Object} data Game like object to copy.
 * @return {HungryGames~Game} Created Game object.
 */
Game.from = function(data) {
  const game = new Game(data.name, data.includedUsers);
  game.inProgress = data.inProgress || false;
  game.teams = data.teams || [];
  game.forcedOutcomes = data.forcedOutcomes || [];
  game.ended = data.ended || false;
  game.day = Day.from(data.day);
  game.includedUsers = game.includedUsers.map((el) => Player.from(el));
  game.numAlive = data.numAlive || game.includedUsers.length;
  return game;
};

module.exports = Game;
