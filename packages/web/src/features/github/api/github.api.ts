import request from "@/lib/request";
import type { GithubRepo, RepoListType } from "@app/core";

export const getGithubTrending = async (type: RepoListType) => {
  const res = (await request.get("/github/trending/list", {
    params: { type },
  })) as {
    data: GithubRepo[];
  };
  return res.data;
};
