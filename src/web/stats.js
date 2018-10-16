// Copyright 2018 Campbell Crowley. All rights reserved.
// Author: Campbell Crowley (dev@campbellcrowley.com)
const http = require('http');
const https = require('https');
const auth = require('../../auth.js');
require('../subModule.js')(WebStats); // Extends the SubModule class.

/**
 * @classdesc Handles sending the bot's stats to http client requests, and
 * discordbots.org.
 * @class
 * @augments SubModule
 */
function WebStats() {
  self = this;

  this.myName = 'Stats';

  let app;
  /** @inheritdoc */
  this.initialize = function() {
    app = http.createServer(handler);
    setTimeout(() => {
      postUpdatedCount();
      app.listen(self.common.isRelease ? 8016 : 8017);
      postTimeout = self.client.setTimeout(postUpdatedCount, postFrequency);
    });
  };
  /** @inheritdoc */
  this.shutdown = function(skipSave) {
    if (app) app.close();
    if (postTimeout) self.client.clearTimeout(postTimeout);
  };

  /**
   * The timestamp at which the stats were last requested.
   * @private
   * @default
   * @type {number}
   */
  let cachedTime = 0;
  /**
   * The amount of time the cached data is considered fresh. Anything longer
   * than this must be re-fetched.
   * @private
   * @constant
   * @default 5 Minutes
   * @type {number}
   */
  const cachedLifespan = 5 * 60 * 1000; // 5 minutes

  /**
   * The object storing the previously received stats values.
   * @private
   * @default
   * @type {Main~getAllStats~values}
   */
  let cachedStats = {};

  /**
   * The amount frequency at which we will post our stats to discordbots.org
   * @private
   * @constant
   * @default 12 Hours
   * @type {number}
   */
  const postFrequency = 12 * 60 * 60 * 1000; // 12 Hours

  /**
   * The next scheduled event at which to post our stats.
   * @private
   * @type {Timeout}
   */
  let postTimeout;

  /**
   * The request information for updating our server count on discordbots.org.
   * @private
   * @default
   * @constant
   */
  const apiHost = {
    protocol: 'https:',
    host: 'discordbots.org',
    path: '/api/bots/{id}/stats',
    method: 'POST',
    headers: {
      'Authorization': auth.discordBotsOrgToken,
      'content-type': 'application/json',
    },
  };

  /**
   * Handler for all http requests. Always replies to res with JSON encoded bot
   * stats.
   *
   * @private
   * @param {http.IncomingMessage} req The client's request.
   * @param {http.ServerResponse} res Our response to the client.
   */
  function handler(req, res) {
    let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress ||
        'ERROR';
    if (req.url.indexOf('/webhook') > -1) {
      res.writeHead(501);
      res.end();
      self.common.log('Requested Webhook that doesn\'t exist yet.', ip);
    } else {
      getStats((stats) => {
        res.writeHead(200, {'content-type': 'application/json'});
        res.end(JSON.stringify(stats));
        self.common.log('Sent stats.', ip);
      });
    }
  }

  /**
   * Fetch the bot's stats.
   * @private
   * @param {Object} cb The bot's stats as an object. {@link
   * Main~getAllStats~values}
   */
  function getStats(cb) {
    if (cachedTime + cachedLifespan < Date.now()) {
      cachedTime = Date.now();
      self.bot.getStats((values) => {
        cachedStats = values;
        cb(values);
      });
    } else {
      cb(cachedStats);
    }
  }

  /**
   * Send our latest guild count to discordbots.org via https post request.
   * @private
   */
  function postUpdatedCount() {
    if (postTimeout) self.client.clearTimeout(postTimeout);
    if (self.client.user.id !== '318552464356016131') return;
    getStats((values) => {
      if (self.client.shard) {
        // @TODO: Update getStats to give the number of guilds each shard is on.
        sendRequest({
          server_count: values.numGuilds,
          shards: [values.numGuilds / values.numShards],
          shard_id: values.reqShard,
          shard_count: values.numShards,
        });
      } else {
        sendRequest({server_count: values.numGuilds});
      }
    });
    /**
     * Send the request after we have fetched our stats.
     * @private
     * @param {{server_count: number, shards: number[], shard_id: number,
     * shard_count: number}} data The data to send in our request.
     */
    function sendRequest(data) {
      let host = apiHost;
      host.path = host.path.replace('{id}', self.client.user.id);
      let body = JSON.stringify(data);
      let req = https.request(host, (res) => {
        let content = '';
        res.on('data', (chunk) => {
          content += chunk;
        });
        res.on('end', () => {
          postTimeout = self.client.setTimeout(postUpdatedCount, postFrequency);
          if (res.statusCode == 200) {
            self.log('Successfully posted guild count to discordbots.org');
          } else {
            self.error('Failed to post guild count to discordbots.org');
            console.error(host, body, content);
          }
        });
      });
      req.end(body);
      req.on('error', console.error);
    }
  }
}

module.exports = new WebStats();
