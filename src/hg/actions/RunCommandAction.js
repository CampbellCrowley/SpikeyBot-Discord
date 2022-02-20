// Copyright 2019-2020 Campbell Crowley. All rights reserved.
// Author: Campbell Crowley (dev@campbellcrowley.com)
const ChannelAction = require('./ChannelAction.js');
const MessageMaker = require('../../lib/MessageMaker.js');

/**
 * @description Run a command in the game channel.
 *
 * @memberof HungryGames~Action
 * @inner
 * @augments HungryGames~Action~ChannelAction
 */
class RunCommandAction extends ChannelAction {
  /**
   * @description Create an action that will send a message to the game channel.
   * @param {string} msg The command string.
   * @param {
   *   string|
   *   Discord~User|
   *   Discord~GuildMember
   * } author The Discord user ID to run this command as.
   */
  constructor(msg, author) {
    super((hg, game, channel) => {
      try {
        const res = hg._parent.command.trigger(
            this._message,
            new MessageMaker(
                hg._parent, this._author, game.id, channel.id, this._message));
        if (!res) {
          channel
              .send({
                content: `<@${this._author}> RunCommandAction Failed: ` +
                    `Unknown command: ${this._message}`,
              })
              .catch(() => {});
        }
      } catch (err) {
        channel
            .send({
              content:
                  `<@${this._author}> RunCommandAction Failed: ${err.message}.`,
            })
            .catch(() => {});
      }
    });
    this.command = msg;
    this.author = author;
  }
  /**
   * @description Get the current command text.
   * @public
   * @returns {string} The current command text.
   */
  get command() {
    return this._command;
  }
  /**
   * @description Update the message with a new value.
   * @public
   * @param {string} msg The new message text.
   */
  set command(msg) {
    if (typeof msg !== 'string' || msg.length === 0) {
      throw new TypeError('Text must be a string!');
    }
    this._message = msg;
    this._saveData.command = msg;
  }
  /**
   * @description Get the current author ID.
   * @public
   * @returns {string} The current author ID.
   */
  get author() {
    return this._author;
  }
  /**
   * @description Update the author with a new value.
   * @public
   * @param {
   *   string|
   *   Discord~User|
   *   Discord~GuildMember
   * } author The new author or ID.
   */
  set author(author) {
    if (typeof author === 'string') {
      if (author.length === 0) throw new TypeError('Author cannot be empty!');
    } else if (author && author.id) {
      author = author.id;
    } else if (author && author.user && author.user.id) {
      author = author.user.id;
    } else {
      throw new TypeError('Author is invalid!');
    }
    this._author = author;
    this._saveData.author = author;
  }
  /**
   * @description Create action from save data.
   * @public
   * @static
   * @override
   * @param {Discord~Client} client Bot client context to get object
   * references.
   * @param {string} id Guild ID this action is for.
   * @param {object} obj The parsed data from file.
   * @returns {HungryGames~RunCommandAction} The created action.
   */
  static create(client, id, obj) {
    return new RunCommandAction(obj.command, obj.author);
  }
}

module.exports = RunCommandAction;
