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
    for (i = 0; i < Content.SOUND_LETTERS.length; i++) {
      var s = Content.SOUND_LETTERS[i], S = s.toUpperCase();
      // "#sound:" clips are built by tools/letter_sounds.py, not read aloud.
      for (var v = 1; v <= 3; v++) P['snd_' + s + '_' + v] = '#sound:' + s + ':' + v;
      P['says_' + S] = S + ' says';
      P['like_' + s] = 'like ' + Content.KEYWORDS[s] + '.';
      // Word version (the default): the key word gets its own pauses and
      // is said slower and louder, then once more at the end.
      var kw = Content.KEYWORDS[s];
      if (s === 'x') {
        P['startq_' + s] = '#seq:Which letter makes the sound at the end of|~0.35|!w:' + kw + '|~0.6|!w:' + kw;
        P['starta_' + s] = '#seq:!w:' + kw + '|~0.3|ends with ' + S + '!';
      } else {
        P['startq_' + s] = '#seq:Which letter does|~0.35|!w:' + kw + '|~0.35|start with?|~0.6|!w:' + kw;
        P['starta_' + s] = '#seq:!w:' + kw + '|~0.3|starts with ' + S + '!';
      }
    }
    for (i = 0; i < Content.WORD_BANK.length; i++) {
      P[Content.wordAudioId(Content.WORD_BANK[i])] = Content.WORD_BANK[i] + '.';
    }
  }
  root.Phrases = P;
  if (typeof module !== 'undefined' && module.exports) module.exports = P;
})(typeof window !== 'undefined' ? (window.HSL = window.HSL || {}) : {});
