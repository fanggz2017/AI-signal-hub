import { Hono } from "hono";
import { ResultUtil } from "@/utils/result";
import { QuerySchema, RepoListType } from "@app/core";
import { getRepoList } from "@/services/github.service";

const app = new Hono();

app.get("/trending/list", async (c) => {
  const query = c.req.query();
  const parseResult = QuerySchema.safeParse(query);

  if (!parseResult.success) {
    return c.json({ error: "Invalid type param" }, 400);
  }

  const { type } = parseResult.data;
  const data = await getRepoList(type as RepoListType);

  return ResultUtil.success(c, data);
});

export default app;
