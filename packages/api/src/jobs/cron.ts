import cron from "node-cron";
import { updateAllRepoCaches } from "@/services/github.service";

export const setupCronJobs = () => {
  cron.schedule("0 7 * * *", () => {
    updateAllRepoCaches();
  });
};
