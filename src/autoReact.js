// Copyright 2020 Campbell Crowley. All rights reserved.
// Author: Campbell Crowley (dev@campbellcrowley.com)
const SubModule = require('./subModule.js');

/**
 * @description Automatically reacts to all messages sent in a channel.
 * @augments SubModule
 */
class AutoReact extends SubModule {
  /**
   * @description SubModule managing auto reacting.
   */
  constructor() {
    super();
    /** @inheritdoc */
    this.myName = 'AutoReact';
  }
  /** @inheritdoc */
  initialize() {
    this.client.on('message', this._messageHandler);
  }
  /** @inheritdoc */
  shutdown() {
    this.client.removeListener('message', this._messageHandler);
  }

  /**
   * @description Handle message sent and react to it if applicable.
   * @private
   * @param {external:Discord~Message} msg Message that was sent.
   */
  _messageHandler(msg) {
    if (msg.channel.id !== '728762339666427905') return;
    const emoji = '👍';
    msg.react(emoji);
  }
}

module.exports = new AutoReact();
