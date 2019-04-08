// Copyright 2019 Campbell Crowley. All rights reserved.
// Author: Campbell Crowley (dev@campbellcrowley.com)
const Game = require('./Game.js');

/**
 * @classdesc A single instance of a game in a guild.
 * @class HungryGames~GuildGame
 *
 * @param {Object.<number|boolean|string|Object>} options The game options.
 * @param {string} [name] Name of this game to be passed to the Game object.
 * @param {string[]|HungryGames~Player[]} [includedUsers] Array of user IDs that
 * will be included in the next game, or array of Players to include.
 * @param {string[]} [excludedUsers] Array of user IDs that have been
 * excluded from the games.
 * @param {HungryGames~NPC[]} [includedNPCs] Array of NPC objects to include in
 * the game.
 * @param {HungryGames~NPC[]} [excludedNPCs] Array of NPC objects to exclude
 * from the game.
 * @param {
 *   {
 *     bloodbath: HungryGames~Event[],
 *     player: HungryGames~Event[],
 *     weapon: Object.<HungryGames~WeaponEvent>,
 *     arena: HungryGames~ArenaEvent[]
 *   }
 * } [customEvents] All custom events for the guild.
 * @param {
 *   {
 *     bloodbath: HungryGames~Event[],
 *     player: HungryGames~Event[],
 *     weapon: Object.<Array.<HungryGames~Event>>,
 *     arena: Object.<Array.<HungryGames~Event>>
 *   }
 * } [disabledEvents] All disabled events for the guild.
 */
function GuildGame(
    options, name, includedUsers, excludedUsers, includedNPCs, excludedNPCs,
    customEvents, disabledEvents) {
  /**
   * Array of user IDs that will be included in the next game.
   * @public
   * @type {string[]}
   * @default []
   */
  this.includedUsers = [];
  if (Array.isArray(includedUsers)) {
    for (let i = 0; i < includedUsers.length; i++) {
      if (typeof includedUsers[i] === 'string') {
        this.includedUsers.push(includedUsers.splice(i, 1)[0]);
      } else {
        this.includedUsers.push(includedUsers[i].id);
      }
    }
  }
  /**
   * Array of user IDs that will be excluded from the next game.
   * @public
   * @type {string[]}
   * @default []
   */
  this.excludedUsers = excludedUsers || [];
  /**
   * Array of NPCs that will be included in the game.
   * @public
   * @type {HungryGames~NPC[]}
   * @default []
   */
  this.includedNPCs = includedNPCs || [];
  /**
   * Array of NPCs that will be excluded from the game.
   * @public
   * @type {HungryGames~NPC[]}
   * @default []
   */
  this.excludedNPCs = excludedNPCs || [];
  /**
   * Game options.
   * @public
   * @type {Object}
   */
  this.options = options;
  /**
   * Is this game autoplaying?
   * @public
   * @type {boolean}
   * @default false
   */
  this.autoPlay = false;
  /**
   * All custom events for the guild.
   * @public
   * @type {
   *   {
   *     bloodbath: HungryGames~Event[],
   *     player: HungryGames~Event[],
   *     weapon: Object.<HungryGames~WeaponEvent>,
   *     arena: HungryGames~ArenaEvent[]
   *   }
   * }
   * @default {{bloodbath: [], player: [], arena: [], weapon: {}}}
   */
  this.customEvents =
      customEvents || {bloodbath: [], player: [], arena: [], weapon: {}};
  /**
   * Current game information.
   * @public
   * @type {HungryGames~Game}
   * @default
   */
  this.currentGame = new Game(name, includedUsers);
  /**
   * Disabled event information. These events are not allowed to show up in the
   * game.
   * @public
   * @type {
   *   {
   *     bloodbath: HungryGames~Event[],
   *     player: HungryGames~Event[],
   *     weapon: Object.<Array.<HungryGames~Event>>,
   *     arena: Object.<Array.<HungryGames~Event>>
   *   }
   * }
   * @default {{bloodbath: [], player: [], arena: {}, weapon: {}}}
   */
  this.disabledEvents =
      disabledEvents || {bloodbath: [], player: [], arena: {}, weapon: {}};
}

module.exports = GuildGame;
