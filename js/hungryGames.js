const fs = require('fs');

var initialized = false;

const saveFile = 'hg.json';
const eventFile = 'hgEvents.json';

const roleName = "HG Creator";

// Must total to 1.0
const multiEventUserDistribution = {
  1: 0.66,
  2: 0.27,
  3: 0.03,
  4: 0.02,
  6: 0.015,
  7: 0.005
};
// Probability of dead player being revived per day.
var resurrectProb = 0.10;
// Probability of an arena event per day.
var arenaEventProb = 0.25;

var prefix, Discord, client, command, common;
var myPrefix, helpMessage;
var games = {};
var intervals = {};
var defaultBloodbathEvents = [];
var defaultPlayerEvents = [];
var defaultArenaEvents = [];

fs.readFile(saveFile, function(err, data) {
  if (err) return;
  games = JSON.parse(data);
  if (!games) games = {};
});
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

const helpmessagereply = "I sent you a DM with commands!";
const blockedmessage =
    "I couldn't send you a message, you probably blocked me :(";
exports.helpMessage = "Module loading...";
function setupHelp() {
exports.helpMessage = "`" + myPrefix + "help` for Hungry Games help.";
helpMessage =
"Hungry Games!\n" +
  "To use any of these commands you must have the \"" + roleName + "\" role.\n" +
  "```js\n=== Game Settings ===\n" +
  myPrefix + "create // This will create a game with default settings if it doesn't exist already.\n" +
  myPrefix + "options [option name] [value] // List options if no name, or change the option if you give a name.\n" +
  myPrefix + "reset {all/current/events} // Delete data about the Games. Don't choose an option for more info.\n" +
  "=== Player Settings ===\n" +
  myPrefix + "players // This will list all players I currently care about.\n" +
  myPrefix + "exclude {mention} // Prevent someone from being added to the next game.\n" +
  myPrefix + "include {mention} // Add a person back into the next game.\n" +
  "=== Events ===\n" +
  myPrefix + "events // This will list all events that could happen in the game.\n" +
  myPrefix + "events add // Coming soon!\n" +
  myPrefix + "events delete // Coming soon!\n" +
  "=== Time Control ===\n" +
  myPrefix + "start // This will start a game with your settings.\n" +
  myPrefix + "end // This will end a game early.\n" +
  myPrefix + "autoplay // Coming soon!\n" +
  myPrefix + "pause // Coming soon!\n" +
  myPrefix + "next // Simulate the next day of the Games!\n```"+
  "\nMost options do not work yet, This is still very early in development.\n";
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
    }
  });

  setupHelp();

  initialized = true;
  common.LOG("HungryGames Init", "HG");
};
// Removes all references to external data and prepares for unloading.
exports.end = function() {
  if (!initialized) return;
  initialized = false;
  command.deleteEvent('hg');
  delete command;
  delete Discord;
  delete client;
  delete common;
};

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
            case 'delete':
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
        exports.save();
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

function checkForRole(msg) {
  return msg.member.roles.exists("name", roleName);
}
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

function Player(id, username) {
  // User id.
  this.id = id;
  // Username.
  this.name = username;
  // If this user is still alive.
  this.living = true;
  // If this user is will die at the end of the day.
  this.bleeding = false;
  // The rank at which this user died.
  this.rank = 1;
  // Health state.
  this.state = "normal";
}

// Create //
function createGame(msg, id) {
  if (games[id] && games[id].currentGame && games[id].currentGame.inProgress) {
    reply(
        msg,
        "This server already has a Hungry Games in progress. If you wish to create a new one, you must end the current one first with \"hgend\".");
    return;
  } else if (games[id] && games[id].currentGame) {
    reply(msg, "Creating a new game with settings from the last game.");
    games[id].currentGame.ended = false;
    games[id].currentGame.day = {num: 0, state: 0, events: []};
    games[id].currentGame.includedUsers = getAllPlayers(
        msg.guild.members, games[id].excludedUsers,
        games[id].options.includeBots);
    games[id].currentGame.numAlive = games[id].currentGame.includedUsers.length;
  } else if (games[id]) {
    reply(msg, "Creating a new game with default settings.");
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
      options: {
        arenaEvents: false,
        teamSize: 0,
        mentionVictor: true,
        mentionAll: false,
        mentionEveryoneAtStart: false,
        resurrection: false,
        includeBots: false
      },
      customEvents: {bloodbath: [], player: [], arena: []},
      currentGame: {
        name: msg.guild.name + "'s Hungry Games",
        inProgress: false,
        includedUsers: getAllPlayers(msg.guild.members, [], false),
        ended: false,
        day: {num: 0, state: 0, events: []}
      },
      autoPlay: false
    };
    games[id].currentGame.numAlive = games[id].currentGame.includedUsers.length;
    reply(
        msg,
        "Created a Hungry Games with default settings and all members included.");
  }
}
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
  return finalMembers.map(
      obj => { return new Player(obj.id, obj.user.username); });
}
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
      games[id].options = {
        arenaEvents: false,
        teamSize: 0,
        mentionVictor: true,
        mentionAll: false,
        mentionEveryoneAtStart: false,
        resurrection: false,
        includeBots: false
      };
    } else {
      reply(msg, "Please specify what data to reset (all {deletes all data for this server}, events {deletes all custom events}, current {deletes all data about the current game}, options {resets all options to default values})");
    }
  } else {
    reply(
        msg, "There is no data to reset. Start a new game with \"hgcreate\".");
  }
}
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
function showGameEvents(msg) {
  reply(
      msg, "Player: " + JSON.stringify(defaultPlayerEvents, null, 2) +
          "\nArena: " + JSON.stringify(defaultArenaEvents, null, 2));
}

// Time Control //
function startGame(msg, id) {
  if (games[id] && games[id].currentGame && games[id].currentGame.inProgress) {
    reply(msg, "A game is already in progress!");
  } else {
    if (!games[id] || !games[id].currentGame || games[id].currentGame.ended) {
      createGame(msg, id);
    }
    var teamList = "";
    var numUsers = 0;
    if (games[id].teamSize > 0) {
      // TODO: Format string for teams.
    } else {
      numUsers = games[id].currentGame.includedUsers.length;
      teamList =
          games[id]
              .currentGame.includedUsers.map(function(obj) { return obj.name; })
              .join(", ");
    }

    reply(
        msg, "Let the games begin!",
        `${games[id].options.mentionEveryoneAtStart ? "@everyone" : ""}\n**Included** (${numUsers}):\n${teamList}\n**Excluded** (${games[id].excludedUsers.length}):\n${games[id].excludedUsers.join(", ")}`);
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
    reply(
        msg, "You must create a game first before using autoplay. Use \"" +
            myPrefix + "create\" to do this.");
  } else if (games[id].autoPlay) {
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
      msg.channel.send(
          "<@" + msg.author.id + "> `Autoplay is enabled, type \"" + myPrefix +
          "start\" to begin!`");
    } else {
      msg.channel.send("<@" + msg.author.id + "> `Enabling autoplay!`");
    }
  }
}
// Simulate a single day.
function nextDay(msg, id) {
  if (!games[id] || !games[id].currentGame.inProgress) {
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
      intervals[id] =
          client.setInterval(function() { printEvent(msg, id); }, 3500);
    }
    return;
  }
  games[id].currentGame.day.state = 1;
  games[id].currentGame.day.num++;
  games[id].currentGame.day.events = [];

  if (games[id].options.resurrection && Math.random() < resurrectProb) {
    var deadPool = games[id].currentGame.includedUsers.filter(function(obj) {
      return !obj.living;
    });
    if (deadPool.length > 0) {
      var resurrected = deadPool[Math.floor(Math.random() * deadPool.length)];
      resurrected.living = true;
      resurrected.state = "zombie";
      resurrected.rank = 1;
      games[id].currentGame.numAlive++;
      games[id].currentGame.day.events.push(
          makeSingleEvent(
              "{victim} has returned from the dead and was put back into the arena!",
              [resurrected], 1, 0, games[id].options.mentionAll));
    }
  }

  var userPool = games[id].currentGame.includedUsers.filter(function(obj) {
    return obj.living;
  });
  // TODO: Don't let teams attack eachother.
  var userEventPool;
  var doArenaEvent = false;
  if (games[id].currentGame.day.num == 1) {
    userEventPool =
        defaultBloodbathEvents.concat(games[id].customEvents.bloodbath);
  } else {
    doArenaEvent =
        games[id].options.arenaEvents && Math.random() < arenaEventProb;
    if (doArenaEvent) {
      var arenaEventPool = defaultArenaEvents.concat(games[id].customEvents.arena);
      var index = Math.floor(Math.random() * arenaEventPool.length);
      var arenaEvent = arenaEventPool[index];
      games[id].currentGame.day.events.push(
          makeSingleEvent(arenaEvent.message, [], 0, 0, false));
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
    if (numVictim < 0) eventEffectsNumMin += 1;
    else eventEffectsNumMin += numVictim;
    if (numAttacker < 0) eventEffectsNumMin += 1;
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
    loop = 0;

    var effectedUsers = [];

    var multiAttacker = numAttacker < 0;
    var multiVictim = numVictim < 0;
    if (multiAttacker || multiVictim) {
      do {
        if (multiAttacker) numAttacker = weightedRand();
        if (multiVictim) numVictim = weightedRand();
      } while (numAttacker + numVictim > userPool.length);
    }

    for (var i = 0; i < numAttacker + numVictim; i++) {
      var userIndex = Math.floor(Math.random() * userPool.length);
      effectedUsers.push(userPool.splice(userIndex, 1)[0]);
    }

    effectUser = function(i) {
      var index = games[id].currentGame.includedUsers.findIndex(function(obj) {
        return obj.id == effectedUsers[i].id;
      });
      if (games[id].currentGame.includedUsers[index].state == "wounded") {
        games[id].currentGame.includedUsers[index].bleeding = true;
      }
      return index;
    };

    killUser = function(i) {
      // TODO: Track kills
      var index = effectUser(i);
      games[id].currentGame.includedUsers[index].living = false;
      games[id].currentGame.includedUsers[index].bleeding = false;
      games[id].currentGame.includedUsers[index].state = "dead";
      games[id].currentGame.includedUsers[index].rank =
          games[id].currentGame.numAlive--;
    };

    woundUser = function(i) {
      var index = effectUser(i);
      games[id].currentGame.includedUsers[index].state = "wounded";
    };
    restoreUser = function(i) {
      var index = effectUser(i);
      games[id].currentGame.includedUsers[index].state = "normal";
    };

    for (var i = 0; i < numVictim; i++) {
      switch (eventTry.victim.outcome) {
        case "dies":
          killUser(i);
          break;
        case "wounded":
          woundUser(i);
          break;
        case "thrives":
          restoreUser(i);
          break;
        default:
          effectUser(i);
      }
    }
    for (var i = numVictim; i < numVictim + numAttacker; i++) {
      switch (eventTry.attacker.outcome) {
        case "dies":
          killUser(i);
          break;
        case "wounded":
          woundUser(i);
          break;
        case "thrives":
          restoreUser(i);
          break;
        default:
          effectUser(i);
      }
    }
    games[id].currentGame.day.events.push(
        makeSingleEvent(
            eventTry.message, effectedUsers, numVictim, numAttacker,
            games[id].options.mentionAll));
    if (effectedUsers.length != 0) {
      console.log("Effected users remain! " + effectedUsers.length);
    }
  }
  var usersBleeding = [];
  games[id].currentGame.includedUsers.forEach(function(obj) {
    if (obj.bleeding && obj.living) {
      usersBleeding.push(obj);
      obj.living = false;
      obj.bleeding = false;
      obj.state = "dead";
      obj.rank = games[id].currentGame.numAlive--;
    }
  });
  if (usersBleeding.length > 0) {
    games[id].currentGame.day.events.push(
        makeSingleEvent(
            "{victim} fails to tend to their wounds and dies.", usersBleeding,
            usersBleeding.length, 0, games[id].options.mentionAll));
  }

  // Signal ready to display events.
  games[id].currentGame.day.state = 2;

  var embed = new Discord.RichEmbed();
  embed.setTitle("Day " + games[id].currentGame.day.num + " has begun!");
  embed.setColor([0, 255, 0]);
  msg.channel.send(embed);
  intervals[id] = client.setInterval(printEvent, 3500, msg, id);
}
function weightedRand() {
  var i, sum = 0, r = Math.random();
  for (i in multiEventUserDistribution) {
    sum += multiEventUserDistribution[i];
    if (r <= sum) return i * 1;
  }
}
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
function makeSingleEvent(
    message, effectedUsers, numVictim, numAttacker, mention) {
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
  return {
    message: finalMessage /*,
     victims: effectedVictims,
     attackers: effectedAttackers */
  };
}
function printEvent(msg, id) {
  var index = games[id].currentGame.day.state - 2;
  var events = games[id].currentGame.day.events;
  if (index == events.length) {
    client.clearInterval(intervals[id]);
    printDay(msg, id);
  } else {
    msg.channel.send(events[index].message);
    games[id].currentGame.day.state++;
  }
}
function printDay(msg, id) {
  var numAlive = 0;
  var lastIndex = 0;
  games[id].currentGame.includedUsers.forEach(function(el, i) {
    if (el.living) {
      numAlive++;
      lastIndex = i;
    }
  });

  if (games[id].currentGame.numAlive != numAlive) {
    common.ERROR("Realtime alive count is incorrect!", "HG");
  }

  var finalMessage = new Discord.RichEmbed();
  finalMessage.setColor([255, 0, 255]);
  if (numAlive == 1) {
    var winnerName = games[id].currentGame.includedUsers[lastIndex].name;
    finalMessage.setTitle(
        "\n`" + winnerName + "` has won " + games[id].currentGame.name + "!");
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
    finalMessage.setTitle("Status update!");
    finalMessage.setDescription(
        games[id]
            .currentGame.includedUsers
            .map(function(obj) {
              var symbol = ":white_check_mark:";
              if (!obj.living) symbol = ":x:";
              else if (obj.state == "wounded") symbol = ":heart:";
              else if (obj.state == "zombie") symbol = ":negative_squared_cross_mark:";
              return symbol + "`" + obj.name + "`";
            })
            .join("\n"));
  }

  var embed = new Discord.RichEmbed();
  embed.setTitle(
      "Day " + games[id].currentGame.day.num + " has ended with " + numAlive +
      " alive!");
  embed.setColor([255, 0, 0]);
  msg.channel.send(embed);

  client.setTimeout(function() {
    var winnerTag = "";
    if (games[id].options.mentionVictor) {
      winnerTag =
          "<@" + games[id].currentGame.includedUsers[lastIndex].id + ">";
    }
    msg.channel.send(winnerTag, finalMessage);
  }, 1000);

  if (games[id].currentGame.ended) {
    var rankEmbed = new Discord.RichEmbed();
    rankEmbed.setTitle("Final ranks");
    rankEmbed.setDescription(
        games[id]
            .currentGame.includedUsers
            .sort(function(a, b) { return a.rank - b.rank; })
            .map(function(obj) { return obj.rank + ") " + obj.name; })
            .join('\n'));
    rankEmbed.setColor([0, 0, 255]);
    client.setTimeout(function() { msg.channel.send(rankEmbed); }, 5000);
  }

  games[id].currentGame.day.state = 0;

  if (games[id].autoPlay) {
    client.setTimeout(function() { nextDay(msg, id); }, 7000);
  }
}
function endGame(msg, id) {
  if (!games[id] || !games[id].currentGame.inProgress) {
    reply(msg, "There isn't a game in progress.");
  } else {
    reply(msg, "The game has ended!");
    games[id].currentGame.inProgress = false;
    games[id].currentGame.ended = true;
  }
}

// User Management //
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
          // TODO: Remove users from team.
          var index =
              games[id].currentGame.includedUsers.findIndex(function(el) {
                return el.id == obj.id;
              });
          if (index >= 0) {
            games[id].currentGame.includedUsers.splice(index, 1);
            response += obj.username + " removed from included players.\n";
          }
        }
      }
    });
    reply(msg, response);
  }
}

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
        if (games[id].options.teamSize == 0) {
          games[id].currentGame.includedUsers.push(
              new Player(obj.id, obj.username));
          response += obj.username + " added to included players.\n";
        } else {
          // TODO: Add user to teams.
        }
      }
    });
    if (games[id].currentGame.inProgress) {
      response +=
          "Players were skipped because a game is currently in progress. Players cannot be added to a game while it's in progress.";
    }
    reply(msg, response);
  }
}

function listPlayers(msg, id) {
  var stringList = "";
  if (games[id] && games[id].currentGame &&
      games[id].currentGame.includedUsers) {
    stringList +=
        `=== Included Players (${games[id].currentGame.includedUsers.length}) ===\n`;
    stringList +=
        games[id]
            .currentGame.includedUsers.map(function(obj) { return obj.name; })
            .join(', ');
  } else {
    stringList +=
        "There don't appear to be any included players. Have you created a game with \"" +
        myPrefix + "create\"?";
  }
  if (games[id] && games[id].excludedUsers) {
    stringList +=
        `\n\n=== Excluded Players (${games[id].excludedUsers.length}) ===\n`;
    stringList +=
        games[id]
            .excludedUsers.map(function(obj) { return getName(msg, obj); })
            .join(', ');
  }
  reply(msg, "List of currently tracked players:", stringList);
}

function getName(msg, user) {
  var name = "";
  if (msg.guild.members.get(user)) {
    name = msg.guild.members.get(user).user.username;
  } else {
    name = user;
  }
  return name;
}

function toggleOpt(msg, id) {
  var option = msg.text.split(' ')[0];
  var value = msg.text.split(' ')[1];
  if (!games[id] || !games[id].currentGame) {
    reply(
        msg, "You must create a game first before editing settings! Use \"" +
            myPrefix + "create\" to create a game.");
  } else if (games[id].currentGame.inProgress) {
    reply(
        msg, "You must end this game before changing settings. Use \"" +
            myPrefix + "end\" to abort this game.");
  } else if (typeof option === 'undefined' || option.length == 0) {
    reply(
        msg, "Here are the current options:" +
            JSON.stringify(games[id].options, null, 1)
                .replace("{", '')
                .replace("}", ''));
  } else if (typeof games[id].options[option] === 'undefined') {
    reply(
        msg, "That is not a valid option to change! Valid options are" +
            JSON.stringify(games[id].options, null, 1)
                .replace("{", '')
                .replace("}", ''));
  } else {
    var type = typeof games[id].options[option];
    if (type === 'number') {
      value = Number(value);
      if (typeof value !== 'number') {
        reply(
            msg, "That is not a valid value for " + option +
                ", which requires a number.");
      } else {
        games[id].options[option] = value;
        reply(msg, "Set " + option + " to " + games[id].options[option]);
      }
    } else if (type === 'boolean') {
      if (typeof value === 'undefined') {
        games[id].options[option] = !games[id].options[option];
        reply(msg, "Toggled " + option + " to " + games[id].options[option]);
      } else {
        if (value === 'true' || value === 'false') value = value === 'true';
        if (typeof value !== 'boolean') {
          reply(
              msg, "That is not a valid value for " + option +
                  ", which requires true or false.");
        } else {
          games[id].options[option] = value;
          reply(msg, "Set " + option + " to " + games[id].options[option]);
        }
      }
    } else {
      reply(msg, "Changing the value of this option is not added yet.");
    }
  }
}

// Game Events //
function createEvent(msg) {
  reply(msg, "This doesn't work yet!");
}
function removeEvent(msg) {
  reply(msg, "This doesn't work yet!");
}
function listEvents(msg, id) {
  var stringList = "=== Bloodbath Events ===\n";
  if (games[id] && games[id].customEvents.bloodbath) {
    stringList +=
        games[id]
            .customEvents.bloodbath.map(function(obj) { return obj.message; })
            .join('\n');
  }
  stringList +=
      defaultBloodbathEvents.map(function(obj) { return obj.message; })
          .join('\n') +
      "\n\n=== Player Events ===\n";
  if (games[id] && games[id].customEvents.player) {
    stringList +=
        games[id]
            .customEvents.player.map(function(obj) { return obj.message; })
            .join('\n');
  }
  stringList += defaultPlayerEvents.map(function(obj) { return obj.message; })
                    .join('\n') +
      "\n\n=== Arena Events ===\n";
  if (games[id] && games[id].customEvents.arena) {
    stringList +=
        games[id]
            .customEvents.arena.map(function(obj) { return obj.message; })
            .join('\n');
  }
  stringList +=
      defaultArenaEvents.map(function(obj) { return obj.message; }).join('\n');

  var messages = [];
  while (stringList.length > 0) {
    var newChunk = stringList.substring(
        0, stringList.length >= 1950 ? 1950 : stringList.length);
    messages.push(newChunk);
    stringList = stringList.replace(newChunk, '');
  }
  for (var i in messages) {
    reply(msg, messages[i]).catch(err => { console.log(err); });
  }
}

function help(msg, id) {
  msg.author.send(helpMessage)
      .then(_ => {
        if (msg.guild != null) reply(msg, helpmessagereply, ":wink:")
      })
      .catch(_ => {reply(msg, blockedmessage)});
}

// Util //
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

function exit(code) {
  if (code == -1) {
    if (common) common.LOG("Caught exit! Saving!", "HG");
    exports.save();
  }
  try { exports.end(); } catch (err) { }
}
function sigint() {
  if (common) common.LOG("Caught SIGINT! Saving!", "HG");
  exports.save();
  try { exports.end(); } catch (err) { }
}

process.on('exit', exit);
process.on('SIGINT', sigint);
