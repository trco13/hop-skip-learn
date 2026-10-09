"""Letter sounds ("buh", "mmm", "sss") for the sounds game.

Text-to-speech voices say isolated sounds badly, so versions 1 and 2 are cut
out of real words said by the Kokoro voice: the part of the audio that is the
sound is found from the signal itself (hiss, burst, quiet hum), not from
timings. Version 3 is the eSpeak NG synthesizer saying the sound directly:
more robotic, but literal.

Used by make_audio.py for ids "snd_<letter>_<1|2|3>".
"""
import ctypes
import subprocess

import numpy as np

SR = 24000
W = 240     # 10 ms window
HOP = 120   # 5 ms hop

# Version 1 and 2 recipes: (method, carrier word in IPA, setting per version)
STOP = {
    'b': 'bˈʌs', 'd': 'dˈʌk', 'g': 'ɡˈʌm', 'p': 'pˈʌp', 't': 'tˈʌb',
    'k': 'kˈʌp', 'c': 'kˈʌp', 'j': 'dʒˈʌɡ',
}
VOICED_STOP = set('bdgj')
GLIDE = {'w': 'wˈʌn', 'y': 'jˈʌm'}
FINAL = {
    'm': 'hˈʌm', 'n': 'sˈʌn', 'l': 'bˈɛl',
    'f': 'lˈiːf', 's': 'bˈʌs', 'x': 'bˈɑks',
}
HISS = set('fsx')
VOWEL = {'a': 'hˈæt', 'e': 'hˈɛd', 'i': 'hˈɪt', 'o': 'hˈɑt', 'u': 'hˈʌt',
         'r': 'hˈɜː'}   # r as the "er" in her

# Version 3: eSpeak phoneme codes.
ESPEAK = {
    'a': 'a', 'b': 'b@', 'c': 'k@', 'd': 'd@', 'e': 'E', 'f': 'f:', 'g': 'g@',
    'h': 'h@', 'i': 'I', 'j': 'dZ@', 'k': 'k@', 'l': 'l:', 'm': 'm:', 'n': 'n:',
    'o': 'A:', 'p': 'p@', 'q': 'kw@', 'r': '3:', 's': 's:', 't': 't@', 'u': 'V',
    'v': 'v:', 'w': 'w@', 'x': 'ks', 'y': 'j@', 'z': 'z:',
}


def frames(a):
    """Per 5 ms: loudness, spectral centroid, share of energy below 600 Hz."""
    n = max(0, (len(a) - W) // HOP)
    rms = np.zeros(n)
    cen = np.zeros(n)
    low = np.zeros(n)
    fr = np.fft.rfftfreq(W, 1 / SR)
    win = np.hanning(W)
    for i in range(n):
        seg = a[i * HOP:i * HOP + W] * win
        rms[i] = np.sqrt(np.mean(seg ** 2))
        sp = np.abs(np.fft.rfft(seg)) ** 2
        tot = sp.sum() + 1e-12
        cen[i] = (sp * fr).sum() / tot
        low[i] = sp[fr < 600].sum() / tot
    return rms, cen, low


def speech_end(rms):
    on = np.where(rms > 0.03 * rms.max())[0]
    return on[-1] + 1


def cut_stop(a, letter, tail_ms):
    """Start of the consonant plus a little of the vowel: "buh"."""
    rms, cen, low = frames(a)
    peak = rms.max()
    onset = int(np.argmax(rms > 0.03 * peak))
    window = range(onset, min(len(rms), onset + 50))   # first 250 ms
    # Vowel start: loud, with energy above the low hum of a voiced stop.
    v = next((i for i in window if rms[i] > 0.35 * peak and cen[i] < 2300 and low[i] < 0.6), onset + 20)
    burst = next((i for i in range(onset, v) if cen[i] > 2500 and rms[i] > 0.02 * peak), None)
    if letter in VOICED_STOP and letter != 'j':
        # b, d, g: a short bit of the low hum before the release.
        start = (burst if burst is not None else v - 2) - 6
    else:
        # p, t, k, j, q: start at the pop or hiss.
        start = (burst if burst is not None else v - 10) - 1
    start = max(onset, start)
    end = min(len(rms), v + tail_ms // 5)
    return a[start * HOP:end * HOP]


def cut_after_schwa(a, tail_ms):
    """Carrier "uh-C-vowel": the consonant between the two vowels plus a
    little of the second. Starting mid-word avoids the voice's mumbled start."""
    rms, cen, low = frames(a)
    peak = rms.max()
    i = int(np.argmax(rms > 0.3 * peak))
    while i < len(rms) and rms[i] > 0.3 * peak:
        i += 1
    v = next((j for j in range(i + 4, len(rms))
              if rms[j] > 0.35 * peak and cen[j] < 2300 and low[j] < 0.6), i + 20)
    m = i + int(np.argmin(rms[i:v]))
    if rms[m] < 0.03 * peak:
        # Closure silence: start at the release.
        start = next((j for j in range(m, v) if rms[j] > 0.03 * peak), m)
    else:
        start = i + 1
    return a[start * HOP:(v + tail_ms // 5) * HOP]


def buzz(hiss, hum, voicing):
    """z and v: the voice's own z and v come out as s and f, so mix a hiss
    with a low hum, which is what a buzzy z or v is."""
    n = min(len(hiss), len(hum))
    hiss = hiss[:n] / (np.sqrt(np.mean(hiss[:n] ** 2)) + 1e-9)
    hum = hum[:n] / (np.sqrt(np.mean(hum[:n] ** 2)) + 1e-9)
    return (hiss * (1 - voicing) + hum * voicing).astype(np.float32)


def cut_glide(a, tail_ms):
    """w and y: from the start of speech into the vowel: "wuh"."""
    rms, _, _ = frames(a)
    on = np.argmax(rms > 0.03 * rms.max())
    return a[on * HOP:(on + tail_ms // 5) * HOP]


def cut_final(a, letter):
    """Word-final consonant, cut at the end of the vowel."""
    rms, cen, low = frames(a)
    peak = rms.max()
    end = speech_end(rms)
    if letter in HISS:
        # Hiss runs to the end of the word: walk back while it's noisy.
        s = end - 1
        while s > 0 and (cen[s - 1] > 2500 or rms[s - 1] < 0.1 * peak):
            s -= 1
        if letter == 'x':
            s = max(0, s - 12)   # include the k before the s
    else:
        # Hum (m, n, l): low-pitched energy after the vowel.
        e = end - 1
        while e > 0 and low[e] <= 0.85:   # skip the breathy release
            e -= 1
        end = e + 1
        s = e
        while s > 0 and low[s - 1] > 0.85:
            s -= 1
        s += 2   # step past the vowel-to-consonant glide
    # Drop the fade-out at the very end.
    e = end
    while e > s + 4 and rms[e - 1] < 0.25 * np.median(rms[s:end]):
        e -= 1
    return a[s * HOP:e * HOP]


def cut_vowel(a):
    rms, cen, _ = frames(a)
    peak = rms.max()
    loud = np.where((rms > 0.3 * peak) & (cen < 2500))[0]
    s, e = loud[0], loud[-1] - 4   # stop before the next consonant
    return a[s * HOP:max(s + 20, e) * HOP]


def _atempo(a, factor):
    stages = []
    while factor < 0.5:
        stages.append('atempo=0.5')
        factor /= 0.5
    stages.append('atempo=%.4f' % factor)
    out = subprocess.run(
        ['ffmpeg', '-loglevel', 'error', '-f', 'f32le', '-ar', str(SR), '-ac', '1', '-i', 'pipe:0',
         '-af', ','.join(stages), '-f', 'f32le', 'pipe:1'],
        # Padding: atempo holds back its last block at the end of input.
        input=np.concatenate([a, np.zeros(SR, dtype=np.float32)]).astype(np.float32).tobytes(),
        capture_output=True, check=True).stdout
    out = np.frombuffer(out, dtype=np.float32)
    loud = np.where(np.abs(out) > 0.02 * np.abs(out).max())[0]
    return out[:loud[-1] + 1].copy() if len(loud) else out


def stretch(a, target_s):
    """Slow down to about target_s seconds without changing pitch."""
    if len(a) == 0:
        return a
    a = np.asarray(a, dtype=np.float32)
    factor = len(a) / (target_s * SR)   # < 1 means slower
    if factor >= 0.95:
        return a
    out = _atempo(a, factor)
    if len(out) < 0.9 * target_s * SR:
        # atempo comes up short on big slow-downs: correct once.
        out = _atempo(a, factor * len(out) / (target_s * SR))
    return out


def finish(a):
    """Fade in and out, even out loudness."""
    a = np.asarray(a, dtype=np.float32)
    fi, fo = int(0.012 * SR), int(0.05 * SR)
    if len(a) > fi + fo:
        a[:fi] *= np.linspace(0, 1, fi)
        a[-fo:] *= np.linspace(1, 0, fo)
    rms = np.sqrt(np.mean(a ** 2)) + 1e-9
    a = a * (0.1 / rms)
    peak = np.abs(a).max()
    if peak > 0.95:
        a = a * (0.95 / peak)
    return a


class Espeak:
    def __init__(self):
        import espeakng_loader as el
        self.lib = ctypes.cdll.LoadLibrary(el.get_library_path())
        cb_type = ctypes.CFUNCTYPE(ctypes.c_int, ctypes.POINTER(ctypes.c_short), ctypes.c_int, ctypes.c_void_p)
        self.buf = []

        def cb(wav, n, ev):
            if n > 0:
                self.buf.append(np.ctypeslib.as_array(wav, shape=(n,)).copy())
            return 0
        self.cb = cb_type(cb)
        self.sr = self.lib.espeak_Initialize(2, 0, el.get_data_path().encode(), 0)
        self.lib.espeak_SetSynthCallback(self.cb)
        self.lib.espeak_SetVoiceByName(b'en-us+f3')
        self.lib.espeak_SetParameter(1, 110, 0)   # rate
        self.lib.espeak_SetParameter(3, 60, 0)    # pitch

    def say(self, phonemes):
        self.buf = []
        t = ('[[' + phonemes + ']]').encode()
        self.lib.espeak_Synth(t, len(t) + 1, 0, 0, 0, 0x100, None, None)   # espeakPHONEMES
        self.lib.espeak_Synchronize()
        a = np.concatenate(self.buf).astype(np.float32) / 32768
        # Resample to 24 kHz.
        x = np.linspace(0, len(a) - 1, int(len(a) * SR / self.sr))
        a = np.interp(x, np.arange(len(a)), a).astype(np.float32)
        rms, _, _ = frames(a)
        on = np.where(rms > 0.03 * rms.max())[0]
        return a[on[0] * HOP:(on[-1] + 2) * HOP]



_espeak = None


def make(letter, version, kokoro_synth):
    """Return samples at 24 kHz for one letter sound version (1-3).
    kokoro_synth(ipa) -> samples."""
    global _espeak
    if version == 3:
        if _espeak is None:
            _espeak = Espeak()
        a = _espeak.say(ESPEAK[letter])
        if letter in 'flmnsvz':
            a = stretch(a, 0.6)
        return finish(a)
    if letter in STOP:
        a = cut_stop(kokoro_synth(STOP[letter]), letter, 80 if version == 1 else 140)
    elif letter in GLIDE:
        a = cut_glide(kokoro_synth(GLIDE[letter]), 170 if version == 1 else 230)
    elif letter == 'h':
        a = cut_after_schwa(kokoro_synth('əhˈʌt'), 80 if version == 1 else 140)
    elif letter == 'q':
        a = cut_after_schwa(kokoro_synth('əkwˈʌk'), 90 if version == 1 else 150)
    elif letter in 'zv':
        hiss = cut_final(kokoro_synth('bˈʌs' if letter == 'z' else 'lˈiːf'), 's' if letter == 'z' else 'f')
        hum = cut_final(kokoro_synth('hˈʌm' if letter == 'z' else 'hˈʌm'), 'm')
        length = 0.55 if version == 1 else 0.85
        a = buzz(stretch(hiss, length), stretch(hum, length), 0.5 if version == 1 else 0.65)
    elif letter in FINAL:
        carrier = 'fˈɑks' if letter == 'x' and version == 2 else FINAL[letter]
        a = cut_final(kokoro_synth(carrier), letter)
        if letter != 'x':
            a = stretch(a, 0.55 if version == 1 else 0.85)
    else:
        a = cut_vowel(kokoro_synth(VOWEL[letter]))
        if version == 2:
            a = stretch(a, 0.45)
    return finish(a)


def describe(a):
    """Numbers for a quick sanity check of a clip."""
    rms, cen, _ = frames(a)
    loud = rms > 0.2 * rms.max()
    return 'len %.2fs  centroid %.1fk' % (len(a) / SR, np.median(cen[loud]) / 1000 if loud.any() else 0)
