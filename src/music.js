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
 * @listens Command#play
 * @listens Command#pause
 * @listens Command#resume
 * @listens Command#leave
 * @listens Command#stop
 * @listens Command#stfu
 * @listens Command#skip
 * @listens Command#q
 * @listens Command#queue
 * @listens Command#playing
 * @listens Command#remove
 * @listens Command#dequeue
 * @listens Command#lyrics
 * @listens Command#record
 * @listens Command#follow
 * @listens Command#unfollow
 * @listens Command#stalk
 * @listens Command#unstalk
 * @listens Command#musicstats
 * @listens Command#volume
 * @fires Command#stop
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
  const broadcasts = {};

  /**
   * The current user IDs of the users to follow into new voice channels. This
   * is mapped by guild id.
   *
   * @private
   * @type {Object.<string>}
   */
  const follows = {};

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
   * Options to pass into the primary stream dispatcher (The one in charge of
   * volume control).
   * [StreamOptions](
   * https://discord.js.org/#/docs/main/master/typedef/StreamOptions)
   *
   * @private
   * @constant
   * @type {Discord~StreamOptions}
   * @default
   */
  const primaryStreamOptions = {
    passes: 1,
    fec: true,
    bitrate: 'auto',
    volume: 0.5,
    plp: 0.0,
    highWaterMark: 1,
  };
  /**
   * Options to pass into the secondary stream dispatcher (The one buffering for
   * Discord).
   * [StreamOptions](
   * https://discord.js.org/#/docs/main/master/typedef/StreamOptions)
   *
   * @private
   * @constant
   * @type {Discord~StreamOptions}
   * @default
   */
  const secondaryStreamOptions = {
    passes: 2,
    fec: true,
    bitrate: 'auto',
    volume: 0.5,
    plp: 0.05,
    highWaterMark: 30,
  };

  /** @inheritdoc */
  this.helpMessage = 'Loading...';

  /**
   * The object that stores all data to be formatted into the help message.
   *
   * @private
   * @constant
   */
  const helpObject = JSON.parse(fs.readFileSync('./docs/musicHelp.json'));

  /** @inheritdoc */
  this.initialize = function() {
    self.command.on('join', commandJoin, true);
    self.command.on('play', commandPlay, true);
    self.command.on('pause', commandPause, true);
    self.command.on('resume', commandResume, true);
    self.command.on(['leave', 'stop', 'stfu'], commandLeave, true);
    self.command.on('skip', commandSkip, true);
    self.command.on(['queue', 'q', 'playing'], commandQueue, true);
    self.command.on(['remove', 'dequeue'], commandRemove, true);
    self.command.on('lyrics', commandLyrics);
    self.command.on('record', commandRecord, true);
    self.command.on(
        ['follow', 'unfollow', 'stalk', 'stalkme'], commandFollow, true);
    self.command.on('musicstats', commandStats);
    self.command.on(['volume', 'vol', 'v'], commandVolume, true);
    self.command.on(['clear', 'empty'], commandClearQueue, true);

    self.command.on('kokomo', (msg) => {
      msg.content = msg.prefix + 'play kokomo';
      self.command.trigger(msg);
    });
    self.command.on('vi', (msg) => {
      msg.content = msg.prefix + 'play nice try vi';
      self.command.trigger(msg);
    });
    self.command.on('airhorn', (msg) => {
      msg.content = msg.prefix + 'play airhorn';
      self.command.trigger(msg);
    });
    self.command.on('rickroll', (msg) => {
      msg.content = msg.prefix + 'play rickroll';
      self.command.trigger(msg);
    });

    self.client.on('voiceStateUpdate', handleVoiceStateUpdate);

    // Format help message into rich embed.
    const tmpHelp = new self.Discord.MessageEmbed();
    tmpHelp.setTitle(
        helpObject.title.replaceAll('{prefix}', self.bot.getPrefix()));
    tmpHelp.setURL(self.common.webURL);
    tmpHelp.setDescription(
        helpObject.description.replaceAll('{prefix}', self.bot.getPrefix()));
    helpObject.sections.forEach(function(obj) {
      const titleID = encodeURIComponent(obj.title);
      const titleURL = '[web](' + self.common.webHelp + '#' + titleID + ')';
      tmpHelp.addField(
          obj.title, titleURL + '```js\n' +
              obj.rows
                  .map(function(row) {
                    if (typeof row === 'string') {
                      return self.bot.getPrefix() +
                          row.replaceAll('{prefix}', self.bot.getPrefix());
                    } else if (typeof row === 'object') {
                      return self.bot.getPrefix() +
                          row.command.replaceAll(
                              '{prefix}', self.bot.getPrefix()) +
                          ' // ' +
                          row.description.replaceAll(
                              '{prefix}', self.bot.getPrefix());
                    }
                  })
                  .join('\n') +
              '\n```',
          true);
    });
    tmpHelp.setFooter(
        'Note: If a custom prefix is being used, replace `' +
        self.bot.getPrefix() +
        '` with the custom prefix.\nNote 2: Custom prefixes will not have a ' +
        'space after them.');
    self.helpMessage = tmpHelp;
  };

  /** @inheritdoc */
  this.shutdown = function() {
    self.command.deleteEvent('join');
    self.command.deleteEvent('play');
    self.command.deleteEvent('pause');
    self.command.deleteEvent('resume');
    self.command.deleteEvent('leave');
    self.command.deleteEvent('skip');
    self.command.deleteEvent('q');
    self.command.deleteEvent('remove');
    self.command.deleteEvent('lyrics');
    self.command.deleteEvent('record');
    self.command.deleteEvent('kokomo');
    self.command.deleteEvent('vi');
    self.command.deleteEvent('airhorn');
    self.command.deleteEvent('rickroll');
    self.command.deleteEvent('follow');
    self.command.deleteEvent('musicstats');
    self.command.deleteEvent('volume');
    self.command.deleteEvent('clear');

    self.client.removeListener('voiceStateUpdate', handleVoiceStateUpdate);

    for (const b in broadcasts) {
      if (broadcasts[b] && broadcasts[b].voice) {
        try {
          broadcasts[b].voice.disconnect();
        } catch (err) {
          self.error(
              'Failed to disconenct from voice channel: ' +
                  broadcasts[b].voice &&
              broadcasts[b].voice.channel.id);
          console.error(err);
        }
      }
    }
  };

  /** @inheritdoc */
  this.save = function(opt) {
    if (!self.initialized) return;
    // Purge broadcasts that have been paused for more than 15 minutes.
    const entries = Object.entries(broadcasts);
    const now = Date.now();
    for (let i = 0; i < entries.length; i++) {
      if (!entries[i][1].broadcast || !entries[i][1].broadcast.dispatcher) {
        delete broadcasts[entries[i][0]];
        continue;
      }
      const pauseTime = entries[i][1].broadcast.dispatcher.pausedSince;
      if (pauseTime && now - pauseTime > 15 * 60 * 1000) {
        self.debug(entries[i][0] + ' purged: ' + (now - pauseTime));
        if (entries[i][1].voice && entries[i][1].voice.disconnect) {
          entries[i][1].voice.disconnect();
        }
        delete broadcasts[entries[i][0]];
      }
    }
  };

  /** @inheritdoc */
  this.unloadable = function() {
    // If a broadcast has been paused for more than 5 minutes, it is okay to
    // reload this submodule.
    const entries = Object.entries(broadcasts);
    let numAlive = entries.length;
    const now = Date.now();
    for (let i = 0; i < entries.length; i++) {
      if (!entries[i][1].broadcast || !entries[i][1].broadcast.dispatcher) {
        continue;
      }
      const pauseTime = entries[i][1].broadcast.dispatcher.pausedSince;
      if (pauseTime && now - pauseTime > 5 * 60 * 1000) {
        numAlive--;
      }
    }
    return numAlive <= 0;
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
    const broadcast = broadcasts[oldState.guild.id];
    if (broadcast) {
      if (oldState.id === self.client.user.id && !newState.channel) {
        self.error(
            'Forcibly ejected from voice channel: ' + oldState.guild.id + ' ' +
            oldState.channelID);
        delete broadcasts[oldState.guild.id];
        if (broadcast.request && broadcast.request.channel) {
          broadcast.request.channel.send(
              '`I was forcibly ejected from the voice channel for an unknown ' +
              'reason!`');
        }
        return;
      }
      if (oldState.channel && oldState.channel.members) {
        const numMembers =
            oldState.channel.members.filter((el) => !el.user.bot).size;
        if (numMembers === 0 &&
            oldState.channel.members.get(self.client.user.id)) {
          if (broadcast.subjugated) {
            if (broadcast.voice) broadcast.voice.disconnect();
            delete broadcasts[oldState.guild.id];
            return;
          } else if (pauseBroadcast(broadcast)) {
            if (broadcast.current.request &&
                broadcast.current.request.channel) {
              const prefix = self.bot.getPrefix(oldState.guild.id);
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
            broadcast.voice.play(broadcast.broadcast, secondaryStreamOptions);
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
   * @param {number} [seek=0] The offset to add to totalStreamTime to correct
   * for starting playback somewhere other than the beginning.
   * @return {Discord~MessageEmbed} The formatted song info.
   */
  function formatSongInfo(info, dispatcher, seek) {
    if (!seek) seek = 0;
    let remaining = '';
    let currentTime = '';
    if (dispatcher) {
      currentTime = '[' + formatPlaytime(
          Math.round(
              ((seek * 1000 + dispatcher.totalStreamTime) -
                                   dispatcher.pausedTime) /
                                  1000)) +
          '] / ';
      remaining = ' (' +
          formatPlaytime(getRemainingSeconds(info, dispatcher) - seek) +
          ' left)';
    }
    const output = new self.Discord.MessageEmbed();
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
   * Get the current progress into the song in the given context.
   *
   * @public
   * @param {Discord~Message} msg The context to use to fetch the info.
   * @return {?number} Time in seconds, or null if nothing is playing.
   */
  this.getProgress = function(msg) {
    const broadcast = broadcasts[msg.guild.id];
    if (!broadcast) return null;
    if (!broadcast.broadcast) return null;
    if (!broadcast.broadcast.dispatcher) return null;
    return Math.round(
        ((broadcast.broadcast.dispatcher.totalStreamTime || 0) -
                (broadcast.broadcast.dispatcher.pausedTime || 0)) /
               1000) +
        (broadcast.current.seek || 0);
  };

  /**
   * Get the song's length of the song playing in the given context.
   *
   * @public
   * @param {Discord~Message} msg The context to use to fetch the info.
   * @return {?number} Time in seconds, or null if nothing is playing.
   */
  this.getDuration = function(msg) {
    const broadcast = broadcasts[msg.guild.id];
    if (!broadcast) return null;
    if (!broadcast.current) return null;
    if (!broadcast.current.info) return null;
    return broadcast.current.info._duration_raw;
  };

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
    const numString = (num + '');
    const tmpString = [];
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
   * @param {Object} [info] The info from ytdl about the song.
   * @param {number} [seek=0] The number of seconds into a song to start
   * playing.
   * @fires Command#stop
   */
  function enqueueSong(broadcast, song, msg, info, seek) {
    broadcast.queue.push({request: msg, song: song, info: info, seek: seek});
    if (broadcast.voice && broadcast.voice.channel) {
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
      if (!broadcast.subjugated) {
        self.client.setTimeout(function() {
          if (broadcast.voice) broadcast.voice.disconnect();
          delete broadcasts[broadcast.current.request.guild.id];
        }, 500);
        broadcast.current.request.channel.send('`Queue is empty!`');
      }
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

    if (broadcast.current.info) {
      if (!broadcast.subjugated && broadcast.current.request) {
        const embed = formatSongInfo(broadcast.current.info);
        embed.setTitle(
            'Now playing [' + broadcast.queue.length + ' left in queue]');
        broadcast.current.request.channel.send(embed);
      }
      broadcast.current.oninfo = function(info) {
        broadcast.isLoading = false;
      };
    } else {
      if (special[broadcast.current.song]) {
        if (!special[broadcast.current.song].url) {
          broadcast.isLoading = false;
          if (!broadcast.subjugated && broadcast.current.request) {
            const embed = new self.Discord.MessageEmbed();
            embed.setTitle(
                'Now playing [' + broadcast.queue.length + ' left in queue]');
            embed.setColor([50, 200, 255]);
            embed.setDescription(broadcast.current.song);
            broadcast.current.request.channel.send(embed);
          }
        } else {
          ytdl.getInfo(
              special[broadcast.current.song].url, ytdlOpts, (err, info) => {
                broadcast.isLoading = false;
                if (err) {
                  self.error(err.message.split('\n')[1]);
                  if (broadcast.current.request) {
                    broadcast.current.request.channel.send(
                        '```Oops, something went wrong while getting info ' +
                        'for this song!```\n' + err.message.split('\n')[1]);
                  }
                } else {
                  broadcast.current.info = info;
                  if (!broadcast.subjugated && broadcast.current.request) {
                    const embed = formatSongInfo(broadcast.current.info);
                    embed.setTitle(
                        'Now playing [' + broadcast.queue.length +
                        ' left in queue]');
                    broadcast.current.request.channel.send(embed);
                  }
                }
              });
        }
      } else {
        broadcast.current.oninfo = function(info) {
          broadcast.isLoading = false;
          broadcast.current.info = info;
          if (!broadcast.subjugated && broadcast.current.request) {
            const embed = formatSongInfo(broadcast.current.info);
            embed.setTitle(
                'Now playing [' + broadcast.queue.length + ' left in queue]');
            broadcast.current.request.channel.send(embed);
          }
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
    if (!broadcast.voice || !broadcast.voice.channel) return;
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
      if (broadcast.dispatcher) broadcast.dispatcher.destroy();
      if (broadcast.broadcast && broadcast.broadcast.dispatcher) {
        broadcast.broadcast.dispatcher.destroy();
      }
    }

    // Setup readable stream for audio data.
    broadcast.current.readable = new Readable();
    broadcast.current.readable._read = function() {};
    broadcast.broadcast = self.client.createVoiceBroadcast();
    primaryStreamOptions.seek = broadcast.current.seek;

    broadcast.broadcast.play(broadcast.current.readable, primaryStreamOptions);
    broadcast.dispatcher =
        broadcast.voice.play(broadcast.broadcast, secondaryStreamOptions);

    broadcast.broadcast.dispatcher.on('end', function() {
      endSong(broadcast);
    });
    broadcast.broadcast.dispatcher.on('close', function() {
      endSong(broadcast);
    });

    broadcast.dispatcher.on('error', function(err) {
      self.error('Error in starting broadcast: ' + broadcast.current.song);
      console.log(err);
      if (broadcast.current.request) {
        broadcast.current.request.channel.send(
            '```An error occured while attempting to play ' +
            broadcast.current.song + '.```');
      }
      broadcast.isLoading = false;
      skipSong(broadcast);
    });

    // Spawn thread for starting audio stream.
    const input = {
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
      self.error('Error in thread: ' + broadcast.current.song);
      console.log(err);
      if (broadcast.current.request) {
        broadcast.current.request.channel.send(
            '```An error occured while attempting to play ' +
            broadcast.current.song + '.```');
      }
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
   * Skip the current song with the given context.
   *
   * @public
   * @param {Discord~Message} msg The context storing guild information for
   * looking up.
   */
  this.skipSong = function(msg) {
    if (!broadcasts[msg.guild.id]) return;
    skipSong(broadcasts[msg.guild.id]);
  };

  /**
   * Join a voice channel that the user is in.
   *
   * @private
   * @type {commandHandler}
   * @param {Discord~Message} msg The message that triggered command.
   * @listens Command#join
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
   * @listens Command#pause
   */
  function commandPause(msg) {
    if (!broadcasts[msg.guild.id]) {
      self.common.reply(msg, 'Nothing is playing!');
    } else if (!broadcasts[msg.guild.id].dispatcher) {
      self.common.reply(msg, 'Nothing is playing!');
    } else if (
      broadcasts[msg.guild.id] && broadcasts[msg.guild.id].subjugated) {
      reply(msg, 'Music is currently being controlled automatically.');
    } else {
      if (pauseBroadcast(broadcasts[msg.guild.id])) {
        self.common.reply(msg, 'Music paused.');
      } else {
        self.common.reply(msg, 'Music was already paused!');
      }
    }
  }

  /**
   * Attempt to pause the current broadcast in a guild.
   *
   * @public
   * @param {Discord~Message} msg The context to lookup guild info.
   * @return {boolean} True if success, false if failed.
   */
  this.pause = function(msg) {
    return pauseBroadcast(broadcasts[msg.guild.id]);
  };

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
   * @listens Command#resume
   */
  function commandResume(msg) {
    if (!broadcasts[msg.guild.id]) {
      self.common.reply(msg, 'Nothing is playing!');
    } else if (!broadcasts[msg.guild.id].dispatcher) {
      self.common.reply(msg, 'Nothing is playing!');
    } else if (
      broadcasts[msg.guild.id] && broadcasts[msg.guild.id].subjugated) {
      reply(msg, 'Music is currently being controlled automatically.');
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
   * Attempt to resume the current broadcast in a guild.
   *
   * @public
   * @param {Discord~Message} msg The context to lookup guild info.
   * @return {boolean} True if success, false if failed.
   */
  this.resume = function(msg) {
    return resumeBroadcast(broadcasts[msg.guild.id]);
  };

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
   * @listens Command#play
   */
  function commandPlay(msg) {
    if (broadcasts[msg.guild.id] && broadcasts[msg.guild.id].subjugated) {
      reply(msg, 'Music is currently being controlled automatically.');
    } else if (msg.member.voice.channel === null) {
      reply(msg, 'You aren\'t in a voice channel!');
    } else {
      let song = msg.text;
      let seek = 0;
      if (!song.startsWith(' ')) {
        reply(msg, 'Please specify a song to play.');
        return;
      } else {
        seek = song.match(/&& seek\D*(\d+)\D*$/);
        if (seek) seek = seek[1];
        song = song.replace(/^\s|\s*&&\s*seek.*$/g, '');
      }
      self.playSong(msg, song, seek);
    }
  }

  /**
   * Start playing or enqueue the requested song.
   *
   * @public
   * @param {Discord~Message} msg The message that triggered command, used for
   * context.
   * @param {string} song The song search criteria.
   * @param {number} [seek] The time in seconds to seek to.
   * @param {?boolean} [subjugate] Force all control be via external sources
   * using public function calls. All queue control commands are disabled. Also
   * suppresses most information messages that would otherwise be sent to the
   * user. Null means leave as current value.
   */
  this.playSong = function(msg, song, seek, subjugate) {
    if (!broadcasts[msg.guild.id]) {
      if (!subjugate) {
        self.common.reply(msg, 'Loading ' + song + '\nPlease wait...')
            .then((msg) => msg.delete({timeout: 10000}));
      }
      broadcasts[msg.guild.id] = {
        queue: [],
        skips: {},
        isPlaying: false,
        subjugated: subjugate || false,
      };
      enqueueSong(broadcasts[msg.guild.id], song, msg, null, seek);
    } else {
      if (subjugate != null) {
        broadcasts[msg.guild.id].subjugated = subjugate;
      }
      if (special[song]) {
        if (!broadcasts[msg.guild.id].subjugated) {
          const embed = new self.Discord.MessageEmbed();
          embed.setTitle(
              'Enqueuing ' + song + ' [' +
              (broadcasts[msg.guild.id].queue.length + 1) + ' in queue]');
          embed.setColor([50, 200, 255]);
          msg.channel.send(mention(msg), embed);
        }
        enqueueSong(broadcasts[msg.guild.id], song, msg, null, seek);
      } else {
        let loadingMsg;
        if (!broadcasts[msg.guild.id].subjugated) {
          reply(msg, 'Loading ' + song + '\nPlease wait...')
              .then((msg) => loadingMsg = msg);
        }
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
                (broadcasts[msg.guild.id].isPlaying ||
                 broadcasts[msg.guild.id].subjugated)) {
              if (!broadcasts[msg.guild.id].subjugated) {
                const embed = formatSongInfo(info);
                embed.setTitle(
                    'Enqueuing ' + song + ' [' +
                    (broadcasts[msg.guild.id].queue.length + 1) + ' in queue]');
                msg.channel.send(mention(msg), embed);
              }
              enqueueSong(broadcasts[msg.guild.id], song, msg, info, seek);
            }
          }
          if (loadingMsg) loadingMsg.delete();
        });
      }
    }
  };

  /**
   * Release subjugation. Does not modify any current queue or playing
   * information.
   *
   * @public
   * @param {Discord~Message} msg The context to lookup the information.
   */
  this.release = function(msg) {
    if (broadcasts[msg.guild.id]) {
      broadcasts[msg.guild.id].subjugated = false;
    }
  };

  /**
   * Begin subjugation. Does not modify any current queue or playing
   * information.
   *
   * @public
   * @param {Discord~Message} msg The context to lookup the information.
   */
  this.subjugate = function(msg) {
    if (broadcasts[msg.guild.id]) {
      broadcasts[msg.guild.id].subjugated = true;
    }
  };

  /**
   * Check if music is being subjugated by another script.
   *
   * @public
   * @param {Discord~Message} msg The context to lookup the information.
   * @return {?boolean} Null if nothing is playing, true if subjugated, false if
   * not subjugated.
   */
  this.isSubjugated = function(msg) {
    if (broadcasts[msg.guild.id]) {
      return broadcasts[msg.guild.id].subjugated;
    } else {
      return null;
    }
  };

  /**
   * Cause the bot to leave the voice channel and stop playing music.
   *
   * @private
   * @type {commandHandler}
   * @param {Discord~Message} msg The message that triggered the command.
   * @listens Command#leave
   * @listens Command#stop
   * @listens Command#stfu
   */
  function commandLeave(msg) {
    if (msg.guild.me.voice.channel) {
      const followMsg = follows[msg.guild.id] ?
          'No longer following <@' + follows[msg.guild.id] + '>' :
          null;
      delete follows[msg.guild.id];
      msg.guild.me.voice.channel.leave();
      reply(msg, 'Goodbye!', followMsg);
    } else {
      reply(msg, 'I\'m not playing anything.');
    }
    delete broadcasts[msg.guild.id];
  }
  /**
   * Skip the currently playing song and continue to the next in the queue.
   *
   * @private
   * @type {commandHandler}
   * @param {Discord~Message} msg The message that triggered the command.
   * @listens Command#skip
   */
  function commandSkip(msg) {
    if (!broadcasts[msg.guild.id]) {
      reply(msg, 'I\'m not playing anything, I can\'t skip nothing!');
    } else if (
      broadcasts[msg.guild.id] && broadcasts[msg.guild.id].subjugated) {
      reply(msg, 'Music is currently being controlled automatically.');
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
   * @listens Command#q
   * @listens Command#queue
   * @listens Command#playing
   */
  function commandQueue(msg) {
    if (!broadcasts[msg.guild.id]) {
      reply(
          msg, 'I\'m not playing anything. Use "' + msg.prefix +
              'play Kokomo" to start playing something!');
    } else if (msg.text.trim().match(/^clear|^empty|^reset/)) {
      commandClearQueue(msg);
    } else {
      let embed;
      if (broadcasts[msg.guild.id].current) {
        if (broadcasts[msg.guild.id].current.info) {
          embed = formatSongInfo(
              broadcasts[msg.guild.id].current.info,
              broadcasts[msg.guild.id].broadcast.dispatcher,
              broadcasts[msg.guild.id].current.seek);
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
        const queueString = broadcasts[msg.guild.id]
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
   * Removes all songs from the current queue except for the currently playing
   * song.
   * @private
   *
   * @type {commandHandler}
   * @param {Discord~Message} msg The message that triggered the command.
   * @listens Command#clear
   * @listens Command#empty
   */
  function commandClearQueue(msg) {
    if (broadcasts[msg.guild.id] && broadcasts[msg.guild.id].subjugated) {
      reply(msg, 'Music is currently being controlled automatically.');
    } else if (!broadcasts[msg.guild.id] ||
        broadcasts[msg.guild.id].queue.length === 0) {
      reply(
          msg, 'The queue appears to be empty.\nI can\'t remove nothing ' +
              'from nothing!');
    } else {
      self.clearQueue(msg);
      reply(msg, 'All songs removed from queue.');
    }
  }

  /**
   * Empty a guild's current music queue.
   * @public
   *
   * @param {Discord~Message} msg The context for looking up the guild queue to
   * modify.
   */
  this.clearQueue = function(msg) {
    if (!broadcasts[msg.guild.id]) return;
    broadcasts[msg.guild.id].queue = [];
  };
  /**
   * Remove a song from the queue.
   *
   * @private
   * @type {commandHandler}
   * @param {Discord~Message} msg The message that triggered the command.
   * @listens Command#remove
   * @listens Command#dequeue
   */
  function commandRemove(msg) {
    if (broadcasts[msg.guild.id] && broadcasts[msg.guild.id].subjugated) {
      reply(msg, 'Music is currently being controlled automatically.');
    } else if (!broadcasts[msg.guild.id] ||
        broadcasts[msg.guild.id].queue.length === 0) {
      reply(
          msg, 'The queue appears to be empty.\nI can\'t remove nothing ' +
              'from nothing!');
    } else {
      const indexString = msg.text;
      if (!indexString.startsWith(' ')) {
        reply(
            msg,
            'You must specify the index of the song to dequeue, or "all".\nYo' +
                'u can view the queue with "' + msg.prefix + 'queue".');
      } else {
        if (indexString.trim().match(/^all|^everything/)) {
          commandClearQueue(msg);
          return;
        }
        const index = Number(indexString.replace(' ', ''));
        if (typeof index !== 'number' || index <= 0 ||
            index > broadcasts[msg.guild.id].queue.length) {
          reply(msg, 'That is not a valid index!');
        } else {
          const removed =
              broadcasts[msg.guild.id].queue.splice(index - 1, 1)[0];
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
   * @listens Command#lyrics
   */
  function commandLyrics(msg) {
    let song = msg.text;
    if (song.length <= 1) {
      reply(msg, 'Please specify a song.');
      return;
    }
    song = song.replace(' ', '');
    const thisReq = geniusRequest;
    thisReq.path = '/search?q=' + encodeURIComponent(song);
    const req = https.request(thisReq, function(response) {
      let content = '';
      response.on('data', function(chunk) {
        content += chunk;
      });
      response.on('end', function() {
        if (response.statusCode == 200) {
          const parsed = JSON.parse(content);
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
    const thisReq = geniusRequest;
    thisReq.path = '/songs/' + id + '?text_format=plain';
    const req = https.request(thisReq, function(response) {
      let content = '';
      response.on('data', function(chunk) {
        content += chunk;
      });
      response.on('end', function() {
        if (response.statusCode == 200) {
          const parsed = JSON.parse(content);
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
    const URL = url.match(/https:\/\/([^/]*)(.*)/);
    const thisReq = {hostname: URL[1], path: URL[2], method: 'GET'};
    const req = https.request(thisReq, function(response) {
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
      const body = content.match(/<!--sse-->([\s\S]*?)<!--\/sse-->/gm)[1];
      const lyrics = [];
      let matches = [];
      const regex = /<a[^>]*>([^<]*)<\/a>/gm;
      while (matches = regex.exec(body)) {
        lyrics.push(matches[1]);
      }
      const splitLyrics =
          lyrics.join('\n').match(/(\[[^\]]*\][^[]*)/gm).slice(1);
      const embed = new self.Discord.MessageEmbed();
      if (title) embed.setTitle(title);
      if (url) embed.setURL(url);
      if (thumb) embed.setThumbnail(thumb);
      let numFields = 0;
      for (let i = 0; numFields < 25 && i < splitLyrics.length; i++) {
        const splitLine = splitLyrics[i].match(/\[([^\]]*)\]\n([^]*)/m);
        if (!splitLine) continue;
        const secTitle = splitLine[1].substr(0, 256);
        const secBody = splitLine[2];
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
   * @listens Command#record
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
    const streams = {};
    const file = fs.createWriteStream(filename);
    file.on('close', () => {
      msg.channel.send('Saved to ' + url);
    });
    const listen = function(user, receiver, conn) {
      if (streams[user.id] ||
          (msg.mentions.users.size > 0 && !msg.mentions.users.get(user.id))) {
        return;
      }
      const stream =
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
            const receiver = conn.receiver;
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
   * @listens Command#join
   */
  function commandFollow(msg) {
    if (msg.mentions.users.size > 0) {
      const targetMember = msg.mentions.members.first();
      const target = targetMember.id;
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
        follows[msg.guild.id] = msg.author.id;
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
   * @listens Command#musicstats
   */
  function commandStats(msg) {
    let queueLength = 0;
    const bList = Object.entries(broadcasts);
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
              (longestChannel + ' paused for ' + pauseTime + '(' +
               formatPlaytime(pauseTime) + ')') :
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
   * @listens Command#volume
   * @listens Command#vol
   * @listens Command#v
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
