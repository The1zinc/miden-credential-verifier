"use client";

import {
  AlertTriangle,
  CheckCircle2,
  Fingerprint,
  Loader2,
  RotateCcw,
  ShieldCheck,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
  generateCredentialProof,
  type ProofResult,
} from "@/lib/miden/prover";

interface ProverUIProps {
  accountId: string | null;
}

type ProverPhase = "idle" | "proving" | "submitting" | "verified" | "error";

function truncateHash(hash: string): string {
  return `${hash.slice(0, 12)}...${hash.slice(-10)}`;
}

export default function ProverUI({ accountId }: ProverUIProps) {
  const [githubHandle, setGithubHandle] = useState("");
  const [progress, setProgress] = useState<string[]>([]);
  const [proof, setProof] = useState<ProofResult | null>(null);
  const [phase, setPhase] = useState<ProverPhase>("idle");
  const [error, setError] = useState<string | null>(null);

  const normalizedHandle = useMemo(
    () => githubHandle.trim().replace(/^@/, ""),
    [githubHandle],
  );

  const canGenerate =
    Boolean(accountId) &&
    normalizedHandle.length > 0 &&
    phase !== "proving" &&
    phase !== "submitting";

  async function submitVerification(nextProof: ProofResult) {
    if (!accountId) {
      throw new Error("Connect a Miden account before submitting a proof.");
    }

    setPhase("submitting");
    const response = await fetch("/api/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        accountId,
        githubHandle: normalizedHandle,
        proofHash: nextProof.proofHash,
      }),
    });

    const data: unknown = await response.json();

    if (!response.ok) {
      if (
        typeof data === "object" &&
        data !== null &&
        "error" in data &&
        typeof data.error === "string"
      ) {
        throw new Error(data.error);
      }

      throw new Error("Could not store proof hash in Neon.");
    }
  }

  async function generateProof() {
    if (!accountId || !normalizedHandle) {
      return;
    }

    setPhase("proving");
    setError(null);
    setProof(null);
    setProgress([]);

    try {
      const nextProof = await generateCredentialProof(accountId, (message) => {
        setProgress((current) => [...current, message]);
      });
      setProof(nextProof);
      await submitVerification(nextProof);
      setPhase("verified");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Proof generation failed.";
      setError(message);
      setPhase("error");
    }
  }

  async function retrySubmit() {
    if (!proof) {
      await generateProof();
      return;
    }

    setError(null);
    try {
      await submitVerification(proof);
      setPhase("verified");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Could not store proof hash.";
      setError(message);
      setPhase("error");
    }
  }

  return (
    <section className="w-full border border-emerald-500/20 bg-zinc-950 p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
        <label className="flex-1 text-sm text-emerald-100">
          <span className="mb-2 block text-xs uppercase tracking-[0.24em] text-emerald-300/70">
            credential owner
          </span>
          <input
            value={githubHandle}
            onChange={(event) => setGithubHandle(event.target.value)}
            placeholder="@your-handle"
            className="h-12 w-full border border-emerald-500/30 bg-zinc-900 px-4 text-emerald-100 outline-none placeholder:text-emerald-900 focus:border-emerald-300 focus:ring-2 focus:ring-emerald-400/30"
          />
        </label>

        <button
          type="button"
          onClick={generateProof}
          disabled={!canGenerate}
          className="inline-flex min-h-12 items-center justify-center gap-2 border border-emerald-500/50 bg-emerald-500 px-5 py-3 text-sm font-bold text-zinc-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:border-zinc-800 disabled:bg-zinc-900 disabled:text-zinc-600"
        >
          {phase === "proving" || phase === "submitting" ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <Fingerprint className="h-4 w-4" aria-hidden="true" />
          )}
          {phase === "submitting" ? "Storing proof hash..." : "Generate ZK Proof"}
        </button>
      </div>

      {!accountId ? (
        <div className="mt-4 border border-zinc-800 bg-zinc-900/60 p-4 text-sm text-zinc-400">
          Connect a Miden Bech32 account before proving the OG developer credential.
        </div>
      ) : null}

      {progress.length > 0 ? (
        <div className="mt-5 border border-emerald-500/20 bg-black p-4">
          <div className="mb-3 flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-emerald-300/70">
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            local prover trace
          </div>
          <ol className="space-y-2 text-sm text-emerald-300">
            {progress.map((message, index) => (
              <li key={`${message}-${index}`} className="flex gap-3">
                <span className="text-emerald-700">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span>{message}</span>
              </li>
            ))}
          </ol>
        </div>
      ) : null}

      {proof ? (
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <div className="border border-emerald-500/20 bg-zinc-900 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-emerald-300/60">
              cycles
            </p>
            <p className="mt-2 text-xl font-bold text-emerald-200">
              {proof.cycleCount.toLocaleString()}
            </p>
          </div>
          <div className="border border-emerald-500/20 bg-zinc-900 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-emerald-300/60">
              proof size
            </p>
            <p className="mt-2 text-xl font-bold text-emerald-200">
              {proof.proofSizeKb} KB
            </p>
          </div>
          <div className="border border-emerald-500/20 bg-zinc-900 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-emerald-300/60">
              proof hash
            </p>
            <p className="mt-2 break-all text-sm font-bold text-emerald-200">
              {truncateHash(proof.proofHash)}
            </p>
          </div>
        </div>
      ) : null}

      {phase === "verified" ? (
        <div className="relative mt-5 overflow-hidden border border-emerald-400/50 bg-emerald-500/10 p-5">
          <div className="absolute right-4 top-4 h-10 w-10 animate-ping bg-emerald-400/20" />
          <div className="relative flex items-center gap-3 text-emerald-100">
            <CheckCircle2 className="h-6 w-6" aria-hidden="true" />
            <span className="text-lg font-bold">Verified OG Developer</span>
          </div>
        </div>
      ) : null}

      {phase === "error" && error ? (
        <div className="mt-5 border border-red-500/30 bg-red-950/30 p-4 text-sm text-red-200">
          <div className="flex items-start gap-2">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <p>{error}</p>
          </div>
          <button
            type="button"
            onClick={retrySubmit}
            className="mt-3 inline-flex min-h-10 items-center justify-center gap-2 border border-red-400/40 px-3 py-2 text-xs font-bold uppercase tracking-[0.16em] text-red-100 transition hover:bg-red-500/10"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Retry
          </button>
        </div>
      ) : null}
    </section>
  );
}
