// Copyright 2019 Campbell Crowley. All rights reserved.
// Author: Campbell Crowley (dev@campbellcrowley.com)

/**
 * Contains a Hunger Games style simulation.
 */
class HungryGames {
  /***/
  constructor() {
    this.FinalEvent = _tmpRequire('./FinalEvent.js');
    this.ArenaEvent = _tmpRequire('./ArenaEvent.js');
    this.WeaponEvent = _tmpRequire('./WeaponEvent.js');
    this.Battle = _tmpRequire('./Battle.js');
    this.OutcomeProbabilities = _tmpRequire('./OutcomeProbabilities.js');
    this.Day = _tmpRequire('./Day.js');
    this.Messages = _tmpRequire('./Messages.js');
    this.UserIconUrl = _tmpRequire('./UserIconUrl.js');
    this.Player = _tmpRequire('./Player.js');
    this.Team = _tmpRequire('./Team.js');
    this.Game = _tmpRequire('./Game.js');
    this.Event = _tmpRequire('./Event.js');
    this.GuildGame = _tmpRequire('./GuildGame.js');
    this.Simulator = _tmpRequire('./Simulator.js');
    this.DefaultOptions = _tmpRequire('./DefaultOptions.js');
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
  }
  /**
   * Wrapper for normal `require()` but also deletes cache reference to object
   * before requiring. This forces the object to be updated in the future.
   *
   * @private
   * @param {string} name Name of module to require.
   * @returns {Object} The required module.
   */
  _tmpRequire(name) {
    delete require.cache[require.resolve(name)];
    return require(name);
  }

  /**
   * Returns a reference to the current games object for a given guild.
   *
   * @public
   * @param {string} id The guild id to get the data for.
   * @returns {?HungryGames~GuildGame} The current object storing all data about
   * game in a guild.
   */
  getGame(id) {
    return _find(id);
  }
}

module.exports = HungryGames;
