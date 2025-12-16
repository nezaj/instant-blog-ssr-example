# Getting Started

Instructions for running this project after cloning.

## 1. Install dependencies

```bash
pnpm install
```

## 2. Login to Instant

```bash
npx instant-cli login
```

This opens a browser to authenticate with your Instant account.

## 3. Create a new Instant app

```bash
npx instant-cli init-without-files --title "My SSR App"
```

This outputs your `APP_ID` and `ADMIN_TOKEN`. Save these for the next step.

## 4. Set up environment variables

Create a `.env` file:

```bash
NEXT_PUBLIC_INSTANT_APP_ID=<your-app-id>
INSTANT_APP_ADMIN_TOKEN=<your-admin-token>
```

## 5. Push the schema

```bash
npx instant-cli push schema
```

This pushes the schema defined in `instant.schema.ts` to your new app.

## 6. Run the dev server

```bash
pnpm dev
```

Visit http://localhost:3000 to see the app.

## Verifying SSR

1. Open the page in Chrome
2. Open DevTools (`Cmd+Option+I`)
3. Open Command Menu (`Cmd+Shift+P`)
4. Type "disable javascript" and select it
5. Refresh the page

If SSR is working, you'll still see the content (not a loading state).
