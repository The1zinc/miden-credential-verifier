"use client";

import { Loader2, ArrowRightLeft, FileWarning } from "lucide-react";
import { useState } from "react";

interface CreateSwapProps {
  accountId: string | null;
}

export default function CreateSwap({ accountId }: CreateSwapProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [offeringAsset, setOfferingAsset] = useState("FaucetTokenA");
  const [offeringAmount, setOfferingAmount] = useState("100");
  const [requestingAsset, setRequestingAsset] = useState("FaucetTokenB");
  const [requestingAmount, setRequestingAmount] = useState("50");

  async function handleCreateSwap(e: React.FormEvent) {
    e.preventDefault();
    if (!accountId) {
      setError("Please connect your wallet first.");
      return;
    }

    setIsCreating(true);
    setError(null);
    setSuccess(false);

    try {
      // Simulate interaction with the Miden Wallet Extension
      // Real flow: window.miden.createNote({...})
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      const simulatedNoteId = `0x${crypto.randomUUID().replace(/-/g, "")}`;

      const res = await fetch("/api/swaps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          note_id: simulatedNoteId,
          creator_account: accountId,
          offering_asset: offeringAsset,
          offering_amount: offeringAmount,
          requesting_asset: requestingAsset,
          requesting_amount: requestingAmount,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create swap listing.");
      }

      setSuccess(true);
      
      // Reset form slightly to allow more creations
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <section className="h-full rounded-xl border border-emerald-500/20 bg-zinc-900/50 p-6 shadow-[0_0_30px_rgba(16,185,129,0.03)] flex flex-col">
      <div className="mb-6 flex items-center justify-between border-b border-emerald-500/10 pb-5">
        <div>
          <h2 className="text-xl font-bold text-emerald-300">Create Swap Note</h2>
          <p className="mt-1 text-xs font-medium text-zinc-400">Offer an asset to request another</p>
        </div>
        <ArrowRightLeft className="h-5 w-5 text-emerald-500/50" />
      </div>

      {!accountId ? (
        <div className="flex flex-1 flex-col items-center justify-center py-12 text-center">
          <FileWarning className="mb-4 h-10 w-10 text-zinc-700" />
          <p className="text-sm font-medium text-zinc-500">Connect wallet to create a swap note.</p>
        </div>
      ) : (
        <form onSubmit={handleCreateSwap} className="flex flex-1 flex-col justify-between space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-emerald-300/70">You Offer</label>
              <input 
                type="number" 
                required
                value={offeringAmount}
                onChange={(e) => setOfferingAmount(e.target.value)}
                className="w-full rounded-md border border-emerald-500/30 bg-zinc-950 px-3 py-2.5 text-sm font-medium text-emerald-100 outline-none transition focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50"
              />
              <select 
                value={offeringAsset}
                onChange={(e) => setOfferingAsset(e.target.value)}
                className="w-full rounded-md border border-emerald-500/30 bg-zinc-950 px-3 py-2.5 text-sm font-medium text-emerald-100 outline-none transition focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50"
              >
                <option value="FaucetTokenA">TokenA</option>
                <option value="FaucetTokenB">TokenB</option>
                <option value="USDC_TEST">USDC</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-emerald-300/70">You Request</label>
              <input 
                type="number" 
                required
                value={requestingAmount}
                onChange={(e) => setRequestingAmount(e.target.value)}
                className="w-full rounded-md border border-emerald-500/30 bg-zinc-950 px-3 py-2.5 text-sm font-medium text-emerald-100 outline-none transition focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50"
              />
              <select 
                value={requestingAsset}
                onChange={(e) => setRequestingAsset(e.target.value)}
                className="w-full rounded-md border border-emerald-500/30 bg-zinc-950 px-3 py-2.5 text-sm font-medium text-emerald-100 outline-none transition focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50"
              >
                <option value="FaucetTokenB">TokenB</option>
                <option value="FaucetTokenA">TokenA</option>
                <option value="USDC_TEST">USDC</option>
              </select>
            </div>
          </div>

          <div className="mt-auto pt-4">
            <button
              type="submit"
              disabled={isCreating}
              className="w-full inline-flex min-h-[44px] items-center justify-center gap-2 rounded-md bg-emerald-500 px-4 py-2 text-sm font-bold text-zinc-950 shadow-sm transition hover:bg-emerald-400 disabled:opacity-50"
            >
              {isCreating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing Note...
                </>
              ) : (
                "Sign & Broadcast Note"
              )}
            </button>

            {success && (
              <div className="mt-4 rounded-md border border-emerald-500/30 bg-emerald-950/30 p-3 text-center text-sm font-medium text-emerald-200">
                Swap Note successfully created on Testnet!
              </div>
            )}
            
            {error && (
              <div className="mt-4 rounded-md border border-red-500/30 bg-red-950/30 p-3 text-center text-sm font-medium text-red-200">
                {error}
              </div>
            )}
          </div>
        </form>
      )}
    </section>
  );
}
