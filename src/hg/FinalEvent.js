// Copyright 2019 Campbell Crowley. All rights reserved.
// Author: Campbell Crowley (dev@campbellcrowley.com)
const UserIconUrl = require('./UserIconUrl.js');
const Grammar = require('./Grammar.js');
const funTranslator = require('../lib/funTranslators.js');

/**
 * @description Finalized event ready for display to users.
 * @memberof HungryGames
 * @inner
 */
class FinalEvent {
  /**
   * @description Create an event ready for display.
   * @param {HungryGames~Event} evt Event to finalize.
   * @param {HungryGames~GuildGame} game Game context.
   * @param {HungryGames~Player[]} affected An array of all players affected by
   * this event.
   */
  constructor(evt, game, affected) {
    const useNickname = game.options.useNicknames ? 'nickname' : 'username';
    const mention = game.options.mentionAll;
    const vO = evt.victim.outcome;
    const aO = evt.attacker.outcome;
    const nV = evt.victim.count;
    const nA = evt.attacker.count;
    /**
     * @description String to send to mention users.
     * @public
     * @type {string}
     */
    this.mentionString = '';
    let translator = null;
    for (let i = 0; i < affected.length; i++) {
      if (!affected[i]) console.log('BAD AFFECTED', affected);
      if (!affected[i].isNPC && mention == 'all' ||
          (mention == 'death' &&
           ((vO == 'dies' && i < nV) || (aO == 'dies' && i >= nV)))) {
        this.mentionString += `<@${affected[i].id}>`;
      }
      if (affected[i].settings &&
          affected[i].settings['hg:fun_translators'] &&
          affected[i].settings['hg:fun_translators'] !== 'disabled') {
        translator = affected[i].settings['hg:fun_translators'];
      }
    }
    const affectedVictims = affected.slice(0, nV);
    const affectedAttackers = affected.slice(nV, nA + nV);
    let finalMessage =
        evt.message
            .replace(
                /\[V([^|]*)\|([^\]]*)\]/g,
                affectedVictims.length > 1 ? '$2' : '$1')
            .replace(
                /\[A([^|]*)\|([^\]]*)\]/g,
                affectedAttackers.length > 1 ? '$2' : '$1');
    let deadUsers = [];
    if (finalMessage.indexOf('{dead}') > -1) {
      const deadList = game.currentGame.includedUsers.filter(
          (obj) => !obj.living && !affected.find((u) => u.id == obj.id));
      if (deadList.length > 0) {
        const index = Math.floor(Math.random() * deadList.length);
        deadUsers = deadList.slice(index, index + 1);
      }
      finalMessage = finalMessage.replace(
          /\[D([^|]*)\|([^\]]*)\]/g, deadUsers.length <= 1 ? '$1' : '$2');
    }
    finalMessage =
        finalMessage.replace(/\{(victim|attacker|dead)\}/g, (match, tag) => {
          switch (tag) {
            case 'victim':
              return Grammar.formatMultiNames(affectedVictims, useNickname);
            case 'attacker':
              return Grammar.formatMultiNames(affectedAttackers, useNickname);
            case 'dead':
              if (deadUsers.length > 0) {
                return Grammar.formatMultiNames(deadUsers, useNickname);
              } else {
                return 'an animal';
              }
          }
        });
    finalMessage = funTranslator.to(translator, finalMessage);

    /**
     * @description Message to show to user.
     * @public
     * @type {string}
     */
    this.message = finalMessage;
    /**
     * @description The icons to show in the message.
     * @public
     * @type {HungryGames~UserIconUrl[]}
     */
    this.icons = UserIconUrl.from(affectedVictims, affectedAttackers);

    /**
     * @description Amount of weapons this consumes.
     * @public
     * @type {Array.<{name: string, count: number}>}
     */
    this.consumes = evt.consumes;
    /**
     * @description The ID of the player that will be consuming weapons.
     * @public
     * @type {string}
     */
    this.consumer = evt.consumer;

    const vW = evt.victim.weapon &&
        [{name: evt.victim.weapon.name, count: evt.victim.weapon.count}];
    const aW = evt.attacker.weapon &&
        [{name: evt.attacker.weapon.name, count: evt.attacker.weapon.count}];

    /**
     * @description Information about the victims as a result of this event.
     * Weapon count is amount gained.
     * @public
     * @type {{
     *   outcome: string,
     *   count: number,
     *   killer: boolean,
     *   weapons: Array.<{name: string, count: number}>
     * }}
     */
    this.victim = {
      outcome: vO,
      count: nV,
      killer: evt.victim.killer,
      weapons: vW || [],
    };
    /**
     * @description Information about the attackers as a result of this event.
     * Weapon count is amount gained.
     * @public
     * @type {{
     *   outcome: string,
     *   count: number,
     *   killer: boolean,
     *   weapons: Array.<{name: string, count: number}>
     * }}
     */
    this.attacker = {
      outcome: aO,
      count: nA,
      killer: evt.attacker.killer,
      weapons: aW || [],
    };

    /**
     * @description Additional message text to display.
     * @public
     * @type {string}
     */
    this.subMessage = evt.subMessage || '';
  }
}

module.exports = FinalEvent;
