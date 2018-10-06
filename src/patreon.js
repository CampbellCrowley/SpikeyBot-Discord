// Copyright 2018 Campbell Crowley. All rights reserved.
// Author: Campbell Crowley (dev@campbellcrowley.com)
const fs = require('fs');
const sql = require('mysql');
require('./subModule.js')(Patreon); // Extends the SubModule class.

/**
 * @classdesc Modifies the SpikeyBot object with an interface for checking the
 * Patreon status of users.
 * @class
 * @augments SubModule
 * @listens SpikeyBot~Command#patreon
 */
function Patreon() {
  const self = this;
  /** @inheritdoc */
  this.myName = 'Patreon';

  /** @inheritdoc */
  this.helpMessage = null;

  /**
   * Path to the file storing information about each patron tier rewards.
   *
   * @private
   * @constant
   * @default
   * @type {string}
   */
  const patreonTierPermFile = './save/patreonTiers.json';
  /**
   * The parsed data from file about patron tier rewards.
   * @see {@link Patreon~patreonTierPermFile}
   *
   * @private
   * @defatult
   * @type {Array.<{0: number, 1: string[]}>}
   */
  let patreonTiers = {};

  /**
   * Parse tiers from file.
   * @see {@link Patreon~patreonTierPermFile}
   * @private
   */
  function updateTierPerms() {
    fs.readFile(patreonTierPermFile, (err, data) => {
      if (err) {
        self.error('Failed to read ' + patreonTierPermFile);
        return;
      }
      try {
        let parsed = JSON.parse(data);
        if (!parsed) return;
        patreonTiers = Object.entries(parsed);
      } catch (e) {
        console.error(e);
      }
    });
  }
  updateTierPerms();
  fs.watchFile(patreonTierPermFile, (curr, prev) => {
    if (curr.mtime == prev.mtime) return;
    if (self.initialized) {
      self.log('Re-reading Patreon tier reward information from file');
    } else {
      console.log('Patreon: Re-reading tier reward information from file');
    }
    updateTierPerms();
  });

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

  /** @inheritdoc */
  this.initialize = function() {
    self.bot.patreon = toExport;
    self.command.on('patreon', commandPatreon);
  };
  /** @inheritdoc */
  this.shutdown = function() {
    self.command.deleteEvent('patreon');

    fs.unwatchFile(patreonTierPermFile);
  };

  /**
   * Shows the user's Patreon information to the user.
   *
   * @private
   * @type {commandHandler}
   * @param {Discord~Message} msg Message that triggered command.
   * @listens SpikeyBot~Command#patreon
   */
  function commandPatreon(msg) {
    /**
     * Verifies that valid data was found, then fetches all permissions fot the
     * user's pledge amount.
     * @private
     * @type {Patreon~basicCB}
     * @param {?string} err The error string, or null if no error.
     * @param {?{status: Object, message: string}} data The returned data if
     * there was no error.
     */
    function getPerms(err, data) {
      if (err) {
        if (err.startsWith('User has not connected')) {
          self.common.reply(
              msg,
              'If you love SpikeyBot and wish to support SpikeyRobot, please ' +
                  'consider becoming a patron on Patreon!\npatreon.com/Campbe' +
                  'llCrowley\n\nIf you have already pledged, be sure to link ' +
                  'your accounts in order to receive your rewards.\nspikeybot' +
                  '.com/account',
              'https://www.patreon.com/campbellcrowley\nhttps://www.spikeybot' +
                  '.com/account/');
        } else if (err.startsWith('User has never pledged')) {
          self.common.reply(
              msg,
              'You currently have not pledged anything on Patreon.\nIf you lo' +
                  've SpikeyBot, or wish to receive the perks of becoming a p' +
                  'atron, please consider supporting SpikeyRobot on Patreon.',
              'https://www.patreon.com/campbellcrowley');
          return;
        } else {
          self.common.reply(
              msg, 'Oops! Something went wrong while fetching your Patreon ' +
                  'information!',
              err);
        }
        return;
      }
      const pledgeAmount = data.status.pledge;
      if (!pledgeAmount || isNaN(Number(pledgeAmount))) {
        self.common.reply(
            msg,
            'You currently have not pledged anything on Patreon.\nIf you ' +
                'love SpikeyBot, or wish to receive the perks of becoming a ' +
                'patron, please consider supporting SpikeyRobot on Patreon.',
            'https://www.patreon.com/campbellcrowley');
        return;
      }
      toExport.getLevelPerms(pledgeAmount, false, onGetPerms);
    }
    /**
     * Verifies that valid data was found, then fetches all permissions fot the
     * user's pledge amount.
     * @private
     * @type {Patreon~basicCB}
     * @param {?string} err The error string, or null if no error.
     * @param {?{status: string[], message: string}} data The returned data if
     * there was no error.
     */
    function onGetPerms(err, data) {
      if (err) {
        self.common.reply(
            msg,
            'Oops! Something went wrong while fetching reward information!',
            err);
        return;
      }
      let permString = data.status.join(', ');
      self.common.reply(
          msg, 'Thank you for supporting SpikeyRobot!\n' +
              'Here are your current rewards: ' + permString,
          'https://www.patreon.com/campbellcrowley');
    }
    fetchPatreonRow(msg.author.id, getPerms);
  }

  /**
   * Basic callback function that has two parameters. One with error
   * information, and the other with data if there was no error.
   * @callback Patreon~basicCB
   * @param {?string} err The error string, or null if no error.
   * @param {?{status: *, message: string}} data The returned data if there was
   * no error.
   */

  /**
   * The object to put into the {@link SpikeyBot} object. This contains all of
   * the public data available through that interface. Data will be available
   * after {@link Patreon.initialize} has been called, at `SpikeyBot.patreon`.
   */
  function toExport() {};

  /**
   * Check that a user or channel or guild has permission for something. Checks
   * overrides for each, and if the user does not have an override, the request
   * is forwarded to {@link toExport.checkPerm}.
   * @public
   *
   * @param {?string|number} uId The Discord user ID to check.
   * @param {?string|number} cId The Discord channel ID to check.
   * @param {?string|number} gId The Discord guild ID to check.
   * @param {?string} perm The permission string to check against. Null to check
   * for overrides only.
   * @param {Patreon~basicCB} cb Callback with parameters for error and success
   * values.
   * @param {boolean} cb.data.status If the given IDs have permission.
   */
  toExport.checkAllPerms = function(uId, cId, gId, perm, cb) {
    switch (gId) {
      case '318603252675379210': // Games
        cb(null, {status: true, message: 'Guild has override.'});
        return;
    }
    switch (cId) {
      case '420045412679024660': // #bottesting
        cb(null, {status: true, message: 'Channel has override.'});
        return;
    }
    switch (uId) {
      case self.common.spikeyId:
      case '126464376059330562': // Rohan
        cb(null, {status: true, message: 'User has override.'});
        return;
    }

    if (uId && perm) {
      toExport.checkPerm(uId, perm, cb);
    } else {
      cb(null, {status: false, message: 'User does not have permission.'});
    }
  };

  /**
   * Fetch all permissions for a given user, channel, or guild.
   *
   * @public
   * @param {?string|number} uId The ID of the Discord user.
   * @param {?string|number} cId The Discord channel ID.
   * @param {?string|number} gId The Discord guild ID.
   * @param {Patreon~basicCB} cb Callback once operation is complete.
   */
  toExport.getAllPerms = function(uId, cId, gId, cb) {
    toExport.checkAllPerms(uId, cId, gId, null, onGetOverrides);
    /**
     * Handle response from checking IDs for overrides.
     * @private
     * @type {Patreon~basicCB}
     * @param {?string} err The error string, or null if no error.
     * @param {?{status: boolean, message: string}} info The returned data if
     * there was no error.
     */
    function onGetOverrides(err, info) {
      if (info.status) {
        getPerms(
            null,
            {status: {pledge: Number.MAX_SAFE_INTEGER}, message: info.message});
      } else {
        fetchPatreonRow(uId, getPerms);
      }
    }
    /**
     * Verifies that valid data was found, then fetches all permissions fot the
     * user's pledge amount.
     * @private
     * @type {Patreon~basicCB}
     * @param {?string} err The error string, or null if no error.
     * @param {?{status: Object, message: string}} data The returned data if
     * there was no error.
     */
    function getPerms(err, data) {
      if (err) {
        cb(err, null);
        return;
      }
      const pledgeAmount = data.status.pledge;
      if (!pledgeAmount || isNaN(Number(pledgeAmount))) {
        cb('User is not pledged', null);
        return;
      }
      toExport.getLevelPerms(pledgeAmount, false, onGetPerms);
    }
    /**
     * Verifies that valid data was found, then fetches all permissions fot the
     * user's pledge amount.
     * @private
     * @type {Patreon~basicCB}
     * @param {?string} err The error string, or null if no error.
     * @param {?{status: string[], message: string}} data The returned data if
     * there was no error.
     */
    function onGetPerms(err, data) {
      if (err) {
        cb(err, null);
        return;
      }
      cb(null, data);
    }
  };

  /**
   * Check that a user has a specific permission. Permissions are defined in
   * {@link Patreon~patreonTierPermFile}.
   * @public
   *
   * @param {string|number} uId The Discord user ID to check.
   * @param {string} perm The permission string to check against.
   * @param {Patreon~basicCB} cb Callback with parameters for error and success
   * values.
   * @param {boolean} cb.data.status If the user has permission.
   */
  toExport.checkPerm = function(uId, perm, cb) {
    /**
     * Checks the received data from the Patreon table against the given perm
     * string.
     * @private
     * @type {Patreon~basicCB}
     * @param {?string} err The error string, or null if no error.
     * @param {?{status: Object, message: string}} data The returned data if
     * there was no error.
     */
    function checkPerm(err, data) {
      if (err) {
        cb(err, data);
        return;
      }
      const pledgeAmount = data.status.pledge;
      if (!pledgeAmount || isNaN(Number(pledgeAmount))) {
        cb(null, {status: false, message: 'User is not currently pledged.'});
        return;
      }
      for (let i = 0; i < patreonTiers.length; i++) {
        for (let j = 0; j < patreonTiers[i][1].length; j++) {
          if (patreonTiers[i][1][j] == perm) {
            if (patreonTiers[i][0] <= pledgeAmount) {
              cb(null, {status: true, message: 'User has permission.'});
              return;
            }
          }
        }
      }
      cb(null, {status: false, message: 'User does not have permission.'});
    }
    fetchPatreonRow(uId, checkPerm);
  };

  /**
   * Responds with all permissions available at the given pledge amount.
   * @public
   *
   * @param {number} pledgeAmount The amount in cents that the user has pledged.
   * @param {boolean} exclusive Only get the rewards received at the exact
   * pledge amount. Does not show all tier rewards below the pledge amount.
   * @param {Patreon~basicCB} cb Callback with parameters for error and success
   * values.
   * @param {string[]} cb.data.status All of the permission strings.
   */
  toExport.getLevelPerms = function(pledgeAmount, exclusive, cb) {
    let output = [];
    for (let i = 0; i < patreonTiers.length; i++) {
      if (patreonTiers[i][0] <= pledgeAmount) {
        if (exclusive && patreonTiers[i][0] != pledgeAmount) continue;
        output = output.concat(patreonTiers[i][1]);
      }
    }
    cb(null, {status: output, message: 'Success'});
  };

  /**
   * Get the Patreon information for a given Discord user.
   * @private
   * @param {string|number} uId The Discord user ID to check.
   * @param {Patreon~basicCB} cb Callback with parameters for error and success
   * values.
   * @param {?Object} cb.data.status A single row if it was found.
   */
  function fetchPatreonRow(uId, cb) {
    /**
     * SQL query response callback for request to the Discord table.
     * @private
     * @param {Error} err Errors during the query.
     * @param {Array} rows The reqults of the query.
     */
    function receivedDiscordRow(err, rows) {
      if (err) {
        self.error('Failed to lookup user in Discord: ' + uId);
        console.error(err);
        cb('Failed to find user in database.', null);
        return;
      }
      if (!rows || rows.length != 1) {
        cb('User has not connected their Patreon ' +
               'account to their Discord account.',
           null);
        return;
      }
      const user = rows[0];
      if (!user.patreonId) {
        cb('User has not connected their Patreon ' +
               'account to their Discord account.',
           null);
        return;
      }
      const toSend = sqlCon.format(
          'SELECT * FROM Patreon WHERE id=? LIMIT 1', [user.patreonId]);
      sqlCon.query(toSend, receivedPatreonRow);
    }
    /**
     * SQL query response callback for request to the Patreon table.
     * @private
     * @param {Error} err Errors during the query.
     * @param {Array} rows The reqults of the query.
     */
    function receivedPatreonRow(err, rows) {
      if (err) {
        self.error('Failed to lookup user in Patreon: ' + uId);
        console.error(err);
        cb('Failed to find user in database.', null);
        return;
      }
      if (!rows || rows.length != 1) {
        cb('User has never pledged.', null);
        return;
      }
      cb(null, {status: rows[0], message: 'Success'});
    }

    const toSend =
        sqlCon.format('SELECT * FROM Discord WHERE id=? LIMIT 1', [uId]);
    sqlCon.query(toSend, receivedDiscordRow);
  }
}
module.exports = new Patreon();
