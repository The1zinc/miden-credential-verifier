# Miden ZK Credential Verifier

**Live Demo:** https://miden-credential-verifier.vercel.app  
**GitHub:** https://github.com/the1zinc/miden-credential-verifier

A Next.js 14 dApp where developers connect a Miden wallet through the real `@demox-labs/miden-sdk`, generate a local browser-side credential proof flow, and store only the SHA-256 proof hash in Neon Postgres. The public badge is a "Verified OG Developer" registry entry keyed by a Miden Bech32 account ID, not an EVM address.

## What It Does

1. The browser dynamically imports the Miden Web SDK so the WASM worker is never loaded during SSR.
2. `WebClient.createClient()` connects to `https://rpc.testnet.miden.io:443`.
3. A private mutable Miden wallet is created with `AccountStorageMode.private()`.
4. The account ID is read as a Bech32 Miden ID with `account.id().toBech32()`.
5. The browser simulates the STARK proving steps for an `OG_DEVELOPER` credential check.
6. The server stores `account_id`, `github_handle`, `proof_hash`, and `verified_at` in Neon.
7. The leaderboard reads the public registry from `/api/verify`.

## MASM Credential Logic

`lib/miden/credential_check.masm` documents the Miden Assembly logic that would run inside the Miden VM in a full production prover path. Conceptually, it pushes the expected `OG_DEVELOPER` faucet ID, reads the caller account vault balance for that asset, and asserts the balance is greater than zero. If the account lacks the credential note, the VM assertion fails and the resulting STARK proof is invalid.

## Why Client-Side STARK Proving

Client-side proving keeps private account state in the user's browser instead of sending vault contents to a server. The server receives only a proof hash, which avoids a trusted verifier service holding sensitive credential data. STARKs are transparent, post-quantum friendly, and scale well because proof verification and public indexing can remain compact while proof generation happens at the edge.

## Neon Setup

1. Create a Neon project.
2. Copy the pooled connection string into `.env.local` as `DATABASE_URL`.
3. Open the Neon SQL editor.
4. Run `database.sql`.
5. Keep `NEXT_PUBLIC_MIDEN_RPC=https://rpc.testnet.miden.io:443`.

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

Required environment variables:

```bash
DATABASE_URL=your_neon_connection_string_here
NEXT_PUBLIC_MIDEN_RPC=https://rpc.testnet.miden.io:443
```

## Deploy to Vercel

1. Import the repository into Vercel.
2. Add `DATABASE_URL` and `NEXT_PUBLIC_MIDEN_RPC` in Project Settings.
3. Deploy with the default Next.js settings.
4. Run `database.sql` once in Neon before using the verifier.

## Tech Stack

- Next.js 14 App Router
- TypeScript strict mode
- Tailwind CSS terminal UI
- `@demox-labs/miden-sdk` loaded by dynamic import only
- Neon serverless Postgres via `@neondatabase/serverless`
- `lucide-react` icons

## Architecture

```text
Browser
  |
  |-- WalletConnect.tsx
  |     dynamic import("@demox-labs/miden-sdk")
  |     WebClient.createClient(Miden testnet RPC)
  |     AccountStorageMode.private()
  |     account.id().toBech32()
  |     client.terminate()
  |
  |-- ProverUI.tsx
  |     generateCredentialProof()
  |     SHA-256 proof hash
  |     POST /api/verify
  |
Next.js API Route
  |
  |-- app/api/verify/route.ts
  |     validates Miden account ID, GitHub handle, proof hash
  |     INSERT ... ON CONFLICT
  |
Neon Postgres
  |
  |-- verified_developers
        account_id
        github_handle
        proof_hash
        verified_at
```
