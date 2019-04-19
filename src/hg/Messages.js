// Copyright 2019 Campbell Crowley. All rights reserved.
// Author: Campbell Crowley (dev@campbellcrowley.com)
const fs = require('fs');

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
     * The file path to read messages.
     *
     * @private
     * @type {string}
     * @constant
     * @default
     */
    this._messageFile = './save/hgMessages.json';

    /**
     * All messages to show for games. Parsed from file.
     *
     * @private
     * @type {Object.<string[]>}
     * @default
     */
    this._messages = {};
    this._updateMessages();
    fs.watchFile(this._messageFile, (curr, prev) => {
      if (curr.mtime == prev.mtime) return;
      this._updateMessages();
    });
  }
  /**
   * Stop watching for file changes.
   *
   * @public
   */
  shutdown() {
    fs.unwatchFile(this._messageFile);
  }
  /**
   * Parse all messages from file.
   *
   * @private
   */
  _updateMessages() {
    fs.readFile(this._messageFile, (err, data) => {
      if (err) return;
      try {
        const parsed = JSON.parse(data);
        if (parsed) {
          this._messages = parsed;
        }
      } catch (err) {
        console.log(err);
      }
    });
  }
  /**
   * Get a random message of a given type from hgMessages.json.
   *
   * @public
   * @param {string} type The message type to get.
   * @returns {string} A random message of the given type.
   */
  get(type) {
    const list = this._messages[type];
    if (!list) return 'badtype';
    const length = list.length;
    if (length == 0) return 'nomessage';
    return list[Math.floor(Math.random() * length)];
  }
}
module.exports = Messages;
