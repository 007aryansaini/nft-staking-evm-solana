/**
 * Utility Functions
 */
import { formatEther, parseEther } from 'viem';

/**
 * Format address to show first 6 and last 4 characters
 */
export function formatAddress(address: string): string {
  if (!address) return '';
  if (address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * Format number with commas
 */
export function formatNumber(num: number | string, decimals: number = 2): string {
  const numValue = typeof num === 'string' ? parseFloat(num) : num;
  if (isNaN(numValue)) return '0';
  return numValue.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Format token amount from wei
 */
export function formatTokenAmount(amount: bigint | string, decimals: number = 4): string {
  try {
    const formatted = formatEther(BigInt(amount.toString()));
    return formatNumber(formatted, decimals);
  } catch {
    return '0';
  }
}

/**
 * Parse token amount to wei
 */
export function parseTokenAmount(amount: string): bigint {
  try {
    return parseEther(amount);
  } catch {
    return BigInt(0);
  }
}

/**
 * Validate Solana address
 */
export function isValidSolanaAddress(address: string): boolean {
  try {
    // Solana addresses are base58 encoded and typically 32-44 characters
    if (!address || address.length < 32 || address.length > 44) {
      return false;
    }
    // Basic base58 validation
    const base58Regex = /^[1-9A-HJ-NP-Za-km-z]+$/;
    return base58Regex.test(address);
  } catch {
    return false;
  }
}

/**
 * Validate EVM address
 */
export function isValidEVMAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Validate token ID
 */
export function isValidTokenId(tokenId: string): boolean {
  const num = parseInt(tokenId, 10);
  return !isNaN(num) && num >= 0 && Number.isInteger(num);
}

/**
 * Get explorer URL for transaction
 */
export function getExplorerUrl(txHash: string, network: 'evm' | 'solana'): string {
  if (network === 'evm') {
    return `https://sepolia.etherscan.io/tx/${txHash}`;
  }
  return `https://explorer.solana.com/tx/${txHash}?cluster=devnet`;
}

/**
 * Format time duration
 */
export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${Math.floor(seconds)}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
  return `${Math.floor(seconds / 86400)}d`;
}

/**
 * Copy to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

