const { TwaGenerator, TwaManifest, Config } = require('@bubblewrap/core');
const path = require('path');

(async () => {
  const manifest = await TwaManifest.fromFile(path.resolve('./twa-manifest.json'));
  const config = new Config(process.env.JAVA_HOME, process.env.ANDROID_SDK_ROOT);
  const generator = new TwaGenerator();
  await generator.createTwaProject(path.resolve('./android'), manifest, config);
  console.log('TWA project initialized successfully');
})().catch(e => { console.error(e.message || e); process.exit(1); });
