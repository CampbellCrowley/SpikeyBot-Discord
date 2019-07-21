// Copyright 2019 Campbell Crowley. All rights reserved.
// Author: Campbell Crowley (dev@campbellcrowley.com)
const fs = require('fs');
const SubModule = require('./subModule.js');

/**
 * @description Provides interface to allow other bots to run commands.
 * @augments SubModule
 * @listens external:Discord~Client#message
 * @listens Command#togglebot
 */
class BotCommands extends SubModule {
  /**
   * @description SubModule providing external bot command interface.
   */
  constructor() {
    super();
    /** @inheritdoc */
    this.myName = 'BotCommands';

    /**
     * @description The name of the file to check for if bot commands are
     * enabled.
     * @private
     * @constant
     * @default
     * @type {string}
     */
    this._filename = '/enableBotCommands';

    /**
     * @description Maximum number of commands that can be triggered this way
     * per {@link BotCommands~_maxDelta}.
     * @private
     * @type {number}
     * @constant
     * @default
     */
    this._maxNum = 5;
    /**
     * @description Amount of time in milliseconds where a maximum of
     * {@link BotCommands~_maxNum} commands may be triggered before cooldown is
     * started.
     * @private
     * @type {number}
     * @constant
     * @default
     */
    this._maxDelta = 15 * 1000;
    /**
     * @description Amount of time in milliseconds to ignore all bot commands
     * after exceeding the rate limit.
     * @private
     * @type {number}
     * @constant
     * @default
     */
    this._cooldownLength = 10 * 1000;

    /**
     * @description History of last few commands triggered per-guild. Used to
     * put command triggering on cooldown if rate limits are exceeded.
     * @private
     * @type {object.<{
     *   history: Array.<{author: string, time: number}>,
     *   cooldownStart: number
     * }>}
     * @default
     */
    this._recentCommands = {};

    this._onMessage = this._onMessage.bind(this);
    this._commandToggleBotCmds = this._commandToggleBotCmds.bind(this);
  }
  /** @inheritdoc */
  initialize() {
    this.command.on(
        new this.command.SingleCommand(
            [
              'allowbot',
              'allowbots',
              'enablebot',
              'enablebots',
              'togglebot',
              'togglebots',
              'denybot',
              'denybots',
              'disablebot',
              'disablebots',
            ],
            this._commandToggleBotCmds, new this.command.CommandSetting({
              validOnlyInGuild: true,
              defaultDisabled: true,
              permissions: this.Discord.Permissions.FLAGS.MANAGE_ROLES |
                  this.Discord.Permissions.FLAGS.MANAGE_GUILD,
            })));
    this.client.on('message', this._onMessage);
  }
  /** @inheritdoc */
  shutdown() {
    this.command.deleteEvent('allowbot');
    this.client.removeListener('message', this._onMessage);
  }

  /**
   * Handle messages sent by bots.
   *
   * @private
   * @param {Discord~Message} msg Message was sent.
   * @listens Discord#message
   */
  _onMessage(msg) {
    if (!msg.guild || !msg.author.bot ||
        msg.author.id === this.client.user.id) {
      return;
    }

    const prefixRegex = new RegExp(`^<@!?${this.client.user.id}>`);

    if (!msg.content.match(prefixRegex)) return;

    let recent = this._recentCommands[msg.guild.id];
    const now = Date.now();
    if (recent && now - recent.cooldownStart < this._cooldownLength) return;

    if (!fs.existsSync(
        `${this.common.guildSaveDir}${msg.guild.id}${this._filename}`)) {
      return;
    }

    msg.content = msg.content.replace(prefixRegex, '').trim();
    msg.prefix = this.bot.getPrefix(msg.guild);
    msg.botCmd = true;

    const commandSuccess =
        this.command.validate(msg.content.split(/ |\n/)[0], msg);
    if (commandSuccess !== 'No Handler') {
      if (!recent) {
        recent = this._recentCommands[msg.guild.id] = {
          history: [],
          cooldownStart: 0,
        };
      }
      const hist = recent.history;

      hist.push({author: msg.author.id, time: now});

      let num = 0;
      const oldest = now - this._maxDelta;
      while (num < hist.length && hist[num].time < oldest) num++;
      if (num > 0) hist.splice(0, num);

      if (hist.length > this._maxNum) {
        this.common.reply(
            msg, 'Bot Command Rate Limit',
            'Rate limit exceeded. All bot commands will be ignored for ' +
                '10 seconds.');
        this._recentCommands[msg.guild.id].cooldownStart = now;
        return;
      }
    }
    const content = msg.content.replace(/\n/g, '\\n');
    let author;
    let logged;
    if (msg.guild !== null) {
      author = `Bot:${msg.guild.id}#${msg.channel.id}@${msg.author.id}`;
    } else {
      author = `Bot:PM:${msg.author.id}@${msg.author.tag}`;
    }
    if (!commandSuccess) {
      logged = `${author} ${content}`;
      this.log(logged);
    } else {
      logged = `${author} ${commandSuccess} ${content}`;
      this.debug(logged);
    }
    const start = Date.now();
    this.command.trigger(msg);
    const delta = Date.now() - start;
    if (delta > 20) {
      this.debug(`${logged} took an excessive ${delta}ms`);
    }
  }

  /**
   * @description Toggle whether bots are able to run commands on this guild.
   * @private
   * @type {commandHandler}
   * @param {Discord~Message} msg Message that triggered command.
   * @listens Command#togglebot
   */
  _commandToggleBotCmds(msg) {
    const enableList = ['enable', 'on', 'allow', 'true'];
    const disableList = ['disable', 'off', 'deny', 'false', 'disallow'];
    const file = `${this.common.guildSaveDir}${msg.guild.id}${this._filename}`;
    const exists = fs.existsSync(file);
    let setTo = true;
    const content = msg.content.toLocaleLowerCase();
    if (enableList.find((el) => content.indexOf(el) > -1)) {
      setTo = true;
    } else if (disableList.find((el) => content.indexOf(el) > -1)) {
      setTo = false;
    } else {
      setTo = !exists;
    }

    if (!exists && setTo) {
      const emoji = '✅';
      this.common
          .reply(
              msg, 'Are you sure?',
              'Allowing bots to run commands could potentially cause a ' +
                  'feedback loop. Only enable this if you know what you are' +
                  ' doing. Use at your own risk.\nReact with ' + emoji +
                  ' to confirm')
          .then((msg_) => {
            msg_.react(emoji).catch(() => {});
            msg_.awaitReactions(
                (reaction, user) => reaction.emoji.name == emoji &&
                        user.id === msg.author.id,
                {max: 1, time: 30 * 1000})
                .then((reactions) => {
                  msg_.reactions.removeAll().catch(() => {});
                  if (reactions.size == 0) {
                    msg_.edit('Timed Out').catch(() => {});
                    return;
                  }
                  try {
                    fs.closeSync(fs.openSync(file, 'a'));
                    this.common.reply(msg, 'Bot Commands', 'Now Allowed');
                  } catch (err) {
                    this.error(
                        'Failed to enable bot commands: ' + msg.guild.id);
                    console.error(err);
                    this.common.reply(
                        msg, 'Bot Commands',
                        'Failed to toggle due to internal error.');
                  }
                });
          });
    } else if (exists && !setTo) {
      fs.unlink(file, (err) => {
        if (err) {
          this.error('Failed to disable bot commands: ' + msg.guild.id);
          console.error(err);
          this.common.reply(
              msg, 'Bot Commands', 'Failed to toggle due to internal error.');
        } else {
          this.common.reply(msg, 'Bot Commands', 'Now Disallowed');
        }
      });
    } else {
      this.common.reply(
          msg, 'Bot Commands',
          setTo ? 'Already allowed' : 'Already disallowed');
    }
  }
}

module.exports = new BotCommands();
