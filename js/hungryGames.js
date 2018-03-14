const fs = require('fs');

const saveFile = 'hg.json';
const eventFile = 'hgEvents.json';

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

console.log("HungryGames Instantiate!");
exports.helpMessage = "Hungry Games coming soon!";
exports.begin = function(Discord_, client_, command_, common_) {
  Discord = Discord_;
  client = client_;
  command = command_;
  common = common_;

  command.on('hgcreate', createGame, true);
  command.on('hgreset', resetGame, true);
  command.on('hginfo', showGameInfo, true);
  command.on('hgdefaultevents', showGameEvents, true);
  command.on('hgexclude', excludeUser, true);
  command.on('hginclude', includeUser, true);
  command.on('hgoption', toggleOpt, true);
  command.on('hgaddevent', createEvent, true);
  command.on('hgremoveevent', removeEvent, true);
  command.on('hgevents', listEvents, true);
  command.on('hgstart', startGame, true);
  command.on('hgpause', pauseAutoplay, true);
  command.on('hgautoplay', startAutoplay, true);
  command.on('hgnext', nextDay, true);
  command.on('hgend', endGame, true);
  command.on('hgsave', exports.save);

  common.LOG("HungryGames Init", "HG");
};

// Create //
function createGame(msg) {
  const id = msg.guild.id;
  if (games[id]) {
    reply(
        msg,
        "This server already has a Hungry Games set up. If you wish to create a new one, you must delete the current one first with \"hgreset\".");
    return;
  } else {
    games[id] = {
      excludedUsers: {},
      options: {arenaEvents: true},
      customEvents: {player: [], arena: []},
      currentGame: {
        name: msg.guild.name + "'s Hungry Games",
        inProgress: false,
        paused: false,
        includedUsers: {},
        day: {num: 0, state: 0}
      },
      autoPlay: false
    };
    reply(
        msg,
        "Created a Hungry Games with default settings and all members included.");
  }
}
function resetGame(msg) {
  const id = msg.guild.id;
  if (games[id]) {
    reply(msg, "Resetting ALL Hungry Games data for this server!");
    delete games[id];
  } else {
    reply(
        msg, "There is no data to reset. Start a new game with \"hgcreate\".");
  }
}
function showGameInfo(msg) {
  if (games[msg.guild.id])
    reply(msg, JSON.stringify(games[msg.guild.id], null, 2));
  else
    reply(msg, "No game created");
}
function showGameEvents(msg) {
  reply(
      msg, "Player: " + JSON.stringify(defaultPlayerEvents, null, 2) +
          "\nArena: " + JSON.stringify(defaultArenaEvents, null, 2));
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

// Time Control //
function startGame(msg) {

}
function pauseAutoplay(msg) {

}
function startAutoplay(msg) {

}
function nextDay(msg) {

}
function endGame(msg) {

}

// User Management //
function excludeUser(msg) {

}

function includeUser(msg) {

}

function toggleOpt(msg) {

}

// Game Events //
function createEvent(msg) {

}
function removeEvent(msg) {

}
function listEvents(msg) {

}

// Util //
exports.save = function(opt) {
  if (opt == "async") {
    common.LOG("Saving async", "HG");
    fs.writeFile(saveFile, JSON.stringify(games), function() {});
  } else {
    common.LOG("Saving sync", "HG");
    fs.writeFileSync(saveFile, JSON.stringify(games));
  }
};

function exit(code) {
  if (code != -1) return;
  if (common) common.LOG("Caught exit! Saving!", "HG");
  exports.save();
    } function
    sigint() {
      if (common) common.LOG("Caught SIGINT! Saving!", "HG");
      exports.save();
    }

    process.on('exit', exit);
process.on('SIGINT', sigint);
