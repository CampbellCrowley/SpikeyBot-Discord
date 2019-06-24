// Copyright 2018-2019 Campbell Crowley. All rights reserved.
// Author: Campbell Crowley (dev@campbellcrowley.com)

/**
 * @description Metadata to store along with a {@link HungryGames~Stats} object.
 * These values are user-defined and are not necessarily correct and are not
 * trustworthy for any processing.
 * @typedef {Object} HGStatMetadata
 * @property {string} [name] The user-defined name of this stats object.
 * @property {Date|number|string} [startTime] The timestamp at which this stats
 * object starts to include information.
 * @property {Date|number|string} [endTime] The timestamp of the last time this
 * object includes information for.
 */
/**
 * @description HG stats for a single timeframe.
 * @memberof HungryGames
 * @inner
 */
class Stats {
  /**
   * @description Create object.
   * @param {HGStatMetadata} [metadata] Additional information to store with
   * these stats.
   */
  constructor() {

  }
}
module.exports = Stats;
