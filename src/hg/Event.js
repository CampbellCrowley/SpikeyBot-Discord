// Copyright 2019 Campbell Crowley. All rights reserved.
// Author: Campbell Crowley (dev@campbellcrowley.com)
const FinalEvent = require('./FinalEvent.js');
const UserIconUrl = require('./UserIconUrl.js');
const Grammar = require('./Grammar.js');
const Simulator = require('./Simulator.js');
const funTranslator = require('../lib/funTranslators.js');

/**
 * @classdesc Event that can happen in a game.
 * @class HungryGames~Event
 *
 * @param {string} message The message to show.
 * @param {number} [numVictim=0] The number of victims in this event.
 * @param {number} [numAttacker=0] The number of attackers in this event.
 * @param {string} [victimOutcome=nothing] The outcome of the victims from this
 * event.
 * @param {string} [attackerOutcome=nothing] The outcome of the attackers from
 * this event.
 * @param {boolean} [victimKiller=false] Do the victims kill anyone in this
 * event. Used for calculating kill count.
 * @param {boolean} [attackerKiller=false] Do the attackers kill anyone in
 * this event. Used for calculating kill count.
 * @param {boolean} [battle] Is this event a battle?
 * @param {number} [state=0] State of event if there are multiple attacks
 * before the event.
 * @param {HungryGames~Event[]} [attacks=[]] Array of attacks that take place
 * before the event.
 */
function Event(
    message, numVictim = 0, numAttacker = 0, victimOutcome = 'nothing',
    attackerOutcome = 'nothing', victimKiller = false, attackerKiller = false,
    battle = false, state = 0, attacks = []) {
  /**
   * The message to show.
   * @public
   * @type {string}
   */
  this.message = message;
  /**
   * The action to format into a message if this is a weapon event.
   * @public
   * @type {?string}
   * @default
   */
  this.action = null;
  /**
   * Information about the victims in this event.
   * @public
   * @type {{count: number, outcome: string, killer: boolean, weapon: ?Object}}
   * @property {?{name: string, count: number}} weapon The weapon information to
   * give to the player.
   */
  this.victim = {
    count: numVictim,
    outcome: victimOutcome,
    killer: victimKiller,
    weapon: null,
  };
  /**
   * Information about the attackers in this event.
   * @public
   * @type {{count: number, outcome: string, killer: boolean, weapon: ?Object}}
   * @property {?{name: string, count: number}} weapon The weapon information to
   * give to the player.
   */
  this.attacker = {
    count: numAttacker,
    outcome: attackerOutcome,
    killer: attackerKiller,
    weapon: null,
  };
  /**
   * Is this event a battle event.
   * @public
   * @type {boolean}
   * @default false
   */
  this.battle = battle;
  /**
   * The current state of printing the battle messages.
   * @public
   * @type {number}
   * @default 0
   */
  this.state = state;
  /**
   * The attacks in a battle to show before the message.
   * @public
   * @type {HungryGames~Event[]}
   * @default []
   */
  this.attacks = attacks;
  /**
   * Amount of consumables used if this is a weapon event.
   * @public
   * @type {?number|string}
   * @default
   */
  this.consumes = null;
  /**
   * If the event is created by the user.
   * @public
   * @type {boolean}
   * @default
   */
  this.custom = true;
}
/**
 * Make an event that doesn't affect any players and is just a plain message.
 *
 * @private
 * @param {string} message The message to show.
 * @param {HungryGames~GuildGame} [game] The GuildGame to make this event for.
 * This is to check options and fetch players that may be necessary.
 * @return {HungryGames~FinalEvent} The event that was created.
 */
Event.finalizeSimple = function(message, game) {
  return Event.finalize(message, [], 0, 0, 'nothing', 'nothing', game);
};

/**
 * Format an event string based on specified users.
 *
 * @public
 * @param {string} message The message to show.
 * @param {HungryGames~Player[]} affectedUsers An array of all users affected by
 * this event.
 * @param {number} numVictim Number of victims in this event.
 * @param {number} numAttacker Number of attackers in this event.
 * @param {string} victimOutcome The outcome of the victims from this event.
 * @param {string} attackerOutcome The outcome of the attackers from this event.
 * @param {HungryGames~GuildGame} game The GuildGame to make this event for.
 * Used for settings and fetching other players not affected by this event if
 * necessary.
 * @return {HungryGames~FinalEvent} The final event that was created and
 * formatted ready for display.
 */
Event.finalize = function(
    message, affectedUsers, numVictim, numAttacker, victimOutcome,
    attackerOutcome, game) {
  const useNickname = game.options.useNicknames ? 'nickname' : 'username';
  const mention = game.options.mentionAll;
  let mentionString = '';
  let translator = null;
  for (let i = 0; i < affectedUsers.length; i++) {
    if (!affectedUsers.isNPC && mention == 'all' ||
        (mention == 'death' &&
         ((victimOutcome == 'dies' && i < numVictim) ||
          (attackerOutcome == 'dies' && i >= numVictim)))) {
      mentionString += `<@${affectedUsers[i].id}>`;
    }
    if (affectedUsers[i].settings &&
        affectedUsers[i].settings['hg:fun_translators'] &&
        affectedUsers[i].settings['hg:fun_translators'] !== 'disabled') {
      translator = affectedUsers[i].settings['hg:fun_translators'];
    }
  }
  const affectedVictims = affectedUsers.splice(0, numVictim);
  const affectedAttackers = affectedUsers.splice(0, numAttacker);
  let finalMessage = message;
  finalMessage = finalMessage.replace(
      /\[V([^|]*)\|([^\]]*)\]/g,
      '$' + (affectedVictims.length > 1 ? '2' : '1'));
  finalMessage = finalMessage.replace(
      /\[A([^|]*)\|([^\]]*)\]/g,
      '$' + (affectedAttackers.length > 1 ? '2' : '1'));
  finalMessage = finalMessage
      .replace(
          /\{victim\}/g,
          Grammar.formatMultiNames(affectedVictims, useNickname))
      .replaceAll(
          /\{attacker\}/g, Grammar.formatMultiNames(
              affectedAttackers, useNickname));
  if (finalMessage.indexOf('{dead}') > -1) {
    const deadUsers =
        game.currentGame.includedUsers
            .filter(function(obj) {
              return !obj.living && !affectedUsers.find(function(u) {
                return u.id == obj.id;
              });
            })
            .slice(0, Simulator.weightedUserRand());
    const numDead = deadUsers.length;
    if (numDead === 0) {
      finalMessage = finalMessage.replaceAll('{dead}', 'an animal')
          .replace(/\[D([^|]*)\|([^\]]*)\]/g, '$1');
    } else {
      finalMessage =
          finalMessage
              .replace(/\[D([^|]*)\|([^\]]*)\]/g, numDead === 1 ? '$1' : '$2')
              .replaceAll(
                  '{dead}', Grammar.formatMultiNames(deadUsers, useNickname));
    }
  }
  finalMessage = funTranslator.to(translator, finalMessage);
  const finalIcons =
      UserIconUrl.from(affectedVictims.concat(affectedAttackers));
  return new FinalEvent(
      finalMessage, finalIcons, numVictim, victimOutcome, attackerOutcome,
      mentionString);
};

/**
 * Compare two events to check if they are equivalent.
 * @public
 *
 * @param {HungryGames~Event} e1
 * @param {HungryGames~Event} e2
 * @return {boolean}
 */
Event.equal = function(e1, e2) {
  if (!e1 || !e2) return false;
  if (e1.message != e2.message) return false;
  if (e1.action != e2.action) return false;
  if (e1.consumes != e2.consumes) return false;
  if (!e1.battle != !e2.battle) return false;
  const v1 = e1.victim;
  const v2 = e2.victim;
  if (v1 && v2) {
    if (v1.count != v2.count) return false;
    if (v1.outcome != v2.outcome) return false;
    if (!v1.killer != !v2.killer) return false;
    if (v1.weapon && v2.weapon) {
      if (v1.weapon.name != v2.weapon.name) return false;
      if (v1.weapon.count != v2.weapon.count) return false;
    } else if (!(!v1.weapon && !v2.weapon)) {
      return false;
    }
  } else if (!(!v1 && !v2)) {
    return false;
  }
  const a1 = e1.attacker;
  const a2 = e2.attacker;
  if (a1 && a2) {
    if (a1.count != a2.count) return false;
    if (a1.outcome != a2.outcome) return false;
    if (!a1.killer != !a2.killer) return false;
    if (a1.weapon && a2.weapon) {
      if (a1.weapon.name != a2.weapon.name) return false;
      if (a1.weapon.count != a2.weapon.count) return false;
    } else if (!(!a1.weapon && !a2.weapon)) {
      return false;
    }
  } else if (!(!a1 && !a2)) {
    return false;
  }
  return true;
};
/**
 * Compare this Event to another to check if they are equivalent.
 *
 * @public
 * @param {HungryGames~Event} two
 * @return {boolean} If they are equivalent.
 */
Event.prototype.equal = function(two) {
  return Event.equal(this, two);
};

module.exports = Event;
