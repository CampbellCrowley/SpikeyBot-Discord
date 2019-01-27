// Copyright 2018 Campbell Crowley. All rights reserved.
// Author: Campbell Crowley (dev@campbellcrowley.com)
const https = require('https');
require('./subModule.js')(Spotify);
/**
 * @classdesc Attempts to play what a user is playing on Spotify, to a voice
 * channel.
 * @class
 * @augments SubModule
 * @listens Command#spotify
 */
function Spotify() {
  const self = this;
  this.myName = 'Spotify';

  let music;

  /**
   * The request to send to spotify to fetch the currently playing information
   * for a user.
   * @private
   * @default
   * @constant
   * @type {Object}
   */
  const apiRequest = {
    protocol: 'https:',
    host: 'api.spotify.com',
    path: '/v1/me/player/currently-playing',
    method: 'GET',
  };

  /** @inheritdoc */
  this.initialize = function() {
    self.command.on('spotify', commandSpotify, true);
    checkMusic();
  };
  /** @inheritdoc */
  this.shutdown = function() {
    self.command.deleteEvent('spotify');
    for (const i in following) {
      if (following[i]) endFollow({guild: {id: i}});
    }
  };
  /** @inheritdoc */
  this.unloadable = function() {
    return true;
  };

  /**
   * The current users we are monitoring the spotify status of, and some related
   * information. Mapped by guild id.
   * @private
   * @type {Object}
   */
  const following = {};

  /**
   * Lookup what a user is listening to on Spotify, then attempt to play the
   * song in the requester's voice channel.
   *
   * @private
   * @type {commandHandler}
   * @param {Discord~Message} msg The message that triggered command.
   * @listens Command#spotify
   */
  function commandSpotify(msg) {
    if (!self.bot.accounts) {
      self.common.reply(msg, 'Unable to lookup account information.');
      return;
    }
    let userId = msg.author.id;
    if (msg.mentions.users.size > 0) {
      userId = msg.mentions.users.first().id;
    }
    const subCmd = msg.text.trim().split(' ')[0];
    let infoOnly = false;
    switch (subCmd) {
      case 'info':
      case 'inf':
      case 'playing':
      case 'current':
      case 'currently':
      case 'status':
      case 'stats':
      case 'stat':
        infoOnly = true;
        break;
    }
    if (!infoOnly && music.isSubjugated(msg) && following[msg.guild.id]) {
      endFollow(msg);
      self.common.reply(msg, 'Stopped following Spotify.', '<@' + userId + '>');
      if (following[msg.guild.id] && userId == following[msg.guild.id].user) {
        return;
      }
    }
    getCurrentSong(userId, (err, song) => {
      if (err) {
        if (err == 'Unlinked') {
          self.common.reply(
              msg,
              'Discord account is not linked to Spotify.\nPlease link account' +
                  ' at spikeybot.com to use this command.',
              'https://www.spikeybot.com/account/');
        } else if (err == 'Bad Response') {
          self.common.reply(
              msg, 'Unable to get current Spotify status.',
              'Bad response from Spotify');
        } else if (err == 'Nothing Playing') {
          self.common.reply(msg, 'Not listening to anything on Spotify.');
        } else {
          self.common.reply(msg, 'Unable to get current Spotify status.', err);
        }
        if (infoOnly || err != 'Nothing Playing') return;
      }
      if (infoOnly) {
        self.common.reply(
            msg, 'Song: ' + song.name + '\nArtist: ' + song.artist +
                '\nAlbum: ' + song.album + '\nProgress: ' +
                Math.round(song.progress / 1000) + ' seconds in.\nCurrently ' +
                (song.isPlaying ? 'playing' : 'paused'));
      } else {
        self.common.reply(
            msg,
            'Following Spotify music. Music control is now subjugated by ' +
                'Spotify.\n(Please wait, seeking may take a while)',
            '<@' + userId + '>');
        updateFollowingState(msg, userId, song, true);
        return;
      }
    });
  }

  /**
   * Fetch the current playing song on spotify for the given discord user id.
   *
   * @private
   * @param {string|number} userId The Discord user id to lookup.
   * @param {Fucntion} cb Callback with err, and data parameters.
   */
  function getCurrentSong(userId, cb) {
    self.bot.accounts.getSpotifyToken(userId, (res) => {
      if (!res) {
        cb('Unlinked');
        return;
      }
      const req = https.request(apiRequest, (res) => {
        let content = '';
        res.on('data', (chunk) => {
          content += chunk;
        });
        res.on('end', () => {
          if (res.statusCode == 200) {
            let parsed;
            try {
              parsed = JSON.parse(content);
            } catch (err) {
              self.error('Failed to parse Spotify response: ' + userId);
              console.log(err, content);
              cb('Bad Response');
              return;
            }
            if (!parsed.item) {
              cb('Nothing Playing');
              return;
            }
            const artists = (parsed.item.artists || [])
                .map((a) => {
                  return a.name;
                })
                .join(', ');
            const songInfo = {
              name: parsed.item.name,
              artist: artists,
              album: parsed.item.album.name,
              progress: parsed.progress_ms,
              isPlaying: parsed.is_playing,
              duration: parsed.duration_ms,
            };
            cb(null, songInfo);
          } else if (res.statusCode == 204) {
            cb('Nothing Playing');
          } else {
            self.error(
                'Unable to fetch spotify currently playing info for user: ' +
                userId);
            console.error(content);
            cb(res.statusCode || 'VERY SCARY ERROR');
          }
        });
      });
      req.setHeader('Authorization', 'Bearer ' + res);
      req.end();
    });
  }

  /**
   * Check on the user's follow state and update the playing status to match.
   * @private
   *
   * @param {Discord~Message} msg The message to use as context.
   * @param {string|number} userId The discord user id that we are following.
   * @param {Object} [songInfo] If song info is provided, this will not be
   * fetched first. If it is not, the information will be fetched from Spotify
   * first.
   * @param {boolean} [start=false] Should we setup the player with our settings
   * because this is the first run?
   */
  function updateFollowingState(msg, userId, songInfo, start = false) {
    checkMusic();
    if (!start && !music.isSubjugated(msg)) {
      endFollow(msg);
      return;
    }
    if (!songInfo) {
      getCurrentSong(userId, (err, song) => {
        if (err) {
          if (err == 'Nothing Playing') {
            if (!following[msg.guild.id]) {
              following[msg.guild.id] = {};
            }
            following[msg.guild.id].timeout =
                self.client.setTimeout(function() {
                  updateFollowingState(msg, userId, null, true);
                }, 3000);
          } else {
            self.error(err);
          }
          return;
        }
        songInfo = song;
        makeTimeout();
      });
    } else {
      makeTimeout();
    }

    /**
     * Start playing the music, and create a timeout to check the status, or for
     * the next song.
     * @private
     */
    function makeTimeout() {
      if (!start && !music.isSubjugated(msg)) {
        endFollow(msg);
        return;
      }
      music.clearQueue(msg);
      if (start) {
        music.subjugate(msg);
      }
      if (songInfo && (start || songInfo.progress < 60000)) {
        startMusic(msg, songInfo);
      }
      if (following[msg.guild.id] && following[msg.guild.id].timeout) {
        self.client.clearTimeout(following[msg.guild.id].timeout);
      }
      following[msg.guild.id] = {
        user: userId,
        song: songInfo,
        lastUpdate: Date.now(),
      };

      if (!songInfo || songInfo.duration) {
        const delay = songInfo ? (songInfo.duration - songInfo.progress) : 3000;
        following[msg.guild.id].timeout = self.client.setTimeout(function() {
          updateFollowingState(msg, userId);
        }, delay);
      } else {
        following[msg.guild.id].timeout = self.client.setTimeout(function() {
          updateDuration(msg, userId);
        }, 1000);
      }
    }
  }

  /**
   * Fetch the song's length from music because Spotify was unable to provide it
   * for us.
   * @private
   *
   * @param {Discord~Message} msg The context.
   * @param {string|number} userId The user id we are following.
   */
  function updateDuration(msg, userId) {
    checkMusic();
    if (following[msg.guild.id] && following[msg.guild.id].timeout) {
      self.client.clearTimeout(following[msg.guild.id].timeout);
    }
    if (!music.isSubjugated(msg)) {
      endFollow(msg);
      return;
    }
    const dur = music.getDuration(msg);
    const prog = music.getProgress(msg);
    if (dur != null && prog != null) {
      following[msg.guild.id].song.duration = dur * 1000;
      const f = following[msg.guild.id];

      const delay = f.song.duration - f.song.progress;
      following[msg.guild.id].timeout = self.client.setTimeout(function() {
        updateFollowingState(msg, userId);
      }, delay);
    } else {
      following[msg.guild.id].timeout = self.client.setTimeout(function() {
        updateDuration(msg, userId);
      }, 1000);
    }
  }

  /**
   * Attempt to start playing the given song into a voice channel.
   * @private
   * @param {Discord~Message} msg Message that caused this to happen, and to
   * pass into {@link Command} as context.
   * @param {{name: string, artist: string, progress: number}} song The current
   * song information. Name is song name, progress is progress into the song in
   * milliseconds.
   */
  function startMusic(msg, song) {
    checkMusic();
    const seek = Math.round(song.progress / 1000 + (song.progress / 1000 / 5));
    music.playSong(msg, song.name + ' by ' + song.artist, seek, true);
  }

  /**
   * Update current reference to music submodule.
   * @private
   */
  function checkMusic() {
    if (!music || !music.initialized) {
      music = self.bot.getSubmodule('./music.js');
    }
  }

  /**
   * Cleanup and delete data in order to stop following user.
   * @private
   * @param {Discord~Message} msg THe context to clear.
   */
  function endFollow(msg) {
    if (following[msg.guild.id]) {
      self.client.clearTimeout(following[msg.guild.id].timeout);
    }
    delete following[msg.guild.id];
    checkMusic();
    if (music) music.release(msg);
  }
}
module.exports = new Spotify();
