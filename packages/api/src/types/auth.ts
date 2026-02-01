import type { JWTPayload } from "@app/core";

export interface AppEnv {
  Variables: {
    user: JWTPayload;
  };
  Bindings: {
    JWT_SECRET: string;
    CORS_ORIGIN: string;
    DATABASE_URL: string;
  };
}
