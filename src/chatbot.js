// Copyright 2018-2019 Campbell Crowley. All rights reserved.
// Author: Campbell Crowley (dev@campbellcrowley.com)
const dialogflow = require('dialogflow');
const auth = require('../auth.js');
const fs = require('fs');
require('./subModule.js').extend(ChatBot);  // Extends the SubModule class.

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
   *
   * @private
   * @type {object.<boolean>}
   */
  const disabledChatBot = {};

  /**
   * Regexp to match a mention mentioning the bot.
   *
   * @private
   * @type {RegExp}
   */
  let selfMentionRegex;

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

    selfMentionRegex = new RegExp(`\\s*<@!?${self.client.user.id}>\\s*`);

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
        self.common.mkAndWrite(filename, dir, JSON.stringify(obj));
      } else {
        self.common.mkAndWriteSync(filename, dir, JSON.stringify(obj));
      }
    });
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
    if (msg.author.bot || !msg.guild) return;
    msg.prefix = self.bot.getPrefix(msg.guild);
    if (msg.mentions.users.get(self.client.user.id) &&
        !self.command.find(msg.content.match(/^\S+/)[0], msg)) {
      const withoutMe = msg.content.replace(selfMentionRegex, '').trim();
      const withoutMeMatch = withoutMe.match(/^\S+/);
      let author;
      if (msg.guild !== null) {
        author = `${msg.guild.id}#${msg.channel.id}@${msg.author.id}`;
      } else {
        author = `PM:${msg.author.id}@${msg.author.tag}`;
      }
      if (withoutMeMatch && self.command.find(withoutMeMatch[0], msg)) {
        self.log(`${author} ${msg.content}`);
        msg.content = `${msg.prefix}${withoutMe}`;
        if (!self.command.trigger(msg)) {
          self.warn(`Command "${msg.content}" failed!`);
        }
        return;
      } else if (withoutMe.length < 2) {
        return;
      } else if (disabledChatBot[msg.guild.id]) {
        return;
      }
      self.log(`${author} ${msg.content}`);
      msg.text = ' ' +
          msg.cleanContent
              .replace(
                  new RegExp(
                      '\\s*@' + escapeRegExp(
                          msg.guild.me.nickname ||
                                    self.client.user.username) +
                          '\\s*',
                      'g'),
                  ' SpikeyBot ')
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
    const perms =
        (msg.channel.permissionsFor &&
         msg.channel.permissionsFor(self.client.user));
    if (perms && !perms.has(self.Discord.Permissions.FLAGS.SEND_MESSAGES)) {
      return;
    }
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

    // msg.channel.startTyping().catch(() => {});

    const startTime = Date.now();

    sessionClient.detectIntent(request)
        .then((responses) => {
          self.debug(
              'Dialogflow response delay: ' + (Date.now() - startTime) + 'ms');
          const result = responses[0].queryResult;
          if (result.parameters.fields.thing) {
            const list = result.parameters.fields.thing.listValue.values;
            const chosen =
                list[Math.floor(list.length * Math.random())].stringValue;
            result.fulfillmentText =
                result.fulfillmentText.replace(/~thing/g, chosen);
          }
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

            let author;
            if (msg.guild !== null) {
              author = `${msg.guild.id}#${msg.channel.id}@${msg.author.id}`;
            } else {
              author = `PM:${msg.author.id}@${msg.author.tag}`;
            }
            self.log(`${author} ${msg.content}`);
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
   *
   * @private
   *
   * @param {string} str Input to escape.
   * @returns {string} Escaped string.
   */
  function escapeRegExp(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}
module.exports = new ChatBot();
