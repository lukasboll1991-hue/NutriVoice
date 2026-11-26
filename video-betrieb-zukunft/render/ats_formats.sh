#!/bin/bash
# Render the extra formats of the ATS spot (picture only): 4:5 main, 30 s 16:9, 30 s 9:16.
cd "$(dirname "$0")/.."
FMT=45 node render/ats_render.js main out/ats_main_45_video.mp4
FMT=169 node render/ats_render.js cut30 out/ats_cut30_169_video.mp4
FMT=916 node render/ats_render.js cut30 out/ats_cut30_916_video.mp4
echo ALLDONE
