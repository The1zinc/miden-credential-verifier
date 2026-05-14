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

  const [offeringAsset, setOfferingAsset] = useState("MIDEN");
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

  const cardCls = "h-full rounded-xl border p-6 flex flex-col transition-colors " +
    "border-emerald-500/20 bg-zinc-900/50 shadow-[0_0_30px_rgba(16,185,129,0.03)] " +
    "light:bg-white light:border-emerald-600/20 light:shadow-sm";

  const inputCls = "w-full rounded-md border px-3 py-2.5 text-sm font-medium outline-none transition " +
    "border-emerald-500/30 bg-zinc-950 text-emerald-100 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 " +
    "light:bg-zinc-50 light:border-emerald-600/30 light:text-emerald-900 light:focus:border-emerald-600";

  return (
    <section className={cardCls}>
      <div className="mb-6 flex items-center justify-between border-b border-emerald-500/10 pb-5 light:border-emerald-600/15">
        <div>
          <h2 className="text-xl font-bold text-emerald-300 light:text-emerald-800">Create Swap Note</h2>
          <p className="mt-1 text-xs font-medium text-zinc-400 light:text-zinc-500">Offer an asset to request another</p>
        </div>
        <ArrowRightLeft className="h-5 w-5 text-emerald-500/50 light:text-emerald-600/50" />
      </div>

      {!accountId ? (
        <div className="flex flex-1 flex-col items-center justify-center py-12 text-center">
          <FileWarning className="mb-4 h-10 w-10 text-zinc-700 light:text-zinc-300" />
          <p className="text-sm font-medium text-zinc-500 light:text-zinc-400">Connect wallet to create a swap note.</p>
        </div>
      ) : (
        <form onSubmit={handleCreateSwap} className="flex flex-1 flex-col justify-between space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-emerald-300/70 light:text-emerald-700/80">You Offer</label>
              <input 
                type="number" 
                required
                value={offeringAmount}
                onChange={(e) => setOfferingAmount(e.target.value)}
                className={inputCls}
              />
              <select 
                value={offeringAsset}
                onChange={(e) => setOfferingAsset(e.target.value)}
                className={inputCls}
              >
                <option value="MIDEN">MIDEN</option>
                <option value="FaucetTokenA">TokenA</option>
                <option value="FaucetTokenB">TokenB</option>
                <option value="USDC_TEST">USDC</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-emerald-300/70 light:text-emerald-700/80">You Request</label>
              <input 
                type="number" 
                required
                value={requestingAmount}
                onChange={(e) => setRequestingAmount(e.target.value)}
                className={inputCls}
              />
              <select 
                value={requestingAsset}
                onChange={(e) => setRequestingAsset(e.target.value)}
                className={inputCls}
              >
                <option value="FaucetTokenB">TokenB</option>
                <option value="MIDEN">MIDEN</option>
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
              <div className="mt-4 rounded-md border border-emerald-500/30 bg-emerald-950/30 p-3 text-center text-sm font-medium text-emerald-200 light:bg-emerald-50 light:text-emerald-800 light:border-emerald-400/30">
                Swap Note successfully created on Testnet!
              </div>
            )}
            
            {error && (
              <div className="mt-4 rounded-md border border-red-500/30 bg-red-950/30 p-3 text-center text-sm font-medium text-red-200 light:bg-red-50 light:text-red-700 light:border-red-300/40">
                {error}
              </div>
            )}
          </div>
        </form>
      )}
    </section>
  );
}
