# Commands Help
# Admin Commands
#### Commands only admins are usually able to do.
***
## Cleanup and Users

| Command | Description | Aliases |
| --- | --- | --- |
| ?purge | Remove a number of messages from the current text channel. Mention people to only remove their messages. Limited to 100 messages per command (Discord doesn't allow more). May stop at messages sent 2 weeks prior. | purge, prune |
| ?ban | I will ban the person you mention with a flashy message! | ban, fuckyou |
| ?smite | Silence the peasant who dare oppose you! |  |
| ?togglemute | Turn on or off automatically preventing a person from using @everyone if they spam it. |  |
| ?togglebanmessages | Turn on or off sending a message when someone gets banned. |  |
| ?togglerigged | Turn on or off showing the number of times 'rigged' has been said. |  |
| ?togglechatbot | Turn on or off the Chatbot features (@'ing the bot causing it to reply). |  |

## Command Settings

| Command | Description | Aliases |
| --- | --- | --- |
| ?enable | Enable a command that is currently disabled for a user, guild, channel, role, or permission. |  |
| ?disable | Disable a command that is currently enabled for a user, guild, channel, role, or permission. |  |
| ?mutecmd | Hide messages that tell users they don't have permission to use a command. | mutecmd, blockcmd, supresscmd |
| ?unmutecmd | Un-hide messages that tell users they don't have permission to use a command. | unmutecmd, allowcmd |
| ?show | Show all current enabled and disabled command settings. | show, enabled, disabled, showenabled, showdisabled, settings, permissions |
| ?reset | Reset all enabled and disabled commands to default settings. |  |
| ?changeprefix | Set a custom prefix for all commands on the current server. |  |

# Hungry Games
#### Use https://www.spikeybot.com/hg/ if commands are too hard.
***
## Time Control

| Command | Description | Aliases |
| --- | --- | --- |
| ?hg auto | Automatically start the game and continue until the game is completely over. | autoplay, auto, play, go |
| ?hg pause | Pause the game and immediately stop sending messages without ending the game entirely. |  |
| ?hg start | This will start a game with your settings, but waits until you tell it to start the bloodbath. | start, s |
| ?hg end | This will end a game early. | end, abort, stop |
| ?hg next | Simulate the next day of the Games! | next, nextday, resume |

## Game Settings

| Command | Description | Aliases |
| --- | --- | --- |
| ?hg create | You shouldn't need to use this. But it will force a new game to be created, and update players for a new game. | create, c, new |
| ?hg options | List options if no name, or change the option if you give a name. | options, option, opt, opts, settings, setting, set |
| ?hg rename | Rename the game to your own custom name. The default is "{SERVER NAME}'s Hungry Games". The custom name must be 100 characters or fewer. | rename, name |
| ?hg reset | Delete data about the Games. Don't choose an option for more info. | reset, clear |

## Player Settings

| Command | Description | Aliases |
| --- | --- | --- |
| ?hg players | This will list all players I currently care about. | players, player, list |
| ?hg exclude | Prevent someone from being added to the next game. | exclude, remove, exc, ex |
| ?hg include | Add a person back into the next game. | include, add, inc, in |

## NPC Settings

| Command | Description | Aliases |
| --- | --- | --- |
| ?hg npcs | This will list all players I currently care about. | npc, ai, npcs, ais, bots, bot |
| ?hg npc exclude | Prevent an NPC from being added to the next game. | exclude, exc, ex |
| ?hg npc include | Allow an NPC to be added to the next game. | include, inc, in |
| ?hg npc create | Create an NPC. | create, add |
| ?hg npc delete | Delete an NPC. | delete, remove |

## Team Settings

| Command | Description | Aliases |
| --- | --- | --- |
| ?hg teams swap | This will swap two players to the other team. |  |
| ?hg teams move | This will move the first player, to another team. (Ignores teamSize option) |  |
| ?hg teams rename | Rename a team. Specify its id, or mention someone on a team. |  |
| ?hg teams randomize | Randomize who is on what team. | randomize, shuffle |
| ?hg teams reset | Delete all teams and start over. |  |

## Events

| Command | Description | Aliases |
| --- | --- | --- |
| ?hg events | This will list all custom events that could happen in the game. The HG Webview page can be much easier to use. | events, event |
| ?hg events add | Begins process of adding a custom event. Not all event types can be created yet due to the complications of making a UI. The HG Webview page can be much easier to use, and supports more types. | add, create |
| ?hg events remove | Remove a custom event. The number is the number shown in the list of events. | remove, delete |

## Admin Control

| Command | Description | Aliases |
| --- | --- | --- |
| ?hg kill | This will cause players to end the current or next day as dead. | kill, smite |
| ?hg wound | This will cause players to end the current or next day as wounded. | wound, hurt, damage, stab, punch, slap, injure |
| ?hg heal | This will cause players to end the current or next day as alive and fully healed. | heal, revive, thrive, resurrect, restore |

# Main Commands
#### Here's the list of stuff I can do!
PM SpikeyRobot (?pmspikey) or join [my Discord server](https://discord.gg/ZbKfYSQ) for questions or just to say hi!
See [spikeybot.com](https://www.spikeybot.com/) for examples and more information.

***
## General

| Command | Description | Aliases |
| --- | --- | --- |
| ?addme | I will send you a link to add me to your server! | addme, invite |
| ?help | Send this message to you. | help, commands |
| ?say | Make me say something. |  |
| ?createdate | I will tell you the date you created your account! |  |
| ?joindate | I will tell you the date you joined the server you sent the message from! |  |
| ?pmme | I will introduce myself to you! | pmme, dmme |
| ?pmspikey | I will send SpikeyRobot (my creator) your message because you are too shy! | pmspikey, dmspikey |
| ?avatar | Need a better look at your profile pic? I'll show you the original. | avatar, profile |
| ?ping | Want to know what my delay to the server is? I can tell you my ping! |  |
| ?timer | Set a timer for a certain number of seconds. The bot will DM you the message at the end. No options lists timers. | timer, timers, remind, reminder, reminders |
| ?schedule | Schedule a command to be run after a certain amount of time. | sch, sched, schedule, scheduled |
| ?stats | Displays statistics about the bot and the servers it's on. |  |

## Polls and Voting

| Command | Description | Aliases |
| --- | --- | --- |
| ?poll | Start a poll or vote in the chat. Each user may only have 1 poll at a time. | poll, vote |
| ?endpoll | End a poll that you created. | endpoll, endvote |

## Games

| Command | Description |
| --- | --- |
| ?uno | Start a game of UNO! in the server text channels. (Sill in BETA. Sorry if it breaks.) |
| ?tictactoe | Play a game of Tic Tac Toe with someone! (Mention someone to challenge them) |
| ?connect4 | Start a game of Connect 4 against someone! (Mention someone to challenge them) |

## Random

| Command | Description | Aliases |
| --- | --- | --- |
| ?flip | I have an unlimited supply of coins! I will flip one for you! |  |
| ?roll | Roll dice with any number of sides. Separate multiple numbers with spaces to roll multiple dice. | roll, dice, die, d |

## Math

| Command | Description | Aliases |
| --- | --- | --- |
| ?add | Add positive or negative numbers separated by spaces. |  |
| ?simplify | Simplify an equation with numbers and variables. |  |
| ?solve | Solve an equation for each variable in the equation. |  |
| ?evaluate | Solve a math problem, and convert units. | eval, evaluate |
| ?derive | Find dy/dx of an equation. |  |
| ?graph | Graph an equation, Maxes and mins are all optional, but brackets are required. |  |

## Words

| Command | Description | Aliases |
| --- | --- | --- |
| ?define | Lookup the definition to a word. | define, def, definition |

## Patreon

| Command | Description | Aliases |
| --- | --- | --- |
| ?patreon | Check your current Patreon status, or get information on how to become a patron. |  |
| ?tts | Using Google's text-to-speech engine, make the bot say something in your voice channel. | tts, speak |

# Music and Voice
#### Music and voice channel related commands.
***
## Music

| Command | Description | Aliases |
| --- | --- | --- |
| ?play | Play a song in your current voice channel, or add a song to the queue. |  |
| ?stop | Stop playing music and leave the voice channel. | leave, stop, stfu |
| ?skip | Skip the currently playing song. |  |
| ?queue | View the songs currently in the queue. | q, queue, playing |
| ?remove | Remove a song with the given queue index from the queue. | remove, dequeue |
| ?clear | Remove all songs from the current queue. | clear, empty |
| ?pause | Pause the currently playing music. |  |
| ?resume | Resume the currently paused music. |  |
| ?lyrics | Search for song lyrics. |  |
| ?spotify | Attempt to lookup what the mentioned user is listening to on Spotify, and then play it. The account to lookup must have connected their account at https://www.spikeybot.com/account/. |  |

## Voice Channel

| Command | Description | Aliases |
| --- | --- | --- |
| ?volume | Change the volume of the current song. | volume, vol, v |
| ?join | Join you in your voice channel. |  |
| ?follow | When you change voice channels, the bot will follow you into your new channel and continue playing music. | follow, unfollow, stalk, stalkme |

