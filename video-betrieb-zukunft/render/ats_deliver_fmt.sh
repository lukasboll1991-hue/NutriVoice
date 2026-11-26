#!/bin/bash
# Delivery file from a rendered picture + mixed sound, 2-pass H.264.
# usage: render/ats_deliver_fmt.sh <video.mp4> <mix.wav> <output name> [video bitrate, default 8M] [audio bitrate, default 256k]
set -e
V="$1"; A="$2"; NAME="$3"; VB="${4:-8M}"; AB="${5:-256k}"
cd "$(dirname "$0")/../out"
mkdir -p ats
P="ats_pass_$(basename "$NAME" .mp4)"
ffmpeg -v error -y -i "$V" -c:v libx264 -preset slow -b:v "$VB" -maxrate "$VB" -bufsize "$VB" -pass 1 -passlogfile "$P" -pix_fmt yuv420p -an -f mp4 /dev/null
ffmpeg -v error -y -i "$V" -i "$A" -map 0:v -map 1:a -c:v libx264 -preset slow -b:v "$VB" -maxrate "$VB" -bufsize "$VB" -pass 2 -passlogfile "$P" \
  -profile:v high -pix_fmt yuv420p -c:a aac -b:a "$AB" -ar 48000 -shortest -movflags +faststart "ats/$NAME"
ffprobe -v error -show_entries format=duration,size -of compact "ats/$NAME"
