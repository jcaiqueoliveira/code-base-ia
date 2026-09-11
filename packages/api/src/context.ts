import type { Database } from "@example-api/db";

export type Context = {
  auth: null;
  session: null;
  db: Database;
};
