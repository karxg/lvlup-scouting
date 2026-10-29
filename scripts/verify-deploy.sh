#!/usr/bin/env bash
# Post-deploy smoke test. Usage: bash scripts/verify-deploy.sh https://kfarrag.com
# Checks that the main site still works, the app and deep links load, casing
# redirects work and no referenced asset 404s.
set -uo pipefail
ORIGIN="${1:-https://kfarrag.com}"
fail=0

check() { # name, expected status, url, [expected Location]
  local name="$1" want="$2" url="$3" loc="${4:-}"
  local out code location
  out=$(curl -s -o /dev/null -w '%{http_code} %{redirect_url}' --max-time 20 "$url")
  code="${out%% *}"; location="${out#* }"
  if [[ "$code" != "$want" ]] || [[ -n "$loc" && "$location" != "$loc" ]]; then
    echo "FAIL  $name: got $code $location (wanted $want $loc)"; fail=1
  else
    echo "ok    $name ($code${loc:+ → $location})"
  fi
}

# The rest of kfarrag.com must be untouched.
root_code=$(curl -s -o /dev/null -w '%{http_code}' -L --max-time 20 "$ORIGIN/")
if [[ "$root_code" =~ ^2 ]]; then echo "ok    main site root ($root_code)"; else echo "FAIL  main site root: $root_code"; fail=1; fi

check "app"                200 "$ORIGIN/lvlup/"
check "funds page"         200 "$ORIGIN/lvlup/funds"
check "shared deep link"   200 "$ORIGIN/lvlup/?lang=ar&a=1.01.3.1.3.1.2.4"
check "funds deep link"    200 "$ORIGIN/lvlup/funds?lang=ar"
check "trailing slash"     301 "$ORIGIN/lvlup"        "$ORIGIN/lvlup/"
check "casing /LvlUp"      301 "$ORIGIN/LvlUp"        "$ORIGIN/lvlup/"
check "casing /LVLUP/funds" 301 "$ORIGIN/LVLUP/funds" "$ORIGIN/lvlup/funds"
check "og image"           200 "$ORIGIN/lvlup/og.png"
check "favicon"            200 "$ORIGIN/lvlup/favicon.svg"

# Every asset referenced by the HTML must load.
html=$(curl -s --max-time 20 "$ORIGIN/lvlup/")
assets=$(grep -oE '/lvlup/[^"'"'"' )]+\.(js|css|svg|png|woff2)' <<<"$html" | sort -u)
for a in $assets; do check "asset $a" 200 "$ORIGIN$a"; done
# CSS-referenced fonts.
for css in $(grep -E '\.css$' <<<"$assets"); do
  for f in $(curl -s "$ORIGIN$css" | grep -oE '/lvlup/assets/[^)]+\.woff2' | sort -u | head -20); do check "font $f" 200 "$ORIGIN$f"; done
done

exit $fail
