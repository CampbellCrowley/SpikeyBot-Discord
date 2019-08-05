// Copyright 2019 Campbell Crowley. All rights reserved.
// Author: Campbell Crowley (dev@campbellcrowley.com)
/**
 * @description Manages game action firing and listeners.
 *
 * @memberof HungryGames
 * @inner
 */
class ActionStore {
  /**
   * @description Create action store.
   */
  constructor() {
    /**
     * @description Fired prior to the event message being sent.
     * @public
     * @type {HungryGames~Action[]}
     * @default
     */
    this.eventStart = [];
    /**
     * @description Fired after the event message being sent.
     * @public
     * @type {HungryGames~Action[]}
     * @default
     */
    this.eventEnd = [];
    /**
     * @description Fired during the event if players get killed.
     * @public
     * @type {HungryGames~Action[]}
     * @default
     */
    this.eventPlayerDeath = [];
    /**
     * @description Fired during the event if players get revived.
     * @public
     * @type {HungryGames~Action[]}
     * @default
     */
    this.eventPlayerRevive = [];
    /**
     * @description Fired during the event if players get wounded.
     * @public
     * @type {HungryGames~Action[]}
     * @default
     */
    this.eventPlayerWound = [];
    /**
     * @description Fired during the event if players kill another player.
     * @public
     * @type {HungryGames~Action[]}
     * @default
     */
    this.eventPlayerKilled = [];
    /**
     * @description Fired during the event if players gain weapons.
     * @public
     * @type {HungryGames~Action[]}
     * @default
     */
    this.eventPlayerGainWeapon = [];
    /**
     * @description Fired during the event if players lose weapons.
     * @public
     * @type {HungryGames~Action[]}
     * @default
     */
    this.eventPlayerLoseWeapon = [];
    /**
     * @description Fired during the event if players use their weapon.
     * @public
     * @type {HungryGames~Action[]}
     * @default
     */
    this.eventPlayerUseWeapon = [];
    /**
     * @description Fired during the event if player state is not changed for a
     * player.
     * @public
     * @type {HungryGames~Action[]}
     * @default
     */
    this.eventPlayerUnAffected = [];
    /**
     * @description Fired during the event if for all players.
     * @public
     * @type {HungryGames~Action[]}
     * @default
     */
    this.eventPlayerAffected = [];
    const DayStartAction = require('./DayStartAction.js');
    /**
     * @description Fired prior to the day starting.
     * @public
     * @type {HungryGames~Action[]}
     * @default
     */
    this.dayStart = [
      new DayStartAction(),
    ];
    /**
     * @description Fired after a day has ended.
     * @public
     * @type {HungryGames~Action[]}
     * @default
     */
    this.dayEnd = [];
    /**
     * @description Fired for all players who end day alive.
     * @public
     * @type {HungryGames~Action[]}
     * @default
     */
    this.dayPlayerAlive = [];
    /**
     * @description Fired for all players who end day dead.
     * @public
     * @type {HungryGames~Action[]}
     * @default
     */
    this.dayPlayerDead = [];
    /**
     * @description Fired for all players who end day wounded.
     * @public
     * @type {HungryGames~Action[]}
     * @default
     */
    this.dayPlayerWounded = [];
    /**
     * @description Fired prior to the game starting.
     * @public
     * @type {HungryGames~Action[]}
     * @default
     */
    this.gameStart = [];
    /**
     * @description Fired after the game has ended.
     * @public
     * @type {HungryGames~Action[]}
     * @default
     */
    this.gameEnd = [];
    /**
     * @description Fired for all player who end the game alive.
     * @public
     * @type {HungryGames~Action[]}
     * @default
     */
    this.gamePlayerAlive = [];
    /**
     * @description Fired for all player who end the game dead.
     * @public
     * @type {HungryGames~Action[]}
     * @default
     */
    this.gamePlayerDead = [];
    /**
     * @description Fired for all player who end the game wounded.
     * @public
     * @type {HungryGames~Action[]}
     * @default
     */
    this.gamePlayerWounded = [];
  }

  /**
   * @description Get a serializable version of this class instance. Strips all
   * private variables, and all functions. Assumes all public variables are
   * serializable if they aren't a function.
   * @public
   * @returns {object} Serializable version of this instance.
   */
  get serializable() {
    const all = Object.entries(Object.getOwnPropertyDescriptors(this));
    const output = {};
    for (const one of all) {
      if (typeof one[1].value === 'function' || one[0].startsWith('_')) {
        continue;
      } else if (one[1].value && one[1].value.serializable) {
        output[one[0]] = one[1].value.serializable;
      } else if (Array.isArray(one[1].value)) {
        output[one[0]] = [];
        for (const two in one[1].value) {
          if (!one[1].value[two]) continue;
          output[one[0]][two] = one[1].value[two].serializable;
        }
      } else {
        output[one[0]] = one[1].value;
      }
    }
    return output;
  }

  /**
   * @description Convert a serialized action store back into the object.
   * @public
   * @static
   * @param {object} obj Parsed data from save file.
   * @returns {HungryGames~ActionStore} Parsed object data.
   */
  static from(obj) {
    const Action = require('./Action.js');

    const out = new ActionStore();
    const all = Object.entries(Object.getOwnPropertyDescriptors(out));
    for (const one of all) {
      if (!Array.isArray(one[1].value)) continue;

      out[one[0]] = [];
      for (const two in obj[one[0]]) {
        if (!obj[one[0]][two]) continue;

        const toParse = obj[one[0]][two];
        if (typeof toParse.className !== 'string' ||
            toParse.className.length === 0) {
          console.error(toParse.className, 'is not an Action name');
          continue;
        }
        const action = Action[toParse.className];
        if (action) {
          out[one[0]][two] = Action[toParse.className].create(obj[one[0]][two]);
        } else {
          console.error(toParse.className, 'is not an Action');
        }
      }
    }
    return out;
  }
}

module.exports = ActionStore;
