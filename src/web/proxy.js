const fs = require('fs');
const http = require('http');
const https = require('https');
const socketIo = require('socket.io');
const querystring = require('querystring');
const auth = require('../../auth.js');
const crypto = require('crypto');

const clientId = '444293534720458753';
const clientSecret = auth.webSecret;
require('../subModule.js')(WebProxy);  // Extends the SubModule class.

/**
 * @classdesc Proxy for account authentication.
 * @class
 * @augments SubModule
 */
function WebProxy() {
  self = this;

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
  };

  const pathPorts = {'/www.spikeybot.com/socket.io/hg/': 8011};

  /**
   * Stores the tokens and associated data for all clients connected while data
   * is valid.
   *
   * @private
   * @type {Object.<Object>}
   */
  let loginInfo = {};
  let currentSessions = {};

  try {
    loginInfo = JSON.parse(fs.readFileSync('./save/webClients.json') || {});
  } catch (err) {
    console.log(err);
    loginInfo = {};
  }
  let purgeInterval = setInterval(purgeSessions, 60 * 60 * 1000);

  /**
   * Purge stale data from loginInfo.
   *
   * @private
   */
  function purgeSessions() {
    let keys = Object.keys(loginInfo);
    const now = Date.now();
    for (let i in keys) {
      if (loginInfo[keys[i]].expiration_date < now) delete loginInfo[keys[i]];
    }
  }

  let app = http.createServer(handler);
  let io = socketIo(
      app, {path: '/www.spikeybot.com/socket.io/', serveClient: false});

  app.on('error', function(err) {
    if (err.code === 'EADDRINUSE') {
      self.shutdown(true);
      console.error('Proxy failed to bind to port because it is in use.', err);
    } else {
      console.error('Proxy failed to bind to port for unknown reason.', err);
    }
  });
  app.listen(8010);

  /** @inheritdoc */
  this.initialize = function() {};

  /**
   * Causes a full shutdown of all servers.
   * @public
   * @param {boolean} [skipSave=false] Skip writing data to file.
   */
  this.shutdown = function(skipSave) {
    if (io) io.close();
    if (app) app.close();
    clearInterval(purgeInterval);
    if (!skipSave) {
      fs.writeFileSync('./save/webClients.json', JSON.stringify(loginInfo));
    }
  };

  /** @inheritdoc */
  this.unloadable = function() {
    return true;
  };

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
   * @type {Object.<Socket>}
   */
  let sockets = {};

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
    const ipName = hg.common.getIPName(
        socket.handshake.headers['x-forwarded-for'] ||
        socket.handshake.address);
    hg.common.log(
        'Socket connected (' + Object.keys(sockets).length + '): ' + ipName,
        socket.id);
    sockets[socket.id] = socket;

    const reqPath = socket.handshake.url;

    let server = require('socket.io-client')(
        'http://localhost:' + pathPorts[reqPath], {path: reqPath});

    let onevent = socket.onevent;
    socket.onevent = function(packet) {
      var args = packet.data || [];
      onevent.call(this, packet);  // original call
      if (socket.hasListeners(args[0])) return;
      packet.data = ["*"].concat(args);
      onevent.call(this, packet);  // additional call to catch-all
    };

    let userData = {};
    let session = crypto.randomBytes(128).toString('hex');
    let restoreAttempt = false;

    socket.on('restore', (sess) => {
      if (restoreAttempt /* || currentSessions[sess]*/) {
        socket.emit('authorized', 'Restore Failed', null);
        console.log(restoreAttempt, sess);
        return;
      }
      currentSessions[sess] = true;
      restoreAttempt = true;
      if (loginInfo[sess]) {
        session = sess;
        if (loginInfo[session].expires_at < Date.now()) {
          refreshToken(loginInfo.refresh_token, (err, data) => {
            if (!err) {
              let parsed;
              try {
                parsed = JSON.parse(data);
                hg.log('Refreshed token');
              } catch (err) {
                hg.error(
                    'Failed to parse request from discord token refresh: ' +
                    err);
                delete currentSessions[sess];
                console.log('Parsing failed', sess);
                socket.emit('authorized', 'Restore Failed', null);
                return;
              }
              receivedLoginInfo(parsed);
              fetchIdentity(loginInfo[session], (identity) => {
                userData = identity;
                if (userData) {
                  socket.emit('authorized', null, userData);
                } else {
                  socket.emit('authorized', 'Getting user data failed', null);
                }
              });
            } else {
              console.log('Refreshing token failed', sess);
              socket.emit('authorized', 'Restore Failed', null);
            }
          });
        } else {
          fetchIdentity(loginInfo[session], (identity) => {
            userData = identity;
            if (userData) {
              socket.emit('authorized', null, userData);
            } else {
              socket.emit('authorized', 'Getting user data failed', null);
            }
          });
        }
      } else {
        delete currentSessions[sess];
        console.log('Nothing to restore', sess);
        socket.emit('authorized', 'Restore Failed', null);
      }
    });

    socket.on('authorize', (code) => {
      currentSessions[session] = true;
      authorizeRequest(code, (err, res) => {
        if (err) {
          delete currentSessions[sess];
          socket.emit('authorized', 'Probably a server error', null);
          console.error(err);
        } else {
          receivedLoginInfo(JSON.parse(res));
          fetchIdentity(loginInfo[session], (identity) => {
            userData = identity;
            socket.emit('authorized', null, userData);
          });
        }
      });
    });

    socket.on('logout', () => {
      if (loginInfo[session]) clearTimeout(loginInfo[session].refreshTimeout);
      delete loginInfo[session];
      delete currentSessions[session];
    });

    socket.on('disconnect', () => {
      hg.common.log(
          'Socket disconnected (' + (Object.keys(sockets).length - 1) + '): ' +
              ipName,
          socket.id);
      if (loginInfo[session]) clearTimeout(loginInfo[session].refreshTimeout);
      delete sockets[socket.id];
      server.close();
    });

    socket.on('*', (...args) => {
      server.emit.apply(server.emit, [args[0], userData].concat(args.slice(1)));
    });

    /**
     * Received the login credentials for user, lets store it for this
     * session,
     * and refresh the tokens when necessary.
     *
     * @private
     * @param {Object} data User data.
     */
    function receivedLoginInfo(data) {
      if (data) {
        data.expires_at = data.expires_in * 1000 + Date.now();
        data.expiration_date = Date.now() + (1000 * 60 * 60 * 24 * 7);
        data.session = session;
        loginInfo[session] = data;
        makeRefreshTimeout(loginInfo[session], receivedLoginInfo);
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
        let parsed = JSON.parse(data);
        parsed.session = {
          id: loginInfo.session,
          expiration_date: loginInfo.expiration_date,
        };
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
    let host = apiHost;
    host.path = '/api' + path;
    host.headers = {
      'Authorization': loginInfo.token_type + ' ' + loginInfo.access_token,
    };
    discordRequest('', cb, host);
  }

  /**
   * Send a https request to discord.
   *
   * @private
   * @param {?Object|string} data The data to send in the request.
   * @param {basicCallback} cb Callback with error, and data arguments.
   * @param {?Object} host Request object to override the default with.
   */
  function discordRequest(data, cb, host) {
    host = host || tokenHost;
    let req = https.request(host, (response) => {
      let content = '';
      response.on('data', function(chunk) {
        content += chunk;
      });
      response.on('end', function() {
        if (response.statusCode == 200) {
          cb(null, content);
        } else {
          hg.error(response.statusCode + ': ' + content);
          console.log(host, data);
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
    req.on('error', console.log);
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
    loginInfo.refreshTimeout = setTimeout(function() {
      refreshToken(loginInfo.refresh_token, (err, data) => {
        let parsed;
        if (!err) {
          try {
            parsed = JSON.parse(data);
          } catch (err) {
            hg.error(
                'Failed to parse request from discord token refresh: ' + err);
          }
        }
        cb(parsed);
      });
    }, loginInfo.expires_in * 1000);
  }

  /**
   * Request new credentials with refresh token from discord.
   *
   * @private
   * @param {string} refreshToken The refresh token used for refreshing
   * credentials.
   * @param {basicCallback} cb The callback from the https request, with an
   * error argument, and a data argument.
   */
  function refreshToken(refreshToken, cb) {
    const data = {
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      redirect_uri: 'https://www.spikeybot.com/redirect',
    };
    discordRequest(data, cb);
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
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: 'https://www.spikeybot.com/redirect',
    };
    discordRequest(data, cb);
  }
}

module.exports = new WebProxy();
