// Copyright 2018 Campbell Crowley. All rights reserved.
// Author: Campbell Crowley (web@campbellcrowley.com)
const fs = require('fs');
const http = require('http');
const https = require('https');
const socketIo = require('socket.io');
const sql = require('mysql');
const dateFormat = require('dateformat');
const auth = require('../../auth.js');
const patreon = require('patreon');

const PATREON_CLIENT_ID = auth.patreonClientId;
const PATREON_CLIENT_SECRET = auth.patreonClientSecret;
const redirectURL = 'https://www.spikeybot.com/redirect/';

let patreonAPI = patreon.patreon;
let patreonOAuthClient =
    patreon.oauth(PATREON_CLIENT_ID, PATREON_CLIENT_SECRET);

require('../subModule.js')(WebAccount);  // Extends the SubModule class.


/**
 * @classdesc Manages the account webpage.
 * @class
 * @augments SubModule
 */
function WebAccount() {
  self = this;
  this.myName = 'WebAccount';

  let app = http.createServer(handler);
  let io = socketIo(
      app, {path: '/www.spikeybot.com/socket.io/', serveClient: false});

  app.on('error', function(err) {
    if (err.code === 'EADDRINUSE') {
      self.shutdown(true);
      console.error(
          'Accounts failed to bind to port because it is in use.', err);
    } else {
      console.error('Account failed to bind to port for unknown reason.', err);
    }
  });


  /** @inheritdoc */
  this.initialize = function() {
    app.listen(self.common.isRelease ? 8014 : 8015);
  };

  /**
   * Causes a full shutdown of all servers.
   * @public
   * @param {boolean} [skipSave=false] Skip writing data to file.
   */
  this.shutdown = function(skipSave) {
    if (io) io.close();
    if (app) app.close();
  };

  /** @inheritdoc */
  this.unloadable = function() {
    return true;
  };

  /**
   * The object describing the connection with the SQL server.
   *
   * @private
   * @type {sql.ConnectionConfig}
   */
  let sqlCon;
  /**
   * Create initial connection with sql server.
   *
   * @private
   */
  function connectSQL() {
    /* eslint-disable-next-line new-cap */
    sqlCon = new sql.createConnection({
      user: 'discord',
      password: 'sqliscool',
      host: 'Campbell-Pi-2.local',
      database: 'appusers',
      port: 3306,
    });
    sqlCon.on('error', function(e) {
      self.error(e);
      if (e.fatal) {
        connectSQL();
      }
    });
  }
  connectSQL();

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
    const ipName = self.common.getIPName(
        socket.handshake.headers['x-forwarded-for'] ||
        socket.handshake.address);

    self.common.log(
        'Socket connected (' + Object.keys(sockets).length + '): ' + ipName,
        socket.id);
    sockets[socket.id] = socket;

    socket.on('getAccountInfo', (userData, cb) => {
      if (typeof cb !== 'function') {
        self.error('NO CB');
        return;
      }
      if (!userData) {
        cb('Not signed in.', null);
        return;
      }
      const toSend = sqlCon.format(
          'SELECT * FROM Discord WHERE id=? LIMIT 1', [userData.id]);
      sqlCon.query(toSend, (err, rows) => {
        if (err) {
          self.error(err);
          cb('Server Error', null);
          return;
        }
        const toSend2 = sqlCon.format(
            'SELECT * FROM Patreon WHERE id=? LIMIT 1', [rows[0].patreonId]);
        sqlCon.query(toSend2, (err, rows2) => {
          if (err) {
            self.error(err);
            cb('Server Error', null);
            return;
          }
          self.client.users.fetch(userData.id)
              .then((user) => {
                let data = rows[0];
                data.username = user.username;
                data.avatarURL = user.displayAvatarURL();
                data.createdAt = user.createdAt;
                data.discriminator = user.discriminator;
                data.activity = user.presence.activity;
                data.patreon = rows2[0];
                cb(null, data);
              })
              .catch((err) => {
                cb('Server Error', null);
                self.error('Failed to fetch user data from discord.');
                console.error(err);
              });
        });
      });
    });

    socket.on('linkPatreon', (userData, code, cb) => {
      if (!userData) {
        cb('Not signed in.', null);
        return;
      }
      if (typeof cb !== 'function') cb = function() {};
      validatePatreonCode(code, userData.id, socket.id, cb);
    });
    socket.on('unlinkPatreon', (userData, cb) => {
      if (!userData) {
        cb('Not signed in.', null);
        return;
      }
      if (typeof cb !== 'function') cb = function() {};
      updateUserPatreonId(userData.id, null, cb);
    });

    socket.on('disconnect', () => {
      self.common.log(
          'Socket disconnected (' + (Object.keys(sockets).length - 1) + '): ' +
              ipName,
          socket.id);
      delete sockets[socket.id];
    });
  }
  function validatePatreonCode(code, userid, ip, cb) {
    patreonOAuthClient.getTokens(code, redirectURL)
        .then(function(tokensResponse) {
          let patreonAPIClient = patreonAPI(tokensResponse.access_token);
          return patreonAPIClient('/current_user');
        })
        .then(function(result) {
          let store = result.store;
          let users = store.findAll('user').map(user => user.serialize());
          if (!users || users.length < 1 || !users[0].data ||
              !users[0].data.id) {
            self.common.error('Failed to get patreonid', ip);
            cb('Internal Server Error');
            return;
          }
          updateUserPatreonId(userid, users[0].data.id, cb);
        })
        .catch(function(err) {
          self.common.error('Failed to get patreonId');
          console.error(err);
          cb('Internal Server Error');
        });
  }
  function updateUserPatreonId(userid, patreonid, cb) {
    const toSend = sqlCon.format(
        'UPDATE Discord SET patreonId=? WHERE id=?', [patreonid, userid]);
    sqlCon.query(toSend, function(err, response) {
      if (err) {
        self.common.error('Failed to update patreonId in Discord table.');
        console.log(err);
        cb('Internal Server Error');
      } else {
        cb(null);
      }
    });
  }
}

module.exports = new WebAccount();
