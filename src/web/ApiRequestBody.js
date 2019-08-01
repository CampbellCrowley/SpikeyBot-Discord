// Copyright 2019 Campbell Crowley. All rights reserved.
// Author: Campbell Crowley (dev@campbellcrowley.com)

/**
 * @classdesc Data sent in an API endpoint request for being processed.
 * @class
 */
class ApiRequestBody {
  /**
   * @description Create an instance.
   */
  constructor() {
    /**
     * @description Arguments to pass as function parameters.
     * @public
     * @type {Array.<*>}
     * @default
     */
    this.args = [];
    /**
     * @description The name of the command to run.
     * @public
     * @type {string}
     * @default
     */
    this.cmd = '';
    /**
     * @description Current endpoint information.
     * @public
     * @type {?ApiEndpoint}
     * @default
     */
    this.endpoint = null;
  }

  /**
   * @description Convert an api request body to appropriate format.
   *
   * @public
   * @static
   * @param {object} obj Received object of request data from client.
   * @param {string} cmd The command requested to be performed on the endpoint.
   * @returns {ApiRequestBody} Created object of data.
   */
  static from(obj, cmd) {
    const out = new ApiRequestBody();
    out.cmd = cmd || '';
    if (Array.isArray(obj.args)) {
      out.args = obj.args.slice(0);
    }
    return out;
  }
}

module.exports = ApiRequestBody;
