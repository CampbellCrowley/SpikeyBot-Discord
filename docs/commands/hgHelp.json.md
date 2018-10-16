## Time Control
## Events
## Team Settings
## Player Settings
## Game Settings
# Hungry Games!
#### To use any of these commands you must have the "HG Creator" role or be the server owner. Use https://www.spikeybot.com/hg/ if commands are too hard.
***

| Command | Description | Aliases |
| --- | --- | --- |
| ?hg create | This will create a game with default settings if it doesn't exist already. This is only required the first time, and after resetting all data. | create, c, new |
| ?hg options 'option name' 'value' | List options if no name, or change the option if you give a name. | options, option, opt, opts, settings, setting, set |
| ?hg reset 'all/current/events/options/teams' | Delete data about the Games. Don't choose an option for more info. |  |


| Command | Description | Aliases |
| --- | --- | --- |
| ?hg players | This will list all players I currently care about. | players, player |
| ?hg exclude 'mention' | Prevent someone from being added to the next game. | exclude, remove, exc, ex |
| ?hg include 'mention' | Add a person back into the next game. | include, add, inc, in |


| Command | Description | Aliases |
| --- | --- | --- |
| ?hg teams swap 'mention' 'mention' | This will swap two players to the other team. |  |
| ?hg teams move 'mention' 'id/mention' | This will move the first player, to another team. (Ignores teamSize option) |  |
| ?hg teams rename 'id/mention' 'name...' | Rename a team. Specify its id, or mention someone on a team. |  |
| ?hg teams randomize | Randomize who is on what team. | randomize, shuffle |
| ?hg teams reset | Delete all teams and start over. |  |


| Command | Description | Aliases |
| --- | --- | --- |
| ?hg events | This will list all custom events that could happen in the game. <a href="/hg/">HG Webview</a> can be much easier to use. | events, event |
| ?hg debugevents | This will let you download all of the events and their data. |  |
| ?hg events add 'message' | Begins process of adding a custom event. Not all event types can be created yet due to the complications of making a UI. <a href="/hg/">HG Webview</a> can be much easier to use, and supports more types. | add, create |
| ?hg events remove 'number' | Remove a custom event. The number is the number shown in the list of events. | remove, delete |


| Command | Description | Aliases |
| --- | --- | --- |
| ?hg start | This will start a game with your settings. | start, s |
| ?hg end | This will end a game early. | end, abort, stop |
| ?hg autoplay | Automatically continue to the next day after a day is over. | autoplay, auto, resume, play, go |
| ?hg pause | Stop autoplay at the end of the day. |  |
| ?hg next | Simulate the next day of the Games! | next, nextday |

