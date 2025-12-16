# SSR Microblog Task

My teammate just put up a PR for adding SSR to Instant:

https://github.com/instantdb/instant/pull/1905

I currently have the backend server running with their branch.

I want to test this in my current app. Can you adjust this codebase into a microblog (no-need for fancy styles) that uses SSR.

## Key PR Changes Reference

The PR adds the following key features:

1. **Route Handler** (`createInstantRouteHandler`): Syncs auth state to cookies
2. **NextJS SSR Support** (`@instantdb/react/nextjs`): New export with `InstantSuspenseProvider` and `init`
3. **`useSuspenseQuery`**: Hook for SSR-compatible queries
4. **`cookieEndpoint` config**: Tells the client where to sync auth cookies
5. **Server-side user reading**: Read user from `instant_user` cookie on the server

## Backend Configuration

The backend is running locally at:
- API: `http://localhost:8888`
- WebSocket: `ws://localhost:8888/runtime/session`
