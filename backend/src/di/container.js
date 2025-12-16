import { SolanaConfig } from '../config/solana.config.js';
import { SolanaService } from '../services/SolanaService.js';
import { StakingRepository } from '../repositories/StakingRepository.js';
import { StakingService } from '../services/StakingService.js';
import { StakingController } from '../controllers/StakingController.js';

/**
 * Dependency Injection Container
 * Manages service instantiation and dependencies
 */
export class Container {
  constructor() {
    this._services = new Map();
    this._singletons = new Map();
  }

  /**
   * Registers a service factory
   * @param {string} name
   * @param {Function} factory
   * @param {boolean} singleton
   */
  register(name, factory, singleton = true) {
    this._services.set(name, { factory, singleton });
  }

  /**
   * Resolves a service
   * @param {string} name
   * @returns {*}
   */
  resolve(name) {
    const service = this._services.get(name);
    if (!service) {
      throw new Error(`Service ${name} not found`);
    }

    if (service.singleton) {
      if (!this._singletons.has(name)) {
        this._singletons.set(name, service.factory(this));
      }
      return this._singletons.get(name);
    }

    return service.factory(this);
  }

  /**
   * Initializes the container with all services
   */
  initialize() {
    // Register configuration
    this.register('config', () => new SolanaConfig(), true);

    // Register repository
    this.register('repository', (container) => {
      return new StakingRepository();
    }, true);

    // Register Solana service
    this.register('solanaService', (container) => {
      const config = container.resolve('config');
      const connection = SolanaService.createConnection(config.rpcUrl);
      return new SolanaService(connection, config.rewardAddress);
    }, true);

    // Register staking service
    this.register('stakingService', (container) => {
      const repository = container.resolve('repository');
      const solanaService = container.resolve('solanaService');
      return new StakingService(repository, solanaService);
    }, true);

    // Register controller
    this.register('controller', (container) => {
      const stakingService = container.resolve('stakingService');
      const solanaService = container.resolve('solanaService');
      return new StakingController(stakingService, solanaService);
    }, true);
  }
}

