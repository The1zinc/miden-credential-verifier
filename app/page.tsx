"use client";

import { useState } from "react";
import CreateSwap from "@/components/CreateSwap";
import SwapBoard from "@/components/SwapBoard";
import WalletConnect from "@/components/WalletConnect";

export default function Home() {
  const [accountId, setAccountId] = useState<string | null>(null);

  return (
    <main className="min-h-screen px-4 py-8 font-mono sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <header className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between border-b border-emerald-500/20 pb-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-emerald-500/80">
              miden testnet dapp
            </p>
            <h1 className="mt-4 text-4xl font-black tracking-tight text-emerald-300 sm:text-5xl">
              MIDEN OTC SWAP BOARD
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-zinc-400 sm:text-base">
              Connect your Miden Wallet to create trustless, P2P atomic swaps using Miden Notes. 
              No smart contracts required. Trades are settled natively on the Miden Testnet.
            </p>
          </div>
        </header>

        <WalletConnect onConnect={setAccountId} />
        
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_1.5fr]">
          <div className="h-full">
            <CreateSwap accountId={accountId} />
          </div>
          <div className="h-full">
            <SwapBoard />
          </div>
        </div>

        <footer className="mt-8 border-t border-emerald-500/20 py-8 text-center text-xs uppercase tracking-[0.18em] text-emerald-500/40">
          Powered by Miden - Atomic Swap Notes - Neon DB
        </footer>
      </div>
    </main>
  );
}
