import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Container } from './di/container.js';
import { createSolanaRoutes } from './routes/solana.routes.js';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize dependency injection container
const container = new Container();
container.initialize();

// Routes
const controller = container.resolve('controller');
app.use('/api/solana', createSolanaRoutes(controller));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    error: err.message || 'Internal server error',
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log(`Solana Network: ${process.env.SOLANA_NETWORK || 'devnet'}`);
  console.log(`Health check: http://localhost:${port}/health`);
});

export default app;