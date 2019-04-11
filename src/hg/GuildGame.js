// Copyright 2019 Campbell Crowley. All rights reserved.
// Author: Campbell Crowley (dev@campbellcrowley.com)
const Game = require('./Game.js');
const Event = require('./Event.js');

/**
 * @classdesc A single instance of a game in a guild.
 * @class HungryGames~GuildGame
 *
 * @param {string} id Guild id of the Guild that this object is for.
 * @param {Object.<number|boolean|string|Object>} options The game options.
 * @param {string} [name] Name of this game to be passed to the Game object.
 * @param {string[]|HungryGames~Player[]} [includedUsers] Array of user IDs that
 * will be included in the next game, or array of Players to include.
 * @param {string[]} [excludedUsers] Array of user IDs that have been
 * excluded from the games.
 * @param {HungryGames~NPC[]} [includedNPCs] Array of NPC objects to include in
 * the game.
 * @param {HungryGames~NPC[]} [excludedNPCs] Array of NPC objects to exclude
 * from the game.
 * @param {
 *   {
 *     bloodbath: HungryGames~Event[],
 *     player: HungryGames~Event[],
 *     weapon: Object.<HungryGames~WeaponEvent>,
 *     arena: HungryGames~ArenaEvent[]
 *   }
 * } [customEvents] All custom events for the guild.
 * @param {
 *   {
 *     bloodbath: HungryGames~Event[],
 *     player: HungryGames~Event[],
 *     weapon: Object.<Array.<HungryGames~Event>>,
 *     arena: Object.<Array.<HungryGames~Event>>
 *   }
 * } [disabledEvents] All disabled events for the guild.
 */
function GuildGame(
    id, options, name, includedUsers, excludedUsers, includedNPCs, excludedNPCs,
    customEvents, disabledEvents) {
  /**
   * The ID of the Guild this is for.
   * @public
   * @type {string}
   */
  this.id = id;
  /**
   * Array of user IDs that will be included in the next game.
   * @public
   * @type {string[]}
   * @default []
   */
  this.includedUsers = [];
  if (Array.isArray(includedUsers)) {
    for (let i = 0; i < includedUsers.length; i++) {
      if (typeof includedUsers[i] === 'string') {
        this.includedUsers.push(includedUsers.splice(i, 1)[0]);
      } else {
        this.includedUsers.push(includedUsers[i].id);
      }
    }
  }
  /**
   * Array of user IDs that will be excluded from the next game.
   * @public
   * @type {string[]}
   * @default []
   */
  this.excludedUsers = excludedUsers || [];
  /**
   * Array of NPCs that will be included in the game.
   * @public
   * @type {HungryGames~NPC[]}
   * @default []
   */
  this.includedNPCs = includedNPCs || [];
  /**
   * Array of NPCs that will be excluded from the game.
   * @public
   * @type {HungryGames~NPC[]}
   * @default []
   */
  this.excludedNPCs = excludedNPCs || [];
  /**
   * Game options.
   * @public
   * @type {Object}
   */
  this.options = options;
  /**
   * Is this game autoplaying?
   * @public
   * @type {boolean}
   * @default false
   */
  this.autoPlay = false;
  /**
   * All custom events for the guild.
   * @public
   * @type {
   *   {
   *     bloodbath: HungryGames~Event[],
   *     player: HungryGames~Event[],
   *     weapon: Object.<HungryGames~WeaponEvent>,
   *     arena: HungryGames~ArenaEvent[]
   *   }
   * }
   * @default {{bloodbath: [], player: [], arena: [], weapon: {}}}
   */
  this.customEvents =
      customEvents || {bloodbath: [], player: [], arena: [], weapon: {}};

  // Force custom events to have custom event flag. (This is here due to
  // updating from previous version without custom event flag).
  if (this.customEvents) {
    for (const cat of Object.values(this.customEvents)) {
      for (const evt of Object.values(cat)) {
        if (typeof evt === 'object') evt.custom = true;
      }
    }
  }

  /**
   * Current game information.
   * @public
   * @type {HungryGames~Game}
   * @default
   */
  this.currentGame = new Game(name, includedUsers);
  /**
   * Disabled event information. These events are not allowed to show up in the
   * game.
   * @public
   * @type {
   *   {
   *     bloodbath: HungryGames~Event[],
   *     player: HungryGames~Event[],
   *     weapon: Object.<Array.<HungryGames~Event>>,
   *     arena: Object.<Array.<HungryGames~Event>>
   *   }
   * }
   * @default {{bloodbath: [], player: [], arena: {}, weapon: {}}}
   */
  this.disabledEvents =
      disabledEvents || {bloodbath: [], player: [], arena: {}, weapon: {}};

  /**
   * The channel id a command was last sent from that affected this guild game.
   * @public
   * @type {?string}
   * @default
   */
  this.channel = null;
  /**
   * The id of the user that last sent a command which interacted with this
   * guild game.
   * @public
   * @type {?string}
   * @default
   */
  this.author = null;

  /**
   * The channel id where the game messages are currently being sent in.
   * @public
   * @type {?string}
   * @default
   */
  this.outputChannel = null;

  /**
   * Message ID of the message to fetch reactions from for join via react.
   * @public
   * @type {?{id: string, channel: string}}
   * @default
   */
  this.reactMessage = null;

  /**
   * Interval
   */
  let dayEventInterval = null;

  /**
   * Force a player to have a certain outcome in the current day being
   * simulated, or the next day that will be simulated. This is acheived by
   * adding a custom event in which the player will be affected after their
   * normal event for the day.
   *
   * @public
   *
   * @param {string[]} list The array of player IDs of which to affect.
   * @param {string} state The outcome to force the players to have been
   * victims of by the end of the simulated day. ("living", "dead", "wounded",
   * or "thriving").
   * @param {HungryGames~Messages} messages Reference to current Messages
   * instance.
   * @param {string} [text] Message to show when the user is affected.
   * @param {boolean} [persists=false] Does this outcome persist to the end of
   * the game, if false it only exists for the next day.
   * @returns {string} The output message to tell the user of the outcome of the
   * operation.
   */
  this.forcePlayerState = function(
      list, state, messages, text, persists = false) {
    if (typeof list === 'object') {
      persists = list.persists;
      messages = state;
      text = list.text;
      state = list.state;
      list = list.list;
    }
    if (!Array.isArray(list) || list.length == 0) return 'No players given.';
    if (typeof state !== 'string') return 'No outcome given.';
    list.forEach((p) => {
      if (this.currentGame.day.state > 0) {
        const player = this.currentGame.includedUsers.find((el) => el.id == p);
        if (!player) return 'Unable to find player.';
        let outcome;
        if (player.living && state === 'dead') {
          outcome = 'dies';
          this.killUser(player, 0, null);
        } else if (
          !player.living && (state === 'living' || state === 'thriving')) {
          outcome = 'revived';
          this.reviveUser(player, 0, null);
        } else if (player.state === 'wounded' && state === 'thriving') {
          outcome = 'thrives';
          this.restoreUser(player, 0, null);
        } else if (
          player.living && player.state !== 'wounded' &&
            state === 'wounded') {
          outcome = 'wounded';
          this.woundUser(player, 0, null);
        } else {
          return;
        }
        if (typeof text !== 'string' || text.length == 0) {
          switch (state) {
            case 'dead':
              text = messages.get('forcedDeath');
              break;
            case 'thriving':
              text = messages.get('forcedHeal');
              break;
            case 'wounded':
              text = messages.get('forcedWound');
              break;
          }
        }
        const evt =
            Event.finalize(text, [player], 1, 0, outcome, 'nothing', this);
        let lastIndex = this.currentGame.day.state - 1;
        for (let i = this.currentGame.day.events.length - 1; i > lastIndex;
          i--) {
          if (this.currentGame.day.events[i].icons.find(
              (el) => el.id == p)) {
            lastIndex = i + 1;
            break;
          }
        }
        this.currentGame.day.events.splice(lastIndex, 0, evt);
      } else {
        this.currentGame.forcedOutcomes.push({
          id: this.id,
          list: list,
          state: state,
          text: text,
          persists: persists,
        });
      }
    });
    return `Player(s) will be ${state} by the end of the day.`;
  };

  this.end = function() {
    this.currentGame.inProgress = false;
    this.currentGame.isPaused = false;
    this.currentGame.ended = true;
    this.autoPlay = false;
    clearInterval(dayEventInterval);
    clearTimeout(autoPlayTimeout);
    dayEventInterval = null;
    autoPlayTimeout = null;
  };
}

/**
 * Create a GuildGame from data parsed from file. Similar to copy constructor.
 *
 * @public
 * @param {Object} data GuildGame like object.
 * @returns {HungryGames~GuildGame}
 */
GuildGame.from = function(data) {
  const game = new GuildGame(
      data.id, data.options, data.name, data.includedUsers, data.excludedUsers,
      data.includedNPCs, data.excludedNPCs, data.customEvents,
      data.disabledEvents);
  game.autoPlay = data.autoPlay || false;
  game.reactMessage = data.reactMessage || null;
  game.channel = data.channel || null;
  game.author = data.author || null;
  game.outputChannel = data.outputChannel || null;
  if (data.currentGame) {
    game.currentGame = Game.from(data.currentGame);
  }
  return game;
};

module.exports = GuildGame;
