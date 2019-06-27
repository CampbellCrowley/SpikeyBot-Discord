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
   * @param {HungryGames~GuildGame} game Parent game.
   */
  constructor(game) {
    /**
     * @description Parent game to reference by default.
     * @public
     * @type {HungryGames~GuildGame}
     * @constant
     */
    this.game = game;
    this.parseDay = this.parseDay.bind(this);
  }
  /**
   * @description Update stats based on the current day data of the given game.
   * @public
   */
  parseDay() {
    const game = this.game;
    const current = game && game.currentGame;
    const events = current && current.day && current.day.events;
    if (!events || !Array.isArray(events)) {
      throw new Error('GuildGame does not have event data to parse.');
    } else if (events.length == 0) {
      return;
    }
    const lifetime = new StatGroup(game, 'global');
    const previous = new StatGroup(game, 'previous');
    const group = game.statGroup ? new StatGroup(game, game.statGroup) : null;

    if (current.day.num == 0) previous.reset();

    const inc = function(...args) {
      lifetime.increment(...args);
      previous.increment(...args);
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

  /**
   * @description Fetch a {@HungryGames~StatGroup} reference.
   * @public
   * @param {string} [id='global'] The ID of the group to fetch.
   * @param {Function} cb Callback with optional error argument, otherwise
   * second argument is the group reference.
   */
  fetchGroup(id = 'global', cb) {
    if (typeof cb !== 'function') {
      cb = id;
      if (typeof cb !== 'function') {
        throw new TypeError('Callback must be a function');
      }
      id = 'global';
    }
    if (typeof id !== 'string') {
      throw new TypeError('ID must be a string');
    }
    if (StatGroup.exists(this.game, id)) {
      cb(null, new StatGroup(this.game, id));
    } else {
      cb('Group doesn\'t exist');
    }
  }
}
module.exports = StatManager;
