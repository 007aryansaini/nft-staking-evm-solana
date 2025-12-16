# Multi-Chain NFT Staking Frontend

A professional, responsive frontend for staking NFTs on both EVM (Ethereum/Polygon) and Solana networks.

## Features

- **Multi-Chain Support**: Switch between EVM and Solana networks seamlessly
- **Wallet Integration**: 
  - EVM: MetaMask, WalletConnect, and more via RainbowKit
  - Solana: Phantom, Solflare via Solana Wallet Adapter
- **Real-time Updates**: Automatic refresh of staking status and rewards
- **Professional UI/UX**: Modern, responsive design with smooth animations
- **Toast Notifications**: User-friendly feedback for all actions
- **Form Validation**: Comprehensive input validation
- **Transaction Tracking**: Links to block explorers for all transactions

## Tech Stack

- **Framework**: Next.js 16 with React 19
- **Styling**: Tailwind CSS 4
- **EVM Integration**: Wagmi + RainbowKit
- **Solana Integration**: @solana/web3.js + Wallet Adapter
- **Notifications**: react-hot-toast
- **Validation**: Zod
- **Fonts**: Inter (Google Fonts)

## Setup

### Prerequisites

- Node.js ≥ 18
- npm or yarn
- Backend server running (see backend README)

### Installation

1. Install dependencies:
```bash
npm install
```

2. (Optional) Create `.env.local` file for API configuration:
```bash
# Only needed if you want to override defaults
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
NEXT_PUBLIC_API_URL=http://localhost:3001
```

**Note:** EVM contract addresses are now stored in `lib/constants.ts` instead of environment variables. Update that file if you need to change contract addresses.

### Running the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
frontend/
├── app/
│   ├── layout.tsx          # Root layout with providers
│   ├── page.tsx            # Main page with network switching
│   └── globals.css         # Global styles
├── components/
│   ├── Providers.jsx      # Wagmi + RainbowKit providers
│   ├── SolanaWalletProvider.tsx  # Solana wallet adapter
│   ├── Navbar.tsx          # Navigation bar
│   ├── StakingCard.tsx     # Reusable card component
│   ├── EVMStakingInterface.tsx   # EVM staking UI
│   └── SolanaStakingInterface.tsx  # Solana staking UI
├── hooks/
│   ├── useEVMStaking.ts    # EVM staking logic
│   └── useSolanaStaking.ts # Solana staking logic
├── lib/
│   ├── config.ts           # Configuration constants
│   ├── contracts.ts        # Contract ABIs
│   ├── api.ts              # Backend API service
│   └── utils.ts            # Utility functions
└── package.json
```

## Usage

### EVM Staking

1. Connect your EVM wallet (MetaMask, etc.)
2. Switch to EVM network in the navbar
3. Enter a token ID to stake
4. Approve and stake your NFT
5. Claim rewards or unstake at any time

### Solana Staking

1. Connect your Solana wallet (Phantom, etc.)
2. Switch to Solana network in the navbar
3. Click "Stake NFT" to create a staking transaction
4. Sign the transaction in your wallet
5. Claim rewards or unstake when ready

## Features in Detail

### Network Switching
- Seamless switching between EVM and Solana
- Maintains wallet connections per network
- Updates UI based on selected network

### Real-time Updates
- Automatic refresh of staking status every 10 seconds
- Real-time reward calculation
- Transaction status tracking

### Validation
- Token ID validation for EVM
- Address validation for both networks
- Input sanitization and error handling

### Responsive Design
- Mobile-first approach
- Works on all screen sizes
- Touch-friendly interface

## Configuration

### Contract Addresses

EVM contract addresses are stored in `lib/constants.ts`:
- `STAKING_CONTRACT`: `0x51BF6f7D01A82a268C01b9c6Aee27c7B63B8EEbd`
- `NFT_COLLECTION`: `0x4Dc390a7e893e17d25c2247D5cf3718F6E3759bF`
- `REWARD_TOKEN`: `0x99d0cDA8Db2d627a0ef38F57f4b1C8CbC2caefcc`

To change contract addresses, edit `frontend/lib/constants.ts`.

### Environment Variables (Optional)

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_SOLANA_RPC_URL` | Solana RPC endpoint | `https://api.devnet.solana.com` |
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:3001` |

## Building for Production

```bash
npm run build
npm start
```

## License

ISC
