import type React from "react";
import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";

import { Analytics } from "@vercel/analytics/next";
import { AuthProvider } from "@/lib/auth-context";
import "./globals.css";
import { Suspense } from "react";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "LensConnect - Connect with Professional Photographers",
  description:
    "Book professional photographers for events, portraits, products, and real estate",
  generator: "v0.app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${plusJakartaSans.variable} font-sans antialiased`} suppressHydrationWarning>
        <Suspense fallback={<div>Loading...</div>}>
          <AuthProvider>{children}</AuthProvider>
        </Suspense>
        <Analytics />
      </body>
    </html>
  );
}
