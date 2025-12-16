import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { StakingRepository } from '../repositories/StakingRepository.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('StakingRepository', () => {
  let repository;
  const testDataPath = path.join(__dirname, '../../data/test-staking-records.json');

  beforeEach(async () => {
    // Clean up test file first
    try {
      await fs.unlink(testDataPath);
    } catch (error) {
      // File doesn't exist, that's fine
    }
    // Create repository with test data path and wait for initialization
    repository = new StakingRepository(testDataPath);
    await repository.ensureDataFileExists();
  });

  afterEach(async () => {
    // Clean up test file
    try {
      await fs.unlink(testDataPath);
    } catch (error) {
      // Ignore errors
    }
  });

  describe('create', () => {
    it('should create a new staking record', async () => {
      const record = {
        walletAddress: 'test123',
        timestamp: Date.now(),
        transactionSignature: 'sig123',
        isActive: true,
        claimedRewards: 0,
      };

      const result = await repository.create(record);

      expect(result).toEqual(record);
      const allRecords = await repository.readAll();
      expect(allRecords).toHaveLength(1);
      expect(allRecords[0]).toEqual(record);
    });
  });

  describe('findByWalletAddress', () => {
    it('should find a record by wallet address', async () => {
      const record = {
        walletAddress: 'test123',
        timestamp: Date.now(),
        transactionSignature: 'sig123',
        isActive: true,
        claimedRewards: 0,
      };

      await repository.create(record);
      const found = await repository.findByWalletAddress('test123');

      expect(found).toEqual(record);
    });

    it('should return null if record not found', async () => {
      const found = await repository.findByWalletAddress('nonexistent');
      expect(found).toBeNull();
    });
  });

  describe('findActiveByWalletAddress', () => {
    it('should find only active records', async () => {
      const activeRecord = {
        walletAddress: 'test123',
        timestamp: Date.now(),
        transactionSignature: 'sig123',
        isActive: true,
        claimedRewards: 0,
      };

      const inactiveRecord = {
        walletAddress: 'test123',
        timestamp: Date.now(),
        transactionSignature: 'sig456',
        isActive: false,
        claimedRewards: 0,
      };

      await repository.create(activeRecord);
      await repository.create(inactiveRecord);

      const activeRecords = await repository.findActiveByWalletAddress('test123');
      expect(activeRecords).toHaveLength(1);
      expect(activeRecords[0].isActive).toBe(true);
    });
  });

  describe('update', () => {
    it('should update an existing record', async () => {
      const record = {
        walletAddress: 'test123',
        timestamp: Date.now(),
        transactionSignature: 'sig123',
        isActive: true,
        claimedRewards: 0,
      };

      await repository.create(record);
      const updated = await repository.update('test123', { isActive: false });

      expect(updated.isActive).toBe(false);
      const found = await repository.findByWalletAddress('test123');
      expect(found.isActive).toBe(false);
    });

    it('should return null if record not found', async () => {
      const updated = await repository.update('nonexistent', { isActive: false });
      expect(updated).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should return all records', async () => {
      const record1 = {
        walletAddress: 'test1',
        timestamp: Date.now(),
        transactionSignature: 'sig1',
        isActive: true,
        claimedRewards: 0,
      };

      const record2 = {
        walletAddress: 'test2',
        timestamp: Date.now(),
        transactionSignature: 'sig2',
        isActive: true,
        claimedRewards: 0,
      };

      await repository.create(record1);
      await repository.create(record2);

      const allRecords = await repository.findAll();
      expect(allRecords).toHaveLength(2);
    });
  });
});

