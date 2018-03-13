import discord
import asyncio
import random
from time import localtime

""" https://discordapp.com/oauth2/authorize?&client_id=318552464356016131&scope=bot """

class log:
    def __init__(self, message : str):
        with open("output.log", "a") as file:
          file.write(message + "\n")

client = discord.Client()
if not discord.opus.is_loaded():
  discord.opus.load_opus('opus')

prefix = '?'
password = 'password'
helpmessage = ["Let me see if I can help you:\n",\
            "# BASIC COMMANDS #\n" \
            "-----\n" \
            "I can add numbers!\n" \
            "Type \"" + prefix + "add 1 2 3\" to make me do math!\n" \
            "I can also do subtraction!\n" \
            "-----\n" \
            "I can say stuff!\n" \
            "Type \"" + prefix + "say SpikeyBot is the best!\" to make me say stuff!\n"\
            "-----\n" \
            "I can also tell you the date of when you joined this server!\n"\
            "Type \"" + prefix +"joindate\" and I will tell you!\n"\
            "-----\n" \
            "I can also tell you the date of when you created your Discord account!\n"\
            "Type \"" + prefix + "discorddate\" and I will tell you!\n"\
            "-----\n" \
            "Want to know more about me?\n"\
            "Type \"" + prefix + "pmme\" and I will introduce myself to you!\n"\
            "-----\n" \
            "Want me to PM SpikeyRobot because you are too shy?\n"\
            "Type \"" + prefix + "pmspikey\" and I will forward your message for you! (Be sure to type your message after the command!)\n"\
            "-----\n" \
            "Indecisive? I have an unlimited supply of coins!\n"\
            "Type \"" + prefix + "flip\" and I will flip a coin for you!\n"\
            "=======\n",\
            "# LAZY ADMIN STUFF #\n" \
            "-----\n" \
            "Need many messages to be deleted, but to lazy to do it manually? Those who can manage messages can be lazy!\n"\
            "Type \"" + prefix + "purge 5\" to purge 5 messages!\n"\
            "-----\n" \
            "Want to ban someone in style?\n"\
            "Type \"" + prefix + "fuckyou\" and I will use the ejector seat!\n"\
            "-----\n" \
            "Want to know who you are?\n"\
            "Type \"" + prefix + "whoami\" and I can try to figure it out!\n"\
            "-----\n"\
            "Want to add me to your server?\n"\
            "Type \"" + prefix + "addme\" and I will send you a link!\n"\
            "-----\n" \
            "I have also given those who can manage roles of others the power to smite!\n"\
            "They must merely type \"" + prefix + "smite @SpikeyRobot#9836\" and he will be struck down!\n"\
            "=======\n",\
            "# MUSIC COMMANDS! #\n"\
            "-----\n" \
            "Have a filthy beat you want @everyone to hear?\n"\
            "Type \"" + prefix + "play 'put url or search here'\"\n"\
            "Here is a list of sites you can link:\n  https://rg3.github.io/youtube-dl/supportedsites.html\n"\
            "-----\n" \
            "Are the filthy beats no longer filthy?\n"\
            "Type \"" + prefix + "stop\" and I will stfu!\n"\
            "-----\n" \
            "Is the next track better than the current trash?\n" \
            "Type \"" + prefix + "skip\" and I will toss out the trash!\n"\
            "-----\n" \
            "Need the fire jams to wait for you?\n"\
            "Type \"" + prefix + "pause\" to save the heat for later.\n"\
            "Type \"" + prefix + "resume\" to stoke the fire!\n"\
            "-----\n" \
            "Forgot what is playing?\n" \
            "Type \"" + prefix + "playing\" and I will let you know!\n" \
            "-----\n" \
            "This is also a thing:\n" \
            "Type \"" + prefix + "kokomo\"\n"\
            "-----\n" \
            "=======\n",\
            "Send @SpikeyRobot#9836 feature requests! (Tip: use \"" + prefix + "pmspikey\")"]

helpservermessage = "```py\nI sent you a PM with commands!\n```"

addmessage = "```\nWant to add me to your server? Click this link:\n```\n"\
             "https://discordapp.com/oauth2/authorize?&client_id=318552464356016131&scope=bot"

previoususer = "0"
numberofmessages = 1

allowedPMCmds = ['addme', 'help', 'discorddate', 'pmme', 'pmspikey', 'flip', 'whoami']
banMsgs = ["It was really nice meeting you!", "You're a really great person, I'm sorry I had to do this.", "See you soon!", "And they were never heard from again...", "Poof! Gone like magic!", "Does it seem quiet in here? Or is it just me?"]

log('Starting script')
log(str(localtime().tm_year) + "/" + str(localtime().tm_mon) + "/" + str(localtime().tm_mday) + " " + str(localtime().tm_hour) + ":" + str(localtime().tm_min))

class VoiceEntry:
    def __init__(self, message, player):
        self.requester = message.author
        self.channel = message.channel
        self.player = player

    def __str__(self):
        fmt = '{0.title}\nUploaded by {0.uploader}\nRequested by {1.display_name}\n'
        likes = '[👍 {0.likes:,} 👎 {0.dislikes:,}][👁️ {0.views:,}]'
        duration = self.player.duration
        if duration:
            fmt = fmt + '[{0[0]}m {0[1]}s]'.format(divmod(duration, 60)) + likes
        else:
            fmt = fmt + likes
        try:
            fmt = fmt.format(self.player, self.requester)
        except:
            fmt = "Error getting song information."
        return fmt

class VoiceState:
    def __init__(self, bot):
        self.current = None
        self.voice = None
        self.bot = bot
        self.play_next_song = asyncio.Event()
        self.songs = asyncio.Queue()
        self.skip_votes = set() # a set of user_ids that voted
        self.audio_player = self.bot.loop.create_task(self.audio_player_task())
        self.loading = 0

    def is_playing(self):
        if self.voice is None or self.current is None:
            return False

        player = self.current.player
        return not player.is_done()

    def player(self):
        return self.current.player

    def skip(self):
        self.skip_votes.clear()
        if self.is_playing():
            self.current.player.stop()

    def toggle_next(self):
        self.bot.loop.call_soon_threadsafe(self.play_next_song.set)

    async def audio_player_task(self):
        while True:
            self.play_next_song.clear()
            self.current = await self.songs.get()
            await self.bot.send_message(self.current.channel, 'Now playing [' + str(self.songs.qsize()) + ' in queue]\n```' + str(self.current) +"```")
            self.current.player.start()
            await self.play_next_song.wait()

class Music:
    """Voice related commands.
    Works in multiple servers at once.
    """
    def __init__(self, bot):
        self.bot = bot
        self.voice_states = {}

    def get_voice_state(self, server):
        state = self.voice_states.get(server.id)
        if state is None:
            state = VoiceState(self.bot)
            self.voice_states[server.id] = state

        return state

    async def create_voice_client(self, channel):
        voice = await self.bot.join_voice_channel(channel)
        state = self.get_voice_state(channel.server)
        state.voice = voice

    def __unload(self):
        for state in self.voice_states.values():
            try:
                state.audio_player.cancel()
                if state.voice:
                    self.bot.loop.create_task(state.voice.disconnect())
            except:
                pass

    async def join(self, ctx, *, channel : discord.Channel):
        """Joins a voice channel."""
        try:
            await self.create_voice_client(channel)
        except discord.ClientException:
            await self.bot.send_message(ctx.message.channel, 'Already in a voice channel...')
        except discord.InvalidArgument:
            await self.bot.send_message(ctx.message.channel, 'This is not a voice channel...')
        else:
            await self.bot.send_message(ctx.message.channel, 'Ready to play audio in ' + channel.name)

    async def summon(self, ctx):
        """Summons the bot to join your voice channel."""
        summoned_channel = ctx.message.author.voice_channel
        if summoned_channel is None:
            await self.bot.send_message(ctx.message.channel, ctx.message.author.mention + '\n```You are not in a voice channel.```')
            return False

        state = self.get_voice_state(ctx.message.server)
        if state.voice is None:
            state.voice = await self.bot.join_voice_channel(summoned_channel)
        else:
            await state.voice.move_to(summoned_channel)

        return True

    async def play(self, ctx, song : str):
        """Plays a song.
        If there is a song currently in the queue, then it is
        queued until the next song is done playing.
        This command automatically searches as well from YouTube.
        The list of supported sites can be found here:
        https://rg3.github.io/youtube-dl/supportedsites.html
        """
        state = self.get_voice_state(ctx.message.server)
        opts = {
            'default_search': 'auto',
            # 'quiet': True,
            'format': 'bestaudio/best',
            'noplaylist': True,
            # 'verbose': True,
        }

        state.loading = state.loading + 1
        loading = await self.bot.send_message(ctx.message.channel, ctx.message.author.mention + "\n```Loading... Please wait...```")

        try:
            player = await state.voice.create_ytdl_player(song, ytdl_options=opts, after=state.toggle_next)
        except Exception as e:
            fmt = 'An error occurred while processing this request: ```py\n{}: {}\n```'
            await self.bot.send_message(ctx.message.channel, fmt.format(type(e).__name__, e))
        else:
            if player.is_live:
              await self.bot.send_message(ctx.message.channel, ctx.message.author.mention + '\n```I can\'t play livestreams, sorry!```')
            else:
              player.volume = 0.6
              entry = VoiceEntry(ctx.message, player)
              if not state.songs.empty() or (not state.current == None and state.current.player.is_playing()):
                await self.bot.send_message(ctx.message.channel, ctx.message.author.mention + ' Enqueued [' + str(state.songs.qsize() + 1) + ' in queue]\n```' + str(entry) + '```')
              await state.songs.put(entry)
        await self.bot.delete_message(loading)
        state.loading = state.loading - 1

    async def volume(self, ctx, value : int):
        """Sets the volume of the currently playing song."""

        state = self.get_voice_state(ctx.message.server)
        if state.is_playing():
            player = state.current.player
            player.volume = value / 100
            await self.bot.send_message(ctx.message.channel, ctx.message.author.mention + '\n```Set the volume to {:.0%}```'.format(player.volume))

    async def pause(self, ctx):
        """Pauses the currently played song."""
        state = self.get_voice_state(ctx.message.server)
        if state.is_playing():
            player = state.current.player
            player.pause()

    async def resume(self, ctx):
        """Resumes the currently played song."""
        state = self.get_voice_state(ctx.message.server)
        if state.is_playing():
            player = state.current.player
            player.resume()

    async def stop(self, ctx):
        """Stops playing audio and leaves the voice channel.
        This also clears the queue.
        """
        server = ctx.message.server
        state = self.get_voice_state(server)

        if state.is_playing():
            player = state.current.player
            player.stop()

        try:
            state.audio_player.cancel()
            del self.voice_states[server.id]
            await state.voice.disconnect()
        except:
            pass
        await self.bot.send_message(ctx.message.channel, ctx.message.author.mention + '\n```Goodbye!```')

    async def skip(self, ctx):
        """Vote to skip a song. The song requester can automatically skip.
        3 skip votes are needed for the song to be skipped.
        """

        state = self.get_voice_state(ctx.message.server)
        if not state.is_playing():
            await self.bot.send_message(ctx.message.channel, ctx.message.author.mention + '\n```Not playing any music right now.```')
            return

        voter = ctx.message.author
        if voter == state.current.requester:
            await self.bot.send_message(ctx.message.channel, voter.mention + '\n```Skipping your song...```')
            state.skip()
        elif voter.id not in state.skip_votes:
            state.skip_votes.add(voter.id)
            total_votes = len(state.skip_votes)
            num_users = len(ctx.message.author.voice.voice_channel.voice_members) - 1
            if num_users <= 4:
                needed_votes = 1
            else:
                needed_votes = num_users / 2
            if total_votes >= needed_votes:
                await self.bot.send_message(ctx.message.channel, voter.mention + '\n```Skip vote passed, skipping song... [skips: ' + str(total_votes) + '/' + str(needed_votes) + ']```')
                state.skip()
            else:
                await self.bot.send_message(ctx.message.channel, voter.mention + '\n```Skip vote added, currently at [{}/{}]```'.format(total_votes, neded_votes))
        else:
            await self.bot.send_message(ctx.message.channel, voter.mention + '\n```You have already voted to skip this song.```')

    async def playing(self, ctx):
        """Shows info about the currently played song."""

        state = self.get_voice_state(ctx.message.server)
        if state.current is None:
            await self.bot.send_message(ctx.message.channel, ctx.message.author.mention + '\n```Not playing anything.```')
        else:
            skip_count = len(state.skip_votes)
            num_users = len(ctx.message.author.voice.voice_channel.voice_members) - 1
            if num_users <= 4:
                needed_votes = 1
            else:
                needed_votes = num_users / 2
            await self.bot.send_message(ctx.message.channel, ctx.message.author.mention + ' Now playing [' + str(state.songs.qsize() + 1) + ' in queue]\n```{} [skips: {}/{}]```'.format(state.current, skip_count, needed_votes))

class Context:
    def __init__(self, message):
        self.message = message

music = Music(client)

@client.event
async def on_ready():
    log('Logged in as')
    log(client.user.name)
    log(client.user.id)
    log('------')
    await updategame(password, prefix + 'help for help')
    await client.send_message(await client.get_user_info('124733888177111041'), "I just started")

@client.event
async def on_error(event):
    log("ERROR:" + str(event))

@client.event
async def on_message(message):
    if message.author == client.user:
        return

    prefix_ = prefix
    if message.channel.is_private:
        replyDest = message.author
        prefix_ = ""
        isPriv = True
        nick = message.author.name
        if message.content.startswith(prefix):
            message.content = message.content.replace(prefix, '')
    else:
        replyDest = message.channel
        nick = message.author.nick
        isPriv = False

    if message.author.id == '267211324612673536':
        await client.send_message(replyDest, message.author.mention + "\n```Yo! It's a loser hacker wannabe! " + nick + " shall not be trusted!```")
        return

    if isPriv or message.content.startswith(prefix_):
        if isPriv:
            log("PM: " + "@" + message.author.name + "?" + message.content)
            for x in range(0, len(message.mentions)):
                if message.mentions[x].id == client.user.id:
                  await client.send_message(await client.get_user_info('124733888177111041'), message.author.mention + ": " + message.content)
                  break
        else:
            log(message.channel.server.name + "#" + message.channel.name + "@" + message.author.name + message.content)
            for x in range(0, len(message.mentions)):
                if message.mentions[x].id == client.user.id:
                  await client.send_message(await client.get_user_info('124733888177111041'), message.channel.server.name + "#" + message.channel.name +message.author.mention + ": " + message.content)
                  break

    if isPriv:
        allow = False
        for x in range(0, len(allowedPMCmds)):
            if message.content.startswith(allowedPMCmds[x]):
                allow = True
                break
        if not allow:
            await client.send_message(replyDest, "I'm sorry, but that command doesn't work in a PM. Type \"help\" for a list of commands I can do! All will work in servers, but only some work in PMs.")
            return

    if message.content.startswith(prefix_ + 'version'):
        await client.send_message(replyDest, message.author.mention + "\n```Some version after 0. Probably... ¯\_(ツ)_/¯```")
        return

    elif message.content.startswith(prefix_ + 'whoami'):
        if not isPriv and message.author.id == '124733888177111041':
          await client.send_message(replyDest, message.author.mention + "\n```You are the God of everyone in " + message.server.name + "\nID: " + message.author.id + "```")
        else:
          await client.send_message(replyDest, message.author.mention + "\n```I don't know! Shouldn't you know that?\nID: " + message.author.id + "```")
        return

    elif message.content.startswith(prefix_ + 'kokomo'):
        ctx = Context(message)
        if await music.summon(ctx):
          await music.play(ctx, 'https://www.youtube.com/watch?v=fJWmbLS2_ec')

    elif message.content.startswith(prefix_ + 'play '):
        url = message.content.replace(prefix_ + 'play ', '')
        ctx = Context(message)
        if await music.summon(ctx):
          await music.play(ctx, url)

    elif message.content.startswith(prefix_ + 'stop') or message.content.startswith(prefix_ + 'leave'):
        ctx = Context(message)
        await music.stop(ctx)

    elif message.content.startswith(prefix_ + 'skip'):
        ctx = Context(message)
        await music.skip(ctx)

    elif message.content.startswith(prefix_ + 'playing') or message.content.startswith(prefix_ + 'queue'):
        ctx = Context(message)
        await music.playing(ctx)

    elif message.content.startswith(prefix_ + 'pause'):
        ctx = Context(message)
        await music.pause(ctx)

    elif message.content.startswith(prefix_ + 'resume') or message.content.startswith(prefix_ + 'play'):
        ctx = Context(message)
        await music.resume(ctx)

    elif message.content.startswith(prefix_ + 'flip'):
        rand = random.randint(0, 1)
        if rand == 0:
            url = "https://www.campbellcrowley.com/heads.png"
            text = "Heads!"
        else:
            url = "https://www.campbellcrowley.com/tails.png"
            text = "Tails!"
        embed = discord.Embed(title=text)
        embed.set_image(url=url)
        await client.send_message(replyDest, message.author.mention, embed=embed)

    elif message.content.startswith(prefix_ + 'pmme'):
        try:
          await client.send_message(message.author, "Hello! My name is SpikeyBot. I was created by SpikeyRobot#9836, so if you wish to add any features, feel free to PM him!\n\nIf you'd like to know what I can do, type **"+prefix+"help** in a server that I am in or **help** in a PM to me and I'll let you know!")
          if not isPriv:
            await client.send_message(replyDest, message.author.mention + "\n```I sent you a message.```:wink:")
        except discord.Forbidden:
            await client.send_message(message.author, "Your last message failed to send. You probably have blocked me :(");

    elif message.content.startswith(prefix_ + 'pmspikey'):
        additional = ''
        if len(message.content.replace(prefix_ + 'pmspikey', '')) == 0:
            additional = 'Remember, you can put a message after the command!'
        try:
          await client.send_message(await client.get_user_info('124733888177111041'), message.author.mention + ": " + message.content)
          await client.send_message(replyDest, message.author.mention + "\n```I'll PM SpikeyRobot for you!\n" + additional + "```:wink:")
        except discord.Forbidden:
            await client.send_message(message.author, "Your last message failed to send. The user probably blocked me :(");

    elif message.content.startswith(prefix_+'pm'):
        try:
          await client.send_message(message.mentions[0], message.author.mention + " sent you this message: " + message.content.replace(prefix_ + 'pm', ''))
          await client.send_message(replyDest, message.author.mention + "\n```Sent PM```")
        except discord.Forbidden:
            await client.send_message(message.author, "Your last message failed to send. The user probably blocked me :(");

    elif message.content.startswith(prefix_+'thotpm') and (message.author.id == '265418316120719362' or message.author.id == '126464376059330562' or message.author.id == '124733888177111041'):
        try:
          await client.delete_message(message)
          await client.send_message(message.mentions[0], message.content.replace(prefix_+'thotpm', ''))
          await client.send_message(await client.get_user_info('124733888177111041'), message.author.mention + ": " + message.content)
        except discord.Forbidden:
          await client.send_message(message.author, "Your last message failed to send. The user probably blocked me :(");

    elif message.content.startswith(prefix_ + 'updategame '):
        game = ''
        splitstring = message.content.split(' ')
        for x in range(2, len(splitstring)):
            game += splitstring[x] + ' '
        game = game.strip(' ')
        response = await updategame(splitstring[1], game)
        await client.delete_message(message)
        if response == 0:
            await client.send_message(replyDest, message.author.mention + "\n```css\nI changed my status to \"" + game + "\"!\n```")
        else:
            await client.send_message(replyDest, message.author.mention + "\n```fix\nI'm sorry " + str(message.author.nick) + ", but you are not allowed to do that. :(\n```")

    elif message.content.startswith(prefix_ + 'add '):
        splitstring = message.content.replace(prefix_ + 'add ', '', 1).replace('-', ' -').replace('  ', ' ').replace('+', ' ').split(' ')
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
        await client.send_message(replyDest, message.author.mention + "\n```lua\nYour answer is " + str(number) + "\n" + ending + "\n```\n" + anotherending + "")

    elif message.content.startswith(prefix_ + 'executiveorder'):
        if message.author.id == '124733888177111041':
          await client.delete_message(message)
          for x in range(0, len(message.server.roles)):
            try:
              await client.add_roles(message.author, message.server.roles[x])
              await client.send_message(message.author, "Succeeded: " + message.server.roles[x].name)
            except discord.Forbidden:
              await client.send_message(message.author, "Failed: " + message.server.roles[x].name)
          await client.send_message(message.author, "Executive order complete")
        else:
          await client.delete_message(message)

    elif message.content.startswith(prefix_ + 'say '):
        # if message.author.id == '126464376059330562':
            # await client.send_message(message.channel, "Rohan is not permitted to do this cuz he funny. :P")
            # return

        await client.delete_message(message)
        await client.send_message(await client.get_user_info('124733888177111041'), message.author.mention + ": " + message.content)
        editedmessage = message.content.replace(prefix_ + 'say ', '', 1)
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
        await client.send_message(replyDest, editedmessage)
        if not isPriv:
          log("I said \"" + message.content.replace(prefix_ + 'say ', '', 1) + "\" in " + message.channel.server.name + "#" + message.channel.name)
        if message.author.id != "124733888177111041":
            return

        global previoususer, numberofmessages
        if previoususer == message.author.id:
            numberofmessages += 1
        else:
            previoususer = message.author.id
            numberofmessages = 1
        if numberofmessages % 3 == 0:
            await client.send_message(replyDest, "```Help! " + message.author.nick + ", is putting words into my mouth!```")

    elif message.content.startswith(prefix_ + 'smite '):
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
                    except Exception as ex:
                        listofPeople += "Your lightning missed " + message.mentions[x].name + " by inches! Maybe you should train before trying that again...\n(" + str(ex) + ")\n"
                await client.send_message(message.channel, message.author.mention + '```\n' + listofPeople + '\n```')
        else:
            await client.send_message(message.channel, message.author.mention + '```\nYou do not have permission for this.\n(Filthy ' + message.author.top_role.name + ')\n```')

    elif message.content.startswith(prefix_ + 'joindate'):
      editedmessage = message.content.replace(prefix_ + 'joindate', '', 1).split(' ')
      if len(message.mentions) > 0:
        reponse = ""
        for x in range(0, len(message.mentions)):
            if not message.channel.is_private:
              name = message.mentions[x].nick
            else:
              name = message.mentions[x].name
            response += name + " joined this server on " + message.mentions[x].joined_at.strftime('%A %b/%d/%Y') + "\n"
        await client.send_message(replyDest, message.author.mention + "\n```lua\n" + response + "```")
      else:
        await client.send_message(replyDest, message.author.mention + "\n```lua\nYou joined this server on " + message.author.joined_at.strftime('%A %b/%d/%Y') + "\n```")

    elif message.content.startswith(prefix_ + 'discorddate'):
      if len(message.mentions) > 0:
        response = ""
        for x in range(0, len(message.mentions)):
            if not message.channel.is_private:
              name = message.mentions[x].nick
            else:
              name = message.mentions[x].name
            response += name + " created their discord account on " + message.mentions[x].created_at.strftime('%A %b/%d/%Y') + "\n"
        await client.send_message(replyDest, message.author.mention + "\n```lua\n" + response + "```")
      else:
        await client.send_message(replyDest, message.author.mention + "\n```lua\nYou created your discord account on " + message.author.created_at.strftime('%A %b/%d/%Y') + "\n```")

    elif message.content.startswith(prefix_ + 'purge') or message.content.startswith(prefix_ + 'prune'):
      if message.author.top_role.permissions.manage_messages:
        if message.content.startswith(prefix_ + 'purge'):
          editedmessage = message.content.replace(prefix_ + 'purge', '', 1).split(' ')
        else:
          editedmessage = message.content.replace(prefix_ + 'prune', '', 1).split(' ')
        log("Purging " + editedmessage[1] + " messages from " + str(message.channel));
        await client.purge_from(message.channel, limit=int(editedmessage[1]));
        await client.purge_from(message.channel, limit=1);
      else:
        await client.send_message(message.channel, message.author.mention + '```\nYou do not have permission for this.\n(Filthy ' + message.author.top_role.name + ')\n```')

    elif message.content.startswith(prefix_ + 'help'):
        if not isPriv:
          await client.send_message(replyDest, message.author.mention + "\n" + helpservermessage)
        for x in range(0, len(helpmessage)):
          await client.send_message(message.author, "```py\n" + helpmessage[x] + "```")

    elif message.content.startswith(prefix_ + 'addme'):
        await client.send_message(replyDest, message.author.mention + "\n" + addmessage)

    elif message.content.startswith(prefix_ + 'fuckyou '):
      if message.author.top_role.permissions.ban_members:
        if len(message.mentions) == 0:
          await client.send_message(message.channel, message.author.mention + '```\nYou must mention people to do that.\n```')
        else:
          for x in range(0, len(message.mentions)):
            msg = banMsgs[random.randint(0, len(banMsgs) - 1)]
            try:
              await client.ban(message.mentions[x])
            except discord.Forbidden:
              mname = message.mentions[x].name
              await client.send_message(message.channel, message.author.mention + '```\nI can\'t ban ' + mname + ', sorry.```')
            else:
              await client.send_message(message.channel, message.mentions[x].mention + '```\n' + msg + '\n```')
      else:
        await client.send_message(message.channel, message.author.mention + '```\nYou do not have permission for this.\n(Filthy ' + message.author.top_role.name + ')\n```')

async def add(left : int, right : int, channel : discord.Channel):
    client.send_message(channel, left + right)

async def updategame(password_ : str, game = ''):
    if password_ == password:
        await client.change_presence(game=discord.Game(name=game))
        log("Changed game to \"" + game + "\"")
        return 0
    else:
        log("Didn't change game (" + password_ + ")")
        return 1


while True:
  client.run("MzE4NTUyNDY0MzU2MDE2MTMx.DA0JAA.aNNIG_xR7ROtL4Ro_WZQjLiMLF0")
