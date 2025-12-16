# Solana NFT Staking Backend

A professional, production-ready Solana staking backend implementation with dependency injection, class-based architecture, and comprehensive test coverage.

## Architecture

This backend follows professional software engineering practices:

- **Dependency Injection**: All services are injected through a DI container
- **Class-Based Design**: Clean separation of concerns with classes
- **Repository Pattern**: Data persistence abstraction
- **Service Layer**: Business logic separation
- **Controller Layer**: HTTP request handling
- **JSON Storage**: File-based data persistence (no database required)

## Project Structure

```
backend/
├── src/
│   ├── config/           # Configuration classes
│   ├── models/           # Data models
│   ├── repositories/     # Data access layer
│   ├── services/         # Business logic layer
│   ├── controllers/      # HTTP request handlers
│   ├── routes/           # Express route definitions
│   ├── di/               # Dependency injection container
│   └── server.js         # Express server setup
├── src/__tests__/        # Test files
├── data/                 # JSON data storage (auto-created)
└── package.json
```

## Features

### Solana Staking Operations

1. **Stake**: Transfer 0.001 SOL to reward address (staking fee)
2. **Unstake**: Mark stake as inactive
3. **Claim Rewards**: Create transaction to send 0.0005 SOL back to user
4. **Get Pending Rewards**: Calculate rewards based on time elapsed
5. **Get Staking Status**: Retrieve complete staking information

### API Endpoints

- `POST /api/solana/create-staking-transaction` - Create staking transaction
- `POST /api/solana/stake` - Stake NFTs (record transaction)
- `POST /api/solana/unstake` - Unstake NFTs
- `POST /api/solana/claim-rewards` - Claim rewards (create transaction)
- `GET /api/solana/pending-rewards/:walletAddress` - Get pending rewards
- `GET /api/solana/status/:walletAddress` - Get staking status
- `GET /api/solana/records` - Get all staking records
- `GET /health` - Health check endpoint

## Setup

### Prerequisites

- Node.js ≥ 18
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file from `.env.example`:
```bash
cp .env.example .env
```

3. Update `.env` with your configuration:
```env
PORT=3000
SOLANA_NETWORK=devnet
SOLANA_RPC_URL=https://api.devnet.solana.com
SOLANA_REWARD_ADDRESS=your_reward_wallet_address
```

### Running the Server

```bash
# Development mode (with watch)
npm run dev

# Production mode
npm start
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Usage Examples

### Create Staking Transaction

```bash
curl -X POST http://localhost:3000/api/solana/create-staking-transaction \
  -H "Content-Type: application/json" \
  -d '{"walletAddress": "your_wallet_address"}'
```

### Stake

```bash
curl -X POST http://localhost:3000/api/solana/stake \
  -H "Content-Type: application/json" \
  -d '{
    "walletAddress": "your_wallet_address",
    "transactionSignature": "transaction_signature_from_blockchain"
  }'
```

### Get Pending Rewards

```bash
curl http://localhost:3000/api/solana/pending-rewards/your_wallet_address
```

### Claim Rewards

```bash
curl -X POST http://localhost:3000/api/solana/claim-rewards \
  -H "Content-Type: application/json" \
  -d '{"walletAddress": "your_wallet_address"}'
```

### Unstake

```bash
curl -X POST http://localhost:3000/api/solana/unstake \
  -H "Content-Type: application/json" \
  -d '{"walletAddress": "your_wallet_address"}'
```

## Data Storage

Staking records are stored in `data/staking-records.json`. The file is automatically created on first use. Each record contains:

```json
{
  "walletAddress": "user_wallet_address",
  "timestamp": 1234567890,
  "transactionSignature": "transaction_signature",
  "isActive": true,
  "claimedRewards": 0.0005,
  "lastClaimTimestamp": 1234567890
}
```

## Testing

The project includes comprehensive test coverage:

- **Unit Tests**: Individual component testing
- **Integration Tests**: Full flow testing
- **Repository Tests**: Data persistence testing
- **Service Tests**: Business logic testing

Test files are located in `src/__tests__/`:

- `StakingRepository.test.js` - Repository tests
- `SolanaService.test.js` - Solana service tests
- `StakingService.test.js` - Staking service tests
- `StakingRecord.test.js` - Model tests
- `integration.test.js` - Integration tests

## Dependency Injection

The DI container manages all service dependencies:

```javascript
const container = new Container();
container.initialize();

// Resolve services
const stakingService = container.resolve('stakingService');
const solanaService = container.resolve('solanaService');
```

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error message"
}
```

Success responses:

```json
{
  "success": true,
  "data": { ... }
}
```

## Security Considerations

- Input validation on all endpoints
- Transaction signature verification
- Address validation
- Error handling to prevent information leakage

## License

ISC

