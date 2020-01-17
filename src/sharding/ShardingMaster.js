// Copyright 2019-2020 Campbell Crowley. All rights reserved.
// Author: Campbell Crowley (web@campbellcrowley.com)
const http = require('http');
const socketIo = require('socket.io');
const Discord = require('discord.js');
const crypto = require('crypto');
const common = require('./common.js');
const path = require('path');
const fs = require('fs');

const usersFile = path.resolve(__dirname + '/../../save/knownShards.json');
const configFile =
    path.resolve(__dirname + '/../../config/shardMasterConfig.js');
const authFile = path.resolve(__dirname + '/../../auth.js');
const privKeyFile =
    path.resolve(__dirname + '/../../save/shards/shardMaster.priv');
const pubKeyFile =
    path.resolve(__dirname + '/../../save/shards/shardMaster.pub');

const signAlgorithm = 'RSA-SHA256';
const keyType = 'rsa';
const keyOptions = {
  modulusLength: 4096,
  publicKeyEncoding: {type: 'spki', format: 'pem'},
  privateKeyEncoding: {type: 'pkcs8', format: 'pem'},
};

/**
 * @description The master that manages the shards below it. This is what
 * specifies how many shards may start, which shard has which ID, as well as
 * manages inter-shard communication. Shutdown, start, reboot, and update
 * commands may be issued to individual shards with updated information on how
 * they are expected to be configured. Shards are expected to communicate with
 * this master via websockets once they are ready to receive their role.
 * @class
 */
class ShardingMaster {
  /**
   * @description Start the webserver.
   * @param {number} [port=8080] Port to listen for shard connections.
   * @param {string} [address='127.0.0.1'] Address to listen for shard
   * connections.
   * @param {string} [path='/socket.io/'] Path prefix to watch for socket
   * connections.
   */
  constructor(port = 8080, address = '127.0.0.1', path = '/socket.io/') {
    common.begin(false, true);

    this._serverError = this._serverError.bind(this);
    this._socketConnection = this._socketConnection.bind(this);
    /**
     * @description The string representation of the private key used for
     * signing initial handshake to shard.
     * @see {@link ShardingMaster~_loadMasterKeys}
     * @private
     * @type {?string}
     * @default
     */
    this._privKey = null;
    /**
     * @description The string representation of the public key used for signing
     * initial handshake to shard.
     * @see {@link ShardingMaster~_loadMasterKeys}
     * @private
     * @type {?string}
     * @default
     */
    this._pubKey = null;

    /**
     * @description The timestamp the last time the recommended shard count was
     * requested.
     * @private
     * @type {number}
     * @default
     */
    this._shardNumTimestamp = 0;
    /**
     * @description The number of shards recommended by Discord from our last
     * request.
     * @private
     * @type {number}
     * @default
     */
    this._detectedNumShards = -1;

    /**
     * @description The currently known shards mapped by their name, containing
     * some information about them including their public key.
     * @private
     * @type {?object.<ShardInfo>}
     */
    this._knownUsers = null;
    this._updateUsers();
    fs.watchFile(usersFile, {persistent: false}, (curr, prev) => {
      if (prev.mtime < curr.mtime) this._updateUsers();
    });
    /**
     * @description The current config for sharding.
     * @private
     * @type {?ShardMasterConfig}
     */
    this._config = null;
    this._updateConfig();
    fs.watchFile(configFile, {persistent: false}, (curr, prev) => {
      if (prev.mtime < curr.mtime) this._updateConfig();
    });
    /**
     * @description The current authentication information.
     * @private
     * @type {?object}
     */
    this._auth = null;
    this._updateAuth();
    fs.watchFile(authFile, {persistent: false}, (curr, prev) => {
      if (prev.mtime < curr.mtime) this._updateAuth();
    });

    this._loadMasterKeys();

    /**
     * @description History of recent connections ordered by oldest to latest.
     * Each index contains an array of length 2, storing the IP address and the
     * timestamp of a connection attempt. This is used to start ignoring an IP
     * address if too many connection attempts are made within a short time.
     * @private
     * @type {Array.<Array.<string, number>>}
     * @default
     */
    this._ipConnectHistory = [];

    /**
     * Map of all currently connected sockets.
     *
     * @private
     * @type {object.<Socket>}
     */
    this._sockets = {};
    /**
     * Map of the currently connected sockets for each shard, mapped by the
     * shard names.
     *
     * @private
     * @type {object.<ShardSocket>}
     */
    this._shardSockets = {};

    /**
     * Webserver instance.
     *
     * @private
     * @type {http.Server}
     */
    this._app = http.createServer(this._handler);
    this._app.on('error', this._serverError);
    /**
     * Socket.io instance.
     *
     * @private
     * @type {socketIo.Server}
     */
    this._io = socketIo(this._app, {path: path});

    this._app.listen(port, address);
    this._io.on('connection', this._socketConnection);
  }

  /**
   * @description Check if key-pair exists for this master. If not, they will be
   * generated, and the newly generated keys will be used.
   * @private
   */
  _loadMasterKeys() {
    fs.readFile(privKeyFile, (err, data) => {
      if (err) {
        if (err.code === 'ENOENT') {
          common.log('No keys have been generated yet. Generating some now.');
          ShardingMaster.generateKeyPair((err, pub, priv) => {
            if (err) {
              common.error('Failed to generate keys.');
              console.error(err);
              return;
            }
            this._pubKey = pub.toString();
            this._privKey = priv.toString();
            common.mkAndWrite(
                pubKeyFile, path.dirname(pubKeyFile), pub, (err) => {
                  if (!err) {
                    common.logDebug('Public key created successfully.');
                  } else {
                    common.error('Failed to write public key to file!');
                    console.error(err);
                  }
                });
            common.mkAndWrite(
                privKeyFile, path.dirname(privKeyFile), priv, (err) => {
                  if (err) {
                    common.error('Failed to write private key to file!');
                    console.error(err);
                    return;
                  }
                  fs.chmod(privKeyFile, 0o600, (err) => {
                    if (err) {
                      common.logWarning(
                          'Private key created, but unable to prevent others' +
                          ' from reading the file. Please ensure only the ' +
                          'current user may read and write to: ' + privKeyFile);
                      console.error(err);
                    } else {
                      common.logDebug('Private key created.');
                    }
                  });
                });
          });
        } else {
          common.error('Failed to read private key: ' + privKeyFile);
          console.error(err);
        }
        return;
      }
      if (!data || data.toString().indexOf('PRIVATE KEY') < 0) {
        common.error(
            'Private key appears to be invalid, or does not conform to ' +
            'expected configuration.');
        return;
      }
      this._privKey = data.toString();
    });
    fs.readFile(pubKeyFile, (err, data) => {
      if (err) {
        if (err.code === 'ENOENT') {
          common.logWarning(
              'Public key appears to be missing. If you wish to reset the ' +
              'signing keys, remove the private key as well: ' + privKeyFile);
        } else {
          common.error('Failed to read public key: ' + pubKeyFile);
          console.error(err);
        }
        return;
      }
      if (!data || data.toString().indexOf('PUBLIC KEY') < 0) {
        common.error(
            'Public key appears to be invalid, or does not conform to ' +
            'expected configuration.');
        return;
      }
      this._pubKey = data.toString();
    });
  }

  /**
   * @description Update known list of users and their associated keys.
   * @private
   */
  _updateUsers() {
    const file = usersFile;
    fs.readFile(file, (err, data) => {
      if (err) {
        common.error(`Failed to read ${file}`);
        console.error(err);
        return;
      }
      try {
        const users = JSON.parse(data);
        this._knownUsers = {};
        const ids = [];
        for (const u in users) {
          if (!u || !users[u]) continue;
          ids.push(u);
          this._knownUsers[u] = ShardingMaster.ShardInfo.from(users[u]);
        }
        common.logDebug(`Updated known users from file: ${ids.join(', ')}`);
      } catch (err) {
        common.error(`Failed to parse ${file}`);
        console.error(err);
      }
    });
  }

  /**
   * @description Update the configuration from file.
   * @private
   */
  _updateConfig() {
    const file = configFile;
    delete require.cache[require.resolve(file)];
    try {
      const ShardMasterConfig = require(file);
      this._config = new ShardMasterConfig();
      this._refreshShardStatus();
    } catch (err) {
      common.error(`Failed to parse ${file}`);
      console.error(err);
    }
  }

  /**
   * @description Update the authentication tokens from file.
   * @private
   */
  _updateAuth() {
    const file = authFile;
    delete require.cache[require.resolve(file)];
    try {
      this._auth = require(file);
      this._refreshShardStatus();
    } catch (err) {
      common.error(`Failed to parse ${file}`);
      console.error(err);
    }
  }

  /**
   * @description The config was changed or may differ from the current setup,
   * attempt to make changes to match the current setup the requested
   * configuration.
   * @private
   */
  _refreshShardStatus() {
    // Total running shards.
    const goal = this.getGoalShardCount();
    // Currently available shards we can control.
    const current = this.getCurrentShardCount();
    // Total number of shards that should become available.
    const known = this.getKnownShardCount();
    // Array of references to ShardInfo running with same goal count.
    const correct = this._getCurrentConfigured(goal);
    // Array of references to ShardInfo for each shard not configured correctly.
    const incorrect = this._getCurrentUnconfigured(goal);
    // The missing shard IDs that need to exist.
    const newIds = this._getCurrentUnboundIds(goal);

    // Array of shards transitioning from "incorrect" to "correct".
    const configuring = [];

    if (goal > known) {
      // TODO: Generate new shard keys and configuration. Then email them to
      // sysadmins.
    }
    if (goal > current) {
      common.logWarning(
          `${goal} shards are queued to startup but only ${current}` +
          ' shards are available!');
    }

    // TODO: Handle temporary socket disconnects to shards. If the shard is
    // still online and hasn't hit the heartbeat timeout yet, don't start a new
    // shard until we're sure the other one has died completely.

    const foundIds = [];
    correct.sort((a, b) => b.bootTime - a.bootTime);
    for (let i = 0; i < correct.length; ++i) {
      const el = correct[i];

      const match = foundIds.find(
          (f) => f.shardId === el.goalShardId && f.count === el.goalShardCount);
      if (match) {
        common.logWarning(
            'Found multiple shards configured the same way! Killing the ' +
            'oldest one.');
        const s = correct.splice(i, 1)[0];
        i--;
        configuring.push(s);
        s.goalShardId = -1;
        s.goalShardCount = -1;
      } else {
        foundIds.push({
          shardId: el.goalShardId,
          count: el.goalShardCount,
        });
      }
    }

    newIds.forEach((el) => {
      if (incorrect.length <= 0) return;

      const s = incorrect.splice(0, 1)[0];
      configuring.push(s);
      s.goalShardId = el;
      s.goalShardCount = goal;
    });

    // TODO: Send new configurations to shards if necessary. Ensure
    // `this._config` is obeyed.
  }
  /**
   * @description Fetch the current goal number of shards we are attempting to
   * keep alive. Returns -1 if goal has not been set yet, or is otherwise
   * unavailable.
   * @public
   * @returns {number} The number of shards we are attempting to create, -1 if
   * the value is otherwise unknown.
   */
  getGoalShardCount() {
    const now = Date.now();

    if (this._config.autoDetectNumShards) {
      this._config.numShards = this._detectedNumShards;

      if (now - this._config.autoDetectInterval > this._shardNumTimestamp) {
        const token = this._auth[this._config.botName];

        if (!token) {
          if (this._auth) {
            common.logWarning(
                'Unable to fetch shard count due to no bot token.');
          }
          return this._config.numShards;
        }

        this._shardNumTimestamp = now;
        Discord.util.fetchRecommendedShards(token, 1250)
            .then((num) => {
              const updated = this._detectedNumShards != num;
              this._detectedNumShards = num;
              if (updated) this._refreshShardStatus();
            })
            .catch((err) => {
              common.error(
                  'Unable to fetch shard count due to failed request.');
              console.error(err);
            });
      }
    }
    return this._config.numShards;
  }

  /**
   * @description Fetches the current number of shards connected to us that we
   * are controlling.
   * @public
   * @returns {number} The current number of shards we are controlling.
   */
  getCurrentShardCount() {
    return Object.keys(this._shardSockets).length;
  }

  /**
   * @description Fetches the current number of shards that we know about and
   * may talk to us.
   * @public
   * @returns {number} The number of shards allowed to startup.
   */
  getKnownShardCount() {
    return Object.keys(this._knownUsers).length;
  }

  /**
   * @description Fetches the current number of shards that are configured for
   * the goal number of shards.
   * @public
   * @param {number} [goal] The goal number of shards. If not specified, {@link
   * getGoalShardCount} will be used.
   * @returns {number} The number of shards configured.
   */
  getCurrentConfiguredCount(goal) {
    return this._getCurrentConfigured(goal).length;
  }

  /**
   * @description Get references to all shards currently configured for the
   * given goal number of shards, and are connected and controllable.
   * @private
   * @param {number} [goal] The goal number of shards. If not specified, {@link
   * getGoalShardCount} will be used.
   * @returns {ShardInfo[]} Array of the shards that are configured correctly
   * and don't need updating.
   */
  _getCurrentConfigured(goal) {
    if (typeof goal !== 'number' || goal < 0) {
      goal = this.getGoalShardCount();
    }
    return Object.values(this._knownUsers)
        .filter(
            (el) => el.goalShardCount === goal && this._shardSockets[el.id]);
  }
  /**
   * @description Get references to all shards currently NOT configured for the
   * given goal number of shards, but ARE connected and controllable.
   * @private
   * @param {number} [goal] The goal number of shards. If not specified, {@link
   * getGoalShardCount} will be used.
   * @returns {ShardInfo[]} Array of the shards that are NOT configured
   * correctly and DO need updating.
   */
  _getCurrentUnconfigured(goal) {
    if (typeof goal !== 'number' || goal < 0) {
      goal = this.getGoalShardCount();
    }
    return Object.values(this._knownUsers)
        .filter(
            (el) => el.goalShardCount !== goal && this._shardSockets[el.id]);
  }
  /**
   * @description Get list of IDs for shards that do not exist, but need to.
   * @private
   * @param {number} [goal] The goal number of shards. If not specified, {@link
   * getGoalShardCount} will be used.
   * @returns {number[]} Array of the shard IDs that need to be configured.
   */
  _getCurrentUnboundIds(goal) {
    if (typeof goal !== 'number' || goal < 0) {
      goal = this.getGoalShardCount();
    }
    const ids = [...Object.keys(new Array(goal))];
    Object.values(this._knownUsers).forEach((el) => {
      if (el.goalShardCount === goal) {
        const index = ids.indexOf(el.goalShardId);
        if (index >= 0) {
          ids.splice(index, 1);
        } else {
          common.error(
              'Failed to remove shard ID from list. Are multiple shards using' +
              ' the same ID? (' + el.goalShardId + ')');
        }
      }
    });
    return ids;
  }

  /**
   * @description Get a reference to a ShardInfo object using its shard ID.
   * @private
   * @param {number} shardId The shard ID used by Discord.
   * @returns {?ShardInfo} The matched shard info, or null if it couldn't be
   * found.
   */
  _getShardById(shardId) {
    return Object.values(this._knownUsers)
        .find((el) => el.goalShardId === shardId);
  }

  /**
   * Handler for all http requests. This may get used in the future for API
   * requests. Currently unused and always replies with a "501 Not Implemented"
   * response.
   *
   * @private
   * @param {http.IncomingMessage} req The client's request.
   * @param {http.ServerResponse} res Our response to the client.
   */
  _handler(req, res) {
    res.writeHead(501);
    if (req.method === 'GET') {
      res.end('Not Implemented');
    } else {
      res.end();
    }
  }

  /**
   * Returns the number of connected clients.
   *
   * @public
   * @returns {number} Number of sockets.
   */
  getNumClients() {
    return Object.keys(this._sockets).length;
  }

  /**
   * Handler for a new socket connecting.
   *
   * @private
   * @this bound
   * @param {socketIo~Socket} socket The socket.io socket that connected.
   */
  _socketConnection(socket) {
    const now = Date.now();
    // x-forwarded-for is trusted because the last process this jumps through is
    // our local proxy.
    const ipName = common.getIPName(
        socket.handshake.headers['x-forwarded-for'] ||
        socket.handshake.address);
    this._ipConnectHistory.push([ipName, now]);
    let remove = 0;
    let ipCount = 0;
    let i = 0;
    while (ipCount < this._config.connCount &&
           i < this._ipConnectHistory.length) {
      if (now - this._ipConnectHistory[i][1] >= this._config.connTime) {
        remove = i + 1;
      } else if (ipName === this._ipConnectHistory[i][0]) {
        ipCount++;
      }
      ++i;
    }
    if (remove > 0) {
      this._ipConnectHistory.splice(0, remove);
    }
    if (ipCount >= this._config.connCount) {
      socket.disconnect(true);
      return;
    }
    common.log(
        `Socket    connected (${this.getNumClients()}): ${ipName}`, socket.id);
    this._sockets[socket.id] = socket;

    socket.on('disconnect', (reason) => {
      const num = this.getNumClients() - 1;
      common.log(
          `Socket disconnected (${num})(${reason}): ${ipName}`, socket.id);
      delete this._sockets[socket.id];
      if (socket.userId) delete this._shardSockets[socket.userId];
    });

    const shardAuth = socket.handshake.headers['authorization'];
    if (!shardAuth) {
      common.logDebug(
          'Socket attempted connection without authorization header.',
          socket.id);
      socket.disconnect(true);
      return;
    }
    const [userId, userSig, timestamp] = shardAuth.split(';');
    if (!userId || !userSig || !(timestamp * 1)) {
      common.logDebug(
          'Socket attempted connection with invalid authorization header.',
          socket.id);
      socket.disconnect(true);
      return;
    }

    if (!this._knownUsers) {
      common.logDebug(
          'Socket attempted connection before known users were loaded.',
          socket.id);
      socket.disconnect(true);
      return;
    }

    if (!this._knownUsers[userId]) {
      common.logDebug(
          'Socket attempted connection with invalid user ID: ' + userId,
          socket.id);
      socket.disconnect(true);
      return;
    }

    if (this._shardSockets[userId]) {
      common.logWarning(
          'Socket attempted connection ID of shard that is already connected!',
          socket.id);
      socket.disconnect(true);
      return;
    }

    if (Math.abs(timestamp - now) > this._config.tsPrecision) {
      common.logDebug(
          'Socket attempted connection with invalid timestamp header.',
          socket.id);
      socket.disconnect(true);
      return;
    }

    if (!this._privKey) {
      common.logDebug(
          'Socket attempted connection prior to us loading private key.',
          socket.id);
      socket.disconnect(true);
      return;
    }

    const user = this._knownUsers[userId];
    const verify = crypto.createVerify(signAlgorithm);
    verify.update(`${userId}${timestamp}`);
    verify.end();
    if (!verify.verify(user.key, userSig)) {
      common.logDebug(
          'Socket attempted connection but we failed to verify signature.',
          socket.id);
      socket.disconnect(true);
      return;
    }

    user.lastSeen = now;
    socket.userId = userId;

    const sign = crypto.createSign(signAlgorithm);
    sign.update(`Look at me, I'm the captain now. ${now}`);
    sign.end();
    const masterSig = sign.sign(this._privKey, 'utf8');
    socket.emit('masterVerification', masterSig);

    this._refreshShardStatus();

    socket.on('status', (status) => {
      common.logDebug(`${userId} updated status.`, socket.id);
      user.lastSeen = Date.now();
      try {
        console.log(userId, ':', status);
        status = ShardingMaster.ShardStatus.from(status);
      } catch (err) {
        common.error(
            `Failed to parse shard status from shard ${userId}`, socket.id);
        console.error(err);
        return;
      }
      user.stats = status;
      // TODO: Update StatusInfo current shard configuration.
    });
  }

  /**
   * @description Generates a key pair using configured settings for either the
   * master or its shards. The settings used cannot differ between any parties
   * involved, otherwise all keys must be changed.
   *
   * @see {@link
   * https://nodejs.org/api/crypto.html#crypto_crypto_generatekeypair_type_options_callback}
   *
   * @public
   * @static
   * @param {Function} cb Callback with optional error, then public key, then
   * private key.
   */
  static generateKeyPair(cb) {
    crypto.generateKeyPair(keyType, keyOptions, cb);
  }

  /**
   * @description Server has encountered an error, and must close.
   * @private
   * @this bound
   * @param {Error} err The emitted error event.
   */
  _serverError(err) {
    if (this._io) this._io.close();
    if (this._app) this._app.close();
    if (err.code === 'EADDRINUSE') {
      common.error(
          'ShardMaster failed to bind to port because it is in use. (' +
          err.port + ')');
    } else {
      common.error('ShardMaster failed for unknown reason.');
      console.error(err);
    }
    process.exit(1);
  }

  /**
   * @description Cleanup and fully shutdown gracefully.
   * @public
   */
  exit() {
    if (this._io) this._io.close();
    if (this._app) this._app.close();
    fs.unwatchFile(usersFile);
    fs.unwatchFile(configFile);
    fs.unwatchFile(authFile);
    process.exit(0);
  }
}

ShardingMaster.ShardMasterConfig = require(configFile);
ShardingMaster.ShardStatus = require('./ShardStatus.js');
ShardingMaster.ShardInfo = require('./ShardInfo.js');

if (require.main === module) {
  console.log('Started via CLI, booting up...');
  const manager = new ShardingMaster(process.argv[2]);

  process.on('SIGINT', manager.exit);
  process.on('SIGTERM', manager.exit);
}

module.exports = ShardingMaster;
