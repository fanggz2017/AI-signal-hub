import { useQuery } from "@tanstack/react-query";
import { TrendingUp, Trophy, Bot } from "lucide-react";
import { getGithubTrending } from "./api/github.api";
import { RepoListColumn } from "./components/report-list-column";

const GithubTrendingPage = () => {
  const trendingQuery = useQuery({
    queryKey: ["github-trending", "trending"],
    queryFn: () => getGithubTrending("trending"),
  });

  const popularQuery = useQuery({
    queryKey: ["github-trending", "agent"],
    queryFn: () => getGithubTrending("agent"),
  });

  const aiQuery = useQuery({
    queryKey: ["github-trending", "ai"],
    queryFn: () => getGithubTrending("ai"),
  });

  return (
    <div className="container mx-auto p-6 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">全网技术情报局</h1>
        <p className="text-muted-foreground mt-2">
          每日 07:00 更新 · 聚合 GitHub 全球实时趋势
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <RepoListColumn
          title="近期飙升"
          icon={TrendingUp}
          type="trending"
          data={trendingQuery.data}
          isLoading={trendingQuery.isLoading}
        />
        <RepoListColumn
          title="Agent 智能体"
          icon={Trophy}
          type="agent"
          data={popularQuery.data}
          isLoading={popularQuery.isLoading}
        />

        <RepoListColumn
          title="AI 垂直榜"
          icon={Bot}
          type="ai"
          data={aiQuery.data}
          isLoading={aiQuery.isLoading}
        />
      </div>
    </div>
  );
};

export default GithubTrendingPage;
