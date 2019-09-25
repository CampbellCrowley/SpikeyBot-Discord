// Copyright 2019 Campbell Crowley. All rights reserved.
// Author: Campbell Crowley (dev@campbellcrowley.com)
const Locale = require('../../src/locale/Locale.js');

/**
 * @description United States English.
 * @augments Locale
 */
class EnUsTwitch extends Locale {
  /**
   * @description Constructor.
   */
  constructor() {
    super();
    this.title = 'Twitch';
    this.noAlertsTitle = 'No Alerts';
    this.help =
        'To show alerts for SpikeyRobot in this channel: `{0}add SpikeyRobot`' +
        '.\nTo stop alerts for SpikeyRobot in this channel: `{0}remove ' +
        'SpikeyRobot`.';
    this.listTitle = 'Current Channel Alerts';
    this.subNoUsername = 'Please specify a Twitch username.';
    this.subBadUsername = 'That doesn\'t look like a valid username to me.';
  }
}

module.exports = new EnUsTwitch();
