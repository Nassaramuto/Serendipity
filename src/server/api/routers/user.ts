/**
 * User tRPC Router
 * Handles user profile operations
 */

import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

export const userRouter = createTRPCRouter({
  /**
   * Get current user's profile
   */
  me: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: { clerkId: ctx.session.userId },
      include: {
        contextWindow: true,
        communityMemberships: {
          include: {
            community: true,
          },
        },
      },
    });

    return user;
  }),

  /**
   * Update user profile (name, photo)
   */
  update: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(100).optional(),
        photoUrl: z.string().url().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.update({
        where: { clerkId: ctx.session.userId },
        data: input,
      });

      return user;
    }),

  /**
   * Get user by ID (for viewing other profiles after mutual match)
   */
  getById: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      // First verify this is a mutual match
      const currentUser = await ctx.db.user.findUnique({
        where: { clerkId: ctx.session.userId },
      });

      if (!currentUser) {
        throw new Error("User not found");
      }

      // Check for mutual match
      const match = await ctx.db.match.findFirst({
        where: {
          OR: [
            { user1Id: currentUser.id, user2Id: input.userId },
            { user1Id: input.userId, user2Id: currentUser.id },
          ],
          revealedAt: { not: null }, // Must be a mutual match
        },
      });

      if (!match) {
        throw new Error("Not authorized to view this profile");
      }

      const user = await ctx.db.user.findUnique({
        where: { id: input.userId },
        include: {
          contextWindow: true,
        },
      });

      return user;
    }),
});
