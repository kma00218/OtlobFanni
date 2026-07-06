import app from "./app";
import { logger } from "./lib/logger";
import { seedDatabase } from "./seed";
import { cleanupStaleOrphans } from "./routes/admin";

const STALE_UPLOAD_CLEANUP_INTERVAL_MS = 6 * 60 * 60 * 1000; // every 6h

function scheduleStaleUploadCleanup() {
  const run = async () => {
    try {
      const result = await cleanupStaleOrphans();
      if (result.deleted > 0 || result.failed > 0) {
        logger.info({ ...result }, "Stale upload cleanup run completed");
      }
    } catch (err) {
      logger.error({ err }, "Stale upload cleanup run failed");
    }
  };
  // Run once shortly after startup, then on a fixed interval.
  setTimeout(run, 60 * 1000);
  setInterval(run, STALE_UPLOAD_CLEANUP_INTERVAL_MS);
}

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

seedDatabase().then(() => {
  app.listen(port, (err) => {
    if (err) {
      logger.error({ err }, "Error listening on port");
      process.exit(1);
    }

    logger.info({ port }, "Server listening");
    scheduleStaleUploadCleanup();
  });
});
