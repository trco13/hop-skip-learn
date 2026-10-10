// Browser check for the tracing game with real touch events (a mouse test
// missed a touch-only bug once). Not part of `npm test`; needs Playwright.
//   npx http-server -p 8123 . &
//   node tests/browser/trace-touch.js http://localhost:8123/
'use strict';
var chromium = require('playwright').chromium;

(async function () {
  var base = process.argv[2] || 'http://localhost:8123/';
  var browser = await chromium.launch();
  var ctx = await browser.newContext({ viewport: { width: 800, height: 1280 }, hasTouch: true, isMobile: true });
  var page = await ctx.newPage();
  var errors = [];
  page.on('pageerror', function (e) { errors.push(e.message); });
  var cdp = await ctx.newCDPSession(page);
  await page.goto(base + 'index.html');
  await page.evaluate(function () { localStorage.clear(); });
  await page.tap('#playBtn');
  await page.waitForTimeout(400);
  await page.tap('#tileTrace');
  var results = [];
  for (var round = 0; round < 5; round++) {
    var st = null;
    for (var i = 0; i < 100; i++) {
      st = await page.evaluate(function () { return HSL.TraceGame.now(); });
      if (st && !st.busy) break;
      if (await page.$('#overlay:not(.hidden)')) { await page.waitForTimeout(1000); await page.tap('#overlay'); }
      await page.waitForTimeout(250);
    }
    if (!st) break;
    var strokes = await page.evaluate(function (n) {
      var svg = document.getElementById('traceSvg'), m = svg.getScreenCTM();
      return HSL.Strokes.numberStrokes(n).strokes.map(function (s) {
        return HSL.Strokes.resample(s, 6).map(function (q) {
          var pt = svg.createSVGPoint(); pt.x = q[0]; pt.y = q[1];
          var r = pt.matrixTransform(m); return [r.x, r.y];
        });
      });
    }, st.n);
    for (var k = 0; k < strokes.length; k++) {
      var s = strokes[k];
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: s[0][0], y: s[0][1] }] });
      for (var j = 0; j < s.length; j++) {
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove',
          touchPoints: [{ x: s[j][0] + (Math.random() - 0.5) * 14, y: s[j][1] + (Math.random() - 0.5) * 14 }] });
      }
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      await page.waitForTimeout(150);
    }
    var after = await page.evaluate(function () { return HSL.TraceGame.now(); });
    var ok = after && after.busy;
    results.push(st.n + (ok ? ' traced' : ' NOT finished'));
    if (!ok) { process.exitCode = 1; break; }
    for (i = 0; i < 60; i++) {
      var s2 = await page.evaluate(function () { return HSL.TraceGame.now(); });
      if (!s2 || s2.n !== st.n || !s2.busy) break;
      await page.waitForTimeout(250);
    }
  }
  console.log(results.join(', '));
  if (errors.length) { console.log('page errors:', errors); process.exitCode = 1; }
  await browser.close();
})();
