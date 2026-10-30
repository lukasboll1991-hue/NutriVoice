#!/bin/bash
# Mix voice, music and effects: voice chain, music ducked under the voice, loudness -14 LUFS / -1 dBTP
set -e
cd "$(dirname "$0")/../out"
FC="[2:a]aformat=channel_layouts=stereo,highpass=f=85,equalizer=f=250:t=q:w=1.2:g=-2,equalizer=f=3500:t=q:w=1.0:g=2.5,highshelf=f=9000:g=1.5,acompressor=threshold=-24dB:ratio=3:attack=4:release=120:makeup=2,asplit=3[vo][k1][k2];
[0:a]aformat=channel_layouts=stereo,volume=${MUSIC_DB:--7}dB[m];[m][k1]sidechaincompress=threshold=0.02:ratio=5:attack=20:release=380:knee=4[md];
[1:a]aformat=channel_layouts=stereo,volume=${SFX_DB:--4}dB[s];[s][k2]sidechaincompress=threshold=0.06:ratio=2:attack=8:release=200[sd];
[vo][md][sd]amix=inputs=3:normalize=0[mx]"
ffmpeg -v error -y -i music.wav -i sfx.wav -i vo.wav -filter_complex "$FC" -map "[mx]" -c:a pcm_f32le premix.wav
J=$(ffmpeg -hide_banner -i premix.wav -af loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json -f null - 2>&1 | sed -n '/{/,/}/p')
gv() { echo "$J" | python3 -c "import sys,json; print(json.load(sys.stdin)['$1'])"; }
ffmpeg -v error -y -i premix.wav -af "loudnorm=I=-14:TP=-1.5:LRA=11:measured_I=$(gv input_i):measured_TP=$(gv input_tp):measured_LRA=$(gv input_lra):measured_thresh=$(gv input_thresh):offset=$(gv target_offset):linear=true,alimiter=limit=0.89:level=false,aresample=48000" -t 60 -c:a pcm_s24le mix.wav
ffmpeg -hide_banner -i mix.wav -af ebur128=peak=true -f null - 2>&1 | grep -E "^\s+(I|Peak):" | tail -2
