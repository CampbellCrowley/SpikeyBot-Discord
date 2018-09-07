[![Build Status](https://travis-ci.org/CampbellCrowley/SpikeyBot-Discord.svg?branch=master)](https://travis-ci.com/CampbellCrowley/SpikeyBot-Discord)  
[Website](https://www.spikeybot.com/)

# Commands
###### [Web Page with command help](https://www.spikeybot.com/) (also available from bot with `help` command)
## Main
#### General
`addme` `help` `say` `createdate` `joindate` `pmme` `pmspikey` `avatar` `ping` `timer` `stats`
#### Games
`connect4` `tictactoe`
#### Random
`flip` `roll`
#### Music
`play` `stop` `skip` `queue` `remove` `lyrics` `pause` `resume`
#### Math
`add` `simplify` `solve` `evaluate` `derive` `graph`
#### Admin
`purge` `ban` `smite` `togglemute` `changeprefix` `togglebanmessages`

## Hungry Games
#### Game
`create` `options` `reset`
#### Players
`players` `exclude` `include`
#### Teams
`swap` `move` `rename` `randomize` `reset`
#### Events
`events` `debugevents` `add` `remove`
#### Time Control
`create` `start` `end` `autoplay` `pause` `next`
#### Other
`help` `stats`

## Hidden
- js (Run javascript code)
- thotpm (Semi-anonymously have the bot DM someone. Only a couple people can use this command)
- pmuser (Sends the specified user a pm from the bot, but tells the recipient who the sender was)
- uptime (Amount of time the bot has been running)
- version (Current bot version)
- game (Information about a user's current visible status)
- hg save (Causes hungry games to save all data manually)
- hg debug (Dumps current guild's hungry games data into a file)
- hg makemewin (Replies with a message telling the user their chances of winning have not increased)
- hg makemelose (Replies with a message telling the user their chances of losing have not increased)
- vi (Alias for `play nice try vi`)
- airhorn (Plays airhorn sound)
- rickroll (Plays Rick Astley in voice channel)
- kokomo (Alias for `play kokomo`)
- updategame (Changes bot's status)
- reboot (Triggers a graceful shutdown of the entire bot. Assumes the parent process will restart automatically)
- reload (Gracefully unloads all sub-modules, and re-loads and initializes them)
- record (Record audio in a voice channel. Mention people to only record specific people.)
- perms (Sends a message with the bitfields of all permissions, as well as the sender's and the bot's permissions for the guild and channel)
- lookup (Finds information about a given ID)

# Events
- Added to guild
  - Sends a message to the top text channel introducing the bot.
- User in guild is banned
  - Sends a message saying the user was banned and by whom.
- Anthony sends a message
  - Add the surprised emoji as a reaction (😮)

***

# Development
- Unit tests exist
  - Covers all current commands with text-only replies.
  - Tests only send a message, and check for response messages that match expected output.
    1) String exact match
    2) String contains match
    3) String does not contain match
    4) String is not an error
    5) Is an embed
    6) Correct number of messages
  - Does not work if multiple instances of bot are running.
  - Does not check the content of embeds.
  - Need more thorough and flexible tests.
- Linting
  - All commits are checked by eslint using Google defaults.
  - Eslint is run with pre-commit git hook.
- Most code is moved into sub-modules for easier division and reloading.
  - Minimal mode only loads minimal features to allow for multiple bots to run without overlap.
  - Music sub-module is expected to run in separate process to improve performance until better solution for music is made.
  - Submodules are passed in via command line arguments.
    - Path relative to module should be given.
    - Must be valid for directly being passed into `require()`.
- Files
  - Most persistent data is saved to disk when bot shuts down.
    - Hungry Games current state is saved and loaded. Resuming in-progress games is attempted, but untested.
      - Events and most messages are also read from file.
    - Timers and reactToAnthony settings are saved.
    - Music queues are *not* saved, but may continue playing after unloading submodule.
