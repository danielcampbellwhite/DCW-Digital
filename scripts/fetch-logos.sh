#!/usr/bin/env bash
#
# Fetch client logos into public/logos/.
#
# Run this from a machine with normal internet access (it will NOT work in a
# locked-down CI/cloud sandbox). For each client it tries, in order:
#   1. Clearbit Logo API (best quality, transparent PNGs)
#   2. Google's favicon service (256px) as a fallback
#
# Review the downloaded files afterwards — automated logos vary in quality,
# and some may need trimming, recolouring or replacing with an official asset.
#
# Usage:  ./scripts/fetch-logos.sh
#
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/public/logos"
mkdir -p "$DIR"

# slug|domain  (domain without protocol)
CLIENTS=(
  "wuth|wuth.nhs.uk"
  "arden-gem|ardengemcsu.nhs.uk"
  "asap-glos|asapglos.nhs.uk"
  "hls-coventry|hlscoventry.org"
  "hls-warwickshire|hlswarwickshire.org"
  "stop-for-life-sandwell|stopforlifesandwell.org"
  "stop-for-life-devon|stopforlifedevon.org"
  "liv-life-liverpool|livlifeliverpool.org"
  "frontline-network|frontlinenetwork.org.uk"
  "smitfc|smitfc.org"
  "bandm-waste|bandmwaste.com"
  "psr-solicitors|psrsolicitors.co.uk"
  "poole-alcock|poolealcock.co.uk"
)

UA="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"

fetch() { # url, out
  curl -fsSL -A "$UA" --max-time 20 "$1" -o "$2" 2>/dev/null
}

for entry in "${CLIENTS[@]}"; do
  slug="${entry%%|*}"
  domain="${entry##*|}"
  out_png="$DIR/$slug.png"

  echo "→ $slug ($domain)"

  if fetch "https://logo.clearbit.com/$domain?size=256&format=png" "$out_png" \
     && [ -s "$out_png" ]; then
    echo "  ✓ Clearbit logo"
    continue
  fi

  if fetch "https://www.google.com/s2/favicons?domain=$domain&sz=256" "$out_png" \
     && [ -s "$out_png" ]; then
    echo "  ✓ favicon fallback (low-res — consider replacing)"
    continue
  fi

  rm -f "$out_png"
  echo "  ✗ could not fetch — wordmark fallback will be used"
done

echo
echo "Done. Review the files in public/logos/, then commit."
