const ytinfo = require('ytdl-getinfo');
const ytdl = require('youtube-dl');

var initialized = false;

exports.helpMessage = undefined;

var prefix, Discord, client, command, common;
var myPrefix, helpMessage;

var broadcasts = {};

const ytdlOpts =
    ['-f bestaudio/best', '--no-playlist', '--default-search=auto'];

// Initialize module.
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

  command.on('kokomo', msg => {
    msg.content = "?play kokomo";
    command.trigger('play', msg);
  });
  command.on('vi', msg => {
    msg.content = "?play vi rap";
    command.trigger('play', msg);
  });

  initialized = true;
  common.LOG("Music Init", "Music");
};

// Removes all references to external data and prepares for unloading.
exports.end = function() {
  if (!initialized) return;
  initialized = false;
  command.deleteEvent('play');
  command.deleteEvent(['leave', 'stop', 'stfu']);
  command.deleteEvent('skip');
  command.deleteEvent(['queue', 'playing']);
  command.deleteEvent(['remove', 'dequeue']);
  delete command;
  delete Discord;
  delete client;
  delete common;
};

// Creates formatted string for mentioning the author of msg.
function mention(msg) {
  return `<@${msg.author.id}>`;
}
// Replies to the author and channel of msg with the given message.
function reply(msg, text, post) {
  post = post || "";
  return msg.channel.send(`${mention(msg)}\n\`\`\`\n${text}\n\`\`\`${post}`);
}

// Format the info response from ytdl into a human readable format.
function formatSongInfo(info) {
  var output = new Discord.RichEmbed();
  output.setDescription(
      info.title + "\nUploaded by " + info.uploader + "\n[👍 " +
      formNum(info.like_count) + " 👎 " + formNum(info.dislike_count) +
      "][👁️ " + formNum(info.view_count) + "]\n[" +
      Math.floor(info._duration_raw / 60) + "m " + info._duration_raw % 60 +
      "s]");
  if (info.thumbnail) output.setThumbnail(info.thumbnail);
  output.setURL(info.webpage_url);
  output.setColor([50, 200, 255]);
  return output;
}
function formNum(num) {
  var output = "";
  var numString = (num + "");
  var tmpString = [];
  for (var i = 0; i < numString.length; i++) {
    if (i > 0 && i % 3 === 0) tmpString.push(",");
    tmpString.push(numString.substr(-i - 1, 1));
  }
  return tmpString.reverse().join('');
}
// Add a song to the given broadcast's queue and start playing it not already.
function queueSong(broadcast, song, msg, info) {
  broadcast.queue.push({request: msg, song: song, info: info});
  if (broadcast.voice) {
    try {
      startPlaying(broadcast);
    } catch (err) {
      console.log(err);
      reply(msg, "Failed to start music stream!");
      command.trigger('stop', msg);
    }
  } else {
    msg.member.voiceChannel.join()
        .then(conn => {
          broadcast.voice = conn;
          try {
            startPlaying(broadcast);
          } catch(err) {
            console.log(err);
            reply(msg, "Failed to start music stream!");
            command.trigger('stop', msg);
          }
        })
        .catch(err => {
          console.log(err);
          reply(msg, "Failed to join voice channel!");
        });
  }
}
// Start playing the first item in the queue of the broadcast.
function startPlaying(broadcast) {
  if (!broadcast || broadcast.isPlaying || broadcast.isLoading) {
    return;
  }
  if (broadcast.queue.length === 0) {
    command.trigger('stop', broadcast.current.request);
    broadcast.current.request.channel.send(
        "Queue is empty!\n```\nSee you later!\n```");
    return;
  }
  broadcast.isLoading = true;
  broadcast.skips = {};
  broadcast.current = broadcast.queue.splice(0, 1)[0];
  try {
    if (broadcast.current.info) {
      broadcast.current.stream = ytdl(broadcast.current.info.url, ytdlOpts);
    } else {
      broadcast.current.stream = ytdl(broadcast.current.song, ytdlOpts);
    }
    broadcast.broadcast.playStream(broadcast.current.stream)
        .on('end', function() { endSong(broadcast); });
    broadcast.voice.playBroadcast(broadcast.broadcast);
  } catch (err) {
    console.log(err);
    endSong(broadcast);
    broadcast.isLoading = false;
  }
  broadcast.isPlaying = true;

  if (typeof broadcast.current.info !== 'undefined') {
    var embed = formatSongInfo(broadcast.current.info);
    embed.setTitle("Now playing [" + broadcast.queue.length + " left in queue]");
    broadcast.current.request.channel.send(embed);
    broadcast.current.stream.on(
        'info', info => { broadcast.isLoading = false; });
  } else {
    // reply(broadcast.current.request, "Playing next song");
    broadcast.current.stream.on('info', info => {
      broadcast.isLoading = false;
      broadcast.current.info = info;
      var embed = formatSongInfo(broadcast.current.info);
      embed.setTitle(
          "Now playing [" + broadcast.queue.length + " left in queue]");
      broadcast.current.request.channel.send(embed);
    });
  }
}
// Triggered when a song has finished playing.
function endSong(broadcast) {
  if (broadcast.isLoading) return;
  if (broadcast.isPlaying) skipSong(broadcast);
}
// Skip the current song, then attempt to play the next.
function skipSong(broadcast) {
  if (broadcast.broadcast) broadcast.broadcast.end();
  broadcast.isPlaying = false;
  startPlaying(broadcast);
}

function commandPlay(msg) {
  if (msg.member.voiceChannel === null) {
    reply(msg, "You aren't in a voice channel!");
  } else {
    var song = msg.content.replace(prefix + 'play', '');
    if (!song.startsWith(' ')) {
      reply(msg, "Please specify a song to play.");
      return;
    } else {
      song = song.replace(' ', '');
    }
    var loadingMsg;
    reply(msg, "Loading " + song + "\nPlease wait...")
        .then(msg => loadingMsg = msg);
    if (!broadcasts[msg.guild.id]) {
      broadcasts[msg.guild.id] = {
        queue: [],
        skips: {},
        isPlaying: false,
        broadcast: client.createVoiceBroadcast()
      };
      queueSong(broadcasts[msg.guild.id], song, msg);
    } else {
      ytdl.getInfo(song, ytdlOpts, (err, info) => {
        if (err) {
          reply(
              msg, "Oops, something went wrong while searching for that song!");
          console.log(err);
        } else if (info._duration_raw == 0) {
          reply(msg, "Sorry, but I can't play live streams currently.");
        } else {
          if (broadcasts[msg.guild.id].isPlaying) {
            var embed = formatSongInfo(info);
            embed.setTitle(
                "Enqueuing " + song + " [" +
                (broadcasts[msg.guild.id].queue.length + 1) + " in queue]");
            msg.channel.send(mention(msg), embed);
            queueSong(broadcasts[msg.guild.id], song, msg, info);
          }
        }
        if (loadingMsg) loadingMsg.delete();
      });
    }
  }
}
function commandLeave(msg) {
  var shouldReply = true;
  if (!broadcasts[msg.guild.id] ||
      (broadcasts[msg.guild.id].queue.length === 0 &&
       broadcasts[msg.guild.id].current)) {
    shouldReply = false;
  }
  msg.guild.fetchMember(client.user).then(me => {
    if (typeof me.voiceChannel !== 'undefined') {
      me.voiceChannel.leave();
      if (shouldReply) reply(msg, "Goodbye!");
    } else {
      if (shouldReply) reply(msg, "I'm not playing anything.");
    }
  });
  delete broadcasts[msg.guild.id];
}
function commandSkip(msg) {
  if (!broadcasts[msg.guild.id]) {
    reply(msg, "I'm not playing anything, I can't skip nothing!");
  } else {
    reply(msg, "Skipping current song...");
    skipSong(broadcasts[msg.guild.id]);
  }
}
function commandQueue(msg) {
  if (!broadcasts[msg.guild.id]) {
    reply(
        msg, "I'm not playing anything. Use \"" + prefix +
            "play Kokomo\" to start playing something!");
  } else {
    var emebed;
    if (broadcasts[msg.guild.id].current) {
      embed = formatSongInfo(broadcasts[msg.guild.id].current.info);
      embed.setTitle("Current Song Queue");
    } else {
      embed = new Discord.RichEmbed();
    }
    embed.addField(
        "Queue", broadcasts[msg.guild.id]
                     .queue
                     .map(function(obj, index) {
                       return (index + 1) + ") " + obj.info.title;
                     })
                     .join('\n'));
    msg.channel.send(embed);
  }
}
function commandRemove(msg) {
  if (!broadcasts[msg.guild.id] ||
      broadcasts[msg.guild.id].queue.length === 0) {
    reply(
        msg,
        "The queue appears to be empty.\nI can't remove nothing from nothing!");
  } else {
    var indexString = msg.content.replace(prefix + 'remove', '')
                          .replace(prefix + 'dequeue', '');
    if (!indexString.startsWith(' ')) {
      reply(
          msg,
          "You must specify the index of the song to dequeue.\nYou can view the queue with \"" +
              prefix + "queue\".");
    } else {
      var index = Number(indexString.replace(' ', ''));
      if (typeof index !== 'number' || index <= 0 ||
          index > broadcasts[msg.guild.id].queue.length) {
        reply(msg, "That is not a valid index!");
      } else {
        var removed = broadcasts[msg.guild.id].queue.splice(index - 1, 1)[0];
        reply(msg, "Dequeued #" + index + ": " + removed.info.title);
      }
    }
  }
}
