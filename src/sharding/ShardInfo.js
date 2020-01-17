// Copyright 2020 Campbell Crowley. All rights reserved.
// Author: Campbell Crowley (web@campbellcrowley.com)

/**
 * @description Stores information about a single shard necessary for
 * the ShardingMaster to operate.
 * @class
 * @memberof ShardingMaster
 * @inner
 * @static
 */
class ShardInfo {
  /**
   * @description Create new instance.
   * @param {string} id The ID of the shard this status object contains data
   * for.
   */
  constructor(id) {
    if (typeof id !== 'string' || id.length < 3) {
      throw new TypeError('Invalid Shard ID for ShardInfo object: ' + id);
    }
    /**
     * @description The ID of the shard this status object contains data for.
     * @public
     * @type {string}
     */
    this.id = id;
    /**
     * @description Timestamp of the last time the shard has been seen. This
     * will be 0 if the shard has never attempted to communicate with the
     * master.
     * @public
     * @type {number}
     * @default
     */
    this.lastSeen = 0;
    /**
     * @description The timestamp at which the information for this shard was
     * created, and sent to a sysadmin.
     * @public
     * @type {number}
     * @default
     */
    this.createdTime = Date.now();
    /**
     * @description The most recent timestamp at which the shard was told to
     * boot up.
     * @public
     * @type {number}
     * @default
     */
    this.bootTime = 0;
    /**
     * @description The most recent timestamp at which the shard was told to
     * shut down.
     * @public
     * @type {number}
     * @default
     */
    this.stopTime = 0;
    /**
     * @description The Discord shard ID this shard should be currently. A value
     * less than 0 means the shard should be shutdown.
     * @public
     * @type {number}
     * @default
     */
    this.goalShardId = -1;
    /**
     * @description The Discord shard ID this shard currently is. A value less
     * than 0 means the shard is currently shutdown.
     * @public
     * @type {number}
     * @default
     */
    this.currentShardId = -1;
    /**
     * @description The number of shards intended to be running currently. A
     * value of 1 or less denotes this is the only shard. A default value of -1
     * is used to be similar to the ID values, but any value less than 2 is
     * semantically the identical.
     * @public
     * @type {number}
     * @default
     */
    this.goalShardCount = -1;
    /**
     * @description The number of shards intended to be running according to
     * this shard's current configuration. A value of 1 or less denotes this is
     * the only shard. A default value of -1 is used to be similar to the ID
     * values, but any value less than 2 is semantically the identical.
     * @public
     * @type {number}
     * @default
     */
    this.currentShardCount = -1;
  }

  /**
   * @description Format this object into a request for a shard's state. This
   * does not handle cold stops or full reboots, only modifying running state of
   * the shard.
   * @public
   * @returns {object} Object with minimal data to inform the shard how it
   * should currently be configured.
   */
  request() {
    return {
      id: this.goalShardId,
      count: this.goalShardCount,
    };
  }

  /**
   * @description Convert a given object to a ShardInfo object. Values are only
   * copied if their types exactly match.
   * @public
   * @static
   * @param {object} obj The ShardInfo-like object to copy.
   * @param {string} [id] If the given object does not specify the shard's ID,
   * it may be passed here instead.
   * @returns {ShardingMaster.ShardInfo} Created ShardInfo object.
   */
  static from(obj, id) {
    const out = new ShardInfo(id || obj.id);
    for (const prop of Object.keys(out)) {
      if (prop === 'id') continue;
      if (typeof out[prop] === 'function') continue;
      if (typeof out[prop] !== typeof obj[prop]) continue;
      out[prop] = obj[prop];
    }
    return out;
  }
}
module.exports = ShardInfo;
