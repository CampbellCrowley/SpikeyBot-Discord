// Copyright 2019-2020 Campbell Crowley. All rights reserved.
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
    super(
        (hg, game, channel) =>
          !game.options.disableOutput && channel.send(this._message));
    this._saveData = {message: msg};
    this._message = msg;
  }
  /**
   * @description Get the current message text.
   * @public
   * @returns {string} The current message text.
   */
  get message() {
    return this._message;
  }
  /**
   * @description Update the message with a new value.
   * @public
   * @param {string} msg The new message text.
   */
  set message(msg) {
    if (typeof msg !== 'string' || msg.length === 0) {
      throw new TypeError('Message must be a string!');
    }
    this._message = msg;
    this._saveData.message = msg;
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
    return new SendMessageAction(obj.message);
  }
}

module.exports = SendMessageAction;
