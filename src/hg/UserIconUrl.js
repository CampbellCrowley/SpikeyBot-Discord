// Copyright 2019 Campbell Crowley. All rights reserved.
// Author: Campbell Crowley (dev@campbellcrowley.com)

/**
 * @description Container for a user's avatar at icon size, with their id.
 * @memberof HungryGames
 * @inner
 */
class UserIconUrl {
  /**
   * @description Create a container for an icon to show.
   * @param {string} url Url of icon.
   * @param {string} id Id of the user the icon belongs to.
   * @param {string[]} [settings] Possible settings for the user related to how
   * this icon should be displayed.
   * @param {number} [fetchSize] Size of icon to fetch from Discord.
   */
  constructor(url, id, settings, fetchSize) {
    url = typeof url === 'string' ? url : '';
    /**
     * Size of the icon to request from Discord.
     *
     * @public
     * @type {number}
     */
    this.fetchSize = fetchSize || UserIconUrl.fetchSize;
    /**
     * Icon URL.
     *
     * @public
     * @type {string}
     */
    this.url = `${url.replace(/\?size=[0-9]*/, '')}?size=${this.fetchSize}`;
    /**
     * User ID.
     *
     * @public
     * @type {string}
     */
    this.id = id;
    /**
     * Optional user settings for displaying this icon.
     *
     * @public
     * @type {null|string[]}
     */
    this.settings = settings;
  }
}


/**
 * The default size of the icon to request from discord.
 *
 * @public
 * @static
 * @type {number}
 * @constant
 * @default
 */
UserIconUrl.fetchSize = 128;

/**
 * Get an array of icons urls from an array of users.
 *
 * @public
 * @static
 * @param {HungryGames~Player[]|HungryGames~Player} users Array of users to
 * process, or single user. Output will always be an array.
 * @returns {HungryGames~UserIconUrl[]} The user ids and urls for all users
 * avatars.
 */
UserIconUrl.from = function(users) {
  if (!Array.isArray(users)) users = [users];
  return users.map(function(obj) {
    return new UserIconUrl(obj.avatarURL, obj.id, obj.settings);
  });
};

module.exports = UserIconUrl;
