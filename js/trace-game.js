/* Number tracing: trace 11-20 (then 1-10) with a finger, stroke by stroke.
   How much help she gets follows the learning engine:
   new or shaky -> watch a star draw it first, thick path, start dot
   getting there -> thick path, start dot
   known        -> thin dotted path, start dot */
(function (root) {
  'use strict';
  var App = root.App, Art = root.Art, Sound = root.Sound, Store = root.Store,
    Rewards = root.Rewards, Engine = root.Engine, Content = root.Content, Strokes = root.Strokes;

  var KEY = 'tracing';
  var NS = 'http://www.w3.org/2000/svg';
  var engine = null, trial = null, shape = null, level = 0;
  var trackers = [], current = 0;
  var busy = false, demoTimer = null, drawing = false;
  var lastHint = 0, lastProgress = 0, stuckTimer = null;
  var introPlayed = false;
  var svg, layer;

  function el(name, attrs) {
    var e = document.createElementNS(NS, name);
    for (var k in attrs) if (attrs.hasOwnProperty(k)) e.setAttribute(k, attrs[k]);
    return e;
  }

  function pathD(pts) {
    var d = '';
    for (var i = 0; i < pts.length; i++) d += (i ? ' L' : 'M') + pts[i][0].toFixed(1) + ' ' + pts[i][1].toFixed(1);
    return d;
  }

  function save() { Store.set(KEY, engine.state); }

  function renderStars() {
    var n = Rewards.progress(), html = '';
    for (var i = 0; i < Rewards.EVERY; i++) {
      html += '<span class="star-slot' + (i < n ? ' lit' : '') + '"><svg viewBox="0 0 100 100">' +
        Art.sparkle(50, 50, 46, i < n ? '#ffd34d' : '#ffffff') + '</svg></span>';
    }
    App.$('traceStars').innerHTML = html;
  }

  function start() {
    engine = new Engine({ items: Content.traceItems(), state: Store.get(KEY, null), settings: App.settings() });
    engine.startSession(Date.now());
    App.show('trace');
    renderStars();
    var intro = introPlayed ? null : 'intro_trace';
    introPlayed = true;
    nextTrial(intro);
  }

  function stopTimers() {
    if (demoTimer) { clearInterval(demoTimer); demoTimer = null; }
    if (stuckTimer) { clearInterval(stuckTimer); stuckTimer = null; }
  }

  function nextTrial(intro) {
    stopTimers();
    trial = engine.next(Date.now());
    if (!trial) { finish(); return; }
    var box = engine.box(trial.item.id);
    level = box <= 1 ? 0 : (box <= 3 ? 1 : 2);
    shape = Strokes.numberStrokes(trial.item.n);
    trackers = [];
    for (var i = 0; i < shape.strokes.length; i++) {
      trackers.push(new Strokes.Tracker(Strokes.resample(shape.strokes[i], 2), 13));
    }
    current = 0;
    busy = false;
    draw();
    var say = (intro ? [intro] : []).concat(['tracen_' + trial.item.n]);
    if (level === 0) {
      busy = true;
      Sound.playSeq(say.concat(['trace_watch']), function () {
        demo(0, function () {
          busy = false;
          Sound.playSeq(['trace_start']);
          watchStuck();
        }, true);
      });
    } else {
      Sound.playSeq(say.concat(trial.item.n === 11 && level === 1 ? ['trace_start'] : []));
      watchStuck();
    }
  }

  // ---------- drawing ----------

  function draw() {
    var pad = 16;
    svg.setAttribute('viewBox', (-pad) + ' ' + (-pad) + ' ' + (shape.width + 2 * pad) + ' ' + (shape.height + 2 * pad));
    while (layer.firstChild) layer.removeChild(layer.firstChild);
    for (var i = 0; i < shape.strokes.length; i++) {
      var d = pathD(shape.strokes[i]);
      if (level === 2) {
        layer.appendChild(el('path', { d: d, 'class': 'tr-guide-thin' }));
      } else {
        layer.appendChild(el('path', { d: d, 'class': 'tr-guide' }));
        layer.appendChild(el('path', { d: d, 'class': 'tr-center' }));
      }
    }
    for (i = 0; i < shape.strokes.length; i++) {
      layer.appendChild(el('path', { d: '', 'class': 'tr-ink', id: 'trInk' + i }));
    }
    layer.appendChild(el('g', { id: 'trStart' }));
    layer.appendChild(el('g', { id: 'trStar', 'class': 'tr-star hidden' }));
    App.$('trStar').innerHTML = Art.sparkle(0, 0, 9, '#ffd34d');
    drawStart();
  }

  function drawStart() {
    var g = App.$('trStart');
    while (g.firstChild) g.removeChild(g.firstChild);
    if (current >= trackers.length) return;
    var pts = trackers[current].pts;
    var p = pts[trackers[current].i];
    var q = pts[Math.min(pts.length - 1, trackers[current].i + 4)];
    var ang = Math.atan2(q[1] - p[1], q[0] - p[0]) * 180 / Math.PI;
    g.appendChild(el('circle', { cx: p[0], cy: p[1], r: 7.5, 'class': 'tr-dot' }));
    g.appendChild(el('path', { d: 'M6 -5 L14 0 L6 5 Z', 'class': 'tr-arrow',
      transform: 'translate(' + p[0].toFixed(1) + ' ' + p[1].toFixed(1) + ') rotate(' + ang.toFixed(0) + ')' }));
  }

  function drawInk(k) {
    var t = trackers[k];
    App.$('trInk' + k).setAttribute('d', pathD(t.pts.slice(0, t.i + 1)));
  }

  // A star draws stroke k (or, with all, every stroke from k on), then
  // calls done.
  function demo(k, done, all) {
    var star = App.$('trStar');
    star.setAttribute('class', 'tr-star');
    var s = k, j = 0;
    demoTimer = setInterval(function () {
      var pts = trackers[s].pts;
      if (j >= pts.length) {
        s++; j = 0;
        if (s >= trackers.length || !all) {
          clearInterval(demoTimer); demoTimer = null;
          star.setAttribute('class', 'tr-star hidden');
          if (done) done();
          return;
        }
        pts = trackers[s].pts;
      }
      star.setAttribute('transform', 'translate(' + pts[j][0].toFixed(1) + ' ' + pts[j][1].toFixed(1) + ')');
      j += 2;
    }, 30);
  }

  // No progress for a while: show the next stroke again.
  function watchStuck() {
    lastProgress = Date.now();
    if (stuckTimer) clearInterval(stuckTimer);
    stuckTimer = setInterval(function () {
      if (busy || drawing || demoTimer || current >= trackers.length) return;
      if (Date.now() - lastProgress > 9000) {
        lastProgress = Date.now();
        busy = true;
        demo(current, function () { busy = false; });
      }
    }, 1000);
  }

  // ---------- finger ----------

  function toSvg(evt) {
    var t = evt.touches && evt.touches.length ? evt.touches[0] : (evt.changedTouches && evt.changedTouches.length ? evt.changedTouches[0] : evt);
    var pt = svg.createSVGPoint();
    pt.x = t.clientX; pt.y = t.clientY;
    var m = svg.getScreenCTM();
    if (!m) return null;
    var p = pt.matrixTransform(m.inverse());
    return [p.x, p.y];
  }

  function onDown(evt) {
    if (evt.preventDefault) evt.preventDefault();
    Sound.unlock();
    if (busy || !trial) return;
    drawing = true;
    onMove(evt);
  }

  function onMove(evt) {
    if (!drawing || busy || current >= trackers.length) return;
    if (evt.preventDefault) evt.preventDefault();
    var p = toSvg(evt);
    if (!p) return;
    var t = trackers[current];
    var before = t.i;
    var near = t.feed(p[0], p[1]);
    if (t.i !== before) {
      lastProgress = Date.now();
      drawInk(current);
      drawStart();
    }
    if (!near && t.offMoves > 0 && t.offMoves % 25 === 0 && Date.now() - lastHint > 5000) {
      lastHint = Date.now();
      Sound.playSeq(['trace_follow']);
    }
    if (t.done()) {
      t.i = t.pts.length - 1;
      drawInk(current);
      current++;
      if (current >= trackers.length) {
        drawing = false;
        complete();
      } else {
        Sound.effect('sfx_tap');
        drawStart();
      }
    }
  }

  function onUp() {
    drawing = false;
    if (trackers[current]) trackers[current].lift();
  }

  // ---------- finishing ----------

  function complete() {
    busy = true;
    stopTimers();
    var moves = 0, off = 0;
    for (var i = 0; i < trackers.length; i++) { moves += trackers[i].moves; off += trackers[i].offMoves; }
    // Mostly on the path counts as a good first try.
    var good = moves > 0 && off / moves < 0.35;
    App.$('traceBox').className = 'trace-box traced';
    var word = 'word_' + Content.NUMBER_WORDS[trial.item.n - 1];
    var say = ['sfx_chime', word];
    if (good) say.push('praise_' + (1 + Math.floor(Math.random() * 8)));
    Sound.playSeq(say, function () {
      App.$('traceBox').className = 'trace-box';
      engine.answer({ firstTry: good, wrongPicks: [] }, Date.now());
      save();
      var got = Rewards.tick();
      renderStars();
      var after = function () {
        if (engine.session && engine.session.done) finish();
        else nextTrial(null);
      };
      if (got) App.stickerPopup(got, function () { renderStars(); after(); });
      else after();
    });
  }

  function finish() {
    stopTimers();
    var gems = engine.session ? engine.session.newlyMastered.length : 0;
    save();
    trial = null;
    App.crownPopup(Rewards.addCrown(gems), function () { App.goHome(); });
  }

  function quit() {
    stopTimers();
    Sound.stop();
    if (engine) { engine.abandon(Date.now()); save(); }
    trial = null;
    App.goHome();
  }

  function init() {
    svg = App.$('traceSvg');
    layer = el('g', {});
    svg.appendChild(layer);
    App.$('traceHome').innerHTML = Art.icon('home', 'icon');
    App.$('traceSay').innerHTML = Art.icon('speaker', 'icon');
    App.tap(App.$('traceHome'), quit);
    App.tap(App.$('traceSay'), function () {
      if (!trial || busy) return;
      Sound.playSeq(['tracen_' + trial.item.n]);
      // Hearing it again also shows the next stroke again.
      busy = true;
      demo(current, function () { busy = false; });
    });
    // A touch keeps reporting to the element it started on. The start dot
    // under the finger is redrawn as she moves, so moves and lifts are
    // followed on the whole page, not on the drawing.
    App.on(svg, 'touchstart', onDown);
    App.on(document, 'touchmove', onMove);
    App.on(document, 'touchend', onUp);
    App.on(document, 'touchcancel', onUp);
    App.on(svg, 'mousedown', onDown);
    App.on(document, 'mousemove', onMove);
    App.on(document, 'mouseup', onUp);
  }

  root.TraceGame = { start: start, KEY: KEY,
    // For the parent area and tests: what's on screen now.
    now: function () { return trial ? { n: trial.item.n, busy: busy, level: level, stroke: current } : null; } };
  if (document.readyState === 'loading') App.on(document, 'DOMContentLoaded', init);
  else init();
})(window.HSL = window.HSL || {});
