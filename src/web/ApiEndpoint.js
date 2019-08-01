// Copyright 2019 Campbell Crowley. All rights reserved.
// Author: Campbell Crowley (dev@campbellcrowley.com)

/**
 * @classdesc Data associated with describing an API endpoint, and instructions
 * on where to send data as well as what data is allowed.
 * @class
 */
class ApiEndpoint {
  /**
   * @description Create an instance.
   * @param {string} name The name of this endpoint.
   * @param {string} host The hostname to direct data to for this request.
   * @param {string} path The url path to direct data for this request.
   * @param {object} [options] Additional options for controlling request data.
   * @param {string[]} [options.accept=[]] Acceptable content-type headers.
   * @param {number} [options.maxLen=0] Maximum number of bytes allowed per
   * request.
   * @param {string[]} [options.methods=['GET,'POST']] Acceptable http methods
   * for requests.
   */
  constructor(name, host, path, options = {}) {
    if (!options) options = {};
    /**
     * @description The name of the API endpoint.
     * @public
     * @type {string}
     */
    this.name = name;
    /**
     * @description The hostname of the url to redirect data.
     * @public
     * @type {string}
     */
    this.host = host;
    /**
     * @description The url path to redirect data.
     * @public
     * @type {string}
     */
    this.path = path;
    /**
     * @description List of acceptable content-type headers.
     * @public
     * @type {string[]}
     * @default ['application/json']
     */
    this.accept = options.accept || ['application/json'];
    /**
     * @description Maximum number of bytes allowed per request.
     * @public
     * @type {number}
     * @default 0
     */
    this.maxLen = options.maxLen || 0;
    /**
     * @description List of acceptable request methods.
     * @public
     * @type {string[]}
     * @default ['GET', 'POST']
     */
    this.methods = options.methods || ['GET', 'POST'];
  }
}

module.exports = ApiEndpoint;
