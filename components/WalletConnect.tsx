"use client";

import { useEffect, useState } from "react";
import { WalletMultiButton } from "@demox-labs/miden-wallet-adapter-reactui";
import { useWallet } from "@demox-labs/miden-wallet-adapter-react";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

interface WalletConnectProps {
  onConnect(accountId: string | null): void;
}

function truncateAccountId(accountId: string): string {
  if (accountId.length <= 18) {
    return accountId;
  }
  return `${accountId.slice(0, 10)}...${accountId.slice(-6)}`;
}

export default function WalletConnect({ onConnect }: WalletConnectProps) {
  const { connected, address } = useWallet();
  const [demoAddress, setDemoAddress] = useState<string | null>(null);

  // Sync official wallet state to parent
  useEffect(() => {
    if (connected && address) {
      onConnect(address);
      setDemoAddress(null); // Clear demo if real wallet connects
    } else if (demoAddress) {
      onConnect(demoAddress);
    } else {
      onConnect(null);
    }
  }, [connected, address, demoAddress, onConnect]);

  function useDemoWallet() {
    const id = `miden1sim${crypto.randomUUID().replace(/-/g, "").slice(0, 24)}`;
    setDemoAddress(id);
  }

  return (
    <section className="w-full rounded-xl border border-emerald-500/20 bg-zinc-900/50 p-6 shadow-[0_0_40px_rgba(16,185,129,0.08)]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-emerald-300/70">
            wallet connection
          </p>
          <h2 className="mt-2 text-lg font-semibold text-emerald-300">
            Miden Account Connected
          </h2>
        </div>

        <div className="flex items-center gap-4">
          {demoAddress ? (
            <div className="inline-flex items-center gap-2 rounded-md border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm font-medium text-emerald-200">
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              <span>{truncateAccountId(demoAddress)} (Demo)</span>
            </div>
          ) : (
            <WalletMultiButton />
          )}
        </div>
      </div>

      {!connected && !demoAddress ? (
        <div className="mt-6 rounded-md border border-red-500/30 bg-red-950/30 p-4 text-sm text-red-200">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <div>
              <p className="font-semibold">Miden Extension Required</p>
              <p className="mt-1">
                Please install the Miden Browser Wallet and connect using the button above. 
                If you do not have it, use the demo wallet to test the UI.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={useDemoWallet}
            className="mt-4 inline-flex min-h-10 items-center justify-center rounded-md border border-red-400/40 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-red-100 transition hover:bg-red-500/10"
          >
            Use Demo Wallet Address
          </button>
        </div>
      ) : null}
    </section>
  );
}
