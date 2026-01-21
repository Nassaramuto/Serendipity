/**
 * Matches Page
 * Displays AI-generated matches for the user
 */

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/trpc/client";

export default function MatchesPage() {
  const utils = trpc.useUtils();
  const { data: context, isLoading: contextLoading } = trpc.context.get.useQuery();
  const { data: matchesData, isLoading: matchesLoading } = trpc.matching.getMatches.useQuery({
    status: "pending",
    limit: 20,
  });

  const generateMatches = trpc.matching.generateMatches.useMutation({
    onSuccess: () => {
      utils.matching.getMatches.invalidate();
    },
  });

  const expressInterest = trpc.matching.expressInterest.useMutation({
    onSuccess: () => {
      utils.matching.getMatches.invalidate();
    },
  });

  const [expandedMatch, setExpandedMatch] = useState<string | null>(null);

  const isLoading = contextLoading || matchesLoading;
  const matches = matchesData?.matches || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[var(--sage)] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-[var(--muted-foreground)]">
            Loading your matches...
          </p>
        </div>
      </div>
    );
  }

  if (!context) {
    return (
      <div className="text-center py-16">
        <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-[var(--sage)]/20 flex items-center justify-center">
          <span className="text-4xl">📝</span>
        </div>
        <h1 className="text-2xl font-display font-semibold text-[var(--espresso)]">
          Complete your profile first
        </h1>
        <p className="mt-2 text-[var(--muted-foreground)]">
          We need to know more about you to find great matches.
        </p>
        <a
          href="/onboarding"
          className="inline-block mt-6 btn-primary px-8 py-3 rounded-xl font-semibold"
        >
          Start Onboarding
        </a>
      </div>
    );
  }

  const handleInterest = (matchId: string, interested: boolean) => {
    expressInterest.mutate({ matchId, interested });
  };

  const handleGenerateMatches = () => {
    generateMatches.mutate({ limit: 5 });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between animate-fade-up">
        <div>
          <h1 className="text-3xl sm:text-4xl font-display font-semibold text-[var(--espresso)]">
            Your Matches
          </h1>
          <p className="mt-2 text-lg text-[var(--muted-foreground)]">
            People who share your context and could be great connections.
          </p>
        </div>
        <Button
          onClick={handleGenerateMatches}
          disabled={generateMatches.isPending}
          className="btn-primary rounded-xl"
        >
          {generateMatches.isPending ? "Finding..." : "Find Matches"}
        </Button>
      </div>

      {/* Matches List */}
      {matches.length > 0 ? (
        <div className="space-y-4 animate-fade-up delay-100">
          {matches.map((match, index) => (
            <div
              key={match.id}
              className="p-6 rounded-2xl bg-white border border-[var(--border)] transition-all hover:shadow-md"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Match Score Badge */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="px-3 py-1 rounded-full bg-gradient-to-r from-[var(--terracotta)] to-[var(--terracotta-light)] text-white text-sm font-medium">
                      {Math.round(match.relevanceScore * 100)}% match
                    </div>
                    {match.isRevealed && match.otherUser.name && (
                      <span className="text-[var(--espresso)] font-medium">
                        {match.otherUser.name}
                      </span>
                    )}
                  </div>

                  {/* AI Match Reason */}
                  {match.relevanceReason && (
                    <p className="text-[var(--espresso)] mb-4">
                      {match.relevanceReason}
                    </p>
                  )}

                  {/* Context Preview */}
                  {match.otherUser.contextWindow && (
                    <div className="space-y-3">
                      {match.otherUser.contextWindow.workingOn && (
                        <div>
                          <p className="text-sm text-[var(--muted-foreground)]">Working on</p>
                          <p className="text-[var(--espresso)] line-clamp-2">
                            {match.otherUser.contextWindow.workingOn}
                          </p>
                        </div>
                      )}

                      {match.otherUser.contextWindow.skills.length > 0 && (
                        <div>
                          <p className="text-sm text-[var(--muted-foreground)] mb-1">Skills</p>
                          <div className="flex flex-wrap gap-1.5">
                            {match.otherUser.contextWindow.skills.slice(0, 5).map((skill) => (
                              <span
                                key={skill}
                                className="px-2 py-0.5 rounded-full bg-[var(--sage)]/20 text-xs text-[var(--espresso)]"
                              >
                                {skill}
                              </span>
                            ))}
                            {match.otherUser.contextWindow.skills.length > 5 && (
                              <span className="px-2 py-0.5 text-xs text-[var(--muted-foreground)]">
                                +{match.otherUser.contextWindow.skills.length - 5} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Expanded details */}
                      {expandedMatch === match.id && (
                        <div className="pt-3 border-t border-[var(--border)] space-y-3 animate-fade-up">
                          {match.otherUser.contextWindow.seeking && (
                            <div>
                              <p className="text-sm text-[var(--muted-foreground)]">Looking for</p>
                              <p className="text-[var(--espresso)]">
                                {match.otherUser.contextWindow.seeking}
                              </p>
                            </div>
                          )}
                          {match.otherUser.contextWindow.currentLocation && (
                            <div className="flex items-center gap-2">
                              <span>📍</span>
                              <span className="text-[var(--espresso)]">
                                {match.otherUser.contextWindow.currentLocation}
                              </span>
                            </div>
                          )}
                          {match.otherUser.contextWindow.openTo.length > 0 && (
                            <div>
                              <p className="text-sm text-[var(--muted-foreground)] mb-1">Open to</p>
                              <div className="flex flex-wrap gap-1.5">
                                {match.otherUser.contextWindow.openTo.map((item) => (
                                  <span
                                    key={item}
                                    className="px-2 py-0.5 rounded-full bg-[var(--amber)]/20 text-xs text-[var(--espresso)] capitalize"
                                  >
                                    {item}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      <button
                        onClick={() =>
                          setExpandedMatch(expandedMatch === match.id ? null : match.id)
                        }
                        className="text-sm text-[var(--terracotta)] hover:underline"
                      >
                        {expandedMatch === match.id ? "Show less" : "Show more"}
                      </button>
                    </div>
                  )}
                </div>

                {/* Revealed Photo */}
                {match.isRevealed && match.otherUser.photoUrl && (
                  <img
                    src={match.otherUser.photoUrl}
                    alt={match.otherUser.name || "Match"}
                    className="w-16 h-16 rounded-2xl object-cover ml-4"
                  />
                )}
              </div>

              {/* Actions */}
              {!match.myInterest && (
                <div className="mt-6 flex items-center gap-3">
                  <Button
                    onClick={() => handleInterest(match.id, true)}
                    disabled={expressInterest.isPending}
                    className="btn-primary flex-1 rounded-xl"
                  >
                    I&apos;m interested
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleInterest(match.id, false)}
                    disabled={expressInterest.isPending}
                    className="rounded-xl"
                  >
                    Pass
                  </Button>
                </div>
              )}

              {match.myInterest && !match.isRevealed && (
                <div className="mt-4 p-3 rounded-xl bg-[var(--sage)]/10 text-center">
                  <p className="text-sm text-[var(--espresso)]">
                    ✨ You expressed interest! Waiting for them to respond...
                  </p>
                </div>
              )}

              {match.isRevealed && match.conversationId && (
                <div className="mt-4">
                  <a
                    href={`/messages/${match.conversationId}`}
                    className="inline-block btn-primary px-6 py-2 rounded-xl text-sm"
                  >
                    Start Conversation
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="animate-fade-up delay-100">
          <div className="p-8 rounded-3xl bg-gradient-to-br from-[var(--terracotta)]/5 to-[var(--sage)]/5 border border-[var(--border)]">
            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-[var(--terracotta)] to-[var(--terracotta-light)] flex items-center justify-center shadow-lg">
                <span className="text-5xl">🔮</span>
              </div>
              <h2 className="text-2xl font-display font-semibold text-[var(--espresso)]">
                No matches yet
              </h2>
              <p className="mt-3 text-[var(--muted-foreground)] max-w-md mx-auto">
                Click &quot;Find Matches&quot; to discover people who share your context and could be great connections.
              </p>

              {generateMatches.error && (
                <p className="mt-4 text-red-500 text-sm">
                  {generateMatches.error.message}
                </p>
              )}

              <Button
                onClick={handleGenerateMatches}
                disabled={generateMatches.isPending}
                className="mt-6 btn-primary px-8 py-3 rounded-xl font-semibold"
              >
                {generateMatches.isPending ? "Finding matches..." : "Find My Matches"}
              </Button>

              {/* Context Summary */}
              <div className="mt-8 p-6 rounded-2xl bg-white/50 text-left max-w-lg mx-auto">
                <h3 className="font-semibold text-[var(--espresso)] mb-3">
                  Your context window
                </h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-[var(--muted-foreground)]">Working on:</span>
                    <p className="text-[var(--espresso)] mt-1">{context.workingOn}</p>
                  </div>
                  <div>
                    <span className="text-[var(--muted-foreground)]">Skills:</span>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {context.skills.map((skill) => (
                        <span
                          key={skill}
                          className="px-2 py-0.5 rounded-full bg-[var(--sage)]/20 text-xs text-[var(--espresso)]"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-[var(--muted-foreground)]">Looking for:</span>
                    <p className="text-[var(--espresso)] mt-1 line-clamp-2">{context.seeking}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* How it works */}
      <div className="grid sm:grid-cols-3 gap-4 animate-fade-up delay-200">
        {[
          {
            icon: "🎯",
            title: "Context Matching",
            description: "We analyze what you're working on and seeking",
          },
          {
            icon: "🤖",
            title: "AI Relevance",
            description: "Our AI finds people with complementary contexts",
          },
          {
            icon: "🤝",
            title: "Mutual Interest",
            description: "Connect only when both parties are interested",
          },
        ].map((item, i) => (
          <div
            key={i}
            className="p-4 rounded-2xl bg-white border border-[var(--border)]"
          >
            <div className="w-10 h-10 rounded-xl bg-[var(--sage)]/20 flex items-center justify-center mb-3">
              <span className="text-xl">{item.icon}</span>
            </div>
            <h3 className="font-semibold text-[var(--espresso)]">{item.title}</h3>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {item.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
