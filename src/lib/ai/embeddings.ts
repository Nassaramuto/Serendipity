/**
 * Embedding Generation Service
 * Uses OpenAI text-embedding-3-small for generating context embeddings
 */

import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generate an embedding vector for the given text
 * Uses OpenAI text-embedding-3-small (1536 dimensions)
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  if (!text.trim()) {
    throw new Error("Cannot generate embedding for empty text");
  }

  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
  });

  return response.data[0].embedding;
}

/**
 * Generate embedding for a user's context window
 * Combines all relevant fields into a single text for embedding
 */
export async function generateContextEmbedding(context: {
  workingOn: string | null;
  skills: string[];
  seeking: string | null;
  bio: string | null;
  currentLocation: string | null;
  openTo: string[];
}): Promise<number[]> {
  // Combine all context fields into a structured text
  const parts: string[] = [];

  if (context.workingOn) {
    parts.push(`Currently working on: ${context.workingOn}`);
  }

  if (context.skills.length > 0) {
    parts.push(`Skills and expertise: ${context.skills.join(", ")}`);
  }

  if (context.seeking) {
    parts.push(`Looking for: ${context.seeking}`);
  }

  if (context.bio) {
    parts.push(`About: ${context.bio}`);
  }

  if (context.currentLocation) {
    parts.push(`Based in: ${context.currentLocation}`);
  }

  if (context.openTo.length > 0) {
    parts.push(`Open to: ${context.openTo.join(", ")}`);
  }

  const combinedText = parts.join("\n\n");

  if (!combinedText.trim()) {
    throw new Error("Context is empty, cannot generate embedding");
  }

  return generateEmbedding(combinedText);
}

/**
 * Calculate cosine similarity between two embedding vectors
 * Returns a value between -1 and 1, where 1 means identical
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error("Vectors must have the same length");
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);

  if (denominator === 0) {
    return 0;
  }

  return dotProduct / denominator;
}

/**
 * Batch generate embeddings for multiple texts
 * More efficient than calling generateEmbedding multiple times
 */
export async function generateEmbeddingsBatch(
  texts: string[]
): Promise<number[][]> {
  if (texts.length === 0) {
    return [];
  }

  const validTexts = texts.filter((t) => t.trim());

  if (validTexts.length === 0) {
    throw new Error("No valid texts to embed");
  }

  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: validTexts,
  });

  return response.data.map((d) => d.embedding);
}
