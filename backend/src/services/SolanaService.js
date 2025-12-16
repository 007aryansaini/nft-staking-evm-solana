import { Connection, Keypair, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import bs58 from 'bs58';

/**
 * Solana Service
 * Handles Solana blockchain interactions
 * Implements dependency injection pattern
 */
export class SolanaService {
  /**
   * @param {Connection} connection - Solana connection instance
   * @param {string} rewardAddress - Reward address for staking fees
   */
  constructor(connection = null, rewardAddress = '') {
    this.connection = connection;
    this.rewardAddress = rewardAddress;
  }

  /**
   * Creates a connection to Solana network
   * @param {string} rpcUrl
   * @returns {Connection}
   */
  static createConnection(rpcUrl) {
    return new Connection(rpcUrl, 'confirmed');
  }

  /**
   * Validates a Solana address
   * @param {string} address
   * @returns {boolean}
   */
  isValidAddress(address) {
    try {
      new PublicKey(address);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Creates a staking transaction (transfers 0.001 SOL to reward address)
   * @param {string} fromAddress - User's wallet address
   * @param {number} amount - Amount in SOL (default: 0.001)
   * @returns {Promise<Transaction>}
   */
  async createStakingTransaction(fromAddress, amount = 0.001) {
    if (!this.isValidAddress(fromAddress)) {
      throw new Error('Invalid from address');
    }

    if (!this.isValidAddress(this.rewardAddress)) {
      throw new Error('Invalid reward address');
    }

    const fromPublicKey = new PublicKey(fromAddress);
    const rewardPublicKey = new PublicKey(this.rewardAddress);

    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: fromPublicKey,
        toPubkey: rewardPublicKey,
        lamports: amount * LAMPORTS_PER_SOL,
      })
    );

    // Get recent blockhash
    const { blockhash } = await this.connection.getLatestBlockhash('confirmed');
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = fromPublicKey;

    return transaction;
  }

  /**
   * Creates a reward claim transaction (transfers 0.0005 SOL back to user)
   * @param {string} toAddress - User's wallet address
   * @param {number} amount - Amount in SOL (default: 0.0005)
   * @returns {Promise<Transaction>}
   */
  async createRewardTransaction(toAddress, amount = 0.0005) {
    if (!this.isValidAddress(toAddress)) {
      throw new Error('Invalid to address');
    }

    if (!this.isValidAddress(this.rewardAddress)) {
      throw new Error('Invalid reward address');
    }

    const toPublicKey = new PublicKey(toAddress);
    const rewardPublicKey = new PublicKey(this.rewardAddress);

    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: rewardPublicKey,
        toPubkey: toPublicKey,
        lamports: amount * LAMPORTS_PER_SOL,
      })
    );

    // Get recent blockhash
    const { blockhash } = await this.connection.getLatestBlockhash('confirmed');
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = rewardPublicKey;

    return transaction;
  }

  /**
   * Serializes a transaction for signing
   * @param {Transaction} transaction
   * @returns {Buffer}
   */
  serializeTransaction(transaction) {
    return transaction.serialize({
      requireAllSignatures: false,
      verifySignatures: false,
    });
  }

  /**
   * Verifies a transaction signature
   * @param {string} signature
   * @returns {Promise<Object|null>}
   */
  async verifyTransaction(signature) {
    try {
      const status = await this.connection.getSignatureStatus(signature);
      return status.value;
    } catch (error) {
      return null;
    }
  }

  /**
   * Gets transaction details
   * @param {string} signature
   * @returns {Promise<Object|null>}
   */
  async getTransaction(signature) {
    try {
      return await this.connection.getTransaction(signature, {
        commitment: 'confirmed',
      });
    } catch (error) {
      return null;
    }
  }

  /**
   * Gets account balance
   * @param {string} address
   * @returns {Promise<number>}
   */
  async getBalance(address) {
    if (!this.isValidAddress(address)) {
      throw new Error('Invalid address');
    }

    const publicKey = new PublicKey(address);
    const balance = await this.connection.getBalance(publicKey);
    return balance / LAMPORTS_PER_SOL;
  }
}

