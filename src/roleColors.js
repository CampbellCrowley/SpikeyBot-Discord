// Copyright 2019 Campbell Crowley. All rights reserved.
// Author: Campbell Crowley (dev@campbellcrowley.com)

require('./subModule.js').extend(RoleColors);  // Extends the SubModule class.

/**
 * @classdesc Allows users to change their name color by giving them a role with
 * a color.
 * @class
 * @augments SubModule
 * @listens Command#color
 */
function RoleColors() {
  const self = this;
  /** @inheritdoc */
  this.myName = 'Role Colors';
  /** @inheritdoc */
  this.initialize = function() {
    const cmdColor = new self.command.SingleCommand(
        ['color'], commandColor, new self.command.CommandSetting({
          validOnlyInGuild: true,
          defaultDisabled: true,
          permissions: self.Discord.PermissionsBitField.Flags.ManageRoles |
              self.Discord.PermissionsBitField.Flags.ManageGuild,
        }));
    self.command.on(cmdColor);
  };

  /** @inheritdoc */
  this.shutdown = function() {
    self.command.deleteEvent('color');
  };

  /**
   * Allow a user to set their name color. This isn't very smart, and doesn't
   * check for correct position in hierarchy, but will try not to create
   * multiple roles for one person.
   *
   * @private
   * @type {commandHandler}
   * @param {Discord~Message} msg Message that triggered command.
   * @listens Command#color
   */
  function commandColor(msg) {
    if (!msg.guild.members.me.permissions.has(
        self.Discord.PermissionsBitField.Flags.ManageRoles)) {
      self.common.reply(
          msg, 'Unfortunately, I do not have permission to manage roles.');
      return;
    }
    let target = msg.member;
    if (msg.member.permissions.has(
        self.Discord.PermissionsBitField.Flags.ManageRoles) &&
        msg.mentions.members.size > 0) {
      target = msg.mentions.members.first();
      msg.text =
          msg.text.replace(self.Discord.MessageMentions.UsersPattern, '');
    }
    let color = msg.text.trim();
    let colorString = color;
    let role =
        msg.guild.roles.cache.find((el) => el.name.indexOf(target.id) > -1);
    const colorList = [
      'Default',
      'White',
      'Aqua',
      'Green',
      'Blue',
      'Yellow',
      'Purple',
      'LuminousVividPink',
      'Fuchsia',
      'Gold',
      'Orange',
      'Red',
      'Grey',
      'Navy',
      'DarkAqua',
      'DarkGreen',
      'DarkBlue',
      'DarkPurple',
      'DarkVividPink',
      'DarkGold',
      'DarkOrange',
      'DarkRed',
      'DarkGrey',
      'DarkerGrey',
      'LightGrey',
      'DarkNavy',
      'Blurple',
      'Greyple',
      'DarkButNotBlack',
      'NotQuiteBlack',
      'Random',
    ];
    const found = colorList.find(
        (el) => el.toLowerCase() == color.toLowerCase().replace(/[_\s-]/g, ''));
    if (found) {
      color = found;
    } else {
      const rgbMatch =
          color.match(/(\d{1,3})\b\D+\b(\d{1,3})\b\D+\b(\d{1,3}\b)/);
      const hexMatch = color.match(/#?([A-Fa-f0-9]{6})/);
      if (rgbMatch) {
        color = [rgbMatch[1], rgbMatch[2], rgbMatch[3]];
        colorString = '';
        for (let i = 0; i < color.length; i++) {
          color[i] = Math.max(0, Math.min(255, color[i]));
        }
        colorString = color.join(', ');
      } else if (hexMatch) {
        color = hexMatch[1];
        colorString = `#${color}`;
      } else {
        self.common.reply(
            msg, 'I\'m not sure what color that is, sorry.', color);
        return;
      }
    }
    const finished = function() {
      const embed = new self.Discord.EmbedBuilder();
      embed.setColor(role.color);
      embed.setTitle('Updated color.');
      embed.setDescription(colorString);
      msg.channel.send({embeds: [embed]}).catch(() => {
        const padded = ('000000' + role.color.toString(16)).slice(-6);
        self.common.reply(msg, 'Updated color.', `#${padded}`);
      });
    };
    const fail = function(err) {
      self.error('Unable to create color role:' + msg.channel.id);
      console.error(err);
      self.common.reply(msg, 'Unable to update color.', err.message);
    };
    if (!role) {
      const roleData = {
        name: target.id,
        color: color,
        permissions: BigInt(0),
      };
      msg.guild.roles.create(roleData)
          .then((r) => {
            role = r;
            return r.setColor(color);
          })
          .then((r) => target.roles.add(r))
          .then(finished)
          .catch(fail);
    } else {
      role.setColor(color)
          .then((r) => target.roles.add(r))
          .then(finished)
          .catch(fail);
    }
  }
}

module.exports = new RoleColors();
