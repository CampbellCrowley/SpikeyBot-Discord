// Copyright 2018-2020 Campbell Crowley. All rights reserved.
// Author: Campbell Crowley (dev@campbellcrowley.com)
const http = require('http');
const https = require('https');
const auth = require('../../auth.js');
require('../subModule.js').extend(WebStats);  // Extends the SubModule class.

// TODO: Update this to support master/slave with stats API.

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
    if (self.common.isSlave) {
      self.debug('Starting in minimal mode.');
    } else {
      app.listen(self.common.isRelease ? 8016 : 8017, '127.0.0.1');
    }
    postTimeout =
        setTimeout(postUpdatedCount, self.common.isRelease ? 30000 : 5000);
  };
  /** @inheritdoc */
  this.shutdown = function() {
    if (app) app.close();
    if (postTimeout) clearTimeout(postTimeout);
  };

  app.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      this.debug(
          'Stats failed to bind to port, starting in minimal mode. (' +
          err.port + ')');
      if (app) app.close();
    } else {
      this.error('Webhooks failed to bind to port for unknown reason.', err);
    }
  });

  /**
   * The timestamp at which the stats were last requested.
   *
   * @private
   * @default
   * @type {number}
   */
  let cachedTime = 0;
  /**
   * The amount of time the cached data is considered fresh. Anything longer
   * than this must be re-fetched.
   *
   * @private
   * @constant
   * @default 5 Minutes
   * @type {number}
   */
  const cachedLifespan = 5 * 60 * 1000; // 5 minutes

  /**
   * The object storing the previously received stats values.
   *
   * @private
   * @default
   * @type {Main~getAllStats~values}
   */
  let cachedStats = {};

  /**
   * The amount frequency at which we will post our stats to discordbots.org.
   *
   * @private
   * @constant
   * @default 12 Hours
   * @type {number}
   */
  const postFrequency = 12 * 60 * 60 * 1000; // 12 Hours

  /**
   * The next scheduled event at which to post our stats.
   *
   * @private
   * @type {Timeout}
   */
  let postTimeout;

  const ua = require('../common.js').ua;

  /**
   * The request information for updating our server count on bot list websites.
   *
   * @private
   * @default
   * @constant
   */
  const apiHosts = [
    {
      protocol: 'https:',
      host: 'top.gg',
      path: '/api/bots/{id}/stats',
      method: 'POST',
      headers: {
        'Authorization': auth.discordBotsOrgToken,
        'content-type': 'application/json',
        'User-Agent': ua,
      },
      _data: {
        'server_count': 'guildCount',
        'shard_id': 'shardId',
        'shard_count': 'shardCount',
      },
      _allShards: false,
    },
    /* {
      protocol: 'https:',
      host: 'discordbotlist.com',
      path: '/api/bots/{id}/stats',
      method: 'POST',
      headers: {
        'Authorization': `Bot ${auth.discordBotListComToken}`,
        'content-type': 'application/json',
        'User-Agent': ua,
      },
      _data: {
        'guilds': 'shardGuildCount',
        'shard_id': 'shardId',
        'users': 'shardUserCount',
      },
      _allShards: true,
    }, */
    {
      protocol: 'https:',
      host: 'discord.bots.gg',
      path: '/api/v1/bots/{id}/stats',
      method: 'POST',
      headers: {
        'Authorization': auth.discordBotsGGToken,
        'content-type': 'application/json',
        'User-Agent': ua,
      },
      _data: {
        'guildCount': 'shardGuildCount',
        'shardCount': 'shardCount',
        'shardId': 'shardId',
      },
      _allShards: true,
    },
    {
      protocol: 'https:',
      host: 'bots.ondiscord.xyz',
      path: '/bot-api/bots/{id}/guilds',
      method: 'POST',
      headers: {
        'Authorization': auth.botsOnDiscordXYZKey,
        'content-type': 'application/json',
        'User-Agent': ua,
      },
      _data: {
        'guildCount': 'guildCount',
      },
      _allShards: false,
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
    } else if (req.url.indexOf('/stats/shield') == 0) {
      getStats((stats) => {
        if (!stats) {
          res.writeHead(500, {'content-type': 'application/json'});
          res.end(
              JSON.stringify({code: 500, message: 'Internal Server Error'}));
          self.common.log('Failed to send stats (500): ' + req.url, ip);
        } else {
          res.writeHead(200, {'content-type': 'application/json'});
          const filteredStats = {
            schemaVersion: 1,
            label: 'SpikeyBot Servers',
            message: stats.numGuilds + '',
            color: 'purple',
            cacheSeconds: Math.floor(cachedLifespan / 1000),
          };
          res.end(JSON.stringify(filteredStats));
          self.common.log('Sent stats: ' + req.url, ip);
        }
      });
    } else {
      getStats((stats) => {
        if (!stats) {
          res.writeHead(500, {'content-type': 'application/json'});
          res.end(
              JSON.stringify({code: 500, message: 'Internal Server Error'}));
          self.common.log('Failed to send stats (500): ' + req.url, ip);
        } else {
          res.writeHead(200, {'content-type': 'application/json'});
          res.end(JSON.stringify(stats));
          self.common.log('Sent stats: ' + req.url, ip);
        }
      });
    }
  }

  /**
   * @description Fetch the bot's stats.
   * @see {@link Main~getAllStats~values}
   *
   * @private
   * @param {object} cb The bot's stats as an object.
   */
  function getStats(cb) {
    if (cachedTime + cachedLifespan < Date.now()) {
      cachedTime = Date.now();
      self.bot.getStats((values) => {
        if (values) cachedStats = values;
        else values = cachedStats;
        cb(values);
      });
    } else {
      cb(cachedStats);
    }
  }

  /**
   * Send our latest guild count to discordbots.org via https post request.
   *
   * @private
   */
  function postUpdatedCount() {
    if (postTimeout) clearTimeout(postTimeout);
    getStats((values) => {
      if (!values || !values.numGuilds) {
        self.warn('Unable to post guild count due to failure to fetch stats.');
        return;
      }
      if (!self.client.shard || self.client.shard.ids[0] === 0) {
        self.log('Current Guild Count: ' + values.numGuilds);
      }
      if (self.client.shard) {
        sendRequest({
          guildCount: values.numGuilds,
          userCount: values.numMembers,
          shardId: values.reqShard,
          shardCount: values.numShards,
          shardGuildCount: values.shardGuilds[values.reqShard],
          shardUserCount: values.shardUsers[values.reqShard],
        });
      } else {
        sendRequest({
          guildCount: values.numGuilds,
          userCount: values.numMembers,
        });
      }
    });
    /**
     * Send the request after we have fetched our stats.
     *
     * @private
     * @param {{server_count: number, shards: number[], shard_id: number,
     * shard_count: number}} data The data to send in our request.
     */
    function sendRequest(data) {
      apiHosts.forEach((apiHost) => {
        if (!apiHost._allShards && data.shardId > 0) return;

        const pairs = Object.entries(apiHost._data);
        const body = {};
        pairs.forEach((el) => body[el[0]] = data[el[1]]);

        const host = Object.assign({}, apiHost);
        delete host._data;
        delete host._allShards;
        if (self.client.user) {
          host.path = host.path.replace('{id}', self.client.user.id);
        }

        if (!self.common.isRelease || !host.headers.Authorization ||
            !self.client.user) {
          self.debug(
              'NOOP POST: ' + host.host + host.path + ' ' +
              JSON.stringify(body));
          return;
        }

        const req = https.request(host, (res) => {
          let content = '';
          res.on('data', (chunk) => content += chunk);
          res.on('end', () => {
            if (postTimeout) clearTimeout(postTimeout);
            postTimeout = setTimeout(postUpdatedCount, postFrequency);
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
        req.end(JSON.stringify(body));
        req.on('error', console.error);
      });
    }
  }
}

module.exports = new WebStats();
