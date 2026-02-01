import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import GithubTrendingPage from "../github-page";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as api from "../api/github.api";

// Mock API
vi.mock("../api/github.api", () => ({
  getGithubTrending: vi.fn(),
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe("GithubTrendingPage", () => {
  it("renders page title and columns", async () => {
    // Mock return value
    (api.getGithubTrending as any).mockResolvedValue([
      {
        id: 1,
        name: "mock-repo",
        full_name: "test/mock-repo",
        html_url: "url",
        description: "desc",
        stargazers_count: 100,
        forks_count: 10,
        language: "JS",
        owner: { login: "test", avatar_url: "url" },
      },
    ]);

    render(<GithubTrendingPage />, { wrapper });

    expect(screen.getByText("全网技术情报局")).toBeInTheDocument();
    expect(screen.getByText("近期飙升")).toBeInTheDocument();
    expect(screen.getByText("Agent 智能体")).toBeInTheDocument();
    expect(screen.getByText("AI 垂直榜")).toBeInTheDocument();

    await waitFor(() => {
        // Since we mock the same response for all 3 queries, "mock-repo" should appear multiple times
        // getAllByText returns an array
        expect(screen.getAllByText("mock-repo").length).toBeGreaterThan(0);
    });
  });
});
