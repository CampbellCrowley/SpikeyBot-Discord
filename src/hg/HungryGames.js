// Copyright 2019 Campbell Crowley. All rights reserved.
// Author: Campbell Crowley (dev@campbellcrowley.com)
const fs = require('fs');

/**
 * Contains a Hunger Games style simulation.
 */
class HungryGames {
  /**
   * @TODO: Remove reliance on SubModule.
   * @param {SubModule} parent Parent submodule used to hook logging into.
   */
  constructor(parent) {
    this._parent = parent;
    /**
     * Wrapper for normal `require()` but also deletes cache reference to object
     * before requiring. This forces the object to be updated in the future.
     *
     * @private
     * @param {string} name Name of module to require.
     * @returns {Object} The required module.
     */
    const tmpRequire = function(name) {
      delete require.cache[require.resolve(name)];
      return require(name);
    };
    this.FinalEvent = tmpRequire('./FinalEvent.js');
    this.ArenaEvent = tmpRequire('./ArenaEvent.js');
    this.WeaponEvent = tmpRequire('./WeaponEvent.js');
    this.Battle = tmpRequire('./Battle.js');
    this.OutcomeProbabilities = tmpRequire('./OutcomeProbabilities.js');
    this.Day = tmpRequire('./Day.js');
    this.Messages = tmpRequire('./Messages.js');
    this.UserIconUrl = tmpRequire('./UserIconUrl.js');
    this.Player = tmpRequire('./Player.js');
    this.Team = tmpRequire('./Team.js');
    this.Game = tmpRequire('./Game.js');
    this.Event = tmpRequire('./Event.js');
    this.GuildGame = tmpRequire('./GuildGame.js');
    this.Simulator = tmpRequire('./Simulator.js');
    this.DefaultOptions = tmpRequire('./DefaultOptions.js');
    /**
     * Current {@link HungryGames~Messages} instance.
     * @public
     * @type {HungryGames~Messages}
     * @constant
     */
    this.messages = new this.Messages();
    /**
     * Default game options.
     * @public
     * @type {HungryGames~DefaultOptions}
     * @constant
     */
    this.defaultOptions = new this.DefaultOptions();
    /**
     * All currently tracked games. Mapped by guild ID. In most cases you should
     * NOT reference this directly. Use {@link HungryGames.getGame} to get the
     * game object for a guild.
     * @see {@link HungryGames.getGame}
     *
     * @private
     * @type {Object.<HungryGames~GuildGame>}
     * @default
     */
    this._games = {};
    /**
     * Stores the guilds we have looked for their data recently and the
     * timestamp at which we looked. Used to reduce filesystem requests and
     * blocking.
     *
     * @private
     * @type {Object.<number>}
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
     * The file path to save current state for a specific guild relative to
     * Common~guildSaveDir.
     * @see {@link Common~guildSaveDir}
     * @see {@link HungryGames~games}
     * @see {@link HungryGames~saveFileDir}
     * @see {@link HungryGames~hgSaveDir}
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
     * @see {@link Common~guildSaveDir}
     * @see {@link HungryGames~games}
     * @see {@link HungryGames~saveFile}
     * @see {@link HungryGames~saveFileDir}
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
     */
    this._defaultBloodbathEvents = [];
    /**
     * Array of all events that can take place normally by default.
     *
     * @private
     * @type {HungryGames~Event[]}
     */
    this._defaultPlayerEvents = [];
    /**
     * Array of all arena events that can take place normally by default.
     *
     * @private
     * @type {HungryGames~ArenaEvent[]}
     */
    this._defaultArenaEvents = [];
    /**
     * Array of all battles that can take place normally by default.
     *
     * @private
     * @type {HungryGames~Battle[]}
     */
    this._defaultBattles = [];
    /**
     * Array of all weapons that can be used normally by default.
     *
     * @private
     * @type {HungryGames~Weapon[]}
     */
    this._defaultWeapons = [];
  }

  /**
   * @description The file path to save current state for a specific guild
   * relative to Common~guildSaveDir.
   * @see {@link Common~guildSaveDir}
   * @see {@link HungryGames~games}
   * @see {@link HungryGames~saveFileDir}
   * @see {@link HungryGames~hgSaveDir}
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
   * @see {@link Common~guildSaveDir}
   * @see {@link HungryGames~games}
   * @see {@link HungryGames~saveFile}
   * @see {@link HungryGames~saveFileDir}
   *
   * @public
   * @returns {string} Save dir path.
   */
  get hgSaveDir() {
    return this.hgSaveDir;
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
   * @description Returns a guild's game data. Returns cached version if that
   * exists, or searches the file system for saved data. Data will only be
   * checked from disk at most once every `HungryGames~findDelay` milliseconds.
   * Returns `null` if data could not be found, or an error occurred.
   *
   * @private
   * @param {number|string} id The guild id to get the data for.
   * @returns {?HungryGames~GuildGame} The game data, or null if no game could
   * be loaded.
   */
  _find(id) {
    if (this._games[id]) return this._games[id];
    if (Date.now() - this._findTimestamps[id] < this._findDelay) return null;
    this._findTimestamps[id] = Date.now();
    try {
      const tmp = fs.readFileSync(
          this._parent.common.guildSaveDir + id + this.hgSaveDir +
          this.saveFile);
      try {
        this._games[id] = JSON.parse(tmp);
        this._parent.debug('Loaded game from file ' + id);
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

    this._games[id] = this.GuildGame.from(this._games[id]);
    this._games[id].id = id;

    // Flush default and stale options.
    if (this._games[id].options) {
      for (const opt in this.defaultOptions) {
        if (!(this.defaultOptions[opt] instanceof Object)) continue;
        if (typeof this._games[id].options[opt] !==
            typeof this.defaultOptions[opt].value) {
          if (this.defaultOptions[opt].value instanceof Object) {
            this._games[id].options[opt] =
                Object.assign({}, this.defaultOptions[opt].value);
          } else {
            this._games[id].options[opt] = this.defaultOptions[opt].value;
          }
        } else if (this.defaultOptions[opt].value instanceof Object) {
          const dKeys = Object.keys(this.defaultOptions[opt].value);
          dKeys.forEach((el) => {
            if (typeof this._games[id].options[opt][el] !==
                typeof this.defaultOptions[opt].value[el]) {
              this._games[id].options[opt][el] =
                  this.defaultOptions[opt].value[el];
            }
          });
        }
      }
      for (const opt in this._games[id].options) {
        if (!(this._games[id].options[opt] instanceof Object)) continue;
        if (typeof this.defaultOptions[opt] === 'undefined') {
          delete this._games[id].options[opt];
        } else if (this._games[id].options[opt].value instanceof Object) {
          const keys = Object.keys(this._games[id].options[opt].value);
          keys.forEach((el) => {
            if (typeof this._games[id].options[opt][el] !==
                typeof this.defaultOptions[opt].value[el]) {
              delete this._games[id].options[opt][el];
            }
          });
        }
      }
    }

    // If the bot stopped while simulating a day, just start over and try
    // again.
    if (this._games[id] && this._games[id].currentGame &&
        this._games[id].currentGame.day &&
        this._games[id].currentGame.day.state === 1) {
      this._games[id].currentGame.day.state = 0;
    }
    return this._games[id];
  }
}

module.exports = HungryGames;
