'use strict';
var test = require('node:test');
var assert = require('node:assert');
var Strokes = require('../js/strokes.js');
var Content = require('../js/content.js');
var Engine = require('../js/engine.js');
var sim = require('./sim.js');

function traceAll(n, wobble, rand) {
  var shape = Strokes.numberStrokes(n);
  var trackers = shape.strokes.map(function (s) { return new Strokes.Tracker(Strokes.resample(s, 2), 13); });
  trackers.forEach(function (t) {
    t.pts.forEach(function (p) {
      t.feed(p[0] + (rand() - 0.5) * wobble, p[1] + (rand() - 0.5) * wobble);
    });
  });
  return trackers;
}

test('every digit stays inside its box and has 1 or 2 strokes', function () {
  for (var d = 0; d <= 9; d++) {
    var strokes = Strokes.DIGITS[d];
    assert.ok(strokes.length >= 1 && strokes.length <= 2, 'digit ' + d);
    strokes.forEach(function (s) {
      s.forEach(function (p) {
        assert.ok(p[0] >= 0 && p[0] <= 60 && p[1] >= 0 && p[1] <= 100, 'digit ' + d + ' point ' + p);
      });
    });
  }
});

test('two-digit numbers put the digits side by side, in order', function () {
  var s = Strokes.numberStrokes(14);
  assert.equal(s.strokes.length, 3);           // 1, then the two strokes of 4
  assert.ok(s.strokes[1][0][0] > 60);          // the 4 starts right of the 1
  assert.ok(s.width > 120 && s.width < 150);
});

test('tracing along the path (a little wobbly) finishes every stroke of 1-20', function () {
  var rand = sim.rng(5);
  for (var n = 1; n <= 20; n++) {
    traceAll(n, 10, rand).forEach(function (t, k) { assert.ok(t.done(), n + ' stroke ' + k); });
  }
});

test('scribbling or jumping to the end does not count', function () {
  var shape = Strokes.numberStrokes(7);
  var t = new Strokes.Tracker(Strokes.resample(shape.strokes[0], 2), 13);
  // Tap the end of the stroke straight away.
  var last = t.pts[t.pts.length - 1];
  t.feed(last[0], last[1]);
  assert.ok(!t.done());
  // Scribble all over the box.
  var rand = sim.rng(9);
  for (var i = 0; i < 300; i++) t.feed(rand() * 60, rand() * 100);
  assert.ok(t.progress() < 0.6, 'progress ' + t.progress());
});

test('tracing far off the path is counted, so it is not a first-try success', function () {
  var shape = Strokes.numberStrokes(3);
  var t = new Strokes.Tracker(Strokes.resample(shape.strokes[0], 2), 13);
  t.pts.forEach(function (p, i) {
    if (i % 2) t.feed(p[0], p[1]);
    else t.feed(p[0] + 30, p[1]);   // every other move way off
  });
  assert.ok(t.offMoves / t.moves > 0.35);
});

test('tracing practice starts with 11-20', function () {
  var e = new Engine({ items: Content.traceItems(), settings: { sessionMinutes: 7 }, random: sim.rng(3),
    dayOf: function (ms) { return Math.floor(ms / 86400000); } });
  e.startSession(0);
  var seen = [];
  for (var i = 0; i < 25; i++) {
    var t = e.next(i * 20000);
    if (seen.indexOf(t.item.id) < 0) seen.push(t.item.id);
    e.answer({ firstTry: true, wrongPicks: [] }, i * 20000 + 15000);
    if (e.session.done) break;
  }
  assert.equal(seen[0], 'tr:11');
  // All of 11-20 that came up came before any of 1-10.
  var firstLow = seen.findIndex(function (id) { return +id.split(':')[1] <= 10; });
  var teens = seen.filter(function (id) { return +id.split(':')[1] > 10; }).length;
  assert.ok(firstLow === -1 || firstLow >= Math.min(10, teens), seen.join(' '));
});
