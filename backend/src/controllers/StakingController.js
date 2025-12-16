/**
 * Staking Controller
 * Handles HTTP requests for staking operations
 */
export class StakingController {
  /**
   * @param {StakingService} stakingService - Staking service instance
   * @param {SolanaService} solanaService - Solana service instance
   */
  constructor(stakingService, solanaService) {
    this.stakingService = stakingService;
    this.solanaService = solanaService;
  }

  /**
   * Handle stake request
   * POST /api/solana/stake
   */
  stake = async (req, res) => {
    try {
      const { walletAddress, transactionSignature } = req.body;

      if (!walletAddress || !transactionSignature) {
        return res.status(400).json({
          success: false,
          error: 'Wallet address and transaction signature are required',
        });
      }

      // Verify transaction signature
      const txStatus = await this.solanaService.verifyTransaction(transactionSignature);
      if (!txStatus || !txStatus.confirmationStatus) {
        return res.status(400).json({
          success: false,
          error: 'Invalid or unconfirmed transaction signature',
        });
      }

      const record = await this.stakingService.stake(walletAddress, transactionSignature);

      res.status(201).json({
        success: true,
        data: {
          record: record.toJSON(),
          message: 'NFT staked successfully',
        },
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  };

  /**
   * Handle unstake request
   * POST /api/solana/unstake
   */
  unstake = async (req, res) => {
    try {
      const { walletAddress } = req.body;

      if (!walletAddress) {
        return res.status(400).json({
          success: false,
          error: 'Wallet address is required',
        });
      }

      const result = await this.stakingService.unstake(walletAddress);

      res.json({
        success: true,
        data: {
          record: result,
          message: 'NFT unstaked successfully',
        },
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  };

  /**
   * Handle claim rewards request
   * POST /api/solana/claim-rewards
   */
  claimRewards = async (req, res) => {
    try {
      const { walletAddress } = req.body;

      if (!walletAddress) {
        return res.status(400).json({
          success: false,
          error: 'Wallet address is required',
        });
      }

      const transaction = await this.stakingService.claimRewards(walletAddress);
      const serialized = this.solanaService.serializeTransaction(transaction);

      res.json({
        success: true,
        data: {
          transaction: {
            serialized: serialized.toString('base64'),
            message: 'Reward transaction created. Sign and submit to claim rewards.',
          },
        },
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  };

  /**
   * Handle get pending rewards request
   * GET /api/solana/pending-rewards/:walletAddress
   */
  getPendingRewards = async (req, res) => {
    try {
      const { walletAddress } = req.params;

      if (!walletAddress) {
        return res.status(400).json({
          success: false,
          error: 'Wallet address is required',
        });
      }

      const rewards = await this.stakingService.getPendingRewards(walletAddress);

      res.json({
        success: true,
        data: rewards,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  };

  /**
   * Handle get staking status request
   * GET /api/solana/status/:walletAddress
   */
  getStakingStatus = async (req, res) => {
    try {
      const { walletAddress } = req.params;

      if (!walletAddress) {
        return res.status(400).json({
          success: false,
          error: 'Wallet address is required',
        });
      }

      const status = await this.stakingService.getStakingStatus(walletAddress);

      res.json({
        success: true,
        data: status,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  };

  /**
   * Handle create staking transaction request
   * POST /api/solana/create-staking-transaction
   */
  createStakingTransaction = async (req, res) => {
    try {
      const { walletAddress } = req.body;

      if (!walletAddress) {
        return res.status(400).json({
          success: false,
          error: 'Wallet address is required',
        });
      }

      const transaction = await this.solanaService.createStakingTransaction(walletAddress);
      const serialized = this.solanaService.serializeTransaction(transaction);

      res.json({
        success: true,
        data: {
          transaction: {
            serialized: serialized.toString('base64'),
            message: 'Staking transaction created. Sign and submit to stake.',
            amount: 0.001, // SOL
          },
        },
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  };

  /**
   * Handle get all records request
   * GET /api/solana/records
   */
  getAllRecords = async (req, res) => {
    try {
      const records = await this.stakingService.getAllRecords();

      res.json({
        success: true,
        data: records,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  };
}

