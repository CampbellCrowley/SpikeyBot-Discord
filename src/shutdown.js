// Copyright 2021 Campbell Crowley. All rights reserved.
// Author: Campbell Crowley (dev@campbellcrowley.com)
const SubModule = require('./subModule.js');

/**
 * @description The script that shuts down SpikeyBot New Years 2021.
 * @augments SubModule
 */
class Shutdown extends SubModule {
  /**
   * Instantiate Shutdown SubModule.
   */
  constructor() {
    super();
    /** @inheritdoc */
    this.myName = 'Shutdown';

    /**
     * @description Stores whether the bot is currently shutting down.
     * @private
     * @type {string}
     * @constant
     * @default
     */
    this._statusFile = './save/raging.json';

    /**
     * @description List of userIds where the bot will not leave if the person
     * is in the server.
     * @private
     * @type {string[]}
     * @constant
     * @default
     */
    this._friends = [
      '124733888177111041',
      '126464376059330562',
      '165315069717118979',
      '479294447184773130',
    ];

    /**
     * @description Guild IDs of which to not leave.
     * @private
     * @type {object.<boolean>}
     * @default
     */
    this._guildWhitelist = {
      '420045052690169856': true,
      '650626200020058124': true,
    };

    /**
     * @description Is the bot currently shutting itself down.
     * @private
     * @type {boolean}
     * @default
     */
    this._shuttingDown = false;

    /**
     * @description Do everything except actually leave.
     * @private
     * @type {boolean}
     * @default
     */
    this._dryRun = true;

    this.save = this.save.bind(this);
    this._commandRage = this._commandRage.bind(this);
    this._commandAbortRage = this._commandAbortRage.bind(this);
    this._beginShutdown = this._beginShutdown.bind(this);
    this._step = this._step.bind(this);
    this._abortRaging = this._abortRaging.bind(this);
  }
  /** @inheritdoc */
  initialize() {
    this.command.on(
        new this.command.SingleCommand(['rage'], this._commandRage, {
          defaultDisabled: true,
          permissions: this.Discord.PermissionsBitField.Flags.Administrator,
        }));
    this.command.on(
        new this.command.SingleCommand(['abortrage'], this._commandAbortRage, {
          defaultDisabled: true,
          permissions: this.Discord.PermissionsBitField.Flags.Administrator,
        }));

    this.common.readAndParse(this._statusFile, (err, data) => {
      if (err) return;
      this._beginShutdown(data.dryRun);
    });

    this.client.abortRaging = this._abortRaging;
    this.client.beginRage = this._beginShutdown;
  }
  /** @inheritdoc */
  shutdown() {
    this.command.removeListener('rage');
    this.command.removeListener('abortrage');
    this.client.abortRaging = null;
    this.client.beginRage = null;
  }

  /**
   * Rage, rage against the dying of the light!
   *
   * @private
   * @this {Shutdown}
   * @type {commandHandler}
   * @param {Discord~Message} msg Message that triggered command.
   * @listens Command#rage
   */
  _commandRage(msg) {
    this.common.reply(
        msg,
        'Do not go gentle into that good night,\n' +
            'Old age should burn and rave at close of day;\n' +
            'Rage, rage against the dying of the light.\n\n' +
            'Though wise men at their end know dark is right,\n' +
            'Because their words had forked no lightning they\n' +
            'Do not go gentle into that good night.\n\n' +
            'Good men, the last wave by, crying how bright\n' +
            'Their frail deeds might have danced in a green bay,\n' +
            'Rage, rage against the dying of the light.\n\n' +
            'Wild men who caught and sang the sun in flight,\n' +
            'And learn, too late, they grieved it on its way,\n' +
            'Do not go gentle into that good night.\n\n' +
            'Grave men, near death, who see with blinding sight\n' +
            'Blind eyes could blaze like meteors and be gay,\n' +
            'Rage, rage against the dying of the light.\n\n' +
            'And you, my father, there on the sad height,\n' +
            'Curse, bless, me now with your fierce tears, I pray.\n' +
            'Do not go gentle into that good night.\n\n' +
            'Rage, rage against the dying of the light.\n\n' +
            '**- Dylan Thomas**');
    if (msg.author.id !== this.common.spikeyId) return;

    const dryRun = msg.text != ' rage';
    // this._beginShutdown(dryRun);
    this.common.mkAndWrite(this._statusFile, null, {dryRun: dryRun}, (err) => {
      if (err) this.error(err);
      this.client.shard.broadcastEval(`this.beginRage(${dryRun})`)
          .catch((err) => {
            this.error(err);
            this.common.reply('Failed');
          });
    });
  }

  /**
   * Abort the shutdown.
   *
   * @private
   * @this {Shutdown}
   * @type {commandHandler}
   * @param {Discord~Message} msg Message that triggered command.
   * @listens Command#abortrage
   */
  _commandAbortRage(msg) {
    if (msg.author.id !== this.common.spikeyId) return;
    this.common.unlink(this._statusFile, (err) => {
      if (err) this.error(err);
      this.client.shard.broadcastEval('this.abortRaging()')
          .then(() => this.common.reply(msg, 'Aborted'))
          .catch((err) => {
            this.error(err);
            this.common.reply(msg, 'Failed to abort');
          });
    });
  }

  /**
   * @description Abort shutdown procedures.
   * @private
   */
  _abortRaging() {
    this._shuttingDown = false;
    this.warn('Aborted Rage');
  }

  /**
   * @description Starts the process of shutting down the bot.
   * @private
   *
   * @param {boolean} [dryRun=true] Do everything except actually leave.
   */
  _beginShutdown(dryRun = true) {
    this._dryRun = dryRun;
    this._shuttingDown = true;
    this._step();
  }

  /**
   * @description Recursively leave one guild at a time.
   * @private
   */
  _step() {
    if (!this._shuttingDown) return;

    let guild = null;
    const list = [...this.client.guilds.cache.keys()];
    let i = -1;
    while (!guild && i < list.length - 1) {
      i++;
      if (this._guildWhitelist[list[i]]) continue;
      guild = this.client.guilds.cache.get(list[i]);
    }
    if (!guild) {
      this.log('Left all guilds.');
      return;
    }

    guild.members.fetch({user: this._friends}).then((el) => {
      if (el.size > 0) {
        this._guildWhitelist[guild.id] = true;
        this._step();
      } else {
        if (this._dryRun) {
          console.log(guild.id);
          this._guildWhitelist[guild.id] = true;
          setTimeout(this._step, 100);
        } else {
          guild.leave().then(() => this._step()).catch(() => {
            this.error(`Failed to leave guild: ${guild.id}`);
            setTimeout(this._step, 5000);
          });
        }
      }
    }).catch((err) => {
      this.error(`Failed to fetch friends: ${guild.id}`);
      console.error(err);
      setTimeout(this._step, 5000);
    });
  }
}

module.exports = new Shutdown();
