// Copyright 2018-2019 Campbell Crowley. All rights reserved.
// Author: Campbell Crowley (dev@campbellcrowley.com)
const fs = require('fs');
const http = require('http');
const auth = require('../../auth.js');
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
    this._app = http.createServer(this._handler);
    setTimeout(() => {
      this._app.listen(this.common.isRelease ? 8018 : 8019, '127.0.0.1');
    });
    this._app.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        this.warn(
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
    if (this._app) {
      this._app.close();
      this._app = null;
    }
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
    } else if (req.method === 'GET' && url === '/webhook/twitch/') {
      this.common.log(
          'Requested Twitch: ' + req.url + ' ' + req.headers['queries'], ip);
      const query = req.headers['queries'];
      if (!query || query.length < 2) {
        res.writeHead(400);
        res.end();
        return;
      }

      // TODO: Link to Twitch SM to verify we requested this subscription.

      const queries = {};
      query.split('&').forEach((el) => {
        const pair = el.split('=');
        queries[pair[0]] = pair[1];
      });
      res.writeHead(200);
      res.end(queries['hub.challenge']);
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
      /* } else if (req.headers.authorization !== basicAuth) {
        this.common.error(
            'Requested webhook with incorrect authorization header: ' +
                req.headers.authorization,
            ip);
        res.writeHead(401);
        res.end();
        */
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
}
module.exports = new WebApi();
