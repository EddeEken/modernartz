import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import NFTMarketplaceABI from "../../assets/NFTMarketplaceABI.json";
import "./MyNFTs.css";

const MyNFTs = ({ signer, address }) => {
  const [myNFTs, setMyNFTs] = useState([]);

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
            return { id: tokenId, tokenURI };
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
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MyNFTs;