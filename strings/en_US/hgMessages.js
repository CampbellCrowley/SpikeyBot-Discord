// Copyright 2019 Campbell Crowley. All rights reserved.
// Author: Campbell Crowley (dev@campbellcrowley.com)
const Locale = require('../../src/locale/Locale.js');

/**
 * @description United States English.
 * @augments Locale
 */
class EnUsHGMessages extends Locale {
  /**
   * @description Constructor.
   */
  constructor() {
    super();
    this.title = 'HG Messages';
    this.dayStart = [
      'Day {} has begun!',
      'The sun rises on day {}.',
      'Prepare for day {}, it is here!',
      'Day {} is upon us!',
      'Light has returned to the arena. Day {} has begun.',
      'Good morning! Try to survive day {}.',
      'Day {}. Another day, another chance to die.',
      '#{}... has begun...',
      '{} is the number of today. Today is day {}.',
      'I like the number {}, it means somebody will die today.',
      'Today is day {}.',
      'Rise and shine! It\'s day {}!',
      'Beware, day {}...',
    ];
    this.dayEnd = [
      'Day {day} has ended with {alive} alive!',
      '{alive} have survived to see the end of day {day}.',
      '{alive} people survived day {day}.',
      'Day {day} was kind to only {alive} people.',
      'Day {day} sets its sun on {alive} people.',
      'Only {alive} see the end of day {day}.',
      '{alive} survived day {day}\'s events.',
      'The sun of day {day} has set on the {alive} remaining.',
    ];
    this.gameStart = ['Let the games begin!'];
    this.gameEnd = ['_unused'];
    this.bloodbathStart = [
      'The bloodbath has begun!',
      'THE BLOOD IS EVERYWHERE!',
      'Now the fun begins...',
      'The blood is coming...',
      'Who wants blood?',
      'I\'ve prepared a bath for you. A bloodbath!',
      'The dirt will be soaked in blood.',
      'This is only the begininng...',
      'Beware, blood will be spilt.',
      'Beware, blood will be spilled.',
      'This game will have no gods or kings. Only man.',
    ];
    this.bloodbathEnd = [
      'Bloodbath has ended.',
      'Now, the game has begun.',
      'Blood has been spilt.',
      'The day has only just begun.',
      'The bloodbath may have ended, but the games have only just begun!',
      'The end of the bloodbath only marks a new beginning.',
      'The end is still nowhere in sight.',
    ];
    this.eventStart = [
      'The game makers have decided to make the game a little more ' +
          'interesting...',
      'An echo can be heard in the distance...',
      'Someone presses a big red button...',
      'This game was getting a little boring, lets mix it up.',
      'I think too many people are alive. Lets kill some!',
      'The arena shudders...',
      'A siren begins to sound...',
      'A feeling of dread falls over the arena...',
      'Something is coming...',
    ];
    this.eventEnd = [
      'A quiet is restored to the arena.', 'Things return to normal.',
      'The arena event ends.',
      'That\'s enough of that craziness, let\'s put this arena back to normal.',
      'Arena events, how fun!',
      'An uneasy calm returns to the remaining who are alive.',
    ];
    this.lotsOfDeath = [
      'Oh boy! Today is a good day to die...',
      'Beware of today, most of you will die...',
      'Who\'s ready to die?',
      'I think, I\'m going to kill a whole bunch of you today...',
      'Oops, I think someone dies today...',
      'Oh the humanity!',
      'I have a bad feeling about today...',
      'You should be afraid, very afraid of today...',
      'I swear, whatever happens today, was not my fault...',
      'Please don\'t be mad... Many of you are not going to like today...',
      '#blamerohan',
      'Blood is everywhere...',
      'Today, many will die.',
    ];
    this.littleDeath = [
      'Most of you deserve a day off.',
      'Most of you get a break today.',
      'You\'ll probably be okay today.',
      'So... only a few of you won\'t like today...',
      'I think you all deserve a break. I\'ll only kill a couple of you.',
      'Raise your hand if you want to live! Oh, that\'s a lot of you...',
      'You can get a snack. Today isn\'t that interesting.',
      'Whoops, I didn\'t kill enough of you today. Sorry!',
      'So, I got lazy, and only killed a couple of you.',
    ];
    this.noDeath = [
      'Oops, were people supposed to die today?',
      'Hmph, I came to see blood, and I don\'t see any.',
      'Who wants to die today? Oh, nobody. Fine then.',
      'So, I was told that it\'s okay not to kill people sometimes.',
      'I called in sick today, and my replacement couldn\'t bring himself to ' +
          'kill anyone today, sorry! #blamerohan',
      'Looks like all of you are surprisingly good at surviving...',
      'I fully apologize for today.',
      'I would say today is my fault, but I think Kyp should take the blame.',
      'Nobody? How? This is the Games? People survive this?',
      'All of you living, are pansies! Go kill someone!',
      'I\'m falling asleep here! Go do something!',
    ];
    this.slaughter = [
      'Oh the humanities! The blood is everywhere!',
      'The slaughter! I\'m going to have to clean that up aren\'t I?',
      'Mess with the best and die like the rest?', 'Do you believe in destiny?',
      'Reported for hacking.', 'They deserved it. Probably.',
      'Who else wants some?!?', 'There\'s more where that came from!',
      'Well, that happened...',
    ];
    this.teamRemaining = [
      '{} looking 👌',
      '{} looking 🔥',
      'It would be a shame if {} lost...',
      'Who wants a piece of {}?',
      'Bets on {} losing?',
      'Bets on {} winning?',
      'Who wants to watch {} lose it all?',
      'Hey {}! Don\'t screw up!',
    ];
    this.resurrected = [
      '{victim} ha[Vs|ve] returned from the dead and [Vwas|were] put back ' +
          'into the arena!',
      '{victim} ha[Vs|ve] been revived and [Vwas|were] put back into the ' +
          'arena!',
      '{victim} ha[Vs|ve] been resurrected and [Vwas|were] put back into the ' +
          'arena!',
    ];
    this.patchWounds = [
      '{victim} manage[Vs|] to patch their wounds.',
      '{victim} recover[Vs|].',
      '{victim} manage[Vs|] to live another day.',
      '{victim} repair[Vs|] themsel[Vf|ves].',
      '{victim}\'s prayers are answered, and their wounds have miraculously ' +
          'been healed.',
    ];
    this.bleedOut = [
      '{victim} fail[Vs|] to tend to their wounds and die[Vs|].',
      '{victim} pass[Ves|] out from blood loss, and never awake[Vs|] again.',
      '{victim} couldn\'t find medical help, and die[Vs|].',
      'The light fades from {victim}\'s eyes.',
      '{victim} lose[Vs|] the will to live.',
      '{victim} [Vis|are] unable to hold onto life any longer, and die[Vs|].',
    ];
    this.forceStateSuccessFew = '{0} will be {1} by the end of the day.';
    this.forceStateSuccessMany =
        '{0} players will be {1} by the end of the day.';
    this.forcedDeath = [
      '{victim} drop[Vs|] dead after the game makers pressed a button.',
      '{victim} die[Vs|] when the game makers wished it so.',
      'The game makers didn\'t like {victim}, so they kill them.',
      '{victim} [Vis|are] killed by the game makers.',
    ];
    this.forcedHeal = [
      '{victim} [Vis|are] miraculously healed after the game makers pressed a' +
          ' button.',
      '{victim} [Vwas|were] heal[Ved|] when the game makers wished it so.',
      'The game makers really missed {victim}, so they healed them.',
      '{victim} [Vis|are] healed by the game makers.',
    ];
    this.forcedWound = [
      '{victim} [Vis|are] mortally wounded after the game makers pressed a ' +
          'button.',
      '{victim} hurt themsel[Vf|ves] when the game makers wished it so.',
      'The game makers kinda didn\'t like {victim}, so they hurt them.',
      '{victim} [Vis|are] wounded by the game makers.',
    ];
    this.giveWeapon = [
      '{attacker} receive[As|] {weapon} from a sponsor!',
      'A parachute with {weapon} falls in front of {attacker}.',
      'A sponsor felt like being nice and give {attacker} {weapon}.',
      'Some sponsors decided {attacker} need[As|] {weapon}.',
    ];
    this.takeWeapon = [
      '{attacker} lose[As|] {weapon} because the game makers thought ' +
          '[Wit was|they were] OP.',
      'The game makers didn\'t like {attacker} with {weapon}, so they took ' +
          '[Wit|them] away.',
      'The game makers deem {attacker} not worthy of having {weapon}.',
    ];
  }
}

module.exports = new EnUsHGMessages();
