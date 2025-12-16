# NFT Staking Smart Contracts

A professional, production-ready NFT staking dApp smart contract implementation with comprehensive test coverage.

## 📋 Overview

This project implements an ERC721 NFT staking contract that allows users to:
- **Stake** their ERC721 NFTs (Non-Fungible Tokens)
- **Earn** ERC20 token rewards based on staking duration
- **Unstake** their NFTs at any time
- **Claim** accumulated rewards

### How It Works

- Users transfer their NFTs to the staking contract
- Rewards accumulate over time: **0.01 tokens per second per staked NFT**
- The more NFTs staked, the higher the reward rate (linear multiplication)
- Users can claim rewards at any time without unstaking
- NFTs can be unstaked at any time, and rewards are automatically calculated

### Reward Calculation Formula

```
Rewards = (Current Time - Last Claim Time) × 0.01 tokens/second × Number of Staked NFTs
```

**Example:**
- User stakes 3 NFTs
- Waits 100 seconds
- Rewards = 100 × 0.01 × 3 = **3 tokens**

---

## 🚀 Deployed Contracts (Sepolia Testnet)

### Contract Addresses

```
REWARD_TOKEN_ADDRESS=0x99d0cDA8Db2d627a0ef38F57f4b1C8CbC2caefcc
NFT_COLLECTION_ADDRESS=0x4Dc390a7e893e17d25c2247D5cf3718F6E3759bF
STAKING_CONTRACT_ADDRESS=0x51BF6f7D01A82a268C01b9c6Aee27c7B63B8EEbd
```

### View on Etherscan

- **RewardToken:** https://sepolia.etherscan.io/address/0x99d0cDA8Db2d627a0ef38F57f4b1C8CbC2caefcc
- **MockERC721:** https://sepolia.etherscan.io/address/0x4Dc390a7e893e17d25c2247D5cf3718F6E3759bF
- **NFTStaking:** https://sepolia.etherscan.io/address/0x51BF6f7D01A82a268C01b9c6Aee27c7B63B8EEbd

---

## 📁 Project Structure

```
contracts/
├── contracts/
│   ├── NFTStaking.sol          # Main staking contract
│   ├── RewardToken.sol         # ERC20 reward token contract
│   └── MockERC721.sol           # Mock NFT contract for testing
├── scripts/
│   └── deploy.js                # Deployment script
├── test/
│   └── NFTStaking.test.js       # Comprehensive test suite
├── hardhat.config.js            # Hardhat configuration
└── package.json                 # Dependencies
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18
- npm or yarn
- Hardhat

### Installation

1. Navigate to the contracts folder:
```bash
cd contracts
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file:
```bash
PRIVATE_KEY=your_private_key_here
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY
ETHERSCAN_API_KEY=your_etherscan_api_key
```

### Compile Contracts

```bash
npm run compile
```

### Run Tests

```bash
npm run test
```

### Deploy Contracts

**Sepolia Testnet:**
```bash
npm run deploy:sepolia
```

**Polygon Mumbai Testnet:**
```bash
npm run deploy:mumbai
```

**Local Network:**
```bash
npm run deploy:local
```

---

## 📝 Contract Details

### NFTStaking.sol

Main staking contract that implements all core functionality.

#### User Functions

**`stake(uint256 tokenId)`** - Stake an NFT
- Transfers NFT from user to contract
- Updates pending rewards before staking
- Sets initial claim timestamp if first stake
- **Prerequisites:** User must approve contract to transfer NFT

**`unstake(uint256 tokenId)`** - Unstake an NFT
- Updates pending rewards before unstaking
- Transfers NFT back to user
- Resets timestamp if no NFTs remain staked

**`claimRewards()`** - Claim accumulated rewards
- Calculates and transfers all pending rewards
- Resets pending rewards to zero
- Updates last claim timestamp
- **Safety Check:** Verifies contract has sufficient balance

#### View Functions

**`getPendingRewards(address user)`** - Get current pending rewards
- Returns real-time calculated rewards
- Formula: `pendingRewards + (time × rate × nftCount)`

**`getStakedTokenCount(address user)`** - Get number of staked NFTs

**`getStakedTokens(address user)`** - Get array of staked token IDs

**`isTokenStaked(uint256 tokenId)`** - Check if token is staked

**`getTotalClaimedRewards(address user)`** - Get lifetime claimed rewards

#### Owner Functions

**`pause()`** - Pause the contract (emergency stop)

**`unpause()`** - Unpause the contract

**`emergencyWithdraw(uint256 amount)`** - Emergency token withdrawal
- Only owner can call
- Validates amount and balance

#### Reward Formula

```
reward = (block.timestamp - lastClaimTimestamp[user]) * REWARD_RATE * stakedNFTCount
```

Where `REWARD_RATE = 0.01 tokens/second` (1e16 wei/second)

#### Events

- `NFTStaked(address indexed user, uint256 indexed tokenId, uint256 timestamp)`
- `NFTUnstaked(address indexed user, uint256 indexed tokenId, uint256 timestamp)`
- `RewardsClaimed(address indexed user, uint256 amount, uint256 timestamp)`
- `RewardsUpdated(address indexed user, uint256 pendingAmount, uint256 timestamp)`

### RewardToken.sol

Standard ERC20 token used for staking rewards.

- **Name:** "Staking Reward Token"
- **Symbol:** "SRT"
- **Owner Functions:**
  - `mint(address to, uint256 amount)` - Mint new tokens
  - `burn(address from, uint256 amount)` - Burn tokens

### MockERC721.sol

Mock ERC721 contract for testing purposes.

- `mint(address to)` - Mint single NFT
- `mintBatch(address to, uint256 quantity)` - Mint multiple NFTs
- `getCurrentTokenId()` - Get next token ID

---

## 💰 Reward Token Flow

### Who Funds the Contract?

The **contract owner/deployer** is responsible for funding the staking contract with reward tokens.

### Initial Setup (Deployment)

1. **Deploy RewardToken** - Mints 1,000,000 tokens to deployer
2. **Deploy NFTStaking** - Links to NFT and RewardToken contracts
3. **Transfer Initial Rewards** - Deployer transfers 500,000 tokens to staking contract

### Ongoing Operations

**Owner Responsibilities:**
- Monitor staking contract balance
- Mint new tokens when needed (via `rewardToken.mint()`)
- Transfer tokens to staking contract (via `rewardToken.transfer()`)
- Ensure contract always has enough tokens for claims

**Refill Process:**
```javascript
// Option 1: Mint and transfer
await rewardToken.mint(ownerAddress, amount);
await rewardToken.transfer(stakingContractAddress, amount);

// Option 2: Transfer from existing balance
await rewardToken.transfer(stakingContractAddress, amount);
```

### Safety Checks

The contract includes balance verification before every claim:

```solidity
uint256 contractBalance = rewardToken.balanceOf(address(this));
require(rewardsToClaim <= contractBalance, "NFTStaking: Insufficient contract balance");
```

**What this means:**
- ✅ Prevents claims if contract balance is insufficient
- ✅ User's pending rewards are **NOT lost** - they remain in the contract
- ✅ User can claim later once owner refills the contract
- ✅ Transaction reverts with clear error message

### How Rewards Work

1. **Virtual Accumulation:**
   - When users stake NFTs, rewards accumulate **virtually**
   - No actual tokens are moved or reserved
   - Contract tracks: `pendingRewards[user] += time × rate × nftCount`

2. **Actual Token Transfer:**
   - Only when user calls `claimRewards()`, actual tokens are transferred
   - Contract checks if it has enough tokens
   - If yes: transfers tokens from contract to user
   - If no: transaction reverts, rewards remain pending

---

## 🔧 UI Integration Guide

### Critical Functions to Integrate

#### 1. Stake NFT

```javascript
// 1. Check if NFT is already staked
const isStaked = await stakingContract.isTokenStaked(tokenId);

// 2. Approve NFT transfer (if not already approved)
const nftContract = new ethers.Contract(nftAddress, ERC721_ABI, signer);
await nftContract.approve(stakingContractAddress, tokenId);

// 3. Stake the NFT
const tx = await stakingContract.stake(tokenId);
await tx.wait();
```

**Events:** `NFTStaked(address indexed user, uint256 indexed tokenId, uint256 timestamp)`

#### 2. Unstake NFT

```javascript
// Verify user owns the staked NFT
const staker = await stakingContract.tokenStaker(tokenId);
if (staker.toLowerCase() !== userAddress.toLowerCase()) {
  throw new Error("You haven't staked this NFT");
}

// Unstake
const tx = await stakingContract.unstake(tokenId);
await tx.wait();
```

**Events:** `NFTUnstaked(address indexed user, uint256 indexed tokenId, uint256 timestamp)`

#### 3. Claim Rewards

```javascript
// Check pending rewards
const pendingRewards = await stakingContract.getPendingRewards(userAddress);
if (pendingRewards === 0n) {
  alert("No rewards to claim");
  return;
}

// Claim rewards
const tx = await stakingContract.claimRewards();
await tx.wait();
```

**Events:** `RewardsClaimed(address indexed user, uint256 amount, uint256 timestamp)`

#### 4. Get Pending Rewards (Real-time)

```javascript
// Call this function frequently to update UI (every 5-10 seconds)
const pendingRewards = await stakingContract.getPendingRewards(userAddress);
const formattedRewards = ethers.formatEther(pendingRewards);
updateRewardsDisplay(formattedRewards);
```

#### 5. Get Staked NFTs

```javascript
// Get all staked NFTs for display
const stakedTokenIds = await stakingContract.getStakedTokens(userAddress);
console.log(`User has ${stakedTokenIds.length} NFTs staked:`, stakedTokenIds);

// Fetch NFT metadata for each token
for (const tokenId of stakedTokenIds) {
  const metadata = await fetchNFTMetadata(nftAddress, tokenId);
  displayStakedNFT(metadata);
}
```

### Complete Integration Example

```javascript
import { ethers } from 'ethers';
import NFT_STAKING_ABI from './abis/NFTStaking.json';
import ERC721_ABI from './abis/ERC721.json';

class NFTStakingService {
  constructor(provider, stakingAddress, nftAddress) {
    this.provider = provider;
    this.signer = provider.getSigner();
    this.stakingContract = new ethers.Contract(
      stakingAddress,
      NFT_STAKING_ABI,
      this.signer
    );
    this.nftContract = new ethers.Contract(nftAddress, ERC721_ABI, this.signer);
  }

  async getUserAddress() {
    return await this.signer.getAddress();
  }

  async getPendingRewards(userAddress) {
    const rewards = await this.stakingContract.getPendingRewards(userAddress);
    return ethers.formatEther(rewards);
  }

  async getStakedNFTs(userAddress) {
    return await this.stakingContract.getStakedTokens(userAddress);
  }

  async stakeNFT(tokenId) {
    try {
      // Check if already staked
      const isStaked = await this.stakingContract.isTokenStaked(tokenId);
      if (isStaked) {
        throw new Error('NFT is already staked');
      }

      // Check approval
      const userAddress = await this.getUserAddress();
      const approved = await this.nftContract.getApproved(tokenId);
      const stakingAddress = await this.stakingContract.getAddress();
      
      if (approved.toLowerCase() !== stakingAddress.toLowerCase()) {
        // Approve first
        const approveTx = await this.nftContract.approve(stakingAddress, tokenId);
        await approveTx.wait();
      }

      // Stake
      const stakeTx = await this.stakingContract.stake(tokenId);
      const receipt = await stakeTx.wait();
      
      return {
        success: true,
        transactionHash: receipt.hash,
        tokenId
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async unstakeNFT(tokenId) {
    try {
      const unstakeTx = await this.stakingContract.unstake(tokenId);
      const receipt = await unstakeTx.wait();
      
      return {
        success: true,
        transactionHash: receipt.hash,
        tokenId
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async claimRewards() {
    try {
      const userAddress = await this.getUserAddress();
      const pendingRewards = await this.stakingContract.getPendingRewards(userAddress);
      
      if (pendingRewards === 0n) {
        throw new Error('No rewards to claim');
      }

      const claimTx = await this.stakingContract.claimRewards();
      const receipt = await claimTx.wait();
      
      return {
        success: true,
        transactionHash: receipt.hash,
        amount: ethers.formatEther(pendingRewards)
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async getUserStats(userAddress) {
    const [
      pendingRewards,
      stakedCount,
      stakedTokens,
      totalClaimed
    ] = await Promise.all([
      this.stakingContract.getPendingRewards(userAddress),
      this.stakingContract.getStakedTokenCount(userAddress),
      this.stakingContract.getStakedTokens(userAddress),
      this.stakingContract.getTotalClaimedRewards(userAddress)
    ]);

    return {
      pendingRewards: ethers.formatEther(pendingRewards),
      stakedCount: Number(stakedCount),
      stakedTokens: stakedTokens.map(t => Number(t)),
      totalClaimed: ethers.formatEther(totalClaimed)
    };
  }

  setupEventListeners(callbacks) {
    this.stakingContract.on("NFTStaked", (user, tokenId, timestamp) => {
      callbacks.onStaked?.(user, tokenId, timestamp);
    });

    this.stakingContract.on("NFTUnstaked", (user, tokenId, timestamp) => {
      callbacks.onUnstaked?.(user, tokenId, timestamp);
    });

    this.stakingContract.on("RewardsClaimed", (user, amount, timestamp) => {
      callbacks.onRewardsClaimed?.(user, amount, timestamp);
    });
  }
}

export default NFTStakingService;
```

### Recommended UI Components

1. **Dashboard/Overview**
   - Display pending rewards (real-time)
   - Show number of staked NFTs
   - Total lifetime rewards claimed
   - Reward rate per second

2. **Stake Section**
   - List of user's NFTs (from wallet)
   - Filter out already-staked NFTs
   - "Stake" button for each NFT
   - Approval status indicator

3. **Staked NFTs Gallery**
   - Display all staked NFTs with images
   - Show staking duration for each
   - "Unstake" button for each
   - Total staked count

4. **Rewards Section**
   - Real-time pending rewards counter
   - "Claim Rewards" button
   - Reward calculation breakdown
   - Estimated time to next milestone

5. **Statistics**
   - Total NFTs staked
   - Total rewards claimed
   - Average staking duration
   - Current reward rate

---

## 🧪 Testing

The test suite includes comprehensive coverage for:

- ✅ Contract deployment
- ✅ Staking functionality
- ✅ Unstaking functionality
- ✅ Reward calculation and claiming
- ✅ View functions
- ✅ Pausable functionality
- ✅ Owner functions
- ✅ Edge cases and security

Run tests with:
```bash
npm run test
```

---

## 🔒 Security Considerations

1. **Reentrancy Protection**: Uses OpenZeppelin's ReentrancyGuard on all external functions
2. **Access Control**: Owner-only functions for administrative actions
3. **Input Validation**: All inputs are validated before processing
4. **Safe Transfers**: Uses `safeTransferFrom` for NFT transfers
5. **Pausable**: Contract can be paused in case of emergencies
6. **Balance Checks**: Verifies contract has sufficient tokens before claims
7. **State Management**: Properly resets timestamps when no NFTs are staked

---

## 🌐 Network Configuration

The contract is configured to deploy on:
- **Hardhat Local Network** (for testing)
- **Polygon Mumbai Testnet**
- **Sepolia Testnet**

### RPC Setup

For reliable deployment, use a dedicated RPC provider:

**Alchemy (Recommended):**
```env
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY
```

**Infura:**
```env
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
```

### Etherscan Verification

The contract uses Etherscan API v2. Get your API key from:
- https://etherscan.io/apis

Update `.env`:
```env
ETHERSCAN_API_KEY=your_etherscan_api_key
```

---

## 📊 Deployment Details

### Deployment Process

1. **Deploy RewardToken**
   - Mints 1,000,000 tokens to deployer
   - Contract address saved

2. **Deploy MockERC721**
   - For testing purposes
   - Can be replaced with actual NFT collection in production

3. **Deploy NFTStaking**
   - Links to NFT and RewardToken contracts
   - Main staking contract

4. **Transfer Initial Rewards**
   - Transfers 500,000 tokens to staking contract
   - Funds the contract for initial rewards

5. **Verify Contracts** (Optional)
   - Automatically verifies on Etherscan if API key provided
   - Makes contracts viewable on block explorer

### Deployment Commands

```bash
# Compile contracts
npm run compile

# Deploy to Sepolia
npm run deploy:sepolia

# Deploy to Mumbai
npm run deploy:mumbai

# Deploy locally
npm run deploy:local
```

---

## ⚠️ Important Notes

### Approval Flow
- Users must approve NFT transfers before staking
- Check approval status before showing stake button
- Handle approval transactions separately

### Real-time Updates
- Poll `getPendingRewards()` every 5-10 seconds
- Update UI when events are emitted
- Show loading states during transactions

### Error Handling
- Handle contract pause state
- Check for sufficient contract balance
- Validate user owns NFT before staking
- Handle network errors gracefully

### Gas Estimation
- Estimate gas before transactions
- Show gas costs to users
- Handle out-of-gas errors

---

## 📄 License

MIT

## 👨‍💻 Development

### Code Quality

- Solidity 0.8.28
- OpenZeppelin Contracts v5.0.0
- Hardhat for development and testing
- Comprehensive test coverage
- Gas optimization enabled

### Best Practices

- ✅ Follows Solidity style guide
- ✅ Comprehensive NatSpec documentation
- ✅ Event emissions for all state changes
- ✅ Modifier usage for access control
- ✅ Error messages for all revert conditions

---

## 🎨 Minting NFTs

### How to Mint NFTs to an Address

The MockERC721 contract allows the owner to mint NFTs to any address. Here are the methods:

#### Method 1: Using Hardhat Script (Recommended)

1. **Create/Update `.env` file:**
```env
NFT_COLLECTION_ADDRESS=0x4Dc390a7e893e17d25c2247D5cf3718F6E3759bF
RECIPIENT_ADDRESS=0xYourRecipientAddressHere
MINT_QUANTITY=1  # Optional: number of NFTs to mint (default: 1)
```

2. **Run the mint script:**
```bash
# Mint 1 NFT
npx hardhat run scripts/mintNFT.js --network sepolia

# Or set environment variables inline
RECIPIENT_ADDRESS=0x123... npx hardhat run scripts/mintNFT.js --network sepolia
```

#### Method 2: Using Etherscan (Web Interface)

1. Go to: https://sepolia.etherscan.io/address/0x4Dc390a7e893e17d25c2247D5cf3718F6E3759bF
2. Click "Contract" tab
3. Click "Write Contract"
4. Connect your wallet (must be the owner)
5. Find `mint` function
6. Enter recipient address in `to` parameter
7. Click "Write" and confirm transaction

#### Method 3: Using JavaScript/TypeScript

```javascript
const { ethers } = require("hardhat");

async function mintNFT(recipientAddress) {
  const NFT_ADDRESS = "0x4Dc390a7e893e17d25c2247D5cf3718F6E3759bF";
  const [owner] = await ethers.getSigners();
  
  // Get the contract
  const MockERC721 = await ethers.getContractFactory("MockERC721");
  const nftContract = MockERC721.attach(NFT_ADDRESS);
  
  // Mint NFT
  const tx = await nftContract.mint(recipientAddress);
  await tx.wait();
  
  // Get the token ID
  const tokenId = await nftContract.getCurrentTokenId();
  const actualTokenId = tokenId - 1n;
  
  console.log(`NFT #${actualTokenId} minted to ${recipientAddress}`);
  return actualTokenId;
}

// Usage
mintNFT("0xRecipientAddressHere");
```

#### Method 4: Using Frontend/Web3

```javascript
import { ethers } from 'ethers';

const NFT_ABI = [
  "function mint(address to) external returns (uint256)",
  "function mintBatch(address to, uint256 quantity) external",
  "function owner() external view returns (address)"
];

async function mintNFT(recipientAddress, provider, signer) {
  const NFT_ADDRESS = "0x4Dc390a7e893e17d25c2247D5cf3718F6E3759bF";
  
  const nftContract = new ethers.Contract(NFT_ADDRESS, NFT_ABI, signer);
  
  // Verify you're the owner
  const owner = await nftContract.owner();
  const signerAddress = await signer.getAddress();
  
  if (owner.toLowerCase() !== signerAddress.toLowerCase()) {
    throw new Error("Only owner can mint NFTs");
  }
  
  // Mint NFT
  const tx = await nftContract.mint(recipientAddress);
  const receipt = await tx.wait();
  
  console.log("NFT minted! Transaction:", receipt.hash);
  return receipt;
}
```

### Minting Multiple NFTs

To mint multiple NFTs at once:

```javascript
// Using mintBatch function
const quantity = 5; // Mint 5 NFTs
const tx = await nftContract.mintBatch(recipientAddress, quantity);
await tx.wait();
```

### Important Notes

- ✅ **Only the owner** can mint NFTs (deployer address)
- ✅ NFTs are minted sequentially (token IDs: 0, 1, 2, 3...)
- ✅ Recipient can immediately stake the NFT after receiving it
- ✅ No approval needed for the recipient to stake their own NFT

### After Minting

Once an NFT is minted to an address, that user can:

1. **View their NFT** in their wallet (MetaMask, etc.)
2. **Approve the staking contract** to transfer the NFT:
   ```javascript
   await nftContract.approve(STAKING_CONTRACT_ADDRESS, tokenId);
   ```
3. **Stake the NFT**:
   ```javascript
   await stakingContract.stake(tokenId);
   ```

---

## 📞 Support

For issues or questions, please refer to the contract code comments or test files for usage examples.
