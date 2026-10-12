/* How each digit is written, stroke by stroke, in the usual school order
   (the open-top 4, a 5 with its hat added last, an 8 that starts like an S).
   Each digit fits a 60 x 100 box, y pointing down. Plain data plus helpers,
   so it runs in Node tests too. ES5. */
(function (root) {
  'use strict';

  // Points along an ellipse from angle a0 to a1 (degrees; 0 = right,
  // 90 = down, so increasing angles go clockwise on screen).
  function arc(cx, cy, rx, ry, a0, a1) {
    var pts = [];
    var steps = Math.max(6, Math.round(Math.abs(a1 - a0) / 10));
    for (var i = 0; i <= steps; i++) {
      var a = (a0 + (a1 - a0) * i / steps) * Math.PI / 180;
      pts.push([cx + rx * Math.cos(a), cy + ry * Math.sin(a)]);
    }
    return pts;
  }

  function join() {
    var out = [];
    for (var i = 0; i < arguments.length; i++) out = out.concat(arguments[i]);
    return out;
  }

  var DIGITS = {
    '0': [arc(30, 50, 23, 44, 270, -90)],
    '1': [[[30, 6], [30, 94]]],
    '2': [join(arc(30, 30, 21, 21, 200, 400), [[8, 94], [54, 94]])],
    '3': [join(arc(28, 27, 20, 20, 205, 450), arc(28, 70, 24, 23, 270, 525))],
    '4': [[[13, 6], [11, 60], [56, 60]], [[43, 6], [43, 94]]],
    '5': [join([[15, 6], [13, 45]], arc(30, 67, 23, 23, 225, 520)), [[15, 6], [50, 6]]],
    '6': [join([[46, 8], [34, 15], [22, 28], [13, 44]], arc(31, 68, 22, 24, 195, -160))],
    '7': [[[8, 6], [52, 6], [22, 94]]],
    '8': [join(arc(30, 26, 18, 19, 330, 90), arc(30, 69, 23, 24, 270, 630), arc(30, 26, 18, 19, 90, -30))],
    '9': [join(arc(31, 29, 19, 21, 0, -360), [[50, 29], [50, 94]])]
  };

  var DIGIT_W = 60, GAP = 14;

  // Strokes for a whole number, digits side by side, in drawing order.
  function numberStrokes(n) {
    var s = String(n), out = [];
    for (var d = 0; d < s.length; d++) {
      var dx = d * (DIGIT_W + GAP);
      var strokes = DIGITS[s.charAt(d)];
      for (var k = 0; k < strokes.length; k++) {
        out.push(strokes[k].map(function (p) { return [p[0] + dx, p[1]]; }));
      }
    }
    return { strokes: out, width: s.length * DIGIT_W + (s.length - 1) * GAP, height: 100 };
  }

  // Evenly spaced points along a stroke, so progress moves at an even pace.
  function resample(pts, step) {
    var out = [pts[0].slice()];
    var carry = 0;
    for (var i = 1; i < pts.length; i++) {
      var ax = pts[i - 1][0], ay = pts[i - 1][1], bx = pts[i][0], by = pts[i][1];
      var len = Math.sqrt((bx - ax) * (bx - ax) + (by - ay) * (by - ay));
      var t = step - carry;
      while (t <= len) {
        out.push([ax + (bx - ax) * t / len, ay + (by - ay) * t / len]);
        t += step;
      }
      carry = len - (t - step);
    }
    var last = pts[pts.length - 1];
    var end = out[out.length - 1];
    if (Math.abs(end[0] - last[0]) + Math.abs(end[1] - last[1]) > 0.5) out.push(last.slice());
    return out;
  }

  // Follows a finger along one stroke. Progress only moves forward, and only
  // when the finger is near the next part of the path, so scribbling or
  // jumping ahead doesn't count. Lifting the finger keeps the progress.
  function Tracker(points, tolerance) {
    this.pts = points;
    this.tol = tolerance;
    this.i = 0;
    this.moves = 0;
    this.offMoves = 0;
  }

  Tracker.prototype.feed = function (x, y) {
    this.moves++;
    var best = -1, bestD = Infinity;
    var look = Math.min(this.pts.length - 1, this.i + 8);
    for (var j = this.i; j <= look; j++) {
      var dx = this.pts[j][0] - x, dy = this.pts[j][1] - y;
      var d = Math.sqrt(dx * dx + dy * dy);
      if (d < bestD) { bestD = d; best = j; }
    }
    if (bestD <= this.tol) {
      // Move forward only on a steady finger: the last touch was on the
      // path too, and close to this one (no jumping around).
      var steady = this.last && Math.abs(this.last[0] - x) + Math.abs(this.last[1] - y) < this.tol * 1.5;
      if (best > this.i && (steady || this.i === 0 && best <= 3)) this.i = best;
      this.last = [x, y];
      return true;
    }
    this.last = null;
    if (bestD > this.tol * 1.6) this.offMoves++;
    return false;
  };

  // The finger was lifted: the next touch starts fresh.
  Tracker.prototype.lift = function () { this.last = null; };

  Tracker.prototype.done = function () { return this.i >= this.pts.length - 2; };
  Tracker.prototype.progress = function () { return this.i / (this.pts.length - 1); };

  var Strokes = { DIGITS: DIGITS, numberStrokes: numberStrokes, resample: resample, Tracker: Tracker };
  root.Strokes = Strokes;
  if (typeof module !== 'undefined' && module.exports) module.exports = Strokes;
})(typeof window !== 'undefined' ? (window.HSL = window.HSL || {}) : {});
