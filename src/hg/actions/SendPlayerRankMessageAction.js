// Copyright 2019 Campbell Crowley. All rights reserved.
// Author: Campbell Crowley (dev@campbellcrowley.com)
const ChannelAction = require('./ChannelAction.js');

/**
 * @description Sends message with player rankings.
 *
 * @memberof HungryGames~Action
 * @inner
 * @augments HungryGames~Action~ChannelAction
 */
class SendPlayerRankMessageAction extends ChannelAction {
  /**
   * @description Create an action that will send a message to the game channel
   * with the player rankings.
   */
  constructor() {
    super((hg, game, channel) => {
      const current = game.currentGame;
      const rankEmbed = new hg._parent.Discord.MessageEmbed();
      rankEmbed.setColor([255, 0, 255]);
      rankEmbed.setTitle('Final Ranks (kills)');
      const rankList =
          current.includedUsers.sort((a, b) => a.rank - b.rank).map((obj) => {
            let shortName;
            if (obj.nickname && game.options.useNicknames) {
              shortName = obj.nickname.substring(0, 16);
              if (shortName != obj.nickname) {
                shortName = `${shortName.substring(0, 13)}...`;
              }
            } else {
              shortName = obj.name.substring(0, 16);
              if (shortName != obj.name) {
                shortName = `${shortName.substring(0, 13)}...`;
              }
            }
            return obj.rank + ') ' + shortName +
                (obj.kills > 0 ? ' (' + obj.kills + ')' : '');
          });
      if (rankList.length <= 20) {
        rankEmbed.setDescription(rankList.join('\n'));
      } else {
        const thirdLength = Math.floor(rankList.length / 3);
        for (let i = 0; i < 2; i++) {
          const thisMessage =
              rankList.splice(0, thirdLength).join('\n').slice(0, 1024);
          rankEmbed.addField(i + 1, thisMessage, true);
        }
        rankEmbed.addField(3, rankList.join('\n').slice(0, 1024), true);
      }
      if (!game.options.disableOutput) {
        channel.send(rankEmbed).catch((err) => {
          hg._parent.error(`Failed to send ranks message: ${channel.id}`);
          console.error(err);
        });
      }
    });
  }
  /**
   * @description Create action from save data.
   * @public
   * @static
   * @override
   * @returns {HungryGames~SendPlayerRankMessageAction} The created action.
   */
  static create() {
    return new SendPlayerRankMessageAction();
  }
}

module.exports = SendPlayerRankMessageAction;
