// Copyright 2019 Campbell Crowley. All rights reserved.
// Author: Campbell Crowley (dev@campbellcrowley.com)
const HGAction = require('./HGAction.js');
const ChannelAction = require('./ChannelAction.js');
const MemberAction = require('./MemberAction.js');

/**
 * @description Handles firing of actions from {@see HungryGames~ActionStore}.
 *
 * @memberof HungryGames
 * @inner
 */
class ActionManager {
  /**
   * @description Call when a day is started.
   * @public
   * @static
   * @param {HungryGames} hg HG context events are firing from.
   * @param {HungryGames~GuildGame} game Game context events are firing in.
   * @param {HungryGames~ActionStore} store The action store to fire actions
   * from.
   */
  static dayStart(hg, game, store) {
    const channel = hg._parent.client.channels.get(game.outputChannel);
    const guild = hg._parent.client.guilds.get(game.id);

    const list = store._dayStart;
    list.forEach((el) => {
      if (el instanceof MemberAction) {
        game.includedUsers.forEach((player) => {
          if (player.isNPC) return;
          const member = guild.members.get(player.id);
          if (!member) return;
          el.trigger(hg, game, member);
        });
      } else if (el instanceof ChannelAction) {
        el.trigger(hg, game, channel);
      } else if (el instanceof HGAction) {
        el.trigger(hg, game);
      }
    });
  }
  /**
   * @description Call when a day has ended.
   * @public
   * @static
   */
  static dayEnd() {

  }
  /**
   * @description Call when day state is updated. This handles the start and end
   * events as well as all players affected.
   * @public
   * @static
   */
  static stepped() {

  }
  /**
   * @description Call when game is started.
   * @public
   * @static
   */
  static gameStart() {

  }
  /**
   * @description Call when game has ended.
   * @public
   * @static
   */
  static gameEnd() {

  }
}

module.exports = ActionManager;
