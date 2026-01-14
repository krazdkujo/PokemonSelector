import type { Metadata } from "next";
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import Link from "next/link";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemeToggle } from "@/components/ThemeToggle";

export const metadata: Metadata = {
  title: "Pokemon Starter Selector",
  description: "Choose your starter Pokemon for the journey ahead",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${GeistSans.variable} ${GeistMono.variable}`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  // Dark is default, only add 'light' class if explicitly set or system prefers light
                  if (theme === 'light' || (!theme && !prefersDark)) {
                    document.documentElement.classList.add('light');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="antialiased min-h-screen bg-[var(--bg-0)] text-[var(--fg-0)] font-sans">
        <ThemeProvider>
          <ThemeToggle />
          <main className="container mx-auto px-4 py-8 max-w-6xl">
            {children}
          </main>
          <footer className="container mx-auto px-4 py-6 max-w-6xl border-t border-[var(--border)]">
            <div className="flex justify-center items-center gap-4 text-xs font-mono text-[var(--fg-300)]">
              <span>Pokemon Selector</span>
              <span>|</span>
              <Link href="/changelog" className="hover:text-[var(--fg-100)] transition-colors">
                Changelog
              </Link>
            </div>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
