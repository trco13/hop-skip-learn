// Simulated children for engine tests.
'use strict';

function rng(seed) {
  // mulberry32
  return function () {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    var t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

// know: id -> probability she truly knows it.
// When she doesn't know it she guesses, and look-alikes pull her guess.
function Child(opts) {
  this.rand = opts.rand;
  this.know = {};
  this.learnRate = opts.learnRate;
  this.forget = opts.forget || 0;
  this.initial = opts.initial; // fn(item) -> prob
  this.lookAlikePull = opts.lookAlikePull || 0;
}

Child.prototype.k = function (item) {
  if (!(item.id in this.know)) this.know[item.id] = this.initial(item);
  return this.know[item.id];
};

Child.prototype.respond = function (trial) {
  var item = trial.item;
  var wrongPicks = [];
  var remaining = trial.choices.slice();
  var firstTry;
  if (this.rand() < this.k(item)) {
    // She might still confuse a look-alike she hasn't fully sorted out.
    var la = remaining.filter(function (c) { return (item.confusables || []).indexOf(c.id) >= 0; });
    if (la.length && this.rand() < this.lookAlikePull * (1 - this.k(item))) {
      wrongPicks.push(la[0].id);
      firstTry = false;
    } else {
      firstTry = true;
    }
  } else {
    // Guess. Up to two wrong taps, then the app shows the answer.
    for (var tries = 0; tries < 2; tries++) {
      var g = remaining[Math.floor(this.rand() * remaining.length)];
      if (g.id === item.id) break;
      wrongPicks.push(g.id);
      remaining = remaining.filter(function (c) { return c.id !== g.id; });
    }
    firstTry = wrongPicks.length === 0;
  }
  // Feedback teaches a little every time she sees the answer.
  var k = this.k(item);
  this.know[item.id] = k + this.learnRate * (1 - k) * (firstTry ? 0.6 : 1);
  return { firstTry: firstTry, wrongPicks: wrongPicks };
};

Child.prototype.sleep = function () {
  for (var id in this.know) this.know[id] *= (1 - this.forget);
};

// Runs one session. Returns trial log.
function playSession(engine, child, startMs, secondsPerTrial) {
  var now = startMs;
  var log = [];
  engine.startSession(now);
  var guard = 0;
  while (guard++ < 200) {
    var t = engine.next(now);
    if (!t) break;
    var res = child.respond(t);
    now += (secondsPerTrial + (res.firstTry ? 0 : 4)) * 1000;
    var before = engine.box(t.item.id);
    engine.answer(res, now);
    log.push({ id: t.item.id, mode: t.mode, n: t.choices.length,
      choices: t.choices.map(function (c) { return c.id; }),
      ok: res.firstTry, boxBefore: before });
    if (engine.session.done) break;
  }
  return log;
}

module.exports = { rng: rng, Child: Child, playSession: playSession };
