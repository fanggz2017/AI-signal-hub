import cron from "node-cron";
import { updateTrendingCache } from "@/services/github.service";

// 每天早上 7:00 执行
export const setupCronJobs = () => {
  cron.schedule("0 7 * * *", () => {
    updateTrendingCache();
  });
  console.log("✅ Cron jobs scheduled: GitHub Trending @ 07:00 AM");
};
