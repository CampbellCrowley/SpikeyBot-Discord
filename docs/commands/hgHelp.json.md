# Hungry Games!
#### To use any of these commands you must have the "HG Creator" role.
***
## Game Settings
Command | Description
--- | ---
?hg create  |  This will create a game with default settings if it doesn't exist already.
?hg options 'option name' 'value'  |  List options if no name, or change the option if you give a name.
?hg reset 'all/current/events/options/teams'  |  Delete data about the Games. Don't choose an option for more info.
## Player Settings
Command | Description
--- | ---
?hg players  |  This will list all players I currently care about.
?hg exclude 'mention'  |  Prevent someone from being added to the next game.
?hg include 'mention'  |  Add a person back into the next game.
## Team Settings
Command | Description
--- | ---
?hg teams swap 'mention' 'mention'  |  This will swap two players to the other team.
?hg teams move 'mention' 'id/mention'  |  This will move the first player, to another team. (Ignores teamSize option)
?hg teams rename 'id/mention' 'name...'  |  Rename a team. Specify its id, or mention someone on a team.
?hg teams randomize  |  Randomize who is on what team.
?hg teams reset  |  Delete all teams and start over.
## Events
Command | Description
--- | ---
?hg events  |  This will list all custom events that could happen in the game.
?hg debugevents  |  This will let you download all of the events and their data.
?hg events add 'message'  |  Begins process of adding a custom event.
?hg events remove 'number'  |  Remove a custom event. The number is the number shown in the list of events.
## Time Control
Command | Description
--- | ---
?hg start  |  This will start a game with your settings.
?hg end  |  This will end a game early.
?hg autoplay  |  Automatically continue to the next day after a day is over.
?hg pause  |  Stop autoplay at the end of the day.
?hg next  |  Simulate the next day of the Games!
