/* The games: what each one asks and says back. */
(function (root) {
  'use strict';
  var Content = root.Content, Store = root.Store;

  // Which of the three recorded versions of a letter sound to use.
  // The parent's pick on this device wins, then the built-in default.
  function soundClip(letter) {
    var picks = Store.get('soundPicks', null) || {};
    // "x" means the parent heard no good version yet: use the default.
    var n = typeof picks[letter] === 'number' ? picks[letter] : (Content.SOUND_DEFAULTS[letter] || 1);
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

  var Sounds = {
    key: 'sounds',
    store: 'sounds',
    intro: 'intro_sounds',
    items: Content.soundItems,
    cardClass: 'pair',
    prompt: function (item) { return ['snd_prompt', soundClip(item.letter)]; },
    rightSay: function (item) {
      return ['sfx_chime', 'says_' + item.letter.toUpperCase(), soundClip(item.letter), 'like_' + item.letter];
    },
    wrongSay: function (picked) {
      return ['says_' + picked.letter.toUpperCase(), soundClip(picked.letter)];
    }
  };

  root.Games = { letters: Letters, sounds: Sounds, soundClip: soundClip };
})(window.HSL = window.HSL || {});
