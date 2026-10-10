/* Learning content: letters, confusable pairs, sight word bank.
   ES5 only so it runs on older Fire tablet browsers. */
(function (root) {
  'use strict';

  var UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  // Letters that look alike. Kept apart until she knows both, then drilled.
  var CONFUSABLE_UPPER = [
    ['E', 'F'], ['M', 'W'], ['M', 'N'], ['O', 'Q'], ['C', 'G'],
    ['P', 'R'], ['U', 'V'], ['I', 'L'], ['I', 'T'], ['B', 'D'], ['K', 'X']
  ];
  var CONFUSABLE_LOWER = [
    ['b', 'd'], ['p', 'q'], ['b', 'p'], ['d', 'q'], ['m', 'n'],
    ['n', 'u'], ['n', 'h'], ['i', 'l'], ['i', 'j'], ['v', 'w'],
    ['a', 'o'], ['f', 't'], ['g', 'q'], ['g', 'y']
  ];

  function pairsFor(letter, pairs) {
    var out = [];
    for (var i = 0; i < pairs.length; i++) {
      if (pairs[i][0] === letter) out.push(pairs[i][1]);
      else if (pairs[i][1] === letter) out.push(pairs[i][0]);
    }
    return out;
  }

  function prefix(list, p) {
    var out = [];
    for (var i = 0; i < list.length; i++) out.push(p + list[i]);
    return out;
  }

  // Item ids: "uc:B" find capital B, "lc:b" find lowercase b,
  // "match:B" see capital B and pick lowercase b.
  function letterItems() {
    var items = [];
    for (var i = 0; i < UPPER.length; i++) {
      var U = UPPER[i], l = U.toLowerCase();
      items.push({
        id: 'uc:' + U, group: 'uc', skill: 'capitals', show: U, order: i,
        confusables: prefix(pairsFor(U, CONFUSABLE_UPPER), 'uc:')
      });
      // Lowercase trails capitals so she isn't flooded at the start.
      items.push({
        id: 'lc:' + l, group: 'lc', skill: 'lowercase', show: l, order: i + 8,
        confusables: prefix(pairsFor(l, CONFUSABLE_LOWER), 'lc:')
      });
      // Matching unlocks once she knows both forms of the letter.
      items.push({
        id: 'match:' + U, group: 'match', skill: 'matching', show: l, cue: U,
        order: i + 16, prereq: ['uc:' + U, 'lc:' + l],
        confusables: prefix(pairsFor(l, CONFUSABLE_LOWER).map(function (x) {
          return x.toUpperCase();
        }), 'match:')
      });
    }
    return items;
  }

  // Letter sounds: each is made 3 ways by tools/letter_sounds.py
  // (1 and 2 cut from real words, 3 a plainer synthesizer). The parent
  // picks the best one in the parent area.
  var SOUND_LETTERS = 'abcdefghijklmnopqrstuvwxyz'.split('');
  // Default for every letter: ask with the word ("x"), since no version
  // of the isolated sounds came out right. 1-3 would pick a sound clip.
  var SOUND_DEFAULTS = {};
  for (var si = 0; si < 26; si++) SOUND_DEFAULTS['abcdefghijklmnopqrstuvwxyz'.charAt(si)] = 'x';
  var KEYWORDS = {
    a: 'apple', b: 'ball', c: 'cat', d: 'dog', e: 'egg', f: 'fish', g: 'goat',
    h: 'hat', i: 'igloo', j: 'jam', k: 'kite', l: 'lion', m: 'moon', n: 'nest',
    o: 'octopus', p: 'pig', q: 'queen', r: 'rain', s: 'sun', t: 'top', u: 'umbrella',
    v: 'van', w: 'web', x: 'box', y: 'yo-yo', z: 'zebra'
  };
  // Most common sounds first (the usual s-a-t-p-i-n start).
  var SOUND_ORDER = 'satpinmdgocklebfhrujvwyzxq'.split('');
  // Letters that sound alike, or look alike.
  var CONFUSABLE_SOUNDS = [
    ['b', 'd'], ['b', 'p'], ['d', 't'], ['p', 'q'], ['m', 'n'], ['f', 'v'],
    ['s', 'z'], ['g', 'k'], ['e', 'i'], ['a', 'u'], ['o', 'u'], ['e', 'a'], ['j', 'g'], ['w', 'y']
  ];
  // Same sound: never shown together.
  var SAME_SOUND = [['c', 'k'], ['c', 'q'], ['k', 'q'], ['x', 'k'], ['x', 'c']];

  function soundItems() {
    var items = [];
    for (var i = 0; i < SOUND_ORDER.length; i++) {
      var l = SOUND_ORDER[i];
      items.push({
        id: 'snd:' + l, group: 'snd', skill: 'sounds', show: l.toUpperCase() + l, letter: l, order: i,
        confusables: prefix(pairsFor(l, CONFUSABLE_SOUNDS), 'snd:'),
        exclude: prefix(pairsFor(l, SAME_SOUND), 'snd:')
      });
    }
    return items;
  }

  // Sight words. The teacher's list is editable in the parent area;
  // extras are typical pre-K/K words, introduced a few at a time.
  var TEACHER_DEFAULT = ['so', 'do', 'big', 'and', 'look'];
  var COLOR_WORDS = ['red', 'blue', 'yellow', 'green', 'orange', 'purple',
    'pink', 'black', 'white', 'brown', 'gray'];
  var NUMBER_WORDS = ['one', 'two', 'three', 'four', 'five', 'six', 'seven',
    'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen',
    'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty'];
  // Dolch pre-primer and primer, roughly easiest first.
  var EXTRA_WORDS = ['I', 'a', 'the', 'see', 'we', 'can', 'is', 'it', 'go',
    'me', 'my', 'up', 'to', 'in', 'you', 'like', 'at', 'am', 'no', 'yes',
    'he', 'she', 'on', 'said', 'here', 'come', 'for', 'play', 'little',
    'funny', 'jump', 'run', 'down', 'help', 'make', 'away', 'where', 'not',
    'one', 'two', 'three', 'find', 'have', 'said', 'are', 'was', 'they',
    'this', 'that', 'what', 'with', 'all', 'be', 'but', 'came', 'did',
    'eat', 'get', 'good', 'into', 'must', 'new', 'now', 'our', 'out',
    'please', 'pretty', 'ran', 'ride', 'saw', 'say', 'soon', 'there',
    'too', 'under', 'want', 'well', 'went', 'who', 'will', 'blue', 'red',
    'yellow', 'can', 'up', 'of', 'her', 'him', 'his', 'how', 'just',
    'know', 'let', 'may', 'old', 'once', 'open', 'over', 'put',
    'round', 'some', 'stop', 'take', 'thank', 'them', 'then', 'think',
    'walk', 'were', 'when', 'from', 'had', 'has', 'by', 'an', 'as', 'ask',
    'any', 'could', 'every', 'fly', 'give', 'going', 'again', 'after',
    'myself', 'own', 'pick', 'show', 'sing', 'sit', 'sleep', 'start', 'tell',
    'ten', 'today', 'together', 'try', 'warm', 'black', 'brown', 'white',
    'four', 'five', 'six', 'seven', 'eight', 'nine', 'big', 'and', 'look',
    'so', 'do', 'love', 'mom', 'dad', 'cat', 'dog', 'boy', 'girl', 'day',
    'friend', 'happy', 'school', 'book', 'home', 'very', 'or', 'if', 'us',
    'your', 'its', 'off', 'many', 'long', 'made', 'more', 'only', 'cake',
    'star', 'fish', 'sun', 'moon', 'tree', 'king', 'queen', 'princess',
    'crown', 'cupcake', 'unicorn', 'mermaid', 'butterfly'];

  function uniq(list) {
    var seen = {}, out = [];
    for (var i = 0; i < list.length; i++) {
      if (!seen[list[i]]) { seen[list[i]] = 1; out.push(list[i]); }
    }
    return out;
  }

  // Every word with a generated voice clip (see tools/make_audio.py).
  var WORD_BANK = uniq(TEACHER_DEFAULT.concat(COLOR_WORDS, NUMBER_WORDS, EXTRA_WORDS));

  function wordAudioId(word) {
    return 'word_' + word.toLowerCase().replace(/[^a-z]/g, '');
  }

  // ---------- sight words game ----------

  // Words that start with the same letter, or use the same letters (was,
  // saw), look alike to a new reader.
  function wordsLookAlike(a, b) {
    if (a.charAt(0).toLowerCase() === b.charAt(0).toLowerCase()) return true;
    return a.length > 1 && a.split('').sort().join('') === b.split('').sort().join('');
  }

  // teacherWords: [{w, added}] from the parent area (newest week first).
  // hasVoice(word): whether the word has a voice clip; others are skipped.
  function wordItems(teacherWords, hasVoice) {
    var teacher = (teacherWords || []).slice().sort(function (a, b) { return (b.added || 0) - (a.added || 0); })
      .map(function (x) { return x.w; });
    // The teacher's words first, then colors and numbers one to ten (also
    // on the teacher's list), then other common words.
    var list = uniq(teacher.concat(COLOR_WORDS, NUMBER_WORDS.slice(0, 10), EXTRA_WORDS))
      .filter(function (w) { return !hasVoice || hasVoice(w); });
    var items = [];
    for (var i = 0; i < list.length; i++) {
      items.push({ id: 'w:' + list[i], group: 'w', skill: 'words', show: list[i], word: list[i], order: i });
    }
    for (i = 0; i < items.length; i++) {
      var c = [];
      for (var j = 0; j < items.length; j++) {
        if (i !== j && wordsLookAlike(items[i].word, items[j].word)) c.push(items[j].id);
      }
      items[i].confusables = c;
    }
    return items;
  }

  // ---------- numbers game ----------

  var NUMBER_LOOKALIKE = [[6, 9], [16, 19], [12, 20], [13, 18], [1, 7], [11, 17], [10, 20], [3, 8]];

  // num:N   hear "Find the number fourteen", tap 14 (1-20)
  // n2w:N   see 3, tap the word "three" (1-10)
  // w2n:N   see "three", tap 3 (1-10)
  function numberItems() {
    var items = [], n, i;
    function look(prefix, num, max) {
      var out = [];
      for (var k = 0; k < NUMBER_LOOKALIKE.length; k++) {
        var p = NUMBER_LOOKALIKE[k];
        var other = p[0] === num ? p[1] : (p[1] === num ? p[0] : 0);
        if (other && other <= max) out.push(prefix + other);
      }
      return out;
    }
    for (n = 1; n <= 20; n++) {
      // 1-10 first, then 11-20 (the current focus) once those are going well.
      items.push({ id: 'num:' + n, group: 'num', skill: 'numerals', show: String(n), n: n,
        order: n, confusables: look('num:', n, 20) });
    }
    for (n = 1; n <= 10; n++) {
      var wordLook = [];
      for (i = 1; i <= 10; i++) {
        if (i !== n && wordsLookAlike(NUMBER_WORDS[n - 1], NUMBER_WORDS[i - 1])) wordLook.push(i);
      }
      items.push({ id: 'n2w:' + n, group: 'n2w', skill: 'numberwords', show: NUMBER_WORDS[n - 1], cue: String(n),
        n: n, order: 20 + n, prereq: ['num:' + n],
        confusables: wordLook.map(function (x) { return 'n2w:' + x; }) });
      items.push({ id: 'w2n:' + n, group: 'w2n', skill: 'numberwords', show: String(n), cue: NUMBER_WORDS[n - 1],
        n: n, order: 30 + n, prereq: ['n2w:' + n], confusables: look('w2n:', n, 10) });
    }
    return items;
  }

  var Content = {
    UPPER: UPPER,
    letterItems: letterItems,
    soundItems: soundItems,
    SOUND_LETTERS: SOUND_LETTERS,
    SOUND_DEFAULTS: SOUND_DEFAULTS,
    KEYWORDS: KEYWORDS,
    TEACHER_DEFAULT: TEACHER_DEFAULT,
    COLOR_WORDS: COLOR_WORDS,
    NUMBER_WORDS: NUMBER_WORDS,
    EXTRA_WORDS: uniq(EXTRA_WORDS),
    WORD_BANK: WORD_BANK,
    wordAudioId: wordAudioId,
    wordItems: wordItems,
    numberItems: numberItems,
    wordsLookAlike: wordsLookAlike
  };

  root.Content = Content;
  if (typeof module !== 'undefined' && module.exports) module.exports = Content;
})(typeof window !== 'undefined' ? (window.HSL = window.HSL || {}) : {});
