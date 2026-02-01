import { describe, expect, it } from "bun:test";
import { GithubRepoSchema, QuerySchema } from "../schemas/github";

describe("Github Schemas", () => {
  describe("GithubRepoSchema", () => {
    it("should validate a valid repo object", () => {
      const validRepo = {
        id: 123,
        name: "test-repo",
        full_name: "user/test-repo",
        html_url: "https://github.com/user/test-repo",
        description: "A test repo",
        stargazers_count: 100,
        forks_count: 10,
        language: "TypeScript",
        owner: {
          login: "user",
          avatar_url: "https://example.com/avatar.png",
        },
      };
      const result = GithubRepoSchema.safeParse(validRepo);
      expect(result.success).toBe(true);
    });

    it("should handle null description and language", () => {
      const repoWithNulls = {
        id: 123,
        name: "test-repo",
        full_name: "user/test-repo",
        html_url: "https://github.com/user/test-repo",
        description: null,
        stargazers_count: 100,
        owner: {
          login: "user",
          avatar_url: "https://example.com/avatar.png",
        },
        language: null,
      };
      const result = GithubRepoSchema.parse(repoWithNulls);
      expect(result.description).toBe("");
      expect(result.language).toBe("Unknown");
    });

    it("should use default forks_count if missing", () => {
      const repoWithoutForks = {
        id: 123,
        name: "test-repo",
        full_name: "user/test-repo",
        html_url: "https://github.com/user/test-repo",
        description: "desc",
        stargazers_count: 100,
        language: "JS",
        owner: {
          login: "user",
          avatar_url: "https://example.com/avatar.png",
        },
      };
      const result = GithubRepoSchema.parse(repoWithoutForks);
      expect(result.forks_count).toBe(0);
    });
  });

  describe("QuerySchema", () => {
    it("should validate valid types", () => {
      expect(QuerySchema.safeParse({ type: "trending" }).success).toBe(true);
      expect(QuerySchema.safeParse({ type: "agent" }).success).toBe(true);
      expect(QuerySchema.safeParse({ type: "ai" }).success).toBe(true);
    });

    it("should default to trending if type is missing", () => {
      const result = QuerySchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.type).toBe("trending");
      }
    });

    it("should fail on invalid types", () => {
      expect(QuerySchema.safeParse({ type: "invalid" }).success).toBe(false);
    });
  });
});
