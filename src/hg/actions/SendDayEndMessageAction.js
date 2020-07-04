// Copyright 2019 Campbell Crowley. All rights reserved.
// Author: Campbell Crowley (dev@campbellcrowley.com)
const ChannelAction = require('./ChannelAction.js');

/**
 * @description Sends message announcing the end of the game.
 *
 * @memberof HungryGames~Action
 * @inner
 * @augments HungryGames~Action~ChannelAction
 */
class SendDayEndMessageAction extends ChannelAction {
  /**
   * @description Create an action that will send a message to the game channel
   * saying who won the game.
   * @todo Get locale properly for each game.
   */
  constructor() {
    super((hg, game, channel) => {
      const embed = new hg._parent.Discord.MessageEmbed();
      if (game.currentGame.day.num == 0) {
        embed.setTitle(hg.messages.get('bloodbathEnd'));
      } else {
        embed.setTitle(
            hg.messages.get('dayEnd')
                .replace(/\{day\}/g, game.currentGame.day.num)
                .replace(/\{alive\}/g, game.currentGame.numAlive));
      }
      embed.setColor([255, 0, 255]);
      if (!game.options.disableOutput) channel.send(embed);
    });
  }
  /**
   * @description Create action from save data.
   * @public
   * @static
   * @override
   * @returns {HungryGames~SendDayEndMessageAction} The created action.
   */
  static create() {
    return new SendDayEndMessageAction();
  }
}

module.exports = SendDayEndMessageAction;
