import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Miden ZK Credential Verifier",
  description:
    "Client-side Miden STARK proof verifier for OG developer credentials.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-zinc-950">{children}</body>
    </html>
  );
}
