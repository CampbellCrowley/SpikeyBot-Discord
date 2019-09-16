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
    // {} is replaced with command prefix.
    this.unknownCommandHelp = '`{}help` for help.';
    this.messageRejected =
        'Discord rejected my normal message for some reason...';
    this.legacyEventNoticeTitle = 'Important Legacy Event Notice';
    // {} is replaced with command prefix.
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
    // {} is replaced with some word or symbol meaning "nothing".
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
    // Both {0} is replaced with command prefix.
    this.startInProgressBody = '`{0}next` for next day, or `{0}end` to abort)';
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
    // {} is replaced with command prefix.
    this.pauseAutoNoAutoBody = 'If you wish to autoplay, type `{}autoplay`.';
    // {} is replaced with the ID of the user that ran the command.
    this.pauseAuto =
        '<@{}> `Autoplay will stop at the end of the current day.`';
    this.startAutoAlreadyEnabled = 'Autoplay is already enabled.';
    // {} is replaced with the command prefix.
    this.resumeAutoInstructions = 'To resume the game, use `{}resume`.';
    // {} is replaced with the ID of the user that ran the command.
    this.startAutoDay = '<@{}> `Enabling Autoplay! Starting the next day!`';
    // {} is replaced with the ID of the user that ran the command.
    this.startAutoGame = '<@{}> `Autoplay is enabled. Starting the games!`';
    this.enableAutoTitle = 'Enabling Autoplay';
    // {} is replaced with the ID of the user that ran the command.
    this.enableAuto = '<@{}> `Enabling autoplay!`';
    this.pauseGameNoGame = 'Failed: There isn\'t currently a game in progress.';
    this.pauseGameAlreadyPaused = 'Failed: Game is already paused.';
    this.pauseGmaeTitle = 'Game Pausing';
    this.needStartGameTitle = 'You must start a game first!';
    this.needStartGameBody = 'Use `{}start` to start a game!';
    this.nextDayAlreadySimulating = 'Already simulating day.';
    this.nextDayAlredySimBroken =
        'I think I\'m already simulating... if this isn\'t true this game has' +
        ' crashed and you must end the game.';
    this.nextDayPermImagesTitle =
        'Sorry, but I need permission to send images in this channel before I' +
        ' can start the games.';
    this.nextDayPermImagesBody =
        'Please ensure I have the "Attach Files" permission in this channel.';
    this.nextDayPermEmbedTitle =
        'Sorry, but I need permission to embed messages in this channel ' +
        'before I can start the games.';
    this.nextDayPermEmbedBody =
        'Please ensure I have the "Embed Links" permission in this channel.';
    this.noPermNext =
        'Sorry, but you don\'t have permission to start the next day in the ' +
        'games.';
    this.endGameNoGame = 'There isn\'t a game in progress.';
    this.endGameLoading =
        'Game is currently loading. Please wait, then try again.';
    this.endGameSuccess = 'The game has ended!';

    // {0} is the group that was modified (ie: "All users").
    // {1} is what was modified (ie: "have been added to the games.").
    this.excludeTemplate = '{0} {1}';
    this.usersAll = 'All users';
    this.usersOnline = 'All online users';
    this.usersOffline = 'All offline users';
    this.usersIdle = 'All idle users';
    this.usersDND = 'All DND users';
    this.usersNPCs = 'All NPCs';
    this.usersBots = 'Bots';
    this.excludeBlocked = 'are now blocked from the games.';
    this.excludeFuture = 'will be removed from the next game.';
    this.excludePast = 'have been removed from the games.';
    this.includeUnblocked = 'can now be added to the games.';
    this.includeFuture = 'will be added into the next game.';
    this.includePast = 'have been added to the games.';
    this.noGame = 'No game';

    this.excludeNoMention =
        'You must specify who you wish for me to exclude from the next game.';
    this.includeNoMention =
        'You must specify who you wish for me to include in the next game.';

    this.stillLoading =
        'A previous command is still loading.\nPlease wait for it to complete.';
    this.usersInvalid = 'Invalid users';
    this.excludeInvalidId = '{} is not a valid id.';
    this.includeBotsDisabled = '{} is a bot, but bots are disabled.';
    this.includeSkipped = '{} skipped.';
    this.excludeLargeSuccess = 'Succeeded without errors ({} excluded)';
    this.includeLargeSuccess = 'Succeeded without errors ({} included)';
    this.excludeAlreadyExcluded = '{} is already excluded.';
    this.includeAlreadyIncluded = '{} is already included.';
    this.excludeUnableToFind = '{} unable to be found (already excluded?).';
    this.includeUnableToFind = '{} unable to be found (already included?).';
    this.excludeBlacklist = '{} added to blacklist.';
    this.includeWhitelist = '{} added to whitelist.';
    this.excludeFailedUnknown = 'Failed to remove {} for an unknown reason.';

    this.playerRefreshInfo = 'To refresh: `{}create`';

    this.gameNotCreated = 'A game has not been created yet.';
    this.messageRejected =
        'Oops, Discord rejected my message for some reason...';
    this.listPlayerTitle = 'List of players';

    this.success = 'Success';
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
