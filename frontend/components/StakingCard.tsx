'use client';

import { formatNumber, formatAddress, getExplorerUrl } from '@/lib/utils';

interface StakingCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
    disabled?: boolean;
    variant?: 'primary' | 'secondary' | 'danger';
  };
  txHash?: string;
  network: 'evm' | 'solana';
  gradient?: 'blue' | 'purple' | 'green';
}

export default function StakingCard({
  title,
  value,
  subtitle,
  icon,
  action,
  txHash,
  network,
  gradient = 'blue',
}: StakingCardProps) {
  const explorerUrl = txHash ? getExplorerUrl(txHash, network) : null;

  const gradientClasses = {
    blue: 'from-[#3b82f6] to-[#2563eb]',
    purple: 'from-[#9333ea] to-[#7e22ce]',
    green: 'from-[#10b981] to-[#059669]',
  };

  return (
    <div className="glass rounded-2xl p-6 card-hover border border-[#1f2937] shadow-xl">
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            {icon && (
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradientClasses[gradient]} flex items-center justify-center shadow-lg`}>
                {icon}
              </div>
            )}
            <div>
              <h3 className="text-sm font-medium text-[#9ca3af] uppercase tracking-wide">{title}</h3>
            </div>
          </div>
          <div className="mb-2">
            <p className="text-3xl font-bold text-white">
              {typeof value === 'number' ? formatNumber(value) : value}
            </p>
            {subtitle && (
              <p className="text-sm text-[#6b7280] mt-1">{subtitle}</p>
            )}
          </div>
        </div>
      </div>

      {action && (
        <button
          onClick={action.onClick}
          disabled={action.disabled}
          className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-200 text-sm shadow-lg cursor-pointer ${
            action.variant === 'danger'
              ? 'bg-gradient-to-r from-[#ef4444] to-[#dc2626] hover:from-[#dc2626] hover:to-[#b91c1c] text-white disabled:opacity-50 disabled:cursor-not-allowed shadow-red-500/20'
              : action.variant === 'secondary'
              ? 'bg-[#1f2937] hover:bg-[#374151] text-white disabled:opacity-50 disabled:cursor-not-allowed border border-[#374151]'
              : `bg-gradient-to-r ${gradientClasses[gradient]} hover:shadow-xl text-white disabled:opacity-50 disabled:cursor-not-allowed shadow-${gradient === 'blue' ? 'blue' : gradient === 'purple' ? 'purple' : 'green'}-500/30`
          }`}
        >
          {action.disabled && action.label.includes('...') ? (
            <span className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              {action.label}
            </span>
          ) : (
            action.label
          )}
        </button>
      )}

      {explorerUrl && (
        <a
          href={explorerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 block text-xs text-[#60a5fa] hover:text-[#93c5fd] text-center font-medium transition-colors"
        >
          View on {network === 'evm' ? 'Etherscan' : 'Solana Explorer'} →
        </a>
      )}
    </div>
  );
}
