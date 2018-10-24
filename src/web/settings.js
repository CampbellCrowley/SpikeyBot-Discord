// Copyright 2018 Campbell Crowley. All rights reserved.
// Author: Campbell Crowley (web@campbellcrowley.com)
const http = require('http');
const socketIo = require('socket.io');

require('../subModule.js')(WebSettings);  // Extends the SubModule class.

/**
 * @classdesc Manages changing settings for the bot from a website.
 * @class
 * @augments SubModule
 */
function WebSettings() {
  self = this;

  /** @inheritdoc */
  this.myName = 'WebSettings';

  /** @inheritdoc */
  this.initialize = function() {
    app.listen(self.common.isRelease ? 8020 : 8021);
    setTimeout(updateModuleReferences, 100);
  };
  /** @inheritdoc */
  this.shutdown = function() {
    if (io) io.close();
    if (ioClient) ioClient.close();
    if (app) app.close();
    if (cmdScheduler) {
      cmdScheduler.removeListener('shutdown', handleShutdown);
      cmdScheduler.removeListener('commandRegistered', handleCommandRegistered);
      cmdScheduler.removeListener('commandCancelled', handleCommandCancelled);
    }
  };

  let ioClient;
  let app = http.createServer(handler);
  let io = socketIo(
      app, {path: '/www.spikeybot.com/socket.io/', serveClient: false});

  app.on('error', function(err) {
    if (err.code === 'EADDRINUSE') {
      self.error(
          'Settings failed to bind to port because it is in use. (' + err.port +
          ')');
      startClient();
    } else {
      console.error('Settings failed to bind to port for unknown reason.', err);
    }
  });

  /**
   * Stores the current reference to the CmdScheduling subModule. Null if it
   * doesn't exist.
   *
   * @private
   * @type {?CmdScheduling}
   */
  let cmdScheduler;

  /**
   * Update the references to the aplicable subModules.
   * @private
   */
  function updateModuleReferences() {
    if (!self.initialized) return;
    if (cmdScheduler && cmdScheduler.initialized) return;
    cmdScheduler = self.bot.getSubmodule('./cmdScheduling.js');
    if (!cmdScheduler || !cmdScheduler.initialized) {
      cmdScheduler = null;
      setTimeout(updateModuleReferences, 100);
    } else {
      cmdScheduler.on('shutdown', handleShutdown);
      cmdScheduler.on('commandRegistered', handleCommandRegistered);
      cmdScheduler.on('commandCancelled', handleCommandCancelled);
    }
  }

  /**
   * Handle CmdScheduling shutting down.
   * @private
   * @listens CmdScheduling#shutdown
   */
  function handleShutdown() {
    if (!this.initialized) return;
    setTimeout(updateModuleReferences, 100);
  }
  /**
   * Handle new CmdScheduling.ScheduledCommand being registered.
   * @private
   * @listens CmdScheduling#commandRegistered
   *
   * @param {CmdScheduling.ScheduledCommand} cmd The command that was scheduled.
   * @param {string|number} gId The guild ID of which the command was scheduled
   * in.
   */
  function handleCommandRegistered(cmd, gId) {
    for (let i in sockets) {
      if (sockets[i] && sockets[i].cachedGuilds &&
          sockets[i].cachedGuilds.includes(gId)) {
        sockets[i].emit('commandRegistered', cmd, gId);
      }
    }
  }
  /**
   * Handle a CmdScheduling.ScheduledCommand being canceled.
   * @private
   * @listens CmdScheduling#commandCancelled
   * @param {string} cmdId The ID of the command that was cancelled.
   * @param {string|number} gId the ID of the guild the command was cancelled
   * in.
   */
  function handleCommandCancelled(cmdId, gId) {
    for (let i in sockets) {
      if (sockets[i] && sockets[i].cachedGuilds &&
          sockets[i].cachedGuilds.includes(gId)) {
        sockets[i].emit('commandCancelled', cmdId, gId);
      }
    }
  }

  /**
   * Start a socketio client connection to the primary running server.
   *
   * @private
   */
  function startClient() {
    self.log(
        'Restarting into client mode due to server already bound to port.');
    ioClient = require('socket.io-client')(
        self.common.isRelease ? 'http://localhost:8020' : 'http://localhost:8021',
        {path: '/www.spikeybot.com/socket.io/control/'});
    clientSocketConnection(ioClient);
  }

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
  let siblingSockets = {};

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

    self.common.log(
        'Socket connected Settings (' + Object.keys(sockets).length + '): ' +
            ipName,
        socket.id);
    sockets[socket.id] = socket;

    // @TODO: Replace this authentication with gpg key-pairs;
    socket.on('vaderIAmYourSon', (verification, cb) => {
      if (verification === auth.webSettingsSiblingVerification) {
        siblingSockets[socket.id] = socket;
        cb(auth.webSettingsSiblingVerificationResponse);
      } else {
        self.common.error('Client failed to authenticate as child.', socket.id);
      }
    });

    socket.on('fetchGuilds', (...args) => {
      callSocketFunction(fetchGuilds, args, false);
    });
    socket.on('fetchSettings', (...args) => {
      callSocketFunction(fetchSettings, args);
    });
    socket.on('fetchScheduledCommands', (...args) => {
      callSocketFunction(fetchScheduledCommands, args);
    });

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
      self.common.log(
          'Socket disconnected Settings (' + (Object.keys(sockets).length - 1) +
              '): ' + ipName,
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
      socket.emit(
          'vaderIAmYourSon', auth.webSettingsSiblingVerification, (res) => {
            self.common.log('Sibling authenticated successfully.');
            authenticated = res === auth.webSettingsSiblingVerificationResponse;
          });
    });

    socket.on('fetchGuilds', (userData, id, cb) => {
      fetchGuilds(userData, {id: id}, cb);
    });

    socket.on('forwardedRequest', (userData, sId, func, args, cb) => {
      if (!authenticated) return;
      let fakeSocket = {
        emit: function(...args) {
          if (typeof cb == 'function') cb(args);
        },
        id: sId,
      };
      if (!self[func]) {
        self.common.error(func + ': is not a function.');
      } else {
        self[func].apply(self[func], [userData, fakeSocket].concat(args));
      }
    });
  }

  /**
   * Send a message to the given socket informing the client that the command
   * they attempted failed due to insufficient permission.
   *
   * @private
   * @param {Socket} socket The socket.io socket to reply on.
   * @param {string} cmd THe command the client attempted.
   */
  /* function replyNoPerm(socket, cmd) {
    self.common.log('Attempted ' + cmd + ' without permission.', socket.id);
    socket.emit(
        'message', 'Failed to run command "' + cmd +
            '" because you don\'t have permission for this.');
  }*/

  /**
   * Checks if the current shard is responsible for the requested guild.
   *
   * @private
   * @param {number|string} gId The guild id to check.
   * @return {boolean} True if this shard has this guild.
   */
  /* function checkMyGuild(gId) {
    let g = self.client.guilds.get(gId);
    return (g && true) || false;
  }*/

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
  /* function checkPerm(userData, gId) {
    if (!userData) return false;
    let g = self.client.guilds.get(gId);
    if (!g) return false;
    let member = g.members.get(userData.id);
    if (!member) {
      return false;
    }
    return true;
  }*/
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
  /* function checkChannelPerm(userData, gId, cId) {
    if (!userData) return false;
    let g = self.client.guilds.get(gId);
    if (!g) return false;
    let m = g.members.get(userData.id);
    if (!m) return false;

    let channel = g.channels.get(cId);
    if (!channel) return false;

    let perms = channel.permissionsFor(m);
    if (!perms.has(self.Discord.Permissions.FLAGS.VIEW_CHANNEL)) return false;
    if (!perms.has(self.Discord.Permissions.FLAGS.SEND_MESSAGES)) return false;
    return true;
  }*/

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
      // hgRole: hg.checkMemberForRole(m),
      roles: m.roles
          .filter(() => {
            return true;
          })
          .array(),
      color: m.displayColor,
      guild: {id: m.guild.id},
      user: {
        username: m.user.username,
        tag: m.user.tag,
        discriminator: m.user.discriminator,
        avatarURL: m.user.displayAvatarURL(),
        id: m.user.id,
        bot: m.user.bot,
      },
      joinedTimestamp: m.joinedTimestamp,
    };
  }


  /**
   * Basic callback with single argument. The argument is null if there is no
   * error, or a string if there was an error.
   * @callback WebSettings~basicCB
   *
   * @param {?string} err The error response.
   */

  /**
   * Fetch all relevant data for all mutual guilds with the user and send it to
   * the user.
   *
   * @private
   * @type {WebSettings~SocketFunction}
   * @param {Object} userData The current user's session data.
   * @param {socketIo~Socket} socket The socket connection to reply on.
   * @param {basicCB} [cb] Callback that fires once the requested action is
   * complete, or has failed.
   */
  function fetchGuilds(userData, socket, cb) {
    if (!userData) {
      self.common.error('Fetch Guilds without userData', 'WebSettings');
      if (typeof cb === 'function') cb('Not signed in', null);
      return;
    }

    let done;
    if (typeof cb === 'function') {
      done = cb;
    } else {
      const numReplies = (Object.entries(siblingSockets).length || 0);
      let replied = 0;
      let guildBuffer = {};
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
      let guilds = self.client.guilds
          .filter((obj) => {
            return obj.members.get(userData.id);
          })
          .array();
      let strippedGuilds = guilds.map((g) => {
        let member = g.members.get(userData.id);
        let newG = {};
        newG.iconURL = g.iconURL();
        newG.name = g.name;
        newG.id = g.id;
        newG.ownerId = g.ownerID;
        newG.members = g.members.map((m) => {
          return m.id;
        });
        newG.channels = g.channels
            .filter((c) => {
              return c.permissionsFor(member).has(
                  self.Discord.Permissions.FLAGS.VIEW_CHANNEL);
            })
            .map((c) => {
              return c.id;
            });
        newG.myself = makeMember(member);
        return newG;
      });
      socket.cachedGuilds = strippedGuilds.map((g) => g.id);
      done(strippedGuilds);
    } catch (err) {
      self.error(err);
      // socket.emit('guilds', 'Failed', null);
      done();
    }
  }

  /**
   * Client has requested all settings for all guilds for the connected user.
   *
   * @public
   * @type {WebSettings~SocketFunction}
   * @param {Object} userData The current user's session data.
   * @param {socketIo~Socket} socket The socket connection to reply on.
   * @param {basicCB} [cb] Callback that fires once the requested action is
   * complete and has data, or has failed.
   */
  function fetchSettings(userData, socket, cb) {
    if (typeof cb !== 'function') cb = function() {};
    if (!userData) {
      cb('Not signed in.', null);
      return;
    }
    let guilds = self.client.guilds.filter((obj) => {
      return obj.members.get(userData.id);
    });
    let settings = guilds.map((g) => {
      return g.id;
    });
    cb(settings);
  }
  this.fetchSettings = fetchSettings;

  /**
   * Client has requested all scheduled commands for the connected user.
   *
   * @public
   * @type {WebSettings~SocketFunction}
   * @param {Object} userData The current user's session data.
   * @param {socketIo~Socket} socket The socket connection to reply on.
   * @param {basicCB} [cb] Callback that fires once the requested action is
   * complete and has data, or has failed.
   */
  function fetchScheduledCommands(userData, socket, cb) {
    if (typeof cb !== 'function') cb = function() {};
    if (!userData) {
      cb('Not signed in.', null);
      return;
    }
    let guilds = self.client.guilds.filter((obj) => {
      return obj.members.get(userData.id);
    });
    let sCmds = {};
    updateModuleReferences();
    guilds.forEach((g) => {
      let list = cmdScheduler.getScheduledCommandsInGuild(g.id);
      if (list && list.length > 0) {
        sCmds[g.id] = list.map((el) => {
          return {
            id: el.id,
            channel: el.channel.id,
            cmd: el.cmd,
            message: el.message.id,
            repeatDelay: el.repeatDelay,
            time: el.time,
            member: makeMember(el.message.member),
          };
        });
      }
    });
    cb(sCmds);
  }
  this.fetchScheduledCommands = fetchScheduledCommands;
}
module.exports = new WebSettings();
