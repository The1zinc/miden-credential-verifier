"use client";

import { CheckCircle2, Loader2, Wallet, AlertTriangle } from "lucide-react";
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (typeof window !== 'undefined' && (window as any).miden) {
         // Attempt to use extension if injected
         // eslint-disable-next-line @typescript-eslint/no-explicit-any
         const accounts = await (window as any).miden.request({ method: 'miden_requestAccounts' });
         setAccountId(accounts[0]);
         onConnect(accounts[0]);
      } else {
         // Fallback to generating a REAL Miden wallet in the browser via SDK
         const account = await createMidenWallet();
         setAccountId(account.id);
         onConnect(account.id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not connect to Miden network.");
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
    <section className="w-full rounded-xl border border-emerald-500/20 bg-white p-6 shadow-sm dark:bg-zinc-950 dark:shadow-[0_0_40px_rgba(16,185,129,0.08)]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-emerald-600/70 dark:text-emerald-300/70">
            wallet connection
          </p>
          <h2 className="mt-2 text-lg font-semibold text-emerald-700 dark:text-emerald-300">
            Miden Account Connected
          </h2>
        </div>

        {accountId ? (
          <div className="inline-flex items-center gap-2 rounded-md border border-emerald-500/40 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-200">
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            <span>{truncateAccountId(accountId)}</span>
          </div>
        ) : (
          <button
            type="button"
            onClick={connectWallet}
            disabled={isConnecting}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-emerald-500 bg-emerald-500 px-6 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:border-zinc-300 disabled:bg-zinc-100 disabled:text-zinc-400 dark:border-emerald-500/50 dark:text-zinc-950 dark:hover:bg-emerald-400 dark:disabled:border-emerald-900 dark:disabled:bg-zinc-900 dark:disabled:text-emerald-700"
          >
            {isConnecting ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Wallet className="h-4 w-4" aria-hidden="true" />
            )}
            {isConnecting ? "Connecting..." : "Connect Miden Wallet"}
          </button>
        )}
      </div>

      {error ? (
        <div className="mt-6 rounded-md border border-red-500/30 bg-red-50 p-4 text-sm text-red-800 dark:bg-red-950/30 dark:text-red-200">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <div>
              <p className="font-semibold">Connection Error</p>
              <p className="mt-1">{error}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={useDemoWallet}
            className="mt-4 inline-flex min-h-10 items-center justify-center rounded-md border border-red-400/40 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-red-700 transition hover:bg-red-100 dark:text-red-100 dark:hover:bg-red-500/10"
          >
            Use Demo Wallet Address
          </button>
        </div>
      ) : null}
    </section>
  );
}
