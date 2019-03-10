// Copyright 2019 Campbell Crowley. All rights reserved.
// Author: Campbell Crowley (dev@campbellcrowley.com)

require('./subModule.js')(RoleColors);  // Extends the SubModule class.

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
        [
          'color',
        ],
        commandColor, new self.command.CommandSetting({
          validOnlyInGuild: true,
          defaultDisabled: true,
          permissions: self.Discord.Permissions.FLAGS.MANAGE_ROLES |
              self.Discord.Permissions.FLAGS.MANAGE_GUILD,
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
    if (!msg.guild.me.hasPermission('MANAGE_ROLES')) {
      self.common.reply(
          msg, 'Unfortunately, I do not have permission to manage roles.');
      return;
    }
    let target = msg.member;
    if (msg.member.hasPermission('MANAGE_ROLES') &&
        msg.mentions.members.size > 0) {
      target = msg.mentions.members.first();
      msg.text =
          msg.text.replace(self.Discord.MessageMentions.USERS_PATTERN, '');
    }
    let color = msg.text.trim();
    let colorString = color;
    const role = msg.guild.roles.find((el) => el.name == target.id);
    const colorList = [
      'DEFAULT',
      'WHITE',
      'AQUA',
      'GREEN',
      'BLUE',
      'PURPLE',
      'LUMINOUS_VIVID_PINK',
      'GOLD',
      'ORANGE',
      'RED',
      'GREY',
      'DARKER_GREY',
      'NAVY',
      'DARK_AQUA',
      'DARK_GREEN',
      'DARK_BLUE',
      'DARK_PURPLE',
      'DARK_VIVID_PINK',
      'DARK_GOLD',
      'DARK_ORANGE',
      'DARK_RED',
      'DARK_GREY',
      'LIGHT_GREY',
      'DARK_NAVY',
      'RANDOM',
    ];
    if (colorList.includes(color.toUpperCase())) {
      color = color.toUpperCase();
    } else {
      const rgbMatch =
          color.match(/(\d{1,3})\b\D+\b(\d{1,3})\b\D+\b(\d{1,3}\b)/);
      const hexMatch = color.match(/(#[A-Fa-f0-9]{6})/);
      if (rgbMatch) {
        color = [rgbMatch[1], rgbMatch[2], rgbMatch[3]];
        colorString = '';
        for (let i = 0; i < color.length; i++) {
          color[i] = Math.max(0, Math.min(255, color[i]));
        }
        colorString = color.join(', ');
      } else if (hexMatch) {
        color = hexMatch[1];
        colorString = color;
      } else {
        self.common.reply(
            msg, 'I\'m not sure what color that is, sorry.', color);
        return;
      }
    }
    if (!role) {
      const roleData = {name: target.id, color: color, permissions: 0};
      msg.guild.roles.create({data: roleData})
          .then((r) => {
            r.setColor(color);
            target.roles.add(r).then((m) => {
              self.common.reply(msg, 'Updated color.', colorString);
            });
          })
          .catch((err) => {
            self.error('Unable to create color role:' + msg.channel.id);
            console.error(err);
          });
    } else {
      role.setColor(color)
          .then((r) => {
            target.roles.add(r).then((m) => {
              self.common.reply(msg, 'Updated color.', colorString);
            });
          })
          .catch((err) => {
            self.error('Unable to edit color role:' + msg.channel.id);
            console.error(err);
          });
    }
  }
}

module.exports = new RoleColors();
