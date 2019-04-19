// Copyright 2019 Campbell Crowley. All rights reserved.
// Author: Campbell Crowley (dev@campbellcrowley.com)

/**
 * @description Finalized event ready for display to users.
 * @memberof HungryGames
 * @inner
 */
class FinalEvent {
  /**
   * @description Create an event ready for display.
   * @param {string} message Text to send to users.
   * @param {HungryGames~UserIconUrl[]} [icons] Icons for this event.
   * @param {number} [numVictim=0] Number of victims in this event.
   * @param {string} [victimOutcome='nothing'] Victim outcome due to this event.
   * @param {string} [attackerOutcome='nothing'] Attacker outcome due to this
   * event.
   * @param {string} [mentionString=''] String of mentions to separate from the
   * message embeds so that users are properly pinged.
   */
  constructor(
      message, icons = [], numVictim = 0, victimOutcome = 'nothing',
      attackerOutcome = 'nothing', mentionString = '') {
    /**
     * Message to send to users.
     * @public
     * @type {string}
     */
    this.message = message;
    /**
     * Icons to include with sent message.
     * @public
     * @type {HungryGames~UserIconUrl[]}
     * @default []
     */
    this.icons = icons;
    /**
     * Number of victims in this event.
     * @public
     * @type {number}
     * @default 0
     */
    this.numVictim = numVictim;
    /**
     * Information about the victims in this event.
     * @public
     * @type {{outcome: string}}
     * @default {outcome: 'nothing'}
     */
    this.victim = {outcome: victimOutcome};
    /**
     * Information about the attackers in this event.
     * @public
     * @type {{outcome: string}}
     * @default {outcome: 'nothing'}
     */
    this.attacker = {outcome: attackerOutcome};
    /**
     * String mentions to ping users.
     * @public
     * @type {string}
     * @default ''
     */
    this.mentionString = mentionString;
  }
}

module.exports = FinalEvent;
