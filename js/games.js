/* The games: what each one asks and says back. */
(function (root) {
  'use strict';
  var Content = root.Content, Store = root.Store;

  // Which of the three recorded versions of a letter sound to use.
  // The parent's pick on this device wins, then the built-in default.
  function soundClip(letter) {
    var picks = Store.get('soundPicks2', null) || {};
    var d = Content.SOUND_DEFAULTS[letter];
    var n = typeof picks[letter] === 'number' ? picks[letter] : (typeof d === 'number' ? d : 1);
    return 'snd_' + letter + '_' + n;
  }

  var Letters = {
    key: 'letters',
    store: 'letters',
    intro: 'intro_letters',
    items: Content.letterItems,
    prompt: function (item) {
      if (item.group === 'uc') return ['find_uc_' + item.show];
      if (item.group === 'lc') return ['find_lc_' + item.show];
      return ['match_prompt'];
    },
    cue: function (item) { return item.group === 'match' ? item.cue : null; },
    rightSay: function (item, firstTry) {
      if (item.group === 'match') return ['sfx_chime', 'pair_' + item.cue];
      if (!firstTry) return ['sfx_chime', 'praise_1'];
      return ['sfx_chime', 'praise_' + (1 + Math.floor(Math.random() * 8))];
    },
    wrongSay: function (picked) { return ['thats_' + picked.show.toUpperCase()]; }
  };

  // Letters whose sound the parent marked "none": ask with the word instead.
  function wordMode(letter) {
    var picks = Store.get('soundPicks2', null) || {};
    return picks[letter] === 'x' || Content.SOUND_DEFAULTS[letter] === 'x';
  }

  var Sounds = {
    key: 'sounds',
    store: 'sounds',
    intro: 'intro_sounds',
    items: Content.soundItems,
    cardClass: 'pair',
    // The key word's picture, in word mode (tap it to hear the question again).
    cue: function (item) {
      if (!wordMode(item.letter) || !root.Pictures) return null;
      return root.Pictures.picture(Content.KEYWORDS[item.letter], 'art cue-pic');
    },
    prompt: function (item) {
      if (wordMode(item.letter)) return ['startq_' + item.letter];
      return ['snd_prompt', soundClip(item.letter)];
    },
    rightSay: function (item) {
      if (wordMode(item.letter)) return ['sfx_chime', 'starta_' + item.letter];
      return ['sfx_chime', 'says_' + item.letter.toUpperCase(), soundClip(item.letter), 'like_' + item.letter];
    },
    wrongSay: function (picked) {
      if (wordMode(picked.letter)) return ['startw_' + picked.letter];
      return ['says_' + picked.letter.toUpperCase(), soundClip(picked.letter)];
    }
  };

  function wid(word) { return Content.wordAudioId(word).slice(5); }

  function praise() { return 'praise_' + (1 + Math.floor(Math.random() * 8)); }

  var Words = {
    key: 'words',
    store: 'words',
    intro: 'intro_words',
    // The teacher's words (from the parent area) first; words without a
    // voice clip are left out.
    items: function () {
      var teacher = root.Parent ? root.Parent.teacherWords() : null;
      return Content.wordItems(teacher, function (w) { return root.Sound.has('findw_' + wid(w)); });
    },
    cardClass: 'word',
    prompt: function (item) { return ['findw_' + wid(item.word)]; },
    rightSay: function (item, firstTry) {
      return ['sfx_chime', 'word_' + wid(item.word)].concat(firstTry ? [praise()] : []);
    },
    wrongSay: function (picked) { return ['thatw_' + wid(picked.word)]; }
  };

  var Numbers = {
    key: 'numbers',
    store: 'numbers',
    intro: 'intro_numbers',
    items: Content.numberItems,
    cardClass: function (item) { return item.group === 'n2w' ? 'word' : 'numeral'; },
    cue: function (item) {
      if (item.group === 'n2w') return item.cue;
      if (item.group === 'w2n') return '<span class="cue-word">' + item.cue + '</span>';
      return null;
    },
    prompt: function (item) {
      if (item.group === 'n2w') return ['n2w_prompt'];
      if (item.group === 'w2n') return ['w2n_prompt'];
      return ['findn_' + item.n];
    },
    rightSay: function (item, firstTry) {
      return ['sfx_chime', 'word_' + Content.NUMBER_WORDS[item.n - 1]].concat(firstTry ? [praise()] : []);
    },
    wrongSay: function (picked) {
      if (picked.group === 'n2w') return ['thatw_' + picked.show];
      return ['thatn_' + picked.n];
    }
  };

  root.Games = { letters: Letters, sounds: Sounds, words: Words, numbers: Numbers,
    soundClip: soundClip, wordMode: wordMode };
})(window.HSL = window.HSL || {});
