import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import path from "path";
import { existsSync } from "fs";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use("/api", router);

// In production, serve the built frontend static files and handle SPA routing
if (process.env.NODE_ENV === "production") {
  // __dirname is injected by the esbuild banner (points to artifacts/api-server/dist/)
  // so we navigate up 3 levels to reach the workspace root
  const workspaceRoot = path.resolve(__dirname, "..", "..", "..");
  const staticDir = path.join(workspaceRoot, "artifacts/otlob-fanni/dist/public");

  logger.info({ staticDir, exists: existsSync(staticDir) }, "Static files directory");

  if (existsSync(staticDir)) {
    app.use(express.static(staticDir));
    app.get("/{*path}", (_req, res) => {
      const indexPath = path.join(staticDir, "index.html");
      res.sendFile(indexPath, (err) => {
        if (err) {
          logger.error({ err, indexPath }, "Failed to send index.html");
          res.status(500).send("Server Error");
        }
      });
    });
  } else {
    logger.error({ staticDir }, "Frontend static files not found — did the build run?");
    app.get("/{*path}", (_req, res) => {
      res.status(503).send("Frontend not built");
    });
  }
}

export default app;
