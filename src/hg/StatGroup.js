// Copyright 2018-2019 Campbell Crowley. All rights reserved.
// Author: Campbell Crowley (dev@campbellcrowley.com)
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
 * @property {Date} createDate The timestamp at which this stats object was
 * created.
 * @property {Date} modifiedDate The timestamp at which this stats object was
 * last modified.
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
    const dir = `${common.guildSaveDir}${parent.id}/hg/stats/`;
    let id;
    if (typeof metadata === 'string') {
      id = metadata;
      metadata = null;
    }

    /**
     * @description The unique ID for this stat group. Unique per-guild.
     * @todo Limit number of IDs to prevent infinite loop finding new ID.
     * @private
     * @type {string}
     */
    this._id = id;
    if (!this._id) {
      do {
        this._id = crypto.randomBytes(2).toString('hex').toUpperCase();
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

    this._fetchUser = this._fetchUser.bind(this);
    this.fetchUser = this.fetchUser.bind(this);
    this.setValue = this.setValue.bind(this);
    this.fetchValue = this.fetchValue.bind(this);
    this._saveUser = this._saveUser.bind(this);
    this.setMetaName = this.setMetaName.bind(this);
    this.setMetaStart = this.setMetaStart.bind(this);
    this.setMetaEnd = this.setMetaEnd.bind(this);
    this._fetchMetadata = this._fetchMetadata.bind(this);
    this._saveMetadata = this._saveMetadata.bind(this);

    if (metadata) {
      this._saveMetadata(this._parseMetadata(metadata));
    } else {
      this._fetchMetadata((err, meta) => {
        if (err) {
          console.error(err);
          return;
        }
        this._saveMetadata(meta);
      });
    }
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
    if (typeof uId !== 'string' ||
        (uId !== 'meta' && !uId.match(/^\d{17,19}$/))) {
      throw new TypeError('uId is not a valid ID.');
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
        if (err.code === 'ENOENT') {
          data = '{}';
        } else {
          done(err);
          return;
        }
      }
      try {
        if (uId === 'meta') {
          done(null, this._parseMetadata(JSON.parse(data)));
        } else {
          const parsed = JSON.parse(data);
          if (!parsed.id) parsed.id = uId;
          done(null, Stats.from(parsed));
        }
      } catch (err) {
        done(err);
      }
    });
  }

  /**
   * @description Fetch stats for a specific user in this group. Modified values
   * will not persist. Use functions to modify.
   * @todo Return immutable/frozen copy to enforce no-modify rule.
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
      // cb(null, common.deepFreeze(stats));
      cb(null, stats);
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
   * @param {number} [amount=1] Amount to increment by. Can be negative to
   * decrement.
   * @param {Function} [cb] Callback with single optional error argument.
   */
  increment(uId, key, amount = 1, cb) {
    if (typeof amount !== 'number' || isNaN(amount)) {
      throw new TypeError('Amount is not a number.');
    }
    this._fetchUser(uId, (err, data) => {
      if (err) {
        if (typeof cb !== 'function') {
          console.error(err);
        } else {
          cb(err);
        }
        return;
      }
      if (!data.get(key)) data.set(key, 0);
      if (typeof data.get(key) !== 'number') {
        const err = new TypeError('Fetched value is not a number.');
        if (typeof cb !== 'function') {
          console.error(err);
        } else {
          cb(err);
        }
        return;
      }
      data.set(key, data.get(key) + amount);
      this._saveUser(data);
      if (typeof cb === 'function') cb();
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
    if (this._saveQueue[data.id]) {
      clearTimeout(this._saveQueue[data.id].timeout);
      this._saveQueue[data.id].timeout = null;
    }
    if (!immediate) {
      this._saveQueue[data.id] = {
        data: data,
        timeout: setTimeout(
            () => this._saveUser(this._saveQueue[data.id].data, true)),
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
    this.fetchMetadata((err, meta) => {
      if (err) {
        console.error(err);
        return;
      }
      meta.name = name;
      this._saveMetadata(meta);
    });
  }
  /**
   * @description Set the metadata start time.
   * @public
   * @param {Date|number|string} startTime Date parsable time.
   */
  setMetaStart(startTime) {
    this.fetchMetadata((err, meta) => {
      if (err) {
        console.error(err);
        return;
      }
      meta.startTime = new Date(startTime);
      this._saveMetadata(meta);
    });
  }

  /**
   * @description Set the metadata end time.
   * @public
   * @param {Date|number|string} endTime Date parsable time.
   */
  setMetaEnd(endTime) {
    this.fetchMetadata((err, meta) => {
      if (err) {
        console.error(err);
        return;
      }
      meta.endTime = new Date(endTime);
      this._saveMetadata(meta);
    });
  }

  /**
   * @description Fetch the metadata for this group from file.
   * @private
   * @param {Function} cb Callback with optional error argument, otherwise
   * second argument is parsed {@link HGStatMetadata}.
   */
  _fetchMetadata(cb) {
    this._fetchUser('meta', cb);
  }

  /**
   * @description Fetch the metadata for this group from file. Modified values
   * will not persist. Use functions to modify.
   * @private
   * @param {Function} cb Callback with optional error argument, otherwise
   * second argument is parsed {@link HGStatMetadata}.
   */
  fetchMetadata(cb) {
    this.fetchUser('meta', cb);
  }

  /**
   * @description Parse the given object into a {@link HGStatMetadata} object.
   * @private
   * @param {object} data The data to parse.
   * @returns {HGStatMetadata} The parsed object.
   */
  _parseMetadata(data) {
    const out = {};
    if (!data) data = {};
    if (data.name != null) out.name = data.name;
    if (data.startTime != null) out.startTime = new Date(data.startTime);
    if (data.endTime != null) out.endTime = new Date(data.endTime);
    out.createDate = data.createDate ? new Date(data.createDate) : new Date();
    out.modifiedDate =
        data.modifiedDate ? new Date(data.modifiedDate) : new Date();
    return out;
  }

  /**
   * @description Save the current metadata to file.
   * @private
   * @param {HGStatMetadata} meta The data to save. Overwrites existing data.
   * @param {boolean} [immediate=false] Force saving to perform immediately
   * instead of delaying until next event loop.
   */
  _saveMetadata(meta, immediate = false) {
    if (this._saveQueue.meta) {
      clearTimeout(this._saveQueue.meta.timeout);
      this._saveQueue.meta.timeout = null;
    }
    if (!immediate) {
      this._saveQueue.meta = {
        data: meta,
        timeout: setTimeout(
            () => this._saveMetadata(this._saveQueue.meta.data, true)),
      };
      return;
    }
    const data = {
      name: meta.name,
      startTime: meta.startTime && meta.startTime.getTime(),
      endTime: meta.endTime && meta.endTime.getTime(),
      createDate: meta.createDate.getTime(),
      modifiedDate: Date.now(),
    };
    delete this._saveQueue.meta;
    common.mkAndWrite(`${this._dir}meta.json`, this._dir, data);
  }
}
module.exports = StatGroup;
