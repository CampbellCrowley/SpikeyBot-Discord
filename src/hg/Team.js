// Copyright 2019 Campbell Crowley. All rights reserved.
// Author: Campbell Crowley (dev@campbellcrowley.com)

/**
 * @classdesc Serializable container for data about a team in a game.
 * @class HungryGames~Team
 *
 * @param {string|number} id The id unique to a guild for this team.
 * @param {string} name The name of this team.
 * @param {string[]} players Array of player ids on the team.
 * @property {string} id The unique id unique to a guild for this team.
 * @property {string} name The name of this team.
 * @property {string[]} players Array of player ids on the team.
 * @property {number} rank The current team rank.
 * @property {number} numAlive The number of players on the team still alive.
 */
function Team(id, name, players) {
  // The identifier for this team unique to the server.
  this.id = id;
  // The name of the team to show users.
  this.name = name.slice(0, 101);
  // The array of player ids on this team.
  this.players = players;
  // The final rank this team placed once the final member has died.
  this.rank = 1;
  // Number of players still alive on this team.
  this.numAlive = players.length;
}

module.exports = Team;
