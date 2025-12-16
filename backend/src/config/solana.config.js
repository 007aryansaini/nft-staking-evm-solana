/**
 * Solana Configuration
 * Centralized configuration for Solana network settings
 */
export class SolanaConfig {
  constructor() {
    this.network = process.env.SOLANA_NETWORK || 'devnet';
    this.rpcUrl = process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com';
    this.rewardAddress = process.env.SOLANA_REWARD_ADDRESS || '';
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

