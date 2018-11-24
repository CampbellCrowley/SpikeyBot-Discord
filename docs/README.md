[Commands Help](commands/)
## Modules

<dl>
<dt><a href="#module_lib/twemojiChecker">lib/twemojiChecker</a></dt>
<dd></dd>
</dl>

## Classes

<dl>
<dt><a href="#ChatBot">ChatBot</a> ⇐ <code><a href="#SubModule">SubModule</a></code></dt>
<dd><p>Manages natural language interaction.</p>
</dd>
<dt><a href="#CmdScheduling">CmdScheduling</a> ⇐ <code><a href="#SubModule">SubModule</a></code></dt>
<dd><p>Provides interface for scheduling a specific time or interval for
a command to be run.</p>
</dd>
<dt><a href="#Command">Command</a> ⇐ <code><a href="#MainModule">MainModule</a></code></dt>
<dd><p>Manages the command event firing for all commands. This is not a
normal submodule, and is treated differently in the SpikeyBot class.</p>
</dd>
<dt><a href="#Common">Common</a></dt>
<dd></dd>
<dt><a href="#Connect4">Connect4</a> ⇐ <code><a href="#SubModule">SubModule</a></code></dt>
<dd><p>Manages a Connect 4 game.</p>
</dd>
<dt><a href="#HungryGames">HungryGames</a> ⇐ <code><a href="#SubModule">SubModule</a></code></dt>
<dd><p>Hunger Games simulator.</p>
</dd>
<dt><a href="#Main">Main</a> ⇐ <code><a href="#SubModule">SubModule</a></code></dt>
<dd><p>Basic commands and features for the bot.</p>
</dd>
<dt><a href="#MainModule">MainModule</a> ⇐ <code><a href="#SubModule">SubModule</a></code></dt>
<dd><p>Base class for required modules for the bot to work. Adds
interface for maintaining references across reloads.</p>
</dd>
<dt><a href="#Music">Music</a> ⇐ <code><a href="#SubModule">SubModule</a></code></dt>
<dd><p>Music and audio related commands.</p>
</dd>
<dt><a href="#Patreon">Patreon</a> ⇐ <code><a href="#SubModule">SubModule</a></code></dt>
<dd><p>Modifies the SpikeyBot object with an interface for checking the
Patreon status of users.</p>
</dd>
<dt><a href="#Polling">Polling</a> ⇐ <code><a href="#SubModule">SubModule</a></code></dt>
<dd><p>Controlls poll and vote commands.</p>
</dd>
<dt><a href="#SMLoader">SMLoader</a> ⇐ <code><a href="#MainModule">MainModule</a></code></dt>
<dd><p>Manages loading, unloading, and reloading of all SubModules.</p>
</dd>
<dt><a href="#SpikeyBot">SpikeyBot</a></dt>
<dd><p>Main class that manages the bot.</p>
</dd>
<dt><a href="#Spotify">Spotify</a> ⇐ <code><a href="#SubModule">SubModule</a></code></dt>
<dd><p>Attempts to play what a user is playing on Spotify, to a voice
channel.</p>
</dd>
<dt><a href="#SubModule">SubModule</a></dt>
<dd><p>Base class for all Sub-Modules.</p>
</dd>
<dt><a href="#TicTacToe">TicTacToe</a> ⇐ <code><a href="#SubModule">SubModule</a></code></dt>
<dd><p>Manages a tic-tac-toe game.</p>
</dd>
<dt><a href="#TTS">TTS</a> ⇐ <code><a href="#SubModule">SubModule</a></code></dt>
<dd><p>Adds text-to-speech support for voice channels.</p>
</dd>
<dt><a href="#FunTranslators">FunTranslators</a></dt>
<dd><p>Converts text strings into different formats.</p>
</dd>
<dt><a href="#WebAccount">WebAccount</a> ⇐ <code><a href="#SubModule">SubModule</a></code></dt>
<dd><p>Manages the account webpage.</p>
</dd>
<dt><a href="#HGWeb">HGWeb</a></dt>
<dd><p>Creates a web interface for managing the Hungry Games.</p>
</dd>
<dt><a href="#WebProxy">WebProxy</a> ⇐ <code><a href="#SubModule">SubModule</a></code></dt>
<dd><p>Proxy for account authentication.</p>
</dd>
<dt><a href="#WebSettings">WebSettings</a> ⇐ <code><a href="#SubModule">SubModule</a></code></dt>
<dd><p>Manages changing settings for the bot from a website.</p>
</dd>
<dt><a href="#WebStats">WebStats</a> ⇐ <code><a href="#SubModule">SubModule</a></code></dt>
<dd><p>Handles sending the bot&#39;s stats to http client requests, and
discordbots.org.</p>
</dd>
<dt><a href="#WebCommands">WebCommands</a> ⇐ <code><a href="#SubModule">SubModule</a></code></dt>
<dd><p>Handles sending the bot&#39;s stats to http client requests, and
discordbots.org.</p>
</dd>
</dl>

## Functions

<dl>
<dt><a href="#unhandledRejection">unhandledRejection(reason, p)</a> ℗</dt>
<dd><p>Handler for an unhandledRejection or uncaughtException, to prevent the bot
from silently crashing without an error.</p>
</dd>
</dl>

## Typedefs

<dl>
<dt><a href="#commandHandler">commandHandler</a> : <code>function</code></dt>
<dd><p>The function to call when a command is triggered.</p>
</dd>
<dt><a href="#loginState">loginState</a></dt>
<dd><p>The current OAuth2 access information for a single session.</p>
</dd>
</dl>

<a name="module_lib/twemojiChecker"></a>

## lib/twemojiChecker

* [lib/twemojiChecker](#module_lib/twemojiChecker)
    * [~re](#module_lib/twemojiChecker..re) : <code>RegExp</code> ℗
    * [~match(input)](#module_lib/twemojiChecker..match) ⇒ <code>null</code> \| <code>Array.&lt;string&gt;</code>

<a name="module_lib/twemojiChecker..re"></a>

### lib/twemojiChecker~re : <code>RegExp</code> ℗
RegExp based on emoji's official Unicode standards
http://www.unicode.org/Public/UNIDATA/EmojiSources.txt
https://github.com/twitter/twemoji/blob/27fe654b2bed5331cf1730bb4fbba1efa40af626/2/twemoji.js#L228

**Kind**: inner constant of [<code>lib/twemojiChecker</code>](#module_lib/twemojiChecker)  
**Access**: private  
<a name="module_lib/twemojiChecker..match"></a>

### lib/twemojiChecker~match(input) ⇒ <code>null</code> \| <code>Array.&lt;string&gt;</code>
Check a string for any emoji matches.

**Kind**: inner method of [<code>lib/twemojiChecker</code>](#module_lib/twemojiChecker)  
**Returns**: <code>null</code> \| <code>Array.&lt;string&gt;</code> - The matched return value.  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| input | <code>string</code> | The string to run the regex against. |

<a name="ChatBot"></a>

## ChatBot ⇐ [<code>SubModule</code>](#SubModule)
Manages natural language interaction.

**Kind**: global class  
**Extends**: [<code>SubModule</code>](#SubModule)  

* [ChatBot](#ChatBot) ⇐ [<code>SubModule</code>](#SubModule)
    * _instance_
        * [.helpMessage](#SubModule+helpMessage) : <code>string</code> \| <code>Discord~MessageEmbed</code>
        * *[.postPrefix](#SubModule+postPrefix) : <code>string</code>*
        * [.Discord](#SubModule+Discord) : <code>Discord</code>
        * [.client](#SubModule+client) : <code>Discord~Client</code>
        * [.command](#SubModule+command) : [<code>Command</code>](#Command)
        * [.common](#SubModule+common) : [<code>Common</code>](#Common)
        * [.bot](#SubModule+bot) : [<code>SpikeyBot</code>](#SpikeyBot)
        * [.myName](#SubModule+myName) : <code>string</code>
        * [.initialized](#SubModule+initialized) : <code>boolean</code>
        * [.commit](#SubModule+commit) : <code>string</code>
        * [.loadTime](#SubModule+loadTime) : <code>number</code>
        * [.initialize()](#SubModule+initialize)
        * [.begin(Discord, client, command, common, bot)](#SubModule+begin)
        * [.end()](#SubModule+end)
        * [.log(msg)](#SubModule+log)
        * [.debug(msg)](#SubModule+debug)
        * [.warn(msg)](#SubModule+warn)
        * [.error(msg)](#SubModule+error)
        * [.shutdown()](#SubModule+shutdown)
        * [.save([opt])](#SubModule+save)
        * *[.unloadable()](#SubModule+unloadable) ⇒ <code>boolean</code>*
    * _inner_
        * [~onMessage(msg)](#ChatBot..onMessage) ℗
        * [~onChatMessage(msg)](#ChatBot..onChatMessage) : [<code>commandHandler</code>](#commandHandler) ℗
        * [~escapeRegExp(str)](#ChatBot..escapeRegExp) ⇒ <code>string</code> ℗

<a name="SubModule+helpMessage"></a>

### chatBot.helpMessage : <code>string</code> \| <code>Discord~MessageEmbed</code>
The help message to show the user in the main help message.

**Kind**: instance property of [<code>ChatBot</code>](#ChatBot)  
<a name="SubModule+postPrefix"></a>

### *chatBot.postPrefix : <code>string</code>*
The postfix for the global prefix for this subModule. Must be defined
before begin(), otherwise it is ignored.

**Kind**: instance abstract property of [<code>ChatBot</code>](#ChatBot)  
**Default**: <code>&quot;&quot;</code>  
<a name="SubModule+Discord"></a>

### chatBot.Discord : <code>Discord</code>
The current Discord object instance of the bot.

**Kind**: instance property of [<code>ChatBot</code>](#ChatBot)  
<a name="SubModule+client"></a>

### chatBot.client : <code>Discord~Client</code>
The current bot client.

**Kind**: instance property of [<code>ChatBot</code>](#ChatBot)  
<a name="SubModule+command"></a>

### chatBot.command : [<code>Command</code>](#Command)
The command object for registering command listeners.

**Kind**: instance property of [<code>ChatBot</code>](#ChatBot)  
<a name="SubModule+common"></a>

### chatBot.common : [<code>Common</code>](#Common)
The common object.

**Kind**: instance property of [<code>ChatBot</code>](#ChatBot)  
<a name="SubModule+bot"></a>

### chatBot.bot : [<code>SpikeyBot</code>](#SpikeyBot)
The parent SpikeyBot instance.

**Kind**: instance property of [<code>ChatBot</code>](#ChatBot)  
<a name="SubModule+myName"></a>

### chatBot.myName : <code>string</code>
The name of this submodule. Used for differentiating in the log. Should be
defined before begin().

**Kind**: instance property of [<code>ChatBot</code>](#ChatBot)  
**Overrides**: [<code>myName</code>](#SubModule+myName)  
**Access**: protected  
<a name="SubModule+initialized"></a>

### chatBot.initialized : <code>boolean</code>
Has this subModule been initialized yet (Has begin() been called).

**Kind**: instance property of [<code>ChatBot</code>](#ChatBot)  
**Default**: <code>false</code>  
**Access**: protected  
**Read only**: true  
<a name="SubModule+commit"></a>

### chatBot.commit : <code>string</code>
The commit at HEAD at the time this module was loaded. Essentially the
version of this submodule.

**Kind**: instance constant of [<code>ChatBot</code>](#ChatBot)  
**Access**: public  
<a name="SubModule+loadTime"></a>

### chatBot.loadTime : <code>number</code>
The time at which this madule was loaded for use in checking if the module
needs to be reloaded because the file has been modified since loading.

**Kind**: instance constant of [<code>ChatBot</code>](#ChatBot)  
**Access**: public  
<a name="SubModule+initialize"></a>

### chatBot.initialize()
The function called at the end of begin() for further initialization
specific to the subModule. Must be defined before begin() is called.

**Kind**: instance method of [<code>ChatBot</code>](#ChatBot)  
**Overrides**: [<code>initialize</code>](#SubModule+initialize)  
**Access**: protected  
<a name="SubModule+begin"></a>

### chatBot.begin(Discord, client, command, common, bot)
Initialize this submodule.

**Kind**: instance method of [<code>ChatBot</code>](#ChatBot)  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| Discord | <code>Discord</code> | The Discord object for the API library. |
| client | <code>Discord~Client</code> | The client that represents this bot. |
| command | [<code>Command</code>](#Command) | The command instance in which to register command listeners. |
| common | [<code>Common</code>](#Common) | Class storing common functions. |
| bot | [<code>SpikeyBot</code>](#SpikeyBot) | The parent SpikeyBot instance. |

<a name="SubModule+end"></a>

### chatBot.end()
Trigger subModule to shutdown and get ready for process terminating.

**Kind**: instance method of [<code>ChatBot</code>](#ChatBot)  
**Access**: public  
<a name="SubModule+log"></a>

### chatBot.log(msg)
Log using common.log, but automatically set name.

**Kind**: instance method of [<code>ChatBot</code>](#ChatBot)  
**Access**: protected  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>string</code> | The message to log. |

<a name="SubModule+debug"></a>

### chatBot.debug(msg)
Log using common.logDebug, but automatically set name.

**Kind**: instance method of [<code>ChatBot</code>](#ChatBot)  
**Access**: protected  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>string</code> | The message to log. |

<a name="SubModule+warn"></a>

### chatBot.warn(msg)
Log using common.logWarning, but automatically set name.

**Kind**: instance method of [<code>ChatBot</code>](#ChatBot)  
**Access**: protected  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>string</code> | The message to log. |

<a name="SubModule+error"></a>

### chatBot.error(msg)
Log using common.error, but automatically set name.

**Kind**: instance method of [<code>ChatBot</code>](#ChatBot)  
**Access**: protected  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>string</code> | The message to log. |

<a name="SubModule+shutdown"></a>

### chatBot.shutdown()
Shutdown and disable this submodule. Removes all event listeners.

**Kind**: instance method of [<code>ChatBot</code>](#ChatBot)  
**Overrides**: [<code>shutdown</code>](#SubModule+shutdown)  
**Access**: protected  
<a name="SubModule+save"></a>

### chatBot.save([opt])
Saves all data to files necessary for saving current state.

**Kind**: instance method of [<code>ChatBot</code>](#ChatBot)  
**Overrides**: [<code>save</code>](#SubModule+save)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [opt] | <code>string</code> | <code>&quot;&#x27;sync&#x27;&quot;</code> | Can be 'async', otherwise defaults to synchronous. |

<a name="SubModule+unloadable"></a>

### *chatBot.unloadable() ⇒ <code>boolean</code>*
Check if this module is in a state that is ready to be unloaded. If false
is returned, this module should not be unloaded and doing such may risk
putting the module into an uncontrollable state.

**Kind**: instance abstract method of [<code>ChatBot</code>](#ChatBot)  
**Returns**: <code>boolean</code> - True if can be unloaded, false if cannot.  
**Access**: public  
<a name="ChatBot..onMessage"></a>

### ChatBot~onMessage(msg) ℗
Respond to messages where I've been mentioned.

**Kind**: inner method of [<code>ChatBot</code>](#ChatBot)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord~Message</code> | Message was sent. |

<a name="ChatBot..onChatMessage"></a>

### ChatBot~onChatMessage(msg) : [<code>commandHandler</code>](#commandHandler) ℗
Send message text content to dialogflow for handling.

**Kind**: inner method of [<code>ChatBot</code>](#ChatBot)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord~Message</code> | Message that triggered command. |

<a name="ChatBot..escapeRegExp"></a>

### ChatBot~escapeRegExp(str) ⇒ <code>string</code> ℗
Escape a given string to be passed into a regular expression.

**Kind**: inner method of [<code>ChatBot</code>](#ChatBot)  
**Returns**: <code>string</code> - Escaped string.  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| str | <code>string</code> | Input to escape. |

<a name="CmdScheduling"></a>

## CmdScheduling ⇐ [<code>SubModule</code>](#SubModule)
Provides interface for scheduling a specific time or interval for
a command to be run.

**Kind**: global class  
**Extends**: [<code>SubModule</code>](#SubModule)  

* [CmdScheduling](#CmdScheduling) ⇐ [<code>SubModule</code>](#SubModule)
    * _instance_
        * [.registerScheduledCommand](#CmdScheduling+registerScheduledCommand)
        * [.cancelCmd](#CmdScheduling+cancelCmd)
        * [.helpMessage](#SubModule+helpMessage) : <code>string</code> \| <code>Discord~MessageEmbed</code>
        * *[.postPrefix](#SubModule+postPrefix) : <code>string</code>*
        * [.Discord](#SubModule+Discord) : <code>Discord</code>
        * [.client](#SubModule+client) : <code>Discord~Client</code>
        * [.command](#SubModule+command) : [<code>Command</code>](#Command)
        * [.common](#SubModule+common) : [<code>Common</code>](#Common)
        * [.bot](#SubModule+bot) : [<code>SpikeyBot</code>](#SpikeyBot)
        * [.myName](#SubModule+myName) : <code>string</code>
        * [.initialized](#SubModule+initialized) : <code>boolean</code>
        * [.minDelay](#CmdScheduling+minDelay) : <code>number</code>
        * [.minRepeatDelay](#CmdScheduling+minRepeatDelay) : <code>number</code>
        * [.commit](#SubModule+commit) : <code>string</code>
        * [.loadTime](#SubModule+loadTime) : <code>number</code>
        * [.on(name, handler)](#CmdScheduling+on)
        * [.removeListener(name, [handler])](#CmdScheduling+removeListener)
        * [.initialize()](#SubModule+initialize)
        * [.begin(Discord, client, command, common, bot)](#SubModule+begin)
        * [.end()](#SubModule+end)
        * [.log(msg)](#SubModule+log)
        * [.debug(msg)](#SubModule+debug)
        * [.warn(msg)](#SubModule+warn)
        * [.error(msg)](#SubModule+error)
        * [.shutdown()](#SubModule+shutdown)
        * [.save([opt])](#SubModule+save)
        * *[.unloadable()](#SubModule+unloadable) ⇒ <code>boolean</code>*
    * _inner_
        * [~ScheduledCommand](#CmdScheduling..ScheduledCommand)
            * [new ScheduledCommand(cmd, channel, message, time, repeatDelay)](#new_CmdScheduling..ScheduledCommand_new)
            * _instance_
                * [.go()](#CmdScheduling..ScheduledCommand+go)
                * [.cancel()](#CmdScheduling..ScheduledCommand+cancel)
                * [.setTimeout()](#CmdScheduling..ScheduledCommand+setTimeout)
                * [.toJSON()](#CmdScheduling..ScheduledCommand+toJSON) ⇒ <code>Object</code>
            * _inner_
                * [~getReferences()](#CmdScheduling..ScheduledCommand..getReferences) ℗
        * [~longInterval](#CmdScheduling..longInterval) : <code>Interval</code> ℗
        * [~listeners](#CmdScheduling..listeners) : <code>Object.&lt;Array.&lt;function()&gt;&gt;</code> ℗
        * [~schedules](#CmdScheduling..schedules) : <code>Object.&lt;Array.&lt;CmdScheduling.ScheduledCommand&gt;&gt;</code> ℗
        * [~maxTimeout](#CmdScheduling..maxTimeout) : <code>number</code> ℗
        * [~saveSubDir](#CmdScheduling..saveSubDir) : <code>string</code> ℗
        * [~idChars](#CmdScheduling..idChars) : <code>string</code> ℗
        * [~embedColor](#CmdScheduling..embedColor) : <code>Array.&lt;number&gt;</code> ℗
        * [~registerScheduledCommand(sCmd)](#CmdScheduling..registerScheduledCommand) ℗
        * [~commandSchedule(msg)](#CmdScheduling..commandSchedule) : [<code>commandHandler</code>](#commandHandler) ℗
        * [~sortGuildCommands(id)](#CmdScheduling..sortGuildCommands) ℗
        * [~stringToMilliseconds(str)](#CmdScheduling..stringToMilliseconds) ⇒ <code>number</code> ℗
            * [~numberToUnit(num, unit)](#CmdScheduling..stringToMilliseconds..numberToUnit) ⇒ <code>number</code> ℗
        * [~getScheduledCommandsInGuild(gId)](#CmdScheduling..getScheduledCommandsInGuild) ⇒ <code>null</code> \| <code>Array.&lt;CmdScheduling.ScheduledCommand&gt;</code>
        * [~replyWithSchedule(msg)](#CmdScheduling..replyWithSchedule) ℗
        * [~cancelCmd(gId, cmdId)](#CmdScheduling..cancelCmd) ⇒ <code>CmdScheduling.ScheduledCommand</code> ℗
        * [~cancelAndReply(msg)](#CmdScheduling..cancelAndReply) ℗
        * [~reScheduleCommands()](#CmdScheduling..reScheduleCommands)
        * [~formatDelay(msecs)](#CmdScheduling..formatDelay) ⇒ <code>string</code> ℗
        * [~fireEvent(name)](#CmdScheduling..fireEvent) ℗
        * [~makeMessage(uId, gId, cId, msg)](#CmdScheduling..makeMessage) ⇒ <code>Object</code> ℗

<a name="CmdScheduling+registerScheduledCommand"></a>

### cmdScheduling.registerScheduledCommand
Register a created [CmdScheduling.ScheduledCommand](CmdScheduling.ScheduledCommand).

**Kind**: instance property of [<code>CmdScheduling</code>](#CmdScheduling)  
**Access**: public  
**See**: [registerScheduledCommand](#CmdScheduling..registerScheduledCommand)  
<a name="CmdScheduling+cancelCmd"></a>

### cmdScheduling.cancelCmd
Cancel a scheduled command in a guild.

**Kind**: instance property of [<code>CmdScheduling</code>](#CmdScheduling)  
**Access**: public  
**See**: [cancelCmd](#CmdScheduling..cancelCmd)  
<a name="SubModule+helpMessage"></a>

### cmdScheduling.helpMessage : <code>string</code> \| <code>Discord~MessageEmbed</code>
The help message to show the user in the main help message.

**Kind**: instance property of [<code>CmdScheduling</code>](#CmdScheduling)  
<a name="SubModule+postPrefix"></a>

### *cmdScheduling.postPrefix : <code>string</code>*
The postfix for the global prefix for this subModule. Must be defined
before begin(), otherwise it is ignored.

**Kind**: instance abstract property of [<code>CmdScheduling</code>](#CmdScheduling)  
**Default**: <code>&quot;&quot;</code>  
<a name="SubModule+Discord"></a>

### cmdScheduling.Discord : <code>Discord</code>
The current Discord object instance of the bot.

**Kind**: instance property of [<code>CmdScheduling</code>](#CmdScheduling)  
<a name="SubModule+client"></a>

### cmdScheduling.client : <code>Discord~Client</code>
The current bot client.

**Kind**: instance property of [<code>CmdScheduling</code>](#CmdScheduling)  
<a name="SubModule+command"></a>

### cmdScheduling.command : [<code>Command</code>](#Command)
The command object for registering command listeners.

**Kind**: instance property of [<code>CmdScheduling</code>](#CmdScheduling)  
<a name="SubModule+common"></a>

### cmdScheduling.common : [<code>Common</code>](#Common)
The common object.

**Kind**: instance property of [<code>CmdScheduling</code>](#CmdScheduling)  
<a name="SubModule+bot"></a>

### cmdScheduling.bot : [<code>SpikeyBot</code>](#SpikeyBot)
The parent SpikeyBot instance.

**Kind**: instance property of [<code>CmdScheduling</code>](#CmdScheduling)  
<a name="SubModule+myName"></a>

### cmdScheduling.myName : <code>string</code>
The name of this submodule. Used for differentiating in the log. Should be
defined before begin().

**Kind**: instance property of [<code>CmdScheduling</code>](#CmdScheduling)  
**Overrides**: [<code>myName</code>](#SubModule+myName)  
**Access**: protected  
<a name="SubModule+initialized"></a>

### cmdScheduling.initialized : <code>boolean</code>
Has this subModule been initialized yet (Has begin() been called).

**Kind**: instance property of [<code>CmdScheduling</code>](#CmdScheduling)  
**Default**: <code>false</code>  
**Access**: protected  
**Read only**: true  
<a name="CmdScheduling+minDelay"></a>

### cmdScheduling.minDelay : <code>number</code>
Minimum allowable amount of time in milliseconds from when the scheduled
command is registered to when it runs.

**Kind**: instance constant of [<code>CmdScheduling</code>](#CmdScheduling)  
**Default**: <code>10 Seconds</code>  
**Access**: public  
<a name="CmdScheduling+minRepeatDelay"></a>

### cmdScheduling.minRepeatDelay : <code>number</code>
Minimum allowable amount of time in milliseconds from when the scheduled
command is run to when it run may run again.

**Kind**: instance constant of [<code>CmdScheduling</code>](#CmdScheduling)  
**Default**: <code>30 Seconds</code>  
**Access**: public  
<a name="SubModule+commit"></a>

### cmdScheduling.commit : <code>string</code>
The commit at HEAD at the time this module was loaded. Essentially the
version of this submodule.

**Kind**: instance constant of [<code>CmdScheduling</code>](#CmdScheduling)  
**Access**: public  
<a name="SubModule+loadTime"></a>

### cmdScheduling.loadTime : <code>number</code>
The time at which this madule was loaded for use in checking if the module
needs to be reloaded because the file has been modified since loading.

**Kind**: instance constant of [<code>CmdScheduling</code>](#CmdScheduling)  
**Access**: public  
<a name="CmdScheduling+on"></a>

### cmdScheduling.on(name, handler)
Register an event handler for the given name with the given handler.

**Kind**: instance method of [<code>CmdScheduling</code>](#CmdScheduling)  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | The event name to listen for. |
| handler | <code>function</code> | The function to call when the event is fired. |

<a name="CmdScheduling+removeListener"></a>

### cmdScheduling.removeListener(name, [handler])
Remove an event handler for the given name.

**Kind**: instance method of [<code>CmdScheduling</code>](#CmdScheduling)  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | The event name to remove the handler for. |
| [handler] | <code>function</code> | THe specific handler to remove, or null for all. |

<a name="SubModule+initialize"></a>

### cmdScheduling.initialize()
The function called at the end of begin() for further initialization
specific to the subModule. Must be defined before begin() is called.

**Kind**: instance method of [<code>CmdScheduling</code>](#CmdScheduling)  
**Overrides**: [<code>initialize</code>](#SubModule+initialize)  
**Access**: protected  
<a name="SubModule+begin"></a>

### cmdScheduling.begin(Discord, client, command, common, bot)
Initialize this submodule.

**Kind**: instance method of [<code>CmdScheduling</code>](#CmdScheduling)  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| Discord | <code>Discord</code> | The Discord object for the API library. |
| client | <code>Discord~Client</code> | The client that represents this bot. |
| command | [<code>Command</code>](#Command) | The command instance in which to register command listeners. |
| common | [<code>Common</code>](#Common) | Class storing common functions. |
| bot | [<code>SpikeyBot</code>](#SpikeyBot) | The parent SpikeyBot instance. |

<a name="SubModule+end"></a>

### cmdScheduling.end()
Trigger subModule to shutdown and get ready for process terminating.

**Kind**: instance method of [<code>CmdScheduling</code>](#CmdScheduling)  
**Access**: public  
<a name="SubModule+log"></a>

### cmdScheduling.log(msg)
Log using common.log, but automatically set name.

**Kind**: instance method of [<code>CmdScheduling</code>](#CmdScheduling)  
**Access**: protected  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>string</code> | The message to log. |

<a name="SubModule+debug"></a>

### cmdScheduling.debug(msg)
Log using common.logDebug, but automatically set name.

**Kind**: instance method of [<code>CmdScheduling</code>](#CmdScheduling)  
**Access**: protected  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>string</code> | The message to log. |

<a name="SubModule+warn"></a>

### cmdScheduling.warn(msg)
Log using common.logWarning, but automatically set name.

**Kind**: instance method of [<code>CmdScheduling</code>](#CmdScheduling)  
**Access**: protected  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>string</code> | The message to log. |

<a name="SubModule+error"></a>

### cmdScheduling.error(msg)
Log using common.error, but automatically set name.

**Kind**: instance method of [<code>CmdScheduling</code>](#CmdScheduling)  
**Access**: protected  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>string</code> | The message to log. |

<a name="SubModule+shutdown"></a>

### cmdScheduling.shutdown()
Shutdown and disable this submodule. Removes all event listeners.

**Kind**: instance method of [<code>CmdScheduling</code>](#CmdScheduling)  
**Overrides**: [<code>shutdown</code>](#SubModule+shutdown)  
**Access**: protected  
<a name="SubModule+save"></a>

### cmdScheduling.save([opt])
Saves all data to files necessary for saving current state.

**Kind**: instance method of [<code>CmdScheduling</code>](#CmdScheduling)  
**Overrides**: [<code>save</code>](#SubModule+save)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [opt] | <code>string</code> | <code>&quot;&#x27;sync&#x27;&quot;</code> | Can be 'async', otherwise defaults to synchronous. |

<a name="SubModule+unloadable"></a>

### *cmdScheduling.unloadable() ⇒ <code>boolean</code>*
Check if this module is in a state that is ready to be unloaded. If false
is returned, this module should not be unloaded and doing such may risk
putting the module into an uncontrollable state.

**Kind**: instance abstract method of [<code>CmdScheduling</code>](#CmdScheduling)  
**Returns**: <code>boolean</code> - True if can be unloaded, false if cannot.  
**Access**: public  
<a name="CmdScheduling..ScheduledCommand"></a>

### CmdScheduling~ScheduledCommand
Stores information about a specific command that is scheduled.

**Kind**: inner class of [<code>CmdScheduling</code>](#CmdScheduling)  
**Access**: public  
**Properties**

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| cmd | <code>string</code> |  | The command to run. |
| channel | <code>Discord~TextChannel</code> |  | The channel or channel ID of where to run the command. |
| channelId | <code>string</code> \| <code>number</code> |  | The id of the channel where the message was  sent. |
| message | <code>Discord~Message</code> |  | The message that created this scheduled command, or null if the message was deleted. |
| messageId | <code>string</code> \| <code>number</code> |  | The id of the message sent. |
| time | <code>number</code> |  | The Unix timestamp at which to run the command. |
| [repeatDelay] | <code>number</code> | <code>0</code> | The delay in milliseconds at which to run the command again. 0 to not repeat. |
| id | <code>string</code> |  | Random base 36, 3-character long id of this command. |
| complete | <code>boolean</code> |  | True if the command has been run, and will not run again. |
| timeout | <code>Timeout</code> |  | The current timeout registered to run the command. |
| member | <code>Discord~GuildMember</code> |  | The author of this ScheduledCommand. |
| memberId | <code>string</code> \| <code>number</code> |  | The id of the member. |


* [~ScheduledCommand](#CmdScheduling..ScheduledCommand)
    * [new ScheduledCommand(cmd, channel, message, time, repeatDelay)](#new_CmdScheduling..ScheduledCommand_new)
    * _instance_
        * [.go()](#CmdScheduling..ScheduledCommand+go)
        * [.cancel()](#CmdScheduling..ScheduledCommand+cancel)
        * [.setTimeout()](#CmdScheduling..ScheduledCommand+setTimeout)
        * [.toJSON()](#CmdScheduling..ScheduledCommand+toJSON) ⇒ <code>Object</code>
    * _inner_
        * [~getReferences()](#CmdScheduling..ScheduledCommand..getReferences) ℗

<a name="new_CmdScheduling..ScheduledCommand_new"></a>

#### new ScheduledCommand(cmd, channel, message, time, repeatDelay)

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| cmd | <code>string</code> \| <code>Object</code> |  | The command to run, or an object instance of this class (exported using toJSON, then parsed into an object). |
| channel | <code>string</code> \| <code>number</code> \| <code>Discord~TextChannel</code> |  | The channel or channel ID of where to run the command. |
| message | <code>string</code> \| <code>number</code> \| <code>Discord~Message</code> |  | The message or message ID that created this scheduled command. |
| time | <code>number</code> |  | The Unix timestamp at which to run the command. |
| repeatDelay | <code>number</code> | <code>0</code> | The delay in milliseconds at which to run the command again, or null if it does not repeat. |

<a name="CmdScheduling..ScheduledCommand+go"></a>

#### scheduledCommand.go()
Trigger the command to be run immediately. Automatically fired at the
scheduled time. Does not cancel the normally scheduled command.
Re-schedules the command if the command should repeat.

**Kind**: instance method of [<code>ScheduledCommand</code>](#CmdScheduling..ScheduledCommand)  
**Access**: public  
<a name="CmdScheduling..ScheduledCommand+cancel"></a>

#### scheduledCommand.cancel()
Cancel this command and remove Timeout.

**Kind**: instance method of [<code>ScheduledCommand</code>](#CmdScheduling..ScheduledCommand)  
**Access**: public  
<a name="CmdScheduling..ScheduledCommand+setTimeout"></a>

#### scheduledCommand.setTimeout()
Schedule the Timeout event to call the command at the scheduled time.
If the scheduled time to run the command is more than 2 weeks in the
future,
the command is not scheduled, and this function must be called
manually
(less than 2 weeks) before the scheduled time for the command to run.

**Kind**: instance method of [<code>ScheduledCommand</code>](#CmdScheduling..ScheduledCommand)  
**Access**: public  
<a name="CmdScheduling..ScheduledCommand+toJSON"></a>

#### scheduledCommand.toJSON() ⇒ <code>Object</code>
Export the relevant data to recreate this object, as a JSON object.

**Kind**: instance method of [<code>ScheduledCommand</code>](#CmdScheduling..ScheduledCommand)  
**Returns**: <code>Object</code> - JSON formatted object.  
**Access**: public  
<a name="CmdScheduling..ScheduledCommand..getReferences"></a>

#### ScheduledCommand~getReferences() ℗
Update channel and message with their associated IDs.

**Kind**: inner method of [<code>ScheduledCommand</code>](#CmdScheduling..ScheduledCommand)  
**Access**: private  
<a name="CmdScheduling..longInterval"></a>

### CmdScheduling~longInterval : <code>Interval</code> ℗
Interval that runs every maxTimeout milliseconds in order to re-schedule
commands that were beyond the max timeout duration.

**Kind**: inner property of [<code>CmdScheduling</code>](#CmdScheduling)  
**Access**: private  
<a name="CmdScheduling..listeners"></a>

### CmdScheduling~listeners : <code>Object.&lt;Array.&lt;function()&gt;&gt;</code> ℗
Currently registered event listeners, mapped by event name.

**Kind**: inner property of [<code>CmdScheduling</code>](#CmdScheduling)  
**Access**: private  
<a name="CmdScheduling..schedules"></a>

### CmdScheduling~schedules : <code>Object.&lt;Array.&lt;CmdScheduling.ScheduledCommand&gt;&gt;</code> ℗
All of the currently loaded commands to run. Mapped by Guild ID, then
sorted arrays by time to run next command.

**Kind**: inner property of [<code>CmdScheduling</code>](#CmdScheduling)  
**Access**: private  
<a name="CmdScheduling..maxTimeout"></a>

### CmdScheduling~maxTimeout : <code>number</code> ℗
The maximum amount of time to set a Timeout for. The JS limit is 24 days
(iirc), after which, Timeouts do not work properly.

**Kind**: inner constant of [<code>CmdScheduling</code>](#CmdScheduling)  
**Default**: <code>14 Days</code>  
**Access**: private  
<a name="CmdScheduling..saveSubDir"></a>

### CmdScheduling~saveSubDir : <code>string</code> ℗
The filename in the guild directory to save the scheduled commands.

**Kind**: inner constant of [<code>CmdScheduling</code>](#CmdScheduling)  
**Default**: <code>&quot;/scheduledCmds.json&quot;</code>  
**Access**: private  
<a name="CmdScheduling..idChars"></a>

### CmdScheduling~idChars : <code>string</code> ℗
The possible characters that can make up an ID of a scheduled command.

**Kind**: inner constant of [<code>CmdScheduling</code>](#CmdScheduling)  
**Default**: <code>&quot;0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ&quot;</code>  
**Access**: private  
<a name="CmdScheduling..embedColor"></a>

### CmdScheduling~embedColor : <code>Array.&lt;number&gt;</code> ℗
The color to use for embeds sent from this submodule.

**Kind**: inner constant of [<code>CmdScheduling</code>](#CmdScheduling)  
**Default**: <code>[50,255,255]</code>  
**Access**: private  
<a name="CmdScheduling..registerScheduledCommand"></a>

### CmdScheduling~registerScheduledCommand(sCmd) ℗
Register a created [CmdScheduling.ScheduledCommand](CmdScheduling.ScheduledCommand).

**Kind**: inner method of [<code>CmdScheduling</code>](#CmdScheduling)  
**Emits**: <code>CmdScheduling#event:commandRegistered</code>  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| sCmd | <code>CmdScheduling.ScheduledCommand</code> | The ScheduledCommand object to register. |

<a name="CmdScheduling..commandSchedule"></a>

### CmdScheduling~commandSchedule(msg) : [<code>commandHandler</code>](#commandHandler) ℗
Allow user to schedule command to be run, or view currently scheduled
commands.

**Kind**: inner method of [<code>CmdScheduling</code>](#CmdScheduling)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord~Message</code> | Message that triggered command. |

<a name="CmdScheduling..sortGuildCommands"></a>

### CmdScheduling~sortGuildCommands(id) ℗
Sort all scheduled commands in a guild by the next time they will run.

**Kind**: inner method of [<code>CmdScheduling</code>](#CmdScheduling)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>string</code> \| <code>number</code> | The guild id of which to sort the commands. |

<a name="CmdScheduling..stringToMilliseconds"></a>

### CmdScheduling~stringToMilliseconds(str) ⇒ <code>number</code> ℗
Given a user-inputted string, convert to a number of milliseconds. Input
can be on most common time units up to a week.

**Kind**: inner method of [<code>CmdScheduling</code>](#CmdScheduling)  
**Returns**: <code>number</code> - Number of milliseconds parsed from string.  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| str | <code>string</code> | The input string to parse. |

<a name="CmdScheduling..stringToMilliseconds..numberToUnit"></a>

#### stringToMilliseconds~numberToUnit(num, unit) ⇒ <code>number</code> ℗
Convert a number and a unit to the corresponding number of milliseconds.

**Kind**: inner method of [<code>stringToMilliseconds</code>](#CmdScheduling..stringToMilliseconds)  
**Returns**: <code>number</code> - The given number in milliseconds.  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| num | <code>number</code> | The number associated with the unit. |
| unit | <code>string</code> | The current unit associated with the num. |

<a name="CmdScheduling..getScheduledCommandsInGuild"></a>

### CmdScheduling~getScheduledCommandsInGuild(gId) ⇒ <code>null</code> \| <code>Array.&lt;CmdScheduling.ScheduledCommand&gt;</code>
Returns an array of references to scheduled commands in a guild.

**Kind**: inner method of [<code>CmdScheduling</code>](#CmdScheduling)  
**Returns**: <code>null</code> \| <code>Array.&lt;CmdScheduling.ScheduledCommand&gt;</code> - Null if none, or the array
of ScheduledCommands.  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| gId | <code>string</code> \| <code>number</code> | The guild id of which to get the commands. |

<a name="CmdScheduling..replyWithSchedule"></a>

### CmdScheduling~replyWithSchedule(msg) ℗
Find all scheduled commands for a certain guild, and reply to the message
with the list of commands.

**Kind**: inner method of [<code>CmdScheduling</code>](#CmdScheduling)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord~Message</code> | The message to reply to. |

<a name="CmdScheduling..cancelCmd"></a>

### CmdScheduling~cancelCmd(gId, cmdId) ⇒ <code>CmdScheduling.ScheduledCommand</code> ℗
Cancel a scheduled command in a guild.

**Kind**: inner method of [<code>CmdScheduling</code>](#CmdScheduling)  
**Returns**: <code>CmdScheduling.ScheduledCommand</code> - Null if failed, or object that
was cancelled.  
**Emits**: <code>CmdScheduling#event:commandCancelled</code>  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| gId | <code>string</code> \| <code>number</code> | The guild id of which to cancel the command. |
| cmdId | <code>string</code> \| <code>number</code> | The ID of the command to cancel. |

<a name="CmdScheduling..cancelAndReply"></a>

### CmdScheduling~cancelAndReply(msg) ℗
Find a scheduled command with the given ID, and remove it from commands to
run.

**Kind**: inner method of [<code>CmdScheduling</code>](#CmdScheduling)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord~Message</code> | The message to reply to. |

<a name="CmdScheduling..reScheduleCommands"></a>

### CmdScheduling~reScheduleCommands()
Reschedule all future commands that are beyond maxTimeout.

**Kind**: inner method of [<code>CmdScheduling</code>](#CmdScheduling)  
<a name="CmdScheduling..formatDelay"></a>

### CmdScheduling~formatDelay(msecs) ⇒ <code>string</code> ℗
Format a duration in milliseconds into a human readable string.

**Kind**: inner method of [<code>CmdScheduling</code>](#CmdScheduling)  
**Returns**: <code>string</code> - Formatted string.  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| msecs | <code>number</code> | Duration in milliseconds. |

<a name="CmdScheduling..fireEvent"></a>

### CmdScheduling~fireEvent(name) ℗
Fires a given event with the associacted data.

**Kind**: inner method of [<code>CmdScheduling</code>](#CmdScheduling)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | The name of the event to fire. |
| ...data | <code>\*</code> | The arguments to pass into the function calls. |

<a name="CmdScheduling..makeMessage"></a>

### CmdScheduling~makeMessage(uId, gId, cId, msg) ⇒ <code>Object</code> ℗
Forms a Discord~Message similar object from given IDs.

**Kind**: inner method of [<code>CmdScheduling</code>](#CmdScheduling)  
**Returns**: <code>Object</code> - The created message-like object.  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| uId | <code>string</code> | The id of the user who wrote this message. |
| gId | <code>string</code> | The id of the guild this message is in. |
| cId | <code>string</code> | The id of the channel this message was 'sent' in. |
| msg | <code>string</code> | The message content. |

<a name="Command"></a>

## Command ⇐ [<code>MainModule</code>](#MainModule)
Manages the command event firing for all commands. This is not a
normal submodule, and is treated differently in the SpikeyBot class.

**Kind**: global class  
**Extends**: [<code>MainModule</code>](#MainModule)  

* [Command](#Command) ⇐ [<code>MainModule</code>](#MainModule)
    * _instance_
        * [.SingleCommand](#Command+SingleCommand)
        * [.CommandSetting](#Command+CommandSetting)
        * ~~[.deleteEvent](#Command+deleteEvent)~~
        * [.helpMessage](#SubModule+helpMessage) : <code>string</code> \| <code>Discord~MessageEmbed</code>
        * *[.postPrefix](#SubModule+postPrefix) : <code>string</code>*
        * [.Discord](#SubModule+Discord) : <code>Discord</code>
        * [.client](#SubModule+client) : <code>Discord~Client</code>
        * [.command](#SubModule+command) : [<code>Command</code>](#Command)
        * [.common](#SubModule+common) : [<code>Common</code>](#Common)
        * [.bot](#SubModule+bot) : [<code>SpikeyBot</code>](#SpikeyBot)
        * [.myName](#SubModule+myName) : <code>string</code>
        * [.initialized](#SubModule+initialized) : <code>boolean</code>
        * [.commit](#SubModule+commit) : <code>string</code>
        * [.loadTime](#SubModule+loadTime) : <code>number</code>
        * [.getUserSettings(gId)](#Command+getUserSettings) ⇒ <code>Object.&lt;CommandSetting&gt;</code>
        * [.getDefaultSettings()](#Command+getDefaultSettings) ⇒ <code>Object.&lt;SingleCommand&gt;</code>
        * [.trigger(msg, [msg2])](#Command+trigger) ⇒ <code>boolean</code>
        * [.on(cmd, [cb], [onlyserver])](#Command+on)
        * [.removeListener(cmd)](#Command+removeListener)
        * [.find(cmd, msg, [setCmd])](#Command+find) ⇒ [<code>SingleCommand</code>](#Command..SingleCommand)
        * [.findAll(cmd, msg)](#Command+findAll) ⇒ [<code>Array.&lt;SingleCommand&gt;</code>](#Command..SingleCommand)
        * [.validate(cmd, msg, [func])](#Command+validate) ⇒ <code>string</code>
        * [.getAllNames()](#Command+getAllNames) ⇒ <code>Array.&lt;string&gt;</code>
        * [.addEventListener(name, handler)](#Command+addEventListener)
        * [.removeEventListener(name, handler)](#Command+removeEventListener)
        * [.fire(name, args)](#Command+fire)
        * [.import(data)](#MainModule+import)
        * [.export()](#MainModule+export) ⇒ [<code>ModuleData</code>](#MainModule..ModuleData)
        * *[.terminate()](#MainModule+terminate)*
        * [.initialize()](#SubModule+initialize)
        * [.begin(Discord, client, command, common, bot)](#SubModule+begin)
        * [.end()](#SubModule+end)
        * [.log(msg)](#SubModule+log)
        * [.debug(msg)](#SubModule+debug)
        * [.warn(msg)](#SubModule+warn)
        * [.error(msg)](#SubModule+error)
        * [.shutdown()](#SubModule+shutdown)
        * [.save([opt])](#SubModule+save)
        * *[.unloadable()](#SubModule+unloadable) ⇒ <code>boolean</code>*
    * _inner_
        * [~SingleCommand](#Command..SingleCommand)
            * [new SingleCommand(cmd, handler, [opts], [subCmds])](#new_Command..SingleCommand_new)
            * [.parentName](#Command..SingleCommand+parentName) : <code>string</code>
            * [.aliases](#Command..SingleCommand+aliases) : <code>Array.&lt;string&gt;</code>
            * [.subCmds](#Command..SingleCommand+subCmds) : <code>Object.&lt;SingleCommand&gt;</code>
            * [.options](#Command..SingleCommand+options) : [<code>CommandSetting</code>](#Command..CommandSetting)
            * [.updateParentName(to)](#Command..SingleCommand+updateParentName)
            * [.getFullName()](#Command..SingleCommand+getFullName) ⇒ <code>string</code>
            * [.getName()](#Command..SingleCommand+getName) ⇒ <code>string</code>
            * [.trigger(msg)](#Command..SingleCommand+trigger)
            * [.getUserOptions()](#Command..SingleCommand+getUserOptions) ⇒ <code>Object.&lt;CommandSetting&gt;</code>
        * [~CommandSetting](#Command..CommandSetting)
            * [new CommandSetting([opts])](#new_Command..CommandSetting_new)
            * [.myGuild](#Command..CommandSetting+myGuild) : <code>string</code>
            * [.validOnlyInGuild](#Command..CommandSetting+validOnlyInGuild) : <code>boolean</code>
            * [.defaultDisabled](#Command..CommandSetting+defaultDisabled)
            * [.disabled](#Command..CommandSetting+disabled) : <code>Object</code>
            * [.enabled](#Command..CommandSetting+enabled) : <code>Object</code>
            * [.permissions](#Command..CommandSetting+permissions) : <code>number</code>
            * [.set(value, type, id, [id2])](#Command..CommandSetting+set)
            * [.isDisabled(msg)](#Command..CommandSetting+isDisabled) ⇒ <code>number</code>
                * [~findMatch(search, data)](#Command..CommandSetting+isDisabled..findMatch) ⇒ <code>number</code> ℗
            * [.toJSON()](#Command..CommandSetting+toJSON) ⇒ <code>Object</code>
        * [~eventList](#Command..eventList)
        * [~cmds](#Command..cmds) : <code>Object.&lt;SingleCommand&gt;</code> ℗
        * [~userSettings](#Command..userSettings) : <code>Object.&lt;Object.&lt;CommandSetting&gt;&gt;</code> ℗
        * [~onlyservermessage](#Command..onlyservermessage) : <code>string</code> ℗
        * [~commandSettingsFile](#Command..commandSettingsFile) : <code>string</code> ℗
        * [~commandDisable(msg)](#Command..commandDisable) : <code>Command~commandHandler</code> ℗
        * [~commandEnable(msg)](#Command..commandEnable) : <code>Command~commandHandler</code> ℗
        * [~commandShow(msg)](#Command..commandShow) : <code>Command~commandHandler</code> ℗
        * [~commandReset(msg)](#Command..commandReset) : <code>Command~commandHandler</code> ℗

<a name="Command+SingleCommand"></a>

### command.SingleCommand
**Kind**: instance property of [<code>Command</code>](#Command)  
**See**: [SingleCommand](#Command..SingleCommand)  
<a name="Command+CommandSetting"></a>

### command.CommandSetting
**Kind**: instance property of [<code>Command</code>](#Command)  
**See**: [CommandSetting](#Command..CommandSetting)  
<a name="Command+deleteEvent"></a>

### ~~command.deleteEvent~~
***Deprecated***

Alias for [Command.removeListener](Command.removeListener)

**Kind**: instance property of [<code>Command</code>](#Command)  
**Access**: public  
<a name="SubModule+helpMessage"></a>

### command.helpMessage : <code>string</code> \| <code>Discord~MessageEmbed</code>
The help message to show the user in the main help message.

**Kind**: instance property of [<code>Command</code>](#Command)  
<a name="SubModule+postPrefix"></a>

### *command.postPrefix : <code>string</code>*
The postfix for the global prefix for this subModule. Must be defined
before begin(), otherwise it is ignored.

**Kind**: instance abstract property of [<code>Command</code>](#Command)  
**Default**: <code>&quot;&quot;</code>  
<a name="SubModule+Discord"></a>

### command.Discord : <code>Discord</code>
The current Discord object instance of the bot.

**Kind**: instance property of [<code>Command</code>](#Command)  
<a name="SubModule+client"></a>

### command.client : <code>Discord~Client</code>
The current bot client.

**Kind**: instance property of [<code>Command</code>](#Command)  
<a name="SubModule+command"></a>

### command.command : [<code>Command</code>](#Command)
The command object for registering command listeners.

**Kind**: instance property of [<code>Command</code>](#Command)  
<a name="SubModule+common"></a>

### command.common : [<code>Common</code>](#Common)
The common object.

**Kind**: instance property of [<code>Command</code>](#Command)  
<a name="SubModule+bot"></a>

### command.bot : [<code>SpikeyBot</code>](#SpikeyBot)
The parent SpikeyBot instance.

**Kind**: instance property of [<code>Command</code>](#Command)  
<a name="SubModule+myName"></a>

### command.myName : <code>string</code>
The name of this submodule. Used for differentiating in the log. Should be
defined before begin().

**Kind**: instance property of [<code>Command</code>](#Command)  
**Overrides**: [<code>myName</code>](#SubModule+myName)  
**Access**: protected  
<a name="SubModule+initialized"></a>

### command.initialized : <code>boolean</code>
Has this subModule been initialized yet (Has begin() been called).

**Kind**: instance property of [<code>Command</code>](#Command)  
**Default**: <code>false</code>  
**Access**: protected  
**Read only**: true  
<a name="SubModule+commit"></a>

### command.commit : <code>string</code>
The commit at HEAD at the time this module was loaded. Essentially the
version of this submodule.

**Kind**: instance constant of [<code>Command</code>](#Command)  
**Access**: public  
<a name="SubModule+loadTime"></a>

### command.loadTime : <code>number</code>
The time at which this madule was loaded for use in checking if the module
needs to be reloaded because the file has been modified since loading.

**Kind**: instance constant of [<code>Command</code>](#Command)  
**Access**: public  
<a name="Command+getUserSettings"></a>

### command.getUserSettings(gId) ⇒ <code>Object.&lt;CommandSetting&gt;</code>
Fetch all user-defined settings for a guild.

**Kind**: instance method of [<code>Command</code>](#Command)  
**Returns**: <code>Object.&lt;CommandSetting&gt;</code> - The settings for the guild mapped by
command name.  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| gId | <code>string</code> | THe guild id of which to fetch the settings. |

<a name="Command+getDefaultSettings"></a>

### command.getDefaultSettings() ⇒ <code>Object.&lt;SingleCommand&gt;</code>
Fetch all commands and their default setting values.

**Kind**: instance method of [<code>Command</code>](#Command)  
**Returns**: <code>Object.&lt;SingleCommand&gt;</code> - All currently registered commands.  
**Access**: public  
**See**: [cmds](#Command..cmds)  
<a name="Command+trigger"></a>

### command.trigger(msg, [msg2]) ⇒ <code>boolean</code>
Trigger a command firing and call it's handler passing in msg as only
argument.

**Kind**: instance method of [<code>Command</code>](#Command)  
**Returns**: <code>boolean</code> - True if command was handled by us.  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord~Message</code> \| <code>string</code> | Message received from Discord to pass to handler and to use to find the correct handler, OR a string to override the command to trigger from msg. |
| [msg2] | <code>Discord~Message</code> | The message received from Discord if the first argument is a string. |

<a name="Command+on"></a>

### command.on(cmd, [cb], [onlyserver])
Registers a listener for a command.

**Kind**: instance method of [<code>Command</code>](#Command)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| cmd | <code>string</code> \| <code>Array.&lt;string&gt;</code> \| [<code>SingleCommand</code>](#Command..SingleCommand) |  | Command to listen for. |
| [cb] | [<code>commandHandler</code>](#commandHandler) |  | Function to call when command is triggered. |
| [onlyserver] | <code>boolean</code> | <code>false</code> | Whether the command is only allowed on a server. |

<a name="Command+removeListener"></a>

### command.removeListener(cmd)
Remove listener for a command.

**Kind**: instance method of [<code>Command</code>](#Command)  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| cmd | <code>string</code> \| <code>Array.&lt;string&gt;</code> | Command or alias of command to remove listener for. |

<a name="Command+find"></a>

### command.find(cmd, msg, [setCmd]) ⇒ [<code>SingleCommand</code>](#Command..SingleCommand)
Returns the callback function for the given event.

**Kind**: instance method of [<code>Command</code>](#Command)  
**Returns**: [<code>SingleCommand</code>](#Command..SingleCommand) - The single command object reference, or
null if it could not be found.  
**Access**: public  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| cmd | <code>string</code> |  | Command to force search for, and ignore command that could be matched with msg. |
| msg | <code>Discord~Message</code> |  | Message that is to trigger this command. This object will be updated with the command name that was found as msg.cmd. |
| [setCmd] | <code>boolean</code> | <code>false</code> | Set the cmd variable in the msg object to match the found command. |

<a name="Command+findAll"></a>

### command.findAll(cmd, msg) ⇒ [<code>Array.&lt;SingleCommand&gt;</code>](#Command..SingleCommand)
Returns all the callback functions for the given event with wildcards
allowed.

**Kind**: instance method of [<code>Command</code>](#Command)  
**Returns**: [<code>Array.&lt;SingleCommand&gt;</code>](#Command..SingleCommand) - The command object references, or an
empty array if it could not be found.  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| cmd | <code>string</code> | Command and subcommands to search for without guild prefixes. |
| msg | <code>Discord~Message</code> | Message object to use to remove command prefix if it exist. |

<a name="Command+validate"></a>

### command.validate(cmd, msg, [func]) ⇒ <code>string</code>
Checks that the given command can be run with the given context. Does not
actually fire the event.

**Kind**: instance method of [<code>Command</code>](#Command)  
**Returns**: <code>string</code> - Message causing failure, or null if valid.  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| cmd | <code>string</code> | The command to validate. Null to use msg to find the command to validate. |
| msg | <code>Discord~Message</code> | The message that will fire the event. If null, checks for channel and guild specific changes will not be validated. |
| [func] | [<code>SingleCommand</code>](#Command..SingleCommand) | A command handler override to use for settings lookup. If this is not specified, the handler associated with cmd will be fetched. |

<a name="Command+getAllNames"></a>

### command.getAllNames() ⇒ <code>Array.&lt;string&gt;</code>
Fetches a list of all currently registered commands.

**Kind**: instance method of [<code>Command</code>](#Command)  
**Returns**: <code>Array.&lt;string&gt;</code> - Array of all registered commands.  
**Access**: public  
<a name="Command+addEventListener"></a>

### command.addEventListener(name, handler)
Register an event listener.

**Kind**: instance method of [<code>Command</code>](#Command)  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | The name of the event to listen for. |
| handler | <code>function</code> | The function to call when the event is fired. |

<a name="Command+removeEventListener"></a>

### command.removeEventListener(name, handler)
Remove an event listener.

**Kind**: instance method of [<code>Command</code>](#Command)  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | The name of the event to listen for. |
| handler | <code>function</code> | THe handler that is currently registered to listen on this event. |

<a name="Command+fire"></a>

### command.fire(name, args)
Fire all handlers listening for an event.

**Kind**: instance method of [<code>Command</code>](#Command)  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | The name of the event to fire. |
| args | <code>\*</code> | The arguments to pass to the handlers. |

<a name="MainModule+import"></a>

### command.import(data)
Imports data from a previous instance of this class in order to maintain
references to other objects and classes across reloads.

**Kind**: instance method of [<code>Command</code>](#Command)  
**Overrides**: [<code>import</code>](#MainModule+import)  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| data | [<code>ModuleData</code>](#MainModule..ModuleData) | The data that was exported previously, or null if no data to import. |

<a name="MainModule+export"></a>

### command.export() ⇒ [<code>ModuleData</code>](#MainModule..ModuleData)
Export data required to maintain the bot across reloading this module.
Expected to be returned directly to this.import once reloaded.

**Kind**: instance method of [<code>Command</code>](#Command)  
**Overrides**: [<code>export</code>](#MainModule+export)  
**Returns**: [<code>ModuleData</code>](#MainModule..ModuleData) - The data to be exported  
**Access**: public  
<a name="MainModule+terminate"></a>

### *command.terminate()*
Signal that the bot is shutting down and will not be restarting
immediately. This is triggered on all shutdowns where all MainModules and
SubModules will be unloaded.

**Kind**: instance abstract method of [<code>Command</code>](#Command)  
**Access**: public  
<a name="SubModule+initialize"></a>

### command.initialize()
The function called at the end of begin() for further initialization
specific to the subModule. Must be defined before begin() is called.

**Kind**: instance method of [<code>Command</code>](#Command)  
**Overrides**: [<code>initialize</code>](#SubModule+initialize)  
**Access**: protected  
<a name="SubModule+begin"></a>

### command.begin(Discord, client, command, common, bot)
Initialize this submodule.

**Kind**: instance method of [<code>Command</code>](#Command)  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| Discord | <code>Discord</code> | The Discord object for the API library. |
| client | <code>Discord~Client</code> | The client that represents this bot. |
| command | [<code>Command</code>](#Command) | The command instance in which to register command listeners. |
| common | [<code>Common</code>](#Common) | Class storing common functions. |
| bot | [<code>SpikeyBot</code>](#SpikeyBot) | The parent SpikeyBot instance. |

<a name="SubModule+end"></a>

### command.end()
Trigger subModule to shutdown and get ready for process terminating.

**Kind**: instance method of [<code>Command</code>](#Command)  
**Access**: public  
<a name="SubModule+log"></a>

### command.log(msg)
Log using common.log, but automatically set name.

**Kind**: instance method of [<code>Command</code>](#Command)  
**Access**: protected  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>string</code> | The message to log. |

<a name="SubModule+debug"></a>

### command.debug(msg)
Log using common.logDebug, but automatically set name.

**Kind**: instance method of [<code>Command</code>](#Command)  
**Access**: protected  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>string</code> | The message to log. |

<a name="SubModule+warn"></a>

### command.warn(msg)
Log using common.logWarning, but automatically set name.

**Kind**: instance method of [<code>Command</code>](#Command)  
**Access**: protected  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>string</code> | The message to log. |

<a name="SubModule+error"></a>

### command.error(msg)
Log using common.error, but automatically set name.

**Kind**: instance method of [<code>Command</code>](#Command)  
**Access**: protected  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>string</code> | The message to log. |

<a name="SubModule+shutdown"></a>

### command.shutdown()
Shutdown and disable this submodule. Removes all event listeners.

**Kind**: instance method of [<code>Command</code>](#Command)  
**Overrides**: [<code>shutdown</code>](#SubModule+shutdown)  
**Access**: protected  
<a name="SubModule+save"></a>

### command.save([opt])
Saves all data to files necessary for saving current state.

**Kind**: instance method of [<code>Command</code>](#Command)  
**Overrides**: [<code>save</code>](#SubModule+save)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [opt] | <code>string</code> | <code>&quot;&#x27;sync&#x27;&quot;</code> | Can be 'async', otherwise defaults to synchronous. |

<a name="SubModule+unloadable"></a>

### *command.unloadable() ⇒ <code>boolean</code>*
Check if this module is in a state that is ready to be unloaded. If false
is returned, this module should not be unloaded and doing such may risk
putting the module into an uncontrollable state.

**Kind**: instance abstract method of [<code>Command</code>](#Command)  
**Returns**: <code>boolean</code> - True if can be unloaded, false if cannot.  
**Access**: public  
<a name="Command..SingleCommand"></a>

### Command~SingleCommand
Object storing information about a single command, it's handler,
and default options.

**Kind**: inner class of [<code>Command</code>](#Command)  
**Access**: public  

* [~SingleCommand](#Command..SingleCommand)
    * [new SingleCommand(cmd, handler, [opts], [subCmds])](#new_Command..SingleCommand_new)
    * [.parentName](#Command..SingleCommand+parentName) : <code>string</code>
    * [.aliases](#Command..SingleCommand+aliases) : <code>Array.&lt;string&gt;</code>
    * [.subCmds](#Command..SingleCommand+subCmds) : <code>Object.&lt;SingleCommand&gt;</code>
    * [.options](#Command..SingleCommand+options) : [<code>CommandSetting</code>](#Command..CommandSetting)
    * [.updateParentName(to)](#Command..SingleCommand+updateParentName)
    * [.getFullName()](#Command..SingleCommand+getFullName) ⇒ <code>string</code>
    * [.getName()](#Command..SingleCommand+getName) ⇒ <code>string</code>
    * [.trigger(msg)](#Command..SingleCommand+trigger)
    * [.getUserOptions()](#Command..SingleCommand+getUserOptions) ⇒ <code>Object.&lt;CommandSetting&gt;</code>

<a name="new_Command..SingleCommand_new"></a>

#### new SingleCommand(cmd, handler, [opts], [subCmds])

| Param | Type | Description |
| --- | --- | --- |
| cmd | <code>string</code> \| <code>Array.&lt;string&gt;</code> | All commands the handler will fire on. |
| handler | [<code>commandHandler</code>](#commandHandler) | The event handler when the command has been triggered. |
| [opts] | <code>CommandSetting</code> | The options for this command. |
| [subCmds] | <code>SingleCommand</code> \| <code>Array.&lt;SingleCommand&gt;</code> | Sub commands that use this command as a fallback. Command names must be separated by white space in order to trigger the sub command. |

<a name="Command..SingleCommand+parentName"></a>

#### singleCommand.parentName : <code>string</code>
The name of the parent command if this is a subcommand.

**Kind**: instance property of [<code>SingleCommand</code>](#Command..SingleCommand)  
**Access**: public  
**Read only**: true  
<a name="Command..SingleCommand+aliases"></a>

#### singleCommand.aliases : <code>Array.&lt;string&gt;</code>
All versions of this command that may be used to trigger the same
handler.

**Kind**: instance property of [<code>SingleCommand</code>](#Command..SingleCommand)  
**Access**: public  
<a name="Command..SingleCommand+subCmds"></a>

#### singleCommand.subCmds : <code>Object.&lt;SingleCommand&gt;</code>
Sub commands for this single command. Triggered by commands separated by
whitespace. Object mapped by subcommand name, similar to {@link
Command~cmds}.

**Kind**: instance property of [<code>SingleCommand</code>](#Command..SingleCommand)  
**Access**: public  
<a name="Command..SingleCommand+options"></a>

#### singleCommand.options : [<code>CommandSetting</code>](#Command..CommandSetting)
The current options and settings for this command.

**Kind**: instance property of [<code>SingleCommand</code>](#Command..SingleCommand)  
**Access**: public  
<a name="Command..SingleCommand+updateParentName"></a>

#### singleCommand.updateParentName(to)
Update the parent name for this command and all child commands.

**Kind**: instance method of [<code>SingleCommand</code>](#Command..SingleCommand)  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| to | <code>string</code> | The parent name to set. |

<a name="Command..SingleCommand+getFullName"></a>

#### singleCommand.getFullName() ⇒ <code>string</code>
Get the full name for this command including parent command

**Kind**: instance method of [<code>SingleCommand</code>](#Command..SingleCommand)  
**Returns**: <code>string</code> - This command's name prefixed with the parent command's
name.  
<a name="Command..SingleCommand+getName"></a>

#### singleCommand.getName() ⇒ <code>string</code>
Get the primary key for this object. The first or only value passed in
for `cmd`, and may be used to show the user the command that this object
stores information about.

**Kind**: instance method of [<code>SingleCommand</code>](#Command..SingleCommand)  
**Returns**: <code>string</code> - The command string.  
**Access**: public  
<a name="Command..SingleCommand+trigger"></a>

#### singleCommand.trigger(msg)
The function to call when this command has been triggered.

**Kind**: instance method of [<code>SingleCommand</code>](#Command..SingleCommand)  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord~Message</code> | The message that is triggering this command. |

<a name="Command..SingleCommand+getUserOptions"></a>

#### singleCommand.getUserOptions() ⇒ <code>Object.&lt;CommandSetting&gt;</code>
Fetches the user options for this command, taking into account this could
be a subcommand.

**Kind**: instance method of [<code>SingleCommand</code>](#Command..SingleCommand)  
**Returns**: <code>Object.&lt;CommandSetting&gt;</code> - The settings for this command or
sub-command mapped by guild ids.  
**Access**: public  
<a name="Command..CommandSetting"></a>

### Command~CommandSetting
Stores all settings related to a command.

**Kind**: inner class of [<code>Command</code>](#Command)  
**Access**: public  

* [~CommandSetting](#Command..CommandSetting)
    * [new CommandSetting([opts])](#new_Command..CommandSetting_new)
    * [.myGuild](#Command..CommandSetting+myGuild) : <code>string</code>
    * [.validOnlyInGuild](#Command..CommandSetting+validOnlyInGuild) : <code>boolean</code>
    * [.defaultDisabled](#Command..CommandSetting+defaultDisabled)
    * [.disabled](#Command..CommandSetting+disabled) : <code>Object</code>
    * [.enabled](#Command..CommandSetting+enabled) : <code>Object</code>
    * [.permissions](#Command..CommandSetting+permissions) : <code>number</code>
    * [.set(value, type, id, [id2])](#Command..CommandSetting+set)
    * [.isDisabled(msg)](#Command..CommandSetting+isDisabled) ⇒ <code>number</code>
        * [~findMatch(search, data)](#Command..CommandSetting+isDisabled..findMatch) ⇒ <code>number</code> ℗
    * [.toJSON()](#Command..CommandSetting+toJSON) ⇒ <code>Object</code>

<a name="new_Command..CommandSetting_new"></a>

#### new CommandSetting([opts])

| Param | Type | Description |
| --- | --- | --- |
| [opts] | [<code>CommandSetting</code>](#Command..CommandSetting) | The options to set, or nothing for default values. |

<a name="Command..CommandSetting+myGuild"></a>

#### commandSetting.myGuild : <code>string</code>
The guild ID of the guild is settings object is for, or null if this
instance is not specific to a single guild.

**Kind**: instance property of [<code>CommandSetting</code>](#Command..CommandSetting)  
**Access**: public  
<a name="Command..CommandSetting+validOnlyInGuild"></a>

#### commandSetting.validOnlyInGuild : <code>boolean</code>
If the command is only allowed to be used in guilds.

**Kind**: instance property of [<code>CommandSetting</code>](#Command..CommandSetting)  
**Access**: public  
<a name="Command..CommandSetting+defaultDisabled"></a>

#### commandSetting.defaultDisabled
Whether this command is disabled for all by default and requires them to
be in the list of enabled IDs. If this is false, the command is enabled
for everyone, unless they fall under the 'disabled' list.

**Kind**: instance property of [<code>CommandSetting</code>](#Command..CommandSetting)  
<a name="Command..CommandSetting+disabled"></a>

#### commandSetting.disabled : <code>Object</code>
The IDs of all places where this command is currently disabled. Any ID
will be mapped to a truthy value. Roles will be mapped to the guild ID
and the role ID. Use [Command~CommandSetting.set](Command~CommandSetting.set) to change these
values.

**Kind**: instance property of [<code>CommandSetting</code>](#Command..CommandSetting)  
**Access**: public  
**Read only**: true  
<a name="Command..CommandSetting+enabled"></a>

#### commandSetting.enabled : <code>Object</code>
The IDs of all places where this command is currently enabled. Any ID
will be mapped to a truthy value. Roles will be mapped to the guild ID
and the role ID. Use [Command~CommandSetting.set](Command~CommandSetting.set) to change these
values.

**Kind**: instance property of [<code>CommandSetting</code>](#Command..CommandSetting)  
**Access**: public  
**Read only**: true  
<a name="Command..CommandSetting+permissions"></a>

#### commandSetting.permissions : <code>number</code>
Bitfield representation of the required permissions for a user to have to
run this command. Same bitfield used by Discord~Permissions.

**Kind**: instance property of [<code>CommandSetting</code>](#Command..CommandSetting)  
**Default**: <code>0</code>  
**Access**: public  
<a name="Command..CommandSetting+set"></a>

#### commandSetting.set(value, type, id, [id2])
Enable, disable, or neutralize this command for the associated guild,
channel, user, or role.

**Kind**: instance method of [<code>CommandSetting</code>](#Command..CommandSetting)  
**Emits**: <code>Command.events#event:settingsChanged</code>  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| value | <code>string</code> | `enabled`|`disabled`|`default` Whether to set this ID to enabled, disabled, or to whatever the default value is. |
| type | <code>string</code> | `guild`|`channel`|`user`|`role` The type of ID that is being given. |
| id | <code>string</code> | The id to set the value to. |
| [id2] | <code>string</code> | The guild ID if `type` is 'role', of where the role is created. |

<a name="Command..CommandSetting+isDisabled"></a>

#### commandSetting.isDisabled(msg) ⇒ <code>number</code>
Check if this command is disabled with the given context.

**Kind**: instance method of [<code>CommandSetting</code>](#Command..CommandSetting)  
**Returns**: <code>number</code> - 0 if not disabled, 2 if disabled is specific to user, 1
if disabled for any other reason.  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord~Message</code> | The message with the current context of which to check if the command is disabled. |

<a name="Command..CommandSetting+isDisabled..findMatch"></a>

##### isDisabled~findMatch(search, data) ⇒ <code>number</code> ℗
Searches the given object against the reference data to see if they
find any matching IDs.

**Kind**: inner method of [<code>isDisabled</code>](#Command..CommandSetting+isDisabled)  
**Returns**: <code>number</code> - 0 if not disabled, 2 if disabled is specific to user,
1 if disabled for any other reason.  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| search | <code>Command~CommandSetting.disabled</code> \| <code>Command~CommandSetting.enabled</code> | The search data. |
| data | <code>Discord~Message</code> | The context to search for. |

<a name="Command..CommandSetting+toJSON"></a>

#### commandSetting.toJSON() ⇒ <code>Object</code>
Creates a JSON formatted object with the necessary properties for
re-creating this object.

**Kind**: instance method of [<code>CommandSetting</code>](#Command..CommandSetting)  
**Returns**: <code>Object</code> - Object ready to be stringified for file saving.  
**Access**: public  
<a name="Command..eventList"></a>

### Command~eventList
Currently registered event listeners for non-command events.

**Kind**: inner property of [<code>Command</code>](#Command)  
<a name="Command..cmds"></a>

### Command~cmds : <code>Object.&lt;SingleCommand&gt;</code> ℗
All tracked commands mapped by command name.

**Kind**: inner property of [<code>Command</code>](#Command)  
**Access**: private  
<a name="Command..userSettings"></a>

### Command~userSettings : <code>Object.&lt;Object.&lt;CommandSetting&gt;&gt;</code> ℗
Specific settings defined by users as restrictions on commands. Mapped by
guild id, then by the command.

**Kind**: inner property of [<code>Command</code>](#Command)  
**Access**: private  
<a name="Command..onlyservermessage"></a>

### Command~onlyservermessage : <code>string</code> ℗
The message to send to the user if they attempt a server-only command in a
non-server channel.

**Kind**: inner constant of [<code>Command</code>](#Command)  
**Access**: private  
<a name="Command..commandSettingsFile"></a>

### Command~commandSettingsFile : <code>string</code> ℗
Filename in the guild's subdirectory where command settings are stored.

**Kind**: inner constant of [<code>Command</code>](#Command)  
**Default**: <code>&quot;/commandSettings.json&quot;</code>  
**Access**: private  
<a name="Command..commandDisable"></a>

### Command~commandDisable(msg) : <code>Command~commandHandler</code> ℗
Allow user to disable a command.

**Kind**: inner method of [<code>Command</code>](#Command)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord~Message</code> | The message the user sent that triggered this. |

<a name="Command..commandEnable"></a>

### Command~commandEnable(msg) : <code>Command~commandHandler</code> ℗
Allow user to enable a command.

**Kind**: inner method of [<code>Command</code>](#Command)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord~Message</code> | The message the user sent that triggered this. |

<a name="Command..commandShow"></a>

### Command~commandShow(msg) : <code>Command~commandHandler</code> ℗
Show user the currently configured settings for commands.

**Kind**: inner method of [<code>Command</code>](#Command)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord~Message</code> | The message the user sent that triggered this. |

<a name="Command..commandReset"></a>

### Command~commandReset(msg) : <code>Command~commandHandler</code> ℗
Reset all custom command settings to default.

**Kind**: inner method of [<code>Command</code>](#Command)  
**Emits**: <code>Command.events#event:settingsReset</code>  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord~Message</code> | The message the user sent that triggered this. |

<a name="Common"></a>

## Common
**Kind**: global class  

* [Common](#Common)
    * [new Common()](#new_Common_new)
    * _instance_
        * [.isRelease](#Common+isRelease) : <code>boolean</code>
        * [.isTest](#Common+isTest) : <code>boolean</code>
        * [.spikeyId](#Common+spikeyId) : <code>string</code>
        * [.logChannel](#Common+logChannel) : <code>string</code>
        * [.webURL](#Common+webURL) : <code>string</code>
        * [.guildSaveDir](#Common+guildSaveDir) : <code>string</code>
        * [.userSaveDir](#Common+userSaveDir) : <code>string</code>
        * [.begin(isTest, isRelease)](#Common+begin)
        * [.padIp(str)](#Common+padIp) ⇒ <code>string</code>
        * [.getIPName(ip)](#Common+getIPName) ⇒ <code>string</code>
        * [.updatePrefix(ip)](#Common+updatePrefix) ⇒ <code>string</code>
        * [.logDebug(message, ip, [traceIncrease])](#Common+logDebug)
        * [.log(message, ip, [traceIncrease])](#Common+log)
        * [.logWarning(message, ip, [traceIncrease])](#Common+logWarning)
        * [.error(message, ip, [traceIncrease])](#Common+error)
        * [.reply(msg, text, [post])](#Common+reply) ⇒ <code>Promise</code>
        * [.mention(msg)](#Common+mention) ⇒ <code>string</code>
    * _static_
        * [.mention](#Common.mention) ⇒ <code>string</code>
        * [.spikeyId](#Common.spikeyId) : <code>string</code>
        * [.logChannel](#Common.logChannel) : <code>string</code>
        * [.webURL](#Common.webURL) : <code>string</code>
        * [.guildSaveDir](#Common.guildSaveDir) : <code>string</code>
        * [.userSaveDir](#Common.userSaveDir) : <code>string</code>
    * _inner_
        * [~mycolor](#Common..mycolor) : <code>number</code> ℗
        * [~title](#Common..title) : <code>string</code> ℗
        * [~prefixLength](#Common..prefixLength) : <code>number</code> ℗
        * [~app](#Common..app) : <code>string</code> ℗
        * [~getTrace([traceIncrease])](#Common..getTrace) ⇒ <code>string</code> ℗
        * [~__line([inc])](#Common..__line) ⇒ <code>number</code> ℗
        * [~__filename([inc])](#Common..__filename) ⇒ <code>string</code> ℗

<a name="new_Common_new"></a>

### new Common()
Commonly required things. Helper functions and constants.

<a name="Common+isRelease"></a>

### common.isRelease : <code>boolean</code>
Whether this should be shown as a release version, or a debug version in
the log.

**Kind**: instance property of [<code>Common</code>](#Common)  
<a name="Common+isTest"></a>

### common.isTest : <code>boolean</code>
Whether this current instance is running as a unit test.

**Kind**: instance property of [<code>Common</code>](#Common)  
<a name="Common+spikeyId"></a>

### common.spikeyId : <code>string</code>
SpikeyRobot's Discord ID. If you are self-hosting SpikeyBot, change this to
your account ID to be able to give yourself full access to all features of
the bot.

**Kind**: instance constant of [<code>Common</code>](#Common)  
<a name="Common+logChannel"></a>

### common.logChannel : <code>string</code>
The channel id for the channel to send general log messages to.

**Kind**: instance constant of [<code>Common</code>](#Common)  
**Default**: <code>&quot;473935520821673991&quot;</code>  
<a name="Common+webURL"></a>

### common.webURL : <code>string</code>
The website base URL for pointing to for more help and documentation.

**Kind**: instance constant of [<code>Common</code>](#Common)  
**Default**: <code>&quot;https://www.spikeybot.com/&quot;</code>  
<a name="Common+guildSaveDir"></a>

### common.guildSaveDir : <code>string</code>
The root file directory for finding saved data related to individual
guilds.

**Kind**: instance constant of [<code>Common</code>](#Common)  
**Default**: <code>&quot;./save/guilds/&quot;</code>  
<a name="Common+userSaveDir"></a>

### common.userSaveDir : <code>string</code>
The root file directory for finding saved data related to individual
users.

**Kind**: instance constant of [<code>Common</code>](#Common)  
**Default**: <code>&quot;./save/users/&quot;</code>  
<a name="Common+begin"></a>

### common.begin(isTest, isRelease)
Initialize variables and settings for logging properly.

**Kind**: instance method of [<code>Common</code>](#Common)  

| Param | Type | Description |
| --- | --- | --- |
| isTest | <code>boolean</code> | Is this running as a test. |
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

<a name="Common+logDebug"></a>

### common.logDebug(message, ip, [traceIncrease])
Format a log message to be logged. Prefixed with DBG.

**Kind**: instance method of [<code>Common</code>](#Common)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| message | <code>string</code> |  | The message to display. |
| ip | <code>string</code> |  | The IP address or unique identifier of the client that caused this event to happen. |
| [traceIncrease] | <code>number</code> | <code>0</code> | Increase the distance up the stack to show the in the log. |

<a name="Common+log"></a>

### common.log(message, ip, [traceIncrease])
Format a log message to be logged.

**Kind**: instance method of [<code>Common</code>](#Common)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| message | <code>string</code> |  | The message to display. |
| ip | <code>string</code> |  | The IP address or unique identifier of the client that caused this event to happen. |
| [traceIncrease] | <code>number</code> | <code>0</code> | Increase the distance up the stack to show the in the log. |

<a name="Common+logWarning"></a>

### common.logWarning(message, ip, [traceIncrease])
Format a log message to be logged. Prefixed with WRN.

**Kind**: instance method of [<code>Common</code>](#Common)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| message | <code>string</code> |  | The message to display. |
| ip | <code>string</code> |  | The IP address or unique identifier of the client that caused this event to happen. |
| [traceIncrease] | <code>number</code> | <code>0</code> | Increase the distance up the stack to show the in the log. |

<a name="Common+error"></a>

### common.error(message, ip, [traceIncrease])
Format an error message to be logged.

**Kind**: instance method of [<code>Common</code>](#Common)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| message | <code>string</code> |  | The message to display. |
| ip | <code>string</code> |  | The IP address or unique identifier of the client that caused this event to happen. |
| [traceIncrease] | <code>number</code> | <code>0</code> | Increase the distance up the stack to show the in the log. |

<a name="Common+reply"></a>

### common.reply(msg, text, [post]) ⇒ <code>Promise</code>
Replies to the author and channel of msg with the given message.

**Kind**: instance method of [<code>Common</code>](#Common)  
**Returns**: <code>Promise</code> - Promise of Discord~Message that we attempted to send.  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord~Message</code> | Message to reply to. |
| text | <code>string</code> | The main body of the message. |
| [post] | <code>string</code> | The footer of the message. |

<a name="Common+mention"></a>

### common.mention(msg) ⇒ <code>string</code>
Creates formatted string for mentioning the author of msg.

**Kind**: instance method of [<code>Common</code>](#Common)  
**Returns**: <code>string</code> - Formatted mention string.  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord~Message</code> \| <code>Discord~UserResolvable</code> | Message to format a mention for the author of. |

<a name="Common.mention"></a>

### Common.mention ⇒ <code>string</code>
Creates formatted string for mentioning the author of msg.

**Kind**: static property of [<code>Common</code>](#Common)  
**Returns**: <code>string</code> - Formatted mention string.  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord~Message</code> | Message to format a mention for the author of. |

<a name="Common.spikeyId"></a>

### Common.spikeyId : <code>string</code>
SpikeyRobot's Discord ID

**Kind**: static constant of [<code>Common</code>](#Common)  
<a name="Common.logChannel"></a>

### Common.logChannel : <code>string</code>
The channel id for the channel to send general log messages to.

**Kind**: static constant of [<code>Common</code>](#Common)  
<a name="Common.webURL"></a>

### Common.webURL : <code>string</code>
The website base URL for pointing to for more help and documentation.

**Kind**: static constant of [<code>Common</code>](#Common)  
<a name="Common.guildSaveDir"></a>

### Common.guildSaveDir : <code>string</code>
The root file directory for finding saved data related to individual
guilds.

**Kind**: static constant of [<code>Common</code>](#Common)  
<a name="Common.userSaveDir"></a>

### Common.userSaveDir : <code>string</code>
The root file directory for finding saved data related to individual
users.

**Kind**: static constant of [<code>Common</code>](#Common)  
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
**Default**: <code>14</code>  
**Access**: private  
<a name="Common..app"></a>

### Common~app : <code>string</code> ℗
The script's filename to show in the log.

**Kind**: inner constant of [<code>Common</code>](#Common)  
**Access**: private  
<a name="Common..getTrace"></a>

### Common~getTrace([traceIncrease]) ⇒ <code>string</code> ℗
Gets the name and line number of the current function stack.

**Kind**: inner method of [<code>Common</code>](#Common)  
**Returns**: <code>string</code> - Formatted string with length 24.  
**Access**: private  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [traceIncrease] | <code>number</code> | <code>0</code> | Increase the distance up the stack to show the in the log. |

<a name="Common..__line"></a>

### Common~__line([inc]) ⇒ <code>number</code> ℗
Gets the line number of the function that called a log function.

**Kind**: inner method of [<code>Common</code>](#Common)  
**Returns**: <code>number</code> - Line number of call in stack.  
**Access**: private  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [inc] | <code>number</code> | <code>0</code> | Increase distance up the stack to return; |

<a name="Common..__filename"></a>

### Common~__filename([inc]) ⇒ <code>string</code> ℗
Gets the name of the file that called a log function.

**Kind**: inner method of [<code>Common</code>](#Common)  
**Returns**: <code>string</code> - Filename in call stack.  
**Access**: private  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [inc] | <code>number</code> | <code>0</code> | Increase distance up the stack to return; |

<a name="Connect4"></a>

## Connect4 ⇐ [<code>SubModule</code>](#SubModule)
Manages a Connect 4 game.

**Kind**: global class  
**Extends**: [<code>SubModule</code>](#SubModule)  

* [Connect4](#Connect4) ⇐ [<code>SubModule</code>](#SubModule)
    * _instance_
        * [.Game](#Connect4+Game)
            * [new this.Game(players, msg)](#new_Connect4+Game_new)
            * [.players](#Connect4+Game+players) : <code>Object</code>
            * [.board](#Connect4+Game+board) : <code>Array.&lt;Array.&lt;number&gt;&gt;</code>
            * [.turn](#Connect4+Game+turn) : <code>number</code>
            * [.msg](#Connect4+Game+msg) : <code>Discord~Message</code>
            * [.print([winner])](#Connect4+Game+print)
        * [.helpMessage](#SubModule+helpMessage) : <code>string</code> \| <code>Discord~MessageEmbed</code>
        * *[.postPrefix](#SubModule+postPrefix) : <code>string</code>*
        * [.Discord](#SubModule+Discord) : <code>Discord</code>
        * [.client](#SubModule+client) : <code>Discord~Client</code>
        * [.command](#SubModule+command) : [<code>Command</code>](#Command)
        * [.common](#SubModule+common) : [<code>Common</code>](#Common)
        * [.bot](#SubModule+bot) : [<code>SpikeyBot</code>](#SpikeyBot)
        * [.myName](#SubModule+myName) : <code>string</code>
        * [.initialized](#SubModule+initialized) : <code>boolean</code>
        * [.commit](#SubModule+commit) : <code>string</code>
        * [.loadTime](#SubModule+loadTime) : <code>number</code>
        * [.createGame(players, channel)](#Connect4+createGame)
        * [.initialize()](#SubModule+initialize)
        * [.begin(Discord, client, command, common, bot)](#SubModule+begin)
        * [.end()](#SubModule+end)
        * [.log(msg)](#SubModule+log)
        * [.debug(msg)](#SubModule+debug)
        * [.warn(msg)](#SubModule+warn)
        * [.error(msg)](#SubModule+error)
        * [.shutdown()](#SubModule+shutdown)
        * *[.save([opt])](#SubModule+save)*
        * [.unloadable()](#SubModule+unloadable) ⇒ <code>boolean</code>
    * _inner_
        * [~numGames](#Connect4..numGames) : <code>number</code> ℗
        * [~maxReactAwaitTime](#Connect4..maxReactAwaitTime) : <code>number</code> ℗
        * [~numRows](#Connect4..numRows) : <code>number</code> ℗
        * [~numCols](#Connect4..numCols) : <code>number</code> ℗
        * [~emoji](#Connect4..emoji) : <code>Object.&lt;string&gt;</code> ℗
        * [~commandConnect4(msg)](#Connect4..commandConnect4) : [<code>commandHandler</code>](#commandHandler) ℗
        * [~addReactions(msg, index)](#Connect4..addReactions) ℗
        * [~addListener(msg, game)](#Connect4..addListener) ℗
        * [~checkWin(board, latestR, latestC)](#Connect4..checkWin) ⇒ <code>number</code>

<a name="Connect4+Game"></a>

### connect4.Game
**Kind**: instance class of [<code>Connect4</code>](#Connect4)  
**Access**: public  

* [.Game](#Connect4+Game)
    * [new this.Game(players, msg)](#new_Connect4+Game_new)
    * [.players](#Connect4+Game+players) : <code>Object</code>
    * [.board](#Connect4+Game+board) : <code>Array.&lt;Array.&lt;number&gt;&gt;</code>
    * [.turn](#Connect4+Game+turn) : <code>number</code>
    * [.msg](#Connect4+Game+msg) : <code>Discord~Message</code>
    * [.print([winner])](#Connect4+Game+print)

<a name="new_Connect4+Game_new"></a>

#### new this.Game(players, msg)
Class that stores the current state of a connect 4 game.


| Param | Type | Description |
| --- | --- | --- |
| players | <code>Object</code> | The players in this game. |
| msg | <code>Discord~Message</code> | The message displaying the current game. |

<a name="Connect4+Game+players"></a>

#### game.players : <code>Object</code>
The players in this game.

**Kind**: instance property of [<code>Game</code>](#Connect4+Game)  
<a name="Connect4+Game+board"></a>

#### game.board : <code>Array.&lt;Array.&lt;number&gt;&gt;</code>
2D Array of a 7w x 6h board. 0 is nobody, 1 is player 1, 2 is player 2.

**Kind**: instance property of [<code>Game</code>](#Connect4+Game)  
<a name="Connect4+Game+turn"></a>

#### game.turn : <code>number</code>
Which player's turn it is. Either 1 or 2.

**Kind**: instance property of [<code>Game</code>](#Connect4+Game)  
<a name="Connect4+Game+msg"></a>

#### game.msg : <code>Discord~Message</code>
The message displaying the current game.

**Kind**: instance property of [<code>Game</code>](#Connect4+Game)  
<a name="Connect4+Game+print"></a>

#### game.print([winner])
Edit the current message to show the current board.

**Kind**: instance method of [<code>Game</code>](#Connect4+Game)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [winner] | <code>number</code> | <code>0</code> | The player who has won the game. 0 is game not done, 1 is player 1, 2 is player 2, 3 is draw. |

<a name="SubModule+helpMessage"></a>

### connect4.helpMessage : <code>string</code> \| <code>Discord~MessageEmbed</code>
The help message to show the user in the main help message.

**Kind**: instance property of [<code>Connect4</code>](#Connect4)  
<a name="SubModule+postPrefix"></a>

### *connect4.postPrefix : <code>string</code>*
The postfix for the global prefix for this subModule. Must be defined
before begin(), otherwise it is ignored.

**Kind**: instance abstract property of [<code>Connect4</code>](#Connect4)  
**Default**: <code>&quot;&quot;</code>  
<a name="SubModule+Discord"></a>

### connect4.Discord : <code>Discord</code>
The current Discord object instance of the bot.

**Kind**: instance property of [<code>Connect4</code>](#Connect4)  
<a name="SubModule+client"></a>

### connect4.client : <code>Discord~Client</code>
The current bot client.

**Kind**: instance property of [<code>Connect4</code>](#Connect4)  
<a name="SubModule+command"></a>

### connect4.command : [<code>Command</code>](#Command)
The command object for registering command listeners.

**Kind**: instance property of [<code>Connect4</code>](#Connect4)  
<a name="SubModule+common"></a>

### connect4.common : [<code>Common</code>](#Common)
The common object.

**Kind**: instance property of [<code>Connect4</code>](#Connect4)  
<a name="SubModule+bot"></a>

### connect4.bot : [<code>SpikeyBot</code>](#SpikeyBot)
The parent SpikeyBot instance.

**Kind**: instance property of [<code>Connect4</code>](#Connect4)  
<a name="SubModule+myName"></a>

### connect4.myName : <code>string</code>
The name of this submodule. Used for differentiating in the log. Should be
defined before begin().

**Kind**: instance property of [<code>Connect4</code>](#Connect4)  
**Overrides**: [<code>myName</code>](#SubModule+myName)  
**Access**: protected  
<a name="SubModule+initialized"></a>

### connect4.initialized : <code>boolean</code>
Has this subModule been initialized yet (Has begin() been called).

**Kind**: instance property of [<code>Connect4</code>](#Connect4)  
**Default**: <code>false</code>  
**Access**: protected  
**Read only**: true  
<a name="SubModule+commit"></a>

### connect4.commit : <code>string</code>
The commit at HEAD at the time this module was loaded. Essentially the
version of this submodule.

**Kind**: instance constant of [<code>Connect4</code>](#Connect4)  
**Access**: public  
<a name="SubModule+loadTime"></a>

### connect4.loadTime : <code>number</code>
The time at which this madule was loaded for use in checking if the module
needs to be reloaded because the file has been modified since loading.

**Kind**: instance constant of [<code>Connect4</code>](#Connect4)  
**Access**: public  
<a name="Connect4+createGame"></a>

### connect4.createGame(players, channel)
Create a game with the given players in a given text channel.

**Kind**: instance method of [<code>Connect4</code>](#Connect4)  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| players | <code>Object</code> | The players in the game. |
| channel | <code>Discord~TextChannel</code> | The text channel to send messages. |

<a name="SubModule+initialize"></a>

### connect4.initialize()
The function called at the end of begin() for further initialization
specific to the subModule. Must be defined before begin() is called.

**Kind**: instance method of [<code>Connect4</code>](#Connect4)  
**Overrides**: [<code>initialize</code>](#SubModule+initialize)  
**Access**: protected  
<a name="SubModule+begin"></a>

### connect4.begin(Discord, client, command, common, bot)
Initialize this submodule.

**Kind**: instance method of [<code>Connect4</code>](#Connect4)  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| Discord | <code>Discord</code> | The Discord object for the API library. |
| client | <code>Discord~Client</code> | The client that represents this bot. |
| command | [<code>Command</code>](#Command) | The command instance in which to register command listeners. |
| common | [<code>Common</code>](#Common) | Class storing common functions. |
| bot | [<code>SpikeyBot</code>](#SpikeyBot) | The parent SpikeyBot instance. |

<a name="SubModule+end"></a>

### connect4.end()
Trigger subModule to shutdown and get ready for process terminating.

**Kind**: instance method of [<code>Connect4</code>](#Connect4)  
**Access**: public  
<a name="SubModule+log"></a>

### connect4.log(msg)
Log using common.log, but automatically set name.

**Kind**: instance method of [<code>Connect4</code>](#Connect4)  
**Access**: protected  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>string</code> | The message to log. |

<a name="SubModule+debug"></a>

### connect4.debug(msg)
Log using common.logDebug, but automatically set name.

**Kind**: instance method of [<code>Connect4</code>](#Connect4)  
**Access**: protected  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>string</code> | The message to log. |

<a name="SubModule+warn"></a>

### connect4.warn(msg)
Log using common.logWarning, but automatically set name.

**Kind**: instance method of [<code>Connect4</code>](#Connect4)  
**Access**: protected  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>string</code> | The message to log. |

<a name="SubModule+error"></a>

### connect4.error(msg)
Log using common.error, but automatically set name.

**Kind**: instance method of [<code>Connect4</code>](#Connect4)  
**Access**: protected  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>string</code> | The message to log. |

<a name="SubModule+shutdown"></a>

### connect4.shutdown()
Shutdown and disable this submodule. Removes all event listeners.

**Kind**: instance method of [<code>Connect4</code>](#Connect4)  
**Overrides**: [<code>shutdown</code>](#SubModule+shutdown)  
**Access**: protected  
<a name="SubModule+save"></a>

### *connect4.save([opt])*
Saves all data to files necessary for saving current state.

**Kind**: instance abstract method of [<code>Connect4</code>](#Connect4)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [opt] | <code>string</code> | <code>&quot;&#x27;sync&#x27;&quot;</code> | Can be 'async', otherwise defaults to synchronous. |

<a name="SubModule+unloadable"></a>

### connect4.unloadable() ⇒ <code>boolean</code>
Check if this module is in a state that is ready to be unloaded. If false
is returned, this module should not be unloaded and doing such may risk
putting the module into an uncontrollable state.

**Kind**: instance method of [<code>Connect4</code>](#Connect4)  
**Overrides**: [<code>unloadable</code>](#SubModule+unloadable)  
**Returns**: <code>boolean</code> - True if can be unloaded, false if cannot.  
**Access**: public  
<a name="Connect4..numGames"></a>

### Connect4~numGames : <code>number</code> ℗
The number of currently active games. Used to determine of submodule is
unloadable.

**Kind**: inner property of [<code>Connect4</code>](#Connect4)  
**Default**: <code>0</code>  
**Access**: private  
<a name="Connect4..maxReactAwaitTime"></a>

### Connect4~maxReactAwaitTime : <code>number</code> ℗
Maximum amount of time to wait for reactions to a message. Also becomes
maximum amount of time a game will run with no input, because controls will
be disabled after this timeout.

**Kind**: inner constant of [<code>Connect4</code>](#Connect4)  
**Default**: <code>5 Minutes</code>  
**Access**: private  
<a name="Connect4..numRows"></a>

### Connect4~numRows : <code>number</code> ℗
The number of rows in the board.

**Kind**: inner constant of [<code>Connect4</code>](#Connect4)  
**Default**: <code>6</code>  
**Access**: private  
<a name="Connect4..numCols"></a>

### Connect4~numCols : <code>number</code> ℗
The number of columns in the board.

**Kind**: inner constant of [<code>Connect4</code>](#Connect4)  
**Default**: <code>7</code>  
**Access**: private  
<a name="Connect4..emoji"></a>

### Connect4~emoji : <code>Object.&lt;string&gt;</code> ℗
Helper object of emoji characters mapped to names.

**Kind**: inner constant of [<code>Connect4</code>](#Connect4)  
**Default**: <code>{&quot;undefined&quot;:&quot;9⃣&quot;,&quot;X&quot;:&quot;❌&quot;,&quot;O&quot;:&quot;⭕&quot;}</code>  
**Access**: private  
<a name="Connect4..commandConnect4"></a>

### Connect4~commandConnect4(msg) : [<code>commandHandler</code>](#commandHandler) ℗
Starts a connect 4 game. If someone is mentioned it will start a game
between the message author and the mentioned person. Otherwise, waits for
someone to play.

**Kind**: inner method of [<code>Connect4</code>](#Connect4)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord~Message</code> | Message that triggered command. |

<a name="Connect4..addReactions"></a>

### Connect4~addReactions(msg, index) ℗
Add the reactions to a message for controls of the game. Recursive.

**Kind**: inner method of [<code>Connect4</code>](#Connect4)  
**Access**: private  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| msg | <code>Discord~Message</code> |  | The message to add the reactions to. |
| index | <code>number</code> | <code>0</code> | The number of reactions we have added so far. |

<a name="Connect4..addListener"></a>

### Connect4~addListener(msg, game) ℗
Add the listener for reactions to the game.

**Kind**: inner method of [<code>Connect4</code>](#Connect4)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord~Message</code> | The message to add the reactions to. |
| game | <code>Connect4~Game</code> | The game to update when changes are made. |

<a name="Connect4..checkWin"></a>

### Connect4~checkWin(board, latestR, latestC) ⇒ <code>number</code>
Checks if the given board has a winner, or if the game is over.

**Kind**: inner method of [<code>Connect4</code>](#Connect4)  
**Returns**: <code>number</code> - Returns 0 if game is not over, 1 if player 1 won, 2 if
player 2 won, 3 if draw.  

| Param | Type | Description |
| --- | --- | --- |
| board | <code>Array.&lt;number&gt;</code> | Array of 9 numbers defining a board. 0 is nobody, 1 is player 1, 2 is player 2. |
| latestR | <code>number</code> | The row index where the latest move occurred. |
| latestC | <code>number</code> | The column index where the latest move occurred. |

<a name="HungryGames"></a>

## HungryGames ⇐ [<code>SubModule</code>](#SubModule)
Hunger Games simulator.

**Kind**: global class  
**Extends**: [<code>SubModule</code>](#SubModule)  

* [HungryGames](#HungryGames) ⇐ [<code>SubModule</code>](#SubModule)
    * _instance_
        * [.helpMessage](#SubModule+helpMessage) : <code>string</code> \| <code>Discord~MessageEmbed</code>
        * *[.postPrefix](#SubModule+postPrefix) : <code>string</code>*
        * [.Discord](#SubModule+Discord) : <code>Discord</code>
        * [.client](#SubModule+client) : <code>Discord~Client</code>
        * [.command](#SubModule+command) : [<code>Command</code>](#Command)
        * [.common](#SubModule+common) : [<code>Common</code>](#Common)
        * [.bot](#SubModule+bot) : [<code>SpikeyBot</code>](#SpikeyBot)
        * *[.myName](#SubModule+myName) : <code>string</code>*
        * [.initialized](#SubModule+initialized) : <code>boolean</code>
        * [.roleName](#HungryGames+roleName) : <code>string</code>
        * [.defaultOptions](#HungryGames+defaultOptions) : <code>Object.&lt;{value: (string\|number\|boolean), values: ?Array.&lt;string&gt;, comment: string}&gt;</code>
        * [.commit](#SubModule+commit) : <code>string</code>
        * [.loadTime](#SubModule+loadTime) : <code>number</code>
        * [.getGame(id)](#HungryGames+getGame) ⇒ [<code>GuildGame</code>](#HungryGames..GuildGame)
        * [.getDefaultEvents()](#HungryGames+getDefaultEvents) ⇒ <code>Object</code>
        * [.createGame(id)](#HungryGames+createGame)
        * [.resetGame(id, command)](#HungryGames+resetGame) ⇒ <code>string</code>
        * [.startGame(uId, gId, cId)](#HungryGames+startGame)
        * [.startAutoplay(uId, gId, cId)](#HungryGames+startAutoplay)
        * [.endGame(uId, gId)](#HungryGames+endGame)
        * [.pauseAutoplay(uId, gId)](#HungryGames+pauseAutoplay)
        * [.nextDay(uId, gId, cId)](#HungryGames+nextDay)
        * [.excludeUsers(users, id)](#HungryGames+excludeUsers) ⇒ <code>string</code>
        * [.includeUsers(users, id)](#HungryGames+includeUsers) ⇒ <code>string</code>
        * [.setOption(id, option, value, [text])](#HungryGames+setOption) ⇒ <code>string</code>
        * [.editTeam(uId, gId, cmd, one, two)](#HungryGames+editTeam) ⇒ <code>string</code>
        * [.makeAndAddEvent(id, type, message, numVictim, numAttacker, victimOutcome, attackerOutcome, victimKiller, attackerKiller, vWeapon, aWeapon)](#HungryGames+makeAndAddEvent) ⇒ <code>string</code>
        * [.addEvent(id, type, event)](#HungryGames+addEvent) ⇒ <code>string</code>
        * [.addMajorEvent(id, type, data, [name])](#HungryGames+addMajorEvent) ⇒ <code>string</code>
        * [.editMajorEvent(id, type, search, data, [name], [newName])](#HungryGames+editMajorEvent) ⇒ <code>string</code>
        * [.removeEvent(id, type, event)](#HungryGames+removeEvent) ⇒ <code>string</code>
        * [.toggleEvent(id, type, subCat, event, [value])](#HungryGames+toggleEvent) ⇒ <code>string</code>
        * [.eventsEqual(e1, e2)](#HungryGames+eventsEqual) ⇒ <code>boolean</code>
        * [.forcePlayerState(id, list, state, text, [persists])](#HungryGames+forcePlayerState) ⇒ <code>string</code>
        * [.getNumSimulating()](#HungryGames+getNumSimulating) ⇒ <code>number</code>
        * [.initialize()](#SubModule+initialize)
        * [.begin(Discord, client, command, common, bot)](#SubModule+begin)
        * [.end()](#SubModule+end)
        * [.log(msg)](#SubModule+log)
        * [.debug(msg)](#SubModule+debug)
        * [.warn(msg)](#SubModule+warn)
        * [.error(msg)](#SubModule+error)
        * [.shutdown()](#SubModule+shutdown)
        * [.save([opt])](#SubModule+save)
        * [.unloadable()](#SubModule+unloadable) ⇒ <code>boolean</code>
    * _inner_
        * [~Player](#HungryGames..Player)
            * [new Player(id, username, avatarURL, [nickname])](#new_HungryGames..Player_new)
        * [~Team](#HungryGames..Team)
            * [new Team(id, name, players)](#new_HungryGames..Team_new)
        * [~Event](#HungryGames..Event)
            * [new Event(message, [numVictim], [numAttacker], [victimOutcome], [attackerOutcome], [victimKiller], [attackerKiller], [battle], [state], [attacks])](#new_HungryGames..Event_new)
        * [~web](#HungryGames..web) : [<code>HGWeb</code>](#HGWeb) ℗
        * [~findTimestamps](#HungryGames..findTimestamps) : <code>Object.&lt;number&gt;</code> ℗
        * [~games](#HungryGames..games) : [<code>Object.&lt;GuildGame&gt;</code>](#HungryGames..GuildGame) ℗
        * [~messages](#HungryGames..messages) : <code>Object.&lt;Array.&lt;string&gt;&gt;</code> ℗
        * [~battles](#HungryGames..battles) : <code>Object</code> ℗
        * [~dayEventIntervals](#HungryGames..dayEventIntervals) : <code>Object.&lt;number&gt;</code> ℗
        * [~autoPlayTimeout](#HungryGames..autoPlayTimeout) : <code>Object.&lt;number&gt;</code> ℗
        * [~battleMessage](#HungryGames..battleMessage) : <code>Object.&lt;Discord~Message&gt;</code> ℗
        * [~weapons](#HungryGames..weapons) : [<code>Object.&lt;WeaponEvent&gt;</code>](#HungryGames..WeaponEvent) ℗
        * [~defaultBloodbathEvents](#HungryGames..defaultBloodbathEvents) : [<code>Array.&lt;Event&gt;</code>](#HungryGames..Event) ℗
        * [~defaultPlayerEvents](#HungryGames..defaultPlayerEvents) : [<code>Array.&lt;Event&gt;</code>](#HungryGames..Event) ℗
        * [~defaultArenaEvents](#HungryGames..defaultArenaEvents) : [<code>Array.&lt;ArenaEvent&gt;</code>](#HungryGames..ArenaEvent) ℗
        * [~newEventMessages](#HungryGames..newEventMessages) : <code>Object.&lt;Discord~Message&gt;</code> ℗
        * [~optionMessages](#HungryGames..optionMessages) : <code>Object.&lt;Discord~Message&gt;</code> ℗
        * [~listenersEndTime](#HungryGames..listenersEndTime) : <code>number</code> ℗
        * [~patreonSettingKeys](#HungryGames..patreonSettingKeys) : <code>Array.&lt;string&gt;</code> ℗
        * [~saveFile](#HungryGames..saveFile) : <code>string</code> ℗
        * [~hgSaveDir](#HungryGames..hgSaveDir) : <code>string</code> ℗
        * [~eventFile](#HungryGames..eventFile) : <code>string</code> ℗
        * [~messageFile](#HungryGames..messageFile) : <code>string</code> ℗
        * [~battleFile](#HungryGames..battleFile) : <code>string</code> ℗
        * [~weaponsFile](#HungryGames..weaponsFile) : <code>string</code> ℗
        * [~fistLeft](#HungryGames..fistLeft) : <code>string</code> ℗
        * [~fistRight](#HungryGames..fistRight) : <code>string</code> ℗
        * [~fistBoth](#HungryGames..fistBoth) : <code>string</code> ℗
        * [~fetchSize](#HungryGames..fetchSize) : <code>number</code> ℗
        * [~roleName](#HungryGames..roleName) : <code>string</code> ℗
        * [~numEventsPerPage](#HungryGames..numEventsPerPage) : <code>number</code> ℗
        * [~maxReactAwaitTime](#HungryGames..maxReactAwaitTime) : <code>number</code> ℗
        * [~findDelay](#HungryGames..findDelay) : <code>number</code> ℗
        * [~defaultOptions](#HungryGames..defaultOptions) : <code>Object.&lt;{value: (string\|number\|boolean\|Object), values: ?Array.&lt;string&gt;, range: ?{min:number, max:number}, comment: string, category: string}&gt;</code> ℗
        * [~lotsOfDeathRate](#HungryGames..lotsOfDeathRate) : <code>number</code> ℗
        * [~littleDeathRate](#HungryGames..littleDeathRate) : <code>number</code> ℗
        * [~defaultColor](#HungryGames..defaultColor) : <code>Discord~ColorResolveable</code> ℗
        * [~emoji](#HungryGames..emoji) : <code>Object.&lt;string&gt;</code> ℗
        * [~alph](#HungryGames..alph) : <code>string</code> ℗
        * [~multiEventUserDistribution](#HungryGames..multiEventUserDistribution) : <code>Object</code> ℗
        * [~helpmessagereply](#HungryGames..helpmessagereply) : <code>string</code> ℗
        * [~blockedmessage](#HungryGames..blockedmessage) : <code>string</code> ℗
        * [~helpObject](#HungryGames..helpObject) ℗
        * [~updateEvents()](#HungryGames..updateEvents) ℗
        * [~updateMessages()](#HungryGames..updateMessages) ℗
        * [~updateBattles()](#HungryGames..updateBattles) ℗
        * [~updateWeapons()](#HungryGames..updateWeapons) ℗
        * [~setupHelp()](#HungryGames..setupHelp) ℗
        * [~handleMessageEdit(oldMsg, newMsg)](#HungryGames..handleMessageEdit) ℗
        * [~mkCmd(cb)](#HungryGames..mkCmd) ⇒ <code>Command~commandHandler</code> ℗
        * [~commandMakeMeWin(msg)](#HungryGames..commandMakeMeWin) : [<code>commandHandler</code>](#commandHandler) ℗
        * [~commandMakeMeLose(msg)](#HungryGames..commandMakeMeLose) : [<code>commandHandler</code>](#commandHandler) ℗
        * [~makePlayer(member)](#HungryGames..makePlayer) ⇒ [<code>Player</code>](#HungryGames..Player) ℗
        * [~sendAtTime(channel, one, two, time)](#HungryGames..sendAtTime) ℗
        * [~createGame(msg, id, [silent], [cb])](#HungryGames..createGame) : [<code>hgCommandHandler</code>](#HungryGames..hgCommandHandler) ℗
        * [~fetchPatreonSettings(players, cId, gId, [cb])](#HungryGames..fetchPatreonSettings) ℗
            * [~onCheckPatron(err, info, p)](#HungryGames..fetchPatreonSettings..onCheckPatron) ℗
            * [~onPermResponse(err, info, p)](#HungryGames..fetchPatreonSettings..onPermResponse) ℗
            * [~onSettingResponse(err, info, p, setting)](#HungryGames..fetchPatreonSettings..onSettingResponse) ℗
        * [~getAllPlayers(members, excluded, bots, included, excludeByDefault)](#HungryGames..getAllPlayers) ⇒ [<code>Array.&lt;Player&gt;</code>](#HungryGames..Player) ℗
        * [~formTeams(id)](#HungryGames..formTeams) ℗
        * [~resetGame(msg, id)](#HungryGames..resetGame) : [<code>hgCommandHandler</code>](#HungryGames..hgCommandHandler) ℗
        * [~showGameInfo(msg, id)](#HungryGames..showGameInfo) : [<code>hgCommandHandler</code>](#HungryGames..hgCommandHandler) ℗
        * [~showGameEvents(msg, id)](#HungryGames..showGameEvents) : [<code>hgCommandHandler</code>](#HungryGames..hgCommandHandler) ℗
        * [~startGame(msg, id)](#HungryGames..startGame) : [<code>hgCommandHandler</code>](#HungryGames..hgCommandHandler) ℗
            * [~loadingComplete()](#HungryGames..startGame..loadingComplete) ℗
        * [~makeMessage(uId, gId, cId, msg)](#HungryGames..makeMessage) ⇒ <code>Object</code> ℗
        * [~pauseAutoplay(msg, id)](#HungryGames..pauseAutoplay) : [<code>hgCommandHandler</code>](#HungryGames..hgCommandHandler) ℗
        * [~startAutoplay(msg, id)](#HungryGames..startAutoplay) : [<code>hgCommandHandler</code>](#HungryGames..hgCommandHandler) ℗
        * [~nextDay(msg, id, [retry])](#HungryGames..nextDay) : [<code>hgCommandHandler</code>](#HungryGames..hgCommandHandler) ℗
        * [~effectUser(id, affected, kills, [weapon])](#HungryGames..effectUser) ℗
        * [~killUser(id, a, k, [w])](#HungryGames..killUser) ℗
        * [~woundUser(id, a, k, [w])](#HungryGames..woundUser) ℗
        * [~restoreUser(id, a, k, [w])](#HungryGames..restoreUser) ℗
        * [~reviveUser(id, a, k, [w])](#HungryGames..reviveUser) ℗
        * [~pickEvent(userPool, eventPool, options, numAlive, numTotal, teams, probOpts, weaponWielder)](#HungryGames..pickEvent) ⇒ [<code>Event</code>](#HungryGames..Event) ℗
        * [~validateEventTeamConstraint(numVictim, numAttacker, userPool, teams, options, victimsDie, attackersDie, weaponWielder)](#HungryGames..validateEventTeamConstraint) ⇒ <code>string</code> ℗
        * [~validateEventVictorConstraint(numVictim, numAttacker, numAlive, options, victimsDie, attackersDie)](#HungryGames..validateEventVictorConstraint) ⇒ <code>boolean</code> ℗
        * [~validateEventNumConstraint(numVictim, numAttacker, userPool, numAlive)](#HungryGames..validateEventNumConstraint) ⇒ <code>boolean</code> ℗
        * [~validateEventRequirements(numVictim, numAttacker, userPool, numAlive, teams, options, victimsDie, attackersDie, weaponWielder)](#HungryGames..validateEventRequirements) ⇒ <code>string</code> ℗
        * [~pickAffectedPlayers(numVictim, numAttacker, victimOutcome, attackerOutcome, options, userPool, deadPool, teams, weaponWielder)](#HungryGames..pickAffectedPlayers) ⇒ [<code>Array.&lt;Player&gt;</code>](#HungryGames..Player) ℗
        * [~makeBattleEvent(affectedUsers, numVictim, numAttacker, mention, id, [useNicknames])](#HungryGames..makeBattleEvent) ⇒ [<code>Event</code>](#HungryGames..Event) ℗
        * [~weightedUserRand()](#HungryGames..weightedUserRand) ⇒ <code>number</code> ℗
        * [~probabilityEvent(eventPool, probabilityOpts, [recurse])](#HungryGames..probabilityEvent) ⇒ <code>number</code> ℗
        * [~formatMultiNames(names, [format])](#HungryGames..formatMultiNames) ⇒ <code>string</code> ℗
        * [~makeMessageEvent(message, [id])](#HungryGames..makeMessageEvent) ⇒ [<code>Event</code>](#HungryGames..Event) ℗
        * [~makeSingleEvent(message, affectedUsers, numVictim, numAttacker, mention, id, victimOutcome, attackerOutcome, [useNickname])](#HungryGames..makeSingleEvent) ⇒ <code>HungryGames~FinalEvent</code> ℗
        * [~getMiniIcons(users)](#HungryGames..getMiniIcons) ⇒ [<code>Array.&lt;UserIconUrl&gt;</code>](#HungryGames..UserIconUrl) ℗
        * [~printEvent(msg, id)](#HungryGames..printEvent) ℗
        * [~printDay(msg, id)](#HungryGames..printDay) ℗
        * [~endGame(msg, id)](#HungryGames..endGame) : [<code>hgCommandHandler</code>](#HungryGames..hgCommandHandler) ℗
        * [~excludeUser(msg, id)](#HungryGames..excludeUser) : [<code>hgCommandHandler</code>](#HungryGames..hgCommandHandler) ℗
        * [~includeUser(msg, id)](#HungryGames..includeUser) : [<code>hgCommandHandler</code>](#HungryGames..hgCommandHandler) ℗
        * [~listPlayers(msg, id)](#HungryGames..listPlayers) : [<code>hgCommandHandler</code>](#HungryGames..hgCommandHandler) ℗
        * [~getName(guild, user)](#HungryGames..getName) ⇒ <code>string</code> ℗
        * [~toggleOpt(msg, id)](#HungryGames..toggleOpt) : [<code>hgCommandHandler</code>](#HungryGames..hgCommandHandler) ℗
        * [~changeObjectValue(obj, defaultObj, option, value, values, id, [range])](#HungryGames..changeObjectValue) ⇒ <code>string</code> ℗
        * [~showOpts(msg, options)](#HungryGames..showOpts) ℗
        * [~optChangeListener(msg_, options, index)](#HungryGames..optChangeListener) ℗
        * [~editTeam(msg, id, [silent])](#HungryGames..editTeam) ⇒ <code>string</code> ℗
        * [~swapTeamUsers(msg, id)](#HungryGames..swapTeamUsers) ℗
        * [~moveTeamUser(msg, id)](#HungryGames..moveTeamUser) ℗
        * [~renameTeam(msg, id, [silent])](#HungryGames..renameTeam) ℗
        * [~randomizeTeams(msg, id, [silent])](#HungryGames..randomizeTeams) ℗
        * [~createEvent(msg, id)](#HungryGames..createEvent) : [<code>hgCommandHandler</code>](#HungryGames..hgCommandHandler) ℗
        * [~commandToggleEvent(msg, id)](#HungryGames..commandToggleEvent) : [<code>hgCommandHandler</code>](#HungryGames..hgCommandHandler)
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
        * [~commandStats(msg, id)](#HungryGames..commandStats) : [<code>hgCommandHandler</code>](#HungryGames..hgCommandHandler) ℗
        * [~commandRig(msg, id)](#HungryGames..commandRig) : [<code>hgCommandHandler</code>](#HungryGames..hgCommandHandler) ℗
        * [~commandKill(msg, id)](#HungryGames..commandKill) : [<code>hgCommandHandler</code>](#HungryGames..hgCommandHandler) ℗
        * [~commandHeal(msg, id)](#HungryGames..commandHeal) : [<code>hgCommandHandler</code>](#HungryGames..hgCommandHandler) ℗
        * [~commandWound(msg, id)](#HungryGames..commandWound) : [<code>hgCommandHandler</code>](#HungryGames..hgCommandHandler) ℗
        * [~nothing()](#HungryGames..nothing) ⇒ <code>string</code> ℗
        * [~getMessage(type)](#HungryGames..getMessage) ⇒ <code>string</code> ℗
        * [~find(id)](#HungryGames..find) ⇒ [<code>GuildGame</code>](#HungryGames..GuildGame) ℗
        * [~calcColNum(numCols, statusList)](#HungryGames..calcColNum) ⇒ <code>number</code> ℗
        * [~deepFreeze(object)](#HungryGames..deepFreeze) ⇒ <code>Object</code> ℗
        * [~newReact(duration)](#HungryGames..newReact) ℗
        * [~readImage(url)](#HungryGames..readImage) ⇒ <code>Promise</code> ℗
            * [~toJimp(path)](#HungryGames..readImage..toJimp) ⇒ <code>Promise</code> ℗
        * [~exit([code])](#HungryGames..exit) ℗
        * [~sigint()](#HungryGames..sigint) ℗
        * [~OutcomeProbabilities}](#HungryGames..OutcomeProbabilities}) : <code>Object</code>
        * [~GuildGame](#HungryGames..GuildGame) : <code>Object</code>
        * [~Game](#HungryGames..Game) : <code>Object</code>
        * [~hgCommandHandler](#HungryGames..hgCommandHandler) : <code>function</code>
        * [~Battle](#HungryGames..Battle) : <code>Object</code>
        * [~ArenaEvent](#HungryGames..ArenaEvent) : <code>Object</code>
        * [~WeaponEvent](#HungryGames..WeaponEvent) : <code>Object</code>
        * [~UserIconUrl](#HungryGames..UserIconUrl) : <code>Object</code>
        * [~createEventNumCallback](#HungryGames..createEventNumCallback) : <code>function</code>
        * [~createEventOutcomeCallback](#HungryGames..createEventOutcomeCallback) : <code>function</code>
        * [~createEventBooleanCallback](#HungryGames..createEventBooleanCallback) : <code>function</code>

<a name="SubModule+helpMessage"></a>

### hungryGames.helpMessage : <code>string</code> \| <code>Discord~MessageEmbed</code>
The help message to show the user in the main help message.

**Kind**: instance property of [<code>HungryGames</code>](#HungryGames)  
**Overrides**: [<code>helpMessage</code>](#SubModule+helpMessage)  
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

### hungryGames.command : [<code>Command</code>](#Command)
The command object for registering command listeners.

**Kind**: instance property of [<code>HungryGames</code>](#HungryGames)  
<a name="SubModule+common"></a>

### hungryGames.common : [<code>Common</code>](#Common)
The common object.

**Kind**: instance property of [<code>HungryGames</code>](#HungryGames)  
<a name="SubModule+bot"></a>

### hungryGames.bot : [<code>SpikeyBot</code>](#SpikeyBot)
The parent SpikeyBot instance.

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
<a name="HungryGames+roleName"></a>

### hungryGames.roleName : <code>string</code>
Role that a user must have in order to perform any commands.

**Kind**: instance constant of [<code>HungryGames</code>](#HungryGames)  
**Access**: public  
<a name="HungryGames+defaultOptions"></a>

### hungryGames.defaultOptions : <code>Object.&lt;{value: (string\|number\|boolean), values: ?Array.&lt;string&gt;, comment: string}&gt;</code>
Default options for a game.

**Kind**: instance constant of [<code>HungryGames</code>](#HungryGames)  
<a name="SubModule+commit"></a>

### hungryGames.commit : <code>string</code>
The commit at HEAD at the time this module was loaded. Essentially the
version of this submodule.

**Kind**: instance constant of [<code>HungryGames</code>](#HungryGames)  
**Access**: public  
<a name="SubModule+loadTime"></a>

### hungryGames.loadTime : <code>number</code>
The time at which this madule was loaded for use in checking if the module
needs to be reloaded because the file has been modified since loading.

**Kind**: instance constant of [<code>HungryGames</code>](#HungryGames)  
**Access**: public  
<a name="HungryGames+getGame"></a>

### hungryGames.getGame(id) ⇒ [<code>GuildGame</code>](#HungryGames..GuildGame)
Returns a reference to the current games object for a given guild.

**Kind**: instance method of [<code>HungryGames</code>](#HungryGames)  
**Returns**: [<code>GuildGame</code>](#HungryGames..GuildGame) - The current object storing all data about
game in a guild.  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>string</code> | The guild id to get the data for. |

<a name="HungryGames+getDefaultEvents"></a>

### hungryGames.getDefaultEvents() ⇒ <code>Object</code>
Returns an object storing all of the default events for the games.

**Kind**: instance method of [<code>HungryGames</code>](#HungryGames)  
**Access**: public  
<a name="HungryGames+createGame"></a>

### hungryGames.createGame(id)
Create a Hungry Games for a guild.

**Kind**: instance method of [<code>HungryGames</code>](#HungryGames)  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>string</code> | The id of the guild to create the game in. |

<a name="HungryGames+resetGame"></a>

### hungryGames.resetGame(id, command) ⇒ <code>string</code>
Reset the specified category of data from a game.

**Kind**: instance method of [<code>HungryGames</code>](#HungryGames)  
**Returns**: <code>string</code> - The message explaining what happened.  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>string</code> | The id of the guild to modify. |
| command | <code>string</code> | The category of data to reset. |

<a name="HungryGames+startGame"></a>

### hungryGames.startGame(uId, gId, cId)
Start the games in the given channel and guild by the given user.

**Kind**: instance method of [<code>HungryGames</code>](#HungryGames)  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| uId | <code>string</code> | The id of the user who trigged the games to start. |
| gId | <code>string</code> | The id of the guild to run the games in. |
| cId | <code>string</code> | The id of the channel to run the games in. |

<a name="HungryGames+startAutoplay"></a>

### hungryGames.startAutoplay(uId, gId, cId)
Start autoplay in the given channel and guild by the given user.

**Kind**: instance method of [<code>HungryGames</code>](#HungryGames)  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| uId | <code>string</code> | The id of the user who trigged autoplay to start. |
| gId | <code>string</code> | The id of the guild to run autoplay in. |
| cId | <code>string</code> | The id of the channel to run autoplay in. |

<a name="HungryGames+endGame"></a>

### hungryGames.endGame(uId, gId)
End the games in the given guild as the given user.

**Kind**: instance method of [<code>HungryGames</code>](#HungryGames)  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| uId | <code>string</code> | The id of the user who trigged the games to end. |
| gId | <code>string</code> | The id of the guild to end the games in. |

<a name="HungryGames+pauseAutoplay"></a>

### hungryGames.pauseAutoplay(uId, gId)
Pause autoplay in the given guild as the given user.

**Kind**: instance method of [<code>HungryGames</code>](#HungryGames)  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| uId | <code>string</code> | The id of the user who trigged autoplay to end. |
| gId | <code>string</code> | The id of the guild to end autoplay. |

<a name="HungryGames+nextDay"></a>

### hungryGames.nextDay(uId, gId, cId)
Start the next day of the game in the given channel and guild by the given
user.

**Kind**: instance method of [<code>HungryGames</code>](#HungryGames)  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| uId | <code>string</code> | The id of the user who trigged autoplay to start. |
| gId | <code>string</code> | The id of the guild to run autoplay in. |
| cId | <code>string</code> | The id of the channel to run autoplay in. |

<a name="HungryGames+excludeUsers"></a>

### hungryGames.excludeUsers(users, id) ⇒ <code>string</code>
Removes users from a games of a given guild.

**Kind**: instance method of [<code>HungryGames</code>](#HungryGames)  
**Returns**: <code>string</code> - A string with the outcomes of each user. May have
multiple lines for a single user.  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| users | <code>string</code> \| <code>Array.&lt;string&gt;</code> \| <code>Array.&lt;Discord~User&gt;</code> | The users to exclude, or 'everyone' to exclude everyone. |
| id | <code>string</code> | The guild id to remove the users from. |

<a name="HungryGames+includeUsers"></a>

### hungryGames.includeUsers(users, id) ⇒ <code>string</code>
Adds a user back into the next game.

**Kind**: instance method of [<code>HungryGames</code>](#HungryGames)  
**Returns**: <code>string</code> - A string with the outcomes of each user. May have
multiple lines for a single user.  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| users | <code>string</code> \| <code>Array.&lt;string&gt;</code> \| <code>Array.&lt;Discord~User&gt;</code> | The users to include, or 'everyone' to include all users. |
| id | <code>string</code> | The guild id to add the users to. |

<a name="HungryGames+setOption"></a>

### hungryGames.setOption(id, option, value, [text]) ⇒ <code>string</code>
Change an option to a value for the given guild.

**Kind**: instance method of [<code>HungryGames</code>](#HungryGames)  
**Returns**: <code>string</code> - A message saying what happened, or null if we should show
the user the list of options instead.  
**Access**: public  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| id | <code>string</code> |  | The guild id to change the option in. |
| option | <code>string</code> |  | The option key to change. |
| value | <code>string</code> \| <code>boolean</code> \| <code>number</code> |  | The value to change the option to. |
| [text] | <code>string</code> | <code>&quot;&#x27;&#x27;&quot;</code> | The original message sent without the command prefix in the case we are changing the value of an object and require all user inputted data. |

<a name="HungryGames+editTeam"></a>

### hungryGames.editTeam(uId, gId, cmd, one, two) ⇒ <code>string</code>
Allows editing teams. Entry for all team actions.

**Kind**: instance method of [<code>HungryGames</code>](#HungryGames)  
**Returns**: <code>string</code> - Error message or null if no error.  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| uId | <code>string</code> | The id of the user is running the action. |
| gId | <code>string</code> | The id of the guild to run this in. |
| cmd | <code>string</code> | The command to run on the teams. |
| one | <code>string</code> | The id of the user to swap, or the new name of the team if we're renaming a team. |
| two | <code>string</code> | The id of the user to swap, or the team id if we're moving a player to a team. |

<a name="HungryGames+makeAndAddEvent"></a>

### hungryGames.makeAndAddEvent(id, type, message, numVictim, numAttacker, victimOutcome, attackerOutcome, victimKiller, attackerKiller, vWeapon, aWeapon) ⇒ <code>string</code>
Creates an event and adds it to the custom events for the given guild.

**Kind**: instance method of [<code>HungryGames</code>](#HungryGames)  
**Returns**: <code>string</code> - Error message or null if no error.  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>string</code> | The guild id to add the event to. |
| type | <code>string</code> | The type of event this is. Either 'player' or 'bloodbath'. |
| message | <code>string</code> | The event message. |
| numVictim | <code>number</code> | The number of victims in the event. |
| numAttacker | <code>number</code> | The number of attackers in the event. |
| victimOutcome | <code>string</code> | The outcome of the victims due to this event. |
| attackerOutcome | <code>string</code> | The outcome of the attackers due to this event. |
| victimKiller | <code>boolean</code> | Do the victims kill anyone. |
| attackerKiller | <code>boolean</code> | Do the attackers kill anyone. |
| vWeapon | <code>Object</code> | The weapon information to give the victim. |
| aWeapon | <code>Object</code> | The weapon information to give the attacker. |

<a name="HungryGames+addEvent"></a>

### hungryGames.addEvent(id, type, event) ⇒ <code>string</code>
Adds a given event to the given guild's custom events.

**Kind**: instance method of [<code>HungryGames</code>](#HungryGames)  
**Returns**: <code>string</code> - Error message or null if no error.  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>string</code> | The id of the guild to add the event to. |
| type | <code>string</code> | The type of event this is. |
| event | [<code>Event</code>](#HungryGames..Event) | The event to add. |

<a name="HungryGames+addMajorEvent"></a>

### hungryGames.addMajorEvent(id, type, data, [name]) ⇒ <code>string</code>
Creates an event and adds it to the custom events for the given guild. Or
edits an existing event by appending new events to the major event.

**Kind**: instance method of [<code>HungryGames</code>](#HungryGames)  
**Returns**: <code>string</code> - Error message or null if no error.  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>string</code> | The guild id to add the event to. |
| type | <code>string</code> | The type of event this is. Either 'arena' or 'weapon'. |
| data | [<code>ArenaEvent</code>](#HungryGames..ArenaEvent) \| [<code>WeaponEvent</code>](#HungryGames..WeaponEvent) | The event data. |
| [name] | <code>string</code> | The internal name of the weapon being added. |

<a name="HungryGames+editMajorEvent"></a>

### hungryGames.editMajorEvent(id, type, search, data, [name], [newName]) ⇒ <code>string</code>
Searches custom events for the given one, then edits it with the given
data. If the data is null besides required data for finding the major
event, the major event gets deleted. (Arena or Weapon events)

**Kind**: instance method of [<code>HungryGames</code>](#HungryGames)  
**Returns**: <code>string</code> - Error message or null if no error.  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>string</code> | The id of the guild to remove the event from. |
| type | <code>string</code> | The type of event this is. |
| search | [<code>ArenaEvent</code>](#HungryGames..ArenaEvent) \| [<code>WeaponEvent</code>](#HungryGames..WeaponEvent) | The event data to use to search for. |
| data | [<code>ArenaEvent</code>](#HungryGames..ArenaEvent) \| [<code>WeaponEvent</code>](#HungryGames..WeaponEvent) | The event data to set the matched search to. If this is null, the event is deleted. |
| [name] | <code>string</code> | The name of the weapon to look for or the message of the arena event to edit. |
| [newName] | <code>string</code> | The new name of the weapon that was found with `name`. |

<a name="HungryGames+removeEvent"></a>

### hungryGames.removeEvent(id, type, event) ⇒ <code>string</code>
Searches custom events for the given one, then removes it from the custom
events. (Bloodbath or Player events)

**Kind**: instance method of [<code>HungryGames</code>](#HungryGames)  
**Returns**: <code>string</code> - Error message or null if no error.  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>string</code> | The id of the guild to remove the event from. |
| type | <code>string</code> | The type of event this is. |
| event | [<code>Event</code>](#HungryGames..Event) | The event to search for. |

<a name="HungryGames+toggleEvent"></a>

### hungryGames.toggleEvent(id, type, subCat, event, [value]) ⇒ <code>string</code>
Enable or disable an event without deleting it completely.

**Kind**: instance method of [<code>HungryGames</code>](#HungryGames)  
**Returns**: <code>string</code> - Error message or null if no error.  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>number</code> \| <code>string</code> | The guild id that the event shall be toggled in. |
| type | <code>string</code> | The type of event. 'bloodbath', 'player', 'weapon', or 'arena' |
| subCat | <code>string</code> | The sub-category name of the event if there is one (Such as the weapon name, or arena event message). |
| event | [<code>Event</code>](#HungryGames..Event) \| [<code>ArenaEvent</code>](#HungryGames..ArenaEvent) \| [<code>WeaponEvent</code>](#HungryGames..WeaponEvent) | The event to toggle. |
| [value] | <code>boolean</code> | Set enabled to a value instead of toggling. |

<a name="HungryGames+eventsEqual"></a>

### hungryGames.eventsEqual(e1, e2) ⇒ <code>boolean</code>
Checks if the two given events are equivalent.

**Kind**: instance method of [<code>HungryGames</code>](#HungryGames)  

| Param | Type |
| --- | --- |
| e1 | [<code>Event</code>](#HungryGames..Event) | 
| e2 | [<code>Event</code>](#HungryGames..Event) | 

<a name="HungryGames+forcePlayerState"></a>

### hungryGames.forcePlayerState(id, list, state, text, [persists]) ⇒ <code>string</code>
Force a player to have a certain outcome in the current day being
simulated, or the next day that will be simulated. This is acheived by
adding a custom event in which the player will be affected after their
normal event for the day.

**Kind**: instance method of [<code>HungryGames</code>](#HungryGames)  
**Returns**: <code>string</code> - The output message to tell the user of the outcome of the
operation.  
**Access**: public  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| id | <code>string</code> |  | The guild ID in which the users will be affected. |
| list | <code>Array.&lt;string&gt;</code> |  | The array of player IDs of which to affect. |
| state | <code>string</code> |  | The outcome to force the players to have been victims of by the end of the simulated day. ("living", "dead", "wounded", or "thriving"). |
| text | <code>string</code> |  | Message to show when the user is affected. |
| [persists] | <code>boolean</code> | <code>false</code> | Does this outcome persist to the end of the game, if false it only exists for the next day. |

<a name="HungryGames+getNumSimulating"></a>

### hungryGames.getNumSimulating() ⇒ <code>number</code>
Returns the number of games that are currently being shown to users.

**Kind**: instance method of [<code>HungryGames</code>](#HungryGames)  
**Returns**: <code>number</code> - Number of games simulating.  
**Access**: public  
<a name="SubModule+initialize"></a>

### hungryGames.initialize()
The function called at the end of begin() for further initialization
specific to the subModule. Must be defined before begin() is called.

**Kind**: instance method of [<code>HungryGames</code>](#HungryGames)  
**Overrides**: [<code>initialize</code>](#SubModule+initialize)  
**Access**: protected  
<a name="SubModule+begin"></a>

### hungryGames.begin(Discord, client, command, common, bot)
Initialize this submodule.

**Kind**: instance method of [<code>HungryGames</code>](#HungryGames)  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| Discord | <code>Discord</code> | The Discord object for the API library. |
| client | <code>Discord~Client</code> | The client that represents this bot. |
| command | [<code>Command</code>](#Command) | The command instance in which to register command listeners. |
| common | [<code>Common</code>](#Common) | Class storing common functions. |
| bot | [<code>SpikeyBot</code>](#SpikeyBot) | The parent SpikeyBot instance. |

<a name="SubModule+end"></a>

### hungryGames.end()
Trigger subModule to shutdown and get ready for process terminating.

**Kind**: instance method of [<code>HungryGames</code>](#HungryGames)  
**Access**: public  
<a name="SubModule+log"></a>

### hungryGames.log(msg)
Log using common.log, but automatically set name.

**Kind**: instance method of [<code>HungryGames</code>](#HungryGames)  
**Access**: protected  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>string</code> | The message to log. |

<a name="SubModule+debug"></a>

### hungryGames.debug(msg)
Log using common.logDebug, but automatically set name.

**Kind**: instance method of [<code>HungryGames</code>](#HungryGames)  
**Access**: protected  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>string</code> | The message to log. |

<a name="SubModule+warn"></a>

### hungryGames.warn(msg)
Log using common.logWarning, but automatically set name.

**Kind**: instance method of [<code>HungryGames</code>](#HungryGames)  
**Access**: protected  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>string</code> | The message to log. |

<a name="SubModule+error"></a>

### hungryGames.error(msg)
Log using common.error, but automatically set name.

**Kind**: instance method of [<code>HungryGames</code>](#HungryGames)  
**Access**: protected  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>string</code> | The message to log. |

<a name="SubModule+shutdown"></a>

### hungryGames.shutdown()
Shutdown and disable this submodule. Removes all event listeners.

**Kind**: instance method of [<code>HungryGames</code>](#HungryGames)  
**Overrides**: [<code>shutdown</code>](#SubModule+shutdown)  
**Access**: protected  
<a name="SubModule+save"></a>

### hungryGames.save([opt])
Saves all data to files necessary for saving current state.

**Kind**: instance method of [<code>HungryGames</code>](#HungryGames)  
**Overrides**: [<code>save</code>](#SubModule+save)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [opt] | <code>string</code> | <code>&quot;&#x27;sync&#x27;&quot;</code> | Can be 'async', otherwise defaults to synchronous. |

<a name="SubModule+unloadable"></a>

### hungryGames.unloadable() ⇒ <code>boolean</code>
Check if this module is in a state that is ready to be unloaded. If false
is returned, this module should not be unloaded and doing such may risk
putting the module into an uncontrollable state.

**Kind**: instance method of [<code>HungryGames</code>](#HungryGames)  
**Overrides**: [<code>unloadable</code>](#SubModule+unloadable)  
**Returns**: <code>boolean</code> - True if can be unloaded, false if cannot.  
**Access**: public  
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
| nickname | <code>string</code> | The nickname for this user usually assigned by the guild. If the user does not have a nickname, this will have the same value as `name`. |
| living | <code>boolean</code> | Is the player still alive. |
| bleeding | <code>number</code> | How many days has the player been wounded. |
| rank | <code>number</code> | The current rank of the player in the game. |
| state | <code>string</code> | The current player state (normal, wounded, dead, zombie). |
| kills | <code>number</code> | The number of players this player has caused to die. |
| weapons | <code>Object.&lt;number&gt;</code> | The weapons the player currently has and how many of each. |
| settings | <code>Object</code> | Custom settings for this user associated with the games. |

<a name="new_HungryGames..Player_new"></a>

#### new Player(id, username, avatarURL, [nickname])

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| id | <code>string</code> |  | The id of the user this object is representing. |
| username | <code>string</code> |  | The name of the user to show in the game. |
| avatarURL | <code>string</code> |  | URL to avatar to show for the user in the game. |
| [nickname] | <code>string</code> | <code>null</code> | The nickname for this user usually assigned by the guild. If the user does not have a nickname, this will have the same value as `name`. |

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
| [action] | <code>string</code> | The action to format into a message if this is a weapon event. |
| victim | <code>Object</code> | Information about the victims in this event. |
| attacker | <code>Object</code> | Information about the attackers in this event. |
| victim.weapon | <code>Object</code> | The weapon information to give to the player. |
| attacker.weapon | <code>Object</code> | The weapon information to give to the player. |
| battle | <code>boolean</code> | Is this event a battle event. |
| state | <code>number</code> | The current state of printing the battle messages. |
| attacks | [<code>Array.&lt;Event&gt;</code>](#HungryGames..Event) | The attacks in a battle to show before the message. |
| [consumes] | <code>number</code> \| <code>string</code> | Amount of consumables used if this is a weapon event. |

<a name="new_HungryGames..Event_new"></a>

#### new Event(message, [numVictim], [numAttacker], [victimOutcome], [attackerOutcome], [victimKiller], [attackerKiller], [battle], [state], [attacks])

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| message | <code>string</code> |  | The message to show. |
| [numVictim] | <code>number</code> | <code>0</code> | The number of victims in this event. |
| [numAttacker] | <code>number</code> | <code>0</code> | The number of attackers in this event. |
| [victimOutcome] | <code>string</code> | <code>&quot;nothing&quot;</code> | The outcome of the victims from this event. |
| [attackerOutcome] | <code>string</code> | <code>&quot;nothing&quot;</code> | The outcome of the attackers from this event. |
| [victimKiller] | <code>boolean</code> | <code>false</code> | Do the victims kill anyone in this event. Used for calculating kill count. |
| [attackerKiller] | <code>boolean</code> | <code>false</code> | Do the attackers kill anyone in this event. Used for calculating kill count. |
| [battle] | <code>boolean</code> | <code>false</code> | Is this event a battle? |
| [state] | <code>number</code> | <code>0</code> | State of event if there are multiple attacks before the event. |
| [attacks] | [<code>Array.&lt;Event&gt;</code>](#HungryGames..Event) | <code>[]</code> | Array of attacks that take place before the event. |

<a name="HungryGames..web"></a>

### HungryGames~web : [<code>HGWeb</code>](#HGWeb) ℗
Instance of the web class that can control this instance.

**Kind**: inner property of [<code>HungryGames</code>](#HungryGames)  
**Access**: private  
<a name="HungryGames..findTimestamps"></a>

### HungryGames~findTimestamps : <code>Object.&lt;number&gt;</code> ℗
Stores the guilds we have looked for their data recently and the timestamp
at which we looked. Used to reduce filesystem requests and blocking.

**Kind**: inner property of [<code>HungryGames</code>](#HungryGames)  
**Access**: private  
<a name="HungryGames..games"></a>

### HungryGames~games : [<code>Object.&lt;GuildGame&gt;</code>](#HungryGames..GuildGame) ℗
All currently tracked games. Mapped by guild ID. In most cases you should
NOT reference this directly. Use [find](#HungryGames..find) to get the game
object for a guild.

**Kind**: inner property of [<code>HungryGames</code>](#HungryGames)  
**Default**: <code>{}</code>  
**Access**: private  
**See**: [find](#HungryGames..find)  
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
<a name="HungryGames..dayEventIntervals"></a>

### HungryGames~dayEventIntervals : <code>Object.&lt;number&gt;</code> ℗
All intervals for printing events.

**Kind**: inner property of [<code>HungryGames</code>](#HungryGames)  
**Default**: <code>{}</code>  
**Access**: private  
<a name="HungryGames..autoPlayTimeout"></a>

### HungryGames~autoPlayTimeout : <code>Object.&lt;number&gt;</code> ℗
The timeout to continue autoplaying after the day ends. Used for cancelling
if user ends the game between days.

**Kind**: inner property of [<code>HungryGames</code>](#HungryGames)  
**Default**: <code>{}</code>  
**Access**: private  
<a name="HungryGames..battleMessage"></a>

### HungryGames~battleMessage : <code>Object.&lt;Discord~Message&gt;</code> ℗
Storage of battle messages to edit the content of on the next update.

**Kind**: inner property of [<code>HungryGames</code>](#HungryGames)  
**Default**: <code>{}</code>  
**Access**: private  
<a name="HungryGames..weapons"></a>

### HungryGames~weapons : [<code>Object.&lt;WeaponEvent&gt;</code>](#HungryGames..WeaponEvent) ℗
All weapons and their respective actions. Parsed from file.

**Kind**: inner property of [<code>HungryGames</code>](#HungryGames)  
**Default**: <code>{}</code>  
**Access**: private  
**See**: [weaponsFile](#HungryGames..weaponsFile)  
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
<a name="HungryGames..listenersEndTime"></a>

### HungryGames~listenersEndTime : <code>number</code> ℗
The last time the currently scheduled reaction event listeners are expected
to end. Used for checking of submoduleis unloadable.

**Kind**: inner property of [<code>HungryGames</code>](#HungryGames)  
**Access**: private  
<a name="HungryGames..patreonSettingKeys"></a>

### HungryGames~patreonSettingKeys : <code>Array.&lt;string&gt;</code> ℗
The permission tags for all settings related to the Hungry Games.

**Kind**: inner constant of [<code>HungryGames</code>](#HungryGames)  
**Default**: <code>[&quot;hg:fun_translators&quot;,&quot;hg:customize_stats&quot;,&quot;hg:personal_weapon&quot;]</code>  
**Access**: private  
<a name="HungryGames..saveFile"></a>

### HungryGames~saveFile : <code>string</code> ℗
The file path to save current state for a specific guild relative to
Common~guildSaveDir.

**Kind**: inner constant of [<code>HungryGames</code>](#HungryGames)  
**Default**: <code>&quot;game.json&quot;</code>  
**Access**: private  
**See**

- [Common~guildSaveDir](Common~guildSaveDir)
- [games](#HungryGames..games)
- [HungryGames~saveFileDir](HungryGames~saveFileDir)
- [hgSaveDir](#HungryGames..hgSaveDir)

<a name="HungryGames..hgSaveDir"></a>

### HungryGames~hgSaveDir : <code>string</code> ℗
The file directory for finding saved data related to the hungry games data
of individual guilds.

**Kind**: inner constant of [<code>HungryGames</code>](#HungryGames)  
**Default**: <code>&quot;/hg/&quot;</code>  
**Access**: private  
**See**

- [Common~guildSaveDir](Common~guildSaveDir)
- [games](#HungryGames..games)
- [saveFile](#HungryGames..saveFile)
- [HungryGames~saveFileDir](HungryGames~saveFileDir)

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
<a name="HungryGames..weaponsFile"></a>

### HungryGames~weaponsFile : <code>string</code> ℗
The file path to read weapon events.

**Kind**: inner constant of [<code>HungryGames</code>](#HungryGames)  
**Default**: <code>&quot;./save/hgWeapons.json&quot;</code>  
**Access**: private  
**See**: [weapons](#HungryGames..weapons)  
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
<a name="HungryGames..fetchSize"></a>

### HungryGames~fetchSize : <code>number</code> ℗
The size of the icon to request from discord.

**Kind**: inner constant of [<code>HungryGames</code>](#HungryGames)  
**Default**: <code>128</code>  
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
**Default**: <code>5 Minutes</code>  
**Access**: private  
<a name="HungryGames..findDelay"></a>

### HungryGames~findDelay : <code>number</code> ℗
The delay after failing to find a guild's data to look for it again.

**Kind**: inner constant of [<code>HungryGames</code>](#HungryGames)  
**Default**: <code>15 Seconds</code>  
**Access**: private  
<a name="HungryGames..defaultOptions"></a>

### HungryGames~defaultOptions : <code>Object.&lt;{value: (string\|number\|boolean\|Object), values: ?Array.&lt;string&gt;, range: ?{min:number, max:number}, comment: string, category: string}&gt;</code> ℗
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
<a name="HungryGames..updateWeapons"></a>

### HungryGames~updateWeapons() ℗
Parse all weapons events from file.

**Kind**: inner method of [<code>HungryGames</code>](#HungryGames)  
**Access**: private  
<a name="HungryGames..setupHelp"></a>

### HungryGames~setupHelp() ℗
Set all help messages once we know what prefix to use.

**Kind**: inner method of [<code>HungryGames</code>](#HungryGames)  
**Access**: private  
<a name="HungryGames..handleMessageEdit"></a>

### HungryGames~handleMessageEdit(oldMsg, newMsg) ℗
Handler for when the create event message is edited and we should update
our message with the updated event.

**Kind**: inner method of [<code>HungryGames</code>](#HungryGames)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| oldMsg | <code>Discord~Message</code> | The message before being edited. |
| newMsg | <code>Discord~Message</code> | The message after being edited. |

<a name="HungryGames..mkCmd"></a>

### HungryGames~mkCmd(cb) ⇒ <code>Command~commandHandler</code> ℗
Make a subcommand handler with the given callback function. This is a
wrapper around existing functions.

**Kind**: inner method of [<code>HungryGames</code>](#HungryGames)  
**Returns**: <code>Command~commandHandler</code> - Subcommand initial handler that will fire
when command is fired. Calls the passed callback handler with the mapped
parameters.  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| cb | [<code>hgCommandHandler</code>](#HungryGames..hgCommandHandler) | Command handler when subcommand is triggered. |

<a name="HungryGames..commandMakeMeWin"></a>

### HungryGames~commandMakeMeWin(msg) : [<code>commandHandler</code>](#commandHandler) ℗
Tell a user their chances of winning have not increased.

**Kind**: inner method of [<code>HungryGames</code>](#HungryGames)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord~Message</code> | Message that triggered command. |

<a name="HungryGames..commandMakeMeLose"></a>

### HungryGames~commandMakeMeLose(msg) : [<code>commandHandler</code>](#commandHandler) ℗
Tell a user their chances of losing have not increased.

**Kind**: inner method of [<code>HungryGames</code>](#HungryGames)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord~Message</code> | Message that triggered command. |

<a name="HungryGames..makePlayer"></a>

### HungryGames~makePlayer(member) ⇒ [<code>Player</code>](#HungryGames..Player) ℗
Create a Player from a given Discord.User.

**Kind**: inner method of [<code>HungryGames</code>](#HungryGames)  
**Returns**: [<code>Player</code>](#HungryGames..Player) - Player object created from User.  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| member | <code>Discord~User</code> \| <code>Discord~GuildMember</code> | User or GuildMember to make a Player from. |

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

### HungryGames~createGame(msg, id, [silent], [cb]) : [<code>hgCommandHandler</code>](#HungryGames..hgCommandHandler) ℗
Create a Hungry Games for a guild.

**Kind**: inner method of [<code>HungryGames</code>](#HungryGames)  
**Access**: private  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| msg | <code>Discord~Message</code> |  | The message that lead to this being called. |
| id | <code>string</code> |  | The id of the guild this was triggered from. |
| [silent] | <code>boolean</code> | <code>false</code> | Should we suppress replies to message. |
| [cb] | <code>function</code> |  | Callback that fires once loading is complete. No parameters. |

<a name="HungryGames..fetchPatreonSettings"></a>

### HungryGames~fetchPatreonSettings(players, cId, gId, [cb]) ℗
Given an array of players, lookup the settings for each and update their
data. This is asynchronous.

**Kind**: inner method of [<code>HungryGames</code>](#HungryGames)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| players | [<code>Array.&lt;Player&gt;</code>](#HungryGames..Player) | The players to lookup and update. |
| cId | <code>string</code> \| <code>number</code> | The channel ID to fetch the settings for. |
| gId | <code>string</code> \| <code>number</code> | The guild ID to fetch the settings for. |
| [cb] | <code>function</code> | Calls this callback on completion. No parameters. |


* [~fetchPatreonSettings(players, cId, gId, [cb])](#HungryGames..fetchPatreonSettings) ℗
    * [~onCheckPatron(err, info, p)](#HungryGames..fetchPatreonSettings..onCheckPatron) ℗
    * [~onPermResponse(err, info, p)](#HungryGames..fetchPatreonSettings..onPermResponse) ℗
    * [~onSettingResponse(err, info, p, setting)](#HungryGames..fetchPatreonSettings..onSettingResponse) ℗

<a name="HungryGames..fetchPatreonSettings..onCheckPatron"></a>

#### fetchPatreonSettings~onCheckPatron(err, info, p) ℗
After retrieving whether the player is an actual patron (ignores
overrides), then fetch permissions from them (uses overrides).

**Kind**: inner method of [<code>fetchPatreonSettings</code>](#HungryGames..fetchPatreonSettings)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| err | <code>string</code> | Error string or null. |
| info | <code>Object</code> | Permission information. |
| p | <code>number</code> | Player object to update. |

<a name="HungryGames..fetchPatreonSettings..onPermResponse"></a>

#### fetchPatreonSettings~onPermResponse(err, info, p) ℗
After retrieving a player's permissions, fetch their settings for each.

**Kind**: inner method of [<code>fetchPatreonSettings</code>](#HungryGames..fetchPatreonSettings)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| err | <code>string</code> | Error string or null. |
| info | <code>Object</code> | Permission information. |
| p | <code>number</code> | Player object to update. |

<a name="HungryGames..fetchPatreonSettings..onSettingResponse"></a>

#### fetchPatreonSettings~onSettingResponse(err, info, p, setting) ℗
After retrieving a player's settings, update their data with the relevant
values.

**Kind**: inner method of [<code>fetchPatreonSettings</code>](#HungryGames..fetchPatreonSettings)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| err | <code>string</code> | Error string or null. |
| info | <code>Object</code> | Permission information. |
| p | <code>number</code> | Player object to update. |
| setting | <code>string</code> | The setting name to update. |

<a name="HungryGames..getAllPlayers"></a>

### HungryGames~getAllPlayers(members, excluded, bots, included, excludeByDefault) ⇒ [<code>Array.&lt;Player&gt;</code>](#HungryGames..Player) ℗
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
| included | <code>Array.&lt;string&gt;</code> | Array of ids of users that should be included in the games. Used if excludeByDefault is true. |
| excludeByDefault | <code>boolean</code> | Should new users be excluded from the game by default? |

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

<a name="HungryGames..startGame..loadingComplete"></a>

#### startGame~loadingComplete() ℗
Once the game has finished loading all necessary data, start it if
autoplay is enabled.

**Kind**: inner method of [<code>startGame</code>](#HungryGames..startGame)  
**Access**: private  
<a name="HungryGames..makeMessage"></a>

### HungryGames~makeMessage(uId, gId, cId, msg) ⇒ <code>Object</code> ℗
Forms a Discord~Message similar object from given IDs.

**Kind**: inner method of [<code>HungryGames</code>](#HungryGames)  
**Returns**: <code>Object</code> - The created message-like object.  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| uId | <code>string</code> | The id of the user who wrote this message. |
| gId | <code>string</code> | The id of the guild this message is in. |
| cId | <code>string</code> | The id of the channel this message was 'sent' in. |
| msg | <code>string</code> | The message content. |

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

### HungryGames~nextDay(msg, id, [retry]) : [<code>hgCommandHandler</code>](#HungryGames..hgCommandHandler) ℗
Simulate a single day then show events to users.

**Kind**: inner method of [<code>HungryGames</code>](#HungryGames)  
**Access**: private  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| msg | <code>Discord~Message</code> |  | The message that lead to this being called. |
| id | <code>string</code> |  | The id of the guild this was triggered from. |
| [retry] | <code>boolean</code> | <code>true</code> | If we hit an error, should we retry before giving up. |

<a name="HungryGames..effectUser"></a>

### HungryGames~effectUser(id, affected, kills, [weapon]) ℗
Base of all actions to perform on a player.

**Kind**: inner method of [<code>HungryGames</code>](#HungryGames)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>string</code> | The guild id of the game. |
| affected | [<code>Player</code>](#HungryGames..Player) | The player to affect. |
| kills | <code>number</code> | The number of kills the player gets in this action. |
| [weapon] | <code>Array.&lt;HungryGames~Weapon&gt;</code> | The weapon being used if any. |

<a name="HungryGames..killUser"></a>

### HungryGames~killUser(id, a, k, [w]) ℗
Kill the given player in the given guild game.

**Kind**: inner method of [<code>HungryGames</code>](#HungryGames)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>string</code> | The guild id of the game. |
| a | [<code>Player</code>](#HungryGames..Player) | The player to affect. |
| k | <code>number</code> | The number of kills the player gets in this action. |
| [w] | <code>Array.&lt;HungryGames~Weapon&gt;</code> | The weapon being used if any. |

<a name="HungryGames..woundUser"></a>

### HungryGames~woundUser(id, a, k, [w]) ℗
Wound the given player in the given guild game.

**Kind**: inner method of [<code>HungryGames</code>](#HungryGames)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>string</code> | The guild id of the game. |
| a | [<code>Player</code>](#HungryGames..Player) | The player to affect. |
| k | <code>number</code> | The number of kills the player gets in this action. |
| [w] | <code>Array.&lt;HungryGames~Weapon&gt;</code> | The weapon being used if any. |

<a name="HungryGames..restoreUser"></a>

### HungryGames~restoreUser(id, a, k, [w]) ℗
Heal the given player in the given guild game.

**Kind**: inner method of [<code>HungryGames</code>](#HungryGames)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>string</code> | The guild id of the game. |
| a | [<code>Player</code>](#HungryGames..Player) | The player to affect. |
| k | <code>number</code> | The number of kills the player gets in this action. |
| [w] | <code>Array.&lt;HungryGames~Weapon&gt;</code> | The weapon being used if any. |

<a name="HungryGames..reviveUser"></a>

### HungryGames~reviveUser(id, a, k, [w]) ℗
Revive the given player in the given guild game.

**Kind**: inner method of [<code>HungryGames</code>](#HungryGames)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>string</code> | The guild id of the game. |
| a | [<code>Player</code>](#HungryGames..Player) | The player to affect. |
| k | <code>number</code> | The number of kills the player gets in this action. |
| [w] | <code>Array.&lt;HungryGames~Weapon&gt;</code> | The weapon being used if any. |

<a name="HungryGames..pickEvent"></a>

### HungryGames~pickEvent(userPool, eventPool, options, numAlive, numTotal, teams, probOpts, weaponWielder) ⇒ [<code>Event</code>](#HungryGames..Event) ℗
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
| numTotal | <code>number</code> | Number of players in the game total. |
| teams | [<code>Array.&lt;Team&gt;</code>](#HungryGames..Team) | Array of teams in this game. |
| probOpts | <code>HungryGames~OutcomeProbabilities</code> | Death rate weights. |
| weaponWielder | <code>Player</code> | A player that is using a weapon in this event, or null if no player is using a weapon. |

<a name="HungryGames..validateEventTeamConstraint"></a>

### HungryGames~validateEventTeamConstraint(numVictim, numAttacker, userPool, teams, options, victimsDie, attackersDie, weaponWielder) ⇒ <code>string</code> ℗
Ensure teammates don't attack each other.

**Kind**: inner method of [<code>HungryGames</code>](#HungryGames)  
**Returns**: <code>string</code> - String describing failing check, or null of pass.  
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
| weaponWielder | <code>Player</code> | A player that is using a weapon in this event, or null if no player is using a weapon. |

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
from the number of players left to choose from.  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| numVictim | <code>number</code> | Number of victims in this event. |
| numAttacker | <code>number</code> | Number of attackers in this event. |
| userPool | [<code>Array.&lt;Player&gt;</code>](#HungryGames..Player) | Pool of all remaining players to put into an event. |
| numAlive | <code>number</code> | Total number of living players left in the game. |

<a name="HungryGames..validateEventRequirements"></a>

### HungryGames~validateEventRequirements(numVictim, numAttacker, userPool, numAlive, teams, options, victimsDie, attackersDie, weaponWielder) ⇒ <code>string</code> ℗
Ensure the event chosen meets all requirements for actually being used in
the current game.

**Kind**: inner method of [<code>HungryGames</code>](#HungryGames)  
**Returns**: <code>string</code> - String of failing constraint check, or null if passes.  
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
| weaponWielder | <code>Player</code> | A player that is using a weapon in this event, or null if no player is using a weapon. |

<a name="HungryGames..pickAffectedPlayers"></a>

### HungryGames~pickAffectedPlayers(numVictim, numAttacker, victimOutcome, attackerOutcome, options, userPool, deadPool, teams, weaponWielder) ⇒ [<code>Array.&lt;Player&gt;</code>](#HungryGames..Player) ℗
Pick the players to put into an event.

**Kind**: inner method of [<code>HungryGames</code>](#HungryGames)  
**Returns**: [<code>Array.&lt;Player&gt;</code>](#HungryGames..Player) - Array of all players that will be affected
by this event.  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| numVictim | <code>number</code> | Number of victims in this event. |
| numAttacker | <code>number</code> | Number of attackers in this event. |
| victimOutcome | <code>string</code> | Outcome of victims. If "revived", uses deadPool instead of uesrPool. |
| attackerOutcome | <code>string</code> | Outcome of attackers. If "revived", uses deadPool instead of uesrPool. |
| options | <code>Object</code> | Options for this game. |
| userPool | [<code>Array.&lt;Player&gt;</code>](#HungryGames..Player) | Pool of all remaining players to put into an event. |
| deadPool | [<code>Array.&lt;Player&gt;</code>](#HungryGames..Player) | Pool of all dead players that can be revived. |
| teams | [<code>Array.&lt;Team&gt;</code>](#HungryGames..Team) | All teams in this game. |
| weaponWielder | <code>Player</code> | A player that is using a weapon in this event, or null if no player is using a weapon. |

<a name="HungryGames..makeBattleEvent"></a>

### HungryGames~makeBattleEvent(affectedUsers, numVictim, numAttacker, mention, id, [useNicknames]) ⇒ [<code>Event</code>](#HungryGames..Event) ℗
Make an event that contains a battle between players before the main event
message.

**Kind**: inner method of [<code>HungryGames</code>](#HungryGames)  
**Returns**: [<code>Event</code>](#HungryGames..Event) - The event that was created.  
**Access**: private  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| affectedUsers | [<code>Array.&lt;Player&gt;</code>](#HungryGames..Player) |  | All of the players involved in the event. |
| numVictim | <code>number</code> |  | The number of victims in this event. |
| numAttacker | <code>number</code> |  | The number of attackers in this event. |
| mention | <code>boolean</code> |  | Should every player be mentioned when their name comes up? |
| id | <code>string</code> |  | The id of the guild that triggered this initially. |
| [useNicknames] | <code>boolean</code> | <code>false</code> | Should we use guild nicknames instead of usernames? |

<a name="HungryGames..weightedUserRand"></a>

### HungryGames~weightedUserRand() ⇒ <code>number</code> ℗
Produce a random number that is weighted by multiEventUserDistribution.

**Kind**: inner method of [<code>HungryGames</code>](#HungryGames)  
**Returns**: <code>number</code> - The weighted number outcome.  
**Access**: private  
**See**: [multiEventUserDistribution](#HungryGames..multiEventUserDistribution)  
<a name="HungryGames..probabilityEvent"></a>

### HungryGames~probabilityEvent(eventPool, probabilityOpts, [recurse]) ⇒ <code>number</code> ℗
Produce a random event that using probabilities set in options.

**Kind**: inner method of [<code>HungryGames</code>](#HungryGames)  
**Returns**: <code>number</code> - The index of the event that was chosen.  
**Access**: private  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| eventPool | [<code>Array.&lt;Event&gt;</code>](#HungryGames..Event) |  | The pool of all events to consider. |
| probabilityOpts | <code>Object</code> |  | The probabilities of each type of event being used. |
| [recurse] | <code>number</code> | <code>0</code> | The current recursive depth. |

<a name="HungryGames..formatMultiNames"></a>

### HungryGames~formatMultiNames(names, [format]) ⇒ <code>string</code> ℗
Format an array of users into names based on options and grammar rules.

**Kind**: inner method of [<code>HungryGames</code>](#HungryGames)  
**Returns**: <code>string</code> - The formatted string of names.  
**Access**: private  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| names | [<code>Array.&lt;Player&gt;</code>](#HungryGames..Player) |  | An array of players to format the names of. |
| [format] | <code>string</code> | <code>&quot;&#x27;username&#x27;&quot;</code> | Setting of how to format the user's name. `username` will use their account name, `mention` will use their ID to format a mention tag, `nickname` will use their custom guild nickname. |

<a name="HungryGames..makeMessageEvent"></a>

### HungryGames~makeMessageEvent(message, [id]) ⇒ [<code>Event</code>](#HungryGames..Event) ℗
Make an event that doesn't affect any players and is just a plain message.

**Kind**: inner method of [<code>HungryGames</code>](#HungryGames)  
**Returns**: [<code>Event</code>](#HungryGames..Event) - The event that was created.  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| message | <code>string</code> | The message to show. |
| [id] | <code>string</code> | The id of the guild that initially triggered this. Required only if the given message contains '{dead}'. |

<a name="HungryGames..makeSingleEvent"></a>

### HungryGames~makeSingleEvent(message, affectedUsers, numVictim, numAttacker, mention, id, victimOutcome, attackerOutcome, [useNickname]) ⇒ <code>HungryGames~FinalEvent</code> ℗
Format an event string based on specified users.

**Kind**: inner method of [<code>HungryGames</code>](#HungryGames)  
**Returns**: <code>HungryGames~FinalEvent</code> - The final event that was created and
formatted ready for display.  
**Access**: private  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| message | <code>string</code> |  | The message to show. |
| affectedUsers | [<code>Array.&lt;Player&gt;</code>](#HungryGames..Player) |  | An array of all users affected by this event. |
| numVictim | <code>number</code> |  | Number of victims in this event. |
| numAttacker | <code>number</code> |  | Number of attackers in this event. |
| mention | <code>boolean</code> |  | Should all users be mentioned when their name appears? |
| id | <code>string</code> |  | The id of the guild this was initially triggered from. |
| victimOutcome | <code>string</code> |  | The outcome of the victims from this event. |
| attackerOutcome | <code>string</code> |  | The outcome of the attackers from this event. |
| [useNickname] | <code>boolean</code> | <code>false</code> | Use player nicknames instead of their username. |

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

### HungryGames~getName(guild, user) ⇒ <code>string</code> ℗
Get the username of a user id if available, or their id if they couldn't be
found.

**Kind**: inner method of [<code>HungryGames</code>](#HungryGames)  
**Returns**: <code>string</code> - The user's name or id if name was unable to be found.  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| guild | <code>Discord~Guild</code> | The guild to look for the user in. |
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

<a name="HungryGames..changeObjectValue"></a>

### HungryGames~changeObjectValue(obj, defaultObj, option, value, values, id, [range]) ⇒ <code>string</code> ℗
Recurse through an object to change a certain child value based off a given
array of words.

**Kind**: inner method of [<code>HungryGames</code>](#HungryGames)  
**Returns**: <code>string</code> - Message saying what happened. Can be an error message.  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| obj | <code>HungryGames~GuildGame.options</code> | The object with the values to change. |
| defaultObj | [<code>defaultOptions</code>](#HungryGames..defaultOptions) | The default template object to base changes off of. |
| option | <code>string</code> | The first value to check. |
| value | <code>number</code> \| <code>boolean</code> \| <code>string</code> | The value to change to, or the next option key to check if we have not found an end to a branch yet. |
| values | <code>Array.&lt;(string\|boolean\|number)&gt;</code> | All keys leading to the final value, as well as the final value. |
| id | <code>string</code> | The id of the guild this was triggered for. |
| [range] | <code>Object</code> | Allowable range for values that are numbers. |

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

### HungryGames~editTeam(msg, id, [silent]) ⇒ <code>string</code> ℗
Entry for all team commands.

**Kind**: inner method of [<code>HungryGames</code>](#HungryGames)  
**Returns**: <code>string</code> - Error message or null if no error.  
**Access**: private  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| msg | <code>Discord~Message</code> |  | The message that lead to this being called. |
| id | <code>string</code> |  | The id of the guild this was triggered from. |
| [silent] | <code>boolean</code> | <code>false</code> | Should we disable replying to the given message? |

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

### HungryGames~renameTeam(msg, id, [silent]) ℗
Rename a team.

**Kind**: inner method of [<code>HungryGames</code>](#HungryGames)  
**Access**: private  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| msg | <code>Discord~Message</code> |  | The message that lead to this being called. |
| id | <code>string</code> |  | The id of the guild this was triggered from. |
| [silent] | <code>boolean</code> | <code>false</code> | Disable replying to message. |

<a name="HungryGames..randomizeTeams"></a>

### HungryGames~randomizeTeams(msg, id, [silent]) ℗
Swap random users between teams.

**Kind**: inner method of [<code>HungryGames</code>](#HungryGames)  
**Access**: private  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| msg | <code>Discord~Message</code> |  | The message that lead to this being called. |
| id | <code>string</code> |  | The id of the guild this was triggered from. |
| [silent] | <code>boolean</code> | <code>false</code> | If true, this will not attempt to send messages to the channel where the msg was sent.. |

<a name="HungryGames..createEvent"></a>

### HungryGames~createEvent(msg, id) : [<code>hgCommandHandler</code>](#HungryGames..hgCommandHandler) ℗
Create a custom event for a guild.

**Kind**: inner method of [<code>HungryGames</code>](#HungryGames)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord~Message</code> | The message that lead to this being called. |
| id | <code>string</code> | The id of the guild this was triggered from. |

<a name="HungryGames..commandToggleEvent"></a>

### HungryGames~commandToggleEvent(msg, id) : [<code>hgCommandHandler</code>](#HungryGames..hgCommandHandler)
Toggle events in the games.

**Kind**: inner method of [<code>HungryGames</code>](#HungryGames)  
**Todo:**: Write this. This is not implemented yet.  

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
| show | <code>string</code> | The message to show explaining the number. |
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
| show | <code>string</code> | The message to show explaining the options. |
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
| show | <code>string</code> | The message to show explaining the options. |
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
| arenaEvent | [<code>Event</code>](#HungryGames..Event) \| <code>string</code> |  | The event to format. |
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

<a name="HungryGames..commandStats"></a>

### HungryGames~commandStats(msg, id) : [<code>hgCommandHandler</code>](#HungryGames..hgCommandHandler) ℗
Replies to the user with stats about all the currently loaded games in this
shard.

**Kind**: inner method of [<code>HungryGames</code>](#HungryGames)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord~Message</code> | The message that lead to this being called. |
| id | <code>string</code> | The id of the guild this was triggered from. |

<a name="HungryGames..commandRig"></a>

### HungryGames~commandRig(msg, id) : [<code>hgCommandHandler</code>](#HungryGames..hgCommandHandler) ℗
Replies to the user with an image saying "rigged". That is all.

**Kind**: inner method of [<code>HungryGames</code>](#HungryGames)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord~Message</code> | The message that lead to this being called. |
| id | <code>string</code> | The id of the guild this was triggered from. |

<a name="HungryGames..commandKill"></a>

### HungryGames~commandKill(msg, id) : [<code>hgCommandHandler</code>](#HungryGames..hgCommandHandler) ℗
Allows the game creator to kill a player in the game.

**Kind**: inner method of [<code>HungryGames</code>](#HungryGames)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord~Message</code> | The message that lead to this being called. |
| id | <code>string</code> | The id of the guild this was triggered from. |

<a name="HungryGames..commandHeal"></a>

### HungryGames~commandHeal(msg, id) : [<code>hgCommandHandler</code>](#HungryGames..hgCommandHandler) ℗
Allows the game creator to heal or revive a player in the game.

**Kind**: inner method of [<code>HungryGames</code>](#HungryGames)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord~Message</code> | The message that lead to this being called. |
| id | <code>string</code> | The id of the guild this was triggered from. |

<a name="HungryGames..commandWound"></a>

### HungryGames~commandWound(msg, id) : [<code>hgCommandHandler</code>](#HungryGames..hgCommandHandler) ℗
Allows the game creator to wound a player in the game.

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

<a name="HungryGames..find"></a>

### HungryGames~find(id) ⇒ [<code>GuildGame</code>](#HungryGames..GuildGame) ℗
Returns a guild's game data. Returns cached version if that exists, or
searches the file system for saved data. Data will only be checked from
disk at most once every `HungryGames~findDelay` milliseconds. Returns
`null` if data could not be found, or an error occurred.

**Kind**: inner method of [<code>HungryGames</code>](#HungryGames)  
**Returns**: [<code>GuildGame</code>](#HungryGames..GuildGame) - The game data, or null if no game could be
loaded.  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>number</code> \| <code>string</code> | The guild id to get the data for. |

<a name="HungryGames..calcColNum"></a>

### HungryGames~calcColNum(numCols, statusList) ⇒ <code>number</code> ℗
Calculates the number of columns for the given player list. Assumes maximum
character count of 1024 per section. The number of columns also becomes
limited to 5, because we will run into the embed total character limit of
6000 if we add any more.
[Discord API Docs](
https://discordapp.com/developers/docs/resources/channel#embed-limits)

**Kind**: inner method of [<code>HungryGames</code>](#HungryGames)  
**Returns**: <code>number</code> - Number of columns the data shall be formatted as.  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| numCols | <code>number</code> | Minimum number of columns. |
| statusList | <code>Array.&lt;string&gt;</code> | List of text to check. |

<a name="HungryGames..deepFreeze"></a>

### HungryGames~deepFreeze(object) ⇒ <code>Object</code> ℗
Recursively freeze all elements of an object.

**Kind**: inner method of [<code>HungryGames</code>](#HungryGames)  
**Returns**: <code>Object</code> - The frozen object.  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| object | <code>Object</code> | The object to deep freeze. |

<a name="HungryGames..newReact"></a>

### HungryGames~newReact(duration) ℗
Update [listenersEndTime](#HungryGames..listenersEndTime) because a new listener was
registered with the given duration.

**Kind**: inner method of [<code>HungryGames</code>](#HungryGames)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| duration | <code>number</code> | The length of time the listener will be active. |

<a name="HungryGames..readImage"></a>

### HungryGames~readImage(url) ⇒ <code>Promise</code> ℗
Attempt to fetch an image from a URL. Checks if the file has been cached to
the filesystem first.

**Kind**: inner method of [<code>HungryGames</code>](#HungryGames)  
**Returns**: <code>Promise</code> - Promise from JIMP with image data.  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| url | <code>string</code> | The url to fetch the image from. |

<a name="HungryGames..readImage..toJimp"></a>

#### readImage~toJimp(path) ⇒ <code>Promise</code> ℗
Send the request to Jimp to handle.

**Kind**: inner method of [<code>readImage</code>](#HungryGames..readImage)  
**Returns**: <code>Promise</code> - Promise from Jimp with image data.  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| path | <code>string</code> | Or path that Jimp can handle. |

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
<a name="HungryGames..OutcomeProbabilities}"></a>

### HungryGames~OutcomeProbabilities} : <code>Object</code>
Probabilities for each choosing an event with each type of outcome.

**Kind**: inner typedef of [<code>HungryGames</code>](#HungryGames)  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| kill | <code>number</code> | Relative probability of events that can kill. |
| wound | <code>number</code> | Relative probability of events that can wound. |
| thrive | <code>number</code> | Relative probability of events that can heal. |
| nothing | <code>number</code> | Relative probability of events that do nothing. |

<a name="HungryGames..GuildGame"></a>

### HungryGames~GuildGame : <code>Object</code>
A singe instance of a game in a guild.

**Kind**: inner typedef of [<code>HungryGames</code>](#HungryGames)  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| excludedUsers | <code>Array.&lt;string&gt;</code> | Array of user IDs that have been excluded from the games. |
| includedUsers | <code>Array.&lt;string&gt;</code> | Array of user IDs that will be included in the next game to be created. |
| options | <code>Object.&lt;(number\|boolean\|string\|Object)&gt;</code> | The game options. |
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
| forcedOutcomes | <code>Array.&lt;Object&gt;</code> | List of outcomes and players to force before the end of the day. Does not affect the simulation, outcomes are forced by appending events at the end of the simulated day. |
| ended | <code>boolean</code> | Has the game ended. |
| day | <code>Object</code> | Information about the day that was simulated. |

<a name="HungryGames..hgCommandHandler"></a>

### HungryGames~hgCommandHandler : <code>function</code>
Handler for a Hungry Games command.

**Kind**: inner typedef of [<code>HungryGames</code>](#HungryGames)  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord~Message</code> | The message sent in Discord that triggered this command. |
| id | <code>string</code> | The id of the guild this command was run on for convenience. |

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
| outcomeProbs | <code>Object</code> | Overrides the global setting for arena event outcome probabilities for this event. |
| outcomes | [<code>Array.&lt;Event&gt;</code>](#HungryGames..Event) | All possible events in this arena event. |

<a name="HungryGames..WeaponEvent"></a>

### HungryGames~WeaponEvent : <code>Object</code>
An Arena event storing Events.

**Kind**: inner typedef of [<code>HungryGames</code>](#HungryGames)  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| [name] | <code>string</code> | Formattable name to use as the human readable weapon name. |
| [consumable] | <code>string</code> | The formattable string for what to call this weapons consumable items. |
| outcomes | [<code>Array.&lt;Event&gt;</code>](#HungryGames..Event) | All possible events in this weapon event. |

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
        * *[.postPrefix](#SubModule+postPrefix) : <code>string</code>*
        * [.Discord](#SubModule+Discord) : <code>Discord</code>
        * [.client](#SubModule+client) : <code>Discord~Client</code>
        * [.command](#SubModule+command) : [<code>Command</code>](#Command)
        * [.common](#SubModule+common) : [<code>Common</code>](#Common)
        * [.bot](#SubModule+bot) : [<code>SpikeyBot</code>](#SpikeyBot)
        * [.myName](#SubModule+myName) : <code>string</code>
        * [.initialized](#SubModule+initialized) : <code>boolean</code>
        * [.commit](#SubModule+commit) : <code>string</code>
        * [.loadTime](#SubModule+loadTime) : <code>number</code>
        * [.initialize()](#SubModule+initialize)
        * [.begin(Discord, client, command, common, bot)](#SubModule+begin)
        * [.end()](#SubModule+end)
        * [.log(msg)](#SubModule+log)
        * [.debug(msg)](#SubModule+debug)
        * [.warn(msg)](#SubModule+warn)
        * [.error(msg)](#SubModule+error)
        * [.shutdown()](#SubModule+shutdown)
        * [.save([opt])](#SubModule+save)
        * *[.unloadable()](#SubModule+unloadable) ⇒ <code>boolean</code>*
    * _inner_
        * [~version](#Main..version) : <code>string</code> ℗
        * [~commit](#Main..commit) : <code>string</code> ℗
        * [~prevUserSayId](#Main..prevUserSayId) : <code>string</code> ℗
        * [~prevUserSayCnt](#Main..prevUserSayCnt) : <code>number</code> ℗
        * [~timers](#Main..timers) : [<code>Array.&lt;Timer&gt;</code>](#Main..Timer) ℗
        * [~disabledAutoSmite](#Main..disabledAutoSmite) : <code>Object.&lt;boolean&gt;</code> ℗
        * [~disabledBanMessage](#Main..disabledBanMessage) : <code>Object.&lt;boolean&gt;</code> ℗
        * [~mentionAccumulator](#Main..mentionAccumulator) : <code>Object.&lt;Object.&lt;string&gt;&gt;</code> ℗
        * [~introduction](#Main..introduction) : <code>string</code> ℗
        * [~blockedmessage](#Main..blockedmessage) : <code>string</code> ℗
        * [~addmessage](#Main..addmessage) : <code>string</code> ℗
        * [~addLink](#Main..addLink) : <code>string</code> ℗
        * [~banMsgs](#Main..banMsgs) : <code>Array.&lt;string&gt;</code> ℗
        * [~defaultCode](#Main..defaultCode) : <code>Array.&lt;string&gt;</code> ℗
        * [~helpObject](#Main..helpObject) ℗
        * [~adminHelpObject](#Main..adminHelpObject) ℗
        * [~mkAndWrite(filename, dir, data)](#Main..mkAndWrite) ℗
        * [~mkAndWriteSync(filename, dir, data)](#Main..mkAndWriteSync) ℗
        * [~onGuildCreate(guild)](#Main..onGuildCreate) ℗
        * [~onGuildDelete(guild)](#Main..onGuildDelete) ℗
        * [~onGuildBanAdd(guild, user)](#Main..onGuildBanAdd) ℗
        * [~commandToggleMute(msg)](#Main..commandToggleMute) : [<code>commandHandler</code>](#commandHandler) ℗
        * [~commandToggleBanMessages(msg)](#Main..commandToggleBanMessages) : [<code>commandHandler</code>](#commandHandler) ℗
        * [~onMessage(msg)](#Main..onMessage) ℗
        * [~checkSimilarity(s1, s2)](#Main..checkSimilarity) ⇒ <code>number</code> ℗
        * [~editDistance(s1, s2)](#Main..editDistance) ⇒ <code>number</code> ℗
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
        * [~commandPmUser(msg)](#Main..commandPmUser) : [<code>commandHandler</code>](#commandHandler) ℗
            * [~lookupByName()](#Main..commandPmUser..lookupByName) ℗
            * [~sendPm(msg, user, message)](#Main..commandPmUser..sendPm) ℗
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
        * [~commandRollDie(msg)](#Main..commandRollDie) : [<code>commandHandler</code>](#commandHandler) ℗
        * [~commandPerms(msg)](#Main..commandPerms) : [<code>commandHandler</code>](#commandHandler) ℗
        * [~prePad(num, digits)](#Main..prePad) ⇒ <code>string</code> ℗
        * [~commandStats(msg)](#Main..commandStats) : [<code>commandHandler</code>](#commandHandler) ℗
        * [~getAllStats(cb)](#Main..getAllStats) ℗
            * [~values](#Main..getAllStats..values) ℗
            * [~statsResponse(res)](#Main..getAllStats..statsResponse) ℗
        * [~getStats()](#Main..getStats) ⇒ <code>Object</code> ℗
        * [~commandLookup(msg)](#Main..commandLookup) : [<code>commandHandler</code>](#commandHandler) ℗
        * [~commandSendTo(msg)](#Main..commandSendTo) : [<code>commandHandler</code>](#commandHandler) ℗
        * [~commandThankYou(msg)](#Main..commandThankYou) : [<code>commandHandler</code>](#commandHandler) ℗
        * [~commandListCommands(msg)](#Main..commandListCommands) : [<code>commandHandler</code>](#commandHandler) ℗
        * [~commandGetPrefix(msg)](#Main..commandGetPrefix) : <code>Command~commandHandler</code> ℗
        * [~sigint()](#Main..sigint) ℗
        * [~Timer](#Main..Timer) : <code>Object</code>

<a name="SubModule+helpMessage"></a>

### main.helpMessage : <code>string</code> \| <code>Discord~MessageEmbed</code>
The help message to show the user in the main help message.

**Kind**: instance property of [<code>Main</code>](#Main)  
**Overrides**: [<code>helpMessage</code>](#SubModule+helpMessage)  
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

### main.command : [<code>Command</code>](#Command)
The command object for registering command listeners.

**Kind**: instance property of [<code>Main</code>](#Main)  
<a name="SubModule+common"></a>

### main.common : [<code>Common</code>](#Common)
The common object.

**Kind**: instance property of [<code>Main</code>](#Main)  
<a name="SubModule+bot"></a>

### main.bot : [<code>SpikeyBot</code>](#SpikeyBot)
The parent SpikeyBot instance.

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
<a name="SubModule+commit"></a>

### main.commit : <code>string</code>
The commit at HEAD at the time this module was loaded. Essentially the
version of this submodule.

**Kind**: instance constant of [<code>Main</code>](#Main)  
**Access**: public  
<a name="SubModule+loadTime"></a>

### main.loadTime : <code>number</code>
The time at which this madule was loaded for use in checking if the module
needs to be reloaded because the file has been modified since loading.

**Kind**: instance constant of [<code>Main</code>](#Main)  
**Access**: public  
<a name="SubModule+initialize"></a>

### main.initialize()
The function called at the end of begin() for further initialization
specific to the subModule. Must be defined before begin() is called.

**Kind**: instance method of [<code>Main</code>](#Main)  
**Overrides**: [<code>initialize</code>](#SubModule+initialize)  
**Access**: protected  
<a name="SubModule+begin"></a>

### main.begin(Discord, client, command, common, bot)
Initialize this submodule.

**Kind**: instance method of [<code>Main</code>](#Main)  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| Discord | <code>Discord</code> | The Discord object for the API library. |
| client | <code>Discord~Client</code> | The client that represents this bot. |
| command | [<code>Command</code>](#Command) | The command instance in which to register command listeners. |
| common | [<code>Common</code>](#Common) | Class storing common functions. |
| bot | [<code>SpikeyBot</code>](#SpikeyBot) | The parent SpikeyBot instance. |

<a name="SubModule+end"></a>

### main.end()
Trigger subModule to shutdown and get ready for process terminating.

**Kind**: instance method of [<code>Main</code>](#Main)  
**Access**: public  
<a name="SubModule+log"></a>

### main.log(msg)
Log using common.log, but automatically set name.

**Kind**: instance method of [<code>Main</code>](#Main)  
**Access**: protected  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>string</code> | The message to log. |

<a name="SubModule+debug"></a>

### main.debug(msg)
Log using common.logDebug, but automatically set name.

**Kind**: instance method of [<code>Main</code>](#Main)  
**Access**: protected  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>string</code> | The message to log. |

<a name="SubModule+warn"></a>

### main.warn(msg)
Log using common.logWarning, but automatically set name.

**Kind**: instance method of [<code>Main</code>](#Main)  
**Access**: protected  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>string</code> | The message to log. |

<a name="SubModule+error"></a>

### main.error(msg)
Log using common.error, but automatically set name.

**Kind**: instance method of [<code>Main</code>](#Main)  
**Access**: protected  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>string</code> | The message to log. |

<a name="SubModule+shutdown"></a>

### main.shutdown()
Shutdown and disable this submodule. Removes all event listeners.

**Kind**: instance method of [<code>Main</code>](#Main)  
**Overrides**: [<code>shutdown</code>](#SubModule+shutdown)  
**Access**: protected  
<a name="SubModule+save"></a>

### main.save([opt])
Saves all data to files necessary for saving current state.

**Kind**: instance method of [<code>Main</code>](#Main)  
**Overrides**: [<code>save</code>](#SubModule+save)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [opt] | <code>string</code> | <code>&quot;&#x27;sync&#x27;&quot;</code> | Can be 'async', otherwise defaults to synchronous. |

<a name="SubModule+unloadable"></a>

### *main.unloadable() ⇒ <code>boolean</code>*
Check if this module is in a state that is ready to be unloaded. If false
is returned, this module should not be unloaded and doing such may risk
putting the module into an uncontrollable state.

**Kind**: instance abstract method of [<code>Main</code>](#Main)  
**Returns**: <code>boolean</code> - True if can be unloaded, false if cannot.  
**Access**: public  
<a name="Main..version"></a>

### Main~version : <code>string</code> ℗
The current bot version parsed from package.json.

**Kind**: inner property of [<code>Main</code>](#Main)  
**Access**: private  
<a name="Main..commit"></a>

### Main~commit : <code>string</code> ℗
The current commit hash at HEAD.

**Kind**: inner property of [<code>Main</code>](#Main)  
**Access**: private  
<a name="Main..prevUserSayId"></a>

### Main~prevUserSayId : <code>string</code> ℗
The id of the last user to use the say command.

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
<a name="Main..disabledAutoSmite"></a>

### Main~disabledAutoSmite : <code>Object.&lt;boolean&gt;</code> ℗
All guilds that have disabled the auto-smite feature.

**Kind**: inner property of [<code>Main</code>](#Main)  
**Access**: private  
<a name="Main..disabledBanMessage"></a>

### Main~disabledBanMessage : <code>Object.&lt;boolean&gt;</code> ℗
All guilds that have disabled sending messages when someone is banned.

**Kind**: inner property of [<code>Main</code>](#Main)  
**Access**: private  
<a name="Main..mentionAccumulator"></a>

### Main~mentionAccumulator : <code>Object.&lt;Object.&lt;string&gt;&gt;</code> ℗
The guilds with auto-smite enabled, and members who have mentioned

**Kind**: inner property of [<code>Main</code>](#Main)  
**Access**: private  
**Everyone,**: and the timestamps of these mentions.  
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
<a name="Main..adminHelpObject"></a>

### Main~adminHelpObject ℗
The object that stores all data to be formatted into the help message for
admin commands.

**Kind**: inner constant of [<code>Main</code>](#Main)  
**Access**: private  
<a name="Main..mkAndWrite"></a>

### Main~mkAndWrite(filename, dir, data) ℗
Write data to a file and make sure the directory exists or create it if it
doesn't. Async

**Kind**: inner method of [<code>Main</code>](#Main)  
**Access**: private  
**See**: [mkAndWriteSync](#Main..mkAndWriteSync)  

| Param | Type | Description |
| --- | --- | --- |
| filename | <code>string</code> | The name of the file including the directory. |
| dir | <code>string</code> | The directory path without the file's name. |
| data | <code>string</code> | The data to write to the file. |

<a name="Main..mkAndWriteSync"></a>

### Main~mkAndWriteSync(filename, dir, data) ℗
Write data to a file and make sure the directory exists or create it if it
doesn't. Synchronous

**Kind**: inner method of [<code>Main</code>](#Main)  
**Access**: private  
**See**: [mkAndWrite](#Main..mkAndWrite)  

| Param | Type | Description |
| --- | --- | --- |
| filename | <code>string</code> | The name of the file including the directory. |
| dir | <code>string</code> | The directory path without the file's name. |
| data | <code>string</code> | The data to write to the file. |

<a name="Main..onGuildCreate"></a>

### Main~onGuildCreate(guild) ℗
Handle being added to a guild.

**Kind**: inner method of [<code>Main</code>](#Main)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| guild | <code>Discord~Guild</code> | The guild that we just joined. |

<a name="Main..onGuildDelete"></a>

### Main~onGuildDelete(guild) ℗
Handle being removed from a guild.

**Kind**: inner method of [<code>Main</code>](#Main)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| guild | <code>Discord~Guild</code> | The guild that we just left. |

<a name="Main..onGuildBanAdd"></a>

### Main~onGuildBanAdd(guild, user) ℗
Handle user banned on a guild.

**Kind**: inner method of [<code>Main</code>](#Main)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| guild | <code>Discord~Guild</code> | The guild on which the ban happened. |
| user | <code>Discord~User</code> | The user that was banned. |

<a name="Main..commandToggleMute"></a>

### Main~commandToggleMute(msg) : [<code>commandHandler</code>](#commandHandler) ℗
Toggles auto-muting a user for using @everyone too much.

**Kind**: inner method of [<code>Main</code>](#Main)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord~Message</code> | Message that triggered command. |

<a name="Main..commandToggleBanMessages"></a>

### Main~commandToggleBanMessages(msg) : [<code>commandHandler</code>](#commandHandler) ℗
Toggles sending a message when a user is banned from a guild.

**Kind**: inner method of [<code>Main</code>](#Main)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord~Message</code> | Message that triggered command. |

<a name="Main..onMessage"></a>

### Main~onMessage(msg) ℗
Handle receiving a message for use on auto-muting users who spam @everyone.

**Kind**: inner method of [<code>Main</code>](#Main)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord~Message</code> | The message that was sent. |

<a name="Main..checkSimilarity"></a>

### Main~checkSimilarity(s1, s2) ⇒ <code>number</code> ℗
Returns the percentage of how similar the two given strings are.

**Kind**: inner method of [<code>Main</code>](#Main)  
**Access**: private  

| Param | Type |
| --- | --- |
| s1 | <code>string</code> | 
| s2 | <code>string</code> | 

<a name="Main..editDistance"></a>

### Main~editDistance(s1, s2) ⇒ <code>number</code> ℗
Calculates the edit distance between the two strings.

**Kind**: inner method of [<code>Main</code>](#Main)  
**Access**: private  

| Param | Type |
| --- | --- |
| s1 | <code>string</code> | 
| s2 | <code>string</code> | 

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

<a name="Main..commandPmUser"></a>

### Main~commandPmUser(msg) : [<code>commandHandler</code>](#commandHandler) ℗
Send a PM to a specific user via a given id or name and descriminator.

**Kind**: inner method of [<code>Main</code>](#Main)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord~Message</code> | Message that triggered command. |


* [~commandPmUser(msg)](#Main..commandPmUser) : [<code>commandHandler</code>](#commandHandler) ℗
    * [~lookupByName()](#Main..commandPmUser..lookupByName) ℗
    * [~sendPm(msg, user, message)](#Main..commandPmUser..sendPm) ℗

<a name="Main..commandPmUser..lookupByName"></a>

#### commandPmUser~lookupByName() ℗
Lookup a user by their tag name.

**Kind**: inner method of [<code>commandPmUser</code>](#Main..commandPmUser)  
**Access**: private  
<a name="Main..commandPmUser..sendPm"></a>

#### commandPmUser~sendPm(msg, user, message) ℗
Send a pm to the user.

**Kind**: inner method of [<code>commandPmUser</code>](#Main..commandPmUser)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord~Message</code> | Message that triggered command. |
| user | <code>Discord~User</code> | The user to send the pm to. |
| message | <code>string</code> | The message to send to the user. |

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
possibly other information about their profile.

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

<a name="Main..commandRollDie"></a>

### Main~commandRollDie(msg) : [<code>commandHandler</code>](#commandHandler) ℗
Roll a die with the given number of sides.

**Kind**: inner method of [<code>Main</code>](#Main)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord~Message</code> | Message that triggered command. |

<a name="Main..commandPerms"></a>

### Main~commandPerms(msg) : [<code>commandHandler</code>](#commandHandler) ℗
Send information about permissions for debugging.

**Kind**: inner method of [<code>Main</code>](#Main)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord~Message</code> | Message that triggered command. |

<a name="Main..prePad"></a>

### Main~prePad(num, digits) ⇒ <code>string</code> ℗
Pad a number with leading zeroes so that it is `digits` long.

**Kind**: inner method of [<code>Main</code>](#Main)  
**Returns**: <code>string</code> - The padded string.  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| num | <code>string</code> \| <code>number</code> | The number to pad with zeroes. |
| digits | <code>number</code> | The minimum number of digits to make the output have. |

<a name="Main..commandStats"></a>

### Main~commandStats(msg) : [<code>commandHandler</code>](#commandHandler) ℗
Send information about the bot.

**Kind**: inner method of [<code>Main</code>](#Main)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord~Message</code> | Message that triggered command. |

<a name="Main..getAllStats"></a>

### Main~getAllStats(cb) ℗
Fetch the bot's stats from all shards, then combine the data. Public as
SpikeyBot.getStats after SubModule.initialize.

**Kind**: inner method of [<code>Main</code>](#Main)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| cb | <code>function</code> | One parameter that is guarunteed to have an array of stats objeccts. |


* [~getAllStats(cb)](#Main..getAllStats) ℗
    * [~values](#Main..getAllStats..values) ℗
    * [~statsResponse(res)](#Main..getAllStats..statsResponse) ℗

<a name="Main..getAllStats..values"></a>

#### getAllStats~values ℗
The stats object that is the result of this function.

**Kind**: inner property of [<code>getAllStats</code>](#Main..getAllStats)  
**Default**: <code>{&quot;numGuilds&quot;:0,&quot;numLargestGuild&quot;:0,&quot;numUsers&quot;:0,&quot;numBots&quot;:0,&quot;numUsersOnline&quot;:0,&quot;numChannels&quot;:0,&quot;uptimes&quot;:&quot;&quot;,&quot;activities&quot;:&quot;&quot;,&quot;largestActivity&quot;:&quot;&quot;,&quot;versions&quot;:&quot;&quot;,&quot;numShards&quot;:0,&quot;reqShard&quot;:0}</code>  
**Access**: private  
<a name="Main..getAllStats..statsResponse"></a>

#### getAllStats~statsResponse(res) ℗
Callback once all shards have replied with their stats.

**Kind**: inner method of [<code>getAllStats</code>](#Main..getAllStats)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| res | <code>Array.&lt;Object&gt;</code> | Array of each response object. |

<a name="Main..getStats"></a>

### Main~getStats() ⇒ <code>Object</code> ℗
Fetch our statistics about the bot on this shard.

**Kind**: inner method of [<code>Main</code>](#Main)  
**Returns**: <code>Object</code> - The statistics we collected.  
**Access**: private  
<a name="Main..commandLookup"></a>

### Main~commandLookup(msg) : [<code>commandHandler</code>](#commandHandler) ℗
Lookup an ID and give information about what it represents.

**Kind**: inner method of [<code>Main</code>](#Main)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord~Message</code> | Message that triggered command. |

<a name="Main..commandSendTo"></a>

### Main~commandSendTo(msg) : [<code>commandHandler</code>](#commandHandler) ℗
Lookup an ID and send a message to the given channel or user without
telling the recipient who sent the message. Only looks up cached users and
channels on the same shard.

**Kind**: inner method of [<code>Main</code>](#Main)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord~Message</code> | Message that triggered command. |

<a name="Main..commandThankYou"></a>

### Main~commandThankYou(msg) : [<code>commandHandler</code>](#commandHandler) ℗
Reply saying "you're welcome" unless another user was mentioned, then thank
them instead.

**Kind**: inner method of [<code>Main</code>](#Main)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord~Message</code> | Message that triggered command. |

<a name="Main..commandListCommands"></a>

### Main~commandListCommands(msg) : [<code>commandHandler</code>](#commandHandler) ℗
Fetch all registered commands and send them to the user.

**Kind**: inner method of [<code>Main</code>](#Main)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord~Message</code> | Message that triggered command. |

<a name="Main..commandGetPrefix"></a>

### Main~commandGetPrefix(msg) : <code>Command~commandHandler</code> ℗
User has requested to view the current prefix for their guild. This is
intended to be fired internally, usually through chatbot.js due to no other
way to reference this if the user has forgotten the prefix.

**Kind**: inner method of [<code>Main</code>](#Main)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord~Message</code> | The message that triggered this command. |

<a name="Main..sigint"></a>

### Main~sigint() ℗
Triggered via SIGINT, SIGHUP or SIGTERM. Saves data before exiting.

**Kind**: inner method of [<code>Main</code>](#Main)  
**Access**: private  
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

<a name="MainModule"></a>

## MainModule ⇐ [<code>SubModule</code>](#SubModule)
Base class for required modules for the bot to work. Adds
interface for maintaining references across reloads.

**Kind**: global class  
**Extends**: [<code>SubModule</code>](#SubModule)  

* [MainModule](#MainModule) ⇐ [<code>SubModule</code>](#SubModule)
    * _instance_
        * [.helpMessage](#SubModule+helpMessage) : <code>string</code> \| <code>Discord~MessageEmbed</code>
        * *[.postPrefix](#SubModule+postPrefix) : <code>string</code>*
        * [.Discord](#SubModule+Discord) : <code>Discord</code>
        * [.client](#SubModule+client) : <code>Discord~Client</code>
        * [.command](#SubModule+command) : [<code>Command</code>](#Command)
        * [.common](#SubModule+common) : [<code>Common</code>](#Common)
        * [.bot](#SubModule+bot) : [<code>SpikeyBot</code>](#SpikeyBot)
        * *[.myName](#SubModule+myName) : <code>string</code>*
        * [.initialized](#SubModule+initialized) : <code>boolean</code>
        * [.commit](#SubModule+commit) : <code>string</code>
        * [.loadTime](#SubModule+loadTime) : <code>number</code>
        * *[.import(data)](#MainModule+import)*
        * *[.export()](#MainModule+export) ⇒ [<code>ModuleData</code>](#MainModule..ModuleData)*
        * *[.terminate()](#MainModule+terminate)*
        * *[.initialize()](#SubModule+initialize)*
        * [.begin(Discord, client, command, common, bot)](#SubModule+begin)
        * [.end()](#SubModule+end)
        * [.log(msg)](#SubModule+log)
        * [.debug(msg)](#SubModule+debug)
        * [.warn(msg)](#SubModule+warn)
        * [.error(msg)](#SubModule+error)
        * *[.shutdown()](#SubModule+shutdown)*
        * *[.save([opt])](#SubModule+save)*
        * *[.unloadable()](#SubModule+unloadable) ⇒ <code>boolean</code>*
    * _static_
        * [.extend(child)](#MainModule.extend)
    * _inner_
        * [~ModuleData](#MainModule..ModuleData) : <code>Object.&lt;\*&gt;</code>

<a name="SubModule+helpMessage"></a>

### mainModule.helpMessage : <code>string</code> \| <code>Discord~MessageEmbed</code>
The help message to show the user in the main help message.

**Kind**: instance property of [<code>MainModule</code>](#MainModule)  
<a name="SubModule+postPrefix"></a>

### *mainModule.postPrefix : <code>string</code>*
The postfix for the global prefix for this subModule. Must be defined
before begin(), otherwise it is ignored.

**Kind**: instance abstract property of [<code>MainModule</code>](#MainModule)  
**Default**: <code>&quot;&quot;</code>  
<a name="SubModule+Discord"></a>

### mainModule.Discord : <code>Discord</code>
The current Discord object instance of the bot.

**Kind**: instance property of [<code>MainModule</code>](#MainModule)  
<a name="SubModule+client"></a>

### mainModule.client : <code>Discord~Client</code>
The current bot client.

**Kind**: instance property of [<code>MainModule</code>](#MainModule)  
<a name="SubModule+command"></a>

### mainModule.command : [<code>Command</code>](#Command)
The command object for registering command listeners.

**Kind**: instance property of [<code>MainModule</code>](#MainModule)  
<a name="SubModule+common"></a>

### mainModule.common : [<code>Common</code>](#Common)
The common object.

**Kind**: instance property of [<code>MainModule</code>](#MainModule)  
<a name="SubModule+bot"></a>

### mainModule.bot : [<code>SpikeyBot</code>](#SpikeyBot)
The parent SpikeyBot instance.

**Kind**: instance property of [<code>MainModule</code>](#MainModule)  
<a name="SubModule+myName"></a>

### *mainModule.myName : <code>string</code>*
The name of this submodule. Used for differentiating in the log. Should be
defined before begin().

**Kind**: instance abstract property of [<code>MainModule</code>](#MainModule)  
**Access**: protected  
<a name="SubModule+initialized"></a>

### mainModule.initialized : <code>boolean</code>
Has this subModule been initialized yet (Has begin() been called).

**Kind**: instance property of [<code>MainModule</code>](#MainModule)  
**Default**: <code>false</code>  
**Access**: protected  
**Read only**: true  
<a name="SubModule+commit"></a>

### mainModule.commit : <code>string</code>
The commit at HEAD at the time this module was loaded. Essentially the
version of this submodule.

**Kind**: instance constant of [<code>MainModule</code>](#MainModule)  
**Access**: public  
<a name="SubModule+loadTime"></a>

### mainModule.loadTime : <code>number</code>
The time at which this madule was loaded for use in checking if the module
needs to be reloaded because the file has been modified since loading.

**Kind**: instance constant of [<code>MainModule</code>](#MainModule)  
**Access**: public  
<a name="MainModule+import"></a>

### *mainModule.import(data)*
Imports data from a previous instance of this class in order to maintain
references to other objects and classes across reloads.

**Kind**: instance abstract method of [<code>MainModule</code>](#MainModule)  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| data | [<code>ModuleData</code>](#MainModule..ModuleData) | The data that was exported previously, or null if no data to import. |

<a name="MainModule+export"></a>

### *mainModule.export() ⇒ [<code>ModuleData</code>](#MainModule..ModuleData)*
Export data required to maintain the bot across reloading this module.
Expected to be returned directly to this.import once reloaded.

**Kind**: instance abstract method of [<code>MainModule</code>](#MainModule)  
**Returns**: [<code>ModuleData</code>](#MainModule..ModuleData) - The data to be exported  
**Access**: public  
<a name="MainModule+terminate"></a>

### *mainModule.terminate()*
Signal that the bot is shutting down and will not be restarting
immediately. This is triggered on all shutdowns where all MainModules and
SubModules will be unloaded.

**Kind**: instance abstract method of [<code>MainModule</code>](#MainModule)  
**Access**: public  
<a name="SubModule+initialize"></a>

### *mainModule.initialize()*
The function called at the end of begin() for further initialization
specific to the subModule. Must be defined before begin() is called.

**Kind**: instance abstract method of [<code>MainModule</code>](#MainModule)  
**Access**: protected  
<a name="SubModule+begin"></a>

### mainModule.begin(Discord, client, command, common, bot)
Initialize this submodule.

**Kind**: instance method of [<code>MainModule</code>](#MainModule)  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| Discord | <code>Discord</code> | The Discord object for the API library. |
| client | <code>Discord~Client</code> | The client that represents this bot. |
| command | [<code>Command</code>](#Command) | The command instance in which to register command listeners. |
| common | [<code>Common</code>](#Common) | Class storing common functions. |
| bot | [<code>SpikeyBot</code>](#SpikeyBot) | The parent SpikeyBot instance. |

<a name="SubModule+end"></a>

### mainModule.end()
Trigger subModule to shutdown and get ready for process terminating.

**Kind**: instance method of [<code>MainModule</code>](#MainModule)  
**Access**: public  
<a name="SubModule+log"></a>

### mainModule.log(msg)
Log using common.log, but automatically set name.

**Kind**: instance method of [<code>MainModule</code>](#MainModule)  
**Access**: protected  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>string</code> | The message to log. |

<a name="SubModule+debug"></a>

### mainModule.debug(msg)
Log using common.logDebug, but automatically set name.

**Kind**: instance method of [<code>MainModule</code>](#MainModule)  
**Access**: protected  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>string</code> | The message to log. |

<a name="SubModule+warn"></a>

### mainModule.warn(msg)
Log using common.logWarning, but automatically set name.

**Kind**: instance method of [<code>MainModule</code>](#MainModule)  
**Access**: protected  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>string</code> | The message to log. |

<a name="SubModule+error"></a>

### mainModule.error(msg)
Log using common.error, but automatically set name.

**Kind**: instance method of [<code>MainModule</code>](#MainModule)  
**Access**: protected  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>string</code> | The message to log. |

<a name="SubModule+shutdown"></a>

### *mainModule.shutdown()*
Shutdown and disable this submodule. Removes all event listeners.

**Kind**: instance abstract method of [<code>MainModule</code>](#MainModule)  
**Access**: protected  
<a name="SubModule+save"></a>

### *mainModule.save([opt])*
Saves all data to files necessary for saving current state.

**Kind**: instance abstract method of [<code>MainModule</code>](#MainModule)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [opt] | <code>string</code> | <code>&quot;&#x27;sync&#x27;&quot;</code> | Can be 'async', otherwise defaults to synchronous. |

<a name="SubModule+unloadable"></a>

### *mainModule.unloadable() ⇒ <code>boolean</code>*
Check if this module is in a state that is ready to be unloaded. If false
is returned, this module should not be unloaded and doing such may risk
putting the module into an uncontrollable state.

**Kind**: instance abstract method of [<code>MainModule</code>](#MainModule)  
**Returns**: <code>boolean</code> - True if can be unloaded, false if cannot.  
**Access**: public  
<a name="MainModule.extend"></a>

### MainModule.extend(child)
Extends MainModule as the base class of a child.

**Kind**: static method of [<code>MainModule</code>](#MainModule)  

| Param | Type | Description |
| --- | --- | --- |
| child | <code>Object</code> | The child class to extend. |

<a name="MainModule..ModuleData"></a>

### MainModule~ModuleData : <code>Object.&lt;\*&gt;</code>
The data exported and imported by this module intended to be used to
persist across reloads.

**Kind**: inner typedef of [<code>MainModule</code>](#MainModule)  
<a name="Music"></a>

## Music ⇐ [<code>SubModule</code>](#SubModule)
Music and audio related commands.

**Kind**: global class  
**Extends**: [<code>SubModule</code>](#SubModule)  
**Emits**: <code>Command#event:stop</code>  

* [Music](#Music) ⇐ [<code>SubModule</code>](#SubModule)
    * _instance_
        * [.helpMessage](#SubModule+helpMessage) : <code>string</code> \| <code>Discord~MessageEmbed</code>
        * *[.postPrefix](#SubModule+postPrefix) : <code>string</code>*
        * [.Discord](#SubModule+Discord) : <code>Discord</code>
        * [.client](#SubModule+client) : <code>Discord~Client</code>
        * [.command](#SubModule+command) : [<code>Command</code>](#Command)
        * [.common](#SubModule+common) : [<code>Common</code>](#Common)
        * [.bot](#SubModule+bot) : [<code>SpikeyBot</code>](#SpikeyBot)
        * *[.myName](#SubModule+myName) : <code>string</code>*
        * [.initialized](#SubModule+initialized) : <code>boolean</code>
        * [.commit](#SubModule+commit) : <code>string</code>
        * [.loadTime](#SubModule+loadTime) : <code>number</code>
        * [.getProgress(msg)](#Music+getProgress) ⇒ <code>number</code>
        * [.getDuration(msg)](#Music+getDuration) ⇒ <code>number</code>
        * [.skipSong(msg)](#Music+skipSong)
        * [.pause(msg)](#Music+pause) ⇒ <code>boolean</code>
        * [.resume(msg)](#Music+resume) ⇒ <code>boolean</code>
        * [.playSong(msg, song, [seek], [subjugate])](#Music+playSong)
        * [.release(msg)](#Music+release)
        * [.subjugate(msg)](#Music+subjugate)
        * [.isSubjugated(msg)](#Music+isSubjugated) ⇒ <code>boolean</code>
        * [.clearQueue(msg)](#Music+clearQueue)
        * [.initialize()](#SubModule+initialize)
        * [.begin(Discord, client, command, common, bot)](#SubModule+begin)
        * [.end()](#SubModule+end)
        * [.log(msg)](#SubModule+log)
        * [.debug(msg)](#SubModule+debug)
        * [.warn(msg)](#SubModule+warn)
        * [.error(msg)](#SubModule+error)
        * [.shutdown()](#SubModule+shutdown)
        * *[.save([opt])](#SubModule+save)*
        * [.unloadable()](#SubModule+unloadable) ⇒ <code>boolean</code>
    * _static_
        * [.streamToOgg(input, file)](#Music.streamToOgg)
    * _inner_
        * [~broadcasts](#Music..broadcasts) : [<code>Object.&lt;Broadcast&gt;</code>](#Music..Broadcast) ℗
        * [~follows](#Music..follows) : <code>Object.&lt;string&gt;</code> ℗
        * [~geniusClient](#Music..geniusClient) : <code>string</code> ℗
        * [~geniusRequest](#Music..geniusRequest) : <code>Object</code> ℗
        * [~special](#Music..special) : <code>Object.&lt;Object.&lt;{cmd: string, url: ?string, file: string}&gt;&gt;</code> ℗
        * [~ytdlOpts](#Music..ytdlOpts) : <code>Array.&lt;string&gt;</code> ℗
        * [~streamOptions](#Music..streamOptions) : <code>Discord~StreamOptions</code> ℗
        * [~helpObject](#Music..helpObject) ℗
        * [~mention(msg)](#Music..mention) ⇒ <code>string</code> ℗
        * ~~[~reply(msg, text, post)](#Music..reply) ⇒ <code>Promise</code> ℗~~
        * [~handleVoiceStateUpdate(oldState, newState)](#Music..handleVoiceStateUpdate) ℗
        * [~formatSongInfo(info, [dispatcher], [seek])](#Music..formatSongInfo) ⇒ <code>Discord~MessageEmbed</code> ℗
        * [~getRemainingSeconds(info, dispatcher)](#Music..getRemainingSeconds) ⇒ <code>number</code> ℗
        * [~formatPlaytime(seconds)](#Music..formatPlaytime) ⇒ <code>string</code> ℗
        * [~formNum(num)](#Music..formNum) ⇒ <code>string</code> ℗
        * [~enqueueSong(broadcast, song, msg, [info], [seek])](#Music..enqueueSong) ℗
        * [~startPlaying(broadcast)](#Music..startPlaying) ℗
        * [~makeBroadcast(broadcast)](#Music..makeBroadcast) ℗
            * [~onDC()](#Music..makeBroadcast..onDC) ℗
        * [~startStream(input, done, progress)](#Music..startStream) ℗
        * [~endSong(broadcast)](#Music..endSong) ℗
        * [~skipSong(broadcast)](#Music..skipSong) ℗
        * [~commandJoin(msg)](#Music..commandJoin) : [<code>commandHandler</code>](#commandHandler) ℗
        * [~commandPause(msg)](#Music..commandPause) : [<code>commandHandler</code>](#commandHandler) ℗
        * [~pauseBroadcast(broadcast)](#Music..pauseBroadcast) ⇒ <code>boolean</code> ℗
        * [~commandResume(msg)](#Music..commandResume) : [<code>commandHandler</code>](#commandHandler) ℗
        * [~resumeBroadcast(broadcast)](#Music..resumeBroadcast) ⇒ <code>boolean</code> ℗
        * [~commandPlay(msg)](#Music..commandPlay) : [<code>commandHandler</code>](#commandHandler) ℗
        * [~commandLeave(msg)](#Music..commandLeave) : [<code>commandHandler</code>](#commandHandler) ℗
        * [~commandSkip(msg)](#Music..commandSkip) : [<code>commandHandler</code>](#commandHandler) ℗
        * [~commandQueue(msg)](#Music..commandQueue) : [<code>commandHandler</code>](#commandHandler) ℗
        * [~commandClearQueue(msg)](#Music..commandClearQueue) : [<code>commandHandler</code>](#commandHandler) ℗
        * [~commandRemove(msg)](#Music..commandRemove) : [<code>commandHandler</code>](#commandHandler) ℗
        * [~commandLyrics(msg)](#Music..commandLyrics) : [<code>commandHandler</code>](#commandHandler) ℗
        * [~reqLyricsURL(msg, id)](#Music..reqLyricsURL) ℗
        * [~fetchLyricsPage(msg, url, title, thumb)](#Music..fetchLyricsPage) ℗
        * [~stripLyrics(msg, content, title, url, thumb)](#Music..stripLyrics) ℗
        * [~commandRecord(msg)](#Music..commandRecord) : [<code>commandHandler</code>](#commandHandler) ℗
        * [~commandFollow(msg)](#Music..commandFollow) : [<code>commandHandler</code>](#commandHandler) ℗
        * [~formatDateTime(date)](#Music..formatDateTime) ⇒ <code>string</code> ℗
        * [~monthToShort(month)](#Music..monthToShort) ⇒ <code>string</code> ℗
        * [~commandStats(msg)](#Music..commandStats) : [<code>commandHandler</code>](#commandHandler) ℗
        * [~commandVolume(msg)](#Music..commandVolume) : [<code>commandHandler</code>](#commandHandler) ℗
        * [~changeVolume(broadcast, percentage)](#Music..changeVolume) ⇒ <code>boolean</code> ℗
        * [~getVolume(broadcast)](#Music..getVolume) ⇒ <code>number</code> ℗
        * [~Broadcast](#Music..Broadcast) : <code>Object</code>

<a name="SubModule+helpMessage"></a>

### music.helpMessage : <code>string</code> \| <code>Discord~MessageEmbed</code>
The help message to show the user in the main help message.

**Kind**: instance property of [<code>Music</code>](#Music)  
**Overrides**: [<code>helpMessage</code>](#SubModule+helpMessage)  
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

### music.command : [<code>Command</code>](#Command)
The command object for registering command listeners.

**Kind**: instance property of [<code>Music</code>](#Music)  
<a name="SubModule+common"></a>

### music.common : [<code>Common</code>](#Common)
The common object.

**Kind**: instance property of [<code>Music</code>](#Music)  
<a name="SubModule+bot"></a>

### music.bot : [<code>SpikeyBot</code>](#SpikeyBot)
The parent SpikeyBot instance.

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
<a name="SubModule+commit"></a>

### music.commit : <code>string</code>
The commit at HEAD at the time this module was loaded. Essentially the
version of this submodule.

**Kind**: instance constant of [<code>Music</code>](#Music)  
**Access**: public  
<a name="SubModule+loadTime"></a>

### music.loadTime : <code>number</code>
The time at which this madule was loaded for use in checking if the module
needs to be reloaded because the file has been modified since loading.

**Kind**: instance constant of [<code>Music</code>](#Music)  
**Access**: public  
<a name="Music+getProgress"></a>

### music.getProgress(msg) ⇒ <code>number</code>
Get the current progress into the song in the given context.

**Kind**: instance method of [<code>Music</code>](#Music)  
**Returns**: <code>number</code> - Time in seconds, or null if nothing is playing.  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord~Message</code> | The context to use to fetch the info. |

<a name="Music+getDuration"></a>

### music.getDuration(msg) ⇒ <code>number</code>
Get the song's length of the song playing in the given context.

**Kind**: instance method of [<code>Music</code>](#Music)  
**Returns**: <code>number</code> - Time in seconds, or null if nothing is playing.  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord~Message</code> | The context to use to fetch the info. |

<a name="Music+skipSong"></a>

### music.skipSong(msg)
Skip the current song with the given context.

**Kind**: instance method of [<code>Music</code>](#Music)  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord~Message</code> | The context storing guild information for looking up. |

<a name="Music+pause"></a>

### music.pause(msg) ⇒ <code>boolean</code>
Attempt to pause the current broadcast in a guild.

**Kind**: instance method of [<code>Music</code>](#Music)  
**Returns**: <code>boolean</code> - True if success, false if failed.  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord~Message</code> | The context to lookup guild info. |

<a name="Music+resume"></a>

### music.resume(msg) ⇒ <code>boolean</code>
Attempt to resume the current broadcast in a guild.

**Kind**: instance method of [<code>Music</code>](#Music)  
**Returns**: <code>boolean</code> - True if success, false if failed.  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord~Message</code> | The context to lookup guild info. |

<a name="Music+playSong"></a>

### music.playSong(msg, song, [seek], [subjugate])
Start playing or enqueue the requested song.

**Kind**: instance method of [<code>Music</code>](#Music)  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord~Message</code> | The message that triggered command, used for context. |
| song | <code>string</code> | The song search criteria. |
| [seek] | <code>number</code> | The time in seconds to seek to. |
| [subjugate] | <code>boolean</code> | Force all control be via external sources using public function calls. All queue control commands are disabled. Also suppresses most information messages that would otherwise be sent to the user. Null means leave as current value. |

<a name="Music+release"></a>

### music.release(msg)
Release subjugation. Does not modify any current queue or playing
information.

**Kind**: instance method of [<code>Music</code>](#Music)  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord~Message</code> | The context to lookup the information. |

<a name="Music+subjugate"></a>

### music.subjugate(msg)
Begin subjugation. Does not modify any current queue or playing
information.

**Kind**: instance method of [<code>Music</code>](#Music)  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord~Message</code> | The context to lookup the information. |

<a name="Music+isSubjugated"></a>

### music.isSubjugated(msg) ⇒ <code>boolean</code>
Check if music is being subjugated by another script.

**Kind**: instance method of [<code>Music</code>](#Music)  
**Returns**: <code>boolean</code> - Null if nothing is playing, true if subjugated, false if
not subjugated.  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord~Message</code> | The context to lookup the information. |

<a name="Music+clearQueue"></a>

### music.clearQueue(msg)
Empty a guild's current music queue.

**Kind**: instance method of [<code>Music</code>](#Music)  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord~Message</code> | The context for looking up the guild queue to modify. |

<a name="SubModule+initialize"></a>

### music.initialize()
The function called at the end of begin() for further initialization
specific to the subModule. Must be defined before begin() is called.

**Kind**: instance method of [<code>Music</code>](#Music)  
**Overrides**: [<code>initialize</code>](#SubModule+initialize)  
**Access**: protected  
<a name="SubModule+begin"></a>

### music.begin(Discord, client, command, common, bot)
Initialize this submodule.

**Kind**: instance method of [<code>Music</code>](#Music)  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| Discord | <code>Discord</code> | The Discord object for the API library. |
| client | <code>Discord~Client</code> | The client that represents this bot. |
| command | [<code>Command</code>](#Command) | The command instance in which to register command listeners. |
| common | [<code>Common</code>](#Common) | Class storing common functions. |
| bot | [<code>SpikeyBot</code>](#SpikeyBot) | The parent SpikeyBot instance. |

<a name="SubModule+end"></a>

### music.end()
Trigger subModule to shutdown and get ready for process terminating.

**Kind**: instance method of [<code>Music</code>](#Music)  
**Access**: public  
<a name="SubModule+log"></a>

### music.log(msg)
Log using common.log, but automatically set name.

**Kind**: instance method of [<code>Music</code>](#Music)  
**Access**: protected  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>string</code> | The message to log. |

<a name="SubModule+debug"></a>

### music.debug(msg)
Log using common.logDebug, but automatically set name.

**Kind**: instance method of [<code>Music</code>](#Music)  
**Access**: protected  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>string</code> | The message to log. |

<a name="SubModule+warn"></a>

### music.warn(msg)
Log using common.logWarning, but automatically set name.

**Kind**: instance method of [<code>Music</code>](#Music)  
**Access**: protected  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>string</code> | The message to log. |

<a name="SubModule+error"></a>

### music.error(msg)
Log using common.error, but automatically set name.

**Kind**: instance method of [<code>Music</code>](#Music)  
**Access**: protected  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>string</code> | The message to log. |

<a name="SubModule+shutdown"></a>

### music.shutdown()
Shutdown and disable this submodule. Removes all event listeners.

**Kind**: instance method of [<code>Music</code>](#Music)  
**Overrides**: [<code>shutdown</code>](#SubModule+shutdown)  
**Access**: protected  
<a name="SubModule+save"></a>

### *music.save([opt])*
Saves all data to files necessary for saving current state.

**Kind**: instance abstract method of [<code>Music</code>](#Music)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [opt] | <code>string</code> | <code>&quot;&#x27;sync&#x27;&quot;</code> | Can be 'async', otherwise defaults to synchronous. |

<a name="SubModule+unloadable"></a>

### music.unloadable() ⇒ <code>boolean</code>
Check if this module is in a state that is ready to be unloaded. If false
is returned, this module should not be unloaded and doing such may risk
putting the module into an uncontrollable state.

**Kind**: instance method of [<code>Music</code>](#Music)  
**Overrides**: [<code>unloadable</code>](#SubModule+unloadable)  
**Returns**: <code>boolean</code> - True if can be unloaded, false if cannot.  
**Access**: public  
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
<a name="Music..follows"></a>

### Music~follows : <code>Object.&lt;string&gt;</code> ℗
The current user IDs of the users to follow into new voice channels. This
is mapped by guild id.

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
**Default**: <code>[&quot;-f&quot;,&quot;bestaudio/worst&quot;,&quot;--no-playlist&quot;,&quot;--default-search&#x3D;auto&quot;]</code>  
**Access**: private  
<a name="Music..streamOptions"></a>

### Music~streamOptions : <code>Discord~StreamOptions</code> ℗
Options to pass into the stream dispatcher.
[StreamOptions](https://discord.js.org/#/docs/main/master/typedef/StreamOptions)

**Kind**: inner constant of [<code>Music</code>](#Music)  
**Default**: <code>{&quot;passes&quot;:2,&quot;fec&quot;:true,&quot;bitrate&quot;:&quot;auto&quot;,&quot;volume&quot;:0.5,&quot;plp&quot;:0.01}</code>  
**Access**: private  
<a name="Music..helpObject"></a>

### Music~helpObject ℗
The object that stores all data to be formatted into the help message.

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

### ~~Music~reply(msg, text, post) ⇒ <code>Promise</code> ℗~~
***Deprecated***

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

### Music~handleVoiceStateUpdate(oldState, newState) ℗
Leave a voice channel if all other users have left. Should also cause music
and recordings to stop.

**Kind**: inner method of [<code>Music</code>](#Music)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| oldState | <code>Discord~VoiceState</code> | State before status update. |
| newState | <code>Discord~VoiceState</code> | State after status update. |

<a name="Music..formatSongInfo"></a>

### Music~formatSongInfo(info, [dispatcher], [seek]) ⇒ <code>Discord~MessageEmbed</code> ℗
Format the info response from ytdl into a human readable format.

**Kind**: inner method of [<code>Music</code>](#Music)  
**Returns**: <code>Discord~MessageEmbed</code> - The formatted song info.  
**Access**: private  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| info | <code>Object</code> |  | The info received from ytdl about the song. |
| [dispatcher] | <code>Discord~StreamDispatcher</code> |  | The broadcast dispatcher that is currently broadcasting audio. If defined, this will be used to determine remaining play time. |
| [seek] | <code>number</code> | <code>0</code> | The offset to add to totalStreamTime to correct for starting playback somewhere other than the beginning. |

<a name="Music..getRemainingSeconds"></a>

### Music~getRemainingSeconds(info, dispatcher) ⇒ <code>number</code> ℗
Get the remaining playtime in the given song info and broadcast.

**Kind**: inner method of [<code>Music</code>](#Music)  
**Returns**: <code>number</code> - Number of seconds remaining in the song playtime.  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| info | <code>Object</code> | The song info received from ytdl. |
| dispatcher | <code>Discord~StreamDispatcher</code> | The dispatcher playing the song currently. |

<a name="Music..formatPlaytime"></a>

### Music~formatPlaytime(seconds) ⇒ <code>string</code> ℗
Format the given number of seconds into the playtime format.

**Kind**: inner method of [<code>Music</code>](#Music)  
**Returns**: <code>string</code> - The formatted string in minutes and seconds.  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| seconds | <code>number</code> | The duration in seconds. |

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

### Music~enqueueSong(broadcast, song, msg, [info], [seek]) ℗
Add a song to the given broadcast's queue and start playing it not already.

**Kind**: inner method of [<code>Music</code>](#Music)  
**Emits**: <code>Command#event:stop</code>  
**Access**: private  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| broadcast | [<code>Broadcast</code>](#Music..Broadcast) |  | The broadcast storage container. |
| song | <code>string</code> |  | The song that was requested. |
| msg | <code>Discord~Message</code> |  | The message that requested the song. |
| [info] | <code>Object</code> |  | The info from ytdl about the song. |
| [seek] | <code>number</code> | <code>0</code> | The number of seconds into a song to start playing. |

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

<a name="Music..makeBroadcast..onDC"></a>

#### makeBroadcast~onDC() ℗
Fires on when voice connection is disconnected. Cleans up anything that
could be left behind.

**Kind**: inner method of [<code>makeBroadcast</code>](#Music..makeBroadcast)  
**Access**: private  
<a name="Music..startStream"></a>

### Music~startStream(input, done, progress) ℗
Starts the streams as a thread and reports done with the streams.

**Kind**: inner method of [<code>Music</code>](#Music)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| input | <code>Object</code> | Input vars. |
| done | <code>function</code> | Done callback. |
| progress | <code>function</code> | Progress callback. |

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

<a name="Music..commandJoin"></a>

### Music~commandJoin(msg) : [<code>commandHandler</code>](#commandHandler) ℗
Join a voice channel that the user is in.

**Kind**: inner method of [<code>Music</code>](#Music)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord~Message</code> | The message that triggered command. |

<a name="Music..commandPause"></a>

### Music~commandPause(msg) : [<code>commandHandler</code>](#commandHandler) ℗
Pause the currently playing music broadcast.

**Kind**: inner method of [<code>Music</code>](#Music)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord~Message</code> | The message that triggered command. |

<a name="Music..pauseBroadcast"></a>

### Music~pauseBroadcast(broadcast) ⇒ <code>boolean</code> ℗
Cause the given broadcast to be paused.

**Kind**: inner method of [<code>Music</code>](#Music)  
**Returns**: <code>boolean</code> - If the music was actully paused. False if the music is
already paused or nothing is playing.  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| broadcast | [<code>Broadcast</code>](#Music..Broadcast) | The object storing all relevant information. |

<a name="Music..commandResume"></a>

### Music~commandResume(msg) : [<code>commandHandler</code>](#commandHandler) ℗
Resume the currently paused music broadcast.

**Kind**: inner method of [<code>Music</code>](#Music)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord~Message</code> | The message that triggered command. |

<a name="Music..resumeBroadcast"></a>

### Music~resumeBroadcast(broadcast) ⇒ <code>boolean</code> ℗
Cause the given broadcast to be resumed.

**Kind**: inner method of [<code>Music</code>](#Music)  
**Returns**: <code>boolean</code> - If the music was actully resumed. False if the music is
already playing or nothing is playing or the bot is alone in a channel.  
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

<a name="Music..commandClearQueue"></a>

### Music~commandClearQueue(msg) : [<code>commandHandler</code>](#commandHandler) ℗
Removes all songs from the current queue except for the currently playing
song.

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

<a name="Music..commandFollow"></a>

### Music~commandFollow(msg) : [<code>commandHandler</code>](#commandHandler) ℗
Follow a user as they change voice channels.

**Kind**: inner method of [<code>Music</code>](#Music)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord~Message</code> | The message that triggered command. |

<a name="Music..formatDateTime"></a>

### Music~formatDateTime(date) ⇒ <code>string</code> ℗
Formats a given date into a datestring.

**Kind**: inner method of [<code>Music</code>](#Music)  
**Returns**: <code>string</code> - The formatted datetime.  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| date | <code>Date</code> \| <code>number</code> \| <code>string</code> | The date that Date() can accept. |

<a name="Music..monthToShort"></a>

### Music~monthToShort(month) ⇒ <code>string</code> ℗
Convert the month number to a 3 letter string of the month's name.

**Kind**: inner method of [<code>Music</code>](#Music)  
**Returns**: <code>string</code> - The 3 character string.  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| month | <code>number</code> | The month number (1-12). |

<a name="Music..commandStats"></a>

### Music~commandStats(msg) : [<code>commandHandler</code>](#commandHandler) ℗
Show statistics about current music broadcasts.

**Kind**: inner method of [<code>Music</code>](#Music)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord~Message</code> | The message that triggered command. |

<a name="Music..commandVolume"></a>

### Music~commandVolume(msg) : [<code>commandHandler</code>](#commandHandler) ℗
Change the volume of the current music stream.

**Kind**: inner method of [<code>Music</code>](#Music)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord~Message</code> | The message that triggered command. |

<a name="Music..changeVolume"></a>

### Music~changeVolume(broadcast, percentage) ⇒ <code>boolean</code> ℗
Change the volume of the current broadcast.

**Kind**: inner method of [<code>Music</code>](#Music)  
**Returns**: <code>boolean</code> - True if success, false if something went wrong.  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| broadcast | [<code>Broadcast</code>](#Music..Broadcast) | The objected storing the current broadcast information. |
| percentage | <code>number</code> | The volume percentage to set to. 0.5 is half, 2 is double. |

<a name="Music..getVolume"></a>

### Music~getVolume(broadcast) ⇒ <code>number</code> ℗
Get the volume of the current broadcast.

**Kind**: inner method of [<code>Music</code>](#Music)  
**Returns**: <code>number</code> - The logarithmic volume percentage. 0.5 is half, 2 is
double. Null if error.  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| broadcast | [<code>Broadcast</code>](#Music..Broadcast) | The objected storing the current broadcast information. |

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
| voice | <code>Discord~VoiceConnection</code> | The current voice connection audio is being streamed to. |
| dispatcher | <code>Discord~StreamDispatcher</code> | The Discord dispatcher for the current audio channel. |
| current | <code>Object</code> | The current broadcast information including thread, readable stream, and song information. |

<a name="Patreon"></a>

## Patreon ⇐ [<code>SubModule</code>](#SubModule)
Modifies the SpikeyBot object with an interface for checking the
Patreon status of users.

**Kind**: global class  
**Extends**: [<code>SubModule</code>](#SubModule)  

* [Patreon](#Patreon) ⇐ [<code>SubModule</code>](#SubModule)
    * _instance_
        * [.helpMessage](#SubModule+helpMessage) : <code>string</code> \| <code>Discord~MessageEmbed</code>
        * *[.postPrefix](#SubModule+postPrefix) : <code>string</code>*
        * [.Discord](#SubModule+Discord) : <code>Discord</code>
        * [.client](#SubModule+client) : <code>Discord~Client</code>
        * [.command](#SubModule+command) : [<code>Command</code>](#Command)
        * [.common](#SubModule+common) : [<code>Common</code>](#Common)
        * [.bot](#SubModule+bot) : [<code>SpikeyBot</code>](#SpikeyBot)
        * [.myName](#SubModule+myName) : <code>string</code>
        * [.initialized](#SubModule+initialized) : <code>boolean</code>
        * [.commit](#SubModule+commit) : <code>string</code>
        * [.loadTime](#SubModule+loadTime) : <code>number</code>
        * [.initialize()](#SubModule+initialize)
        * [.begin(Discord, client, command, common, bot)](#SubModule+begin)
        * [.end()](#SubModule+end)
        * [.log(msg)](#SubModule+log)
        * [.debug(msg)](#SubModule+debug)
        * [.warn(msg)](#SubModule+warn)
        * [.error(msg)](#SubModule+error)
        * [.shutdown()](#SubModule+shutdown)
        * *[.save([opt])](#SubModule+save)*
        * *[.unloadable()](#SubModule+unloadable) ⇒ <code>boolean</code>*
    * _inner_
        * [~toExport](#Patreon..toExport)
            * [.checkAllPerms(uId, cId, gId, perm, cb)](#Patreon..toExport.checkAllPerms)
            * [.getAllPerms(uId, cId, gId, cb)](#Patreon..toExport.getAllPerms)
                * [~onGetOverrides(err, info)](#Patreon..toExport.getAllPerms..onGetOverrides) : [<code>basicCB</code>](#Patreon..basicCB) ℗
                * [~getPerms(err, data)](#Patreon..toExport.getAllPerms..getPerms) : [<code>basicCB</code>](#Patreon..basicCB) ℗
                * [~onGetPerms(err, data)](#Patreon..toExport.getAllPerms..onGetPerms) : [<code>basicCB</code>](#Patreon..basicCB) ℗
            * [.checkPerm(uId, perm, cb)](#Patreon..toExport.checkPerm)
                * [~checkPerm(err, data)](#Patreon..toExport.checkPerm..checkPerm) : [<code>basicCB</code>](#Patreon..basicCB) ℗
            * [.getLevelPerms(pledgeAmount, exclusive, cb)](#Patreon..toExport.getLevelPerms)
            * [.getSettingValue(uId, cId, gId, permString, cb)](#Patreon..toExport.getSettingValue)
                * [~onCheckPerm(err, info)](#Patreon..toExport.getSettingValue..onCheckPerm) : [<code>basicCB</code>](#Patreon..basicCB) ℗
                * [~fetchValue(obj, keys, myCb)](#Patreon..toExport.getSettingValue..fetchValue) ℗
                * [~onFetchedValue(err, info)](#Patreon..toExport.getSettingValue..onFetchedValue) : [<code>basicCB</code>](#Patreon..basicCB) ℗
        * [~patreonTiers](#Patreon..patreonTiers) : <code>Array.&lt;{0: number, 1: Array.&lt;string&gt;}&gt;</code> ℗
        * [~patreonSettingsTemplate](#Patreon..patreonSettingsTemplate) : <code>Object.&lt;Object&gt;</code> ℗
        * [~sqlCon](#Patreon..sqlCon) : <code>sql.ConnectionConfig</code> ℗
        * [~patreonSettingsFilename](#Patreon..patreonSettingsFilename) : <code>string</code> ℗
        * [~patreonTierPermFile](#Patreon..patreonTierPermFile) : <code>string</code> ℗
        * [~patreonSettingsTemplateFile](#Patreon..patreonSettingsTemplateFile) : <code>string</code> ℗
        * [~updateTierPerms()](#Patreon..updateTierPerms) ℗
        * [~updatePatreonSettingsTemplate()](#Patreon..updatePatreonSettingsTemplate) ℗
        * [~connectSQL()](#Patreon..connectSQL) ℗
        * [~commandPatreon(msg)](#Patreon..commandPatreon) : [<code>commandHandler</code>](#commandHandler) ℗
            * [~getPerms(err, data)](#Patreon..commandPatreon..getPerms) : [<code>basicCB</code>](#Patreon..basicCB) ℗
            * [~onGetPerms(err, data)](#Patreon..commandPatreon..onGetPerms) : [<code>basicCB</code>](#Patreon..basicCB) ℗
        * [~fetchPatreonRow(uId, cb)](#Patreon..fetchPatreonRow) ℗
            * [~receivedDiscordRow(err, rows)](#Patreon..fetchPatreonRow..receivedDiscordRow) ℗
            * [~receivedPatreonRow(err, rows)](#Patreon..fetchPatreonRow..receivedPatreonRow) ℗
        * [~basicCB](#Patreon..basicCB) : <code>function</code>

<a name="SubModule+helpMessage"></a>

### patreon.helpMessage : <code>string</code> \| <code>Discord~MessageEmbed</code>
The help message to show the user in the main help message.

**Kind**: instance property of [<code>Patreon</code>](#Patreon)  
**Overrides**: [<code>helpMessage</code>](#SubModule+helpMessage)  
<a name="SubModule+postPrefix"></a>

### *patreon.postPrefix : <code>string</code>*
The postfix for the global prefix for this subModule. Must be defined
before begin(), otherwise it is ignored.

**Kind**: instance abstract property of [<code>Patreon</code>](#Patreon)  
**Default**: <code>&quot;&quot;</code>  
<a name="SubModule+Discord"></a>

### patreon.Discord : <code>Discord</code>
The current Discord object instance of the bot.

**Kind**: instance property of [<code>Patreon</code>](#Patreon)  
<a name="SubModule+client"></a>

### patreon.client : <code>Discord~Client</code>
The current bot client.

**Kind**: instance property of [<code>Patreon</code>](#Patreon)  
<a name="SubModule+command"></a>

### patreon.command : [<code>Command</code>](#Command)
The command object for registering command listeners.

**Kind**: instance property of [<code>Patreon</code>](#Patreon)  
<a name="SubModule+common"></a>

### patreon.common : [<code>Common</code>](#Common)
The common object.

**Kind**: instance property of [<code>Patreon</code>](#Patreon)  
<a name="SubModule+bot"></a>

### patreon.bot : [<code>SpikeyBot</code>](#SpikeyBot)
The parent SpikeyBot instance.

**Kind**: instance property of [<code>Patreon</code>](#Patreon)  
<a name="SubModule+myName"></a>

### patreon.myName : <code>string</code>
The name of this submodule. Used for differentiating in the log. Should be
defined before begin().

**Kind**: instance property of [<code>Patreon</code>](#Patreon)  
**Overrides**: [<code>myName</code>](#SubModule+myName)  
**Access**: protected  
<a name="SubModule+initialized"></a>

### patreon.initialized : <code>boolean</code>
Has this subModule been initialized yet (Has begin() been called).

**Kind**: instance property of [<code>Patreon</code>](#Patreon)  
**Default**: <code>false</code>  
**Access**: protected  
**Read only**: true  
<a name="SubModule+commit"></a>

### patreon.commit : <code>string</code>
The commit at HEAD at the time this module was loaded. Essentially the
version of this submodule.

**Kind**: instance constant of [<code>Patreon</code>](#Patreon)  
**Access**: public  
<a name="SubModule+loadTime"></a>

### patreon.loadTime : <code>number</code>
The time at which this madule was loaded for use in checking if the module
needs to be reloaded because the file has been modified since loading.

**Kind**: instance constant of [<code>Patreon</code>](#Patreon)  
**Access**: public  
<a name="SubModule+initialize"></a>

### patreon.initialize()
The function called at the end of begin() for further initialization
specific to the subModule. Must be defined before begin() is called.

**Kind**: instance method of [<code>Patreon</code>](#Patreon)  
**Overrides**: [<code>initialize</code>](#SubModule+initialize)  
**Access**: protected  
<a name="SubModule+begin"></a>

### patreon.begin(Discord, client, command, common, bot)
Initialize this submodule.

**Kind**: instance method of [<code>Patreon</code>](#Patreon)  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| Discord | <code>Discord</code> | The Discord object for the API library. |
| client | <code>Discord~Client</code> | The client that represents this bot. |
| command | [<code>Command</code>](#Command) | The command instance in which to register command listeners. |
| common | [<code>Common</code>](#Common) | Class storing common functions. |
| bot | [<code>SpikeyBot</code>](#SpikeyBot) | The parent SpikeyBot instance. |

<a name="SubModule+end"></a>

### patreon.end()
Trigger subModule to shutdown and get ready for process terminating.

**Kind**: instance method of [<code>Patreon</code>](#Patreon)  
**Access**: public  
<a name="SubModule+log"></a>

### patreon.log(msg)
Log using common.log, but automatically set name.

**Kind**: instance method of [<code>Patreon</code>](#Patreon)  
**Access**: protected  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>string</code> | The message to log. |

<a name="SubModule+debug"></a>

### patreon.debug(msg)
Log using common.logDebug, but automatically set name.

**Kind**: instance method of [<code>Patreon</code>](#Patreon)  
**Access**: protected  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>string</code> | The message to log. |

<a name="SubModule+warn"></a>

### patreon.warn(msg)
Log using common.logWarning, but automatically set name.

**Kind**: instance method of [<code>Patreon</code>](#Patreon)  
**Access**: protected  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>string</code> | The message to log. |

<a name="SubModule+error"></a>

### patreon.error(msg)
Log using common.error, but automatically set name.

**Kind**: instance method of [<code>Patreon</code>](#Patreon)  
**Access**: protected  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>string</code> | The message to log. |

<a name="SubModule+shutdown"></a>

### patreon.shutdown()
Shutdown and disable this submodule. Removes all event listeners.

**Kind**: instance method of [<code>Patreon</code>](#Patreon)  
**Overrides**: [<code>shutdown</code>](#SubModule+shutdown)  
**Access**: protected  
<a name="SubModule+save"></a>

### *patreon.save([opt])*
Saves all data to files necessary for saving current state.

**Kind**: instance abstract method of [<code>Patreon</code>](#Patreon)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [opt] | <code>string</code> | <code>&quot;&#x27;sync&#x27;&quot;</code> | Can be 'async', otherwise defaults to synchronous. |

<a name="SubModule+unloadable"></a>

### *patreon.unloadable() ⇒ <code>boolean</code>*
Check if this module is in a state that is ready to be unloaded. If false
is returned, this module should not be unloaded and doing such may risk
putting the module into an uncontrollable state.

**Kind**: instance abstract method of [<code>Patreon</code>](#Patreon)  
**Returns**: <code>boolean</code> - True if can be unloaded, false if cannot.  
**Access**: public  
<a name="Patreon..toExport"></a>

### Patreon~toExport
The object to put into the [SpikeyBot](#SpikeyBot) object. This
contains all of the public data available through that interface. Data will
be available after [Patreon.initialize](Patreon.initialize) has been called, at
`SpikeyBot.patreon`.

**Kind**: inner class of [<code>Patreon</code>](#Patreon)  

* [~toExport](#Patreon..toExport)
    * [.checkAllPerms(uId, cId, gId, perm, cb)](#Patreon..toExport.checkAllPerms)
    * [.getAllPerms(uId, cId, gId, cb)](#Patreon..toExport.getAllPerms)
        * [~onGetOverrides(err, info)](#Patreon..toExport.getAllPerms..onGetOverrides) : [<code>basicCB</code>](#Patreon..basicCB) ℗
        * [~getPerms(err, data)](#Patreon..toExport.getAllPerms..getPerms) : [<code>basicCB</code>](#Patreon..basicCB) ℗
        * [~onGetPerms(err, data)](#Patreon..toExport.getAllPerms..onGetPerms) : [<code>basicCB</code>](#Patreon..basicCB) ℗
    * [.checkPerm(uId, perm, cb)](#Patreon..toExport.checkPerm)
        * [~checkPerm(err, data)](#Patreon..toExport.checkPerm..checkPerm) : [<code>basicCB</code>](#Patreon..basicCB) ℗
    * [.getLevelPerms(pledgeAmount, exclusive, cb)](#Patreon..toExport.getLevelPerms)
    * [.getSettingValue(uId, cId, gId, permString, cb)](#Patreon..toExport.getSettingValue)
        * [~onCheckPerm(err, info)](#Patreon..toExport.getSettingValue..onCheckPerm) : [<code>basicCB</code>](#Patreon..basicCB) ℗
        * [~fetchValue(obj, keys, myCb)](#Patreon..toExport.getSettingValue..fetchValue) ℗
        * [~onFetchedValue(err, info)](#Patreon..toExport.getSettingValue..onFetchedValue) : [<code>basicCB</code>](#Patreon..basicCB) ℗

<a name="Patreon..toExport.checkAllPerms"></a>

#### toExport.checkAllPerms(uId, cId, gId, perm, cb)
Check that a user or channel or guild has permission for something. Checks
overrides for each, and if the user does not have an override, the request
is forwarded to [toExport.checkPerm](toExport.checkPerm).

**Kind**: static method of [<code>toExport</code>](#Patreon..toExport)  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| uId | <code>string</code> \| <code>number</code> | The Discord user ID to check. |
| cId | <code>string</code> \| <code>number</code> | The Discord channel ID to check. |
| gId | <code>string</code> \| <code>number</code> | The Discord guild ID to check. |
| perm | <code>string</code> | The permission string to check against. Null to check for overrides only. |
| cb | [<code>basicCB</code>](#Patreon..basicCB) | Callback with parameters for error and success values. |
| cb.data.status | <code>boolean</code> | If the given IDs have permission. |

<a name="Patreon..toExport.getAllPerms"></a>

#### toExport.getAllPerms(uId, cId, gId, cb)
Fetch all permissions for a given user, channel, or guild.

**Kind**: static method of [<code>toExport</code>](#Patreon..toExport)  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| uId | <code>string</code> \| <code>number</code> | The ID of the Discord user. |
| cId | <code>string</code> \| <code>number</code> | The Discord channel ID. |
| gId | <code>string</code> \| <code>number</code> | The Discord guild ID. |
| cb | [<code>basicCB</code>](#Patreon..basicCB) | Callback once operation is complete. |


* [.getAllPerms(uId, cId, gId, cb)](#Patreon..toExport.getAllPerms)
    * [~onGetOverrides(err, info)](#Patreon..toExport.getAllPerms..onGetOverrides) : [<code>basicCB</code>](#Patreon..basicCB) ℗
    * [~getPerms(err, data)](#Patreon..toExport.getAllPerms..getPerms) : [<code>basicCB</code>](#Patreon..basicCB) ℗
    * [~onGetPerms(err, data)](#Patreon..toExport.getAllPerms..onGetPerms) : [<code>basicCB</code>](#Patreon..basicCB) ℗

<a name="Patreon..toExport.getAllPerms..onGetOverrides"></a>

##### getAllPerms~onGetOverrides(err, info) : [<code>basicCB</code>](#Patreon..basicCB) ℗
Handle response from checking IDs for overrides.

**Kind**: inner method of [<code>getAllPerms</code>](#Patreon..toExport.getAllPerms)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| err | <code>string</code> | The error string, or null if no error. |
| info | <code>Object</code> | The returned data if there was no error. |

<a name="Patreon..toExport.getAllPerms..getPerms"></a>

##### getAllPerms~getPerms(err, data) : [<code>basicCB</code>](#Patreon..basicCB) ℗
Verifies that valid data was found, then fetches all permissions for the
user's pledge amount.

**Kind**: inner method of [<code>getAllPerms</code>](#Patreon..toExport.getAllPerms)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| err | <code>string</code> | The error string, or null if no error. |
| data | <code>Object</code> | The returned data if there was no error. |

<a name="Patreon..toExport.getAllPerms..onGetPerms"></a>

##### getAllPerms~onGetPerms(err, data) : [<code>basicCB</code>](#Patreon..basicCB) ℗
Verifies that valid data was found, then fetches all permissions for the
user's pledge amount.

**Kind**: inner method of [<code>getAllPerms</code>](#Patreon..toExport.getAllPerms)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| err | <code>string</code> | The error string, or null if no error. |
| data | <code>Object</code> | The returned data if there was no error. |

<a name="Patreon..toExport.checkPerm"></a>

#### toExport.checkPerm(uId, perm, cb)
Check that a user has a specific permission. Permissions are defined in
[patreonTierPermFile](#Patreon..patreonTierPermFile). This does not check overrides.

**Kind**: static method of [<code>toExport</code>](#Patreon..toExport)  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| uId | <code>string</code> \| <code>number</code> | The Discord user ID to check. |
| perm | <code>string</code> | The permission string to check against. |
| cb | [<code>basicCB</code>](#Patreon..basicCB) | Callback with parameters for error and success values. |
| cb.data.status | <code>boolean</code> | If the user has permission. |

<a name="Patreon..toExport.checkPerm..checkPerm"></a>

##### checkPerm~checkPerm(err, data) : [<code>basicCB</code>](#Patreon..basicCB) ℗
Checks the received data from the Patreon table against the given perm
string.

**Kind**: inner method of [<code>checkPerm</code>](#Patreon..toExport.checkPerm)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| err | <code>string</code> | The error string, or null if no error. |
| data | <code>Object</code> | The returned data if there was no error. |

<a name="Patreon..toExport.getLevelPerms"></a>

#### toExport.getLevelPerms(pledgeAmount, exclusive, cb)
Responds with all permissions available at the given pledge amount.

**Kind**: static method of [<code>toExport</code>](#Patreon..toExport)  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| pledgeAmount | <code>number</code> | The amount in cents that the user has pledged. |
| exclusive | <code>boolean</code> | Only get the rewards received at the exact pledge amount. Does not show all tier rewards below the pledge amount. |
| cb | [<code>basicCB</code>](#Patreon..basicCB) | Callback with parameters for error and success values. |
| cb.data.status | <code>Array.&lt;string&gt;</code> | All of the permission strings. |

<a name="Patreon..toExport.getSettingValue"></a>

#### toExport.getSettingValue(uId, cId, gId, permString, cb)
Responds with the settings value for a user if they have permission for the
setting, otherwise replies with the default value.

**Kind**: static method of [<code>toExport</code>](#Patreon..toExport)  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| uId | <code>number</code> \| <code>string</code> | The user id to check, or null to get the default value. |
| cId | <code>number</code> \| <code>string</code> | The Discord channel id to check, or null to get the default value. |
| gId | <code>number</code> \| <code>string</code> | The Discord guild id to check, or null to get the default value. |
| permString | <code>string</code> | The permission to check with subvalues separated by spaces. |
| cb | [<code>basicCB</code>](#Patreon..basicCB) | Callback with parameters for error and success values. |
| cb.data.status | <code>\*</code> | The setting's value. |


* [.getSettingValue(uId, cId, gId, permString, cb)](#Patreon..toExport.getSettingValue)
    * [~onCheckPerm(err, info)](#Patreon..toExport.getSettingValue..onCheckPerm) : [<code>basicCB</code>](#Patreon..basicCB) ℗
    * [~fetchValue(obj, keys, myCb)](#Patreon..toExport.getSettingValue..fetchValue) ℗
    * [~onFetchedValue(err, info)](#Patreon..toExport.getSettingValue..onFetchedValue) : [<code>basicCB</code>](#Patreon..basicCB) ℗

<a name="Patreon..toExport.getSettingValue..onCheckPerm"></a>

##### getSettingValue~onCheckPerm(err, info) : [<code>basicCB</code>](#Patreon..basicCB) ℗
After check for user perms, this will fetch either the default value, or
the user's custom setting.

**Kind**: inner method of [<code>getSettingValue</code>](#Patreon..toExport.getSettingValue)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| err | <code>string</code> | The error string, or null if no error. |
| info | <code>Object</code> | The returned data if there was no error. |

<a name="Patreon..toExport.getSettingValue..fetchValue"></a>

##### getSettingValue~fetchValue(obj, keys, myCb) ℗
Searches an object for the given key values.

**Kind**: inner method of [<code>getSettingValue</code>](#Patreon..toExport.getSettingValue)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| obj | <code>Object</code> | The object to traverse. |
| keys | <code>Array.&lt;string&gt;</code> | The keys to step through. |
| myCb | [<code>basicCB</code>](#Patreon..basicCB) | The callback with the final value. |

<a name="Patreon..toExport.getSettingValue..onFetchedValue"></a>

##### getSettingValue~onFetchedValue(err, info) : [<code>basicCB</code>](#Patreon..basicCB) ℗
After a user's setting value has been fetched, check if it has been
set, if not then return the default.

**Kind**: inner method of [<code>getSettingValue</code>](#Patreon..toExport.getSettingValue)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| err | <code>string</code> | The error string, or null if no error. |
| info | <code>Object</code> | The returned data if there was no error. |

<a name="Patreon..patreonTiers"></a>

### Patreon~patreonTiers : <code>Array.&lt;{0: number, 1: Array.&lt;string&gt;}&gt;</code> ℗
The parsed data from file about patron tier rewards.

**Kind**: inner property of [<code>Patreon</code>](#Patreon)  
**Default**: <code>{}</code>  
**Access**: private  
**See**: [patreonTierPermFile](#Patreon..patreonTierPermFile)  
<a name="Patreon..patreonSettingsTemplate"></a>

### Patreon~patreonSettingsTemplate : <code>Object.&lt;Object&gt;</code> ℗
The parsed data from [patreonSettingsTemplateFile](#Patreon..patreonSettingsTemplateFile). Data
that outlines the available options that can be changed, and their possible
values.

**Kind**: inner property of [<code>Patreon</code>](#Patreon)  
**Default**: <code>{}</code>  
**Access**: private  
<a name="Patreon..sqlCon"></a>

### Patreon~sqlCon : <code>sql.ConnectionConfig</code> ℗
The object describing the connection with the SQL server.

**Kind**: inner property of [<code>Patreon</code>](#Patreon)  
**Access**: private  
<a name="Patreon..patreonSettingsFilename"></a>

### Patreon~patreonSettingsFilename : <code>string</code> ℗
The filename in the user's directory of the file where the settings related
to Patreon rewards are stored.

**Kind**: inner constant of [<code>Patreon</code>](#Patreon)  
**Default**: <code>&quot;/patreonSettings.json&quot;</code>  
**Access**: private  
<a name="Patreon..patreonTierPermFile"></a>

### Patreon~patreonTierPermFile : <code>string</code> ℗
Path to the file storing information about each patron tier rewards.

**Kind**: inner constant of [<code>Patreon</code>](#Patreon)  
**Default**: <code>&quot;./save/patreonTiers.json&quot;</code>  
**Access**: private  
<a name="Patreon..patreonSettingsTemplateFile"></a>

### Patreon~patreonSettingsTemplateFile : <code>string</code> ℗
File where the template for the Patreon settings is stored.

**Kind**: inner constant of [<code>Patreon</code>](#Patreon)  
**Default**: <code>&quot;./save/patreonSettingTemplate.json&quot;</code>  
**Access**: private  
**See**

- [patreonSettingsTemplate](#Patreon..patreonSettingsTemplate)
- [patreonSettingsTemplate](#WebAccount..patreonSettingsTemplate)

<a name="Patreon..updateTierPerms"></a>

### Patreon~updateTierPerms() ℗
Parse tiers from file.

**Kind**: inner method of [<code>Patreon</code>](#Patreon)  
**Access**: private  
**See**: [patreonTierPermFile](#Patreon..patreonTierPermFile)  
<a name="Patreon..updatePatreonSettingsTemplate"></a>

### Patreon~updatePatreonSettingsTemplate() ℗
Parse template from file.

**Kind**: inner method of [<code>Patreon</code>](#Patreon)  
**Access**: private  
**See**: [patreonSettingsTemplate](#Patreon..patreonSettingsTemplate)  
<a name="Patreon..connectSQL"></a>

### Patreon~connectSQL() ℗
Create initial connection with sql server.

**Kind**: inner method of [<code>Patreon</code>](#Patreon)  
**Access**: private  
<a name="Patreon..commandPatreon"></a>

### Patreon~commandPatreon(msg) : [<code>commandHandler</code>](#commandHandler) ℗
Shows the user's Patreon information to the user.

**Kind**: inner method of [<code>Patreon</code>](#Patreon)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord~Message</code> | Message that triggered command. |


* [~commandPatreon(msg)](#Patreon..commandPatreon) : [<code>commandHandler</code>](#commandHandler) ℗
    * [~getPerms(err, data)](#Patreon..commandPatreon..getPerms) : [<code>basicCB</code>](#Patreon..basicCB) ℗
    * [~onGetPerms(err, data)](#Patreon..commandPatreon..onGetPerms) : [<code>basicCB</code>](#Patreon..basicCB) ℗

<a name="Patreon..commandPatreon..getPerms"></a>

#### commandPatreon~getPerms(err, data) : [<code>basicCB</code>](#Patreon..basicCB) ℗
Verifies that valid data was found, then fetches all permissions for the
user's pledge amount.

**Kind**: inner method of [<code>commandPatreon</code>](#Patreon..commandPatreon)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| err | <code>string</code> | The error string, or null if no error. |
| data | <code>Object</code> | The returned data if there was no error. |

<a name="Patreon..commandPatreon..onGetPerms"></a>

#### commandPatreon~onGetPerms(err, data) : [<code>basicCB</code>](#Patreon..basicCB) ℗
Verifies that valid data was found, then fetches all permissions for the
user's pledge amount.

**Kind**: inner method of [<code>commandPatreon</code>](#Patreon..commandPatreon)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| err | <code>string</code> | The error string, or null if no error. |
| data | <code>Object</code> | The returned data if there was no error. |

<a name="Patreon..fetchPatreonRow"></a>

### Patreon~fetchPatreonRow(uId, cb) ℗
Get the Patreon information for a given Discord user.

**Kind**: inner method of [<code>Patreon</code>](#Patreon)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| uId | <code>string</code> \| <code>number</code> | The Discord user ID to check. |
| cb | [<code>basicCB</code>](#Patreon..basicCB) | Callback with parameters for error and success values. |
| cb.data.status | <code>Object</code> | A single row if it was found. |


* [~fetchPatreonRow(uId, cb)](#Patreon..fetchPatreonRow) ℗
    * [~receivedDiscordRow(err, rows)](#Patreon..fetchPatreonRow..receivedDiscordRow) ℗
    * [~receivedPatreonRow(err, rows)](#Patreon..fetchPatreonRow..receivedPatreonRow) ℗

<a name="Patreon..fetchPatreonRow..receivedDiscordRow"></a>

#### fetchPatreonRow~receivedDiscordRow(err, rows) ℗
SQL query response callback for request to the Discord table.

**Kind**: inner method of [<code>fetchPatreonRow</code>](#Patreon..fetchPatreonRow)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| err | <code>Error</code> | Errors during the query. |
| rows | <code>Array</code> | The results of the query. |

<a name="Patreon..fetchPatreonRow..receivedPatreonRow"></a>

#### fetchPatreonRow~receivedPatreonRow(err, rows) ℗
SQL query response callback for request to the Patreon table.

**Kind**: inner method of [<code>fetchPatreonRow</code>](#Patreon..fetchPatreonRow)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| err | <code>Error</code> | Errors during the query. |
| rows | <code>Array</code> | The results of the query. |

<a name="Patreon..basicCB"></a>

### Patreon~basicCB : <code>function</code>
Basic callback function that has two parameters. One with error
information, and the other with data if there was no error.

**Kind**: inner typedef of [<code>Patreon</code>](#Patreon)  

| Param | Type | Description |
| --- | --- | --- |
| err | <code>string</code> | The error string, or null if no error. |
| data | <code>Object</code> | The returned data if there was no error. |

<a name="Polling"></a>

## Polling ⇐ [<code>SubModule</code>](#SubModule)
Controlls poll and vote commands.

**Kind**: global class  
**Extends**: [<code>SubModule</code>](#SubModule)  

* [Polling](#Polling) ⇐ [<code>SubModule</code>](#SubModule)
    * _instance_
        * [.helpMessage](#SubModule+helpMessage) : <code>string</code> \| <code>Discord~MessageEmbed</code>
        * *[.postPrefix](#SubModule+postPrefix) : <code>string</code>*
        * [.Discord](#SubModule+Discord) : <code>Discord</code>
        * [.client](#SubModule+client) : <code>Discord~Client</code>
        * [.command](#SubModule+command) : [<code>Command</code>](#Command)
        * [.common](#SubModule+common) : [<code>Common</code>](#Common)
        * [.bot](#SubModule+bot) : [<code>SpikeyBot</code>](#SpikeyBot)
        * [.myName](#SubModule+myName) : <code>string</code>
        * [.initialized](#SubModule+initialized) : <code>boolean</code>
        * [.commit](#SubModule+commit) : <code>string</code>
        * [.loadTime](#SubModule+loadTime) : <code>number</code>
        * [.initialize()](#SubModule+initialize)
        * [.begin(Discord, client, command, common, bot)](#SubModule+begin)
        * [.end()](#SubModule+end)
        * [.log(msg)](#SubModule+log)
        * [.debug(msg)](#SubModule+debug)
        * [.warn(msg)](#SubModule+warn)
        * [.error(msg)](#SubModule+error)
        * [.shutdown()](#SubModule+shutdown)
        * [.save([opt])](#SubModule+save)
        * *[.unloadable()](#SubModule+unloadable) ⇒ <code>boolean</code>*
    * _inner_
        * [~Poll](#Polling..Poll) ℗
            * [new Poll(request, message, options)](#new_Polling..Poll_new)
            * [.request](#Polling..Poll+request) : <code>Discord~Message</code>
            * [.message](#Polling..Poll+message) : <code>Discord~Message</code>
            * [.title](#Polling..Poll+title) : <code>string</code>
            * [.endTime](#Polling..Poll+endTime) : <code>number</code>
            * [.emojis](#Polling..Poll+emojis) : <code>Array.&lt;string&gt;</code>
            * [.choices](#Polling..Poll+choices) : <code>Array.&lt;string&gt;</code>
            * [.timeout](#Polling..Poll+timeout) : <code>Timeout</code>
        * [~currentPolls](#Polling..currentPolls) : [<code>Object.&lt;Poll&gt;</code>](#Polling..Poll) ℗
        * [~guildSubDir](#Polling..guildSubDir) ℗
        * [~saveFilename](#Polling..saveFilename) ℗
        * [~defaultEmojis](#Polling..defaultEmojis) ℗
        * [~parsePollString(string)](#Polling..parsePollString) ℗
        * [~mkdirAndWrite(dir, filename, data)](#Polling..mkdirAndWrite) ℗
        * [~mkdirAndWriteSync(dir, filename, data)](#Polling..mkdirAndWriteSync) ℗
        * [~commandPoll(msg)](#Polling..commandPoll) : [<code>commandHandler</code>](#commandHandler) ℗
        * [~addListenersToPoll(poll, key)](#Polling..addListenersToPoll) ℗
        * [~addNextReaction(poll, [index])](#Polling..addNextReaction) ⇒ <code>function</code> ℗
        * [~commandEndPoll(msg)](#Polling..commandEndPoll) : [<code>commandHandler</code>](#commandHandler) ℗
        * [~endPoll(poll)](#Polling..endPoll) ⇒ <code>boolean</code> ℗

<a name="SubModule+helpMessage"></a>

### polling.helpMessage : <code>string</code> \| <code>Discord~MessageEmbed</code>
The help message to show the user in the main help message.

**Kind**: instance property of [<code>Polling</code>](#Polling)  
**Overrides**: [<code>helpMessage</code>](#SubModule+helpMessage)  
<a name="SubModule+postPrefix"></a>

### *polling.postPrefix : <code>string</code>*
The postfix for the global prefix for this subModule. Must be defined
before begin(), otherwise it is ignored.

**Kind**: instance abstract property of [<code>Polling</code>](#Polling)  
**Default**: <code>&quot;&quot;</code>  
<a name="SubModule+Discord"></a>

### polling.Discord : <code>Discord</code>
The current Discord object instance of the bot.

**Kind**: instance property of [<code>Polling</code>](#Polling)  
<a name="SubModule+client"></a>

### polling.client : <code>Discord~Client</code>
The current bot client.

**Kind**: instance property of [<code>Polling</code>](#Polling)  
<a name="SubModule+command"></a>

### polling.command : [<code>Command</code>](#Command)
The command object for registering command listeners.

**Kind**: instance property of [<code>Polling</code>](#Polling)  
<a name="SubModule+common"></a>

### polling.common : [<code>Common</code>](#Common)
The common object.

**Kind**: instance property of [<code>Polling</code>](#Polling)  
<a name="SubModule+bot"></a>

### polling.bot : [<code>SpikeyBot</code>](#SpikeyBot)
The parent SpikeyBot instance.

**Kind**: instance property of [<code>Polling</code>](#Polling)  
<a name="SubModule+myName"></a>

### polling.myName : <code>string</code>
The name of this submodule. Used for differentiating in the log. Should be
defined before begin().

**Kind**: instance property of [<code>Polling</code>](#Polling)  
**Overrides**: [<code>myName</code>](#SubModule+myName)  
**Access**: protected  
<a name="SubModule+initialized"></a>

### polling.initialized : <code>boolean</code>
Has this subModule been initialized yet (Has begin() been called).

**Kind**: instance property of [<code>Polling</code>](#Polling)  
**Default**: <code>false</code>  
**Access**: protected  
**Read only**: true  
<a name="SubModule+commit"></a>

### polling.commit : <code>string</code>
The commit at HEAD at the time this module was loaded. Essentially the
version of this submodule.

**Kind**: instance constant of [<code>Polling</code>](#Polling)  
**Access**: public  
<a name="SubModule+loadTime"></a>

### polling.loadTime : <code>number</code>
The time at which this madule was loaded for use in checking if the module
needs to be reloaded because the file has been modified since loading.

**Kind**: instance constant of [<code>Polling</code>](#Polling)  
**Access**: public  
<a name="SubModule+initialize"></a>

### polling.initialize()
The function called at the end of begin() for further initialization
specific to the subModule. Must be defined before begin() is called.

**Kind**: instance method of [<code>Polling</code>](#Polling)  
**Overrides**: [<code>initialize</code>](#SubModule+initialize)  
**Access**: protected  
<a name="SubModule+begin"></a>

### polling.begin(Discord, client, command, common, bot)
Initialize this submodule.

**Kind**: instance method of [<code>Polling</code>](#Polling)  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| Discord | <code>Discord</code> | The Discord object for the API library. |
| client | <code>Discord~Client</code> | The client that represents this bot. |
| command | [<code>Command</code>](#Command) | The command instance in which to register command listeners. |
| common | [<code>Common</code>](#Common) | Class storing common functions. |
| bot | [<code>SpikeyBot</code>](#SpikeyBot) | The parent SpikeyBot instance. |

<a name="SubModule+end"></a>

### polling.end()
Trigger subModule to shutdown and get ready for process terminating.

**Kind**: instance method of [<code>Polling</code>](#Polling)  
**Access**: public  
<a name="SubModule+log"></a>

### polling.log(msg)
Log using common.log, but automatically set name.

**Kind**: instance method of [<code>Polling</code>](#Polling)  
**Access**: protected  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>string</code> | The message to log. |

<a name="SubModule+debug"></a>

### polling.debug(msg)
Log using common.logDebug, but automatically set name.

**Kind**: instance method of [<code>Polling</code>](#Polling)  
**Access**: protected  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>string</code> | The message to log. |

<a name="SubModule+warn"></a>

### polling.warn(msg)
Log using common.logWarning, but automatically set name.

**Kind**: instance method of [<code>Polling</code>](#Polling)  
**Access**: protected  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>string</code> | The message to log. |

<a name="SubModule+error"></a>

### polling.error(msg)
Log using common.error, but automatically set name.

**Kind**: instance method of [<code>Polling</code>](#Polling)  
**Access**: protected  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>string</code> | The message to log. |

<a name="SubModule+shutdown"></a>

### polling.shutdown()
Shutdown and disable this submodule. Removes all event listeners.

**Kind**: instance method of [<code>Polling</code>](#Polling)  
**Overrides**: [<code>shutdown</code>](#SubModule+shutdown)  
**Access**: protected  
<a name="SubModule+save"></a>

### polling.save([opt])
Saves all data to files necessary for saving current state.

**Kind**: instance method of [<code>Polling</code>](#Polling)  
**Overrides**: [<code>save</code>](#SubModule+save)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [opt] | <code>string</code> | <code>&quot;&#x27;sync&#x27;&quot;</code> | Can be 'async', otherwise defaults to synchronous. |

<a name="SubModule+unloadable"></a>

### *polling.unloadable() ⇒ <code>boolean</code>*
Check if this module is in a state that is ready to be unloaded. If false
is returned, this module should not be unloaded and doing such may risk
putting the module into an uncontrollable state.

**Kind**: instance abstract method of [<code>Polling</code>](#Polling)  
**Returns**: <code>boolean</code> - True if can be unloaded, false if cannot.  
**Access**: public  
<a name="Polling..Poll"></a>

### Polling~Poll ℗
Stores data related to a single poll.

**Kind**: inner class of [<code>Polling</code>](#Polling)  
**Access**: private  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| request | <code>Discord~Message</code> | Reference to the Message object that caused this poll to begin. |
| message | <code>Discord~Message</code> | Reference to the Message object with the reaction listener. |
| title | <code>string</code> | The user defined text associated with this poll. |
| endTime | <code>number</code> | The timestamp at which this poll is scheduled to end. |
| emojis | <code>Array.&lt;string&gt;</code> | The emojis to add as reactions to use as buttons. |
| choices | <code>Array.&lt;string&gt;</code> | The full string that came with the emoji if the user specified custom response options. |
| timeout | <code>Array.&lt;string&gt;</code> | The scheduled timeout when this poll will end. |


* [~Poll](#Polling..Poll) ℗
    * [new Poll(request, message, options)](#new_Polling..Poll_new)
    * [.request](#Polling..Poll+request) : <code>Discord~Message</code>
    * [.message](#Polling..Poll+message) : <code>Discord~Message</code>
    * [.title](#Polling..Poll+title) : <code>string</code>
    * [.endTime](#Polling..Poll+endTime) : <code>number</code>
    * [.emojis](#Polling..Poll+emojis) : <code>Array.&lt;string&gt;</code>
    * [.choices](#Polling..Poll+choices) : <code>Array.&lt;string&gt;</code>
    * [.timeout](#Polling..Poll+timeout) : <code>Timeout</code>

<a name="new_Polling..Poll_new"></a>

#### new Poll(request, message, options)

| Param | Type | Description |
| --- | --- | --- |
| request | <code>Discord~Message</code> | The message that was sent that caused this poll to begin. |
| message | <code>Discord~Message</code> | The message to watch for the results. |
| options | <code>Polling~PollOptions</code> | The settings for this current poll. |

<a name="Polling..Poll+request"></a>

#### poll.request : <code>Discord~Message</code>
Reference to the Message object that caused this poll to begin.

**Kind**: instance property of [<code>Poll</code>](#Polling..Poll)  
**Access**: public  
<a name="Polling..Poll+message"></a>

#### poll.message : <code>Discord~Message</code>
Reference to the Message object with the reaction listener.

**Kind**: instance property of [<code>Poll</code>](#Polling..Poll)  
**Access**: public  
<a name="Polling..Poll+title"></a>

#### poll.title : <code>string</code>
The user defined text associated with this poll.

**Kind**: instance property of [<code>Poll</code>](#Polling..Poll)  
**Access**: public  
<a name="Polling..Poll+endTime"></a>

#### poll.endTime : <code>number</code>
The timestamp at which this poll is scheduled to end.

**Kind**: instance property of [<code>Poll</code>](#Polling..Poll)  
**Access**: public  
<a name="Polling..Poll+emojis"></a>

#### poll.emojis : <code>Array.&lt;string&gt;</code>
The emojis to add as reactions to use as buttons.

**Kind**: instance property of [<code>Poll</code>](#Polling..Poll)  
**Access**: public  
<a name="Polling..Poll+choices"></a>

#### poll.choices : <code>Array.&lt;string&gt;</code>
The full string that came with the emoji if the user specified custom
response options.

**Kind**: instance property of [<code>Poll</code>](#Polling..Poll)  
**Access**: public  
<a name="Polling..Poll+timeout"></a>

#### poll.timeout : <code>Timeout</code>
The scheduled timeout when this poll will end.

**Kind**: instance property of [<code>Poll</code>](#Polling..Poll)  
**Access**: public  
<a name="Polling..currentPolls"></a>

### Polling~currentPolls : [<code>Object.&lt;Poll&gt;</code>](#Polling..Poll) ℗
Stores the currently cached data about all active polls. Organized by
message id that is collecting the poll data.

**Kind**: inner property of [<code>Polling</code>](#Polling)  
**Access**: private  
<a name="Polling..guildSubDir"></a>

### Polling~guildSubDir ℗
The subdirectory in the guild to store all member polls.

**Kind**: inner constant of [<code>Polling</code>](#Polling)  
**Default**: <code>/polls/</code>  
**Access**: private  
<a name="Polling..saveFilename"></a>

### Polling~saveFilename ℗
The filename in the member's subdirectory, in the guild's subdirectory, to
save a poll's state.

**Kind**: inner constant of [<code>Polling</code>](#Polling)  
**Default**: <code>/save.json</code>  
**Access**: private  
<a name="Polling..defaultEmojis"></a>

### Polling~defaultEmojis ℗
The default reaction emojis to use for a poll.

**Kind**: inner constant of [<code>Polling</code>](#Polling)  
**Default**: <code>[&quot;👍&quot;,&quot;👎&quot;,&quot;🤷&quot;]</code>  
**Access**: private  
<a name="Polling..parsePollString"></a>

### Polling~parsePollString(string) ℗
Parse the saved poll data that has been read from file in JSON format.

**Kind**: inner method of [<code>Polling</code>](#Polling)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| string | <code>string</code> | The file data. |

<a name="Polling..mkdirAndWrite"></a>

### Polling~mkdirAndWrite(dir, filename, data) ℗
Asyncronously create a directory and write a file in the directory.

**Kind**: inner method of [<code>Polling</code>](#Polling)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| dir | <code>string</code> | The file path to create and write the file to. |
| filename | <code>string</code> | The file name of the file without the path. |
| data | <code>string</code> | The data to write to the tile. |

<a name="Polling..mkdirAndWriteSync"></a>

### Polling~mkdirAndWriteSync(dir, filename, data) ℗
Syncronously create a directory and write a file in the directory.

**Kind**: inner method of [<code>Polling</code>](#Polling)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| dir | <code>string</code> | The file path to create and write the file to. |
| filename | <code>string</code> | The file name of the file without the path. |
| data | <code>string</code> | The data to write to the tile. |

<a name="Polling..commandPoll"></a>

### Polling~commandPoll(msg) : [<code>commandHandler</code>](#commandHandler) ℗
Starts a poll.

**Kind**: inner method of [<code>Polling</code>](#Polling)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord~Message</code> | Message that triggered command. |

<a name="Polling..addListenersToPoll"></a>

### Polling~addListenersToPoll(poll, key) ℗
Add timeout and possibly other listeners to a poll.

**Kind**: inner method of [<code>Polling</code>](#Polling)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| poll | [<code>Poll</code>](#Polling..Poll) | The poll to register. |
| key | <code>string</code> | The [currentPolls](#Polling..currentPolls) key to remove the poll from once the poll has ended. |

<a name="Polling..addNextReaction"></a>

### Polling~addNextReaction(poll, [index]) ⇒ <code>function</code> ℗
Create a callback for adding all reactions to a message.

**Kind**: inner method of [<code>Polling</code>](#Polling)  
**Returns**: <code>function</code> - The callback to run on Promise completion.  
**Access**: private  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| poll | [<code>Poll</code>](#Polling..Poll) |  | The poll object for adding reactions. |
| [index] | <code>number</code> | <code>0</code> | The index of the emoji to add first. |

<a name="Polling..commandEndPoll"></a>

### Polling~commandEndPoll(msg) : [<code>commandHandler</code>](#commandHandler) ℗
Ends a poll.

**Kind**: inner method of [<code>Polling</code>](#Polling)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord~Message</code> | Message that triggered command. |

<a name="Polling..endPoll"></a>

### Polling~endPoll(poll) ⇒ <code>boolean</code> ℗
End a poll. Does not remove it from [currentPolls](#Polling..currentPolls).

**Kind**: inner method of [<code>Polling</code>](#Polling)  
**Returns**: <code>boolean</code> - Was the poll successfully ended.  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| poll | [<code>Poll</code>](#Polling..Poll) | The poll to end. |

<a name="SMLoader"></a>

## SMLoader ⇐ [<code>MainModule</code>](#MainModule)
Manages loading, unloading, and reloading of all SubModules.

**Kind**: global class  
**Extends**: [<code>MainModule</code>](#MainModule)  

* [SMLoader](#SMLoader) ⇐ [<code>MainModule</code>](#MainModule)
    * _instance_
        * [.helpMessage](#SubModule+helpMessage) : <code>string</code> \| <code>Discord~MessageEmbed</code>
        * *[.postPrefix](#SubModule+postPrefix) : <code>string</code>*
        * [.Discord](#SubModule+Discord) : <code>Discord</code>
        * [.client](#SubModule+client) : <code>Discord~Client</code>
        * [.command](#SubModule+command) : [<code>Command</code>](#Command)
        * [.common](#SubModule+common) : [<code>Common</code>](#Common)
        * [.bot](#SubModule+bot) : [<code>SpikeyBot</code>](#SpikeyBot)
        * [.myName](#SubModule+myName) : <code>string</code>
        * [.initialized](#SubModule+initialized) : <code>boolean</code>
        * [.commit](#SubModule+commit) : <code>string</code>
        * [.loadTime](#SubModule+loadTime) : <code>number</code>
        * [.unload(name, [opts], [cb])](#SMLoader+unload)
        * [.load(name, [opts], [cb])](#SMLoader+load)
        * [.reload([name], [opts], [cb])](#SMLoader+reload)
            * [~reloadSingle(name)](#SMLoader+reload..reloadSingle) ℗
            * [~done()](#SMLoader+reload..done) ℗
        * [.import(data)](#MainModule+import)
        * [.export()](#MainModule+export) ⇒ [<code>ModuleData</code>](#MainModule..ModuleData)
        * [.terminate()](#MainModule+terminate)
        * [.initialize()](#SubModule+initialize)
        * [.begin(Discord, client, command, common, bot)](#SubModule+begin)
        * [.end()](#SubModule+end)
        * [.log(msg)](#SubModule+log)
        * [.debug(msg)](#SubModule+debug)
        * [.warn(msg)](#SubModule+warn)
        * [.error(msg)](#SubModule+error)
        * *[.shutdown()](#SubModule+shutdown)*
        * [.save([opt])](#SubModule+save)
        * [.unloadable()](#SubModule+unloadable) ⇒ <code>boolean</code>
    * _inner_
        * [~toAssign](#SMLoader..toAssign) : <code>Class</code> ℗
            * [.bot.getSubmoduleCommits()](#SMLoader..toAssign.bot.getSubmoduleCommits) ⇒ <code>Array.&lt;{name: string, commit: string}&gt;</code>
            * [.bot.getSubmodule(name)](#SMLoader..toAssign.bot.getSubmodule) ⇒ [<code>SubModule</code>](#SubModule)
            * [.client.reloadUpdatedSubModules()](#SMLoader..toAssign.client.reloadUpdatedSubModules)
        * [~subModuleNames](#SMLoader..subModuleNames) : <code>Array.&lt;string&gt;</code> ℗
        * [~goalSubModuleNames](#SMLoader..goalSubModuleNames) : <code>null</code> \| <code>Array.&lt;string&gt;</code> ℗
        * [~subModules](#SMLoader..subModules) : [<code>Object.&lt;SubModule&gt;</code>](#SubModule) ℗
        * [~unloadTimeouts](#SMLoader..unloadTimeouts) : <code>Object.&lt;Timeout&gt;</code> ℗
        * [~unloadCallbacks](#SMLoader..unloadCallbacks) : <code>Object.&lt;Array.&lt;function()&gt;&gt;</code> ℗
        * [~smListFilename](#SMLoader..smListFilename) : <code>string</code> ℗
        * [~trustedIds](#SMLoader..trustedIds) : <code>Array.&lt;string&gt;</code> ℗
        * [~helpmessagereply](#SMLoader..helpmessagereply) : <code>string</code> ℗
        * [~blockedmessage](#SMLoader..blockedmessage) : <code>string</code> ℗
        * [~commandReload(msg)](#SMLoader..commandReload) : <code>Command~commandHandler</code> ℗
        * [~commandUnload(msg)](#SMLoader..commandUnload) : <code>Command~commandHandler</code> ℗
        * [~commandLoad(msg)](#SMLoader..commandLoad) : <code>Command~commandHandler</code> ℗
        * [~commandHelp(msg)](#SMLoader..commandHelp) : <code>Command~commandHandler</code> ℗
            * [~send(help)](#SMLoader..commandHelp..send) ℗

<a name="SubModule+helpMessage"></a>

### smLoader.helpMessage : <code>string</code> \| <code>Discord~MessageEmbed</code>
The help message to show the user in the main help message.

**Kind**: instance property of [<code>SMLoader</code>](#SMLoader)  
<a name="SubModule+postPrefix"></a>

### *smLoader.postPrefix : <code>string</code>*
The postfix for the global prefix for this subModule. Must be defined
before begin(), otherwise it is ignored.

**Kind**: instance abstract property of [<code>SMLoader</code>](#SMLoader)  
**Default**: <code>&quot;&quot;</code>  
<a name="SubModule+Discord"></a>

### smLoader.Discord : <code>Discord</code>
The current Discord object instance of the bot.

**Kind**: instance property of [<code>SMLoader</code>](#SMLoader)  
<a name="SubModule+client"></a>

### smLoader.client : <code>Discord~Client</code>
The current bot client.

**Kind**: instance property of [<code>SMLoader</code>](#SMLoader)  
<a name="SubModule+command"></a>

### smLoader.command : [<code>Command</code>](#Command)
The command object for registering command listeners.

**Kind**: instance property of [<code>SMLoader</code>](#SMLoader)  
<a name="SubModule+common"></a>

### smLoader.common : [<code>Common</code>](#Common)
The common object.

**Kind**: instance property of [<code>SMLoader</code>](#SMLoader)  
<a name="SubModule+bot"></a>

### smLoader.bot : [<code>SpikeyBot</code>](#SpikeyBot)
The parent SpikeyBot instance.

**Kind**: instance property of [<code>SMLoader</code>](#SMLoader)  
<a name="SubModule+myName"></a>

### smLoader.myName : <code>string</code>
The name of this submodule. Used for differentiating in the log. Should be
defined before begin().

**Kind**: instance property of [<code>SMLoader</code>](#SMLoader)  
**Overrides**: [<code>myName</code>](#SubModule+myName)  
**Access**: protected  
<a name="SubModule+initialized"></a>

### smLoader.initialized : <code>boolean</code>
Has this subModule been initialized yet (Has begin() been called).

**Kind**: instance property of [<code>SMLoader</code>](#SMLoader)  
**Default**: <code>false</code>  
**Access**: protected  
**Read only**: true  
<a name="SubModule+commit"></a>

### smLoader.commit : <code>string</code>
The commit at HEAD at the time this module was loaded. Essentially the
version of this submodule.

**Kind**: instance constant of [<code>SMLoader</code>](#SMLoader)  
**Access**: public  
<a name="SubModule+loadTime"></a>

### smLoader.loadTime : <code>number</code>
The time at which this madule was loaded for use in checking if the module
needs to be reloaded because the file has been modified since loading.

**Kind**: instance constant of [<code>SMLoader</code>](#SMLoader)  
**Access**: public  
<a name="SMLoader+unload"></a>

### smLoader.unload(name, [opts], [cb])
Unloads submodules that is currently loaded.

**Kind**: instance method of [<code>SMLoader</code>](#SMLoader)  
**Access**: public  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| name | <code>string</code> |  | Specify submodule to unload. If it is already unloaded, it will be ignored and return successful. |
| [opts] | <code>Object</code> |  | Options object. |
| [opts.schedule] | <code>boolean</code> | <code>true</code> | Automatically re-schedule unload for submodule if it is in an unloadable state. |
| [opts.ignoreUnloadable] | <code>boolean</code> | <code>false</code> | Force a submodule to unload even if it is not in an unloadable state. |
| [opts.updateGoal] | <code>boolean</code> | <code>true</code> | Update the goal state of the subModule to unloaded. |
| [cb] | <code>function</code> |  | Callback to fire once the operation is complete. Single parameter is null if success, or string if error. |

<a name="SMLoader+load"></a>

### smLoader.load(name, [opts], [cb])
Loads submodules from file.

**Kind**: instance method of [<code>SMLoader</code>](#SMLoader)  
**Access**: public  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| name | <code>string</code> |  | Specify submodule to load. If it is already loaded, they will be ignored and return successful. |
| [opts] | <code>Object</code> |  | Options object. |
| [opts.updateGoal] | <code>boolean</code> | <code>true</code> | Update the goal state of the subModule to loaded. |
| [cb] | <code>function</code> |  | Callback to fire once the operation is complete. Single parameter is null if success, or string if error. |

<a name="SMLoader+reload"></a>

### smLoader.reload([name], [opts], [cb])
Reloads submodules from file. Reloads currently loaded modules if
`name` is not specified. If a submodule is specified that is not
loaded, it will skip the unload step, bull will still be attempted to be
loaded.

**Kind**: instance method of [<code>SMLoader</code>](#SMLoader)  
**Access**: public  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [name] | <code>string</code> \| <code>Array.&lt;string&gt;</code> |  | Specify submodules to reload, or null to reload all submodules to their goal state. |
| [opts] | <code>Object</code> |  | Options object. |
| [opts.schedule] | <code>boolean</code> | <code>true</code> | Automatically re-schedule reload for submodules if they are not in an unloadable state. |
| [opts.ignoreUnloadable] | <code>boolean</code> | <code>false</code> | Force a submodule to unload even if it is not in an unloadable state. |
| [opts.force] | <code>boolean</code> | <code>false</code> | Reload a submodule even if the currently loaded version is identical to the version on file. If false it will not be reloaded if the version would not be changed due to a reload. |
| [cb] | <code>function</code> |  | Callback to fire once the operation is complete. Single parameter has array of strings of status of each module attempted to be reloaded. |


* [.reload([name], [opts], [cb])](#SMLoader+reload)
    * [~reloadSingle(name)](#SMLoader+reload..reloadSingle) ℗
    * [~done()](#SMLoader+reload..done) ℗

<a name="SMLoader+reload..reloadSingle"></a>

#### reload~reloadSingle(name) ℗
Actually trigger the reload process for a single submodule.

**Kind**: inner method of [<code>reload</code>](#SMLoader+reload)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | The submodule name to reload. |

<a name="SMLoader+reload..done"></a>

#### reload~done() ℗
Called when a submodule's reload process is completed. Fires main
callback once all submodules reloads have been completed.

**Kind**: inner method of [<code>reload</code>](#SMLoader+reload)  
**Access**: private  
<a name="MainModule+import"></a>

### smLoader.import(data)
Imports data from a previous instance of this class in order to maintain
references to other objects and classes across reloads.

**Kind**: instance method of [<code>SMLoader</code>](#SMLoader)  
**Overrides**: [<code>import</code>](#MainModule+import)  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| data | [<code>ModuleData</code>](#MainModule..ModuleData) | The data that was exported previously, or null if no data to import. |

<a name="MainModule+export"></a>

### smLoader.export() ⇒ [<code>ModuleData</code>](#MainModule..ModuleData)
Export data required to maintain the bot across reloading this module.
Expected to be returned directly to this.import once reloaded.

**Kind**: instance method of [<code>SMLoader</code>](#SMLoader)  
**Overrides**: [<code>export</code>](#MainModule+export)  
**Returns**: [<code>ModuleData</code>](#MainModule..ModuleData) - The data to be exported  
**Access**: public  
<a name="MainModule+terminate"></a>

### smLoader.terminate()
Signal that the bot is shutting down and will not be restarting
immediately. This is triggered on all shutdowns where all MainModules and
SubModules will be unloaded.

**Kind**: instance method of [<code>SMLoader</code>](#SMLoader)  
**Overrides**: [<code>terminate</code>](#MainModule+terminate)  
**Access**: public  
<a name="SubModule+initialize"></a>

### smLoader.initialize()
The function called at the end of begin() for further initialization
specific to the subModule. Must be defined before begin() is called.

**Kind**: instance method of [<code>SMLoader</code>](#SMLoader)  
**Overrides**: [<code>initialize</code>](#SubModule+initialize)  
**Access**: protected  
<a name="SubModule+begin"></a>

### smLoader.begin(Discord, client, command, common, bot)
Initialize this submodule.

**Kind**: instance method of [<code>SMLoader</code>](#SMLoader)  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| Discord | <code>Discord</code> | The Discord object for the API library. |
| client | <code>Discord~Client</code> | The client that represents this bot. |
| command | [<code>Command</code>](#Command) | The command instance in which to register command listeners. |
| common | [<code>Common</code>](#Common) | Class storing common functions. |
| bot | [<code>SpikeyBot</code>](#SpikeyBot) | The parent SpikeyBot instance. |

<a name="SubModule+end"></a>

### smLoader.end()
Trigger subModule to shutdown and get ready for process terminating.

**Kind**: instance method of [<code>SMLoader</code>](#SMLoader)  
**Access**: public  
<a name="SubModule+log"></a>

### smLoader.log(msg)
Log using common.log, but automatically set name.

**Kind**: instance method of [<code>SMLoader</code>](#SMLoader)  
**Access**: protected  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>string</code> | The message to log. |

<a name="SubModule+debug"></a>

### smLoader.debug(msg)
Log using common.logDebug, but automatically set name.

**Kind**: instance method of [<code>SMLoader</code>](#SMLoader)  
**Access**: protected  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>string</code> | The message to log. |

<a name="SubModule+warn"></a>

### smLoader.warn(msg)
Log using common.logWarning, but automatically set name.

**Kind**: instance method of [<code>SMLoader</code>](#SMLoader)  
**Access**: protected  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>string</code> | The message to log. |

<a name="SubModule+error"></a>

### smLoader.error(msg)
Log using common.error, but automatically set name.

**Kind**: instance method of [<code>SMLoader</code>](#SMLoader)  
**Access**: protected  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>string</code> | The message to log. |

<a name="SubModule+shutdown"></a>

### *smLoader.shutdown()*
Shutdown and disable this submodule. Removes all event listeners.

**Kind**: instance abstract method of [<code>SMLoader</code>](#SMLoader)  
**Overrides**: [<code>shutdown</code>](#SubModule+shutdown)  
**Access**: protected  
<a name="SubModule+save"></a>

### smLoader.save([opt])
Saves all data to files necessary for saving current state.

**Kind**: instance method of [<code>SMLoader</code>](#SMLoader)  
**Overrides**: [<code>save</code>](#SubModule+save)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [opt] | <code>string</code> | <code>&quot;&#x27;sync&#x27;&quot;</code> | Can be 'async', otherwise defaults to synchronous. |

<a name="SubModule+unloadable"></a>

### smLoader.unloadable() ⇒ <code>boolean</code>
Check if this module is in a state that is ready to be unloaded. If false
is returned, this module should not be unloaded and doing such may risk
putting the module into an uncontrollable state.

**Kind**: instance method of [<code>SMLoader</code>](#SMLoader)  
**Overrides**: [<code>unloadable</code>](#SubModule+unloadable)  
**Returns**: <code>boolean</code> - True if can be unloaded, false if cannot.  
**Access**: public  
<a name="SMLoader..toAssign"></a>

### SMLoader~toAssign : <code>Class</code> ℗
Properties to merge into other objects. `bot` is merged into self.bot,
`client` is merged into self.client.

**Kind**: inner property of [<code>SMLoader</code>](#SMLoader)  
**Access**: private  

* [~toAssign](#SMLoader..toAssign) : <code>Class</code> ℗
    * [.bot.getSubmoduleCommits()](#SMLoader..toAssign.bot.getSubmoduleCommits) ⇒ <code>Array.&lt;{name: string, commit: string}&gt;</code>
    * [.bot.getSubmodule(name)](#SMLoader..toAssign.bot.getSubmodule) ⇒ [<code>SubModule</code>](#SubModule)
    * [.client.reloadUpdatedSubModules()](#SMLoader..toAssign.client.reloadUpdatedSubModules)

<a name="SMLoader..toAssign.bot.getSubmoduleCommits"></a>

#### toAssign.bot.getSubmoduleCommits() ⇒ <code>Array.&lt;{name: string, commit: string}&gt;</code>
Get array of all submodule names and the commit they were last loaded from.

**Kind**: static method of [<code>toAssign</code>](#SMLoader..toAssign)  
**Access**: public  
<a name="SMLoader..toAssign.bot.getSubmodule"></a>

#### toAssign.bot.getSubmodule(name) ⇒ [<code>SubModule</code>](#SubModule)
Get a reference to a submodule with the given name.

**Kind**: static method of [<code>toAssign</code>](#SMLoader..toAssign)  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | The name of the submodule. |

<a name="SMLoader..toAssign.client.reloadUpdatedSubModules"></a>

#### toAssign.client.reloadUpdatedSubModules()
Check current loaded submodule commit to last modified commit, and reload
if the file has changed.

**Kind**: static method of [<code>toAssign</code>](#SMLoader..toAssign)  
**Access**: public  
<a name="SMLoader..subModuleNames"></a>

### SMLoader~subModuleNames : <code>Array.&lt;string&gt;</code> ℗
The list of all submodule names currently loaded.

**Kind**: inner property of [<code>SMLoader</code>](#SMLoader)  
**Access**: private  
<a name="SMLoader..goalSubModuleNames"></a>

### SMLoader~goalSubModuleNames : <code>null</code> \| <code>Array.&lt;string&gt;</code> ℗
The list of all submodules that we are intended to have loaded currently.
This should reflect the file at [SMloader~smListFilename](SMloader~smListFilename). Null means
the data is not available, and no action should be taken.

**Kind**: inner property of [<code>SMLoader</code>](#SMLoader)  
**Access**: private  
<a name="SMLoader..subModules"></a>

### SMLoader~subModules : [<code>Object.&lt;SubModule&gt;</code>](#SubModule) ℗
Instances of SubModules currently loaded mapped by their name.

**Kind**: inner property of [<code>SMLoader</code>](#SMLoader)  
**Access**: private  
<a name="SMLoader..unloadTimeouts"></a>

### SMLoader~unloadTimeouts : <code>Object.&lt;Timeout&gt;</code> ℗
Timeouts for retrying to unload submodules that are currently not in an
unloadable state. Mapped by name of submodule.

**Kind**: inner property of [<code>SMLoader</code>](#SMLoader)  
**Access**: private  
<a name="SMLoader..unloadCallbacks"></a>

### SMLoader~unloadCallbacks : <code>Object.&lt;Array.&lt;function()&gt;&gt;</code> ℗
Callbacks for when a scheduled module to unload, has been unloaded. Mapped
by name of subModule, then array of all callbacks.

**Kind**: inner property of [<code>SMLoader</code>](#SMLoader)  
**Access**: private  
<a name="SMLoader..smListFilename"></a>

### SMLoader~smListFilename : <code>string</code> ℗
The filename storing the list of all SubModules to load.

**Kind**: inner constant of [<code>SMLoader</code>](#SMLoader)  
**Access**: private  
**Defualt**:   
<a name="SMLoader..trustedIds"></a>

### SMLoader~trustedIds : <code>Array.&lt;string&gt;</code> ℗
Discord IDs that are allowed to reboot the bot.

**Kind**: inner constant of [<code>SMLoader</code>](#SMLoader)  
**Access**: private  
<a name="SMLoader..helpmessagereply"></a>

### SMLoader~helpmessagereply : <code>string</code> ℗
The message sent to the channel where the user asked for help.

**Kind**: inner constant of [<code>SMLoader</code>](#SMLoader)  
**Access**: private  
<a name="SMLoader..blockedmessage"></a>

### SMLoader~blockedmessage : <code>string</code> ℗
The message sent to the channel where the user asked to be DM'd, but we
were unable to deliver the DM.

**Kind**: inner constant of [<code>SMLoader</code>](#SMLoader)  
**Access**: private  
<a name="SMLoader..commandReload"></a>

### SMLoader~commandReload(msg) : <code>Command~commandHandler</code> ℗
Reload all sub modules by unloading then re-requiring.

**Kind**: inner method of [<code>SMLoader</code>](#SMLoader)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord~Message</code> | Message that triggered command. |

<a name="SMLoader..commandUnload"></a>

### SMLoader~commandUnload(msg) : <code>Command~commandHandler</code> ℗
Unload specific sub modules.

**Kind**: inner method of [<code>SMLoader</code>](#SMLoader)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord~Message</code> | Message that triggered command. |

<a name="SMLoader..commandLoad"></a>

### SMLoader~commandLoad(msg) : <code>Command~commandHandler</code> ℗
Load specific sub modules.

**Kind**: inner method of [<code>SMLoader</code>](#SMLoader)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord~Message</code> | Message that triggered command. |

<a name="SMLoader..commandHelp"></a>

### SMLoader~commandHelp(msg) : <code>Command~commandHandler</code> ℗
Send help message to user who requested it.

**Kind**: inner method of [<code>SMLoader</code>](#SMLoader)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord~Message</code> | Message that triggered command. |

<a name="SMLoader..commandHelp..send"></a>

#### commandHelp~send(help) ℗
Send the help message.

**Kind**: inner method of [<code>commandHelp</code>](#SMLoader..commandHelp)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| help | <code>Discord~MessageEmbed</code> | THe message to send. |

<a name="SpikeyBot"></a>

## SpikeyBot
Main class that manages the bot.

**Kind**: global class  

* [SpikeyBot](#SpikeyBot)
    * _instance_
        * [.getBotName()](#SpikeyBot+getBotName) ⇒ <code>string</code>
        * [.getFullBotName()](#SpikeyBot+getFullBotName) ⇒ <code>string</code>
        * [.changePrefix(gId, newPrefix)](#SpikeyBot+changePrefix)
        * [.getPrefix(id)](#SpikeyBot+getPrefix) ⇒ <code>string</code>
    * _inner_
        * [~testMode](#SpikeyBot..testMode) : <code>boolean</code> ℗
        * [~testInstance](#SpikeyBot..testInstance) : <code>boolean</code> ℗
        * [~command](#SpikeyBot..command) : [<code>Command</code>](#Command) ℗
        * [~smLoader](#SpikeyBot..smLoader) : [<code>SMLoader</code>](#SMLoader) ℗
        * [~mainModuleNames](#SpikeyBot..mainModuleNames) : <code>Array.&lt;string&gt;</code> ℗
        * [~setDev](#SpikeyBot..setDev) : <code>boolean</code> ℗
        * [~isBackup](#SpikeyBot..isBackup) : <code>boolean</code> ℗
        * [~minimal](#SpikeyBot..minimal) : <code>boolean</code> ℗
        * [~mainModules](#SpikeyBot..mainModules) : [<code>Array.&lt;MainModule&gt;</code>](#MainModule) ℗
        * [~disconnectReason](#SpikeyBot..disconnectReason) : <code>string</code> ℗
        * [~enableSharding](#SpikeyBot..enableSharding) : <code>boolean</code> ℗
        * [~numShards](#SpikeyBot..numShards) : <code>number</code> ℗
        * [~botName](#SpikeyBot..botName) : <code>string</code> ℗
        * [~initialized](#SpikeyBot..initialized) : <code>boolean</code> ℗
        * [~saveInterval](#SpikeyBot..saveInterval) : <code>Interval</code> ℗
        * [~guildPrefixes](#SpikeyBot..guildPrefixes) : <code>Object.&lt;string&gt;</code> ℗
        * [~version](#SpikeyBot..version) : <code>string</code> ℗
        * [~testChannel](#SpikeyBot..testChannel) : <code>string</code> ℗
        * [~commandFilename](#SpikeyBot..commandFilename) : <code>string</code> ℗
        * [~smLoaderFilename](#SpikeyBot..smLoaderFilename) : <code>string</code> ℗
        * [~mainModuleListFile](#SpikeyBot..mainModuleListFile) : <code>string</code> ℗
        * [~saveFrequency](#SpikeyBot..saveFrequency) : <code>number</code> ℗
        * [~trustedIds](#SpikeyBot..trustedIds) : <code>Array.&lt;string&gt;</code> ℗
        * [~guildPrefixFile](#SpikeyBot..guildPrefixFile) : <code>string</code> ℗
        * [~guildCustomPrefixFile](#SpikeyBot..guildCustomPrefixFile) : <code>string</code> ℗
        * [~isCmd(msg, cmd)](#SpikeyBot..isCmd) ⇒ <code>boolean</code> ℗
        * [~updateGame(game, [type])](#SpikeyBot..updateGame) ℗
        * [~onReady()](#SpikeyBot..onReady) ℗
        * [~onDisconnect(event)](#SpikeyBot..onDisconnect) ℗
        * [~onReconnecting()](#SpikeyBot..onReconnecting) ℗
        * [~onError(err)](#SpikeyBot..onError) ℗
        * [~onWarn(info)](#SpikeyBot..onWarn) ℗
        * [~onDebug(info)](#SpikeyBot..onDebug) ℗
        * [~onMessage(msg)](#SpikeyBot..onMessage) ℗
        * [~commandUpdateGame(msg)](#SpikeyBot..commandUpdateGame) : [<code>commandHandler</code>](#commandHandler) ℗
        * [~commandChangePrefix(msg)](#SpikeyBot..commandChangePrefix) : [<code>commandHandler</code>](#commandHandler) ℗
        * [~commandReboot(msg, [silent])](#SpikeyBot..commandReboot) : [<code>commandHandler</code>](#commandHandler) ℗
        * [~commandReload(msg)](#SpikeyBot..commandReload) : [<code>commandHandler</code>](#commandHandler) ℗
        * [~reloadMainModules([toReload], [reloaded], [schedule])](#SpikeyBot..reloadMainModules) ⇒ <code>boolean</code> ℗
        * [~saveAll()](#SpikeyBot..saveAll) ℗
        * [~commandSaveAll(msg)](#SpikeyBot..commandSaveAll) : [<code>commandHandler</code>](#commandHandler) ℗
        * [~commandUpdate(msg)](#SpikeyBot..commandUpdate) : [<code>commandHandler</code>](#commandHandler) ℗
        * [~loadGuildPrefixes(guilds)](#SpikeyBot..loadGuildPrefixes) ℗

<a name="SpikeyBot+getBotName"></a>

### spikeyBot.getBotName() ⇒ <code>string</code>
Getter for the bot's name. If name is null, it is most likely because there
is no custom name and common.isRelease should be used instead.

**Kind**: instance method of [<code>SpikeyBot</code>](#SpikeyBot)  
**Returns**: <code>string</code> - The bot's name or null if it has not been defined yet or
there is no custom name.  
**Access**: public  
**See**: [botName](#SpikeyBot..botName)  
<a name="SpikeyBot+getFullBotName"></a>

### spikeyBot.getFullBotName() ⇒ <code>string</code>
Getter for the bot's name. If botName is null, this will give either
`release` or `dev`.

**Kind**: instance method of [<code>SpikeyBot</code>](#SpikeyBot)  
**Returns**: <code>string</code> - The bot's name.  
**Access**: public  
**See**: [botName](#SpikeyBot..botName)  
<a name="SpikeyBot+changePrefix"></a>

### spikeyBot.changePrefix(gId, newPrefix)
Change the command prefix for the given guild.

**Kind**: instance method of [<code>SpikeyBot</code>](#SpikeyBot)  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| gId | <code>string</code> | The guild id of which to change the command prefix. |
| newPrefix | <code>string</code> | The new prefix to set. |

<a name="SpikeyBot+getPrefix"></a>

### spikeyBot.getPrefix(id) ⇒ <code>string</code>
Get this guild's custom prefix. Returns the default prefix otherwise.

**Kind**: instance method of [<code>SpikeyBot</code>](#SpikeyBot)  
**Returns**: <code>string</code> - The prefix for all commands in the given guild.  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>Discord~Guild</code> \| <code>string</code> \| <code>number</code> | The guild id or guild to lookup. |

<a name="SpikeyBot..testMode"></a>

### SpikeyBot~testMode : <code>boolean</code> ℗
Is the bot currently responding as a unit test.

**Kind**: inner property of [<code>SpikeyBot</code>](#SpikeyBot)  
**Access**: private  
<a name="SpikeyBot..testInstance"></a>

### SpikeyBot~testInstance : <code>boolean</code> ℗
Is the bot started with the intent of solely running a unit test. Reduces
messages sent that are unnecessary.

**Kind**: inner property of [<code>SpikeyBot</code>](#SpikeyBot)  
**Access**: private  
<a name="SpikeyBot..command"></a>

### SpikeyBot~command : [<code>Command</code>](#Command) ℗
The current instance of Command.

**Kind**: inner property of [<code>SpikeyBot</code>](#SpikeyBot)  
**Access**: private  
<a name="SpikeyBot..smLoader"></a>

### SpikeyBot~smLoader : [<code>SMLoader</code>](#SMLoader) ℗
The current instance of SMLoader.

**Kind**: inner property of [<code>SpikeyBot</code>](#SpikeyBot)  
**Access**: private  
<a name="SpikeyBot..mainModuleNames"></a>

### SpikeyBot~mainModuleNames : <code>Array.&lt;string&gt;</code> ℗
The list of all mainModules to load. Always includes {@link
SpikeyBot~commandFilename} and [SpikeyBot~smListFilename](SpikeyBot~smListFilename). Additional
mainModules can be loaded from [mainModuleListFile](#SpikeyBot..mainModuleListFile).

**Kind**: inner property of [<code>SpikeyBot</code>](#SpikeyBot)  
**Access**: private  
<a name="SpikeyBot..setDev"></a>

### SpikeyBot~setDev : <code>boolean</code> ℗
Is this bot running in development mode.

**Kind**: inner property of [<code>SpikeyBot</code>](#SpikeyBot)  
**Access**: private  
<a name="SpikeyBot..isBackup"></a>

### SpikeyBot~isBackup : <code>boolean</code> ℗
Is this bot managing backup status monitoring.

**Kind**: inner property of [<code>SpikeyBot</code>](#SpikeyBot)  
**Access**: private  
<a name="SpikeyBot..minimal"></a>

### SpikeyBot~minimal : <code>boolean</code> ℗
Should this bot only load minimal features as to not overlap with multiple
instances.

**Kind**: inner property of [<code>SpikeyBot</code>](#SpikeyBot)  
**Access**: private  
<a name="SpikeyBot..mainModules"></a>

### SpikeyBot~mainModules : [<code>Array.&lt;MainModule&gt;</code>](#MainModule) ℗
Instances of MainModules currently loaded.

**Kind**: inner property of [<code>SpikeyBot</code>](#SpikeyBot)  
**Access**: private  
<a name="SpikeyBot..disconnectReason"></a>

### SpikeyBot~disconnectReason : <code>string</code> ℗
Reason the bot was disconnected from Discord's servers.

**Kind**: inner property of [<code>SpikeyBot</code>](#SpikeyBot)  
**Default**: <code>null</code>  
**Access**: private  
<a name="SpikeyBot..enableSharding"></a>

### SpikeyBot~enableSharding : <code>boolean</code> ℗
Whether or not to spawn the bot as multiple shards. Enabled with `--shards`
cli argument.

**Kind**: inner property of [<code>SpikeyBot</code>](#SpikeyBot)  
**Default**: <code>false</code>  
**Access**: private  
<a name="SpikeyBot..numShards"></a>

### SpikeyBot~numShards : <code>number</code> ℗
The number of shards to use if sharding is enabled. 0 to let Discord
decide. Set from `--shards=#` cli argument.

**Kind**: inner property of [<code>SpikeyBot</code>](#SpikeyBot)  
**Default**: <code>0</code>  
**Access**: private  
<a name="SpikeyBot..botName"></a>

### SpikeyBot~botName : <code>string</code> ℗
The name of the client secret to use. Defaults to release either release or
dev depending on the --dev flag.

**Kind**: inner property of [<code>SpikeyBot</code>](#SpikeyBot)  
**Default**: <code>null</code>  
**Access**: private  
<a name="SpikeyBot..initialized"></a>

### SpikeyBot~initialized : <code>boolean</code> ℗
Has the bot been initialized already.

**Kind**: inner property of [<code>SpikeyBot</code>](#SpikeyBot)  
**Default**: <code>false</code>  
**Access**: private  
<a name="SpikeyBot..saveInterval"></a>

### SpikeyBot~saveInterval : <code>Interval</code> ℗
The Interval in which we will save and purge data on all mainmodules.
Begins after onReady.

**Kind**: inner property of [<code>SpikeyBot</code>](#SpikeyBot)  
**Access**: private  
**See**

- [SpikeyBot~onReady()](SpikeyBot~onReady())
- [saveFrequency](#SpikeyBot..saveFrequency)

<a name="SpikeyBot..guildPrefixes"></a>

### SpikeyBot~guildPrefixes : <code>Object.&lt;string&gt;</code> ℗
Cache of all loaded guild's command prefixes. Populated asyncronously after
client ready event.

**Kind**: inner property of [<code>SpikeyBot</code>](#SpikeyBot)  
**Access**: private  
<a name="SpikeyBot..version"></a>

### SpikeyBot~version : <code>string</code> ℗
The current bot version parsed from package.json.

**Kind**: inner constant of [<code>SpikeyBot</code>](#SpikeyBot)  
**Access**: private  
<a name="SpikeyBot..testChannel"></a>

### SpikeyBot~testChannel : <code>string</code> ℗
The channel id for the channel to reserve for only unit testing in.

**Kind**: inner constant of [<code>SpikeyBot</code>](#SpikeyBot)  
**Default**: <code>&quot;439642818084995074&quot;</code>  
**Access**: private  
<a name="SpikeyBot..commandFilename"></a>

### SpikeyBot~commandFilename : <code>string</code> ℗
The filename of the Command mainModule.

**Kind**: inner constant of [<code>SpikeyBot</code>](#SpikeyBot)  
**Default**: <code>&quot;./commands.js&quot;</code>  
**Access**: private  
<a name="SpikeyBot..smLoaderFilename"></a>

### SpikeyBot~smLoaderFilename : <code>string</code> ℗
The filename of the SMLoader mainModule.

**Kind**: inner constant of [<code>SpikeyBot</code>](#SpikeyBot)  
**Default**: <code>&quot;./smLoader.js&quot;</code>  
**Access**: private  
<a name="SpikeyBot..mainModuleListFile"></a>

### SpikeyBot~mainModuleListFile : <code>string</code> ℗
Filename of which to load additional MainModule names. The file must be a
valid JSON array of strings.

**Kind**: inner constant of [<code>SpikeyBot</code>](#SpikeyBot)  
**Default**: <code>&quot;./mainModules.json&quot;</code>  
**Access**: private  
<a name="SpikeyBot..saveFrequency"></a>

### SpikeyBot~saveFrequency : <code>number</code> ℗
The frequency at which saveInterval will run.

**Kind**: inner constant of [<code>SpikeyBot</code>](#SpikeyBot)  
**Default**: <code>30 Minutes</code>  
**Access**: private  
**See**: [saveInterval](#SpikeyBot..saveInterval)  
<a name="SpikeyBot..trustedIds"></a>

### SpikeyBot~trustedIds : <code>Array.&lt;string&gt;</code> ℗
Discord IDs that are allowed to reboot the bot.

**Kind**: inner constant of [<code>SpikeyBot</code>](#SpikeyBot)  
**Access**: private  
<a name="SpikeyBot..guildPrefixFile"></a>

### SpikeyBot~guildPrefixFile : <code>string</code> ℗
The path in the guild's subdirectory where we store custom prefixes.

**Kind**: inner constant of [<code>SpikeyBot</code>](#SpikeyBot)  
**Access**: private  
**Defaut**:   
<a name="SpikeyBot..guildCustomPrefixFile"></a>

### SpikeyBot~guildCustomPrefixFile : <code>string</code> ℗
The path in the guild's subdirectory where we store custom prefixes for
bots with custom names.

**Kind**: inner constant of [<code>SpikeyBot</code>](#SpikeyBot)  
**Access**: private  
**Defaut**:   
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

### SpikeyBot~updateGame(game, [type]) ℗
Changes the bot's status message.

**Kind**: inner method of [<code>SpikeyBot</code>](#SpikeyBot)  
**Access**: private  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| game | <code>string</code> |  | New message to set game to. |
| [type] | <code>string</code> | <code>&quot;&#x27;WATCHING&#x27;&quot;</code> | The type of activity. |

<a name="SpikeyBot..onReady"></a>

### SpikeyBot~onReady() ℗
The bot has become ready.

**Kind**: inner method of [<code>SpikeyBot</code>](#SpikeyBot)  
**Access**: private  
<a name="SpikeyBot..onDisconnect"></a>

### SpikeyBot~onDisconnect(event) ℗
The bot has disconnected from Discord and will not be attempting to
reconnect.

**Kind**: inner method of [<code>SpikeyBot</code>](#SpikeyBot)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| event | <code>CloseEvent</code> | The websocket close event. |

<a name="SpikeyBot..onReconnecting"></a>

### SpikeyBot~onReconnecting() ℗
The bot has disconnected from Discord, and is reconnecting.

**Kind**: inner method of [<code>SpikeyBot</code>](#SpikeyBot)  
**Access**: private  
<a name="SpikeyBot..onError"></a>

### SpikeyBot~onError(err) ℗
An error occurred with our websocket connection to Discord.

**Kind**: inner method of [<code>SpikeyBot</code>](#SpikeyBot)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| err | <code>Discord~Error</code> | The websocket error object. |

<a name="SpikeyBot..onWarn"></a>

### SpikeyBot~onWarn(info) ℗
A general warning was produced.

**Kind**: inner method of [<code>SpikeyBot</code>](#SpikeyBot)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| info | <code>string</code> | The information. |

<a name="SpikeyBot..onDebug"></a>

### SpikeyBot~onDebug(info) ℗
A general debug message was produced.

**Kind**: inner method of [<code>SpikeyBot</code>](#SpikeyBot)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| info | <code>string</code> | The information. |

<a name="SpikeyBot..onMessage"></a>

### SpikeyBot~onMessage(msg) ℗
Handle a message sent.

**Kind**: inner method of [<code>SpikeyBot</code>](#SpikeyBot)  
**Emits**: <code>event:Command</code>  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord~Message</code> | Message that was sent in Discord. |

<a name="SpikeyBot..commandUpdateGame"></a>

### SpikeyBot~commandUpdateGame(msg) : [<code>commandHandler</code>](#commandHandler) ℗
Change current status message.

**Kind**: inner method of [<code>SpikeyBot</code>](#SpikeyBot)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord~Message</code> | Message that triggered command. |

<a name="SpikeyBot..commandChangePrefix"></a>

### SpikeyBot~commandChangePrefix(msg) : [<code>commandHandler</code>](#commandHandler) ℗
Change the custom prefix for the given guild.

**Kind**: inner method of [<code>SpikeyBot</code>](#SpikeyBot)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord~Message</code> | Message that triggered command. |

<a name="SpikeyBot..commandReboot"></a>

### SpikeyBot~commandReboot(msg, [silent]) : [<code>commandHandler</code>](#commandHandler) ℗
Trigger a reboot of the bot. Actually just gracefully shuts down, and
expects to be immediately restarted.

**Kind**: inner method of [<code>SpikeyBot</code>](#SpikeyBot)  
**Access**: private  
**Todo:**: Support scheduled reload across multiple shards. Currently the bot
waits for the shard at which the command was sent to be ready for reboot
instead of all shard deciding on their own when they're ready to reboot.
This will also need to check that we are obeying Discord's rebooting rate
limits to help reduce downtime.  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| msg | <code>Discord~Message</code> |  | Message that triggered command. |
| [silent] | <code>boolean</code> | <code>false</code> | Suppress reboot scheduling messages. |

<a name="SpikeyBot..commandReload"></a>

### SpikeyBot~commandReload(msg) : [<code>commandHandler</code>](#commandHandler) ℗
Reload all mainmodules by unloading then re-requiring.

**Kind**: inner method of [<code>SpikeyBot</code>](#SpikeyBot)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord~Message</code> | Message that triggered command. |

<a name="SpikeyBot..reloadMainModules"></a>

### SpikeyBot~reloadMainModules([toReload], [reloaded], [schedule]) ⇒ <code>boolean</code> ℗
Reloads mainmodules from file. Reloads all modules if `toReload` is not
specified. `reloaded` will contain the list of messages describing which
mainmodules were reloaded, or not.

**Kind**: inner method of [<code>SpikeyBot</code>](#SpikeyBot)  
**Returns**: <code>boolean</code> - True if something failed and not all mainmodules were
reloaded.  
**Access**: private  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [toReload] | <code>string</code> \| <code>Array.&lt;string&gt;</code> |  | Specify mainmodules to reload, or null to reload all mainmodules. |
| [reloaded] | <code>Array.&lt;string&gt;</code> |  | Reference to a variable to store output status information about outcomes of attempting to reload mainmodules. |
| [schedule] | <code>boolean</code> | <code>true</code> | Automatically re-schedule reload for mainmodules if they are in an unloadable state. |

<a name="SpikeyBot..saveAll"></a>

### SpikeyBot~saveAll() ℗
Trigger all mainmodules to save their data.

**Kind**: inner method of [<code>SpikeyBot</code>](#SpikeyBot)  
**Access**: private  
<a name="SpikeyBot..commandSaveAll"></a>

### SpikeyBot~commandSaveAll(msg) : [<code>commandHandler</code>](#commandHandler) ℗
Trigger all mainModules to save their data.

**Kind**: inner method of [<code>SpikeyBot</code>](#SpikeyBot)  
**Access**: private  
**See**: [SpikeyBot~saveAll()](SpikeyBot~saveAll())  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord~Message</code> | Message that triggered command. |

<a name="SpikeyBot..commandUpdate"></a>

### SpikeyBot~commandUpdate(msg) : [<code>commandHandler</code>](#commandHandler) ℗
Trigger fetching the latest version of the bot from git, then tell all
shards to reload the changes.

**Kind**: inner method of [<code>SpikeyBot</code>](#SpikeyBot)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord~Message</code> | Message that triggered command. |

<a name="SpikeyBot..loadGuildPrefixes"></a>

### SpikeyBot~loadGuildPrefixes(guilds) ℗
Load prefixes from file for the given guilds asynchronously.

**Kind**: inner method of [<code>SpikeyBot</code>](#SpikeyBot)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| guilds | <code>Array.&lt;Discord~Guild&gt;</code> | Array of guilds to fetch the custom prefixes of. |

<a name="Spotify"></a>

## Spotify ⇐ [<code>SubModule</code>](#SubModule)
Attempts to play what a user is playing on Spotify, to a voice
channel.

**Kind**: global class  
**Extends**: [<code>SubModule</code>](#SubModule)  

* [Spotify](#Spotify) ⇐ [<code>SubModule</code>](#SubModule)
    * _instance_
        * [.helpMessage](#SubModule+helpMessage) : <code>string</code> \| <code>Discord~MessageEmbed</code>
        * *[.postPrefix](#SubModule+postPrefix) : <code>string</code>*
        * [.Discord](#SubModule+Discord) : <code>Discord</code>
        * [.client](#SubModule+client) : <code>Discord~Client</code>
        * [.command](#SubModule+command) : [<code>Command</code>](#Command)
        * [.common](#SubModule+common) : [<code>Common</code>](#Common)
        * [.bot](#SubModule+bot) : [<code>SpikeyBot</code>](#SpikeyBot)
        * *[.myName](#SubModule+myName) : <code>string</code>*
        * [.initialized](#SubModule+initialized) : <code>boolean</code>
        * [.commit](#SubModule+commit) : <code>string</code>
        * [.loadTime](#SubModule+loadTime) : <code>number</code>
        * [.initialize()](#SubModule+initialize)
        * [.begin(Discord, client, command, common, bot)](#SubModule+begin)
        * [.end()](#SubModule+end)
        * [.log(msg)](#SubModule+log)
        * [.debug(msg)](#SubModule+debug)
        * [.warn(msg)](#SubModule+warn)
        * [.error(msg)](#SubModule+error)
        * [.shutdown()](#SubModule+shutdown)
        * *[.save([opt])](#SubModule+save)*
        * [.unloadable()](#SubModule+unloadable) ⇒ <code>boolean</code>
    * _inner_
        * [~following](#Spotify..following) : <code>Object</code> ℗
        * [~apiRequest](#Spotify..apiRequest) : <code>Object</code> ℗
        * [~commandSpotify(msg)](#Spotify..commandSpotify) : [<code>commandHandler</code>](#commandHandler) ℗
        * [~getCurrentSong(userId, cb)](#Spotify..getCurrentSong) ℗
        * [~updateFollowingState(msg, userId, [songInfo], [start])](#Spotify..updateFollowingState) ℗
            * [~makeTimeout()](#Spotify..updateFollowingState..makeTimeout) ℗
        * [~updateDuration(msg, userId)](#Spotify..updateDuration) ℗
        * [~startMusic(msg, song)](#Spotify..startMusic) ℗
        * [~checkMusic()](#Spotify..checkMusic) ℗
        * [~endFollow(msg)](#Spotify..endFollow) ℗

<a name="SubModule+helpMessage"></a>

### spotify.helpMessage : <code>string</code> \| <code>Discord~MessageEmbed</code>
The help message to show the user in the main help message.

**Kind**: instance property of [<code>Spotify</code>](#Spotify)  
<a name="SubModule+postPrefix"></a>

### *spotify.postPrefix : <code>string</code>*
The postfix for the global prefix for this subModule. Must be defined
before begin(), otherwise it is ignored.

**Kind**: instance abstract property of [<code>Spotify</code>](#Spotify)  
**Default**: <code>&quot;&quot;</code>  
<a name="SubModule+Discord"></a>

### spotify.Discord : <code>Discord</code>
The current Discord object instance of the bot.

**Kind**: instance property of [<code>Spotify</code>](#Spotify)  
<a name="SubModule+client"></a>

### spotify.client : <code>Discord~Client</code>
The current bot client.

**Kind**: instance property of [<code>Spotify</code>](#Spotify)  
<a name="SubModule+command"></a>

### spotify.command : [<code>Command</code>](#Command)
The command object for registering command listeners.

**Kind**: instance property of [<code>Spotify</code>](#Spotify)  
<a name="SubModule+common"></a>

### spotify.common : [<code>Common</code>](#Common)
The common object.

**Kind**: instance property of [<code>Spotify</code>](#Spotify)  
<a name="SubModule+bot"></a>

### spotify.bot : [<code>SpikeyBot</code>](#SpikeyBot)
The parent SpikeyBot instance.

**Kind**: instance property of [<code>Spotify</code>](#Spotify)  
<a name="SubModule+myName"></a>

### *spotify.myName : <code>string</code>*
The name of this submodule. Used for differentiating in the log. Should be
defined before begin().

**Kind**: instance abstract property of [<code>Spotify</code>](#Spotify)  
**Overrides**: [<code>myName</code>](#SubModule+myName)  
**Access**: protected  
<a name="SubModule+initialized"></a>

### spotify.initialized : <code>boolean</code>
Has this subModule been initialized yet (Has begin() been called).

**Kind**: instance property of [<code>Spotify</code>](#Spotify)  
**Default**: <code>false</code>  
**Access**: protected  
**Read only**: true  
<a name="SubModule+commit"></a>

### spotify.commit : <code>string</code>
The commit at HEAD at the time this module was loaded. Essentially the
version of this submodule.

**Kind**: instance constant of [<code>Spotify</code>](#Spotify)  
**Access**: public  
<a name="SubModule+loadTime"></a>

### spotify.loadTime : <code>number</code>
The time at which this madule was loaded for use in checking if the module
needs to be reloaded because the file has been modified since loading.

**Kind**: instance constant of [<code>Spotify</code>](#Spotify)  
**Access**: public  
<a name="SubModule+initialize"></a>

### spotify.initialize()
The function called at the end of begin() for further initialization
specific to the subModule. Must be defined before begin() is called.

**Kind**: instance method of [<code>Spotify</code>](#Spotify)  
**Overrides**: [<code>initialize</code>](#SubModule+initialize)  
**Access**: protected  
<a name="SubModule+begin"></a>

### spotify.begin(Discord, client, command, common, bot)
Initialize this submodule.

**Kind**: instance method of [<code>Spotify</code>](#Spotify)  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| Discord | <code>Discord</code> | The Discord object for the API library. |
| client | <code>Discord~Client</code> | The client that represents this bot. |
| command | [<code>Command</code>](#Command) | The command instance in which to register command listeners. |
| common | [<code>Common</code>](#Common) | Class storing common functions. |
| bot | [<code>SpikeyBot</code>](#SpikeyBot) | The parent SpikeyBot instance. |

<a name="SubModule+end"></a>

### spotify.end()
Trigger subModule to shutdown and get ready for process terminating.

**Kind**: instance method of [<code>Spotify</code>](#Spotify)  
**Access**: public  
<a name="SubModule+log"></a>

### spotify.log(msg)
Log using common.log, but automatically set name.

**Kind**: instance method of [<code>Spotify</code>](#Spotify)  
**Access**: protected  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>string</code> | The message to log. |

<a name="SubModule+debug"></a>

### spotify.debug(msg)
Log using common.logDebug, but automatically set name.

**Kind**: instance method of [<code>Spotify</code>](#Spotify)  
**Access**: protected  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>string</code> | The message to log. |

<a name="SubModule+warn"></a>

### spotify.warn(msg)
Log using common.logWarning, but automatically set name.

**Kind**: instance method of [<code>Spotify</code>](#Spotify)  
**Access**: protected  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>string</code> | The message to log. |

<a name="SubModule+error"></a>

### spotify.error(msg)
Log using common.error, but automatically set name.

**Kind**: instance method of [<code>Spotify</code>](#Spotify)  
**Access**: protected  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>string</code> | The message to log. |

<a name="SubModule+shutdown"></a>

### spotify.shutdown()
Shutdown and disable this submodule. Removes all event listeners.

**Kind**: instance method of [<code>Spotify</code>](#Spotify)  
**Overrides**: [<code>shutdown</code>](#SubModule+shutdown)  
**Access**: protected  
<a name="SubModule+save"></a>

### *spotify.save([opt])*
Saves all data to files necessary for saving current state.

**Kind**: instance abstract method of [<code>Spotify</code>](#Spotify)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [opt] | <code>string</code> | <code>&quot;&#x27;sync&#x27;&quot;</code> | Can be 'async', otherwise defaults to synchronous. |

<a name="SubModule+unloadable"></a>

### spotify.unloadable() ⇒ <code>boolean</code>
Check if this module is in a state that is ready to be unloaded. If false
is returned, this module should not be unloaded and doing such may risk
putting the module into an uncontrollable state.

**Kind**: instance method of [<code>Spotify</code>](#Spotify)  
**Overrides**: [<code>unloadable</code>](#SubModule+unloadable)  
**Returns**: <code>boolean</code> - True if can be unloaded, false if cannot.  
**Access**: public  
<a name="Spotify..following"></a>

### Spotify~following : <code>Object</code> ℗
The current users we are monitoring the spotify status of, and some related
information. Mapped by guild id.

**Kind**: inner property of [<code>Spotify</code>](#Spotify)  
**Access**: private  
<a name="Spotify..apiRequest"></a>

### Spotify~apiRequest : <code>Object</code> ℗
The request to send to spotify to fetch the currently playing information
for a user.

**Kind**: inner constant of [<code>Spotify</code>](#Spotify)  
**Default**: <code>{&quot;protocol&quot;:&quot;https:&quot;,&quot;host&quot;:&quot;api.spotify.com&quot;,&quot;path&quot;:&quot;/v1/me/player/currently-playing&quot;,&quot;method&quot;:&quot;GET&quot;}</code>  
**Access**: private  
<a name="Spotify..commandSpotify"></a>

### Spotify~commandSpotify(msg) : [<code>commandHandler</code>](#commandHandler) ℗
Lookup what a user is listening to on Spotify, then attempt to play the
song in the requester's voice channel.

**Kind**: inner method of [<code>Spotify</code>](#Spotify)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord~Message</code> | The message that triggered command. |

<a name="Spotify..getCurrentSong"></a>

### Spotify~getCurrentSong(userId, cb) ℗
Fetch the current playing song on spotify for the given discord user id.

**Kind**: inner method of [<code>Spotify</code>](#Spotify)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| userId | <code>string</code> \| <code>number</code> | The Discord user id to lookup. |
| cb | <code>Fucntion</code> | Callback with err, and data parameters. |

<a name="Spotify..updateFollowingState"></a>

### Spotify~updateFollowingState(msg, userId, [songInfo], [start]) ℗
Check on the user's follow state and update the playing status to match.

**Kind**: inner method of [<code>Spotify</code>](#Spotify)  
**Access**: private  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| msg | <code>Discord~Message</code> |  | The message to use as context. |
| userId | <code>string</code> \| <code>number</code> |  | The discord user id that we are following. |
| [songInfo] | <code>Object</code> |  | If song info is provided, this will not be fetched first. If it is not, the information will be fetched from Spotify first. |
| [start] | <code>boolean</code> | <code>false</code> | Should we setup the player with our settings because this is the first run? |

<a name="Spotify..updateFollowingState..makeTimeout"></a>

#### updateFollowingState~makeTimeout() ℗
Start playing the music, and create a timeout to check the status, or for
the next song.

**Kind**: inner method of [<code>updateFollowingState</code>](#Spotify..updateFollowingState)  
**Access**: private  
<a name="Spotify..updateDuration"></a>

### Spotify~updateDuration(msg, userId) ℗
Fetch the song's length from music because Spotify was unable to provide it
for us.

**Kind**: inner method of [<code>Spotify</code>](#Spotify)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord~Message</code> | The context. |
| userId | <code>string</code> \| <code>number</code> | The user id we are following. |

<a name="Spotify..startMusic"></a>

### Spotify~startMusic(msg, song) ℗
Attempt to start playing the given song into a voice channel.

**Kind**: inner method of [<code>Spotify</code>](#Spotify)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord~Message</code> | Message that caused this to happen, and to pass into [Command](#Command) as context. |
| song | <code>Object</code> | The current song information. Name is song name, progress is progress into the song in milliseconds. |

<a name="Spotify..checkMusic"></a>

### Spotify~checkMusic() ℗
Update current reference to music submodule.

**Kind**: inner method of [<code>Spotify</code>](#Spotify)  
**Access**: private  
<a name="Spotify..endFollow"></a>

### Spotify~endFollow(msg) ℗
Cleanup and delete data in order to stop following user.

**Kind**: inner method of [<code>Spotify</code>](#Spotify)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord~Message</code> | THe context to clear. |

<a name="SubModule"></a>

## SubModule
Base class for all Sub-Modules.

**Kind**: global class  

* [SubModule](#SubModule)
    * _instance_
        * [.helpMessage](#SubModule+helpMessage) : <code>string</code> \| <code>Discord~MessageEmbed</code>
        * *[.postPrefix](#SubModule+postPrefix) : <code>string</code>*
        * [.Discord](#SubModule+Discord) : <code>Discord</code>
        * [.client](#SubModule+client) : <code>Discord~Client</code>
        * [.command](#SubModule+command) : [<code>Command</code>](#Command)
        * [.common](#SubModule+common) : [<code>Common</code>](#Common)
        * [.bot](#SubModule+bot) : [<code>SpikeyBot</code>](#SpikeyBot)
        * *[.myName](#SubModule+myName) : <code>string</code>*
        * [.initialized](#SubModule+initialized) : <code>boolean</code>
        * [.commit](#SubModule+commit) : <code>string</code>
        * [.loadTime](#SubModule+loadTime) : <code>number</code>
        * *[.initialize()](#SubModule+initialize)*
        * [.begin(Discord, client, command, common, bot)](#SubModule+begin)
        * [.end()](#SubModule+end)
        * [.log(msg)](#SubModule+log)
        * [.debug(msg)](#SubModule+debug)
        * [.warn(msg)](#SubModule+warn)
        * [.error(msg)](#SubModule+error)
        * *[.shutdown()](#SubModule+shutdown)*
        * *[.save([opt])](#SubModule+save)*
        * *[.unloadable()](#SubModule+unloadable) ⇒ <code>boolean</code>*
    * _static_
        * [.extend(child)](#SubModule.extend)

<a name="SubModule+helpMessage"></a>

### subModule.helpMessage : <code>string</code> \| <code>Discord~MessageEmbed</code>
The help message to show the user in the main help message.

**Kind**: instance property of [<code>SubModule</code>](#SubModule)  
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

### subModule.command : [<code>Command</code>](#Command)
The command object for registering command listeners.

**Kind**: instance property of [<code>SubModule</code>](#SubModule)  
<a name="SubModule+common"></a>

### subModule.common : [<code>Common</code>](#Common)
The common object.

**Kind**: instance property of [<code>SubModule</code>](#SubModule)  
<a name="SubModule+bot"></a>

### subModule.bot : [<code>SpikeyBot</code>](#SpikeyBot)
The parent SpikeyBot instance.

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
<a name="SubModule+commit"></a>

### subModule.commit : <code>string</code>
The commit at HEAD at the time this module was loaded. Essentially the
version of this submodule.

**Kind**: instance constant of [<code>SubModule</code>](#SubModule)  
**Access**: public  
<a name="SubModule+loadTime"></a>

### subModule.loadTime : <code>number</code>
The time at which this madule was loaded for use in checking if the module
needs to be reloaded because the file has been modified since loading.

**Kind**: instance constant of [<code>SubModule</code>](#SubModule)  
**Access**: public  
<a name="SubModule+initialize"></a>

### *subModule.initialize()*
The function called at the end of begin() for further initialization
specific to the subModule. Must be defined before begin() is called.

**Kind**: instance abstract method of [<code>SubModule</code>](#SubModule)  
**Access**: protected  
<a name="SubModule+begin"></a>

### subModule.begin(Discord, client, command, common, bot)
Initialize this submodule.

**Kind**: instance method of [<code>SubModule</code>](#SubModule)  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| Discord | <code>Discord</code> | The Discord object for the API library. |
| client | <code>Discord~Client</code> | The client that represents this bot. |
| command | [<code>Command</code>](#Command) | The command instance in which to register command listeners. |
| common | [<code>Common</code>](#Common) | Class storing common functions. |
| bot | [<code>SpikeyBot</code>](#SpikeyBot) | The parent SpikeyBot instance. |

<a name="SubModule+end"></a>

### subModule.end()
Trigger subModule to shutdown and get ready for process terminating.

**Kind**: instance method of [<code>SubModule</code>](#SubModule)  
**Access**: public  
<a name="SubModule+log"></a>

### subModule.log(msg)
Log using common.log, but automatically set name.

**Kind**: instance method of [<code>SubModule</code>](#SubModule)  
**Access**: protected  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>string</code> | The message to log. |

<a name="SubModule+debug"></a>

### subModule.debug(msg)
Log using common.logDebug, but automatically set name.

**Kind**: instance method of [<code>SubModule</code>](#SubModule)  
**Access**: protected  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>string</code> | The message to log. |

<a name="SubModule+warn"></a>

### subModule.warn(msg)
Log using common.logWarning, but automatically set name.

**Kind**: instance method of [<code>SubModule</code>](#SubModule)  
**Access**: protected  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>string</code> | The message to log. |

<a name="SubModule+error"></a>

### subModule.error(msg)
Log using common.error, but automatically set name.

**Kind**: instance method of [<code>SubModule</code>](#SubModule)  
**Access**: protected  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>string</code> | The message to log. |

<a name="SubModule+shutdown"></a>

### *subModule.shutdown()*
Shutdown and disable this submodule. Removes all event listeners.

**Kind**: instance abstract method of [<code>SubModule</code>](#SubModule)  
**Access**: protected  
<a name="SubModule+save"></a>

### *subModule.save([opt])*
Saves all data to files necessary for saving current state.

**Kind**: instance abstract method of [<code>SubModule</code>](#SubModule)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [opt] | <code>string</code> | <code>&quot;&#x27;sync&#x27;&quot;</code> | Can be 'async', otherwise defaults to synchronous. |

<a name="SubModule+unloadable"></a>

### *subModule.unloadable() ⇒ <code>boolean</code>*
Check if this module is in a state that is ready to be unloaded. If false
is returned, this module should not be unloaded and doing such may risk
putting the module into an uncontrollable state.

**Kind**: instance abstract method of [<code>SubModule</code>](#SubModule)  
**Returns**: <code>boolean</code> - True if can be unloaded, false if cannot.  
**Access**: public  
<a name="SubModule.extend"></a>

### SubModule.extend(child)
Extends SubModule as the base class of a child.

**Kind**: static method of [<code>SubModule</code>](#SubModule)  

| Param | Type | Description |
| --- | --- | --- |
| child | <code>Object</code> | The child class to extend. |

<a name="TicTacToe"></a>

## TicTacToe ⇐ [<code>SubModule</code>](#SubModule)
Manages a tic-tac-toe game.

**Kind**: global class  
**Extends**: [<code>SubModule</code>](#SubModule)  

* [TicTacToe](#TicTacToe) ⇐ [<code>SubModule</code>](#SubModule)
    * _instance_
        * [.Game](#TicTacToe+Game)
            * [new this.Game(players, msg)](#new_TicTacToe+Game_new)
            * _instance_
                * [.players](#TicTacToe+Game+players) : <code>Object</code>
                * [.board](#TicTacToe+Game+board) : <code>Array.&lt;number&gt;</code>
                * [.turn](#TicTacToe+Game+turn) : <code>number</code>
                * [.msg](#TicTacToe+Game+msg) : <code>Discord~Message</code>
                * [.print([winner])](#TicTacToe+Game+print)
            * _inner_
                * [~boardString](#TicTacToe+Game..boardString) : <code>string</code> ℗
        * [.helpMessage](#SubModule+helpMessage) : <code>string</code> \| <code>Discord~MessageEmbed</code>
        * *[.postPrefix](#SubModule+postPrefix) : <code>string</code>*
        * [.Discord](#SubModule+Discord) : <code>Discord</code>
        * [.client](#SubModule+client) : <code>Discord~Client</code>
        * [.command](#SubModule+command) : [<code>Command</code>](#Command)
        * [.common](#SubModule+common) : [<code>Common</code>](#Common)
        * [.bot](#SubModule+bot) : [<code>SpikeyBot</code>](#SpikeyBot)
        * [.myName](#SubModule+myName) : <code>string</code>
        * [.initialized](#SubModule+initialized) : <code>boolean</code>
        * [.commit](#SubModule+commit) : <code>string</code>
        * [.loadTime](#SubModule+loadTime) : <code>number</code>
        * [.createGame(players, channel)](#TicTacToe+createGame)
        * [.initialize()](#SubModule+initialize)
        * [.begin(Discord, client, command, common, bot)](#SubModule+begin)
        * [.end()](#SubModule+end)
        * [.log(msg)](#SubModule+log)
        * [.debug(msg)](#SubModule+debug)
        * [.warn(msg)](#SubModule+warn)
        * [.error(msg)](#SubModule+error)
        * [.shutdown()](#SubModule+shutdown)
        * *[.save([opt])](#SubModule+save)*
        * [.unloadable()](#SubModule+unloadable) ⇒ <code>boolean</code>
    * _inner_
        * [~numGames](#TicTacToe..numGames) : <code>number</code> ℗
        * [~maxReactAwaitTime](#TicTacToe..maxReactAwaitTime) : <code>number</code> ℗
        * [~emoji](#TicTacToe..emoji) : <code>Object.&lt;string&gt;</code> ℗
        * [~commandTicTacToe(msg)](#TicTacToe..commandTicTacToe) : [<code>commandHandler</code>](#commandHandler) ℗
        * [~addReactions(msg, index)](#TicTacToe..addReactions) ℗
        * [~addListener(msg, game)](#TicTacToe..addListener) ℗
        * [~checkWin(board, latest)](#TicTacToe..checkWin) ⇒ <code>number</code>

<a name="TicTacToe+Game"></a>

### ticTacToe.Game
**Kind**: instance class of [<code>TicTacToe</code>](#TicTacToe)  
**Access**: public  

* [.Game](#TicTacToe+Game)
    * [new this.Game(players, msg)](#new_TicTacToe+Game_new)
    * _instance_
        * [.players](#TicTacToe+Game+players) : <code>Object</code>
        * [.board](#TicTacToe+Game+board) : <code>Array.&lt;number&gt;</code>
        * [.turn](#TicTacToe+Game+turn) : <code>number</code>
        * [.msg](#TicTacToe+Game+msg) : <code>Discord~Message</code>
        * [.print([winner])](#TicTacToe+Game+print)
    * _inner_
        * [~boardString](#TicTacToe+Game..boardString) : <code>string</code> ℗

<a name="new_TicTacToe+Game_new"></a>

#### new this.Game(players, msg)
Class that stores the current state of a tic tac toe game.


| Param | Type | Description |
| --- | --- | --- |
| players | <code>Object</code> | The players in this game. |
| msg | <code>Discord~Message</code> | The message displaying the current game. |

<a name="TicTacToe+Game+players"></a>

#### game.players : <code>Object</code>
The players in this game.

**Kind**: instance property of [<code>Game</code>](#TicTacToe+Game)  
<a name="TicTacToe+Game+board"></a>

#### game.board : <code>Array.&lt;number&gt;</code>
An array of 9 elements that stores 0, 1, or 2 to signify who owns which
space of the board. 0 is nobody, 1 is player 1, 2 is player 2.

**Kind**: instance property of [<code>Game</code>](#TicTacToe+Game)  
<a name="TicTacToe+Game+turn"></a>

#### game.turn : <code>number</code>
Which player's turn it is. Either 1 or 2.

**Kind**: instance property of [<code>Game</code>](#TicTacToe+Game)  
<a name="TicTacToe+Game+msg"></a>

#### game.msg : <code>Discord~Message</code>
The message displaying the current game.

**Kind**: instance property of [<code>Game</code>](#TicTacToe+Game)  
<a name="TicTacToe+Game+print"></a>

#### game.print([winner])
Edit the current message to show the current board.

**Kind**: instance method of [<code>Game</code>](#TicTacToe+Game)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [winner] | <code>number</code> | <code>0</code> | The player who has won the game. 0 is game not done, 1 is player 1, 2 is player 2, 3 is draw. |

<a name="TicTacToe+Game..boardString"></a>

#### Game~boardString : <code>string</code> ℗
The template string for the game's board.

**Kind**: inner constant of [<code>Game</code>](#TicTacToe+Game)  
**Access**: private  
<a name="SubModule+helpMessage"></a>

### ticTacToe.helpMessage : <code>string</code> \| <code>Discord~MessageEmbed</code>
The help message to show the user in the main help message.

**Kind**: instance property of [<code>TicTacToe</code>](#TicTacToe)  
<a name="SubModule+postPrefix"></a>

### *ticTacToe.postPrefix : <code>string</code>*
The postfix for the global prefix for this subModule. Must be defined
before begin(), otherwise it is ignored.

**Kind**: instance abstract property of [<code>TicTacToe</code>](#TicTacToe)  
**Default**: <code>&quot;&quot;</code>  
<a name="SubModule+Discord"></a>

### ticTacToe.Discord : <code>Discord</code>
The current Discord object instance of the bot.

**Kind**: instance property of [<code>TicTacToe</code>](#TicTacToe)  
<a name="SubModule+client"></a>

### ticTacToe.client : <code>Discord~Client</code>
The current bot client.

**Kind**: instance property of [<code>TicTacToe</code>](#TicTacToe)  
<a name="SubModule+command"></a>

### ticTacToe.command : [<code>Command</code>](#Command)
The command object for registering command listeners.

**Kind**: instance property of [<code>TicTacToe</code>](#TicTacToe)  
<a name="SubModule+common"></a>

### ticTacToe.common : [<code>Common</code>](#Common)
The common object.

**Kind**: instance property of [<code>TicTacToe</code>](#TicTacToe)  
<a name="SubModule+bot"></a>

### ticTacToe.bot : [<code>SpikeyBot</code>](#SpikeyBot)
The parent SpikeyBot instance.

**Kind**: instance property of [<code>TicTacToe</code>](#TicTacToe)  
<a name="SubModule+myName"></a>

### ticTacToe.myName : <code>string</code>
The name of this submodule. Used for differentiating in the log. Should be
defined before begin().

**Kind**: instance property of [<code>TicTacToe</code>](#TicTacToe)  
**Overrides**: [<code>myName</code>](#SubModule+myName)  
**Access**: protected  
<a name="SubModule+initialized"></a>

### ticTacToe.initialized : <code>boolean</code>
Has this subModule been initialized yet (Has begin() been called).

**Kind**: instance property of [<code>TicTacToe</code>](#TicTacToe)  
**Default**: <code>false</code>  
**Access**: protected  
**Read only**: true  
<a name="SubModule+commit"></a>

### ticTacToe.commit : <code>string</code>
The commit at HEAD at the time this module was loaded. Essentially the
version of this submodule.

**Kind**: instance constant of [<code>TicTacToe</code>](#TicTacToe)  
**Access**: public  
<a name="SubModule+loadTime"></a>

### ticTacToe.loadTime : <code>number</code>
The time at which this madule was loaded for use in checking if the module
needs to be reloaded because the file has been modified since loading.

**Kind**: instance constant of [<code>TicTacToe</code>](#TicTacToe)  
**Access**: public  
<a name="TicTacToe+createGame"></a>

### ticTacToe.createGame(players, channel)
Create a game with the given players in a given text channel.

**Kind**: instance method of [<code>TicTacToe</code>](#TicTacToe)  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| players | <code>Object</code> | The players in the game. |
| channel | <code>Discord~TextChannel</code> | The text channel to send messages. |

<a name="SubModule+initialize"></a>

### ticTacToe.initialize()
The function called at the end of begin() for further initialization
specific to the subModule. Must be defined before begin() is called.

**Kind**: instance method of [<code>TicTacToe</code>](#TicTacToe)  
**Overrides**: [<code>initialize</code>](#SubModule+initialize)  
**Access**: protected  
<a name="SubModule+begin"></a>

### ticTacToe.begin(Discord, client, command, common, bot)
Initialize this submodule.

**Kind**: instance method of [<code>TicTacToe</code>](#TicTacToe)  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| Discord | <code>Discord</code> | The Discord object for the API library. |
| client | <code>Discord~Client</code> | The client that represents this bot. |
| command | [<code>Command</code>](#Command) | The command instance in which to register command listeners. |
| common | [<code>Common</code>](#Common) | Class storing common functions. |
| bot | [<code>SpikeyBot</code>](#SpikeyBot) | The parent SpikeyBot instance. |

<a name="SubModule+end"></a>

### ticTacToe.end()
Trigger subModule to shutdown and get ready for process terminating.

**Kind**: instance method of [<code>TicTacToe</code>](#TicTacToe)  
**Access**: public  
<a name="SubModule+log"></a>

### ticTacToe.log(msg)
Log using common.log, but automatically set name.

**Kind**: instance method of [<code>TicTacToe</code>](#TicTacToe)  
**Access**: protected  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>string</code> | The message to log. |

<a name="SubModule+debug"></a>

### ticTacToe.debug(msg)
Log using common.logDebug, but automatically set name.

**Kind**: instance method of [<code>TicTacToe</code>](#TicTacToe)  
**Access**: protected  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>string</code> | The message to log. |

<a name="SubModule+warn"></a>

### ticTacToe.warn(msg)
Log using common.logWarning, but automatically set name.

**Kind**: instance method of [<code>TicTacToe</code>](#TicTacToe)  
**Access**: protected  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>string</code> | The message to log. |

<a name="SubModule+error"></a>

### ticTacToe.error(msg)
Log using common.error, but automatically set name.

**Kind**: instance method of [<code>TicTacToe</code>](#TicTacToe)  
**Access**: protected  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>string</code> | The message to log. |

<a name="SubModule+shutdown"></a>

### ticTacToe.shutdown()
Shutdown and disable this submodule. Removes all event listeners.

**Kind**: instance method of [<code>TicTacToe</code>](#TicTacToe)  
**Overrides**: [<code>shutdown</code>](#SubModule+shutdown)  
**Access**: protected  
<a name="SubModule+save"></a>

### *ticTacToe.save([opt])*
Saves all data to files necessary for saving current state.

**Kind**: instance abstract method of [<code>TicTacToe</code>](#TicTacToe)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [opt] | <code>string</code> | <code>&quot;&#x27;sync&#x27;&quot;</code> | Can be 'async', otherwise defaults to synchronous. |

<a name="SubModule+unloadable"></a>

### ticTacToe.unloadable() ⇒ <code>boolean</code>
Check if this module is in a state that is ready to be unloaded. If false
is returned, this module should not be unloaded and doing such may risk
putting the module into an uncontrollable state.

**Kind**: instance method of [<code>TicTacToe</code>](#TicTacToe)  
**Overrides**: [<code>unloadable</code>](#SubModule+unloadable)  
**Returns**: <code>boolean</code> - True if can be unloaded, false if cannot.  
**Access**: public  
<a name="TicTacToe..numGames"></a>

### TicTacToe~numGames : <code>number</code> ℗
The number of currently active games. Used to determine of submodule is
unloadable.

**Kind**: inner property of [<code>TicTacToe</code>](#TicTacToe)  
**Default**: <code>0</code>  
**Access**: private  
<a name="TicTacToe..maxReactAwaitTime"></a>

### TicTacToe~maxReactAwaitTime : <code>number</code> ℗
Maximum amount of time to wait for reactions to a message. Also becomes
maximum amount of time a game will run with no input, because controls will
be disabled after this timeout.

**Kind**: inner constant of [<code>TicTacToe</code>](#TicTacToe)  
**Default**: <code>5 Minutes</code>  
**Access**: private  
<a name="TicTacToe..emoji"></a>

### TicTacToe~emoji : <code>Object.&lt;string&gt;</code> ℗
Helper object of emoji characters mapped to names.

**Kind**: inner constant of [<code>TicTacToe</code>](#TicTacToe)  
**Default**: <code>{&quot;undefined&quot;:&quot;9⃣&quot;,&quot;X&quot;:&quot;❌&quot;,&quot;O&quot;:&quot;⭕&quot;}</code>  
**Access**: private  
<a name="TicTacToe..commandTicTacToe"></a>

### TicTacToe~commandTicTacToe(msg) : [<code>commandHandler</code>](#commandHandler) ℗
Starts a tic tac toe game. If someone is mentioned it will start a game
between the message author and the mentioned person. Otherwise, waits for
someone to play.

**Kind**: inner method of [<code>TicTacToe</code>](#TicTacToe)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord~Message</code> | Message that triggered command. |

<a name="TicTacToe..addReactions"></a>

### TicTacToe~addReactions(msg, index) ℗
Add the reactions to a message for controls of the game. Recursive.

**Kind**: inner method of [<code>TicTacToe</code>](#TicTacToe)  
**Access**: private  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| msg | <code>Discord~Message</code> |  | The message to add the reactions to. |
| index | <code>number</code> | <code>0</code> | The number of reactions we have added so far. |

<a name="TicTacToe..addListener"></a>

### TicTacToe~addListener(msg, game) ℗
Add the listener for reactions to the game.

**Kind**: inner method of [<code>TicTacToe</code>](#TicTacToe)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord~Message</code> | The message to add the reactions to. |
| game | <code>TicTacToe~Game</code> | The game to update when changes are made. |

<a name="TicTacToe..checkWin"></a>

### TicTacToe~checkWin(board, latest) ⇒ <code>number</code>
Checks if the given board has a winner, or if the game is over.

**Kind**: inner method of [<code>TicTacToe</code>](#TicTacToe)  
**Returns**: <code>number</code> - Returns 0 if game is not over, 1 if player 1 won, 2 if
player 2 won, 3 if draw.  

| Param | Type | Description |
| --- | --- | --- |
| board | <code>Array.&lt;number&gt;</code> | Array of 9 numbers defining a board. 0 is nobody, 1 is player 1, 2 is player 2. |
| latest | <code>number</code> | The index where the latest move occurred. |

<a name="TTS"></a>

## TTS ⇐ [<code>SubModule</code>](#SubModule)
Adds text-to-speech support for voice channels.

**Kind**: global class  
**Extends**: [<code>SubModule</code>](#SubModule)  

* [TTS](#TTS) ⇐ [<code>SubModule</code>](#SubModule)
    * _instance_
        * [.helpMessage](#SubModule+helpMessage) : <code>string</code> \| <code>Discord~MessageEmbed</code>
        * *[.postPrefix](#SubModule+postPrefix) : <code>string</code>*
        * [.Discord](#SubModule+Discord) : <code>Discord</code>
        * [.client](#SubModule+client) : <code>Discord~Client</code>
        * [.command](#SubModule+command) : [<code>Command</code>](#Command)
        * [.common](#SubModule+common) : [<code>Common</code>](#Common)
        * [.bot](#SubModule+bot) : [<code>SpikeyBot</code>](#SpikeyBot)
        * [.myName](#SubModule+myName) : <code>string</code>
        * [.initialized](#SubModule+initialized) : <code>boolean</code>
        * [.commit](#SubModule+commit) : <code>string</code>
        * [.loadTime](#SubModule+loadTime) : <code>number</code>
        * [.initialize()](#SubModule+initialize)
        * [.begin(Discord, client, command, common, bot)](#SubModule+begin)
        * [.end()](#SubModule+end)
        * [.log(msg)](#SubModule+log)
        * [.debug(msg)](#SubModule+debug)
        * [.warn(msg)](#SubModule+warn)
        * [.error(msg)](#SubModule+error)
        * [.shutdown()](#SubModule+shutdown)
        * *[.save([opt])](#SubModule+save)*
        * *[.unloadable()](#SubModule+unloadable) ⇒ <code>boolean</code>*
    * _inner_
        * [~ttsPermString](#TTS..ttsPermString) : <code>string</code> ℗
        * [~commandTTS(msg)](#TTS..commandTTS) : [<code>commandHandler</code>](#commandHandler) ℗
            * [~onGetPerms(err, info)](#TTS..commandTTS..onGetPerms) : [<code>basicCB</code>](#Patreon..basicCB) ℗
            * [~onGetSettings(err, info)](#TTS..commandTTS..onGetSettings) : [<code>basicCB</code>](#Patreon..basicCB) ℗
            * [~onJoinVoice(conn)](#TTS..commandTTS..onJoinVoice) ℗
            * [~onSpeechResponse(err, res)](#TTS..commandTTS..onSpeechResponse) ℗

<a name="SubModule+helpMessage"></a>

### ttS.helpMessage : <code>string</code> \| <code>Discord~MessageEmbed</code>
The help message to show the user in the main help message.

**Kind**: instance property of [<code>TTS</code>](#TTS)  
**Overrides**: [<code>helpMessage</code>](#SubModule+helpMessage)  
<a name="SubModule+postPrefix"></a>

### *ttS.postPrefix : <code>string</code>*
The postfix for the global prefix for this subModule. Must be defined
before begin(), otherwise it is ignored.

**Kind**: instance abstract property of [<code>TTS</code>](#TTS)  
**Default**: <code>&quot;&quot;</code>  
<a name="SubModule+Discord"></a>

### ttS.Discord : <code>Discord</code>
The current Discord object instance of the bot.

**Kind**: instance property of [<code>TTS</code>](#TTS)  
<a name="SubModule+client"></a>

### ttS.client : <code>Discord~Client</code>
The current bot client.

**Kind**: instance property of [<code>TTS</code>](#TTS)  
<a name="SubModule+command"></a>

### ttS.command : [<code>Command</code>](#Command)
The command object for registering command listeners.

**Kind**: instance property of [<code>TTS</code>](#TTS)  
<a name="SubModule+common"></a>

### ttS.common : [<code>Common</code>](#Common)
The common object.

**Kind**: instance property of [<code>TTS</code>](#TTS)  
<a name="SubModule+bot"></a>

### ttS.bot : [<code>SpikeyBot</code>](#SpikeyBot)
The parent SpikeyBot instance.

**Kind**: instance property of [<code>TTS</code>](#TTS)  
<a name="SubModule+myName"></a>

### ttS.myName : <code>string</code>
The name of this submodule. Used for differentiating in the log. Should be
defined before begin().

**Kind**: instance property of [<code>TTS</code>](#TTS)  
**Overrides**: [<code>myName</code>](#SubModule+myName)  
**Access**: protected  
<a name="SubModule+initialized"></a>

### ttS.initialized : <code>boolean</code>
Has this subModule been initialized yet (Has begin() been called).

**Kind**: instance property of [<code>TTS</code>](#TTS)  
**Default**: <code>false</code>  
**Access**: protected  
**Read only**: true  
<a name="SubModule+commit"></a>

### ttS.commit : <code>string</code>
The commit at HEAD at the time this module was loaded. Essentially the
version of this submodule.

**Kind**: instance constant of [<code>TTS</code>](#TTS)  
**Access**: public  
<a name="SubModule+loadTime"></a>

### ttS.loadTime : <code>number</code>
The time at which this madule was loaded for use in checking if the module
needs to be reloaded because the file has been modified since loading.

**Kind**: instance constant of [<code>TTS</code>](#TTS)  
**Access**: public  
<a name="SubModule+initialize"></a>

### ttS.initialize()
The function called at the end of begin() for further initialization
specific to the subModule. Must be defined before begin() is called.

**Kind**: instance method of [<code>TTS</code>](#TTS)  
**Overrides**: [<code>initialize</code>](#SubModule+initialize)  
**Access**: protected  
<a name="SubModule+begin"></a>

### ttS.begin(Discord, client, command, common, bot)
Initialize this submodule.

**Kind**: instance method of [<code>TTS</code>](#TTS)  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| Discord | <code>Discord</code> | The Discord object for the API library. |
| client | <code>Discord~Client</code> | The client that represents this bot. |
| command | [<code>Command</code>](#Command) | The command instance in which to register command listeners. |
| common | [<code>Common</code>](#Common) | Class storing common functions. |
| bot | [<code>SpikeyBot</code>](#SpikeyBot) | The parent SpikeyBot instance. |

<a name="SubModule+end"></a>

### ttS.end()
Trigger subModule to shutdown and get ready for process terminating.

**Kind**: instance method of [<code>TTS</code>](#TTS)  
**Access**: public  
<a name="SubModule+log"></a>

### ttS.log(msg)
Log using common.log, but automatically set name.

**Kind**: instance method of [<code>TTS</code>](#TTS)  
**Access**: protected  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>string</code> | The message to log. |

<a name="SubModule+debug"></a>

### ttS.debug(msg)
Log using common.logDebug, but automatically set name.

**Kind**: instance method of [<code>TTS</code>](#TTS)  
**Access**: protected  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>string</code> | The message to log. |

<a name="SubModule+warn"></a>

### ttS.warn(msg)
Log using common.logWarning, but automatically set name.

**Kind**: instance method of [<code>TTS</code>](#TTS)  
**Access**: protected  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>string</code> | The message to log. |

<a name="SubModule+error"></a>

### ttS.error(msg)
Log using common.error, but automatically set name.

**Kind**: instance method of [<code>TTS</code>](#TTS)  
**Access**: protected  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>string</code> | The message to log. |

<a name="SubModule+shutdown"></a>

### ttS.shutdown()
Shutdown and disable this submodule. Removes all event listeners.

**Kind**: instance method of [<code>TTS</code>](#TTS)  
**Overrides**: [<code>shutdown</code>](#SubModule+shutdown)  
**Access**: protected  
<a name="SubModule+save"></a>

### *ttS.save([opt])*
Saves all data to files necessary for saving current state.

**Kind**: instance abstract method of [<code>TTS</code>](#TTS)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [opt] | <code>string</code> | <code>&quot;&#x27;sync&#x27;&quot;</code> | Can be 'async', otherwise defaults to synchronous. |

<a name="SubModule+unloadable"></a>

### *ttS.unloadable() ⇒ <code>boolean</code>*
Check if this module is in a state that is ready to be unloaded. If false
is returned, this module should not be unloaded and doing such may risk
putting the module into an uncontrollable state.

**Kind**: instance abstract method of [<code>TTS</code>](#TTS)  
**Returns**: <code>boolean</code> - True if can be unloaded, false if cannot.  
**Access**: public  
<a name="TTS..ttsPermString"></a>

### TTS~ttsPermString : <code>string</code> ℗
The permission required to use TTS commands.

**Kind**: inner constant of [<code>TTS</code>](#TTS)  
**Default**: <code>&quot;tts:all&quot;</code>  
**Access**: private  
<a name="TTS..commandTTS"></a>

### TTS~commandTTS(msg) : [<code>commandHandler</code>](#commandHandler) ℗
Joins a user's voice channel and speaks the given message.

**Kind**: inner method of [<code>TTS</code>](#TTS)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord~Message</code> | Message that triggered command. |


* [~commandTTS(msg)](#TTS..commandTTS) : [<code>commandHandler</code>](#commandHandler) ℗
    * [~onGetPerms(err, info)](#TTS..commandTTS..onGetPerms) : [<code>basicCB</code>](#Patreon..basicCB) ℗
    * [~onGetSettings(err, info)](#TTS..commandTTS..onGetSettings) : [<code>basicCB</code>](#Patreon..basicCB) ℗
    * [~onJoinVoice(conn)](#TTS..commandTTS..onJoinVoice) ℗
    * [~onSpeechResponse(err, res)](#TTS..commandTTS..onSpeechResponse) ℗

<a name="TTS..commandTTS..onGetPerms"></a>

#### commandTTS~onGetPerms(err, info) : [<code>basicCB</code>](#Patreon..basicCB) ℗
Callback for checking permissions for command.

**Kind**: inner method of [<code>commandTTS</code>](#TTS..commandTTS)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| err | <code>string</code> | The error string, or null if no error. |
| info | <code>Object</code> | The returned data if there was no error. |

<a name="TTS..commandTTS..onGetSettings"></a>

#### commandTTS~onGetSettings(err, info) : [<code>basicCB</code>](#Patreon..basicCB) ℗
After checking if a user has permission for this command, send the
request too Google with the user's settings.

**Kind**: inner method of [<code>commandTTS</code>](#TTS..commandTTS)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| err | <code>string</code> | The error string, or null if no error. |
| info | <code>Object</code> | The returned data if there was no error. |

<a name="TTS..commandTTS..onJoinVoice"></a>

#### commandTTS~onJoinVoice(conn) ℗
Successfully joined a voice channel, now we can request audio data from
Google.

**Kind**: inner method of [<code>commandTTS</code>](#TTS..commandTTS)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| conn | <code>Discord~VoiceConnection</code> | The voice channel connection. |

<a name="TTS..commandTTS..onSpeechResponse"></a>

#### commandTTS~onSpeechResponse(err, res) ℗
Response from Google with TTS audio data.

**Kind**: inner method of [<code>commandTTS</code>](#TTS..commandTTS)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| err | <code>Error</code> | Errors in request. |
| res | <code>Object</code> | Response. |

<a name="FunTranslators"></a>

## FunTranslators
Converts text strings into different formats.

**Kind**: global class  

* [FunTranslators](#FunTranslators)
    * [.to(name, input)](#FunTranslators+to) ⇒ <code>string</code>
    * [.toLeetSpeak(input)](#FunTranslators+toLeetSpeak) ⇒ <code>string</code>
    * [.toMockingFont(input)](#FunTranslators+toMockingFont) ⇒ <code>string</code>
    * [.toSmallCaps(input)](#FunTranslators+toSmallCaps) ⇒ <code>string</code>
    * [.toSuperScript(input)](#FunTranslators+toSuperScript) ⇒ <code>string</code>

<a name="FunTranslators+to"></a>

### funTranslators.to(name, input) ⇒ <code>string</code>
Convert a string to a format based on it's name.

**Kind**: instance method of [<code>FunTranslators</code>](#FunTranslators)  
**Returns**: <code>string</code> - The formatted string.  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | The name of the translator. |
| input | <code>string</code> | The string to convert. |

<a name="FunTranslators+toLeetSpeak"></a>

### funTranslators.toLeetSpeak(input) ⇒ <code>string</code>
Convert a string to Leet Speak (1337 5p34k).

**Kind**: instance method of [<code>FunTranslators</code>](#FunTranslators)  
**Returns**: <code>string</code> - The formatted string.  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| input | <code>string</code> | The string to convert. |

<a name="FunTranslators+toMockingFont"></a>

### funTranslators.toMockingFont(input) ⇒ <code>string</code>
Convert a string to the SpongeBob mocking meme font (SpOngEBoB MoCKinG).

**Kind**: instance method of [<code>FunTranslators</code>](#FunTranslators)  
**Returns**: <code>string</code> - The formatted string.  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| input | <code>string</code> | The string to convert. |

<a name="FunTranslators+toSmallCaps"></a>

### funTranslators.toSmallCaps(input) ⇒ <code>string</code>
Convert string to small caps (Hᴇʟʟᴏ Wᴏʀʟᴅ!).

**Kind**: instance method of [<code>FunTranslators</code>](#FunTranslators)  
**Returns**: <code>string</code> - The formatted string.  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| input | <code>string</code> | The string to convert. |

<a name="FunTranslators+toSuperScript"></a>

### funTranslators.toSuperScript(input) ⇒ <code>string</code>
Convert string to superscript characters (ᴴᵉˡˡᵒ ᵂᵒʳˡᵈᵎ).

**Kind**: instance method of [<code>FunTranslators</code>](#FunTranslators)  
**Returns**: <code>string</code> - The formatted string.  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| input | <code>string</code> | The string to convert. |

<a name="WebAccount"></a>

## WebAccount ⇐ [<code>SubModule</code>](#SubModule)
Manages the account webpage.

**Kind**: global class  
**Extends**: [<code>SubModule</code>](#SubModule)  

* [WebAccount](#WebAccount) ⇐ [<code>SubModule</code>](#SubModule)
    * _instance_
        * [.helpMessage](#SubModule+helpMessage) : <code>string</code> \| <code>Discord~MessageEmbed</code>
        * *[.postPrefix](#SubModule+postPrefix) : <code>string</code>*
        * [.Discord](#SubModule+Discord) : <code>Discord</code>
        * [.client](#SubModule+client) : <code>Discord~Client</code>
        * [.command](#SubModule+command) : [<code>Command</code>](#Command)
        * [.common](#SubModule+common) : [<code>Common</code>](#Common)
        * [.bot](#SubModule+bot) : [<code>SpikeyBot</code>](#SpikeyBot)
        * *[.myName](#SubModule+myName) : <code>string</code>*
        * [.initialized](#SubModule+initialized) : <code>boolean</code>
        * [.commit](#SubModule+commit) : <code>string</code>
        * [.loadTime](#SubModule+loadTime) : <code>number</code>
        * [.shutdown([skipSave])](#WebAccount+shutdown)
        * [.initialize()](#SubModule+initialize)
        * [.begin(Discord, client, command, common, bot)](#SubModule+begin)
        * [.end()](#SubModule+end)
        * [.log(msg)](#SubModule+log)
        * [.debug(msg)](#SubModule+debug)
        * [.warn(msg)](#SubModule+warn)
        * [.error(msg)](#SubModule+error)
        * *[.save([opt])](#SubModule+save)*
        * [.unloadable()](#SubModule+unloadable) ⇒ <code>boolean</code>
    * _inner_
        * [~patreonSettingsTemplate](#WebAccount..patreonSettingsTemplate) : <code>Object.&lt;Object&gt;</code> ℗
        * [~sqlCon](#WebAccount..sqlCon) : <code>sql.ConnectionConfig</code> ℗
        * [~sockets](#WebAccount..sockets) : <code>Object.&lt;Socket&gt;</code> ℗
        * [~patreonSettingsFilename](#WebAccount..patreonSettingsFilename) : <code>string</code> ℗
        * [~patreonSettingsTemplateFile](#WebAccount..patreonSettingsTemplateFile) : <code>string</code> ℗
        * [~updatePatreonSettingsTemplate()](#WebAccount..updatePatreonSettingsTemplate) ℗
        * [~connectSQL()](#WebAccount..connectSQL) ℗
        * [~handler(req, res)](#WebAccount..handler) ℗
        * [~socketConnection(socket)](#WebAccount..socketConnection) ℗
        * [~validatePatreonCode(code, userid, ip, cb)](#WebAccount..validatePatreonCode) ℗
        * [~validateSpotifyCode(code, userid, ip, cb)](#WebAccount..validateSpotifyCode) ℗
        * [~handleSpotifyTokenResponse(userid, content, ip, cb)](#WebAccount..handleSpotifyTokenResponse) ℗
        * [~handleSpotifyUserResponse(userid, content, vals, ip, cb)](#WebAccount..handleSpotifyUserResponse) ℗
        * [~updateUserPatreonId(userid, patreonid, cb)](#WebAccount..updateUserPatreonId) ℗
        * [~updateUserSpotifyId(userid, spotifyid, cb)](#WebAccount..updateUserSpotifyId) ℗
            * [~setId()](#WebAccount..updateUserSpotifyId..setId)
        * [~getPatreonSettings(userid, cb)](#WebAccount..getPatreonSettings) ℗
        * [~changePatreonSetting(userid, setting, value, cb)](#WebAccount..changePatreonSetting) ℗
            * [~makeDirectory(err, data)](#WebAccount..changePatreonSetting..makeDirectory) ℗
            * [~writeFile(err, file)](#WebAccount..changePatreonSetting..writeFile) ℗
            * [~isInvalid(obj, s, value)](#WebAccount..changePatreonSetting..isInvalid) ⇒ <code>boolean</code> ℗
        * [~dateToSQL(date)](#WebAccount..dateToSQL) ⇒ <code>string</code> ℗

<a name="SubModule+helpMessage"></a>

### webAccount.helpMessage : <code>string</code> \| <code>Discord~MessageEmbed</code>
The help message to show the user in the main help message.

**Kind**: instance property of [<code>WebAccount</code>](#WebAccount)  
<a name="SubModule+postPrefix"></a>

### *webAccount.postPrefix : <code>string</code>*
The postfix for the global prefix for this subModule. Must be defined
before begin(), otherwise it is ignored.

**Kind**: instance abstract property of [<code>WebAccount</code>](#WebAccount)  
**Default**: <code>&quot;&quot;</code>  
<a name="SubModule+Discord"></a>

### webAccount.Discord : <code>Discord</code>
The current Discord object instance of the bot.

**Kind**: instance property of [<code>WebAccount</code>](#WebAccount)  
<a name="SubModule+client"></a>

### webAccount.client : <code>Discord~Client</code>
The current bot client.

**Kind**: instance property of [<code>WebAccount</code>](#WebAccount)  
<a name="SubModule+command"></a>

### webAccount.command : [<code>Command</code>](#Command)
The command object for registering command listeners.

**Kind**: instance property of [<code>WebAccount</code>](#WebAccount)  
<a name="SubModule+common"></a>

### webAccount.common : [<code>Common</code>](#Common)
The common object.

**Kind**: instance property of [<code>WebAccount</code>](#WebAccount)  
<a name="SubModule+bot"></a>

### webAccount.bot : [<code>SpikeyBot</code>](#SpikeyBot)
The parent SpikeyBot instance.

**Kind**: instance property of [<code>WebAccount</code>](#WebAccount)  
<a name="SubModule+myName"></a>

### *webAccount.myName : <code>string</code>*
The name of this submodule. Used for differentiating in the log. Should be
defined before begin().

**Kind**: instance abstract property of [<code>WebAccount</code>](#WebAccount)  
**Overrides**: [<code>myName</code>](#SubModule+myName)  
**Access**: protected  
<a name="SubModule+initialized"></a>

### webAccount.initialized : <code>boolean</code>
Has this subModule been initialized yet (Has begin() been called).

**Kind**: instance property of [<code>WebAccount</code>](#WebAccount)  
**Default**: <code>false</code>  
**Access**: protected  
**Read only**: true  
<a name="SubModule+commit"></a>

### webAccount.commit : <code>string</code>
The commit at HEAD at the time this module was loaded. Essentially the
version of this submodule.

**Kind**: instance constant of [<code>WebAccount</code>](#WebAccount)  
**Access**: public  
<a name="SubModule+loadTime"></a>

### webAccount.loadTime : <code>number</code>
The time at which this madule was loaded for use in checking if the module
needs to be reloaded because the file has been modified since loading.

**Kind**: instance constant of [<code>WebAccount</code>](#WebAccount)  
**Access**: public  
<a name="WebAccount+shutdown"></a>

### webAccount.shutdown([skipSave])
Causes a full shutdown of all servers.

**Kind**: instance method of [<code>WebAccount</code>](#WebAccount)  
**Overrides**: [<code>shutdown</code>](#SubModule+shutdown)  
**Access**: public  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [skipSave] | <code>boolean</code> | <code>false</code> | Skip writing data to file. |

<a name="SubModule+initialize"></a>

### webAccount.initialize()
The function called at the end of begin() for further initialization
specific to the subModule. Must be defined before begin() is called.

**Kind**: instance method of [<code>WebAccount</code>](#WebAccount)  
**Overrides**: [<code>initialize</code>](#SubModule+initialize)  
**Access**: protected  
<a name="SubModule+begin"></a>

### webAccount.begin(Discord, client, command, common, bot)
Initialize this submodule.

**Kind**: instance method of [<code>WebAccount</code>](#WebAccount)  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| Discord | <code>Discord</code> | The Discord object for the API library. |
| client | <code>Discord~Client</code> | The client that represents this bot. |
| command | [<code>Command</code>](#Command) | The command instance in which to register command listeners. |
| common | [<code>Common</code>](#Common) | Class storing common functions. |
| bot | [<code>SpikeyBot</code>](#SpikeyBot) | The parent SpikeyBot instance. |

<a name="SubModule+end"></a>

### webAccount.end()
Trigger subModule to shutdown and get ready for process terminating.

**Kind**: instance method of [<code>WebAccount</code>](#WebAccount)  
**Access**: public  
<a name="SubModule+log"></a>

### webAccount.log(msg)
Log using common.log, but automatically set name.

**Kind**: instance method of [<code>WebAccount</code>](#WebAccount)  
**Access**: protected  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>string</code> | The message to log. |

<a name="SubModule+debug"></a>

### webAccount.debug(msg)
Log using common.logDebug, but automatically set name.

**Kind**: instance method of [<code>WebAccount</code>](#WebAccount)  
**Access**: protected  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>string</code> | The message to log. |

<a name="SubModule+warn"></a>

### webAccount.warn(msg)
Log using common.logWarning, but automatically set name.

**Kind**: instance method of [<code>WebAccount</code>](#WebAccount)  
**Access**: protected  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>string</code> | The message to log. |

<a name="SubModule+error"></a>

### webAccount.error(msg)
Log using common.error, but automatically set name.

**Kind**: instance method of [<code>WebAccount</code>](#WebAccount)  
**Access**: protected  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>string</code> | The message to log. |

<a name="SubModule+save"></a>

### *webAccount.save([opt])*
Saves all data to files necessary for saving current state.

**Kind**: instance abstract method of [<code>WebAccount</code>](#WebAccount)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [opt] | <code>string</code> | <code>&quot;&#x27;sync&#x27;&quot;</code> | Can be 'async', otherwise defaults to synchronous. |

<a name="SubModule+unloadable"></a>

### webAccount.unloadable() ⇒ <code>boolean</code>
Check if this module is in a state that is ready to be unloaded. If false
is returned, this module should not be unloaded and doing such may risk
putting the module into an uncontrollable state.

**Kind**: instance method of [<code>WebAccount</code>](#WebAccount)  
**Overrides**: [<code>unloadable</code>](#SubModule+unloadable)  
**Returns**: <code>boolean</code> - True if can be unloaded, false if cannot.  
**Access**: public  
<a name="WebAccount..patreonSettingsTemplate"></a>

### WebAccount~patreonSettingsTemplate : <code>Object.&lt;Object&gt;</code> ℗
The parsed data from [patreonSettingsTemplateFile](#WebAccount..patreonSettingsTemplateFile). Data
that outlines the available options that can be changed, and their possible
values.

**Kind**: inner property of [<code>WebAccount</code>](#WebAccount)  
**Default**: <code>{}</code>  
**Access**: private  
<a name="WebAccount..sqlCon"></a>

### WebAccount~sqlCon : <code>sql.ConnectionConfig</code> ℗
The object describing the connection with the SQL server.

**Kind**: inner property of [<code>WebAccount</code>](#WebAccount)  
**Access**: private  
<a name="WebAccount..sockets"></a>

### WebAccount~sockets : <code>Object.&lt;Socket&gt;</code> ℗
Map of all currently connected sockets.

**Kind**: inner property of [<code>WebAccount</code>](#WebAccount)  
**Access**: private  
<a name="WebAccount..patreonSettingsFilename"></a>

### WebAccount~patreonSettingsFilename : <code>string</code> ℗
The filename in the user's directory of the file where the settings related
to Patreon rewards are stored.

**Kind**: inner constant of [<code>WebAccount</code>](#WebAccount)  
**Default**: <code>&quot;/patreonSettings.json&quot;</code>  
**Access**: private  
<a name="WebAccount..patreonSettingsTemplateFile"></a>

### WebAccount~patreonSettingsTemplateFile : <code>string</code> ℗
File where the template for the Patreon settings is stored.

**Kind**: inner constant of [<code>WebAccount</code>](#WebAccount)  
**Default**: <code>&quot;./save/patreonSettingTemplate.json&quot;</code>  
**Access**: private  
**See**: [patreonSettingsTemplate](#WebAccount..patreonSettingsTemplate)  
<a name="WebAccount..updatePatreonSettingsTemplate"></a>

### WebAccount~updatePatreonSettingsTemplate() ℗
Parse template from file.

**Kind**: inner method of [<code>WebAccount</code>](#WebAccount)  
**Access**: private  
**See**: [patreonSettingsTemplate](#WebAccount..patreonSettingsTemplate)  
<a name="WebAccount..connectSQL"></a>

### WebAccount~connectSQL() ℗
Create initial connection with sql server.

**Kind**: inner method of [<code>WebAccount</code>](#WebAccount)  
**Access**: private  
<a name="WebAccount..handler"></a>

### WebAccount~handler(req, res) ℗
Handler for all http requests. Should never be called.

**Kind**: inner method of [<code>WebAccount</code>](#WebAccount)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| req | <code>http.IncomingMessage</code> | The client's request. |
| res | <code>http.ServerResponse</code> | Our response to the client. |

<a name="WebAccount..socketConnection"></a>

### WebAccount~socketConnection(socket) ℗
Handler for a new socket connecting.

**Kind**: inner method of [<code>WebAccount</code>](#WebAccount)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| socket | <code>socketIo~Socket</code> | The socket.io socket that connected. |

<a name="WebAccount..validatePatreonCode"></a>

### WebAccount~validatePatreonCode(code, userid, ip, cb) ℗
Validate a code received from the client, then use it to retrieve the user
ID associated with it.

**Kind**: inner method of [<code>WebAccount</code>](#WebAccount)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| code | <code>string</code> | The code received from Patreon OAuth2 flow. |
| userid | <code>string</code> \| <code>number</code> | The Discord user ID associated with this code in order to link accounts. |
| ip | <code>string</code> | The unique identifier for this connection for logging purposes. |
| cb | <code>function</code> | Callback with a single parameter. The parameter is a string if there was an error, or null if no error. |

<a name="WebAccount..validateSpotifyCode"></a>

### WebAccount~validateSpotifyCode(code, userid, ip, cb) ℗
Validate a code received from the client, then use it to retrieve the user
ID associated with it.

**Kind**: inner method of [<code>WebAccount</code>](#WebAccount)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| code | <code>string</code> | The code received from Patreon OAuth2 flow. |
| userid | <code>string</code> \| <code>number</code> | The Discord user ID associated with this code in order to link accounts. |
| ip | <code>string</code> | The unique identifier for this connection for logging purposes. |
| cb | <code>function</code> | Callback with a single parameter. The parameter is a string if there was an error, or null if no error. |

<a name="WebAccount..handleSpotifyTokenResponse"></a>

### WebAccount~handleSpotifyTokenResponse(userid, content, ip, cb) ℗
Handle the response after successfully requesting the user's tokens.

**Kind**: inner method of [<code>WebAccount</code>](#WebAccount)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| userid | <code>string</code> \| <code>number</code> | Discord user id. |
| content | <code>string</code> | The response from Spotify. |
| ip | <code>string</code> | Unique identifier for the client that caused this to happen. Used for logging. |
| cb | <code>function</code> | Callback with single parameter, string if error, null if no error. |

<a name="WebAccount..handleSpotifyUserResponse"></a>

### WebAccount~handleSpotifyUserResponse(userid, content, vals, ip, cb) ℗
Handle the response after successfully requesting the user's basic account
information.

**Kind**: inner method of [<code>WebAccount</code>](#WebAccount)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| userid | <code>string</code> \| <code>number</code> | Discord user id. |
| content | <code>string</code> | The response from Spotify. |
| vals | <code>Object</code> | The object storing user session information. |
| ip | <code>string</code> | Unique identifier for the client that caused this to happen. Used for logging. |
| cb | <code>function</code> | Callback with single parameter, string if error, null if no error. |

<a name="WebAccount..updateUserPatreonId"></a>

### WebAccount~updateUserPatreonId(userid, patreonid, cb) ℗
Update our Discord table with the retrieved patreon account ID for the
Discord user.

**Kind**: inner method of [<code>WebAccount</code>](#WebAccount)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| userid | <code>string</code> \| <code>number</code> | The Discord ID of the user to link to the patreonid. |
| patreonid | <code>string</code> \| <code>number</code> | The Patreon id of the account to link to the Discord ID. |
| cb | <code>function</code> | Callback with single argument that is string if error, or null if no error. |

<a name="WebAccount..updateUserSpotifyId"></a>

### WebAccount~updateUserSpotifyId(userid, spotifyid, cb) ℗
Update our Discord table with the retrieved spotify account ID for the
Discord user. Deletes row from Spotify table if the userId is falsey.

**Kind**: inner method of [<code>WebAccount</code>](#WebAccount)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| userid | <code>string</code> \| <code>number</code> | The Discord ID of the user to link to the patreonid. |
| spotifyid | <code>string</code> \| <code>number</code> | The Spotify id of the account to link to the Discord ID. |
| cb | <code>function</code> | Callback with single argument that is string if error, or null if no error. |

<a name="WebAccount..updateUserSpotifyId..setId"></a>

#### updateUserSpotifyId~setId()
Send request to sql server.

**Kind**: inner method of [<code>updateUserSpotifyId</code>](#WebAccount..updateUserSpotifyId)  
<a name="WebAccount..getPatreonSettings"></a>

### WebAccount~getPatreonSettings(userid, cb) ℗
Fetch a user's current patreon settings from file.

**Kind**: inner method of [<code>WebAccount</code>](#WebAccount)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| userid | <code>string</code> \| <code>number</code> | Thd Discord id of the user to lookup. |
| cb | <code>function</code> | Callback with 2 parameters, the first is the error string or null if no error, the second will be the settings object if there is no error. |

<a name="WebAccount..changePatreonSetting"></a>

### WebAccount~changePatreonSetting(userid, setting, value, cb) ℗
Change a user's setting that is related to Patreon rewards.

**Kind**: inner method of [<code>WebAccount</code>](#WebAccount)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| userid | <code>string</code> \| <code>number</code> | The Discord id of the user to change the setting for. |
| setting | <code>string</code> | The name of the setting to change. |
| value | <code>string</code> | The value to set the setting to. |
| cb | <code>function</code> | Callback that is called once the operations are complete with a single parameter for errors, string if error, null if none. |


* [~changePatreonSetting(userid, setting, value, cb)](#WebAccount..changePatreonSetting) ℗
    * [~makeDirectory(err, data)](#WebAccount..changePatreonSetting..makeDirectory) ℗
    * [~writeFile(err, file)](#WebAccount..changePatreonSetting..writeFile) ℗
    * [~isInvalid(obj, s, value)](#WebAccount..changePatreonSetting..isInvalid) ⇒ <code>boolean</code> ℗

<a name="WebAccount..changePatreonSetting..makeDirectory"></a>

#### changePatreonSetting~makeDirectory(err, data) ℗
Make the directory for writing the user's settings if it does not exist
already.

**Kind**: inner method of [<code>changePatreonSetting</code>](#WebAccount..changePatreonSetting)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| err | <code>Error</code> | The error in readin the existing file. |
| data | <code>string</code> | The data read from the existing file if any. |

<a name="WebAccount..changePatreonSetting..writeFile"></a>

#### changePatreonSetting~writeFile(err, file) ℗
Write the modified data to file.

**Kind**: inner method of [<code>changePatreonSetting</code>](#WebAccount..changePatreonSetting)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| err | <code>Error</code> | The error in creating the directory. |
| file | <code>string</code> | The current file data that was read. |

<a name="WebAccount..changePatreonSetting..isInvalid"></a>

#### changePatreonSetting~isInvalid(obj, s, value) ⇒ <code>boolean</code> ℗
Checks that the setting that was requested to be changed is a valid
setting to change.

**Kind**: inner method of [<code>changePatreonSetting</code>](#WebAccount..changePatreonSetting)  
**Returns**: <code>boolean</code> - True if the request was invalid in some way, or false
if everything is fine.  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| obj | <code>Object</code> | The template object to compare the request against. |
| s | <code>Array.&lt;string&gt;</code> | The array of each setting key that was a part of the request. |
| value | <code>string</code> \| <code>number</code> | The value to change the setting to. |

<a name="WebAccount..dateToSQL"></a>

### WebAccount~dateToSQL(date) ⇒ <code>string</code> ℗
Convert the given date into a format that SQL can understand.

**Kind**: inner method of [<code>WebAccount</code>](#WebAccount)  
**Returns**: <code>string</code> - Formatted Datetime string not including fractions of a
second.  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| date | <code>\*</code> | Something that `new Date()` can interpret. |

<a name="HGWeb"></a>

## HGWeb
Creates a web interface for managing the Hungry Games.

**Kind**: global class  

* [HGWeb](#HGWeb)
    * [new HGWeb(hg)](#new_HGWeb_new)
    * _instance_
        * [.shutdown([skipSave])](#HGWeb+shutdown)
        * [.getNumClients()](#HGWeb+getNumClients) ⇒ <code>number</code>
        * [.dayStateChange(gId)](#HGWeb+dayStateChange)
    * _inner_
        * [~sockets](#HGWeb..sockets) : <code>Object.&lt;Socket&gt;</code> ℗
        * [~siblingSockets](#HGWeb..siblingSockets) : <code>Object.&lt;Socket&gt;</code> ℗
        * [~startClient()](#HGWeb..startClient) ℗
        * [~handler(req, res)](#HGWeb..handler) ℗
        * [~socketConnection(socket)](#HGWeb..socketConnection) ℗
            * [~callSocketFunction(func, args, [forward])](#HGWeb..socketConnection..callSocketFunction) ℗
        * [~clientSocketConnection(socket)](#HGWeb..clientSocketConnection) ℗
        * [~replyNoPerm(socket, cmd)](#HGWeb..replyNoPerm) ℗
        * [~checkMyGuild(gId)](#HGWeb..checkMyGuild) ⇒ <code>boolean</code> ℗
        * [~checkPerm(userData, gId, cId, cmd)](#HGWeb..checkPerm) ⇒ <code>boolean</code> ℗
        * [~checkChannelPerm(userData, gId, cId, cmd)](#HGWeb..checkChannelPerm) ⇒ <code>boolean</code> ℗
        * [~makeMessage(uId, gId, cId, msg)](#HGWeb..makeMessage) ⇒ <code>Object</code> ℗
        * [~makeMember(m)](#HGWeb..makeMember) ⇒ <code>Object</code> ℗
        * [~fetchGuilds(userData, socket, [cb])](#HGWeb..fetchGuilds) : <code>HGWeb~SocketFunction</code> ℗
            * [~done(guilds, [err], [response])](#HGWeb..fetchGuilds..done) ℗
        * [~fetchMember(userData, socket, gId, mId, [cb])](#HGWeb..fetchMember) : <code>HGWeb~SocketFunction</code> ℗
        * [~fetchChannel(userData, socket, gId, cId, [cb])](#HGWeb..fetchChannel) : <code>HGWeb~SocketFunction</code> ℗
        * [~fetchGames(userData, socket, gId, [cb])](#HGWeb..fetchGames) : <code>HGWeb~SocketFunction</code> ℗
        * [~fetchDay(userData, socket, gId, [cb])](#HGWeb..fetchDay) : <code>HGWeb~SocketFunction</code> ℗
        * [~excludeMember(userData, socket, gId, mId, [cb])](#HGWeb..excludeMember) : <code>HGWeb~SocketFunction</code> ℗
        * [~includeMember(userData, socket, gId, mId, [cb])](#HGWeb..includeMember) : <code>HGWeb~SocketFunction</code> ℗
        * [~toggleOption(userData, socket, gId, option, value, extra, [cb])](#HGWeb..toggleOption) : <code>HGWeb~SocketFunction</code> ℗
        * [~createGame(userData, socket, gId, [cb])](#HGWeb..createGame) : <code>HGWeb~SocketFunction</code> ℗
        * [~resetGame(userData, socket, gId, cmd, [cb])](#HGWeb..resetGame) : <code>HGWeb~SocketFunction</code> ℗
        * [~startGame(userData, socket, gId, cId, [cb])](#HGWeb..startGame) : <code>HGWeb~SocketFunction</code> ℗
        * [~startAutoplay(userData, socket, gId, cId, [cb])](#HGWeb..startAutoplay) : <code>HGWeb~SocketFunction</code> ℗
        * [~nextDay(userData, socket, gId, cId, [cb])](#HGWeb..nextDay) : <code>HGWeb~SocketFunction</code> ℗
        * [~endGame(userData, socket, gId, [cb])](#HGWeb..endGame) : <code>HGWeb~SocketFunction</code> ℗
        * [~pauseAutoplay(userData, socket, gId, [cb])](#HGWeb..pauseAutoplay) : <code>HGWeb~SocketFunction</code> ℗
        * [~editTeam(userData, socket, gId, cmd, one, two, [cb])](#HGWeb..editTeam) : <code>HGWeb~SocketFunction</code> ℗
        * [~createEvent(userData, socket, gId, type, message, nV, nA, oV, oA, kV, kA, wV, wA, [cb])](#HGWeb..createEvent) : <code>HGWeb~SocketFunction</code> ℗
        * [~createMajorEvent(userData, socket, gId, type, data, name, [cb])](#HGWeb..createMajorEvent) : <code>HGWeb~SocketFunction</code> ℗
        * [~editMajorEvent(userData, socket, gId, type, search, data, name, newName, [cb])](#HGWeb..editMajorEvent) : <code>HGWeb~SocketFunction</code> ℗
        * [~removeEvent(userData, socket, gId, type, event, [cb])](#HGWeb..removeEvent) : <code>HGWeb~SocketFunction</code> ℗
        * [~toggleEvent(userData, socket, gId, type, subCat, event, value, [cb])](#HGWeb..toggleEvent) : <code>HGWeb~SocketFunction</code> ℗
        * [~forcePlayerState(userData, socket, gId, list, state, [text], [persists], [cb])](#HGWeb..forcePlayerState) : <code>HGWeb~SocketFunction</code> ℗
        * [~basicCB](#HGWeb..basicCB) : <code>function</code>

<a name="new_HGWeb_new"></a>

### new HGWeb(hg)

| Param | Type | Description |
| --- | --- | --- |
| hg | [<code>HungryGames</code>](#HungryGames) | The hungry games object that we will be controlling. |

<a name="HGWeb+shutdown"></a>

### hgWeb.shutdown([skipSave])
Causes a full shutdown of all servers.

**Kind**: instance method of [<code>HGWeb</code>](#HGWeb)  
**Access**: public  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [skipSave] | <code>boolean</code> | <code>false</code> | Skip writing data to file. |

<a name="HGWeb+getNumClients"></a>

### hgWeb.getNumClients() ⇒ <code>number</code>
Returns the number of connected clients that are not siblings.

**Kind**: instance method of [<code>HGWeb</code>](#HGWeb)  
**Returns**: <code>number</code> - Number of sockets.  
**Access**: public  
<a name="HGWeb+dayStateChange"></a>

### hgWeb.dayStateChange(gId)
This gets fired whenever the day state of any game changes in the hungry
games. This then notifies all clients that the state changed, if they care
about the guild.

**Kind**: instance method of [<code>HGWeb</code>](#HGWeb)  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| gId | <code>string</code> | Guild id of the state change. |

<a name="HGWeb..sockets"></a>

### HGWeb~sockets : <code>Object.&lt;Socket&gt;</code> ℗
Map of all currently connected sockets.

**Kind**: inner property of [<code>HGWeb</code>](#HGWeb)  
**Access**: private  
<a name="HGWeb..siblingSockets"></a>

### HGWeb~siblingSockets : <code>Object.&lt;Socket&gt;</code> ℗
Map of all sockets connected that are siblings.

**Kind**: inner property of [<code>HGWeb</code>](#HGWeb)  
**Access**: private  
<a name="HGWeb..startClient"></a>

### HGWeb~startClient() ℗
Start a socketio client connection to the primary running server.

**Kind**: inner method of [<code>HGWeb</code>](#HGWeb)  
**Access**: private  
<a name="HGWeb..handler"></a>

### HGWeb~handler(req, res) ℗
Handler for all http requests. Should never be called.

**Kind**: inner method of [<code>HGWeb</code>](#HGWeb)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| req | <code>http.IncomingMessage</code> | The client's request. |
| res | <code>http.ServerResponse</code> | Our response to the client. |

<a name="HGWeb..socketConnection"></a>

### HGWeb~socketConnection(socket) ℗
Handler for a new socket connecting.

**Kind**: inner method of [<code>HGWeb</code>](#HGWeb)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| socket | <code>socketIo~Socket</code> | The socket.io socket that connected. |

<a name="HGWeb..socketConnection..callSocketFunction"></a>

#### socketConnection~callSocketFunction(func, args, [forward]) ℗
Calls the functions with added arguments, and copies the request to all
sibling clients.

**Kind**: inner method of [<code>socketConnection</code>](#HGWeb..socketConnection)  
**Access**: private  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| func | <code>function</code> |  | The function to call. |
| args | <code>Array.&lt;\*&gt;</code> |  | Array of arguments to send to function. |
| [forward] | <code>boolean</code> | <code>true</code> | Forward this request directly to all siblings. |

<a name="HGWeb..clientSocketConnection"></a>

### HGWeb~clientSocketConnection(socket) ℗
Handler for connecting as a client to the server.

**Kind**: inner method of [<code>HGWeb</code>](#HGWeb)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| socket | <code>socketIo~Socket</code> | The socket.io socket that connected. |

<a name="HGWeb..replyNoPerm"></a>

### HGWeb~replyNoPerm(socket, cmd) ℗
Send a message to the given socket informing the client that the command
they attempted failed due to insufficient permission.

**Kind**: inner method of [<code>HGWeb</code>](#HGWeb)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| socket | <code>Socket</code> | The socket.io socket to reply on. |
| cmd | <code>string</code> | THe command the client attempted. |

<a name="HGWeb..checkMyGuild"></a>

### HGWeb~checkMyGuild(gId) ⇒ <code>boolean</code> ℗
Checks if the current shard is responsible for the requested guild.

**Kind**: inner method of [<code>HGWeb</code>](#HGWeb)  
**Returns**: <code>boolean</code> - True if this shard has this guild.  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| gId | <code>number</code> \| <code>string</code> | The guild id to check. |

<a name="HGWeb..checkPerm"></a>

### HGWeb~checkPerm(userData, gId, cId, cmd) ⇒ <code>boolean</code> ℗
Check that the given user has permission to manage the games in the given
guild.

**Kind**: inner method of [<code>HGWeb</code>](#HGWeb)  
**Returns**: <code>boolean</code> - Whther the user has permission or not to manage the
hungry games in the given guild.  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| userData | <code>UserData</code> | The user to check. |
| gId | <code>string</code> | The guild id to check against. |
| cId | <code>string</code> | The channel id to check against. |
| cmd | <code>string</code> | The command being attempted. |

<a name="HGWeb..checkChannelPerm"></a>

### HGWeb~checkChannelPerm(userData, gId, cId, cmd) ⇒ <code>boolean</code> ℗
Check that the given user has permission to see and send messages in the
given channel, as well as manage the games in the given guild.

**Kind**: inner method of [<code>HGWeb</code>](#HGWeb)  
**Returns**: <code>boolean</code> - Whther the user has permission or not to manage the
hungry games in the given guild and has permission to send messages in the
given channel.  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| userData | <code>UserData</code> | The user to check. |
| gId | <code>string</code> | The guild id of the guild that contains the channel. |
| cId | <code>string</code> | The channel id to check against. |
| cmd | <code>string</code> | The command being attempted to check permisisons for. |

<a name="HGWeb..makeMessage"></a>

### HGWeb~makeMessage(uId, gId, cId, msg) ⇒ <code>Object</code> ℗
Forms a Discord~Message similar object from given IDs.

**Kind**: inner method of [<code>HGWeb</code>](#HGWeb)  
**Returns**: <code>Object</code> - The created message-like object.  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| uId | <code>string</code> | The id of the user who wrote this message. |
| gId | <code>string</code> | The id of the guild this message is in. |
| cId | <code>string</code> | The id of the channel this message was 'sent' in. |
| msg | <code>string</code> | The message content. |

<a name="HGWeb..makeMember"></a>

### HGWeb~makeMember(m) ⇒ <code>Object</code> ℗
Strips a Discord~GuildMember to only the necessary data that a client will
need.

**Kind**: inner method of [<code>HGWeb</code>](#HGWeb)  
**Returns**: <code>Object</code> - The minimal member.  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| m | <code>Discord~GuildMember</code> | The guild member to strip the data from. |

<a name="HGWeb..fetchGuilds"></a>

### HGWeb~fetchGuilds(userData, socket, [cb]) : <code>HGWeb~SocketFunction</code> ℗
Fetch all relevant data for all mutual guilds with the user and send it to
the user.

**Kind**: inner method of [<code>HGWeb</code>](#HGWeb)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| userData | <code>Object</code> | The current user's session data. |
| socket | <code>socketIo~Socket</code> | The socket connection to reply on. |
| [cb] | <code>basicCB</code> | Callback that fires once the requested action is complete, or has failed. |

<a name="HGWeb..fetchGuilds..done"></a>

#### fetchGuilds~done(guilds, [err], [response]) ℗
The callback for each response with the requested data. Replies to the
user once all requests have replied.

**Kind**: inner method of [<code>fetchGuilds</code>](#HGWeb..fetchGuilds)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| guilds | <code>string</code> \| <code>Object</code> | Either the guild data to send to the user, or 'guilds' if this is a reply from a sibling client. |
| [err] | <code>string</code> | The error that occurred, or null if no error. |
| [response] | <code>Object</code> | The guild data if `guilds` equals 'guilds'. |

<a name="HGWeb..fetchMember"></a>

### HGWeb~fetchMember(userData, socket, gId, mId, [cb]) : <code>HGWeb~SocketFunction</code> ℗
Fetch data about a member of a guild.

**Kind**: inner method of [<code>HGWeb</code>](#HGWeb)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| userData | <code>Object</code> | The current user's session data. |
| socket | <code>socketIo~Socket</code> | The socket connection to reply on. |
| gId | <code>number</code> \| <code>string</code> | The guild id to look at. |
| mId | <code>number</code> \| <code>string</code> | The member's id to lookup. |
| [cb] | <code>basicCB</code> | Callback that fires once the requested action is complete, or has failed. |

<a name="HGWeb..fetchChannel"></a>

### HGWeb~fetchChannel(userData, socket, gId, cId, [cb]) : <code>HGWeb~SocketFunction</code> ℗
Fetch data about a channel of a guild.

**Kind**: inner method of [<code>HGWeb</code>](#HGWeb)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| userData | <code>Object</code> | The current user's session data. |
| socket | <code>socketIo~Socket</code> | The socket connection to reply on. |
| gId | <code>number</code> \| <code>string</code> | The guild id to look at. |
| cId | <code>number</code> \| <code>string</code> | The channel's id to lookup. |
| [cb] | <code>basicCB</code> | Callback that fires once the requested action is complete, or has failed. |

<a name="HGWeb..fetchGames"></a>

### HGWeb~fetchGames(userData, socket, gId, [cb]) : <code>HGWeb~SocketFunction</code> ℗
Fetch all game data within a guild.

**Kind**: inner method of [<code>HGWeb</code>](#HGWeb)  
**Access**: private  
**See**: [HungryGames.getGame](HungryGames.getGame)  

| Param | Type | Description |
| --- | --- | --- |
| userData | <code>Object</code> | The current user's session data. |
| socket | <code>socketIo~Socket</code> | The socket connection to reply on. |
| gId | <code>number</code> \| <code>string</code> | The guild id to look at. |
| [cb] | <code>basicCB</code> | Callback that fires once the requested action is complete, or has failed. |

<a name="HGWeb..fetchDay"></a>

### HGWeb~fetchDay(userData, socket, gId, [cb]) : <code>HGWeb~SocketFunction</code> ℗
Fetch the updated game's day information.

**Kind**: inner method of [<code>HGWeb</code>](#HGWeb)  
**Access**: private  
**See**: [HungryGames.getGame](HungryGames.getGame)  

| Param | Type | Description |
| --- | --- | --- |
| userData | <code>Object</code> | The current user's session data. |
| socket | <code>socketIo~Socket</code> | The socket connection to reply on. |
| gId | <code>number</code> \| <code>string</code> | The guild id to look at. |
| [cb] | <code>basicCB</code> | Callback that fires once the requested action is complete, or has failed. |

<a name="HGWeb..excludeMember"></a>

### HGWeb~excludeMember(userData, socket, gId, mId, [cb]) : <code>HGWeb~SocketFunction</code> ℗
Exclude a member from the Games.

**Kind**: inner method of [<code>HGWeb</code>](#HGWeb)  
**Access**: private  
**See**: [HungryGames.excludeUsers](HungryGames.excludeUsers)  

| Param | Type | Description |
| --- | --- | --- |
| userData | <code>Object</code> | The current user's session data. |
| socket | <code>socketIo~Socket</code> | The socket connection to reply on. |
| gId | <code>number</code> \| <code>string</code> | The guild id to look at. |
| mId | <code>number</code> \| <code>string</code> | The member id to exclude. |
| [cb] | <code>basicCB</code> | Callback that fires once the requested action is complete, or has failed. |

<a name="HGWeb..includeMember"></a>

### HGWeb~includeMember(userData, socket, gId, mId, [cb]) : <code>HGWeb~SocketFunction</code> ℗
Include a member in the Games.

**Kind**: inner method of [<code>HGWeb</code>](#HGWeb)  
**Access**: private  
**See**: [HungryGames.includeUsers](HungryGames.includeUsers)  

| Param | Type | Description |
| --- | --- | --- |
| userData | <code>Object</code> | The current user's session data. |
| socket | <code>socketIo~Socket</code> | The socket connection to reply on. |
| gId | <code>number</code> \| <code>string</code> | The guild id to look at. |
| mId | <code>number</code> \| <code>string</code> | The member id to include. |
| [cb] | <code>basicCB</code> | Callback that fires once the requested action is complete, or has failed. |

<a name="HGWeb..toggleOption"></a>

### HGWeb~toggleOption(userData, socket, gId, option, value, extra, [cb]) : <code>HGWeb~SocketFunction</code> ℗
Toggle an option in the Games.

**Kind**: inner method of [<code>HGWeb</code>](#HGWeb)  
**Access**: private  
**See**: [HungryGames.setOption](HungryGames.setOption)  

| Param | Type | Description |
| --- | --- | --- |
| userData | <code>Object</code> | The current user's session data. |
| socket | <code>socketIo~Socket</code> | The socket connection to reply on. |
| gId | <code>number</code> \| <code>string</code> | The guild id to look at. |
| option | <code>string</code> | The option to change. |
| value | <code>string</code> \| <code>number</code> | The value to set option to. |
| extra | <code>string</code> | The extra text if the option is in an object. |
| [cb] | <code>basicCB</code> | Callback that fires once the requested action is complete, or has failed. |

<a name="HGWeb..createGame"></a>

### HGWeb~createGame(userData, socket, gId, [cb]) : <code>HGWeb~SocketFunction</code> ℗
Create a Game.

**Kind**: inner method of [<code>HGWeb</code>](#HGWeb)  
**Access**: private  
**See**: [HungryGames.createGame](HungryGames.createGame)  

| Param | Type | Description |
| --- | --- | --- |
| userData | <code>Object</code> | The current user's session data. |
| socket | <code>socketIo~Socket</code> | The socket connection to reply on. |
| gId | <code>number</code> \| <code>string</code> | The guild id to look at. |
| [cb] | <code>basicCB</code> | Callback that fires once the requested action is complete, or has failed. |

<a name="HGWeb..resetGame"></a>

### HGWeb~resetGame(userData, socket, gId, cmd, [cb]) : <code>HGWeb~SocketFunction</code> ℗
Reset game data.

**Kind**: inner method of [<code>HGWeb</code>](#HGWeb)  
**Access**: private  
**See**: [HungryGames.resetGame](HungryGames.resetGame)  

| Param | Type | Description |
| --- | --- | --- |
| userData | <code>Object</code> | The current user's session data. |
| socket | <code>socketIo~Socket</code> | The socket connection to reply on. |
| gId | <code>number</code> \| <code>string</code> | The guild id to look at. |
| cmd | <code>string</code> | Command specifying what data to delete. |
| [cb] | <code>basicCB</code> | Callback that fires once the requested action is complete, or has failed. |

<a name="HGWeb..startGame"></a>

### HGWeb~startGame(userData, socket, gId, cId, [cb]) : <code>HGWeb~SocketFunction</code> ℗
Start the game.

**Kind**: inner method of [<code>HGWeb</code>](#HGWeb)  
**Access**: private  
**See**: [HungryGames.startGame](HungryGames.startGame)  

| Param | Type | Description |
| --- | --- | --- |
| userData | <code>Object</code> | The current user's session data. |
| socket | <code>socketIo~Socket</code> | The socket connection to reply on. |
| gId | <code>number</code> \| <code>string</code> | The guild id to look at. |
| cId | <code>number</code> \| <code>string</code> | Channel to start the game in. |
| [cb] | <code>basicCB</code> | Callback that fires once the requested action is complete, or has failed. |

<a name="HGWeb..startAutoplay"></a>

### HGWeb~startAutoplay(userData, socket, gId, cId, [cb]) : <code>HGWeb~SocketFunction</code> ℗
Enable autoplay.

**Kind**: inner method of [<code>HGWeb</code>](#HGWeb)  
**Access**: private  
**See**: [HungryGames.startAutoplay](HungryGames.startAutoplay)  

| Param | Type | Description |
| --- | --- | --- |
| userData | <code>Object</code> | The current user's session data. |
| socket | <code>socketIo~Socket</code> | The socket connection to reply on. |
| gId | <code>number</code> \| <code>string</code> | The guild id to look at. |
| cId | <code>number</code> \| <code>string</code> | Channel to send the messages in. |
| [cb] | <code>basicCB</code> | Callback that fires once the requested action is complete, or has failed. |

<a name="HGWeb..nextDay"></a>

### HGWeb~nextDay(userData, socket, gId, cId, [cb]) : <code>HGWeb~SocketFunction</code> ℗
Start the next day.

**Kind**: inner method of [<code>HGWeb</code>](#HGWeb)  
**Access**: private  
**See**: [HungryGames.nextDay](HungryGames.nextDay)  

| Param | Type | Description |
| --- | --- | --- |
| userData | <code>Object</code> | The current user's session data. |
| socket | <code>socketIo~Socket</code> | The socket connection to reply on. |
| gId | <code>number</code> \| <code>string</code> | The guild id to look at. |
| cId | <code>number</code> \| <code>string</code> | Channel to send the messages in. |
| [cb] | <code>basicCB</code> | Callback that fires once the requested action is complete, or has failed. |

<a name="HGWeb..endGame"></a>

### HGWeb~endGame(userData, socket, gId, [cb]) : <code>HGWeb~SocketFunction</code> ℗
End the game.

**Kind**: inner method of [<code>HGWeb</code>](#HGWeb)  
**Access**: private  
**See**: [HungryGames.endGame](HungryGames.endGame)  

| Param | Type | Description |
| --- | --- | --- |
| userData | <code>Object</code> | The current user's session data. |
| socket | <code>socketIo~Socket</code> | The socket connection to reply on. |
| gId | <code>number</code> \| <code>string</code> | The guild id to look at. |
| [cb] | <code>basicCB</code> | Callback that fires once the requested action is complete, or has failed. |

<a name="HGWeb..pauseAutoplay"></a>

### HGWeb~pauseAutoplay(userData, socket, gId, [cb]) : <code>HGWeb~SocketFunction</code> ℗
Disable autoplay.

**Kind**: inner method of [<code>HGWeb</code>](#HGWeb)  
**Access**: private  
**See**: [HungryGames.pauseAutoplay](HungryGames.pauseAutoplay)  

| Param | Type | Description |
| --- | --- | --- |
| userData | <code>Object</code> | The current user's session data. |
| socket | <code>socketIo~Socket</code> | The socket connection to reply on. |
| gId | <code>number</code> \| <code>string</code> | The guild id to look at. |
| [cb] | <code>basicCB</code> | Callback that fires once the requested action is complete, or has failed. |

<a name="HGWeb..editTeam"></a>

### HGWeb~editTeam(userData, socket, gId, cmd, one, two, [cb]) : <code>HGWeb~SocketFunction</code> ℗
Edit the teams.

**Kind**: inner method of [<code>HGWeb</code>](#HGWeb)  
**Access**: private  
**See**: [HungryGames.editTeam](HungryGames.editTeam)  

| Param | Type | Description |
| --- | --- | --- |
| userData | <code>Object</code> | The current user's session data. |
| socket | <code>socketIo~Socket</code> | The socket connection to reply on. |
| gId | <code>number</code> \| <code>string</code> | The guild id to look at. |
| cmd | <code>string</code> | The command to run. |
| one | <code>string</code> | The first argument. |
| two | <code>string</code> | The second argument. |
| [cb] | <code>basicCB</code> | Callback that fires once the requested action is complete, or has failed. |

<a name="HGWeb..createEvent"></a>

### HGWeb~createEvent(userData, socket, gId, type, message, nV, nA, oV, oA, kV, kA, wV, wA, [cb]) : <code>HGWeb~SocketFunction</code> ℗
Create a game event.

**Kind**: inner method of [<code>HGWeb</code>](#HGWeb)  
**Access**: private  
**See**: [HungryGames.createEvent](HungryGames.createEvent)  

| Param | Type | Description |
| --- | --- | --- |
| userData | <code>Object</code> | The current user's session data. |
| socket | <code>socketIo~Socket</code> | The socket connection to reply on. |
| gId | <code>number</code> \| <code>string</code> | The guild id to look at. |
| type | <code>string</code> | The type of event. |
| message | <code>string</code> | The message of the event. |
| nV | <code>string</code> | Number of victims. |
| nA | <code>string</code> | Number of attackers. |
| oV | <code>string</code> | Outcome of victims. |
| oA | <code>string</code> | Outcome of attackers. |
| kV | <code>string</code> | Do the victims kill. |
| kA | <code>string</code> | Do the attackers kill. |
| wV | <code>Object</code> | The weapon information for this event. |
| wA | <code>Object</code> | The weapon information for this event. |
| [cb] | <code>basicCB</code> | Callback that fires once the requested action is complete, or has failed. |

<a name="HGWeb..createMajorEvent"></a>

### HGWeb~createMajorEvent(userData, socket, gId, type, data, name, [cb]) : <code>HGWeb~SocketFunction</code> ℗
Create a larger game event. Either Arena or Weapon at this point. If
message or weapon name already exists, this will instead edit the event.

**Kind**: inner method of [<code>HGWeb</code>](#HGWeb)  
**Access**: private  
**See**: [HungryGames.addMajorEvent](HungryGames.addMajorEvent)  

| Param | Type | Description |
| --- | --- | --- |
| userData | <code>Object</code> | The current user's session data. |
| socket | <code>socketIo~Socket</code> | The socket connection to reply on. |
| gId | <code>number</code> \| <code>string</code> | The guild id to look at. |
| type | <code>string</code> | The type of event. |
| data | [<code>ArenaEvent</code>](#HungryGames..ArenaEvent) \| [<code>WeaponEvent</code>](#HungryGames..WeaponEvent) | The event data. |
| name | <code>string</code> | The name of the weapon if this is a weapon event. |
| [cb] | <code>basicCB</code> | Callback that fires once the requested action is complete, or has failed. |

<a name="HGWeb..editMajorEvent"></a>

### HGWeb~editMajorEvent(userData, socket, gId, type, search, data, name, newName, [cb]) : <code>HGWeb~SocketFunction</code> ℗
Delete a larger game event. Either Arena or Weapon at this point.

**Kind**: inner method of [<code>HGWeb</code>](#HGWeb)  
**Access**: private  
**See**: [HungryGames.editMajorEvent](HungryGames.editMajorEvent)  

| Param | Type | Description |
| --- | --- | --- |
| userData | <code>Object</code> | The current user's session data. |
| socket | <code>socketIo~Socket</code> | The socket connection to reply on. |
| gId | <code>number</code> \| <code>string</code> | The guild id to look at. |
| type | <code>string</code> | The type of event. |
| search | [<code>ArenaEvent</code>](#HungryGames..ArenaEvent) \| [<code>WeaponEvent</code>](#HungryGames..WeaponEvent) | The event data to find to edit. |
| data | [<code>ArenaEvent</code>](#HungryGames..ArenaEvent) \| [<code>WeaponEvent</code>](#HungryGames..WeaponEvent) | The event data to set the matched searches to. |
| name | <code>string</code> | The internal name of the weapon to find. |
| newName | <code>string</code> | The new internal name of the weapon. |
| [cb] | <code>basicCB</code> | Callback that fires once the requested action is complete, or has failed. |

<a name="HGWeb..removeEvent"></a>

### HGWeb~removeEvent(userData, socket, gId, type, event, [cb]) : <code>HGWeb~SocketFunction</code> ℗
Remove a game event.

**Kind**: inner method of [<code>HGWeb</code>](#HGWeb)  
**Access**: private  
**See**: [HungryGames.removeEvent](HungryGames.removeEvent)  

| Param | Type | Description |
| --- | --- | --- |
| userData | <code>Object</code> | The current user's session data. |
| socket | <code>socketIo~Socket</code> | The socket connection to reply on. |
| gId | <code>number</code> \| <code>string</code> | The guild id to look at. |
| type | <code>string</code> | The type of event. |
| event | [<code>Event</code>](#HungryGames..Event) | The game event to remove. |
| [cb] | <code>basicCB</code> | Callback that fires once the requested action is complete, or has failed. |

<a name="HGWeb..toggleEvent"></a>

### HGWeb~toggleEvent(userData, socket, gId, type, subCat, event, value, [cb]) : <code>HGWeb~SocketFunction</code> ℗
Enable or disable an event without deleting it.

**Kind**: inner method of [<code>HGWeb</code>](#HGWeb)  
**Access**: private  
**See**: [HungryGames.toggleEvent](HungryGames.toggleEvent)  

| Param | Type | Description |
| --- | --- | --- |
| userData | <code>Object</code> | The current user's session data. |
| socket | <code>socketIo-Socket</code> | The socket connection to reply on. |
| gId | <code>number</code> \| <code>string</code> | The guild id to run this command on. |
| type | <code>string</code> | The type of event that we are toggling. |
| subCat | <code>string</code> | The subcategory if necessary. |
| event | [<code>Event</code>](#HungryGames..Event) \| [<code>ArenaEvent</code>](#HungryGames..ArenaEvent) \| [<code>WeaponEvent</code>](#HungryGames..WeaponEvent) | The event to toggle. |
| value | <code>boolean</code> | Set the enabled value instead of toggling. |
| [cb] | <code>basicCB</code> | Callback that fires once the requested action is complete. |

<a name="HGWeb..forcePlayerState"></a>

### HGWeb~forcePlayerState(userData, socket, gId, list, state, [text], [persists], [cb]) : <code>HGWeb~SocketFunction</code> ℗
Force a player in the game to end a day in a certain state.

**Kind**: inner method of [<code>HGWeb</code>](#HGWeb)  
**Access**: private  
**See**: [HungryGames.forcePlayerState](HungryGames.forcePlayerState)  

| Param | Type | Description |
| --- | --- | --- |
| userData | <code>Object</code> | The current user's session data. |
| socket | <code>socketIo-Socket</code> | The socket connection to reply on. |
| gId | <code>number</code> \| <code>string</code> | The guild id to run this command on. |
| list | <code>Array.&lt;string&gt;</code> | The list of user IDs of the players to effect. |
| state | <code>string</code> | The forced state. |
| [text] | <code>string</code> | The message to show in the games as a result of this command. |
| [persists] | <code>boolean</code> | Will this state be forced until the game ends. |
| [cb] | <code>basicCB</code> | Callback that fires once the requested action is complete. |

<a name="HGWeb..basicCB"></a>

### HGWeb~basicCB : <code>function</code>
Basic callback with single argument. The argument is null if there is no
error, or a string if there was an error.

**Kind**: inner typedef of [<code>HGWeb</code>](#HGWeb)  

| Param | Type | Description |
| --- | --- | --- |
| err | <code>string</code> | The error response. |

<a name="WebProxy"></a>

## WebProxy ⇐ [<code>SubModule</code>](#SubModule)
Proxy for account authentication.

**Kind**: global class  
**Extends**: [<code>SubModule</code>](#SubModule)  

* [WebProxy](#WebProxy) ⇐ [<code>SubModule</code>](#SubModule)
    * _instance_
        * [.helpMessage](#SubModule+helpMessage) : <code>string</code> \| <code>Discord~MessageEmbed</code>
        * *[.postPrefix](#SubModule+postPrefix) : <code>string</code>*
        * [.Discord](#SubModule+Discord) : <code>Discord</code>
        * [.client](#SubModule+client) : <code>Discord~Client</code>
        * [.command](#SubModule+command) : [<code>Command</code>](#Command)
        * [.common](#SubModule+common) : [<code>Common</code>](#Common)
        * [.bot](#SubModule+bot) : [<code>SpikeyBot</code>](#SpikeyBot)
        * *[.myName](#SubModule+myName) : <code>string</code>*
        * [.initialized](#SubModule+initialized) : <code>boolean</code>
        * [.commit](#SubModule+commit) : <code>string</code>
        * [.loadTime](#SubModule+loadTime) : <code>number</code>
        * [.shutdown([skipSave])](#WebProxy+shutdown)
        * [.initialize()](#SubModule+initialize)
        * [.begin(Discord, client, command, common, bot)](#SubModule+begin)
        * [.end()](#SubModule+end)
        * [.log(msg)](#SubModule+log)
        * [.debug(msg)](#SubModule+debug)
        * [.warn(msg)](#SubModule+warn)
        * [.error(msg)](#SubModule+error)
        * *[.save([opt])](#SubModule+save)*
        * [.unloadable()](#SubModule+unloadable) ⇒ <code>boolean</code>
    * _inner_
        * [~sqlCon](#WebProxy..sqlCon) : <code>sql.ConnectionConfig</code> ℗
        * [~loginInfo](#WebProxy..loginInfo) : [<code>Object.&lt;loginState&gt;</code>](#loginState) ℗
        * [~sockets](#WebProxy..sockets) : <code>Object.&lt;Socket&gt;</code> ℗
        * [~tokenHost](#WebProxy..tokenHost) : <code>Object</code> ℗
        * [~apiHost](#WebProxy..apiHost) : <code>Object</code> ℗
        * [~connectSQL()](#WebProxy..connectSQL) ℗
        * [~purgeSessions()](#WebProxy..purgeSessions) ℗
        * [~handler(req, res)](#WebProxy..handler) ℗
        * [~socketConnection(socket)](#WebProxy..socketConnection) ℗
            * [~receivedLoginInfo(data)](#WebProxy..socketConnection..receivedLoginInfo) ℗
        * [~fetchIdentity(loginInfo, cb)](#WebProxy..fetchIdentity) ℗
        * [~apiRequest(loginInfo, path, cb)](#WebProxy..apiRequest) ℗
        * [~discordRequest(data, cb, host)](#WebProxy..discordRequest) ℗
        * [~makeRefreshTimeout(loginInfo, cb)](#WebProxy..makeRefreshTimeout) ℗
        * [~refreshToken(refreshToken, cb)](#WebProxy..refreshToken) ℗
        * [~authorizeRequest(code, cb)](#WebProxy..authorizeRequest) ℗

<a name="SubModule+helpMessage"></a>

### webProxy.helpMessage : <code>string</code> \| <code>Discord~MessageEmbed</code>
The help message to show the user in the main help message.

**Kind**: instance property of [<code>WebProxy</code>](#WebProxy)  
<a name="SubModule+postPrefix"></a>

### *webProxy.postPrefix : <code>string</code>*
The postfix for the global prefix for this subModule. Must be defined
before begin(), otherwise it is ignored.

**Kind**: instance abstract property of [<code>WebProxy</code>](#WebProxy)  
**Default**: <code>&quot;&quot;</code>  
<a name="SubModule+Discord"></a>

### webProxy.Discord : <code>Discord</code>
The current Discord object instance of the bot.

**Kind**: instance property of [<code>WebProxy</code>](#WebProxy)  
<a name="SubModule+client"></a>

### webProxy.client : <code>Discord~Client</code>
The current bot client.

**Kind**: instance property of [<code>WebProxy</code>](#WebProxy)  
<a name="SubModule+command"></a>

### webProxy.command : [<code>Command</code>](#Command)
The command object for registering command listeners.

**Kind**: instance property of [<code>WebProxy</code>](#WebProxy)  
<a name="SubModule+common"></a>

### webProxy.common : [<code>Common</code>](#Common)
The common object.

**Kind**: instance property of [<code>WebProxy</code>](#WebProxy)  
<a name="SubModule+bot"></a>

### webProxy.bot : [<code>SpikeyBot</code>](#SpikeyBot)
The parent SpikeyBot instance.

**Kind**: instance property of [<code>WebProxy</code>](#WebProxy)  
<a name="SubModule+myName"></a>

### *webProxy.myName : <code>string</code>*
The name of this submodule. Used for differentiating in the log. Should be
defined before begin().

**Kind**: instance abstract property of [<code>WebProxy</code>](#WebProxy)  
**Overrides**: [<code>myName</code>](#SubModule+myName)  
**Access**: protected  
<a name="SubModule+initialized"></a>

### webProxy.initialized : <code>boolean</code>
Has this subModule been initialized yet (Has begin() been called).

**Kind**: instance property of [<code>WebProxy</code>](#WebProxy)  
**Default**: <code>false</code>  
**Access**: protected  
**Read only**: true  
<a name="SubModule+commit"></a>

### webProxy.commit : <code>string</code>
The commit at HEAD at the time this module was loaded. Essentially the
version of this submodule.

**Kind**: instance constant of [<code>WebProxy</code>](#WebProxy)  
**Access**: public  
<a name="SubModule+loadTime"></a>

### webProxy.loadTime : <code>number</code>
The time at which this madule was loaded for use in checking if the module
needs to be reloaded because the file has been modified since loading.

**Kind**: instance constant of [<code>WebProxy</code>](#WebProxy)  
**Access**: public  
<a name="WebProxy+shutdown"></a>

### webProxy.shutdown([skipSave])
Causes a full shutdown of all servers.

**Kind**: instance method of [<code>WebProxy</code>](#WebProxy)  
**Overrides**: [<code>shutdown</code>](#SubModule+shutdown)  
**Access**: public  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [skipSave] | <code>boolean</code> | <code>false</code> | Skip writing data to file. |

<a name="SubModule+initialize"></a>

### webProxy.initialize()
The function called at the end of begin() for further initialization
specific to the subModule. Must be defined before begin() is called.

**Kind**: instance method of [<code>WebProxy</code>](#WebProxy)  
**Overrides**: [<code>initialize</code>](#SubModule+initialize)  
**Access**: protected  
<a name="SubModule+begin"></a>

### webProxy.begin(Discord, client, command, common, bot)
Initialize this submodule.

**Kind**: instance method of [<code>WebProxy</code>](#WebProxy)  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| Discord | <code>Discord</code> | The Discord object for the API library. |
| client | <code>Discord~Client</code> | The client that represents this bot. |
| command | [<code>Command</code>](#Command) | The command instance in which to register command listeners. |
| common | [<code>Common</code>](#Common) | Class storing common functions. |
| bot | [<code>SpikeyBot</code>](#SpikeyBot) | The parent SpikeyBot instance. |

<a name="SubModule+end"></a>

### webProxy.end()
Trigger subModule to shutdown and get ready for process terminating.

**Kind**: instance method of [<code>WebProxy</code>](#WebProxy)  
**Access**: public  
<a name="SubModule+log"></a>

### webProxy.log(msg)
Log using common.log, but automatically set name.

**Kind**: instance method of [<code>WebProxy</code>](#WebProxy)  
**Access**: protected  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>string</code> | The message to log. |

<a name="SubModule+debug"></a>

### webProxy.debug(msg)
Log using common.logDebug, but automatically set name.

**Kind**: instance method of [<code>WebProxy</code>](#WebProxy)  
**Access**: protected  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>string</code> | The message to log. |

<a name="SubModule+warn"></a>

### webProxy.warn(msg)
Log using common.logWarning, but automatically set name.

**Kind**: instance method of [<code>WebProxy</code>](#WebProxy)  
**Access**: protected  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>string</code> | The message to log. |

<a name="SubModule+error"></a>

### webProxy.error(msg)
Log using common.error, but automatically set name.

**Kind**: instance method of [<code>WebProxy</code>](#WebProxy)  
**Access**: protected  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>string</code> | The message to log. |

<a name="SubModule+save"></a>

### *webProxy.save([opt])*
Saves all data to files necessary for saving current state.

**Kind**: instance abstract method of [<code>WebProxy</code>](#WebProxy)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [opt] | <code>string</code> | <code>&quot;&#x27;sync&#x27;&quot;</code> | Can be 'async', otherwise defaults to synchronous. |

<a name="SubModule+unloadable"></a>

### webProxy.unloadable() ⇒ <code>boolean</code>
Check if this module is in a state that is ready to be unloaded. If false
is returned, this module should not be unloaded and doing such may risk
putting the module into an uncontrollable state.

**Kind**: instance method of [<code>WebProxy</code>](#WebProxy)  
**Overrides**: [<code>unloadable</code>](#SubModule+unloadable)  
**Returns**: <code>boolean</code> - True if can be unloaded, false if cannot.  
**Access**: public  
<a name="WebProxy..sqlCon"></a>

### WebProxy~sqlCon : <code>sql.ConnectionConfig</code> ℗
The object describing the connection with the SQL server.

**Kind**: inner property of [<code>WebProxy</code>](#WebProxy)  
**Access**: private  
<a name="WebProxy..loginInfo"></a>

### WebProxy~loginInfo : [<code>Object.&lt;loginState&gt;</code>](#loginState) ℗
Stores the tokens and associated data for all clients connected while data
is valid. Mapped by session id.

**Kind**: inner property of [<code>WebProxy</code>](#WebProxy)  
**Access**: private  
<a name="WebProxy..sockets"></a>

### WebProxy~sockets : <code>Object.&lt;Socket&gt;</code> ℗
Map of all currently connected sockets.

**Kind**: inner property of [<code>WebProxy</code>](#WebProxy)  
**Access**: private  
<a name="WebProxy..tokenHost"></a>

### WebProxy~tokenHost : <code>Object</code> ℗
The url to send a received `code` to via `POST` to receive a user's
tokens.

**Kind**: inner constant of [<code>WebProxy</code>](#WebProxy)  
**Default**: <code>{&quot;protocol&quot;:&quot;https:&quot;,&quot;host&quot;:&quot;discordapp.com&quot;,&quot;path&quot;:&quot;/api/oauth2/token&quot;,&quot;method&quot;:&quot;POST&quot;}</code>  
**Access**: private  
<a name="WebProxy..apiHost"></a>

### WebProxy~apiHost : <code>Object</code> ℗
The url to send a request to the discord api.

**Kind**: inner constant of [<code>WebProxy</code>](#WebProxy)  
**Default**: <code>{&quot;protocol&quot;:&quot;https:&quot;,&quot;host&quot;:&quot;discordapp.com&quot;,&quot;path&quot;:&quot;/api&quot;,&quot;method&quot;:&quot;GET&quot;}</code>  
**Access**: private  
<a name="WebProxy..connectSQL"></a>

### WebProxy~connectSQL() ℗
Create initial connection with sql server.

**Kind**: inner method of [<code>WebProxy</code>](#WebProxy)  
**Access**: private  
<a name="WebProxy..purgeSessions"></a>

### WebProxy~purgeSessions() ℗
Purge stale data from loginInfo.

**Kind**: inner method of [<code>WebProxy</code>](#WebProxy)  
**Access**: private  
<a name="WebProxy..handler"></a>

### WebProxy~handler(req, res) ℗
Handler for all http requests. Should never be called.

**Kind**: inner method of [<code>WebProxy</code>](#WebProxy)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| req | <code>http.IncomingMessage</code> | The client's request. |
| res | <code>http.ServerResponse</code> | Our response to the client. |

<a name="WebProxy..socketConnection"></a>

### WebProxy~socketConnection(socket) ℗
Handler for a new socket connecting.

**Kind**: inner method of [<code>WebProxy</code>](#WebProxy)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| socket | <code>socketIo~Socket</code> | The socket.io socket that connected. |

<a name="WebProxy..socketConnection..receivedLoginInfo"></a>

#### socketConnection~receivedLoginInfo(data) ℗
Received the login credentials for user, lets store it for this
session,
and refresh the tokens when necessary.

**Kind**: inner method of [<code>socketConnection</code>](#WebProxy..socketConnection)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| data | <code>Object</code> | User data. |

<a name="WebProxy..fetchIdentity"></a>

### WebProxy~fetchIdentity(loginInfo, cb) ℗
Fetches the identity of the user we have the token of.

**Kind**: inner method of [<code>WebProxy</code>](#WebProxy)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| loginInfo | <code>LoginInfo</code> | The credentials of the session user. |
| cb | <code>singleCB</code> | The callback storing the user's data, or null if something went wrong. |

<a name="WebProxy..apiRequest"></a>

### WebProxy~apiRequest(loginInfo, path, cb) ℗
Formats a request to the discord api at the given path.

**Kind**: inner method of [<code>WebProxy</code>](#WebProxy)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| loginInfo | <code>LoginInfo</code> | The credentials of the user we are sending the request for. |
| path | <code>string</code> | The path for the api request to send. |
| cb | <code>basicCallback</code> | The response from the https request with error and data arguments. |

<a name="WebProxy..discordRequest"></a>

### WebProxy~discordRequest(data, cb, host) ℗
Send a https request to discord.

**Kind**: inner method of [<code>WebProxy</code>](#WebProxy)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| data | <code>Object</code> \| <code>string</code> | The data to send in the request. |
| cb | <code>basicCallback</code> | Callback with error, and data arguments. |
| host | <code>Object</code> | Request object to override the default with. |

<a name="WebProxy..makeRefreshTimeout"></a>

### WebProxy~makeRefreshTimeout(loginInfo, cb) ℗
Refreshes the given token once it expires.

**Kind**: inner method of [<code>WebProxy</code>](#WebProxy)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| loginInfo | <code>LoginInfo</code> | The credentials to refresh. |
| cb | <code>singleCB</code> | The callback that is fired storing the new credentials once they are refreshed. |

<a name="WebProxy..refreshToken"></a>

### WebProxy~refreshToken(refreshToken, cb) ℗
Request new credentials with refresh token from discord.

**Kind**: inner method of [<code>WebProxy</code>](#WebProxy)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| refreshToken | <code>string</code> | The refresh token used for refreshing credentials. |
| cb | <code>basicCallback</code> | The callback from the https request, with an error argument, and a data argument. |

<a name="WebProxy..authorizeRequest"></a>

### WebProxy~authorizeRequest(code, cb) ℗
Authenticate with the discord server using a login code.

**Kind**: inner method of [<code>WebProxy</code>](#WebProxy)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| code | <code>string</code> | The login code received from our client. |
| cb | <code>basicCallback</code> | The response from the https request with error and data arguments. |

<a name="WebSettings"></a>

## WebSettings ⇐ [<code>SubModule</code>](#SubModule)
Manages changing settings for the bot from a website.

**Kind**: global class  
**Extends**: [<code>SubModule</code>](#SubModule)  

* [WebSettings](#WebSettings) ⇐ [<code>SubModule</code>](#SubModule)
    * _instance_
        * [.helpMessage](#SubModule+helpMessage) : <code>string</code> \| <code>Discord~MessageEmbed</code>
        * *[.postPrefix](#SubModule+postPrefix) : <code>string</code>*
        * [.Discord](#SubModule+Discord) : <code>Discord</code>
        * [.client](#SubModule+client) : <code>Discord~Client</code>
        * [.command](#SubModule+command) : [<code>Command</code>](#Command)
        * [.common](#SubModule+common) : [<code>Common</code>](#Common)
        * [.bot](#SubModule+bot) : [<code>SpikeyBot</code>](#SpikeyBot)
        * [.myName](#SubModule+myName) : <code>string</code>
        * [.initialized](#SubModule+initialized) : <code>boolean</code>
        * [.commit](#SubModule+commit) : <code>string</code>
        * [.loadTime](#SubModule+loadTime) : <code>number</code>
        * [.initialize()](#SubModule+initialize)
        * [.begin(Discord, client, command, common, bot)](#SubModule+begin)
        * [.end()](#SubModule+end)
        * [.log(msg)](#SubModule+log)
        * [.debug(msg)](#SubModule+debug)
        * [.warn(msg)](#SubModule+warn)
        * [.error(msg)](#SubModule+error)
        * [.shutdown()](#SubModule+shutdown)
        * *[.save([opt])](#SubModule+save)*
        * [.unloadable()](#SubModule+unloadable) ⇒ <code>boolean</code>
    * _inner_
        * [~cmdScheduler](#WebSettings..cmdScheduler) : [<code>CmdScheduling</code>](#CmdScheduling) ℗
        * [~sockets](#WebSettings..sockets) : <code>Object.&lt;Socket&gt;</code> ℗
        * [~siblingSockets](#WebSettings..siblingSockets) : <code>Object.&lt;Socket&gt;</code> ℗
        * [~updateModuleReferences()](#WebSettings..updateModuleReferences) ℗
        * [~handleShutdown()](#WebSettings..handleShutdown) ℗
        * [~handleCommandRegistered(cmd, gId)](#WebSettings..handleCommandRegistered) ℗
        * [~handleCommandCancelled(cmdId, gId)](#WebSettings..handleCommandCancelled) ℗
        * [~handleSettingsChanged(gId, value, type, id, [id2])](#WebSettings..handleSettingsChanged) ℗
        * [~handleSettingsReset(gId)](#WebSettings..handleSettingsReset) ℗
        * [~startClient()](#WebSettings..startClient) ℗
        * [~handler(req, res)](#WebSettings..handler) ℗
        * [~getNumClients()](#WebSettings..getNumClients) ⇒ <code>number</code> ℗
        * [~socketConnection(socket)](#WebSettings..socketConnection) ℗
            * [~callSocketFunction(func, args, [forward])](#WebSettings..socketConnection..callSocketFunction) ℗
        * [~clientSocketConnection(socket)](#WebSettings..clientSocketConnection) ℗
        * [~replyNoPerm(socket, cmd)](#WebSettings..replyNoPerm) ℗
        * [~checkMyGuild(gId)](#WebSettings..checkMyGuild) ⇒ <code>boolean</code> ℗
        * [~checkPerm(userData, gId)](#WebSettings..checkPerm) ⇒ <code>boolean</code> ℗
        * [~checkChannelPerm(userData, gId, cId)](#WebSettings..checkChannelPerm) ⇒ <code>boolean</code> ℗
        * [~makeMember(m)](#WebSettings..makeMember) ⇒ <code>Object</code> ℗
        * [~makeMessage(uId, gId, cId, msg)](#WebSettings..makeMessage) ⇒ <code>Object</code> ℗
        * [~fetchGuilds(userData, socket, [cb])](#WebSettings..fetchGuilds) : <code>WebSettings~SocketFunction</code> ℗
            * [~done(guilds, [err], [response])](#WebSettings..fetchGuilds..done) ℗
        * [~fetchChannel(userData, socket, gId, cId, [cb])](#WebSettings..fetchChannel) : <code>WebSettings~SocketFunction</code>
        * [~fetchSettings(userData, socket, [cb])](#WebSettings..fetchSettings) : <code>WebSettings~SocketFunction</code>
        * [~fetchScheduledCommands(userData, socket, [cb])](#WebSettings..fetchScheduledCommands) : <code>WebSettings~SocketFunction</code>
        * [~cancelScheduledCommand(userData, socket, gId, cmdId, [cb])](#WebSettings..cancelScheduledCommand) : <code>WebSettings~SocketFunction</code>
        * [~registerScheduledCommand(userData, socket, gId, cmd, [cb])](#WebSettings..registerScheduledCommand) : <code>WebSettings~SocketFunction</code>
        * [~changePrefix(userData, socket, gId, prefix, [cb])](#WebSettings..changePrefix) : <code>WebSettings~SocketFunction</code>
        * [~basicCB](#WebSettings..basicCB) : <code>function</code>

<a name="SubModule+helpMessage"></a>

### webSettings.helpMessage : <code>string</code> \| <code>Discord~MessageEmbed</code>
The help message to show the user in the main help message.

**Kind**: instance property of [<code>WebSettings</code>](#WebSettings)  
<a name="SubModule+postPrefix"></a>

### *webSettings.postPrefix : <code>string</code>*
The postfix for the global prefix for this subModule. Must be defined
before begin(), otherwise it is ignored.

**Kind**: instance abstract property of [<code>WebSettings</code>](#WebSettings)  
**Default**: <code>&quot;&quot;</code>  
<a name="SubModule+Discord"></a>

### webSettings.Discord : <code>Discord</code>
The current Discord object instance of the bot.

**Kind**: instance property of [<code>WebSettings</code>](#WebSettings)  
<a name="SubModule+client"></a>

### webSettings.client : <code>Discord~Client</code>
The current bot client.

**Kind**: instance property of [<code>WebSettings</code>](#WebSettings)  
<a name="SubModule+command"></a>

### webSettings.command : [<code>Command</code>](#Command)
The command object for registering command listeners.

**Kind**: instance property of [<code>WebSettings</code>](#WebSettings)  
<a name="SubModule+common"></a>

### webSettings.common : [<code>Common</code>](#Common)
The common object.

**Kind**: instance property of [<code>WebSettings</code>](#WebSettings)  
<a name="SubModule+bot"></a>

### webSettings.bot : [<code>SpikeyBot</code>](#SpikeyBot)
The parent SpikeyBot instance.

**Kind**: instance property of [<code>WebSettings</code>](#WebSettings)  
<a name="SubModule+myName"></a>

### webSettings.myName : <code>string</code>
The name of this submodule. Used for differentiating in the log. Should be
defined before begin().

**Kind**: instance property of [<code>WebSettings</code>](#WebSettings)  
**Overrides**: [<code>myName</code>](#SubModule+myName)  
**Access**: protected  
<a name="SubModule+initialized"></a>

### webSettings.initialized : <code>boolean</code>
Has this subModule been initialized yet (Has begin() been called).

**Kind**: instance property of [<code>WebSettings</code>](#WebSettings)  
**Default**: <code>false</code>  
**Access**: protected  
**Read only**: true  
<a name="SubModule+commit"></a>

### webSettings.commit : <code>string</code>
The commit at HEAD at the time this module was loaded. Essentially the
version of this submodule.

**Kind**: instance constant of [<code>WebSettings</code>](#WebSettings)  
**Access**: public  
<a name="SubModule+loadTime"></a>

### webSettings.loadTime : <code>number</code>
The time at which this madule was loaded for use in checking if the module
needs to be reloaded because the file has been modified since loading.

**Kind**: instance constant of [<code>WebSettings</code>](#WebSettings)  
**Access**: public  
<a name="SubModule+initialize"></a>

### webSettings.initialize()
The function called at the end of begin() for further initialization
specific to the subModule. Must be defined before begin() is called.

**Kind**: instance method of [<code>WebSettings</code>](#WebSettings)  
**Overrides**: [<code>initialize</code>](#SubModule+initialize)  
**Access**: protected  
<a name="SubModule+begin"></a>

### webSettings.begin(Discord, client, command, common, bot)
Initialize this submodule.

**Kind**: instance method of [<code>WebSettings</code>](#WebSettings)  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| Discord | <code>Discord</code> | The Discord object for the API library. |
| client | <code>Discord~Client</code> | The client that represents this bot. |
| command | [<code>Command</code>](#Command) | The command instance in which to register command listeners. |
| common | [<code>Common</code>](#Common) | Class storing common functions. |
| bot | [<code>SpikeyBot</code>](#SpikeyBot) | The parent SpikeyBot instance. |

<a name="SubModule+end"></a>

### webSettings.end()
Trigger subModule to shutdown and get ready for process terminating.

**Kind**: instance method of [<code>WebSettings</code>](#WebSettings)  
**Access**: public  
<a name="SubModule+log"></a>

### webSettings.log(msg)
Log using common.log, but automatically set name.

**Kind**: instance method of [<code>WebSettings</code>](#WebSettings)  
**Access**: protected  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>string</code> | The message to log. |

<a name="SubModule+debug"></a>

### webSettings.debug(msg)
Log using common.logDebug, but automatically set name.

**Kind**: instance method of [<code>WebSettings</code>](#WebSettings)  
**Access**: protected  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>string</code> | The message to log. |

<a name="SubModule+warn"></a>

### webSettings.warn(msg)
Log using common.logWarning, but automatically set name.

**Kind**: instance method of [<code>WebSettings</code>](#WebSettings)  
**Access**: protected  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>string</code> | The message to log. |

<a name="SubModule+error"></a>

### webSettings.error(msg)
Log using common.error, but automatically set name.

**Kind**: instance method of [<code>WebSettings</code>](#WebSettings)  
**Access**: protected  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>string</code> | The message to log. |

<a name="SubModule+shutdown"></a>

### webSettings.shutdown()
Shutdown and disable this submodule. Removes all event listeners.

**Kind**: instance method of [<code>WebSettings</code>](#WebSettings)  
**Overrides**: [<code>shutdown</code>](#SubModule+shutdown)  
**Access**: protected  
<a name="SubModule+save"></a>

### *webSettings.save([opt])*
Saves all data to files necessary for saving current state.

**Kind**: instance abstract method of [<code>WebSettings</code>](#WebSettings)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [opt] | <code>string</code> | <code>&quot;&#x27;sync&#x27;&quot;</code> | Can be 'async', otherwise defaults to synchronous. |

<a name="SubModule+unloadable"></a>

### webSettings.unloadable() ⇒ <code>boolean</code>
Check if this module is in a state that is ready to be unloaded. If false
is returned, this module should not be unloaded and doing such may risk
putting the module into an uncontrollable state.

**Kind**: instance method of [<code>WebSettings</code>](#WebSettings)  
**Overrides**: [<code>unloadable</code>](#SubModule+unloadable)  
**Returns**: <code>boolean</code> - True if can be unloaded, false if cannot.  
**Access**: public  
<a name="WebSettings..cmdScheduler"></a>

### WebSettings~cmdScheduler : [<code>CmdScheduling</code>](#CmdScheduling) ℗
Stores the current reference to the CmdScheduling subModule. Null if it
doesn't exist.

**Kind**: inner property of [<code>WebSettings</code>](#WebSettings)  
**Access**: private  
<a name="WebSettings..sockets"></a>

### WebSettings~sockets : <code>Object.&lt;Socket&gt;</code> ℗
Map of all currently connected sockets.

**Kind**: inner property of [<code>WebSettings</code>](#WebSettings)  
**Access**: private  
<a name="WebSettings..siblingSockets"></a>

### WebSettings~siblingSockets : <code>Object.&lt;Socket&gt;</code> ℗
Map of all sockets connected that are siblings.

**Kind**: inner property of [<code>WebSettings</code>](#WebSettings)  
**Access**: private  
<a name="WebSettings..updateModuleReferences"></a>

### WebSettings~updateModuleReferences() ℗
Update the references to the aplicable subModules.

**Kind**: inner method of [<code>WebSettings</code>](#WebSettings)  
**Access**: private  
<a name="WebSettings..handleShutdown"></a>

### WebSettings~handleShutdown() ℗
Handle CmdScheduling shutting down.

**Kind**: inner method of [<code>WebSettings</code>](#WebSettings)  
**Access**: private  
<a name="WebSettings..handleCommandRegistered"></a>

### WebSettings~handleCommandRegistered(cmd, gId) ℗
Handle new CmdScheduling.ScheduledCommand being registered.

**Kind**: inner method of [<code>WebSettings</code>](#WebSettings)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| cmd | <code>CmdScheduling.ScheduledCommand</code> | The command that was scheduled. |
| gId | <code>string</code> \| <code>number</code> | The guild ID of which the command was scheduled in. |

<a name="WebSettings..handleCommandCancelled"></a>

### WebSettings~handleCommandCancelled(cmdId, gId) ℗
Handle a CmdScheduling.ScheduledCommand being canceled.

**Kind**: inner method of [<code>WebSettings</code>](#WebSettings)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| cmdId | <code>string</code> | The ID of the command that was cancelled. |
| gId | <code>string</code> \| <code>number</code> | the ID of the guild the command was cancelled in. |

<a name="WebSettings..handleSettingsChanged"></a>

### WebSettings~handleSettingsChanged(gId, value, type, id, [id2]) ℗
Handle Command~CommandSetting value changed.

**Kind**: inner method of [<code>WebSettings</code>](#WebSettings)  
**Access**: private  
**See**: [Command~CommandSetting.set](Command~CommandSetting.set)  

| Param | Type | Description |
| --- | --- | --- |
| gId | <code>string</code> | the ID of the guild this setting was changed in, or null of not specific to a single guild. |
| value | <code>string</code> |  |
| type | <code>string</code> |  |
| id | <code>string</code> |  |
| [id2] | <code>string</code> |  |

<a name="WebSettings..handleSettingsReset"></a>

### WebSettings~handleSettingsReset(gId) ℗
Handle Command~CommandSetting was deleted or reset in a guild.

**Kind**: inner method of [<code>WebSettings</code>](#WebSettings)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| gId | <code>string</code> | The ID of the guild in which the settings were reset. |

<a name="WebSettings..startClient"></a>

### WebSettings~startClient() ℗
Start a socketio client connection to the primary running server.

**Kind**: inner method of [<code>WebSettings</code>](#WebSettings)  
**Access**: private  
<a name="WebSettings..handler"></a>

### WebSettings~handler(req, res) ℗
Handler for all http requests. Should never be called.

**Kind**: inner method of [<code>WebSettings</code>](#WebSettings)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| req | <code>http.IncomingMessage</code> | The client's request. |
| res | <code>http.ServerResponse</code> | Our response to the client. |

<a name="WebSettings..getNumClients"></a>

### WebSettings~getNumClients() ⇒ <code>number</code> ℗
Returns the number of connected clients that are not siblings.

**Kind**: inner method of [<code>WebSettings</code>](#WebSettings)  
**Returns**: <code>number</code> - Number of sockets.  
**Access**: private  
<a name="WebSettings..socketConnection"></a>

### WebSettings~socketConnection(socket) ℗
Handler for a new socket connecting.

**Kind**: inner method of [<code>WebSettings</code>](#WebSettings)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| socket | <code>socketIo~Socket</code> | The socket.io socket that connected. |

<a name="WebSettings..socketConnection..callSocketFunction"></a>

#### socketConnection~callSocketFunction(func, args, [forward]) ℗
Calls the functions with added arguments, and copies the request to all
sibling clients.

**Kind**: inner method of [<code>socketConnection</code>](#WebSettings..socketConnection)  
**Access**: private  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| func | <code>function</code> |  | The function to call. |
| args | <code>Array.&lt;\*&gt;</code> |  | Array of arguments to send to function. |
| [forward] | <code>boolean</code> | <code>true</code> | Forward this request directly to all siblings. |

<a name="WebSettings..clientSocketConnection"></a>

### WebSettings~clientSocketConnection(socket) ℗
Handler for connecting as a client to the server.

**Kind**: inner method of [<code>WebSettings</code>](#WebSettings)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| socket | <code>socketIo~Socket</code> | The socket.io socket that connected. |

<a name="WebSettings..replyNoPerm"></a>

### WebSettings~replyNoPerm(socket, cmd) ℗
Send a message to the given socket informing the client that the command
they attempted failed due to insufficient permission.

**Kind**: inner method of [<code>WebSettings</code>](#WebSettings)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| socket | <code>Socket</code> | The socket.io socket to reply on. |
| cmd | <code>string</code> | THe command the client attempted. |

<a name="WebSettings..checkMyGuild"></a>

### WebSettings~checkMyGuild(gId) ⇒ <code>boolean</code> ℗
Checks if the current shard is responsible for the requested guild.

**Kind**: inner method of [<code>WebSettings</code>](#WebSettings)  
**Returns**: <code>boolean</code> - True if this shard has this guild.  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| gId | <code>number</code> \| <code>string</code> | The guild id to check. |

<a name="WebSettings..checkPerm"></a>

### WebSettings~checkPerm(userData, gId) ⇒ <code>boolean</code> ℗
Check that the given user has permission to manage the games in the given
guild.

**Kind**: inner method of [<code>WebSettings</code>](#WebSettings)  
**Returns**: <code>boolean</code> - Whther the user has permission or not to manage the
hungry games in the given guild.  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| userData | <code>UserData</code> | The user to check. |
| gId | <code>string</code> | The guild id to check against. |

<a name="WebSettings..checkChannelPerm"></a>

### WebSettings~checkChannelPerm(userData, gId, cId) ⇒ <code>boolean</code> ℗
Check that the given user has permission to see and send messages in the
given channel, as well as manage the games in the given guild.

**Kind**: inner method of [<code>WebSettings</code>](#WebSettings)  
**Returns**: <code>boolean</code> - Whther the user has permission or not to manage the
hungry games in the given guild and has permission to send messages in the
given channel.  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| userData | <code>UserData</code> | The user to check. |
| gId | <code>string</code> | The guild id of the guild that contains the channel. |
| cId | <code>string</code> | The channel id to check against. |

<a name="WebSettings..makeMember"></a>

### WebSettings~makeMember(m) ⇒ <code>Object</code> ℗
Strips a Discord~GuildMember to only the necessary data that a client will
need.

**Kind**: inner method of [<code>WebSettings</code>](#WebSettings)  
**Returns**: <code>Object</code> - The minimal member.  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| m | <code>Discord~GuildMember</code> | The guild member to strip the data from. |

<a name="WebSettings..makeMessage"></a>

### WebSettings~makeMessage(uId, gId, cId, msg) ⇒ <code>Object</code> ℗
Forms a Discord~Message similar object from given IDs.

**Kind**: inner method of [<code>WebSettings</code>](#WebSettings)  
**Returns**: <code>Object</code> - The created message-like object.  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| uId | <code>string</code> | The id of the user who wrote this message. |
| gId | <code>string</code> | The id of the guild this message is in. |
| cId | <code>string</code> | The id of the channel this message was 'sent' in. |
| msg | <code>string</code> | The message content. |

<a name="WebSettings..fetchGuilds"></a>

### WebSettings~fetchGuilds(userData, socket, [cb]) : <code>WebSettings~SocketFunction</code> ℗
Fetch all relevant data for all mutual guilds with the user and send it to
the user.

**Kind**: inner method of [<code>WebSettings</code>](#WebSettings)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| userData | <code>Object</code> | The current user's session data. |
| socket | <code>socketIo~Socket</code> | The socket connection to reply on. |
| [cb] | <code>basicCB</code> | Callback that fires once the requested action is complete, or has failed. |

<a name="WebSettings..fetchGuilds..done"></a>

#### fetchGuilds~done(guilds, [err], [response]) ℗
The callback for each response with the requested data. Replies to the
user once all requests have replied.

**Kind**: inner method of [<code>fetchGuilds</code>](#WebSettings..fetchGuilds)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| guilds | <code>string</code> \| <code>Object</code> | Either the guild data to send to the user, or 'guilds' if this is a reply from a sibling client. |
| [err] | <code>string</code> | The error that occurred, or null if no error. |
| [response] | <code>Object</code> | The guild data if `guilds` equals 'guilds'. |

<a name="WebSettings..fetchChannel"></a>

### WebSettings~fetchChannel(userData, socket, gId, cId, [cb]) : <code>WebSettings~SocketFunction</code>
Client has requested data for a specific channel.

**Kind**: inner method of [<code>WebSettings</code>](#WebSettings)  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| userData | <code>Object</code> | The current user's session data. |
| socket | <code>socketIo~Socket</code> | The socket connection to reply on. |
| gId | <code>number</code> \| <code>string</code> | The ID of the Discord guild where the channel is. |
| cId | <code>number</code> \| <code>string</code> | The ID of the Discord channel to fetch. |
| [cb] | <code>basicCB</code> | Callback that fires once the requested action is complete and has data, or has failed. |

<a name="WebSettings..fetchSettings"></a>

### WebSettings~fetchSettings(userData, socket, [cb]) : <code>WebSettings~SocketFunction</code>
Client has requested all settings for all guilds for the connected user.

**Kind**: inner method of [<code>WebSettings</code>](#WebSettings)  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| userData | <code>Object</code> | The current user's session data. |
| socket | <code>socketIo~Socket</code> | The socket connection to reply on. |
| [cb] | <code>basicCB</code> | Callback that fires once the requested action is complete and has data, or has failed. |

<a name="WebSettings..fetchScheduledCommands"></a>

### WebSettings~fetchScheduledCommands(userData, socket, [cb]) : <code>WebSettings~SocketFunction</code>
Client has requested all scheduled commands for the connected user.

**Kind**: inner method of [<code>WebSettings</code>](#WebSettings)  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| userData | <code>Object</code> | The current user's session data. |
| socket | <code>socketIo~Socket</code> | The socket connection to reply on. |
| [cb] | <code>basicCB</code> | Callback that fires once the requested action is complete and has data, or has failed. |

<a name="WebSettings..cancelScheduledCommand"></a>

### WebSettings~cancelScheduledCommand(userData, socket, gId, cmdId, [cb]) : <code>WebSettings~SocketFunction</code>
Client has requested that a scheduled command be cancelled.

**Kind**: inner method of [<code>WebSettings</code>](#WebSettings)  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| userData | <code>Object</code> | The current user's session data. |
| socket | <code>socketIo~Socket</code> | The socket connection to reply on. |
| gId | <code>string</code> \| <code>number</code> | The id of the guild of which to cancel the command. |
| cmdId | <code>string</code> | The ID of the command to cancel. |
| [cb] | <code>basicCB</code> | Callback that fires once the requested action is complete, or has failed. |

<a name="WebSettings..registerScheduledCommand"></a>

### WebSettings~registerScheduledCommand(userData, socket, gId, cmd, [cb]) : <code>WebSettings~SocketFunction</code>
Client has created a new scheduled command.

**Kind**: inner method of [<code>WebSettings</code>](#WebSettings)  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| userData | <code>Object</code> | The current user's session data. |
| socket | <code>socketIo~Socket</code> | The socket connection to reply on. |
| gId | <code>string</code> \| <code>number</code> | The id of the guild of which to add the command. |
| cmd | <code>string</code> | The command data of which to make into a {@link CmdScheduling~ScheduledCommand} and register. |
| [cb] | <code>basicCB</code> | Callback that fires once the requested action is complete, or has failed. |

<a name="WebSettings..changePrefix"></a>

### WebSettings~changePrefix(userData, socket, gId, prefix, [cb]) : <code>WebSettings~SocketFunction</code>
Client has requested to change the command prefix for a guild.

**Kind**: inner method of [<code>WebSettings</code>](#WebSettings)  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| userData | <code>Object</code> | The current user's session data. |
| socket | <code>socketIo~Socket</code> | The socket connection to reply on. |
| gId | <code>string</code> \| <code>number</code> | The id of the guild of which to change the prefix. |
| prefix | <code>string</code> | The new prefix value to set. |
| [cb] | <code>basicCB</code> | Callback that fires once the requested action is complete, or has failed. |

<a name="WebSettings..basicCB"></a>

### WebSettings~basicCB : <code>function</code>
Basic callback with single argument. The argument is null if there is no
error, or a string if there was an error.

**Kind**: inner typedef of [<code>WebSettings</code>](#WebSettings)  

| Param | Type | Description |
| --- | --- | --- |
| err | <code>string</code> | The error response. |

<a name="WebStats"></a>

## WebStats ⇐ [<code>SubModule</code>](#SubModule)
Handles sending the bot's stats to http client requests, and
discordbots.org.

**Kind**: global class  
**Extends**: [<code>SubModule</code>](#SubModule)  

* [WebStats](#WebStats) ⇐ [<code>SubModule</code>](#SubModule)
    * _instance_
        * [.helpMessage](#SubModule+helpMessage) : <code>string</code> \| <code>Discord~MessageEmbed</code>
        * *[.postPrefix](#SubModule+postPrefix) : <code>string</code>*
        * [.Discord](#SubModule+Discord) : <code>Discord</code>
        * [.client](#SubModule+client) : <code>Discord~Client</code>
        * [.command](#SubModule+command) : [<code>Command</code>](#Command)
        * [.common](#SubModule+common) : [<code>Common</code>](#Common)
        * [.bot](#SubModule+bot) : [<code>SpikeyBot</code>](#SpikeyBot)
        * *[.myName](#SubModule+myName) : <code>string</code>*
        * [.initialized](#SubModule+initialized) : <code>boolean</code>
        * [.commit](#SubModule+commit) : <code>string</code>
        * [.loadTime](#SubModule+loadTime) : <code>number</code>
        * [.initialize()](#SubModule+initialize)
        * [.begin(Discord, client, command, common, bot)](#SubModule+begin)
        * [.end()](#SubModule+end)
        * [.log(msg)](#SubModule+log)
        * [.debug(msg)](#SubModule+debug)
        * [.warn(msg)](#SubModule+warn)
        * [.error(msg)](#SubModule+error)
        * [.shutdown()](#SubModule+shutdown)
        * *[.save([opt])](#SubModule+save)*
        * *[.unloadable()](#SubModule+unloadable) ⇒ <code>boolean</code>*
    * _inner_
        * [~cachedTime](#WebStats..cachedTime) : <code>number</code> ℗
        * [~cachedStats](#WebStats..cachedStats) : [<code>values</code>](#Main..getAllStats..values) ℗
        * [~postTimeout](#WebStats..postTimeout) : <code>Timeout</code> ℗
        * [~cachedLifespan](#WebStats..cachedLifespan) : <code>number</code> ℗
        * [~postFrequency](#WebStats..postFrequency) : <code>number</code> ℗
        * [~apiHosts](#WebStats..apiHosts) ℗
        * [~handler(req, res)](#WebStats..handler) ℗
        * [~getStats(cb)](#WebStats..getStats) ℗
        * [~postUpdatedCount()](#WebStats..postUpdatedCount) ℗
            * [~sendRequest(data)](#WebStats..postUpdatedCount..sendRequest) ℗

<a name="SubModule+helpMessage"></a>

### webStats.helpMessage : <code>string</code> \| <code>Discord~MessageEmbed</code>
The help message to show the user in the main help message.

**Kind**: instance property of [<code>WebStats</code>](#WebStats)  
<a name="SubModule+postPrefix"></a>

### *webStats.postPrefix : <code>string</code>*
The postfix for the global prefix for this subModule. Must be defined
before begin(), otherwise it is ignored.

**Kind**: instance abstract property of [<code>WebStats</code>](#WebStats)  
**Default**: <code>&quot;&quot;</code>  
<a name="SubModule+Discord"></a>

### webStats.Discord : <code>Discord</code>
The current Discord object instance of the bot.

**Kind**: instance property of [<code>WebStats</code>](#WebStats)  
<a name="SubModule+client"></a>

### webStats.client : <code>Discord~Client</code>
The current bot client.

**Kind**: instance property of [<code>WebStats</code>](#WebStats)  
<a name="SubModule+command"></a>

### webStats.command : [<code>Command</code>](#Command)
The command object for registering command listeners.

**Kind**: instance property of [<code>WebStats</code>](#WebStats)  
<a name="SubModule+common"></a>

### webStats.common : [<code>Common</code>](#Common)
The common object.

**Kind**: instance property of [<code>WebStats</code>](#WebStats)  
<a name="SubModule+bot"></a>

### webStats.bot : [<code>SpikeyBot</code>](#SpikeyBot)
The parent SpikeyBot instance.

**Kind**: instance property of [<code>WebStats</code>](#WebStats)  
<a name="SubModule+myName"></a>

### *webStats.myName : <code>string</code>*
The name of this submodule. Used for differentiating in the log. Should be
defined before begin().

**Kind**: instance abstract property of [<code>WebStats</code>](#WebStats)  
**Overrides**: [<code>myName</code>](#SubModule+myName)  
**Access**: protected  
<a name="SubModule+initialized"></a>

### webStats.initialized : <code>boolean</code>
Has this subModule been initialized yet (Has begin() been called).

**Kind**: instance property of [<code>WebStats</code>](#WebStats)  
**Default**: <code>false</code>  
**Access**: protected  
**Read only**: true  
<a name="SubModule+commit"></a>

### webStats.commit : <code>string</code>
The commit at HEAD at the time this module was loaded. Essentially the
version of this submodule.

**Kind**: instance constant of [<code>WebStats</code>](#WebStats)  
**Access**: public  
<a name="SubModule+loadTime"></a>

### webStats.loadTime : <code>number</code>
The time at which this madule was loaded for use in checking if the module
needs to be reloaded because the file has been modified since loading.

**Kind**: instance constant of [<code>WebStats</code>](#WebStats)  
**Access**: public  
<a name="SubModule+initialize"></a>

### webStats.initialize()
The function called at the end of begin() for further initialization
specific to the subModule. Must be defined before begin() is called.

**Kind**: instance method of [<code>WebStats</code>](#WebStats)  
**Overrides**: [<code>initialize</code>](#SubModule+initialize)  
**Access**: protected  
<a name="SubModule+begin"></a>

### webStats.begin(Discord, client, command, common, bot)
Initialize this submodule.

**Kind**: instance method of [<code>WebStats</code>](#WebStats)  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| Discord | <code>Discord</code> | The Discord object for the API library. |
| client | <code>Discord~Client</code> | The client that represents this bot. |
| command | [<code>Command</code>](#Command) | The command instance in which to register command listeners. |
| common | [<code>Common</code>](#Common) | Class storing common functions. |
| bot | [<code>SpikeyBot</code>](#SpikeyBot) | The parent SpikeyBot instance. |

<a name="SubModule+end"></a>

### webStats.end()
Trigger subModule to shutdown and get ready for process terminating.

**Kind**: instance method of [<code>WebStats</code>](#WebStats)  
**Access**: public  
<a name="SubModule+log"></a>

### webStats.log(msg)
Log using common.log, but automatically set name.

**Kind**: instance method of [<code>WebStats</code>](#WebStats)  
**Access**: protected  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>string</code> | The message to log. |

<a name="SubModule+debug"></a>

### webStats.debug(msg)
Log using common.logDebug, but automatically set name.

**Kind**: instance method of [<code>WebStats</code>](#WebStats)  
**Access**: protected  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>string</code> | The message to log. |

<a name="SubModule+warn"></a>

### webStats.warn(msg)
Log using common.logWarning, but automatically set name.

**Kind**: instance method of [<code>WebStats</code>](#WebStats)  
**Access**: protected  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>string</code> | The message to log. |

<a name="SubModule+error"></a>

### webStats.error(msg)
Log using common.error, but automatically set name.

**Kind**: instance method of [<code>WebStats</code>](#WebStats)  
**Access**: protected  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>string</code> | The message to log. |

<a name="SubModule+shutdown"></a>

### webStats.shutdown()
Shutdown and disable this submodule. Removes all event listeners.

**Kind**: instance method of [<code>WebStats</code>](#WebStats)  
**Overrides**: [<code>shutdown</code>](#SubModule+shutdown)  
**Access**: protected  
<a name="SubModule+save"></a>

### *webStats.save([opt])*
Saves all data to files necessary for saving current state.

**Kind**: instance abstract method of [<code>WebStats</code>](#WebStats)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [opt] | <code>string</code> | <code>&quot;&#x27;sync&#x27;&quot;</code> | Can be 'async', otherwise defaults to synchronous. |

<a name="SubModule+unloadable"></a>

### *webStats.unloadable() ⇒ <code>boolean</code>*
Check if this module is in a state that is ready to be unloaded. If false
is returned, this module should not be unloaded and doing such may risk
putting the module into an uncontrollable state.

**Kind**: instance abstract method of [<code>WebStats</code>](#WebStats)  
**Returns**: <code>boolean</code> - True if can be unloaded, false if cannot.  
**Access**: public  
<a name="WebStats..cachedTime"></a>

### WebStats~cachedTime : <code>number</code> ℗
The timestamp at which the stats were last requested.

**Kind**: inner property of [<code>WebStats</code>](#WebStats)  
**Default**: <code>0</code>  
**Access**: private  
<a name="WebStats..cachedStats"></a>

### WebStats~cachedStats : [<code>values</code>](#Main..getAllStats..values) ℗
The object storing the previously received stats values.

**Kind**: inner property of [<code>WebStats</code>](#WebStats)  
**Default**: <code>{}</code>  
**Access**: private  
<a name="WebStats..postTimeout"></a>

### WebStats~postTimeout : <code>Timeout</code> ℗
The next scheduled event at which to post our stats.

**Kind**: inner property of [<code>WebStats</code>](#WebStats)  
**Access**: private  
<a name="WebStats..cachedLifespan"></a>

### WebStats~cachedLifespan : <code>number</code> ℗
The amount of time the cached data is considered fresh. Anything longer
than this must be re-fetched.

**Kind**: inner constant of [<code>WebStats</code>](#WebStats)  
**Default**: <code>5 Minutes</code>  
**Access**: private  
<a name="WebStats..postFrequency"></a>

### WebStats~postFrequency : <code>number</code> ℗
The amount frequency at which we will post our stats to discordbots.org

**Kind**: inner constant of [<code>WebStats</code>](#WebStats)  
**Default**: <code>12 Hours</code>  
**Access**: private  
<a name="WebStats..apiHosts"></a>

### WebStats~apiHosts ℗
The request information for updating our server count on bot list websites.

**Kind**: inner constant of [<code>WebStats</code>](#WebStats)  
**Default**: <code>[&quot;{\&quot;protocol\&quot;:\&quot;https:\&quot;,\&quot;host\&quot;:\&quot;discordbots.org\&quot;,\&quot;path\&quot;:\&quot;/api/bots/{id}/stats\&quot;,\&quot;method\&quot;:\&quot;POST\&quot;,\&quot;headers\&quot;:\&quot;\&quot;}&quot;,&quot;{\&quot;protocol\&quot;:\&quot;https:\&quot;,\&quot;host\&quot;:\&quot;bots.discord.pw\&quot;,\&quot;path\&quot;:\&quot;/api/bots/{id}/stats\&quot;,\&quot;method\&quot;:\&quot;POST\&quot;,\&quot;headers\&quot;:\&quot;\&quot;}&quot;,&quot;{\&quot;protocol\&quot;:\&quot;https:\&quot;,\&quot;host\&quot;:\&quot;discordbotlist.com\&quot;,\&quot;path\&quot;:\&quot;/api/bots/{id}/stats\&quot;,\&quot;method\&quot;:\&quot;POST\&quot;,\&quot;headers\&quot;:\&quot;\&quot;}&quot;]</code>  
**Access**: private  
<a name="WebStats..handler"></a>

### WebStats~handler(req, res) ℗
Handler for all http requests. Always replies to res with JSON encoded bot
stats.

**Kind**: inner method of [<code>WebStats</code>](#WebStats)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| req | <code>http.IncomingMessage</code> | The client's request. |
| res | <code>http.ServerResponse</code> | Our response to the client. |

<a name="WebStats..getStats"></a>

### WebStats~getStats(cb) ℗
Fetch the bot's stats.

**Kind**: inner method of [<code>WebStats</code>](#WebStats)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| cb | <code>Object</code> | The bot's stats as an object. {@link Main~getAllStats~values} |

<a name="WebStats..postUpdatedCount"></a>

### WebStats~postUpdatedCount() ℗
Send our latest guild count to discordbots.org via https post request.

**Kind**: inner method of [<code>WebStats</code>](#WebStats)  
**Access**: private  
<a name="WebStats..postUpdatedCount..sendRequest"></a>

#### postUpdatedCount~sendRequest(data) ℗
Send the request after we have fetched our stats.

**Kind**: inner method of [<code>postUpdatedCount</code>](#WebStats..postUpdatedCount)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| data | <code>Object</code> | The data to send in our request. |

<a name="WebCommands"></a>

## WebCommands ⇐ [<code>SubModule</code>](#SubModule)
Handles sending the bot's stats to http client requests, and
discordbots.org.

**Kind**: global class  
**Extends**: [<code>SubModule</code>](#SubModule)  

* [WebCommands](#WebCommands) ⇐ [<code>SubModule</code>](#SubModule)
    * _instance_
        * [.helpMessage](#SubModule+helpMessage) : <code>string</code> \| <code>Discord~MessageEmbed</code>
        * *[.postPrefix](#SubModule+postPrefix) : <code>string</code>*
        * [.Discord](#SubModule+Discord) : <code>Discord</code>
        * [.client](#SubModule+client) : <code>Discord~Client</code>
        * [.command](#SubModule+command) : [<code>Command</code>](#Command)
        * [.common](#SubModule+common) : [<code>Common</code>](#Common)
        * [.bot](#SubModule+bot) : [<code>SpikeyBot</code>](#SpikeyBot)
        * *[.myName](#SubModule+myName) : <code>string</code>*
        * [.initialized](#SubModule+initialized) : <code>boolean</code>
        * [.commit](#SubModule+commit) : <code>string</code>
        * [.loadTime](#SubModule+loadTime) : <code>number</code>
        * [.initialize()](#SubModule+initialize)
        * [.begin(Discord, client, command, common, bot)](#SubModule+begin)
        * [.end()](#SubModule+end)
        * [.log(msg)](#SubModule+log)
        * [.debug(msg)](#SubModule+debug)
        * [.warn(msg)](#SubModule+warn)
        * [.error(msg)](#SubModule+error)
        * [.shutdown()](#SubModule+shutdown)
        * *[.save([opt])](#SubModule+save)*
        * *[.unloadable()](#SubModule+unloadable) ⇒ <code>boolean</code>*
    * _inner_
        * [~handler(req, res)](#WebCommands..handler) ℗

<a name="SubModule+helpMessage"></a>

### webCommands.helpMessage : <code>string</code> \| <code>Discord~MessageEmbed</code>
The help message to show the user in the main help message.

**Kind**: instance property of [<code>WebCommands</code>](#WebCommands)  
<a name="SubModule+postPrefix"></a>

### *webCommands.postPrefix : <code>string</code>*
The postfix for the global prefix for this subModule. Must be defined
before begin(), otherwise it is ignored.

**Kind**: instance abstract property of [<code>WebCommands</code>](#WebCommands)  
**Default**: <code>&quot;&quot;</code>  
<a name="SubModule+Discord"></a>

### webCommands.Discord : <code>Discord</code>
The current Discord object instance of the bot.

**Kind**: instance property of [<code>WebCommands</code>](#WebCommands)  
<a name="SubModule+client"></a>

### webCommands.client : <code>Discord~Client</code>
The current bot client.

**Kind**: instance property of [<code>WebCommands</code>](#WebCommands)  
<a name="SubModule+command"></a>

### webCommands.command : [<code>Command</code>](#Command)
The command object for registering command listeners.

**Kind**: instance property of [<code>WebCommands</code>](#WebCommands)  
<a name="SubModule+common"></a>

### webCommands.common : [<code>Common</code>](#Common)
The common object.

**Kind**: instance property of [<code>WebCommands</code>](#WebCommands)  
<a name="SubModule+bot"></a>

### webCommands.bot : [<code>SpikeyBot</code>](#SpikeyBot)
The parent SpikeyBot instance.

**Kind**: instance property of [<code>WebCommands</code>](#WebCommands)  
<a name="SubModule+myName"></a>

### *webCommands.myName : <code>string</code>*
The name of this submodule. Used for differentiating in the log. Should be
defined before begin().

**Kind**: instance abstract property of [<code>WebCommands</code>](#WebCommands)  
**Overrides**: [<code>myName</code>](#SubModule+myName)  
**Access**: protected  
<a name="SubModule+initialized"></a>

### webCommands.initialized : <code>boolean</code>
Has this subModule been initialized yet (Has begin() been called).

**Kind**: instance property of [<code>WebCommands</code>](#WebCommands)  
**Default**: <code>false</code>  
**Access**: protected  
**Read only**: true  
<a name="SubModule+commit"></a>

### webCommands.commit : <code>string</code>
The commit at HEAD at the time this module was loaded. Essentially the
version of this submodule.

**Kind**: instance constant of [<code>WebCommands</code>](#WebCommands)  
**Access**: public  
<a name="SubModule+loadTime"></a>

### webCommands.loadTime : <code>number</code>
The time at which this madule was loaded for use in checking if the module
needs to be reloaded because the file has been modified since loading.

**Kind**: instance constant of [<code>WebCommands</code>](#WebCommands)  
**Access**: public  
<a name="SubModule+initialize"></a>

### webCommands.initialize()
The function called at the end of begin() for further initialization
specific to the subModule. Must be defined before begin() is called.

**Kind**: instance method of [<code>WebCommands</code>](#WebCommands)  
**Overrides**: [<code>initialize</code>](#SubModule+initialize)  
**Access**: protected  
<a name="SubModule+begin"></a>

### webCommands.begin(Discord, client, command, common, bot)
Initialize this submodule.

**Kind**: instance method of [<code>WebCommands</code>](#WebCommands)  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| Discord | <code>Discord</code> | The Discord object for the API library. |
| client | <code>Discord~Client</code> | The client that represents this bot. |
| command | [<code>Command</code>](#Command) | The command instance in which to register command listeners. |
| common | [<code>Common</code>](#Common) | Class storing common functions. |
| bot | [<code>SpikeyBot</code>](#SpikeyBot) | The parent SpikeyBot instance. |

<a name="SubModule+end"></a>

### webCommands.end()
Trigger subModule to shutdown and get ready for process terminating.

**Kind**: instance method of [<code>WebCommands</code>](#WebCommands)  
**Access**: public  
<a name="SubModule+log"></a>

### webCommands.log(msg)
Log using common.log, but automatically set name.

**Kind**: instance method of [<code>WebCommands</code>](#WebCommands)  
**Access**: protected  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>string</code> | The message to log. |

<a name="SubModule+debug"></a>

### webCommands.debug(msg)
Log using common.logDebug, but automatically set name.

**Kind**: instance method of [<code>WebCommands</code>](#WebCommands)  
**Access**: protected  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>string</code> | The message to log. |

<a name="SubModule+warn"></a>

### webCommands.warn(msg)
Log using common.logWarning, but automatically set name.

**Kind**: instance method of [<code>WebCommands</code>](#WebCommands)  
**Access**: protected  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>string</code> | The message to log. |

<a name="SubModule+error"></a>

### webCommands.error(msg)
Log using common.error, but automatically set name.

**Kind**: instance method of [<code>WebCommands</code>](#WebCommands)  
**Access**: protected  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>string</code> | The message to log. |

<a name="SubModule+shutdown"></a>

### webCommands.shutdown()
Shutdown and disable this submodule. Removes all event listeners.

**Kind**: instance method of [<code>WebCommands</code>](#WebCommands)  
**Overrides**: [<code>shutdown</code>](#SubModule+shutdown)  
**Access**: protected  
<a name="SubModule+save"></a>

### *webCommands.save([opt])*
Saves all data to files necessary for saving current state.

**Kind**: instance abstract method of [<code>WebCommands</code>](#WebCommands)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [opt] | <code>string</code> | <code>&quot;&#x27;sync&#x27;&quot;</code> | Can be 'async', otherwise defaults to synchronous. |

<a name="SubModule+unloadable"></a>

### *webCommands.unloadable() ⇒ <code>boolean</code>*
Check if this module is in a state that is ready to be unloaded. If false
is returned, this module should not be unloaded and doing such may risk
putting the module into an uncontrollable state.

**Kind**: instance abstract method of [<code>WebCommands</code>](#WebCommands)  
**Returns**: <code>boolean</code> - True if can be unloaded, false if cannot.  
**Access**: public  
<a name="WebCommands..handler"></a>

### WebCommands~handler(req, res) ℗
Handler for all http requests.

**Kind**: inner method of [<code>WebCommands</code>](#WebCommands)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| req | <code>http.IncomingMessage</code> | The client's request. |
| res | <code>http.ServerResponse</code> | Our response to the client. |

<a name="unhandledRejection"></a>

## unhandledRejection(reason, p) ℗
Handler for an unhandledRejection or uncaughtException, to prevent the bot
from silently crashing without an error.

**Kind**: global function  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| reason | <code>Object</code> | Reason for rejection. |
| p | <code>Promise</code> | The promise that caused the rejection. |

<a name="commandHandler"></a>

## commandHandler : <code>function</code>
The function to call when a command is triggered.

**Kind**: global typedef  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord~Message</code> | The message sent in Discord. |

<a name="loginState"></a>

## loginState
The current OAuth2 access information for a single session.

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| access_token | <code>string</code> | The current token for api requests. |
| token_type | <code>string</code> | The type of token. (Usually 'Bearer') |
| expires_in | <code>number</code> | Number of seconds after the token is authorized at which it becomes invalid. |
| refresh_token | <code>string</code> | Token used to refresh the expired access_token. |
| scope | <code>string</code> | The scopes that the access_token has access to. |
| expires_at | <code>number</code> | The unix timestamp when the access_token expires. |
| expiration_date | <code>number</code> | The unix timestamp when we consider the session to have expired, and the session is deleted. |
| session | <code>string</code> | The 512 byte base64 string that identifies this session to the client. |
| refreshTimeout | <code>Timeout</code> | The current timeout registered for refreshing the access_token. |

