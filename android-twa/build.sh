#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# OtlobFanni Android TWA — Production Build Script
# Produces: app-release.aab (Google Play Closed Testing)
#
# Requirements on your local machine:
#   - Node.js 18+
#   - Java JDK 17  (https://adoptium.net)
#   - Android SDK  (via Android Studio or sdkmanager)
#
# Usage:
#   cd android-twa
#   chmod +x build.sh
#   ./build.sh
# ─────────────────────────────────────────────────────────────────────────────
set -e

PACKAGE="com.otlobfanni.app"
VERSION_NAME="1.1.0"
VERSION_CODE=3
KEYSTORE="release.keystore"
KEY_ALIAS="otlobfanni-release"
AAB_OUTPUT="app-release.aab"

echo ""
echo "══════════════════════════════════════"
echo "  OtlobFanni Android TWA Build"
echo "  v${VERSION_NAME} (code ${VERSION_CODE})"
echo "══════════════════════════════════════"
echo ""

# ── 1. Install Bubblewrap if not present ──────────────────────────────────────
if ! command -v bubblewrap &> /dev/null; then
  echo "▶ Installing @bubblewrap/cli ..."
  npm install -g @bubblewrap/cli
fi

# ── 2. Generate release keystore (SKIP if already exists) ────────────────────
if [ ! -f "$KEYSTORE" ]; then
  echo ""
  echo "▶ Generating release keystore ..."
  echo "  ⚠  Store the generated keystore file safely — you need it for every future update."
  echo ""
  keytool -genkey -v \
    -keystore "$KEYSTORE" \
    -alias "$KEY_ALIAS" \
    -keyalg RSA \
    -keysize 2048 \
    -validity 10000 \
    -dname "CN=OtlobFanni, OU=Mobile, O=OtlobFanni, L=Tripoli, S=Tripoli, C=LY"

  echo ""
  echo "▶ Your SHA-256 fingerprint (needed for assetlinks.json):"
  keytool -list -v \
    -keystore "$KEYSTORE" \
    -alias "$KEY_ALIAS" \
    -storepass android 2>/dev/null | grep "SHA256:" | awk '{print $2}'
  echo ""
  echo "  → Set this value as the ASSETLINKS_SHA256 environment variable"
  echo "    on your Replit deployment, then redeploy."
  echo ""
fi

# ── 3. Initialize TWA project from manifest ───────────────────────────────────
if [ ! -d "android" ]; then
  echo "▶ Initializing TWA project ..."
  bubblewrap init --manifest=./twa-manifest.json
fi

# ── 4. Build release AAB ──────────────────────────────────────────────────────
echo "▶ Building release AAB ..."
bubblewrap build --skipPwaValidation

# ── 5. Copy AAB to output ─────────────────────────────────────────────────────
if [ -f "app-release.aab" ]; then
  echo ""
  echo "✅  Build complete!"
  echo "    Output: $(pwd)/app-release.aab"
  echo ""
  echo "══════════════════════════════════════"
  echo "  NEXT STEPS"
  echo "══════════════════════════════════════"
  echo ""
  echo "  1. Upload app-release.aab to Google Play Console"
  echo "     → Production > Testing > Closed testing > Create track"
  echo ""
  echo "  2. Get SHA-256 from Play Console:"
  echo "     → Release > Setup > App signing"
  echo "     → Copy 'App signing key certificate' SHA-256"
  echo ""
  echo "  3. Set it on Replit:"
  echo "     → Secrets tab → ASSETLINKS_SHA256 → paste SHA-256"
  echo "     → Redeploy"
  echo ""
  echo "  4. Verify:"
  echo "     https://digitalassetlinks.googleapis.com/v1/statements:list"
  echo "     ?source.web.site=https://otlobfanni.ly"
  echo "     &relation=delegate_permission/common.handle_all_urls"
  echo ""
else
  echo "❌  Build failed — check output above for errors."
  exit 1
fi
