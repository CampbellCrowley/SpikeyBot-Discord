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

    if (this.client.shard) {
      /**
       * @description Inject webhook handler into client for easier shard
       * broadcasts. Set to undefined once shutdown.
       * @public
       * @see {@link Twitch.webhookHandler}
       */
      this.client.twitchWebhookHandler = this.webhookHandler;
    }
  }
  /** @inheritdoc */
  shutdown() {
    this.command.removeListener('twitch');
    this.client.twitchWebhookHandler = undefined;
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

  /**
   * @description Format and send messages to all available channels that were
   * specified and on the current shard, using the provided data from the
   * webhook.
   * @public
   * @param {string[]} channels Array of all channel IDs this message is to be
   * sent in. IDs not on this shard will be ignored.
   * @param {{
   *   user_id: string,
   *   user_name: string,
   *   game_id: string,
   *   type: string,
   *   title, string,
   *   viewer_count: number,
   *   started_at: string,
   *   language: string,
   *   thumbnail_url: string
   * }} data Data received from Twitch webhook.
   */
  webhookHandler(channels, data) {
    if (typeof channels === 'string') channels = JSON.parse(channels);
    if (typeof data === 'string') data = JSON.parse(data);
    const message = this._formatMessage(data);
    const pF = this.Discord.Permissions.FLAGS;
    const needEmbed = this._strings.get('noPermEmbed', data.language);
    channels.forEach((cId) => {
      const chan = this.client.channels.get(cId);
      if (!chan) return;
      const perms = chan.guild && !chan.permissionsFor(chan.guild.me);
      if (perms && !perms.has(pF.SEND_MESSAGES)) {
        return;
      } else if (perms && !perms.has(pF.EMBED_LINKS)) {
        chan.send('```' + message.title + '```\n' + needEmbed);
        return;
      } else {
        chan.send(message);
      }
    });
  }

  /**
   * @description Format the Twitch webhook into a Discord message to send.
   * @private
   * @param {object} data Webhook data from Twitch.
   * @returns {external:Discord~MessageEmbed} Formatted embed message.
   */
  _formatMessage(data) {
    const embed = new this.Discord.MessageEmbed();
    embed.setTitle(
        this._strings.get('streamLiveTitle', data.language, data.user_name));
    if (data.started_at) {
      const date = Date.from(data.started_at).getTime();
      if (date > 0) embed.setTimestamp(date);
    }
    embed.setURL(`https://twitch.tv/${data.user_name}`);
    embed.setThumbnail(data.thumbnail_url);
    embed.setColor([145, 71, 255]);
    embed.setDescription(data.title);
    embed.setFooter(`${data.viewer_count} viewers`);
    return embed;
  }
}
module.exports = new Twitch();
