// Copyright 2018-2019 Campbell Crowley. All rights reserved.
// Author: Campbell Crowley (dev@campbellcrowley.com)

require('./subModule.js')(DevCmds);  // Extends the SubModule class.

/**
 * @classdesc Runs unsafe scripts for development purposes. DO NOT LOAD ON
 * RELEASE VERSIONS.
 * @class
 * @augments SubModule
 * @listens Discord~Client#message
 * @listens Command#run
 */
function DevCmds() {
  const self = this;
  /** @inheritdoc */
  this.myName = 'DevCmds';
  /** @inheritdoc */
  this.initialize = function() {
    self.command.on(new self.command.SingleCommand(['run'], commandRun));
    self.client.on('message', onMessage);
  };

  /** @inheritdoc */
  this.shutdown = function() {
    self.command.deleteEvent('run');
    self.client.removeListener('message', onMessage);
  };

  /**
   * Run code as the bot. EXTREMELY UNSAFE!
   *
   * @private
   * @type {Command~commandHandler}
   * @param {Discord~Message} msg The message that triggered this command.
   */
  function commandRun(msg) {
    if (msg.author.id !== self.common.spikeyId) return;
    let res = '';
    try {
      res = eval(msg.text);
      res = JSON.stringify(res);
    } catch (err) {
      res = err;
    }
    self.common.reply(msg, res || typeof res);
  }

  /**
   * Handle receiving a message. Only adds reactions in the #feature-ideas
   * channel.
   *
   * @private
   * @param {Discord~Message} msg The message that was sent.
   * @listens Discord~Client#message
   */
  function onMessage(msg) {
    if (msg.channel.id != '554105419417518103') return;
    msg.react('👍');
  }
}

module.exports = new DevCmds();

