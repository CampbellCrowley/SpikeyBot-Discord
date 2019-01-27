// Copyright 2018 Campbell Crowley. All rights reserved.
// Author: Campbell Crowley (dev@campbellcrowley.com)
require('./subModule.js')(Connect4);  // Extends the SubModule class.

/**
 * @classdesc Manages a Connect 4 game.
 * @class
 * @augments SubModule
 * @listens Command#connect4
 */
function Connect4() {
  const self = this;
  /** @inheritdoc */
  this.myName = 'Connect4';

  /** @inheritdoc */
  this.initialize = function() {
    self.command.on('connect4', commandConnect4);
  };

  /** @inheritdoc */
  this.shutdown = function() {
    self.command.deleteEvent('connect4');
  };

  /** @inheritdoc */
  this.unloadable = function() {
    return numGames === 0;
  };

  /**
   * Maximum amount of time to wait for reactions to a message. Also becomes
   * maximum amount of time a game will run with no input, because controls will
   * be disabled after this timeout.
   *
   * @private
   * @constant
   * @type {number}
   * @default 5 Minutes
   */
  const maxReactAwaitTime = 5 * 1000 * 60; // 5 Minutes

  /**
   * The number of rows in the board.
   *
   * @private
   * @constant
   * @type {number}
   * @default
   */
  const numRows = 6;

  /**
   * The number of columns in the board.
   *
   * @private
   * @constant
   * @type {number}
   * @default
   */
  const numCols = 7;

  /**
   * Helper object of emoji characters mapped to names.
   *
   * @private
   * @type {Object.<string>}
   * @constant
   * @default
   */
  const emoji = {
    0: '\u0030\u20E3',
    1: '\u0031\u20E3',
    2: '\u0032\u20E3',
    3: '\u0033\u20E3',
    4: '\u0034\u20E3',
    5: '\u0035\u20E3',
    6: '\u0036\u20E3',
    7: '\u0037\u20E3',
    8: '\u0038\u20E3',
    9: '\u0039\u20E3',
    X: '❌',
    O: '⭕',
  };

  /**
   * The number of currently active games. Used to determine of submodule is
   * unloadable.
   * @private
   * @type {number}
   * @default
   */
  let numGames = 0;

  /**
   * Starts a connect 4 game. If someone is mentioned it will start a game
   * between the message author and the mentioned person. Otherwise, waits for
   * someone to play.
   *
   * @private
   * @type {commandHandler}
   * @param {Discord~Message} msg Message that triggered command.
   * @listens Command#connect4
   */
  function commandConnect4(msg) {
    const players = {p1: msg.author, p2: null};
    if (msg.mentions.users.size > 0) {
      players.p2 = msg.mentions.users.first();
    }
    self.createGame(players, msg.channel);
  }

  /**
   * Class that stores the current state of a connect 4 game.
   * @class
   *
   * @public
   * @param {{p1: Discord~User, p2: Discord~User}} players The players in this
   * game.
   * @param {Discord~Message} msg The message displaying the current game.
   */
  this.Game = function(players, msg) {
    const game = this;
    /**
     * The players in this game.
     * @type {{p1: Discord~User, p2: Discord~User}}
     */
    this.players = players;
    /**
     * 2D Array of a 7w x 6h board. 0 is nobody, 1 is player 1, 2 is player 2.
     * @type {Array.<number[]>}
     */
    this.board = [
      [0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0],
    ];
    /**
     * Which player's turn it is. Either 1 or 2.
     * @type {number}
     */
    this.turn = 1;
    /**
     * The message displaying the current game.
     * @type {Discord~Message}
     */
    this.msg = msg;

    /**
     * Edit the current message to show the current board.
     *
     * @param {number} [winner=0] The player who has won the game. 0 is game not
     * done, 1 is player 1, 2 is player 2, 3 is draw.
     */
    this.print = function(winner = 0) {
      const embed = new self.Discord.MessageEmbed();
      const names = ['Nobody', 'Nobody'];
      let gameFull = true;
      if (this.players.p1) {
        names[0] = this.players.p1.username;
      } else {
        gameFull = false;
      }
      if (this.players.p2) {
        names[1] = this.players.p2.username;
      } else {
        gameFull = false;
      }
      embed.setTitle(names[0] + ' vs ' + names[1]);
      if (!gameFull) {
        embed.setDescription('To join the game, just make a move!');
      }

      let finalBoard = '```css\n' +
          // '012345678901234567890123456\n' +
          '        Connect Four           \n' +
          this.board
              .map(function(row, rowNum) {
                return row
                    .map(function(cell, colNum) {
                      switch (game.board[rowNum][colNum]) {
                        case 1:
                          if (winner > 0 && winner != 1) {
                            return ' x ';
                          }
                          return ' X ';
                        case 2:
                          if (winner > 0 && winner != 2) {
                            return ' o ';
                          }
                          return ' O ';
                        default:
                          return '   ';
                      }
                    })
                    .join('|');
              })
              .join('\n');
      finalBoard += '\n';
      for (let i = 0; i < numCols; i++) {
        finalBoard += '___';
        if (i != numCols - 1) finalBoard += '|';
      }
      finalBoard += '\n';
      for (let i = 0; i < numCols; i++) {
        finalBoard += ' ' + i + ' ';
        if (i != numCols - 1) finalBoard += '|';
      }

      finalBoard += '\n```';

      embed.addField('\u200B', finalBoard, true);
      if (winner == 0) {
        embed.addField(
            names[this.turn - 1] + '\'s turn (' + (this.turn == 1 ? 'X' : 'O') +
                ')',
            '`' + names[0] + '` is X\n`' + names[1] + '` is O', true);
      } else {
        numGames--;
        embed.addField(
            '\u200B', '`' + names[0] + '` was X\n`' + names[1] + '` was O',
            true);
      }

      if (winner == 3) {
        embed.addField('Draw game!', 'Nobody wins');
      } else if (winner == 2) {
        embed.addField(
            names[1] + ' Won! ' + emoji.O,
            names[0] + ', try harder next time.');
      } else if (winner == 1) {
        embed.addField(
            names[0] + ' Won! ' + emoji.X,
            names[1] + ', try harder next time.');
      }
      msg.edit('\u200B', embed);
    };
  };

  /**
   * Create a game with the given players in a given text channel.
   *
   * @public
   * @param {{p1: Discord~User, p2: Discord~User}} players The players in the
   * game.
   * @param {Discord~TextChannel} channel The text channel to send messages.
   */
  this.createGame = function(players, channel) {
    numGames++;
    channel.send('`Loading Connect 4...`').then((msg) => {
      const game = new self.Game(players, msg);
      game.print();
      addReactions(msg);
      addListener(msg, game);
    });
  };

  /**
   * Add the reactions to a message for controls of the game. Recursive.
   *
   * @private
   * @param {Discord~Message} msg The message to add the reactions to.
   * @param {number} index The number of reactions we have added so far.
   */
  function addReactions(msg, index = 0) {
    msg.react(emoji[index]).then((_) => {
      if (index < numCols - 1) addReactions(msg, index + 1);
    });
  }

  /**
   * Add the listener for reactions to the game.
   *
   * @private
   * @param {Discord~Message} msg The message to add the reactions to.
   * @param {Connect4~Game} game The game to update when changes are made.
   */
  function addListener(msg, game) {
    msg.awaitReactions(function(reaction, user) {
      if (user.id != self.client.user.id) {
        reaction.users.remove(user).catch(() => {});
      } else {
        return false;
      }

      if (game.turn == 1 && game.players.p1 &&
             user.id != game.players.p1.id) {
        return false;
      }
      if (game.turn == 2 && game.players.p2 &&
             user.id != game.players.p2.id) {
        return false;
      }
      for (let i = 0; i < numCols; i++) {
        if (emoji[i] == reaction.emoji.name) return true;
      }
      return false;
    }, {max: 1, time: maxReactAwaitTime}).then(function(reactions) {
      if (reactions.size == 0) {
        msg.reactions.removeAll().catch(() => {});
        msg.edit(
            'Game timed out!\nThe game has ended because nobody made a ' +
               'move in too long!');
        game.print(game.turn == 1 ? 2 : 1);
        return;
      }
      if (!game.players.p1 && game.turn == 1) {
        const reactUsers = reactions.first().users.first(2);
        game.players.p1 = reactUsers[1] || reactUsers[0];
      }
      if (!game.players.p2 && game.turn == 2) {
        const reactUsers = reactions.first().users.first(2);
        game.players.p2 = reactUsers[1] || reactUsers[0];
      }

      let move = -1;
      const choice = reactions.first().emoji;
      for (let i = 0; i < numCols; i++) {
        if (emoji[i] == choice.name) {
          move = i;
          break;
        }
      }
      if (move == -1) {
        addListener(msg, game);
        return;
      }
      if (game.board[0][move] != 0) {
        addListener(msg, game);
        return;
      }
      /* if (game.board[1][move] != 0) {
           reactions.first().users.remove(self.client.user);
         } */
      let row;
      for (row = 1; row < numRows; row++) {
        if (game.board[row][move] != 0) {
          break;
        }
      }
      row--;
      game.board[row][move] = game.turn;
      const winner = checkWin(game.board, row, move);
      if (winner != 0) {
        msg.reactions.removeAll().catch(() => {});
      } else {
        game.turn = game.turn === 1 ? 2 : 1;
        addListener(msg, game);
      }
      game.print(winner);
    });
  }
  /**
   * Checks if the given board has a winner, or if the game is over.
   *
   * @param {number[]} board Array of 9 numbers defining a board. 0 is nobody, 1
   * is player 1, 2 is player 2.
   * @param {number} latestR The row index where the latest move occurred.
   * @param {number} latestC The column index where the latest move occurred.
   * @return {number} Returns 0 if game is not over, 1 if player 1 won, 2 if
   * player 2 won, 3 if draw.
   */
  function checkWin(board, latestR, latestC) {
    const player = board[latestR][latestC];
    // Column
    let count = 0;
    for (let r = latestR - 3; r <= latestR + 3 && r < numRows; r++) {
      if (r < 0) continue;

      if (board[r][latestC] == player) count++;
      else count = 0;

      if (count == 4) return player;
    }
    // Row
    count = 0;
    for (let c = latestC - 3; c <= latestC + 3 && c < numCols; c++) {
      if (c < 0) continue;

      if (board[latestR][c] == player) count++;
      else count = 0;

      if (count == 4) return player;
    }
    // Diag TL to BR
    count = 0;
    for (let r = latestR - 3, c = latestC - 3;
      r <= latestR + 3 && r < numRows && c <= latestC + 3 && c < numCols;
      r++, c++) {
      if (r < 0) continue;
      if (c < 0) continue;

      if (board[r][c] == player) count++;
      else count = 0;

      if (count == 4) return player;
    }
    // Diag BL to TR
    count = 0;
    for (let r = latestR + 3, c = latestC - 3;
      r >= latestR - 3 && r >= 0 && c <= latestC + 3 && c < numCols;
      r--, c++) {
      if (r > numRows - 1) continue;
      if (c < 0) continue;

      if (board[r][c] == player) count++;
      else count = 0;

      if (count == 4) return player;
    }

    // Is board full
    for (let r = 0; r < numRows; r++) {
      for (let c = 0; c < numCols; c++) {
        if (board[r][c] === 0) return 0;
      }
    }
    return 3;
  }
}

module.exports = new Connect4();
