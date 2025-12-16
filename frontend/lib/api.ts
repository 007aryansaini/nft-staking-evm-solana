/**
 * API Service for Solana Backend
 */
import { API_CONFIG } from './config';

export interface StakingStatus {
  walletAddress: string;
  isStaked: boolean;
  stakingRecord: any;
  rewards: {
    walletAddress: string;
    pendingRewards: number;
    totalClaimed: number;
    isActive: boolean;
    stakedSince?: number;
    lastClaimTimestamp?: number;
  };
}

export interface CreateStakingTxResponse {
  success: boolean;
  data: {
    transaction: {
      serialized: string;
      message: string;
      amount: number;
    };
  };
}

class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_CONFIG.BASE_URL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async createStakingTransaction(walletAddress: string): Promise<CreateStakingTxResponse> {
    return this.request<CreateStakingTxResponse>(
      API_CONFIG.ENDPOINTS.CREATE_STAKING_TX,
      {
        method: 'POST',
        body: JSON.stringify({ walletAddress }),
      }
    );
  }

  async stake(walletAddress: string, transactionSignature: string) {
    return this.request(
      API_CONFIG.ENDPOINTS.STAKE,
      {
        method: 'POST',
        body: JSON.stringify({ walletAddress, transactionSignature }),
      }
    );
  }

  async unstake(walletAddress: string) {
    return this.request(
      API_CONFIG.ENDPOINTS.UNSTAKE,
      {
        method: 'POST',
        body: JSON.stringify({ walletAddress }),
      }
    );
  }

  async claimRewards(walletAddress: string) {
    return this.request(
      API_CONFIG.ENDPOINTS.CLAIM_REWARDS,
      {
        method: 'POST',
        body: JSON.stringify({ walletAddress }),
      }
    );
  }

  async getPendingRewards(walletAddress: string) {
    return this.request(
      `${API_CONFIG.ENDPOINTS.PENDING_REWARDS}/${walletAddress}`
    );
  }

  async getStakingStatus(walletAddress: string): Promise<{ success: boolean; data: StakingStatus }> {
    return this.request<{ success: boolean; data: StakingStatus }>(
      `${API_CONFIG.ENDPOINTS.STATUS}/${walletAddress}`
    );
  }
}

export const apiService = new ApiService();

