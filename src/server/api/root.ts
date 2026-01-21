/**
 * Root tRPC Router
 * Combines all routers into a single API
 */

import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";
import { contextRouter } from "@/server/api/routers/context";
import { userRouter } from "@/server/api/routers/user";
import { matchingRouter } from "@/server/api/routers/matching";
import { chatRouter } from "@/server/api/routers/chat";

/**
 * Main router with all sub-routers
 */
export const appRouter = createTRPCRouter({
  context: contextRouter,
  user: userRouter,
  matching: matchingRouter,
  chat: chatRouter,
});

// Export type definition for client
export type AppRouter = typeof appRouter;

/**
 * Create caller for server-side tRPC calls
 */
export const createCaller = createCallerFactory(appRouter);
