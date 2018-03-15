const fs = require('fs');

var initialized = false;

const saveFile = 'hg.json';
const eventFile = 'hgEvents.json';

const roleName = "HG Creator";

// Must total to 1.0
const multiEventUserDistribution = {
  1: 0.65,
  2: 0.25,
  3: 0.04,
  4: 0.03,
  6: 0.02,
  7: 0.01
};

var Discord, client, command, common;
var games = {};
var defaultPlayerEvents = [];
var defaultArenaEvents = [];

fs.readFile(saveFile, function(err, data) {
  if (err) return;
  games = JSON.parse(data);
  if (!games) games = {};
});
fs.readFile(eventFile, function(err, data) {
  if (err) return;
  try {
    var parsed = JSON.parse(data);
    if (parsed) {
      defaultPlayerEvents = parsed["player"];
      defaultArenaEvents = parsed["arena"];
    }
  } catch (err) {
    console.log(err);
  }
});
fs.watchFile(eventFile, function(curr, prev) {
  if (curr.mtime == pref.mtime) return;
  if (common) common.LOG("Re-reading default events from file");
  else console.log("HG: Re-reading default events from file");
  fs.readFile(eventFile, function(err, data) {
    if (err) return;
    try {
      var parsed = JSON.parse(data);
      if (parsed) {
        defaultPlayerEvents = parsed["player"];
        defaultArenaEvents = parsed["arena"];
      }
    } catch (err) {
      console.log(err);
    }
  });
});

exports.helpMessage = "Hungry Games coming soon!";

// Initialize module.
exports.begin = function(Discord_, client_, command_, common_) {
  Discord = Discord_;
  client = client_;
  command = command_;
  common = common_;

  command.on('hgcreate', function(msg) { checkPerms(msg, createGame) }, true);
  command.on('hgreset', function(msg) { checkPerms(msg, resetGame) }, true);
  command.on('hginfo', function(msg) { checkPerms(msg, showGameInfo) }, true);
  command.on('hgdefaultevents', function(msg) {
    checkPerms(msg, showGameEvents)
  }, true);
  command.on('hgexclude', function(msg) { checkPerms(msg, excludeUser) }, true);
  command.on('hginclude', function(msg) { checkPerms(msg, includeUser) }, true);
  command.on(['hgoption', 'hgoptions'], function(msg) {
    checkPerms(msg, toggleOpt)
  }, true);
  command.on(
      'hgaddevent', function(msg) { checkPerms(msg, createEvent) }, true);
  command.on(
      'hgremoveevent', function(msg) { checkPerms(msg, removeEvent) }, true);
  command.on('hgevents', function(msg) { checkPerms(msg, listEvents) }, true);
  command.on('hgplayers', function(msg) { checkPerms(msg, listPlayers) }, true);
  command.on('hgstart', function(msg) { checkPerms(msg, startGame) }, true);
  command.on('hgpause', function(msg) { checkPerms(msg, pauseAutoplay) }, true);
  command.on(
      'hgautoplay', function(msg) { checkPerms(msg, startAutoplay) }, true);
  command.on('hgnext', function(msg) { checkPerms(msg, nextDay) }, true);
  command.on('hgend', function(msg) { checkPerms(msg, endGame) }, true);
  command.on('hgsave', function(msg) { checkPerms(msg, exports.save) }, false);

  initialized = true;
  common.LOG("HungryGames Init", "HG");
};
// Removes all references to external data and prepares for unloading.
exports.end = function() {
  if (!initialized) return;
  initialized = false;
  command.deleteEvent('hgcreate');
  command.deleteEvent('hgreset');
  command.deleteEvent('hginfo');
  command.deleteEvent('hgdefaultevents');
  command.deleteEvent('hgexclude');
  command.deleteEvent('hginclude');
  command.deleteEvent('hgoption');
  command.deleteEvent('hgoptions');
  command.deleteEvent('hgaddevent');
  command.deleteEvent('hgremoveevent');
  command.deleteEvent('hgevents');
  command.deleteEvent('hgplayers');
  command.deleteEvent('hgstart');
  command.deleteEvent('hgpause');
  command.deleteEvent('hgautoplay');
  command.deleteEvent('hgnext');
  command.deleteEvent('hgend');
  command.deleteEvent('hgsave');
  delete command;
  delete Discord;
  delete client;
  delete common;
};

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
  // The rank at which this user died.
  this.rank = 0;
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
    games[id].currentGame.day = {num: 0, state: 0};
    games[id].currentGame.includedUsers.forEach(el => {
      el.living = true;
      el.rank = 0;
      el.state = "normal"
    });
  } else if (games[id]) {
    reply(msg, "Creating a new game with default settings.");
    games[id].currentGame = {
      name: msg.guild.name + "'s Hungry Games",
      inProgress: false,
      includedUsers:
          msg.guild.members
              .filter(function(obj) {
                return !(!games[id].options.includeBots && obj.user.bot);
              })
              .map(function(obj) {
                return new Player(obj.id, obj.user.username);
              }),
      ended: false,
      day: {num: 0, state: 0, events: []}
    };
  } else {
    games[id] = {
      excludedUsers: [],
      options: {
        arenaEvents: false,
        teamSize: 0,
        resurrection: false,
        includeBots: false
      },
      customEvents: {player: [], arena: []},
      currentGame: {
        name: msg.guild.name + "'s Hungry Games",
        inProgress: false,
        includedUsers:
            msg.guild.members.filter(function(obj) { return !obj.user.bot; })
                .map(function(obj) {
                  return new Player(obj.id, obj.user.username);
                }),
        ended: false,
        day: {num: 0, state: 0, events: []}
      },
      autoPlay: false
    };
    reply(
        msg,
        "Created a Hungry Games with default settings and all members included.");
  }
}
function resetGame(msg, id) {
  const command = msg.content.split(' ')[1];
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
    } else {
      reply(
          msg,
          "Please specify what data to reset (all {deletes all data for this server}, events {deletes all custom events}, current {deletes all data about the current game))");
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
        `**Included** (${numUsers}):\n${teamList}\n**Excluded** (${games[id].excludedUsers.length}):\n${games[id].excludedUsers.join(", ")}`);
    games[id].currentGame.inProgress = true;
  }
}
function pauseAutoplay(msg) {
  reply(msg, "This doesn't work yet!");
}
function startAutoplay(msg) {
  reply(msg, "This doesn't work yet!");
}
// Simulate a single day.
function nextDay(msg, id) {
  if (!games[id] || !games[id].currentGame.inProgress) {
    reply(
        msg, "You must start a game first! Use \"?hgstart\" to start a game!");
    return;
  }
  if (games[id].currentGame.day.state != 0) {
    reply(msg, "Already simulating day.");
    return;
  }
  games[id].currentGame.day.state = 1;
  games[id].currentGame.day.num++;
  games[id].currentGame.day.events = [];

  console.log("Starting new day");

  // TODO: Do arena event if enabled.

  var userPool = games[id].currentGame.includedUsers.filter(function(obj) {
    return obj.living;
  });
  // TODO: Don't let teams attack eachother.
  var userEventPool = defaultPlayerEvents.concat(games[id].customEvents.player);
  console.log("Starting events");
  var loop = 0;
  while (userPool.length > 0) {
    loop++;
    var eventTry =
        userEventPool[Math.floor(Math.random() * userEventPool.length)];

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

    console.log("Found suitable event");

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

    console.log("Affecting users " + effectedUsers.length);

    effectUser = function(i) {
      var index = userPool.findIndex(function(obj) {
        return obj.id == effectedUsers[i].id;
      });
      userPool.splice(index, 1);

      index = games[id].currentGame.includedUsers.findIndex(function(obj) {
        return obj.id == effectedUsers[i].id;
      });
      return index;
    };

    killUser = function(i) {
      var index = effectUser(i);
      games[id].currentGame.includedUsers[index].living = false;
      games[id].currentGame.includedUsers[index].state = "dead";
      // TODO: Calculate rank properly.
      games[id].currentGame.includedUsers[index].rank = 1;
    };

    woundUser = function(i) {
      var index = effectUser(i);
      games[id].currentGame.includedUsers[index].state = "wounded";
    };
    restoreUser = function(i) {
      var index = effectUser(i);
      games[id].currentGame.includedUsers[index].state = "normal";
    };

    if (eventTry.victim.outcome != "nothing") {
      for (var i = 0; i < numVictim; i++) {
        if (eventTry.victim.outcome == "dies") killUser(i);
        else if (eventTry.victim.outcome == "wounded") woundUser(i);
        else if (eventTry.victim.outcome == "thrives") restoreUser(i);
      }
    }
    if (eventTry.attacker.outcome != "nothing") {
      for (var i = numVictim; i + numVictim < numAttacker; i++) {
        if (eventTry.attacker.outcome == "dies") killUser(i);
        else if (eventTry.attacker.outcome == "wounded") woundUser(i);
        else if (eventTry.attacker.outcome == "thrives") restoreUser(i);
      }
    }
    // TODO: Store users in events for better output.
    games[id].currentGame.day.events.push(
        eventTry.message
            .replace(
                "{victim}",
                formatMultiNames(effectedUsers.splice(0, numVictim)))
            .replace(
                "{attacker}",
                formatMultiNames(effectedUsers.splice(0, numAttacker))));
    if (effectedUsers.length != 0) {
      console.log("Effected users remain! " + effectedUsers.length);
    }
    console.log("Event complete");
  }
  console.log("Ending events");

  var numAlive = 0;
  var lastIndex = 0;
  games[id].currentGame.includedUsers.forEach(function(el, i) {
    if (el.living) {
      numAlive++;
      lastIndex = i;
    }
  });

  if (numAlive == 1) {
    games[id].currentGame.day.events.push(
        "\n" + games[id].currentGame.includedUsers[lastIndex].name +
        " has won " + games[id].currentGame.name + "!");
    games[id].currentGame.inProgress = false;
    games[id].currentGame.ended = true;
  }

  console.log("Day complete");
  games[id].currentGame.day.state = 0;
  // TODO: Format events better.
  reply(
      msg, games[id].currentGame.day.events.join('\n'), "Day " +
          games[id].currentGame.day.num + " has ended with " + numAlive +
          " remaining.");
}
function weightedRand() {
  var i, sum = 0, r = Math.random();
  for (i in multiEventUserDistribution) {
    sum += multiEventUserDistribution[i];
    if (r <= sum) return i * 1;
  }
}
function formatMultiNames(names) {
  var output = "";
  for (var i = 0; i < names.length; i++) {
    output += names[i].name;

    if (i == names.length - 2) output += ", and ";
    else if (i != names.length - 1) output += ", ";
  }
  return output;
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
        "There don't appear to be any included players. Have you created a game with \"?hgcreate\"?";
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
  var option = msg.content.split(' ')[1];
  var value = msg.content.split(' ')[2];
  if (!games[id] || !games[id].currentGame) {
    reply(msg, "You must create a game first before editing settings! Use \"?hgcreate\" to create a game.");
  } else if (games[id].currentGame.inProgress) {
    reply(msg, "You must end this game before changing settings. Use \"?htend\" to abort this game.");
  } else if (typeof option === 'undefined') {
    reply(
        msg, "Here are the current options:" +
            JSON.stringify(games[id].options, null, 2) + ".");
  } else if (typeof games[id].options[option] === 'undefined') {
    reply(msg, "That is not a valid option to change! Valid options are " + JSON.stringify(games[id].options) + ".");
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
  var stringList = "=== Player Events ===\n";
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

  reply(msg, stringList);
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
