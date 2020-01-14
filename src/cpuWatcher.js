// Copyright 2020 Campbell Crowley. All rights reserved.
// Author: Campbell Crowley (dev@campbellcrowley.com)
const SubModule = require('./subModule.js');

/**
 * @description Manages watching loop timings to help find causes of
 * inconsistent event loops.
 * @augments SubModule
 */
class CpuWatcher extends SubModule {
  /**
   * @description Manages watching loop timings to help find causes of
   * inconsistent event loops.
   */
  constructor() {
    super();
    /** @inheritdoc */
    this.myName = 'CpuWatcher';

    /**
     * @description If a single event loop takes longer than this time, log that
     * something went wrong.
     * @private
     * @type {number}
     * @default 1000000 nanoseconds
     * @constant
     */
    this._loopWarnThresh = 1000000;
    /**
     * @description Flag of whether to keep monitoring the event loop timing.
     * @private
     * @type {boolean}
     * @default
     */
    this._watchLoop = false;
    /**
     * @description The timestamp of the last event loop start.
     * @private
     * @type {number}
     * @default
     */
    this._lastLoopTime = 0;
    /**
     * @description How often to log periodic event loop statistics.
     * @private
     * @type {number}
     * @default 60 seconds
     * @constant
     */
    this._loopLogFrequency = 60000000;
    /**
     * @description Timestamp of the last time loop timings were logged.
     * @private
     * @type {number}
     * @default
     */
    this._loopLogTime = 0;
    /**
     * @description The amount of time the longest event loop took during the
     * last interval.
     * @private
     * @type {number}
     * @default
     */
    this._maxLoopTime = 0;
    /**
     * @description The sum of all event loop delays during the last interval
     * for averaging.
     * @private
     * @type {bigint}
     * @default
     */
    this._totalLoopTime = BigInt(0);
    /**
     * @description The number of event loops that took place during the last
     * interval.
     * @private
     * @type {bigint}
     * @default
     */
    this._numLoops = BigInt(0);

    this._queueLoopCheck = this._queueLoopCheck.bind(this);
  }

  /** @inheritdoc */
  initialize() {
    this._watchLoop = true;
    setImmediate(this._queueLoopCheck);
  }
  /** @inheritdoc */
  shutdown() {
    this._watchLoop = false;
  }

  /**
   * @description Time how long the next event loop will take. Calls itself
   * every event loop until {@see _watchLoop} is set to false.
   * @private
   */
  _queueLoopCheck() {
    const now = process.hrtime.bigint();
    if (this._lastLoopTime != 0) {
      const delta = now - this._lastLoopTime;
      if (delta > this._loopWarnThresh) {
        this.warn(`Previous event loop took: ${delta} nano seconds!`);
      }
      this._maxLoopTime =
          (delta > this._maxLoopTime && this._maxLoopTime) || delta;
      this._totalLoopTime += delta;
      this._numLoops++;
    } else {
      this._loopLogTime = now;
    }
    if (now - this._loopLogTime > this._loopLogFrequency) {
      this.debug(
          'Loop Timings: Max: ' + this._maxLoopTime + ' Avg: ' +
          (this._totalLoopTime / this._numLoops) + ' Sum: ' +
          this._totalLoopTime + ' Duration: ' + this._loopLogFrequency);

      this._maxLoopTime = 0;
      this._totalLoopTime = BigInt(0);
      this._numLoops = BigInt(0);
      this._loopLogTime = now;
    }
    if (!this._watchLoop) return;
    this._lastLoopTime = now;
    setImmediate(this._queueLoopCheck);
  }
}
module.exports = new CpuWatcher();
