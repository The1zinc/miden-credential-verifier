import { NextRequest, NextResponse } from "next/server";
import sql from "@/lib/db";

const PROOF_HASH_PATTERN = /^[a-f0-9]{64}$/i;
const GITHUB_HANDLE_PATTERN = /^@?[a-z\d](?:[a-z\d-]{0,37}[a-z\d])?$/i;

interface VerifyPayload {
  accountId: string;
  githubHandle: string;
  proofHash: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parsePayload(value: unknown): VerifyPayload | null {
  if (!isRecord(value)) {
    return null;
  }

  const { accountId, githubHandle, proofHash } = value;
  if (
    typeof accountId !== "string" ||
    typeof githubHandle !== "string" ||
    typeof proofHash !== "string"
  ) {
    return null;
  }

  return {
    accountId: accountId.trim(),
    githubHandle: githubHandle.trim(),
    proofHash: proofHash.trim(),
  };
}

export async function POST(req: NextRequest) {
  try {
    const payload = parsePayload(await req.json());

    if (!payload?.accountId || !payload.githubHandle || !payload.proofHash) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const { accountId, githubHandle, proofHash } = payload;

    if (!accountId.startsWith("miden1") && !accountId.startsWith("MIDEN_SIM_")) {
      return NextResponse.json(
        { error: "Invalid Miden account ID format" },
        { status: 400 },
      );
    }

    if (!GITHUB_HANDLE_PATTERN.test(githubHandle)) {
      return NextResponse.json(
        { error: "Invalid GitHub handle format" },
        { status: 400 },
      );
    }

    if (!PROOF_HASH_PATTERN.test(proofHash)) {
      return NextResponse.json(
        { error: "Invalid proof hash format" },
        { status: 400 },
      );
    }

    await sql`
      INSERT INTO verified_developers
        (account_id, github_handle, proof_hash)
      VALUES
        (${accountId}, ${githubHandle.replace(/^@/, "").toLowerCase()}, ${proofHash})
      ON CONFLICT (account_id)
      DO UPDATE SET
        github_handle = EXCLUDED.github_handle,
        proof_hash    = EXCLUDED.proof_hash,
        verified_at   = NOW()
    `;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Verify API error:", err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const rows = await sql`
      SELECT account_id, github_handle, verified_at
      FROM verified_developers
      ORDER BY verified_at DESC
      LIMIT 50
    `;

    return NextResponse.json({ developers: rows });
  } catch (err) {
    console.error("Leaderboard API error:", err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
