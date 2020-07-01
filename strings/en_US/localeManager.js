// Copyright 2019-2020 Campbell Crowley. All rights reserved.
// Author: Campbell Crowley (dev@campbellcrowley.com)
const Locale = require('../../src/locale/Locale.js');

/**
 * @description United States English.
 * @augments Locale
 */
class EnUsLocaleManager extends Locale {
  /**
   * @description Constructor.
   */
  constructor() {
    super();
    this.title = 'Locale Manager';
    this.invalidLocale =
        'Unknown language. I don\'t know what language you have requested.';
    this.confirmLocale = 'Are you sure you wish to change your language?';
    this.confirmLocaleReact = '{}\nReact with {} to confirm.';
    this.currentLocale = 'Current language: `{}`';
  }
}

module.exports = new EnUsLocaleManager();
