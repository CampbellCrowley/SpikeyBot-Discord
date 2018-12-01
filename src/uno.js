// Copyright 2018 Campbell Crowley. All rights reserved.
// Author: Campbell Crowley (dev@campbellcrowley.com)
require('./subModule.js')(Uno);  // Extends the SubModule class.

/**
 * @classdesc Manages an Uno game.
 * @class
 * @augments SubModule
 * @listens Command#uno
 */
function Uno() {
  const self = this;
  /** @inheritdoc */
  this.myName = 'Uno';

  /** @inheritdoc */
  this.initialize = function() {
    self.command.on(
        new self.command.SingleCommand(
            ['uno', 'one'], commandUno, {validOnlyInGuild: true},
            [new self.command.SingleCommand(
                'end', commandEnd, {validOnlyInGuild: true})]));
    pFlags = self.Discord.Permissions.FLAGS;
  };

  /** @inheritdoc */
  this.shutdown = function() {
    self.command.removeListener('uno');
  };

  /** @inheritdoc */
  this.unloadable = function() {
    return numGames === 0;
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
   * self.Discord.Permissions.FLAGS
   * @private
   */
  let pFlags = null;

  /**
   * All games currently in progress mapped by guilds, then by the game ID.
   * @private
   * @type {Object.<Object.<Uno.Game>>}
   */
  let games = {};

  /**
   * Starts an Uno game. If someone is mentioned it will start a game
   * between the message author and the mentioned person. Otherwise, waits for
   * someone to play.
   *
   * @private
   * @type {commandHandler}
   * @param {Discord~Message} msg Message that triggered command.
   * @listens Command#uno
   */
  function commandUno(msg) {
    if (!msg.guild.me.hasPermission(pFlags.MANAGE_CHANNELS)) {
      self.common.reply(
          msg,
          'I need permission to manage channels in order to start a game of ' +
              'UNO.');
      return;
    }
    self.common.reply(msg, 'Creating a game of UNO.');
    if (!games[msg.guild.id]) games[msg.guild.id] = {};
    let newGame = new self.Game(
        (msg.mentions.members.array() || []).concat([msg.member]), msg.member);
    games[msg.guild.id][newGame.id] = newGame;
  }

  /**
   * Ends an Uno game.
   *
   * @private
   * @type {commandHandler}
   * @param {Discord~Message} msg Message that triggered command.
   * @listens Command#connect4
   */
  function commandEnd(msg) {
    if (!msg.guild.me.hasPermission(pFlags.MANAGE_CHANNELS)) {
      self.common.reply(msg, 'I don\'t have permission to manage channels.');
      return;
    }
    if (!games[msg.guild.id]) {
      self.common.reply(
          msg, 'There are no UNO games in progress in this server.');
      return;
    }
    let list = Object.values(games[msg.guild.id]);
    list.forEach((g) => {
      g.end();
    });
    delete games[msg.guild.id];
    self.common.reply(msg, 'All UNO games have been ended.');
  }

  /**
   * Enum for card colors.
   * @public
   * @constant
   * @default
   * @enum {number}
   */
  this.Color = {
    NONE: 0,
    RED: 1,
    BLUE: 2,
    GREEN: 3,
    YELLOW: 4,
  };

  /**
   * Enum for card faces. The LSB is the card number, all following bits are a
   * bitfield of card properties.
   *
   * 0x010: The card is a wild card.
   * 0x020: The card skips the next player's turn.
   * 0x040: The card reverses play direction.
   * 0x080: The card causes the next player after the turn is over, to draw 2
   * cards.
   * 0x100: The next player must draw 4 cards.
   *
   * @public
   * @constant
   * @default
   * @enum {number}
   */
  this.CardFace = {
    SKIP: 0x02A,
    DRAW_TWO: 0x0AB,
    REVERSE: 0x06C,
    WILD: 0x01E,
    DRAW_FOUR: 0x13D,
    ZERO: 0,
    ONE: 1,
    TWO: 2,
    THREE: 3,
    FOUR: 4,
    FIVE: 5,
    SIX: 6,
    SEVEN: 7,
    EIGHT: 8,
    NINE: 9,
  };

  /**
   * Class that stores the current information about a particular card. All
   * cards with the same color and face value are represented here using the
   * `count` attribute.
   * @class
   *
   * @public
   * @param {CardFace} face The face value or type of card this is.
   * @param {Color} color The color of this card.
   */
  this.Card = function(face, color) {
    if (typeof face !== 'number') {
      throw new Error('Given value for card face is not a number!');
    }
    /**
     * The face value of this card.
     * @public
     * @type {Uno.CardFace}
     */
    this.face = face;
    if (typeof color !== 'number') {
      throw new Error('Given value for card color is not a number!');
    }
    /**
     * The color of this card.
     * @public
     * @type {Uno.Color}
     */
    this.color = color;
  };

  /**
   * Class that stores the current state of an Uno game.
   * @class
   *
   * @public
   * @param {Discord~GuildMember[]} memberList The players to initially add to
   * this game.
   * @param {Discord~GuildMember} maker The player who created the game and can
   * change settings and manage users.
   */
  this.Game = function(memberList, maker) {
    const game = this;

    if (!memberList || !memberList.length) {
      throw new Error('Member list must be an array of Discord.GuildMembers.');
    }
    if (!maker || !maker.guild) {
      throw new Error('Game maker must be a guild member.');
    }
    /**
     * The guild members in this game mapped by their ID.
     *
     * @private
     * @type {Object.<Discord~GuildMember>}
     */
    let members = {};

    do {
      /**
       * The ID of this uno game. Should be unique per guild.
       *
       * @public
       * @readonly
       * @type {number}
       */
      this.id = Math.floor((Math.random() * 1000));
    } while (games[maker.guild.id][game.id]);

    /**
     * The array of all player in the game in the order of their turn.
     *
     * @private
     * @type {Uno.Player[]}
     */
    let players = [];

    /**
     * The category that stores all channels for this game. Null until it is
     * created.
     *
     * @public
     * @type {?Discord~CategoryChannel}
     */
    this.catChannel = null;
    /**
     * The channel that all players of this game can view and type in. Null
     * until the channel is created.
     *
     * @public
     * @type {?Discord~TextChannel}
     */
    this.groupChannel = null;

    /**
     * All cards currently not in a player's hand.
     *
     * @private
     * @type {Uno.Card[]}
     */
    // let discarded = self.getHand();

    /**
     * Has this game been started.
     *
     * @public
     * @default
     * @readonly
     * @type {boolean}
     */
    this.started = false;

    /**
     * Creates all channels for this game and currently added players.
     *
     * @private
     */
    (function setupChannels() {
      let channelOpts = {
        topic: 'UNO! (ID:' + game.id + ')',
        permissionOverwrites: [
          {
            id: maker.guild.defaultRole,
            allow: 0,
            deny: self.Discord.Permissions.FLAGS.VIEW_CHANNEL,
            type: 'role',
          },
          {
            id: self.client.user.id,
            allow: pFlags.VIEW_CHANNEL | pFlags.SEND_MESSAGES,
            deny: 0,
            type: 'member',
          },
        ],
        type: 'category',
        reason: 'An UNO game was started by ' + maker.user.tag,
      };

      for (let i = 0; i < memberList.length; i++) {
        members[memberList[i].id] = memberList[i];
        channelOpts.permissionOverwrites.push({
          id: memberList[i].id,
          allow: pFlags.VIEW_CHANNEL | pFlags.SEND_MESSAGES,
          deny: 0,
          type: 'member',
        });
      }

      maker.guild.channels.create('uno-' + game.id, channelOpts).then((c) => {
        game.catChannel = c;
        maker.guild.channels
            .create('uno-' + game.id, {
              topic: 'UNO! (ID:' + game.id + ')',
              type: 'text',
              reason: 'An UNO game was started by ' + maker.user.tag,
              parent: c,
            })
            .then((c) => {
              game.groupChannel = c;
              for (let i = 0; i < memberList.length; i++) {
                game.addPlayer(memberList[i]);
              }
            });
      });
    })();

    /**
     * Ends this game and deletes all created channels.
     *
     * @public
     */
    this.end = function() {
      if (game.groupChannel) {
        game.groupChannel.delete('The UNO game has ended.');
      }
      if (players) {
        players.forEach((p) => {
          if (p.channel) p.channel.delete('The UNO game has ended.');
        });
      }
      if (game.catChannel &&
          game.catChannel.children.size == (1 + players.length)) {
        game.catChannel.delete('The UNO game has ended.');
      }
    };

    /**
     * Add the given guild member to the game.
     * @public
     *
     * @param {Discord~GuildMember} p The member to add to the game.
     */
    this.addPlayer = function(p) {
      if (!p) return;
      if (!game.catChannel) {
        memberList.push(p);
        return;
      }
      players.push(new self.Player(p, game));
    };
  };

  /**
   * A single player in the game.
   *
   * @public
   * @param {Discord~GuildMember} member The guild member this is based off of.
   * @param {Uno.Game} parent The parent game this player will be in.
   */
  this.Player = function(member, parent) {
    const player = this;
    if (typeof member !== 'object') {
      throw new Error('A new player must be based off of a GuildMember.');
    }

    let permOverwrites = [
      {
        id: member.guild.defaultRole,
        allow: 0,
        deny: pFlags.VIEW_CHANNEL,
        type: 'role',
      },
      {
        id: member.id,
        allow: pFlags.VIEW_CHANNEL,
        deny: pFlags.SEND_MESSAGES,
        type: 'member',
      },
      {
        id: self.client.user.id,
        allow: pFlags.VIEW_CHANNEL | pFlags.SEND_MESSAGES,
        deny: 0,
        type: 'member',
      },
    ];

    let channelOpts = Object.assign({
      topic: (member.nickname || member.user.username) + '\'s UNO cards.',
      parent: parent.catChannel,
      permissionOverwrites: permOverwrites,
      type: 'text',
      reason: 'An UNO game was started.',
    });

    this.id = member.id;
    this.channel = null;
    member.guild.channels
        .create(
            parent.catChannel.name + '-' +
                (member.nickname || member.user.username),
            channelOpts)
        .then((channel) => {
          player.channel = channel;
          channel.send(
              '<@' + member.id +
              '> You have been added to this game of Uno!\n\nThis channel ' +
              'will show you the cards you currently have in your hand once ' +
              'the game starts.\n\nUse <#' + parent.groupChannel.id +
              '> to play your cards and talk to other players!');
        })
        .catch((err) => {
          self.error(
              'Failed to create private text channel for member: ' + member.id +
              ' in guild: ' + member.guild.id);
          console.error(err);
          if (parent.groupChannel) {
            parent.groupChannel.send(
                'Failed to create text channel for ' + member.user.tag);
          }
        });
    this.hand = [];
  };

  /**
   * A default hand of cards that the classic game starts with.
   *
   * @return {Uno.Card[]}
   */
  this.getHand = function() {
    let c = self.Color;
    let f = self.CardFace;
    /* eslint-disable no-multi-line */
    return [
      new self.Card(f.ZERO, c.RED), new self.Card(f.ZERO, c.GREEN),
      new self.Card(f.ZERO, c.YELLOW), new self.Card(f.ZERO, c.BLUE),
      new self.Card(f.ONE, c.RED), new self.Card(f.ONE, c.RED),
      new self.Card(f.ONE, c.GREEN), new self.Card(f.ONE, c.GREEN),
      new self.Card(f.ONE, c.YELLOW), new self.Card(f.ONE, c.YELLOW),
      new self.Card(f.ONE, c.BLUE), new self.Card(f.ONE, c.BLUE),
      new self.Card(f.TWO, c.RED), new self.Card(f.TWO, c.RED),
      new self.Card(f.TWO, c.GREEN), new self.Card(f.TWO, c.GREEN),
      new self.Card(f.TWO, c.YELLOW), new self.Card(f.TWO, c.YELLOW),
      new self.Card(f.TWO, c.BLUE), new self.Card(f.TWO, c.BLUE),
      new self.Card(f.THREE, c.RED), new self.Card(f.THREE, c.RED),
      new self.Card(f.THREE, c.GREEN), new self.Card(f.THREE, c.GREEN),
      new self.Card(f.THREE, c.YELLOW), new self.Card(f.THREE, c.YELLOW),
      new self.Card(f.THREE, c.BLUE), new self.Card(f.THREE, c.BLUE),
      new self.Card(f.FOUR, c.RED), new self.Card(f.FOUR, c.RED),
      new self.Card(f.FOUR, c.GREEN), new self.Card(f.FOUR, c.GREEN),
      new self.Card(f.FOUR, c.YELLOW), new self.Card(f.FOUR, c.YELLOW),
      new self.Card(f.FOUR, c.BLUE), new self.Card(f.FOUR, c.BLUE),
      new self.Card(f.FIVE, c.RED), new self.Card(f.FIVE, c.RED),
      new self.Card(f.FIVE, c.GREEN), new self.Card(f.FIVE, c.GREEN),
      new self.Card(f.FIVE, c.YELLOW), new self.Card(f.FIVE, c.YELLOW),
      new self.Card(f.FIVE, c.BLUE), new self.Card(f.FIVE, c.BLUE),
      new self.Card(f.SIX, c.RED), new self.Card(f.SIX, c.RED),
      new self.Card(f.SIX, c.GREEN), new self.Card(f.SIX, c.GREEN),
      new self.Card(f.SIX, c.YELLOW), new self.Card(f.SIX, c.YELLOW),
      new self.Card(f.SIX, c.BLUE), new self.Card(f.SIX, c.BLUE),
      new self.Card(f.SEVEN, c.RED), new self.Card(f.SEVEN, c.RED),
      new self.Card(f.SEVEN, c.GREEN), new self.Card(f.SEVEN, c.GREEN),
      new self.Card(f.SEVEN, c.YELLOW), new self.Card(f.SEVEN, c.YELLOW),
      new self.Card(f.SEVEN, c.BLUE), new self.Card(f.SEVEN, c.BLUE),
      new self.Card(f.EIGHT, c.RED), new self.Card(f.EIGHT, c.RED),
      new self.Card(f.EIGHT, c.GREEN), new self.Card(f.EIGHT, c.GREEN),
      new self.Card(f.EIGHT, c.YELLOW), new self.Card(f.EIGHT, c.YELLOW),
      new self.Card(f.EIGHT, c.BLUE), new self.Card(f.EIGHT, c.BLUE),
      new self.Card(f.NINE, c.RED), new self.Card(f.NINE, c.RED),
      new self.Card(f.NINE, c.GREEN), new self.Card(f.NINE, c.GREEN),
      new self.Card(f.NINE, c.YELLOW), new self.Card(f.NINE, c.YELLOW),
      new self.Card(f.NINE, c.BLUE), new self.Card(f.NINE, c.BLUE),
      new self.Card(f.DRAW_TWO, c.RED), new self.Card(f.DRAW_TWO, c.RED),
      new self.Card(f.DRAW_TWO, c.GREEN), new self.Card(f.DRAW_TWO, c.GREEN),
      new self.Card(f.DRAW_TWO, c.YELLOW), new self.Card(f.DRAW_TWO, c.YELLOW),
      new self.Card(f.DRAW_TWO, c.BLUE), new self.Card(f.DRAW_TWO, c.BLUE),
      new self.Card(f.SKIP, c.RED), new self.Card(f.SKIP, c.RED),
      new self.Card(f.SKIP, c.GREEN), new self.Card(f.SKIP, c.GREEN),
      new self.Card(f.SKIP, c.YELLOW), new self.Card(f.SKIP, c.YELLOW),
      new self.Card(f.SKIP, c.BLUE), new self.Card(f.SKIP, c.BLUE),
      new self.Card(f.REVERSE, c.RED), new self.Card(f.REVERSE, c.RED),
      new self.Card(f.REVERSE, c.GREEN), new self.Card(f.REVERSE, c.GREEN),
      new self.Card(f.REVERSE, c.YELLOW), new self.Card(f.REVERSE, c.YELLOW),
      new self.Card(f.REVERSE, c.BLUE), new self.Card(f.REVERSE, c.BLUE),
      new self.Card(f.WILD, c.NONE), new self.Card(f.WILD, c.NONE),
      new self.Card(f.WILD, c.NONE), new self.Card(f.WILD, c.NONE),
      new self.Card(f.DRAW_FOUR, c.NONE), new self.Card(f.DRAW_FOUR, c.NONE),
      new self.Card(f.DRAW_FOUR, c.NONE), new self.Card(f.DRAW_FOUR, c.NONE),
    ];
    /* eslint-enable no-multi-line */
  };
}

module.exports = new Uno();
