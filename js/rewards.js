/* Stickers (every few answers) and crowns (end of a session). */
(function (root) {
  'use strict';
  var Store = root.Store, Art = root.Art;
  var KEY = 'rewards';
  var EVERY = 5; // a sticker every 5 finished questions, right or not

  function load() {
    var r = Store.get(KEY, null) || {};
    if (!r.stickers) r.stickers = {};
    if (!r.order) r.order = [];
    if (!r.crowns) r.crowns = [];
    if (!r.progress) r.progress = 0;
    return r;
  }

  function save(r) { Store.set(KEY, r); }

  // Called after each finished question. Returns a new sticker id or null.
  function tick() {
    var r = load();
    r.progress++;
    var got = null;
    if (r.progress >= EVERY) {
      r.progress = 0;
      var all = Art.stickerIds();
      var missing = all.filter(function (id) { return !r.stickers[id]; });
      got = missing.length ? missing[Math.floor(Math.random() * missing.length)]
        : all[Math.floor(Math.random() * all.length)];
      r.stickers[got] = (r.stickers[got] || 0) + 1;
      r.order.push(got);
    }
    save(r);
    return got;
  }

  function progress() { return load().progress; }

  // gems = letters newly mastered this session.
  function addCrown(gems) {
    var r = load();
    var crown = { color: r.crowns.length % Art.PALETTES.length, gems: gems, t: Date.now() };
    r.crowns.push(crown);
    save(r);
    return crown;
  }

  root.Rewards = { load: load, tick: tick, progress: progress, addCrown: addCrown, EVERY: EVERY };
})(window.HSL = window.HSL || {});
