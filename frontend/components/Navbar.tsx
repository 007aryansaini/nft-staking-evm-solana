'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useAccount } from 'wagmi';
import AddNetworkButton from './AddNetworkButton';

interface NavbarProps {
  network: 'evm' | 'solana';
  onNetworkChange: (network: 'evm' | 'solana') => void;
}

export default function Navbar({ network, onNetworkChange }: NavbarProps) {
  const { chainId } = useAccount();

  return (
    <nav className="glass border-b border-[#1f2937] sticky top-0 z-50 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#3b82f6] to-[#9333ea] flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">NFT Staking</h1>
              <p className="text-xs text-[#6b7280] hidden sm:block">Multi-Chain Platform</p>
            </div>
          </div>

          {/* Network Switcher & Wallet */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center bg-[#1f2937] border border-[#374151] rounded-xl p-1.5 shadow-lg">
              <button
                onClick={() => onNetworkChange('evm')}
                className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  network === 'evm'
                    ? 'bg-gradient-to-r from-[#3b82f6] to-[#2563eb] text-white shadow-lg shadow-blue-500/30'
                    : 'text-[#9ca3af] hover:text-white'
                }`}
              >
                EVM
              </button>
              <button
                onClick={() => onNetworkChange('solana')}
                className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  network === 'solana'
                    ? 'bg-gradient-to-r from-[#9333ea] to-[#7e22ce] text-white shadow-lg shadow-purple-500/30'
                    : 'text-[#9ca3af] hover:text-white'
                }`}
              >
                Solana
              </button>
            </div>

            {/* Add Network Button */}
            {network === 'evm' && (
              <AddNetworkButton 
                network="evm" 
                chainId={chainId === 84532 ? 'base' : 'sepolia'} 
              />
            )}
            {network === 'solana' && (
              <AddNetworkButton network="solana" />
            )}

            {/* Wallet Connection */}
            <div className="flex items-center">
              {network === 'evm' ? (
                <ConnectButton />
              ) : (
                <div className="wallet-adapter-button-trigger">
                  <WalletMultiButton className="!bg-gradient-to-r !from-[#9333ea] !to-[#7e22ce] hover:!from-[#7e22ce] hover:!to-[#6b21a8] !rounded-lg !text-white !font-semibold !shadow-lg !shadow-purple-500/30" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
