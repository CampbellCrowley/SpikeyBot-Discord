// Copyright 2018-2019 Campbell Crowley. All rights reserved.
// Author: Campbell Crowley (dev@campbellcrowley.com)
const {Worker} = require('worker_threads');
const HungryGames = require('./HungryGames.js');

/**
 * Wrapper for logging functions that normally reference SubModule.error and
 * similar.
 *
 * @todo Obtain reference to SubModule to be able to remove this.
 * @private
 * @constant
 */
const self = {
  error: function(...args) {
    console.error(`ERR:${('00000' + process.pid).slice(-5)}`, ...args);
  },
};

/**
 * @description Manages HG day simulation.
 * @memberof HungryGames
 * @inner
 */
class Simulator {
  /**
   * @description Create a simulator instance.
   * @param {HungryGames~GuildGame} game The GuildGame to simulate.
   * @param {HungryGames} hg Parent game manager for logging and SubModule
   * references.
   * @param {Discord~Message} [msg] Message to reply to if necessary.
   */
  constructor(game, hg, msg) {
    this.setGame(game);
    this.setParent(hg);
    this.setMessage(msg);
  }
  /**
   * @description Change the GuildGame to simulate.
   *
   * @param {HungryGames~GuildGame} game The new GuildGame.
   */
  setGame(game) {
    this.game = game;
  }
  /**
   * @description Update the reference to the parent {@link HungryGames}.
   *
   * @param {HungryGames} hg New parent reference.
   */
  setParent(hg) {
    this.hg = hg;
  }
  /**
   * @description Update the message to reply to.
   *
   * @param {Discord~Message} msg New message to reference.
   */
  setMessage(msg) {
    this.msg = msg;
  }
  /**
   * @description Simulate a day with the current GuildGame.
   *
   * @param {Function} cb Callback that always fires on completion. The only
   * parameter is a possible error string, null if no error.
   */
  go(cb) {
    if (this.game.currentGame.day.state == 1) {
      this.hg._parent.error(
          'Unable to start simulating because simulation is already in ' +
          'progress.');
      return;
    }
    const data = {
      game: this.game.serializable,
      events: Object.assign(
          this.hg._defaultEventStore.serializable,
          {battles: this.hg._defaultBattles}),
      messages: this.hg.messages._messages,
    };
    this.game.currentGame.day.state = 1;
    const worker = new Worker(Simulator._workerPath, {workerData: data});
    worker.on('message', (msg) => {
      if (!msg) {
        cb();
        return;
      }
      if (msg.reply && this.msg) {
        this.hg._parent.common.reply(
            this.msg,
            msg.reply.replace(
                /\{prefix\}/g, this.msg.prefix + this.hg._parent.postPrefix),
            msg.reply2 &&
                msg.reply2.replace(
                    /\{prefix\}/g,
                    this.msg.prefix + this.hg._parent.postPrefix));
      }
      if (msg.endGame) {
        this.game.end();
      }
      if (msg.reason) {
        cb(msg.reason);
      }
      if (msg.game) {
        this.game.currentGame = HungryGames.Game.from(msg.game.currentGame);
        cb();
      }
    });
    worker.on('stdout', (msg) => {
      this.hg._parent.debug(msg);
    });
    worker.on('stderr', (msg) => {
      this.hg._parent.error(msg);
    });
    worker.on('error', (err) => {
      this.hg._parent.error('Simulation worker errored');
      console.error(err);
      this.game.currentGame.day.state = 0;
      this.hg._parent.common.reply(
          this.msg,
          'Simulator crashed for unknown reason while simulating next day.',
          'Try again with `hg next`, otherwise game may be in a bad state.');
    });
    worker.on('exit', (code) => {
      if (code != 0) this.hg._parent.debug('Worker exited with code ' + code);
    });
  }
}

/**
 * @description Probability of each amount of people being chosen for an event.
 * Must total to 1.0.
 *
 * @private
 * @static
 * @type {object.<number>}
 * @constant
 * @default
 */
Simulator._multiEventUserDistribution = {
  1: 0.66,
  2: 0.259,
  3: 0.03,
  4: 0.02,
  5: 0.01,
  6: 0.015,
  7: 0.005,
  8: 0.0005,
  9: 0.0005,
};

/**
 * @description If a larger percentage of people die in one day than this value,
 * then show a relevant message.
 *
 * @private
 * @static
 * @type {number}
 * @constant
 * @default
 */
Simulator._lotsOfDeathRate = 0.75;
/**
 * @description If a lower percentage of people die in one day than this value,
 * then show a relevant message.
 *
 * @private
 * @static
 * @type {number}
 * @constant
 * @default
 */
Simulator._littleDeathRate = 0.15;

/**
 * Produce a random number that is weighted by multiEventUserDistribution.
 *
 * @see {@link multiEventUserDistribution}
 *
 * @public
 * @static
 * @returns {number} The weighted number outcome.
 */
Simulator.weightedUserRand = function() {
  let sum = 0;
  const r = Math.random();
  for (const i in Simulator._multiEventUserDistribution) {
    if (typeof Simulator._multiEventUserDistribution[i] !== 'number') {
      throw new Error(
          'Invalid value for multiEventUserDistribution:' +
          Simulator._multiEventUserDistribution[i]);
    } else {
      sum += Simulator._multiEventUserDistribution[i];
      if (r <= sum) return i * 1;
    }
  }
};

/**
 * Pick the players to put into an event.
 *
 * @private
 * @static
 * @param {HungryGames~NormalEvent} evt The event data to pick players for.
 * @param {object} options Options for this game.
 * @param {HungryGames~Player[]} userPool Pool of all remaining players to put
 * into an event.
 * @param {HungryGames~Player[]} deadPool Pool of all dead players that can be
 * revived.
 * @param {HungryGames~Team[]} teams All teams in this game.
 * @param {?Player} weaponWielder A player that is using a weapon in this event,
 * or null if no player is using a weapon.
 * @returns {HungryGames~Player[]} Array of all players that will be affected by
 * this event.
 */
Simulator._pickAffectedPlayers = function(
    evt, options, userPool, deadPool, teams, weaponWielder) {
  const affectedUsers = [];
  const victimOutcome = evt.victim.outcome;
  const attackerOutcome = evt.attacker.outcome;
  const numAttacker = evt.attacker.count;
  const numVictim = evt.victim.count;
  const victimRevived = victimOutcome === 'revived';
  const attackerRevived = attackerOutcome === 'revived';

  let numTeams = 0;
  teams.forEach((el) => {
    if (el.numAlive > 0) numTeams++;
  });
  const collab = options.teammatesCollaborate == 'always' ||
      (options.teammatesCollaborate == 'untilend' && numTeams > 1);

  if (collab && options.teamSize > 0) {
    let isAttacker = false;
    const validTeam = teams.findIndex((team) => {
      if (weaponWielder) {
        isAttacker = options.useEnemyWeapon ? (Math.random() > 0.5) : true;
        return team.players.findIndex((p) => {
          return p === weaponWielder.id;
        }) > -1;
      }

      let canBeVictim = false;
      if (attackerRevived) {
        if (numAttacker <= team.players.length - team.numAlive &&
            numVictim <=
                (victimRevived ?
                     deadPool.length - (team.players.length - team.numAlive) :
                     userPool.length - team.numPool)) {
          isAttacker = true;
        }
      } else if (
        numAttacker <= team.numPool &&
          numVictim <=
              (victimRevived ?
                   deadPool.length - (team.players.length - team.numAlive) :
                   userPool.length - team.numPool)) {
        isAttacker = true;
      }
      if (victimRevived) {
        if (numVictim <= team.players.length - team.numAlive &&
            numAttacker <=
                (attackerRevived ?
                     deadPool.length - (team.players.length - team.numAlive) :
                     userPool.length - team.numPool)) {
          canBeVictim = true;
        }
      } else if (
        numVictim <= team.numPool &&
          numAttacker <=
              (attackerRevived ?
                   deadPool.length - (team.players.length - team.numAlive) :
                   userPool.length - team.numPool)) {
        canBeVictim = true;
      }
      if (!isAttacker && !canBeVictim) {
        return false;
      }
      if (isAttacker && canBeVictim) {
        isAttacker = Math.random() > 0.5;
      }
      return true;
    });
    const findMatching = function(match, mainPool) {
      return mainPool.findIndex((pool) => {
        const teamId = teams.findIndex((team) => {
          return team.players.findIndex((player) => {
            return player == pool.id;
          }) > -1;
        });
        return match ? (teamId == validTeam) : (teamId != validTeam);
      });
    };
    for (let i = 0; i < numAttacker + numVictim; i++) {
      if (victimRevived && i < numVictim) {
        const userIndex = findMatching(!isAttacker, deadPool);
        affectedUsers.push(deadPool.splice(userIndex, 1)[0]);
      } else if (attackerRevived && i >= numVictim) {
        const userIndex = findMatching(isAttacker, deadPool);
        affectedUsers.push(deadPool.splice(userIndex, 1)[0]);
      } else {
        const userIndex = findMatching(
            (i < numVictim && !isAttacker) || (i >= numVictim && isAttacker),
            userPool);
        affectedUsers.push(userPool.splice(userIndex, 1)[0]);
      }
      if (!affectedUsers[i]) {
        console.error(
            'AFFECTED USER IS INVALID:', victimRevived, attackerRevived, i, '/',
            numVictim, numAttacker, 'Pool:', userPool.length, deadPool.length,
            teams[validTeam].players.length - teams[validTeam].numAlive);
      }
    }
  } else {
    let i = weaponWielder ? 1 : 0;
    for (i; i < numAttacker + numVictim; i++) {
      if ((i < numVictim && victimRevived) ||
          (i >= numVictim && attackerRevived)) {
        const userIndex = Math.floor(Math.random() * deadPool.length);
        affectedUsers.push(deadPool.splice(userIndex, 1)[0]);
      } else {
        const userIndex = Math.floor(Math.random() * userPool.length);
        if (weaponWielder && weaponWielder.id == userPool[userIndex].id) {
          i--;
          continue;
        }
        affectedUsers.push(userPool.splice(userIndex, 1)[0]);
      }
    }
    if (weaponWielder) {
      const wielderIndex = userPool.findIndex((u) => u.id == weaponWielder.id);
      affectedUsers.push(userPool.splice(wielderIndex, 1)[0]);
    }
  }
  return affectedUsers;
};
/**
 * Base of all actions to perform on a player.
 *
 * @private
 * @static
 * @param {HungryGames~GuildGame} game Current GuildGame being affected.
 * @param {HungryGames~Player} affected The player to affect.
 * @param {number} kills The number of kills the player gets in this action.
 * @param {{id: string, count: number}} [weapon] The weapon being used if any.
 */
Simulator._effectUser = function(game, affected, kills, weapon) {
  if (weapon) {
    if (!isNaN(affected.weapons[weapon.id])) {
      affected.weapons[weapon.id] =
          affected.weapons[weapon.id] * 1 + weapon.count * 1;
    } else {
      affected.weapons[weapon.id] = weapon.count * 1;
    }
    if (affected.weapons[weapon.id] <= 0) {
      delete affected.weapons[weapon.id];
    }
  }
  affected.kills += kills;
};

/**
 * Kill the given player in the given guild game.
 *
 * @private
 * @static
 * @param {HungryGames~GuildGame} game Current GuildGame being affected.
 * @param {HungryGames~Player} a The player to affect.
 * @param {number} k The number of kills the player gets in this action.
 * @param {{name: string, count: number}} [w] The weapon being used if any.
 */
Simulator._killUser = function(game, a, k, w) {
  Simulator._effectUser(game, a, k, w);
  a.bleeding = 0;
  a.state = 'dead';
  a.weapons = {};
  if (!a.living) return;
  a.living = false;
  a.rank = game.currentGame.numAlive--;
  a.dayOfDeath = game.currentGame.day.num;
  if (game.options.teamSize > 0) {
    const team = game.currentGame.teams.find((team) => {
      return team.players.findIndex((obj) => {
        return a.id == obj;
      }) > -1;
    });
    if (!team) {
      console.log('FAILED TO FIND ADEQUATE TEAM FOR USER', a.id);
    } else {
      team.numAlive--;
      if (team.numAlive === 0) {
        let teamsLeft = 0;
        game.currentGame.teams.forEach((obj) => {
          if (obj.numAlive > 0) teamsLeft++;
        });
        team.rank = teamsLeft + 1;
      }
    }
  }
};

/**
 * Wound the given player in the given guild game.
 *
 * @private
 * @static
 * @param {HungryGames~GuildGame} game Current GuildGame being affected.
 * @param {HungryGames~Player} a The player to affect.
 * @param {number} k The number of kills the player gets in this action.
 * @param {{name: string, count: number}} [w] The weapon being used if any.
 */
Simulator._woundUser = function(game, a, k, w) {
  Simulator._effectUser(game, a, k, w);
  a.state = 'wounded';
};
/**
 * Heal the given player in the given guild game.
 *
 * @private
 * @static
 * @param {HungryGames~GuildGame} game Current GuildGame being affected.
 * @param {HungryGames~Player} a The player to affect.
 * @param {number} k The number of kills the player gets in this action.
 * @param {{name: string, count: number}} [w] The weapon being used if any.
 */
Simulator._restoreUser = function(game, a, k, w) {
  Simulator._effectUser(game, a, k, w);
  a.state = 'normal';
  a.bleeding = 0;
};
/**
 * Revive the given player in the given guild game.
 *
 * @private
 * @static
 * @param {HungryGames~GuildGame} game Current GuildGame being affected.
 * @param {HungryGames~Player} a The player to affect.
 * @param {number} k The number of kills the player gets in this action.
 * @param {{name: string, count: number}} [w] The weapon being used if any.
 */
Simulator._reviveUser = function(game, a, k, w) {
  Simulator._effectUser(game, a, k, w);
  a.state = a.living ? 'normal' : 'zombie';
  a.bleeding = 0;
  game.currentGame.includedUsers.forEach((obj) => {
    if (!obj.living && obj.rank < a.rank) obj.rank++;
  });
  a.rank = 1;
  if (a.living) return;
  a.living = true;
  game.currentGame.numAlive++;
  if (game.options.teamSize > 0) {
    const team = game.currentGame.teams.find((obj) => {
      return obj.players.findIndex((obj) => {
        return a.id == obj;
      }) > -1;
    });
    team.numAlive++;
    game.currentGame.teams.forEach((obj) => {
      if (obj.numAlive === 0 && obj.rank < team.rank) obj.rank++;
    });
    team.rank = 1;
  }
};

/**
 * @description Apply the given outcome to a player in the given guild game.
 *
 * @private
 * @static
 * @param {HungryGames~GuildGame} game Current GuildGame being affected.
 * @param {HungryGames~Player} a The player to affect.
 * @param {number} k The number of kills the player gets in this action.
 * @param {{name: string, count: number}} [w] The weapon being used if any.
 * @param {string} outcome The outcome to apply.
 * @returns {boolean} True if valid outcome was successfully applied, false
 * otherwise. ('nothing' is considered not valid, but outcome will still be
 * applied).
 */
Simulator._applyOutcome = function(game, a, k, w, outcome) {
  switch (outcome) {
    case 'dies':
      Simulator._killUser(game, a, k, w);
      return true;
    case 'revived':
      Simulator._reviveUser(game, a, k, w);
      return true;
    case 'thrives':
      Simulator._restoreUser(game, a, k, w);
      return true;
    case 'wounded':
      Simulator._woundUser(game, a, k, w);
      return true;
    case 'nothing':
      Simulator._effectUser(game, a, k, w);
      return false;
    default:
      return false;
  }
};

/**
 * Pick event that satisfies all requirements and settings.
 *
 * @private
 * @static
 * @param {HungryGames~Player[]} userPool Pool of players left to chose from
 * in this day.
 * @param {HungryGames~NormalEvent[]} eventPool Pool of all events available to
 * choose at this time.
 * @param {object} options The options set in the current game.
 * @param {number} numAlive Number of players in the game still alive.
 * @param {number} numTotal Number of players in the game total.
 * @param {HungryGames~Team[]} teams Array of teams in this game.
 * @param {HungryGames~OutcomeProbabilities} probOpts Death rate weights.
 * @param {?Player} weaponWielder A player that is using a weapon in this
 * event, or null if no player is using a weapon.
 * @param {string} weaponId ID of the weapon the player is trying to use.
 * @returns {?HungryGames~NormalEvent} The chosen event that satisfies all
 * requirements, or null if something went wrong.
 */
Simulator._pickEvent = function(
    userPool, eventPool, options, numAlive, numTotal, teams, probOpts,
    weaponWielder, weaponId) {
  if (eventPool) eventPool = eventPool.filter((el) => el);
  // const fails = [];
  let loop = 0;
  while (loop < 100) {
    loop++;
    if (!eventPool || eventPool.length == 0) {
      // fails.push('No Events');
      break;
    }
    const eventIndex = Simulator._probabilityEvent(
        eventPool, probOpts, options.customEventWeight);
    const eventTry = eventPool[eventIndex];
    if (!eventTry) {
      /* if (fails.length < 3) {
        console.error('Invalid Event:', eventTry);
      }
      fails.push('Invalid Event'); */
      eventPool.splice(eventIndex, 1);
      continue;
    }

    let numAttacker = eventTry.attacker.count * 1;
    let numVictim = eventTry.victim.count * 1;

    const victimRevived = eventTry.victim.outcome === 'revived';
    const attackerRevived = eventTry.attacker.outcome === 'revived';

    let eventEffectsNumMin = 0;
    let eventRevivesNumMin = 0;
    victimRevived ? (eventRevivesNumMin += Math.abs(numVictim)) :
                    (eventEffectsNumMin += Math.abs(numVictim));
    attackerRevived ? (eventRevivesNumMin += Math.abs(numAttacker)) :
                      (eventEffectsNumMin += Math.abs(numAttacker));

    // If the chosen event requires more players than there are remaining,
    // pick a new event.
    if (eventEffectsNumMin > userPool.length) {
      /* fails.push(
          'Event too large (' + eventEffectsNumMin + ' > ' + userPool.length +
          '): ' + eventIndex + ' V:' + eventTry.victim.count + ' A:' +
          eventTry.attacker.count + ' M:' + eventTry.message); */
      continue;
    } else if (eventRevivesNumMin > numTotal - numAlive) {
      /* fails.push(
          'Event too large (' + eventRevivesNumMin + ' > ' +
          (numTotal - numAlive) + '): ' + eventIndex + ' V:' +
          eventTry.victim.count + ' A:' + eventTry.attacker.count + ' M:' +
          eventTry.message); */
      continue;
    }

    const consumes = Math.abs(
        Simulator._parseConsumeCount(
            eventTry.consumes, numVictim, numAttacker));
    if (weaponWielder && weaponId) {
      if (consumes > weaponWielder.weapons[weaponId]) {
        /* fails.push(
            'Not enough consumables (' + consumes + ' > ' +
            weaponWielder.weapons[weaponId] + '): ' + eventIndex + ' V:' +
            eventTry.victim.count + ' A:' + eventTry.attacker.count + ' M:' +
            eventTry.message); */
        continue;
      }
    }

    const multiAttacker = numAttacker < 0;
    const multiVictim = numVictim < 0;
    const attackerMin = -numAttacker;
    const victimMin = -numVictim;
    if (multiAttacker || multiVictim) {
      let count = 0;
      while (count++ < 100) {
        if (multiAttacker) {
          numAttacker = Simulator.weightedUserRand() + (attackerMin - 1);
        }
        if (multiVictim) {
          numVictim = Simulator.weightedUserRand() + (victimMin - 1);
        }
        if (weaponWielder && weaponId &&
            Simulator._parseConsumeCount(
                eventTry.consumes, numVictim, numAttacker) >
                weaponWielder.weapons[weaponId]) {
          continue;
        } else if (victimRevived && attackerRevived) {
          if (numAttacker + numVictim <= numTotal - numAlive) break;
        } else if (victimRevived) {
          if (numAttacker <= userPool.length &&
              numVictim <= numTotal - numAlive) {
            break;
          }
        } else if (attackerRevived) {
          if (numAttacker <= numTotal - numAlive &&
              numVictim <= userPool.length) {
            break;
          }
        } else if (numAttacker + numVictim <= userPool.length) {
          break;
        }
      }
      if (count >= 100) {
        self.error('Infinite loop while picking player count.');
        // fails.push('Infinite loop while picking player count.');
        continue;
      }
    }

    const failReason = Simulator._validateEventRequirements(
        victimRevived ? 0 : numVictim, attackerRevived ? 0 : numAttacker,
        userPool, numAlive, teams, options, eventTry.victim.outcome == 'dies',
        eventTry.attacker.outcome == 'dies', weaponWielder);
    if (failReason) {
      /* fails.push(
          'Fails event requirement validation: ' + eventIndex + ' ' +
          failReason); */
      continue;
    }

    const finalEvent = HungryGames.NormalEvent.from(eventPool[eventIndex]);

    finalEvent.attacker.count = numAttacker;
    finalEvent.victim.count = numVictim;

    return finalEvent;
  }
  return null;
};
/**
 * Ensure teammates don't attack each other.
 *
 * @private
 * @static
 * @param {number} numVictim The number of victims in the event.
 * @param {number} numAttacker The number of attackers in the event.
 * @param {HungryGames~Player[]} userPool Pool of all remaining players to put
 * into an event.
 * @param {HungryGames~Team[]} teams All teams in this game.
 * @param {object} options Options for this game.
 * @param {boolean} victimsDie Do the victims die in this event?
 * @param {boolean} attackersDie Do the attackers die in this event?
 * @param {?Player} weaponWielder A player that is using a weapon in this
 * event, or null if no player is using a weapon.
 * @returns {?string} String describing failing check, or null of pass.
 */
Simulator._validateEventTeamConstraint = function(
    numVictim, numAttacker, userPool, teams, options, victimsDie, attackersDie,
    weaponWielder) {
  let numTeams = 0;
  teams.forEach((el) => {
    if (el.numAlive > 0) numTeams++;
  });
  const collab = options.teammatesCollaborate == 'always' ||
      (options.teammatesCollaborate == 'untilend' && numTeams > 1);
  if (collab && options.teamSize > 0) {
    if (weaponWielder) {
      let numTeams = 0;
      for (let i = 0; i < teams.length; i++) {
        const team = teams[i];
        let numPool = 0;

        team.players.forEach((player) => {
          if (userPool.find((pool) => pool.id == player && pool.living)) {
            numPool++;
          }
        });

        team.numPool = numPool;
        if (numPool > 0) numTeams++;
      }
      if (numTeams < 2) {
        if (attackersDie || victimsDie) {
          return 'TEAM_WEAPON_NO_OPPONENT';
        }
      }
      const attackerTeam = teams.find((team) => {
        return team.players.findIndex((p) => {
          return p === weaponWielder.id;
        }) > -1;
      });
      if (!attackerTeam) {
        self.error(weaponWielder.id + ' not on any team');
        return 'TEAM_WEAPON_NO_TEAM';
      }
      return !(numAttacker <= attackerTeam.numPool &&
               numVictim <= userPool.length - attackerTeam.numPool) &&
          'TEAM_WEAPON_TOO_LARGE' ||
          null;
    } else {
      let largestTeam = {index: 0, size: 0};
      let numTeams = 0;
      for (let i = 0; i < teams.length; i++) {
        const team = teams[i];
        let numPool = 0;

        team.players.forEach((player) => {
          if (userPool.findIndex((pool) => {
            return pool.id == player && pool.living;
          }) > -1) {
            numPool++;
          }
        });

        team.numPool = numPool;
        if (numPool > largestTeam.size) {
          largestTeam = {index: i, size: numPool};
        }
        if (numPool > 0) numTeams++;
      }
      if (numTeams < 2) {
        if (attackersDie || victimsDie) {
          return 'TEAM_NO_OPPONENT';
        }
      }
      return !((numAttacker <= largestTeam.size &&
                numVictim <= userPool.length - largestTeam.size) ||
               (numVictim <= largestTeam.size &&
                numAttacker <= userPool.length - largestTeam.size)) &&
          'TEAM_TOO_LARGE' ||
          null;
    }
  }
  return null;
};
/**
 * Ensure the event we choose will not force all players to be dead.
 *
 * @private
 * @static
 * @param {number} numVictim Number of victims in this event.
 * @param {number} numAttacker Number of attackers in this event.
 * @param {number} numAlive Total number of living players left in the game.
 * @param {object} options The options set for this game.
 * @param {boolean} victimsDie Do the victims die in this event?
 * @param {boolean} attackersDie Do the attackers die in this event?
 * @returns {boolean} Will this event follow current options set about number
 * of victors required.
 */
Simulator._validateEventVictorConstraint = function(
    numVictim, numAttacker, numAlive, options, victimsDie, attackersDie) {
  if (!options.allowNoVictors) {
    let numRemaining = numAlive;
    if (victimsDie) numRemaining -= numVictim;
    if (attackersDie) numRemaining -= numAttacker;
    return numRemaining >= 1;
  }
  return true;
};
/**
 * Ensure the number of users in an event is mathematically possible.
 *
 * @private
 * @static
 * @param {number} numVictim Number of victims in this event.
 * @param {number} numAttacker Number of attackers in this event.
 * @param {HungryGames~Player[]} userPool Pool of all remaining players to put
 * into an event.
 * @param {number} numAlive Total number of living players left in the game.
 * @returns {boolean} If the event requires a number of players that is valid
 * from the number of players left to choose from.
 */
Simulator._validateEventNumConstraint = function(
    numVictim, numAttacker, userPool, numAlive) {
  return numVictim + numAttacker <= userPool.length &&
      numVictim + numAttacker <= numAlive;
};
/**
 * Ensure the event chosen meets all requirements for actually being used in
 * the current game.
 *
 * @private
 * @static
 * @param {number} numVictim Number of victims in this event.
 * @param {number} numAttacker Number of attackers in this event.
 * @param {HungryGames~Player[]} userPool Pool of all remaining players to put
 * into an event.
 * @param {number} numAlive Total number of living players left in the game.
 * @param {HungryGames~Team[]} teams All teams in this game.
 * @param {object} options The options set for this game.
 * @param {boolean} victimsDie Do the victims die in this event?
 * @param {boolean} attackersDie Do the attackers die in this event?
 * @param {?Player} weaponWielder A player that is using a weapon in this
 * event, or null if no player is using a weapon.
 * @returns {?string} String of failing constraint check, or null if passes.
 */
Simulator._validateEventRequirements = function(
    numVictim, numAttacker, userPool, numAlive, teams, options, victimsDie,
    attackersDie, weaponWielder) {
  if (!Simulator._validateEventNumConstraint(
      numVictim, numAttacker, userPool, numAlive)) {
    return 'NUM_CONSTRAINT';
  }
  const failReason = Simulator._validateEventTeamConstraint(
      numVictim, numAttacker, userPool, teams, options, victimsDie,
      attackersDie, weaponWielder);
  if (failReason) {
    return 'TEAM_CONSTRAINT-' + failReason;
  }
  if (!Simulator._validateEventVictorConstraint(
      numVictim, numAttacker, numAlive, options, victimsDie,
      attackersDie)) {
    return 'VICTOR_CONSTRAINT';
  }
  return null;
};

/**
 * Produce a random event that using probabilities set in options.
 *
 * @private
 * @static
 * @param {HungryGames~NormalEvent[]} eventPool The pool of all events to
 * consider.
 * @param {{
 *   kill: number,
 *   wound: number,
 *   thrive: number,
 *   nothing: number
 * }} probabilityOpts The probabilities of each type of event being used.
 * @param {number} [customWeight=1] The weight of custom events.
 * @param {number} [recurse=0] The current recursive depth.
 * @returns {number} The index of the event that was chosen.
 */
Simulator._probabilityEvent = function(
    eventPool, probabilityOpts, customWeight = 1, recurse = 0) {
  let probTotal = 0;
  if (typeof probabilityOpts.kill === 'number') {
    probTotal += probabilityOpts.kill;
  } else {
    probabilityOpts.kill = 0;
  }
  if (typeof probabilityOpts.nothing === 'number') {
    probTotal += probabilityOpts.nothing;
  } else {
    probabilityOpts.nothing = 0;
  }
  if (typeof probabilityOpts.revive === 'number') {
    probTotal += probabilityOpts.revive;
  } else {
    probabilityOpts.revive = 0;
  }
  if (typeof probabilityOpts.thrive === 'number') {
    probTotal += probabilityOpts.thrive;
  } else {
    probabilityOpts.thrive = 0;
  }
  if (typeof probabilityOpts.wound === 'number') {
    probTotal += probabilityOpts.wound;
  } else {
    probabilityOpts.wound = 0;
  }

  const value = Math.random() * probTotal;

  let type;
  if (value > (probTotal -= probabilityOpts.nothing)) type = null;
  else if (value > (probTotal -= probabilityOpts.revive)) type = 'revived';
  else if (value > (probTotal -= probabilityOpts.thrive)) type = 'thrives';
  else if (value > (probTotal -= probabilityOpts.wound)) type = 'wounded';
  else type = 'dies';

  const finalPool = [];

  for (let i = 0; i < eventPool.length; i++) {
    if (type && (eventPool[i].attacker.outcome == type ||
                 eventPool[i].victim.outcome == type)) {
      finalPool.push(i);
    } else if (
      !type && eventPool[i].attacker.outcome == 'nothing' &&
        eventPool[i].victim.outcome == 'nothing') {
      finalPool.push(i);
    }
  }
  if (finalPool.length == 0) {
    if (recurse < 10) {
      return Simulator._probabilityEvent(
          eventPool, probabilityOpts, customWeight, recurse + 1);
    } else {
      /* self.error(
          'Failed to find event with probabilities: ' +
          JSON.stringify(probabilityOpts) + ' from ' + eventPool.length +
          ' events.'); */
      return Math.floor(Math.random() * eventPool.length);
    }
  } else {
    let total = finalPool.length;
    if (customWeight != 1) {
      finalPool.forEach((el) => {
        if (eventPool[el].custom) total += customWeight - 1;
      });
    }
    const pick = Math.random() * total;
    return finalPool.find((el) => {
      total -= eventPool[el].custom ? customWeight : 1;
      if (total < pick) return true;
      return false;
    });
    // return finalPool[Math.floor(Math.random() * finalPool.length)];
  }
};

/**
 * Parse the number of items consumed from the given consumed value, and number
 * of victims and attackers.
 *
 * @private
 * @static
 * @param {string} consumeString The consumes value for the event.
 * @param {number} numVictim The number of victims in the event.
 * @param {number} numAttacker The number of attackers in the event.
 * @returns {number} The number of consumed items.
 */
Simulator._parseConsumeCount = function(consumeString, numVictim, numAttacker) {
  const consumedMatch = (consumeString + '').match(/^(\d*)(V|A)?$/);
  if (!consumedMatch) {
    return 0;
  } else if (consumedMatch[2] == 'V') {
    return numVictim * (consumedMatch[1] || 1);
  } else if (consumedMatch[2] == 'A') {
    return numAttacker * (consumedMatch[1] || 1);
  } else {
    return consumedMatch[1] * 1;
  }
};

/**
 * @description Format an event message for the given weapon information.
 * @public
 * @static
 * @param {HungryGames~NormalEvent} eventTry The event to format.
 * @param {HungryGames~Player} userWithWeapon The player using the weapon.
 * @param {string} ownerName The formated name to insert fot the weapon owner.
 * @param {boolean} firstAttacker Is the weapon owner the first attacker in list
 * of affected users.
 * @param {string} weaponId The id of the chosen weapon.
 * @param {object.<HungryGames~WeaponEvent>} weapons The default weapons object
 * injected with custom weapons.
 * @param {number} [countOverride] If specified, this value is used as the final
 * amount the player will end up with, instead of using the calculated value.
 * @returns {string} Additional subMessage.
 */
Simulator.formatWeaponEvent = function(
    eventTry, userWithWeapon, ownerName, firstAttacker, weaponId, weapons,
    countOverride) {
  let subMessage = '';

  const numVictim = eventTry.victim.count;
  const numAttacker = eventTry.attacker.count;
  const found = eventTry.consumes && eventTry.consumes.find &&
      eventTry.consumes.find((el) => el.id === weaponId);
  const consumed = Simulator._parseConsumeCount(
      found ? found.count : eventTry.consumes, numVictim, numAttacker);
  const count =
      (countOverride != null ? countOverride :
                               userWithWeapon.weapons[weaponId] - consumed) ||
      0;
  const chosenWeapon = weapons[weaponId];
  const weaponName = chosenWeapon && chosenWeapon.name || weaponId;
  if (count <= 0) {
    if ((userWithWeapon.weapons[weaponId] - consumed || 0) ==
        (countOverride || 0)) {
      delete userWithWeapon.weapons[weaponId];
    }

    let consumableName = weaponName;
    if (chosenWeapon) {
      if (chosenWeapon.consumable) {
        consumableName =
            chosenWeapon.consumable.replace(/\[C([^|]*)\|([^\]]*)\]/g, '$2');
      } else if (chosenWeapon.name) {
        consumableName =
            chosenWeapon.name.replace(/\[C([^|]*)\|([^\]]*)\]/g, '$2');
      } else {
        consumableName += 's';
      }
    }
    subMessage = `\n${ownerName} runs out of ${consumableName}.`;
  } else if (consumed != 0) {
    let consumableName = weaponName;
    const count = consumed;
    if (chosenWeapon.consumable) {
      consumableName = chosenWeapon.consumable.replace(
          /\[C([^|]*)\|([^\]]*)\]/g, (count == 1 ? '$1' : '$2'));
    } else if (chosenWeapon.name) {
      consumableName = chosenWeapon.name.replace(
          /\[C([^|]*)\|([^\]]*)\]/g, (count == 1 ? '$1' : '$2'));
    } else if (count != 1) {
      consumableName += 's';
    }
    subMessage = `\n${ownerName} lost ${count} ${consumableName}.`;
  }

  let owner = 'their';
  if (numAttacker > 1 || (numAttacker == 1 && !firstAttacker)) {
    owner = `${ownerName}'s`;
  }
  if (!eventTry.message) {
    eventTry.message =
        HungryGames.WeaponEvent.action
            .replace(/\{weapon\}/g, `${owner} ${weaponName}`)
            .replace(/\{action\}/g, eventTry.action)
            .replace(/\[C([^|]*)\|([^\]]*)\]/g, (consumed == 1 ? '$1' : '$2'));
  } else {
    eventTry.message = eventTry.message.replace(/\{owner\}/g, owner);
  }
  return subMessage;
};

/**
 * @description Format the text that shows all users' inventories in an event.
 * @public
 * @static
 * @param {HungryGames~NormalEvent} eventTry The event to format inventories
 * for.
 * @param {HungryGames~Player[]} affectedUsers Array of all player affected by
 * this event.
 * @param {object.<HungryGames~WeaponEvent>} weapons The default weapons object
 * injected with custom weapons.
 * @param {string} nameFormat The format for
 * {@link HungryGames~Grammar~formatMultiNames}.
 * @returns {string} The additional text to append.
 */
Simulator.formatWeaponCounts = function(
    eventTry, affectedUsers, weapons, nameFormat) {
  const numVictim = Math.abs(eventTry.victim.count);
  const numAttacker = Math.abs(eventTry.attacker.count);
  const finalConsumeList = {};


  const getWeaponCount = function(el) {
    const weapon = weapons[el[0]];
    const weaponName = weapon && weapon.name || el[0];
    let consumableName = weaponName;
    const count = el[1];
    if (!weapon) {
      console.error('Unable to find weapon ' + el[0]);
      return `(Unknown weapon ${weaponName}. Was it deleted?)`;
    }
    if (weapon.consumable) {
      consumableName = weapon.consumable.replace(
          /\[C([^|]*)\|([^\]]*)\]/g, (count == 1 ? '$1' : '$2'));
    } else if (count != 1) {
      consumableName += 's';
    }
    return `${count || 0} ${consumableName}`;
  };
  for (let i = 0; i < numVictim + numAttacker; i++) {
    const group = i < numVictim ? eventTry.victim : eventTry.attacker;
    const evtGroup = group.weapon || group.weapons;
    if (!evtGroup || evtGroup.length === 0) {
      if (i < numVictim) {
        i += numVictim - 1;
      } else {
        i += numAttacker - 1;
      }
      continue;
    }
    const user = affectedUsers[i];
    let entries = [];
    if (user && user.weapons) entries = Object.entries(user.weapons);
    if (entries.length === 0) continue;
    const consumableList = entries.filter((el) => el[0]).map(getWeaponCount);
    const list = consumableList.join(', ');
    if (!finalConsumeList[list]) {
      finalConsumeList[list] = [];
    }
    finalConsumeList[list].push(user);
  }

  const subMessage = [];
  Object.entries(finalConsumeList).forEach((el) => {
    const multi = HungryGames.Grammar.formatMultiNames(el[1], nameFormat);
    const has = el[1].length == 1 ? 'has' : 'have';
    subMessage.push(`\n${multi} now ${has} ${el[0]}.`);
  });
  return subMessage.join('');
};

/**
 * Relative path from CWD where the simulation worker is located.
 *
 * @private
 * @static
 * @type {string}
 * @default
 * @constant
 */
Simulator._workerPath = './src/hg/simulator/worker.js';

module.exports = Simulator;
