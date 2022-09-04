// Copyright 2019-2020 Campbell Crowley. All rights reserved.
// Author: Campbell Crowley (dev@campbellcrowley.com)
const fs = require('fs');
const SubModule = require('./subModule.js');
const diff = require('diff');

/**
 * @description Handle all moderator related commands and control.
 * @augments SubModule
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
     * @description All guilds that have changed their settings since last save.
     * @private
     * @type {object.<boolean>}
     */
    this._settingsUpdated = {};
    /**
     * All guilds that have disabled the auto-smite feature.
     * Not actually used at this time.
     *
     * @private
     * @type {object.<boolean>}
     */
    this._disabledAutoSmite = {};
    /**
     * All guilds that have disabled sending messages when someone is banned.
     * Not actually used at this time.
     *
     * @private
     * @type {object.<boolean>}
     */
    this._disabledBanMessage = {};
    /**
     * The guilds with auto-smite enabled, and members who have mentioned
     * "@everyone", and the timestamps of these mentions.
     * Not actually used at this time.
     *
     * @private
     * @type {object.<object.<string>>}
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
    this._saveDir = `${this.common.guildSaveDir}/smited/`;

    this.save = this.save.bind(this);
    this.muteMember = this.muteMember.bind(this);
    this._onMessageDelete = this._onMessageDelete.bind(this);
    this._onMessageUpdate = this._onMessageUpdate.bind(this);
    this._onMessageDeleteBulk = this._onMessageDeleteBulk.bind(this);
    this._onGuildMemberRemove = this._onGuildMemberRemove.bind(this);
    this._onGuildMemberAdd = this._onGuildMemberAdd.bind(this);

    this._commandSmite = this._commandSmite.bind(this);
    this._commandKick = this._commandKick.bind(this);
  }
  /** @inheritdoc */
  initialize() {
    /**
     * PermissionsBitField for the new Smited role. Bitfield.
     *
     * @private
     * @type {number}
     * @constant
     */
    this._smitePerms = this.Discord.PermissionsBitField.Flags.Connect |
        this.Discord.PermissionsBitField.Flags.ViewChannel;

    /* const adminOnlyOpts = new this.command.CommandSetting({
      validOnlyInGuild: true,
      defaultDisabled: true,
      permissions: this.Discord.PermissionsBitField.Flags.ManageRoles |
          this.Discord.PermissionsBitField.Flags.ManageGuild |
          this.Discord.PermissionsBitField.Flags.BanMembers,
    });

    this.command.on(
        new this.command.SingleCommand(['purge', 'prune'], commandPurge, {
          validOnlyInGuild: true,
          defaultDisabled: true,
          permissions: this.Discord.PermissionsBitField.Flags.ManageMessages,
        }));
    this.command.on(
        new this.command.SingleCommand(['ban', 'fuckyou'], commandBan, {
          validOnlyInGuild: true,
          defaultDisabled: true,
          permissions: this.Discord.PermissionsBitField.Flags.BanMembers,
        }));
    this.command.on(
        new this.command.SingleCommand(
            'togglemute', commandToggleMute, adminOnlyOpts));
    this.command.on(
        new this.command.SingleCommand(
            'togglebanmessages', commandToggleBanMessages, adminOnlyOpts)); */
    this.command.on(
        new this.command.SingleCommand(['smite'], this._commandSmite, {
          validOnlyInGuild: true,
          defaultDisabled: true,
          permissions: this.Discord.PermissionsBitField.Flags.ManageRoles,
        }));
    this.command.on(
        new this.command.SingleCommand(['kick'], this._commandKick, {
          validOnlyInGuild: true,
          defaultDisabled: true,
          permissions: this.Discord.PermissionsBitField.Flags.KickMembers,
        }));

    this.client.guilds.cache.forEach((g) => {
      const modFilename = `${this.common.guildSaveDir}${g.id}/moderation.json`;
      if (!fs.existsSync(modFilename)) {
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
        this.common.readAndParse(modFilename, (err, parsed) => {
          if (err) return;
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
    this.client.on('messageUpdate', this._onMessageUpdate);
    this.client.on('messageDeleteBulk', this._onMessageDeleteBulk);
    this.client.on('guildMemberRemove', this._onGuildMemberRemove);
    this.client.on('guildMemberAdd', this._onGuildMemberAdd);
  }
  /** @inheritdoc */
  shutdown() {
    /* this.command.removeListener('purge');
    this.command.removeListener('fuckyou');
    this.command.removeListener('togglemute');
    this.command.removeListener('togglebanmessages'); */
    this.command.removeListener('smite');
    this.command.removeListener('kick');
    this.client.removeListener('messageDelete', this._onMessageDelete);
    this.client.removeListener('messageUpdate', this._onMessageUpdate);
    this.client.removeListener('messageDeleteBulk', this._onMessageDeleteBulk);
    this.client.removeListener('guildMemberRemove', this._onGuildMemberRemove);
    this.client.removeListener('guildMemberAdd', this._onGuildMemberAdd);
  }
  /** @inheritdoc */
  save(opt) {
    if (!this.initialized) return;

    this.client.guilds.cache.forEach((obj) => {
      if (!this._settingsUpdated[obj.id]) return;
      delete this._settingsUpdated[obj.id];
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
   * @param {Discord~Message} msg The deleted message.
   */
  _onMessageDelete(msg) {
    if (!msg.guild) return;
    if (msg.channel.id === this.common.testChannel) return;
    const modLog = this.bot.getSubmodule('./modLog.js');
    if (!modLog) return;
    const tag = msg.author.tag;
    const id = msg.author.id;
    const mId = msg.id;
    const channel = msg.channel.name;
    if ((id == this.client.user.id || id == '318552464356016131') &&
        msg.content === '`Autoplaying...`') {
      return;
    }
    const files = msg.attachments.map((el) => el.url);
    const havePerm = msg.guild.members.me.permissions.has(
        this.Discord.PermissionsBitField.Flags.ViewAuditLog);
    if (!havePerm) {
      this._finalMessageDeleteSend(
          msg.guild, msg.author.bot, tag, id, mId, channel, files, msg.content,
          null);
    } else {
      msg.guild.fetchAuditLogs({limit: 1})
          .then((logs) => {
            this._finalMessageDeleteSend(
                msg.guild, msg.author.bot, tag, id, mId, channel, files,
                msg.content, logs);
          })
          .catch((err) => {
            this._finalMessageDeleteSend(
                msg.guild, msg.author.bot, tag, id, mId, channel, files,
                msg.content, null);
            this.error('Failed to find executor of deleted message.');
            console.log(err);
          });
    }
  }

  /**
   * @description Sends message delete to ModLog.
   * @private
   * @param {Discord~Guild} guild Guild context.
   * @param {boolean} bot Is the message sent by a bot.
   * @param {string} tag User tag of deleted message.
   * @param {string} id User ID of deleted message.
   * @param {string} mId Message ID of deleted message.
   * @param {string} channel Name of channel of deleted message.
   * @param {string[]} files Array of URLs to deleted files.
   * @param {string} content Message content of deleted message.
   * @param {?Discord~GuildAuditLogs} logs Audit logs for more info.
   */
  _finalMessageDeleteSend(
      guild, bot, tag, id, mId, channel, files, content, logs) {
    const modLog = this.bot.getSubmodule('./modLog.js');
    if (!modLog) return;
    const entry = logs && logs.entries && logs.entries.first();
    const executor = entry &&
        entry.action == this.Discord.AuditLogEvent.MessageDelete &&
        entry.target.id == id && entry.executor;
    // It's possible that if a moderator deletes a user's message, then the user
    // delete's their own message, this will show that the moderator deleted it,
    // even though they did not.
    const deletedBy = executor && executor.tag;
    if (deletedBy) {
      modLog.output(
          guild, bot ? 'messageBotDelete' : 'messageDelete', null, null,
          `${tag}'s (${id}) in #${channel}`,
          files.length > 0 ?
              `${content.substr(0, 100)}\n\nFiles: ${files.join(' ')}` :
              content.substr(0, 1000),
          'Possibly deleted by', deletedBy);
    } else {
      modLog.output(
          guild, bot ? 'messageBotDelete' : 'messageDelete', null, null,
          `${tag}'s (${id}) in #${channel}`,
          files.length > 0 ?
              `${content.substr(0, 100)}\n\nFiles: ${files.join(' ')}` :
              content.substr(0, 1000));
    }
  }
  /**
   * @description Handle logging when a message is edited.
   * @private
   * @param {Discord~Message} prev The previous message.
   * @param {Discord~Message} msg The new message.
   */
  _onMessageUpdate(prev, msg) {
    if (!msg.guild) return;
    if (msg.channel.id === this.common.testChannel) return;
    if (msg.author.id === this.client.user.id) return;
    const modLog = this.bot.getSubmodule('./modLog.js');
    if (!modLog) return;
    const tag = msg.author.tag;
    const id = msg.author.id;
    const channel = msg.channel.name;

    const diffs = diff.diffWords(prev.content, msg.content);
    let out = '';
    let diffOk = false;

    if (diffs.length > 0) {
      let last = null;
      for (let i = 0; i < diffs.length; i++) {
        const d = diffs[i];
        if (!d.added && !d.removed) {
          if (last) out += ']';
          if (d.count > 23) {
            if (last) out += '\n';
            if (last) {
              out += d.value.substr(0, 10).replace(/\n/g, '\\n') + '...';
              if (i != diffs.length - 1) {
                out += d.value.substr(-10).replace(/\n/g, ' ');
              }
            } else {
              out += d.value.substr(-23).replace(/\n/g, ' ');
            }
          } else if (d.value != ' ') {
            if (last) out += '\n';
            out += d.value.replace(/\n/g, '\\n');
          }
          last = null;
        } else if (d.added) {
          diffOk = true;
          if (last && last != 'add') {
            out += ']\n+[';
          } else if (!last) {
            out += '\n+[';
          }
          out += `${d.value.replace(/\n/g, '\\n')}`;
          last = 'add';
        } else if (d.removed) {
          diffOk = true;
          if (last && last != 'remove') {
            out += ']\n-[';
          } else if (!last) {
            out += '\n-[';
          }
          out += `${d.value.replace(/\n/g, '\\n')}`;
          last = true;
        }
      }
      if (last) out += ']';
    }
    if (!out || out.trim().length == 0) {
      out = '*[Embeds Updated]';
    }
    if (!diffOk) return;

    const preview = prev.content.length > 103 ?
        (prev.content.substr(0, 100) + '...') :
        prev.content;
    if (msg.author.bot) {
      modLog.output(
          msg.guild, 'messageBotUpdate', null, null,
          `${tag}'s (${id}) in #${channel} (ID: ${msg.id})`, preview, 'Diff',
          '```diff\n' + out + '```');
    } else {
      modLog.output(
          msg.guild, 'messageUpdate', null, null,
          `${tag}'s (${id}) in #${channel} (ID: ${msg.id})`, preview, 'Diff',
          '```diff\n' + out + '```');
    }
  }
  /**
   * @description Handle logging when multiple messages are deleted.
   * @private
   * @param {Discord~Collection<Discord~Message>} msgs The
   * deleted messages.
   */
  _onMessageDeleteBulk(msgs) {
    const modLog = this.bot.getSubmodule('./modLog.js');
    if (!modLog) return;
    if (!modLog.getSettings(msgs.first().guild.id).check('messagePurge')) {
      return;
    }
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
    const guild = msgs.first().guild;
    const havePerm = guild.members.me.permissions.has(
        this.Discord.PermissionsBitField.Flags.ViewAuditLog);
    if (!havePerm) {
      modLog.output(
          guild, 'messagePurge', null, null,
          `${msgs.size} messages deleted from ${channels}.`);
    } else {
      guild.fetchAuditLogs({limit: 1})
          .then((logs) => {
            const entry = logs && logs.entries && logs.entries.first();
            const deletedBy = entry &&
                entry.action == this.Discord.AuditLogEvent.MessageBulkDelete &&
                entry.executor && entry.executor.tag;
            modLog.output(
                guild, 'messagePurge', null, null,
                `${msgs.size} messages deleted from ${channels}.`, null,
                deletedBy && 'Purged by', deletedBy);
          })
          .catch((err) => {
            modLog.output(
                guild, 'messagePurge', null, null,
                `${msgs.size} messages deleted from ${channels}.`);
            this.error('Failed to find executor of purged message.');
            console.log(err);
          });
    }
  }
  /**
   * @description Handle a guild member leaving the guild.
   * @private
   * @param {Discord~GuildMember} member The member that left or was
   * kicked.
   */
  _onGuildMemberRemove(member) {
    const modLog = this.bot.getSubmodule('./modLog.js');
    if (!modLog) return;
    const additional = member.joinedTimestamp &&
        this._formatDelay(Date.now() - member.joinedTimestamp);
    if (additional) {
      modLog.output(
          member.guild, 'memberLeave', member.user, null, 'Time on server',
          additional);
    } else {
      modLog.output(member.guild, 'memberLeave', member.user);
    }
  }
  /**
   * @description Handle someone joining the guild.
   * @private
   * @param {Discord~GuildMember} member The member that joined.
   */
  _onGuildMemberAdd(member) {
    const modLog = this.bot.getSubmodule('./modLog.js');
    if (!modLog) return;
    if (!modLog.getSettings(member.guild.id).check('memberJoin')) return;
    let num = -1;
    const age = member.user.createdTimestamp &&
        this._formatDelay(Date.now() - member.user.createdTimestamp);
    if (this.client.shard) {
      const toEval = eval(
          `((client) => client.guilds.cache.filter((g) => g.members.resolve('${
            member.id}')).size)`);
      this.client.shard.broadcastEval(toEval)
          .then((res) => {
            res.forEach((el) => num += el);
            const additional = num > 0 ?
                `${num} other mutual server${num > 1 ? 's' : ''}.` :
                null;
            modLog.output(
                member.guild, 'memberJoin', member.user, null, additional, null,
                'Account Age', age);
          })
          .catch((err) => {
            this.error(
                'Failed to get mutual guild count: ' + member.guild.id + '@' +
                member.user.id);
            console.error(err);
            modLog.output(
                member.guild, 'memberJoin', member.user, null, 'Account Age',
                age);
          });
    } else {
      this.client.guilds.cache.forEach((g) => {
        if (g.members.resolve(member.id)) num++;
      });
      const additional =
          num > 0 ? `${num} other mutual server${num > 1 ? 's' : ''}.` : null;
      modLog.output(
          member.guild, 'memberJoin', member.user, null, additional, null,
          'Account Age', age);
    }
  }

  /**
   * @description Give a guild member a muted role that prevents them from
   * talking in any channel in the guild.
   * @public
   * @param {Discord~GuildMember} member The member of the guild to
   * mute.
   * @param {Function} cb Callback function with a single argument which is a
   * string if there was an error, or null if success.
   */
  muteMember(member, cb) {
    let hasMuteRole = false;
    let muteRole;
    const toMute = member;
    member.guild.roles.cache.forEach((val) => {
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
        member.guild.channels.cache.forEach((channel) => {
          if (channel.permissionsLocked) return;
          const overwrites = channel.permissionOverwrites.resolve(role.id);
          if (overwrites) {
            if (channel.type == self.Discord.ChannelType.GuildCategory) {
              if (overwrites.deny.has(
                  self.Discord.PermissionsBitField.Flags.SendMessages) &&
                  overwrites.deny.has(
                      self.Discord.PermissionsBitField.Flags.Speak)) {
                return;
              }
            } else if (channel.type == self.Discord.ChannelType.GuildText) {
              if (overwrites.deny.has(
                  self.Discord.PermissionsBitField.Flags.SendMessages)) {
                return;
              }
            } else if (channel.type == self.Discord.ChannelType.GuildVoice) {
              if (overwrites.deny.has(
                  self.Discord.PermissionsBitField.Flags.Speak)) {
                return;
              }
            }
          }
          channel.permissionOverwrites
              .edit(role, {SendMessages: false, Speak: false})
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
              position: member.guild.members.me.roles.highest.position - 1,
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
   * Remove all roles from a user and give them a role that prevents them from
   * doing anything. Checks if all parties involved have permission to do this
   * without the bot's help.
   *
   * @private
   * @this {Moderation}
   * @type {commandHandler}
   * @param {Discord~Message} msg Message that triggered command.
   * @listens Command#smite
   */
  _commandSmite(msg) {
    if (msg.mentions.members.size === 0) {
      this.common.reply(
          msg, 'You must mention someone to smite after the command.');
    } else {
      const toSmite = msg.mentions.members.first();
      if (msg.guild.ownerId !== msg.author.id &&
          msg.member.roles.highest.comparePositionTo(toSmite.roles.highest) <=
              0) {
        this.common.reply(
            msg, 'You can\'t smite ' + toSmite.user.username +
                '! You are not stronger than them!',
            'Your role is not higher than theirs.');
      } else {
        msg.guild.members.fetch(this.client.user).then((me) => {
          const myRole = me.roles.highest;
          if (toSmite.roles.highest &&
              this.Discord.Role.comparePositions(
                  myRole, toSmite.roles.highest) <= 0) {
            this.common.reply(
                msg, 'I can\'t smite ' + toSmite.user.username +
                    '! I am not strong enough!',
                'I need permission to have a higher role.');
          } else {
            let hasSmiteRole = false;
            let smiteRole;
            msg.guild.roles.cache.forEach((val) => {
              if (val.name == 'Smited') {
                hasSmiteRole = true;
                smiteRole = val;
              }
              return val.id;
            });
            const idList =
                toSmite.roles.cache.filter((el) => el.name == 'Smited')
                    .map((el) => el.id);
            const filename = `${this._saveDir}${toSmite.id}.json`;
            this.common.mkAndWrite(filename, this._saveDir, idList, (err) => {
              if (err) {
                this.error(
                    'Failed to save user roles for unsmiting: ' + toSmite.id +
                    ': ' + JSON.stringify(idList));
                console.error(err);
              }
            });

            if (!hasSmiteRole) {
              msg.guild.roles
                  .create({
                    data: {
                      name: 'Smited',
                      position: 0,
                      hoist: true,
                      color: '#2f3136',
                      permissions: this._smitePerms,
                      mentionable: true,
                    },
                  })
                  .then((role) => this._smite(role, toSmite, msg))
                  .catch((err) => {
                    this.error('Failed to create Smited role: ' + msg.guild.id);
                    console.error(err);
                    this.common.reply(
                        msg, 'I couldn\'t smite ' + toSmite.user.username +
                            ' because there isn\'t a "Smited" role and I ' +
                            'couldn\'t make it!');
                  });
            } else {
              this._smite(smiteRole, toSmite, msg);
            }
          }
        });
      }
    }
  }

  /**
   * @description Perform the actual smiting of a member.
   *
   * @private
   * @param {Discord~Role} role The role to give to the member.
   * @param {Discord~GulidMember} member The member to smite.
   * @param {Discord~Message} msg The message that triggered the smiting.
   */
  _smite(role, member, msg) {
    const pFlags = this.Discord.PermissionsBitField.Flags;
    try {
      const list = JSON.stringify([...member.roles.cache.keys()]);
      const dir = `${this.common.guildSaveDir}${member.guild.id}/smited`;
      const file = `${dir}/${member.id}.json`;
      this.common.mkAndWrite(file, dir, list, (err) => {
        if (!err) return;
        this.error(`Failed to save old smited roles: ${file} ${list}`);
        console.error(err);
      });
      member.roles.set([role])
          .then(() => {
            this.common.reply(
                msg, 'The gods have struck ' + member.user.username +
                    ' with lightning!');
            const modLog = this.bot.getSubmodule('./modLog.js');
            if (modLog) {
              modLog.output(msg.guild, 'smite', member.user, msg.author);
            }
          })
          .catch(() => {
            member.roles.add(role)
                .then(() => {
                  this.common.reply(
                      msg,
                      'The gods have struck ' + member.user.username +
                          ' with lightning!',
                      'Although it appears to be a tad weak...');
                  const modLog = this.bot.getSubmodule('./modLog.js');
                  if (modLog) {
                    modLog.output(msg.guild, 'smite', member.user, msg.author);
                  }
                })
                .catch((err) => {
                  this.common.reply(
                      msg,
                      'Oops! I wasn\'t able to smite ' + member.user.username +
                          '! I wasn\'t able to give them the "Smited" ' +
                          'role!');
                  this.error(
                      'Failed to give smited role: ' + msg.guild.id + '@' +
                      member.id);
                  console.log(err);
                });
          });
      member.guild.channels.cache.forEach((channel) => {
        if (channel.permissionsLocked) return;
        const overwrites = channel.permissionOverwrites.resolve(role.id);
        if (overwrites) {
          if (channel.type == this.Discord.ChannelType.GuildCategory) {
            if (overwrites.deny.has(pFlags.Speak) &&
                overwrites.deny.has(pFlags.SendMessages)) {
              return;
            }
          } else if (channel.type == this.Discord.ChannelType.GuildVoice) {
            if (overwrites.deny.has(pFlags.Speak)) {
              return;
            }
          } else if (channel.type == this.Discord.ChannelType.GuildText) {
            if (overwrites.deny.has(pFlags.SendMessages)) {
              return;
            }
          }
        }
        channel.permissionOverwrites
            .edit(role, {SendMessages: false, Speak: false})
            .catch(console.error);
      });
      if (member.voice.channel) member.voice.setMute(true, 'Smited');
    } catch (err) {
      this.common.reply(
          msg, 'Oops! I wasn\'t able to smite ' + member.user.username +
              '! I\'m not sure why though!');
      this.error('Failed to smite for unknown reason');
      console.log(err);
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
      const u = msg.guild.members.resolve(el);
      if (u) {
        if (!banList.includes(u.id)) banList.push(u);
      } else {
        const r = msg.guild.roles.resolve(el);
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
        msg.text.replace(this.Discord.MessageMentions.UsersPattern, '')
            .replace(this.Discord.MessageMentions.RolesPattern, '')
            .replace(/\d{17,19}/g)
            .replace(/\s{2,}/g, ' ')
            .trim();
    if (reason == 'undefined') reason = null;
    banList.forEach((toBan) => {
      if (msg.guild.ownerId !== msg.author.id &&
          msg.member.roles.highest.comparePositionTo(toBan.roles.highest) <=
              0) {
        this.common
            .reply(
                msg, 'You can\'t kick ' + toBan.user.username +
                    '! You are not stronger than them!')
            .catch(() => {});
      } else {
        const me = msg.guild.members.me;
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
  /**
   * Format a duration in milliseconds into a human readable string.
   *
   * @private
   *
   * @param {number} msecs Duration in milliseconds.
   * @returns {string} Formatted string.
   */
  _formatDelay(msecs) {
    let output = '';
    let unit = 365 * 24 * 60 * 60 * 1000;
    if (msecs >= unit) {
      const num = Math.floor(msecs / unit);
      output += num + ' year' + (num == 1 ? '' : 's') + ', ';
      msecs -= num * unit;
    }
    /* unit /= 365 / 7;
    if (msecs >= unit) {
      const num = Math.floor(msecs / unit);
      output += num + ' week' + (num == 1 ? '' : 's') + ', ';
      msecs -= num * unit;
    }
    unit /= 7; */
    unit /= 365;
    if (msecs >= unit) {
      const num = Math.floor(msecs / unit);
      output += num + ' day' + (num == 1 ? '' : 's') + ', ';
      msecs -= num * unit;
    }
    unit /= 24;
    if (msecs >= unit) {
      const num = Math.floor(msecs / unit);
      output += num + ' hour' + (num == 1 ? '' : 's') + ', ';
      msecs -= num * unit;
    }
    unit /= 60;
    if (msecs >= unit) {
      const num = Math.floor(msecs / unit);
      output += num + ' minute' + (num == 1 ? '' : 's') + ', ';
      msecs -= num * unit;
    }
    unit /= 60;
    if (msecs >= unit) {
      const num = Math.round(msecs / unit);
      output += num + ' second' + (num == 1 ? '' : 's') + '';
    }
    return output.replace(/,\s$/, '');
  }
}

module.exports = new Moderation();
