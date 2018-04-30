## Classes

<dl>
<dt><a href="#Common">Common</a></dt>
<dd><p>Common functions accross my projects. Mostly just logging.</p>
</dd>
<dt><a href="#Main">Main</a> ⇐ <code><a href="#SubModule">SubModule</a></code></dt>
<dd><p>Basic commands and features for the bot.</p>
</dd>
<dt><a href="#Music">Music</a> ⇐ <code><a href="#SubModule">SubModule</a></code></dt>
<dd><p>Music and audio related commands.</p>
</dd>
<dt><a href="#SpikeyBot">SpikeyBot</a></dt>
<dd><p>Main class that manages the bot.</p>
</dd>
<dt><a href="#SubModule">SubModule</a></dt>
<dd><p>Base class for all Sub-Modules.</p>
</dd>
</dl>

## Functions

<dl>
<dt><a href="#updateEvents">updateEvents()</a></dt>
<dd><p>Parse all default events from file.</p>
</dd>
<dt><a href="#updateMessages">updateMessages()</a></dt>
<dd><p>Parse all messages from file.</p>
</dd>
<dt><a href="#updateBattles">updateBattles()</a></dt>
<dd><p>Parse all battles from file.</p>
</dd>
<dt><a href="#setupHelp">setupHelp()</a></dt>
<dd><p>Set all help messages once we know what prefix to use.</p>
</dd>
<dt><a href="#begin">begin(prefix_, Discord_, client_, command_, common_)</a></dt>
<dd><p>Initialize this submodule.</p>
</dd>
<dt><a href="#end">end()</a></dt>
<dd><p>Shutdown and disable this submodule. Removes all event listeners.</p>
</dd>
<dt><a href="#handleMessageEdit">handleMessageEdit(oldMsg, newMsg)</a></dt>
<dd><p>Hanlder for when the create event message is edited and we should update our
message with the updated event.</p>
</dd>
<dt><a href="#handleCommand">handleCommand(msg)</a></dt>
<dd><p>Handle a command from a user and pass into relevant functions.</p>
</dd>
<dt><a href="#mention">mention(msg)</a> ⇒ <code>string</code></dt>
<dd><p>Creates formatted string for mentioning the author of msg.</p>
</dd>
<dt><a href="#reply">reply(msg, text, post)</a> ⇒ <code>Promise</code></dt>
<dd><p>Replies to the author and channel of msg with the given message.</p>
</dd>
<dt><a href="#checkForRole">checkForRole(msg)</a> ⇒ <code>boolean</code></dt>
<dd><p>Check if author of msg has the required role to run commands.</p>
</dd>
<dt><a href="#checkPerms">checkPerms(msg, cb)</a></dt>
<dd><p>Check if author of msg has permissions, then trigger callback with guild id.</p>
</dd>
<dt><a href="#Player">Player(id, username, avatarURL)</a></dt>
<dd><p>Serializable container for data pertaining to a single user.</p>
</dd>
<dt><a href="#Team">Team(id, name, players)</a></dt>
<dd><p>Serializable container for data about a team in a game.</p>
</dd>
<dt><a href="#Event">Event(message, [numVictim], [numAttacker], [victimOutcome], [attackerOutcome], [victimKiller], [attackerKiller], battle, [state], attacks)</a></dt>
<dd><p>Event that can happen in a game.</p>
</dd>
<dt><a href="#makePlayer">makePlayer(user)</a> ⇒ <code><a href="#Player">Player</a></code></dt>
<dd><p>Create a Player from a given Disord.User.</p>
</dd>
<dt><a href="#sendAtTime">sendAtTime(channel, one, two, time)</a></dt>
<dd><p>Delay a message to send at the given time in milliseconds since epoch.</p>
</dd>
<dt><a href="#createGame">createGame(msg, id, [silent])</a></dt>
<dd><p>Create a Hungry Games for a guild.</p>
</dd>
<dt><a href="#getAllPlayers">getAllPlayers(members, excluded, bots)</a> ⇒ <code><a href="#Player">Array.&lt;Player&gt;</a></code></dt>
<dd><p>Form an array of Player objects based on guild members, excluded members, and
whether to include bots.</p>
</dd>
<dt><a href="#formTeams">formTeams(id)</a></dt>
<dd><p>Add users to teams, and remove excluded users from teams. Deletes empty
teams, and adds teams once all teams have teamSize of players.</p>
</dd>
<dt><a href="#resetGame">resetGame(msg, id)</a></dt>
<dd><p>Reset data that the user specifies.</p>
</dd>
<dt><a href="#showGameInfo">showGameInfo(msg, id)</a></dt>
<dd><p>Send all of the game data about the current server to the chat.</p>
</dd>
<dt><a href="#showGameEvents">showGameEvents(msg, id)</a></dt>
<dd><p>Send all event data about the default events to the chat.</p>
</dd>
<dt><a href="#startGame">startGame(msg, id)</a></dt>
<dd><p>Start the games in the channel this was called from.</p>
</dd>
<dt><a href="#pauseAutoplay">pauseAutoplay(msg, id)</a></dt>
<dd><p>Stop autoplaying.</p>
</dd>
<dt><a href="#startAutoplay">startAutoplay(msg, id)</a></dt>
<dd><p>Start autoplaying.</p>
</dd>
<dt><a href="#nextDay">nextDay(msg, id)</a></dt>
<dd><p>Simulate a single day then show events to users.</p>
</dd>
<dt><a href="#pickEvent">pickEvent(userPool, eventPool, options, numAlive, teams, deathRate)</a> ⇒ <code><a href="#Event">Event</a></code></dt>
<dd><p>Pick event that satisfies all requirements and settings.</p>
</dd>
<dt><a href="#validateEventTeamConstraint">validateEventTeamConstraint(numVictim, numAttacker, userPool, teams, options, victimsDie, attackersDie)</a> ⇒ <code>boolean</code></dt>
<dd><p>Ensure teammates don&#39;t attack eachother.</p>
</dd>
<dt><a href="#validateEventVictorConstraint">validateEventVictorConstraint(numVictim, numAttacker, numAlive, options, victimsDie, attackersDie)</a> ⇒ <code>boolean</code></dt>
<dd><p>Ensure the event we choose will not force all players to be dead.</p>
</dd>
<dt><a href="#validateEventNumConstraint">validateEventNumConstraint(numVictim, numAttacker, userPool, numAlive)</a> ⇒ <code>boolean</code></dt>
<dd><p>Ensure the number of users in an event is mathematically possible.</p>
</dd>
<dt><a href="#validateEventRequirements">validateEventRequirements(numVictim, numAttacker, userPool, numAlive, teams, options, victimsDie, attackersDie)</a> ⇒ <code>boolean</code></dt>
<dd><p>Ensure the event chosen meets all requirements for actually being used in the
current game.</p>
</dd>
<dt><a href="#pickAffectedPlayers">pickAffectedPlayers(numVictim, numAttacker, options, userPool, teams)</a> ⇒ <code><a href="#Player">Array.&lt;Player&gt;</a></code></dt>
<dd><p>Pick the players to put into an event.</p>
</dd>
<dt><a href="#makeBattleEvent">makeBattleEvent(affectedUsers, numVictim, numAttacker, mention, id)</a> ⇒ <code><a href="#Event">Event</a></code></dt>
<dd><p>Make an event that contains a battle between players before the main event
message.</p>
</dd>
<dt><a href="#weightedUserRand">weightedUserRand()</a> ⇒ <code>number</code></dt>
<dd><p>Produce a random number that is weighted by multiEventUserDistribution.</p>
</dd>
<dt><a href="#weightedEvent">weightedEvent(eventPool, weightOpt)</a> ⇒ <code>number</code></dt>
<dd><p>Produce a random event that using weighted probabilities.</p>
</dd>
<dt><a href="#isEventDeadly">isEventDeadly(eventTry)</a> ⇒ <code>boolean</code></dt>
<dd><p>Decide if the given event should be considered deadly.</p>
</dd>
<dt><a href="#formatMultiNames">formatMultiNames(names, mention)</a> ⇒ <code>string</code></dt>
<dd><p>Format an array of users into names based on options and grammar rules.</p>
</dd>
<dt><a href="#makeMessageEvent">makeMessageEvent(message, id)</a> ⇒ <code><a href="#Event">Event</a></code></dt>
<dd><p>Make an event that doesn&#39;t affect any players and is just a plain message.</p>
</dd>
<dt><a href="#makeSingleEvent">makeSingleEvent(message, affectedUsers, numVictim, numAttacker, mention, id, victimOutcome, attackerOutcome)</a> ⇒ <code>FinalEvent</code></dt>
<dd><p>Format an event string based on specified users.</p>
</dd>
<dt><a href="#getMiniIcons">getMiniIcons(users)</a> ⇒ <code><a href="#UserIconUrl">Array.&lt;UserIconUrl&gt;</a></code></dt>
<dd><p>Get an array of icons urls from an array of users.</p>
</dd>
<dt><a href="#printEvent">printEvent(msg, id)</a></dt>
<dd><p>Print an event string to the channel and add images, or if no events remain,
trigger end of day.</p>
</dd>
<dt><a href="#printDay">printDay(msg, id)</a></dt>
<dd><p>Trigger the end of a day and print summary/outcome at the end of the day.</p>
</dd>
<dt><a href="#endGame">endGame(msg, id)</a></dt>
<dd><p>End a game early.</p>
</dd>
<dt><a href="#excludeUser">excludeUser(msg, id)</a></dt>
<dd><p>Remove a user from users to be in next game.</p>
</dd>
<dt><a href="#includeUser">includeUser(msg, id)</a></dt>
<dd><p>Add a user back into the next game.</p>
</dd>
<dt><a href="#listPlayers">listPlayers(msg, id)</a></dt>
<dd><p>Show a formatted message of all users and teams in current server.</p>
</dd>
<dt><a href="#getName">getName(msg, user)</a> ⇒ <code>string</code></dt>
<dd><p>Get the username of a user id if available, or their id if they couldn&#39;t be
found.</p>
</dd>
<dt><a href="#toggleOpt">toggleOpt(msg, id)</a></dt>
<dd><p>Change an option to a value that the user specifies.</p>
</dd>
<dt><a href="#showOpts">showOpts(msg, options)</a></dt>
<dd><p>Format the options for the games and show them to the user.</p>
</dd>
<dt><a href="#optChangeListener">optChangeListener(msg_, options, index)</a></dt>
<dd><p>The callback for when the user chooses to change page of the options.</p>
</dd>
<dt><a href="#editTeam">editTeam(msg, id)</a></dt>
<dd><p>Entry for all team commands.</p>
</dd>
<dt><a href="#swapTeamUsers">swapTeamUsers(msg, id)</a></dt>
<dd><p>Swap two users from one team to the other.</p>
</dd>
<dt><a href="#moveTeamUser">moveTeamUser(msg, id)</a></dt>
<dd><p>Move a single user to another team.</p>
</dd>
<dt><a href="#renameTeam">renameTeam(msg, id)</a></dt>
<dd><p>Rename a team.</p>
</dd>
<dt><a href="#randomizeTeams">randomizeTeams(msg, id)</a></dt>
<dd><p>Swap random users between teams.</p>
</dd>
<dt><a href="#createEvent">createEvent(msg, id)</a></dt>
<dd><p>Create a custom event for a guild.</p>
</dd>
<dt><a href="#createEventNums">createEventNums(msg, id, show, cb)</a></dt>
<dd><p>Let the user choose how many of something will be in this event being
created.</p>
</dd>
<dt><a href="#createEventOutcome">createEventOutcome(msg, id, show, cb)</a></dt>
<dd><p>Let the user choose what the outcome of an event will be.</p>
</dd>
<dt><a href="#createEventAttacker">createEventAttacker(msg, id, show, cb)</a></dt>
<dd><p>Let the user choose whether the event attackers and victims kill anyone.</p>
</dd>
<dt><a href="#updateEventPreview">updateEventPreview(msg)</a></dt>
<dd><p>When a user is creating a custom event and edits their message, we need to
edit the preview.</p>
</dd>
<dt><a href="#removeEvent">removeEvent(msg, id)</a></dt>
<dd><p>Delete a custom event from a guild.</p>
</dd>
<dt><a href="#fetchStats">fetchStats(events)</a></dt>
<dd><p>Put information about an array of events into the array.</p>
</dd>
<dt><a href="#listEvents">listEvents(msg, id, [page], [eventType], [editMsg])</a></dt>
<dd><p>Allow user to view all events available on their server and summary of each
type of event.</p>
</dd>
<dt><a href="#formatEventString">formatEventString(arenaEvent, [newline])</a> ⇒ <code>string</code></dt>
<dd><p>Format an event to show its settings to the user.</p>
</dd>
<dt><a href="#getOutcomeEmoji">getOutcomeEmoji(outcome)</a> ⇒ <code>string</code></dt>
<dd><p>Get the emoji for a specific outcome of an event.</p>
</dd>
<dt><a href="#help">help(msg, id)</a></dt>
<dd><p>Send help message to DM and reply to server.</p>
</dd>
<dt><a href="#nothing">nothing()</a> ⇒ <code>string</code></dt>
<dd><p>Get a random word that means &quot;nothing&quot;.</p>
</dd>
<dt><a href="#getMessage">getMessage(type)</a> ⇒ <code>string</code></dt>
<dd><p>Get a random message of a given type from hgMessages.json.</p>
</dd>
<dt><a href="#save">save([opt])</a></dt>
<dd><p>Save all game data to file.</p>
</dd>
<dt><a href="#exit">exit([code])</a></dt>
<dd><p>Catch process exiting so we can save if necessary, and remove other handlers
to allow for another module to take our place.</p>
</dd>
<dt><a href="#sigint">sigint()</a></dt>
<dd><p>Same as exit(), but triggered via SIGINT, SIGHUP or SIGTERM.</p>
</dd>
<dt><a href="#unhandledRejection">unhandledRejection(reason, p)</a></dt>
<dd><p>Handler for an unhandledRejection.</p>
</dd>
</dl>

## Events

<dl>
<dt><a href="#event_Command">"Command" (msg)</a></dt>
<dd><p>The function to call when a command is triggered.</p>
</dd>
</dl>

## Typedefs

<dl>
<dt><a href="#hgCommandHandler">hgCommandHandler</a> : <code>function</code></dt>
<dd><p>Handler for a Hungry Games command.</p>
</dd>
<dt><a href="#UserIconUrl">UserIconUrl</a> : <code>object</code></dt>
<dd></dd>
<dt><a href="#createEventNumCallback">createEventNumCallback</a> : <code>function</code></dt>
<dd><p>The callback after receiving a number from user input.</p>
</dd>
<dt><a href="#createEventOutcomeCallback">createEventOutcomeCallback</a> : <code>function</code></dt>
<dd><p>The callback after receiving an event outcome from a user.</p>
</dd>
<dt><a href="#createEventBooleanCallback">createEventBooleanCallback</a> : <code>function</code></dt>
<dd><p>The callback after receiving a boolean input.</p>
</dd>
</dl>

<a name="Common"></a>

## Common
Common functions accross my projects. Mostly just logging.

**Kind**: global class  

* [Common](#Common)
    * _instance_
        * [.isRelease](#Common+isRelease) : <code>boolean</code>
        * [.begin(_, isRelease)](#Common+begin)
        * [.padIp(str)](#Common+padIp) ⇒ <code>string</code>
        * [.getIPName(ip)](#Common+getIPName) ⇒ <code>string</code>
        * [.updatePrefix(ip)](#Common+updatePrefix) ⇒ <code>string</code>
        * [.log(message, ip)](#Common+log)
        * [.error(message, ip)](#Common+error)
    * _inner_
        * [~mycolor](#Common..mycolor) : <code>number</code> ℗
        * [~title](#Common..title) : <code>string</code> ℗
        * [~prefixLength](#Common..prefixLength) : <code>number</code> ℗
        * [~app](#Common..app) : <code>string</code> ℗
        * [~getTrace()](#Common..getTrace) ⇒ <code>string</code> ℗

<a name="Common+isRelease"></a>

### common.isRelease : <code>boolean</code>
Whether this should be shown as a release version, or a debug version in
the log.

**Kind**: instance property of [<code>Common</code>](#Common)  
<a name="Common+begin"></a>

### common.begin(_, isRelease)
Initialize variables and settings for logging properly.

**Kind**: instance method of [<code>Common</code>](#Common)  

| Param | Type | Description |
| --- | --- | --- |
| _ | <code>\*</code> | Unused. Kept to match number of arguments with other versions of common.js. |
| isRelease | <code>boolean</code> | Is this a release version, or a development version of the app running. |

<a name="Common+padIp"></a>

### common.padIp(str) ⇒ <code>string</code>
Pad an IP address with zeroes

**Kind**: instance method of [<code>Common</code>](#Common)  
**Returns**: <code>string</code> - The padded address.  

| Param | Type | Description |
| --- | --- | --- |
| str | <code>number</code> | The ipv4 address as a string to format. |

<a name="Common+getIPName"></a>

### common.getIPName(ip) ⇒ <code>string</code>
Formats a given IP address by padding with zeroes, or completely replacing
with a human readable alias if the address is a known location.

**Kind**: instance method of [<code>Common</code>](#Common)  
**Returns**: <code>string</code> - The formmatted address.  

| Param | Type | Description |
| --- | --- | --- |
| ip | <code>string</code> | The ip address to format. |

<a name="Common+updatePrefix"></a>

### common.updatePrefix(ip) ⇒ <code>string</code>
Format a prefix for a log message or error. Includes the ip before the
message.

**Kind**: instance method of [<code>Common</code>](#Common)  
**Returns**: <code>string</code> - The formatted prefix for a log message.  

| Param | Type | Description |
| --- | --- | --- |
| ip | <code>string</code> | The ip to include in the prefix. |

<a name="Common+log"></a>

### common.log(message, ip)
Format a log message to be logged.

**Kind**: instance method of [<code>Common</code>](#Common)  

| Param | Type | Description |
| --- | --- | --- |
| message | <code>string</code> | The message to display. |
| ip | <code>string</code> | The IP address or unique identifier of the client that caused this event to happen. |

<a name="Common+error"></a>

### common.error(message, ip)
Format an error message to be logged.

**Kind**: instance method of [<code>Common</code>](#Common)  

| Param | Type | Description |
| --- | --- | --- |
| message | <code>string</code> | The message to display. |
| ip | <code>string</code> | The IP address or unique identifier of the client that caused this event to happen. |

<a name="Common..mycolor"></a>

### Common~mycolor : <code>number</code> ℗
The color code to prefix log messages with for this script.

**Kind**: inner property of [<code>Common</code>](#Common)  
**Default**: <code>0</code>  
**Access**: private  
<a name="Common..title"></a>

### Common~title : <code>string</code> ℗
The final formatted filename for logging.

**Kind**: inner property of [<code>Common</code>](#Common)  
**Access**: private  
<a name="Common..prefixLength"></a>

### Common~prefixLength : <code>number</code> ℗
The number of characters reserved for the filename of the script.

**Kind**: inner constant of [<code>Common</code>](#Common)  
**Default**: <code>13</code>  
**Access**: private  
<a name="Common..app"></a>

### Common~app : <code>string</code> ℗
The script's filename to show in the log.

**Kind**: inner constant of [<code>Common</code>](#Common)  
**Access**: private  
<a name="Common..getTrace"></a>

### Common~getTrace() ⇒ <code>string</code> ℗
Gets the name and line number of the current function stack.

**Kind**: inner method of [<code>Common</code>](#Common)  
**Returns**: <code>string</code> - Formatted string with length 20.  
**Access**: private  
<a name="Main"></a>

## Main ⇐ [<code>SubModule</code>](#SubModule)
Basic commands and features for the bot.

**Kind**: global class  
**Extends**: [<code>SubModule</code>](#SubModule)  

* [Main](#Main) ⇐ [<code>SubModule</code>](#SubModule)
    * _instance_
        * [.helpMessage](#SubModule+helpMessage) : <code>string</code> \| <code>Discord~MessageEmbed</code>
        * [.prefix](#SubModule+prefix) : <code>string</code>
        * [.myPrefix](#SubModule+myPrefix) : <code>string</code>
        * *[.prePrefix](#SubModule+prePrefix) : <code>string</code>*
        * [.Discord](#SubModule+Discord) : <code>Discord</code>
        * [.client](#SubModule+client) : <code>Discord~Client</code>
        * [.command](#SubModule+command) : [<code>Command</code>](#SpikeyBot..Command)
        * [.common](#SubModule+common) : [<code>Common</code>](#Common)
        * [.myName](#SubModule+myName) : <code>string</code>
        * [.initialize()](#SubModule+initialize)
        * [.begin(prefix, Discord, client, command, common)](#SubModule+begin)
        * [.end()](#SubModule+end)
        * [.shutdown()](#SubModule+shutdown)
        * *[.save()](#SubModule+save)*
    * _inner_
        * [~prevUserSayId](#Main..prevUserSayId) : <code>string</code> ℗
        * [~prevUserSayCnt](#Main..prevUserSayCnt) : <code>number</code> ℗
        * [~timers](#Main..timers) : [<code>Array.&lt;Timer&gt;</code>](#Main..Timer) ℗
        * [~spikeyId](#Main..spikeyId) : <code>string</code> ℗
        * [~introduction](#Main..introduction) : <code>string</code> ℗
        * [~blockedmessage](#Main..blockedmessage) : <code>string</code> ℗
        * [~addmessage](#Main..addmessage) : <code>string</code> ℗
        * [~addLink](#Main..addLink) : <code>string</code> ℗
        * [~banMsgs](#Main..banMsgs) : <code>Array.&lt;string&gt;</code> ℗
        * [~defaultCode](#Main..defaultCode) : <code>Array.&lt;string&gt;</code> ℗
        * [~helpObject](#Main..helpObject) ℗
        * [~webURL](#Main..webURL) : <code>string</code> ℗
        * [~mention(msg)](#Main..mention) ⇒ <code>string</code> ℗
        * [~reply(msg, text, post)](#Main..reply) ⇒ <code>Promise</code> ℗
        * [~commandAddMe(msg)](#Main..commandAddMe) : <code>commandHandler</code> ℗
        * [~commandAdd(msg)](#Main..commandAdd) : <code>commandHandler</code> ℗
        * [~commandSimplify(msg)](#Main..commandSimplify) : <code>commandHandler</code> ℗
        * [~simplify(formula)](#Main..simplify) ⇒ <code>string</code> ℗
        * [~commandSolve(msg)](#Main..commandSolve) : <code>commandHandler</code> ℗
        * [~commandEvaluate(msg)](#Main..commandEvaluate) : <code>commandHandler</code> ℗
        * [~commandGraph(msg)](#Main..commandGraph) : <code>commandHandler</code> ℗
        * [~commandDerive(msg)](#Main..commandDerive) : <code>commandHandler</code> ℗
        * [~commandJS(msg)](#Main..commandJS) : <code>commandHandler</code> ℗
        * [~commandTimer(msg)](#Main..commandTimer) : <code>commandHandler</code> ℗
        * [~commandSay(msg)](#Main..commandSay) : <code>commandHandler</code> ℗
        * [~commandCreateDate(msg)](#Main..commandCreateDate) : <code>commandHandler</code> ℗
        * [~commandJoinDate(msg)](#Main..commandJoinDate) : <code>commandHandler</code> ℗
        * [~commandPmMe(msg)](#Main..commandPmMe) : <code>commandHandler</code> ℗
        * [~commandPmSpikey(msg)](#Main..commandPmSpikey) : <code>commandHandler</code> ℗
        * [~commandThotPm(msg)](#Main..commandThotPm) : <code>commandHandler</code> ℗
        * [~commandFlip(msg)](#Main..commandFlip) : <code>commandHandler</code> ℗
        * [~commandPurge(msg)](#Main..commandPurge) : <code>commandHandler</code> ℗
        * [~commandBan(msg)](#Main..commandBan) : <code>commandHandler</code> ℗
        * [~commandSmite(msg)](#Main..commandSmite) : <code>commandHandler</code> ℗
        * [~commandAvatar(msg)](#Main..commandAvatar) : <code>commandHandler</code> ℗
        * [~commandPing(msg)](#Main..commandPing) : <code>commandHandler</code> ℗
        * [~commandUptime(msg)](#Main..commandUptime) : <code>commandHandler</code> ℗
        * [~commandGame(msg)](#Main..commandGame) : <code>commandHandler</code> ℗
        * [~commandVersion(msg)](#Main..commandVersion) : <code>commandHandler</code> ℗
        * [~setTimer(timer)](#Main..setTimer) ℗
        * [~Timer](#Main..Timer) : <code>Object</code>

<a name="SubModule+helpMessage"></a>

### main.helpMessage : <code>string</code> \| <code>Discord~MessageEmbed</code>
The help message to show the user in the main help message.

**Kind**: instance property of [<code>Main</code>](#Main)  
**Overrides**: [<code>helpMessage</code>](#SubModule+helpMessage)  
<a name="SubModule+prefix"></a>

### main.prefix : <code>string</code>
The main prefix in use for this bot. Only available after begin() is
called.

**Kind**: instance property of [<code>Main</code>](#Main)  
**Read only**: true  
<a name="SubModule+myPrefix"></a>

### main.myPrefix : <code>string</code>
The prefix this submodule uses. Formed by appending this.prefix to
this.prePrefix. this.prePrefix must be defined before begin(), otherwise it
is ignored.

**Kind**: instance property of [<code>Main</code>](#Main)  
**Read only**: true  
<a name="SubModule+prePrefix"></a>

### *main.prePrefix : <code>string</code>*
The prefix for the global prefix for this subModule. Must be defined before
begin(), otherwise it is ignored.

**Kind**: instance abstract property of [<code>Main</code>](#Main)  
**Default**: <code>&quot;&quot;</code>  
<a name="SubModule+Discord"></a>

### main.Discord : <code>Discord</code>
The current Discord object instance of the bot.

**Kind**: instance property of [<code>Main</code>](#Main)  
<a name="SubModule+client"></a>

### main.client : <code>Discord~Client</code>
The current bot client.

**Kind**: instance property of [<code>Main</code>](#Main)  
<a name="SubModule+command"></a>

### main.command : [<code>Command</code>](#SpikeyBot..Command)
The command object for registering command listeners.

**Kind**: instance property of [<code>Main</code>](#Main)  
<a name="SubModule+common"></a>

### main.common : [<code>Common</code>](#Common)
The common object.

**Kind**: instance property of [<code>Main</code>](#Main)  
<a name="SubModule+myName"></a>

### main.myName : <code>string</code>
The name of this submodule. Used for differentiating in the log. Should be
defined before begin().

**Kind**: instance property of [<code>Main</code>](#Main)  
**Overrides**: [<code>myName</code>](#SubModule+myName)  
**Access**: protected  
<a name="SubModule+initialize"></a>

### main.initialize()
The function called at the end of begin() for further initialization
specific to the subModule. Must be defined before begin() is called.

**Kind**: instance method of [<code>Main</code>](#Main)  
**Overrides**: [<code>initialize</code>](#SubModule+initialize)  
**Access**: protected  
<a name="SubModule+begin"></a>

### main.begin(prefix, Discord, client, command, common)
Initialize this submodule.

**Kind**: instance method of [<code>Main</code>](#Main)  

| Param | Type | Description |
| --- | --- | --- |
| prefix | <code>string</code> | The global prefix for this bot. |
| Discord | <code>Discord</code> | The Discord object for the API library. |
| client | <code>Discord~Client</code> | The client that represents this bot. |
| command | <code>Command</code> | The command instance in which to register command listeners. |
| common | <code>Object</code> | Object storing common functions. |

<a name="SubModule+end"></a>

### main.end()
Trigger subModule to shutdown and get ready for process terminating.

**Kind**: instance method of [<code>Main</code>](#Main)  
<a name="SubModule+shutdown"></a>

### main.shutdown()
Shutdown and disable this submodule. Removes all event listeners.

**Kind**: instance method of [<code>Main</code>](#Main)  
**Overrides**: [<code>shutdown</code>](#SubModule+shutdown)  
**Access**: protected  
<a name="SubModule+save"></a>

### *main.save()*
Saves all data to files necessary for saving current state.

**Kind**: instance abstract method of [<code>Main</code>](#Main)  
<a name="Main..prevUserSayId"></a>

### Main~prevUserSayId : <code>string</code> ℗
The id of the last user to user the say command.

**Kind**: inner property of [<code>Main</code>](#Main)  
**Access**: private  
<a name="Main..prevUserSayCnt"></a>

### Main~prevUserSayCnt : <code>number</code> ℗
The number of times the say command has been used consecutively by the
previous user.

**Kind**: inner property of [<code>Main</code>](#Main)  
**Access**: private  
<a name="Main..timers"></a>

### Main~timers : [<code>Array.&lt;Timer&gt;</code>](#Main..Timer) ℗
Array of all timers currently set.

**Kind**: inner property of [<code>Main</code>](#Main)  
**Access**: private  
<a name="Main..spikeyId"></a>

### Main~spikeyId : <code>string</code> ℗
SpikeyRobot's Discord ID

**Kind**: inner constant of [<code>Main</code>](#Main)  
**Access**: private  
<a name="Main..introduction"></a>

### Main~introduction : <code>string</code> ℗
The introduction message the bots sends when pmme is used.

**Kind**: inner constant of [<code>Main</code>](#Main)  
**Access**: private  
<a name="Main..blockedmessage"></a>

### Main~blockedmessage : <code>string</code> ℗
The message sent to the channel where the user asked to be DM'd, but we
were unable to deliver the DM.

**Kind**: inner constant of [<code>Main</code>](#Main)  
**Access**: private  
<a name="Main..addmessage"></a>

### Main~addmessage : <code>string</code> ℗
The message with instructions of how to add the bot to a server.

**Kind**: inner constant of [<code>Main</code>](#Main)  
**Access**: private  
<a name="Main..addLink"></a>

### Main~addLink : <code>string</code> ℗
The URL that adds the bot to a new server.

**Kind**: inner constant of [<code>Main</code>](#Main)  
**Access**: private  
<a name="Main..banMsgs"></a>

### Main~banMsgs : <code>Array.&lt;string&gt;</code> ℗
All of the possible messages to show when using the ban command.

**Kind**: inner constant of [<code>Main</code>](#Main)  
**Access**: private  
<a name="Main..defaultCode"></a>

### Main~defaultCode : <code>Array.&lt;string&gt;</code> ℗
The default code to insert at the beginning of the js command.

**Kind**: inner constant of [<code>Main</code>](#Main)  
**Access**: private  
<a name="Main..helpObject"></a>

### Main~helpObject ℗
The object that stores all data to be formatted into the help message.

**Kind**: inner constant of [<code>Main</code>](#Main)  
**Access**: private  
<a name="Main..webURL"></a>

### Main~webURL : <code>string</code> ℗
The website base URL for pointing to for more help and documentation.

**Kind**: inner constant of [<code>Main</code>](#Main)  
**Access**: private  
<a name="Main..mention"></a>

### Main~mention(msg) ⇒ <code>string</code> ℗
Creates formatted string for mentioning the author of msg.

**Kind**: inner method of [<code>Main</code>](#Main)  
**Returns**: <code>string</code> - Formatted mention string.  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord~Message</code> | Message to format a mention for the author of. |

<a name="Main..reply"></a>

### Main~reply(msg, text, post) ⇒ <code>Promise</code> ℗
Replies to the author and channel of msg with the given message.

**Kind**: inner method of [<code>Main</code>](#Main)  
**Returns**: <code>Promise</code> - Promise of Discord~Message that we attempted to send.  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord~Message</code> | Message to reply to. |
| text | <code>string</code> | The main body of the message. |
| post | <code>string</code> | The footer of the message. |

<a name="Main..commandAddMe"></a>

### Main~commandAddMe(msg) : <code>commandHandler</code> ℗
Replies to message with URL for inviting the bot to a guild.

**Kind**: inner method of [<code>Main</code>](#Main)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord~Message</code> | Message that triggered command. |

<a name="Main..commandAdd"></a>

### Main~commandAdd(msg) : <code>commandHandler</code> ℗
Parses message and adds given numbers.

**Kind**: inner method of [<code>Main</code>](#Main)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord~Message</code> | Message that triggered command. |

<a name="Main..commandSimplify"></a>

### Main~commandSimplify(msg) : <code>commandHandler</code> ℗
Simplifies equation given in message.

**Kind**: inner method of [<code>Main</code>](#Main)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord~Message</code> | Message that triggered command. |

<a name="Main..simplify"></a>

### Main~simplify(formula) ⇒ <code>string</code> ℗
Simplifies given formula.

**Kind**: inner method of [<code>Main</code>](#Main)  
**Returns**: <code>string</code> - Simplified formula.  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| formula | <code>string</code> | The formula to attempt to simplify. |

<a name="Main..commandSolve"></a>

### Main~commandSolve(msg) : <code>commandHandler</code> ℗
Solve an equation.

**Kind**: inner method of [<code>Main</code>](#Main)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord~Message</code> | Message that triggered command. |

<a name="Main..commandEvaluate"></a>

### Main~commandEvaluate(msg) : <code>commandHandler</code> ℗
Evaluate a string as an equation with units.

**Kind**: inner method of [<code>Main</code>](#Main)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord~Message</code> | Message that triggered command. |

<a name="Main..commandGraph"></a>

### Main~commandGraph(msg) : <code>commandHandler</code> ℗
Graph a given equation by plugging in values for X and creating an image
based off values.

**Kind**: inner method of [<code>Main</code>](#Main)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord~Message</code> | Message that triggered command. |

<a name="Main..commandDerive"></a>

### Main~commandDerive(msg) : <code>commandHandler</code> ℗
Take the derivative of a given equation in terms of dy/dx.

**Kind**: inner method of [<code>Main</code>](#Main)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord~Message</code> | Message that triggered command. |

<a name="Main..commandJS"></a>

### Main~commandJS(msg) : <code>commandHandler</code> ℗
Run javascript code in VM, then show user outcome.

**Kind**: inner method of [<code>Main</code>](#Main)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord~Message</code> | Message that triggered command. |

<a name="Main..commandTimer"></a>

### Main~commandTimer(msg) : <code>commandHandler</code> ℗
Set a timer for a certain about of time. After which, the bot will DM the
user the message they specified.

**Kind**: inner method of [<code>Main</code>](#Main)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord~Message</code> | Message that triggered command. |

<a name="Main..commandSay"></a>

### Main~commandSay(msg) : <code>commandHandler</code> ℗
The user's message will be deleted and the bot will send an identical
message
without the command to make it seem like the bot sent the message.

**Kind**: inner method of [<code>Main</code>](#Main)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord~Message</code> | Message that triggered command. |

<a name="Main..commandCreateDate"></a>

### Main~commandCreateDate(msg) : <code>commandHandler</code> ℗
Tell the user the date when they created their Discord account.

**Kind**: inner method of [<code>Main</code>](#Main)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord~Message</code> | Message that triggered command. |

<a name="Main..commandJoinDate"></a>

### Main~commandJoinDate(msg) : <code>commandHandler</code> ℗
Tell the user the date when they joined the server the message was sent
from.

**Kind**: inner method of [<code>Main</code>](#Main)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord~Message</code> | Message that triggered command. |

<a name="Main..commandPmMe"></a>

### Main~commandPmMe(msg) : <code>commandHandler</code> ℗
Send the user a PM with a greeting introducing who the bot is.

**Kind**: inner method of [<code>Main</code>](#Main)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord~Message</code> | Message that triggered command. |

<a name="Main..commandPmSpikey"></a>

### Main~commandPmSpikey(msg) : <code>commandHandler</code> ℗
Send a PM to SpikeyRobot with a message.

**Kind**: inner method of [<code>Main</code>](#Main)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord~Message</code> | Message that triggered command. |

<a name="Main..commandThotPm"></a>

### Main~commandThotPm(msg) : <code>commandHandler</code> ℗
Send a PM to a mentioned user semi-anonymously. Messages are copied to
SpikeyRobot to monitor for abuse. This command only works for 3 people.

**Kind**: inner method of [<code>Main</code>](#Main)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord~Message</code> | Message that triggered command. |

<a name="Main..commandFlip"></a>

### Main~commandFlip(msg) : <code>commandHandler</code> ℗
Send an image of a coin, either Heads or Tails.

**Kind**: inner method of [<code>Main</code>](#Main)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord~Message</code> | Message that triggered command. |

<a name="Main..commandPurge"></a>

### Main~commandPurge(msg) : <code>commandHandler</code> ℗
Delete a given number of messages from a text channel.

**Kind**: inner method of [<code>Main</code>](#Main)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord~Message</code> | Message that triggered command. |

<a name="Main..commandBan"></a>

### Main~commandBan(msg) : <code>commandHandler</code> ℗
Ban a mentioed user and send a message saying they were banned.

**Kind**: inner method of [<code>Main</code>](#Main)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord~Message</code> | Message that triggered command. |

<a name="Main..commandSmite"></a>

### Main~commandSmite(msg) : <code>commandHandler</code> ℗
Remove all roles from a user and give them a role that prevents them from
doing anything. Checks if all parties involved have permission to do this
without the bot's help.

**Kind**: inner method of [<code>Main</code>](#Main)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord~Message</code> | Message that triggered command. |

<a name="Main..commandAvatar"></a>

### Main~commandAvatar(msg) : <code>commandHandler</code> ℗
Send a larger resolution version of the mentioned user's avatar.

**Kind**: inner method of [<code>Main</code>](#Main)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord~Message</code> | Message that triggered command. |

<a name="Main..commandPing"></a>

### Main~commandPing(msg) : <code>commandHandler</code> ℗
Reply to user with my ping to the Discord servers.

**Kind**: inner method of [<code>Main</code>](#Main)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord~Message</code> | Message that triggered command. |

<a name="Main..commandUptime"></a>

### Main~commandUptime(msg) : <code>commandHandler</code> ℗
Reply to message with the amount of time since the bot has been running.

**Kind**: inner method of [<code>Main</code>](#Main)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord~Message</code> | Message that triggered command. |

<a name="Main..commandGame"></a>

### Main~commandGame(msg) : <code>commandHandler</code> ℗
Reply to message saying what game the mentioned user is playing and
possibly
other information about their profile.

**Kind**: inner method of [<code>Main</code>](#Main)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord~Message</code> | Message that triggered command. |

<a name="Main..commandVersion"></a>

### Main~commandVersion(msg) : <code>commandHandler</code> ℗
Read the current version from package.json and show it to the user.

**Kind**: inner method of [<code>Main</code>](#Main)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord~Message</code> | Message that triggered command. |

<a name="Main..setTimer"></a>

### Main~setTimer(timer) ℗
Sets a timer for an amount of time with a message.

**Kind**: inner method of [<code>Main</code>](#Main)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| timer | [<code>Timer</code>](#Main..Timer) | The settings for the timer. |

<a name="Main..Timer"></a>

### Main~Timer : <code>Object</code>
An object storing information about a timer.

**Kind**: inner typedef of [<code>Main</code>](#Main)  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| id | <code>string</code> | The id of the user who set the timer. |
| message | <code>string</code> | The message for when the timer ends. |
| time | <code>number</code> | The time since epoch at which the timer will end. |

<a name="Music"></a>

## Music ⇐ [<code>SubModule</code>](#SubModule)
Music and audio related commands.

**Kind**: global class  
**Extends**: [<code>SubModule</code>](#SubModule)  

* [Music](#Music) ⇐ [<code>SubModule</code>](#SubModule)
    * _instance_
        * [.helpMessage](#SubModule+helpMessage) : <code>string</code> \| <code>Discord~MessageEmbed</code>
        * [.prefix](#SubModule+prefix) : <code>string</code>
        * [.myPrefix](#SubModule+myPrefix) : <code>string</code>
        * *[.prePrefix](#SubModule+prePrefix) : <code>string</code>*
        * [.Discord](#SubModule+Discord) : <code>Discord</code>
        * [.client](#SubModule+client) : <code>Discord~Client</code>
        * [.command](#SubModule+command) : [<code>Command</code>](#SpikeyBot..Command)
        * [.common](#SubModule+common) : [<code>Common</code>](#Common)
        * *[.myName](#SubModule+myName) : <code>string</code>*
        * [.initialize()](#SubModule+initialize)
        * [.begin(prefix, Discord, client, command, common)](#SubModule+begin)
        * [.end()](#SubModule+end)
        * [.shutdown()](#SubModule+shutdown)
        * *[.save()](#SubModule+save)*
    * _static_
        * [.streamToOgg(input, file)](#Music.streamToOgg)
    * _inner_
        * [~broadcasts](#Music..broadcasts) : <code>Object.&lt;string, Broadcast&gt;</code> ℗
        * [~geniusClient](#Music..geniusClient) : <code>string</code> ℗
        * [~geniusRequest](#Music..geniusRequest) : <code>Object</code> ℗
        * [~special](#Music..special) : <code>Object.&lt;string, Object&gt;</code> ℗
        * [~ytdlOpts](#Music..ytdlOpts) : <code>Array.&lt;string&gt;</code> ℗
        * [~mention(msg)](#Music..mention) ⇒ <code>string</code> ℗
        * [~reply(msg, text, post)](#Music..reply) ⇒ <code>Promise</code> ℗
        * [~handleVoiceStateUpdate(oldMem, newMem)](#Music..handleVoiceStateUpdate) ℗
        * [~formatSongInfo(info)](#Music..formatSongInfo) ⇒ <code>Discord~MessageEmbed</code> ℗
        * [~formNum(num)](#Music..formNum) ⇒ <code>string</code> ℗
        * [~enqueueSong(broadcast, song, msg, info)](#Music..enqueueSong) ℗
        * [~startPlaying(broadcast)](#Music..startPlaying) ℗
        * [~makeBroadcast(broadcast)](#Music..makeBroadcast) ℗
        * [~endSong(broadcast)](#Music..endSong) ℗
        * [~skipSong(broadcast)](#Music..skipSong) ℗
        * [~commandPlay(msg)](#Music..commandPlay) : <code>commandHandler</code> ℗
        * [~commandLeave(msg)](#Music..commandLeave) : <code>commandHandler</code> ℗
        * [~commandSkip(msg)](#Music..commandSkip) : <code>commandHandler</code> ℗
        * [~commandQueue(msg)](#Music..commandQueue) : <code>commandHandler</code> ℗
        * [~commandRemove(msg)](#Music..commandRemove) : <code>commandHandler</code> ℗
        * [~commandLyrics(msg)](#Music..commandLyrics) : <code>commandHandler</code> ℗
        * [~reqLyricsURL(msg, id)](#Music..reqLyricsURL) ℗
        * [~fetchLyricsPage(msg, url, title, thumb)](#Music..fetchLyricsPage) ℗
        * [~stripLyrics(msg, content, title, url, thumb)](#Music..stripLyrics) ℗
        * [~commandRecord(msg)](#Music..commandRecord) : <code>commandHandler</code> ℗
        * [~Broadcast](#Music..Broadcast) : <code>Object</code>

<a name="SubModule+helpMessage"></a>

### music.helpMessage : <code>string</code> \| <code>Discord~MessageEmbed</code>
The help message to show the user in the main help message.

**Kind**: instance property of [<code>Music</code>](#Music)  
<a name="SubModule+prefix"></a>

### music.prefix : <code>string</code>
The main prefix in use for this bot. Only available after begin() is
called.

**Kind**: instance property of [<code>Music</code>](#Music)  
**Read only**: true  
<a name="SubModule+myPrefix"></a>

### music.myPrefix : <code>string</code>
The prefix this submodule uses. Formed by appending this.prefix to
this.prePrefix. this.prePrefix must be defined before begin(), otherwise it
is ignored.

**Kind**: instance property of [<code>Music</code>](#Music)  
**Read only**: true  
<a name="SubModule+prePrefix"></a>

### *music.prePrefix : <code>string</code>*
The prefix for the global prefix for this subModule. Must be defined before
begin(), otherwise it is ignored.

**Kind**: instance abstract property of [<code>Music</code>](#Music)  
**Default**: <code>&quot;&quot;</code>  
<a name="SubModule+Discord"></a>

### music.Discord : <code>Discord</code>
The current Discord object instance of the bot.

**Kind**: instance property of [<code>Music</code>](#Music)  
<a name="SubModule+client"></a>

### music.client : <code>Discord~Client</code>
The current bot client.

**Kind**: instance property of [<code>Music</code>](#Music)  
<a name="SubModule+command"></a>

### music.command : [<code>Command</code>](#SpikeyBot..Command)
The command object for registering command listeners.

**Kind**: instance property of [<code>Music</code>](#Music)  
<a name="SubModule+common"></a>

### music.common : [<code>Common</code>](#Common)
The common object.

**Kind**: instance property of [<code>Music</code>](#Music)  
<a name="SubModule+myName"></a>

### *music.myName : <code>string</code>*
The name of this submodule. Used for differentiating in the log. Should be
defined before begin().

**Kind**: instance abstract property of [<code>Music</code>](#Music)  
**Access**: protected  
<a name="SubModule+initialize"></a>

### music.initialize()
The function called at the end of begin() for further initialization
specific to the subModule. Must be defined before begin() is called.

**Kind**: instance method of [<code>Music</code>](#Music)  
**Overrides**: [<code>initialize</code>](#SubModule+initialize)  
**Access**: protected  
<a name="SubModule+begin"></a>

### music.begin(prefix, Discord, client, command, common)
Initialize this submodule.

**Kind**: instance method of [<code>Music</code>](#Music)  

| Param | Type | Description |
| --- | --- | --- |
| prefix | <code>string</code> | The global prefix for this bot. |
| Discord | <code>Discord</code> | The Discord object for the API library. |
| client | <code>Discord~Client</code> | The client that represents this bot. |
| command | <code>Command</code> | The command instance in which to register command listeners. |
| common | <code>Object</code> | Object storing common functions. |

<a name="SubModule+end"></a>

### music.end()
Trigger subModule to shutdown and get ready for process terminating.

**Kind**: instance method of [<code>Music</code>](#Music)  
<a name="SubModule+shutdown"></a>

### music.shutdown()
Shutdown and disable this submodule. Removes all event listeners.

**Kind**: instance method of [<code>Music</code>](#Music)  
**Overrides**: [<code>shutdown</code>](#SubModule+shutdown)  
**Access**: protected  
<a name="SubModule+save"></a>

### *music.save()*
Saves all data to files necessary for saving current state.

**Kind**: instance abstract method of [<code>Music</code>](#Music)  
<a name="Music.streamToOgg"></a>

### Music.streamToOgg(input, file)
Coverts an incoming Opus stream to a ogg format and writes it to file.

**Kind**: static method of [<code>Music</code>](#Music)  

| Param | Type | Description |
| --- | --- | --- |
| input | <code>ReadableStream</code> | The opus stream from Discord. |
| file | <code>WritableStream</code> | The file stream we are writing to. |

<a name="Music..broadcasts"></a>

### Music~broadcasts : <code>Object.&lt;string, Broadcast&gt;</code> ℗
All current audio broadcasts to voice channels. Stores all relavent data.
Stored by guild id.

**Kind**: inner property of [<code>Music</code>](#Music)  
**Access**: private  
<a name="Music..geniusClient"></a>

### Music~geniusClient : <code>string</code> ℗
The Genuius client token we use to fetch information from their api

**Kind**: inner constant of [<code>Music</code>](#Music)  
**Access**: private  
<a name="Music..geniusRequest"></a>

### Music~geniusRequest : <code>Object</code> ℗
The request headers to send to genius.

**Kind**: inner constant of [<code>Music</code>](#Music)  
**Access**: private  
<a name="Music..special"></a>

### Music~special : <code>Object.&lt;string, Object&gt;</code> ℗
Special cases of requests to handle seperately.

**Kind**: inner constant of [<code>Music</code>](#Music)  
**Access**: private  
<a name="Music..ytdlOpts"></a>

### Music~ytdlOpts : <code>Array.&lt;string&gt;</code> ℗
Options passed to youtube-dl for fetching videos.

**Kind**: inner constant of [<code>Music</code>](#Music)  
**Access**: private  
<a name="Music..mention"></a>

### Music~mention(msg) ⇒ <code>string</code> ℗
Creates formatted string for mentioning the author of msg.

**Kind**: inner method of [<code>Music</code>](#Music)  
**Returns**: <code>string</code> - Formatted mention string.  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord~Message</code> | Message to format a mention for the author of. |

<a name="Music..reply"></a>

### Music~reply(msg, text, post) ⇒ <code>Promise</code> ℗
Replies to the author and channel of msg with the given message.

**Kind**: inner method of [<code>Music</code>](#Music)  
**Returns**: <code>Promise</code> - Promise of Discord~Message that we attempted to send.  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord~Message</code> | Message to reply to. |
| text | <code>string</code> | The main body of the message. |
| post | <code>string</code> | The footer of the message. |

<a name="Music..handleVoiceStateUpdate"></a>

### Music~handleVoiceStateUpdate(oldMem, newMem) ℗
Leave a voice channel if all other users have left. Should also cause music
and recordings to stop.

**Kind**: inner method of [<code>Music</code>](#Music)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| oldMem | <code>Discord~GuildMember</code> | Member before status update. |
| newMem | <code>Discord~GuildMember</code> | Member after status update. |

<a name="Music..formatSongInfo"></a>

### Music~formatSongInfo(info) ⇒ <code>Discord~MessageEmbed</code> ℗
Format the info response from ytdl into a human readable format.

**Kind**: inner method of [<code>Music</code>](#Music)  
**Returns**: <code>Discord~MessageEmbed</code> - The formatted song info.  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| info | <code>Object</code> | The info received from ytdl about the song. |

<a name="Music..formNum"></a>

### Music~formNum(num) ⇒ <code>string</code> ℗
Add commas between digits on large numbers.

**Kind**: inner method of [<code>Music</code>](#Music)  
**Returns**: <code>string</code> - The formatted number.  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| num | <code>number</code> \| <code>string</code> | The number to format. |

<a name="Music..enqueueSong"></a>

### Music~enqueueSong(broadcast, song, msg, info) ℗
Add a song to the given broadcast's queue and start playing it not already.

**Kind**: inner method of [<code>Music</code>](#Music)  
**Emits**: <code>SpikeyBot~Command#event:stop</code>  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| broadcast | <code>Broadcast</code> | The broadcast storage container. |
| song | <code>string</code> | The song that was requested. |
| msg | <code>Discord~Message</code> | The message that requested the song. |
| info | <code>Object</code> | The info from ytdl about the song. |

<a name="Music..startPlaying"></a>

### Music~startPlaying(broadcast) ℗
Start playing the first item in the queue of the broadcast.

**Kind**: inner method of [<code>Music</code>](#Music)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| broadcast | <code>Broadcast</code> | The container storing all information about the song. |

<a name="Music..makeBroadcast"></a>

### Music~makeBroadcast(broadcast) ℗
Create a voice channel broadcast based off of the media source, and start
playing the audio.

**Kind**: inner method of [<code>Music</code>](#Music)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| broadcast | <code>Broadcast</code> | The object storing all relevant information. |

<a name="Music..endSong"></a>

### Music~endSong(broadcast) ℗
Triggered when a song has finished playing.

**Kind**: inner method of [<code>Music</code>](#Music)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| broadcast | <code>Broadcast</code> | The object storing all relevant information. |

<a name="Music..skipSong"></a>

### Music~skipSong(broadcast) ℗
Skip the current song, then attempt to play the next.

**Kind**: inner method of [<code>Music</code>](#Music)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| broadcast | <code>Broadcast</code> | The object storing all relevant information. |

<a name="Music..commandPlay"></a>

### Music~commandPlay(msg) : <code>commandHandler</code> ℗
Search for a song to play based off user request.

**Kind**: inner method of [<code>Music</code>](#Music)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord~Message</code> | The message that triggered command. |

<a name="Music..commandLeave"></a>

### Music~commandLeave(msg) : <code>commandHandler</code> ℗
Cause the bot to leave the voice channel and stop playing music.

**Kind**: inner method of [<code>Music</code>](#Music)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord~Message</code> | The message that triggered the command. |

<a name="Music..commandSkip"></a>

### Music~commandSkip(msg) : <code>commandHandler</code> ℗
Skip the currently playing song and continue to the next in the queue.

**Kind**: inner method of [<code>Music</code>](#Music)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord~Message</code> | The message that triggered the command. |

<a name="Music..commandQueue"></a>

### Music~commandQueue(msg) : <code>commandHandler</code> ℗
Show the user what is in the queue.

**Kind**: inner method of [<code>Music</code>](#Music)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord~Message</code> | The message that triggered the command. |

<a name="Music..commandRemove"></a>

### Music~commandRemove(msg) : <code>commandHandler</code> ℗
Remove a song from the queue.

**Kind**: inner method of [<code>Music</code>](#Music)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord~Message</code> | The message that triggered the command. |

<a name="Music..commandLyrics"></a>

### Music~commandLyrics(msg) : <code>commandHandler</code> ℗
Search for a song's lyrics via Genius.

**Kind**: inner method of [<code>Music</code>](#Music)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord~Message</code> | The message that triggered the command. |

<a name="Music..reqLyricsURL"></a>

### Music~reqLyricsURL(msg, id) ℗
Request the song information from Genius from previous search to find the
page where the lyrics are.

**Kind**: inner method of [<code>Music</code>](#Music)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord~Message</code> | The message that triggered the command. |
| id | <code>string</code> | The id of the first song in the search results. |

<a name="Music..fetchLyricsPage"></a>

### Music~fetchLyricsPage(msg, url, title, thumb) ℗
Request the webpage that has the song lyrics on them from Genius.

**Kind**: inner method of [<code>Music</code>](#Music)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord~Message</code> | The message that triggered the command. |
| url | <code>string</code> | The url of the page to request. |
| title | <code>string</code> | The song title for showing the user later. |
| thumb | <code>string</code> | The url of the album art thumbnail to show the user later. |

<a name="Music..stripLyrics"></a>

### Music~stripLyrics(msg, content, title, url, thumb) ℗
Crawl the received webpage for the data we need, then format the data and
show it to the user.

**Kind**: inner method of [<code>Music</code>](#Music)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord~Message</code> | The message that triggered the command. |
| content | <code>string</code> | The entire page received. |
| title | <code>string</code> | The song title for showing the user. |
| url | <code>string</code> | The url of where we fetched the lyrics to show the user. |
| thumb | <code>string</code> | The url of the album art thumbnail to show the user later. |

<a name="Music..commandRecord"></a>

### Music~commandRecord(msg) : <code>commandHandler</code> ℗
Join a voice channel and record the specified users audio to a file on this
server.

**Kind**: inner method of [<code>Music</code>](#Music)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord~Message</code> | The message that triggered the command. |

<a name="Music..Broadcast"></a>

### Music~Broadcast : <code>Object</code>
Information about a server's music and queue.

**Kind**: inner typedef of [<code>Music</code>](#Music)  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| queue | <code>Array.&lt;string&gt;</code> | Requests that have been queued. |
| skips | <code>Object.&lt;string, boolean&gt;</code> | Stores user id's and whether they have voted to skip. Non-existent user means they have not voted to skip. |
| isPlaying | <code>boolean</code> | Is audio currntly being streamed to the channel. |
| broadcast | <code>Discord~VoiceBroadcast</code> | The Discord voice broadcast actually playing the audio. |

<a name="SpikeyBot"></a>

## SpikeyBot
Main class that manages the bot.

**Kind**: global class  

* [SpikeyBot](#SpikeyBot)
    * [~Command](#SpikeyBot..Command)
        * [new Command()](#new_SpikeyBot..Command_new)
        * _instance_
            * [.trigger(cmd, msg)](#SpikeyBot..Command+trigger) ⇒ <code>boolean</code>
            * [.on(cmd, cb, [onlyserver])](#SpikeyBot..Command+on)
            * [.deleteEvent(cmd)](#SpikeyBot..Command+deleteEvent)
            * [.disable(cmd, channel)](#SpikeyBot..Command+disable)
            * [.enable(cmd, channel)](#SpikeyBot..Command+enable)
        * _inner_
            * [~cmds](#SpikeyBot..Command..cmds) : <code>Object.&lt;string, commandHandler&gt;</code> ℗
            * [~blacklist](#SpikeyBot..Command..blacklist) : <code>Object.&lt;string, Array.&lt;string&gt;&gt;</code> ℗
    * [~testMode](#SpikeyBot..testMode) : <code>boolean</code> ℗
    * [~subModuleNames](#SpikeyBot..subModuleNames) : <code>Array.&lt;string&gt;</code> ℗
    * [~setDev](#SpikeyBot..setDev) : <code>boolean</code> ℗
    * [~onlymusic](#SpikeyBot..onlymusic) : <code>boolean</code> ℗
    * [~subModules](#SpikeyBot..subModules) : [<code>Array.&lt;SubModule&gt;</code>](#SubModule) ℗
    * [~reactToAnthony](#SpikeyBot..reactToAnthony) : <code>boolean</code> ℗
    * [~spikeyId](#SpikeyBot..spikeyId) : <code>string</code> ℗
    * [~trustedIds](#SpikeyBot..trustedIds) : <code>Array.&lt;string&gt;</code> ℗
    * [~introduction](#SpikeyBot..introduction) : <code>string</code> ℗
    * [~helpmessagereply](#SpikeyBot..helpmessagereply) : <code>string</code> ℗
    * [~blockedmessage](#SpikeyBot..blockedmessage) : <code>string</code> ℗
    * [~onlyservermessage](#SpikeyBot..onlyservermessage) : <code>string</code> ℗
    * [~disabledcommandmessage](#SpikeyBot..disabledcommandmessage) : <code>string</code> ℗
    * [~command](#SpikeyBot..command) : <code>Command</code> ℗
    * [~isCmd(msg, cmd)](#SpikeyBot..isCmd) ⇒ <code>boolean</code> ℗
    * [~updateGame(password_, game)](#SpikeyBot..updateGame) ⇒ <code>boolean</code> ℗
    * [~mention(msg)](#SpikeyBot..mention) ⇒ <code>string</code> ℗
    * [~reply(msg, text, post)](#SpikeyBot..reply) ⇒ <code>Promise</code> ℗
    * [~onReady()](#SpikeyBot..onReady) ℗
    * [~onMessage(msg)](#SpikeyBot..onMessage) ℗
    * [~onGuildCreate(guild)](#SpikeyBot..onGuildCreate) ℗
    * [~onGuildBanAdd(guild, user)](#SpikeyBot..onGuildBanAdd) ℗
    * [~commandToggleReact(msg)](#SpikeyBot..commandToggleReact) : <code>commandHandler</code> ℗
    * [~commandHelp(msg)](#SpikeyBot..commandHelp) : <code>commandHandler</code> ℗
    * [~commandUpdateGame(msg)](#SpikeyBot..commandUpdateGame) : <code>commandHandler</code> ℗
    * [~commandReboot(msg)](#SpikeyBot..commandReboot) : <code>commandHandler</code> ℗
    * [~commandReload(msg)](#SpikeyBot..commandReload) : <code>commandHandler</code> ℗

<a name="SpikeyBot..Command"></a>

### SpikeyBot~Command
**Kind**: inner class of [<code>SpikeyBot</code>](#SpikeyBot)  

* [~Command](#SpikeyBot..Command)
    * [new Command()](#new_SpikeyBot..Command_new)
    * _instance_
        * [.trigger(cmd, msg)](#SpikeyBot..Command+trigger) ⇒ <code>boolean</code>
        * [.on(cmd, cb, [onlyserver])](#SpikeyBot..Command+on)
        * [.deleteEvent(cmd)](#SpikeyBot..Command+deleteEvent)
        * [.disable(cmd, channel)](#SpikeyBot..Command+disable)
        * [.enable(cmd, channel)](#SpikeyBot..Command+enable)
    * _inner_
        * [~cmds](#SpikeyBot..Command..cmds) : <code>Object.&lt;string, commandHandler&gt;</code> ℗
        * [~blacklist](#SpikeyBot..Command..blacklist) : <code>Object.&lt;string, Array.&lt;string&gt;&gt;</code> ℗

<a name="new_SpikeyBot..Command_new"></a>

#### new Command()
Defines command event triggering interface.

<a name="SpikeyBot..Command+trigger"></a>

#### command.trigger(cmd, msg) ⇒ <code>boolean</code>
Trigger a command firing and call it's handler passing in msg as only
argument.

**Kind**: instance method of [<code>Command</code>](#SpikeyBot..Command)  
**Returns**: <code>boolean</code> - True if command was handled by us.  

| Param | Type | Description |
| --- | --- | --- |
| cmd | <code>string</code> | Array of strings or a string of the command to trigger. |
| msg | <code>Discord.Message</code> | Message received from Discord to pass to handler. |

<a name="SpikeyBot..Command+on"></a>

#### command.on(cmd, cb, [onlyserver])
Registers a listener for a command.

**Kind**: instance method of [<code>Command</code>](#SpikeyBot..Command)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| cmd | <code>string</code> \| <code>Array.&lt;string&gt;</code> |  | Command to listen for. |
| cb | <code>commandHandler</code> |  | Function to call when command is triggered. |
| [onlyserver] | <code>boolean</code> | <code>false</code> | Whether the command is only allowed on a server. |

<a name="SpikeyBot..Command+deleteEvent"></a>

#### command.deleteEvent(cmd)
Remove listener for a command.

**Kind**: instance method of [<code>Command</code>](#SpikeyBot..Command)  

| Param | Type | Description |
| --- | --- | --- |
| cmd | <code>string</code> \| <code>Array.&lt;string&gt;</code> | Command to remove listener for. |

<a name="SpikeyBot..Command+disable"></a>

#### command.disable(cmd, channel)
Temporarily disables calling the handler for the given command in a
certain
Discord text channel.

**Kind**: instance method of [<code>Command</code>](#SpikeyBot..Command)  

| Param | Type | Description |
| --- | --- | --- |
| cmd | <code>string</code> | Command to disable. |
| channel | <code>string</code> | ID of channel to disable command for. |

<a name="SpikeyBot..Command+enable"></a>

#### command.enable(cmd, channel)
Re-enable a command that was disabled previously.

**Kind**: instance method of [<code>Command</code>](#SpikeyBot..Command)  

| Param | Type | Description |
| --- | --- | --- |
| cmd | <code>string</code> | Command to enable. |
| channel | <code>string</code> | ID of channel to enable command for. |

<a name="SpikeyBot..Command..cmds"></a>

#### Command~cmds : <code>Object.&lt;string, commandHandler&gt;</code> ℗
All tracked commands with handlers.

**Kind**: inner property of [<code>Command</code>](#SpikeyBot..Command)  
**Access**: private  
<a name="SpikeyBot..Command..blacklist"></a>

#### Command~blacklist : <code>Object.&lt;string, Array.&lt;string&gt;&gt;</code> ℗
List of disabled commands, and the channels they are disabled in.

**Kind**: inner property of [<code>Command</code>](#SpikeyBot..Command)  
**Access**: private  
<a name="SpikeyBot..testMode"></a>

### SpikeyBot~testMode : <code>boolean</code> ℗
Is the bot currently responding as a unit test.

**Kind**: inner property of [<code>SpikeyBot</code>](#SpikeyBot)  
**Access**: private  
<a name="SpikeyBot..subModuleNames"></a>

### SpikeyBot~subModuleNames : <code>Array.&lt;string&gt;</code> ℗
The list of all submodules to load.

**Kind**: inner property of [<code>SpikeyBot</code>](#SpikeyBot)  
**Access**: private  
<a name="SpikeyBot..setDev"></a>

### SpikeyBot~setDev : <code>boolean</code> ℗
Is this bot running in development mode.

**Kind**: inner property of [<code>SpikeyBot</code>](#SpikeyBot)  
**Access**: private  
<a name="SpikeyBot..onlymusic"></a>

### SpikeyBot~onlymusic : <code>boolean</code> ℗
Should this bot only load minimal features as to not overlap with multiple
instances.

**Kind**: inner property of [<code>SpikeyBot</code>](#SpikeyBot)  
**Access**: private  
**Todo**

- [ ] Rename this.

<a name="SpikeyBot..subModules"></a>

### SpikeyBot~subModules : [<code>Array.&lt;SubModule&gt;</code>](#SubModule) ℗
Instances of sub-modules currently loaded.

**Kind**: inner property of [<code>SpikeyBot</code>](#SpikeyBot)  
**Access**: private  
<a name="SpikeyBot..reactToAnthony"></a>

### SpikeyBot~reactToAnthony : <code>boolean</code> ℗
Should we add a reaction to every message that Anthony sends. Overriden if
reboot.dat exists.

**Kind**: inner property of [<code>SpikeyBot</code>](#SpikeyBot)  
**Access**: private  
<a name="SpikeyBot..spikeyId"></a>

### SpikeyBot~spikeyId : <code>string</code> ℗
SpikeyRobot's Discord ID.

**Kind**: inner constant of [<code>SpikeyBot</code>](#SpikeyBot)  
**Access**: private  
<a name="SpikeyBot..trustedIds"></a>

### SpikeyBot~trustedIds : <code>Array.&lt;string&gt;</code> ℗
Discord IDs that are allowed to reboot the bot.

**Kind**: inner constant of [<code>SpikeyBot</code>](#SpikeyBot)  
**Access**: private  
<a name="SpikeyBot..introduction"></a>

### SpikeyBot~introduction : <code>string</code> ℗
The introduction message the bots sends when joining a guild.

**Kind**: inner constant of [<code>SpikeyBot</code>](#SpikeyBot)  
**Access**: private  
<a name="SpikeyBot..helpmessagereply"></a>

### SpikeyBot~helpmessagereply : <code>string</code> ℗
The message sent to the channel where the user asked for help.

**Kind**: inner constant of [<code>SpikeyBot</code>](#SpikeyBot)  
**Access**: private  
<a name="SpikeyBot..blockedmessage"></a>

### SpikeyBot~blockedmessage : <code>string</code> ℗
The message sent to the channel where the user asked to be DM'd, but we
were unable to deliver the DM.

**Kind**: inner constant of [<code>SpikeyBot</code>](#SpikeyBot)  
**Access**: private  
<a name="SpikeyBot..onlyservermessage"></a>

### SpikeyBot~onlyservermessage : <code>string</code> ℗
The message to send to the user if they attempt a server-only command in a
non-server channel.

**Kind**: inner constant of [<code>SpikeyBot</code>](#SpikeyBot)  
**Access**: private  
<a name="SpikeyBot..disabledcommandmessage"></a>

### SpikeyBot~disabledcommandmessage : <code>string</code> ℗
The message to send to the user if the command they attempted is currently
disabled in the channel.

**Kind**: inner constant of [<code>SpikeyBot</code>](#SpikeyBot)  
**Access**: private  
<a name="SpikeyBot..command"></a>

### SpikeyBot~command : <code>Command</code> ℗
The current instance of Command.

**Kind**: inner constant of [<code>SpikeyBot</code>](#SpikeyBot)  
**Access**: private  
<a name="SpikeyBot..isCmd"></a>

### SpikeyBot~isCmd(msg, cmd) ⇒ <code>boolean</code> ℗
Checks if given message is the given command.

**Kind**: inner method of [<code>SpikeyBot</code>](#SpikeyBot)  
**Returns**: <code>boolean</code> - True if msg is the given command.  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord.Message</code> | Message from Discord to check if it is the given command. |
| cmd | <code>string</code> | Command to check if the message is this command. |

<a name="SpikeyBot..updateGame"></a>

### SpikeyBot~updateGame(password_, game) ⇒ <code>boolean</code> ℗
Changes the bot's status message.

**Kind**: inner method of [<code>SpikeyBot</code>](#SpikeyBot)  
**Returns**: <code>boolean</code> - True if an error occurred.  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| password_ | <code>string</code> | Password required to change status. |
| game | <code>string</code> | New message to set game to. |

<a name="SpikeyBot..mention"></a>

### SpikeyBot~mention(msg) ⇒ <code>string</code> ℗
Creates formatted string for mentioning the author of msg.

**Kind**: inner method of [<code>SpikeyBot</code>](#SpikeyBot)  
**Returns**: <code>string</code> - Formatted mention string.  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord.Message</code> | Message to format a mention for the author of. |

<a name="SpikeyBot..reply"></a>

### SpikeyBot~reply(msg, text, post) ⇒ <code>Promise</code> ℗
Replies to the author and channel of msg with the given message.

**Kind**: inner method of [<code>SpikeyBot</code>](#SpikeyBot)  
**Returns**: <code>Promise</code> - Promise of Discord.Message that we attempted to send.  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord.Message</code> | Message to reply to. |
| text | <code>string</code> | The main body of the message. |
| post | <code>string</code> | The footer of the message. |

<a name="SpikeyBot..onReady"></a>

### SpikeyBot~onReady() ℗
The bot has become ready.

**Kind**: inner method of [<code>SpikeyBot</code>](#SpikeyBot)  
**Access**: private  
<a name="SpikeyBot..onMessage"></a>

### SpikeyBot~onMessage(msg) ℗
Handle a message sent.

**Kind**: inner method of [<code>SpikeyBot</code>](#SpikeyBot)  
**Emits**: [<code>Command</code>](#event_Command)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord.Message</code> | Message that was sent in Discord. |

<a name="SpikeyBot..onGuildCreate"></a>

### SpikeyBot~onGuildCreate(guild) ℗
Handle being added to a guild.

**Kind**: inner method of [<code>SpikeyBot</code>](#SpikeyBot)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| guild | <code>Discord.Guild</code> | The guild that we just joined. |

<a name="SpikeyBot..onGuildBanAdd"></a>

### SpikeyBot~onGuildBanAdd(guild, user) ℗
Handle user banned on a guild.

**Kind**: inner method of [<code>SpikeyBot</code>](#SpikeyBot)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| guild | <code>Discord.Guild</code> | The guild on which the ban happened. |
| user | <code>Discord.User</code> | The user that was banned. |

<a name="SpikeyBot..commandToggleReact"></a>

### SpikeyBot~commandToggleReact(msg) : <code>commandHandler</code> ℗
Toggle reactions to Anthony.

**Kind**: inner method of [<code>SpikeyBot</code>](#SpikeyBot)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord.Message</code> | Message that triggered command. |

<a name="SpikeyBot..commandHelp"></a>

### SpikeyBot~commandHelp(msg) : <code>commandHandler</code> ℗
Send help message to user who requested it.

**Kind**: inner method of [<code>SpikeyBot</code>](#SpikeyBot)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord.Message</code> | Message that triggered command. |

<a name="SpikeyBot..commandUpdateGame"></a>

### SpikeyBot~commandUpdateGame(msg) : <code>commandHandler</code> ℗
Change current status message.

**Kind**: inner method of [<code>SpikeyBot</code>](#SpikeyBot)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord.Message</code> | Message that triggered command. |

<a name="SpikeyBot..commandReboot"></a>

### SpikeyBot~commandReboot(msg) : <code>commandHandler</code> ℗
Trigger a reboot of the bot. Actually just gracefully shuts down, and
expects to be immediately restarted.

**Kind**: inner method of [<code>SpikeyBot</code>](#SpikeyBot)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord.Message</code> | Message that triggered command. |

<a name="SpikeyBot..commandReload"></a>

### SpikeyBot~commandReload(msg) : <code>commandHandler</code> ℗
Reload all sub modules by unloading then re-requiring.

**Kind**: inner method of [<code>SpikeyBot</code>](#SpikeyBot)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord.Message</code> | Message that triggered command. |

<a name="SubModule"></a>

## SubModule
Base class for all Sub-Modules.

**Kind**: global class  

* [SubModule](#SubModule)
    * _instance_
        * [.helpMessage](#SubModule+helpMessage) : <code>string</code> \| <code>Discord~MessageEmbed</code>
        * [.prefix](#SubModule+prefix) : <code>string</code>
        * [.myPrefix](#SubModule+myPrefix) : <code>string</code>
        * *[.prePrefix](#SubModule+prePrefix) : <code>string</code>*
        * [.Discord](#SubModule+Discord) : <code>Discord</code>
        * [.client](#SubModule+client) : <code>Discord~Client</code>
        * [.command](#SubModule+command) : [<code>Command</code>](#SpikeyBot..Command)
        * [.common](#SubModule+common) : [<code>Common</code>](#Common)
        * *[.myName](#SubModule+myName) : <code>string</code>*
        * *[.initialize()](#SubModule+initialize)*
        * [.begin(prefix, Discord, client, command, common)](#SubModule+begin)
        * [.end()](#SubModule+end)
        * *[.shutdown()](#SubModule+shutdown)*
        * *[.save()](#SubModule+save)*
    * _static_
        * [.extend(child)](#SubModule.extend)
    * _inner_
        * [~initialized](#SubModule..initialized) : <code>boolean</code> ℗

<a name="SubModule+helpMessage"></a>

### subModule.helpMessage : <code>string</code> \| <code>Discord~MessageEmbed</code>
The help message to show the user in the main help message.

**Kind**: instance property of [<code>SubModule</code>](#SubModule)  
<a name="SubModule+prefix"></a>

### subModule.prefix : <code>string</code>
The main prefix in use for this bot. Only available after begin() is
called.

**Kind**: instance property of [<code>SubModule</code>](#SubModule)  
**Read only**: true  
<a name="SubModule+myPrefix"></a>

### subModule.myPrefix : <code>string</code>
The prefix this submodule uses. Formed by appending this.prefix to
this.prePrefix. this.prePrefix must be defined before begin(), otherwise it
is ignored.

**Kind**: instance property of [<code>SubModule</code>](#SubModule)  
**Read only**: true  
<a name="SubModule+prePrefix"></a>

### *subModule.prePrefix : <code>string</code>*
The prefix for the global prefix for this subModule. Must be defined before
begin(), otherwise it is ignored.

**Kind**: instance abstract property of [<code>SubModule</code>](#SubModule)  
**Default**: <code>&quot;&quot;</code>  
<a name="SubModule+Discord"></a>

### subModule.Discord : <code>Discord</code>
The current Discord object instance of the bot.

**Kind**: instance property of [<code>SubModule</code>](#SubModule)  
<a name="SubModule+client"></a>

### subModule.client : <code>Discord~Client</code>
The current bot client.

**Kind**: instance property of [<code>SubModule</code>](#SubModule)  
<a name="SubModule+command"></a>

### subModule.command : [<code>Command</code>](#SpikeyBot..Command)
The command object for registering command listeners.

**Kind**: instance property of [<code>SubModule</code>](#SubModule)  
<a name="SubModule+common"></a>

### subModule.common : [<code>Common</code>](#Common)
The common object.

**Kind**: instance property of [<code>SubModule</code>](#SubModule)  
<a name="SubModule+myName"></a>

### *subModule.myName : <code>string</code>*
The name of this submodule. Used for differentiating in the log. Should be
defined before begin().

**Kind**: instance abstract property of [<code>SubModule</code>](#SubModule)  
**Access**: protected  
<a name="SubModule+initialize"></a>

### *subModule.initialize()*
The function called at the end of begin() for further initialization
specific to the subModule. Must be defined before begin() is called.

**Kind**: instance abstract method of [<code>SubModule</code>](#SubModule)  
**Access**: protected  
<a name="SubModule+begin"></a>

### subModule.begin(prefix, Discord, client, command, common)
Initialize this submodule.

**Kind**: instance method of [<code>SubModule</code>](#SubModule)  

| Param | Type | Description |
| --- | --- | --- |
| prefix | <code>string</code> | The global prefix for this bot. |
| Discord | <code>Discord</code> | The Discord object for the API library. |
| client | <code>Discord~Client</code> | The client that represents this bot. |
| command | <code>Command</code> | The command instance in which to register command listeners. |
| common | <code>Object</code> | Object storing common functions. |

<a name="SubModule+end"></a>

### subModule.end()
Trigger subModule to shutdown and get ready for process terminating.

**Kind**: instance method of [<code>SubModule</code>](#SubModule)  
<a name="SubModule+shutdown"></a>

### *subModule.shutdown()*
Shutdown and disable this submodule. Removes all event listeners.

**Kind**: instance abstract method of [<code>SubModule</code>](#SubModule)  
**Access**: protected  
<a name="SubModule+save"></a>

### *subModule.save()*
Saves all data to files necessary for saving current state.

**Kind**: instance abstract method of [<code>SubModule</code>](#SubModule)  
<a name="SubModule.extend"></a>

### SubModule.extend(child)
Extends SubModule as the base class of a child.

**Kind**: static method of [<code>SubModule</code>](#SubModule)  

| Param | Type | Description |
| --- | --- | --- |
| child | <code>Object</code> | The child class to extend. |

<a name="SubModule..initialized"></a>

### SubModule~initialized : <code>boolean</code> ℗
Has this subModule been initialized yet (Has begin() been called).

**Kind**: inner property of [<code>SubModule</code>](#SubModule)  
**Default**: <code>false</code>  
**Access**: private  
<a name="updateEvents"></a>

## updateEvents()
Parse all default events from file.

**Kind**: global function  
<a name="updateMessages"></a>

## updateMessages()
Parse all messages from file.

**Kind**: global function  
<a name="updateBattles"></a>

## updateBattles()
Parse all battles from file.

**Kind**: global function  
<a name="setupHelp"></a>

## setupHelp()
Set all help messages once we know what prefix to use.

**Kind**: global function  
<a name="begin"></a>

## begin(prefix_, Discord_, client_, command_, common_)
Initialize this submodule.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| prefix_ | <code>string</code> | The global prefix for this bot. |
| Discord_ | <code>Discord</code> | The Discord object for the API library. |
| client_ | <code>Discord.Client</code> | The client that represents this bot. |
| command_ | <code>Command</code> | The command instance in which to register command listeners. |
| common_ | <code>Object</code> | Object storing common functions. |

<a name="end"></a>

## end()
Shutdown and disable this submodule. Removes all event listeners.

**Kind**: global function  
<a name="handleMessageEdit"></a>

## handleMessageEdit(oldMsg, newMsg)
Hanlder for when the create event message is edited and we should update our
message with the updated event.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| oldMsg | <code>Discord.Message</code> | The message before being edited. |
| newMsg | <code>Discord.Message</code> | The message after being edited. |

<a name="handleCommand"></a>

## handleCommand(msg)
Handle a command from a user and pass into relevant functions.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord.Message</code> | Message that triggered command. |

<a name="mention"></a>

## mention(msg) ⇒ <code>string</code>
Creates formatted string for mentioning the author of msg.

**Kind**: global function  
**Returns**: <code>string</code> - Formatted mention string.  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord.Message</code> | Message to format a mention for the author of. |

<a name="reply"></a>

## reply(msg, text, post) ⇒ <code>Promise</code>
Replies to the author and channel of msg with the given message.

**Kind**: global function  
**Returns**: <code>Promise</code> - Promise of Discord.Message that we attempted to send.  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord.Message</code> | Message to reply to. |
| text | <code>string</code> | The main body of the message. |
| post | <code>string</code> | The footer of the message. |

<a name="checkForRole"></a>

## checkForRole(msg) ⇒ <code>boolean</code>
Check if author of msg has the required role to run commands.

**Kind**: global function  
**Returns**: <code>boolean</code> - If the message author has the necessary role.  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord.Message</code> | Message of the author to check for the role. |

<a name="checkPerms"></a>

## checkPerms(msg, cb)
Check if author of msg has permissions, then trigger callback with guild id.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord.Message</code> | Message of the user to ensure has proper permissions. |
| cb | [<code>hgCommandHandler</code>](#hgCommandHandler) | Callback to call if user has proper permissions to run command. |

<a name="Player"></a>

## Player(id, username, avatarURL)
Serializable container for data pertaining to a single user.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>string</code> | The id of the user this object is representing. |
| username | <code>string</code> | The name of the user to show in the game. |
| avatarURL | <code>string</code> | URL to avatar to show for the user in the game. |

**Properties**

| Name | Type | Description |
| --- | --- | --- |
| id | <code>string</code> | The id of the User this Player represents. |
| name | <code>string</code> | The name of this Player. |
| avatarURL | <code>string</code> | The URL to the discord avatar of the User. |
| living | <code>boolean</code> | Is the player still alive. |
| bleeding | <code>number</code> | How many days has the player been wounded. |
| rank | <code>number</code> | The current rank of the player in the game. |
| state | <code>string</code> | The current player state (normal, wounded, dead, zombie). |
| kills | <code>number</code> | The number of players this player has caused to die. |

<a name="Team"></a>

## Team(id, name, players)
Serializable container for data about a team in a game.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>string</code> \| <code>number</code> | The id unique to a guild for this team. |
| name | <code>string</code> | The name of this team. |
| players | <code>Array.&lt;string&gt;</code> | Array of player ids on the team. |

**Properties**

| Name | Type | Description |
| --- | --- | --- |
| id | <code>string</code> | The unique id unique to a guild for this team. |
| name | <code>string</code> | The name of this team. |
| players | <code>Array.&lt;string&gt;</code> | Array of player ids on the team. |
| rank | <code>number</code> | The current team rank. |
| numAlive | <code>number</code> | The number of players on the team still alive. |

<a name="Event"></a>

## Event(message, [numVictim], [numAttacker], [victimOutcome], [attackerOutcome], [victimKiller], [attackerKiller], battle, [state], attacks)
Event that can happen in a game.

**Kind**: global function  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| message | <code>string</code> |  | The message to show. |
| [numVictim] | <code>number</code> | <code>0</code> | The number of victims in this event. |
| [numAttacker] | <code>number</code> | <code>0</code> | The number of attackers in this event. |
| [victimOutcome] | <code>string</code> | <code>&quot;&#x27;nothing&#x27;&quot;</code> | The outcome of the victims from this event. |
| [attackerOutcome] | <code>string</code> | <code>&quot;&#x27;notnorth&#x27;&quot;</code> | The outcome of the attackers from this event. |
| [victimKiller] | <code>boolean</code> | <code>false</code> | Do the victims kill anyone in this event. Used for calculating kill count. |
| [attackerKiller] | <code>boolean</code> | <code>false</code> | Do the attackers kill anyone in this event. Used for calculating kill count. |
| battle | <code>boolean</code> | <code>false</code> | Is this event a battle? |
| [state] | <code>number</code> | <code>0</code> | State of event if there are multiple attacks before the event. |
| attacks | [<code>Array.&lt;Event&gt;</code>](#Event) |  | Array of attacks that take place before the event. |

**Properties**

| Name | Type | Description |
| --- | --- | --- |
| message | <code>string</code> | The message to show. |
| victim | <code>Object</code> | Information about the victims in this event. |
| attacker | <code>Object</code> | Information about the attackers in this event. |
| battle | <code>boolean</code> | Does this event a battle. |
| state | <code>number</code> | The current state of printing the battle messages. |
| attacks | [<code>Array.&lt;Event&gt;</code>](#Event) | The attacks in a battle to show before the message. |

<a name="makePlayer"></a>

## makePlayer(user) ⇒ [<code>Player</code>](#Player)
Create a Player from a given Disord.User.

**Kind**: global function  
**Returns**: [<code>Player</code>](#Player) - Player object created from User.  

| Param | Type | Description |
| --- | --- | --- |
| user | <code>Discord.User</code> | User to make a Player from. |

<a name="sendAtTime"></a>

## sendAtTime(channel, one, two, time)
Delay a message to send at the given time in milliseconds since epoch.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| channel | <code>Discord.TextChannel</code> | The channel to send the message in. |
| one | <code>Discord.StringResolvable</code> \| <code>Discord.MessageOptions</code> \| <code>Discord.MessageEmbed</code> \| <code>Discord.MessageAttachment</code> \| <code>Array.&lt;Discord.MessageAttachment&gt;</code> | The message to send. |
| two | <code>Discord.StringResolvable</code> \| <code>Discord.MessageOptions</code> \| <code>Discord.MessageEmbed</code> \| <code>Discord.MessageAttachment</code> \| <code>Array.&lt;Discord.MessageAttachment&gt;</code> | The message to send. |
| time | <code>number</code> | The time to send the message in milliseconds since epoch. |

<a name="createGame"></a>

## createGame(msg, id, [silent])
Create a Hungry Games for a guild.

**Kind**: global function  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| msg | <code>Discord.Message</code> |  | The message that lead to this being called. |
| id | <code>string</code> |  | The id of the guild this was triggered from. |
| [silent] | <code>boolean</code> | <code>false</code> | Should we suppress replies to message. |

<a name="getAllPlayers"></a>

## getAllPlayers(members, excluded, bots) ⇒ [<code>Array.&lt;Player&gt;</code>](#Player)
Form an array of Player objects based on guild members, excluded members, and
whether to include bots.

**Kind**: global function  
**Returns**: [<code>Array.&lt;Player&gt;</code>](#Player) - Array of players to include in the games.  

| Param | Type | Description |
| --- | --- | --- |
| members | <code>Discord.Collection.&lt;Discord.GuildMember&gt;</code> | All members in guild. |
| excluded | <code>Array.&lt;string&gt;</code> | Array of ids of users that should not be included in the games. |
| bots | <code>boolean</code> | Should bots be included in the games. |

<a name="formTeams"></a>

## formTeams(id)
Add users to teams, and remove excluded users from teams. Deletes empty
teams, and adds teams once all teams have teamSize of players.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>string</code> | Id of guild where this was triggered from. |

<a name="resetGame"></a>

## resetGame(msg, id)
Reset data that the user specifies.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord.Message</code> | The message that lead to this being called. |
| id | <code>string</code> | The id of the guild this was triggered from. |

<a name="showGameInfo"></a>

## showGameInfo(msg, id)
Send all of the game data about the current server to the chat.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord.Message</code> | The message that lead to this being called. |
| id | <code>string</code> | The id of the guild this was triggered from. |

<a name="showGameEvents"></a>

## showGameEvents(msg, id)
Send all event data about the default events to the chat.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord.Message</code> | The message that lead to this being called. |
| id | <code>string</code> | The id of the guild this was triggered from. |

<a name="startGame"></a>

## startGame(msg, id)
Start the games in the channel this was called from.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord.Message</code> | The message that lead to this being called. |
| id | <code>string</code> | The id of the guild this was triggered from. |

<a name="pauseAutoplay"></a>

## pauseAutoplay(msg, id)
Stop autoplaying.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord.Message</code> | The message that lead to this being called. |
| id | <code>string</code> | The id of the guild this was triggered from. |

<a name="startAutoplay"></a>

## startAutoplay(msg, id)
Start autoplaying.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord.Message</code> | The message that lead to this being called. |
| id | <code>string</code> | The id of the guild this was triggered from. |

<a name="nextDay"></a>

## nextDay(msg, id)
Simulate a single day then show events to users.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord.Message</code> | The message that lead to this being called. |
| id | <code>string</code> | The id of the guild this was triggered from. |

<a name="pickEvent"></a>

## pickEvent(userPool, eventPool, options, numAlive, teams, deathRate) ⇒ [<code>Event</code>](#Event)
Pick event that satisfies all requirements and settings.

**Kind**: global function  
**Returns**: [<code>Event</code>](#Event) - The chosen event that satisfies all requirements, or null if
something went wrong.  

| Param | Type | Description |
| --- | --- | --- |
| userPool | [<code>Array.&lt;Player&gt;</code>](#Player) | Pool of players left to chose from in this day. |
| eventPool | [<code>Array.&lt;Event&gt;</code>](#Event) | Pool of all events available to choose at this time. |
| options | <code>Object</code> | The options set in the current game. |
| numAlive | <code>number</code> | Number of players in the game still alive. |
| teams | [<code>Array.&lt;Team&gt;</code>](#Team) | Array of teams in this game. |
| deathRate | <code>Object</code> | Death rate weights. |

<a name="validateEventTeamConstraint"></a>

## validateEventTeamConstraint(numVictim, numAttacker, userPool, teams, options, victimsDie, attackersDie) ⇒ <code>boolean</code>
Ensure teammates don't attack eachother.

**Kind**: global function  
**Returns**: <code>boolean</code> - Is is possible to use this event with current settings
about teammates.  

| Param | Type | Description |
| --- | --- | --- |
| numVictim | <code>number</code> | The number of victims in the event. |
| numAttacker | <code>number</code> | The number of attackers in the event. |
| userPool | [<code>Array.&lt;Player&gt;</code>](#Player) | Pool of all remaining players to put into an event. |
| teams | [<code>Array.&lt;Team&gt;</code>](#Team) | All teams in this game. |
| options | <code>Object</code> | Options for this game. |
| victimsDie | <code>boolean</code> | Do the victims die in this event? |
| attackersDie | <code>boolean</code> | Do the attackers die in this event? |

<a name="validateEventVictorConstraint"></a>

## validateEventVictorConstraint(numVictim, numAttacker, numAlive, options, victimsDie, attackersDie) ⇒ <code>boolean</code>
Ensure the event we choose will not force all players to be dead.

**Kind**: global function  
**Returns**: <code>boolean</code> - Will this event follow current options set about number of
victors required.  

| Param | Type | Description |
| --- | --- | --- |
| numVictim | <code>number</code> | Number of victims in this event. |
| numAttacker | <code>number</code> | Number of attackers in this event. |
| numAlive | <code>number</code> | Total number of living players left in the game. |
| options | <code>Object</code> | The options set for this game. |
| victimsDie | <code>boolean</code> | Do the victims die in this event? |
| attackersDie | <code>boolean</code> | Do the attackers die in this event? |

<a name="validateEventNumConstraint"></a>

## validateEventNumConstraint(numVictim, numAttacker, userPool, numAlive) ⇒ <code>boolean</code>
Ensure the number of users in an event is mathematically possible.

**Kind**: global function  
**Returns**: <code>boolean</code> - If the event requires a number of players that is valid
from the number of plaers left to choose from.  

| Param | Type | Description |
| --- | --- | --- |
| numVictim | <code>number</code> | Number of victims in this event. |
| numAttacker | <code>number</code> | Number of attackers in this event. |
| userPool | [<code>Array.&lt;Player&gt;</code>](#Player) | Pool of all remaining players to put into an event. |
| numAlive | <code>number</code> | Total number of living players left in the game. |

<a name="validateEventRequirements"></a>

## validateEventRequirements(numVictim, numAttacker, userPool, numAlive, teams, options, victimsDie, attackersDie) ⇒ <code>boolean</code>
Ensure the event chosen meets all requirements for actually being used in the
current game.

**Kind**: global function  
**Returns**: <code>boolean</code> - If all constraints are met with the given event.  

| Param | Type | Description |
| --- | --- | --- |
| numVictim | <code>number</code> | Number of victims in this event. |
| numAttacker | <code>number</code> | Number of attackers in this event. |
| userPool | [<code>Array.&lt;Player&gt;</code>](#Player) | Pool of all remaining players to put into an event. |
| numAlive | <code>number</code> | Total number of living players left in the game. |
| teams | [<code>Array.&lt;Team&gt;</code>](#Team) | All teams in this game. |
| options | <code>Object</code> | The options set for this game. |
| victimsDie | <code>boolean</code> | Do the victims die in this event? |
| attackersDie | <code>boolean</code> | Do the attackers die in this event? |

<a name="pickAffectedPlayers"></a>

## pickAffectedPlayers(numVictim, numAttacker, options, userPool, teams) ⇒ [<code>Array.&lt;Player&gt;</code>](#Player)
Pick the players to put into an event.

**Kind**: global function  
**Returns**: [<code>Array.&lt;Player&gt;</code>](#Player) - Array of all players that will be affected by this event.  

| Param | Type | Description |
| --- | --- | --- |
| numVictim | <code>number</code> | Number of victims in this event. |
| numAttacker | <code>number</code> | Number of attackers in this event. |
| options | <code>Object</code> | Options for this game. |
| userPool | [<code>Array.&lt;Player&gt;</code>](#Player) | Pool of all remaining players to put into an event. |
| teams | [<code>Array.&lt;Team&gt;</code>](#Team) | All teams in this game. |

<a name="makeBattleEvent"></a>

## makeBattleEvent(affectedUsers, numVictim, numAttacker, mention, id) ⇒ [<code>Event</code>](#Event)
Make an event that contains a battle between players before the main event
message.

**Kind**: global function  
**Returns**: [<code>Event</code>](#Event) - The event that was created.  

| Param | Type | Description |
| --- | --- | --- |
| affectedUsers | [<code>Array.&lt;Player&gt;</code>](#Player) | All of the players involved in the event. |
| numVictim | <code>number</code> | The number of victims in this event. |
| numAttacker | <code>number</code> | The number of attackers in this event. |
| mention | <code>boolean</code> | Should every player be mentioned when their name comes up? |
| id | <code>string</code> | The id of the guild that triggered this initially. |

<a name="weightedUserRand"></a>

## weightedUserRand() ⇒ <code>number</code>
Produce a random number that is weighted by multiEventUserDistribution.

**Kind**: global function  
**Returns**: <code>number</code> - The weighted number outcome.  
<a name="weightedEvent"></a>

## weightedEvent(eventPool, weightOpt) ⇒ <code>number</code>
Produce a random event that using weighted probabilities.

**Kind**: global function  
**Returns**: <code>number</code> - The index of the event that was chosen.  

| Param | Type | Description |
| --- | --- | --- |
| eventPool | [<code>Array.&lt;Event&gt;</code>](#Event) | The pool of all events to consider. |
| weightOpt | <code>Object</code> | The weighting options. |

<a name="isEventDeadly"></a>

## isEventDeadly(eventTry) ⇒ <code>boolean</code>
Decide if the given event should be considered deadly.

**Kind**: global function  
**Returns**: <code>boolean</code> - If the event is considered deadly.  

| Param | Type | Description |
| --- | --- | --- |
| eventTry | [<code>Event</code>](#Event) | The event to check. |

<a name="formatMultiNames"></a>

## formatMultiNames(names, mention) ⇒ <code>string</code>
Format an array of users into names based on options and grammar rules.

**Kind**: global function  
**Returns**: <code>string</code> - The formatted string of names.  

| Param | Type | Description |
| --- | --- | --- |
| names | [<code>Array.&lt;Player&gt;</code>](#Player) | An array of players to format the names of. |
| mention | <code>boolean</code> | Should the players be mentioned or just show their name normally. |

<a name="makeMessageEvent"></a>

## makeMessageEvent(message, id) ⇒ [<code>Event</code>](#Event)
Make an event that doesn't affect any players and is just a plain message.

**Kind**: global function  
**Returns**: [<code>Event</code>](#Event) - The event that was created.  

| Param | Type | Description |
| --- | --- | --- |
| message | <code>string</code> | The message to show. |
| id | <code>string</code> | The id of the guild that initially triggered this. |

<a name="makeSingleEvent"></a>

## makeSingleEvent(message, affectedUsers, numVictim, numAttacker, mention, id, victimOutcome, attackerOutcome) ⇒ <code>FinalEvent</code>
Format an event string based on specified users.

**Kind**: global function  
**Returns**: <code>FinalEvent</code> - The final event that was created and formatted ready for
display.  

| Param | Type | Description |
| --- | --- | --- |
| message | <code>string</code> | The message to show. |
| affectedUsers | [<code>Array.&lt;Player&gt;</code>](#Player) | An array of all users affected by this event. |
| numVictim | <code>number</code> | Number of victims in this event. |
| numAttacker | <code>number</code> | Number of attackers in this event. |
| mention | <code>boolean</code> | Should all users be mentioned when their name appears? |
| id | <code>string</code> | The id of the guild this was initially triggered from. |
| victimOutcome | <code>string</code> | The outcome of the victims from this event. |
| attackerOutcome | <code>string</code> | The outcome of the attackers from this event. |

<a name="getMiniIcons"></a>

## getMiniIcons(users) ⇒ [<code>Array.&lt;UserIconUrl&gt;</code>](#UserIconUrl)
Get an array of icons urls from an array of users.

**Kind**: global function  
**Returns**: [<code>Array.&lt;UserIconUrl&gt;</code>](#UserIconUrl) - The user ids and urls for all users
avatars.  

| Param | Type | Description |
| --- | --- | --- |
| users | [<code>Array.&lt;Player&gt;</code>](#Player) | Array of users to process. |

<a name="printEvent"></a>

## printEvent(msg, id)
Print an event string to the channel and add images, or if no events remain,
trigger end of day.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord.Message</code> | The message that lead to this being called. |
| id | <code>string</code> | The id of the guild this was triggered from. |

<a name="printDay"></a>

## printDay(msg, id)
Trigger the end of a day and print summary/outcome at the end of the day.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord.Message</code> | The message that lead to this being called. |
| id | <code>string</code> | The id of the guild this was triggered from. |

<a name="endGame"></a>

## endGame(msg, id)
End a game early.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord.Message</code> | The message that lead to this being called. |
| id | <code>string</code> | The id of the guild this was triggered from. |

<a name="excludeUser"></a>

## excludeUser(msg, id)
Remove a user from users to be in next game.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord.Message</code> | The message that lead to this being called. |
| id | <code>string</code> | The id of the guild this was triggered from. |

<a name="includeUser"></a>

## includeUser(msg, id)
Add a user back into the next game.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord.Message</code> | The message that lead to this being called. |
| id | <code>string</code> | The id of the guild this was triggered from. |

<a name="listPlayers"></a>

## listPlayers(msg, id)
Show a formatted message of all users and teams in current server.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord.Message</code> | The message that lead to this being called. |
| id | <code>string</code> | The id of the guild this was triggered from. |

<a name="getName"></a>

## getName(msg, user) ⇒ <code>string</code>
Get the username of a user id if available, or their id if they couldn't be
found.

**Kind**: global function  
**Returns**: <code>string</code> - The user's name or id if name was unable to be found.  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord.Message</code> | The message that lead to this being called. |
| user | <code>string</code> | The id of the user to find the name of. |

<a name="toggleOpt"></a>

## toggleOpt(msg, id)
Change an option to a value that the user specifies.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord.Message</code> | The message that lead to this being called. |
| id | <code>string</code> | The id of the guild this was triggered from. |

<a name="showOpts"></a>

## showOpts(msg, options)
Format the options for the games and show them to the user.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord.Message</code> | The message that lead to this being called. |
| options | <code>Object</code> | The options to format. |

<a name="optChangeListener"></a>

## optChangeListener(msg_, options, index)
The callback for when the user chooses to change page of the options.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| msg_ | <code>Discord.Message</code> | The message we sent showing the options. |
| options | <code>Object</code> | The options to show in the message. |
| index | <code>number</code> | The page index to show. |

<a name="editTeam"></a>

## editTeam(msg, id)
Entry for all team commands.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord.Message</code> | The message that lead to this being called. |
| id | <code>string</code> | The id of the guild this was triggered from. |

<a name="swapTeamUsers"></a>

## swapTeamUsers(msg, id)
Swap two users from one team to the other.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord.Message</code> | The message that lead to this being called. |
| id | <code>string</code> | The id of the guild this was triggered from. |

<a name="moveTeamUser"></a>

## moveTeamUser(msg, id)
Move a single user to another team.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord.Message</code> | The message that lead to this being called. |
| id | <code>string</code> | The id of the guild this was triggered from. |

<a name="renameTeam"></a>

## renameTeam(msg, id)
Rename a team.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord.Message</code> | The message that lead to this being called. |
| id | <code>string</code> | The id of the guild this was triggered from. |

<a name="randomizeTeams"></a>

## randomizeTeams(msg, id)
Swap random users between teams.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord.Message</code> | The message that lead to this being called. |
| id | <code>string</code> | The id of the guild this was triggered from. |

<a name="createEvent"></a>

## createEvent(msg, id)
Create a custom event for a guild.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord.Message</code> | The message that lead to this being called. |
| id | <code>string</code> | The id of the guild this was triggered from. |

<a name="createEventNums"></a>

## createEventNums(msg, id, show, cb)
Let the user choose how many of something will be in this event being
created.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord.Message</code> | The message that lead to this being called. |
| id | <code>string</code> | The id of the guild this was triggered from. |
| show | <code>string</code> | The message to show explainig the number. |
| cb | [<code>createEventNumCallback</code>](#createEventNumCallback) | The callback after the user has chosen a number. |

<a name="createEventOutcome"></a>

## createEventOutcome(msg, id, show, cb)
Let the user choose what the outcome of an event will be.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord.Message</code> | The message that lead to this being called. |
| id | <code>string</code> | The id of the guild this was triggered from. |
| show | <code>string</code> | The message to show explainig the options. |
| cb | [<code>createEventOutcomeCallback</code>](#createEventOutcomeCallback) | The callback after the user has chosen an outcome. |

<a name="createEventAttacker"></a>

## createEventAttacker(msg, id, show, cb)
Let the user choose whether the event attackers and victims kill anyone.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord.Message</code> | The message that lead to this being called. |
| id | <code>string</code> | The id of the guild this was triggered from. |
| show | <code>string</code> | The message to show explainig the options. |
| cb | [<code>createEventBooleanCallback</code>](#createEventBooleanCallback) | The callback after the user has chosen an outcome. |

<a name="updateEventPreview"></a>

## updateEventPreview(msg)
When a user is creating a custom event and edits their message, we need to
edit the preview.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord.Message</code> | Our message previewing the new event. |

<a name="removeEvent"></a>

## removeEvent(msg, id)
Delete a custom event from a guild.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord.Message</code> | The message that lead to this being called. |
| id | <code>string</code> | The id of the guild this was triggered from. |

<a name="fetchStats"></a>

## fetchStats(events)
Put information about an array of events into the array.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| events | [<code>Array.&lt;Event&gt;</code>](#Event) | Array of events to process and modify. |

<a name="listEvents"></a>

## listEvents(msg, id, [page], [eventType], [editMsg])
Allow user to view all events available on their server and summary of each
type of event.

**Kind**: global function  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| msg | <code>Discord.Message</code> |  | The message that lead to this being called. |
| id | <code>string</code> |  | The id of the guild this was triggered from. |
| [page] | <code>number</code> | <code>0</code> | The page number to show. |
| [eventType] | <code>string</code> | <code>&quot;&#x27;player&#x27;&quot;</code> | The type of event to show. |
| [editMsg] | <code>Discord.Message</code> |  | The message to edit instead of sending a new message. |

<a name="formatEventString"></a>

## formatEventString(arenaEvent, [newline]) ⇒ <code>string</code>
Format an event to show its settings to the user.

**Kind**: global function  
**Returns**: <code>string</code> - The formatted message with emojis.  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| arenaEvent | [<code>Event</code>](#Event) |  | The event to format. |
| [newline] | <code>boolean</code> | <code>false</code> | If a new line should be inserted for better formatting. |

<a name="getOutcomeEmoji"></a>

## getOutcomeEmoji(outcome) ⇒ <code>string</code>
Get the emoji for a specific outcome of an event.

**Kind**: global function  
**Returns**: <code>string</code> - The emoji.  

| Param | Type | Description |
| --- | --- | --- |
| outcome | <code>string</code> | The outcome to get the emoji of. |

<a name="help"></a>

## help(msg, id)
Send help message to DM and reply to server.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord.Message</code> | The message that lead to this being called. |
| id | <code>string</code> | The id of the guild this was triggered from. |

<a name="nothing"></a>

## nothing() ⇒ <code>string</code>
Get a random word that means "nothing".

**Kind**: global function  
**Returns**: <code>string</code> - A word meaning "nothing".  
<a name="getMessage"></a>

## getMessage(type) ⇒ <code>string</code>
Get a random message of a given type from hgMessages.json.

**Kind**: global function  
**Returns**: <code>string</code> - A random message of the given type.  

| Param | Type | Description |
| --- | --- | --- |
| type | <code>string</code> | The message type to get. |

<a name="save"></a>

## save([opt])
Save all game data to file.

**Kind**: global function  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [opt] | <code>string</code> | <code>&quot;&#x27;sync&#x27;&quot;</code> | Can be 'async', otherwise defaults to synchronous. |

<a name="exit"></a>

## exit([code])
Catch process exiting so we can save if necessary, and remove other handlers
to allow for another module to take our place.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| [code] | <code>number</code> | The exit code. |

<a name="sigint"></a>

## sigint()
Same as exit(), but triggered via SIGINT, SIGHUP or SIGTERM.

**Kind**: global function  
<a name="unhandledRejection"></a>

## unhandledRejection(reason, p)
Handler for an unhandledRejection.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| reason | <code>Object</code> | Reason for rejection. |
| p | <code>Promise</code> | The promise that caused the rejection. |

<a name="event_Command"></a>

## "Command" (msg)
The function to call when a command is triggered.

**Kind**: event emitted  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord.Message</code> | The message sent in Discord. |

<a name="hgCommandHandler"></a>

## hgCommandHandler : <code>function</code>
Handler for a Hungry Games command.

**Kind**: global typedef  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord.Message</code> | The message sent in Discord that triggered this command. |
| id | <code>string</code> | The id of the guild this command was run on for convinience. |

<a name="UserIconUrl"></a>

## UserIconUrl : <code>object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| url | <code>string</code> | Url of icon. |
| id | <code>string</code> | Id of the user the icon belongs to. |

<a name="createEventNumCallback"></a>

## createEventNumCallback : <code>function</code>
The callback after receiving a number from user input.

**Kind**: global typedef  

| Param | Type | Description |
| --- | --- | --- |
| num | <code>number</code> | The number received from the user. |

<a name="createEventOutcomeCallback"></a>

## createEventOutcomeCallback : <code>function</code>
The callback after receiving an event outcome from a user.

**Kind**: global typedef  

| Param | Type | Description |
| --- | --- | --- |
| outcome | <code>string</code> | The outcome chosen by the user. |

<a name="createEventBooleanCallback"></a>

## createEventBooleanCallback : <code>function</code>
The callback after receiving a boolean input.

**Kind**: global typedef  

| Param | Type | Description |
| --- | --- | --- |
| outcome | <code>boolean</code> | The value chosen by the user. |

