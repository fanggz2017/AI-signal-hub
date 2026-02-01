import request from "@/lib/request";
import type { GithubRepo } from "@app/core";

export const getGithubTrending = async () => {
  const res = (await request.get("/github/trending")) as {
    data: GithubRepo[];
  };
  return res.data;
};
