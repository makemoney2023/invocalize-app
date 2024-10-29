import type { Metadata } from "next";
import { Inter } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import { Navbar } from "@/components/navbar";
import { CLERK_CONFIG } from "@/lib/auth/config";
import "./globals.css";

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: "Invocalize",
  description: "AI Voice Calls Platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <ClerkProvider appearance={CLERK_CONFIG.appearance}>
        <body className={inter.className}>
          <Navbar />
          {children}
        </body>
      </ClerkProvider>
    </html>
  );
}
