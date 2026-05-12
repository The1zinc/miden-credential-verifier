"use client";

import { useEffect, useState } from "react";
import { Loader2, ArrowRight } from "lucide-react";

interface SwapListing {
  id: number;
  note_id: string;
  creator_account: string;
  offering_asset: string;
  offering_amount: string;
  requesting_asset: string;
  requesting_amount: string;
  status: string;
  created_at: string;
}

export default function SwapBoard() {
  const [swaps, setSwaps] = useState<SwapListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFulfilling, setIsFulfilling] = useState<string | null>(null);

  async function fetchSwaps() {
    setIsLoading(true);
    try {
      const res = await fetch("/api/swaps");
      if (res.ok) {
        const data = await res.json();
        setSwaps(data.swaps || []);
      }
    } catch (err) {
      console.error("Failed to fetch swaps:", err);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchSwaps();
    const interval = setInterval(fetchSwaps, 10000);
    return () => clearInterval(interval);
  }, []);

  async function handleTakeTrade(noteId: string) {
    setIsFulfilling(noteId);
    // Simulate wallet extension consumption of the note
    await new Promise((resolve) => setTimeout(resolve, 2000));
    alert(`Wallet Extension Simulated:\nConsumed Note: ${noteId}\nSwap Successful!`);
    setIsFulfilling(null);
    fetchSwaps();
  }

  function formatAccountId(id: string) {
    if (id.length <= 12) return id;
    return `${id.slice(0, 8)}...${id.slice(-4)}`;
  }

  return (
    <section className="h-full rounded-xl border border-emerald-500/20 bg-zinc-900/50 p-6 shadow-[0_0_30px_rgba(16,185,129,0.03)] flex flex-col">
      <div className="mb-6 flex items-center justify-between border-b border-emerald-500/10 pb-5">
        <div>
          <h2 className="text-xl font-bold text-emerald-300">Open Swaps</h2>
          <p className="mt-1 text-xs font-medium text-zinc-400">Live P2P Miden Testnet Offers</p>
        </div>
        <button 
          onClick={fetchSwaps}
          className="rounded-full bg-zinc-900 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-500 transition hover:bg-zinc-800"
        >
          Refresh
        </button>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto pr-2 custom-scrollbar">
        {isLoading && swaps.length === 0 ? (
          <div className="flex h-40 flex-col items-center justify-center gap-3 text-emerald-500">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="text-xs font-bold uppercase tracking-widest">Loading Board...</span>
          </div>
        ) : swaps.length === 0 ? (
          <div className="flex h-40 items-center justify-center text-sm font-medium text-zinc-500">
            No active swaps available.
          </div>
        ) : (
          swaps.map((swap) => (
            <div 
              key={swap.note_id}
              className="flex flex-col gap-4 rounded-lg border border-emerald-500/10 bg-zinc-900/50 p-4 transition hover:border-emerald-500/30"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-400">
                  {formatAccountId(swap.creator_account)}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400/50">
                  Active
                </span>
              </div>
              
              <div className="flex items-center justify-between rounded-md bg-zinc-950 p-3 shadow-sm">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase text-zinc-400">Offering</span>
                  <div className="font-bold text-emerald-400">
                    {swap.offering_amount} {swap.offering_asset}
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-emerald-800 mx-4 shrink-0" />
                <div className="flex flex-col text-right">
                  <span className="text-[10px] font-bold uppercase text-zinc-400">Asking</span>
                  <div className="font-bold text-emerald-400">
                    {swap.requesting_amount} {swap.requesting_asset}
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleTakeTrade(swap.note_id)}
                disabled={isFulfilling === swap.note_id}
                className="mt-1 w-full inline-flex min-h-[36px] items-center justify-center rounded-md border border-emerald-500/40 bg-emerald-950/30 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-emerald-300 transition hover:bg-emerald-500/20 disabled:opacity-50"
              >
                {isFulfilling === swap.note_id ? (
                  <Loader2 className="h-3 w-3 animate-spin mr-2" />
                ) : null}
                {isFulfilling === swap.note_id ? "Consuming Note..." : "Take Trade"}
              </button>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
