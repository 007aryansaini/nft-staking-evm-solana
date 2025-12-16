"use client";

import "@rainbow-me/rainbowkit/styles.css";
import {
  darkTheme,
  getDefaultConfig,
  RainbowKitProvider,
} from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { sepolia, base } from "wagmi/chains";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { SolanaWalletProvider } from "./SolanaWalletProvider";
import { Toaster } from "react-hot-toast";

const config = getDefaultConfig({
  appName: "Multi-Chain NFT Staking",
  projectId: "00462d1e9f2931d394ebdfc09b204d8d",
  chains: [sepolia, base],
  ssr: true,
  syncConnectedChain: true,
});

const queryClient = new QueryClient();

export default function Providers({ children }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={darkTheme()}>
          <SolanaWalletProvider>
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#0a0a0a',
                  color: '#ffffff',
                  border: '1px solid #1a1a1a',
                  borderRadius: '0.5rem',
                },
                success: {
                  iconTheme: {
                    primary: '#10b981',
                    secondary: '#ffffff',
                  },
                  style: {
                    background: '#0a0a0a',
                    color: '#ffffff',
                    border: '1px solid #1a1a1a',
                  },
                },
                error: {
                  iconTheme: {
                    primary: '#dc2626',
                    secondary: '#ffffff',
                  },
                  style: {
                    background: '#0a0a0a',
                    color: '#ffffff',
                    border: '1px solid #1a1a1a',
                  },
                },
                loading: {
                  iconTheme: {
                    primary: '#2563eb',
                    secondary: '#ffffff',
                  },
                  style: {
                    background: '#0a0a0a',
                    color: '#ffffff',
                    border: '1px solid #1a1a1a',
                  },
                },
              }}
            />
            {children}
          </SolanaWalletProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
