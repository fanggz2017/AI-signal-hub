# Project Overview & Development Guidelines

## 核心架构 (Core Architecture)
- **Monorepo**: 使用 Bun Workspaces 管理。
- **Runtime**: 优先使用 **Bun** 作为运行时和包管理工具。

## 技术栈 (Tech Stack)

### 后端服务 (`packages/api`)
- **框架**: [Hono](https://hono.dev/) (高性能 Web 标准框架)。
- **数据库**: PostgreSQL + [Prisma ORM](https://www.prisma.io/)。
- **缓存**: Redis (使用 `ioredis`)。
- **验证**: 使用 [Zod](https://zod.dev/) 进行输入验证及模式定义。
- **架构**: 采用分层结构：`Routes` (控制器) -> `Services` (业务逻辑) -> `Prisma/Redis` (数据访问)。

### 前端应用 (`packages/web`)
- **框架**: React 19 + Vite 7。
- **路由**: React Router 7。
- **数据流**: TanStack Query (React Query) v5。
- **样式**: Tailwind CSS v4 + Radix UI (shadcn/ui 风格)。
- **表单**: React Hook Form + Zod。
- **组织方式**: **基于特性的目录结构 (Feature-based)**，位于 `src/features/` 下。

### 共享模块 (`packages/core`)
- **用途**: 存储前后端通用的 Zod Schema 和类型定义。
- **引用**: 后端和前端均应从 `@app/core` 导入共享逻辑。

## 开发规范 (Development Guidelines)

1.  **类型安全**: 必须定义完整的 TypeScript 类型。所有 API 接口需使用 Zod 进行 Schema 验证。
2.  **代码组织**:
    - 前端新功能应在 `packages/web/src/features/[feature-name]` 中实现。
    - 后端新逻辑应遵循 `routes` -> `services` 的调用链路。
3.  **共享逻辑**: 涉及到前后端交互的数据结构，优先在 `packages/core` 中定义 Schema。
4.  **UI 组件**: 优先复用 `packages/web/src/components/ui/` 中的基础组件。
5.  **数据库操作**: 
    - 修改 `schema.prisma` 后，需运行 `bun run db:migrate`。
    - 使用 `packages/api/src/db/prisma.ts` 中导出的 Prisma 实例。
6.  **响应格式**: 统一使用后端定义的 Result 工具类进行响应返回（参考 `packages/api/src/utils/result.ts`）。
7.  **样式规范**: 使用 Tailwind CSS v4 的现代语法。

## 鉴权方案 (Authentication)
- **机制**: 双 Token (JWT)。
    - **Access Token**: 有效期 15 分钟，用于请求接口，Header 携带 `Authorization: Bearer <token>`。
    - **Refresh Token**: 有效期 7 天，用于在 Access Token 过期时换取新 Token。
- **流程**: 
    - 前端拦截器自动处理 401 响应 -> 调用刷新接口 -> 重试原请求。
    - 刷新失败则强制跳转登录页。
- **安全**: Token 签名算法固定为 `HS256`。

## 常用命令
- `bun dev:all`: 启动前后端开发服务。
- `bun run db:up`: 启动 Docker 数据库环境。
- `bun run --filter @app/api db:migrate`: 执行数据库迁移。
