"use client";

import React, { useMemo } from 'react';
import { WalletProvider } from '@demox-labs/miden-wallet-adapter-react';
import { WalletModalProvider } from '@demox-labs/miden-wallet-adapter-reactui';
import { MidenWalletAdapter } from '@demox-labs/miden-wallet-adapter';

// Import required styles
import '@demox-labs/miden-wallet-adapter-reactui/styles.css';

export default function AppWalletProvider({ children }: { children: React.ReactNode }) {
  const wallets = useMemo(
    () => [
      new MidenWalletAdapter({ appName: 'Miden OTC Swap Board' }),
    ],
    []
  );

  return (
    <WalletProvider wallets={wallets} autoConnect>
      <WalletModalProvider>
        {children}
      </WalletModalProvider>
    </WalletProvider>
  );
}
