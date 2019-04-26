// Copyright 2019 Campbell Crowley. All rights reserved.
// Author: Campbell Crowley (dev@campbellcrowley.com)
const fs = require('fs');
const SubModule = require('./subModule.js');

/**
 * @description Handle all moderator related commands and control.
 * @extends SubModule
 */
class Moderation extends SubModule {
  /**
   * Instantiate Moderation SubModule.
   */
  constructor() {
    super();
    /** @inheritdoc */
    this.myName = 'Moderation';
    /**
     * All guilds that have disabled the auto-smite feature.
     *
     * @private
     * @type {Object.<boolean>}
     */
    this._disabledAutoSmite = {};

    /**
     * All guilds that have disabled sending messages when someone is banned.
     *
     * @private
     * @type {Object.<boolean>}
     */
    this._disabledBanMessage = {};
    /**
     * The guilds with auto-smite enabled, and members who have mentioned
     * @everyone, and the timestamps of these mentions.
     *
     * @private
     * @type {Object.<Object.<string>>}
     */
    this._mentionAccumulator = {};
    /**
     * All of the possible messages to show when using the ban command.
     *
     * @private
     * @type {string[]}
     * @constant
     */
    this._banMsgs = [
      'It was really nice meeting you!',
      'You\'re a really great person, I\'m sorry I had to do this.',
      'See you soon!',
      'And they were never heard from again...',
      'Poof! Gone like magic!',
      'Does it seem quiet in here? Or is it just me?',
      'And like the trash, they\'re were taken out!',
      'Looks like they made like a tree, and leaf-ed. (sorry)',
      'Oof! Looks like my boot to their behind left a mark!',
      'Between you and me, I didn\'t like them anyways.',
      'Everyone rejoice! The world has been eradicated of one more person ' +
          'that no one liked anyways.',
      'The ban hammer has spoken!',
    ];

    this.save = this.save.bind(this);
  }
  /** @inheritdoc */
  initialize() {
    /**
     * Permissions required to to use the smite command. Bitfield.
     * @private
     * @type {number}
     * @constant
     */
    this._smitePerms = this.Discord.Permissions.FLAGS.CONNECT |
        this.Discord.Permissions.FLAGS.VIEW_CHANNEL;

    /* const adminOnlyOpts = new this.command.CommandSetting({
      validOnlyInGuild: true,
      defaultDisabled: true,
      permissions: this.Discord.Permissions.FLAGS.MANAGE_ROLES |
          this.Discord.Permissions.FLAGS.MANAGE_GUILD |
          this.Discord.Permissions.FLAGS.BAN_MEMBERS,
    });

    this.command.on(
        new this.command.SingleCommand(['purge', 'prune'], commandPurge, {
          validOnlyInGuild: true,
          defaultDisabled: true,
          permissions: this.Discord.Permissions.FLAGS.MANAGE_MESSAGES,
        }));
    this.command.on(
        new this.command.SingleCommand(['ban', 'fuckyou'], commandBan, {
          validOnlyInGuild: true,
          defaultDisabled: true,
          permissions: this.Discord.Permissions.FLAGS.BAN_MEMBERS,
        }));
    this.command.on(new this.command.SingleCommand(['smite'], commandSmite, {
      validOnlyInGuild: true,
      defaultDisabled: true,
      permissions: this.Discord.Permissions.FLAGS.MANAGE_ROLES,
    }));
    this.command.on(
        new this.command.SingleCommand(
            'togglemute', commandToggleMute, adminOnlyOpts));
    this.command.on(
        new this.command.SingleCommand(
            'togglebanmessages', commandToggleBanMessages, adminOnlyOpts)); */

    this.client.guilds.forEach((g) => {
      if (!fs.existsSync(
          `${this.common.guildSaveDir}${g.id}/moderation.json`)) {
        // This is here to upgrade to new file-system. After first load
        // main-config.json does not need to be read anymore.
        fs.readFile(
            `${this.common.guildSaveDir}${g.id}/main-config.json`,
            (err, file) => {
              if (err) return;
              let parsed;
              try {
                parsed = JSON.parse(file);
              } catch (e) {
                return;
              }
              if (typeof parsed.disabledAutoSmite === 'boolean') {
                this._disabledAutoSmite[g.id] = parsed.disabledAutoSmite;
              }
              if (typeof parsed.disabledBanMessage === 'boolean') {
                this._disabledBanMessage[g.id] = parsed.disabledBanMessage;
              }
            });
      } else {
        fs.readFile(
            `${this.common.guildSaveDir}${g.id}/moderation.json`,
            (err, file) => {
              if (err) return;
              let parsed;
              try {
                parsed = JSON.parse(file);
              } catch (e) {
                return;
              }
              if (typeof parsed.disabledAutoSmite === 'boolean') {
                this._disabledAutoSmite[g.id] = parsed.disabledAutoSmite;
              }
              if (typeof parsed.disabledBanMessage === 'boolean') {
                this._disabledBanMessage[g.id] = parsed.disabledBanMessage;
              }
            });
      }
    });
  }
  /** @inheritdoc */
  shutdown() {
    /* this.command.removeListener('purge');
    this.command.removeListener('fuckyou');
    this.command.removeListener('smite');
    this.command.removeListener('togglemute');
    this.command.removeListener('togglebanmessages'); */
  }
  /** @inheritdoc */
  save(opt) {
    if (!this.initialized) return;

    this.client.guilds.forEach((obj) => {
      const dir = `${this.common.guildSaveDir}${obj.id}/`;
      const filename = `${dir}moderation.json`;
      const data = {
        disabledBanMessage: this._disabledBanMessage[obj.id],
        disabledAutoSmite: this._disabledAutoSmite[obj.id],
      };
      if (opt == 'async') {
        this.common.mkAndWrite(filename, dir, JSON.stringify(data));
      } else {
        this.common.mkAndWriteSync(filename, dir, JSON.stringify(data));
      }
    });
  }
}

module.exports = new Moderation();
