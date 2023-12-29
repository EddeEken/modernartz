import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import NFTMarketplaceABI from "../../assets/NFTMarketplaceABI.json";
import "./MyNFTs.css";

const MyNFTs = ({ signer, address }) => {
  const [desiredPrice, setDesiredPrice] = useState(0);
  const [myNFTs, setMyNFTs] = useState([]);

  const listNFT = async (tokenId, price) => {
    const contract = new ethers.Contract(address, NFTMarketplaceABI, signer);
    try {
      const tx = await contract.listNFT(tokenId, price);
      await tx.wait();
    } catch (error) {
      console.error("Error listing NFT for sale:", error.message);
    }
  };

  const cancelSale = async (tokenId) => {
    const contract = new ethers.Contract(address, NFTMarketplaceABI, signer);
    try {
      const tx = await contract.cancelSale(tokenId);
      await tx.wait();
    } catch (error) {
      console.error("Error cancelling sale:", error.message);
    }
  };

  useEffect(() => {
    const fetchMyNFTs = async () => {
      try {
        const contract = new ethers.Contract(
          address,
          NFTMarketplaceABI,
          signer
        );
        const filter = contract.filters.Transfer(signer.address, null, null);
        const transferEvents = await contract.queryFilter(filter);

        const myNFTIds = transferEvents.map((event) =>
          event.args[2].toNumber()
        );
        const myNFTsData = await Promise.all(
          myNFTIds.map(async (tokenId) => {
            const tokenURI = await contract.tokenURI(tokenId);
            const isForSale = await contract.nftsForSale(tokenId);
            return { id: tokenId, tokenURI, isForSale };
          })
        );

        setMyNFTs(myNFTsData);
      } catch (error) {
        console.error("Error fetching my NFTs:", error.message);
      }
    };

    fetchMyNFTs();
  }, [signer, address]);

  return (
    <div>
      <h1>My NFTs</h1>
      <ul>
        {myNFTs.map((nft) => (
          <li key={nft.id}>
            <p>ID: {nft.id}</p>
            <p>TokenURI: {nft.tokenURI}</p>
            <input
              type="number"
              value={desiredPrice}
              onChange={(e) => setDesiredPrice(e.target.value)}
            />
            <button onClick={() => listNFT(nft.id, desiredPrice)}>
              List for Sale
            </button>
            {nft.isForSale && (
              <button onClick={() => cancelSale(nft.id)}>Cancel Sale</button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MyNFTs;
