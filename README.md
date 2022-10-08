### SpikeyBot is no longer in active development, and cannot be added to your server.

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

# Commands
###### [Web Page with most commands available on the bot's website](https://www.spikeybot.com/help/)

***

# Self-Hosting
The bot is not designed to be easily hosted by others, but still may be done.  
The below steps outline the minimum required to get the SpikeyBot to run.  
This tutorial uses the Discord.js sharding system, which may become deprecated in the future.  
1) Have a server/computer
    - SB is developed and tested solely on Debian Bullseye (amd64), but other OS's may work.
2) Install [NodeJS](https://nodejs.org/)
    - The bot is currently running on NodeJS [v16.17.1](https://nodejs.org/dist/v16.17.1/). Newer versions may work, but are untested.
3) Download source code
    - Clone this repository `git clone https://github.com/CampbellCrowley/SpikeyBot-Discord.git` or click the green download button in GitHub.
4) Install system dependencies
    - `sudo apt install make libtool autoconf g++ ffmpeg` are required for the default installation.
5) Install dependencies via NPM (or Yarn)
    - Current version of NPM used is `v8.19.1`, but almost any version should be fine.
    - Current version of Yarn used is `v1.22.19` but almost any version should be fine.
    - In the `SpikeyBot-Discord` directory, run `npm install` or `yarn`.
6) Get a bot token from Discord
    - A token for the bot that you are trying to run from [Discord](https://discordapp.com/developers/applications/) is required.
    - DO NOT give this token to anybody. Keep it private. The token allows anyone to be your bot.
7) Configure SpikeyBot
    - Create `auth.js` in the `SpikeyBot-Discord/` directory with a line that says `exports.release = 'BOT_TOKEN';`, where `BOT_TOKEN` is the bot token from Discord.
        - See `./auth.js.example` for an example of what a complete file will look like.
    - Modify `./subModules.json` `"release"` section to have the subModules you want.
    - If you wish to have access to developer commands that normally only SpikeyRobot has access to, replace the `spikeyId` in `./src/common.js` with your account ID.
8) Run SpikeyBot
    - Run `node src/SpikeyBot.js` in `SpikeyBot-Discord/` (working directory must be the project root).
    - Errors about `gApiCredentials.json` missing can be suppressed by removing `./tts.js` and `./chatbot.js` from `./subModules.json` since these require special authentication from Google's API. (https://console.cloud.google.com/)
      - NOTE: `./subModules.json.crypt` must be deleted now each time an edit is made to `./subModules.json`.
    - All website related subModules will not work, and related errors can be suppressed by removing all subModules that start with `./web/` from `./subModules.json`.
    - If you are **not** running with `--shards` and wish to use the Hungry Games submodule, you must run node with `--experimental-worker`.

Hungry Games requires a MariaDB server to be available for storage of all events. If this database is not setup properly, HG may run into problems, and is not tested.  
MariaDB table descriptions available in [./docs/describe.txt](./docs/describe.txt).  

## Alternate Sharding System
With the v1.14 update an alternate sharding system is included which interfaces with the Discord.js sharding system, but extends it's functionality to support the master shard to be on a different physical host than the rest of the shards.

This system is not yet documented in any form, but the basic structure is one instance of `./src/sharding/ShardingMaster.js` is started on a publicly visible host, with a `./src/sharding/ShardingSlave.js` also started in the same directory to act as the master shard for the webservers.  
Following shards can then be started on remote hosts as `./src/sharding/ShardingSlave.js` instances.

ShardingSlaves will be configured using the config file automatically generated by the ShardingMaster.  
The ShardingMaster is in turn configured in the `./config/shardMasterConfig.js` file (The ".default" file is expected to be copied then modified to your liking).

## CLI Arguments
All arguments are optional for normal usage.

`--dev`: Flips `isRelease` in `./src/common.js`, and changes which ports are used for webservers.  
`--botname=BOTNAME`: Overwrites the name of the bot token to use in the `./auth.js` file.  
`--minimal`: Starts the bot normally, but doesn't change the bot's presence, manage reboot/crash handling, command logging, or any default commands in `SpikeyBot` (not MainModule commands).  
`--test`: Bot will go into unit testing mode.  
`--nologin`: Bot will not attempt to login to Discord, but will continue to do everything else normally, including loading MainModules. If this is used, most SubModules will not do anything as they rely on a connection to Discord to be made. This is to support a single process that acts as the master node of webservers.  
`--shards[=NUMSHARDS]`: Specifies that we wish to use Discord.js built-in sharding. The number of shards does not need to be specified if we wish to use Discord.js' suggested number of shards.  
`--shardmem=MEMBYTES`: The number of bytes to allocate for each shard's heap.  
`--backup`: Runs the bot as a fallback node. It will not attempt to load any MainModules, and essentially does nothing, but sets the default presence to DND in order to signify that the bot is unavailable. This is intended to be expanded in its features to take over when a shard went offline, but that may no longer be feasible.  
`--delay[=5000]`: Time in milliseconds to wait after ready before contacting Discord to login, or start shards.  
`--inspect`: Passes `--inspect` to the NodeJS process of spawned shards.  

# Development
- Unit tests exist
  - Covers most current commands with text-only replies.
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
- Ports
  - Webservers and endpoints each bind to their own ports.
  - [Google Doc of port bindings](https://docs.google.com/spreadsheets/d/1Di555A6Tt52FF943FOkCHvOAOxBufi0oQoi63wnrdqk/edit?usp=sharing)

| Service      | Release Port | Development Port |
|--------------|--------------|------------------|
| Proxy        | 8010         | 8012             |
| HG           | 8011         | 8013             |
| Stats        | 8016         | 8017             |
| WebApi       | 8018         | 8019             |
| Account      | 8014         | 8015             |
| Settings     | 8020         | 8021             |
| File Server  | 8022         | 8023             |
| Shard Master | 8024         | 8025             |

## Hidden Commands
### These commands are not included in the normal help page or `help` command because they are either easter-eggs, developer commands, or just not useful for most users.
- git (Get the git commit log, or run a git command)
- js (Run sandboxed javascript code, currently disabled)
- py (Run sandboxed python code, currently disabled)
- py3 (Run sandboxed python3 code, currently disabled)
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
- hg nums (Replies with number of currently simulating games, loaded games, and connected web clients across all shards)
- vi (Alias for `play nice try vi`)
- airhorn (Plays airhorn sound)
- rickroll (Plays Rick Astley in voice channel)
- kokomo (Alias for `play kokomo`)
- felix (Alias for `play felix`, which plays a sound clip of Felix saying "Don't touch me, I'm violent")
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
- sweep (Removes users from cache that we don't care about at the moment in order to free memory. Only Spikey can do this)
- cookies (Alias for `imgur cookies`)
- listbans (List all known bans for a user in all mutual servers. Currently disabled due to poor implementation causing rate-limits to get hit.)

# Event Controlled
- Added to guild
  - Sends a message to the top text channel introducing the bot.
- User in guild is banned
  - Sends a message saying the user was banned and by whom.
  - Disable with `togglebanmessages`.

