// Copyright 2019 Campbell Crowley. All rights reserved.
// Author: Campbell Crowley (dev@campbellcrowley.com)
const HungryGames = require('./HungryGames.js');

/**
 * A single instance of a game in a guild.
 *
 * @memberof HungryGames
 * @inner
 */
class GuildGame {
  /**
   * @description Create a game instance for a single guild.
   * @param {string} bot User id of the current bot instance.
   * @param {string} id Guild id of the Guild that this object is for.
   * @param {object<number|boolean|string|object>} options The game options.
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
   *   bloodbath: string[],
   *   player: string[],
   *   weapon: string[],
   *   arena: string[],
   *   battle: {
   *     starts: string[],
   *     attacks: string[],
   *     outcomes: string[]
   *   }
   * }} customEventIds Array of IDs of custom events to load.
   * @param {string[]} disabledEventIds Array of IDs of events to be disabled
   * from game.
   */
  constructor(
      bot, id, options, name, includedUsers, excludedUsers, includedNPCs,
      excludedNPCs, customEventIds, disabledEventIds) {
    /**
     * The ID of the current bot account.
     *
     * @public
     * @type {string}
     * @constant
     */
    this.bot = bot;
    /**
     * The ID of the Guild this is for.
     *
     * @public
     * @type {string}
     * @constant
     */
    this.id = id;
    /**
     * Array of user IDs that will be included in the next game.
     *
     * @public
     * @type {string[]}
     * @default []
     */
    this.includedUsers = [];
    if (Array.isArray(includedUsers)) {
      for (let i = 0; i < includedUsers.length; i++) {
        if (typeof includedUsers[i] === 'string') {
          this.includedUsers.push(includedUsers.splice(i, 1)[0]);
          i--;
        } else {
          this.includedUsers.push(includedUsers[i].id);
        }
      }
    }
    /**
     * Array of user IDs that will be excluded from the next game.
     *
     * @public
     * @type {string[]}
     * @default []
     */
    this.excludedUsers = excludedUsers || [];
    /**
     * Array of NPCs that will be included in the game.
     *
     * @public
     * @type {HungryGames~NPC[]}
     * @default []
     */
    this.includedNPCs = includedNPCs || [];
    /**
     * Array of NPCs that will be excluded from the game.
     *
     * @public
     * @type {HungryGames~NPC[]}
     * @default []
     */
    this.excludedNPCs = excludedNPCs || [];
    /**
     * Game options.
     *
     * @public
     * @type {object}
     */
    this.options = options;
    /**
     * Is this game autoplaying?
     *
     * @public
     * @type {boolean}
     * @default false
     */
    this.autoPlay = false;
    /**
     * Does this game currently have any long running operations being
     * performed.
     *
     * @public
     * @type {boolean}
     * @default false
     */
    this.loading = false;
    /**
     * Is this game automatically stepping, or are steps controlled manually.
     *
     * @private
     * @type {boolean}
     * @default false
     */
    this._autoStep = false;
    /**
     * @description Storage manager for all custom events.
     * @todo Currently each guild will cache all events on its own, this will be
     * find for now, but would be more efficient if a global cache was used
     * instead.
     * @public
     * @type {HungryGames~EventContainer}
     * @constant
     */
    this.customEventStore = new HungryGames.EventContainer(customEventIds);

    /**
     * Current game information.
     *
     * @public
     * @type {HungryGames~Game}
     * @default
     */
    this.currentGame = new HungryGames.Game(name, includedUsers);
    /**
     * @description List of IDs of events to disable per-category.
     * @public
     * @type {{
     *   bloodbath: string[],
     *   player: string[],
     *   arena: string[],
     *   weapon: string[],
     *   battle: {
     *     starts: string[],
     *     attacks: string[],
     *     outcomes: string[]
     *   }
     * }}
     */
    this.disabledEventIds = disabledEventIds || {
      bloodbath: [],
      player: [],
      arena: [],
      weapon: [],
      battle: {
        starts: [],
        attacks: [],
        outcomes: [],
      },
    };

    /**
     * The channel id a command was last sent from that affected this guild
     * game.
     *
     * @public
     * @type {?string}
     * @default
     */
    this.channel = null;
    /**
     * The id of the user that last sent a command which interacted with this
     * guild game.
     *
     * @public
     * @type {?string}
     * @default
     */
    this.author = null;

    /**
     * The channel id where the game messages are currently being sent in.
     *
     * @public
     * @type {?string}
     * @default
     */
    this.outputChannel = null;

    /**
     * Message ID of the message to fetch reactions from for join via react.
     *
     * @public
     * @type {?{id: string, channel: string}}
     * @default
     */
    this.reactMessage = null;

    /**
     * The ID of the currently active {@link HungryGames~StatGroup} tracking
     * stats.
     *
     * @public
     * @type {?string}
     * @default
     */
    this.statGroup = null;

    /**
     * The actions to perform when certain events occur.
     *
     * @public
     * @type {HungryGames~ActionStore}
     * @default
     */
    this.actions = new HungryGames.ActionStore();

    /**
     * Interval for day events.
     *
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
     *
     * @private
     * @type {?HungryGames~GuildGame~StateUpdateCB}
     * @default
     */
    this._stateUpdateCallback = null;
    /**
     * Manages all stats for all players.
     *
     * @private
     * @type {HungryGames~StatManager}
     * @constant
     */
    this._stats = new HungryGames.StatManager(this);

    this.step = this.step.bind(this);
    this.modifyPlayerWeapon = this.modifyPlayerWeapon.bind(this);
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
      } else if (one[1].value && one[1].value.serializable) {
        output[one[0]] = one[1].value.serializable;
      } else {
        output[one[0]] = one[1].value;
      }
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

      this.currentGame.teams.sort((a, b) => a.id - b.id);

      const notIncluded = this.currentGame.includedUsers.slice(0);
      // Remove players from teams if they are no longer included in game.
      for (let i = 0; i < this.currentGame.teams.length; i++) {
        const team = this.currentGame.teams[i];
        team.id = i;
        for (let j = 0; j < team.players.length; j++) {
          if (!this.currentGame.includedUsers.find(
              (obj) => obj.id === team.players[j])) {
            team.players.splice(j, 1);
            j--;
          } else {
            notIncluded.splice(
                notIncluded.findIndex((obj) => obj.id === team.players[j]), 1);
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
        this.currentGame.teams[this.currentGame.teams.length] =
            new HungryGames.Team(
                this.currentGame.teams.length,
                'Team ' + (this.currentGame.teams.length + 1),
                [notIncluded[i].id]);
      }
    } else {
      // Create all teams for players.
      this.currentGame.teams = [];
      for (let i = 0; i < numTeams; i++) {
        this.currentGame.teams[i] = new HungryGames.Team(
            i, `Team ${i + 1}`,
            this.currentGame.includedUsers
                .slice(i * teamSize, i * teamSize + teamSize)
                .map((obj) => obj.id));
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
          'rearranged.\nIf you have more information, please report this bug.';
    }
    return null;
  }


  /**
   * @description Force this current game to end immediately.
   * @public
   */
  end() {
    this.currentGame.inProgress = false;
    this.currentGame.isPaused = true;
    this.currentGame.ended = true;
    this.autoPlay = false;
    this.clearIntervals();
    if (this.currentGame.day.state === 1) this.currentGame.day.state = 0;
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
    this.currentGame.isPaused = true;
  }
  /**
   * @description Create an interval for this guild. Calls the callback every
   * time the game state is about to be modified. State is updated immediately
   * after the callback completes. This also sets `_autoStep` to true.
   * @public
   * @param {HungryGames~GuildGame~StateUpdateCB} [cb] Callback to fire on the
   * interval. Optional only if set via {@link setStateUpdateCallback} prior to
   * call to this function.
   */
  createInterval(cb) {
    if (cb && typeof cb !== 'function') {
      throw new Error('Callback must be a function');
    } else if (
      typeof cb !== 'function' &&
        typeof this._stateUpdateCallback !== 'function') {
      throw new Error('Callback must be a function');
    }
    if (this._dayEventInterval) {
      throw new Error(
          'Attempted to register second listener for existing interval.');
    }
    this.currentGame.isPaused = false;
    this._autoStep = true;
    if (cb) this._stateUpdateCallback = cb;
    const delay = this.options.disableOutput ? 1 : this.options.delayEvents;
    this.step();
    this._dayEventInterval = setInterval(this.step, delay);
  }

  /**
   * @description Set the state update callback function.
   * @public
   * @param {HungryGames~GuildGame~StateUpdateCB} cb Callback to fire when
   * stepped.
   */
  setStateUpdateCallback(cb) {
    if (typeof cb !== 'function') {
      throw new Error('Callback must be a function');
    }
    this._stateUpdateCallback = cb;
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
      this._stateUpdateCallback(dayOver, index < 0 && !this.currentGame.ended);
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
      this._stats.parseDay();
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

  /**
   * @description Create a GuildGame from data parsed from file. Similar to copy
   * constructor.
   *
   * @public
   * @static
   * @param {object} data GuildGame like object.
   * @param {external:Discord~Client} client Discord client reference for
   * creating {@link HungryGames~ActionStore}.
   * @returns {HungryGames~GuildGame} Created GuildGame.
   */
  static from(data, client) {
    const game = new GuildGame(
        data.bot, data.id, data.options, data.name, data.includedUsers,
        data.excludedUsers, data.includedNPCs, data.excludedNPCs);
    game.autoPlay = data.autoPlay || false;
    game.reactMessage = data.reactMessage || null;

    // Legacy custom event storage.
    if (data.customEvents) {
      if (!game.legacyEvents) game.legacyEvents = {};
      game.legacyEvents.bloodbath = data.customEvents.bloodbath || [];
      game.legacyEvents.player = data.customEvents.player || [];
      game.legacyEvents.arena = data.customEvents.arena || [];
      game.legacyEvents.weapon = data.customEvents.weapon || {};
      if (data.customEvents.battle) {
        if (!game.legacyEvents.battle) game.legacyEvents.battle = {};
        game.legacyEvents.battle.starts = data.customEvents.battle.starts || [];
        game.legacyEvents.battle.attacks =
            data.customEvents.battle.attacks || [];
        game.legacyEvents.battle.outcomes =
            data.customEvents.battle.outcomes || [];
      }
    }
    if (data.legacyEvents) {
      game.legacyEvents = data.legacyEvents;
    }
    // End legacy custom events.

    if (data.customEventStore) {
      game.customEventStore.updateAndFetchAll(data.customEventStore);
    }
    if (data.disabledEventIds) {
      game.disabledEventIds.bloodbath = data.disabledEventIds.bloodbath || [];
      game.disabledEventIds.player = data.disabledEventIds.player || [];
      game.disabledEventIds.arena = data.disabledEventIds.arena || [];
      game.disabledEventIds.weapon = data.disabledEventIds.weapon || [];
      if (data.disabledEventIds.battle) {
        game.disabledEventIds.battle.starts =
            data.disabledEventIds.battle.starts || [];
        game.disabledEventIds.battle.attacks =
            data.disabledEventIds.battle.attacks || [];
        game.disabledEventIds.battle.outcomes =
            data.disabledEventIds.battle.outcomes || [];
      }
    }

    game.channel = data.channel || null;
    game.author = data.author || null;
    game.outputChannel = data.outputChannel || null;
    game.statGroup = data.statGroup || null;
    if (data.currentGame) {
      game.currentGame = HungryGames.Game.from(data.currentGame);
    }
    if (data.actions) {
      game.actions =
          HungryGames.ActionStore.from(client, game.id, data.actions);
    }
    return game;
  }
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
   * @param {string|HungryGames~NormalEvent[]} [text] Message to show when the
   * user is affected, or array of default events if not specifying a specific
   * message.
   * @param {Function} [cb] Callback once complete. Single parameter is the
   * output message to tell the user of the outcome of the operation.
   */
  static forcePlayerState(game, list, state, messages, text, cb) {
    if (!Array.isArray(list)) {
      messages = state;
      text = list.text;
      state = list.state;
      list = list.list;
    }
    if (!Array.isArray(list) || list.length == 0) {
      cb('No players given.');
      return;
    }
    if (typeof state !== 'string') {
      cb('No outcome given.');
      return;
    }
    const players = [];
    const outcomes = {};
    list.forEach((p) => {
      const player = game.currentGame.includedUsers.find((el) => el.id == p);
      if (!player) return;
      players.push(player.name);

      let living = player.living;
      let currentState = player.state;

      if (game.currentGame.day.state <= 1) {
        game.currentGame.nextDay.events.forEach((evt) => {
          const found = evt.icons.find((icon) => icon.id === player.id);
          if (!found) return;
          const group = found.settings.victim ? evt.victim : evt.attacker;
          switch (group.outcome) {
            case 'dies':
              living = false;
              currentState = 'dead';
              break;
            case 'revived':
              living = true;
              currentState = 'zombie';
              break;
            case 'thrives':
              living = true;
              currentState = 'living';
              break;
            case 'wounded':
              living = true;
              currentState = 'wounded';
              break;
          }
        });
      }
      let outcome;
      if (living && state === 'dead') {
        outcome = 'dies';
      } else if (
        !living && (state === 'living' || state === 'thriving')) {
        outcome = 'revived';
      } else if (currentState === 'wounded' && state === 'thriving') {
        outcome = 'thrives';
      } else if (living && currentState !== 'wounded' && state === 'wounded') {
        outcome = 'wounded';
      } else {
        return;
      }
      if (!outcomes[outcome]) outcomes[outcome] = [];
      outcomes[outcome].push(player);
    });

    /**
     * @description Find and apply an event to players.
     * @private
     * @param {HungryGames~Player[]} affected Array of players to affect.
     * @param {string} outcome The outcome to apply.
     */
    const findEvent = function(affected, outcome) {
      let evt;
      if (typeof text !== 'string' && Array.isArray(text) &&
          game.options.anonForceOutcome) {
        let eventPool = text.concat(game.customEventStore.getArray('player'));
        eventPool = eventPool.filter((el) => {
          const checkVictim = el.victim.outcome === outcome &&
              (el.victim.count === affected.length ||
               (el.victim.count < 0 &&
                el.victim.count * -1 <= affected.length));
          const checkAttacker = el.attacker.outcome === outcome &&
              (el.attacker.count === affected.length ||
               (el.attacker.count < 0 &&
                el.attacker.count * -1 <= affected.length));
          const checkCount = el.attacker.count === 0 || el.victim.count === 0;
          return (checkVictim || checkAttacker) && checkCount &&
              !game.disabledEventIds.player.includes(el.id);
        });
        if (eventPool.length > 0) {
          const pick = eventPool[Math.floor(eventPool.length * Math.random())];
          text = pick.message;
          const vC = pick.victim.count == 0 ? 0 : affected.length;
          const aC = pick.attacker.count == 0 ? 0 : affected.length;
          evt = HungryGames.NormalEvent.finalize(
              text, affected, vC, aC, outcome, outcome, game,
              pick.victim.killer, pick.attacker.killer, pick.victim.weapon,
              pick.attacker.weapon);
        }
      }
      if (typeof text !== 'string') {
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
      if (!evt) {
        evt = HungryGames.NormalEvent.finalize(
            text, affected, affected.length, 0, outcome, 'nothing', game);
      }
      if (game.currentGame.day.state > 1) {
        for (const player of affected) {
          if (!HungryGames.Simulator._applyOutcome(
              game, player, 0, null, outcome)) {
            break;
          }
        }
        game.currentGame.day.events.push(evt);
      } else {
        game.currentGame.nextDay.events.push(evt);
      }
    };

    game.customEventStore.waitForReady(() => {
      for (const outcome in outcomes) {
        if (!outcomes[outcome] || outcomes[outcome].length == 0) continue;
        const affected = outcomes[outcome];
        if (affected.length < 7) {
          findEvent(affected, outcome);
        } else {
          do {
            findEvent(affected.splice(0, 7), outcome);
          } while (affected.length > 0);
        }
      }
      if (players.length == 0) {
        cb('No players found.');
      } else if (players.length < 5) {
        const names = players.map((el) => `\`${el}\``).join(', ');
        cb(`${names} will be ${state} by the end of the day.`);
      } else {
        cb(`${players.length} players will be ${state} ` +
           'by the end of the day.');
      }
    });
  }

  /**
   * @description Give or take a weapon from a player.
   * @public
   * @param {string} player The ID of the player to modify.
   * @param {string} weapon The weapon ID to give/take.
   * @param {?string|HungryGames} [text=null] The message text to show, or
   * reference to object storing default events. If no value is given, a random
   * message is chosen from `./save/hgMessages.json`.
   * @param {number} [count=1] The amount to give to the player. Negative to
   * take away.
   * @param {boolean} [set=false] Set the amount to `count` instead of
   * incrementing.
   * @param {Function} [cb] Callback once complete. Only parameter is the output
   * message to tell the user of the outcome of the operation.
   */
  modifyPlayerWeapon(player, weapon, text = null, count = 1, set = false, cb) {
    if (typeof cb !== 'function') cb = function() {};
    const game = this;
    if (!game.currentGame || !game.currentGame.includedUsers) {
      cb('No game in progress.');
      return;
    }
    player = game.currentGame.includedUsers.find((el) => el.id == player);
    if (!player) {
      cb('Unable to find player.');
      return;
    }

    let current = player.weapons[weapon] || 0;
    if (game.currentGame.day.state <= 1) {
      for (const evt of game.currentGame.nextDay.events) {
        if (evt.consumer === player.id) {
          for (const w of evt.consumes) {
            if (w.id !== weapon) continue;
            current -= w.count;
          }
        }
        const icon = evt.icons.find((icon) => icon.id === player.id);
        if (icon) {
          const list =
              icon.settings.victim ? evt.victim.weapons : evt.attacker.weapons;
          for (const w of list) {
            if (w.id !== weapon) continue;
            current += w.count * 1;
          }
        }
      }
    }

    const diff = (set ? count - current : count) || 0;
    if (!diff) {
      cb('Count must be non-zero number.');
      return;
    }
    count = Math.max(0, current + diff);

    const defaultEvents =
        text.getDefaultEvents && text.getDefaultEvents().get('weapon');
    game.customEventStore.waitForReady(() => {
      const customWeapons = game.customEventStore.get('weapon');
      const weapons = {};
      if (player.weapons) {
        for (const w in player.weapons) {
          if (!player.weapons[w]) continue;
          const existing = customWeapons[w] || defaultEvents[w];
          if (!existing) {
            console.error('Unable to find weapon:', w, 'in guild', game.id);
            continue;
          }
          weapons[w] = new HungryGames.WeaponEvent(
              [], existing.consumable, existing.name);
        }
      }
      if (!weapons[weapon]) {
        const existing = customWeapons[weapon] || defaultEvents[weapon];
        weapons[weapon] = new HungryGames.WeaponEvent(
            [], existing && existing.consumable,
            existing && existing.name || weapon);
      }

      const name = weapons[weapon].name;

      let evt;
      if (text && typeof text === 'object' && game.options.anonForceOutcome) {
        const defaultWeapon = defaultEvents[weapon];
        const custom = customWeapons[weapon];

        weapons.action = HungryGames.WeaponEvent.action;
        weapons[weapon] = new HungryGames.WeaponEvent(
            [], (custom && custom.consumable) ||
                (defaultWeapon && defaultWeapon.consumable),
            (custom && custom.name) || (defaultWeapon && defaultWeapon.name));

        let eventPool;
        if (diff < 0) {
          if (defaultWeapon && custom) {
            eventPool = defaultWeapon.outcomes.concat(custom.outcomes);
          } else if (defaultWeapon) {
            eventPool = defaultWeapon.outcomes;
          } else if (custom) {
            eventPool = custom.outcomes;
          } else {
            cb('Unable to find weapon');
            return;
          }
          weapons[weapon].outcomes = eventPool.slice(0);
          const disabled = game.disabledEventIds.weapon;
          eventPool = eventPool.filter((el) => {
            return Math.abs(el.victim.count) + Math.abs(el.attacker.count) ===
                1 &&
                !disabled.includes(el.id);
          });
        } else {
          eventPool = text.getDefaultEvents().getArray('player').concat(
              game.customEventStore.getArray('player'));
          const disabled = game.disabledEventIds.player;
          eventPool = eventPool.filter((el) => {
            const aW = el.attacker.weapon;
            const aCheck = aW && aW.name === weapon && aW.count > 0;
            const vW = el.victim.weapon;
            const vCheck = vW && vW.name === weapon && vW.count > 0;
            return (aCheck || vCheck) &&
                (Math.abs(el.attacker.count) + Math.abs(el.victim.count) ===
                 1) &&
                !disabled.includes(el.id);
          });
          weapons[weapon].outcomes = eventPool.slice(0);
        }
        if (eventPool.length > 0) {
          const pick = HungryGames.NormalEvent.from(
              eventPool[Math.floor(eventPool.length * Math.random())]);

          text = pick.message = pick.message.replace(/\{owner\}/g, 'their');
          evt = pick.finalize(game, [player]);
        }
      }
      if (text && typeof text === 'object') {
        if (diff < 0) {
          text = text.messages.get('takeWeapon');
        } else {
          text = text.messages.get('giveWeapon');
        }
      }
      if (!evt) {
        const name = weapons[weapon].name;
        text = text.replace(
            /\{weapon\}/g, Math.abs(diff) === 1 ? `their ${name}` : `${name}s`);
        text = text.replace(
            /\[W([^|]*)\|([^\]]*)\]/g, (Math.abs(diff) == 1 ? '$1' : '$2'));
        evt = HungryGames.NormalEvent.finalize(
            text, [player], 0, 1, 'nothing', 'nothing', game);
      }

      const nameFormat = game.options.useNicknames ? 'nickname' : 'username';
      if (diff < 0) {
        const ownerName =
            HungryGames.Grammar.formatMultiNames([player], nameFormat);
        const firstAttacker = true;
        evt.consumer = player.id;
        evt.consumes = [{id: weapon, count: -diff}];
        evt.subMessage = HungryGames.Simulator.formatWeaponEvent(
            evt, player, ownerName, firstAttacker, weapon, weapons, count);
      } else {
        const aW = evt.attacker.weapons.find((w) => w.id === weapon);
        if (!aW) {
          evt.attacker.weapons.push({id: weapon, count: diff});
        } else {
          aW.count = diff;
        }
        const vW = evt.victim.weapons.find((w) => w.id === weapon);
        if (!vW) {
          evt.victim.weapons.push({id: weapon, count: diff});
        } else {
          vW.count = diff;
        }
      }

      if (game.currentGame.day.state > 1) {
        if (count <= 0) {
          count = 0;
          delete player.weapons[weapon];
        } else {
          player.weapons[weapon] = count;
        }
        evt.subMessage += HungryGames.Simulator.formatWeaponCounts(
            evt, [player], weapons, nameFormat);
        // State - 2 = the event index, + 1 is the next index to get shown.
        /* let lastIndex = game.currentGame.day.state - 1;
        for (let i = game.currentGame.day.events.length - 1; i > lastIndex; i--)
        {
          if (game.currentGame.day.events[i].icons.find(
              (el) => el.id == player.id)) {
            lastIndex = i + 1;
            break;
          }
        }
        if (lastIndex < game.currentGame.day.events.length) {
          game.currentGame.day.events.splice(lastIndex, 0, evt);
        } else { */
        game.currentGame.day.events.push(evt);
        // }
        cb(`${player.name} now has ${count} ${name}`);
        return;
      } else {
        game.currentGame.nextDay.events.push(evt);
        cb(`${player.name} will have ${count} ${name}`);
        return;
      }
    });
  }
}

module.exports = GuildGame;
