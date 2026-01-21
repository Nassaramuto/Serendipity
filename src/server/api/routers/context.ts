/**
 * Context Window tRPC Router
 * Handles CRUD operations for user context (profile, skills, preferences)
 */

import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { generateContextEmbedding } from "@/lib/ai/embeddings";

// Input schema for context update
const contextUpdateSchema = z.object({
  workingOn: z.string().max(2000).optional(),
  skills: z.array(z.string().max(50)).max(20).optional(),
  seeking: z.string().max(2000).optional(),
  bio: z.string().max(500).optional(),
  currentLocation: z.string().max(100).optional(),
  upcomingTravel: z.array(z.string().max(100)).max(10).optional(),
  openTo: z
    .array(
      z.enum([
        "collaborations",
        "advice",
        "mentorship",
        "cofounding",
        "hiring",
        "investment",
        "friendship",
      ])
    )
    .optional(),
});

export const contextRouter = createTRPCRouter({
  /**
   * Get current user's context window
   */
  get: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: { clerkId: ctx.session.userId },
      include: { contextWindow: true },
    });

    return user?.contextWindow ?? null;
  }),

  /**
   * Create or update user's context window
   */
  upsert: protectedProcedure
    .input(contextUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      // Get the user
      const user = await ctx.db.user.findUnique({
        where: { clerkId: ctx.session.userId },
      });

      if (!user) {
        throw new Error("User not found");
      }

      // Calculate completeness score (0-1)
      const fields = [
        input.workingOn,
        input.skills && input.skills.length > 0,
        input.seeking,
        input.bio,
        input.openTo && input.openTo.length > 0,
      ];
      const filledFields = fields.filter(Boolean).length;
      const completeness = filledFields / fields.length;

      // Upsert the context window
      const contextWindow = await ctx.db.contextWindow.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          ...input,
          completeness,
        },
        update: {
          ...input,
          completeness,
        },
      });

      // Generate embedding asynchronously (don't block the response)
      // In production, this should be a background job
      generateContextEmbedding({
        workingOn: input.workingOn ?? null,
        skills: input.skills ?? [],
        seeking: input.seeking ?? null,
        bio: input.bio ?? null,
        currentLocation: input.currentLocation ?? null,
        openTo: input.openTo ?? [],
      })
        .then(async (embedding) => {
          // Use raw SQL to update the vector embedding (Unsupported type)
          const embeddingStr = `[${embedding.join(",")}]`;
          await ctx.db.$executeRaw`
            UPDATE "ContextWindow"
            SET embedding = ${embeddingStr}::vector
            WHERE "userId" = ${user.id}
          `;
        })
        .catch((error) => {
          console.error("Failed to generate embedding:", error);
        });

      return contextWindow;
    }),

  /**
   * Update specific fields of context window
   */
  update: protectedProcedure
    .input(contextUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { clerkId: ctx.session.userId },
        include: { contextWindow: true },
      });

      if (!user?.contextWindow) {
        throw new Error("Context window not found");
      }

      // Merge with existing data for completeness calculation
      const merged = {
        workingOn: input.workingOn ?? user.contextWindow.workingOn,
        skills: input.skills ?? user.contextWindow.skills,
        seeking: input.seeking ?? user.contextWindow.seeking,
        bio: input.bio ?? user.contextWindow.bio,
        openTo: input.openTo ?? user.contextWindow.openTo,
      };

      const fields = [
        merged.workingOn,
        merged.skills && merged.skills.length > 0,
        merged.seeking,
        merged.bio,
        merged.openTo && merged.openTo.length > 0,
      ];
      const filledFields = fields.filter(Boolean).length;
      const completeness = filledFields / fields.length;

      const contextWindow = await ctx.db.contextWindow.update({
        where: { userId: user.id },
        data: {
          ...input,
          completeness,
        },
      });

      return contextWindow;
    }),

  /**
   * Check if user has completed onboarding
   */
  hasCompletedOnboarding: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: { clerkId: ctx.session.userId },
      include: { contextWindow: true },
    });

    // Consider onboarding complete if completeness >= 0.6
    return (user?.contextWindow?.completeness ?? 0) >= 0.6;
  }),
});
