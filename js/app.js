/* Screens, home, sticker album, reward pop-ups, hidden parent entry. */
(function (root) {
  'use strict';
  var Art = root.Art, Sound = root.Sound, Store = root.Store, Rewards = root.Rewards;

  function $(id) { return document.getElementById(id); }

  function on(el, ev, fn) { el.addEventListener(ev, fn, false); }

  // Fast, single-fire tap for buttons (click works for touch and mouse).
  function tap(el, fn) {
    on(el, 'click', function (e) {
      e.preventDefault();
      Sound.unlock();
      fn(e);
    });
  }

  var DEFAULT_SETTINGS = {
    sessionMinutes: 7,
    maxChoices: 4,
    skills: { capitals: true, lowercase: true, matching: true, sounds: true,
      words: true, numerals: true, numberwords: true }
  };

  function settings() {
    var s = Store.get('settings', null) || {};
    var out = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
    for (var k in s) if (s.hasOwnProperty(k)) out[k] = s[k];
    return out;
  }

  var current = null;
  function show(name) {
    var screens = document.querySelectorAll('.screen');
    for (var i = 0; i < screens.length; i++) screens[i].className = screens[i].className.replace(/\s*hidden/g, '') + (screens[i].id === name ? '' : ' hidden');
    current = name;
    window.scrollTo(0, 0);
  }

  // ---------- overlays ----------

  var overlayDone = null;
  var overlayTimer = null;

  function overlay(html, sound, done, autoMs) {
    var o = $('overlay');
    o.innerHTML = '<div class="overlay-card pop">' + html + '</div>';
    o.className = 'overlay';
    overlayDone = done;
    if (sound) Sound.playSeq(sound);
    if (overlayTimer) clearTimeout(overlayTimer);
    // Short lock so a tap meant for the game doesn't close it at once.
    o.setAttribute('data-lock', '1');
    setTimeout(function () { o.removeAttribute('data-lock'); }, 900);
    if (autoMs) overlayTimer = setTimeout(closeOverlay, autoMs);
  }

  function closeOverlay() {
    var o = $('overlay');
    if (o.getAttribute('data-lock')) return;
    if (overlayTimer) { clearTimeout(overlayTimer); overlayTimer = null; }
    o.className = 'overlay hidden';
    o.innerHTML = '';
    var d = overlayDone;
    overlayDone = null;
    if (d) d();
  }

  function stickerPopup(id, done) {
    overlay('<div class="burst">' + Art.sticker(id, 'art big-art spin-in') + '</div>' +
      '<div class="tap-hint">' + Art.icon('play', 'icon hint-icon') + '</div>',
      ['sfx_sparkle', 'sticker'], done, 6000);
  }

  function crownPopup(crown, done) {
    overlay('<div class="burst">' + Art.crown(crown.color, crown.gems + 3, 'art big-art spin-in') + '</div>' +
      '<div class="tap-hint">' + Art.icon('home', 'icon hint-icon') + '</div>',
      ['sfx_sparkle', 'crown'], done, 9000);
  }

  // ---------- sparkly background ----------

  function sparkles() {
    var box = $('twinkles');
    var html = '';
    var colors = ['#ffffff', '#ffe36e', '#ffb3de', '#b9f2ff'];
    for (var i = 0; i < 14; i++) {
      var x = Math.round(Math.random() * 96), y = Math.round(Math.random() * 94);
      var s = 10 + Math.round(Math.random() * 16);
      html += '<span class="twinkle" style="left:' + x + '%;top:' + y + '%;width:' + s + 'px;height:' + s +
        'px;animation-delay:' + (Math.random() * 3).toFixed(2) + 's">' +
        '<svg viewBox="0 0 100 100">' + Art.sparkle(50, 50, 48, colors[i % colors.length]) + '</svg></span>';
    }
    box.innerHTML = html;
  }

  // ---------- home ----------

  var greeted = false;

  function goHome() {
    show('home');
    renderHome();
  }

  function renderHome() {
    var r = Rewards.load();
    var n = 0;
    for (var k in r.stickers) if (r.stickers.hasOwnProperty(k)) n++;
    $('homeCount').innerHTML = n ? Art.icon('album', 'icon tiny') + '<b>' + n + '</b>' : '';
  }

  // ---------- game picker ----------

  function showPicker() {
    var skills = settings().skills;
    $('tileSounds').className = 'game-tile sounds-tile' + (skills.sounds === false ? ' hidden' : '');
    $('tileWords').className = 'game-tile words-tile' + (skills.words === false ? ' hidden' : '');
    $('tileNumbers').className = 'game-tile numbers-tile' +
      (skills.numerals === false && skills.numberwords === false ? ' hidden' : '');
    $('tileLetters').className = 'game-tile letters-tile' +
      (skills.capitals === false && skills.lowercase === false && skills.matching === false ? ' hidden' : '');
    show('pick');
    Sound.play('pick_game');
  }

  // ---------- album ----------

  function renderAlbum() {
    var r = Rewards.load();
    var ids = Art.stickerIds();
    var html = '';
    for (var i = 0; i < ids.length; i++) {
      var have = r.stickers[ids[i]];
      html += '<div class="slot' + (have ? ' have' : '') + '" data-id="' + ids[i] + '">' +
        Art.sticker(ids[i]) + (have > 1 ? '<span class="badge">' + have + '</span>' : '') + '</div>';
    }
    $('stickerGrid').innerHTML = html;
    var crowns = r.crowns.slice(-40);
    html = '';
    for (i = crowns.length - 1; i >= 0; i--) {
      html += '<div class="crown-slot">' + Art.crown(crowns[i].color, crowns[i].gems + 3) + '</div>';
    }
    $('crownRow').innerHTML = html || '<div class="crown-slot empty">' + Art.crown(0, 0) + '</div>';
  }

  // ---------- hidden parent entry: press and hold the corner crown ----------

  function setupParentHold() {
    var el = $('parentHold');
    var timer = null;
    function start(e) {
      if (e && e.preventDefault) e.preventDefault();
      if (timer) return;
      el.className = 'parent-hold holding';
      timer = setTimeout(function () {
        timer = null;
        el.className = 'parent-hold';
        Sound.stop();
        root.Parent.open();
      }, 3000);
    }
    function cancel() {
      if (timer) { clearTimeout(timer); timer = null; }
      el.className = 'parent-hold';
    }
    on(el, 'touchstart', start);
    on(el, 'touchend', cancel);
    on(el, 'touchcancel', cancel);
    on(el, 'touchmove', cancel);
    on(el, 'mousedown', start);
    on(el, 'mouseup', cancel);
    on(el, 'mouseleave', cancel);
    on(el, 'contextmenu', function (e) { e.preventDefault(); });
  }

  function init() {
    sparkles();
    $('heroArt').innerHTML = Art.draw('unicorn', 0, 'art hero-art');
    $('parentHold').innerHTML = Art.crown(0, 3, 'art') + '<span class="hold-ring"></span>';
    $('playBtn').innerHTML = Art.icon('play', 'icon');
    $('albumBtn').innerHTML = Art.icon('album', 'icon');
    $('albumHome').innerHTML = Art.icon('home', 'icon');
    $('pickHome').innerHTML = Art.icon('home', 'icon');
    $('tileLetters').innerHTML = '<span class="tile-glyph">Aa</span>' + Art.draw('crown', 0, 'art tile-art');
    $('tileSounds').innerHTML = '<span class="tile-glyph">Ss</span>' + Art.icon('speaker', 'icon tile-art speaker-art');
    $('tileWords').innerHTML = '<span class="tile-glyph tile-word">look</span>' + Art.draw('star', 0, 'art tile-art');
    $('tileNumbers').innerHTML = '<span class="tile-glyph">123</span>' + Art.draw('heart', 1, 'art tile-art');

    tap($('playBtn'), showPicker);
    tap($('pickHome'), goHome);
    tap($('tileLetters'), function () { root.Game.start(root.Games.letters); });
    tap($('tileSounds'), function () { root.Game.start(root.Games.sounds); });
    tap($('tileWords'), function () { root.Game.start(root.Games.words); });
    tap($('tileNumbers'), function () { root.Game.start(root.Games.numbers); });
    tap($('albumBtn'), function () { show('album'); renderAlbum(); Sound.play('album'); });
    tap($('albumHome'), goHome);
    on($('stickerGrid'), 'click', function (e) {
      var t = e.target;
      while (t && t !== this && !(t.className && String(t.className).indexOf('slot') === 0)) t = t.parentNode;
      if (t && t.className && String(t.className).indexOf('have') > 0) {
        Sound.unlock();
        t.className = 'slot have';
        void t.offsetWidth;
        t.className = 'slot have wiggle';
        Sound.effect('sfx_sparkle');
      }
    });
    tap($('overlay'), closeOverlay);
    // First tap anywhere on home unlocks sound and says what to do.
    on($('home'), 'click', function (e) {
      Sound.unlock();
      for (var t = e.target; t && t !== this; t = t.parentNode) if (t.tagName === 'BUTTON') return;
      if (!greeted) { greeted = true; Sound.play('home'); }
    });
    setupParentHold();
    goHome();
    if (!Store.persistent) $('storageWarn').className = 'storage-warn';
  }

  root.App = {
    $: $, on: on, tap: tap, show: show, goHome: goHome, settings: settings,
    DEFAULT_SETTINGS: DEFAULT_SETTINGS, stickerPopup: stickerPopup, crownPopup: crownPopup,
    overlayOpen: function () { return $('overlay').className.indexOf('hidden') < 0; }
  };

  if (document.readyState === 'loading') on(document, 'DOMContentLoaded', init);
  else init();
})(window.HSL = window.HSL || {});
