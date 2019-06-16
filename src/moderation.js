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
    this.muteMember = this.muteMember.bind(this);
    this._onMessageDelete = this._onMessageDelete.bind(this);
    this._onMessageDeleteBulk = this._onMessageDeleteBulk.bind(this);
    this._onGuildMemberRemove = this._onGuildMemberRemove.bind(this);
    this._onGuildMemberAdd = this._onGuildMemberAdd.bind(this);
    this._commandKick = this._commandKick.bind(this);
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
    this.command.on(
        new this.command.SingleCommand(['kick'], this._commandKick, {
          validOnlyInGuild: true,
          defaultDisabled: true,
          permissions: this.Discord.Permissions.FLAGS.KICK_MEMBERS,
        }));

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
    this.client.on('messageDelete', this._onMessageDelete);
    this.client.on('messageDeleteBulk', this._onMessageDeleteBulk);
    this.client.on('guildMemberRemove', this._onGuildMemberRemove);
    this.client.on('guildMemberAdd', this._onGuildMemberAdd);
  }
  /** @inheritdoc */
  shutdown() {
    /* this.command.removeListener('purge');
    this.command.removeListener('fuckyou');
    this.command.removeListener('smite');
    this.command.removeListener('togglemute');
    this.command.removeListener('togglebanmessages'); */
    this.command.removeListener('kick');
    this.client.removeListener('messageDelete', this._onMessageDelete);
    this.client.removeListener('messageDeleteBulk', this._onMessageDeleteBulk);
    this.client.removeListener('guildMemberRemove', this._onGuildMemberRemove);
    this.client.removeListener('guildMemberAdd', this._onGuildMemberAdd);
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

  /**
   * @description Handle logging when a message is deleted.
   * @private
   * @param {external:Discord~Message} msg The deleted message.
   */
  _onMessageDelete(msg) {
    if (!msg.guild) return;
    const modLog = this.bot.getSubmodule('./modLog.js');
    if (!modLog) return;
    const tag = msg.author.tag;
    const id = msg.author.id;
    const channel = msg.channel.name;
    if (id == this.client.user.id && msg.content === '`Autoplaying...`') return;
    modLog.output(
        msg.guild, 'messageDelete', null, null,
        `${tag}'s (${id}) message in #${channel}`, msg.content);
  }
  /**
   * @description Handle logging when multiple messages are deleted.
   * @private
   * @param {external:Discord~Collection<external:Discord~Message>} msgs The
   * deleted messages.
   */
  _onMessageDeleteBulk(msgs) {
    const modLog = this.bot.getSubmodule('./modLog.js');
    if (!modLog) return;
    let channels = [];
    msgs.forEach((m) => {
      if (!channels.includes(`#${m.channel.name}`)) {
        channels.push(`#${m.channel.name}`);
      }
    });
    if (channels.length > 3) {
      channels = `${channels.length} channels`;
    } else {
      channels = channels.join(', ');
    }
    modLog.output(
        msgs.first().guild, 'messagePurge', null, null,
        `${msgs.size} messages deleted from ${channels}.`);
  }
  /**
   * @description Handle a guild member leaving the guild.
   * @private
   * @param {external:Discord~GuildMember} member The member that left or was
   * kicked.
   */
  _onGuildMemberRemove(member) {
    const modLog = this.bot.getSubmodule('./modLog.js');
    if (!modLog) return;
    modLog.output(member.guild, 'memberLeave', member.user);
  }
  /**
   * @description Handle someone joining the guild.
   * @private
   * @param {external:Discord~GuildMember} member The member that joined.
   */
  _onGuildMemberAdd(member) {
    const modLog = this.bot.getSubmodule('./modLog.js');
    if (!modLog) return;
    let num = -1;
    if (this.client.shard) {
      const toEval =
          `this.guilds.filter((g) => g.members.get('${member.id}')).size`;
      this.client.shard.broadcastEval(toEval).then((res) => {
        res.forEach((el) => num += el);
        const additional =
            num > 0 ? `${num} other mutual server${num > 1 ? 's' : ''}.` : null;
        modLog.output(
            member.guild, 'memberJoin', member.user, null, additional);
      });
    } else {
      this.client.guilds.forEach((g) => {
        if (g.members.get(member.id)) num++;
      });
      const additional =
          num > 0 ? `${num} other mutual server${num > 1 ? 's' : ''}.` : null;
      modLog.output(member.guild, 'memberJoin', member.user, null, additional);
    }
  }

  /**
   * @description Give a guild member a muted role that prevents them from
   * talking in any channel in the guild.
   * @public
   * @param {external:Discord~GuildMember} member The member of the guild to
   * mute.
   * @param {Function} cb Callback function with a single argument which is a
   * string if there was an error, or null if success.
   */
  muteMember(member, cb) {
    let hasMuteRole = false;
    let muteRole;
    const toMute = member;
    member.guild.roles.forEach(function(val, key) {
      if (val.name == 'Muted') {
        hasMuteRole = true;
        muteRole = val;
      }
    });
    const self = this;
    const mute = function(role, member) {
      try {
        member.roles.add(role)
            .then(() => {
              cb();
            })
            .catch((err) => {
              self.error(
                  'Failed to mute member: ' + member.guild.id + '@' +
                  member.id);
              console.error(err);
              cb('Failed to give role');
            });
        member.guild.channels.forEach((channel) => {
          if (channel.permissionsLocked) return;
          const overwrites = channel.permissionOverwrites.get(role.id);
          if (overwrites) {
            if (channel.type == 'category') {
              if (overwrites.deny.has(
                  self.Discord.Permissions.FLAGS.SEND_MESSAGES) &&
                  overwrites.deny.has(self.Discord.Permissions.FLAGS.SPEAK)) {
                return;
              }
            } else if (channel.type == 'text') {
              if (overwrites.deny.has(
                  self.Discord.Permissions.FLAGS.SEND_MESSAGES)) {
                return;
              }
            } else if (channel.type == 'voice') {
              if (overwrites.deny.has(self.Discord.Permissions.FLAGS.SPEAK)) {
                return;
              }
            }
          }
          channel.updateOverwrite(role, {SEND_MESSAGES: false, SPEAK: false})
              .catch(console.error);
        });
      } catch (err) {
        console.log(err);
        cb('Failed to manage role');
      }
    };
    if (!hasMuteRole) {
      member.guild.roles
          .create({
            data: {
              name: 'Muted',
              position: member.guild.me.roles.highest.position - 1,
              permissions: 0,
            },
          })
          .then((role) => {
            mute(role, toMute);
          })
          .catch((err) => {
            this.error(
                'Failed to create mute role in guild: ' + member.guild.id);
            console.error(err);
            cb('Failed to create role');
          });
    } else {
      mute(muteRole, toMute);
    }
  }

  /**
   * Kick a mentioed user (or role from ID) and send a message saying they were
   * banned.
   *
   * @private
   * @type {commandHandler}
   * @param {Discord~Message} msg Message that triggered command.
   * @listens Command#kick
   */
  _commandKick(msg) {
    const uIds = msg.text.match(/\d{17,19}/g);
    if (!uIds) {
      this.common.reply(
          msg, 'You must mention someone to kick or specify an ID of ' +
              'someone on the server.');
      return;
    }
    const banList = [];
    uIds.forEach((el) => {
      const u = msg.guild.members.get(el);
      if (u) {
        if (!banList.includes(u.id)) banList.push(u);
      } else {
        const r = msg.guild.roles.get(el);
        if (r) {
          r.members.forEach((m) => {
            if (!banList.includes(m.id)) banList.push(m);
          });
        }
      }
    });
    if (banList.length == 0) {
      this.common.reply(
          msg, 'You must mention someone to kick or specify an ID of ' +
              'someone on the server.');
      return;
    }
    let reason =
        msg.text.replace(this.Discord.MessageMentions.USERS_PATTERN, '')
            .replace(this.Discord.MessageMentions.ROLES_PATTERN, '')
            .replace(/\d{17,19}/g)
            .replace(/\s{2,}/g, ' ')
            .trim();
    if (reason == 'undefined') reason = null;
    banList.forEach((toBan) => {
      if (msg.guild.ownerID !== msg.author.id &&
          msg.member.roles.highest.comparePositionTo(toBan.roles.highest) <=
              0) {
        this.common
            .reply(
                msg, 'You can\'t kick ' + toBan.user.username +
                    '! You are not stronger than them!')
            .catch(() => {});
      } else {
        const me = msg.guild.me;
        const myRole = me.roles.highest;
        const highest = toBan.roles.highest;

        if (!myRole || (highest && myRole.comparePositionTo(highest) <= 0)) {
          this.common
              .reply(
                  msg, 'I can\'t kick ' + toBan.user.username +
                      '! I am not strong enough!')
              .catch(() => {});
        } else {
          // const banMsg = banMsgs[Math.floor(Math.random() * banMsgs.length)];
          const banMsg = 'Kicked';
          toBan.kick({reason: reason || banMsg})
              .then(() => {
                this.common.reply(msg, banMsg, 'Kicked ' + toBan.user.username)
                    .catch(() => {});
                const modLog = this.bot.getSubmodule('./modLog.js');
                if (modLog) {
                  modLog.output(
                      msg.guild, 'kick', toBan.user, msg.author,
                      reason || banMsg);
                }
              })
              .catch((err) => {
                this.common
                    .reply(
                        msg, 'Oops! I wasn\'t able to kick ' +
                            toBan.user.username + '! I\'m not sure why though!')
                    .catch(() => {});
                this.error('Failed to kick user.');
                console.error(err);
              });
        }
      }
    });
  }
}

module.exports = new Moderation();
