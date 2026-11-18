#!/usr/bin/env bash
# Rasmlarni oldindan tayyorlash (deploydan keyin, serverda, frontend papkasida):
#   bash scripts/warm-images.sh            # yoki fonda:  nohup bash scripts/warm-images.sh >/tmp/warm.log 2>&1 &
#
# Next.js rasm optimizatori har bir rasmning har bir o'lchamini birinchi so'ralganda tayyorlaydi — 2 yadroli
# serverda katta surat ~2 soniya. Shu vaqt bosh sahifada Registon surati o'rnida bo'sh xira fon turardi.
# Skript bosh sahifa suratlarini va yuklangan rasmlarni (a'zolar, yangiliklar…) saytdagi o'lchamlarda,
# AVIF va WebP da bir martadan so'raydi: ular Next.js diskiga va nginx keshiga tushadi, mehmon kutmaydi.
# Navbat bilan, bittadan — sayt ishlab turganda serverni qiynamaydi.
set -u

DOMAIN="${DOMAIN:-sambizsupport.uz}"
# next.config.ts → images.deviceSizes
HERO_SIZES="640 750 828 1080 1200 1600 1920"
# yuklangan rasmlar kartochka va profil sahifalarida shu o'lchamlarda ko'rinadi
MEDIA_SIZES="384 640 750 828 1080 1200"

encode() { python3 -c 'import sys, urllib.parse; print(urllib.parse.quote(sys.argv[1], safe=""))' "$1"; }

# url → har bir o'lcham × ikki format
warm() {
  local path="$1" sizes="$2" enc w accept
  enc=$(encode "$path")
  for w in $sizes; do
    for accept in "image/avif,image/webp,*/*" "image/webp,*/*"; do
      curl -s -o /dev/null --max-time 60 --resolve "$DOMAIN:443:127.0.0.1" -H "Accept: $accept" \
        "https://$DOMAIN/_next/image?url=$enc&w=$w&q=75" || true
    done
  done
}

start=$(date +%s)
count=0
for p in /images/registan/day-v2.webp /images/registan/night-v2.webp; do
  warm "$p" "$HERO_SIZES"
  count=$((count + 1))
done
echo "bosh sahifa suratlari tayyor"

media=$(docker volume inspect mentadbirkor_media -f '{{.Mountpoint}}' 2>/dev/null || true)
if [ -n "$media" ] && [ -d "$media" ]; then
  while IFS= read -r f; do
    warm "/media/${f#"$media"/}" "$MEDIA_SIZES"
    count=$((count + 1))
  done < <(find "$media" -type f \( -iname '*.jpg' -o -iname '*.jpeg' -o -iname '*.png' -o -iname '*.webp' -o -iname '*.avif' \))
fi
echo "Tayyor: $count ta rasm, $(( $(date +%s) - start )) soniya"
