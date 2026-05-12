"use client";

import { Loader2, RefreshCw, Trophy } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

interface DeveloperRow {
  account_id: string;
  github_handle: string;
  verified_at: string;
}

function isDeveloperRow(value: unknown): value is DeveloperRow {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const row = value as Record<string, unknown>;
  return (
    typeof row.account_id === "string" &&
    typeof row.github_handle === "string" &&
    typeof row.verified_at === "string"
  );
}

function truncateAccountId(accountId: string): string {
  if (accountId.length <= 20) {
    return accountId;
  }

  return `${accountId.slice(0, 10)}...${accountId.slice(-6)}`;
}

function formatRelativeTime(value: string): string {
  const timestamp = new Date(value).getTime();

  if (Number.isNaN(timestamp)) {
    return "unknown";
  }

  const seconds = Math.max(1, Math.floor((Date.now() - timestamp) / 1000));
  if (seconds < 60) {
    return `${seconds}s ago`;
  }

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours}h ago`;
  }

  return `${Math.floor(hours / 24)}d ago`;
}

export default function Leaderboard() {
  const [developers, setDevelopers] = useState<DeveloperRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadLeaderboard = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/verify", { cache: "no-store" });
      const data: unknown = await response.json();

      if (!response.ok) {
        throw new Error("Could not load leaderboard");
      }

      if (
        typeof data !== "object" ||
        data === null ||
        !("developers" in data) ||
        !Array.isArray(data.developers)
      ) {
        throw new Error("Unexpected leaderboard response");
      }

      setDevelopers(data.developers.filter(isDeveloperRow));
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Could not load leaderboard";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadLeaderboard();
  }, [loadLeaderboard]);

  return (
    <section className="w-full border border-emerald-500/20 bg-zinc-950 p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-emerald-300/70">
            public registry
          </p>
          <h2 className="mt-2 flex items-center gap-2 text-lg font-semibold text-emerald-300">
            <Trophy className="h-5 w-5" aria-hidden="true" />
            Verified developers
          </h2>
        </div>

        <button
          type="button"
          onClick={loadLeaderboard}
          disabled={isLoading}
          className="inline-flex min-h-10 items-center justify-center gap-2 border border-emerald-500/40 px-3 py-2 text-xs font-bold uppercase tracking-[0.16em] text-emerald-100 transition hover:bg-emerald-500/10 disabled:cursor-not-allowed disabled:text-emerald-800"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
          )}
          Refresh
        </button>
      </div>

      <div className="mt-5 overflow-x-auto border border-emerald-500/10">
        <table className="w-full min-w-[680px] border-collapse text-left text-sm">
          <thead className="bg-emerald-500/10 text-xs uppercase tracking-[0.18em] text-emerald-300/70">
            <tr>
              <th className="px-4 py-3 font-medium">Rank</th>
              <th className="px-4 py-3 font-medium">GitHub Handle</th>
              <th className="px-4 py-3 font-medium">Account ID</th>
              <th className="px-4 py-3 font-medium">Verified At</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-emerald-500/10 bg-black/50 text-emerald-100">
            {developers.map((developer, index) => (
              <tr key={developer.account_id}>
                <td className="px-4 py-3 text-emerald-400">
                  {String(index + 1).padStart(2, "0")}
                </td>
                <td className="px-4 py-3">@{developer.github_handle}</td>
                <td className="px-4 py-3 text-emerald-300/80">
                  {truncateAccountId(developer.account_id)}
                </td>
                <td className="px-4 py-3 text-emerald-300/70">
                  {formatRelativeTime(developer.verified_at)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {!isLoading && !error && developers.length === 0 ? (
          <div className="border-t border-emerald-500/10 bg-black/50 p-6 text-center text-sm text-zinc-400">
            No verified developers yet. Be the first.
          </div>
        ) : null}
      </div>

      {error ? (
        <div className="mt-4 border border-red-500/30 bg-red-950/30 p-4 text-sm text-red-200">
          <p>{error}</p>
          <button
            type="button"
            onClick={loadLeaderboard}
            className="mt-3 inline-flex min-h-10 items-center justify-center gap-2 border border-red-400/40 px-3 py-2 text-xs font-bold uppercase tracking-[0.16em] text-red-100 transition hover:bg-red-500/10"
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Retry
          </button>
        </div>
      ) : null}
    </section>
  );
}
