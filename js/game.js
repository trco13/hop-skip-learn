/* Shared game screen: hear something, tap the right card. Each game
   (js/games.js) says what to ask and what to say back; the learning
   engine decides what comes next. */
(function (root) {
  'use strict';
  var App = root.App, Art = root.Art, Sound = root.Sound, Store = root.Store,
    Rewards = root.Rewards, Engine = root.Engine;

  var def = null;
  var engine = null;
  var trial = null;
  var wrong = [];
  var busy = false;
  var introPlayed = {};
  var CARD_COLORS = ['c1', 'c2', 'c3', 'c4'];

  function save() { Store.set(def.store, engine.state); }

  function renderStars() {
    var n = Rewards.progress();
    var html = '';
    for (var i = 0; i < Rewards.EVERY; i++) {
      html += '<span class="star-slot' + (i < n ? ' lit' : '') + '"><svg viewBox="0 0 100 100">' +
        Art.sparkle(50, 50, 46, i < n ? '#ffd34d' : '#ffffff') + '</svg></span>';
    }
    App.$('stars').innerHTML = html;
  }

  function start(gameDef) {
    def = gameDef;
    engine = new Engine({
      items: def.items(),
      state: Store.get(def.store, null),
      settings: App.settings()
    });
    engine.startSession(Date.now());
    App.show('game');
    App.$('choices').innerHTML = '';
    App.$('cue').innerHTML = '';
    App.$('cue').className = 'cue empty';
    renderStars();
    busy = false;
    // The first time per visit, explain the game before the first question.
    var intro = introPlayed[def.key] ? null : def.intro;
    introPlayed[def.key] = true;
    nextTrial(intro);
  }

  function nextTrial(intro) {
    trial = engine.next(Date.now());
    if (!trial) { finish(); return; }
    wrong = [];
    busy = false;
    var item = trial.item;
    var cue = App.$('cue');
    var cueHtml = def.cue ? def.cue(item) : null;
    if (cueHtml) {
      cue.innerHTML = '<div class="cue-card pop">' + cueHtml + '</div>';
      cue.className = 'cue';
    } else {
      cue.innerHTML = '';
      cue.className = 'cue empty';
    }
    var html = '';
    for (var i = 0; i < trial.choices.length; i++) {
      var c = trial.choices[i];
      html += '<button class="card ' + CARD_COLORS[i % 4] + (def.cardClass ? ' ' + def.cardClass : '') +
        ' pop" data-id="' + c.id + '" style="animation-delay:' + (i * 0.06) + 's"><span class="glyph">' +
        c.show + '</span></button>';
    }
    var box = App.$('choices');
    box.className = 'choices n' + trial.choices.length;
    box.innerHTML = html;
    Sound.playSeq((intro ? [intro] : []).concat(def.prompt(item)));
    var pre = [];
    for (i = 0; i < trial.choices.length; i++) pre = pre.concat(def.wrongSay(trial.choices[i]));
    Sound.preload(pre.concat(def.rightSay(item, true)));
  }

  function sparkleBurst(card) {
    var s = '';
    for (var i = 0; i < 6; i++) {
      s += '<span class="fly f' + i + '"><svg viewBox="0 0 100 100">' + Art.sparkle(50, 50, 48, i % 2 ? '#ffd34d' : '#fff') + '</svg></span>';
    }
    card.insertAdjacentHTML('beforeend', s);
  }

  function onTap(e) {
    var t = e.target;
    while (t && t.tagName !== 'BUTTON') t = t.parentNode;
    if (!t || !trial || busy) return;
    if (t.disabled || t.className.indexOf('gone') >= 0) return;
    Sound.unlock();
    var id = t.getAttribute('data-id');
    var item = trial.item;
    if (id === item.id) {
      busy = true;
      t.className += ' right';
      sparkleBurst(t);
      var firstTry = wrong.length === 0;
      Sound.playSeq(def.rightSay(item, firstTry), function () { done(firstTry); });
    } else {
      wrong.push(id);
      t.className += ' wrong gone';
      t.disabled = true;
      var say = ['sfx_soft'].concat(def.wrongSay(engine.byId[id]));
      var left = trial.choices.length - wrong.length;
      if (wrong.length >= 2 || left <= 1) {
        // Show the answer so she always finishes on a right tap.
        var cards = App.$('choices').getElementsByTagName('button');
        for (var i = 0; i < cards.length; i++) {
          if (cards[i].getAttribute('data-id') === item.id) cards[i].className += ' glow';
          else if (cards[i].className.indexOf('gone') < 0) { cards[i].className += ' gone'; cards[i].disabled = true; }
        }
        say.push('here');
      } else {
        say.push('try_' + (1 + Math.floor(Math.random() * 3)));
        say = say.concat(def.prompt(item));
      }
      Sound.playSeq(say);
    }
  }

  function done(firstTry) {
    engine.answer({ firstTry: firstTry, wrongPicks: wrong }, Date.now());
    save();
    var got = Rewards.tick();
    renderStars();
    var after = function () {
      if (engine.session && engine.session.done) finish();
      else nextTrial(null);
    };
    if (got) setTimeout(function () { App.stickerPopup(got, function () { renderStars(); after(); }); }, 250);
    else setTimeout(after, 350);
  }

  function finish() {
    var gems = engine.session ? engine.session.newlyMastered.length : 0;
    save();
    trial = null;
    var crown = Rewards.addCrown(gems);
    App.crownPopup(crown, function () { App.goHome(); });
  }

  function quit() {
    Sound.stop();
    if (engine) { engine.abandon(Date.now()); save(); }
    trial = null;
    App.goHome();
  }

  function sayAgain() { if (trial) Sound.playSeq(def.prompt(trial.item)); }

  function init() {
    App.$('homeBtn').innerHTML = Art.icon('home', 'icon');
    App.$('sayBtn').innerHTML = Art.icon('speaker', 'icon');
    App.tap(App.$('homeBtn'), quit);
    App.tap(App.$('sayBtn'), sayAgain);
    App.on(App.$('choices'), 'click', onTap);
    App.tap(App.$('cue'), sayAgain);
  }

  root.Game = { start: start };
  if (document.readyState === 'loading') App.on(document, 'DOMContentLoaded', init);
  else init();
})(window.HSL = window.HSL || {});
