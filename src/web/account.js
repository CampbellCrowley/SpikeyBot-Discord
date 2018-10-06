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
const mkdirp = require('mkdirp'); // mkdir -p

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
      self.error('Accounts failed to bind to port because it is in use.');
      self.shutdown(true);
    } else {
      console.error('Account failed to bind to port for unknown reason.', err);
    }
  });

  /**
   * The filename in the user's directory of the file where the settings related
   * to Patreon rewards are stored.
   *
   * @private
   * @constant
   * @default
   * @type {string}
   */
  const patreonSettingsFilename = '/patreonSettings.json';
  /**
   * File where the template for the Patreon settings is stored.
   * @see {@link WebAccount~patreonSettingsTemplate}
   *
   * @private
   * @constant
   * @default
   * @type {string}
   */
  const patreonSettingsTemplateFile = './save/patreonSettingTemplate.json';
  /**
   * The parsed data from {@link WebAccount~patreonSettingsTemplateFile}. Data
   * that outlines the available options that can be changed, and their possible
   * values.
   * @private
   *
   * @default
   * @type {Object.<Object>}
   */
  let patreonSettingsTemplate = {};

  /**
   * Parse template from file.
   * @see {@link WebAccount~patreonSettingsTemplate}
   * @private
   */
  function updatePatreonSettingsTemplate() {
    fs.readFile(patreonSettingsTemplateFile, (err, data) => {
      if (err) {
        self.error('Failed to read ' + patreonSettingsTemplateFile);
        return;
      }
      try {
        let parsed = JSON.parse(data);
        if (!parsed) return;
        patreonSettingsTemplate = parsed;
      } catch(e) {
        self.error('Failed to parse ' + patreonSettingsTemplateFile);
        console.error(e);
      }
    });
  }
  updatePatreonSettingsTemplate();
  fs.watchFile(patreonSettingsTemplateFile, (curr, prev) => {
    if (curr.mtime == prev.mtime) return;
    if (self.initialized) {
      self.log('Re-reading Patreon setting template information from file');
    } else {
      console.log(
          'WebAccount: Re-reading setting template information from file');
    }
    updatePatreonSettingsTemplate();
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
    fs.unwatchFile(patreonSettingsTemplateFile);
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
      if (typeof cb !== 'function') cb = function() {};
      if (!userData) {
        cb('Not signed in.', null);
        return;
      }
      validatePatreonCode(code, userData.id, socket.id, cb);
    });
    socket.on('unlinkPatreon', (userData, cb) => {
      if (typeof cb !== 'function') cb = function() {};
      if (!userData) {
        cb('Not signed in.', null);
        return;
      }
      updateUserPatreonId(userData.id, null, cb);
    });
    socket.on('getSettingsTemplate', (userData, cb) => {
      if (typeof cb !== 'function') {
        self.error('Requested setting template without callback.', socket.id);
        return;
      }
      cb(patreonSettingsTemplate);
    });
    socket.on('getUserSettings', (userData, cb) => {
      if (!userData) {
        cb('Not signed in.', null);
        return;
      }
      getPatreonSettings(userData.id, cb);
    });
    socket.on('getUserPerms', (userData, cb) => {
      if (!userData) {
        cb('Not signed in.', null);
        return;
      }
      if (!self.bot.patreon) {
        self.error('Patreon submodule has not been loaded!');
        cb('Internal Error', null);
      } else {
        self.bot.patreon.getAllPerms(userData.id, null, null, cb);
      }
    });
    socket.on('changeSetting', (userData, setting, value, cb) => {
      if (typeof cb !== 'function') cb = function() {};
      if (!userData) {
        cb('Not signed in.', null);
        return;
      }
      changePatreonSetting(userData.id, setting, value, cb);
    });

    socket.on('disconnect', () => {
      self.common.log(
          'Socket disconnected (' + (Object.keys(sockets).length - 1) + '): ' +
              ipName,
          socket.id);
      delete sockets[socket.id];
    });
  }
  /**
   * Validate a code received from the client, then use it to retrieve the user
   * ID associated with it.
   * @private
   *
   * @param {string} code The code received from Patreon OAuth2 flow.
   * @param {string|number} userid The Discord user ID associated with this code
   * in order to link accounts.
   * @param {string} ip The unique identifier for this connection for logging
   * purposes.
   * @param {Function} cb Callback with a single parameter. The parameter is a
   * string if there was an error, or null if no error.
   */
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
  /**
   * Update our Discord table with the retrieved patreon account ID for the
   * Discord user.
   * @param
   *
   * @param {string|number} userid The Discord ID of the user to link to the
   * patreonid.
   * @param {string|number} patreonid The Patreon id of the account to link to
   * the Discord ID.
   * @param {Function} cb Callback with single argument that is string if error,
   * or null if no error.
   */
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
  /**
   * Fetch a user's current patreon settings from file.
   * @private
   *
   * @param {string|number} userid Thd Discord id of the user to lookup.
   * @param {Function} cb Callback with 2 parameters, the first is the error
   * string or null if no error, the second will be the settings object if there
   * is no error.
   */
  function getPatreonSettings(userid, cb) {
    fs.readFile(
        self.common.userSaveDir + userid + patreonSettingsFilename,
        (err, data) => {
          if (err) {
            cb(err, null);
            return;
          }
          try {
            cb(null, JSON.parse(data));
          } catch (e) {
            cb(e, null);
          }
        });
  }
  /**
   * Change a user's setting that is related to Patreon rewards.
   * @private
   *
   * @param {string|number} userid The Discord id of the user to change the
   * setting for.
   * @param {string} setting The name of the setting to change.
   * @param {string} value The value to set the setting to.
   * @param {Function} cb Callback that is called once the operations are
   * complete with a single parameter for errors, string if error, null if none.
   */
  function changePatreonSetting(userid, setting, value, cb) {
    const dirname = self.common.userSaveDir + userid;
    const filename = dirname + patreonSettingsFilename;
    function readFile() {
      fs.readFile(filename, makeDirectory);
    }
    function makeDirectory(err, data) {
      if (err) {
        mkdirp(dirname, function(err) {
          writeFile(err, data);
        });
      } else {
        writeFile(null, data);
      }
    }
    function writeFile(err, file) {
      let parsed = {};
      if (file != null) {
        try {
          parsed = JSON.parse(file);
        } catch (e) {
          self.error(
              'Failed to parse ' + self.common.userSaveDir + userid +
              patreonSettingsFilename);
          console.error(e);
          cb('Internal Error');
          return;
        }
      }
      parsed[setting] = value;

      fs.writeFile(filename, JSON.stringify(parsed), (err) => {
        if (!err) {
          cb(null);
          return;
        }
        self.error('Failed to write user settings to file: ' + filename);
        console.error(err);
        cb('Internal Error');
      });
    }

    if (patreonSettingsTemplate[setting] == null) {
      cb('Invalid Setting');
      return;
    } else {
      function isInvalid(obj, s, value) {
        let type = obj.type;
        let valid = false;
        if (type === 'select') {
          for (let i = 0; i < obj.values.length; i++) {
            if (obj.values[i] == value) {
              valid = true;
              break;
            }
          }
        } else if (type === 'number') {
          if (!isNaN(Number(value))) valid = true;
          if (valid && obj.range) {
            if (value < obj.range.min || value > obj.range.max) {
              valid = false;
            }
          }
        } else if (type === 'string') {
          valid = true;
        } else if (type === 'object') {
          return isInvalid(obj.values[s[0]], s.slice(1), value);
        }
        if (!valid) {
          cb('Invalid Value', {status: type || 'NOTYPE', message: value});
          return true;
        }
      }
      if (isInvalid(
              patreonSettingsTemplate[setting], setting.split(' ').slice(1),
              value)) {
        return;
      }
    }
    readFile();
  }
}

module.exports = new WebAccount();
