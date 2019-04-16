// Copyright 2019 Campbell Crowley. All rights reserved.
// Author: Campbell Crowley (dev@campbellcrowley.com)

/**
 * Option base.
 * @memberof HungryGames~DefaultOptions
 * @inner
 */
class Option {
  /**
   * @description Default option constructor.
   * @param {*} value Value of this option.
   * @param {?string} [comment=null] Comment/description for the user about this
   * option.
   * @param {?string} [category=null] Category this option falls under for
   * showing user.
   */
  constructor(value, comment = null, category = null) {
    this._value = value;
    if (comment != null && typeof comment !== 'string') {
      throw new Error('Comment is not a string');
    }
    this._comment = comment;
    if (category != null && typeof category !== 'string') {
      throw new Error('Category is not a string');
    }
    this._category = category;
  }
  /**
   * @description Get the value of this option.
   * @public
   * @type {*}
   */
  get value() {
    return this._value;
  }
  /**
   * @description Get the description of this option.
   * @public
   * @type {?string}
   */
  get comment() {
    return this._comment;
  }
  /**
   * @description Get the category of this option.
   * @public
   * @type {?string}
   */
  get category() {
    return this._category;
  }
}

/**
 * Number option.
 * @memberof HungryGames~DefaultOptions
 * @inner
 * @extends HungryGames~DefaultOptions~Option
 */
class NumberOption extends Option {
  /**
   * @description Stores a number value with optional range.
   * @param {number} value Value of this option.
   * @param {?string} [comment=null] Comment/description for the user about this
   * option.
   * @param {?string} [category=null] Category this option falls under for
   * showing user.
   * @param {{min: number, max: number}} [range] Allowed range of this value.
   */
  constructor(value, comment, category, range) {
    if (typeof value !== 'number' || isNaN(value)) {
      throw new Error('Value is not a number');
    }
    super(value, comment, category);
    if (range) {
      this._range = {min: range.min, max: range.max};
    } else {
      this._range = null;
    }
  }
}
/**
 * Boolean option.
 * @memberof HungryGames~DefaultOptions
 * @inner
 * @extends HungryGames~DefaultOptions~Option
 */
class BooleanOption extends Option {
  /**
   * @description Stores a boolean.
   * @param {boolean} value Value of this option.
   * @param {?string} [comment=null] Comment/description for the user about this
   * option.
   * @param {?string} [category=null] Category this option falls under for
   * showing user.
   */
  constructor(value, comment, category) {
    if (typeof value !== 'boolean') throw new Error('Value is not a boolean');
    super(value, comment, category);
  }
}

/**
 * Object option. Shallow copies passed value and range.
 * @memberof HungryGames~DefaultOptions
 * @inner
 * @extends HungryGames~DefaultOptions~Option
 */
class ObjectOption extends Option {
  /**
   * @description Stores any object. Shallow copies the object using
   * Object.assign.
   * @param {Object} value Value of this option.
   * @param {?string} [comment=null] Comment/description for the user about this
   * option.
   * @param {?string} [category=null] Category this option falls under for
   * showing user.
   * @param {{min: number, max: number}} [range] Range of allowable values for
   * this option.
   */
  constructor(value, comment, category, range) {
    if (typeof value !== 'object') throw new Error('Value is not an object');
    value = Object.assign({}, value);
    super(value, comment, category);
    if (range) {
      this._range = {min: range.min, max: range.max};
    } else {
      this._range = null;
    }
  }
  /**
   * @description Get the range of allowable values for this option.
   * @returns {?{min: number, max: number}} Allowable range of values.
   */
  get range() {
    return this._range;
  }
}

/**
 * One of multiple choices option.
 * @memberof HungryGames~DefaultOptions
 * @inner
 * @extends HungryGames~DefaultOptions~Option
 */
class SelectOption extends Option {
  /**
   * @description Allows an option from a set of possible values.
   * @param {string} value Value of this option.
   * @param {?string} [comment=null] Comment/description for the user about this
   * option.
   * @param {?string} [category=null] Category this option falls under for
   * showing user.
   * @param {string[]} values Possible values.
   */
  constructor(value, comment, category, values) {
    if (!values || !Array.isArray(values)) {
      throw new Error('Values is not array of strings');
    }
    let included = false;
    for (let i = 0; i < values.length; i++) {
      if (typeof values[i] !== 'string') {
        throw new Error('Values is not array of strings');
      } else if (values[i] === value) {
        included = true;
      }
    }
    if (!included) throw new Error('Value is not in given values');
    super(value, comment, category);
    this._values = values.slice(0);
  }
  /**
   * @description Get possible values for this option.
   * @returns {string[]} Array of possible values.
   */
  get values() {
    return this._values;
  }
}

/**
 * Default options for a HungryGames.
 * @memberof HungryGames
 * @inner
 */
class DefaultOptions {
  /**
   * @description Creates a set of default options for a HungryGames.
   */
  constructor() {
    this._bloodbathOutcomeProbs = new ObjectOption(
        {kill: 30, wound: 6, thrive: 8, revive: 0, nothing: 56},
        'Relative probabilities of choosing an event with each outcome. This ' +
            'is for the bloodbath events.',
        'probabilities');
    this._playerOutcomeProbs = new ObjectOption(
        {kill: 22, wound: 4, thrive: 8, revive: 6, nothing: 60},
        'Relative probabilities of choosing an event with each outcome. This ' +
            'is for normal daily events.',
        'probabilities');
    this._arenaOutcomeProbs = new ObjectOption(
        {kill: 64, wound: 10, thrive: 5, revive: 6, nothing: 15},
        'Relative Probabilities of choosing an event with each outcome. This ' +
            'is for the special arena events.',
        'probabilities');
    this._arenaEvents = new BooleanOption(
        true,
        'Are arena events possible. (Events like wolf mutts, or a volcano ' +
            'erupting.)',
        'probabilities');
    this._includeBots = new BooleanOption(
        false, 'Should bots be included in the games. If this is false, bots ' +
            'cannot be added manually.',
        'other');
    this._excludeNewUsers = new BooleanOption(
        false, 'Should new users who join your server be excluded from the ' +
            'games by default. True will add all new users to the blacklist, ' +
            'false will put all new users into the next game automatically.',
        'other');
    this._allowNoVictors = new BooleanOption(
        false,
        'Should it be possible to end a game without any winners. If true, ' +
            'it is possible for every player to die, causing the game to end ' +
            'with everyone dead. False forces at least one winner.',
        'features');
    this._bleedDays = new NumberOption(
        2, 'Number of days a user can bleed before they can die.', 'other');
    this._battleHealth = new NumberOption(
        5, 'The amount of health each user gets for a battle.', 'other',
        {min: 1, max: 10});
    this._teamSize = new NumberOption(
        0, 'Maximum size of teams when automatically forming teams. 0 to ' +
            'disable teams',
        'other');
    this._teammatesCollaborate = new SelectOption(
        'always',
        'Will teammates work together. If disabled, teammates can kill ' +
            'eachother, and there will only be 1 victor. If enabled, ' +
            'teammates cannot kill eachother, and the game ends when one TEAM' +
            ' is remaining, not one player. Untilend means teammates work ' +
            'together until the end of the game, this means only there will ' +
            'be only 1 victor.',
        'features', ['disabled', 'always', 'untilend']);
    this._useEnemyWeapon = new BooleanOption(
        false,
        'This will allow the attacker in an event to use the victim\'s ' +
            'weapon against them.',
        'features');
    this._mentionVictor = new BooleanOption(
        false,
        'Should the victor of the game (can be team), be tagged/mentioned ' +
            'so they get notified?',
        'features');
    this._mentionAll = new SelectOption(
        'disabled',
        'Should a user be mentioned every time something happens to them ' +
            'in the game? (can be disabled, for all events, or for when the ' +
            'user dies)',
        'features', ['disabled', 'all', 'death']);
    this._mentionEveryoneAtStart = new BooleanOption(
        false, 'Should @everyone be mentioned when the game is started?',
        'features');
    this._useNicknames = new BooleanOption(
        false, 'Should we use user\'s custom server nicknames instead of ' +
            'their account username? Names only change when a new game is ' +
            'created.',
        'features');
    this._delayEvents = new NumberOption(
        3500, 'Delay in milliseconds between each event being printed.',
        'other', {min: 2500, max: 30000}, 'time');
    this._delayDays = new NumberOption(
        7000, 'Delay in milliseconds between each day being printed.', 'other',
        {min: 2500, max: 129600000},  // 1.5 days
        'time');
    this._probabilityOfArenaEvent = new NumberOption(
        0.25, 'Probability each day that an arena event will happen.',
        'probabilities', {min: 0, max: 1}, 'percent');
    this._probabilityOfBleedToDeath = new NumberOption(
        0.5, 'Probability that after bleedDays a player will die. If they ' +
            'don\'t die, they will heal back to normal.',
        'probabilities', {min: 0, max: 1}, 'percent');
    this._probabilityOfBattle = new NumberOption(
        0.05,
        'Probability of an event being replaced by a battle between two ' +
            'players.',
        'probabilities', {min: 0, max: 1}, 'percent');
    this._probabilityOfUseWeapon = new NumberOption(
        0.75,
        'Probability of each player using their weapon each day if they ' +
            'have one.',
        'probabilities', {min: 0, max: 1}, 'percent');
    this._eventAvatarSizes = new ObjectOption(
        {avatar: 64, underline: 4, gap: 4},
        'The number of pixels each player\'s avatar will be tall and wide, ' +
            'the underline status height, and the gap between each avatar. ' +
            'This is for all normal events and arena event messages.',
        'other', {min: 0, max: 512});
    this._battleAvatarSizes = new ObjectOption(
        {avatar: 32, underline: 4, gap: 4},
        'The number of pixels each player\'s avatar will be tall and wide, ' +
            'the underline status height, and the gap between each avatar. ' +
            'This is for each battle turn.',
        'other', {min: 0, max: 512});
    this._victorAvatarSizes = new ObjectOption(
        {avatar: 80, underline: 4, gap: 4},
        'The number of pixels each player\'s avatar will be tall and wide, ' +
            'the underline status height, and the gap between each avatar. ' +
            'This is when announcing the winners of the game.',
        'other', {min: 0, max: 512});
    this._numDaysShowDeath = new NumberOption(
        -1,
        'The number of days after a player has died to show them as dead in' +
            ' the status list after each day. -1 will always show dead ' +
            'players. 0 will never show dead players. 1 will only show them ' +
            'for the day they died. 2 will show them for 2 days.',
        'other', {min: -1, max: 100});
    this._showLivingPlayers = new BooleanOption(
        true,
        'Include the living players in the status updates. Instead of only ' +
            'wounded or dead players.',
        'other');
    this._customEventWeight = new NumberOption(
        2, 'The relative weight of custom events. 2 means custom events are ' +
            'twice as likely to be chosen.',
        'probabilities', {min: 0, max: 1000});
    this._disableOutput = new BooleanOption(
        false, 'Debugging purposes only. I mean, you can enable it, but it ma' +
            'kes the games really boring. Up to you ¯\\_(ツ)_/¯',
        'other');
  }

  /**
   * @description Get bloodbathOutcomeProbs.
   * @returns {ObjectOption} Prob opts.
   */
  get bloodbathOutcomeProbs() {
    return this._bloodbathOutcomeProbs;
  }
  /**
   * @description Get playerOutcomeProbs.
   * @returns {ObjectOption} Prob opts.
   */
  get playerOutcomeProbs() {
    return this._playerOutcomeProbs;
  }
  /**
   * @description Get arenaOutcomeProbs.
   * @returns {ObjectOption} Prob opts.
   */
  get arenaOutcomeProbs() {
    return this._arenaOutcomeProbs;
  }
  /**
   * @description Get arenaEvents.
   * @returns {BooleanOption} Option value.
   */
  get arenaEvents() {
    return this._arenaEvents;
  }
  /**
   * @description Get includeBots.
   * @returns {BooleanOption} Option value.
   */
  get includeBots() {
    return this._includeBots;
  }
  /**
   * @description Get excludeNewUsers.
   * @returns {BooleanOption} Option value.
   */
  get excludeNewUsers() {
    return this._excludeNewUsers;
  }
  /**
   * @description Get allowNoVictors.
   * @returns {BooleanOption} Option value.
   */
  get allowNoVictors() {
    return this._allowNoVictors;
  }
  /**
   * @description Get bleedDays.
   * @returns {NumberOption} Option value.
   */
  get bleedDays() {
    return this._bleedDays;
  }
  /**
   * @description Get battleHealth.
   * @returns {NumberOption} Option value.
   */
  get battleHealth() {
    return this._battleHealth;
  }
  /**
   * @description Get teamSize.
   * @returns {NumberOption} Option value.
   */
  get teamSize() {
    return this._teamSize;
  }
  /**
   * @description Get teammatesCollaborate.
   * @returns {BooleanOption} Option value.
   */
  get teammatesCollaborate() {
    return this._teammatesCollaborate;
  }
  /**
   * @description Get useEnemyWeapon.
   * @returns {BooleanOption} Option value.
   */
  get useEnemyWeapon() {
    return this._useEnemyWeapon;
  }
  /**
   * @description Get mentionVictor.
   * @returns {BooleanOption} Option value.
   */
  get mentionVictor() {
    return this._mentionVictor;
  }
  /**
   * @description Get mentionAll.
   * @returns {SelectOption} Option value.
   */
  get mentionAll() {
    return this._mentionAll;
  }
  /**
   * @description Get mentionEveryoneAtStart.
   * @returns {BooleanOption} Option value.
   */
  get mentionEveryoneAtStart() {
    return this._mentionEveryoneAtStart;
  }
  /**
   * @description Get useNicknames.
   * @returns {BooleanOption} Option value.
   */
  get useNicknames() {
    return this._useNicknames;
  }
  /**
   * @description Get delayEvents.
   * @returns {NumberOption} Option value.
   */
  get delayEvents() {
    return this._delayEvents;
  }
  /**
   * @description Get delayDays.
   * @returns {NumberOption} Option value.
   */
  get delayDays() {
    return this._delayDays;
  }
  /**
   * @description Get probabilityOfArenaEvent.
   * @returns {NumberOption} Option value.
   */
  get probabilityOfArenaEvent() {
    return this._probabilityOfArenaEvent;
  }
  /**
   * @description Get probabilityOfBleedToDeath.
   * @returns {NumberOption} Option value.
   */
  get probabilityOfBleedToDeath() {
    return this._probabilityOfBleedToDeath;
  }
  /**
   * @description Get probabilityOfBattle.
   * @returns {NumberOption} Option value.
   */
  get probabilityOfBattle() {
    return this._probabilityOfBattle;
  }
  /**
   * @description Get probabilityOfUseWeapon.
   * @returns {NumberOption} Option value.
   */
  get probabilityOfUseWeapon() {
    return this._probabilityOfUseWeapon;
  }
  /**
   * @description Get eventAvatarSizes.
   * @returns {ObjectOption} Option value.
   */
  get eventAvatarSizes() {
    return this._eventAvatarSizes;
  }
  /**
   * @description Get battleAvatarSizes.
   * @returns {ObjectOption} Option value.
   */
  get battleAvatarSizes() {
    return this._battleAvatarSizes;
  }
  /**
   * @description Get victorAvatarSizes.
   * @returns {ObjectOption} Option value.
   */
  get victorAvatarSizes() {
    return this._victorAvatarSizes;
  }
  /**
   * @description Get numDaysShowDeath.
   * @returns {NumberOption} Option value.
   */
  get numDaysShowDeath() {
    return this._numDaysShowDeath;
  }
  /**
   * @description Get showLivingPlayers.
   * @returns {BooleanOption} Option value.
   */
  get showLivingPlayers() {
    return this._showLivingPlayers;
  }
  /**
   * @description Get customEventWeight.
   * @returns {NumberOption} Option value.
   */
  get customEventWeight() {
    return this._customEventWeight;
  }
  /**
   * @description Get disableOutput.
   * @returns {BooleanOption} Option value.
   */
  get disableOutput() {
    return this._disableOutput;
  }

  /**
   * @returns {string[]} Array of all default option keys.
   */
  get keys() {
    const all = Object.entries(Object.getOwnPropertyDescriptors(this));
    const output = [];
    for (const one of all) {
      if (one[1].value instanceof Option) {
        output.push(one[0].slice(1));
      }
    }
    return output;
  }
}

module.exports = DefaultOptions;
