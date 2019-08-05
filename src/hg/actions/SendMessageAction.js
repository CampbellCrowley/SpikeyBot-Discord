// Copyright 2019 Campbell Crowley. All rights reserved.
// Author: Campbell Crowley (dev@campbellcrowley.com)
const ChannelAction = require('./ChannelAction.js');

/**
 * @description Send a message in the game channel.
 *
 * @memberof HungryGames~Action
 * @inner
 * @augments HungryGames~Action~ChannelAction
 */
class SendMessageAction extends ChannelAction {
  /**
   * @description Create an action that will send a message to the game channel.
   * @param {string} msg The message to send.
   */
  constructor(msg) {
    super((hg, game, channel) => channel.send(msg));
    this._saveData = {msg: msg};
  }
  /**
   * @description Create action from save data.
   * @public
   * @static
   * @override
   * @param {external:Discord~Client} client Bot client context to get object
   * references.
   * @param {string} id Guild ID this action is for.
   * @param {object} obj The parsed data from file.
   * @returns {HungryGames~SendMessageAction} The created action.
   */
  static create(client, id, obj) {
    return new SendMessageAction(obj.msg);
  }
}

module.exports = SendMessageAction;
