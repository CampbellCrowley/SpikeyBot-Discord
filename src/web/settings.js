// Copyright 2018 Campbell Crowley. All rights reserved.
// Author: Campbell Crowley (web@campbellcrowley.com)
const http = require('http');
const auth = require('../../auth.js');
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

    self.command.addEventListener('settingsChanged', handleSettingsChanged);
    self.command.addEventListener('settingsReset', handleSettingsReset);
  };
  /** @inheritdoc */
  this.unloadable = function() {
    return getNumClients() == 0;
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
      self.command.removeEventListener(
          'settingsChanged', handleSettingsChanged);
      self.command.removeEventListener('settingsReset', handleSettingsReset);
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
    let toSend = {
      id: cmd.id,
      channel: cmd.channelId,
      cmd: cmd.cmd,
      repeatDelay: cmd.repeatDelay,
      time: cmd.time,
      member: makeMember(cmd.member),
    };
    for (let i in sockets) {
      if (sockets[i] && sockets[i].cachedGuilds &&
          sockets[i].cachedGuilds.includes(gId)) {
        sockets[i].emit('commandRegistered', toSend, gId);
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
   * Handle Command~CommandSetting value changed.
   * @private
   * @listens Command.events#settingsChanged
   * @see {@link Command~CommandSetting.set}
   *
   * @param {?string} gId the ID of the guild this setting was changed in, or
   * null of not specific to a single guild.
   * @param {string} value
   * @param {string} type
   * @param {string} id
   * @param {string} [id2]
   */
  function handleSettingsChanged(gId, value, type, id, id2) {
    for (let i in sockets) {
      if (sockets[i] && sockets[i].cachedGuilds &&
          (!gId || sockets[i].cachedGuilds.includes(gId))) {
        sockets[i].emit('settingsChanged', gId, value, type, id, id2);
      }
    }
  }

  /**
   * Handle Command~CommandSetting was deleted or reset in a guild.
   * @private
   * @listens Command.events#settingsReset
   *
   * @param {string} gId The ID of the guild in which the settings were reset.
   */
  function handleSettingsReset(gId) {
    for (let i in sockets) {
      if (sockets[i] && sockets[i].cachedGuilds &&
          sockets[i].cachedGuilds.includes(gId)) {
        sockets[i].emit('settingsReset', gId);
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
   * @private
   * @return {number} Number of sockets.
   */
  function getNumClients() {
    return Object.keys(sockets).length - Object.keys(siblingSockets).length;
  }

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

    socket.emit('time', Date.now());

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
    socket.on('fetchChannel', (...args) => {
      callSocketFunction(fetchChannel, args);
    });
    socket.on('fetchSettings', (...args) => {
      callSocketFunction(fetchSettings, args);
    });
    socket.on('fetchScheduledCommands', (...args) => {
      callSocketFunction(fetchScheduledCommands, args);
    });
    socket.on('cancelScheduledCommand', (...args) => {
      callSocketFunction(cancelScheduledCommand, args);
    });
    socket.on('registerScheduledCommand', (...args) => {
      callSocketFunction(registerScheduledCommand, args);
    });
    socket.on('changePrefix', (...args) => {
      callSocketFunction(changePrefix, args);
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
  function replyNoPerm(socket, cmd) {
    self.common.log('Attempted ' + cmd + ' without permission.', socket.id);
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
    let g = self.client.guilds.get(gId);
    return (g && true) || false;
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
    let g = self.client.guilds.get(gId);
    if (!g) return false;
    let member = g.members.get(userData.id);
    if (!member) {
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
    if (!m) return null;
    return {
      nickname: m.nickname,
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
    let g = self.client.guilds.get(gId);
    if (!g) return null;
    return {
      member: g.members.get(uId),
      author: g.members.get(uId).user,
      guild: g,
      channel: g.channels.get(cId),
      text: msg,
      content: msg,
      prefix: self.bot.getPrefix(gId),
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
   * Client has requested data for a specific channel.
   *
   * @public
   * @type {WebSettings~SocketFunction}
   * @param {Object} userData The current user's session data.
   * @param {socketIo~Socket} socket The socket connection to reply on.
   * @param {number|string} gId The ID of the Discord guild where the channel
   * is.
   * @param {number|string} cId The ID of the Discord channel to fetch.
   * @param {basicCB} [cb] Callback that fires once the requested action is
   * complete and has data, or has failed.
   */
  function fetchChannel(userData, socket, gId, cId, cb) {
    if (typeof cb !== 'function') cb = function() {};
    if (!checkChannelPerm(userData, gId, cId)) {
      if (!checkMyGuild(gId)) return;
      replyNoPerm(socket, 'cancelScheduledCommand');
      cb(null);
      return;
    }
    let c = self.client.channels.get(cId);
    let m = self.client.guilds.get(gId).members.get(userData.id);
    let perms = c.permissionsFor(m);
    let stripped = {
      id: c.id,
      permissions: perms,
      name: c.name,
      position: c.position,
      type: c.type,
    };
    if (c.parent) {
      stripped.parent = {position: c.parent.position};
    }
    cb(stripped);
  }
  this.fetchChannel = fetchChannel;

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
    let cmdDefaults = self.command.getDefaultSettings();
    let settings = guilds.map((g) => {
      return {
        guild: g.id,
        prefix: self.bot.getPrefix(g),
        commandSettings: self.command.getUserSettings(g.id),
        commandDefaults: cmdDefaults,
      };
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
            repeatDelay: el.repeatDelay,
            time: el.time,
            member: makeMember(el.member),
          };
        });
      }
    });
    cb(sCmds);
  }
  this.fetchScheduledCommands = fetchScheduledCommands;

  /**
   * Client has requested that a scheduled command be cancelled.
   *
   * @public
   * @type {WebSettings~SocketFunction}
   * @param {Object} userData The current user's session data.
   * @param {socketIo~Socket} socket The socket connection to reply on.
   * @param {string|number} gId The id of the guild of which to cancel the
   * command.
   * @param {string} cmdId The ID of the command to cancel.
   * @param {basicCB} [cb] Callback that fires once the requested action is
   * complete, or has failed.
   */
  function cancelScheduledCommand(userData, socket, gId, cmdId, cb) {
    if (typeof cb !== 'function') cb = function() {};
    if (!checkPerm(userData, gId)) {
      if (!checkMyGuild(gId)) return;
      replyNoPerm(socket, 'cancelScheduledCommand');
      cb('Forbidden');
      return;
    }
    updateModuleReferences();
    cmdScheduler.cancelCmd(gId, cmdId);
  }
  this.cancelScheduledCommand = cancelScheduledCommand;

  /**
   * Client has created a new scheduled command.
   *
   * @public
   * @type {WebSettings~SocketFunction}
   * @param {Object} userData The current user's session data.
   * @param {socketIo~Socket} socket The socket connection to reply on.
   * @param {string|number} gId The id of the guild of which to add the
   * command.
   * @param {string} cmd The command data of which to make into a {@link
   * CmdScheduling~ScheduledCommand} and register.
   * @param {basicCB} [cb] Callback that fires once the requested action is
   * complete, or has failed.
   */
  function registerScheduledCommand(userData, socket, gId, cmd, cb) {
    if (typeof cb !== 'function') cb = function() {};
    if (!checkPerm(userData, gId)) {
      if (!checkMyGuild(gId)) return;
      replyNoPerm(socket, 'registerScheduledCommand');
      cb('Forbidden');
      return;
    }
    if (!cmd || typeof cmd !== 'object') {
      cb('Invalid Data');
      return;
    }
    if (!cmd.time || cmd.time < Date.now()) {
      cb('Time cannot be in past.');
      return;
    }
    updateModuleReferences();
    if (cmd.repeatDelay && cmd.repeatDelay < cmdScheduler.minRepeatDelay) {
      cb('Repeat time is too soon.');
      return;
    }
    let cId = self.client.channels.get(cmd.channel);
    if (!cId) {
      cb('Invalid Channel');
      return;
    }
    cId = cId.id;
    if (typeof cmd.cmd !== 'string') {
      cb('Invalid Command');
      return;
    }

    let msg = makeMessage(userData.id, gId, cId, cmd.cmd);

    if (!msg) {
      cb('Invalid Member');
      return;
    }

    let invalid = self.command.validate(cmd.cmd.split(/\s/)[0], msg);
    if (invalid) {
      cb('Invalid Command');
      return;
    }

    let newCmd = new cmdScheduler.ScheduledCommand({
      cmd: cmd.cmd,
      channel: msg.channel,
      message: msg,
      time: cmd.time,
      repeatDelay: cmd.repeatDelay,
      member: msg.member,
    });

    cmdScheduler.registerScheduledCommand(newCmd);
    cb(null);
  }
  this.registerScheduledCommand = registerScheduledCommand;

  /**
   * Client has requested to change the command prefix for a guild.
   *
   * @public
   * @type {WebSettings~SocketFunction}
   * @param {Object} userData The current user's session data.
   * @param {socketIo~Socket} socket The socket connection to reply on.
   * @param {string|number} gId The id of the guild of which to change the
   * prefix.
   * @param {string} prefix The new prefix value to set.
   * @param {basicCB} [cb] Callback that fires once the requested action is
   * complete, or has failed.
   */
  function changePrefix(userData, socket, gId, prefix, cb) {
    if (typeof cb !== 'function') cb = function() {};
    if (!checkPerm(userData, gId) ||
        self.command.validate(
            'changeprefix', makeMessage(userData.id, gId, null, prefix))) {
      if (!checkMyGuild(gId)) return;
      replyNoPerm(socket, 'changePrefix');
      cb('Forbidden');
      return;
    }
    try {
      self.bot.changePrefix(gId, prefix);
    } catch (err) {
      cb('Internal Error');
      return;
    }
    cb();
  }
  this.changePrefix = changePrefix;
}
module.exports = new WebSettings();
