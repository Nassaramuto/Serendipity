/**
 * Matching tRPC Router
 * Handles match retrieval, generation, and interest expression
 */

import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import {
  calculateMatchScore,
  findTopMatches,
  MATCH_THRESHOLD,
  type ContextWindow as MatchContextWindow,
} from "@/lib/ai/matching";
import { generateMatchReason } from "@/lib/ai/chat";

export const matchingRouter = createTRPCRouter({
  /**
   * Get all matches for the current user
   */
  getMatches: protectedProcedure
    .input(
      z
        .object({
          status: z.enum(["pending", "interested", "mutual", "passed"]).optional(),
          limit: z.number().min(1).max(50).default(20),
          cursor: z.string().optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { clerkId: ctx.session.userId },
      });

      if (!user) {
        throw new Error("User not found");
      }

      // Build where clause based on status filter
      const baseWhere = {
        OR: [{ user1Id: user.id }, { user2Id: user.id }],
      };

      let statusFilter = {};
      if (input?.status === "pending") {
        // Matches where user hasn't responded
        statusFilter = {
          OR: [
            { user1Id: user.id, user1Interested: null },
            { user2Id: user.id, user2Interested: null },
          ],
        };
      } else if (input?.status === "interested") {
        // Matches where user expressed interest but not mutual yet
        statusFilter = {
          revealedAt: null,
          OR: [
            { user1Id: user.id, user1Interested: true },
            { user2Id: user.id, user2Interested: true },
          ],
        };
      } else if (input?.status === "mutual") {
        // Mutual matches (revealed)
        statusFilter = { revealedAt: { not: null } };
      } else if (input?.status === "passed") {
        // Passed matches
        statusFilter = {
          OR: [
            { user1Id: user.id, user1Interested: false },
            { user2Id: user.id, user2Interested: false },
          ],
        };
      }

      const matches = await ctx.db.match.findMany({
        where: {
          ...baseWhere,
          ...statusFilter,
        },
        include: {
          user1: {
            include: { contextWindow: true },
          },
          user2: {
            include: { contextWindow: true },
          },
          conversation: true,
        },
        orderBy: { relevanceScore: "desc" },
        take: input?.limit ?? 20,
        cursor: input?.cursor ? { id: input.cursor } : undefined,
        skip: input?.cursor ? 1 : 0,
      });

      // Transform to include only the "other" user's data
      const transformedMatches = matches.map((match) => {
        const isUser1 = match.user1Id === user.id;
        const otherUser = isUser1 ? match.user2 : match.user1;
        const myInterest = isUser1 ? match.user1Interested : match.user2Interested;
        const theirInterest = isUser1 ? match.user2Interested : match.user1Interested;

        return {
          id: match.id,
          otherUser: {
            id: otherUser.id,
            name: match.revealedAt ? otherUser.name : null, // Only reveal name after mutual
            photoUrl: match.revealedAt ? otherUser.photoUrl : null,
            contextWindow: otherUser.contextWindow,
          },
          relevanceScore: match.relevanceScore,
          relevanceReason: match.relevanceReason,
          myInterest,
          theirInterest,
          isRevealed: !!match.revealedAt,
          conversationId: match.conversation?.id,
          createdAt: match.createdAt,
        };
      });

      return {
        matches: transformedMatches,
        nextCursor: matches.length === (input?.limit ?? 20) ? matches[matches.length - 1]?.id : null,
      };
    }),

  /**
   * Express interest (or pass) on a match
   */
  expressInterest: protectedProcedure
    .input(
      z.object({
        matchId: z.string(),
        interested: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { clerkId: ctx.session.userId },
      });

      if (!user) {
        throw new Error("User not found");
      }

      const match = await ctx.db.match.findUnique({
        where: { id: input.matchId },
      });

      if (!match) {
        throw new Error("Match not found");
      }

      // Determine which user field to update
      const isUser1 = match.user1Id === user.id;
      if (!isUser1 && match.user2Id !== user.id) {
        throw new Error("Not authorized to update this match");
      }

      const updateField = isUser1 ? "user1Interested" : "user2Interested";
      const otherField = isUser1 ? "user2Interested" : "user1Interested";

      // Update the interest
      const updatedMatch = await ctx.db.match.update({
        where: { id: input.matchId },
        data: { [updateField]: input.interested },
      });

      // Check for mutual interest
      const otherInterest = updatedMatch[otherField as keyof typeof updatedMatch];
      const isMutual = input.interested && otherInterest === true;

      if (isMutual && !updatedMatch.revealedAt) {
        // Create conversation and reveal
        await ctx.db.$transaction([
          ctx.db.match.update({
            where: { id: input.matchId },
            data: { revealedAt: new Date() },
          }),
          ctx.db.conversation.create({
            data: { matchId: input.matchId },
          }),
        ]);

        // TODO: Send notification emails to both users

        return { status: "mutual", matchId: input.matchId };
      }

      return {
        status: input.interested ? "interested" : "passed",
        matchId: input.matchId,
      };
    }),

  /**
   * Get today's digest matches
   */
  getDailyDigest: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: { clerkId: ctx.session.userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get matches created today that user hasn't responded to
    const matches = await ctx.db.match.findMany({
      where: {
        OR: [
          { user1Id: user.id, user1Interested: null },
          { user2Id: user.id, user2Interested: null },
        ],
        createdAt: {
          gte: today,
          lt: tomorrow,
        },
      },
      include: {
        user1: { include: { contextWindow: true } },
        user2: { include: { contextWindow: true } },
      },
      orderBy: { relevanceScore: "desc" },
      take: 5,
    });

    // Transform matches
    return matches.map((match) => {
      const isUser1 = match.user1Id === user.id;
      const otherUser = isUser1 ? match.user2 : match.user1;

      return {
        id: match.id,
        otherUser: {
          contextWindow: otherUser.contextWindow,
        },
        relevanceScore: match.relevanceScore,
        relevanceReason: match.relevanceReason,
      };
    });
  }),

  /**
   * Generate new matches for the current user
   * Finds potential matches from users with embeddings and creates match records
   */
  generateMatches: protectedProcedure
    .input(
      z
        .object({
          limit: z.number().min(1).max(20).default(5),
        })
        .optional()
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { clerkId: ctx.session.userId },
        include: { contextWindow: true },
      });

      if (!user) {
        throw new Error("User not found");
      }

      if (!user.contextWindow) {
        throw new Error("Please complete your profile first");
      }

      // Check if user has an embedding using raw SQL (since it's an Unsupported type)
      const userEmbeddingResult = await ctx.db.$queryRaw<
        Array<{ embedding: number[] | null }>
      >`
        SELECT embedding::text::float[] as embedding
        FROM "ContextWindow"
        WHERE "userId" = ${user.id}
      `;

      const userEmbedding = userEmbeddingResult[0]?.embedding;

      if (!userEmbedding) {
        throw new Error("Profile embedding not ready yet. Please try again in a moment.");
      }

      // Get all users with embeddings (excluding current user and already matched users)
      const existingMatchUserIds = await ctx.db.match.findMany({
        where: {
          OR: [{ user1Id: user.id }, { user2Id: user.id }],
        },
        select: {
          user1Id: true,
          user2Id: true,
        },
      });

      const excludeUserIds = new Set([
        user.id,
        ...existingMatchUserIds.flatMap((m) => [m.user1Id, m.user2Id]),
      ]);

      // Get candidates with embeddings using raw SQL to access the vector field
      const candidatesWithEmbeddings = await ctx.db.$queryRaw<
        Array<{
          userId: string;
          workingOn: string | null;
          skills: string[];
          seeking: string | null;
          currentLocation: string | null;
          upcomingTravel: string[];
          openTo: string[];
          embedding: number[];
        }>
      >`
        SELECT
          "userId",
          "workingOn",
          skills,
          seeking,
          "currentLocation",
          "upcomingTravel",
          "openTo",
          embedding::text::float[] as embedding
        FROM "ContextWindow"
        WHERE embedding IS NOT NULL
          AND "userId" NOT IN (${excludeUserIds.size > 0 ? Array.from(excludeUserIds).join("','") : "''"})
          AND completeness >= 0.4
      `;

      // Get user info for candidates
      const candidateUserIds = candidatesWithEmbeddings.map((c) => c.userId);
      const candidateUsers = await ctx.db.user.findMany({
        where: { id: { in: candidateUserIds } },
        include: { communityMemberships: true },
      });
      const candidateUsersMap = new Map(candidateUsers.map((u) => [u.id, u]));

      if (candidatesWithEmbeddings.length === 0) {
        return { matches: [], message: "No new candidates available" };
      }

      // Get user's community memberships for graph signals
      const userCommunities = await ctx.db.communityMembership.findMany({
        where: { userId: user.id },
        select: { communityId: true },
      });
      const userCommunityIds = new Set(userCommunities.map((c) => c.communityId));

      // Transform candidates to match algorithm format
      const userContext: MatchContextWindow = {
        userId: user.id,
        workingOn: user.contextWindow.workingOn,
        skills: user.contextWindow.skills,
        seeking: user.contextWindow.seeking,
        currentLocation: user.contextWindow.currentLocation,
        upcomingTravel: user.contextWindow.upcomingTravel,
        openTo: user.contextWindow.openTo,
        embedding: userEmbedding,
      };

      const candidateContexts: MatchContextWindow[] = candidatesWithEmbeddings.map((c) => ({
        userId: c.userId,
        workingOn: c.workingOn,
        skills: c.skills,
        seeking: c.seeking,
        currentLocation: c.currentLocation,
        upcomingTravel: c.upcomingTravel,
        openTo: c.openTo,
        embedding: c.embedding,
      }));

      // Calculate shared communities for each candidate
      const sharedCommunitiesMap = new Map<string, number>();
      for (const candidate of candidatesWithEmbeddings) {
        const candidateUser = candidateUsersMap.get(candidate.userId);
        const candidateCommunityIds = candidateUser?.communityMemberships.map(
          (m) => m.communityId
        ) || [];
        const shared = candidateCommunityIds.filter((id) =>
          userCommunityIds.has(id)
        ).length;
        sharedCommunitiesMap.set(candidate.userId, shared);
      }

      // Find top matches
      const topMatches = findTopMatches(
        userContext,
        candidateContexts,
        sharedCommunitiesMap,
        input?.limit ?? 5
      );

      // Create match records with AI-generated reasons
      const createdMatches = [];

      for (const matchScore of topMatches) {
        const candidateContext = candidatesWithEmbeddings.find(
          (c) => c.userId === matchScore.userId
        );

        if (!candidateContext) continue;

        // Generate AI reason for the match
        let relevanceReason = "You might have interesting things to discuss!";
        try {
          relevanceReason = await generateMatchReason(
            {
              workingOn: user.contextWindow.workingOn,
              skills: user.contextWindow.skills,
              seeking: user.contextWindow.seeking,
              currentLocation: user.contextWindow.currentLocation,
              openTo: user.contextWindow.openTo,
            },
            {
              workingOn: candidateContext.workingOn,
              skills: candidateContext.skills,
              seeking: candidateContext.seeking,
              currentLocation: candidateContext.currentLocation,
              openTo: candidateContext.openTo,
            },
            matchScore
          );
        } catch (error) {
          console.error("Failed to generate match reason:", error);
        }

        // Create the match record
        const match = await ctx.db.match.create({
          data: {
            user1Id: user.id,
            user2Id: matchScore.userId,
            relevanceScore: matchScore.totalScore,
            relevanceReason,
          },
          include: {
            user2: {
              include: { contextWindow: true },
            },
          },
        });

        createdMatches.push({
          id: match.id,
          otherUser: {
            contextWindow: match.user2.contextWindow,
          },
          relevanceScore: match.relevanceScore,
          relevanceReason: match.relevanceReason,
        });
      }

      return {
        matches: createdMatches,
        message: `Found ${createdMatches.length} new matches`,
      };
    }),

  /**
   * Refresh embeddings for current user's context
   */
  refreshEmbedding: protectedProcedure.mutation(async ({ ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: { clerkId: ctx.session.userId },
      include: { contextWindow: true },
    });

    if (!user?.contextWindow) {
      throw new Error("Please complete your profile first");
    }

    const { generateContextEmbedding } = await import("@/lib/ai/embeddings");

    const embedding = await generateContextEmbedding({
      workingOn: user.contextWindow.workingOn,
      skills: user.contextWindow.skills,
      seeking: user.contextWindow.seeking,
      bio: user.contextWindow.bio,
      currentLocation: user.contextWindow.currentLocation,
      openTo: user.contextWindow.openTo,
    });

    // Use raw SQL to update the vector embedding (Unsupported type in Prisma)
    const embeddingStr = `[${embedding.join(",")}]`;
    await ctx.db.$executeRaw`
      UPDATE "ContextWindow"
      SET embedding = ${embeddingStr}::vector
      WHERE "userId" = ${user.id}
    `;

    return { success: true };
  }),
});
