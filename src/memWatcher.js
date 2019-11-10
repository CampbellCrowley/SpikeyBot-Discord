// Copyright 2019 Campbell Crowley. All rights reserved.
// Author: Campbell Crowley (dev@campbellcrowley.com)
const SubModule = require('./subModule.js');
const v8 = require('v8');

/**
 * @description Manages watching memory limits and attempts to mitigate issues
 * that may arise as a result.
 * @augments SubModule
 */
class MemWatcher extends SubModule {
  /**
   * @description Manages watching memory limits and attempts to mitigate issues
   * that may arise as a result.
   */
  constructor() {
    super();
    /** @inheritdoc */
    this.myName = 'MemWatcher';
    /**
     * @description How often to check memory usage.
     * @private
     * @type {number}
     * @default 5 Minutes
     * @constant
     */
    this._frequency = 5 * 60 * 1000;
    /**
     * @description Amount of memory in bytes away from the limit to force this
     * process to suicide.
     * @private
     * @type {number}
     * @default 100000000 bytes (100MB)
     * @constant
     */
    this._threshold = 100 * 1000 * 1000;

    /**
     * @description If a single event loop takes longer than this time, log that
     * something went wrong.
     * @private
     * @type {number}
     * @default 1000 milliseconds
     * @constant
     */
    this._loopWarnThresh = 1000;
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
    this._loopLogFrequency = 60000;
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
     * @type {number}
     * @default
     */
    this._totalLoopTime = 0;
    /**
     * @description The number of event loops that took place during the last
     * interval.
     * @private
     * @type {number}
     * @default
     */
    this._numLoops = 0;

    this.check = this.check.bind(this);
    this.suicide = this.suicide.bind(this);
    this._queueLoopCheck = this._queueLoopCheck.bind(this);
  }
  /** @inheritdoc */
  initialize() {
    /**
     * @description Created interval for checking memory usage.
     * @private
     * @type {?number}
     */
    this._interval = setInterval(this.check, this._frequency);
    this.check();

    this._watchLoop = true;
    setImmediate(this._queueLoopCheck);
  }
  /** @inheritdoc */
  shutdown() {
    this._watchLoop = false;
    clearInterval(this._interval);
  }
  /** @inheritdoc */
  save() {}

  /**
   * @description Check the current memory usage. Called in the interval, but
   * can also be fired manually.
   * @public
   */
  check() {
    const mem = v8.getHeapStatistics();
    const limit = mem.heap_size_limit;
    const total = mem.total_heap_size;

    const mult = 1000000;

    const limitHR = Math.round(limit / mult * 100) / 100;
    const totalHR = Math.round(total / mult * 100) / 100;
    const nums = `${total}/${limit}B (${totalHR}/${limitHR}MB)`;
    const thresh =
        `${limit-this._threshold-total} from threshold (${this._threshold})`;

    this.debug(`Heap Snapshot: ${nums} ${thresh}`);

    if (total >= limit - this._threshold) {
      this.suicide();
      return;
    }
  }
  /**
   * @description Attempts to force the bot to die because we are probably about
   * to run out of memory and are about to crash anyways.
   * @public
   */
  suicide() {
    this.warn(
        'Causing process to suicide due to memory threshold being crossed.');
    process.exit(-2);
  }

  /**
   * @description Time how long the next event loop will take. Calls itself
   * every event loop until {@see _watchLoop} is set to false.
   * @private
   */
  _queueLoopCheck() {
    const now = Date.now();
    if (this._lastLoopTime != 0) {
      const delta = now - this._lastLoopTime;
      if (delta > this._loopWarnThresh) {
        this.warn(`Previous event loop took: ${delta}ms!`);
      }
      this._maxLoopTime = Math.max(this._maxLoopTime, delta);
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
      this._totalLoopTime = 0;
      this._numLoops = 0;
      this._loopLogTime = now;
    }
    if (!this._watchLoop) return;
    this._lastLoopTime = now;
    setImmediate(this._queueLoopCheck);
  }
}
module.exports = new MemWatcher();
