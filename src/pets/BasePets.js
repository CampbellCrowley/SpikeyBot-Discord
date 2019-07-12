// Copyright 2019 Campbell Crowley. All rights reserved.
// Author: Campbell Crowley (dev@campbellcrowley.com)
const fs = require('fs');

/**
 * @description Manages base information for all pet species.
 * @memberof Pets
 * @inner
 */
class BasePets {
  /**
   * @description Create instance.
   */
  constructor() {
    /**
     * @description The filename of the file to read pet information from.
     * @private
     * @type {string}
     * @default
     */
    this._baseFile = './save/pets.json';
    /**
     * @description Parsed data from file.
     * @private
     * @type {object}
     * @default
     */
    this._pets = {};

    this.initialize = this.initialize.bind(this);
    this.shutdown = this.shutdown.bind(this);
    this.get = this.get.bind(this);
    this._fileUpdate = this._fileUpdate.bind(this);
    this._readFile = this._readFile.bind(this);
  }

  /**
   * @description Start watching file system changes and read pet information
   * from file.
   * @public
   */
  initialize() {
    fs.watchFile(this._baseFile, {persistent: false}, this._fileUpdate);
    this._readFile();
  }

  /**
   * @description Stop watching for file system changes, and remove all event
   * listeners.
   * @public
   */
  shutdown() {
    fs.unwatchFile(this._baseFile, this._fileUpdate);
  }

  /**
   * @description Fetch base object for a species.
   * @public
   * @param {string} species Name of species to fetch.
   * @returns {?object} Object reference of pet information for the species, or
   * null if could not be found.
   */
  get(species) {
    return this._pets[(species + '').trim().toLowerCase()];
  }

  /**
   * @description Fetch a base object for a random species.
   * @public
   * @returns {?object} Object reference of pet information for the species, or
   * null if could not be found.
   */
  random() {
    const list = Object.keys(this._pets);
    return this._pets[Math.floor(list.length * Math.random())];
  }

  /**
   * @description File has been modified, re-read and parse data.
   * @private
   * @param {fs.Stats} curr Current file stats.
   * @param {fs.Stats} prev Previous file stats.
   */
  _fileUpdate(curr, prev) {
    if (curr.mtime == prev.mtime) return;
    this._readFile();
  }

  /**
   * @description Read and parse data from the file.
   * @private
   */
  _readFile() {
    fs.readFile(this._baseFile, (err, data) => {
      if (err) {
        console.error(
            'Failed to read base pet information:', this._baseFile, err.code);
        return;
      }
      try {
        this._pets = JSON.parse(data);
      } catch (err) {
        console.error(
            'Failed to parse base pet information:', this._baseFile, err);
        return;
      }
    });
  }
}

module.exports = BasePets;
