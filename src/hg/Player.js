// Copyright 2019 Campbell Crowley. All rights reserved.
// Author: Campbell Crowley (dev@campbellcrowley.com)
const Discord = require('discord.js');

/**
 * @description Serializable container for data pertaining to a single user.
 * @memberof HungryGames
 * @inner
 */
class Player {
  /**
   * @description Create a player object for a game. Requires a unique ID and a
   * username.
   * @param {string} id The id of the user this object is representing.
   * @param {string} username The name of the user to show in the game.
   * @param {string} avatarURL URL to avatar to show for the user in the game.
   * @param {?string} [nickname=null] The nickname for this user usually
   * assigned by the guild. If the user does not have a nickname, this will have
   * the same value as `name`.
   */
  constructor(id, username, avatarURL = '', nickname = null) {
    // Replace backtick with Unicode 1FEF Greek Varia because it looks the same,
    // but it wont ruin formatting.
    username = username.replace(/`/g, '`');
    if (typeof nickname === 'string') nickname = nickname.replace(/`/g, '`');
    /**
     * The id of the User this Player represents.
     * @type {string}
     * @public
     */
    this.id = id;
    /**
     * The name of this Player.
     * @type {string}
     * @public
     */
    this.name = username;
    /**
     * The URL to the discord avatar of the User.
     * @type {string}
     * @public
     * @default ''
     */
    this.avatarURL = avatarURL || '';
    /**
     * The nickname for this user usually assigned by the guild. If the user
     * does
     * not have a nickname, this will have the same value as `name`.
     * @type {string}
     */
    this.nickname = nickname || username;
    /**
     * Is the player still alive.
     * @type {boolean}
     * @public
     * @default
     */
    this.living = true;
    /**
     * How many days has the player been wounded.
     * @type {number}
     * @public
     * @default
     */
    this.bleeding = 0;
    /**
     * The current rank of the player in the game.
     * @type {number}
     * @public
     * @default
     */
    this.rank = 1;
    /**
     * The current player state (normal, wounded, dead, zombie).
     * @type {string}
     * @public
     * @default
     */
    this.state = 'normal';
    /**
     * The number of players this player has caused to die.
     * @type {number}
     * @public
     * @default
     */
    this.kills = 0;
    /**
     * The weapons the player currently has and how many of each.
     * @type {Object.<number>}
     * @public
     * @default
     */
    this.weapons = {};
    /**
     * Custom settings for this user associated with the games.
     * @type {Object}
     * @public
     * @default
     */
    this.settings = {};
    /**
     * The day at which the player last died in the game. Only a valid number if
     * the player is currently dead. Otherwise a garbage value will be
     * available.
     * @type {number}
     * @public
     * @default
     */
    this.dayOfDeath = -1;
  }
}

/**
 * @description Create a Player from a given Discord.User or Player-like Object.
 * Can be used as a copy-constructor.
 *
 * @public
 * @static
 * @param {
 * Discord~User|Discord~GuildMember|Object
 * } member Object, User or GuildMember to make a Player from.
 * @returns {HungryGames~Player} Player object created.
 */
Player.from = function(member) {
  let player;
  if (typeof member === 'string') {
    player = new Player(member, member);
  } else {
    const isDiscord = (member instanceof Discord.GuildMember) ||
        (member instanceof Discord.User);
    const user = isDiscord ? member.user || member : member;
    const avatar =
        isDiscord ? user.displayAvatarURL({format: 'png'}) : user.avatarURL;
    const name = isDiscord ? user.username : member.name;
    player = new Player(user.id, name, avatar, member.nickname);
    if (!isDiscord) {
      if (typeof player.living === 'boolean' || player.living === 'true' ||
          player.living === 'false') {
        if (typeof player.living !== 'boolean') {
          player.living = player.living === 'true' ? true : false;
        }
        player.living = member.living;
      }
      player.bleeding = member.bleeding || 0;
      player.rank = member.rank || 1;
      player.state = member.state || 'normal';
      player.kills = member.kills || 0;
      player.weapons = member.weapons || {};
      player.settings = member.settings || {};
      if (!isNaN(member.dayOfDeath)) {
        player.dayOfDeath = member.dayOfDeath;
      }
    }
  }
  return player;
};

module.exports = Player;
