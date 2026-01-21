/**
 * Messages Page
 * View conversations with matched users
 */

"use client";

export default function MessagesPage() {
  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="animate-fade-up">
        <h1 className="text-3xl sm:text-4xl font-display font-semibold text-[var(--espresso)]">
          Messages
        </h1>
        <p className="mt-2 text-lg text-[var(--muted-foreground)]">
          Chat with your mutual matches.
        </p>
      </div>

      {/* Empty State */}
      <div className="mt-12 animate-fade-up delay-100">
        <div className="p-12 rounded-3xl bg-white border border-[var(--border)] text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-[var(--sage)]/20 flex items-center justify-center">
            <span className="text-4xl">💬</span>
          </div>
          <h2 className="text-xl font-display font-semibold text-[var(--espresso)]">
            No conversations yet
          </h2>
          <p className="mt-3 text-[var(--muted-foreground)] max-w-sm mx-auto">
            When you and another person both express interest, you&apos;ll be able to start a conversation here.
          </p>
          <a
            href="/matches"
            className="inline-block mt-6 btn-primary px-6 py-2.5 rounded-xl font-medium"
          >
            Browse Matches
          </a>
        </div>
      </div>

      {/* How it works */}
      <div className="mt-8 p-6 rounded-2xl bg-[var(--amber)]/10 border border-[var(--amber)]/20 animate-fade-up delay-200">
        <h3 className="font-semibold text-[var(--espresso)] mb-3">
          How messaging works
        </h3>
        <ol className="space-y-2 text-sm text-[var(--espresso)]">
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--amber)]/30 flex items-center justify-center text-xs font-semibold">
              1
            </span>
            <span>Browse your daily matches and express interest in people you&apos;d like to meet</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--amber)]/30 flex items-center justify-center text-xs font-semibold">
              2
            </span>
            <span>If they also express interest in you, it&apos;s a mutual match!</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--amber)]/30 flex items-center justify-center text-xs font-semibold">
              3
            </span>
            <span>Full profiles are revealed and you can start chatting</span>
          </li>
        </ol>
      </div>
    </div>
  );
}
