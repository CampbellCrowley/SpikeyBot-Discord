// Copyright 2019 Campbell Crowley. All rights reserved.
// Author: Campbell Crowley (dev@campbellcrowley.com)
const DayStartAction = require('./DayStartAction.js');
/**
 * @description Manages game action firing and listeners.
 *
 * @memberof HungryGames
 * @inner
 */
class ActionStore {
  /**
   * @description Create action.
   * @param {HungryGames~GuildGame} ctx Game context actions will be performed
   * in.
   */
  constructor(ctx) {
    /**
     * @description Game context actions will be performed in.
     * @private
     * @type {HungryGames~GuildGame}
     * @constant
     */
    this._ctx = ctx;
    /**
     * @description Fired prior to the event message being sent.
     * @private
     * @type {HGAction[]}
     * @default
     */
    this._eventStart = [];
    /**
     * @description Fired after the event message being sent.
     * @private
     * @type {HGAction[]}
     * @default
     */
    this._eventEnd = [];
    /**
     * @description Fired during the event if players get killed.
     * @private
     * @type {HGAction[]}
     * @default
     */
    this._eventPlayerDeath = [];
    /**
     * @description Fired during the event if players get revived.
     * @private
     * @type {HGAction[]}
     * @default
     */
    this._eventPlayerRevive = [];
    /**
     * @description Fired during the event if players get wounded.
     * @private
     * @type {HGAction[]}
     * @default
     */
    this._eventPlayerWound = [];
    /**
     * @description Fired during the event if players kill another player.
     * @private
     * @type {HGAction[]}
     * @default
     */
    this._eventPlayerKilled = [];
    /**
     * @description Fired during the event if players gain weapons.
     * @private
     * @type {HGAction[]}
     * @default
     */
    this._eventPlayerGainWeapon = [];
    /**
     * @description Fired during the event if players lose weapons.
     * @private
     * @type {HGAction[]}
     * @default
     */
    this._eventPlayerLoseWeapon = [];
    /**
     * @description Fired during the event if players use their weapon.
     * @private
     * @type {HGAction[]}
     * @default
     */
    this._eventPlayerUseWeapon = [];
    /**
     * @description Fired during the event if player state is not changed for a
     * player.
     * @private
     * @type {HGAction[]}
     * @default
     */
    this._eventPlayerUnAffected = [];
    /**
     * @description Fired during the event if for all players.
     * @private
     * @type {HGAction[]}
     * @default
     */
    this._eventPlayerAffected = [];
    /**
     * @description Fired prior to the day starting.
     * @private
     * @type {HGAction[]}
     * @default
     */
    this._dayStart = [
      new DayStartAction(),
    ];
    /**
     * @description Fired after a day has ended.
     * @private
     * @type {HGAction[]}
     * @default
     */
    this._dayEnd = [];
    /**
     * @description Fired for all players who end day alive.
     * @private
     * @type {HGAction[]}
     * @default
     */
    this._dayPlayerAlive = [];
    /**
     * @description Fired for all players who end day dead.
     * @private
     * @type {HGAction[]}
     * @default
     */
    this._dayPlayerDead = [];
    /**
     * @description Fired for all players who end day wounded.
     * @private
     * @type {HGAction[]}
     * @default
     */
    this._dayPlayerWounded = [];
    /**
     * @description Fired prior to the game starting.
     * @private
     * @type {HGAction[]}
     * @default
     */
    this._gameStart = [];
    /**
     * @description Fired after the game has ended.
     * @private
     * @type {HGAction[]}
     * @default
     */
    this._gameEnd = [];
    /**
     * @description Fired for all player who end the game alive.
     * @private
     * @type {HGAction[]}
     * @default
     */
    this._gamePlayerAlive = [];
    /**
     * @description Fired for all player who end the game dead.
     * @private
     * @type {HGAction[]}
     * @default
     */
    this._gamePlayerDead = [];
    /**
     * @description Fired for all player who end the game wounded.
     * @private
     * @type {HGAction[]}
     * @default
     */
    this._gamePlayerWounded = [];
  }
}

module.exports = ActionStore;
