import { Inter } from "next/font/google";
import type { Metadata, Viewport } from "next";
import "./globals.css";
import AuthGuard from "@/components/auth-guard";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "AI Logger Dashboard",
    template: "%s | AI Logger",
  },
  description: "AI-powered error logging dashboard",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0a0a0a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-background text-foreground antialiased min-h-screen">
        <AuthGuard>{children}</AuthGuard>
      </body>
    </html>
  );
}
