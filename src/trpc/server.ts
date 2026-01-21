import "server-only";

/**
 * tRPC Server-Side Caller for React Server Components
 */

import { headers } from "next/headers";
import { cache } from "react";
import { createCaller } from "@/server/api/root";
import { createTRPCContext } from "@/server/api/trpc";

/**
 * Create cached tRPC context for server-side calls
 */
const createContext = cache(async () => {
  const heads = new Headers(await headers());
  heads.set("x-trpc-source", "rsc");

  return createTRPCContext({
    headers: heads,
  });
});

/**
 * Server-side tRPC caller
 * Use this in React Server Components to call tRPC procedures directly
 */
export const api = cache(async () => createCaller(await createContext()));
