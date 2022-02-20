// Copyright 2019 Campbell Crowley. All rights reserved.
// Author: Campbell Crowley (dev@campbellcrowley.com)
const ChannelAction = require('./ChannelAction.js');
const Jimp = require('jimp');

/**
 * @description Sends the current event message.
 *
 * @memberof HungryGames~Action
 * @inner
 * @augments HungryGames~Action~ChannelAction
 */
class SendEventMessageAction extends ChannelAction {
  /**
   * @description Create an action that will send a message to the game channel
   * showing the event that occurred.
   */
  constructor() {
    super((hg, game, channel) => {
      const index = game.currentGame.day.state - 2;
      const events = game.currentGame.day.events;
      const evt = events[index];
      if (!evt) {
        hg._parent.error(
            'Attempted to print event beyond end of list. ' + index + '/' +
            events.length + ' (' + game.id + ')');
        game.clearIntervals();
        game.currentGame.isPaused = true;
      } else if (evt.battle && evt.state < evt.attacks.length) {
        const attk = evt.attacks[evt.state];
        const embed = new hg._parent.Discord.MessageEmbed();
        const message = attk.message.split('\n');
        embed.addField(message[1], message[2]);
        embed.setColor([50, 0, 0]);

        const avatarSizes = game.options.battleAvatarSizes;
        const battleIconSize = avatarSizes.avatar;
        if (battleIconSize === 0 || attk.icons.length === 0) {
          // Send without image.
          if (!game.options.disableOutput) {
            channel.send({content: message[0], embeds: [embed]})
                .catch((err) => {
                  hg._parent.error(
                      'Failed to send battle event message without image: ' +
                      channel.id);
                  console.error(err);
                });
          }
        } else {
          const iconGap = avatarSizes.gap;
          const underlineSize = avatarSizes.underline;

          // Create image, then send.
          const finalImage = new Jimp(
              attk.icons.length * (battleIconSize + iconGap) - iconGap,
              battleIconSize + underlineSize * 2);
          let responses = 0;
          const newImage = function(image, outcome, placement, barColor) {
            try {
              if (battleIconSize > 0) {
                if (image) image.resize(battleIconSize, battleIconSize);
                if (underlineSize > 0) {
                  if (typeof barColor === 'number') {
                    finalImage.blit(
                        new Jimp(battleIconSize, underlineSize, barColor),
                        placement * (battleIconSize + iconGap), 0);
                  }
                  if (outcome == 'dies') {
                    finalImage.blit(
                        new Jimp(battleIconSize, underlineSize, 0xFF0000FF),
                        placement * (battleIconSize + iconGap),
                        battleIconSize + underlineSize);
                  } else if (outcome == 'wounded') {
                    finalImage.blit(
                        new Jimp(battleIconSize, underlineSize, 0xFFFF00FF),
                        placement * (battleIconSize + iconGap),
                        battleIconSize + underlineSize);
                  }
                }
                if (image) {
                  finalImage.blit(
                      image, placement * (battleIconSize + iconGap),
                      underlineSize);
                }
              }
            } catch (err) {
              console.error(err);
            }
            responses++;
            if (responses == attk.icons.length) {
              finalImage.getBuffer(Jimp.MIME_PNG, function(err, out) {
                // Attach file, then send.
                if (!game.options.disableOutput) {
                  channel
                      .send({
                        content: message[0],
                        embeds: [embed],
                        files: [new hg._parent.Discord.MessageAttachment(
                            out, 'hgBattle.png')],
                      })
                      .catch((err) => {
                        hg._parent.error(
                            'Failed to send battle event message with image: ' +
                            channel.id);
                        console.error(err);
                      });
                }
              });
            }
          };
          let numNonUser = 0;
          for (let i = 0; i < attk.icons.length; i++) {
            let outcome = attk.victim.outcome;
            if (!attk.icons[i].id) {
              numNonUser++;
              outcome = 'nothing';
            } else if (i >= attk.victim.count + numNonUser) {
              outcome = attk.attacker.outcome;
            }
            hg._parent.readImage(attk.icons[i].url)
                .then(function(outcome, placement, settings) {
                  return function(image) {
                    newImage(
                        image, outcome, placement,
                        settings && settings['hg:bar_color']);
                  };
                }(outcome, i, attk.icons[i].settings))
                .catch((err) => {
                  hg._parent.error('Failed to read image');
                  console.log(err);
                  responses++;
                });
          }
        }
      } else {
        const avatarSizes = game.options.eventAvatarSizes;
        const iconSize = avatarSizes.avatar;
        if (iconSize == 0 || evt.icons.length === 0) {
          if (!game.options.disableOutput) {
            channel
                .send({
                  content: (evt.mentionString || '') + evt.message + '\n' +
                      (evt.subMessage || ''),
                })
                .catch((err) => {
                  hg._parent.error(
                      'Failed to send message without image: ' + channel.id);
                  console.error(err);
                });
          }
        } else {
          const iconGap = avatarSizes.gap;
          const underlineSize = avatarSizes.underline;
          const embed = new hg._parent.Discord.MessageEmbed();
          if (evt.subMessage) {
            embed.setDescription(`${evt.message}\n${evt.subMessage}`);
          } else {
            embed.setDescription(evt.message);
          }
          embed.setColor([125, 0, 0]);
          const finalImage = new Jimp(
              evt.icons.length * (iconSize + iconGap) - iconGap,
              iconSize + underlineSize * 2);
          let responses = 0;
          const newImage = function(image, outcome, placement, barColor) {
            try {
              if (iconSize > 0) {
                if (image) image.resize(iconSize, iconSize);
                if (underlineSize > 0) {
                  if (typeof barColor === 'number') {
                    finalImage.blit(
                        new Jimp(iconSize, underlineSize, barColor),
                        placement * (iconSize + iconGap), 0);
                  }
                  if (outcome == 'dies') {
                    finalImage.blit(
                        new Jimp(iconSize, underlineSize, 0xFF0000FF),
                        placement * (iconSize + iconGap),
                        iconSize + underlineSize);
                  } else if (outcome == 'wounded') {
                    finalImage.blit(
                        new Jimp(iconSize, underlineSize, 0xFFFF00FF),
                        placement * (iconSize + iconGap),
                        iconSize + underlineSize);
                  } else if (outcome == 'thrives') {
                    finalImage.blit(
                        new Jimp(iconSize, underlineSize, 0x00FF00FF),
                        placement * (iconSize + iconGap),
                        iconSize + underlineSize);
                  } else if (outcome == 'revived') {
                    finalImage.blit(
                        new Jimp(iconSize, underlineSize, 0x00FFFFFF),
                        placement * (iconSize + iconGap),
                        iconSize + underlineSize);
                  }
                }
                if (image) {
                  finalImage.blit(
                      image, placement * (iconSize + iconGap), underlineSize);
                }
              }
            } catch (err) {
              console.error(err);
            }
            responses++;
            if (responses == evt.icons.length) {
              finalImage.getBuffer(Jimp.MIME_PNG, (err, out) => {
                if (!game.options.disableOutput) {
                  channel
                      .send({
                        content: evt.mentionString || '\u200B',
                        embeds: [embed],
                        files: [new hg._parent.Discord.MessageAttachment(
                            out, 'hgEvent.png')],
                      })
                      .catch((err) => {
                        hg._parent.error(
                            'Failed to send message with image: ' + channel.id);
                        console.error(err);
                      });
                }
              });
            }
          };
          let numNonUser = 0;
          for (let i = 0; i < evt.icons.length; i++) {
            let outcome = evt.victim.outcome;
            if (!evt.icons[i].id) {
              numNonUser++;
              outcome = 'nothing';
            } else if (i >= evt.victim.count + numNonUser) {
              outcome = evt.attacker.outcome;
            }
            hg._parent.readImage(evt.icons[i].url)
                .then(function(outcome, placement, settings) {
                  return function(image) {
                    newImage(
                        image, outcome, placement,
                        settings && settings['hg:bar_color']);
                  };
                }(outcome, evt.icons.length - i - 1, evt.icons[i].settings))
                .catch(function(err) {
                  hg._parent.error('Failed to read image');
                  console.log(err);
                  responses++;
                });
          }
        }
      }
    });
  }
  /**
   * @description Create action from save data.
   * @public
   * @static
   * @override
   * @returns {HungryGames~SendEventMessageAction} The created action.
   */
  static create() {
    return new SendEventMessageAction();
  }
}

module.exports = SendEventMessageAction;
