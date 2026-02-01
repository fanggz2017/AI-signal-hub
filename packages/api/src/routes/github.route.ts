import { Hono } from "hono";
import { getTrendingData } from "@/services/github.service";
import { ResultUtil } from "@/utils/result";

const app = new Hono();

app.get("/trending", async (c) => {
  const data = await getTrendingData();
  return ResultUtil.success(c, data);
});

export default app;
