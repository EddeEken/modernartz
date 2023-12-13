// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Address.sol";

contract NFTCollection is ERC721, Ownable {
  constructor() ERC721("NFTCollection", "NFTC") {}

  function mint(address to, uint256 tokenId) external {
      _mint(to, tokenId);
  }
}

contract NFTMarketplace is IERC721Receiver {
  enum UserRole {Admin, Seller, Buyer}

  address public marketplaceAddress;
  uint256 public marketplaceFee;

  mapping(address => UserRole) public userRoles;
  mapping(uint256 => NFTListing) public listings;

  struct NFTListing {
      address seller;
      uint256 price;
      bool isForSale;
  }

  constructor(address _marketplaceAddress, uint256 _marketplaceFee) {
      marketplaceAddress = _marketplaceAddress;
      marketplaceFee = _marketplaceFee;
      setUserRole(msg.sender, UserRole.Admin);
  }

  modifier onlyAdmin() {
      require(userRoles[msg.sender] == UserRole.Admin, "Caller is not an admin");
      _;
  }

  function setUserRole(address user, UserRole role) public onlyAdmin {
      userRoles[user] = role;
  }
function onERC721Received(address, address, uint256, bytes calldata) external pure override returns (bytes4) {
   return this.onERC721Received.selector;
}
    function listNFT(address nftAddress, uint256 tokenId, uint256 price) public {
        require(IERC721(nftAddress).ownerOf(tokenId) == msg.sender, "You do not own this NFT");
        require(userRoles[msg.sender] == UserRole.Seller, "You do not have permission to list NFTs");
        IERC721(nftAddress).safeTransferFrom(msg.sender, address(this), tokenId);
        listings[tokenId] = NFTListing({
            seller: msg.sender,
            price: price,
            isForSale: true
        });
    }
    function buyNFT(address nftAddress, uint256 tokenId) public payable {
        require(listings[tokenId].seller != address(0), "NFT is not listed for sale");
        require(listings[tokenId].price == msg.value, "Incorrect payment amount");
        address seller = listings[tokenId].seller;
        uint256 salePrice = listings[tokenId].price;
        uint256 feeAmount = salePrice * marketplaceFee / 100;
        payable(marketplaceAddress).transfer(feeAmount);
        payable(seller).transfer(salePrice - feeAmount);
        IERC721(nftAddress).safeTransferFrom(address(this), msg.sender, tokenId);
        listings[tokenId].isForSale = false;
    }
    function cancelSale(address nftAddress, uint256 tokenId) public {
        require(listings[tokenId].seller == msg.sender, "You do not own this NFT");
        require(listings[tokenId].isForSale == true, "NFT is not for sale");
        IERC721(nftAddress).safeTransferFrom(address(this), msg.sender, tokenId);
        listings[tokenId].isForSale = false;
    }
 }
