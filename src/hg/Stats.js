// Copyright 2018-2019 Campbell Crowley. All rights reserved.
// Author: Campbell Crowley (dev@campbellcrowley.com)

/**
 * @description HG stats for a single user in a single timeframe.
 * @memberof HungryGames
 * @inner
 */
class Stats {
  /**
   * @description Create object.
   * @param {HungryGames~Stats|string} data Data to initialize this stats object
   * with, or ID of user this instance represents.
   */
  constructor(data) {
    if (!data || typeof data !== 'object') data = {id: data};
    if (typeof data.id !== 'string' || !data.id.match(/^\d{17,19}$/)) {
      throw new TypeError('ID is not a valid user ID.');
    }
    /**
     * @description The ID of the user this object represents.
     * @public
     * @type {string}
     * @constant
     */
    this._id = data.id;

    /**
     * @description Cache of all datapoints.
     * @private
     * @type {Object}
     *
     * @property {number} kills Number of kills.
     * @property {number} deaths Number of deaths.
     * @property {number} wounds Number of times wounded.
     * @property {number} revives Number of times revived.
     * @property {number} wins Number of games won.
     * @property {number} losses Number of games lost.
     */
    this._data = {
      kills: typeof data.kills === 'number' && data.kills || 0,
      deaths: typeof data.deaths === 'number' && data.deaths || 0,
      wounds: typeof data.wounds === 'number' && data.wounds || 0,
      revives: typeof data.revives === 'number' && data.revives || 0,
      wins: typeof data.wins === 'number' && data.wins || 0,
      losses: typeof data.losses === 'number' && data.losses || 0,
    };

    this.get = this.get.bind(this);
    this.id = this.id.bind(this);
  }

  /**
   * @description The ID this of the user this object represents.
   * @public
   * @returns {string} User ID.
   */
  get id() {
    return this._id;
  }

  /**
   * @description Fetch the value of a certain data point.
   * @public
   * @param {string} key The name of the datapoint.
   * @returns {?number} The value, or undefined if unable to be found.
   */
  get(key) {
    return this._data[key];
  }

  /**
   * @description Set a value for a certain datapoint.
   * @public
   * @param {string} key The name of this datapoint.
   * @param {number} value The new value to set.
   */
  set(key, value) {
    if (typeof value !== 'number') throw new TypeError('Value is not a number');
    if (typeof this._data[key] === 'undefined') throw new Error('Unknown key');
    this._data[key] = value;
  }

  /**
   * @description Fetch the data stored here as a serializable object.
   * @public
   * @returns {Object} Reference to serializable data.
   */
  get serializable() {
    return this._data;
  }

  /**
   * @description Create a Stats object instance from a Stats-like object.
   * @public
   * @static
   * @param {object} obj The object to create a Stats instance of.
   * @returns {HungryGames~Stats} The created instance.
   */
  static from(obj) {
    return new Stats(obj);
  }
}
module.exports = Stats;
