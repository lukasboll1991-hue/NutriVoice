#!/bin/bash
# Mux final picture and mixed sound into the deliverable MP4
set -e
cd "$(dirname "$0")/../out"
ffmpeg -v error -y -i video_noaudio.mp4 -i mix.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 256k -ar 48000 -shortest -movflags +faststart BetriebZukunft_Spot_60s_16x9.mp4
ffprobe -v error -show_entries format=duration,size:stream=codec_name,width,height,r_frame_rate -of compact BetriebZukunft_Spot_60s_16x9.mp4
