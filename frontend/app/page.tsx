'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import EVMStakingInterface from '@/components/EVMStakingInterface';
import SolanaStakingInterface from '@/components/SolanaStakingInterface';
import type { NetworkType } from '@/lib/config';

export default function Home() {
  const [network, setNetwork] = useState<NetworkType>('evm');

  return (
    <div className="min-h-screen">
      <Navbar network={network} onNetworkChange={setNetwork} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-block mb-6">
            <h1 className="text-5xl md:text-6xl font-bold mb-4">
              <span className="gradient-text">Multi-Chain</span>
              <span className="text-white"> NFT Staking</span>
            </h1>
          </div>
          <p className="text-[#9ca3af] text-lg max-w-2xl mx-auto">
            Stake your NFTs on {network === 'evm' ? 'EVM' : 'Solana'} networks and earn rewards automatically
          </p>
        </div>

        {/* Network Indicator */}
        <div className="flex justify-center mb-10">
          <div className={`inline-flex items-center px-6 py-3 rounded-2xl text-sm font-semibold border-2 shadow-lg ${
            network === 'evm'
              ? 'bg-gradient-to-r from-[#1f2937] to-[#111827] text-white border-[#3b82f6] shadow-blue-500/20'
              : 'bg-gradient-to-r from-[#1f2937] to-[#111827] text-white border-[#9333ea] shadow-purple-500/20'
          }`}>
            <span className={`w-3 h-3 rounded-full mr-3 ${
              network === 'evm' ? 'bg-[#3b82f6]' : 'bg-[#9333ea]'
            } animate-pulse shadow-lg`}></span>
            {network === 'evm' ? 'EVM Network (Sepolia)' : 'Solana Network (Devnet)'}
          </div>
        </div>

        {/* Staking Interface */}
        <div className="mt-8">
          {network === 'evm' ? (
            <EVMStakingInterface />
          ) : (
            <SolanaStakingInterface />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#1f2937] mt-20 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-[#6b7280] text-sm mb-2">Multi-Chain NFT Staking dApp</p>
            <p className="text-[#4b5563] text-xs">Built for demonstration purposes</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
