// Copyright 2019 Campbell Crowley. All rights reserved.
// Author: Campbell Crowley (dev@campbellcrowley.com)

/**
 * @description Serializable container for data about a team in a game.
 * @memberof HungryGames
 * @inner
 */
class Team {
  /**
   * @description Create a team for a game.
   * @param {string|number} id The id unique to a guild for this team.
   * @param {string} name The name of this team.
   * @param {string[]} players Array of player ids on the team.
   */
  constructor(id, name, players) {
    /**
     * The unique id unique to a guild for this team.
     * @type {string}
     * @public
     */
    this.id = id;
    /**
     * The name of this team. Truncates to 100 characters.
     * @type {string}
     * @pubilic
     */
    this.name = name.slice(0, 101);
    /**
     * Array of player ids on the team.
     * @type {string[]}
     * @public
     */
    this.players = players;
    /**
     * The current team rank.
     * @type {number}
     * @public
     * @default
     */
    this.rank = 1;
    /**
     * The number of players on the team still alive.
     * @type {number}
     * @public
     * @default players.length
     */
    this.numAlive = players.length;
  }
}

module.exports = Team;
