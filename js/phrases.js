/* Everything the game says. id -> text. tools/make_audio.py turns each
   entry into audio/<id>.mp3. ES5. */
(function (root) {
  'use strict';
  var Content = root.Content || (typeof require !== 'undefined' ? require('./content.js') : null);
  var P = {
    home: 'Tap the star to play!',
    intro_letters: "Let's find letters! Listen, then tap the letter I say.",
    match_prompt: 'Find the lowercase letter that goes with this capital letter.',
    here: 'Here it is! Tap it.',
    sticker: 'Yay! You earned a sticker!',
    crown: 'You earned a crown! Great playing today!',
    album: 'Here are your stickers and crowns!',
    check: 'Hello! If you can hear me, the sound is working.',
    pick_game: 'Pick a game!',
    game_letters: 'Letters!',
    game_sounds: 'Letter sounds!',
    intro_sounds: "Let's play with letter sounds! Listen to the sound, then tap the letter that makes it.",
    snd_prompt: 'Which letter says',
    praise_1: 'Yes!',
    praise_2: 'Great job!',
    praise_3: 'You got it!',
    praise_4: 'Super!',
    praise_5: 'Sparkly!',
    praise_6: 'Wonderful!',
    praise_7: 'Way to go!',
    praise_8: "That's right!",
    try_1: 'Hmm, try again.',
    try_2: 'Oops! Try another one.',
    try_3: 'Almost! Try again.'
  };
  var U = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  for (var i = 0; i < U.length; i++) {
    var L = U[i], l = L.toLowerCase();
    P['find_uc_' + L] = 'Find capital ' + L + '.';
    P['find_lc_' + l] = 'Find lowercase ' + l + '.';
    P['thats_' + L] = 'That one is ' + L + '.';
    P['pair_' + L] = 'Capital ' + L + ', lowercase ' + l + '!';
  }
  if (Content) {
    for (var l in Content.LETTER_SOUNDS) {
      if (!Content.LETTER_SOUNDS.hasOwnProperty(l)) continue;
      var L2 = l.toUpperCase();
      // Text wrapped in slashes is read as phonemes, not words.
      for (var v = 0; v < 3; v++) {
        var spec = Content.LETTER_SOUNDS[l][v].split('@');
        P['snd_' + l + '_' + (v + 1)] = '/' + spec[0] + '/' + (spec[1] ? '@' + spec[1] : '');
      }
      P['says_' + L2] = L2 + ' says';
      P['like_' + l] = 'like ' + Content.KEYWORDS[l] + '.';
    }
    for (i = 0; i < Content.WORD_BANK.length; i++) {
      P[Content.wordAudioId(Content.WORD_BANK[i])] = Content.WORD_BANK[i] + '.';
    }
  }
  root.Phrases = P;
  if (typeof module !== 'undefined' && module.exports) module.exports = P;
})(typeof window !== 'undefined' ? (window.HSL = window.HSL || {}) : {});
