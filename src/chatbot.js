// Copyright 2018 Campbell Crowley. All rights reserved.
// Author: Campbell Crowley (dev@campbellcrowley.com)
const dialogflow = require('dialogflow');
const auth = require('../auth.js');
require('./subModule.js')(ChatBot);  // Extends the SubModule class.

/**
 * @classdesc Manages natural language interaction.
 * @class
 * @augments SubModule
 * @listens Discord#message
 * @listens Command#chat
 */
function ChatBot() {
  const self = this;
  /** @inheritdoc */
  this.myName = 'ChatBot';

  /** @inheritdoc */
  this.initialize = function() {
    self.command.on('chat', onChatMessage);
    self.client.on('message', onMessage);

    if (self.bot.getBotName()) {
      process.env.GOOGLE_APPLICATION_CREDENTIALS =
          './gApiCredentials-' + self.bot.getBotName() + '.json';
    } else {
      process.env.GOOGLE_APPLICATION_CREDENTIALS = './gApiCredentials.json';
    }

    sessionClient = new dialogflow.SessionsClient();
  };
  /** @inheritdoc */
  this.shutdown = function() {
    self.command.deleteEvent('chat');
    self.client.removeListener('message', onMessage);
  };
  /**
   * @override
   * @inheritdoc
   */
  this.save = function(opt) {
  };

  let sessionClient;

  const reqTemplate = {
    session: 'default-session',
    queryInput: {
      text: {
        text: 'Hello World!',
        languageCode: 'en-US',
      },
    },
  };

  /**
   * Respond to messages where I've been mentioned.
   *
   * @private
   * @param {Discord~Message} msg Message was sent.
   * @listens Discord#message
   */
  function onMessage(msg) {
    msg.prefix = self.bot.getPrefix(msg.guild);
    if (!msg.author.bot && msg.guild &&
        msg.mentions.users.get(self.client.user.id) &&
        !self.command.find(msg.content.match(/^\S+/)[0], msg)) {
      self.log(msg.channel.id + '@' + msg.author.id + ' ' + msg.content);
      msg.text = ' ' +
          msg.content
              .replace(
                  new RegExp(
                      '\\s*\\<@\\!?' + self.client.user.id + '\\>\\s*', 'g'),
                  ' ')
              .trim();
      onChatMessage(msg);
    }
  }

  /**
   * Send message text content to dialogflow for handling.
   *
   * @private
   * @type {commandHandler}
   * @param {Discord~Message} msg Message that triggered command.
   * @listens Command#chat
   */
  function onChatMessage(msg) {
    if (!msg.text || msg.text.length < 2) return;
    let request = Object.assign({}, reqTemplate);
    request.session = sessionClient.sessionPath(
        auth['dialogflowProjectId' + (self.bot.getBotName() || '')],
        msg.channel.id);
    request.queryInput.text.text = msg.text.slice(1);

    sessionClient.detectIntent(request)
        .then((responses) => {
          // console.log('Intent');
          const result = responses[0].queryResult;
          /* console.log(`  Query: ${result.queryText}`);
          console.log(`  Response: ${result.fulfillmentText}`);
          if (result.intent) {
            console.log(`  Intent: ${result.intent.displayName}`);
          } else {
            console.log(`  No intent matched.`);
          } */
          if (result.fulfillmentText) {
            msg.channel.send(result.fulfillmentText).catch((err) => {
              self.error('Unable to reply to chat message: ' + msg.channel.id);
              console.error(err);
            });
          }
          if (result.parameters.fields.command) {
            let cmd = result.parameters.fields.command.stringValue.replace(
                /^command /, msg.prefix);
            // Replace parameters in the command with the values matched by
            // dialogflow.
            Object.entries(result.parameters.fields).forEach((el) => {
              if (el[0] == 'command') return;
              cmd = cmd.replace(
                  new RegExp(escapeRegExp('$' + el[0]), 'g'),
                  el[1].stringValue);
            });


            self.log('Triggered command: ' + cmd);
            msg.content = cmd;
            if (!self.command.trigger(msg)) {
              self.warn('Command "' + cmd + '" failed!');
            }
          }
        })
        .catch((err) => {
          console.error('ERROR:', err);
        });
  }
  /**
   * Escape a given string to be passed into a regular expression.
   * @private
   *
   * @param {string} str Input to escape.
   * @return {string} Escaped string.
   */
  function escapeRegExp(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}
module.exports = new ChatBot();
