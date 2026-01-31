import { Hono } from "hono";
import { getCachedTrending } from "@/services/github.service";
import { Result } from "@/utils/result";

const app = new Hono();

app.get("/trending", async (c) => {
  const data = await getCachedTrending();
  return c.json(Result.success(data));
});

export default app;
