// Copyright 2019 Campbell Crowley. All rights reserved.
// Author: Campbell Crowley (dev@campbellcrowley.com)

/**
 * @description Base locale class that stores strings for a single locale.
 * @memberof Strings
 * @inner
 */
class Locale {
  /**
   * @description Bind this.
   */
  constructor() {
    this.get = this.get.bind(this);
    this.getRaw = this.getRaw.bind(this);

    /**
     * @description The bot's username.
     */
    this.username = 'SpikeyBot';
    /**
     * @description Empty string to replace with passed data.
     */
    this.fillOne = '{}';
  }

  /**
   * @description Get string with given key and replace placeholders.
   * @public
   * @this Locale
   * @param {string} key Key of string to lookup.
   * @param {...string} [rep] Placeholder replacement strings.
   * @returns {?string} String with replaced placeholders, or null if unable to
   * find.
   */
  get(key, ...rep) {
    let s = this.getRaw(key);
    let i = 0;
    if (Array.isArray(s)) s = s[Math.floor(Math.random() * s.length)];
    if (typeof s === 'string') {
      return s.replace(/\{(\d*)\}/g, (m, p) => {
        let out = rep[i++];
        p *= 1;
        if (p >= 0 && p < rep.length) out = rep[p];
        return out;
      });
    } else {
      return null;
    }
  }

  /**
   * @description Get get the raw data from the locale file at the given key.
   * @public
   * @this Locale
   * @param {string} key Key of string to lookup.
   * @returns {?string|string[]} Data from locale file, or null if unable to
   * find.
   */
  getRaw(key) {
    return this[key] || null;
  }
}

module.exports = Locale;
