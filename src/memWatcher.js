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

    this.command.on('sweep', (...args) => this._commandSweep(...args));

    /**
     * Sweep users from cache to release memory.
     *
     * @see {@link MemWatcher~sweepUsers}
     *
     * @public
     * @param {*} [args] Passed args.
     * @returns {null} Nothing.
     */
    this.client.sweepUsers = (...args) => this.sweepUsers(...args);
  }
  /** @inheritdoc */
  shutdown() {
    clearInterval(this._interval);
    this.command.removeListener('sweep');
    this.client.sweepUsers = null;
  }
  /** @inheritdoc */
  save() {}

  /**
   * Trigger sweeping of users from cache.
   *
   * @private
   * @type {commandHandler}
   * @param {Discord~Message} msg Message that triggered command.
   * @listens Command#sweep
   */
  _commandSweep(msg) {
    if (msg.author.id != this.common.spikeyId) {
      // this.common.reply(msg, 'You can\'t use this command.');
      return;
    }
    const num = this.client.users.cache.size;
    if (this.client.shard) {
      this.client.shard.broadcastEval('this.sweepUsers();')
          .then(() => {
            this.common.reply(
                msg, 'Sweeping users.',
                `${num} --> ${this.client.users.cache.size}`);
          })
          .catch((err) => {
            this.error('Failed to sweep users on shards.');
            console.error(err);
          });
    } else {
      this.sweepUsers();
      this.common.reply(
          msg, 'Sweeping users.', `${num} --> ${this.client.users.cache.size}`);
    }
  }
  /**
   * Cause stale users to be purged from cache.
   *
   * @public
   */
  sweepUsers() {
    const now = Date.now();
    let swept = 0;
    let total = 0;
    let fresh = 0;

    this.client.users.cache.sweep((user) => {
      if (!user.firstSweepTimestamp) {
        user.firstSweepTimestamp = now;
        fresh++;
      }
      total++;
      const sweep = now - user.firstSweepTimestamp > 6 * 60 * 60 * 1000;
      if (sweep) swept++;
      return sweep;
    });

    this.debug(`Swept ${swept} users of ${total}, with ${fresh} new users.`);
  }


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

    this.sweepUsers();
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
