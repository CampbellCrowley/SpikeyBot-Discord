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
   * @param {external:Discord~GuildMember} owner Reference to the guild member
   * that owns this pet.
   * @param {string} name The name of this pet.
   */
  constructor(owner, name) {
    /**
     * @description ID of the owner of this pet.
     * @type {string}
     * @public
     */
    this.owner = owner.user.id;
    /**
     * @description The ID of the guild this pet is in.
     * @type {string}
     * @public
     */
    this.guild = owner.guild.id;
    /**
     * @description The ID of this pet. Does not check for uniqueness, but
     * expects the ID to be unique per-user per-guild.
     * @type {string}
     * @public
     */
    this.id = crypto.randomBytes(4).toString('base64');
    /**
     * @description The name of this pet.
     * @type {string}
     * @public
     */
    this.name = name;
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
   * @returns {Object} Serializable version of this instance.
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
 * @param {Object} obj The Pet-like object to copy.
 * @returns {Pet} Created Pet object.
 */
Pet.from = function(obj) {
  let owner = obj.owner;
  if (!owner || !owner.user || !owner.user.id || !owner.guild ||
      !owner.guild.id) {
    if (typeof owner === 'string' && typeof obj.guild === 'string') {
      owner = {user: {id: owner}, guild: {id: obj.guild}};
    } else {
      return null;
    }
  }
  const output = new Pet(owner, obj.name);
  if (obj.id) output.id = obj.id;
  return output;
};

module.exports = Pet;
