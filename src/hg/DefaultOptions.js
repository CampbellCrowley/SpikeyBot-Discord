// Copyright 2019 Campbell Crowley. All rights reserved.
// Author: Campbell Crowley (dev@campbellcrowley.com)

/**
 * Default options for a HungryGames.
 * @memberof HungryGames
 * @inner
 */
class DefaultOptions {
  /**
   *
   */
  constructor() {
    this._bloodbathOutcomeProbs = {
      value: {kill: 30, wound: 6, thrive: 8, revive: 0, nothing: 56},
      comment:
          'Relative probabilities of choosing an event with each outcome.' +
          ' This is for the bloodbath events.',
      category: 'probabilities',
    };
    this._playerOutcomeProbs = {
      value: {kill: 22, wound: 4, thrive: 8, revive: 6, nothing: 60},
      comment:
          'Relative probabilities of choosing an event with each outcome.' +
          ' This is for normal daily events.',
      category: 'probabilities',
    };
    this._arenaOutcomeProbs = {
      value: {kill: 64, wound: 10, thrive: 5, revive: 6, nothing: 15},
      comment:
          'Relative Probabilities of choosing an event with each outcome.' +
          ' This is for the special arena events.',
      category: 'probabilities',
    };
    this._arenaEvents = {
      value: true,
      comment:
          'Are arena events possible. (Events like wolf mutts, or a volcano ' +
          'erupting.)',
      category: 'probabilities',
    };
    this._includeBots = {
      value: false,
      comment: 'Should bots be included in the games. If this is false, bots ' +
          'cannot be added manually.',
      category: 'other',
    };
    this._excludeNewUsers = {
      value: false,
      comment: 'Should new users who join your server be excluded from the ' +
          'games by default. True will add all new users to the blacklist, ' +
          'false will put all new users into the next game automatically.',
      category: 'other',
    };
    this._allowNoVictors = {
      value: false,
      comment:
          'Should it be possible to end a game without any winners. If true, ' +
          'it is possible for every player to die, causing the game to end ' +
          'with everyone dead. False forces at least one winner.',
      category: 'features',
    };
    this._bleedDays = {
      value: 2,
      comment: 'Number of days a user can bleed before they can die.',
      category: 'other',
    };
    this._battleHealth = {
      value: 5,
      ranve: {min: 1, max: 10},
      comment: 'The amount of health each user gets for a battle.',
      category: 'other',
    };
    this._teamSize = {
      value: 0,
      comment: 'Maximum size of teams when automatically forming teams. 0 to ' +
          'disable teams',
      category: 'other',
    };
    this._teammatesCollaborate = {
      values: ['disabled', 'always', 'untilend'],
      value: 'always',
      comment: 'Will teammates work together. If disabled, teammates can kill' +
          ' eachother, and there will only be 1 victor. If enabled, teammates' +
          ' cannot kill eachother, and the game ends when one TEAM is ' +
          'remaining, not one player. Untilend means teammates work together ' +
          'until the end of the game, this means only there will be only 1 ' +
          'victor.',
      category: 'features',
    };
    this._useEnemyWeapon = {
      value: false,
      comment:
          'This will allow the attacker in an event to use the victim\'s ' +
          'weapon against them.',
      category: 'features',
    };
    this._mentionVictor = {
      value: false,
      comment:
          'Should the victor of the game (can be team), be tagged/mentioned ' +
          'so they get notified?',
      category: 'features',
    };
    this._mentionAll = {
      values: ['disabled', 'all', 'death'],
      value: 'disabled',
      comment:
          'Should a user be mentioned every time something happens to them ' +
          'in the game? (can be disabled, for all events, or for when the ' +
          'user dies)',
      category: 'features',
    };
    this._mentionEveryoneAtStart = {
      value: false,
      comment: 'Should @everyone be mentioned when the game is started?',
      category: 'features',
    };
    this._useNicknames = {
      value: false,
      comment: 'Should we use user\'s custom server nicknames instead of ' +
          'their account username? Names only change when a new game is ' +
          'created.',
      category: 'features',
    };
    this._delayEvents = {
      value: 3500,
      range: {min: 2500, max: 30000},
      time: true,
      comment: 'Delay in milliseconds between each event being printed.',
      category: 'other',
    };
    this._delayDays = {
      value: 7000,
      range: {min: 2500, max: 129600000},  // 1.5 days
      time: true,
      comment: 'Delay in milliseconds between each day being printed.',
      category: 'other',
    };
    this._probabilityOfArenaEvent = {
      value: 0.25,
      range: {min: 0, max: 1},
      percent: true,
      comment: 'Probability each day that an arena event will happen.',
      category: 'probabilities',
    };
    this._probabilityOfBleedToDeath = {
      value: 0.5,
      range: {min: 0, max: 1},
      percent: true,
      comment: 'Probability that after bleedDays a player will die. If they ' +
          'don\'t die, they will heal back to normal.',
      category: 'probabilities',
    };
    this._probabilityOfBattle = {
      value: 0.05,
      range: {min: 0, max: 1},
      percent: true,
      comment:
          'Probability of an event being replaced by a battle between two ' +
          'players.',
      category: 'probabilities',
    };
    this._probabilityOfUseWeapon = {
      value: 0.75,
      range: {min: 0, max: 1},
      percent: true,
      comment:
          'Probability of each player using their weapon each day if they ' +
          'have one.',
      category: 'probabilities',
    };
    this._eventAvatarSizes = {
      value: {avatar: 64, underline: 4, gap: 4},
      range: {min: 0, max: 512},
      comment:
          'The number of pixels each player\'s avatar will be tall and wide, ' +
          'the underline status height, and the gap between each avatar. This' +
          ' is for all normal events and arena event messages.',
      category: 'other',
    };
    this._battleAvatarSizes = {
      value: {avatar: 32, underline: 4, gap: 4},
      range: {min: 0, max: 512},
      comment:
          'The number of pixels each player\'s avatar will be tall and wide, ' +
          'the underline status height, and the gap between each avatar. This' +
          ' is for each battle turn.',
      category: 'other',
    };
    this._victorAvatarSizes = {
      value: {avatar: 80, underline: 4, gap: 4},
      range: {min: 0, max: 512},
      comment:
          'The number of pixels each player\'s avatar will be tall and wide, ' +
          'the underline status height, and the gap between each avatar. This' +
          ' is when announcing the winners of the game.',
      category: 'other',
    };
    this._numDaysShowDeath = {
      value: -1,
      range: {min: -1, max: 100},
      comment:
          'The number of days after a player has died to show them as dead in' +
          ' the status list after each day. -1 will always show dead players.' +
          ' 0 will never show dead players. 1 will only show them for the day' +
          ' they died. 2 will show them for 2 days.',
      category: 'other',
    };
    this._showLivingPlayers = {
      value: true,
      comment:
          'Include the living players in the status updates. Instead of only ' +
          'wounded or dead players.',
      category: 'other',
    };
    this._customEventWeight = {
      value: 2,
      range: {min: 0, max: 1000},
      comment:
          'The relative weight of custom events. 2 means custom events are ' +
          'twice as likely to be chosen.',
      category: 'probabilities',
    };
    this._disableOutput = {
      value: false,
      comment: 'Debugging purposes only. I mean, you can enable it, but it ma' +
          'kes the games really boring. Up to you ¯\\_(ツ)_/¯',
      category: 'other',
    };
  }
}

/**
 * Option base.
 * @memberof HungryGames~DefaultOptions
 * @inner
 */
class Option {
  /**
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
   * Get the value of this option.
   * @public
   * @type {*}
   */
  get value() {
    return this._value;
  }
  /**
   * Get the description of this option.
   * @public
   * @type {?string
   */
  get comment() {
    return this._comment;
  }
  /**
   * Get the category of this option.
   * @public
   * @type {?string}
   */
  get category() {
    return this._category;
  }
}

/**
 * Boolean option.
 * @memberof DefaultOptions
 * @inner
 * @extends HungryGames~DefaultOptions~Option
 */
class BooleanOption extends Option {
  /**
   * @inheritdoc
   * @param {boolean} value
   */
  constructor(value, comment, category) {
    if (typeof value !== 'boolean') throw new Error('Value is not a boolean');
    super(value, comment, category);
  }
}

/**
 * Object option. Shallow copies passed value and range.
 * @memberof DefaultOptions
 * @inner
 * @extends HungryGames~DefaultOptions~Option
 */
class ObjectOption extends Option {
  /**
   * @inheritdoc
   * @param {Object} value
   * @param {{min: number, max: number}} [range] Range of allowable values for
   * this option.
   */
  constructor(value, comment, category, range) {
    if (typeof value !== 'object') throw new Error('Value is not an object');
    value = Object.assign({}, value);
    super(value, comment, category);
    if (range) {
      this._range = {min: range.min, max: range.max};
    }
  }
  /**
   * Get the range of allowable values for this option.
   * @returns {{min: number, max: number}}
   */
  get range() {
    return this._range;
  }
}

/**
 * String option.
 * @memberof DefaultOptions
 * @inner
 * @extends HungryGames~DefaultOptions~Option
 */
class StringOption extends Option {
  /**
   * @inheritdoc
   * @param {string} value
   */
  constructor(value, comment, category) {

  }
}

module.exports = DefaultOptions;
