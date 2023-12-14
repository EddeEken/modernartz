const hre = require("hardhat");

async function main() {
  const NFTCollection = await hre.ethers.getContractFactory("NFTCollection");
  const nftCollection = await NFTCollection.deploy();
  await nftCollection.deployed();

  const NFTMarketplace = await hre.ethers.getContractFactory("NFTMarketplace");
  const nftMarketplace = await NFTMarketplace.deploy(nftCollection.address, 10);
  await nftMarketplace.deployed();

  console.log("NFTCollection deployed to:", nftCollection.address);
  console.log("NFTMarketplace deployed to:", nftMarketplace.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
