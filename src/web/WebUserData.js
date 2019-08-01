// Copyright 2019 Campbell Crowley. All rights reserved.
// Author: Campbell Crowley (dev@campbellcrowley.com)

/**
 * @classdesc The user data injected to be sent along with all user request to
 * the web API.
 * @class
 */
class WebUserData {
  /**
   * @description Create an instance of the user metadata.
   * @param {string} id User ID of user performing request.
   * @param {string} ip IP of current request client.
   */
  constructor(id, ip) {
    /**
     * @description The user's ID.
     *
     * @see {@link WebUserData~id}
     *
     * @private
     * @type {string}
     * @constant
     */
    this._id = id;
    /**
     * @description IP address of requesting client. Used for logging and rate
     * limiting.
     *
     * @see {@link WebUserData~ip}
     *
     * @private
     * @type {string}
     * @constant
     */
    this._ip = ip;
    /**
     * @description Array of guild IDs this user is a part of. This will only be
     * available if request was made using the user's token with 'guilds' as a
     * scope, and thus may not exist in all requests.* It may be used to improve
     * efficiency, to prevent looking up all guilds with the user performing the
     * request.
     *
     * @see {@link WebUserData~guilds}
     *
     * @private
     * @type {null|string[]}
     * @default
     */
    this._guilds = null;

    /**
     * @description Is this user data, and this request, from the public API. If
     * false, there are fewer restrictions because this request is from a
     * private filtered internal source.
     *
     * @private
     * @type {boolean}
     * @default
     */
    this.apiRequest = false;

    /**
     * @description Session ID for the user request. Null if request was not
     * made as a session.
     * @private
     * @type {?string}
     * @default
     */
    this._sessionId = null;
    /**
     * @description Session expiration timestamp for the user request.
     * @private
     * @type {?number}
     * @default
     */
    this._sessionExpirationDate = null;

    /**
     * @description Legacy session data.
     * @private
     * @type {object}
     * @deprecated
     * @default
     */
    this._session = {
      id: this.sessionId,
      /* eslint-disable-next-line @typescript-eslint/camelcase */
      expiration_date: this.sessionExpirationDate,
    };

    /**
     * @description User's username.
     *
     * @see {@link
     * https://discordapp.com/developers/docs/resources/user#user-object}
     *
     * @public
     * @type {?string}
     * @default
     */
    this.username = null;
    /**
     * @description User's account discriminator.
     *
     * @see {@link
     * https://discordapp.com/developers/docs/resources/user#user-object}
     *
     * @public
     * @type {?string}
     * @default
     */
    this.discriminator = null;
    /**
     * @description User's avatar hash.
     *
     * @see {@link
     * https://discordapp.com/developers/docs/resources/user#user-object}
     *
     * @public
     * @type {?string}
     * @default
     */
    this.avatar = null;
    /**
     * @description Is this user a bot.
     *
     * @see {@link
     * https://discordapp.com/developers/docs/resources/user#user-object}
     *
     * @public
     * @type {?boolean}
     * @default
     */
    this.bot = null;
    /**
     * @description Is two factor authentication enabled on this user's account.
     *
     * @see {@link
     * https://discordapp.com/developers/docs/resources/user#user-object}
     *
     * @public
     * @type {?boolean}
     * @default
     */
    this.mfaEnabled = null;
    /**
     * @description The user's chosen language option.
     *
     * @see {@link
     * https://discordapp.com/developers/docs/resources/user#user-object}
     *
     * @public
     * @type {?string}
     * @default
     */
    this.locale = null;
    /**
     * @description Discord user flags.
     *
     * @see {@link
     * https://discordapp.com/developers/docs/resources/user#user-object}
     *
     * @public
     * @type {?number}
     * @default
     */
    this.flags = null;
    /**
     * @description User's Nitro status.
     *
     * @see {@link
     * https://discordapp.com/developers/docs/resources/user#user-object}
     *
     * @public
     * @type {?number}
     * @default
     */
    this.premiumType = null;
  }

  /**
   * @description Getter for user ID.
   * @see {@link WebUserData~_id}
   * @public
   * @returns {string} User's ID.
   */
  get id() {
    return this._id;
  }

  /**
   * @description Getter for client IP address.
   * @see {@link WebUserData~_ip}
   * @public
   * @returns {string} Client's IP.
   */
  get ip() {
    return this._ip;
  }

  /**
   * @description Getter for guild list.
   * @see {@link WebUserData~_guilds}
   * @public
   * @returns {null|string[]} Guild ID list.
   */
  get guilds() {
    return this._guilds;
  }

  /**
   * @description Getter for session ID.
   * @see {@link WebUserData~_sessionId}
   * @public
   * @returns {?string} Session ID if it exists.
   */
  get sessionId() {
    return this._sessionId;
  }

  /**
   * @description Setter for session ID and expiration date.
   * @see {@link WebUserData~_sessionId}
   * @see {@link WebUserData~_sessionExpirationDate}
   * @param {?string} sId Session ID or null to unset.
   * @param {?number|Date|string} date Date or timestamp, or null to unset.
   */
  setSession(sId, date) {
    this.setSessionId(sId);
    this.setSessionExpirationDate(date);
  }

  /**
   * @description Setter for session ID.
   * @see {@link WebUserData~_sessionId}
   * @param {?string} sId Session ID or null to unset.
   */
  setSessionId(sId) {
    this._sessionId = sId;
    this._session.id = sId;
  }

  /**
   * @description Getter for session expiration timestamp.
   * @see {@link WebUserData~_sessionExpirationDate}
   * @public
   * @returns {?number} Session expiration timestamp if it exists.
   */
  get sessionExpirationDate() {
    return this._sessionExpirationDate;
  }

  /**
   * @description Setter for session expiration timestamp.
   * @see {@link WebUserData~_sessionExpirationDate}
   * @param {?number|Date|string} sED Date or timestamp, or null to unset.
   */
  setSessionExpirationDate(sED) {
    if (sED === null) {
      this._sessionExpirationDate = null;
    } else {
      this._sessionExpirationDate = new Date(sED).getTime();
    }
    /* eslint-disable-next-line @typescript-eslint/camelcase */
    this._session.expiration_date = this._sessionExpirationDate;
  }

  /**
   * @description Set the list of guilds for this user.
   * @see {@link https://discordapp.com/developers/docs/resources/user#get-current-user-guilds}
   * @public
   * @param {object[]} guilds Array of guild data for this user.
   */
  setGuilds(guilds) {
    if (!Array.isArray(guilds) || typeof guilds[0] !== 'object') {
      throw new TypeError('Guild data is not array of guild data.');
    }
    this._guilds = guilds;
  }

  /**
   * @description Get a serializable version of this class instance. Behaves
   * differently than HG serializable getters in that private variables are
   * converted to public instead of being removed. Assumes all variables are
   * serializable if they aren't a function.
   * @public
   * @returns {object} Serializable version of this instance.
   */
  get serializable() {
    const all = Object.entries(Object.getOwnPropertyDescriptors(this));
    const output = {};
    for (const one of all) {
      const name = one[0].replace(/^_/, '');
      if (typeof one[1].value === 'function') {
        continue;
      } else if (one[1].value && one[1].value.serializable) {
        output[name] = one[1].value.serializable;
      } else {
        output[name] = one[1].value;
      }
    }
    return output;
  }

  /**
   * @description Create this object from a Discord User Object response data.
   * @public
   * @static
   * @param {object} obj Object data from Discord.
   * @returns {WebUserData} Created object.
   */
  static from(obj) {
    const out = new WebUserData(obj.id);
    out.username = obj.username || null;
    out.discriminator = obj.discriminator || null;
    out.avatar = obj.avatar || null;
    out.bot = typeof obj.bot === 'boolean' ? obj.bot : null;
    out.mfaEnabled = typeof obj.mfa_enabled === 'boolean' ?
        obj.mfa_enabled :
        (typeof obj.mfaEnabled === 'boolean' ? obj.mfaEnabled : null);
    out.locale = obj.locale || null;
    out.flags = typeof obj.flags === 'number' ? obj.flags : null;
    out.premiumType = typeof obj.premium_type === 'number' ?
        obj.premium_type :
        (typeof obj.premiumType === 'number' ? obj.premiumType : null);
    return out;
  }
}

module.exports = WebUserData;
