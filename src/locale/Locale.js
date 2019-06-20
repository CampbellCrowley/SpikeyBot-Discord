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
    const s = this[key];
    let i = -1;
    if (typeof s === 'string') {
      return s.replace(/\{\}/g, () => rep[++i]);
    } else {
      return null;
    }
  }
}

module.exports = Locale;
