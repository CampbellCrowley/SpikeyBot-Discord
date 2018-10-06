// Copyright 2018 Campbell Crowley. All rights reserved.
// Author: Campbell Crowley (dev@campbellcrowley.com)
process.env.GOOGLE_APPLICATION_CREDENTIALS = './gApiCredentials.json';
const Readable = require('stream').Readable;
const tts = require('@google-cloud/text-to-speech');
require('./subModule.js')(TTS); // Extends the SubModule class.

const ttsClient = new tts.TextToSpeechClient();
let ttsRequest = {
  input: {text: 'Hello world!'},
  voice: {languageCode: 'en-AU', ssmlGender: 'MALE'},
  audioConfig: {audioEncoding: 'OGG_OPUS'},
};

/**
 * @classdesc Adds text-to-speech support for voice channels.
 * @class
 * @augments SubModule
 * @listens SpikeyBot~Command#tts
 * @listens SpikeyBot~Command#speak
 */
function TTS() {
  const self = this;
  /** @inheritdoc */
  this.myName = 'TTS';

  /** @inheritdoc */
  this.helpMessage = null;

  /** @inheritdoc */
  this.initialize = function() {
    self.command.on(['tts', 'speak'], commandTTS, true);
  };
  /** @inheritdoc */
  this.shutdown = function() {
    self.command.deleteEvent(['tts', 'speak']);
  };

  /**
   * The permission required to use TTS commands.
   *
   * @private
   * @constant
   * @default
   * @type {string}
   */
  const ttsPermString = 'tts:all';

  /**
   * Joins a user's voice channel and speaks the given message.
   *
   * @private
   * @type {commandHandler}
   * @param {Discord~Message} msg Message that triggered command.
   * @listens SpikeyBot~Command#tts
   * @listens SpikeyBot~Command#speak
   */
  function commandTTS(msg) {
    self.bot.patreon.checkAllPerms(
        msg.author.id, msg.channel.id, msg.guild.id, ttsPermString, onGetPerms);

    /**
     * Callback for checking permissions for command.
     * @private
     * @type {Patreon~basicCB}
     * @param {?string} err The error string, or null if no error.
     * @param {?{status: boolean, message: string}} info The returned data if
     * there was no error.
     */
    function onGetPerms(err, info) {
      if (err) {
        self.common.reply(
            msg, 'Oops! I wasn\'t able to do that for you...', err);
        return;
      } else if (!info.status) {
        self.common.reply(
            msg, 'Sorry, but you aren\'t able to use this command.',
            info.message);
        return;
      }
      self.bot.patreon.getSettingValue(
          msg.author.id, ttsPermString, onGetSettings);
    }

    let matchedSettings;

    /**
     * After checking if a user has permission for this command, send the
     * request too Google with the user's settings.
     * @private
     * @type {Patreon~basicCB}
     * @param {?string} err The error string, or null if no error.
     * @param {?{status: string, message: string}} info The returned data if
     * there was no error.
     */
    function onGetSettings(err, info) {
      if (err || !info.status) {
        self.common.reply(
            msg,
            'Oops! Something went wrong while looking for your settings...',
            err || 'Received NULL');
        self.error(
            'Failed to fetch settings for tts:all: ' + msg.author.id + ' (' +
            (err || 'Received NULL') + ')');
        return;
      }
      matchedSettings = info.status.match(/(\w\w-\w\w)-([MF])/);
      if (!matchedSettings) {
        self.common.reply(
            msg, 'Oops! Something went wrong while reading your settings...',
            'Invalid Value');
        self.error(
            'User has invalid setting for tts:all: ' + msg.author.id + ' (' +
            info.status + ')');
        return;
      }
      if (!msg.member.voice || !msg.member.voice.channel) {
        self.common.reply(
            msg, 'Oops! You must be in a voice channel for this command.');
        return;
      }
      if (msg.member.voice.channel.connection) {
        onJoinVoice(msg.member.voice.channel.connection);
      } else {
        msg.member.voice.channel.join().then(onJoinVoice).catch((err) => {
          self.common.reply(
              msg, 'Oops! I wasn\'t able to join your voice channel.');
          return;
        });
      }
    }

    let vConn;
    /**
     * Successfully joined a voice channel, now we can request audio data from
     * Google.
     * @private
     * @param {Discord~VoiceConnection} conn The voice channel connection.
     */
    function onJoinVoice(conn) {
      vConn = conn;
      let thisRequest = Object.assign({}, ttsRequest);
      thisRequest.input.text = msg.text.slice(1);
      thisRequest.voice.languageCode = matchedSettings[1];
      thisRequest.voice.ssmlGender =
          matchedSettings[2] == 'F' ? 'FEMALE' : 'MALE';
      ttsClient.synthesizeSpeech(thisRequest, onSpeechResponse);
    }

    /**
     * Response from Google with TTS audio data.
     * @private
     * @param {?Error} err Errors in request.
     * @param {?Object} res Response.
     */
    function onSpeechResponse(err, res) {
      if (err) {
        self.common.reply(
            msg, 'Oops! Google wasn\'t able to turn that into audio...');
        self.error('Google failed to create audio data.');
        console.error(err);
        return;
      }
      self.common.reply(
          msg, 'Saying "' + msg.text.slice(1) + '" in ' +
              msg.member.voice.channel.name);
      let readable = new Readable();
      readable._read = function() {};
      vConn.play(readable);
      readable.push(res.audioContent);
    }
  }
}
module.exports = new TTS();
