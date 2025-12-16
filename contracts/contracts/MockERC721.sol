// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MockERC721
 * @dev Mock ERC721 contract for testing purposes
 */
contract MockERC721 is ERC721, Ownable {
    uint256 private _tokenIdCounter;

    constructor(string memory name, string memory symbol) ERC721(name, symbol) Ownable(msg.sender) {
        _tokenIdCounter = 0;
    }

    /**
     * @dev Mint a new NFT to a specified address
     * @param to Address to mint the NFT to
     * @return tokenId The ID of the newly minted token
     */
    function mint(address to) public onlyOwner returns (uint256) {
        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;
        _safeMint(to, tokenId);
        return tokenId;
    }

    /**
     * @dev Mint multiple NFTs to a specified address
     * @param to Address to mint the NFTs to
     * @param quantity Number of NFTs to mint
     */
    function mintBatch(address to, uint256 quantity) public onlyOwner {
        for (uint256 i = 0; i < quantity; i++) {
            mint(to);
        }
    }

    /**
     * @dev Get the current token ID counter
     * @return The next token ID that will be minted
     */
    function getCurrentTokenId() public view returns (uint256) {
        return _tokenIdCounter;
    }
}
