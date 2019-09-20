// Copyright 2019-2020 Campbell Crowley. All rights reserved.
// Author: Campbell Crowley (dev@campbellcrowley.com)

/**
 * @description Creates a {@link external:Discord~Message}-like object, for a
 * message that doesn't actually exist.
 * @class
 */
class MessageMaker {
  /**
   * Forms a Discord~Message similar object from given IDs.
   *
   * @param {SubModule} self SubModule instance to reference Discord objects.
   * @param {string} uId The id of the user who wrote this message.
   * @param {string} gId The id of the guild this message is in.
   * @param {?string} cId The id of the channel this message was 'sent' in.
   * @param {?string} msg The message content.
   */
  constructor(self, uId, gId, cId, msg) {
    const g = self.client && self.client.guilds.resolve(gId);
    const prefix = self.bot.getPrefix(gId);
    /**
     * @description Always true. Can be used to check if this message was
     * created by us.
     * @public
     * @type {boolean}
     * @default
     * @constant
     */
    this.fabricated = true;
    /**
     * @description Message author.
     * @public
     * @type {external:Discord~User}
     * @constant
     */
    this.author = self.client && self.client.users.resolve(uId);
    /**
     * @description Discord.JS Client.
     * @public
     * @type {external:Discord~Client}
     * @constant
     */
    this.client = self.client;
    /**
     * @description Message author Member.
     * @public
     * @type {?external:Discord~GuildMember}
     * @constant
     */
    this.member = g && g.members.resolve(uId);
    /**
     * @description Guild.
     * @public
     * @type {?external:Discord~Guild}
     * @constant
     */
    this.guild = g;
    /**
     * @description TextChannel or DMChannel.
     * @public
     * @type {external:Discord~TextChannel|external:Discord~DMChannel}
     * @constant
     */
    this.channel = (g && g.channels.resolve(cId)) ||
        (self.client && self.client.channels.resolve(uId));
    /**
     * @description Message content without command prefix.
     * @public
     * @type {string}
     * @constant
     */
    this.text = msg;
    /**
     * @description Message content with command prefix.
     * @public
     * @type {string}
     * @constant
     */
    this.content = `${prefix}${msg}`;
    /**
     * @description Command prefix.
     * @public
     * @type {string}
     * @constant
     */
    this.prefix = prefix;
    /**
     * @description Guild locale setting.
     * @public
     * @type {?string}
     */
    this.locale = self.bot.getLocale && self.bot.getLocale(gId);
    /**
     * @description Empty soft mention collections for compatibility.
     * @public
     * @type {{
     *   members: external:Discord~Collection,
     *   users: external:Discord~Collection,
     *   roles: external:Discord~Collection
     * }}
     * @constant
     */
    this.softMentions = {
      members: new self.Discord.Collection(),
      users: new self.Discord.Collection(),
      roles: new self.Discord.Collection(),
    },
    /**
     * @description Empty mention collections for compatibility.
     * @public
     * @type {{
     *   channels: external:Discord~Collection,
     *   members: external:Discord~Collection,
     *   roles: external:Discord~Collection,
     *   users: external:Discord~Collection
     * }}
     * @constant
     */
    this.mentions = {
      channels: new self.Discord.Collection(),
      members: new self.Discord.Collection(),
      roles: new self.Discord.Collection(),
      users: new self.Discord.Collection(),
    };
  }
}

module.exports = MessageMaker;
