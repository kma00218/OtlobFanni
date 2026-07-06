import app from "./app";
import { logger } from "./lib/logger";
import { seedDatabase } from "./seed";

// DISABLED 2026-07-06: this job caused a production data-loss incident.
// cleanupStaleOrphans() relied on findOrphanedObjects(), which queries the
// DEV database for "is this file referenced" checks instead of production.
// Against the (nearly empty) dev DB almost everything looked orphaned, so
// once files crossed the 48h age threshold this job deleted real,
// linked production images. DO NOT re-enable until findOrphanedObjects()
// is fixed to check the correct (production) database and has been
// re-validated with a dry run against production data.
function scheduleStaleUploadCleanup() {
  logger.warn("Stale upload cleanup job is DISABLED after a production data-loss incident. Not scheduling.");
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
