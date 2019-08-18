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
    ActionManager._triggerAll(hg, game, game.actions.eventInstant);

    const death = game.actions.eventPlayerDeath;
    const revive = game.actions.eventPlayerRevive;
    const wound = game.actions.eventPlayerWound;
    const heal = game.actions.eventPlayerHealed;
    const killed = game.actions.eventPlayerKilled;
    const gain = game.actions.eventPlayerGainWeapon;
    const lose = game.actions.eventPlayerLoseWeapon;
    const use = game.actions.eventPlayerUseWeapon;
    const none = game.actions.eventPlayerUnAffected;

    const day = game.currentGame.day;
    const guild = hg._parent.client.guilds.get(game.id);
    const evt = day.events[day.state];

    if (evt) {
      const go = function(member, group, weapons = {}) {
        game.actions.eventPlayerAffected.forEach(
            (el) => el.trigger(hg, game, member));
        let action = none;
        let unaffected = true;
        switch (group.outcome) {
          case 'dies':
            action = death;
            unaffected = false;
            break;
          case 'wounded':
            action = wound;
            unaffected = false;
            break;
          case 'thrives':
            action = heal;
            unaffected = false;
            break;
          case 'revived':
            action = revive;
            unaffected = false;
            break;
        }
        if (!unaffected) {
          action.forEach((el) => el.trigger(hg, game, member));
        }
        if (group.killer) {
          action = killed;
          unaffected = false;
          action.forEach((el) => el.trigger(hg, game, member));
        }

        if (weapons) {
          unaffected = false;
          let pos = false;
          let neg = false;
          let non = false;
          for (const w of Object.values(weapons)) {
            let act = null;
            if (w > 0 && !pos) {
              act = gain;
              pos = true;
            } else if (w < 0 && !neg) {
              act = lose;
              neg = true;
            } else if (w == 0 && !non) {
              act = use;
              non = true;
            }

            if (act) act.forEach((el) => el.trigger(hg, game, member));

            if (pos && neg && non) break;
          }
          unaffected = !pos && !neg && !non;
        }

        if (unaffected) action.forEach((el) => el.trigger(hg, game, member));
      };

      let sameConsumer = false;
      evt.icons.forEach((el) => {
        if (el.id.startsWith('NPC')) return;
        const member = guild.members.get(el.id);
        const group = el.settings.victim ? evt.victim : evt.attacker;
        const weapons = {};

        group.weapons.forEach((w) => weapons[w.name] = w.count);
        sameConsumer = sameConsumer || evt.consumer === el.id;
        if (el.settings.attacker && evt.consumer) {
          evt.consumes.forEach((w) => {
            if (!weapons[w.name]) weapons[w.name] = -w.count;
            weapons[w.name] -= w.count;
          });
        }

        if (!member) {
          guild.members.fetch(el.id)
              .then((mem) => go(mem, group, weapons))
              .catch((err) => {
                console.error('Unable to fetch member for action:', err);
              });
        } else {
          go(member, group, weapons);
        }
      });

      if (evt.consumer && !sameConsumer && !evt.consumer.startsWith('NPC')) {
        const weapons = {};
        const member = guild.members.get(evt.consumer);
        evt.consumes.forEach((el) => weapons[el.name] = -el.count);
        if (!member) {
          guild.members.fetch(evt.consumer)
              .then((mem) => go(mem, {outcome: 'nothing'}, weapons));
        } else {
          go(member, {outcome: 'nothing'}, weapons);
        }
      }
    }
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

    let winList = [];
    if (game.options.teamSize > 0 &&
        game.options.teammatesCollaborate === 'always') {
      const team = game.currentGame.teams.find((team) => team.numAlive > 0);
      if (team) winList = team.players;
    } else {
      const player = game.currentGame.includedUsers.find((el) => el.living);
      if (player) winList.push(player.id);
    }

    const win = game.actions.gamePlayerWin;
    const lose = game.actions.gamePlayerLose;

    const guild = hg._parent.client.guilds.get(game.id);
    game.currentGame.includedUsers.forEach((player) => {
      if (player.isNPC) return;
      const member = guild.members.get(player.id);
      if (!member) return;
      if (winList.includes(player.id)) {
        win.forEach((el) => el.trigger(hg, game, member));
      } else {
        lose.forEach((el) => el.trigger(hg, game, member));
      }
    });
  }

  /**
   * @description Call when game has been aborted.
   * @public
   * @static
   * @param {HungryGames} hg HG context events are firing from.
   * @param {HungryGames~GuildGame} game Game context events are firing in.
   */
  static gameAbort(hg, game) {
    ActionManager._triggerAll(hg, game, game.actions.gameAbort);
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
        game.currentGame.includedUsers.forEach((player) => {
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
