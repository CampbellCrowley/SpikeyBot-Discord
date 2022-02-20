// Copyright 2019 Campbell Crowley. All rights reserved.
// Author: Campbell Crowley (dev@campbellcrowley.com)
const ChannelAction = require('./ChannelAction.js');

/**
 * @description Send a message in the game channel announcing that Autoplay is
 * enabled, then deletes the message after a little while.
 *
 * @memberof HungryGames~Action
 * @inner
 * @augments HungryGames~Action~ChannelAction
 */
class SendAutoplayingMessageAlertAction extends ChannelAction {
  /**
   * @description Create an action that will send a message to the game channel
   * announcing autoplay is enabled, then deletes the message later.
   */
  constructor() {
    super((hg, game, channel) => {
      if (!game.options.disableOutput && game.autoPlay) {
        channel.send({content: '`Autoplaying...`'})
            .then((msg) => {
              setTimeout(
                  () => msg.delete().catch(() => {}),
                  game.options.delayDays - this.delay + 50);
            })
            .catch(() => {});
      }
    }, 1200);
  }
  /**
   * @description Create action from save data.
   * @public
   * @static
   * @override
   * @returns {HungryGames~SendAutoplayingMessageAlertAction} The created
   * action.
   */
  static create() {
    return new SendAutoplayingMessageAlertAction();
  }
}

module.exports = SendAutoplayingMessageAlertAction;
