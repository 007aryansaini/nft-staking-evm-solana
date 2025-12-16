/**
 * Staking Record Model
 * Represents a staking record in the system
 */
export class StakingRecord {
  /**
   * @param {string} walletAddress - User's wallet address
   * @param {number} timestamp - Staking timestamp
   * @param {string} transactionSignature - Transaction signature
   * @param {boolean} isActive - Whether the stake is active
   * @param {number} claimedRewards - Total claimed rewards
   */
  constructor(walletAddress, timestamp, transactionSignature, isActive = true, claimedRewards = 0) {
    this.walletAddress = walletAddress;
    this.timestamp = timestamp;
    this.transactionSignature = transactionSignature;
    this.isActive = isActive;
    this.claimedRewards = claimedRewards;
    this.lastClaimTimestamp = timestamp;
  }

  /**
   * Creates a StakingRecord from JSON
   * @param {Object} json
   * @returns {StakingRecord}
   */
  static fromJSON(json) {
    const record = new StakingRecord(
      json.walletAddress,
      json.timestamp,
      json.transactionSignature,
      json.isActive,
      json.claimedRewards
    );
    record.lastClaimTimestamp = json.lastClaimTimestamp || json.timestamp;
    return record;
  }

  /**
   * Converts to JSON
   * @returns {Object}
   */
  toJSON() {
    return {
      walletAddress: this.walletAddress,
      timestamp: this.timestamp,
      transactionSignature: this.transactionSignature,
      isActive: this.isActive,
      claimedRewards: this.claimedRewards,
      lastClaimTimestamp: this.lastClaimTimestamp,
    };
  }
}

