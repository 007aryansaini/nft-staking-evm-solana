/**
 * Solana Transaction Utilities
 * Helper functions for creating Solana transactions
 */
import { Transaction, SystemProgram, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { SOLANA_CONFIG } from './config';

/**
 * Creates a staking transaction that transfers SOL to reward address
 * @param fromAddress - User's wallet address
 * @param amount - Amount in SOL (default: 0.001)
 * @returns Transaction ready to be signed
 */
export async function createStakingTransaction(
  fromAddress: string,
  amount: number = SOLANA_CONFIG.STAKING_FEE
): Promise<Transaction> {
  const fromPublicKey = new PublicKey(fromAddress);
  const rewardPublicKey = new PublicKey(SOLANA_CONFIG.REWARD_ADDRESS);

  const transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: fromPublicKey,
      toPubkey: rewardPublicKey,
      lamports: amount * LAMPORTS_PER_SOL,
    })
  );

  return transaction;
}

/**
 * Creates a reward claim transaction that sends SOL back to user
 * @param toAddress - User's wallet address
 * @param amount - Amount in SOL (default: 0.0005)
 * @returns Transaction ready to be signed
 */
export async function createRewardTransaction(
  toAddress: string,
  amount: number = SOLANA_CONFIG.REWARD_AMOUNT
): Promise<Transaction> {
  const toPublicKey = new PublicKey(toAddress);
  const rewardPublicKey = new PublicKey(SOLANA_CONFIG.REWARD_ADDRESS);

  const transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: rewardPublicKey,
      toPubkey: toPublicKey,
      lamports: amount * LAMPORTS_PER_SOL,
    })
  );

  return transaction;
}

