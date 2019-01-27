const childProcess = require('child_process');
require('./subModule.js')(Sandbox); // Extends the SubModule class.
/**
 * @classdesc Creates a safe environment to run untrusted scripts.
 * @class
 * @augments SubModule
 * @listens Command#js
 */
function Sandbox() {
  const self = this;
  /** @inheritdoc */
  this.myName = 'Sandbox';
  /** @inheritdoc */
  this.initialize = function() {
    self.command.on('js', commandJS);
  };
  /** @inheritdoc */
  this.shutdown = function() {
    self.command.removeListener('js');
  };

  /**
   * Arguments to pass into child_process.exec.
   * @private
   * @default
   * @constant
   * @type {Object}
   */
  const execArgs = {
    timeout: 35000,  // 5 second leniency for sandbox.
    maxBuffer: 2 * 1024,
    env: {},
  };

  /**
   * Command to execute to start a sandbox.
   * @private
   * @default
   * @constant
   * @type {string}
   */
  const sandboxCommand = 'firejail --profile=./src/lib/sandbox.profile -- ';
  /**
   * The command to run in the sandbox to run JavaScript.
   * @private
   * @default
   * @constant
   * @type {string}
   */
  const jsCommand = 'SBnode';

  /**
   * Run JavaScript code in a sandbox, then show user outcome.
   *
   * @private
   * @type {commandHandler}
   * @param {Discord~Message} msg Message that triggered command.
   * @listens Command#js
   */
  function commandJS(msg) {
    const cmd = `${sandboxCommand}${jsCommand}`;
    msg.channel.startTyping();
    const p = childProcess.exec(cmd, execArgs, (...args) => {
      scriptEnd(msg, ...args);
    });
    p.stdin.write(msg.text);
    p.stdin.end();
  }

  /**
   * Callback when script user's program has finished executing.
   *
   * @private
   * @param {Discord~Message} msg The Discord message that triggered the initial
   * execution.
   * @param {Error} err
   * @param {string|Buffer} stdout
   * @param {string|Buffer} stderr
   */
  function scriptEnd(msg, err, stdout, stderr) {
    msg.channel.stopTyping();
    if (err) {
      if (err.message === 'stderr maxBuffer exceeded' ||
          err.message === 'stdout maxBuffer exceeded') {
        self.common.reply(msg, 'Code execution failed.', err.message);
        return;
      } else if (err.code === null) {
        self.common.reply(
            msg, 'Code execution failed.', 'Execution aborted. ' +
                'Your code can run at most for 30 seconds.');
        return;
      }
      self.common.reply(
          msg, 'Oops! Something didn\'t work right...',
          'Something is broken internally.');
      console.error(err);
      self.debug('STDERR: ' + stderr);
      self.debug('STDOUT: ' + stdout);
      return;
    }
    const embed = new self.Discord.MessageEmbed();
    embed.setColor([0, 255, 255]);
    if (stdout.length > 0) {
      if (stdout.indexOf('\\n') != stdout.lastIndexOf('\\n')) {
        stdout = stdout.replace(/\\n/g, '\n');
      }
      embed.addField('STDOUT', stdout.substr(0, 1024), true);
    }
    if (stderr.length > 0) {
      if (stderr.indexOf('\\n') != stderr.lastIndexOf('\\n')) {
        stderr = stderr.replace(/\\n/g, '\n');
      }
      embed.addField('STDERR', stderr.substr(0, 1024), true);
    }
    msg.channel.send(self.common.mention(msg), embed);
  }
}
module.exports = new Sandbox();
