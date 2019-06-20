// Copyright 2019 Campbell Crowley. All rights reserved.
// Author: Campbell Crowley (dev@campbellcrowley.com)
const crypto = require('crypto');
const c = require('./Constants.js');

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
    this.addXP = this.addXP.bind(this);
    this.numPoints = this.numPoints.bind(this);
    this.spendPoint = this.spendPoint.bind(this);
    this.autoLevelUp = this.autoLevelUp.bind(this);
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

  /**
   * @description Add XP to the pet, and trigger any level-up actions that may
   * need to occur.
   *
   * @public
   * @param {number} xp Amount of XP to add.
   * @param {boolean} [auto=false] Auto level up after adding XP.
   */
  addXP(xp, auto = false) {
    if (typeof xp !== 'number' || isNaN(xp)) {
      throw new TypeError('xp is not a number');
    }
    this.xp += xp;
    if (auto) this.autoLevelUp();
  }

  /**
   * @description Get the number of remaining points available to spend on
   * modifiers.
   *
   * @public
   * @returns {number} Number of spendable points.
   */
  get numPoints() {
    return this.getLevel(this.xp) -
        (this.attackMod + this.defenseMod + this.speedMod);
  }

  /**
   * @description Spend points on a given modifier.
   *
   * @public
   * @param {string} category The name of the modifier to spend the points on.
   * @param {number} [num=1] The number of points to spend.
   */
  spendPoint(category, num = 1) {
    const remaining = this.numPoints;
    if (num > remaining) num = remaining;
    if (num == 0) return;
    if (num < 0) {
      throw new Error(
          'Attempted to spend negative amount of points. (' + num + ')');
    }
    switch (category) {
      default:
        throw new Error('Unknown modifier: ' + category);
      case 'speed':
        this.speedMod += num;
        break;
      case 'attack':
        this.attackMod += num;
        break;
      case 'defense':
        this.defenseMod += num;
        break;
    }
  }

  /**
   * @description Automatically spend all remaining modifier points
   * automatically until all are used up.
   *
   * @public
   */
  autoLevelUp() {
    while (this.numPoints > 0) {
      let least = 'attack';
      if (this.defenseMod < this.attackMod && this.defenseMod < this.speedMod) {
        least = 'defense';
      } else if (
        this.speedMod < this.defenseMod && this.speedMod < this.attackMod) {
        least = 'speed';
      }
      this.spendPoint(least);
    }
  }

  /**
   * @description Signal this pet just won a battle, and update accordingly.
   * @public
   */
  wonBattle() {
    this.xp += c.winXP;
  }
  /**
   * @description Signal this pet just lost a battle, and update accordingly.
   * @public
   */
  lostBattle() {
    this.xp += c.loseXP;
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

/**
 * @description Calculate the required amount of XP for the given level.
 *
 * This function provides a very steep curve for levelling up. This is to help
 * prevent extremely high leveled characters, and to encourage players to play
 * a lot in order to level up. This is attempting to follow the similar
 * structure to D&D since I wish to have a similar timeline for character
 * development and play speed (characters can last for months and take weeks
 * to level up).
 *
 * @public
 * @static
 * @param {number} level The level number to calculate the required XP for.
 * @returns {number} XP required to be the given level.
 */
Pet.levelXP = function(level) {
  return c.levelXPFactor * (level * level) - (c.levelXPFactor * level);
};

/**
 * @description Get the level number for the given amount of XP. Uses
 * {@link Pets~Pet.levelXP} to calculate.
 *
 * @public
 * @static
 * @param {number} xp The amount of XP to find the level number for.
 * @returns {number} The level number for the amount of XP.
 */
Pet.getLevel = function(xp) {
  let level = 0;
  do {
    level++;
  } while (Pet.levelXP(level) <= xp);
  return level - 1;
};

module.exports = Pet;
