import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { StakingService } from '../services/StakingService.js';
import { StakingRecord } from '../models/StakingRecord.js';

describe('StakingService', () => {
  let stakingService;
  let mockRepository;
  let mockSolanaService;

  beforeEach(() => {
    mockRepository = {
      findByWalletAddress: jest.fn(),
      findActiveByWalletAddress: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      findAll: jest.fn(),
    };

    mockSolanaService = {
      createStakingTransaction: jest.fn(),
      createRewardTransaction: jest.fn(),
      verifyTransaction: jest.fn(),
    };

    stakingService = new StakingService(mockRepository, mockSolanaService);
  });

  describe('stake', () => {
    it('should create a new staking record', async () => {
      const walletAddress = 'test123';
      const transactionSignature = 'sig123';

      mockRepository.findActiveByWalletAddress.mockResolvedValue([]);
      mockRepository.create.mockResolvedValue({});

      const record = await stakingService.stake(walletAddress, transactionSignature);

      expect(record).toBeInstanceOf(StakingRecord);
      expect(record.walletAddress).toBe(walletAddress);
      expect(record.transactionSignature).toBe(transactionSignature);
      expect(record.isActive).toBe(true);
      expect(mockRepository.create).toHaveBeenCalled();
    });

    it('should throw error if user already has active stake', async () => {
      const walletAddress = 'test123';
      const transactionSignature = 'sig123';

      mockRepository.findActiveByWalletAddress.mockResolvedValue([{ isActive: true }]);

      await expect(
        stakingService.stake(walletAddress, transactionSignature)
      ).rejects.toThrow('User already has an active stake');
    });

    it('should throw error if wallet address is missing', async () => {
      await expect(stakingService.stake(null, 'sig123')).rejects.toThrow(
        'Wallet address and transaction signature are required'
      );
    });
  });

  describe('unstake', () => {
    it('should mark stake as inactive', async () => {
      const walletAddress = 'test123';
      const existingRecord = {
        walletAddress,
        isActive: true,
        timestamp: Date.now(),
      };

      mockRepository.findByWalletAddress.mockResolvedValue(existingRecord);
      mockRepository.update.mockResolvedValue({ ...existingRecord, isActive: false });

      const result = await stakingService.unstake(walletAddress);

      expect(mockRepository.update).toHaveBeenCalledWith(walletAddress, { isActive: false });
      expect(result.isActive).toBe(false);
    });

    it('should throw error if no active stake found', async () => {
      mockRepository.findByWalletAddress.mockResolvedValue(null);

      await expect(stakingService.unstake('test123')).rejects.toThrow(
        'No active stake found for this wallet'
      );
    });

    it('should throw error if wallet address is missing', async () => {
      await expect(stakingService.unstake(null)).rejects.toThrow('Wallet address is required');
    });
  });

  describe('claimRewards', () => {
    it('should create reward transaction and update record', async () => {
      const walletAddress = 'test123';
      const existingRecord = {
        walletAddress,
        isActive: true,
        timestamp: Date.now(),
        claimedRewards: 0,
      };

      const mockTransaction = { serialized: 'test' };

      mockRepository.findByWalletAddress.mockResolvedValue(existingRecord);
      mockSolanaService.createRewardTransaction.mockResolvedValue(mockTransaction);
      mockRepository.update.mockResolvedValue({ ...existingRecord, claimedRewards: 0.0005 });

      const transaction = await stakingService.claimRewards(walletAddress);

      expect(mockSolanaService.createRewardTransaction).toHaveBeenCalledWith(walletAddress);
      expect(mockRepository.update).toHaveBeenCalled();
      expect(transaction).toBe(mockTransaction);
    });

    it('should throw error if no active stake found', async () => {
      mockRepository.findByWalletAddress.mockResolvedValue(null);

      await expect(stakingService.claimRewards('test123')).rejects.toThrow(
        'No active stake found for this wallet'
      );
    });
  });

  describe('getPendingRewards', () => {
    it('should calculate pending rewards for active stake', async () => {
      const walletAddress = 'test123';
      const now = Date.now();
      const oneHourAgo = now - 3600000; // 1 hour ago
      const existingRecord = {
        walletAddress,
        isActive: true,
        timestamp: oneHourAgo,
        lastClaimTimestamp: oneHourAgo,
        claimedRewards: 0,
      };

      mockRepository.findByWalletAddress.mockResolvedValue(existingRecord);

      const rewards = await stakingService.getPendingRewards(walletAddress);

      expect(rewards.walletAddress).toBe(walletAddress);
      expect(rewards.isActive).toBe(true);
      expect(rewards.pendingRewards).toBeGreaterThan(0);
    });

    it('should return zero rewards for inactive stake', async () => {
      const walletAddress = 'test123';
      mockRepository.findByWalletAddress.mockResolvedValue(null);

      const rewards = await stakingService.getPendingRewards(walletAddress);

      expect(rewards.pendingRewards).toBe(0);
      expect(rewards.isActive).toBe(false);
    });
  });

  describe('getStakingStatus', () => {
    it('should return complete staking status', async () => {
      const walletAddress = 'test123';
      const existingRecord = {
        walletAddress,
        isActive: true,
        timestamp: Date.now(),
      };

      mockRepository.findByWalletAddress.mockResolvedValue(existingRecord);

      const status = await stakingService.getStakingStatus(walletAddress);

      expect(status.walletAddress).toBe(walletAddress);
      expect(status.isStaked).toBe(true);
      expect(status.stakingRecord).toEqual(existingRecord);
      expect(status.rewards).toBeDefined();
    });
  });
});

