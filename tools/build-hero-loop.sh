#!/bin/zsh
set -e
D="/Users/ndriqim/Desktop/GOOMEE-hero-video-options"
O="$1"
A="$D/Option 1 - With friends.mp4"; B="$D/Option 2 - With boyfriend (Ghent).mp4"; C="$D/Option 3 - On her own (Rome).mp4"
# Loop: clip1[0.5s..] -> clip2 -> clip3 -> clip1[0..0.5s]; 0.5s crossfades, so the last frame meets the first.
# $2 = per-clip filter for clips 1,2,3 (crop/scale), applied before the fades.
build() { # f1 f2 f3 out encoder-args...
  local f1=$1 f2=$2 f3=$3 out=$4; shift 4
  ffmpeg -v error -y -i "$A" -i "$B" -i "$C" -filter_complex "[0:v]${f1},split[a0][a1]; [a0]trim=0.5:5.0,setpts=PTS-STARTPTS[p1]; [a1]trim=0:0.5,setpts=PTS-STARTPTS[p4]; [1:v]trim=0:5.0,setpts=PTS-STARTPTS,${f2}[p2]; [2:v]trim=0:5.0,setpts=PTS-STARTPTS,${f3}[p3]; [p1][p2]xfade=transition=fade:duration=0.5:offset=4.0[x1]; [x1][p3]xfade=transition=fade:duration=0.5:offset=8.5[x2]; [x2][p4]xfade=transition=fade:duration=0.5:offset=13.0,format=yuv420p[v]" \
    -map "[v]" -an -r 24 "$@" -movflags +faststart "$out"
}
DESK="scale=1920:1080:flags=lanczos,setsar=1"
D14="scale=2560:1440:flags=lanczos,setsar=1"
m() { echo "crop=405:1080:$1:0,scale=540:1440:flags=lanczos,setsar=1"; }
build "$DESK" "$DESK" "$DESK" "$O/hero-loop-1080.mp4"        -c:v libx264 -preset slow -crf 28 -profile:v high
build "$D14"  "$D14"  "$D14"  "$O/hero-loop-1440-hevc.mp4"   -c:v libx265 -preset slow -crf 32 -tag:v hvc1 -x265-params log-level=error
build "$(m 530)" "$(m 850)" "$(m 750)" "$O/hero-loop-mobile.mp4"      -c:v libx264 -preset slow -crf 29 -profile:v high
build "$(m 530)" "$(m 850)" "$(m 750)" "$O/hero-loop-mobile-hevc.mp4" -c:v libx265 -preset slow -crf 32 -tag:v hvc1 -x265-params log-level=error
# posters = first frame
ffmpeg -v error -y -i "$O/hero-loop-1080.mp4" -frames:v 1 -q:v 3 "$O/hero-loop-poster.jpg"
ffmpeg -v error -y -i "$O/hero-loop-mobile.mp4" -frames:v 1 -q:v 3 "$O/hero-loop-mobile-poster.jpg"
