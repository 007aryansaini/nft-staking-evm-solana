import express from 'express';

/**
 * Creates Solana staking routes
 * @param {StakingController} controller - Staking controller instance
 * @returns {express.Router}
 */
export function createSolanaRoutes(controller) {
  const router = express.Router();

  // Create staking transaction
  router.post('/create-staking-transaction', controller.createStakingTransaction);

  // Stake
  router.post('/stake', controller.stake);

  // Unstake
  router.post('/unstake', controller.unstake);

  // Claim rewards
  router.post('/claim-rewards', controller.claimRewards);

  // Get pending rewards
  router.get('/pending-rewards/:walletAddress', controller.getPendingRewards);

  // Get staking status
  router.get('/status/:walletAddress', controller.getStakingStatus);

  // Get all records
  router.get('/records', controller.getAllRecords);

  return router;
}

