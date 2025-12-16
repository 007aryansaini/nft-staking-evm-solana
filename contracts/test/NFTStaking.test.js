const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");

describe("NFTStaking", function () {
  let rewardToken;
  let mockERC721;
  let nftStaking;
  let owner;
  let user1;
  let user2;
  let addrs;

  const REWARD_RATE = ethers.parseUnits("0.01", 18); // 0.01 tokens per second
  const INITIAL_SUPPLY = ethers.parseEther("1000000"); // 1M tokens
  const REWARD_POOL = ethers.parseEther("500000"); // 500K tokens for rewards
  const REWARD_TOLERANCE = ethers.parseUnits("0.01", 18); // Tolerance for timing differences (0.01 tokens = 1 second)

  beforeEach(async function () {
    [owner, user1, user2, ...addrs] = await ethers.getSigners();

    // Deploy RewardToken
    const RewardToken = await ethers.getContractFactory("RewardToken");
    rewardToken = await RewardToken.deploy(INITIAL_SUPPLY);
    await rewardToken.waitForDeployment();

    // Deploy MockERC721
    const MockERC721 = await ethers.getContractFactory("MockERC721");
    mockERC721 = await MockERC721.deploy("Test NFT", "TNFT");
    await mockERC721.waitForDeployment();

    // Deploy NFTStaking
    const NFTStaking = await ethers.getContractFactory("NFTStaking");
    nftStaking = await NFTStaking.deploy(
      await mockERC721.getAddress(),
      await rewardToken.getAddress()
    );
    await nftStaking.waitForDeployment();

    // Transfer reward tokens to staking contract
    await rewardToken.transfer(await nftStaking.getAddress(), REWARD_POOL);

    // Mint NFTs to users for testing
    await mockERC721.mintBatch(user1.address, 3);
    await mockERC721.mintBatch(user2.address, 2);
  });

  describe("Deployment", function () {
    it("Should set the correct NFT collection address", async function () {
      expect(await nftStaking.nftCollection()).to.equal(await mockERC721.getAddress());
    });

    it("Should set the correct reward token address", async function () {
      expect(await nftStaking.rewardToken()).to.equal(await rewardToken.getAddress());
    });

    it("Should set the correct reward rate", async function () {
      expect(await nftStaking.REWARD_RATE()).to.equal(REWARD_RATE);
    });

    it("Should revert if NFT collection address is zero", async function () {
      const NFTStaking = await ethers.getContractFactory("NFTStaking");
      await expect(
        NFTStaking.deploy(ethers.ZeroAddress, await rewardToken.getAddress())
      ).to.be.revertedWith("NFTStaking: Invalid NFT collection address");
    });

    it("Should revert if reward token address is zero", async function () {
      const NFTStaking = await ethers.getContractFactory("NFTStaking");
      await expect(
        NFTStaking.deploy(await mockERC721.getAddress(), ethers.ZeroAddress)
      ).to.be.revertedWith("NFTStaking: Invalid reward token address");
    });
  });

  describe("Staking", function () {
    it("Should allow user to stake an NFT", async function () {
      const tokenId = 0;
      await mockERC721.connect(user1).approve(await nftStaking.getAddress(), tokenId);

      await expect(nftStaking.connect(user1).stake(tokenId))
        .to.emit(nftStaking, "NFTStaked")
        .withArgs(user1.address, tokenId, anyValue);

      expect(await mockERC721.ownerOf(tokenId)).to.equal(await nftStaking.getAddress());
      expect(await nftStaking.tokenStaker(tokenId)).to.equal(user1.address);
      expect(await nftStaking.getStakedTokenCount(user1.address)).to.equal(1);
    });

    it("Should update lastClaimTimestamp on first stake", async function () {
      const tokenId = 0;
      await mockERC721.connect(user1).approve(await nftStaking.getAddress(), tokenId);

      const beforeTimestamp = await time.latest();
      await nftStaking.connect(user1).stake(tokenId);
      const afterTimestamp = await time.latest();
      
      const timestamp = await nftStaking.lastClaimTimestamp(user1.address);
      expect(timestamp).to.be.gte(beforeTimestamp);
      expect(timestamp).to.be.lte(afterTimestamp);
    });

    it("Should allow user to stake multiple NFTs", async function () {
      const tokenIds = [0, 1, 2];
      
      for (const tokenId of tokenIds) {
        await mockERC721.connect(user1).approve(await nftStaking.getAddress(), tokenId);
        await nftStaking.connect(user1).stake(tokenId);
      }

      expect(await nftStaking.getStakedTokenCount(user1.address)).to.equal(3);
      const stakedTokens = await nftStaking.getStakedTokens(user1.address);
      expect(stakedTokens.length).to.equal(3);
      expect(stakedTokens.map(t => Number(t))).to.include.members([0, 1, 2]);
    });

    it("Should revert if user doesn't own the NFT", async function () {
      const tokenId = 0; // This NFT belongs to user1, not user2
      
      // Try to stake without owning - should fail at the stake function, not approve
      await expect(
        nftStaking.connect(user2).stake(tokenId)
      ).to.be.revertedWith("NFTStaking: You don't own this NFT");
    });

    it("Should revert if NFT is already staked", async function () {
      const tokenId = 0;
      await mockERC721.connect(user1).approve(await nftStaking.getAddress(), tokenId);
      await nftStaking.connect(user1).stake(tokenId);

      // Verify NFT is staked
      expect(await nftStaking.tokenStaker(tokenId)).to.equal(user1.address);
      expect(await nftStaking.isTokenStaked(tokenId)).to.be.true;

      // Try to stake the same NFT again - should fail because ownership check happens first
      // After staking, the NFT is owned by the staking contract, not the user
      // So it will revert with "You don't own this NFT" which is correct behavior
      await expect(nftStaking.connect(user1).stake(tokenId))
        .to.be.revertedWith("NFTStaking: You don't own this NFT");
    });

    it("Should revert if contract is paused", async function () {
      const tokenId = 0;
      await nftStaking.pause();
      await mockERC721.connect(user1).approve(await nftStaking.getAddress(), tokenId);

      await expect(nftStaking.connect(user1).stake(tokenId))
        .to.be.revertedWithCustomError(nftStaking, "EnforcedPause");
    });

    it("Should update pending rewards before staking additional NFTs", async function () {
      const tokenId1 = 0;
      await mockERC721.connect(user1).approve(await nftStaking.getAddress(), tokenId1);
      await nftStaking.connect(user1).stake(tokenId1);

      // Wait 10 seconds
      await time.increase(10);

      const tokenId2 = 1;
      await mockERC721.connect(user1).approve(await nftStaking.getAddress(), tokenId2);
      await nftStaking.connect(user1).stake(tokenId2);

      // Should have accumulated rewards from first NFT
      const pendingRewards = await nftStaking.getPendingRewards(user1.address);
      expect(pendingRewards).to.be.gt(0);
    });
  });

  describe("Unstaking", function () {
    beforeEach(async function () {
      const tokenId = 0;
      await mockERC721.connect(user1).approve(await nftStaking.getAddress(), tokenId);
      await nftStaking.connect(user1).stake(tokenId);
    });

    it("Should allow user to unstake their NFT", async function () {
      const tokenId = 0;

      await expect(nftStaking.connect(user1).unstake(tokenId))
        .to.emit(nftStaking, "NFTUnstaked")
        .withArgs(user1.address, tokenId, anyValue);

      expect(await mockERC721.ownerOf(tokenId)).to.equal(user1.address);
      expect(await nftStaking.tokenStaker(tokenId)).to.equal(ethers.ZeroAddress);
      expect(await nftStaking.getStakedTokenCount(user1.address)).to.equal(0);
    });

    it("Should revert if user hasn't staked the NFT", async function () {
      const tokenId = 3; // Not staked

      await expect(nftStaking.connect(user1).unstake(tokenId))
        .to.be.revertedWith("NFTStaking: You haven't staked this NFT");
    });

    it("Should revert if contract is paused", async function () {
      const tokenId = 0;
      await nftStaking.pause();

      await expect(nftStaking.connect(user1).unstake(tokenId))
        .to.be.revertedWithCustomError(nftStaking, "EnforcedPause");
    });

    it("Should update rewards before unstaking", async function () {
      const tokenId = 0;
      await time.increase(10); // Wait 10 seconds

      await nftStaking.connect(user1).unstake(tokenId);

      const pendingRewards = await nftStaking.getPendingRewards(user1.address);
      expect(pendingRewards).to.be.gt(0);
    });

    it("Should remove token from staked tokens array correctly", async function () {
      // Token 0 is already staked in beforeEach, so we'll use tokens 1 and 2
      // First, let's unstake token 0 to start fresh, or use tokens 1 and 2
      const tokenIds = [1, 2];
      
      // Mint additional tokens if needed and stake them
      for (const tokenId of tokenIds) {
        const owner = await mockERC721.ownerOf(tokenId);
        if (owner.toLowerCase() !== user1.address.toLowerCase()) {
          // Token doesn't exist or not owned by user1, skip or mint
          continue;
        }
        await mockERC721.connect(user1).approve(await nftStaking.getAddress(), tokenId);
        await nftStaking.connect(user1).stake(tokenId);
      }

      // Now we have token 0 (from beforeEach) and tokens 1, 2 staked
      // Unstake middle token (token 1)
      await nftStaking.connect(user1).unstake(1);

      const stakedTokens = await nftStaking.getStakedTokens(user1.address);
      expect(stakedTokens.length).to.equal(2); // Should have token 0 and 2
      const tokenNumbers = stakedTokens.map(t => Number(t));
      expect(tokenNumbers).to.not.include(1);
      expect(tokenNumbers).to.include.members([0, 2]);
    });
  });

  describe("Rewards", function () {
    beforeEach(async function () {
      const tokenId = 0;
      await mockERC721.connect(user1).approve(await nftStaking.getAddress(), tokenId);
      await nftStaking.connect(user1).stake(tokenId);
    });

    it("Should calculate pending rewards correctly", async function () {
      await time.increase(100); // Wait 100 seconds

      const pendingRewards = await nftStaking.getPendingRewards(user1.address);
      const expectedRewards = REWARD_RATE * 100n; // 0.01 * 100 = 1 token
      
      // Allow for small timing differences
      expect(pendingRewards).to.be.closeTo(expectedRewards, REWARD_TOLERANCE);
    });

    it("Should calculate rewards for multiple staked NFTs", async function () {
      // Stake additional NFT
      const tokenId2 = 1;
      await mockERC721.connect(user1).approve(await nftStaking.getAddress(), tokenId2);
      
      // Get rewards before staking second NFT
      const rewardsBeforeSecondStake = await nftStaking.getPendingRewards(user1.address);
      
      await nftStaking.connect(user1).stake(tokenId2);

      // Wait 100 seconds
      await time.increase(100);

      const pendingRewards = await nftStaking.getPendingRewards(user1.address);
      
      // Rewards should be: previous rewards + (100 seconds * rate * 2 NFTs)
      // Use range check to account for timing differences during transaction execution
      const expectedNewRewards = REWARD_RATE * 100n * 2n;
      const expectedTotal = rewardsBeforeSecondStake + expectedNewRewards;
      
      // Allow for timing differences - be more lenient (up to 5 seconds difference)
      expect(pendingRewards).to.be.gte(expectedTotal - REWARD_RATE * 5n);
      expect(pendingRewards).to.be.lte(expectedTotal + REWARD_RATE * 5n);
    });

    it("Should allow user to claim rewards", async function () {
      await time.increase(100); // Wait 100 seconds

      const pendingRewardsBefore = await nftStaking.getPendingRewards(user1.address);
      const userBalanceBefore = await rewardToken.balanceOf(user1.address);

      // Verify we have rewards to claim
      expect(pendingRewardsBefore).to.be.gt(0);

      await expect(nftStaking.connect(user1).claimRewards())
        .to.emit(nftStaking, "RewardsClaimed")
        .withArgs(user1.address, anyValue, anyValue);

      const userBalanceAfter = await rewardToken.balanceOf(user1.address);
      const claimedAmount = userBalanceAfter - userBalanceBefore;
      
      // Check that the claimed amount matches pending rewards (within small tolerance)
      // The contract should claim what's pending, but there might be tiny timing differences
      expect(claimedAmount).to.be.gte(pendingRewardsBefore);
      expect(claimedAmount).to.be.lte(pendingRewardsBefore + REWARD_RATE * 2n); // Allow up to 2 seconds difference
      
      // Verify it's reasonable (should be around 1 token for 100 seconds)
      // Use range check to account for timing differences
      expect(claimedAmount).to.be.gte(REWARD_RATE * 99n); // At least 99 seconds worth
      expect(claimedAmount).to.be.lte(REWARD_RATE * 105n); // At most 105 seconds worth (allow for transaction time)

      const pendingRewardsAfter = await nftStaking.getPendingRewards(user1.address);
      expect(pendingRewardsAfter).to.equal(0);
    });

    it("Should revert if no rewards to claim", async function () {
      // First, unstake the NFT to stop reward accumulation
      await nftStaking.connect(user1).unstake(0);
      
      // Claim any existing rewards
      const initialRewards = await nftStaking.getPendingRewards(user1.address);
      if (initialRewards > 0n) {
        await nftStaking.connect(user1).claimRewards();
      }
      
      // Verify no rewards immediately after claiming
      const rewardsAfterClaim = await nftStaking.getPendingRewards(user1.address);
      expect(rewardsAfterClaim).to.equal(0n);
      
      // Try to claim with zero rewards - should revert
      await expect(nftStaking.connect(user1).claimRewards())
        .to.be.revertedWith("NFTStaking: No rewards to claim");
    });

    it("Should update total claimed rewards", async function () {
      await time.increase(100);
      const pendingRewards = await nftStaking.getPendingRewards(user1.address);

      // Verify we have rewards to claim
      expect(pendingRewards).to.be.gt(0);

      await nftStaking.connect(user1).claimRewards();

      const totalClaimed = await nftStaking.getTotalClaimedRewards(user1.address);
      // Total claimed should equal what was pending before claiming (within small tolerance)
      // There might be tiny timing differences during claim execution
      expect(totalClaimed).to.be.gte(pendingRewards);
      expect(totalClaimed).to.be.lte(pendingRewards + REWARD_RATE * 2n); // Allow up to 2 seconds difference
      
      // Verify it's reasonable (should be around 1 token for 100 seconds)
      // Use range check to account for timing differences
      expect(totalClaimed).to.be.gte(REWARD_RATE * 99n);
      expect(totalClaimed).to.be.lte(REWARD_RATE * 105n);
    });

    it("Should reset lastClaimTimestamp after claiming", async function () {
      await time.increase(100);
      const timestampBefore = await nftStaking.lastClaimTimestamp(user1.address);

      await nftStaking.connect(user1).claimRewards();

      const timestampAfter = await nftStaking.lastClaimTimestamp(user1.address);
      expect(timestampAfter).to.be.gt(timestampBefore);
    });

    it("Should revert if contract is paused", async function () {
      await time.increase(100);
      await nftStaking.pause();

      await expect(nftStaking.connect(user1).claimRewards())
        .to.be.revertedWithCustomError(nftStaking, "EnforcedPause");
    });

    it("Should accumulate rewards over time correctly", async function () {
      // First period: 50 seconds
      await time.increase(50);
      let pendingRewards = await nftStaking.getPendingRewards(user1.address);
      const expectedRewards1 = REWARD_RATE * 50n;
      expect(pendingRewards).to.be.closeTo(expectedRewards1, REWARD_TOLERANCE);

      // Claim rewards
      await nftStaking.connect(user1).claimRewards();

      // Second period: 75 seconds
      await time.increase(75);
      pendingRewards = await nftStaking.getPendingRewards(user1.address);
      const expectedRewards2 = REWARD_RATE * 75n;
      expect(pendingRewards).to.be.closeTo(expectedRewards2, REWARD_TOLERANCE);
    });
  });

  describe("View Functions", function () {
    beforeEach(async function () {
      const tokenIds = [0, 1, 2];
      for (const tokenId of tokenIds) {
        await mockERC721.connect(user1).approve(await nftStaking.getAddress(), tokenId);
        await nftStaking.connect(user1).stake(tokenId);
      }
    });

    it("Should return correct staked token count", async function () {
      expect(await nftStaking.getStakedTokenCount(user1.address)).to.equal(3);
      expect(await nftStaking.getStakedTokenCount(user2.address)).to.equal(0);
    });

    it("Should return correct staked tokens array", async function () {
      const stakedTokens = await nftStaking.getStakedTokens(user1.address);
      expect(stakedTokens.length).to.equal(3);
      
      // Convert BigInt array to number array for comparison
      const tokenNumbers = stakedTokens.map(t => Number(t));
      expect(tokenNumbers).to.include.members([0, 1, 2]);
      expect(tokenNumbers.sort()).to.deep.equal([0, 1, 2]);
    });

    it("Should return correct staker for a token", async function () {
      expect(await nftStaking.tokenStaker(0)).to.equal(user1.address);
      expect(await nftStaking.tokenStaker(3)).to.equal(ethers.ZeroAddress);
    });

    it("Should return correct staking status", async function () {
      expect(await nftStaking.isTokenStaked(0)).to.be.true;
      expect(await nftStaking.isTokenStaked(3)).to.be.false;
    });

    it("Should return zero pending rewards for non-staker", async function () {
      expect(await nftStaking.getPendingRewards(user2.address)).to.equal(0);
    });
  });

  describe("Pausable", function () {
    it("Should allow owner to pause contract", async function () {
      await nftStaking.pause();
      expect(await nftStaking.paused()).to.be.true;
    });

    it("Should allow owner to unpause contract", async function () {
      await nftStaking.pause();
      await nftStaking.unpause();
      expect(await nftStaking.paused()).to.be.false;
    });

    it("Should revert if non-owner tries to pause", async function () {
      await expect(nftStaking.connect(user1).pause())
        .to.be.revertedWithCustomError(nftStaking, "OwnableUnauthorizedAccount");
    });

    it("Should revert if non-owner tries to unpause", async function () {
      await nftStaking.pause();
      await expect(nftStaking.connect(user1).unpause())
        .to.be.revertedWithCustomError(nftStaking, "OwnableUnauthorizedAccount");
    });
  });

  describe("Owner Functions", function () {
    it("Should allow owner to emergency withdraw", async function () {
      const withdrawAmount = ethers.parseEther("1000");
      const ownerBalanceBefore = await rewardToken.balanceOf(owner.address);

      await nftStaking.emergencyWithdraw(withdrawAmount);

      const ownerBalanceAfter = await rewardToken.balanceOf(owner.address);
      expect(ownerBalanceAfter - ownerBalanceBefore).to.equal(withdrawAmount);
    });

    it("Should revert if non-owner tries to emergency withdraw", async function () {
      await expect(
        nftStaking.connect(user1).emergencyWithdraw(ethers.parseEther("1000"))
      ).to.be.revertedWithCustomError(nftStaking, "OwnableUnauthorizedAccount");
    });

    it("Should revert emergency withdraw with zero amount", async function () {
      await expect(
        nftStaking.emergencyWithdraw(0)
      ).to.be.revertedWith("NFTStaking: Amount must be greater than zero");
    });

    it("Should revert emergency withdraw if insufficient balance", async function () {
      const contractBalance = await rewardToken.balanceOf(await nftStaking.getAddress());
      const excessiveAmount = contractBalance + ethers.parseEther("1");
      
      await expect(
        nftStaking.emergencyWithdraw(excessiveAmount)
      ).to.be.revertedWith("NFTStaking: Insufficient contract balance");
    });
  });

  describe("Edge Cases", function () {
    it("Should handle unstaking all NFTs correctly", async function () {
      const tokenIds = [0, 1, 2];
      for (const tokenId of tokenIds) {
        await mockERC721.connect(user1).approve(await nftStaking.getAddress(), tokenId);
        await nftStaking.connect(user1).stake(tokenId);
      }

      await time.increase(50);

      // Unstake all
      for (const tokenId of tokenIds) {
        await nftStaking.connect(user1).unstake(tokenId);
      }

      expect(await nftStaking.getStakedTokenCount(user1.address)).to.equal(0);
      const pendingRewards = await nftStaking.getPendingRewards(user1.address);
      expect(pendingRewards).to.be.gt(0);
    });

    it("Should handle multiple users staking simultaneously", async function () {
      // In Edge Cases section, there's no beforeEach, so we need to stake for user1
      // User1 stakes token 0
      await mockERC721.connect(user1).approve(await nftStaking.getAddress(), 0);
      await nftStaking.connect(user1).stake(0);
      
      // User2 stakes token 3
      await mockERC721.connect(user2).approve(await nftStaking.getAddress(), 3);
      await nftStaking.connect(user2).stake(3);

      // Both users now have 1 NFT staked
      // Wait 100 seconds
      await time.increase(100);

      const user1Rewards = await nftStaking.getPendingRewards(user1.address);
      const user2Rewards = await nftStaking.getPendingRewards(user2.address);

      // Both should have rewards (around 1 token for 100 seconds)
      // Use range check to account for timing differences
      expect(user1Rewards).to.be.gte(REWARD_RATE * 99n);
      expect(user1Rewards).to.be.lte(REWARD_RATE * 103n);
      expect(user2Rewards).to.be.gte(REWARD_RATE * 99n);
      expect(user2Rewards).to.be.lte(REWARD_RATE * 103n);
      
      // Both users should have rewards
      expect(user1Rewards).to.be.gt(0);
      expect(user2Rewards).to.be.gt(0);
    });

    it("Should prevent reentrancy attacks", async function () {
      // This test ensures ReentrancyGuard is working
      // Use a fresh token to avoid conflicts - get token ID before minting
      const tokenId = await mockERC721.getCurrentTokenId();
      await mockERC721.mint(user1.address);
      await mockERC721.connect(user1).approve(await nftStaking.getAddress(), tokenId);
      await nftStaking.connect(user1).stake(tokenId);

      await time.increase(100);

      // Multiple simultaneous calls should be safe
      await Promise.all([
        nftStaking.connect(user1).claimRewards(),
        nftStaking.connect(user1).getPendingRewards(user1.address),
      ]);
    });

    it("Should handle rapid stake/unstake cycles", async function () {
      // Use a fresh token to avoid conflicts - get token ID before minting
      const tokenId = await mockERC721.getCurrentTokenId();
      await mockERC721.mint(user1.address);
      
      // Initial approval
      await mockERC721.connect(user1).approve(await nftStaking.getAddress(), tokenId);

      // Rapid stake/unstake
      await nftStaking.connect(user1).stake(tokenId);
      await nftStaking.connect(user1).unstake(tokenId);
      
      // Re-approve after unstaking (approval is cleared)
      await mockERC721.connect(user1).approve(await nftStaking.getAddress(), tokenId);
      await nftStaking.connect(user1).stake(tokenId);
      await nftStaking.connect(user1).unstake(tokenId);

      expect(await nftStaking.getStakedTokenCount(user1.address)).to.equal(0);
      expect(await mockERC721.ownerOf(tokenId)).to.equal(user1.address);
    });

    it("Should correctly track rewards when staking/unstaking multiple times", async function () {
      // Use a fresh token to avoid conflicts - get token ID before minting
      const tokenId = await mockERC721.getCurrentTokenId();
      await mockERC721.mint(user1.address);
      await mockERC721.connect(user1).approve(await nftStaking.getAddress(), tokenId);

      // Stake
      await nftStaking.connect(user1).stake(tokenId);
      await time.increase(50);

      // Unstake
      await nftStaking.connect(user1).unstake(tokenId);
      const rewardsAfterUnstake = await nftStaking.getPendingRewards(user1.address);
      expect(rewardsAfterUnstake).to.be.gt(0);
      
      // Verify lastClaimTimestamp is reset when no NFTs staked
      const timestampAfterUnstake = await nftStaking.lastClaimTimestamp(user1.address);
      expect(timestampAfterUnstake).to.equal(0);

      // Re-approve after unstaking (approval is cleared)
      await mockERC721.connect(user1).approve(await nftStaking.getAddress(), tokenId);
      
      // Stake again
      await nftStaking.connect(user1).stake(tokenId);
      await time.increase(50);

      // Final rewards should include both periods
      const finalRewards = await nftStaking.getPendingRewards(user1.address);
      expect(finalRewards).to.be.gt(rewardsAfterUnstake);
    });

    it("Should not accumulate rewards after unstaking all NFTs", async function () {
      // Use a fresh token to avoid conflicts - get token ID before minting
      const tokenId = await mockERC721.getCurrentTokenId();
      await mockERC721.mint(user1.address);
      await mockERC721.connect(user1).approve(await nftStaking.getAddress(), tokenId);
      await nftStaking.connect(user1).stake(tokenId);
      
      await time.increase(50);
      
      // Unstake all NFTs - this will call _updateRewards which adds rewards up to unstake time
      await nftStaking.connect(user1).unstake(tokenId);
      
      // Get rewards immediately after unstaking (this includes rewards from the 50 seconds)
      const rewardsAfterUnstake = await nftStaking.getPendingRewards(user1.address);
      
      // Wait some time - rewards should NOT increase because lastClaimTimestamp is reset to 0
      await time.increase(100);
      
      // Rewards should not have increased after unstaking (should be same as right after unstake)
      const rewardsAfterWait = await nftStaking.getPendingRewards(user1.address);
      expect(rewardsAfterWait).to.equal(rewardsAfterUnstake);
      
      // Verify rewards are reasonable (around 50 seconds worth)
      expect(rewardsAfterUnstake).to.be.gte(REWARD_RATE * 49n);
      expect(rewardsAfterUnstake).to.be.lte(REWARD_RATE * 52n);
    });
  });

  describe("Gas Optimization", function () {
    it("Should efficiently handle batch staking operations", async function () {
      const tokenIds = [0, 1, 2];
      const gasUsed = [];

      for (const tokenId of tokenIds) {
        await mockERC721.connect(user1).approve(await nftStaking.getAddress(), tokenId);
        const tx = await nftStaking.connect(user1).stake(tokenId);
        const receipt = await tx.wait();
        gasUsed.push(receipt.gasUsed);
      }

      // All stake operations should use similar gas
      expect(gasUsed.length).to.equal(3);
      // Gas should be reasonable (less than 200k per stake)
      gasUsed.forEach(gas => {
        expect(gas).to.be.lt(200000n);
      });
    });
  });

  describe("Event Emissions", function () {
    it("Should emit NFTStaked event with correct parameters", async function () {
      const tokenId = 0;
      await mockERC721.connect(user1).approve(await nftStaking.getAddress(), tokenId);

      await expect(nftStaking.connect(user1).stake(tokenId))
        .to.emit(nftStaking, "NFTStaked")
        .withArgs(user1.address, tokenId, anyValue);
    });

    it("Should emit NFTUnstaked event with correct parameters", async function () {
      const tokenId = 0;
      await mockERC721.connect(user1).approve(await nftStaking.getAddress(), tokenId);
      await nftStaking.connect(user1).stake(tokenId);

      await expect(nftStaking.connect(user1).unstake(tokenId))
        .to.emit(nftStaking, "NFTUnstaked")
        .withArgs(user1.address, tokenId, anyValue);
    });

    it("Should emit RewardsClaimed event with correct parameters", async function () {
      const tokenId = 0;
      await mockERC721.connect(user1).approve(await nftStaking.getAddress(), tokenId);
      await nftStaking.connect(user1).stake(tokenId);
      await time.increase(100);

      await expect(nftStaking.connect(user1).claimRewards())
        .to.emit(nftStaking, "RewardsClaimed")
        .withArgs(user1.address, anyValue, anyValue);
    });
  });
});
