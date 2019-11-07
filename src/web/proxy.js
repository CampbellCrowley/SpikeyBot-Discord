// Copyright 2018-2019 Campbell Crowley. All rights reserved.
// Author: Campbell Crowley (web@campbellcrowley.com)
const fs = require('fs');
const http = require('http');
const https = require('https');
const socketIo = require('socket.io');
const sIOClient = require('socket.io-client');
const querystring = require('querystring');
const auth = require('../../auth.js');
const crypto = require('crypto');
const dateFormat = require('dateformat');

const clientId = '444293534720458753';
const clientSecret = auth.webSecret;
require('../subModule.js').extend(WebProxy);  // Extends the SubModule class.

delete require.cache[require.resolve('./WebUserData.js')];
const WebUserData = require('./WebUserData.js');

/**
 * @classdesc Proxy for account authentication.
 * @class
 * @augments SubModule
 */
function WebProxy() {
  const self = this;

  /** @inheritdoc */
  this.myName = 'Proxy';

  /**
   * The url to send a received `code` to via `POST` to receive a user's
   * tokens.
   *
   * @private
   * @default
   * @type {{host: string, path: string, protocol: string}}
   * @constant
   */
  const tokenHost = {
    protocol: 'https:',
    host: 'discordapp.com',
    path: '/api/oauth2/token',
    method: 'POST',
    headers: {
      'User-Agent': require('../common.js').ua,
    },
  };
  /**
   * The url to send a request to the discord api.
   *
   * @private
   * @default
   * @type {{host: string, path: string, protocol: string}}
   * @constant
   */
  const apiHost = {
    protocol: 'https:',
    host: 'discordapp.com',
    path: '/api',
    method: 'GET',
    headers: {
      'User-Agent': require('../common.js').ua,
    },
  };

  const pathPorts = {
    '/socket.io/dev/hg/': 8013,
    '/socket.io/hg/': 8011,
    '/socket.io/dev/account/': 8015,
    '/socket.io/account/': 8014,
    '/socket.io/dev/control/': 8021,
    '/socket.io/control/': 8020,
  };

  /**
   * The current OAuth2 access information for a single session.
   *
   * @typedef LoginState
   *
   * @property {string} access_token The current token for api requests.
   * @property {string} token_type The type of token (Usually 'Bearer').
   * @property {number} expires_in Number of seconds after the token is
   * authorized at which it becomes invalid.
   * @property {string} refresh_token Token used to refresh the expired
   * access_token.
   * @property {string} scope The scopes that the access_token has access to.
   * @property {number} expires_at The unix timestamp when the access_token
   * expires.
   * @property {number} expiration_date The unix timestamp when we consider the
   * session to have expired, and the session is deleted.
   * @property {string} session The 64 byte base64 string that identifies this
   * session to the client.
   * @property {?Timeout} refreshTimeout The current timeout registered for
   * refreshing the access_token.
   */

  /**
   * Stores the tokens and associated data for all clients connected while data
   * is valid. Mapped by session id.
   *
   * @private
   * @type {object.<LoginState>}
   */
  let loginInfo = {};
  const currentSessions = {};
  /**
   * Cache of requests to the Discord API to reduce duplicate calls and reduce
   * rate limiting. Mapped by user ID and request path. If user ID is unknown,
   * requests are not cached.
   *
   * @private
   * @type {object.<Function[]>}
   */
  const reqCache = {};

  /**
   * File storing website rate limit specifications.
   *
   * @private
   * @type {string}
   */
  const rateLimitFile = './save/webRateLimits.json';

  /**
   * Object storing parsed rate limit info from {@link rateLimitFile}.
   *
   * @private
   * @type {object}
   * @default
   */
  let rateLimits = {
    commands: {
      'restore': 'auth',
      'authorize': 'auth',
    },
    groups: {
      auth: {num: 1, delta: 2},
      global: {num: 2, delta: 2},
    },
  };

  /** @inheritdoc */
  this.initialize = function() {
    app.listen(self.common.isRelease ? 8010 : 8012, '127.0.0.1');
    self.common.connectSQL();
  };

  /**
   * Causes a full shutdown of all servers.
   *
   * @public
   */
  this.shutdown = function() {
    if (io) io.close();
    if (app) app.close();
    clearInterval(purgeInterval);
    fs.unwatchFile(rateLimitFile);
    loginInfo = {};
  };

  /** @inheritdoc */
  this.save = function(opt) {
    const toSave = {};
    for (const i in loginInfo) {
      if (!loginInfo[i]) continue;
      toSave[i] = Object.assign({}, loginInfo[i]);
      if (toSave[i].refreshTimeout) delete toSave[i].refreshTimeout;
    }
    if (opt === 'async') {
      fs.writeFile('./save/webClients.json', JSON.stringify(toSave), (err) => {
        if (!err) return;
        self.error('Failed to write webClients.json');
        console.error(err);
      });
    } else {
      fs.writeFileSync('./save/webClients.json', JSON.stringify(toSave));
    }
  };

  /** @inheritdoc */
  this.unloadable = function() {
    return true;
  };

  /**
   * Parse rate limits from file.
   *
   * @private
   */
  function updateRateLimits() {
    fs.readFile(rateLimitFile, (err, data) => {
      if (err) {
        self.error('Failed to read ' + rateLimitFile);
        return;
      }
      try {
        const parsed = JSON.parse(data);
        if (!parsed) return;
        rateLimits = parsed;
      } catch (e) {
        console.error(e);
      }
    });
  }
  updateRateLimits();
  fs.watchFile(rateLimitFile, {persistent: false}, (curr, prev) => {
    if (curr.mtime == prev.mtime) return;
    if (self.initialized) {
      self.debug('Re-reading rate limits from file');
    } else {
      console.log('WebProxy: Re-reading rate limits from file');
    }
    updateRateLimits();
  });

  // TODO: Move loginInfo into multiple files to prevent all sessions being kept
  // in memory at all times across all shards.
  fs.readFile('./save/webClients.json', (err, data) => {
    if (aborted) return;
    if (err) {
      if (err.code !== 'ENOENT') {
        console.error(err);
      }
      loginInfo = {};
      return;
    }
    try {
      loginInfo = JSON.parse(data);
      self.debug(Object.keys(loginInfo).length + ' sessions loaded from file.');
    } catch (err) {
      console.error('Failed to parse webClients.json', err);
    }
  });
  const purgeInterval = setInterval(purgeSessions, 60 * 60 * 1000);

  /**
   * Purge stale data from loginInfo.
   *
   * @private
   */
  function purgeSessions() {
    const keys = Object.keys(loginInfo);
    const now = Date.now();
    for (const i in keys) {
      if (loginInfo[keys[i]].expirationDate < now) {
        clearTimeout(loginInfo[keys[i]].refreshTimeout);
        delete loginInfo[keys[i]];
      }
    }
  }

  const app = http.createServer(handler);
  const io = socketIo(app, {path: '/socket.io/'});

  let aborted = false;

  app.on('error', function(err) {
    if (err.code === 'EADDRINUSE') {
      aborted = true;
      self.shutdown(true);
      self.debug(
          'Proxy failed to bind to port because it is in use. (' + err.port +
          ')');
    } else {
      self.error('Proxy failed to bind to port for unknown reason.', err);
    }
  });

  /**
   * Handler for all http requests. Should never be called.
   *
   * @private
   * @param {http.IncomingMessage} req The client's request.
   * @param {http.ServerResponse} res Our response to the client.
   */
  function handler(req, res) {
    res.writeHead(418);
    res.end('TEAPOT');
  }

  /**
   * Map of all currently connected sockets.
   *
   * @private
   * @type {object.<Socket>}
   */
  const sockets = {};

  io.on('connection', socketConnection);
  /**
   * Handler for a new socket connecting.
   *
   * @private
   * @param {socketIo~Socket} socket The socket.io socket that connected.
   */
  function socketConnection(socket) {
    // x-forwarded-for is trusted because the last process this jumps through is
    // our local proxy.
    const ipName = self.common.getIPName(
        socket.handshake.headers['x-forwarded-for'] ||
        socket.handshake.address);

    const reqPath = socket.handshake.url.split('?')[0];

    /**
     * @description User data to inject alongside requests. Null if user isn't
     * signed in yet, or is generally unknown.
     * @private
     * @type {?WebUserData}
     * @default
     */
    let userData = null;
    let session;
    do {
      session = crypto.randomBytes(64).toString('base64');
    } while (loginInfo[session]);
    let restoreAttempt = false;
    /**
     * A number representing how abusive the client is being. This is the
     * previous calculated value.
     *
     * At different levels we will react to messages differently.
     * Level 0: All requests will be handled normally.
     * Level 1: Requests will be handled normally, with an additional warning.
     * Level 2: All requests will receive a http 429 equivalent reply.
     * Level 3: All requests are ignored and no response will be provided.
     * Level 4: The connection will be closed immediately.
     *
     * @private
     * @type {number}
     * @default
     */
    let rateLevel = 0;
    /**
     * All requests from the client that are still relevant to a rate limit
     * group.
     *
     * @private
     * @type {Array.<{time: number, cmd: string}>}
     */
    const history = [];
    /**
     * The historic quantities for each rate limit group.
     *
     * @private
     * @type {object.<number>}
     */
    const rateHistory = {};

    self.common.logDebug(
        'Socket connected (' + Object.keys(sockets).length + '): ' + reqPath +
            ' ' + ipName,
        socket.id);
    if (!pathPorts[reqPath]) {
      self.common.error(
          'Client requested unknown endpoint: ' + reqPath, socket.id);
      socket.disconnect();
      return;
    }
    sockets[socket.id] = socket;
    const server = sIOClient('http://localhost:' + pathPorts[reqPath], {
      path: reqPath,
      extraHeaders:
          {'x-forwarded-for': socket.handshake.headers['x-forwarded-for']},
    });

    // Add custom semi-wildcard listeners.
    const sonevent = server.onevent;
    server.onevent = function(packet) {
      const args = packet.data || [];
      if (server.listeners(args[0]).length) {
        sonevent.call(this, packet);
      } else {
        packet.data = ['*'].concat(args);
        sonevent.call(this, packet);
      }
    };
    server.on('connect', () => {
      socket.on('*', (...args) => {
        server.emit(
            ...[args[0], userData && userData.serializable].concat(
                args.slice(1)));
      });
    });
    server.on('*', (...args) => {
      socket.emit(...args);
    });
    server.on('disconnect', () => {
      socket.disconnect();
    });
    const onevent = socket.onevent;
    socket.onevent = function(packet) {
      const args = packet.data || [];
      rateLevel = updateRateLevel(args[0]);
      if (rateLevel > 1) return;
      if (socket.listenerCount(args[0])) {
        onevent.call(this, packet);
      } else {
        packet.data = ['*'].concat(args);
        onevent.call(this, packet);
      }
    };

    socket.on('restore', (sess) => {
      if (restoreAttempt /* || currentSessions[sess]*/) {
        socket.emit('authorized', 'Restore Failed', null);
        // console.error(restoreAttempt, sess);
        return;
      }
      currentSessions[sess] = true;
      restoreAttempt = true;
      if (loginInfo[sess]) {
        session = sess;
        // Refresh the token if it has expired, or is close to expiring (within
        // 24 hours).
        if (loginInfo[session].expires_at - 1 * 24 * 60 * 60 * 1000 <
            Date.now()) {
          const info = loginInfo[session];
          refreshToken(info.refresh_token, info.scope, (err, data) => {
            if (!err) {
              let parsed;
              try {
                parsed = JSON.parse(data);
                self.log('Refreshed token');
              } catch (err) {
                self.error(
                    'Failed to parse request from discord token refresh: ' +
                    err);
                console.error('Parsing failed', sess);
                socket.emit('authorized', 'Restore Failed', null);
                return;
              }
              receivedLoginInfo(parsed);
              fetchIdentity(loginInfo[session], (identity) => {
                userData = identity;
                if (userData) {
                  socket.emit('authorized', null, userData.serializable);
                  self.common.logDebug('Authorized ' + userData.id, socket.id);
                } else {
                  socket.emit('authorized', 'Getting user data failed', null);
                  self.common.logWarning('Failed to authorize', socket.id);
                  logout();
                }
              });
            } else {
              self.warn('Refreshing token failed');
              console.error(err, loginInfo[session]);
              socket.emit('authorized', 'Restore Failed', null);
            }
          });
        } else {
          fetchIdentity(loginInfo[session], (identity) => {
            userData = identity;
            if (userData) {
              socket.emit('authorized', null, userData.serializable);
              self.common.logDebug('Authorized ' + userData.id, socket.id);
            } else {
              socket.emit('authorized', 'Getting user data failed', null);
              self.common.logWarning('Failed to fetch identity', socket.id);
              logout();
            }
          });
        }
      } else {
        self.common.logWarning('Nothing to restore ' + sess, socket.id);
        socket.emit('authorized', 'Restore Failed', null);
      }
    });

    socket.on('authorize', (code) => {
      currentSessions[session] = true;
      authorizeRequest(code, (err, res) => {
        if (err) {
          socket.emit('authorized', 'Failed to authorize', null);
          console.error(err);
          logout();
        } else {
          receivedLoginInfo(JSON.parse(res));
          fetchIdentity(loginInfo[session], (identity) => {
            userData = identity;
            socket.emit('authorized', null, userData && userData.serializable);
            if (userData) {
              self.common.logDebug('Authorized ' + userData.id, socket.id);
            } else {
              self.common.logWarning('Failed to authorize', socket.id);
              logout();
            }
          });
        }
      });
    });

    socket.on('logout', logout);

    socket.on('disconnect', () => {
      self.common.logDebug(
          'Socket disconnected (' + (Object.keys(sockets).length - 1) + '): ' +
              ipName,
          socket.id);
      if (loginInfo[session]) clearTimeout(loginInfo[session].refreshTimeout);
      delete sockets[socket.id];
      if (server) server.close();
    });

    /**
     * Cause the current user session to logout.
     *
     * @private
     */
    function logout() {
      if (loginInfo[session]) {
        clearTimeout(loginInfo[session].refreshTimeout);
        const token = loginInfo[session].refresh_token;
        delete loginInfo[session];
        revokeToken(token, (err) => {
          delete currentSessions[session];
          if (err) {
            self.warn(
                'Failed to revoke refresh token, but user has already ' +
                    'signed out: ' + err,
                socket.id);
          }
        });
      } else {
        delete currentSessions[session];
      }
      socket.disconnect();
    }

    /**
     * Received the login credentials for user, lets store it for this
     * session, and refresh the tokens when necessary.
     *
     * @private
     * @param {object} data User data.
     */
    function receivedLoginInfo(data) {
      if (data) {
        /* eslint-disable @typescript-eslint/camelcase */
        data.expires_at = data.expires_in * 1000 + Date.now();
        data.expiration_date = Date.now() + (1000 * 60 * 60 * 24 * 30);
        /* eslint-enable @typescript-eslint/camelcase */
        data.session = session;
        if (loginInfo[session] && loginInfo[session].refresh_token &&
            !data.refresh_token) {
          self.debug(
              'New oauth data does not contain refresh token, but loginInfo ' +
              'still contains a refresh token.');
        }
        loginInfo[session] = Object.assign(loginInfo[session] || {}, data);
        if (!loginInfo[session].refresh_token) {
          self.debug('loginInfo did not have a refresh token.');
        }
        makeRefreshTimeout(loginInfo[session], receivedLoginInfo);
      }
    }

    /**
     * Check if this current connection or user is being rate limited.
     *
     * @see {@link rateLevel}
     *
     * Level 0: <75% of limit.
     * Level 1: >75% <100%
     * Level 2: >100% <125%
     * Level 3: >125% <200%
     * Level 4: >200%
     *
     * @private
     * @param {string} [cmd] The command being attempted. Otherwise uses global
     * rate limits.
     * @returns {number} Current rate level for the given command.
     */
    function updateRateLevel(cmd) {
      const now = Date.now();
      const group = rateLimits.commands[cmd] || 'global';
      if (!rateHistory[group]) rateHistory[group] = 0;
      rateHistory[group]++;
      for (let i = 0; i < history.length; i++) {
        const group = rateLimits.commands[history[i].cmd] || 'global';
        const limits = rateLimits.groups[group] || rateLimits.groups['global'];
        if (now - history[i].time > limits.delta * 1000) {
          rateHistory[group]--;
          history.splice(i, 1);
          i--;
        }
      }
      history.push({time: now, cmd: cmd});
      const limit = rateLimits.groups[group].num;
      const percent = rateHistory[group] / limit;
      if (percent <= 0.75) {
        return 0;
      } else if (percent <= 1) {
        socket.emit('rateLimit', {
          limit: limit,
          current: rateHistory[group],
          request: cmd,
          group: group,
          level: 1,
        });
        return 1;
      } else if (percent <= 1.25) {
        socket.emit('rateLimit', {
          limit: limit,
          current: rateHistory[group],
          request: cmd,
          group: group,
          level: 2,
        });
        return 2;
      } else if (percent <= 2) {
        return 3;
      } else {
        logout();
        return 4;
      }
    }
  }
  /**
   * Fetches the identity of the user we have the token of.
   *
   * @private
   * @param {LoginInfo} loginInfo The credentials of the session user.
   * @param {singleCB} cb The callback storing the user's data, or null if
   * something went wrong.
   */
  function fetchIdentity(loginInfo, cb) {
    apiRequest(loginInfo, '/users/@me', (err, data) => {
      if (!err) {
        const ud = WebUserData.from(JSON.parse(data));
        ud.setSession(loginInfo.session, loginInfo.expiration_date);

        const now = dateFormat(new Date(), 'yyyy-mm-dd HH:MM:ss');
        const toSend = global.sqlCon.format(
            'INSERT INTO Discord (id) values (?) ON DUPLICATE KEY UPDATE ?',
            [ud.id, {lastLogin: now}]);
        global.sqlCon.query(toSend, (err) => {
          if (err) {
            self.error(err);
          }
        });
        loginInfo.userId = ud.id;
        if (loginInfo.scope && loginInfo.scope.indexOf('guilds') > -1) {
          fetchGuilds(loginInfo, (data) => {
            if (data) ud.setGuilds(data);
            cb(ud);
          });
        } else {
          cb(ud);
        }
      } else {
        cb(null);
      }
    });
  }
  /**
   * Fetches the guild information of the user we have the token of.
   *
   * @private
   * @param {LoginInfo} loginInfo The credentials of the session user.
   * @param {singleCB} cb The callback storing the user's data, or null if
   * something went wrong.
   */
  function fetchGuilds(loginInfo, cb) {
    apiRequest(loginInfo, '/users/@me/guilds', (err, data) => {
      if (!err) {
        const parsed = JSON.parse(data);
        cb(parsed);
      } else {
        cb(null);
      }
    });
  }

  /**
   * Formats a request to the discord api at the given path.
   *
   * @private
   * @param {LoginInfo} loginInfo The credentials of the user we are sending the
   * request for.
   * @param {string} path The path for the api request to send.
   * @param {basicCallback} cb The response from the https request with error
   * and data arguments.
   */
  function apiRequest(loginInfo, path, cb) {
    const reqId = `${loginInfo.userId}${path}`;
    if (reqCache[reqId]) {
      reqCache[reqId].push(cb);
      if (reqId) return;
    } else {
      reqCache[reqId] = [cb];
    }
    const host = apiHost;
    host.path = `/api${path}`;
    host.headers = {
      'Authorization': `${loginInfo.token_type} ${loginInfo.access_token}`,
      'User-Agent': self.common.ua,
    };
    discordRequest('', (err, res) => {
      const split = reqCache[reqId].splice(0);
      for (const it of split) {
        try {
          it(err, res);
        } catch (err) {
          self.error('Discord API request callback failed');
          console.error(err);
        }
      }
      if (reqCache[reqId].length === 0) delete reqCache[reqId];
    }, host);
  }

  /**
   * Send a https request to discord.
   *
   * @private
   * @param {?object|string} data The data to send in the request.
   * @param {basicCallback} cb Callback with error, and data arguments.
   * @param {?object} host Request object to override the default with.
   */
  function discordRequest(data, cb, host) {
    host = host || tokenHost;
    const req = https.request(host, (response) => {
      let content = '';
      response.on('data', function(chunk) {
        content += chunk;
      });
      response.on('end', function() {
        if (response.statusCode == 200) {
          cb(null, content);
        } else {
          self.error(response.statusCode + ': ' + content);
          console.error(host, data);
          cb(response.statusCode + ' from discord');
        }
      });
    });
    req.setHeader('Content-Type', 'application/x-www-form-urlencoded');
    if (data) {
      req.end(querystring.stringify(data));
    } else {
      req.end();
    }
    req.on('error', console.error);
  }

  /**
   * Refreshes the given token once it expires.
   *
   * @private
   * @param {LoginInfo} loginInfo The credentials to refresh.
   * @param {singleCB} cb The callback that is fired storing the new credentials
   * once they are refreshed.
   */
  function makeRefreshTimeout(loginInfo, cb) {
    clearTimeout(loginInfo.refreshTimeout);
    const maxDelay = 2 * 7 * 24 * 60 * 60 * 1000;
    const delay = loginInfo.expires_at - Date.now();
    if (delay > maxDelay) {
      loginInfo.refreshTimeout = setTimeout(function() {
        makeRefreshTimeout(loginInfo, cb);
      }, maxDelay);
    } else {
      loginInfo.refreshTimeout = setTimeout(function() {
        self.debug('Refreshing token for session: ' + loginInfo.session);
        refreshToken(loginInfo.refresh_token, loginInfo.scope, (err, data) => {
          let parsed;
          if (!err) {
            try {
              parsed = JSON.parse(data);
            } catch (err) {
              self.error(
                  'Failed to parse request from discord token refresh: ' + err);
            }
          }
          cb(parsed);
        });
      }, delay);
    }
  }

  /**
   * Request new credentials with refresh token from discord.
   *
   * @private
   * @param {string} refreshToken_ The refresh token used for refreshing
   * credentials.
   * @param {string} scope Scope to refresh.
   * @param {basicCallback} cb The callback from the https request, with an
   * error argument, and a data argument.
   */
  function refreshToken(refreshToken_, scope, cb) {
    const data = {
      /* eslint-disable @typescript-eslint/camelcase */
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'refresh_token',
      refresh_token: refreshToken_,
      redirect_uri: 'https://www.spikeybot.com/redirect',
      scope: scope,
      /* eslint-enable @typescript-eslint/camelcase */
    };
    discordRequest(data, cb);
  }

  /**
   * Revoke a current refresh token from discord.
   *
   * @private
   * @param {string} token The refresh token to revoke.
   * @param {basicCallback} cb The callback from the https request, with an
   * error argument, and a data argument.
   */
  function revokeToken(token, cb) {
    const host = Object.assign({}, tokenHost);
    host.path += '/revoke';
    const data = {
      /* eslint-disable @typescript-eslint/camelcase */
      client_id: clientId,
      client_secret: clientSecret,
      token_type_hint: 'refresh_token',
      token: token,
      /* eslint-enable @typescript-eslint/camelcase */
    };
    discordRequest(data, cb, host);
  }

  /**
   * Authenticate with the discord server using a login code.
   *
   * @private
   * @param {string} code The login code received from our client.
   * @param {basicCallback} cb The response from the https request with error
   * and data arguments.
   */
  function authorizeRequest(code, cb) {
    const data = {
      /* eslint-disable @typescript-eslint/camelcase */
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: 'https://www.spikeybot.com/redirect',
      /* eslint-enable @typescript-eslint/camelcase */
    };
    discordRequest(data, cb);
  }
}

module.exports = new WebProxy();
