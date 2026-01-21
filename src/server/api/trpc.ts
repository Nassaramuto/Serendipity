/**
 * tRPC configuration with Clerk authentication integration
 */

import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";
import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/server/db";

/**
 * Context creation for tRPC procedures
 * Includes database client and auth session
 */
export const createTRPCContext = async (opts: { headers: Headers }) => {
  const session = await auth();

  return {
    db,
    session,
    ...opts,
  };
};

/**
 * Initialize tRPC with superjson transformer for Date/BigInt support
 */
const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

/**
 * Create caller factory for server-side calls
 */
export const createCallerFactory = t.createCallerFactory;

/**
 * Create tRPC router
 */
export const createTRPCRouter = t.router;

/**
 * Public procedure - no authentication required
 */
export const publicProcedure = t.procedure;

/**
 * Sync user from Clerk to database if they don't exist
 */
async function syncUserToDatabase(clerkUserId: string) {
  // Check if user exists
  const existingUser = await db.user.findUnique({
    where: { clerkId: clerkUserId },
  });

  if (existingUser) {
    return existingUser;
  }

  // Get user details from Clerk
  const clerkUser = await currentUser();

  if (!clerkUser) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "User not found in Clerk" });
  }

  // Create user in database
  const newUser = await db.user.create({
    data: {
      clerkId: clerkUser.id,
      email: clerkUser.emailAddresses[0]?.emailAddress ?? "",
      name: [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ").trim() || null,
      photoUrl: clerkUser.imageUrl,
    },
  });

  console.log(`Created new user: ${newUser.id} (${newUser.email})`);
  return newUser;
}

/**
 * Protected procedure - requires authenticated user
 * Automatically syncs user to database on first call
 */
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.session?.userId) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  // Sync user to database (creates if doesn't exist)
  await syncUserToDatabase(ctx.session.userId);

  return next({
    ctx: {
      session: { ...ctx.session, userId: ctx.session.userId },
    },
  });
});
