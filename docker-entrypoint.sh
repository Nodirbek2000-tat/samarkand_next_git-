#!/bin/sh
# Pages are prerendered during `docker build`, when the API is not reachable yet.
# As soon as the server answers, expire every content tag so visitors get fresh data from Django.
PORT="${PORT:-3000}"
(
  i=0
  until wget -q -O /dev/null "http://127.0.0.1:${PORT}/kirish" 2>/dev/null; do
    i=$((i + 1)); [ "$i" -ge 90 ] && exit 0; sleep 1
  done
  wget -q -O /dev/null \
    --header="Content-Type: application/json" \
    --header="X-Revalidate-Secret: ${NEXT_REVALIDATE_SECRET}" \
    --post-data='{"tags":["settings","pages","news","films","announcements","galleries","projects","council","forum","partners","search"]}' \
    "http://127.0.0.1:${PORT}/internal/revalidate" && echo "cache: content tags refreshed"
) &

exec node server.js
