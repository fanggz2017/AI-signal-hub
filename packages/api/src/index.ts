import { Hono } from "hono";
import { logger } from "hono/logger";
import { cors } from "hono/cors";
import auth from "./routes/auth.route";
import github from "./routes/github.route";
import { setupCronJobs } from "./jobs/cron";
import { HTTPException } from "hono/http-exception";

const app = new Hono();

// 启动定时任务
setupCronJobs();

// --- 中间件区域 ---

app.use("*", logger());

app.use(
  "*",
  cors({
    origin: "*",
    allowMethods: ["POST", "GET", "OPTIONS", "PUT", "DELETE"],
  }),
);

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

  return c.json(
    {
      code: 500,
      message: "服务器内部错误",
      data: null,
    },
    500,
  );
});

const api = new Hono().basePath("/api");
api.route("/auth", auth);
api.route("/github", github);
app.route("/", api);

// --- 健康检查 ---
app.get("/", (c) => c.text("Hello Hono! Server is ready."));

export default app;
