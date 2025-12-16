import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Staking Repository
 * Handles data persistence using JSON file storage
 * Implements dependency injection pattern
 */
export class StakingRepository {
  /**
   * @param {string} dataFilePath - Path to JSON data file
   */
  constructor(dataFilePath = null) {
    this.dataFilePath = dataFilePath || path.join(__dirname, '../../data/staking-records.json');
    // Note: ensureDataFileExists is async, but constructor cannot be async
    // Callers should await ensureDataFileExists() if needed before first use
    // For most cases, the first read/write will trigger file creation
  }

  /**
   * Ensures data file exists, creates if it doesn't
   */
  async ensureDataFileExists() {
    try {
      const dir = path.dirname(this.dataFilePath);
      await fs.mkdir(dir, { recursive: true });
      await fs.access(this.dataFilePath);
    } catch (error) {
      // File doesn't exist, create it with empty array
      await fs.writeFile(this.dataFilePath, JSON.stringify([], null, 2), 'utf-8');
    }
  }

  /**
   * Reads all records from file
   * @returns {Promise<Array>}
   */
  async readAll() {
    try {
      const data = await fs.readFile(this.dataFilePath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      return [];
    }
  }

  /**
   * Writes records to file
   * @param {Array} records
   * @returns {Promise<void>}
   */
  async writeAll(records) {
    await fs.writeFile(this.dataFilePath, JSON.stringify(records, null, 2), 'utf-8');
  }

  /**
   * Finds a record by wallet address
   * @param {string} walletAddress
   * @returns {Promise<Object|null>}
   */
  async findByWalletAddress(walletAddress) {
    const records = await this.readAll();
    return records.find(r => r.walletAddress === walletAddress) || null;
  }

  /**
   * Finds all active records for a wallet
   * @param {string} walletAddress
   * @returns {Promise<Array>}
   */
  async findActiveByWalletAddress(walletAddress) {
    const records = await this.readAll();
    return records.filter(
      r => r.walletAddress === walletAddress && r.isActive === true
    );
  }

  /**
   * Creates a new staking record
   * @param {Object} record
   * @returns {Promise<Object>}
   */
  async create(record) {
    const records = await this.readAll();
    records.push(record);
    await this.writeAll(records);
    return record;
  }

  /**
   * Updates a staking record
   * @param {string} walletAddress
   * @param {Object} updates
   * @returns {Promise<Object|null>}
   */
  async update(walletAddress, updates) {
    const records = await this.readAll();
    const index = records.findIndex(r => r.walletAddress === walletAddress);
    
    if (index === -1) {
      return null;
    }

    records[index] = { ...records[index], ...updates };
    await this.writeAll(records);
    return records[index];
  }

  /**
   * Gets all records
   * @returns {Promise<Array>}
   */
  async findAll() {
    return await this.readAll();
  }
}

