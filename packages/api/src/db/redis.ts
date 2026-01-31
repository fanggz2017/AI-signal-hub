import Redis from "ioredis";

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

if (!redisUrl && process.env.NODE_ENV !== "test") {
  throw new Error("❌ 致命错误: 环境变量 REDIS_URL 未定义！请检查 .env 文件。");
}

const redis = new Redis(redisUrl);

redis.on("error", (err: unknown) => {
  if (process.env.NODE_ENV !== "test") {
    console.error("❌ Redis 连接失败:", err);
  }
});

redis.on("connect", () => {
  if (process.env.NODE_ENV !== "test") {
    console.log("✅ Redis 连接成功");
  }
});

export default redis;
