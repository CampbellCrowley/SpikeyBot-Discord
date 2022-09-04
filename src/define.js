// Copyright 2018-2019 Campbell Crowley. All rights reserved.
// Author: Campbell Crowley (dev@campbellcrowley.com)

require('./subModule.js').extend(Define);  // Extends the SubModule class.
const https = require('https');
const auth = require('../auth.js');

/**
 * @classdesc Handles defining word commands.
 * @class
 * @augments SubModule
 * @listens Command#define
 */
function Define() {
  const self = this;
  /** @inheritdoc */
  this.myName = 'Define';
  /** @inheritdoc */
  this.initialize = function() {
    self.command.on(
        new self.command.SingleCommand(
            ['define', 'def', 'definition'], commandDefine));
  };
  /** @inheritdoc */
  this.shutdown = function() {
    self.command.deleteEvent('define');
  };

  /**
   * Base url to request from api.
   *
   * @private
   * @default
   * @constant
   * @type {string}
   */
  const reqURL = 'https://wordsapiv1.p.rapidapi.com/words/';

  /**
   * Handle the user asking for a definition.
   *
   * @private
   * @type {commandHandler}
   * @param {Discord~Message} msg Message that triggered command.
   * @listens Command#define
   */
  function commandDefine(msg) {
    const match = (msg.text || '').match(/(\w+)/);
    if (!match) {
      self.common.reply(msg, 'Please specify a word to define.')
          .catch(() => {});
      return;
    }
    const word = match[1];
    msg.channel.sendTyping();
    const opt = {headers: {'User-Agent': self.common.ua}};

    const req = https.request(reqURL + word, opt, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        let parsed;
        try {
          parsed = JSON.parse(data);
        } catch (err) {
          self.common.reply(msg, 'Oops, something is broken.').catch(() => {});
          return;
        }
        if (parsed.success ===false) {
          self.common.reply(
              msg, 'Unable to find word in the dictionary.', word);
        } else {
          replyDef(msg, parsed);
        }
        if (msg.text.indexOf('--raw') > -1) {
          msg.channel.send({
            content: '```' +
                JSON.stringify(parsed, null, 1).substring(0, 1994) + '```',
          });
        }
      });
    });
    req.on('error', (err) => {
      self.error('Error while fetching definition: ' + err.message);
      console.error(err);
    });
    req.setHeader('X-RapidAPI-Key', auth.wordsAPIKey);
    req.end();
  }

  /**
   * Format a Discord message reply from the given data.
   *
   * @private
   * @param {Discord~Message} msg Message to reply to.
   * @param {object} data Parsed reply from words api.
   */
  function replyDef(msg, data) {
    const embed = new self.Discord.EmbedBuilder();
    embed.setTitle(fUp(data.word));
    embed.setColor([255, 0, 255]);
    if (data.results) {
      const list = data.results.slice(0, 5).map(formatSingle);
      embed.addFields([{
        name: 'Definition' + (data.results.length > 1 ? 's' : ''),
        value: list.join('\n'),
      }]);
    }
    if (data.syllables) {
      embed.addFields([{
        name: 'Syllable' + (data.syllables.count > 1 ? 's (' : ' (') +
            data.syllables.count + ')',
        value: data.syllables.list.join(' '),
      }]);
    }
    if (data.pronunciation) {
      const p = typeof data.pronunciation === 'string' ?
          data.pronunciation :
          Object.entries(data.pronunciation)
              .map((el) => {
                return el[0] + ': ' + el[1];
              })
              .join('\n');
      embed.addFields([{name: 'Pronunciation', value: p}]);
    }
    msg.channel.send({content: self.common.mention(msg), embeds: [embed]});
  }

  /**
   * Format a single definition to string format.
   *
   * @private
   * @param {{
   *   definition: string,
   *   partOfSpeech: string,
   *   examples: Array.<string>,
   *   synonyms: Array.<string>
   * }} el Definition object to format.
   * @returns {string} Formatted string.
   */
  function formatSingle(el) {
    let res = '';
    if (el.definition) {
      res += `__${fUp(el.definition)}__\n`;
    }
    if (el.synonyms) {
      res += el.synonyms.join(', ') + '\n';
    }
    if (el.partOfSpeech) {
      res += `*${el.partOfSpeech}*\n`;
    }
    if (el.examples) {
      res += el.examples.map((el, i) => (i + 1) + ') ' + fUp(el)).join('\n') +
          '\n';
    }
    return res;
  }

  /**
   * Capitalize first character of string, and lowercase the rest.
   *
   * @private
   * @param {string} s Input.
   * @returns {string} Output.
   */
  function fUp(s) {
    return s[0].toLocaleUpperCase() + s.slice(1).toLocaleLowerCase();
  }
}

module.exports = new Define();
