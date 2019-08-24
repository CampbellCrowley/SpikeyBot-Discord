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
        this._sortTeams(game);
        const splitEmbeds =
            game.currentGame.teams.length < 25 && game.options.teamSize > 0;
        let prevTeam = -1;
        const statusList = current.includedUsers.map((obj) => {
          const myTeam = current.teams.findIndex((team) => {
            return team.players.findIndex((player) => player == obj.id) > -1;
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

          if (splitEmbeds) return shortName;

          let prefix = '';
          if (myTeam != prevTeam) {
            prevTeam = myTeam;
            prefix = current.teams[myTeam].rank + ') __' +
                current.teams[myTeam].name + '__\n';
          }

          return `${prefix}\`${shortName}\``;
        });
        if (splitEmbeds) {
          game.currentGame.teams.reverse().forEach((el) => {
            teamRankEmbed.addField(
                el.name, statusList.splice(0, el.players.length)
                    .join('\n').slice(0, 1023),
                true);
          });
        } else {
          if (statusList.length >= 5) {
            const numCols = hg._parent.calcColNum(
                statusList.length > 10 ? 3 : 2, statusList);

            const quarterLength = Math.ceil(statusList.length / numCols);
            for (let i = 0; i < numCols - 1; i++) {
              const thisMessage =
                  statusList.splice(0, quarterLength).join('\n');
              teamRankEmbed.addField(i + 1, thisMessage, true);
            }
            teamRankEmbed.addField(numCols, statusList.join('\n'), true);
          } else {
            teamRankEmbed.setDescription(statusList.join('\n'));
          }
        }
        teamRankEmbed.setColor([255, 0, 255]);
        if (!game.options.disableOutput) {
          channel.send(teamRankEmbed).catch((err) => {
            hg._parent.error('Failed to send final team ranks: ' + channel.id);
            console.error(err);
          });
        }
      }
    }, 10000);
  }
  /**
   * @description Sort the includedUsers and teams by final ranking.
   * @private
   * @param {HungryGames~GuildGame} game The game to sort.
   */
  _sortTeams(game) {
    game.currentGame.teams.sort((a, b) => b.rank - a.rank);
    game.currentGame.includedUsers.sort((a, b) => {
      const aTeam = game.currentGame.teams.find((team) => {
        return team.players.findIndex((player) => {
          return player == a.id;
        }) > -1;
      });
      const bTeam = game.currentGame.teams.find((team) => {
        return team.players.findIndex((player) => {
          return player == b.id;
        }) > -1;
      });
      if (!aTeam || !bTeam || aTeam.id == bTeam.id) {
        const aN = ((game.options.useNicknames && a.nickname) || a.name)
            .toLocaleLowerCase();
        const bN = ((game.options.useNicknames && b.nickname) || b.name)
            .toLocaleLowerCase();
        if (aN < bN) return -1;
        if (aN > bN) return 1;
        return 0;
      } else {
        return aTeam.id - bTeam.id;
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
