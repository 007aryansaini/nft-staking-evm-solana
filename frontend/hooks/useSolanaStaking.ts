/**
 * Custom hook for Solana staking operations
 * Implements the staking flow: Create transaction → Sign in wallet → Send → Record in backend
 */
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { apiService, StakingStatus } from '@/lib/api';
import { SOLANA_CONFIG } from '@/lib/config';
import { createStakingTransaction, createRewardTransaction } from '@/lib/solana';
import toast from 'react-hot-toast';

export function useSolanaStaking() {
  const { publicKey, signTransaction, sendTransaction, connected } = useWallet();
  const { connection } = useConnection();
  const [stakingStatus, setStakingStatus] = useState<StakingStatus | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Separate loading states for each action
  const [isStaking, setIsStaking] = useState(false);
  const [isUnstaking, setIsUnstaking] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  
  // Separate button text for each action
  const [stakeButtonText, setStakeButtonText] = useState('');
  const [unstakeButtonText, setUnstakeButtonText] = useState('');
  const [claimButtonText, setClaimButtonText] = useState('');

  const walletAddress = publicKey?.toBase58() || '';

  // Fetch staking status
  const fetchStatus = useCallback(async () => {
    if (!walletAddress) {
      setStakingStatus(null);
      return;
    }

    try {
      setIsRefreshing(true);
      const response = await apiService.getStakingStatus(walletAddress);
      if (response.success) {
        setStakingStatus(response.data);
      }
    } catch (error: any) {
      console.error('Failed to fetch staking status:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [walletAddress]);

  // Auto-refresh status
  useEffect(() => {
    if (walletAddress) {
      fetchStatus();
      const interval = setInterval(fetchStatus, 10000); // Refresh every 10 seconds
      return () => clearInterval(interval);
    }
  }, [walletAddress, fetchStatus]);

  // Handle stake - Create transaction, sign in wallet, send, then record
  const handleStake = useCallback(async () => {
    if (!publicKey || !signTransaction || !sendTransaction || !connected) {
      toast.error('Please connect your Phantom wallet', {
        position: 'top-right',
        autoClose: 3000,
      });
      return;
    }

    const walletAddr = publicKey.toBase58();

    setIsStaking(true);
    setStakeButtonText('Creating transaction...');
    const toastId = toast.loading('Creating staking transaction...', {
      position: 'top-right',
    });

    try {
      // Create the staking transaction (transfers 0.001 SOL to reward address)
      const transaction = await createStakingTransaction(
        walletAddr,
        SOLANA_CONFIG.STAKING_FEE
      );

      // Get recent blockhash
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      toast.dismiss(toastId);
      toast.loading('Please approve the transaction in your wallet...', {
        id: toastId,
        position: 'top-right',
      });
      setStakeButtonText('Waiting for wallet approval...');

      // Sign transaction (this will pop up the wallet)
      const signedTransaction = await signTransaction(transaction);

      toast.loading('Sending transaction to network...', {
        id: toastId,
        position: 'top-right',
      });
      setStakeButtonText('Sending transaction...');

      // Send and confirm transaction
      const signature = await sendTransaction(signedTransaction, connection, {
        skipPreflight: false,
      });

      toast.loading('Waiting for confirmation...', {
        id: toastId,
        position: 'top-right',
      });
      setStakeButtonText('Confirming...');

      // Wait for confirmation
      await connection.confirmTransaction({
        signature,
        blockhash,
        lastValidBlockHeight,
      }, 'confirmed');

      toast.dismiss(toastId);
      toast.success('Transaction confirmed! Recording stake...', {
        position: 'top-right',
        autoClose: 3000,
      });
      setStakeButtonText('Recording stake...');

      // Record the stake in backend
      const stakeResponse = await apiService.stake(walletAddr, signature);
      
      if (stakeResponse.success) {
        toast.success('NFT staked successfully!', {
          position: 'top-right',
          autoClose: 5000,
        });
        // Immediately refresh status
        await fetchStatus();
      } else {
        throw new Error(stakeResponse.error || 'Failed to record stake');
      }

      setIsStaking(false);
      setStakeButtonText('');
    } catch (error: any) {
      console.error('Stake error:', error);
      toast.dismiss(toastId);
      
      if (error?.message?.includes('User rejected') || error?.message?.includes('User cancelled')) {
        toast.error('Transaction cancelled by user', {
          position: 'top-right',
          autoClose: 3000,
        });
      } else {
        toast.error(error?.message || 'Failed to stake NFT', {
          position: 'top-right',
          autoClose: 5000,
        });
      }
      
      setIsStaking(false);
      setStakeButtonText('');
    }
  }, [publicKey, signTransaction, sendTransaction, connected, connection, fetchStatus]);

  // Handle unstake
  const handleUnstake = useCallback(async () => {
    if (!publicKey || !connected) {
      toast.error('Please connect your Phantom wallet', {
        position: 'top-right',
        autoClose: 3000,
      });
      return;
    }

    if (!stakingStatus?.isStaked) {
      toast.error('No active stake found', {
        position: 'top-right',
        autoClose: 3000,
      });
      return;
    }

    setIsUnstaking(true);
    setUnstakeButtonText('Unstaking...');
    const toastId = toast.loading('Unstaking NFT...', {
      position: 'top-right',
    });

    try {
      const response = await apiService.unstake(walletAddress);
      
      if (response.success) {
        toast.dismiss(toastId);
        toast.success('NFT unstaked successfully!', {
          position: 'top-right',
          autoClose: 5000,
        });
        // Immediately refresh status
        await fetchStatus();
      } else {
        throw new Error(response.error || 'Failed to unstake');
      }

      setIsUnstaking(false);
      setUnstakeButtonText('');
    } catch (error: any) {
      console.error('Unstake error:', error);
      toast.dismiss(toastId);
      toast.error(error?.message || 'Failed to unstake NFT', {
        position: 'top-right',
        autoClose: 5000,
      });
      
      setIsUnstaking(false);
      setUnstakeButtonText('');
    }
  }, [publicKey, connected, walletAddress, stakingStatus, fetchStatus]);

  // Handle claim rewards - Update backend record
  // Note: In production, you'd need the reward address private key to send SOL
  // For this demo, we simulate the reward claim by updating the backend
  const handleClaimRewards = useCallback(async () => {
    if (!publicKey || !connected) {
      toast.error('Please connect your Phantom wallet', {
        position: 'top-right',
        autoClose: 3000,
      });
      return;
    }

    if (!stakingStatus?.isStaked) {
      toast.error('No active stake found', {
        position: 'top-right',
        autoClose: 3000,
      });
      return;
    }

    if ((stakingStatus.rewards.pendingRewards || 0) <= 0) {
      toast.error('No rewards to claim', {
        position: 'top-right',
        autoClose: 3000,
      });
      return;
    }

    setIsClaiming(true);
    setClaimButtonText('Claiming rewards...');
    const toastId = toast.loading('Claiming rewards...', {
      position: 'top-right',
    });

    try {
      // Update backend to mark rewards as claimed
      const claimResponse = await apiService.claimRewards(walletAddress);
      
      if (claimResponse.success) {
        toast.dismiss(toastId);
        toast.success(`Rewards claimed! ${claimResponse.data.rewardAmount} SOL recorded.`, {
          position: 'top-right',
          autoClose: 5000,
        });
        // Immediately refresh status to update rewards
        await fetchStatus();
      } else {
        throw new Error(claimResponse.error || 'Failed to claim rewards');
      }

      setIsClaiming(false);
      setClaimButtonText('');
    } catch (error: any) {
      console.error('Claim error:', error);
      toast.dismiss(toastId);
      toast.error(error?.message || 'Failed to claim rewards', {
        position: 'top-right',
        autoClose: 5000,
      });
      
      setIsClaiming(false);
      setClaimButtonText('');
    }
  }, [publicKey, connected, walletAddress, stakingStatus, fetchStatus]);

  return {
    address: walletAddress,
    isConnected: connected,
    stakingStatus,
    pendingRewards: stakingStatus?.rewards.pendingRewards || 0,
    totalClaimed: stakingStatus?.rewards.totalClaimed || 0,
    isStaked: stakingStatus?.isStaked || false,
    isLoading: isRefreshing,
    isStaking,
    isUnstaking,
    isClaiming,
    stakeButtonText,
    unstakeButtonText,
    claimButtonText,
    handleStake,
    handleUnstake,
    handleClaimRewards,
    refetch: fetchStatus,
  };
}
