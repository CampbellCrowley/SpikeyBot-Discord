// Copyright 2019 Campbell Crowley. All rights reserved.
// Author: Campbell Crowley (dev@campbellcrowley.com)
const HGAction = require('./HGAction.js');

/**
 * @description Handler function for a action to be performed on the game
 * channel.
 * @typedef HungryGames~ChannelActionHandler
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
 * @augments HungryGames~HGAction
 */
class ChannelAction extends HGAction {
  /**
   * @inheritdoc
   * @param {HungryGames~ChannelActionHandler} handler Handler to override.
   */
  constructor(handler) {
    super(handler);
  }

  /**
   * @description Trigger the action to be performed.
   *
   * @type {HungryGames~ChannelActionHandler}
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
