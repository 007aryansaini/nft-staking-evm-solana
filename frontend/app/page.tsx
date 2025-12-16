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
      
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header Section */}
        <div className="text-center mb-2">
          <div className="inline-block mb-1">
            <h1 className="text-3xl md:text-4xl font-bold mb-0.5">
              <span className="gradient-text">Multi-Chain</span>
              <span className="text-white"> NFT Staking</span>
            </h1>
          </div>
          <p className="text-[#9ca3af] text-sm max-w-xl mx-auto mb-2">
            Stake your NFTs on {network === 'evm' ? 'EVM' : 'Solana'} networks and earn rewards automatically
          </p>
        </div>

        {/* Network Indicator */}
        <div className="flex justify-center mb-6">
          <div className={`inline-flex items-center px-4 py-2 rounded-xl text-xs font-semibold border-2 shadow-lg ${
            network === 'evm'
              ? 'bg-gradient-to-r from-[#1f2937] to-[#111827] text-white border-[#3b82f6] shadow-blue-500/20'
              : 'bg-gradient-to-r from-[#1f2937] to-[#111827] text-white border-[#9333ea] shadow-purple-500/20'
          }`}>
            <span className={`w-2 h-2 rounded-full mr-2 ${
              network === 'evm' ? 'bg-[#3b82f6]' : 'bg-[#9333ea]'
            } animate-pulse shadow-lg`}></span>
            {network === 'evm' ? 'EVM Network (Sepolia)' : 'Solana Network (Devnet)'}
          </div>
        </div>

        {/* Staking Interface */}
        <div className="mt-6">
          {network === 'evm' ? (
            <EVMStakingInterface />
          ) : (
            <SolanaStakingInterface />
          )}
        </div>
      </main>
    </div>
  );
}
