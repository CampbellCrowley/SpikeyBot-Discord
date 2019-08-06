// Copyright 2019 Campbell Crowley. All rights reserved.
// Author: Campbell Crowley (dev@campbellcrowley.com)

/**
 * @description Handler function for a generic action.
 * @typedef HungryGames~Action~ActionHandler
 * @type Function
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
     * @type {undefined|object}
     * @private
     * @default
     */
    this._saveData = undefined;
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
   * @param {external:Discord~Client} client Bot client context to get object
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
}

module.exports = Action;

/**
 * @description List of available actions.
 * @public
 * @static
 * @type {Array.<{path: string, pickable: boolean}>}
 */
Action.actionList = [
  {path: './MemberAction.js'},
  {path: './ChannelAction.js'},
  {path: './GiveRoleAction.js', pickable: true},
  {path: './TakeRoleAction.js', pickable: true},
  {path: './SendMessageAction.js', pickable: true},
  {path: './SendDayStartMessageAction.js', pickable: true},
  {path: './SendDayEndMessageAction.js', pickable: true},
  {path: './SendPlayerRankMessageAction.js', pickable: true},
  {path: './SendStatusListAction.js', pickable: true},
  {path: './SendTeamRankMessageAction.js', pickable: true},
  {path: './SendVictorAction.js', pickable: true},
  {path: './SendEventMessageAction.js', pickable: true},
  {path: './SendAutoplayingMessageAlertAction.js', pickable: true},
];

Action.actionList.forEach(
    (el) => delete require.cache[require.resolve(el.path)]);
Action.actionList.forEach((el) => {
  try {
    const obj = require(el.path);
    Action[obj.name] = obj;
  } catch (err) {
    console.error(err);
  }
});