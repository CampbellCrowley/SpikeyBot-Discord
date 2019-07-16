// Copyright 2019 Campbell Crowley. All rights reserved.
// Author: Campbell Crowley (dev@campbellcrowley.com)
const FinalEvent = require('./FinalEvent.js');

/**
 * Event that can happen in a game.
 *
 * @memberof HungryGames
 * @inner
 */
class Event {
  /**
   * @description Creates a HungryGames Event.
   * @param {string} message The message to show.
   * @param {number} [numVictim=0] The number of victims in this event.
   * @param {number} [numAttacker=0] The number of attackers in this event.
   * @param {string} [victimOutcome=nothing] The outcome of the victims from
   * this event.
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
  constructor(
      message, numVictim = 0, numAttacker = 0, victimOutcome = 'nothing',
      attackerOutcome = 'nothing', victimKiller = false, attackerKiller = false,
      battle = false, state = 0, attacks = []) {
    /**
     * The message to show.
     *
     * @public
     * @type {string}
     */
    this.message = message;
    /**
     * The action to format into a message if this is a weapon event.
     *
     * @public
     * @type {?string}
     * @default
     */
    this.action = null;
    /**
     * Information about the victims in this event.
     *
     * @public
     * @type {object}
     * @property {number} count Number of victims. Negative means "at least" the
     * magnitude.
     * @property {string} outcome The outcome of the victims.
     * @property {boolean} killer Do the victims kill the attackers.
     * @property {?{name: string, count: number}} weapon The weapon information
     * to give to the player.
     */
    this.victim = {
      count: numVictim,
      outcome: victimOutcome,
      killer: victimKiller,
      weapon: null,
    };
    /**
     * Information about the attackers in this event.
     *
     * @public
     * @type {object}
     * @property {number} count Number of attackers. Negative means "at least"
     * the magnitude.
     * @property {string} outcome The outcome of the attackers.
     * @property {boolean} killer Do the attackers kill the victims.
     * @property {?{name: string, count: number}} weapon The weapon information
     * to give to the player.
     */
    this.attacker = {
      count: numAttacker,
      outcome: attackerOutcome,
      killer: attackerKiller,
      weapon: null,
    };
    /**
     * Is this event a battle event.
     *
     * @public
     * @type {boolean}
     * @default false
     */
    this.battle = battle;
    /**
     * The current state of printing the battle messages.
     *
     * @public
     * @type {number}
     * @default 0
     */
    this.state = state;
    /**
     * The attacks in a battle to show before the message.
     *
     * @public
     * @type {HungryGames~Event[]}
     * @default []
     */
    this.attacks = attacks;
    /**
     * Amount of consumables used if this is a weapon event.
     *
     * @public
     * @type {?number|string}
     * @default
     */
    this.consumes = null;
    /**
     * If the event is created by the user.
     *
     * @public
     * @type {boolean}
     * @default
     */
    this.custom = true;
    /**
     * @description Additional message text to send.
     * @public
     * @type {string}
     * @default
     */
    this.subMessage = '';

    this.finalize = this.finalize.bind(this);
    this.equal = this.equal.bind(this);
  }

  /**
   * @description Compare this Event to another to check if they are equivalent.
   * @example console.log(firstEvent.equal(otherEvent));
   * @public
   * @param {HungryGames~Event} two Other Event to compare against.
   * @returns {boolean} If they are equivalent.
   */
  equal(two) {
    return Event.equal(this, two);
  }
  /**
   * @description Finalize this instance.
   * @public
   * @param {HungryGames~GuildGame} game Game context.
   * @param {HungryGames~Player[]} affected An array of all players affected by
   * this event.
   * @returns {HungryGames~FinalEvent} The finalized event.
   */
  finalize(game, affected) {
    return new FinalEvent(this, game, affected);
  }
  /**
   * @description Make an event that doesn't affect any players and is just a
   * plain message.
   * @example Event.finalizeSimple('Something happens!', game);
   * @public
   * @static
   * @param {string} message The message to show.
   * @param {HungryGames~GuildGame} [game] The GuildGame to make this event for.
   * This is to check options and fetch players that may be necessary.
   * @returns {HungryGames~FinalEvent} The event that was created.
   */
  static finalizeSimple(message, game) {
    return Event.finalize(message, [], 0, 0, 'nothing', 'nothing', game);
  }
  /**
   * @description Format an event string based on specified users.
   * @public
   * @static
   * @param {string} message The message to show.
   * @param {HungryGames~Player[]} affectedUsers An array of all users affected
   * by this event.
   * @param {number} numVictim Number of victims in this event.
   * @param {number} numAttacker Number of attackers in this event.
   * @param {string} victimOutcome The outcome of the victims from this event.
   * @param {string} attackerOutcome The outcome of the attackers from this
   * event.
   * @param {HungryGames~GuildGame} game The GuildGame to make this event for.
   * Used for settings and fetching other players not affected by this event if
   * necessary.
   * @returns {HungryGames~FinalEvent} The final event that was created and
   * formatted ready for display.
   */
  static finalize(
      message, affectedUsers, numVictim, numAttacker, victimOutcome,
      attackerOutcome, game) {
    return new FinalEvent(
        new Event(
            message, numVictim, numAttacker, victimOutcome, attackerOutcome),
        game, affectedUsers);
  }

  /**
   * @description Compare two events to check if they are equivalent.
   * @public
   * @static
   * @param {HungryGames~Event} e1 First event.
   * @param {HungryGames~Event} e2 Second event to compare.
   * @returns {boolean} If the two given events are equivalent.
   */
  static equal(e1, e2) {
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
  }

  /**
   * @description Create a new Event object from a Event-like object. Similar to
   * copy-constructor.
   *
   * @public
   * @static
   * @param {object} obj Event-like object to copy.
   * @returns {HungryGames~Event} Copy of event.
   */
  static from(obj) {
    const out = new Event(obj.message);
    if (obj.victim) {
      out.victim.count = obj.victim.count || 0;
      out.victim.outcome = obj.victim.outcome || 'nothing';
      out.victim.killer = obj.victim.killer || false;
      if (obj.victim.weapon) {
        out.victim.weapon = {
          name: obj.victim.weapon.name,
          count: obj.victim.weapon.count,
        };
      }
    }
    if (obj.attacker) {
      out.attacker.count = obj.attacker.count || 0;
      out.attacker.outcome = obj.attacker.outcome || 'nothing';
      out.attacker.killer = obj.attacker.killer || false;
      if (obj.attacker.weapon) {
        out.attacker.weapon = {
          name: obj.attacker.weapon.name,
          count: obj.attacker.weapon.count,
        };
      }
    }
    if (obj.attacks) {
      out.attacks = obj.attacks.map((el) => Event.from(el));
    }
    out.action = obj.action || null;
    out.battle = obj.battle || false;
    out.state = obj.state || 0;
    out.consumes = obj.consumes || [];
    out.custom = obj.custom || false;
    out.subMessage = obj.subMessage || '';

    return out;
  }
}

module.exports = Event;
