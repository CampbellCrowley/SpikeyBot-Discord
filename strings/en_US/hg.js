// Copyright 2019-2020 Campbell Crowley. All rights reserved.
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
    this.legacyNoLegacyTitle = 'No legacy events.';
    this.legacyNoLegacyBody =
        'Unable to find any legacy events, and thus there is no operation to ' +
        'perform.';
    this.legacyNoClaimed = 'No Events Claimed';
    this.legacyClaimed = 'Events claimed';
    this.legacyBackup = 'Backup of the saved legacy event data.';
    this.legacyWeaponReset =
        'Events that give weapons were reset.\n\nYou can edit events on the ' +
        'website to give the weapons again.';
    this.legacyWeaponNoReset = 'No deleted weapon info.';
    this.legacyFailuresUnknown =
        '\nSome events failed to be converted due to unknown errors.';
    this.legacyNoFailures = '\nNo errors.';
    this.legacyNoneFound = 'No legacy events found to update.';
    this.legacyEventCommandResponseTitle =
        'This command is no longer available.';
    this.legacyEventCommandResponseBody =
        'Please use https://www.spikeybot.com/hg/#?guild={} to manage custom ' +
        'events.';
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
    // {} is replaced with command prefix.
    this.gameStartNextDayInfo = '"{}next" for next day.';
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
    this.reactFailedTitle = 'Reaction Join Failed';
    this.reactSuccessTitle = 'Reaction Join';
    this.reactToJoinTitle = 'React with any emoji to join!';
    this.reactToJoinBody =
        'If you have reacted, you will be included in the next `{}`';
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
    this.pauseGameTitle = 'Game Pausing';
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
    this.renameGameSuccess = 'Renamed game to';
    this.renameGameFail =
        'Oops! I couldn\'t change the name to that. Please ensure it is less' +
        ' than 100 characters long.';

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

    this.effectPlayerKillNoPlayer =
        'Please specify a player in the games to kill.';
    this.effectPlayerHealNoPlayer =
        'Please specify a player in the games to heal.';
    this.effectPlayerWoundNoPlayer =
        'Please specify a player in the games to wound.';
    this.effectPlayerNoPlayer = 'No players given.';
    this.effectPlayerNoPlayerFound = 'No players found.';
    this.effectPlayerNoOutcome = 'No outcome given.';

    this.modifyPlayerTitle = 'Modify Player';
    this.modifyPlayerNoPlayer = 'Please specify a player to modify.';
    this.modifyPlayerNoPlayerInGame =
        'Please specify a player that is in the game.';
    this.modifyPlayerNoWeapon = 'Please specify a valid weapon name.';
    this.modifyPlayerMultipleWeapon =
        'I\'m not sure which weapon you wanted, I found more than one.';
    this.modifyPlayerCountNonZero = 'Count must be non-zero number.';
    this.modifyPlayerUnableToFindWeapon = 'Unable to find weapon.';
    // {0} is name of player modified, {1} is number of weapons player now has,
    // {2} is name of the weapon the player has.
    this.modifyPlayerNowHas = '{0} now has {1} {2}';
    // {0} is name of player modified, {1} is number of weapons player will
    // have, {2} is name of the weapon the player will have.
    this.modifyPlayerWillHave = '{0} will have {1} {2}';

    this.noGameInProgress = 'No game in progress.';
    this.unableToFindPlayer = 'Unable to find player.';

    this.playerRefreshInfo = 'To refresh: `{}create`';

    this.gameNotCreated = 'A game has not been created yet.';
    this.messageRejected =
        'Oops, Discord rejected my message for some reason...';
    this.listPlayerTitle = 'List of players';
    this.listPlayerNoPlayersTitle = 'No Players';
    this.listPlayerNoPlayersBody = 'No game created or no players in the game.';
    this.listPlayerIncludedNum = 'Included ({})';
    this.listPlayerExcludedNum = 'Excluded ({})';

    this.optionNoOptions = 'No options have been set.';
    this.optionCreateGame = 'Please create a game first. `{}create`';
    this.optionInvalidChoice =
        'That is not a valid option to change! ({0})\nUse `{1}options` to see' +
        ' all changeable options.';
    this.optionTeamDuringGame =
        'Teams and included players cannot be modified during a game.\nYou ' +
        'must end the current game first to do this.';
    this.optionInvalidNumber =
        'That is not a valid value for {0}, which requires a number. ' +
        '(Currently {1})';
    this.optionChangeTeam =
        'Set {0} to {1} from {2}\nTo reset teams to the correct size, type ' +
        '"{3}teams reset".\nThis will delete all teams, and create new ones.';
    this.optionChange = 'Set {0} to {1} from {2}';
    this.optionInvalidBoolean =
        'That is not a valid value for {0}, which requires true or false. ' +
        '(Currently {1})';
    this.optionServerToLargeExclude =
        'Due to performance issues, large servers must exclude new users by ' +
        'default.';
    this.optionInvalidString =
        'That is not a valid value for {}, which requires one of the ' +
        'following: {}. (Currently {})';
    this.optionInvalidObject = '`{}` is not a valid option to change!';
    this.optionInvalidType =
        'Changing the value of this option does not work yet. ({0}: {1})' +
        '\n{2}({3})';
    this.optionListTitle = 'Current Options';
    this.optionListSimpleExampleTitle = 'Simple Example';
    this.optionListSimpleExampleBody = '{}options includeBots true';
    this.optionListObjectExampleTitle = 'Change Object Example';
    this.optionListObjectExampleBody = '{}options playerOutcomeProbs kill 23';

    this.teamEditNoGame =
        'There isn\'t currently any game to edit. Please create one first.';
    this.teamEditInProgress =
        'You must end the current game before editing teams.';
    this.teamEditNoTeams =
        'There are no teams to edit. If you wish to have teams, you can set ' +
        'teamSize to the size of teams you wish to have.';
    // {} is replaced with team number.
    this.teamDefaultName= 'Team {}';
    this.teamSwapNeedTwo =
        'Swapping requires mentioning 2 users to swap teams with eachother.';
    this.teamSwapNoTeam = 'Please ensure both users are on a team.';
    this.teamSwapSuccess = 'Swapped players!';
    this.teamMoveNoMention = 'You must at least mention one user to move.';
    this.teamMoveNoTeam = 'Is {} on a team?';
    this.teamMoveBadFormat =
        'Please ensure the first option is the user, and the second ' +
        'is the destination (either a mention or a team id).';
    this.teamMoveSuccess = 'Moving `{0}` from {1} to {2}';
    this.teamRenameNoId =
        'Please specify a team id, or mention someone on a team, in order to ' +
        'rename their team.';
    this.teamRenameInvalidIdTitle = 'Please specify a valid team id';
    this.teamRenameInvalidIdBody = '(1 - {})';
    this.teamRenameSuccess = 'Renaming "{0}" to "{1}"';
    this.teamRandomizeNoTeams = 'There are no teams to randomize.';
    this.teamRandomizeSuccess = 'Teams have been randomized!';

    this.createInProgressTitle =
        'This server already has a Hungry Games in progress.';
    this.createInProgressBody =
        'If you wish to create a new one, you must end the current one first ' +
        'with "{}end".';
    this.createRefreshing = 'Refreshing current game.';
    this.createNew =
        'Created a Hungry Games with default settings and all members ' +
        'included.';

    this.npcUnknownTitle = 'I\'m not sure which NPC that is.';
    this.npcUnknownBody = '{0}\nUse `{1}npc list` to show all current NPCs.';
    this.npcListTitle = 'List of NPCs';
    this.npcTooMany =
        'This is possibly because there are too many NPCs in the games to ' +
        'show in this list.';
    this.npcNoImage = 'Hmm, you didn\'t give me an image to use as an avatar.';
    this.npcNoUsername = 'Please specify a valid username.';
    this.npcBadURL = 'Hmm, that link doesn\'t appear to work.';
    this.npcBadURLMime =
        'Hmm, that link does not appear to be a supported media type.';
    this.npcConfirmTitle = 'Confirm NPC Creation';
    this.npcConfirmDescription =
        'Click the {0} reaction to confirm, {1} to cancel.';
    this.confirmed = 'Confirmed';
    this.cancelled = 'Cancelled';
    this.timedOut = 'Timed out';
    this.npcCreateWentWrongTitle =
        'Oops, something went wrong while creating that NPC...';
    this.npcCreateWentWrongBody = 'This should not happen D:';
    this.npcCreateFailed = 'Failed to create NPC';
    this.invalidAvatarURL = 'Invalid Avatar URL.';
    this.invalidNPCId = 'Invalid NPC ID.';
    this.avatarIdMismatch = 'ID does not match avatar ID.';
    this.npcCreated = 'Created NPC: {}';
    this.npcRenameSpecify = 'Please specify an NPC to rename.';
    this.npcRenameFailed = 'Failed to rename NPC';
    this.npcRenameSuccessTitle = 'Renamed NPC';
    this.npcRenameSuccessBody = '`{0}` to `{1}`';
    this.npcDeleteSpecify = 'Please specify an NPC to delete.';
    this.npcDeleteFailed = 'Failed to delete NPC';
    this.npcDeleteSuccess = 'NPC Deleted';
    this.npcHalfDiscovered =
        'Oops, I was only half able to find that NPC. Something is broken...';

    this.statusCode = 'Status code: {}';
    this.invalidFileType = 'The provided filetype is not supported.';
    this.invalidFileSize = 'Please ensure the image is not larger than {}MB.';
    this.unknownFileSize = 'Unable to determine download size.';
    this.invalidImage = 'I wasn\'t able to convert that file into an image.';

    this.noStats = 'No Stats';
    this.statsAfterGame =
        'You haven\'t started a game before. Stats will be available after a ' +
        'game is started.';
    this.statsUserTitle = '{}\'s HG Stats';
    this.statsLifetime = 'Lifetime';
    this.statsPrevious = 'Previous Game';
    this.noGroupData = 'There is no group data yet.';
    this.groupCreateFirst = 'Please create a group first.';
    this.groupTitle = 'Stat Groups';
    this.groupNotFound = 'I wasn\'t able to find that group.';
    this.groupListFailedTitle = 'Failed to get list of groups.';
    this.groupListFailedBody = 'Something broke...';
    this.groupNone = 'There are no created groups.';
    this.groupCreatedAndSelected = 'Created and selected new stat group';
    this.groupDisabled = 'Disabled stat group';
    this.groupListCommand = 'List groups with `{}groups`';
    this.groupSelected = 'Selected Group';
    this.groupSpecifyId = 'Please specify a valid group ID.';
    this.groupRenamed = 'Renamed group';
    this.groupDeleted = 'Deleted group: {}';
    this.statsNoData = 'It doesn\'t look like you\'ve finished a game yet.';
    this.groupNoData =
        'It doesn\'t look like this group has any game data yet.';
    this.completeGameFirst = 'Check back after a game to see your stats!';
    this.lbFailed =
        'Oops! Something went wrong while fetching the leaderboard...';
    this.lbSendFailed =
        'Oops! I wasn\'t able to send the leaderboard here for an unknown ' +
        'reason.';
    this.rankedBy = 'Rank by {}';
    this.lifetime = 'lifetime';

    this.numsTitle = 'Stats Across Shards';
    this.numsFailure = 'Oops, something went wrong while fetching stats.';
    this.numsNumSimulating =
        'There are {0} games currently simulating of {1} currently loaded.';
    this.numsLastListener = '';

    this.ended = 'Ended';

    // English will only ever be used for this. Add languages to here, not
    // another language file.
    this.nothing = [
      'nix', 'naught', 'nothing', 'zilch', 'void', 'zero', 'zip', 'zippo',
      'diddly', '❌',
    ];

    this.groupWords = {
      everyone: ['everyone', '@everyone', 'all'],
      online: ['online', 'here', '@here'],
      offline: ['offline'],
      idle: ['idle', 'away', 'snooze', 'snoozed'],
      dnd: ['dnd', 'busy'],
      bots: ['bot', 'bots'],
      npcs: ['npc', 'npcs', 'ai', 'ais'],
    };

    this.pageNumbers = 'Page {0} of {1}';
    this.success = 'Success';
    this.noPermNext =
        'Sorry, but you don\'t have permission to start the next day in the ' +
        'games.';

    this.genericNoPerm =
        'Failed to run "{}" because you don\'t have permission for this.';

    this.largeServerDisabled =
        'Sorry, but HG has been temporarily disabled on servers larger than ' +
        '75000 people.';
    this.largeServerDisabledSub =
        'More information may be available on my support server.';
  }
}

module.exports = new EnUsHG();
