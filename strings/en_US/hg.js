// Copyright 2019 Campbell Crowley. All rights reserved.
// Author: Campbell Crowley (dev@campbellcrowley.com)
const Locale = require('../../src/locale/Locale.js');

/**
 * @description United States English.
 * @augments Locale
 */
class EnUsHG extends Locale {
  /**
   * @description Constructor.
   */
  constructor() {
    super();
    this.title = 'HG';
    this.helpMessageSuccess = 'I sent you a DM with commands!';
    this.helpMessageFailed =
        'I couldn\'t send you a message, you probably blocked me :(';
    this.unknownCommandSuggestionList =
        'Hmm, did you mean one of the following commands?';
    this.unknownCommandSuggestOne = 'Hmm, did you mean';
    this.unknownCommand = 'Oh noes! I can\'t understand that!';
    this.unknownCommandHelp = '`{}help` for help.';
    this.messageRejected =
        'Discord rejected my normal message for some reason...';
    this.legacyEventNoticeTitle = 'Important Legacy Event Notice';
    this.legacyEventNoticeBody =
        'Storage for custom events has been updated.\nUse `{}claimlegacy` to ' +
        'move all custom events to your account.\n\nBe aware that whoever ' +
        'runs the command, will be the only one who can edit the events, and ' +
        'will have sole ownership of the events.\n\nCustom events will not be' +
        ' used in the game until they have been claimed.';
    this.loadingTitle = 'Still loading';
    this.loadingBody =
        'A previous command is still loading. Please wait for it to complete.';
    this.makeMeWin = 'Everyone\'s probability of winning has increased!';
    this.makeMeLose = 'Your probability of losing has increased by {}!';
    this.resetTitle = 'Reset HG';
    this.resetNoData = 'There is no data to reset.';
    this.resetInProgress =
        'A game is currently in progress. Please end it before reseting game ' +
        'data.';
    this.resetAll = 'Reset ALL Hungry Games data for this server!';
    this.resetStats = 'Reset ALL Hungry Games stats for this server!';
    this.resetEvents = 'Reset ALL Hungry Games events for this server!';
    this.resetCurrent = 'Reset ALL data for current game!';
    this.resetOptions = 'Reset ALL options!';
    this.resetTeams = 'Reset ALL teams!';
    this.resetUsers = 'Reset ALL user data!';
    this.resetNPCs = 'Reset ALL NPC data!';
    this.resetActions = 'Reset ALL actions!';
    this.resetReact = 'Reset react message!';
    this.resetHelp =
        'Please specify what data to reset.\nall {deletes all data for this ' +
        'server},\nevents {deletes all custom events},\ncurrent {deletes all ' +
        'data about the current game},\noptions {resets all options to ' +
        'default values},\nteams {delete all teams and creates new ones},\n' +
        'users {delete data about where to put users when creating a new ' +
        'game},\nnpcs {delete all NPCS}.\nstats {delete all stats and ' +
        'groups}.\nactions {reset all actions to default settings}.\nreact ' +
        '{cancels hg react command}.';
    this.startedTitle = 'Game started!';
    this.startInProgressTitle = 'A game is already in progress!';
    this.startInProgressBody = '`{}next` for next day, or `{}end` to abort)';
    this.startNoAttachFiles = 'Sorry, but I need permission to send images in' +
        ' this channel before I can start the games.\nPlease ensure I have ' +
        'the "Attach Files" permission in this channel.';
    this.startNoEmbedLinks = 'Sorry, but I need permission to embed messages ' +
        'in this channel before I can start the games.\nPlease ensure I have ' +
        'the "Embed Links" permission in this channel.';
    this.noPermStart =
        'Sorry, but you don\'t have permission to start the games.';
    this.reactFailedTitle = 'React Join Failed';
    this.reactFailedNotStarted =
        'Unable to find message with reactions. Was a join via react started?';
    this.reactFailedNoChannel =
        'Unable to find message with reactions. Was the channel deleted?';
    this.reactFailedNoMessage =
        'Unable to find message with reactions. Was it deleted?';
    this.reactNoUsers = 'No users reacted.';
    this.createFailedUnknown = 'Failed to create game for unknown reason.';
    this.pauseAutoNoAutoTitle = 'Not autoplaying.';
    this.pauseAutoNoAutoBody = 'If you wish to autoplay, type `{}autoplay`.';
    this.pauseAuto =
        '<@{}> `Autoplay will stop at the end of the current day.`';
    this.startAutoAlreadyEnabled = 'Autoplay is already enabled.';
    this.resumeAutoInstructions = 'To resume the game, use `{}resume`.';
    this.startAutoDay = '<@{}> `Enabling Autoplay! Starting the next day!`';
    this.startAutoGame = '<@{}> `Autoplay is enabled. Starting the games!`';
    this.enableAutoTitle = 'Enabling Autoplay';
    this.enableAuto = '<@{}> `Enabling autoplay!`';

    this.noPermNext =
        'Sorry, but you don\'t have permission to start the next day in the ' +
        'games.';

    this.largeServerDisabled =
        'Sorry, but HG has been temporarily disabled on servers larger than ' +
        '75000 people.';
    this.largeServerDisabledSub =
        'More information may be available on my support server.';
  }
}

module.exports = new EnUsHG();

