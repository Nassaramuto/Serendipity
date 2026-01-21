/**
 * Root Layout
 * Includes ClerkProvider for auth and TRPCProvider for API
 */

import type { Metadata } from "next";
import { Fraunces, Outfit } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "@/components/ui/sonner";
import { TRPCProvider } from "@/trpc/client";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Serendipity | AI-Powered Matchmaking for Communities",
  description:
    "Find meaningful connections at Network School with context-aware AI matching",
  keywords: ["networking", "community", "AI", "matching", "Network School"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${fraunces.variable} ${outfit.variable} antialiased min-h-screen bg-background`}
        >
          <TRPCProvider>
            {children}
            <Toaster position="bottom-right" />
          </TRPCProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
