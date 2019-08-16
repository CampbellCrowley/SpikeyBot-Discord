// Copyright 2019 Campbell Crowley. All rights reserved.
// Author: Campbell Crowley (dev@campbellcrowley.com)
const HungryGames = require('./HungryGames.js');
const crypto = require('crypto');

/**
 * Event that can happen in a game.
 *
 * @memberof HungryGames
 * @inner
 */
class Event {
  /**
   * @description HungryGames Event base.
   * @param {string} message The message to show.
   */
  constructor(message) {
    /**
     * @description The full unique ID of this event. If not specified, this
     * generates just the 32 bit short hash.
     * @public
     * @type {string}
     * @constant
     */
    this.id = Event.createIDHash();
    /**
     * The message to show.
     *
     * @public
     * @type {string}
     */
    this.message = message;
    /**
     * If the event is created by the user.
     *
     * @public
     * @type {boolean}
     * @default
     */
    this.custom = true;
    /**
     * @description The id of the user that created this event. If not defined,
     * then something is broken. Default global events use SpikeyRobot's ID.
     * @public
     * @type {string}
     */
    this.creator = null;
    /**
     * @description The type of event this is ('normal', 'arena', 'weapon', or
     * 'battle').
     * @public
     * @type {string}
     * @default
     */
    this.type = 'normal';
    /**
     * @description Additional message text to send.
     * @public
     * @type {string}
     * @default
     */
    this.subMessage = '';
  }

  /**
   * @description Generate the trailing hash portion of Event IDs.
   * @public
   * @static
   * @returns {string} Generated hash.
   */
  static createIDHash() {
    return crypto.randomBytes(4).readUInt32BE().toString(36);
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
    return HungryGames.NormalEvent.finalize(
        message, [], 0, 0, 'nothing', 'nothing', game);
  }

  /**
   * @description Validate that the given data is properly typed and structured
   * to be converted to an Event. Also coerces values to correct types if
   * possible.
   * @public
   * @static
   * @param {HungryGames~Event} evt The event data to verify.
   * @returns {?string} Error string, or null if no error.
   */
  static validate(evt) {
    if (typeof evt.creator !== 'string' || evt.creator.length === 0) {
      return 'BAD_CREATOR';
    }
    if (typeof evt.message !== 'string' || evt.message.length === 0 ||
        evt.message.length > 1000) {
      return 'BAD_DATA';
    }
    if (evt.id && typeof evt.id !== 'string' || evt.id.length === 0) {
      return 'BAD_DATA';
    }
    if (evt.subMessage && typeof evt.subMessage !== 'string' ||
        evt.subMessage.length === 0 || evt.subMessage.length > 1000) {
      return 'BAD_DATA';
    }
    if (evt.type) {
      switch (evt.type) {
        case 'normal':
        case 'arena':
        case 'weapon':
        case 'battle':
          break;
        default:
          return 'BAD_DATA';
      }
    }
    return null;
  }

  /**
   * @description Fill this instance with data from Event-like object.
   *
   * @public
   * @param {object} obj Event-like object to copy.
   * @returns {HungryGames~Event} Current instance with copied values.
   */
  fill(obj) {
    if (typeof obj.id === 'string') this.id = obj.id;
    if (typeof obj.custom === 'boolean') this.custom = obj.custom;
    if (typeof obj.creator === 'string') this.creator = obj.creator;
    if (typeof obj.type === 'string') this.type = obj.type;
    if (typeof obj.subMessage === 'string') this.subMessage = obj.subMessage;

    return this;
  }
}

module.exports = Event;
