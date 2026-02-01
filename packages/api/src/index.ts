import { Hono } from "hono";
import { logger } from "hono/logger";
import { cors } from "hono/cors";
import { HTTPException } from "hono/http-exception";
import { setupCronJobs } from "./jobs/cron";

import auth from "./routes/auth.route";
import github from "./routes/github.route";
import { authMiddleware } from "./middlewares/auth";
import type { AppEnv } from "./types/auth";

const app = new Hono<AppEnv>();

setupCronJobs();

// --- 中间件 ---
app.use("*", logger());

app.use(
  "*",
  cors({
    origin: process.env.CORS_ORIGIN || "*",
    allowMethods: ["POST", "GET", "OPTIONS", "PUT", "DELETE"],
    credentials: true,
  }),
);

// --- 错误处理 ---
app.onError((err, c) => {
  if (err instanceof HTTPException) {
    const cause = err.cause as { field?: string } | undefined;
    return c.json(
      {
        code: err.status,
        message: err.message,
        field: cause?.field,
        data: null,
      },
      err.status,
    );
  }

  console.error("Unhandled Error:", err);

  return c.json(
    {
      code: 500,
      message: "服务器内部错误",
      data: null,
    },
    500,
  );
});

const api = new Hono<AppEnv>().basePath("/api");

api.route("/auth", auth);

const protectedRoutes = new Hono<AppEnv>()
  .use(authMiddleware)
  .route("/github", github);

api.route("/", protectedRoutes);

app.route("/", api);

app.get("/", (c) => c.text("System Active."));

export default app;
