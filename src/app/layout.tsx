import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Muhammad Anees | Flutter Developer",
  description:
    "Portfolio — Building high-performance, cross-platform mobile applications with Flutter, Dart, and Firebase.",
  keywords: ["Flutter", "Developer", "Portfolio", "Muhammad Anees", "Dart", "Firebase", "Mobile"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${jetbrainsMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
