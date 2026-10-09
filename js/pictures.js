/* Pictures for the letter-sound key words (apple, ball, cat...).
   Original SVG drawings in the same style as js/art.js. 100x100 box. */
(function (root) {
  'use strict';
  var INK = '#5b3a6e';
  var O = ' stroke="' + INK + '" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"';
  var O2 = ' stroke="' + INK + '" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"';

  function eyes(cx, cy, gap, r) {
    r = r || 2.8;
    return '<circle cx="' + (cx - gap) + '" cy="' + cy + '" r="' + r + '" fill="' + INK + '"/>' +
      '<circle cx="' + (cx + gap) + '" cy="' + cy + '" r="' + r + '" fill="' + INK + '"/>' +
      '<circle cx="' + (cx - gap + 0.9) + '" cy="' + (cy - 0.9) + '" r="0.9" fill="#fff"/>' +
      '<circle cx="' + (cx + gap + 0.9) + '" cy="' + (cy - 0.9) + '" r="0.9" fill="#fff"/>';
  }

  function smile(cx, cy, w) {
    return '<path d="M' + (cx - w) + ' ' + cy + ' Q' + cx + ' ' + (cy + w) + ' ' + (cx + w) + ' ' + cy + '" fill="none"' + O2 + '/>';
  }

  var P = {};

  P.apple = '<path d="M50 30 Q40 20 26 26 Q10 34 14 58 Q18 84 36 90 Q44 92 50 88 Q56 92 64 90 Q82 84 86 58 Q90 34 74 26 Q60 20 50 30 Z" fill="#ff5a6e"' + O + '/>' +
    '<path d="M50 30 Q50 18 56 10" fill="none"' + O + '/>' +
    '<path d="M54 18 Q66 6 78 14 Q68 26 54 18 Z" fill="#7fd9a3"' + O2 + '/>' +
    '<path d="M26 44 Q28 34 36 32" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".7"/>';

  P.ball = '<circle cx="50" cy="52" r="38" fill="#fff"' + O + '/>' +
    '<path d="M50 14 Q28 30 28 52 Q28 74 50 90 Q38 70 38 52 Q38 32 50 14 Z" fill="#ff7eb6"/>' +
    '<path d="M50 14 Q72 30 72 52 Q72 74 50 90 Q62 70 62 52 Q62 32 50 14 Z" fill="#8fd3ff"/>' +
    '<path d="M12 52 Q50 62 88 52" fill="none" stroke="#ffd34d" stroke-width="7"/>' +
    '<circle cx="50" cy="52" r="38" fill="none"' + O + '/>' +
    '<circle cx="50" cy="52" r="5" fill="#fff"' + O2 + '/>';

  P.cat = '<path d="M20 40 L18 12 L40 28 Z M80 40 L82 12 L60 28 Z" fill="#ffb07c"' + O + '/>' +
    '<path d="M22 34 L21 19 L33 29 Z M78 34 L79 19 L67 29 Z" fill="#ffc2df"/>' +
    '<ellipse cx="50" cy="54" rx="36" ry="32" fill="#ffb07c"' + O + '/>' +
    eyes(50, 50, 13, 3.5) +
    '<path d="M46 60 L54 60 L50 65 Z" fill="#ff7eb6"' + O2 + '/>' +
    '<path d="M50 65 Q44 72 40 68 M50 65 Q56 72 60 68" fill="none"' + O2 + '/>' +
    '<path d="M30 60 L12 56 M30 64 L12 66 M70 60 L88 56 M70 64 L88 66" fill="none"' + O2 + '/>';

  P.dog = '<path d="M24 30 Q8 34 10 60 Q14 72 24 66 Z M76 30 Q92 34 90 60 Q86 72 76 66 Z" fill="#a8743f"' + O + '/>' +
    '<ellipse cx="50" cy="52" rx="30" ry="32" fill="#e8c39a"' + O + '/>' +
    '<ellipse cx="50" cy="68" rx="16" ry="12" fill="#fff4e6"' + O2 + '/>' +
    eyes(50, 46, 11, 3.4) +
    '<ellipse cx="50" cy="62" rx="6" ry="4.5" fill="' + INK + '"/>' +
    smile(50, 70, 6) +
    '<path d="M48 76 Q50 84 54 76" fill="#ff7eb6"' + O2 + '/>';

  P.egg = '<path d="M50 10 Q78 12 82 56 Q82 90 50 92 Q18 90 18 56 Q22 12 50 10 Z" fill="#fff7e0"' + O + '/>' +
    '<path d="M32 40 Q34 26 44 22" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round"/>' +
    '<circle cx="62" cy="70" r="3" fill="#f0d9a8"/><circle cx="40" cy="78" r="2" fill="#f0d9a8"/>';

  P.fish = '<path d="M74 50 L94 30 L92 70 Z" fill="#ffb07c"' + O + '/>' +
    '<ellipse cx="46" cy="50" rx="34" ry="24" fill="#ffd34d"' + O + '/>' +
    '<path d="M40 28 Q50 16 60 30 Z M42 72 Q50 82 56 72 Z" fill="#ffb07c"' + O2 + '/>' +
    '<path d="M52 34 Q60 50 52 66" fill="none"' + O2 + '/>' +
    '<circle cx="26" cy="44" r="4.5" fill="#fff"' + O2 + '/><circle cx="27" cy="44" r="2" fill="' + INK + '"/>' +
    '<path d="M14 56 Q20 60 26 56" fill="none"' + O2 + '/>' +
    '<circle cx="8" cy="30" r="3" fill="none" stroke="#8fd3ff" stroke-width="2"/>' +
    '<circle cx="14" cy="20" r="2" fill="none" stroke="#8fd3ff" stroke-width="2"/>';

  P.goat = '<path d="M36 26 Q26 8 12 12 Q22 16 30 32 Z M64 26 Q74 8 88 12 Q78 16 70 32 Z" fill="#c9b79c"' + O + '/>' +
    '<path d="M28 36 L8 34 L24 46 Z M72 36 L92 34 L76 46 Z" fill="#fff"' + O + '/>' +
    '<path d="M28 32 Q50 20 72 32 L66 72 Q50 84 34 72 Z" fill="#fff"' + O + '/>' +
    '<path d="M42 78 L50 96 L58 78 Z" fill="#e6dccb"' + O2 + '/>' +
    eyes(50, 46, 11, 3.2) +
    '<ellipse cx="50" cy="66" rx="10" ry="7" fill="#ffd6e4"' + O2 + '/>' +
    '<circle cx="46" cy="66" r="1.6" fill="' + INK + '"/><circle cx="54" cy="66" r="1.6" fill="' + INK + '"/>';

  P.hat = '<ellipse cx="50" cy="66" rx="44" ry="14" fill="#ffd34d"' + O + '/>' +
    '<path d="M24 64 Q24 30 50 30 Q76 30 76 64 Q50 74 24 64 Z" fill="#ffd34d"' + O + '/>' +
    '<path d="M25 56 Q50 64 75 56 L76 64 Q50 72 24 64 Z" fill="#ff7eb6"' + O2 + '/>' +
    '<circle cx="70" cy="58" r="6" fill="#c9a7ff"' + O2 + '/><circle cx="70" cy="58" r="2" fill="#ffd34d"/>';

  P.igloo = '<path d="M8 80 Q8 26 50 26 Q92 26 92 80 Z" fill="#eaf7ff"' + O + '/>' +
    '<path d="M12 64 L88 64 M18 48 L82 48 M30 34 L70 34 M30 34 L30 48 M50 26 L50 34 M70 34 L70 48 M40 48 L40 64 M62 48 L62 64 M20 64 L20 80 M80 64 L80 80" fill="none" stroke="#8fd3ff" stroke-width="2"/>' +
    '<path d="M38 80 L38 66 Q50 54 62 66 L62 80 Z" fill="#5b7fa8"' + O + '/>' +
    '<path d="M4 82 L96 82" fill="none"' + O + '/>';

  P.jam = '<rect x="22" y="30" width="56" height="60" rx="12" fill="#ff4f8b"' + O + '/>' +
    '<rect x="18" y="16" width="64" height="16" rx="5" fill="#c9a7ff"' + O + '/>' +
    '<path d="M18 22 L82 22" fill="none" stroke="#fff" stroke-width="2" opacity=".6"/>' +
    '<rect x="30" y="46" width="40" height="28" rx="6" fill="#fff7e0"' + O2 + '/>' +
    '<path d="M50 66 Q40 58 42 52 Q46 48 50 52 Q54 48 58 52 Q60 58 50 66 Z" fill="#ff4f8b"/>' +
    '<path d="M30 38 Q28 50 30 80" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".5"/>';

  P.kite = '<path d="M50 6 L80 38 L50 74 L20 38 Z" fill="#8fd3ff"' + O + '/>' +
    '<path d="M50 6 L50 74 M20 38 L80 38" fill="none"' + O2 + '/>' +
    '<path d="M50 6 L80 38 L50 38 Z M20 38 L50 74 L50 38 Z" fill="#ff7eb6"/>' +
    '<path d="M50 6 L80 38 L50 74 L20 38 Z" fill="none"' + O + '/>' +
    '<path d="M50 74 Q40 82 50 88 Q60 94 52 99" fill="none"' + O2 + '/>' +
    '<path d="M42 82 L48 84 L42 88 Z M54 90 L60 92 L54 96 Z" fill="#ffd34d"' + O2 + '/>';

  P.lion = '<circle cx="50" cy="52" r="42" fill="#e8913a"' + O + '/>' +
    '<path d="M50 10 L56 20 L66 14 L68 26 L80 24 L76 36 L88 40 L80 50 L90 60 L78 64 L82 76 L70 74 L66 86 L56 80 L50 92 L44 80 L34 86 L30 74 L18 76 L22 64 L10 60 L20 50 L12 40 L24 36 L20 24 L32 26 L34 14 L44 20 Z" fill="#e8913a"' + O2 + '/>' +
    '<circle cx="50" cy="54" r="26" fill="#ffd27a"' + O + '/>' +
    '<circle cx="30" cy="34" r="6" fill="#ffd27a"' + O2 + '/><circle cx="70" cy="34" r="6" fill="#ffd27a"' + O2 + '/>' +
    eyes(50, 50, 9, 3) +
    '<path d="M45 60 L55 60 L50 66 Z" fill="' + INK + '"/>' +
    '<path d="M50 66 Q45 72 40 69 M50 66 Q55 72 60 69" fill="none"' + O2 + '/>';

  P.moon = '<path d="M64 8 A44 44 0 1 0 92 72 A36 36 0 1 1 64 8 Z" fill="#ffe36e"' + O + '/>' +
    '<path d="M32 52 Q36 56 40 52" fill="none"' + O2 + '/>' + smile(40, 64, 5) +
    '<circle cx="28" cy="62" r="3.5" fill="#ff9ec4" opacity=".7"/>';

  P.nest = '<circle cx="34" cy="50" r="12" fill="#bfe6ff"' + O2 + '/>' +
    '<circle cx="52" cy="46" r="12" fill="#fff"' + O2 + '/>' +
    '<circle cx="68" cy="50" r="12" fill="#bfe6ff"' + O2 + '/>' +
    '<path d="M8 52 Q10 86 50 88 Q90 86 92 52 Q50 64 8 52 Z" fill="#b07a4a"' + O + '/>' +
    '<path d="M14 60 Q50 74 86 60 M18 70 Q50 82 82 70 M30 54 L40 84 M60 58 L54 86 M74 56 L80 80" fill="none" stroke="#7a4f2a" stroke-width="2.5" stroke-linecap="round"/>';

  (function () {
    var legs = '';
    for (var i = 0; i < 8; i++) {
      var x = 16 + i * 9.7;
      legs += '<path d="M' + x + ' 56 Q' + (x - 6 + (i % 2) * 12) + ' 76 ' + (x + (i < 4 ? -6 : 6)) + ' 92" fill="none" stroke="#c9a7ff" stroke-width="8" stroke-linecap="round"/>';
    }
    P.octopus = legs +
      '<path d="M14 58 Q12 10 50 10 Q88 10 86 58 Q50 70 14 58 Z" fill="#c9a7ff"' + O + '/>' +
      eyes(50, 38, 12, 4) + smile(50, 48, 6) +
      '<circle cx="30" cy="48" r="4" fill="#ff9ec4" opacity=".7"/><circle cx="70" cy="48" r="4" fill="#ff9ec4" opacity=".7"/>';
  })();

  P.pig = '<path d="M22 34 L18 10 L40 24 Z M78 34 L82 10 L60 24 Z" fill="#ffb3cf"' + O + '/>' +
    '<circle cx="50" cy="54" r="36" fill="#ffc2da"' + O + '/>' +
    eyes(50, 44, 13, 3.4) +
    '<ellipse cx="50" cy="62" rx="15" ry="10" fill="#ff9ec4"' + O + '/>' +
    '<ellipse cx="45" cy="62" rx="2.5" ry="3.5" fill="' + INK + '"/><ellipse cx="55" cy="62" rx="2.5" ry="3.5" fill="' + INK + '"/>' +
    smile(50, 78, 6);

  P.queen = '<path d="M26 46 Q20 80 30 88 L40 48 Z M74 46 Q80 80 70 88 L60 48 Z" fill="#c9a7ff"' + O + '/>' +
    '<circle cx="50" cy="52" r="24" fill="#f6c7a8"' + O + '/>' +
    '<path d="M26 50 Q28 26 50 26 Q72 26 74 50 Q62 38 50 40 Q38 38 26 50 Z" fill="#c9a7ff"' + O + '/>' +
    '<path d="M30 30 L26 6 L40 18 L50 2 L60 18 L74 6 L70 30 Z" fill="#ffd34d"' + O + '/>' +
    '<circle cx="50" cy="16" r="3.5" fill="#ff4f8b"/><circle cx="36" cy="22" r="2.5" fill="#8fd3ff"/><circle cx="64" cy="22" r="2.5" fill="#8fd3ff"/>' +
    eyes(50, 52, 8, 3) + smile(50, 62, 6) +
    '<circle cx="36" cy="62" r="3.5" fill="#ff9ec4" opacity=".7"/><circle cx="64" cy="62" r="3.5" fill="#ff9ec4" opacity=".7"/>';

  P.rain = '<path d="M20 56 Q6 56 8 44 Q10 32 24 34 Q26 16 46 18 Q60 8 72 22 Q92 20 92 40 Q94 56 78 56 Z" fill="#dfe8f5"' + O + '/>' +
    '<path d="M28 64 Q20 78 28 82 Q36 78 28 64 Z M52 66 Q44 80 52 84 Q60 80 52 66 Z M76 64 Q68 78 76 82 Q84 78 76 64 Z M40 82 Q33 94 40 97 Q47 94 40 82 Z M64 82 Q57 94 64 97 Q71 94 64 82 Z" fill="#8fd3ff"' + O2 + '/>';

  (function () {
    var rays = '';
    for (var i = 0; i < 12; i++) {
      var a = i * Math.PI / 6;
      rays += '<path d="M' + (50 + Math.cos(a) * 32).toFixed(1) + ' ' + (50 + Math.sin(a) * 32).toFixed(1) +
        ' L' + (50 + Math.cos(a) * 46).toFixed(1) + ' ' + (50 + Math.sin(a) * 46).toFixed(1) + '" stroke="#ffb020" stroke-width="6" stroke-linecap="round"/>';
    }
    P.sun = rays + '<circle cx="50" cy="50" r="27" fill="#ffd34d"' + O + '/>' + eyes(50, 46, 9, 3) + smile(50, 56, 7) +
      '<circle cx="35" cy="56" r="3.5" fill="#ff9ec4" opacity=".7"/><circle cx="65" cy="56" r="3.5" fill="#ff9ec4" opacity=".7"/>';
  })();

  P.top = '<rect x="46" y="6" width="8" height="18" rx="3" fill="#c9a7ff"' + O + '/>' +
    '<path d="M14 40 Q50 18 86 40 Q80 62 50 94 Q20 62 14 40 Z" fill="#ff7eb6"' + O + '/>' +
    '<path d="M16 42 Q50 58 84 42 M24 58 Q50 72 76 58" fill="none" stroke="#ffd34d" stroke-width="5"/>' +
    '<path d="M14 40 Q50 18 86 40 Q80 62 50 94 Q20 62 14 40 Z" fill="none"' + O + '/>' +
    '<path d="M6 76 Q14 72 18 78 M82 78 Q86 72 94 76" fill="none" stroke="#c9a7ff" stroke-width="2.5" stroke-linecap="round"/>';

  P.umbrella = '<path d="M50 50 L50 82 Q50 92 40 92 Q32 92 32 84" fill="none" stroke="' + INK + '" stroke-width="5" stroke-linecap="round"/>' +
    '<path d="M6 52 Q8 12 50 10 Q92 12 94 52 Q86 44 78 52 Q70 44 62 52 Q56 44 50 52 Q44 44 38 52 Q30 44 22 52 Q14 44 6 52 Z" fill="#8fd3ff"' + O + '/>' +
    '<path d="M50 10 Q34 26 38 52 M50 10 Q66 26 62 52 M50 10 L50 52" fill="none"' + O2 + '/>' +
    '<path d="M50 10 Q34 26 38 52 Q30 44 22 52 Q14 44 6 52 Q8 12 50 10 Z" fill="#ff9ad5" opacity=".9"/>' +
    '<path d="M50 10 Q66 26 62 52 Q70 44 78 52 Q86 44 94 52 Q92 12 50 10 Z" fill="#ff9ad5" opacity=".9"/>' +
    '<path d="M6 52 Q8 12 50 10 Q92 12 94 52" fill="none"' + O + '/>';

  P.van = '<path d="M8 70 L8 36 Q8 26 18 26 L64 26 Q72 26 78 34 L90 50 Q94 54 94 60 L94 70 Z" fill="#b48cff"' + O + '/>' +
    '<path d="M18 34 L38 34 L38 50 L18 50 Z M44 34 L62 34 L62 50 L44 50 Z" fill="#dff3ff"' + O2 + '/>' +
    '<path d="M68 34 Q72 34 76 40 L84 50 L68 50 Z" fill="#dff3ff"' + O2 + '/>' +
    '<path d="M8 60 L94 60" fill="none" stroke="#ffd34d" stroke-width="5"/>' +
    '<circle cx="28" cy="72" r="10" fill="' + INK + '"/><circle cx="28" cy="72" r="4" fill="#ddd"/>' +
    '<circle cx="74" cy="72" r="10" fill="' + INK + '"/><circle cx="74" cy="72" r="4" fill="#ddd"/>' +
    '<rect x="88" y="56" width="6" height="5" rx="2" fill="#ffe36e"/>';

  (function () {
    var g = '';
    var spokes = 8;
    for (var i = 0; i < spokes; i++) {
      var a = i * 2 * Math.PI / spokes;
      g += '<path d="M50 48 L' + (50 + Math.cos(a) * 44).toFixed(1) + ' ' + (48 + Math.sin(a) * 44).toFixed(1) + '"/>';
    }
    [12, 22, 32, 42].forEach(function (r) {
      var pts = [];
      for (var j = 0; j <= spokes; j++) {
        var b = j * 2 * Math.PI / spokes;
        pts.push((50 + Math.cos(b) * r).toFixed(1) + ' ' + (48 + Math.sin(b) * r).toFixed(1));
      }
      g += '<path d="M' + pts.join(' L') + '"/>';
    });
    P.web = '<g fill="none" stroke="#8a7a9a" stroke-width="2" stroke-linejoin="round">' + g + '</g>' +
      '<path d="M66 48 L66 64" stroke="' + INK + '" stroke-width="1.5"/>' +
      '<circle cx="66" cy="70" r="7" fill="' + INK + '"/>' +
      '<path d="M60 66 L54 62 M60 72 L54 76 M72 66 L78 62 M72 72 L78 76" stroke="' + INK + '" stroke-width="2" stroke-linecap="round"/>' +
      '<circle cx="64" cy="69" r="1.3" fill="#fff"/><circle cx="68" cy="69" r="1.3" fill="#fff"/>';
  })();

  P.box = '<path d="M14 36 L50 22 L86 36 L50 50 Z" fill="#e8c18a"' + O + '/>' +
    '<path d="M14 36 L50 50 L50 92 L14 78 Z" fill="#d9a865"' + O + '/>' +
    '<path d="M86 36 L50 50 L50 92 L86 78 Z" fill="#c8924d"' + O + '/>' +
    '<path d="M14 36 L4 50 L40 64 L50 50 Z M86 36 L96 50 L60 64 L50 50 Z" fill="#e8c18a"' + O2 + '/>' +
    '<path d="M24 58 L40 64 M68 70 L76 66" fill="none" stroke="#fff" stroke-width="3" opacity=".6"/>';

  P['yo-yo'] = '<path d="M50 4 L50 34" fill="none"' + O2 + '/>' +
    '<circle cx="50" cy="4" r="3" fill="none"' + O2 + '/>' +
    '<circle cx="50" cy="64" r="32" fill="#ff7eb6"' + O + '/>' +
    '<circle cx="50" cy="64" r="20" fill="#ffd34d"' + O2 + '/>' +
    '<circle cx="50" cy="64" r="6" fill="#fff"' + O2 + '/>' +
    '<path d="M28 50 Q32 40 42 36" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".7"/>';

  P.zebra = '<path d="M32 22 L26 4 L42 16 Z M68 22 L74 4 L58 16 Z" fill="#fff"' + O + '/>' +
    '<path d="M40 14 Q50 2 60 14 L58 22 L42 22 Z" fill="' + INK + '"/>' +
    '<path d="M30 24 Q50 12 70 24 Q74 50 66 70 L34 70 Q26 50 30 24 Z" fill="#fff"' + O + '/>' +
    '<path d="M34 32 Q40 34 44 30 M66 32 Q60 34 56 30 M31 44 Q38 46 42 42 M69 44 Q62 46 58 42 M32 56 Q38 58 40 54 M68 56 Q62 58 60 54 M46 26 L50 34 L54 26" fill="none" stroke="' + INK + '" stroke-width="4" stroke-linecap="round"/>' +
    '<ellipse cx="50" cy="76" rx="20" ry="16" fill="#8a7a9a"' + O + '/>' +
    '<ellipse cx="43" cy="76" rx="3" ry="4" fill="' + INK + '"/><ellipse cx="57" cy="76" rx="3" ry="4" fill="' + INK + '"/>' +
    eyes(50, 48, 10, 3.2);

  function picture(word, cls) {
    var body = P[word];
    if (!body) return '';
    return '<svg class="' + (cls || 'art') + '" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' + body + '</svg>';
  }

  root.Pictures = { picture: picture, has: function (w) { return !!P[w]; }, words: function () { return Object.keys(P); } };
})(window.HSL = window.HSL || {});
