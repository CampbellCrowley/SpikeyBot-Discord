// Copyright 2018-2019 Campbell Crowley. All rights reserved.
// Author: Campbell Crowley (dev@campbellcrowley.com)
const {workerData, parentPort} = require('worker_threads');
const HungryGames = require('../HungryGames.js');

/**
 * @description Asyncronous worker that does the actual simulating.
 * @memberof HungryGames~Simulator
 * @inner
 */
class Worker {
  /**
   * @description Create and start simulating.
   * @param {{
   *   game: object,
   *   messages: object.<string>,
   *   events: HungryGames~EventContainer
   * }} sim Simulation data.
   * @param {boolean} [retry=true] Whether to try again if there is an error.
   */
  constructor(sim, retry = true) {
    sim.game.currentGame.prevDay = sim.game.currentGame.day;
    sim.game.currentGame.day =
        HungryGames.Day.from(sim.game.currentGame.nextDay);
    sim.game.currentGame.day.state = 1;
    if (!sim.game.customEventStore.serializable) {
      sim.game.customEventStore =
          new HungryGames.EventContainer(sim.game.customEventStore);
    }
    if (!sim.events.serializable) {
      const battle = sim.events.battles;
      sim.events = new HungryGames.EventContainer(sim.events);
      sim.events.battles = battle;
    }


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

    // Wait for all custom events to be fetched.
    sim.game.customEventStore.waitForReady(() => {
      sim.events.waitForReady(() => {
        this.simulate(sim, retry);
      });
    });
  }
  /**
   * @description Run the simulation.
   * @private
   * @param {{game: objcet, messages: object.<string>}} sim Simulation data.
   * @param {boolean} retry Whether to try again if there is an error.
   */
  simulate(sim, retry) {
    const id = sim.game.id;

    let startingAlive = 0;
    let numAlive = 0;

    const userPool = sim.game.currentGame.includedUsers.filter((player) => {
      if (player.living) startingAlive++;
      if (player.state === 'zombie') player.state = 'normal';

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
    const deadPool = sim.game.currentGame.includedUsers.filter(
        (obj) => !userPool.find((el) => el.id === obj.id));
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
          sim.events.getArray('bloodbath')
              .concat(sim.game.customEventStore.getArray('bloodbath'));
      userEventPool = userEventPool.filter(
          (el) => !sim.game.disabledEventIds.bloodbath.includes(el.id));
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
            sim.events.getArray('arena')
                .concat(sim.game.customEventStore.getArray('arena'))
                .filter(
                    (evt) => !sim.game.disabledEventIds.arena.includes(evt.id));
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
          userEventPool = arenaEvent.outcomes.filter(
              (el) => !sim.game.disabledEventIds.arena.includes(
                  `${arenaEvent.id}/${el.id}`));
          if (userEventPool.length == 0) {
            arenaEventPool.splice(index, 1);
          } else {
            sim.game.currentGame.day.events.push(
                HungryGames.Event.finalizeSimple(
                    sim.messages.get('eventStart'), sim.game));
            sim.game.currentGame.day.events.push(
                HungryGames.Event.finalizeSimple(
                    `**___${arenaEvent.message}___**`, sim.game));
            break;
          }
        } while (arenaEventPool.length > 0);
        if (arenaEventPool.length == 0) doArenaEvent = false;
      }
      if (!doArenaEvent) {
        userEventPool = sim.events.getArray('player').concat(
            sim.game.customEventStore.getArray('player'));
        userEventPool = userEventPool.filter(
            (el) => !sim.game.disabledEventIds.player.includes(el.id));
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

    const weapons = Object.assign(
        Object.assign({}, sim.events.get('weapon')),
        sim.game.customEventStore.get('weapon'));

    const disabledList = sim.game.disabledEventIds.weapon;
    const weaponList = Object.values(weapons);
    weaponList.forEach((evt) => {
      evt.outcomes = evt.outcomes.filter(
          (el) => !disabledList.includes(`${evt.id}/${el.id}`));

      if (evt.outcomes.length === 0 || disabledList.includes(evt.id)) {
        delete weapons[evt.id];
      }
    });

    const battles = sim.events.battles;
    /* sim.events.getArray('battles').concat(
        sim.game.customEventStore.get('battles')) */

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
          eventTry = HungryGames.Simulator._pickEvent(
              userPool, weapons[chosenWeapon].outcomes, sim.game.options,
              numAlive, sim.game.currentGame.includedUsers.length, teams,
              probOpts, userWithWeapon, chosenWeapon);
          if (!eventTry) {
            useWeapon = false;
            /* self.error(
                'No event with weapon "' + chosenWeapon +
                '" for available players ' + id); */
          } else {
            affectedUsers = HungryGames.Simulator._pickAffectedPlayers(
                eventTry, sim.game.options, userPool, deadPool, teams,
                userWithWeapon, chosenWeapon);

            const count = HungryGames.Simulator._parseConsumeCount(
                eventTry.consumes, eventTry.victim.count,
                eventTry.attacker.count);

            eventTry.consumer = userWithWeapon.id;
            eventTry.consumes = [{id: chosenWeapon, count: count}];

            const firstAttacker = affectedUsers[eventTry.victim.count] &&
                affectedUsers[eventTry.victim.count].id == userWithWeapon.id;
            eventTry.subMessage = HungryGames.Simulator.formatWeaponEvent(
                eventTry, userWithWeapon, HungryGames.Grammar.formatMultiNames(
                    [userWithWeapon], nameFormat),
                firstAttacker, chosenWeapon, weapons);

            if (userWithWeapon.weapons[chosenWeapon]) {
              userWithWeapon.weapons[chosenWeapon] -= count;
              if (userWithWeapon.weapons[chosenWeapon] <= 0) {
                delete userWithWeapon.weapons[chosenWeapon];
              }
            }
          }
        }
      }

      const doBattle = ((!useWeapon && !doArenaEvent) || !eventTry) &&
          userPool.length > 1 &&
          (Math.random() < sim.game.options.probabilityOfBattle ||
           (startingAlive == 2 && numAlive == 2)) &&
          !HungryGames.Simulator._validateEventRequirements(
              1, 1, userPool, numAlive, teams, sim.game.options, true, false);
      if (doBattle) {
        let numVictim;
        let numAttacker;
        do {
          numAttacker = HungryGames.Simulator.weightedUserRand();
          numVictim = HungryGames.Simulator.weightedUserRand();
        } while (HungryGames.Simulator._validateEventRequirements(
            numVictim, numAttacker, userPool, numAlive, teams, sim.game.options,
            true, false));

        affectedUsers = HungryGames.Simulator._pickAffectedPlayers(
            new HungryGames.NormalEvent(
                '', numVictim, numAttacker, 'dies', 'nothing'),
            sim.game.options, userPool, deadPool, teams, null);
        eventTry = HungryGames.Battle.finalize(
            affectedUsers, numVictim, numAttacker, sim.game.options.mentionAll,
            sim.game, battles);
      } else if (!useWeapon || !eventTry) {
        eventTry = HungryGames.Simulator._pickEvent(
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

          if (retry) {
            new Worker(sim, false);
            return;
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

        affectedUsers = HungryGames.Simulator._pickAffectedPlayers(
            eventTry, sim.game.options, userPool, deadPool, teams, null);
      }

      if (!doBattle) {
        eventTry = eventTry.finalize(sim.game, affectedUsers);
      }

      if (eventTry.victim.outcome === 'dies') {
        [].push.apply(deadPool, affectedUsers.slice(0, eventTry.victim.count));
      }
      if (eventTry.attacker.outcome === 'dies') {
        [].push.apply(deadPool, affectedUsers.slice(eventTry.victim.count));
      }

      sim.game.currentGame.day.events.push(eventTry);

      const numKilled =
          (eventTry.attacker.outcome === 'dies' ? eventTry.attacker.count : 0) +
          (eventTry.victim.outcome === 'dies' ? eventTry.victim.count : 0);
      numAlive -= numKilled;
      if (numKilled > 4) {
        sim.game.currentGame.day.events.push(
            HungryGames.Event.finalizeSimple(
                sim.messages.get('slaughter'), sim.game));
      }

      const numRevived =
          (eventTry.attacker.outcome === 'revived' ? eventTry.attacker.count :
                                                     0) +
          (eventTry.victim.outcome === 'revived' ? eventTry.victim.count : 0);
      numAlive += numRevived;
    }

    if (doArenaEvent) {
      sim.game.currentGame.day.events.push(
          HungryGames.Event.finalizeSimple(
              sim.messages.get('eventEnd'), sim.game));
    }

    sim.game.currentGame.includedUsers.forEach((player) => {
      if (player.simWeapons) {
        player.weapons = player.simWeapons;
        delete player.simWeapons;
      }
    });

    // Apply outcomes.
    sim.game.currentGame.day.events.forEach((evt) => {
      const affected = [];
      evt.icons.forEach((icon) => {
        if (!icon.id) return;
        const player =
            sim.game.currentGame.includedUsers.find((p) => p.id === icon.id);
        if (!player) return;
        affected.push(player);
        const isV = icon.settings.victim;
        const isA = icon.settings.attacker;
        const group = (isA && evt.attacker) || (isV && evt.victim);
        const other = (isA && evt.victim) || (isV && evt.attacker);
        HungryGames.Simulator._applyOutcome(
            sim.game, player, group.killer ? other.count : 0, null,
            group.outcome);
        if (group.weapons && group.weapons.length > 0) {
          for (const w of group.weapons) {
            if (player.weapons[w.id]) {
              player.weapons[w.id] = player.weapons[w.id] * 1 + w.count * 1;
              if (player.weapons[w.id] <= 0) delete player.weapons[w.id];
            } else if (w.count > 0) {
              player.weapons[w.id] = w.count * 1;
            }
          }
        }
      });

      if (evt.consumes && evt.consumes.length > 0) {
        const consumer = sim.game.currentGame.includedUsers.find(
            (p) => p.id === evt.consumer);
        if (consumer) {
          for (const consumed of evt.consumes) {
            if (consumer.weapons[consumed.id]) {
              const count = consumed.count;
              consumer.weapons[consumed.id] -= count;
              if (consumer.weapons[consumed.id] <= 0) {
                delete consumer.weapons[consumed.id];
              }
            }
          }
        }
      }

      evt.subMessage += HungryGames.Simulator.formatWeaponCounts(
          evt, affected, weapons, nameFormat);
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
          HungryGames.NormalEvent.finalize(
              sim.messages.get('patchWounds'), usersRecovered,
              usersRecovered.length, 0, 'thrives', 'nothing', sim.game));
      usersRecovered.forEach((player) => {
        HungryGames.Simulator._applyOutcome(
            sim.game, player, 0, null, 'thrives');
      });
    }
    if (usersBleeding.length > 0) {
      numAlive -= usersBleeding.length;
      sim.game.currentGame.day.events.push(
          HungryGames.NormalEvent.finalize(
              sim.messages.get('bleedOut'), usersBleeding, usersBleeding.length,
              0, 'dies', 'nothing', sim.game));
      usersBleeding.forEach((player) => {
        HungryGames.Simulator._applyOutcome(sim.game, player, 0, null, 'dies');
      });
    }

    // Additional messages
    const deathPercentage = 1 - (numAlive / startingAlive);
    if (deathPercentage > HungryGames.Simulator._lotsOfDeathRate) {
      sim.game.currentGame.day.events.splice(
          0, 0, HungryGames.Event.finalizeSimple(
              sim.messages.get('lotsOfDeath'), sim.game));
    } else if (deathPercentage === 0) {
      sim.game.currentGame.day.events.push(
          HungryGames.Event.finalizeSimple(
              sim.messages.get('noDeath'), sim.game));
    } else if (deathPercentage < HungryGames.Simulator._littleDeathRate) {
      sim.game.currentGame.day.events.splice(
          0, 0, HungryGames.Event.finalizeSimple(
              sim.messages.get('littleDeath'), sim.game));
    }

    sim.game.currentGame.day.state = 2;
    sim.game.currentGame.nextDay =
        HungryGames.Day.from({num: sim.game.currentGame.day.num + 1});
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
