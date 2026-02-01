Refactoring complete. I have:

1.  **Added Error Feedback for Login**: Modified `packages/web/src/features/auth/hooks/useLogin.ts` to include an `onError` handler. This ensures that when a user enters an incorrect account or password (resulting in a 401 error), a toast notification now appears with the error message.
2.  **Fixed Web Build Configuration**: Updated `packages/web/tsconfig.app.json` to exclude test files from the `@app/core` package. This resolves the `Cannot find module 'bun:test'` error during the web build process, ensuring the frontend compiles correctly.
3.  **Verified Stability**: The changes passed the pre-commit hooks, including linting and tests for `core`, `api`, and `web` packages.

You can now log in, and any authentication errors will be clearly displayed to the user.