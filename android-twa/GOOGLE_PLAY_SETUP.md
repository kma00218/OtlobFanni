# OtlobFanni — Google Play Setup Guide
## Package: `com.otlobfanni.app` | Version: `1.0.0`

---

## Overview

OtlobFanni uses **TWA (Trusted Web Activity)** — an official Google technology
that wraps the live website (`https://otlobfanni.ly`) in a native Android shell.
No duplicate codebase. The app always shows the latest content automatically.

---

## Prerequisites (your local machine)

| Tool | Version | Download |
|------|---------|----------|
| Node.js | 18+ | https://nodejs.org |
| Java JDK | 17 | https://adoptium.net |
| Android Studio | latest | https://developer.android.com/studio |

---

## Step 1 — Build the AAB

```bash
cd android-twa
chmod +x build.sh
./build.sh
```

The script will:
- Install `@bubblewrap/cli` if needed
- Generate `release.keystore` (keep it safe — needed for every update)
- Print your SHA-256 fingerprint
- Build `app-release.aab`

---

## Step 2 — Upload to Google Play

1. Open [Google Play Console](https://play.google.com/console)
2. Create new app → Package name: `com.otlobfanni.app`
3. Go to: **Testing → Closed testing → Create track**
4. Upload `app-release.aab`
5. Fill in store listing (description, screenshots, etc.)

---

## Step 3 — Configure assetlinks.json (CRITICAL)

The TWA will show a browser address bar unless assetlinks.json is configured correctly.

### Get the SHA-256 fingerprint:
After uploading to Play Console:
1. Go to: **Release → Setup → App signing**
2. Under "App signing key certificate", copy the **SHA-256 certificate fingerprint**
   (looks like: `AA:BB:CC:DD:EE:...`)

### Set it on Replit:
1. Open your Replit project
2. Go to **Secrets** tab (lock icon)
3. Add: `ASSETLINKS_SHA256` = `AA:BB:CC:DD:EE:FF:...` (your SHA-256)
4. Click **Redeploy**

### Verify it's working:
Open this URL in your browser:
```
https://digitalassetlinks.googleapis.com/v1/statements:list?source.web.site=https://otlobfanni.ly&relation=delegate_permission/common.handle_all_urls
```
You should see your package name and SHA-256 in the response.

---

## Step 4 — Submit for Closed Testing review

Google Play requires at minimum:
- [ ] App icon (512×512 PNG) ✅ already in manifest
- [ ] At least 2 screenshots
- [ ] Short description (80 chars)
- [ ] Full description (4000 chars)
- [ ] Privacy policy URL — add `/privacy` page URL
- [ ] Content rating questionnaire
- [ ] Target audience declaration

---

## Updating the app

For future releases:
1. Increment `appVersionCode` in `twa-manifest.json` (e.g., 2, 3, 4...)
2. Update `appVersionName` (e.g., "1.0.1")
3. Run `./build.sh` again
4. Upload new `app-release.aab` to Play Console

No need to touch the website code — TWA always loads the live site.

---

## Google Play Policy Notes

✅ HTTPS-only — no SSL bypass  
✅ No unsafe WebView SSL handling  
✅ Content served from verified domain  
✅ assetlinks.json verification required  
✅ Target SDK 34 (Android 14) — compliant  
✅ Min SDK 21 (Android 5.0) — covers 99%+ of devices  
