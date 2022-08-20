const expect = require('chai').expect;
const Discord = require('discord.js');
let spawn = require('child_process').spawn;
const fs = require('fs');
const auth = require('../auth.js');

const intents = [
  Discord.IntentsBitField.Flags.Guilds,
  Discord.IntentsBitField.Flags.GuildMembers,
  Discord.IntentsBitField.Flags.GuildEmojisAndStickers,
  Discord.IntentsBitField.Flags.GuildWebhooks,
  Discord.IntentsBitField.Flags.GuildVoiceStates,
  Discord.IntentsBitField.Flags.GuildPresences,
  Discord.IntentsBitField.Flags.GuildMessages,
  Discord.IntentsBitField.Flags.GuildMessageReactions,
  Discord.IntentsBitField.Flags.DirectMessages,
  Discord.IntentsBitField.Flags.DirectMessageReactions,
  Discord.IntentsBitField.Flags.MessageContent,
];
const client = new Discord.Client({intents: intents});

/* eslint-disable */
var oldSpawn = spawn;
function mySpawn() {
  console.log('spawn called');
  console.log(arguments);
  var result = oldSpawn.apply(this, arguments);
  return result;
}
spawn = mySpawn;
/* eslint */

let spawnOpts = {cwd: __dirname + '/..', stdio: 'pipe'};
let log = fs.createWriteStream(__dirname + '/output.log');
console.log(__dirname, '<-- Dir | CWD -->', process.cwd());
let node = __dirname.startsWith('/home/travis/build') ? 'node' : 'nodejs';
let bot = spawn(
    node,
    [
      '--experimental-worker',
      'src/SpikeyBot.js',
      '--dev',
      '--botname=test',
      '--test',
    ],
    spawnOpts);
console.log("Spawned primary bot");
bot.stdout.pipe(log);
bot.stderr.pipe(log);
console.log("Piping to log");

after(function() {
  console.log("SHUTDOWN");
  bot.kill('SIGHUP');
  client.destroy();
  setTimeout(function() {
    console.log("EXIT");
    process.exit(0);
  }, 1000);
});

/**
 * An object to store information about a single test case.
 *
 * @param {string} title_ The title of the test case.
 * @param {string} cmd_ The command to send from/to the bot.
 * @param {string[]} res_ An array of responses that are expected. All
 * responses
 * are expected, and in the same order.
 */
function Test(title_, cmd_, res_) {
  this.title = title_;
  this.command = cmd_;
  this.responses = res_;
}
const mainTests = [
  new Test('Say command', '~say Hello World!', ['Hello World!']),
  new Test(
      'Add command', '~add 5 6 7', ['<@422623712534200321>\n```\n18\n\n```']),
  new Test(
      'Simplify command', '~simplify 5x=7y',
      ['<@422623712534200321>\n```\n0 = 7 y - 5 * x\n```']),
  new Test(
      'Solve command', '~solve 5x=7y',
      ['<@422623712534200321>\n```\nx = 7/5y\ny = 5/7x\n```']),
  new Test(
      'Evaluate command', '~eval 1km in meters',
      ['<@422623712534200321>\n```\n1000 meters\n```']),
  new Test(
      'Derive command', '~derive y=5x', ['<@422623712534200321>\n```\n5\n```']),
  new Test(
      'Add Me command', '~addme',
      ['<@422623712534200321>\n```\nWant me on your server or want to join ' +
       'my server?\nMy website has the links for you: ' +
       '<https://www.spikeybot.com>.\n```']),
  new Test(
      'Help command', '~help',
      [
        '<@422623712534200321>\n```\nI sent you a DM with commands!\n```Tip: ' +
            'https://www.spikeybot.com/help/ also has more information.',
        '<@422623712534200321>\n```\nOops! I wasn\'t able to send you the ' +
            'help!\nDid you block me?\n```Cannot send messages to this user',
      ]),
  new Test('Create Date command', '~createdate', ['#embed']),
  new Test('Join Date command', '~joindate', ['#embed']),
  new Test(
      'PM Me command', '~pmme',
      ['<@422623712534200321>\n```\nI couldn\'t send you a message, you ' +
       'probably blocked me :(\n```']),
  new Test(
      'PM Spikey command', '~pmspikey I am running a unit test.',
      ['^<@422623712534200321>\n```\nI sent your message to SpikeyRobot.\n```']),
  new Test('Flip command', '~flip', ['#embed']),
  new Test('Avatar command', '~avatar', ['#embed']),
  new Test('Ping command', '~ping', ['^My current ping']),
  new Test('Tic Tac Toe command', '~tictactoe', ['`Loading TicTacToe...`']),
  new Test('Connect 4 command', '~connect4', ['`Loading Connect 4...`']),
  new Test('List command settings', '~show', ['#embed']),
  new Test('Reset command settings', '~reset', ['#noerr', '#noerr']),
  new Test('Git command', '~git', ['^```']),
  new Test('Who am I', '~whoami', ['#embed']),
  new Test('What time is it', '~gettime', ['#noerr']),
  new Test('Color command hex', '~color #0F8D1C', ['#noerr']),
  new Test('Color command rgb', '~color 255 0 255', ['#noerr']),
  new Test('Color command name', '~color default', ['#noerr']),
];
const hgTests = [
  new Test('Reset All command', '~hg reset all', ['#noerr']),
  new Test(
      'Create command', '~hg create',
      ['<@422623712534200321>\n```\nCreated a Hungry Games with default ' +
       'settings and all members included.\n```']),
  new Test('Create command again', '~hg create', ['#noerr']),
  new Test('Start command', '~hg start', ['#noerr']),
  new Test('Start command again', '~hg start', ['#noerr']),
  new Test(
      'End command', '~hg end',
      ['<@422623712534200321>\n```\nThe game has ended!\n```']),
  new Test('End command again', '~hg end', ['#noerr']),
  new Test('Option command', '~hg options', ['#embed']),
  new Test(
      'Change option object number', '~hg options playerOutcomeProbs kill 100',
      ['<@422623712534200321>\n```\nSet kill to 100 from 22\n```']),
  new Test(
      'Change option boolean', '~hg options arenaEvents false',
      ['<@422623712534200321>\n```\nSet arenaEvents to false from true\n```']),
  new Test(
      'Change option number', '~hg options teamSize 10',
      [
        '<@422623712534200321>\n```\nSet teamSize to 10 from 0\nTo reset ' +
            'teams to the correct size, type "~hg teams reset".\nThis will ' +
            'delete all teams, and create new ones.\n```',
      ]),
  new Test(
      'Include player nomention', '~hg include SpikeyRobot',
      ['^<@422623712534200321>\n```\nSpikeyRobot ']),
  new Test(
      'Exclude player nomention', '~hg exclude SpikeyRobot',
      ['<@422623712534200321>\n```\nSpikeyRobot added to blacklist.\n```']),
  new Test('List teams and check excluded', '~hg players', ['#embed']),
  new Test(
      'Exclude player already excluded', '~hg exclude <@124733888177111041>',
      ['<@422623712534200321>\n```\nSpikeyRobot is already excluded.\n```']),
  new Test(
      'Include player', '~hg include <@124733888177111041>',
      ['<@422623712534200321>\n```\nSpikeyRobot added to whitelist.\n```']),
  new Test(
      'Include player already included', '~hg include <@124733888177111041>',
      ['<@422623712534200321>\n```\nSpikeyRobot is already included.\n```']),
  new Test('List teams and check included', '~hg players', ['#embed']),
  new Test(
      'Rename Team', '~hg teams rename <@124733888177111041> The overlord',
      ['^to "The overlord"']),
  new Test('List teams and check rename', '~hg teams', ['#embed']),
  new Test('Randomize teams', '~hg teams randomize', ['#noerr']),
  new Test(
      'Reset Options command', '~hg reset options',
      ['<@422623712534200321>\n```\nReset HG\n```Reset ALL options!']),
  new Test('Enable bots', '~hg opt includeBots true', ['#noerr']),
  new Test('Exclude all players', '~hg exclude everyone', ['#noerr']),
  new Test(
      'Include a few players',
      '~hg include spikeybot-dev spikeyrobot robosoupcan spikeybot',
      ['#noerr']),
  new Test(
      'Enable no output mode', '~hg opt disableOutput true',
      [
        '<@422623712534200321>\n```\nSet disableOutput to true from false\n```'
      ]),
  new Test('Run a game with no output', '~hg go', ['#noerr', '#embed']),
  new Test('Wait for game to end', null, []),
  new Test('Run another game with no output', '~hg go', ['#noerr', '#embed']),
  new Test('Wait for game to end', null, []),
  new Test('Run another game with no output', '~hg go', ['#noerr', '#embed']),
  new Test('Wait for game to end', null, []),
  new Test('Rename game', '~hg rename My Cool Game', ['#noerr']),
  new Test('Reset custom name of game', '~hg rename', ['#noerr']),
  new Test(
      'Reset All command', '~hg reset all',
      ['<@422623712534200321>\n```\nReset HG\n```Reset ALL Hungry Games ' +
       'data for this server!']),
  new Test('Events command', '~hg events', ['#noerr']),
  new Test(
      'Reset All command', '~hg reset all',
      ['<@422623712534200321>\n```\nReset HG\n```There is no data to reset.']),
  new Test(
      'No data: List players', '~hg players',
      ['<@422623712534200321>\n```\nA game has not been created yet.\n```']),
  new Test(
      'Reset All command', '~hg reset all',
      ['<@422623712534200321>\n```\nReset HG\n```There is no data to reset.']),
  new Test(
      'No data: Exclude', '~hg exclude',
      [
        '<@422623712534200321>\n```\nCreated a Hungry Games with default ' +
            'settings and all members included.\n```',
        '<@422623712534200321>\n```\nYou must specify who you wish for me ' +
            'to exclude from the next game.\n```'
      ]),
  new Test(
      'Reset All command', '~hg reset all',
      ['<@422623712534200321>\n```\nReset HG\n```Reset ALL Hungry Games ' +
       'data for this server!']),
  new Test(
      'No data: Include', '~hg include',
      [
        '<@422623712534200321>\n```\nCreated a Hungry Games with default ' +
            'settings and all members included.\n```',
        '<@422623712534200321>\n```\nYou must specify who you wish for me ' +
            'to include in the next game.\n```'
      ]),
  new Test(
      'Reset All command', '~hg reset all',
      ['<@422623712534200321>\n```\nReset HG\n```Reset ALL Hungry Games ' +
       'data for this server!']),
  new Test('No data: Event remove', '~hg events remove 0', ['#noerr']),
  new Test(
      'Reset All command', '~hg reset all',
      ['<@422623712534200321>\n```\nReset HG\n```There is no data to reset.']),
  new Test(
      'No data: Pause autoplay', '~hg pause',
      ['<@422623712534200321>\n```\nGame Pausing\n```Failed: There isn\'t ' +
       'currently a game in progress.']),
  /* new Test(
      'Create NPC',
      '~hg npc create TESTNPC https://cdn.discordapp.com/embed/avatars/1.png' +
          '?size=128',
      ['#embed', '^<@422623712534200321>\n```\nCreated NPC: TESTNPC\n```']),
  new Test('Exclude NPC', '~hg npc exclude TESTNPC', ['#noerr']),
  new Test('Include NPC', '~hg npc include TESTNPC', ['#noerr']),
  new Test('Delete NPC', '~hg npc delete TESTNPC', ['#embed']), */
];

let ready = false;
let currentTest;
let currentTestPart = -1;
let testTimeout;
let currentDone;

let channelID = '439642818084995074';
let channel;

/**
 * Start a test case by sending a command to the bot.
 *
 * @param {Test} test The test object with all data.
 * @param {function} done The function to call once the test is complete.
 */
function sendCommand(test, done) {
  currentTest = test;
  currentDone = done;

  currentTestPart = -1;
  if (!test.command) return;
  channel.send(test.command);
}

/**
 * Check a received message against test criteria.
 *
 * @param {Discord~Message} msg The message received. Includes messages we sent,
 * as well as the bot sent.
 */
function testMessageContent(msg) {
  if (msg.author.id !== client.user.id) return;
  if (msg.channel.id !== channelID) {
    if (!ready && msg.content.startsWith('Beginning in unit test mode (JS')) {
      ready = true;
      startTests();
    }
    return;
  }
  if (!ready) return;
  clearTimeout(testTimeout);
  expect(msg.content).to.be.a('string');
  if (currentTestPart === -1) {
    expect(msg.content).to.equal(currentTest.command);
  } else if (currentTestPart < currentTest.responses.length) {
    if (currentTest.responses[currentTestPart] === '#noerr') {
      expect(msg.content)
          .to.not.include('Oops')
          .and.not.include('LOL!')
          .and.not.include('Oh no')
          .and.not.include(' error ')
          .and.not.include('undefined')
          .and.not.include('Nice try!');
    } else if (currentTest.responses[currentTestPart] === '#embed') {
      expect(msg.embeds).to.be.lengthOf.above(0);
    } else if (currentTest.responses[currentTestPart].startsWith('^')) {
      expect(msg.content)
          .to.include(currentTest.responses[currentTestPart].substr(1));
    } else if (currentTest.responses[currentTestPart].startsWith('!')) {
      expect(msg.content)
          .to.not.include(currentTest.responses[currentTestPart].substr(1));
    } else {
      expect(msg.content).to.equal(currentTest.responses[currentTestPart]);
    }
  }
  currentTestPart++;
  if (currentTestPart === currentTest.responses.length) {
    currentDone();
  } else {
    expect(currentTestPart).to.be.below(currentTest.responses.length);
  }
}


client.login(auth.test).catch((err) => {
  console.error(err);
  process.exit(1);
});
client.on('message', testMessageContent);
client.on('ready', () => {
  console.log("Test bot ready");
  channel = client.channels.resolve(channelID);
});
console.log("Begin test bot");

/**
 * Start running an array of Tests.
 *
 * @param {Test[]} tests The tests to run.
 */
function runTests(tests) {
  afterEach('Wait for extra...', function(done) {
    this.timeout(4000);
    setTimeout(done, 3000);
  });
  for (let i in tests) {
    if (!tests[i] instanceof Test) continue;
    (function(i) {
      it(tests[i].title, function(done) {
        if (!tests[i].responses || tests[i].responses.length == 0) {
          setTimeout(done, 15000);
          this.timeout(16000);
        } else {
          this.timeout(15000);
        }
        sendCommand(tests[i], done);
      });
    })(i);
  }
}

/**
 * Start running all tests.
 */
function startTests() {
  describe('All Tests', function() {
    describe('START', function() {
      runTests([new Test(
          'Enable test mode', '~`RUN UNIT TESTS`~',
          ['~`UNIT TEST MODE ENABLED`~'])]);
    });
    describe('SpikeyBot', function() {
      describe('Main Module', function() {
        runTests(mainTests);
      });
      describe('Hungry Games', function() {
        runTests(hgTests);
      });
    });
    describe('END', function() {
      runTests([new Test(
          'Disable test mode', '~`END UNIT TESTS`~',
          ['~`UNIT TEST MODE DISABLED`~'])]);
    });
  });
  run();
}
