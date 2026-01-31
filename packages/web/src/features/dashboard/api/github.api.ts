import request from "@/lib/request";
import { GithubRepo } from "@app/core";

export const getGithubTrending = async () => {
  return request.get<GithubRepo[]>("/github/trending");
};
