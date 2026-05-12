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
    <section className="h-full border border-emerald-500/20 bg-zinc-950 p-5 shadow-[0_0_30px_rgba(16,185,129,0.03)]">
      <div className="mb-6 flex items-center justify-between border-b border-emerald-500/20 pb-4">
        <div>
          <h2 className="text-xl font-bold text-emerald-300">Open Swaps</h2>
          <p className="mt-1 text-xs text-zinc-400">Live P2P Miden Testnet Offers</p>
        </div>
        <button 
          onClick={fetchSwaps}
          className="text-xs text-emerald-500 hover:text-emerald-300 transition"
        >
          Refresh
        </button>
      </div>

      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
        {isLoading && swaps.length === 0 ? (
          <div className="flex h-32 flex-col items-center justify-center gap-3 text-emerald-500">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="text-xs uppercase tracking-widest">Loading Board...</span>
          </div>
        ) : swaps.length === 0 ? (
          <div className="flex h-32 items-center justify-center text-sm text-zinc-500">
            No active swaps available.
          </div>
        ) : (
          swaps.map((swap) => (
            <div 
              key={swap.note_id}
              className="flex flex-col gap-3 border border-emerald-500/10 bg-zinc-900/50 p-4 transition hover:border-emerald-500/30"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-zinc-500">
                  {formatAccountId(swap.creator_account)}
                </span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <div className="font-bold text-emerald-400">
                  {swap.offering_amount} {swap.offering_asset}
                </div>
                <ArrowRight className="h-4 w-4 text-zinc-600 mx-2" />
                <div className="font-bold text-emerald-400">
                  {swap.requesting_amount} {swap.requesting_asset}
                </div>
              </div>

              <button
                onClick={() => handleTakeTrade(swap.note_id)}
                disabled={isFulfilling === swap.note_id}
                className="mt-2 w-full inline-flex items-center justify-center border border-emerald-500/40 bg-emerald-950/20 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-emerald-300 transition hover:bg-emerald-500/20 disabled:opacity-50"
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
