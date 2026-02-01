import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, GitFork } from "lucide-react";
import { type GithubRepo, type RepoListType } from "@app/core";
import { formatNumber } from "@/utils/format";

interface RepoListColumnProps {
  title: string;
  icon: React.ElementType;
  data?: GithubRepo[];
  isLoading: boolean;
  type: RepoListType;
}

export const RepoListColumn = ({
  title,
  icon: Icon,
  data,
  isLoading,
  type,
}: RepoListColumnProps) => {
  const headerStyles = {
    trending: {
      bg: "bg-orange-500/10",
      text: "text-orange-600 dark:text-orange-400",
    },
    agent: { bg: "bg-cyan-500/10", text: "text-cyan-600 dark:text-cyan-400" },
    ai: {
      bg: "bg-purple-500/10",
      text: "text-purple-600 dark:text-purple-400",
    },
  };

  const activeStyle = headerStyles[type] || headerStyles.trending;

  return (
    <div className="space-y-3.5">
      <div
        className={`flex items-center gap-2 p-2 rounded-lg ${activeStyle.bg} ${activeStyle.text}`}
      >
        <Icon className="h-4 w-4" />
        <h2 className="font-bold text-sm">{title}</h2>
      </div>

      <div className="space-y-3.5">
        {isLoading
          ? Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="h-20 w-full bg-muted/60 animate-pulse rounded-md"
              />
            ))
          : data?.slice(0, 10).map((repo, index) => (
              <a
                key={repo.id}
                href={repo.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <Card className="group p-3.5 cursor-pointer border-border/60 bg-card/50 hover:bg-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0 overflow-hidden">
                      <span
                        className={`text-[10px] font-mono h-4 w-4 flex-none flex items-center justify-center rounded-[3px] ${
                          index < 3
                            ? `${activeStyle.bg} ${activeStyle.text} font-bold`
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {index + 1}
                      </span>

                      <h3 className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                        {repo.name}
                      </h3>
                    </div>

                    {repo.language && repo.language !== "Unknown" && (
                      <Badge
                        variant="secondary"
                        className="text-[9px] h-4 px-1 font-normal text-muted-foreground bg-muted/50 shrink-0"
                      >
                        {repo.language}
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-2 gap-4">
                    <p className="text-[11px] text-muted-foreground/60 truncate flex-1">
                      {repo.description || "暂无描述"}
                    </p>

                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-mono shrink-0">
                      <div className="flex items-center gap-0.5">
                        <Star className="h-3 w-3 fill-amber-400/80 text-amber-400/80" />
                        <span>{formatNumber(repo.stargazers_count)}</span>
                      </div>
                      <div className="flex items-center gap-0.5">
                        <GitFork className="h-3 w-3 opacity-60" />
                        <span>{formatNumber(repo.forks_count || 0)}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              </a>
            ))}
      </div>
    </div>
  );
};
