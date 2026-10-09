/* Plays the generated voice clips. One shared <audio> element, unlocked by
   the first tap (tablets block sound until then). If a clip fails to load
   or play, a timer still moves the game along. */
(function (root) {
  'use strict';
  var el = null;
  var unlocked = false;
  var timer = null;
  var token = 0;
  var lastSeq = null;

  function manifest() { return root.AudioManifest || {}; }

  function ensure() {
    if (!el) {
      el = document.createElement('audio');
      el.preload = 'auto';
      document.body.appendChild(el);
    }
    return el;
  }

  function url(id) {
    var v = root.AudioVersions && root.AudioVersions[id];
    return 'audio/' + id + '.mp3' + (v ? '?v=' + v : '');
  }

  // Call from inside a tap handler.
  function unlock() {
    if (unlocked) return;
    var a = ensure();
    try {
      a.src = url('silence');
      var p = a.play();
      if (p && p.then) p.then(function () { unlocked = true; }, function () {});
      else unlocked = true;
    } catch (e) {}
  }

  function stop() {
    token++;
    if (timer) { clearTimeout(timer); timer = null; }
    if (el) { try { el.pause(); } catch (e) {} }
  }

  // Play ids one after another, then call done.
  function playSeq(ids, done, opts) {
    stop();
    var my = ++token;
    var i = 0;
    var muted = opts && opts.remember === false;
    if (!muted) lastSeq = ids.slice();
    var a = ensure();
    function step() {
      if (my !== token) return;
      if (i >= ids.length) { if (done) done(); return; }
      var id = ids[i++];
      var finished = false;
      function next() {
        if (finished || my !== token) return;
        finished = true;
        if (timer) { clearTimeout(timer); timer = null; }
        a.onended = null; a.onerror = null;
        step();
      }
      var len = manifest()[id] || 1.5;
      timer = setTimeout(next, len * 1000 + 1500);
      a.onended = next;
      a.onerror = function () { setTimeout(next, 200); };
      try {
        a.src = url(id);
        var p = a.play();
        if (p && p['catch']) p['catch'](function () { setTimeout(next, len * 1000); });
      } catch (e) { setTimeout(next, len * 1000); }
    }
    step();
  }

  function play(id, done) { playSeq([id], done); }

  // Short sound effect that doesn't replace the "say it again" phrase.
  function effect(id, done) { playSeq([id], done, { remember: false }); }

  function replay(done) { if (lastSeq) playSeq(lastSeq, done); }

  // Warm the browser cache so the next clip starts quickly.
  var warmed = {};
  function preload(ids) {
    for (var i = 0; i < ids.length; i++) {
      if (warmed[ids[i]]) continue;
      warmed[ids[i]] = 1;
      try {
        var x = new XMLHttpRequest();
        x.open('GET', url(ids[i]), true);
        x.send();
      } catch (e) {}
    }
  }

  function has(id) { return manifest().hasOwnProperty(id); }

  root.Sound = { unlock: unlock, play: play, playSeq: playSeq, effect: effect,
    replay: replay, stop: stop, preload: preload, has: has };
})(window.HSL = window.HSL || {});
