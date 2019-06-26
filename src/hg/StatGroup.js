// Copyright 2018-2019 Campbell Crowley. All rights reserved.
// Author: Campbell Crowley (dev@campbellcrowley.com)
const GuildGame = require('./GuildGame.js');
const Stats = require('./Stats.js');
const common = require('../common.js');
const crypto = require('crypto');
const fs = require('fs');

/**
 * @description Metadata to store along with a {@link HungryGames~StatGroup}
 * object. These values are user-defined and are not necessarily correct and are
 * not trustworthy for any processing.
 * @typedef {object} HGStatMetadata
 *
 * @property {string=} name The user-defined name of this stats object.
 * @property {Date=} startTime The timestamp at which this stats object starts
 * to include information.
 * @property {Date=} endTime The timestamp of the last time this object includes
 * information for.
 */
/**
 * @description HG stats for a single timeframe.
 * @memberof HungryGames
 * @inner
 */
class StatGroup {
  /**
   * @description Create group.
   * @param {GuildGame} parent The parent instance of this group.
   * @param {HGStatMetadata|string} [metadata] Additional information to store
   * with these stats, or ID if metadata should be read from file since this
   * group already exists.
   */
  constructor(parent, metadata) {
    if (!(parent instanceof GuildGame)) {
      throw new TypeError('parent is not of type GuildGame');
    }

    const dir = `${common.guildSaveDir}${parent.id}/hg/stats/`;
    let id;
    if (typeof metadata === 'string') {
      id = metadata;
      metadata = null;
    }

    const self = this;
    const fillMeta = function(metadata) {
      if (!metadata) return;
      if (metadata.name) self.setMetaName(metadata.name);
      if (metadata.startTime != null) self.setMetaStart(metadata.startTime);
      if (metadata.endTime != null) self.setMetaEnd(metadata.endTime);
    };

    /**
     * @description Metadata stored along with the stats.
     * @public
     * @type {HGStatMetadata}
     * @default
     */
    this.meta = {};
    fillMeta(metadata);
    /**
     * @description The unique ID for this stat group. Unique per-guild.
     * @private
     * @type {string}
     */
    this._id = id;
    if (!this._id) {
      do {
        this._id = crypto.randomBytes(8).toString('hex').toUpperCase();
      } while (fs.existsSync(`${dir}${this._id}`));
    }

    /**
     * @description Queue of callbacks to fire once an object has been read from
     * file. This is used to ensure that if multiple manipulations are requested
     * on a single object at the same time, all modifications will take place on
     * the same instance instead of overwriting eachother. Mapped by ID being
     * fetched.
     * @private
     * @type {Object.<Array.<function>>}
     * @default
     */
    this._fetchQueue = {};
    /**
     * @description Cache of Stats objects that are to be saved to file, and the
     * Timeout until it will be saved. Prevents saving the same file multiple
     * times at once.
     * @private
     * @type {Object.<{data: HungryGames~Stats, timeout: Timeout}>}
     * @default
     */
    this._saveQueue = {};

    /**
     * @description The directory where all of this group's information is
     * stored.
     * @private
     * @type {string}
     * @constant
     */
    this._dir = `${dir}${this._id}/`;

    fs.readFile(`${this._dir}meta.json`, (err, data) => {
      if (err) {
        if (err.code === 'ENOENT') {
          this._saveMetadata();
          return;
        }
        console.error(err);
        return;
      }
      try {
        fillMeta(JSON.parse(data));
        this._saveMetadata();
      } catch (err) {
        console.error(err);
      }
    });

    this._fetchUser = this._fetchUser.bind(this);
    this.fetchUser = this.fetchUser.bind(this);
    this.setValue = this.setValue.bind(this);
    this.fetchValue = this.fetchValue.bind(this);
    this._saveUser = this._saveUser.bind(this);
    this.setMetaName = this.setMetaName.bind(this);
    this.setMetaStart = this.setMetaStart.bind(this);
    this.setMetaEnd = this.setMetaEnd.bind(this);
    this._saveMetadata = this._saveMetadata.bind(this);
  }

  /**
   * @description Fetch stats for a specific user in this group. Returned stats
   * are modifiable, but changes will not persist unless saved to file.
   * @private
   * @param {string} uId The user ID of which to lookup.
   * @param {Function} cb Callback with optional error as first argument,
   * otherwise has stats as second argument.
   */
  _fetchUser(uId, cb) {
    if (typeof uId !== 'string' || !uId.match(/^\d{17,19}$/)) {
      throw new TypeError('uId is not a valid user Id');
    }
    // Data is queued to be saved, and is still cached, return the cached
    // version instead of reading the stale version from file.
    if (this._saveQueue[uId]) {
      cb(null, this._saveQueue[uId].data);
      return;
    }
    if (!this._fetchQueue[uId]) {
      this._fetchQueue[uId] = [cb];
    } else {
      this._fetchQueue[uId].push(cb);
      return;
    }
    const self = this;
    const done = function(err, data) {
      self._fetchQueue[uId].forEach((el) => {
        try {
          el(err, data);
        } catch (err) {
          console.error(err);
        }
      });
      delete self._fetchQueue[uId];
    };
    fs.readFile(`${this._dir}${uId}.json`, (err, data) => {
      if (err) {
        done(err);
        return;
      }
      try {
        done(null, Stats.from(JSON.parse(data)));
      } catch (err) {
        done(err);
      }
    });
  }

  /**
   * @description Fetch stats for a specific user in this group. Returned stats
   * will be frozen and immutable.
   * @public
   * @param {string} uId The user ID of which to lookup.
   * @param {Function} cb Callback with optional error as first argument,
   * otherwise has stats as second argument.
   */
  fetchUser(uId, cb) {
    this._fetchUser(uId, (err, stats) => {
      if (err) {
        cb(err);
        return;
      }
      cb(null, common.deepFreeze(stats));
    });
  }

  /**
   * @description Set a stat value for a single user.
   * @public
   * @param {string} uId The user ID of which to change.
   * @param {string} key The key of the value to change.
   * @param {*} value The value to store.
   * @param {Function} cb Callback with single optional error argument.
   */
  setValue(uId, key, value, cb) {
    this._fetchUser(uId, (err, data) => {
      if (err && err.code !== 'ENOENT') {
        cb(err);
        return;
      }
      data.set(key, value);
      this._saveUser(data);
      cb();
    });
  }

  /**
   * @description Fetch a stat value for a single user. Immutable.
   * @public
   * @param {string} uId The user ID of which to fetch.
   * @param {string} key The key of the value to fetch.
   * @param {Function} cb Callback with optional error argument, and matched
   * value.
   */
  fetchValue(uId, key, cb) {
    this._fetchUser(uId, (err, data) => {
      if (err) {
        cb(err);
        return;
      }
      cb(null, data.get(key));
    });
  }

  /**
   * @description Increment a value by an amount.
   * @public
   * @param {string} uId The user ID of which to modify.
   * @param {string} key The key of the value to modify.
   * @param {number} amount Amount to increment by. Can be negative to
   * decrement.
   * @param {Function} cb Callback with single optional error argument.
   */
  increment(uId, key, amount, cb) {
    if (typeof amount !== 'number' || isNaN(amount)) {
      throw new TypeError('Amount is not a number.');
    }
    this._fetchUser(uId, (err, data) => {
      if (err) {
        cb(err);
        return;
      }
      if (!data.get(key)) data.set(key, 0);
      if (typeof data.get(key) !== 'number') {
        cb(new TypeError('Fetched value is not a number.'));
        return;
      }
      data.set(key, data.get(key) + amount);
      this._saveUser(data);
      cb();
    });
  }

  /**
   * @description Save a stats object to file.
   * @private
   * @param {HungryGames~Stats} data The stats object to save.
   * @param {boolean} [immediate=false] Force saving to happen immediately
   * instead of waiting until next event loop.
   */
  _saveUser(data, immediate = false) {
    if (!(data instanceof Stats)) {
      throw new TypeError('data is not a Stats object');
    }
    if (this._saveQueue[data.id]) {
      clearTimeout(this._saveQueue[data.id].timeout);
    }
    if (!immediate) {
      this._saveQueue[data.id] = {
        data: data,
        timeout:
            setTimeout(() => this._saveUser(this._saveQueue[data.id], true)),
      };
      return;
    }
    delete this._saveQueue[data.id];
    common.mkAndWrite(
        `${this._dir}${data.id}.json`, this._dir, data.serializable);
  }

  /**
   * @description Set the metadata name.
   * @public
   * @param {string} name The new value.
   */
  setMetaName(name) {
    if (typeof name !== 'string') {
      throw new TypeError('Name is not a string');
    }
    this.meta.name = name;
    this._saveMetadata();
  }
  /**
   * @description Set the metadata start time.
   * @public
   * @param {Date|number|string} startTime Date parsable time.
   */
  setMetaStart(startTime) {
    this.meta.startTime = new Date(startTime);
    this._saveMetadata();
  }

  /**
   * @description Set the metadata end time.
   * @public
   * @param {Date|number|string} endTime Date parsable time.
   */
  setMetaEnd(endTime) {
    this.meta.endTime = new Date(endTime);
    this._saveMetadata();
  }

  /**
   * @description Save the current metadata to file.
   * @private
   * @param {boolean} [immediate=false] Force saving to perform immediately
   * instead of delaying until next event loop.
   */
  _saveMetadata(immediate = false) {
    if (this._saveMetaTimeout) {
      clearTimeout(this._saveMetaTimeout);
      this._saveMetaTimeout = null;
    }
    if (!immediate) {
      this._saveMetaTimeout = this.setTimeout(() => this._saveMetadata(true));
      return;
    }
    const data = {
      name: this.meta.name,
      startTime: this.meta.startTime && this.meta.startTime.getDate(),
      endTime: this.meta.endTime && this.meta.endTime.getDate(),
    };
    fs.writeFile(`${this._dir}meta.json`, JSON.stringify(data), (err) => {
      if (err) console.error(err);
    });
  }
}
module.exports = StatGroup;
