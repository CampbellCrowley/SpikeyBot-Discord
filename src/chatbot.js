// Copyright 2018 Campbell Crowley. All rights reserved.
// Author: Campbell Crowley (dev@campbellcrowley.com)
const dialogflow = require('dialogflow');
const auth = require('../auth.js');
const fs = require('fs');
const mkdirp = require('mkdirp');
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

  /**
   * The guilds that have disabled the chatbot feature.
   * @private
   * @type {Object.<boolean>}
   */
  const disabledChatBot = {};

  /** @inheritdoc */
  this.initialize = function() {
    self.command.on('chat', onChatMessage);
    self.command.on(
        new self.command.SingleCommand(
            'togglechatbot', commandToggleChatBot,
            new self.command.CommandSetting({
              validOnlyInGuild: true,
              defaultDisabled: true,
              permissions: self.Discord.Permissions.FLAGS.MANAGE_ROLES |
                  self.Discord.Permissions.FLAGS.MANAGE_GUILD |
                  self.Discord.Permissions.FLAGS.BAN_MEMBERS,
            })));

    self.client.on('message', onMessage);

    if (self.bot.getBotName()) {
      process.env.GOOGLE_APPLICATION_CREDENTIALS =
          './gApiCredentials-' + self.bot.getBotName() + '.json';
    } else {
      process.env.GOOGLE_APPLICATION_CREDENTIALS = './gApiCredentials.json';
    }

    sessionClient = new dialogflow.SessionsClient();

    self.client.guilds.forEach(function(g) {
      fs.readFile(
          self.common.guildSaveDir + g.id + '/chatbot-config.json',
          function(err, file) {
            if (err) return;
            let parsed;
            try {
              parsed = JSON.parse(file);
            } catch (e) {
              return;
            }
            disabledChatBot[g.id] = parsed.disabledChatBot || false;
          });
    });
  };
  /** @inheritdoc */
  this.shutdown = function() {
    self.command.deleteEvent('chat');
    self.command.deleteEvent('togglechatbot');
    self.client.removeListener('message', onMessage);
  };
  /**
   * @override
   * @inheritdoc
   */
  this.save = function(opt) {
    self.client.guilds.forEach(function(g) {
      const dir = self.common.guildSaveDir + g.id;
      const filename = dir + '/chatbot-config.json';
      const obj = {
        disabledChatBot: disabledChatBot[g.id],
      };
      if (opt == 'async') {
        mkAndWrite(filename, dir, JSON.stringify(obj));
      } else {
        mkAndWriteSync(filename, dir, JSON.stringify(obj));
      }
    });
  };

  /**
   * Write data to a file and make sure the directory exists or create it if it
   * doesn't. Async
   * @see {@link Main~mkAndWriteSync}
   *
   * @private
   * @param {string} filename The name of the file including the directory.
   * @param {string} dir The directory path without the file's name.
   * @param {string} data The data to write to the file.
   */
  function mkAndWrite(filename, dir, data) {
    mkdirp(dir, function(err) {
      if (err) {
        self.error('Failed to make directory: ' + dir, 'Main');
        console.error(err);
        return;
      }
      fs.writeFile(filename, data, function(err2) {
        if (err2) {
          self.error('Failed to save timer: ' + filename, 'Main');
          console.error(err2);
          return;
        }
      });
    });
  }
  /**
   * Write data to a file and make sure the directory exists or create it if it
   * doesn't. Synchronous
   * @see {@link Main~mkAndWrite}
   *
   * @private
   * @param {string} filename The name of the file including the directory.
   * @param {string} dir The directory path without the file's name.
   * @param {string} data The data to write to the file.
   */
  function mkAndWriteSync(filename, dir, data) {
    try {
      mkdirp.sync(dir);
    } catch (err) {
      self.error('Failed to make directory: ' + dir, 'Main');
      console.error(err);
      return;
    }
    try {
      fs.writeFileSync(filename, data);
    } catch (err) {
      self.error('Failed to save timer: ' + filename, 'Main');
      console.error(err);
      return;
    }
  }

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
    if (msg.guild && disabledChatBot[msg.guild.id]) return;
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
                  ` ${self.client.user.username} `)
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
    if (msg.guild && disabledChatBot[msg.guild.id]) return;
    if (!msg.text || msg.text.length < 2) return;
    const request = Object.assign({}, reqTemplate);
    request.session = sessionClient.sessionPath(
        auth['dialogflowProjectId' + (self.bot.getBotName() || '')],
        msg.channel.id);
    request.queryInput.text.text = msg.text.slice(1);

    if (request.queryInput.text.text.length > 256) {
      request.queryInput.text.text =
          request.queryInput.text.text.substr(0, 256);
    }

    msg.channel.startTyping();

    const startTime = Date.now();

    sessionClient.detectIntent(request)
        .then((responses) => {
          self.debug(
              'Dialogflow response delay: ' + (Date.now() - startTime) + 'ms');
          msg.channel.stopTyping();
          // console.log('Intent');
          const result = responses[0].queryResult;
          if (result.parameters.fields.thing) {
            console.log(result.parameters.fields.thing.listValue.values);
            const list = result.parameters.fields.thing.listValue.values;
            const chosen =
                list[Math.floor(list.length * Math.random())].stringValue;
            result.fulfillmentText =
                result.fulfillmentText.replace(/~thing/g, chosen);
          }
          /* console.log(`  Query: ${result.queryText}`);
          console.log(`  Response: ${result.fulfillmentText}`);
          if (result.intent) {
            console.log(`  Intent: ${result.intent.displayName}`);
          } else {
            console.log(`  No intent matched.`);
          } */
          if (result.fulfillmentText) {
            msg.channel.send(result.fulfillmentText.replace(/\\n/g, '\n'))
                .catch((err) => {
                  self.error(
                      'Unable to reply to chat message: ' + msg.channel.id);
                  console.error(err);
                });
          }
          if (result.parameters.fields.loopback) {
            msg.text = result.parameters.fields.loopback.stringValue;
            onChatMessage(msg);
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
          self.debug(
              'Dialogflow response delay: ' + (Date.now() - startTime) + 'ms');
          self.error('Dialogflow failed request: ' + JSON.stringify(request));
          console.error('ERROR:', err);
          msg.channel.stopTyping();
          msg.channel.send('Failed to contact DialogFlow: ' + err.details);
        });
  }

  /**
   * Toggles the chatbot feature on a guild.
   *
   * @private
   * @type {commandHandler}
   * @param {Discord~Message} msg Message that triggered command.
   * @listens Command#togglechatbot
   */
  function commandToggleChatBot(msg) {
    if (disabledChatBot[msg.guild.id]) {
      disabledChatBot[msg.guild.id] = false;
      self.common.reply(msg, 'Enabled chatbot feature.');
    } else {
      disabledChatBot[msg.guild.id] = true;
      self.common.reply(msg, 'Disabled chatbot feature.');
    }
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
