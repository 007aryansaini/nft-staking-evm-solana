import { describe, it, expect } from '@jest/globals';
import { StakingRecord } from '../models/StakingRecord.js';

describe('StakingRecord', () => {
  describe('constructor', () => {
    it('should create a StakingRecord with all properties', () => {
      const walletAddress = 'test123';
      const timestamp = Date.now();
      const transactionSignature = 'sig123';

      const record = new StakingRecord(walletAddress, timestamp, transactionSignature);

      expect(record.walletAddress).toBe(walletAddress);
      expect(record.timestamp).toBe(timestamp);
      expect(record.transactionSignature).toBe(transactionSignature);
      expect(record.isActive).toBe(true);
      expect(record.claimedRewards).toBe(0);
      expect(record.lastClaimTimestamp).toBe(timestamp);
    });

    it('should create a StakingRecord with custom values', () => {
      const record = new StakingRecord('test123', Date.now(), 'sig123', false, 0.001);

      expect(record.isActive).toBe(false);
      expect(record.claimedRewards).toBe(0.001);
    });
  });

  describe('fromJSON', () => {
    it('should create StakingRecord from JSON object', () => {
      const json = {
        walletAddress: 'test123',
        timestamp: 1234567890,
        transactionSignature: 'sig123',
        isActive: true,
        claimedRewards: 0.001,
        lastClaimTimestamp: 1234567890,
      };

      const record = StakingRecord.fromJSON(json);

      expect(record.walletAddress).toBe(json.walletAddress);
      expect(record.timestamp).toBe(json.timestamp);
      expect(record.transactionSignature).toBe(json.transactionSignature);
      expect(record.isActive).toBe(json.isActive);
      expect(record.claimedRewards).toBe(json.claimedRewards);
      expect(record.lastClaimTimestamp).toBe(json.lastClaimTimestamp);
    });

    it('should use timestamp as lastClaimTimestamp if not provided', () => {
      const json = {
        walletAddress: 'test123',
        timestamp: 1234567890,
        transactionSignature: 'sig123',
        isActive: true,
        claimedRewards: 0,
      };

      const record = StakingRecord.fromJSON(json);

      expect(record.lastClaimTimestamp).toBe(json.timestamp);
    });
  });

  describe('toJSON', () => {
    it('should convert StakingRecord to JSON object', () => {
      const record = new StakingRecord('test123', 1234567890, 'sig123', true, 0.001);
      const json = record.toJSON();

      expect(json).toEqual({
        walletAddress: 'test123',
        timestamp: 1234567890,
        transactionSignature: 'sig123',
        isActive: true,
        claimedRewards: 0.001,
        lastClaimTimestamp: 1234567890,
      });
    });
  });
});

