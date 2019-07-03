// Copyright 2018 Campbell Crowley. All rights reserved.
// Author: Campbell Crowley (dev@campbellcrowley.com)

require('./subModule.js').extend(MainModule);  // Extends the SubModule class.

/**
 * @classdesc Base class for required modules for the bot to work. Adds
 * interface for maintaining references across reloads.
 * @class
 * @augments SubModule
 */
function MainModule() {
  /**
   * The data exported and imported by this module intended to be used to
   * persist across reloads.
   *
   * @typedef MainModule~ModuleData
   *
   * @type {object.<*>}
   */
  /* eslint-disable @typescript-eslint/no-unused-vars */
  /**
   * Imports data from a previous instance of this class in order to maintain
   * references to other objects and classes across reloads.
   *
   * @public
   * @abstract
   * @param {?MainModule~ModuleData} data The data that was exported previously,
   * or null if no data to import.
   */
  this.import = function(data) {};
  /* eslint-enable @typescript-eslint/no-unused-vars */
  /**
   * Export data required to maintain the bot across reloading this module.
   * Expected to be returned directly to this.import once reloaded.
   *
   * @public
   * @abstract
   * @returns {MainModule~ModuleData} The data to be exported.
   */
  this.export = function() {
    return {};
  };
  /**
   * @description Signal that the bot is shutting down and will not be
   * restarting immediately. This is triggered on all shutdowns where all
   * MainModules and SubModules will be unloaded.
   *
   * @public
   * @abstract
   */
  this.terminate = function() {};
}

/**
 * Extends MainModule as the base class of a child.
 *
 * @param {object} child The child class to extend.
 */
MainModule.extend = function(child) {
  child.prototype = new MainModule();
  child.prototype.constructor = child;
};

module.exports = MainModule.extend;
