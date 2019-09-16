// Copyright 2019 Campbell Crowley. All rights reserved.
// Author: Campbell Crowley (dev@campbellcrowley.com)
delete require.cache[require.resolve('../locale/Strings.js')];
const Strings = require('../locale/Strings.js');

/**
 * @classdesc String text getter helper.
 * @class HungryGames~Messages
 */
class Messages {
  /**
   * Create the instance managing the filesystem.
   */
  constructor() {
    /**
     * All messages to show for games. Parsed from locale file.
     *
     * @private
     * @type {EnUsHGMessages}
     * @default
     */
    this._messages = new Strings('hgMessages');
    this._messages.purge();
  }
  /**
   * Stop watching for file changes.
   *
   * @public
   */
  shutdown() {
    this._messages.purge();
  }
  /**
   * @description Get all messages for the given locale as a serializable
   * object.
   *
   * @public
   * @param {string} [locale] The language locale to fetch strings in.
   * @returns {?object} The key-pair mapping of available messages, or null if
   * unable to find locale group.
   */
  getMessages(locale) {
    const group = this._messages.getGroup(locale);
    if (!group) return null;

    const all = Object.entries(Object.getOwnPropertyDescriptors(group));
    const output = {};
    for (const one of all) {
      if (typeof one[1].value === 'function' || one[0].startsWith('_')) {
        continue;
      } else if (typeof one[1].value === 'string') {
        output[one[0]] = one[1].value;
      } else if (Array.isArray(one[1].value)) {
        const bad = one[1].value.find((el) => typeof el !== 'string');
        if (!bad) output[one[0]] = one[1].value;
      }
    }
    return output;
  }
  /**
   * Get a random message of a given type from hgMessages.json.
   *
   * @see (@link Strings~get}
   *
   * @public
   * @param {string} type The message type to get.
   * @param {string} [locale] Language locale of string to get.
   * @param {...string} [rep] Values to replace tags in the chosen string.
   * @returns {string} A random message of the given type.
   */
  get(type, locale, ...rep) {
    return this._messages.get(type, locale, ...rep) || 'localeFail';
  }
}
module.exports = Messages;
