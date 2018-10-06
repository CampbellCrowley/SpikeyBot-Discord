// Copyright 2018 Campbell Crowley. All rights reserved.
// Author: Campbell Crowley (dev@campbellcrowley.com)

/**
 * @classdesc Converts text strings into different formats.
 * @class
 */
function FunTranslators() {
  /**
   * Convert a string to Leet Speak (1337 5p34k).
   * @public
   *
   * @param {string} input The string to convert.
   * @return {string} The formatted string.
   */
  this.toLeetSpeak = function(input) {
    output = input.replace(/cker(s?)\b/g, 'xor$1');
    output = output.replace(/ate/g, '8');
    output = output.replace(/and/g, '&');
    output = output.replace(/[lL]|[eE]|[aA]|[sS]|[gG]|[tT]|[oO]/g, (m) => {
      m = m.toLowerCase();
      switch (m) {
        case 'l':
          return '1';
        case 'e':
          return '3';
        case 'a':
          return '4';
        case 's':
          return '5';
        case 'g':
          return '6';
        case 't':
          return '7';
        case 'o':
          return '0';
      }
    });
    return output;
  };

  /**
   * Convert a string to the SpongeBob mocking meme font (SpOngEBoB MoCKinG).
   * @public
   *
   * @param {string} input The string to convert.
   * @return {string} The formatted string.
   */
  this.toMockingFont = function(input) {
    let output = input.toLowerCase().split('');
    for (let i = 0; i < output.length / 2; i++) {
      let rand = Math.floor(Math.random() * output.length);
      output[rand] = output[rand].toUpperCase();
    }
    return output.join('');
  };

  /**
   * Convert string to small caps (Hᴇʟʟᴏ Wᴏʀʟᴅ!).
   * @public
   *
   * @param {string} input The string to convert.
   * @return {string} The formatted string.
   */
  this.toSmallCaps = function(input) {
    const map = {
      "0": "0",
      "1": "1",
      "2": "2",
      "3": "3",
      "4": "4",
      "5": "5",
      "6": "6",
      "7": "7",
      "8": "8",
      "9": "9",
      "a": "ᴀ",
      "b": "ʙ",
      "c": "ᴄ",
      "d": "ᴅ",
      "e": "ᴇ",
      "f": "ғ",
      "g": "ɢ",
      "h": "ʜ",
      "i": "ɪ",
      "j": "ᴊ",
      "k": "ᴋ",
      "l": "ʟ",
      "m": "ᴍ",
      "n": "ɴ",
      "o": "ᴏ",
      "p": "ᴘ",
      "q": "ǫ",
      "r": "ʀ",
      "s": "s",
      "t": "ᴛ",
      "u": "ᴜ",
      "v": "ᴠ",
      "w": "ᴡ",
      "x": "x",
      "y": "ʏ",
      "z": "ᴢ",
      "A": "A",
      "B": "B",
      "C": "C",
      "D": "D",
      "E": "E",
      "F": "F",
      "G": "G",
      "H": "H",
      "I": "I",
      "J": "J",
      "K": "K",
      "L": "L",
      "M": "M",
      "N": "N",
      "O": "O",
      "P": "P",
      "Q": "Q",
      "R": "R",
      "S": "S",
      "T": "T",
      "U": "U",
      "V": "V",
      "W": "W",
      "X": "X",
      "Y": "Y",
      "Z": "Z"
    };
    let output = '';
    for (let i = 0; i < input.length; i++) {
      output += map[input[i]] || input[i];
    }
    return output;
  };

  /**
   * Convert string to superscript characters (ᴴᵉˡˡᵒ ᵂᵒʳˡᵈᵎ).
   * @public
   *
   * @param {string} input The string to convert.
   * @return {string} The formatted string.
   */
  this.toSuperScript = function(input) {
    const map = {
      "0": "⁰",
      "1": "¹",
      "2": "²",
      "3": "³",
      "4": "⁴",
      "5": "⁵",
      "6": "⁶",
      "7": "⁷",
      "8": "⁸",
      "9": "⁹",
      "a": "ᵃ",
      "b": "ᵇ",
      "c": "ᶜ",
      "d": "ᵈ",
      "e": "ᵉ",
      "f": "ᶠ",
      "g": "ᵍ",
      "h": "ʰ",
      "i": "ᶦ",
      "j": "ʲ",
      "k": "ᵏ",
      "l": "ˡ",
      "m": "ᵐ",
      "n": "ⁿ",
      "o": "ᵒ",
      "p": "ᵖ",
      "q": "ᑫ",
      "r": "ʳ",
      "s": "ˢ",
      "t": "ᵗ",
      "u": "ᵘ",
      "v": "ᵛ",
      "w": "ʷ",
      "x": "ˣ",
      "y": "ʸ",
      "z": "ᶻ",
      "A": "ᴬ",
      "B": "ᴮ",
      "C": "ᶜ",
      "D": "ᴰ",
      "E": "ᴱ",
      "F": "ᶠ",
      "G": "ᴳ",
      "H": "ᴴ",
      "I": "ᴵ",
      "J": "ᴶ",
      "K": "ᴷ",
      "L": "ᴸ",
      "M": "ᴹ",
      "N": "ᴺ",
      "O": "ᴼ",
      "P": "ᴾ",
      "Q": "Q",
      "R": "ᴿ",
      "S": "ˢ",
      "T": "ᵀ",
      "U": "ᵁ",
      "V": "ⱽ",
      "W": "ᵂ",
      "X": "ˣ",
      "Y": "ʸ",
      "Z": "ᶻ",
      "+": "⁺",
      "-": "⁻",
      "=": "⁼",
      "(": "⁽",
      ")": "⁾",
      "q": "ᵠ",
      "Q": "ᵠ",
      "?": "ˀ",
      "!": "ᵎ"
    };
    let output = '';
    for (let i = 0; i < input.length; i++) {
      output += map[input[i]] || input[i];
    }
    return output;
  };
}

module.exports = new FunTranslators();
