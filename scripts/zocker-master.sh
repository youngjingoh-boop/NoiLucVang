#!/usr/bin/env bash
# Masters public/zocker/mix_raw.wav → public/zocker/mix.wav (limiter + two-pass loudnorm, -14 LUFS / -1.5 dBTP).
set -euo pipefail
cd "$(dirname "$0")/.."
F="alimiter=limit=0.84:attack=5:release=60:level=disabled"
M=$(ffmpeg -v info -i public/zocker/mix_raw.wav -af "$F,loudnorm=I=-14:TP=-1.5:LRA=9:print_format=json" -f null - 2>&1 | sed -n '/^{/,/^}/p')
g() { echo "$M" | grep "\"$1\"" | grep -oE "[-0-9.]+"; }
ffmpeg -v error -y -i public/zocker/mix_raw.wav -af "$F,loudnorm=I=-14:TP=-1.5:LRA=9:measured_I=$(g input_i):measured_TP=$(g input_tp):measured_LRA=$(g input_lra):measured_thresh=$(g input_thresh):offset=$(g target_offset):linear=true,aresample=48000" -c:a pcm_s24le public/zocker/mix.wav
rm public/zocker/mix_raw.wav
