// Copyright 2018 Campbell Crowley. All rights reserved.
// Author: Campbell Crowley (dev@campbellcrowley.com)
const http = require('http');
const auth = require('../../auth.js');
require('../subModule.js')(WebCommands); // Extends the SubModule class.

const basicAuth = 'Basic ' +
    (auth.commandUsername + ':' + auth.commandPassword).toString('base64');

/**
 * @classdesc Handles sending the bot's stats to http client requests, and
 * discordbots.org.
 * @class
 * @augments SubModule
 */
function WebCommands() {
  self = this;

  this.myName = 'Webhooks';

  let app;
  /** @inheritdoc */
  this.initialize = function() {
    app = http.createServer(handler);
    setTimeout(() => {
      app.listen(self.common.isRelease ? 8018 : 8019);
    });
  };
  /** @inheritdoc */
  this.shutdown = function(skipSave) {
    if (app) app.close();
  };

  /**
   * Handler for all http requests.
   *
   * @private
   * @param {http.IncomingMessage} req The client's request.
   * @param {http.ServerResponse} res Our response to the client.
   */
  function handler(req, res) {
    let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress ||
        'ERROR';
    if (req.url.indexOf('/webhook') < 0) {
      res.writeHead(500);
      res.end();
      self.common.log('Requested non-existent endpoint: ' + req.url, ip);
    } else if (req.method !== 'POST') {
      res.writeHead(405);
      res.end();
      self.common.log(
          'Requested endpoint with invalid method: ' + req.method + ' ' +
              req.url,
          ip);
    } else if (req.headers.authorization !== basicAuth) {
      self.error(
          'Requested webhook with incorrect authorization header: ' +
              req.headers.authorization,
          ip);
      res.writeHead(401);
      res.end();
    } else {
      let content = '';
      req.on('data', (chunk) => {
        content += chunk;
      });
      req.on('end', () => {
        console.log(content);
        res.writeHead(200);
        res.end();
      });
    }
  }
}
module.exports = new WebCommands();
