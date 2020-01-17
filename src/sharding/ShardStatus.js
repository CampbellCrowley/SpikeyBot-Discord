// Copyright 2020 Campbell Crowley. All rights reserved.
// Author: Campbell Crowley (web@campbellcrowley.com)

/**
 * @description Stores information about a single shard that is sent to the
 * master.
 * @class
 * @memberof ShardingMaster
 * @inner
 * @static
 */
class ShardStatus {
  /**
   * @description Create new instance.
   * @param {string} id The ID of the shard this status object contains data
   * for.
   */
  constructor(id) {
    if (typeof id !== 'string' || id.length < 3) {
      throw new TypeError('Invalid Shard ID for ShardStatus object: ' + id);
    }
    /**
     * @description The ID of the shard this status object contains data for.
     * @public
     * @type {string}
     */
    this.id = id;
    /**
     * @description The timestamp at which the shard was most recently started.
     * @public
     * @type {number}
     * @default
     */
    this.startTime = 0;
    /**
     * @description The timestamp at which the shard was most recently stopped.
     * @public
     * @type {number}
     * @default
     */
    this.stopTime = 0;
    /**
     * @description The goal Discord shard ID of this shard. Similar to
     * {@link ShardingMaster.ShardInfo~goalShardId}, and is used to ensure
     * messages were received properly.
     * @public
     * @type {number}
     * @default
     */
    this.goalShardId = 0;
    /**
     * @description The current Discord shard ID of this shard. Similar to
     * {@link ShardingMaster.ShardInfo~currentShardId}, and will in most cases
     * update that value once received by the master.
     * @public
     * @type {number}
     * @default
     */
    this.currentShardId = 0;
    /**
     * @description The goal Discord shard count this is configured for.
     * @public
     * @type {number}
     * @default
     */
    this.goalShardCount = 0;
    /**
     * @description The current Discord shard count this is configured for.
     * @public
     * @type {number}
     * @default
     */
    this.currentShardCount = 0;
    /**
     * @description The timestamp at which this status was generated. This
     * defaults to `Date.now()`, but is expected to be overridden to a more
     * accurate value.
     * @public
     * @type {number}
     * @default
     */
    this.timestamp = Date.now();
    /**
     * @description The difference in time since the previous status update in
     * milliseconds. A value of 0 can be assumed to mean this is the first
     * update in a series.
     * @public
     * @type {number}
     * @default
     */
    this.timeDelta = 0;
    /**
     * @description The number of Discord messages received during the time
     * since the previous status update.
     * @public
     * @type {number}
     * @default
     */
    this.messageCountDelta = 0;
    /**
     * @description The number of Discord messages received during the entire
     * time the shard has been running (resets if shard reboots).
     * @public
     * @type {number}
     * @default
     */
    this.messageCountTotal = 0;
    /**
     * @description The amount of memory the shard is currently using in bytes.
     * @public
     * @type {number}
     * @default
     */
    this.memUsage = 0;
    /**
     * @description The total memory available to the shard in bytes.
     * @public
     * @type {number}
     * @default
     */
    this.memAvailable = 0;
    /**
     * @description The percentage of time each CPU core has been used since the
     * last status update.
     * @public
     * @type {number[]}
     * @default
     */
    this.cpuLoad = [0];
    /**
     * @description The average ping time from the shard to Discord since the
     * last status update.
     * @public
     * @type {number}
     * @default
     */
    this.ping = 0;
    /**
     * @description The total storage space used by the bot in its installed
     * directory in bytes.
     * @public
     * @type {number}
     * @default
     */
    this.storageUsedTotal = 0;
    /**
     * @description The total storage space used by user data.
     * @public
     * @type {number}
     * @default
     */
    this.storageUsedUsers = 0;
  }

  /**
   * @description Convert a given object to a ShardStatus object. Values are
   * only copied if their types exactly match.
   * @public
   * @static
   * @param {object} obj The ShardStatus-like object to copy.
   * @param {string} [id] If the given object does not specify the shard's ID,
   * it may be passed here instead.
   * @returns {ShardingMaster.ShardStatus} Created ShardStatus object.
   */
  static from(obj, id) {
    const out = new ShardStatus(id || obj.id);
    for (const prop of Object.keys(out)) {
      if (prop === 'id') continue;
      if (typeof out[prop] === 'function') continue;
      if (typeof out[prop] !== typeof obj[prop]) continue;
      out[prop] = obj[prop];
    }
    return out;
  }

  /**
   * @description Update the current object with values received.
   * @public
   * @param {object} obj The object with values to copy over.
   */
  update(obj) {
    for (const prop of Object.keys(this)) {
      if (prop === 'id') continue;
      if (typeof this[prop] === 'function') continue;
      if (typeof this[prop] !== typeof obj[prop]) continue;
      this[prop] = obj[prop];
    }
  }
}
module.exports = ShardStatus;
