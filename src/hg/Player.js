// Copyright 2019 Campbell Crowley. All rights reserved.
// Author: Campbell Crowley (dev@campbellcrowley.com)
const Discord = require('discord.js');

/**
 * @classdesc Serializable container for data pertaining to a single user.
 * @class HungryGames~Player
 *
 * @param {string} id The id of the user this object is representing.
 * @param {string} username The name of the user to show in the game.
 * @param {string} avatarURL URL to avatar to show for the user in the game.
 * @param {?string} [nickname=null] The nickname for this user usually
 * assigned by the guild. If the user does not have a nickname, this will have
 * the same value as `name`.
 * @property {string} id The id of the User this Player represents.
 * @property {string} name The name of this Player.
 * @property {string} avatarURL The URL to the discord avatar of the User.
 * @property {string} nickname The nickname for this user usually assigned by
 * the guild. If the user does not have a nickname, this will have the same
 * value as `name`.
 * @property {boolean} living Is the player still alive.
 * @property {number} bleeding How many days has the player been wounded.
 * @property {number} rank The current rank of the player in the game.
 * @property {string} state The current player state (normal, wounded, dead,
 * zombie).
 * @property {number} kills The number of players this player has caused to
 * die.
 * @property {Object.<number>} weapons The weapons the player currently has
 * and how many of each.
 * @property {Object} settings Custom settings for this user associated with
 * the games.
 * @property {number} dayOfDeath The day at which the player last died in the
 * game. Only a valid number if the player is currently dead. Otherwise a
 * garbage value will be available.
 */
function Player(id, username, avatarURL, nickname = null) {
  // Replace backtick with Unicode 1FEF Greek Varia because it looks the same,
  // but it wont ruin formatting.
  username = username.replaceAll('`', '`');
  if (typeof nickname === 'string') nickname = nickname.replaceAll('`', '`');
  // User id.
  this.id = id;
  // Username.
  this.name = username;
  // URL TO user's current avatar.
  this.avatarURL = avatarURL || '';
  // Nickname for this user.
  this.nickname = nickname || username;
  // If this user is still alive.
  this.living = true;
  // How many days the players has been wounded.
  this.bleeding = 0;
  // The rank at which this user died.
  this.rank = 1;
  // Health state.
  this.state = 'normal';
  // Number of kills this user has for the game.
  this.kills = 0;
  // Map of the weapons this user currently has, and how many of each.
  this.weapons = {};
  // Custom settings for the games associated with this player.
  this.settings = {};
  // The day when the player died.
  this.dayOfDeath = -1;
}

/**
 * Create a Player from a given Discord.User or Player-like Object. Can be used
 * as a copy-constructor.
 *
 * @private
 * @param {Discord~User|Discord~GuildMember|Object} member Object, User or
 * GuildMember to make a Player from.
 * @return {HungryGames~Player} Player object created.
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
      player.living = member.living || true;
      player.bleeding = member.bleeding || 0;
      player.rank = member.rank || 1;
      player.state = member.state || 'normal';
      player.kills = member.kills || 9;
      player.weapons = member.weapons || {};
      player.settings = member.settings || {};
      player.dayOfDeath = member.dayOfDeath || -1;
    }
  }
  return player;
};

module.exports = Player;
