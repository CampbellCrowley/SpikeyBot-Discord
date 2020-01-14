// Copyright 2019-2020 Campbell Crowley. All rights reserved.
// Author: Campbell Crowley (web@campbellcrowley.com)
const http = require('http');
const socketIo = require('socket.io');
const Discord = require('discord.js');
// const crypto = require('crypto');
const common = require('./common.js');
const path = require('path');
const fs = require('fs');

const usersFile = path.resolve(__dirname + '/../../save/knownShards.json');
const configFile =
    path.resolve(__dirname + '/../../config/shardMasterConfig.js');
const authFile = path.resolve(__dirname + '/../../auth.js');

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
     * @type {?object.<{key: string, stats: ShardStatus}>}
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
        this._knownUsers = JSON.parse(data);
        common.logDebug('Updated known users from file.');
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
    // const goal = this.getGoalShardCount();
    // const current = this.getCurrentShardCount();
    // const known = this.getKnownShardCount();
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
    // x-forwarded-for is trusted because the last process this jumps through is
    // our local proxy.
    const ipName = common.getIPName(
        socket.handshake.headers['x-forwarded-for'] ||
        socket.handshake.address);
    common.log(
        `Socket    connected (${this.getNumClients()}): ${ipName}`, socket.id);
    this._sockets[socket.id] = socket;

    socket.on('disconnect', (reason) => {
      const num = this.getNumClients() - 1;
      common.log(
          `Socket disconnected (${num})(${reason}): ${ipName}`, socket.id);
      delete this._sockets[socket.id];
    });

    const shardAuth = socket.handshake.headers['authorization'];
    if (!shardAuth) {
      common.logDebug(
          'Socket attempted connection without authorization header.',
          socket.id);
      socket.disconnect(true);
      return;
    }
    const [userId, userPass] = shardAuth.split(';');
    if (!userId || !this._knownUsers[userId] || !userPass) {
      common.logDebug(
          'Socket attempted connection with invalid authorization header.',
          socket.id);
      socket.disconnect(true);
      return;
    }
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
      common.error(
          'ShardMaster failed to bind to port for unknown reason.', err);
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

if (require.main === module) {
  console.log('Started via CLI, booting up...');
  const manager = new ShardingMaster(process.argv[2]);

  process.on('SIGINT', manager.exit);
  process.on('SIGTERM', manager.exit);
}

module.exports = ShardingMaster;
