[![SpikeyBot.com Status](https://img.shields.io/uptimerobot/status/m781846555-8613c83984f05f6c963656da.svg?label=SpikeyBot.com)](https://status.spikeybot.com)
[![Server Count](https://img.shields.io/badge/endpoint.svg?url=https://www.spikeybot.com/stats/shield)](https://www.spikeybot.com)
[![Discord Support Server](https://discordapp.com/api/guilds/420045052690169856/embed.png)](https://discord.gg/ZbKfYSQ)
[![Build Status](https://travis-ci.org/CampbellCrowley/SpikeyBot-Discord.svg?branch=master)](https://travis-ci.com/CampbellCrowley/SpikeyBot-Discord)
[![SpikeyBot Version](https://img.shields.io/github/package-json/v/CampbellCrowley/SpikeyBot-Discord.svg)](https://github.com/CampbellCrowley/SpikeyBot-Discord)
[![Dependencies Status](https://david-dm.org/CampbellCrowley/SpikeyBot-Discord.svg)](https://david-dm.org/CampbellCrowley/SpikeyBot-Discord)
[![Last Commit](https://img.shields.io/github/last-commit/CampbellCrowley/SpikeyBot-Discord.svg)](https://github.com/CampbellCrowley/SpikeyBot-Discord)
[![Patreon](https://img.shields.io/badge/donate-patreon-F96854.svg)](https://www.patreon.com/CampbellCrowley)
[![PayPal](https://img.shields.io/badge/donate-paypal-0070BA.svg)](https://www.paypal.me/SpikeyBot)
  
### Bot's website: [SpikeyBot.com](https://www.spikeybot.com/)
### Support my development: [Patreon](https://www.patreon.com/campbellcrowley/) [PayPal](https://www.paypal.me/spikeybot)


# Commands
###### [Web Page with most commands available on the bot's website](https://www.spikeybot.com/help/)

## Hidden Commands
### These commands are not included in the normal help page or `help` command because they are either easter-eggs, developer commands, or just not useful for most users.
- git (Get the git commit log, or run a git command)
- js (Run sandboxed javascript code)
- py (Run sandboxed python code)
- py3 (Run sandboxed python3 code)
- run (If dev.js is loaded, this will run unsafe scripts on the bot using eval)
- thotpm (Semi-anonymously have the bot DM someone. Only a couple people can use this command)
- pmuser (Sends the specified user a pm from the bot, but tells the recipient who the sender was)
- uptime (Amount of time the bot has been running)
- version (Current bot version)
- game (Information about a user's current visible status)
- hg save (Causes hungry games to save all data manually)
- hg debug (Dumps current guild's hungry games data into a file)
- hg debugevents (Dumps all currently loaded events for the guild into a JSON files for download)
- hg makemewin (Replies with a message telling the user their chances of winning have not increased)
- hg makemelose (Replies with a message telling the user their chances of losing have not increased)
- hg rigged (Replies with an image of the emoji that says "rigged")
- vi (Alias for `play nice try vi`)
- airhorn (Plays airhorn sound)
- rickroll (Plays Rick Astley in voice channel)
- kokomo (Alias for `play kokomo`)
- updategame (Changes bot's status)
- reboot (Triggers a graceful shutdown of the entire bot. Assumes the parent process will restart automatically)
- reload (Gracefully unloads all sub-modules, and re-loads and initializes them)
- mainreload (Gracefully unloads all main-modules, and re-loads and initializes them)
- unload (Gracefully unloads specified sub-modules, and will not load them again until `load` is used)
- load (Attempts to load the specified sub-modules)
- record (Record audio in a voice channel. Mention people to only record specific people.)
- perms (Sends a message with the bitfields of all permissions, as well as the sender's and the bot's permissions for the guild and channel)
- lookup (Finds information about a given ID)
- sendto (Given a user or channel ID, the bot will send the message anonymously. Only trusted people can do this)
- saveall (Trigger all submodules to save their data)
- thanks (Thanks the person that was mentioned, or says "You're welcome")
- musicstats (Shows information about currently playing broadcasts)
- uno stats (Shows information about current uno games)
- chat (Forces the sent message to be sent to dialogflow instead of being treated as a normal command)
- listcommands (Lists all commands that are currently registered with SpikeyBot~Commands)
- getprefix (Used by chatbot so users can ask the bot, by mentioning it, what the prefix is)
- whoami (Replies with the user's username, and full tag from different sources)
- gettime (Replies with the server's timezone and time, as well as GMT)

# Event Controlled
- Added to guild
  - Sends a message to the top text channel introducing the bot.
- User in guild is banned
  - Sends a message saying the user was banned and by whom.
  - Disable with `togglebanmessages`.

***

# Self-Hosting
The bot is not designed to be easily hosted by others, but still may be done.  
The below steps outline the minimum required to get the SpikeyBot to run.  
1) Have a server/computer
    - SB is developed and tested solely on Debian Stretch (amd64), but other OS's may work.
2) Install [NodeJS](https://nodejs.org/)
    - The bot is currently running on NodeJS [v10.15.3](https://nodejs.org/dist/v10.15.3/). Other versions may work, but are untested.
3) Download source code
    - Clone this repository `git clone https://github.com/CampbellCrowley/SpikeyBot-Discord.git` or click the green download button in GitHub.
4) Install dependencies via NPM
    - Current version of NPM used is `v6.9.0`, but almost any version should be fine.
    - In the `SpikeyBot-Discord` directory, run `npm install`.
5) Get a bot token from Discord
    - A token for the bot that you are trying to run from [Discord](https://discordapp.com/developers/applications/) is required.
    - DO NOT give this token to anybody. Keep it private. The token allows anyone to be your bot.
6) Configure SpikeyBot
    - Create `auth.js` in the `SpikeyBot-Discord/` directory with a line that says `exports.release = 'BOT_TOKEN';`, where `BOT_TOKEN` is the bot token from Discord.
    - Modify `./subModules.json` `"release"` section to have the subModules you want.
    - If you wish to have access to developer commands that normally only SpikeyRobot has access to, replace the `spikeyId` in `./src/common.js` with your account ID.
7) Run SpikeyBot
    - Run `node src/SpikeyBot.js` in `SpikeyBot-Discord/` (working directory must be the project root).
    - Errors about `gApiCredentials.json` missing can be suppressed by removing `./tts.js` and `./chatbot.js` from `./subModules.json` since these require special authentication from Google's API. (https://console.cloud.google.com/)
    - All website related subModules will not work, and related errors can be suppressed by removing all subModules that start with `./web/` from `./subModules.json`.
    - If you are **not** running with `--shards` and wish to use the Hungry Games submodule, you must run node with `--experimental-worker`.

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
  - Does not check the content of embeds.
  - Need more thorough and flexible tests.
- Linting
  - All commits are checked by eslint using Google defaults.
  - Eslint is run with pre-commit git hook.
- Most code is moved into subModules for easier division and reloading.
  - Minimal mode only loads minimal features to allow for multiple bots to run without overlap.
  - Music subModule downloads audio in a separate thread but is still managed by the main event loop.
  - SubModules are stored in `./subModules.json`.
    - Path relative to module should be given (Usually relative to `./src/`).
    - Must be valid for directly being passed into `require()`.
  - MainModules are loaded automatically by `./src/SpikeyBot.js` and are required.
    - SubModules are loaded by `./src/smLoader.js`.
    - Commands are all managed by `./src/commands.js`.
    - Additional MainModules can be loaded by placing them in `./mainModules.json`
- Files
  - Most persistent data is saved to disk when bot shuts down.
    - Hungry Games current state is saved and loaded.
      - Events and most messages are also read from file.
    - Timers settings are saved.
    - Music queues are *not* saved, but may continue playing after unloading submodule.
