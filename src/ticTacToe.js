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
   * Number of pixels large to make the image of the board.
   *
   * @private
   * @constant
   * @default
   * @type {number}
   */
  // const boardSize = 128;

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
     * Edit the current message to show the current board.
     */
    this.print = function() {
      let embed = new self.Discord.MessageEmbed();
      let names = ['Nobody', 'Nobody'];
      if (this.players.p1) {
        names[0] = '`' + this.players.p1.username + '`';
      }
      if (this.players.p2) {
        names[1] = '`' + this.players.p2.username + '`';
      }
      embed.setTitle(names[0] + ' vs ' + names[1]);
      msg.edit(embed);
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
      if (index < 9) addReactions(msg, index + 1);
    });
  }
}

module.exports = new TicTacToe();
