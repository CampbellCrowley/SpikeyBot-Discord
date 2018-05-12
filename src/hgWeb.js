// Copyright 2018 Campbell Crowley. All rights reserved.
// Author: Campbell Crowley (dev@campbellcrowley.com)
const fs = require('fs');
const http = require('http');
const https = require('https');
const socketIo = require('socket.io');
const querystring = require('querystring');
const auth = require('../auth.js');

const clientId = '444293534720458753';
const clientSecret = auth.webSecret;

/**
 * @classdesc Creates a web interface for managing the Hungry Games.
 * @class
 *
 * @param {HungryGames} hg The hungry games object that we will be controlling.
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
    res.end('TEAPOT');
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
    for (let i in keys) {
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
    const ipName =
        hg.common.getIPName(socket.handshake.headers['x-forwarded-for']);
    hg.common.log('Socket connected: ' + ipName, socket.id);

    let userData = {};
    let session = Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15);
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
        } else {
          receivedLoginInfo(JSON.parse(res));
          fetchIdentity(loginInfo[session], (identity) => {
            userData = identity;
            socket.emit('authorized', null, userData);
          });
        }
      });
    });
    /**
     * Received the login credentials for user, lets store it for this session,
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

    socket.on('fetchGuilds', () => {
      if (!userData) return;
      try {
        let guilds = hg.client.guilds.filterArray((obj) => {
          return obj.members.get(userData.id);
        });
        let strippedGuilds = guilds.map((g) => {
          let member = g.members.get(userData.id);
          let newG = {};
          newG.iconURL = g.iconURL();
          newG.name = g.name;
          newG.id = g.id;
          newG.members = g.members.map((m) => {
            return m.id;
          });
          newG.myself = makeMember(member);
          newG.hg = hg.getGame(g.id);
          return newG;
        });
        socket.emit('guilds', null, strippedGuilds);
      } catch (err) {
        hg.common.error(err, 'HG');
        socket.emit('guilds', 'Failed', null);
      }
    });

    socket.on('fetchMember', (gId, mId) => {
      if (!userData) return;
      let g = hg.client.guilds.get(gId);
      if (!g) return;
      let user = g.members.get(userData.id);
      if (!user || !user.roles.find('name', hg.roleName)) return;
      let m = g.members.get(mId);
      if (!m) return;
      let member = makeMember(m);

      socket.emit('member', gId, mId, member);
    });

    socket.on('logout', () => {
      clearTimeout(loginInfo[session].refreshTimeout);
      delete loginInfo[session];
      delete currentSessions[session];
    });

    socket.on('disconnect', () => {
      hg.common.log('Socket disconnected: ' + ipName, socket.id);
      if (loginInfo[session]) clearTimeout(loginInfo[session].refreshTimeout);
    });
  }

  /**
   * Fetches the identiry of the user we have the token of.
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
   * Strips a Discord~GuildMember to only the necessary data that a client will
   * need.
   *
   * @param {Discord~GuildMember} m The guild member to strip the data from.
   * @return {Object} The minimal member.
   */
  function makeMember(m) {
    return {
      nickname: m.nickname,
      hgRole: m.roles.find('name', hg.roleName),
      roles: m.roles.filterArray(() => {
        return true;
      }),
      color: m.displayColor,
      guild: {id: m.guild.id},
      user: {
        username: m.user.username,
        avatarURL: m.user.displayAvatarURL(),
        id: m.user.id,
        bot: m.user.bot,
      },
      joinedTimestamp: m.joinedTimestamp,
    };
  }

  /**
   * Formats a request to the discord api at the given path.
   *
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

  /**
   * Refreshes the given token once it expires.
   *
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
            hg.common.error(
                'Failed to parse request from discord token refresh: ' + err,
                'HG');
          }
        }
        cb(parsed);
      });
    }, loginInfo.expires_in * 1000);
  }

  /**
   * Request new credentials with refresh token from discord.
   *
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

  hg.common.log('Init Web', 'HG');
}

module.exports = HGWeb;
