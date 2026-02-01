import { useQuery } from "@tanstack/react-query";
import { getGithubTrending } from "./api/github.api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Star, ExternalLink, GitFork } from "lucide-react";

const DashboardPage = () => {
  const {
    data: repos,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["github-trending"],
    queryFn: getGithubTrending,
  });

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          欢迎回来，这里是今日的 GitHub 热门趋势 (每日 7:00 更新)
        </p>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="flex flex-col">
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent className="flex-1">
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : isError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
          获取数据失败，请稍后重试。
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {repos?.map((repo) => (
            <Card
              key={repo.id}
              className="flex flex-col hover:shadow-lg transition-shadow"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <img
                      src={repo.owner.avatar_url}
                      alt={repo.owner.login}
                      className="h-8 w-8 rounded-full"
                    />
                    <div className="space-y-1">
                      <CardTitle className="text-base leading-none">
                        <a
                          href={repo.html_url}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:underline flex items-center gap-1"
                        >
                          {repo.name}
                          <ExternalLink className="h-3 w-3 opacity-50" />
                        </a>
                      </CardTitle>
                      <CardDescription className="text-xs">
                        {repo.full_name}
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-between gap-4">
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {repo.description || "暂无描述"}
                </p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      {repo.stargazers_count}
                    </div>
                    {repo.forks_count !== undefined && (
                      <div className="flex items-center gap-1">
                        <GitFork className="h-3 w-3 text-muted-foreground" />
                        {repo.forks_count}
                      </div>
                    )}
                    {repo.language && (
                      <div className="flex items-center gap-1">
                        <span className="h-2 w-2 rounded-full bg-blue-500" />
                        {repo.language}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
