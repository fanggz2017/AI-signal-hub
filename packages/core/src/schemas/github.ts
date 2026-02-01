import { z } from "zod";

export const GithubRepoSchema = z.object({
  id: z.number(),
  name: z.string(),
  full_name: z.string(),
  html_url: z.string(),
  description: z
    .string()
    .nullable()
    .transform((val) => val ?? ""),
  stargazers_count: z.number(),
  forks_count: z.number().optional().default(0),
  language: z
    .string()
    .nullable()
    .transform((val) => val ?? "Unknown"),
  owner: z.object({
    login: z.string(),
    avatar_url: z.string(),
  }),
});

export const QuerySchema = z.object({
  type: z.enum(["trending", "agent", "ai"]).default("trending"),
});

export type GithubRepo = z.infer<typeof GithubRepoSchema>;
export type RepoListType = z.infer<typeof QuerySchema>["type"];
