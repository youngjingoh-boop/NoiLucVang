"""Original music bed + sound effects for the Zocker edit, synthesized from scratch (royalty-free).

Writes public/zocker/music.wav, public/zocker/sfx.wav and the final mix public/zocker/mix.wav
(speech from mastered.wav + ducked music + sfx), length = source + end-card tail.
Usage: python scripts/zocker-sound.py   (needs numpy, scipy, soundfile)
"""
import numpy as np
import soundfile as sf
from scipy.signal import butter, fftconvolve, sosfilt

SR = 48000
ROOT = "public/zocker/"
TOTAL = 109.0667 + 3.6  # source + end-card hold
N = int(TOTAL * SR)
rng = np.random.default_rng(7)

BPM = 90
BEAT = 60 / BPM
BAR = 4 * BEAT


def t_(dur):
    return np.arange(int(dur * SR)) / SR


def mtof(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def lp(x, hz, order=2):
    return sosfilt(butter(order, hz, "low", fs=SR, output="sos"), x)


def hp(x, hz, order=2):
    return sosfilt(butter(order, hz, "high", fs=SR, output="sos"), x)


def bp(x, lo, hi, order=2):
    return sosfilt(butter(order, [lo, hi], "band", fs=SR, output="sos"), x)


def place(buf, sig, at, gain=1.0, pan=0.0):
    """Add a mono or stereo signal into a stereo buffer at time `at` (s)."""
    i = int(at * SR)
    if i >= len(buf):
        return
    if sig.ndim == 1:
        l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
        sig = np.stack([sig * l * 1.414, sig * r * 1.414], 1)
    n = min(len(sig), len(buf) - i)
    buf[i : i + n] += sig[:n] * gain


def reverb(x, seconds=2.2, mix=0.25, seed=1):
    """Stereo plate-ish reverb: convolution with decaying, decorrelated, darkened noise."""
    r = np.random.default_rng(seed)
    n = int(seconds * SR)
    env = np.exp(-np.arange(n) / SR * 6.9 / seconds)
    ir = np.stack([lp(r.standard_normal(n), 6000) * env, lp(r.standard_normal(n), 6000) * env], 1)
    ir /= np.sqrt((ir**2).sum(0, keepdims=True))
    wet = np.stack([fftconvolve(x[:, c], ir[:, c])[: len(x)] for c in range(2)], 1)
    return x * (1 - mix) + wet * mix


# ───────────────────────── instruments ─────────────────────────
def rhodes(m, dur, vel=1.0):
    f = mtof(m)
    t = t_(dur + 1.2)
    parts = [(1, 1.0, 1.6), (2, 0.42, 1.0), (3, 0.12, 0.6), (4, 0.06, 0.4), (7, 0.05, 0.05)]
    s = sum(a * np.sin(2 * np.pi * f * k * t) * np.exp(-t / d) for k, a, d in parts)
    s *= 1 + 0.08 * np.sin(2 * np.pi * 4.2 * t)  # tremolo
    rel = np.clip((dur + 1.2 - t) / 1.2, 0, 1)  # release after note-off
    rel = np.where(t < dur, 1.0, rel)
    att = np.clip(t / 0.004, 0, 1)
    return lp(s * att * rel * vel, 5000)


def piano(m, dur, vel=1.0):
    f = mtof(m)
    t = t_(dur + 1.5)
    s = sum(a * np.sin(2 * np.pi * f * k * 1.0005**k * t) * np.exp(-t * (0.9 + k * 0.5)) for k, a in enumerate([1, 0.5, 0.25, 0.14, 0.08, 0.05], 1))
    hammer = lp(rng.standard_normal(len(t)), 3000) * np.exp(-t / 0.006) * 0.08
    att = np.clip(t / 0.003, 0, 1)
    return lp((s + hammer) * att * vel, 6500)


def pad(ms, dur):
    t = t_(dur)
    s = np.zeros(len(t))
    for m in ms:
        for det in (-0.07, 0.07):
            f = mtof(m) * 2 ** (det / 12)
            s += sum(np.sin(2 * np.pi * f * k * t + k) / k for k in range(1, 7))
    env = np.clip(t / 1.2, 0, 1) * np.clip((dur - t) / 1.2, 0, 1)
    return lp(s * env, 1400) / (len(ms) * 4)


def bass(m, dur):
    f = mtof(m)
    t = t_(dur)
    s = np.sin(2 * np.pi * f * t) + 0.25 * np.sin(4 * np.pi * f * t)
    env = np.clip(t / 0.01, 0, 1) * np.exp(-t / 1.4) * np.clip((dur - t) / 0.08, 0, 1)
    return s * env


def kick():
    t = t_(0.35)
    f = 45 + 75 * np.exp(-t / 0.04)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.16)


def hat(open_=False):
    t = t_(0.25 if open_ else 0.06)
    return hp(rng.standard_normal(len(t)), 7000) * np.exp(-t / (0.09 if open_ else 0.018))


def rim():
    t = t_(0.15)
    return bp(rng.standard_normal(len(t)), 900, 4000) * np.exp(-t / 0.035) * 0.8 + np.sin(2 * np.pi * 330 * t) * np.exp(-t / 0.02) * 0.4


# ───────────────────────── music ─────────────────────────
music = np.zeros((N, 2))

# Part A: warm lo-fi pop (couch). I–iii–IV–sus/V in F.
A = [((53, 57, 60, 64), 41), ((57, 60, 64, 67), 45), ((58, 62, 65, 69), 46), ((55, 60, 65, 67), 48)]
# Part B: tender (court + VO). vi9–IV–I/3–Vsus2.
B = [((53, 57, 60, 64), 38), ((58, 62, 65, 69), 46), ((53, 57, 60, 64), 45), ((55, 60, 62, 67), 48)]

COMEDY_OUT, COMEDY_IN = 6.05, 10.15  # music drops for "You betrayed me" and returns on "good time"
A_END = 76.6  # cut to court: hand over to Part B
B_START = 76.0

bar_t = 0.0
i = 0
while bar_t < A_END:
    chord, root = A[i % 4]
    in_gap = COMEDY_OUT - BAR < bar_t < COMEDY_IN
    if not (COMEDY_OUT <= bar_t < COMEDY_IN):
        stabs = [(0, 1.4), (1.5, 0.4), (2.5, 1.3)]
        for beat, dur in stabs:
            at = bar_t + beat * BEAT
            if COMEDY_OUT <= at < COMEDY_IN or at >= A_END:
                continue
            v = 0.9 if beat == 0 else 0.6
            for j, m in enumerate(chord):
                place(music, rhodes(m, dur * BEAT, v), at + j * 0.006, 0.11, pan=(j - 1.5) * 0.25)
        if bar_t + BAR <= COMEDY_OUT or bar_t >= COMEDY_IN:
            place(music, bass(root, BAR * 0.95), bar_t, 0.22)
        # drums: gentle, no kick in the first bar so the hook breathes; lighter during the court insert
        insert = 36.9 <= bar_t < 41.2
        for b in range(8):
            at = bar_t + b * BEAT / 2
            if COMEDY_OUT <= at < COMEDY_IN or at >= A_END:
                continue
            if b in (0, 5) and bar_t >= BAR and not insert:
                place(music, kick(), at, 0.30)
            if b in (2, 6):
                place(music, rim(), at, 0.05, pan=0.2)
            place(music, hat(b == 7), at + 0.012 * (b % 2), 0.035 if b % 2 else 0.022, pan=-0.35)
    bar_t += BAR
    i += 1

# swell back in after the comedic pause
place(music, pad(A[0][0], 2.6), COMEDY_IN - 0.4, 0.5)

# Part B: piano arpeggios + pad + sub, half-time feel; swells toward the end card.
bar_t = B_START
i = 0
END_CHORD_AT = 108.7
while bar_t < END_CHORD_AT - 0.01:
    chord, root = B[i % 4]
    dur = min(BAR, END_CHORD_AT - bar_t)
    lift = 1.0 + 0.35 * np.clip((bar_t - 96) / 12, 0, 1)  # gentle build into the last line
    place(music, pad(chord, dur + 0.6), bar_t, 0.55 * lift)
    place(music, bass(root - 12 if root > 40 else root, dur), bar_t, 0.18)
    arp = [chord[0], chord[1], chord[2], chord[3], chord[2] + 12, chord[3], chord[2], chord[1]]
    for k, m in enumerate(arp):
        at = bar_t + k * BEAT / 2
        if at < END_CHORD_AT:
            place(music, piano(m, BEAT * 0.9, 0.7 if k % 2 else 0.9), at, 0.075 * lift, pan=(k % 4 - 1.5) * 0.3)
    bar_t += BAR
    i += 1

# Final chord rings under the end card.
fin = (53, 57, 60, 64, 67)
for j, m in enumerate(fin):
    place(music, piano(m, 3.2, 0.9), END_CHORD_AT + j * 0.03, 0.085, pan=(j - 2) * 0.25)
place(music, pad(fin, 4.0), END_CHORD_AT, 0.6)
place(music, bass(29, 3.5), END_CHORD_AT, 0.2)

# Crossfade A → B around the court cut, and fade the very end.
fade_a = np.clip((A_END - np.arange(N) / SR) / 0.9, 0, 1)
music = reverb(music, 1.8, 0.22)
music[: int(A_END * SR)] *= fade_a[: int(A_END * SR), None] ** 0.5
tail = np.clip((TOTAL - np.arange(N) / SR) / 2.5, 0, 1)
music *= tail[:, None]


# ───────────────────────── sfx ─────────────────────────
sfx = np.zeros((N, 2))


def whoosh(dur=1.4, lo=300, hi=5000):
    t = t_(dur)
    noise = rng.standard_normal(len(t))
    out = np.zeros(len(t))
    # sweeping band-pass in chunks
    seg = 1024
    for s0 in range(0, len(t), seg):
        p = s0 / len(t)
        c = lo * (hi / lo) ** np.sin(np.pi * p) if p < 1 else lo
        out[s0 : s0 + seg] = bp(noise[s0 : s0 + seg], max(c * 0.6, 40), min(c * 1.4, SR / 2 - 100), 1)
    env = np.sin(np.pi * np.clip(t / dur, 0, 1)) ** 2
    return out * env


def pop(f=900):
    t = t_(0.12)
    return np.sin(2 * np.pi * (f + 600 * np.exp(-t / 0.01)) * t) * np.exp(-t / 0.03)


def bell(f, dur=1.6):
    t = t_(dur)
    return sum(a * np.sin(2 * np.pi * f * k * t) * np.exp(-t * (2 + k)) for k, a in [(1, 1), (2.76, 0.4), (5.4, 0.2), (8.9, 0.1)])


def impact():
    t = t_(1.2)
    sub = np.sin(2 * np.pi * np.cumsum(38 + 50 * np.exp(-t / 0.08)) / SR) * np.exp(-t / 0.45)
    air = hp(rng.standard_normal(len(t)), 2500) * np.exp(-t / 0.25) * 0.15
    return sub + air


# Hook: soft cinematic impact on frame 0 + shimmer as the light sweeps the title.
place(sfx, impact(), 0.0, 0.55)
for k, f in enumerate([2093, 2637, 3136, 4186]):
    place(sfx, bell(f, 1.2), 0.35 + k * 0.09, 0.03, pan=-0.4 + k * 0.27)

# Whooshes on the light-leak bridges (peak lands on the cut).
for cut in [13.23, 36.93, 41.23, 60.33, 77.13]:
    place(sfx, whoosh(1.5), cut - 0.75, 0.07, pan=0.0)

# Gift box items pop in as she names them.
for k, at in enumerate([20.6, 21.35, 21.9, 22.6]):
    place(sfx, pop(800 + k * 120), at - 0.2, 0.10, pan=-0.5)

# 339 counter: a quickening tick-roll that settles with a soft ding.
ticks = 24.4 + 2.0 * (1 - (1 - np.linspace(0, 1, 18)) ** 2.2)
for at in ticks:
    place(sfx, pop(2400), at, 0.025, pan=-0.6)
place(sfx, bell(1568, 1.4), 26.4, 0.06, pan=-0.6)

# Ticket: paper swish in from the right.
place(sfx, whoosh(0.7, 1500, 9000), 29.4, 0.05, pan=0.6)

# Lotus: delicate shimmer as it draws.
for k, f in enumerate([1760, 2217, 2637, 3520, 4435]):
    place(sfx, bell(f, 2.0), 65.0 + k * 0.28, 0.025, pan=0.5)

# End card: warm chime.
for k, f in enumerate([1397, 1760, 2093]):
    place(sfx, bell(f, 3.0), 108.8 + k * 0.12, 0.05, pan=(k - 1) * 0.3)

sfx = reverb(sfx, 1.4, 0.3, seed=3)

# ───────────────────────── mix ─────────────────────────
speech, sr = sf.read(ROOT + "mastered.wav", always_2d=True)
assert sr == SR
vo = np.zeros((N, 2))
vo[: min(N, len(speech))] = speech[:N]

# Sidechain-style ducking: follow the speech envelope (fast attack, slow release).
mono = np.abs(vo).mean(1)
env = lp(mono, 8)
thr = np.percentile(env[env > 1e-5], 35)
duck_db = -6.0 * np.clip((env - thr) / (thr * 2), 0, 1)
gain = 10 ** (lp(duck_db, 3) / 20)  # smooth the gain itself (~release)
# Music sits a touch higher in the VO section (emotional bed) and in the end card.
sec = np.arange(N) / SR
bed = np.where(sec >= 86.0, 1.35, 1.0) * np.where(sec >= 108.7, 2.2, 1.0)
music_ducked = music * (gain * bed)[:, None]

sf.write(ROOT + "music.wav", music.astype(np.float32), SR, subtype="FLOAT")
sf.write(ROOT + "sfx.wav", sfx.astype(np.float32), SR, subtype="FLOAT")

M_LEVEL, S_LEVEL = 0.25, 0.45  # music ≈ -28 LUFS unducked, sfx peaks ≈ -10 dBFS (measured)
mix = vo + music_ducked * M_LEVEL + sfx * S_LEVEL
sf.write(ROOT + "mix_raw.wav", mix.astype(np.float32), SR, subtype="FLOAT")
print("ok", mix.shape, "peak", float(np.abs(mix).max()))
