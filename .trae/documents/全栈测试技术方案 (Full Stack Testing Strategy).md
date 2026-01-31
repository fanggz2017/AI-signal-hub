# 全栈测试技术方案 (Full Stack Testing Strategy)

基于当前 Monorepo 架构 (Bun + Hono + React + Vite)，制定以下测试方案：

## 1. 技术选型 (Tech Stack)

| 范围 (Scope) | 工具 (Tool) | 选择理由 (Reason) |
| :--- | :--- | :--- |
| **Backend** (`@app/api`) | **Bun Test** | Bun 原生集成，无需配置，运行速度极快，完美支持 TypeScript 和 Hono。 |
| **Frontend** (`@app/web`) | **Vitest** + **React Testing Library** | Vite 生态的首选测试框架，兼容 Jest API，与 Vite 配置无缝集成。 |
| **Shared** (`@app/core`) | **Bun Test** | 纯逻辑库，使用 Bun Test 最为轻量高效。 |
| **E2E** (端到端) | **Playwright** | 微软出品，现代、稳定、支持多浏览器，适合全链路流程测试。 |

## 2. 详细实施方案 (Implementation Details)

### 2.1 后端测试 (`packages/api`)
*   **测试类型**: 单元测试 (针对 Services)、集成测试 (针对 Routes)。
*   **依赖**: 仅需 `bun-types` (已存在)，利用内置 `bun:test`。
*   **策略**:
    *   **Services**: Mock Prisma 依赖，测试业务逻辑覆盖率。
    *   **Routes**: 使用 Hono 的 `app.request` 发起模拟请求，连接测试数据库进行验证。
*   **目录**: 测试文件与源码同级，如 `auth.service.test.ts`。

### 2.2 前端测试 (`packages/web`)
*   **测试类型**: 组件测试 (Component)、Hooks 测试、工具函数测试。
*   **依赖**: `vitest`, `@testing-library/react`, `@testing-library/dom`, `jsdom`。
*   **覆盖率工具**: `@vitest/coverage-v8`。
*   **配置**: 在 `vite.config.ts` 中添加 `test` 字段，需指定 `environment: 'jsdom'` 和 `setupFiles`。
*   **策略**:
    *   **UI Components**: 测试渲染正确性、交互响应 (Click, Input)。
    *   **Hooks**: 测试状态变化逻辑。

### 2.3 共享库测试 (`packages/core`)
*   **测试类型**: 单元测试。
*   **配置**: 需在 `tsconfig.json` 中添加 `"types": ["bun"]` 以支持 `bun:test` 类型。
*   **策略**: 验证 Zod Schema 的解析 (Parse) 和错误抛出 (Validation Error) 是否符合预期。

### 2.4 端到端测试 (E2E)
*   **位置**: 项目根目录新建 `e2e` 文件夹。
*   **策略**: 模拟真实用户行为，覆盖 "注册 -> 登录 -> 访问 Dashboard" 等核心链路。

## 3.  CI/CD 集成 (GitHub Actions)
*   配置 Workflow，在 PR 提交时自动运行：
    1.  `bun install`
    2.  `bun run lint` (代码检查)
    3.  `bun test` (后端 & Core 测试)
    4.  `bun run test:web` (前端测试)

## 4. 当前测试覆盖率 (Current Coverage)
*统计时间: 2026-01-31*

*   **Core (`@app/core`)**: **100%** (已完全覆盖 Auth Schema)
*   **Web (`@app/web`)**: **86.27%** (UI 组件覆盖率良好，部分回调逻辑待补充)
*   **API (`@app/api`)**: **42.44%** (Auth Service 仅覆盖登录/注册，Refresh/Reset/SendCode 待补充)

## 5. 实施注意事项 (Implementation Notes)
*   **Core 模块**: 必须安装 `@types/bun` 并更新 `tsconfig.json`，否则会报错找不到 `bun:test`。
*   **Web 模块**: 运行覆盖率检查需要安装 `@vitest/coverage-v8`。
*   **API 模块**: 运行测试时可能会出现 Redis 连接错误日志（因 ioredis 自动连接特性），但不影响 Mock 测试结果。

## 6. 执行计划 (Action Plan)
- [x] **配置环境**:
    - [x] 在 `@app/web` 安装 Vitest 及相关库。
    - [x] 在 `@app/api` 和 `@app/core` 确认 Bun Test 可用性。
- [x] **编写示例**:
    - [x] **Core**: 编写 `auth.schema.test.ts`。
    - [x] **API**: 编写 `auth.service.test.ts` (Unit)。
    - [x] **Web**: 编写 `login-form.test.tsx`。
- [x] **脚本配置**: 在根目录 `package.json` 统一添加 `test` 命令。
- [ ] **提升覆盖率**:
    - [ ] API: 补充 Refresh Token、Reset Password、Send Code 的测试用例。
    - [ ] Web: 补充 Hooks 测试。
