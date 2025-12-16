// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title RewardToken
 * @dev ERC20 token used as rewards for NFT staking
 * @notice This contract mints tokens to the staking contract as rewards
 */
contract RewardToken is ERC20, Ownable {
    /**
     * @dev Constructor that mints initial supply to the deployer
     * @param initialSupply Initial token supply to mint
     */
    constructor(uint256 initialSupply) ERC20("Staking Reward Token", "SRT") Ownable(msg.sender) {
        _mint(msg.sender, initialSupply);
    }

    /**
     * @dev Mints tokens to a specific address
     * @param to Address to mint tokens to
     * @param amount Amount of tokens to mint
     * @notice Only owner can mint tokens
     */
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    /**
     * @dev Burns tokens from a specific address
     * @param from Address to burn tokens from
     * @param amount Amount of tokens to burn
     * @notice Only owner can burn tokens
     */
    function burn(address from, uint256 amount) external onlyOwner {
        _burn(from, amount);
    }
}
