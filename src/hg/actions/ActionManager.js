// Copyright 2019 Campbell Crowley. All rights reserved.
// Author: Campbell Crowley (dev@campbellcrowley.com)
const Action = require('./Action.js');
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
   */
  static dayStart(hg, game) {
    ActionManager._triggerAll(hg, game, game.actions.dayStart);
  }
  /**
   * @description Call when a day has ended.
   * @public
   * @static
   * @param {HungryGames} hg HG context events are firing from.
   * @param {HungryGames~GuildGame} game Game context events are firing in.
   */
  static dayEnd(hg, game) {
    const list = game.actions.dayEnd;
    const alive = game.actions.dayPlayerAlive;
    const dead = game.actions.dayPlayerDead;
    const wounded = game.actions.dayPlayerWounded;
    ActionManager._endTrigger(hg, game, list, alive, dead, wounded);
  }
  /**
   * @description Call when day state is updated. This handles the start and end
   * events as well as all players affected.
   * @public
   * @static
   * @param {HungryGames} hg HG context events are firing from.
   * @param {HungryGames~GuildGame} game Game context events are firing in.
   */
  static stepped(hg, game) {
    hg;
    game;
  }
  /**
   * @description Call when game is started.
   * @public
   * @static
   * @param {HungryGames} hg HG context events are firing from.
   * @param {HungryGames~GuildGame} game Game context events are firing in.
   */
  static gameStart(hg, game) {
    ActionManager._triggerAll(hg, game, game.actions.gameStart);
  }
  /**
   * @description Call when game has ended.
   * @public
   * @static
   * @param {HungryGames} hg HG context events are firing from.
   * @param {HungryGames~GuildGame} game Game context events are firing in.
   */
  static gameEnd(hg, game) {
    const list = game.actions.gameEnd;
    const alive = game.actions.gamePlayerAlive;
    const dead = game.actions.gamePlayerDead;
    const wounded = game.actions.gamePlayerWounded;
    ActionManager._endTrigger(hg, game, list, alive, dead, wounded);
  }

  /**
   * @description Trigger all given actions.
   * @private
   * @static
   * @param {HungryGames} hg HG context events are firing from.
   * @param {HungryGames~GuildGame} game Game context events are firing in.
   * @param {HungryGames~Action[]} list List of events to fire all of.
   */
  static _triggerAll(hg, game, list) {
    const channel = hg._parent.client.channels.get(game.outputChannel);
    const guild = hg._parent.client.guilds.get(game.id);

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
      } else if (el instanceof Action) {
        el.trigger(hg, game);
      }
    });
  }

  /**
   * @description Trigger all actions for the end of something.
   * @private
   * @static
   * @param {HungryGames} hg HG context events are firing from.
   * @param {HungryGames~GuildGame} game Game context events are firing in.
   * @param {HungryGames~Action[]} list List of events to fire all of.
   * @param {HungryGames~MemberAction[]} alive List of events to fire for all
   * living players.
   * @param {HungryGames~MemberAction[]} dead List of events to fire for all
   * dead players.
   * @param {HungryGames~MemberAction[]} wounded List of events to fire for all
   * wounded players.
   */
  static _endTrigger(hg, game, list, alive, dead, wounded) {
    ActionManager._triggerAll(hg, game, list);
    const guild = hg._parent.client.guilds.get(game.id);

    game.includedUsers.forEach((player) => {
      if (player.isNPC) return;
      const member = guild.members.get(player.id);
      if (!member) return;

      if (!player.living) {
        dead.forEach((el) => el.trigger(hg, game, member));
      } else {
        alive.forEach((el) => el.trigger(hg, game, member));
        if (player.state === 'wounded') {
          wounded.forEach((el) => el.trigger(hg, game, member));
        }
      }
    });
  }
}

module.exports = ActionManager;
