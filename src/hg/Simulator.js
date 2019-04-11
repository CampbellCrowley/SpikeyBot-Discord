// Copyright 2018-2019 Campbell Crowley. All rights reserved.
// Author: Campbell Crowley (dev@campbellcrowley.com)
const Event = require('./Event.js');
const Battle = require('./Battle.js');
const Grammar = require('./Grammar.js');

/**
 * Wrapper for logging functions that normally reference SubModule.error and
 * similar.
 * @TODO: Obtain reference to SubModule to be able to remove this.
 * @private
 * @constant
 */
const self = {
  error: function(...args) {
    console.error(`ERR:${('00000' + process.pid).slice(-5)}`, ...args);
  },
};

/**
 * Probability of each amount of people being chosen for an event. Must total to
 * 1.0
 *
 * @private
 * @type {Object.<number>}
 * @constant
 * @default
 */
const multiEventUserDistribution = {
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
 * If a larger percentage of people die in one day than this value, then show
 * a relevant message.
 *
 * @private
 * @type {number}
 * @constant
 * @default
 */
const lotsOfDeathRate = 0.75;
/**
 * If a lower percentage of people die in one day than this value, then show a
 * relevant message.
 *
 * @private
 * @type {number}
 * @constant
 * @default
 */
const littleDeathRate = 0.15;

/**
 * @classdesc Manages HG day simulation.
 * @class HungryGames~Simulator
 *
 * @param {HungryGames~GuildGame} game The GuildGame to simulate.
 * @param {HungryGames} hg Parent game manager for logging and SubModule
 * references.
 * @param {Discord~Message} [msg] Message to reply to if necessary.
 */
function Simulator(game, hg, msg) {
  this.setGame(game);
  this.setParent(hg);
  this.setMessage(msg);
}

/**
 * Change the GuildGame to simulate.
 *
 * @param {HungryGames~GuildGame} game The new GuildGame.
 */
Simulator.prototype.setGame = function(game) {
  this.game = game;
};
/**
 * Update the reference to the parent {@link HungryGames}.
 *
 * @param {HungryGames} hg New parent reference.
 */
Simulator.prototype.setParent = function(hg) {
  this.hg = hg;
};
/**
 * Update the message to reply to.
 *
 * @param {Discord~Message} msg New message to reference.
 */
Simulator.prototype.setMessage = function(msg) {
  this.msg = msg;
};

/**
 * Simulate a day with the current GuildGame.
 *
 * @param {Function} cb Callback that always fires on completion. The only
 * parameter is a possible error string, null if no error.
 * @param {boolean} [retry=true] Whether to try again if there is an error.
 */
Simulator.prototype.go = function(cb, retry = true) {
  this.game.currentGame.day.state = 1;
  this.game.currentGame.day.num++;
  this.game.currentGame.day.events = [];

  const id = this.game.id;

  const userPool = this.game.currentGame.includedUsers.filter((obj) => {
    return obj.living;
  });
  // Shuffle user order because games may have been rigged :thonk:.
  for (let i = 0; i < userPool.length; i++) {
    const index = Math.floor(Math.random() * (userPool.length - i)) + i;
    const tmp = userPool[i];
    userPool[i] = userPool[index];
    userPool[index] = tmp;
  }
  const startingAlive = userPool.length;
  let userEventPool;
  let doArenaEvent = false;
  let arenaEvent;

  const defaultEvents = this.hg.getDefaultEvents();

  if (this.game.currentGame.day.num === 0) {
    userEventPool =
        defaultEvents.bloodbath.concat(this.game.customEvents.bloodbath);
    if (this.game.disabledEvents && this.game.disabledEvents.bloodbath) {
      userEventPool = userEventPool.filter((el) => {
        return !this.game.disabledEvents.bloodbath.find((d) => {
          return this.hg.eventsEqual(d, el);
        });
      });
    }
    if (userEventPool.length == 0) {
      if (this.msg) {
        this.hg.common.reply(
            this.msg,
            'All bloodbath events have been disabled! Please enable ' +
                'events so that something can happen in the games!');
        this.hg.endGame(this.msg, id);
      } else {
        this.hg.endGame(null, id);
      }
      cb('No Bloodbath Events');
      return;
    }
  } else {
    doArenaEvent = startingAlive > 2 && this.game.options.arenaEvents &&
        Math.random() < this.game.options.probabilityOfArenaEvent;
    if (doArenaEvent) {
      const arenaEventPool =
          defaultEvents.arena.concat(this.game.customEvents.arena);
      do {
        const index = Math.floor(Math.random() * arenaEventPool.length);
        arenaEvent = arenaEventPool[index];
        userEventPool = arenaEvent.outcomes;
        if (this.game.disabledEvents && this.game.disabledEvents.arena &&
            this.game.disabledEvents.arena[arenaEvent.message]) {
          userEventPool = userEventPool.filter((el) => {
            return !this.game.disabledEvents.arena[arenaEvent.message].find(
                (d) => {
                  return Event.eventsEqual(d, el);
                });
          });
        }
        if (userEventPool.length == 0) {
          arenaEventPool.splice(index, 1);
        } else {
          this.game.currentGame.day.events.push(
              Event.finalizeSimple(
                  this.hg.messages.get('eventStart'), this.game));
          this.game.currentGame.day.events.push(
              Event.finalizeSimple(
                  '**___' + arenaEvent.message + '___**', this.game));
          break;
        }
      } while (arenaEventPool.length > 0);
      if (arenaEventPool.length == 0) doArenaEvent = false;
    }
    if (!doArenaEvent) {
      userEventPool =
          defaultEvents.player.concat(this.game.customEvents.player);
      if (this.game.disabledEvents && this.game.disabledEvents.player) {
        userEventPool = userEventPool.filter((el) => {
          return !this.game.disabledEvents.player.find((d) => {
            return Event.equal(d, el);
          });
        });
      }
      if (userEventPool.length == 0) {
        if (this.msg) {
          this.hg.common.reply(
              this.msg,
              'All player events have been disabled! Please enable events' +
                  ' so that something can happen in the games!');
          this.hg.endGame(this.msg, id);
        } else {
          this.hg.endGame(null, id);
        }
        cb('No Player Events');
        return;
      }
    }
  }

  const weapons = this.hg.getDefaultWeapons();
  const weaponEventPool = Object.assign({}, weapons);
  if (this.game.customEvents.weapon) {
    const entries = Object.entries(this.game.customEvents.weapon);
    for (let i = 0; i < entries.length; i++) {
      if (weaponEventPool[entries[i][0]]) {
        weaponEventPool[entries[i][0]].outcomes =
            weaponEventPool[entries[i][0]].outcomes.concat(
                entries[i][1].outcomes);
      } else {
        weaponEventPool[entries[i][0]] = entries[i][1];
      }

      if (this.game.disabledEvents && this.game.disabledEvents.weapon &&
          this.game.disabledEvents.weapon[entries[i][0]]) {
        weaponEventPool[entries[i][0]].outcomes =
            weaponEventPool[entries[i][0]].outcomes.filter((el) => {
              return !this.game.disabledEvents.weapon[entries[i][0]].find(
                  (d) => {
                    return Event.equal(d, el);
                  });
            });
      }
    }
  }

  const probOpts = this.game.currentGame.day.num === 0 ?
      this.game.options.bloodbathOutcomeProbs :
      (doArenaEvent ?
           (arenaEvent.outcomeProbs || this.game.options.arenaOutcomeProbs) :
           this.game.options.playerOutcomeProbs);

  const nameFormat = this.game.options.useNicknames ? 'nickname' : 'username';

  while (userPool.length > 0) {
    let eventTry;
    let affectedUsers;
    let numAttacker;
    let numVictim;

    let subMessage = '';

    const deadPool = this.game.currentGame.includedUsers.filter((obj) => {
      return !obj.living;
    });

    let userWithWeapon = null;
    if (!doArenaEvent) {
      const usersWithWeapon = [];
      for (let i = 0; i < userPool.length; i++) {
        if (userPool[i].weapons &&
            Object.keys(userPool[i].weapons).length > 0) {
          usersWithWeapon.push(userPool[i]);
        }
      }
      if (usersWithWeapon.length > 0) {
        userWithWeapon =
            usersWithWeapon[Math.floor(Math.random() * usersWithWeapon.length)];
      }
    }
    let useWeapon = userWithWeapon &&
        Math.random() < this.game.options.probabilityOfUseWeapon;
    if (useWeapon) {
      const userWeapons = Object.keys(userWithWeapon.weapons);
      const chosenWeapon =
          userWeapons[Math.floor(Math.random() * userWeapons.length)];

      if (!weaponEventPool[chosenWeapon]) {
        useWeapon = false;
        // console.log('No event pool with weapon', chosenWeapon);
      } else {
        eventTry = pickEvent(
            userPool, weaponEventPool[chosenWeapon].outcomes, this.game.options,
            this.game.currentGame.numAlive,
            this.game.currentGame.includedUsers.length,
            this.game.currentGame.teams, probOpts, userWithWeapon);
        if (!eventTry) {
          useWeapon = false;
          /* self.error(
              'No event with weapon "' + chosenWeapon +
              '" for available players ' + id); */
        } else {
          numAttacker = eventTry.attacker.count;
          numVictim = eventTry.victim.count;
          affectedUsers = pickAffectedPlayers(
              numVictim, numAttacker, eventTry.victim.outcome,
              eventTry.attacker.outcome, this.game.options, userPool, deadPool,
              this.game.currentGame.teams, userWithWeapon);

          let consumed = eventTry.consumes;
          if (consumed == 'V') {
            consumed = numVictim;
          } else if (consumed == 'A') {
            consumed = numAttacker;
          }
          userWithWeapon.weapons[chosenWeapon] -= consumed;
          if (userWithWeapon.weapons[chosenWeapon] <= 0) {
            delete userWithWeapon.weapons[chosenWeapon];

            const weaponName = chosenWeapon;
            let consumableName = weaponName;
            if (weapons[weaponName]) {
              if (weapons[weaponName].consumable) {
                consumableName = weapons[weaponName].consumable.replace(
                    /\[C([^|]*)\|([^\]]*)\]/g, '$2');
              } else if (weapons[weaponName].name) {
                consumableName = weapons[weaponName].name.replace(
                    /\[C([^|]*)\|([^\]]*)\]/g, '$2');
              } else {
                consumableName += 's';
              }
            } else {
              consumableName += 's';
            }
            subMessage +=
                Grammar.formatMultiNames([userWithWeapon], nameFormat) +
                ' runs out of ' + consumableName + '.';
          } else if (consumed != 0) {
            const weaponName = chosenWeapon;
            let consumableName = weaponName;
            const count = consumed;
            if (weapons[weaponName].consumable) {
              consumableName = weapons[weaponName].consumable.replace(
                  /\[C([^|]*)\|([^\]]*)\]/g, (count == 1 ? '$1' : '$2'));
            } else if (weapons[weaponName].name) {
              consumableName = weapons[weaponName].name.replace(
                  /\[C([^|]*)\|([^\]]*)\]/g, (count == 1 ? '$1' : '$2'));
            } else if (count != 1) {
              consumableName += 's';
            }
            subMessage +=
                Grammar.formatMultiNames([userWithWeapon], nameFormat) +
                ' lost ' + count + ' ' + consumableName + '.';
          }

          let owner = 'their';
          if (numAttacker > 1 ||
              (numAttacker == 1 &&
               affectedUsers[numVictim].id != userWithWeapon.id)) {
            owner =
                Grammar.formatMultiNames([userWithWeapon], nameFormat) + '\'s';
          }
          if (!eventTry.message) {
            const weaponName =
                weaponEventPool[chosenWeapon].name || chosenWeapon;
            eventTry.message =
                weapons.message.replaceAll('{weapon}', owner + ' ' + weaponName)
                    .replaceAll('{action}', eventTry.action)
                    .replace(
                        /\[C([^|]*)\|([^\]]*)\]/g,
                        (consumed == 1 ? '$1' : '$2'));
          } else {
            eventTry.message = eventTry.message.replaceAll('{owner}', owner);
          }
        }
      }
    }

    const doBattle =
        ((!useWeapon && !doArenaEvent) || !eventTry) && userPool.length > 1 &&
        (Math.random() < this.game.options.probabilityOfBattle ||
         this.game.currentGame.numAlive == 2) &&
        !validateEventRequirements(
            1, 1, userPool, this.game.currentGame.numAlive,
            this.game.currentGame.teams, this.game.options, true, false);
    if (doBattle) {
      do {
        numAttacker = Simulator.weightedUserRand();
        numVictim = Simulator.weightedUserRand();
      } while (validateEventRequirements(
          numVictim, numAttacker, userPool, this.game.currentGame.numAlive,
          this.game.currentGame.teams, this.game.options, true, false));
      affectedUsers = pickAffectedPlayers(
          numVictim, numAttacker, 'dies', 'nothing', this.game.options,
          userPool, deadPool, this.game.currentGame.teams, null);
      eventTry = Battle.finalize(
          affectedUsers, numVictim, numAttacker, this.game.options.mentionAll,
          this.game, this.hg.getDefaultBattles());
    } else if (!useWeapon || !eventTry) {
      eventTry = pickEvent(
          userPool, userEventPool, this.game.options,
          this.game.currentGame.numAlive,
          this.game.currentGame.includedUsers.length,
          this.game.currentGame.teams, probOpts);
      if (!eventTry) {
        this.hg.error(
            'No event for ' + userPool.length + ' from ' +
            userEventPool.length + ' events. No weapon, Arena Event: ' +
            (doArenaEvent ? arenaEvent.message : 'No') + ', Day: ' +
            this.game.currentGame.day.num + ' Guild: ' + id + ' Retrying: ' +
            retry);
        this.game.currentGame.day.state = 0;
        this.game.currentGame.day.num--;
        if (retry) {
          this.go(cb, false);
        } else {
          this.hg.common.reply(
              this.msg, 'Oops! I wasn\'t able to find a valid event for the ' +
                  'remaining players.\nThis is usually because too many ' +
                  'events are disabled.\nIf you think this is a bug, ' +
                  'please tell SpikeyRobot#0971',
              'Try again with `' + this.msg.prefix + this.hg.postPrefix +
                  'next`.\n(Failed to find valid event for \'' +
                  (doArenaEvent ? arenaEvent.message : 'player events') +
                  '\' suitable for ' + userPool.length + ' remaining players)');
        }
        cb('Bad Configuration');
        return;
      }

      numAttacker = eventTry.attacker.count;
      numVictim = eventTry.victim.count;
      affectedUsers = pickAffectedPlayers(
          numVictim, numAttacker, eventTry.victim.outcome,
          eventTry.attacker.outcome, this.game.options, userPool, deadPool,
          this.game.currentGame.teams, null);
    }

    let numKilled = 0;
    let weapon = eventTry.victim.weapon;
    if (weapon && !weaponEventPool[weapon.name]) {
      weapon = null;
      eventTry.victim.weapon = null;
    }
    for (let i = 0; i < numVictim; i++) {
      let numKills = 0;
      if (eventTry.victim.killer) numKills = numAttacker;
      const affected = affectedUsers[i];
      switch (eventTry.victim.outcome) {
        case 'dies':
          numKilled++;
          killUser(this.game, affected, numKills, weapon);
          break;
        case 'wounded':
          woundUser(this.game, affected, numKills, weapon);
          break;
        case 'thrives':
          restoreUser(this.game, affected, numKills, weapon);
          break;
        case 'revived':
          reviveUser(this.game, affected, numKills, weapon);
          break;
        default:
          effectUser(this.game, affected, numKills, weapon);
          break;
      }
      if (affected.state == 'wounded') {
        affected.bleeding++;
      } else {
        affected.bleeding = 0;
      }
    }
    weapon = eventTry.attacker.weapon;
    if (weapon && !weaponEventPool[weapon.name]) {
      weapon = null;
      eventTry.attacker.weapon = null;
    }
    for (let i = numVictim; i < numVictim + numAttacker; i++) {
      let numKills = 0;
      if (eventTry.attacker.killer) numKills = numVictim;
      const affected = affectedUsers[i];
      switch (eventTry.attacker.outcome) {
        case 'dies':
          numKilled++;
          killUser(this.game, affected, numKills, weapon);
          break;
        case 'wounded':
          woundUser(this.game, affected, numKills, weapon);
          break;
        case 'thrives':
          restoreUser(this.game, affected, numKills, weapon);
          break;
        case 'revived':
          reviveUser(this.game, affected, numKills, weapon);
          break;
        default:
          effectUser(this.game, affected, numKills, weapon);
          break;
      }
      if (affected.state == 'wounded') {
        affected.bleeding++;
      } else {
        affected.bleeding = 0;
      }
    }

    let finalEvent = eventTry;

    if (eventTry.attacker.weapon) {
      for (let i = 0; i < numAttacker; i++) {
        const user = affectedUsers[numVictim + i];
        const consumableList =
            Object.entries(user.weapons || {[eventTry.attacker.weapon.name]: 0})
                .map((el) => {
                  const weaponName = el[0];
                  let consumableName = weaponName;
                  const count = el[1];
                  if (!weapons[weaponName]) {
                    this.hg.error('Failed to find weapon: ' + weaponName);
                    return '(Unknown weapon ' + weaponName +
                        '. This is a bug.)';
                  }
                  if (weapons[weaponName].consumable) {
                    consumableName = weapons[weaponName].consumable.replace(
                        /\[C([^|]*)\|([^\]]*)\]/g,
                        '$' + (count == 1 ? '1' : '2'));
                  } else if (count != 1) {
                    consumableName += 's';
                  }
                  return (count || 0) + ' ' + consumableName;
                })
                .join(', ');
        subMessage += '\n' + Grammar.formatMultiNames([user], nameFormat) +
            ' now has ' + consumableList + '.';
      }
    }
    if (eventTry.victim.weapon) {
      for (let i = 0; i < numVictim; i++) {
        const user = affectedUsers[i];
        const consumableList =
            Object.entries(user.weapons || {[eventTry.attacker.weapon.name]: 0})
                .map((el) => {
                  const weaponName = el[0];
                  let consumableName = weaponName;
                  const count = el[1];
                  if (!weapons[weaponName]) {
                    this.hg.error('Failed to find weapon: ' + weaponName);
                    return '(Unknown weapon ' + weaponName +
                        '. This is a bug.)';
                  }
                  if (weapons[weaponName].consumable) {
                    consumableName = weapons[weaponName].consumable.replace(
                        /\[C([^|]*)\|([^\]]*)\]/g,
                        '$' + (count == 1 ? '1' : '2'));
                  } else if (count != 1) {
                    consumableName += 's';
                  }
                  return (count || 0) + ' ' + consumableName;
                })
                .join(', ');
        subMessage += '\n' + Grammar.formatMultiNames([user], nameFormat) +
            ' now has ' + consumableList + '.';
      }
    }

    if (doBattle) {
      affectedUsers = [];
    } else {
      finalEvent = Event.finalize(
          eventTry.message, affectedUsers, numVictim, numAttacker,
          eventTry.victim.outcome, eventTry.attacker.outcome, this.game);
      finalEvent.subMessage = subMessage;
    }
    /* if (eventTry.attacker.killer && eventTry.victim.killer) {
      finalEvent.icons.splice(numVictim, 0, {url: fistBoth});
    } else if (eventTry.attacker.killer) {
      finalEvent.icons.splice(numVictim, 0, {url: fistRight});
    } else if (eventTry.victim.killer) {
      finalEvent.icons.splice(numVictim, 0, {url: fistLeft});
    } */
    this.game.currentGame.day.events.push(finalEvent);

    if (affectedUsers.length !== 0) {
      console.log('Affected users remain! ' + affectedUsers.length);
    }

    if (numKilled > 4) {
      this.game.currentGame.day.events.push(
          Event.finalizeSimple(this.hg.messages.get('slaughter'), this.game));
    }
  }

  if (doArenaEvent) {
    this.game.currentGame.day.events.push(
        Event.finalizeSimple(this.hg.messages.get('eventEnd'), this.game));
  }
  if (!this.game.currentGame.forcedOutcomes) {
    this.game.currentGame.forcedOutcomes = [];
  } else {
    this.game.currentGame.forcedOutcomes =
        this.game.currentGame.forcedOutcomes.filter((el) => {
          this.game.forcePlayerState(el, this.hg.messages);
          return el.persists;
        });
  }
  const usersBleeding = [];
  const usersRecovered = [];
  this.game.currentGame.includedUsers.forEach((obj) => {
    if (obj.bleeding > 0 && obj.bleeding >= this.game.options.bleedDays &&
        obj.living) {
      if (Math.random() < this.game.options.probabilityOfBleedToDeath &&
          (this.game.options.allowNoVictors ||
           this.game.currentGame.numAlive > 1)) {
        usersBleeding.push(obj);
        obj.living = false;
        obj.bleeding = 0;
        obj.state = 'dead';
        obj.rank = this.game.currentGame.numAlive--;
        obj.dayOfDeath = this.game.currentGame.day.num;
        if (this.game.options.teamSize > 0) {
          const team = this.game.currentGame.teams.find((team) => {
            return team.players.findIndex((player) => {
              return obj.id == player;
            }) > -1;
          });
          team.numAlive--;
          if (team.numAlive === 0) {
            let teamsLeft = 0;
            this.game.currentGame.teams.forEach((obj) => {
              if (obj.numAlive > 0) teamsLeft++;
            });
            team.rank = teamsLeft + 1;
          }
        }
      } else {
        usersRecovered.push(obj);
        obj.bleeding = 0;
        obj.state = 'normal';
      }
    }
  });
  if (usersRecovered.length > 0) {
    this.game.currentGame.day.events.push(
        Event.finalize(
            this.hg.messages.get('patchWounds'), usersRecovered,
            usersRecovered.length, 0, 'thrives', 'nothing', this.game));
  }
  if (usersBleeding.length > 0) {
    this.game.currentGame.day.events.push(
        Event.finalize(
            this.hg.messages.get('bleedOut'), usersBleeding,
            usersBleeding.length, 0, 'dies', 'nothing', this.game));
  }

  const deathPercentage = 1 - (this.game.currentGame.numAlive / startingAlive);
  if (deathPercentage > lotsOfDeathRate) {
    this.game.currentGame.day.events.splice(
        0, 0,
        Event.finalizeSimple(this.hg.messages.get('lotsOfDeath'), this.game));
  } else if (deathPercentage === 0) {
    this.game.currentGame.day.events.push(
        Event.finalizeSimple(this.hg.messages.get('noDeath'), this.game));
  } else if (deathPercentage < littleDeathRate) {
    this.game.currentGame.day.events.splice(
        0, 0,
        Event.finalizeSimple(this.hg.messages.get('littleDeath'), this.game));
  }
  this.game.currentGame.day.state = 2;
  cb();
};

/**
 * Produce a random number that is weighted by multiEventUserDistribution.
 *
 * @see {@link multiEventUserDistribution}
 *
 * @public
 * @returns {number} The weighted number outcome.
 */
Simulator.weightedUserRand = function() {
  let sum = 0;
  const r = Math.random();
  for (const i in multiEventUserDistribution) {
    if (typeof multiEventUserDistribution[i] !== 'number') {
      throw new Error(
          'Invalid value for multiEventUserDistribution:' +
          multiEventUserDistribution[i]);
    } else {
      sum += multiEventUserDistribution[i];
      if (r <= sum) return i * 1;
    }
  }
};
Simulator.prototype.weightedUserRand = Simulator.weightedUserRand;

/**
 * Pick the players to put into an event.
 *
 * @private
 * @param {number} numVictim Number of victims in this event.
 * @param {number} numAttacker Number of attackers in this event.
 * @param {string} victimOutcome Outcome of victims. If "revived", uses deadPool
 * instead of userPool.
 * @param {string} attackerOutcome Outcome of attackers. If "revived", uses
 * deadPool instead of userPool.
 * @param {Object} options Options for this game.
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
function pickAffectedPlayers(
    numVictim, numAttacker, victimOutcome, attackerOutcome, options, userPool,
    deadPool, teams, weaponWielder) {
  const affectedUsers = [];
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
      if (i < numVictim && victimRevived) {
        const userIndex = Math.floor(Math.random() * deadPool.length);
        affectedUsers.push(deadPool.splice(userIndex, 1)[0]);
      } else if (i >= numVictim && attackerRevived) {
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
      const wielderIndex = userPool.findIndex((u) => {
        return u.id == weaponWielder.id;
      });
      affectedUsers.push(userPool.splice(wielderIndex, 1)[0]);
    }
  }
  return affectedUsers;
}
/**
 * Base of all actions to perform on a player.
 *
 * @private
 *
 * @param {HungryGames~GuildGame} game Current GuildGame being affected.
 * @param {HungryGames~Player} affected The player to affect.
 * @param {number} kills The number of kills the player gets in this action.
 * @param {HungryGames~Weapon[]} [weapon] The weapon being used if any.
 */
function effectUser(game, affected, kills, weapon) {
  if (weapon) {
    if (typeof affected.weapons[weapon.name] === 'number') {
      affected.weapons[weapon.name] += weapon.count;
    } else {
      affected.weapons[weapon.name] = weapon.count;
    }
    if (affected.weapons[weapon.name] === 0) {
      delete affected.weapons[weapon.name];
    }
  }
  affected.kills += kills;
}

/**
 * Kill the given player in the given guild game.
 *
 * @private
 *
 * @param {HungryGames~GuildGame} game Current GuildGame being affected.
 * @param {HungryGames~Player} a The player to affect.
 * @param {number} k The number of kills the player gets in this action.
 * @param {HungryGames~Weapon[]} [w] The weapon being used if any.
 */
function killUser(game, a, k, w) {
  effectUser(game, a, k, w);
  a.living = false;
  a.bleeding = 0;
  a.state = 'dead';
  a.weapons = {};
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
}

/**
 * Wound the given player in the given guild game.
 *
 * @private
 *
 * @param {HungryGames~GuildGame} game Current GuildGame being affected.
 * @param {HungryGames~Player} a The player to affect.
 * @param {number} k The number of kills the player gets in this action.
 * @param {HungryGames~Weapon[]} [w] The weapon being used if any.
 */
function woundUser(game, a, k, w) {
  effectUser(game, a, k, w);
  a.state = 'wounded';
}
/**
 * Heal the given player in the given guild game.
 *
 * @private
 *
 * @param {HungryGames~GuildGame} game Current GuildGame being affected.
 * @param {HungryGames~Player} a The player to affect.
 * @param {number} k The number of kills the player gets in this action.
 * @param {HungryGames~Weapon[]} [w] The weapon being used if any.
 */
function restoreUser(game, a, k, w) {
  effectUser(game, a, k, w);
  a.state = 'normal';
  a.bleeding = 0;
}
/**
 * Revive the given player in the given guild game.
 *
 * @private
 *
 * @param {HungryGames~GuildGame} game Current GuildGame being affected.
 * @param {HungryGames~Player} a The player to affect.
 * @param {number} k The number of kills the player gets in this action.
 * @param {HungryGames~Weapon[]} [w] The weapon being used if any.
 */
function reviveUser(game, a, k, w) {
  effectUser(game, a, k, w);
  game.currentGame.numAlive++;
  game.currentGame.includedUsers.forEach((obj) => {
    if (!obj.living && obj.rank < a.rank) obj.rank++;
  });
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
  a.state = 'zombie';
  a.living = true;
  a.bleeding = 0;
  a.rank = 1;
}

/**
 * Pick event that satisfies all requirements and settings.
 *
 * @private
 * @param {HungryGames~Player[]} userPool Pool of players left to chose from
 * in this day.
 * @param {HungryGames~Event[]} eventPool Pool of all events available to
 * choose at this time.
 * @param {Object} options The options set in the current game.
 * @param {number} numAlive Number of players in the game still alive.
 * @param {number} numTotal Number of players in the game total.
 * @param {HungryGames~Team[]} teams Array of teams in this game.
 * @param {HungryGames~OutcomeProbabilities} probOpts Death rate weights.
 * @param {?Player} weaponWielder A player that is using a weapon in this
 * event, or null if no player is using a weapon.
 * @returns {?HungryGames~Event} The chosen event that satisfies all
 * requirements, or null if something went wrong.
 */
function pickEvent(
    userPool, eventPool, options, numAlive, numTotal, teams, probOpts,
    weaponWielder) {
  const fails = [];
  let loop = 0;
  while (loop < 100) {
    loop++;
    if (eventPool) eventPool = eventPool.filter((el) => el);
    if (!eventPool || eventPool.length == 0) {
      fails.push('No Events');
      break;
    }
    const eventIndex =
        probabilityEvent(eventPool, probOpts, options.customEventWeight);
    const eventTry = eventPool[eventIndex];
    if (!eventTry) {
      if (fails.length < 3) {
        console.error('Invalid Event:', eventTry);
      }
      fails.push('Invalid Event');
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
      fails.push(
          'Event too large (' + eventEffectsNumMin + ' > ' + userPool.length +
          '): ' + eventIndex + ' V:' + eventTry.victim.count + ' A:' +
          eventTry.attacker.count + ' M:' + eventTry.message);
      continue;
    } else if (eventRevivesNumMin > numTotal - numAlive) {
      fails.push(
          'Event too large (' + eventRevivesNumMin + ' > ' +
          (numTotal - numAlive) + '): ' + eventIndex + ' V:' +
          eventTry.victim.count + ' A:' + eventTry.attacker.count + ' M:' +
          eventTry.message);
      continue;
    }

    const multiAttacker = numAttacker < 0;
    const multiVictim = numVictim < 0;
    const attackerMin = -numAttacker;
    const victimMin = -numVictim;
    if (multiAttacker || multiVictim) {
      while (true) {
        if (multiAttacker) {
          numAttacker = Simulator.weightedUserRand() + (attackerMin - 1);
        }
        if (multiVictim) {
          numVictim = Simulator.weightedUserRand() + (victimMin - 1);
        }
        if (victimRevived && attackerRevived) {
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
    }

    const failReason = validateEventRequirements(
        victimRevived ? 0 : numVictim, attackerRevived ? 0 : numAttacker,
        userPool, numAlive, teams, options, eventTry.victim.outcome == 'dies',
        eventTry.attacker.outcome == 'dies', weaponWielder);
    if (failReason) {
      fails.push(
          'Fails event requirement validation: ' + eventIndex + ' ' +
          failReason);
      continue;
    }

    const finalEvent = JSON.parse(JSON.stringify(eventPool[eventIndex]));

    finalEvent.attacker.count = numAttacker;
    finalEvent.victim.count = numVictim;

    return finalEvent;
  }
  self.error(
      'Failed to find suitable event for ' + userPool.length +
      ' players, from ' + eventPool.length + ' events with ' + numAlive +
      ' alive.');
  // console.error(fails);
  return null;
}
/**
 * Ensure teammates don't attack each other.
 *
 * @private
 * @param {number} numVictim The number of victims in the event.
 * @param {number} numAttacker The number of attackers in the event.
 * @param {HungryGames~Player[]} userPool Pool of all remaining players to put
 * into an event.
 * @param {HungryGames~Team[]} teams All teams in this game.
 * @param {Object} options Options for this game.
 * @param {boolean} victimsDie Do the victims die in this event?
 * @param {boolean} attackersDie Do the attackers die in this event?
 * @param {?Player} weaponWielder A player that is using a weapon in this
 * event, or null if no player is using a weapon.
 * @returns {?string} String describing failing check, or null of pass.
 */
function validateEventTeamConstraint(
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
          if (userPool.findIndex((pool) => {
            return pool.id == player && pool.living;
          }) > -1) {
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
}
/**
 * Ensure the event we choose will not force all players to be dead.
 *
 * @private
 * @param {number} numVictim Number of victims in this event.
 * @param {number} numAttacker Number of attackers in this event.
 * @param {number} numAlive Total number of living players left in the game.
 * @param {Object} options The options set for this game.
 * @param {boolean} victimsDie Do the victims die in this event?
 * @param {boolean} attackersDie Do the attackers die in this event?
 * @returns {boolean} Will this event follow current options set about number
 * of victors required.
 */
function validateEventVictorConstraint(
    numVictim, numAttacker, numAlive, options, victimsDie, attackersDie) {
  if (!options.allowNoVictors) {
    let numRemaining = numAlive;
    if (victimsDie) numRemaining -= numVictim;
    if (attackersDie) numRemaining -= numAttacker;
    return numRemaining >= 1;
  }
  return true;
}
/**
 * Ensure the number of users in an event is mathematically possible.
 *
 * @private
 * @param {number} numVictim Number of victims in this event.
 * @param {number} numAttacker Number of attackers in this event.
 * @param {HungryGames~Player[]} userPool Pool of all remaining players to put
 * into an event.
 * @param {number} numAlive Total number of living players left in the game.
 * @returns {boolean} If the event requires a number of players that is valid
 * from the number of players left to choose from.
 */
function validateEventNumConstraint(
    numVictim, numAttacker, userPool, numAlive) {
  return numVictim + numAttacker <= userPool.length &&
      numVictim + numAttacker <= numAlive;
}
/**
 * Ensure the event chosen meets all requirements for actually being used in
 * the current game.
 *
 * @private
 * @param {number} numVictim Number of victims in this event.
 * @param {number} numAttacker Number of attackers in this event.
 * @param {HungryGames~Player[]} userPool Pool of all remaining players to put
 * into an event.
 * @param {number} numAlive Total number of living players left in the game.
 * @param {HungryGames~Team[]} teams All teams in this game.
 * @param {Object} options The options set for this game.
 * @param {boolean} victimsDie Do the victims die in this event?
 * @param {boolean} attackersDie Do the attackers die in this event?
 * @param {?Player} weaponWielder A player that is using a weapon in this
 * event, or null if no player is using a weapon.
 * @returns {?string} String of failing constraint check, or null if passes.
 */
function validateEventRequirements(
    numVictim, numAttacker, userPool, numAlive, teams, options, victimsDie,
    attackersDie, weaponWielder) {
  if (!validateEventNumConstraint(numVictim, numAttacker, userPool, numAlive)) {
    return 'NUM_CONSTRAINT';
  }
  const failReason = validateEventTeamConstraint(
      numVictim, numAttacker, userPool, teams, options, victimsDie,
      attackersDie, weaponWielder);
  if (failReason) {
    return 'TEAM_CONSTRAINT-' + failReason;
  }
  if (!validateEventVictorConstraint(
      numVictim, numAttacker, numAlive, options, victimsDie,
      attackersDie)) {
    return 'VICTOR_CONSTRAINT';
  }
  return null;
}

/**
 * Produce a random event that using probabilities set in options.
 *
 * @private
 * @param {HungryGames~Event[]} eventPool The pool of all events to consider.
 * @param {{kill: number, wound: number, thrive: number, nothing: number}}
 * probabilityOpts The probabilities of each type of event being used.
 * @param {number} [customWeight=1] The weight of custom events.
 * @param {number} [recurse=0] The current recursive depth.
 * @returns {number} The index of the event that was chosen.
 */
function probabilityEvent(
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
      return probabilityEvent(
          eventPool, probabilityOpts, customWeight, recurse + 1);
    } else {
      self.error(
          'Failed to find event with probabilities: ' +
          JSON.stringify(probabilityOpts) + ' from ' + eventPool.length +
          ' events.');
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
}

module.exports = Simulator;
