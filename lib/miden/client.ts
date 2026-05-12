"use client";

const MIDEN_RPC =
  process.env.NEXT_PUBLIC_MIDEN_RPC ?? "https://rpc.testnet.miden.io:443";

export interface MidenAccount {
  id: string; // Bech32 format e.g. "miden1..."
  isPublic: boolean;
}

interface MidenSdkAccountId {
  toBech32(): string;
}

interface MidenSdkAccount {
  id(): MidenSdkAccountId;
  isPublic(): boolean;
}

interface MidenSdkClient {
  newWallet(storageMode: unknown, mutable: boolean): Promise<MidenSdkAccount>;
  terminate(): void;
}

interface MidenSdkModule {
  WebClient: {
    createClient(rpcUrl?: string): Promise<MidenSdkClient>;
  };
  AccountStorageMode: {
    private(): unknown;
  };
}

export async function createMidenWallet(): Promise<MidenAccount> {
  // Dynamic import is mandatory: the SDK runs WASM in a Web Worker.
  const { WebClient, AccountStorageMode } =
    (await import("@demox-labs/miden-sdk")) as unknown as MidenSdkModule;

  const client = await WebClient.createClient(MIDEN_RPC);
  try {
    // Create a private, mutable wallet for credential holders.
    const account = await client.newWallet(AccountStorageMode.private(), true);

    return {
      id: account.id().toBech32(), // Bech32, NOT hex
      isPublic: account.isPublic(),
    };
  } finally {
    client.terminate(); // Always terminate to free the WASM worker thread.
  }
}
