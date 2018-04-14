const Discord = require('discord.js');
const fs = require('fs');
const common = require('./common.js');
const dateFormat = require('dateformat');
const math = require('mathjs');
const algebra = require('algebra.js');
const vm = require('vm');
const jimp = require('jimp');
const client = new Discord.Client();

math.config({matrix: "Array"});

var HGames;
try {
  HGames = require('./hungryGames.js');
} catch (err) {
  console.log(err);
}
var Music;
try {
  Music = require('./music.js');
} catch (err) {
  console.log(err);
}

const isDev = false;
const prefix = isDev ? '~' : '?';

// Password for changing the game the bot is playing. This doesn't need to be
// secure, and I could probably just remove it.
const password = "password";
const spikeyId = "124733888177111041";

const smitePerms =
    Discord.Permissions.FLAGS.CONNECT | Discord.Permissions.FLAGS.VIEW_CHANNEL;

var prevUserSayId = "";
var prevUserSayCnt = 0;

var reactToAnthony = true;
var timers = [];

const introduction = "\nHello! My name is SpikeyBot.\n" +
    "I was created by SpikeyRobot#9836, so if you wish to add any features, feel free to PM him! (Tip: Use **" +
    prefix + "pmspikey**)\n" +
    "\nIf you'd like to know what I can do, type **" + prefix +
    "help** in a PM to me and I'll let you know!";
const helpmessagereply = "I sent you a DM with commands!";
const blockedmessage =
    "I couldn't send you a message, you probably blocked me :(";
const onlyservermessage = "This command only works in servers, sorry!";
const addmessage =
    "Want to add me to your server? Click this link:\n(You'll need to be signed into discord in your browser first)";
const disabledcommandmessage =
    "This command has been disabled in this channel.";
const addLink =
    "https://discordapp.com/oauth2/authorize?&client_id=318552464356016131&scope=bot";
const banMsgs = [
  "It was really nice meeting you!",
  "You're a really great person, I'm sorry I had to do this.", "See you soon!",
  "And they were never heard from again...", "Poof! Gone like magic!",
  "Does it seem quiet in here? Or is it just me?",
  "And like the trash, they're were taken out!",
  "Looks like they made like a tree, and leaf-ed. (sorry)",
  "Oof! Looks like my boot to their behind left a mark!",
  "Between you and me, I didn't like them anyways.",
  "Everyone rejoice! The world has been eradicated of one more person that no one liked anyways."
];
const helpObject = {
  title: "Here's the list of stuff I can do! PM SpikeyRobot (" + prefix +
      "pmspikey) feature requests!\n",
  sections: [
    {
      title: "Music Stuff",
      rows: [
        "play 'url or search' // Play a song in your current voice channel, or add a song to the queue.",
        "stop // Stop playing music and leave the voice channel.",
        "skip // Skip the currently playing song.",
        "queue // View the songs currently in the queue.",
        "remove 'index' // Remove a song with the given queue index from the queue.",
        "lyrics 'song' // Search for song lyrics."
      ]
    },
    {
      title: "General Stuff",
      rows: [
        "addme // I will send you a link to add me to your server!",
        "help // Send this message to you.", "say // Make me say something.",
        "createdate // I will tell you the date you created your account! (You can mention people)",
        "joindate // I will tell you the date you joined the server you sent the message from! (You can mention people)",
        "pmme // I will introduce myself to you!",
        "pmspikey 'message' // I will send SpikeyRobot (my creator) your message because you are too shy!",
        "flip // I have an unlimited supply of coins! I will flip one for you!",
        "avatar 'mention' // Need a better look at your profile pic? I'll show you the original.",
        "ping // Want to know what my delay to the server is? I can tell you my ping!"
      ]
    },
    {
      title: "Math Stuff",
      rows: [
        "add 'numbers' // Add positive or negative numbers separated by spaces.",
        "simplify 'equation' // Simplify an equation with numbers and variables.",
        "solve 'eqution' // Solve an equation for each variable in the equation.",
        "evaluate 'problem' // Solve a math problem, and convert units.",
        "derive 'equation with x' // Find dy/dx of an equation.",
        "graph 'equation with x' '[xMin, xMax]' '[yMin, yMax]' // Graph an equation, Maxes and mins are all optional, but brackets are required."
      ]
    },
    {
      title: "Admin Stuff",
      rows: [
        "purge 'number' // Remove a number of messages from the current text channel!",
        "fuckyou/" + prefix +
            "ban 'mention' // I will ban the person you mention with a flashy message!",
        "smite 'mention' // Silence the peasant who dare oppose you!"
      ]
    },
  ]
};

// Format help message into rich embed.
var tmpHelp = new Discord.RichEmbed();
tmpHelp.setTitle(helpObject.title);
helpObject.sections.forEach(function(obj) {
  tmpHelp.addField(
      obj.title, "```js\n" +
          obj.rows.map(function(row) { return prefix + row; }).join('\n') +
          "\n```",
      true);
});
const helpmessage = tmpHelp;

common.begin();

// Command event management.
function Command() {
  var cmds = {};
  var blacklist = {};
  this.trigger = function(cmd, msg) {
    if (cmd.startsWith(prefix)) cmd = cmd.replace(prefix, '');
    if (cmds[cmd]) {
      if (cmds[cmd].validOnlyOnServer && msg.guild === null) {
        reply(msg, onlyservermessage);
        return true;
      } else if (
          blacklist[cmd] && blacklist[cmd].lastIndexOf(msg.channel.id) > -1) {
        reply(msg, disabledcommandmessage);
        return true;
      }
      try {
        cmds[cmd](msg);
      } catch (err) {
        common.ERROR(cmd + ": FAILED");
        console.log(err);
        reply(msg, "An error occurred! Oh noes!");
      }
      return true;
    } else {
      return false;
    }
  };
  this.on = function(cmd, cb, onlyserver) {
    if (typeof cb !== 'function') throw("Event callback must be a function.");
    cb.validOnlyOnServer = onlyserver || false;
    if (typeof cmd === 'string') {
      if (cmds[cmd]) {
        common.ERROR(
            "Attempted to register a second handler for event that already exists! (" +
            cmd + ")");
      } else {
        cmds[cmd] = cb;
      }
    } else if (Array.isArray(cmd)) {
      for (var i = 0; i < cmd.length; i++) cmds[cmd[i]] = cb;
    } else {
      throw("Event must be string or array of strings");
    }
  };
  this.deleteEvent = function(cmd) {
    if (cmds[cmd]) {
      delete cmds[cmd];
      delete blacklist[cmd];
    } else {
      common.ERROR(
          "Requested deletion of event handler for event that was never registered! (" +
          cmd + ")");
    }
  };
  this.disable = function (cmd, channel) {
    if (cmds[cmd]) {
      if (!blacklist[cmd] || blacklist[cmd].lastIndexOf(channel) == -1) {
        if (!blacklist[cmd]) blacklist[cmd] = [channel];
        else blacklist[cmd].push(channel);
        /* } else {
          common.ERROR(
              "Requested disable of command that is already disabled! (" + cmd +
              ")"); */
      }
    } else {
      common.ERROR(
          "Requested disable for event that was never registered! (" + cmd +
          ")");
    }
  };
  this.enable = function (cmd, channel) {
    if (blacklist[cmd]) {
      var index = blacklist[cmd].lastIndexOf(channel);
      if (index > -1) {
        blacklist[cmd].splice(index, 1);
      } else {
        common.ERROR(
            "Requested enable of event that is enabled! (" + cmd + ")");
      }
    } else {
      common.ERROR(
          "Requested enable for event that is not disabled! (" + cmd + ")");
    }
  };
}
var command = new Command();

// Checks if given message is the given command.
function isCmd(msg, cmd) {
  return msg.content.startsWith(prefix + cmd);
}
// Changes the bot's status message.
function updategame(password_, game) {
  if (password_ == password) {
    client.user.setPresence({game: {name: game}});
    common.LOG('Changed game to "' + game + '"');
    return 0;
  } else {
    common.LOG('Didn\'t change game (' + password_ + ')');
    return 1;
  }
}
// Creates formatted string for mentioning the author of msg.
function mention(msg) {
  return `<@${msg.author.id}>`;
}
// Replies to the author and channel of msg with the given message.
function reply(msg, text, post) {
  post = post || "";
  return msg.channel.send(mention(msg) + "\n```\n" + text + "\n```" + post);
}

// BEGIN //
client.on('ready', _ => {
  common.LOG(`Logged in as ${client.user.tag}!`);
  updategame(password, prefix + 'help for help');
  client.fetchUser(spikeyId).then(
      user => { user.send("I just rebooted (JS)"); });
  // common.LOG("Initializing submodules...");
  try {
    HGames.begin(prefix, Discord, client, command, common);
  } catch(err) {
    client.fetchUser(spikeyId).then(
        user => { user.send("Failed to initialize HungryGames"); });
    console.log(err);
  }
  try {
    Music.begin(prefix, Discord, client, command, common);
  } catch(err) {
    client.fetchUser(spikeyId).then(
        user => { user.send("Failed to initialize Music"); });
    console.log(err);
  }
  fs.readFile('reboot.dat', function(err, file) {
    if (err) return;
    var msg = JSON.parse(file);
    var channel = client.channels.get(msg.channel.id);
    if (channel)
      channel.fetchMessage(msg.id)
          .then(msg_ => { msg_.edit("`Reboot complete.`"); })
          .catch(_ => {});

    if (msg.noReactToAnthony) reactToAnthony = false;

    setTimer = function(timer) {
      timers.push(timer);
      return function() {
        client.fetchUser(timer.id).then(user => {
          user.send(timer.message);
          timers =
              timers.filter(function(obj) { return obj.time > Date.now(); });
        });
      };
    };

    const now = Date.now();
    for (var i in msg.timers) {
      client.setTimeout(setTimer(msg.timers[i]), msg.timers[i].time - now);
    }
  });
});

client.on('message', msg => {
  if (msg.author.id == client.user.id) return;
  if (msg.content.endsWith(", I'm Dad!")) {
    msg.channel.send("Hi Dad, I'm Spikey!");
  }
  if (msg.author.bot) return;

  // If message is equation we can graph.
  const regexForm = new RegExp("^[yY]\\s*=");
  if (msg.content.match(regexForm)) {
    msg.content = "?graph " + msg.content;
  }

  if (msg.guild === null && !msg.content.startsWith(prefix)) {
    msg.content = prefix + msg.content;
  }

  if (reactToAnthony && msg.author.id == '174030717846552576') msg.react('😮');

  if (isCmd(msg, '')) {
    if (msg.guild !== null) {
      common.LOG(
          msg.guild.name + "#" + msg.channel.name + "@" + msg.author.username +
          msg.content.replaceAll('\n', '\\n'));
    } else {
      common.LOG(
          "PM: @" + msg.author.username + msg.content.replaceAll('\n', '\\n'));
    }
    if (!command.trigger(msg.content.split(/ |\n/)[0], msg) &&
        msg.guild === null) {
      msg.channel.send(
          "Oops! I'm not sure how to help with that! Type **help** for a list of commands I know how to respond to.");
    }
  }
});

client.on('guildCreate', guild => {
  common.LOG("ADDED TO NEW GUILD: " + guild.id + ": " + guild.name);
  var channel = "";
  var pos = -1;
  try {
    guild.channels.forEach(function(val, key) {
      if (val.type != 'voice' && val.type != 'category') {
        if (pos == -1 || val.position < pos) {
          pos = val.position;
          channel = val.id;
        }
      }
    });
    client.channels.get(channel).send(introduction);
  } catch (err) {
    common.ERROR("Failed to send welcome to guild:" + guild.id);
    console.log(err);
  }
});

client.on('guildBanAdd', (guild, user) => {
  var channel = "";
  var pos = -1;
  try {
    guild.channels.forEach(function(val, key) {
      if (val.type != 'voice' && val.type != 'category') {
        if (pos == -1 || val.position < pos) {
          pos = val.position;
          channel = val.id;
        }
      }
    });
    guild.fetchAuditLogs({limit: 1})
        .then(logs => {
          client.channels.get(channel).send(
              "`Poof! " + logs.entries.first().executor.username +
              " has ensured " + user.username +
              " will never be seen again...`");
        })
        .catch(err => {
          client.channels.get(channel).send(
              "`Poof! " + user.username + " was never seen again...`");
          common.ERROR("Failed to find executor of ban.");
          console.log(err);
        });
  } catch (err) {
    common.ERROR("Failed to send ban from guild:" + guild.id);
    console.log(err);
  }
});

command.on('addme', msg => { reply(msg, addmessage, addLink); });

command.on('add', msg => {
  const splitstring = msg.content.replace(prefix + 'add ', '')
                        .replaceAll('-', ' -')
                        .replaceAll('  ', ' ')
                        .replaceAll('\\+', ' ')
                        .split(' ');
  if (splitstring.join('').match(/[^0-9\-]*/)) {
    reply(
        msg, "This command only adds and subtracts numbers. Use \"" + prefix +
            "math\" for more complex math.");
    return;
  }
  var number = 0;
  var numNonNumber = 0;
  for (var i in splitstring) {
    if (typeof(splitstring[i] * 1) !== 'number') {
      numNonNumber++;
    } else {
      number += splitstring[i] * 1;
    }
  }
  var ending = "";
  var anotherEnding = "";
  if (numNonNumber > 0) {
    ending =
        "But you entered the numbers oddly, so I am not sure if I understood you properly.";
  }
  if (number == 69) {
    anotherEnding = ":wink:";
  } else if (number == 420) {
    anotherEnding = ":four_leaf_clover:";
  } else if (number == 666) {
    anotherEnding = ":smiling_imp:";
  } else if (number == 9001) {
    anotherEnding = ":fire:";
  } else if (number == 80085 || number == 58008) {
    anotherEnding = ":ok_hand:";
  }
  reply(msg, number + "\n" + ending, anotherEnding);
});

command.on('simplify', msg => {
  try {
    var formula = msg.content.replace(prefix + 'simplify', '');
    var simplified = simplify(formula);
    var hasVar = simplified.match(/[A-Za-z]/);
    reply(msg, (hasVar ? "0 = " : "") + simplified);
  } catch(err) {
    reply(msg, err.message);
  }
});
function simplify(formula) {
  if (formula.indexOf('=') > -1) {
    var split = formula.split('=');
    formula = split[1] + " - (" + split[0] + ")";
  }
  var simplified = math.simplify(formula).toString();
  return simplified.replace(/ \* ([A-Za-z])/g, "$1");
}

command.on('solve', msg => {
  if (msg.content.lastIndexOf('=') != msg.content.indexOf('=')) {
    reply(msg, "Please ensure your equation has exactly 1 equals sign.");
    return;
  }
  const equation = msg.content.replace(prefix + 'solve', '');
  const variables = equation.match(/[A-Za-z]+/gm);
  if (!variables || variables.length < 1) {
    reply(msg, "Please ensure you have at least one variable in the equation.");
    return;
  }
  var error = "";
  var messages = [];
  for (var i = 0; i < variables.length; i++) {
    try {
      messages.push(algebra.parse(equation).solveFor(variables[i]).toString());
    } catch (err) {
      error += "For " + variables[i] + ": " + err.message + "\n";
    }
  }
  const outMessage =
      messages.map(function(obj, i) { return variables[i] + " = " + obj; })
          .join('\n');
  reply(msg, outMessage || "Oops, somthing didn't work!", error);
});
command.on(['eval', 'evaluate'], msg => {
  try {
    var formula = msg.content.replace(prefix + 'eval', '')
                      .replace(prefix + 'evaluate', '');
    if (formula.indexOf('=') > -1) {
      var split = formula.split('=');
      formula = split[1] + " - (" + split[0] + ")";
    }
    var simplified = math.eval(formula).toString();
    simplified = simplified.replace(/ \* ([A-Za-z])/g, "$1");
    reply(msg, simplified);
  } catch(err) {
    reply(msg, err.message);
  }
});

command.on('graph', msg => {
  const graphSize = 200;
  const dotSize = 2;
  var xVal, yVal, ypVal, domainMin, domainMax, rangeMin, rangeMax;
  var cmd = msg.content.replace(prefix + "graph", "");
  var expression = cmd.replace(/\[.*\]|\n/gm, '');
  try {
    var expr = math.compile(expression);
    var domainTemp = cmd.match(/\[([^,]*),([^\]]*)\]/m);
    var rangeTemp = cmd.match(/\[[^\]]*\][^\[]*\[([^,]*),([^\]]*)\]/m);
    if (domainTemp !== null && domainTemp.length == 3) {
      domainMin = math.eval(domainTemp[1]);
      domainMax = math.eval(domainTemp[2]);
    } else {
      domainMin = -10;
      domainMax = 10;
    }
    if (rangeTemp !== null && rangeTemp.length == 3) {
      rangeMin = math.eval(rangeTemp[1]);
      rangeMax = math.eval(rangeTemp[2]);
    }
    xVal = math.range(
        domainMin, domainMax, (domainMax - domainMin) / graphSize / dotSize);
    yVal = xVal.map(function(x) { return expr.eval({x: x}); });
    try {
      var formula = expression;
      if (formula.indexOf('=') > -1) {
        var split = formula.split('=');
        formula = split[1] + " - (" + split[0] + ")";
      }
      var exprSlope = math.derivative(formula, 'x');
      ypVal = xVal.map(function(x) { return exprSlope.eval({x: x}); });
    } catch (err) {
      console.log(err);
      msg.channel.send("Failed to derive given equation. " + err.message);
      ypVal = xVal.map(function(x) { return 1; });
    }
  } catch(err) {
    reply(msg, err.message);
    return;
  }
  var finalImage = new jimp(graphSize, graphSize, 0xFFFFFFFF);
  var minY = 0;
  var maxY = 0;
  if (typeof rangeMin === 'undefined') {
    yVal.forEach(function(obj) {
      if (minY > obj) minY = obj;
      if (maxY < obj) maxY = obj;
    });
    minY += minY * 0.05;
    maxY += maxY * 0.05;
  } else {
    minY = rangeMin;
    maxY = rangeMax;
  }
  var zeroY = Math.round(-minY / (maxY - minY) * graphSize);
  var zeroX = Math.round(-domainMin / (domainMax - domainMin) * graphSize);
  finalImage.blit(new jimp(dotSize, graphSize, 0xDDDDDDFF), zeroX, 0);
  finalImage.blit(
      new jimp(graphSize, dotSize, 0xDDDDDDFF), 0, graphSize - zeroY);

  var lastSlope;
  var turningPoints = [];
  for (var i = 0; i < xVal.length; i++) {
    const y =
        graphSize - Math.round((yVal[i] - minY) / (maxY - minY) * graphSize);
    if (y >= graphSize || y < 0) continue;
    var myColor = 0x000000FF;
    mySize = dotSize;
    if ((lastSlope < 0 && ypVal[i] >= 0) || (lastSlope > 0 && ypVal[i] <= 0)) {
      myColor = 0xFF0000FF;
      turningPoints.push({x: xVal[i], y: yVal[i]});
      mySize = dotSize * 2;
    }
    lastSlope = ypVal[i];
    finalImage.blit(
        new jimp(mySize, mySize, myColor), i / xVal.length * graphSize, y);
  }
  var expMatch = expression.match(/^\s?[yY]\s*=(.*)/);
  if (!expMatch) {
    expression = "y = " + simplify(expression);
  } else {
    expression = "y = " + simplify(expMatch[1]);
  }
  finalImage.getBuffer(jimp.MIME_PNG, function(err, out) {
    var embed = new Discord.RichEmbed();
    embed.setTitle("Graph of " + expression);
    embed.setDescription(
        "Plot Domain: [" + domainMin + ", " + domainMax + "]\nPlot Range: [" +
        minY + ", " + maxY + "]");
    embed.attachFile(new Discord.Attachment(out, "graph.png"));
    embed.setColor([255, 255, 255]);
    if (turningPoints.length > 0) {
      embed.addField(
          "Approximate Turning Points",
          turningPoints
              .map(function(obj) { return "(" + obj.x + ", " + obj.y + ")"; })
              .join('\n'),
          false);
    }
    msg.channel.send(embed);
  });
});
command.on('derive', msg => {
  try {
    var formula = msg.content.replace(prefix + 'derive', '');
    if (formula.indexOf('=') > -1) {
      var split = formula.split('=');
      formula = split[1] + " - (" + split[0] + ")";
    }
    var simplified = math.derivative(formula, 'x').toString();
    simplified = simplified.replace(/ \* ([A-Za-z])/g, "$1");
    reply(msg, simplified);
  } catch(err) {
    reply(msg, err.message);
  }
});

command.on('js', msg => {
  try {
    var sandbox = {__stdout: [], __stderr: []};

    var code =
        "(function(cb){console.log=(function(w){return function(){w.apply(console,arguments);cb.apply(null,arguments);};})(console.log);})(function(v){__stdout.push(v);});(function(cb){console.error=(function(w){return function(){w.apply(console,arguments);cb.apply(null,arguments);};})(console.error);})(function(v){__stderr.push(v);});\n";

    code += msg.content.replace(prefix + 'js', '');
    var stdexit = vm.runInNewContext(
        code, sandbox, {filename: "Line", timeout: "100", lineOffset: -1});
    var stdout = sandbox.__stdout;
    var stderr = sandbox.__stderr;
    delete sandbox.__stdout;
    delete sandbox.__stderr;
    var embed = new Discord.RichEmbed();
    embed.setColor([0, 255, 255]);
    if (stdout.length > 0) {
      embed.addField(
          "console.log", JSON.stringify(stdout, null, 2).substr(0, 1000), true);
    }
    if (stderr.length > 0) {
      embed.addField(
          "console.error", JSON.stringify(stderr, null, 2).substr(0, 1000),
          true);
    }
    if (Object.keys(sandbox).length !== 0) {
      embed.addField(
          "Global Variables", JSON.stringify(sandbox, null, 2)
                                  .replace(/^(?:{)+|^(?:})|^(?:  )/gm, ''),
          true);
    }
    if (stdexit) {
      embed.addField(
          "Returned Value", JSON.stringify(stdexit, null, 2).substr(0, 1000),
          true);
    }
    msg.channel.send(mention(msg), embed);
  } catch (err) {
    if (err.message == "Script execution timed out.") {
      reply(
          msg, "Oops! Your script was running for too long.",
          "(100 milliseconds is the longest a script may run.)");
    } else {
      reply(msg, err.stack.split('\n').splice(0, 6).join('\n'));
    }
  }
});

command.on(['timer', 'timers'], msg => {
  var split = msg.content.replace(prefix + "timer ", '').split(' ');
  if (split[0] == prefix + "timer" || split[0] == prefix + "timers") {
    var num = 0;
    var messages =
        timers.filter(function(obj) { return obj.id == msg.author.id; })
            .map(function(obj) {
              num++;
              return "In " +
                  Math.floor((obj.time - Date.now()) / 1000 / 60 * 10) / 10 +
                  " minutes: " + obj.message;
            });
    reply(msg, "You have " + num + " timers set.\n" + messages.join('\n'));
    return;
  }
  var time = split.splice(0, 1);
  var origMessage = split.join(' ');
  var message = origMessage ||
      "Your timer for " + time + " minute" + (time == "1" ? "" : "s") +
          " is over!";

  if (time > 0) {
    client.setTimeout(function() {
      msg.author.send(
          message );
      timers = timers.filter(function(obj) { return obj.time > Date.now(); });
    }, time * 1000 * 60);
    timers.push({
      id: msg.author.id,
      message: message,
      time: Date.now() + time * 1000 * 60
    });

    reply(msg, "Set timer for " + time + " minutes.", origMessage);
  } else {
    reply(msg, "Oops! Please make sure your time is larger than 0.");
  }
});

command.on('togglereact', msg => {
  reply(msg, "Toggled reactions to Anthony to " + !reactToAnthony + '. 😮');
  reactToAnthony = !reactToAnthony;
});
command.on('help', msg => {
  msg.author.send(helpmessage)
      .then(_ => {
        if (HGames && HGames.helpMessage) msg.author.send(HGames.helpMessage);
        if (Music && Music.helpMessage) msg.author.send(Music.helpMessage);
        if (msg.guild !== null) reply(msg, helpmessagereply, ":wink:");
      })
      .catch(_ => { reply(msg, blockedmessage); });
});
command.on('updategame', msg => {
  msg.delete();
  var command = msg.content.replace(prefix + 'updategame ', '');
  var password = command.split(' ')[0];
  var game = command.replace(password + " ", '');
  if (updategame(password, game)) {
    reply(msg, "I'm sorry, but you are not allowed to do that. :(\n");
  } else {
    reply(msg, "I changed my status to \"" + game + "\"!");
  }
});
command.on('say', msg => {
  msg.delete();
  var content = msg.content.replace(prefix + 'say', '');
  if (content.indexOf(' ') === 0) content.replace(' ', '');
  msg.channel.send(content);
  if (prevUserSayId != msg.author.id) {
    prevUserSayId = msg.author.id;
    prevUserSayCnt = 0;
  }
  prevUserSayCnt++;
  if (prevUserSayCnt % 3 === 0) {
    msg.channel.send(
        "Help! " + mention(msg) + " is putting words into my mouth!");
  }
});
command.on('createdate', msg => {
  if (msg.mentions.users.size === 0) {
    reply(
        msg, "You created your discord account on " +
            dateFormat(msg.author.createdTimestamp));
  } else {
    reply(
        msg, msg.mentions.users.first().username +
            " created their discord account on " +
            dateFormat(msg.mentions.users.first().createdTimestamp));
  }
});
command.on('joindate', msg => {
  if (msg.member) {
    if (msg.mentions.users.size === 0) {
      reply(
          msg, "You joined this server on " +
              dateFormat(msg.member.joinedTimestamp));
    } else {
      reply(
          msg, msg.mentions.users.first().username + " joined this server on " +
              dateFormat(msg.mentions.users.first().joinedTimestamp));
    }
  } else {
    reply(msg, onlyservermessage);
  }
});
command.on('pmme', msg => {
  msg.author.send(introduction)
      .then(_ => {
        if (msg.guild !== null) reply(msg, "I sent you a message.", ":wink:");
      })
      .catch(_ => { reply(msg, blockedmessage); });
});
command.on('pmspikey', msg => {
  client.fetchUser(spikeyId)
      .then(user => {
        user.send(msg.author.tag + ": " + msg.content).then(_ => {
          reply(msg, "I sent your message to SpikeyRobot.");
        });
      })
      .catch(err => {
        console.log(err);
        reply(
            msg,
            "Somethine went wrong and I couldn't send your message. Sorry that's all I know :(");
      });
});
command.on('thotpm', msg => {
  if (msg.author.id == spikeyId || msg.author.id == '265418316120719362' ||
      msg.author.id == '126464376059330562') {
    if (msg.guild !== null) msg.delete();
    if (msg.mentions.users.size === 0) return;
    msg.mentions.users.first().send(msg.content.replace(prefix + 'thotpm', ''));
    client.fetchUser(spikeyId).then(
        user => { user.send(msg.author.tag + ": " + msg.content); });
  }
});
command.on('flip', msg => {
  var rand = Math.round(Math.random());
  var url = "https://www.campbellcrowley.com/heads.png";
  var text = "Heads!";
  if (rand) {
    url = "https://www.campbellcrowley.com/tails.png";
    text = "Tails!";
  }
  var embed = new Discord.RichEmbed({title: text});
  embed.setImage(url);
  msg.channel.send(embed);
});
command.on(['purge', 'prune'], msg => {
  if (msg.channel.permissionsFor(msg.member)
          .has(Discord.Permissions.FLAGS.MANAGE_MESSAGES)) {
    var numString = msg.content.replace(prefix + 'purge ', '')
                        .replace(prefix + 'prune ', '');
    var num = Number(numString);
    if (numString.length === 0 || typeof num !== 'number') {
      reply(
          msg,
          "You must specify the number of messages to purge. (ex: ?purge 5)");
    } else {
      msg.channel.bulkDelete(num + 1);
    }
  } else {
    reply(msg, "I'm sorry, but you don't have permission to delete messages in this channel.");
  }
}, true);
command.on(['fuckyou', 'ban'], msg => {
  if (!msg.member.hasPermission(
          Discord.Permissions.FLAGS.BAN_MEMBERS, true, true, true)) {
    reply(
        msg, "You don't have permission for that!\n(Filthy " +
            msg.member.highestRole.name + ")");
  } else if (msg.mentions.members.size === 0) {
    reply(msg, "You must mention someone to ban after the command.");
  } else {
    var toBan = msg.mentions.members.first();
    if (msg.guild.ownerID !== msg.author.id &&
        Discord.Role.comparePositions(
            msg.member.highestRole, toBan.highestRole) <= 0) {
      reply(
          msg, "You can't ban " + toBan.user.username +
              "! You are not stronger than them!");
    } else {
      msg.guild.fetchMember(client.user).then(me => {
        var myRole = me.highestRole;
        if (Discord.Role.comparePositions(myRole, toBan.highestRole) <= 0) {
          reply(
              msg, "I can't ban " + toBan.user.username +
                  "! I am not strong enough!");
      } else {
        var banMsg = banMsgs[Math.floor(Math.random() * banMsgs.length)];
        toBan.ban({reason: banMsg})
            .then(_ => { reply(msg, banMsg, "Banned " + toBan.user.username); })
            .catch(err => {
              reply(
                  msg, "Oops! I wasn't able to ban " + toBan.user.username +
                      "! I'm not sure why though!");
              common.ERROR("Failed to ban user.");
              console.log(err);
            });
      }
      });
    }
  }
}, true);
command.on('smite', msg => {
  if (msg.mentions.members.size === 0) {
    reply(msg, "You must mention someone to ban after the command.");
  } else {
    var toSmite = msg.mentions.members.first();
    if (msg.guild.ownerID !== msg.author.id &&
        msg.member.Discord.Role.comparePositions(
            msg.member.highestRole, toSmite.highestRole) <= 0) {
      reply(
          msg, "You can't smite " + toSmite.user.username +
              "! You are not stronger than them!");
    } else {
      msg.guild.fetchMember(client.user).then(me => {
        var myRole = me.highestRole;
        if (Discord.Role.comparePositions(myRole, toSmite.highestRole) <= 0) {
          reply(
              msg, "I can't smite " + toSmite.user.username +
                  "! I am not strong enough!");
        } else {
          var hasSmiteRole = false;
          var smiteRole;
          msg.guild.roles.forEach(function(val, key) {
            if (val.name == "Smited") {
              hasSmiteRole = true;
              smiteRole = val;
            }
          });
          smite = function(role, member) {
            try {
              member.setRoles([role]).then(_ => {
                reply(
                    msg, "The gods have struck " + member.user.username +
                        " with lightning!");
              });
            } catch (err) {
              reply(
                  msg, "Oops! I wasn't able to smite " + member.user.username +
                      "! I'm not sure why though!");
            }
          };
          if (!hasSmiteRole) {
            msg.guild
                .createRole({
                  name: "Smited",
                  position: 0,
                  hoist: true,
                  color: "#2f3136",
                  permissions: smitePerms,
                  mentionable: true
                })
                .then(role => { smite(role, toSmite); })
                .catch(_ => {
                  reply(
                      msg, "I couldn't smite " + toSmite.user.username +
                          " because there isn't a \"Smited\" role and I couldn't make it!");
                });
          } else {
            smite(smiteRole, toSmite);
          }
        }
      });
    }
  }
}, true);
command.on(['profile', 'avatar'], msg => {
  var embed = new Discord.RichEmbed();
  if (msg.mentions.users.size > 0) {
    embed.setDescription(
        msg.mentions.users.first().username + "'s profile picture");
    embed.setImage(msg.mentions.users.first().avatarURL);
  } else {
    embed.setDescription(msg.author.username + "'s profile picture");
    embed.setImage(msg.author.avatarURL);
  }
  msg.channel.send(embed);
});

command.on('ping', msg => {
  reply(
      msg, "My ping is " + msg.client.ping + "ms",
      "`" + JSON.stringify(msg.client.pings) + "`");
}, true);

command.on('uptime', msg => {
  var ut = client.uptime;
  var formattedUptime = Math.floor(ut / 1000 / 60 / 60 / 24) + " Days, " +
      Math.floor(ut / 1000 / 60 / 60) % 24 + " Hours, " +
      Math.floor(ut / 1000 / 60) % 60 + " Minutes, " +
      Math.floor((ut / 1000) % 60) + " Seconds.";
  reply(msg, "I have been running for " + formattedUptime);
});


command.on('reboot', msg => {
  if (msg.author.id == spikeyId) {
    reply(msg, "Rebooting...").then(msg => {
      const now = Date.now();
      var toSave = {
        id: msg.id,
        channel: {id: msg.channel.id},
        noReactToAnthony: !reactToAnthony,
        timers: timers
      };
      try {
        fs.writeFileSync("reboot.dat", JSON.stringify(toSave));
      } catch (err) {
        common.ERROR("Failed to save reboot.dat");
        console.log(err);
      }
      process.exit(-1);
    });
  } else {
    reply(msg, "LOL! Good try!");
  }
});
command.on('reload', msg => {
  if (msg.author.id == spikeyId) {
    reply(msg, "Reloading modules...").then(warnMessage => {
      var error = false;
      try {
        try {
          HGames.save();
          HGames.end();
        } catch (err) {
        }
        delete require.cache[require.resolve('./hungryGames.js')];
        // delete HGames;
        HGames = require('./hungryGames.js');
        HGames.begin(prefix, Discord, client, command, common);
      } catch (err) {
        error = true;
        common.ERROR("Failed to reload HungryGames");
        console.log(err);
      }
      try {
        delete require.cache[require.resolve('./music.js')];
        Music = require('./music.js');
        Music.begin(prefix, Discord, client, command, common);
      } catch (err) {
        error = true;
        common.ERROR("Failed to reload Music");
        console.log(err);
      }
      if (error) {
        warnMessage.edit("`Reload completed with errors.`");
      } else {
        warnMessage.edit("`Reload complete.`");
      }
    });
  } else {
    reply(msg, "LOL! Good try!");
  }
});

command.on('game', msg => {
  var user = msg.author;
  if (msg.mentions.users.size !== 0) {
    user = msg.mentions.users.first();
  }
  if (user.presence.game) {
    reply(
        msg, user.username + ": " + user.presence.status,
        user.presence.game.type + ": " + user.presence.game.name + "(" +
            user.presence.game.url + ")");
  } else {
    reply(msg, user.username + ": " + user.presence.status, user.presence.game);
  }
});

// Dev: https://discordapp.com/oauth2/authorize?&client_id=422623712534200321&scope=bot
// Rel: https://discordapp.com/oauth2/authorize?&client_id=318552464356016131&scope=bot
if (isDev) {
  client.login('NDIyNjIzNzEyNTM0MjAwMzIx.DYeenA.K5pUxL8GGtVm1ml_Eb6SaZxSKnE');
} else {
  client.login("MzE4NTUyNDY0MzU2MDE2MTMx.DA0JAA.aNNIG_xR7ROtL4Ro_WZQjLiMLF0");
}
