#!/usr/bin/env bash
# process-photos.sh — convertit les photos sources (HEIC/JPEG/PNG) vers des versions web-ready.
#
# Entrée  : photos/source/<slot>.<ext>
#   Le nom de fichier source détermine le slot final côté site.
#   Exemples :
#     photos/source/escalier-01.HEIC       -> photos/escalier-01.{jpg,webp}
#     photos/source/cheminee-02.jpeg       -> photos/cheminee-02.{jpg,webp}
#     photos/source/mobilier-03.jpg        -> photos/mobilier-03.{jpg,webp}
#
# Traitement :
#   - auto-orient (respecte l'EXIF iPhone), colorspace sRGB
#   - resize : max 1600 px de large, aucun upscale
#   - strip EXIF / métadonnées GPS
#   - sortie JPG qualité 85 et WebP qualité 82
#
# Idempotent : ne retraite pas si les sorties sont déjà plus récentes que la source.
#
# Dépendances : imagemagick (magick), libheif, cwebp (paquet `webp`)
#
# Usage : ./scripts/process-photos.sh
#
# Note : le traitement visuel (grayscale + sepia) est appliqué au runtime par la classe
# CSS `.img-treat` — on ne le cuit PAS dans les fichiers pour rester non-destructif.

set -euo pipefail

cd "$(dirname "$0")/.."

SRC_DIR="photos/source"
OUT_DIR="photos"
MAX_WIDTH=1600
JPG_QUALITY=85
WEBP_QUALITY=82

if [ ! -d "$SRC_DIR" ]; then
  mkdir -p "$SRC_DIR"
  echo "Création de $SRC_DIR — placez-y vos sources renommées en <slot>.<ext>"
  echo "(ex : escalier-01.HEIC, cheminee-02.jpeg, mobilier-03.jpg)"
  exit 0
fi

shopt -s nullglob nocaseglob

processed=0
skipped=0
failed=0

for src in "$SRC_DIR"/*.{heic,jpg,jpeg,png}; do
  [ -f "$src" ] || continue

  base=$(basename "$src")
  name="${base%.*}"
  jpg_out="$OUT_DIR/$name.jpg"
  webp_out="$OUT_DIR/$name.webp"

  if [ -f "$jpg_out" ] && [ -f "$webp_out" ] \
     && [ "$jpg_out" -nt "$src" ] && [ "$webp_out" -nt "$src" ]; then
    skipped=$((skipped+1))
    continue
  fi

  printf -- "- %s\n" "$base"

  if ! magick "$src" \
       -auto-orient \
       -strip \
       -resize "${MAX_WIDTH}x>" \
       -colorspace sRGB \
       -quality "$JPG_QUALITY" \
       "$jpg_out" 2>/dev/null; then
    echo "  echec magick sur $base" >&2
    failed=$((failed+1))
    continue
  fi

  if ! cwebp -quiet -q "$WEBP_QUALITY" -metadata none "$jpg_out" -o "$webp_out"; then
    echo "  echec cwebp sur $base" >&2
    failed=$((failed+1))
    continue
  fi

  processed=$((processed+1))
done

echo ""
echo "Resume : $processed traitee(s), $skipped deja a jour, $failed en echec"

if [ "$failed" -gt 0 ]; then
  exit 1
fi
