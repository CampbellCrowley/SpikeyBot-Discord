// Copyright 2019 Campbell Crowley. All rights reserved.
// Author: Campbell Crowley (dev@campbellcrowley.com)
const fs = require('fs');

/**
 * @description Manages interface for event storage.
 *
 * @memberof HungryGames
 * @inner
 */
class EventContainer {
  /**
   * @description Create container.
   * @param {{
   *   bloodbath: string[],
   *   player: string[],
   *   arena: string[],
   *   weapon: string[]
   * }} obj List of IDs to load.
   */
  constructor(obj) {
    /**
     * @description Cached bloodbath events.
     * @private
     * @type {object.<HungryGames~NormalEvent>}
     * @default
     * @constant
     */
    this._bloodbath = {};
    /**
     * @description All bloodbath event IDs that should be loaded.
     * @private
     * @type {string[]}
     * @default
     * @constant
     */
    this._bloodbathIds = [];
    /**
     * @description Cached player events.
     * @private
     * @type {object.<HungryGames~NormalEvent>}
     * @default
     * @constant
     */
    this._player = {};
    /**
     * @description All player event IDs that should be loaded.
     * @private
     * @type {string[]}
     * @default
     * @constant
     */
    this._playerIds = [];
    /**
     * @description Cached arena events.
     * @private
     * @type {object.<HungryGames~ArenaEvent>}
     * @default
     * @constant
     */
    this._arena = {};
    /**
     * @description All arena event IDs that should be loaded.
     * @private
     * @type {string[]}
     * @default
     * @constant
     */
    this._arenaIds = [];
    /**
     * @description Cached weapon events.
     * @private
     * @type {object.<HungryGames~WeaponEvent>}
     * @default
     * @constant
     */
    this._weapon = {};
    /**
     * @description All weapon IDs that should be loaded.
     * @private
     * @type {string[]}
     * @default
     * @constant
     */
    this._weaponIds = [];

    /**
     * @description Number of currently loading requets that have not completed.
     * @see {@link HungryGames~EventContainer.loading}
     * @private
     * @type {number}
     * @default
     */
    this._loading = 0;

    /**
     * @description List of callbacks to fire once loading is completed.
     * @private
     * @type {Function[]}
     * @default
     * @constant
     */
    this._callbacks = [];

    if (obj) this.updateAndFetchAll(obj);
  }

  /**
   * @description Get serializable version of this object for saving to file.
   * @public
   * @returns {object} Serializable object for saving.
   */
  get serializable() {
    const out = {};
    EventContainer.types.forEach((type) => out[type] = this.ids(type));
    return out;
  }

  /**
   * @description Current types of events that this object stores.
   * @public
   * @static
   * @readonly
   * @returns {string[]} All types available.
   */
  static get types() {
    return ['bloodbath', 'player', 'arena', 'weapon'];
  }

  /**
   * @description Directory where all event data is stored.
   * @public
   * @static
   * @readonly
   * @returns {string} Path relative to projcet root.
   */
  static get eventDir() {
    return './save/hg/events/';
  }

  /**
   * @description True if data is currently being updated, and should not be
   * trusted as complete or up to date.
   * @public
   * @readonly
   * @returns {boolean} True if loading, false otherwise.
   */
  get loading() {
    return this._loading > 0;
  }

  /**
   * @description Fires callback once not loading anymore, or immediately if not
   * currently loading.
   * @public
   * @param {Function} cb Callback to fire.
   */
  waitForReady(cb) {
    if (this.loading) {
      this._callbacks.push(cb);
    } else {
      cb();
    }
  }

  /**
   * @description Fetch list of IDs for specific type.
   * @public
   * @param {string} type Event type to fetch IDs for.
   * @returns {string[]} List of IDs.
   */
  ids(type) {
    if (EventContainer.types.includes(type)) return this[`_${type}Ids`];
    return [];
  }

  /**
   * @description Get the object reference storing events of a certain type,
   * mapped by the event IDs.
   * @public
   * @param {string} type The type to fetch.
   * @returns {object.<
   *   HungryGames~Event|
   *   HungryGames~NormalEvent|
   *   HungryGames~ArenaEvent|
   *   HungryGames~Battle|
   *   HungryGames~WeaponEvent
   * >} The object of requested event types.
   */
  get(type) {
    if (EventContainer.types.includes(type)) return this[`_${type}`];
    return {};
  }

  /**
   * @description Remove an event from a type. Purges from cache immediately.
   * @public
   * @param {string} id ID of the event to remove.
   * @param {string} type The category to remove the event from.
   * @returns {boolean} True if success, false otherwise.
   */
  remove(id, type) {
    if (!EventContainer.types.includes(type)) return false;
    const ids = this.ids(type);
    const index = ids.findIndex((el) => el === id);
    if (index < 0) return false;
    ids.splice(index, 1);
    if (this.get(type)[id]) delete this.get(type)[id];
    return true;
  }

  /**
   * @description Get the object reference storing events of a certain type
   * after passed through `Object.values()`.
   * @public
   * @param {string} type The type to fetch.
   * @returns {Array.<
   *   HungryGames~Event|
   *   HungryGames~NormalEvent|
   *   HungryGames~ArenaEvent|
   *   HungryGames~Battle|
   *   HungryGames~WeaponEvent
   * >} The object of requested event types.
   */
  getArray(type) {
    return Object.values(this.get(type));
  }

  /**
   * @description Update list of IDs, and cache all.
   * @public
   * @param {{
   *   bloodbath: string[],
   *   player: string[],
   *   arena: string[],
   *   weapon: string[]
   * }} obj List of IDs to load.
   * @param {Function} cb Fires once all events have been cached.
   */
  updateAndFetchAll(obj, cb) {
    const keys = Object.keys(obj);
    keys.forEach((type) => {
      if (!EventContainer.types.includes(type)) {
        if (type !== 'battles') console.error('Unknown type of event: ' + type);
        return;
      }
      const out = this.ids(type);
      // Remove non-existent IDs.
      for (let i = out.length - 1; i >= 0; i--) {
        if (!obj[type].find((el) => el === out[i])) out.splice(i, 1);
      }
      // Add new IDs.
      for (const id of obj[type]) {
        if (!out.find((el) => el === id)) out.push(id);
      }
    });
    this.fetchAll(cb);
  }

  /**
   * @description Fetch all events from file into the cache. Always fetches from
   * file, even if event exists in cache already.
   * @public
   * @param {Function} cb Callback once completed. No arguments.
   */
  fetchAll(cb) {
    let numLeft = 0;
    EventContainer.types.forEach((type) => {
      this.ids(type).forEach((id) => {
        numLeft++;
        this.fetch(id, type, () => {
          const ids = this.ids(type);
          const obj = this.get(type);
          // Purge removed events.
          Object.keys(obj).forEach((el) => {
            if (!ids.includes(el)) delete obj[el];
          });
          numLeft--;
          if (numLeft > 0) return;
          if (typeof cb === 'function') cb();
        });
      });
    });
    if (numLeft === 0) {
      if (typeof cb === 'function') cb();
    }
  }

  /**
   * @description Fetch an event into the cache. Always updates from file, even
   * if already cached.
   * @public
   * @param {string} id The event ID to fetch.
   * @param {?string} type The category to add this event to. If null, event
   * will not be stored in category, nor cached.
   * @param {basicCB} cb Callback once completed. First argument is optional
   * error string, second is otherwise the event object.
   */
  fetch(id, type, cb) {
    const self = this;
    const done = function(err, obj) {
      self._loading--;
      if (!self.loading) {
        self._callbacks.splice(0).forEach((el) => {
          try {
            el();
          } catch (err) {
            console.error(err);
          }
        });
      }
      cb(err, obj);
    };

    if (!id.match || !id.match(/^\d{17,19}\/\d+-[0-9a-z]+$/)) {
      done('BAD_ID');
      return;
    }

    const eventDir = EventContainer.eventDir;
    this._loading++;
    fs.readFile(`${eventDir}${id}.json`, (err, data) => {
      if (err) {
        if (err.code !== 'ENOENT') {
          console.error(`Failed to load: ${eventDir}${id}.json`);
          console.error(err);
        }
        done('BAD_ID');
        return;
      }
      try {
        const parsed = JSON.parse(data);
        if (!parsed) {
          console.error(`Failed to parse: ${eventDir}${id}.json (NO DATA)`);
          done('PARSE_ERROR');
        } else {
          if (type && EventContainer.types.includes(type)) {
            if (!this.ids(type).includes(id)) this.ids(type).push(id);
            this.get(type)[id] = parsed;
          }
          done(null, parsed);
        }
      } catch (err) {
        console.error(`Failed to parse: ${eventDir}${id}.json`);
        console.error(err);
        done('PARSE_ERROR');
      }
    });
  }

  /**
   * @description Create based of serializable data that was saved to file.
   * @public
   * @static
   * @param {object} obj Parsed save data.
   * @returns {HungryGames~EventContainer} Created object.
   */
  static from(obj) {
    return new EventContainer(obj);
  }
}
module.exports = EventContainer;
