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
    this._resubCheck = this._resubCheck.bind(this);
    this.webhookHandler = this.webhookHandler.bind(this);
    this._handleChannelDelete = this._handleChannelDelete.bind(this);
    this._handleGuildDelete = this._handleGuildDelete.bind(this);
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
                'enable', 'alert', 'a', 'notification',
              ],
              this._commandSubscribe, perms),
          new this.command.SingleCommand(
              [
                'remove', 'unsubscribe', 'unsub', 'stop', 'off', 'disable',
                'delete', 'del', 'd', 'silent', 'mute',
              ],
              this._commandUnSubscribe, perms),
          new this.command.SingleCommand(['resub'], this._resubCheck, perms),
        ]));
    this.client.on('channelDelete', this._handleChannelDelete);
    this.client.on('guildDelete', this._handleGuildDelete);

    if (this.client.shard) {
      /**
       * @description Inject webhook handler into client for easier shard
       * broadcasts. Set to undefined once shutdown.
       * @public
       * @see {@link Twitch.webhookHandler}
       */
      this.client.twitchWebhookHandler = this.webhookHandler;
    }

    // Attempt to re-subscribe to necessary alerts every 12 hours, prior to them
    // expiring.
    if (!this.client.shard || this.client.shard.ids[0] === 0) {
      this.interval =
          this.client.setInterval(this._resubCheck, 12 * 60 * 60 * 1000);
      this.timeout =
          this.client.setTimeout(this._resubCheck, 1 * 60 * 60 * 1000);
    }
  }
  /** @inheritdoc */
  shutdown() {
    this.client.clearInterval(this.interval);
    this.client.clearTimeout(this.timeout);
    this.command.removeListener('twitch');
    this.client.twitchWebhookHandler = undefined;
    this.client.removeListener('channelDelete', this._handleChannelDelete);
    this.client.removeListener('guildDelete', this._handleGuildDelete);
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
        'Content-Type': 'application/json',
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
    const toSend = global.sqlCon.format(
        'SELECT * from TwitchUsers WHERE login=?', [login]);
    global.sqlCon.query(toSend, (err, rows) => {
      if (err) {
        this.error('Failed to fetch users from TwitchUsers');
        console.error(err);
        cb('Database Query Error');
        return;
      }
      const user = rows[0];
      if (user) {
        if (Date.now() - new Date(user.lastModified).getTime() <
            24 * 60 * 60 * 1000) {
          cb(null, user);
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
              const data = parsed.data[0];
              if (!data) {
                cb(null, null);
                return;
              }
              const toSend = global.sqlCon.format(
                  'INSERT INTO TwitchUsers SET id=?, login=?, displayName=? ' +
                      'ON DUPLICATE KEY UPDATE login=?, displayName=?',
                  [
                    data.id, data.login, data.display_name, data.login,
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
              cb(null, {
                id: data.id,
                login: data.login,
                displayName: data.display_name,
                lastModified: new Date().toUTCString(),
                streamChangedState: 0,
              });
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
    });
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
    const toSend = global.sqlCon.format(
        'SELECT * FROM TwitchDiscord JOIN TwitchUsers ON twitchId=id ' +
            'WHERE guild=? AND bot=? ORDER BY channel',
        [msg.guild.id, this.client.user.id]);
    global.sqlCon.query(toSend, (err, rows) => {
      if (err) {
        this.error(
            'Failed to fetch TwitchDiscord data for guild: ' + msg.guild.id);
        console.error(err);
        this._strings.reply(this.common, msg, 'error');
        return;
      }
      if (!rows || rows.length === 0) {
        this._strings.reply(
            this.common, msg, 'noAlertsTitle', 'help',
            `${msg.prefix}${this.postPrefix}`);
        return;
      }

      let last = null;
      const out = rows.map((el) => {
        let str;
        if (!last) {
          str = `<#${el.channel}>: ${el.displayName}`;
        } else if (last != el.channel) {
          str = `\n<#${el.channel}>: ${el.displayName}`;
        } else {
          str = `, ${el.displayName}`;
        }
        last = el.channel;
        return str;
      });
      this.common.reply(msg, 'Twitch Alerts', out.join(''));
    });
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
    // Count checking is not specific to a single bot. The limit is a global
    // limit.
    const toSend = global.sqlCon.format(
        'SELECT COUNT(*) AS count FROM TwitchDiscord WHERE guild=?',
        [msg.guild.id]);
    global.sqlCon.query(toSend, (err, rows) => {
      if (err) {
        this.error(
            'Failed to fetch number of subscriptions for guild: ' +
            msg.guild.id);
        console.error(err);
        this._strings.reply(this.common, msg, 'error');
        return;
      }
      if (rows[0].count >= 10) {
        this._strings.reply(this.common, msg, 'maxSubscriptions');
        return;
      }
      const text = msg.text.trim();
      if (text.length <= 2) {
        this._strings.reply(this.common, msg, 'subNoUsername');
        return;
      }
      if (!text.match(/^(#)?[a-zA-Z0-9][\w]{2,24}$/)) {
        this._strings.reply(this.common, msg, 'subBadUsername');
        return;
      }
      this._fetchUser(text, (err, user) => {
        if (err) {
          this._strings.reply(this.common, msg, 'error');
          return;
        } else if (!user) {
          this._strings.reply(this.common, msg, 'unknownUser');
          return;
        }
        const toSend = global.sqlCon.format(
            'INSERT INTO TwitchDiscord SET channel=?, twitchId=?, guild=?, ' +
                'type=?, bot=?',
            [
              msg.channel.id,
              user.id,
              msg.guild && msg.guild.id,
              'Stream Changed',
              this.client.user.id,
            ]);
        global.sqlCon.query(toSend, (err) => {
          if (err && err.code !== 'ER_DUP_ENTRY') {
            this.error('Failed to update TwitchDiscord subscribe request.');
            console.error(err);
            this._strings.reply(this.common, msg, 'error');
          } else {
            this._strings.reply(
                this.common, msg, 'subscribed', 'fillOne', user.displayName);
          }
        });
        if (!user.streamChangedState ||
            new Date(user.expiresAt).getTime() >=
                Date.now() - 24 * 60 * 60 * 1000) {
          this.subscribeToUser(user);
        }
      });
    });
  }

  /**
   * @description Unsubscribe from notifications for a streamer in a text
   * channel.
   *
   * @private
   * @type {commandHandler}
   * @param {Discord~Message} msg Message that triggered command.
   * @listens Command#twitch_remove
   */
  _commandUnSubscribe(msg) {
    const text = msg.text.trim();
    if (text.length <= 2) {
      this._strings.reply(this.common, msg, 'subNoUsername');
      return;
    }
    if (!text.match(/^(#)?[a-zA-Z0-9][\w]{2,24}$/)) {
      this._strings.reply(this.common, msg, 'subBadUsername');
      return;
    }
    this._fetchUser(text, (err, user) => {
      if (err) {
        this._strings.reply(this.common, msg, 'error');
        return;
      } else if (!user) {
        this._strings.reply(this.common, msg, 'unknownUser');
        return;
      }
      const toSend = global.sqlCon.format(
          'DELETE FROM TwitchDiscord WHERE channel=? AND twitchId=? AND ' +
              'type=? AND bot=?',
          [
            msg.channel.id,
            user.id,
            'Stream Changed',
            this.client.user.id,
          ]);
      global.sqlCon.query(toSend, (err) => {
        if (err) {
          this.error('Failed to update TwitchDiscord unsubscribe request.');
          console.error(err);
        } else {
          this._strings.reply(
              this.common, msg, 'notSubscribed', 'fillOne', text);
          return;
        }
      });
    });
  }

  /**
   * @description Subscribe to webhook requests for a given user.
   * @public
   * @param {object} user The user data of which to subscribe to.
   */
  subscribeToUser(user) {
    const toSend = global.sqlCon.format(
        'UPDATE TwitchUsers SET streamChangedState=1 WHERE id=? AND ' +
            'streamChangedState<2',
        [user.id]);
    global.sqlCon.query(toSend, (err) => {
      if (err) {
        this.error('Failed to update streamChangedState.');
        console.error(err);
        return;
      }
      const host = Twitch.subHost;
      const body = {
        'hub.lease_seconds': 10 * 24 * 60 * 60,
        // 'hub.lease_seconds': 0,
        'hub.callback': this.common.isRelease ?
            'https://www.spikeybot.com/webhook/twitch/' :
            'https://www.spikeybot.com/dev/webhook/twitch/',
        'hub.mode': 'subscribe',
        'hub.topic': `https://api.twitch.tv/helix/streams?user_id=${user.id}`,
        'hub.user_id': user.id,
        'hub.secret': auth.twitchSubSecret,
      };
      const req = https.request(host, (res) => {
        if (res.statusCode != 202) {
          this.error(res.statusCode + ' during Twitch Subscribe request.');
          console.error(host, body);
          let content = '';
          res.on('data', (c) => content += c);
          res.on('end', () => {
            if (content.length > 0) this.error(content);
          });
          const toSend = global.sqlCon.format(
              'UPDATE TwitchUsers SET streamChangedState=0 WHERE id=? AND ' +
                  'streamChangedState<2',
              [user.id]);
          global.sqlCon.query(toSend, (err) => {
            if (err) {
              this.error('Failed to update streamChangedState.');
              console.error(err);
              return;
            }
          });
        }
      });
      req.end(JSON.stringify(body));
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
   *   data: Array.<{
   *     user_id: string,
   *     user_name: string,
   *     game_id: string,
   *     type: string,
   *     title, string,
   *     viewer_count: number,
   *     started_at: string,
   *     language: string,
   *     thumbnail_url: string
   *   }>
   * }} data Data received from Twitch webhook.
   */
  webhookHandler(channels, data) {
    if (typeof channels === 'string') channels = JSON.parse(channels);
    if (typeof data === 'string') data = JSON.parse(data);
    data = data.data[0];
    const pF = this.Discord.Permissions.FLAGS;
    channels.forEach((cId) => {
      const chan = this.client.channels.get(cId);
      if (!chan) return;
      const perms = chan.guild && !chan.permissionsFor(chan.guild.me);
      if (perms && !perms.has(pF.SEND_MESSAGES)) {
        return;
      }
      const locale =
          this.bot.getLocale && this.bot.getLocale(chan.guild && chan.guild.id);
      const message = this._formatMessage(data, locale);
      if (perms && !perms.has(pF.EMBED_LINKS)) {
        const needEmbed = this._strings.get('noPermEmbed', locale);
        chan.send('```' + message.title + '```\n' + needEmbed);
      } else {
        chan.send(message);
      }
    });
  }

  /**
   * @description Format the Twitch webhook into a Discord message to send.
   * @private
   * @param {object} data Webhook data from Twitch.
   * @param {string} [locale] Locale for formatting strings.
   * @returns {external:Discord~MessageEmbed} Formatted embed message.
   */
  _formatMessage(data, locale) {
    const embed = new this.Discord.MessageEmbed();
    embed.setTitle(
        this._strings.get('streamLiveTitle', locale, data.user_name));
    if (data.started_at) {
      const date = new Date(data.started_at).getTime();
      if (date > 0) embed.setTimestamp(date);
    }
    const url = `https://twitch.tv/${data.user_name}`;
    embed.setURL(url);
    embed.setThumbnail(
        data.thumbnail_url.replace(/\{width\}/g, 320)
            .replace(/\{height\}/g, 180));
    embed.setColor([145, 71, 255]);
    embed.setDescription(`${data.title}\n${url}`);
    embed.setFooter(`${data.viewer_count} viewers`);
    return embed;
  }

  /**
   * @description Check our database for webhook subscriptions that are about to
   * expire, and re-subscribe to them.
   * @private
   */
  _resubCheck() {
    const toSend = 'SELECT DISTINCT id,streamChangedState,login,lastModified,' +
        'displayName,expiresAt FROM TwitchUsers INNER JOIN TwitchDiscord ' +
        'ON id=twitchId WHERE ' +
        'TIMESTAMPDIFF(DAY, expiresAt, NOW()) > -2 OR ' +
        'TIMESTAMPDIFF(DAY, expiresAt, NOW()) IS NULL';
    global.sqlCon.query(toSend, (err, rows) => {
      if (err) {
        this.error('Failed to fetch twitch alerts about to expire.');
        console.error(err);
        return;
      }
      this.debug('Resubbing: ' + rows.map((el) => el.login).join(','));
      rows.forEach((el) => this.subscribeToUser(el));
    });
  }

  /**
   * @description Handle a Discord channel being deleted.
   * @private
   * @param {external:Discord~Channel} channel The deleted Discord channel.
   * @listens external:Discord~Client#ChannelDelete
   */
  _handleChannelDelete(channel) {
    const toSend = global.sqlCon.format(
        'DELETE FROM TwitchDiscord WHERE channel=?', [channel.id]);
    global.sqlCon.query(toSend, (err) => {
      if (err) {
        this.error(
            'Failed to purge deleted channel from TwitchDiscord: ' +
            channel.id);
        console.error(err);
      }
    });
  }

  /**
   * @description Handle a Discord guild being deleted (usually bot being
   * kicked).
   * @private
   * @param {external:Discord~Guild} guild The deleted Discord guild.
   * @listens external:Discord~Client#GuildDelete
   */
  _handleGuildDelete(guild) {
    const toSend = global.sqlCon.format(
        'DELETE FROM TwitchDiscord WHERE guild=?', [guild.id]);
    global.sqlCon.query(toSend, (err) => {
      if (err) {
        this.error(
            'Failed to purge deleted guild from TwitchDiscord: ' + guild.id);
        console.error(err);
      }
    });
  }
}
module.exports = new Twitch();
