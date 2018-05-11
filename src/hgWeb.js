// Copyright 2018 Campbell Crowley. All rights reserved.
// Author: Campbell Crowley (dev@campbellcrowley.com)
const fs = require('fs');
const http = require('http');
const https = require('https');
const socketIo = require('socket.io');
const querystring = require('querystring');

const clientId = '444293534720458753';
const clientSecret = 'ZRehbwR30wKV-h6c11kREheORrJtcobR';

/**
 * @classdesc Creates a web interface for managing the Hungry Games.
 * @class
 */
function HGWeb(hg) {
  let app = http.createServer(handler);
  let io = socketIo(
      app, {path: '/www.spikeybot.com/socket.io/hg', serveClient: false});
  app.listen(8010);

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
    method: 'POST'
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
    method: 'GET'
  };

  /**
   * Causes a full shutdown of all servers.
   * @private
   */
  this.shutdown = function() {
    io.close();
    app.close();
    fs.writeFileSync('./save/hgWebClients.json', JSON.stringify(loginInfo));
    hg.common.log('Web Shutdown', 'HG');
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
    res.end("TEAPOT");
  }

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
    loginInfo = JSON.parse(fs.readFileSync('./save/hgWebClients.json') || {});
    let keys = Object.keys(loginInfo);
    const now = Date.now();
    for (var i in keys) {
      if (loginInfo[keys[i]].expiration_date < now) delete loginInfo[keys[i]];
    }
  } catch (err) {
    console.log(err);
  }

  io.on('connection', socketConnection);
  /**
   * Handler for a new socket connecting.
   *
   * @param {Socket} socket The socket.io socket that connected.
   */
  function socketConnection(socket) {
    let authenticated = false;
    const ipName =
        hg.common.getIPName(socket.handshake.headers['x-forwarded-for']);
    hg.common.log('Socket connected: ' + ipName, socket.id);

    let userData = {};
    let refreshTimeout;
    let session = Math.random() * 10000000000000000;
    let restoreAttempt = false;

    socket.on('restore', (sess) => {
      if (restoreAttempt /*|| currentSessions[sess]*/) {
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
            let parsed;
            if (!err) {
              try {
                parsed = JSON.parse(data);
                hg.common.log('Refreshed token');
              } catch (err) {
                hg.common.error(
                    'Failed to parse request from discord token refresh: ' +
                        err,
                    'HG');
                delete currentSessions[sess];
                console.log('Parsing failed', sess);
                socket.emit('authorized', 'Restore Failed', null);
                return;
              }
              receivedLoginInfo(JSON.parse(data));
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
        } else {
          receivedLoginInfo(JSON.parse(res));
          fetchIdentity(loginInfo[session], (identity) => {
            userData = identity;
            socket.emit('authorized', null, userData);
          });
        }
      });
    });
    function receivedLoginInfo(data) {
      if (data) {
        data.expires_at = data.expires_in * 1000 + Date.now();
        data.expiration_date = Date.now() + (1000 * 60 * 60 * 24 * 7);
        data.session = session;
        loginInfo[session] = data;
        makeRefreshTimeout(loginInfo[session], receivedLoginInfo);
      }
    }

    socket.on('fetchGuilds', () => {
      if (!loginInfo[session]) return;
      apiRequest(loginInfo[session], '/users/@me/guilds', (err, data) => {
        if (err) {
          hg.common.error(err, 'HG');
          socket.emit('guilds', 'Failed', null);
        } else {
          try {
            socket.emit('guilds', null, JSON.parse(data));
          } catch(err) {
            hg.common.error(err, 'HG');
            socket.emit('guilds', 'Failed', null);
          }
        }
      });
    });

    socket.on('logout', () => {
      delete loginInfo[session];
      delete currentSessions[session];
    });

    socket.on('disconnect', () => {
      hg.common.log('Socket disconnected: ' + ipName, socket.id);
      clearTimeout(refreshTimeout);
    });
  }

  function fetchIdentity(loginInfo, cb) {
    apiRequest(loginInfo, '/users/@me', (err, data) => {
      if (!err) {
        let parsed = JSON.parse(data);
        parsed.session = {
          id: loginInfo.session,
          expiration_date: loginInfo.expiration_date
        };
        cb(parsed);
      } else {
        cb(null);
      }
    });
  }

  function apiRequest(loginInfo, path, cb) {
    let host = apiHost;
    host.path = '/api' + path;
    host.headers = {
      'Authorization': loginInfo.token_type + ' ' + loginInfo.access_token
    };
    discordRequest('', cb, host);
  }

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
          hg.common.error(response.statusCode + ': ' + content);
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

  function makeRefreshTimeout(loginInfo, cb) {
    setTimeout(function() {
      refreshToken(loginInfo.refresh_token, (err, data) => {
        let parsed;
        if (!err) {
          try {
            parsed = JSON.parse(data);
          } catch (err) {
            hg.common.error(
                'Failed to parse request from discord token refresh: ' + err,
                'HG');
          }
        }
        cb(parsed);
      });
    }, loginInfo.expires_in * 1000);
  }

  function refreshToken(refreshToken, cb) {
    const data = {
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      redirect_uri: 'https://www.spikeybot.com/redirect'
    };
    discordRequest(data, cb);
  }

  function authorizeRequest(code, cb) {
    const data = {
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: 'https://www.spikeybot.com/redirect'
    };
    discordRequest(data, cb);
  }

  hg.common.log('Init Web', 'HG');
}

module.exports = HGWeb;
