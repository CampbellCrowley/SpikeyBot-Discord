let expect = require('chai').expect;
let Discord = require('discord.js');
let client = new Discord.Client();
let spawn = require('child_process').spawn;
let fs = require('fs');

let spawnOpts = {cwd: __dirname + "/..", stdio: "pipe"};
let log = fs.createWriteStream(__dirname + "/output.log");
let bot = spawn(
    'nodejs',
    ['SpikeyBot.js', 'dev', './main.js', './music.js', './hungryGames.js'],
    spawnOpts);
bot.stdout.pipe(log);
bot.stderr.pipe(log);

after(function() {
  bot.kill("SIGHUP");
  client.destroy();
});

function Test(title_, cmd_, res_) {
  this.title = title_;
  this.command = cmd_;
  this.responses = res_;
}
const mainTests = [
  new Test('Say command', '~say Hello World!', ["Hello World!"]),
  new Test(
      'Add command', '~add 5 6 7', ['<@422623712534200321>\n```\n18\n\n```']),
  new Test(
      'Simplify command', '~simplify 5x=7y',
      ['<@422623712534200321>\n```\n0 = 7y - 5x\n```']),
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
      ['<@422623712534200321>\n```\nWant to add me to your server? Click ' +
       'this link:\n(You\'ll need to be signed into discord in your browser ' +
       'first)\n```https://discordapp.com/oauth2/authorize?&client_' +
       'id=318552464356016131&scope=bot']),
  new Test(
      'Help command', '~help',
      [
        '<@422623712534200321>\n```\nI sent you a DM with commands!\n```:wink:'
      ]),
  new Test(
      'Create Date command', '~createdate',
      ['<@422623712534200321>\n```\nYou created your discord account on Sun ' +
       'Mar 11 2018 22:15:45\n```']),
  new Test(
      'Join Date command', '~joindate',
      ['<@422623712534200321>\n```\nYou joined this server on Sun Mar 11 ' +
       '2018 22:23:29\n```']),
  new Test(
      'PM Me command', '~pmme',
      ['<@422623712534200321>\n```\nI couldn\'t send you a message, you ' +
       'probably blocked me :(\n```']),
  new Test(
      'PM Spikey command', '~pmspikey I am running a unit test.',
      ['<@422623712534200321>\n```\nI sent your message to SpikeyRobot.\n```']),
  new Test('Flip command', '~flip', ['!error']),
  new Test('Avatar command', '~avatar', ['!error']),
  new Test('Ping command', '~ping', ['!error'])
];
const hgTests = [
  new Test("Create command", "~hg create", ["!error"]),
  new Test("Start command", "~hg start", ["!error"]),
  new Test(
      'Reset All command', "~hg reset all",
      ['<@422623712534200321>\n```\nResetting ALL Hungry Games data for ' +
       'this server!\n```'])
];

let ready = false;
let currentTest;
let currentTestPart = -1;
let testTimeout;
let currentDone;
let extraMessages = -1;

let channelID = "439642818084995074";
let channel;

function sendCommand(test, done) {
  currentTest = test;
  currentDone = done;

  currentTestPart = -1;
  extraMessages = -1;
  channel.send(test.command);
}

function testMessageContent(msg) {
  if (msg.author.id !== client.user.id) return;
  if (msg.channel.id !== channelID) {
    if (!ready) {
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
    currentTestPart++;
  } else if (currentTestPart < currentTest.responses.length) {
    if (currentTest.responses[currentTestPart] === '!error') {
      expect(msg.content)
          .to.not.include("Oops")
          .and.not.include("LOL!")
          .and.not.include("Nice try!");
    } else {
      expect(msg.content).to.equal(currentTest.responses[currentTestPart]);
    }
    currentTestPart++;
  }
  if (currentTestPart >= currentTest.responses.length) {
    currentDone();
  }
}


client.login('NDIyNjIzNzEyNTM0MjAwMzIx.DYeenA.K5pUxL8GGtVm1ml_Eb6SaZxSKnE');
client.on('message', testMessageContent);
client.on('ready', () => {
  channel = client.channels.get(channelID);
});

function runTests(tests) {
  for (var i in tests) {
    (function(i) {
      describe(tests[i].title, function() {
        it("Primary", function(done) {
          this.timeout(10000);
          sendCommand(tests[i], done);
        });
        it("Extra", function(done) {
          this.timeout(2100);
          setTimeout(done, 2000);
        });
      });
    })(i);
  }
}

function startTests() {
  describe("START", function() {
    runTests([new Test(
        'Enable test mode', "~`RUN UNIT TESTS`~",
        ["~`UNIT TEST MODE ENABLED`~"])]);
  });
  describe("SpikeyBot", function() {
    describe("Main Module", function() {
      runTests(mainTests);
    });
    describe("Hungry Games", function() {
      runTests(hgTests);
    });
  });
  describe("END", function() {
    runTests([new Test(
        'Disable test mode', "~`END UNIT TESTS`~",
        ["~`UNIT TEST MODE DISABLED`~"])]);
  });
  run();
}
