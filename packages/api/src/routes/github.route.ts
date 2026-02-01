import { Hono } from "hono";
import { getCachedTrending } from "@/services/github.service";
import { ResultUtil } from "@/utils/result";

const app = new Hono();

app.get("/trending", async (c) => {
  const data = await getCachedTrending();
  return ResultUtil.success(c, data);
});

export default app;
