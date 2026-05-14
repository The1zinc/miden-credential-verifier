"use client";

import { AlertTriangle, CheckCircle2, Loader2, Wallet } from "lucide-react";
import { useState } from "react";

interface WalletConnectProps {
  onConnect(accountId: string | null): void;
}

function truncateId(id: string): string {
  if (id.length <= 20) return id;
  return `${id.slice(0, 12)}...${id.slice(-6)}`;
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
      const miden = (window as any).miden;
      if (miden) {
        const accounts = await miden.request({ method: "miden_requestAccounts" });
        if (accounts?.length > 0) {
          setAccountId(accounts[0]);
          onConnect(accounts[0]);
          return;
        }
        throw new Error("No accounts found in Miden Wallet extension.");
      } else {
        throw new Error("Miden Wallet extension not detected.");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Connection failed.");
    } finally {
      setIsConnecting(false);
    }
  }

  function useDemoWallet() {
    const id = `miden1sim${crypto.randomUUID().replace(/-/g, "").slice(0, 24)}`;
    setAccountId(id);
    setError(null);
    onConnect(id);
  }

  function disconnect() {
    setAccountId(null);
    setError(null);
    onConnect(null);
  }

  return (
    <section className="w-full rounded-xl border border-emerald-500/20 bg-zinc-900 p-6 shadow-[0_0_40px_rgba(16,185,129,0.06)] dark:bg-zinc-900 light:bg-white light:border-emerald-600/20 light:shadow-none">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-emerald-400/60 light:text-emerald-700/60">
            wallet connection
          </p>
          <h2 className="mt-1.5 text-lg font-semibold text-emerald-300 light:text-emerald-800">
            {accountId ? "Wallet Connected" : "Connect Your Miden Wallet"}
          </h2>
        </div>

        <div className="flex items-center gap-3">
          {accountId ? (
            <>
              <div className="inline-flex items-center gap-2 rounded-md border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm font-medium text-emerald-200 light:text-emerald-800 light:bg-emerald-50 light:border-emerald-400/40">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span className="font-mono text-xs">{truncateId(accountId)}</span>
              </div>
              <button
                onClick={disconnect}
                className="rounded-md border border-zinc-700 px-3 py-2 text-xs font-bold uppercase tracking-wider text-zinc-400 transition hover:border-red-500/40 hover:text-red-400 light:border-zinc-300 light:text-zinc-500"
              >
                Disconnect
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={connectWallet}
                disabled={isConnecting}
                className="inline-flex min-h-10 items-center gap-2 rounded-md border border-emerald-500/50 bg-emerald-500 px-5 py-2 text-sm font-bold text-zinc-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isConnecting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Wallet className="h-4 w-4" />
                )}
                {isConnecting ? "Connecting..." : "Connect Miden Wallet"}
              </button>
              <button
                onClick={useDemoWallet}
                className="inline-flex min-h-10 items-center rounded-md border border-zinc-700 px-4 py-2 text-xs font-bold uppercase tracking-wider text-zinc-400 transition hover:border-emerald-500/40 hover:text-emerald-400 light:border-zinc-300 light:text-zinc-500 light:hover:text-emerald-700"
              >
                Demo
              </button>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-4 flex items-start gap-3 rounded-md border border-amber-500/30 bg-amber-950/20 p-3 text-sm text-amber-200 light:bg-amber-50 light:border-amber-400/40 light:text-amber-800">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <span className="font-semibold">Extension not found. </span>
            {error} Use <button onClick={useDemoWallet} className="underline font-bold hover:no-underline">Demo mode</button> to test the UI.
          </div>
        </div>
      )}
    </section>
  );
}
