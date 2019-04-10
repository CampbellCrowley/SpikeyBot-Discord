// Copyright 2019 Campbell Crowley. All rights reserved.
// Author: Campbell Crowley (dev@campbellcrowley.com)
const fs = require('fs');

/**
 * The file path to read messages.
 *
 * @private
 * @type {string}
 * @constant
 * @default
 */
const messageFile = './save/hgMessages.json';
/**
 * All messages to show for games. Parsed from file.
 *
 * @private
 * @type {Object.<string[]>}
 * @default
 */
let messages = {};


/**
 * @classdesc String text getter helper.
 * @class HungryGames~Messages
 */
function Messages() {
  /**
   * Parse all messages from file.
   *
   * @private
   */
  function updateMessages() {
    fs.readFile(messageFile, function(err, data) {
      if (err) return;
      try {
        const parsed = JSON.parse(data);
        if (parsed) {
          messages = parsed;
        }
      } catch (err) {
        console.log(err);
      }
    });
  }
  updateMessages();
  fs.watchFile(messageFile, function(curr, prev) {
    if (curr.mtime == prev.mtime) return;
    updateMessages();
  });

  /**
   * Get a random message of a given type from hgMessages.json.
   *
   * @public
   * @param {string} type The message type to get.
   * @return {string} A random message of the given type.
   */
  this.get = function(type) {
    const list = messages[type];
    if (!list) return 'badtype';
    const length = list.length;
    if (length == 0) return 'nomessage';
    return list[Math.floor(Math.random() * length)];
  };
  /**
   * Stop watching for file changes.
   *
   * @public
   */
  this.shutdown = function() {
    fs.unwatchFile(messageFile);
  };
}
module.exports = Messages;
