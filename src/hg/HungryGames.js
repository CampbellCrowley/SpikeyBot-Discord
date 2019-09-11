// Copyright 2019-2020 Campbell Crowley. All rights reserved.
// Author: Campbell Crowley (dev@campbellcrowley.com)
const fs = require('fs');
const rimraf = require('rimraf'); // rm -rf

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
     * @description The minimum amount of time to keep a
     * {@link HungryGames~GuildGame} in memory before purging after a save.
     * @private
     * @type {number}
     * @constant
     * @default 3 minutes
     */
    this._purgeDelta = 3 * 60 * 1000;
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
     * @description Object storing all default events for the games. Null until
     * specified by instantiator.
     * @private
     * @type {?HungryGames~EventContainer}
     * @default
     */
    this._defaultEventStore = null;
    /**
     * Array of all battles that can take place normally by default.
     *
     * @private
     * @type {HungryGames~Battle[]}
     * @default
     */
    this._defaultBattles = [];
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
   * @description Update reference to the current
   * {@link HungryGames~EventContainer} that stores all custom events.
   * @public
   * @param {HungryGames~EventContainer} ec The container reference.
   */
  setDefaultEvents(ec) {
    this._defaultEventStore = ec;
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
   * @description Returns an object storing all of the default events for the
   * games.
   *
   * @public
   * @returns {HungryGames~EventContainer} Object storing default events.
   */
  getDefaultEvents() {
    return this._defaultEventStore;
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
      guild = this._parent.client.guilds.resolve(guild);
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
      getAll(guild.members.cache);
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
      guild = this._parent.client.guilds.resolve(guild);
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
        getAll(guild.members.cache);
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
   * @param {
   *   external:Discord~Collection<external:Discord~GuildMember>
   * } members All members in guild.
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
   * @returns {string} The message key referencing what happened.
   */
  resetGame(id, command) {
    const game = this.getGame(id);
    if (!game) return 'resetNoData';
    if (game.currentGame && game.currentGame.inProgress) {
      return 'resetInProgress';
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
      return 'resetAll';
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
      return 'resetStats';
    } else if (command == 'events') {
      game.customEventStore = new HungryGames.EventContainer();
      game.disabledEventIds = {
        bloodbath: [],
        player: [],
        arena: [],
        weapon: [],
        battle: {starts: [], attacks: [], outcomes: []},
      };
      delete game.legacyEvents;
      return 'resetEvents';
    } else if (command == 'current') {
      game.currentGame = null;
      return 'resetCurrent';
    } else if (command == 'options') {
      const optKeys = this.defaultOptions.keys;
      game.options = {};
      for (const key of optKeys) {
        game.options[key] = this.defaultOptions[key].value;
      }
      return 'resetOptions';
    } else if (command == 'teams') {
      game.currentGame.teams = [];
      game.formTeams();
      return 'resetTeams';
    } else if (command == 'users') {
      game.includedUsers = [];
      game.excludedUsers = [];
      this.refresh(id, () => {});
      return 'resetUsers';
    } else if (command == 'npcs') {
      game.includedNPCs = [];
      game.excludedNPCs = [];
      this.refresh(id, () => {});
      return 'resetNPCs';
    } else if (command == 'actions') {
      game.actions = new HungryGames.ActionStore();
      this._parent._fire('actionUpdate', id, null);
      return 'resetActions';
    } else if (command == 'react') {
      game.reactMessage = null;
      return 'resetReact';
    } else {
      return 'resetHelp';
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
      cb(null);
    });
  }

  /**
   * @description Create a new event.
   * @public
   * @param {HungryGames~Event} evt Event object, or Event-like object, to
   * finalize and save.
   * @param {Function} [cb] Optional callback that fires once data is saved to
   * file. First parameter is optional error string argument. Second is
   * otherwise the final created event.
   * @returns {?string} The event's ID if the event was created successfully, or
   * null if failed to parse data.
   */
  createEvent(evt, cb) {
    if (typeof cb !== 'function') cb = function() {};
    const creator = evt.creator;

    if (evt.type === 'normal') {
      const err = HungryGames.NormalEvent.validate(evt);
      if (err) {
        cb(err);
        return null;
      }
      evt = HungryGames.NormalEvent.from(evt);
    } else if (evt.type === 'arena') {
      const err = HungryGames.ArenaEvent.validate(evt);
      if (err) {
        cb(err);
        return null;
      }
      evt = HungryGames.ArenaEvent.from(evt);
      const fail = evt.outcomes.find(
          (el) => typeof el.id !== 'string' || el.id.length === 0);
      if (fail) {
        cb('BAD_OUTCOME_BAD_ID');
        return;
      }
    } else if (evt.type === 'weapon') {
      const err = HungryGames.WeaponEvent.validate(evt);
      if (err) {
        cb(err);
        return null;
      }
      evt = HungryGames.WeaponEvent.from(evt);
      const fail = evt.outcomes.find(
          (el) => typeof el.id !== 'string' || el.id.length === 0);
      if (fail) {
        cb('BAD_OUTCOME_BAD_ID');
        return;
      }
    } else {
      cb('BAD_TYPE');
      return null;
    }
    const hash = HungryGames.Event.createIDHash();
    const now = Date.now();
    if (!evt.id.match(/\d{17,19}\/\d+-[0-9a-f]/)) {
      evt.id = `${creator}/${now}-${hash}`;
    }
    evt.creator = creator;

    if (evt.outcomes) {
      evt.outcomes.map((el) => HungryGames.NormalEvent.from(el));
    }

    const newDir = HungryGames.EventContainer.eventDir;
    const filename = `${newDir}${evt.id}.json`;
    if (fs.existsSync(filename)) {
      cb('ALREADY_EXISTS');
      return null;
    }
    const str = JSON.stringify(evt);
    this._parent.common.mkAndWrite(filename, null, str, (err) => {
      if (err) {
        console.error(err);
        cb('WRITE_FAILED');
        return;
      }

      const toSend = global.sqlCon.format(
          'INSERT INTO HGEvents (Id, CreatorId, DateCreated, Privacy, ' +
              'EventType) VALUES (?, ?, FROM_UNIXTIME(?), "unlisted", ?)',
          [evt.id, evt.creator, now / 1000, evt.type]);
      global.sqlCon.query(toSend, (err) => {
        if (err) {
          console.error(err);
          cb('SQL_FAILED');
          return;
        }
        cb(null, evt);
      });
    });
    return evt.id;
  }

  /**
   * @description Completely delete an event and all of its data.
   * @todo Deleting a sub-event is not safe for multiple requests, it does not
   * handle the requests properly if a second request is made before the first
   * is completed.
   * @public
   * @param {string} user The user requesting deletion.
   * @param {string} id The ID of the event to delete.
   * @param {Function} [cb] Callback once completed. Only parameter is optional
   * error string.
   */
  deleteEvent(user, id, cb) {
    if (typeof cb !== 'function') cb = function() {};
    if (typeof id !== 'string' || id.length === 0) {
      cb('BAD_ID');
      return;
    }
    const match = id.match(/^(\d{17,19}\/\d+-[0-9a-z]+)\/([0-9a-z]+)$/);
    let sub = null;
    if (match) {
      id = match[1];
      sub = match[2];
    }
    const toSend =
        global.sqlCon.format('SELECT * FROM HGEvents WHERE id=?', [id]);
    global.sqlCon.query(toSend, (err, rows) => {
      if (err) {
        console.error(err);
        cb('SQL_FAILED');
        return;
      }
      if (!rows || !rows[0] || !rows[0].CreatorId) {
        cb('BAD_ID');
        return;
      }
      if (rows[0].CreatorId != user) {
        cb('BAD_USER');
        return;
      }
      if (sub) {
        if (!this._defaultEventStore) {
          cb('NOT_READY');
          return;
        }
        this._defaultEventStore.fetch(id, null, (err, evt) => {
          if (err) {
            cb(err);
            return;
          }
          const index = evt.outcomes.findIndex((el) => el.id === sub);
          if (index === -1) {
            cb('BAD_SUB_ID');
            return;
          }
          evt.outcomes.splice(index, 1);
          this.replaceEvent(user, evt, cb);
        });
      } else {
        const toSend =
            global.sqlCon.format('DELETE FROM HGEvents WHERE id=?', [id]);
        global.sqlCon.query(toSend, (err, rows) => {
          if (err) {
            console.error(err);
            cb('SQL_FAILED');
            return;
          } else if (!rows.affectedRows) {
            console.error('FAILED to delete event row', id);
          }
          const filename = `${HungryGames.EventContainer.eventDir}${id}.json`;
          this._parent.common.unlink(filename, (err) => {
            if (err) {
              console.error(err);
              cb('UNLINK_FAILED');
              return;
            }
            cb(null);
          });
        });
      }
    });
  }

  /**
   * @description Replace an event with new data.
   * @public
   * @param {string} user The user requesting deletion.
   * @param {HungryGames~Event} evt The new event data.
   * @param {Function} [cb] Callback once completed. Only parameter is optional
   * error string.
   */
  replaceEvent(user, evt, cb) {
    if (typeof cb !== 'function') cb = function() {};

    if (evt.type === 'normal') {
      const err = HungryGames.NormalEvent.validate(evt);
      if (err) {
        cb(err);
        return;
      }
      evt = HungryGames.NormalEvent.from(evt);
    } else if (evt.type === 'arena') {
      const err = HungryGames.ArenaEvent.validate(evt);
      if (err) {
        cb(err);
        return;
      }
      evt = HungryGames.ArenaEvent.from(evt);
    } else if (evt.type === 'weapon') {
      const err = HungryGames.WeaponEvent.validate(evt);
      if (err) {
        cb(err);
        return;
      }
      evt = HungryGames.WeaponEvent.from(evt);
    } else {
      cb('BAD_TYPE');
      return;
    }
    const newDir = HungryGames.EventContainer.eventDir;
    const filename = newDir + evt.id + '.json';
    if (!fs.existsSync(filename)) {
      cb('NONEXISTENT');
      return;
    }

    const toSend = global.sqlCon.format(
        'SELECT * FROM HGEvents WHERE id=? LIMIT 1', [evt.id]);
    global.sqlCon.query(toSend, (err, rows) => {
      if (err) {
        console.error(err);
        cb('SQL_FAILED');
        return;
      }
      if (!rows || !rows[0] || !rows[0].CreatorId) {
        cb('BAD_ID');
        return;
      }
      if (rows[0].CreatorId != user) {
        cb('BAD_USER');
        return;
      }
      const toSend = global.sqlCon.format(
          'UPDATE HGEvents SET DateModified=FROM_UNIXTIME(?) WHERE id=?',
          [Date.now() / 1000, evt.id]);
      global.sqlCon.query(toSend, (err) => {
        if (err) console.error(err);
      });

      const str = JSON.stringify(evt);
      this._parent.common.mkAndWrite(filename, newDir, str, (err) => {
        if (err) {
          console.error(err);
          cb('WRITE_FAILED');
          return;
        }
        cb(null);
      });
    });
  }

  /**
   * @description Fetch all event IDs of the events the given user has created.
   * @public
   * @param {string} user The user requesting deletion.
   * @param {basicCB} [cb] Callback once completed. First parameter is optional
   * error string, second is otherwise an array if database rows.
   */
  fetchUserEvents(user, cb) {
    const toSend = global.sqlCon.format(
        'SELECT * FROM HGEvents WHERE CreatorId=?', [user]);
    global.sqlCon.query(toSend, (err, files) => {
      if (err) {
        cb('SQL_FAILED');
      } else {
        cb(null, files);
      }
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
    if (!id) {
      cb(null);
      return null;
    }
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
      this._parent.common.readAndParse(filename, (err, parsed) => {
        if (err) {
          if (err.code === 'ENOENT') {
            cb(null);
          } else {
            this._parent.debug('Failed to load game data for guild:' + id);
            console.error(err);
          }
          return;
        }
        this._games[id] = parse(parsed);
        cb(this._games[id]);
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
      const dir = `${this._parent.common.guildSaveDir}${id}${this.hgSaveDir}`;
      const filename = `${dir}${this.saveFile}`;
      const saveStartTime = Date.now();
      let stringified;
      try {
        stringified = JSON.stringify(data);
      } catch (err) {
        this._parent.error('Failed to stringify synchronously');
        console.error(err);
        return;
      }
      if (opt == 'async') {
        this._parent.common.mkAndWrite(filename, dir, stringified, (err) => {
          if (err) {
            this._parent.error(`Failed to save HG data for ${filename}`);
            console.error(err);
          } else if (
            this._findTimestamps[id] - saveStartTime < -this._purgeDelta) {
            delete this._games[id];
            delete this._findTimestamps[id];
            this._parent.debug(`Purged ${id}`);
          }
        });
      } else {
        this._parent.common.mkAndWriteSync(filename, dir, stringified);
        if (this._findTimestamps[id] - Date.now() < -this._purgeDelta) {
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

  /**
   * Games with more than this many members is considered large, and will have
   * some features disabled in order to improve performance.
   *
   * @public
   * @static
   * @type {number}
   * @constant
   * @default 20000
   */
  static get largeServerCount() {
    return 20000;
  }
}

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
  './Event.js',
  './NormalEvent.js',
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
  './EventContainer.js',
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
