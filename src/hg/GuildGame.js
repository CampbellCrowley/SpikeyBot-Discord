// Copyright 2019 Campbell Crowley. All rights reserved.
// Author: Campbell Crowley (dev@campbellcrowley.com)
const Game = require('./Game.js');
const Event = require('./Event.js');
const Team = require('./Team.js');
const Simulator = require('./Simulator.js');

/**
 * A single instance of a game in a guild.
 * @memberof HungryGames
 * @inner
 */
class GuildGame {
  /**
   * @description Create a game instance for a single guild.
   * @param {string} id Guild id of the Guild that this object is for.
   * @param {Object.<number|boolean|string|Object>} options The game options.
   * @param {string} [name] Name of this game to be passed to the Game object.
   * @param {string[]|HungryGames~Player[]} [includedUsers] Array of user IDs
   * that will be included in the next game, or array of Players to include.
   * @param {string[]} [excludedUsers] Array of user IDs that have been
   * excluded from the games.
   * @param {HungryGames~NPC[]} [includedNPCs] Array of NPC objects to include
   * in the game.
   * @param {HungryGames~NPC[]} [excludedNPCs] Array of NPC objects to exclude
   * from the game.
   * @param {{
   * bloodbath: HungryGames~Event[],
   * player: HungryGames~Event[],
   * weapon: Object.<HungryGames~WeaponEvent>,
   * arena: HungryGames~ArenaEvent[]
   * }} [customEvents] All custom events for the guild.
   * @param {{
   * bloodbath: HungryGames~Event[],
   * player: HungryGames~Event[],
   * weapon: Object.<Array.<HungryGames~Event>>,
   * arena: Object.<Array.<HungryGames~Event>>
   * }} [disabledEvents] All disabled events for the guild.
   */
  constructor(
      id, options, name, includedUsers, excludedUsers, includedNPCs,
      excludedNPCs, customEvents, disabledEvents) {
    this.step = this.step.bind(this);
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
     * Is this game automatically stepping, or are steps controlled manually.
     * @private
     * @type {boolean}
     * @default false
     */
    this._autoStep = false;
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
     * Disabled event information. These events are not allowed to show up in
     * the game.
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
     * The channel id a command was last sent from that affected this guild
     * game.
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
     * Interval for day events.
     * @private
     * @type {?Timeout}
     * @default
     */
    this._dayEventInterval = null;
    /**
     * The timeout to continue autoplaying after the day ends. Used for
     * cancelling if user ends the game between days.
     *
     * @private
     * @type {?Timeout}
     * @default
     */
    this._autoPlayTimeout = null;

    /**
     * Function to call when state is modified.
     * @private
     * @type {?HungryGames~GuildGame~StateUpdateCB}
     * @default
     */
    this._stateUpdateCallback = null;
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
   * @description Callback to fire when game state is about to be modified.
   * @callback HungryGames~GuildGame~StateUpdateCB
   * @param {boolean} dayComplete True if this update is after a day has ended,
   * false if the state is still during a day.
   * @param {boolean} doSim True if the next day should be simulated and
   * started.
   */

  /**
   * @description Add users to teams, and remove excluded users from teams.
   * Deletes empty teams, and adds teams once all teams have teamSize of
   * players.
   *
   * @public
   * @returns {?string} Null if success, string if error.
   */
  formTeams() {
    if (this.options.teamSize < 0) this.options.teamSize = 0;
    if (this.options.teamSize == 0) {
      this.currentGame.teams = [];
      return;
    }

    let corruptTeam = false;

    const teamSize = this.options.teamSize;
    const numTeams =
        Math.ceil(this.currentGame.includedUsers.length / teamSize);
    // If teams already exist, update them. Otherwise, create new teams.
    if (this.currentGame.teams && this.currentGame.teams.length > 0) {
      this.currentGame.teams.forEach((obj) => {
        obj.players.forEach((p) => {
          if (typeof p !== 'string' && typeof p !== 'number') {
            corruptTeam = true;
            console.error(
                '(PreTeamForm) Player in team is invalid: ' + typeof p +
                ' in team ' + obj.id + ' guild: ' + this.id + ' players: ' +
                JSON.stringify(obj.players));
          }
        });
      });

      this.currentGame.teams.sort((a, b) => {
        return a.id - b.id;
      });
      const notIncluded = this.currentGame.includedUsers.slice(0);
      // Remove players from teams if they are no longer included in game.
      for (let i = 0; i < this.currentGame.teams.length; i++) {
        const team = this.currentGame.teams[i];
        team.id = i;
        for (let j = 0; j < team.players.length; j++) {
          if (this.currentGame.includedUsers.findIndex((obj) => {
            return obj.id === team.players[j];
          }) < 0) {
            team.players.splice(j, 1);
            j--;
          } else {
            notIncluded.splice(
                notIncluded.findIndex((obj) => {
                  return obj.id === team.players[j];
                }),
                1);
          }
        }
        if (team.players.length == 0) {
          this.currentGame.teams.splice(i, 1);
          i--;
        }
      }
      // Add players who are not on a team, to a team.
      for (let i = 0; i < notIncluded.length; i++) {
        let found = false;
        for (let j = 0; j < this.currentGame.teams.length; j++) {
          const team = this.currentGame.teams[j];
          if (team.players.length < teamSize) {
            team.players.push(notIncluded[i].id);
            found = true;
            break;
          }
        }
        if (found) continue;
        // Add a team if all existing teams are full.
        this.currentGame.teams[this.currentGame.teams.length] = new Team(
            this.currentGame.teams.length,
            'Team ' + (this.currentGame.teams.length + 1), [notIncluded[i].id]);
      }
    } else {
      // Create all teams for players.
      this.currentGame.teams = [];
      for (let i = 0; i < numTeams; i++) {
        this.currentGame.teams[i] = new Team(
            i, 'Team ' + (i + 1),
            this.currentGame.includedUsers
                .slice(i * teamSize, i * teamSize + teamSize)
                .map((obj) => {
                  return obj.id;
                }));
      }
    }
    // Reset team data.
    this.currentGame.teams.forEach((obj) => {
      obj.numAlive = obj.players.length;
      obj.rank = 1;
      obj.players.forEach((p) => {
        if (typeof p !== 'string' && typeof p !== 'number') {
          corruptTeam = true;
          console.error(
              '(PostTeamForm) Player in team is invalid: ' + typeof p +
              ' in team ' + obj.id + ' guild: ' + this.id + ' players: ' +
              JSON.stringify(obj.players));
        }
      });
    });

    if (corruptTeam) {
      return 'Teams appeared to be corrupted, teams may have been ' +
          'rearranged.\nThis error has been reported and is being ' +
          'looked into.';
    }
    return null;
  }


  /**
   * @description Force this current game to end immediately.
   * @public
   */
  end() {
    this.currentGame.inProgress = false;
    this.currentGame.isPaused = false;
    this.currentGame.ended = true;
    this.autoPlay = false;
    this._autoStep = false;
    clearInterval(this._dayEventInterval);
    clearTimeout(this._autoPlayTimeout);
    this._dayEventInterval = null;
    this._autoPlayTimeout = null;
  }
  /**
   * @description Clear all timeouts and intervals.
   * @public
   */
  clearIntervals() {
    if (this._dayEventInterval) {
      clearInterval(this._dayEventInterval);
      this._dayEventInterval = null;
    }
    if (this._autoPlayTimeout) {
      clearInterval(this._autoPlayTimeout);
      this._autoPlayTimeout = null;
    }
    this._autoStep = false;
  }
  /**
   * @description Create an interval for this guild. Calls the callback every
   * time the game state is about to be modified. State is updated immediately
   * after the callback completes. This also sets `_autoStep` to true.
   * @public
   * @param {HungryGames~GuildGame~StateUpdateCB} cb Callback to fire on the
   * interval.
   */
  createInterval(cb) {
    if (typeof cb !== 'function') {
      throw new Error('Callback must be a function');
    }
    if (this._dayEventInterval) {
      throw new Error(
          'Attempted to register second listener for existing interval.');
    }
    this._autoStep = true;
    this._stateUpdateCallback = cb;
    const delay = this.options.disableOutput ? 1 : this.options.delayEvents;
    this._dayEventInterval = setInterval(this.step, delay);
  }

  /**
   * @description Progress to the next game state. Calls `_stateUpdateCallback`
   * prior to any action, if it's set.
   * @public
   */
  step() {
    const day = this.currentGame.day;
    const index = day.state - 2;
    const dayOver = index >= day.events.length;
    if (typeof this._stateUpdateCallback === 'function') {
      this._stateUpdateCallback(dayOver, index < 0);
    }
    if (this._autoPlayTimeout) {
      clearTimeout(this._autoPlayTimeout);
      this._autoPlayTimeout = null;
    }
    if (dayOver) {
      if (this._dayEventInterval) {
        clearInterval(this._dayEventInterval);
        this._dayEventInterval = null;
      }
      if (this.autoPlay && this._autoStep && !this.currentGame.isPaused) {
        const delay = this.options.disableOutput ? 1 : this.options.delayDays;
        this._autoPlayTimeout = setTimeout(this.step, delay);
      }
      day.state = 0;
    } else if (index < 0) {
      return;
    } else if (
      day.events[index].battle &&
        day.events[index].state < day.events[index].attacks.length) {
      day.events[index].state++;
    } else {
      day.state++;
    }
  }
}

/**
 * @description Create a GuildGame from data parsed from file. Similar to copy
 * constructor.
 *
 * @public
 * @param {Object} data GuildGame like object.
 * @returns {HungryGames~GuildGame} Created GuildGame.
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

/**
 * @description Force a player to have a certain outcome in the current day
 * being simulated, or the next day that will be simulated. This is acheived
 * by adding a custom event in which the player will be affected after their
 * normal event for the day.
 *
 * @public
 * @static
 * @param {HungryGames~GuildGame} game The game context.
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
GuildGame.forcePlayerState = function(
    game, list, state, messages, text, persists = false) {
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
    if (game.currentGame.day.state > 0) {
      const player = game.currentGame.includedUsers.find((el) => el.id == p);
      if (!player) return 'Unable to find player.';
      let outcome;
      if (player.living && state === 'dead') {
        outcome = 'dies';
        Simulator._killUser(game, player, 0, null);
      } else if (
        !player.living && (state === 'living' || state === 'thriving')) {
        outcome = 'revived';
        Simulator._reviveUser(game, player, 0, null);
      } else if (player.state === 'wounded' && state === 'thriving') {
        outcome = 'thrives';
        Simulator._restoreUser(game, player, 0, null);
      } else if (
        player.living && player.state !== 'wounded' && state === 'wounded') {
        outcome = 'wounded';
        Simulator._woundUser(game, player, 0, null);
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
          Event.finalize(text, [player], 1, 0, outcome, 'nothing', game);
      let lastIndex = game.currentGame.day.state - 1;
      for (let i = game.currentGame.day.events.length - 1; i > lastIndex; i--) {
        if (game.currentGame.day.events[i].icons.find((el) => el.id == p)) {
          lastIndex = i + 1;
          break;
        }
      }
      game.currentGame.day.events.splice(lastIndex, 0, evt);
    } else {
      game.currentGame.forcedOutcomes.push({
        id: game.id,
        list: list,
        state: state,
        text: text,
        persists: persists,
      });
    }
  });
  return `Player(s) will be ${state} by the end of the day.`;
};


module.exports = GuildGame;
