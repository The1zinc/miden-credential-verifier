import type { Metadata } from "next";
import "./globals.css";
import AppWalletProvider from "@/components/AppWalletProvider";
import { ThemeProvider } from "@/components/ThemeProvider";

export const metadata: Metadata = {
  title: "Miden OTC Swap Board",
  description: "Trustless P2P atomic swaps on Miden Testnet using ZK notes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased dark" suppressHydrationWarning>
      <body className="min-h-full transition-colors">
        <ThemeProvider>
          <AppWalletProvider>
            {children}
          </AppWalletProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
