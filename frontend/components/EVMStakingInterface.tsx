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
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StakingCard
          title="Pending Rewards"
          value={pendingRewards}
          subtitle="Reward Tokens"
          network="evm"
          gradient="green"
          icon={
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
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
          icon={
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StakingCard
          title="Staked NFTs"
          value={stakedTokens.length}
          subtitle="Active Stakes"
          network="evm"
          gradient="purple"
          icon={
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          }
        />
      </div>

      {/* Staking Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stake NFT */}
        <div className="glass rounded-2xl p-8 border border-[#1f2937] shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#3b82f6] to-[#2563eb] flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white">Stake NFT</h3>
          </div>
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-[#9ca3af] mb-3 uppercase tracking-wide">
                Token ID
              </label>
              <input
                type="text"
                value={tokenId}
                onChange={(e) => setTokenId(e.target.value)}
                placeholder="Enter NFT token ID"
                className="w-full px-4 py-3.5 bg-[#0a0a0f] border border-[#1f2937] rounded-xl text-white placeholder-[#6b7280] focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:border-transparent transition-all"
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
              className="w-full py-3.5 px-4 bg-gradient-to-r from-[#3b82f6] to-[#2563eb] hover:from-[#2563eb] hover:to-[#1d4ed8] text-white rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/30 hover:shadow-xl"
            >
              {buttonText || 'Stake NFT'}
            </button>
          </div>
        </div>

        {/* Unstake NFT */}
        <div className="glass rounded-2xl p-8 border border-[#1f2937] shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#ef4444] to-[#dc2626] flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white">Unstake NFT</h3>
          </div>
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-[#9ca3af] mb-3 uppercase tracking-wide">
                Select NFT
              </label>
              <select
                value={unstakeTokenId}
                onChange={(e) => setUnstakeTokenId(e.target.value)}
                className="w-full px-4 py-3.5 bg-[#0a0a0f] border border-[#1f2937] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:border-transparent transition-all"
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
              className="w-full py-3.5 px-4 bg-gradient-to-r from-[#ef4444] to-[#dc2626] hover:from-[#dc2626] hover:to-[#b91c1c] text-white rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-red-500/20 hover:shadow-xl"
            >
              {buttonText || 'Unstake NFT'}
            </button>
          </div>
        </div>
      </div>

      {/* Staked NFTs List */}
      {stakedTokens.length > 0 && (
        <div className="glass rounded-2xl p-8 border border-[#1f2937] shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#9333ea] to-[#7e22ce] flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white">Your Staked NFTs</h3>
            <span className="ml-auto px-3 py-1 bg-[#1f2937] text-[#9ca3af] text-sm font-semibold rounded-lg">
              {stakedTokens.length} {stakedTokens.length === 1 ? 'NFT' : 'NFTs'}
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {stakedTokens.map((id) => (
              <div
                key={id}
                className="bg-[#0a0a0f] border border-[#1f2937] rounded-xl p-5 text-center hover:border-[#3b82f6] transition-all card-hover group"
              >
                <div className="w-12 h-12 mx-auto mb-3 rounded-lg bg-gradient-to-br from-[#3b82f6] to-[#9333ea] flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="text-white font-bold text-lg">#{id}</span>
                </div>
                <p className="text-xs text-[#6b7280] uppercase tracking-wide">Token ID</p>
                <p className="text-sm font-semibold text-white mt-1">{id}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Contract Info */}
      <div className="glass rounded-2xl p-8 border border-[#1f2937] shadow-xl">
        <h3 className="text-xl font-bold text-white mb-6">Contract Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#0a0a0f] border border-[#1f2937] rounded-xl p-5">
            <p className="text-sm text-[#6b7280] mb-2 uppercase tracking-wide">Staking Contract</p>
            <a
              href={`${EVM_CONFIG.EXPLORER_URL}/address/${EVM_CONFIG.STAKING_CONTRACT}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#60a5fa] hover:text-[#93c5fd] font-mono text-sm break-all transition-colors"
            >
              {formatAddress(EVM_CONFIG.STAKING_CONTRACT)}
            </a>
          </div>
          <div className="bg-[#0a0a0f] border border-[#1f2937] rounded-xl p-5">
            <p className="text-sm text-[#6b7280] mb-2 uppercase tracking-wide">Reward Rate</p>
            <p className="text-white font-semibold text-lg">{EVM_CONFIG.REWARD_RATE} tokens/sec per NFT</p>
          </div>
        </div>
      </div>
    </div>
  );
}
