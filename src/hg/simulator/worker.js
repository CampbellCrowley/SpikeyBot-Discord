// Copyright 2018-2019 Campbell Crowley. All rights reserved.
// Author: Campbell Crowley (dev@campbellcrowley.com)
const {workerData, parentPort} = require('worker_threads');
const Event = require('../Event.js');
const Battle = require('../Battle.js');
const Grammar = require('../Grammar.js');
const Simulator = require('../Simulator.js');
const GuildGame = require('../GuildGame.js');

/**
 * @description Asyncronous worker that does the actual simulating.
 * @memberof HungryGames~Simulator
 * @inner
 */
class Worker {
  /**
   * @description Create and start simulating.
   * @param {{
   * game: object,
   * messages: object.<string>
   * }} sim Simulation data.
   * @param {boolean} [retry=true] Whether to try again if there is an error.
   */
  constructor(sim, retry = true) {
    sim.game.currentGame.day.state = 1;
    sim.game.currentGame.day.num++;
    sim.game.currentGame.day.events = [];

    sim.messages = {
      _messages: sim.messages,
      /**
       * Get a random message of a given type.
       *
       * @public
       * @param {string} type The message type to get.
       * @returns {string} A random message of the given type.
       */
      get(type) {
        const list = this._messages[type];
        if (!list) return 'badtype';
        const length = list.length;
        if (length == 0) return 'nomessage';
        return list[Math.floor(Math.random() * length)];
      },
    };

    const id = sim.game.id;

    const userPool =
        sim.game.currentGame.includedUsers.filter((obj) => obj.living);
    // Shuffle user order because games may have been rigged :thonk:.
    for (let i = 0; i < userPool.length; i++) {
      const index = Math.floor(Math.random() * (userPool.length - i)) + i;
      const tmp = userPool[i];
      userPool[i] = userPool[index];
      userPool[index] = tmp;
    }
    const teams = sim.game.currentGame.teams;
    // Shuffle team order because games may have been rigged :hyperthonk:.
    for (let i = 0; i < teams.length; i++) {
      const index = Math.floor(Math.random() * (teams.length - i)) + i;
      const tmp = teams[i];
      teams[i] = teams[index];
      teams[index] = tmp;
    }
    const startingAlive = userPool.length;
    let userEventPool;
    let doArenaEvent = false;
    let arenaEvent;

    if (sim.game.currentGame.day.num === 0) {
      userEventPool =
          sim.events.bloodbath.concat(sim.game.customEvents.bloodbath);
      if (sim.game.disabledEvents && sim.game.disabledEvents.bloodbath) {
        userEventPool = userEventPool.filter((el) => {
          return !sim.game.disabledEvents.bloodbath.find((d) => {
            return Event.equal(d, el);
          });
        });
      }
      if (userEventPool.length == 0) {
        this.cb({
          reply: 'All bloodbath events have been disabled! Please enable ' +
              'events so that something can happen in the games!',
          endGame: true,
          reason: 'No Bloodbath Events',
        });
        return;
      }
    } else {
      doArenaEvent = startingAlive > 2 && sim.game.options.arenaEvents &&
          Math.random() < sim.game.options.probabilityOfArenaEvent;
      if (doArenaEvent) {
        const arenaEventPool =
            sim.events.arena.concat(sim.game.customEvents.arena);
        do {
          let total = arenaEventPool.length;
          if (sim.game.options.customEventWeight != 1) {
            arenaEventPool.forEach((el) => {
              if (el.custom) {
                total += sim.game.options.customEventWeight - 1;
              }
            });
          }
          const pick = Math.random() * total;
          const index = arenaEventPool.findIndex((el) => {
            total -= el.custom ? sim.game.options.customEventWeight : 1;
            if (total < pick) return true;
            return false;
          });
          arenaEvent = arenaEventPool[index];
          userEventPool = arenaEvent.outcomes;
          if (sim.game.disabledEvents && sim.game.disabledEvents.arena &&
              sim.game.disabledEvents.arena[arenaEvent.message]) {
            userEventPool = userEventPool.filter((el) => {
              return !sim.game.disabledEvents.arena[arenaEvent.message].find(
                  (d) => Event.equal(d, el));
            });
          }
          if (userEventPool.length == 0) {
            arenaEventPool.splice(index, 1);
          } else {
            sim.game.currentGame.day.events.push(
                Event.finalizeSimple(sim.messages.get('eventStart'), sim.game));
            sim.game.currentGame.day.events.push(
                Event.finalizeSimple(
                    `**___${arenaEvent.message}___**`, sim.game));
            break;
          }
        } while (arenaEventPool.length > 0);
        if (arenaEventPool.length == 0) doArenaEvent = false;
      }
      if (!doArenaEvent) {
        userEventPool = sim.events.player.concat(sim.game.customEvents.player);
        if (sim.game.disabledEvents && sim.game.disabledEvents.player) {
          userEventPool = userEventPool.filter((el) => {
            return !sim.game.disabledEvents.player.find((d) => {
              return Event.equal(d, el);
            });
          });
        }
        if (userEventPool.length == 0) {
          this.cb({
            reply:
                'All player events have been disabled! Please enable events' +
                ' so that something can happen in the games!',
            endGame: true,
            reason: 'No Player Events',
          });
          return;
        }
      }
    }

    const weapons = Object.assign({}, sim.events.weapons);
    if (sim.game.customEvents.weapon) {
      const entries = Object.entries(sim.game.customEvents.weapon);
      for (let i = 0; i < entries.length; i++) {
        if (weapons[entries[i][0]]) {
          weapons[entries[i][0]].outcomes =
              weapons[entries[i][0]].outcomes.concat(entries[i][1].outcomes);
        } else {
          weapons[entries[i][0]] = entries[i][1];
        }

        if (sim.game.disabledEvents && sim.game.disabledEvents.weapon &&
            sim.game.disabledEvents.weapon[entries[i][0]]) {
          weapons[entries[i][0]].outcomes =
              weapons[entries[i][0]].outcomes.filter((el) => {
                return !sim.game.disabledEvents.weapon[entries[i][0]].find(
                    (d) => {
                      return Event.equal(d, el);
                    });
              });
        }
      }
    }

    const probOpts = sim.game.currentGame.day.num === 0 ?
        sim.game.options.bloodbathOutcomeProbs :
        (doArenaEvent ?
             (arenaEvent.outcomeProbs || sim.game.options.arenaOutcomeProbs) :
             sim.game.options.playerOutcomeProbs);

    const nameFormat = sim.game.options.useNicknames ? 'nickname' : 'username';

    while (userPool.length > 0) {
      let eventTry;
      let affectedUsers;
      let numAttacker;
      let numVictim;

      let subMessage = '';

      const deadPool = sim.game.currentGame.includedUsers.filter((obj) => {
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
          userWithWeapon = usersWithWeapon[Math.floor(
              Math.random() * usersWithWeapon.length)];
        }
      }
      let useWeapon = userWithWeapon &&
          Math.random() < sim.game.options.probabilityOfUseWeapon;
      if (useWeapon) {
        const userWeapons = Object.keys(userWithWeapon.weapons);
        const chosenWeapon =
            userWeapons[Math.floor(Math.random() * userWeapons.length)];

        if (!weapons[chosenWeapon]) {
          useWeapon = false;
          // console.log('No event pool with weapon', chosenWeapon);
        } else {
          eventTry = Simulator._pickEvent(
              userPool, weapons[chosenWeapon].outcomes, sim.game.options,
              sim.game.currentGame.numAlive,
              sim.game.currentGame.includedUsers.length, teams, probOpts,
              userWithWeapon, chosenWeapon);
          if (!eventTry) {
            useWeapon = false;
            /* self.error(
                'No event with weapon "' + chosenWeapon +
                '" for available players ' + id); */
          } else {
            numAttacker = eventTry.attacker.count;
            numVictim = eventTry.victim.count;
            affectedUsers = Simulator._pickAffectedPlayers(
                numVictim, numAttacker, eventTry.victim.outcome,
                eventTry.attacker.outcome, sim.game.options, userPool, deadPool,
                teams, userWithWeapon, chosenWeapon);

            const consumed = Simulator._parseConsumeCount(
                eventTry.consumes, numVictim, numAttacker);
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
              owner = Grammar.formatMultiNames([userWithWeapon], nameFormat) +
                  '\'s';
            }
            if (!eventTry.message) {
              const weaponName = weapons[chosenWeapon].name || chosenWeapon;
              eventTry.message =
                  weapons.message
                      .replace(/\{weapon\}/g, owner + ' ' + weaponName)
                      .replace(/\{action\}/g, eventTry.action)
                      .replace(
                          /\[C([^|]*)\|([^\]]*)\]/g,
                          (consumed == 1 ? '$1' : '$2'));
            } else {
              eventTry.message = eventTry.message.replace(/\{owner\}/g, owner);
            }
          }
        }
      }

      const doBattle = ((!useWeapon && !doArenaEvent) || !eventTry) &&
          userPool.length > 1 &&
          (Math.random() < sim.game.options.probabilityOfBattle ||
           sim.game.currentGame.numAlive == 2) &&
          !Simulator._validateEventRequirements(
              1, 1, userPool, sim.game.currentGame.numAlive, teams,
              sim.game.options, true, false);
      if (doBattle) {
        do {
          numAttacker = Simulator.weightedUserRand();
          numVictim = Simulator.weightedUserRand();
        } while (Simulator._validateEventRequirements(
            numVictim, numAttacker, userPool, sim.game.currentGame.numAlive,
            teams, sim.game.options, true, false));
        affectedUsers = Simulator._pickAffectedPlayers(
            numVictim, numAttacker, 'dies', 'nothing', sim.game.options,
            userPool, deadPool, teams, null);
        eventTry = Battle.finalize(
            affectedUsers, numVictim, numAttacker, sim.game.options.mentionAll,
            sim.game, sim.events.battles);
      } else if (!useWeapon || !eventTry) {
        eventTry = Simulator._pickEvent(
            userPool, userEventPool, sim.game.options,
            sim.game.currentGame.numAlive,
            sim.game.currentGame.includedUsers.length, teams, probOpts);
        if (!eventTry) {
          console.error(
              'No event for ' + userPool.length + ' from ' +
              userEventPool.length + ' events. No weapon, Arena Event: ' +
              (doArenaEvent ? arenaEvent.message : 'No') + ', Day: ' +
              sim.game.currentGame.day.num + ' Guild: ' + id + ' Retrying: ' +
              retry);
          sim.game.currentGame.day.state = 0;
          sim.game.currentGame.day.num--;
          if (retry) {
            return new Worker(sim, false);
          }
          this.cb({
            reply: 'Oops! I wasn\'t able to find a valid event for the ' +
                'remaining players.\nThis is usually because too many ' +
                'events are disabled.\nIf you think this is a bug, ' +
                'please tell SpikeyRobot#0971',
            reply2: 'Try again with `{prefix}next`.\n(Failed to find valid ' +
                'event for \'' +
                (doArenaEvent ? arenaEvent.message : 'player events') +
                '\' suitable for ' + userPool.length + ' remaining players)',
            reason: 'Bad Configuration',
          });
          return;
        }

        numAttacker = eventTry.attacker.count;
        numVictim = eventTry.victim.count;
        affectedUsers = Simulator._pickAffectedPlayers(
            numVictim, numAttacker, eventTry.victim.outcome,
            eventTry.attacker.outcome, sim.game.options, userPool, deadPool,
            teams, null);
      }

      let numKilled = 0;
      let weapon = eventTry.victim.weapon;
      if (weapon && !weapons[weapon.name]) {
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
            Simulator._killUser(sim.game, affected, numKills, weapon);
            break;
          case 'wounded':
            Simulator._woundUser(sim.game, affected, numKills, weapon);
            break;
          case 'thrives':
            Simulator._restoreUser(sim.game, affected, numKills, weapon);
            break;
          case 'revived':
            Simulator._reviveUser(sim.game, affected, numKills, weapon);
            break;
          default:
            Simulator._effectUser(sim.game, affected, numKills, weapon);
            break;
        }
        if (affected.state == 'wounded') {
          affected.bleeding++;
        } else {
          affected.bleeding = 0;
        }
      }
      weapon = eventTry.attacker.weapon;
      if (weapon && !weapons[weapon.name]) {
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
            Simulator._killUser(sim.game, affected, numKills, weapon);
            break;
          case 'wounded':
            Simulator._woundUser(sim.game, affected, numKills, weapon);
            break;
          case 'thrives':
            Simulator._restoreUser(sim.game, affected, numKills, weapon);
            break;
          case 'revived':
            Simulator._reviveUser(sim.game, affected, numKills, weapon);
            break;
          default:
            Simulator._effectUser(sim.game, affected, numKills, weapon);
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
              Object
                  .entries(user.weapons || {[eventTry.attacker.weapon.name]: 0})
                  .map((el) => {
                    const weaponName = el[0];
                    let consumableName = weaponName;
                    const count = el[1];
                    if (!weapons[weaponName]) {
                      console.error('1 Failed to find weapon: ' + weaponName);
                      return `(Unknown weapon ${weaponName}. This is a bug.)`;
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
              Object
                  .entries(user.weapons || {[eventTry.victim.weapon.name]: 0})
                  .map((el) => {
                    const weaponName = el[0];
                    let consumableName = weaponName;
                    const count = el[1];
                    if (!weapons[weaponName]) {
                      console.error('2 Failed to find weapon: ' + weaponName);
                      return `(Unknown weapon ${weaponName}. This is a bug.)`;
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
            eventTry.victim.outcome, eventTry.attacker.outcome, sim.game);
        finalEvent.subMessage = subMessage;
      }
      /* if (eventTry.attacker.killer && eventTry.victim.killer) {
        finalEvent.icons.splice(numVictim, 0, {url: fistBoth});
      } else if (eventTry.attacker.killer) {
        finalEvent.icons.splice(numVictim, 0, {url: fistRight});
      } else if (eventTry.victim.killer) {
        finalEvent.icons.splice(numVictim, 0, {url: fistLeft});
      } */
      sim.game.currentGame.day.events.push(finalEvent);

      if (affectedUsers.length !== 0) {
        console.log('Affected users remain! ' + affectedUsers.length);
      }

      if (numKilled > 4) {
        sim.game.currentGame.day.events.push(
            Event.finalizeSimple(sim.messages.get('slaughter'), sim.game));
      }
    }

    if (doArenaEvent) {
      sim.game.currentGame.day.events.push(
          Event.finalizeSimple(sim.messages.get('eventEnd'), sim.game));
    }
    if (!sim.game.currentGame.forcedOutcomes) {
      sim.game.currentGame.forcedOutcomes = [];
    } else {
      sim.game.currentGame.forcedOutcomes =
          sim.game.currentGame.forcedOutcomes.filter((el) => {
            if (typeof el.text !== 'string') el.text = sim.events.player;
            GuildGame.forcePlayerState(
                sim.game, el, sim.messages, sim.events.player);
            return el.persists;
          });
    }
    const usersBleeding = [];
    const usersRecovered = [];
    sim.game.currentGame.includedUsers.forEach((obj) => {
      if (obj.bleeding > 0 && obj.bleeding >= sim.game.options.bleedDays &&
          obj.living) {
        if (Math.random() < sim.game.options.probabilityOfBleedToDeath &&
            (sim.game.options.allowNoVictors ||
             sim.game.currentGame.numAlive > 1)) {
          usersBleeding.push(obj);
          obj.living = false;
          obj.bleeding = 0;
          obj.state = 'dead';
          obj.rank = sim.game.currentGame.numAlive--;
          obj.dayOfDeath = sim.game.currentGame.day.num;
          if (sim.game.options.teamSize > 0) {
            const team = teams.find((team) => {
              return team.players.findIndex((player) => {
                return obj.id == player;
              }) > -1;
            });
            team.numAlive--;
            if (team.numAlive === 0) {
              let teamsLeft = 0;
              teams.forEach((obj) => {
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
      sim.game.currentGame.day.events.push(
          Event.finalize(
              sim.messages.get('patchWounds'), usersRecovered,
              usersRecovered.length, 0, 'thrives', 'nothing', sim.game));
    }
    if (usersBleeding.length > 0) {
      sim.game.currentGame.day.events.push(
          Event.finalize(
              sim.messages.get('bleedOut'), usersBleeding, usersBleeding.length,
              0, 'dies', 'nothing', sim.game));
    }

    const deathPercentage =
        1 - (sim.game.currentGame.numAlive / startingAlive);
    if (deathPercentage > Simulator._lotsOfDeathRate) {
      sim.game.currentGame.day.events.splice(
          0, 0,
          Event.finalizeSimple(sim.messages.get('lotsOfDeath'), sim.game));
    } else if (deathPercentage === 0) {
      sim.game.currentGame.day.events.push(
          Event.finalizeSimple(sim.messages.get('noDeath'), sim.game));
    } else if (deathPercentage < Simulator._littleDeathRate) {
      sim.game.currentGame.day.events.splice(
          0, 0,
          Event.finalizeSimple(sim.messages.get('littleDeath'), sim.game));
    }
    sim.game.currentGame.day.state = 2;
    this.cb({game: sim.game});
  }
  /**
   * @description Pass a message back to the parent.
   * @public
   * @param {*} [data] Data to send to the parent.
   */
  cb(data) {
    parentPort.postMessage(data);
  }
}

module.exports = new Worker(workerData);
