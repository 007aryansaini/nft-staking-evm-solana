import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { Container } from '../di/container.js';
import { StakingRepository } from '../repositories/StakingRepository.js';
import { SolanaService } from '../services/SolanaService.js';
import { StakingService } from '../services/StakingService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Integration Tests', () => {
  let container;
  let testDataPath;

  beforeEach(() => {
    testDataPath = path.join(__dirname, '../../data/test-integration-records.json');
    container = new Container();

    // Register test services
    container.register('config', () => ({
      rpcUrl: 'https://api.devnet.solana.com',
      rewardAddress: '11111111111111111111111111111111',
    }), true);

    container.register('repository', () => {
      return new StakingRepository(testDataPath);
    }, true);

    container.register('solanaService', (container) => {
      const config = container.resolve('config');
      const connection = SolanaService.createConnection(config.rpcUrl);
      return new SolanaService(connection, config.rewardAddress);
    }, true);

    container.register('stakingService', (container) => {
      const repository = container.resolve('repository');
      const solanaService = container.resolve('solanaService');
      return new StakingService(repository, solanaService);
    }, true);
  });

  afterEach(async () => {
    // Clean up test file
    try {
      await fs.unlink(testDataPath);
    } catch (error) {
      // Ignore errors
    }
  });

  describe('Full Staking Flow', () => {
    it('should complete full stake -> claim -> unstake flow', async () => {
      const stakingService = container.resolve('stakingService');
      const walletAddress = 'test-wallet-123';
      const transactionSignature = 'test-sig-123';

      // Stake
      const stakeRecord = await stakingService.stake(walletAddress, transactionSignature);
      expect(stakeRecord.isActive).toBe(true);

      // Get pending rewards
      const rewards = await stakingService.getPendingRewards(walletAddress);
      expect(rewards.isActive).toBe(true);

      // Get status
      const status = await stakingService.getStakingStatus(walletAddress);
      expect(status.isStaked).toBe(true);

      // Unstake
      const unstakeResult = await stakingService.unstake(walletAddress);
      expect(unstakeResult.isActive).toBe(false);

      // Verify unstaked
      const finalStatus = await stakingService.getStakingStatus(walletAddress);
      expect(finalStatus.isStaked).toBe(false);
    });

    it('should prevent double staking', async () => {
      const stakingService = container.resolve('stakingService');
      const walletAddress = 'test-wallet-456';
      const transactionSignature = 'test-sig-456';

      await stakingService.stake(walletAddress, transactionSignature);

      // Try to stake again
      await expect(
        stakingService.stake(walletAddress, 'another-sig')
      ).rejects.toThrow('User already has an active stake');
    });
  });

  describe('Dependency Injection', () => {
    it('should resolve all services correctly', () => {
      const repository = container.resolve('repository');
      const solanaService = container.resolve('solanaService');
      const stakingService = container.resolve('stakingService');

      expect(repository).toBeDefined();
      expect(solanaService).toBeDefined();
      expect(stakingService).toBeDefined();
      expect(stakingService.repository).toBe(repository);
      expect(stakingService.solanaService).toBe(solanaService);
    });

    it('should use singleton pattern', () => {
      const service1 = container.resolve('stakingService');
      const service2 = container.resolve('stakingService');

      expect(service1).toBe(service2);
    });
  });
});

