// Copyright 2019 Campbell Crowley. All rights reserved.
// Author: Campbell Crowley (dev@campbellcrowley.com)

/**
 * @classdesc Information about a single game day that was simulated.
 * @class HungryGames~Day
 *
 * @param {number} [num] The day number.
 * @param {HungryGames~Event[]} [events] The events that will take place during
 * this day.
 */
function Day(num, events) {
  /**
   * The day number this is. (Bloodbath is 0)
   * @public
   * @type {number}
   * @default
   */
  this.num = -1;
  if (typeof num === 'number') this.num = num;
  /**
   * The state index of this day. 0 is not yet simulated, 1 is currently
   * simulating, and 2-n are the index of the event to show if reduced by 2. (2
   * = event #0, 3 = event #1)
   * @public
   * @type {number}
   * @default
   */
  this.state = 0;
  /**
   * All events to take place during this day.
   * @public
   * @type {HungryGames~Event[]}
   * @default
   */
  this.events = events || [];
}

/**
 * Create a Day from an Object. Similar to copy-constructor.
 * @public
 * @param {Object} data Day like Object.
 * @return {HungryGames~Day} Created Day.
 */
Day.from = function(data) {
  const day = new Day(data.num, data.events);
  day.state = data.state || 0;
  return day;
};

module.exports = Day;
