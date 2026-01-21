/**
 * Matching Algorithm
 * Calculates match scores between users based on multiple factors
 *
 * Weights:
 * - 40% Semantic Similarity (cosine of embeddings)
 * - 20% Skills Complement (overlap of skills↔seeking)
 * - 15% Seeking Alignment (matching openTo types)
 * - 15% Spatial Proximity (same location/event)
 * - 10% Graph Signals (shared communities)
 */

import { cosineSimilarity } from "./embeddings";

// Matching weights
const WEIGHTS = {
  semanticSimilarity: 0.4,
  skillsComplement: 0.2,
  seekingAlignment: 0.15,
  spatialProximity: 0.15,
  graphSignals: 0.1,
} as const;

// Minimum score threshold for a valid match
export const MATCH_THRESHOLD = 0.5;

export interface ContextWindow {
  userId: string;
  workingOn: string | null;
  skills: string[];
  seeking: string | null;
  currentLocation: string | null;
  upcomingTravel: string[];
  openTo: string[];
  embedding: number[] | null;
}

export interface MatchScore {
  userId: string;
  totalScore: number;
  breakdown: {
    semanticSimilarity: number;
    skillsComplement: number;
    seekingAlignment: number;
    spatialProximity: number;
    graphSignals: number;
  };
}

/**
 * Calculate the overall match score between two users
 */
export function calculateMatchScore(
  user1: ContextWindow,
  user2: ContextWindow,
  sharedCommunities: number = 0
): MatchScore {
  const breakdown = {
    semanticSimilarity: calculateSemanticSimilarity(user1, user2),
    skillsComplement: calculateSkillsComplement(user1, user2),
    seekingAlignment: calculateSeekingAlignment(user1, user2),
    spatialProximity: calculateSpatialProximity(user1, user2),
    graphSignals: calculateGraphSignals(sharedCommunities),
  };

  const totalScore =
    breakdown.semanticSimilarity * WEIGHTS.semanticSimilarity +
    breakdown.skillsComplement * WEIGHTS.skillsComplement +
    breakdown.seekingAlignment * WEIGHTS.seekingAlignment +
    breakdown.spatialProximity * WEIGHTS.spatialProximity +
    breakdown.graphSignals * WEIGHTS.graphSignals;

  return {
    userId: user2.userId,
    totalScore,
    breakdown,
  };
}

/**
 * Calculate semantic similarity using embedding cosine similarity
 * Returns 0-1 score
 */
function calculateSemanticSimilarity(
  user1: ContextWindow,
  user2: ContextWindow
): number {
  if (!user1.embedding || !user2.embedding) {
    return 0;
  }

  // Cosine similarity returns -1 to 1, normalize to 0-1
  const similarity = cosineSimilarity(user1.embedding, user2.embedding);
  return (similarity + 1) / 2;
}

/**
 * Calculate skills complement score
 * Checks if user1's skills match what user2 is seeking and vice versa
 * Returns 0-1 score
 */
function calculateSkillsComplement(
  user1: ContextWindow,
  user2: ContextWindow
): number {
  let score = 0;
  let checks = 0;

  // Check if user1's skills appear in user2's seeking text
  if (user2.seeking && user1.skills.length > 0) {
    const seekingLower = user2.seeking.toLowerCase();
    const matchingSkills = user1.skills.filter((skill) =>
      seekingLower.includes(skill.toLowerCase())
    );
    score += matchingSkills.length / user1.skills.length;
    checks++;
  }

  // Check if user2's skills appear in user1's seeking text
  if (user1.seeking && user2.skills.length > 0) {
    const seekingLower = user1.seeking.toLowerCase();
    const matchingSkills = user2.skills.filter((skill) =>
      seekingLower.includes(skill.toLowerCase())
    );
    score += matchingSkills.length / user2.skills.length;
    checks++;
  }

  // Check skill overlap (complementary or collaborative)
  if (user1.skills.length > 0 && user2.skills.length > 0) {
    const overlap = user1.skills.filter((s) =>
      user2.skills.map((s2) => s2.toLowerCase()).includes(s.toLowerCase())
    );
    // Some overlap is good (collaboration), but not too much (want diversity)
    const overlapRatio =
      overlap.length / Math.max(user1.skills.length, user2.skills.length);
    // Sweet spot is around 20-40% overlap
    score += overlapRatio > 0.1 && overlapRatio < 0.6 ? 0.5 + overlapRatio : overlapRatio;
    checks++;
  }

  return checks > 0 ? Math.min(score / checks, 1) : 0;
}

/**
 * Calculate seeking alignment based on openTo preferences
 * Returns 0-1 score
 */
function calculateSeekingAlignment(
  user1: ContextWindow,
  user2: ContextWindow
): number {
  if (user1.openTo.length === 0 || user2.openTo.length === 0) {
    return 0.5; // Neutral if preferences not set
  }

  const overlap = user1.openTo.filter((o) => user2.openTo.includes(o));
  const union = new Set([...user1.openTo, ...user2.openTo]);

  // Jaccard similarity
  return overlap.length / union.size;
}

/**
 * Calculate spatial proximity based on location and travel
 * Returns 0-1 score
 */
function calculateSpatialProximity(
  user1: ContextWindow,
  user2: ContextWindow
): number {
  let score = 0;

  // Same current location
  if (user1.currentLocation && user2.currentLocation) {
    const loc1 = user1.currentLocation.toLowerCase();
    const loc2 = user2.currentLocation.toLowerCase();

    if (loc1 === loc2) {
      score += 1;
    } else if (loc1.includes(loc2) || loc2.includes(loc1)) {
      score += 0.7;
    } else {
      // Check for common location keywords
      const loc1Words = loc1.split(/[\s,]+/);
      const loc2Words = loc2.split(/[\s,]+/);
      const commonWords = loc1Words.filter(
        (w) => w.length > 2 && loc2Words.includes(w)
      );
      if (commonWords.length > 0) {
        score += 0.5;
      }
    }
  }

  // Overlapping travel/events
  if (user1.upcomingTravel.length > 0 && user2.upcomingTravel.length > 0) {
    const travel1 = user1.upcomingTravel.map((t) => t.toLowerCase());
    const travel2 = user2.upcomingTravel.map((t) => t.toLowerCase());

    for (const t1 of travel1) {
      for (const t2 of travel2) {
        if (t1 === t2 || t1.includes(t2) || t2.includes(t1)) {
          score += 0.5;
          break;
        }
      }
    }
  }

  return Math.min(score, 1);
}

/**
 * Calculate graph signals based on shared communities
 * Returns 0-1 score
 */
function calculateGraphSignals(sharedCommunities: number): number {
  // Logarithmic scaling for shared communities
  // 1 shared community = 0.5, 2 = 0.7, 3+ = approaching 1
  if (sharedCommunities === 0) return 0;
  return Math.min(0.3 + 0.2 * Math.log2(sharedCommunities + 1), 1);
}

/**
 * Find top matches for a user from a pool of candidates
 */
export function findTopMatches(
  user: ContextWindow,
  candidates: ContextWindow[],
  sharedCommunitiesMap: Map<string, number> = new Map(),
  limit: number = 10
): MatchScore[] {
  const scores = candidates
    .filter((c) => c.userId !== user.userId) // Exclude self
    .map((candidate) =>
      calculateMatchScore(
        user,
        candidate,
        sharedCommunitiesMap.get(candidate.userId) || 0
      )
    )
    .filter((score) => score.totalScore >= MATCH_THRESHOLD)
    .sort((a, b) => b.totalScore - a.totalScore)
    .slice(0, limit);

  return scores;
}

/**
 * Determine the primary reason for a match based on score breakdown
 */
export function getPrimaryMatchReason(breakdown: MatchScore["breakdown"]): string {
  const reasons = [
    { key: "semanticSimilarity", score: breakdown.semanticSimilarity, reason: "similar context" },
    { key: "skillsComplement", score: breakdown.skillsComplement, reason: "complementary skills" },
    { key: "seekingAlignment", score: breakdown.seekingAlignment, reason: "aligned goals" },
    { key: "spatialProximity", score: breakdown.spatialProximity, reason: "nearby location" },
    { key: "graphSignals", score: breakdown.graphSignals, reason: "shared communities" },
  ];

  const top = reasons.sort((a, b) => b.score - a.score)[0];
  return top.reason;
}
