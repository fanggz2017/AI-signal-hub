const getEnvVar = (key: string) => {
  const value = Bun.env[key];

  if (!value) {
    throw new Error(`❌ 致命错误: 环境变量 ${key} 未定义！请检查 .env 文件。`);
  }
  return value;
};

export const env = {
  PORT: Number(Bun.env.PORT || 3000),

  DATABASE_URL: getEnvVar("DATABASE_URL"),

  NODE_ENV: Bun.env.NODE_ENV || "development",
};
