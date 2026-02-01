import redis from "@/db/redis";
import { GithubRepoSchema, RepoListType, type GithubRepo } from "@app/core";
import { HeadersInit } from "bun";
import { z } from "zod";

const getCacheKey = (type: RepoListType) => `github:${type}`;
const CACHE_TTL = 60 * 60 * 25;

const GitHubSearchResponseSchema = z.object({
  items: z.array(GithubRepoSchema),
});

/**
 * 构建 GitHub 查询语句
 * 1. 飙升榜：最近 7 天创建，按 Star 排序
 * 2. 历史热门：Star 数大于 10k，按 Star 排序 (经典项目)
 * 3. AI 垂直榜：包含 AI 关键词，按 Star 排序
 */
const buildQuery = (type: RepoListType): string => {
  const date = new Date();

  if (type === "trending") {
    date.setDate(date.getDate() - 7);
    const last7Days = date.toISOString().split("T")[0];
    return `q=created:>${last7Days}&sort=stars&order=desc`;
  }

  if (type === "agent") {
    return `q=topic:agent+topic:autonomous+topic:chatbot&sort=stars&order=desc`;
  }

  if (type === "ai") {
    return `q=topic:machine-learning+topic:ai+topic:llm&sort=stars&order=desc`;
  }

  return "";
};

/**
 * 1. 通用获取方法 (Fetch)
 */
export const fetchGithubRepos = async (
  type: RepoListType,
): Promise<GithubRepo[]> => {
  try {
    const token = process.env.GITHUB_ACCESS_TOKEN;
    const headers: HeadersInit = {
      "User-Agent": "My-AI-Platform",
      Accept: "application/vnd.github.v3+json",
    };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const queryParams = buildQuery(type);
    const response = await fetch(
      `https://api.github.com/search/repositories?${queryParams}&per_page=10`,
      { headers },
    );

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`GitHub API Error [${response.status}]: ${errText}`);
    }

    const rawJson = await response.json();
    const parsedData = GitHubSearchResponseSchema.parse(rawJson);

    return parsedData.items;
  } catch (error) {
    console.error(`❌ [GitHub Service] Fetch ${type} failed:`, error);
    throw error;
  }
};

/**
 * 2. 通用写入缓存
 */
export const cacheRepos = async (type: RepoListType, repos: GithubRepo[]) => {
  if (repos.length === 0) return;
  try {
    await redis.set(getCacheKey(type), JSON.stringify(repos), "EX", CACHE_TTL);
  } catch (error) {
    console.error(`❌ [GitHub Service] Cache ${type} failed:`, error);
  }
};

export const getRepoList = async (
  type: RepoListType,
): Promise<GithubRepo[]> => {
  const key = getCacheKey(type);

  try {
    const cached = await redis.get(key);
    if (cached) {
      return JSON.parse(cached) as GithubRepo[];
    }
  } catch (e) {
    console.error("⚠️ Cache read error", e);
  }

  console.log(`🔄 Cache miss for [${type}]. Fetching live...`);
  try {
    const freshData = await fetchGithubRepos(type);
    cacheRepos(type, freshData).catch(console.error);
    return freshData;
  } catch (error) {
    console.error(`🔥 All sources failed for [${type}]`);
    return [];
  }
};

/**
 * 4. Cron 任务
 */
export const updateAllRepoCaches = async () => {
  const types: RepoListType[] = ["trending", "agent", "ai"];

  await Promise.all(
    types.map(async (type) => {
      try {
        const repos = await fetchGithubRepos(type);
        if (repos.length > 0) {
          await cacheRepos(type, repos);
          console.log(`✅ [Cron] Updated ${type}: ${repos.length} items`);
        }
      } catch (e) {
        console.error(`❌ [Cron] Failed to update ${type}`);
      }
    }),
  );
};
