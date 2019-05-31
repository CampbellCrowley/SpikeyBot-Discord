// Copyright 2019 Campbell Crowley. All rights reserved.
// Author: Campbell Crowley (dev@campbellcrowley.com)
const crypto = require('crypto');

/**
 * @description Contains information about a single user's pet.
 * @memberof Pets
 * @inner
 */
class Pet {
  /**
   * @description Create a pet for a user.
   * @param {string} owner ID of the user that owns this pet.
   * @param {string} name The name of this pet.
   * @param {string} species The species of this pet.
   */
  constructor(owner, name, species) {
    /**
     * @description ID of the owner of this pet.
     * @type {string}
     * @public
     */
    this.owner = owner;
    /**
     * @description The name of this pet.
     * @type {string}
     * @public
     */
    this.name = name;
    /**
     * @description The species ID of this pet.
     * @type {string}
     * @public
     */
    this.species = species;

    /**
     * @description The ID of this pet. Does not check for uniqueness, but
     * expects the ID to be unique per-user.
     * @type {string}
     * @public
     */
    this.id = crypto.randomBytes(6).toString('base64').replace(/\//g, '=');

    /**
     * @description The number of experience points this pet has.
     * @public
     * @type {number}
     * @default
     */
    this.xp = 0;
    /**
     * @description Attack modifier on top of base species stat.
     * @public
     * @type {number}
     * @default
     */
    this.attackMod = 0;
    /**
     * @description Defense modifier on top of base species stat.
     * @public
     * @type {number}
     * @default
     */
    this.defenseMod = 0;
    /**
     * @description Speed modifier on top of base species stat.
     * @public
     * @type {number}
     * @default
     */
    this.speedMod = 0;
    /**
     * @description Health modifier on top of base species stat.
     * @public
     * @type {number}
     * @default
     */
    this.healthMod = 0;
    /**
     * @description Current number of lives remaining.
     * @public
     * @type {number}
     * @default
     */
    this.lives = 3;
    /**
     * @description Timestamp at most recent time the pet has begun resting.
     * Used for regenerating lives.
     * @public
     * @type {number}
     * @default
     */
    this.restStartTimestamp = Date.now();

    /**
     * @description The timestamp at which this object was last interacted with.
     * This is used for purging from memory when not used for a while.
     * @type {number}
     * @private
     * @default Date.now()
     */
    this._lastInteractTime = Date.now();

    this.touch = this.touch.bind(this);
  }

  /**
   * @description Get a serializable version of this class instance. Strips all
   * private variables, and all functions. Assumes all public variables are
   * serializable if they aren't a function.
   * @public
   * @returns {object} Serializable version of this instance.
   */
  get serializable() {
    const all = Object.entries(Object.getOwnPropertyDescriptors(this));
    const output = {};
    for (const one of all) {
      if (typeof one[1].value === 'function' || one[0].startsWith('_')) {
        continue;
      }
      output[one[0]] = one[1].value;
    }
    return output;
  }

  /**
   * @description Touch this object to update the last `_lastInteractTime`.
   * @public
   */
  touch() {
    this._lastInteractTime = Date.now();
  }
}

/**
 * @description Create a Pet from a Pet-like Object. Similar to
 * copy-constructor.
 * @public
 * @static
 * @param {object} obj The Pet-like object to copy.
 * @returns {Pet} Created Pet object.
 */
Pet.from = function(obj) {
  const output = new Pet(obj.owner, obj.name, obj.species);
  if (obj.id) output.id = obj.id;
  if (obj.xp) output.xp = obj.xp * 1;
  if (obj.attackMod) output.attackMod = obj.attackMod * 1;
  if (obj.defenseMod) output.defenseMod = obj.defenseMod * 1;
  if (obj.speedMod) output.speedMod = obj.speedMod * 1;
  if (obj.healthMod) output.healthMod = obj.healthMod * 1;
  if (typeof obj.lives === 'number') output.lives = obj.lives * 1;
  if (obj.restStartTimestamp &&
      obj.restStartTimestamp < output.restStartTimestamp) {
    output.restStartTimestamp = obj.restStartTimestamp;
  }
  return output;
};

module.exports = Pet;
