import { ClerkProvider } from "@clerk/nextjs";
import { Inter } from "next/font/google";
import { Navbar } from "@/components/navbar";
import { LayoutProvider } from "@/components/providers/layout-provider";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ClerkProvider>
          <LayoutProvider>
            <div className="min-h-screen bg-background">
              <Navbar />
              {children}
            </div>
          </LayoutProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
