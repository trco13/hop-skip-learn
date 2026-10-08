/* Original artwork, drawn as SVG. No emoji, no image files.
   Every drawing uses a 100x100 box and a palette {a, b, c}. */
(function (root) {
  'use strict';

  var PALETTES = [
    { a: '#ff8fc7', b: '#ffd34d', c: '#c9a7ff' }, // pink, gold, lilac
    { a: '#8fd3ff', b: '#fff1a8', c: '#ff9ad5' }, // sky, cream, rose
    { a: '#b48cff', b: '#8fe3cf', c: '#ffd34d' }, // purple, mint, gold
    { a: '#7fe0c4', b: '#ffb3de', c: '#a58bff' }, // mint, pink, violet
    { a: '#ffb07c', b: '#ffe36e', c: '#ff7eb6' }, // peach, lemon, pink
    { a: '#ff7eb6', b: '#b9f2ff', c: '#ffd34d' }  // pink, ice, gold
  ];
  var INK = '#5b3a6e';

  function svg(inner, cls) {
    return '<svg class="' + (cls || 'art') + '" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' + inner + '</svg>';
  }

  function sparkle(x, y, r, color) {
    var s = r, t = r * 0.28;
    return '<path d="M' + x + ' ' + (y - s) + ' L' + (x + t) + ' ' + (y - t) + ' L' + (x + s) + ' ' + y +
      ' L' + (x + t) + ' ' + (y + t) + ' L' + x + ' ' + (y + s) + ' L' + (x - t) + ' ' + (y + t) +
      ' L' + (x - s) + ' ' + y + ' L' + (x - t) + ' ' + (y - t) + 'Z" fill="' + (color || '#fff') + '"/>';
  }

  function smile(cx, cy, w) {
    return '<path d="M' + (cx - w) + ' ' + cy + ' Q' + cx + ' ' + (cy + w) + ' ' + (cx + w) + ' ' + cy +
      '" stroke="' + INK + '" stroke-width="2.4" fill="none" stroke-linecap="round"/>';
  }

  function eyes(cx, cy, gap) {
    return '<circle cx="' + (cx - gap) + '" cy="' + cy + '" r="2.6" fill="' + INK + '"/>' +
      '<circle cx="' + (cx + gap) + '" cy="' + cy + '" r="2.6" fill="' + INK + '"/>' +
      '<circle cx="' + (cx - gap + 0.9) + '" cy="' + (cy - 0.9) + '" r="0.9" fill="#fff"/>' +
      '<circle cx="' + (cx + gap + 0.9) + '" cy="' + (cy - 0.9) + '" r="0.9" fill="#fff"/>';
  }

  function cheeks(cx, cy, gap) {
    return '<circle cx="' + (cx - gap) + '" cy="' + cy + '" r="3" fill="#ff9ec4" opacity=".7"/>' +
      '<circle cx="' + (cx + gap) + '" cy="' + cy + '" r="3" fill="#ff9ec4" opacity=".7"/>';
  }

  var D = {};

  D.crown = function (p, gems) {
    var g = '<path d="M14 72 L10 30 L30 50 L50 22 L70 50 L90 30 L86 72 Z" fill="' + p.b + '" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/>' +
      '<rect x="14" y="70" width="72" height="14" rx="4" fill="' + p.b + '" stroke="' + INK + '" stroke-width="3"/>' +
      '<circle cx="10" cy="29" r="5" fill="' + p.a + '" stroke="' + INK + '" stroke-width="2"/>' +
      '<circle cx="50" cy="20" r="6" fill="' + p.c + '" stroke="' + INK + '" stroke-width="2"/>' +
      '<circle cx="90" cy="29" r="5" fill="' + p.a + '" stroke="' + INK + '" stroke-width="2"/>';
    var n = Math.min(gems === undefined ? 3 : gems, 7);
    var colors = [p.a, p.c, '#8fe3cf', '#8fd3ff', '#ff7eb6', '#b48cff', '#ffb07c'];
    for (var i = 0; i < n; i++) {
      var x = 50 + (i - (n - 1) / 2) * 9.5;
      g += '<path d="M' + x + ' 71.5 l4 5 -4 5 -4 -5Z" fill="' + colors[i] + '" stroke="' + INK + '" stroke-width="1.4"/>';
    }
    g += sparkle(30, 62, 4) + sparkle(70, 62, 4);
    return g;
  };

  D.cupcake = function (p) {
    return '<path d="M24 56 L76 56 L68 92 L32 92 Z" fill="' + p.a + '" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/>' +
      '<path d="M38 57 L40 91 M50 57 L50 91 M62 57 L60 91" stroke="' + INK + '" stroke-width="2" opacity=".35"/>' +
      '<path d="M18 58 Q16 44 30 42 Q30 26 50 26 Q70 26 70 42 Q84 44 82 58 Z" fill="' + p.b + '" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/>' +
      '<path d="M30 42 Q50 50 70 42" stroke="' + INK + '" stroke-width="2" fill="none" opacity=".4"/>' +
      '<circle cx="50" cy="18" r="8" fill="#ff4f8b" stroke="' + INK + '" stroke-width="2.5"/>' +
      '<path d="M50 10 Q54 2 62 4" stroke="' + INK + '" stroke-width="2.5" fill="none" stroke-linecap="round"/>' +
      '<circle cx="47" cy="15" r="2" fill="#fff" opacity=".8"/>' +
      '<rect x="32" y="34" width="6" height="2.6" rx="1.3" fill="' + p.c + '" transform="rotate(-30 35 35)"/>' +
      '<rect x="56" y="33" width="6" height="2.6" rx="1.3" fill="#8fd3ff" transform="rotate(25 59 34)"/>' +
      '<rect x="44" y="44" width="6" height="2.6" rx="1.3" fill="#8fe3cf" transform="rotate(10 47 45)"/>' +
      '<rect x="66" y="47" width="6" height="2.6" rx="1.3" fill="' + p.c + '" transform="rotate(-20 69 48)"/>' +
      '<rect x="24" y="49" width="6" height="2.6" rx="1.3" fill="#ffb07c" transform="rotate(40 27 50)"/>' +
      eyes(50, 72, 9) + smile(50, 78, 5);
  };

  D.butterfly = function (p) {
    return '<ellipse cx="30" cy="36" rx="22" ry="18" fill="' + p.a + '" stroke="' + INK + '" stroke-width="3" transform="rotate(-25 30 36)"/>' +
      '<ellipse cx="70" cy="36" rx="22" ry="18" fill="' + p.a + '" stroke="' + INK + '" stroke-width="3" transform="rotate(25 70 36)"/>' +
      '<ellipse cx="33" cy="66" rx="15" ry="13" fill="' + p.c + '" stroke="' + INK + '" stroke-width="3" transform="rotate(20 33 66)"/>' +
      '<ellipse cx="67" cy="66" rx="15" ry="13" fill="' + p.c + '" stroke="' + INK + '" stroke-width="3" transform="rotate(-20 67 66)"/>' +
      '<circle cx="28" cy="34" r="7" fill="' + p.b + '"/><circle cx="72" cy="34" r="7" fill="' + p.b + '"/>' +
      '<circle cx="33" cy="66" r="4.5" fill="#fff" opacity=".8"/><circle cx="67" cy="66" r="4.5" fill="#fff" opacity=".8"/>' +
      '<rect x="44" y="26" width="12" height="54" rx="6" fill="' + INK + '"/>' +
      '<circle cx="50" cy="24" r="9" fill="' + INK + '"/>' +
      '<path d="M46 17 Q40 6 34 8 M54 17 Q60 6 66 8" stroke="' + INK + '" stroke-width="2.5" fill="none" stroke-linecap="round"/>' +
      '<circle cx="34" cy="8" r="3" fill="' + p.b + '"/><circle cx="66" cy="8" r="3" fill="' + p.b + '"/>' +
      '<circle cx="46.5" cy="23" r="1.8" fill="#fff"/><circle cx="53.5" cy="23" r="1.8" fill="#fff"/>' +
      '<path d="M46 27.5 Q50 30.5 54 27.5" stroke="#fff" stroke-width="1.6" fill="none" stroke-linecap="round"/>';
  };

  D.unicorn = function (p) {
    return '<path d="M30 94 Q24 70 34 56 L62 60 Q70 80 66 94 Z" fill="#fff" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/>' +
      '<ellipse cx="50" cy="48" rx="24" ry="22" fill="#fff" stroke="' + INK + '" stroke-width="3"/>' +
      '<ellipse cx="70" cy="60" rx="16" ry="12" fill="#fff" stroke="' + INK + '" stroke-width="3"/>' +
      '<ellipse cx="72" cy="61" rx="13" ry="9.5" fill="#ffe3f1"/>' +
      '<circle cx="76" cy="59" r="1.8" fill="' + INK + '"/>' +
      '<path d="M66 66 Q72 69 78 65" stroke="' + INK + '" stroke-width="2.2" fill="none" stroke-linecap="round"/>' +
      '<path d="M50 28 L60 2 L64 32 Z" fill="' + p.b + '" stroke="' + INK + '" stroke-width="2.5" stroke-linejoin="round"/>' +
      '<path d="M53 22 L62 18 M55 14 L61 11 M52 28 L63 24" stroke="' + INK + '" stroke-width="1.6" opacity=".5"/>' +
      '<path d="M36 30 L32 14 L46 26 Z" fill="#fff" stroke="' + INK + '" stroke-width="2.5" stroke-linejoin="round"/>' +
      '<path d="M37 27 L34.5 18 L43 26 Z" fill="#ffc2df"/>' +
      '<circle cx="34" cy="34" r="9" fill="' + p.a + '" stroke="' + INK + '" stroke-width="2.5"/>' +
      '<circle cx="28" cy="46" r="9" fill="' + p.c + '" stroke="' + INK + '" stroke-width="2.5"/>' +
      '<circle cx="26" cy="59" r="9" fill="' + p.a + '" stroke="' + INK + '" stroke-width="2.5"/>' +
      '<circle cx="27" cy="72" r="8" fill="' + p.c + '" stroke="' + INK + '" stroke-width="2.5"/>' +
      '<circle cx="45" cy="28" r="7" fill="' + p.c + '" stroke="' + INK + '" stroke-width="2.5"/>' +
      '<path d="M48 46 Q53 51 58 46" stroke="' + INK + '" stroke-width="2.6" fill="none" stroke-linecap="round"/>' +
      '<path d="M50 49 L48 53 M54 50 L54 54 M57.5 48.5 L60 52" stroke="' + INK + '" stroke-width="1.8" stroke-linecap="round"/>' +
      '<circle cx="54" cy="57" r="3.5" fill="#ff9ec4" opacity=".7"/>' +
      sparkle(84, 20, 6, p.b) + sparkle(14, 16, 4, p.a);
  };

  D.mermaid = function (p) {
    return '<path d="M38 8 Q62 8 62 30 Q62 52 52 66 Q46 74 50 80 L38 80 Q30 66 34 50 Q38 34 38 8 Z" fill="' + p.a + '" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/>' +
      '<path d="M42 20 q4 4 8 0 q4 4 8 0 M40 32 q4 4 8 0 q4 4 8 0 M40 44 q4 4 8 0 q4 4 6 0 M40 56 q4 4 8 0" stroke="' + INK + '" stroke-width="1.8" fill="none" opacity=".45"/>' +
      '<path d="M44 78 Q26 74 12 92 Q32 96 44 86 Q56 96 80 92 Q66 74 44 78 Z" fill="' + p.c + '" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/>' +
      '<path d="M44 82 L28 90 M44 82 L62 90" stroke="' + INK + '" stroke-width="1.6" opacity=".4"/>' +
      '<circle cx="76" cy="26" r="5" fill="none" stroke="#8fd3ff" stroke-width="2.5"/>' +
      '<circle cx="82" cy="42" r="3.5" fill="none" stroke="#8fd3ff" stroke-width="2.2"/>' +
      '<circle cx="74" cy="54" r="2.5" fill="none" stroke="#8fd3ff" stroke-width="2"/>' +
      sparkle(22, 30, 6, p.b) + sparkle(24, 54, 3.5, p.b);
  };

  D.castle = function (p) {
    return '<rect x="20" y="44" width="60" height="48" fill="' + p.a + '" stroke="' + INK + '" stroke-width="3"/>' +
      '<rect x="8" y="34" width="18" height="58" fill="' + p.c + '" stroke="' + INK + '" stroke-width="3"/>' +
      '<rect x="74" y="34" width="18" height="58" fill="' + p.c + '" stroke="' + INK + '" stroke-width="3"/>' +
      '<path d="M5 35 L17 10 L29 35 Z M71 35 L83 10 L95 35 Z" fill="' + p.b + '" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/>' +
      '<rect x="38" y="30" width="24" height="20" fill="' + p.c + '" stroke="' + INK + '" stroke-width="3"/>' +
      '<path d="M35 31 L50 6 L65 31 Z" fill="' + p.b + '" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/>' +
      '<path d="M50 6 L50 0 L60 3 L50 6" fill="#ff4f8b" stroke="' + INK + '" stroke-width="1.5"/>' +
      '<path d="M40 92 L40 72 Q50 60 60 72 L60 92 Z" fill="' + INK + '" opacity=".8"/>' +
      '<path d="M13 52 Q17 46 21 52 L21 60 L13 60Z M79 52 Q83 46 87 52 L87 60 L79 60Z" fill="#fff6c9" stroke="' + INK + '" stroke-width="2"/>' +
      '<path d="M46 40 Q50 35 54 40 L54 45 L46 45Z" fill="#fff6c9" stroke="' + INK + '" stroke-width="2"/>' +
      '<path d="M30 56 l3 -4 3 4 -3 4z M64 56 l3 -4 3 4 -3 4z" fill="' + p.b + '"/>';
  };

  D.star = function (p) {
    return '<path d="M50 6 L62 36 L94 38 L69 58 L78 90 L50 72 L22 90 L31 58 L6 38 L38 36 Z" fill="' + p.b + '" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/>' +
      eyes(50, 50, 8) + smile(50, 58, 6) + cheeks(50, 58, 14) + sparkle(84, 12, 6, p.a) + sparkle(14, 74, 4, p.c);
  };

  D.heart = function (p) {
    return '<path d="M50 88 Q10 62 10 36 Q10 14 30 14 Q44 14 50 28 Q56 14 70 14 Q90 14 90 36 Q90 62 50 88 Z" fill="' + p.a + '" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/>' +
      '<path d="M24 32 Q26 22 34 21" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" opacity=".8"/>' +
      eyes(50, 46, 9) + smile(50, 54, 6) + cheeks(50, 54, 16) + sparkle(84, 80, 6, p.b);
  };

  D.rainbow = function (p) {
    var colors = ['#ff7eb6', '#ffb07c', '#ffe36e', '#8fe3cf', '#8fd3ff', '#b48cff'];
    var g = '';
    for (var i = 0; i < colors.length; i++) {
      var r = 42 - i * 5.5;
      g += '<path d="M' + (50 - r) + ' 70 A' + r + ' ' + r + ' 0 0 1 ' + (50 + r) + ' 70" stroke="' + colors[i] + '" stroke-width="6" fill="none"/>';
    }
    g += '<g fill="#fff" stroke="' + INK + '" stroke-width="2.5"><path d="M4 76 Q4 64 14 66 Q18 56 28 62 Q36 60 36 70 Q40 78 32 80 L10 80 Q4 80 4 76Z"/>' +
      '<path d="M64 76 Q64 64 74 66 Q78 56 88 62 Q96 60 96 70 Q100 78 92 80 L70 80 Q64 80 64 76Z"/></g>';
    return g + sparkle(50, 16, 6, p.b);
  };

  D.shell = function (p) {
    return '<path d="M50 88 L14 46 Q20 14 50 10 Q80 14 86 46 Z" fill="' + p.a + '" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/>' +
      '<path d="M50 88 L28 18 M50 88 L50 10 M50 88 L72 18 M50 88 L16 40 M50 88 L84 40" stroke="' + INK + '" stroke-width="2" opacity=".45"/>' +
      '<path d="M38 90 Q50 80 62 90 Z" fill="' + p.c + '" stroke="' + INK + '" stroke-width="2.5"/>' +
      '<circle cx="78" cy="78" r="7" fill="#fff" stroke="' + INK + '" stroke-width="2"/>' +
      '<circle cx="76" cy="76" r="2" fill="#fff" stroke="#c9a7ff" stroke-width="1"/>' + sparkle(18, 80, 5, p.b);
  };

  D.wand = function (p) {
    return '<rect x="47" y="40" width="7" height="56" rx="3.5" fill="' + p.c + '" stroke="' + INK + '" stroke-width="2.5" transform="rotate(30 50 68)"/>' +
      '<path d="M42 4 L50 22 L69 23 L54 35 L59 54 L42 43 L25 54 L30 35 L15 23 L34 22 Z" fill="' + p.b + '" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/>' +
      sparkle(80, 16, 7, p.a) + sparkle(82, 42, 4, p.c) + sparkle(10, 60, 5, p.a) + sparkle(70, 66, 3.5, p.b);
  };

  D.princess = function (p) {
    return '<path d="M50 44 L18 94 L82 94 Z" fill="' + p.a + '" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/>' +
      '<path d="M26 84 Q38 78 50 84 Q62 78 74 84" stroke="#fff" stroke-width="3" fill="none" opacity=".8"/>' +
      '<path d="M34 50 Q30 64 26 66 M66 50 Q70 64 74 66" stroke="#f6c7a8" stroke-width="6" stroke-linecap="round" fill="none"/>' +
      '<path d="M24 34 Q22 62 30 70 L36 36 Z M76 34 Q78 62 70 70 L64 36 Z" fill="#8a5a3c" stroke="' + INK + '" stroke-width="2.5" stroke-linejoin="round"/>' +
      '<circle cx="50" cy="32" r="18" fill="#f6c7a8" stroke="' + INK + '" stroke-width="3"/>' +
      '<path d="M32 30 Q34 12 50 13 Q66 12 68 30 Q58 22 50 24 Q42 22 32 30 Z" fill="#8a5a3c" stroke="' + INK + '" stroke-width="2.5" stroke-linejoin="round"/>' +
      '<path d="M38 15 L36 3 L44 9 L50 1 L56 9 L64 3 L62 15 Z" fill="' + p.b + '" stroke="' + INK + '" stroke-width="2.3" stroke-linejoin="round"/>' +
      '<circle cx="50" cy="8" r="2.4" fill="' + p.c + '"/>' +
      eyes(50, 33, 6.5) + smile(50, 39, 4) + cheeks(50, 39, 11) + sparkle(88, 50, 5, p.b);
  };

  D.gem = function (p) {
    return '<path d="M26 18 L74 18 L92 40 L50 92 L8 40 Z" fill="' + p.c + '" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/>' +
      '<path d="M8 40 L92 40 M26 18 L38 40 L50 18 L62 40 L74 18 M38 40 L50 92 L62 40" stroke="' + INK + '" stroke-width="2" fill="none" stroke-linejoin="round" opacity=".55"/>' +
      '<path d="M30 24 L38 36 L42 24 Z" fill="#fff" opacity=".7"/>' + sparkle(84, 14, 7, p.b) + sparkle(16, 80, 5, p.a);
  };

  D.flower = function (p) {
    var g = '<path d="M50 60 Q48 80 52 96" stroke="#5bbf8a" stroke-width="5" fill="none" stroke-linecap="round"/>' +
      '<ellipse cx="64" cy="84" rx="11" ry="5" fill="#7fd9a3" stroke="' + INK + '" stroke-width="2" transform="rotate(-30 64 84)"/>';
    for (var i = 0; i < 6; i++) {
      g += '<ellipse cx="50" cy="20" rx="12" ry="17" fill="' + (i % 2 ? p.a : p.c) + '" stroke="' + INK + '" stroke-width="2.5" transform="rotate(' + (i * 60) + ' 50 42)"/>';
    }
    return g + '<circle cx="50" cy="42" r="14" fill="' + p.b + '" stroke="' + INK + '" stroke-width="3"/>' + eyes(50, 40, 5) + smile(50, 45, 3.5);
  };

  D.moon = function (p) {
    return '<path d="M62 8 A42 42 0 1 0 92 70 A34 34 0 1 1 62 8 Z" fill="' + p.b + '" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/>' +
      '<path d="M30 54 Q34 58 38 54" stroke="' + INK + '" stroke-width="2.4" fill="none" stroke-linecap="round"/>' +
      smile(40, 66, 5) + '<circle cx="28" cy="64" r="3.5" fill="#ff9ec4" opacity=".7"/>' +
      sparkle(76, 30, 8, p.a) + sparkle(62, 52, 4.5, p.c) + sparkle(86, 50, 3.5, p.a);
  };

  var DESIGNS = ['unicorn', 'mermaid', 'butterfly', 'cupcake', 'princess', 'crown', 'castle',
    'star', 'heart', 'rainbow', 'shell', 'wand', 'gem', 'flower', 'moon'];

  // Sticker id "unicorn-2" = design + palette index.
  function stickerIds() {
    var out = [];
    for (var pi = 0; pi < 2; pi++) {
      for (var i = 0; i < DESIGNS.length; i++) out.push(DESIGNS[i] + '-' + (pi === 0 ? 0 : (i % 5) + 1));
    }
    return out;
  }

  function sticker(id, cls) {
    var parts = id.split('-');
    var p = PALETTES[+parts[1] || 0];
    return svg(D[parts[0]](p), cls || 'art');
  }

  function crown(colorIndex, gems, cls) {
    return svg(D.crown(PALETTES[colorIndex % PALETTES.length], gems), cls || 'art');
  }

  var ICONS = {
    speaker: '<path d="M14 38 L32 38 L54 18 L54 82 L32 62 L14 62 Z" fill="#fff" stroke="' + INK + '" stroke-width="5" stroke-linejoin="round"/>' +
      '<path d="M66 34 Q76 50 66 66 M76 24 Q92 50 76 76" stroke="#fff" stroke-width="7" fill="none" stroke-linecap="round"/>',
    home: '<path d="M14 50 L50 16 L86 50 L78 50 L78 86 L22 86 L22 50 Z" fill="#fff" stroke="' + INK + '" stroke-width="5" stroke-linejoin="round"/>' +
      '<path d="M42 86 L42 64 L58 64 L58 86" fill="' + INK + '" opacity=".7"/>',
    album: '<rect x="16" y="12" width="68" height="78" rx="8" fill="#fff" stroke="' + INK + '" stroke-width="5"/>' +
      '<path d="M50 70 Q28 56 28 42 Q28 32 38 32 Q46 32 50 40 Q54 32 62 32 Q72 32 72 42 Q72 56 50 70 Z" fill="#ff7eb6"/>',
    play: '<path d="M50 6 L62 36 L94 38 L69 58 L78 90 L50 72 L22 90 L31 58 L6 38 L38 36 Z" fill="#ffd34d" stroke="' + INK + '" stroke-width="4" stroke-linejoin="round"/>' +
      '<path d="M43 40 L62 52 L43 64 Z" fill="' + INK + '"/>',
    back: '<path d="M62 16 L28 50 L62 84" stroke="#fff" stroke-width="12" fill="none" stroke-linecap="round" stroke-linejoin="round"/>'
  };

  function icon(name, cls) { return svg(ICONS[name], cls || 'icon'); }

  root.Art = {
    PALETTES: PALETTES, DESIGNS: DESIGNS, sparkle: sparkle,
    stickerIds: stickerIds, sticker: sticker, crown: crown, icon: icon, draw: function (name, pi, cls) {
      return svg(D[name](PALETTES[pi || 0]), cls);
    }
  };
})(window.HSL = window.HSL || {});
