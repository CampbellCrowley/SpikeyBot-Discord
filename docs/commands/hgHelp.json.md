## Admin Control
## Time Control
## Events
## Team Settings
## Player Settings
## Game Settings
# Hungry Games
#### Use https://www.spikeybot.com/hg/ if commands are too hard.
***

| Command | Description | Aliases |
| --- | --- | --- |
| ?hg create | You shouldn't need to use this. But it will force a new game to be created, and update players for a new game. | create, c, new |
| ?hg options | List options if no name, or change the option if you give a name. | options, option, opt, opts, settings, setting, set |
| ?hg rename | Rename the game to your own custom name. The default is "{SERVER NAME}'s Hungry Games". The custom name must be 100 characters or fewer. | rename, name |
| ?hg reset | Delete data about the Games. Don't choose an option for more info. | reset, clear |


| Command | Description | Aliases |
| --- | --- | --- |
| ?hg players | This will list all players I currently care about. | players, player |
| ?hg exclude | Prevent someone from being added to the next game. | exclude, remove, exc, ex |
| ?hg include | Add a person back into the next game. | include, add, inc, in |


| Command | Description | Aliases |
| --- | --- | --- |
| ?hg teams swap | This will swap two players to the other team. |  |
| ?hg teams move | This will move the first player, to another team. (Ignores teamSize option) |  |
| ?hg teams rename | Rename a team. Specify its id, or mention someone on a team. |  |
| ?hg teams randomize | Randomize who is on what team. | randomize, shuffle |
| ?hg teams reset | Delete all teams and start over. |  |


| Command | Description | Aliases |
| --- | --- | --- |
| ?hg events | This will list all custom events that could happen in the game. The HG Webview page can be much easier to use. | events, event |
| ?hg events add | Begins process of adding a custom event. Not all event types can be created yet due to the complications of making a UI. The HG Webview page can be much easier to use, and supports more types. | add, create |
| ?hg events remove | Remove a custom event. The number is the number shown in the list of events. | remove, delete |


| Command | Description | Aliases |
| --- | --- | --- |
| ?hg start | This will start a game with your settings. | start, s |
| ?hg end | This will end a game early. | end, abort, stop |
| ?hg autoplay | Automatically continue to the next day after a day is over. | autoplay, auto, resume, play, go |
| ?hg pause | Stop autoplay at the end of the day. |  |
| ?hg next | Simulate the next day of the Games! | next, nextday |


| Command | Description | Aliases |
| --- | --- | --- |
| ?hg kill | This will cause players to end the current or next day as dead. | kill, smite |
| ?hg wound | This will cause players to end the current or next day as wounded. | wound, hurt, damage, stab, punch, slap, injure |
| ?hg heal | This will cause players to end the current or next day as alive and fully healed. | heal, revive, thrive, resurrect, restore |

