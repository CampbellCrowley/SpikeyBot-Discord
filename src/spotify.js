// Copyright 2018 Campbell Crowley. All rights reserved.
// Author: Campbell Crowley (dev@campbellcrowley.com)
const https = require('https');
require('./subModule.js')(Spotify);
/**
 * @classdesc Attempts to play what a user is playing on Spotify, to a voice
 * channel.
 * @class
 * @augments SubModule
 * @listens SpikeyBot~Command#spotify
 * @fires SpikeyBot~Command#play
 */
function Spotify() {
  const self = this;
  this.myName = 'Spotify';

  const apiRequest = {
    protocol: 'https:',
    host: 'api.spotify.com',
    path: '/v1/me/player/currently-playing',
    method: 'GET',
  };

  /** @inheritdoc */
  this.initialize = function() {
    self.command.on('spotify', commandSpotify, true);
  };
  /** @inheritdoc */
  this.shutdown = function() {
    self.command.deleteEvent('spotify');
  };
  /** @inheritdoc */
  this.unloadable = function() {
    return true;
  };

  /**
   * Lookup what a user is listening to on Spotify, then attempt to play the
   * song in the requester's voice channel.
   *
   * @private
   * @type {commandHandler}
   * @param {Discord~Message} msg The message that triggered command.
   * @listens SpikeyBot~Command#spotify
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
    self.bot.accounts.getSpotifyToken(userId, (res) => {
      if (!res) {
        self.common.reply(
            msg,
            'Discord account is not linked to Spotify.\nPlease link account a' +
                't spikeybot.com to use this command.',
            'https://www.spikeybot.com/account/');
        return;
      }
      let req = https.request(apiRequest, (res) => {
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
              self.common.reply(
                  msg, 'Unable to get current Spotify status.', 'Bad Response');
              return;
            }
            let artists = (parsed.item.artists || [])
                .map((a) => {
                  return a.name;
                })
                .join(', ');
            let songInfo = {
              name: parsed.item.name,
              artist: artists,
              album: parsed.item.album.name,
              progress: parsed.progress_ms,
              isPlaying: parsed.is_playing,
            };
            startMusic(msg, songInfo);
          } else if (res.statusCode == 204) {
            self.common.reply(msg, 'Not listening to anything on Spotify.');
          } else {
            self.error(
                'Unable to fetch spotify currently playing info for user: ' +
                userId);
            console.error(content);
            self.common.reply(
                msg, 'Unable to get current Spotify status.', res.statusCode);
          }
        });
      });
      req.setHeader('Authorization', 'Bearer ' + res);
      req.end();
    });
  }

  /**
   * Attempt to start playing the given song into a voice channel.
   * @private
   * @param {Discord~Message} msg Message that caused this to happen, and to
   * pass into {@link SpikeyBot~Command} as context.
   * @param {{name: string, artist: string, progress: number}} song The current
   * song information. Name is song name, progress is progress into the song in
   * milliseconds.
   */
  function startMusic(msg, song) {
    msg.content = msg.prefix + 'play ' + song.name + ' by ' + song.artist +
        ' && seek ' + Math.round(song.progress / 1000);
    console.log(msg.content);
    self.command.trigger('play', msg);
  }
}
module.exports = new Spotify();
