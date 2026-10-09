#!/usr/bin/env bash
# Lists the existing cut points in the source edit, so camera moves and light leaks can land on real cuts.
# Usage: scripts/detect-cuts.sh public/zocker/source.mp4 [threshold=0.3]
set -euo pipefail
ffmpeg -hide_banner -i "$1" -filter:v "select='gt(scene,${2:-0.3})',showinfo" -f null - 2>&1 \
  | grep -o 'pts_time:[0-9.]*' | cut -d: -f2 | awk '{printf "%.2f\n", $1}'
