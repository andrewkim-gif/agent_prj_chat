import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { QueryClientProvider } from "@/providers/QueryClientProvider";
import { BlockchainStateProvider } from "@/providers/BlockchainStateProvider";
import { CrossWalletProvider } from "@/providers/CrossWalletProvider";
import { NetworkAwareCrossSDKProvider } from "@/providers/NetworkAwareCrossSDKProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ARA Chat - CrossToken Ecosystem Assistant",
  description: "Your intelligent Web3 assistant for CrossToken ecosystem, DEX trading, and gaming tokens",
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon.ico', sizes: 'any' }
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }
    ],
    other: [
      { url: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' }
    ]
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <QueryClientProvider>
          <NetworkAwareCrossSDKProvider>
            <BlockchainStateProvider>
              <CrossWalletProvider>
                {children}
                <Toaster />
              </CrossWalletProvider>
            </BlockchainStateProvider>
          </NetworkAwareCrossSDKProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}
