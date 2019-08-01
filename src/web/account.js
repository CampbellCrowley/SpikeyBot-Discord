// Copyright 2018 Campbell Crowley. All rights reserved.
// Author: Campbell Crowley (web@campbellcrowley.com)
const fs = require('fs');
const http = require('http');
const https = require('https');
const socketIo = require('socket.io');
const auth = require('../../auth.js');
const patreon = require('patreon');
const mkdirp = require('mkdirp'); // mkdir -p
const querystring = require('querystring');
const crypto = require('crypto');

const PATREON_CLIENT_ID = auth.patreonClientId;
const PATREON_CLIENT_SECRET = auth.patreonClientSecret;
const redirectURL = 'https://www.spikeybot.com/redirect/';

const patreonAPI = patreon.patreon;
const patreonOAuthClient =
    patreon.oauth(PATREON_CLIENT_ID, PATREON_CLIENT_SECRET);

require('../subModule.js').extend(WebAccount);  // Extends the SubModule class.


/**
 * @classdesc Manages the account webpage.
 * @class
 * @augments SubModule
 */
function WebAccount() {
  const self = this;
  this.myName = 'WebAccount';

  const app = http.createServer(handler);
  const io = socketIo(
      app, {path: '/www.spikeybot.com/socket.io/', serveClient: false});

  app.on('error', function(err) {
    if (err.code === 'EADDRINUSE') {
      self.warn(
          'Accounts failed to bind to port because it is in use. (' + err.port +
          ')');
      self.shutdown(true);
    } else {
      self.error('Account failed to bind to port for unknown reason.', err);
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
   *
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
   *
   * @private
   *
   * @default
   * @type {object.<object>}
   */
  let patreonSettingsTemplate = {};

  const defaultSpotifyTokenReq = {
    protocol: 'https:',
    host: 'accounts.spotify.com',
    path: '/api/token',
    method: 'POST',
    headers: {
      'Authorization':
          'Basic ' + (Buffer.from(auth.spotifyId + ':' + auth.spotifySecret)
              .toString('base64')),
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': require('../common.js').ua,
    },
  };

  const defaultSpotifyUserReq = {
    protocol: 'https:',
    host: 'api.spotify.com',
    path: '/v1/me',
    method: 'GET',
    headers: {
      'User-Agent': require('../common.js').ua,
    },
  };

  /**
   * Parse template from file.
   *
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
        const parsed = JSON.parse(data);
        if (!parsed) return;
        patreonSettingsTemplate = parsed;
      } catch (e) {
        self.error('Failed to parse ' + patreonSettingsTemplateFile);
        console.error(e);
      }
    });
  }
  updatePatreonSettingsTemplate();
  fs.watchFile(
      patreonSettingsTemplateFile, {persistent: false}, (curr, prev) => {
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
    app.listen(self.common.isRelease ? 8014 : 8015, '127.0.0.1');
    self.bot.accounts = toExport;
    self.common.connectSQL();
  };

  const toExport = {};

  /**
   * Causes a full shutdown of all servers.
   *
   * @public
   */
  this.shutdown = function() {
    if (io) io.close();
    if (app) app.close();
    fs.unwatchFile(patreonSettingsTemplateFile);
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
   * @type {object.<Socket>}
   */
  const sockets = {};

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
      fetchDiscordSQL();
      /**
       * Fetch the Discord table data from our SQL server.
       *
       * @private
       */
      function fetchDiscordSQL() {
        const toSend = global.sqlCon.format(
            'SELECT * FROM Discord WHERE id=? LIMIT 1', [userData.id]);
        global.sqlCon.query(toSend, (err, rows) => {
          if (err) {
            self.error(err);
            cb('Server Error', null);
            return;
          }
          fetchPatreonSQL((rows && rows[0]) || {});
        });
      }
      /**
       * Fetch the Patreon info from our SQL server.
       *
       * @private
       *
       * @param {object} data The data previously received to add the Patreon
       * info onto.
       */
      function fetchPatreonSQL(data) {
        if (!data.patreonId) {
          fetchSpotifySQL(data);
          return;
        }
        const toSend = global.sqlCon.format(
            'SELECT * FROM Patreon WHERE id=? LIMIT 1', [data.patreonId]);
        global.sqlCon.query(toSend, (err, rows) => {
          if (err) {
            self.error(err);
            cb('Server Error', null);
            return;
          }
          if (rows && rows.length > 0) {
            data.patreon = rows[0];
          }
          fetchSpotifySQL(data);
        });
      }
      /**
       * Fetch the Spotify info from our SQL server.
       *
       * @private
       *
       * @param {object} data The data previously received to add the Spotify
       * info onto.
       */
      function fetchSpotifySQL(data) {
        if (!data.spotifyId) {
          fetchDiscordBot(data);
          return;
        }
        const toSend = global.sqlCon.format(
            'SELECT * FROM Spotify WHERE id=? LIMIT 1', [data.spotifyId]);
        global.sqlCon.query(toSend, (err, rows) => {
          if (err) {
            self.error(err);
            cb('Server Error', null);
            return;
          }
          if (rows && rows.length > 0) {
            data.spotify = {
              id: rows[0].id,
              haveToken: rows[0].access_token !== null,
              name: rows[0].name,
            };
          }
          fetchDiscordBot(data);
        });
      }
      /**
       * Fetch the Discord user information through the Discord bot API.
       *
       * @private
       *
       * @param {object} data The data previously received to add the Discord
       * user info onto, then send to the client.
       */
      function fetchDiscordBot(data) {
        self.client.users.fetch(userData.id)
            .then((user) => {
              data.username = user.username;
              data.avatarURL = user.displayAvatarURL();
              data.createdAt = user.createdAt;
              data.discriminator = user.discriminator;
              data.activity = user.presence.activity;
              cb(null, data);
            })
            .catch((err) => {
              cb('Server Error', null);
              self.error('Failed to fetch user data from discord.');
              console.error(err);
            });
      }
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
    socket.on('linkSpotify', (userData, code, cb) => {
      if (typeof cb !== 'function') cb = function() {};
      if (!userData) {
        cb('Not signed in.', null);
        return;
      }
      validateSpotifyCode(code, userData.id, socket.id, cb);
    });
    socket.on('unlinkSpotify', (userData, cb) => {
      if (typeof cb !== 'function') cb = function() {};
      if (!userData) {
        cb('Not signed in.', null);
        return;
      }
      updateUserSpotifyId(userData.id, null, cb);
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
    socket.on('fetchApiToken', (userData, cb) => {
      if (typeof cb !== 'function') return;
      if (!userData) {
        cb('Not signed in.', null);
        return;
      }
      const toSend = global.sqlCon.format(
          'SELECT apiToken FROM Discord WHERE id=?', [userData.id]);
      global.sqlCon.query(toSend, (err, rows) => {
        if (err) {
          self.error('Failed to fetch apiToken from database.');
          console.error(err);
          cb('Internal Server Error');
          return;
        }
        cb(null, rows && rows[0] && rows[0].apiToken);
      });
    });
    socket.on('resetApiToken', (userData, cb) => {
      if (typeof cb !== 'function') cb = function() {};
      if (!userData) {
        cb('Not signed in.', null);
        return;
      }
      const token = crypto.randomBytes(128).toString('base64');
      const toSend = global.sqlCon.format(
          'UPDATE Discord SET apiToken=? WHERE id=?', [token, userData.id]);
      global.sqlCon.query(toSend, (err) => {
        if (err) {
          self.error('Failed to reset apiToken in database.');
          console.error(err);
          cb('Internal Server Error');
          return;
        }
        cb(null, token);
      });
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
   * @description Validate a code received from the client, then use it to
   * retrieve the user ID associated with it.
   *
   * @private
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
          const patreonAPIClient = patreonAPI(tokensResponse.access_token);
          return patreonAPIClient('/current_user');
        })
        .then(function(result) {
          const store = result.store;
          const users = store.findAll('user').map((user) => user.serialize());
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
   * @description Validate a code received from the client, then use it to
   * retrieve the user ID associated with it.
   *
   * @private
   * @param {string} code The code received from Patreon OAuth2 flow.
   * @param {string|number} userid The Discord user ID associated with this code
   * in order to link accounts.
   * @param {string} ip The unique identifier for this connection for logging
   * purposes.
   * @param {Function} cb Callback with a single parameter. The parameter is a
   * string if there was an error, or null if no error.
   */
  function validateSpotifyCode(code, userid, ip, cb) {
    const req = https.request(defaultSpotifyTokenReq, (res) => {
      let content = '';
      res.on('data', (chunk) => {
        content += chunk;
      });
      res.on('end', () => {
        if (res.statusCode == 200) {
          handleSpotifyTokenResponse(userid, content, ip, cb);
        } else {
          self.common.error(content, ip);
          cb('Internal Server Error');
          return;
        }
      });
    });
    /* eslint-disable @typescript-eslint/camelcase */
    req.end(querystring.stringify({
      code: code,
      redirect_uri: redirectURL,
      grant_type: 'authorization_code',
    }));
    /* eslint-enable @typescript-eslint/camelcase */
  }

  /**
   * Handle the response after successfully requesting the user's tokens.
   *
   * @private
   *
   * @param {string|number} userid Discord user id.
   * @param {string} content The response from Spotify.
   * @param {string} ip Unique identifier for the client that caused this to
   * happen. Used for logging.
   * @param {Function} cb Callback with single parameter, string if error, null
   * if no error.
   */
  function handleSpotifyTokenResponse(userid, content, ip, cb) {
    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch (err) {
      cb('Internal Server Error');
      self.common.error('Failed to parse token response from Spotify.', ip);
      console.error(err);
      return;
    }
    const vals = {
      accessToken: parsed.access_token,
      expiresIn: parsed.expires_in,
      expiresAt: dateToSQL(Date.now() + parsed.expires_in * 1000),
    };
    if (parsed.refresh_token) {
      vals.refreshToken = parsed.refresh_token;
    }
    const req = https.request(defaultSpotifyUserReq, (res) => {
      let content = '';
      res.on('data', (chunk) => {
        content += chunk;
      });
      res.on('end', () => {
        if (res.statusCode == 200) {
          handleSpotifyUserResponse(userid, content, vals, ip, cb);
        } else {
          self.common.error(content, ip);
          cb('Internal Server Error');
          return;
        }
      });
    });
    req.setHeader('Authorization', 'Bearer ' + vals.accessToken);
    req.end();
  }

  /**
   * @description Handle the response after successfully requesting the user's
   * basic account information.
   * @private
   *
   * @param {string|number} userid Discord user id.
   * @param {string} content The response from Spotify.
   * @param {{accessToken: string, expiresIn: number, expiresAt: string,
   * refreshToken: string}} vals The object storing user session information.
   * @param {string} ip Unique identifier for the client that caused this to
   * happen. Used for logging.
   * @param {Function} cb Callback with single parameter, string if error, null
   * if no error.
   */
  function handleSpotifyUserResponse(userid, content, vals, ip, cb) {
    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch (err) {
      self.common.error('Failed to parse user response from Spotify.', ip);
      console.error(err);
      cb('Internal Server Error');
      return;
    }
    vals.id = parsed.id;
    vals.name = parsed.display_name;
    const toSend = global.sqlCon.format(
        'INSERT INTO Spotify (id,name,accessToken,refreshToken,tokenExpiresAt' +
            ') VALUES (?,?,?,?,?) ON DUPLICATE KEY UPDATE accessToken=?,token' +
            'ExpiresAt=?',
        [
          vals.id,
          vals.name,
          vals.accessToken,
          vals.refreshToken,
          vals.expiresAt,
          vals.accessToken,
          vals.expiresAt,
        ]);
    global.sqlCon.query(toSend, (err) => {
      if (err) {
        self.common.error('Failed to update Spotify table with user data.', ip);
        console.error(err);
        cb('Internal Server Error');
        return;
      }
      updateUserSpotifyId(userid, vals.id, cb);
    });
  }
  /**
   * @description Update our Discord table with the retrieved patreon account ID
   * for the Discord user.
   *
   * @private
   * @param {string|number} userid The Discord ID of the user to link to the
   * patreonid.
   * @param {string|number} patreonid The Patreon id of the account to link to
   * the Discord ID.
   * @param {Function} cb Callback with single argument that is string if error,
   * or null if no error.
   */
  function updateUserPatreonId(userid, patreonid, cb) {
    const toSend = global.sqlCon.format(
        'UPDATE Discord SET patreonId=? WHERE id=?', [patreonid, userid]);
    global.sqlCon.query(toSend, (err) => {
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
   * @description Update our Discord table with the retrieved spotify account ID
   * for the Discord user. Deletes row from Spotify table if the userId is
   * falsey.
   *
   * @private
   * @param {string|number} userid The Discord ID of the user to link to the
   * patreonid.
   * @param {string|number} spotifyid The Spotify id of the account to link to
   * the Discord ID.
   * @param {Function} cb Callback with single argument that is string if error,
   * or null if no error.
   */
  function updateUserSpotifyId(userid, spotifyid, cb) {
    if (!spotifyid) {
      const toSendGet = global.sqlCon.format(
          'SELECT spotifyId FROM Discord WHERE id=?', [userid]);
      global.sqlCon.query(toSendGet, (err, rows) => {
        if (err) {
          self.common.error('Failed to fetch spotifyId from Discord table.');
          console.log(err);
          cb('Internal Server Error');
        } else {
          const toSend2 = global.sqlCon.format(
              'DELETE FROM Spotify WHERE id=?', [rows[0].spotifyId]);
          global.sqlCon.query(toSend2, (err) => {
            if (err) {
              self.common.error(
                  'Failed to delete spotifyId from Spotify table.');
              console.log(err);
              cb('Internal Server Error');
            } else {
              setId();
            }
          });
        }
      });
    } else {
      setId();
    }

    /**
     * Send request to sql server.
     */
    function setId() {
      const toSend = global.sqlCon.format(
          'UPDATE Discord SET spotifyId=? WHERE id=?', [spotifyid, userid]);
      global.sqlCon.query(toSend, (err) => {
        if (err) {
          self.common.error('Failed to update spotifyId in Discord table.');
          console.log(err);
          cb('Internal Server Error');
        } else {
          cb(null);
        }
      });
    }
  }
  /**
   * Fetch a user's current patreon settings from file.
   *
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
   *
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
    const split = setting.split(' ');
    setting = split[0];
    /**
     * Make the directory for writing the user's settings if it does not exist
     * already.
     *
     * @private
     * @param {?Error} err The error in readin the existing file.
     * @param {?string} data The data read from the existing file if any.
     */
    function makeDirectory(err, data) {
      if (err) {
        mkdirp(dirname, function(err) {
          writeFile(err, data);
        });
      } else {
        writeFile(null, data);
      }
    }
    /**
     * Checks that the setting that was requested to be changed is a valid
     * setting to change.
     *
     * @private
     * @param {object} obj The template object to compare the request against.
     * @param {string[]} s The array of each setting key that was a part of
     * the request.
     * @param {string|number} value The value to change the setting to.
     * @returns {boolean} True if the request was invalid in some way, or false
     * if everything is fine.
     */
    function isInvalid(obj, s, value) {
      const type = obj.type;
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
      } else if (type === 'color') {
        valid =
            typeof value === 'string' && value.match(/^0x[0-9a-fA-f]{6,9}$/);
      } else if (type === 'boolean') {
        valid = typeof value === 'boolean' ||
            (typeof value === 'string' && (value.toLowerCase() === 'false' ||
                                           value.toLowerCase() === 'true'));
      } else if (type === 'object') {
        return isInvalid(obj.values[s[0]], s.slice(1), value);
      }
      if (!valid) {
        cb('Invalid Value', {status: type || 'NOTYPE', message: value});
        return true;
      } else {
        return false;
      }
    }
    /**
     * Write the modified data to file.
     *
     * @private
     *
     * @param {?Error} err The error in creating the directory.
     * @param {?string} file The current file data that was read.
     */
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
      if (split.length > 1) {
        if (!parsed[setting]) parsed[setting] = {};
        let obj = parsed[setting];
        while (split.length > 2) {
          const next = split.splice(1, 1)[0];
          if (!obj[next]) obj[next] = {};
          obj = obj[next];
        }
        obj[split[1]] = value;
      } else {
        parsed[setting] = value;
      }

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
      if (isInvalid(patreonSettingsTemplate[setting], split.slice(1), value)) {
        return;
      }
    }
    fs.readFile(filename, makeDirectory);
  }

  /**
   * Get a current access token for a given discord user to make a request to
   * the Spotify API.
   *
   * @public
   *
   * @param {string|number} uId The Discord user id to get the token for.
   * @param {Function} cb Callback with a single argument that is the token, or
   * null if no token is available.
   */
  toExport.getSpotifyToken = function(uId, cb) {
    let firstAttempt = true;
    let sId;
    const toSend = global.sqlCon.format(
        'SELECT spotifyId FROM Discord WHERE id=? LIMIT 1', [uId]);
    global.sqlCon.query(toSend, (err, rows) => {
      if (err) {
        self.error(err);
        cb(null);
        return;
      }
      if (rows[0]) {
        fetchSpotifySQL(rows[0].spotifyId);
      } else {
        fetchSpotifySQL(null);
      }
    });
    /**
     * Request the user's Spotify info from our SQL server.
     *
     * @private
     *
     * @param {string} id The spotify ID of the user to fetch.
     */
    function fetchSpotifySQL(id) {
      if (!id) {
        cb(null);
        return;
      }
      sId = id;
      const toSend = global.sqlCon.format(
          'SELECT * FROM Spotify WHERE id=? LIMIT 1', [sId]);
      global.sqlCon.query(toSend, (err, rows) => {
        if (err) {
          self.error(err);
          cb(null);
          return;
        }
        const expiresAt = new Date(rows[0].tokenExpiresAt);
        if (Date.now() - expiresAt.getTime() > 0) {
          refreshSpotifyToken(rows[0].refreshToken);
        } else {
          cb(rows[0].accessToken);
        }
      });
    }
    /**
     * Use the user's refresh token to request a new access token. Only
     * attempted once.
     *
     * @private
     *
     * @param {string} token The refresh token to use.
     */
    function refreshSpotifyToken(token) {
      if (!firstAttempt || !token) {
        cb(null);
        return;
      }
      firstAttempt = false;
      const req = https.request(defaultSpotifyTokenReq, (res) => {
        let content = '';
        res.on('data', (chunk) => {
          content += chunk;
        });
        res.on('end', () => {
          if (res.statusCode == 200) {
            handleSpotifyTokenResponse(uId, content, null, (err) => {
              if (err) {
                cb(null);
              } else {
                fetchSpotifySQL(sId);
              }
            });
          } else {
            self.error(content);
            cb(null);
            return;
          }
        });
      });
      /* eslint-disable @typescript-eslint/camelcase */
      req.end(querystring.stringify({
        refresh_token: token,
        grant_type: 'refresh_token',
      }));
      /* eslint-enable @typescript-eslint/camelcase */
    }
  };
  /**
   * Convert the given date into a format that SQL can understand.
   *
   * @private
   * @param {*} date Something that `new Date()` can interpret.
   * @returns {string} Formatted Datetime string not including fractions of a
   * second.
   */
  function dateToSQL(date) {
    date = new Date(date);
    return date.getFullYear() + '-' + (date.getMonth() + 1) + '-' +
        date.getDate() + ' ' + date.getHours() + ':' + date.getMinutes() + ':' +
        date.getSeconds();
  }
}

module.exports = new WebAccount();
