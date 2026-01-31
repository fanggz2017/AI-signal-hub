import redis from "@/db/redis";
import { GithubRepo } from "@app/core";

const CACHE_KEY = "github:trending";

/**
 * 获取 GitHub 热门趋势 (Search API)
 * 策略: 搜索过去 7 天创建的 star 数最多的仓库
 */
export const fetchTrending = async (): Promise<GithubRepo[]> => {
  try {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    const dateString = date.toISOString().split("T")[0];

    const response = await fetch(
      `https://api.github.com/search/repositories?q=created:>${dateString}&sort=stars&order=desc&per_page=10`,
      {
        headers: {
          "User-Agent": "My-Blog-App",
          "Accept": "application/vnd.github.v3+json"
        },
      }
    );

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.items.map((item: any) => ({
      id: item.id,
      name: item.name,
      full_name: item.full_name,
      html_url: item.html_url,
      description: item.description,
      stargazers_count: item.stargazers_count,
      language: item.language,
      owner: {
        login: item.owner.login,
        avatar_url: item.owner.avatar_url,
      },
    }));
  } catch (error) {
    console.error("Failed to fetch trending repos:", error);
    return [];
  }
};

/**
 * 缓存数据到 Redis
 */
export const cacheTrending = async (repos: GithubRepo[]) => {
  if (repos.length === 0) return;
  await redis.set(CACHE_KEY, JSON.stringify(repos), "EX", 60 * 60 * 25); // 缓存 25 小时，防止cron失败时空窗
};

/**
 * 从 Redis 获取缓存数据
 */
export const getCachedTrending = async (): Promise<GithubRepo[]> => {
  const data = await redis.get(CACHE_KEY);
  if (!data) return [];
  return JSON.parse(data);
};

/**
 * 主任务：拉取并缓存 (供 Cron 调用)
 */
export const updateTrendingCache = async () => {
  console.log("[Cron] Starting GitHub trending update...");
  const repos = await fetchTrending();
  if (repos.length > 0) {
    await cacheTrending(repos);
    console.log(`[Cron] Successfully updated ${repos.length} repos.`);
  } else {
    console.log("[Cron] No data fetched.");
  }
};
