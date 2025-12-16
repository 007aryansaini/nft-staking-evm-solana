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
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          {/* Left: Heading Section */}
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-white">NFT Staking</h1>
            <span className="ml-3 text-sm text-[#6b7280] hidden sm:inline">Multi-Chain Platform</span>
          </div>

          {/* Right: Controls Section */}
          <div className="flex items-center gap-4">
            {/* Network Toggle */}
            <div className="flex items-center bg-[#1f2937] border border-[#374151] rounded-xl p-1.5">
              <button
                type="button"
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
                type="button"
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

            {/* Wallet */}
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
    </nav>
  );
}
