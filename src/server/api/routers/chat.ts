/**
 * Chat tRPC Router
 * Handles messaging between matched users
 */

import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

export const chatRouter = createTRPCRouter({
  /**
   * Get all conversations for the current user
   */
  getConversations: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: { clerkId: ctx.session.userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const conversations = await ctx.db.conversation.findMany({
      where: {
        match: {
          OR: [{ user1Id: user.id }, { user2Id: user.id }],
          revealedAt: { not: null }, // Only mutual matches
        },
      },
      include: {
        match: {
          include: {
            user1: true,
            user2: true,
          },
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    // Transform to include the "other" user
    return conversations.map((conv) => {
      const isUser1 = conv.match.user1Id === user.id;
      const otherUser = isUser1 ? conv.match.user2 : conv.match.user1;
      const lastMessage = conv.messages[0];

      return {
        id: conv.id,
        otherUser: {
          id: otherUser.id,
          name: otherUser.name,
          photoUrl: otherUser.photoUrl,
        },
        lastMessage: lastMessage
          ? {
              content: lastMessage.content,
              createdAt: lastMessage.createdAt,
              isFromMe: lastMessage.senderId === user.id,
            }
          : null,
        updatedAt: conv.updatedAt,
      };
    });
  }),

  /**
   * Get messages for a specific conversation
   */
  getMessages: protectedProcedure
    .input(
      z.object({
        conversationId: z.string(),
        limit: z.number().min(1).max(100).default(50),
        cursor: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { clerkId: ctx.session.userId },
      });

      if (!user) {
        throw new Error("User not found");
      }

      // Verify user is part of this conversation
      const conversation = await ctx.db.conversation.findUnique({
        where: { id: input.conversationId },
        include: {
          match: true,
        },
      });

      if (!conversation) {
        throw new Error("Conversation not found");
      }

      const isParticipant =
        conversation.match.user1Id === user.id ||
        conversation.match.user2Id === user.id;

      if (!isParticipant) {
        throw new Error("Not authorized to view this conversation");
      }

      const messages = await ctx.db.message.findMany({
        where: { conversationId: input.conversationId },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              photoUrl: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: input.limit,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        skip: input.cursor ? 1 : 0,
      });

      // Mark unread messages as read
      await ctx.db.message.updateMany({
        where: {
          conversationId: input.conversationId,
          senderId: { not: user.id },
          read: false,
        },
        data: { read: true },
      });

      return {
        messages: messages.map((msg) => ({
          id: msg.id,
          content: msg.content,
          createdAt: msg.createdAt,
          isFromMe: msg.senderId === user.id,
          sender: msg.sender,
        })),
        nextCursor:
          messages.length === input.limit
            ? messages[messages.length - 1]?.id
            : null,
      };
    }),

  /**
   * Send a message
   */
  sendMessage: protectedProcedure
    .input(
      z.object({
        conversationId: z.string(),
        content: z.string().min(1).max(2000),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { clerkId: ctx.session.userId },
      });

      if (!user) {
        throw new Error("User not found");
      }

      // Verify user is part of this conversation
      const conversation = await ctx.db.conversation.findUnique({
        where: { id: input.conversationId },
        include: {
          match: true,
        },
      });

      if (!conversation) {
        throw new Error("Conversation not found");
      }

      const isParticipant =
        conversation.match.user1Id === user.id ||
        conversation.match.user2Id === user.id;

      if (!isParticipant) {
        throw new Error("Not authorized to send messages in this conversation");
      }

      // Create the message and update conversation timestamp
      const [message] = await ctx.db.$transaction([
        ctx.db.message.create({
          data: {
            conversationId: input.conversationId,
            senderId: user.id,
            content: input.content,
          },
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                photoUrl: true,
              },
            },
          },
        }),
        ctx.db.conversation.update({
          where: { id: input.conversationId },
          data: { updatedAt: new Date() },
        }),
      ]);

      return {
        id: message.id,
        content: message.content,
        createdAt: message.createdAt,
        isFromMe: true,
        sender: message.sender,
      };
    }),

  /**
   * Get unread message count
   */
  getUnreadCount: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: { clerkId: ctx.session.userId },
    });

    if (!user) {
      return 0;
    }

    const count = await ctx.db.message.count({
      where: {
        conversation: {
          match: {
            OR: [{ user1Id: user.id }, { user2Id: user.id }],
          },
        },
        senderId: { not: user.id },
        read: false,
      },
    });

    return count;
  }),
});
