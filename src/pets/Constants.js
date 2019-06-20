// Copyright 2019 Campbell Crowley. All rights reserved.
// Author: Campbell Crowley (dev@campbellcrowley.com)
/**
 * @description Constant values for Pets.
 * @memberof Pets
 * @inner
 */
class Constants {
  /**
   * @description Amount of XP gained from winning a battle.
   * @type {number}
   * @default
   * @constant
   * @static
   */
  static get winXP() {
    return 50;
  }
  /**
   * @description Amount of XP gained from losing a battle.
   * @type {number}
   * @default
   * @constant
   * @static
   */
  static get loseXP() {
    return 10;
  }
  /**
   * @description Factor used in XP to level conversion.
   * @type {number}
   * @default
   * @constant
   */
  static get levelXPFactor() {
    return 100;
  }
}

module.exports = Constants;
