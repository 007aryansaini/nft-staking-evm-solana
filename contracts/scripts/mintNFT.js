const hre = require("hardhat");

/**
 * @dev Script to mint NFTs to a specific address
 * Usage: npx hardhat run scripts/mintNFT.js --network sepolia
 */
async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Minting NFTs with account:", deployer.address);

  // Get contract addresses from .env or use deployed addresses
  const NFT_COLLECTION_ADDRESS = process.env.NFT_COLLECTION_ADDRESS || "0x4Dc390a7e893e17d25c2247D5cf3718F6E3759bF";
  
  // Address to mint NFT to (change this to the recipient's address)
  const recipientAddress = process.env.RECIPIENT_ADDRESS || "0x1df86eAcBbCb398BC5bac64C1391D66c7950fA65";
  const quantity = process.env.MINT_QUANTITY ? parseInt(process.env.MINT_QUANTITY) : 1;

  console.log("\n=== Minting NFT ===");
  console.log("NFT Collection:", NFT_COLLECTION_ADDRESS);
  console.log("Recipient Address:", recipientAddress);
  console.log("Quantity:", quantity);

  // Get the NFT contract
  const MockERC721 = await hre.ethers.getContractFactory("MockERC721");
  const nftContract = MockERC721.attach(NFT_COLLECTION_ADDRESS);

  // Check if deployer is the owner
  const owner = await nftContract.owner();
  if (owner.toLowerCase() !== deployer.address.toLowerCase()) {
    console.error("Error: Deployer is not the owner of the NFT contract!");
    console.error("Owner:", owner);
    console.error("Deployer:", deployer.address);
    process.exit(1);
  }

  // Mint NFT(s)
  if (quantity === 1) {
    console.log("\nMinting 1 NFT...");
    const mintTx = await nftContract.mint(recipientAddress);
    const receipt = await mintTx.wait();
    
    // Get the token ID from events or current counter
    const tokenId = await nftContract.getCurrentTokenId();
    const actualTokenId = tokenId - 1n; // Subtract 1 because counter increments after mint
    
    console.log("✅ NFT minted successfully!");
    console.log("Transaction Hash:", receipt.hash);
    console.log("Token ID:", actualTokenId.toString());
    console.log("Recipient:", recipientAddress);
    console.log("\nView on Etherscan:");
    console.log(`https://sepolia.etherscan.io/tx/${receipt.hash}`);
  } else {
    console.log(`\nMinting ${quantity} NFTs...`);
    const mintTx = await nftContract.mintBatch(recipientAddress, quantity);
    const receipt = await mintTx.wait();
    
    const currentTokenId = await nftContract.getCurrentTokenId();
    const startTokenId = currentTokenId - BigInt(quantity);
    
    console.log("✅ NFTs minted successfully!");
    console.log("Transaction Hash:", receipt.hash);
    console.log(`Token IDs: ${startTokenId.toString()} to ${(currentTokenId - 1n).toString()}`);
    console.log("Recipient:", recipientAddress);
    console.log("\nView on Etherscan:");
    console.log(`https://sepolia.etherscan.io/tx/${receipt.hash}`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
