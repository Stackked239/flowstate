import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Flowstate - Focus on What Matters",
  description: "AI-powered task management for the distracted mind. Focus mode, smart scheduling, and natural language task input.",
  keywords: ["task manager", "todo app", "productivity", "focus mode", "AI task manager"],
  authors: [{ name: "Flowstate" }],
  openGraph: {
    title: "Flowstate - Focus on What Matters",
    description: "AI-powered task management for the distracted mind",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
