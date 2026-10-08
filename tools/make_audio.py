#!/usr/bin/env python3
"""Generate the game's voice clips and sound effects.

Uses the open-source Kokoro text-to-speech model (kokoro-onnx), run offline.
Only clips whose text changed are rebuilt. Requires ffmpeg.

Setup (once):
    python3 -m venv .venv && .venv/bin/pip install kokoro-onnx soundfile numpy
    Download kokoro-v1.0.onnx and voices-v1.0.bin from
    https://github.com/thewh1teagle/kokoro-onnx/releases (model-files-v1.0)

Run from the repo root:
    .venv/bin/python tools/make_audio.py --models /path/to/model/dir
"""
import argparse
import hashlib
import json
import os
import subprocess
import sys
import tempfile

import numpy as np
import soundfile as sf

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
AUDIO = os.path.join(ROOT, 'audio')
SOURCES = os.path.join(ROOT, 'tools', 'audio-sources.json')
MANIFEST = os.path.join(ROOT, 'js', 'audio-manifest.js')
VOICE = 'af_heart'
SPEED = 0.88
SR = 24000

# Pronunciations to force for single words (IPA, as Kokoro reads it).
WORD_OVERRIDES = {
    'live': 'lˈɪv',
    'the': 'ðˈʌ',
}


def phrases():
    out = subprocess.check_output(
        ['node', '-e', "process.stdout.write(JSON.stringify(require('./js/phrases.js')))"],
        cwd=ROOT)
    return json.loads(out)


def stressed(ipa):
    """Single words read alone need a main stress or they come out mumbled."""
    if 'ˈ' in ipa:
        return ipa
    if 'ˌ' in ipa:
        return ipa.replace('ˌ', 'ˈ', 1)
    vowels = 'aeiouæɑɐɔəɛɜɪʊʌᵻ'
    for i, ch in enumerate(ipa):
        if ch in vowels:
            return ipa[:i] + 'ˈ' + ipa[i:]
    return ipa


def to_mp3(samples, path):
    with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as tmp:
        sf.write(tmp.name, samples, SR)
        wav = tmp.name
    try:
        subprocess.check_call([
            'ffmpeg', '-y', '-loglevel', 'error', '-i', wav,
            '-af', 'silenceremove=start_periods=1:start_threshold=-50dB,'
                   'areverse,silenceremove=start_periods=1:start_threshold=-50dB,areverse,'
                   'adelay=40,apad=pad_dur=0.08,loudnorm=I=-16:TP=-1.5:LRA=11',
            '-ar', str(SR), '-ac', '1', '-b:a', '48k', path])
    finally:
        os.unlink(wav)


def duration(path):
    out = subprocess.check_output([
        'ffprobe', '-v', 'error', '-show_entries', 'format=duration',
        '-of', 'default=noprint_wrappers=1:nokey=1', path])
    return round(float(out), 2)


def tone(freqs, length, decay, start=0.0):
    t = np.arange(int(SR * length)) / SR
    out = np.zeros_like(t)
    for i, f in enumerate(freqs):
        delay = start * i
        env = np.where(t >= delay, np.exp(-(t - delay) * decay), 0)
        out += env * np.sin(2 * np.pi * f * (t - delay)) / len(freqs)
    return (out * 0.8).astype(np.float32)


def sound_effects():
    """Small synthesized sounds: no recordings needed."""
    return {
        'sfx_chime': tone([1318.5, 1568.0, 2093.0], 0.9, 5.0, 0.07),
        'sfx_sparkle': tone([2093.0, 2637.0, 3136.0, 3520.0, 4186.0], 1.3, 4.0, 0.09),
        'sfx_tap': tone([880.0], 0.15, 30.0),
        'sfx_soft': tone([392.0, 330.0], 0.5, 7.0, 0.12),
        'silence': np.zeros(int(SR * 0.25), dtype=np.float32),
    }


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--models', required=True, help='folder with kokoro-v1.0.onnx and voices-v1.0.bin')
    ap.add_argument('--force', action='store_true')
    ap.add_argument('--only', help='comma-separated ids to rebuild')
    args = ap.parse_args()

    from kokoro_onnx import Kokoro
    onnx = os.path.join(args.models, 'kokoro-v1.0.onnx')
    if not os.path.exists(onnx):
        onnx = os.path.join(args.models, 'kokoro.onnx')
    voices = os.path.join(args.models, 'voices-v1.0.bin')
    if not os.path.exists(voices):
        voices = os.path.join(args.models, 'voices.bin')
    kokoro = Kokoro(onnx, voices)

    os.makedirs(AUDIO, exist_ok=True)
    sources = json.load(open(SOURCES)) if os.path.exists(SOURCES) else {}
    only = set(args.only.split(',')) if args.only else None
    todo = phrases()
    durations = {}

    for pid, text in sorted(todo.items()):
        path = os.path.join(AUDIO, pid + '.mp3')
        if pid.startswith('word_'):
            word = text.rstrip('.').lower()
            ipa = WORD_OVERRIDES.get(word) or stressed(kokoro.tokenizer.phonemize(word, 'en-us').strip(' .'))
        else:
            ipa = kokoro.tokenizer.phonemize(text, 'en-us')
        key = hashlib.sha1((VOICE + str(SPEED) + ipa).encode('utf-8')).hexdigest()[:12]
        fresh = os.path.exists(path) and sources.get(pid, {}).get('key') == key
        if args.force or (only and pid in only) or not fresh:
            samples, sr = kokoro.create(ipa, voice=VOICE, speed=SPEED, is_phonemes=True)
            assert sr == SR
            to_mp3(samples, path)
            print('made', pid, '|', text, '|', ipa)
        sources[pid] = {'text': text, 'ipa': ipa, 'key': key}
        durations[pid] = duration(path)

    for pid, samples in sound_effects().items():
        path = os.path.join(AUDIO, pid + '.mp3')
        if not os.path.exists(path) or args.force:
            with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as tmp:
                sf.write(tmp.name, samples, SR)
                subprocess.check_call(['ffmpeg', '-y', '-loglevel', 'error', '-i', tmp.name,
                                       '-ar', str(SR), '-ac', '1', '-b:a', '64k', path])
                os.unlink(tmp.name)
        durations[pid] = duration(path)

    # Remove clips that are no longer used.
    for name in os.listdir(AUDIO):
        if name.endswith('.mp3') and name[:-4] not in durations:
            os.unlink(os.path.join(AUDIO, name))
            sources.pop(name[:-4], None)
    sources = {k: v for k, v in sources.items() if k in durations}

    with open(SOURCES, 'w') as f:
        json.dump(sources, f, indent=1, sort_keys=True, ensure_ascii=False)
        f.write('\n')
    with open(MANIFEST, 'w') as f:
        f.write('/* Generated by tools/make_audio.py: clip lengths in seconds. */\n')
        f.write('(function (root) {\n  root.AudioManifest = ')
        f.write(json.dumps(durations, sort_keys=True, separators=(',', ':')))
        f.write(';\n})(typeof window !== \'undefined\' ? (window.HSL = window.HSL || {}) : {});\n')
    print('clips:', len(durations))


if __name__ == '__main__':
    sys.exit(main())
