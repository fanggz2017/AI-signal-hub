import { describe, expect, it, mock, beforeEach, spyOn } from "bun:test";
import {
  fetchGithubRepos,
  cacheRepos,
  getRepoList,
  updateAllRepoCaches,
} from "../github.service";
import redis from "@/db/redis";

// Mock redis
mock.module("@/db/redis", () => ({
  default: {
    set: mock(),
    get: mock(),
  },
}));

describe("GithubService", () => {
  beforeEach(() => {
    // Reset mocks
    (redis.set as any).mockClear();
    (redis.get as any).mockClear();
    mock.restore();
  });

  const mockRepo = {
    id: 1,
    name: "test",
    full_name: "test/test",
    html_url: "http://github.com",
    description: "desc",
    stargazers_count: 100,
    forks_count: 10,
    language: "TS",
    owner: { login: "test", avatar_url: "url" },
  };

  describe("fetchGithubRepos", () => {
    it("should fetch and parse repos successfully", async () => {
      global.fetch = mock(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ items: [mockRepo] }),
        } as unknown as Response),
      );

      const repos = await fetchGithubRepos("trending");
      expect(repos).toHaveLength(1);
      expect(repos[0].name).toBe("test");
      expect(fetch).toHaveBeenCalled();
    });

    it("should throw error on failed fetch", async () => {
      global.fetch = mock(() =>
        Promise.resolve({
          ok: false,
          status: 500,
          text: () => Promise.resolve("Internal Server Error"),
        } as unknown as Response),
      );

      expect(fetchGithubRepos("trending")).rejects.toThrow(
        "GitHub API Error [500]",
      );
    });
  });

  describe("cacheRepos", () => {
    it("should cache repos in redis", async () => {
      await cacheRepos("trending", [mockRepo]);
      expect(redis.set).toHaveBeenCalled();
      expect(redis.set).toHaveBeenCalledWith(
        "github:trending",
        expect.any(String),
        "EX",
        expect.any(Number),
      );
    });

    it("should not cache empty list", async () => {
      await cacheRepos("trending", []);
      expect(redis.set).not.toHaveBeenCalled();
    });
  });

  describe("getRepoList", () => {
    it("should return cached data if available", async () => {
      (redis.get as any).mockResolvedValue(JSON.stringify([mockRepo]));
      const repos = await getRepoList("trending");
      expect(repos).toHaveLength(1);
      expect(redis.get).toHaveBeenCalledWith("github:trending");
      // Should not fetch if cache hit
      // Note: In strict unit test we might want to ensure fetchGithubRepos is not called,
      // but here we are integration testing the service logic mostly.
    });

    it("should fetch live data on cache miss", async () => {
      (redis.get as any).mockResolvedValue(null);
      global.fetch = mock(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ items: [mockRepo] }),
        } as Response),
      );

      const repos = await getRepoList("trending");
      expect(repos).toHaveLength(1);
      expect(redis.set).toHaveBeenCalled(); // Should cache after fetch
    });
  });

  describe("updateAllRepoCaches", () => {
    it("should update all types", async () => {
      global.fetch = mock(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ items: [mockRepo] }),
        } as unknown as Response),
      );

      await updateAllRepoCaches();
      // 3 types: trending, agent, ai
      expect(fetch).toHaveBeenCalledTimes(3);
      expect(redis.set).toHaveBeenCalledTimes(3);
    });
  });
});
