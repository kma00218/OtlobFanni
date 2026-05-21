const { TwaGenerator, TwaManifest, Config } = require('@bubblewrap/core');
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

async function main() {
  const jdkPath = process.env.JAVA_HOME;
  const sdkPath = process.env.ANDROID_SDK_ROOT || process.env.ANDROID_HOME;

  if (!jdkPath) { console.error('JAVA_HOME not set'); process.exit(1); }
  if (!sdkPath) { console.error('ANDROID_SDK_ROOT not set'); process.exit(1); }

  // 1. Write bubblewrap config directly (no interactive prompts)
  const configDir = path.join(process.env.HOME, '.bubblewrap');
  fs.mkdirSync(configDir, { recursive: true });
  fs.writeFileSync(path.join(configDir, 'config.json'), JSON.stringify({
    jdkPath,
    androidSdkPath: sdkPath
  }));
  console.log('Bubblewrap config written.');

  // 2. Init TWA project if not already done
  const androidDir = path.resolve('./android');
  if (!fs.existsSync(androidDir)) {
    console.log('Initializing TWA project...');
    const manifest = await TwaManifest.fromFile(path.resolve('./twa-manifest.json'));
    const config = new Config(jdkPath, sdkPath);
    const generator = new TwaGenerator();
    await generator.createTwaProject(androidDir, manifest, config);
    console.log('TWA project initialized.');
  } else {
    console.log('TWA project already exists, skipping init.');
  }

  // 3. Build release AAB with Gradle directly (no interactive prompts)
  const ksPath = path.resolve('./release.keystore');
  const ksPass = process.env.KEYSTORE_PASS || 'changeme_store';
  const keyPass = process.env.KEY_PASS || 'changeme_key';

  if (!fs.existsSync(ksPath)) {
    console.error('release.keystore not found at: ' + ksPath);
    process.exit(1);
  }

  console.log('Building release AAB with Gradle...');
  execSync(
    `./gradlew bundleRelease` +
    ` -Pandroid.injected.signing.store.file=${ksPath}` +
    ` -Pandroid.injected.signing.store.password=${ksPass}` +
    ` -Pandroid.injected.signing.key.alias=otlobfanni-release` +
    ` -Pandroid.injected.signing.key.password=${keyPass}`,
    { cwd: androidDir, stdio: 'inherit' }
  );

  // 4. Copy AAB to android-twa root for upload
  const aabSrc = path.join(androidDir, 'app/build/outputs/bundle/release/app-release.aab');
  const aabDst = path.resolve('./app-release.aab');
  if (fs.existsSync(aabSrc)) {
    fs.copyFileSync(aabSrc, aabDst);
    console.log('app-release.aab ready.');
  } else {
    console.error('AAB not found at: ' + aabSrc);
    process.exit(1);
  }
}

main().catch(e => { console.error(e.message || e); process.exit(1); });
