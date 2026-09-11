import type { Context as ApiContext } from "@example-api/api/context";
import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";

import { getDb } from "./services";

export async function createContext(_opts: CreateExpressContextOptions): Promise<ApiContext> {
  const db = await getDb();
  return {
    db,
    auth: null,
    session: null,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
