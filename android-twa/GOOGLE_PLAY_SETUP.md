# OtlobFanni — Google Play Setup Guide
## Package: `com.otlobfanni.app` | Version: `1.0.0`

---

## Option A — GitHub Actions (recommended, no local setup needed)

### Prerequisites
- GitHub account with this repo pushed to it
- That's it.

---

### Step 1 — Push this repo to GitHub

```bash
git remote add origin https://github.com/YOUR_USERNAME/otlobfanni.git
git push -u origin main
```

---

### Step 2 — First run: generate keystore + build AAB

1. Go to your GitHub repo → **Actions** tab
2. Select **"Build Android AAB"** workflow
3. Click **"Run workflow"**
4. Check **"Generate NEW keystore"** = `true`
5. Click **"Run workflow"**

When it finishes (~15 min):
- Download **`app-release-aab`** artifact → this is your `app-release.aab`
- Download **`release-keystore-STORE-SAFELY`** artifact → save this forever
- In the workflow logs, find and copy:
  - The **SHA-256 fingerprint** (for Replit → `ASSETLINKS_SHA256`)
  - The **KEYSTORE_BASE64** value (for GitHub Secrets)

---

### Step 3 — Set GitHub Secrets (for future builds)

Go to: **GitHub repo → Settings → Secrets and variables → Actions → New repository secret**

| Secret name | Value |
|---|---|
| `KEYSTORE_BASE64` | long base64 string from workflow logs |
| `KEYSTORE_PASS` | password you used (or `changeme_store` if not set) |
| `KEY_PASS` | key password (or `changeme_key` if not set) |

---

### Step 4 — Set SHA-256 on Replit

1. Open Replit project → **Secrets** tab
2. Add secret: `ASSETLINKS_SHA256` = `AA:BB:CC:DD:...` (from workflow logs)
3. **Redeploy** the app

Verify it's working:
```
https://otlobfanni.ly/.well-known/assetlinks.json
```

---

### Future builds (after secrets are set)

1. Actions → "Build Android AAB" → Run workflow
2. Leave "Generate NEW keystore" = `false`
3. Download `app-release.aab` artifact when done

---

## Option B — macOS (minimum steps, no Android Studio)

Bubblewrap can download JDK and Android SDK automatically.

```bash
# 1. Install Node.js (if not installed)
brew install node

# 2. Install Bubblewrap
npm install -g @bubblewrap/cli

# 3. Go to the android-twa directory
cd android-twa

# 4. Initialize project (will prompt to auto-install JDK + SDK)
bubblewrap init --manifest=./twa-manifest.json

# 5. Build
bubblewrap build
```

Total time: ~20 minutes (mostly SDK download on first run).
Output: `android-twa/app-release.aab`

---

## Step 5 — Upload to Google Play Console

1. Open [play.google.com/console](https://play.google.com/console)
2. Create new app → Package: `com.otlobfanni.app`
3. **Testing → Closed testing → Create track**
4. Upload `app-release.aab`
5. Fill required store listing fields

---

## Step 6 — Get final SHA-256 from Google Play

If you use **Google Play App Signing** (recommended):

1. Play Console → **Release → Setup → App signing**
2. Copy **"App signing key certificate" → SHA-256**
3. Update Replit Secret `ASSETLINKS_SHA256` with this value
4. Redeploy

Verify Digital Asset Links:
```
https://digitalassetlinks.googleapis.com/v1/statements:list?source.web.site=https://otlobfanni.ly&relation=delegate_permission/common.handle_all_urls
```

---

## Updating the app in future

Only increment version numbers in `twa-manifest.json`:
```json
"appVersionCode": 2,
"appVersionName": "1.0.1"
```
Then run the GitHub Actions workflow again. No code changes needed.

---

## Google Play Policy Checklist

- [x] HTTPS-only — no SSL bypass
- [x] No unsafe WebView SSL error handling
- [x] Content served from verified domain (`otlobfanni.ly`)
- [x] `assetlinks.json` endpoint live at `/.well-known/assetlinks.json`
- [x] Target SDK 34 (Android 14) — compliant
- [x] Min SDK 21 (Android 5.0) — covers 99%+ of active devices
- [x] Package name: `com.otlobfanni.app`
- [x] Version: `1.0.0` (code: 1)
- [ ] Privacy policy URL required → use `https://otlobfanni.ly/privacy`
- [ ] Store screenshots (min 2)
- [ ] Content rating questionnaire
