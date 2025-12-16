/**
 * Custom hook for EVM staking operations with proper transaction handling
 */
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAccount, useWriteContract, useReadContract, useWaitForTransactionReceipt, usePublicClient, useWalletClient } from 'wagmi';
import { formatEther } from 'viem';
import { EVM_CONFIG } from '@/lib/config';
import { NFT_STAKING_ABI, ERC721_ABI } from '@/lib/contracts';
import toast from 'react-hot-toast';

export function useEVMStaking() {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const { writeContractAsync } = useWriteContract();
  
  const [stakedTokens, setStakedTokens] = useState<bigint[]>([]);
  const [pendingRewards, setPendingRewards] = useState<string>('0');
  const [totalClaimed, setTotalClaimed] = useState<string>('0');
  const [isLoading, setIsLoading] = useState(false);
  const [buttonText, setButtonText] = useState('');

  // Read contract functions
  const { data: stakedTokensData, refetch: refetchStakedTokens } = useReadContract({
    address: EVM_CONFIG.STAKING_CONTRACT as `0x${string}`,
    abi: NFT_STAKING_ABI,
    functionName: 'getStakedTokens',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && isConnected,
    },
  });

  const { data: pendingRewardsData, refetch: refetchRewards } = useReadContract({
    address: EVM_CONFIG.STAKING_CONTRACT as `0x${string}`,
    abi: NFT_STAKING_ABI,
    functionName: 'getPendingRewards',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && isConnected,
      refetchInterval: 5000,
    },
  });

  const { data: totalClaimedData } = useReadContract({
    address: EVM_CONFIG.STAKING_CONTRACT as `0x${string}`,
    abi: NFT_STAKING_ABI,
    functionName: 'totalClaimedRewards',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && isConnected,
    },
  });

  // Update state when data changes
  useEffect(() => {
    if (stakedTokensData) {
      setStakedTokens(stakedTokensData as bigint[]);
    }
  }, [stakedTokensData]);

  useEffect(() => {
    if (pendingRewardsData) {
      setPendingRewards(formatEther(pendingRewardsData as bigint));
    }
  }, [pendingRewardsData]);

  useEffect(() => {
    if (totalClaimedData) {
      setTotalClaimed(formatEther(totalClaimedData as bigint));
    }
  }, [totalClaimedData]);

  // Handle stake transaction with approval check
  const handleStake = useCallback(async (tokenId: string) => {
    if (!address || !isConnected) {
      toast.error('Please connect your wallet', {
        position: 'top-right',
        duration: 3000,
      });
      return;
    }

    if (!tokenId || isNaN(parseInt(tokenId))) {
      toast.error('Invalid token ID', {
        position: 'top-right',
        duration: 3000,
      });
      return;
    }

    if (!publicClient || !walletClient) {
      toast.error('Wallet client not ready', {
        position: 'top-right',
        duration: 3000,
      });
      return;
    }

    setIsLoading(true);
    setButtonText('Checking approval...');
    const toastId = toast.loading('Checking NFT approval...', {
      position: 'top-right',
    });

    try {
      // Check if token is already staked
      const isStaked = await publicClient.readContract({
        address: EVM_CONFIG.STAKING_CONTRACT as `0x${string}`,
        abi: NFT_STAKING_ABI,
        functionName: 'isTokenStaked',
        args: [BigInt(tokenId)],
      });

      if (isStaked) {
        toast.dismiss(toastId);
        toast.error('This NFT is already staked', {
          position: 'top-right',
          duration: 3000,
        });
        setIsLoading(false);
        setButtonText('');
        return;
      }

      // Check approval
      const approved = await publicClient.readContract({
        address: EVM_CONFIG.NFT_COLLECTION as `0x${string}`,
        abi: ERC721_ABI,
        functionName: 'getApproved',
        args: [BigInt(tokenId)],
      });

      const stakingAddress = EVM_CONFIG.STAKING_CONTRACT as `0x${string}`;
      
      // If not approved, request approval
      if (approved.toLowerCase() !== stakingAddress.toLowerCase()) {
        toast.dismiss(toastId);
        toast.loading('Approving NFT...', {
          id: toastId,
          position: 'top-right',
        });
        setButtonText('Approving NFT...');

        const approveHash = await writeContractAsync({
          address: EVM_CONFIG.NFT_COLLECTION as `0x${string}`,
          abi: ERC721_ABI,
          functionName: 'approve',
          args: [stakingAddress, BigInt(tokenId)],
        }) as `0x${string}`;

        toast.loading('Waiting for approval confirmation...', {
          id: toastId,
          position: 'top-right',
        });
        setButtonText('Waiting for confirmation...');

        await publicClient.waitForTransactionReceipt({ hash: approveHash });

        toast.success('NFT approved successfully!', {
          id: toastId,
          position: 'top-right',
          duration: 3000,
        });
      }

      // Now stake the NFT
      toast.loading('Staking NFT...', {
        id: toastId,
        position: 'top-right',
      });
      setButtonText('Staking NFT...');

      const stakeHash = await writeContractAsync({
        address: stakingAddress,
        abi: NFT_STAKING_ABI,
        functionName: 'stake',
        args: [BigInt(tokenId)],
      }) as `0x${string}`;

      toast.loading('Waiting for transaction confirmation...', {
        id: toastId,
        position: 'top-right',
      });
      setButtonText('Waiting for confirmation...');

      await publicClient.waitForTransactionReceipt({ hash: stakeHash });

      toast.success('NFT staked successfully!', {
        id: toastId,
        position: 'top-right',
        duration: 5000,
      });

      // Refresh data
      await refetchStakedTokens();
      await refetchRewards();

      setIsLoading(false);
      setButtonText('');
    } catch (error: any) {
      console.error('Stake error:', error);
      toast.dismiss(toastId);
      
      if (error?.message?.includes('User rejected')) {
        toast.error('Transaction rejected by user', {
          position: 'top-right',
          duration: 3000,
        });
      } else {
        toast.error(error?.message || 'Failed to stake NFT', {
          position: 'top-right',
          duration: 5000,
        });
      }
      
      setIsLoading(false);
      setButtonText('');
    }
  }, [address, isConnected, publicClient, walletClient, writeContractAsync, refetchStakedTokens, refetchRewards]);

  // Handle unstake transaction
  const handleUnstake = useCallback(async (tokenId: string) => {
    if (!address || !isConnected) {
      toast.error('Please connect your wallet', {
        position: 'top-right',
        duration: 3000,
      });
      return;
    }

    if (!publicClient) {
      toast.error('Wallet client not ready', {
        position: 'top-right',
        duration: 3000,
      });
      return;
    }

    setIsLoading(true);
    setButtonText('Unstaking NFT...');
    const toastId = toast.loading('Unstaking NFT...', {
      position: 'top-right',
    });

    try {
      const unstakeHash = await writeContractAsync({
        address: EVM_CONFIG.STAKING_CONTRACT as `0x${string}`,
        abi: NFT_STAKING_ABI,
        functionName: 'unstake',
        args: [BigInt(tokenId)],
      }) as `0x${string}`;

      toast.loading('Waiting for transaction confirmation...', {
        id: toastId,
        position: 'top-right',
      });
      setButtonText('Waiting for confirmation...');

      await publicClient.waitForTransactionReceipt({ hash: unstakeHash });

      toast.success('NFT unstaked successfully!', {
        id: toastId,
        position: 'top-right',
        duration: 5000,
      });

      await refetchStakedTokens();
      await refetchRewards();

      setIsLoading(false);
      setButtonText('');
    } catch (error: any) {
      console.error('Unstake error:', error);
      toast.dismiss(toastId);
      
      if (error?.message?.includes('User rejected')) {
        toast.error('Transaction rejected by user', {
          position: 'top-right',
          duration: 3000,
        });
      } else {
        toast.error(error?.message || 'Failed to unstake NFT', {
          position: 'top-right',
          duration: 5000,
        });
      }
      
      setIsLoading(false);
      setButtonText('');
    }
  }, [address, isConnected, publicClient, writeContractAsync, refetchStakedTokens, refetchRewards]);

  // Handle claim rewards
  const handleClaimRewards = useCallback(async () => {
    if (!address || !isConnected) {
      toast.error('Please connect your wallet', {
        position: 'top-right',
        duration: 3000,
      });
      return;
    }

    if (parseFloat(pendingRewards) === 0) {
      toast.error('No rewards to claim', {
        position: 'top-right',
        duration: 3000,
      });
      return;
    }

    if (!publicClient) {
      toast.error('Wallet client not ready', {
        position: 'top-right',
        duration: 3000,
      });
      return;
    }

    setIsLoading(true);
    setButtonText('Claiming rewards...');
    const toastId = toast.loading('Claiming rewards...', {
      position: 'top-right',
    });

    try {
      const claimHash = await writeContractAsync({
        address: EVM_CONFIG.STAKING_CONTRACT as `0x${string}`,
        abi: NFT_STAKING_ABI,
        functionName: 'claimRewards',
      }) as `0x${string}`;

      toast.loading('Waiting for transaction confirmation...', {
        id: toastId,
        position: 'top-right',
      });
      setButtonText('Waiting for confirmation...');

      await publicClient.waitForTransactionReceipt({ hash: claimHash });

      toast.success('Rewards claimed successfully!', {
        id: toastId,
        position: 'top-right',
        duration: 5000,
      });

      await refetchRewards();

      setIsLoading(false);
      setButtonText('');
    } catch (error: any) {
      console.error('Claim error:', error);
      toast.dismiss(toastId);
      
      if (error?.message?.includes('User rejected')) {
        toast.error('Transaction rejected by user', {
          position: 'top-right',
          duration: 3000,
        });
      } else {
        toast.error(error?.message || 'Failed to claim rewards', {
          position: 'top-right',
          duration: 5000,
        });
      }
      
      setIsLoading(false);
      setButtonText('');
    }
  }, [address, isConnected, pendingRewards, publicClient, writeContractAsync, refetchRewards]);

  return {
    address,
    isConnected,
    stakedTokens: stakedTokens.map(t => t.toString()),
    pendingRewards,
    totalClaimed,
    isLoading,
    buttonText,
    handleStake,
    handleUnstake,
    handleClaimRewards,
    refetch: () => {
      refetchStakedTokens();
      refetchRewards();
    },
  };
}
