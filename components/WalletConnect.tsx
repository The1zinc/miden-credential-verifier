"use client";

import { AlertTriangle, CheckCircle2, Loader2, Wallet } from "lucide-react";
import { useState } from "react";
import { createMidenWallet } from "@/lib/miden/client";

interface WalletConnectProps {
  onConnect(accountId: string): void;
}

function truncateAccountId(accountId: string): string {
  if (accountId.length <= 18) {
    return accountId;
  }

  return `${accountId.slice(0, 10)}...${accountId.slice(-6)}`;
}

export default function WalletConnect({ onConnect }: WalletConnectProps) {
  const [accountId, setAccountId] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function connectWallet() {
    setIsConnecting(true);
    setError(null);

    try {
      const account = await createMidenWallet();
      setAccountId(account.id);
      onConnect(account.id);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Could not initialize the Miden WebClient.";
      setError(message);
    } finally {
      setIsConnecting(false);
    }
  }

  function useDemoWallet() {
    const id = `MIDEN_SIM_${crypto.randomUUID().slice(0, 8)}`;
    setAccountId(id);
    setError(null);
    onConnect(id);
  }

  return (
    <section className="w-full border border-emerald-500/20 bg-zinc-950 p-5 shadow-[0_0_40px_rgba(16,185,129,0.08)]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-emerald-300/70">
            wallet session
          </p>
          <h2 className="mt-2 text-lg font-semibold text-emerald-300">
            Miden testnet account
          </h2>
        </div>

        {accountId ? (
          <div className="inline-flex items-center gap-2 border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            <span>{truncateAccountId(accountId)}</span>
          </div>
        ) : (
          <button
            type="button"
            onClick={connectWallet}
            disabled={isConnecting}
            className="inline-flex min-h-11 items-center justify-center gap-2 border border-emerald-500/50 bg-emerald-500 px-4 py-2 text-sm font-bold text-zinc-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:border-emerald-900 disabled:bg-zinc-900 disabled:text-emerald-700"
          >
            {isConnecting ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Wallet className="h-4 w-4" aria-hidden="true" />
            )}
            {isConnecting ? "Connecting to Miden testnet..." : "Connect Miden Wallet"}
          </button>
        )}
      </div>

      {error ? (
        <div className="mt-4 border border-red-500/30 bg-red-950/30 p-4 text-sm text-red-200">
          <div className="flex items-start gap-2">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <p>{error}</p>
          </div>
          <button
            type="button"
            onClick={useDemoWallet}
            className="mt-3 inline-flex min-h-10 items-center justify-center border border-red-400/40 px-3 py-2 text-xs font-bold uppercase tracking-[0.16em] text-red-100 transition hover:bg-red-500/10"
          >
            Use Demo Wallet
          </button>
        </div>
      ) : null}
    </section>
  );
}
