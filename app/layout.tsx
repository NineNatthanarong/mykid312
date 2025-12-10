import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hogword - Vocabulary Practice",
  description: "Master vocabulary through AI-powered sentence practice",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
