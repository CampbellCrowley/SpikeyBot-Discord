// Copyright 2019 Campbell Crowley. All rights reserved.
// Author: Campbell Crowley (dev@campbellcrowley.com)
const fs = require('fs');
const mkdirp = require('mkdirp'); // mkdir -p
const rimraf = require('rimraf'); // rm -rf
const yj = require('yieldable-json');

/**
 * Contains a Hunger Games style simulation.
 */
class HungryGames {
  /**
   * @description HungryGames constructor. Currently requires a valid SubModule
   * as a parent.
   * @todo Remove reliance on SubModule.
   * @param {SubModule} parent Parent submodule used to hook logging into.
   */
  constructor(parent) {
    /**
     * Parent subModule for logging and bot hooking.
     *
     * @private
     * @type {HG}
     * @constant
     */
    this._parent = parent;
    /**
     * Current {@link HungryGames~Messages} instance.
     *
     * @public
     * @type {HungryGames~Messages}
     * @constant
     */
    this.messages = new HungryGames.Messages();
    /**
     * Default game options.
     *
     * @public
     * @type {HungryGames~DefaultOptions}
     * @constant
     */
    this.defaultOptions = new HungryGames.DefaultOptions();
    /**
     * All currently tracked games. Mapped by guild ID. In most cases you should
     * not reference this directly. Use {@link HungryGames#getGame} to get the
     * game object for a guild.
     *
     * @see {@link HungryGames#getGame}
     *
     * @private
     * @type {object.<HungryGames~GuildGame>}
     * @default
     * @constant
     */
    this._games = {};
    /**
     * Stores the guilds we have looked for their data recently and the
     * timestamp at which we looked. Used to reduce filesystem requests and
     * blocking.
     *
     * @private
     * @type {object.<number>}
     * @constant
     */
    this._findTimestamps = {};
    /**
     * The delay after failing to find a guild's data to look for it again.
     *
     * @private
     * @type {number}
     * @constant
     * @default 15 Seconds
     */
    this._findDelay = 15000;
    /**
     * Maximum amount of milliseconds long running operations are allowed to
     * take to prevent cpu deadlock.
     *
     * @public
     * @type {number}
     * @constant
     * @default
     */
    this.maxDelta = 5;
    /**
     * The file path to save current state for a specific guild relative to
     * {@link Common~guildSaveDir}.
     *
     * @see {@link Common#guildSaveDir}
     * @see {@link HungryGames#_games}
     * @see {@link HungryGames#_hgSaveDir}
     *
     * @private
     * @type {string}
     * @constant
     * @default
     */
    this._saveFile = 'game.json';
    /**
     * The file directory for finding saved data related to the hungry games
     * data of individual guilds.
     *
     * @see {@link Common#guildSaveDir}
     * @see {@link HungryGames#_games}
     * @see {@link HungryGames#_saveFile}
     *
     * @private
     * @type {string}
     * @constant
     * @default
     */
    this._hgSaveDir = '/hg/';
    /**
     * Array of all events that can take place in the bloodbath by default.
     *
     * @private
     * @type {HungryGames~Event[]}
     * @default
     */
    this._defaultBloodbathEvents = [];
    /**
     * Array of all events that can take place normally by default.
     *
     * @private
     * @type {HungryGames~Event[]}
     * @default
     */
    this._defaultPlayerEvents = [];
    /**
     * Array of all arena events that can take place normally by default.
     *
     * @private
     * @type {HungryGames~ArenaEvent[]}
     * @default
     */
    this._defaultArenaEvents = [];
    /**
     * Array of all battles that can take place normally by default.
     *
     * @private
     * @type {HungryGames~Battle[]}
     * @default
     */
    this._defaultBattles = [];
    /**
     * Array of all weapons that can be used normally by default.
     *
     * @private
     * @type {HungryGames~Weapon[]}
     * @default
     */
    this._defaultWeapons = [];
  }

  /**
   * @description The file path to save current state for a specific guild
   * relative to Common#guildSaveDir.
   * @see {@link Common#guildSaveDir}
   * @see {@link HungryGames#_games}
   * @see {@link HungryGames#_saveFile}
   * @see {@link HungryGames#_hgSaveDir}
   *
   * @public
   * @returns {string} Save file name.
   */
  get saveFile() {
    return this._saveFile;
  }
  /**
   * @description The file directory for finding saved data related to the
   * hungry games data of individual guilds.
   * @see {@link Common#guildSaveDir}
   * @see {@link HungryGames#_games}
   * @see {@link HungryGames#_saveFile}
   * @see {@link HungryGames#_hgSaveDir}
   *
   * @public
   * @returns {string} Save dir path.
   */
  get hgSaveDir() {
    return this._hgSaveDir;
  }

  /**
   * @description Returns a reference to the current games object for a given
   * guild.
   *
   * @public
   * @param {string} id The guild id to get the data for.
   * @returns {?HungryGames~GuildGame} The current object storing all data about
   * game in a guild.
   */
  getGame(id) {
    return this._find(id);
  }

  /**
   * @description Similar to {@link HungryGames.getGame} except asyncronous and
   * fetched game is passed as callback argument.
   *
   * @public
   * @param {string} id The guild id to get the data for.
   * @param {Function} cb Callback with single argument. Null if unable to be
   * found, {@link HungryGames~GuildGame} if found.
   */
  fetchGame(id, cb) {
    this._find(id, cb);
  }

  /**
   * @description Update the reference to the array storing default bloodbath
   * events.
   *
   * @public
   * @param {HungryGames~Event[]} list Array to reference.
   */
  setDefaultBloodbathEvents(list) {
    this._defaultBloodbathEvents = list;
  }
  /**
   * @description Update the reference to the array storing default player
   * events.
   *
   * @public
   * @param {HungryGames~Event[]} list Array to reference.
   */
  setDefaultPlayerEvents(list) {
    this._defaultPlayerEvents = list;
  }
  /**
   * @description Update the reference to the array storing default arena
   * events.
   *
   * @public
   * @param {HungryGames~ArenaEvent[]} list Array to reference.
   */
  setDefaultArenaEvents(list) {
    this._defaultArenaEvents = list;
  }
  /**
   * @description Update the reference to the array storing default battles
   * events.
   *
   * @public
   * @param {HungryGames~Battle[]} list Array to reference.
   */
  setDefaultBattles(list) {
    this._defaultBattles = list;
  }
  /**
   * @description Update the reference to the array storing default weapons
   * events.
   *
   * @public
   * @param {HungryGames~Weapon[]} list Array to reference.
   */
  setDefaultWeapons(list) {
    this._defaultWeapons = list;
  }

  /**
   * @description Returns an object storing all of the default events for the
   * games.
   *
   * @public
   * @returns {{
   *   bloodbath: object,
   *   player: object,
   *   arena: object,
   *   weapon: object
   * }} Object storing default events.
   */
  getDefaultEvents() {
    return {
      bloodbath: this._defaultBloodbathEvents,
      player: this._defaultPlayerEvents,
      weapon: this._defaultWeapons,
      arena: this._defaultArenaEvents,
    };
  }

  /**
   * @description Create a new GuildGame.
   * @fires HG#create
   * @public
   * @param {external:Discord~Guild|string} guild Guild object, or ID to create
   * a game for.
   * @param {Function} [cb] Callback once game has been fully created. Passes
   * the created game as the only argument.
   */
  create(guild, cb) {
    if (!(guild instanceof this._parent.Discord.Guild)) {
      guild = this._parent.client.guilds.get(guild);
    }
    const optKeys = this.defaultOptions.keys;
    const opts = {};
    for (const key of optKeys) {
      if (typeof key !== 'string') continue;
      if (typeof this.defaultOptions[key].value === 'object') {
        opts[key] = Object.assign({}, this.defaultOptions[key].value);
      } else {
        opts[key] = this.defaultOptions[key].value;
      }
    }
    const self = this;
    const getAll = function(members) {
      self.getAllPlayers(members, [], false, [], false, [], (res) => {
        self._games[guild.id] = new HungryGames.GuildGame(
            self._parent.client.user.id, guild.id, opts,
            `${guild.name}'s Hungry Games`, res);
        cb(self._games[guild.id]);
        self._parent._fire('create', guild.id);
      });
    };
    if (guild.memberCount > 100) {
      opts.excludeNewUsers = true;
      getAll(guild.members);
    } else {
      guild.members.fetch().then(getAll).catch((err) => {
        this._parent.error('Failed to fetch all users for guild: ' + guild.id);
        console.error(err);
        cb(null);
      });
    }
  }

  /**
   * @description Create a new Game for a guild, and refresh the player lists.
   * @fires HG#refresh
   * @public
   * @param {external:Discord~Guild|string} guild Guild object, or ID to refresh
   * a game for.
   * @param {Function} [cb] Callback once game has been fully refreshed. Passes
   * the refreshed game as the only argument, or null if unable to find the
   * game.
   */
  refresh(guild, cb) {
    if (!(guild instanceof this._parent.Discord.Guild)) {
      guild = this._parent.client.guilds.get(guild);
    }
    this.fetchGame(guild.id, (game) => {
      if (!game) {
        cb(null);
        return;
      }
      const name = (game.currentGame && game.currentGame.name) ||
          (`${guild.name}'s Hungry Games`);
      const teams = game.currentGame && game.currentGame.teams;

      const self = this;
      const getAll = function(members) {
        self.getAllPlayers(
            members, game.excludedUsers, game.options.includeBots,
            game.includedUsers, game.options.excludeNewUsers, game.includedNPCs,
            (res) => {
              game.currentGame = new HungryGames.Game(name, res, teams);
              cb(game);
              self._parent._fire('refresh', guild.id);
            });
      };
      if (game.options.excludeNewUsers) {
        getAll(guild.members);
      } else {
        guild.members.fetch().then(getAll).catch((err) => {
          this._parent.error(
              'Failed to fetch all users for guild: ' + guild.id);
          console.error(err);
          cb(null);
        });
      }
    });
  }

  /**
   * Form an array of Player objects based on guild members, excluded members,
   * and whether to include bots.
   *
   * @public
   * @param {external:Discord~Collection<external:Discord~GuildMember>} members
   * All members in guild.
   * @param {string[]} excluded Array of ids of users that should not be
   * included in the games.
   * @param {boolean} bots Should bots be included in the games.
   * @param {string[]} included Array of ids of users that should be included in
   * the games. Used if excludeByDefault is true.
   * @param {boolean} excludeByDefault Should new users be excluded from the
   * game by default?
   * @param {NPC[]} [includedNPCs=[]] NPCs to include as players.
   * @param {basicCB} cb Callback on completion. Only argument is array of
   * {@link HungryGames~Player} to include in the games.
   */
  getAllPlayers(
      members, excluded, bots, included, excludeByDefault, includedNPCs, cb) {
    const iTime = Date.now();
    const finalMembers = [];
    const self = this;
    const memList = Array.isArray(members) ? members : members.array();
    const large = memList.length >= HungryGames.largeServerCount;
    if (large || !Array.isArray(excluded)) excluded = [];

    const memberIterate = function(obj) {
      if (obj.isNPC) return;
      if (included && excluded && !included.includes(obj.user.id) &&
          !excluded.includes(obj.user.id)) {
        if (excludeByDefault) {
          if (!large) excluded.push(obj.user.id);
        } else {
          included.push(obj.user.id);
        }
      } else if (
        included && excluded && included.includes(obj.user.id) &&
          excluded.includes(obj.user.id)) {
        self._parent.error(
            'User in both blacklist and whitelist: ' + obj.user.id +
            ' Guild: ' + obj.guild.id);
        if (excludeByDefault) {
          included.splice(included.findIndex((el) => el == obj.user.id), 1);
        } else {
          excluded.splice(excluded.findIndex((el) => el == obj.user.id), 1);
        }
      }
      const toInclude = !(
        (!bots && obj.user.bot) ||
          (excluded && excluded.includes(obj.user.id) ||
           (excludeByDefault && included && !included.includes(obj.user.id))));
      if (toInclude) {
        finalMembers.push(
            new HungryGames.Player(
                obj.id, obj.user.username,
                obj.user.displayAvatarURL({format: 'png'}), obj.nickname));
      }
    };
    let iTime2 = 0;
    const done = function() {
      const now = Date.now();
      const start = iTime2 - iTime;
      const total = now - iTime;
      if (start > 10 || total > 10) {
        self._parent.debug(
            `GetAllPlayers ${finalMembers.length} ${start} ${total}`);
      }
      cb(finalMembers);
    };
    const memberStep = function(i) {
      const start = Date.now();
      if (i < memList.length) {
        for (i; Date.now() - start < self.maxDelta && i < memList.length; i++) {
          memberIterate(memList[i]);
        }
      } else if (includedNPCs && i - memList.length < includedNPCs.length) {
        for (i; Date.now() - start < self.maxDelta &&
             i - memList.length < includedNPCs.length;
          i++) {
          const obj = includedNPCs[i - memList.length];
          finalMembers.push(
              new self._parent.NPC(obj.name, obj.avatarURL, obj.id));
        }
      } else {
        done();
        return;
      }
      setTimeout(() => memberStep(i));
    };

    iTime2 = Date.now();
    memberStep(0);
  }

  /**
   * Reset the specified category of data from a game.
   *
   * @fires HG#reset
   * @public
   * @param {string} id The id of the guild to modify.
   * @param {string} command The category of data to reset.
   * @returns {string} The message explaining what happened.
   */
  resetGame(id, command) {
    const game = this.getGame(id);
    if (!game) {
      return 'There is no data to reset.';
    }
    if (game.currentGame && game.currentGame.inProgress) {
      return 'A game is currently in progress. Please end it before ' +
          'reseting game data.';
    }
    this._parent._fire('reset', id, command);
    if (command == 'all') {
      game._stats.fetchGroupList((err, list) => {
        if (err) {
          if (err.code !== 'ENOENT') {
            this._parent.error('Failed to fetch stat group list: ' + id);
            console.error(err);
          }
          return;
        }
        list.forEach((el) => game._stats.fetchGroup(el, (err, group) => {
          if (err) {
            this._parent.error('Failed to fetch group: ' + id + '/' + el);
            console.error(err);
            return;
          }
          group.reset();
        }));
      });
      delete this._games[id];
      rimraf(this._parent.common.guildSaveDir + id + this.hgSaveDir, (err) => {
        if (!err) return;
        this._parent.error(
            'Failed to delete directory: ' + this._parent.common.guildSaveDir +
            id + this.hgSaveDir);
        console.error(err);
      });
      return 'Resetting ALL Hungry Games data for this server!';
    } else if (command == 'stats') {
      game._stats.fetchGroupList((err, list) => {
        if (err) {
          if (err.code !== 'ENOENT') {
            this._parent.error('Failed to fetch stat group list: ' + id);
            console.error(err);
          }
          return;
        }
        list.forEach((el) => game._stats.fetchGroup(el, (err, group) => {
          if (err) {
            this._parent.error('Failed to fetch group: ' + id + '/' + el);
            console.error(err);
            return;
          }
          group.reset();
        }));
      });
      return 'Resetting ALL Hungry Games stats for this server!';
    } else if (command == 'events') {
      game.customEvents = {bloodbath: [], player: [], arena: [], weapon: {}};
      return 'Resetting ALL Hungry Games events for this server!';
    } else if (command == 'current') {
      game.currentGame = null;
      return 'Resetting ALL data for current game!';
    } else if (command == 'options') {
      const optKeys = this.defaultOptions.keys;
      game.options = {};
      for (const key of optKeys) {
        game.options[key] = this.defaultOptions[key].value;
      }
      return 'Resetting ALL options!';
    } else if (command == 'teams') {
      game.currentGame.teams = [];
      game.formTeams();
      return 'Resetting ALL teams!';
    } else if (command == 'users') {
      game.includedUsers = [];
      game.excludedUsers = [];
      this.refresh(id, () => {});
      return 'Resetting ALL user data!';
    } else if (command == 'npcs') {
      game.includedNPCs = [];
      game.excludedNPCs = [];
      this.refresh(id, () => {});
      return 'Resetting ALL NPC data!';
    } else if (command == 'actions') {
      game.actions = new HungryGames.ActionStore();
      return 'Resetting ALL actions!';
    } else {
      return 'Please specify what data to reset.\nall {deletes all data ' +
          'for this server},\nevents {deletes all custom events},\n' +
          'current {deletes all data about the current game},\noptions ' +
          '{resets all options to default values},\nteams {delete all ' +
          'teams and creates new ones},\nusers {delete data about where to ' +
          'put users when creating a new game},\nnpcs {delete all NPCS}.' +
          '\nstats {delete all stats and groups}.\nactions {reset all actions' +
          ' to default settings}.';
    }
  }

  /**
   * @description Create and insert an action for a trigger in the given guild.
   * @public
   * @param {string} gId The guild ID of the game to modify.
   * @param {string} trigger The name of the trigger to insert the action into.
   * @param {string} action The name of the action to create.
   * @param {object} [args={}] The optional additional arguments required for
   * the action to be created.
   * @param {Function} [cb] Callback once completed. Single argument is error
   * string if failed, or null if succeeded.
   */
  insertAction(gId, trigger, action, args = {}, cb) {
    if (typeof cb !== 'function') cb = function() {};

    this.fetchGame(gId, (game) => {
      if (!game) {
        cb('No game has been created.');
        return;
      }
      const act =
          HungryGames.Action.actionList.find((el) => el.name === action);
      if (!act) {
        cb('Unknown action.');
        return;
      }
      if (!game.actions) {
        cb('Game doesn\'t have any action data.');
        return;
      }
      if (!Array.isArray(game.actions[trigger])) {
        cb('Unknown trigger.');
        return;
      }
      const created =
          HungryGames.Action[action].create(this._parent.client, gId, args);
      if (!created) {
        cb('Bad Args');
        return;
      }
      const res = game.actions.insert(trigger, created);
      if (res) {
        this._parent._fire('actionInsert', gId, trigger);
        cb(null);
        return;
      } else {
        cb('Bad trigger.');
        return;
      }
    });
  }

  /**
   * @description Remove an action for a trigger in the given guild.
   * @public
   * @param {string} gId The guild ID of the game to modify.
   * @param {string} trigger The name of the trigger to remove the action from.
   * @param {string} id The id of the action to remove.
   * @param {Function} [cb] Callback once completed. Single argument is error
   * string if failed, or null if succeeded.
   */
  removeAction(gId, trigger, id, cb) {
    if (typeof cb !== 'function') cb = function() {};

    this.fetchGame(gId, (game) => {
      if (!game) {
        cb('No game has been created.');
        return;
      }
      if (!game.actions) {
        cb('Game doesn\'t have any action data.');
        return;
      }
      if (!Array.isArray(game.actions[trigger])) {
        cb('Unknown trigger.');
        return;
      }
      const res = game.actions.remove(trigger, id);
      if (res) {
        this._parent._fire('actionRemove', gId, trigger);
        cb();
        return;
      } else {
        cb('Bad Index.');
        return;
      }
    });
  }

  /**
   * @description Update a specific action for a trigger in the given guild.
   * @public
   * @param {string} gId The guild ID of the game to modify.
   * @param {string} trigger The name of the trigger to remove the action from.
   * @param {string} id The id of the action to remove.
   * @param {string} key The key of the value to change.
   * @param {number|string} value The value to set the setting to.
   * @param {Function} [cb] Callback once completed. Single argument is error
   * string if failed, or null if succeeded.
   */
  updateAction(gId, trigger, id, key, value, cb) {
    if (typeof cb !== 'function') cb = function() {};

    this.fetchGame(gId, (game) => {
      if (!game) {
        cb('No game has been created.');
        return;
      }
      if (!game.actions) {
        cb('Game doesn\'t have any action data.');
        return;
      }
      if (!Array.isArray(game.actions[trigger])) {
        cb('Unknown trigger.');
        return;
      }
      const action = game.actions[trigger].find((el) => el.id === id);
      if (!action) {
        cb('Unknown action.');
        return;
      }
      if (typeof value !== typeof action[key]) {
        cb('Bad value.');
        return;
      }
      action[key] = value;

      this._parent._fire('actionUpdate', gId, trigger);
      cb();
    });
  }

  /**
   * @description Returns a guild's game data. Returns cached version if that
   * exists, or searches the file system for saved data. Data will only be
   * checked from disk at most once every `HungryGames~findDelay` milliseconds.
   * Returns `null` if data could not be found, or an error occurred.
   *
   * @private
   * @param {number|string} id The guild id to get the data for.
   * @param {Function} [cb] Callback to fire once complete. This becomes
   * asyncronous if given, if not given this function is syncronous. Single
   * parameter is null if not found, or {@link HungryGames~GuildGame} if found.
   * @returns {?HungryGames~GuildGame} The game data, or null if no game could
   * be loaded or loading asyncronously because a callback was given.
   */
  _find(id, cb) {
    const a = typeof cb === 'function';
    if (!a) cb = function() {};
    const now = Date.now();
    if (this._games[id]) {
      this._findTimestamps[id] = now;
      cb(this._games[id]);
      return this._games[id];
    }
    if (now - this._findTimestamps[id] < this._findDelay) {
      cb(null);
      return null;
    }
    this._findTimestamps[id] = now;

    const self = this;
    const parse = function(game) {
      if (!game.bot) game.bot = self._parent.client.user.id;
      try {
        game = HungryGames.GuildGame.from(game, self._parent.client);
        game.id = id;
      } catch (err) {
        self._parent.error('Failed to parse game data for guild ' + id);
        console.error(err);
        return null;
      }

      // Flush default and stale options.
      if (game.options) {
        for (const opt of self.defaultOptions.keys) {
          if (!(self.defaultOptions[opt] instanceof Object)) continue;
          if (typeof game.options[opt] !==
              typeof self.defaultOptions[opt].value) {
            if (self.defaultOptions[opt].value instanceof Object) {
              game.options[opt] =
                  Object.assign({}, self.defaultOptions[opt].value);
            } else {
              game.options[opt] = self.defaultOptions[opt].value;
            }
          } else if (self.defaultOptions[opt].value instanceof Object) {
            const dKeys = Object.keys(self.defaultOptions[opt].value);
            dKeys.forEach((el) => {
              if (typeof game.options[opt][el] !==
                  typeof self.defaultOptions[opt].value[el]) {
                game.options[opt][el] = self.defaultOptions[opt].value[el];
              }
            });
          }
        }
        for (const opt in game.options) {
          if (!(game.options[opt] instanceof Object)) continue;
          if (typeof self.defaultOptions[opt] === 'undefined') {
            delete game.options[opt];
          } else if (game.options[opt].value instanceof Object) {
            const keys = Object.keys(game.options[opt].value);
            keys.forEach((el) => {
              if (typeof game.options[opt][el] !==
                  typeof self.defaultOptions[opt].value[el]) {
                delete game.options[opt][el];
              }
            });
          }
        }
      }

      // If the bot stopped while simulating a day, just start over and try
      // again.
      if (game && game.currentGame && game.currentGame.day &&
          game.currentGame.day.state === 1) {
        game.currentGame.day.state = 0;
      }
      return game;
    };

    const filename =
        this._parent.common.guildSaveDir + id + this.hgSaveDir + this.saveFile;
    if (a) {
      fs.readFile(filename, (err, data) => {
        if (err) {
          if (err.code === 'ENOENT') {
            cb(null);
            return;
          } else {
            this._parent.debug('Failed to load game data for guild:' + id);
            console.error(err);
          }
        }
        yj.parseAsync(data.toString(), (err, parsed) => {
          if (err) {
            this._parent.error(
                'Failed to parse game data:' + id +
                ' Falling back to JSON.parse');
            console.error(err);
            try {
              parsed = JSON.parse(data);
            } catch (err) {
              this._parent.error('Failed to parse using JSON.parse');
              console.error(err);
              return;
            }
          }
          this._games[id] = parse(parsed);
          cb(this._games[id]);
        });
      });
    } else {
      try {
        const tmp = fs.readFileSync(filename);
        try {
          this._games[id] = JSON.parse(tmp);
          if (this._parent.initialized) {
            this._parent.debug('Loaded game from file ' + id);
          }
        } catch (e2) {
          this._parent.error('Failed to parse game data for guild ' + id);
          return null;
        }
      } catch (e) {
        if (e.code !== 'ENOENT') {
          this._parent.debug('Failed to load game data for guild:' + id);
          console.error(e);
        }
        return null;
      }
      return this._games[id] = parse(this._games[id]);
    }
  }
  /**
   * @description Save all HG related data to file. Purges old data from memory
   * as well.
   * @public
   * @param {string} [opt='sync'] Can be 'async', otherwise defaults to
   * synchronous.
   */
  save(opt) {
    Object.entries(this._games).forEach((obj) => {
      const id = obj[0];
      if (!obj[1]) {
        console.error(id, 'Doesn\'t exist.');
        delete this._games[obj[0]];
        return;
      }
      const data = obj[1].serializable;
      const dir = this._parent.common.guildSaveDir + id + this.hgSaveDir;
      const filename = dir + this.saveFile;
      const saveStartTime = Date.now();
      if (opt == 'async') {
        mkdirp(dir, (err) => {
          if (err) {
            this._parent.error('Failed to create directory for ' + dir);
            console.error(err);
            return;
          }
          let stringified;
          try {
            stringified = JSON.stringify(data);
          } catch (err) {
            this._parent.error('Failed to stringify synchronously');
            console.error(err);
            return;
          }
          fs.writeFile(filename, stringified, (err2) => {
            if (err2) {
              this._parent.error('Failed to save HG data for ' + filename);
              console.error(err2);
            } else if (
              this._findTimestamps[id] - saveStartTime < -15 * 60 * 1000) {
              delete this._games[id];
              delete this._findTimestamps[id];
              this._parent.debug(`Purged ${id}`);
            }
          });
        });
      } else {
        try {
          mkdirp.sync(dir);
        } catch (err) {
          this._parent.error('Failed to create directory for ' + dir);
          console.error(err);
          return;
        }
        try {
          fs.writeFileSync(filename, JSON.stringify(data));
        } catch (err) {
          this._parent.error('Failed to save HG data for ' + filename);
          console.error(err);
          return;
        }
        if (this._findTimestamps[id] - Date.now() < -15 * 60 * 1000) {
          delete this._games[id];
          delete this._findTimestamps[id];
          this._parent.debug('Purged ' + id);
        }
      }
    });
  }
  /**
   * @description End all event listeners, intervals, and timeouts to prepare
   * for a full stop.
   * @public
   */
  shutdown() {
    Object.values(this._games).forEach((el) => el.clearIntervals());
    this.messages.shutdown();
  }
}

/**
 * Games with more than this many members is considered large, and will have
 * some features disabled in order to improve performance.
 *
 * @public
 * @static
 * @type {number}
 * @constant
 * @default
 */
HungryGames.largeServerCount = 20000;

module.exports = HungryGames;

const toLoad = [
  // Actions
  './actions/Action.js',
  './actions/ActionManager.js',
  './actions/ActionStore.js',
  // Base
  './DefaultOptions.js',
  './ForcedOutcome.js',
  './Grammar.js',
  './FinalEvent.js',
  './ArenaEvent.js',
  './WeaponEvent.js',
  './Battle.js',
  './OutcomeProbabilities.js',
  './Day.js',
  './Messages.js',
  './UserIconUrl.js',
  './Player.js',
  './Team.js',
  './Game.js',
  './Event.js',
  './Stats.js',
  './StatGroup.js',
  './StatManager.js',
  './GuildGame.js',
  // Sim
  './Simulator.js',
];
toLoad.forEach((el) => delete require.cache[require.resolve(el)]);
toLoad.forEach((el) => {
  const obj = require(el);
  HungryGames[obj.name] = obj;
});
