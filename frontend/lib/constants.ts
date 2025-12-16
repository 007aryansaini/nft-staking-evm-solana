/**
 * Contract Addresses and Constants
 * EVM contract addresses for Sepolia Testnet
 */

export const EVM_CONTRACTS = {
  // Staking Contract Address (Sepolia Testnet)
  STAKING_CONTRACT: '0x51BF6f7D01A82a268C01b9c6Aee27c7B63B8EEbd',
  
  // NFT Collection Address (Sepolia Testnet)
  NFT_COLLECTION: '0x4Dc390a7e893e17d25c2247D5cf3718F6E3759bF',
  
  // Reward Token Address (Sepolia Testnet)
  REWARD_TOKEN: '0x99d0cDA8Db2d627a0ef38F57f4b1C8CbC2caefcc',
} as const;

export const EVM_CONSTANTS = {
  REWARD_RATE: '0.01', // tokens per second per NFT
  EXPLORER_URL: 'https://sepolia.etherscan.io',
} as const;

