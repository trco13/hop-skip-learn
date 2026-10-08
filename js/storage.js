/* Saves progress on this device only (localStorage).
   Falls back to memory if storage is blocked, so the game still runs. */
(function (root) {
  'use strict';
  var PREFIX = 'hsl.';
  var memory = {};
  var ok = false;
  try {
    window.localStorage.setItem(PREFIX + 'probe', '1');
    ok = window.localStorage.getItem(PREFIX + 'probe') === '1';
    window.localStorage.removeItem(PREFIX + 'probe');
  } catch (e) { ok = false; }

  function get(key, fallback) {
    var raw = null;
    try { raw = ok ? window.localStorage.getItem(PREFIX + key) : memory[key]; } catch (e) { raw = memory[key]; }
    if (raw === null || raw === undefined) return fallback;
    try { return JSON.parse(raw); } catch (e2) { return fallback; }
  }

  function set(key, value) {
    var raw = JSON.stringify(value);
    memory[key] = raw;
    if (!ok) return false;
    try { window.localStorage.setItem(PREFIX + key, raw); return true; } catch (e) { return false; }
  }

  function remove(key) {
    delete memory[key];
    try { if (ok) window.localStorage.removeItem(PREFIX + key); } catch (e) {}
  }

  function keys() {
    var out = [], i, k;
    if (ok) {
      try {
        for (i = 0; i < window.localStorage.length; i++) {
          k = window.localStorage.key(i);
          if (k && k.indexOf(PREFIX) === 0) out.push(k.slice(PREFIX.length));
        }
        return out;
      } catch (e) {}
    }
    for (k in memory) if (memory.hasOwnProperty(k)) out.push(k);
    return out;
  }

  root.Store = { get: get, set: set, remove: remove, keys: keys, persistent: ok };
})(window.HSL = window.HSL || {});
