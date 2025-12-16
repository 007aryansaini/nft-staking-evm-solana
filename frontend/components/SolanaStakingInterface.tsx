'use client';

import { useSolanaStaking } from '@/hooks/useSolanaStaking';
import StakingCard from './StakingCard';
import { formatNumber, formatAddress } from '@/lib/utils';
import { SOLANA_CONFIG } from '@/lib/config';

export default function SolanaStakingInterface() {
  const {
    address,
    isConnected,
    stakingStatus,
    pendingRewards,
    totalClaimed,
    isStaked,
    isStaking,
    isUnstaking,
    isClaiming,
    stakeButtonText,
    unstakeButtonText,
    claimButtonText,
    handleStake,
    handleUnstake,
    handleClaimRewards,
  } = useSolanaStaking();

  if (!isConnected) {
    return (
      <div className="text-center py-20">
        <div className="inline-block p-4 rounded-2xl bg-[#1f2937] mb-4">
          <svg className="w-16 h-16 text-[#6b7280]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <p className="text-[#9ca3af] text-lg font-medium">Please connect your Solana wallet to continue</p>
        <p className="text-[#6b7280] text-sm mt-2">Connect Phantom or any Solana-compatible wallet</p>
      </div>
    );
  }

  const stakingFee = SOLANA_CONFIG.STAKING_FEE;
  const rewardAmount = SOLANA_CONFIG.REWARD_AMOUNT;

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StakingCard
          title="Pending Rewards"
          value={pendingRewards}
          subtitle="SOL Tokens"
          network="solana"
          gradient="green"
          action={{
            label: claimButtonText || 'Claim Rewards',
            onClick: handleClaimRewards,
            disabled: isClaiming || pendingRewards <= 0 || !isStaked,
          }}
        />
        <StakingCard
          title="Total Claimed"
          value={totalClaimed}
          subtitle="Lifetime Rewards"
          network="solana"
          gradient="purple"
        />
        <StakingCard
          title="Staking Status"
          value={isStaked ? 'Active' : 'Inactive'}
          subtitle={isStaked ? 'Currently Staked' : 'Not Staked'}
          network="solana"
          gradient="blue"
        />
      </div>

      {/* Staking Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Stake */}
        <div className="glass rounded-xl p-5 border border-[#1f2937] shadow-xl">
          <div className="mb-4">
            <h3 className="text-base font-bold text-white">Stake NFT</h3>
          </div>
          <div className="space-y-4">
            <div className="bg-[#0a0a0f] border border-[#1f2937] rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-[#6b7280] uppercase tracking-wide">Staking Fee</p>
                <div className="px-2 py-1 bg-gradient-to-r from-[#9333ea] to-[#7e22ce] rounded-lg">
                  <p className="text-white font-bold text-sm">{stakingFee} SOL</p>
                </div>
              </div>
              <p className="text-xs text-[#6b7280] mt-2">
                This fee will be transferred to the reward address when you stake
              </p>
            </div>
            <button
              onClick={handleStake}
              disabled={isStaking || isUnstaking || isClaiming || isStaked}
              className="w-full py-2.5 px-3 bg-gradient-to-r from-[#9333ea] to-[#7e22ce] hover:from-[#7e22ce] hover:to-[#6b21a8] text-white rounded-lg text-sm font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-500/30 hover:shadow-xl cursor-pointer"
            >
              {isStaking ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  {stakeButtonText || 'Processing...'}
                </span>
              ) : (
                isStaked ? 'Already Staked' : 'Stake NFT'
              )}
            </button>
          </div>
        </div>

        {/* Unstake */}
        <div className="glass rounded-xl p-5 border border-[#1f2937] shadow-xl">
          <div className="mb-4">
            <h3 className="text-base font-bold text-white">Unstake NFT</h3>
          </div>
          <div className="space-y-4">
            <div className="bg-[#0a0a0f] border border-[#1f2937] rounded-lg p-4">
              <p className="text-xs text-[#6b7280] mb-2 uppercase tracking-wide">Current Status</p>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isStaked ? 'bg-[#10b981]' : 'bg-[#6b7280]'}`}></div>
                <p className="text-sm font-semibold text-white">
                  {isStaked ? 'Staked' : 'Not Staked'}
                </p>
              </div>
            </div>
            <button
              onClick={handleUnstake}
              disabled={isStaking || isUnstaking || isClaiming || !isStaked}
              className="w-full py-2.5 px-3 bg-gradient-to-r from-[#ef4444] to-[#dc2626] hover:from-[#dc2626] hover:to-[#b91c1c] text-white rounded-lg text-sm font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-red-500/20 hover:shadow-xl cursor-pointer"
            >
              {isUnstaking ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  {unstakeButtonText || 'Processing...'}
                </span>
              ) : (
                'Unstake NFT'
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Staking Details */}
      {stakingStatus && (
        <div className="glass rounded-xl p-5 border border-[#1f2937] shadow-xl">
          <h3 className="text-base font-bold text-white mb-4">Staking Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stakingStatus.stakingRecord && (
              <>
                <div className="bg-[#0a0a0f] border border-[#1f2937] rounded-lg p-4">
                  <p className="text-xs text-[#6b7280] mb-2 uppercase tracking-wide">Transaction</p>
                  <a
                    href={`${SOLANA_CONFIG.EXPLORER_URL}/tx/${stakingStatus.stakingRecord.transactionSignature}?cluster=devnet`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#a78bfa] hover:text-[#c4b5fd] font-mono text-xs break-all transition-colors"
                  >
                    {formatAddress(stakingStatus.stakingRecord.transactionSignature)}
                  </a>
                </div>
                <div className="bg-[#0a0a0f] border border-[#1f2937] rounded-lg p-4">
                  <p className="text-xs text-[#6b7280] mb-2 uppercase tracking-wide">Staked Since</p>
                  <p className="text-white font-semibold text-sm">
                    {new Date(stakingStatus.stakingRecord.timestamp).toLocaleDateString()}
                  </p>
                </div>
              </>
            )}
            <div className="bg-[#0a0a0f] border border-[#1f2937] rounded-lg p-4">
              <p className="text-xs text-[#6b7280] mb-2 uppercase tracking-wide">Reward Amount</p>
              <p className="text-white font-semibold text-sm">{rewardAmount} SOL</p>
            </div>
            <div className="bg-[#0a0a0f] border border-[#1f2937] rounded-lg p-4">
              <p className="text-xs text-[#6b7280] mb-2 uppercase tracking-wide">Network</p>
              <p className="text-white font-semibold text-sm">Solana Devnet</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
