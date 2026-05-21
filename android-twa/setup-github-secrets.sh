#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# OtlobFanni — Generate keystore & print GitHub Secrets values
# Run this ONCE on any machine with Java installed.
#
# Usage:
#   chmod +x setup-github-secrets.sh
#   ./setup-github-secrets.sh
# ─────────────────────────────────────────────────────────────────────────────
set -e

KEYSTORE="release.keystore"
KEY_ALIAS="otlobfanni-release"

echo ""
echo "══════════════════════════════════════════════"
echo "  OtlobFanni — Keystore Generator"
echo "══════════════════════════════════════════════"
echo ""

# Prompt for passwords
read -s -p "Enter keystore password (min 6 chars): " KS_PASS; echo
read -s -p "Confirm keystore password: " KS_PASS2; echo

if [ "$KS_PASS" != "$KS_PASS2" ]; then
  echo "Passwords do not match. Exiting."
  exit 1
fi

read -s -p "Enter key password (can be same as keystore password): " KEY_PASS; echo

# Generate keystore
echo ""
echo "▶ Generating keystore..."
keytool -genkey -v \
  -keystore "$KEYSTORE" \
  -alias "$KEY_ALIAS" \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000 \
  -storepass "$KS_PASS" \
  -keypass  "$KEY_PASS" \
  -dname "CN=OtlobFanni, OU=Mobile, O=OtlobFanni, L=Tripoli, S=Tripoli, C=LY"

echo ""
echo "══════════════════════════════════════════════"
echo "  SHA-256 Fingerprint (for ASSETLINKS_SHA256)"
echo "══════════════════════════════════════════════"
SHA=$(keytool -list -v \
  -keystore "$KEYSTORE" \
  -alias "$KEY_ALIAS" \
  -storepass "$KS_PASS" 2>/dev/null | grep "SHA256:" | awk '{print $2}')
echo ""
echo "  $SHA"
echo ""
echo "  → Add to Replit Secrets: ASSETLINKS_SHA256 = $SHA"
echo ""

echo "══════════════════════════════════════════════"
echo "  GitHub Secrets — copy these values exactly"
echo "══════════════════════════════════════════════"
echo ""
echo "Secret name:   KEYSTORE_BASE64"
echo "Secret value:"
base64 -i "$KEYSTORE"
echo ""
echo "Secret name:   KEYSTORE_PASS"
echo "Secret value:  $KS_PASS"
echo ""
echo "Secret name:   KEY_PASS"
echo "Secret value:  $KEY_PASS"
echo ""
echo "══════════════════════════════════════════════"
echo ""
echo "⚠  Store '$KEYSTORE' safely — you need it for ALL future app updates."
echo "   Back it up to a secure location (encrypted drive, password manager, etc.)"
echo ""
