// Copyright 2019 Campbell Crowley. All rights reserved.
// Author: Campbell Crowley (dev@campbellcrowley.com)
const HungryGames = require('./HungryGames.js');

/**
 * Event that can happen in a game.
 *
 * @memberof HungryGames
 * @inner
 * @augments HungryGames~Event
 */
class NormalEvent extends HungryGames.Event {
  /**
   * @description Creates a HungryGames Normal Event.
   *
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
   * @param {HungryGames~NormalEvent[]} [attacks=[]] Array of attacks that take
   * place before the event.
   */
  constructor(
      message, numVictim = 0, numAttacker = 0, victimOutcome = 'nothing',
      attackerOutcome = 'nothing', victimKiller = false, attackerKiller = false,
      battle = false, state = 0, attacks = []) {
    super(message);
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
     * @property {?{id: string, count: number}} weapon The weapon information to
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
     *
     * @public
     * @type {object}
     * @property {number} count Number of attackers. Negative means "at least"
     * the magnitude.
     * @property {string} outcome The outcome of the attackers.
     * @property {boolean} killer Do the attackers kill the victims.
     * @property {?{id: string, count: number}} weapon The weapon information to
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
  }

  /**
   * @description Compare this Event to another to check if they are equivalent.
   * @example console.log(firstEvent.equal(otherEvent));
   * @public
   * @param {HungryGames~NormalEvent} two Other NormalEvent to compare against.
   * @returns {boolean} If they are equivalent.
   */
  equal(two) {
    return NormalEvent.equal(this, two);
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
    return new HungryGames.FinalEvent(this, game, affected);
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
    return new HungryGames.FinalEvent(
        new NormalEvent(
            message, numVictim, numAttacker, victimOutcome, attackerOutcome),
        game, affectedUsers);
  }

  /**
   * @description Compare two events to check if they are equivalent.
   * @public
   * @static
   * @param {HungryGames~NormalEvent} e1 First event.
   * @param {HungryGames~NormalEvent} e2 Second event to compare.
   * @returns {boolean} If the two given events are equivalent.
   */
  static equal(e1, e2) {
    if (!e1 || !e2) return false;
    if (e1.message != e2.message) return false;
    if (e1.action != e2.action) return false;
    if (e1.consumes != e2.consumes) return false;
    if (e1.type != e2.type) return false;
    if (!e1.battle != !e2.battle) return false;
    const v1 = e1.victim;
    const v2 = e2.victim;
    if (v1 && v2) {
      if (v1.count != v2.count) return false;
      if (v1.outcome != v2.outcome) return false;
      if (!v1.killer != !v2.killer) return false;
      if (v1.weapon && v2.weapon) {
        if (v1.weapon.id != v2.weapon.id) return false;
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
        if (a1.weapon.id != a2.weapon.id) return false;
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
   * @description Validate that the given data is properly typed and structured
   * to be converted to a NormalEvent. Also coerces values to correct types if
   * possible.
   * @public
   * @static
   * @param {HungryGames~NormalEvent} evt The event data to verify.
   * @returns {?string} Error string, or null if no error.
   */
  static validate(evt) {
    const err = HungryGames.Event.validate(evt);
    if (err) return err;

    if (evt.action && (typeof evt.action !== 'string' ||
                       evt.action.length === 0 || evt.action.length > 1000)) {
      return 'BAD_ACTION';
    }

    if (evt.battle != null && typeof evt.battle !== 'boolean' &&
        evt.battle !== 'true' && evt.battle !== 'false') {
      return 'BAD_BATTLE';
    } else if (evt.battle != null) {
      evt.battle = evt.battle === 'true';
    }

    if (evt.state != null && !Number.isSafeInteger(evt.state *= 1)) {
      return 'BAD_STATE';
    }

    if (evt.attacks && !Array.isArray(evt.attacks)) {
      return 'BAD_ATTACKS';
    } else if (evt.attacks) {
      let outerr;
      if (evt.attacks.find((el) => outerr = NormalEvent.validate(el))) {
        return 'BAD_ATTACK_' + outerr;
      }
    }

    if (evt.consumes &&
        (typeof evt.consumes !== 'string' || evt.consumes.length > 100 ||
         evt.consumes.length === 0) &&
        !Number.isSafeInteger(evt.consumes * 1)) {
      return 'BAD_CONSUMES';
    }

    if (evt.victim) {
      switch (evt.victim.outcome) {
        case 'nothing':
        case 'dies':
        case 'wounded':
        case 'revived':
        case 'thrives':
          break;
        default:
          return 'BAD_VICTIM_OUTCOME';
      }
      if (!Number.isSafeInteger(evt.victim.count *= 1)) return 'BAD_DATA';
      if (typeof evt.victim.killer !== 'boolean') {
        if (evt.victim.killer !== 'true' && evt.victim.killer !== 'false') {
          return 'BAD_VICTIM_KILLER';
        } else {
          evt.victim.killer = evt.victim.killer === 'true';
        }
      }
      if (evt.victim.weapon &&
          (typeof evt.victim.weapon.id !== 'string' ||
           !Number.isSafeInteger(evt.victim.weapon.count *= 1))) {
        return 'BAD_VICTIM_WEAPON';
      }
    }
    if (evt.attacker) {
      switch (evt.attacker.outcome) {
        case 'nothing':
        case 'dies':
        case 'wounded':
        case 'revived':
        case 'thrives':
          break;
        default:
          return 'BAD_ATTACKER_OUTCOME';
      }
      if (!Number.isSafeInteger(evt.attacker.count *= 1)) return 'BAD_DATA';
      if (typeof evt.attacker.killer !== 'boolean') {
        if (evt.attacker.killer !== 'true' && evt.attacker.killer !== 'false') {
          return 'BAD_ATTACKER_COUNT';
        } else {
          evt.attacker.killer = evt.attacker.killer === 'true';
        }
      }
      if (evt.attacker.weapon &&
          (typeof evt.attacker.weapon.id !== 'string' ||
           !Number.isSafeInteger(evt.attacker.weapon.count *= 1))) {
        return 'BAD_ATTACKER_WEAPON';
      }
    }
    return null;
  }

  /**
   * @description Create a new NormalEvent object from a NormalEvent-like
   * object. Similar to copy-constructor.
   *
   * @public
   * @static
   * @param {object} obj Event-like object to copy.
   * @returns {HungryGames~NormalEvent} Copy of event.
   */
  static from(obj) {
    const out = new NormalEvent(obj.message);
    out.fill(obj);
    if (obj.victim) {
      out.victim.count = obj.victim.count || 0;
      out.victim.outcome = obj.victim.outcome || 'nothing';
      out.victim.killer = obj.victim.killer || false;
      if (obj.victim.weapon) {
        out.victim.weapon = {
          id: obj.victim.weapon.id,
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
          id: obj.attacker.weapon.id,
          count: obj.attacker.weapon.count,
        };
      }
    }
    if (Array.isArray(obj.attacks)) {
      out.attacks = obj.attacks.map((el) => NormalEvent.from(el));
    }
    if (typeof obj.action === 'string') out.action = obj.action;
    if (typeof obj.battle === 'boolean') out.battle = obj.battle;
    if (typeof obj.state === 'number') out.state = obj.state;
    if (Array.isArray(obj.consumes)) out.consumes = obj.consumes;

    return out;
  }
}

module.exports = NormalEvent;
