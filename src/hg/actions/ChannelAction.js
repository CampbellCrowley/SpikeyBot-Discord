// Copyright 2019 Campbell Crowley. All rights reserved.
// Author: Campbell Crowley (dev@campbellcrowley.com)
const Action = require('./Action.js');

/**
 * @description Handler function for a action to be performed on the game
 * channel.
 * @typedef HungryGames~Action~ChannelActionHandler
 * @type Function
 *
 * @param {HungryGames} hg HG context.
 * @param {HungryGames~GuildGame} game Game context.
 * @param {external:Discord~TextChannel} channel Channel context.
 */

/**
 * @description Action to perform on the channel where the game is taking place.
 *
 * @memberof HungryGames
 * @inner
 * @augments HungryGames~Action
 */
class ChannelAction extends Action {
  /**
   * @inheritdoc
   * @param {HungryGames~Action~ChannelActionHandler} handler Handler to
   * override.
   */
  constructor(handler) {
    super(handler);
  }

  /**
   * @description Trigger the action to be performed.
   *
   * @type {HungryGames~Action~ChannelActionHandler}
   * @public
   * @abstract
   * @param {HungryGames} hg HG context.
   * @param {HungryGames~GuildGame} game Game context.
   * @param {external:Discord~TextChannel} channel Channel context.
   */
  trigger(hg, game, channel) {
    hg;
    game;
    channel;
    throw new Error('Trigger function not overridden.');
  }
}

module.exports = ChannelAction;
