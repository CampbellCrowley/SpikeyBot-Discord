// Copyright 2018-2019 Campbell Crowley. All rights reserved.
// Author: Campbell Crowley (dev@campbellcrowley.com)
const {workerData, parentPort} = require('worker_threads');
const Event = require('../Event.js');
const Day = require('../Day.js');
const Battle = require('../Battle.js');
const Grammar = require('../Grammar.js');
const Simulator = require('../Simulator.js');

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
    sim.game.currentGame.prevDay = sim.game.currentGame.day;
    sim.game.currentGame.day = Day.from(sim.game.currentGame.nextDay);
    sim.game.currentGame.day.state = 1;

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

    let startingAlive = 0;
    let numAlive = 0;

    const deadPool =
        sim.game.currentGame.includedUsers.filter((obj) => !obj.living);
    const userPool = sim.game.currentGame.includedUsers.filter((player) => {
      if (player.living) startingAlive++;

      player.simWeapons = Object.assign({}, player.weapons);

      let isV = false;
      const evt = sim.game.currentGame.day.events.find((el) => {
        const icon = el.icons.find((icon) => icon.id === player.id);
        if (icon) isV = icon.settings.victim;
        return icon;
      });
      if (player.living) {
        if (!evt) {
          numAlive++;
        } else if (isV && evt.victim.outcome !== 'dies') {
          numAlive++;
        } else if (!isV && evt.attacker.outcome !== 'dies') {
          numAlive++;
        }
      } else if (evt) {
        if (isV && evt.victim.outcome === 'revived') {
          numAlive++;
        } else if (!isV && evt.attacker.outcome === 'revived') {
          numAlive++;
        }
      }
      return player.living && !evt;
    });
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
      }
    }
    if (sim.game.disabledEvents && sim.game.disabledEvents.weapon) {
      const entries = Object.entries(sim.game.disabledEvents.weapon);
      for (let i = 0; i < entries.length; i++) {
        if (!weapons[entries[i][0]]) continue;
        weapons[entries[i][0]].outcomes =
            weapons[entries[i][0]].outcomes.filter(
                (el) => !sim.game.disabledEvents.weapon[entries[i][0]].find(
                    (d) => Event.equal(d, el)));
        if (weapons[entries[i][0]].outcomes.length === 0) {
          delete weapons[entries[i][0]];
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
              numAlive, sim.game.currentGame.includedUsers.length, teams,
              probOpts, userWithWeapon, chosenWeapon);
          if (!eventTry) {
            useWeapon = false;
            /* self.error(
                'No event with weapon "' + chosenWeapon +
                '" for available players ' + id); */
          } else {
            affectedUsers = Simulator._pickAffectedPlayers(
                eventTry, sim.game.options, userPool, deadPool, teams,
                userWithWeapon, chosenWeapon);

            eventTry.consumer = userWithWeapon.id;
            eventTry.consumes = [{
              name: chosenWeapon,
              count: Simulator._parseConsumeCount(
                  eventTry.consumes, eventTry.victim.count,
                  eventTry.attacker.count),
            }];

            const firstAttacker = affectedUsers[eventTry.victim.count] &&
                affectedUsers[eventTry.victim.count].id == userWithWeapon.id;
            eventTry.subMessage = Simulator.formatWeaponEvent(
                eventTry, userWithWeapon,
                Grammar.formatMultiNames([userWithWeapon], nameFormat),
                firstAttacker, chosenWeapon, weapons);

            userWithWeapon.weapons[chosenWeapon] -= eventTry.consumes.count;
            if (userWithWeapon.weapons[chosenWeapon] <= 0) {
              delete userWithWeapon.weapons[chosenWeapon];
            }
          }
        }
      }

      const doBattle = ((!useWeapon && !doArenaEvent) || !eventTry) &&
          userPool.length > 1 &&
          (Math.random() < sim.game.options.probabilityOfBattle ||
           (startingAlive == 2 && numAlive == 2)) &&
          !Simulator._validateEventRequirements(
              1, 1, userPool, numAlive, teams, sim.game.options, true, false);
      if (doBattle) {
        let numVictim;
        let numAttacker;
        do {
          numAttacker = Simulator.weightedUserRand();
          numVictim = Simulator.weightedUserRand();
        } while (Simulator._validateEventRequirements(
            numVictim, numAttacker, userPool, numAlive, teams, sim.game.options,
            true, false));

        affectedUsers = Simulator._pickAffectedPlayers(
            new Event('', numVictim, numAttacker, 'dies', 'nothing'),
            sim.game.options, userPool, deadPool, teams, null);
        eventTry = Battle.finalize(
            affectedUsers, numVictim, numAttacker, sim.game.options.mentionAll,
            sim.game, sim.events.battles);
      } else if (!useWeapon || !eventTry) {
        eventTry = Simulator._pickEvent(
            userPool, userEventPool, sim.game.options, numAlive,
            sim.game.currentGame.includedUsers.length, teams, probOpts);
        if (!eventTry) {
          console.error(
              'No event for ' + userPool.length + ' from ' +
              userEventPool.length + ' events. No weapon, Arena Event: ' +
              (doArenaEvent ? arenaEvent.message : 'No') + ', Day: ' +
              sim.game.currentGame.day.num + ' Guild: ' + id + ' Retrying: ' +
              retry);
          sim.game.currentGame.day.state = 0;

          if (retry) return new Worker(sim, false);

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

        affectedUsers = Simulator._pickAffectedPlayers(
            eventTry, sim.game.options, userPool, deadPool, teams, null);
      }

      if (!doBattle) {
        eventTry = eventTry.finalize(sim.game, affectedUsers);
      }

      sim.game.currentGame.day.events.push(eventTry);

      const numKilled =
          (eventTry.attacker.outcome === 'dies' ? eventTry.attacker.count : 0) +
          (eventTry.victim.outcome === 'dies' ? eventTry.victim.count : 0);
      numAlive -= numKilled;
      if (numKilled > 4) {
        sim.game.currentGame.day.events.push(
            Event.finalizeSimple(sim.messages.get('slaughter'), sim.game));
      }

      const numRevived =
          (eventTry.attacker.outcome === 'revived' ? eventTry.attacker.count :
                                                     0) +
          (eventTry.victim.outcome === 'revived' ? eventTry.victim.count : 0);
      numAlive += numRevived;
    }

    if (doArenaEvent) {
      sim.game.currentGame.day.events.push(
          Event.finalizeSimple(sim.messages.get('eventEnd'), sim.game));
    }

    // Apply outcomes.
    sim.game.currentGame.day.events.forEach((evt) => {
      const affected = [];
      evt.icons.forEach((icon) => {
        if (!icon.id) return;
        const player =
            sim.game.currentGame.includedUsers.find((p) => p.id === icon.id);
        if (!player) return;
        if (player.simWeapons) {
          player.weapons = player.simWeapons;
          delete player.simWeapons;
        }
        affected.push(player);
        const isV = icon.settings.victim;
        const isA = icon.settings.attacker;
        const group = (isA && evt.attacker) || (isV && evt.victim);
        const other = (isA && evt.victim) || (isV && evt.attacker);
        Simulator._applyOutcome(
            sim.game, player, group.killer ? other.count : 0, null,
            group.outcome);

        if (evt.consumes && evt.consumes.length > 0) {
          const consumer = sim.game.currentGame.includedUsers.find(
              (p) => p.id === evt.consumer);
          if (consumer) {
            for (const consumed of evt.consumes) {
              if (consumer.weapons[consumed.name]) {
                const count = consumed.count;
                consumer.weapons[consumed.name] -= count;
                if (consumer.weapons[consumed.name] <= 0) {
                  delete consumer.weapons[consumed.name];
                }
              }
            }
          }
        }
        if (group.weapons && group.weapons.length > 0) {
          for (const w of group.weapons) {
            if (player.weapons[w.name]) {
              player.weapons[w.name] = player.weapons[w.name] * 1 + w.count * 1;
              if (player.weapons[w.name] <= 0) delete player.weapons[w.name];
            } else if (w.count > 0) {
              player.weapons[w.name] = w.count * 1;
            }
          }
        }
      });

      evt.subMessage +=
          Simulator.formatWeaponCounts(evt, affected, weapons, nameFormat);
    });

    // Bleeding
    sim.game.currentGame.includedUsers.forEach((player) => {
      if (player.state == 'wounded') {
        player.bleeding++;
      } else {
        player.bleeding = 0;
      }
    });

    // Finish bleeding
    const usersBleeding = [];
    const usersRecovered = [];
    sim.game.currentGame.includedUsers.forEach((obj) => {
      if (obj.bleeding > 0 && obj.bleeding > sim.game.options.bleedDays &&
          obj.living) {
        if (Math.random() < sim.game.options.probabilityOfBleedToDeath &&
            (sim.game.options.allowNoVictors || numAlive > 1)) {
          usersBleeding.push(obj);
        } else {
          usersRecovered.push(obj);
        }
      }
    });
    if (usersRecovered.length > 0) {
      sim.game.currentGame.day.events.push(
          Event.finalize(
              sim.messages.get('patchWounds'), usersRecovered,
              usersRecovered.length, 0, 'thrives', 'nothing', sim.game));
      usersRecovered.forEach((player) => {
        Simulator._applyOutcome(sim.game, player, 0, null, 'thrives');
      });
    }
    if (usersBleeding.length > 0) {
      numAlive -= usersBleeding.length;
      sim.game.currentGame.day.events.push(
          Event.finalize(
              sim.messages.get('bleedOut'), usersBleeding, usersBleeding.length,
              0, 'dies', 'nothing', sim.game));
      usersBleeding.forEach((player) => {
        Simulator._applyOutcome(sim.game, player, 0, null, 'dies');
      });
    }

    // Additional messages
    const deathPercentage = 1 - (numAlive / startingAlive);
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
    sim.game.currentGame.nextDay =
        Day.from({num: sim.game.currentGame.day.num + 1});
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
