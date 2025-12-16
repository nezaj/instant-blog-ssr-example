import { init } from "@instantdb/react/nextjs";
import schema from "../instant.schema";

export const db = init({
  appId: process.env.NEXT_PUBLIC_INSTANT_APP_ID!,
  apiURI: "http://localhost:8888",
  websocketURI: "ws://localhost:8888/runtime/session",
  cookieEndpoint: "/api/instant",
  schema,
  useDateObjects: true,
});
