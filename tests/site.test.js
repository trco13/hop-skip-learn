'use strict';
// Checks on the site files: audio clips exist, privacy rules hold.
var test = require('node:test');
var assert = require('node:assert');
var fs = require('fs');
var path = require('path');
var vm = require('vm');
var Content = require('../js/content.js');
var Phrases = require('../js/phrases.js');

var ROOT = path.join(__dirname, '..');

function manifest() {
  var box = { window: { HSL: {} } };
  vm.runInNewContext(fs.readFileSync(path.join(ROOT, 'js/audio-manifest.js'), 'utf8'), box);
  return box.window.HSL.AudioManifest;
}

function walk(dir, out) {
  fs.readdirSync(dir).forEach(function (name) {
    if (name === '.git' || name === 'node_modules' || name === 'tests' || name === 'audio' || name === 'fonts') return;
    var p = path.join(dir, name);
    if (fs.statSync(p).isDirectory()) walk(p, out);
    else out.push(p);
  });
  return out;
}

test('every phrase has an audio file and a manifest entry', function () {
  var m = manifest();
  Object.keys(Phrases).forEach(function (id) {
    assert.ok(m[id] > 0.2, 'manifest ' + id);
    assert.ok(fs.existsSync(path.join(ROOT, 'audio', id + '.mp3')), 'file ' + id);
  });
});

test('every clip the games can ask for exists', function () {
  var m = manifest();
  var need = ['intro_letters', 'match_prompt', 'here', 'sticker', 'crown', 'album', 'home', 'check',
    'sfx_chime', 'sfx_sparkle', 'sfx_soft', 'silence'];
  for (var i = 1; i <= 8; i++) need.push('praise_' + i);
  for (i = 1; i <= 3; i++) need.push('try_' + i);
  Content.letterItems().forEach(function (it) {
    var L = it.show.toUpperCase();
    need.push('thats_' + L, 'pair_' + L);
    if (it.group === 'uc') need.push('find_uc_' + it.show);
    if (it.group === 'lc') need.push('find_lc_' + it.show);
  });
  need.push('pick_game', 'intro_sounds', 'snd_prompt');
  Content.soundItems().forEach(function (it) {
    for (var v = 1; v <= 3; v++) need.push('snd_' + it.letter + '_' + v);
    need.push('says_' + it.letter.toUpperCase(), 'like_' + it.letter);
  });
  need.forEach(function (id) { assert.ok(m[id], 'missing ' + id); });
});

test('teacher words and the word bank have voices', function () {
  var m = manifest();
  Content.WORD_BANK.forEach(function (w) { assert.ok(m[Content.wordAudioId(w)], w); });
});

test('pages are unlisted and make no outside requests', function () {
  var files = walk(ROOT, []);
  var pages = files.filter(function (f) { return /\.html$/.test(f); });
  assert.ok(pages.length >= 2);
  pages.forEach(function (f) {
    var html = fs.readFileSync(f, 'utf8');
    assert.ok(/<meta name="robots" content="noindex/.test(html), 'noindex in ' + f);
    // Only relative paths: no absolute or protocol-relative src/href.
    assert.ok(!/(src|href)="(https?:)?\/\//.test(html), 'external link in ' + f);
    assert.ok(!/(src|href)="\//.test(html), 'root-absolute path in ' + f);
  });
  files.filter(function (f) { return /\.(js|css|html)$/.test(f); }).forEach(function (f) {
    var text = fs.readFileSync(f, 'utf8');
    // The only URL allowed in shipped code is the SVG namespace.
    var urls = (text.match(/https?:\/\/[^\s'")]+/g) || []).filter(function (u) {
      return u.indexOf('http://www.w3.org/2000/svg') !== 0;
    });
    assert.deepEqual(urls, [], 'URLs in ' + f);
    assert.ok(!/analytics|gtag|googletagmanager|sendBeacon/i.test(text), 'tracking code in ' + f);
  });
  var robots = fs.readFileSync(path.join(ROOT, 'robots.txt'), 'utf8');
  assert.ok(/Disallow: \/\s*$/m.test(robots));
});

test('no emoji in shipped files', function () {
  walk(ROOT, []).filter(function (f) { return /\.(js|css|html)$/.test(f); }).forEach(function (f) {
    var text = fs.readFileSync(f, 'utf8');
    assert.ok(!/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(text), 'emoji in ' + f);
  });
});
