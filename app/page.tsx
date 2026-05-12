"use client";

import { useState } from "react";
import Leaderboard from "@/components/Leaderboard";
import ProverUI from "@/components/ProverUI";
import WalletConnect from "@/components/WalletConnect";

export default function Home() {
  const [accountId, setAccountId] = useState<string | null>(null);

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-8 font-mono text-emerald-400 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <header className="border-b border-emerald-500/20 pb-6">
          <p className="text-xs uppercase tracking-[0.28em] text-emerald-300/60">
            miden testnet dapp
          </p>
          <h1 className="mt-4 text-3xl font-black text-emerald-300 sm:text-5xl">
            MIDEN ZK CREDENTIAL VERIFIER
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-6 text-zinc-400 sm:text-base">
            Connect a real Miden Web SDK wallet, locally generate a client-side
            STARK proof for an OG developer credential, and publish only the
            proof hash to Neon Postgres.
          </p>
        </header>

        <WalletConnect onConnect={setAccountId} />
        <ProverUI accountId={accountId} />
        <Leaderboard />

        <footer className="border-t border-emerald-500/20 py-5 text-center text-xs uppercase tracking-[0.18em] text-emerald-300/50">
          Powered by Miden - Client-side STARK Proofs - Neon DB
        </footer>
      </div>
    </main>
  );
}
