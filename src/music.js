// Copyright 2018 Campbell Crowley. All rights reserved.
// Author: Campbell Crowley (dev@campbellcrowley.com)
const ytdl = require('youtube-dl'); // Music thread uses separate require.
const fs = require('fs'); // Music thread uses separate require.
const ogg = require('ogg');
const opus = require('node-opus');
const spawn = require('threads').spawn;
const Readable = require('stream').Readable;
require('./subModule.js')(Music);

/**
 * @classdesc Music and audio related commands.
 * @class
 * @augments SubModule
 * @listens Discord~Client#voiceStateUpdate
 * @listens SpikeyBot~Command#play
 * @listens SpikeyBot~Command#pause
 * @listens SpikeyBot~Command#resume
 * @listens SpikeyBot~Command#leave
 * @listens SpikeyBot~Command#stop
 * @listens SpikeyBot~Command#stfu
 * @listens SpikeyBot~Command#skip
 * @listens SpikeyBot~Command#queue
 * @listens SpikeyBot~Command#playing
 * @listens SpikeyBot~Command#remove
 * @listens SpikeyBot~Command#dequeue
 * @listens SpikeyBot~Command#lyrics
 * @listens SpikeyBot~Command#record
 * @listens SpikeyBot~Command#follow
 * @listens SpikeyBot~Command#unfollow
 * @listens SpikeyBot~Command#stalk
 * @listens SpikeyBot~Command#unstalk
 * @listens SpikeyBot~Command#musicstats
 * @listens SpikeyBot~Command#volume
 * @fires SpikeyBot~Command#stop
 */
function Music() {
  const self = this;
  this.myName = 'Music';
  /**
   * The Genuius client token we use to fetch information from their api
   *
   * @private
   * @type {string}
   * @constant
   */
  const geniusClient =
      'l5zrX9XIDrJuz-kS1u7zS5sE81KzrH3qxZL5tAvprE9GG-L1KYlZklQDXL6wf3sn';
  /**
   * The request headers to send to genius.
   *
   * @private
   * @type {Object}
   * @default
   * @constant
   */
  const geniusRequest = {
    hostname: 'api.genius.com',
    path: '/search/',
    headers: {
      'Accept': 'application/json',
      'Authorization': 'Bearer ' + geniusClient,
    },
    method: 'GET',
  };

  const https = require('https');

  /**
   * Information about a server's music and queue.
   * @typedef {Object} Music~Broadcast
   *
   * @property {string[]} queue Requests that have been queued.
   * @property {Object.<boolean>} skips Stores user id's and whether
   * they have voted to skip. Non-existent user means they have not voted to
   * skip.
   * @property {boolean} isPlaying Is audio currntly being streamed to the
   * channel.
   * @property {?Discord~VoiceBroadcast} broadcast The Discord voice broadcast
   * actually playing the audio.
   * @property {?Discord~VoiceConnection} voice The current voice connection
   * audio is being streamed to.
   * @property {?Discord~StreamDispatcher} dispatcher The Discord dispatcher for
   * the current audio channel.
   * @property {?Object} current The current broadcast information including
   * thread, readable stream, and song information.
   */

  /**
   * All current audio broadcasts to voice channels. Stores all relavent data.
   * Stored by guild id.
   *
   * @private
   * @type {Object.<Music~Broadcast>}
   */
  let broadcasts = {};

  /**
   * The current user IDs of the users to follow into new voice channels. This
   * is mapped by guild id.
   *
   * @private
   * @type {Object.<string>}
   */
  let follows = {};

  /**
   * Special cases of requests to handle seperately.
   *
   * @private
   * @type {Object.<Object.<{cmd: string, url: ?string, file: string}>>}
   * @constant
   */
  const special = {
    'nice try vi': {
      cmd: 'vi',
      url: 'https://www.youtube.com/watch?v=c1NoTNCiomU',
      file: './sounds/viRap.ogg',
    },
    'airhorn': {
      cmd: 'airhorn',
      url: '',
      file: './sounds/airhorn.ogg',
    },
    'rickroll': {
      cmd: 'rickroll',
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      file: './sounds/rickRoll.ogg',
    },
    'kokomo': {
      cmd: 'kokomo',
      url: 'https://www.youtube.com/watch?v=bOyJUF0p9Wc',
      file: './sounds/kokomo.ogg',
    },
  };

  /**
   * Options passed to youtube-dl for fetching videos.
   *
   * @private
   * @type {string[]}
   * @default
   * @constant
   */
  const ytdlOpts =
      ['-f', 'bestaudio/worst', '--no-playlist', '--default-search=auto'];

  /**
   * Options to pass into the stream dispatcher.
   * [StreamOptions](https://discord.js.org/#/docs/main/master/typedef/StreamOptions)
   *
   * @private
   * @constant
   * @type {Discord~StreamOptions}
   * @default
   */
  const streamOptions = {
    passes: 2, fec: true, /* bitrate: 42,*/ volume: 0.5, plp: 0.01,
  };

  /** @inheritdoc */
  this.initialize = function() {
    self.command.on('join', commandJoin, true);
    self.command.on('play', commandPlay, true);
    self.command.on('pause', commandPause, true);
    self.command.on('resume', commandResume, true);
    self.command.on(['leave', 'stop', 'stfu'], commandLeave, true);
    self.command.on('skip', commandSkip, true);
    self.command.on(['q', 'queue', 'playing'], commandQueue, true);
    self.command.on(['remove', 'dequeue'], commandRemove, true);
    self.command.on('lyrics', commandLyrics);
    self.command.on('record', commandRecord, true);
    self.command.on(
        ['follow', 'unfollow', 'stalk', 'stalkme'], commandFollow, true);
    self.command.on('musicstats', commandStats);
    self.command.on(['volume', 'vol', 'v'], commandVolume, true);

    self.command.on('kokomo', (msg) => {
      msg.content = msg.prefix + 'play kokomo';
      self.command.trigger('play', msg);
    });
    self.command.on('vi', (msg) => {
      msg.content = msg.prefix + 'play nice try vi';
      self.command.trigger('play', msg);
    });
    self.command.on('airhorn', (msg) => {
      msg.content = msg.prefix + 'play airhorn';
      self.command.trigger('play', msg);
    });
    self.command.on('rickroll', (msg) => {
      msg.content = msg.prefix + 'play rickroll';
      self.command.trigger('play', msg);
    });

    self.client.on('voiceStateUpdate', handleVoiceStateUpdate);
  };

  /** @inheritdoc */
  this.shutdown = function() {
    self.command.deleteEvent('join');
    self.command.deleteEvent('play');
    self.command.deleteEvent('pause');
    self.command.deleteEvent('resume');
    self.command.deleteEvent(['leave', 'stop', 'stfu']);
    self.command.deleteEvent('skip');
    self.command.deleteEvent(['q', 'queue', 'playing']);
    self.command.deleteEvent(['remove', 'dequeue']);
    self.command.deleteEvent('lyrics');
    self.command.deleteEvent('record');
    self.command.deleteEvent('kokomo');
    self.command.deleteEvent('vi');
    self.command.deleteEvent('airhorn');
    self.command.deleteEvent('rickroll');
    self.command.deleteEvent(['follow', 'unfollow', 'stalk', 'stalkme']);
    self.command.deleteEvent('musicstats');
    self.command.deleteEvent(['volume', 'vol', 'v']);

    self.client.removeListener('voiceStateUpdate', handleVoiceStateUpdate);
  };

  /** @inheritdoc */
  this.unloadable = function() {
    return Object.keys(broadcasts).length === 0;
  };

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
   * @deprecated Use {@link Common.reply} instead.
   *
   * @private
   * @param {Discord~Message} msg Message to reply to.
   * @param {string} text The main body of the message.
   * @param {string} post The footer of the message.
   * @return {Promise} Promise of Discord~Message that we attempted to send.
   */
  function reply(msg, text, post) {
    return self.common.reply(msg, text, post);
  }

  /**
   * Leave a voice channel if all other users have left. Should also cause music
   * and recordings to stop.
   *
   * @private
   * @param {Discord~VoiceState} oldState State before status update.
   * @param {Discord~VoiceState} newState State after status update.
   * @listens Discord~Client#voiceStateUpdate
   */
  function handleVoiceStateUpdate(oldState, newState) {
    // User set to follow has changed channel.
    if (follows[oldState.guild.id] == oldState.id && newState.channelID) {
      newState.channel.join().catch(() => {});
      return;
    }
    let broadcast = broadcasts[oldState.guild.id];
    if (broadcast) {
      if (oldState.id === self.client.user.id && !newState.channel) {
        self.error(
            'Forcibly ejected from voice channel: ' + oldState.guild.id + ' ' +
            oldState.channelID);
        delete broadcasts[oldState.guild.id];
        return;
      }
      if (oldState.channel && oldState.channel.members) {
        if (oldState.channel.members.size === 1 &&
            oldState.channel.members.get(self.client.user.id)) {
          if (pauseBroadcast(broadcast)) {
            if (broadcast.current.request &&
                broadcast.current.request.channel) {
              let prefix = self.bot.getPrefix(oldState.guild.id);
              let followInst = '';
              if (oldState.channelID && newState.channelID) {
                followInst = '\n`' + prefix + 'join` to join your channel.';
              }

              self.common.reply(
                  broadcast.current.request,
                  'Music paused because everyone left me alone :(\nType `' +
                      prefix + 'resume`, to unpause the music.' + followInst);
            }
          }
        }
      }
      // If the bot changed channel, continue playing previous music.
      if (oldState.id === self.client.user.id && broadcast.voice &&
          broadcast.voice.channel.id != newState.channelID &&
          oldState.channelID != newState.channelID && oldState.channelID &&
          newState.channelID && newState.channel &&
          newState.channel.connection) {
        broadcast.voice = newState.channel.connection;
        broadcast.dispatcher =
            broadcast.voice.play(broadcast.broadcast, streamOptions);
      }
    }
  }

  /**
   * Format the info response from ytdl into a human readable format.
   *
   * @private
   * @param {Object} info The info received from ytdl about the song.
   * @param {Discord~StreamDispatcher} [dispatcher] The broadcast dispatcher
   * that is currently broadcasting audio. If defined, this will be used to
   * determine remaining play time.
   * @return {Discord~MessageEmbed} The formatted song info.
   */
  function formatSongInfo(info, dispatcher) {
    let remaining = '';
    let currentTime = '';
    if (dispatcher) {
      currentTime =
          '[' + formatPlaytime(
              Math.round(
                  (dispatcher.totalStreamTime - dispatcher.pausedTime) /
                        1000)) +
          '] / ';
      remaining = ' (' + formatPlaytime(getRemainingSeconds(info, dispatcher)) +
          ' left)';
    }
    let output = new self.Discord.MessageEmbed();
    output.setDescription(
        info.title + '\nUploaded by ' + info.uploader + '\n[👍 ' +
        formNum(info.like_count) + ' 👎 ' + formNum(info.dislike_count) +
        '][👁️ ' + formNum(info.view_count) + ']\n' + currentTime + '[' +
        formatPlaytime(info._duration_raw) + ']' + remaining);
    if (info.thumbnail) output.setThumbnail(info.thumbnail);
    output.setURL(info.webpage_url);
    output.setColor([50, 200, 255]);
    return output;
  }

  /**
   * Get the remaining playtime in the given song info and broadcast.
   *
   * @private
   * @param {Object} info The song info received from ytdl.
   * @param {Discord~StreamDispatcher} dispatcher The dispatcher playing the
   * song currently.
   * @return {number} Number of seconds remaining in the song playtime.
   */
  function getRemainingSeconds(info, dispatcher) {
    if (!dispatcher.totalStreamTime) return info._duration_raw;
    return info._duration_raw -
        Math.round((dispatcher.totalStreamTime - dispatcher.pausedTime) / 1000);
  }

  /**
   * Format the given number of seconds into the playtime format.
   *
   * @private
   * @param {number} seconds The duration in seconds.
   * @return {string} The formatted string in minutes and seconds.
   */
  function formatPlaytime(seconds) {
    return Math.floor(seconds / 60) + 'm ' + seconds % 60 + 's';
  }
  /**
   * Add commas between digits on large numbers.
   *
   * @private
   * @param {number|string} num The number to format.
   * @return {string} The formatted number.
   */
  function formNum(num) {
    let numString = (num + '');
    let tmpString = [];
    for (let i = 0; i < numString.length; i++) {
      if (i > 0 && i % 3 === 0) tmpString.push(',');
      tmpString.push(numString.substr(-i - 1, 1));
    }
    return tmpString.reverse().join('');
  }
  /**
   * Add a song to the given broadcast's queue and start playing it not already.
   *
   * @private
   * @param {Music~Broadcast} broadcast The broadcast storage container.
   * @param {string} song The song that was requested.
   * @param {Discord~Message} msg The message that requested the song.
   * @param {Object} info The info from ytdl about the song.
   * @fires SpikeyBot~Command#stop
   */
  function enqueueSong(broadcast, song, msg, info) {
    broadcast.queue.push({request: msg, song: song, info: info});
    if (broadcast.voice) {
      try {
        startPlaying(broadcast);
      } catch (err) {
        console.log(err);
        reply(msg, 'Failed to start music stream!');
        self.command.trigger('stop', msg);
      }
    } else {
      msg.member.voice.channel.join()
          .then((conn) => {
            broadcast.voice = conn;
            try {
              startPlaying(broadcast);
            } catch (err) {
              console.log(err);
              reply(msg, 'Failed to start music stream!');
              self.command.trigger('stop', msg);
            }
          })
          .catch((err) => {
            reply(msg, 'I am unable to join your voice channel.', err.message);
          });
    }
  }
  /**
   * Start playing the first item in the queue of the broadcast.
   *
   * @private
   * @param {Music~Broadcast} broadcast The container storing all information
   * about the song.
   */
  function startPlaying(broadcast) {
    if (!broadcast || broadcast.isPlaying || broadcast.isLoading ||
        (broadcast.current &&
         !broadcasts[broadcast.current.request.guild.id])) {
      return;
    }
    if (broadcast.queue.length === 0) {
      self.client.setTimeout(function() {
        broadcast.voice.disconnect();
        delete broadcasts[broadcast.current.request.guild.id];
      }, 500);
      broadcast.current.request.channel.send('`Queue is empty!`');
      return;
    }
    broadcast.isLoading = true;
    broadcast.skips = {};
    if (broadcast.current && broadcast.current.thread) {
      broadcast.current.thread.kill();
    }
    broadcast.current = broadcast.queue.splice(0, 1)[0];
    try {
      makeBroadcast(broadcast);
      // broadcast.voice.play(broadcast.broadcast);
    } catch (err) {
      console.log(err);
      endSong(broadcast);
      broadcast.isLoading = false;
    }
    broadcast.isPlaying = true;

    if (typeof broadcast.current.info !== 'undefined') {
      let embed = formatSongInfo(broadcast.current.info);
      embed.setTitle(
          'Now playing [' + broadcast.queue.length + ' left in queue]');
      broadcast.current.request.channel.send(embed);
      broadcast.current.oninfo = function(info) {
        broadcast.isLoading = false;
      };
    } else {
      if (special[broadcast.current.song]) {
        if (!special[broadcast.current.song].url) {
          broadcast.isLoading = false;
          let embed = new self.Discord.MessageEmbed();
          embed.setTitle(
              'Now playing [' + broadcast.queue.length + ' left in queue]');
          embed.setColor([50, 200, 255]);
          embed.setDescription(broadcast.current.song);
          broadcast.current.request.channel.send(embed);
        } else {
          ytdl.getInfo(
              special[broadcast.current.song].url, ytdlOpts, (err, info) => {
                broadcast.isLoading = false;
                if (err) {
                  self.error(err.message.split('\n')[1]);
                  broadcast.current.request.channel.send(
                      '```Oops, something went wrong while getting info for ' +
                      'this song!```\n' + err.message.split('\n')[1]);
                } else {
                  broadcast.current.info = info;
                  let embed = formatSongInfo(broadcast.current.info);
                  embed.setTitle(
                      'Now playing [' + broadcast.queue.length +
                      ' left in queue]');
                  broadcast.current.request.channel.send(embed);
                }
              });
        }
      } else {
        broadcast.current.oninfo = function(info) {
          broadcast.isLoading = false;
          broadcast.current.info = info;
          let embed = formatSongInfo(broadcast.current.info);
          embed.setTitle(
              'Now playing [' + broadcast.queue.length + ' left in queue]');
          broadcast.current.request.channel.send(embed);
        };
      }
    }
  }
  /**
   * Create a voice channel broadcast based off of the media source, and start
   * playing the audio.
   *
   * @private
   * @param {Music~Broadcast} broadcast The object storing all relevant
   * information.
   */
  function makeBroadcast(broadcast) {
    // Setup voice connection listeners.
    if (!broadcast.voice) return;
    broadcast.voice.removeListener('disconnect', onDC);
    broadcast.voice.on('disconnect', onDC);
    /**
     * Fires on when voice connection is disconnected. Cleans up anything that
     * could be left behind.
     * @private
     */
    function onDC() {
      if (broadcast.current.readable) broadcast.current.readable.destroy();
      if (broadcast.current.thread) broadcast.current.thread.kill();
    }

    // Setup readable stream for audio data.
    broadcast.current.readable = new Readable();
    broadcast.current.readable._read = function() {};
    broadcast.broadcast = self.client.createVoiceBroadcast();
    broadcast.broadcast.play(broadcast.current.readable);
    broadcast.dispatcher =
        broadcast.voice.play(broadcast.broadcast, streamOptions);

    broadcast.broadcast.dispatcher.on('end', function() {
      endSong(broadcast);
    });
    broadcast.broadcast.dispatcher.on('close', function() {
      endSong(broadcast);
    });

    broadcast.dispatcher.on('error', function(err) {
      self.error('Error in starting broadcast');
      console.log(err);
      broadcast.current.request.channel.send(
          '```An error occured while attempting to play ' +
          broadcast.current.song + '.```');
      broadcast.isLoading = false;
      skipSong(broadcast);
    });

    // Spawn thread for starting audio stream.
    let input = {
      song: broadcast.current.song,
      special: special,
      ytdlOpts: ytdlOpts,
    };
    if (broadcast.current.info) {
      input.song = broadcast.current.info.url;
    }
    broadcast.current.thread = spawn(startStream);
    broadcast.current.thread.send(input);
    broadcast.current.thread.on('progress', function(data) {
      if (data.ytdlinfo) {
        broadcast.current.oninfo(data.ytdlinfo);
        return;
      }
      if (data.data) data.data = Buffer.from(data.data);
      broadcast.current.readable.push(data.data);
    });
    broadcast.current.thread.on('done', function() {
      broadcast.current.thread.kill();
    });
    broadcast.current.thread.on('error', function(err) {
      self.error('Error in thread');
      console.log(err);
      broadcast.current.request.channel.send(
          '```An error occured while attempting to play ' +
          broadcast.current.song + '.```');
      broadcast.isLoading = false;
      skipSong(broadcast);
    });
  }

  /**
   * Starts the streams as a thread and reports done with the streams.
   *
   * @private
   * @param {Object} input Input vars.
   * @param {function} done Done callback.
   * @param {function} progress Progress callback.
   */
  function startStream(input, done, progress) {
    let stream;
    if (input.special[input.song]) {
      stream = require('fs').createReadStream(input.special[input.song].file);
    } else {
      stream = require('youtube-dl')(input.song, input.ytdlOpts);
      stream.on('info', function(info) {
        progress({ytdlinfo: info});
      });
      // youtube-dl npm module emits `end` and not `close`.
      stream.on('end', function() {
        progress({data: null});
        done();
      });
    }
    stream.on('data', function(chunk) {
      progress({data: chunk});
    });
    stream.on('close', function() {
      progress({data: null});
      done();
    });
  }

  /**
   * Triggered when a song has finished playing.
   *
   * @private
   * @param {Music~Broadcast} broadcast The object storing all relevant
   * information.
   */
  function endSong(broadcast) {
    if (broadcast.isLoading) return;
    if (broadcast.isPlaying) skipSong(broadcast);
  }
  /**
   * Skip the current song, then attempt to play the next.
   *
   * @private
   * @param {Music~Broadcast} broadcast The object storing all relevant
   * information.
   */
  function skipSong(broadcast) {
    broadcast.isPlaying = false;
    startPlaying(broadcast);
  }

  /**
   * Join a voice channel that the user is in.
   *
   * @private
   * @type {commandHandler}
   * @param {Discord~Message} msg The message that triggered command.
   * @listens SpikeyBot~Command#join
   */
  function commandJoin(msg) {
    if (msg.member.voice.channel === null) {
      reply(msg, 'You aren\'t in a voice channel!');
    } else {
      msg.member.voice.channel.join().catch((err) => {
        reply(msg, 'I am unable to join your voice channel.', err.message);
      });
    }
  }

  /**
   * Pause the currently playing music broadcast.
   *
   * @private
   * @type {commandHandler}
   * @param {Discord~Message} msg The message that triggered command.
   * @listens SpikeyBot~Command#pause
   */
  function commandPause(msg) {
    if (!broadcasts[msg.guild.id]) {
      self.common.reply(msg, 'Nothing is playing!');
    } else if (!broadcasts[msg.guild.id].dispatcher) {
      self.common.reply(msg, 'Nothing is playing!');
    } else {
      if (pauseBroadcast(broadcasts[msg.guild.id])) {
        self.common.reply(msg, 'Music paused.');
      } else {
        self.common.reply(msg, 'Music was already paused!');
      }
    }
  }

  /**
   * Cause the given broadcast to be paused.
   *
   * @private
   * @param {Music~Broadcast} broadcast The object storing all relevant
   * information.
   * @return {boolean} If the music was actully paused. False if the music is
   * already paused or nothing is playing.
   */
  function pauseBroadcast(broadcast) {
    if (!broadcast) return false;
    if (!broadcast.broadcast) return false;
    if (!broadcast.broadcast.dispatcher) return false;
    if (!broadcast.broadcast.dispatcher.pause) return false;
    if (broadcast.broadcast.dispatcher.paused) return false;
    broadcast.broadcast.dispatcher.pause(true);
    return true;
  }

  /**
   * Resume the currently paused music broadcast.
   *
   * @private
   * @type {commandHandler}
   * @param {Discord~Message} msg The message that triggered command.
   * @listens SpikeyBot~Command#resume
   */
  function commandResume(msg) {
    if (!broadcasts[msg.guild.id]) {
      self.common.reply(msg, 'Nothing is playing!');
    } else if (!broadcasts[msg.guild.id].dispatcher) {
      self.common.reply(msg, 'Nothing is playing!');
    } else {
      if (resumeBroadcast(broadcasts[msg.guild.id])) {
        self.common.reply(msg, 'Music resumed.');
      } else {
        self.common.reply(
            msg, 'I am unable to resume. I need music to play to somebody.');
      }
    }
  }

  /**
   * Cause the given broadcast to be resumed.
   *
   * @private
   * @param {Music~Broadcast} broadcast The object storing all relevant
   * information.
   * @return {boolean} If the music was actully resumed. False if the music is
   * already playing or nothing is playing or the bot is alone in a channel.
   */
  function resumeBroadcast(broadcast) {
    if (!broadcast) return false;
    if (!broadcast.broadcast) return false;
    if (!broadcast.broadcast.dispatcher) return false;
    if (!broadcast.broadcast.dispatcher.resume) return false;
    if (!broadcast.broadcast.dispatcher.paused) return false;
    if (!broadcast.voice ||
        (broadcast.voice.channel.members.size === 1 &&
         broadcast.voice.channel.members.get(self.client.user.id))) {
      return false;
    }
    broadcast.broadcast.dispatcher.resume();
    return true;
  }

  /**
   * Search for a song to play based off user request.
   *
   * @private
   * @type {commandHandler}
   * @param {Discord~Message} msg The message that triggered command.
   * @listens SpikeyBot~Command#play
   */
  function commandPlay(msg) {
    if (msg.member.voice.channel === null) {
      reply(msg, 'You aren\'t in a voice channel!');
    } else {
      let song = msg.text;
      if (!song.startsWith(' ')) {
        reply(msg, 'Please specify a song to play.');
        return;
      } else {
        song = song.replace(' ', '');
      }
      if (!broadcasts[msg.guild.id]) {
        reply(msg, 'Loading ' + song + '\nPlease wait...')
            .then((msg) => msg.delete(10000));
        broadcasts[msg.guild.id] = {
          queue: [],
          skips: {},
          isPlaying: false,
        };
        enqueueSong(broadcasts[msg.guild.id], song, msg);
      } else {
        if (special[song]) {
          let embed = new self.Discord.MessageEmbed();
          embed.setTitle(
              'Enqueuing ' + song + ' [' +
              (broadcasts[msg.guild.id].queue.length + 1) + ' in queue]');
          embed.setColor([50, 200, 255]);
          msg.channel.send(mention(msg), embed);
          enqueueSong(broadcasts[msg.guild.id], song, msg);
        } else {
          let loadingMsg;
          reply(msg, 'Loading ' + song + '\nPlease wait...')
              .then((msg) => loadingMsg = msg);
          ytdl.getInfo(song, ytdlOpts, (err, info) => {
            if (err) {
              self.error(err.message.split('\n')[1]);
              reply(
                  msg,
                  'Oops, something went wrong while searching for that song!',
                  err.message.split('\n')[1]);
            } else if (info._duration_raw === 0) {
              reply(msg, 'Sorry, but I can\'t play live streams currently.');
            } else {
              if (broadcasts[msg.guild.id] &&
                  broadcasts[msg.guild.id].isPlaying) {
                let embed = formatSongInfo(info);
                embed.setTitle(
                    'Enqueuing ' + song + ' [' +
                    (broadcasts[msg.guild.id].queue.length + 1) + ' in queue]');
                msg.channel.send(mention(msg), embed);
                enqueueSong(broadcasts[msg.guild.id], song, msg, info);
              }
            }
            if (loadingMsg) loadingMsg.delete();
          });
        }
      }
    }
  }
  /**
   * Cause the bot to leave the voice channel and stop playing music.
   *
   * @private
   * @type {commandHandler}
   * @param {Discord~Message} msg The message that triggered the command.
   * @listens SpikeyBot~Command#leave
   * @listens SpikeyBot~Command#stop
   * @listens SpikeyBot~Command#stfu
   */
  function commandLeave(msg) {
    msg.guild.members.fetch(self.client.user).then((me) => {
      if (me.voice.channel) {
        let followMsg = follows[msg.guild.id] ?
            'No longer following <@' + follows[msg.guild.id] + '>' :
            null;
        delete follows[msg.guild.id];
        me.voice.channel.leave();
        reply(msg, 'Goodbye!', followMsg);
      } else {
        reply(msg, 'I\'m not playing anything.');
      }
    });
    delete broadcasts[msg.guild.id];
  }
  /**
   * Skip the currently playing song and continue to the next in the queue.
   *
   * @private
   * @type {commandHandler}
   * @param {Discord~Message} msg The message that triggered the command.
   * @listens SpikeyBot~Command#skip
   */
  function commandSkip(msg) {
    if (!broadcasts[msg.guild.id]) {
      reply(msg, 'I\'m not playing anything, I can\'t skip nothing!');
    } else {
      reply(msg, 'Skipping current song...');
      skipSong(broadcasts[msg.guild.id]);
    }
  }
  /**
   * Show the user what is in the queue.
   *
   * @private
   * @type {commandHandler}
   * @param {Discord~Message} msg The message that triggered the command.
   * @listens SpikeyBot~Command#queue
   * @listens SpikeyBot~Command#playing
   */
  function commandQueue(msg) {
    if (!broadcasts[msg.guild.id]) {
      reply(
          msg, 'I\'m not playing anything. Use "' + msg.prefix +
              'play Kokomo" to start playing something!');
    } else {
      let embed;
      if (broadcasts[msg.guild.id].current) {
        if (broadcasts[msg.guild.id].current.info) {
          embed = formatSongInfo(
              broadcasts[msg.guild.id].current.info,
              broadcasts[msg.guild.id].broadcast.dispatcher);
        } else {
          embed = new self.Discord.MessageEmbed();
          embed.setColor([50, 200, 255]);
          embed.setDescription(broadcasts[msg.guild.id].current.song);
        }
        embed.setTitle('Current Song Queue');
      } else {
        embed = new self.Discord.MessageEmbed();
      }
      if (broadcasts[msg.guild.id].queue.length > 0) {
        let queueDuration = 0;
        let queueExact = true;
        let queueString = broadcasts[msg.guild.id]
            .queue
            .map(function(obj, index) {
              if (obj.info) {
                queueDuration += obj.info._duration_raw;
                return (index + 1) + ') ' + obj.info.title;
              } else {
                queueExact = false;
                return (index + 1) + ') ' + obj.song;
              }
            })
            .join('\n');
        embed.addField(
            'Queue [' + (queueExact ? '' : '>') +
                formatPlaytime(queueDuration) + ']',
            queueString.substr(0, 1024));
      }
      msg.channel.send(embed);
    }
  }
  /**
   * Remove a song from the queue.
   *
   * @private
   * @type {commandHandler}
   * @param {Discord~Message} msg The message that triggered the command.
   * @listens SpikeyBot~Command#remove
   * @listens SpikeyBot~Command#dequeue
   */
  function commandRemove(msg) {
    if (!broadcasts[msg.guild.id] ||
        broadcasts[msg.guild.id].queue.length === 0) {
      reply(
          msg, 'The queue appears to be empty.\nI can\'t remove nothing ' +
              'from nothing!');
    } else {
      let indexString = msg.text;
      if (!indexString.startsWith(' ')) {
        reply(
            msg,
            'You must specify the index of the song to dequeue.\nYou can ' +
                'view the queue with "' + msg.prefix + 'queue".');
      } else {
        let index = Number(indexString.replace(' ', ''));
        if (typeof index !== 'number' || index <= 0 ||
            index > broadcasts[msg.guild.id].queue.length) {
          reply(msg, 'That is not a valid index!');
        } else {
          let removed = broadcasts[msg.guild.id].queue.splice(index - 1, 1)[0];
          reply(msg, 'Dequeued #' + index + ': ' + removed.info.title);
        }
      }
    }
  }
  /**
   * Search for a song's lyrics via Genius.
   *
   * @private
   * @type {commandHandler}
   * @param {Discord~Message} msg The message that triggered the command.
   * @listens SpikeyBot~Command#lyrics
   */
  function commandLyrics(msg) {
    let song = msg.text;
    if (song.length <= 1) {
      reply(msg, 'Please specify a song.');
      return;
    }
    song = song.replace(' ', '');
    let thisReq = geniusRequest;
    thisReq.path = '/search?q=' + encodeURIComponent(song);
    let req = https.request(thisReq, function(response) {
      let content = '';
      response.on('data', function(chunk) {
        content += chunk;
      });
      response.on('end', function() {
        if (response.statusCode == 200) {
          let parsed = JSON.parse(content);
          if (parsed.response.hits.length === 0) {
            reply(msg, '`Failed to find lyrics. No matches found.`');
          } else {
            reqLyricsURL(msg, parsed.response.hits[0].result.id);
          }
        } else {
          msg.channel.send(
              response.statusCode + '```json\n' +
              JSON.stringify(response.headers, null, 2) + '```\n```html\n' +
              content + '\n```');
        }
      });
      response.on('close', function() {
        self.warn('Genius request closed! ' + content.length);
      });
      response.on('error', function() {
        self.warn('Genius request errored! ' + content.length);
      });
    });
    req.end();
    req.on('error', function(e) {
      self.error(e);
    });
    msg.channel.send('`Loading...`').then((msg) => {
      msg.delete(30000);
    });
  }
  /**
   * Request the song information from Genius from previous search to find the
   * page where the lyrics are.
   *
   * @private
   * @param {Discord~Message} msg The message that triggered the command.
   * @param {string} id The id of the first song in the search results.
   */
  function reqLyricsURL(msg, id) {
    let thisReq = geniusRequest;
    thisReq.path = '/songs/' + id + '?text_format=plain';
    let req = https.request(thisReq, function(response) {
      let content = '';
      response.on('data', function(chunk) {
        content += chunk;
      });
      response.on('end', function() {
        if (response.statusCode == 200) {
          let parsed = JSON.parse(content);
          fetchLyricsPage(
              msg, parsed.response.song.url, parsed.response.song.full_title,
              parsed.response.song.song_art_image_thumbnail_url);
        } else {
          msg.channel.send(
              response.statusCode + '```json\n' +
              JSON.stringify(response.headers, null, 2) + '```\n```html\n' +
              content + '\n```');
        }
      });
      response.on('close', function() {
        self.warn('Genius request closed! ' + content.length);
      });
      response.on('error', function() {
        self.warn('Genius request errored! ' + content.length);
      });
    });
    req.end();
    req.on('error', function(e) {
      self.error(e);
    });
  }
  /**
   * Request the webpage that has the song lyrics on them from Genius.
   *
   * @private
   * @param {Discord~Message} msg The message that triggered the command.
   * @param {string} url The url of the page to request.
   * @param {string} title The song title for showing the user later.
   * @param {string} thumb The url of the album art thumbnail to show the user
   * later.
   */
  function fetchLyricsPage(msg, url, title, thumb) {
    let URL = url.match(/https:\/\/([^\/]*)(.*)/);
    const thisReq = {hostname: URL[1], path: URL[2], method: 'GET'};
    let req = https.request(thisReq, function(response) {
      let content = '';
      response.on('data', function(chunk) {
        content += chunk;
      });
      response.on('end', function() {
        if (response.statusCode == 200) {
          stripLyrics(msg, content, title, url, thumb);
        } else {
          msg.channel.send(
              response.statusCode + '```json\n' +
              JSON.stringify(response.headers, null, 2) + '```\n```html\n' +
              content + '\n```');
        }
      });
      response.on('close', function() {
        self.warn('Genius request closed! ' + content.length);
      });
      response.on('error', function() {
        self.warn('Genius request errored! ' + content.length);
      });
    });
    req.end();
    req.on('error', function(e) {
      self.error(e);
    });
  }
  /**
   * Crawl the received webpage for the data we need, then format the data and
   * show it to the user.
   *
   * @private
   * @param {Discord~Message} msg The message that triggered the command.
   * @param {string} content The entire page received.
   * @param {string} title The song title for showing the user.
   * @param {string} url The url of where we fetched the lyrics to show the
   * user.
   * @param {string} thumb The url of the album art thumbnail to show the user
   * later.
   */
  function stripLyrics(msg, content, title, url, thumb) {
    try {
      let body = content.match(/<!--sse-->([\s\S]*?)<!--\/sse-->/gm)[1];
      let lyrics = [];
      let matches = [];
      const regex = /<a[^>]*>([^<]*)<\/a>/gm;
      while (matches = regex.exec(body)) {
        lyrics.push(matches[1]);
      }
      let splitLyrics =
          lyrics.join('\n').match(/(\[[^\]]*\][^\[]*)/gm).slice(1);
      let embed = new self.Discord.MessageEmbed();
      if (title) embed.setTitle(title);
      if (url) embed.setURL(url);
      if (thumb) embed.setThumbnail(thumb);
      let numFields = 0;
      for (let i = 0; numFields < 25 && i < splitLyrics.length; i++) {
        let splitLine = splitLyrics[i].match(/\[([^\]]*)\]\n([^]*)/m);
        if (!splitLine) continue;
        let secTitle = splitLine[1].substr(0, 256);
        let secBody = splitLine[2];
        for (let j = 0; numFields < 25 && j * 1024 < secBody.length; j++) {
          embed.addField(
              j === 0 ? secTitle : (secTitle + ' continued...').substr(0, 256),
              secBody.substr(j * 1024, 1024) || '\u200B', true);
          numFields++;
        }
      }
      embed.setColor([0, 255, 255]);
      msg.channel.send(embed).catch((err) => {
        console.log(err);
        msg.channel.send(
            '`Something went wrong while formatting the lyrics.' +
            '\nHere is the link to the page I found:`\n' + url);
      });
    } catch (err) {
      console.log(err);
      msg.channel.send(
          '`Something went wrong while formatting the lyrics.' +
          '\nHere is the link to the page I found:`\n' + url);
    }
  }

  /**
   * Join a voice channel and record the specified users audio to a file on this
   * server.
   *
   * @private
   * @type {commandHandler}
   * @param {Discord~Message} msg The message that triggered the command.
   * @listens SpikeyBot~Command#record
   */
  function commandRecord(msg) {
    if (msg.member.voice.channel === null) {
      reply(msg, 'You aren\'t in a voice channel!');
      return;
    }
    const filename = 'recordings/' + encodeURIComponent(
        msg.member.voice.channel.id + '_' +
                                         formatDateTime(Date.now())) +
        '.ogg';
    const url = self.common.webURL + filename;
    if (msg.mentions.users.size === 0) {
      reply(
          msg, 'Recording everyone in voice channel. Type ' + msg.prefix +
              'stop to stop',
          url);
    } else {
      reply(
          msg, 'Only recording ' +
              msg.mentions.users
                  .map(function(obj) {
                    return '`' + obj.username.replaceAll('`', '\\`') + '`';
                  })
                  .join(', '),
          url);
    }
    let streams = {};
    let file = fs.createWriteStream(filename);
    file.on('close', () => {
      msg.channel.send('Saved to ' + url);
    });
    listen = function(user, receiver, conn) {
      if (streams[user.id] ||
          (msg.mentions.users.size > 0 && !msg.mentions.users.get(user.id))) {
        return;
      }
      let stream =
          receiver.createStream(msg.author, {end: 'manual', mode: 'pcm'});
      streams[user.id] = stream;
      // stream.pipe(file);
      Music.streamToOgg(stream, file);
      /* conn.on('disconnect', () => {
        stream.destroy();
      }); */
    };
    msg.member.voice.channel.join()
        .then((conn) => {
          // Timeout and sound are due to current Discord bug requiring bot to
          // play sound for 0.1s before being able to receive audio.
          conn.play('./sounds/plink.ogg');
          self.client.setTimeout(() => {
            let receiver = conn.receiver;
            msg.member.voice.channel.members.forEach(function(member) {
              listen(member.user, receiver, conn);
            });
            conn.on('speaking', (user, speaking) => {
              if (speaking) {
                listen(user, receiver, conn);
              }
            });
          }, 100);
        })
        .catch((err) => {
          reply(msg, 'I am unable to join your voice channel.', err.message);
        });
  }

  /**
   * Follow a user as they change voice channels.
   *
   * @private
   * @type {commandHandler}
   * @param {Discord~Message} msg The message that triggered command.
   * @listens SpikeyBot~Command#join
   */
  function commandFollow(msg) {
    if (msg.mentions.users.size > 0) {
      let targetMember = msg.mentions.members.first();
      let target = targetMember.id;
      if (follows[msg.guild.id]) {
        if (follows[msg.guild.id] === target) {
          delete follows[msg.guild.id];
          self.common.reply(
              msg, 'I will no longer follow ' + targetMember.user.username +
                  ' to new voice channels.');
          if (targetMember.voice.channel) {
            targetMember.voice.channel.join().catch(() => {});
          }
        } else {
          self.common.reply(
              msg, 'I will follow ' + targetMember.user.username +
                  ' into new voice channels.\nType ' +
                  self.bot.getPrefix(msg.guild.id) +
                  'follow to make me stop following you.',
              'I will no longer follow <@' + follows[msg.guild.id] + '>');
          follows[msg.guild.id] = target;
        }
      } else {
        follows[msg.guild.id] = target;
        self.common.reply(
            msg, 'When ' + targetMember.user.username +
                ' changes voice channels, I will follow them and continue ' +
                'playing music.\nType ' + self.bot.getPrefix(msg.guild.id) +
                'follow to make me stop following you.');
        if (targetMember.voice.channel) {
          targetMember.voice.channel.join().catch(() => {});
        }
      }
      return;
    }
    if (follows[msg.guild.id]) {
      if (follows[msg.guild.id] == msg.member.id) {
        delete follows[msg.guild.id];
        self.common.reply(
            msg, 'I will no longer follow you to new voice channels.');
        if (msg.member.voice.channel) {
          msg.member.voice.channel.join().catch(() => {});
        }
      } else {
        self.common.reply(
            msg, 'I will follow you into new voice channels.\nType ' +
                self.bot.getPrefix(msg.guild.id) +
                'follow to make me stop following you.',
            'I will no longer follow <@' + follows[msg.guild.id] + '>');
        follows[msg.guild.id] = memberId;
      }
    } else {
      follows[msg.guild.id] = msg.member.id;
      self.common.reply(
          msg,
          'When you change voice channels, I will follow you and continue ' +
              'playing music.\nType ' + self.bot.getPrefix(msg.guild.id) +
              'follow to make me stop following you.');
      if (msg.member.voice.channel) {
        msg.member.voice.channel.join().catch(() => {});
      }
    }
  }

  /**
   * Formats a given date into a datestring.
   *
   * @private
   * @param {?Date|number|string} date The date that Date() can accept.
   * @return {string} The formatted datetime.
   */
  function formatDateTime(date) {
    const d = new Date(date);
    return monthToShort(d.getUTCMonth()) + '-' + d.getUTCDate() + '-' +
        d.getUTCFullYear() + '_at_' + d.getUTCHours() + '-' +
        ('0' + d.getUTCMinutes()).slice(-2) + '-' +
        ('0' + d.getUTCSeconds()).slice(-2) + '_UTC';
  }

  /**
   * Convert the month number to a 3 letter string of the month's name.
   *
   * @private
   * @param {number} month The month number (1-12).
   * @return {string} The 3 character string.
   */
  function monthToShort(month) {
    return [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct',
      'Nov', 'Dec',
    ][month];
  }

  /**
   * Show statistics about current music broadcasts.
   *
   * @private
   * @type {commandHandler}
   * @param {Discord~Message} msg The message that triggered command.
   * @listens SpikeyBot~Command#musicstats
   */
  function commandStats(msg) {
    let queueLength = 0;
    let bList = Object.entries(broadcasts);
    let longestChannel;
    let isPaused;
    let pauseTime;

    bList.forEach((el) => {
      let qDuration = 0;
      if (el[1].current && el[1].current.info) {
        qDuration += el[1].current.info._duration_raw -
            Math.round(
                (el[1].broadcast.dispatcher.streamTime -
                 el[1].broadcast.dispatcher.pausedTime) /
                1000);
      }
      el[1].queue.forEach((q) => {
        if (!q.info) return;
        qDuration += q.info._duration_raw;
      });
      if (qDuration > queueLength) {
        queueLength = qDuration;
        isPaused = el[1].broadcast.dispatcher.paused;
        pauseTime = el[1].broadcast.dispatcher.pausedTime;
        longestChannel = el[1].voice.channel.id;
      }
    });

    if (queueLength) {
      self.common.reply(
          msg, 'I am currently playing music for ' + bList.length +
              ' channels.\nThe longest queue has a length of ' +
              formatPlaytime(queueLength) + (isPaused ? ' (paused)' : '') + '.',
          msg.author.id === self.common.spikeyId ?
              (longestChannel + ' paused for ' + pauseTime) :
              null);
    } else {
      self.common.reply(
          msg,
          'I am currently playing music for ' + bList.length + ' channels.');
    }
  }

  /**
   * Change the volume of the current music stream.
   *
   * @private
   * @type {commandHandler}
   * @param {Discord~Message} msg The message that triggered command.
   * @listens SpikeyBot~Command#volume
   * @listens SpikeyBot~Command#vol
   * @listens SpikeyBot~Command#v
   */
  function commandVolume(msg) {
    if (!broadcasts[msg.guild.id]) {
      self.common.reply(msg, 'Nothing is playing!');
    } else if (!msg.text) {
      self.common.reply(
          msg,
          'Volume is at ' + (getVolume(broadcasts[msg.guild.id]) * 100) + '%',
          'Specify a percentage to change the volume.');
    } else {
      let newVol = msg.text.match(/[0-9]*\.?[0-9]+/);
      if (!newVol) {
        self.common.reply(
            msg, 'Sorry, but I wasn\'t sure what volume to set to that.');
      } else {
        if ((newVol + '').indexOf('.') < 0) {
          newVol /= 100;
        }
        if (changeVolume(broadcasts[msg.guild.id], newVol)) {
          self.common.reply(msg, 'Changed volume to ' + (newVol * 100) + '%.');
        } else {
          self.common.reply(
              msg, 'Oops! I wasn\'t able to change the volume to ' +
                  (newVol * 100) + '%.');
        }
      }
    }
  }

  /**
   * Change the volume of the current broadcast.
   *
   * @private
   * @param {Music~Broadcast} broadcast The objected storing the current
   * broadcast information.
   * @param {number} percentage The volume percentage to set to. 0.5 is half, 2
   * is double.
   * @return {boolean} True if success, false if something went wrong.
   */
  function changeVolume(broadcast, percentage) {
    if (!broadcast) return false;
    if (!broadcast.broadcast) return false;
    if (!broadcast.broadcast.dispatcher) return false;
    if (!broadcast.broadcast.dispatcher.setVolume) return false;
    try {
      broadcast.broadcast.dispatcher.setVolumeLogarithmic(percentage);
    } catch (err) {
      self.error('Failed to change volume to ' + percentage);
      console.error(err);
      return false;
    }
    return true;
  }

  /**
   * Get the volume of the current broadcast.
   *
   * @private
   * @param {Music~Broadcast} broadcast The objected storing the current
   * broadcast information.
   * @return {?number} The logarithmic volume percentage. 0.5 is half, 2 is
   * double. Null if error.
   */
  function getVolume(broadcast) {
    if (!broadcast) return null;
    if (!broadcast.broadcast) return null;
    if (!broadcast.broadcast.dispatcher) return null;
    return broadcast.broadcast.dispatcher.volumeLogarithmic;
  }
}

/**
 * Coverts an incoming Opus stream to a ogg format and writes it to file.
 *
 * @param {ReadableStream} input The opus stream from Discord.
 * @param {WritableStream} file The file stream we are writing to.
 */
Music.streamToOgg = function(input, file) {
  const opusEncoder = new opus.Encoder();
  const oggEncoder = new ogg.Encoder();
  input.pipe(opusEncoder).pipe(oggEncoder.stream());
  oggEncoder.pipe(file);
};

module.exports = new Music();
