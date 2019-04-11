// Copyright 2019 Campbell Crowley. All rights reserved.
// Author: Campbell Crowley (dev@campbellcrowley.com)
const Event = require('./Event.js');

/**
 * The file path to read attacking left image.
 *
 * @private
 * @type {string}
 * @constant
 * @default
 */
const fistLeft = './img/fist_left.png';
/**
 * The file path to read attacking right image.
 *
 * @private
 * @type {string}
 * @constant
 * @default
 */
const fistRight = './img/fist_right.png';
/**
 * The file path to read attacking both directions image.
 *
 * @private
 * @type {string}
 * @constant
 * @default
 */
const fistBoth = './img/fist_both.png';

/**
 * @classdesc A single battle in an Event.
 * @class HungryGames~Battle
 *
 * @param {string} message The message of this battle event.
 * @param {number} attacker The damage done to the attacker.
 * @param {number} victim The damage done to the victim.
 */
function Battle(message, attacker, victim) {
  /**
   * Message of this battle event.
   * @public
   * @type {string}
   */
  this.message = message;
  /**
   * Information about attacker.
   * @public
   * @type {{damage: number}}
   */
  this.attacker = {damage: attacker};
  /**
   * Information about victim.
   * @public
   * @type {{damage: number}}
   */
  this.victim = {damage: victim};
}

/**
 * Make an event that contains a battle between players before the main event
 * message.
 *
 * @public
 * @param {HungryGames~Player[]} affectedUsers All of the players involved in
 * the event.
 * @param {number} numVictim The number of victims in this event.
 * @param {number} numAttacker The number of attackers in this event.
 * @param {boolean} mention Should every player be mentioned when their name
 * comes up?
 * @param {HungryGames~GuildGame} game The GuildGame this battle is for. This is
 * for settings checking and fetching non-affected users.
 * @param {HungryGames~Battle[]} battles Array of all possible battle events to
 * choose from.
 * @returns {HungryGames~Event} The event that was created.
 */
Battle.finalize = function(
    affectedUsers, numVictim, numAttacker, mention, game, battles) {
  const useNicknames = game.options.useNicknames == 'all';
  const outcomeMessage =
      battles.outcomes[Math.floor(Math.random() * battles.outcomes.length)];
  const finalEvent = Event.finalize(
      outcomeMessage, affectedUsers.slice(0), numVictim, numAttacker, 'dies',
      'nothing', game);
  finalEvent.attacker.killer = true;
  finalEvent.battle = true;
  finalEvent.state = 0;
  finalEvent.attacks = [];

  const userHealth = new Array(affectedUsers.length).fill(0);
  const maxHealth = game.options.battleHealth * 1;
  let numAlive = numVictim;
  let duplicateCount = 0;
  let lastAttack = {index: 0, attacker: 0, victim: 0, flipRoles: false};

  const startMessage =
      battles.starts[Math.floor(Math.random() * battles.starts.length)];
  const battleString = '**A battle has broken out!**';
  let healthText =
      affectedUsers
          .map(function(obj, index) {
            return '`' +
                (useNicknames ? (obj.nickname || obj.name) : obj.name) + '`: ' +
                Math.max((maxHealth - userHealth[index]), 0) + 'HP';
          })
          .sort(function(a, b) {
            return a.id - b.id;
          })
          .join(', ');
  finalEvent.attacks.push(
      Event.finalize(
          battleString + '\n' + startMessage + '\n' + healthText,
          affectedUsers.slice(0), numVictim, numAttacker, 'nothing', 'nothing',
          game));

  let loop = 0;
  do {
    loop++;
    if (loop > 1000) {
      throw new Error('INFINITE LOOP');
    }
    const eventIndex = Math.floor(Math.random() * battles.attacks.length);
    const eventTry = battles.attacks[eventIndex];
    const attackerEventDamage = eventTry.attacker.damage * 1;
    const victimEventDamage = eventTry.victim.damage * 1;

    const flipRoles = Math.random() > 0.5;
    const attackerIndex = Math.floor(Math.random() * numAttacker) + numVictim;

    if (loop == 999) {
      console.log(
          'Failed to find valid event for battle!\n', eventTry, flipRoles,
          userHealth, '\nAttacker:', attackerIndex, '\nUsers:',
          affectedUsers.length, '\nAlive:', numAlive, '\nFINAL:', finalEvent);
    }

    if ((!flipRoles &&
         userHealth[attackerIndex] + attackerEventDamage >= maxHealth) ||
        (flipRoles &&
         userHealth[attackerIndex] + victimEventDamage >= maxHealth)) {
      continue;
    }

    let victimIndex = Math.floor(Math.random() * numAlive);

    let count = 0;
    for (let i = 0; i < numVictim; i++) {
      if (userHealth[i] < maxHealth) count++;
      if (count == victimIndex + 1) {
        victimIndex = i;
        break;
      }
    }

    const victimDamage = (flipRoles ? attackerEventDamage : victimEventDamage);
    const attackerDamage =
        (!flipRoles ? attackerEventDamage : victimEventDamage);

    userHealth[victimIndex] += victimDamage;
    userHealth[attackerIndex] += attackerDamage;

    if (userHealth[victimIndex] >= maxHealth) {
      numAlive--;
    }

    if (lastAttack.index == eventIndex &&
        lastAttack.attacker == attackerIndex &&
        lastAttack.victim == victimIndex && lastAttack.flipRoles == flipRoles) {
      duplicateCount++;
    } else {
      duplicateCount = 0;
    }
    lastAttack = {
      index: eventIndex,
      attacker: attackerIndex,
      victim: victimIndex,
      flipRoles: flipRoles,
    };

    healthText =
        affectedUsers
            .map(function(obj, index) {
              const health = Math.max((maxHealth - userHealth[index]), 0);
              const prePost = health === 0 ? '~~' : '';
              return prePost + '`' +
                  (useNicknames ? (obj.nickname || obj.name) : obj.name) +
                  '`: ' + health + 'HP' + prePost;
            })
            .sort(function(a, b) {
              return a.id - b.id;
            })
            .join(', ');
    let messageText = eventTry.message;
    if (duplicateCount > 0) {
      messageText += ' x' + (duplicateCount + 1);
    }

    const newEvent = Event.finalize(
        battleString + '\n' + messageText + '\n' + healthText,
        [
          affectedUsers[flipRoles ? attackerIndex : victimIndex],
          affectedUsers[flipRoles ? victimIndex : attackerIndex],
        ],
        1, 1,
        !flipRoles && userHealth[victimIndex] >= maxHealth ? 'dies' : 'nothing',
        flipRoles && userHealth[victimIndex] >= maxHealth ? 'dies' : 'nothing',
        game);

    if (victimDamage && attackerDamage) {
      newEvent.icons.splice(1, 0, {url: fistBoth});
    } else if (attackerDamage) {
      newEvent.icons.splice(1, 0, {url: flipRoles ? fistLeft : fistRight});
    } else if (victimDamage) {
      newEvent.icons.splice(1, 0, {url: flipRoles ? fistRight : fistLeft});
    }

    finalEvent.attacks.push(newEvent);
  } while (numAlive > 0);
  return finalEvent;
};

module.exports = Battle;
