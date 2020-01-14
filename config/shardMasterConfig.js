// Copyright 2020 Campbell Crowley. All rights reserved.
// Author: Campbell Crowley (web@campbellcrowley.com)

/**
 * @description Configuration for the Shard Master. This config will be updated
 * during runtime if it is edited. Relevant settings may be sent to each shard
 * during each initial setup.
 * @class
 */
class ShardMasterConfig {
  /**
   * @description Create config object.
   */
  constructor() {
    /**
     * @description The number of shards to start if auto detection is turned
     * off.
     * @default
     * @public
     * @type {number}
     */
    this.numShards = 0;
    /**
     * @description Whether to use the shard count Discord recommends for us. If
     * true, the bot name must be specified, and the corresponding token must be
     * available in `../auth.js`.
     * @default
     * @public
     * @type {boolean}
     */
    this.autoDetectNumShards = true;
    /**
     * @description The name of the bot that corresponds to the token to use in
     * `../auth.js`.
     * @default
     * @public
     * @type {string}
     */
    this.botName = 'release';
    /**
     * @description Configuration specifying how detecting if shards are still
     * online shall work.
     * @default
     * @public
     * @type {HeartbeatConfig}
     */
    this.heartbeat = new HeartbeatConfig();
  }
}

/**
 * @description Configuration for the Shard Master. This config will be updated
 * during runtime if it is edited. Relevant settings may be sent to each shard
 * during each initial setup. These settings are related to heartbeat and uptime
 * management. This is included in {@link ShardMasterConfig}.
 * @class
 * @memberof ShardMasterConfig
 */
class HeartbeatConfig {
  /**
   * @description Create config object.
   */
  constructor() {
    /**
     * @description The method used to update shard status.
     *
     * "pull" specifies that the master will attempt to pull the information
     * from the shards at the configured interval.
     *
     * "push" specifies that the shards are expected to push their status to
     * the master at the specified interval.
     *
     * "event" would only send updates from either side if one believes a
     * state to have changed.
     *
     * @public
     * @type {string}
     * @default
     */
    this.updateStyle = 'pull';
    /**
     * @description If relevant, this is the expected interval at which to
     * send/receive updates about an individual shard's status in milliseconds.
     * @public
     * @type {number}
     * @default
     */
    this.interval = 30000;
    /**
     * @description If relevant, should we attempt to disperse the heartbeat
     * requests throughout the interval such that not all requests are made at
     * the same time. This could cause statistics to not line up or be
     * inconsistent.
     * @public
     * @type {boolean}
     * @default
     */
    this.disperse = true;
    /**
     * @description If statistics about messages received from Discord should be
     * used in the evaluation of a shard's alive state. This means, that if no
     * messages are received from Discord between heartbeats, we can assume the
     * shard is dead. This may not be feasible on smaller bots.
     * @public
     * @type {boolean}
     * @default
     */
    this.useMessageStats = true;
    /**
     * @description The timeout after not receiving a heartbeat from a shard to
     * request that it reboots, in milliseconds.
     * @public
     * @type {number}
     * @default
     */
    this.requestRebootAfter = 120000;
    /**
     * @description The timeout after the shard does not receive an update from
     * the master to reboot, as we may be able to assume the bot was intended to
     * be shut down completely, and we have lost communication (milliseconds).
     * @public
     * @type {number}
     * @default
     */
    this.expectRebootAfter = 125000;
  }
}

ShardMasterConfig.HeartbeatConfig = HeartbeatConfig;

module.exports = ShardMasterConfig;
