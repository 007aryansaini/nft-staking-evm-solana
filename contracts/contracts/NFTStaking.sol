// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title NFTStaking
 * @dev Contract for staking ERC721 NFTs and earning ERC20 token rewards
 * @notice Users can stake NFTs, unstake them, and claim rewards based on staking duration
 */
contract NFTStaking is IERC721Receiver, ReentrancyGuard, Pausable, Ownable {
    // ============ State Variables ============

    /// @dev The ERC721 NFT contract address
    IERC721 public nftCollection;

    /// @dev The ERC20 reward token contract address
    IERC20 public rewardToken;

    /// @dev Reward rate: 0.01 tokens per second (1e16 wei per second)
    uint256 public constant REWARD_RATE = 1e16;

    /// @dev Mapping from user address to their staked token IDs
    mapping(address => uint256[]) public stakedTokens;

    /// @dev Mapping from token ID to staker address
    mapping(uint256 => address) public tokenStaker;

    /// @dev Mapping from user address to their last claim timestamp
    mapping(address => uint256) public lastClaimTimestamp;

    /// @dev Mapping from user address to their total pending rewards
    mapping(address => uint256) public pendingRewards;

    /// @dev Mapping from user address to their total claimed rewards
    mapping(address => uint256) public totalClaimedRewards;

    // ============ Events ============

    event NFTStaked(address indexed user, uint256 indexed tokenId, uint256 timestamp);
    event NFTUnstaked(address indexed user, uint256 indexed tokenId, uint256 timestamp);
    event RewardsClaimed(address indexed user, uint256 amount, uint256 timestamp);
    event RewardsUpdated(address indexed user, uint256 pendingAmount, uint256 timestamp);

    // ============ Constructor ============

    /**
     * @dev Constructor to initialize the staking contract
     * @param _nftCollection Address of the ERC721 NFT collection
     * @param _rewardToken Address of the ERC20 reward token
     */
    constructor(address _nftCollection, address _rewardToken) Ownable(msg.sender) {
        require(_nftCollection != address(0), "NFTStaking: Invalid NFT collection address");
        require(_rewardToken != address(0), "NFTStaking: Invalid reward token address");
        
        nftCollection = IERC721(_nftCollection);
        rewardToken = IERC20(_rewardToken);
    }

    // ============ External Functions ============

    /**
     * @dev Stake an NFT token
     * @param tokenId The ID of the NFT token to stake
     * @notice User must approve this contract to transfer the NFT before staking
     */
    function stake(uint256 tokenId) external whenNotPaused nonReentrant {
        require(
            nftCollection.ownerOf(tokenId) == msg.sender,
            "NFTStaking: You don't own this NFT"
        );
        require(
            tokenStaker[tokenId] == address(0),
            "NFTStaking: NFT is already staked"
        );

        // Update pending rewards before staking
        _updateRewards(msg.sender);

        // Transfer NFT from user to this contract
        nftCollection.safeTransferFrom(msg.sender, address(this), tokenId);

        // Update staking state
        stakedTokens[msg.sender].push(tokenId);
        tokenStaker[tokenId] = msg.sender;

        // Set initial claim timestamp if this is user's first stake
        if (lastClaimTimestamp[msg.sender] == 0) {
            lastClaimTimestamp[msg.sender] = block.timestamp;
        }

        emit NFTStaked(msg.sender, tokenId, block.timestamp);
    }

    /**
     * @dev Unstake an NFT token
     * @param tokenId The ID of the NFT token to unstake
     * @notice User must have staked this NFT
     */
    function unstake(uint256 tokenId) external whenNotPaused nonReentrant {
        require(
            tokenStaker[tokenId] == msg.sender,
            "NFTStaking: You haven't staked this NFT"
        );

        // Update pending rewards before unstaking
        _updateRewards(msg.sender);

        // Remove token from user's staked tokens array
        _removeTokenFromStakedList(msg.sender, tokenId);

        // Clear staking state
        delete tokenStaker[tokenId];

        // If user has no more staked tokens, reset lastClaimTimestamp to prevent reward accumulation
        if (stakedTokens[msg.sender].length == 0) {
            lastClaimTimestamp[msg.sender] = 0;
        }

        // Transfer NFT back to user
        nftCollection.safeTransferFrom(address(this), msg.sender, tokenId);

        emit NFTUnstaked(msg.sender, tokenId, block.timestamp);
    }

    /**
     * @dev Claim pending rewards
     * @notice Transfers accumulated rewards to the caller
     */
    function claimRewards() external whenNotPaused nonReentrant {
        _updateRewards(msg.sender);

        uint256 rewardsToClaim = pendingRewards[msg.sender];
        require(rewardsToClaim > 0, "NFTStaking: No rewards to claim");

        // Check contract has sufficient balance
        uint256 contractBalance = rewardToken.balanceOf(address(this));
        require(
            rewardsToClaim <= contractBalance,
            "NFTStaking: Insufficient contract balance"
        );

        // Reset pending rewards
        pendingRewards[msg.sender] = 0;
        
        // Update timestamp only if user still has staked NFTs
        if (stakedTokens[msg.sender].length > 0) {
            lastClaimTimestamp[msg.sender] = block.timestamp;
        } else {
            lastClaimTimestamp[msg.sender] = 0;
        }

        // Update total claimed rewards
        totalClaimedRewards[msg.sender] += rewardsToClaim;

        // Transfer rewards to user
        require(
            rewardToken.transfer(msg.sender, rewardsToClaim),
            "NFTStaking: Reward transfer failed"
        );

        emit RewardsClaimed(msg.sender, rewardsToClaim, block.timestamp);
    }

    // ============ View Functions ============

    /**
     * @dev Get pending rewards for a user
     * @param user The address of the user
     * @return The amount of pending rewards
     */
    function getPendingRewards(address user) external view returns (uint256) {
        if (stakedTokens[user].length == 0 || lastClaimTimestamp[user] == 0) {
            return pendingRewards[user];
        }

        uint256 timeStaked = block.timestamp - lastClaimTimestamp[user];
        uint256 newRewards = timeStaked * REWARD_RATE * stakedTokens[user].length;
        
        return pendingRewards[user] + newRewards;
    }

    /**
     * @dev Get the number of NFTs staked by a user
     * @param user The address of the user
     * @return The number of staked NFTs
     */
    function getStakedTokenCount(address user) external view returns (uint256) {
        return stakedTokens[user].length;
    }

    /**
     * @dev Get all token IDs staked by a user
     * @param user The address of the user
     * @return Array of staked token IDs
     */
    function getStakedTokens(address user) external view returns (uint256[] memory) {
        return stakedTokens[user];
    }

    /**
     * @dev Check if a token is currently staked
     * @param tokenId The ID of the NFT token
     * @return True if the token is staked, false otherwise
     */
    function isTokenStaked(uint256 tokenId) external view returns (bool) {
        return tokenStaker[tokenId] != address(0);
    }

    /**
     * @dev Get total claimed rewards for a user
     * @param user The address of the user
     * @return The total amount of rewards claimed
     */
    function getTotalClaimedRewards(address user) external view returns (uint256) {
        return totalClaimedRewards[user];
    }

    // ============ Owner Functions ============

    /**
     * @dev Pause the contract
     * @notice Only owner can pause
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpause the contract
     * @notice Only owner can unpause
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @dev Emergency function to withdraw reward tokens
     * @param amount The amount of tokens to withdraw
     * @notice Only owner can call this function
     */
    function emergencyWithdraw(uint256 amount) external onlyOwner {
        require(amount > 0, "NFTStaking: Amount must be greater than zero");
        uint256 contractBalance = rewardToken.balanceOf(address(this));
        require(amount <= contractBalance, "NFTStaking: Insufficient contract balance");
        
        require(
            rewardToken.transfer(owner(), amount),
            "NFTStaking: Withdrawal failed"
        );
    }

    // ============ Internal Functions ============

    /**
     * @dev Update pending rewards for a user
     * @param user The address of the user
     */
    function _updateRewards(address user) internal {
        if (stakedTokens[user].length == 0 || lastClaimTimestamp[user] == 0) {
            return;
        }

        uint256 timeStaked = block.timestamp - lastClaimTimestamp[user];
        uint256 newRewards = timeStaked * REWARD_RATE * stakedTokens[user].length;
        
        if (newRewards > 0) {
            pendingRewards[user] += newRewards;
            emit RewardsUpdated(user, pendingRewards[user], block.timestamp);
        }
    }

    /**
     * @dev Remove a token from user's staked tokens array
     * @param user The address of the user
     * @param tokenId The ID of the token to remove
     */
    function _removeTokenFromStakedList(address user, uint256 tokenId) internal {
        uint256[] storage tokens = stakedTokens[user];
        uint256 length = tokens.length;

        for (uint256 i = 0; i < length; i++) {
            if (tokens[i] == tokenId) {
                // Move the last element to the position of the element to delete
                tokens[i] = tokens[length - 1];
                // Remove the last element
                tokens.pop();
                break;
            }
        }
    }

    // ============ ERC721 Receiver ============

    /**
     * @dev Implementation of IERC721Receiver
     * @notice Required to receive ERC721 tokens
     */
    function onERC721Received(
        address,
        address,
        uint256,
        bytes calldata
    ) external pure override returns (bytes4) {
        return this.onERC721Received.selector;
    }
}
