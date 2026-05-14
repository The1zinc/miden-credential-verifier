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
    try {
      // Prompt wallet extension if available, otherwise fallback to standard browser confirm
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const miden = (window as any).miden;
      let confirmed = false;
      
      if (miden) {
        try {
          // Attempt to trigger a signature popup from the real extension
          await miden.request({ method: "miden_signMessage", params: { message: `Approve taking trade for Note ${noteId}?` } });
          confirmed = true;
        } catch (e: unknown) {
          console.warn("Wallet signing issue or unsupported method:", e);
          confirmed = window.confirm(`Approve taking trade for Note ${noteId}?`);
        }
      } else {
        confirmed = window.confirm(`Approve taking trade for Note ${noteId}?`);
      }

      if (!confirmed) {
        throw new Error("User rejected the transaction.");
      }

      // Simulate wallet processing delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const res = await fetch("/api/swaps", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note_id: noteId }),
      });

      if (!res.ok) throw new Error("Failed to fulfill swap");

      // alert(`Wallet Extension Confirmed:\nConsumed Note: ${noteId}\nSwap Successful!`);
    } catch (err) {
      console.error(err);
      alert("Error fulfilling swap note.");
    } finally {
      setIsFulfilling(null);
      fetchSwaps();
    }
  }

  function formatAccountId(id: string) {
    if (id.length <= 12) return id;
    return `${id.slice(0, 8)}...${id.slice(-4)}`;
  }

  return (
    <section className="h-full rounded-xl border p-6 flex flex-col transition-colors border-emerald-500/20 bg-zinc-900/50 shadow-[0_0_30px_rgba(16,185,129,0.03)] light:bg-white light:border-emerald-600/20 light:shadow-sm">
      <div className="mb-6 flex items-center justify-between border-b border-emerald-500/10 pb-5 light:border-emerald-600/15">
        <div>
          <h2 className="text-xl font-bold text-emerald-300 light:text-emerald-800">Open Swaps</h2>
          <p className="mt-1 text-xs font-medium text-zinc-400 light:text-zinc-500">Live P2P Miden Testnet Offers</p>
        </div>
        <button 
          onClick={fetchSwaps}
          className="rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider transition bg-zinc-900 text-emerald-500 hover:bg-zinc-800 light:bg-emerald-50 light:text-emerald-700 light:hover:bg-emerald-100"
        >
          Refresh
        </button>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto pr-2 custom-scrollbar">
        {isLoading && swaps.length === 0 ? (
          <div className="flex h-40 flex-col items-center justify-center gap-3 text-emerald-500 light:text-emerald-600">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="text-xs font-bold uppercase tracking-widest">Loading Board...</span>
          </div>
        ) : swaps.length === 0 ? (
          <div className="flex h-40 items-center justify-center text-sm font-medium text-zinc-500 light:text-zinc-400">
            No active swaps available.
          </div>
        ) : (
          swaps.map((swap) => (
            <div 
              key={swap.note_id}
              className="flex flex-col gap-4 rounded-lg border p-4 transition border-emerald-500/10 bg-zinc-900/50 hover:border-emerald-500/30 light:bg-zinc-50 light:border-emerald-600/10 light:hover:border-emerald-500/30"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-400 light:text-zinc-500">
                  {formatAccountId(swap.creator_account)}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400/50 light:text-emerald-600/60">
                  Active
                </span>
              </div>
              
              <div className="flex items-center justify-between rounded-md p-3 shadow-sm bg-zinc-950 light:bg-emerald-50/50 light:shadow-none light:border light:border-emerald-500/10">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase text-zinc-400 light:text-zinc-500">Offering</span>
                  <div className="font-bold text-emerald-400 light:text-emerald-700">
                    {swap.offering_amount} {swap.offering_asset}
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-emerald-800 mx-4 shrink-0 light:text-emerald-400" />
                <div className="flex flex-col text-right">
                  <span className="text-[10px] font-bold uppercase text-zinc-400 light:text-zinc-500">Asking</span>
                  <div className="font-bold text-emerald-400 light:text-emerald-700">
                    {swap.requesting_amount} {swap.requesting_asset}
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleTakeTrade(swap.note_id)}
                disabled={isFulfilling === swap.note_id}
                className="mt-1 w-full inline-flex min-h-[36px] items-center justify-center rounded-md border px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition disabled:opacity-50 border-emerald-500/40 bg-emerald-950/30 text-emerald-300 hover:bg-emerald-500/20 light:bg-emerald-50 light:border-emerald-500/30 light:text-emerald-700 light:hover:bg-emerald-100"
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
