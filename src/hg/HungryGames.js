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
    this._parent = parent;
    /**
     * Current {@link HungryGames~Messages} instance.
     * @public
     * @type {HungryGames~Messages}
     * @constant
     */
    this.messages = new HungryGames.Messages();
    /**
     * Default game options.
     * @public
     * @type {HungryGames~DefaultOptions}
     * @constant
     */
    this.defaultOptions = new HungryGames.DefaultOptions();
    /**
     * All currently tracked games. Mapped by guild ID. In most cases you should
     * NOT reference this directly. Use {@link HungryGames#getGame} to get the
     * game object for a guild.
     * @see {@link HungryGames#getGame}
     *
     * @private
     * @type {Object.<HungryGames~GuildGame>}
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
     * @type {Object.<number>}
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
     * @public
     * @type {number}
     * @constant
     * @default
     */
    this.maxDelta = 5;
    /**
     * The file path to save current state for a specific guild relative to
     * Common#guildSaveDir.
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
   * @description Create a new GuildGame.
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
    if (guild.memberCount > 100) {
      opts.excludeNewUsers = true;
    }
    this.getAllPlayers(guild.members, [], false, [], false, [], (res) => {
      this._games[guild.id] = new HungryGames.GuildGame(
          guild.id, opts, `${guild.name}'s Hungry Games`, res);
      cb(this._games[guild.id]);
    });
  }

  /**
   * @description Create a new Game for a guild, and refresh the player lists.
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
    const game = this.getGame(guild.id);
    if (!game) {
      cb(null);
      return;
    }
    const name = (game.currentGame && game.currentGame.customName) ||
        (`${guild.name}'s Hungry Games`);
    const teams = game.currentGame && game.currentGame.teams;
    this.getAllPlayers(
        guild.members, game.excludedUsers, game.options.includeBots,
        game.includedUsers, game.options.excludeNewUsers, game.includedNPCs,
        (res) => {
          game.currentGame = new HungryGames.Game(name, res, teams);
          cb(game);
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
    if (!Array.isArray(excluded)) excluded = [];
    const memList = Array.isArray(members) ? members : members.array();

    const memberIterate = function(obj) {
      if (obj.isNPC) return;
      if (included && excluded && !included.includes(obj.user.id) &&
          !excluded.includes(obj.user.id)) {
        if (excludeByDefault) {
          excluded.push(obj.user.id);
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
        setTimeout(() => memberStep(i));
      } else if (includedNPCs && i - memList.length < includedNPCs.length) {
        for (i; Date.now() - start < self.maxDelta &&
             i - memList.length < includedNPCs.length;
          i++) {
          const obj = includedNPCs[i - memList.length];
          finalMembers.push(
              new self._parent.NPC(obj.name, obj.avatarURL, obj.id));
        }
        setTimeout(() => memberStep(i));
      } else {
        done();
      }
    };

    iTime2 = Date.now();
    memberStep(0);
  }

  /**
   * Reset the specified category of data from a game.
   *
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
    if (command == 'all') {
      delete this._games[id];
      rimraf(this._parent.common.guildSaveDir + id + this.hgSaveDir, (err) => {
        if (!err) return;
        this._parent.error(
            'Failed to delete directory: ' + this._parent.common.guildSaveDir +
            id + this.hgSaveDir);
        console.error(err);
      });
      return 'Resetting ALL Hungry Games data for this server!';
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
      this.refresh(id);
      return 'Resetting ALL user data!';
    } else if (command == 'npcs') {
      game.includedNPCs = [];
      game.excludedNPCs = [];
      this.refresh(id);
      return 'Resetting ALL NPC data!';
    } else {
      return 'Please specify what data to reset.\nall {deletes all data ' +
          'for this server},\nevents {deletes all custom events},\n' +
          'current {deletes all data about the current game},\noptions ' +
          '{resets all options to default values},\nteams {delete all ' +
          'teams and creates new ones},\nusers {delete data about where to ' +
          'put users when creating a new game},\nnpcs {delete all NPCS}.';
    }
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
      try {
        game = HungryGames.GuildGame.from(game);
        game.id = id;
      } catch (err) {
        self._parent.error('Failed to parse game data for guild ' + id);
        return null;
      }

      // Flush default and stale options.
      if (game.options) {
        for (const opt in self.defaultOptions.keys) {
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
        yj.parseAsync(data, (err, data) => {
          if (err) {
            this._parent.error('Failed to parse game data:' + id);
            console.error(err);
            return;
          }
          if (this._parent.initialized) {
            this._parent.debug('Loaded game from file ' + id);
          }
          this._games[id] = parse(data);
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
          yj.stringifyAsync(data, (err, stringified) => {
            if (err) {
              this._parent.error('Failed to stringify HG data for ' + id);
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
    Object.values(this._games).forEach((el) => {
      el.clearIntervals();
    });
    this.messages.shutdown();
  }
}
/**
 * @description Wrapper for normal `require()` but also deletes cache reference
 * to object before requiring. This forces the object to be updated.
 *
 * @memberof HungryGames
 *
 * @private
 * @param {string} name Name of module to require.
 * @returns {object} The required module.
 */
function tmpRequire(name) {
  delete require.cache[require.resolve(name)];
  return require(name);
}
HungryGames.DefaultOptions = tmpRequire('./DefaultOptions.js');
HungryGames.ForcedOutcome = tmpRequire('./ForcedOutcome.js');
HungryGames.Grammar = tmpRequire('./Grammar.js');
HungryGames.FinalEvent = tmpRequire('./FinalEvent.js');
HungryGames.ArenaEvent = tmpRequire('./ArenaEvent.js');
HungryGames.WeaponEvent = tmpRequire('./WeaponEvent.js');
HungryGames.Battle = tmpRequire('./Battle.js');
HungryGames.OutcomeProbabilities = tmpRequire('./OutcomeProbabilities.js');
HungryGames.Day = tmpRequire('./Day.js');
HungryGames.Messages = tmpRequire('./Messages.js');
HungryGames.UserIconUrl = tmpRequire('./UserIconUrl.js');
HungryGames.Player = tmpRequire('./Player.js');
HungryGames.Team = tmpRequire('./Team.js');
HungryGames.Game = tmpRequire('./Game.js');
HungryGames.Event = tmpRequire('./Event.js');
HungryGames.GuildGame = tmpRequire('./GuildGame.js');
HungryGames.Simulator = tmpRequire('./Simulator.js');

module.exports = HungryGames;
