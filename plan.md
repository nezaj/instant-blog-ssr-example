# SSR Microblog Implementation Plan

## Overview

Convert the existing todo app into a simple microblog with SSR support using the new Instant SSR features from PR #1905.

## Schema Design

Update the schema to support a microblog with:
- **posts**: Blog posts with title, content, createdAt
- **$users**: Already exists, will link posts to authors

## Implementation Steps

### 1. Update Schema (`instant.schema.ts`)

- Add `posts` entity with:
  - `title: i.string()`
  - `content: i.string()`
  - `createdAt: i.date().indexed()` (indexed for ordering)
- Add link between `posts` and `$users` (author relationship)
- Remove `todos` entity (no longer needed)

### 2. Push Schema Changes

```bash
pnpx instant-cli push schema --app $NEXT_PUBLIC_INSTANT_APP_ID --token $INSTANT_APP_ADMIN_TOKEN --yes
```

### 3. Create Route Handler (`src/app/api/instant/[...all]/route.ts`)

Set up the cookie sync endpoint:
```typescript
import { createInstantRouteHandler } from '@instantdb/react';

export const { GET, POST } = createInstantRouteHandler({
  appId: process.env.NEXT_PUBLIC_INSTANT_APP_ID!,
});
```

### 4. Update DB Client (`src/lib/db.ts`)

Configure for local backend and cookie endpoint:
```typescript
import { init } from '@instantdb/react/nextjs';
import schema from '../instant.schema';

export const db = init({
  appId: process.env.NEXT_PUBLIC_INSTANT_APP_ID!,
  cookieEndpoint: '/api/instant',
  apiURI: 'http://localhost:8888',
  websocketURI: 'ws://localhost:8888/runtime/session',
  schema,
  useDateObjects: true,
});
```

### 5. Create SSR Layout (`src/app/layout.tsx`)

Wrap app with `InstantSuspenseProvider`:
- Read `instant_user` cookie on server
- Pass user and config to provider
- Schema must be passed as JSON string for server components

### 6. Create Microblog Page (`src/app/page.tsx`)

Build a simple microblog with:
- **PostList component**: Uses `useSuspenseQuery` for SSR
- **CreatePost component**: Client-side form to add posts
- **PostCard component**: Display individual posts
- Posts ordered by `createdAt` descending

### 7. (Optional) Add Auth UI

Simple login/logout to test auth cookie syncing:
- Magic code login form
- Show current user
- Logout button

## File Structure

```
src/
  app/
    api/
      instant/
        [...all]/
          route.ts     # Cookie sync endpoint
    layout.tsx         # SSR provider wrapper
    page.tsx           # Microblog page with SSR
  lib/
    db.ts              # Instant client config
  instant.schema.ts    # Updated schema
```

## Testing Plan

1. Start the app with `pnpm dev`
2. Verify posts load via SSR (check page source for pre-rendered content)
3. Add new posts and verify real-time updates
4. Test auth flow (login, verify cookie, refresh page, check user persists)
5. Check that SSR works with authenticated queries
