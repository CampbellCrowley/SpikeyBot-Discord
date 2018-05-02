require('./subModule.js')(TicTacToe);  // Extends the SubModule class.

/**
 * @classdesc Manages a tic-tac-toe game.
 * @class
 * @augments SubModule
 * @listens SpikeyBot~Command#ticTacToe
 */
function TicTacToe() {
  const self = this;
  /** @inheritdoc */
  this.myName = 'TicTacToe';

  /**
   * @inheritdoc
   * @todo Create help for this.
   */
  this.helpMessage = undefined;

  this.initialize = function() {
    self.command.on('tictactoe', commandTicTacToe, true);
  };

  /** @inheritdoc */
  this.shutdown = function() {
    self.command.deleteEvent('tictactoe');
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
   * Starts a tic tac toe game. If someone is mentioned it will start a game
   * between the message author and the mentioned person. Otherwise, waits for
   * someone to play.
   *
   * @private
   * @type {commandHandler}
   * @param {Discord~Message} msg Message that triggered command.
   * @listens SpikeyBot~Command#ticTacToe
   */
  function commandTicTacToe(msg) {
    let players = {p1: msg.author, p2: null};
    if (msg.mentions.users.size > 0) {
      players.p2 = msg.mentions.users.first();
    }
    self.createGame(players, msg.channel);
  }

  /**
   * Class that stores the currnt state of a tic tac toe game.
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
     * An array of 9 elements that stores 0, 1, or 2 to signify who owns which
     * space of the board. 0 is nobody, 1 is player 1, 2 is player 2.
     * @type {number[]}
     */
    this.board = [0, 0, 0, 0, 0, 0, 0, 0, 0];
    /**
     * Which player's turn it is. Either 1 or 2.
     * @type {number]
     */
    this.turn = 1;
    /**
     * The message displaying the current game.
     * @type {Discord~Message}
     */
    this.msg = msg;

    /**
     * The template string for the game's board.
     *
     * @private
     * @type {string}
     * @constant
     * @default
     */
    const boardString = '```css\n   |   |   \n{0}|{1}|{2}\n___|___|___\n' +
        '   |   |   \n{3}|{4}|{5}\n___|___|___\n' +
        '   |   |   \n{6}|{7}|{8}\n   |   |   \n```';

    /**
     * Edit the current message to show the current board.
     *
     * @param {number} [winner=0] The player who has won the game. 0 is game not
     * done, 1 is player 1, 2 is player 2, 3 is draw.
     */
    this.print = function(winner = 0) {
      let embed = new self.Discord.MessageEmbed();
      let names = ['Nobody', 'Nobody'];
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

      let finalBoard = boardString.replace(/\{(.)\}/g, function(match, num) {
        switch (game.board[num]) {
          case 1:
            if (winner > 0 && winner != 1) return ' x ';
            return ' X ';
          case 2:
            if (winner > 0 && winner != 2) return ' o ';
            return ' O ';
          default:
            if (winner > 0) return '   ';
            return ' ' + num + ' ';
        }
      });

      embed.addField('\u200B', finalBoard, true);
      if (winner == 0) {
        embed.addField(
            names[this.turn - 1] + '\'s turn (' + (this.turn == 1 ? 'X' : 'O') +
                ')',
            '`' + names[0] + '` is X\n`' + names[1] + '` is O', true);
      } else {
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
    channel.send('`Loading TicTacToe...`').then((msg) => {
      let game = new self.Game(players, msg);
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
      if (index < 8) addReactions(msg, index + 1);
    });
  }

  /**
   * Add the listener for reactions to the game.
   *
   * @private
   * @param {Discord~Message} msg The message to add the reactions to.
   * @param {TicTacToe~Game} game The game to update when changes are made.
   */
  function addListener(msg, game) {
    msg.awaitReactions(function(reaction, user) {
         if (user.id != self.client.user.id) reaction.users.remove(user);
         else return false;

         if (game.turn == 1 && game.players.p1 &&
             user.id != game.players.p1.id) {
           return false;
         }
         if (game.turn == 2 && game.players.p2 &&
             user.id != game.players.p2.id) {
           return false;
         }
         for (let i = 0; i < 9; i++) {
           if (emoji[i] == reaction.emoji.name) return true;
         }
         return false;
       }, {max: 1, time: maxReactAwaitTime}).then(function(reactions) {
         if (reactions.size == 0) {
           msg.reactions.removeAll();
           msg.edit(
               'Game timed out!\nThe game has ended because nobody made a ' +
               'move in too long!');
           game.print(game.turn == 1 ? 2 : 1);
           return;
         }
         if (!game.players.p1 && game.turn == 1) {
           game.players.p1 = reactions.first().users.first(2)[1];
         }
         if (!game.players.p2 && game.turn == 2) {
           game.players.p2 = reactions.first().users.first(2)[1];
         }
         reactions.first().users.remove(self.client.user);

         let move = -1;
         const choice = reactions.first().emoji;
         for (let i = 0; i < 9; i++) {
           if (emoji[i] == choice.name && game.board[i] === 0) {
             move = i;
             break;
           }
         }
         if (move == -1) {
           addListener(msg, game);
           return;
         }
         game.board[move] = game.turn;
         let winner = checkWin(game.board, move);
         if (winner != 0) {
           msg.reactions.removeAll();
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
   * @param {number} latest The index where the latest move occurred.
   * @return {number} Returns 0 if game is not over, 1 if player 1 won, 2 if
   * player 2 won, 3 if draw.
   */
  function checkWin(board, latest) {
    let player = board[latest];
    // Column
    for (let i = 1; i < 3; i++) {
      if (board[(i * 3) % 9] != player) break;
      if (i == 2) return player;
    }
    // Row
    let row = Math.floor(latest / 3) * 3;
    for (let i = 1; i < 3; i++) {
      if (board[(i + latest - row) % 3 + row] != player) break;
      if (i == 2) return player;
    }
    // Diagonals
    switch (latest) {
      case 0:
      case 4:
      case 8:
        if (board[0] == board[4] && board[4] == board[8]) return player;
        break;
      default:
        break;
    }
    switch (latest) {
      case 2:
      case 4:
      case 6:
        if (board[2] == board[4] && board[4] == board[6]) return player;
        break;
      default:
        break;
    }
    // Is board full
    for (let i = 0; i < 9; i++) {
      if (board[i] == 0) return 0;
    }
    return 3;
  }
}

module.exports = new TicTacToe();
