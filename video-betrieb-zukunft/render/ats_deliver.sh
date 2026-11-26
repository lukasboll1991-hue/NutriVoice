#!/bin/bash
# Delivery files for the ATS spot: master picture + mixed sound, 2-pass H.264 at 8 Mbit/s, AAC 256k.
# usage: render/ats_deliver.sh main|pitch <output name>
set -e
S="$1"; NAME="$2"
cd "$(dirname "$0")/../out"
mkdir -p ats
P="ats_pass_${S}"
ffmpeg -v error -y -i ats_${S}_master.mp4 -c:v libx264 -preset medium -b:v 8M -maxrate 12M -bufsize 16M -pass 1 -passlogfile "$P" -pix_fmt yuv420p -an -f mp4 /dev/null
ffmpeg -v error -y -i ats_${S}_master.mp4 -i ats_${S}_mix.wav -map 0:v -map 1:a -c:v libx264 -preset medium -b:v 8M -maxrate 12M -bufsize 16M -pass 2 -passlogfile "$P" \
  -profile:v high -pix_fmt yuv420p -c:a aac -b:a 256k -ar 48000 -shortest -movflags +faststart "ats/$NAME"
ffprobe -v error -show_entries format=duration,size -of compact "ats/$NAME"
