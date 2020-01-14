// Copyright 2019-2020 Campbell Crowley. All rights reserved.
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

    this.check = this.check.bind(this);
    this.suicide = this.suicide.bind(this);
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
  }
  /** @inheritdoc */
  shutdown() {
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
}
module.exports = new MemWatcher();
