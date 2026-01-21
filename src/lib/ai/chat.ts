/**
 * AI Chat Service
 * Uses Claude API for generating match explanations and conversational features
 */

import Anthropic from "@anthropic-ai/sdk";
import type { MatchScore } from "./matching";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface UserContext {
  name?: string;
  workingOn: string | null;
  skills: string[];
  seeking: string | null;
  currentLocation: string | null;
  openTo: string[];
}

/**
 * Generate a personalized explanation for why two users are a good match
 */
export async function generateMatchReason(
  user1: UserContext,
  user2: UserContext,
  matchScore: MatchScore
): Promise<string> {
  const prompt = `You are helping connect people at a professional community. Generate a brief, warm explanation (2-3 sentences) for why these two people might be a great connection.

Person 1:
- Working on: ${user1.workingOn || "Not specified"}
- Skills: ${user1.skills.join(", ") || "Not specified"}
- Looking for: ${user1.seeking || "Not specified"}
- Location: ${user1.currentLocation || "Not specified"}
- Open to: ${user1.openTo.join(", ") || "Not specified"}

Person 2:
- Working on: ${user2.workingOn || "Not specified"}
- Skills: ${user2.skills.join(", ") || "Not specified"}
- Looking for: ${user2.seeking || "Not specified"}
- Location: ${user2.currentLocation || "Not specified"}
- Open to: ${user2.openTo.join(", ") || "Not specified"}

Match strength breakdown:
- Context similarity: ${Math.round(matchScore.breakdown.semanticSimilarity * 100)}%
- Skills complement: ${Math.round(matchScore.breakdown.skillsComplement * 100)}%
- Goals alignment: ${Math.round(matchScore.breakdown.seekingAlignment * 100)}%
- Location proximity: ${Math.round(matchScore.breakdown.spatialProximity * 100)}%

Write a friendly, specific explanation focusing on the strongest connection points. Don't mention percentages or scores. Be conversational and highlight mutual benefits.`;

  const response = await anthropic.messages.create({
    model: "claude-3-5-haiku-20241022",
    max_tokens: 200,
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  const textContent = response.content.find((c) => c.type === "text");
  return textContent?.text || "You two might have interesting things to discuss!";
}

/**
 * Generate a batch of match reasons efficiently
 */
export async function generateMatchReasonsBatch(
  user: UserContext,
  matches: Array<{ context: UserContext; score: MatchScore }>
): Promise<Map<string, string>> {
  const results = new Map<string, string>();

  // Process in parallel with a concurrency limit
  const batchSize = 5;
  for (let i = 0; i < matches.length; i += batchSize) {
    const batch = matches.slice(i, i + batchSize);
    const promises = batch.map(async ({ context, score }) => {
      const reason = await generateMatchReason(user, context, score);
      return { userId: score.userId, reason };
    });

    const batchResults = await Promise.all(promises);
    for (const { userId, reason } of batchResults) {
      results.set(userId, reason);
    }
  }

  return results;
}

/**
 * Generate an icebreaker question for two matched users
 */
export async function generateIcebreaker(
  user1: UserContext,
  user2: UserContext
): Promise<string> {
  const prompt = `Based on these two people's contexts, suggest ONE thoughtful icebreaker question that ${user1.name || "Person 1"} could ask ${user2.name || "Person 2"} to start a meaningful conversation.

${user1.name || "Person 1"}:
- Working on: ${user1.workingOn || "Not specified"}
- Skills: ${user1.skills.join(", ") || "Not specified"}
- Looking for: ${user1.seeking || "Not specified"}

${user2.name || "Person 2"}:
- Working on: ${user2.workingOn || "Not specified"}
- Skills: ${user2.skills.join(", ") || "Not specified"}
- Looking for: ${user2.seeking || "Not specified"}

The question should be:
- Specific to their shared interests or complementary expertise
- Open-ended to encourage discussion
- Professional but friendly
- Not generic (avoid "how did you get started" type questions)

Return ONLY the question, nothing else.`;

  const response = await anthropic.messages.create({
    model: "claude-3-5-haiku-20241022",
    max_tokens: 100,
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  const textContent = response.content.find((c) => c.type === "text");
  return textContent?.text || "What's the most exciting part of what you're building right now?";
}

/**
 * Summarize a user's context for display
 */
export async function summarizeContext(context: UserContext): Promise<string> {
  const prompt = `Summarize this person's professional context in one engaging sentence (max 15 words):

Working on: ${context.workingOn || "Not specified"}
Skills: ${context.skills.join(", ") || "Not specified"}
Looking for: ${context.seeking || "Not specified"}

Make it sound interesting and human. Return ONLY the summary.`;

  const response = await anthropic.messages.create({
    model: "claude-3-5-haiku-20241022",
    max_tokens: 50,
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  const textContent = response.content.find((c) => c.type === "text");
  return textContent?.text || "Building something interesting";
}
