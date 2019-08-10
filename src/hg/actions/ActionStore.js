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
    const Action = require('./Action.js');
    /**
     * @description Fired as the event message being sent.
     * @public
     * @type {HungryGames~Action[]}
     * @default
     */
    this.eventInstant = [
      new Action.SendEventMessageAction(),
    ];
    /**
     * @description Fired during the event if players get killed.
     * @public
     * @type {HungryGames~MemberAction[]}
     * @default
     */
    this.eventPlayerDeath = [];
    /**
     * @description Fired during the event if players get revived.
     * @public
     * @type {HungryGames~MemberAction[]}
     * @default
     */
    this.eventPlayerRevive = [];
    /**
     * @description Fired during the event if players get wounded.
     * @public
     * @type {HungryGames~MemberAction[]}
     * @default
     */
    this.eventPlayerWound = [];
    /**
     * @description Fired during the event if players get healed.
     * @public
     * @type {HungryGames~MemberAction[]}
     * @default
     */
    this.eventPlayerHealed = [];
    /**
     * @description Fired during the event if players kill another player.
     * @public
     * @type {HungryGames~MemberAction[]}
     * @default
     */
    this.eventPlayerKilled = [];
    /**
     * @description Fired during the event if players gain weapons.
     * @public
     * @type {HungryGames~MemberAction[]}
     * @default
     */
    this.eventPlayerGainWeapon = [];
    /**
     * @description Fired during the event if players lose weapons.
     * @public
     * @type {HungryGames~MemberAction[]}
     * @default
     */
    this.eventPlayerLoseWeapon = [];
    /**
     * @description Fired during the event if players use their weapon.
     * @public
     * @type {HungryGames~MemberAction[]}
     * @default
     */
    this.eventPlayerUseWeapon = [];
    /**
     * @description Fired during the event if player state is not changed for a
     * player.
     * @public
     * @type {HungryGames~MemberAction[]}
     * @default
     */
    this.eventPlayerUnAffected = [];
    /**
     * @description Fired during the event for all players.
     * @public
     * @type {HungryGames~MemberAction[]}
     * @default
     */
    this.eventPlayerAffected = [];
    /**
     * @description Fired prior to the day starting.
     * @public
     * @type {HungryGames~Action[]}
     * @default
     */
    this.dayStart = [
      new Action.SendDayStartMessageAction(),
    ];
    /**
     * @description Fired after a day has ended. Does not fire if game has
     * ended.
     * @public
     * @type {HungryGames~Action[]}
     * @default
     */
    this.dayEnd = [
      new Action.SendDayEndMessageAction(),
      new Action.SendStatusListAction(),
      new Action.SendAutoplayingMessageAlertAction,
    ];
    /**
     * @description Fired for all players who end day alive.
     * @public
     * @type {HungryGames~MemberAction[]}
     * @default
     */
    this.dayPlayerAlive = [];
    /**
     * @description Fired for all players who end day dead.
     * @public
     * @type {HungryGames~MemberAction[]}
     * @default
     */
    this.dayPlayerDead = [];
    /**
     * @description Fired for all players who end day wounded.
     * @public
     * @type {HungryGames~MemberAction[]}
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
    this.gameEnd = [
      new Action.SendVictorAction(),
      new Action.SendPlayerRankMessageAction(),
      new Action.SendTeamRankMessageAction(),
    ];
    /**
     * @description Fired for all player who end the game alive.
     * @public
     * @type {HungryGames~MemberAction[]}
     * @default
     */
    this.gamePlayerAlive = [];
    /**
     * @description Fired for all player who end the game dead.
     * @public
     * @type {HungryGames~MemberAction[]}
     * @default
     */
    this.gamePlayerDead = [];
    /**
     * @description Fired for all player who end the game wounded.
     * @public
     * @type {HungryGames~MemberAction[]}
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
   * @description Insert an action for a trigger.
   * @public
   * @param {string} name The name of the trigger to insert the action.
   * @param {HungryGames~Action} action The action to insert.
   * @returns {boolean} True if success, false if unable to find trigger by
   * given name.
   */
  insert(name, action) {
    if (!Array.isArray(this[name])) return false;
    const Action = require('./Action.js');
    while (this[name].find((el) => el.id === action.id)) {
      action.id = Action.createID();
    }
    this[name].push(action);
    return true;
  }

  /**
   * @description Remove an action from a trigger.
   * @public
   * @param {string} name The name of the trigger to remove from.
   * @param {string} id The id of the action to remove.
   * @returns {?Action} The removed action, or null if unable to find action.
   */
  remove(name, id) {
    if (!Array.isArray(this[name])) return false;
    const index = this[name].findIndex((el) => el.id === id);
    if (index < 0) return false;
    return this[name].splice(index, 1);
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
        const action = Action.from(obj[one[0]][two]);
        if (!action) continue;
        out[one[0]][two] = action;
      }
    }
    return out;
  }
}

module.exports = ActionStore;
