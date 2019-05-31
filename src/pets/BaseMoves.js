// Copyright 2019 Campbell Crowley. All rights reserved.
// Author: Campbell Crowley (dev@campbellcrowley.com)
const fs = require('fs');

/**
 * @description Manages base information for all possible moves.
 * @memberof Pets
 * @inner
 */
class BaseMoves {
  /**
   * @description Create instance.
   */
  constructor() {
    /**
     * @description The filename of the file to read move information from.
     * @private
     * @type {string}
     * @default
     */
    this._baseFile = './save/petMoves.json';
    /**
     * @description Parsed data from file.
     * @private
     * @type {Object}
     * @default
     */
    this._moves = {};

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
   * @description Fetch base object for a single move.
   * @public
   * @param {string} name Name of move to fetch.
   * @returns {?object} Object reference of pet information for the move, or
   * null if could not be found.
   */
  get(name) {
    return this._moves[(name + '').trim().toLowerCase()];
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
            'Failed to read base pet move information:', this._baseFile,
            err.code);
        return;
      }
      try {
        this._moves = JSON.parse(data);
      } catch (err) {
        console.error(
            'Failed to parse base pet move information:', this._baseFile, err);
        return;
      }
    });
  }
}

module.exports = BaseMoves;
