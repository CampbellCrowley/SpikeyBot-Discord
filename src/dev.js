// Copyright 2019 Campbell Crowley. All rights reserved.
// Author: Campbell Crowley (dev@campbellcrowley.com)

require('./subModule.js')(DevCmds);  // Extends the SubModule class.

/**
 * @classdesc Runs unsafe scripts for development purposes. DO NOT LOAD ON
 * RELEASE VERSIONS.
 * @class
 * @augments SubModule
 * @listens Command#run
 */
function DevCmds() {
  const self = this;
  /** @inheritdoc */
  this.myName = 'DevCmds';
  /** @inheritdoc */
  this.initialize = function() {
    self.command.on(new self.command.SingleCommand(['run'], commandRun));
  };

  /** @inheritdoc */
  this.shutdown = function() {
    self.command.deleteEvent('run');
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
}

module.exports = new DevCmds();

