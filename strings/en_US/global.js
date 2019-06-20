// Copyright 2019 Campbell Crowley. All rights reserved.
// Author: Campbell Crowley (dev@campbellcrowley.com)
const Locale = require('../../src/locale/Locale.js');

/**
 * @description United States English.
 * @extends Locale
 */
class EnUsGlobal extends Locale {
  /**
   * @description Constructor.
   */
  constructor() {
    super();
    this.username = 'SpikeyBot';
  }
}

module.exports = new EnUsGlobal();
