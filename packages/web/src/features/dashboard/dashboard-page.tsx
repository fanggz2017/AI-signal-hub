import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, TrendingUp } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// 模拟数据 (后期从 API 获取)
const chartData = [
  { name: "Mon", react: 400, ai: 240 },
  { name: "Tue", react: 300, ai: 139 },
  { name: "Wed", react: 200, ai: 980 }, // AI 爆发
  { name: "Thu", react: 278, ai: 390 },
  { name: "Fri", react: 189, ai: 480 },
  { name: "Sat", react: 239, ai: 380 },
  { name: "Sun", react: 349, ai: 430 },
];

export default function DashboardPage() {
  return (
    <div className="p-6 space-y-6">
      {/* 1. 顶部：AI 智能日报 (最核心价值) */}
      <section>
        <Card className="border-indigo-500/20 bg-indigo-50/50 dark:bg-indigo-950/10">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-indigo-500" />
              <CardTitle className="text-lg">
                AI 每日情报摘要 · 2026-02-02
              </CardTitle>
            </div>
            <CardDescription>
              由 AI Agent 分析今日爬取的 1,240 条数据生成
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="prose dark:prose-invert max-w-none text-sm leading-relaxed">
              <p>
                <strong>今日重点：</strong> DeepSeek
                发布了全新的开源推理模型，在 GitHub 上引发了巨大的 Star
                增长（+2.5k）。 同时，前端领域 React 19 的 Server Actions
                讨论热度持续上升。
                <br />
                <strong>建议关注：</strong> 这是一个名为 "Auto-Coder"
                的新项目，试图解决全自动代码重构问题，值得加入关注列表。
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* 2. 中间区域：趋势图 + 关键数据 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 左侧：趋势图表 */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              技术热度趋势
            </CardTitle>
            <CardDescription>关键词：AI Agent vs React</CardDescription>
          </CardHeader>
          <CardContent className="h-75">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorAi" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="ai"
                  stroke="#8884d8"
                  fillOpacity={1}
                  fill="url(#colorAi)"
                />
                <Area
                  type="monotone"
                  dataKey="react"
                  stroke="#82ca9d"
                  fillOpacity={0.3}
                  fill="#82ca9d"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 右侧：关键事件列表 (Timeline) */}
        <Card>
          <CardHeader>
            <CardTitle>圈内大事件</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex gap-3 items-start pb-4 border-b last:border-0 last:pb-0"
                >
                  <div className="mt-1 min-w-2 h-2 rounded-full bg-red-500" />
                  <div>
                    <h4 className="text-sm font-medium">OpenAI 发布 Sora v2</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      2小时前 · TechCrunch
                    </p>
                    <Badge variant="secondary" className="mt-2 text-[10px]">
                      多模态
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3. 底部：热门项目 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>GitHub Trending Top 5</CardTitle>
          </CardHeader>
          <CardContent>{/* List Component Here */}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>热门 AI 工具</CardTitle>
          </CardHeader>
          <CardContent>{/* List Component Here */}</CardContent>
        </Card>
      </div>
    </div>
  );
}
