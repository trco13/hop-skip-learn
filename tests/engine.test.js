'use strict';
var test = require('node:test');
var assert = require('node:assert');
var Engine = require('../js/engine.js');
var Content = require('../js/content.js');
var sim = require('./sim.js');

var DAY = 86400000;
var START = Date.UTC(2026, 9, 1, 17, 0, 0); // a weekday afternoon

function makeEngine(seed, state, settings) {
  return new Engine({
    items: Content.letterItems(),
    state: state || null,
    settings: settings || { sessionMinutes: 7, maxChoices: 4 },
    random: sim.rng(seed),
    dayOf: function (ms) { return Math.floor(ms / DAY); }
  });
}

function struggler(seed) {
  var easy = { 'uc:A': 1, 'uc:O': 1, 'uc:X': 1, 'uc:B': 1 };
  return new sim.Child({
    rand: sim.rng(seed),
    learnRate: 0.1,
    forget: 0.03,
    lookAlikePull: 0.6,
    initial: function (it) { return easy[it.id] ? 0.8 : 0.03; }
  });
}

function strongKid(seed) {
  return new sim.Child({
    rand: sim.rng(seed),
    learnRate: 0.35,
    forget: 0.01,
    lookAlikePull: 0.2,
    initial: function (it) { return it.group === 'uc' ? 0.95 : (it.group === 'lc' ? 0.8 : 0.7); }
  });
}

function runDays(engine, child, days, seconds) {
  var all = [];
  for (var d = 0; d < days; d++) {
    var log = sim.playSession(engine, child, START + d * DAY, seconds || 9);
    all.push(log);
    child.sleep();
  }
  return all;
}

function rate(log) {
  var ok = 0;
  log.forEach(function (t) { if (t.ok) ok++; });
  return log.length ? ok / log.length : 1;
}

function masteredCount(engine, group) {
  return Content.letterItems().filter(function (it) {
    return (!group || it.group === group) && engine.isMastered(it.id);
  }).length;
}

// ---------- struggling child ----------

test('struggling child keeps winning most of the time', function () {
  var e = makeEngine(1);
  var logs = runDays(e, struggler(2), 30);
  var rates = logs.map(rate);
  var avg = rates.reduce(function (a, b) { return a + b; }, 0) / rates.length;
  assert.ok(avg >= 0.62, 'average first-try success ' + avg.toFixed(2));
  rates.forEach(function (r, i) { assert.ok(r >= 0.4, 'day ' + i + ' success ' + r.toFixed(2)); });
});

test('struggling child: after a miss comes an easy win from something she knows', function () {
  var e = makeEngine(3);
  var logs = runDays(e, struggler(4), 15);
  var checked = 0, easy = 0;
  logs.forEach(function (log) {
    for (var i = 1; i < log.length; i++) {
      if (!log[i - 1].ok && log[i].boxBefore >= Engine.KNOWN_BOX) easy++;
      if (!log[i - 1].ok) checked++;
    }
  });
  assert.ok(checked > 20, 'enough misses to check: ' + checked);
  assert.ok(easy / checked >= 0.75, 'easy win after miss ' + easy + '/' + checked);
});

test('struggling child: a missed item comes back soon with two choices', function () {
  var e = makeEngine(5);
  var logs = runDays(e, struggler(6), 10);
  var misses = 0, back = 0;
  logs.forEach(function (log) {
    for (var i = 0; i < log.length; i++) {
      if (log[i].ok || log[i].mode === 'easy') continue;
      misses++;
      for (var j = i + 1; j < Math.min(log.length, i + 6); j++) {
        if (log[j].id === log[i].id) {
          if (log[j].n === 2) back++;
          break;
        }
      }
    }
  });
  assert.ok(back / misses >= 0.7, 'retried with 2 choices ' + back + '/' + misses);
});

test('struggling child: rarely misses three in a row', function () {
  var e = makeEngine(7);
  var logs = runDays(e, struggler(8), 30);
  var runs3 = 0, trials = 0;
  logs.forEach(function (log) {
    trials += log.length;
    var run = 0;
    log.forEach(function (t) {
      run = t.ok ? 0 : run + 1;
      if (run === 3) runs3++;
    });
  });
  assert.ok(runs3 / trials < 0.025, 'three-miss streaks ' + runs3 + ' in ' + trials);
});

test('struggling child: sessions end on a success', function () {
  var e = makeEngine(9);
  var logs = runDays(e, struggler(10), 30);
  var endOk = logs.filter(function (log) { return log[log.length - 1].ok; }).length;
  assert.ok(endOk / logs.length >= 0.9, 'ended on success ' + endOk + '/' + logs.length);
});

test('struggling child: still makes real progress in 30 days', function () {
  var e = makeEngine(11);
  runDays(e, struggler(12), 30);
  var m = masteredCount(e);
  var known = Content.letterItems().filter(function (it) { return e.isKnown(it.id); }).length;
  assert.ok(m >= 8, 'mastered ' + m);
  assert.ok(known >= 20, 'known ' + known);
});

test('struggling child: mostly two or three choices while learning', function () {
  var e = makeEngine(13);
  var logs = runDays(e, struggler(14), 5);
  var learning = [], i;
  logs.forEach(function (log) { log.forEach(function (t) { if (t.boxBefore < 2) learning.push(t.n); }); });
  for (i = 0; i < learning.length; i++) assert.ok(learning[i] <= 3);
});

// ---------- strong child ----------

test('strong child moves fast and masters nearly everything', function () {
  var e = makeEngine(21);
  var logs = runDays(e, strongKid(22), 30);
  // A slip on a mastered letter means one more good day to win it back,
  // so a few can be just short of mastered on any given day.
  assert.ok(masteredCount(e, 'uc') >= 23, 'capitals ' + masteredCount(e, 'uc'));
  assert.ok(masteredCount(e) >= 70, 'all skills ' + masteredCount(e));
  Content.letterItems().forEach(function (it) { assert.ok(e.isKnown(it.id), it.id + ' known'); });
  var later = [].concat.apply([], logs.slice(3));
  var avgN = later.reduce(function (a, t) { return a + t.n; }, 0) / later.length;
  assert.ok(avgN >= 3, 'average choices ' + avgN.toFixed(2));
  assert.ok(rate(later) >= 0.85, 'success ' + rate(later).toFixed(2));
});

test('strong child sees new letters quickly on day one', function () {
  var e = makeEngine(23);
  var log = runDays(e, strongKid(24), 1)[0];
  var newOnes = log.filter(function (t) { return t.mode === 'new'; }).length;
  assert.ok(newOnes >= 15, 'introduced ' + newOnes);
});

// ---------- rules ----------

test('mastery needs correct answers on three separate days', function () {
  var e = makeEngine(31, null, { sessionMinutes: 7, maxChoices: 4, skills: { lowercase: false, matching: false } });
  var perfect = new sim.Child({ rand: sim.rng(1), learnRate: 0, initial: function () { return 1; } });
  sim.playSession(e, perfect, START, 6);
  assert.equal(masteredCount(e), 0, 'none after one day');
  sim.playSession(e, perfect, START + DAY, 6);
  assert.equal(masteredCount(e), 0, 'none after two days');
  sim.playSession(e, perfect, START + 2 * DAY, 6);
  sim.playSession(e, perfect, START + 3 * DAY, 6);
  assert.ok(masteredCount(e) > 0, 'some after more days');
});

test('look-alike letters stay apart until both are known', function () {
  var e = makeEngine(41);
  var child = struggler(42);
  var items = {};
  Content.letterItems().forEach(function (it) { items[it.id] = it; });
  for (var d = 0; d < 20; d++) {
    e.startSession(START + d * DAY);
    var now = START + d * DAY;
    for (var k = 0; k < 80; k++) {
      var t = e.next(now);
      if (!t) break;
      var ids = t.choices.map(function (c) { return c.id; });
      (t.item.confusables || []).forEach(function (c) {
        if (ids.indexOf(c) >= 0) {
          assert.ok(e.isKnown(t.item.id) && e.isKnown(c), t.item.id + ' shown with ' + c + ' too early');
        }
      });
      var res = child.respond(t);
      now += 9000;
      e.answer(res, now);
      if (e.session.done) break;
    }
  }
});

test('look-alikes get drilled once ready', function () {
  var e = makeEngine(43);
  var items = {};
  Content.letterItems().forEach(function (it) { items[it.id] = it; });
  var log = [].concat.apply([], runDays(e, strongKid(44), 15));
  var drilled = log.filter(function (t) {
    return items[t.id].confusables.some(function (c) { return t.choices.indexOf(c) >= 0; });
  }).length;
  var bd = log.filter(function (t) {
    return (t.id === 'lc:b' && t.choices.indexOf('lc:d') >= 0) ||
      (t.id === 'lc:d' && t.choices.indexOf('lc:b') >= 0);
  }).length;
  assert.ok(drilled >= 60, 'look-alike drills ' + drilled);
  assert.ok(bd >= 2, 'b and d together ' + bd);
});

test('session length follows the setting and ends cleanly', function () {
  [5, 10].forEach(function (mins) {
    var e = makeEngine(51, null, { sessionMinutes: mins, maxChoices: 4 });
    var log = sim.playSession(e, strongKid(52), START, 8);
    var rec = e.state.sessions[e.state.sessions.length - 1];
    assert.ok(rec.minutes >= mins && rec.minutes <= mins + 1.5, mins + ' min session took ' + rec.minutes);
    assert.ok(log.length > 10);
  });
});

test('max choices setting is respected', function () {
  var e = makeEngine(61, null, { sessionMinutes: 7, maxChoices: 2 });
  var logs = runDays(e, strongKid(62), 3);
  logs.forEach(function (log) { log.forEach(function (t) { assert.equal(t.n, 2); }); });
});

test('skills can be turned off', function () {
  var e = makeEngine(71, null, { sessionMinutes: 7, skills: { capitals: true, lowercase: false, matching: false } });
  var logs = runDays(e, strongKid(72), 3);
  logs.forEach(function (log) { log.forEach(function (t) { assert.ok(t.id.indexOf('uc:') === 0, t.id); }); });
});

test('choices are all from the same group and include the answer once', function () {
  var e = makeEngine(81);
  var logs = runDays(e, strongKid(82), 5);
  logs.forEach(function (log) {
    log.forEach(function (t) {
      assert.equal(t.choices.filter(function (c) { return c === t.id; }).length, 1);
      var g = t.id.split(':')[0];
      t.choices.forEach(function (c) { assert.equal(c.split(':')[0], g); });
      assert.equal(new Set(t.choices).size, t.choices.length);
    });
  });
});

test('progress survives saving and loading', function () {
  var e = makeEngine(91);
  runDays(e, strongKid(92), 2);
  var saved = JSON.parse(JSON.stringify(e.state));
  var e2 = makeEngine(93, saved);
  assert.deepEqual(e2.summary(), e.summary());
  var t = (e2.startSession(START + 3 * DAY), e2.next(START + 3 * DAY));
  assert.ok(t && t.item);
});
