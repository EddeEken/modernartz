const { expect } = require("chai");

describe("NFTMarketplace", function () {
  let NFTMarketplace,
    nftMarketplace,
    NFTCollection,
    nftCollection,
    owner,
    addr1,
    addr2;
  let addrs;

  beforeEach(async function () {
    NFTCollection = await ethers.getContractFactory("NFTCollection");
    nftCollection = await NFTCollection.deploy();
    await nftCollection.deployed();

    NFTMarketplace = await ethers.getContractFactory("NFTMarketplace");
    nftMarketplace = await NFTMarketplace.deploy(nftCollection.address, 10);
    await nftMarketplace.deployed();

    [owner, addr1, addr2, _] = await ethers.getSigners();

    await nftCollection.connect(owner).mint(addr1.address, 1);
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await nftMarketplace.owner()).to.equal(owner.address);
    });
  });

  describe("Listing NFT", function () {
    it("Should allow the owner to list NFTs", async function () {
      await nftCollection.connect(addr1).approve(nftMarketplace.address, 1);
      await nftMarketplace
        .connect(addr1)
        .listNFT(nftCollection.address, 1, ethers.utils.parseEther("1.0"));
      expect(await nftMarketplace.listings(1)).to.equal(addr1.address);
    });
  });
});
