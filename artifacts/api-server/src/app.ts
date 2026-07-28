import express, { type Express } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import pinoHttp from "pino-http";
import path from "node:path";
import { createServer as createViteServer } from "vite";
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
        return { statusCode: res.statusCode };
      },
    },
  }),
);
app.use(cors({ credentials: true, origin: true }));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

// Error handler for API routes to prevent returning HTML on uncaught errors
app.use("/api", (err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error(err);
  res.status(500).json({ error: err?.message || "Terjadi kesalahan internal pada server" });
});

if (process.env.NODE_ENV !== "production") {
  const yastarDir = path.resolve(process.cwd(), "artifacts/yastar");
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: "spa",
    root: yastarDir,
  });
  app.use(vite.middlewares);
} else {
  const distPath = path.resolve(process.cwd(), "artifacts/yastar/dist/public");
  app.use(express.static(distPath));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

export default app;
