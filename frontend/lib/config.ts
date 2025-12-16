/**
 * Application Configuration
 */
import { EVM_CONTRACTS, EVM_CONSTANTS } from './constants';

// EVM Configuration
export const EVM_CONFIG = {
  ...EVM_CONTRACTS,
  ...EVM_CONSTANTS,
} as const;

// Solana Configuration
export const SOLANA_CONFIG = {
  NETWORK: 'devnet',
  RPC_URL: process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.devnet.solana.com',
  EXPLORER_URL: 'https://explorer.solana.com',
  REWARD_ADDRESS: 'Bm6s6jj7swJuR6P3fJGfsFAs5Agj6wsjhCnTJGemKZg9', // Reward address for staking fees
  STAKING_FEE: 0.001, // SOL
  REWARD_AMOUNT: 0.0005, // SOL
} as const;

// Backend API
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  ENDPOINTS: {
    CREATE_STAKING_TX: '/api/solana/create-staking-transaction',
    STAKE: '/api/solana/stake',
    UNSTAKE: '/api/solana/unstake',
    CLAIM_REWARDS: '/api/solana/claim-rewards',
    PENDING_REWARDS: '/api/solana/pending-rewards',
    STATUS: '/api/solana/status',
    RECORDS: '/api/solana/records',
  },
} as const;

// Network Types
export type NetworkType = 'evm' | 'solana';

