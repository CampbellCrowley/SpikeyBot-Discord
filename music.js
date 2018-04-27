const ytdl = require('youtube-dl');
const fs = require('fs');


const geniusClient =
    'l5zrX9XIDrJuz-kS1u7zS5sE81KzrH3qxZL5tAvprE9GG-L1KYlZklQDXL6wf3sn';
const geniusRequest = {
  hostname: 'api.genius.com',
  path: '/search/',
  headers:
      {'Accept': 'application/json', 'Authorization': 'Bearer ' + geniusClient},
  method: 'GET',
};
const https = require('https');

let initialized = false;

exports.helpMessage = undefined;

let prefix;
let Discord;
let client;
let command;
let common;
let myPrefix;

let broadcasts = {};

const special = {
  'nice try vi': {
    cmd: 'vi',
    url: 'https://www.youtube.com/watch?v=c1NoTNCiomU',
    file: '/home/discord/SpikeyBot-Discord/js/sounds/viRap.webm',
  },
  'airhorn': {
    cmd: 'airhorn',
    url: '',
    file: '/home/discord/SpikeyBot-Discord/js/sounds/airhorn.mp3',
  },
  'rickroll': {
    cmd: 'rickroll',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    file: '/home/discord/SpikeyBot-Discord/js/sounds/rickRoll.webm',
  },
  'kokomo': {
    cmd: 'kokomo',
    url: 'https://www.youtube.com/watch?v=fJWmbLS2_ec',
    file: '/home/discord/SpikeyBot-Discord/js/sounds/kokomo.webm',
  },
};

const ytdlOpts =
    ['-f bestaudio/best', '--no-playlist', '--default-search=auto'];

/**
 * Initialize this submodule.
 *
 * @param {string} prefix_ The global prefix for this bot.
 * @param {Discord} Discord_ The Discord object for the API library.
 * @param {Discord.Client} client_ The client that represents this bot.
 * @param {Command} command_ The command instance in which to register command
 * listeners.
 * @param {Object} common_ Object storing common functions.
 */
exports.begin = function(prefix_, Discord_, client_, command_, common_) {
  prefix = prefix_;
  myPrefix = prefix;
  Discord = Discord_;
  client = client_;
  command = command_;
  common = common_;

  command.on('play', commandPlay, true);
  command.on(['leave', 'stop', 'stfu'], commandLeave, true);
  command.on('skip', commandSkip, true);
  command.on(['queue', 'playing'], commandQueue, true);
  command.on(['remove', 'dequeue'], commandRemove, true);
  command.on('lyrics', commandLyrics);
  command.on('record', commandRecord, true);

  command.on('kokomo', (msg) => {
    msg.content = '?play kokomo';
    command.trigger('play', msg);
  });
  command.on('vi', (msg) => {
    msg.content = '?play nice try vi';
    command.trigger('play', msg);
  });
  command.on('airhorn', (msg) => {
    msg.content = '?play airhorn';
    command.trigger('play', msg);
  });
  command.on('rickroll', (msg) => {
    msg.content = '?play rickroll';
    command.trigger('play', msg);
  });

  initialized = true;
  common.log('Music Init', 'Music');
};

/**
 * Shutdown and disable this submodule. Removes all event listeners.
 */
exports.end = function() {
  if (!initialized) return;
  initialized = false;
  command.deleteEvent('play');
  command.deleteEvent(['leave', 'stop', 'stfu']);
  command.deleteEvent('skip');
  command.deleteEvent(['queue', 'playing']);
  command.deleteEvent(['remove', 'dequeue']);
  command.deleteEvent('lyrics');
  command.deleteEvent('record');
  command.deleteEvent('kokomo');
  command.deleteEvent('vi');
  command.deleteEvent('airhorn');
  command.deleteEvent('rickroll');

  delete command;
  delete Discord;
  delete client;
  delete common;
};

exports.save = function() {};

/**
 * Creates formatted string for mentioning the author of msg.
 *
 * @param {Discord.Message} msg Message to format a mention for the author of.
 * @return {string} Formatted mention string.
 */
function mention(msg) {
  return `<@${msg.author.id}>`;
}
/**
 * Replies to the author and channel of msg with the given message.
 *
 * @param {Discord.Message} msg Message to reply to.
 * @param {string} text The main body of the message.
 * @param {string} post The footer of the message.
 * @return {Promise} Promise of Discord.Message that we attempted to send.
 */
function reply(msg, text, post) {
  post = post || '';
  return msg.channel.send(`${mention(msg)}\n\`\`\`\n${text}\n\`\`\`${post}`);
}

/**
 * Format the info response from ytdl into a human readable format.
 *
 * @param {Object} info The info received from ytdl about the song.
 * @return {Discord.MessageEmbed} The formatted song info.
 */
function formatSongInfo(info) {
  let output = new Discord.MessageEmbed();
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
 * @param {Object} broadcast The broadcast storage container.
 * @param {string} song The song that was requested.
 * @param {Discord.Message} msg The message that requested the song.
 * @param {Object} info The info from ytdl about the song.
 */
function enqueueSong(broadcast, song, msg, info) {
  broadcast.queue.push({request: msg, song: song, info: info});
  if (broadcast.voice) {
    try {
      startPlaying(broadcast);
    } catch (err) {
      console.log(err);
      reply(msg, 'Failed to start music stream!');
      command.trigger('stop', msg);
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
            command.trigger('stop', msg);
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
 * @param {Object} broadcast The container storing all information about the
 * song.
 */
function startPlaying(broadcast) {
  if (!broadcast || broadcast.isPlaying || broadcast.isLoading) {
    return;
  }
  if (broadcast.queue.length === 0) {
    command.trigger('stop', broadcast.current.request);
    broadcast.current.request.channel.send('`Queue is empty!`');
    return;
  }
  broadcast.isLoading = true;
  broadcast.skips = {};
  broadcast.current = broadcast.queue.splice(0, 1)[0];
  try {
    makeBroadcast(broadcast);
    broadcast.voice.play(broadcast.broadcast);
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
        let embed = new Discord.MessageEmbed();
        embed.setTitle(
            'Now playing [' + broadcast.queue.length + ' left in queue]');
        embed.setColor([50, 200, 255]);
        embed.setDescription(broadcast.current.song);
        broadcast.current.request.channel.send(embed);
      } else {
        ytdl.getInfo(
            special[broadcast.current.song].url, ytdlOpts, (err, info) => {
              if (err) {
                console.log(err);
                broadcast.current.request.channel.send(
                    '```Oops, something went wrong while getting info for ' +
                    'this song!```');
              } else {
                broadcast.isLoading = false;
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
 * @param {Object} broadcast The object storing all relevant information.
 */
function makeBroadcast(broadcast) {
  if (special[broadcast.current.song]) {
    broadcast.broadcast.play(special[broadcast.current.song].file)
        .on('end', function() {
          endSong(broadcast);
        });
  } else {
    if (broadcast.current.info) {
      broadcast.current.stream = ytdl(broadcast.current.info.url, ytdlOpts);
    } else {
      broadcast.current.stream = ytdl(broadcast.current.song, ytdlOpts);
    }

    broadcast.broadcast.play(broadcast.current.stream).on('end', function() {
      endSong(broadcast);
    });
  }
}
/**
 * Triggered when a song has finished playing.
 *
 * @param {Object} broadcast The object storing all relevant information.
 */
function endSong(broadcast) {
  if (broadcast.isLoading) return;
  if (broadcast.isPlaying) skipSong(broadcast);
}
/**
 * Skip the current song, then attempt to play the next.
 *
 * @param {Object} broadcast The object storing all relevant information.
 */
function skipSong(broadcast) {
  if (broadcast.broadcast) broadcast.broadcast.dispatcher.pause();
  broadcast.isPlaying = false;
  startPlaying(broadcast);
}

/**
 * Search for a song to play based off user request.
 *
 * @param {Discord.Message} msg The message that triggered command.
 */
function commandPlay(msg) {
  if (msg.member.voiceChannel === null) {
    reply(msg, 'You aren\'t in a voice channel!');
  } else {
    let song = msg.content.replace(myPrefix + 'play', '');
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
        broadcast: client.createVoiceBroadcast(),
      };
      enqueueSong(broadcasts[msg.guild.id], song, msg);
    } else {
      if (special[song]) {
        let embed = new Discord.MessageEmbed();
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
            reply(
                msg,
                'Oops, something went wrong while searching for that song!');
            console.log(err);
          } else if (info._duration_raw === 0) {
            reply(msg, 'Sorry, but I can\'t play live streams currently.');
          } else {
            if (broadcasts[msg.guild.id].isPlaying) {
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
 * @param {Discord.Message} msg The message that triggered the command.
 */
function commandLeave(msg) {
  let shouldReply = true;
  if (!broadcasts[msg.guild.id] ||
      (broadcasts[msg.guild.id].queue.length === 0 &&
       broadcasts[msg.guild.id].current)) {
    shouldReply = false;
  }
  msg.guild.members.fetch(client.user).then((me) => {
    if (typeof me.voiceChannel !== 'undefined') {
      me.voiceChannel.leave();
      if (shouldReply) reply(msg, 'Goodbye!');
    } else {
      if (shouldReply) reply(msg, 'I\'m not playing anything.');
    }
  });
  delete broadcasts[msg.guild.id];
}
/**
 * Skip the currently playing song and continue to the next in the queue.
 *
 * @param {Discord.Message} msg The message that triggered the command.
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
 * @param {Discord.Message} msg The message that triggered the command.
 */
function commandQueue(msg) {
  if (!broadcasts[msg.guild.id]) {
    reply(
        msg, 'I\'m not playing anything. Use "' + myPrefix +
            'play Kokomo" to start playing something!');
  } else {
    let embed;
    if (broadcasts[msg.guild.id].current) {
      if (broadcasts[msg.guild.id].current.info) {
        embed = formatSongInfo(broadcasts[msg.guild.id].current.info);
      } else {
        embed = new Discord.MessageEmbed();
        embed.setColor([50, 200, 255]);
        embed.setDescription(broadcasts[msg.guild.id].current.song);
      }
      embed.setTitle('Current Song Queue');
    } else {
      embed = new Discord.MessageEmbed();
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
 * @param {Discord.Message} msg The message that triggered the command.
 */
function commandRemove(msg) {
  if (!broadcasts[msg.guild.id] ||
      broadcasts[msg.guild.id].queue.length === 0) {
    reply(
        msg, 'The queue appears to be empty.\nI can\'t remove nothing from ' +
            'nothing!');
  } else {
    let indexString = msg.content.replace(myPrefix + 'remove', '')
                          .replace(myPrefix + 'dequeue', '');
    if (!indexString.startsWith(' ')) {
      reply(
          msg,
          'You must specify the index of the song to dequeue.\nYou can view ' +
              'the queue with "' + myPrefix + 'queue".');
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
 * @param {Discord.Message} msg The message that triggered the command.
 */
function commandLyrics(msg) {
  let song = msg.content.replace(myPrefix + 'lyrics', '');
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
        msg.channel.send('`Asking where to find song...`').then((msg) => {
          msg.delete(6000);
        });
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
      common.log('Genius request closed! ' + content.length, 'Music');
    });
    response.on('error', function() {
      common.log('Genius request errored! ' + content.length, 'Music');
    });
  });
  req.end();
  req.on('error', function(e) {
    common.error(e, 'Music');
  });
  msg.channel.send('`Asking if song exists...`').then((msg) => {
    msg.delete(7000);
  });
}
/**
 * Request the song information from Genius from previous search to find the
 * page where the lyrics are.
 *
 * @param {Discord.Message} msg The message that triggered the command.
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
        msg.channel.send('`Asking for lyrics...`').then((msg) => {
          msg.delete(4000);
        });
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
      common.log('Genius request closed! ' + content.length, 'Music');
    });
    response.on('error', function() {
      common.log('Genius request errored! ' + content.length, 'Music');
    });
  });
  req.end();
  req.on('error', function(e) {
    common.error(e, 'Music');
  });
}
/**
 * Request the webpage that has the song lyrics on them from Genius.
 *
 * @param {Discord.Message} msg The message that triggered the command.
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
        msg.channel.send('`Crawling webpage...`').then((msg) => {
          msg.delete(2000);
        });
        stripLyrics(msg, content, title, url, thumb);
      } else {
        msg.channel.send(
            response.statusCode + '```json\n' +
            JSON.stringify(response.headers, null, 2) + '```\n```html\n' +
            content + '\n```');
      }
    });
    response.on('close', function() {
      common.log('Genius request closed! ' + content.length, 'Music');
    });
    response.on('error', function() {
      common.log('Genius request errored! ' + content.length, 'Music');
    });
  });
  req.end();
  req.on('error', function(e) {
    common.error(e, 'Music');
  });
}
/**
 * Crawl the received webpage for the data we need, then format the data and
 * show it to the user.
 *
 * @param {Discord.Message} msg The message that triggered the command.
 * @param {string} content The entire page received.
 * @param {string} title The song title for showing the user.
 * @param {string} url The url of where we fetched the lyrics to show the user.
 * @param {string} thumb The url of the album art thumbnail to show the user
 * later.
 */
function stripLyrics(msg, content, title, url, thumb) {
  try {
    let body = content.match(/<!--sse-->([\s\S]*?)<!--\/sse-->/gm)[1];
    let lyrics = body.match(/^([^<>]*)<|>([^<>]*)<|>([^<>]*)$/gm)
                     .slice(1)
                     .join('')
                     .replace(/<>|^\s*/gm, '')
                     .replace('>', '');
    let splitLyrics = lyrics.match(/\[[^\]]*\][^\[]*/gm);
    let embed = new Discord.MessageEmbed();
    if (title) embed.setTitle(title);
    if (url) embed.setURL(url);
    if (thumb) embed.setThumbnail(thumb);
    let numFields = 0;
    for (let i = 0; numFields < 25 && i < splitLyrics.length; i++) {
      let splitLine = splitLyrics[i].match(/\[([^\]]*)\]\n([\s\S]*)/m);
      let secTitle = splitLine[1].substr(0, 256);
      let secBody = splitLine[2];
      for (let j = 0; numFields < 25 && j * 1024 < secBody.length; j++) {
        embed.addField(
            j === 0 ? secTitle : '\u200B',
            secBody.substr(j * 1024, 1024) || '\u200B', true);
        numFields++;
      }
    }
    embed.setColor([0, 255, 255]);
    msg.channel.send(embed);
  } catch (err) {
    console.log(err);
    msg.channel.send('`FAILED to parse lyrics: ' + err.message + '`');
  }
}

/**
 * Join a voice channel and record the specified users audio to a file on this
 * server.
 *
 * @param {Discord.Message} msg The message that triggered the command.
 */
function commandRecord(msg) {
  if (msg.member.voiceChannel === null) {
    reply(msg, 'You aren\'t in a voice channel!');
    return;
  }
  const filename = 'recordings/' +
      encodeURIComponent(msg.member.voiceChannel.name + Date.now()) + '.opus';
  const url = 'https://www.campbellcrowley.com/spikeybot/' + filename;
  if (msg.mentions.users.size === 0) {
    reply(msg, 'Recording everyone in voice channel. Type ?stop to stop', url);
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
        (msg.mentions.users.size > 0 && !msg.mentions.users.find(user.id))) {
      return;
    }
    let stream = receiver.createStream(msg.author, {end: 'manual'});
    streams[user.id] = stream;
    stream.pipe(file);
    conn.on('disconnect', () => {
      stream.destroy();
    });
  };
  msg.member.voiceChannel.join().then((conn) => {
    let startSound =
        conn.play('/home/discord/SpikeyBot-Discord/js/sounds/plink.m4a');
    startSound.on('end', () => {
      let receiver = conn.createReceiver();
      msg.member.voiceChannel.members.forEach(function(member) {
        listen(member.user, receiver, conn);
      });
      conn.on('speaking', (user, speaking) => {
        if (speaking) {
          listen(user, receiver, conn);
        }
      });
    });
  });
}
