/* Learning engine: picks what to practice next and tracks mastery.

   Ideas it uses:
   - Leitner boxes 0-5. Boxes 1-3 can be earned in one session; boxes 4
     and 5 each need a correct first try on a later day, so "mastered"
     (box 5) means right on at least three separate days.
   - Spaced review: mastered items come back after a few days.
   - After a miss: an easy win (something she knows), then the missed
     item again with only two choices.
   - Fewer choices for new or shaky items, or when she is struggling.
   - New items only while she is doing well, and only a few at a time.
   - Look-alike letters stay apart until she knows both, then get drilled.
   - When time is up, it switches to easy items and ends on a success.

   Pure logic, no DOM. ES5. Runs in the browser and in Node tests. */
(function (root) {
  'use strict';

  var MASTERED_BOX = 5;
  var KNOWN_BOX = 3;
  var DAY_MS = 86400000;
  // Days until a review is due, by box.
  var REVIEW_DAYS = [0, 0, 1, 1, 1, 4];
  var MAINTAIN_DAYS = 7;
  // Trials to wait before asking the same item again in a session, by box.
  var SESSION_GAP = [2, 3, 4, 6, 99, 99];
  var TRIALS_PER_MINUTE = 9;

  function localDay(now) {
    var d = new Date(now);
    return Math.floor((now - d.getTimezoneOffset() * 60000) / DAY_MS);
  }

  function blankItemState() {
    return { box: 0, seen: 0, right: 0, wrong: 0, recent: [], days: [],
      due: 0, boxDay: -1, lastSession: -1 };
  }

  function Engine(config) {
    this.items = config.items;
    this.byId = {};
    for (var i = 0; i < this.items.length; i++) this.byId[this.items[i].id] = this.items[i];
    this.state = config.state || {};
    if (!this.state.items) this.state.items = {};
    if (!this.state.confusions) this.state.confusions = {};
    if (!this.state.sessions) this.state.sessions = [];
    if (!this.state.sessionCount) this.state.sessionCount = 0;
    this.settings = config.settings || {};
    this.random = config.random || Math.random;
    this.dayOf = config.dayOf || localDay;
    this.session = null;
  }

  var P = Engine.prototype;

  P.itemState = function (id) {
    var s = this.state.items[id];
    if (!s) { s = blankItemState(); this.state.items[id] = s; }
    return s;
  };

  P.peekState = function (id) {
    return this.state.items[id] || null;
  };

  P.box = function (id) {
    var s = this.state.items[id];
    return s ? s.box : 0;
  };

  P.isMastered = function (id) { return this.box(id) >= MASTERED_BOX; };
  P.isKnown = function (id) { return this.box(id) >= KNOWN_BOX; };

  // Known and recently reliable: safe for an easy win.
  P.isSolid = function (id) {
    var st = this.state.items[id];
    if (!st || st.box < KNOWN_BOX) return false;
    var r = st.recent, n = Math.min(2, r.length);
    for (var i = r.length - n; i < r.length; i++) if (!r[i]) return false;
    return st.right / st.seen >= 0.7;
  };

  P.enabled = function (item) {
    var skills = this.settings.skills;
    if (skills && skills[item.skill] === false) return false;
    if (item.prereq) {
      for (var i = 0; i < item.prereq.length; i++) {
        if (!this.isKnown(item.prereq[i])) return false;
      }
    }
    return true;
  };

  P.available = function () {
    var out = [];
    for (var i = 0; i < this.items.length; i++) {
      if (this.enabled(this.items[i])) out.push(this.items[i]);
    }
    return out;
  };

  // ---------- session ----------

  P.startSession = function (now) {
    this.state.sessionCount++;
    this.session = {
      num: this.state.sessionCount,
      start: now,
      day: this.dayOf(now),
      trial: 0,
      history: [],      // {id, ok, mode}
      asked: {},        // id -> trial number last asked
      retries: [],      // {id, at}
      retryCount: {},
      sinceIntro: 99,
      ending: false,
      endingTrials: 0,
      done: false,
      newlyMastered: [],
      introduced: []
    };
    return this.session;
  };

  P.recentAccuracy = function (n) {
    var h = this.session.history;
    var start = Math.max(0, h.length - n);
    if (h.length === 0) return 1;
    var ok = 0;
    for (var i = start; i < h.length; i++) if (h[i].ok) ok++;
    return ok / (h.length - start);
  };

  P.lastOutcome = function () {
    var h = this.session.history;
    return h.length ? h[h.length - 1] : null;
  };

  P.recentIds = function (n) {
    var h = this.session.history, out = {};
    for (var i = Math.max(0, h.length - n); i < h.length; i++) out[h[i].id] = 1;
    return out;
  };

  P.missesInLast = function (n) {
    var h = this.session.history, m = 0;
    for (var i = Math.max(0, h.length - n); i < h.length; i++) if (!h[i].ok) m++;
    return m;
  };

  P.sessionMinutes = function () {
    var m = this.settings.sessionMinutes || 7;
    return Math.max(2, Math.min(15, m));
  };

  P.pickRandom = function (list) {
    return list[Math.floor(this.random() * list.length)];
  };

  // Prefer list entries with the highest weight, with a little randomness.
  P.pickWeighted = function (list, weightFn) {
    var total = 0, w = [], i;
    for (i = 0; i < list.length; i++) { w[i] = Math.max(0.0001, weightFn(list[i])); total += w[i]; }
    var r = this.random() * total;
    for (i = 0; i < list.length; i++) { r -= w[i]; if (r <= 0) return list[i]; }
    return list[list.length - 1];
  };

  P.easyPick = function (avail, exclude) {
    var self = this, s = this.session;
    var known = avail.filter(function (it) {
      return self.isSolid(it.id) && !exclude[it.id];
    });
    if (!known.length) return null;
    // Highest box first; prefer ones not asked recently.
    var weight = function (it) {
      var st = self.peekState(it.id);
      var acc = st.seen ? st.right / st.seen : 0;
      var last = s.asked[it.id];
      var fresh = last === undefined ? 3 : Math.min(3, (s.trial - last) / 4);
      return st.box * st.box * acc * acc * acc * Math.min(st.right, 8) * (0.5 + fresh);
    };
    if (this.missesInLast(2) === 2) {
      // Two misses in a row: take the surest thing there is.
      known.sort(function (a, b) { return weight(b) - weight(a); });
      return known[0];
    }
    return this.pickWeighted(known, weight);
  };

  P.choiceCount = function (item, mode) {
    var max = this.settings.maxChoices || 4;
    var box = this.box(item.id);
    var acc = this.recentAccuracy(6);
    var n;
    if (mode === 'retry') n = 2;
    else if (mode === 'new') n = (acc >= 0.85 && this.session.history.length >= 3) ? 3 : 2;
    else if (box <= 1) n = 2;
    else if (box === 2) n = 3;
    else n = 4;
    if (this.missesInLast(3) >= 2 || acc < 0.5) n = 2;
    else if (this.missesInLast(3) === 1) n = Math.min(n, 3);
    if (mode === 'easy') n = Math.min(n, 3);
    n = Math.max(2, Math.min(n, max));
    return n;
  };

  P.pairReady = function (a, b) {
    return this.isKnown(a) && this.isKnown(b);
  };

  P.hasReadyLookAlike = function (item) {
    var conf = item.confusables || [];
    for (var i = 0; i < conf.length; i++) {
      if (this.byId[conf[i]] && this.pairReady(item.id, conf[i])) return true;
    }
    return false;
  };

  P.choicesFor = function (item, n) {
    var self = this;
    var pool = [];
    var avoid = {};
    var drill = [];
    var i, c;
    var conf = item.confusables || [];
    for (i = 0; i < conf.length; i++) {
      c = conf[i];
      if (!this.byId[c]) continue;
      if (this.pairReady(item.id, c)) drill.push(c);
      else avoid[c] = 1;
    }
    // Letters she has actually mixed up with this one, once ready.
    var mix = this.state.confusions[item.id] || {};
    for (c in mix) {
      if (mix.hasOwnProperty(c) && this.byId[c] && drill.indexOf(c) < 0) {
        if (this.pairReady(item.id, c)) drill.push(c);
      }
    }
    for (i = 0; i < this.items.length; i++) {
      var it = this.items[i];
      if (it.group !== item.group || it.id === item.id || avoid[it.id]) continue;
      if (this.settings.skills && this.settings.skills[it.skill] === false) continue;
      pool.push(it.id);
    }
    var chosen = [];
    if (drill.length && n >= 2 && this.random() < 0.7) {
      var d = this.pickRandom(drill);
      chosen.push(d);
    }
    while (chosen.length < n - 1 && pool.length) {
      var idx = Math.floor(this.random() * pool.length);
      var pick = pool.splice(idx, 1)[0];
      if (chosen.indexOf(pick) < 0) chosen.push(pick);
    }
    chosen.push(item.id);
    // Shuffle.
    for (i = chosen.length - 1; i > 0; i--) {
      var j = Math.floor(this.random() * (i + 1));
      var t = chosen[i]; chosen[i] = chosen[j]; chosen[j] = t;
    }
    return chosen.map(function (id) { return self.byId[id]; });
  };

  P.pickRegular = function (avail, today) {
    var self = this, s = this.session;
    var recent = this.recentIds(2);
    var acc = this.recentAccuracy(6);
    var dueLearning = [], dueReview = [], fresh = [], known = [];
    var activeCount = 0;
    for (var i = 0; i < avail.length; i++) {
      var it = avail[i];
      var st = this.peekState(it.id);
      if (!st || st.seen === 0) { fresh.push(it); continue; }
      if (st.box < KNOWN_BOX) activeCount++;
      if (recent[it.id]) continue;
      var last = s.asked[it.id];
      var gapOk = last === undefined || (s.trial - last) >= SESSION_GAP[st.box];
      if (st.box < KNOWN_BOX) { if (gapOk) dueLearning.push(it); }
      else if (st.due <= today && last === undefined) dueReview.push(it);
      else if (gapOk) known.push(it);
    }
    var activeLimit = acc >= 0.85 ? 6 : (acc >= 0.6 ? 4 : 2);
    var canIntro = fresh.length && activeCount < activeLimit && acc >= 0.6 &&
      s.sinceIntro >= (acc >= 0.9 ? 1 : 2) && this.missesInLast(2) === 0;

    // Known items keep her winning; more of them when things get hard.
    var knownShare = acc < 0.6 ? 0.6 : (acc < 0.8 ? 0.4 : 0.15);
    var r = this.random();
    var easyPool = known.concat(dueReview);
    if (easyPool.length && r < knownShare) {
      return { item: this.pickWeighted(easyPool, function (it) {
        var w = dueReview.indexOf(it) >= 0 ? 3 : 1;
        // Extra practice for look-alikes she is ready to sort out.
        if (!self.isMastered(it.id) && self.hasReadyLookAlike(it)) w += 3;
        return w;
      }), mode: 'review' };
    }
    if (dueLearning.length && (!canIntro || this.random() < 0.65)) {
      return { item: this.pickWeighted(dueLearning, function (it) {
        var st = self.peekState(it.id);
        var wait = s.trial - (s.asked[it.id] === undefined ? -10 : s.asked[it.id]);
        return (KNOWN_BOX - st.box) * Math.min(wait, 10);
      }), mode: 'learn' };
    }
    if (canIntro) {
      fresh.sort(function (a, b) { return a.order - b.order; });
      return { item: fresh[0], mode: 'new' };
    }
    if (dueReview.length) return { item: this.pickRandom(dueReview), mode: 'review' };
    if (dueLearning.length) return { item: this.pickRandom(dueLearning), mode: 'learn' };
    if (known.length) return { item: this.pickRandom(known), mode: 'review' };
    if (fresh.length && activeCount === 0) {
      fresh.sort(function (a, b) { return a.order - b.order; });
      return { item: fresh[0], mode: 'new' };
    }
    // Fall back to whatever was seen longest ago, avoiding repeats.
    var seenList = avail.filter(function (it) { return !recent[it.id] && self.peekState(it.id) && self.peekState(it.id).seen; });
    if (!seenList.length) seenList = avail.filter(function (it) { return !recent[it.id]; });
    if (!seenList.length) seenList = avail;
    seenList.sort(function (a, b) {
      var la = s.asked[a.id] === undefined ? -1 : s.asked[a.id];
      var lb = s.asked[b.id] === undefined ? -1 : s.asked[b.id];
      return la - lb;
    });
    var st0 = self.peekState(seenList[0].id);
    return { item: seenList[0], mode: st0 && st0.seen ? 'learn' : 'new' };
  };

  // Returns {item, choices, mode} or null when the session is over.
  P.next = function (now) {
    var s = this.session;
    if (!s || s.done) return null;
    var avail = this.available();
    if (!avail.length) return null;
    var today = this.dayOf(now);
    s.trial++;
    if (!s.ending && (now - s.start >= this.sessionMinutes() * 60000 ||
        s.trial > this.sessionMinutes() * TRIALS_PER_MINUTE)) s.ending = true;
    if (s.ending) s.endingTrials++;

    var last = this.lastOutcome();
    var pick = null, i;

    if (s.ending) {
      var ex = last ? (function () { var o = {}; o[last.id] = 1; return o; })() : {};
      var e = this.easyPick(avail, ex);
      if (e) pick = { item: e, mode: 'easy' };
    } else if (last && !last.ok) {
      // Easy win right after a miss.
      var exc = this.recentIds(1);
      var easy = this.easyPick(avail, exc);
      if (easy) pick = { item: easy, mode: 'easy' };
    }
    if (!pick) {
      for (i = 0; i < s.retries.length; i++) {
        if (s.retries[i].at <= s.trial && this.byId[s.retries[i].id] &&
            this.enabled(this.byId[s.retries[i].id]) && !(last && last.id === s.retries[i].id && avail.length > 1)) {
          pick = { item: this.byId[s.retries.splice(i, 1)[0].id], mode: 'retry' };
          break;
        }
      }
    }
    if (!pick && !s.ending) pick = this.pickRegular(avail, today);
    if (!pick) pick = this.pickRegular(avail, today);

    if (pick.mode === 'new') { s.sinceIntro = 0; s.introduced.push(pick.item.id); }
    else s.sinceIntro++;
    s.asked[pick.item.id] = s.trial;
    var n = this.choiceCount(pick.item, pick.mode);
    var trial = { item: pick.item, mode: pick.mode, choices: this.choicesFor(pick.item, n) };
    s.current = trial;
    return trial;
  };

  // result: {firstTry: bool, wrongPicks: [item ids]}
  P.answer = function (result, now) {
    var s = this.session, t = s.current;
    if (!t) return;
    s.current = null;
    var id = t.item.id;
    var st = this.itemState(id);
    var today = this.dayOf(now);
    var wasNew = st.seen === 0;
    var wasMastered = st.box >= MASTERED_BOX;
    st.seen++;
    st.lastSession = s.num;
    var wrong = result.wrongPicks || [];
    for (var i = 0; i < wrong.length; i++) {
      var m = this.state.confusions[id] || (this.state.confusions[id] = {});
      m[wrong[i]] = (m[wrong[i]] || 0) + 1;
    }
    if (result.firstTry) {
      st.right++;
      // A right answer out of two could be a guess, so it can't make
      // an item "known" (unless the parent capped choices at two).
      var solidEvidence = t.choices.length >= 3 || (this.settings.maxChoices || 4) < 3;
      if (wasNew && t.choices.length >= 3) {
        // She already knew it (not a lucky 50/50 guess): skip ahead.
        st.box = 2;
      } else if (st.box < KNOWN_BOX - 1 || (st.box < KNOWN_BOX && solidEvidence)) {
        st.box++;
      } else if (st.box < MASTERED_BOX && today > st.boxDay) {
        st.box++;
      }
      if (st.box >= KNOWN_BOX && st.boxDay < 0) st.boxDay = today;
      else if (st.box > KNOWN_BOX && today > st.boxDay) st.boxDay = today;
      if (st.days.indexOf(today) < 0) { st.days.push(today); if (st.days.length > 6) st.days.shift(); }
      st.due = today + (st.box >= MASTERED_BOX && wasMastered ? MAINTAIN_DAYS : REVIEW_DAYS[st.box]);
      if (!wasMastered && st.box >= MASTERED_BOX) s.newlyMastered.push(id);
    } else {
      st.wrong++;
      // A slip on a mastered item needs one more good day to win it back.
      if (st.box >= MASTERED_BOX) st.box = MASTERED_BOX - 1;
      else st.box = Math.max(1, st.box - 1);
      st.boxDay = st.box >= KNOWN_BOX ? today : -1;
      st.due = today;
      var rc = s.retryCount[id] || 0;
      if (rc < 2) {
        s.retryCount[id] = rc + 1;
        s.retries.push({ id: id, at: s.trial + 2 });
      }
    }
    st.recent.push(result.firstTry ? 1 : 0);
    if (st.recent.length > 5) st.recent.shift();
    s.history.push({ id: id, ok: !!result.firstTry, mode: t.mode });

    if (s.ending && (result.firstTry || s.endingTrials >= 3)) s.done = true;
    if (s.done) this.finish(now);
  };

  P.finish = function (now) {
    var s = this.session;
    var ok = 0;
    for (var i = 0; i < s.history.length; i++) if (s.history[i].ok) ok++;
    var rec = {
      day: s.day, start: s.start, minutes: Math.round((now - s.start) / 6000) / 10,
      trials: s.history.length, firstTry: ok,
      introduced: s.introduced.length, mastered: s.newlyMastered.slice()
    };
    this.state.sessions.push(rec);
    if (this.state.sessions.length > 120) this.state.sessions.shift();
    s.done = true;
    return rec;
  };

  // End early (she leaves the game). Only logs if she did something.
  P.abandon = function (now) {
    var s = this.session;
    if (s && !s.done && s.history.length) this.finish(now);
    this.session = null;
  };

  P.summary = function () {
    var out = {};
    for (var i = 0; i < this.items.length; i++) {
      var it = this.items[i];
      var g = out[it.skill] || (out[it.skill] = { total: 0, mastered: 0, learning: 0, fresh: 0 });
      g.total++;
      var b = this.box(it.id);
      var st = this.peekState(it.id);
      if (b >= MASTERED_BOX) g.mastered++;
      else if (st && st.seen) g.learning++;
      else g.fresh++;
    }
    return out;
  };

  Engine.MASTERED_BOX = MASTERED_BOX;
  Engine.KNOWN_BOX = KNOWN_BOX;
  Engine.localDay = localDay;

  root.Engine = Engine;
  if (typeof module !== 'undefined' && module.exports) module.exports = Engine;
})(typeof window !== 'undefined' ? (window.HSL = window.HSL || {}) : {});
