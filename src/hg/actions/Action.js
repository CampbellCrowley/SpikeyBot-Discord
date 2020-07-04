// Copyright 2019-2020 Campbell Crowley. All rights reserved.
// Author: Campbell Crowley (dev@campbellcrowley.com)
const crypto = require('crypto');

/**
 * @description Handler function for a generic action.
 * @typedef HungryGames~Action~ActionHandler
 * @type {Function}
 *
 * @param {HungryGames} hg HG context.
 * @param {HungryGames~GuildGame} game Game context.
 */

/**
 * @description Base for actions to perform in response to certain things that
 * happen during a hunger games.
 *
 * @memberof HungryGames
 * @inner
 * @interface
 */
class Action {
  /**
   * @description Create action.
   * @param {HungryGames~Action~ActionHandler} handler Action handler override.
   * @param {number} [delay=0] Delay calling the handler by this many
   * milliseconds after triggered.
   */
  constructor(handler, delay = 0) {
    if (typeof handler !== 'function') {
      throw new TypeError('Handler is not a function.');
    }
    /**
     * @description The unique ID for this action. Probably globally unique,
     * definitely unique per-trigger in a guild.
     * @public
     * @type {string}
     */
    this.id = Action.createID();
    /**
     * @description Passed handler to fire once triggered.
     * @private
     * @type {HungryGames~Action~ActionHandler}
     * @constant
     */
    this._handler = handler;
    /**
     * @description Delay handler call by this many milliseconds after
     * triggered.
     * @public
     * @default 0
     * @type {number}
     */
    this.delay = delay || 0;
    /**
     * @description Data injected into save file that the `create` function uses
     * to restore data. Must be serializable.
     * @type {object}
     * @private
     * @default
     */
    this._saveData = {};
  }

  /**
   * @description Convert this object to serializable format for saving to file.
   * Injects data from `this._saveData`.
   * @public
   * @returns {{className: string, data: ?object}} Serializable object that can
   * be saved to file.
   */
  get serializable() {
    return {
      id: this.id,
      className: this.constructor.name,
      delay: this.delay,
      data: this._saveData,
    };
  }

  /**
   * @description Trigger the action to be performed.
   *
   * @type {HungryGames~Action~ActionHandler}
   * @public
   * @param {HungryGames} hg HG context.
   * @param {HungryGames~GuildGame} game Game context.
   * @param {...*} [args] Additional arguments to pass.
   */
  trigger(hg, game, ...args) {
    if (this.delay && !game.options.disableOutput) {
      hg._parent.client.setTimeout(
          () => this._handler(hg, game, ...args), this.delay);
    } else {
      this._handler(hg, game, ...args);
    }
  }

  /**
   * @description Create action from save data.
   * @public
   * @static
   * @abstract
   * @param {Discord~Client} client Bot client context to get object
   * references.
   * @param {string} id Guild ID this action is for.
   * @param {object} obj The parsed data from file.
   * @returns {HungryGames~Action} The created action.
   */
  static create(client, id, obj) {
    id;
    obj;
    client;
    throw new Error('Create function not overridden.');
  }

  /**
   * @description Generate an ID for an Action. Does not check for collisions.
   * @public
   * @static
   * @returns {string} Generated ID.
   */
  static createID() {
    return crypto.randomBytes(8).toString('hex').toUpperCase();
  }

  /**
   * @description Create an Action object from save data. Looks up action from
   * {@link HungryGames~Action~actionList}.
   * @public
   * @static
   * @param {Discord~Client} client Client reference for obtaining
   * discord object references.
   * @param {string} id The Guild ID this action is for.
   * @param {object} obj The object data from save file.
   * @returns {?Action} The created action, or null if failed to find the
   * action.
   */
  static from(client, id, obj) {
    if (typeof obj.className !== 'string' ||
        obj.className.length === 0) {
      console.error(obj.className, 'is not an Action name');
      return null;
    }
    const action = Action[obj.className];
    let out = null;
    if (action) {
      try {
        out = action.create(client, id, obj.data);
      } catch (err) {
        console.error(err);
      }
      if (!out) {
        console.error('Action.js: Unable to create', obj.className, id, obj);
        return null;
      }
      if (typeof obj.delay === 'number') {
        out.delay = obj.delay;
      }
      if (typeof obj.id === 'string') {
        out.id = obj.id;
      }
    } else {
      console.error(obj.className, 'is not an Action');
      return null;
    }
    return out;
  }
}

/**
 * @description List of available actions.
 * @public
 * @static
 * @type {Array.<{path: string, pickable: boolean}>}
 */
Action.actionList = [
  {path: './MemberAction.js'},
  {path: './ChannelAction.js'},
  {
    path: './GiveRoleAction.js',
    type: 'member',
    args: [{name: 'role', type: 'role'}],
  },
  {
    path: './TakeRoleAction.js',
    type: 'member',
    args: [{name: 'role', type: 'role'}],
  },
  {
    path: './SendMessageAction.js',
    type: 'channel',
    args: [{name: 'message', type: 'text'}],
  },
  {
    path: './RunCommandAction.js',
    type: 'channel',
    args: [{name: 'command', type: 'text'}, {name: 'author', type: 'member'}],
  },
  {path: './SendDayStartMessageAction.js', type: 'channel'},
  {path: './SendDayEndMessageAction.js', type: 'channel'},
  {path: './SendPlayerRankMessageAction.js', type: 'channel'},
  {path: './SendStatusListAction.js', type: 'channel'},
  {path: './SendTeamRankMessageAction.js', type: 'channel'},
  {path: './SendVictorAction.js', type: 'channel'},
  {path: './SendEventMessageAction.js', type: 'channel'},
  {path: './SendAutoplayingMessageAlertAction.js', type: 'channel'},
];

/**
 * @description Map of metadata for available triggers, to aid with UIs.
 * @public
 * @static
 * @type {object.<{
 *   order: number,
 *   types: string[],
 *   description: string
 * }>}
 */
Action.triggerMeta = {
  gameStart: {
    order: 10,
    types: ['member', 'channel'],
    description: 'Prior to game starting.',
  },
  dayStart: {
    order: 20,
    types: ['member', 'channel'],
    description: 'Prior to day starting.',
  },
  eventInstant: {
    order: 30,
    types: ['member', 'channel'],
    description: 'Moment the event occurs.',
  },
  eventPlayerDeath: {
    order: 31,
    types: ['member'],
    description: 'Players who died during the event.',
  },
  eventPlayerRevive: {
    order: 31,
    types: ['member'],
    description: 'Players who were revived during the event.',
  },
  eventPlayerWound: {
    order: 31,
    types: ['member'],
    description: 'Players who were wounded during the event.',
  },
  eventPlayerHealed: {
    order: 31,
    types: ['member'],
    description: 'Players who were healed during the event.',
  },
  eventPlayerKilled: {
    order: 31,
    types: ['member'],
    description: 'Players who killed another player during the event.',
  },
  eventPlayerGainWeapon: {
    order: 31,
    types: ['member'],
    description: 'Players who gained a weapon during the event.',
  },
  eventPlayerLoseWeapon: {
    order: 31,
    types: ['member'],
    description: 'Players who lost a weapon during the event.',
  },
  eventPlayerUseWeapon: {
    order: 31,
    types: ['member'],
    description: 'Players who used a weapon during the event, ' +
        'and neither gained nor lost consumables.',
  },
  eventPlayerUnAffected: {
    order: 31,
    types: ['member'],
    description: 'Players whose state did not change during the event, ' +
        'but took part in the event.',
  },
  eventPlayerAffected: {
    order: 31,
    types: ['member'],
    description: 'All players in the event.',
  },
  dayEnd: {
    order: 40,
    types: ['member', 'channel'],
    description: 'After the day has ended.',
  },
  dayPlayerDead: {
    order: 41,
    types: ['member'],
    description: 'After day has ended, for all players that are dead.',
  },
  dayPlayerAlive: {
    order: 41,
    types: ['member'],
    description: 'After day has ended, for all players that are alive.',
  },
  dayPlayerWounded: {
    order: 41,
    types: ['member'],
    description: 'After day has ended, for all players that are wounded.',
  },
  gameEnd: {
    order: 50,
    types: ['member', 'channel'],
    description: 'After game has ended.',
  },
  gameAbort: {
    order: 50,
    types: ['member', 'channel'],
    description: 'If game is ended early with command.',
  },
  gamePlayerDead: {
    order: 51,
    types: ['member', 'channel'],
    description: 'After game ended, for all players that are dead.',
  },
  gamePlayerAlive: {
    order: 51,
    types: ['member', 'channel'],
    description: 'After game ended, for all players that are alive.',
  },
  gamePlayerWounded: {
    order: 51,
    types: ['member', 'channel'],
    description: 'After game ended, for all players that are wounded.',
  },
  gamePlayerWin: {
    order: 52,
    types: ['member'],
    description: 'After game ended, for all players that won.',
  },
  gamePlayerLose: {
    order: 52,
    types: ['member'],
    description: 'After game ended, for all players that lost.',
  },
};

module.exports = Action;

Action.actionList.forEach(
    (el) => delete require.cache[require.resolve(el.path)]);
Action.actionList.forEach((el) => {
  try {
    const obj = require(el.path);
    Action[obj.name] = obj;
    el.name = obj.name;
  } catch (err) {
    console.error(err);
  }
});
