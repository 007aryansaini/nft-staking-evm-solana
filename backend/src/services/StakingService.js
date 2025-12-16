import { StakingRecord } from '../models/StakingRecord.js';

/**
 * Staking Service
 * Business logic for staking operations
 * Implements dependency injection pattern
 */
export class StakingService {
  /**
   * @param {StakingRepository} repository - Staking repository instance
   * @param {SolanaService} solanaService - Solana service instance
   */
  constructor(repository, solanaService) {
    this.repository = repository;
    this.solanaService = solanaService;
  }

  /**
   * Stakes NFTs (simplified - transfers 0.001 SOL to reward address)
   * @param {string} walletAddress - User's wallet address
   * @param {string} transactionSignature - Transaction signature
   * @returns {Promise<StakingRecord>}
   */
  async stake(walletAddress, transactionSignature) {
    if (!walletAddress || !transactionSignature) {
      throw new Error('Wallet address and transaction signature are required');
    }

    // Check if user already has an active stake
    const activeStakes = await this.repository.findActiveByWalletAddress(walletAddress);
    if (activeStakes.length > 0) {
      throw new Error('User already has an active stake');
    }

    const timestamp = Date.now();
    const record = new StakingRecord(walletAddress, timestamp, transactionSignature, true, 0);

    await this.repository.create(record.toJSON());
    return record;
  }

  /**
   * Unstakes NFTs (marks stake as inactive)
   * @param {string} walletAddress - User's wallet address
   * @returns {Promise<Object>}
   */
  async unstake(walletAddress) {
    if (!walletAddress) {
      throw new Error('Wallet address is required');
    }

    const record = await this.repository.findByWalletAddress(walletAddress);
    if (!record || !record.isActive) {
      throw new Error('No active stake found for this wallet');
    }

    const updated = await this.repository.update(walletAddress, {
      isActive: false,
    });

    if (!updated) {
      throw new Error('Failed to update stake record');
    }

    return updated;
  }

  /**
   * Claims rewards (creates reward transaction)
   * @param {string} walletAddress - User's wallet address
   * @returns {Promise<Transaction>}
   */
  async claimRewards(walletAddress) {
    if (!walletAddress) {
      throw new Error('Wallet address is required');
    }

    const record = await this.repository.findByWalletAddress(walletAddress);
    if (!record || !record.isActive) {
      throw new Error('No active stake found for this wallet');
    }

    // Create reward transaction
    const transaction = await this.solanaService.createRewardTransaction(walletAddress);

    // Update last claim timestamp
    await this.repository.update(walletAddress, {
      lastClaimTimestamp: Date.now(),
      claimedRewards: (record.claimedRewards || 0) + 0.0005,
    });

    return transaction;
  }

  /**
   * Gets pending rewards for a user
   * @param {string} walletAddress - User's wallet address
   * @returns {Promise<Object>}
   */
  async getPendingRewards(walletAddress) {
    if (!walletAddress) {
      throw new Error('Wallet address is required');
    }

    const record = await this.repository.findByWalletAddress(walletAddress);
    if (!record || !record.isActive) {
      return {
        walletAddress,
        pendingRewards: 0,
        totalClaimed: 0,
        isActive: false,
      };
    }

    // Calculate pending rewards based on time elapsed
    const now = Date.now();
    const lastClaim = record.lastClaimTimestamp || record.timestamp;
    const timeElapsed = (now - lastClaim) / 1000; // seconds
    const pendingRewards = timeElapsed * 0.00001; // Simplified reward calculation

    return {
      walletAddress,
      pendingRewards: Math.max(0, pendingRewards),
      totalClaimed: record.claimedRewards || 0,
      isActive: true,
      stakedSince: record.timestamp,
      lastClaimTimestamp: record.lastClaimTimestamp,
    };
  }

  /**
   * Gets staking status for a user
   * @param {string} walletAddress - User's wallet address
   * @returns {Promise<Object>}
   */
  async getStakingStatus(walletAddress) {
    if (!walletAddress) {
      throw new Error('Wallet address is required');
    }

    const record = await this.repository.findByWalletAddress(walletAddress);
    const rewards = await this.getPendingRewards(walletAddress);

    return {
      walletAddress,
      isStaked: record ? record.isActive : false,
      stakingRecord: record,
      rewards,
    };
  }

  /**
   * Gets all staking records
   * @returns {Promise<Array>}
   */
  async getAllRecords() {
    return await this.repository.findAll();
  }
}

