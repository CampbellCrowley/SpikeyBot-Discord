const dateFormat = require('dateformat');
const math = require('mathjs');
const algebra = require('algebra.js');
const vm = require('vm');
const jimp = require('jimp');
const fs = require('fs');

math.config({matrix: "Array"});

var initialized = false;
var prefix, Discord, client, command, common;
var myPrefix, helpMessage;

const spikeyId = "124733888177111041";

var smitePerms;

var prevUserSayId = "";
var prevUserSayCnt = 0;

var timers = [];

const introduction = "\nHello! My name is SpikeyBot.\n" +
    "I was created by SpikeyRobot#9836, so if you wish to add any features, feel free to PM him! (Tip: Use **{prefix}pmspikey**)\n" +
    "\nIf you'd like to know what I can do, type **{prefix}help** in a PM to me and I'll let you know!";
const blockedmessage =
    "I couldn't send you a message, you probably blocked me :(";
const addmessage =
    "Want to add me to your server? Click this link:\n(You'll need to be signed into discord in your browser first)";
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
exports.helpMessage = "Loading...";
const helpObject = {
  title:
      "Here's the list of stuff I can do! PM SpikeyRobot ({prefix}pmspikey) feature requests!\n",
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
        "fuckyou/{prefix}ban 'mention' // I will ban the person you mention with a flashy message!",
        "smite 'mention' // Silence the peasant who dare oppose you!"
      ]
    },
  ]
};

const webURL = "https://www.campbellcrowley.com/spikeybot";

// Creates formatted string for mentioning the author of msg.
function mention(msg) {
  return `<@${msg.author.id}>`;
}
// Replies to the author and channel of msg with the given message.
function reply(msg, text, post) {
  post = post || "";
  return msg.channel.send(mention(msg) + "\n```\n" + text + "\n```" + post);
}

exports.begin = function(prefix_, Discord_, client_, command_, common_) {
  prefix = prefix_;
  myPrefix = prefix;
  Discord = Discord_;
  client = client_;
  command = command_;
  common = common_;

  smitePerms = Discord.Permissions.FLAGS.CONNECT |
      Discord.Permissions.FLAGS.VIEW_CHANNEL;

  command.on('addme', commandAddMe);
  command.on('add', commandAdd);
  command.on('simplify', commandSimplify);
  command.on('solve', commandSolve);
  command.on(['eval', 'evaluate'], commandEvaluate);
  command.on('graph', commandGraph);
  command.on('derive', commandDerive);
  command.on('js', commandJS);
  command.on(['timer', 'timers'], commandTimer);
  command.on('say', commandSay);
  command.on('createdate', commandCreateDate);
  command.on('joindate', commandJoinDate, true);
  command.on('pmme', commandPmMe);
  command.on('pmspikey', commandPmSpikey);
  command.on('thotpm', commandThotPm);
  command.on('flip', commandFlip);
  command.on(['purge', 'prune'], commandPurge, true);
  command.on(['fuckyou', 'ban'], commandBan, true);
  command.on('smite', commandSmite, true);
  command.on(['profile', 'avatar'], commandAvatar);
  command.on('ping', commandPing);
  command.on('uptime', commandUptime);
  command.on('game', commandGame);

  fs.readFile('timers.dat', function(err, file) {
    if (err) return;
    var msg = JSON.parse(file);
    setTimer = function(timer) {
      timers.push(timer);
      return function() {
        client.users.fetch(timer.id).then(user => {
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

  // Format help message into rich embed.
  var tmpHelp = new Discord.MessageEmbed();
  tmpHelp.setTitle(helpObject.title.replaceAll("{prefix}", prefix));
  tmpHelp.setURL(webURL);
  helpObject.sections.forEach(function(obj) {
    var titleID = encodeURIComponent(obj.title);
    const titleURL = "[web](" + webURL + "#" + titleID + ")";
    tmpHelp.addField(
        obj.title, titleURL + "```js\n" +
            obj.rows
                .map(function(row) {
                  return prefix + row.replaceAll("{prefix}", prefix);
                })
                .join('\n') +
            "\n```",
        true);
  });
  exports.helpMessage = tmpHelp;

  initialized = true;
  common.LOG("Main Init", "Main");
};

exports.end = function() {
  if (!initialized) return;
  initialized = false;
  command.deleteEvent('addme');
  command.deleteEvent('add');
  command.deleteEvent('simplify');
  command.deleteEvent('solve');
  command.deleteEvent(['eval', 'evaluate']);
  command.deleteEvent('graph');
  command.deleteEvent('derive');
  command.deleteEvent('js');
  command.deleteEvent(['timer', 'timers']);
  command.deleteEvent('say');
  command.deleteEvent('createdate');
  command.deleteEvent('joindate');
  command.deleteEvent('pmme');
  command.deleteEvent('pmspikey');
  command.deleteEvent('thotpm');
  command.deleteEvent('flip');
  command.deleteEvent(['purge', 'prune']);
  command.deleteEvent(['fuckyou', 'ban']);
  command.deleteEvent('smite');
  command.deleteEvent(['profile', 'avatar']);
  command.deleteEvent('ping');
  command.deleteEvent('uptime');
  command.deleteEvent('game');

  fs.writeFileSync('timers.dat', JSON.stringify({timers: timers}));

  delete command;
  delete Discord;
  delete client;
  delete common;
  process.removeListener('exit', exit);
  process.removeListener('SIGINT', sigint);
  process.removeListener('SIGHUP', sigint);
  process.removeListener('SIGTERM', sigint);
};
exports.save = function() {};

function commandAddMe(msg) {
  reply(msg, addmessage, addLink);
}

function commandAdd(msg) {
  const splitstring = msg.content.replace(prefix + 'add ', '')
                        .replaceAll('-', ' -')
                        .replaceAll('  ', ' ')
                        .replaceAll('\\+', ' ')
                        .split(' ');
  if (splitstring.join('').match(/[^0-9\-]/g)) {
    reply(
        msg, "This command only adds and subtracts numbers. Use \"" + prefix +
            "solve\" or \"" + prefix + "simplify\" for more complex math.",
        "The following characters are not allowed: " +
            JSON.stringify(splitstring.join('').match(/[^0-9\-]/g).join('')));
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
}

function commandSimplify(msg) {
  try {
    var formula = msg.content.replace(prefix + 'simplify', '');
    var simplified = simplify(formula);
    var hasVar = simplified.match(/[A-Za-z]/);
    reply(msg, (hasVar ? "0 = " : "") + simplified);
  } catch(err) {
    reply(msg, err.message);
  }
}
function simplify(formula) {
  if (formula.indexOf('=') > -1) {
    var split = formula.split('=');
    formula = split[1] + " - (" + split[0] + ")";
  }
  var simplified = math.simplify(formula).toString();
  return simplified.replace(/ \* ([A-Za-z])/g, "$1");
}

function commandSolve(msg) {
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
}
function commandEvaluate(msg) {
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
}

function commandGraph (msg) {
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
    var embed = new Discord.MessageEmbed();
    embed.setTitle("Graph of " + expression);
    embed.setDescription(
        "Plot Domain: [" + domainMin + ", " + domainMax + "]\nPlot Range: [" +
        minY + ", " + maxY + "]");
    embed.attachFiles([new Discord.MessageAttachment(out, "graph.png")]);
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
}
function commandDerive(msg) {
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
}

function commandJS(msg) {
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
    var embed = new Discord.MessageEmbed();
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
}

function commandTimer(msg) {
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
}

function commandSay(msg) {
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
}
function commandCreateDate(msg) {
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
}
function commandJoinDate(msg) {
  if (msg.mentions.users.size === 0) {
    reply(
        msg,
        "You joined this server on " + dateFormat(msg.member.joinedTimestamp));
  } else {
    reply(
        msg, msg.mentions.users.first().username + " joined this server on " +
            dateFormat(msg.mentions.users.first().joinedTimestamp));
  }
}
function commandPmMe(msg) {
  msg.author.send(introduction.replaceAll("{prefix}", prefix))
      .then(_ => {
        if (msg.guild !== null) reply(msg, "I sent you a message.", ":wink:");
      })
      .catch(_ => { reply(msg, blockedmessage); });
}
function commandPmSpikey(msg) {
  client.users.fetch(spikeyId)
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
}
function commandThotPm(msg) {
  if (msg.author.id == spikeyId || msg.author.id == '265418316120719362' ||
      msg.author.id == '126464376059330562') {
    if (msg.guild !== null) msg.delete();
    if (msg.mentions.users.size === 0) return;
    msg.mentions.users.first().send(msg.content.replace(prefix + 'thotpm', ''));
    client.users.fetch(spikeyId).then(
        user => { user.send(msg.author.tag + ": " + msg.content); });
  }
}
function commandFlip(msg) {
  var rand = Math.round(Math.random());
  var url = "https://www.campbellcrowley.com/heads.png";
  var text = "Heads!";
  if (rand) {
    url = "https://www.campbellcrowley.com/tails.png";
    text = "Tails!";
  }
  var embed = new Discord.MessageEmbed({title: text});
  embed.setImage(url);
  msg.channel.send(embed);
}
function commandPurge(msg) {
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
}
function commandBan(msg) {
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
      msg.guild.members.fetch(client.user).then(me => {
        var myRole = me.highestRole;
        if (Discord.Role.comparePositions(myRole, toBan.highestRole) <= 0) {
          reply(
              msg, "I can't ban " + toBan.user.username +
                  "! I am not strong enough!");
        } else {
          var banMsg = banMsgs[Math.floor(Math.random() * banMsgs.length)];
          toBan.ban({reason: banMsg})
              .then(
                  _ => { reply(msg, banMsg, "Banned " + toBan.user.username); })
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
}
function commandSmite(msg) {
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
      msg.guild.members.fetch(client.user).then(me => {
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
              member.roles.set([role]).then(_ => {
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
            msg.guild.roles
                .create({
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
}
function commandAvatar(msg) {
  var embed = new Discord.MessageEmbed();
  if (msg.mentions.users.size > 0) {
    embed.setDescription(
        msg.mentions.users.first().username + "'s profile picture");
    embed.setImage(msg.mentions.users.first().avatarURL({size: 2048}));
  } else {
    embed.setDescription(msg.author.username + "'s profile picture");
    embed.setImage(msg.author.avatarURL({size: 2048}));
  }
  msg.channel.send(embed);
}

function commandPing(msg) {
  reply(
      msg, "My ping is " + msg.client.ping + "ms",
      "`" + JSON.stringify(msg.client.pings) + "`");
}

function commandUptime(msg) {
  var ut = client.uptime;
  var formattedUptime = Math.floor(ut / 1000 / 60 / 60 / 24) + " Days, " +
      Math.floor(ut / 1000 / 60 / 60) % 24 + " Hours, " +
      Math.floor(ut / 1000 / 60) % 60 + " Minutes, " +
      Math.floor((ut / 1000) % 60) + " Seconds.";
  reply(msg, "I have been running for " + formattedUptime);
}

function commandGame(msg) {
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
}


function exit() {}
function sigint() {}
