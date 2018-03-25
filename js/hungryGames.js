const fs = require('fs');
const jimp = require('jimp');

var initialized = false;

const saveFile = 'hg.json';
const eventFile = 'hgEvents.json';

// Must be supported by discord. (Mostly just powers of 2).
const iconSize = 48;
const victorIconSize = 64;
const fetchSize = 64;
// Pixels between each icon
const iconGap = 4;

// Role that a user must have in order to perform any commands.
const roleName = "HG Creator";

// Default options for a game.
const defaultOptions = {
  // Are arena events possible.
  arenaEvents: true,
  // Can users be resurrected.
  resurrection: false,
  // Should bots be included in the games. If this is false, bots cannot be
  // added manually.
  includeBots: false,
  // Should it be possible to end a game without any winners.
  allowNoVictors: true,
  // Number of days a user can bleed before they can die.
  bleedDays: 2,
  // Maximum size of teams when automatically forming teams.
  teamSize: 0,
  // Will teammates work together. If false, teammates can kill eachother, and
  // there will only be 1 victor. If true, teammates cannot kill eachother, and
  // the game ends when one TEAM is remaining, not one player.
  teammatesCollaborate: true,
  // Should the victor of the game (can be team), be tagged/mentioned so they
  // get notified?
  mentionVictor: true,
  // Should a user be mentioned every time something happens to them in the
  // game?
  mentionAll: false,
  // Should @everyone be mentioned when the game is started?
  mentionEveryoneAtStart: false,
  // Delay in milliseconds between each event being printed.
  delayEvents: 3500,
  // Delay in milliseconds between each day being printed.
  delayDays: 7000,
  // Probability that each day a dead player can be put back into the game.
  probabilityOfResurrect: 0.33,
  // Probability that each day an arena event will happen.
  probabilityOfArenaEvent: 0.25,
  // Probability that after bleedDays a player will die. If they don't die, they
  // will heal back to normal.
  probabilityOfBleedToDeath: 0.5
};

// Default color to choose for embedded messages.
const defaultColor = [200, 125, 0];

const emoji = {
  x: "❌",
  white_check_mark: "✅",
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
  arrow_up: "⬆",
  arrow_down: "⬇",
  yellow_heart: "💛",
  negative_squared_cross_mark: "❎",
  ballot_box_with_check: "☑",
  skull_crossbones: "☠",
  slight_smile: "🙂"
};

// Probability of each amount of people being chosen for an event.
// Must total to 1.0
const multiEventUserDistribution = {
  1: 0.66,
  2: 0.269,
  3: 0.03,
  4: 0.02,
  6: 0.015,
  7: 0.005,
  8: 0.0005,
  9: 0.0005
};

var prefix, Discord, client, command, common;
var myPrefix, helpMessage;
// All currently tracked games.
var games = {};
// All intervals for printing events.
var intervals = {};
// Default parsed bloodbath events.
var defaultBloodbathEvents = [];
// Default parsed player events.
var defaultPlayerEvents = [];
// Default parsed arena events.
var defaultArenaEvents = [];

var newEventMessages = {};

// Read saved game data from disk.
fs.readFile(saveFile, function(err, data) {
  if (err) return;
  games = JSON.parse(data);
  if (!games) games = {};
});
// Parse all default events.
function updateEvents() {
  fs.readFile(eventFile, function(err, data) {
    if (err) return;
    try {
      var parsed = JSON.parse(data);
      if (parsed) {
        defaultBloodbathEvents = parsed["bloodbath"];
        defaultPlayerEvents = parsed["player"];
        defaultArenaEvents = parsed["arena"];
      }
    } catch (err) {
      console.log(err);
    }
  });
}
updateEvents();
fs.watchFile(eventFile, function(curr, prev) {
  if (curr.mtime == prev.mtime) return;
  if (common && common.LOG) {
    common.LOG("Re-reading default events from file", "HG");
  } else {
    console.log("HG: Re-reading default events from file");
  }
  updateEvents();
});

// Reply to help on a server.
const helpmessagereply = "I sent you a DM with commands!";
// Reply if unable to send message via DM.
const blockedmessage =
    "I couldn't send you a message, you probably blocked me :(";
exports.helpMessage = "Module loading...";
// Set all help messages once we know what prefix to use.
function setupHelp() {
exports.helpMessage = "`" + myPrefix + "help` for Hungry Games help.";
helpMessage =
"Hungry Games!\n" +
  "To use any of these commands you must have the \"" + roleName + "\" role.\n" +
  "```js\n=== Game Settings ===\n" +
  myPrefix + "create // This will create a game with default settings if it doesn't exist already.\n" +
  myPrefix + "options [option name] [value] // List options if no name, or change the option if you give a name.\n" +
  myPrefix + "reset {all/current/events/options/teams} // Delete data about the Games. Don't choose an option for more info.\n" +
  "\n=== Player Settings ===\n" +
  myPrefix + "players // This will list all players I currently care about.\n" +
  myPrefix + "exclude {mention} // Prevent someone from being added to the next game.\n" +
  myPrefix + "include {mention} // Add a person back into the next game.\n" +
  "\n=== Team Settings ===\n" +
  myPrefix + "teams swap {mention} {mention} // This will swap two players to the other team.\n" +
  myPrefix + "teams move {mention} {id/mention} // This will move the first player, to another team. (Ignores teamSize option)\n" +
  myPrefix + "teams rename {id/mention} {name...} // Rename a team. Specify its id, or mention someone on a team.\n" +
  myPrefix + "teams randomize // Randomize who is on what team.\n" +
  myPrefix + "teams reset // Delete all teams and start over.\n" +
  "\n=== Events ===\n" +
  myPrefix + "events // This will list all custom events that could happen in the game.\n" +
  myPrefix + "debugevents // This will list all events that could happen in the game.\n" +
  myPrefix + "events add {message} // Begins process of adding a player event.\n" +
  myPrefix + "events remove // Coming soon!\n" +
  "\n=== Time Control ===\n" +
  myPrefix + "start // This will start a game with your settings.\n" +
  myPrefix + "end // This will end a game early.\n" +
  myPrefix + "autoplay // Automatically continue to the next day after a day is over.\n" +
  myPrefix + "pause // Stop autoplay at the end of the day.\n" +
  myPrefix + "next // Simulate the next day of the Games!\n```";
}

// Initialize module.
exports.begin = function(prefix_, Discord_, client_, command_, common_) {
  prefix = prefix_;
  myPrefix = prefix + "hg ";
  Discord = Discord_;
  client = client_;
  command = command_;
  common = common_;

  command.on('hg', function(msg) {
    try {
      handleCommand(msg);
    } catch (err) {
      common.ERROR("An error occured while perfoming command.", "HG");
      console.log(err);
      reply(msg, "Oopsies! Something is broken!");
    }
  });

  setupHelp();

  client.on('messageUpdate', handleMessageEdit);

  initialized = true;
  common.LOG("HungryGames Init", "HG");

  for (var key in games) {
    if (games[key].currentGame && games[key].currentGame.state != 0 &&
        games[key].currentGame.inProgress && games[key].channel &&
        games[key].msg) {
      common.LOG(
          "Resuming game: " + games[key].channel + " " + games[key].msg, "HG");
      var msg =
          client.channels.get(games[key].channel)
              .fetchMessage(games[key].msg)
              .then(function(key) {
                return function(msg) { nextDay(msg, key); }
              }(key))
              .catch(err => {
                common.ERROR("Failed to automatically resume games.", "HG");
                console.log(err);
              });
    }
  }
};
// Removes all references to external data and prepares for unloading.
exports.end = function() {
  if (!initialized) return;
  initialized = false;
  command.deleteEvent('hg');
  client.removeListener('messageUpdate', handleMessageEdit);
  delete command;
  delete Discord;
  delete client;
  delete common;
  process.removeListener('exit', exit);
  process.removeListener('SIGINT', sigint);
};

function handleMessageEdit(oldMsg, newMsg) {
  if (newEventMessages[oldMsg.id]) {
    newMsg.text = newMsg.content.split(' ').slice(2).join(' ');
    newMsg.myResponse = oldMsg.myResponse;
    newEventMessages[oldMsg.id] = newMsg;
    updateEventPreview(newMsg);
  }
}

// Handle a command from a user and pass into relevant functions.
function handleCommand(msg) {
  if (msg.content == myPrefix + "help") {
    help(msg);
    return;
  } else if (msg.guild === null) {
    reply(msg, "This command only works in servers, sorry!");
    return;
  }
  checkPerms(msg, function(msg, id) {
    var splitText = msg.content.split(' ').slice(1);
    if (!splitText[0]) {
      reply(msg, "That isn't a command I understand.");
      return;
    }
    var command = splitText[0].toLowerCase();
    msg.text = splitText.slice(1).join(' ');

    if (games[id]) {
      games[id].channel = msg.channel.id;
      games[id].author = msg.author.id;
    }
    switch (command) {
      case 'create':
        createGame(msg, id);
        break;
      case 'reset':
        resetGame(msg, id);
        break;
      case 'debug':
        showGameInfo(msg, id);
        break;
      case 'debugevents':
        showGameEvents(msg, id);
        break;
      case 'exclude':
        excludeUser(msg, id);
        break;
      case 'include':
        includeUser(msg, id);
        break;
      case 'options':
      case 'option':
        toggleOpt(msg, id);
        break;
      case 'events':
        if (!splitText[1]) {
          listEvents(msg, id);
        } else {
          switch (splitText[1].toLowerCase()) {
            case 'add':
              createEvent(msg, id);
              break;
            case 'remove':
              removeEvent(msg, id);
              break;
            default:
              reply(
                  msg,
                  "I'm sorry, but I don't know how to do that to an event.");
              break;
          }
        }
        break;
      case 'players':
        listPlayers(msg, id);
        break;
      case 'start':
        startGame(msg, id);
        break;
      case 'pause':
        pauseAutoplay(msg, id);
        break;
      case 'autoplay':
      case 'auto':
        startAutoplay(msg, id);
        break;
      case 'next':
        try {
          nextDay(msg, id);
        } catch (err) {
          console.log(err);
        }
        break;
      case 'end':
        endGame(msg, id);
        break;
      case 'save':
        exports.save("async");
        msg.channel.send("`Saving all data...`");
        break;
      case 'team':
      case 'teams':
        editTeam(msg, id);
        break;
      case 'help':
        help(msg, id);
        break;
      default:
        reply(
            msg, "That isn't a Hungry Games command! \"" + myPrefix +
                "help\" for a list of commands.");
        break;
    }
  });
}

// Creates formatted string for mentioning the author of msg.
function mention(msg) {
  return `<@${msg.author.id}>`;
}
// Replies to the author and channel of msg with the given message.
function reply(msg, text, post) {
  post = post || "";
  return msg.channel.send(`${mention(msg)}\n\`\`\`\n${text}\n\`\`\`${post}`);
}
// Check if author of msg has the required role to run commands.
function checkForRole(msg) {
  return msg.member.roles.exists("name", roleName);
}
// Check if author of msg has permissions, then trigger callback with guild id.
function checkPerms(msg, cb) {
  if (checkForRole(msg)) {
    const id = msg.guild.id;
    cb(msg, id);
  } else {
    reply(
        msg, "Sorry! But you don't have the \"" + roleName +
            "\" role! You can't manage the Hungry Games!");
  }
}

// Serializable container for data pertaining to a single user.
function Player(id, username, avatarURL) {
  // User id.
  this.id = id;
  // Username.
  this.name = username;
  // URL TO user's current avatar.
  this.avatarURL = avatarURL;
  // If this user is still alive.
  this.living = true;
  // If this user is will die at the end of the day.
  this.bleeding = 0;
  // The rank at which this user died.
  this.rank = 1;
  // Health state.
  this.state = "normal";
  // Number of kills this user has for the game.
  this.kills = 0;
}
// Serializable container for data about a team in a game.
function Team(id, name, players) {
  // The identifier for this team unique to the server.
  this.id = id;
  // The name of the team to show users.
  this.name = name;
  // The array of Player objects on this team.
  this.players = players;
  // The final rank this team placed once the final member has died.
  this.rank = 1;
  // Number of players still alive on this team.
  this.numAlive = players.length;
}
// Event that can happen in a game.
function Event(message, numVictim, numAttacker, victimOutcome, attackerOutcome) {
  this.message = message;
  this.victim = {count: numVictim, outcome: victimOutcome};
  this.attacker = {count: numAttacker, outcome: attackerOutcome};
}

function makePlayer(user) {
  return new Player(user.id, user.username, user.displayAvatarURL);
}

// Delay a message to send at the given time in milliseconds since epoch.
function sendAtTime(channel, one, two, time) {
  if (time <= Date.now()) {
    channel.send(one, two);
  } else {
    client.setTimeout(function() {
      sendAtTime(channel, one, two, time);
    }, time - Date.now());
  }
}

// Create //
function createGame(msg, id, silent) {
  if (games[id] && games[id].currentGame && games[id].currentGame.inProgress) {
    if (!silent)
      reply(
          msg,
          "This server already has a Hungry Games in progress. If you wish to create a new one, you must end the current one first with \"hgend\".");
    return;
  } else if (games[id] && games[id].currentGame) {
    if (!silent)
      reply(msg, "Creating a new game with settings from the last game.");
    games[id].currentGame.ended = false;
    games[id].currentGame.day = {num: 0, state: 0, events: []};
    games[id].currentGame.includedUsers = getAllPlayers(
        msg.guild.members, games[id].excludedUsers,
        games[id].options.includeBots);
    games[id].currentGame.numAlive = games[id].currentGame.includedUsers.length;
  } else if (games[id]) {
    if (!silent) reply(msg, "Creating a new game with default settings.");
    games[id].currentGame = {
      name: msg.guild.name + "'s Hungry Games",
      inProgress: false,
      includedUsers: getAllPlayers(
          msg.guild.members, games[id].excludedUsers,
          games[id].options.includeBots),
      ended: false,
      day: {num: 0, state: 0, events: []}
    };
    games[id].currentGame.numAlive = games[id].currentGame.includedUsers.length;
  } else {
    games[id] = {
      excludedUsers: [],
      options: defaultOptions,
      customEvents: {bloodbath: [], player: [], arena: []},
      currentGame: {
        name: msg.guild.name + "'s Hungry Games",
        inProgress: false,
        includedUsers: getAllPlayers(msg.guild.members, [], false),
        teams: [],
        ended: false,
        day: {num: 0, state: 0, events: []}
      },
      autoPlay: false,
      previousMessage: 0
    };
    games[id].currentGame.numAlive = games[id].currentGame.includedUsers.length;
    if (!silent)
      reply(
          msg,
          "Created a Hungry Games with default settings and all members included.");
  }
  formTeams(id);
}
// Form an array of Player objects based on guild members, excluded members, and
// whether to include bots.
function getAllPlayers(members, excluded, bots) {
  var finalMembers = [];
  if (!bots || excluded instanceof Array) {
    finalMembers = members.filter(function(obj) {
      return !(
          (!bots && obj.user.bot) ||
          (excluded && excluded.includes(obj.user.id)))
    });
  }
  if (finalMembers.length == 0) finalMembers = members.slice();
  return finalMembers.map(obj => {
    return new Player(obj.id, obj.user.username, obj.user.displayAvatarURL);
  });
}
// Add users to teams, and remove excluded users from teams. Deletes empty
// teams, and adds teams once all teams have teamSize of players.
function formTeams(id) {
  var game = games[id];
  if (game.options.teamSize < 0) game.options.teamSize = 0;
  if (game.options.teamSize == 0) {
    game.currentGame.teams = [];
    return;
  }

  var teamSize = game.options.teamSize;
  var numTeams = Math.ceil(game.currentGame.includedUsers.length / teamSize);
  // If teams already exist, update them. Otherwise, create new teams.
  if (game.currentGame.teams && game.currentGame.teams.length > 0) {
    game.currentGame.teams.sort(function(a, b) { return a.id - b.id; });
    var notIncluded = game.currentGame.includedUsers.slice(0);
    // Remove players from teams if they are no longer included in game.
    for (var i = 0; i < game.currentGame.teams.length; i++) {
      var team = game.currentGame.teams[i];
      team.id = i;
      for (var j = 0; j < team.players.length; j++) {
        if (game.currentGame.includedUsers.findIndex(function(obj) {
              return obj.id == team.players[j];
            }) < 0) {
          team.players.splice(j, 1);
          j--;
        } else {
          notIncluded.splice(
              notIncluded.findIndex(function(obj) {
                return obj.id == team.players[j];
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
    for (var i = 0; i < notIncluded.length; i++) {
      var found = false;
      for (var j = 0; j < game.currentGame.teams.length; j++) {
        var team = game.currentGame.teams[j];
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
          "Team " + (game.currentGame.teams.length + 1), [notIncluded[i].id]);
    }
  } else {
    // Create all teams for players.
    game.currentGame.teams = [];
    for (var i = 0; i < numTeams; i++) {
      game.currentGame.teams[i] = new Team(
          i, "Team " + (i + 1),
          game.currentGame.includedUsers
              .slice(i * teamSize, i * teamSize + teamSize)
              .map(function(obj) { return obj.id; }));
    }
  }
  // Reset team data.
  game.currentGame.teams.forEach(function(obj) {
    obj.numAlive = obj.players.length;
    obj.rank = 1;
  });
}
// Reset data that the user specifies.
function resetGame(msg, id) {
  const command = msg.text.split(' ')[0];
  if (games[id]) {
    if (command == "all") {
      reply(msg, "Resetting ALL Hungry Games data for this server!");
      delete games[id];
    } else if (command == "events") {
      reply(msg, "Resetting ALL Hungry Games events for this server!");
      games[id].customEvents = {player: [], arena: []};
    } else if (command == "current") {
      reply(msg, "Resetting ALL data for current game!");
      delete games[id].currentGame;
    } else if (command == "options") {
      reply(msg, "Resetting ALL options!");
      games[id].options = defaultOptions;
    } else if (command == "teams") {
      reply(msg, "Resetting ALL teams!");
      games[id].currentGame.teams = [];
      formTeams(id);
    } else {
      reply(msg, "Please specify what data to reset.\nall {deletes all data for this server},\nevents {deletes all custom events},\ncurrent {deletes all data about the current game},\noptions {resets all options to default values},\nteams {delete all teams and creates new ones}.");
    }
  } else {
    reply(
        msg, "There is no data to reset. Start a new game with \"hgcreate\".");
  }
}
// Send all of the game data about the current server to the chat.
function showGameInfo(msg, id) {
  if (games[id]) {
    var message = JSON.stringify(games[id], null, 2);
    var messages = [];
    while (message.length > 0) {
      var newChunk =
          message.substring(0, message.length >= 1950 ? 1950 : message.length);
      messages.push(newChunk);
      message = message.replace(newChunk, '');
    }
    for (var i in messages) {
      reply(msg, messages[i]).catch(err => { console.log(err); });
    }
  } else {
    reply(msg, "No game created");
  }
}
// Send all event data about the default events to the chat.
function showGameEvents(msg, id) {
  var events = defaultBloodbathEvents;
  if (games[id] && games[id].customEvents.bloodbath) {
    events = events.concat(games[id].customEvents.bloodbath);
  }
  var file = new Discord.Attachment();
  file.setFile(Buffer.from(JSON.stringify(events, null, 2)));
  file.setName("BloodbathEvents.json");
  fetchStats(events);
  msg.channel.send(
      "Bloodbath Events (" + events.length + ") " +
          Math.round(events.numKill / events.length * 1000) / 10 + "% kill, " +
          Math.round(events.numWound / events.length * 1000) / 10 +
          "% wound, " +
          Math.round(events.numThrive / events.length * 1000) / 10 + "% heal.",
      file);

  events = defaultPlayerEvents;
  if (games[id] && games[id].customEvents.player) {
    events = events.concat(games[id].customEvents.player);
  }
  var file = new Discord.Attachment();
  file.setFile(Buffer.from(JSON.stringify(events, null, 2)));
  file.setName("PlayerEvents.json");
  fetchStats(events);
  msg.channel.send(
      "Player Events (" + events.length + ") " +
          Math.round(events.numKill / events.length * 1000) / 10 + "% kill, " +
          Math.round(events.numWound / events.length * 1000) / 10 +
          "% wound, " +
          Math.round(events.numThrive / events.length * 1000) / 10 + "% heal.",
      file);

  events = defaultArenaEvents;
  if (games[id] && games[id].customEvents.arena) {
    events = events.concat(games[id].customEvents.arena);
  }
  var file = new Discord.Attachment();
  file.setFile(Buffer.from(JSON.stringify(events, null, 2)));
  file.setName("ArenaEvents.json");
  msg.channel.send("Arena Events (" + events.length + ")", file);
}

// Time Control //
function startGame(msg, id) {
  if (games[id] && games[id].currentGame && games[id].currentGame.inProgress) {
    reply(msg, "A game is already in progress!");
  } else {
    createGame(msg, id, true);
    var teamList = "";
    var numUsers = games[id].currentGame.includedUsers.length;
    if (games[id].options.teamSize > 0) {
      teamList =
          games[id]
              .currentGame.teams
              .map(function(team, index) {
                return "__" + team.name + "__: " +
                    team.players
                        .map(function(player) {
                          try {
                            return "`" +
                                games[id]
                                    .currentGame.includedUsers
                                    .find(function(obj) {
                                      return obj.id == player;
                                    })
                                    .name +
                                "`";
                          } catch(err) {
                            common.ERROR(
                                "Failed to find player" + player +
                                " in included users.");
                            console.log(games[id].currentGame.teams);
                            throw err;
                          }
                        })
                        .join(", ");
              })
              .join('\n');
    } else {
      teamList =
          games[id]
              .currentGame.includedUsers.map(function(obj) { return obj.name; })
              .join(", ");
    }

    var included = `**Included** (${numUsers}):\n${teamList}\n`
    var excluded = "";
    if (games[id].excludedUsers.length > 0)
      excluded =
          `**Excluded** (${games[id].excludedUsers.length}):\n${games[id].excludedUsers.join(", ")}`;

    reply(
        msg,
        "Let the games begin!" + (games[id].autoPlay ? "" : "\n(\"" + myPrefix +
                                          "next\" for next day.)"),
        `${games[id].options.mentionEveryoneAtStart ? "@everyone\n" : ""}${included}${excluded}`);
    games[id].currentGame.inProgress = true;
    if (games[id].autoPlay) {
      nextDay(msg, id);
    }
  }
}
function pauseAutoplay(msg, id) {
  if (!games[id]) {
    reply(
        msg, "You must create a game first before using autoplay. Use \"" +
            myPrefix + "create\" to do this.");
  } else if (games[id].autoPlay) {
    msg.channel.send(
        "<@" + msg.author.id +
        "> `Autoplay will stop at the end of the current day.`");
    games[id].autoPlay = false;
  } else {
    reply(
        msg, "Not autoplaying. If you wish to autoplay, type \"" + myPrefix +
            "autoplay\".");
  }
}
function startAutoplay(msg, id) {
  if (!games[id]) {
    createGame(msg, id);
  }
  if (games[id].autoPlay && games[id].inProgress) {
    reply(
        msg, "Already autoplaying. If you wish to stop autoplaying, type \"" +
            myPrefix + "pause\".");
  } else {
    games[id].autoPlay = true;
    if (games[id].currentGame.inProgress &&
        games[id].currentGame.day.state == 0) {
      msg.channel.send(
          "<@" + msg.author.id +
          "> `Enabling Autoplay! Starting the next day!`");
      nextDay(msg, id);
    } else if (!games[id].currentGame.inProgress) {
      /* msg.channel.send(
          "<@" + msg.author.id + "> `Autoplay is enabled, type \"" + myPrefix +
          "start\" to begin!`"); */
      msg.channel.send(
          "<@" + msg.author.id + "> `Autoplay is enabled, Starting the games!`");
      startGame(msg, id);
    } else {
      msg.channel.send("<@" + msg.author.id + "> `Enabling autoplay!`");
    }
  }
}
// Simulate a single day then show events to users.
function nextDay(msg, id) {
  if (!games[id] || !games[id].currentGame ||
      !games[id].currentGame.inProgress) {
    reply(
        msg, "You must start a game first! Use \"" + myPrefix +
            "start\" to start a game!");
    return;
  }
  if (games[id].currentGame.day.state != 0) {
    if (intervals[id]) {
      reply(msg, "Already simulating day.");
    } else if (games[id].currentGame.day.state == 1) {
      reply(
          msg,
          "I think I'm already simulating... if this isn't true this game has crashed and you must end the game.");
    } else {
      intervals[id] = client.setInterval(function() {
        printEvent(msg, id);
      }, games[id].options.delayEvents);
    }
    return;
  }
  games[id].currentGame.day.state = 1;
  games[id].currentGame.day.num++;
  games[id].currentGame.day.events = [];

  while (games[id].options.resurrection &&
         Math.random() < games[id].options.probabilityOfResurrect) {
    var deadPool = games[id].currentGame.includedUsers.filter(function(obj) {
      return !obj.living;
    });
    if (deadPool.length > 0) {
      var resurrected = deadPool[Math.floor(Math.random() * deadPool.length)];
      resurrected.living = true;
      resurrected.state = "zombie";
      games[id].currentGame.includedUsers.forEach(function(obj) {
        if (!obj.living && obj.rank < resurrected.rank) obj.rank++;
      });
      resurrected.rank = 1;
      games[id].currentGame.numAlive++;
      games[id].currentGame.day.events.push(
          makeSingleEvent(
              "{victim} has returned from the dead and was put back into the arena!",
              [resurrected], 1, 0, games[id].options.mentionAll, id, "thrives",
              "nothing"));
      var team = games[id].currentGame.teams.find(function(obj) {
        return obj.players.findIndex(function(obj) {
          return resurrected.id == obj;
        }) > -1;
      });
      team.numAlive++;
      games[id].currentGame.teams.forEach(function(obj) {
        if (obj.numAlive == 0 && obj.rank < team.rank) obj.rank++;
      });
      team.rank = 1;
    }
  }

  var userPool = games[id].currentGame.includedUsers.filter(function(obj) {
    return obj.living;
  });
  var userEventPool;
  var doArenaEvent = false;
  if (games[id].currentGame.day.num == 1) {
    userEventPool =
        defaultBloodbathEvents.concat(games[id].customEvents.bloodbath);
  } else {
    doArenaEvent = games[id].options.arenaEvents &&
        Math.random() < games[id].options.probabilityOfArenaEvent;
    if (doArenaEvent) {
      var arenaEventPool = defaultArenaEvents.concat(games[id].customEvents.arena);
      var index = Math.floor(Math.random() * arenaEventPool.length);
      var arenaEvent = arenaEventPool[index];
      games[id].currentGame.day.events.push(
          makeSingleEvent(
              "**___" + arenaEvent.message + "___**", [], 0, 0, false, id,
              "nothing", "nothing"));
      userEventPool = arenaEvent.outcomes;
    } else {
      userEventPool = defaultPlayerEvents.concat(games[id].customEvents.player);
    }
  }
  var loop = 0;
  while (userPool.length > 0) {
    loop++;
    var eventIndex = Math.floor(Math.random() * userEventPool.length);
    if (eventIndex < 0 || eventIndex >= userEventPool.length) {
      common.ERROR(
          "Attempted to select event out of range! " + eventIndex + "/" +
              userEventPool.length,
          "HG");
      continue;
    }
    var eventTry = userEventPool[eventIndex];
    if (!eventTry) {
      common.ERROR("Event at index " + eventIndex + " is invalid!", "HG");
      continue;
    }

    var numAttacker = eventTry.attacker.count * 1;
    var numVictim = eventTry.victim.count * 1;

    var eventEffectsNumMin = 0;
    if (numVictim < 0) eventEffectsNumMin -= numVictim;
    else eventEffectsNumMin += numVictim;
    if (numAttacker < 0) eventEffectsNumMin -= numAttacker;
    else eventEffectsNumMin += numAttacker;

    if (loop > 100) {
      console.log(
          "Failed to find suitable event for " + userPool.length + " of " +
          userEventPool.length + " events. This " + numVictim + "/" +
          numAttacker + "/" + eventEffectsNumMin);
      reply(msg, "A stupid error happened :(");
      games[id].currentGame.day.state = 0;
      return;
    }
    // If the chosen event requires more players than there are remaining, pick
    // a new event.
    if (eventEffectsNumMin > userPool.length) continue;

    var multiAttacker = numAttacker < 0;
    var multiVictim = numVictim < 0;
    var attackerMin = -numAttacker;
    var victimMin = -numVictim;
    if (multiAttacker || multiVictim) {
      do {
        if (multiAttacker) numAttacker = weightedRand() + (attackerMin - 1);
        if (multiVictim) numVictim = weightedRand() + (victimMin - 1);
      } while (numAttacker + numVictim > userPool.length);
    }

    if (games[id].options.teammatesCollaborate &&
        games[id].options.teamSize > 0) {
      var largestTeam = {index: 0, size: 0};
      var numTeams = 0;
      for (var i = 0; i < games[id].currentGame.teams.length; i++) {
        var team = games[id].currentGame.teams[i];
        var numPool = 0;

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
        if (eventTry.attacker.outcome == "dies" ||
            eventTry.victim.outcome == "dies") {
          continue;
        }
      }
      if (!((numAttacker <= largestTeam.size &&
             numVictim <= userPool.length - largestTeam.size) ||
            (numVictim <= largestTeam.size &&
             numAttacker <= userPool.length - largestTeam.size))) {
        continue;
      }
    }

    // Ensure the event we choose will not force all players to be dead.
    if (!games[id].options.allowNoVictors) {
      var numRemaining = games[id].currentGame.numAlive;
      if (eventTry.victim.outcome == "dies") numRemaining -= numVictim;
      if (eventTry.attacker.outcome == "dies") numRemaining -= numAttacker;
      if (numRemaining < 1) continue;
    }

    // We found a valid event, reset fail counter.
    loop = 0;

    var effectedUsers = [];

    if (games[id].options.teammatesCollaborate &&
        games[id].options.teamSize > 0) {
      var isAttacker = false;
      var validTeam = games[id].currentGame.teams.findIndex(function(team) {
        var canBeVictim = false;
        if (numAttacker <= team.numPool &&
            numVictim <= userPool.length - team.numPool) {
          isAttacker = true;
        }
        if (numVictim <= team.numPool &&
             numAttacker <= userPool.length - team.numPool) {
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
      findMatching = function(match) {
        return userPool.findIndex(function(pool) {
          var teamId = games[id].currentGame.teams.findIndex(function(team) {
            return team.players.findIndex(function(player) {
              return player == pool.id;
            }) > -1;
          });
          return match ? (teamId == validTeam) : (teamId != validTeam);
        })
      };
      for (var i = 0; i < numAttacker + numVictim; i++) {
        var userIndex = findMatching(
            (i < numVictim && !isAttacker) || (i >= numVictim && isAttacker));
        effectedUsers.push(userPool.splice(userIndex, 1)[0]);
      }
    } else {
      for (var i = 0; i < numAttacker + numVictim; i++) {
        var userIndex = Math.floor(Math.random() * userPool.length);
        effectedUsers.push(userPool.splice(userIndex, 1)[0]);
      }
    }

    effectUser = function(i, kills) {
      var index = games[id].currentGame.includedUsers.findIndex(function(obj) {
        return obj.id == effectedUsers[i].id;
      });
      if (games[id].currentGame.includedUsers[index].state == "wounded") {
        games[id].currentGame.includedUsers[index].bleeding++;
      } else {
        games[id].currentGame.includedUsers[index].bleeding = 0;
      }
      games[id].currentGame.includedUsers[index].kills += kills;
      return index;
    };

    killUser = function(i, k) {
      var index = effectUser(i, k);
      games[id].currentGame.includedUsers[index].living = false;
      games[id].currentGame.includedUsers[index].bleeding = 0;
      games[id].currentGame.includedUsers[index].state = "dead";
      games[id].currentGame.includedUsers[index].rank =
          games[id].currentGame.numAlive--;
      if (games[id].options.teamSize > 0) {
        var team = games[id].currentGame.teams.find(function(team) {
          return team.players.findIndex(function(obj) {
            return games[id].currentGame.includedUsers[index].id == obj;
          }) > -1;
        });
        if (!team) {
          console.log(
              "FAILED TO FIND ADEQUATE TEAM FOR USER",
              games[id].currentGame.includedUsers[index]);
        } else {
          team.numAlive--;
          if (team.numAlive == 0) {
            var teamsLeft = 0;
            games[id].currentGame.teams.forEach(function(obj) {
              if (obj.numAlive > 0) teamsLeft++;
            });
            team.rank = teamsLeft + 1;
          }
        }
      }
    };

    woundUser = function(i, k) {
      var index = effectUser(i, k);
      games[id].currentGame.includedUsers[index].state = "wounded";
    };
    restoreUser = function(i, k) {
      var index = effectUser(i, k);
      games[id].currentGame.includedUsers[index].state = "normal";
    };

    for (var i = 0; i < numVictim; i++) {
      var numKills = 0;
      if (eventTry.victim.killer) numKills = numAttacker;
      switch (eventTry.victim.outcome) {
        case "dies":
          killUser(i, numKills);
          break;
        case "wounded":
          woundUser(i, numKills);
          break;
        case "thrives":
          restoreUser(i, numKills);
          break;
        default:
          effectUser(i, numKills);
          break;
      }
    }
    for (var i = numVictim; i < numVictim + numAttacker; i++) {
      var numKills = 0;
      if (eventTry.attacker.killer) numKills = numVictim;
      switch (eventTry.attacker.outcome) {
        case "dies":
          killUser(i, numKills);
          break;
        case "wounded":
          woundUser(i, numKills);
          break;
        case "thrives":
          restoreUser(i, numKills);
          break;
        default:
          effectUser(i, numKills);
          break;
      }
    }
    games[id].currentGame.day.events.push(
        makeSingleEvent(
            eventTry.message, effectedUsers, numVictim, numAttacker,
            games[id].options.mentionAll, id, eventTry.victim.outcome,
            eventTry.attacker.outcome));
    if (effectedUsers.length != 0) {
      console.log("Effected users remain! " + effectedUsers.length);
    }
  }
  var usersBleeding = [];
  var usersRecovered = [];
  games[id].currentGame.includedUsers.forEach(function(obj) {
    if (obj.bleeding > 0 && obj.bleeding >= games[id].options.bleedDays &&
        obj.living) {
      if (Math.random() < games[id].options.probabilityOfBleedToDeath &&
          (games[id].options.allowNoVictors ||
           games[id].currentGame.numAlive > 1)) {
        usersBleeding.push(obj);
        obj.living = false;
        obj.bleeding = 0;
        obj.state = "dead";
        obj.rank = games[id].currentGame.numAlive--;
        var team = games[id].currentGame.teams.find(function(team) {
          return team.players.findIndex(function(player) {
            return obj.id == player;
          }) > -1;
        });
        team.numAlive--;
        if (team.numAlive == 0) {
          var teamsLeft = 0;
          games[id].currentGame.teams.forEach(function(obj) {
            if (obj.numAlive > 0) teamsLeft++;
          });
          team.rank = teamsLeft + 1;
        }
      } else {
        usersRecovered.push(obj);
        obj.bleeding = 0;
        obj.state = "normal";
      }
    }
  });
  if (usersRecovered.length > 0) {
    games[id].currentGame.day.events.push(
        makeSingleEvent(
            "{victim} manage[Vs|] to patch their wounds.", usersRecovered,
            usersRecovered.length, 0, games[id].options.mentionAll, id,
            "thrives", "nothing"));
  }
  if (usersBleeding.length > 0) {
    games[id].currentGame.day.events.push(
        makeSingleEvent(
            "{victim} fail[Vs|] to tend to their wounds and die[Vs|].",
            usersBleeding, usersBleeding.length, 0,
            games[id].options.mentionAll, id, "dies", "nothing"));
  }

  // Signal ready to display events.
  games[id].currentGame.day.state = 2;

  var embed = new Discord.RichEmbed();
  embed.setTitle("Day " + games[id].currentGame.day.num + " has begun!");
  embed.setColor(defaultColor);
  msg.channel.send(embed);
  intervals[id] = client.setInterval(function() {
    printEvent(msg, id);
  }, games[id].options.delayEvents);
}
// Produce a random number that is weighted by multiEventUserDistribution.
function weightedRand() {
  var i, sum = 0, r = Math.random();
  for (i in multiEventUserDistribution) {
    sum += multiEventUserDistribution[i];
    if (r <= sum) return i * 1;
  }
}
// Format an array of users into names based on options and grammar rules.
function formatMultiNames(names, mention) {
  var output = "";
  for (var i = 0; i < names.length; i++) {
    if (mention) {
      output += "<@" + names[i].id + ">";
    } else {
      output += "`" + names[i].name + "`";
    }

    if (i == names.length - 2) output += ", and ";
    else if (i != names.length - 1) output += ", ";
  }
  return output;
}
// Format an event string based on specified users.
function makeSingleEvent(
    message, effectedUsers, numVictim, numAttacker, mention, id, victimOutcome,
    attackerOutcome) {
  var effectedVictims = effectedUsers.splice(0, numVictim);
  var effectedAttackers = effectedUsers.splice(0, numAttacker);
  var finalMessage = message;
  finalMessage = finalMessage.replace(
      /\[V([^\|]*)\|([^\]]*)\]/g,
      "$" + (effectedVictims.length > 1 ? "2" : "1"));
  finalMessage = finalMessage.replace(
      /\[A([^\|]*)\|([^\]]*)\]/g,
      "$" + (effectedAttackers.length > 1 ? "2" : "1"));
  finalMessage =
      finalMessage
          .replaceAll("{victim}", formatMultiNames(effectedVictims, mention))
          .replaceAll(
              "{attacker}", formatMultiNames(effectedAttackers, mention));
  if (finalMessage.indexOf("{dead}") > -1) {
    var deadUsers = games[id]
                        .currentGame.includedUsers
                        .filter(function(obj) { return !obj.living; })
                        .slice(0, weightedRand());
    if (deadUsers.length == 0) {
      finalMessage = finalMessage.replaceAll("{dead}", "an animal");
    } else {
      finalMessage =
          finalMessage.replaceAll("{dead}", formatMultiNames(deadUsers, false));
    }
  }
  var finalIcons = getMiniIcons(effectedVictims.concat(effectedAttackers));
  return {
    message: finalMessage,
    icons: finalIcons,
    numVictim: numVictim,
    victimOutcome: victimOutcome,
    attackerOutcome: attackerOutcome
  };
}
// Get an array of icons urls from an array of users.
function getMiniIcons(users) {
  return users.map(function(obj) {
    return {
      url: obj.avatarURL.replace(/\?size=[0-9]*/, "") + "?size=" + fetchSize,
      id: obj.id
    };
  });
}
// Print an event string to the channel and add images, or if no events remain,
// trigger end of day.
function printEvent(msg, id) {
  var index = games[id].currentGame.day.state - 2;
  var events = games[id].currentGame.day.events;
  if (index == events.length) {
    client.clearInterval(intervals[id]);
    delete intervals[id];
    printDay(msg, id);
  } else {
    if (events[index].icons.length == 0) {
      msg.channel.send(events[index].message);
    } else {
      var finalImage = new jimp(
          events[index].icons.length * (iconSize + iconGap) - iconGap,
          iconSize + iconGap);
      var responses = 0;
      newImage = function(image, outcome, placement) {
        image.resize(iconSize, iconSize);
        if (outcome == "dies") {
          finalImage.blit(
              new jimp(iconSize, iconGap, 0xFF0000FF),
              placement * (iconSize + iconGap), iconSize);
        } else if (outcome == "wounded") {
          finalImage.blit(
              new jimp(iconSize, iconGap, 0xFFFF00FF),
              placement * (iconSize + iconGap), iconSize);
        }
        finalImage.blit(image, placement * (iconSize + iconGap), 0);
        responses++;
        if (responses == events[index].icons.length) {
          finalImage.getBuffer(jimp.MIME_PNG, function(err, out) {
            msg.channel.send(
                events[index].message, new Discord.Attachment(out));
          });
        }
      };
      for (var i = 0; i < events[index].icons.length; i++) {
        jimp.read(events[index].icons[i].url)
            .then(
                function(outcome, placement) {
                  return function(image) {
                    newImage(image, outcome, placement);
                  }
                }(i < events[index].numVictim ? events[index].victimOutcome :
                                                 events[index].attackerOutcome,
                  i))
            .catch(function(err) {
              console.log(err);
              responses++;
            });
      }
    }
    games[id].currentGame.day.state++;
  }
}
// Trigger the end of a day and print summary/outcome at the end of the day.
function printDay(msg, id) {
  var numAlive = 0;
  var lastIndex = 0;
  var lastId = 0;
  var numTeams = 0;
  var lastTeam = 0;
  games[id].currentGame.includedUsers.forEach(function(el, i) {
    if (el.living) {
      numAlive++;
      lastIndex = i;
      lastId = el.id;
    }
  });
  if (games[id].options.teamSize > 0) {
    games[id].currentGame.teams.forEach(function(team, index) {
      if (team.numAlive > 0) {
        numTeams++;
        lastTeam = index;
      }
    });
  }

  if (games[id].currentGame.numAlive != numAlive) {
    common.ERROR("Realtime alive count is incorrect!", "HG");
  }

  var finalMessage = new Discord.RichEmbed();
  finalMessage.setColor(defaultColor);
  if (numTeams == 1) {
    var teamName = games[id].currentGame.teams[lastTeam].name;
    finalMessage.setTitle(
        "\n" + teamName + " has won " + games[id].currentGame.name + "!");
    finalMessage.setDescription(
        games[id]
            .currentGame.teams[lastTeam]
            .players
            .map(function(player) {
              return games[id]
                  .currentGame.includedUsers
                  .find(function(user) { return user.id == player; })
                  .name;
            })
            .join(', '));
    games[id].currentGame.inProgress = false;
    games[id].currentGame.ended = true;
    games[id].autoPlay = false;
  } else if (numAlive == 1) {
    var winnerName = games[id].currentGame.includedUsers[lastIndex].name;
    var teamName = "";
    if (games[id].options.teamSize > 0) {
      teamName = "(" + games[id].currentGame.teams[lastTeam].name + ") ";
    }
    finalMessage.setTitle(
        "\n`" + winnerName + teamName + "` has won " +
        games[id].currentGame.name + "!");
    finalMessage.setThumbnail(
        games[id].currentGame.includedUsers[lastIndex].avatarURL);
    games[id].currentGame.inProgress = false;
    games[id].currentGame.ended = true;
    games[id].autoPlay = false;
  } else if (numAlive < 1) {
    finalMessage.setTitle(
        "\nEveryone has died in " + games[id].currentGame.name +
        "!\nThere are no winners!");
    games[id].currentGame.inProgress = false;
    games[id].currentGame.ended = true;
    games[id].autoPlay = false;
  } else {
    finalMessage.setTitle("Status update! (kills)");
    if (games[id].options.teamSize > 0) {
      games[id].currentGame.includedUsers.sort(function(a, b) {
        var aTeam = games[id].currentGame.teams.findIndex(function(team) {
          return team.players.findIndex(function(player) {
            return player == a.id;
          }) > -1;
        });
        var bTeam = games[id].currentGame.teams.findIndex(function(team) {
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
    var prevTeam = -1;
    var statusList = games[id].currentGame.includedUsers.map(function(obj) {
      var myTeam = -1;
      if (games[id].options.teamSize > 0) {
        myTeam = games[id].currentGame.teams.findIndex(function(team) {
          return team.players.findIndex(function(player) {
            return player == obj.id;
          }) > -1;
        });
      }
      var symbol = emoji.white_check_mark;
      if (!obj.living) symbol = emoji.x;
      else if (obj.state == "wounded") symbol = emoji.yellow_heart;
      else if (obj.state == "zombie") symbol = emoji.negative_squared_cross_mark;

      var shortName = obj.name.substring(0, 16);
      if (shortName != obj.name) {
        shortName = shortName.substring(0, 13) + "...";
      }

      var prefix = "";
      if (myTeam != prevTeam) {
        prevTeam = myTeam;
        prefix = "__" + games[id].currentGame.teams[myTeam].name + "__\n";
      }

      return prefix + symbol + "`" + shortName + "`" +
          (obj.kills > 0 ? "(" + obj.kills + ")" : "");
    });
    if (games[id].options.teamSize == 0) {
      statusList.sort();
    }
    if (statusList.length >= 3) {
        var quarterLength = Math.floor(statusList.length / 3);
        for (var i = 0; i < 2; i++) {
          var thisMessage = statusList.splice(0, quarterLength).join('\n');
          finalMessage.addField(i + 1, thisMessage, true);
      }
      finalMessage.addField(3, statusList.join('\n'), true);
    } else {
      finalMessage.setDescription(statusList.join('\n'));
    }
  }

  var embed = new Discord.RichEmbed();
  embed.setTitle(
      "Day " + games[id].currentGame.day.num + " has ended with " + numAlive +
      " alive!");
  embed.setColor(defaultColor);
  msg.channel.send(embed);

  if (numTeams == 1) {
    var sendTime = Date.now() + (games[id].options.delayDays > 2000 ? 1000 : 0);
    var winnerTag = "";
    if (games[id].options.mentionVictor) {
      winnerTag =
          games[id]
              .currentGame.teams[lastTeam]
              .players.map(function(player) { return "<@" + player + ">"; })
              .join(' ');
    }
    var finalImage = new jimp(
        games[id].currentGame.teams[lastTeam].players.length *
                (victorIconSize + iconGap) -
            iconGap,
        victorIconSize + iconGap);
    var responses = 0;
    newImage = function(image, userId) {
      image.resize(victorIconSize, victorIconSize);
      var user = games[id].currentGame.includedUsers.find(function(obj) {
        return obj.id == userId;
      });
      var color = 0x0;
      if (!user.living) {
        color = 0xFF0000FF
      } else if (user.state == "wounded") {
        color = 0xFFFF00FF;
      } else {
        color = 0x00FF00FF;
      }
      finalImage.blit(
          new jimp(victorIconSize, iconGap, color),
          responses * (victorIconSize + iconGap), victorIconSize);
      finalImage.blit(image, responses * (victorIconSize + iconGap), 0);
      responses++;
      if (responses == games[id].currentGame.teams[lastTeam].players.length) {
        finalImage.getBuffer(jimp.MIME_PNG, function(err, out) {
          finalMessage.attachFile(new Discord.Attachment(out));
          sendAtTime(msg.channel, winnerTag, finalMessage, sendTime);
        });
      }
    };
    games[id].currentGame.teams[lastTeam].players.forEach(function(player) {
      var player = games[id].currentGame.includedUsers.find(function(obj) {
        return obj.id == player;
      });
      var icon = player.avatarURL;
      var userId = player.id;
      jimp.read(icon)
          .then(function(userId) {
            return function(image) { newImage(image, userId); }
          }(userId))
          .catch(function(err) {
            console.log(err);
            responses++;
          });
    });
  } else {
    client.setTimeout(function() {
      var winnerTag = "";
      if (numAlive == 1) {
        if (games[id].options.mentionVictor) {
          winnerTag = "<@" + lastId + ">";
        }
        msg.channel.send(winnerTag, finalMessage);
      } else {
        msg.channel.send(winnerTag, finalMessage);
      }
    }, (games[id].options.delayDays > 2000 ? 1000 : 0));
  }

  if (games[id].currentGame.ended) {
    var rankEmbed = new Discord.RichEmbed();
    rankEmbed.setTitle("Final Ranks (kills)");
    var rankList =
        games[id]
            .currentGame.includedUsers
            .sort(function(a, b) { return a.rank - b.rank; })
            .map(function(obj) {
              return obj.rank + ") " + obj.name +
                  (obj.kills > 0 ? " (" + obj.kills + ")" : "");
            });
    if (rankList.length <= 20) {
      rankEmbed.setDescription(rankList.join('\n'));
    } else {
      var thirdLength = Math.floor(rankList.length / 3);
      for (var i = 0; i < 2; i++) {
        var thisMessage = rankList.splice(0, thirdLength).join('\n');
        rankEmbed.addField(i + 1, thisMessage, true);
      }
      rankEmbed.addField(3, rankList.join('\n'), true);
    }
    rankEmbed.setColor(defaultColor);
    client.setTimeout(function() { msg.channel.send(rankEmbed); }, 5000);
    if (games[id].options.teamSize > 0) {
      var teamRankEmbed = new Discord.RichEmbed();
      teamRankEmbed.setTitle("Final Team Ranks");
      var teamRankList =
          games[id]
              .currentGame.teams
              .sort(function(a, b) { return a.rank - b.rank; })
              .map(function(obj) { return obj.rank + ") " + obj.name; });
      games[id].currentGame.teams.sort(function(a, b) { return a.id - b.id; });
      if (teamRankList.length <= 20) {
        teamRankEmbed.setDescription(teamRankList.join('\n'));
      } else {
        var thirdLength = Math.floor(teamRankList.length / 3);
        for (var i = 0; i < 2; i++) {
          var thisMessage = teamRankList.splice(0, thirdLength).join('\n');
          teamRankEmbed.addField(i + 1, thisMessage, true);
        }
        teamRankEmbed.addField(3, teamRankList.join('\n'), true);
      }
      teamRankEmbed.setColor(defaultColor);
      client.setTimeout(function() { msg.channel.send(teamRankEmbed); }, 8000);
    }
  }

  games[id].currentGame.day.state = 0;

  if (games[id].autoPlay) {
    client.setTimeout(function() {
      msg.channel.send("`Autoplaying...`")
          .then(msg => { msg.delete(games[id].options.delayDays - 1250); })
          .catch(_ => {});
    }, (games[id].options.delayDays > 2000 ? 1200 : 100));
    client.setTimeout(function() {
      nextDay(msg, id);
    }, games[id].options.delayDays);
  }
}
// End a game early.
function endGame(msg, id) {
  if (!games[id] || !games[id].currentGame.inProgress) {
    reply(msg, "There isn't a game in progress.");
  } else {
    reply(msg, "The game has ended!");
    games[id].currentGame.inProgress = false;
    games[id].currentGame.ended = true;
    games[id].autoPlay = false;
    client.clearInterval(intervals[id]);
    delete intervals[id];
  }
}

// User Management //
// Remove a user from users to be in next game.
function excludeUser(msg, id) {
  if (msg.mentions.users.size == 0) {
    reply(
        msg,
        "You must mention people you wish for me to exclude from the next game.");
  } else {
    var response = "";
    msg.mentions.users.forEach(function(obj) {
      if (games[id].excludedUsers.includes(obj.id)) {
        response += obj.username + " is already excluded.\n";
      } else {
        games[id].excludedUsers.push(obj.id);
        response += obj.username + " added to blacklist.\n";
        if (!games[id].currentGame.inProgress && !games[id].currentGame.ended) {
          var index =
              games[id].currentGame.includedUsers.findIndex(function(el) {
                return el.id == obj.id;
              });
          if (index >= 0) {
            games[id].currentGame.includedUsers.splice(index, 1);
            response += obj.username + " removed from included players.\n";
            formTeams(id);
          }
        }
      }
    });
    reply(msg, response);
  }
}

// Add a user back into the next game.
function includeUser(msg, id) {
  if (msg.mentions.users.size == 0) {
    reply(
        msg,
        "You must mention people you wish for me to include in the next game.");
  } else {
    var response = "";
    msg.mentions.users.forEach(function(obj) {
      if (!games[id].options.includeBots && obj.user.bot) {
        response += obj.username + " is a bot, but bots are disabled.\n";
        return;
      }
      var excludeIndex = games[id].excludedUsers.indexOf(obj.id);
      if (excludeIndex >= 0) {
        response += obj.username + " removed from blacklist.\n";
        games[id].excludedUsers.splice(excludeIndex, 1);
      }
      if (games[id].currentGame.inProgress) {
        response += obj.username + " skipped.\n";
      } else {
        games[id].currentGame.includedUsers.push(
            new Player(obj.id, obj.username, obj.user.displayAvatarURL));
        response += obj.username + " added to included players.\n";
        formTeams(id);
      }
    });
    if (games[id].currentGame.inProgress) {
      response +=
          "Players were skipped because a game is currently in progress. Players cannot be added to a game while it's in progress.";
    }
    reply(msg, response);
  }
}

// Show a formatted message of all users and teams in current server.
function listPlayers(msg, id) {
  var stringList = "";
  if (games[id] && games[id].currentGame &&
      games[id].currentGame.includedUsers) {
    stringList +=
        `=== Included Players (${games[id].currentGame.includedUsers.length}) ===\n`;
    if (games[id].options.teamSize == 0) {
    stringList +=
        games[id]
            .currentGame.includedUsers.map(function(obj) { return obj.name; })
            .join(', ');
    } else {
      var numPlayers = 0;
      stringList +=
          games[id]
              .currentGame.teams
              .map(function(team, index) {
                return "#" + (index + 1) + " __" + team.name + "__: " +
                    team.players
                        .map(function(player) {
                          numPlayers++;
                          try {
                            return "`" +
                                games[id]
                                    .currentGame.includedUsers
                                    .find(function(obj) {
                                      return obj.id == player;
                                    })
                                    .name +
                                "`";
                          } catch(err) {
                            common.ERROR(
                                "Failed to find player" + player +
                                " in included users.");
                            console.log(games[id].currentGame.teams);
                            throw err;
                          }
                        })
                        .join(", ");
              })
              .join('\n');
      if (numPlayers != games[id].currentGame.includedUsers.length) {
        stringList +=
            "\n\nSome players were left out! Please reset teams to fix this! (" +
            numPlayers + "/" + games[id].currentGame.includedUsers.length + ")";
      }
    }
  } else {
    stringList +=
        "There don't appear to be any included players. Have you created a game with \"" +
        myPrefix + "create\"?";
  }
  if (games[id] && games[id].excludedUsers &&
      games[id].excludedUsers.length > 0) {
    stringList +=
        `\n\n=== Excluded Players (${games[id].excludedUsers.length}) ===\n`;
    stringList +=
        games[id]
            .excludedUsers.map(function(obj) { return getName(msg, obj); })
            .join(', ');
  }
  reply(msg, "List of currently tracked players:", stringList);
}

// Get the username of a user id if available, or their id if they couldn't be
// found.
function getName(msg, user) {
  var name = "";
  if (msg.guild.members.get(user)) {
    name = msg.guild.members.get(user).user.username;
  } else {
    name = user;
  }
  return name;
}

// Change an option to a value that the user specifies.
function toggleOpt(msg, id) {
  var option = msg.text.split(' ')[0];
  var value = msg.text.split(' ')[1];
  if (!games[id] || !games[id].currentGame) {
    reply(
        msg, "You must create a game first before editing settings! Use \"" +
            myPrefix + "create\" to create a game.");
  } else if (typeof option === 'undefined' || option.length == 0) {
    reply(
        msg, "Here are the current options (delays are in milliseconds):" +
            JSON.stringify(games[id].options, null, 1)
                .replace("{", '')
                .replace("}", ''));
  } else if (games[id].currentGame.inProgress) {
    reply(
        msg, "You must end this game before changing settings. Use \"" +
            myPrefix + "end\" to abort this game.");
  } else if (typeof defaultOptions[option] === 'undefined') {
    reply(
        msg,
        "That is not a valid option to change! (Delays are in milliseconds)" +
            JSON.stringify(games[id].options, null, 1)
                .replace("{", '')
                .replace("}", ''));
  } else {
    var type = typeof defaultOptions[option];
    if (type === 'number') {
      value = Number(value);
      if (typeof value !== 'number') {
        reply(
            msg, "That is not a valid value for " + option +
                ", which requires a number. (Currently " +
                games[id].options[option] + ")");
      } else {
        var old = games[id].options[option];
        games[id].options[option] = value;
        reply(
            msg, "Set " + option + " to " + games[id].options[option] +
                " from " + old);
        if (option == 'teamSize' && value != 0) {
          reply(
              msg, "To reset teams to the correct size, type \"" + myPrefix +
                  "teams reset\".\nThis will delete all teams, and create new ones.");
        }
      }
    } else if (type === 'boolean') {
      if (value === 'true' || value === 'false') value = value === 'true';
      if (typeof value !== 'boolean') {
        reply(
            msg, "That is not a valid value for " + option +
                ", which requires true or false. (Currently " +
                games[id].options[option] + ")");
      } else {
        var old = games[id].options[option];
        games[id].options[option] = value;
        reply(
            msg, "Set " + option + " to " + games[id].options[option] +
                " from " + old);
        if (option == 'includeBots') {
          createGame(msg, id, true);
        }
      }
    } else {
      reply(msg, "Changing the value of this option is not added yet.");
    }
  }
}

// Team Management //
// Entry for all team commands.
function editTeam(msg, id) {
  var split = msg.text.split(' ');
  if (games[id].currentGame.inProgress) {
    switch(split[0]) {
      case 'swap':
      case 'reset':
        msg.channel.send(
            mention(msg) +
            " `You must end the current game before editing teams.`");
        return;
    }
  }
  switch (split[0]) {
    case 'swap':
      swapTeamUsers(msg, id);
      break;
    case 'move':
      moveTeamUser(msg, id);
      break;
    case 'rename':
      renameTeam(msg, id);
      break;
    case 'reset':
      reply(msg, "Resetting ALL teams!");
      games[id].currentGame.teams = [];
      formTeams(id);
      break;
    case 'randomize':
      randomizeTeams(msg, id);
      break;
    default:
      listPlayers(msg, id);
      break;
  }
}
// Swap two users from one team to the other.
function swapTeamUsers(msg, id) {
  if (msg.mentions.users.size != 2) {
    reply(msg, "Swapping requires mentioning 2 users to swap teams with eachother.");
    return;
  }
  var user1 = msg.mentions.users.first().id;
  var user2 = msg.mentions.users.first(2)[1].id;
  var teamId1 = 0;
  var playerId1 = 0;
  var teamId2 = 0;
  var playerId2 = 0;
  teamId1 = games[id].currentGame.teams.findIndex(function(team) {
    var index =
        team.players.findIndex(function(player) { return player == user1; });
    if (index > -1) playerId1 = index;
    return index > -1;
  });
  teamId2 = games[id].currentGame.teams.findIndex(function(team) {
    var index =
        team.players.findIndex(function(player) { return player == user2; });
    if (index > -1) playerId2 = index;
    return index > -1;
  });
  if (teamId1 < 0 || teamId2 < 0) {
    reply(msg, "Please ensure both users are on a team.");
    return;
  }
  var intVal = games[id].currentGame.teams[teamId1].players[playerId1];
  games[id].currentGame.teams[teamId1].players[playerId1] =
      games[id].currentGame.teams[teamId2].players[playerId2];

  games[id].currentGame.teams[teamId2].players[playerId2] = intVal;

  reply(msg, "Swapped players!");
}
// Move a single user to another team.
function moveTeamUser(msg, id) {
  if (msg.mentions.users.size < 1) {
    reply(msg, "You must at least mention one user to move.");
    return;
  }
  var user1 = msg.mentions.users.first().id;
  var teamId1 = 0;
  var playerId1 = 0;

  var user2 = 0;
  if (msg.mentions.users.size >= 2) {
    user2 = msg.mentions.users.first(2)[1].id;

    if (msg.text.indexOf(user2) < msg.text.indexOf(user1)) {
      var intVal = user1;
      user1 = user2;
      user2 = intVal;
    }
  }

  var teamId2 = 0;
  teamId1 = games[id].currentGame.teams.findIndex(function(team) {
    var index =
        team.players.findIndex(function(player) { return player == user1; });
    if (index > -1) playerId1 = index;
    return index > -1;
  });
  if (user2 > 0) {
    teamId2 = games[id].currentGame.teams.findIndex(function(team) {
      return team.players.findIndex(function(player) {
        return player == user2;
      }) > -1;
    });
  } else {
    teamId2 = msg.text.split(' ')[2] - 1;
  }
  if (teamId1 < 0 || teamId2 < 0 || isNaN(teamId2)) {
    reply(msg, "Please ensure the first option is the user, and the second is the destination (either a mention or a team id).");
    console.log(teamId1, teamId2);
    return;
  }
  if (teamId2 >= games[id].currentGame.teams.length) {
    games[id].currentGame.teams.push(
        new Team(
            games[id].currentGame.teams.length,
            "Team " + (games[id].currentGame.teams.length + 1), []));
    teamId2 = games[id].currentGame.teams.length - 1;
  }
  reply(
      msg, "Moving `" + msg.mentions.users.first().username + "` from " +
          games[id].currentGame.teams[teamId1].name + " to " +
          games[id].currentGame.teams[teamId2].name);

  games[id].currentGame.teams[teamId2].players.push(
      games[id].currentGame.teams[teamId1].players.splice(playerId1, 1)[0]);

  if (games[id].currentGame.teams[teamId1].players.length == 0) {
    games[id].currentGame.teams.splice(teamId1, 1);
  }
}
// Rename a team.
function renameTeam(msg, id) {
  var split = msg.text.split(' ').slice(1);
  var message = split.slice(1).join(' ');
  var search = Number(split[0]);
  if (isNaN(search) && msg.mentions.users.size == 0) {
    reply(msg, "Please specify a team id, or mention someone on a team, in order to rename their team.");
    return;
  }
  var teamId = search - 1;
  if (isNaN(search)) {
    teamId = games[id].currentGame.teams.findIndex(function(team) {
      return team.players.findIndex(function(player) {
        return player == msg.mentions.users.first().id;
      }) > -1;
    });
  }
  if (teamId < 0 || teamId >= games[id].currentGame.teams.length) {
    reply(
        msg, "Please specify a valid team id. (0-" +
            (games[id].currentGame.teams.length - 1) + ")");
    return;
  }
  reply(
      msg, "Renaming \"" + games[id].currentGame.teams[teamId].name +
          "\" to \"" + message + "\"");
  games[id].currentGame.teams[teamId].name = message;
}

// Swap random users between teams.
function randomizeTeams(msg, id) {
  var current = games[id].currentGame;
  for (var i = 0; i < current.includedUsers.length; i++) {
    var teamId1 = Math.floor(Math.random() * current.teams.length);
    var playerId1 =
        Math.floor(Math.random() * current.teams[teamId1].players.length);
    var teamId2 = Math.floor(Math.random() * current.teams.length);
    var playerId2 =
        Math.floor(Math.random() * current.teams[teamId2].players.length);

    var intVal = current.teams[teamId1].players[playerId1];
    current.teams[teamId1].players[playerId1] =
        current.teams[teamId2].players[playerId2];
    current.teams[teamId2].players[playerId2] = intVal;
  }
  reply(msg, "Teams have been randomized!");
}

// Game Events //
function createEvent(msg, id) {
  newEventMessages[msg.id] = msg;
  const authId = msg.author.id;
  reply(msg, "Loading...").then(msg_ => {
    newEventMessages[msg.id].myResponse = msg_;
    msg_.awaitReactions(function(reaction, user) {
          return reaction.emoji.name == emoji.white_check_mark &&
              user.id == authId;
        }, {max: 1}).then(function(reactions) {
      const message = newEventMessages[msg.id].text;
      msg_.delete();
      msg.channel.send("Loading...").then(function(msg_) {
        var numVictim = 0;
        var numAttack = 0;
        var victimOutcome = "nothing";
        var attackerOutcome = "nothing";
        getAttackNum = function() {
          createEventNums(
              msg_, authId,
              "`How many attackers may be in this event? (-1 means at least 1, -2 at least 2)`",
              num => {
                numAttack = num;
                msg_.channel.send("Loading...").then(msg => {
                  msg_ = msg;
                  getVictimNum()
                });
                msg_.delete();
              });
        };
        getVictimNum = function() {
          createEventNums(
              msg_, authId,
              "`How many victims may be in this event? (-1 means at least 1, -2 at least 2)`",
              num => {
                numVictim = num;
                msg_.channel.send("Loading...").then(msg => {
                  msg_ = msg;
                  getAttackOutcome();
                });
                msg_.delete();
              });
        };
        getAttackOutcome = function() {
          if (numAttack == 0) {
            getVictimOutcome();
          } else {
            createEventOutcome(
                msg_, authId, "`What is the outcome of the attackers?`",
                function(outcome) {
                  attackerOutcome = outcome;
                  msg_.channel.send("Loading...").then(msg => {
                    msg_ = msg;
                    getVictimOutcome();
                  });
                  msg_.delete();
                });
          }
        };
        getVictimOutcome = function() {
          if (numVictim == 0) {
            msg_.delete();
            finish();
          } else {
            createEventOutcome(
                msg_, authId, "`What is the outcome of the victims?`",
                function(outcome) {
                  victimOutcome = outcome;
                  finish();
                  msg_.delete();
                });
          }
        };
        finish = function() {
          msg_.delete();
          msg.channel.send("`Event created!`");
          var newEvent = new Event(
              message, numVictim, numAttack, victimOutcome, attackerOutcome);
          games[id].customEvents.player.push(newEvent);
        };

        getAttackNum();
      });
      delete newEventMessages[msg.id];
    });
    msg_.awaitReactions(function(reaction, user) {
          return reaction.emoji.name == emoji.x && user.id == msg.author.id;
        }, {max: 1}).then(function(reactions) {
      msg_.edit("`Cancelled event creation.`");
      msg_.clearReactions();
      delete newEventMessages[msg.id];
    });
    msg_.react(emoji.white_check_mark);
    msg_.react(emoji.x);
    updateEventPreview(newEventMessages[msg.id]);
  });
}
function createEventNums(msg, id, show, cb) {
  msg.edit(show + "\nNone");

  var num = 0;
  regUp = function() {
    msg.awaitReactions(function(reaction, user) {
         if (user.id != client.user.id) reaction.remove(user);
         return reaction.emoji.name == emoji.arrow_up && user.id == id;
       }, {max: 1}).then(function(reactions) {
      num++;
      var message = "None";
      if (num < 0) message = "At least " + num * -1 + " people.";
      else if (num > 0) message = num + " people exactly.";
      msg.edit(show + "\n" + message);
      regUp();
    });
  };
  regUp();
  regDown = function() {
    msg.awaitReactions(function(reaction, user) {
         if (user.id != client.user.id) reaction.remove(user);
         return reaction.emoji.name == emoji.arrow_down && user.id == id;
       }, {max: 1}).then(function(reactions) {
      num--;
      var message = "None";
      if (num < 0) message = "At least " + num * -1 + " people.";
      else if (num > 0) message = num + " people exactly.";
      msg.edit(show + "\n" + message);
      regDown();
    });
  };
  regDown();
  msg.awaitReactions(function(reaction, user) {
       return reaction.emoji.name == emoji.white_check_mark && user.id == id;
     }, {max: 1}).then(function(reactions) {
    msg.delete();
    cb(num);
  });
  msg.awaitReactions(function(reaction, user) {
       return reaction.emoji.name == emoji.x && user.id == id;
     }, {max: 1}).then(function(reactions) {
    msg.edit("`Cancelled event creation`");
    msg.clearReactions();
  });

  msg.react(emoji.white_check_mark);
  msg.react(emoji.x);
  setTimeout(function() {
    msg.react(emoji.arrow_up);
    msg.react(emoji.arrow_down);
  }, 100);
}
function createEventOutcome(msg, id, show, cb) {
  msg.edit(
      show + "\n" + emoji.white_check_mark + "Nothing, " + emoji.x + "Dies, " +
      emoji.yellow_heart + "Wounded, " + emoji.arrow_up + "Healed");

  msg.awaitReactions(function(reaction, user) {
       return reaction.emoji.name == emoji.arrow_up && user.id == id;
     }, {max: 1}).then(function(reactions) {
    cb("thrives");
  });
  msg.awaitReactions(function(reaction, user) {
       return reaction.emoji.name == emoji.yellow_heart && user.id == id;
     }, {max: 1}).then(function(reactions) {
    cb("wounded");
  });
  msg.awaitReactions(function(reaction, user) {
       return reaction.emoji.name == emoji.white_check_mark && user.id == id;
     }, {max: 1}).then(function(reactions) {
    msg.clearReactions();
    cb("nothing");
  });
  msg.awaitReactions(function(reaction, user) {
       return reaction.emoji.name == emoji.x && user.id == id;
     }, {max: 1}).then(function(reactions) {
    msg.clearReactions();
    cb("dies");
  });

  msg.react(emoji.white_check_mark);
  msg.react(emoji.x);
  msg.react(emoji.yellow_heart);
  msg.react(emoji.arrow_up);
}

function updateEventPreview(msg) {
  msg.text = msg.text.split(' ').slice(1).join(' ');
  var helpMsg =
      "```\nEdit your message until you are happy with the below outcomes, then click the checkmark." +
      "\nReplace names with \"{victim}\" or \"{attacker}\" (with brackets)." +
      "\nUse \"[Vsinglular|plural]\" or \"[Asingular|plural]\" to put \"singular\" if there's only one person, or \"plural\" if there are more" +
      "\n (A for attacker, V for victim).\n```";
  var users = msg.guild.members.random(4);
  var players = [];
  var cnt = 0;
  for (var i = 0; cnt < 4; i++) {
    var nextUser = users[i % users.length];
    if (typeof nextUser === 'undefined') continue;
    players.push(makePlayer(nextUser.user));
    cnt++;
  }
  try {
    var single = makeSingleEvent(
                     msg.text, players.slice(0), 1, 1, false, msg.guild.id,
                     "nothing", "nothing")
                     .message;
    var pluralOne = makeSingleEvent(
                        msg.text, players.slice(0), 2, 1, false, msg.guild.id,
                        "nothing", "nothing")
                        .message;
    var pluralTwo = makeSingleEvent(
                        msg.text, players.slice(0), 1, 2, false, msg.guild.id,
                        "nothing", "nothing")
                        .message;
    var pluralBoth = makeSingleEvent(
                         msg.text, players.slice(0), 2, 2, false, msg.guild.id,
                         "nothing", "nothing")
                         .message;
    msg.myResponse.edit(
        helpMsg + single + "\n" + pluralOne + "\n" + pluralTwo + "\n" +
        pluralBoth);
  } catch (err) {
    console.log(err);
  }
}
function removeEvent(msg, id) {
  reply(msg, "This doesn't work yet!");
}
// Put information about an array of events into the array.
function fetchStats(events) {
  var numKill = 0;
  var numWound = 0;
  var numThrive = 0;
  events.forEach(function(obj) {
    if (obj.attacker.outcome == "dies" || obj.victim.outcome == "dies")
      numKill++;
    if (obj.attacker.outcome == "wounded" || obj.victim.outcome == "wounded")
      numWound++;
    if (obj.attacker.outcome == "thrives" || obj.victim.outcome == "thrives")
      numThrive++;
  });
  events.numKill = numKill;
  events.numWound = numWound;
  events.numThrive = numThrive;
}
// Allow user to view all events available on their server and summary of each
// type of event.
function listEvents(msg, id) {
  /* var events = games[id].customEvents.bloodbath;
  var file = new Discord.Attachment();
  file.setFile(Buffer.from(JSON.stringify(events, null, 2)));
  file.setName("BloodbathEvents.json");
  fetchStats(events);
  msg.channel.send(
      "Bloodbath Events (" + events.length + ") " +
          Math.round(events.numKill / events.length * 1000) / 10 + "% kill, " +
          Math.round(events.numWound / events.length * 1000) / 10 +
          "% wound, " +
          Math.round(events.numThrive / events.length * 1000) / 10 + "% heal.",
      file); */

  var events = games[id].customEvents.player;
  var file = new Discord.Attachment();
  file.setFile(Buffer.from(JSON.stringify(events, null, 2)));
  file.setName("PlayerEvents.json");
  fetchStats(events);
  msg.channel.send(
      "Player Events (" + events.length + ") " +
          Math.round(events.numKill / events.length * 1000) / 10 + "% kill, " +
          Math.round(events.numWound / events.length * 1000) / 10 +
          "% wound, " +
          Math.round(events.numThrive / events.length * 1000) / 10 + "% heal.",
      file);

  /* var events = events.concat(games[id].customEvents.arena);
  var file = new Discord.Attachment();
  file.setFile(Buffer.from(JSON.stringify(events, null, 2)));
  file.setName("ArenaEvents.json");
  msg.channel.send("Arena Events (" + events.length + ")", file); */
}

// Send help message to DM and reply to server.
function help(msg, id) {
  msg.author.send(helpMessage)
      .then(_ => {
        if (msg.guild != null) reply(msg, helpmessagereply, ":wink:")
      })
      .catch(_ => {reply(msg, blockedmessage)});
}

// Util //
// Save all game data to file.
exports.save = function(opt) {
  if (!initialized) return;
  if (opt == "async") {
    common.LOG("Saving async", "HG");
    fs.writeFile(saveFile, JSON.stringify(games), function() {});
  } else {
    common.LOG("Saving sync", "HG");
    fs.writeFileSync(saveFile, JSON.stringify(games));
  }
};

// Catch process exiting so we can save if necessary, and remove other handlers
// to allow for another module to take our place.
function exit(code) {
  if (common && common.LOG) common.LOG("Caught exit!", "HG");
  if (initialized && code == -1) {
    exports.save();
  }
  try { exports.end(); } catch (err) { }
}
// Same as exit(), but triggred via SIGINT.
function sigint() {
  if (common && common.LOG) common.LOG("Caught SIGINT!", "HG");
  if (initialized) {
    exports.save();
  }
  try { exports.end(); } catch (err) { }
}

// Catch reasons for exiting normally.
process.on('exit', exit);
process.on('SIGINT', sigint);
