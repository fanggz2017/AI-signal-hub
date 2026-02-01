import redis from "@/db/redis";
import { GithubRepoSchema, type GithubRepo } from "@app/core";
import { HeadersInit } from "bun";
import { z } from "zod";

const CACHE_KEY = "github:trending";
const CACHE_TTL = 60 * 60 * 25;

// 定义 API 响应结构，复用 Core 的 Schema
const GitHubSearchResponseSchema = z.object({
  items: z.array(GithubRepoSchema),
});

/**
 * 1. 获取 GitHub 数据
 */
export const fetchTrending = async (): Promise<GithubRepo[]> => {
  try {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    const dateString = date.toISOString().split("T")[0];

    const token = process.env.GITHUB_ACCESS_TOKEN;
    const headers: HeadersInit = {
      "User-Agent": "My-Blog-App",
      Accept: "application/vnd.github.v3+json",
    };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const response = await fetch(
      `https://api.github.com/search/repositories?q=created:>${dateString}&sort=stars&order=desc&per_page=10`,
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
    console.error("❌ [GitHub Service] Fetch failed:", error);
    throw error;
  }
};

/**
 * 2. 写入缓存
 */
export const cacheTrending = async (repos: GithubRepo[]) => {
  if (repos.length === 0) return;
  try {
    await redis.set(CACHE_KEY, JSON.stringify(repos), "EX", CACHE_TTL);
  } catch (error) {
    console.error("❌ [GitHub Service] Redis write failed:", error);
  }
};

/**
 * 3. 智能获取 (Cache-Aside + Fallback)
 * 供 API 层调用
 */
export const getTrendingData = async (): Promise<GithubRepo[]> => {
  try {
    const cached = await redis.get(CACHE_KEY);
    if (cached) {
      return JSON.parse(cached) as GithubRepo[];
    }
  } catch (e) {
    console.error("⚠️ [GitHub Service] Cache read error, ignoring...", e);
  }
  console.log("🔄 [GitHub Service] Cache miss. Fetching live data...");
  try {
    const freshData = await fetchTrending();
    cacheTrending(freshData).catch((err) =>
      console.error("Async cache update failed", err),
    );
    return freshData;
  } catch (error) {
    console.error("🔥 [GitHub Service] All data sources failed.");
    return []; // 兜底返回空数组
  }
};

/**
 * 4. 定时任务专用
 * 供 Cron 调用
 */
export const updateTrendingCache = async () => {
  console.log("⏰ [Cron] Starting GitHub trending update...");
  try {
    const repos = await fetchTrending();
    if (repos.length > 0) {
      await cacheTrending(repos);
      console.log(`✅ [Cron] Success: Cached ${repos.length} repos.`);
    }
  } catch (error) {
    console.error("❌ [Cron] Job failed:", error);
  }
};
