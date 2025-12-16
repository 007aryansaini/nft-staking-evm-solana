'use client';

import { useState } from 'react';
import { useEVMStaking } from '@/hooks/useEVMStaking';
import StakingCard from './StakingCard';
import { formatNumber, formatAddress, isValidTokenId } from '@/lib/utils';
import { EVM_CONFIG } from '@/lib/config';

export default function EVMStakingInterface() {
  const {
    address,
    isConnected,
    stakedTokens,
    pendingRewards,
    totalClaimed,
    isLoading,
    buttonText,
    handleStake,
    handleUnstake,
    handleClaimRewards,
  } = useEVMStaking();

  const [tokenId, setTokenId] = useState('');
  const [unstakeTokenId, setUnstakeTokenId] = useState('');

  if (!isConnected) {
    return (
      <div className="text-center py-20">
        <div className="inline-block p-4 rounded-2xl bg-[#1f2937] mb-4">
          <svg className="w-16 h-16 text-[#6b7280]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <p className="text-[#9ca3af] text-lg font-medium">Please connect your EVM wallet to continue</p>
        <p className="text-[#6b7280] text-sm mt-2">Connect MetaMask or any EVM-compatible wallet</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StakingCard
          title="Pending Rewards"
          value={pendingRewards}
          subtitle="Reward Tokens"
          network="evm"
          gradient="green"
          action={{
            label: buttonText || 'Claim Rewards',
            onClick: handleClaimRewards,
            disabled: isLoading || parseFloat(pendingRewards) === 0,
          }}
        />
        <StakingCard
          title="Total Claimed"
          value={totalClaimed}
          subtitle="Lifetime Rewards"
          network="evm"
          gradient="blue"
        />
        <StakingCard
          title="Staked NFTs"
          value={stakedTokens.length}
          subtitle="Active Stakes"
          network="evm"
          gradient="purple"
        />
      </div>

      {/* Staking Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Stake NFT */}
        <div className="glass rounded-xl p-5 border border-[#1f2937] shadow-xl">
          <div className="mb-4">
            <h3 className="text-base font-bold text-white">Stake NFT</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#9ca3af] mb-2 uppercase tracking-wide">
                Token ID
              </label>
              <input
                type="text"
                value={tokenId}
                onChange={(e) => setTokenId(e.target.value)}
                placeholder="Enter NFT token ID"
                className="w-full px-3 py-2.5 bg-[#0a0a0f] border border-[#1f2937] rounded-lg text-sm text-white placeholder-[#6b7280] focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:border-transparent transition-all"
              />
            </div>
            <button
              onClick={() => {
                if (!isValidTokenId(tokenId)) {
                  return;
                }
                handleStake(tokenId);
                setTokenId('');
              }}
              disabled={isLoading || !tokenId}
              className="w-full py-2.5 px-3 bg-gradient-to-r from-[#3b82f6] to-[#2563eb] hover:from-[#2563eb] hover:to-[#1d4ed8] text-white rounded-lg text-sm font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/30 hover:shadow-xl"
            >
              {buttonText || 'Stake NFT'}
            </button>
          </div>
        </div>

        {/* Unstake NFT */}
        <div className="glass rounded-xl p-5 border border-[#1f2937] shadow-xl">
          <div className="mb-4">
            <h3 className="text-base font-bold text-white">Unstake NFT</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#9ca3af] mb-2 uppercase tracking-wide">
                Select NFT
              </label>
              <select
                value={unstakeTokenId}
                onChange={(e) => setUnstakeTokenId(e.target.value)}
                className="w-full px-3 py-2.5 bg-[#0a0a0f] border border-[#1f2937] rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:border-transparent transition-all"
              >
                <option value="">Select staked NFT</option>
                {stakedTokens.map((id) => (
                  <option key={id} value={id}>
                    Token #{id}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={() => {
                if (!unstakeTokenId) {
                  return;
                }
                handleUnstake(unstakeTokenId);
                setUnstakeTokenId('');
              }}
              disabled={isLoading || !unstakeTokenId || stakedTokens.length === 0}
              className="w-full py-2.5 px-3 bg-gradient-to-r from-[#ef4444] to-[#dc2626] hover:from-[#dc2626] hover:to-[#b91c1c] text-white rounded-lg text-sm font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-red-500/20 hover:shadow-xl"
            >
              {buttonText || 'Unstake NFT'}
            </button>
          </div>
        </div>
      </div>

      {/* Staked NFTs List */}
      {stakedTokens.length > 0 && (
        <div className="glass rounded-xl p-5 border border-[#1f2937] shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-white">Your Staked NFTs</h3>
            <span className="px-2 py-1 bg-[#1f2937] text-[#9ca3af] text-xs font-semibold rounded-lg">
              {stakedTokens.length} {stakedTokens.length === 1 ? 'NFT' : 'NFTs'}
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {stakedTokens.map((id) => (
              <div
                key={id}
                className="bg-[#0a0a0f] border border-[#1f2937] rounded-lg p-3 text-center hover:border-[#3b82f6] transition-all card-hover group"
              >
                <div className="w-10 h-10 mx-auto mb-2 rounded-lg bg-gradient-to-br from-[#3b82f6] to-[#9333ea] flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="text-white font-bold text-sm">#{id}</span>
                </div>
                <p className="text-xs text-[#6b7280] uppercase tracking-wide">Token ID</p>
                <p className="text-xs font-semibold text-white mt-1">{id}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Contract Info */}
      <div className="glass rounded-xl p-5 border border-[#1f2937] shadow-xl">
        <h3 className="text-base font-bold text-white mb-4">Contract Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#0a0a0f] border border-[#1f2937] rounded-lg p-4">
            <p className="text-xs text-[#6b7280] mb-2 uppercase tracking-wide">Staking Contract</p>
            <a
              href={`${EVM_CONFIG.EXPLORER_URL}/address/${EVM_CONFIG.STAKING_CONTRACT}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#60a5fa] hover:text-[#93c5fd] font-mono text-xs break-all transition-colors"
            >
              {formatAddress(EVM_CONFIG.STAKING_CONTRACT)}
            </a>
          </div>
          <div className="bg-[#0a0a0f] border border-[#1f2937] rounded-lg p-4">
            <p className="text-xs text-[#6b7280] mb-2 uppercase tracking-wide">Reward Rate</p>
            <p className="text-white font-semibold text-sm">{EVM_CONFIG.REWARD_RATE} tokens/sec per NFT</p>
          </div>
        </div>
      </div>
    </div>
  );
}
