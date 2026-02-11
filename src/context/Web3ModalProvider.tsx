"use client";

import { createAppKit } from '@reown/appkit/react';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { WagmiProvider } from 'wagmi';
import { bsc, polygon, type AppKitNetwork } from '@reown/appkit/networks';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { ReactNode } from 'react';

// 1. Get projectId
const projectId = process.env.NEXT_PUBLIC_REOWN_PROJECT_ID || 'YOUR_PROJECT_ID';

// 2. Set capabilities (EVM Only)
const networks: [AppKitNetwork, ...AppKitNetwork[]] = [bsc, polygon];

// 3. Create Wagmi Adapter
const wagmiAdapter = new WagmiAdapter({
    projectId,
    networks,
});

// 4. App Metadata
const metadata = {
    name: 'VoltSMS',
    description: 'Anonymous SMS Verification',
    url: 'https://voltsms.store',
    icons: ['https://voltsms.store/voltsms-logo.png']
};

// 5. Create AppKit instance
createAppKit({
    adapters: [wagmiAdapter],
    networks,
    metadata,
    projectId,
    features: {
        analytics: true
    }
});

const queryClient = new QueryClient();

export function Web3ModalProvider({ children }: { children: ReactNode }) {
    return (
        <WagmiProvider config={wagmiAdapter.wagmiConfig}>
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        </WagmiProvider>
    );
}
