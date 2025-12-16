const hre = require("hardhat");

/**
 * @dev Deployment script for NFT Staking contracts
 * Deploys RewardToken and NFTStaking contracts
 */
async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await hre.ethers.provider.getBalance(deployer.address)).toString());

  // Deploy RewardToken
  console.log("\n=== Deploying RewardToken ===");
  const RewardToken = await hre.ethers.getContractFactory("RewardToken");
  const initialSupply = hre.ethers.parseEther("1000000"); // 1M tokens
  const rewardToken = await RewardToken.deploy(initialSupply);
  await rewardToken.waitForDeployment();
  const rewardTokenAddress = await rewardToken.getAddress();
  console.log("RewardToken deployed to:", rewardTokenAddress);

  // Deploy MockERC721 (for testing, replace with actual NFT collection address in production)
  console.log("\n=== Deploying MockERC721 ===");
  const MockERC721 = await hre.ethers.getContractFactory("MockERC721");
  const mockERC721 = await MockERC721.deploy("Test NFT", "TNFT");
  await mockERC721.waitForDeployment();
  const mockERC721Address = await mockERC721.getAddress();
  console.log("MockERC721 deployed to:", mockERC721Address);

  // Deploy NFTStaking
  console.log("\n=== Deploying NFTStaking ===");
  const NFTStaking = await hre.ethers.getContractFactory("NFTStaking");
  const nftStaking = await NFTStaking.deploy(mockERC721Address, rewardTokenAddress);
  await nftStaking.waitForDeployment();
  const nftStakingAddress = await nftStaking.getAddress();
  console.log("NFTStaking deployed to:", nftStakingAddress);

  // Transfer reward tokens to staking contract for distribution
  console.log("\n=== Setting up reward tokens ===");
  const rewardAmount = hre.ethers.parseEther("500000"); // 500K tokens for rewards
  const transferTx = await rewardToken.transfer(nftStakingAddress, rewardAmount);
  await transferTx.wait();
  console.log(`Transferred ${hre.ethers.formatEther(rewardAmount)} tokens to staking contract`);

  console.log("\n=== Deployment Summary ===");
  console.log("RewardToken Address:", rewardTokenAddress);
  console.log("MockERC721 Address:", mockERC721Address);
  console.log("NFTStaking Address:", nftStakingAddress);
  console.log("\n=== Save these addresses to your .env file ===");
  console.log(`REWARD_TOKEN_ADDRESS=${rewardTokenAddress}`);
  console.log(`NFT_COLLECTION_ADDRESS=${mockERC721Address}`);
  console.log(`STAKING_CONTRACT_ADDRESS=${nftStakingAddress}`);

  // Verify contracts on block explorer (if on testnet/mainnet)
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("\n=== Waiting for block confirmations before verification ===");
    await new Promise(resolve => setTimeout(resolve, 30000)); // Wait 30 seconds

    try {
      console.log("\n=== Verifying RewardToken ===");
      await hre.run("verify:verify", {
        address: rewardTokenAddress,
        constructorArguments: [initialSupply],
      });
    } catch (error) {
      console.log("RewardToken verification failed:", error.message);
    }

    try {
      console.log("\n=== Verifying MockERC721 ===");
      await hre.run("verify:verify", {
        address: mockERC721Address,
        constructorArguments: ["Test NFT", "TNFT"],
      });
    } catch (error) {
      console.log("MockERC721 verification failed:", error.message);
    }

    try {
      console.log("\n=== Verifying NFTStaking ===");
      await hre.run("verify:verify", {
        address: nftStakingAddress,
        constructorArguments: [mockERC721Address, rewardTokenAddress],
      });
    } catch (error) {
      console.log("NFTStaking verification failed:", error.message);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
