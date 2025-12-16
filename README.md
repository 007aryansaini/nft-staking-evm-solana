# Multi-Chain NFT Staking dApp

A decentralized application for staking NFTs on both EVM (Ethereum Sepolia) and Solana (Devnet) networks. Users can stake/unstake NFTs, track rewards, and claim rewards through a unified interface.

## Demo Video

[![Multi-Chain NFT Staking dApp Demo](https://img.youtube.com/vi/5ADZyAxjkuY/0.jpg)](https://www.youtube.com/watch?v=5ADZyAxjkuY)

Click the thumbnail above to watch the demo video on YouTube.

## Project Overview

This project consists of three main components:
- **Smart Contracts** (EVM): Solidity contracts for NFT staking on Sepolia testnet
- **Backend** (Node.js): Solana staking service with REST API
- **Frontend** (Next.js): React-based UI for interacting with both EVM and Solana networks

## Prerequisites

- Node.js ≥ 18
- npm or yarn
- MetaMask or EVM-compatible wallet
- Phantom or Solana-compatible wallet
- Testnet tokens (Sepolia ETH, Solana Devnet SOL)

## Setup Instructions

### 1. Deploy Smart Contracts (EVM)

First, deploy the EVM contracts to Sepolia testnet:

```bash
cd contracts
npm install
```

Create a `.env` file in the `contracts` directory:

```env
SEPOLIA_RPC_URL=your_sepolia_rpc_url
PRIVATE_KEY=your_private_key
ETHERSCAN_API_KEY=your_etherscan_api_key
```

Deploy contracts:

```bash
npm run deploy:sepolia
```

After deployment, note the contract addresses and update `frontend/lib/constants.ts`:

```typescript
export const EVM_CONTRACTS = {
  STAKING_CONTRACT: '0x...', // Your deployed staking contract address
  NFT_COLLECTION: '0x...',    // Your deployed NFT collection address
  REWARD_TOKEN: '0x...',      // Your deployed reward token address
} as const;
```

### 2. Setup Backend

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:

```env
PORT=3001
SOLANA_NETWORK=devnet
SOLANA_RPC_URL=https://api.devnet.solana.com
SOLANA_REWARD_ADDRESS=your_solana_reward_wallet_address
```

Start the backend server:

```bash
npm start
```

The backend will run on `http://localhost:3001`

### 3. Setup Frontend

```bash
cd frontend
npm install
```

(Optional) Create a `.env.local` file in the `frontend` directory if you need to override defaults:

```env
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
NEXT_PUBLIC_API_URL=http://localhost:3001
```

**Note:** EVM contract addresses are configured in `frontend/lib/constants.ts`, not environment variables.

Start the frontend development server:

```bash
npm run dev
```

The frontend will run on `http://localhost:3000`

## Running the Application

### Start Backend

```bash
cd backend
npm start
```

### Start Frontend

```bash
cd frontend
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
Multichain-NFT-Staking/
├── contracts/          # Solidity smart contracts
│   ├── contracts/      # Contract source files
│   ├── scripts/        # Deployment scripts
│   └── test/           # Contract tests
├── backend/            # Node.js backend server
│   ├── src/            # Source code
│   └── data/           # JSON data storage
└── frontend/           # Next.js frontend
    ├── app/            # Next.js app directory
    ├── components/     # React components
    ├── hooks/          # Custom React hooks
    └── lib/            # Utilities and config
```

## Features

- **EVM Staking**: Stake/unstake NFTs on Sepolia testnet
- **Solana Staking**: Stake/unstake NFTs on Solana Devnet
- **Reward Tracking**: View pending and claimed rewards
- **Multi-Wallet Support**: Connect MetaMask (EVM) and Phantom (Solana)
- **Real-time Updates**: Automatic status refresh

## Network Configuration

- **EVM**: Sepolia Testnet
- **Solana**: Devnet

## License

ISC

