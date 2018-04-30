const dateFormat = require('dateformat');
const math = require('mathjs');
const algebra = require('algebra.js');
const vm = require('vm');
const Jimp = require('jimp');
const fs = require('fs');
require('./subModule.js')(Main); // Extends the SubModule class.

math.config({matrix: 'Array'});

/**
 * @classdesc Basic commands and features for the bot.
 * @class
 * @augments SubModule
 */
function Main() {
  const self = this;
  /** @inheritdoc */
  this.myName = 'Main';

  /**
   * SpikeyRobot's Discord ID
   *
   * @private
   * @type {string}
   * @constant
   */
  const spikeyId = '124733888177111041';

  /*
   * Stores the required permissions for smiting a user. Defined at
   * initialize().
   *
   * @private
   * @type {number}
   */
  let smitePerms;

  /**
   * The id of the last user to user the say command.
   *
   * @private
   * @type {string}
   */
  let prevUserSayId = '';
  /**
   * The number of times the say command has been used consecutively by the
   * previous user.
   *
   * @private
   * @type {number}
   */
  let prevUserSayCnt = 0;

  /**
   * Array of all timers currently set.
   *
   * @private
   * @type {Main~Timer[]}
   */
  let timers = [];

  /**
   * The introduction message the bots sends when pmme is used.
   *
   * @private
   * @type {string}
   * @constant
   */
  const introduction = '\nHello! My name is SpikeyBot.\nI was created by ' +
      'SpikeyRobot#9836, so if you wish to add any features, feel free to PM ' +
      'him! (Tip: Use **{prefix}pmspikey**)\n\nIf you\'d like to know what I ' +
      'can do, type **{prefix}help** in a PM to me and I\'ll let you know!';
  /**
   * The message sent to the channel where the user asked to be DM'd, but we
   * were unable to deliver the DM.
   *
   * @private
   * @type {string}
   * @constant
   */
  const blockedmessage =
      'I couldn\'t send you a message, you probably blocked me :(';
  /**
   * The message with instructions of how to add the bot to a server.
   *
   * @private
   * @type {string}
   * @constant
   */
  const addmessage =
      'Want to add me to your server? Click this link:\n(You\'ll need to be ' +
      'signed into discord in your browser first)';
  /**
   * The URL that adds the bot to a new server.
   *
   * @private
   * @type {string}
   * @constant
   */
  const addLink = 'https://discordapp.com/oauth2/authorize?' +
      '&client_id=318552464356016131&scope=bot';
  /**
   * All of the possible messages to show when using the ban command.
   *
   * @private
   * @type {string[]}
   * @constant
   */
  const banMsgs = [
    'It was really nice meeting you!',
    'You\'re a really great person, I\'m sorry I had to do this.',
    'See you soon!',
    'And they were never heard from again...',
    'Poof! Gone like magic!',
    'Does it seem quiet in here? Or is it just me?',
    'And like the trash, they\'re were taken out!',
    'Looks like they made like a tree, and leaf-ed. (sorry)',
    'Oof! Looks like my boot to their behind left a mark!',
    'Between you and me, I didn\'t like them anyways.',
    'Everyone rejoice! The world has been eradicated of one more person that ' +
        'no one liked anyways.',
  ];
  /**
   * The default code to insert at the beginning of the js command.
   *
   * @private
   * @type {string[]}
   * @constant
   */
  const defaultCode =
      '(function(cb){console.log=(function(w){return function(){w.apply(conso' +
      'le,arguments);cb.apply(null,arguments);};})(console.log);})(function(v' +
      '){stdout.push(v);});(function(cb){console.error=(function(w){return fu' +
      'nction(){w.apply(console,arguments);cb.apply(null,arguments);};})(cons' +
      'ole.error);})(function(v){stderr.push(v);});\n';

  /** @inheritdoc */
  this.helpMessage = 'Loading...';

  /**
   * The object that stores all data to be formatted into the help message.
   *
   * @private
   * @constant
   */
  const helpObject = {
    title:
        'Here\'s the list of stuff I can do! PM SpikeyRobot ({prefix}pmspikey' +
        ') feature requests!\n',
    sections: [
      {
        title: 'Music Stuff',
        rows: [
          'play \'url or search\' // Play a song in your current voice ' +
              'channel, or add a song to the queue.',
          'stop // Stop playing music and leave the voice channel.',
          'skip // Skip the currently playing song.',
          'queue // View the songs currently in the queue.',
          'remove \'index\' // Remove a song with the given queue index from ' +
              'the queue.',
          'lyrics \'song\' // Search for song lyrics.',
        ],
      },
      {
        title: 'General Stuff',
        rows: [
          'addme // I will send you a link to add me to your server!',
          'help // Send this message to you.',
          'say // Make me say something.',
          'createdate // I will tell you the date you created your account! ' +
              '(You can mention people)',
          'joindate // I will tell you the date you joined the server you ' +
              'sent the message from! (You can mention people)',
          'pmme // I will introduce myself to you!',
          'pmspikey \'message\' // I will send SpikeyRobot (my creator) your ' +
              'message because you are too shy!',
          'flip // I have an unlimited supply of coins! I will flip one for ' +
              'you!',
          'avatar \'mention\' // Need a better look at your profile pic? ' +
              'I\'ll show you the original.',
          'ping // Want to know what my delay to the server is? I can tell ' +
              'you my ping!',
          'timer \'seconds\' \'message...\' // Set a timer for a certain ' +
              'number of seconds. The bot will DM you the message at the end.' +
              ' No options lists timers.',
        ],
      },
      {
        title: 'Math Stuff',
        rows: [
          'add \'numbers\' // Add positive or negative numbers separated by ' +
              'spaces.',
          'simplify \'equation\' // Simplify an equation with numbers and ' +
              'variables.',
          'solve \'eqution\' // Solve an equation for each variable in the ' +
              'equation.',
          'evaluate \'problem\' // Solve a math problem, and convert units.',
          'derive \'equation with x\' // Find dy/dx of an equation.',
          'graph \'equation with x\' \'[xMin, xMax]\' \'[yMin, yMax]\' // ' +
              'Graph an equation, Maxes and mins are all optional, but ' +
              'brackets are required.',
        ],
      },
      {
        title: 'Admin Stuff',
        rows: [
          'purge \'number\' // Remove a number of messages from the current ' +
              'text channel!',
          'fuckyou/{prefix}ban \'mention\' // I will ban the person you ' +
              'mention with a flashy message!',
          'smite \'mention\' // Silence the peasant who dare oppose you!',
        ],
      },
    ],
  };

  /**
   * The website base URL for pointing to for more help and documentation.
   *
   * @private
   * @type {string}
   * @constant
   */
  const webURL = 'https://www.campbellcrowley.com/spikeybot';

  /**
   * Creates formatted string for mentioning the author of msg.
   *
   * @private
   * @param {Discord~Message} msg Message to format a mention for the author of.
   * @return {string} Formatted mention string.
   */
  function mention(msg) {
    return `<@${msg.author.id}>`;
  }
  /**
   * Replies to the author and channel of msg with the given message.
   *
   * @private
   * @param {Discord~Message} msg Message to reply to.
   * @param {string} text The main body of the message.
   * @param {string} post The footer of the message.
   * @return {Promise} Promise of Discord~Message that we attempted to send.
   */
  function reply(msg, text, post) {
    post = post || '';
    return msg.channel.send(mention(msg) + '\n```\n' + text + '\n```' + post);
  }

  /** @inheritdoc */
  this.initialize = function() {
    smitePerms = self.Discord.Permissions.FLAGS.CONNECT |
        self.Discord.Permissions.FLAGS.VIEW_CHANNEL;

    self.command.on('addme', commandAddMe);
    self.command.on('add', commandAdd);
    self.command.on('simplify', commandSimplify);
    self.command.on('solve', commandSolve);
    self.command.on(['eval', 'evaluate'], commandEvaluate);
    self.command.on('graph', commandGraph);
    self.command.on('derive', commandDerive);
    self.command.on('js', commandJS);
    self.command.on(['timer', 'timers'], commandTimer);
    self.command.on('say', commandSay);
    self.command.on('createdate', commandCreateDate);
    self.command.on('joindate', commandJoinDate, true);
    self.command.on('pmme', commandPmMe);
    self.command.on('pmspikey', commandPmSpikey);
    self.command.on('thotpm', commandThotPm);
    self.command.on('flip', commandFlip);
    self.command.on(['purge', 'prune'], commandPurge, true);
    self.command.on(['fuckyou', 'ban'], commandBan, true);
    self.command.on('smite', commandSmite, true);
    self.command.on(['profile', 'avatar'], commandAvatar);
    self.command.on('ping', commandPing);
    self.command.on('uptime', commandUptime);
    self.command.on('game', commandGame);
    self.command.on('version', commandVersion);

    fs.readFile('./save/timers.dat', function(err, file) {
      if (err) return;
      let msg = JSON.parse(file);

      for (let i in msg.timers) {
        if (msg.timers[i] instanceof Object && msg.timers[i].time) {
          setTimer(msg.timers[i]);
        }
      }
    });

    // Format help message into rich embed.
    let tmpHelp = new self.Discord.MessageEmbed();
    tmpHelp.setTitle(helpObject.title.replaceAll('{prefix}', self.myPrefix));
    tmpHelp.setURL(webURL);
    helpObject.sections.forEach(function(obj) {
      let titleID = encodeURIComponent(obj.title);
      const titleURL = '[web](' + webURL + '#' + titleID + ')';
      tmpHelp.addField(
          obj.title, titleURL + '```js\n' +
              obj.rows
                  .map(function(row) {
                    return self.myPrefix +
                        row.replaceAll('{prefix}', self.myPrefix);
                  })
                  .join('\n') +
              '\n```',
          true);
    });
    self.helpMessage = tmpHelp;
  };

  /** @inheritdoc */
  this.shutdown = function() {
    self.command.deleteEvent('addme');
    self.command.deleteEvent('add');
    self.command.deleteEvent('simplify');
    self.command.deleteEvent('solve');
    self.command.deleteEvent(['eval', 'evaluate']);
    self.command.deleteEvent('graph');
    self.command.deleteEvent('derive');
    self.command.deleteEvent('js');
    self.command.deleteEvent(['timer', 'timers']);
    self.command.deleteEvent('say');
    self.command.deleteEvent('createdate');
    self.command.deleteEvent('joindate');
    self.command.deleteEvent('pmme');
    self.command.deleteEvent('pmspikey');
    self.command.deleteEvent('thotpm');
    self.command.deleteEvent('flip');
    self.command.deleteEvent(['purge', 'prune']);
    self.command.deleteEvent(['fuckyou', 'ban']);
    self.command.deleteEvent('smite');
    self.command.deleteEvent(['profile', 'avatar']);
    self.command.deleteEvent('ping');
    self.command.deleteEvent('uptime');
    self.command.deleteEvent('game');
    self.command.deleteEvent('version');

    fs.writeFileSync('./save/timers.dat', JSON.stringify({timers: timers}));
  };

  /**
   * Replies to message with URL for inviting the bot to a guild.
   *
   * @private
   * @type {commandHandler}
   * @param {Discord~Message} msg Message that triggered command.
   */
  function commandAddMe(msg) {
    reply(msg, addmessage, addLink);
  }

  /**
   * Parses message and adds given numbers.
   *
   * @private
   * @type {commandHandler}
   * @param {Discord~Message} msg Message that triggered command.
   */
  function commandAdd(msg) {
    const splitstring = msg.content.replace(self.myPrefix + 'add ', '')
                            .replaceAll('-', ' -')
                            .replaceAll('  ', ' ')
                            .replaceAll('\\+', ' ')
                            .split(' ');
    if (splitstring.join('').match(/[^0-9\-]/g)) {
      reply(
          msg, 'This command only adds and subtracts numbers. Use "' +
              self.myPrefix + 'solve" or "' + self.myPrefix +
              'simplify" for more complex math.',
          'The following characters are not allowed: ' +
              JSON.stringify(splitstring.join('').match(/[^0-9\-]/g).join('')));
      return;
    }
    let number = 0;
    let numNonNumber = 0;
    for (let i in splitstring) {
      if (typeof(splitstring[i] * 1) !== 'number') {
        numNonNumber++;
      } else {
        number += splitstring[i] * 1;
      }
    }
    let ending = '';
    let anotherEnding = '';
    if (numNonNumber > 0) {
      ending = 'But you entered the numbers oddly, so I am not sure if I ' +
          'understood you properly.';
    }
    if (number == 69) {
      anotherEnding = ':wink:';
    } else if (number == 420) {
      anotherEnding = ':four_leaf_clover:';
    } else if (number == 666) {
      anotherEnding = ':smiling_imp:';
    } else if (number == 9001) {
      anotherEnding = ':fire:';
    } else if (number == 80085 || number == 58008) {
      anotherEnding = ':ok_hand:';
    }
    reply(msg, number + '\n' + ending, anotherEnding);
  }

  /**
   * Simplifies equation given in message.
   *
   * @private
   * @type {commandHandler}
   * @param {Discord~Message} msg Message that triggered command.
   */
  function commandSimplify(msg) {
    try {
      let formula = msg.content.replace(self.myPrefix + 'simplify', '');
      let simplified = simplify(formula);
      let hasVar = simplified.match(/[A-Za-z]/);
      reply(msg, (hasVar ? '0 = ' : '') + simplified);
    } catch (err) {
      reply(msg, err.message);
    }
  }
  /**
   * Simplifies given formula.
   *
   * @private
   * @param {string} formula The formula to attempt to simplify.
   * @return {string} Simplified formula.
   */
  function simplify(formula) {
    if (formula.indexOf('=') > -1) {
      let split = formula.split('=');
      formula = split[1] + ' - (' + split[0] + ')';
    }
    let simplified = math.simplify(formula).toString();
    return simplified.replace(/ \* ([A-Za-z])/g, '$1');
  }

  /**
   * Solve an equation.
   *
   * @private
   * @type {commandHandler}
   * @param {Discord~Message} msg Message that triggered command.
   */
  function commandSolve(msg) {
    if (msg.content.lastIndexOf('=') != msg.content.indexOf('=')) {
      reply(msg, 'Please ensure your equation has exactly 1 equals sign.');
      return;
    }
    const equation = msg.content.replace(self.myPrefix + 'solve', '');
    const variables = equation.match(/[A-Za-z]+/gm);
    if (!variables || variables.length < 1) {
      reply(
          msg, 'Please ensure you have at least one variable in the equation.');
      return;
    }
    let error = '';
    let messages = [];
    for (let i = 0; i < variables.length; i++) {
      try {
        messages.push(
            algebra.parse(equation).solveFor(variables[i]).toString());
      } catch (err) {
        error += 'For ' + variables[i] + ': ' + err.message + '\n';
      }
    }
    const outMessage = messages
                           .map(function(obj, i) {
                             return variables[i] + ' = ' + obj;
                           })
                           .join('\n');
    reply(msg, outMessage || 'Oops, somthing didn\'t work!', error);
  }
  /**
   * Evaluate a string as an equation with units.
   *
   * @private
   * @type {commandHandler}
   * @param {Discord~Message} msg Message that triggered command.
   */
  function commandEvaluate(msg) {
    try {
      let formula = msg.content.replace(self.myPrefix + 'eval', '')
                        .replace(self.myPrefix + 'evaluate', '');
      if (formula.indexOf('=') > -1) {
        let split = formula.split('=');
        formula = split[1] + ' - (' + split[0] + ')';
      }
      let simplified = math.eval(formula).toString();
      simplified = simplified.replace(/ \* ([A-Za-z])/g, '$1');
      reply(msg, simplified);
    } catch (err) {
      reply(msg, err.message);
    }
  }

  /**
   * Graph a given equation by plugging in values for X and creating an image
   * based off values.
   *
   * @private
   * @type {commandHandler}
   * @param {Discord~Message} msg Message that triggered command.
   */
  function commandGraph(msg) {
    const graphSize = 200;
    const dotSize = 2;
    let xVal;
    let yVal;
    let ypVal;
    let domainMin;
    let domainMax;
    let rangeMin;
    let rangeMax;
    let cmd = msg.content.replace(self.myPrefix + 'graph', '');
    let expression = cmd.replace(/\[.*\]|\n/gm, '');
    try {
      let expr = math.compile(expression);
      let domainTemp = cmd.match(/\[([^,]*),([^\]]*)\]/m);
      let rangeTemp = cmd.match(/\[[^\]]*\][^\[]*\[([^,]*),([^\]]*)\]/m);
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
      yVal = xVal.map(function(x) {
        return expr.eval({x: x});
      });
      try {
        let formula = expression;
        if (formula.indexOf('=') > -1) {
          let split = formula.split('=');
          formula = split[1] + ' - (' + split[0] + ')';
        }
        let exprSlope = math.derivative(formula, 'x');
        ypVal = xVal.map(function(x) {
          return exprSlope.eval({x: x});
        });
      } catch (err) {
        console.log(err);
        msg.channel.send('Failed to derive given equation. ' + err.message);
        ypVal = xVal.map(function(x) {
          return 1;
        });
      }
    } catch (err) {
      reply(msg, err.message);
      return;
    }
    let finalImage = new Jimp(graphSize, graphSize, 0xFFFFFFFF);
    let minY = 0;
    let maxY = 0;
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
    let zeroY = Math.round(-minY / (maxY - minY) * graphSize);
    let zeroX = Math.round(-domainMin / (domainMax - domainMin) * graphSize);
    finalImage.blit(new Jimp(dotSize, graphSize, 0xDDDDDDFF), zeroX, 0);
    finalImage.blit(
        new Jimp(graphSize, dotSize, 0xDDDDDDFF), 0, graphSize - zeroY);

    let lastSlope;
    let turningPoints = [];
    for (let i = 0; i < xVal.length; i++) {
      const y =
          graphSize - Math.round((yVal[i] - minY) / (maxY - minY) * graphSize);
      if (y >= graphSize || y < 0) continue;
      let myColor = 0x000000FF;
      mySize = dotSize;
      if ((lastSlope < 0 && ypVal[i] >= 0) ||
          (lastSlope > 0 && ypVal[i] <= 0)) {
        myColor = 0xFF0000FF;
        turningPoints.push({x: xVal[i], y: yVal[i]});
        mySize = dotSize * 2;
      }
      lastSlope = ypVal[i];
      finalImage.blit(
          new Jimp(mySize, mySize, myColor), i / xVal.length * graphSize, y);
    }
    let expMatch = expression.match(/^\s?[yY]\s*=(.*)/);
    if (!expMatch) {
      expression = 'y = ' + simplify(expression);
    } else {
      expression = 'y = ' + simplify(expMatch[1]);
    }
    finalImage.getBuffer(Jimp.MIME_PNG, function(err, out) {
      let embed = new self.Discord.MessageEmbed();
      embed.setTitle('Graph of ' + expression);
      embed.setDescription(
          'Plot Domain: [' + domainMin + ', ' + domainMax + ']\nPlot Range: [' +
          minY + ', ' + maxY + ']');
      embed.attachFiles([new self.Discord.MessageAttachment(out, 'graph.png')]);
      embed.setColor([255, 255, 255]);
      if (turningPoints.length > 0) {
        embed.addField(
            'Approximate Turning Points',
            turningPoints
                .map(function(obj) {
                  return '(' + obj.x + ', ' + obj.y + ')';
                })
                .join('\n'),
            false);
      }
      msg.channel.send(embed);
    });
  }
  /**
   * Take the derivative of a given equation in terms of dy/dx.
   *
   * @private
   * @type {commandHandler}
   * @param {Discord~Message} msg Message that triggered command.
   */
  function commandDerive(msg) {
    try {
      let formula = msg.content.replace(self.myPrefix + 'derive', '');
      if (formula.indexOf('=') > -1) {
        let split = formula.split('=');
        formula = split[1] + ' - (' + split[0] + ')';
      }
      let simplified = math.derivative(formula, 'x').toString();
      simplified = simplified.replace(/ \* ([A-Za-z])/g, '$1');
      reply(msg, simplified);
    } catch (err) {
      reply(msg, err.message);
    }
  }

  /**
   * Run javascript code in VM, then show user outcome.
   *
   * @private
   * @type {commandHandler}
   * @param {Discord~Message} msg Message that triggered command.
   */
  function commandJS(msg) {
    try {
      let sandbox = {__stdout: [], __stderr: []};

      let code = defaultCode + msg.content.replace(self.myPrefix + 'js', '');
      let stdexit = vm.runInNewContext(
          code, sandbox, {filename: 'Line', timeout: '100', lineOffset: -1});
      let stdout = sandbox.__stdout;
      let stderr = sandbox.__stderr;
      delete sandbox.__stdout;
      delete sandbox.__stderr;
      let embed = new self.Discord.MessageEmbed();
      embed.setColor([0, 255, 255]);
      if (stdout.length > 0) {
        embed.addField(
            'console.log', JSON.stringify(stdout, null, 2).substr(0, 1000),
            true);
      }
      if (stderr.length > 0) {
        embed.addField(
            'console.error', JSON.stringify(stderr, null, 2).substr(0, 1000),
            true);
      }
      if (Object.keys(sandbox).length !== 0) {
        embed.addField(
            'Global Variables', JSON.stringify(sandbox, null, 2)
                                    .replace(/^(?:{)+|^(?:})|^(?:  )/gm, ''),
            true);
      }
      if (stdexit) {
        embed.addField(
            'Returned Value', JSON.stringify(stdexit, null, 2).substr(0, 1000),
            true);
      }
      msg.channel.send(mention(msg), embed);
    } catch (err) {
      if (err.message == 'Script execution timed out.') {
        reply(
            msg, 'Oops! Your script was running for too long.',
            '(100 milliseconds is the longest a script may run.)');
      } else {
        reply(msg, err.stack.split('\n').splice(0, 6).join('\n'));
      }
    }
  }

  /**
   * Set a timer for a certain about of time. After which, the bot will DM the
   * user the message they specified.
   *
   * @private
   * @type {commandHandler}
   * @param {Discord~Message} msg Message that triggered command.
   */
  function commandTimer(msg) {
    let split = msg.content.replace(self.myPrefix + 'timer ', '').split(' ');
    if (split[0] == self.myPrefix + 'timer' ||
        split[0] == self.myPrefix + 'timers') {
      let num = 0;
      let messages =
          timers
              .filter(function(obj) {
                return obj.id == msg.author.id;
              })
              .map(function(obj) {
                num++;
                return 'In ' +
                    Math.floor((obj.time - Date.now()) / 1000 / 60 * 10) / 10 +
                    ' minutes: ' + obj.message;
              });
      reply(msg, 'You have ' + num + ' timers set.\n' + messages.join('\n'));
      return;
    }
    let time = split.splice(0, 1);
    let origMessage = split.join(' ');
    let message = origMessage ||
        'Your timer for ' + time + ' minute' + (time == '1' ? '' : 's') +
            ' is over!';

    if (time > 0) {
      setTimer({
        id: msg.author.id,
        message: message,
        time: Date.now() + time * 1000 * 60,
      });

      reply(msg, 'Set timer for ' + time + ' minutes.', origMessage);
    } else {
      reply(msg, 'Oops! Please make sure your time is larger than 0.');
    }
  }

  /**
   * The user's message will be deleted and the bot will send an identical
   * message
   * without the command to make it seem like the bot sent the message.
   *
   * @private
   * @type {commandHandler}
   * @param {Discord~Message} msg Message that triggered command.
   */
  function commandSay(msg) {
    msg.delete();
    let content = msg.content.replace(self.myPrefix + 'say', '');
    if (content.indexOf(' ') === 0) content.replace(' ', '');
    msg.channel.send(content);
    if (prevUserSayId != msg.author.id) {
      prevUserSayId = msg.author.id;
      prevUserSayCnt = 0;
    }
    prevUserSayCnt++;
    if (prevUserSayCnt % 3 === 0) {
      msg.channel.send(
          'Help! ' + mention(msg) + ' is putting words into my mouth!');
    }
  }
  /**
   * Tell the user the date when they created their Discord account.
   *
   * @private
   * @type {commandHandler}
   * @param {Discord~Message} msg Message that triggered command.
   */
  function commandCreateDate(msg) {
    if (msg.mentions.users.size === 0) {
      reply(
          msg, 'You created your discord account on ' +
              dateFormat(msg.author.createdTimestamp));
    } else {
      reply(
          msg, msg.mentions.users.first().username +
              ' created their discord account on ' +
              dateFormat(msg.mentions.users.first().createdTimestamp));
    }
  }
  /**
   * Tell the user the date when they joined the server the message was sent
   * from.
   *
   * @private
   * @type {commandHandler}
   * @param {Discord~Message} msg Message that triggered command.
   */
  function commandJoinDate(msg) {
    if (msg.mentions.users.size === 0) {
      reply(
          msg, 'You joined this server on ' +
              dateFormat(msg.member.joinedTimestamp));
    } else {
      reply(
          msg, msg.mentions.users.first().username + ' joined this server on ' +
              dateFormat(msg.mentions.users.first().joinedTimestamp));
    }
  }
  /**
   * Send the user a PM with a greeting introducing who the bot is.
   *
   * @private
   * @type {commandHandler}
   * @param {Discord~Message} msg Message that triggered command.
   */
  function commandPmMe(msg) {
    msg.author.send(introduction.replaceAll('{prefix}', self.myPrefix))
        .then(() => {
          if (msg.guild !== null) reply(msg, 'I sent you a message.', ':wink:');
        })
        .catch(() => {
          reply(msg, blockedmessage);
        });
  }
  /**
   * Send a PM to SpikeyRobot with a message.
   *
   * @private
   * @type {commandHandler}
   * @param {Discord~Message} msg Message that triggered command.
   */
  function commandPmSpikey(msg) {
    self.client.users.fetch(spikeyId)
        .then((user) => {
          user.send(msg.author.tag + ': ' + msg.content).then(() => {
            reply(msg, 'I sent your message to SpikeyRobot.');
          });
        })
        .catch((err) => {
          console.log(err);
          reply(
              msg,
              'Something went wrong and I couldn\'t send your message. Sorry ' +
                  'that\'s all I know :(');
        });
  }
  /**
   * Send a PM to a mentioned user semi-anonymously. Messages are copied to
   * SpikeyRobot to monitor for abuse. This command only works for 3 people.
   *
   * @private
   * @type {commandHandler}
   * @param {Discord~Message} msg Message that triggered command.
   */
  function commandThotPm(msg) {
    if (msg.author.id == spikeyId || msg.author.id == '265418316120719362' ||
        msg.author.id == '126464376059330562') {
      if (msg.guild !== null) msg.delete();
      if (msg.mentions.users.size === 0) return;
      msg.mentions.users.first().send(
          msg.content.replace(self.myPrefix + 'thotpm', ''));
      self.client.users.fetch(spikeyId).then((user) => {
        user.send(msg.author.tag + ': ' + msg.content);
      });
    }
  }
  /**
   * Send an image of a coin, either Heads or Tails.
   *
   * @private
   * @type {commandHandler}
   * @param {Discord~Message} msg Message that triggered command.
   */
  function commandFlip(msg) {
    let rand = Math.round(Math.random());
    let url = 'https://www.campbellcrowley.com/heads.png';
    let text = 'Heads!';
    if (rand) {
      url = 'https://www.campbellcrowley.com/tails.png';
      text = 'Tails!';
    }
    let embed = new self.Discord.MessageEmbed({title: text});
    embed.setImage(url);
    msg.channel.send(embed);
  }
  /**
   * Delete a given number of messages from a text channel.
   *
   * @private
   * @type {commandHandler}
   * @param {Discord~Message} msg Message that triggered command.
   */
  function commandPurge(msg) {
    if (msg.channel.permissionsFor(msg.member)
            .has(self.Discord.Permissions.FLAGS.MANAGE_MESSAGES)) {
      let numString = msg.content.replace(self.myPrefix + 'purge ', '')
                          .replace(self.myPrefix + 'prune ', '')
                          .replace(/\<[^\>]*>|\s/g, '');
      let num = (numString * 1) + 1;
      if (numString.length === 0 || isNaN(num)) {
        reply(
            msg,
            'You must specify the number of messages to purge. (ex: ?purge 5)');
      } else {
        if (msg.mentions.users.size > 0) {
          let toDelete = msg.channel.messages.filter(function(obj) {
            return msg.mentions.users.find(function(mention) {
              return obj.author.id === mention.id;
            });
          });
          msg.channel.bulkDelete(toDelete.first(num - 1));
          reply(
              msg, 'Deleted ' + (num - 1) + ' messages by ' +
                  msg.mentions.users
                      .map(function(obj) {
                        return obj.username;
                      })
                      .join(', '))
              .then((msg_) => {
                msg_.delete({timeout: 5000});
              });
        } else {
          msg.channel.bulkDelete(num);
        }
      }
    } else {
      reply(
          msg,
          'I\'m sorry, but you don\'t have permission to delete messages in ' +
              'this channel.');
    }
  }
  /**
   * Ban a mentioed user and send a message saying they were banned.
   *
   * @private
   * @type {commandHandler}
   * @param {Discord~Message} msg Message that triggered command.
   */
  function commandBan(msg) {
    if (!msg.member.hasPermission(
            self.Discord.Permissions.FLAGS.BAN_MEMBERS, true, true, true)) {
      reply(
          msg, 'You don\'t have permission for that!\n(Filthy ' +
              msg.member.roles.highest.name + ')');
    } else if (msg.mentions.members.size === 0) {
      reply(msg, 'You must mention someone to ban after the command.');
    } else {
      msg.mentions.members.forEach(function(toBan) {
        if (msg.guild.ownerID !== msg.author.id &&
            msg.member.roles.highest.comparePositionTo(toBan.roles.highest) <=
                0) {
          reply(
              msg, 'You can\'t ban ' + toBan.user.username +
                  '! You are not stronger than them!');
        } else {
          msg.guild.members.fetch(self.client.user).then((me) => {
            let myRole = me.roles.highest;
            if (toBan.roles.highest &&
                myRole.comparePositionTo(toBan.roles.highest) <= 0) {
              reply(
                  msg, 'I can\'t ban ' + toBan.user.username +
                      '! I am not strong enough!');
            } else {
              let banMsg = banMsgs[Math.floor(Math.random() * banMsgs.length)];
              toBan.ban({reason: banMsg})
                  .then(() => {
                    reply(msg, banMsg, 'Banned ' + toBan.user.username);
                  })
                  .catch((err) => {
                    reply(
                        msg, 'Oops! I wasn\'t able to ban ' +
                            toBan.user.username +
                            '! I\'m not sure why though!');
                    common.error('Failed to ban user.');
                    console.log(err);
                  });
            }
          });
        }
      });
    }
  }
  /**
   * Remove all roles from a user and give them a role that prevents them from
   * doing anything. Checks if all parties involved have permission to do this
   * without the bot's help.
   *
   * @private
   * @type {commandHandler}
   * @param {Discord~Message} msg Message that triggered command.
   */
  function commandSmite(msg) {
    if (msg.mentions.members.size === 0) {
      reply(msg, 'You must mention someone to ban after the command.');
    } else {
      let toSmite = msg.mentions.members.first();
      if (msg.guild.ownerID !== msg.author.id &&
          msg.member.roles.highest.comparePositionTo(toSmite.roles.highest) <=
              0) {
        reply(
            msg, 'You can\'t smite ' + toSmite.user.username +
                '! You are not stronger than them!');
      } else {
        msg.guild.members.fetch(self.client.user).then((me) => {
          let myRole = me.roles.highest;
          if (toSmite.roles.highest &&
              self.Discord.Role.comparePositions(
                  myRole, toSmite.roles.highest) <= 0) {
            reply(
                msg, 'I can\'t smite ' + toSmite.user.username +
                    '! I am not strong enough!');
          } else {
            let hasSmiteRole = false;
            let smiteRole;
            msg.guild.roles.forEach(function(val, key) {
              if (val.name == 'Smited') {
                hasSmiteRole = true;
                smiteRole = val;
              }
            });
            smite = function(role, member) {
              try {
                member.roles.set([role]).then(() => {
                  reply(
                      msg, 'The gods have struck ' + member.user.username +
                          ' with lightning!');
                });
              } catch (err) {
                reply(
                    msg, 'Oops! I wasn\'t able to smite ' +
                        member.user.username + '! I\'m not sure why though!');
              }
            };
            if (!hasSmiteRole) {
              msg.guild.roles
                  .create({
                    name: 'Smited',
                    position: 0,
                    hoist: true,
                    color: '#2f3136',
                    permissions: smitePerms,
                    mentionable: true,
                  })
                  .then((role) => {
                    smite(role, toSmite);
                  })
                  .catch(() => {
                    reply(
                        msg, 'I couldn\'t smite ' + toSmite.user.username +
                            ' because there isn\'t a "Smited" role and I ' +
                            'couldn\'t make it!');
                  });
            } else {
              smite(smiteRole, toSmite);
            }
          }
        });
      }
    }
  }
  /**
   * Send a larger resolution version of the mentioned user's avatar.
   *
   * @private
   * @type {commandHandler}
   * @param {Discord~Message} msg Message that triggered command.
   */
  function commandAvatar(msg) {
    let embed = new self.Discord.MessageEmbed();
    if (msg.mentions.users.size > 0) {
      embed.setDescription(
          msg.mentions.users.first().username + '\'s profile picture');
      embed.setImage(msg.mentions.users.first().avatarURL({size: 2048}));
    } else {
      embed.setDescription(msg.author.username + '\'s profile picture');
      embed.setImage(msg.author.avatarURL({size: 2048}));
    }
    msg.channel.send(embed);
  }

  /**
   * Reply to user with my ping to the Discord servers.
   *
   * @private
   * @type {commandHandler}
   * @param {Discord~Message} msg Message that triggered command.
   */
  function commandPing(msg) {
    reply(
        msg, 'My ping is ' + msg.client.ping + 'ms',
        '`' + JSON.stringify(msg.client.pings) + '`');
  }

  /**
   * Reply to message with the amount of time since the bot has been running.
   *
   * @private
   * @type {commandHandler}
   * @param {Discord~Message} msg Message that triggered command.
   */
  function commandUptime(msg) {
    let ut = self.client.uptime;
    let formattedUptime = Math.floor(ut / 1000 / 60 / 60 / 24) + ' Days, ' +
        Math.floor(ut / 1000 / 60 / 60) % 24 + ' Hours, ' +
        Math.floor(ut / 1000 / 60) % 60 + ' Minutes, ' +
        Math.floor((ut / 1000) % 60) + ' Seconds.';
    reply(msg, 'I have been running for ' + formattedUptime);
  }

  /**
   * Reply to message saying what game the mentioned user is playing and
   * possibly
   * other information about their profile.
   *
   * @private
   * @type {commandHandler}
   * @param {Discord~Message} msg Message that triggered command.
   */
  function commandGame(msg) {
    let user = msg.author;
    if (msg.mentions.users.size !== 0) {
      user = msg.mentions.users.first();
    }
    if (user.presence.game) {
      reply(
          msg, user.username + ': ' + user.presence.status,
          user.presence.game.type + ': ' + user.presence.game.name + '(' +
              user.presence.game.url + ')');
    } else {
      reply(
          msg, user.username + ': ' + user.presence.status, user.presence.game);
    }
  }

  /**
   * Read the current version from package.json and show it to the user.
   *
   * @private
   * @type {commandHandler}
   * @param {Discord~Message} msg Message that triggered command.
   */
  function commandVersion(msg) {
    fs.readFile('package.json', function(err, data) {
      reply(msg, 'My current version is ' + JSON.parse(data).version);
    });
  }

  /**
   * An object storing information about a timer.
   *
   * @typedef {Object} Main~Timer
   * @property {string} id The id of the user who set the timer.
   * @property {string} message The message for when the timer ends.
   * @property {number} time The time since epoch at which the timer will end.
   */

  /**
   * Sets a timer for an amount of time with a message.
   *
   * @private
   * @param {Main~Timer} timer The settings for the timer.
   */
  function setTimer(timer) {
    timers.push(timer);
    const now = Date.now();
    self.client.setTimeout(function() {
      self.client.users.fetch(timer.id).then((user) => {
        user.send(timer.message);
        const now = Date.now();
        timers = timers.filter(function(obj) {
          return obj.time > now;
        });
      });
    }, msg.timers[i].time - now);
  }
}
module.exports = new Main();
