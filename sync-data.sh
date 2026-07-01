#!/usr/bin/env bash
# Kopieert de vier IVT-TSV's van de generator-output naar data/
set -euo pipefail
SRC="$HOME/INFO/karel/werk-inkomen/ivt-en-statuut-analyses/3-oplossingen"
DST="$(dirname "$0")/data"
mkdir -p "$DST"
for f in ivt_schema_gunst.tsv ivt_schema_standaard.tsv ivt_tijdlijn_met_gunst.tsv ivt_tijdlijn_zonder_gunst.tsv; do
  cp "$SRC/$f" "$DST/$f"
  echo "✓ $f"
done
echo "Klaar. ($DST)"
