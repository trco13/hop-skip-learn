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
    prompt: function (item) {
      if (wordMode(item.letter)) return ['startq_' + item.letter];
      return ['snd_prompt', soundClip(item.letter)];
    },
    rightSay: function (item) {
      if (wordMode(item.letter)) return ['sfx_chime', 'starta_' + item.letter];
      return ['sfx_chime', 'says_' + item.letter.toUpperCase(), soundClip(item.letter), 'like_' + item.letter];
    },
    wrongSay: function (picked) {
      if (wordMode(picked.letter)) return ['starta_' + picked.letter];
      return ['says_' + picked.letter.toUpperCase(), soundClip(picked.letter)];
    }
  };

  root.Games = { letters: Letters, sounds: Sounds, soundClip: soundClip, wordMode: wordMode };
})(window.HSL = window.HSL || {});
