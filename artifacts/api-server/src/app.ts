import express, { type Express, type Request, type Response } from "express";
import cors from "cors";
import compression from "compression";
import pinoHttp from "pino-http";
import path from "path";
import { existsSync } from "fs";
import http from "http";
import router from "./routes";
import { logger } from "./lib/logger";
import { db } from "@workspace/db";
import {
  techniciansTable, citiesTable, categoriesTable, companyApplicationsTable,
} from "@workspace/db/schema";
import { eq, and } from "drizzle-orm";

const app: Express = express();

app.use(compression());
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

// ── Sitemap (root-level for SEO crawlers) ────────────────────────────────────
app.get("/sitemap.xml", async (_req: Request, res: Response): Promise<void> => {
  const BASE = "https://www.otlobfanni.ly";
  const today = new Date().toISOString().split("T")[0];
  try {
    const [cities, cats, techs, companies] = await Promise.all([
      db.select({ id: citiesTable.id }).from(citiesTable),
      db.select({ id: categoriesTable.id }).from(categoriesTable),
      db.select({ id: techniciansTable.id }).from(techniciansTable)
        .where(and(eq(techniciansTable.isApproved, true), eq(techniciansTable.isActive, true))),
      db.select({ id: companyApplicationsTable.id }).from(companyApplicationsTable)
        .where(eq(companyApplicationsTable.status, "published")),
    ]);
    const staticPages = ["/", "/categories", "/companies", "/suppliers", "/join", "/join-company", "/join-supplier", "/about", "/terms", "/privacy"];
    const urls: string[] = [
      ...staticPages.map(p => `${BASE}${p}`),
      `${BASE}/city/libya`,
      ...cities.map(c => `${BASE}/city/${c.id}`),
      ...cats.map(c => `${BASE}/category/${c.id}`),
      ...cities.flatMap(city => cats.map(cat => `${BASE}/category/${cat.id}?city=${city.id}`)),
      ...techs.map(t => `${BASE}/technician/${t.id}`),
      ...companies.map(c => `${BASE}/company/${c.id}`),
    ];
    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${
      urls.map(u => `  <url><loc>${u}</loc><lastmod>${today}</lastmod></url>`).join("\n")
    }\n</urlset>`;
    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=3600, stale-while-revalidate=7200");
    res.send(xml);
  } catch (err) {
    logger.error({ err }, "Failed to generate sitemap");
    res.status(500).send("Sitemap generation failed");
  }
});

app.use("/api", router);

// In development, proxy all non-API requests to the Vite dev server
if (process.env.NODE_ENV !== "production") {
  const VITE_PORT = 23988;
  app.use((req: Request, res: Response) => {
    const options = {
      hostname: "127.0.0.1",
      port: VITE_PORT,
      path: req.url,
      method: req.method,
      headers: { ...req.headers, host: `localhost:${VITE_PORT}` },
    };
    const proxy = http.request(options, (proxyRes) => {
      res.writeHead(proxyRes.statusCode ?? 200, proxyRes.headers);
      proxyRes.pipe(res, { end: true });
    });
    proxy.on("error", () => {
      if (!res.headersSent) res.status(502).send("Vite dev server unavailable");
    });
    req.pipe(proxy, { end: true });
  });
}

// In production, serve the built frontend static files and handle SPA routing
if (process.env.NODE_ENV === "production") {
  // __dirname is injected by the esbuild banner (points to artifacts/api-server/dist/)
  // so we navigate up 3 levels to reach the workspace root
  const workspaceRoot = path.resolve(__dirname, "..", "..", "..");
  const staticDir = path.join(workspaceRoot, "artifacts/otlob-fanni/dist/public");

  logger.info({ staticDir, exists: existsSync(staticDir) }, "Static files directory");

  if (existsSync(staticDir)) {
    // Hashed assets (JS/CSS chunks) — cache aggressively, content hash guarantees freshness
    // index: false prevents express.static from serving index.html (handled below with no-cache)
    app.use(express.static(staticDir, { maxAge: '1y', immutable: true, index: false }));
    // SPA fallback — always send index.html with no-store so browsers never cache it
    app.use((_req, res) => {
      const indexPath = path.join(staticDir, "index.html");
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      res.sendFile(indexPath, (err) => {
        if (err) {
          logger.error({ err, indexPath }, "Failed to send index.html");
          if (!res.headersSent) res.status(500).send("Server Error");
        }
      });
    });
  } else {
    logger.error({ staticDir }, "Frontend static files not found — did the build run?");
    app.use((_req, res) => {
      res.status(503).send("Frontend not built");
    });
  }
}

export default app;
