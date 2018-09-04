[Commands Help](commands/)
## Classes

<dl>
<dt><a href="#Common">Common</a></dt>
<dd></dd>
<dt><a href="#Connect4">Connect4</a> ⇐ <code><a href="#SubModule">SubModule</a></code></dt>
<dd><p>Manages a Connect 4 game.</p>
</dd>
<dt><a href="#HGWeb">HGWeb</a></dt>
<dd><p>Creates a web interface for managing the Hungry Games.</p>
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
<dt><a href="#TicTacToe">TicTacToe</a> ⇐ <code><a href="#SubModule">SubModule</a></code></dt>
<dd><p>Manages a tic-tac-toe game.</p>
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
</dl>

<a name="Common"></a>

## Common
**Kind**: global class  

* [Common](#Common)
    * [new Common()](#new_Common_new)
    * _instance_
        * [.isRelease](#Common+isRelease) : <code>boolean</code>
        * [.spikeyId](#Common+spikeyId) : <code>string</code>
        * [.logChannel](#Common+logChannel) : <code>string</code>
        * [.webURL](#Common+webURL) : <code>string</code>
        * [.guildSaveDir](#Common+guildSaveDir) : <code>string</code>
        * [.userSaveDir](#Common+userSaveDir) : <code>string</code>
        * [.begin(_, isRelease)](#Common+begin)
        * [.padIp(str)](#Common+padIp) ⇒ <code>string</code>
        * [.getIPName(ip)](#Common+getIPName) ⇒ <code>string</code>
        * [.updatePrefix(ip)](#Common+updatePrefix) ⇒ <code>string</code>
        * [.log(message, ip, [traceIncrease])](#Common+log)
        * [.error(message, ip, [traceIncrease])](#Common+error)
        * [.mention(msg)](#Common+mention) ⇒ <code>string</code>
        * [.reply(msg, text, post)](#Common+reply) ⇒ <code>Promise</code>
    * _static_
        * [.mention](#Common.mention) ⇒ <code>string</code>
        * [.reply](#Common.reply) ⇒ <code>Promise</code>
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
        * [~__function([inc])](#Common..__function) ⇒ <code>string</code> ℗

<a name="new_Common_new"></a>

### new Common()
Commonly required things. Helper functions and constants.

<a name="Common+isRelease"></a>

### common.isRelease : <code>boolean</code>
Whether this should be shown as a release version, or a debug version in
the log.

**Kind**: instance property of [<code>Common</code>](#Common)  
<a name="Common+spikeyId"></a>

### common.spikeyId : <code>string</code>
SpikeyRobot's Discord ID

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

### common.log(message, ip, [traceIncrease])
Format a log message to be logged.

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

<a name="Common+mention"></a>

### common.mention(msg) ⇒ <code>string</code>
Creates formatted string for mentioning the author of msg.

**Kind**: instance method of [<code>Common</code>](#Common)  
**Returns**: <code>string</code> - Formatted mention string.  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord~Message</code> | Message to format a mention for the author of. |

<a name="Common+reply"></a>

### common.reply(msg, text, post) ⇒ <code>Promise</code>
Replies to the author and channel of msg with the given message.

**Kind**: instance method of [<code>Common</code>](#Common)  
**Returns**: <code>Promise</code> - Promise of Discord~Message that we attempted to send.  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord~Message</code> | Message to reply to. |
| text | <code>string</code> | The main body of the message. |
| post | <code>string</code> | The footer of the message. |

<a name="Common.mention"></a>

### Common.mention ⇒ <code>string</code>
Creates formatted string for mentioning the author of msg.

**Kind**: static property of [<code>Common</code>](#Common)  
**Returns**: <code>string</code> - Formatted mention string.  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord~Message</code> | Message to format a mention for the author of. |

<a name="Common.reply"></a>

### Common.reply ⇒ <code>Promise</code>
Replies to the author and channel of msg with the given message.

**Kind**: static property of [<code>Common</code>](#Common)  
**Returns**: <code>Promise</code> - Promise of Discord~Message that we attempted to send.  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Discord~Message</code> | Message to reply to. |
| text | <code>string</code> | The main body of the message. |
| post | <code>string</code> | The footer of the message. |

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
**Returns**: <code>string</code> - Formatted string with length 20.  
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

<a name="Common..__function"></a>

### Common~__function([inc]) ⇒ <code>string</code> ℗
Gets the name of the function that called a log function.

**Kind**: inner method of [<code>Common</code>](#Common)  
**Returns**: <code>string</code> - Function name in call stack.  
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
        * [.prefix](#SubModule+prefix) : <code>string</code>
        * [.myPrefix](#SubModule+myPrefix) : <code>string</code>
        * *[.postPrefix](#SubModule+postPrefix) : <code>string</code>*
        * [.Discord](#SubModule+Discord) : <code>Discord</code>
        * [.client](#SubModule+client) : <code>Discord~Client</code>
        * [.command](#SubModule+command) : [<code>Command</code>](#SpikeyBot..Command)
        * [.common](#SubModule+common) : [<code>Common</code>](#Common)
        * [.bot](#SubModule+bot) : [<code>SpikeyBot</code>](#SpikeyBot)
        * [.myName](#SubModule+myName) : <code>string</code>
        * [.initialized](#SubModule+initialized) : <code>boolean</code>
        * [.commit](#SubModule+commit) : <code>string</code>
        * [.createGame(players, channel)](#Connect4+createGame)
        * [.initialize()](#SubModule+initialize)
        * [.begin(prefix, Discord, client, command, common, bot)](#SubModule+begin)
        * [.end()](#SubModule+end)
        * [.log(msg)](#SubModule+log)
        * [.error(msg)](#SubModule+error)
        * [.shutdown()](#SubModule+shutdown)
        * *[.save()](#SubModule+save)*
        * *[.unloadable()](#SubModule+unloadable) ⇒ <code>boolean</code>*
    * _inner_
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
<a name="SubModule+prefix"></a>

### connect4.prefix : <code>string</code>
The main prefix in use for this bot. Only available after begin() is
called.

**Kind**: instance property of [<code>Connect4</code>](#Connect4)  
**Read only**: true  
<a name="SubModule+myPrefix"></a>

### connect4.myPrefix : <code>string</code>
The prefix this submodule uses. Formed by prepending this.prefix to
this.postPrefix. this.postPrefix must be defined before begin(), otherwise
it is ignored.

**Kind**: instance property of [<code>Connect4</code>](#Connect4)  
**Read only**: true  
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

### connect4.command : [<code>Command</code>](#SpikeyBot..Command)
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

### connect4.begin(prefix, Discord, client, command, common, bot)
Initialize this submodule.

**Kind**: instance method of [<code>Connect4</code>](#Connect4)  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| prefix | <code>string</code> | The global prefix for this bot. |
| Discord | <code>Discord</code> | The Discord object for the API library. |
| client | <code>Discord~Client</code> | The client that represents this bot. |
| command | [<code>Command</code>](#SpikeyBot..Command) | The command instance in which to register command listeners. |
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

### *connect4.save()*
Saves all data to files necessary for saving current state.

**Kind**: instance abstract method of [<code>Connect4</code>](#Connect4)  
<a name="SubModule+unloadable"></a>

### *connect4.unloadable() ⇒ <code>boolean</code>*
Check if this module is in a state that is ready to be unloaded. If false
is returned, this module should not be unloaded and doing such may risk
putting the module into an uncontrollable state.

**Kind**: instance abstract method of [<code>Connect4</code>](#Connect4)  
**Returns**: <code>boolean</code> - True if can be unloaded, false if cannot.  
**Access**: public  
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

<a name="HGWeb"></a>

## HGWeb
Creates a web interface for managing the Hungry Games.

**Kind**: global class  

* [HGWeb](#HGWeb)
    * [new HGWeb(hg)](#new_HGWeb_new)
    * _instance_
        * [.shutdown([skipSave])](#HGWeb+shutdown)
        * [.dayStateChange(gId)](#HGWeb+dayStateChange)
    * _inner_
        * [~loginInfo](#HGWeb..loginInfo) : <code>Object.&lt;Object&gt;</code> ℗
        * [~sockets](#HGWeb..sockets) : <code>Object.&lt;Socket&gt;</code> ℗
        * [~siblingSockets](#HGWeb..siblingSockets) : <code>Object.&lt;Socket&gt;</code> ℗
        * [~tokenHost](#HGWeb..tokenHost) : <code>Object</code> ℗
        * [~apiHost](#HGWeb..apiHost) : <code>Object</code> ℗
        * [~startClient()](#HGWeb..startClient) ℗
        * [~handler(req, res)](#HGWeb..handler) ℗
        * [~purgeSessions()](#HGWeb..purgeSessions) ℗
        * [~socketConnection(socket)](#HGWeb..socketConnection) ℗
            * [~receivedLoginInfo(data)](#HGWeb..socketConnection..receivedLoginInfo) ℗
            * [~callSocketFunction(func, args, [forward])](#HGWeb..socketConnection..callSocketFunction) ℗
        * [~clientSocketConnection(socket)](#HGWeb..clientSocketConnection) ℗
        * [~replyNoPerm(socket, cmd)](#HGWeb..replyNoPerm) ℗
        * [~checkMyGuild(gId)](#HGWeb..checkMyGuild) ⇒ <code>boolean</code> ℗
        * [~checkPerm(userData, gId)](#HGWeb..checkPerm) ⇒ <code>boolean</code> ℗
        * [~checkChannelPerm(userData, gId, cId)](#HGWeb..checkChannelPerm) ⇒ <code>boolean</code> ℗
        * [~fetchIdentity(loginInfo, cb)](#HGWeb..fetchIdentity) ℗
        * [~makeMember(m)](#HGWeb..makeMember) ⇒ <code>Object</code> ℗
        * [~apiRequest(loginInfo, path, cb)](#HGWeb..apiRequest) ℗
        * [~discordRequest(data, cb, host)](#HGWeb..discordRequest) ℗
        * [~makeRefreshTimeout(loginInfo, cb)](#HGWeb..makeRefreshTimeout) ℗
        * [~refreshToken(refreshToken, cb)](#HGWeb..refreshToken) ℗
        * [~authorizeRequest(code, cb)](#HGWeb..authorizeRequest) ℗
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
        * [~createEvent(userData, socket, gId, type, message, nV, nA, oV, oA, kV, kA, [cb])](#HGWeb..createEvent) : <code>HGWeb~SocketFunction</code> ℗
        * [~createMajorEvent(userData, socket, gId, type, data, [cb])](#HGWeb..createMajorEvent) : <code>HGWeb~SocketFunction</code> ℗
        * [~editMajorEvent(userData, socket, gId, type, search, data, name, newName, [cb])](#HGWeb..editMajorEvent) : <code>HGWeb~SocketFunction</code> ℗
        * [~removeEvent(userData, socket, gId, type, event, [cb])](#HGWeb..removeEvent) : <code>HGWeb~SocketFunction</code> ℗
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

<a name="HGWeb..loginInfo"></a>

### HGWeb~loginInfo : <code>Object.&lt;Object&gt;</code> ℗
Stores the tokens and associated data for all clients connected while data
is valid.

**Kind**: inner property of [<code>HGWeb</code>](#HGWeb)  
**Access**: private  
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
<a name="HGWeb..tokenHost"></a>

### HGWeb~tokenHost : <code>Object</code> ℗
The url to send a received `code` to via `POST` to receive a user's
tokens.

**Kind**: inner constant of [<code>HGWeb</code>](#HGWeb)  
**Default**: <code>{&quot;protocol&quot;:&quot;https:&quot;,&quot;host&quot;:&quot;discordapp.com&quot;,&quot;path&quot;:&quot;/api/oauth2/token&quot;,&quot;method&quot;:&quot;POST&quot;}</code>  
**Access**: private  
<a name="HGWeb..apiHost"></a>

### HGWeb~apiHost : <code>Object</code> ℗
The url to send a request to the discord api.

**Kind**: inner constant of [<code>HGWeb</code>](#HGWeb)  
**Default**: <code>{&quot;protocol&quot;:&quot;https:&quot;,&quot;host&quot;:&quot;discordapp.com&quot;,&quot;path&quot;:&quot;/api&quot;,&quot;method&quot;:&quot;GET&quot;}</code>  
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

<a name="HGWeb..purgeSessions"></a>

### HGWeb~purgeSessions() ℗
Purge stale data from loginInfo.

**Kind**: inner method of [<code>HGWeb</code>](#HGWeb)  
**Access**: private  
<a name="HGWeb..socketConnection"></a>

### HGWeb~socketConnection(socket) ℗
Handler for a new socket connecting.

**Kind**: inner method of [<code>HGWeb</code>](#HGWeb)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| socket | <code>socketIo~Socket</code> | The socket.io socket that connected. |


* [~socketConnection(socket)](#HGWeb..socketConnection) ℗
    * [~receivedLoginInfo(data)](#HGWeb..socketConnection..receivedLoginInfo) ℗
    * [~callSocketFunction(func, args, [forward])](#HGWeb..socketConnection..callSocketFunction) ℗

<a name="HGWeb..socketConnection..receivedLoginInfo"></a>

#### socketConnection~receivedLoginInfo(data) ℗
Received the login credentials for user, lets store it for this
session,
and refresh the tokens when necessary.

**Kind**: inner method of [<code>socketConnection</code>](#HGWeb..socketConnection)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| data | <code>Object</code> | User data. |

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
Send a message to the given socket inorming the client that the command
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

### HGWeb~checkPerm(userData, gId) ⇒ <code>boolean</code> ℗
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

<a name="HGWeb..checkChannelPerm"></a>

### HGWeb~checkChannelPerm(userData, gId, cId) ⇒ <code>boolean</code> ℗
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

<a name="HGWeb..fetchIdentity"></a>

### HGWeb~fetchIdentity(loginInfo, cb) ℗
Fetches the identity of the user we have the token of.

**Kind**: inner method of [<code>HGWeb</code>](#HGWeb)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| loginInfo | <code>LoginInfo</code> | The credentials of the session user. |
| cb | <code>singleCB</code> | The callback storing the user's data, or null if something went wrong. |

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

<a name="HGWeb..apiRequest"></a>

### HGWeb~apiRequest(loginInfo, path, cb) ℗
Formats a request to the discord api at the given path.

**Kind**: inner method of [<code>HGWeb</code>](#HGWeb)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| loginInfo | <code>LoginInfo</code> | The credentials of the user we are sending the request for. |
| path | <code>string</code> | The path for the api request to send. |
| cb | <code>basicCallback</code> | The response from the https request with error and data arguments. |

<a name="HGWeb..discordRequest"></a>

### HGWeb~discordRequest(data, cb, host) ℗
Send a https request to discord.

**Kind**: inner method of [<code>HGWeb</code>](#HGWeb)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| data | <code>Object</code> \| <code>string</code> | The data to send in the request. |
| cb | <code>basicCallback</code> | Callback with error, and data arguments. |
| host | <code>Object</code> | Request object to override the default with. |

<a name="HGWeb..makeRefreshTimeout"></a>

### HGWeb~makeRefreshTimeout(loginInfo, cb) ℗
Refreshes the given token once it expires.

**Kind**: inner method of [<code>HGWeb</code>](#HGWeb)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| loginInfo | <code>LoginInfo</code> | The credentials to refresh. |
| cb | <code>singleCB</code> | The callback that is fired storing the new credentials once they are refreshed. |

<a name="HGWeb..refreshToken"></a>

### HGWeb~refreshToken(refreshToken, cb) ℗
Request new credentials with refresh token from discord.

**Kind**: inner method of [<code>HGWeb</code>](#HGWeb)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| refreshToken | <code>string</code> | The refresh token used for refreshing credentials. |
| cb | <code>basicCallback</code> | The callback from the https request, with an error argument, and a data argument. |

<a name="HGWeb..authorizeRequest"></a>

### HGWeb~authorizeRequest(code, cb) ℗
Authenticate with the discord server using a login code.

**Kind**: inner method of [<code>HGWeb</code>](#HGWeb)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| code | <code>string</code> | The login code received from our client. |
| cb | <code>basicCallback</code> | The response from the https request with error and data arguments. |

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
**See**: {HungryGames.getGame}  

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
**See**: {HungryGames.getGame}  

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
**See**: {HungryGames.excludeUsers}  

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
**See**: {HungryGames.includeUsers}  

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
**See**: {HungryGames.setOption}  

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
**See**: {HungryGames.createGame}  

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
**See**: {HungryGames.resetGame}  

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
**See**: {HungryGames.startGame}  

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
**See**: {HungryGames.startAutoplay}  

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
**See**: {HungryGames.nextDay}  

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
**See**: {HungryGames.endGame}  

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
**See**: {HungryGames.pauseAutoplay}  

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
**See**: {HungryGames.editTeam}  

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

### HGWeb~createEvent(userData, socket, gId, type, message, nV, nA, oV, oA, kV, kA, [cb]) : <code>HGWeb~SocketFunction</code> ℗
Create a game event.

**Kind**: inner method of [<code>HGWeb</code>](#HGWeb)  
**Access**: private  
**See**: {HungryGames.createEvent}  

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
| [cb] | <code>basicCB</code> | Callback that fires once the requested action is complete, or has failed. |

<a name="HGWeb..createMajorEvent"></a>

### HGWeb~createMajorEvent(userData, socket, gId, type, data, [cb]) : <code>HGWeb~SocketFunction</code> ℗
Create a larger game event. Either Arena or Weapon at this point. If
message or weapon name already exists, this will instead edit the event.

**Kind**: inner method of [<code>HGWeb</code>](#HGWeb)  
**Access**: private  
**See**: {HungryGames.addMajorEvent}  

| Param | Type | Description |
| --- | --- | --- |
| userData | <code>Object</code> | The current user's session data. |
| socket | <code>socketIo~Socket</code> | The socket connection to reply on. |
| gId | <code>number</code> \| <code>string</code> | The guild id to look at. |
| type | <code>string</code> | The type of event. |
| data | [<code>ArenaEvent</code>](#HungryGames..ArenaEvent) \| [<code>WeaponEvent</code>](#HungryGames..WeaponEvent) | The event data. |
| [cb] | <code>basicCB</code> | Callback that fires once the requested action is complete, or has failed. |

<a name="HGWeb..editMajorEvent"></a>

### HGWeb~editMajorEvent(userData, socket, gId, type, search, data, name, newName, [cb]) : <code>HGWeb~SocketFunction</code> ℗
Delete a larger game event. Either Arena or Weapon at this point.

**Kind**: inner method of [<code>HGWeb</code>](#HGWeb)  
**Access**: private  
**See**: {HungryGames.editMajorEvent}  

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
**See**: {HungryGames.removeEvent}  

| Param | Type | Description |
| --- | --- | --- |
| userData | <code>Object</code> | The current user's session data. |
| socket | <code>socketIo~Socket</code> | The socket connection to reply on. |
| gId | <code>number</code> \| <code>string</code> | The guild id to look at. |
| type | <code>string</code> | The type of event. |
| event | [<code>Event</code>](#HungryGames..Event) | The game event to remove. |
| [cb] | <code>basicCB</code> | Callback that fires once the requested action is complete, or has failed. |

<a name="HGWeb..basicCB"></a>

### HGWeb~basicCB : <code>function</code>
Basic callback with single argument. The argument is null if there is no
error, or a string if there was an error.

**Kind**: inner typedef of [<code>HGWeb</code>](#HGWeb)  

| Param | Type | Description |
| --- | --- | --- |
| err | <code>string</code> | The error response. |

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
        * [.bot](#SubModule+bot) : [<code>SpikeyBot</code>](#SpikeyBot)
        * *[.myName](#SubModule+myName) : <code>string</code>*
        * [.initialized](#SubModule+initialized) : <code>boolean</code>
        * [.roleName](#HungryGames+roleName) : <code>string</code>
        * [.defaultOptions](#HungryGames+defaultOptions) : <code>Object.&lt;{value: (string\|number\|boolean), values: ?Array.&lt;string&gt;, comment: string}&gt;</code>
        * [.commit](#SubModule+commit) : <code>string</code>
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
        * [.editTeam(uId, gId, cmd, one, two)](#HungryGames+editTeam)
        * [.makeAndAddEvent(id, type, message, numVictim, numAttacker, victimOutcome, attackerOutcome, victimKiller, attackerKiller)](#HungryGames+makeAndAddEvent) ⇒ <code>string</code>
        * [.addEvent(id, type, event)](#HungryGames+addEvent) ⇒ <code>string</code>
        * [.addMajorEvent(id, type, data, [name])](#HungryGames+addMajorEvent) ⇒ <code>string</code>
        * [.editMajorEvent(id, type, search, data, [name], [newName])](#HungryGames+editMajorEvent) ⇒ <code>string</code>
        * [.removeEvent(id, type, event)](#HungryGames+removeEvent) ⇒ <code>string</code>
        * [.eventsEqual(e1, e2)](#HungryGames+eventsEqual) ⇒ <code>boolean</code>
        * [.getNumSimulating()](#HungryGames+getNumSimulating) ⇒ <code>number</code>
        * [.initialize()](#SubModule+initialize)
        * [.begin(prefix, Discord, client, command, common, bot)](#SubModule+begin)
        * [.end()](#SubModule+end)
        * [.log(msg)](#SubModule+log)
        * [.error(msg)](#SubModule+error)
        * [.shutdown()](#SubModule+shutdown)
        * [.save()](#SubModule+save)
        * [.unloadable()](#SubModule+unloadable) ⇒ <code>boolean</code>
    * _inner_
        * [~Player](#HungryGames..Player)
            * [new Player(id, username, avatarURL)](#new_HungryGames..Player_new)
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
        * [~oldSaveFile](#HungryGames..oldSaveFile) : <code>string</code> ℗
        * [~saveFile](#HungryGames..saveFile) : <code>string</code> ℗
        * [~hgSaveDir](#HungryGames..hgSaveDir) : <code>string</code> ℗
        * [~eventFile](#HungryGames..eventFile) : <code>string</code> ℗
        * [~messageFile](#HungryGames..messageFile) : <code>string</code> ℗
        * [~battleFile](#HungryGames..battleFile) : <code>string</code> ℗
        * [~weaponsFile](#HungryGames..weaponsFile) : <code>string</code> ℗
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
        * [~findDelay](#HungryGames..findDelay) : <code>number</code> ℗
        * [~defaultOptions](#HungryGames..defaultOptions) : <code>Object.&lt;{value: (string\|number\|boolean\|Object), values: ?Array.&lt;string&gt;, comment: string}&gt;</code> ℗
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
        * [~handleCommand(msg)](#HungryGames..handleCommand) : [<code>commandHandler</code>](#commandHandler) ℗
        * [~checkForRole(msg)](#HungryGames..checkForRole) ⇒ <code>boolean</code> ℗
        * [~checkPerms(msg, cb)](#HungryGames..checkPerms) ℗
        * [~makePlayer(user)](#HungryGames..makePlayer) ⇒ [<code>Player</code>](#HungryGames..Player) ℗
        * [~sendAtTime(channel, one, two, time)](#HungryGames..sendAtTime) ℗
        * [~createGame(msg, id, [silent])](#HungryGames..createGame) : [<code>hgCommandHandler</code>](#HungryGames..hgCommandHandler) ℗
        * [~getAllPlayers(members, excluded, bots, included, excludeByDefault)](#HungryGames..getAllPlayers) ⇒ [<code>Array.&lt;Player&gt;</code>](#HungryGames..Player) ℗
        * [~formTeams(id)](#HungryGames..formTeams) ℗
        * [~resetGame(msg, id)](#HungryGames..resetGame) : [<code>hgCommandHandler</code>](#HungryGames..hgCommandHandler) ℗
        * [~showGameInfo(msg, id)](#HungryGames..showGameInfo) : [<code>hgCommandHandler</code>](#HungryGames..hgCommandHandler) ℗
        * [~showGameEvents(msg, id)](#HungryGames..showGameEvents) : [<code>hgCommandHandler</code>](#HungryGames..hgCommandHandler) ℗
        * [~startGame(msg, id)](#HungryGames..startGame) : [<code>hgCommandHandler</code>](#HungryGames..hgCommandHandler) ℗
        * [~makeMessage(uId, gId, cId, msg)](#HungryGames..makeMessage) ⇒ <code>Object</code> ℗
        * [~pauseAutoplay(msg, id)](#HungryGames..pauseAutoplay) : [<code>hgCommandHandler</code>](#HungryGames..hgCommandHandler) ℗
        * [~startAutoplay(msg, id)](#HungryGames..startAutoplay) : [<code>hgCommandHandler</code>](#HungryGames..hgCommandHandler) ℗
        * [~nextDay(msg, id, [retry])](#HungryGames..nextDay) : [<code>hgCommandHandler</code>](#HungryGames..hgCommandHandler) ℗
        * [~pickEvent(userPool, eventPool, options, numAlive, teams, probOpts, weaponWielder)](#HungryGames..pickEvent) ⇒ [<code>Event</code>](#HungryGames..Event) ℗
        * [~validateEventTeamConstraint(numVictim, numAttacker, userPool, teams, options, victimsDie, attackersDie, weaponWielder)](#HungryGames..validateEventTeamConstraint) ⇒ <code>string</code> ℗
        * [~validateEventVictorConstraint(numVictim, numAttacker, numAlive, options, victimsDie, attackersDie)](#HungryGames..validateEventVictorConstraint) ⇒ <code>boolean</code> ℗
        * [~validateEventNumConstraint(numVictim, numAttacker, userPool, numAlive)](#HungryGames..validateEventNumConstraint) ⇒ <code>boolean</code> ℗
        * [~validateEventRequirements(numVictim, numAttacker, userPool, numAlive, teams, options, victimsDie, attackersDie, weaponWielder)](#HungryGames..validateEventRequirements) ⇒ <code>string</code> ℗
        * [~pickAffectedPlayers(numVictim, numAttacker, options, userPool, teams, weaponWielder)](#HungryGames..pickAffectedPlayers) ⇒ [<code>Array.&lt;Player&gt;</code>](#HungryGames..Player) ℗
        * [~makeBattleEvent(affectedUsers, numVictim, numAttacker, mention, id)](#HungryGames..makeBattleEvent) ⇒ [<code>Event</code>](#HungryGames..Event) ℗
        * [~weightedUserRand()](#HungryGames..weightedUserRand) ⇒ <code>number</code> ℗
        * [~probabilityEvent(eventPool, probabilityOpts, [recurse])](#HungryGames..probabilityEvent) ⇒ <code>number</code> ℗
        * [~formatMultiNames(names, mention)](#HungryGames..formatMultiNames) ⇒ <code>string</code> ℗
        * [~makeMessageEvent(message, [id])](#HungryGames..makeMessageEvent) ⇒ [<code>Event</code>](#HungryGames..Event) ℗
        * [~makeSingleEvent(message, affectedUsers, numVictim, numAttacker, mention, id, victimOutcome, attackerOutcome)](#HungryGames..makeSingleEvent) ⇒ <code>HungryGames~FinalEvent</code> ℗
        * [~getMiniIcons(users)](#HungryGames..getMiniIcons) ⇒ [<code>Array.&lt;UserIconUrl&gt;</code>](#HungryGames..UserIconUrl) ℗
        * [~printEvent(msg, id)](#HungryGames..printEvent) ℗
        * [~printDay(msg, id)](#HungryGames..printDay) ℗
        * [~endGame(msg, id)](#HungryGames..endGame) : [<code>hgCommandHandler</code>](#HungryGames..hgCommandHandler) ℗
        * [~excludeUser(msg, id)](#HungryGames..excludeUser) : [<code>hgCommandHandler</code>](#HungryGames..hgCommandHandler) ℗
        * [~includeUser(msg, id)](#HungryGames..includeUser) : [<code>hgCommandHandler</code>](#HungryGames..hgCommandHandler) ℗
        * [~listPlayers(msg, id)](#HungryGames..listPlayers) : [<code>hgCommandHandler</code>](#HungryGames..hgCommandHandler) ℗
        * [~getName(guild, user)](#HungryGames..getName) ⇒ <code>string</code> ℗
        * [~toggleOpt(msg, id)](#HungryGames..toggleOpt) : [<code>hgCommandHandler</code>](#HungryGames..hgCommandHandler) ℗
        * [~changeObjectValue(obj, defaultObj, option, value, values)](#HungryGames..changeObjectValue) ⇒ <code>string</code> ℗
        * [~showOpts(msg, options)](#HungryGames..showOpts) ℗
        * [~optChangeListener(msg_, options, index)](#HungryGames..optChangeListener) ℗
        * [~editTeam(msg, id, [silent])](#HungryGames..editTeam) : [<code>hgCommandHandler</code>](#HungryGames..hgCommandHandler) ℗
        * [~swapTeamUsers(msg, id)](#HungryGames..swapTeamUsers) ℗
        * [~moveTeamUser(msg, id)](#HungryGames..moveTeamUser) ℗
        * [~renameTeam(msg, id, [silent])](#HungryGames..renameTeam) ℗
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
        * [~commandStats(msg, id)](#HungryGames..commandStats) : [<code>hgCommandHandler</code>](#HungryGames..hgCommandHandler) ℗
        * [~nothing()](#HungryGames..nothing) ⇒ <code>string</code> ℗
        * [~getMessage(type)](#HungryGames..getMessage) ⇒ <code>string</code> ℗
        * [~find(id)](#HungryGames..find) ⇒ [<code>GuildGame</code>](#HungryGames..GuildGame) ℗
        * [~calcColNum(numCols, statusList)](#HungryGames..calcColNum) ⇒ <code>number</code> ℗
        * [~deepFreeze(object)](#HungryGames..deepFreeze) ⇒ <code>Object</code> ℗
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
Reset the speciefied category of data from a game.

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

### hungryGames.editTeam(uId, gId, cmd, one, two)
Allows editing teams. Entry for all team actions.

**Kind**: instance method of [<code>HungryGames</code>](#HungryGames)  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| uId | <code>string</code> | The id of the user is running the action. |
| gId | <code>string</code> | The id of the guild to run this in. |
| cmd | <code>string</code> | The command to run on the teams. |
| one | <code>string</code> | The id of the user to swap, or the new name of the team if we're renaming a team. |
| two | <code>string</code> | The id of the user to swap, or the team id if we're moving a player to a team. |

<a name="HungryGames+makeAndAddEvent"></a>

### hungryGames.makeAndAddEvent(id, type, message, numVictim, numAttacker, victimOutcome, attackerOutcome, victimKiller, attackerKiller) ⇒ <code>string</code>
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

<a name="HungryGames+eventsEqual"></a>

### hungryGames.eventsEqual(e1, e2) ⇒ <code>boolean</code>
Checks if the two given events are equivalent.

**Kind**: instance method of [<code>HungryGames</code>](#HungryGames)  

| Param | Type |
| --- | --- |
| e1 | [<code>Event</code>](#HungryGames..Event) | 
| e2 | [<code>Event</code>](#HungryGames..Event) | 

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

### hungryGames.begin(prefix, Discord, client, command, common, bot)
Initialize this submodule.

**Kind**: instance method of [<code>HungryGames</code>](#HungryGames)  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| prefix | <code>string</code> | The global prefix for this bot. |
| Discord | <code>Discord</code> | The Discord object for the API library. |
| client | <code>Discord~Client</code> | The client that represents this bot. |
| command | [<code>Command</code>](#SpikeyBot..Command) | The command instance in which to register command listeners. |
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

### hungryGames.save()
Saves all data to files necessary for saving current state.

**Kind**: instance method of [<code>HungryGames</code>](#HungryGames)  
**Overrides**: [<code>save</code>](#SubModule+save)  
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
| living | <code>boolean</code> | Is the player still alive. |
| bleeding | <code>number</code> | How many days has the player been wounded. |
| rank | <code>number</code> | The current rank of the player in the game. |
| state | <code>string</code> | The current player state (normal, wounded, dead, zombie). |
| kills | <code>number</code> | The number of players this player has caused to die. |
| weapons | <code>Object.&lt;number&gt;</code> | The weapons the player currently has and how many of each. |

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
| [action] | <code>string</code> | The action to format into a message if this is a weapon event. |
| victim | <code>Object</code> | Information about the victims in this event. |
| attacker | <code>Object</code> | Information about the attackers in this event. |
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
<a name="HungryGames..oldSaveFile"></a>

### HungryGames~oldSaveFile : <code>string</code> ℗
The old file location for storing hg data in order to upgrade data to new
format.

**Kind**: inner constant of [<code>HungryGames</code>](#HungryGames)  
**Default**: <code>&quot;./save/hg.json&quot;</code>  
**Access**: private  
**See**

- [games](#HungryGames..games)
- [saveFile](#HungryGames..saveFile)
- [HungryGames~saveFileDir](HungryGames~saveFileDir)

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
**Default**: <code>15 Minutes</code>  
**Access**: private  
<a name="HungryGames..findDelay"></a>

### HungryGames~findDelay : <code>number</code> ℗
The delay after failing to find a guild's data to look for it again.

**Kind**: inner constant of [<code>HungryGames</code>](#HungryGames)  
**Default**: <code>15 Seconds</code>  
**Access**: private  
<a name="HungryGames..defaultOptions"></a>

### HungryGames~defaultOptions : <code>Object.&lt;{value: (string\|number\|boolean\|Object), values: ?Array.&lt;string&gt;, comment: string}&gt;</code> ℗
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

<a name="HungryGames..pickEvent"></a>

### HungryGames~pickEvent(userPool, eventPool, options, numAlive, teams, probOpts, weaponWielder) ⇒ [<code>Event</code>](#HungryGames..Event) ℗
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
| probOpts | <code>HungryGames~OutcomeProbabilities</code> | Death rate weights. |
| weaponWielder | <code>Player</code> | A player that is using a weapon in this event, or null if no player is using a weapon. |

<a name="HungryGames..validateEventTeamConstraint"></a>

### HungryGames~validateEventTeamConstraint(numVictim, numAttacker, userPool, teams, options, victimsDie, attackersDie, weaponWielder) ⇒ <code>string</code> ℗
Ensure teammates don't attack eachother.

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

### HungryGames~pickAffectedPlayers(numVictim, numAttacker, options, userPool, teams, weaponWielder) ⇒ [<code>Array.&lt;Player&gt;</code>](#HungryGames..Player) ℗
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
| weaponWielder | <code>Player</code> | A player that is using a weapon in this event, or null if no player is using a weapon. |

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

### HungryGames~changeObjectValue(obj, defaultObj, option, value, values) ⇒ <code>string</code> ℗
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

### HungryGames~editTeam(msg, id, [silent]) : [<code>hgCommandHandler</code>](#HungryGames..hgCommandHandler) ℗
Entry for all team commands.

**Kind**: inner method of [<code>HungryGames</code>](#HungryGames)  
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
**Returns**: <code>number</code> - Number of colums the data shall be formatted as.  
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

<a name="HungryGames..WeaponEvent"></a>

### HungryGames~WeaponEvent : <code>Object</code>
An Arena event storing Events.

**Kind**: inner typedef of [<code>HungryGames</code>](#HungryGames)  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| [name] | <code>string</code> | Formattable name to use as the human readable weapon name. |
| [consumable] | <code>string</code> | The formatable string for what to call this weapons consumable items. |
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
        * [.prefix](#SubModule+prefix) : <code>string</code>
        * [.myPrefix](#SubModule+myPrefix) : <code>string</code>
        * *[.postPrefix](#SubModule+postPrefix) : <code>string</code>*
        * [.Discord](#SubModule+Discord) : <code>Discord</code>
        * [.client](#SubModule+client) : <code>Discord~Client</code>
        * [.command](#SubModule+command) : [<code>Command</code>](#SpikeyBot..Command)
        * [.common](#SubModule+common) : [<code>Common</code>](#Common)
        * [.bot](#SubModule+bot) : [<code>SpikeyBot</code>](#SpikeyBot)
        * [.myName](#SubModule+myName) : <code>string</code>
        * [.initialized](#SubModule+initialized) : <code>boolean</code>
        * [.commit](#SubModule+commit) : <code>string</code>
        * [.initialize()](#SubModule+initialize)
        * [.begin(prefix, Discord, client, command, common, bot)](#SubModule+begin)
        * [.end()](#SubModule+end)
        * [.log(msg)](#SubModule+log)
        * [.error(msg)](#SubModule+error)
        * [.shutdown()](#SubModule+shutdown)
        * [.save()](#SubModule+save)
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
            * [~statsResponse(res)](#Main..commandStats..statsResponse) ℗
        * [~getStats()](#Main..getStats) ⇒ <code>Object</code> ℗
        * [~commandLookup(msg)](#Main..commandLookup) : [<code>commandHandler</code>](#commandHandler) ℗
        * [~sigint()](#Main..sigint) ℗
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
<a name="SubModule+initialize"></a>

### main.initialize()
The function called at the end of begin() for further initialization
specific to the subModule. Must be defined before begin() is called.

**Kind**: instance method of [<code>Main</code>](#Main)  
**Overrides**: [<code>initialize</code>](#SubModule+initialize)  
**Access**: protected  
<a name="SubModule+begin"></a>

### main.begin(prefix, Discord, client, command, common, bot)
Initialize this submodule.

**Kind**: instance method of [<code>Main</code>](#Main)  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| prefix | <code>string</code> | The global prefix for this bot. |
| Discord | <code>Discord</code> | The Discord object for the API library. |
| client | <code>Discord~Client</code> | The client that represents this bot. |
| command | [<code>Command</code>](#SpikeyBot..Command) | The command instance in which to register command listeners. |
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

### main.save()
Saves all data to files necessary for saving current state.

**Kind**: instance method of [<code>Main</code>](#Main)  
**Overrides**: [<code>save</code>](#SubModule+save)  
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

<a name="Main..commandStats..statsResponse"></a>

#### commandStats~statsResponse(res) ℗
Callback once all shards have replied with their stats.

**Kind**: inner method of [<code>commandStats</code>](#Main..commandStats)  
**Access**: private  

| Param | Type | Description |
| --- | --- | --- |
| res | <code>Array.&lt;Object&gt;</code> | Array of each response object. |

<a name="Main..getStats"></a>

### Main~getStats() ⇒ <code>Object</code> ℗
Fetch our statistics about the bot.

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
        * [.bot](#SubModule+bot) : [<code>SpikeyBot</code>](#SpikeyBot)
        * *[.myName](#SubModule+myName) : <code>string</code>*
        * [.initialized](#SubModule+initialized) : <code>boolean</code>
        * [.commit](#SubModule+commit) : <code>string</code>
        * [.initialize()](#SubModule+initialize)
        * [.begin(prefix, Discord, client, command, common, bot)](#SubModule+begin)
        * [.end()](#SubModule+end)
        * [.log(msg)](#SubModule+log)
        * [.error(msg)](#SubModule+error)
        * [.shutdown()](#SubModule+shutdown)
        * *[.save()](#SubModule+save)*
        * [.unloadable()](#SubModule+unloadable) ⇒ <code>boolean</code>
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
        * [~handleVoiceStateUpdate(oldState, newState)](#Music..handleVoiceStateUpdate) ℗
        * [~formatSongInfo(info)](#Music..formatSongInfo) ⇒ <code>Discord~MessageEmbed</code> ℗
        * [~formNum(num)](#Music..formNum) ⇒ <code>string</code> ℗
        * [~enqueueSong(broadcast, song, msg, info)](#Music..enqueueSong) ℗
        * [~startPlaying(broadcast)](#Music..startPlaying) ℗
        * [~makeBroadcast(broadcast)](#Music..makeBroadcast) ℗
        * [~startStream(input, done, progress)](#Music..startStream) ℗
        * [~endSong(broadcast)](#Music..endSong) ℗
        * [~skipSong(broadcast)](#Music..skipSong) ℗
        * [~commandJoin(msg)](#Music..commandJoin) : [<code>commandHandler</code>](#commandHandler) ℗
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
<a name="SubModule+initialize"></a>

### music.initialize()
The function called at the end of begin() for further initialization
specific to the subModule. Must be defined before begin() is called.

**Kind**: instance method of [<code>Music</code>](#Music)  
**Overrides**: [<code>initialize</code>](#SubModule+initialize)  
**Access**: protected  
<a name="SubModule+begin"></a>

### music.begin(prefix, Discord, client, command, common, bot)
Initialize this submodule.

**Kind**: instance method of [<code>Music</code>](#Music)  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| prefix | <code>string</code> | The global prefix for this bot. |
| Discord | <code>Discord</code> | The Discord object for the API library. |
| client | <code>Discord~Client</code> | The client that represents this bot. |
| command | [<code>Command</code>](#SpikeyBot..Command) | The command instance in which to register command listeners. |
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

### *music.save()*
Saves all data to files necessary for saving current state.

**Kind**: instance abstract method of [<code>Music</code>](#Music)  
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
    * _instance_
        * [.getSubmoduleCommits()](#SpikeyBot+getSubmoduleCommits) ⇒ <code>Array.&lt;{name: string, commit: string}&gt;</code>
        * [.getPrefix(id)](#SpikeyBot+getPrefix) ⇒ <code>string</code>
    * _inner_
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
        * [~testInstance](#SpikeyBot..testInstance) : <code>boolean</code> ℗
        * [~subModuleNames](#SpikeyBot..subModuleNames) : <code>Array.&lt;string&gt;</code> ℗
        * [~setDev](#SpikeyBot..setDev) : <code>boolean</code> ℗
        * [~minimal](#SpikeyBot..minimal) : <code>boolean</code> ℗
        * [~subModules](#SpikeyBot..subModules) : [<code>Array.&lt;SubModule&gt;</code>](#SubModule) ℗
        * [~disconnectReason](#SpikeyBot..disconnectReason) : <code>string</code> ℗
        * [~enableSharding](#SpikeyBot..enableSharding) : <code>boolean</code> ℗
        * [~numShards](#SpikeyBot..numShards) : <code>number</code> ℗
        * [~initialized](#SpikeyBot..initialized) : <code>boolean</code> ℗
        * [~reactToAnthony](#SpikeyBot..reactToAnthony) : <code>boolean</code> ℗
        * [~guildPrefixes](#SpikeyBot..guildPrefixes) : <code>Object.&lt;string&gt;</code> ℗
        * [~version](#SpikeyBot..version) : <code>string</code> ℗
        * [~testChannel](#SpikeyBot..testChannel) : <code>string</code> ℗
        * [~trustedIds](#SpikeyBot..trustedIds) : <code>Array.&lt;string&gt;</code> ℗
        * [~guildPrefixFile](#SpikeyBot..guildPrefixFile) : <code>string</code> ℗
        * [~helpmessagereply](#SpikeyBot..helpmessagereply) : <code>string</code> ℗
        * [~blockedmessage](#SpikeyBot..blockedmessage) : <code>string</code> ℗
        * [~onlyservermessage](#SpikeyBot..onlyservermessage) : <code>string</code> ℗
        * [~disabledcommandmessage](#SpikeyBot..disabledcommandmessage) : <code>string</code> ℗
        * [~command](#SpikeyBot..command) : [<code>Command</code>](#SpikeyBot..Command) ℗
        * [~isCmd(msg, cmd)](#SpikeyBot..isCmd) ⇒ <code>boolean</code> ℗
        * [~updateGame(game)](#SpikeyBot..updateGame) ℗
        * [~onReady()](#SpikeyBot..onReady) ℗
        * [~onDisconnect(event)](#SpikeyBot..onDisconnect) ℗
        * [~onReconnecting()](#SpikeyBot..onReconnecting) ℗
        * [~onMessage(msg)](#SpikeyBot..onMessage) ℗
        * [~commandToggleReact(msg)](#SpikeyBot..commandToggleReact) : [<code>commandHandler</code>](#commandHandler) ℗
        * [~commandHelp(msg)](#SpikeyBot..commandHelp) : [<code>commandHandler</code>](#commandHandler) ℗
        * [~commandUpdateGame(msg)](#SpikeyBot..commandUpdateGame) : [<code>commandHandler</code>](#commandHandler) ℗
        * [~commandChangePrefix(msg)](#SpikeyBot..commandChangePrefix) : [<code>commandHandler</code>](#commandHandler) ℗
        * [~commandReboot(msg)](#SpikeyBot..commandReboot) : [<code>commandHandler</code>](#commandHandler) ℗
        * [~commandReload(msg)](#SpikeyBot..commandReload) : [<code>commandHandler</code>](#commandHandler) ℗
        * [~reloadSubModules([toReload], [reloaded], [schedule])](#SpikeyBot..reloadSubModules) ⇒ <code>boolean</code> ℗
        * [~commandUpdate(msg)](#SpikeyBot..commandUpdate) : [<code>commandHandler</code>](#commandHandler) ℗
        * [~loadGuildPrefixes(guilds)](#SpikeyBot..loadGuildPrefixes) ℗

<a name="SpikeyBot+getSubmoduleCommits"></a>

### spikeyBot.getSubmoduleCommits() ⇒ <code>Array.&lt;{name: string, commit: string}&gt;</code>
Get array of all submodule names and the commit they were last loaded from.

**Kind**: instance method of [<code>SpikeyBot</code>](#SpikeyBot)  
**Access**: public  
<a name="SpikeyBot+getPrefix"></a>

### spikeyBot.getPrefix(id) ⇒ <code>string</code>
Get this guild's custom prefix. Returns the default prefix otherwise.

**Kind**: instance method of [<code>SpikeyBot</code>](#SpikeyBot)  
**Returns**: <code>string</code> - The prefix for all commands in the given guild.  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>Discord~Guild</code> \| <code>string</code> \| <code>number</code> | The guild id or guild to lookup. |

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
<a name="SpikeyBot..testInstance"></a>

### SpikeyBot~testInstance : <code>boolean</code> ℗
Is the bot started with the intent of solely running a unit test. Reduces
messages sent that are unnecessary.

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
<a name="SpikeyBot..initialized"></a>

### SpikeyBot~initialized : <code>boolean</code> ℗
Has the bot been initialized already.

**Kind**: inner property of [<code>SpikeyBot</code>](#SpikeyBot)  
**Default**: <code>false</code>  
**Access**: private  
<a name="SpikeyBot..reactToAnthony"></a>

### SpikeyBot~reactToAnthony : <code>boolean</code> ℗
Should we add a reaction to every message that Anthony sends. Overriden if
reboot.dat exists.

**Kind**: inner property of [<code>SpikeyBot</code>](#SpikeyBot)  
**Access**: private  
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

<a name="SpikeyBot..commandChangePrefix"></a>

### SpikeyBot~commandChangePrefix(msg) : [<code>commandHandler</code>](#commandHandler) ℗
Change the custom prefix for the given guild.

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

<a name="SpikeyBot..reloadSubModules"></a>

### SpikeyBot~reloadSubModules([toReload], [reloaded], [schedule]) ⇒ <code>boolean</code> ℗
Reloads submodules from file. Reloads all modules if `toReload` is not
specified. `reloaded` will contain the list of messages describing which
submodules were reloaded, or not.

**Kind**: inner method of [<code>SpikeyBot</code>](#SpikeyBot)  
**Returns**: <code>boolean</code> - True if something failed and not all submodules were
reloaded.  
**Access**: private  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [toReload] | <code>string</code> \| <code>Array.&lt;string&gt;</code> |  | Specify submodules to reload, or null to reload all submodules. |
| [reloaded] | <code>Array.&lt;string&gt;</code> |  | Reference to a variable to store output status information about outcomes of attempting to reload submodules. |
| [schedule] | <code>boolean</code> | <code>true</code> | Automatically re-schedule reload for submodules if they are in an unloadable state. |

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
        * [.bot](#SubModule+bot) : [<code>SpikeyBot</code>](#SpikeyBot)
        * *[.myName](#SubModule+myName) : <code>string</code>*
        * [.initialized](#SubModule+initialized) : <code>boolean</code>
        * [.commit](#SubModule+commit) : <code>string</code>
        * *[.initialize()](#SubModule+initialize)*
        * [.begin(prefix, Discord, client, command, common, bot)](#SubModule+begin)
        * [.end()](#SubModule+end)
        * [.log(msg)](#SubModule+log)
        * [.error(msg)](#SubModule+error)
        * *[.shutdown()](#SubModule+shutdown)*
        * *[.save()](#SubModule+save)*
        * *[.unloadable()](#SubModule+unloadable) ⇒ <code>boolean</code>*
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
<a name="SubModule+initialize"></a>

### *subModule.initialize()*
The function called at the end of begin() for further initialization
specific to the subModule. Must be defined before begin() is called.

**Kind**: instance abstract method of [<code>SubModule</code>](#SubModule)  
**Access**: protected  
<a name="SubModule+begin"></a>

### subModule.begin(prefix, Discord, client, command, common, bot)
Initialize this submodule.

**Kind**: instance method of [<code>SubModule</code>](#SubModule)  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| prefix | <code>string</code> | The global prefix for this bot. |
| Discord | <code>Discord</code> | The Discord object for the API library. |
| client | <code>Discord~Client</code> | The client that represents this bot. |
| command | [<code>Command</code>](#SpikeyBot..Command) | The command instance in which to register command listeners. |
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

### *subModule.save()*
Saves all data to files necessary for saving current state.

**Kind**: instance abstract method of [<code>SubModule</code>](#SubModule)  
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
        * [.prefix](#SubModule+prefix) : <code>string</code>
        * [.myPrefix](#SubModule+myPrefix) : <code>string</code>
        * *[.postPrefix](#SubModule+postPrefix) : <code>string</code>*
        * [.Discord](#SubModule+Discord) : <code>Discord</code>
        * [.client](#SubModule+client) : <code>Discord~Client</code>
        * [.command](#SubModule+command) : [<code>Command</code>](#SpikeyBot..Command)
        * [.common](#SubModule+common) : [<code>Common</code>](#Common)
        * [.bot](#SubModule+bot) : [<code>SpikeyBot</code>](#SpikeyBot)
        * [.myName](#SubModule+myName) : <code>string</code>
        * [.initialized](#SubModule+initialized) : <code>boolean</code>
        * [.commit](#SubModule+commit) : <code>string</code>
        * [.createGame(players, channel)](#TicTacToe+createGame)
        * [.initialize()](#SubModule+initialize)
        * [.begin(prefix, Discord, client, command, common, bot)](#SubModule+begin)
        * [.end()](#SubModule+end)
        * [.log(msg)](#SubModule+log)
        * [.error(msg)](#SubModule+error)
        * [.shutdown()](#SubModule+shutdown)
        * *[.save()](#SubModule+save)*
        * *[.unloadable()](#SubModule+unloadable) ⇒ <code>boolean</code>*
    * _inner_
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
<a name="SubModule+prefix"></a>

### ticTacToe.prefix : <code>string</code>
The main prefix in use for this bot. Only available after begin() is
called.

**Kind**: instance property of [<code>TicTacToe</code>](#TicTacToe)  
**Read only**: true  
<a name="SubModule+myPrefix"></a>

### ticTacToe.myPrefix : <code>string</code>
The prefix this submodule uses. Formed by prepending this.prefix to
this.postPrefix. this.postPrefix must be defined before begin(), otherwise
it is ignored.

**Kind**: instance property of [<code>TicTacToe</code>](#TicTacToe)  
**Read only**: true  
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

### ticTacToe.command : [<code>Command</code>](#SpikeyBot..Command)
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

### ticTacToe.begin(prefix, Discord, client, command, common, bot)
Initialize this submodule.

**Kind**: instance method of [<code>TicTacToe</code>](#TicTacToe)  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| prefix | <code>string</code> | The global prefix for this bot. |
| Discord | <code>Discord</code> | The Discord object for the API library. |
| client | <code>Discord~Client</code> | The client that represents this bot. |
| command | [<code>Command</code>](#SpikeyBot..Command) | The command instance in which to register command listeners. |
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

### *ticTacToe.save()*
Saves all data to files necessary for saving current state.

**Kind**: instance abstract method of [<code>TicTacToe</code>](#TicTacToe)  
<a name="SubModule+unloadable"></a>

### *ticTacToe.unloadable() ⇒ <code>boolean</code>*
Check if this module is in a state that is ready to be unloaded. If false
is returned, this module should not be unloaded and doing such may risk
putting the module into an uncontrollable state.

**Kind**: instance abstract method of [<code>TicTacToe</code>](#TicTacToe)  
**Returns**: <code>boolean</code> - True if can be unloaded, false if cannot.  
**Access**: public  
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

