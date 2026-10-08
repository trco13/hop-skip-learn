/* Device check page. Plain ES5 so it runs (and reports) on old browsers. */
(function (H) {
  'use strict';
  var results = {};

  function $(id) { return document.getElementById(id); }
  function set(id, level, text) {
    var el = $(id);
    el.className = 'res ' + level;
    el.innerHTML = text;
    results[id] = level.toUpperCase() + ': ' + text.replace(/<[^>]+>/g, '');
    summary();
  }

  function summary() {
    var lines = ['Device check', 'Browser: ' + navigator.userAgent,
      'Screen: ' + window.innerWidth + 'x' + window.innerHeight + ' @' + (window.devicePixelRatio || 1)];
    for (var k in results) if (results.hasOwnProperty(k)) lines.push(k.replace(/^r/, '') + ' = ' + results[k]);
    $('summary').value = lines.join('\n');
  }

  // 1. Sound
  $('soundBtn').addEventListener('click', function () {
    H.Sound.unlock();
    var a = document.createElement('audio');
    var can = a.canPlayType ? a.canPlayType('audio/mpeg') : '';
    if (!can) { set('rSound', 'fail', 'this browser says it cannot play MP3'); return; }
    set('rSound', 'warn', 'playing... (MP3 support: ' + can + ')');
    H.Sound.playSeq(['sfx_chime', 'check'], function () {
      $('soundHeard').className = '';
    });
  }, false);
  $('heardYes').addEventListener('click', function () { set('rSound', 'pass', 'sound works'); }, false);
  $('heardNo').addEventListener('click', function () { set('rSound', 'fail', 'no sound heard'); }, false);

  // 2. Font
  $('fontYes').addEventListener('click', function () { set('rFont', 'pass', 'letter shapes look right'); }, false);
  $('fontNo').addEventListener('click', function () { set('rFont', 'fail', 'letter shapes look wrong'); }, false);
  function fontCheck(tries) {
    // Compare the width of text in the game font with a fallback font.
    var span = document.createElement('span');
    span.style.cssText = 'position:absolute;left:-999px;top:0;font-size:60px;font-weight:bold;white-space:nowrap';
    span.innerHTML = 'aggyIl47mw';
    document.body.appendChild(span);
    span.style.fontFamily = 'serif';
    var w1 = span.offsetWidth;
    span.style.fontFamily = "'LetterFont', serif";
    var w2 = span.offsetWidth;
    document.body.removeChild(span);
    if (w1 !== w2) set('rFontLoad', 'pass', 'loaded');
    else if (tries > 0) setTimeout(function () { fontCheck(tries - 1); }, 500);
    else set('rFontLoad', 'fail', 'did not load');
  }
  fontCheck(10);

  // 3. Touch
  var taps = 0, kinds = {};
  function tapped(e) {
    kinds[e.type] = 1;
    taps++;
    var list = [];
    for (var k in kinds) if (kinds.hasOwnProperty(k)) list.push(k);
    $('touchpad').innerHTML = 'Tapped ' + taps + ' time' + (taps > 1 ? 's' : '');
    set('rTouch', 'pass', 'works (' + list.join(', ') + ')');
  }
  $('touchpad').addEventListener('touchstart', tapped, false);
  $('touchpad').addEventListener('click', tapped, false);

  var holdTimer = null;
  function holdStart(e) {
    if (e.preventDefault) e.preventDefault();
    if (holdTimer) return;
    $('holdpad').innerHTML = 'Keep holding...';
    holdTimer = setTimeout(function () {
      holdTimer = null;
      $('holdpad').innerHTML = 'Done!';
      set('rHold', 'pass', 'press and hold works');
    }, 3000);
  }
  function holdEnd() {
    if (holdTimer) {
      clearTimeout(holdTimer); holdTimer = null;
      $('holdpad').innerHTML = 'Let go too soon. Try again.';
    }
  }
  var hp = $('holdpad');
  hp.addEventListener('touchstart', holdStart, false);
  hp.addEventListener('touchend', holdEnd, false);
  hp.addEventListener('touchcancel', holdEnd, false);
  hp.addEventListener('mousedown', holdStart, false);
  hp.addEventListener('mouseup', holdEnd, false);
  hp.addEventListener('contextmenu', function (e) { e.preventDefault(); }, false);

  // 4. Art
  try {
    $('artDemo').innerHTML = H.Art.draw('cupcake', 0, 'art pulse-demo');
    var svg = $('artDemo').getElementsByTagName('svg')[0];
    var ok = svg && svg.getBoundingClientRect && svg.getBoundingClientRect().width > 10;
    svg.style.webkitAnimation = 'pulse 1.6s ease-in-out infinite';
    svg.style.animation = 'pulse 1.6s ease-in-out infinite';
    set('rArt', ok ? 'pass' : 'fail', ok ? 'pictures draw' : 'pictures did not draw');
  } catch (e) { set('rArt', 'fail', 'error: ' + e.message); }

  // 5. Storage
  if (H.Store.persistent) {
    var last = H.Store.get('deviceCheckVisit', null);
    H.Store.set('deviceCheckVisit', new Date().toString());
    set('rStore', 'pass', 'progress can be saved');
    $('rVisit').innerHTML = last ? 'Saved from your last visit: ' + last + ' (it survived a reload)'
      : 'Reload this page: it should then show the time of this visit.';
  } else {
    set('rStore', 'fail', 'this browser is not saving (private mode or storage blocked)');
  }

  // 6. Features
  var div = document.createElement('div');
  var feats = [
    ['flexbox layout', 'flex' in div.style || 'webkitFlex' in div.style || 'WebkitFlex' in div.style],
    ['CSS animations', 'animation' in div.style || 'webkitAnimation' in div.style],
    ['vmin units', (function () { div.style.width = '10vmin'; return div.style.width === '10vmin'; })()],
    ['SVG', !!(document.createElementNS && document.createElementNS('http://www.w3.org/2000/svg', 'svg').createSVGRect)],
    ['JSON', typeof JSON !== 'undefined'],
    ['touch events', 'ontouchstart' in window],
    ['MP3 audio', !!(document.createElement('audio').canPlayType && document.createElement('audio').canPlayType('audio/mpeg'))]
  ];
  var html = '', bad = [];
  for (var i = 0; i < feats.length; i++) {
    html += '<div>' + feats[i][0] + ': <span class="res ' + (feats[i][1] ? 'pass">yes' : 'warn">no') + '</span></div>';
    if (!feats[i][1]) bad.push(feats[i][0]);
  }
  $('rFeatures').innerHTML = html;
  results.rFeatures = bad.length ? 'WARN: missing ' + bad.join(', ') : 'PASS: all present';

  // 7. Screen
  function screenInfo() {
    $('rScreen').innerHTML = 'Window ' + window.innerWidth + ' x ' + window.innerHeight +
      ', pixel ratio ' + (window.devicePixelRatio || 1) + ', ' +
      (window.innerWidth >= window.innerHeight ? 'landscape' : 'portrait');
    summary();
  }
  window.addEventListener('resize', screenInfo, false);
  screenInfo();
})(window.HSL);
