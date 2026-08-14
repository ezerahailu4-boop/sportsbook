import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/shared/Header";
import { MobileNav } from "@/components/shared/MobileNav";
import { SearchModal } from "@/components/shared/SearchModal";
import { AuthModal } from "@/components/auth/AuthModal";
import { DepositModal } from "@/components/wallet/DepositModal";
import { WithdrawModal } from "@/components/wallet/WithdrawModal";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "ApexBet Sportsbook | Premium Live Sports Betting & Odds",
  description:
    "Next-generation sports betting platform featuring live odds, in-play wagering, accumulator boosts, and an authoritative financial ledger.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} dark`}>
      <body className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased">
        <Header />
        
        <main className="flex-1">
          {children}
        </main>

        <MobileNav />

        {/* Global Modals */}
        <SearchModal />
        <AuthModal />
        <DepositModal />
        <WithdrawModal />
      </body>
    </html>
  );
}
