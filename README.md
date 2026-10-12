# Hop Skip Learn

Learning games for a pre-K child: letters, sounds, sight words and numbers.
A plain static site (HTML, CSS, ES5 JavaScript) with no build step, made for
older Amazon Fire tablets and hosted on GitHub Pages.

- `index.html`: the games. Hold the crown in the top corner for 3 seconds to open the parent area.
  - Letters: find capital and lowercase letters, and match capitals to lowercase.
  - Letter sounds: hear a sound ("buh"), tap the letter that makes it. Letters that make the
    same sound (c and k) are never offered together.
  - Words: hear "Find the word... look", tap it. The teacher's words (parent area, newest
    first), then color words, number words one to ten, then other common words a few at a
    time. Distractors are about the same length, and words starting with the same letter
    are kept apart until both are known.
  - Numbers: find the numbers 1-20 (1-10 first), then match 1-10 to their words both ways.
  - Tracing: trace 11-20 (the current focus), then 1-10, stroke by stroke in school order
    (`js/strokes.js`). New numbers start with a star drawing it first; known ones get only a
    thin dotted path. Progress only moves along the path in order, so scribbling doesn't count.
  - Each letter sound comes 3 ways (a person's recording, cut from a word, eSpeak);
    the parent picks the best one in "Letter sounds check" and the pick is baked in
    as `SOUND_DEFAULTS` in `js/content.js`. "none" switches that letter to asking with
    a word ("Which letter does ball start with?").
- `device-check.html`: checks sound, fonts, touch and saving on a device.

## Privacy

- Every page has `noindex`, and `robots.txt` disallows crawling. GitHub Pages
  project sites only use the `robots.txt` at the domain root, so the
  `noindex` tag does the real work.
- No analytics, trackers or outside requests. Fonts, art and audio all ship in this repo.
- Progress is stored only in the browser on the device (`localStorage`).
- No names or personal details anywhere in the code.

## How the learning engine works

`js/engine.js` (tests in `tests/engine.test.js`):

- Each item (for example "find capital B") sits in a box from 0 to 5. A box goes up
  after a right answer on the first try. Boxes 4 and 5 each need a different
  day, so "mastered" means right on at least 3 separate days.
- A right answer out of only 2 choices could be a guess, so it can't move an item past box 2.
- After a miss she gets an easy win (something she reliably knows). Then the
  missed item comes back with only 2 choices.
- New or shaky items get 2 or 3 choices. Known items get up to 4.
- New items are added only while she is doing well, and only a few at a time.
- Look-alike letters (b/d, p/q, M/W...) never appear together until she knows
  both. After that they are drilled on purpose.
- Once time is up she gets easy items, and the session ends after a success.
- Mastered items come back for review every few days. A slip means one more
  good day to win the item back.

The tests run a simulated struggling child and a simulated strong child over
30 days of sessions.

## Development

```
npm test                 # engine + site checks (Node 18+)
python3 tools/stamp.py   # after changing js/ or css/: refresh the ?v= stamps in the pages
npx http-server .        # then open http://localhost:8080
```

### Audio

All speech is generated offline with the open-source Kokoro TTS model
(`tools/make_audio.py`). Phrases live in `js/phrases.js`. Running the script
rebuilds only clips whose text changed, and it writes `js/audio-manifest.js`.

## Credits

- Font: Lexend by The Lexend Project Authors, SIL Open Font License (`fonts/LEXEND-OFL.txt`). It draws the simple one-loop "a" and "g" by default.
- Voice: Kokoro-82M (Apache 2.0).
- Letter sound recordings (version 1): the "phonics" project by Neuromancer, MIT License
  (`tools/recorded-sounds/LICENSE.txt`, also `audio/LICENSE-letter-sounds.txt`).
- Version 3 letter sounds: eSpeak NG.
- All artwork is original SVG in `js/art.js`.
