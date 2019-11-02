// Copyright 2019 Campbell Crowley. All rights reserved.
// Author: Campbell Crowley (dev@campbellcrowley.com)
const SubModule = require('./subModule.js');
const https = require('https');
const auth = require('../auth.js');

/**
 * @classdesc Handles fetching images and GIFs from various APIs.
 * @class
 * @augments SubModule
 */
class Images extends SubModule {
  /**
   * @description Handles fetching images and GIFs from various APIs.
   */
  constructor() {
    super();
    /** @inheritdoc */
    this.myName = 'Images';

    /**
     * @description Cached responses from recent requests to Imgur's API. Mapped
     * by request path.
     * @private
     * @type {object}
     * @default
     */
    this._imgurCache = {};
    /**
     * @description Cached responses from recent requests to Giphy's API. Mapped
     * by request path.
     * @private
     * @type {object}
     * @default
     */
    this._giphyCache = {};
    /**
     * @description Maximum amount of time to cache a request to Imgur before we
     * purge it.
     * @private
     * @type {number}
     * @default 1 Week
     */
    this._cacheDuration = 7 * 24 * 60 * 60 * 1000;

    this._commandCookie = this._commandCookie.bind(this);
    this._commandImgur = this._commandImgur.bind(this);
    this._commandGiphy = this._commandGiphy.bind(this);
  }
  /** @inheritdoc */
  initialize() {
    this.command.on(
        ['imgur', 'image', 'png', 'jpg', 'jpeg'], this._commandImgur);
    this.command.on(['giphy', 'gif', 'giph'], this._commandGiphy);
    this.command.on(['cookie', 'cookies'], this._commandCookie);
  }
  /** @inheritdoc */
  shutdown() {
    this.command.removeListener('imgur');
    this.command.removeListener('giphy');
    this.command.removeListener('cookie');
  }

  /**
   * @description Fetch the default host information for making a request to
   * imgur.
   * @public
   * @static
   * @returns {object} Object to pass to https request.
   */
  static get imgurHost() {
    return {
      protocol: 'https:',
      host: 'api.imgur.com',
      path: '/3/',
      method: 'GET',
      headers: {
        'User-Agent': require('./common.js').ua,
        'Authorization': 'Client-ID ' + auth.imgurID,
        'Content-Type': 'application/json',
      },
    };
  }

  /**
   * @description Fetch the default host information for making a request to
   * giphy.
   * @public
   * @static
   * @returns {object} Object to pass to https request.
   */
  static get giphyHost() {
    return {
      protocol: 'https:',
      host: 'api.giphy.com',
      path: '/v1/',
      method: 'GET',
      headers: {
        'User-Agent': require('./common.js').ua,
        'Authorization': 'Client-ID ' + auth.imgurID,
        'Content-Type': 'application/json',
      },
    };
  }

  /**
   * @description Performs a get request to Imgur's API at the given path, and
   * caches the result before returning it through the callback. If a cached
   * response is available that isn't too old, that will immediately be returned
   * instead.
   * @private
   * @param {string} path The full API path after the domain and API version.
   * Includes query parameters.
   * @param {Function} cb Callback once completed or failed. First parameter is
   * optional error, second is otherwise the parsed JSON object from Imgur.
   */
  _imgurGet(path, cb) {
    if (this._imgurCache[path]) {
      if (Date.now() - this._imgurCache[path].timestamp < this._cacheDuration) {
        cb(null, this._imgurCache[path].data);
        return;
      } else {
        // update timestamp to prevent multiple requests at the same time before
        // the first completes.
        this._imgurCache[path].timestamp = Date.now();
      }
    }
    const host = Images.imgurHost;
    host.path += path;
    const req = https.request(host, (res) => {
      let content = '';
      res.on('data', (chunk) => content += chunk);
      res.on('end', () => {
        if (res.statusCode == 200) {
          try {
            content = JSON.parse(content);
            this._imgurCache[path] = {data: content, timestamp: Date.now()};
          } catch (err) {
            this.error('Imgur Unable to parse response to ' + path);
            console.error(err);
            cb(err);
            return;
          }
          cb(null, content);
        } else {
          this.error('Imgur ' + res.statusCode + ': ' + content);
          console.error(host);
          cb(new Error('Imgur Bad Response'));
        }
      });
    });
    req.end();
  }

  /**
   * @description Performs a get request to Giphy's API at the given path, and
   * caches the result before returning it through the callback. If a cached
   * response is available that isn't too old, that will immediately be returned
   * instead.
   * @private
   * @param {string} path The full API path after the domain and API version.
   * Includes query parameters.
   * @param {Function} cb Callback once completed or failed. First parameter is
   * optional error, second is otherwise the parsed JSON object from Imgur.
   */
  _giphyGet(path, cb) {
    if (this._giphyCache[path]) {
      if (Date.now() - this._giphyCache[path].timestamp < this._cacheDuration) {
        cb(null, this._giphyCache[path].data);
        return;
      } else {
        // update timestamp to prevent multiple requests at the same time before
        // the first completes.
        this._giphyCache[path].timestamp = Date.now();
      }
    }
    const host = Images.giphyHost;
    host.path += path;
    const req = https.request(host, (res) => {
      let content = '';
      res.on('data', (chunk) => content += chunk);
      res.on('end', () => {
        if (res.statusCode == 200) {
          try {
            content = JSON.parse(content);
            this._giphyCache[path] = {data: content, timestamp: Date.now()};
          } catch (err) {
            this.error('Giphy Unable to parse response to ' + path);
            console.error(err);
            cb(err);
            return;
          }
          cb(null, content);
        } else {
          this.error('Giphy ' + res.statusCode + ': ' + content);
          console.error(host);
          cb(new Error('Giphy Bad Response'));
        }
      });
    });
    req.end();
  }

  /**
   * @description Searches Imgur for the given query.
   *
   * @private
   * @type {commandHandler}
   * @param {Discord~Message} msg Message that triggered command.
   * @param {number} [pages=1] Number of potential pages to view.
   * @listens Command#imgur
   */
  _commandImgur(msg, pages = 1) {
    const query =
        '?q=' + encodeURIComponent(msg.text + ' ext:png OR jpg OR gif');
    const page = Math.floor(Math.random() * pages);
    const path = 'gallery/search/top/all/' + page + query;
    this._imgurGet(path, (err, content) => {
      if (!err) {
        const list = content.data;
        if (list.length == 0) {
          this.common.reply(msg, 'Failed to search for ' + msg.text.trim());
          return;
        }
        const image = list[Math.floor(Math.random() * list.length)];
        const url = image.images ? image.images[0].link : image.link;
        const embed = new this.Discord.MessageEmbed({title: image.title});
        embed.setFooter(image.link);
        if (image.description) {
          embed.setDescription(image.description);
        } else if (
          image.images && image.images[0] && image.images[0].description) {
          embed.setDescription(image.images[0].description);
        }
        embed.setURL(image.link);
        embed.setImage(url);
        msg.channel.send(embed).catch(
            () => this.common.reply(
                msg, 'Failed to send reply.',
                'Am I able to embed images and links?'));
      }
    });
  }

  /**
   * @description Searches Giphy for the given query.
   *
   * @private
   * @type {commandHandler}
   * @param {Discord~Message} msg Message that triggered command.
   * @param {number} [pages=1] Number of potential pages to view.
   * @listens Command#giphy
   * @param {number} [count=20] Number of results per each page.
   */
  _commandGiphy(msg, pages = 1, count = 20) {
    const page = Math.floor(Math.random() * pages);
    const query = '?api_key=' + auth.giphyKey + '&q=' +
        encodeURIComponent(msg.text) + '&limit=' + count + '&offset=' +
        (page * count);
    const path = 'gifs/search' + query;
    this._giphyGet(path, (err, content) => {
      if (!err) {
        const list = content.data;
        if (list.length == 0) {
          this.common.reply(msg, 'Failed to search for ' + msg.text.trim());
          return;
        }
        const image = list[Math.floor(Math.random() * list.length)];
        const url = image.images.original.url;
        const embed = new this.Discord.MessageEmbed({title: image.title});
        embed.setFooter(image.url);
        embed.setURL(image.url);
        embed.setImage(url);
        msg.channel.send(embed).catch(
            () => this.common.reply(
                msg, 'Failed to send reply.',
                'Am I able to embed images and links?'));
      }
    });
  }

  /**
   * Replies with a picture of a cookie.
   *
   * @private
   * @type {commandHandler}
   * @param {Discord~Message} msg Message that triggered command.
   * @listens Command#cookie
   * @listens Command#cookies
   */
  _commandCookie(msg) {
    msg.text = 'cookies';
    this._commandImgur(msg, 100);
  }
}

module.exports = new Images();
