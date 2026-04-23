#!/usr/bin/env bash
# process-photos.sh — convertit les photos sources (HEIC/JPEG/PNG) vers des versions web-ready.
#
# Entrée  : photos/source/<slot>.<ext>
#   Le nom de fichier source détermine le slot final côté site.
#   Exemples :
#     photos/source/escalier-01.HEIC       -> photos/escalier-01{,-640,-1024,-1600}.{jpg,webp}
#     photos/source/cheminee-02.jpeg       -> photos/cheminee-02{,-640,-1024,-1600}.{jpg,webp}
#
# Traitement :
#   - auto-orient (respecte l'EXIF iPhone), colorspace sRGB
#   - resize responsive : 640, 1024, 1600 px de large (aucun upscale)
#   - la version de base (sans suffixe de largeur) pointe sur le 1600 pour rétro-compat
#   - strip EXIF / métadonnées GPS
#   - sortie JPG qualité 82 et WebP qualité 75
#
# Idempotent : ne retraite pas si toutes les sorties sont déjà plus récentes que la source.
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
WIDTHS=(640 1024 1600)
JPG_QUALITY=82
WEBP_QUALITY=75

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

# Vérifie si toutes les sorties attendues existent et sont plus récentes que la source.
is_up_to_date() {
  local src="$1"
  local name="$2"
  for w in "${WIDTHS[@]}"; do
    local jpg="$OUT_DIR/${name}-${w}.jpg"
    local webp="$OUT_DIR/${name}-${w}.webp"
    [ -f "$jpg" ] && [ -f "$webp" ] && [ "$jpg" -nt "$src" ] && [ "$webp" -nt "$src" ] || return 1
  done
  # versions "de base" (largeur max, rétro-compat avec l'ancien naming)
  local base_jpg="$OUT_DIR/${name}.jpg"
  local base_webp="$OUT_DIR/${name}.webp"
  [ -f "$base_jpg" ] && [ -f "$base_webp" ] && [ "$base_jpg" -nt "$src" ] && [ "$base_webp" -nt "$src" ] || return 1
  return 0
}

for src in "$SRC_DIR"/*.{heic,jpg,jpeg,png}; do
  [ -f "$src" ] || continue

  base=$(basename "$src")
  name="${base%.*}"

  if is_up_to_date "$src" "$name"; then
    skipped=$((skipped+1))
    continue
  fi

  printf -- "- %s\n" "$base"

  fail_this=0
  for w in "${WIDTHS[@]}"; do
    jpg_out="$OUT_DIR/${name}-${w}.jpg"
    webp_out="$OUT_DIR/${name}-${w}.webp"

    if ! magick "$src" \
         -auto-orient \
         -strip \
         -resize "${w}x>" \
         -colorspace sRGB \
         -quality "$JPG_QUALITY" \
         "$jpg_out" 2>/dev/null; then
      echo "  echec magick (${w}w) sur $base" >&2
      fail_this=1
      break
    fi

    if ! cwebp -quiet -q "$WEBP_QUALITY" -metadata none "$jpg_out" -o "$webp_out"; then
      echo "  echec cwebp (${w}w) sur $base" >&2
      fail_this=1
      break
    fi
  done

  if [ "$fail_this" -ne 0 ]; then
    failed=$((failed+1))
    continue
  fi

  # Alias "de base" = la version la plus grande, pour compatibilité avec les anciens liens.
  largest=${WIDTHS[${#WIDTHS[@]}-1]}
  cp -f "$OUT_DIR/${name}-${largest}.jpg"  "$OUT_DIR/${name}.jpg"
  cp -f "$OUT_DIR/${name}-${largest}.webp" "$OUT_DIR/${name}.webp"

  processed=$((processed+1))
done

echo ""
echo "Resume : $processed traitee(s), $skipped deja a jour, $failed en echec"

if [ "$failed" -gt 0 ]; then
  exit 1
fi
