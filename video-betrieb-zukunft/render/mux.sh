#!/bin/bash
# Mux picture and mixed sound into the deliverable MP4 (sensible size for upload), plus a thumbnail
set -e
cd "$(dirname "$0")/../out"
ffmpeg -v error -y -i video_noaudio.mp4 -i mix.wav -map 0:v -map 1:a -c:v libx264 -preset slow -crf 19 -tune film -profile:v high -pix_fmt yuv420p \
  -c:a aac -b:a 256k -ar 48000 -shortest -movflags +faststart BetriebZukunft_Spot_60s_16x9.mp4
ffmpeg -v error -y -ss 37.95 -i video_noaudio.mp4 -frames:v 1 -q:v 2 BetriebZukunft_Thumbnail.jpg
ffprobe -v error -show_entries format=duration,size,bit_rate -of compact BetriebZukunft_Spot_60s_16x9.mp4
