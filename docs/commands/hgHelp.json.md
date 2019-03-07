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

