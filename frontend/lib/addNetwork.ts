/**
 * Utility functions to add networks to MetaMask
 */

// Extend Window interface for MetaMask
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      isMetaMask?: boolean;
    };
  }
}

export interface AddEthereumChainParameter {
  chainId: string; // A 0x-prefixed hexadecimal string
  chainName: string;
  nativeCurrency: {
    name: string;
    symbol: string; // 2-6 characters long
    decimals: number;
  };
  rpcUrls: string[];
  blockExplorerUrls?: string[];
}

/**
 * Sepolia Testnet configuration for MetaMask
 */
export const SEPOLIA_NETWORK: AddEthereumChainParameter = {
  chainId: '0xaa36a7', // 11155111 in decimal
  chainName: 'Sepolia',
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: [
    'https://sepolia.infura.io/v3/',
    'https://rpc.sepolia.org',
    'https://sepolia.gateway.tenderly.co',
  ],
  blockExplorerUrls: ['https://sepolia.etherscan.io'],
};

/**
 * Base Testnet configuration for MetaMask
 */
export const BASE_NETWORK: AddEthereumChainParameter = {
  chainId: '0x14a34', // 84532 in decimal
  chainName: 'Base Sepolia',
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: [
    'https://sepolia.base.org',
  ],
  blockExplorerUrls: ['https://sepolia-explorer.base.org'],
};

/**
 * Adds a network to MetaMask
 * @param networkConfig - Network configuration object
 * @returns Promise that resolves when network is added
 */
export async function addNetworkToMetaMask(
  networkConfig: AddEthereumChainParameter
): Promise<void> {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('MetaMask is not installed');
  }

  try {
    // Try to switch to the network first
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: networkConfig.chainId }],
    });
  } catch (switchError: any) {
    // This error code indicates that the chain has not been added to MetaMask
    if (switchError.code === 4902) {
      try {
        // Add the network
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [networkConfig],
        });
      } catch (addError) {
        throw new Error(`Failed to add network: ${addError}`);
      }
    } else {
      throw new Error(`Failed to switch network: ${switchError.message}`);
    }
  }
}

/**
 * Adds Sepolia testnet to MetaMask
 */
export async function addSepoliaToMetaMask(): Promise<void> {
  return addNetworkToMetaMask(SEPOLIA_NETWORK);
}

/**
 * Adds Base testnet to MetaMask
 */
export async function addBaseToMetaMask(): Promise<void> {
  return addNetworkToMetaMask(BASE_NETWORK);
}

