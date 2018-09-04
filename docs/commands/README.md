# Commands Help
## Time Control
## Events
## Team Settings
## Player Settings
## Game Settings
# Hungry Games!
#### To use any of these commands you must have the "HG Creator" role. Use https://www.spikeybot.com/hg/ if commands are too hard.
***

| Command | Description | Aliases |
| --- | --- | --- |
| ?hg create | This will create a game with default settings if it doesn't exist already. | create, c, new |
| ?hg options 'option name' 'value' | List options if no name, or change the option if you give a name. | options, option, opt, opts |
| ?hg reset 'all/current/events/options/teams' | Delete data about the Games. Don't choose an option for more info. |  |


| Command | Description | Aliases |
| --- | --- | --- |
| ?hg players | This will list all players I currently care about. | players, player |
| ?hg exclude 'mention' | Prevent someone from being added to the next game. | exclude, remove, exc, ex |
| ?hg include 'mention' | Add a person back into the next game. | include, add, inc, in |


| Command | Description |
| --- | --- |
| ?hg teams swap 'mention' 'mention' | This will swap two players to the other team. |
| ?hg teams move 'mention' 'id/mention' | This will move the first player, to another team. (Ignores teamSize option) |
| ?hg teams rename 'id/mention' 'name...' | Rename a team. Specify its id, or mention someone on a team. |
| ?hg teams randomize | Randomize who is on what team. |
| ?hg teams reset | Delete all teams and start over. |


| Command | Description | Aliases |
| --- | --- | --- |
| ?hg events | This will list all custom events that could happen in the game. | events, event |
| ?hg debugevents | This will let you download all of the events and their data. |  |
| ?hg events add 'message' | Begins process of adding a custom event. Not all event types can be created yet due to the complications of making a UI. | add, create |
| ?hg events remove 'number' | Remove a custom event. The number is the number shown in the list of events. | remove, delete |


| Command | Description | Aliases |
| --- | --- | --- |
| ?hg start | This will start a game with your settings. | start, s |
| ?hg end | This will end a game early. | end, abort, stop |
| ?hg autoplay | Automatically continue to the next day after a day is over. | autoplay, auto, resume, play, go |
| ?hg pause | Stop autoplay at the end of the day. |  |
| ?hg next | Simulate the next day of the Games! | next, nextday |

## Admin Stuff
## Math Stuff
## Music Stuff
## Random Stuff
## Games Stuff
## General Stuff
# Main Commands
#### Here's the list of stuff I can do! PM SpikeyRobot (?pmspikey) feature requests!
See [spikeybot.com](https://www.spikeybot.com/) for examples and more information.
***

| Command | Description | Aliases |
| --- | --- | --- |
| ?addme | I will send you a link to add me to your server! |  |
| ?help | Send this message to you. |  |
| ?say | Make me say something. |  |
| ?createdate 'mention' | I will tell you the date you created your account! |  |
| ?joindate 'mention' | I will tell you the date you joined the server you sent the message from! |  |
| ?pmme | I will introduce myself to you! |  |
| ?pmspikey 'message' | I will send SpikeyRobot (my creator) your message because you are too shy! |  |
| ?avatar 'mention' | Need a better look at your profile pic? I'll show you the original. | avatar, profile |
| ?ping | Want to know what my delay to the server is? I can tell you my ping! |  |
| ?timer 'minutes' 'message...' | Set a timer for a certain number of seconds. The bot will DM you the message at the end. No options lists timers. |  |
| ?stats | Displays statistics about the bot and the servers it's on. |  |


| Command | Description |
| --- | --- |
| ?tictactoe 'mention' | Play a game of Tic Tac Toe with someone! (Mention someone to challenge them) |
| ?connect4 'mention' | Start a game of Connect 4 against someone! (Mention someone to challenge them) |


| Command | Description | Aliases |
| --- | --- | --- |
| ?flip | I have an unlimited supply of coins! I will flip one for you! |  |
| ?roll 'numbers...' | Roll dice with any number of sides. Separate multiple numbers with spaces to roll multiple dice. | roll, dice, die, d |


| Command | Description | Aliases |
| --- | --- | --- |
| ?play 'url or search' | Play a song in your current voice channel, or add a song to the queue. |  |
| ?join | Join you in your voice channel. |  |
| ?stop | Stop playing music and leave the voice channel. | leave, stop, stfu |
| ?skip | Skip the currently playing song. |  |
| ?queue | View the songs currently in the queue. | queue, playing |
| ?remove 'index' | Remove a song with the given queue index from the queue. | remove, dequeue |
| ?lyrics 'song' | Search for song lyrics. |  |


| Command | Description | Aliases |
| --- | --- | --- |
| ?add 'numbers' | Add positive or negative numbers separated by spaces. |  |
| ?simplify 'equation' | Simplify an equation with numbers and variables. |  |
| ?solve 'equation' | Solve an equation for each variable in the equation. |  |
| ?evaluate 'problem' | Solve a math problem, and convert units. | eval, evaluate |
| ?derive 'equation with x' | Find dy/dx of an equation. |  |
| ?graph 'equation with x' '[xMin, xMax]' '[yMin, yMax]' | Graph an equation, Maxes and mins are all optional, but brackets are required. |  |


| Command | Description | Aliases |
| --- | --- | --- |
| ?purge 'number' 'mentions' | Remove a number of messages from the current text channel. Mention people to only remove their messages. Limited to 100 messages per command (Discord doesn't allow more). May stop at messages sent 2 weeks prior. | purge, prune |
| ?ban 'mention' | I will ban the person you mention with a flashy message! | ban, fuckyou |
| ?smite 'mention' | Silence the peasant who dare oppose you! |  |
| ?togglemute | Turn on or off automatically preventing a person from using @everyone if they spam it. |  |
| ?togglebanmessages | Turn on or off sending a message when someone gets banned. |  |
| ?changeprefix | Set a custom prefix for all commands on the current server. |  |

