// Copyright 2018 Campbell Crowley. All rights reserved.
// Author: Campbell Crowley (dev@campbellcrowley.com)
process.env.GOOGLE_APPLICATION_CREDENTIALS = './gApiCredentials.json';
const dialogflow = require('dialogflow');
require('./subModule.js')(ChatBot);  // Extends the SubModule class.

const projectId = 'spikeybot-587dd';

/**
 * @classdesc Manages natural language interaction.
 * @class
 * @augments SubModule
 * @listens SpikeyBot~Command#chat
 */
function ChatBot() {
  const self = this;
  /** @inheritdoc */
  this.myName = 'ChatBot';

  /** @inheritdoc */
  this.initialize = function() {
    self.command.on('chat', onChatMessage);
  };
  /** @inheritdoc */
  this.shutdown = function() {
    self.command.deleteEvent('chat');
  };
  /**
   * @override
   * @inheritdoc
   */
  this.save = function(opt) {
  };

  const sessionClient = new dialogflow.SessionsClient();

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
   * Send message text content to dialogflow for handling.
   *
   * @private
   * @type {commandHandler}
   * @param {Discord~Message} msg Message that triggered command.
   * @listens SpikeyBot~Command#chat
   */
  function onChatMessage(msg) {
    let request = Object.assign({}, reqTemplate);
    request.session = sessionClient.sessionPath(projectId, msg.channel.id);
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
          msg.channel.send(result.fulfillmentText).catch((err) => {
            self.error('Unable to reply to chat message: ' + msg.channel.id);
            console.error(err);
          });
          if (result.parameters.fields.command) {
            let cmd = result.parameters.fields.command.stringValue.replace(
                /^command /, '');
            msg.content = msg.prefix + cmd;
            self.command.trigger(cmd, msg);
          }
        })
        .catch((err) => {
          console.error('ERROR:', err);
        });
  }
}
module.exports = new ChatBot();
