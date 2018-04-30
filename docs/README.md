## Classes

<dl>
<dt><a href="#Common">Common</a></dt>
<dd><p>Common functions accross my projects. Mostly just logging.</p>
</dd>
<dt><a href="#HungryGames">HungryGames</a> ⇐ <code><a href="#SubModule">SubModule</a></code></dt>
<dd><p>Hunger Games simulator.</p>
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

## Typedefs

<dl>
<dt><a href="#commandHandler">commandHandler</a> : <code>function</code></dt>
<dd><p>The function to call when a command is triggered.</p>
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
<a name="HungryGames"></a>

## HungryGames ⇐ [<code>SubModule</code>](#SubModule)
Hunger Games simulator.

**Kind**: global class  
**Extends**: [<code>SubModule</code>](#SubModule)  

* [HungryGames](#HungryGames) ⇐ [<code>SubModule</code>](#SubModule)
    * _instance_
        * [.helpMessage](#SubModule+helpMessage) : <code>string</code> \| <code>Discord~MessageEmbed</code>
        * [.prefix](#SubModule+prefix) : <code>string</code>
        * [.myPrefix](#SubModule+myPrefix) : <code>string</code>
        * *[.postPrefix](#SubModule+postPrefix) : <code>string</code>*
        * [.Discord](#SubModule+Discord) : <code>Discord</code>
        * [.client](#SubModule+client) : <code>Discord~Client</code>
        * [.command](#SubModule+command) : [<code>Command</code>](#SpikeyBot..Command)
        * [.common](#SubModule+common) : [<code>Common</code>](#Common)
        * *[.myName](#SubModule+myName) : <code>string</code>*
        * [.initialized](#SubModule+initialized) : <code>boolean</code>
        * [.initialize()](#SubModule+initialize)
        * [.begin(prefix, Discord, client, command, common)](#SubModule+begin)
        * [.end()](#SubModule+end)
        * [.shutdown()](#SubModule+shutdown)
        * [.save()](#SubModule+save)
    * _inner_
        * [~Player](#HungryGames..Player)
            * [new Player(id, username, avatarURL)](#new_HungryGames..Player_new)
        * [~Team](#HungryGames..Team)
            * [new Team(id, name, players)](#new_HungryGames..Team_new)
        * [~Event](#HungryGames..Event)
            * [new Event(message, [numVictim], [numAttacker], [victimOutcome], [attackerOutcome], [victimKiller], [attackerKiller], [battle], [state], [attacks])](#new_HungryGames..Event_new)
        * [~games](#HungryGames..games) : [<code>Object.&lt;GuildGame&gt;</code>](#HungryGames..GuildGame) ℗
        * [~messages](#HungryGames..messages) : <code>Object.&lt;Array.&lt;string&gt;&gt;</code> ℗
        * [~battles](#HungryGames..battles) : <code>Object</code> ℗
        * [~intervals](#HungryGames..intervals) : <code>Object.&lt;number&gt;</code> ℗
        * [~battleMessage](#HungryGames..battleMessage) : <code>Object.&lt;Discord~Message&gt;</code> ℗
        * [~defaultBloodbathEvents](#HungryGames..defaultBloodbathEvents) : [<code>Array.&lt;Event&gt;</code>](#HungryGames..Event) ℗
        * [~defaultPlayerEvents](#HungryGames..defaultPlayerEvents) : [<code>Array.&lt;Event&gt;</code>](#HungryGames..Event) ℗
        * [~defaultArenaEvents](#HungryGames..defaultArenaEvents) : [<code>Array.&lt;ArenaEvent&gt;</code>](#HungryGames..ArenaEvent) ℗
        * [~newEventMessages](#HungryGames..newEventMessages) : <code>Object.&lt;Discord~Message&gt;</code> ℗
        * [~optionMessages](#HungryGames..optionMessages) : <code>Object.&lt;Discord~Message&gt;</code> ℗
        * [~saveFile](#HungryGames..saveFile) : <code>string</code> ℗
        * [~eventFile](#HungryGames..eventFile) : <code>string</code> ℗
        * [~messageFile](#HungryGames..messageFile) : <code>string</code> ℗
        * [~battleFile](#HungryGames..battleFile) : <code>string</code> ℗
        * [~fistLeft](#HungryGames..fistLeft) : <code>string</code> ℗
        * [~fistRight](#HungryGames..fistRight) : <code>string</code> ℗
        * [~fistBoth](#HungryGames..fistBoth) : <code>string</code> ℗
        * [~iconSize](#HungryGames..iconSize) : <code>number</code> ℗
        * [~battleIconSize](#HungryGames..battleIconSize) : <code>number</code> ℗
        * [~victorIconSize](#HungryGames..victorIconSize) : <code>number</code> ℗
        * [~fetchSize](#HungryGames..fetchSize) : <code>number</code> ℗
        * [~iconGap](#HungryGames..iconGap) : <code>number</code> ℗
        * [~roleName](#HungryGames..roleName) : <code>string</code> ℗
        * [~numEventsPerPage](#HungryGames..numEventsPerPage) : <code>number</code> ℗
        * [~maxReactAwaitTime](#HungryGames..maxReactAwaitTime) : <code>number</code> ℗
        * [~defaultOptions](#HungryGames..defaultOptions) : <code>Object.&lt;{value: (string\|number\|boolean), values: ?Array.&lt;string&gt;, comment: string}&gt;</code> ℗
        * [~lotsOfDeathRate](#HungryGames..lotsOfDeathRate) : <code>number</code> ℗
        * [~littleDeathRate](#HungryGames..littleDeathRate) : <code>number</code> ℗
        * [~defaultColor](#HungryGames..defaultColor) : <code>Discord~ColorResolveable</code> ℗
        * [~emoji](#HungryGames..emoji) : <code>Object.&lt;string&gt;</code> ℗
        * [~alph](#HungryGames..alph) : <code>string</code> ℗
        * [~multiEventUserDistribution](#HungryGames..multiEventUserDistribution) : <code>Object</code> ℗
        * [~deathRateWeights](#HungryGames..deathRateWeights) : [<code>Object.&lt;EventWeights&gt;</code>](#HungryGames..EventWeights) ℗
        * [~helpmessagereply](#HungryGames..helpmessagereply) : <code>string</code> ℗
        * [~blockedmessage](#HungryGames..blockedmessage) : <code>string</code> ℗
        * [~helpObject](#HungryGames..helpObject) ℗
        * [~webURL](#HungryGames..webURL) : <code>string</code> ℗
        * [~updateEvents()](#HungryGames..updateEvents) ℗
        * [~updateMessages()](#HungryGames..updateMessages) ℗
        * [~updateBattles()](#HungryGames..updateBattles) ℗
        * [~setupHelp()](#HungryGames..setupHelp) ℗
        * [~handleMessageEdit(oldMsg, newMsg)](#HungryGames..handleMessageEdit) ℗
        * [~handleCommand(msg)](#HungryGames..handleCommand) : [<code>commandHandler</code>](#commandHandler) ℗
        * [~mention(msg)](#HungryGames..mention) ⇒ <code>string</code> ℗
        * [~reply(msg, text, post)](#HungryGames..reply) ⇒ <code>Promise.&lt;Discord~Message&gt;</code> ℗
        * [~checkForRole(msg)](#HungryGames..checkForRole) ⇒ <code>boolean</code> ℗
        * [~checkPerms(msg, cb)](#HungryGames..checkPerms) ℗
        * [~makePlayer(user)](#HungryGames..makePlayer) ⇒ [<code>Player</code>](#HungryGames..Player) ℗
        * [~sendAtTime(channel, one, two, time)](#HungryGames..sendAtTime) ℗
        * [~createGame(msg, id, [silent])](#HungryGames..createGame) : [<code>hgCommandHandler</code>](#HungryGames..hgCommandHandler) ℗
        * [~getAllPlayers(members, excluded, bots)](#HungryGames..getAllPlayers) ⇒ [<code>Array.&lt;Player&gt;</code>](#HungryGames..Player) ℗
        * [~formTeams(id)](#HungryGames..formTeams) ℗
        * [~resetGame(msg, id)](#HungryGames..resetGame) : [<code>hgCommandHandler</code>](#HungryGames..hgCommandHandler) ℗
        * [~showGameInfo(msg, id)](#HungryGames..showGameInfo) : [<code>hgCommandHandler</code>](#HungryGames..hgCommandHandler) ℗
        * [~showGameEvents(msg, id)](#HungryGames..showGameEvents) : [<code>hgCommandHandler</code>](#HungryGames..hgCommandHandler) ℗
        * [~startGame(msg, id)](#HungryGames..startGame) : [<code>hgCommandHandler</code>](#HungryGames..hgCommandHandler) ℗
        * [~pauseAutoplay(msg, id)](#HungryGames..pauseAutoplay) : [<code>hgCommandHandler</code>](#HungryGames..hgCommandHandler) ℗
        * [~startAutoplay(msg, id)](#HungryGames..startAutoplay) : [<code>hgCommandHandler</code>](#HungryGames..hgCommandHandler) ℗
        * [~nextDay(msg, id)](#HungryGames..nextDay) : [<code>hgCommandHandler</code>](#HungryGames..hgCommandHandler) ℗
        * [~pickEvent(userPool, eventPool, options, numAlive, teams, deathRate)](#HungryGames..pickEvent) ⇒ [<code>Event</code>](#HungryGames..Event) ℗
        * [~validateEventTeamConstraint(numVictim, numAttacker, userPool, teams, options, victimsDie, attackersDie)](#HungryGames..validateEventTeamConstraint) ⇒ <code>boolean</code> ℗
        * [~validateEventVictorConstraint(numVictim, numAttacker, numAlive, options, victimsDie, attackersDie)](#HungryGames..validateEventVictorConstraint) ⇒ <code>boolean</code> ℗
        * [~validateEventNumConstraint(numVictim, numAttacker, userPool, numAlive)](#HungryGames..validateEventNumConstraint) ⇒ <code>boolean</code> ℗
        * [~validateEventRequirements(numVictim, numAttacker, userPool, numAlive, teams, options, victimsDie, attackersDie)](#HungryGames..validateEventRequirements) ⇒ <code>boolean</code> ℗
        * [~pickAffectedPlayers(numVictim, numAttacker, options, userPool, teams)](#HungryGames..pickAffectedPlayers) ⇒ [<code>Array.&lt;Player&gt;</code>](#HungryGames..Player) ℗
        * [~makeBattleEvent(affectedUsers, numVictim, numAttacker, mention, id)](#HungryGames..makeBattleEvent) ⇒ [<code>Event</code>](#HungryGames..Event) ℗
        * [~weightedUserRand()](#HungryGames..weightedUserRand) ⇒ <code>number</code> ℗
        * [~weightedEvent(eventPool, weightOpt)](#HungryGames..weightedEvent) ⇒ <code>number</code> ℗
        * [~isEventDeadly(eventTry)](#HungryGames..isEventDeadly) ⇒ <code>boolean</code> ℗
        * [~formatMultiNames(names, mention)](#HungryGames..formatMultiNames) ⇒ <code>string</code> ℗
        * [~makeMessageEvent(message, id)](#HungryGames..makeMessageEvent) ⇒ [<code>Event</code>](#HungryGames..Event) ℗
        * [~makeSingleEvent(message, affectedUsers, numVictim, numAttacker, mention, id, victimOutcome, attackerOutcome)](#HungryGames..makeSingleEvent) ⇒ <code>HungryGames~FinalEvent</code> ℗
        * [~getMiniIcons(users)](#HungryGames..getMiniIcons) ⇒ [<code>Array.&lt;UserIconUrl&gt;</code>](#HungryGames..UserIconUrl) ℗
        * [~printEvent(msg, id)](#HungryGames..printEvent) ℗
        * [~printDay(msg, id)](#HungryGames..printDay) ℗
        * [~endGame(msg, id)](#HungryGames..endGame) : [<code>hgCommandHandler</code>](#HungryGames..hgCommandHandler) ℗
        * [~excludeUser(msg, id)](#HungryGames..excludeUser) : [<code>hgCommandHandler</code>](#HungryGames..hgCommandHandler) ℗
        * [~includeUser(msg, id)](#HungryGames..includeUser) : [<code>hgCommandHandler</code>](#HungryGames..hgCommandHandler) ℗
        * [~listPlayers(msg, id)](#HungryGames..listPlayers) : [<code>hgCommandHandler</code>](#HungryGames..hgCommandHandler) ℗
        * [~getName(msg, user)](#HungryGames..getName) ⇒ <code>string</code> ℗
        * [~toggleOpt(msg, id)](#HungryGames..toggleOpt) : [<code>hgCommandHandler</code>](#HungryGames..hgCommandHandler) ℗
        * [~showOpts(msg, options)](#HungryGames..showOpts) ℗
        * [~optChangeListener(msg_, options, index)](#HungryGames..optChangeListener) ℗
        * [~editTeam(msg, id)](#HungryGames..editTeam) : [<code>hgCommandHandler</code>](#HungryGames..hgCommandHandler) ℗
        * [~swapTeamUsers(msg, id)](#HungryGames..swapTeamUsers) ℗
        * [~moveTeamUser(msg, id)](#HungryGames..moveTeamUser) ℗
        * [~renameTeam(msg, id)](#HungryGames..renameTeam) ℗
        * [~randomizeTeams(msg, id)](#HungryGames..randomizeTeams) ℗
        * [~createEvent(msg, id)](#HungryGames..createEvent) : [<code>hgCommandHandler</code>](#HungryGames..hgCommandHandler) ℗
        * [~createEventNums(msg, id, show, cb)](#HungryGames..createEventNums) ℗
        * [~createEventOutcome(msg, id, show, cb)](#HungryGames..createEventOutcome) ℗
        * [~createEventAttacker(msg, id, show, cb)](#HungryGames..createEventAttacker) ℗
        * [~updateEventPreview(msg)](#HungryGames..updateEventPreview) ℗
        * [~removeEvent(msg, id)](#HungryGames..removeEvent) : [<code>hgCommandHandler</code>](#HungryGames..hgCommandHandler) ℗
        * [~fetchStats(events)](#HungryGames..fetchStats) ℗
        * [~listEvents(msg, id, [page], [eventType], [editMsg])](#HungryGames..listEvents) : [<code>hgCommandHandler</code>](#HungryGames..hgCommandHandler) ℗
        * [~formatEventString(arenaEvent, [newline])](#HungryGames..formatEventString) ⇒ <code>string</code> ℗
        * [~getOutcomeEmoji(outcome)](#HungryGames..getOutcomeEmoji) ⇒ <code>string</code> ℗
        * [~help(msg, id)](#HungryGames..help) : [<code>hgCommandHandler</code>](#HungryGames..hgCommandHandler) ℗
        * [~nothing()](#HungryGames..nothing) ⇒ <code>string</code> ℗
        * [~getMessage(type)](#HungryGames..getMessage) ⇒ <code>string</code> ℗
        * [~exit([code])](#HungryGames..exit) ℗
        * [~sigint()](#HungryGames..sigint) ℗
        * [~unhandledRejection(reason, p)](#HungryGames..unhandledRejection) ℗
        * [~EventWeights](#HungryGames..EventWeights) : <code>Object</code>
        * [~GuildGame](#HungryGames..GuildGame) : <code>Object</code>
        * [~Game](#HungryGames..Game) : <code>Object</code>
        * [~hgCommandHandler](#HungryGames..hgCommandHandler) : <code>function</code>
        * [~Battle](#HungryGames..Battle) : <code>Object</code>
        * [~ArenaEvent](#HungryGames..ArenaEvent) : <code>Object</code>
        * [~UserIconUrl](#HungryGames..UserIconUrl) : <code>Object</code>
        * [~createEventNumCallback](#HungryGames..createEventNumCallback) : <code>function</code>
        * [~createEventOutcomeCallback](#HungryGames..createEventOutcomeCallback) : <code>function</code>
        * [~createEventBooleanCallback](#HungryGames..createEventBooleanCallback) : <code>function</code>

<a name="SubModule+helpMessage"></a>

### hungryGames.helpMessage : <code>string</code> \| <code>Discord~MessageEmbed</code>
The help message to show the user in the main help message.

**Kind**: instance property of [<code>HungryGames</code>](#HungryGames)  
**Overrides**: [<code>helpMessage</code>](#SubModule+helpMessage)  
<a name="SubModule+prefix"></a>

### hungryGames.prefix : <code>string</code>
The main prefix in use for this bot. Only available after begin() is
called.

**Kind**: instance property of [<code>HungryGames</code>](#HungryGames)  
**Read only**: true  
<a name="SubModule+myPrefix"></a>

### hungryGames.myPrefix : <code>string</code>
The prefix this submodule uses. Formed by prepending this.prefix to
this.postPrefix. this.postPrefix must be defined before begin(), otherwise
it is ignored.

**Kind**: instance property of [<code>HungryGames</code>](#HungryGames)  
**Read only**: true  
<a name="SubModule+postPrefix"></a>

### *hungryGames.postPrefix : <code>string</code>*
The postfix for the global prefix for this subModule. Must be defined
before begin(), otherwise it is ignored.

**Kind**: instance abstract property of [<code>HungryGames</code>](#HungryGames)  
**Default**: <code>&quot;&quot;</code>  
**Overrides**: [<code>postPrefix</code>](#SubModule+postPrefix)  
<a name="SubModule+Discord"></a>

### hungryGames.Discord : <code>Discord</code>
The current Discord object instance of the bot.

**Kind**: instance property of [<code>HungryGames</code>](#HungryGames)  
<a name="SubModule+client"></a>

### hungryGames.client : <code>Discord~Client</code>
The current bot client.

**Kind**: instance property of [<code>HungryGames</code>](#HungryGames)  
<a name="SubModule+command"></a>

### hungryGames.command : [<code>Command</code>](#SpikeyBot..Command)
The command object for registering command listeners.

**Kind**: instance property of [<code>HungryGames</code>](#HungryGames)  
<a name="SubModule+common"></a>

### hungryGames.common : [<code>Common</code>](#Common)
The common object.

**Kind**: instance property of [<code>HungryGames</code>](#HungryGames)  
<a name="SubModule+myName"></a>

### *hungryGames.myName : <code>string</code>*
The name of this submodule. Used for differentiating in the log. Should be
defined before begin().

**Kind**: instance abstract property of [<code>HungryGames</code>](#HungryGames)  
**Overrides**: [<code>myName</code>](#SubModule+myName)  
**Access**: protected  
<a name="SubModule+initialized"></a>

### hungryGames.initialized : <code>boolean</code>
Has this subModule been initialized yet (Has begin() been called).

**Kind**: instance property of [<code>HungryGames</code>](#HungryGames)  
**Default**: <code>false</code>  
**Access**: protected  
**Read only**: true  
<a name="SubModule+initialize"></a>

### hungryGames.initialize()
The function called at the end of begin() for further initialization
specific to the subModule. Must be defined before begin() is called.

**Kind**: instance method of [<code>HungryGames</code>](#HungryGames)  
**Overrides**: [<code>initialize</code>](#SubModule+initialize)  
**Access**: protected  
<a name="SubModule+begin"></a>

### hungryGames.begin(prefix, Discord, client, command, common)
Initialize this submodule.

**Kind**: instance method of [<code>HungryGames</code>](#HungryGames)  

| Param | Type | Description |
| --- | --- | --- |
| prefix | <code>string</code> | The global prefix for this bot. |
| Discord | <code>Discord</code> | The Discord object for the API library. |
| client | <code>Discord~Client</code> | The client that represents this bot. |
| command | [<code>Command</code>](#SpikeyBot..Command) | The command instance in which to register command listeners. |
| common | [<code>Common</code>](#Common) | Class storing common functions. |

<a name="SubModule+end"></a>

### hungryGames.end()
Trigger subModule to shutdown and get ready for process terminating.

**Kind**: instance method of [<code>HungryGames</code>](#HungryGames)  
<a name="SubModule+shutdown"></a>

### hungryGames.shutdown()
Shutdown and disable this submodule. Removes all event listeners.

**Kind**: instance method of [<code>HungryGames</code>](#HungryGames)  
**Overrides**: [<code>shutdown</code>](#SubModule+shutdown)  
**Access**: protected  
<a name="SubModule+save"></a>

### hungryGames.save()
Saves all data to files necessary for saving current state.

**Kind**: instance method of [<code>HungryGames</code>](#HungryGames)  
**Overrides**: [<code>save</code>](#SubModule+save)  
<a name="HungryGames..Player"></a>

### HungryGames~Player
Serializable container for data pertaining to a single user.

**Kind**: inner class of [<code>HungryGames</code>](#HungryGames)  
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

<a name="new_HungryGames..Player_new"></a>

#### new Player(id, username, avatarURL)

| Param | Type | Description |
| --- | --- | --- |
| id | <code>string</code> | The id of the user this object is representing. |
| username | <code>string</code> | The name of the user to show in the game. |
| avatarURL | <code>string</code> | URL to avatar to show for the user in the game. |

<a name="HungryGames..Team"></a>

### HungryGames~Team
Serializable container for data about a team in a game.

**Kind**: inner class of [<code>HungryGames</code>](#HungryGames)  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| id | <code>string</code> | The unique id unique to a guild for this team. |
| name | <code>string</code> | The name of this team. |
| players | <code>Array.&lt;string&gt;</code> | Array of player ids on the team. |
| rank | <code>number</code> | The current team rank. |
| numAlive | <code>number</code> | The number of players on the team still alive. |

<a name="new_HungryGames..Team_new"></a>

#### new Team(id, name, players)

| Param | Type | Description |
| --- | --- | --- |
| id | <code>string</code> \| <code>number</code> | The id unique to a guild for this team. |
| name | <code>string</code> | The name of this team. |
| players | <code>Array.&lt;string&gt;</code> | Array of player ids on the team. |

<a name="HungryGames..Event"></a>

### HungryGames~Event
Event that can happen in a game.

**Kind**: inner class of [<code>HungryGames</code>](#HungryGames)  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| message | <code>string</code> | The message to show. |
| victim | <code>Object</code> | Information about the victims in this event. |
| attacker | <code>Object</code> | Information about the attackers in this event. |
| battle | <code>boolean</code> | Does this event a battle. |
| state | <code>number</code> | The current state of printing the battle messages. |
| attacks | [<code>Array.&lt;Event&gt;</code>](#HungryGames..Event) | The attacks in a battle to show before the message. |

<a name="new_HungryGames..Event_new"></a>

#### new Event(message, [numVictim], [numAttacker], [victimOutcome], [attackerOutcome], [victimKiller], [attackerKiller], [battle], [state], [attacks])

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| message | <code>string</code> |  | The message to show. |
| [numVictim] | <code>number</code> | <code>0</code> | The number of victims in this event. |
| [numAttacker] | <code>number</code> | <code>0</code> | The number of attackers in this event. |
| [victimOutcome] | <code>string</code> | <code>&quot;&#x27;nothing&#x27;&quot;</code> | The outcome of the victims from this event. |
| [attackerOutcome] | <code>string</code> | <code>&quot;&#x27;nothing&#x27;&quot;</code> | The outcome of the attackers from this event. |
| [victimKiller] | <code>boolean</code> | <code>false</code> | Do the victims kill anyone in this event. Used for calculating kill count. |
| [attackerKiller] | <code>boolean</code> | <code>false</code> | Do the attackers kill anyone in this event. Used for calculating kill count. |
| [battle] | <code>boolean</code> | <code>false</code> | Is this event a battle? |
| [state] | <code>number</code> | <code>0</code> | State of event if there are multiple attacks before the event. |
| [attacks] | [<code>Array.&lt;Event&gt;</code>](#HungryGames..Event) |  | Array of attacks that take place before the event. |

<a name="HungryGames..games"></a>

### HungryGames~games : [<code>Object.&lt;GuildGame&gt;</code>](#HungryGames..GuildGame) ℗
All currently tracked games.

**Kind**: inner property of [<code>HungryGames</code>](#HungryGames)  
**Default**: <code>{}</code>  
**Access**: private  
<a name="HungryGames..messages"></a>

### HungryGames~messages : <code>Object.&lt;Array.&lt;string&gt;&gt;</code> ℗
All messages to show for games. Parsed from file.

**Kind**: inner property of [<code>HungryGames</code>](#HungryGames)  
**Default**: <code>{}</code>  
**Access**: private  
**See**: [messageFile](#HungryGames..messageFile)  
<a name="HungryGames..battles"></a>

### HungryGames~battles : <code>Object</code> ℗
All attacks and outcomes for battles.

**Kind**: inner property of [<code>HungryGames</code>](#HungryGames)  
**Access**: private  
**See**: [battleFile](#HungryGames..battleFile)  
<a name="HungryGames..intervals"></a>

### HungryGames~intervals : <code>Object.&lt;number&gt;</code> ℗
All intervals for printing events.

**Kind**: inner property of [<code>HungryGames</code>](#HungryGames)  
**Default**: <code>{}</code>  
**Access**: private  
<a name="HungryGames..battleMessage"></a>

### HungryGames~battleMessage : <code>Object.&lt;Discord~Message&gt;</code> ℗
Storage of battle messages to edit the content of on the next update.

**Kind**: inner property of [<code>HungryGames</code>](#HungryGames)  
**Default**: <code>{}</code>  
**Access**: private  
<a name="HungryGames..defaultBloodbathEvents"></a>

### HungryGames~defaultBloodbathEvents : [<code>Array.&lt;Event&gt;</code>](#HungryGames..Event) ℗
Default parsed bloodbath events.

**Kind**: inner property of [<code>HungryGames</code>](#HungryGames)  
**Access**: private  
**See**: [eventFile](#HungryGames..eventFile)  
<a name="HungryGames..defaultPlayerEvents"></a>

### HungryGames~defaultPlayerEvents : [<code>Array.&lt;Event&gt;</code>](#HungryGames..Event) ℗
Default parsed player events.

**Kind**: inner property of [<code>HungryGames</code>](#HungryGames)  
**Access**: private  
**See**: [eventFile](#HungryGames..eventFile)  
<a name="HungryGames..defaultArenaEvents"></a>

### HungryGames~defaultArenaEvents : [<code>Array.&lt;ArenaEvent&gt;</code>](#HungryGames..ArenaEvent) ℗
Default parsed arena events.

**Kind**: inner property of [<code>HungryGames</code>](#HungryGames)  
**Access**: private  
**See**: [eventFile](#HungryGames..eventFile)  
<a name="HungryGames..newEventMessages"></a>

### HungryGames~newEventMessages : <code>Object.&lt;Discord~Message&gt;</code> ℗
Messages that the user sent with a new event to add, for storage while
getting the rest of the information about the event.

**Kind**: inner property of [<code>HungryGames</code>](#HungryGames)  
**Default**: <code>{}</code>  
**Access**: private  
<a name="HungryGames..optionMessages"></a>

### HungryGames~optionMessages : <code>Object.&lt;Discord~Message&gt;</code> ℗
Messages I have sent showing current options.

**Kind**: inner property of [<code>HungryGames</code>](#HungryGames)  
**Default**: <code>{}</code>  
**Access**: private  
<a name="HungryGames..saveFile"></a>

### HungryGames~saveFile : <code>string</code> ℗
The file path to save current state.

**Kind**: inner constant of [<code>HungryGames</code>](#HungryGames)  
**Default**: <code>&quot;./save/hg.json&quot;</code>  
**Access**: private  
**See**: [games](#HungryGames..games)  
<a name="HungryGames..eventFile"></a>

### HungryGames~eventFile : <code>string</code> ℗
The file path to read default events.

**Kind**: inner constant of [<code>HungryGames</code>](#HungryGames)  
**Default**: <code>&quot;./save/hgEvents.json&quot;</code>  
**Access**: private  
**See**

- [defaultPlayerEvents](#HungryGames..defaultPlayerEvents)
- [defaultArenaEvents](#HungryGames..defaultArenaEvents)
- [defaultBloodbathEvents](#HungryGames..defaultBloodbathEvents)

<a name="HungryGames..messageFile"></a>

### HungryGames~messageFile : <code>string</code> ℗
The file path to read messages.

**Kind**: inner constant of [<code>HungryGames</code>](#HungryGames)  
**Default**: <code>&quot;./save/hgMessages.json&quot;</code>  
**Access**: private  
**See**: [messages](#HungryGames..messages)  
<a name="HungryGames..battleFile"></a>

### HungryGames~battleFile : <code>string</code> ℗
The file path to read battle events.

**Kind**: inner constant of [<code>HungryGames</code>](#HungryGames)  
**Default**: <code>&quot;./save/hgBattles.json&quot;</code>  
**Access**: private  
**See**: [battles](#HungryGames..battles)  
<a name="HungryGames..fistLeft"></a>

### HungryGames~fistLeft : <code>string</code> ℗
The file path to read attacking left image.

**Kind**: inner constant of [<code>HungryGames</code>](#HungryGames)  
**Default**: <code>&quot;./img/fist_left.png&quot;</code>  
**Access**: private  
<a name="HungryGames..fistRight"></a>

### HungryGames~fistRight : <code>string</code> ℗
The file path to read attacking right image.

**Kind**: inner constant of [<code>HungryGames</code>](#HungryGames)  
**Default**: <code>&quot;./img/fist_right.png&quot;</code>  
**Access**: private  
<a name="HungryGames..fistBoth"></a>

### HungryGames~fistBoth : <code>string</code> ℗
The file path to read attacking both directions image.

**Kind**: inner constant of [<code>HungryGames</code>](#HungryGames)  
**Default**: <code>&quot;./img/fist_both.png&quot;</code>  
**Access**: private  
<a name="HungryGames..iconSize"></a>

### HungryGames~iconSize : <code>number</code> ℗
The size of the icon to show for each event.

**Kind**: inner constant of [<code>HungryGames</code>](#HungryGames)  
**Default**: <code>64</code>  
**Access**: private  
<a name="HungryGames..battleIconSize"></a>

### HungryGames~battleIconSize : <code>number</code> ℗
The size of the icon to show for each battle event.

**Kind**: inner constant of [<code>HungryGames</code>](#HungryGames)  
**Default**: <code>32</code>  
**Access**: private  
<a name="HungryGames..victorIconSize"></a>

### HungryGames~victorIconSize : <code>number</code> ℗
The size of the user icons to show for the victors.

**Kind**: inner constant of [<code>HungryGames</code>](#HungryGames)  
**Default**: <code>80</code>  
**Access**: private  
<a name="HungryGames..fetchSize"></a>

### HungryGames~fetchSize : <code>number</code> ℗
The size of the icon to request from discord.

**Kind**: inner constant of [<code>HungryGames</code>](#HungryGames)  
**Default**: <code>64</code>  
**Access**: private  
<a name="HungryGames..iconGap"></a>

### HungryGames~iconGap : <code>number</code> ℗
Pixels between each icon

**Kind**: inner constant of [<code>HungryGames</code>](#HungryGames)  
**Default**: <code>4</code>  
**Access**: private  
<a name="HungryGames..roleName"></a>

### HungryGames~roleName : <code>string</code> ℗
Role that a user must have in order to perform any commands.

**Kind**: inner constant of [<code>HungryGames</code>](#HungryGames)  
**Default**: <code>&quot;HG Creator&quot;</code>  
**Access**: private  
<a name="HungryGames..numEventsPerPage"></a>

### HungryGames~numEventsPerPage : <code>number</code> ℗
Number of events to show on a single page of events.

**Kind**: inner constant of [<code>HungryGames</code>](#HungryGames)  
**Default**: <code>10</code>  
**Access**: private  
<a name="HungryGames..maxReactAwaitTime"></a>

### HungryGames~maxReactAwaitTime : <code>number</code> ℗
Maximum amount of time to wait for reactions to a message.

**Kind**: inner constant of [<code>HungryGames</code>](#HungryGames)  
**Access**: private  
<a name="HungryGames..defaultOptions"></a>

### HungryGames~defaultOptions : <code>Object.&lt;{value: (string\|number\|boolean), values: ?Array.&lt;string&gt;, comment: string}&gt;</code> ℗
Default options for a game.

**Kind**: inner constant of [<code>HungryGames</code>](#HungryGames)  
**Access**: private  
<a name="HungryGames..lotsOfDeathRate"></a>

### HungryGames~lotsOfDeathRate : <code>number</code> ℗
If a larger percentage of people die in one day than this value, then show
a relevant message.

**Kind**: inner constant of [<code>HungryGames</code>](#HungryGames)  
**Default**: <code>0.75</code>  
**Access**: private  
<a name="HungryGames..littleDeathRate"></a>

### HungryGames~littleDeathRate : <code>number</code> ℗
If a lower percentage of people die in one day than this value, then show a
relevant message.

**Kind**: inner constant of [<code>HungryGames</code>](#HungryGames)  
**Default**: <code>0.15</code>  
**Access**: private  
<a name="HungryGames..defaultColor"></a>

### HungryGames~defaultColor : <code>Discord~ColorResolveable</code> ℗
Default color to choose for embedded messages.

**Kind**: inner constant of [<code>HungryGames</code>](#HungryGames)  
**Default**: <code>[200,125,0]</code>  
**Access**: private  
<a name="HungryGames..emoji"></a>

### HungryGames~emoji : <code>Object.&lt;string&gt;</code> ℗
Helper object of emoji characters mapped to names.

**Kind**: inner constant of [<code>HungryGames</code>](#HungryGames)  
**Default**: <code>{&quot;x&quot;:&quot;❌&quot;,&quot;white_check_mark&quot;:&quot;✅&quot;,&quot;undefined&quot;:&quot;🔟&quot;,&quot;arrow_up&quot;:&quot;⬆&quot;,&quot;arrow_down&quot;:&quot;⬇&quot;,&quot;arrow_double_up&quot;:&quot;⏫&quot;,&quot;arrow_double_down&quot;:&quot;⏬&quot;,&quot;arrow_left&quot;:&quot;⬅&quot;,&quot;arrow_right&quot;:&quot;➡&quot;,&quot;arrow_double_left&quot;:&quot;⏪&quot;,&quot;arrow_double_right&quot;:&quot;⏩&quot;,&quot;arrows_counterclockwise&quot;:&quot;🔄&quot;,&quot;crossed_swords&quot;:&quot;⚔&quot;,&quot;shield&quot;:&quot;🛡&quot;,&quot;heart&quot;:&quot;❤&quot;,&quot;yellow_heart&quot;:&quot;💛&quot;,&quot;broken_heart&quot;:&quot;💔&quot;,&quot;skull&quot;:&quot;💀&quot;,&quot;negative_squared_cross_mark&quot;:&quot;❎&quot;,&quot;ballot_box_with_check&quot;:&quot;☑&quot;,&quot;skull_crossbones&quot;:&quot;☠&quot;,&quot;slight_smile&quot;:&quot;🙂&quot;,&quot;question&quot;:&quot;⚔&quot;,&quot;red_circle&quot;:&quot;🔴&quot;,&quot;trophy&quot;:&quot;🏆&quot;}</code>  
**Access**: private  
<a name="HungryGames..alph"></a>

### HungryGames~alph : <code>string</code> ℗
The alphabet twice, first lowercase, then uppercase.

**Kind**: inner constant of [<code>HungryGames</code>](#HungryGames)  
**Default**: <code>&quot;abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ&quot;</code>  
**Access**: private  
<a name="HungryGames..multiEventUserDistribution"></a>

### HungryGames~multiEventUserDistribution : <code>Object</code> ℗
Probability of each amount of people being chosen for an event. Must total
to 1.0

**Kind**: inner constant of [<code>HungryGames</code>](#HungryGames)  
**Default**: <code>{&quot;undefined&quot;:0.0005}</code>  
**Access**: private  
<a name="HungryGames..deathRateWeights"></a>

### HungryGames~deathRateWeights : [<code>Object.&lt;EventWeights&gt;</code>](#HungryGames..EventWeights) ℗
Weighting values for modifying choosing of events.

**Kind**: inner constant of [<code>HungryGames</code>](#HungryGames)  
**Default**: <code>{&quot;verylow&quot;:&quot;&quot;,&quot;low&quot;:&quot;&quot;,&quot;normal&quot;:&quot;&quot;,&quot;high&quot;:&quot;&quot;,&quot;veryhigh&quot;:&quot;&quot;}</code>  
**Access**: private  
<a name="HungryGames..helpmessagereply"></a>

### HungryGames~helpmessagereply : <code>string</code> ℗
Reply to help on a server.

**Kind**: inner constant of [<code>HungryGames</code>](#HungryGames)  
**Default**: <code>&quot;I sent you a DM with commands!&quot;</code>  
**Access**: private  
<a name="HungryGames..blockedmessage"></a>

### HungryGames~blockedmessage : <code>string</code> ℗
Reply if unable to send message via DM.

**Kind**: inner constant of [<code>HungryGames</code>](#HungryGames)  
**Default**: <code>&quot;I couldn&#x27;t send you a message, you probably blocked me :(&quot;</code>  
**Access**: private  
<a name="HungryGames..helpObject"></a>

### HungryGames~helpObject ℗
The object that stores all data to be formatted into the help message.

**Kind**: inner constant of [<code>HungryGames</code>](#HungryGames)  
**Access**: private  
<a name="HungryGames..webURL"></a>

### HungryGames~webURL : <code>string</code> ℗
The website base URL for pointing to for more help and documentation.

**Kind**: inner constant of [<code>HungryGames</code>](#HungryGames)  
**Access**: private  
<a name="HungryGames..updateEvents"></a>

### HungryGames~updateEvents() ℗
Parse all default events from file.

**Kind**: inner method of [<code>HungryGames</code>](#HungryGames)  
**Access**: private  
<a name="HungryGames..updateMessages"></a>

### HungryGames~updateMessages() ℗
Parse all messages from file.

**Kind**: inner method of [<code>HungryGames</code>](#HungryGames)  
**Access**: private  
<a name="HungryGames..updateBattles"></a>

### HungryGames~updateBattles() ℗
Parse all battles from file.

**Kind**: inner method of [<code>HungryGames</code>](#HungryGames)  
**Access**: private  
<a name="HungryGames..setupHelp"></a>

### HungryGames~setupHelp() ℗
Set all help messages once we know what prefix to use.

**Kind**: inner method of [<code>HungryGames</code>](#HungryGames)  
**Access**: private  
<a name="HungryGames..handleMessageEdit"></a>

### HungryGames~handleMessageEdit(oldMsg, newMsg) ℗
Hanlder for when the create event message is edited and we should update
our message with the updated event.

**Kind**: inner method of [<code>HungryGames</code>](#HungryGames)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| oldMsg | <code>Discord~Message</code> | The message before being edited. |
| newMsg | <code>Discord~Message</code> | The message after being edited. |

<a name="HungryGames..handleCommand"></a>

### HungryGames~handleCommand(msg) : [<code>commandHandler</code>](#commandHandler) ℗
Handle a command from a user and pass into relevant functions.

**Kind**: inner method of [<code>HungryGames</code>](#HungryGames)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord~Message</code> | Message that triggered command. |

<a name="HungryGames..mention"></a>

### HungryGames~mention(msg) ⇒ <code>string</code> ℗
Creates formatted string for mentioning the author of msg.

**Kind**: inner method of [<code>HungryGames</code>](#HungryGames)  
**Returns**: <code>string</code> - Formatted mention string.  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord~Message</code> | Message to format a mention for the author of. |

<a name="HungryGames..reply"></a>

### HungryGames~reply(msg, text, post) ⇒ <code>Promise.&lt;Discord~Message&gt;</code> ℗
Replies to the author and channel of msg with the given message.

**Kind**: inner method of [<code>HungryGames</code>](#HungryGames)  
**Returns**: <code>Promise.&lt;Discord~Message&gt;</code> - Promise of Discord~Message that we
attempted to send.  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord~Message</code> | Message to reply to. |
| text | <code>string</code> | The main body of the message. |
| post | <code>string</code> | The footer of the message. |

<a name="HungryGames..checkForRole"></a>

### HungryGames~checkForRole(msg) ⇒ <code>boolean</code> ℗
Check if author of msg has the required role to run commands.

**Kind**: inner method of [<code>HungryGames</code>](#HungryGames)  
**Returns**: <code>boolean</code> - If the message author has the necessary role.  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord~Message</code> | Message of the author to check for the role. |

<a name="HungryGames..checkPerms"></a>

### HungryGames~checkPerms(msg, cb) ℗
Check if author of msg has permissions, then trigger callback with guild
id.

**Kind**: inner method of [<code>HungryGames</code>](#HungryGames)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord~Message</code> | Message of the user to ensure has proper permissions. |
| cb | [<code>hgCommandHandler</code>](#HungryGames..hgCommandHandler) | Callback to call if user has proper permissions to run command. |

<a name="HungryGames..makePlayer"></a>

### HungryGames~makePlayer(user) ⇒ [<code>Player</code>](#HungryGames..Player) ℗
Create a Player from a given Disord.User.

**Kind**: inner method of [<code>HungryGames</code>](#HungryGames)  
**Returns**: [<code>Player</code>](#HungryGames..Player) - Player object created from User.  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| user | <code>Discord~User</code> | User to make a Player from. |

<a name="HungryGames..sendAtTime"></a>

### HungryGames~sendAtTime(channel, one, two, time) ℗
Delay a message to send at the given time in milliseconds since epoch.

**Kind**: inner method of [<code>HungryGames</code>](#HungryGames)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| channel | <code>Discord~TextChannel</code> | The channel to send the message in. |
| one | <code>Discord~StringResolvable</code> \| <code>Discord~MessageOptions</code> \| <code>Discord~MessageEmbed</code> \| <code>Discord~MessageAttachment</code> \| <code>Array.&lt;Discord~MessageAttachment&gt;</code> | The message to send. |
| two | <code>Discord~StringResolvable</code> \| <code>Discord~MessageOptions</code> \| <code>Discord~MessageEmbed</code> \| <code>Discord~MessageAttachment</code> \| <code>Array.&lt;Discord~MessageAttachment&gt;</code> | The message to send. |
| time | <code>number</code> | The time to send the message in milliseconds since epoch. |

<a name="HungryGames..createGame"></a>

### HungryGames~createGame(msg, id, [silent]) : [<code>hgCommandHandler</code>](#HungryGames..hgCommandHandler) ℗
Create a Hungry Games for a guild.

**Kind**: inner method of [<code>HungryGames</code>](#HungryGames)  
**Access**: private  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| msg | <code>Discord~Message</code> |  | The message that lead to this being called. |
| id | <code>string</code> |  | The id of the guild this was triggered from. |
| [silent] | <code>boolean</code> | <code>false</code> | Should we suppress replies to message. |

<a name="HungryGames..getAllPlayers"></a>

### HungryGames~getAllPlayers(members, excluded, bots) ⇒ [<code>Array.&lt;Player&gt;</code>](#HungryGames..Player) ℗
Form an array of Player objects based on guild members, excluded members,
and whether to include bots.

**Kind**: inner method of [<code>HungryGames</code>](#HungryGames)  
**Returns**: [<code>Array.&lt;Player&gt;</code>](#HungryGames..Player) - Array of players to include in the games.  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| members | <code>Discord~Collection.&lt;Discord~GuildMember&gt;</code> | All members in guild. |
| excluded | <code>Array.&lt;string&gt;</code> | Array of ids of users that should not be included in the games. |
| bots | <code>boolean</code> | Should bots be included in the games. |

<a name="HungryGames..formTeams"></a>

### HungryGames~formTeams(id) ℗
Add users to teams, and remove excluded users from teams. Deletes empty
teams, and adds teams once all teams have teamSize of players.

**Kind**: inner method of [<code>HungryGames</code>](#HungryGames)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>string</code> | Id of guild where this was triggered from. |

<a name="HungryGames..resetGame"></a>

### HungryGames~resetGame(msg, id) : [<code>hgCommandHandler</code>](#HungryGames..hgCommandHandler) ℗
Reset data that the user specifies.

**Kind**: inner method of [<code>HungryGames</code>](#HungryGames)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord~Message</code> | The message that lead to this being called. |
| id | <code>string</code> | The id of the guild this was triggered from. |

<a name="HungryGames..showGameInfo"></a>

### HungryGames~showGameInfo(msg, id) : [<code>hgCommandHandler</code>](#HungryGames..hgCommandHandler) ℗
Send all of the game data about the current server to the chat.

**Kind**: inner method of [<code>HungryGames</code>](#HungryGames)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord~Message</code> | The message that lead to this being called. |
| id | <code>string</code> | The id of the guild this was triggered from. |

<a name="HungryGames..showGameEvents"></a>

### HungryGames~showGameEvents(msg, id) : [<code>hgCommandHandler</code>](#HungryGames..hgCommandHandler) ℗
Send all event data about the default events to the chat.

**Kind**: inner method of [<code>HungryGames</code>](#HungryGames)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord~Message</code> | The message that lead to this being called. |
| id | <code>string</code> | The id of the guild this was triggered from. |

<a name="HungryGames..startGame"></a>

### HungryGames~startGame(msg, id) : [<code>hgCommandHandler</code>](#HungryGames..hgCommandHandler) ℗
Start the games in the channel this was called from.

**Kind**: inner method of [<code>HungryGames</code>](#HungryGames)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord~Message</code> | The message that lead to this being called. |
| id | <code>string</code> | The id of the guild this was triggered from. |

<a name="HungryGames..pauseAutoplay"></a>

### HungryGames~pauseAutoplay(msg, id) : [<code>hgCommandHandler</code>](#HungryGames..hgCommandHandler) ℗
Stop autoplaying.

**Kind**: inner method of [<code>HungryGames</code>](#HungryGames)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord~Message</code> | The message that lead to this being called. |
| id | <code>string</code> | The id of the guild this was triggered from. |

<a name="HungryGames..startAutoplay"></a>

### HungryGames~startAutoplay(msg, id) : [<code>hgCommandHandler</code>](#HungryGames..hgCommandHandler) ℗
Start autoplaying.

**Kind**: inner method of [<code>HungryGames</code>](#HungryGames)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord~Message</code> | The message that lead to this being called. |
| id | <code>string</code> | The id of the guild this was triggered from. |

<a name="HungryGames..nextDay"></a>

### HungryGames~nextDay(msg, id) : [<code>hgCommandHandler</code>](#HungryGames..hgCommandHandler) ℗
Simulate a single day then show events to users.

**Kind**: inner method of [<code>HungryGames</code>](#HungryGames)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord~Message</code> | The message that lead to this being called. |
| id | <code>string</code> | The id of the guild this was triggered from. |

<a name="HungryGames..pickEvent"></a>

### HungryGames~pickEvent(userPool, eventPool, options, numAlive, teams, deathRate) ⇒ [<code>Event</code>](#HungryGames..Event) ℗
Pick event that satisfies all requirements and settings.

**Kind**: inner method of [<code>HungryGames</code>](#HungryGames)  
**Returns**: [<code>Event</code>](#HungryGames..Event) - The chosen event that satisfies all
requirements, or null if something went wrong.  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| userPool | [<code>Array.&lt;Player&gt;</code>](#HungryGames..Player) | Pool of players left to chose from in this day. |
| eventPool | [<code>Array.&lt;Event&gt;</code>](#HungryGames..Event) | Pool of all events available to choose at this time. |
| options | <code>Object</code> | The options set in the current game. |
| numAlive | <code>number</code> | Number of players in the game still alive. |
| teams | [<code>Array.&lt;Team&gt;</code>](#HungryGames..Team) | Array of teams in this game. |
| deathRate | [<code>EventWeights</code>](#HungryGames..EventWeights) | Death rate weights. |

<a name="HungryGames..validateEventTeamConstraint"></a>

### HungryGames~validateEventTeamConstraint(numVictim, numAttacker, userPool, teams, options, victimsDie, attackersDie) ⇒ <code>boolean</code> ℗
Ensure teammates don't attack eachother.

**Kind**: inner method of [<code>HungryGames</code>](#HungryGames)  
**Returns**: <code>boolean</code> - Is is possible to use this event with current settings
about teammates.  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| numVictim | <code>number</code> | The number of victims in the event. |
| numAttacker | <code>number</code> | The number of attackers in the event. |
| userPool | [<code>Array.&lt;Player&gt;</code>](#HungryGames..Player) | Pool of all remaining players to put into an event. |
| teams | [<code>Array.&lt;Team&gt;</code>](#HungryGames..Team) | All teams in this game. |
| options | <code>Object</code> | Options for this game. |
| victimsDie | <code>boolean</code> | Do the victims die in this event? |
| attackersDie | <code>boolean</code> | Do the attackers die in this event? |

<a name="HungryGames..validateEventVictorConstraint"></a>

### HungryGames~validateEventVictorConstraint(numVictim, numAttacker, numAlive, options, victimsDie, attackersDie) ⇒ <code>boolean</code> ℗
Ensure the event we choose will not force all players to be dead.

**Kind**: inner method of [<code>HungryGames</code>](#HungryGames)  
**Returns**: <code>boolean</code> - Will this event follow current options set about number
of victors required.  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| numVictim | <code>number</code> | Number of victims in this event. |
| numAttacker | <code>number</code> | Number of attackers in this event. |
| numAlive | <code>number</code> | Total number of living players left in the game. |
| options | <code>Object</code> | The options set for this game. |
| victimsDie | <code>boolean</code> | Do the victims die in this event? |
| attackersDie | <code>boolean</code> | Do the attackers die in this event? |

<a name="HungryGames..validateEventNumConstraint"></a>

### HungryGames~validateEventNumConstraint(numVictim, numAttacker, userPool, numAlive) ⇒ <code>boolean</code> ℗
Ensure the number of users in an event is mathematically possible.

**Kind**: inner method of [<code>HungryGames</code>](#HungryGames)  
**Returns**: <code>boolean</code> - If the event requires a number of players that is valid
from the number of plaers left to choose from.  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| numVictim | <code>number</code> | Number of victims in this event. |
| numAttacker | <code>number</code> | Number of attackers in this event. |
| userPool | [<code>Array.&lt;Player&gt;</code>](#HungryGames..Player) | Pool of all remaining players to put into an event. |
| numAlive | <code>number</code> | Total number of living players left in the game. |

<a name="HungryGames..validateEventRequirements"></a>

### HungryGames~validateEventRequirements(numVictim, numAttacker, userPool, numAlive, teams, options, victimsDie, attackersDie) ⇒ <code>boolean</code> ℗
Ensure the event chosen meets all requirements for actually being used in
the current game.

**Kind**: inner method of [<code>HungryGames</code>](#HungryGames)  
**Returns**: <code>boolean</code> - If all constraints are met with the given event.  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| numVictim | <code>number</code> | Number of victims in this event. |
| numAttacker | <code>number</code> | Number of attackers in this event. |
| userPool | [<code>Array.&lt;Player&gt;</code>](#HungryGames..Player) | Pool of all remaining players to put into an event. |
| numAlive | <code>number</code> | Total number of living players left in the game. |
| teams | [<code>Array.&lt;Team&gt;</code>](#HungryGames..Team) | All teams in this game. |
| options | <code>Object</code> | The options set for this game. |
| victimsDie | <code>boolean</code> | Do the victims die in this event? |
| attackersDie | <code>boolean</code> | Do the attackers die in this event? |

<a name="HungryGames..pickAffectedPlayers"></a>

### HungryGames~pickAffectedPlayers(numVictim, numAttacker, options, userPool, teams) ⇒ [<code>Array.&lt;Player&gt;</code>](#HungryGames..Player) ℗
Pick the players to put into an event.

**Kind**: inner method of [<code>HungryGames</code>](#HungryGames)  
**Returns**: [<code>Array.&lt;Player&gt;</code>](#HungryGames..Player) - Array of all players that will be affected
by this event.  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| numVictim | <code>number</code> | Number of victims in this event. |
| numAttacker | <code>number</code> | Number of attackers in this event. |
| options | <code>Object</code> | Options for this game. |
| userPool | [<code>Array.&lt;Player&gt;</code>](#HungryGames..Player) | Pool of all remaining players to put into an event. |
| teams | [<code>Array.&lt;Team&gt;</code>](#HungryGames..Team) | All teams in this game. |

<a name="HungryGames..makeBattleEvent"></a>

### HungryGames~makeBattleEvent(affectedUsers, numVictim, numAttacker, mention, id) ⇒ [<code>Event</code>](#HungryGames..Event) ℗
Make an event that contains a battle between players before the main event
message.

**Kind**: inner method of [<code>HungryGames</code>](#HungryGames)  
**Returns**: [<code>Event</code>](#HungryGames..Event) - The event that was created.  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| affectedUsers | [<code>Array.&lt;Player&gt;</code>](#HungryGames..Player) | All of the players involved in the event. |
| numVictim | <code>number</code> | The number of victims in this event. |
| numAttacker | <code>number</code> | The number of attackers in this event. |
| mention | <code>boolean</code> | Should every player be mentioned when their name comes up? |
| id | <code>string</code> | The id of the guild that triggered this initially. |

<a name="HungryGames..weightedUserRand"></a>

### HungryGames~weightedUserRand() ⇒ <code>number</code> ℗
Produce a random number that is weighted by multiEventUserDistribution.

**Kind**: inner method of [<code>HungryGames</code>](#HungryGames)  
**Returns**: <code>number</code> - The weighted number outcome.  
**Access**: private  
<a name="HungryGames..weightedEvent"></a>

### HungryGames~weightedEvent(eventPool, weightOpt) ⇒ <code>number</code> ℗
Produce a random event that using weighted probabilities.

**Kind**: inner method of [<code>HungryGames</code>](#HungryGames)  
**Returns**: <code>number</code> - The index of the event that was chosen.  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| eventPool | [<code>Array.&lt;Event&gt;</code>](#HungryGames..Event) | The pool of all events to consider. |
| weightOpt | [<code>EventWeights</code>](#HungryGames..EventWeights) | The weighting options. |

<a name="HungryGames..isEventDeadly"></a>

### HungryGames~isEventDeadly(eventTry) ⇒ <code>boolean</code> ℗
Decide if the given event should be considered deadly.

**Kind**: inner method of [<code>HungryGames</code>](#HungryGames)  
**Returns**: <code>boolean</code> - If the event is considered deadly.  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| eventTry | [<code>Event</code>](#HungryGames..Event) | The event to check. |

<a name="HungryGames..formatMultiNames"></a>

### HungryGames~formatMultiNames(names, mention) ⇒ <code>string</code> ℗
Format an array of users into names based on options and grammar rules.

**Kind**: inner method of [<code>HungryGames</code>](#HungryGames)  
**Returns**: <code>string</code> - The formatted string of names.  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| names | [<code>Array.&lt;Player&gt;</code>](#HungryGames..Player) | An array of players to format the names of. |
| mention | <code>boolean</code> | Should the players be mentioned or just show their name normally. |

<a name="HungryGames..makeMessageEvent"></a>

### HungryGames~makeMessageEvent(message, id) ⇒ [<code>Event</code>](#HungryGames..Event) ℗
Make an event that doesn't affect any players and is just a plain message.

**Kind**: inner method of [<code>HungryGames</code>](#HungryGames)  
**Returns**: [<code>Event</code>](#HungryGames..Event) - The event that was created.  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| message | <code>string</code> | The message to show. |
| id | <code>string</code> | The id of the guild that initially triggered this. |

<a name="HungryGames..makeSingleEvent"></a>

### HungryGames~makeSingleEvent(message, affectedUsers, numVictim, numAttacker, mention, id, victimOutcome, attackerOutcome) ⇒ <code>HungryGames~FinalEvent</code> ℗
Format an event string based on specified users.

**Kind**: inner method of [<code>HungryGames</code>](#HungryGames)  
**Returns**: <code>HungryGames~FinalEvent</code> - The final event that was created and
formatted ready for display.  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| message | <code>string</code> | The message to show. |
| affectedUsers | [<code>Array.&lt;Player&gt;</code>](#HungryGames..Player) | An array of all users affected by this event. |
| numVictim | <code>number</code> | Number of victims in this event. |
| numAttacker | <code>number</code> | Number of attackers in this event. |
| mention | <code>boolean</code> | Should all users be mentioned when their name appears? |
| id | <code>string</code> | The id of the guild this was initially triggered from. |
| victimOutcome | <code>string</code> | The outcome of the victims from this event. |
| attackerOutcome | <code>string</code> | The outcome of the attackers from this event. |

<a name="HungryGames..getMiniIcons"></a>

### HungryGames~getMiniIcons(users) ⇒ [<code>Array.&lt;UserIconUrl&gt;</code>](#HungryGames..UserIconUrl) ℗
Get an array of icons urls from an array of users.

**Kind**: inner method of [<code>HungryGames</code>](#HungryGames)  
**Returns**: [<code>Array.&lt;UserIconUrl&gt;</code>](#HungryGames..UserIconUrl) - The user ids and urls for all users
avatars.  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| users | [<code>Array.&lt;Player&gt;</code>](#HungryGames..Player) | Array of users to process. |

<a name="HungryGames..printEvent"></a>

### HungryGames~printEvent(msg, id) ℗
Print an event string to the channel and add images, or if no events
remain, trigger end of day.

**Kind**: inner method of [<code>HungryGames</code>](#HungryGames)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord~Message</code> | The message that lead to this being called. |
| id | <code>string</code> | The id of the guild this was triggered from. |

<a name="HungryGames..printDay"></a>

### HungryGames~printDay(msg, id) ℗
Trigger the end of a day and print summary/outcome at the end of the day.

**Kind**: inner method of [<code>HungryGames</code>](#HungryGames)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord~Message</code> | The message that lead to this being called. |
| id | <code>string</code> | The id of the guild this was triggered from. |

<a name="HungryGames..endGame"></a>

### HungryGames~endGame(msg, id) : [<code>hgCommandHandler</code>](#HungryGames..hgCommandHandler) ℗
End a game early.

**Kind**: inner method of [<code>HungryGames</code>](#HungryGames)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord~Message</code> | The message that lead to this being called. |
| id | <code>string</code> | The id of the guild this was triggered from. |

<a name="HungryGames..excludeUser"></a>

### HungryGames~excludeUser(msg, id) : [<code>hgCommandHandler</code>](#HungryGames..hgCommandHandler) ℗
Remove a user from users to be in next game.

**Kind**: inner method of [<code>HungryGames</code>](#HungryGames)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord~Message</code> | The message that lead to this being called. |
| id | <code>string</code> | The id of the guild this was triggered from. |

<a name="HungryGames..includeUser"></a>

### HungryGames~includeUser(msg, id) : [<code>hgCommandHandler</code>](#HungryGames..hgCommandHandler) ℗
Add a user back into the next game.

**Kind**: inner method of [<code>HungryGames</code>](#HungryGames)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord~Message</code> | The message that lead to this being called. |
| id | <code>string</code> | The id of the guild this was triggered from. |

<a name="HungryGames..listPlayers"></a>

### HungryGames~listPlayers(msg, id) : [<code>hgCommandHandler</code>](#HungryGames..hgCommandHandler) ℗
Show a formatted message of all users and teams in current server.

**Kind**: inner method of [<code>HungryGames</code>](#HungryGames)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord~Message</code> | The message that lead to this being called. |
| id | <code>string</code> | The id of the guild this was triggered from. |

<a name="HungryGames..getName"></a>

### HungryGames~getName(msg, user) ⇒ <code>string</code> ℗
Get the username of a user id if available, or their id if they couldn't be
found.

**Kind**: inner method of [<code>HungryGames</code>](#HungryGames)  
**Returns**: <code>string</code> - The user's name or id if name was unable to be found.  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord~Message</code> | The message that lead to this being called. |
| user | <code>string</code> | The id of the user to find the name of. |

<a name="HungryGames..toggleOpt"></a>

### HungryGames~toggleOpt(msg, id) : [<code>hgCommandHandler</code>](#HungryGames..hgCommandHandler) ℗
Change an option to a value that the user specifies.

**Kind**: inner method of [<code>HungryGames</code>](#HungryGames)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord~Message</code> | The message that lead to this being called. |
| id | <code>string</code> | The id of the guild this was triggered from. |

<a name="HungryGames..showOpts"></a>

### HungryGames~showOpts(msg, options) ℗
Format the options for the games and show them to the user.

**Kind**: inner method of [<code>HungryGames</code>](#HungryGames)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord~Message</code> | The message that lead to this being called. |
| options | <code>Object</code> | The options to format. |

<a name="HungryGames..optChangeListener"></a>

### HungryGames~optChangeListener(msg_, options, index) ℗
The callback for when the user chooses to change page of the options.

**Kind**: inner method of [<code>HungryGames</code>](#HungryGames)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| msg_ | <code>Discord~Message</code> | The message we sent showing the options. |
| options | <code>Object</code> | The options to show in the message. |
| index | <code>number</code> | The page index to show. |

<a name="HungryGames..editTeam"></a>

### HungryGames~editTeam(msg, id) : [<code>hgCommandHandler</code>](#HungryGames..hgCommandHandler) ℗
Entry for all team commands.

**Kind**: inner method of [<code>HungryGames</code>](#HungryGames)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord~Message</code> | The message that lead to this being called. |
| id | <code>string</code> | The id of the guild this was triggered from. |

<a name="HungryGames..swapTeamUsers"></a>

### HungryGames~swapTeamUsers(msg, id) ℗
Swap two users from one team to the other.

**Kind**: inner method of [<code>HungryGames</code>](#HungryGames)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord~Message</code> | The message that lead to this being called. |
| id | <code>string</code> | The id of the guild this was triggered from. |

<a name="HungryGames..moveTeamUser"></a>

### HungryGames~moveTeamUser(msg, id) ℗
Move a single user to another team.

**Kind**: inner method of [<code>HungryGames</code>](#HungryGames)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord~Message</code> | The message that lead to this being called. |
| id | <code>string</code> | The id of the guild this was triggered from. |

<a name="HungryGames..renameTeam"></a>

### HungryGames~renameTeam(msg, id) ℗
Rename a team.

**Kind**: inner method of [<code>HungryGames</code>](#HungryGames)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord~Message</code> | The message that lead to this being called. |
| id | <code>string</code> | The id of the guild this was triggered from. |

<a name="HungryGames..randomizeTeams"></a>

### HungryGames~randomizeTeams(msg, id) ℗
Swap random users between teams.

**Kind**: inner method of [<code>HungryGames</code>](#HungryGames)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord~Message</code> | The message that lead to this being called. |
| id | <code>string</code> | The id of the guild this was triggered from. |

<a name="HungryGames..createEvent"></a>

### HungryGames~createEvent(msg, id) : [<code>hgCommandHandler</code>](#HungryGames..hgCommandHandler) ℗
Create a custom event for a guild.

**Kind**: inner method of [<code>HungryGames</code>](#HungryGames)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord~Message</code> | The message that lead to this being called. |
| id | <code>string</code> | The id of the guild this was triggered from. |

<a name="HungryGames..createEventNums"></a>

### HungryGames~createEventNums(msg, id, show, cb) ℗
Let the user choose how many of something will be in this event being
created.

**Kind**: inner method of [<code>HungryGames</code>](#HungryGames)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord~Message</code> | The message that lead to this being called. |
| id | <code>string</code> | The id of the guild this was triggered from. |
| show | <code>string</code> | The message to show explainig the number. |
| cb | [<code>createEventNumCallback</code>](#HungryGames..createEventNumCallback) | The callback after the user has chosen a number. |

<a name="HungryGames..createEventOutcome"></a>

### HungryGames~createEventOutcome(msg, id, show, cb) ℗
Let the user choose what the outcome of an event will be.

**Kind**: inner method of [<code>HungryGames</code>](#HungryGames)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord~Message</code> | The message that lead to this being called. |
| id | <code>string</code> | The id of the guild this was triggered from. |
| show | <code>string</code> | The message to show explainig the options. |
| cb | [<code>createEventOutcomeCallback</code>](#HungryGames..createEventOutcomeCallback) | The callback after the user has chosen an outcome. |

<a name="HungryGames..createEventAttacker"></a>

### HungryGames~createEventAttacker(msg, id, show, cb) ℗
Let the user choose whether the event attackers and victims kill anyone.

**Kind**: inner method of [<code>HungryGames</code>](#HungryGames)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord~Message</code> | The message that lead to this being called. |
| id | <code>string</code> | The id of the guild this was triggered from. |
| show | <code>string</code> | The message to show explainig the options. |
| cb | [<code>createEventBooleanCallback</code>](#HungryGames..createEventBooleanCallback) | The callback after the user has chosen an outcome. |

<a name="HungryGames..updateEventPreview"></a>

### HungryGames~updateEventPreview(msg) ℗
When a user is creating a custom event and edits their message, we need to
edit the preview.

**Kind**: inner method of [<code>HungryGames</code>](#HungryGames)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord~Message</code> | Our message previewing the new event. |

<a name="HungryGames..removeEvent"></a>

### HungryGames~removeEvent(msg, id) : [<code>hgCommandHandler</code>](#HungryGames..hgCommandHandler) ℗
Delete a custom event from a guild.

**Kind**: inner method of [<code>HungryGames</code>](#HungryGames)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord~Message</code> | The message that lead to this being called. |
| id | <code>string</code> | The id of the guild this was triggered from. |

<a name="HungryGames..fetchStats"></a>

### HungryGames~fetchStats(events) ℗
Put information about an array of events into the array.

**Kind**: inner method of [<code>HungryGames</code>](#HungryGames)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| events | [<code>Array.&lt;Event&gt;</code>](#HungryGames..Event) | Array of events to process and modify. |

<a name="HungryGames..listEvents"></a>

### HungryGames~listEvents(msg, id, [page], [eventType], [editMsg]) : [<code>hgCommandHandler</code>](#HungryGames..hgCommandHandler) ℗
Allow user to view all events available on their server and summary of each
type of event.

**Kind**: inner method of [<code>HungryGames</code>](#HungryGames)  
**Access**: private  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| msg | <code>Discord~Message</code> |  | The message that lead to this being called. |
| id | <code>string</code> |  | The id of the guild this was triggered from. |
| [page] | <code>number</code> | <code>0</code> | The page number to show. |
| [eventType] | <code>string</code> | <code>&quot;&#x27;player&#x27;&quot;</code> | The type of event to show. |
| [editMsg] | <code>Discord~Message</code> |  | The message to edit instead of sending a new message. |

<a name="HungryGames..formatEventString"></a>

### HungryGames~formatEventString(arenaEvent, [newline]) ⇒ <code>string</code> ℗
Format an event to show its settings to the user.

**Kind**: inner method of [<code>HungryGames</code>](#HungryGames)  
**Returns**: <code>string</code> - The formatted message with emojis.  
**Access**: private  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| arenaEvent | [<code>Event</code>](#HungryGames..Event) |  | The event to format. |
| [newline] | <code>boolean</code> | <code>false</code> | If a new line should be inserted for better formatting. |

<a name="HungryGames..getOutcomeEmoji"></a>

### HungryGames~getOutcomeEmoji(outcome) ⇒ <code>string</code> ℗
Get the emoji for a specific outcome of an event.

**Kind**: inner method of [<code>HungryGames</code>](#HungryGames)  
**Returns**: <code>string</code> - The emoji.  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| outcome | <code>string</code> | The outcome to get the emoji of. |

<a name="HungryGames..help"></a>

### HungryGames~help(msg, id) : [<code>hgCommandHandler</code>](#HungryGames..hgCommandHandler) ℗
Send help message to DM and reply to server.

**Kind**: inner method of [<code>HungryGames</code>](#HungryGames)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord~Message</code> | The message that lead to this being called. |
| id | <code>string</code> | The id of the guild this was triggered from. |

<a name="HungryGames..nothing"></a>

### HungryGames~nothing() ⇒ <code>string</code> ℗
Get a random word that means "nothing".

**Kind**: inner method of [<code>HungryGames</code>](#HungryGames)  
**Returns**: <code>string</code> - A word meaning "nothing".  
**Access**: private  
<a name="HungryGames..getMessage"></a>

### HungryGames~getMessage(type) ⇒ <code>string</code> ℗
Get a random message of a given type from hgMessages.json.

**Kind**: inner method of [<code>HungryGames</code>](#HungryGames)  
**Returns**: <code>string</code> - A random message of the given type.  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| type | <code>string</code> | The message type to get. |

<a name="HungryGames..exit"></a>

### HungryGames~exit([code]) ℗
Catch process exiting so we can save if necessary, and remove other
handlers to allow for another module to take our place.

**Kind**: inner method of [<code>HungryGames</code>](#HungryGames)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| [code] | <code>number</code> | The exit code. |

<a name="HungryGames..sigint"></a>

### HungryGames~sigint() ℗
Same as exit(), but triggered via SIGINT, SIGHUP or SIGTERM.

**Kind**: inner method of [<code>HungryGames</code>](#HungryGames)  
**Access**: private  
<a name="HungryGames..unhandledRejection"></a>

### HungryGames~unhandledRejection(reason, p) ℗
Handler for an unhandledRejection.

**Kind**: inner method of [<code>HungryGames</code>](#HungryGames)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| reason | <code>Object</code> | Reason for rejection. |
| p | <code>Promise</code> | The promise that caused the rejection. |

<a name="HungryGames..EventWeights"></a>

### HungryGames~EventWeights : <code>Object</code>
Weighting value for choosing events. A ratio of 1:1 would not modify
probabilities. A ratio of 2:1 would make all events that kill twice as
likely to be chosen.

**Kind**: inner typedef of [<code>HungryGames</code>](#HungryGames)  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| kill | <code>number</code> | Relative weight of events that kill. |
| nothing | <code>number</code> | Relative weight of events that don't kill. |

<a name="HungryGames..GuildGame"></a>

### HungryGames~GuildGame : <code>Object</code>
A singe instance of a game in a guild.

**Kind**: inner typedef of [<code>HungryGames</code>](#HungryGames)  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| options | <code>Object.&lt;(number\|boolean\|string)&gt;</code> | The game options. |
| autoPlay | <code>boolean</code> | Is the game currently autoplaying. |
| excludedUsers | <code>Array.&lt;string&gt;</code> | The ids of the users to exclude from the games. |
| customEvents | <code>Object</code> | All custom events for the guild. |
| currentGame | [<code>Game</code>](#HungryGames..Game) | The current game in the guild. |

<a name="HungryGames..Game"></a>

### HungryGames~Game : <code>Object</code>
The container with current game state within a guild's game.

**Kind**: inner typedef of [<code>HungryGames</code>](#HungryGames)  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | The name of this game. |
| inProgress | <code>boolean</code> | Is the game currently in progress. |
| includedUsers | [<code>Array.&lt;Player&gt;</code>](#HungryGames..Player) | Array of all users currently in the game. |
| teams | [<code>Array.&lt;Team&gt;</code>](#HungryGames..Team) | All teams in the game. |
| ended | <code>boolean</code> | Has the game ended. |
| day | <code>Object</code> | Information about the day that was simulated. |

<a name="HungryGames..hgCommandHandler"></a>

### HungryGames~hgCommandHandler : <code>function</code>
Handler for a Hungry Games command.

**Kind**: inner typedef of [<code>HungryGames</code>](#HungryGames)  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord~Message</code> | The message sent in Discord that triggered this command. |
| id | <code>string</code> | The id of the guild this command was run on for convinience. |

<a name="HungryGames..Battle"></a>

### HungryGames~Battle : <code>Object</code>
A single battle in an Event.

**Kind**: inner typedef of [<code>HungryGames</code>](#HungryGames)  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| message | <code>string</code> | The message of this battle event. |
| attacker | <code>Object</code> | The damage done to the attacker. |
| victim | <code>Object</code> | The damage done to the victim. |

<a name="HungryGames..ArenaEvent"></a>

### HungryGames~ArenaEvent : <code>Object</code>
An Arena event storing Events.

**Kind**: inner typedef of [<code>HungryGames</code>](#HungryGames)  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| message | <code>string</code> | The message at the start of the arena event. |
| outcomes | [<code>Array.&lt;Event&gt;</code>](#HungryGames..Event) | All possible events in this arena event. |

<a name="HungryGames..UserIconUrl"></a>

### HungryGames~UserIconUrl : <code>Object</code>
Container for a user's avatar at icon size, with their id.

**Kind**: inner typedef of [<code>HungryGames</code>](#HungryGames)  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| url | <code>string</code> | Url of icon. |
| id | <code>string</code> | Id of the user the icon belongs to. |

<a name="HungryGames..createEventNumCallback"></a>

### HungryGames~createEventNumCallback : <code>function</code>
The callback after receiving a number from user input.

**Kind**: inner typedef of [<code>HungryGames</code>](#HungryGames)  

| Param | Type | Description |
| --- | --- | --- |
| num | <code>number</code> | The number received from the user. |

<a name="HungryGames..createEventOutcomeCallback"></a>

### HungryGames~createEventOutcomeCallback : <code>function</code>
The callback after receiving an event outcome from a user.

**Kind**: inner typedef of [<code>HungryGames</code>](#HungryGames)  

| Param | Type | Description |
| --- | --- | --- |
| outcome | <code>string</code> | The outcome chosen by the user. |

<a name="HungryGames..createEventBooleanCallback"></a>

### HungryGames~createEventBooleanCallback : <code>function</code>
The callback after receiving a boolean input.

**Kind**: inner typedef of [<code>HungryGames</code>](#HungryGames)  

| Param | Type | Description |
| --- | --- | --- |
| outcome | <code>boolean</code> | The value chosen by the user. |

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
        * *[.postPrefix](#SubModule+postPrefix) : <code>string</code>*
        * [.Discord](#SubModule+Discord) : <code>Discord</code>
        * [.client](#SubModule+client) : <code>Discord~Client</code>
        * [.command](#SubModule+command) : [<code>Command</code>](#SpikeyBot..Command)
        * [.common](#SubModule+common) : [<code>Common</code>](#Common)
        * [.myName](#SubModule+myName) : <code>string</code>
        * [.initialized](#SubModule+initialized) : <code>boolean</code>
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
        * [~onGuildCreate(guild)](#Main..onGuildCreate) ℗
        * [~onGuildBanAdd(guild, user)](#Main..onGuildBanAdd) ℗
        * [~commandAddMe(msg)](#Main..commandAddMe) : [<code>commandHandler</code>](#commandHandler) ℗
        * [~commandAdd(msg)](#Main..commandAdd) : [<code>commandHandler</code>](#commandHandler) ℗
        * [~commandSimplify(msg)](#Main..commandSimplify) : [<code>commandHandler</code>](#commandHandler) ℗
        * [~simplify(formula)](#Main..simplify) ⇒ <code>string</code> ℗
        * [~commandSolve(msg)](#Main..commandSolve) : [<code>commandHandler</code>](#commandHandler) ℗
        * [~commandEvaluate(msg)](#Main..commandEvaluate) : [<code>commandHandler</code>](#commandHandler) ℗
        * [~commandGraph(msg)](#Main..commandGraph) : [<code>commandHandler</code>](#commandHandler) ℗
        * [~commandDerive(msg)](#Main..commandDerive) : [<code>commandHandler</code>](#commandHandler) ℗
        * [~commandJS(msg)](#Main..commandJS) : [<code>commandHandler</code>](#commandHandler) ℗
        * [~commandTimer(msg)](#Main..commandTimer) : [<code>commandHandler</code>](#commandHandler) ℗
        * [~commandSay(msg)](#Main..commandSay) : [<code>commandHandler</code>](#commandHandler) ℗
        * [~commandCreateDate(msg)](#Main..commandCreateDate) : [<code>commandHandler</code>](#commandHandler) ℗
        * [~commandJoinDate(msg)](#Main..commandJoinDate) : [<code>commandHandler</code>](#commandHandler) ℗
        * [~commandPmMe(msg)](#Main..commandPmMe) : [<code>commandHandler</code>](#commandHandler) ℗
        * [~commandPmSpikey(msg)](#Main..commandPmSpikey) : [<code>commandHandler</code>](#commandHandler) ℗
        * [~commandThotPm(msg)](#Main..commandThotPm) : [<code>commandHandler</code>](#commandHandler) ℗
        * [~commandFlip(msg)](#Main..commandFlip) : [<code>commandHandler</code>](#commandHandler) ℗
        * [~commandPurge(msg)](#Main..commandPurge) : [<code>commandHandler</code>](#commandHandler) ℗
        * [~commandBan(msg)](#Main..commandBan) : [<code>commandHandler</code>](#commandHandler) ℗
        * [~commandSmite(msg)](#Main..commandSmite) : [<code>commandHandler</code>](#commandHandler) ℗
        * [~commandAvatar(msg)](#Main..commandAvatar) : [<code>commandHandler</code>](#commandHandler) ℗
        * [~commandPing(msg)](#Main..commandPing) : [<code>commandHandler</code>](#commandHandler) ℗
        * [~commandUptime(msg)](#Main..commandUptime) : [<code>commandHandler</code>](#commandHandler) ℗
        * [~commandGame(msg)](#Main..commandGame) : [<code>commandHandler</code>](#commandHandler) ℗
        * [~commandVersion(msg)](#Main..commandVersion) : [<code>commandHandler</code>](#commandHandler) ℗
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
The prefix this submodule uses. Formed by prepending this.prefix to
this.postPrefix. this.postPrefix must be defined before begin(), otherwise
it is ignored.

**Kind**: instance property of [<code>Main</code>](#Main)  
**Read only**: true  
<a name="SubModule+postPrefix"></a>

### *main.postPrefix : <code>string</code>*
The postfix for the global prefix for this subModule. Must be defined
before begin(), otherwise it is ignored.

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
<a name="SubModule+initialized"></a>

### main.initialized : <code>boolean</code>
Has this subModule been initialized yet (Has begin() been called).

**Kind**: instance property of [<code>Main</code>](#Main)  
**Default**: <code>false</code>  
**Access**: protected  
**Read only**: true  
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
| command | [<code>Command</code>](#SpikeyBot..Command) | The command instance in which to register command listeners. |
| common | [<code>Common</code>](#Common) | Class storing common functions. |

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

<a name="Main..onGuildCreate"></a>

### Main~onGuildCreate(guild) ℗
Handle being added to a guild.

**Kind**: inner method of [<code>Main</code>](#Main)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| guild | <code>Discord.Guild</code> | The guild that we just joined. |

<a name="Main..onGuildBanAdd"></a>

### Main~onGuildBanAdd(guild, user) ℗
Handle user banned on a guild.

**Kind**: inner method of [<code>Main</code>](#Main)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| guild | <code>Discord.Guild</code> | The guild on which the ban happened. |
| user | <code>Discord.User</code> | The user that was banned. |

<a name="Main..commandAddMe"></a>

### Main~commandAddMe(msg) : [<code>commandHandler</code>](#commandHandler) ℗
Replies to message with URL for inviting the bot to a guild.

**Kind**: inner method of [<code>Main</code>](#Main)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord~Message</code> | Message that triggered command. |

<a name="Main..commandAdd"></a>

### Main~commandAdd(msg) : [<code>commandHandler</code>](#commandHandler) ℗
Parses message and adds given numbers.

**Kind**: inner method of [<code>Main</code>](#Main)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord~Message</code> | Message that triggered command. |

<a name="Main..commandSimplify"></a>

### Main~commandSimplify(msg) : [<code>commandHandler</code>](#commandHandler) ℗
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

### Main~commandSolve(msg) : [<code>commandHandler</code>](#commandHandler) ℗
Solve an equation.

**Kind**: inner method of [<code>Main</code>](#Main)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord~Message</code> | Message that triggered command. |

<a name="Main..commandEvaluate"></a>

### Main~commandEvaluate(msg) : [<code>commandHandler</code>](#commandHandler) ℗
Evaluate a string as an equation with units.

**Kind**: inner method of [<code>Main</code>](#Main)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord~Message</code> | Message that triggered command. |

<a name="Main..commandGraph"></a>

### Main~commandGraph(msg) : [<code>commandHandler</code>](#commandHandler) ℗
Graph a given equation by plugging in values for X and creating an image
based off values.

**Kind**: inner method of [<code>Main</code>](#Main)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord~Message</code> | Message that triggered command. |

<a name="Main..commandDerive"></a>

### Main~commandDerive(msg) : [<code>commandHandler</code>](#commandHandler) ℗
Take the derivative of a given equation in terms of dy/dx.

**Kind**: inner method of [<code>Main</code>](#Main)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord~Message</code> | Message that triggered command. |

<a name="Main..commandJS"></a>

### Main~commandJS(msg) : [<code>commandHandler</code>](#commandHandler) ℗
Run javascript code in VM, then show user outcome.

**Kind**: inner method of [<code>Main</code>](#Main)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord~Message</code> | Message that triggered command. |

<a name="Main..commandTimer"></a>

### Main~commandTimer(msg) : [<code>commandHandler</code>](#commandHandler) ℗
Set a timer for a certain about of time. After which, the bot will DM the
user the message they specified.

**Kind**: inner method of [<code>Main</code>](#Main)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord~Message</code> | Message that triggered command. |

<a name="Main..commandSay"></a>

### Main~commandSay(msg) : [<code>commandHandler</code>](#commandHandler) ℗
The user's message will be deleted and the bot will send an identical
message
without the command to make it seem like the bot sent the message.

**Kind**: inner method of [<code>Main</code>](#Main)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord~Message</code> | Message that triggered command. |

<a name="Main..commandCreateDate"></a>

### Main~commandCreateDate(msg) : [<code>commandHandler</code>](#commandHandler) ℗
Tell the user the date when they created their Discord account.

**Kind**: inner method of [<code>Main</code>](#Main)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord~Message</code> | Message that triggered command. |

<a name="Main..commandJoinDate"></a>

### Main~commandJoinDate(msg) : [<code>commandHandler</code>](#commandHandler) ℗
Tell the user the date when they joined the server the message was sent
from.

**Kind**: inner method of [<code>Main</code>](#Main)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord~Message</code> | Message that triggered command. |

<a name="Main..commandPmMe"></a>

### Main~commandPmMe(msg) : [<code>commandHandler</code>](#commandHandler) ℗
Send the user a PM with a greeting introducing who the bot is.

**Kind**: inner method of [<code>Main</code>](#Main)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord~Message</code> | Message that triggered command. |

<a name="Main..commandPmSpikey"></a>

### Main~commandPmSpikey(msg) : [<code>commandHandler</code>](#commandHandler) ℗
Send a PM to SpikeyRobot with a message.

**Kind**: inner method of [<code>Main</code>](#Main)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord~Message</code> | Message that triggered command. |

<a name="Main..commandThotPm"></a>

### Main~commandThotPm(msg) : [<code>commandHandler</code>](#commandHandler) ℗
Send a PM to a mentioned user semi-anonymously. Messages are copied to
SpikeyRobot to monitor for abuse. This command only works for 3 people.

**Kind**: inner method of [<code>Main</code>](#Main)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord~Message</code> | Message that triggered command. |

<a name="Main..commandFlip"></a>

### Main~commandFlip(msg) : [<code>commandHandler</code>](#commandHandler) ℗
Send an image of a coin, either Heads or Tails.

**Kind**: inner method of [<code>Main</code>](#Main)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord~Message</code> | Message that triggered command. |

<a name="Main..commandPurge"></a>

### Main~commandPurge(msg) : [<code>commandHandler</code>](#commandHandler) ℗
Delete a given number of messages from a text channel.

**Kind**: inner method of [<code>Main</code>](#Main)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord~Message</code> | Message that triggered command. |

<a name="Main..commandBan"></a>

### Main~commandBan(msg) : [<code>commandHandler</code>](#commandHandler) ℗
Ban a mentioed user and send a message saying they were banned.

**Kind**: inner method of [<code>Main</code>](#Main)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord~Message</code> | Message that triggered command. |

<a name="Main..commandSmite"></a>

### Main~commandSmite(msg) : [<code>commandHandler</code>](#commandHandler) ℗
Remove all roles from a user and give them a role that prevents them from
doing anything. Checks if all parties involved have permission to do this
without the bot's help.

**Kind**: inner method of [<code>Main</code>](#Main)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord~Message</code> | Message that triggered command. |

<a name="Main..commandAvatar"></a>

### Main~commandAvatar(msg) : [<code>commandHandler</code>](#commandHandler) ℗
Send a larger resolution version of the mentioned user's avatar.

**Kind**: inner method of [<code>Main</code>](#Main)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord~Message</code> | Message that triggered command. |

<a name="Main..commandPing"></a>

### Main~commandPing(msg) : [<code>commandHandler</code>](#commandHandler) ℗
Reply to user with my ping to the Discord servers.

**Kind**: inner method of [<code>Main</code>](#Main)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord~Message</code> | Message that triggered command. |

<a name="Main..commandUptime"></a>

### Main~commandUptime(msg) : [<code>commandHandler</code>](#commandHandler) ℗
Reply to message with the amount of time since the bot has been running.

**Kind**: inner method of [<code>Main</code>](#Main)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord~Message</code> | Message that triggered command. |

<a name="Main..commandGame"></a>

### Main~commandGame(msg) : [<code>commandHandler</code>](#commandHandler) ℗
Reply to message saying what game the mentioned user is playing and
possibly
other information about their profile.

**Kind**: inner method of [<code>Main</code>](#Main)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord~Message</code> | Message that triggered command. |

<a name="Main..commandVersion"></a>

### Main~commandVersion(msg) : [<code>commandHandler</code>](#commandHandler) ℗
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
**Emits**: <code>SpikeyBot~Command#event:stop</code>  

* [Music](#Music) ⇐ [<code>SubModule</code>](#SubModule)
    * _instance_
        * [.helpMessage](#SubModule+helpMessage) : <code>string</code> \| <code>Discord~MessageEmbed</code>
        * [.prefix](#SubModule+prefix) : <code>string</code>
        * [.myPrefix](#SubModule+myPrefix) : <code>string</code>
        * *[.postPrefix](#SubModule+postPrefix) : <code>string</code>*
        * [.Discord](#SubModule+Discord) : <code>Discord</code>
        * [.client](#SubModule+client) : <code>Discord~Client</code>
        * [.command](#SubModule+command) : [<code>Command</code>](#SpikeyBot..Command)
        * [.common](#SubModule+common) : [<code>Common</code>](#Common)
        * *[.myName](#SubModule+myName) : <code>string</code>*
        * [.initialized](#SubModule+initialized) : <code>boolean</code>
        * [.initialize()](#SubModule+initialize)
        * [.begin(prefix, Discord, client, command, common)](#SubModule+begin)
        * [.end()](#SubModule+end)
        * [.shutdown()](#SubModule+shutdown)
        * *[.save()](#SubModule+save)*
    * _static_
        * [.streamToOgg(input, file)](#Music.streamToOgg)
    * _inner_
        * [~broadcasts](#Music..broadcasts) : [<code>Object.&lt;Broadcast&gt;</code>](#Music..Broadcast) ℗
        * [~geniusClient](#Music..geniusClient) : <code>string</code> ℗
        * [~geniusRequest](#Music..geniusRequest) : <code>Object</code> ℗
        * [~special](#Music..special) : <code>Object.&lt;Object.&lt;{cmd: string, url: ?string, file: string}&gt;&gt;</code> ℗
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
        * [~commandPlay(msg)](#Music..commandPlay) : [<code>commandHandler</code>](#commandHandler) ℗
        * [~commandLeave(msg)](#Music..commandLeave) : [<code>commandHandler</code>](#commandHandler) ℗
        * [~commandSkip(msg)](#Music..commandSkip) : [<code>commandHandler</code>](#commandHandler) ℗
        * [~commandQueue(msg)](#Music..commandQueue) : [<code>commandHandler</code>](#commandHandler) ℗
        * [~commandRemove(msg)](#Music..commandRemove) : [<code>commandHandler</code>](#commandHandler) ℗
        * [~commandLyrics(msg)](#Music..commandLyrics) : [<code>commandHandler</code>](#commandHandler) ℗
        * [~reqLyricsURL(msg, id)](#Music..reqLyricsURL) ℗
        * [~fetchLyricsPage(msg, url, title, thumb)](#Music..fetchLyricsPage) ℗
        * [~stripLyrics(msg, content, title, url, thumb)](#Music..stripLyrics) ℗
        * [~commandRecord(msg)](#Music..commandRecord) : [<code>commandHandler</code>](#commandHandler) ℗
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
The prefix this submodule uses. Formed by prepending this.prefix to
this.postPrefix. this.postPrefix must be defined before begin(), otherwise
it is ignored.

**Kind**: instance property of [<code>Music</code>](#Music)  
**Read only**: true  
<a name="SubModule+postPrefix"></a>

### *music.postPrefix : <code>string</code>*
The postfix for the global prefix for this subModule. Must be defined
before begin(), otherwise it is ignored.

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
**Overrides**: [<code>myName</code>](#SubModule+myName)  
**Access**: protected  
<a name="SubModule+initialized"></a>

### music.initialized : <code>boolean</code>
Has this subModule been initialized yet (Has begin() been called).

**Kind**: instance property of [<code>Music</code>](#Music)  
**Default**: <code>false</code>  
**Access**: protected  
**Read only**: true  
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
| command | [<code>Command</code>](#SpikeyBot..Command) | The command instance in which to register command listeners. |
| common | [<code>Common</code>](#Common) | Class storing common functions. |

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

### Music~broadcasts : [<code>Object.&lt;Broadcast&gt;</code>](#Music..Broadcast) ℗
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
**Default**: <code>{&quot;hostname&quot;:&quot;api.genius.com&quot;,&quot;path&quot;:&quot;/search/&quot;,&quot;headers&quot;:&quot;&quot;,&quot;method&quot;:&quot;GET&quot;}</code>  
**Access**: private  
<a name="Music..special"></a>

### Music~special : <code>Object.&lt;Object.&lt;{cmd: string, url: ?string, file: string}&gt;&gt;</code> ℗
Special cases of requests to handle seperately.

**Kind**: inner constant of [<code>Music</code>](#Music)  
**Access**: private  
<a name="Music..ytdlOpts"></a>

### Music~ytdlOpts : <code>Array.&lt;string&gt;</code> ℗
Options passed to youtube-dl for fetching videos.

**Kind**: inner constant of [<code>Music</code>](#Music)  
**Default**: <code>[&quot;-f bestaudio/best&quot;,&quot;--no-playlist&quot;,&quot;--default-search&#x3D;auto&quot;]</code>  
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
| broadcast | [<code>Broadcast</code>](#Music..Broadcast) | The broadcast storage container. |
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
| broadcast | [<code>Broadcast</code>](#Music..Broadcast) | The container storing all information about the song. |

<a name="Music..makeBroadcast"></a>

### Music~makeBroadcast(broadcast) ℗
Create a voice channel broadcast based off of the media source, and start
playing the audio.

**Kind**: inner method of [<code>Music</code>](#Music)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| broadcast | [<code>Broadcast</code>](#Music..Broadcast) | The object storing all relevant information. |

<a name="Music..endSong"></a>

### Music~endSong(broadcast) ℗
Triggered when a song has finished playing.

**Kind**: inner method of [<code>Music</code>](#Music)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| broadcast | [<code>Broadcast</code>](#Music..Broadcast) | The object storing all relevant information. |

<a name="Music..skipSong"></a>

### Music~skipSong(broadcast) ℗
Skip the current song, then attempt to play the next.

**Kind**: inner method of [<code>Music</code>](#Music)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| broadcast | [<code>Broadcast</code>](#Music..Broadcast) | The object storing all relevant information. |

<a name="Music..commandPlay"></a>

### Music~commandPlay(msg) : [<code>commandHandler</code>](#commandHandler) ℗
Search for a song to play based off user request.

**Kind**: inner method of [<code>Music</code>](#Music)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord~Message</code> | The message that triggered command. |

<a name="Music..commandLeave"></a>

### Music~commandLeave(msg) : [<code>commandHandler</code>](#commandHandler) ℗
Cause the bot to leave the voice channel and stop playing music.

**Kind**: inner method of [<code>Music</code>](#Music)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord~Message</code> | The message that triggered the command. |

<a name="Music..commandSkip"></a>

### Music~commandSkip(msg) : [<code>commandHandler</code>](#commandHandler) ℗
Skip the currently playing song and continue to the next in the queue.

**Kind**: inner method of [<code>Music</code>](#Music)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord~Message</code> | The message that triggered the command. |

<a name="Music..commandQueue"></a>

### Music~commandQueue(msg) : [<code>commandHandler</code>](#commandHandler) ℗
Show the user what is in the queue.

**Kind**: inner method of [<code>Music</code>](#Music)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord~Message</code> | The message that triggered the command. |

<a name="Music..commandRemove"></a>

### Music~commandRemove(msg) : [<code>commandHandler</code>](#commandHandler) ℗
Remove a song from the queue.

**Kind**: inner method of [<code>Music</code>](#Music)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord~Message</code> | The message that triggered the command. |

<a name="Music..commandLyrics"></a>

### Music~commandLyrics(msg) : [<code>commandHandler</code>](#commandHandler) ℗
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

### Music~commandRecord(msg) : [<code>commandHandler</code>](#commandHandler) ℗
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
| skips | <code>Object.&lt;boolean&gt;</code> | Stores user id's and whether they have voted to skip. Non-existent user means they have not voted to skip. |
| isPlaying | <code>boolean</code> | Is audio currntly being streamed to the channel. |
| broadcast | <code>Discord~VoiceBroadcast</code> | The Discord voice broadcast actually playing the audio. |

<a name="SpikeyBot"></a>

## SpikeyBot
Main class that manages the bot.

**Kind**: global class  
**Emits**: <code>SpikeyBot~Command#event:\*</code>  

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
            * [~cmds](#SpikeyBot..Command..cmds) : [<code>Object.&lt;commandHandler&gt;</code>](#commandHandler) ℗
            * [~blacklist](#SpikeyBot..Command..blacklist) : <code>Object.&lt;Array.&lt;string&gt;&gt;</code> ℗
    * [~testMode](#SpikeyBot..testMode) : <code>boolean</code> ℗
    * [~subModuleNames](#SpikeyBot..subModuleNames) : <code>Array.&lt;string&gt;</code> ℗
    * [~setDev](#SpikeyBot..setDev) : <code>boolean</code> ℗
    * [~minimal](#SpikeyBot..minimal) : <code>boolean</code> ℗
    * [~subModules](#SpikeyBot..subModules) : [<code>Array.&lt;SubModule&gt;</code>](#SubModule) ℗
    * [~reactToAnthony](#SpikeyBot..reactToAnthony) : <code>boolean</code> ℗
    * [~spikeyId](#SpikeyBot..spikeyId) : <code>string</code> ℗
    * [~trustedIds](#SpikeyBot..trustedIds) : <code>Array.&lt;string&gt;</code> ℗
    * [~helpmessagereply](#SpikeyBot..helpmessagereply) : <code>string</code> ℗
    * [~blockedmessage](#SpikeyBot..blockedmessage) : <code>string</code> ℗
    * [~onlyservermessage](#SpikeyBot..onlyservermessage) : <code>string</code> ℗
    * [~disabledcommandmessage](#SpikeyBot..disabledcommandmessage) : <code>string</code> ℗
    * [~command](#SpikeyBot..command) : [<code>Command</code>](#SpikeyBot..Command) ℗
    * [~isCmd(msg, cmd)](#SpikeyBot..isCmd) ⇒ <code>boolean</code> ℗
    * [~updateGame(game)](#SpikeyBot..updateGame) ℗
    * [~mention(msg)](#SpikeyBot..mention) ⇒ <code>string</code> ℗
    * [~reply(msg, text, post)](#SpikeyBot..reply) ⇒ <code>Promise</code> ℗
    * [~onReady()](#SpikeyBot..onReady) ℗
    * [~onMessage(msg)](#SpikeyBot..onMessage) ℗
    * [~commandToggleReact(msg)](#SpikeyBot..commandToggleReact) : [<code>commandHandler</code>](#commandHandler) ℗
    * [~commandHelp(msg)](#SpikeyBot..commandHelp) : [<code>commandHandler</code>](#commandHandler) ℗
    * [~commandUpdateGame(msg)](#SpikeyBot..commandUpdateGame) : [<code>commandHandler</code>](#commandHandler) ℗
    * [~commandReboot(msg)](#SpikeyBot..commandReboot) : [<code>commandHandler</code>](#commandHandler) ℗
    * [~commandReload(msg)](#SpikeyBot..commandReload) : [<code>commandHandler</code>](#commandHandler) ℗

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
        * [~cmds](#SpikeyBot..Command..cmds) : [<code>Object.&lt;commandHandler&gt;</code>](#commandHandler) ℗
        * [~blacklist](#SpikeyBot..Command..blacklist) : <code>Object.&lt;Array.&lt;string&gt;&gt;</code> ℗

<a name="new_SpikeyBot..Command_new"></a>

#### new Command()
Command event triggering interface.

<a name="SpikeyBot..Command+trigger"></a>

#### command.trigger(cmd, msg) ⇒ <code>boolean</code>
Trigger a command firing and call it's handler passing in msg as only
argument.

**Kind**: instance method of [<code>Command</code>](#SpikeyBot..Command)  
**Returns**: <code>boolean</code> - True if command was handled by us.  

| Param | Type | Description |
| --- | --- | --- |
| cmd | <code>string</code> | Array of strings or a string of the command to trigger. |
| msg | <code>Discord~Message</code> | Message received from Discord to pass to handler. |

<a name="SpikeyBot..Command+on"></a>

#### command.on(cmd, cb, [onlyserver])
Registers a listener for a command.

**Kind**: instance method of [<code>Command</code>](#SpikeyBot..Command)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| cmd | <code>string</code> \| <code>Array.&lt;string&gt;</code> |  | Command to listen for. |
| cb | [<code>commandHandler</code>](#commandHandler) |  | Function to call when command is triggered. |
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

#### Command~cmds : [<code>Object.&lt;commandHandler&gt;</code>](#commandHandler) ℗
All tracked commands with handlers.

**Kind**: inner property of [<code>Command</code>](#SpikeyBot..Command)  
**Access**: private  
<a name="SpikeyBot..Command..blacklist"></a>

#### Command~blacklist : <code>Object.&lt;Array.&lt;string&gt;&gt;</code> ℗
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
<a name="SpikeyBot..minimal"></a>

### SpikeyBot~minimal : <code>boolean</code> ℗
Should this bot only load minimal features as to not overlap with multiple
instances.

**Kind**: inner property of [<code>SpikeyBot</code>](#SpikeyBot)  
**Access**: private  
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

### SpikeyBot~command : [<code>Command</code>](#SpikeyBot..Command) ℗
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
| msg | <code>Discord~Message</code> | Message from Discord to check if it is the given command. |
| cmd | <code>string</code> | Command to check if the message is this command. |

<a name="SpikeyBot..updateGame"></a>

### SpikeyBot~updateGame(game) ℗
Changes the bot's status message.

**Kind**: inner method of [<code>SpikeyBot</code>](#SpikeyBot)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| game | <code>string</code> | New message to set game to. |

<a name="SpikeyBot..mention"></a>

### SpikeyBot~mention(msg) ⇒ <code>string</code> ℗
Creates formatted string for mentioning the author of msg.

**Kind**: inner method of [<code>SpikeyBot</code>](#SpikeyBot)  
**Returns**: <code>string</code> - Formatted mention string.  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord~Message</code> | Message to format a mention for the author of. |

<a name="SpikeyBot..reply"></a>

### SpikeyBot~reply(msg, text, post) ⇒ <code>Promise</code> ℗
Replies to the author and channel of msg with the given message.

**Kind**: inner method of [<code>SpikeyBot</code>](#SpikeyBot)  
**Returns**: <code>Promise</code> - Promise of Discord.Message that we attempted to send.  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord~Message</code> | Message to reply to. |
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
**Emits**: <code>SpikeyBot~event:Command</code>  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord~Message</code> | Message that was sent in Discord. |

<a name="SpikeyBot..commandToggleReact"></a>

### SpikeyBot~commandToggleReact(msg) : [<code>commandHandler</code>](#commandHandler) ℗
Toggle reactions to Anthony.

**Kind**: inner method of [<code>SpikeyBot</code>](#SpikeyBot)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord~Message</code> | Message that triggered command. |

<a name="SpikeyBot..commandHelp"></a>

### SpikeyBot~commandHelp(msg) : [<code>commandHandler</code>](#commandHandler) ℗
Send help message to user who requested it.

**Kind**: inner method of [<code>SpikeyBot</code>](#SpikeyBot)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord~Message</code> | Message that triggered command. |

<a name="SpikeyBot..commandUpdateGame"></a>

### SpikeyBot~commandUpdateGame(msg) : [<code>commandHandler</code>](#commandHandler) ℗
Change current status message.

**Kind**: inner method of [<code>SpikeyBot</code>](#SpikeyBot)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord~Message</code> | Message that triggered command. |

<a name="SpikeyBot..commandReboot"></a>

### SpikeyBot~commandReboot(msg) : [<code>commandHandler</code>](#commandHandler) ℗
Trigger a reboot of the bot. Actually just gracefully shuts down, and
expects to be immediately restarted.

**Kind**: inner method of [<code>SpikeyBot</code>](#SpikeyBot)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord~Message</code> | Message that triggered command. |

<a name="SpikeyBot..commandReload"></a>

### SpikeyBot~commandReload(msg) : [<code>commandHandler</code>](#commandHandler) ℗
Reload all sub modules by unloading then re-requiring.

**Kind**: inner method of [<code>SpikeyBot</code>](#SpikeyBot)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord~Message</code> | Message that triggered command. |

<a name="SubModule"></a>

## SubModule
Base class for all Sub-Modules.

**Kind**: global class  

* [SubModule](#SubModule)
    * _instance_
        * [.helpMessage](#SubModule+helpMessage) : <code>string</code> \| <code>Discord~MessageEmbed</code>
        * [.prefix](#SubModule+prefix) : <code>string</code>
        * [.myPrefix](#SubModule+myPrefix) : <code>string</code>
        * *[.postPrefix](#SubModule+postPrefix) : <code>string</code>*
        * [.Discord](#SubModule+Discord) : <code>Discord</code>
        * [.client](#SubModule+client) : <code>Discord~Client</code>
        * [.command](#SubModule+command) : [<code>Command</code>](#SpikeyBot..Command)
        * [.common](#SubModule+common) : [<code>Common</code>](#Common)
        * *[.myName](#SubModule+myName) : <code>string</code>*
        * [.initialized](#SubModule+initialized) : <code>boolean</code>
        * *[.initialize()](#SubModule+initialize)*
        * [.begin(prefix, Discord, client, command, common)](#SubModule+begin)
        * [.end()](#SubModule+end)
        * *[.shutdown()](#SubModule+shutdown)*
        * *[.save()](#SubModule+save)*
    * _static_
        * [.extend(child)](#SubModule.extend)

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
The prefix this submodule uses. Formed by prepending this.prefix to
this.postPrefix. this.postPrefix must be defined before begin(), otherwise
it is ignored.

**Kind**: instance property of [<code>SubModule</code>](#SubModule)  
**Read only**: true  
<a name="SubModule+postPrefix"></a>

### *subModule.postPrefix : <code>string</code>*
The postfix for the global prefix for this subModule. Must be defined
before begin(), otherwise it is ignored.

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
<a name="SubModule+initialized"></a>

### subModule.initialized : <code>boolean</code>
Has this subModule been initialized yet (Has begin() been called).

**Kind**: instance property of [<code>SubModule</code>](#SubModule)  
**Default**: <code>false</code>  
**Access**: protected  
**Read only**: true  
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
| command | [<code>Command</code>](#SpikeyBot..Command) | The command instance in which to register command listeners. |
| common | [<code>Common</code>](#Common) | Class storing common functions. |

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

<a name="commandHandler"></a>

## commandHandler : <code>function</code>
The function to call when a command is triggered.

**Kind**: global typedef  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord~Message</code> | The message sent in Discord. |

