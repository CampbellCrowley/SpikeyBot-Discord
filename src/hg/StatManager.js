// Copyright 2018-2019 Campbell Crowley. All rights reserved.
// Author: Campbell Crowley (dev@campbellcrowley.com)
const StatGroup = require('./StatGroup.js');

/**
 * @description Manages stats and leaderboard information for all of HG.
 * @memberof HungryGames
 * @inner
 */
class StatManager {
  /**
   * @description Constructor.
   */
  constructor() {
    this.parseDay = this.parseDay.bind(this);
  }
  /**
   * @description Update stats based on the current day data of the given game.
   * @public
   * @param {HungryGames~GuildGame} game The game of which to parse the current
   * day information.
   */
  parseDay(game) {
    const current = game && game.currentGame;
    const events = current && current.day && current.day.events;
    if (!events || !Array.isArray(events)) {
      throw new Error('GuildGame does not have event data to parse.');
    } else if (events.length == 0) {
      return;
    }
    const lifetime = new StatGroup(game, 'global');
    const group = game.statGroup ? new StatGroup(game, game.statGroup) : null;

    const inc = function(...args) {
      lifetime.increment(...args);
      if (group) group.increment(...args);
    };

    for (const e of events) {
      if (!e || !e.icons) continue;
      for (let i = 0; i < e.icons.length; i++) {
        const id = e.icons[i].id;
        if (!id) continue;
        const outcome = i < e.numVictim ? e.victim.outcome : e.attacker.outcome;
        switch (outcome) {
          case 'dies':
            inc(id, 'deaths');
            break;
          case 'wounded':
            inc(id, 'wounds');
            break;
          case 'thrives':
            inc(id, 'heals');
            break;
          case 'revived':
            inc(id, 'revives');
            break;
        }
      }
    }

    const aliveTeams = game.options.teamSize ?
        current.teams.filter((t) => t.numAlive > 0) :
        [];
    const collab = game.options.teammatesCollaborate == 'always' ||
        (game.options.teammatesCollaborate == 'untilend' &&
         aliveTeams.length > 1);
    const winners = (collab && aliveTeams.length == 1) ?
        aliveTeams[0].players :
        (current.numAlive == 1 ?
             [current.includedUsers.find((el) => el.living).id] :
             []);
    const ended = winners.length > 0 || current.numAlive == 0;

    for (const p of current.includedUsers) {
      const id = p.id;
      if (!id) continue;
      if (p.living) {
        inc(id, 'daysAlive');
        if (p.state === 'wounded') {
          inc(id, 'daysWounded');
        }
      } else {
        inc(id, 'daysDead');
      }
      if (ended) {
        inc(id, 'kills', p.kills);
        if (winners.includes(id)) {
          inc(id, 'wins');
        } else {
          inc(id, 'losses');
        }
      }
    }
  }
}
module.exports = StatManager;
