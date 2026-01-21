/**
 * Serendipity Landing Page
 * Design: "Organic Encounters" - warm, fluid, human-centered
 */

import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--cream)] overflow-hidden grain-overlay">
      {/* Animated Background Blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="blob blob-delay-1 absolute -top-32 -right-32 w-[500px] h-[500px] opacity-20"
          style={{ background: 'linear-gradient(135deg, var(--terracotta-light), var(--terracotta))' }}
        />
        <div
          className="blob blob-delay-2 absolute top-1/2 -left-48 w-[400px] h-[400px] opacity-15"
          style={{ background: 'linear-gradient(135deg, var(--sage-light), var(--sage))' }}
        />
        <div
          className="blob blob-delay-3 absolute -bottom-24 right-1/4 w-[350px] h-[350px] opacity-10"
          style={{ background: 'linear-gradient(135deg, var(--amber), var(--terracotta-light))' }}
        />
      </div>

      {/* Header */}
      <header className="relative z-10">
        <nav className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <Link href="/" className="animate-fade-in">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[var(--terracotta)] to-[var(--terracotta-light)] flex items-center justify-center shadow-lg">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.563-2.512 5.563-5.563C22 6.5 17.5 2 12 2Z"/>
                  <circle cx="7.5" cy="10" r="1.5" fill="white"/>
                  <circle cx="12" cy="7.5" r="1.5" fill="white"/>
                  <circle cx="16.5" cy="10" r="1.5" fill="white"/>
                </svg>
              </div>
              <span className="text-2xl font-display font-semibold text-[var(--espresso)] tracking-tight">
                Serendipity
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3 animate-fade-in delay-200">
            <Link
              href="/sign-in"
              className="px-5 py-2.5 text-[var(--espresso)] font-medium rounded-full hover:bg-[var(--cream-dark)] transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/sign-up"
              className="btn-primary px-6 py-2.5 font-medium rounded-full"
            >
              Get Started
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="relative z-10">
        <section className="max-w-7xl mx-auto px-6 pt-16 pb-32">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left: Text Content */}
            <div className="max-w-xl">
              <div className="animate-fade-up">
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--sage)]/10 text-[var(--sage)] font-medium text-sm mb-6">
                  <span className="w-2 h-2 rounded-full bg-[var(--sage)] animate-pulse" />
                  Now live at Network School
                </span>
              </div>

              <h1 className="animate-fade-up delay-100 text-5xl sm:text-6xl lg:text-7xl font-display font-semibold text-[var(--espresso)] leading-[1.1] tracking-tight">
                Meet people
                <br />
                <span className="text-[var(--terracotta)]">who get it</span>
              </h1>

              <p className="animate-fade-up delay-200 mt-8 text-xl text-[var(--muted-foreground)] leading-relaxed">
                Serendipity matches you with people based on what you&apos;re
                <em className="text-[var(--espresso)] not-italic font-medium"> actually working on</em>—not
                your dusty LinkedIn profile.
              </p>

              <div className="animate-fade-up delay-300 mt-10 flex flex-col sm:flex-row gap-4">
                <Link
                  href="/sign-up"
                  className="btn-primary px-8 py-4 font-semibold rounded-2xl text-lg text-center"
                >
                  Start Connecting
                </Link>
                <Link
                  href="#how-it-works"
                  className="group flex items-center justify-center gap-2 px-8 py-4 font-medium text-[var(--espresso)] rounded-2xl border-2 border-[var(--border)] hover:border-[var(--terracotta)] transition-colors"
                >
                  See how it works
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>

              {/* Social Proof */}
              <div className="animate-fade-up delay-400 mt-12 flex items-center gap-4">
                <div className="flex -space-x-3">
                  {[
                    'bg-gradient-to-br from-rose-300 to-rose-500',
                    'bg-gradient-to-br from-amber-300 to-amber-500',
                    'bg-gradient-to-br from-emerald-300 to-emerald-500',
                    'bg-gradient-to-br from-blue-300 to-blue-500',
                  ].map((bg, i) => (
                    <div
                      key={i}
                      className={`w-10 h-10 rounded-full ${bg} border-2 border-[var(--cream)]`}
                    />
                  ))}
                </div>
                <p className="text-sm text-[var(--muted-foreground)]">
                  <span className="font-semibold text-[var(--espresso)]">250+</span> Network School residents
                </p>
              </div>
            </div>

            {/* Right: Visual Element */}
            <div className="relative animate-slide-right delay-300">
              {/* Connection Visualization */}
              <div className="relative w-full aspect-square max-w-md mx-auto">
                {/* Central Hub */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-3xl bg-gradient-to-br from-[var(--terracotta)] to-[var(--terracotta-light)] shadow-2xl shadow-[var(--terracotta)]/30 flex items-center justify-center z-10">
                  <span className="text-white text-3xl">✦</span>
                </div>

                {/* Orbiting Context Cards */}
                {[
                  { label: 'Building AI tools', angle: 0, delay: '0s', color: 'var(--sage)' },
                  { label: 'Raising Series A', angle: 72, delay: '2s', color: 'var(--amber)' },
                  { label: 'Web3 infra', angle: 144, delay: '4s', color: 'var(--terracotta)' },
                  { label: 'Product design', angle: 216, delay: '6s', color: 'var(--sage)' },
                  { label: 'Dev tools', angle: 288, delay: '8s', color: 'var(--amber)' },
                ].map((item, i) => {
                  const radius = 140;
                  const x = Math.cos((item.angle * Math.PI) / 180) * radius;
                  const y = Math.sin((item.angle * Math.PI) / 180) * radius;
                  return (
                    <div
                      key={i}
                      className="absolute top-1/2 left-1/2 transform"
                      style={{
                        transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
                        animation: `blob-float 15s ease-in-out infinite`,
                        animationDelay: item.delay,
                      }}
                    >
                      <div
                        className="px-4 py-2.5 rounded-2xl text-white text-sm font-medium shadow-lg whitespace-nowrap"
                        style={{ backgroundColor: item.color }}
                      >
                        {item.label}
                      </div>
                    </div>
                  );
                })}

                {/* Connection Lines (SVG) */}
                <svg className="absolute inset-0 w-full h-full opacity-20">
                  <defs>
                    <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="var(--terracotta)" />
                      <stop offset="100%" stopColor="var(--sage)" />
                    </linearGradient>
                  </defs>
                  {[0, 72, 144, 216, 288].map((angle, i) => {
                    const radius = 140;
                    const x = Math.cos((angle * Math.PI) / 180) * radius + 50;
                    const y = Math.sin((angle * Math.PI) / 180) * radius + 50;
                    return (
                      <line
                        key={i}
                        x1="50%"
                        y1="50%"
                        x2={`${x}%`}
                        y2={`${y}%`}
                        stroke="url(#lineGrad)"
                        strokeWidth="2"
                        strokeDasharray="6 4"
                      />
                    );
                  })}
                </svg>
              </div>
            </div>
          </div>
        </section>

        {/* The Problem Section */}
        <section className="bg-[var(--cream-dark)] py-24">
          <div className="max-w-7xl mx-auto px-6">
            <div className="max-w-3xl">
              <div className="decorative-line mb-6" />
              <h2 className="text-3xl sm:text-4xl font-display font-semibold text-[var(--espresso)] leading-tight">
                LinkedIn profiles are time capsules.
                <br />
                <span className="text-[var(--muted-foreground)]">Your context is alive.</span>
              </h2>
              <p className="mt-6 text-lg text-[var(--muted-foreground)] leading-relaxed">
                The person who can help you isn&apos;t the one with the fanciest title—it&apos;s the one working
                on the same problem, in the same place, right now.
              </p>
            </div>

            {/* Comparison Cards */}
            <div className="mt-16 grid md:grid-cols-2 gap-8">
              {/* Old Way */}
              <div className="p-8 rounded-3xl bg-white/50 border border-[var(--border)]">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-[var(--muted)] flex items-center justify-center text-[var(--muted-foreground)]">
                    <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <span className="text-lg font-semibold text-[var(--muted-foreground)]">The Old Way</span>
                </div>
                <ul className="space-y-4">
                  {[
                    'Profile you wrote 3 years ago',
                    'Cold messages to strangers',
                    '"Let me know if I can help" (spoiler: they won\'t)',
                    'Keyword matching, not context matching',
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-[var(--muted-foreground)]">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[var(--muted-foreground)]/40 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Serendipity Way */}
              <div className="p-8 rounded-3xl bg-gradient-to-br from-[var(--terracotta)]/5 to-[var(--sage)]/5 border border-[var(--terracotta)]/20">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--terracotta)] to-[var(--terracotta-light)] flex items-center justify-center text-white">
                    <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-lg font-semibold text-[var(--espresso)]">The Serendipity Way</span>
                </div>
                <ul className="space-y-4">
                  {[
                    'Living context that updates as you do',
                    'Matches explained by AI—you know why',
                    'Anonymous until mutual interest',
                    'Same place + same time + same focus = magic',
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-[var(--espresso)]">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[var(--terracotta)] shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="py-32">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center max-w-2xl mx-auto mb-20">
              <div className="decorative-line mx-auto mb-6" />
              <h2 className="text-4xl sm:text-5xl font-display font-semibold text-[var(--espresso)]">
                Three steps to meaningful connections
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
              {[
                {
                  num: '01',
                  title: 'Share your context',
                  description: 'Tell us what you\'re building, what you\'re curious about, and what kind of conversations you\'re craving. Takes 2 minutes.',
                  icon: (
                    <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  ),
                },
                {
                  num: '02',
                  title: 'Get curated matches',
                  description: 'Each morning, receive 3-5 people who share your context. AI explains exactly why you should meet.',
                  icon: (
                    <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  ),
                },
                {
                  num: '03',
                  title: 'Connect when ready',
                  description: 'Express interest anonymously. When it\'s mutual, identities reveal and you can start a real conversation.',
                  icon: (
                    <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  ),
                },
              ].map((step, i) => (
                <div
                  key={i}
                  className="group relative p-8 rounded-3xl bg-white border border-[var(--border)] card-hover"
                >
                  {/* Number */}
                  <div className="absolute -top-6 left-8">
                    <div className="number-badge">
                      {step.num}
                    </div>
                  </div>

                  {/* Icon */}
                  <div className="mt-6 mb-6 w-14 h-14 rounded-2xl bg-[var(--sage)]/10 flex items-center justify-center text-[var(--sage)] group-hover:bg-[var(--sage)] group-hover:text-white transition-colors">
                    {step.icon}
                  </div>

                  <h3 className="text-xl font-display font-semibold text-[var(--espresso)] mb-3">
                    {step.title}
                  </h3>
                  <p className="text-[var(--muted-foreground)] leading-relaxed">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-24 bg-[var(--espresso)]">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-4xl font-display font-semibold text-white">
                Built for real connection
              </h2>
              <p className="mt-4 text-lg text-white/60">
                Every feature exists to help you find the right people, faster.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  title: 'Living Profiles',
                  description: 'Your context updates as you evolve. What you\'re building today matters more than your past titles.',
                  icon: '✦',
                },
                {
                  title: 'Location-Aware',
                  description: 'Heading to TOKEN2049? We\'ll match you with relevant people who\'ll be there too.',
                  icon: '◈',
                },
                {
                  title: 'Mutual Interest Only',
                  description: 'No awkward one-sided outreach. You only connect when both people want to.',
                  icon: '◇',
                },
                {
                  title: 'AI Explanations',
                  description: 'Every match comes with a clear reason why you should meet. No guessing.',
                  icon: '◆',
                },
                {
                  title: 'Daily Digest',
                  description: 'One email, 3-5 matches. No notification spam. Connect on your terms.',
                  icon: '○',
                },
                {
                  title: 'Community Graph',
                  description: 'Mutual connections and shared communities boost your match quality.',
                  icon: '◎',
                },
              ].map((feature, i) => (
                <div
                  key={i}
                  className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-colors"
                >
                  <div className="text-2xl mb-4 text-[var(--terracotta-light)]">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-white/60 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-32">
          <div className="max-w-7xl mx-auto px-6">
            <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[var(--terracotta)] via-[var(--terracotta)] to-[var(--terracotta-light)] p-12 md:p-20">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <defs>
                    <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                      <circle cx="1" cy="1" r="1" fill="white"/>
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)"/>
                </svg>
              </div>

              <div className="relative z-10 max-w-2xl">
                <h2 className="text-4xl md:text-5xl font-display font-semibold text-white leading-tight">
                  Your next co-founder, advisor, or friend is already here.
                </h2>
                <p className="mt-6 text-xl text-white/80">
                  Join 250+ Network School residents discovering meaningful connections through shared context.
                </p>
                <div className="mt-10 flex flex-col sm:flex-row gap-4">
                  <Link
                    href="/sign-up"
                    className="inline-flex items-center justify-center px-8 py-4 bg-white text-[var(--terracotta)] font-semibold rounded-2xl hover:bg-white/90 transition-colors text-lg"
                  >
                    Get Started Free
                  </Link>
                  <Link
                    href="#how-it-works"
                    className="inline-flex items-center justify-center px-8 py-4 border-2 border-white/30 text-white font-medium rounded-2xl hover:bg-white/10 transition-colors"
                  >
                    Learn More
                  </Link>
                </div>
              </div>

              {/* Decorative Elements */}
              <div className="absolute top-8 right-8 w-32 h-32 rounded-full bg-white/10 blur-2xl" />
              <div className="absolute bottom-8 right-32 w-48 h-48 rounded-full bg-white/5 blur-3xl" />
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[var(--terracotta)] to-[var(--terracotta-light)] flex items-center justify-center">
                <span className="text-white text-sm">✦</span>
              </div>
              <span className="font-display font-semibold text-[var(--espresso)]">Serendipity</span>
            </div>

            <p className="text-sm text-[var(--muted-foreground)]">
              © 2025 Serendipity. Built with care for Network School.
            </p>

            <div className="flex items-center gap-6">
              <Link href="#" className="text-sm text-[var(--muted-foreground)] hover:text-[var(--espresso)] transition-colors link-underline">
                Privacy
              </Link>
              <Link href="#" className="text-sm text-[var(--muted-foreground)] hover:text-[var(--espresso)] transition-colors link-underline">
                Terms
              </Link>
              <Link href="#" className="text-sm text-[var(--muted-foreground)] hover:text-[var(--espresso)] transition-colors link-underline">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
