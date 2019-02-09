// Copyright 2018 Campbell Crowley. All rights reserved.
// Author: Campbell Crowley (dev@campbellcrowley.com)
const http = require('http');
const socketIo = require('socket.io');
const auth = require('../../auth.js');

/**
 * @classdesc Creates a web interface for managing the Hungry Games.
 * @class
 *
 * @param {HungryGames} hg The hungry games object that we will be controlling.
 */
function HGWeb(hg) {
  const self = this;

  let ioClient;

  const app = http.createServer(handler);
  const io = socketIo(app, {
    path: hg.common.isRelease ? '/www.spikeybot.com/socket.io/hg' :
                                '/www.spikeybot.com/socket.io/dev/hg',
    serveClient: false,
  });

  app.on('error', function(err) {
    if (err.code === 'EADDRINUSE') {
      self.shutdown(true);
      startClient();
    } else {
      console.error('HGWeb failed to bind to port for unknown reason.', err);
    }
  });
  app.listen(hg.common.isRelease ? 8011 : 8013, '127.0.0.1');

  /**
   * Start a socketio client connection to the primary running server.
   *
   * @private
   */
  function startClient() {
    hg.common.log(
        'Restarting into client mode due to server already bound to port.',
        'HG Web');
    ioClient = require('socket.io-client')(
        hg.common.isRelease ? 'http://localhost:8011' : 'http://localhost:8013',
        {path: '/www.spikeybot.com/socket.io/hg/'});
    clientSocketConnection(ioClient);
  }

  /**
   * Causes a full shutdown of all servers.
   * @public
   * @param {boolean} [skipSave=false] Skip writing data to file.
   */
  this.shutdown = function(skipSave) {
    if (io) io.close();
    if (ioClient) ioClient.close();
    if (app) app.close();
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
  const sockets = {};

  /**
   * Returns the number of connected clients that are not siblings.
   *
   * @public
   * @return {number} Number of sockets.
   */
  this.getNumClients = function() {
    return Object.keys(sockets).length - Object.keys(siblingSockets).length;
  };

  /**
   * Map of all sockets connected that are siblings.
   *
   * @private
   * @type {Object.<Socket>}
   */
  const siblingSockets = {};

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

    // @TODO: Replace this authentication with gpg key-pairs;
    socket.on('vaderIAmYourSon', (verification, cb) => {
      if (verification === auth.hgWebSiblingVerification) {
        siblingSockets[socket.id] = socket;
        cb(auth.hgWebSiblingVerificationResponse);
      } else {
        hg.common.error('Client failed to authenticate as child.', socket.id);
      }
    });

    // Unrestricted Access //
    socket.on('fetchDefaultOptions', () => {
      socket.emit('defaultOptions', hg.defaultOptions);
    });
    socket.on('fetchDefaultEvents', () => {
      socket.emit('defaultEvents', hg.getDefaultEvents());
    });
    // End Unrestricted Access \\

    // Restricted Access //
    socket.on('fetchGuilds', (...args) => {
      callSocketFunction(fetchGuilds, args, false);
    });
    socket.on('fetchGuild', (...args) => {
      callSocketFunction(fetchGuild, args);
    });
    socket.on('fetchMember', (...args) => {
      callSocketFunction(fetchMember, args);
    });
    socket.on('fetchChannel', (...args) => {
      callSocketFunction(fetchChannel, args);
    });
    socket.on('fetchGames', (...args) => {
      callSocketFunction(fetchGames, args);
    });
    socket.on('fetchDay', (...args) => {
      callSocketFunction(fetchDay, args);
    });
    socket.on('excludeMember', (...args) => {
      callSocketFunction(excludeMember, args);
    });
    socket.on('includeMember', (...args) => {
      callSocketFunction(includeMember, args);
    });
    socket.on('toggleOption', (...args) => {
      callSocketFunction(toggleOption, args);
    });
    socket.on('createGame', (...args) => {
      callSocketFunction(createGame, args);
    });
    socket.on('resetGame', (...args) => {
      callSocketFunction(resetGame, args);
    });
    socket.on('startGame', (...args) => {
      callSocketFunction(startGame, args);
    });
    socket.on('startAutoplay', (...args) => {
      callSocketFunction(startAutoplay, args);
    });
    socket.on('nextDay', (...args) => {
      callSocketFunction(nextDay, args);
    });
    socket.on('endGame', (...args) => {
      callSocketFunction(endGame, args);
    });
    socket.on('pauseAutoplay', (...args) => {
      callSocketFunction(pauseAutoplay, args);
    });
    socket.on('editTeam', (...args) => {
      callSocketFunction(editTeam, args);
    });
    socket.on('createEvent', (...args) => {
      callSocketFunction(createEvent, args);
    });
    socket.on('createMajorEvent', (...args) => {
      callSocketFunction(createMajorEvent, args);
    });
    socket.on('editMajorEvent', (...args) => {
      callSocketFunction(editMajorEvent, args);
    });
    socket.on('removeEvent', (...args) => {
      callSocketFunction(removeEvent, args);
    });
    socket.on('toggleEvent', (...args) => {
      callSocketFunction(toggleEvent, args);
    });
    socket.on('forcePlayerState', (...args) => {
      callSocketFunction(forcePlayerState, args);
    });
    // End Restricted Access \\

    /**
     * Calls the functions with added arguments, and copies the request to all
     * sibling clients.
     *
     * @private
     * @param {Function} func The function to call.
     * @param {Array.<*>} args Array of arguments to send to function.
     * @param {boolean} [forward=true] Forward this request directly to all
     * siblings.
     */
    function callSocketFunction(func, args, forward = true) {
      if (!['fetchMember', 'fetchChannel'].includes(func.name.toString())) {
        const logArgs = args.map((el) => {
          if (typeof el === 'function') {
            return (el.name || 'anonymous') + '()';
          } else {
            return el;
          }
        });
        hg.common.logDebug(
            func.name + '(' + logArgs.join(',') + ')', socket.id);
      }
      func.apply(func, [args[0], socket].concat(args.slice(1)));
      if (forward) {
        Object.entries(siblingSockets).forEach((s) => {
          s[1].emit(
              'forwardedRequest', args[0], socket.id, func.name, args.slice(1),
              (res) => {
                socket.emit(...res);
              });
        });
      }
    }

    socket.on('disconnect', () => {
      hg.common.log(
          'Socket disconnected (' + (Object.keys(sockets).length - 1) + '): ' +
              ipName,
          socket.id);
      if (siblingSockets[socket.id]) delete siblingSockets[socket.id];
      delete sockets[socket.id];
    });
  }
  /**
   * Handler for connecting as a client to the server.
   *
   * @private
   * @param {socketIo~Socket} socket The socket.io socket that connected.
   */
  function clientSocketConnection(socket) {
    let authenticated = false;
    socket.on('connect', () => {
      socket.emit('vaderIAmYourSon', auth.hgWebSiblingVerification, (res) => {
        hg.common.log('Sibling authenticated successfully.');
        authenticated = res === auth.hgWebSiblingVerificationResponse;
      });
    });

    socket.on('fetchGuilds', (userData, id, cb) => {
      fetchGuilds(userData, {id: id}, cb);
    });

    socket.on('forwardedRequest', (userData, sId, func, args, cb) => {
      if (!authenticated) return;
      const fakeSocket = {
        emit: function(...args) {
          if (typeof cb == 'function') cb(args);
        },
        id: sId,
      };
      if (!self[func]) {
        hg.common.error(func + ': is not a function.');
      } else {
        self[func].apply(self[func], [userData, fakeSocket].concat(args));
      }
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
    const keys = Object.keys(sockets);
    const game = hg.getGame(gId);
    let eventState = null;
    if (!game) return;
    if (game.currentGame.day.events[game.currentGame.day.state - 2] &&
        game.currentGame.day.events[game.currentGame.day.state - 2].battle) {
      eventState =
          game.currentGame.day.events[game.currentGame.day.state - 2].state;
    }
    for (const i in keys) {
      if (!sockets[keys[i]].cachedGuilds) continue;
      if (sockets[keys[i]].cachedGuilds.find((g) => g === gId)) {
        sockets[keys[i]].emit(
            'dayState', gId, game.currentGame.day.num,
            game.currentGame.day.state, eventState);
      }
    }
  };

  /**
   * Send a message to the given socket informing the client that the command
   * they attempted failed due to insufficient permission.
   *
   * @private
   * @param {Socket} socket The socket.io socket to reply on.
   * @param {string} cmd THe command the client attempted.
   */
  function replyNoPerm(socket, cmd) {
    hg.common.logDebug('Attempted ' + cmd + ' without permission.', socket.id);
    socket.emit(
        'message', 'Failed to run command "' + cmd +
            '" because you don\'t have permission for this.');
  }

  /**
   * Checks if the current shard is responsible for the requested guild.
   *
   * @private
   * @param {number|string} gId The guild id to check.
   * @return {boolean} True if this shard has this guild.
   */
  function checkMyGuild(gId) {
    const g = hg.client.guilds.get(gId);
    return (g && true) || false;
  }

  /**
   * Check that the given user has permission to manage the games in the given
   * guild.
   *
   * @private
   * @param {UserData} userData The user to check.
   * @param {string} gId The guild id to check against.
   * @param {?string} cId The channel id to check against.
   * @param {string} cmd The command being attempted.
   * @return {boolean} Whther the user has permission or not to manage the
   * hungry games in the given guild.
   */
  function checkPerm(userData, gId, cId, cmd) {
    if (!userData) return false;
    if (userData.id == hg.common.spikeyId) return true;
    const msg = makeMessage(userData.id, gId, cId, 'hg ' + cmd);
    if (!msg) return false;
    if (hg.command.validate(
        null, makeMessage(userData.id, gId, null, 'hg ' + cmd))) {
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
   * @param {string} cmd The command being attempted to check permisisons for.
   * @return {boolean} Whther the user has permission or not to manage the
   * hungry games in the given guild and has permission to send messages in the
   * given channel.
   */
  function checkChannelPerm(userData, gId, cId, cmd) {
    if (!checkPerm(userData, gId, cId, cmd)) return false;
    if (userData.id == hg.common.spikeyId) return true;
    const g = hg.client.guilds.get(gId);

    const channel = g.channels.get(cId);
    if (!channel) return false;

    const m = g.members.get(userData.id);

    const perms = channel.permissionsFor(m);
    if (!perms.has(hg.Discord.Permissions.FLAGS.VIEW_CHANNEL)) return false;
    if (!perms.has(hg.Discord.Permissions.FLAGS.SEND_MESSAGES)) return false;
    return true;
  }

  /**
   * Forms a Discord~Message similar object from given IDs.
   *
   * @private
   * @param {string} uId The id of the user who wrote this message.
   * @param {string} gId The id of the guild this message is in.
   * @param {?string} cId The id of the channel this message was 'sent' in.
   * @param {?string} msg The message content.
   * @return {
   *   {
   *     author: Discord~User,
   *     member: Discord~GuildMember,
   *     guild: Discord~Guild,
   *     channel: Discord~GuildChannel,
   *     text: string,
   *     content: string,
   *     prefix: string
   *   }
   * } The created message-like object.
   */
  function makeMessage(uId, gId, cId, msg) {
    const g = hg.client.guilds.get(gId);
    if (!g) return null;
    return {
      member: g.members.get(uId),
      author: hg.client.users.get(uId),
      guild: g,
      channel: g.channels.get(cId),
      text: msg,
      content: msg,
      prefix: hg.bot.getPrefix(gId),
    };
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
    if (typeof m !== 'object') {
      m = {
        roles: {
          array: function() {
            return [];
          },
        },
        guild: {},
        permissions: {bitfield: 0},
        user: hg.client.users.get(m),
      };
    }
    return {
      nickname: m.nickname,
      roles: m.roles.array(),
      color: m.displayColor,
      guild: {id: m.guild.id},
      permissions: m.permissions.bitfield,
      user: {
        username: m.user.username,
        avatarURL: m.user.displayAvatarURL(),
        id: m.user.id,
        bot: m.user.bot,
        // m.user.descriminator seems to be broken and always returns
        // `undefined`.
        descriminator: m.user.tag.match(/#(\d{4})$/)[1],
      },
      joinedTimestamp: m.joinedTimestamp,
    };
  }

  /**
   * Basic callback with single argument. The argument is null if there is no
   * error, or a string if there was an error.
   * @callback HGWeb~basicCB
   *
   * @param {?string} err The error response.
   */

  /**
   * Fetch all relevant data for all mutual guilds with the user and send it to
   * the user.
   *
   * @private
   * @type {HGWeb~SocketFunction}
   * @param {Object} userData The current user's session data.
   * @param {socketIo~Socket} socket The socket connection to reply on.
   * @param {basicCB} [cb] Callback that fires once the requested action is
   * complete, or has failed.
   */
  function fetchGuilds(userData, socket, cb) {
    if (!userData) {
      hg.common.error('Fetch Guilds without userData', 'HG Web');
      if (typeof cb === 'function') cb('SIGNED_OUT');
      return;
    }

    let done;
    if (typeof cb === 'function') {
      done = cb;
    } else {
      const numReplies = (Object.entries(siblingSockets).length || 0);
      let replied = 0;
      const guildBuffer = {};
      /**
       * The callback for each response with the requested data. Replies to the
       * user once all requests have replied.
       *
       * @private
       * @param {string|Object} guilds Either the guild data to send to the
       * user,
       * or 'guilds' if this is a reply from a sibling client.
       * @param {?string} [err] The error that occurred, or null if no error.
       * @param {Object} [response] The guild data if `guilds` equals 'guilds'.
       */
      done = function(guilds, err, response) {
        if (guilds === 'guilds') {
          if (err) {
            guilds = null;
          } else {
            guilds = response;
          }
        }
        for (let i = 0; i < guilds.length; i++) {
          guildBuffer[guilds[i].id] = guilds[i];
        }
        replied++;
        if (replied > numReplies) {
          if (typeof cb === 'function') cb();
          socket.emit('guilds', null, guildBuffer);
          socket.cachedGuilds = Object.keys(guildBuffer);
        }
      };
      Object.entries(siblingSockets).forEach((obj, i) => {
        obj[1].emit('fetchGuilds', userData, socket.id, done);
      });
    }

    try {
      let guilds = hg.client.guilds
          .filter((obj) => {
            return obj.members.get(userData.id);
          })
          .array();
      // I had issues running both release bots on the same server and using the
      // website. This should not be an issue for most users since I only
      // support one of the bots on their server at a time, so this is a
      // workaround for me.
      if (hg.bot.getFullBotName() == 'rembot') {
        guilds = guilds.filter((obj) => {
          return obj.id != '420045052690169856';
        });
      }
      const strippedGuilds = stripGuilds(guilds, userData);
      done(strippedGuilds);
    } catch (err) {
      hg.error(err);
      // socket.emit('guilds', 'Failed', null);
      done();
    }
  }
  this.fetchGuilds = fetchGuilds;

  /**
   * Strip a Discord~Guild to the basic information the client will need.
   * @private
   * @param {Discord~Guild[]} guilds The array of guilds to strip.
   * @param {Object} userData The current user's session data.
   * @return {Object[]} The stripped guilds.
   */
  function stripGuilds(guilds, userData) {
    return guilds.map((g) => {
      let dOpts = hg.command.getDefaultSettings() || {};
      dOpts = Object.entries(dOpts)
          .filter((el) => {
            return el[1].getFullName().startsWith('hg');
          })
          .reduce(
              (p, c) => {
                p[c[0]] = c[1];
                return p;
              },
              {});
      let uOpts = hg.command.getUserSettings(g.id) || {};
      uOpts = Object.entries(uOpts)
          .filter((el) => {
            return el[0].startsWith('hg');
          })
          .reduce(
              (p, c) => {
                p[c[0]] = c[1];
                return p;
              },
              {});

      const member = g.members.get(userData.id);
      const newG = {};
      newG.iconURL = g.iconURL();
      newG.name = g.name;
      newG.id = g.id;
      newG.ownerId = g.ownerID;
      newG.members = g.members.map((m) => {
        return m.id;
      });
      newG.defaultSettings = dOpts;
      newG.userSettings = uOpts;
      newG.channels = g.channels
          .filter((c) => {
            return userData.id == hg.common.spikeyId ||
                                c.permissionsFor(member).has(
                                    hg.Discord.Permissions.FLAGS.VIEW_CHANNEL);
          })
          .map((c) => {
            return {
              id: c.id,
              permissions: userData.id == hg.common.spikeyId ?
                                  hg.Discord.Permissions.ALL :
                                  c.permissionsFor(member).bitfield,
            };
          });
      newG.myself = makeMember(member || userData.id);
      return newG;
    });
  }

  /**
   * Fetch all relevant data for a mutual guilds with the user and send it to
   * the user.
   *
   * @private
   * @type {HGWeb~SocketFunction}
   * @param {Object} userData The current user's session data.
   * @param {socketIo~Socket} socket The socket connection to reply on.
   * @param {string|number} gId The ID of the guild that was requested.
   * @param {basicCB} [cb] Callback that fires once the requested action is
   * complete, or has failed.
   */
  function fetchGuild(userData, socket, gId, cb) {
    if (!userData) {
      hg.common.error('Fetch Guild without userData', 'HG Web');
      if (typeof cb === 'function') cb('SIGNED_OUT');
      return;
    }
    if (typeof cb !== 'function') {
      hg.common.logWarning('Fetch Guild attempted without callback', 'HG Web');
      return;
    }

    const guild = hg.client.guilds.get(gId);
    if (!guild) {
      cb(null);
      return;
    }
    if (userData.id != hg.common.spikeyId && !guild.members.get(userData.id)) {
      cb(null);
      return;
    }
    cb(stripGuilds([guild], userData)[0]);
  }
  this.fetchGuild = fetchGuild;
  /**
   * Fetch data about a member of a guild.
   *
   * @private
   * @type {HGWeb~SocketFunction}
   * @param {Object} userData The current user's session data.
   * @param {socketIo~Socket} socket The socket connection to reply on.
   * @param {number|string} gId The guild id to look at.
   * @param {number|string} mId The member's id to lookup.
   * @param {basicCB} [cb] Callback that fires once the requested action is
   * complete, or has failed.
   */
  function fetchMember(userData, socket, gId, mId, cb) {
    if (!checkPerm(userData, gId, null, 'players')) return;
    const g = hg.client.guilds.get(gId);
    if (!g) return;
    const m = g.members.get(mId);
    if (!m) return;
    const finalMember = makeMember(m);

    if (typeof cb === 'function') cb();
    socket.emit('member', gId, mId, finalMember);
  }
  this.fetchMember = fetchMember;
  /**
   * Fetch data about a channel of a guild.
   *
   * @private
   * @type {HGWeb~SocketFunction}
   * @param {Object} userData The current user's session data.
   * @param {socketIo~Socket} socket The socket connection to reply on.
   * @param {number|string} gId The guild id to look at.
   * @param {number|string} cId The channel's id to lookup.
   * @param {basicCB} [cb] Callback that fires once the requested action is
   * complete, or has failed.
   */
  function fetchChannel(userData, socket, gId, cId, cb) {
    if (!checkChannelPerm(userData, gId, cId, '')) return;
    const g = hg.client.guilds.get(gId);
    if (!g) return;
    const m = g.members.get(userData.id);
    const channel = g.channels.get(cId);

    const perms = channel.permissionsFor(m) || {bitfield: 0};

    const stripped = {};
    stripped.id = channel.id;
    stripped.permissions = perms.bitfield;
    stripped.name = channel.name;
    stripped.position = channel.position;
    if (channel.parent) stripped.parent = {position: channel.parent.position};
    stripped.type = channel.type;

    if (typeof cb === 'function') cb();
    socket.emit('channel', gId, cId, stripped);
  }
  this.fetchChannel = fetchChannel;
  /**
   * Fetch all game data within a guild.
   * @see {@link HungryGames.getGame}
   *
   * @private
   * @type {HGWeb~SocketFunction}
   * @param {Object} userData The current user's session data.
   * @param {socketIo~Socket} socket The socket connection to reply on.
   * @param {number|string} gId The guild id to look at.
   * @param {basicCB} [cb] Callback that fires once the requested action is
   * complete, or has failed.
   */
  function fetchGames(userData, socket, gId, cb) {
    if (!checkPerm(userData, gId, null, 'options') ||
        !checkPerm(userData, gId, null, 'players')) {
      if (!checkMyGuild(gId)) return;
      replyNoPerm(socket, 'fetchGames');
      return;
    }

    if (typeof cb === 'function') cb();
    socket.emit('game', gId, hg.getGame(gId));
  }
  this.fetchGames = fetchGames;
  /**
   * Fetch the updated game's day information.
   * @see {@link HungryGames.getGame}
   *
   * @private
   * @type {HGWeb~SocketFunction}
   * @param {Object} userData The current user's session data.
   * @param {socketIo~Socket} socket The socket connection to reply on.
   * @param {number|string} gId The guild id to look at.
   * @param {basicCB} [cb] Callback that fires once the requested action is
   * complete, or has failed.
   */
  function fetchDay(userData, socket, gId, cb) {
    let g; let m;
    if (!userData) {
      return;
    } else {
      g = hg.client.guilds.get(gId);
      if (!g) {
        // Request is probably fulfilled by another sibling.
        return;
      } else {
        m = g.members.get(userData.id);
        if (!m) {
          hg.log(
              'Attempted fetchDay, but unable to find member in guild' + gId +
              '@' + userData.id);
          return;
        }
      }
    }
    const game = hg.getGame(gId);
    if (!game || !game.currentGame || !game.currentGame.day) {
      if (typeof cb === 'function') cb('NO_GAME_IN_GUILD');
      socket.emit(
          'message', 'There doesn\'t appear to be a game on this server yet.');
      return;
    }

    if (!g.channels.get(game.outputChannel)
        .permissionsFor(m)
        .has(hg.Discord.Permissions.FLAGS.VIEW_CHANNEL)) {
      replyNoPerm(socket, 'fetchDay');
      return;
    }

    if (typeof cb === 'function') cb();
    socket.emit(
        'day', gId, game.currentGame.day, game.currentGame.includedUsers);
  }
  this.fetchDay = fetchDay;
  /**
   * Exclude a member from the Games.
   * @see {@link HungryGames.excludeUsers}
   *
   * @private
   * @type {HGWeb~SocketFunction}
   * @param {Object} userData The current user's session data.
   * @param {socketIo~Socket} socket The socket connection to reply on.
   * @param {number|string} gId The guild id to look at.
   * @param {number|string} mId The member id to exclude.
   * @param {basicCB} [cb] Callback that fires once the requested action is
   * complete, or has failed.
   */
  function excludeMember(userData, socket, gId, mId, cb) {
    if (!checkPerm(userData, gId, null, 'exclude')) {
      if (!checkMyGuild(gId)) return;
      if (typeof cb === 'function') cb('NO_PERM');
      replyNoPerm(socket, 'excludeMember');
      return;
    }
    let out;
    if (mId === 'everyone' || mId === 'online' || mId == 'offline' ||
        mId == 'dnd' || mId == 'idle') {
      out = hg.excludeUsers(mId, gId);
    } else {
      out = hg.excludeUsers([mId], gId);
    }
    if (typeof cb === 'function') cb(out);
  }
  this.excludeMember = excludeMember;
  /**
   * Include a member in the Games.
   * @see {@link HungryGames.includeUsers}
   *
   * @private
   * @type {HGWeb~SocketFunction}
   * @param {Object} userData The current user's session data.
   * @param {socketIo~Socket} socket The socket connection to reply on.
   * @param {number|string} gId The guild id to look at.
   * @param {number|string} mId The member id to include.
   * @param {basicCB} [cb] Callback that fires once the requested action is
   * complete, or has failed.
   */
  function includeMember(userData, socket, gId, mId, cb) {
    if (!checkPerm(userData, gId, null, 'include')) {
      if (!checkMyGuild(gId)) return;
      if (typeof cb === 'function') cb('NO_PERM');
      replyNoPerm(socket, 'includeMember');
      return;
    }
    let out;
    if (mId === 'everyone' || mId === 'online' || mId == 'offline' ||
        mId == 'dnd' || mId == 'idle') {
      out = hg.includeUsers(mId, gId);
    } else {
      out = hg.includeUsers([mId], gId);
    }
    if (typeof cb === 'function') cb(out);
    // socket.emit('game', gId, hg.getGame(gId));
  }
  this.includeMember = includeMember;
  /**
   * Toggle an option in the Games.
   * @see {@link HungryGames.setOption}
   *
   * @private
   * @type {HGWeb~SocketFunction}
   * @param {Object} userData The current user's session data.
   * @param {socketIo~Socket} socket The socket connection to reply on.
   * @param {number|string} gId The guild id to look at.
   * @param {string} option The option to change.
   * @param {string|number} value The value to set option to.
   * @param {string} extra The extra text if the option is in an object.
   * @param {basicCB} [cb] Callback that fires once the requested action is
   * complete, or has failed.
   */
  function toggleOption(userData, socket, gId, option, value, extra, cb) {
    if (!checkPerm(userData, gId, null, 'option')) {
      if (!checkMyGuild(gId)) return;
      if (typeof cb === 'function') cb('NO_PERM');
      replyNoPerm(socket, 'toggleOption');
      return;
    }
    if (typeof cb === 'function') cb();
    socket.emit('message', hg.setOption(gId, option, value, extra));
    if (hg.getGame(gId)) {
      socket.emit('option', gId, option, hg.getGame(gId).options[option]);
      if (option === 'teamSize') {
        socket.emit('game', gId, hg.getGame(gId));
      }
    }
  }
  this.toggleOption = toggleOption;
  /**
   * Create a Game.
   * @see {@link HungryGames.createGame}
   *
   * @private
   * @type {HGWeb~SocketFunction}
   * @param {Object} userData The current user's session data.
   * @param {socketIo~Socket} socket The socket connection to reply on.
   * @param {number|string} gId The guild id to look at.
   * @param {basicCB} [cb] Callback that fires once the requested action is
   * complete, or has failed.
   */
  function createGame(userData, socket, gId, cb) {
    if (!checkPerm(userData, gId, null, 'create')) {
      if (!checkMyGuild(gId)) return;
      if (typeof cb === 'function') cb('NO_PERM');
      replyNoPerm(socket, 'createGame');
      return;
    }
    hg.createGame(gId);
    if (typeof cb === 'function') {
      cb();
    } else {
      socket.emit('message', 'Game created');
    }
    socket.emit('game', gId, hg.getGame(gId));
  }
  this.createGame = createGame;
  /**
   * Reset game data.
   * @see {@link HungryGames.resetGame}
   *
   * @private
   * @type {HGWeb~SocketFunction}
   * @param {Object} userData The current user's session data.
   * @param {socketIo~Socket} socket The socket connection to reply on.
   * @param {number|string} gId The guild id to look at.
   * @param {string} cmd Command specifying what data to delete.
   * @param {basicCB} [cb] Callback that fires once the requested action is
   * complete, or has failed.
   */
  function resetGame(userData, socket, gId, cmd, cb) {
    if (!checkPerm(userData, gId, null, 'reset')) {
      if (!checkMyGuild(gId)) return;
      if (typeof cb === 'function') cb('NO_PERM');
      replyNoPerm(socket, 'resetGame');
      return;
    }
    if (typeof cb === 'function') cb();
    socket.emit('message', hg.resetGame(gId, cmd));
    socket.emit('game', gId, hg.getGame(gId));
  }
  this.resetGame = resetGame;
  /**
   * Start the game.
   * @see {@link HungryGames.startGame}
   *
   * @private
   * @type {HGWeb~SocketFunction}
   * @param {Object} userData The current user's session data.
   * @param {socketIo~Socket} socket The socket connection to reply on.
   * @param {number|string} gId The guild id to look at.
   * @param {number|string} cId Channel to start the game in.
   * @param {basicCB} [cb] Callback that fires once the requested action is
   * complete, or has failed.
   */
  function startGame(userData, socket, gId, cId, cb) {
    if (!checkChannelPerm(userData, gId, cId, 'start')) {
      if (!checkMyGuild(gId)) return;
      if (typeof cb === 'function') cb('NO_PERM');
      replyNoPerm(socket, 'startGame');
      return;
    }
    hg.startGame(userData.id, gId, cId);
    if (typeof cb === 'function') cb();
    socket.emit('message', 'Game started');
    socket.emit('game', gId, hg.getGame(gId));
  }
  this.startGame = startGame;
  /**
   * Enable autoplay.
   * @see {@link HungryGames.startAutoplay}
   *
   * @private
   * @type {HGWeb~SocketFunction}
   * @param {Object} userData The current user's session data.
   * @param {socketIo~Socket} socket The socket connection to reply on.
   * @param {number|string} gId The guild id to look at.
   * @param {number|string} cId Channel to send the messages in.
   * @param {basicCB} [cb] Callback that fires once the requested action is
   * complete, or has failed.
   */
  function startAutoplay(userData, socket, gId, cId, cb) {
    if (!checkChannelPerm(userData, gId, cId, 'autoplay')) {
      if (!checkMyGuild(gId)) return;
      if (typeof cb === 'function') cb('NO_PERM');
      replyNoPerm(socket, 'startAutoplay');
      return;
    }
    hg.startAutoplay(userData.id, gId, cId);
    if (typeof cb === 'function') cb();
    socket.emit('message', 'Autoplay enabled');
    socket.emit('game', gId, hg.getGame(gId));
  }
  this.startAutoplay = startAutoplay;
  /**
   * Start the next day.
   * @see {@link HungryGames.nextDay}
   *
   * @private
   * @type {HGWeb~SocketFunction}
   * @param {Object} userData The current user's session data.
   * @param {socketIo~Socket} socket The socket connection to reply on.
   * @param {number|string} gId The guild id to look at.
   * @param {number|string} cId Channel to send the messages in.
   * @param {basicCB} [cb] Callback that fires once the requested action is
   * complete, or has failed.
   */
  function nextDay(userData, socket, gId, cId, cb) {
    if (!checkChannelPerm(userData, gId, cId, 'next')) {
      if (!checkMyGuild(gId)) return;
      if (typeof cb === 'function') cb('NO_PERM');
      replyNoPerm(socket, 'nextDay');
      return;
    }
    hg.nextDay(userData.id, gId, cId);
    if (typeof cb === 'function') cb();
    socket.emit('message', 'Starting next day');
  }
  this.nextDay = nextDay;
  /**
   * End the game.
   * @see {@link HungryGames.endGame}
   *
   * @private
   * @type {HGWeb~SocketFunction}
   * @param {Object} userData The current user's session data.
   * @param {socketIo~Socket} socket The socket connection to reply on.
   * @param {number|string} gId The guild id to look at.
   * @param {basicCB} [cb] Callback that fires once the requested action is
   * complete, or has failed.
   */
  function endGame(userData, socket, gId, cb) {
    if (!checkPerm(userData, gId, null, 'end')) {
      if (!checkMyGuild(gId)) return;
      if (typeof cb === 'function') cb('NO_PERM');
      replyNoPerm(socket, 'endGame');
      return;
    }
    hg.endGame(userData.id, gId);
    if (typeof cb === 'function') cb();
    socket.emit('message', 'Game ended');
    socket.emit('game', gId, hg.getGame(gId));
  }
  this.endGame = endGame;
  /**
   * Disable autoplay.
   * @see {@link HungryGames.pauseAutoplay}
   *
   * @private
   * @type {HGWeb~SocketFunction}
   * @param {Object} userData The current user's session data.
   * @param {socketIo~Socket} socket The socket connection to reply on.
   * @param {number|string} gId The guild id to look at.
   * @param {basicCB} [cb] Callback that fires once the requested action is
   * complete, or has failed.
   */
  function pauseAutoplay(userData, socket, gId, cb) {
    if (!checkPerm(userData, gId, null, 'pause')) {
      if (!checkMyGuild(gId)) return;
      if (typeof cb === 'function') cb('NO_PERM');
      replyNoPerm(socket, 'pauseAutoplay');
      return;
    }
    hg.pauseAutoplay(userData.id, gId);
    if (typeof cb === 'function') cb();
    socket.emit('message', 'Autoplay paused');
    socket.emit('game', gId, hg.getGame(gId));
  }
  this.pauseAutoplay = pauseAutoplay;
  /**
   * Edit the teams.
   * @see {@link HungryGames.editTeam}
   *
   * @private
   * @type {HGWeb~SocketFunction}
   * @param {Object} userData The current user's session data.
   * @param {socketIo~Socket} socket The socket connection to reply on.
   * @param {number|string} gId The guild id to look at.
   * @param {string} cmd The command to run.
   * @param {string} one The first argument.
   * @param {string} two The second argument.
   * @param {basicCB} [cb] Callback that fires once the requested action is
   * complete, or has failed.
   */
  function editTeam(userData, socket, gId, cmd, one, two, cb) {
    if (!checkPerm(userData, gId, null, 'team')) {
      if (!checkMyGuild(gId)) return;
      replyNoPerm(socket, 'editTeam');
      return;
    }
    const message = hg.editTeam(userData.id, gId, cmd, one, two);
    if (message) socket.emit('message', message);
    if (typeof cb === 'function') cb();
    // socket.emit('game', gId, hg.getGame(gId));
  }
  this.editTeam = editTeam;
  /**
   * Create a game event.
   * @see {@link HungryGames.createEvent}
   *
   * @private
   * @type {HGWeb~SocketFunction}
   * @param {Object} userData The current user's session data.
   * @param {socketIo~Socket} socket The socket connection to reply on.
   * @param {number|string} gId The guild id to look at.
   * @param {string} type The type of event.
   * @param {string} message The message of the event.
   * @param {string} nV Number of victims.
   * @param {string} nA Number of attackers.
   * @param {string} oV Outcome of victims.
   * @param {string} oA Outcome of attackers.
   * @param {string} kV Do the victims kill.
   * @param {string} kA Do the attackers kill.
   * @param {?Object} wV The weapon information for this event.
   * @param {?Object} wA The weapon information for this event.
   * @param {basicCB} [cb] Callback that fires once the requested action is
   * complete, or has failed.
   */
  function createEvent(
      userData, socket, gId, type, message, nV, nA, oV, oA, kV, kA, wV, wA,
      cb) {
    if (!checkPerm(userData, gId, null, 'event')) {
      if (!checkMyGuild(gId)) return;
      if (typeof cb === 'function') cb('NO_PERM');
      replyNoPerm(socket, 'createEvent');
      return;
    }
    const err =
        hg.makeAndAddEvent(gId, type, message, nV, nA, oV, oA, kV, kA, wV, wA);
    if (err) {
      if (typeof cb === 'function') cb('ATTEMPT_FAILED');
      socket.emit('message', 'Failed to create event: ' + err);
    } else {
      if (typeof cb === 'function') cb();
      socket.emit('message', 'Created ' + type + ' event.');
      socket.emit('game', gId, hg.getGame(gId));
    }
  }
  this.createEvent = createEvent;

  /**
   * Create a larger game event. Either Arena or Weapon at this point. If
   * message or weapon name already exists, this will instead edit the event.
   * @see {@link HungryGames.addMajorEvent}
   *
   * @private
   * @type {HGWeb~SocketFunction}
   * @param {Object} userData The current user's session data.
   * @param {socketIo~Socket} socket The socket connection to reply on.
   * @param {number|string} gId The guild id to look at.
   * @param {string} type The type of event.
   * @param {HungryGames~ArenaEvent|HungryGames~WeaponEvent} data The event
   * data.
   * @param {?string} name The name of the weapon if this is a weapon event.
   * @param {basicCB} [cb] Callback that fires once the requested action is
   * complete, or has failed.
   */
  function createMajorEvent(userData, socket, gId, type, data, name, cb) {
    if (!checkPerm(userData, gId, null, 'event')) {
      if (!checkMyGuild(gId)) return;
      if (typeof cb === 'function') cb('NO_PERM');
      replyNoPerm(socket, 'createMajorEvent');
      return;
    }
    const err = hg.addMajorEvent(gId, type, data, name);
    if (err) {
      if (typeof cb === 'function') cb('ATTEMPT_FAILED');
      socket.emit('message', 'Failed to create event: ' + err);
    } else {
      if (typeof cb === 'function') cb();
      socket.emit('message', 'Created ' + type + ' event.');
      socket.emit('game', gId, hg.getGame(gId));
    }
  }
  this.createMajorEvent = createMajorEvent;

  /**
   * Delete a larger game event. Either Arena or Weapon at this point.
   * @see {@link HungryGames.editMajorEvent}
   *
   * @private
   * @type {HGWeb~SocketFunction}
   * @param {Object} userData The current user's session data.
   * @param {socketIo~Socket} socket The socket connection to reply on.
   * @param {number|string} gId The guild id to look at.
   * @param {string} type The type of event.
   * @param {HungryGames~ArenaEvent|HungryGames~WeaponEvent} search The event
   * data to find to edit.
   * @param {HungryGames~ArenaEvent|HungryGames~WeaponEvent} data The event
   * data to set the matched searches to.
   * @param {?string} name The internal name of the weapon to find.
   * @param {?string} newName The new internal name of the weapon.
   * @param {basicCB} [cb] Callback that fires once the requested action is
   * complete, or has failed.
   */
  function editMajorEvent(
      userData, socket, gId, type, search, data, name, newName, cb) {
    if (!checkPerm(userData, gId, null, 'event')) {
      if (!checkMyGuild(gId)) return;
      if (typeof cb === 'function') cb('NO_PERM');
      replyNoPerm(socket, 'removeMajorEvent');
      return;
    }
    const err = hg.editMajorEvent(gId, type, search, data, name, newName);
    if (err) {
      if (typeof cb === 'function') cb('ATTEMPT_FAILED');
      socket.emit('message', 'Failed to edit event: ' + err);
    } else {
      if (typeof cb === 'function') cb();
      socket.emit('message', 'Edited ' + type + ' event.');
      socket.emit('game', gId, hg.getGame(gId));
    }
  }
  this.editMajorEvent = editMajorEvent;

  /**
   * Remove a game event.
   * @see {@link HungryGames.removeEvent}
   *
   * @private
   * @type {HGWeb~SocketFunction}
   * @param {Object} userData The current user's session data.
   * @param {socketIo~Socket} socket The socket connection to reply on.
   * @param {number|string} gId The guild id to look at.
   * @param {string} type The type of event.
   * @param {HungryGames~Event} event The game event to remove.
   * @param {basicCB} [cb] Callback that fires once the requested action is
   * complete, or has failed.
   */
  function removeEvent(userData, socket, gId, type, event, cb) {
    if (!checkPerm(userData, gId, null, 'event')) {
      if (!checkMyGuild(gId)) return;
      if (typeof cb === 'function') cb('NO_PERM');
      replyNoPerm(socket, 'removeEvent');
      return;
    }
    const err = hg.removeEvent(gId, type, event);
    if (err) {
      if (typeof cb === 'function') cb('ATTEMPT_FAILED');
      socket.emit('message', 'Failed to remove event: ' + err);
    } else {
      if (typeof cb === 'function') cb();
      socket.emit('message', 'Removed event.');
      socket.emit('game', gId, hg.getGame(gId));
    }
  }
  this.removeEvent = removeEvent;

  /**
   * Enable or disable an event without deleting it.
   * @see {@link HungryGames.toggleEvent}
   *
   * @private
   * @type {HGWeb~SocketFunction}
   * @param {Object} userData The current user's session data.
   * @param {socketIo-Socket} socket The socket connection to reply on.
   * @param {number|string} gId The guild id to run this command on.
   * @param {string} type The type of event that we are toggling.
   * @param {?string} subCat The subcategory if necessary.
   * @param {HungryGames~Event|HungryGames~ArenaEvent|HungryGames~WeaponEvent}
   * event The event to toggle.
   * @param {?boolean} value Set the enabled value instead of toggling.
   * @param {basicCB} [cb] Callback that fires once the requested action is
   * complete.
   */
  function toggleEvent(userData, socket, gId, type, subCat, event, value, cb) {
    if (!checkPerm(userData, gId, null, 'event')) {
      if (!checkMyGuild(gId)) return;
      if (typeof cb === 'function') cb('NO_PERM');
      replyNoPerm(socket, 'removeEvent');
      return;
    }
    const err = hg.toggleEvent(gId, type, subCat, event, value);
    if (err) {
      if (typeof cb === 'function') cb('ATTEMPT_FAILED');
      socket.emit('message', 'Failed to toggle event: ' + err);
    } else {
      if (typeof cb === 'function') cb();
      // socket.emit('message', 'Toggled event.');
      // socket.emit('game', gId, hg.getGame(gId));
    }
  }
  this.toggleEvent = toggleEvent;

  /**
   * Force a player in the game to end a day in a certain state.
   * @see {@link HungryGames.forcePlayerState}
   *
   * @private
   * @type {HGWeb~SocketFunction}
   * @param {Object} userData The current user's session data.
   * @param {socketIo-Socket} socket The socket connection to reply on.
   * @param {number|string} gId The guild id to run this command on.
   * @param {string[]} list The list of user IDs of the players to effect.
   * @param {string} state The forced state.
   * @param {string} [text] The message to show in the games as a result of this
   * command.
   * @param {boolean} [persists] Will this state be forced until the game ends.
   * @param {basicCB} [cb] Callback that fires once the requested action is
   * complete.
   */
  function forcePlayerState(
      userData, socket, gId, list, state, text, persists, cb) {
    let cmdToCheck = state;
    switch (state) {
      case 'living':
      case 'thriving':
        cmdToCheck = 'heal';
        break;
      case 'dead':
        cmdToCheck = 'kill';
        break;
      case 'wounded':
        cmdToCheck = 'hurt';
        break;
    }
    if (!checkPerm(userData, gId, null, cmdToCheck)) {
      if (!checkMyGuild(gId)) return;
      if (typeof cb === 'function') cb('NO_PERM');
      replyNoPerm(socket, 'removeEvent');
      return;
    }
    socket.emit(
        'message', hg.forcePlayerState(gId, list, state, text, persists));
    if (typeof cb === 'function') cb();
  }
  this.forcePlayerState = forcePlayerState;

  hg.log('Init Web');
}

module.exports = HGWeb;
