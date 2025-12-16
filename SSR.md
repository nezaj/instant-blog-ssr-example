## Making an Instant App SSR Compatible

### 1. Create the route handler for cookie sync
```ts
// src/app/api/instant/[...all]/route.ts
import { createInstantRouteHandler } from "@instantdb/react";

export const { GET, POST } = createInstantRouteHandler({
  appId: process.env.NEXT_PUBLIC_INSTANT_APP_ID!,
});
```

### 2. Update db.ts to use the nextjs export
```ts
// src/lib/db.ts (NO "use client" directive)
import { init } from "@instantdb/react/nextjs";
import schema from "../instant.schema";

export const db = init({
  appId: process.env.NEXT_PUBLIC_INSTANT_APP_ID!,
  cookieEndpoint: "/api/instant",
  schema,
});
```

### 3. Create a client provider wrapper
```tsx
// src/InstantProvider.tsx
"use client";
import { InstantSuspenseProvider } from "@instantdb/react/nextjs";
import { db } from "./lib/db";

export const InstantProvider = ({ children, user }) => (
  <InstantSuspenseProvider user={user} db={db}>
    {children}
  </InstantSuspenseProvider>
);
```

### 4. Update layout to read cookie and wrap with provider
```tsx
// src/app/layout.tsx
import { cookies } from "next/headers";
import { InstantProvider } from "@/InstantProvider";

export default async function RootLayout({ children }) {
  const cookieStore = await cookies();
  const userJSON = cookieStore.get("instant_user");
  const user = userJSON ? JSON.parse(userJSON.value) : null;

  return (
    <html><body>
      <InstantProvider user={user}>{children}</InstantProvider>
    </body></html>
  );
}
```

### 5. Use `useSuspenseQuery` in your pages
```tsx
// src/app/page.tsx
"use client";
import { db } from "@/lib/db";

export default function Page() {
  const { data } = db.useSuspenseQuery({ posts: {} });
  // renders on server, no loading state needed
}
```

### Key Points

- **db.ts must NOT have `"use client"`** - allows import on both server and client
- **No `<Suspense>` wrapper needed** - the provider handles it internally
- **Cookie sync** - the route handler + `cookieEndpoint` config syncs auth state to cookies so the server can read it
