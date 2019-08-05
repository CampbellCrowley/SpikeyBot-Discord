// Copyright 2019 Campbell Crowley. All rights reserved.
// Author: Campbell Crowley (dev@campbellcrowley.com)
const ChannelAction = require('./ChannelAction.js');

/**
 * @description Sends day start message.
 *
 * @memberof HungryGames~Action
 * @inner
 * @augments HungryGames~Action~ChannelAction
 */
class SendDayStartMessageAction extends ChannelAction {
  /**
   * @description Create an action that will send a message to the game channel
   * saying the day has started.
   */
  constructor() {
    super((hg, game, channel) => {
      const embed = new hg._parent.Discord.MessageEmbed();
      if (game.currentGame.day.num === 0) {
        embed.setTitle(hg.messages.get('bloodbathStart'));
      } else {
        embed.setTitle(
            hg.messages.get('dayStart')
                .replace(/\{\}/g, game.currentGame.day.num));
      }
      if (!game.autoPlay && game.currentGame.day.num < 2) {
        const prefix = hg._parent.bot.getPrefix(game.id);
        embed.setFooter(
            'Tip: Use "' + prefix + hg._parent.postPrefix +
            'autoplay" to automate the games.');
      }
      embed.setColor([255, 0, 255]);
      if (!game || !game.options.disableOutput) {
        channel.send(embed).catch((err) => {
          if (err.message === 'Missing Permissions' ||
              err.message === 'Missing Access' ||
              err.message === 'Unknown Channel') {
            hg._parent.pauseGame(game.id);
          } else {
            console.error(err);
          }
        });
      }
    });
  }
  /**
   * @description Create action from save data.
   * @public
   * @static
   * @override
   * @returns {HungryGames~SendDayStartMessageAction} The created action.
   */
  static create() {
    return new SendDayStartMessageAction();
  }
}

module.exports = SendDayStartMessageAction;
