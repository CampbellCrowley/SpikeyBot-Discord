const Discord = require('discord.js');
const common = require('/var/www/html/common.js');
const dateFormat = require('dateformat');
const ytinfo = require('ytdl-getinfo');
const ytdl = require('youtube-dl');
const client = new Discord.Client();

const isDev = false;
const prefix = isDev ? '~' : '?';

// Password for changing the game the bot is playing. This doesn't need to be
// secure, and I could probably just remove it.
const password = "password";
const spikeyId = "124733888177111041";

const smitePerms =
    Discord.Permissions.FLAGS.CONNECT | Discord.Permissions.FLAGS.VIEW_CHANNEL;

var prevUserSayId = "";
var prevUserSayCnt = 0;

const introduction = "\nHello! My name is SpikeyBot.\n" +
    "I was created by SpikeyRobot#9836, so if you wish to add any features, feel free to PM him! (Tip: Use **pmspikey**)\n" +
    "\nIf you'd like to know what I can do, type **help** in a PM to me and I'll let you know!";
const helpmessagereply = "I sent you a DM with commands!";
const blockedmessage =
    "I couldn't send you a message, you probably blocked me :(";
const onlyservermessage = "This command only works in servers, sorry!";
const addmessage = "Want to add me to your server? Click this link:";
const addLink =
    "https://discordapp.com/oauth2/authorize?&client_id=318552464356016131&scope=bot";
const banMsgs = [
  "It was really nice meeting you!",
  "You're a really great person, I'm sorry I had to do this.", "See you soon!",
  "And they were never heard from again...", "Poof! Gone like magic!",
  "Does it seem quiet in here? Or is it just me?",
  "And like the trash, they're were taken out!",
  "Looks like they made like a tree, and leaf-ed. (sorry)",
  "Oof! Looks like my boot to their behind left a mark!",
  "Between you and me, I didn't like them anyways.",
  "Everyone rejoice! The world has been eradicated of one more person that no one liked anyways."
];
const helpmessage =
"Here's the list of stuff I can do! PM SpikeyRobot (" + prefix + "pmspikey) feature requests!\n" +
"```js\n" +
"=== Music ===\n" +
  prefix + "play 'url or search' // Play a song in your current voice channel, or add a song to the queue.\n" +
  prefix + "stop // Stop playing music and leave the voice channel.\n" +
  prefix + "skip // Skip the currently playing song.\n" +
  prefix + "queue // View the songs currently in the queue.\n" +
  prefix + "remove 'index' // Remove a song with the given queue index from the queue.\n" +
"=== General Stuff ===\n" +
  prefix + "addme // I will send you a link to add me to your server!\n" +
  prefix + "help // Send this message to you.\n" +
  prefix + "say // Make me say something.\n" +
  prefix + "createdate // I will tell you the date you created your account!\n" +
  prefix + "joindate // I will tell you the date you joined the server you sent the message from!\n" +
  prefix + "pmme // I will introduce myself to you!\n" +
  prefix + "pmspikey 'message' // I will send SpikeyRobot (my creator) your message because you are too shy!\n" +
  prefix + "flip // I have an unlimited supply of coins! I will flip one for you!\n" +
"=== Admin Stuff ===\n" +
  prefix + "purge 'number' // Remove a number of messages from the current text channel!\n" +
  prefix + "fuckyou/" + prefix + "ban 'mention' // I will ban the person you mention with a flashy message!\n" +
  prefix + "smite 'mention' // Silence the peasant who dare oppose you!\n```";


var broadcasts = {};

common.begin();

// Command event management.
function Command() {
  var cmds = {};
  this.trigger = function(cmd, msg) {
    if (cmd.startsWith(prefix)) cmd = cmd.replace(prefix, '');
    if (cmds[cmd]) {
      try {
        cmds[cmd](msg);
      } catch (err) {
        common.ERROR(cmd + ": FAILED");
        console.log(err);
        reply(msg, "An error occurred! Oh noes!");
      }
      return true;
    } else {
      return false;
    }
  };
  this.on = function(cmd, cb) {
    if (typeof cb !== 'function') throw("Event callback must be a function.");
    if (typeof cmd === 'string') {
      cmds[cmd] = cb;
    } else if (Array.isArray(cmd)) {
      for (var i = 0; i < cmd.length; i++) cmds[cmd[i]] = cb;
    } else {
      throw("Event must be string or array of strings");
    }
  };
}
var command = new Command();

// Checks if given message is the given command.
function isCmd(msg, cmd) {
  return msg.content.startsWith(prefix + cmd);
}
// Changes the bot's status message.
function updategame(password_, game) {
  if (password_ == password) {
    client.user.setPresence({game: {name: game}});
    common.LOG('Changed game to "' + game + '"');
    return 0;
  } else {
    common.LOG('Didn\'t change game (' + password_ + ')');
    return 1;
  }
}
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
  return info.title + "\nUploaded by " + info.uploader + "\n[👍 " +
      info.like_count + " 👎 " + info.dislike_count + "][👁️ " +
      info.view_count + "]\n[" + Math.floor(info._duration_raw / 60) + "m " +
      info._duration_raw % 60 + "s]\n" + info.webpage_url;
}
// Add a song to the given broadcast's queue and start playing it not already.
function queueSong(broadcast, stream, msg, info) {
  broadcast.queue.push({request: msg, stream: stream, info: info});
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
  if (broadcast.queue.length == 0) {
    command.trigger('stop', broadcast.current.request);
    broadcast.current.request.channel.send(
        "Queue is empty!\n```\nSee you later!\n```");
    return;
  }
  broadcast.isLoading = true;
  broadcast.skips = {};
  broadcast.current = broadcast.queue.splice(0, 1)[0];
  broadcast.broadcast.playStream(broadcast.current.stream)
      .on('end', function() { endSong(broadcast); });
  broadcast.voice.playBroadcast(broadcast.broadcast);
  broadcast.isLoading = false;
  broadcast.isPlaying = true;

  if (typeof broadcast.current.info !== 'undefined') {
    broadcast.current.request.channel.send(
        "Now playing [" + broadcast.queue.length + " left in queue]\n```\n" +
        formatSongInfo(broadcast.current.info) + "\n```");
  } else {
    reply(broadcast.current.request, "Playing next song");
  }
};
// Triggered when a song has finished playing.
function endSong(broadcast) {
  if (broadcast.isLoading) return;
  if (broadcast.isPlaying) skipSong(broadcast);
}
// Skip the current song, then attempt to play the next.
function skipSong(broadcast) {
  broadcast.isPlaying = false;
  broadcast.isLoading = true;
  startPlaying(broadcast);
}

// BEGIN //
client.on('ready', () => {
  common.LOG(`Logged in as ${client.user.tag}!`);
  updategame(password, '?help for help');
  client.fetchUser(spikeyId).then(user => {user.send("I just started (JS)")});
});

client.on('message', msg => {
  if (msg.author.id == client.user.id) return;
  if (msg.author.bot) return;

  if (msg.guild == null && !msg.content.startsWith(prefix)) {
    msg.content = prefix + msg.content;
  }

  if (isCmd(msg, '')) {
    if (msg.guild != null) {
      common.LOG(
          msg.guild.name + "#" + msg.channel.name + "@" + msg.author.username +
          "?" + msg.content);
    } else {
      common.LOG("PM: @" + msg.author.username + "?" + msg.content);
    }
    if (!command.trigger(msg.content.split(' ')[0], msg) && msg.guild == null) {
      msg.channel.send(
          "Oops! I'm not sure how to help with that! Type **help** for a list of commands I know how to respond to.");
    }
  }
});

command.on('addme', msg => { reply(msg, addmessage, addLink); });
command.on('updategame', msg => {
  msg.delete();
  var command = msg.content.replace(prefix + 'updategame ', '');
  var password = command.split(' ')[0];
  var game = command.replace(password + " ", '');
  if (updategame(password, game)) {
    reply(msg, "I'm sorry, but you are not allowed to do that. :(\n");
  } else {
    reply(msg, "I changed my status to \"" + game + "\"!\n```");
  }
});
command.on('say', msg => {
  msg.delete();
  var content = msg.content.replace(prefix + 'say', '');
  if (content.indexOf(' ') == 0) content.replace(' ', '');
  msg.channel.send(content);
  if (prevUserSayId != msg.author.id) {
    prevUserSayId = msg.author.id;
    prevUserSayCnt = 0;
  }
  prevUserSayCnt++;
  if (prevUserSayCnt % 3 == 0) {
    msg.channel.send(
        "Help! " + mention(msg) + " is putting words into my mouth!");
  }
});
command.on('createdate', msg => {
  reply(
      msg, "You created your discord account on " +
          dateFormat(msg.author.createdTimestamp));
});
command.on('joindate', msg => {
  if (msg.member) {
    reply(
        msg,
        "You joined this server on " + dateFormat(msg.member.joinedTimestamp));
  } else {
    reply(msg, onlyservermessage);
  }
});
command.on('pmme', msg => {
  msg.author.send(introduction)
      .then(_ => {
        if (msg.guild != null) reply(msg, "I sent you a message.", ":wink:")
      })
      .catch(_ => {reply(msg, blockedmessage)});
});
command.on('help', msg => {
  msg.author.send(helpmessage)
      .then(_ => {
        if (msg.guild != null) reply(msg, helpmessagereply, ":wink:")
      })
      .catch(_ => {reply(msg, blockedmessage)});
});
command.on('pmspikey', msg => {
  client.fetchUser(spikeyId)
      .then(
          user => {user.send(msg.author.tag + ": " + msg.content)
                       .then(
                           _ => {reply(
                               msg, "I sent your message to SpikeyRobot.")})})
      .catch(err => {
        console.log(err);
        reply(
            msg,
            "Somethine went wrong and I couldn't send your message. Sorry that's all I know :(")
      });
});
command.on('flip', msg => {
  var rand = Math.round(Math.random());
  var url = "https://www.campbellcrowley.com/heads.png";
  var text = "Heads!";
  if (rand) {
    url = "https://www.campbellcrowley.com/tails.png";
    text = "Tails!";
  }
  var embed = new Discord.RichEmbed({title: text});
  embed.setImage(url);
  msg.channel.send(embed);
});
command.on(['purge', 'prune'], msg => {
  if (msg.guild == null) {
    reply(msg, onlyservermessage);
  } else if (
      msg.channel.permissionsFor(msg.member)
          .has(Discord.Permissions.FLAGS.MANAGE_MESSAGES)) {
    var numString = msg.content.replace(prefix + 'purge ', '')
                        .replace(prefix + 'prune ', '');
    var num = Number(numString);
    if (numString.length == 0 || typeof num !== 'number') {
      reply(
          msg,
          "You must specify the number of messages to purge. (ex: ?purge 5)");
    } else {
      msg.channel.bulkDelete(num + 1);
    }
  } else {
    reply(msg, "I'm sorry, but you don't have permission to delete messages in this channel.");
  }
});
command.on(['fuckyou', 'ban'], msg => {
  if (msg.guild == null) {
    reply(msg, onlyservermessage);
  } else if (
      !msg.member.hasPermission(
          Discord.Permissions.FLAGS.BAN_MEMBERS, true, true, true)) {
    reply(
        msg, "You don't have permission for that!\n(Filthy " +
            msg.member.highestRole.name + ")");
  } else if (msg.mentions.members.size == 0) {
    reply(msg, "You must mention someone to ban after the command.");
  } else {
    var toBan = msg.mentions.members.first();
    if (msg.guild.ownerID !== msg.author.id &&
        Discord.Role.comparePositions(
            msg.member.highestRole, toBan.highestRole) <= 0) {
      reply(
          msg, "You can't ban " + toBan.user.username +
              "! You are not stronger than them!");
    } else {
      msg.guild.fetchMember(client.user).then(me => {
        var myRole = me.highestRole;
        if (Discord.Role.comparePositions(myRole, toBan.highestRole) <= 0) {
          reply(
              msg, "I can't ban " + toBan.user.username +
                  "! I am not strong enough!");
      } else {
        var banMsg = banMsgs[Math.floor(Math.random() * banMsgs.length)];
        toBan.ban({reason: banMsg})
            .then(_ => { reply(msg, banMsg, "Banned " + toBan.user.username); })
            .catch(_ => {
              reply(
                  msg, "Oops! I wasn't able to ban " + toBan.user.username +
                      "! I'm not sure why though!");
            });
      }
      });
    }
  }
});
command.on('smite', msg => {
  if (msg.guild == null) {
    reply(msg, onlyservermessage);
  } else if (msg.mentions.members.size == 0) {
    reply(msg, "You must mention someone to ban after the command.");
  } else {
    var toSmite = msg.mentions.members.first();
    if (msg.guild.ownerID !== msg.author.id &&
        msg.member.Discord.Role.comparePositions(
            msg.member.highestRole, toSmite.highestRole) <= 0) {
      reply(
          msg, "You can't smite " + toSmite.user.username +
              "! You are not stronger than them!");
    } else {
      msg.guild.fetchMember(client.user).then(me => {
        var myRole = me.highestRole;
        if (Discord.Role.comparePositions(myRole, toSmite.highestRole) <= 0) {
          reply(
              msg, "I can't smite " + toSmite.user.username +
                  "! I am not strong enough!");
        } else {
          var hasSmiteRole = false;
          var smiteRole;
          msg.guild.roles.forEach(function(val, key) {
            if (val.name == "Smited") {
              hasSmiteRole = true;
              smiteRole = val;
            }
          });
          smite = function(role, member) {
            try {
              member.setRoles([role]).then(_ => {
                reply(
                    msg, "The gods have struck " + member.user.username +
                        " with lightning!");
              });
            } catch (err) {
              reply(
                  msg, "Oops! I wasn't able to smite " + member.user.username +
                      "! I'm not sure why though!");
            }
          };
          if (!hasSmiteRole) {
            msg.guild
                .createRole({
                  name: "Smited",
                  position: 0,
                  hoist: true,
                  color: "#2f3136",
                  permissions: smitePerms,
                  mentionable: true
                })
                .then(role => { smite(role, toSmite); })
                .catch(_ => {
                  reply(
                      msg, "I couldn't smite " + toSmite.user.username +
                          " because there isn't a \"Smited\" role and I couldn't make it!");
                });
          } else {
            smite(smiteRole, toSmite);
          }
        }
      });
    }
  }
});
command.on('play', msg => {
  if (msg.guild == null) {
    reply(msg, onlyservermessage);
  } else if (msg.member.voiceChannel == null) {
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
    var stream = ytdl(
        song, ['-f bestaudio/best', '--no-playlist', '--default-search=auto']);
    stream.on('info', info => {
      if (!broadcasts[msg.guild.id]) {
        broadcasts[msg.guild.id] = {
          queue: [],
          skips: {},
          isPlaying: false,
          broadcast: client.createVoiceBroadcast()
        };
      } else {
        msg.channel.send(
            mention(msg) + " Enqueuing " + song + " [" +
            (broadcasts[msg.guild.id].queue.length + 1) + " in queue]\n```\n" +
            formatSongInfo(info) + "\n```");
      }
      queueSong(broadcasts[msg.guild.id], stream, msg, info);
      if (loadingMsg) loadingMsg.delete();
    });
  }
});
command.on(['leave', 'stop', 'stfu'], msg => {
  if (msg.guild == null) {
    reply(msg, onlyservermessage);
  } else {
    var shouldReply = true;
    if (!broadcasts[msg.guild.id] ||
        (broadcasts[msg.guild.id].queue.length == 0 &&
         broadcasts[msg.guild.id].current)) {
      shouldReply = false;
    }
    msg.guild.fetchMember(client.user)
        .then(
            me => {
              if (me.voiceChannel != null) {
                me.voiceChannel.leave();
                if (shouldReply) reply(msg, "Goodbye!");
              } else {
                if (shouldReply) reply(msg, "I'm not playing anything.");
              }
            });
    delete broadcasts[msg.guild.id];
  }
});
command.on('skip', msg => {
  if (msg.guild == null) {
    reply(msg, onlyservermessage);
  } else if (!broadcasts[msg.guild.id]) {
    reply(msg, "I'm not playing anything, I can't skip nothing!");
  } else {
    reply(msg, "Skipping current song...");
    skipSong(broadcasts[msg.guild.id]);
  }
});
command.on('queue', msg => {
  if (msg.guild == null) {
    reply(msg, onlyservermessage);
  } else if (!broadcasts[msg.guild.id]) {
    reply(
        msg, "I'm not playing anything. Use \"" + prefix +
            "play Kokomo\" to start playing something!");
  } else {
    var queueTitles = [];
    if (broadcasts[msg.guild.id].current) {
      queueTitles = queueTitles.concat(
          ["Now Playing: " + broadcasts[msg.guild.id].current.info.title]);
    }
    queueTitles = queueTitles.concat(
        broadcasts[msg.guild.id].queue.map(function(obj, index) {
          return (index + 1) + ") " + obj.info.title;
        }));
    reply(msg, queueTitles.join('\n'));
  }
});
command.on(['remove','dequeue'], msg => {
  if (msg.guild == null) {
    reply(msg, onlyservermessage);
  } else if (
      !broadcasts[msg.guild.id] || broadcasts[msg.guild.id].queue.length == 0) {
    reply(
        msg,
        "The queue appears to be empty.\nI can't remove nothing from nothing!");
  } else {
    var indexString = msg.replace('remove', '').replace('dequeue', '');
    if (indexString.startsWith(' ')) {
      reply(
          msg,
          "You must specify the index of the song to dequeue.\nYou can view the queue with \"" +
              prefix + "queue\".");
    } else {
      var index = Number(indexString);
      if (typeof index !== 'number') {
        reply(msg, "That is not a valid index!");
      } else {
        var removed = broadcasts[msg.guild.id].queue.splice(index - 1, 1)[0];
        reply(msg, "Dequeued: " + removed.info.title);
      }
    }
  }
});
command.on('reboot', msg => {
  if (msg.author.id == spikeyId) {
    reply(msg, "Rebooting in 4 seconds!");
    setTimeout(function() { process.exit(1) }, 1000);
  } else {
    reply(msg, "LOL! Good try!");
  }
});

// Dev: https://discordapp.com/oauth2/authorize?&client_id=422623712534200321&scope=bot
// Rel: https://discordapp.com/oauth2/authorize?&client_id=318552464356016131&scope=bot
if (isDev) {
  client.login('NDIyNjIzNzEyNTM0MjAwMzIx.DYeenA.K5pUxL8GGtVm1ml_Eb6SaZxSKnE');
} else {
  client.login("MzE4NTUyNDY0MzU2MDE2MTMx.DA0JAA.aNNIG_xR7ROtL4Ro_WZQjLiMLF0");
}
