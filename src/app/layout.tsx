import type { Metadata } from "next";
import { headers } from "next/headers";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CoFounder — Partnership Intelligence & Venture Discovery",
  description: "Validate your co-founder partnership and discover the right venture to build together.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const hdrs = await headers();
  const nonce = hdrs.get("x-nonce") ?? undefined;

  return (
    <html lang="en">
      <body
        className={`${inter.className} antialiased bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50`}
        nonce={nonce}
      >
        {children}
      </body>
    </html>
  );
}
