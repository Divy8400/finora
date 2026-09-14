import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";

export const metadata: Metadata = {
  title: "Finora — Personal Finance Manager",
  description:
    "Track your income, expenses, budgets, and savings goals with Finora.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        {/* Synchronous script to apply saved or browser theme before initial paint */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('finora_theme') || 'system';
                  var isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  var resolved = saved === 'system' ? (isDark ? 'dark' : 'light') : saved;
                  document.documentElement.setAttribute('data-theme', resolved);
                  if (resolved !== 'light') {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
