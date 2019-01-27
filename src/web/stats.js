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
  const self = this;

  this.myName = 'Stats';

  const app = http.createServer(handler);
  /** @inheritdoc */
  this.initialize = function() {
    postUpdatedCount();
    app.listen(self.common.isRelease ? 8016 : 8017, '127.0.0.1');
    postTimeout = self.client.setTimeout(postUpdatedCount, postFrequency);
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
   * The request information for updating our server count on bot list websites.
   * @private
   * @default
   * @constant
   */
  const apiHosts = [
    {
      protocol: 'https:',
      host: 'discordbots.org',
      path: '/api/bots/{id}/stats',
      method: 'POST',
      headers: {
        'Authorization': auth.discordBotsOrgToken,
        'content-type': 'application/json',
      },
    },
    {
      protocol: 'https:',
      host: 'discordbotlist.com',
      path: '/api/bots/{id}/stats',
      method: 'POST',
      headers: {
        'Authorization': 'Bot ' + auth.discordBotListComToken,
        'content-type': 'application/json',
      },
    },
    {
      protocol: 'https:',
      host: 'discord.bots.gg',
      path: '/api/v1/bots/{id}/stats',
      method: 'POST',
      headers: {
        'Authorization': auth.discordBotsGGToken,
        'content-type': 'application/json',
      },
    },
    {
      protocol: 'https:',
      host: 'bots.ondiscord.xyz',
      path: '/bot-api/bots/{id}/guilds',
      method: 'POST',
      headers: {
        'Authorization': auth.botsOnDiscordXYZKey,
        'content-type': 'application/json',
      },
    },
  ];

  /**
   * Handler for all http requests. Always replies to res with JSON encoded bot
   * stats.
   *
   * @private
   * @param {http.IncomingMessage} req The client's request.
   * @param {http.ServerResponse} res Our response to the client.
   */
  function handler(req, res) {
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress ||
        'ERROR';
    if (req.url.indexOf('/webhook') > -1) {
      res.writeHead(501);
      res.end();
      self.common.log('Requested Webhook that doesn\'t exist yet.', ip);
    } else {
      getStats((stats) => {
        res.writeHead(200, {'content-type': 'application/json'});
        const filteredStats = Object.assign({}, stats);
        filteredStats.activities = 'REDACTED';
        res.end(JSON.stringify(filteredStats));
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
      self.log('Current Guild Count: ' + values.numGuilds);
      if (self.client.shard) {
        sendRequest({
          server_count: values.numGuilds,
          guilds: values.numGuilds,
          guildCount: values.numGuilds,
          users: values.numMembers,
          shards: Object.values(values.shardGuilds),
          shard_id: values.reqShard,
          shardId: values.reqShard,
          shard_count: values.numShards,
          shardCount: values.numShards,
        });
      } else {
        sendRequest({
          server_count: values.numGuilds,
          guilds: values.numGuilds,
          guildCount: values.numGuilds,
        });
      }
    });
    /**
     * Send the request after we have fetched our stats.
     * @private
     * @param {{server_count: number, shards: number[], shard_id: number,
     * shard_count: number}} data The data to send in our request.
     */
    function sendRequest(data) {
      const body = JSON.stringify(data);
      apiHosts.forEach((apiHost) => {
        const host = apiHost;
        host.path = host.path.replace('{id}', self.client.user.id);
        const req = https.request(host, (res) => {
          let content = '';
          res.on('data', (chunk) => {
            content += chunk;
          });
          res.on('end', () => {
            if (postTimeout) self.client.clearTimeout(postTimeout);
            postTimeout =
                self.client.setTimeout(postUpdatedCount, postFrequency);
            if (res.statusCode == 200 || res.statusCode == 204) {
              self.log('Successfully posted guild count to ' + apiHost.host);
            } else {
              self.error(
                  'Failed to post guild count to ' + apiHost.host + ' (' +
                  res.statusCode + ')');
              console.error(host, body, content);
            }
          });
        });
        req.end(body);
        req.on('error', console.error);
      });
    }
  }
}

module.exports = new WebStats();
