// Copyright 2019 Campbell Crowley. All rights reserved.
// Author: Campbell Crowley (dev@campbellcrowley.com)
const Pet = require('Pet.js');

/**
 * @description Creates a Pet with random stats for battling against a player.
 * @memberof Pets
 * @inner
 * @augments Pets~Pet
 */
class NPC extends Pet {
  /**
   * @description Create an NPC based off the opponent data, or at the given
   * level.
   * @param {number|Pets~Pet} base Amount of XP to give this npc, or a pet to
   * base the data off of.
   * @param {Pets~BasePets} pets Information of available pets.
   * // @param {Pets~BaseMoves} moves Information of base moves.
   */
  constructor(base, pets /* , moves*/) {
    const pet = pets.random();
    super(null, pet.name, pet.id);

    this.xp = 0;
    this.addXP((base instanceof Pet) ? base.xp : base, true);
  }
}

module.exports = NPC;
