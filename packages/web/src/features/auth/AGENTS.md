# Auth Feature Design & Architecture

## System Overview

The Authentication system implements a **Dual Token (JWT)** mechanism with **Role-Based Access Control (RBAC)** capabilities. It is designed for high security and seamless user experience (silent refresh).

- **Architecture**: Client-Server (Stateless API)
- **Protocol**: Bearer Token (Authorization Header)
- **Stack**:
  - **Core**: `@app/core` (Zod Schemas & Types)
  - **Backend**: Hono + Prisma + Redis + `hono/jwt`
  - **Frontend**: React + Axios (Interceptors) + TanStack Query

## Data Flow

### 1. Login Flow

1. User submits credentials (`LoginDTO`).
2. Server verifies against DB (argon2 hash).
3. Server generates:
   - `accessToken` (15m, HS256)
   - `refreshToken` (7d, HS256)
4. Client stores both tokens in `localStorage`.

### 2. Silent Refresh Flow (Client-Side)

1. Axios Interceptor detects `401 Unauthorized`.
2. Checks if request URL is NOT `/auth/login` or `/auth/refresh`.
3. **Pauses** original request and adds to `failedQueue`.
4. Sends request to `/auth/refresh` with `refreshToken`.
5. **On Success**:
   - Updates `accessToken` in `localStorage`.
   - Flushes `failedQueue` with new token.
   - Retries original request.
6. **On Failure**:
   - Clears all tokens.
   - Redirects to `/login`.

## Key Files Map

| Scope        | Path                                        | Responsibility                                                 |
| ------------ | ------------------------------------------- | -------------------------------------------------------------- |
| **Shared**   | `packages/core/src/schemas/auth.ts`         | Zod schemas for Login, Register, ResetPW. **Source of Truth**. |
| **Backend**  | `packages/api/src/services/auth.service.ts` | Business logic (Hash, Sign Token, Redis ops).                  |
| **Backend**  | `packages/api/src/routes/auth.route.ts`     | Route definitions & input validation.                          |
| **Backend**  | `packages/api/src/middlewares/auth.ts`      | JWT Verification Middleware (`authMiddleware`).                |
| **Frontend** | `packages/web/src/lib/request.ts`           | **Critical**: Axios interceptors & Queue logic.                |
| **Frontend** | `packages/web/src/features/auth/hooks/`     | React Hooks (`useLogin`, `useRegister`, etc.).                 |

## Implementation Rules (for AI)

1.  **Schema First**: Always modify `@app/core/src/schemas/auth.ts` first when changing data structures.
2.  **Error Handling**:
    - Backend: Use `HTTPException` with clear status codes.
    - Frontend: Use `toast.error` in mutation `onError` or global interceptor.
3.  **Security**:
    - Never log raw passwords.
    - Rate limits (Redis) are mandatory for `sendCode` interfaces.
4.  **State Management**:
    - Frontend Auth state is primarily managed via `localStorage` + `React Query` (server state).
    - Do not introduce complex Redux/Zustand stores unless necessary.

## Common Tasks

### Adding a new Auth Field (e.g., Phone Number)

1.  Update `RegisterSchema` in `@app/core`.
2.  Update Prisma Schema & Run Migration.
3.  Update `auth.service.ts` (register logic).
4.  Update Frontend Form (`register-form.tsx`).

### Modifying Token Expiry

- Update `ACCESS_TOKEN_EXP` or `REFRESH_TOKEN_EXP` constants in `packages/api/src/services/auth.service.ts`.
