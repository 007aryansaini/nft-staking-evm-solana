/**
 * Solana Configuration
 * Centralized configuration for Solana network settings
 */
export class SolanaConfig {
  constructor() {
    this.network = process.env.SOLANA_NETWORK || 'devnet';
    this.rpcUrl = process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com';
    // Default reward address for devnet testing
    this.rewardAddress = process.env.SOLANA_REWARD_ADDRESS || 'Bm6s6jj7swJuR6P3fJGfsFAs5Agj6wsjhCnTJGemKZg9';
    this.stakingFee = 0.001; // 0.001 SOL
    this.rewardAmount = 0.0005; // 0.0005 SOL
  }

  /**
   * Validates configuration
   * @returns {boolean}
   */
  isValid() {
    return !!this.rewardAddress;
  }
}

