// Copyright 2018 Campbell Crowley. All rights reserved.
// Author: Campbell Crowley (dev@campbellcrowley.com)
const fs = require('fs');
const Jimp = require('jimp');
const mkdirp = require('mkdirp'); // mkdir -p
const rimraf = require('rimraf'); // rm -rf
const funTranslator = require('./lib/funTranslators.js');
const FuzzySearch = require('fuzzy-search');
require('./subModule.js')(HungryGames);  // Extends the SubModule class.

/**
 * @classdesc Hunger Games simulator.
 * @class
 * @augments SubModule
 * @listens Command#hg
 */
function HungryGames() {
  const self = this;

  let Web;
  /**
   * Instance of the web class that can control this instance.
   *
   * @private
   * @type {HGWeb}
   */
  let web;

  this.myName = 'HG';
  this.postPrefix = 'hg ';

  /**
   * The permission tags for all settings related to the Hungry Games.
   *
   * @private
   * @constant
   * @default
   * @type {string[]}
   */
  const patreonSettingKeys =
      ['hg:fun_translators', 'hg:customize_stats', 'hg:personal_weapon'];
  /**
   * The file path to save current state for a specific guild relative to
   * Common~guildSaveDir.
   * @see {@link Common~guildSaveDir}
   * @see {@link HungryGames~games}
   * @see {@link HungryGames~saveFileDir}
   * @see {@link HungryGames~hgSaveDir}
   *
   * @private
   * @type {string}
   * @constant
   * @default
   */
  const saveFile = 'game.json';
  /**
   * The file directory for finding saved data related to the hungry games data
   * of individual guilds.
   * @see {@link Common~guildSaveDir}
   * @see {@link HungryGames~games}
   * @see {@link HungryGames~saveFile}
   * @see {@link HungryGames~saveFileDir}
   *
   * @private
   * @type {string}
   * @constant
   * @default
   */
  const hgSaveDir = '/hg/';
  /**
   * The file path to read default events.
   * @see {@link HungryGames~defaultPlayerEvents}
   * @see {@link HungryGames~defaultArenaEvents}
   * @see {@link HungryGames~defaultBloodbathEvents}
   *
   * @private
   * @type {string}
   * @constant
   * @default
   */
  const eventFile = './save/hgEvents.json';
  /**
   * The file path to read messages.
   * @see {@link HungryGames~messages}
   *
   * @private
   * @type {string}
   * @constant
   * @default
   */
  const messageFile = './save/hgMessages.json';
  /**
   * The file path to read battle events.
   * @see {@link HungryGames~battles}
   *
   * @private
   * @type {string}
   * @constant
   * @default
   */
  const battleFile = './save/hgBattles.json';
  /**
   * The file path to read weapon events.
   * @see {@link HungryGames~weapons}
   *
   * @private
   * @type {string}
   * @constant
   * @default
   */
  const weaponsFile = './save/hgWeapons.json';

  /**
   * The file path to read attacking left image.
   *
   * @private
   * @type {string}
   * @constant
   * @default
   */
  const fistLeft = './img/fist_left.png';
  /**
   * The file path to read attacking right image.
   *
   * @private
   * @type {string}
   * @constant
   * @default
   */
  const fistRight = './img/fist_right.png';
  /**
   * The file path to read attacking both directions image.
   *
   * @private
   * @type {string}
   * @constant
   * @default
   */
  const fistBoth = './img/fist_both.png';

  /**
   * The size of the icon to request from discord.
   *
   * @private
   * @type {number}
   * @constant
   * @default
   */
  const fetchSize = 128;

  /**
   * Role that a user must have in order to perform any commands.
   *
   * @private
   * @type {string}
   * @constant
   * @default
   */
  const roleName = 'HG Creator';
  /**
   * Role that a user must have in order to perform any commands.
   *
   * @public
   * @type {string}
   * @constant
   */
  this.roleName = roleName;

  /**
   * Number of events to show on a single page of events.
   *
   * @private
   * @type {number}
   * @constant
   * @default
   */
  const numEventsPerPage = 10;

  /**
   * Maximum amount of time to wait for reactions to a message.
   *
   * @private
   * @type {number}
   * @constant
   * @default 5 Minutes
   */
  const maxReactAwaitTime = 5 * 1000 * 60;  // 5 Minutes

  /**
   * Stores the guilds we have looked for their data recently and the timestamp
   * at which we looked. Used to reduce filesystem requests and blocking.
   *
   * @private
   * @type {Object.<number>}
   */
  let findTimestamps = {};
  /**
   * The delay after failing to find a guild's data to look for it again.
   *
   * @private
   * @type {number}
   * @constant
   * @default 15 Seconds
   */
  const findDelay = 15000;

  /**
   * Default options for a game.
   *
   * @private
   * @type {Object.<{
   *     value: string|number|boolean|Object,
   *     values: ?string[],
   *     range: ?{min:number, max:number},
   *     comment: string,
   *     category: string
   *   }>}
   * @constant
   */
  const defaultOptions = {
    bloodbathOutcomeProbs: {
      value: {kill: 30, wound: 6, thrive: 8, revive: 0, nothing: 56},
      comment:
          'Relative probabilities of choosing an event with each outcome.' +
          ' This is for the bloodbath events.',
      category: 'probabilities',
    },
    playerOutcomeProbs: {
      value: {kill: 22, wound: 4, thrive: 8, revive: 6, nothing: 60},
      comment:
          'Relative probabilities of choosing an event with each outcome.' +
          ' This is for normal daily events.',
      category: 'probabilities',
    },
    arenaOutcomeProbs: {
      value: {kill: 64, wound: 10, thrive: 5, revive: 6, nothing: 15},
      comment:
          'Relative Probabilities of choosing an event with each outcome.' +
          ' This is for the special arena events.',
      category: 'probabilities',
    },
    arenaEvents: {
      value: true,
      comment:
          'Are arena events possible. (Events like wolf mutts, or a volcano ' +
          'erupting.)',
      category: 'probabilities',
    },
    includeBots: {
      value: false,
      comment: 'Should bots be included in the games. If this is false, bots ' +
          'cannot be added manually.',
      category: 'other',
    },
    excludeNewUsers: {
      value: false,
      comment: 'Should new users who join your server be excluded from the ' +
          'games by default. True will add all new users to the blacklist, ' +
          'false will put all new users into the next game automatically.',
      category: 'other',
    },
    allowNoVictors: {
      value: true,
      comment:
          'Should it be possible to end a game without any winners. If true, ' +
          'it is possible for every player to die, causing the game to end ' +
          'with everyone dead. False forces at least one winner.',
      category: 'features',
    },
    bleedDays: {
      value: 2,
      comment: 'Number of days a user can bleed before they can die.',
      category: 'other',
    },
    battleHealth: {
      value: 5,
      comment: 'The amount of health each user gets for a battle.',
      category: 'other',
    },
    teamSize: {
      value: 0,
      comment: 'Maximum size of teams when automatically forming teams. 0 to ' +
          'disable teams',
      category: 'other',
    },
    teammatesCollaborate: {
      value: true,
      comment: 'Will teammates work together. If false, teammates can kill ' +
          'eachother, and there will only be 1 victor. If true, teammates ' +
          'cannot kill eachother, and the game ends when one TEAM is ' +
          'remaining, not one player.',
      category: 'features',
    },
    useEnemyWeapon: {
      value: false,
      comment:
          'This will allow the attacker in an event to use the victim\'s ' +
          'weapon against them.',
      category: 'features',
    },
    mentionVictor: {
      value: true,
      comment:
          'Should the victor of the game (can be team), be tagged/mentioned ' +
          'so they get notified?',
      category: 'features',
    },
    mentionAll: {
      values: ['disabled', 'all', 'death'],
      value: 'disabled',
      comment:
          'Should a user be mentioned every time something happens to them ' +
          'in the game? (can be disabled, for all events, or for when the ' +
          'user dies)',
      category: 'features',
    },
    mentionEveryoneAtStart: {
      value: false,
      comment: 'Should @everyone be mentioned when the game is started?',
      category: 'features',
    },
    useNicknames: {
      value: false,
      comment: 'Should we use user\'s custom server nicknames instead of ' +
          'their account username? Names only change when a new game is ' +
          'created.',
      category: 'features',
    },
    delayEvents: {
      value: 3500,
      range: {min: 1000, max: 30000},
      time: true,
      comment: 'Delay in milliseconds between each event being printed.',
      category: 'other',
    },
    delayDays: {
      value: 7000,
      range: {min: 1000, max: 129600000},  // 1.5 days
      time: true,
      comment: 'Delay in milliseconds between each day being printed.',
      category: 'other',
    },
    probabilityOfArenaEvent: {
      value: 0.25,
      range: {min: 0, max: 1},
      percent: true,
      comment: 'Probability each day that an arena event will happen.',
      category: 'probabilities',
    },
    probabilityOfBleedToDeath: {
      value: 0.5,
      range: {min: 0, max: 1},
      percent: true,
      comment: 'Probability that after bleedDays a player will die. If they ' +
          'don\'t die, they will heal back to normal.',
      category: 'probabilities',
    },
    probabilityOfBattle: {
      value: 0.05,
      range: {min: 0, max: 1},
      percent: true,
      comment:
          'Probability of an event being replaced by a battle between two ' +
          'players.',
      category: 'probabilities',
    },
    probabilityOfUseWeapon: {
      value: 0.75,
      range: {min: 0, max: 1},
      percent: true,
      comment:
          'Probability of each player using their weapon each day if they ' +
          'have one.',
      category: 'probabilities',
    },
    eventAvatarSizes: {
      value: {avatar: 64, underline: 4, gap: 4},
      range: {min: 0, max: 512},
      comment:
          'The number of pixels each player\'s avatar will be tall and wide, ' +
          'the underline status height, and the gap between each avatar. This' +
          ' is for all normal events and arena event messages.',
      category: 'other',
    },
    battleAvatarSizes: {
      value: {avatar: 32, underline: 4, gap: 4},
      range: {min: 0, max: 512},
      comment:
          'The number of pixels each player\'s avatar will be tall and wide, ' +
          'the underline status height, and the gap between each avatar. This' +
          ' is for each battle turn.',
      category: 'other',
    },
    victorAvatarSizes: {
      value: {avatar: 80, underline: 4, gap: 4},
      range: {min: 0, max: 512},
      comment:
          'The number of pixels each player\'s avatar will be tall and wide, ' +
          'the underline status height, and the gap between each avatar. This' +
          ' is when announcing the winners of the game.',
      category: 'other',
    },
    disableOutput: {
      value: false,
      comment: 'Debugging purposes only. I mean, you can enable it, but it ma' +
          'kes the games really boring. Up to you ¯\\_(ツ)_/¯',
      category: 'other',
    },
  };

  const defaultOptSearcher = new FuzzySearch(Object.keys(defaultOptions));
  /**
   * Default options for a game.
   *
   * @type {Object.<{
   *     value: string|number|boolean,
   *     values: ?string[],
   *     comment: string
   *   }>}
   * @constant
   */
  this.defaultOptions = defaultOptions;

  /**
   * If a larger percentage of people die in one day than this value, then show
   * a relevant message.
   *
   * @private
   * @type {number}
   * @constant
   * @default
   */
  const lotsOfDeathRate = 0.75;
  /**
   * If a lower percentage of people die in one day than this value, then show a
   * relevant message.
   *
   * @private
   * @type {number}
   * @constant
   * @default
   */
  const littleDeathRate = 0.15;

  /**
   * Default color to choose for embedded messages.
   *
   * @private
   * @type {Discord~ColorResolveable}
   * @constant
   * @default
   */
  const defaultColor = [200, 125, 0];

  /**
   * Helper object of emoji characters mapped to names.
   *
   * @private
   * @type {Object.<string>}
   * @constant
   */
  const emoji = {
    x: '❌',
    white_check_mark: '✅',
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
    10: '\u{1F51F}',
    arrow_up: '⬆',
    arrow_down: '⬇',
    arrow_double_up: '⏫',
    arrow_double_down: '⏬',
    arrow_left: '⬅',
    arrow_right: '➡',
    arrow_double_left: '⏪',
    arrow_double_right: '⏩',
    arrows_counterclockwise: '🔄',
    crossed_swords: '⚔',
    shield: '🛡',
    heart: '❤',
    yellow_heart: '💛',
    broken_heart: '💔',
    skull: '💀',
    negative_squared_cross_mark: '❎',
    ballot_box_with_check: '☑',
    skull_crossbones: '☠',
    slight_smile: '🙂',
    question: '⚔',
    red_circle: '🔴',
    trophy: '🏆',
  };

  /**
   * The alphabet twice, first lowercase, then uppercase.
   *
   * @private
   * @type {string}
   * @constant
   * @default
   */
  const alph = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

  /**
   * Probability of each amount of people being chosen for an event. Must total
   * to 1.0
   *
   * @private
   * @type {Object}
   * @constant
   * @default
   */
  const multiEventUserDistribution = {
    1: 0.66,
    2: 0.259,
    3: 0.03,
    4: 0.02,
    5: 0.01,
    6: 0.015,
    7: 0.005,
    8: 0.0005,
    9: 0.0005,
  };

  /**
   * Probabilities for each choosing an event with each type of outcome.
   * @typedef {Object} HungryGames~OutcomeProbabilities}
   *
   * @property {number} kill Relative probability of events that can kill.
   * @property {number} wound Relative probability of events that can wound.
   * @property {number} thrive Relative probability of events that can heal.
   * @property {number} nothing Relative probability of events that do nothing.
   */

  /**
   * A singe instance of a game in a guild.
   * @typedef {Object} HungryGames~GuildGame
   *
   * @property {string[]} excludedUsers Array of user IDs that have been
   * excluded from the games.
   * @property {string[]} includedUsers Array of user IDs that will be included
   * in the next game to be created.
   * @property {Object.<number|boolean|string|Object>} options The game options.
   * @property {boolean} autoPlay Is the game currently autoplaying.
   * @property {string[]} excludedUsers The ids of the users to exclude from the
   * games.
   * @property {
   *   {
   *     bloodbath: HungryGames~Event[],
   *     player: HungryGames~Event[],
   *     weapon: HungryGames~WeaponEvent[],
   *     arena: HungryGames~ArenaEvent[]
   *   }
   * } customEvents All custom events for the guild.
   * @property {HungryGames~Game} currentGame The current game in the guild.
   */

  /**
   * The container with current game state within a guild's game.
   * @typedef {Object} HungryGames~Game
   *
   * @property {string} name The name of this game.
   * @property {boolean} inProgress Is the game currently in progress.
   * @property {HungryGames~Player[]} includedUsers Array of all users currently
   * in the game.
   * @property {HungryGames~Team[]} teams All teams in the game.
   * @property {Object[]} forcedOutcomes List of outcomes and players to force
   * before the end of the day. Does not affect the simulation, outcomes are
   * forced by appending events at the end of the simulated day.
   * @property {boolean} ended Has the game ended.
   * @property {{num: number, state: number, events: HungryGames~Event[]}} day
   * Information about the day that was simulated.
   */

  /**
   * All currently tracked games. Mapped by guild ID. In most cases you should
   * NOT reference this directly. Use {@link HungryGames~find} to get the game
   * object for a guild.
   * @see {@link HungryGames~find}
   *
   * @private
   * @type {Object.<HungryGames~GuildGame>}
   * @default
   */
  let games = {};
  /**
   * All messages to show for games. Parsed from file.
   * @see {@link HungryGames~messageFile}
   *
   * @private
   * @type {Object.<string[]>}
   * @default
   */
  let messages = {};
  /**
   * All attacks and outcomes for battles.
   * @see {@link HungryGames~battleFile}
   *
   * @private
   * @type {
   *  {
   *    starts: string[],
   *    attacks: HungryGames~Battle[],
   *    outcomes: string[]
   *   }
   * }
   */
  let battles = {};
  /**
   * All intervals for printing events.
   *
   * @private
   * @type {Object.<number>}
   * @default
   */
  let dayEventIntervals = {};
  /**
   * The timeout to continue autoplaying after the day ends. Used for cancelling
   * if user ends the game between days.
   *
   * @private
   * @type {Object.<number>}
   * @default
   */
  let autoPlayTimeout = {};
  /**
   * Storage of battle messages to edit the content of on the next update.
   *
   * @private
   * @type {Object.<Discord~Message>}
   * @default
   */
  let battleMessage = {};
  /**
   * All weapons and their respective actions. Parsed from file.
   * @see {@link HungryGames~weaponsFile}
   *
   * @private
   * @type {Object.<HungryGames~WeaponEvent>}
   * @default
   */
  let weapons = {};
  /**
   * Default parsed bloodbath events.
   * @see {@link HungryGames~eventFile}
   *
   * @private
   * @type {HungryGames~Event[]}
   */
  let defaultBloodbathEvents = [];
  /**
   * Default parsed player events.
   * @see {@link HungryGames~eventFile}
   *
   * @private
   * @type {HungryGames~Event[]}
   */
  let defaultPlayerEvents = [];
  /**
   * Default parsed arena events.
   * @see {@link HungryGames~eventFile}
   *
   * @private
   * @type {HungryGames~ArenaEvent[]}
   */
  let defaultArenaEvents = [];
  /**
   * Messages that the user sent with a new event to add, for storage while
   * getting the rest of the information about the event.
   *
   * @private
   * @type {Object.<Discord~Message>}
   * @default
   */
  let newEventMessages = {};
  /**
   * Messages I have sent showing current options.
   *
   * @private
   * @type {Object.<Discord~Message>}
   * @default
   */
  let optionMessages = {};

  /**
   * The last time the currently scheduled reaction event listeners are expected
   * to end. Used for checking of submoduleis unloadable.
   * @private
   * @type {number}
   */
  let listenersEndTime = 0;

  /**
   * Parse all default events from file.
   *
   * @private
   */
  function updateEvents() {
    fs.readFile(eventFile, function(err, data) {
      if (err) return;
      try {
        let parsed = JSON.parse(data);
        if (parsed) {
          defaultBloodbathEvents = deepFreeze(parsed['bloodbath']);
          defaultPlayerEvents = deepFreeze(parsed['player']);
          defaultArenaEvents = deepFreeze(parsed['arena']);
        }
      } catch (err) {
        console.log(err);
      }
    });
  }
  updateEvents();
  fs.watchFile(eventFile, function(curr, prev) {
    if (curr.mtime == prev.mtime) return;
    if (self.initialized) {
      self.debug('Re-reading default events from file');
    } else {
      console.log('HG: Re-reading default events from file');
    }
    updateEvents();
  });

  /**
   * Parse all messages from file.
   *
   * @private
   */
  function updateMessages() {
    fs.readFile(messageFile, function(err, data) {
      if (err) return;
      try {
        let parsed = JSON.parse(data);
        if (parsed) {
          messages = deepFreeze(parsed);
        }
      } catch (err) {
        console.log(err);
      }
    });
  }
  updateMessages();
  fs.watchFile(messageFile, function(curr, prev) {
    if (curr.mtime == prev.mtime) return;
    if (self.initialized) {
      self.debug('Re-reading messages from file');
    } else {
      console.log('HG: Re-reading messages from file');
    }
    updateMessages();
  });

  /**
   * Parse all battles from file.
   *
   * @private
   */
  function updateBattles() {
    fs.readFile(battleFile, function(err, data) {
      if (err) return;
      try {
        let parsed = JSON.parse(data);
        if (parsed) {
          battles = deepFreeze(parsed);
        }
      } catch (err) {
        console.log(err);
      }
    });
  }
  updateBattles();
  fs.watchFile(battleFile, function(curr, prev) {
    if (curr.mtime == prev.mtime) return;
    if (self.initialized) {
      self.debug('Re-reading battles from file');
    } else {
      console.log('HG: Re-reading battles from file');
    }
    updateBattles();
  });
  /**
   * Parse all weapons events from file.
   *
   * @private
   */
  function updateWeapons() {
    fs.readFile(weaponsFile, function(err, data) {
      if (err) return;
      try {
        let parsed = JSON.parse(data);
        if (parsed) {
          weapons = deepFreeze(parsed);
        }
      } catch (err) {
        console.log(err);
      }
    });
  }
  updateWeapons();
  fs.watchFile(weaponsFile, function(curr, prev) {
    if (curr.mtime == prev.mtime) return;
    if (self.initialized) {
      self.debug('Re-reading default weapons from file');
    } else {
      console.log('HG: Re-reading default weapons from file');
    }
    updateWeapons();
  });

  /**
   * Reply to help on a server.
   *
   * @private
   * @type {string}
   * @default
   */
  const helpmessagereply = 'I sent you a DM with commands!';
  /**
   * Reply if unable to send message via DM.
   *
   * @private
   * @type {string}
   * @default
   */
  const blockedmessage =
      'I couldn\'t send you a message, you probably blocked me :(';
  /**
   * The object that stores all data to be formatted into the help message.
   *
   * @private
   * @constant
   */
  const helpObject = JSON.parse(fs.readFileSync('./docs/hgHelp.json'));
  /** @inheritdoc */
  this.helpMessage = 'Module loading...';

  /**
   * Set all help messages once we know what prefix to use.
   *
   * @private
   */
  function setupHelp() {
    const prefix = self.bot.getPrefix() + self.postPrefix;
    self.helpMessage = '`' + prefix + 'help` for Hungry Games help.';
    // Format help message into rich embed.
    let tmpHelp = new self.Discord.MessageEmbed();
    tmpHelp.setTitle(helpObject.title);
    tmpHelp.setURL(
        self.common.webURL + '#' + encodeURIComponent(helpObject.title));
    tmpHelp.setDescription(
        helpObject.description.replaceAll('{hgRole}', roleName));
    helpObject.sections.forEach(function(obj) {
      let titleID = encodeURIComponent(obj.title);
      let titleURL = '[web](' + self.common.webURL + '#' + titleID + ')';
      tmpHelp.addField(
          obj.title, titleURL + '```js\n' +
              obj.rows
                  .map(function(row) {
                    if (typeof row === 'string') {
                      return prefix + row.replaceAll('{prefix}', prefix);
                    } else if (typeof row === 'object') {
                      return prefix +
                          row.command.replaceAll('{prefix}', prefix) + ' // ' +
                          row.description.replaceAll('{prefix}', prefix);
                    }
                  })
                  .join('\n') +
              '\n```',
          true);
    });
    tmpHelp.addField(
        'Web Interface', '[Hungry Games Online Control](' + self.common.webURL +
            'hg/)```Manage the Games without using commands!\n' +
            self.common.webURL + 'hg/```',
        true);
    self.helpMessage = tmpHelp;
  }

  /** @inheritdoc */
  this.initialize = function() {
    const cmdOpts = {
      validOnlyInGuild: true,
      defaultDisabled: true,
      permissions: self.Discord.Permissions.FLAGS.MANAGE_ROLES |
          self.Discord.Permissions.FLAGS.MANAGE_GUILD |
          self.Discord.Permissions.FLAGS.MANAGE_CHANNELS,
    };
    let subCmds = [
      new self.command.SingleCommand('help', help),
      new self.command.SingleCommand('makemewin', commandMakeMeWin),
      new self.command.SingleCommand('makemelose', commandMakeMeLose),
      new self.command.SingleCommand(
          ['create', 'c', 'new'], mkCmd(createGame), cmdOpts),
      new self.command.SingleCommand(['reset'], mkCmd(resetGame), cmdOpts),
      new self.command.SingleCommand(['debug'], mkCmd(showGameInfo), cmdOpts),
      new self.command.SingleCommand(
          ['debugevents'], mkCmd(showGameEvents), cmdOpts),
      new self.command.SingleCommand(
          ['exclude', 'remove', 'exc', 'ex'], mkCmd(excludeUser), cmdOpts),
      new self.command.SingleCommand(
          ['include', 'add', 'inc', 'in'], mkCmd(includeUser), cmdOpts),
      new self.command.SingleCommand(
          [
            'options',
            'setting',
            'settings',
            'set',
            'option',
            'opt',
            'opts',
          ],
          mkCmd(toggleOpt), cmdOpts),
      new self.command.SingleCommand(
          ['events', 'event'], mkCmd(listEvents), cmdOpts,
          [
            new self.command.SingleCommand(
                ['add', 'create'], mkCmd(createEvent), cmdOpts),
            new self.command.SingleCommand(
                ['remove', 'delete'], mkCmd(removeEvent), cmdOpts),
            new self.command.SingleCommand(
                ['toggle', 'enable', 'disable'], mkCmd(commandToggleEvent),
                cmdOpts),
          ]),
      new self.command.SingleCommand(
          ['players', 'player'], mkCmd(listPlayers), cmdOpts),
      new self.command.SingleCommand(
          ['start', 's', 'begin'], mkCmd(startGame), cmdOpts),
      new self.command.SingleCommand(
          ['pause', 'p'], mkCmd(pauseAutoplay), cmdOpts),
      new self.command.SingleCommand(
          ['autoplay', 'autostart', 'auto', 'resume', 'play', 'go'],
          mkCmd(startAutoplay), cmdOpts),
      new self.command.SingleCommand(
          ['next', 'nextday'], mkCmd(nextDay), cmdOpts),
      new self.command.SingleCommand(
          ['end', 'abort', 'stop'], mkCmd(endGame), cmdOpts),
      new self.command.SingleCommand(
          ['save'],
          function(msg) {
            self.save('async');
            msg.channel.send('`Saving all data.`');
          },
          cmdOpts),
      new self.command.SingleCommand(
          ['team', 'teams', 't'], mkCmd(editTeam), cmdOpts),
      new self.command.SingleCommand(['stats'], mkCmd(commandStats), cmdOpts),
      new self.command.SingleCommand(
          ['rig', 'rigged'], mkCmd(commandRig), cmdOpts),
      new self.command.SingleCommand(
          ['kill', 'smite'], mkCmd(commandKill), cmdOpts),
      new self.command.SingleCommand(
          ['heal', 'revive', 'thrive', 'resurrect', 'restore'],
          mkCmd(commandHeal), cmdOpts),
      new self.command.SingleCommand(
          ['wound', 'hurt', 'damage', 'stab', 'punch', 'slap', 'injure'],
          mkCmd(commandWound), cmdOpts),
    ];
    self.command.on(
        new self.command.SingleCommand('hg', function(msg) {
          self.common.reply(
              msg, 'Oh noes! I can\'t understand that! "' + msg.prefix +
                  self.postPrefix + 'help" for help.');
        }, null, subCmds));

    setupHelp();

    self.client.on('messageUpdate', handleMessageEdit);

    self.client.guilds.forEach((g) => {
      let game = find(g.id);
      if (!game) return;

      if (game.currentGame.day.state > 1 && game.currentGame.inProgress &&
          !game.currentGame.ended) {
        self.nextDay(game.author, g.id, game.outputChannel);
      } else {
        delete games[g.id];
        delete findTimestamps[g.id];
      }
    });

    try {
      Web = require('./web/hg.js');
      web = new Web(self);
    } catch (err) {
      console.log(err);
    }
  };

  /** @inheritdoc */
  this.shutdown = function() {
    self.command.deleteEvent('hg');
    self.client.removeListener('messageUpdate', handleMessageEdit);
    process.removeListener('exit', exit);
    process.removeListener('SIGINT', sigint);
    process.removeListener('SIGHUP', sigint);
    process.removeListener('SIGTERM', sigint);
    if (web) web.shutdown();
    web = null;
    delete require.cache[require.resolve('./web/hg.js')];

    fs.unwatchFile(eventFile);
    fs.unwatchFile(messageFile);
    fs.unwatchFile(battleFile);
    fs.unwatchFile(weaponsFile);
  };

  /** @inheritdoc */
  this.unloadable = function() {
    return self.getNumSimulating() === 0 && listenersEndTime < Date.now() &&
        (!web || web.getNumClients() == 0);
  };

  /**
   * Returns a reference to the current games object for a given guild.
   *
   * @public
   * @param {string} id The guild id to get the data for.
   * @return {?HungryGames~GuildGame} The current object storing all data about
   * game in a guild.
   */
  this.getGame = function(id) {
    return find(id);
  };

  /**
   * Handler for when the create event message is edited and we should update
   * our message with the updated event.
   *
   * @private
   * @param {Discord~Message} oldMsg The message before being edited.
   * @param {Discord~Message} newMsg The message after being edited.
   * @listens Discord~Client#messageUpdate
   */
  function handleMessageEdit(oldMsg, newMsg) {
    if (newEventMessages[oldMsg.id]) {
      newMsg.text = newMsg.text.trim();
      newMsg.myResponse = oldMsg.myResponse;
      newEventMessages[oldMsg.id] = newMsg;
      updateEventPreview(newMsg);
    }
  }

  /**
   * Make a subcommand handler with the given callback function. This is a
   * wrapper around existing functions.
   * @private
   * @param {HungryGames~hgCommandHandler} cb Command handler when subcommand is
   * triggered.
   * @return {Command~commandHandler} Subcommand initial handler that will fire
   * when command is fired. Calls the passed callback handler with the mapped
   * parameters.
   */
  function mkCmd(cb) {
    return function(msg) {
      const id = msg.guild.id;
      if (find(id)) {
        find(id).channel = msg.channel.id;
        find(id).author = msg.author.id;
      }
      cb(msg, id);
    };
  }

  /**
   * Tell a user their chances of winning have not increased.
   *
   * @private
   * @type {commandHandler}
   * @param {Discord~Message} msg Message that triggered command.
   * @listens Command#hg makemelose
   */
  function commandMakeMeWin(msg) {
    self.common.reply(msg, 'Everyone\'s probability of winning has increased!');
  }

  /**
   * Tell a user their chances of losing have not increased.
   *
   * @private
   * @type {commandHandler}
   * @param {Discord~Message} msg Message that triggered command.
   * @listens Command#hg makemelose
   */
  function commandMakeMeLose(msg) {
    self.common.reply(
        msg, 'Your probability of losing has increased by ' + nothing() + '!');
  }

  /**
   * Handler for a Hungry Games command.
   *
   * @callback HungryGames~hgCommandHandler
   * @param {Discord~Message} msg The message sent in Discord that triggered
   * this command.
   * @param {string} id The id of the guild this command was run on for
   * convenience.
   */

  /**
   * @classdesc Serializable container for data pertaining to a single user.
   * @class
   *
   * @param {string} id The id of the user this object is representing.
   * @param {string} username The name of the user to show in the game.
   * @param {string} avatarURL URL to avatar to show for the user in the game.
   * @param {?string} [nickname=null] The nickname for this user usually
   * assigned by the guild. If the user does not have a nickname, this will have
   * the same value as `name`.
   * @property {string} id The id of the User this Player represents.
   * @property {string} name The name of this Player.
   * @property {string} avatarURL The URL to the discord avatar of the User.
   * @property {string} nickname The nickname for this user usually assigned by
   * the guild. If the user does not have a nickname, this will have the same
   * value as `name`.
   * @property {boolean} living Is the player still alive.
   * @property {number} bleeding How many days has the player been wounded.
   * @property {number} rank The current rank of the player in the game.
   * @property {string} state The current player state (normal, wounded, dead,
   * zombie).
   * @property {number} kills The number of players this player has caused to
   * die.
   * @property {Object.<number>} weapons The weapons the player currently has
   * and how many of each.
   * @property {Object} settings Custom settings for this user associated with
   * the games.
   */
  function Player(id, username, avatarURL, nickname = null) {
    // Replace backtick with Unicode 1FEF Greek Varia because it looks the same,
    // but it wont ruin formatting.
    username = username.replaceAll('`', '`');
    if (typeof nickname === 'string') nickname = nickname.replaceAll('`', '`');
    // User id.
    this.id = id;
    // Username.
    this.name = username;
    // URL TO user's current avatar.
    this.avatarURL = avatarURL;
    // Nickname for this user.
    this.nickname = nickname || username;
    // If this user is still alive.
    this.living = true;
    // If this user is will die at the end of the day.
    this.bleeding = 0;
    // The rank at which this user died.
    this.rank = 1;
    // Health state.
    this.state = 'normal';
    // Number of kills this user has for the game.
    this.kills = 0;
    // Map of the weapons this user currently has, and how many of each.
    this.weapons = {};
    // Custom settings for the games associated with this player.
    this.settings = {};
  };

  /**
   * @classdesc Serializable container for data about a team in a game.
   * @class
   *
   * @param {string|number} id The id unique to a guild for this team.
   * @param {string} name The name of this team.
   * @param {string[]} players Array of player ids on the team.
   * @property {string} id The unique id unique to a guild for this team.
   * @property {string} name The name of this team.
   * @property {string[]} players Array of player ids on the team.
   * @property {number} rank The current team rank.
   * @property {number} numAlive The number of players on the team still alive.
   */
  function Team(id, name, players) {
    // The identifier for this team unique to the server.
    this.id = id;
    // The name of the team to show users.
    this.name = name.slice(0, 101);
    // The array of player ids on this team.
    this.players = players;
    // The final rank this team placed once the final member has died.
    this.rank = 1;
    // Number of players still alive on this team.
    this.numAlive = players.length;
  };
  this.Team = Team;

  /**
   * @classdesc Event that can happen in a game.
   * @class
   *
   * @param {string} message The message to show.
   * @param {number} [numVictim=0] The number of victims in this event.
   * @param {number} [numAttacker=0] The number of attackers in this event.
   * @param {string} [victimOutcome=nothing] The outcome of the victims from
   * this event.
   * @param {string} [attackerOutcome=nothing] The outcome of the attackers
   * from this event.
   * @param {boolean} [victimKiller=false] Do the victims kill anyone in this
   * event. Used for calculating kill count.
   * @param {boolean} [attackerKiller=false] Do the attackers kill anyone in
   * this event. Used for calculating kill count.
   * @param {boolean} [battle] Is this event a battle?
   * @param {number} [state=0] State of event if there are multiple attacks
   * before the event.
   * @param {HungryGames~Event[]} [attacks=[]] Array of attacks that take place
   * before the event.
   * @property {string} message The message to show.
   * @property {string} [action] The action to format into a message if this is
   * a weapon event.
   * @property {{count: number, outcome: string, killer: boolean, weapon:
   * ?Object}} victim Information about the victims in this event.
   * @property {{count: number, outcome: string, killer: boolean, weapon:
   * ?Object}} attacker Information about the attackers in this event.
   * @property {{name: string, count: number}} victim.weapon The weapon
   * information to give to the player.
   * @property {{name: string, count: number}} attacker.weapon The weapon
   * information to give to the player.
   * @property {boolean} battle Is this event a battle event.
   * @property {number} state The current state of printing the battle messages.
   * @property {HungryGames~Event[]} attacks The attacks in a battle to show
   * before the message.
   * @property {number|string} [consumes] Amount of consumables used if this is
   * a weapon event.
   */
  function Event(
      message, numVictim = 0, numAttacker = 0, victimOutcome = 'nothing',
      attackerOutcome = 'nothing', victimKiller = false, attackerKiller = false,
      battle = false, state = 0, attacks = []) {
    this.message = message;
    this.victim = {
      count: numVictim,
      outcome: victimOutcome,
      killer: victimKiller,
      weapon: null,
    };
    this.attacker = {
      count: numAttacker,
      outcome: attackerOutcome,
      killer: attackerKiller,
      weapon: null,
    };
    this.battle = battle;
    this.state = state;
    this.attacks = attacks;
  }
  this.Event = Event;

  /**
   * A single battle in an Event.
   * @typedef {Object} HungryGames~Battle
   *
   * @property {string} message The message of this battle event.
   * @property {{damage: number}} attacker The damage done to the attacker.
   * @property {{damage: number}} victim The damage done to the victim.
   */
  /**
   * An Arena event storing Events.
   * @typedef {Object} HungryGames~ArenaEvent
   *
   * @property {string} message The message at the start of the arena event.
   * @property {?{kill: number, wound: number, thrive: number, nothing: number}}
   * outcomeProbs Overrides the global setting for arena event outcome
   * probabilities for this event.
   * @property {HungryGames~Event[]} outcomes All possible events in this arena
   * event.
   */
  /**
   * An Arena event storing Events.
   * @typedef {Object} HungryGames~WeaponEvent
   *
   * @property {string} [name] Formattable name to use as the human readable
   * weapon name.
   * @property {string} [consumable] The formattable string for what to call
   * this weapons consumable items.
   * @property {HungryGames~Event[]} outcomes All possible events in this weapon
   * event.
   */

  /**
   * Create a Player from a given Discord.User.
   *
   * @private
   * @param {Discord~User|Discord~GuildMember} member User or GuildMember to
   * make a Player from.
   * @return {HungryGames~Player} Player object created from User.
   */
  function makePlayer(member) {
    let user = member.user || member;
    return new Player(
        user.id, user.username, user.displayAvatarURL({format: 'png'}),
        member.nickname);
  }

  /**
   * Delay a message to send at the given time in milliseconds since epoch.
   *
   * @private
   * @param {Discord~TextChannel} channel The channel to send the message in.
   * @param {
   *          Discord~StringResolvable|
   *          Discord~MessageOptions|
   *          Discord~MessageEmbed|
   *          Discord~MessageAttachment|
   *          Discord~MessageAttachment[]
   * } one The message to send.
   * @param {
   *          Discord~StringResolvable|
   *          Discord~MessageOptions|
   *          Discord~MessageEmbed|
   *          Discord~MessageAttachment|
   *          Discord~MessageAttachment[]
   * } two The message to send.
   * @param {number} time The time to send the message in milliseconds since
   * epoch.
   */
  function sendAtTime(channel, one, two, time) {
    if (time <= Date.now()) {
      channel.send(one, two).catch((err) => {
        self.error('Failed to send message to channel: ' + channel.id);
        console.error(err);
      });
    } else {
      self.client.setTimeout(function() {
        sendAtTime(channel, one, two, time);
      }, time - Date.now());
    }
  }

  /**
   * Returns an object storing all of the default events for the games.
   *
   * @public
   * @return {{bloodbath: Object, player: Object, arena: Object}}
   */
  this.getDefaultEvents = function() {
    return {
      bloodbath: defaultBloodbathEvents,
      player: defaultPlayerEvents,
      weapon: weapons,
      arena: defaultArenaEvents,
    };
  };

  // Create //
  /**
   * Create a Hungry Games for a guild.
   *
   * @private
   * @type {HungryGames~hgCommandHandler}
   * @param {?Discord~Message} msg The message that lead to this being called.
   * @param {string} id The id of the guild this was triggered from.
   * @param {boolean} [silent=false] Should we suppress replies to message.
   * @param {function} [cb] Callback that fires once loading is complete. No
   * parameters.
   */
  function createGame(msg, id, silent, cb) {
    if (!msg) {
      silent = true;
      msg = {};
      msg.guild = self.client.guilds.get(id);
    }
    if (find(id) && find(id).currentGame &&
        find(id).currentGame.inProgress) {
      if (!silent) {
        self.common.reply(
            msg,
            'This server already has a Hungry Games in progress. If you wish ' +
                'to create a new one, you must end the current one first ' +
                'with "' + msg.prefix + self.postPrefix + 'end".');
      }
      return;
    } else if (find(id) && find(id).currentGame) {
      if (!silent) {
        self.common.reply(
            msg, 'Creating a new game with settings from the last game.');
      }
      find(id).currentGame.ended = false;
      find(id).currentGame.day = {num: -1, state: 0, events: []};
      find(id).currentGame.includedUsers = getAllPlayers(
          msg.guild.members, find(id).excludedUsers,
          find(id).options.includeBots, find(id).includedUsers,
          find(id).options.excludeNewUsers);
      find(id).currentGame.numAlive =
          find(id).currentGame.includedUsers.length;
      find(id).currentGame.forcedOutcomes = [];
    } else if (find(id)) {
      if (!silent) {
        self.common.reply(msg, 'Creating a new game with default settings.');
      }
      find(id).currentGame = {
        name: msg.guild.name + '\'s Hungry Games',
        inProgress: false,
        includedUsers: getAllPlayers(
            msg.guild.members, find(id).excludedUsers,
            find(id).options.includeBots, find(id).includedUsers,
            find(id).options.excludeNewUsers),
        ended: false,
        day: {num: -1, state: 0, events: []},
        forcedOutcomes: [],
      };
      find(id).currentGame.numAlive =
          find(id).currentGame.includedUsers.length;
    } else {
      games[id] = {
        excludedUsers: [],
        includedUsers: [],
        disabledEvents: {bloodbath: [], player: [], arena: {}, weapon: {}},
        customEvents: {bloodbath: [], player: [], arena: [], weapon: {}},
        currentGame: {
          name: msg.guild.name + '\'s Hungry Games',
          inProgress: false,
          teams: [],
          ended: false,
          day: {num: -1, state: 0, events: []},
          forcedOutcomes: [],
        },
        autoPlay: false,
      };
      games[id].currentGame.includedUsers = getAllPlayers(
          msg.guild.members, games[id].excludedUsers, false,
          games[id].includedUsers, false);
      find(id).currentGame.numAlive =
          find(id).currentGame.includedUsers.length;
      const optKeys = Object.keys(defaultOptions);
      find(id).options = {};
      for (let i in optKeys) {
        if (typeof optKeys[i] !== 'string') continue;
        find(id).options[optKeys[i]] = defaultOptions[optKeys[i]].value;
      }
      if (!silent) {
        self.common.reply(
            msg,
            'Created a Hungry Games with default settings and all members ' +
                'included.');
      }
    }
    formTeams(id);
    fetchPatreonSettings(find(id).currentGame.includedUsers, null, null, cb);
  }
  /**
   * Create a Hungry Games for a guild.
   *
   * @public
   * @param {string} id The id of the guild to create the game in.
   */
  this.createGame = function(id) {
    createGame(null, id, true);
  };

  /**
   * Given an array of players, lookup the settings for each and update their
   * data. This is asynchronous.
   * @private
   *
   * @param {HungryGames~Player[]} players The players to lookup and update.
   * @param {?string|number} cId The channel ID to fetch the settings for.
   * @param {?string|number} gId The guild ID to fetch the settings for.
   * @param {function} [cb] Calls this callback on completion. No parameters.
   */
  function fetchPatreonSettings(players, cId, gId, cb) {
    if (!self.bot.patreon || players.length == 0) {
      if (cb) cb();
      return;
    }
    let permResponses = 0;
    let settingRequests = 0;
    let settingResponses = 0;

    /**
     * After retrieving whether the player is an actual patron (ignores
     * overrides), then fetch permissions from them (uses overrides).
     * @private
     *
     * @param {?string} err Error string or null.
     * @param {?{status: string[], message: string}} info Permission
     * information.
     * @param {number} p Player object to update.
     */
    function onCheckPatron(err, info, p) {
      if (!err) {
        if (info.status) {
          p.settings['isPatron'] = true;
        }
      }
      self.bot.patreon.getAllPerms(p.id, cId, gId, function(err, info) {
        onPermResponse(err, info, p);
      });
    }
    /**
     * After retrieving a player's permissions, fetch their settings for each.
     * @private
     * @param {?string} err Error string or null.
     * @param {?{status: string[], message: string}} info Permission
     * information.
     * @param {number} p Player object to update.
     */
    function onPermResponse(err, info, p) {
      permResponses++;
      if (err) {
        if (permResponses === players.length &&
            settingRequests === settingResponses && cb) {
          cb();
        }
        return;
      }
      let values = info.status;
      for (let i = 0; i < values.length; i++) {
        if (!patreonSettingKeys.includes(values[i])) continue;
        settingRequests++;
        self.bot.patreon.getSettingValue(
            p.id, cId, gId, values[i], (function(p, v) {
              return function(err, info) {
                onSettingResponse(err, info, p, v);
              };
            })(p, values[i]));
      }
      if (permResponses === players.length &&
          settingRequests === settingResponses && cb) {
        cb();
      }
    }

    /**
     * After retrieving a player's settings, update their data with the relevant
     * values.
     * @private
     * @param {?string} err Error string or null.
     * @param {?{status: *, message: string}} info Permission information.
     * @param {number} p Player object to update.
     * @param {string} setting The setting name to update.
     */
    function onSettingResponse(err, info, p, setting) {
      settingResponses++;
      if (err) {
        self.error(err);
      } else {
        p.settings[setting] = info.status;
      }
      if (permResponses === players.length &&
          settingRequests === settingResponses && cb) {
        cb();
      }
    }

    for (let i = 0; i < players.length; i++) {
      self.bot.patreon.checkPerm(players[i].id, null, (function(p) {
        return function(err, info) {
          onCheckPatron(err, info, p);
        };
      })(players[i]));
    }
  }

  /**
   * Form an array of Player objects based on guild members, excluded members,
   * and whether to include bots.
   *
   * @private
   * @param {Discord~Collection<Discord~GuildMember>} members All members in
   * guild.
   * @param {string[]} excluded Array of ids of users that should not be
   * included in the games.
   * @param {boolean} bots Should bots be included in the games.
   * @param {string[]} included Array of ids of users that should be included in
   * the games. Used if excludeByDefault is true.
   * @param {boolean} excludeByDefault Should new users be excluded from the
   * game by default?
   * @return {HungryGames~Player[]} Array of players to include in the games.
   */
  function getAllPlayers(members, excluded, bots, included, excludeByDefault) {
    let finalMembers = [];
    if (!bots || Array.isArray(excluded)) {
      finalMembers = members.filter(function(obj) {
        if (included && excluded &&
            !included.includes(obj.user.id) &&
            !excluded.includes(obj.user.id)) {
          if (excludeByDefault) {
            excluded.push(obj.user.id);
          } else {
            included.push(obj.user.id);
          }
        } else if (
          included && excluded && included.includes(obj.user.id) &&
            excluded.includes(obj.user.id)) {
          self.error(
              'User in both blacklist and whitelist: ' + obj.user.id +
              ' Guild: ' + obj.guild.id);
          if (excludeByDefault) {
            included.splice(
                included.findIndex((el) => {
                  return el == obj.user.id;
                }),
                1);
          } else {
            excluded.splice(
                excluded.findIndex((el) => {
                  return el == obj.user.id;
                }),
                1);
          }
        }
        return !(
          (!bots && obj.user.bot) ||
            (excluded && excluded.includes(obj.user.id) ||
             (excludeByDefault && included &&
              !included.includes(obj.user.id))));
      });
    }
    if (finalMembers.length == 0) finalMembers = members.slice();
    return finalMembers.map((obj) => {
      return new Player(
          obj.id, obj.user.username, obj.user.displayAvatarURL({format: 'png'}),
          obj.nickname);
    });
  }
  /**
   * Add users to teams, and remove excluded users from teams. Deletes empty
   * teams, and adds teams once all teams have teamSize of players.
   *
   * @private
   * @param {string} id Id of guild where this was triggered from.
   */
  function formTeams(id) {
    let game = find(id);
    if (game.options.teamSize < 0) game.options.teamSize = 0;
    if (game.options.teamSize == 0) {
      game.currentGame.teams = [];
      return;
    }

    let corruptTeam = false;

    let teamSize = game.options.teamSize;
    let numTeams = Math.ceil(game.currentGame.includedUsers.length / teamSize);
    // If teams already exist, update them. Otherwise, create new teams.
    if (game.currentGame.teams && game.currentGame.teams.length > 0) {
      game.currentGame.teams.forEach(function(obj) {
        obj.players.forEach(function(p) {
          if (typeof p !== 'string' && typeof p !== 'number') {
            corruptTeam = true;
            self.error(
                '(PreTeamForm) Player in team is invalid: ' + typeof p +
                ' in team ' + obj.id + ' guild: ' + id + ' players: ' +
                JSON.stringify(obj.players));
          }
        });
      });

      game.currentGame.teams.sort(function(a, b) {
        return a.id - b.id;
      });
      let notIncluded = game.currentGame.includedUsers.slice(0);
      // Remove players from teams if they are no longer included in game.
      for (let i = 0; i < game.currentGame.teams.length; i++) {
        let team = game.currentGame.teams[i];
        team.id = i;
        for (let j = 0; j < team.players.length; j++) {
          if (game.currentGame.includedUsers.findIndex(function(obj) {
            return obj.id === team.players[j];
          }) < 0) {
            team.players.splice(j, 1);
            j--;
          } else {
            notIncluded.splice(
                notIncluded.findIndex(function(obj) {
                  return obj.id === team.players[j];
                }),
                1);
          }
        }
        if (team.players.length == 0) {
          game.currentGame.teams.splice(i, 1);
          i--;
        }
      }
      // Add players who are not on a team, to a team.
      for (let i = 0; i < notIncluded.length; i++) {
        let found = false;
        for (let j = 0; j < game.currentGame.teams.length; j++) {
          let team = game.currentGame.teams[j];
          if (team.players.length < teamSize) {
            team.players.push(notIncluded[i].id);
            found = true;
            break;
          }
        }
        if (found) continue;
        // Add a team if all existing teams are full.
        game.currentGame.teams[game.currentGame.teams.length] = new Team(
            game.currentGame.teams.length,
            'Team ' + (game.currentGame.teams.length + 1), [notIncluded[i].id]);
      }
    } else {
      // Create all teams for players.
      game.currentGame.teams = [];
      for (let i = 0; i < numTeams; i++) {
        game.currentGame.teams[i] = new Team(
            i, 'Team ' + (i + 1),
            game.currentGame.includedUsers
                .slice(i * teamSize, i * teamSize + teamSize)
                .map(function(obj) {
                  return obj.id;
                }));
      }
    }
    // Reset team data.
    game.currentGame.teams.forEach(function(obj) {
      obj.numAlive = obj.players.length;
      obj.rank = 1;
      obj.players.forEach(function(p) {
        if (typeof p !== 'string' && typeof p !== 'number') {
          corruptTeam = true;
          self.error(
              '(PostTeamForm) Player in team is invalid: ' + typeof p +
              ' in team ' + obj.id + ' guild: ' + id + ' players: ' +
              JSON.stringify(obj.players));
        }
      });
    });

    if (corruptTeam) {
      self.client.channels.get(game.channel)
          .send(
              '<@' + game.author +
              '>\n```\nTeams appeared to be corrupted, teams may have been ' +
              'rearranged.\n```\nThis error has been reported and is being ' +
              'looked into.');
    }
  }
  /**
   * Reset data that the user specifies.
   *
   * @private
   * @type {HungryGames~hgCommandHandler}
   * @param {Discord~Message} msg The message that lead to this being called.
   * @param {string} id The id of the guild this was triggered from.
   */
  function resetGame(msg, id) {
    const command = msg.text.trim().split(' ')[0];
    self.common.reply(msg, 'Reset HG', self.resetGame(id, command));
  }
  /**
   * Reset the specified category of data from a game.
   *
   * @public
   * @param {string} id The id of the guild to modify.
   * @param {string} command The category of data to reset.
   * @return {string} The message explaining what happened.
   */
  this.resetGame = function(id, command) {
    if (find(id)) {
      if (command == 'all') {
        delete games[id];
        rimraf(self.common.guildSaveDir + id + hgSaveDir, function(err) {
          if (!err) return;
          self.error(
              'Failed to delete directory: ' + self.common.guildSaveDir + id +
              hgSaveDir);
          console.error(err);
        });
        return 'Resetting ALL Hungry Games data for this server!';
      } else if (command == 'events') {
        find(id).customEvents =
            {bloodbath: [], player: [], arena: [], weapon: {}};
        return 'Resetting ALL Hungry Games events for this server!';
      } else if (command == 'current') {
        delete find(id).currentGame;
        return 'Resetting ALL data for current game!';
      } else if (command == 'options') {
        const optKeys = Object.keys(defaultOptions);
        find(id).options = {};
        for (let i in optKeys) {
          if (typeof optKeys[i] !== 'string') continue;
          find(id).options[optKeys[i]] = defaultOptions[optKeys[i]].value;
        }
        return 'Resetting ALL options!';
      } else if (command == 'teams') {
        find(id).currentGame.teams = [];
        formTeams(id);
        return 'Resetting ALL teams!';
      } else if (command == 'users') {
        find(id).includedUsers = [];
        find(id).excludedUsers = [];
        return 'Resetting ALL user data!';
      } else {
        return 'Please specify what data to reset.\nall {deletes all data ' +
            'for this server},\nevents {deletes all custom events},\n' +
            'current {deletes all data about the current game},\noptions ' +
            '{resets all options to default values},\nteams {delete all ' +
            'teams and creates new ones},\nusers {delete data about where to ' +
            'put users when creating a new game}.';
      }
    } else {
      return 'There is no data to reset. Start a new game with "' +
          self.bot.getPrefix(id) + self.postPrefix + 'create".';
    }
  };
  /**
   * Send all of the game data about the current server to the chat.
   *
   * @private
   * @type {HungryGames~hgCommandHandler}
   * @param {Discord~Message} msg The message that lead to this being called.
   * @param {string} id The id of the guild this was triggered from.
   */
  function showGameInfo(msg, id) {
    let finalId = id;
    if (msg.author.id == self.common.spikeyId) {
      if (msg.text.trim().split(' ')[0]) {
        finalId = msg.text.trim().split(' ')[0];
      }
    }
    if (find(finalId)) {
      let file = new self.Discord.MessageAttachment();
      file.setFile(Buffer.from(JSON.stringify(find(finalId), null, 2)));
      file.setName('HG-' + finalId + '.json');
      msg.channel.send('HG Data for guild ' + finalId, file);
    } else {
      self.common.reply(msg, 'No game created', finalId);
    }
  }
  /**
   * Send all event data about the default events to the chat.
   *
   * @private
   * @type {HungryGames~hgCommandHandler}
   * @param {Discord~Message} msg The message that lead to this being called.
   * @param {string} id The id of the guild this was triggered from.
   */
  function showGameEvents(msg, id) {
    let events = defaultBloodbathEvents;
    if (find(id) && find(id).customEvents.bloodbath) {
      events = events.concat(find(id).customEvents.bloodbath);
    }
    let file = new self.Discord.MessageAttachment();
    file.setFile(Buffer.from(JSON.stringify(events, null, 2)));
    file.setName('BloodbathEvents.json');
    fetchStats(events);
    msg.channel.send(
        'Bloodbath Events (' + events.length + ') ' +
            Math.round(events.numKill / events.length * 1000) / 10 +
            '% kill, ' +
            Math.round(events.numWound / events.length * 1000) / 10 +
            '% wound, ' +
            Math.round(events.numThrive / events.length * 1000) / 10 +
            '% heal.',
        file);

    events = defaultPlayerEvents;
    if (find(id) && find(id).customEvents.player) {
      events = events.concat(find(id).customEvents.player);
    }
    file = new self.Discord.MessageAttachment();
    file.setFile(Buffer.from(JSON.stringify(events, null, 2)));
    file.setName('PlayerEvents.json');
    fetchStats(events);
    msg.channel.send(
        'Player Events (' + events.length + ') ' +
            Math.round(events.numKill / events.length * 1000) / 10 +
            '% kill, ' +
            Math.round(events.numWound / events.length * 1000) / 10 +
            '% wound, ' +
            Math.round(events.numThrive / events.length * 1000) / 10 +
            '% heal.',
        file);

    events = Object.assign({}, weapons);
    if (find(id) && find(id).customEvents.weapon) {
      const keys = Object.keys(find(id).customEvents.weapon);
      for (let i = 0; i < keys.length; i++) {
        if (events[keys[i]]) {
          events[keys[i]].outcomes = events[keys[i]].outcomes.concat(
              find(id).customEvents.weapon[keys[i]].outcomes);
        } else {
          events[keys[i]] = find(id).customEvents.weapon[keys[i]];
        }
      }
    }
    file = new self.Discord.MessageAttachment();
    file.setFile(Buffer.from(JSON.stringify(events, null, 2)));
    file.setName('WeaponEvents.json');
    msg.channel.send(
        'Weapon Events (' + Object.keys(events).length + ' weapons)', file);

    events = defaultArenaEvents;
    if (find(id) && find(id).customEvents.arena) {
      events = events.concat(find(id).customEvents.arena);
    }
    file = new self.Discord.MessageAttachment();
    file.setFile(Buffer.from(JSON.stringify(events, null, 2)));
    file.setName('ArenaEvents.json');
    msg.channel.send('Arena Events (' + events.length + ')', file);
  }

  // Time Control //
  /**
   * Start the games in the channel this was called from.
   *
   * @private
   * @type {HungryGames~hgCommandHandler}
   * @param {Discord~Message} msg The message that lead to this being called.
   * @param {string} id The id of the guild this was triggered from.
   */
  function startGame(msg, id) {
    if (find(id) && find(id).currentGame &&
        find(id).currentGame.inProgress) {
      self.common.reply(
          msg, 'A game is already in progress! ("' + msg.prefix +
              self.postPrefix + 'next" for next day, or "' + msg.prefix +
              self.postPrefix + 'end" to abort)');
    } else if (
      !msg.channel.permissionsFor(msg.guild.me)
          .has(self.Discord.Permissions.FLAGS.ATTACH_FILES)) {
      self.common.reply(
          msg, 'Sorry, but I need permission to send images ' +
              'in this channel before I can start the games.\nPlease ensure ' +
              'I have the "Attach Files" permission in this channel.');
    } else {
      /**
       * Once the game has finished loading all necessary data, start it if
       * autoplay is enabled.
       * @private
       */
      function loadingComplete() {
        if (find(id).autoPlay) nextDay(msg, id);
      }

      createGame(msg, id, true, loadingComplete);

      let finalMessage = new self.Discord.MessageEmbed();
      finalMessage.setTitle(getMessage('gameStart'));
      finalMessage.setColor(defaultColor);

      let numUsers = find(id).currentGame.includedUsers.length;
      if (find(id).options.teamSize > 0) {
        find(id).currentGame.includedUsers.sort(function(a, b) {
          let aTeam = find(id).currentGame.teams.findIndex(function(team) {
            return team.players.findIndex(function(player) {
              return player == a.id;
            }) > -1;
          });
          let bTeam = find(id).currentGame.teams.findIndex(function(team) {
            return team.players.findIndex(function(player) {
              return player == b.id;
            }) > -1;
          });
          if (aTeam == bTeam) {
            return a.id - b.id;
          } else {
            return aTeam - bTeam;
          }
        });
      }
      let prevTeam = -1;
      let statusList = find(id).currentGame.includedUsers.map(function(obj) {
        let myTeam = -1;
        if (find(id).options.teamSize > 0) {
          myTeam = find(id).currentGame.teams.findIndex(function(team) {
            return team.players.findIndex(function(player) {
              return player == obj.id;
            }) > -1;
          });
        }

        let shortName;
        if (obj.nickname && find(id).options.useNicknames) {
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
          prefix = '__' + find(id).currentGame.teams[myTeam].name + '__\n';
        }

        return prefix + '`' + shortName + '`';
      });
      if (find(id).options.teamSize == 0) {
        statusList.sort();
      }

      const numCols = calcColNum(statusList.length > 10 ? 3 : 2, statusList);
      if (statusList.length >= 3) {
        const quarterLength = Math.ceil(statusList.length / numCols);
        for (let i = 0; i < numCols - 1; i++) {
          let thisMessage = statusList.splice(0, quarterLength).join('\n');
          finalMessage.addField(
              'Included (' + (i * quarterLength + 1) + '-' +
                  ((i + 1) * quarterLength) + ')',
              thisMessage, true);
        }
        finalMessage.addField(
            'Included (' + ((numCols - 1) * quarterLength + 1) + '-' +
                numUsers + ')',
            statusList.join('\n'), true);
      } else {
        finalMessage.addField(
            'Included (' + numUsers + ')', statusList.join('\n') || 'Nobody',
            false);
      }
      if (find(id).excludedUsers.length > 0) {
        let excludedList = find(id)
            .excludedUsers
            .map(function(obj) {
              return getName(msg.guild, obj);
            })
            .join(', ');
        let trimmedList = excludedList.substr(0, 512);
        if (excludedList != trimmedList) {
          excludedList = trimmedList.substr(0, 509) + '...';
        } else {
          excludedList = trimmedList;
        }
        finalMessage.addField(
            'Excluded (' + find(id).excludedUsers.length + ')', excludedList,
            false);
      }

      if (!find(id).autoPlay) {
        finalMessage.setFooter(
            '"' + msg.prefix + self.postPrefix + 'next" for next day.');
      }

      let mentions = self.common.mention(msg);
      if (find(id).options.mentionEveryoneAtStart) {
        mentions += '@everyone';
      }

      msg.channel.send(mentions, finalMessage).catch((err) => {
        self.common.reply(
            msg, 'Game started!',
            'Discord rejected my normal message for some reason...');
        self.error(
            'Failed to send start game message: ' + msg.channel.id +
            ' (Cols: ' + numCols + ')');
        console.error(err);
      });

      find(id).currentGame.inProgress = true;
    }
  }
  /**
   * Start the games in the given channel and guild by the given user.
   *
   * @public
   * @param {string} uId The id of the user who trigged the games to start.
   * @param {string} gId The id of the guild to run the games in.
   * @param {string} cId The id of the channel to run the games in.
   */
  this.startGame = function(uId, gId, cId) {
    startGame(makeMessage(uId, gId, cId), gId);
  };
  /**
   * Start autoplay in the given channel and guild by the given user.
   *
   * @public
   * @param {string} uId The id of the user who trigged autoplay to start.
   * @param {string} gId The id of the guild to run autoplay in.
   * @param {string} cId The id of the channel to run autoplay in.
   */
  this.startAutoplay = function(uId, gId, cId) {
    startAutoplay(makeMessage(uId, gId, cId), gId);
  };
  /**
   * End the games in the given guild as the given user.
   *
   * @public
   * @param {string} uId The id of the user who trigged the games to end.
   * @param {string} gId The id of the guild to end the games in.
   */
  this.endGame = function(uId, gId) {
    endGame(makeMessage(uId, gId, null), gId);
  };
  /**
   * Pause autoplay in the given guild as the given user.
   *
   * @public
   * @param {string} uId The id of the user who trigged autoplay to end.
   * @param {string} gId The id of the guild to end autoplay.
   */
  this.pauseAutoplay = function(uId, gId) {
    pauseAutoplay(makeMessage(uId, gId, null), gId);
  };
  /**
   * Forms a Discord~Message similar object from given IDs.
   *
   * @private
   * @param {string} uId The id of the user who wrote this message.
   * @param {string} gId The id of the guild this message is in.
   * @param {?string} cId The id of the channel this message was 'sent' in.
   * @param {?string} msg The message content.
   * @return {
   *   {
   *     author: Discord~Member,
   *     guild: Discord~Guild,
   *     channel: Discord~GuildChannel
   *   }
   * } The created message-like object.
   */
  function makeMessage(uId, gId, cId, msg) {
    let g = self.client.guilds.get(gId);
    if (!g) return null;
    if (!cId && find(gId)) cId = find(gId).channel;
    return {
      author: self.client.users.get(uId),
      member: g.members.get(uId),
      guild: g,
      channel: g.channels.get(cId),
      text: msg,
      content: msg,
      prefix: self.bot.getPrefix(gId),
    };
  }
  /**
   * Stop autoplaying.
   *
   * @private
   * @type {HungryGames~hgCommandHandler}
   * @param {Discord~Message} msg The message that lead to this being called.
   * @param {string} id The id of the guild this was triggered from.
   */
  function pauseAutoplay(msg, id) {
    if (!find(id)) {
      self.common.reply(
          msg, 'Not autoplaying. If you wish to autoplay, type "' + msg.prefix +
              self.postPrefix + 'autoplay".');
      return;
    }
    if (find(id).autoPlay) {
      if (msg && msg.channel) {
        msg.channel.send(
            '<@' + msg.author.id +
            '> `Autoplay will stop at the end of the current day.`');
      }
      find(id).autoPlay = false;
    } else {
      if (msg && msg.channel) {
        self.common.reply(
            msg, 'Not autoplaying. If you wish to autoplay, type "' +
                msg.prefix + self.postPrefix + 'autoplay".');
      }
    }
  }
  /**
   * Start autoplaying.
   *
   * @private
   * @type {HungryGames~hgCommandHandler}
   * @param {Discord~Message} msg The message that lead to this being called.
   * @param {string} id The id of the guild this was triggered from.
   */
  function startAutoplay(msg, id) {
    if (!find(id)) {
      createGame(msg, id);
    }
    if (find(id).autoPlay && find(id).inProgress) {
      self.common.reply(
          msg, 'Already autoplaying. If you wish to stop autoplaying, type "' +
              msg.prefix + self.postPrefix + 'pause".');
    } else {
      find(id).autoPlay = true;
      if (find(id).currentGame.inProgress &&
          find(id).currentGame.day.state === 0) {
        if (self.command.validate('hg next', msg)) {
          self.common.reply(
              msg,
              'Sorry, but you don\'t have permission to start the next day ' +
                  'in the games.');
          return;
        }
        msg.channel.send(
            '<@' + msg.author.id +
            '> `Enabling Autoplay! Starting the next day!`');
        nextDay(msg, id);
      } else if (!find(id).currentGame.inProgress) {
        if (self.command.validate('hg start', msg)) {
          self.common.reply(
              msg, 'Sorry, but you don\'t have permission to start the games.');
          return;
        }
        msg.channel.send(
            '<@' + msg.author.id +
            '> `Autoplay is enabled. Starting the games!`');
        startGame(msg, id);
      } else {
        msg.channel.send('<@' + msg.author.id + '> `Enabling autoplay!`');
      }
    }
  }

  /**
   * Start the next day of the game in the given channel and guild by the given
   * user.
   *
   * @public
   * @param {string} uId The id of the user who trigged autoplay to start.
   * @param {string} gId The id of the guild to run autoplay in.
   * @param {string} cId The id of the channel to run autoplay in.
   */
  this.nextDay = function(uId, gId, cId) {
    nextDay(makeMessage(uId, gId, cId), gId);
  };
  /**
   * Simulate a single day then show events to users.
   *
   * @private
   * @type {HungryGames~hgCommandHandler}
   * @param {Discord~Message} msg The message that lead to this being called.
   * @param {string} id The id of the guild this was triggered from.
   * @param {boolean} [retry=true] If we hit an error, should we retry before
   * giving up.
   */
  function nextDay(msg, id, retry = true) {
    if (!find(id) || !find(id).currentGame ||
        !find(id).currentGame.inProgress) {
      self.common.reply(
          msg, 'You must start a game first! Use "' + msg.prefix +
              self.postPrefix + 'start" to start a game!');
      return;
    }
    if (find(id).currentGame.day.state !== 0) {
      if (dayEventIntervals[id]) {
        self.common.reply(msg, 'Already simulating day.');
      } else if (find(id).currentGame.day.state == 1) {
        self.common.reply(
            msg,
            'I think I\'m already simulating... if this isn\'t true this ' +
                'game has crashed and you must end the game.');
      } else {
        dayEventIntervals[id] = self.client.setInterval(function() {
          printEvent(msg, id);
        }, find(id).options.disableOutput ? 10 : find(id).options.delayEvents);
      }
      return;
    }
    find(id).currentGame.day.state = 1;
    find(id).currentGame.day.num++;
    find(id).currentGame.day.events = [];

    let userPool = find(id).currentGame.includedUsers.filter(function(obj) {
      return obj.living;
    });
    let startingAlive = userPool.length;
    let userEventPool;
    let doArenaEvent = false;
    let arenaEvent;
    if (find(id).currentGame.day.num === 0) {
      userEventPool =
          defaultBloodbathEvents.concat(find(id).customEvents.bloodbath);
      if (find(id).disabledEvents && find(id).disabledEvents.bloodbath) {
        userEventPool = userEventPool.filter((el) => {
          return !find(id).disabledEvents.bloodbath.find((d) => {
            return self.eventsEqual(d, el);
          });
        });
      }
      if (userEventPool.length == 0) {
        self.common.reply(
            msg, 'All bloodbath events have been disabled! Please enable ' +
                'events so that something can happen in the games!');
        endGame(msg, id);
        return;
      }
    } else {
      doArenaEvent = find(id).options.arenaEvents &&
          Math.random() < find(id).options.probabilityOfArenaEvent;
      if (doArenaEvent) {
        let arenaEventPool =
            defaultArenaEvents.concat(find(id).customEvents.arena);
        do {
          let index = Math.floor(Math.random() * arenaEventPool.length);
          arenaEvent = arenaEventPool[index];
          userEventPool = arenaEvent.outcomes;
          if (find(id).disabledEvents && find(id).disabledEvents.arena &&
              find(id).disabledEvents.arena[arenaEvent.message]) {
            userEventPool = userEventPool.filter((el) => {
              return !find(id).disabledEvents.arena[arenaEvent.message].find(
                  (d) => {
                    return self.eventsEqual(d, el);
                  });
            });
          }
          if (userEventPool.length == 0) {
            arenaEventPool.splice(index, 1);
          } else {
            find(id).currentGame.day.events.push(
                makeMessageEvent(getMessage('eventStart'), id));
            find(id).currentGame.day.events.push(
                makeMessageEvent('**___' + arenaEvent.message + '___**', id));
            break;
          }
        } while (arenaEventPool.length > 0);
        if (arenaEventPool.length == 0) doArenaEvent = false;
      }
      if (!doArenaEvent) {
        userEventPool =
            defaultPlayerEvents.concat(find(id).customEvents.player);
        if (find(id).disabledEvents && find(id).disabledEvents.player) {
          userEventPool = userEventPool.filter((el) => {
            return !find(id).disabledEvents.player.find((d) => {
              return self.eventsEqual(d, el);
            });
          });
        }
        if (userEventPool.length == 0) {
          self.common.reply(
              msg,
              'All player events have been disabled! Please enable events' +
                  ' so that something can happen in the games!');
          endGame(msg, id);
          return;
        }
      }
    }

    let weaponEventPool = Object.assign({}, weapons);
    if (find(id).customEvents.weapon) {
      let entries = Object.entries(find(id).customEvents.weapon);
      for (let i = 0; i < entries.length; i++) {
        if (weaponEventPool[entries[i][0]]) {
          weaponEventPool[entries[i][0]].outcomes =
              weaponEventPool[entries[i][0]].outcomes.concat(
                  entries[i][1].outcomes);
        } else {
          weaponEventPool[entries[i][0]] = entries[i][1];
        }

        if (find(id).disabledEvents && find(id).disabledEvents.weapon &&
            find(id).disabledEvents.weapon[entries[i][0]]) {
          weaponEventPool[entries[i][0]].outcomes =
              weaponEventPool[entries[i][0]].outcomes.filter((el) => {
                return !find(id).disabledEvents.weapon[entries[i][0]].find(
                    (d) => {
                      return self.eventsEqual(d, el);
                    });
              });
        }
      }
    }

    const probOpts = find(id).currentGame.day.num === 0 ?
        find(id).options.bloodbathOutcomeProbs :
        (doArenaEvent ?
             (arenaEvent.outcomeProbs || find(id).options.arenaOutcomeProbs) :
             find(id).options.playerOutcomeProbs);

    const nameFormat = find(id).options.useNicknames ? 'nickname' : 'username';

    while (userPool.length > 0) {
      let eventTry;
      let affectedUsers;
      let numAttacker;
      let numVictim;

      let subMessage = '';

      let deadPool = find(id).currentGame.includedUsers.filter(function(obj) {
        return !obj.living;
      });

      let userWithWeapon = null;
      if (!doArenaEvent) {
        let usersWithWeapon = [];
        for (let i = 0; i < userPool.length; i++) {
          if (userPool[i].weapons &&
              Object.keys(userPool[i].weapons).length > 0) {
            usersWithWeapon.push(userPool[i]);
          }
        }
        if (usersWithWeapon.length > 0) {
          userWithWeapon = usersWithWeapon[Math.floor(
              Math.random() * usersWithWeapon.length)];
        }
      }
      let useWeapon = userWithWeapon &&
          Math.random() < find(id).options.probabilityOfUseWeapon;
      if (useWeapon) {
        let userWeapons = Object.keys(userWithWeapon.weapons);
        let chosenWeapon =
            userWeapons[Math.floor(Math.random() * userWeapons.length)];

        if (!weaponEventPool[chosenWeapon]) {
          useWeapon = false;
          // console.log('No event pool with weapon', chosenWeapon);
        } else {
          eventTry = pickEvent(
              userPool, weaponEventPool[chosenWeapon].outcomes,
              find(id).options, find(id).currentGame.numAlive,
              find(id).currentGame.includedUsers.length,
              find(id).currentGame.teams, probOpts, userWithWeapon);
          if (!eventTry) {
            useWeapon = false;
            /* self.error(
                'No event with weapon "' + chosenWeapon +
                '" for available players ' + id); */
          } else {
            numAttacker = eventTry.attacker.count;
            numVictim = eventTry.victim.count;
            affectedUsers = pickAffectedPlayers(
                numVictim, numAttacker, eventTry.victim.outcome,
                eventTry.attacker.outcome, find(id).options, userPool, deadPool,
                find(id).currentGame.teams, userWithWeapon);

            let consumed = eventTry.consumes;
            if (consumed == 'V') consumed = numVictim;
            else if (consumed == 'A') consumed = numAttacker;
            userWithWeapon.weapons[chosenWeapon] -= consumed;
            if (userWithWeapon.weapons[chosenWeapon] <= 0) {
              delete userWithWeapon.weapons[chosenWeapon];

              let weaponName = chosenWeapon;
              let consumableName = weaponName;
              if (weapons[weaponName].consumable) {
                consumableName = weapons[weaponName].consumable.replace(
                    /\[C([^\|]*)\|([^\]]*)\]/g, '$2');
              } else if (weapons[weaponName].name) {
                consumableName = weapons[weaponName].name.replace(
                    /\[C([^\|]*)\|([^\]]*)\]/g, '$2');
              } else {
                consumableName += 's';
              }
              subMessage += formatMultiNames([userWithWeapon], nameFormat) +
                  ' runs out of ' + consumableName + '.';
            } else if (consumed != 0) {
              let weaponName = chosenWeapon;
              let consumableName = weaponName;
              let count = consumed;
              if (weapons[weaponName].consumable) {
                consumableName = weapons[weaponName].consumable.replace(
                    /\[C([^\|]*)\|([^\]]*)\]/g, (count == 1 ? '$1' : '$2'));
              } else if (weapons[weaponName].name) {
                consumableName = weapons[weaponName].name.replace(
                    /\[C([^\|]*)\|([^\]]*)\]/g, (count == 1 ? '$1' : '$2'));
              } else if (count != 1) {
                consumableName += 's';
              }
              subMessage += formatMultiNames([userWithWeapon], nameFormat) +
                  ' lost ' + count + ' ' + consumableName + '.';
            }

            let owner = 'their';
            if (numAttacker > 1 ||
                (numAttacker == 1 &&
                 affectedUsers[numVictim].id != userWithWeapon.id)) {
              owner = formatMultiNames([userWithWeapon], nameFormat) + '\'s';
            }
            if (!eventTry.message) {
              let weaponName =
                  weaponEventPool[chosenWeapon].name || chosenWeapon;
              eventTry.message =
                  weapons.message
                      .replaceAll('{weapon}', owner + ' ' + weaponName)
                      .replaceAll('{action}', eventTry.action)
                      .replace(
                          /\[C([^\|]*)\|([^\]]*)\]/g,
                          (consumed == 1 ? '$1' : '$2'));
            } else {
              eventTry.message = eventTry.message.replaceAll('{owner}', owner);
            }
          }
        }
      }

      let doBattle =
          ((!useWeapon && !doArenaEvent) || !eventTry) && userPool.length > 1 &&
          (Math.random() < find(id).options.probabilityOfBattle ||
           find(id).currentGame.numAlive == 2) &&
          !validateEventRequirements(
              1, 1, userPool, find(id).currentGame.numAlive,
              find(id).currentGame.teams, find(id).options, true, false);
      if (doBattle) {
        do {
          numAttacker = weightedUserRand();
          numVictim = weightedUserRand();
        } while (validateEventRequirements(
            numVictim, numAttacker, userPool, find(id).currentGame.numAlive,
            find(id).currentGame.teams, find(id).options, true, false));
        affectedUsers = pickAffectedPlayers(
            numVictim, numAttacker, 'dies', 'nothing', find(id).options,
            userPool, deadPool, find(id).currentGame.teams, null);
        eventTry = makeBattleEvent(
            affectedUsers, numVictim, numAttacker, find(id).options.mentionAll,
            id);
      } else if (!useWeapon || !eventTry) {
        eventTry = pickEvent(
            userPool, userEventPool, find(id).options,
            find(id).currentGame.numAlive,
            find(id).currentGame.includedUsers.length,
            find(id).currentGame.teams, probOpts);
        if (!eventTry) {
          self.error(
              'No event for ' + userPool.length + ' from ' +
              userEventPool.length + ' events. No weapon, Arena Event: ' +
              (doArenaEvent ? arenaEvent.message : 'No') + ', Day: ' +
              find(id).currentGame.day.num + ' Guild: ' + id + ' Retrying: ' +
              retry);
          find(id).currentGame.day.state = 0;
          find(id).currentGame.day.num--;
          if (retry) {
            nextDay(msg, id, false);
          } else {
            self.common.reply(
                msg, 'Oops! I wasn\'t able to find a valid event for the ' +
                    'remaining players.\nThis is usually because too many ' +
                    'events are disabled.\nIf you think this is a bug, ' +
                    'please tell SpikeyRobot#0971',
                'Try again with `' + msg.prefix + self.postPrefix +
                    'next`.\n(Failed to find valid event for \'' +
                    (doArenaEvent ? arenaEvent.message : 'player events') +
                    '\' suitable for ' + userPool.length +
                    ' remaining players)');
          }
          return;
        }

        numAttacker = eventTry.attacker.count;
        numVictim = eventTry.victim.count;
        affectedUsers = pickAffectedPlayers(
            numVictim, numAttacker, eventTry.victim.outcome,
            eventTry.attacker.outcome, find(id).options, userPool, deadPool,
            find(id).currentGame.teams, null);
      }

      let numKilled = 0;
      let weapon = eventTry.victim.weapon;
      if (weapon && !weaponEventPool[weapon.name]) {
        weapon = null;
        eventTry.victim.weapon = null;
      }
      for (let i = 0; i < numVictim; i++) {
        let numKills = 0;
        if (eventTry.victim.killer) numKills = numAttacker;
        let affected = affectedUsers[i];
        switch (eventTry.victim.outcome) {
          case 'dies':
            numKilled++;
            killUser(id, affected, numKills, weapon);
            break;
          case 'wounded':
            woundUser(id, affected, numKills, weapon);
            break;
          case 'thrives':
            restoreUser(id, affected, numKills, weapon);
            break;
          case 'revived':
            reviveUser(id, affected, numKills, weapon);
            break;
          default:
            effectUser(id, affected, numKills, weapon);
            break;
        }
        if (affected.state == 'wounded') {
          affected.bleeding++;
        } else {
          affected.bleeding = 0;
        }
      }
      weapon = eventTry.attacker.weapon;
      if (weapon && !weaponEventPool[weapon.name]) {
        weapon = null;
        eventTry.attacker.weapon = null;
      }
      for (let i = numVictim; i < numVictim + numAttacker; i++) {
        let numKills = 0;
        if (eventTry.attacker.killer) numKills = numVictim;
        let affected = affectedUsers[i];
        switch (eventTry.attacker.outcome) {
          case 'dies':
            numKilled++;
            killUser(id, affected, numKills, weapon);
            break;
          case 'wounded':
            woundUser(id, affected, numKills, weapon);
            break;
          case 'thrives':
            restoreUser(id, affected, numKills, weapon);
            break;
          case 'revived':
            reviveUser(id, affected, numKills, weapon);
            break;
          default:
            effectUser(id, affected, numKills, weapon);
            break;
        }
        if (affected.state == 'wounded') {
          affected.bleeding++;
        } else {
          affected.bleeding = 0;
        }
      }

      let finalEvent = eventTry;

      if (eventTry.attacker.weapon) {
        for (let i = 0; i < numAttacker; i++) {
          let user = affectedUsers[numVictim + i];
          let consumableList =
              Object
                  .entries(user.weapons || {[eventTry.attacker.weapon.name]: 0})
                  .map(function(el) {
                    let weaponName = el[0];
                    let consumableName = weaponName;
                    let count = el[1];
                    if (!weapons[weaponName]) {
                      self.error('Failed to find weapon: ' + weaponName);
                      return '(Unknown weapon ' + weaponName +
                          '. This is a bug.)';
                    }
                    if (weapons[weaponName].consumable) {
                      consumableName = weapons[weaponName].consumable.replace(
                          /\[C([^\|]*)\|([^\]]*)\]/g,
                          '$' + (count == 1 ? '1' : '2'));
                    } else if (weapons[weaponName].name) {
                      consumableName = weapons[weaponName].name.replace(
                          /\[C([^\|]*)\|([^\]]*)\]/g,
                          '$' + (count == 1 ? '1' : '2'));
                    } else if (count != 1) {
                      consumableName += 's';
                    }
                    return (count || 0) + ' ' + consumableName;
                  })
                  .join(', ');
          subMessage += '\n' + formatMultiNames([user], nameFormat) +
              ' now has ' + consumableList + '.';
        }
      }
      if (eventTry.victim.weapon) {
        for (let i = 0; i < numVictim; i++) {
          let user = affectedUsers[i];
          let consumableList =
              Object
                  .entries(user.weapons || {[eventTry.attacker.weapon.name]: 0})
                  .map(function(el) {
                    let weaponName = el[0];
                    let consumableName = weaponName;
                    let count = el[1];
                    if (!weapons[weaponName]) {
                      self.error('Failed to find weapon: ' + weaponName);
                      return '(Unknown weapon ' + weaponName +
                          '. This is a bug.)';
                    }
                    if (weapons[weaponName].consumable) {
                      consumableName = weapons[weaponName].consumable.replace(
                          /\[C([^\|]*)\|([^\]]*)\]/g,
                          '$' + (count == 1 ? '1' : '2'));
                    } else if (weapons[weaponName].name) {
                      consumableName = weapons[weaponName].name.replace(
                          /\[C([^\|]*)\|([^\]]*)\]/g,
                          '$' + (count == 1 ? '1' : '2'));
                    } else if (count != 1) {
                      consumableName += 's';
                    }
                    return (count || 0) + ' ' + consumableName;
                  })
                  .join(', ');
          subMessage += '\n' + formatMultiNames([user], nameFormat) +
              ' now has ' + consumableList + '.';
        }
      }

      if (doBattle) {
        affectedUsers = [];
      } else {
        finalEvent = makeSingleEvent(
            eventTry.message, affectedUsers, numVictim, numAttacker,
            find(id).options.mentionAll, id, eventTry.victim.outcome,
            eventTry.attacker.outcome, find(id).options.useNicknames);
        finalEvent.subMessage = subMessage;
      }
      /* if (eventTry.attacker.killer && eventTry.victim.killer) {
        finalEvent.icons.splice(numVictim, 0, {url: fistBoth});
      } else if (eventTry.attacker.killer) {
        finalEvent.icons.splice(numVictim, 0, {url: fistRight});
      } else if (eventTry.victim.killer) {
        finalEvent.icons.splice(numVictim, 0, {url: fistLeft});
      } */
      find(id).currentGame.day.events.push(finalEvent);

      if (affectedUsers.length !== 0) {
        console.log('Affected users remain! ' + affectedUsers.length);
      }

      if (numKilled > 4) {
        find(id).currentGame.day.events.push(
            makeMessageEvent(getMessage('slaughter'), id));
      }
    }

    if (doArenaEvent) {
      find(id).currentGame.day.events.push(
          makeMessageEvent(getMessage('eventEnd'), id));
    }
    if (!find(id).currentGame.forcedOutcomes) {
      find(id).currentGame.forcedOutcomes = [];
    } else {
      find(id).currentGame.forcedOutcomes =
          find(id).currentGame.forcedOutcomes.filter((el) => {
            self.forcePlayerState(el);
            return el.persists;
          });
    }
    let usersBleeding = [];
    let usersRecovered = [];
    find(id).currentGame.includedUsers.forEach(function(obj) {
      if (obj.bleeding > 0 && obj.bleeding >= find(id).options.bleedDays &&
          obj.living) {
        if (Math.random() < find(id).options.probabilityOfBleedToDeath &&
            (find(id).options.allowNoVictors ||
             find(id).currentGame.numAlive > 1)) {
          usersBleeding.push(obj);
          obj.living = false;
          obj.bleeding = 0;
          obj.state = 'dead';
          obj.rank = find(id).currentGame.numAlive--;
          if (find(id).options.teamSize > 0) {
            let team = find(id).currentGame.teams.find(function(team) {
              return team.players.findIndex(function(player) {
                return obj.id == player;
              }) > -1;
            });
            team.numAlive--;
            if (team.numAlive === 0) {
              let teamsLeft = 0;
              find(id).currentGame.teams.forEach(function(obj) {
                if (obj.numAlive > 0) teamsLeft++;
              });
              team.rank = teamsLeft + 1;
            }
          }
        } else {
          usersRecovered.push(obj);
          obj.bleeding = 0;
          obj.state = 'normal';
        }
      }
    });
    if (usersRecovered.length > 0) {
      find(id).currentGame.day.events.push(
          makeSingleEvent(
              getMessage('patchWounds'), usersRecovered, usersRecovered.length,
              0, find(id).options.mentionAll, id, 'thrives', 'nothing',
              find(id).options.useNicknames));
    }
    if (usersBleeding.length > 0) {
      find(id).currentGame.day.events.push(
          makeSingleEvent(
              getMessage('bleedOut'), usersBleeding, usersBleeding.length, 0,
              find(id).options.mentionAll, id,
              'dies', 'nothing', find(id).options.useNicknames));
    }

    let deathPercentage = 1 - (find(id).currentGame.numAlive / startingAlive);
    if (deathPercentage > lotsOfDeathRate) {
      find(id).currentGame.day.events.splice(
          0, 0, makeMessageEvent(getMessage('lotsOfDeath'), id));
    } else if (deathPercentage === 0) {
      find(id).currentGame.day.events.push(
          makeMessageEvent(getMessage('noDeath'), id));
    } else if (deathPercentage < littleDeathRate) {
      find(id).currentGame.day.events.splice(
          0, 0, makeMessageEvent(getMessage('littleDeath'), id));
    }

    // Signal ready to display events.
    if (web && web.dayStateChange) web.dayStateChange(id);
    find(id).currentGame.day.state = 2;
    let embed = new self.Discord.MessageEmbed();
    if (find(id).currentGame.day.num === 0) {
      embed.setTitle(getMessage('bloodbathStart'));
    } else {
      embed.setTitle(
          getMessage('dayStart')
              .replaceAll('{}', find(id).currentGame.day.num));
    }
    if (!find(id).autoPlay && find(id).currentGame.day.num < 2) {
      embed.setFooter(
          'Tip: Use "' + msg.prefix + self.postPrefix +
          'autoplay" to automate the games.');
    }
    embed.setColor(defaultColor);
    if (!find(id).options.disableOutput) {
      msg.channel.send(embed);
    }
    self.command.find('say', msg)
        .options.set('disabled', 'channel', msg.channel.id);
    find(id).outputChannel = msg.channel.id;
    dayEventIntervals[id] = self.client.setInterval(function() {
      if (web && web.dayStateChange) web.dayStateChange(id);
      printEvent(msg, id);
    }, find(id).options.disableOutput ? 10 : find(id).options.delayEvents);
  }

  /**
   * Base of all actions to perform on a player.
   * @private
   *
   * @param {string} id The guild id of the game.
   * @param {HungryGames~Player} affected The player to affect.
   * @param {number} kills The number of kills the player gets in this action.
   * @param {HungryGames~Weapon[]} [weapon] The weapon being used if any.
   */
  function effectUser(id, affected, kills, weapon) {
    if (weapon) {
      if (typeof affected.weapons[weapon.name] === 'number') {
        affected.weapons[weapon.name] += weapon.count;
      } else {
        affected.weapons[weapon.name] = weapon.count;
      }
      if (affected.weapons[weapon.name] === 0) {
        delete affected.weapons[weapon.name];
      }
    }
    affected.kills += kills;
  }

  /**
   * Kill the given player in the given guild game.
   * @private
   *
   * @param {string} id The guild id of the game.
   * @param {HungryGames~Player} a The player to affect.
   * @param {number} k The number of kills the player gets in this action.
   * @param {HungryGames~Weapon[]} [w] The weapon being used if any.
   */
  function killUser(id, a, k, w) {
    effectUser(id, a, k, w);
    a.living = false;
    a.bleeding = 0;
    a.state = 'dead';
    a.weapons = {};
    a.rank = find(id).currentGame.numAlive--;
    if (find(id).options.teamSize > 0) {
      let team = find(id).currentGame.teams.find(function(team) {
        return team.players.findIndex(function(obj) {
          return a.id == obj;
        }) > -1;
      });
      if (!team) {
        console.log('FAILED TO FIND ADEQUATE TEAM FOR USER', a.id);
      } else {
        team.numAlive--;
        if (team.numAlive === 0) {
          let teamsLeft = 0;
          find(id).currentGame.teams.forEach(function(obj) {
            if (obj.numAlive > 0) teamsLeft++;
          });
          team.rank = teamsLeft + 1;
        }
      }
    }
  }

  /**
   * Wound the given player in the given guild game.
   * @private
   *
   * @param {string} id The guild id of the game.
   * @param {HungryGames~Player} a The player to affect.
   * @param {number} k The number of kills the player gets in this action.
   * @param {HungryGames~Weapon[]} [w] The weapon being used if any.
   */
  function woundUser(id, a, k, w) {
    effectUser(id, a, k, w);
    a.state = 'wounded';
  }
  /**
   * Heal the given player in the given guild game.
   * @private
   *
   * @param {string} id The guild id of the game.
   * @param {HungryGames~Player} a The player to affect.
   * @param {number} k The number of kills the player gets in this action.
   * @param {HungryGames~Weapon[]} [w] The weapon being used if any.
   */
  function restoreUser(id, a, k, w) {
    effectUser(id, a, k, w);
    a.state = 'normal';
    a.bleeding = 0;
  }
  /**
   * Revive the given player in the given guild game.
   * @private
   *
   * @param {string} id The guild id of the game.
   * @param {HungryGames~Player} a The player to affect.
   * @param {number} k The number of kills the player gets in this action.
   * @param {HungryGames~Weapon[]} [w] The weapon being used if any.
   */
  function reviveUser(id, a, k, w) {
    effectUser(id, a, k, w);
    find(id).currentGame.numAlive++;
    find(id).currentGame.includedUsers.forEach(function(obj) {
      if (!obj.living && obj.rank < a.rank) obj.rank++;
    });
    if (find(id).options.teamSize > 0) {
      let team = find(id).currentGame.teams.find(function(obj) {
        return obj.players.findIndex(function(obj) {
          return a.id == obj;
        }) > -1;
      });
      team.numAlive++;
      find(id).currentGame.teams.forEach(function(obj) {
        if (obj.numAlive === 0 && obj.rank < team.rank) obj.rank++;
      });
      team.rank = 1;
    }
    a.state = 'zombie';
    a.living = true;
    a.bleeding = 0;
    a.rank = 1;
  }

  /**
   * Pick event that satisfies all requirements and settings.
   *
   * @private
   * @param {HungryGames~Player[]} userPool Pool of players left to chose from
   * in this day.
   * @param {HungryGames~Event[]} eventPool Pool of all events available to
   * choose at this time.
   * @param {Object} options The options set in the current game.
   * @param {number} numAlive Number of players in the game still alive.
   * @param {number} numTotal Number of players in the game total.
   * @param {HungryGames~Team[]} teams Array of teams in this game.
   * @param {HungryGames~OutcomeProbabilities} probOpts Death rate weights.
   * @param {?Player} weaponWielder A player that is using a weapon in this
   * event, or null if no player is using a weapon.
   * @return {?HungryGames~Event} The chosen event that satisfies all
   * requirements, or null if something went wrong.
   */
  function pickEvent(
      userPool, eventPool, options, numAlive, numTotal, teams, probOpts,
      weaponWielder) {
    let fails = [];
    let loop = 0;
    while (loop < 100) {
      loop++;
      let eventIndex = probabilityEvent(eventPool, probOpts);
      let eventTry = eventPool[eventIndex];
      if (!eventTry) {
        self.error('Event at index ' + eventIndex + ' is invalid!');
        if (fails.length < 3) {
          console.error('Invalid Event:', eventTry);
        }
        fails.push('Invalid Event');
        continue;
      }

      let numAttacker = eventTry.attacker.count * 1;
      let numVictim = eventTry.victim.count * 1;

      let victimRevived = eventTry.victim.outcome === 'revived';
      let attackerRevived = eventTry.attacker.outcome === 'revived';

      let eventEffectsNumMin = 0;
      let eventRevivesNumMin = 0;
      victimRevived ? (eventRevivesNumMin += Math.abs(numVictim)) :
                      (eventEffectsNumMin += Math.abs(numVictim));
      attackerRevived ? (eventRevivesNumMin += Math.abs(numAttacker)) :
                        (eventEffectsNumMin += Math.abs(numAttacker));

      // If the chosen event requires more players than there are remaining,
      // pick a new event.
      if (eventEffectsNumMin > userPool.length) {
        fails.push(
            'Event too large (' + eventEffectsNumMin + ' > ' + userPool.length +
            '): ' + eventIndex + ' V:' + eventTry.victim.count + ' A:' +
            eventTry.attacker.count + ' M:' + eventTry.message);
        continue;
      } else if (eventRevivesNumMin > numTotal - numAlive) {
        fails.push(
            'Event too large (' + eventRevivesNumMin + ' > ' +
            (numTotal - numAlive) + '): ' + eventIndex + ' V:' +
            eventTry.victim.count + ' A:' + eventTry.attacker.count + ' M:' +
            eventTry.message);
        continue;
      }

      let multiAttacker = numAttacker < 0;
      let multiVictim = numVictim < 0;
      let attackerMin = -numAttacker;
      let victimMin = -numVictim;
      if (multiAttacker || multiVictim) {
        while (true) {
          if (multiAttacker) {
            numAttacker = weightedUserRand() + (attackerMin - 1);
          }
          if (multiVictim) {
            numVictim = weightedUserRand() + (victimMin - 1);
          }
          if (victimRevived && attackerRevived) {
            if (numAttacker + numVictim <= numTotal - numAlive) break;
          } else if (victimRevived) {
            if (numAttacker <= userPool.length &&
                numVictim <= numTotal - numAlive) {
              break;
            }
          } else if (attackerRevived) {
            if (numAttacker <= numTotal - numAlive &&
                numVictim <= userPool.length) {
              break;
            }
          } else if (numAttacker + numVictim <= userPool.length) {
            break;
          }
        }
      }

      let failReason = validateEventRequirements(
          victimRevived ? 0 : numVictim, attackerRevived ? 0 : numAttacker,
          userPool, numAlive, teams, options, eventTry.victim.outcome == 'dies',
          eventTry.attacker.outcome == 'dies', weaponWielder);
      if (failReason) {
        fails.push(
            'Fails event requirement validation: ' + eventIndex + ' ' +
            failReason);
        continue;
      }

      let finalEvent = JSON.parse(JSON.stringify(eventPool[eventIndex]));

      finalEvent.attacker.count = numAttacker;
      finalEvent.victim.count = numVictim;

      return finalEvent;
    }
    self.error(
        'Failed to find suitable event for ' + userPool.length +
        ' players, from ' + eventPool.length + ' events with ' + numAlive +
        ' alive.');
    console.error(fails);
    return null;
  }
  /**
   * Ensure teammates don't attack each other.
   *
   * @private
   * @param {number} numVictim The number of victims in the event.
   * @param {number} numAttacker The number of attackers in the event.
   * @param {HungryGames~Player[]} userPool Pool of all remaining players to put
   * into an event.
   * @param {HungryGames~Team[]} teams All teams in this game.
   * @param {Object} options Options for this game.
   * @param {boolean} victimsDie Do the victims die in this event?
   * @param {boolean} attackersDie Do the attackers die in this event?
   * @param {?Player} weaponWielder A player that is using a weapon in this
   * event, or null if no player is using a weapon.
   * @return {?string} String describing failing check, or null of pass.
   */
  function validateEventTeamConstraint(
      numVictim, numAttacker, userPool, teams, options, victimsDie,
      attackersDie, weaponWielder) {
    if (options.teammatesCollaborate && options.teamSize > 0) {
      if (weaponWielder) {
        let numTeams = 0;
        for (let i = 0; i < teams.length; i++) {
          let team = teams[i];
          let numPool = 0;

          team.players.forEach(function(player) {
            if (userPool.findIndex(function(pool) {
              return pool.id == player && pool.living;
            }) > -1) {
              numPool++;
            }
          });

          team.numPool = numPool;
          if (numPool > 0) numTeams++;
        }
        if (numTeams < 2) {
          if (attackersDie || victimsDie) {
            return 'TEAM_WEAPON_NO_OPPONENT';
          }
        }
        let attackerTeam = teams.find(function(team) {
          return team.players.findIndex(function(p) {
            return p === weaponWielder.id;
          }) > -1;
        });
        if (!attackerTeam) {
          self.error(weaponWielder.id + ' not on any team');
          return 'TEAM_WEAPON_NO_TEAM';
        }
        return !(numAttacker <= attackerTeam.numPool &&
                 numVictim <= userPool.length - attackerTeam.numPool) &&
            'TEAM_WEAPON_TOO_LARGE' ||
            null;
      } else {
        let largestTeam = {index: 0, size: 0};
        let numTeams = 0;
        for (let i = 0; i < teams.length; i++) {
          let team = teams[i];
          let numPool = 0;

          team.players.forEach(function(player) {
            if (userPool.findIndex(function(pool) {
              return pool.id == player && pool.living;
            }) > -1) {
              numPool++;
            }
          });

          team.numPool = numPool;
          if (numPool > largestTeam.size) {
            largestTeam = {index: i, size: numPool};
          }
          if (numPool > 0) numTeams++;
        }
        if (numTeams < 2) {
          if (attackersDie || victimsDie) {
            return 'TEAM_NO_OPPONENT';
          }
        }
        return !((numAttacker <= largestTeam.size &&
                  numVictim <= userPool.length - largestTeam.size) ||
                 (numVictim <= largestTeam.size &&
                  numAttacker <= userPool.length - largestTeam.size)) &&
            'TEAM_TOO_LARGE' ||
            null;
      }
    }
    return null;
  }
  /**
   * Ensure the event we choose will not force all players to be dead.
   *
   * @private
   * @param {number} numVictim Number of victims in this event.
   * @param {number} numAttacker Number of attackers in this event.
   * @param {number} numAlive Total number of living players left in the game.
   * @param {Object} options The options set for this game.
   * @param {boolean} victimsDie Do the victims die in this event?
   * @param {boolean} attackersDie Do the attackers die in this event?
   * @return {boolean} Will this event follow current options set about number
   * of victors required.
   */
  function validateEventVictorConstraint(
      numVictim, numAttacker, numAlive, options, victimsDie, attackersDie) {
    if (!options.allowNoVictors) {
      let numRemaining = numAlive;
      if (victimsDie) numRemaining -= numVictim;
      if (attackersDie) numRemaining -= numAttacker;
      return numRemaining >= 1;
    }
    return true;
  }
  /**
   * Ensure the number of users in an event is mathematically possible.
   *
   * @private
   * @param {number} numVictim Number of victims in this event.
   * @param {number} numAttacker Number of attackers in this event.
   * @param {HungryGames~Player[]} userPool Pool of all remaining players to put
   * into an event.
   * @param {number} numAlive Total number of living players left in the game.
   * @return {boolean} If the event requires a number of players that is valid
   * from the number of players left to choose from.
   */
  function validateEventNumConstraint(
      numVictim, numAttacker, userPool, numAlive) {
    return numVictim + numAttacker <= userPool.length &&
        numVictim + numAttacker <= numAlive;
  }
  /**
   * Ensure the event chosen meets all requirements for actually being used in
   * the current game.
   *
   * @private
   * @param {number} numVictim Number of victims in this event.
   * @param {number} numAttacker Number of attackers in this event.
   * @param {HungryGames~Player[]} userPool Pool of all remaining players to put
   * into an event.
   * @param {number} numAlive Total number of living players left in the game.
   * @param {HungryGames~Team[]} teams All teams in this game.
   * @param {Object} options The options set for this game.
   * @param {boolean} victimsDie Do the victims die in this event?
   * @param {boolean} attackersDie Do the attackers die in this event?
   * @param {?Player} weaponWielder A player that is using a weapon in this
   * event, or null if no player is using a weapon.
   * @return {?string} String of failing constraint check, or null if passes.
   */
  function validateEventRequirements(
      numVictim, numAttacker, userPool, numAlive, teams, options, victimsDie,
      attackersDie, weaponWielder) {
    if (!validateEventNumConstraint(
        numVictim, numAttacker, userPool, numAlive)) {
      return 'NUM_CONSTRAINT';
    }
    let failReason = validateEventTeamConstraint(
        numVictim, numAttacker, userPool, teams, options, victimsDie,
        attackersDie, weaponWielder);
    if (failReason) {
      return 'TEAM_CONSTRAINT-' + failReason;
    }
    if (!validateEventVictorConstraint(
        numVictim, numAttacker, numAlive, options, victimsDie,
        attackersDie)) {
      return 'VICTOR_CONSTRAINT';
    }
    return null;
  }
  /**
   * Pick the players to put into an event.
   *
   * @private
   * @param {number} numVictim Number of victims in this event.
   * @param {number} numAttacker Number of attackers in this event.
   * @param {string} victimOutcome Outcome of victims. If "revived", uses
   * deadPool instead of uesrPool.
   * @param {string} attackerOutcome Outcome of attackers. If "revived", uses
   * deadPool instead of uesrPool.
   * @param {Object} options Options for this game.
   * @param {HungryGames~Player[]} userPool Pool of all remaining players to put
   * into an event.
   * @param {HungryGames~Player[]} deadPool Pool of all dead players that can be
   * revived.
   * @param {HungryGames~Team[]} teams All teams in this game.
   * @param {?Player} weaponWielder A player that is using a weapon in this
   * event, or null if no player is using a weapon.
   * @return {HungryGames~Player[]} Array of all players that will be affected
   * by this event.
   */
  function pickAffectedPlayers(
      numVictim, numAttacker, victimOutcome, attackerOutcome, options, userPool,
      deadPool, teams, weaponWielder) {
    let affectedUsers = [];
    let victimRevived = victimOutcome === 'revived';
    let attackerRevived = attackerOutcome === 'revived';
    if (options.teammatesCollaborate && options.teamSize > 0) {
      let isAttacker = false;
      let validTeam = teams.findIndex(function(team) {
        if (weaponWielder) {
          isAttacker = options.useEnemyWeapon ? (Math.random() > 0.5) : true;
          return team.players.findIndex(function(p) {
            return p === weaponWielder.id;
          }) > -1;
        }

        let canBeVictim = false;
        if (attackerRevived) {
          if (numAttacker <= team.players.length - team.numAlive &&
              numVictim <=
                  (victimRevived ?
                       deadPool.length - (team.players.length - team.numAlive) :
                       userPool.length - team.numPool)) {
            isAttacker = true;
          }
        } else if (
          numAttacker <= team.numPool &&
            numVictim <=
                (victimRevived ?
                     deadPool.length - (team.players.length - team.numAlive) :
                     userPool.length - team.numPool)) {
          isAttacker = true;
        }
        if (victimRevived) {
          if (numVictim <= team.players.length - team.numAlive &&
              numAttacker <=
                  (attackerRevived ?
                       deadPool.length - (team.players.length - team.numAlive) :
                       userPool.length - team.numPool)) {
            canBeVictim = true;
          }
        } else if (
          numVictim <= team.numPool &&
            numAttacker <=
                (attackerRevived ?
                     deadPool.length - (team.players.length - team.numAlive) :
                     userPool.length - team.numPool)) {
          canBeVictim = true;
        }
        if (!isAttacker && !canBeVictim) {
          return false;
        }
        if (isAttacker && canBeVictim) {
          isAttacker = Math.random() > 0.5;
        }
        return true;
      });
      findMatching = function(match, mainPool) {
        return mainPool.findIndex(function(pool) {
          let teamId = teams.findIndex(function(team) {
            return team.players.findIndex(function(player) {
              return player == pool.id;
            }) > -1;
          });
          return match ? (teamId == validTeam) : (teamId != validTeam);
        });
      };
      for (let i = 0; i < numAttacker + numVictim; i++) {
        if (victimRevived && i < numVictim) {
          let userIndex = findMatching(!isAttacker, deadPool);
          affectedUsers.push(deadPool.splice(userIndex, 1)[0]);
        } else if (attackerRevived && i >= numVictim) {
          let userIndex = findMatching(isAttacker, deadPool);
          affectedUsers.push(deadPool.splice(userIndex, 1)[0]);
        } else {
          let userIndex = findMatching(
              (i < numVictim && !isAttacker) || (i >= numVictim && isAttacker),
              userPool);
          affectedUsers.push(userPool.splice(userIndex, 1)[0]);
        }
        if (!affectedUsers[i]) {
          console.error(
              'AFFECTED USER IS INVALID:', victimRevived, attackerRevived, i,
              '/', numVictim, numAttacker, 'Pool:', userPool.length,
              deadPool.length,
              teams[validTeam].players.length - teams[validTeam].numAlive);
        }
      }
    } else {
      let i = weaponWielder ? 1 : 0;
      for (i; i < numAttacker + numVictim; i++) {
        if (i < numVictim && victimRevived) {
          let userIndex = Math.floor(Math.random() * deadPool.length);
          affectedUsers.push(deadPool.splice(userIndex, 1)[0]);
        } else if (i >= numVictim && attackerRevived) {
          let userIndex = Math.floor(Math.random() * deadPool.length);
          affectedUsers.push(deadPool.splice(userIndex, 1)[0]);
        } else {
          let userIndex = Math.floor(Math.random() * userPool.length);
          if (weaponWielder && weaponWielder.id == userPool[userIndex].id) {
            i--;
            continue;
          }
          affectedUsers.push(userPool.splice(userIndex, 1)[0]);
        }
      }
      if (weaponWielder) {
        let wielderIndex = userPool.findIndex(function(u) {
          return u.id == weaponWielder.id;
        });
        affectedUsers.push(userPool.splice(wielderIndex, 1)[0]);
      }
    }
    return affectedUsers;
  }
  /**
   * Make an event that contains a battle between players before the main event
   * message.
   *
   * @private
   * @param {HungryGames~Player[]} affectedUsers All of the players involved in
   * the event.
   * @param {number} numVictim The number of victims in this event.
   * @param {number} numAttacker The number of attackers in this event.
   * @param {boolean} mention Should every player be mentioned when their name
   * comes up?
   * @param {string} id The id of the guild that triggered this initially.
   * @param {boolean} [useNicknames=false] Should we use guild nicknames instead
   * of usernames?
   * @return {HungryGames~Event} The event that was created.
   */
  function makeBattleEvent(
      affectedUsers, numVictim, numAttacker, mention, id, useNicknames) {
    const outcomeMessage =
        battles.outcomes[Math.floor(Math.random() * battles.outcomes.length)];
    let finalEvent = makeSingleEvent(
        outcomeMessage, affectedUsers.slice(0), numVictim, numAttacker, mention,
        id, 'dies', 'nothing', useNicknames);
    finalEvent.attacker.killer = true;
    finalEvent.battle = true;
    finalEvent.state = 0;
    finalEvent.attacks = [];

    let userHealth = new Array(affectedUsers.length).fill(0);
    const maxHealth = find(id).options.battleHealth * 1;
    let numAlive = numVictim;
    let duplicateCount = 0;
    let lastAttack = {index: 0, attacker: 0, victim: 0, flipRoles: false};

    const startMessage =
        battles.starts[Math.floor(Math.random() * battles.starts.length)];
    const battleString = '**A battle has broken out!**';
    let healthText =
        affectedUsers
            .map(function(obj, index) {
              return '`' +
                  (useNicknames ? (obj.nickname || obj.name) : obj.name) +
                  '`: ' + Math.max((maxHealth - userHealth[index]), 0) + 'HP';
            })
            .sort(function(a, b) {
              return a.id - b.id;
            })
            .join(', ');
    finalEvent.attacks.push(
        makeSingleEvent(
            battleString + '\n' + startMessage + '\n' + healthText,
            affectedUsers.slice(0), numVictim, numAttacker, false, id,
            'nothing', 'nothing', useNicknames));

    let loop = 0;
    do {
      loop++;
      if (loop > 1000) {
        throw new Error('INFINITE LOOP');
      }
      let eventIndex = Math.floor(Math.random() * battles.attacks.length);
      let eventTry = battles.attacks[eventIndex];
      const attackerEventDamage = eventTry.attacker.damage * 1;
      const victimEventDamage = eventTry.victim.damage * 1;

      const flipRoles = Math.random() > 0.5;
      const attackerIndex = Math.floor(Math.random() * numAttacker) + numVictim;

      if (loop == 999) {
        console.log(
            'Failed to find valid event for battle!\n', eventTry, flipRoles,
            userHealth, '\nAttacker:', attackerIndex, '\nUsers:',
            affectedUsers.length, '\nAlive:', numAlive, '\nFINAL:', finalEvent);
      }

      if ((!flipRoles &&
           userHealth[attackerIndex] + attackerEventDamage >= maxHealth) ||
          (flipRoles &&
           userHealth[attackerIndex] + victimEventDamage >= maxHealth)) {
        continue;
      }

      let victimIndex = Math.floor(Math.random() * numAlive);

      let count = 0;
      for (let i = 0; i < numVictim; i++) {
        if (userHealth[i] < maxHealth) count++;
        if (count == victimIndex + 1) {
          victimIndex = i;
          break;
        }
      }

      const victimDamage =
          (flipRoles ? attackerEventDamage : victimEventDamage);
      const attackerDamage =
          (!flipRoles ? attackerEventDamage : victimEventDamage);

      userHealth[victimIndex] += victimDamage;
      userHealth[attackerIndex] += attackerDamage;

      if (userHealth[victimIndex] >= maxHealth) {
        numAlive--;
      }

      if (lastAttack.index == eventIndex &&
          lastAttack.attacker == attackerIndex &&
          lastAttack.victim == victimIndex &&
          lastAttack.flipRoles == flipRoles) {
        duplicateCount++;
      } else {
        duplicateCount = 0;
      }
      lastAttack = {
        index: eventIndex,
        attacker: attackerIndex,
        victim: victimIndex,
        flipRoles: flipRoles,
      };

      healthText = affectedUsers
          .map(function(obj, index) {
            const health =
                             Math.max((maxHealth - userHealth[index]), 0);
            const prePost = health === 0 ? '~~' : '';
            return prePost + '`' +
                             (useNicknames ? (obj.nickname || obj.name) :
                                             obj.name) +
                             '`: ' + health + 'HP' + prePost;
          })
          .sort(function(a, b) {
            return a.id - b.id;
          })
          .join(', ');
      let messageText = eventTry.message;
      if (duplicateCount > 0) {
        messageText += ' x' + (duplicateCount + 1);
      }

      let newEvent = makeSingleEvent(
          battleString + '\n' + messageText + '\n' + healthText,
          [
            affectedUsers[flipRoles ? attackerIndex : victimIndex],
            affectedUsers[flipRoles ? victimIndex : attackerIndex],
          ],
          1, 1, false, id,
          !flipRoles && userHealth[victimIndex] >= maxHealth ? 'dies' :
                                                               'nothing',
          flipRoles && userHealth[victimIndex] >= maxHealth ? 'dies' :
                                                              'nothing',
          useNicknames);

      if (victimDamage && attackerDamage) {
        newEvent.icons.splice(1, 0, {url: fistBoth});
      } else if (attackerDamage) {
        newEvent.icons.splice(1, 0, {url: flipRoles ? fistLeft : fistRight});
      } else if (victimDamage) {
        newEvent.icons.splice(1, 0, {url: flipRoles ? fistRight : fistLeft});
      }

      finalEvent.attacks.push(newEvent);
    } while (numAlive > 0);
    return finalEvent;
  }
  /**
   * Produce a random number that is weighted by multiEventUserDistribution.
   * @see {@link HungryGames~multiEventUserDistribution}
   *
   * @private
   * @return {number} The weighted number outcome.
   */
  function weightedUserRand() {
    let sum = 0;
    let r = Math.random();
    for (let i in multiEventUserDistribution) {
      if (typeof multiEventUserDistribution[i] !== 'number') {
        throw new Error(
            'Invalid value for multiEventUserDistribution:' +
            multiEventUserDistribution[i]);
      } else {
        sum += multiEventUserDistribution[i];
        if (r <= sum) return i * 1;
      }
    }
  }

  /**
   * Produce a random event that using probabilities set in options.
   *
   * @private
   * @param {HungryGames~Event[]} eventPool The pool of all events to consider.
   * @param {{kill: number, wound: number, thrive: number, nothing: number}}
   * probabilityOpts The probabilities of each type of event being used.
   * @param {number} [recurse=0] The current recursive depth.
   * @return {number} The index of the event that was chosen.
   */
  function probabilityEvent(eventPool, probabilityOpts, recurse = 0) {
    let probTotal = probabilityOpts.kill + probabilityOpts.wound +
        probabilityOpts.thrive + probabilityOpts.revive +
        probabilityOpts.nothing;

    const value = Math.random() * probTotal;

    let type;
    if (value > (probTotal -= probabilityOpts.nothing)) type = null;
    else if (value > (probTotal -= probabilityOpts.revive)) type = 'revived';
    else if (value > (probTotal -= probabilityOpts.thrive)) type = 'thrives';
    else if (value > (probTotal -= probabilityOpts.wound)) type = 'wounded';
    else type = 'dies';

    let finalPool = [];

    for (let i = 0; i < eventPool.length; i++) {
      if (type && (eventPool[i].attacker.outcome == type ||
                   eventPool[i].victim.outcome == type)) {
        finalPool.push(i);
      } else if (
        !type && eventPool[i].attacker.outcome == 'nothing' &&
          eventPool[i].victim.outcome == 'nothing') {
        finalPool.push(i);
      }
    }
    if (finalPool.length == 0) {
      if (recurse < 10) {
        return probabilityEvent(eventPool, probabilityOpts, recurse + 1);
      } else {
        self.error(
            'Failed to find event with probabilities: ' +
            JSON.stringify(probabilityOpts) + ' from ' + eventPool.length +
            ' events.');
        return Math.floor(Math.random() * eventPool.length);
      }
    } else {
      return finalPool[Math.floor(Math.random() * finalPool.length)];
    }
  }
  /**
   * Format an array of users into names based on options and grammar rules.
   *
   * @private
   * @param {HungryGames~Player[]} names An array of players to format the names
   * of.
   * @param {string} [format='username'] Setting of how to format the user's
   * name. `username` will use their account name, `mention` will use their ID
   * to format a mention tag, `nickname` will use their custom guild nickname.
   * @return {string} The formatted string of names.
   */
  function formatMultiNames(names, format = 'username') {
    let output = '';
    for (let i = 0; i < names.length; i++) {
      if (format === 'mention') {
        output += '<@' + names[i].id + '>';
      } else if (format === 'nickname') {
        output += '`' + (names[i].nickname || names[i].name) + '`';
      } else {
        output += '`' + names[i].name + '`';
      }

      if (i == names.length - 2) {
        output += ', and ';
      } else if (i != names.length - 1) {
        output += ', ';
      }
    }
    return output;
  }
  /**
   * Make an event that doesn't affect any players and is just a plain message.
   *
   * @private
   * @param {string} message The message to show.
   * @param {string} [id] The id of the guild that initially triggered this.
   * Required only if the given message contains '{dead}'.
   * @return {HungryGames~Event} The event that was created.
   */
  function makeMessageEvent(message, id) {
    return makeSingleEvent(
        message, [], 0, 0, false, id, 'nothing', 'nothing', false);
  }
  /**
   * Format an event string based on specified users.
   *
   * @private
   * @param {string} message The message to show.
   * @param {HungryGames~Player[]} affectedUsers An array of all users affected
   * by this event.
   * @param {number} numVictim Number of victims in this event.
   * @param {number} numAttacker Number of attackers in this event.
   * @param {boolean} mention Should all users be mentioned when their name
   * appears?
   * @param {string} id The id of the guild this was initially triggered from.
   * @param {string} victimOutcome The outcome of the victims from this event.
   * @param {string} attackerOutcome The outcome of the attackers from this
   * event.
   * @param {boolean} [useNickname=false] Use player nicknames instead of their
   * username.
   * @return {HungryGames~FinalEvent} The final event that was created and
   * formatted ready for display.
   */
  function makeSingleEvent(
      message, affectedUsers, numVictim, numAttacker, mention, id,
      victimOutcome, attackerOutcome, useNickname = false) {
    let mentionString = '';
    let translator = null;
    for (let i = 0; i < affectedUsers.length; i++) {
      if (mention == 'all' ||
          (mention == 'death' && (victimOutcome == 'dies' && i < numVictim) ||
           (attackerOutcome == 'dies' && i >= numVictim))) {
        mentionString += '<@' + affectedUsers[i].id + '>';
      }
      if (affectedUsers[i].settings &&
          affectedUsers[i].settings['hg:fun_translators'] &&
          affectedUsers[i].settings['hg:fun_translators'] !== 'disabled') {
        translator = affectedUsers[i].settings['hg:fun_translators'];
      }
    }
    let affectedVictims = affectedUsers.splice(0, numVictim);
    let affectedAttackers = affectedUsers.splice(0, numAttacker);
    let finalMessage = message;
    finalMessage = finalMessage.replace(
        /\[V([^\|]*)\|([^\]]*)\]/g,
        '$' + (affectedVictims.length > 1 ? '2' : '1'));
    finalMessage = finalMessage.replace(
        /\[A([^\|]*)\|([^\]]*)\]/g,
        '$' + (affectedAttackers.length > 1 ? '2' : '1'));
    finalMessage =
        finalMessage
            .replaceAll(
                '{victim}',
                formatMultiNames(
                    affectedVictims, useNickname ? 'nickname' : 'username'))
            .replaceAll(
                '{attacker}',
                formatMultiNames(
                    affectedAttackers, useNickname ? 'nickname' : 'username'));
    if (finalMessage.indexOf('{dead}') > -1) {
      let deadUsers =
          find(id)
              .currentGame.includedUsers
              .filter(function(obj) {
                return !obj.living && !affectedUsers.find(function(u) {
                  return u.id == obj.id;
                });
              })
              .slice(0, weightedUserRand());
      let numDead = deadUsers.length;
      if (numDead === 0) {
        finalMessage = finalMessage.replaceAll('{dead}', 'an animal')
            .replace(/\[D([^\|]*)\|([^\]]*)\]/g, '$1');
      } else {
        finalMessage =
            finalMessage
                .replace(
                    /\[D([^\|]*)\|([^\]]*)\]/g, numDead === 1 ? '$1' : '$2')
                .replaceAll(
                    '{dead}',
                    formatMultiNames(
                        deadUsers, useNickname ? 'nickname' : 'username'));
      }
    }
    finalMessage = funTranslator.to(translator, finalMessage);
    let finalIcons = getMiniIcons(affectedVictims.concat(affectedAttackers));
    return {
      message: finalMessage,
      icons: finalIcons,
      numVictim: numVictim,
      victim: {outcome: victimOutcome},
      attacker: {outcome: attackerOutcome},
      mentionString: mentionString,
    };
  }

  /**
   * Container for a user's avatar at icon size, with their id.
   * @typedef {Object} HungryGames~UserIconUrl
   *
   * @property {string} url Url of icon.
   * @property {string} id Id of the user the icon belongs to.
   */
  /**
   * Get an array of icons urls from an array of users.
   *
   * @private
   * @param {HungryGames~Player[]} users Array of users to process.
   * @return {HungryGames~UserIconUrl[]} The user ids and urls for all users
   * avatars.
   */
  function getMiniIcons(users) {
    return users.map(function(obj) {
      return {
        url: obj.avatarURL.replace(/\?size=[0-9]*/, '') + '?size=' + fetchSize,
        id: obj.id,
        isPatron: obj.settings && obj.settings.isPatron,
      };
    });
  }
  /**
   * Print an event string to the channel and add images, or if no events
   * remain, trigger end of day.
   *
   * @private
   * @param {Discord~Message} msg The message that lead to this being called.
   * @param {string} id The id of the guild this was triggered from.
   */
  function printEvent(msg, id) {
    let index = find(id).currentGame.day.state - 2;
    let events = find(id).currentGame.day.events;
    if (index >= events.length) {
      self.client.clearInterval(dayEventIntervals[id]);
      delete dayEventIntervals[id];
      printDay(msg, id);
    } else if (
      events[index].battle &&
        events[index].state < events[index].attacks.length) {
      const battleState = events[index].state;
      let embed = new self.Discord.MessageEmbed();
      const message = events[index].attacks[battleState].message.split('\n');
      embed.addField(message[1], message[2]);
      embed.setColor([50, 0, 0]);

      const avatarSizes = find(id).options.battleAvatarSizes;
      const battleIconSize = avatarSizes.avatar;
      if (battleIconSize === 0 ||
          events[index].attacks[battleState].icons.length === 0) {
        // Send without image.
        if (!battleMessage[id]) {
          if (!find(id).options.disableOutput) {
            msg.channel.send(message[0], embed)
                .then((msg_) => {
                  battleMessage[id] = msg_;
                })
                .catch((err) => {
                  self.error(
                      'Failed to send battle event message without image: ' +
                      msg.channel.id);
                  console.error(err);
                });
          }
        } else {
          battleMessage[id].edit(message[0], embed);
        }
      } else {
        const iconGap = avatarSizes.gap;
        const underlineSize = avatarSizes.underline;

        // Create image, then send.
        let finalImage = new Jimp(
            events[index].attacks[battleState].icons.length *
                    (battleIconSize + iconGap) -
                iconGap,
            battleIconSize + underlineSize * 2);
        let responses = 0;
        newImage = function(image, outcome, placement, isPatron) {
          try {
            if (battleIconSize > 0) {
              image.resize(battleIconSize, battleIconSize);
              if (underlineSize > 0) {
                if (isPatron) {
                  finalImage.blit(
                      new Jimp(battleIconSize, underlineSize, 0xF96854FF),
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
              finalImage.blit(
                  image, placement * (battleIconSize + iconGap), underlineSize);
            }
          } catch (err) {
            console.error(err);
          }
          responses++;
          if (responses == events[index].attacks[battleState].icons.length) {
            finalImage.getBuffer(Jimp.MIME_PNG, function(err, out) {
              // Attach file, then send.
              embed.attachFiles(
                  [new self.Discord.MessageAttachment(out, 'hgBattle.png')]);
              if (!find(id).options.disableOutput) {
                msg.channel.send(message[0], embed)
                    .then((msg_) => {
                      battleMessage[id] = msg_;
                    })
                    .catch((err) => {
                      self.error(
                          'Failed to send battle event message with image: ' +
                          msg.channel.id);
                      console.error(err);
                    });
              }
            });
          }
        };
        let numNonUser = 0;
        for (let i = 0; i < events[index].attacks[battleState].icons.length;
          i++) {
          let outcome = events[index].attacks[battleState].victim.outcome;
          if (!events[index].attacks[battleState].icons[i].id) {
            numNonUser++;
            outcome = 'nothing';
          } else if (
            i >= events[index].attacks[battleState].numVictim + numNonUser) {
            outcome = events[index].attacks[battleState].attacker.outcome;
          }
          readImage(events[index].attacks[battleState].icons[i].url)
              .then(
                  function(outcome, placement, isPatron) {
                    return function(image) {
                      newImage(image, outcome, placement, isPatron);
                    };
                  }(outcome, i,
                      events[index].attacks[battleState].icons[i].isPatron))
              .catch(function(err) {
                self.error('Failed to read image');
                console.log(err);
                responses++;
              });
        }
      }
      events[index].state++;
    } else {
      // delete battleMessage[id];
      const avatarSizes = find(id).options.eventAvatarSizes;
      const iconSize = avatarSizes.avatar;
      if (iconSize == 0 || events[index].icons.length === 0) {
        if (!find(id).options.disableOutput) {
          msg.channel
              .send(
                  (events[index].mentionString || '') + events[index].message +
                  '\n' + (events[index].subMessage || ''))
              .catch((err) => {
                self.error(
                    'Failed to send message without image: ' + msg.channel.id);
                console.error(err);
              });
        }
      } else {
        const iconGap = avatarSizes.gap;
        const underlineSize = avatarSizes.underline;
        let embed = new self.Discord.MessageEmbed();
        if (events[index].subMessage) {
          // embed.addField('\u200B', events[index].subMessage, false);
          embed.setDescription(
              events[index].message + '\n' + events[index].subMessage);
        } else {
          embed.setDescription(events[index].message);
        }
        embed.setColor([125, 0, 0]);
        let finalImage = new Jimp(
            events[index].icons.length * (iconSize + iconGap) - iconGap,
            iconSize + underlineSize * 2);
        let responses = 0;
        newImage = function(image, outcome, placement, isPatron) {
          try {
            if (iconSize > 0) {
              image.resize(iconSize, iconSize);
              if (underlineSize > 0) {
                if (isPatron) {
                  finalImage.blit(
                      new Jimp(iconSize, underlineSize, 0xF96854FF),
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
              finalImage.blit(
                  image, placement * (iconSize + iconGap), underlineSize);
            }
          } catch (err) {
            console.error(err);
          }
          responses++;
          if (responses == events[index].icons.length) {
            finalImage.getBuffer(Jimp.MIME_PNG, function(err, out) {
              embed.attachFiles(
                  [new self.Discord.MessageAttachment(out, 'hgEvent.png')]);
              if (!find(id).options.disableOutput) {
                msg.channel.send(events[index].mentionString, embed)
                    .catch((err) => {
                      self.error(
                          'Failed to send message with image: ' +
                          msg.channel.id);
                      console.error(err);
                    });
              }
            });
          }
        };
        let numNonUser = 0;
        for (let i = 0; i < events[index].icons.length; i++) {
          let outcome = events[index].victim.outcome;
          if (!events[index].icons[i].id) {
            numNonUser++;
            outcome = 'nothing';
          } else if (i >= events[index].numVictim + numNonUser) {
            outcome = events[index].attacker.outcome;
          }
          readImage(events[index].icons[i].url)
              .then(
                  function(outcome, placement, isPatron) {
                    return function(image) {
                      newImage(image, outcome, placement, isPatron);
                    };
                  }(outcome, events[index].icons.length - i - 1,
                      events[index].icons[i].isPatron))
              .catch(function(err) {
                self.error('Failed to read image');
                console.log(err);
                responses++;
              });
        }
      }
      find(id).currentGame.day.state++;
    }
  }
  /**
   * Trigger the end of a day and print summary/outcome at the end of the day.
   *
   * @private
   * @param {Discord~Message} msg The message that lead to this being called.
   * @param {string} id The id of the guild this was triggered from.
   */
  function printDay(msg, id) {
    let numAlive = 0;
    let lastIndex = 0;
    let lastId = 0;
    let numTeams = 0;
    let lastTeam = 0;
    let numWholeTeams = 0;
    let lastWholeTeam = 0;
    find(id).currentGame.includedUsers.forEach(function(el, i) {
      if (el.living) {
        numAlive++;
        lastIndex = i;
        lastId = el.id;
      }
    });
    if (find(id).options.teamSize > 0) {
      find(id).currentGame.teams.forEach(function(team, index) {
        if (team.numAlive > 0) {
          numTeams++;
          lastTeam = index;
        }
        if (team.numAlive > 1 && team.numAlive == team.players.length) {
          numWholeTeams++;
          lastWholeTeam = index;
        }
      });
    }

    if (find(id).currentGame.numAlive != numAlive) {
      self.error('Realtime alive count is incorrect!');
    }

    let finalMessage = new self.Discord.MessageEmbed();
    finalMessage.setColor(defaultColor);
    if (find(id).options.teammatesCollaborate && numTeams == 1) {
      let teamName = find(id).currentGame.teams[lastTeam].name;
      finalMessage.setTitle(
          '\n' + teamName + ' has won ' + find(id).currentGame.name + '!');
      let teamPlayerList =
          find(id)
              .currentGame.teams[lastTeam]
              .players
              .map(function(player) {
                let p = find(id).currentGame.includedUsers.find(function(user) {
                  return user.id == player;
                });
                if (find(id).options.useNicknames) {
                  return p.nickname || p.name;
                } else {
                  return p.name;
                }
              })
              .join(', ');
      if (teamPlayerList.length > 1024) {
        teamPlayerList = teamPlayerList.substring(0, 1021) + '...';
      }
      finalMessage.setDescription(teamPlayerList);
      find(id).currentGame.inProgress = false;
      find(id).currentGame.ended = true;
      find(id).autoPlay = false;
    } else if (numAlive == 1) {
      let p = find(id).currentGame.includedUsers[lastIndex];
      let winnerName =
          find(id).options.useNicknames ? (p.nickname || p.name) : p.name;
      let teamName = '';
      if (find(id).options.teamSize > 0) {
        teamName = '(' + find(id).currentGame.teams[lastTeam].name + ') ';
      }
      finalMessage.setTitle(
          '\n`' + winnerName + teamName + '` has won ' +
          find(id).currentGame.name + '!');
      finalMessage.setThumbnail(
          find(id).currentGame.includedUsers[lastIndex].avatarURL);
      find(id).currentGame.inProgress = false;
      find(id).currentGame.ended = true;
      find(id).autoPlay = false;
    } else if (numAlive < 1) {
      finalMessage.setTitle(
          '\nEveryone has died in ' + find(id).currentGame.name +
          '!\nThere are no winners!');
      find(id).currentGame.inProgress = false;
      find(id).currentGame.ended = true;
      find(id).autoPlay = false;
    } else {
      finalMessage.setTitle('Status update! (kills)');
      if (find(id).options.teamSize > 0) {
        find(id).currentGame.includedUsers.sort(function(a, b) {
          let aTeam = find(id).currentGame.teams.findIndex(function(team) {
            return team.players.findIndex(function(player) {
              return player == a.id;
            }) > -1;
          });
          let bTeam = find(id).currentGame.teams.findIndex(function(team) {
            return team.players.findIndex(function(player) {
              return player == b.id;
            }) > -1;
          });
          if (aTeam == bTeam) {
            return a.id - b.id;
          } else {
            return aTeam - bTeam;
          }
        });
      }
      let prevTeam = -1;
      let statusList = find(id).currentGame.includedUsers.map(function(obj) {
        let myTeam = -1;
        if (find(id).options.teamSize > 0) {
          myTeam = find(id).currentGame.teams.findIndex(function(team) {
            return team.players.findIndex(function(player) {
              return player == obj.id;
            }) > -1;
          });
        }
        let symbol = emoji.heart;
        if (!obj.living) {
          symbol = emoji.skull;
        } else if (obj.state == 'wounded') {
          symbol = emoji.yellow_heart;
        /* } else if (obj.state == 'zombie') {
          symbol = emoji.broken_heart; */
        }

        let shortName;
        if (obj.nickname && find(id).options.useNicknames) {
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
          prefix = '__' + find(id).currentGame.teams[myTeam].name + '__\n';
        }

        return prefix + symbol + '`' + shortName + '`' +
            (obj.kills > 0 ? '(' + obj.kills + ')' : '');
      });
      if (find(id).options.teamSize == 0) {
        statusList.sort();
      }
      if (statusList.length >= 3) {
        const numCols = calcColNum(statusList.length > 10 ? 3 : 2, statusList);

        const quarterLength = Math.ceil(statusList.length / numCols);
        for (let i = 0; i < numCols - 1; i++) {
          let thisMessage =
              statusList.splice(0, quarterLength).join('\n').slice(0, 1025);
          finalMessage.addField(
              (i * quarterLength + 1) + '-' + ((i + 1) * quarterLength),
              thisMessage, true);
        }
        finalMessage.addField(
            ((numCols - 1) * quarterLength + 1) + '-' +
                find(id).currentGame.includedUsers.length,
            statusList.join('\n').slice(0, 1025), true);
      } else {
        finalMessage.setDescription(statusList.join('\n'));
      }
      if (numWholeTeams == 1) {
        finalMessage.setFooter(
            getMessage('teamRemaining')
                .replaceAll(
                    '{}', find(id).currentGame.teams[lastWholeTeam].name));
      }
    }
    if (!find(id).currentGame.ended) {
      let embed = new self.Discord.MessageEmbed();
      if (find(id).currentGame.day.num == 0) {
        embed.setTitle(getMessage('bloodbathEnd'));
      } else {
        embed.setTitle(
            getMessage('dayEnd')
                .replaceAll('{day}', find(id).currentGame.day.num)
                .replaceAll('{alive}', numAlive));
      }
      if (!find(id).autoPlay) {
        embed.setFooter(
            '"' + msg.prefix + self.postPrefix + 'next" for next day.');
      }
      embed.setColor(defaultColor);
      if (!find(id).options.disableOutput) msg.channel.send(embed);
    }

    if (numTeams == 1) {
      let sendTime =
          Date.now() + (find(id).options.delayDays > 2000 ? 1000 : 0);
      let winnerTag = '';
      if (find(id).options.mentionVictor) {
        winnerTag = find(id)
            .currentGame.teams[lastTeam]
            .players
            .map(function(player) {
              return '<@' + player + '>';
            })
            .join(' ');
      }
      const avatarSizes = find(id).options.victorAvatarSizes;
      const victorIconSize = avatarSizes.avatar;
      if (victorIconSize === 0) {
        sendAtTime(msg.channel, winnerTag, finalMessage, sendTime);
      } else {
        const iconGap = avatarSizes.gap;
        const underlineSize = avatarSizes.underline;
        let finalImage = new Jimp(
            find(id).currentGame.teams[lastTeam].players.length *
                    (victorIconSize + iconGap) -
                iconGap,
            victorIconSize + underlineSize);
        let responses = 0;
        newImage = function(image, userId) {
          try {
            if (victorIconSize > 0) {
              image.resize(victorIconSize, victorIconSize);
              if (underlineSize > 0) {
                let user =
                    find(id).currentGame.includedUsers.find(function(obj) {
                      return obj.id == userId;
                    });
                let color = 0x0;
                if (user && !user.living) {
                  color = 0xFF0000FF;
                } else if (user && user.state == 'wounded') {
                  color = 0xFFFF00FF;
                } else if (user) {
                  color = 0x00FF00FF;
                }
                if (user.settings && user.settings.isPatron) {
                  finalImage.blit(
                      new Jimp(victorIconSize, underlineSize, 0xF96854FF),
                      responses * (victorIconSize + iconGap), 0);
                }
                finalImage.blit(
                    new Jimp(victorIconSize, underlineSize, color),
                    responses * (victorIconSize + iconGap), victorIconSize);
              }
              finalImage.blit(
                  image, responses * (victorIconSize + iconGap), underlineSize);
            }
          } catch (err) {
            console.error(err);
          }
          responses++;
          if (responses ==
              find(id).currentGame.teams[lastTeam].players.length) {
            finalImage.getBuffer(Jimp.MIME_PNG, function(err, out) {
              finalMessage.attachFiles([new self.Discord.MessageAttachment(
                  out, 'hgTeamVictor.png')]);
              sendAtTime(msg.channel, winnerTag, finalMessage, sendTime);
            });
          }
        };
        find(id).currentGame.teams[lastTeam].players.forEach(function(player) {
          player = find(id).currentGame.includedUsers.find(function(obj) {
            return obj.id == player;
          });
          let icon = player.avatarURL;
          let userId = player.id;
          readImage(icon)
              .then(function(userId) {
                return function(image) {
                  newImage(image, userId);
                };
              }(userId))
              .catch(function(err) {
                self.error('Failed to read image');
                console.log(err);
                responses++;
              });
        });
      }
    } else {
      self.client.setTimeout(function() {
        let winnerTag = '';
        if (numAlive == 1) {
          if (find(id).options.mentionVictor) {
            winnerTag = '<@' + lastId + '>';
          }
          if (find(id).options.disableOutput) return;
          msg.channel.send(winnerTag, finalMessage).catch((err) => {
            self.error('Failed to send solo winner message: ' + msg.channel.id);
            console.error(err);
          });
        } else {
          if (find(id).options.disableOutput) return;
          msg.channel.send(winnerTag, finalMessage).catch((err) => {
            self.error('Failed to send winner message: ' + msg.channel.id);
            console.error(err);
          });
        }
      }, (find(id).options.delayDays > 2000 ? 1000 : 0));
    }

    if (find(id).currentGame.ended) {
      let rankEmbed = new self.Discord.MessageEmbed();
      rankEmbed.setTitle('Final Ranks (kills)');
      let rankList = find(id)
          .currentGame.includedUsers
          .sort(function(a, b) {
            return a.rank - b.rank;
          })
          .map(function(obj) {
            let shortName;
            if (obj.nickname && find(id).options.useNicknames) {
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
            return obj.rank + ') ' + shortName +
                               (obj.kills > 0 ? ' (' + obj.kills + ')' : '');
          });
      if (rankList.length <= 20) {
        rankEmbed.setDescription(rankList.join('\n'));
      } else {
        let thirdLength = Math.floor(rankList.length / 3);
        for (let i = 0; i < 2; i++) {
          let thisMessage =
              rankList.splice(0, thirdLength).join('\n').slice(0, 1025);
          rankEmbed.addField(i + 1, thisMessage, true);
        }
        rankEmbed.addField(3, rankList.join('\n').slice(0, 1025), true);
      }
      rankEmbed.setColor(defaultColor);
      if (!find(id).options.disableOutput) {
        self.client.setTimeout(function() {
          msg.channel.send(rankEmbed).catch((err) => {
            self.error('Failed to send ranks message: ' + msg.channel.id);
            console.error(err);
          });
        }, 5000);
      }
      if (find(id).options.teamSize > 0) {
        let teamRankEmbed = new self.Discord.MessageEmbed();
        teamRankEmbed.setTitle('Final Team Ranks');
        find(id).currentGame.includedUsers.sort(function(a, b) {
          let aTeam = find(id).currentGame.teams.find(function(team) {
            return team.players.findIndex(function(player) {
              return player == a.id;
            }) > -1;
          });
          let bTeam = find(id).currentGame.teams.find(function(team) {
            return team.players.findIndex(function(player) {
              return player == b.id;
            }) > -1;
          });
          if (aTeam.id == bTeam.id) {
            return a.rank - b.rank;
          } else {
            return aTeam.rank - bTeam.rank;
          }
        });
        let prevTeam = -1;
        let statusList = find(id).currentGame.includedUsers.map(function(obj) {
          let myTeam = -1;
          myTeam = find(id).currentGame.teams.findIndex(function(team) {
            return team.players.findIndex(function(player) {
              return player == obj.id;
            }) > -1;
          });
          let shortName;
          if (obj.nickname && find(id).options.useNicknames) {
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
            prefix = find(id).currentGame.teams[myTeam].rank + ') __' +
                find(id).currentGame.teams[myTeam].name + '__\n';
          }

          return prefix + '`' + shortName + '`';
        });
        if (statusList.length >= 3) {
          const numCols =
              calcColNum(statusList.length > 10 ? 3 : 2, statusList);

          const quarterLength = Math.ceil(statusList.length / numCols);
          for (let i = 0; i < numCols - 1; i++) {
            let thisMessage = statusList.splice(0, quarterLength).join('\n');
            teamRankEmbed.addField(i + 1, thisMessage, true);
          }
          teamRankEmbed.addField(numCols, statusList.join('\n'), true);
        } else {
          teamRankEmbed.setDescription(statusList.join('\n'));
        }
        teamRankEmbed.setColor(defaultColor);
        if (!find(id).options.disableOutput) {
          self.client.setTimeout(function() {
            msg.channel.send(teamRankEmbed).catch((err) => {
              self.error('Failed to send final team ranks: ' + msg.channel.id);
              console.error(err);
            });
          }, 8000);
        }
      }
    }

    find(id).currentGame.day.state = 0;
    // find(id).currentGame.day.events = [];

    if (find(id).autoPlay) {
      if (!find(id).options.disableOutput) {
        self.client.setTimeout(function() {
          msg.channel.send('`Autoplaying...`')
              .then((msg) => {
                msg.delete({
                  timeout: find(id).options.delayDays - 1250,
                  reason: 'I can do whatever I want!',
                })
                    .catch(() => {});
              })
              .catch(() => {});
        }, (find(id).options.delayDays > 2000 ? 1200 : 100));
        autoPlayTimeout[id] = self.client.setTimeout(function() {
          delete autoPlayTimeout[id];
          nextDay(msg, id);
        }, find(id).options.delayDays);
      } else {
        nextDay(msg, id);
      }
    } else {
      self.command.find('say', msg)
          .options.set('default', 'channel', msg.channel.id);
    }
  }
  /**
   * End a game early.
   *
   * @private
   * @type {HungryGames~hgCommandHandler}
   * @param {Discord~Message} msg The message that lead to this being called.
   * @param {string} id The id of the guild this was triggered from.
   */
  function endGame(msg, id) {
    if (!find(id) || !find(id).currentGame.inProgress) {
      self.common.reply(msg, 'There isn\'t a game in progress.');
    } else {
      self.common.reply(msg, 'The game has ended!');
      find(id).currentGame.inProgress = false;
      find(id).currentGame.ended = true;
      find(id).autoPlay = false;
      self.client.clearInterval(dayEventIntervals[id]);
      self.client.clearTimeout(autoPlayTimeout[id]);
      delete dayEventIntervals[id];
      delete autoPlayTimeout[id];
      // delete battleMessage[id];
      if (find(id).outputChannel) {
        self.command.find('say', msg)
            .options.set('default', 'channel', find(id).outputChannel);
      }
    }
  }

  // User Management //
  /**
   * Remove a user from users to be in next game.
   *
   * @private
   * @type {HungryGames~hgCommandHandler}
   * @param {Discord~Message} msg The message that lead to this being called.
   * @param {string} id The id of the guild this was triggered from.
   */
  function excludeUser(msg, id) {
    if (!find(id)) {
      createGame(msg, id);
    }
    const firstWord = msg.text.trim().split(' ')[0];
    const everyoneWords = ['everyone', '@everyone', 'all'];
    if (everyoneWords.includes(firstWord)) {
      const response = self.excludeUsers('everyone', id);
      if (find(id).currentGame.inProgress) {
        self.common.reply(
            msg, 'Everyone will be removed from the next game.', response);
      } else {
        self.common.reply(
            msg, 'Everyone has been removed from the games.', response);
      }
    } else if (msg.mentions.users.size == 0) {
      self.common.reply(
          msg,
          'You must mention people you wish for me to exclude from the next ' +
              'game.');
    } else {
      self.common.reply(msg, self.excludeUsers(msg.mentions.users, id));
    }
  }

  /**
   * Removes users from a games of a given guild.
   *
   * @public
   * @param {string|string[]|Discord~User[]} users The users to exclude, or
   * 'everyone' to exclude everyone.
   * @param {string} id The guild id to remove the users from.
   * @return {string} A string with the outcomes of each user. May have
   * multiple lines for a single user.
   */
  this.excludeUsers = function(users, id) {
    let response = '';
    if (users === 'everyone') {
      users = find(id).currentGame.includedUsers.map(function(u) {
        return u.id;
      });
    } else if (typeof users === 'string') {
      return 'Invalid users';
    }
    if (!Array.isArray(users)) {
      users = users.array();
    }
    const onlyError = users.length > 2;
    users.forEach(function(obj) {
      if (typeof obj === 'string') {
        obj = self.client.users.get(obj);
        if (!obj) {
          response += obj + ' is not a valid id.\n';
          return;
        }
      }
      if (find(id).excludedUsers.includes(obj.id)) {
        if (!onlyError) {
          response += obj.username +
              ' is already excluded. Create a new game to reset players.\n';
        }
      } else {
        find(id).excludedUsers.push(obj.id);
        if (!onlyError) {
          response += obj.username + ' added to blacklist.\n';
        }
        if (!find(id).includedUsers) find(id).includedUsers = [];
        let includeIndex = find(id).includedUsers.indexOf(obj.id);
        if (includeIndex >= 0) {
          if (!onlyError) {
            response += obj.username + ' removed from whitelist.\n';
          }
          find(id).includedUsers.splice(includeIndex, 1);
        }
        if (!find(id).currentGame.inProgress) {
          let index =
              find(id).currentGame.includedUsers.findIndex(function(el) {
                return el.id == obj.id;
              });
          if (index >= 0) {
            find(id).currentGame.includedUsers.splice(index, 1);
            if (!onlyError) {
              response += obj.username + ' removed from included players.\n';
            }
            formTeams(id);
          } else {
            response +=
                'Failed to remove ' + obj.username + ' for an unknown reason.';
            self.error(
                'Failed to remove player from included list. (' + obj.id + ')');
          }
        }
      }
    });
    return response || 'Succeeded without errors.';
  };

  /**
   * Add a user back into the next game.
   *
   * @private
   * @type {HungryGames~hgCommandHandler}
   * @param {Discord~Message} msg The message that lead to this being called.
   * @param {string} id The id of the guild this was triggered from.
   */
  function includeUser(msg, id) {
    if (!find(id)) {
      createGame(msg, id);
    }
    const firstWord = msg.text.trim().split(' ')[0];
    const everyoneWords = ['everyone', '@everyone', 'all'];
    if (everyoneWords.includes(firstWord)) {
      const response = self.includeUsers('everyone', id);
      if (find(id).currentGame.inProgress) {
        self.common.reply(
            msg, 'Everyone will be added into the next game.', response);
      } else {
        self.common.reply(
            msg, 'Everyone has been added to the games.', response);
      }
    } else if (msg.mentions.users.size == 0) {
      self.common.reply(
          msg,
          'You must mention people you wish for me to include in the next ' +
              'game.');
    } else {
      self.common.reply(msg, self.includeUsers(msg.mentions.users, id));
    }
  }

  /**
   * Adds a user back into the next game.
   *
   * @public
   * @param {string|string[]|Discord~User[]} users The users to include, or
   * 'everyone' to include all users.
   * @param {string} id The guild id to add the users to.
   * @return {string} A string with the outcomes of each user. May have
   * multiple lines for a single user.
   */
  this.includeUsers = function(users, id) {
    let response = '';
    if (!find(id)) {
      return 'No game';
    }
    if (users === 'everyone') {
      users = find(id).excludedUsers.slice(0);
    } else if (typeof users === 'string') {
      return 'Invalid users';
    }
    if (!Array.isArray(users)) {
      users = users.array();
    }
    const onlyError = users.length > 2;
    users.forEach(function(obj) {
      if (typeof obj === 'string') {
        obj = self.client.users.get(obj);
        if (!obj) {
          response += obj + ' is not a valid id.\n';
          return;
        }
      }
      if (!find(id).options.includeBots && obj.bot) {
        response += obj.username + ' is a bot, but bots are disabled.\n';
        return;
      }
      let excludeIndex = find(id).excludedUsers.indexOf(obj.id);
      if (excludeIndex >= 0) {
        if (!onlyError) {
          response += obj.username + ' removed from blacklist.\n';
        }
        find(id).excludedUsers.splice(excludeIndex, 1);
      }
      if (!find(id).includedUsers.includes(obj.id)) {
        find(id).includedUsers.push(obj.id);
        if (!onlyError) {
          response += obj.username + ' added to whitelist.\n';
        }
      }
      if (find(id).currentGame.inProgress) {
        if (!onlyError) {
          response += obj.username + ' skipped.\n';
        }
      } else if (!find(id).currentGame.includedUsers.find((u) => {
        return u.id === obj.id;
      })) {
        find(id).currentGame.includedUsers.push(
            new Player(
                obj.id, obj.username, obj.displayAvatarURL({format: 'png'}),
                obj.nickname));
        if (!onlyError) {
          response += obj.username + ' added to included players.\n';
        }
        formTeams(id);
      } else {
        if (!onlyError) {
          response += obj.username + ' is already included.\n';
        }
      }
    });
    if (find(id).currentGame.inProgress) {
      response +=
          'Players were skipped because a game is currently in progress. ' +
          'Players cannot be added to a game while it\'s in progress.';
    }
    return response || 'Succeeded without errors';
  };

  /**
   * Show a formatted message of all users and teams in current server.
   *
   * @private
   * @type {HungryGames~hgCommandHandler}
   * @param {Discord~Message} msg The message that lead to this being called.
   * @param {string} id The id of the guild this was triggered from.
   */
  function listPlayers(msg, id) {
    let finalMessage = new self.Discord.MessageEmbed();
    finalMessage.setTitle('List of currently tracked players');
    finalMessage.setColor(defaultColor);
    if (!find(id)) {
      createGame(msg, id);
    }
    if (find(id) && find(id).currentGame &&
        find(id).currentGame.includedUsers) {
      let numUsers = find(id).currentGame.includedUsers.length;
      if (find(id).options.teamSize > 0) {
        find(id).currentGame.includedUsers.sort(function(a, b) {
          let aTeam = find(id).currentGame.teams.findIndex(function(team) {
            return team.players.findIndex(function(player) {
              return player == a.id;
            }) > -1;
          });
          let bTeam = find(id).currentGame.teams.findIndex(function(team) {
            return team.players.findIndex(function(player) {
              return player == b.id;
            }) > -1;
          });
          if (aTeam == bTeam) {
            return a.id - b.id;
          } else {
            return aTeam - bTeam;
          }
        });
      }
      let prevTeam = -1;
      let statusList = find(id).currentGame.includedUsers.map(function(obj) {
        let myTeam = -1;
        if (find(id).options.teamSize > 0) {
          myTeam = find(id).currentGame.teams.findIndex(function(team) {
            return team.players.findIndex(function(player) {
              return player == obj.id;
            }) > -1;
          });
        }

        let shortName;
        if (obj.nickname && find(id).options.useNicknames) {
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
          prefix = '__' + find(id).currentGame.teams[myTeam].name + '__\n';
        }

        return prefix + '`' + shortName + '`';
      });
      if (find(id).options.teamSize == 0) {
        statusList.sort();
      }
      if (statusList.length >= 3) {
        const numCols = calcColNum(statusList.length > 10 ? 3 : 2, statusList);

        const quarterLength = Math.ceil(statusList.length / numCols);
        for (let i = 0; i < numCols - 1; i++) {
          let thisMessage =
              statusList.splice(0, quarterLength).join('\n').substr(0, 1024);
          finalMessage.addField(
              'Included (' + (i * quarterLength + 1) + '-' +
                  ((i + 1) * quarterLength) + ')',
              thisMessage, true);
        }
        finalMessage.addField(
            'Included (' + ((numCols - 1) * quarterLength + 1) + '-' +
                numUsers + ')',
            statusList.join('\n').substr(0, 1024), true);
      } else {
        finalMessage.addField(
            'Included (' + numUsers + ')', statusList.join('\n') || 'Nobody...',
            false);
      }
    }
    if (find(id) && find(id).excludedUsers &&
        find(id).excludedUsers.length > 0) {
      let excludedList = find(id)
          .excludedUsers
          .map(function(obj) {
            return getName(msg.guild, obj);
          })
          .join(', ');
      let trimmedList = excludedList.substr(0, 512);
      if (excludedList != trimmedList) {
        excludedList = trimmedList.substr(0, 509) + '...';
      } else {
        excludedList = trimmedList;
      }
      finalMessage.addField(
          'Excluded (' + find(id).excludedUsers.length + ')', excludedList,
          false);
    }
    msg.channel.send(self.common.mention(msg), finalMessage).catch((err) => {
      self.common.reply(
          msg, 'Oops, Discord rejected my message for some reason...',
          'This is possibly because there are too many people in the games ' +
              'to show in this list.');
      self.error('Failed to send list of players message: ' + msg.channel.id);
      console.error(err);
    });
  }

  /**
   * Get the username of a user id if available, or their id if they couldn't be
   * found.
   *
   * @private
   * @param {Discord~Guild} guild The guild to look for the user in.
   * @param {string} user The id of the user to find the name of.
   * @return {string} The user's name or id if name was unable to be found.
   */
  function getName(guild, user) {
    let name = '';
    if (guild.members.get(user)) {
      name = guild.members.get(user).user.username;
    } else {
      name = user;
    }
    return name;
  }

  /**
   * Change an option to a value that the user specifies.
   *
   * @private
   * @type {HungryGames~hgCommandHandler}
   * @param {Discord~Message} msg The message that lead to this being called.
   * @param {string} id The id of the guild this was triggered from.
   */
  function toggleOpt(msg, id) {
    msg.text = msg.text.trim();
    let option = msg.text.split(' ')[0];
    let value = msg.text.split(' ')[1];
    let output = self.setOption(id, option, value, msg.text);
    if (!output) {
      showOpts(msg, find(id).options);
    } else {
      self.common.reply(msg, output);
    }
  }
  /**
   * Change an option to a value for the given guild.
   *
   * @public
   * @param {string} id The guild id to change the option in.
   * @param {?string} option The option key to change.
   * @param {?string|boolean|number} value The value to change the option to.
   * @param {string} [text=''] The original message sent without the command
   * prefix in the case we are changing the value of an object and require all
   * user inputted data.
   * @return {string} A message saying what happened, or null if we should show
   * the user the list of options instead.
   */
  this.setOption = function(id, option, value, text = '') {
    if (!find(id) || !find(id).currentGame) {
      this.createGame(id);
    }
    if (typeof option === 'undefined' || option.length == 0) {
      return null;
      /* } else if (find(id).currentGame.inProgress) {
        return 'You must end this game before changing settings. Use "' +
            self.bot.getPrefix(id) + self.postPrefix + 'end" to abort this
        game.'; */
    } else if (typeof defaultOptions[option] === 'undefined') {
      let searchedOption = defaultOptSearcher.search(option);
      if (typeof defaultOptions[searchedOption] === 'undefined') {
        return 'That is not a valid option to change! (' + option + ')\nUse `' +
            self.bot.getPrefix(id) + self.postPrefix +
            'options` to see all changeable options.';
      }
      option = searchedOption;
    }
    return changeObjectValue(
        find(id).options, defaultOptions, option, value, text.split(' '), id);
  };

  /**
   * Recurse through an object to change a certain child value based off a given
   * array of words.
   *
   * @private
   * @param {HungryGames~GuildGame.options} obj The object with the values to
   * change.
   * @param {HungryGames~defaultOptions} defaultObj The default template object
   * to base changes off of.
   * @param {string} option The first value to check.
   * @param {number|boolean|string} value The value to change to, or the next
   * option key to check if we have not found an end to a branch yet.
   * @param {Array.<string|boolean|number>} values All keys leading to the final
   * value, as well as the final value.
   * @param {string} id The id of the guild this was triggered for.
   * @param {{min: number, max: number}} [range] Allowable range for values that
   * are numbers.
   * @return {string} Message saying what happened. Can be an error message.
   */
  function changeObjectValue(
      obj, defaultObj, option, value, values, id, range) {
    let type = typeof defaultObj[option];
    if (type !== 'undefined' &&
        typeof defaultObj[option].value !== 'undefined') {
      type = typeof defaultObj[option].value;
      range = range || defaultObj[option].range;
    }
    if (find(id).currentGame && find(id).currentGame.inProgress) {
      if (option == 'teamSize' || option == 'includeBots') {
        return 'Teams and included players cannot be modified during a game.' +
            '\nYou must end the current game first to do this.';
      }
    }
    if (type === 'number') {
      value = Number(value);
      if (typeof value !== 'number') {
        return 'That is not a valid value for ' + option +
            ', which requires a number. (Currently ' + obj[option] + ')';
      } else {
        if (range) {
          if (value < range.min) value = range.min;
          if (value > range.max) value = range.max;
        }
        /* if ((option == 'delayDays' || option == 'delayEvents') && value <
        500) {
          value = 1000;
        } */

        let old = obj[option];
        obj[option] = value;
        if (option == 'teamSize' && value != 0) {
          return 'Set ' + option + ' to ' + obj[option] + ' from ' + old +
              '\nTo reset teams to the correct size, type "' +
              self.bot.getPrefix() + self.postPrefix +
              'teams reset".\nThis will delete all teams, and create ' +
              'new ones.';
        } else {
          return 'Set ' + option + ' to ' + obj[option] + ' from ' + old;
        }
      }
    } else if (type === 'boolean') {
      if (value === 'true' || value === 'false') value = value === 'true';
      if (typeof value !== 'boolean') {
        return 'That is not a valid value for ' + option +
            ', which requires true or false. (Currently ' + obj[option] + ')';
      } else {
        let old = obj[option];
        obj[option] = value;
        if (option == 'includeBots') {
          createGame(null, id, true);
          // createGame(msg, id, true);
        }
        return 'Set ' + option + ' to ' + obj[option] + ' from ' + old;
      }
    } else if (type === 'string') {
      if (defaultObj[option].values.lastIndexOf(value) < 0) {
        return 'That is not a valid value for ' + option +
            ', which requires one of the following: ' +
            JSON.stringify(defaultObj[option].values) + '. (Currently ' +
            obj[option] + ')';
      } else {
        let old = obj[option];
        obj[option] = value;
        return 'Set ' + option + ' to ' + obj[option] + ' from ' + old;
      }
    } else if (type === 'object') {
      if (typeof defaultObj[option].value[value] === 'undefined') {
        return '`' + value + '` is not a valid option to change!' +
            JSON.stringify(obj[option], null, 1);
      } else {
        return changeObjectValue(
            obj[option], defaultObj[option].value || defaultObj[option],
            values[1], values[2], values.slice(3), id, range);
      }
    } else {
      return 'Changing the value of this option does not work yet. (' + option +
          ': ' + type + ')\n' + JSON.stringify(defaultObj) + '(' + value + ')' +
          JSON.stringify(values);
    }
  }

  /**
   * Format the options for the games and show them to the user.
   *
   * @private
   * @param {Discord~Message} msg The message that lead to this being called.
   * @param {Object} options The options to format.
   */
  function showOpts(msg, options) {
    const entries = Object.entries(options);

    let bodyList = entries.map(function(obj) {
      let key = obj[0];
      let val = obj[1];

      return key + ': ' + JSON.stringify(val) + ' (default: ' +
          JSON.stringify(defaultOptions[key].value) + ')\n' +
          '/* ' + defaultOptions[key].comment + ' */';
    });

    let totalLength = 0;
    let bodyFields = [[]];
    let fieldIndex = 0;
    for (let i in bodyList) {
      if (!bodyList[i] instanceof Object) continue;
      if (bodyList[i].length + totalLength > 1500) {
        fieldIndex++;
        totalLength = 0;
        bodyFields[fieldIndex] = [];
      }
      totalLength += bodyList[i].length;
      bodyFields[fieldIndex].push(bodyList[i]);
    }

    let page = 0;
    if (msg.optId) page = msg.optId;
    if (page < 0) page = 0;
    if (page >= bodyFields.length) page = bodyFields.length - 1;

    let embed = new self.Discord.MessageEmbed();
    embed.setTitle('Current Options');
    embed.setFooter('Page ' + (page + 1) + ' of ' + (bodyFields.length));
    embed.setDescription('```js\n' + bodyFields[page].join('\n\n') + '```');
    embed.addField(
        'Simple Example',
        msg.prefix + self.postPrefix + 'options includeBots true', true);
    embed.addField(
        'Change Object Example',
        msg.prefix + self.postPrefix + 'options playerOutcomeProbs kill 23',
        true);

    if (optionMessages[msg.id]) {
      msg.edit(embed).then((msg_) => {
        optChangeListener(msg, options, page);
      });
    } else {
      msg.channel.send(embed).then((msg_) => {
        msg_.origAuth = msg.author.id;
        msg_.prefix = self.bot.getPrefix(msg.guild);
        optChangeListener(msg_, options, page);
      });
    }
  }

  /**
   * The callback for when the user chooses to change page of the options.
   *
   * @private
   * @param {Discord~Message} msg_ The message we sent showing the options.
   * @param {Object} options The options to show in the message.
   * @param {number} index The page index to show.
   */
  function optChangeListener(msg_, options, index) {
    msg_.optId = index;
    optionMessages[msg_.id] = msg_;
    msg_.react(emoji.arrow_left).then(() => {
      msg_.react(emoji.arrow_right);
    });
    newReact(maxReactAwaitTime);
    msg_.awaitReactions(function(reaction, user) {
      if (user.id != self.client.user.id) {
        reaction.users.remove(user).catch(() => {});
      }
      return (reaction.emoji.name == emoji.arrow_right ||
                  reaction.emoji.name == emoji.arrow_left) /* &&
            user.id == msg_.origAuth*/ &&
              user.id != self.client.user.id;
    }, {max: 1, time: maxReactAwaitTime}).then(function(reactions) {
      if (reactions.size == 0) {
        msg_.reactions.removeAll().catch(() => {});
        delete optionMessages[msg_.id];
        return;
      }
      let name = reactions.first().emoji.name;
      if (name == emoji.arrow_right) {
        msg_.optId++;
      } else if (name == emoji.arrow_left) {
        msg_.optId--;
      }
      showOpts(msg_, options);
    });
  }

  // Team Management //
  /**
   * Entry for all team commands.
   *
   * @private
   * @type {HungryGames~hgCommandHandler}
   * @param {Discord~Message} msg The message that lead to this being called.
   * @param {string} id The id of the guild this was triggered from.
   * @param {boolean} [silent=false] Should we disable replying to the given
   * message?
   * @return {?string} Error message or null if no error.
   */
  function editTeam(msg, id, silent) {
    let split = msg.text.trim().split(' ');
    if (!find(id) || !find(id).currentGame) {
      let message = 'There isn\'t currently any game to edit.' +
          ' Please create one first.';
      if (!silent) {
        msg.channel.send(self.common.mention(msg) + ' `' + message + '`');
      }
      return message;
    }
    if (find(id).currentGame.inProgress) {
      switch (split[0]) {
        case 'swap':
        case 'reset':
          let message = 'You must end the current game before editing teams.';
          if (!silent) {
            msg.channel.send(self.common.mention(msg) + ' `' + message + '`');
          }
          return message;
      }
    }
    if (find(id).options.teamSize == 0) {
      let message =
          'There are no teams to edit. If you wish to have teams, you can ' +
          'set teamSize to the size of teams you wish to have.';
      if (!silent) {
        self.common.reply(
            msg, message, msg.prefix + self.postPrefix + 'opt teamSize 2');
      }
      return message;
    }
    switch (split[0]) {
      case 'swap':
        swapTeamUsers(msg, id);
        break;
      case 'move':
        moveTeamUser(msg, id);
        break;
      case 'rename':
        renameTeam(msg, id, silent);
        break;
      case 'reset':
        if (!silent) self.common.reply(msg, 'Resetting ALL teams!');
        find(id).currentGame.teams = [];
        formTeams(id);
        break;
      case 'randomize':
      case 'shuffle':
        randomizeTeams(msg, id, silent);
        break;
      default:
        listPlayers(msg, id);
        break;
    }
  }
  /**
   * Allows editing teams. Entry for all team actions.
   *
   * @public
   * @param {string} uId The id of the user is running the action.
   * @param {string} gId The id of the guild to run this in.
   * @param {string} cmd The command to run on the teams.
   * @param {string} one The id of the user to swap, or the new name of the team
   * if we're renaming a team.
   * @param {string} two The id of the user to swap, or the team id if we're
   * moving a player to a team.
   * @return {?string} Error message or null if no error.
   */
  this.editTeam = function(uId, gId, cmd, one, two) {
    if (find(gId).currentGame.inProgress) {
      switch (cmd) {
        case 'swap':
        case 'reset':
          return;
      }
    }
    switch (cmd) {
      case 'swap':
        let p1 = -1;
        let team1 = find(gId).currentGame.teams.find((t) => {
          return t.players.find((p, i) => {
            if (p == one) {
              p1 = i;
              return true;
            }
            return false;
          });
        });
        let p2 = -1;
        let team2 = find(gId).currentGame.teams.find((t) => {
          return t.players.find((p, i) => {
            if (p == two) {
              p2 = i;
              return true;
            }
            return false;
          });
        });
        if (!team1 || !team2) break;
        let tmp = team1.players.splice(p1, 1);
        team1.players.push(team2.players.splice(p2, 1));
        team2.players.push(tmp);
        break;
      case 'move':
        let pId = -1;
        let tId = -1;
        let teamS = find(gId).currentGame.teams.find((t, i) => {
          if (t.players.find((p, j) => {
            if (p == one) {
              pId = j;
              return true;
            }
            return false;
          })) {
            tId = i;
            return true;
          }
          return false;
        });
        let teamD = find(gId).currentGame.teams.find((t) => {
          return t.id == two;
        });
        if (!teamS) break;
        if (!teamD) {
          teamD =
              find(gId)
                  .currentGame
                  .teams[find(gId).currentGame.teams.push(
                      new Team(
                          find(gId).currentGame.teams.length, 'Team ' +
                                     (find(gId).currentGame.teams.length + 1),
                          [])) -
                         1];
        }
        teamD.players.push(teamS.players.splice(pId, 1)[0]);
        if (teamS.players.length === 0) {
          find(gId).currentGame.teams.splice(tId, 1);
        }
        break;
      default:
        return editTeam(
            makeMessage(
                uId, gId, null, cmd + ' ' + (one || '') + ' ' + (two || '')),
            gId, true);
        break;
    }
  };
  /**
   * Swap two users from one team to the other.
   *
   * @private
   * @param {Discord~Message} msg The message that lead to this being called.
   * @param {string} id The id of the guild this was triggered from.
   */
  function swapTeamUsers(msg, id) {
    if (msg.mentions.users.size != 2) {
      self.common.reply(
          msg, 'Swapping requires mentioning 2 users to swap teams with ' +
              'eachother.');
      return;
    }
    let user1 = msg.mentions.users.first().id;
    let user2 = msg.mentions.users.first(2)[1].id;
    let teamId1 = 0;
    let playerId1 = 0;
    let teamId2 = 0;
    let playerId2 = 0;
    teamId1 = find(id).currentGame.teams.findIndex(function(team) {
      let index = team.players.findIndex(function(player) {
        return player == user1;
      });
      if (index > -1) playerId1 = index;
      return index > -1;
    });
    teamId2 = find(id).currentGame.teams.findIndex(function(team) {
      let index = team.players.findIndex(function(player) {
        return player == user2;
      });
      if (index > -1) playerId2 = index;
      return index > -1;
    });
    if (teamId1 < 0 || teamId2 < 0) {
      self.common.reply(msg, 'Please ensure both users are on a team.');
      return;
    }
    let intVal = find(id).currentGame.teams[teamId1].players[playerId1];
    find(id).currentGame.teams[teamId1].players[playerId1] =
        find(id).currentGame.teams[teamId2].players[playerId2];

    find(id).currentGame.teams[teamId2].players[playerId2] = intVal;

    self.common.reply(msg, 'Swapped players!');
  }
  /**
   * Move a single user to another team.
   *
   * @private
   * @param {Discord~Message} msg The message that lead to this being called.
   * @param {string} id The id of the guild this was triggered from.
   */
  function moveTeamUser(msg, id) {
    if (msg.mentions.users.size < 1) {
      self.common.reply(msg, 'You must at least mention one user to move.');
      return;
    }
    let user1 = msg.mentions.users.first().id;
    let teamId1 = 0;
    let playerId1 = 0;

    let user2 = 0;
    if (msg.mentions.users.size >= 2) {
      user2 = msg.mentions.users.first(2)[1].id;

      if (msg.text.indexOf(user2) < msg.text.indexOf(user1)) {
        let intVal = user1;
        user1 = user2;
        user2 = intVal;
      }
    }

    let teamId2 = 0;
    teamId1 = find(id).currentGame.teams.findIndex(function(team) {
      let index = team.players.findIndex(function(player) {
        return player == user1;
      });
      if (index > -1) playerId1 = index;
      return index > -1;
    });
    if (user2 > 0) {
      teamId2 = find(id).currentGame.teams.findIndex(function(team) {
        return team.players.findIndex(function(player) {
          return player == user2;
        }) > -1;
      });
    } else {
      teamId2 = msg.text.split(' ')[2] - 1;
    }
    if (teamId1 < 0 || teamId2 < 0 || isNaN(teamId2)) {
      let extra = null;
      if (user2 > 0 && teamId2 < 0) {
        extra = 'Is ' + self.client.users.get(user2).username + ' on a team?';
      } else if (user1 > 0 && teamId1 < 0) {
        extra = 'Is ' + self.client.users.get(user1).username + ' on a team?';
      }
      self.common.reply(
          msg, 'Please ensure the first option is the user, and the second ' +
              'is the destination (either a mention or a team id).',
          extra);
      return;
    }
    if (teamId2 >= find(id).currentGame.teams.length) {
      find(id).currentGame.teams.push(
          new Team(
              find(id).currentGame.teams.length,
              'Team ' + (find(id).currentGame.teams.length + 1), []));
      teamId2 = find(id).currentGame.teams.length - 1;
    }
    self.common.reply(
        msg, 'Moving `' + self.client.users.get(user1).username + '` from ' +
            find(id).currentGame.teams[teamId1].name + ' to ' +
            find(id).currentGame.teams[teamId2].name);

    find(id).currentGame.teams[teamId2].players.push(
        find(id).currentGame.teams[teamId1].players.splice(playerId1, 1)[0]);

    if (find(id).currentGame.teams[teamId1].players.length == 0) {
      find(id).currentGame.teams.splice(teamId1, 1);
    }
  }
  /**
   * Rename a team.
   *
   * @private
   * @param {Discord~Message} msg The message that lead to this being called.
   * @param {string} id The id of the guild this was triggered from.
   * @param {boolean} [silent=false] Disable replying to message.
   */
  function renameTeam(msg, id, silent) {
    let split = msg.text.trim().split(' ').slice(1);
    let message = split.slice(1).join(' ');
    let search = Number(split[0]);
    if (isNaN(search) && (!msg.mentions || msg.mentions.users.size == 0)) {
      if (!silent) {
        self.common.reply(
            msg, 'Please specify a team id, or mention someone on a team, in ' +
                'order to rename their team.');
      }
      return;
    }
    let teamId = search - 1;
    if (isNaN(search)) {
      teamId = find(id).currentGame.teams.findIndex(function(team) {
        return team.players.findIndex(function(player) {
          return player == msg.mentions.users.first().id;
        }) > -1;
      });
    }
    if (teamId < 0 || teamId >= find(id).currentGame.teams.length) {
      if (!silent) {
        self.common.reply(
            msg, 'Please specify a valid team id. (0 - ' +
                (find(id).currentGame.teams.length - 1) + ')');
      }
      return;
    }
    message = message.slice(0, 101);
    if (!silent) {
      self.common.reply(
          msg, 'Renaming "' + find(id).currentGame.teams[teamId].name +
              '" to "' + message + '"');
    }
    find(id).currentGame.teams[teamId].name = message;
  }

  /**
   * Swap random users between teams.
   *
   * @private
   * @param {Discord~Message} msg The message that lead to this being called.
   * @param {string} id The id of the guild this was triggered from.
   * @param {boolean} [silent=false] If true, this will not attempt to send
   * messages to the channel where the msg was sent..
   */
  function randomizeTeams(msg, id, silent) {
    let current = find(id).currentGame;
    if (current.teams.length == 0) {
      if (!silent) self.common.reply(msg, 'There are no teams to randomize.');
      return;
    }
    for (let i = 0; i < current.includedUsers.length; i++) {
      let teamId1 = Math.floor(Math.random() * current.teams.length);
      let playerId1 =
          Math.floor(Math.random() * current.teams[teamId1].players.length);
      let teamId2 = Math.floor(Math.random() * current.teams.length);
      let playerId2 =
          Math.floor(Math.random() * current.teams[teamId2].players.length);

      let intVal = current.teams[teamId1].players[playerId1];
      current.teams[teamId1].players[playerId1] =
          current.teams[teamId2].players[playerId2];
      current.teams[teamId2].players[playerId2] = intVal;
    }
    if (!silent) self.common.reply(msg, 'Teams have been randomized!');
  }

  // Game Events //
  /**
   * Create a custom event for a guild.
   *
   * @private
   * @type {HungryGames~hgCommandHandler}
   * @param {Discord~Message} msg The message that lead to this being called.
   * @param {string} id The id of the guild this was triggered from.
   */
  function createEvent(msg, id) {
    if (!find(id)) {
      createGame(msg, id);
    }
    newEventMessages[msg.id] = msg;
    const authId = msg.author.id;
    self.common.reply(msg, 'Loading...').then((msg_) => {
      newEventMessages[msg.id].myResponse = msg_;
      newReact(maxReactAwaitTime);
      msg_.awaitReactions(function(reaction, user) {
        return (reaction.emoji.name == emoji.red_circle ||
                    reaction.emoji.name == emoji.trophy) &&
                user.id == authId;
      }, {max: 1, time: maxReactAwaitTime}).then(function(reactions) {
        if (reactions.size == 0) {
          msg_.reactions.removeAll().catch(() => {});
          delete newEventMessages[msg.id];
          return;
        }
        let eventType = 'player';
        if (reactions.first().emoji.name == emoji.red_circle) {
          eventType = 'bloodbath';
        }
        const message = newEventMessages[msg.id].text;
        msg_.delete().catch(() => {});
        msg.channel.send('Loading...').then(function(msg_) {
          let numVictim = 0;
          let numAttacker = 0;
          let victimOutcome = 'nothing';
          let attackerOutcome = 'nothing';
          let victimKiller = false;
          let attackerKiller = false;
          getAttackNum = function() {
            createEventNums(
                msg_, authId,
                '`How many attackers may be in this event? (-1 means at ' +
                    'least 1, -2 at least 2)`',
                (num) => {
                  numAttacker = num;
                  // msg_.reactions.removeAll();
                  msg_.channel.send('Loading...').then((msg) => {
                    msg_ = msg;
                    getVictimNum();
                  });
                  msg_.delete().catch(() => {});
                });
          };
          getVictimNum = function() {
            createEventNums(
                msg_, authId,
                '`How many victims may be in this event? (-1 means at least ' +
                    '1, -2 at least 2)`',
                (num) => {
                  numVictim = num;
                  // msg_.reactions.removeAll();
                  msg_.channel.send('Loading...').then((msg) => {
                    msg_ = msg;
                    getAttackOutcome();
                  });
                  msg_.delete().catch(() => {});
                });
          };
          getAttackOutcome = function() {
            if (numAttacker == 0) {
              getVictimOutcome();
            } else {
              createEventOutcome(
                  msg_, authId, '`What is the outcome of the attackers?`',
                  function(outcome) {
                    attackerOutcome = outcome;
                    // msg_.reactions.removeAll();
                    msg_.channel.send('Loading...').then((msg) => {
                      msg_ = msg;
                      getVictimOutcome();
                    });
                    msg_.delete().catch(() => {});
                  });
            }
          };
          getVictimOutcome = function() {
            if (numVictim == 0) {
              getIsAttackerKiller();
            } else {
              createEventOutcome(
                  msg_, authId, '`What is the outcome of the victims?`',
                  function(outcome) {
                    victimOutcome = outcome;
                    // msg_.reactions.removeAll();
                    msg_.channel.send('Loading...').then((msg) => {
                      msg_ = msg;
                      getIsAttackerKiller();
                    });
                    msg_.delete().catch(() => {});
                  });
            }
          };
          getIsAttackerKiller = function() {
            if (numAttacker == 0) {
              getIsVictimKiller();
            } else {
              createEventAttacker(
                  msg_, authId,
                  '`Do the attacker(s) kill someone in this event?`',
                  function(outcome) {
                    attackerKiller = outcome;
                    // msg_.reactions.removeAll();
                    msg_.channel.send('Loading...').then((msg) => {
                      msg_ = msg;
                      getIsVictimKiller();
                    });
                    msg_.delete().catch(() => {});
                  });
            }
          };
          getIsVictimKiller = function() {
            if (numVictim == 0) {
              finish();
            } else {
              createEventAttacker(
                  msg_, authId,
                  '`Do the victim(s) kill someone in this event?`',
                  function(outcome) {
                    victimKiller = outcome;
                    finish();
                  });
            }
          };
          finish = function() {
            msg_.delete().catch(() => {});
            let error = self.makeAndAddEvent(
                id, eventType, message, numVictim, numAttacker, victimOutcome,
                attackerOutcome, victimKiller, attackerKiller);
            if (error) {
              msg.channel.send(
                  '`Failed to create event!`\n' + eventType + ' event\n' +
                  error);
            } else {
              msg.channel.send(
                  '`Event created!`\n' +
                  formatEventString(
                      new Event(
                          message, numVictim, numAttacker, victimOutcome,
                          attackerOutcome, victimKiller, attackerKiller)) +
                  '\n' + eventType + ' event');
            }
          };

          getAttackNum();
        });
        delete newEventMessages[msg.id];
      });
      msg_.react(emoji.red_circle).then(() => {
        msg_.react(emoji.trophy);
      });
      updateEventPreview(newEventMessages[msg.id]);
    });
  }

  /**
   * Creates an event and adds it to the custom events for the given guild.
   *
   * @public
   * @param {string} id The guild id to add the event to.
   * @param {string} type The type of event this is. Either 'player' or
   * 'bloodbath'.
   * @param {string} message The event message.
   * @param {number} numVictim The number of victims in the event.
   * @param {number} numAttacker The number of attackers in the event.
   * @param {string} victimOutcome The outcome of the victims due to this event.
   * @param {string} attackerOutcome The outcome of the attackers due to this
   * event.
   * @param {boolean} victimKiller Do the victims kill anyone.
   * @param {boolean} attackerKiller Do the attackers kill anyone.
   * @param {{name: string, count: number}} vWeapon The weapon information to
   * give the victim.
   * @param {{name: string, count: number}} aWeapon The weapon information to
   * give the attacker.
   * @return {?string} Error message or null if no error.
   */
  this.makeAndAddEvent = function(
      id, type, message, numVictim, numAttacker, victimOutcome, attackerOutcome,
      victimKiller, attackerKiller, vWeapon = null, aWeapon = null) {
    if (type !== 'player' && type !== 'bloodbath') return 'Invalid Type';
    if (!find(id) || !find(id).customEvents) {
      return 'Invalid ID or no game.';
    }
    let newEvent = new Event(
        message, numVictim, numAttacker, victimOutcome, attackerOutcome,
        victimKiller, attackerKiller);
    if (vWeapon) {
      newEvent.victim.weapon = vWeapon;
    }
    if (aWeapon) {
      newEvent.attacker.weapon = aWeapon;
    }
    return self.addEvent(id, type, newEvent);
  };
  /**
   * Adds a given event to the given guild's custom events.
   *
   * @public
   * @param {string} id The id of the guild to add the event to.
   * @param {string} type The type of event this is.
   * @param {HungryGames~Event} event The event to add.
   * @return {?string} Error message or null if no error.
   */
  this.addEvent = function(id, type, event) {
    if (type !== 'bloodbath' && type !== 'player') return 'Invalid Type';
    if (!find(id) || !find(id).customEvents) {
      return 'Invalid ID or no game.';
    }
    if (!event.message || event.message.length == 0) {
      return 'Event must have a message.';
    }
    for (let i in find(id).customEvents[type]) {
      if (self.eventsEqual(event, find(id).customEvents[type][i])) {
        return 'Event already exists!';
      }
    }
    find(id).customEvents[type].push(event);
    return null;
  };

  /**
   * Creates an event and adds it to the custom events for the given guild. Or
   * edits an existing event by appending new events to the major event.
   *
   * @public
   * @param {string} id The guild id to add the event to.
   * @param {string} type The type of event this is. Either 'arena' or 'weapon'.
   * @param {HungryGames~ArenaEvent|HungryGames~WeaponEvent} data The event
   * data.
   * @param {string} [name] The internal name of the weapon being added.
   * @return {?string} Error message or null if no error.
   */
  this.addMajorEvent = function(id, type, data, name) {
    if (type !== 'arena' && type !== 'weapon') return 'Invalid Type';
    if (!find(id) || !find(id).customEvents) {
      return 'Invalid ID or no game.';
    }
    if (type === 'arena') {
      if (!data.message || data.message.length == 0) {
        return 'Event must have a message.';
      }
      for (let i = 0; i < find(id).customEvents[type].length; i++) {
        if (find(id).customEvents[type][i].message === data.message) {
          find(id).customEvents[type][i] =
              Object.assign(find(id).customEvents[type][i], data);
          return null;
        }
      }
      find(id).customEvents[type].push(data);
      return null;
    } else if (type === 'weapon') {
      if (find(id).customEvents[type][name]) {
        if (data.name) find(id).customEvents[type][name].name = data.name;
        if (data.consumable) {
          find(id).customEvents[type][name].consumable = data.consumable;
        }
        for (let i = 0; i < data.outcomes.length; i++) {
          let exists = false;
          let dEl = data.outcomes[i];
          for (let j = 0; j < find(id).customEvents[type][name].outcomes.length;
            j++) {
            let el = find(id).customEvents[type][name].outcomes[j];
            if (self.eventsEqual(el, dEl)) {
              exists = true;
              break;
            }
          }
          if (exists) continue;
          find(id).customEvents[type][name].outcomes.push(data.outcomes[i]);
        }
      } else {
        find(id).customEvents[type][name] = data;
      }
      return null;
    }
    return 'Invalid Type';
  };

  /**
   * Searches custom events for the given one, then edits it with the given
   * data. If the data is null besides required data for finding the major
   * event, the major event gets deleted. (Arena or Weapon events)
   *
   * @public
   * @param {string} id The id of the guild to remove the event from.
   * @param {string} type The type of event this is.
   * @param {HungryGames~ArenaEvent|HungryGames~WeaponEvent} search The event
   * data to use to search for.
   * @param {?HungryGames~ArenaEvent|HungryGames~WeaponEvent} data The event
   * data to set the matched search to. If this is null, the event is deleted.
   * @param {string} [name] The name of the weapon to look for or the message of
   * the arena event to edit.
   * @param {string} [newName] The new name of the weapon that was found with
   * `name`.
   * @return {?string} Error message or null if no error.
   */
  this.editMajorEvent = function(id, type, search, data, name, newName) {
    if (type !== 'arena' && type !== 'weapon') return 'Invalid Type';
    if (!find(id) || !find(id).customEvents) {
      return 'Invalid ID or no game.';
    }
    let list = find(id).customEvents[type];
    if (type === 'arena') {
      let match;
      let matchId = -1;
      for (let i = 0; i < list.length; i++) {
        if (list[i].message == search.message) {
          match = list[i];
          matchId = i;
          break;
        }
      }
      if (!match) return 'Failed to find event to edit.';

      if (!data) {
        find(id).customEvents[type].splice(matchId, 1);
        return null;
      }
      if (search.message) match.message = data.message;
      if (search.outcomeProbs) match.outcomeProbs = data.outcomeProbs;
      if (!search.outcomes || search.outcomes.length == 0) return null;
      for (let i = 0; i < match.outcomes.length; i++) {
        let one = match.outcomes[i];
        for (let j = 0; j < search.outcomes.length; j++) {
          let two = search.outcomes[j];
          if (self.eventsEqual(one, two)) {
            if (data.outcomes && data.outcomes[j]) {
              one = data.outcomes[j];
            } else {
              match.outcomes.splice(i, 1);
              i--;
            }
            break;
          }
        }
      }
      if (match.outcomes.length == 0) {
        find(id).customEvents[type].splice(matchId, 1);
      }
      return null;
    } else if (type === 'weapon') {
      let match = find(id).customEvents[type][name];
      if (!match) return 'Failed to find weapon to edit.';
      if (newName) {
        match = find(id).customEvents[type][newName] = Object.assign({}, match);
        delete find(id).customEvents[type][name];
      }
      if (!search) return null;
      if (!data) {
        delete find(id).customEvents[type][newName || name];
        return null;
      }
      if (search.name) match.name = data.name;
      if (search.consumable) match.consumable = data.consumable;
      if (!search.outcomes || search.outcomes.length == 0) return null;
      for (let i = 0; i < search.outcomes.length; i++) {
        for (let j = 0; j < match.outcomes.length; j++) {
          if (self.eventsEqual(search.outcomes[i], match.outcomes[j])) {
            if (!data.outcomes || !data.outcomes[i]) {
              match.outcomes.splice(j, 1);
            } else {
              match.outcomes[j] = data.outcomes[i];
            }
            break;
          }
        }
      }
      if (match.outcomes.length == 0) {
        delete find(id).customEvents[type][newName || name];
      }
      return null;
    }

    return 'Failed to find event to edit.';
  };

  /**
   * Searches custom events for the given one, then removes it from the custom
   * events. (Bloodbath or Player events)
   *
   * @public
   * @param {string} id The id of the guild to remove the event from.
   * @param {string} type The type of event this is.
   * @param {HungryGames~Event} event The event to search for.
   * @return {?string} Error message or null if no error.
   */
  this.removeEvent = function(id, type, event) {
    if (type !== 'bloodbath' && type !== 'player') return 'Invalid Type';
    if (!find(id) || !find(id).customEvents) {
      return 'Invalid ID or no game.';
    }
    let list = find(id).customEvents[type];
    for (let i in list) {
      if (self.eventsEqual(list[i], event)) {
        list.splice(i, 1);
        return null;
      }
    }
    return 'Failed to find event to remove.';
  };

  /**
   * Toggle events in the games.
   * @TODO: Write this. This is not implemented yet.
   * @type {HungryGames~hgCommandHandler}
   * @param {Discord~Message} msg The message that lead to this being called.
   * @param {string} id The id of the guild this was triggered from.
   */
  function commandToggleEvent(msg, id) {
    self.common.reply(
        msg, 'Sorry, this feature is only available on the website.',
        'https://www.spikeybot.com/hg/');
    // let error = self.toggleEvent(id, type, subCat, event, value);
  }

  /**
   * Enable or disable an event without deleting it completely.
   * @public
   *
   * @param {number|string} id The guild id that the event shall be toggled in.
   * @param {string} type The type of event. 'bloodbath', 'player', 'weapon', or
   * 'arena'
   * @param {?string} subCat The sub-category name of the event if there is one
   * (Such as the weapon name, or arena event message).
   * @param {HungryGames~Event|HungryGames~ArenaEvent|HungryGames~WeaponEvent}
   * event The event to toggle.
   * @param {boolean} [value] Set enabled to a value instead of toggling.
   * @return {?string} Error message or null if no error.
   */
  this.toggleEvent = function(id, type, subCat, event, value) {
    if (!['bloodbath', 'arena', 'player', 'weapon'].includes(type)) {
      return 'Invalid Type';
    }
    if (!find(id)) return 'Invalid ID or no game';
    if (!find(id).disabledEvents) {
      find(id).disabledEvents =
          {bloodbath: [], player: [], arena: {}, weapon: {}};
    }
    let allEvents;
    switch (type) {
      case 'bloodbath':
        allEvents =
            defaultBloodbathEvents.concat(find(id).customEvents.bloodbath);
        break;
      case 'player':
        allEvents = defaultPlayerEvents.concat(find(id).customEvents.player);
        break;
      case 'arena':
        allEvents = defaultArenaEvents.concat(find(id).customEvents.arena);
        break;
      case 'weapon':
        allEvents = Object.assign({}, weapons);
        let entries = Object.entries(find(id).customEvents.weapon);
        for (let i = 0; i < entries.length; i++) {
          if (allEvents[entries[i][0]]) {
            allEvents[entries[i][0]].outcomes =
                allEvents[entries[i][0]].outcomes.concat(
                    entries[i][1].outcomes);
          } else {
            allEvents[entries[i][0]] = entries[i][1];
          }
        }
        break;
    }

    let allDisabled = find(id).disabledEvents[type];

    if (['weapon', 'arena'].includes(type)) {
      if (!subCat) return 'Invalid Category';
      if (type === 'weapon') allEvents = allEvents[subCat];
      if (type === 'arena') {
        allEvents = allEvents.find((el) => el.message === subCat);
      }
      if (!allEvents) return 'Invalid Category';
      allEvents = allEvents.outcomes;
      if (!allDisabled[subCat]) allDisabled[subCat] = [];
      allDisabled = allDisabled[subCat];
    }

    let isValid = false;
    let isDisabled = false;
    let index;
    for (let i = 0; i < allDisabled.length; i++) {
      if (self.eventsEqual(allDisabled[i], event)) {
        if (typeof value === 'undefined') value = true;
        if (value) isValid = true;
        isDisabled = true;
        index = i;
        break;
      }
    }
    if (!isDisabled && !value) {
      value = false;
      isValid = true;
    }
    if (!isValid) return 'Already ' + (value ? 'Enabled' : 'Disabled');

    if (!value) {
      isValid = false;
      for (let i = 0; i < allEvents.length; i++) {
        if (self.eventsEqual(allEvents[i], event)) {
          isValid = true;
          break;
        }
      }
      if (!isValid) return 'Invalid Event';
      allDisabled.push(event);
    } else {
      allDisabled.splice(index, 1);
    }
    return null;
  };

  /**
   * Checks if the two given events are equivalent.
   *
   * @param {HungryGames~Event} e1
   * @param {HungryGames~Event} e2
   * @return {boolean}
   */
  this.eventsEqual = function(e1, e2) {
    if (!e1 || !e2) return false;
    if (e1.message != e2.message) return false;
    if (e1.action != e2.action) return false;
    if (e1.consumes != e2.consumes) return false;
    if (!e1.battle != !e2.battle) return false;
    let v1 = e1.victim;
    let v2 = e2.victim;
    if (v1 && v2) {
      if (v1.count != v2.count) return false;
      if (v1.outcome != v2.outcome) return false;
      if (!v1.killer != !v2.killer) return false;
      if (v1.weapon && v2.weapon) {
        if (v1.weapon.name != v2.weapon.name) return false;
        if (v1.weapon.count != v2.weapon.count) return false;
      } else if (!(!v1.weapon && !v2.weapon)) {
        return false;
      }
    } else if (!(!v1 && !v2)) {
      return false;
    }
    let a1 = e1.attacker;
    let a2 = e2.attacker;
    if (a1 && a2) {
      if (a1.count != a2.count) return false;
      if (a1.outcome != a2.outcome) return false;
      if (!a1.killer != !a2.killer) return false;
      if (a1.weapon && a2.weapon) {
        if (a1.weapon.name != a2.weapon.name) return false;
        if (a1.weapon.count != a2.weapon.count) return false;
      } else if (!(!a1.weapon && !a2.weapon)) {
        return false;
      }
    } else if (!(!a1 && !a2)) {
      return false;
    }
    return true;
  };

  /**
   * The callback after receiving a number from user input.
   *
   * @callback HungryGames~createEventNumCallback
   * @param {number} num The number received from the user.
   */

  /**
   * Let the user choose how many of something will be in this event being
   * created.
   *
   * @private
   * @param {Discord~Message} msg The message that lead to this being called.
   * @param {string} id The id of the guild this was triggered from.
   * @param {string} show The message to show explaining the number.
   * @param {HungryGames~createEventNumCallback} cb The callback after the user
   * has chosen a number.
   */
  function createEventNums(msg, id, show, cb) {
    msg.edit(show + '\nNo people');

    let num = 0;
    regLis = function() {
      newReact(maxReactAwaitTime);
      msg.awaitReactions(function(reaction, user) {
        if (user.id != self.client.user.id) {
          reaction.users.remove(user).catch(() => {});
        }
        return (reaction.emoji.name == emoji.arrow_up ||
                   reaction.emoji.name == emoji.arrow_down ||
                   reaction.emoji.name == emoji.white_check_mark) &&
               user.id == id;
      }, {max: 1, time: maxReactAwaitTime}).then(function(reactions) {
        if (reactions.size == 0) {
          msg.reactions.removeAll().catch(() => {});
          return;
        }
        let name = reactions.first().emoji.name;
        if (name == emoji.arrow_up) {
          num++;
        } else if (name == emoji.arrow_down) {
          num--;
        } else if (name == emoji.white_check_mark) {
          cb(num);
          return;
        }
        let message = 'No people.';
        if (num < 0) {
          message = 'At least ' + num * -1 + ' people.';
        } else if (num > 0) {
          message = num + ' people exactly.';
        }
        msg.edit(show + '\n' + message);
        regLis();
      });
    };

    regLis();

    msg.react(emoji.white_check_mark).then(() => {
      msg.react(emoji.arrow_up).then(() => {
        msg.react(emoji.arrow_down);
      });
    });
  }
  /**
   * The callback after receiving an event outcome from a user.
   *
   * @callback HungryGames~createEventOutcomeCallback
   * @param {string} outcome The outcome chosen by the user.
   */

  /**
   * Let the user choose what the outcome of an event will be.
   *
   * @private
   * @param {Discord~Message} msg The message that lead to this being called.
   * @param {string} id The id of the guild this was triggered from.
   * @param {string} show The message to show explaining the options.
   * @param {HungryGames~createEventOutcomeCallback} cb The callback after the
   * user has chosen an outcome.
   */
  function createEventOutcome(msg, id, show, cb) {
    msg.edit(
        show + '\n' + getOutcomeEmoji('nothing') + 'Nothing, ' +
        getOutcomeEmoji('dies') + 'Dies, ' + getOutcomeEmoji('wounded') +
        'Wounded, ' + getOutcomeEmoji('thrives') + 'Healed');

    newReact(maxReactAwaitTime);
    msg.awaitReactions(function(reaction, user) {
      return (reaction.emoji.name == getOutcomeEmoji('thrives') ||
                 reaction.emoji.name == getOutcomeEmoji('wounded') ||
                 reaction.emoji.name == getOutcomeEmoji('nothing') ||
                 reaction.emoji.name == getOutcomeEmoji('dies')) &&
             user.id == id;
    }, {max: 1, time: maxReactAwaitTime}).then(function(reactions) {
      if (reactions.size == 0) {
        msg.reactions.removeAll().catch(() => {});
        return;
      }
      switch (reactions.first().emoji.name) {
        case getOutcomeEmoji('thrives'):
          cb('thrives');
          return;
        case getOutcomeEmoji('wounded'):
          cb('wounded');
          return;
        case getOutcomeEmoji('nothing'):
          cb('nothing');
          return;
        case getOutcomeEmoji('dies'):
          cb('dies');
          return;
      }
    });

    msg.react(getOutcomeEmoji('nothing')).then(() => {
      msg.react(getOutcomeEmoji('dies')).then(() => {
        msg.react(getOutcomeEmoji('wounded')).then(() => {
          msg.react(getOutcomeEmoji('thrives'));
        });
      });
    });
  }
  /**
   * The callback after receiving a boolean input.
   *
   * @callback HungryGames~createEventBooleanCallback
   * @param {boolean} outcome The value chosen by the user.
   */

  /**
   * Let the user choose whether the event attackers and victims kill anyone.
   *
   * @private
   * @param {Discord~Message} msg The message that lead to this being called.
   * @param {string} id The id of the guild this was triggered from.
   * @param {string} show The message to show explaining the options.
   * @param {HungryGames~createEventBooleanCallback} cb The callback after the
   * user has chosen an outcome.
   */
  function createEventAttacker(msg, id, show, cb) {
    msg.edit(show);

    newReact(maxReactAwaitTime);
    msg.awaitReactions(function(reaction, user) {
      return (reaction.emoji.name == emoji.white_check_mark ||
                 reaction.emoji.name == emoji.x) &&
             user.id == id;
    }, {max: 1, time: maxReactAwaitTime}).then(function(reactions) {
      if (reactions.size == 0) {
        msg.reactions.removeAll().catch(() => {});
        return;
      }
      if (reactions.first().emoji.name == emoji.white_check_mark) {
        cb(true);
      } else {
        cb(false);
      }
    });

    msg.react(emoji.white_check_mark).then(() => {
      msg.react(emoji.x);
    });
  }

  /**
   * When a user is creating a custom event and edits their message, we need to
   * edit the preview.
   *
   * @private
   * @param {Discord~Message} msg Our message previewing the new event.
   */
  function updateEventPreview(msg) {
    msg.text = msg.text.split(' ').slice(1).join(' ');
    let helpMsg =
        '```\nEdit your message until you are happy with the below outcomes, ' +
        'then click the type of event.\n\nReplace names with "{victim}" or ' +
        '"{attacker}" (with brackets).\n\nUse "[Vsinglular|plural]" or ' +
        '"[Asingular|plural]" to put "singular" if there\'s only one person, ' +
        'or "plural" if there are more\n (A for attacker, V for victim).\n```';
    let finalOptionsHelp =
        emoji.red_circle + 'Bloodbath event, ' + emoji.trophy + 'Normal event.';
    let users = msg.guild.members.random(4);
    let players = [];
    let cnt = 0;
    for (let i = 0; cnt < 4; i++) {
      let nextUser = users[i % users.length];
      if (typeof nextUser === 'undefined') continue;
      players.push(makePlayer(nextUser.user));
      cnt++;
    }
    try {
      let single =
          makeSingleEvent(
              msg.text, players.slice(0), 1, 1, false, msg.guild.id, 'nothing',
              'nothing', find(msg.guild.id).options.useNicknames)
              .message;
      let pluralOne =
          makeSingleEvent(
              msg.text, players.slice(0), 2, 1, false, msg.guild.id, 'nothing',
              'nothing', find(msg.guild.id).options.useNicknames)
              .message;
      let pluralTwo =
          makeSingleEvent(
              msg.text, players.slice(0), 1, 2, false, msg.guild.id, 'nothing',
              'nothing', find(msg.guild.id).options.useNicknames)
              .message;
      let pluralBoth =
          makeSingleEvent(
              msg.text, players.slice(0), 2, 2, false, msg.guild.id, 'nothing',
              'nothing', find(msg.guild.id).options.useNicknames)
              .message;
      msg.myResponse.edit(
          helpMsg + single + '\n' + pluralOne + '\n' + pluralTwo + '\n' +
          pluralBoth +
          '\n\n(Tip: The Hungry Games can be managed from my website: ' +
          'https://www.spikeybot.com/hg/)\n' + finalOptionsHelp);
    } catch (err) {
      console.log(err);
    }
  }
  /**
   * Delete a custom event from a guild.
   *
   * @private
   * @type {HungryGames~hgCommandHandler}
   * @param {Discord~Message} msg The message that lead to this being called.
   * @param {string} id The id of the guild this was triggered from.
   */
  function removeEvent(msg, id) {
    if (!find(id)) {
      self.common.reply(
          msg, 'You must first create an event in order to remove it.');
      return;
    }
    const split = msg.text.split(' ');

    if (split.length == 1) {
      self.common.reply(
          msg, 'You must specify the number of the custom event you wish to ' +
              'remove.');
      return;
    } else if (isNaN(split[1])) {
      self.common.reply(
          msg,
          'The number you specified, isn\'t a number, please pick a number.');
      return;
    } else if (split[1] <= 0) {
      self.common.reply(
          msg, 'The number you chose, is a bad number. I don\'t like it.');
      return;
    }

    const num = split[1] - 1;

    self.common
        .reply(
            msg, 'Which type of event is this?',
            emoji.red_circle + 'Bloodbath, ' + emoji.trophy + 'Normal.')
        .then((msg_) => {
          newReact(maxReactAwaitTime);
          msg_.awaitReactions(function(reaction, user) {
            return user.id == msg.author.id &&
                    (reaction.emoji.name == emoji.red_circle ||
                     reaction.emoji.name == emoji.trophy);
          }, {max: 1, time: maxReactAwaitTime}).then(function(reactions) {
            if (reactions.size == 0) {
              msg_.reactions.removeAll().catch(()=>{});
              return;
            }
            let eventType = 'player';
            if (reactions.first().emoji.name == emoji.red_circle) {
              eventType = 'bloodbath';
            }

            if (eventType == 'player') {
              if (num >= find(id).customEvents.player.length) {
                self.common.reply(
                    msg,
                    'That number is a really big scary number. Try a smaller ' +
                        'one.');
                msg_.delete().catch(() => {});
              } else {
                const removed = find(id).customEvents.player.splice(num, 1)[0];
                self.common.reply(
                    msg, 'Removed event.', formatEventString(removed, true));
                msg_.delete().catch(() => {});
              }
            } else {
              if (num >= find(id).customEvents.bloodbath.length) {
                self.common.reply(
                    msg,
                    'That number is a really big scary number. Try a smaller ' +
                        'one.');
                msg_.delete().catch(() => {});
              } else {
                const removed =
                    find(id).customEvents.bloodbath.splice(num, 1)[0];
                self.common.reply(
                    msg, 'Removed event.', formatEventString(removed, true));
                msg_.delete().catch(() => {});
              }
            }
          });

          msg_.react(emoji.red_circle).then(() => {
            msg_.react(emoji.trophy);
          });
        });
  }
  /**
   * Put information about an array of events into the array.
   *
   * @private
   * @param {HungryGames~Event[]} events Array of events to process and modify.
   */
  function fetchStats(events) {
    let numKill = 0;
    let numWound = 0;
    let numThrive = 0;
    events.forEach(function(obj) {
      if (obj.attacker.outcome == 'dies' || obj.victim.outcome == 'dies') {
        numKill++;
      }
      if (obj.attacker.outcome == 'wounded' ||
          obj.victim.outcome == 'wounded') {
        numWound++;
      }
      if (obj.attacker.outcome == 'thrives' ||
          obj.victim.outcome == 'thrives') {
        numThrive++;
      }
    });
    events.numKill = numKill;
    events.numWound = numWound;
    events.numThrive = numThrive;
  }
  /**
   * Allow user to view all events available on their server and summary of each
   * type of event.
   *
   * @private
   * @type {HungryGames~hgCommandHandler}
   * @param {Discord~Message} msg The message that lead to this being called.
   * @param {string} id The id of the guild this was triggered from.
   * @param {number} [page=0] The page number to show.
   * @param {string} [eventType='player'] The type of event to show.
   * @param {Discord~Message} [editMsg] The message to edit instead of sending a
   * new message.
   */
  function listEvents(msg, id, page = 0, eventType, editMsg) {
    let embed = new self.Discord.MessageEmbed();

    let events = [];
    let numCustomEvents = 0;
    let title;
    if (!eventType) eventType = 'player';
    if (eventType == 'player') {
      if (find(id) && find(id).customEvents.player) {
        events = JSON.parse(JSON.stringify(find(id).customEvents.player));
        numCustomEvents = find(id).customEvents.player.length;
      }
      events.push(
          new Event(emoji.arrow_up + 'Custom | Default' + emoji.arrow_down));
      events = events.concat(JSON.parse(JSON.stringify(defaultPlayerEvents)));
      title = 'Player';
      fetchStats(events);
      embed.setColor([0, 255, 0]);
    } else if (eventType == 'bloodbath') {
      if (find(id) && find(id).customEvents.bloodbath) {
        events = JSON.parse(JSON.stringify(find(id).customEvents.bloodbath));
        numCustomEvents = find(id).customEvents.bloodbath.length;
      }
      events.push(
          new Event(emoji.arrow_up + 'Custom | Default' + emoji.arrow_down));
      events =
          events.concat(JSON.parse(JSON.stringify(defaultBloodbathEvents)));
      title = 'Bloodbath';
      fetchStats(events);
      embed.setColor([255, 0, 0]);
    } else if (eventType == 'arena') {
      if (find(id) && find(id).customEvents.arena) {
        events = JSON.parse(JSON.stringify(find(id).customEvents.arena));
        numCustomEvents = find(id).customEvents.arena.length;
      }
      if (numCustomEvents == 0 && page <= 0) {
        page = 1;
      }
      events.push(
          new Event(emoji.arrow_up + 'Custom | Default' + emoji.arrow_down));
      events = events.concat(JSON.parse(JSON.stringify(defaultArenaEvents)));

      events = events.map(function(obj, i) {
        if (obj.outcomes) {
          fetchStats(obj.outcomes);

          const percentKill = obj.outcomes.numKill / obj.outcomes.length;
          const percentWound = obj.outcomes.numWound / obj.outcomes.length;
          const percentHeal = obj.outcomes.numThrive / obj.outcomes.length;

          const eventMessage = '**___' + obj.message + '___** (' +
              Math.round(percentKill * 1000) / 10 + '% kill, ' +
              Math.round(percentWound * 1000) / 10 + '% wound, ' +
              Math.round(percentHeal * 1000) / 10 + '% heal.)\n' +
              obj.outcomes
                  .map(function(outcome, index) {
                    return alph[index] + ') ' +
                        formatEventString(outcome, true);
                  })
                  .join('\n');

          return new Event(eventMessage);
        } else {
          obj.message = '**___' + obj.message + '___**';
          return obj;
        }
      });
      title = 'Arena';
      embed.setColor([0, 0, 255]);
    } else {
      self.error('HOW COULD THIS BE? I\'ve made a mistake!');
      self.common.reply(msg, 'BIG Oops! THIS SHOULD _never_ happen');
    }

    const numEvents = events.length;
    const numThisPage = eventType == 'arena' ? 1 : numEventsPerPage;
    const numPages = Math.ceil(numEvents / numThisPage);
    if (page * numThisPage >= numEvents) {
      page = numPages - 1;
    } else if (page < 0) {
      page = 0;
    }

    let fullTitle = 'All ' + title + ' Events (' + (numEvents - 1) + ') ';
    if (eventType != 'arena') {
      fullTitle += Math.round(events.numKill / events.length * 1000) / 10 +
          '% kill, ' + Math.round(events.numWound / events.length * 1000) / 10 +
          '% wound, ' +
          Math.round(events.numThrive / events.length * 1000) / 10 + '% heal.';
    }
    embed.setTitle(fullTitle);
    embed.setFooter('(Page: ' + (page + 1) + '/' + numPages + ')');

    embed.setDescription(
        events.slice(page * numThisPage, (page + 1) * numThisPage)
            .map(function(obj, index) {
              let num = (index + 1 + numThisPage * page);
              if (eventType == 'arena') {
                num = 0;
              } else {
                // Not equal to because we are 1 indexed, not 0.
                if (num > numCustomEvents) num -= numCustomEvents + 1;
              }

              if (num == 0) {
                return obj.message;
              } else {
                return num + ') ' + formatEventString(obj, true);
              }
            })
            .join('\n'));

    let callback = function(msg_) {
      newReact(maxReactAwaitTime);
      msg_.awaitReactions(function(reaction, user) {
        if (user.id != self.client.user.id) {
          reaction.users.remove(user).catch(() => {});
        }
        return user.id == msg.author.id &&
                (reaction.emoji.name == emoji.arrow_right ||
                 reaction.emoji.name == emoji.arrow_left ||
                 reaction.emoji.name == emoji.arrow_double_right ||
                 reaction.emoji.name == emoji.arrow_double_left ||
                 reaction.emoji.name == emoji.arrows_counterclockwise);
      }, {max: 1, time: maxReactAwaitTime}).then(function(reactions) {
        if (reactions.size == 0) {
          msg_.reactions.removeAll().catch(() => {});
          return;
        }
        switch (reactions.first().emoji.name) {
          case emoji.arrow_right:
            listEvents(msg, id, page + 1, eventType, msg_);
            break;
          case emoji.arrow_left:
            listEvents(msg, id, page - 1, eventType, msg_);
            break;
          case emoji.arrow_double_right:
            listEvents(msg, id, numPages - 1, eventType, msg_);
            break;
          case emoji.arrow_double_left:
            listEvents(msg, id, 0, eventType, msg_);
            break;
          case emoji.arrows_counterclockwise:
            if (eventType == 'player') {
              eventType = 'arena';
            } else if (eventType == 'arena') {
              eventType = 'bloodbath';
            } else if (eventType == 'bloodbath') {
              eventType = 'player';
            }
            listEvents(msg, id, 0, eventType, msg_);
            break;
        }
      });

      let myReactions = msg_.reactions.filter(function(obj) {
        return obj.me;
      });
      if (!myReactions.find((r) => r.name == emoji.arrow_right) ||
          !myReactions.find((r) => r.name == emoji.arrow_left) ||
          !myReactions.find((r) => r.name == emoji.arrow_double_right) ||
          !myReactions.find((r) => r.name == emoji.arrow_double_left) ||
          !myReactions.find((r) => r.name == emoji.arrows_counterclockwise)) {
        msg_.react(emoji.arrow_double_left)
            .then(() => {
              msg_.react(emoji.arrow_left).then(() => {
                msg_.react(emoji.arrow_right).then(() => {
                  msg_.react(emoji.arrow_double_right).then(() => {
                    msg_.react(emoji.arrows_counterclockwise);
                  });
                });
              });
            })
            .catch(console.log);
      }
    };

    if (!editMsg) {
      msg.channel.send(embed).then(callback);
    } else {
      editMsg.edit(embed).then(callback);
    }
  }

  /**
   * Format an event to show its settings to the user.
   *
   * @private
   * @param {HungryGames~Event|string} arenaEvent The event to format.
   * @param {boolean} [newline=false] If a new line should be inserted for
   * better formatting.
   * @return {string} The formatted message with emojis.
   */
  function formatEventString(arenaEvent, newline) {
    let message = arenaEvent.message.replaceAll('{attacker}', '`attacker`')
        .replaceAll('{victim}', '`victim`')
        .replaceAll('{dead}', '`dead`');
    if (newline) message += '\n    ';
    message += '(' + emoji.crossed_swords + ': ' +
        ('' + arenaEvent.attacker.count).replace('-', '>');
    if (arenaEvent.attacker.count != 0) {
      message += ', ' + getOutcomeEmoji(arenaEvent.attacker.outcome) +
          (arenaEvent.attacker.killer ? ' Killer ' : '');
    }
    message += ')';
    if (newline) message += '\n    ';
    message += '(' + emoji.shield + ': ' +
        ('' + arenaEvent.victim.count).replace('-', '>');
    if (arenaEvent.victim.count != 0) {
      message += ', ' + getOutcomeEmoji(arenaEvent.victim.outcome) +
          (arenaEvent.victim.killer ? ' Killer' : '');
    }

    return message + ')';
  }

  /**
   * Get the emoji for a specific outcome of an event.
   *
   * @private
   * @param {string} outcome The outcome to get the emoji of.
   * @return {string} The emoji.
   */
  function getOutcomeEmoji(outcome) {
    switch (outcome) {
      case 'dies':
        return emoji.skull;
      case 'nothing':
        return emoji.white_check_mark;
      case 'wounded':
        return emoji.yellow_heart;
      case 'thrives':
        return emoji.heart;
      default:
        return emoji.question;
    }
  }

  /**
   * Send help message to DM and reply to server.
   *
   * @private
   * @type {HungryGames~hgCommandHandler}
   * @param {Discord~Message} msg The message that lead to this being called.
   * @param {string} id The id of the guild this was triggered from.
   */
  function help(msg, id) {
    msg.author.send(self.helpMessage)
        .then(() => {
          if (msg.guild != null) {
            self.common.reply(msg, helpmessagereply, ':wink:').catch((err) => {
              self.error(
                  'Failed to send HG help message reply in channel: ' +
                  msg.channel.id);
              console.error(err);
            });
          }
        })
        .catch(() => {
          self.common.reply(msg, blockedmessage).catch(() => {});
        });
  }

  /**
   * Replies to the user with stats about all the currently loaded games in this
   * shard.
   *
   * @private
   * @type {HungryGames~hgCommandHandler}
   * @param {Discord~Message} msg The message that lead to this being called.
   * @param {string} id The id of the guild this was triggered from.
   */
  function commandStats(msg, id) {
    let listenerBlockDuration = listenersEndTime - Date.now();
    let message = 'There are ' + self.getNumSimulating() +
        ' games currently simulating of ' + Object.keys(games).length +
        ' currently loaded.';
    if (listenerBlockDuration > 0) {
      message += '\nThe last listener will end in ' +
          (Math.round(listenerBlockDuration / 100 / 60) / 10) + ' minutes.';
    }
    if (web) {
      let numClients = web.getNumClients();
      message += '\n' + numClients + ' web client' +
          (numClients == 1 ? '' : 's') + ' connected.';
    }
    self.common.reply(msg, message);
  }

  /**
   * Replies to the user with an image saying "rigged". That is all.
   *
   * @private
   * @type {HungryGames~hgCommandHandler}
   * @param {Discord~Message} msg The message that lead to this being called.
   * @param {string} id The id of the guild this was triggered from.
   */
  function commandRig(msg, id) {
    let embed = new self.Discord.MessageEmbed();
    embed.setThumbnail('https://discordemoji.com/assets/emoji/rigged.png');
    embed.setColor([187, 26, 52]);
    msg.channel.send(self.common.mention(msg), embed);
  }

  /**
   * Allows the game creator to kill a player in the game.
   *
   * @private
   * @type {HungryGames~hgCommandHandler}
   * @param {Discord~Message} msg The message that lead to this being called.
   * @param {string} id The id of the guild this was triggered from.
   */
  function commandKill(msg, id) {
    if (msg.mentions.users.size <= 0) {
      self.common.reply(msg, 'Please specify a player in the games to kill.');
      return;
    }
    if (!find(id)) createGame(msg, id);
    let players = [];
    let notInGame = msg.mentions.users.find((u) => {
      players.push(u.id);
      return !find(id).includedUsers.find((p) => {
        return p.id == u.ud;
      });
    });
    if (notInGame) {
      self.common.reply(
          msg, notInGame.tag + ' does not appear to be in the current game.');
      return;
    }
    self.common.reply(
        msg,
        self.forcePlayerState(id, players, 'dead', getMessage('forcedDeath')));
  }

  /**
   * Allows the game creator to heal or revive a player in the game.
   *
   * @private
   * @type {HungryGames~hgCommandHandler}
   * @param {Discord~Message} msg The message that lead to this being called.
   * @param {string} id The id of the guild this was triggered from.
   */
  function commandHeal(msg, id) {
    if (msg.mentions.users.size <= 0) {
      self.common.reply(msg, 'Please specify a player in the games to heal.');
      return;
    }
    if (!find(id)) createGame(msg, id);
    let players = [];
    let notInGame = msg.mentions.users.find((u) => {
      players.push(u.id);
      return !find(id).includedUsers.find((p) => {
        return p.id == u.ud;
      });
    });
    if (notInGame) {
      self.common.reply(
          msg, notInGame.tag + ' does not appear to be in the current game.');
      return;
    }
    self.common.reply(
        msg, self.forcePlayerState(
            id, players, 'thriving', getMessage('forcedHeal')));
  }

  /**
   * Allows the game creator to wound a player in the game.
   *
   * @private
   * @type {HungryGames~hgCommandHandler}
   * @param {Discord~Message} msg The message that lead to this being called.
   * @param {string} id The id of the guild this was triggered from.
   */
  function commandWound(msg, id) {
    if (msg.mentions.users.size <= 0) {
      self.common.reply(msg, 'Please specify a player in the games to wound.');
      return;
    }
    if (!find(id)) createGame(msg, id);
    let players = [];
    let notInGame = msg.mentions.users.find((u) => {
      players.push(u.id);
      return !find(id).includedUsers.find((p) => {
        return p.id == u.ud;
      });
    });
    if (notInGame) {
      self.common.reply(
          msg, notInGame.tag + ' does not appear to be in the current game.');
      return;
    }
    self.common.reply(
        msg, self.forcePlayerState(
            id, players, 'wounded', getMessage('forcedWound')));
  }

  /**
   * Force a player to have a certain outcome in the current day being
   * simulated, or the next day that will be simulated. This is acheived by
   * adding a custom event in which the player will be affected after their
   * normal event for the day.
   * @public
   *
   * @param {string} id The guild ID in which the users will be affected.
   * @param {string[]} list The array of player IDs of which to affect.
   * @param {string} state The outcome to force the players to have been
   * victims of by the end of the simulated day. ("living", "dead", "wounded",
   * or "thriving").
   * @param {string} text Message to show when the user is affected.
   * @param {boolean} [persists=false] Does this outcome persist to the end of
   * the game, if false it only exists for the next day.
   * @return {string} The output message to tell the user of the outcome of the
   * operation.
   */
  this.forcePlayerState = function(id, list, state, text, persists = false) {
    if (typeof id === 'object') {
      persists = id.persists;
      text = id.text;
      state = id.state;
      list = id.list;
      id = id.id;
    }
    if (!find(id) || !find(id).currentGame) return 'No game has been created.';
    if (!Array.isArray(list) || list.length == 0) return 'No players given.';
    if (typeof state !== 'string') return 'No outcome given.';
    if (typeof text !== 'string') return 'No message given.';
    list.forEach((p) => {
      if (find(id).currentGame.day.state > 0) {
        let player =
            find(id).currentGame.includedUsers.find((el) => el.id == p);
        if (!player) return 'Unable to find player.';
        let outcome;
        if (player.living && state === 'dead') {
          outcome = 'dies';
          killUser(id, player, 0, null);
        } else if (
          !player.living && (state === 'living' || state === 'thriving')) {
          outcome = 'revived';
          reviveUser(id, player, 0, null);
        } else if (player.state === 'wounded' && state === 'thriving') {
          outcome = 'thrives';
          restoreUser(id, player, 0, null);
        } else if (
          player.living && player.state !== 'wounded' &&
            state === 'wounded') {
          outcome = 'wounded';
          woundUser(id, player, 0, null);
        } else {
          return;
        }
        let evt = makeSingleEvent(
            text, [player], 1, 0, find(id).options.mentionAll, id, outcome,
            'nothing', find(id).options.useNicknames);
        let lastIndex = find(id).currentGame.day.state - 1;
        for (let i = find(id).currentGame.day.events.length - 1; i > lastIndex;
          i--) {
          if (find(id).currentGame.day.events[i].icons.find(
              (el) => el.id == p)) {
            lastIndex = i + 1;
            break;
          }
        }
        find(id).currentGame.day.events.splice(lastIndex, 0, evt);
      } else {
        find(id).currentGame.forcedOutcomes.push({
          id: id,
          list: list,
          state: state,
          text: text,
          persists: persists,
        });
      }
    });
    return 'Player(s) will be ' + state + ' by the end of the day.';
  };

  /**
   * Returns the number of games that are currently being shown to users.
   *
   * @public
   * @return {number} Number of games simulating.
   */
  this.getNumSimulating = function() {
    const loadedEntries = Object.entries(games);
    const inProgress = loadedEntries.filter((game) => {
      return game[1].currentGame.inProgress &&
          game[1].currentGame.day.state > 1;
    });
    return inProgress.length;
  };

  /**
   * Get a random word that means "nothing".
   *
   * @private
   * @return {string} A word meaning "nothing".
   */
  function nothing() {
    const nothings = [
      'nix',
      'naught',
      'nothing',
      'zilch',
      'void',
      'zero',
      'zip',
      'zippo',
      'diddly',
      emoji.x,
    ];
    return nothings[Math.floor(Math.random() * nothings.length)];
  }

  /**
   * Get a random message of a given type from hgMessages.json.
   *
   * @private
   * @param {string} type The message type to get.
   * @return {string} A random message of the given type.
   */
  function getMessage(type) {
    const list = messages[type];
    if (!list) return 'badtype';
    const length = list.length;
    if (length == 0) return 'nomessage';
    return list[Math.floor(Math.random() * length)];
  }

  /**
   * Returns a guild's game data. Returns cached version if that exists, or
   * searches the file system for saved data. Data will only be checked from
   * disk at most once every `HungryGames~findDelay` milliseconds. Returns
   * `null` if data could not be found, or an error occurred.
   *
   * @private
   * @param {number|string} id The guild id to get the data for.
   * @return {?HungryGames~GuildGame} The game data, or null if no game could be
   * loaded.
   */
  function find(id) {
    if (games[id]) return games[id];
    if (Date.now() - findTimestamps[id] < findDelay) return null;
    findTimestamps[id] = Date.now();
    try {
      let tmp =
          fs.readFileSync(self.common.guildSaveDir + id + hgSaveDir + saveFile);
      try {
        games[id] = JSON.parse(tmp);
        self.debug('Loaded game from file ' + id);
      } catch (e2) {
        self.error('Failed to parse game data for guild ' + id);
        return null;
      }
    } catch (e) {
      // File probably doesn't exist.
      // TODO: Log if something goes wrong other than file not existing.
      return null;
    }

    // Flush default and stale options.
    if (games[id].options) {
      for (let opt in defaultOptions) {
        if (!defaultOptions[opt] instanceof Object) continue;
        if (typeof games[id].options[opt] !==
            typeof defaultOptions[opt].value) {
          if (defaultOptions[opt].value instanceof Object) {
            games[id].options[opt] =
                Object.assign({}, defaultOptions[opt].value);
          } else {
            games[id].options[opt] = defaultOptions[opt].value;
          }
        } else if (defaultOptions[opt].value instanceof Object) {
          let dKeys = Object.keys(defaultOptions[opt].value);
          dKeys.forEach((el) => {
            if (typeof games[id].options[opt][el] !==
                typeof defaultOptions[opt].value[el]) {
              games[id].options[opt][el] = defaultOptions[opt].value[el];
            }
          });
        }
      }
      for (let opt in games[id].options) {
        if (!games[id].options[opt] instanceof Object) continue;
        if (typeof defaultOptions[opt] === 'undefined') {
          delete games[id].options[opt];
        } else if (games[id].options[opt].value instanceof Object) {
          let keys = Object.keys(games[id].options[opt].value);
          keys.forEach((el) => {
            if (typeof games[id].options[opt][el] !==
                typeof defaultOptions[opt].value[el]) {
              delete games[id].options[opt][el];
            }
          });
        }
      }
    }
    // If the bot stopped while simulating a day, just start over and try
    // again.
    if (games[id].currentGame.day.state === 1) {
      games[id].currentGame.day.state = 0;
    }
    return games[id];
  }

  /**
   * Calculates the number of columns for the given player list. Assumes maximum
   * character count of 1024 per section. The number of columns also becomes
   * limited to 5, because we will run into the embed total character limit of
   * 6000 if we add any more.
   * [Discord API Docs](
   * https://discordapp.com/developers/docs/resources/channel#embed-limits)
   * @private
   *
   * @param {number} numCols Minimum number of columns.
   * @param {string[]} statusList List of text to check.
   * @return {number} Number of columns the data shall be formatted as.
   */
  function calcColNum(numCols, statusList) {
    if (numCols === statusList.length) return numCols;
    // if (numCols > 25) return 25;
    if (numCols > 5) return 5;
    const quarterLength = Math.ceil(statusList.length / numCols);
    for (let i = 0; i < numCols; i++) {
      if (statusList.slice(quarterLength * i, quarterLength * (i + 1))
          .join('\n')
          .length > 1024) {
        return calcColNum(numCols + 1, statusList);
      }
    }
    return numCols;
  }

  /**
   * Recursively freeze all elements of an object.
   *
   * @private
   * @param {Object} object The object to deep freeze.
   * @return {Object} The frozen object.
   */
  function deepFreeze(object) {
    let propNames = Object.getOwnPropertyNames(object);
    for (let name of propNames) {
      let value = object[name];
      object[name] =
          value && typeof value === 'object' ? deepFreeze(value) : value;
    }
    return Object.freeze(object);
  }

  /**
   * Update {@link HungryGames~listenersEndTime} because a new listener was
   * registered with the given duration.
   * @private
   * @param {number} duration The length of time the listener will be active.
   */
  function newReact(duration) {
    if (Date.now() + duration > listenersEndTime) {
      listenersEndTime = Date.now() + duration;
    }
  }

  /**
   * Attempt to fetch an image from a URL. Checks if the file has been cached to
   * the filesystem first.
   * @private
   *
   * @param {string} url The url to fetch the image from.
   * @return {Promise} Promise from JIMP with image data.
   */
  function readImage(url) {
    let splitURL = url.match(/\/(avatars)\/(\d+)\/([^?&\/]+)/);
    let filename;
    let dir;
    let fromCache = false;
    if (splitURL && splitURL[1] == 'avatars') {
      dir = self.common.userSaveDir + splitURL[2] + '/';
      filename = dir + splitURL[3];
    }
    if (filename && fs.existsSync(filename)) {
      fromCache = true;
      return toJimp(filename);
    }
    return toJimp(url).then((image) => {
      if (fromCache) return image;
      if (filename) {
        mkdirp(dir, (err) => {
          if (err) {
            self.error(
                'Failed to create user directory to cache avatar: ' + dir);
            console.error(err);
            return;
          }
          image.getBuffer(Jimp.MIME_PNG, (err, buffer) => {
            if (err) {
              self.error(
                  'Failed to convert image into buffer: ' + (filename || url));
              console.error(err);
              return;
            }
            fs.writeFile(filename, buffer, (err) => {
              if (err) {
                self.error('Failed to cache avatar: ' + filename);
                console.error(err);
              }
            });
          });
        });
      }
      return image;
    });
    /**
     * Send the request to Jimp to handle.
     * @private
     *
     * @param {string} path Or path that Jimp can handle.
     * @return {Promise} Promise from Jimp with image data.
     */
    function toJimp(path) {
      return Jimp.read(path).catch((err) => {
        if (fromCache) {
          self.error('Failed to read from cache: ' + path);
          console.error(err);
          fromCache = false;
          toJimp(url);
        }
      });
    }
  }

  // Util //
  /**
   * Save all game data to file.
   *
   * @override
   * @param {string} [opt='sync'] Can be 'async', otherwise defaults to
   * synchronous.
   * @param {boolean} [wait=false] If requested before subModule is
   * initialized,
   * keep trying until it is initialized.
   */
  this.save = function(opt, wait) {
    if (!self.initialized) {
      if (wait) {
        setTimeout(function() {
          self.save(opt, wait);
        });
      }
      return;
    }
    Object.entries(games).forEach(function(obj) {
      const id = obj[0];
      const data = obj[1];
      const dir = self.common.guildSaveDir + id + hgSaveDir;
      const filename = dir + saveFile;
      const saveStartTime = Date.now();
      if (opt == 'async') {
        mkdirp(dir, function(err) {
          if (err) {
            self.error('Failed to create directory for ' + dir);
            console.error(err);
            return;
          }
          fs.writeFile(filename, JSON.stringify(data), function(err2) {
            if (err2) {
              self.error('Failed to save HG data for ' + filename);
              console.error(err2);
            } else if (findTimestamps[id] - saveStartTime < -15 * 60 * 1000) {
              delete games[id];
              delete findTimestamps[id];
              self.debug('Purged ' + id);
            }
          });
        });
      } else {
        try {
          mkdirp.sync(dir);
        } catch (err) {
          self.error('Failed to create directory for ' + dir);
          console.error(err);
          return;
        }
        try {
          fs.writeFileSync(filename, JSON.stringify(data));
        } catch (err) {
          self.error('Failed to save HG data for ' + filename);
          console.error(err);
          return;
        }
        if (findTimestamps[id] - Date.now() < -15 * 60 * 1000) {
          delete games[id];
          delete findTimestamps[id];
          self.debug('Purged ' + id);
        }
      }
    });
  };

  /**
   * Catch process exiting so we can save if necessary, and remove other
   * handlers to allow for another module to take our place.
   *
   * @private
   * @param {number} [code] The exit code.
   * @listens Process#exit
   */
  function exit(code) {
    if (self.initialized) {
      self.log('Caught exit! ' + code);
    } else {
      console.log('Caught exit! ', code);
    }
    if (self.initialized /* && code == -1 */) {
      self.save();
    }
    try {
      self.end();
    } catch (err) {
      self.error('Exception during end!');
      console.log(err);
    }
  }
  /**
   * Same as exit(), but triggered via SIGINT, SIGHUP or SIGTERM.
   *
   * @private
   * @listens Process#SIGINT
   * @listens Process#SIGHUP
   * @listens Process#SIGTERM
   */
  function sigint() {
    if (self.initialized) {
      self.log('Caught SIGINT!');
    } else {
      console.log('HG: Caught SIGINT!');
    }
    if (self.initialized) {
      try {
        self.save();
      } catch (err) {
        self.error('FAILED TO SAVE ON SIGINT' + err);
      }
    }
    try {
      self.end();
    } catch (err) {
    }
    process.removeListener('exit', exit);
    process.exit();
  }

  // Catch reasons for exiting in order to save first.
  process.on('exit', exit);
  process.on('SIGINT', sigint);
  process.on('SIGHUP', sigint);
  process.on('SIGTERM', sigint);
}

module.exports = new HungryGames();
