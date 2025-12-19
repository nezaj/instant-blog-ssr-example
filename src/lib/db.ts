import { init } from "@instantdb/react/nextjs";
import schema from "../instant.schema";

export const db = init({
  appId: process.env.NEXT_PUBLIC_INSTANT_APP_ID!,

  // For testing against a local instance of InstantDB
  // For apps on InstantDB Cloud, remove these two lines
  apiURI: "http://localhost:8888",
  websocketURI: "ws://localhost:8888/runtime/session",

  firstPartyPath: "/api/instant",
  schema,
  useDateObjects: true,
});
