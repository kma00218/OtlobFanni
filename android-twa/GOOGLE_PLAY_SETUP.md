# OtlobFanni — Google Play Production Build Guide
## Package: `com.otlobfanni.app` | Version: `1.1.0` (versionCode 3)

---

## ✅ Pre-flight Checklist

| Item | Status |
|---|---|
| Production URL | `https://otlobfanni.ly/` ✅ |
| Package name | `com.otlobfanni.app` ✅ |
| versionCode | **3** (higher than any previous build) ✅ |
| versionName | **1.1.0** ✅ |
| Target SDK | 34 (Android 14) ✅ |
| Min SDK | 21 (Android 5.0) ✅ |
| Build type | Release (signed AAB) ✅ |
| assetlinks.json | Must be live at `https://otlobfanni.ly/.well-known/assetlinks.json` |

---

## Build via GitHub Actions (Recommended)

The signing keystore lives in GitHub Secrets — no local machine needed.

### Step 1 — Push this repo to GitHub (if not done)

```bash
git remote add origin https://github.com/YOUR_USERNAME/otlobfanni.git
git push -u origin main
```

### Step 2 — Ensure GitHub Secrets are set

Go to: **GitHub repo → Settings → Secrets and variables → Actions**

| Secret name | Description |
|---|---|
| `KEYSTORE_BASE64` | Base64-encoded release keystore (generated once, keep forever) |
| `KEYSTORE_PASS` | Keystore password |
| `KEY_PASS` | Key password |

> **First time?** Run the workflow with `generate_keystore = true` (Step 3 below).
> It will output `KEYSTORE_BASE64` in the logs — copy it and add to Secrets.

### Step 3 — Run the build workflow

1. GitHub repo → **Actions** tab
2. Select **"Build Android AAB"**
3. Click **"Run workflow"**
4. Set `Generate NEW keystore` = **`false`** (unless it's your very first build)
5. Click **"Run workflow"**
6. Wait ~15 minutes
7. Download `app-release-aab` artifact → this is your `app-release.aab`

---

## Upload to Google Play Console

1. Open [play.google.com/console](https://play.google.com/console)
2. Select **OtlobFanni** app (`com.otlobfanni.app`)
3. Go to **Production → Create new release**
4. Upload `app-release.aab`
5. Enter the release notes (see Changelog below)
6. Review and **Rollout to Production**

---

## Changelog — v1.1.0 (versionCode 3)

**What's new in this release:**

- **Advertisement System** — sponsors can now appear in the home screen stats carousel with rotating ad slots
- **AI-powered Search** — natural language search with AI tags and synonym expansion for better technician discovery
- **Service Lifecycle Improvements** — full start → confirmation → completion → dispute flow on service requests
- **Customer Account System** — username + PIN accounts replace anonymous tracking codes for "My Requests"
- **General Request Flow** — improved request submission, WhatsApp validation, and pro dashboard tab
- **UI/UX Improvements** — fixed FAB overlap, improved back navigation, improved category sorting
- **Bug Fixes** — custom category sort order, object storage path resolution, WhatsApp min-length validation
- **Performance** — optimized bundle, improved API response times

---

## After Upload — Set assetlinks.json

If you use **Google Play App Signing** (recommended):

1. Play Console → **Release → Setup → App signing**
2. Copy **"App signing key certificate" → SHA-256**
3. In Replit → **Secrets** → set `ASSETLINKS_SHA256` = that SHA-256 value
4. **Redeploy** the app

Verify:
```
https://otlobfanni.ly/.well-known/assetlinks.json
```
```
https://digitalassetlinks.googleapis.com/v1/statements:list?source.web.site=https://otlobfanni.ly&relation=delegate_permission/common.handle_all_urls
```

---

## Future Releases

Only two files need updating for each new release:

**`android-twa/twa-manifest.json`:**
```json
"appVersionCode": 4,
"appVersionName": "1.2.0"
```

**`android-twa/build.sh`:**
```bash
VERSION_NAME="1.2.0"
VERSION_CODE=4
```

Then push to GitHub and run the Actions workflow. No other code changes needed.

---

## Google Play Policy Checklist

- [x] HTTPS-only — no SSL bypass
- [x] No unsafe WebView SSL error handling
- [x] Content served from verified domain (`otlobfanni.ly`)
- [x] `assetlinks.json` endpoint live at `/.well-known/assetlinks.json`
- [x] Target SDK 34 (Android 14) — compliant
- [x] Min SDK 21 (Android 5.0) — covers 99%+ of active devices
- [x] Package name: `com.otlobfanni.app`
- [x] Release build (signed AAB, not debug APK)
- [ ] Privacy policy URL → `https://otlobfanni.ly/privacy`
- [ ] Store screenshots (min 2 required)
- [ ] Content rating questionnaire
