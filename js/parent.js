/* Parent area: progress, teacher's sight words, settings, backup.
   Opened by holding the crown on the home screen for 3 seconds. */
(function (root) {
  'use strict';
  var App = root.App, Store = root.Store, Content = root.Content, Engine = root.Engine,
    Sound = root.Sound, Rewards = root.Rewards;

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  // One engine per game, read-only here.
  var GAMES = [
    { store: 'letters', name: 'Letters', items: Content.letterItems, skills: ['capitals', 'lowercase', 'matching'] },
    { store: 'sounds', name: 'Letter sounds', items: Content.soundItems, skills: ['sounds'] }
  ];

  function engineFor(g) {
    return new Engine({ items: g.items(), state: Store.get(g.store, null), settings: App.settings() });
  }

  function teacherWords() {
    var w = Store.get('teacherWords', null);
    if (!w) {
      w = Content.TEACHER_DEFAULT.map(function (x) { return { w: x, added: Engine.localDay(Date.now()) }; });
      Store.set('teacherWords', w);
    }
    return w;
  }

  function hasVoice(word) {
    return Sound.has(Content.wordAudioId(word));
  }

  function dateOf(day) {
    var d = new Date(day * 86400000);
    return (d.getUTCMonth() + 1) + '/' + d.getUTCDate();
  }

  // ---------- progress ----------

  var SKILL_NAMES = { capitals: 'Capital letters', lowercase: 'Lowercase letters',
    matching: 'Capital to lowercase', sounds: 'Letter sounds' };

  function statusOf(e, id) {
    var st = e.peekState(id);
    if (!st || !st.seen) return 'new';
    if (st.box >= Engine.MASTERED_BOX) return 'mastered';
    if (st.box >= Engine.KNOWN_BOX) return 'known';
    return 'learning';
  }

  function itemLabel(it) {
    if (it.group === 'match') return it.cue + ' to ' + it.show;
    if (it.group === 'uc') return 'capital ' + it.show;
    if (it.group === 'lc') return 'lowercase ' + it.show;
    return 'sound of ' + it.show;
  }

  function tileLabel(it) {
    if (it.group === 'match') return it.cue + it.show;
    return it.show;
  }

  function renderProgress() {
    var html = '';
    var tricky = [];
    var sessions = [];
    GAMES.forEach(function (g) {
      var e = engineFor(g);
      var sum = e.summary();
      var items = g.items();
      // Show sounds in alphabet order, not teaching order.
      items.sort(function (a, b) { return a.show < b.show ? -1 : (a.show > b.show ? 1 : 0); });
      g.skills.forEach(function (skill) {
        var gs = sum[skill];
        html += '<h3>' + SKILL_NAMES[skill] + ' <small>' + gs.mastered + ' of ' + gs.total + ' mastered</small></h3>' +
          '<div class="bar"><span class="m" style="width:' + (100 * gs.mastered / gs.total) + '%"></span>' +
          '<span class="l" style="width:' + (100 * gs.learning / gs.total) + '%"></span></div><div class="tiles">';
        items.forEach(function (it) {
          if (it.skill !== skill) return;
          var st = e.peekState(it.id);
          var tip = st && st.seen ? (st.right + ' right, ' + st.wrong + ' missed') : 'not tried yet';
          html += '<span class="tile ' + statusOf(e, it.id) + '" title="' + esc(tip) + '">' + esc(tileLabel(it)) + '</span>';
        });
        html += '</div>';
      });
      items.forEach(function (it) {
        var st = e.peekState(it.id);
        if (st && st.wrong > 0) tricky.push({ it: it, st: st, e: e });
      });
      (e.state.sessions || []).forEach(function (s) { sessions.push({ s: s, game: g.name }); });
    });
    html += '<p class="legend"><span class="tile new">a</span> not yet <span class="tile learning">a</span> learning ' +
      '<span class="tile known">a</span> knows it (needs more days) <span class="tile mastered">a</span> mastered (right on 3+ days)</p>';

    tricky.sort(function (a, b) { return (b.st.wrong / b.st.seen) - (a.st.wrong / a.st.seen); });
    tricky = tricky.slice(0, 10);
    html += '<h3>Tricky ones</h3>';
    if (!tricky.length) html += '<p>None yet.</p>';
    else {
      html += '<ul class="tricky">';
      tricky.forEach(function (x) {
        var mix = x.e.state.confusions[x.it.id] || {};
        var parts = [];
        for (var k in mix) if (mix.hasOwnProperty(k) && x.e.byId[k]) parts.push(esc(x.e.byId[k].show) + ' (' + mix[k] + 'x)');
        html += '<li><b>' + esc(itemLabel(x.it)) + '</b>: ' + x.st.right + ' right, ' + x.st.wrong + ' missed' +
          (parts.length ? '. Picked instead: ' + parts.join(', ') : '') + '</li>';
      });
      html += '</ul>';
    }

    sessions.sort(function (a, b) { return b.s.start - a.s.start; });
    sessions = sessions.slice(0, 14);
    html += '<h3>Recent sessions</h3>';
    if (!sessions.length) html += '<p>None yet.</p>';
    else {
      html += '<table><tr><th>Day</th><th>Game</th><th>Minutes</th><th>Questions</th><th>Right first try</th><th>Newly mastered</th></tr>';
      sessions.forEach(function (x) {
        var s = x.s;
        html += '<tr><td>' + dateOf(s.day) + '</td><td>' + x.game + '</td><td>' + s.minutes + '</td><td>' + s.trials + '</td><td>' +
          (s.trials ? Math.round(100 * s.firstTry / s.trials) : 0) + '%</td><td>' + s.mastered.length + '</td></tr>';
      });
      html += '</table>';
    }
    var r = Rewards.load();
    var n = 0;
    for (var k in r.stickers) if (r.stickers.hasOwnProperty(k)) n++;
    html += '<p>Stickers collected: ' + n + ' kinds. Crowns: ' + r.crowns.length + '.</p>';
    App.$('pProgress').innerHTML = html;
  }

  // ---------- letter sound picks ----------

  function soundPicks() { return Store.get('soundPicks', null) || {}; }

  function currentPick(l) {
    var p = soundPicks()[l], d = Content.SOUND_DEFAULTS[l];
    if (p !== undefined) return p;
    return d !== undefined ? d : 1;
  }

  function renderSoundPicks() {
    var picks = soundPicks();
    var letters = 'abcdefghijklmnopqrstuvwxyz'.split('');
    var html = '';
    letters.forEach(function (l) {
      html += '<div class="snd-row"><span class="snd-letter">' + l.toUpperCase() + l + '</span>' +
        '<span class="snd-key">like ' + esc(Content.KEYWORDS[l]) + '</span>';
      for (var v = 1; v <= 3; v++) {
        html += '<button class="snd-btn' + (currentPick(l) === v ? ' on' : '') + '" data-l="' + l + '" data-v="' + v + '">' + v + '</button>';
      }
      html += '<button class="snd-btn bad' + (currentPick(l) === 'x' ? ' on' : '') + '" data-l="' + l + '" data-v="x">none</button></div>';
    });
    App.$('pSounds').innerHTML = html;
    var code = letters.map(function (l) { return l + (picks[l] || '-'); }).join(' ');
    App.$('pSoundCode').value = 'Sound picks: ' + code;
  }

  function onSoundPick(e) {
    var t = e.target;
    var l = t.getAttribute && t.getAttribute('data-l');
    if (!l) return;
    var v = t.getAttribute('data-v');
    var picks = soundPicks();
    Sound.unlock();
    if (v === 'x') {
      picks[l] = 'x';
      Sound.play('startq_' + l);
    } else {
      picks[l] = parseInt(v, 10);
      Sound.play('snd_' + l + '_' + v);
    }
    Store.set('soundPicks', picks);
    renderSoundPicks();
  }

  // ---------- sight words ----------

  function renderWords() {
    var words = teacherWords();
    var html = '';
    words.slice().reverse().forEach(function (x) {
      html += '<span class="chip' + (hasVoice(x.w) ? '' : ' novoice') + '" data-w="' + esc(x.w) + '">' +
        '<button class="say" data-w="' + esc(x.w) + '">' + esc(x.w) + '</button>' +
        '<button class="del" data-w="' + esc(x.w) + '" aria-label="remove">x</button></span>';
    });
    App.$('pWordList').innerHTML = html || '<p>No words yet.</p>';
    var missing = words.filter(function (x) { return !hasVoice(x.w); }).map(function (x) { return x.w; });
    App.$('pWordNote').innerHTML = missing.length
      ? 'No voice clip yet for: <b>' + esc(missing.join(', ')) + '</b>. Ask Claude to add them; until then the games skip these words.'
      : 'All words have voice clips. Tap a word to hear it.';
  }

  function addWord() {
    var input = App.$('pWordInput');
    var raw = (input.value || '').toLowerCase().split(/[\s,]+/);
    var words = teacherWords();
    var have = {};
    words.forEach(function (x) { have[x.w] = 1; });
    raw.forEach(function (w) {
      w = w.replace(/[^a-z']/g, '');
      if (w && !have[w]) { words.push({ w: w, added: Engine.localDay(Date.now()) }); have[w] = 1; }
    });
    Store.set('teacherWords', words);
    input.value = '';
    renderWords();
  }

  // ---------- settings ----------

  function renderSettings() {
    var s = App.settings();
    App.$('pMinutes').value = String(s.sessionMinutes);
    App.$('pMinutesOut').innerHTML = s.sessionMinutes + ' minutes';
    App.$('pChoices').value = String(s.maxChoices);
    App.$('pCapitals').checked = s.skills.capitals !== false;
    App.$('pLowercase').checked = s.skills.lowercase !== false;
    App.$('pMatching').checked = s.skills.matching !== false;
    App.$('pSoundsOn').checked = s.skills.sounds !== false;
  }

  function saveSettings() {
    var s = App.settings();
    s.sessionMinutes = parseInt(App.$('pMinutes').value, 10) || 7;
    s.maxChoices = parseInt(App.$('pChoices').value, 10) || 4;
    s.skills = {
      capitals: App.$('pCapitals').checked,
      lowercase: App.$('pLowercase').checked,
      matching: App.$('pMatching').checked,
      sounds: App.$('pSoundsOn').checked
    };
    if (!s.skills.capitals && !s.skills.lowercase && !s.skills.matching && !s.skills.sounds) {
      s.skills.capitals = true;
      App.$('pCapitals').checked = true;
    }
    Store.set('settings', s);
    App.$('pMinutesOut').innerHTML = s.sessionMinutes + ' minutes';
    flash('Saved');
  }

  // ---------- backup ----------

  function exportData() {
    var data = {};
    Store.keys().forEach(function (k) { data[k] = Store.get(k, null); });
    App.$('pData').value = JSON.stringify({ app: 'hop-skip-learn', v: 1, data: data });
    App.$('pData').select();
    flash('Copy the text in the box to keep a backup.');
  }

  function importData() {
    try {
      var obj = JSON.parse(App.$('pData').value);
      if (!obj || obj.app !== 'hop-skip-learn' || !obj.data) throw new Error('bad');
      if (!window.confirm('Replace progress on this device with the backup?')) return;
      for (var k in obj.data) if (obj.data.hasOwnProperty(k)) Store.set(k, obj.data[k]);
      flash('Backup loaded.');
      renderAll();
    } catch (e) {
      flash('That text is not a backup from this game.');
    }
  }

  function resetData() {
    if (!window.confirm('Erase all progress, stickers and crowns on this device?')) return;
    ['letters', 'sounds', 'rewards'].forEach(function (k) { Store.remove(k); });
    flash('Progress erased.');
    renderAll();
  }

  var flashTimer = null;
  function flash(msg) {
    var el = App.$('pFlash');
    el.innerHTML = esc(msg);
    el.className = 'flash';
    if (flashTimer) clearTimeout(flashTimer);
    flashTimer = setTimeout(function () { el.className = 'flash hidden'; }, 3500);
  }

  function renderAll() {
    renderProgress();
    renderWords();
    renderSettings();
    renderSoundPicks();
  }

  function open() {
    App.show('parent');
    renderAll();
  }

  function init() {
    App.tap(App.$('pClose'), function () { App.goHome(); });
    App.tap(App.$('pWordAdd'), addWord);
    App.on(App.$('pWordInput'), 'keydown', function (e) { if (e.keyCode === 13) { e.preventDefault(); addWord(); } });
    App.on(App.$('pWordList'), 'click', function (e) {
      var t = e.target, w = t.getAttribute && t.getAttribute('data-w');
      if (!w) return;
      if (t.className === 'del') {
        Store.set('teacherWords', teacherWords().filter(function (x) { return x.w !== w; }));
        renderWords();
      } else if (hasVoice(w)) {
        Sound.unlock();
        Sound.play(Content.wordAudioId(w));
      }
    });
    App.on(App.$('pSounds'), 'click', onSoundPick);
    ['pMinutes', 'pChoices', 'pCapitals', 'pLowercase', 'pMatching', 'pSoundsOn'].forEach(function (id) {
      App.on(App.$(id), 'change', saveSettings);
    });
    App.on(App.$('pMinutes'), 'input', function () { App.$('pMinutesOut').innerHTML = App.$('pMinutes').value + ' minutes'; });
    App.tap(App.$('pExport'), exportData);
    App.tap(App.$('pImport'), importData);
    App.tap(App.$('pReset'), resetData);
  }

  root.Parent = { open: open, teacherWords: teacherWords };
  if (document.readyState === 'loading') App.on(document, 'DOMContentLoaded', init);
  else init();
})(window.HSL = window.HSL || {});
