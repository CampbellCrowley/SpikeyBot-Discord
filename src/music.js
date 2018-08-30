// Copyright 2018 Campbell Crowley. All rights reserved.
// Author: Campbell Crowley (dev@campbellcrowley.com)
const ytdl = require('youtube-dl');
const fs = require('fs');
const ogg = require('ogg');
const opus = require('node-opus');
const spawn = require('threads').spawn;
require('./subModule.js')(Music);

/**
 * @classdesc Music and audio related commands.
 * @class
 * @augments SubModule
 * @listens Discord~Client#handleVoiceStateUpdate
 * @listens SpikeyBot~Command#play
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
   * @property {Discord~VoiceBroadcast} broadcast The Discord voice broadcast
   * actually playing the audio.
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
      ['-f bestaudio/best', '--no-playlist', '--default-search=auto'];

  /** @inheritdoc */
  this.initialize = function() {
    self.command.on('join', commandJoin, true);
    self.command.on('play', commandPlay, true);
    self.command.on(['leave', 'stop', 'stfu'], commandLeave, true);
    self.command.on('skip', commandSkip, true);
    self.command.on(['queue', 'playing'], commandQueue, true);
    self.command.on(['remove', 'dequeue'], commandRemove, true);
    self.command.on('lyrics', commandLyrics);
    self.command.on('record', commandRecord, true);

    self.command.on('kokomo', (msg) => {
      msg.content = self.myPrefix + 'play kokomo';
      self.command.trigger('play', msg);
    });
    self.command.on('vi', (msg) => {
      msg.content = self.myPrefix + 'play nice try vi';
      self.command.trigger('play', msg);
    });
    self.command.on('airhorn', (msg) => {
      msg.content = self.myPrefix + 'play airhorn';
      self.command.trigger('play', msg);
    });
    self.command.on('rickroll', (msg) => {
      msg.content = self.myPrefix + 'play rickroll';
      self.command.trigger('play', msg);
    });

    self.client.on('voiceStateUpdate', handleVoiceStateUpdate);
  };

  /** @inheritdoc */
  this.shutdown = function() {
    self.command.deleteEvent('join');
    self.command.deleteEvent('play');
    self.command.deleteEvent(['leave', 'stop', 'stfu']);
    self.command.deleteEvent('skip');
    self.command.deleteEvent(['queue', 'playing']);
    self.command.deleteEvent(['remove', 'dequeue']);
    self.command.deleteEvent('lyrics');
    self.command.deleteEvent('record');
    self.command.deleteEvent('kokomo');
    self.command.deleteEvent('vi');
    self.command.deleteEvent('airhorn');
    self.command.deleteEvent('rickroll');

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

  /**
   * Leave a voice channel if all other users have left. Should also cause music
   * and recordings to stop.
   *
   * @private
   * @param {Discord~GuildMember} oldMem Member before status update.
   * @param {Discord~GuildMember} newMem Member after status update.
   * @listens Discord~Client#handleVoiceStateUpdate
   */
  function handleVoiceStateUpdate(oldMem, newMem) {
    if (oldMem.voiceChannel && oldMem.voiceChannel.members &&
        oldMem.voiceChannel.members.size === 1 &&
        oldMem.voiceChannel.members.get(self.client.user.id)) {
      self.log('Leaving voice channel because everyone left me to be alone :(');
      oldMem.voiceChannel.leave();
    }
  }

  /**
   * Format the info response from ytdl into a human readable format.
   *
   * @private
   * @param {Object} info The info received from ytdl about the song.
   * @return {Discord~MessageEmbed} The formatted song info.
   */
  function formatSongInfo(info) {
    let output = new self.Discord.MessageEmbed();
    output.setDescription(
        info.title + '\nUploaded by ' + info.uploader + '\n[👍 ' +
        formNum(info.like_count) + ' 👎 ' + formNum(info.dislike_count) +
        '][👁️ ' + formNum(info.view_count) + ']\n[' +
        Math.floor(info._duration_raw / 60) + 'm ' + info._duration_raw % 60 +
        's]');
    if (info.thumbnail) output.setThumbnail(info.thumbnail);
    output.setURL(info.webpage_url);
    output.setColor([50, 200, 255]);
    return output;
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
      msg.member.voiceChannel.join()
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
            console.log(err);
            reply(msg, 'Failed to join voice channel!');
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
      broadcast.current.stream.on('info', (info) => {
        broadcast.isLoading = false;
      });
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
        broadcast.current.stream.on('info', (info) => {
          broadcast.isLoading = false;
          broadcast.current.info = info;
          let embed = formatSongInfo(broadcast.current.info);
          embed.setTitle(
              'Now playing [' + broadcast.queue.length + ' left in queue]');
          broadcast.current.request.channel.send(embed);
        });
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
    let input = {
      song: broadcast.current.song,
      special: special,
      ytdl: ytdl,
      fs: fs,
      ytdlOpts: ytdlOpts,
    };
    if (broadcast.current.info) {
      input.song = broadcast.current.info.url;
    }
    spawn(startStream)
        .send(input)
        .on('message', function(stream) {
          broadcast.broadcast = broadcast.voice.play(stream);

          broadcast.broadcast.setBitrate(42);
          broadcast.broadcast.setFEC(true);
          broadcast.broadcast.setVolume(0.5);

          broadcast.voice.ondisconnect = function() {
            if (broadcast.current.stream) broadcast.current.stream.destroy();
          };

          /* broadcast.current.stream.on('end', function() {
            endSong(broadcast);
          }); */
          broadcast.broadcast.on('speaking', function(speaking) {
            if (!speaking) endSong(broadcast);
          });
          broadcast.broadcast.on('error', function(err) {
            self.error('Error in starting broadcast');
            console.log(err);
            broadcast.current.request.channel.send(
                '```An error occured while attempting to play ' +
                broadcast.current.song + '.```');
            broadcast.isLoading = false;
            skipSong(broadcast);
          });
        });
  }

  /**
   * Starts the streams as a thread and reports done with the streams.
   *
   * @param {Object} input Input vars.
   * @param {function} done Done function.
   */
  function startStream(input, done) {
    if (input.special[input.song]) {
      done(input.fs.createReadStream(input.special[input.song].file));
    } else {
      done(input.ytdl(input.song, input.ytdlOpts));
    }
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
    if (msg.member.voiceChannel === null) {
      reply(msg, 'You aren\'t in a voice channel!');
    } else {
      msg.member.voiceChannel.join();
    }
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
    if (msg.member.voiceChannel === null) {
      reply(msg, 'You aren\'t in a voice channel!');
    } else {
      let song = msg.content.replace(self.myPrefix + 'play', '');
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
          broadcast: self.client.createVoiceBroadcast(),
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
      if (me.voiceChannel) {
        me.voiceChannel.leave();
        reply(msg, 'Goodbye!');
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
          msg, 'I\'m not playing anything. Use "' + self.myPrefix +
              'play Kokomo" to start playing something!');
    } else {
      let embed;
      if (broadcasts[msg.guild.id].current) {
        if (broadcasts[msg.guild.id].current.info) {
          embed = formatSongInfo(broadcasts[msg.guild.id].current.info);
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
        embed.addField(
            'Queue', broadcasts[msg.guild.id]
                         .queue
                         .map(function(obj, index) {
                           if (obj.info) {
                             return (index + 1) + ') ' + obj.info.title;
                           } else {
                             return (index + 1) + ') ' + obj.song;
                           }
                         })
                         .join('\n'));
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
      let indexString = msg.content.replace(self.myPrefix + 'remove', '')
                            .replace(self.myPrefix + 'dequeue', '');
      if (!indexString.startsWith(' ')) {
        reply(
            msg,
            'You must specify the index of the song to dequeue.\nYou can ' +
                'view the queue with "' + self.myPrefix + 'queue".');
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
    let song = msg.content.replace(self.myPrefix + 'lyrics', '');
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
        self.log('Genius request closed! ' + content.length);
      });
      response.on('error', function() {
        self.log('Genius request errored! ' + content.length);
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
        self.log('Genius request closed! ' + content.length);
      });
      response.on('error', function() {
        self.log('Genius request errored! ' + content.length);
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
        self.log('Genius request closed! ' + content.length);
      });
      response.on('error', function() {
        self.log('Genius request errored! ' + content.length);
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
    if (msg.member.voiceChannel === null) {
      reply(msg, 'You aren\'t in a voice channel!');
      return;
    }
    const filename = 'recordings/' +
        encodeURIComponent(msg.member.voiceChannel.name + Date.now()) + '.opus';
    const url = self.common.webURL + filename;
    if (msg.mentions.users.size === 0) {
      reply(
          msg, 'Recording everyone in voice channel. Type ' + self.myPrefix +
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
    msg.member.voiceChannel.join().then((conn) => {
      // Timeout and sound are due to current Discord bug requiring bot to play
      // sound for 0.1s before being able to receive audio.
      conn.play('./sounds/plink.ogg');
      self.client.setTimeout(() => {
        let receiver = conn.createReceiver();
        msg.member.voiceChannel.members.forEach(function(member) {
          listen(member.user, receiver, conn);
        });
        conn.on('speaking', (user, speaking) => {
          if (speaking) {
            listen(user, receiver, conn);
          }
        });
      }, 100);
    });
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
