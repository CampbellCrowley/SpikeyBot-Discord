// Copyright 2019 Campbell Crowley. All rights reserved.
// Author: Campbell Crowley (dev@campbellcrowley.com)
const ChannelAction = require('./ChannelAction.js');
const Jimp = require('jimp');

/**
 * @description Sends message announcing the winner of the game.
 *
 * @memberof HungryGames~Action
 * @inner
 * @augments HungryGames~Action~ChannelAction
 */
class SendVictorAction extends ChannelAction {
  /**
   * @description Create an action that will send a message to the game channel
   * saying who won the game.
   */
  constructor() {
    super((hg, game, channel) => {
      const current = game.currentGame;
      const numAlive = current.numAlive;
      const lastAlive = current.includedUsers.find((el) => el.living);
      let numTeams = 0;
      let lastTeam = null;
      if (game.options.teamSize > 0) {
        current.teams.forEach((team) => {
          if (team.numAlive > 0) {
            numTeams++;
            lastTeam = team;
          }
        });
      }
      const collab = game.options.teammatesCollaborate == 'always';

      if (collab && numTeams == 1) {
        this._sendTeamVictor(hg, game, channel, lastTeam);
      } else if (numAlive == 1) {
        this._sendSoloVictor(hg, game, channel, lastAlive, lastTeam);
      } else if (numAlive < 1) {
        this._sendNoVictor(hg, game, channel);
      }
    });
  }
  /**
   * @description Send the message that a team has won the games.
   * @private
   * @param {HungryGames} hg HungryGames context.
   * @param {HungryGames~GuildGame} game Game context.
   * @param {Discord~TextChannel} channel Channel to send the message.
   * @param {HungryGames~Team} team The last team surviving.
   */
  _sendTeamVictor(hg, game, channel, team) {
    const finalMessage = new hg._parent.Discord.EmbedBuilder();
    finalMessage.setColor([255, 0, 255]);
    const teamName = team.name;
    const current = game.currentGame;

    finalMessage.setTitle(`${teamName} has won ${current.name}!`);
    let teamPlayerList = team.players.map((player) => {
      const p = current.includedUsers.find((user) => user.id == player);
      return (game.options.useNicknames && p.nickname) || p.name;
    });
    teamPlayerList = teamPlayerList.join(', ');
    if (teamPlayerList.length > 1024) {
      teamPlayerList = `${teamPlayerList.substring(0, 1021)}...`;
    }
    finalMessage.setDescription(teamPlayerList);

    let winnerTag = '\u200B';
    if (game.options.mentionVictor) {
      winnerTag = team.players.filter((p) => !p.startsWith('NPC'))
          .map((p) => `<@${p}>`)
          .join(' ');
    }

    const avatarSizes = game.options.victorAvatarSizes;
    const victorIconSize = avatarSizes.avatar;
    if (victorIconSize === 0) {
      channel.send({content: winnerTag, embeds: [finalMessage]});
    } else {
      const iconGap = avatarSizes.gap;
      const underlineSize = avatarSizes.underline;
      const finalImage = new Jimp(
          team.players.length * (victorIconSize + iconGap) - iconGap,
          victorIconSize + underlineSize);
      let responses = 0;
      const newImage = function(image, userId) {
        try {
          if (victorIconSize > 0) {
            if (image) image.resize(victorIconSize, victorIconSize);
            if (underlineSize > 0) {
              const user =
                  current.includedUsers.find((obj) => obj.id == userId);
              let color = 0x0;
              if (user && !user.living) {
                color = 0xFF0000FF;
              } else if (user && user.state == 'wounded') {
                color = 0xFFFF00FF;
              } else if (user) {
                color = 0x00FF00FF;
              }
              if (user && user.settings &&
                  typeof user.settings['hg:bar_color'] === 'number') {
                finalImage.blit(
                    new Jimp(
                        victorIconSize, underlineSize,
                        user.settings['hg:bar_color']),
                    responses * (victorIconSize + iconGap), 0);
              }
              finalImage.blit(
                  new Jimp(victorIconSize, underlineSize, color),
                  responses * (victorIconSize + iconGap), victorIconSize);
            }
            if (image) {
              finalImage.blit(
                  image, responses * (victorIconSize + iconGap), underlineSize);
            }
          }
        } catch (err) {
          hg._parent.warn('Failed to blit victor image');
          console.error(err);
        }
        responses++;
        if (responses == team.players.length) {
          finalImage.getBuffer(Jimp.MIME_PNG, (err, out) => {
            channel
                .send({
                  content: winnerTag,
                  embeds: [finalMessage],
                  files: [new hg._parent.Discord.AttachmentBuilder(
                      out, {name: 'hgTeamVictor.png'})],
                })
                .catch((err) => {
                  hg._parent.error('Failed to send team victor image message.');
                  console.error(err);
                });
          });
        }
      };
      team.players.forEach((player) => {
        const p = current.includedUsers.find((obj) => obj.id == player);
        const icon = p.avatarURL;
        const userId = p.id;
        hg._parent.readImage(icon)
            .then((image) => newImage(image, userId))
            .catch((err) => {
              hg._parent.error('Failed to read image');
              console.log(err);
              responses++;
            });
      });
    }
  }
  /**
   * @description Send the message that a player has won the games.
   * @private
   * @param {HungryGames} hg HungryGames context.
   * @param {HungryGames~GuildGame} game Game context.
   * @param {Discord~TextChannel} channel Channel to send the message.
   * @param {HungryGames~Player} p The last player surviving.
   * @param {?HungryGames~Team} team The last team surviving, if one.
   */
  _sendSoloVictor(hg, game, channel, p, team) {
    const finalMessage = new hg._parent.Discord.EmbedBuilder();
    finalMessage.setColor([255, 0, 255]);
    const current = game.currentGame;
    const name =
        game.options.useNicknames ? (p.nickname || p.name) : p.name;
    let teamName = '';
    if (team) teamName = `(${team.name}) `;
    finalMessage.setTitle(`\`${name}${teamName}\` has won ${current.name}!`);
    finalMessage.setThumbnail(p.avatarURL);
    let winnerTag = '';
    if (game.options.mentionVictor && !p.isNPC) winnerTag = `<@${p.id}>`;
    if (game.options.disableOutput) return;
    channel.send({content: winnerTag, embeds: [finalMessage]}).catch((err) => {
      hg._parent.error('Failed to send solo winner message: ' + channel.id);
      console.error(err);
    });
  }
  /**
   * @description Send the message that no one has won the games.
   * @private
   * @param {HungryGames} hg HungryGames context.
   * @param {HungryGames~GuildGame} game Game context.
   * @param {Discord~TextChannel} channel Channel to send the message.
   */
  _sendNoVictor(hg, game, channel) {
    const finalMessage = new hg._parent.Discord.EmbedBuilder();
    finalMessage.setColor([255, 0, 255]);
    const current = game.currentGame;
    finalMessage.setTitle(
        `Everyone has died in ${current.name}!\nThere are no winners!`);
    if (game.options.disableOutput) return;
    channel.send({embeds: [finalMessage]}).catch((err) => {
      hg._parent.error('Failed to send no winner message: ' + channel.id);
      console.error(err);
    });
  }
  /**
   * @description Create action from save data.
   * @public
   * @static
   * @override
   * @returns {HungryGames~SendVictorAction} The created action.
   */
  static create() {
    return new SendVictorAction();
  }
}

module.exports = SendVictorAction;
