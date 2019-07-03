// Copyright 2019 Campbell Crowley. All rights reserved.
// Author: Campbell Crowley (dev@campbellcrowley.com)
const Locale = require('../../src/locale/Locale.js');

/**
 * @description United States English.
 * @augments Locale
 */
class EnUsPets extends Locale {
  /**
   * @description Constructor.
   */
  constructor() {
    super();
    this.title = 'Pets';
    this.noPet = 'You don\'t have a pet.\nType `{}adopt` to get a new pet.';
    this.noSpecies = 'Please specify a valid species and a name for your pet.';
    this.invalidSpecies = 'That is not an available species.';
    this.availableSpeciesInfo =
        'See https://www.spikeybot.com/pets/ for available options.';
    this.invalidName =
        'Please specify a valid name for your pet after the species.';
    this.nameInstructions = 'Name must be between {} and {} characters.';
    this.confirmAdopt = 'Adopt a {} named {}?\n{}: yes, {}: no';
    this.commandTimedOut = 'Timed out, enter command again.';
    this.cancelled = 'Cancelled';
    this.confirmed = 'Confirmed';
    this.adoptionConfirmed =
        'Adopted {}!\nCongratulations! {} is now your pet!';
    this.alreadyHavePet =
        'You already have a pet! It deserves your undivided love.';
  }
}

module.exports = new EnUsPets();
