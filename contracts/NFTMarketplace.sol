// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";

contract NFTMarketplace is ERC721, Ownable, IERC721Receiver {
    using Address for address payable;

    uint256 public nextTokenId;
    uint256 public marketplaceFee; 

    mapping(uint256 => uint256) public nftPrices;
    mapping(uint256 => bool) public nftsForSale;

    event NFTListed(uint256 tokenId, uint256 price);
    event NFTSold(uint256 tokenId, address buyer, uint256 price);
    event NFTSaleCancelled(uint256 tokenId);

    constructor(string memory _name, string memory _symbol, uint256 _marketplaceFee) ERC721(_name, _symbol) {
        marketplaceFee = _marketplaceFee;
    }

    function mint() external onlyOwner {
        uint256 tokenId = nextTokenId;
        _safeMint(msg.sender, tokenId);
        nextTokenId++;
    }

    function listNFT(uint256 tokenId, uint256 price) external {
        require(ownerOf(tokenId) == msg.sender, "You do not own this NFT");
        require(!_exists(tokenId), "NFT does not exist");
        
        nftPrices[tokenId] = price;
        nftsForSale[tokenId] = true;

        emit NFTListed(tokenId, price);
    }

    function buyNFT(uint256 tokenId) external payable {
        require(nftsForSale[tokenId], "NFT is not listed for sale");
        uint256 price = nftPrices[tokenId];
        require(msg.value == price, "Incorrect payment amount");

        address seller = ownerOf(tokenId);

        // Calculate fees
        uint256 feeAmount = (price * marketplaceFee) / 100;
        uint256 sellerAmount = price - feeAmount;

        // Transfer fees
        payable(owner()).transfer(feeAmount);
        // Transfer sale amount to seller
        payable(seller).transfer(sellerAmount);

        // Transfer NFT to buyer
        _transfer(seller, msg.sender, tokenId);

        // Update state
        nftsForSale[tokenId] = false;
        
        emit NFTSold(tokenId, msg.sender, price);
    }

    function cancelSale(uint256 tokenId) external {
        require(ownerOf(tokenId) == msg.sender, "You do not own this NFT");
        require(nftsForSale[tokenId], "NFT is not listed for sale");

        // Remove listing
        nftsForSale[tokenId] = false;

        emit NFTSaleCancelled(tokenId);
    }

    // Implement onERC721Received
    function onERC721Received(address, address, uint256, bytes calldata) external pure override returns (bytes4) {
        return this.onERC721Received.selector;
    }
}
