// Copyright 2019 Campbell Crowley. All rights reserved.
// Author: Campbell Crowley (dev@campbellcrowley.com)
const ChannelAction = require('./ChannelAction.js');

/**
 * @description Sends message with player rankings.
 *
 * @memberof HungryGames~Action
 * @inner
 * @augments HungryGames~Action~ChannelAction
 */
class SendTeamRankMessageAction extends ChannelAction {
  /**
   * @description Create an action that will send a message to the game channel
   * with the team rankings.
   */
  constructor() {
    super((hg, game, channel) => {
      if (game.options.teamSize > 0) {
        const current = game.currentGame;
        const teamRankEmbed = new hg._parent.Discord.MessageEmbed();
        teamRankEmbed.setTitle('Final Team Ranks');
        hg._parent.sortTeams(game);
        let prevTeam = -1;
        const statusList =
            current.includedUsers.map((obj) => {
              let myTeam = -1;
              myTeam = current.teams.findIndex((team) => {
                return team.players.findIndex((player) => {
                  return player == obj.id;
                }) > -1;
              });
              let shortName;
              if (obj.nickname && game.options.useNicknames) {
                shortName = obj.nickname.substring(0, 16);
                if (shortName != obj.nickname) {
                  shortName = shortName.substring(0, 13) + '...';
                }
              } else {
                shortName = obj.name.substring(0, 16);
                if (shortName != obj.name) {
                  shortName = shortName.substring(0, 13) + '...';
                }
              }

              let prefix = '';
              if (myTeam != prevTeam) {
                prevTeam = myTeam;
                prefix = current.teams[myTeam].rank + ') __' +
                    current.teams[myTeam].name + '__\n';
              }

              return `${prefix}\`${shortName}\``;
            });
        if (statusList.length >= 5) {
          const numCols =
              hg._parent.calcColNum(statusList.length > 10 ? 3 : 2, statusList);

          const quarterLength = Math.ceil(statusList.length / numCols);
          for (let i = 0; i < numCols - 1; i++) {
            const thisMessage = statusList.splice(0, quarterLength).join('\n');
            teamRankEmbed.addField(i + 1, thisMessage, true);
          }
          teamRankEmbed.addField(numCols, statusList.join('\n'), true);
        } else {
          teamRankEmbed.setDescription(statusList.join('\n'));
        }
        teamRankEmbed.setColor([255, 0, 255]);
        if (!game.options.disableOutput) {
          channel.send(teamRankEmbed).catch((err) => {
            hg._parent.error('Failed to send final team ranks: ' + channel.id);
            console.error(err);
          });
        }
      }
    });
  }
  /**
   * @description Create action from save data.
   * @public
   * @static
   * @override
   * @returns {HungryGames~SendTeamRankMessageAction} The created action.
   */
  static create() {
    return new SendTeamRankMessageAction();
  }
}

module.exports = SendTeamRankMessageAction;
