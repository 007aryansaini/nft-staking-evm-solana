'use client';

import { useState } from 'react';
import { addSepoliaToMetaMask, addBaseToMetaMask } from '@/lib/addNetwork';
import toast from 'react-hot-toast';

interface AddNetworkButtonProps {
  network: 'evm' | 'solana';
  chainId?: 'sepolia' | 'base';
}

export default function AddNetworkButton({ network, chainId = 'sepolia' }: AddNetworkButtonProps) {
  const [isAdding, setIsAdding] = useState(false);

  const handleAddNetwork = async () => {
    if (network === 'evm') {
      // Add EVM network to MetaMask
      if (typeof window === 'undefined' || !window.ethereum) {
        toast.error('MetaMask is not installed', {
          position: 'top-right',
          duration: 5000,
        });
        return;
      }

      setIsAdding(true);
      const toastId = toast.loading(`Adding ${chainId === 'sepolia' ? 'Sepolia' : 'Base'} network to MetaMask...`, {
        position: 'top-right',
      });

      try {
        if (chainId === 'sepolia') {
          await addSepoliaToMetaMask();
        } else {
          await addBaseToMetaMask();
        }

        toast.dismiss(toastId);
        toast.success(`Successfully added ${chainId === 'sepolia' ? 'Sepolia' : 'Base'} network!`, {
          position: 'top-right',
          duration: 5000,
        });
      } catch (error: any) {
        toast.dismiss(toastId);
        toast.error(error?.message || 'Failed to add network', {
          position: 'top-right',
          duration: 5000,
        });
      } finally {
        setIsAdding(false);
      }
    } else {
      // For Solana, we can't programmatically add networks to Phantom
      // But we can show instructions
      toast.error('Phantom doesn\'t support programmatic network switching', {
        position: 'top-right',
        duration: 5000,
      });
    }
  };

  if (network === 'solana') {
    return (
      <button
        onClick={handleAddNetwork}
        className="px-4 py-2 bg-[#1f2937] hover:bg-[#374151] border border-[#374151] text-white rounded-lg text-sm font-medium transition-all flex items-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Switch to Devnet
      </button>
    );
  }

  return (
    <button
      onClick={handleAddNetwork}
      disabled={isAdding}
      className="px-4 py-2 bg-gradient-to-r from-[#3b82f6] to-[#2563eb] hover:from-[#2563eb] hover:to-[#1d4ed8] text-white rounded-lg text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-blue-500/30"
    >
      {isAdding ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
          <span>Adding...</span>
        </>
      ) : (
        <>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span>Add {chainId === 'sepolia' ? 'Sepolia' : 'Base'} Network</span>
        </>
      )}
    </button>
  );
}

