import discord
from time import localtime

""" https://discordapp.com/oauth2/authorize?&client_id=318552464356016131&scope=bot """

client = discord.Client()

prefix = '?'
password = 'password'
helpmessage = "```py\nLet me see if I can help you:\n" \
            "-----\n" \
            "I can add numbers!\n" \
            "Type \"" + prefix + "add 1 2 3\" to make me do math!\n" \
            "I can also do subtraction!\n" \
            "-----\n" \
            \
            "I can say stuff!\n" \
            "Type \"" + prefix + "say SpikeyBot is the best!\" to make me say stuff!\n"\
            "-----\n" \
            "I can also tell you the date of when you joined this server!\n"\
            "Type \"" + prefix +"joindate\" and I will tell you!\n"\
            "-----\n" \
            "I can also tell you the date of when you created your Discord account!\n"\
            "Type \"" + prefix + "discorddate\" and I will tell you!\n"\
            "-----\n"\
            "Want to add me to your server?\n"\
            "Type \"" + prefix + "addme\" and I will send you a link!\n"\
            "-----\n" \
            "I have also given the Gods and Demi-Gods the power to smite!\n"\
            "They must merely type \"" + prefix + "smite @SpikeyRobot#9836\" and he will be struck down!\n"\
            "-----\n" \
            "Need many messages to be deleted, but to lazy to do it manually? Gods and Demi-Gods can be lazy!\n"\
            "Type \"" + prefix + "purge 5\" to purge 5 messages!\n"\
            "-----\n" \
            "Send @SpikeyRobot#9836 feature requests!```"

addmessage = "```\nWant to add me to your server? Click this link:\n```\n"\
             "https://discordapp.com/oauth2/authorize?&client_id=318552464356016131&scope=bot"

previoususer = "0"
numberofmessages = 1

print('Starting script')
print(localtime())

@client.event
async def on_ready():
    print('Logged in as')
    print(client.user.name)
    print(client.user.id)
    print('------')
    await updategame(password, prefix + 'help for help')

@client.event
async def on_message(message):
    if message.author == client.user:
        return

    if message.author.id == '267211324612673536':
        await client.send_message(message.channel, message.author.mention + "\n```Yo! It's a loser hacker wannabe! " + str(message.author.nick) + " shall not be trusted!```")
        return

    if message.content.startswith(prefix):
        print(message.channel.server.name + "#" + message.channel.name + "@" + message.author.name + message.content)

    if message.content.startswith(prefix + 'whoami'):
        await client.send_message(message.channel, message.author.mention + "\n```I don't know! Should you know that?```")
        return

    if message.content.startswith(prefix + 'updategame '):
        game = ''
        splitstring = message.content.split(' ')
        for x in range(2, len(splitstring)):
            game += splitstring[x] + ' '
        game = game.strip(' ')
        response = await updategame(splitstring[1], game)
        await client.delete_message(message)
        if response == 0:
            await client.send_message(message.channel, message.author.mention + "\n```css\nI changed my status to \"" + game + "\"!\n```")
        else:
            await client.send_message(message.channel, message.author.mention + "\n```fix\nI'm sorry " + str(message.author.nick) + ", but you are not allowed to do that. :(\n```")

    elif message.content.startswith(prefix + 'add '):
        splitstring = message.content.replace(prefix + 'add ', '', 1).replace('-', ' -').replace('  ', ' ').replace('+', ' ').split(' ')
        number = 0
        numnonnumbers = 0
        for x in splitstring:
            try:
                number += float(x)
            except ValueError:
                numnonnumbers += 1
        ending = ''
        anotherending = ''
        if numnonnumbers > 0:
            ending = "But you entered the numbers oddly, so I am not sure if I understood you properly."
        if number == 69:
            anotherending = ":wink:"
        elif number == 420:
            anotherending = ":four_leaf_clover:"
        elif number == 666:
            anotherending = ":smiling_imp:"
        elif number == 9001:
            anotherending = ":fire:"
        elif number == 80085 or number == 58008:
            anotherending = ":ok_hand:"
        await client.send_message(message.channel, message.author.mention + "\n```lua\nYour answer is " + str(number) + "\n" + ending + "\n```\n" + anotherending + "")

    elif message.content.startswith(prefix + 'say '):
        # if message.author.id == '126464376059330562':
            # await client.send_message(message.channel, "Rohan is not permitted to do this cuz he funny. :P")
            # return

        await client.delete_message(message)
        editedmessage = message.content.replace(prefix + 'say ', '', 1)
        if message.author.id != "124733888177111041":
            editedmessage = editedmessage.replace('spikey', str(message.author.nick))
            editedmessage = editedmessage.replace('Spikey', str(message.author.nick))
            editedmessage = editedmessage.replace('campbell crowley', str(message.author.nick))
            editedmessage = editedmessage.replace('Campbell Crowley', str(message.author.nick))
            editedmessage = editedmessage.replace('campbell Crowley', str(message.author.nick))
            editedmessage = editedmessage.replace('Campbell crowley', str(message.author.nick))
            editedmessage = editedmessage.replace('campbell', str(message.author.nick))
            editedmessage = editedmessage.replace('Campbell', str(message.author.nick))
            editedmessage = editedmessage.replace('crowley', str(message.author.nick))
            editedmessage = editedmessage.replace('Crowley', str(message.author.nick))
        await client.send_message(message.channel, editedmessage)
        print("I said \"" + message.content.replace(prefix + 'say ', '', 1) + "\" in " + message.channel.server.name + "#" + message.channel.name)
        if message.author.id != "124733888177111041":
            return

        global previoususer, numberofmessages
        if previoususer == message.author.id:
            numberofmessages += 1
        else:
            previoususer = message.author.id
            numberofmessages = 1
        if numberofmessages % 3 == 0:
            await client.send_message(message.channel, "```Help! " + message.author.nick + ", is putting words into my mouth!```")

    elif message.content.startswith(prefix + 'smite '):
        if message.author.top_role.permissions.manage_roles:
            if len(message.mentions) == 0:
                await client.send_message(message.channel, message.author.mention + '```\nPlease mention someone with the @ symbol to smite.\n```')
            else:
                listofPeople = ""
                for x in range(0, len(message.server.roles)):
                    if message.server.roles[x].name == "Smited":
                        smitedRole = message.server.roles[x]
                        break
                    if x == len(message.server.roles) - 1:
                        await client.send_message(message.channel, message.author.mention + '```\nCould not smite because there is no role called Smited.\n```')
                        return
                for x in range(0, len(message.mentions)):
                    if message.mentions[x] == client.user:
                        listofPeople += "I am sorry, but you can not make me smite myself.\n"
                        continue
                    if message.author.top_role.permissions.is_subset(message.mentions[x].top_role.permissions):
                        listofPeople += "You can't smite " + message.mentions[x].name + "! You are too puny!\n"
                        continue
                    try:
                        await client.replace_roles(message.mentions[x], smitedRole)
                        listofPeople += "The gods have struck " + message.mentions[x].name + " with lightning!\n"
                    except:
                        listofPeople += "Your lightning missed " + message.mentions[x].name + " by inches! Maybe you should train before trying that again...\n"
                await client.send_message(message.channel, message.author.mention + '```\n' + listofPeople + '\n```')
        else:
            await client.send_message(message.channel, message.author.mention + '```\nYou do not have permission for this.\n(Filthy ' + message.author.top_role.name + ')\n```')

    elif message.content.startswith(prefix + 'joindate'):
      editedmessage = message.content.replace(prefix + 'joindate', '', 1).split(' ')
      if len(editedmessage) > 1:
          print("NYI" + str(len(editedmessage)))
      await client.send_message(message.channel, message.author.mention + "\n```lua\nYou joined this server on " + message.author.joined_at.strftime('%A %b/%d/%Y') + "\n```")

    elif message.content.startswith(prefix + 'discorddate'):
      editedmessage = message.content.replace(prefix + 'discorddate', '', 1).split(' ')
      if len(editedmessage) > 1:
          print("NYI" + str(len(editedmessage)))
      await client.send_message(message.channel, message.author.mention + "\n```lua\nYou created your discord account on " + message.author.created_at.strftime('%A %b/%d/%Y') + "\n```")
    elif message.content.startswith(prefix + 'purge') or message.content.startswith(prefix + 'prune'):
      if message.author.top_role.permissions.manage_messages:
        if message.content.starswith(prefix + 'purge'):
          editedmessage = message.content.replace(prefix + 'purge', '', 1).split(' ')
        else:
          editedmessage = message.content.replace(prefix + 'prune', '', 1).split(' ')
        print("Purging " + editedmessage[1] + " messages from " + str(message.channel));
        await client.purge_from(message.channel, limit=int(editedmessage[1]));
        await client.purge_from(message.channel, limit=1);
      else:
        await client.send_message(message.channel, message.author.mention + '```\nYou do not have permission for this.\n(Filthy ' + message.author.top_role.name + ')\n```')



    elif message.content.startswith(prefix + 'help'):
        await client.send_message(message.channel, message.author.mention + "\n" + helpmessage)

    elif message.content.startswith(prefix + 'addme'):
        await client.send_message(message.channel, message.author.mention + "\n" + addmessage)

async def add(left : int, right : int, channel : discord.Channel):
    client.send_message(channel, left + right)

async def updategame(password_ : str, game = ''):
    if password_ == password:
        await client.change_presence(game=discord.Game(name=game))
        print("Changed game to \"" + game + "\"")
        return 0
    else:
        print("Didn't change game (" + password_ + ")")
        return 1


while True:
  client.run("MzE4NTUyNDY0MzU2MDE2MTMx.DA0JAA.aNNIG_xR7ROtL4Ro_WZQjLiMLF0")
