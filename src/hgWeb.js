// Copyright 2018 Campbell Crowley. All rights reserved.
// Author: Campbell Crowley (dev@campbellcrowley.com)
const fs = require('fs');
const http = require('http');
const https = require('https');
const socketIo = require('socket.io');
const querystring = require('querystring');
const auth = require('../auth.js');
const crypto = require('crypto');

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
  app.on('error', console.error);
  try {
    app.listen(8010);
  } catch (err) {
  }

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
   * @public
   */
  this.shutdown = function() {
    io.close();
    app.close();
    clearInterval(purgeInterval);
    fs.writeFileSync('./save/hgWebClients.json', JSON.stringify(loginInfo));
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


  /**
   * Map of all currently connected sockets.
   *
   * @private
   * @type {Object.<Socket>}
   */
  let sockets = {};

  try {
    loginInfo = JSON.parse(fs.readFileSync('./save/hgWebClients.json') || {});
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

  io.on('connection', socketConnection);
  /**
   * Handler for a new socket connecting.
   *
   * @private
   * @param {Socket} socket The socket.io socket that connected.
   */
  function socketConnection(socket) {
    const ipName =
        hg.common.getIPName(socket.handshake.headers['x-forwarded-for']);
    hg.common.log('Socket connected: ' + ipName, socket.id);
    sockets[socket.id] = socket;

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
        let guilds = hg.client.guilds.filter((obj) => {
          return obj.members.get(userData.id);
        }).array();
        let strippedGuilds = guilds.map((g) => {
          let member = g.members.get(userData.id);
          let newG = {};
          newG.iconURL = g.iconURL();
          newG.name = g.name;
          newG.id = g.id;
          newG.members = g.members.map((m) => {
            return m.id;
          });
          newG.channels = g.channels
                              .filter((c) => {
                                return c.permissionsFor(member).has(
                                    hg.Discord.Permissions.FLAGS.VIEW_CHANNEL);
                              })
                              .map((c) => {
                                return c.id;
                              });
          newG.myself = makeMember(member);
          return newG;
        });
        socket.emit('guilds', null, strippedGuilds);
        socket.cachedGuilds = strippedGuilds.map((g) => {
          return g.id;
        });
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
      if (!user || !user.roles.find((r) => r.name == hg.roleName)) return;
      let m = g.members.get(mId);
      if (!m) return;
      let member = makeMember(m);

      socket.emit('member', gId, mId, member);
    });
    socket.on('fetchChannel', (gId, cId) => {
      if (!userData) return;
      let g = hg.client.guilds.get(gId);
      if (!g) return;
      let member = g.members.get(userData.id);
      if (!member || !member.roles.find((r) => r.name == hg.roleName)) return;
      let m = g.members.get(userData.id);

      let channel = g.channels.get(cId);
      if (!channel) return;

      let perms = channel.permissionsFor(m);
      if (!perms.has(hg.Discord.Permissions.FLAGS.VIEW_CHANNEL)) return;

      let stripped = {};
      stripped.id = channel.id;
      stripped.permissions = perms.bitfield;
      stripped.name = channel.name;
      stripped.position = channel.position;
      if (channel.parent) stripped.parent = {position: channel.parent.position};
      stripped.type = channel.type;

      socket.emit('channel', gId, cId, stripped);
    });

    socket.on('fetchGames', (gId) => {
      if (!checkPerm(userData, gId)) {
        replyNoPerm(socket, 'fetchGames');
        return;
      }

      socket.emit('game', gId, hg.getGame(gId));
    });
    socket.on('fetchDay', (gId) => {
      let hasPerm = true;
      if (!userData) {
        hasPerm = false;
      } else {
        let g = hg.client.guilds.get(gId);
        if (!g) {
          hasPerm = false;
        } else {
          let m = g.members.get(userData.id);
          if (!m) {
            hasPerm = false;
          }
        }
      }
      if (!hasPerm) {
        replyNoPerm(socket, 'fetchDay');
        return;
      }
      let game = hg.getGame(gId);
      if (!game || !game.currentGame || !game.currentGame.day) {
        socket.emit(
            'message',
            'There doesn\'t appear to be a game on this server yet.');
        return;
      }

      socket.emit(
          'day', gId, game.currentGame.day, game.currentGame.includedUsers);
    });

    socket.on('fetchDefaultOptions', () => {
      socket.emit('defaultOptions', hg.defaultOptions);
    });
    socket.on('fetchDefaultEvents', () => {
      socket.emit('defaultEvents', hg.getDefaultEvents());
    });

    socket.on('excludeMember', (gId, mId) => {
      if (!checkPerm(userData, gId)) {
        replyNoPerm(socket, 'excludeMember');
        return;
      }
      socket.emit('message', hg.excludeUsers([mId], gId));
      socket.emit('game', gId, hg.getGame(gId));
    });
    socket.on('includeMember', (gId, mId) => {
      if (!checkPerm(userData, gId)) {
        replyNoPerm(socket, 'includeMember');
        return;
      }
      socket.emit('message', hg.includeUsers([mId], gId));
      socket.emit('game', gId, hg.getGame(gId));
    });
    socket.on('toggleOption', (gId, option, value) => {
      if (!checkPerm(userData, gId)) {
        replyNoPerm(socket, 'toggleOption');
        return;
      }
      socket.emit('message', hg.setOption(gId, option, value));
      if (hg.getGame(gId)) {
        socket.emit('option', gId, option, hg.getGame(gId).options[option]);
        if (option === 'teamSize') {
          socket.emit('game', gId, hg.getGame(gId));
        }
      }
    });
    socket.on('createGame', (gId) => {
      if (!checkPerm(userData, gId)) {
        replyNoPerm(socket, 'createGame');
        return;
      }
      hg.createGame(gId);
      socket.emit('message', 'Game created');
      socket.emit('game', gId, hg.getGame(gId));
    });
    socket.on('resetGame', (gId, cmd) => {
      if (!checkPerm(userData, gId)) {
        replyNoPerm(socket, 'resetGame');
        return;
      }
      socket.emit('message', hg.resetGame(gId, cmd));
      socket.emit('game', gId, hg.getGame(gId));
    });
    socket.on('startGame', (gId, cId) => {
      if (!checkChannelPerm(userData, gId, cId)) {
        replyNoPerm(socket, 'startGame');
        return;
      }
      hg.startGame(userData.id, gId, cId);
      socket.emit('message', 'Game started');
      socket.emit('game', gId, hg.getGame(gId));
    });
    socket.on('startAutoplay', (gId, cId) => {
      if (!checkChannelPerm(userData, gId, cId)) {
        replyNoPerm(socket, 'startAutoplay');
        return;
      }
      hg.startAutoplay(userData.id, gId, cId);
      socket.emit('message', 'Autoplay enabled');
      socket.emit('game', gId, hg.getGame(gId));
    });
    socket.on('nextDay', (gId, cId) => {
      if (!checkChannelPerm(userData, gId, cId)) {
        replyNoPerm(socket, 'checkChannelPerm');
        return;
      }
      hg.nextDay(userData.id, gId, cId);
      socket.emit('message', 'Starting next day');
    });
    socket.on('endGame', (gId) => {
      if (!checkPerm(userData, gId)) {
        replyNoPerm(socket, 'endGame');
        return;
      }
      hg.endGame(userData.id, gId);
      socket.emit('message', 'Game ended');
      socket.emit('game', gId, hg.getGame(gId));
    });
    socket.on('pauseAutoplay', (gId) => {
      if (!checkPerm(userData, gId)) {
        replyNoPerm(socket, 'pauseAutoplay');
        return;
      }
      hg.pauseAutoplay(userData.id, gId);
      socket.emit('message', 'Autoplay paused');
      socket.emit('game', gId, hg.getGame(gId));
    });
    socket.on('editTeam', (gId, cmd, one, two) => {
      if (!checkPerm(userData, gId)) {
        replyNoPerm(socket, 'editTeam');
        return;
      }
      hg.editTeam(userData.id, gId, cmd, one, two);
      socket.emit('message', 'Request received to ' + cmd + ' team');
      socket.emit('game', gId, hg.getGame(gId));
    });
    socket.on('createEvent', (gId, type, message, nV, nA, oV, oA, kV, kA) => {
      if (!checkPerm(userData, gId)) {
        replyNoPerm(socket, 'createEvent');
        return;
      }
      let err = hg.makeAndAddEvent(gId, type, message, nV, nA, oV, oA, kV, kA);
      if (err) {
        socket.emit('message', 'Failed to create event: ' + err);
      } else {
        socket.emit('message', 'Created ' + type + ' event.');
        socket.emit('game', gId, hg.getGame(gId));
      }
    });
    socket.on('removeEvent', (gId, type, event) => {
      if (!checkPerm(userData, gId)) {
        replyNoPerm(socket, 'removeEvent');
        return;
      }
      let err = hg.removeEvent(gId, type, event);
      if (err) {
        socket.emit('message', 'Failed to remove event: ' + err);
      } else {
        socket.emit('message', 'Removed event.');
        socket.emit('game', gId, hg.getGame(gId));
      }
    });

    socket.on('logout', () => {
      if (loginInfo[session]) clearTimeout(loginInfo[session].refreshTimeout);
      delete loginInfo[session];
      delete currentSessions[session];
    });

    socket.on('disconnect', () => {
      hg.common.log('Socket disconnected: ' + ipName, socket.id);
      if (loginInfo[session]) clearTimeout(loginInfo[session].refreshTimeout);
      delete sockets[socket.id];
    });
  }

  /**
   * This gets fired whenever the day state of any game changes in the hungry
   * games. This then notifies all clients that the state changed, if they care
   * about the guild.
   *
   * @public
   * @param {string} gId Guild id of the state change.
   */
  this.dayStateChange = function(gId) {
    let keys = Object.keys(sockets);
    let game = hg.getGame(gId);
    let eventState = null;
    if (game.currentGame.day.events[game.currentGame.day.state - 2] &&
        game.currentGame.day.events[game.currentGame.day.state - 2].battle) {
      eventState =
          game.currentGame.day.events[game.currentGame.day.state - 2].state;
    }
    for (let i in keys) {
      if (!sockets[keys[i]].cachedGuilds) continue;
      if (sockets[keys[i]].cachedGuilds.find((g) => g === gId)) {
        sockets[keys[i]].emit(
            'dayState', gId, game.currentGame.day.num,
            game.currentGame.day.state, eventState);
      }
    }
  };

  /**
   * Send a message to the given socket inorming the client that the command
   * they attempted failed due to insufficient permission.
   *
   * @private
   * @param {Socket} socket The socket.io socket to reply on.
   * @param {string} cmd THe command the client attempted.
   */
  function replyNoPerm(socket, cmd) {
    hg.common.log('Attempted ' + cmd + ' without permission.', socket.id);
    socket.emit(
        'message', 'Failed to run command "' + cmd +
            '" because you don\'t have permission for this.');
  }

  /**
   * Check that the given user has permission to manage the games in the given
   * guild.
   *
   * @private
   * @param {UserData} userData The user to check.
   * @param {string} gId The guild id to check against.
   * @return {boolean} Whther the user has permission or not to manage the
   * hungry games in the given guild.
   */
  function checkPerm(userData, gId) {
    if (!userData) return false;
    let g = hg.client.guilds.get(gId);
    if (!g) return false;
    let member = g.members.get(userData.id);
    if (!member || !member.roles.find((r) => r.name == hg.roleName)) {
      return false;
    }
    return true;
  }
  /**
   * Check that the given user has permission to see and send messages in the
   * given channel, as well as manage the games in the given guild.
   *
   * @private
   * @param {UserData} userData The user to check.
   * @param {string} gId The guild id of the guild that contains the channel.
   * @param {string} cId The channel id to check against.
   * @return {boolean} Whther the user has permission or not to manage the
   * hungry games in the given guild and has permission to send messages in the
   * given channel.
   */
  function checkChannelPerm(userData, gId, cId) {
    if (!userData) return false;
    let g = hg.client.guilds.get(gId);
    if (!g) return false;
    let m = g.members.get(userData.id);
    if (!m || !m.roles.find((r) => r.name == hg.roleName)) return false;

    let channel = g.channels.get(cId);
    if (!channel) return false;

    let perms = channel.permissionsFor(m);
    if (!perms.has(hg.Discord.Permissions.FLAGS.VIEW_CHANNEL)) return false;
    if (!perms.has(hg.Discord.Permissions.FLAGS.SEND_MESSAGES)) return false;
    return true;
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
   * Strips a Discord~GuildMember to only the necessary data that a client will
   * need.
   *
   * @private
   * @param {Discord~GuildMember} m The guild member to strip the data from.
   * @return {Object} The minimal member.
   */
  function makeMember(m) {
    return {
      nickname: m.nickname,
      hgRole: m.roles.find((r) => r.name == hg.roleName),
      roles: m.roles
                 .filter(() => {
                   return true;
                 })
                 .array(),
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

  hg.common.log('Init Web', 'HG');
}

module.exports = HGWeb;
