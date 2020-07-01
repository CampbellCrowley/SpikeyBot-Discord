// Copyright 2019-2020 Campbell Crowley. All rights reserved.
// Author: Campbell Crowley (dev@campbellcrowley.com)
const fs = require('fs');
const SubModule = require('./subModule.js');
delete require.cache[require.resolve('./locale/Strings.js')];
const Strings = require('./locale/Strings.js');

/**
 * @description Manages pet related commands.
 * @listens Command#language
 * @listens Command#lang
 * @listens Command#locale
 * @listens Command#setlanguage
 * @listens Command#setlang
 * @listens Command#setlocale
 * @listens Command#changelanguage
 * @listens Command#changelang
 * @listens Command#changelocale
 * @augments SubModule
 */
class LocaleManager extends SubModule {
  /**
   * @description SubModule managing language choices.
   */
  constructor() {
    super();
    /** @inheritdoc */
    this.myName = 'LocaleManager';

    /**
     * @description Instance of locale strings helper.
     * @private
     * @type {Strings}
     * @default
     * @constant
     */
    this._strings = new Strings('localeManager');
    this._strings.purge();

    /**
     * @description Language mappings read from file. This maps the common ways
     * to type a language, to the locale string we understand. All keys are
     * lower-case UTF-8 strings.
     * @private
     * @type {object.<string>}
     * @default
     */
    this._mappings = {english: 'en_US'};
    /**
     * @description Locale settings set for specific guilds. If a guild is not
     * included in here, they are expected to use the default locale settings.
     * Mapped by guild ID.
     * @private
     * @type {object.<string>}
     * @default
     * @constant
     */
    this._guilds = {};

    fs.watchFile(
        LocaleManager._localeMapFilename, {persistent: false},
        this._readLocaleMap);
    this._readLocaleMap();

    this._commandLanguage = this._commandLanguage.bind(this);
  }

  /** @inheritdoc */
  initialize() {
    this.command.on(
        new this.command.SingleCommand(
            [
              'language', 'lang', 'locale', 'setlanguage', 'setlang',
              'setlocale', 'changelanguage', 'changelang', 'changelocale',
            ],
            this._commandLanguage, {
              validOnlyInGuild: true,
              defaultDisabled: true,
              permissions: this.Discord.Permissions.FLAGS.MANAGE_GUILD,
            }));

    this.client.guilds.cache.forEach((g) => {
      const fn =
          `${this.common.guildSaveDir}${g.id}${LocaleManager._localeSaveFile}`;
      this.common.readFile(fn, (err, data) => {
        if (err) {
          if (err.code !== 'ENOENT') {
            this.error(`Failed to read guild locale settings: ${fn}`);
            console.error(err);
          }
          return;
        }
        const str = data.toString();
        if (!Strings.parseLocale(str)) {
          this.error(`${str} is not a valid locale: ${fn}`);
          return;
        }
        this._guilds[g.id] = str;
      });
    });

    /**
     * @description Inject the {@link LocaleManager.getLocale} function into
     * {@link SpikeyBot} instance. Will be undefined if this SubModule is not
     * loaded. Gets re-set to `undefined` on shutdown.
     * @public
     * @see {@link LocaleManager.getLocale}
     * @type {?Function}
     * @param {*} args Args passed directly to {@link LocaleManager.getLocale}.
     * @returns {?string} Locale string, or null.
     */
    this.bot.getLocale = (...args) => this.getLocale(...args);
  }
  /** @inheritdoc */
  shutdown() {
    this.command.removeListener('language');
    fs.unwatchFile(LocaleManager._localeMapFilename, this._readLocaleMap);
    this.bot.getLocale = undefined;
  }

  /**
   * @description Read the current locale mapping information from file.
   * @private
   */
  _readLocaleMap() {
    fs.readFile(LocaleManager._localeMapFilename, (err, data) => {
      if (err) {
        this.error('Failed to read language to locale mapping information.');
        console.error(err);
        return;
      }
      try {
        const parsed = JSON.parse(data);
        const entries = Object.entries(parsed);
        let fail = false;
        entries.forEach((obj) => {
          if (obj[0].match(/(\n|\r)+/)) {
            fail = true;
            this.error(
                obj[0].replace(/\n/g, '\\n').replace(/\r/g, '\\r') +
                ': May not contain a new-line character.');
          } else if (obj[0].match(/\s+/)) {
            fail = true;
            this.error(obj[0] + ': May not contain white-space.');
          } else if (obj[0] !== obj[0].toLocaleLowerCase()) {
            fail = true;
            this.error(obj[0] + ': Must only be lower-case characters.');
          } else if (!Strings.parseLocale(obj[1])) {
            fail = true;
            this.error(obj[0] + ': Does not map to valid locale: ' + obj[1]);
          }
        });
        if (fail) {
          throw new Error('Found invalid keys in language to locale mapping.');
        }
        this._mappings = parsed;
        this.debug('Language-Locale map updated.');
      } catch (err) {
        this.error('Failed to parse language to locale mapping information.');
        console.error(err);
        return;
      }
    });
  }

  /**
   * @description Get the locale of the given language strings.
   * @public
   * @param {string} lang The language string to lookup in the map.
   * @returns {?string} Locale string, or null if unable to find.
   */
  langToLocale(lang) {
    return this._mappings[lang.toLocaleLowerCase()];
  }

  /**
   * @description Filename relative to cwd to find language to locale mapping
   * information.
   * @private
   * @static
   * @constant
   * @type {string}
   */
  static get _localeMapFilename() {
    return './strings/map.json';
  }

  /**
   * @description Filename relative to guild directory storing the guild's
   * locale settings.
   * @private
   * @static
   * @constant
   * @type {string}
   */
  static get _localeSaveFile() {
    return '/locale.txt';
  }

  /**
   * @description Get the locale string for a specified guild.
   * @public
   * @param {string} gId The ID of the guild to fetch.
   * @returns {?string} Locale string, or null if default.
   */
  getLocale(gId) {
    return gId && this._guilds[gId];
  }

  /**
   * @description Change the chosen locale value in a specific guild.
   * @public
   * @param {string} gId The guild ID.
   * @param {string} locale The valid locale string to set the value to.
   */
  changeLocale(gId, locale) {
    if (!Strings.parseLocale(locale)) {
      throw new TypeError('Locale is not valid.');
    }
    this._guilds[gId] = locale;
    const fn =
        `${this.common.guildSaveDir}${gId}${LocaleManager._localeSaveFile}`;
    this.common.mkAndWrite(fn, null, locale, (err) => {
      if (err) {
        this.error(`Failed to save locale settings: ${fn}`);
        console.error(err);
        return;
      }
      this.debug(`Updated Locale: ${gId} ${locale}`);
    });
  }

  /**
   * @description User typed the language command.
   * @private
   * @type {commandHandler}
   * @param {external:Discord~Message} msg Message that triggered command.
   * @listens Command#language
   * @listens Command#lang
   * @listens Command#locale
   * @listens Command#setlanguage
   * @listens Command#setlang
   * @listens Command#setlocale
   * @listens Command#changelanguage
   * @listens Command#changelang
   * @listens Command#changelocale
   */
  _commandLanguage(msg) {
    const text = msg.text.trim();
    if (!text || text.length < 2) {
      this._strings.reply(
          this.common, msg, 'title', 'currentLocale',
          msg.locale || this._strings.defaultLocale);
      return;
    }
    const locale = this.langToLocale(text);
    if (!locale) {
      this._strings.reply(this.common, msg, 'title', 'invalidLocale');
      return;
    }
    const desc = msg.channel.permissionsFor(msg.guild.me)
        .has(this.Discord.Permissions.FLAGS.ADD_REACTIONS) ?
        'fillOne' :
        'confirmLocaleReact';
    const emoji = '✅';
    const p = this._strings.reply(
        this.common, msg, 'confirmLocale', desc, locale, emoji);
    p.then((msg_) => {
      msg_.react(emoji);
      msg_.awaitReactions(
          (reaction, user) =>
            user.id === msg.author.id && reaction.emoji.name === emoji,
          {max: 1, time: 30 * 1000})
          .then((reactions) => {
            if (reactions.size === 0) {
              msg_.edit('Timed out');
              msg_.reactions.removeAll().catch(() => {});
              return;
            }
            msg_.edit('Confirmed');
            msg_.reactions.removeAll().catch(() => {});
            this.changeLocale(msg.guild.id, locale);
          });
    });
  }
}

module.exports = new LocaleManager();
