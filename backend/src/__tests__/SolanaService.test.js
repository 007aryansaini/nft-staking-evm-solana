import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { SolanaService } from '../services/SolanaService.js';

describe('SolanaService', () => {
  let solanaService;
  let mockConnection;
  const testRewardAddress = '11111111111111111111111111111111';

  beforeEach(() => {
    mockConnection = {
      getLatestBlockhash: jest.fn().mockResolvedValue({
        blockhash: 'test-blockhash',
      }),
      getSignatureStatus: jest.fn(),
      getTransaction: jest.fn(),
      getBalance: jest.fn(),
    };

    solanaService = new SolanaService(mockConnection, testRewardAddress);
  });

  describe('isValidAddress', () => {
    it('should validate correct Solana address', () => {
      const result = solanaService.isValidAddress(testRewardAddress);
      expect(result).toBe(true);
    });

    it('should reject invalid address', () => {
      const result = solanaService.isValidAddress('invalid-address-format');
      expect(result).toBe(false);
    });
  });

  describe('createStakingTransaction', () => {
    it('should create a staking transaction', async () => {
      // Use a valid Solana address format (base58 encoded, 32-44 chars)
      const fromAddress = 'So11111111111111111111111111111111111111112';
      const transaction = await solanaService.createStakingTransaction(fromAddress);

      expect(mockConnection.getLatestBlockhash).toHaveBeenCalled();
      expect(transaction).toBeDefined();
    });

    it('should throw error for invalid from address', async () => {
      await expect(
        solanaService.createStakingTransaction('invalid')
      ).rejects.toThrow('Invalid from address');
    });
  });

  describe('createRewardTransaction', () => {
    it('should create a reward transaction', async () => {
      // Use a valid Solana address format (base58 encoded, 32-44 chars)
      const toAddress = 'So11111111111111111111111111111111111111112';
      const transaction = await solanaService.createRewardTransaction(toAddress);

      expect(mockConnection.getLatestBlockhash).toHaveBeenCalled();
      expect(transaction).toBeDefined();
    });

    it('should throw error for invalid to address', async () => {
      await expect(
        solanaService.createRewardTransaction('invalid')
      ).rejects.toThrow('Invalid to address');
    });
  });

  describe('verifyTransaction', () => {
    it('should verify a transaction signature', async () => {
      const mockStatus = {
        confirmationStatus: 'confirmed',
      };
      mockConnection.getSignatureStatus.mockResolvedValue({ value: mockStatus });

      const result = await solanaService.verifyTransaction('test-sig');
      expect(result).toEqual(mockStatus);
    });

    it('should return null on error', async () => {
      mockConnection.getSignatureStatus.mockRejectedValue(new Error('Not found'));

      const result = await solanaService.verifyTransaction('invalid-sig');
      expect(result).toBeNull();
    });
  });

  describe('getBalance', () => {
    it('should get account balance', async () => {
      const balanceLamports = 1000000000; // 1 SOL
      mockConnection.getBalance.mockResolvedValue(balanceLamports);

      const balance = await solanaService.getBalance(testRewardAddress);
      expect(balance).toBe(1);
    });

    it('should throw error for invalid address', async () => {
      await expect(solanaService.getBalance('invalid')).rejects.toThrow('Invalid address');
    });
  });
});

