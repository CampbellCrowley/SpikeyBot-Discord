// Copyright 2019 Campbell Crowley. All rights reserved.
// Author: Campbell Crowley (dev@campbellcrowley.com)
const SubModule = require('./subModule.js');
const auth = require('../auth.js');
const https = require('https');

delete require.cache[require.resolve('./locale/Strings.js')];
const Strings = require('./locale/Strings.js');

/**
 * @description Manages Twitch related commands.
 * @listens Command#twitch
 * @augments SubModule
 */
class Twitch extends SubModule {
  /**
   * @description SubModule managing Twitch related commands.
   */
  constructor() {
    super();
    /** @inheritdoc */
    this.myName = 'Twitch';
    /** @inheritdoc */
    this.postPrefix = 'twitch ';

    /**
     * @description Currently known webhook topic subscriptions (Not to be
     * confused with channel subscriptions, which we don't care about). Mapped
     * by Twitch User ID.
     * @private
     * @type {object.<object>}
     * @default
     * @constant
     */
    this._subscriptions = {};
    /**
     * @description Map of user login names to their cached Twitch user data.
     * @private
     * @type {object.<{
     *  id: number,
     *  login: string,
     *  displayName: string,
     *  createdAt: number
     * }>}
     */
    this._userMap = {};

    /**
     * @description Instance of locale string manager.
     * @private
     * @type {Strings}
     * @default
     * @constant
     */
    this._strings = new Strings('twitch');
    this._strings.purge();

    this._commandTwitch = this._commandTwitch.bind(this);
    this._commandSubscribe = this._commandSubscribe.bind(this);
    this._commandUnSubscribe = this._commandUnSubscribe.bind(this);
  }
  /** @inheritdoc */
  initialize() {
    const perms = {
      validOnlyInGuild: true,
      defaultDisabled: true,
      permissions: this.Discord.Permissions.FLAGS.MANAGE_CHANNELS |
          this.Discord.Permissions.FLAGS.MANAGE_MESSAGES |
          this.Discord.Permissions.FLAGS.MANAGE_GUILD,
    };
    this.command.on(
        new this.command.SingleCommand(['twitch'], this._commandTwitch, perms, [
          new this.command.SingleCommand(
              [
                'add', 'subscribe', 'sub', 'notify', 'notifications', 'on',
                'enable', 'alert',
              ],
              this._commandSubscribe, perms),
          new this.command.SingleCommand(
              ['remove', 'unsubscribe', 'unsub', 'stop', 'off', 'disable'],
              this._commandUnSubscribe, perms),
        ]));
  }
  /** @inheritdoc */
  shutdown() {
    this.command.removeListener('twitch');
  }

  /**
   * @description Get default host information for requesting to subscribe or
   * unsubscribe from a webhook.
   * @public
   * @static
   * @returns {object} Object to pass into https request.
   */
  static get subHost() {
    return {
      protocol: 'https:',
      host: 'api.twitch.tv',
      path: '/helix/webhooks/hub',
      method: 'POST',
      headers: {
        'User-Agent': require('./common.js').ua,
        'Client-ID': auth.twitchID,
      },
    };
  }

  /**
   * @description Get default host information for API client request.
   * @public
   * @static
   * @returns {object} Object to pass into https request.
   */
  static get apiHost() {
    return {
      protocol: 'https:',
      host: 'api.twitch.tv',
      path: '/helix/webhooks/subscriptions',
      method: 'GET',
      headers: {
        'User-Agent': require('./common.js').ua,
        'Authorization': 'Bearer ' + auth.twitchSecret,
        'Client-ID': auth.twitchID,
      },
    };
  }

  /**
   * @description Get default host information for API request to fetch user
   * information.
   * @public
   * @static
   * @returns {object} Object to pass into https request.
   */
  static get loginHost() {
    return {
      protocol: 'https:',
      host: 'api.twitch.tv',
      path: '/helix/users?login=',
      method: 'GET',
      headers: {
        'User-Agent': require('./common.js').ua,
        'Client-ID': auth.twitchID,
      },
    };
  }

  /**
   * @description Fetch the user data from a twitch username.
   * @private
   * @param {string} login The user's login name.
   * @param {Function} cb Callback with optional error, otherwise user data
   * object from Twitch.
   */
  _fetchUser(login, cb) {
    const user = this._userMap[login];
    if (user) {
      if (Date.now() - user.createdAt < 24 * 60 * 60 * 1000) {
        cb(null, user.data[0]);
        return;
      }
    }
    const host = Twitch.loginHost;
    host.path += encodeURIComponent(login);
    const req = https.request(host, (res) => {
      let content = '';
      res.on('data', (chunk) => content += chunk);
      res.on('end', () => {
        if (res.statusCode == 200) {
          try {
            const parsed = JSON.parse(content);
            parsed.createdAt = Date.now();
            this._userMap[login] = parsed;
            const data = parsed.data[0];
            const toSend = global.sqlCon.format(
                'INSERT INTO TwitchUsers SET id=?, login=?, displayName=? ON ' +
                    'DUPLICATE UPDATE SET login=? displayName=?',
                [
                  data.id,
                  data.login,
                  data.display_name,
                  data.login,
                  data.display_name,
                ]);
            global.sqlCon.query(toSend, (err) => {
              if (err) {
                this.error(
                    'Failed to update TwitchUser data after fetching user: ' +
                    login + ' ' + data.id);
                console.log(err);
              }
            });
            cb(null, parsed.data[0]);
          } catch (err) {
            this.error('Failed to parse response from Twitch');
            console.error(err, content);
            cb('Bad Response');
            return;
          }
        } else {
          this.error(res.statusCode + ': ' + content);
          console.error(host);
          cb(res.statusCode + ' from Twitch');
        }
      });
    });
    req.end();
  }

  /**
   * @description Send a request to the Twitch API. Given host data overrides
   * the default data, and the data is sent as the payload.
   * @private
   * @param {object} host The host information for the request.
   * @param {string} data Payload to send with request.
   * @param {Function} cb Callback once completed, first parameter is optional
   * error, second is response data object if no error.
   */
  _apiRequest(host, data, cb) {

  }

  /**
   * @description Fetch the current webhook subscriptions we have from Twitch
   * API.
   * @private
   */
  _fetchSubscriptions() {

  }

  /**
   * @description Fallback twitch command if no options specified.
   *
   * @private
   * @type {commandHandler}
   * @param {Discord~Message} msg Message that triggered command.
   * @listens Command#twitch
   */
  _commandTwitch(msg) {
    const sub = this._subscriptions[msg.guild.id];
    const chan = sub && Object.entries(sub);
    if (!chan || chan.length === 0) {
      this._strings.reply(
          this.common, msg, 'noAlertsTitle', 'help',
          `${msg.prefix}${this.postPrefix}`);
      return;
    }

    this.common.reply(msg, JSON.stringify(chan, null, 2));
  }

  /**
   * @description Subscribe to notifications for a streamer in a text channel.
   *
   * @private
   * @type {commandHandler}
   * @param {Discord~Message} msg Message that triggered command.
   * @listens Command#twitch_add
   */
  _commandSubscribe(msg) {
    const text = msg.text.trim();
    if (!text.length <= 2) {
      this._strings.reply(this.common, msg, 'subNoUsername');
      return;
    }
    if (!text.match(/^(#)?[a-zA-Z0-9][\w]{2,24}$/)) {
      this._strings.reply(this.common, msg, 'subBadUsername');
      return;
    }
    this._fetchUser(text, (err, user) => {
      if (err) return;
      if (!this._subscriptions[msg.guild.id]) {
        this._subscriptions[msg.guild.id] = {};
      }
      const sub = this._subscriptions[msg.guild.id];
      if (!sub[msg.channel.id]) sub[msg.channel.id] = {};
    });
  }
}
module.exports = new Twitch();
