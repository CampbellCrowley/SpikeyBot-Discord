const http = require('http');
const socketIo = require('socket.io');
const auth = require('../../auth.js');
const crypto = require('crypto');
const HungryGames = require('../hg/HungryGames.js');
const MessageMaker = require('../lib/MessageMaker.js');

require('../subModule.js').extend(HGWeb);  // Extends the SubModule class.

/**
 * @classdesc Creates a web interface for managing the Hungry Games. Expects
 * ../hungryGames.js is loaded or will be loaded.
 * @class
 */
function HGWeb() {
  const self = this;
  this.myName = 'HGWeb';

  let hg_ = null;

  let ioClient;
  /**
   * Buffer storing all current image uploads and their associated meta-data.
   *
   * @private
   * @type {object}
   */
  const imageBuffer = {};

  const app = http.createServer(handler);
  let io;

  app.on('error', function(err) {
    if (io) io.close();
    if (app) app.close();
    if (err.code === 'EADDRINUSE') {
      self.warn(
          'HGWeb failed to bind to port because it is in use. (' + err.port +
          ')');
      startClient();
    } else {
      self.error('HGWeb failed to bind to port for unknown reason.', err);
    }
  });

  /**
   * Start a socketio client connection to the primary running server.
   *
   * @private
   */
  function startClient() {
    self.log(
        'Restarting into client mode due to server already bound to port.');
    ioClient = require('socket.io-client')(
        self.common.isRelease ? 'http://localhost:8011' :
                                'http://localhost:8013',
        {path: '/www.spikeybot.com/socket.io/hg/'});
    clientSocketConnection(ioClient);
  }

  /**
   * Update the reference to HungryGames.
   *
   * @private
   * @returns {HG} Reference to the currently loaded HungryGames subModule.
   */
  function hg() {
    const prev = hg_;
    hg_ = self.bot.getSubmodule('./hungryGames.js');
    if (!hg_) return;
    if (prev !== hg_) {
      unlinkHG();
      hg_.on('dayStateChange', dayStateChange);
      hg_.on('toggleOption', handleOptionChange);
      hg_.on('create', broadcastGame);
      hg_.on('refresh', broadcastGame);
      hg_.on('memberAdd', handleMemberAdd);
      hg_.on('memberRemove', handleMemberRemove);
      hg_.on('actionInsert', handleActionUpdate);
      hg_.on('actionRemove', handleActionUpdate);
      hg_.on('actionUpdate', handleActionUpdate);
      hg_.on('eventToggled', handleEventToggled);
      hg_.on('eventAdded', handleEventAdded);
      hg_.on('eventRemoved', handleEventRemoved);
      hg_.on('gameStarted', broadcastGame);
      hg_.on('reset', broadcastGame);
      hg_.on('shutdown', unlinkHG);

      hg_.client.on('guildMemberAdd', handleGuildMemberAdd);
      hg_.client.on('guildMemberRemove', handleGuildMemberRemove);
    }
    return hg_;
  }

  /**
   * Unregister all event handlers from `hg_`.
   *
   * @private
   */
  function unlinkHG() {
    if (!hg_) return;
    hg_.removeListener('dayStateChange', dayStateChange);
    hg_.removeListener('toggleOption', handleOptionChange);
    hg_.removeListener('create', broadcastGame);
    hg_.removeListener('refresh', broadcastGame);
    hg_.removeListener('memberAdd', handleMemberAdd);
    hg_.removeListener('memberRemove', handleMemberRemove);
    hg_.removeListener('actionInsert', handleActionUpdate);
    hg_.removeListener('actionRemove', handleActionUpdate);
    hg_.removeListener('actionUpdate', handleActionUpdate);
    hg_.removeListener('eventToggled', handleEventToggled);
    hg_.removeListener('eventAdded', handleEventAdded);
    hg_.removeListener('eventRemoved', handleEventRemoved);
    hg_.removeListener('gameStarted', broadcastGame);
    hg_.removeListener('reset', broadcastGame);
    hg_.removeListener('shutdown', unlinkHG);

    hg_.client.removeListener('guildMemberAdd', handleGuildMemberAdd);
    hg_.client.removeListener('guildMemberRemove', handleGuildMemberRemove);
  }

  /** @inheritdoc */
  this.initialize = function() {
    io = socketIo(
        app, {path: '/www.spikeybot.com/socket.io/', serveClient: false});
    app.listen(self.common.isRelease ? 8011 : 8013, '127.0.0.1');
    io.on('connection', socketConnection);
  };

  /**
   * Causes a full shutdown of all servers.
   *
   * @public
   */
  this.shutdown = function() {
    if (io) io.close();
    if (ioClient) {
      ioClient.close();
      ioClient = null;
    }
    if (app) app.close();
    unlinkHG();
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
   * @type {object.<Socket>}
   */
  const sockets = {};

  /**
   * Returns the number of connected clients that are not siblings.
   *
   * @public
   * @returns {number} Number of sockets.
   */
  this.getNumClients = function() {
    return Object.keys(sockets).length - Object.keys(siblingSockets).length;
  };

  /**
   * Map of all sockets connected that are siblings.
   *
   * @private
   * @type {object.<Socket>}
   */
  const siblingSockets = {};

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
    self.common.log(
        'Socket connected (' + Object.keys(sockets).length + '): ' + ipName,
        socket.id);
    sockets[socket.id] = socket;

    // @TODO: Replace this authentication with gpg key-pairs;
    socket.on('vaderIAmYourSon', (verification, cb) => {
      if (verification === auth.hgWebSiblingVerification) {
        siblingSockets[socket.id] = socket;
        cb(auth.hgWebSiblingVerificationResponse);

        socket.on('_guildBroadcast', (gId, ...args) => {
          for (const i in sockets) {
            if (sockets[i] && sockets[i].cachedGuilds &&
                sockets[i].cachedGuilds.includes(gId)) {
              sockets[i].emit(...args);
            }
          }
        });
      } else {
        self.common.error('Client failed to authenticate as child.', socket.id);
      }
    });

    // Unrestricted Access //
    socket.on('fetchDefaultOptions', () => {
      socket.emit('defaultOptions', hg().defaultOptions.entries);
    });
    socket.on('fetchDefaultEvents', () => {
      socket.emit('defaultEvents', hg().getDefaultEvents().serializable);
    });
    socket.on('fetchActionList', () => {
      const Action = HungryGames.Action;
      if (!Action) {
        socket.emit('actionList', null, null);
      } else {
        socket.emit('actionList', Action.actionList, Action.triggerMeta);
      }
    });
    // End Unrestricted Access \\

    // Restricted Access //
    socket.on('fetchGuilds', (...args) => handle(fetchGuilds, args, false));
    socket.on('fetchGuild', (...args) => handle(self.fetchGuild, args));
    socket.on('fetchMember', (...args) => handle(self.fetchMember, args));
    socket.on('fetchRoles', (...args) => handle(self.fetchRoles, args));
    socket.on('fetchChannel', (...args) => handle(self.fetchChannel, args));
    socket.on('fetchGames', (...args) => handle(self.fetchGames, args));
    socket.on('fetchDay', (...args) => handle(self.fetchDay, args));
    socket.on('fetchNextDay', (...args) => handle(self.fetchNextDay, args));
    socket.on('fetchActions', (...args) => handle(self.fetchActions, args));
    socket.on('resetActions', (...args) => handle(self.resetActions, args));
    socket.on('insertAction', (...args) => handle(self.insertAction, args));
    socket.on('removeAction', (...args) => handle(self.removeAction, args));
    socket.on('updateAction', (...args) => handle(self.updateAction, args));
    socket.on('excludeMember', (...args) => handle(self.excludeMember, args));
    socket.on('includeMember', (...args) => handle(self.includeMember, args));
    socket.on('toggleOption', (...args) => handle(self.toggleOption, args));
    socket.on('createGame', (...args) => handle(self.createGame, args));
    socket.on('resetGame', (...args) => handle(self.resetGame, args));
    socket.on('startGame', (...args) => handle(self.startGame, args));
    socket.on('startAutoplay', (...args) => handle(self.startAutoplay, args));
    socket.on('nextDay', (...args) => handle(self.nextDay, args));
    socket.on('endGame', (...args) => handle(self.endGame, args));
    socket.on('pauseAutoplay', (...args) => handle(self.pauseAutoplay, args));
    socket.on('pauseGame', (...args) => handle(self.pauseGame, args));
    socket.on('editTeam', (...args) => handle(self.editTeam, args));
    socket.on(
        'createEvent', (...args) => handle(self.createEvent, args, false));
    socket.on('addEvent', (...args) => handle(self.addEvent, args));
    socket.on('removeEvent', (...args) => handle(self.removeEvent, args));
    socket.on(
        'deleteEvent', (...args) => handle(self.deleteEvent, args, false));
    socket.on('toggleEvent', (...args) => handle(self.toggleEvent, args));
    socket.on(
        'replaceEvent', (...args) => handle(self.replaceEvent, args, false));
    socket.on('fetchEvent', (...args) => handle(self.fetchEvent, args, false));
    socket.on(
        'fetchUserEvents',
        (...args) => handle(self.fetchUserEvents, args, false));
    socket.on(
        'claimLegacyEvents', (...args) => handle(self.claimLegacyEvents, args));
    socket.on(
        'forcePlayerState', (...args) => handle(self.forcePlayerState, args));
    socket.on('renameGame', (...args) => handle(self.renameGame, args));
    socket.on('removeNPC', (...args) => handle(self.removeNPC, args));
    socket.on(
        'fetchStatGroupList',
        (...args) => handle(self.fetchStatGroupList, args));
    socket.on(
        'fetchStatGroupMetadata',
        (...args) => handle(self.fetchStatGroupMetadata, args));
    socket.on('fetchStats', (...args) => handle(self.fetchStats, args));
    socket.on(
        'fetchLeaderboard', (...args) => handle(self.fetchLeaderboard, args));
    socket.on(
        'modifyInventory', (...args) => handle(self.modifyInventory, args));
    socket.on(
        'selectStatGroup', (...args) => handle(self.selectStatGroup, args));
    socket.on(
        'createStatGroup', (...args) => handle(self.createStatGroup, args));
    socket.on(
        'deleteStatGroup', (...args) => handle(self.deleteStatGroup, args));
    socket.on('imageChunk', (...args) => handle(self.imageChunk, args));
    socket.on('imageInfo', (...args) => handle(self.imageInfo, args));
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
    function handle(func, args, forward = true) {
      const noLog = ['fetchMember', 'fetchChannel', 'fetchEvent', 'imageChunk'];
      if (!noLog.includes(func.name.toString())) {
        const logArgs = args.map((el) => {
          if (typeof el === 'function') {
            return (el.name || 'cb') + '()';
          } else {
            return el;
          }
        });
        self.common.logDebug(`${func.name}(${logArgs.join(',')})`, socket.id);
      }
      let cb;
      if (typeof args[args.length - 1] === 'function') {
        const origCB = args[args.length - 1];
        let fired = false;
        cb = function(...args) {
          if (fired) {
            self.warn(
                'Attempting to fire callback a second time! (' + func.name +
                ')');
          }
          origCB(...args);
          fired = true;
        };
        args[args.length - 1] = cb;
      }
      try {
        func.apply(func, [args[0], socket].concat(args.slice(1)));
      } catch (err) {
        console.error(err);
        if (typeof cb === 'function') {
          cb('INTERNAL_SERVER_ERROR');
        }
        return;
      }
      if (typeof cb === 'function') {
        args[args.length - 1] = {_function: true};
      }
      if (forward) {
        Object.values(siblingSockets).forEach((s) => {
          s.emit(
              'forwardedRequest', args[0], socket.id, func.name, args.slice(1),
              (res) => {
                if (res._forward) socket.emit(...res.data);
                if (res._callback && typeof cb === 'function') {
                  cb(...res.data);
                }
              });
        });
      }
    }

    socket.on('disconnect', () => {
      self.common.log(
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
        self.common.log('Sibling authenticated successfully.', socket.id);
        authenticated = res === auth.hgWebSiblingVerificationResponse;
      });
    });

    socket.on('fetchGuilds', (userData, id, cb) => {
      fetchGuilds(userData, {id: id}, cb);
    });

    socket.on('forwardedRequest', (userData, sId, func, args, cb) => {
      if (!authenticated) return;
      const fakeSocket = {
        fake: true,
        emit: function(...args) {
          if (typeof cb == 'function') cb({_forward: true, data: args});
        },
        id: sId,
      };
      if (args[args.length - 1] && args[args.length - 1]._function) {
        args[args.length - 1] = function(...a) {
          if (typeof cb === 'function') cb({_callback: true, data: a});
        };
      }
      if (!self[func]) {
        self.common.error(func + ': is not a function.', socket.id);
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
   * @private
   * @param {HungryGames} hg HG object firing the event.
   * @param {string} gId Guild id of the state change.
   * @listens HG#dayStateChange
   */
  function dayStateChange(hg, gId) {
    const game = hg.getHG().getGame(gId);
    let eventState = null;
    if (!game) return;
    if (game.currentGame.day.events[game.currentGame.day.state - 2] &&
        game.currentGame.day.events[game.currentGame.day.state - 2].battle) {
      eventState =
          game.currentGame.day.events[game.currentGame.day.state - 2].state;
    }
    guildBroadcast(
        gId, 'dayState', game.currentGame.day.num, game.currentGame.day.state,
        eventState);
  }

  /**
   * Broadcast a message to all relevant clients.
   *
   * @private
   * @param {string} gId Guild ID to broadcast message for.
   * @param {string} event The name of the event to broadcast.
   * @param {*} args Data to send in broadcast.
   */
  function guildBroadcast(gId, event, ...args) {
    const keys = Object.keys(sockets);
    for (const i in keys) {
      if (!sockets[keys[i]].cachedGuilds) continue;
      if (sockets[keys[i]].cachedGuilds.find((g) => g === gId)) {
        sockets[keys[i]].emit(event, gId, ...args);
      }
    }
    if (ioClient) {
      ioClient.emit('_guildBroadcast', gId, event, gId, ...args);
    }
  }

  /**
   * Handles an option being changed and broadcasting the update to clients.
   *
   * @private
   * @listens HG#toggleOption
   * @param {HungryGames} hg HG object firing the event.
   * @param {string} gId Guild ID of the option change.
   * @param {string} opt1 Option key.
   * @param {string} opt2 Option second key or value.
   * @param {string} [opt3] Option value if object option.
   */
  function handleOptionChange(hg, gId, opt1, opt2, opt3) {
    if (opt1 === 'teamSize') {
      broadcastGame(hg, gId);
    } else {
      guildBroadcast(gId, 'option', opt1, opt2, opt3);
    }
  }

  /**
   * Handle a member being added to a guild.
   *
   * @private
   * @listens external:Discord~Client#guildMemberAdd
   * @param {external:Discord~GuildMember} member The member added.
   */
  function handleGuildMemberAdd(member) {
    handleMemberAdd(hg(), member.guild.id, member.id);
  }

  /**
   * Handle a member being removed from a guild.
   *
   * @private
   * @listens external:Discord~Client#guildMemberRemove
   * @param {external:Discord~GuildMember} member The member removed.
   */
  function handleGuildMemberRemove(member) {
    handleMemberRemove(hg(), member.guild.id, member.id);
  }

  /**
   * Handle a member being added to a guild.
   *
   * @private
   * @listens HG#memberAdd
   * @param {HungryGames} hg HG object firing the event.
   * @param {string} gId Guild ID of the member added.
   * @param {string} mId Member ID that was added.
   */
  function handleMemberAdd(hg, gId, mId) {
    guildBroadcast(gId, 'memberAdd', mId);
  }

  /**
   * Handle a member being removed from a guild.
   *
   * @private
   * @listens HG#memberRemove
   * @param {HungryGames} hg HG object firing the event.
   * @param {string} gId Guild ID of the member removed.
   * @param {string} mId Member ID that was removed.
   */
  function handleMemberRemove(hg, gId, mId) {
    guildBroadcast(gId, 'memberRemove', mId);
  }

  /**
   * Handle actions being modified in a server.
   *
   * @private
   * @listens HG#actionInsert
   * @listens HG#actionRemove
   * @listens HG#actionUpdate
   * @param {HungryGames} hg HG object firing event.
   * @param {string} gId The guild ID that was updated.
   */
  function handleActionUpdate(hg, gId) {
    const game = hg.getHG().getGame(gId);
    guildBroadcast(
        gId, 'actions', game && game.actions && game.actions.serializable);
  }

  /**
   * Handle events being toggled in a server.
   *
   * @private
   * @listens HG#eventToggled
   * @param {HungryGames} hg HG object firing event.
   * @param {string} gId The guild ID that was updated.
   * @param {string} type The category the event was toggled in.
   * @param {string} eId The ID of the event that was toggled.
   * @param {boolean} value The if event is now enabled.
   */
  function handleEventToggled(hg, gId, type, eId, value) {
    guildBroadcast(gId, 'eventToggled', type, eId, value);
  }

  /**
   * Handle events being added to a server.
   *
   * @private
   * @listens HG#eventAdded
   * @param {HungryGames} hg HG object firing event.
   * @param {string} gId The guild ID that was updated.
   * @param {string} type The event category.
   * @param {string} eId The ID of the event that was added.
   */
  function handleEventAdded(hg, gId, type, eId) {
    guildBroadcast(gId, 'eventAdded', type, eId);
  }

  /**
   * Handle events being removed from a server.
   *
   * @private
   * @listens HG#eventRemoved
   * @param {HungryGames} hg HG object firing event.
   * @param {string} gId The guild ID that was updated.
   * @param {string} type The event category.
   * @param {string} eId The ID of the event that was removed.
   */
  function handleEventRemoved(hg, gId, type, eId) {
    guildBroadcast(gId, 'eventRemoved', type, eId);
  }

  /**
   * Handles broadcasting the game data to all relevant clients.
   *
   * @private
   * @listens HG#create
   * @listens HG#refresh
   * @param {HungryGames} hg HG object firing event.
   * @param {string} gId The guild ID to data for.
   */
  function broadcastGame(hg, gId) {
    const game = hg.getHG().getGame(gId);
    guildBroadcast(gId, 'game', game && game.serializable);
  }

  /**
   * Send a message to the given socket informing the client that the command
   * they attempted failed due to insufficient permission.
   *
   * @private
   * @param {Socket} socket The socket.io socket to reply on.
   * @param {string} cmd THe command the client attempted.
   */
  function replyNoPerm(socket, cmd) {
    self.common.logDebug(
        'Attempted ' + cmd + ' without permission.', socket.id);
    socket.emit(
        'message', 'Failed to run command "' + cmd +
            '" because you don\'t have permission for this.');
  }

  /**
   * Checks if the current shard is responsible for the requested guild.
   *
   * @private
   * @param {number|string} gId The guild id to check.
   * @returns {boolean} True if this shard has this guild.
   */
  function checkMyGuild(gId) {
    const g = self.client.guilds.get(gId);
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
   * @returns {boolean} Whther the user has permission or not to manage the
   * hungry games in the given guild.
   */
  function checkPerm(userData, gId, cId, cmd) {
    if (!userData) return false;
    const msg = makeMessage(userData.id, gId, cId, 'hg ' + cmd);
    if (!msg || !msg.author) return false;
    if (userData.id == self.common.spikeyId) return true;
    return !self.command.validate(null, msg);
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
   * @returns {boolean} Whther the user has permission or not to manage the
   * hungry games in the given guild and has permission to send messages in the
   * given channel.
   */
  function checkChannelPerm(userData, gId, cId, cmd) {
    if (!checkPerm(userData, gId, cId, cmd)) return false;
    if (userData.id == self.common.spikeyId) return true;
    const g = self.client.guilds.get(gId);

    const channel = g.channels.get(cId);
    if (!channel) return false;

    const m = g.members.get(userData.id);

    const perms = channel.permissionsFor(m);
    if (!perms.has(self.Discord.Permissions.FLAGS.VIEW_CHANNEL)) return false;
    if (!perms.has(self.Discord.Permissions.FLAGS.SEND_MESSAGES)) return false;
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
   * @returns {?MessageMaker} The created message-like object, or null if
   * invalid channel.
   */
  function makeMessage(uId, gId, cId, msg) {
    const message = new MessageMaker(self, uId, gId, cId, msg);
    return message.guild ? message : null;
  }

  /**
   * Strips a Discord~GuildMember to only the necessary data that a client will
   * need.
   *
   * @private
   * @param {Discord~GuildMember} m The guild member to strip the data from.
   * @returns {object} The minimal member.
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
        user: self.client.users.get(m),
      };
    }
    return {
      nickname: m.nickname,
      roles: m.roles.map((el) => el.id),
      color: m.displayColor,
      guild: {id: m.guild.id},
      permissions: m.permissions.bitfield,
      premiumSinceTimestamp: m.premiumSinceTimestamp,
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
   * Cancel and clean up a current image upload.
   *
   * @private
   * @param {string} iId Image upload ID to purge and abort.
   */
  function cancelImageUpload(iId) {
    if (!imageBuffer[iId]) return;
    clearTimeout(imageBuffer[iId].timeout);
    delete imageBuffer[iId];
  }

  /**
   * Create an upload ID and buffer for a client to send to. Automatically
   * cancelled after 60 seconds.
   *
   * @private
   * @param {string} uId The user ID that started this upload.
   * @returns {object} The metadata storing object.
   */
  function beginImageUpload(uId) {
    let id;
    do {
      id = `${crypto.randomBytes(8).toString('hex').toUpperCase()}`;
    } while (imageBuffer[id]);
    imageBuffer[id] =
        {receivedBytes: 0, buffer: [], startTime: Date.now(), id: id, uId: uId};
    imageBuffer[id].timeout = setTimeout(function() {
      cancelImageUpload(id);
    }, 60000);
    return imageBuffer[id];
  }

  /**
   * @description Function calls handlers for requested commands.
   * @typedef HGWeb~SocketFunction
   * @type Function
   *
   * @param {WebUserData} userData The user data of the user performing the
   * request.
   * @param {socketIo~Socket} socket The socket connection firing the command.
   * Not necessarily the socket that will reply to the end client.
   * @param {...*} args Additional function-specific arguments.
   * @param {HGWeb~basicCB} [cb] Callback that fires once requested action is
   * complete or has failed. Client may not pass a callback.
   */

  /**
   * Basic callback with single argument. The argument is null if there is no
   * error, or a string if there was an error.
   *
   * @callback HGWeb~basicCB
   *
   * @param {?string} err The error response.
   * @param {*} res Response data if no error.
   */

  /**
   * Fetch all relevant data for all mutual guilds with the user and send it to
   * the user.
   *
   * @private
   * @type {HGWeb~SocketFunction}
   * @param {object} userData The current user's session data.
   * @param {socketIo~Socket} socket The socket connection to reply on.
   * @param {Function} [cb] Callback that fires once the requested action is
   * complete, or has failed.
   */
  function fetchGuilds(userData, socket, cb) {
    if (!userData) {
      self.common.error('Fetch Guilds without userData', socket.id);
      if (typeof cb === 'function') cb('SIGNED_OUT');
      return;
    } else if (userData.apiRequest) {
      // Disabled for API requests due to the possible issue with performance
      // fetching list of guilds.
      return;
    }

    const numReplies = (Object.entries(siblingSockets).length || 0);
    let replied = 0;
    const guildBuffer = {};
    let done;
    if (typeof cb === 'function') {
      done = cb;
    } else {
      /**
       * The callback for each response with the requested data. Replies to the
       * user once all requests have replied.
       *
       * @private
       * @param {string|object} guilds Either the guild data to send to the
       * user, or 'guilds' if this is a reply from a sibling client.
       * @param {?string} [err] The error that occurred, or null if no error.
       * @param {object} [response] The guild data if `guilds` equals 'guilds'.
       */
      done = function(guilds, err, response) {
        if (guilds === 'guilds') {
          if (err) {
            guilds = null;
          } else {
            guilds = response;
          }
        }
        for (let i = 0; guilds && i < guilds.length; i++) {
          guildBuffer[guilds[i].id] = guilds[i];
        }
        replied++;
        if (replied > numReplies) {
          if (typeof cb === 'function') cb(guildBuffer);
          socket.emit('guilds', null, guildBuffer);
          socket.cachedGuilds = Object.keys(guildBuffer || {});
        }
      };
    }
    Object.entries(siblingSockets).forEach((obj) => {
      obj[1].emit('fetchGuilds', userData, socket.id, done);
    });

    try {
      let guilds = [];
      if (userData.guilds && userData.guilds.length > 0) {
        userData.guilds.forEach((el) => {
          const g = self.client.guilds.get(el.id);
          if (!g) return;
          guilds.push(g);
        });
      } else {
        guilds = self.client.guilds
            .filter((obj) => {
              return obj.members.get(userData.id);
            })
            .array();
      }
      const strippedGuilds = stripGuilds(guilds, userData);
      done(strippedGuilds);
    } catch (err) {
      self.common.error(
          'Error while fetching guilds (Cached: ' +
              (userData.guilds && true || false) + ')',
          socket.id);
      console.error(err);
      done();
    }
  }

  /**
   * Strip a Discord~Guild to the basic information the client will need.
   *
   * @private
   * @param {Discord~Guild[]} guilds The array of guilds to strip.
   * @param {object} userData The current user's session data.
   * @returns {Array<object>} The stripped guilds.
   */
  function stripGuilds(guilds, userData) {
    return guilds.map((g) => {
      let dOpts = self.command.getDefaultSettings() || {};
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
      let uOpts = self.command.getUserSettings(g.id) || {};
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
      newG.bot = self.client.user.id;
      newG.ownerId = g.ownerID;
      newG.members = g.members.map((m) => {
        return m.id;
      });
      newG.defaultSettings = dOpts;
      newG.userSettings = uOpts;
      newG.channels =
          g.channels
              .filter((c) => {
                return userData.id == self.common.spikeyId ||
                    c.permissionsFor(member).has(
                        self.Discord.Permissions.FLAGS.VIEW_CHANNEL);
              })
              .map((c) => {
                return {
                  id: c.id,
                  permissions: userData.id == self.common.spikeyId ?
                      self.Discord.Permissions.ALL :
                      c.permissionsFor(member).bitfield,
                };
              });
      newG.myself = makeMember(member || userData.id);
      return newG;
    });
  }

  /**
   * Fetch a single guild.
   *
   * @public
   * @type {HGWeb~SocketFunction}
   * @param {object} userData The current user's session data.
   * @param {socketIo~Socket} socket The socket connection to reply on.
   * @param {string|number} gId The ID of the guild that was requested.
   * @param {HGWeb~basicCB} [cb] Callback that fires once the requested action
   * is complete, or has failed.
   */
  this.fetchGuild = function fetchGuild(userData, socket, gId, cb) {
    if (!userData) {
      self.common.error('Fetch Guild without userData', socket.id);
      if (typeof cb === 'function') cb('SIGNED_OUT');
      return;
    }
    if (typeof cb !== 'function') {
      self.common.logWarning(
          'Fetch Guild attempted without callback', socket.id);
      return;
    }

    const guild = self.client.guilds.get(gId);
    if (!guild) {
      return;
    }
    if (userData.id != self.common.spikeyId &&
        !guild.members.get(userData.id)) {
      cb(null);
      return;
    }
    cb(null, stripGuilds([guild], userData)[0]);
  };
  /**
   * Fetch data about a member of a guild.
   *
   * @public
   * @type {HGWeb~SocketFunction}
   * @param {object} userData The current user's session data.
   * @param {socketIo~Socket} socket The socket connection to reply on.
   * @param {number|string} gId The guild id to look at.
   * @param {number|string} mId The member's id to lookup.
   * @param {HGWeb~basicCB} [cb] Callback that fires once the requested action
   * is complete, or has failed.
   */
  this.fetchMember = function fetchMember(userData, socket, gId, mId, cb) {
    if (!checkPerm(userData, gId, null, 'players')) return;
    const g = self.client.guilds.get(gId);
    if (!g) return;
    const m = g.members.get(mId);
    if (!m) return;
    const finalMember = makeMember(m);

    if (typeof cb === 'function') {
      cb(null, finalMember);
    } else {
      socket.emit('member', gId, mId, finalMember);
    }
  };
  /**
   * Fetch data about a role in a guild.
   *
   * @public
   * @type {HGWeb~SocketFunction}
   * @param {object} userData The current user's session data.
   * @param {socketIo~Socket} socket The socket connection to reply on.
   * @param {number|string} gId The guild id to look at.
   * @param {HGWeb~basicCB} [cb] Callback that fires once the requested action
   * is complete, or has failed.
   */
  this.fetchRoles = function fetchRoles(userData, socket, gId, cb) {
    if (!checkPerm(userData, gId, null)) return;
    const g = self.client.guilds.get(gId);
    if (!g) return;

    const roles = g.roles.array();

    if (typeof cb === 'function') {
      cb(null, roles);
    } else {
      socket.emit('member', gId, roles);
    }
  };
  /**
   * Fetch data about a channel of a guild.
   *
   * @public
   * @type {HGWeb~SocketFunction}
   * @param {object} userData The current user's session data.
   * @param {socketIo~Socket} socket The socket connection to reply on.
   * @param {number|string} gId The guild id to look at.
   * @param {number|string} cId The channel's id to lookup.
   * @param {HGWeb~basicCB} [cb] Callback that fires once the requested action
   * is complete, or has failed.
   */
  this.fetchChannel = function fetchChannel(userData, socket, gId, cId, cb) {
    if (!checkChannelPerm(userData, gId, cId, '')) return;
    const g = self.client.guilds.get(gId);
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

    if (typeof cb === 'function') {
      cb(null, stripped);
    } else {
      socket.emit('channel', gId, cId, stripped);
    }
  };
  /**
   * Fetch all game data within a guild.
   *
   * @see {@link HungryGames.getGame}
   *
   * @public
   * @type {HGWeb~SocketFunction}
   * @param {object} userData The current user's session data.
   * @param {socketIo~Socket} socket The socket connection to reply on.
   * @param {number|string} gId The guild id to look at.
   * @param {basicCB} [cb] Callback that fires once the requested action is
   * complete, or has failed.
   */
  this.fetchGames = function fetchGames(userData, socket, gId, cb) {
    if (!checkPerm(userData, gId, null, 'options') ||
        !checkPerm(userData, gId, null, 'events') ||
        !checkPerm(userData, gId, null, 'players')) {
      if (!checkMyGuild(gId)) return;
      replyNoPerm(socket, 'fetchGames');
      return;
    }

    const game = hg().getHG().getGame(gId);
    if (typeof cb === 'function') {
      cb(null, game && game.serializable);
    } else {
      socket.emit('game', gId, game && game.serializable);
    }
  };
  /**
   * Fetch the updated game's day information.
   *
   * @see {@link HungryGames.getGame}
   *
   * @public
   * @type {HGWeb~SocketFunction}
   * @param {object} userData The current user's session data.
   * @param {socketIo~Socket} socket The socket connection to reply on.
   * @param {number|string} gId The guild id to look at.
   * @param {basicCB} [cb] Callback that fires once the requested action is
   * complete, or has failed.
   */
  this.fetchDay = function fetchDay(userData, socket, gId, cb) {
    let g; let m;
    if (!userData) {
      return;
    } else {
      g = self.client.guilds.get(gId);
      if (!g) {
        // Request is probably fulfilled by another sibling.
        return;
      } else {
        m = g.members.get(userData.id);
        if (!m) {
          self.common.log(
              'Attempted fetchDay, but unable to find member in guild' + gId +
                  '@' + userData.id,
              socket.id);
          return;
        }
      }
    }
    const game = hg().getHG().getGame(gId);
    if (!game || !game.currentGame || !game.currentGame.day) {
      if (typeof cb === 'function') {
        cb('NO_GAME_IN_GUILD');
      } else {
        socket.emit(
            'message',
            'There doesn\'t appear to be a game on this server yet.');
      }
      return;
    }

    if (!g.channels.get(game.outputChannel)
        .permissionsFor(m)
        .has(self.Discord.Permissions.FLAGS.VIEW_CHANNEL)) {
      replyNoPerm(socket, 'fetchDay');
      return;
    }

    if (typeof cb === 'function') {
      cb(null, game.currentGame.day, game.currentGame.includedUsers);
    } else {
      socket.emit(
          'day', gId, game.currentGame.day, game.currentGame.includedUsers);
    }
  };
  /**
   * Fetch the game's next day information.
   *
   * @see {@link HungryGames.getGame}
   *
   * @public
   * @type {HGWeb~SocketFunction}
   * @param {object} userData The current user's session data.
   * @param {socketIo~Socket} socket The socket connection to reply on.
   * @param {number|string} gId The guild id to look at.
   * @param {HGWeb~basicCB} [cb] Callback that fires once the requested action
   * is complete, or has failed.
   */
  this.fetchNextDay = function fetchNextDay(userData, socket, gId, cb) {
    if (!checkPerm(userData, gId, null, 'kill')) {
      if (!checkMyGuild(gId)) return;
      if (typeof cb === 'function') cb('NO_PERM');
      replyNoPerm(socket, 'fetchNextDay');
      return;
    }
    const g = self.client.guilds.get(gId);
    const m = g.members.get(userData.id);
    if (!m) {
      if (typeof cb === 'function') cb('NO_PERM');
      replyNoPerm(socket, 'fetchNextDay');
      return;
    }
    const game = hg().getHG().getGame(gId);
    if (!game || !game.currentGame || !game.currentGame.nextDay) {
      if (typeof cb === 'function') {
        cb('NO_GAME_IN_GUILD');
      } else {
        socket.emit(
            'message',
            'There doesn\'t appear to be a game on this server yet.');
      }
      return;
    }

    if (!g.channels.get(game.outputChannel)
        .permissionsFor(m)
        .has(self.Discord.Permissions.FLAGS.VIEW_CHANNEL)) {
      replyNoPerm(socket, 'fetchNextDay');
      return;
    }

    if (typeof cb === 'function') {
      cb(null, game.currentGame.nextDay);
    } else {
      socket.emit('nextDay', gId, game.currentGame.nextDay);
    }
  };
  /**
   * Fetch the game's current action/trigger information.
   *
   * @public
   * @type {HGWeb~SocketFunction}
   * @param {object} userData The current user's session data.
   * @param {socketIo~Socket} socket The socket connection to reply on.
   * @param {number|string} gId The guild id to look at.
   * @param {HGWeb~basicCB} [cb] Callback that fires once the requested action
   * is complete, or has failed.
   */
  this.fetchActions = function fetchActions(userData, socket, gId, cb) {
    if (!checkPerm(userData, gId, null, 'options')) {
      if (!checkMyGuild(gId)) return;
      if (typeof cb === 'function') cb('NO_PERM');
      replyNoPerm(socket, 'fetchActions');
      return;
    }
    const game = hg().getHG().getGame(gId);
    if (!game || !game.actions) {
      if (typeof cb === 'function') cb('NO_GAME_IN_GUILD');
      return;
    }

    if (typeof cb === 'function') {
      cb(null, game.actions.serializable);
    } else {
      socket.emit('actions', gId, game.actions.serializable);
    }
  };
  /**
   * Reset the game's current action/trigger information to default values.
   *
   * @public
   * @type {HGWeb~SocketFunction}
   * @param {object} userData The current user's session data.
   * @param {socketIo~Socket} socket The socket connection to reply on.
   * @param {number|string} gId The guild id to look at.
   * @param {HGWeb~basicCB} [cb] Callback that fires once the requested action
   * is complete, or has failed.
   */
  this.resetActions = function resetActions(userData, socket, gId, cb) {
    if (!checkPerm(userData, gId, null, 'options')) {
      if (!checkMyGuild(gId)) return;
      if (typeof cb === 'function') cb('NO_PERM');
      replyNoPerm(socket, 'resetActions');
      return;
    }
    const response = hg().getHG().resetGame(gId, 'actions');

    if (typeof cb === 'function') cb(null, response);
  };
  /**
   * Add an action to a trigger in a guild.
   *
   * @public
   * @type {HGWeb~SocketFunction}
   * @param {object} userData The current user's session data.
   * @param {socketIo~Socket} socket The socket connection to reply on.
   * @param {number|string} gId The guild id to look at.
   * @param {string} trigger The name of the trigger.
   * @param {string} action The name of the action.
   * @param {object} args Optional arguments to pass for the action creation.
   * @param {HGWeb~basicCB} [cb] Callback that fires once the requested action
   * is complete, or has failed.
   */
  this.insertAction = function insertAction(
      userData, socket, gId, trigger, action, args, cb) {
    if (!checkPerm(userData, gId, null, 'options')) {
      if (!checkMyGuild(gId)) return;
      if (typeof cb === 'function') cb('NO_PERM');
      replyNoPerm(socket, 'insertAction');
      return;
    }
    hg().getHG().insertAction(gId, trigger, action, args, cb);
  };
  /**
   * Remove an action from a trigger in a guild.
   *
   * @public
   * @type {HGWeb~SocketFunction}
   * @param {object} userData The current user's session data.
   * @param {socketIo~Socket} socket The socket connection to reply on.
   * @param {number|string} gId The guild id to look at.
   * @param {string} trigger The name of the trigger.
   * @param {string} id The id of the action to remove.
   * @param {HGWeb~basicCB} [cb] Callback that fires once the requested action
   * is complete, or has failed.
   */
  this.removeAction = function removeAction(
      userData, socket, gId, trigger, id, cb) {
    if (!checkPerm(userData, gId, null, 'options')) {
      if (!checkMyGuild(gId)) return;
      if (typeof cb === 'function') cb('NO_PERM');
      replyNoPerm(socket, 'removeAction');
      return;
    }
    hg().getHG().removeAction(gId, trigger, id, cb);
  };
  /**
   * Update an action for a trigger in a guild.
   *
   * @public
   * @type {HGWeb~SocketFunction}
   * @param {object} userData The current user's session data.
   * @param {socketIo~Socket} socket The socket connection to reply on.
   * @param {number|string} gId The guild id to look at.
   * @param {string} trigger The name of the trigger.
   * @param {string} id The id of the action to remove.
   * @param {string} key The key of the value to change.
   * @param {number|string} value The value to set.
   * @param {HGWeb~basicCB} [cb] Callback that fires once the requested action
   * is complete, or has failed.
   */
  this.updateAction = function updateAction(
      userData, socket, gId, trigger, id, key, value, cb) {
    if (!checkPerm(userData, gId, null, 'options')) {
      if (!checkMyGuild(gId)) return;
      if (typeof cb === 'function') cb('NO_PERM');
      replyNoPerm(socket, 'updateAction');
      return;
    }
    hg().getHG().updateAction(gId, trigger, id, key, value, cb);
  };
  /**
   * Exclude a member from the Games.
   *
   * @see {@link HungryGames.excludeUsers}
   *
   * @public
   * @type {HGWeb~SocketFunction}
   * @param {object} userData The current user's session data.
   * @param {socketIo~Socket} socket The socket connection to reply on.
   * @param {number|string} gId The guild id to look at.
   * @param {number|string} mId The member id to exclude.
   * @param {HGWeb~basicCB} [cb] Callback that fires once the requested action
   * is complete, or has failed.
   */
  this.excludeMember = function excludeMember(userData, socket, gId, mId, cb) {
    if (!checkPerm(userData, gId, null, 'exclude')) {
      if (!checkMyGuild(gId)) return;
      if (typeof cb === 'function') cb('NO_PERM');
      replyNoPerm(socket, 'excludeMember');
      return;
    }
    if (mId === 'everyone' || mId === 'online' || mId == 'offline' ||
        mId == 'dnd' || mId == 'idle') {
      hg().excludeUsers(mId, gId, (res) => {
        if (typeof cb === 'function') cb(res);
      });
    } else {
      hg().excludeUsers([mId], gId, (res) => {
        if (typeof cb === 'function') cb(res);
      });
    }
  };
  /**
   * Include a member in the Games.
   *
   * @see {@link HungryGames.includeUsers}
   *
   * @public
   * @type {HGWeb~SocketFunction}
   * @param {object} userData The current user's session data.
   * @param {socketIo~Socket} socket The socket connection to reply on.
   * @param {number|string} gId The guild id to look at.
   * @param {number|string} mId The member id to include.
   * @param {HGWeb~basicCB} [cb] Callback that fires once the requested action
   * is complete, or has failed.
   */
  this.includeMember = function includeMember(userData, socket, gId, mId, cb) {
    if (!checkPerm(userData, gId, null, 'include')) {
      if (!checkMyGuild(gId)) return;
      if (typeof cb === 'function') cb('NO_PERM');
      replyNoPerm(socket, 'includeMember');
      return;
    }
    if (mId === 'everyone' || mId === 'online' || mId == 'offline' ||
        mId == 'dnd' || mId == 'idle') {
      hg().includeUsers(mId, gId, (res) => {
        if (typeof cb === 'function') cb(res);
      });
    } else {
      hg().includeUsers([mId], gId, (res) => {
        if (typeof cb === 'function') cb(res);
      });
    }
  };
  /**
   * Toggle an option in the Games.
   *
   * @see {@link HungryGames.setOption}
   *
   * @public
   * @type {HGWeb~SocketFunction}
   * @param {object} userData The current user's session data.
   * @param {socketIo~Socket} socket The socket connection to reply on.
   * @param {number|string} gId The guild id to look at.
   * @param {string} option The option to change.
   * @param {string|number} value The value to set option to.
   * @param {string} extra The extra text if the option is in an object.
   * @param {HGWeb~basicCB} [cb] Callback that fires once the requested action
   * is complete, or has failed.
   */
  this.toggleOption = function toggleOption(
      userData, socket, gId, option, value, extra, cb) {
    if (!checkPerm(userData, gId, null, 'option')) {
      if (!checkMyGuild(gId)) return;
      if (typeof cb === 'function') cb('NO_PERM');
      replyNoPerm(socket, 'toggleOption');
      return;
    }
    hg().getHG().fetchGame(gId, (game) => {
      const response = hg().setOption(gId, option, value, extra || undefined);
      if (typeof cb === 'function') {
        cb(null, response);
      } else if (!game) {
        socket.emit('message', response);
      }
    });
  };
  /**
   * Create a Game.
   *
   * @see {@link HungryGames.createGame}
   *
   * @public
   * @type {HGWeb~SocketFunction}
   * @param {object} userData The current user's session data.
   * @param {socketIo~Socket} socket The socket connection to reply on.
   * @param {number|string} gId The guild id to look at.
   * @param {HGWeb~basicCB} [cb] Callback that fires once the requested action
   * is complete, or has failed.
   */
  this.createGame = function createGame(userData, socket, gId, cb) {
    if (!checkPerm(userData, gId, null, 'create')) {
      if (!checkMyGuild(gId)) return;
      if (typeof cb === 'function') cb('NO_PERM');
      replyNoPerm(socket, 'createGame');
      return;
    }
    hg().createGame(gId, (game) => {
      if (typeof cb === 'function') cb(game ? null : 'ATTEMPT_FAILED');
    });
  };
  /**
   * Reset game data.
   *
   * @see {@link HungryGames.resetGame}
   *
   * @public
   * @type {HGWeb~SocketFunction}
   * @param {object} userData The current user's session data.
   * @param {socketIo~Socket} socket The socket connection to reply on.
   * @param {number|string} gId The guild id to look at.
   * @param {string} cmd Command specifying what data to delete.
   * @param {HGWeb~basicCB} [cb] Callback that fires once the requested action
   * is complete, or has failed.
   */
  this.resetGame = function resetGame(userData, socket, gId, cmd, cb) {
    if (!checkPerm(userData, gId, null, 'reset')) {
      if (!checkMyGuild(gId)) return;
      if (typeof cb === 'function') cb('NO_PERM');
      replyNoPerm(socket, 'resetGame');
      return;
    }
    const response = hg().getHG().resetGame(gId, cmd);
    if (typeof cb === 'function') cb(null, response);
  };
  /**
   * Start the game.
   *
   * @see {@link HungryGames.startGame}
   *
   * @public
   * @type {HGWeb~SocketFunction}
   * @param {object} userData The current user's session data.
   * @param {socketIo~Socket} socket The socket connection to reply on.
   * @param {number|string} gId The guild id to look at.
   * @param {number|string} cId Channel to start the game in.
   * @param {HGWeb~basicCB} [cb] Callback that fires once the requested action
   * is complete, or has failed.
   */
  this.startGame = function startGame(userData, socket, gId, cId, cb) {
    if (!checkChannelPerm(userData, gId, cId, 'start')) {
      if (!checkMyGuild(gId)) return;
      if (typeof cb === 'function') cb('NO_PERM');
      replyNoPerm(socket, 'startGame');
      return;
    }
    hg().startGame(userData.id, gId, cId);
    if (typeof cb === 'function') cb(null);
  };
  /**
   * Enable autoplay.
   *
   * @see {@link HungryGames.startAutoplay}
   *
   * @public
   * @type {HGWeb~SocketFunction}
   * @param {object} userData The current user's session data.
   * @param {socketIo~Socket} socket The socket connection to reply on.
   * @param {number|string} gId The guild id to look at.
   * @param {number|string} cId Channel to send the messages in.
   * @param {HGWeb~basicCB} [cb] Callback that fires once the requested action
   * is complete, or has failed.
   */
  this.startAutoplay = function startAutoplay(userData, socket, gId, cId, cb) {
    if (!checkChannelPerm(userData, gId, cId, 'autoplay')) {
      if (!checkMyGuild(gId)) return;
      if (typeof cb === 'function') cb('NO_PERM');
      replyNoPerm(socket, 'startAutoplay');
      return;
    }
    hg().startAutoplay(userData.id, gId, cId);
    if (typeof cb === 'function') cb(null);
  };
  /**
   * Start the next day.
   *
   * @see {@link HungryGames.nextDay}
   *
   * @public
   * @type {HGWeb~SocketFunction}
   * @param {object} userData The current user's session data.
   * @param {socketIo~Socket} socket The socket connection to reply on.
   * @param {number|string} gId The guild id to look at.
   * @param {number|string} cId Channel to send the messages in.
   * @param {HGWeb~basicCB} [cb] Callback that fires once the requested action
   * is complete, or has failed.
   */
  this.nextDay = function nextDay(userData, socket, gId, cId, cb) {
    if (!checkChannelPerm(userData, gId, cId, 'next')) {
      if (!checkMyGuild(gId)) return;
      if (typeof cb === 'function') cb('NO_PERM');
      replyNoPerm(socket, 'nextDay');
      return;
    }
    hg().nextDay(userData.id, gId, cId);
    if (typeof cb === 'function') cb(null);
  };
  /**
   * End the game.
   *
   * @see {@link HungryGames.endGame}
   *
   * @public
   * @type {HGWeb~SocketFunction}
   * @param {object} userData The current user's session data.
   * @param {socketIo~Socket} socket The socket connection to reply on.
   * @param {number|string} gId The guild id to look at.
   * @param {HGWeb~basicCB} [cb] Callback that fires once the requested action
   * is complete, or has failed.
   */
  this.endGame = function endGame(userData, socket, gId, cb) {
    if (!checkPerm(userData, gId, null, 'end')) {
      if (!checkMyGuild(gId)) return;
      if (typeof cb === 'function') cb('NO_PERM');
      replyNoPerm(socket, 'endGame');
      return;
    }
    hg().endGame(userData.id, gId);
    const game = hg().getHG().getGame(gId);
    if (typeof cb === 'function') {
      cb(null, game && game.serializable);
    } else {
      socket.emit('game', gId, game && game.serializable);
    }
  };
  /**
   * Disable autoplay.
   *
   * @see {@link HungryGames.pauseAutoplay}
   *
   * @public
   * @type {HGWeb~SocketFunction}
   * @param {object} userData The current user's session data.
   * @param {socketIo~Socket} socket The socket connection to reply on.
   * @param {number|string} gId The guild id to look at.
   * @param {HGWeb~basicCB} [cb] Callback that fires once the requested action
   * is complete, or has failed.
   */
  this.pauseAutoplay = function pauseAutoplay(userData, socket, gId, cb) {
    if (!checkPerm(userData, gId, null, 'autoplay')) {
      if (!checkMyGuild(gId)) return;
      if (typeof cb === 'function') cb('NO_PERM');
      replyNoPerm(socket, 'pauseAutoplay');
      return;
    }
    hg().pauseAutoplay(userData.id, gId);
    const game = hg().getHG().getGame(gId);
    if (typeof cb === 'function') {
      cb(null, game && game.serializable);
    } else {
      socket.emit('game', gId, game && game.serializable);
    }
  };
  /**
   * Pause game.
   *
   * @see {@link HungryGames.pauseGame}
   *
   * @public
   * @type {HGWeb~SocketFunction}
   * @param {object} userData The current user's session data.
   * @param {socketIo~Socket} socket The socket connection to reply on.
   * @param {number|string} gId The guild id to look at.
   * @param {HGWeb~basicCB} [cb] Callback that fires once the requested action
   * is complete, or has failed.
   */
  this.pauseGame = function pauseGame(userData, socket, gId, cb) {
    if (!checkPerm(userData, gId, null, 'pause')) {
      if (!checkMyGuild(gId)) return;
      if (typeof cb === 'function') cb('NO_PERM');
      replyNoPerm(socket, 'pauseGame');
      return;
    }
    const error = hg().pauseGame(gId);
    const game = hg().getHG().getGame(gId);
    if (typeof cb === 'function') {
      if (error !== 'Success') {
        cb(error);
      } else {
        cb(null, game && game.serializable);
      }
    } else {
      if (error !== 'Success') {
        socket.emit('message', error);
      } else {
        socket.emit('game', gId, game && game.serializable);
      }
    }
  };
  /**
   * Edit the teams.
   *
   * @see {@link HungryGames.editTeam}
   *
   * @public
   * @type {HGWeb~SocketFunction}
   * @param {object} userData The current user's session data.
   * @param {socketIo~Socket} socket The socket connection to reply on.
   * @param {number|string} gId The guild id to look at.
   * @param {string} cmd The command to run.
   * @param {string} one The first argument.
   * @param {string} two The second argument.
   * @param {HGWeb~basicCB} [cb] Callback that fires once the requested action
   * is complete, or has failed.
   */
  this.editTeam = function editTeam(userData, socket, gId, cmd, one, two, cb) {
    if (!checkPerm(userData, gId, null, 'team')) {
      if (!checkMyGuild(gId)) return;
      replyNoPerm(socket, 'editTeam');
      return;
    }
    const message = hg().editTeam(userData.id, gId, cmd, one, two);
    if (typeof cb === 'function') {
      cb(null, message);
    } else {
      if (message) socket.emit('message', message);
    }
  };
  /**
   * Create a game event.
   *
   * @see {@link HungryGames~createEvent}
   * @see {@link HungryGames~EventContainer~fetch}
   *
   * @public
   * @type {HGWeb~SocketFunction}
   * @param {object} userData The current user's session data.
   * @param {socketIo~Socket} socket The socket connection to reply on.
   * @param {HungryGames~Event} evt The event data of the event to create.
   * @param {HGWeb~basicCB} [cb] Callback that fires once the requested action
   * is complete, or has failed.
   */
  this.createEvent = function createEvent(userData, socket, evt, cb) {
    if (!userData) return;
    if (typeof cb !== 'function') cb = function() {};
    evt.creator = userData.id;
    evt.id = null;
    if (evt.type === 'normal') {
      const err = HungryGames.NormalEvent.validate(evt);
      if (err) {
        cb(err);
        return;
      }
      evt = HungryGames.NormalEvent.from(evt);
    } else if (evt.type === 'arena') {
      if (Array.isArray(evt.outcomes)) {
        evt.outcomes.forEach((el, i) => {
          el.creator = userData.id;
          evt.outcomes[i] = HungryGames.NormalEvent.from(el);
        });
      }
      const err = HungryGames.ArenaEvent.validate(evt);
      if (err) {
        cb(err);
        return;
      }
      evt = HungryGames.ArenaEvent.from(evt);
    } else if (evt.type === 'weapon') {
      if (Array.isArray(evt.outcomes)) {
        evt.outcomes.forEach((el, i) => {
          el.creator = userData.id;
          evt.outcomes[i] = HungryGames.NormalEvent.from(el);
        });
      }
      evt.message = 'Weapon Message';
      const err = HungryGames.WeaponEvent.validate(evt);
      if (err) {
        cb(err);
        return;
      }
      evt = HungryGames.WeaponEvent.from(evt);
    } else {
      cb('BAD_TYPE');
      return;
    }

    const eId = hg().getHG().createEvent(evt, (err) => {
      if (err) {
        if (typeof cb === 'function') {
          cb('ATTEMPT_FAILED', err);
        } else {
          socket.emit('message', 'Failed to create event: ' + err);
        }
      } else {
        cb(null, eId);
      }
    });
  };

  /**
   * @description Add an existing event to a guild's custom events.
   * @public
   * @see {@link HungryGames~EventContainer~fetch}
   * @type {HGWeb~SocketFunction}
   * @param {object} userData The current user's session data.
   * @param {socketIo~Socket} socket The socket connection to reply on.
   * @param {string} gId The guild ID of the guild to modify.
   * @param {string} type The event category to add the event to.
   * @param {string} eId The event ID to add.
   * @param {HGWeb~basicCB} [cb] Callback that fires once the requested action
   * is complete, or has failed.
   */
  this.addEvent = function addEvent(userData, socket, gId, type, eId, cb) {
    if (!checkPerm(userData, gId, null, 'event')) {
      if (!checkMyGuild(gId)) return;
      if (typeof cb === 'function') cb('NO_PERM');
      replyNoPerm(socket, this.name);
      return;
    }
    if (typeof cb !== 'function') cb = function() {};

    if (!type) {
      cb('BAD_TYPE');
      return;
    }

    hg().getHG().fetchGame(gId, (game) => {
      if (!game) {
        cb('NO_GAME');
        return;
      }
      game.customEventStore.fetch(eId, type, (err) => {
        if (err) {
          cb('ATTEMPT_FAILED', err);
        } else {
          cb(null);
          if (type) guildBroadcast(gId, 'eventAdded', type, eId);
        }
      });
    });
  };

  /**
   * @description Remove an event from a guild's custom events.
   * @public
   * @see {@link HungryGames~EventContainer~remove}
   * @type {HGWeb~SocketFunction}
   * @param {object} userData The current user's session data.
   * @param {socketIo~Socket} socket The socket connection to reply on.
   * @param {string} gId The guild ID of the guild to modify.
   * @param {string} type The event category to remove the event from.
   * @param {string} eId The event ID to remove.
   * @param {HGWeb~basicCB} [cb] Callback that fires once the requested action
   * is complete, or has failed.
   */
  this.removeEvent = function removeEvent(
      userData, socket, gId, type, eId, cb) {
    if (!checkPerm(userData, gId, null, 'event')) {
      if (!checkMyGuild(gId)) return;
      if (typeof cb === 'function') cb('NO_PERM');
      replyNoPerm(socket, this.name);
      return;
    }
    if (typeof cb !== 'function') cb = function() {};

    hg().getHG().fetchGame(gId, (game) => {
      if (!game) {
        cb('NO_GAME');
        return;
      }
      if (game.customEventStore.remove(eId, type)) {
        cb(null);
        if (type) guildBroadcast(gId, 'eventRemoved', type, eId);
      } else {
        cb('ATTEMPT_FAILED');
      }
    });
  };

  /**
   * Delete a game event.
   *
   * @see {@link HungryGames.deleteEvent}
   *
   * @public
   * @type {HGWeb~SocketFunction}
   * @param {object} userData The current user's session data.
   * @param {socketIo~Socket} socket The socket connection to reply on.
   * @param {string} eId The event ID to delete.
   * @param {HGWeb~basicCB} [cb] Callback that fires once the requested action
   * is complete, or has failed.
   */
  this.deleteEvent = function deleteEvent(userData, socket, eId, cb) {
    if (!userData) return;
    hg().getHG().deleteEvent(userData.id, eId, (err) => {
      if (typeof cb !== 'function') return;
      if (err) {
        cb('ATTEMPT_FAILED', err);
      } else {
        cb(null);
      }
    });
  };

  /**
   * @description Enable or disable an event without deleting it.
   * @see {@link HungryGames.toggleEvent}
   *
   * @public
   * @type {HGWeb~SocketFunction}
   * @param {object} userData The current user's session data.
   * @param {socketIo-Socket} socket The socket connection to reply on.
   * @param {number|string} gId The guild id to run this command on.
   * @param {string} type The type of event that we are toggling.
   * @param {string} event The ID of the event to toggle.
   * @param {?boolean} value Set the enabled value instead of toggling.
   * @param {HGWeb~basicCB} [cb] Callback that fires once the requested action
   * is complete.
   */
  this.toggleEvent = function toggleEvent(
      userData, socket, gId, type, event, value, cb) {
    if (!checkPerm(userData, gId, null, 'event')) {
      if (!checkMyGuild(gId)) return;
      if (typeof cb === 'function') cb('NO_PERM');
      replyNoPerm(socket, 'removeEvent');
      return;
    }
    if (typeof cb !== 'function') cb = function() {};
    const err = hg().toggleEvent(gId, type, event, value);
    if (err) {
      cb('ATTEMPT_FAILED', err);
    } else {
      cb(null);
    }
  };
  /**
   * Replace a custom event with new data.
   *
   * @see {@link HungryGames~replaceEvent}
   *
   * @public
   * @type {HGWeb~SocketFunction}
   * @param {object} userData The current user's session data.
   * @param {socketIo~Socket} socket The socket connection to reply on.
   * @param {HungryGames~Event} evt The event data to update the event to.
   * @param {HGWeb~basicCB} [cb] Callback that fires once the requested action
   * is complete, or has failed.
   */
  this.replaceEvent = function replaceEvent(userData, socket, evt, cb) {
    if (!userData) return;
    if (typeof cb !== 'function') cb = function() {};
    evt.creator = userData.id;
    if (evt.type === 'normal') {
      const err = HungryGames.NormalEvent.validate(evt);
      if (err) {
        cb(err);
        return;
      }
      evt = HungryGames.NormalEvent.from(evt);
    } else if (evt.type === 'arena') {
      const err = HungryGames.ArenaEvent.validate(evt);
      if (err) {
        cb(err);
        return;
      }
      evt = HungryGames.ArenaEvent.from(evt);
    } else if (evt.type === 'weapon') {
      const err = HungryGames.WeaponEvent.validate(evt);
      if (err) {
        cb(err);
        return;
      }
      evt = HungryGames.WeaponEvent.from(evt);
    } else {
      cb('BAD_TYPE');
      return;
    }

    hg().getHG().replaceEvent(userData.id, evt, (err) => {
      if (err) {
        if (typeof cb === 'function') {
          cb('ATTEMPT_FAILED', err);
        } else {
          socket.emit('message', 'Failed to create event: ' + err);
        }
      } else {
        cb(null);
      }
    });
  };

  /**
   * Fetch a single event data.
   *
   * @see {@link HungryGames~EventContainer~fetch}
   *
   * @public
   * @type {HGWeb~SocketFunction}
   * @param {object} userData The current user's session data.
   * @param {socketIo-Socket} socket The socket connection to reply on.
   * @param {string} eId The event ID to fetch.
   * @param {HGWeb~basicCB} [cb] Callback that fires once the requested action
   * is complete.
   */
  this.fetchEvent = function fetchEvent(userData, socket, eId, cb) {
    if (!userData) return;
    hg().getDefaultEvents().fetch(eId, null, (err, evt) => {
      if (err) {
        cb('ATTEMPT_FAILED', err);
      } else {
        cb(null, evt);
      }
    });
  };

  /**
   * Fetch list of IDs of all events the user has created.
   *
   * @see {@link HungryGames~fetchUserEvents}
   *
   * @public
   * @type {HGWeb~SocketFunction}
   * @param {object} userData The current user's session data.
   * @param {socketIo-Socket} socket The socket connection to reply on.
   * @param {HGWeb~basicCB} [cb] Callback that fires once the requested action
   * is complete.
   */
  this.fetchUserEvents = function fetchUserEvents(userData, socket, cb) {
    if (!userData) return;
    hg().getHG().fetchUserEvents(userData.id, cb);
  };

  /**
   * Claim legacy events to the user.
   *
   * @see {@link HungryGames~claimLegacy}
   *
   * @public
   * @type {HGWeb~SocketFunction}
   * @param {object} userData The current user's session data.
   * @param {socketIo-Socket} socket The socket connection to reply on.
   * @param {string} gId The guild id to look at.
   * @param {HGWeb~basicCB} [cb] Callback that fires once the requested action
   * is complete.
   */
  this.claimLegacyEvents = function claimLegacyEvents(
      userData, socket, gId, cb) {
    if (!checkPerm(userData, gId, null, 'claimlegacy')) {
      if (!checkMyGuild(gId)) return;
      if (typeof cb === 'function') cb('NO_PERM');
      replyNoPerm(socket, this.name);
      return;
    }
    hg().getHG().fetchGame(gId, (game) => {
      if (typeof cb !== 'function') cb = function() {};
      if (!game) {
        cb('NO_GAME');
      } else {
        hg().claimLegacy(game, userData.id, cb);
      }
    });
  };

  /**
   * Force a player in the game to end a day in a certain state.
   *
   * @see {@link HungryGames.forcePlayerState}
   *
   * @public
   * @type {HGWeb~SocketFunction}
   * @param {object} userData The current user's session data.
   * @param {socketIo-Socket} socket The socket connection to reply on.
   * @param {number|string} gId The guild id to run this command on.
   * @param {string[]} list The list of user IDs of the players to effect.
   * @param {string} state The forced state.
   * @param {string} [text] The message to show in the games as a result of this
   * command.
   * @param {boolean} [persists] Will this state be forced until the game ends.
   * @param {HGWeb~basicCB} [cb] Callback that fires once the requested action
   * is complete.
   */
  this.forcePlayerState = function forcePlayerState(
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
      replyNoPerm(socket, 'forcePlayerState');
      return;
    }
    const game = hg().getHG().getGame(gId);
    if (!game) return;
    if (typeof text != 'string') text = hg().getHG()._defaultPlayerEvents;
    const response = HungryGames.GuildGame.forcePlayerState(
        game, list, state, hg().getHG().messages, text, persists);
    if (typeof cb === 'function') {
      cb(null, response, game.serializable);
    } else {
      socket.emit('message', response);
    }
  };

  /**
   * Rename the guild's game.
   *
   * @see {@link HungryGames.renameGame}
   *
   * @public
   * @type {HGWeb~SocketFunction}
   * @param {object} userData The current user's session data.
   * @param {socketIo-Socket} socket The socket connection to reply on.
   * @param {number|string} gId The guild id to run this command on.
   * @param {string} name The name to change the game to.
   * @param {HGWeb~basicCB} [cb] Callback that fires once the requested action
   * is complete.
   */
  this.renameGame = function renameGame(userData, socket, gId, name, cb) {
    if (!checkPerm(userData, gId, null, 'rename')) {
      if (!checkMyGuild(gId)) return;
      if (typeof cb === 'function') cb('NO_PERM');
      replyNoPerm(socket, 'renameGame');
      return;
    }
    hg().renameGame(gId, name);
    if (typeof cb === 'function') {
      let name = null;
      let game = hg().getHG().getGame(gId);
      if (game) game = game.currentGame;
      if (game) name = game.name;
      cb(name);
    }
  };

  /**
   * Remove an NPC from a game.
   *
   * @see {@link HungryGames.removeNPC}
   *
   * @public
   * @type {HGWeb~SocketFunction}
   * @param {object} userData The current user's session data.
   * @param {socketIo-Socket} socket The socket connection to reply on.
   * @param {number|string} gId The guild id to run this command on.
   * @param {string} npcId The ID of the NPC to remove.
   * @param {HGWeb~basicCB} [cb] Callback that fires once the requested action
   * is complete.
   */
  this.removeNPC = function removeNPC(userData, socket, gId, npcId, cb) {
    if (!checkPerm(userData, gId, null, 'ai remove')) {
      if (!checkMyGuild(gId)) return;
      if (typeof cb === 'function') cb('NO_PERM');
      replyNoPerm(socket, 'removeNPC');
      return;
    }
    const error = hg().removeNPC(gId, npcId);
    if (typeof cb === 'function') {
      cb(typeof error === 'string' ? error : null);
    }
  };

  /**
   * Respond with list of stat groups for the requested guild.
   *
   * @public
   * @type {HGWeb~SocketFunction}
   * @param {object} userData The current user's session data.
   * @param {socketIo~Socket} socket The socket connection to reply on.
   * @param {number|string} gId The guild id to look at.
   * @param {HGWeb~basicCB} [cb] Callback that fires once the requested action
   * is complete, or has failed.
   */
  this.fetchStatGroupList = function fetchStatGroupList(
      userData, socket, gId, cb) {
    if (!checkPerm(userData, gId, null, 'groups')) {
      if (!checkMyGuild(gId)) return;
      if (typeof cb === 'function') cb('NO_PERM');
      replyNoPerm(socket, 'fetchStatGroupList');
      return;
    }
    const game = hg().getHG().getGame(gId);
    if (!game) {
      if (typeof cb === 'function') cb('NO_GAME_IN_GUILD');
      return;
    }
    game._stats.fetchGroupList((err, list) => {
      if (err) {
        if (err.code === 'ENOENT') {
          list = [];
        } else {
          self.error('Failed to get list of stat groups.');
          console.error(err);
          if (typeof cb === 'function') cb('ATTEMPT_FAILED');
          return;
        }
      }
      if (typeof cb === 'function') {
        cb(null, list);
      } else {
        socket.emit('statGroupList', gId, list);
      }
    });
  };

  /**
   * Respond with metadata for the requested stat group.
   *
   * @public
   * @type {HGWeb~SocketFunction}
   * @param {object} userData The current user's session data.
   * @param {socketIo~Socket} socket The socket connection to reply on.
   * @param {number|string} guildId The guild id to look at.
   * @param {string} groupId The ID of the group.
   * @param {HGWeb~basicCB} [cb] Callback that fires once the requested action
   * is complete, or has failed.
   */
  this.fetchStatGroupMetadata = function fetchStatGroupMetadata(
      userData, socket, guildId, groupId, cb) {
    if (!checkPerm(userData, guildId, null, 'groups')) {
      if (!checkMyGuild(guildId)) return;
      if (typeof cb === 'function') cb('NO_PERM');
      replyNoPerm(socket, 'fetchStatGroupMetadata');
      return;
    }
    const game = hg().getHG().getGame(guildId);
    if (!game) {
      if (typeof cb === 'function') cb('NO_GAME_IN_GUILD');
      return;
    }
    game._stats.fetchGroup(groupId, (err, group) => {
      if (err) {
        if (typeof cb === 'function') cb('BAD_GROUP');
        return;
      }
      group.fetchMetadata((err, meta) => {
        if (err) {
          self.error(
              'Failed to fetch metadata for stat group: ' + guildId + '/' +
              group.id);
          console.error(err);
          if (typeof cb === 'function') cb('ATTEMPT_FAILED');
          return;
        }
        if (typeof cb === 'function') {
          cb(null, meta);
        } else {
          socket.emit('statGroupMetadata', guildId, groupId, meta);
        }
      });
    });
  };

  /**
   * Respond with stats for a specific user in a group.
   *
   * @public
   * @type {HGWeb~SocketFunction}
   * @param {object} userData The current user's session data.
   * @param {socketIo~Socket} socket The socket connection to reply on.
   * @param {number|string} guildId The guild id to look at.
   * @param {string} groupId The ID of the group.
   * @param {string} userId The ID of the user.
   * @param {HGWeb~basicCB} [cb] Callback that fires once the requested action
   * is complete, or has failed.
   */
  this.fetchStats = function fetchStats(
      userData, socket, guildId, groupId, userId, cb) {
    if (!checkPerm(userData, guildId, null, 'stats')) {
      if (!checkMyGuild(guildId)) return;
      if (typeof cb === 'function') cb('NO_PERM');
      replyNoPerm(socket, 'fetchStats');
      return;
    }
    const game = hg().getHG().getGame(guildId);
    if (!game) {
      if (typeof cb === 'function') cb('NO_GAME_IN_GUILD');
      return;
    }
    game._stats.fetchGroup(groupId, (err, group) => {
      if (err) {
        if (typeof cb === 'function') cb('BAD_GROUP');
        return;
      }
      group.fetchUser(userId, (err, data) => {
        if (err) {
          self.error(
              'Failed to fetch user stats: ' + guildId + '@' + userId + '/' +
              group.id);
          console.error(err);
          if (typeof cb === 'function') cb('ATTEMPT_FAILED');
          return;
        }
        if (typeof cb === 'function') {
          cb(null, data.serializable);
        } else {
          socket.emit('userStats', guildId, groupId, userId, data.serializable);
        }
      });
    });
  };

  /**
   * Respond with leaderboard information.
   *
   * @public
   * @type {HGWeb~SocketFunction}
   * @param {object} userData The current user's session data.
   * @param {socketIo~Socket} socket The socket connection to reply on.
   * @param {number|string} guildId The guild id to look at.
   * @param {string} groupId The ID of the group.
   * @param {HGStatGroupUserSelectOptions} opt Data select options.
   * @param {HGWeb~basicCB} [cb] Callback that fires once the requested action
   * is complete, or has failed.
   */
  this.fetchLeaderboard = function fetchLeaderboard(
      userData, socket, guildId, groupId, opt, cb) {
    if (!checkPerm(userData, guildId, null, 'stats')) {
      if (!checkMyGuild(guildId)) return;
      if (typeof cb === 'function') cb('NO_PERM');
      replyNoPerm(socket, 'fetchLeaderboard');
      return;
    }
    const game = hg().getHG().getGame(guildId);
    if (!game) {
      if (typeof cb === 'function') cb('NO_GAME_IN_GUILD');
      return;
    }
    game._stats.fetchGroup(groupId, (err, group) => {
      if (err) {
        if (typeof cb === 'function') cb('BAD_GROUP');
        return;
      }
      group.fetchUsers(opt, (err, rows) => {
        if (err) {
          self.error(
              'Failed to fetch leaderboard: ' + guildId + '/' + group.id);
          console.error(err);
          if (typeof cb === 'function') cb('ATTEMPT_FAILED');
          return;
        }
        const serializable = rows.map((el) => {
          const out = {id: el.id};
          Object.assign(out, el.serializable);
          return out;
        });
        if (typeof cb === 'function') {
          cb(null, serializable);
        } else {
          socket.emit('userStats', guildId, groupId, opt, serializable);
        }
      });
    });
  };
  /**
   * Give or take weapons from a player.
   *
   * @public
   * @type {HGWeb~SocketFunction}
   * @param {object} userData The current user's session data.
   * @param {socketIo~Socket} socket The socket connection to reply on.
   * @param {number|string} gId The guild id to look at.
   * @param {string} uId The ID of the user to give or take weapon from.
   * @param {string} weapon The ID of the weapon to give or take.
   * @param {number} count Number of weapons to give or take. Positive is give,
   * negative is take.
   * @param {HGWeb~basicCB} [cb] Callback that fires once the requested action
   * is complete, or has failed.
   */
  this.modifyInventory = function modifyInventory(
      userData, socket, gId, uId, weapon, count, cb) {
    if (!checkPerm(userData, gId, null, 'give') ||
        !checkPerm(userData, gId, null, 'take')) {
      if (!checkMyGuild(gId)) return;
      if (typeof cb === 'function') cb('NO_PERM');
      replyNoPerm(socket, 'modifyInventory');
      return;
    }
    const game = hg().getHG().getGame(gId);
    if (!game) {
      if (typeof cb === 'function') cb('NO_GAME_IN_GUILD');
      return;
    }
    const response = game.modifyPlayerWeapon(uId, weapon, hg().getHG(), count);
    if (typeof cb === 'function') {
      cb(null, response, game.serializable);
    } else {
      socket.emit('message', response);
    }
  };
  /**
   * Set the currently selected stat group.
   *
   * @public
   * @type {HGWeb~SocketFunction}
   * @param {object} userData The current user's session data.
   * @param {socketIo~Socket} socket The socket connection to reply on.
   * @param {string} guildId The guild id to look at.
   * @param {?string} groupId The ID of the group to select, or null to set
   * none.
   * @param {HGWeb~basicCB} [cb] Callback that fires once the requested action
   * is complete, or has failed.
   */
  this.selectStatGroup = function selectStatGroup(
      userData, socket, guildId, groupId, cb) {
    if (!checkPerm(userData, guildId, null, 'group select')) {
      if (!checkMyGuild(guildId)) return;
      if (typeof cb === 'function') cb('NO_PERM');
      replyNoPerm(socket, 'selectStatGroup');
      return;
    }
    const game = hg().getHG().getGame(guildId);
    if (!game) {
      if (typeof cb === 'function') cb('NO_GAME_IN_GUILD');
      return;
    }
    if (!groupId || groupId.length == 0) {
      game.statGroup = null;
      if (typeof cb === 'function') cb(null);
      return;
    } else if (typeof groupId !== 'string') {
      cb('BAD_GROUP');
      return;
    }

    game._stats.fetchGroup(groupId, (err, group) => {
      if (err) {
        cb('BAD_GROUP');
        return;
      }
      game.statGroup = group.id;
      if (typeof cb === 'function') cb(null);
    });
  };
  /**
   * Create a stat group.
   *
   * @public
   * @type {HGWeb~SocketFunction}
   * @param {object} userData The current user's session data.
   * @param {socketIo~Socket} socket The socket connection to reply on.
   * @param {string} guildId The guild id to look at.
   * @param {?string} name The name of the new group.
   * @param {HGWeb~basicCB} [cb] Callback that fires once the requested action
   * is complete, or has failed.
   */
  this.createStatGroup = function createStatGroup(
      userData, socket, guildId, name, cb) {
    if (!checkPerm(userData, guildId, null, 'group create')) {
      if (!checkMyGuild(guildId)) return;
      if (typeof cb === 'function') cb('NO_PERM');
      replyNoPerm(socket, 'createStatGroup');
      return;
    }
    const game = hg().getHG().getGame(guildId);
    if (!game) {
      if (typeof cb === 'function') cb('NO_GAME_IN_GUILD');
      return;
    }
    if (name && typeof name === 'string') {
      if (name.length === 0 || name.length > 24) {
        cb('BAD_NAME');
        return;
      }
    } else if (name) {
      cb('BAD_NAME');
      return;
    }

    game._stats.createGroup({name: name}, (group) => {
      group.fetchMetadata((err, meta) => {
        if (err) {
          cb('ATTEMPT_FAILED');
          return;
        }
        if (typeof cb === 'function') cb(null, group.id, meta);
      });
    });
  };
  /**
   * Delete a stat group.
   *
   * @public
   * @type {HGWeb~SocketFunction}
   * @param {object} userData The current user's session data.
   * @param {socketIo~Socket} socket The socket connection to reply on.
   * @param {string} guildId The guild id to look at.
   * @param {string} groupId The group id to delete.
   * @param {HGWeb~basicCB} [cb] Callback that fires once the requested action
   * is complete, or has failed.
   */
  this.deleteStatGroup = function deleteStatGroup(
      userData, socket, guildId, groupId, cb) {
    if (!checkPerm(userData, guildId, null, 'group delete')) {
      if (!checkMyGuild(guildId)) return;
      if (typeof cb === 'function') cb('NO_PERM');
      replyNoPerm(socket, 'deleteStatGroup');
      return;
    }
    const game = hg().getHG().getGame(guildId);
    if (!game) {
      if (typeof cb === 'function') cb('NO_GAME_IN_GUILD');
      return;
    }

    game._stats.fetchGroup(groupId, (err, group) => {
      if (err) {
        cb('BAD_GROUP');
        return;
      }
      if (game.statGroup === group.id) {
        game.statGroup = null;
      }
      group.reset();
      if (typeof cb === 'function') cb(null);
    });
  };
  /**
   * Handle receiving image data for avatar uploading.
   *
   * @public
   * @type {HGWeb~SocketFunction}
   * @param {object} userData The current user's session data.
   * @param {socketIo~Socket} socket The socket connection to reply on.
   * @param {number|string} gId The guild id to look at.
   * @param {string} iId The image ID that is being uploaded.
   * @param {string} chunkId Id of the chunk being received.
   * @param {?Buffer} chunk Chunk of data received, or null if all data has been
   * sent.
   * @param {Function} [cb] Callback that fires once the requested action is
   * complete, or has failed.
   */
  this.imageChunk = function imageChunk(
      userData, socket, gId, iId, chunkId, chunk, cb) {
    const meta = imageBuffer[iId];
    if (!meta) {
      if (!checkMyGuild(gId)) return;
      if (typeof cb === 'function') cb('NO_PERM');
      replyNoPerm(socket, 'imageChunk');
      return;
    }
    if (meta.uId != userData.id) {
      if (!checkMyGuild(gId)) return;
      if (typeof cb === 'function') cb('NO_PERM');
      replyNoPerm(socket, 'imageChunk');
      return;
    }
    if (meta.type == 'NPC') {
      if (!checkPerm(userData, gId, null, 'ai create')) {
        if (!checkMyGuild(gId)) return;
        if (typeof cb === 'function') cb('NO_PERM');
        replyNoPerm(socket, 'imageChunk');
        cancelImageUpload(iId);
        return;
      }
    } else {
      self.common.logWarning(
          'Unknown image type attempted to be uploaded: ' + meta.type,
          socket.id);
      cancelImageUpload(iId);
    }

    if (chunk) {
      chunk = Buffer.from(chunk);
      meta.receivedBytes += chunk.length;
      if (isNaN(chunkId * 1)) {
        cancelImageUpload(iId);
        if (typeof cb === 'function') cb('Malformed Data');
        return;
      } else if (meta.receivedBytes > hg().maxBytes) {
        cancelImageUpload(iId);
        if (typeof cb === 'function') cb('Data Overflow');
        return;
      }
      meta.buffer[chunkId] = chunk;
      if (typeof cb === 'function') cb(chunkId);
      return;
    }

    if (meta.type == 'NPC') {
      const npcId = hg().NPC.createID();
      const p = hg().NPC.saveAvatar(Buffer.concat(meta.buffer), npcId);
      if (!p) {
        cancelImageUpload(iId);
        if (typeof cb === 'function') cb('Malformed Data');
        return;
      }
      p.then((url) => {
        const error = hg().createNPC(gId, meta.username, url, npcId);
        const game = hg().getHG().getGame(gId);
        cancelImageUpload(iId);
        if (typeof cb === 'function') {
          cb(error, game && game.serializable);
        } else if (error) {
          socket.emit('message', error);
        }
        self.common.logDebug(
            'NPC Created from upload with URL: ' + url, socket.id);
      }).catch(() => {
        cancelImageUpload(iId);
        if (typeof cb === 'function') cb('Malformed Data');
      });
    } else {
      self.common.logWarning(
          'Unknown upload type completed. Data is being deleted. (' +
              meta.type + ')',
          socket.id);
      if (typeof cb === 'function') cb();
      cancelImageUpload(iId);
    }
  };
  /**
   * Handle client requesting to begin image upload.
   *
   * @public
   * @type {HGWeb~SocketFunction}
   * @param {object} userData The current user's session data.
   * @param {socketIo~Socket} socket The socket connection to reply on.
   * @param {number|string} gId The guild id to look at.
   * @param {object} meta Metadata to associate with this upload.
   * @param {HGWeb~basicCB} [cb] Callback that fires once the requested action
   * is complete, or has failed. If succeeded, an upload ID will be passed as
   * the second parameter. Any error will be the first parameter.
   */
  this.imageInfo = function imageInfo(userData, socket, gId, meta, cb) {
    if (!meta || typeof meta.type !== 'string' ||
        isNaN(meta.contentLength * 1)) {
      if (typeof cb === 'function') cb('Malformed Data');
      return;
    }
    if (meta.type === 'NPC') {
      if (meta.contentLength > hg().maxBytes) {
        if (typeof cb === 'function') cb('Excessive Payload');
        return;
      }
      if (typeof meta.username !== 'string') {
        if (typeof cb === 'function') cb('Malformed Data');
        return;
      }
      meta.username = hg().formatUsername(meta.username);
      if (meta.username.length < 2) {
        if (typeof cb === 'function') cb('Malformed Data');
        return;
      }

      if (!checkPerm(userData, gId, null, 'ai create')) {
        if (!checkMyGuild(gId)) return;
        if (typeof cb === 'function') cb('NO_PERM');
        replyNoPerm(socket, 'imageInfo');
        return;
      }

      const buf = beginImageUpload(userData.id);
      buf.username = meta.username;
      buf.type = meta.type;
      if (typeof cb === 'function') cb(null, buf.id);
    } else {
      if (typeof cb === 'function') cb('NO_PERM');
    }
  };
}

module.exports = new HGWeb();
