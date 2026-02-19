import type { Metadata } from "next";
import { Inter } from "next/font/google"; // Assuming standard font
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Gymplat - AI Fitness Coach",
  description: "Advanced workout tracking and AI coaching for serious athletes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
