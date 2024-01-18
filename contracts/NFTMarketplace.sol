// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/utils/Strings.sol";


contract NFTMarketplace is ERC721, Ownable, IERC721Receiver {
   using Address for address payable;

   uint256 public nextTokenId;
   uint256 public marketplaceFee; 

   mapping(uint256 => uint256) public nftPrices;
   mapping(uint256 => bool) public nftsForSale;
   mapping(uint256 => string) public nftIpfsMetadata;

   event NFTListed(uint256 tokenId, uint256 price);
   event NFTSold(uint256 tokenId, address buyer, uint256 price);
   event NFTSaleCancelled(uint256 tokenId);

   constructor(string memory _name, string memory _symbol, uint256 _marketplaceFee, address initialOwner) ERC721(_name, _symbol) Ownable(initialOwner) {
       marketplaceFee = _marketplaceFee;
   }

   function tokenURI(uint256 tokenId) public view override returns (string memory) {
       require(ownerOf(tokenId) != address(0), "Token does not exist");
        string memory metadata = nftIpfsMetadata[tokenId];
        return metadata;
   }

   function mint(string memory ipfsMetadata) external {
       uint256 tokenId = nextTokenId;
       nftIpfsMetadata[tokenId] = ipfsMetadata;
       _safeMint(msg.sender, tokenId);
       nextTokenId++;
   }

   function listNFT(uint256 tokenId, uint256 price) external {
       require(ownerOf(tokenId) == msg.sender, "You do not own this NFT");
       require(ownerOf(tokenId) != address(0), "NFT does not exist");
       
       nftPrices[tokenId] = price;
       nftsForSale[tokenId] = true;

       emit NFTListed(tokenId, price);
   }

   function buyNFT(uint256 tokenId) external payable {
       require(nftsForSale[tokenId], "NFT is not listed for sale");
       uint256 price = nftPrices[tokenId];
       require(msg.value == price, "Incorrect payment amount");

       address seller = ownerOf(tokenId);

       uint256 feeAmount = (price * marketplaceFee) / 100;
       uint256 sellerAmount = price - feeAmount;

       payable(owner()).transfer(feeAmount);
       payable(seller).transfer(sellerAmount);

       _transfer(seller, msg.sender, tokenId);

       nftsForSale[tokenId] = false;
       
       emit NFTSold(tokenId, msg.sender, price);
   }

   function cancelSale(uint256 tokenId) external {
       address owner = ownerOf(tokenId);

       require(owner == msg.sender, "You do not own this NFT");
       require(nftsForSale[tokenId], "NFT is not listed for sale");

       nftsForSale[tokenId] = false;

       emit NFTSaleCancelled(tokenId);
   }

   function isNFTForSale(uint256 tokenId) external view returns (bool) {
    return nftsForSale[tokenId];
}

   function getNextTokenId() public view returns (uint256) {
       return nextTokenId;
   }

   function onERC721Received(address, address, uint256, bytes calldata) external pure override returns (bytes4) {
       return this.onERC721Received.selector;
   }
}
