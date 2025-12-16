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
   * Unstakes NFTs (removes the staking record from database)
   * @param {string} walletAddress - User's wallet address
   * @returns {Promise<Object>}
   */
  async unstake(walletAddress) {
    if (!walletAddress) {
      throw new Error('Wallet address is required');
    }

    // Find active stake (there should only be one)
    const activeStakes = await this.repository.findActiveByWalletAddress(walletAddress);
    if (activeStakes.length === 0) {
      throw new Error('No active stake found for this wallet');
    }

    // Get the most recent active stake (should be the only one)
    const record = activeStakes[activeStakes.length - 1];

    // Delete the record from the database
    const deleted = await this.repository.delete(walletAddress, record.transactionSignature);
    
    if (!deleted) {
      throw new Error('Failed to delete stake record');
    }

    return { message: 'Stake record deleted successfully', deletedRecord: record };
  }

  /**
   * Claims rewards (updates staking record)
   * Note: In production, you'd need the reward address private key to send SOL
   * For this demo, we just update the backend record
   * @param {string} walletAddress - User's wallet address
   * @returns {Promise<StakingRecord>}
   */
  async claimRewards(walletAddress) {
    if (!walletAddress) {
      throw new Error('Wallet address is required');
    }

    // Find active stake
    const activeStakes = await this.repository.findActiveByWalletAddress(walletAddress);
    if (activeStakes.length === 0) {
      throw new Error('No active stake found for this wallet');
    }

    const record = activeStakes[activeStakes.length - 1];

    // Calculate pending rewards
    const rewards = await this.getPendingRewards(walletAddress);

    // Update the specific active record
    const records = await this.repository.readAll();
    let updatedRecord = null;
    
    for (let i = 0; i < records.length; i++) {
      if (records[i].walletAddress === walletAddress && 
          records[i].isActive === true &&
          records[i].transactionSignature === record.transactionSignature) {
        records[i] = {
          ...records[i],
          lastClaimTimestamp: Date.now(),
          claimedRewards: (record.claimedRewards || 0) + rewards.pendingRewards,
        };
        updatedRecord = records[i];
        break;
      }
    }
    
    if (!updatedRecord) {
      throw new Error('Stake record not found');
    }

    await this.repository.writeAll(records);
    return updatedRecord;
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

    // Find active stake
    const activeStakes = await this.repository.findActiveByWalletAddress(walletAddress);
    if (activeStakes.length === 0) {
      return {
        walletAddress,
        pendingRewards: 0,
        totalClaimed: 0,
        isActive: false,
      };
    }

    // Get the most recent active stake
    const record = activeStakes[activeStakes.length - 1];

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

    // Find active stake
    const activeStakes = await this.repository.findActiveByWalletAddress(walletAddress);
    const record = activeStakes.length > 0 ? activeStakes[activeStakes.length - 1] : null;
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

