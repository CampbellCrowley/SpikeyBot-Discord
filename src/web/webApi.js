// Copyright 2018-2020 Campbell Crowley. All rights reserved.
// Author: Campbell Crowley (dev@campbellcrowley.com)
const fs = require('fs');
const http = require('http');
const https = require('https');
const auth = require('../../auth.js');
const crypto = require('crypto');
const sIOClient = require('socket.io-client');
const SubModule = require('../subModule.js');

delete require.cache[require.resolve('./WebUserData.js')];
const WebUserData = require('./WebUserData.js');
delete require.cache[require.resolve('./ApiEndpoint.js')];
const ApiEndpoint = require('./ApiEndpoint.js');
delete require.cache[require.resolve('./ApiRequestBody.js')];
const ApiRequestBody = require('./ApiRequestBody.js');

const basicAuth = 'Basic ' +
    (auth.commandUsername + ':' + auth.commandPassword).toString('base64');

/**
 * @classdesc Handles receiving webhooks and other API requests from external
 * services.
 * @class
 * @augments SubModule
 */
class WebApi extends SubModule {
  /**
   * Creates SubModule instance.
   */
  constructor() {
    super();
    this.myName = 'WebAPI';
    /**
     * @description Web server listening for requests, fires
     * {@link WebCommands._handler} on requests.
     *
     * @private
     * @type {?http.Server}
     */
    this._app = null;

    /**
     * @description Data representing available API endpoints, and where to
     * redirect data.
     *
     * @private
     * @type {object.<ApiEndpoint>}
     * @constant
     * @default
     */
    this._endpoints = {
      'hg': new ApiEndpoint('hg', 'http://localhost:8011', 'hg/'),
      'hg-dev': new ApiEndpoint('hg-dev', 'http://localhost:8013', 'dev/hg/'),
      'account':
          new ApiEndpoint('account', 'http://localhost:8014', 'account/'),
      'account-dev': new ApiEndpoint(
          'account-dev', 'http://localhost:8015', 'dev/account/'),
      'settings':
          new ApiEndpoint('settings', 'http://localhost:8020', 'control/'),
      'settings-dev': new ApiEndpoint(
          'settings-dev', 'http://localhost:8021', 'dev/control/'),
    };

    /**
     * @description File storing website rate limit specifications.
     *
     * @private
     * @type {string}
     * @constant
     * @default
     */
    this._rateLimitFile = './save/webRateLimits.json';

    /**
     * @description History of requests for rate limiting purposes, mapped by
     * user token.
     *
     * @private
     * @type {object}
     * @constant
     * @default
     */
    this._rateHistory = {};

    /**
     * Object storing parsed rate limit info from {@link WebApi~_rateLimitFile}.
     *
     * @private
     * @type {object}
     * @default
     */
    this._rateLimits = {
      commands: {},
      groups: {global: {num: 2, delta: 2}},
    };

    this._handler = this._handler.bind(this);
  }

  /** @inheritdoc */
  initialize() {
    if (this.common.isSlave) {
      this.error(
          'This submodule will not work on a slave shard. Refusing to start.');
      return;
    }
    this._app = http.createServer(this._handler);
    setTimeout(() => {
      this._app.listen(this.common.isRelease ? 8018 : 8019, '127.0.0.1');
    });
    this._app.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        this.debug(
            'Webhooks failed to bind to port because it is in use. (' +
            err.port + ')');
        this.shutdown(true);
      } else {
        this.error('Webhooks failed to bind to port for unknown reason.', err);
      }
    });
    this._updateRateLimits();
    fs.watchFile(this._rateLimitFile, {persistent: false}, (curr, prev) => {
      if (curr.mtime == prev.mtime) return;
      this.debug('Re-reading rate limits from file');
      this._updateRateLimits();
    });
  }
  /** @inheritdoc */
  shutdown() {
    fs.unwatchFile(this._rateLimitFile);
    if (this._app) {
      this._app.close();
      this._app = null;
    }
  }

  /**
   * @description Get the host data for requesting game information from Twitch.
   * @private
   * @static
   * @returns {object} Default header information.
   */
  static get _fetchGameHost() {
    return {
      protocol: 'https:',
      host: 'api.twitch.tv',
      path: '/helix/games?id=',
      method: 'GET',
      headers: {
        'User-Agent': require('../common.js').ua,
        'Client-ID': auth.twitchID,
      },
    };
  }

  /**
   * Handler for all http requests.
   *
   * @private
   * @param {http.IncomingMessage} req The client's request.
   * @param {http.ServerResponse} res Our response to the client.
   */
  _handler(req, res) {
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress ||
        'ERROR';
    const url = req.url.replace(/^\/www.spikeybot.com(?:\/dev)?/, '');
    if (url.startsWith('/api')) {
      this._apiRequest(req, res, url, ip);
    } else if (url === '/webhook/twitch/') {
      if (req.method === 'GET') {
        this._twitchConfirmation(req, res, url, ip);
      } else if (req.method === 'POST') {
        this._twitchWebhook(req, res, url, ip);
      } else {
        res.writeHead(405);
        res.end();
        this.common.log(
            'Requested endpoint with invalid method: ' + req.method + ' ' +
                req.url + ' ' + url + ' ' + req.headers['queries'],
            ip);
      }
    } else if (req.method !== 'POST') {
      res.writeHead(405);
      res.end();
      this.common.log(
          'Requested endpoint with invalid method: ' + req.method + ' ' +
              req.url + ' ' + url,
          ip);
    } else if (url.startsWith('/webhook/botstart')) {
      this.common.logDebug('Bot start webhook request: ' + req.url, ip);
      let content = '';
      req.on('data', (chunk) => content += chunk);
      req.on('end', () => {
        this.debug('Bot start webhook content: ' + content);
        res.writeHead(204);
        res.end();
      });
    } else if (!url.startsWith('/webhook')) {
      res.writeHead(501);
      res.end();
      this.common.log('Requested non-existent endpoint: ' + req.url, ip);
    } else if (req.headers.authorization !== basicAuth) {
      this.common.error(
          'Requested webhook with incorrect authorization header: ' +
              req.headers.authorization,
          ip);
      res.writeHead(401);
      res.end();
    } else {
      let content = '';
      req.on('data', (chunk) => content += chunk);
      req.on('end', () => {
        console.log(content);
        res.writeHead(204);
        res.end();
      });
    }
  }

  /**
   * @description Handles requests to the API endpoint.
   *
   * @private
   * @param {http.IncomingMessage} req Client request.
   * @param {http.ServerResponse} res Server response.
   * @param {string} url The requested url. Generally a similar or slightly
   * modified version of `req.url`.
   * @param {string} ip IP for logging purposes.
   */
  _apiRequest(req, res, url, ip) {
    const match = url.match(
        /^\/api\/(?<endpoint>[^/]+){1}\/(?<cmd>[^/]+){1}(?:\/(?<args>.*))?$/);

    if (!match || !match.groups.endpoint || !match.groups.cmd ||
        !this._endpoints[match.groups.endpoint]) {
      this.common.logDebug(`API Unknown: ${url} ${JSON.stringify(match)}`, ip);
      res.writeHead(404);
      res.end('404: Not Found');
      return;
    }

    const token = req.headers.authorization;
    if (!token || token.length == 0) {
      this.common.logDebug(`API NOTOKEN: ${url}`, ip);
      res.writeHead(401);
      res.end('401: Unauthorized');
      return;
    }

    const rateInfo = this._checkRateLimit(match.groups.cmd, token);
    res.setHeader('X-RateLimit-Limit', rateInfo.limit);
    res.setHeader('X-RateLimit-Remaining', rateInfo.remaining);
    res.setHeader('X-RateLimit-Bucket', rateInfo.group);

    if (rateInfo.exceeded) {
      res.writeHead(429);
      res.end();
      return;
    }

    const ep = this._endpoints[match.groups.endpoint];
    // const args = match.groups.args && match.grous.args.split('/');

    let reqData = null;
    let userData = null;
    const self = this;

    const checkDone = function() {
      if (reqData && userData && res) {
        self._apiReady(userData, reqData, res, ip);
      }
    };

    let body = '';
    req.on('data', (chunk) => body += chunk);
    req.on('end', () => {
      try {
        reqData = ApiRequestBody.from(JSON.parse(body), match.groups.cmd);
        reqData.endpoint = ep;
        checkDone();
      } catch (err) {
        this.common.error('Failed to parse request body: ' + url, ip);
        res.writeHead(400);
        res.end('400: Bad Request');
        return;
      }
    });

    const toSend = global.sqlCon.format(
        'SELECT id FROM Discord WHERE apiToken=?', [token]);
    global.sqlCon.query(toSend, (err, rows) => {
      if (err) {
        this.common.error('SQL query for user API token failed.', ip);
        console.error(err);
        res.writeHead(500);
        res.end('500: Internal Server Error');
        return;
      }
      if (!rows || rows.length === 0 || !rows[0].id) {
        this.common.logDebug(`API BADTOKEN: ${url}`, ip);
        res.writeHead(401);
        res.end('401: Unauthorized');
        return;
      }
      userData = new WebUserData(rows[0].id);
      userData.apiRequest = true;
      checkDone();
    });
  }

  /**
   * @description All necessary request data has been collected for an endpoint.
   * Handle finally firing request internally.
   *
   * @private
   * @param {WebUserData} userData The user data for the request.
   * @param {ApiRequestBody} reqData Data sent in body of request to send to
   * endpoint.
   * @param {http.ServerResponse} res Our response to the api request.
   * @param {string} ip Client IP for logging.
   */
  _apiReady(userData, reqData, res, ip) {
    // Technically the 503 (Service Unavailable) responses should probably be a
    // 504 (Gateway Timeout) error, but for the sake of the API endpoint, the
    // client will see this as the final server failing to process the request,
    // which is semantically clearer to the user.
    const socket = sIOClient(reqData.endpoint.host, {
      path: reqData.endpoint.path,
      extraHeaders: {'x-forwarded-for': ip},
      reconnection: false,
      timeout: 5000,
    });
    socket.on('connect', () => {
      const reqTimeout = setTimeout(() => {
        this.common.logDebug(
            'No response from endpoint request: ' +
                (reqData.cmd || 'NO COMMAND'),
            ip);
        socket.close();
        res.writeHead(404);
        res.end('404: Not Found');
      }, 5000);
      const ud = userData.serializable;
      socket.emit(reqData.cmd, ud, ...reqData.args, (err, ...response) => {
        clearTimeout(reqTimeout);
        socket.close();
        this.common.logDebug(
            'Fullfilled API Request: ' + reqData.endpoint.name + ' (err: ' +
            !!err + ', ' + reqData.cmd + ')');
        if (err) {
          res.writeHead(400, {'content-type': 'application/json'});
          res.end(JSON.stringify({message: err}));
        } else if (!response || response.length === 0) {
          res.writeHead(204);
          res.end();
        } else {
          res.writeHead(200, {'content-type': 'application/json'});
          res.end(JSON.stringify({message: 'Success', args: response}));
        }
      });
    });
    socket.on('connect_error', (err) => {
      this.common.logDebug(
          'Failed to connect to endpoint: ' + reqData.endpoint.name, ip);
      console.error(err);
      res.writeHead(503);
      res.end('503: Service Unavailable');
    });
  }

  /**
   * Check if this current connection or user is being rate limited.
   *
   * @private
   * @param {string} cmd The command being run.
   * @param {string} token The user's token used, equivalent of the user ID for
   * purposes of rate limiting.
   * @returns {{
   *   exceeded: boolean,
   *   limit: number,
   *   remaining: number,
   *   group: string
   * }} Current rate limiting information for the given request and user data.
   */
  _checkRateLimit(cmd, token) {
    const now = Date.now();
    const group = this._rateLimits.commands[cmd] || 'global';

    if (!this._rateHistory[token]) this._rateHistory[token] = [];
    const history = this._rateHistory[token];
    history.push({time: now, cmd: cmd});

    let num = 0;

    for (let i = 0; i < history.length; i++) {
      const g = this._rateLimits.commands[history[i].cmd] || 'global';
      const limits =
          this._rateLimits.groups[g] || this._rateLimits.groups['global'];
      if (now - history[i].time > limits.delta * 1000) {
        history.splice(i, 1);
        i--;
      } else if (group === g) {
        num++;
      }
    }

    if (history.length === 0) delete this._rateHistory[token];

    const limit = this._rateLimits.groups[group].num;
    return {
      exceeded: num > limit,
      limit: limit,
      remaining: limit - num,
      group: group,
    };
  }
  /**
   * Parse rate limits from file.
   *
   * @private
   */
  _updateRateLimits() {
    fs.readFile(this._rateLimitFile, (err, data) => {
      if (err) {
        this.error('Failed to read ' + this._rateLimitFile);
        return;
      }
      try {
        const parsed = JSON.parse(data);
        if (!parsed) return;
        this._rateLimits = parsed;
      } catch (e) {
        console.error(e);
      }
    });
  }

  /**
   * @description Handle a request from Twitch to confirm adding a webhook to
   * this endpoint.
   * @private
   * @param {http.IncomingMessage} req Client request.
   * @param {http.ServerResponse} res Server response.
   * @param {string} url The requested url. Generally a similar or slightly
   * modified version of `req.url`.
   * @param {string} ip IP for logging purposes.
   */
  _twitchConfirmation(req, res, url, ip) {
    const query = req.headers['queries'];
    if (!query || query.length < 2) {
      this.common.logDebug('400: ' + req.url + ' ' + query, ip);
      res.writeHead(400);
      res.end();
      return;
    }

    const queries = {};
    query.split('&').forEach((el) => {
      const pair = el.split('=');
      queries[pair[0]] = pair[1];
    });
    const decode =
        queries['hub.topic'] && decodeURIComponent(queries['hub.topic']);
    const match = decode && decode.match(/user_id=(\d+)/);
    const id = match && match[1];
    if (!id) {
      this.common.logDebug(
          '403 Invalid ID: ' + decode + ' ' + req.url + ' ' + query, ip);
      res.writeHead(403);
      res.end('403: Forbidden. Invalid ID.');
      return;
    }

    const toSend = global.sqlCon.format(
        'SELECT streamChangedState FROM TwitchUsers WHERE id=?', [id]);
    global.sqlCon.query(toSend, (err, rows) => {
      if (err) {
        this.common.logDebug('500: ' + req.url + ' ' + query, ip);
        this.common.error(
            'Failed to check if attempting to Twitch confirm webhook: ' + id,
            ip);
        console.log(err);
        res.writeHead(500);
        res.end('500: Internal Server Error');
        return;
      }
      if (rows && rows[0] && rows[0].streamChangedState >= 1) {
        this.common.logDebug('200 Confirming: ' + req.url + ' ' + query, ip);
        res.writeHead(200);
        res.end(queries['hub.challenge']);

        const toSend = global.sqlCon.format(
            'UPDATE TwitchUsers SET streamChangedState=2, expiresAt=' +
                'FROM_UNIXTIME(?) WHERE id=?',
            [
              Math.floor(Date.now() / 1000) + queries['hub.lease_seconds'] * 1,
              id,
            ]);
        global.sqlCon.query(toSend, (err) => {
          if (err) {
            this.common.error(
                'Failed to update streamChangedState to confirmed: ' + id, ip);
            console.log(err);
            res.writeHead(500);
            res.end('500: Internal Server Error');
            return;
          }
        });
      } else {
        this.common.logDebug(
            '403 Invalid ID: ' +
                ' ' + (rows && rows[0] && rows[0].streamChangedState) + ' ' +
                req.url + ' ' + query,
            ip);
        res.writeHead(403);
        res.end('403: Forbidden. Invalid ID.');
      }
    });
  }

  /**
   * @description Handle a webhook event from Twitch.
   * @private
   * @param {http.IncomingMessage} req Client request.
   * @param {http.ServerResponse} res Server response.
   * @param {string} url The requested url. Generally a similar or slightly
   * modified version of `req.url`.
   * @param {string} ip IP for logging purposes.
   */
  _twitchWebhook(req, res, url, ip) {
    const query = req.headers['queries'];
    const link = req.headers['link'];
    this.common.log(
        'Twitch Webhook: ' + req.url + ' ' + query + ' LINK:' + link, ip);
    let content = '';
    req.on('data', (c) => content += c);
    req.on('end', () => {
      const hmac = crypto.createHmac('sha256', auth.twitchSubSecret);
      hmac.update(content);
      const sig = `sha256=${hmac.digest('hex')}`;
      const sigReq = req.headers['x-hub-signature'];
      const verified = sig === sigReq;
      if (!verified) {
        this.common.error('Failed to verify webhook signature!');
        console.error(
            'Lengths:', req.headers['content-length'], content.length,
            'Signatures:', sigReq, sig);
        res.writeHead(403);
        res.end('403: Forbidden');
        return;
      }
      let parsed;
      try {
        parsed = JSON.parse(content);
      } catch (err) {
        this.common.logDebug(
            'Failed to parse body of Twitch Webhook: ' + content, ip);
        console.error(err);
        res.writeHead(400);
        res.end('400: Bad Request');
        return;
      }
      const data = parsed.data && parsed.data[0];
      if (parsed.data && parsed.data.length === 0) {
        const user = link && link.match(/user_id=(\d+)/);
        this.common.logDebug(
            `Empty webhook from Twitch: ${content} User: (${user && user[1]})`,
            ip);
        res.writeHead(204);
        res.end();
        if (user && user[1]) this._twitchStreamEnd(user[1]);
        return;
      } else if (!data) {
        this.common.logDebug(
            'Invalid webhook body from Twitch: ' + content, ip);
        res.writeHead(400);
        res.end('400: Bad Request');
        return;
      }
      this.common.logDebug('Twitch Webhook: ' + content, ip);
      res.writeHead(204);
      res.end();
      this._fetchWebhookMetadata(data.user_id, data.game_id, content, data);
    });
  }
  /**
   * @description Fetch the necessary data for the parsed webhook request, then
   * continue to sending alerts.
   * @private
   * @param {string} userId The Twitch user ID the request is for.
   * @param {string} gameId The Twitch game ID the user is playing.
   * @param {string} content Full content string from the webhook to
   * re-broadcast to shards.
   * @param {object} [data={}] Parsed content to object. Allows for additional
   * metadata to be stored and to prevent duplicate alerts.
   */
  _fetchWebhookMetadata(userId, gameId, content, data={}) {
    let ids;

    const numTotal = 3;
    let numDone = 0;
    const self = this;
    const check = function() {
      if (++numDone < numTotal) return;
      self._twitchFinal(ids, content);
    };

    const insert = function(skip) {
      let str = 'INSERT INTO TwitchStreams SET user=?, game=?, title=?';
      if (startTime) str += ', startTime=FROM_UNIXTIME(?)';
      const toSend = global.sqlCon.format(
          str, [userId, gameId || '', title, new Date(startTime).getTime()]);
      global.sqlCon.query(toSend, (err) => {
        if (err) {
          self.error('Failed to insert stream database info: ' + userId);
          console.error(err);
        }
        if (!skip) check();
      });
    };

    if (gameId && gameId.length > 0) {
      this.fetchGameData(gameId, check);
    } else {
      check();
    }

    const toSend = global.sqlCon.format(
        'SELECT * FROM TwitchDiscord WHERE twitchId=? AND bot=?',
        [userId, this.client.user.id]);
    global.sqlCon.query(toSend, (err, rows) => {
      if (err) {
        this.error('Failed to fetch TwitchDiscord database info: ' + userId);
        console.error(err);
        return;
      }
      ids = JSON.stringify(rows.map((el) => el.channel));
      check();
    });

    const title = data.title || null;
    const startTime = data.started_at || null;
    const str = 'SELECT * FROM TwitchStreams WHERE user=? AND game=? AND ' +
        'TIMESTAMPDIFF(MINUTE, startTime, NOW()) < 60 && title=?';
    const toSend2 = global.sqlCon.format(str, [userId, gameId, title]);
    global.sqlCon.query(toSend2, (err, rows) => {
      if (err) {
        this.error('Failed to check stream history database info: ' + userId);
        console.error(err);
        return;
      }
      if (rows && rows.length > 0) {
        this.debug(
            'Aborting twitch alert due to recent identical alert: ' + userId);
        insert(true);
        return;
      }
      insert();
    });
  }
  /**
   * @description Handle a user's stream ending.
   * @private
   * @param {string} userId The user's ID of which the stream has ended.
   */
  _twitchStreamEnd(userId) {
    const str =
        'UPDATE TwitchStreams SET endTime=FROM_UNIXTIME(?) WHERE user=? ' +
        'ORDER BY id DESC LIMIT 1';
    const toSend = global.sqlCon.format(str, [Date.now(), userId]);
    global.sqlCon.query(toSend, (err) => {
      if (err) {
        this.error('Failed to update stream end time database info: ' + userId);
        console.error(err);
      } else {
        this.debug('Updated stream end time: ' + userId);
      }
    });
  }
  /**
   * @description Fetch a Twitch game information from its ID.
   * @public
   * @param {string} gameId The ID of the game to fetch.
   * @param {Function} cb First parameter is an optional error string, otherwise
   * the second parameter is the fetched data object.
   */
  fetchGameData(gameId, cb) {
    const toSend = global.sqlCon.format(
        'SELECT * FROM TwitchGames WHERE id=? AND ' +
            'TIMESTAMPDIFF(DAY, lastModified, NOW()) <= 7',
        [gameId]);
    global.sqlCon.query(toSend, (err, rows) => {
      if (err) {
        this.warn('Failed to fetch TwitchGames database info: ' + gameId);
        console.error(err);
        cb('DB_FAILED');
        return;
      }
      if (rows && rows.length > 0) {
        cb(null, rows[0]);
      } else {
        const host = WebApi._fetchGameHost;
        host.path += encodeURIComponent(gameId);
        const req = https.request(host, (res) => {
          let content = '';
          res.on('data', (chunk) => content += chunk);
          res.on('end', () => {
            if (res.statusCode == 200) {
              this._parseTwitchGameResponse(content, cb);
            } else {
              this.error(res.statusCode + ': ' + content);
              console.error(host);
              cb(res.statusCode + ' from Twitch');
            }
          });
        });
        req.end();
      }
    });
  }
  /**
   * @description Parse the response from Twitch containing information about a
   * game.
   * @private
   * @param {string} content Received content from request to Twitch API.
   * @param {Function} cb First parameter is optional error string, otherwise
   * the second parameter is the game object.
   */
  _parseTwitchGameResponse(content, cb) {
    try {
      const parsed = JSON.parse(content);
      const data = parsed.data && parsed.data[0];
      if (!data) {
        cb(null, null);
        return;
      }
      const toSend = global.sqlCon.format(
          'INSERT INTO TwitchGames SET id=?, name=?, thumbnailUrl=? ' +
              'ON DUPLICATE KEY UPDATE name=?, thumbnailUrl=?',
          [data.id, data.name, data.box_art_url, data.name, data.box_art_url]);
      global.sqlCon.query(toSend, (err) => {
        if (err) {
          this.error(
              'Failed to update TwitchGames data after fetching game: ' +
              data.name + ' ' + data.id);
          console.log(err);
        }
        cb(null, {
          id: data.id,
          name: data.name,
          thumbnailUrl: data.box_art_url,
          lastModified: new Date().toUTCString(),
        });
      });
    } catch (err) {
      this.error('Failed to parse response from Twitch');
      console.error(err, content);
      cb('Bad Response');
      return;
    }
  }
  /**
   * @description All data has been received for a Twitch webhook request, and
   * is ready to be sent to our shards for re-broadcast and alerting.
   * @private
   * @param {string} ids Encoded array of ids to broadcast to shards.
   * @param {string} content Encoded content string to broadcast to shards.
   */
  _twitchFinal(ids, content) {
    const toEval = `this.twitchWebhookHandler(${ids}, ${content})`;
    if (this.common.isMaster) {
      process.send({_sEval: toEval}, (err) => {
        if (!err) return;
        this.common.error('Failed to send broadcast to parent process!');
        console.error(err);
      });
    } else if (this.client.shard) {
      this.client.shard.broadcastEval(toEval).catch((err) => {
        this.error('Failed to broadcast webhook handler to shards.');
        console.error(err);
      });
    } else {
      const sm = this.bot.getSubmodule('./twitch.js');
      if (!sm) return;
      sm.webhookHandler(ids, content);
    }
  }
}
module.exports = new WebApi();
