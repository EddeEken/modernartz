import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import NFTMarketplaceABI from "../../assets/NFTMarketplaceABI.json";
import "./AllNFTs.css";

const AllNFTs = ({ address }) => {
  const [allNFTs, setAllNFTs] = useState([]);

  useEffect(() => {
    const fetchAllNFTs = async () => {
      try {
        const contract = new ethers.Contract(
          address,
          NFTMarketplaceABI,
          ethers.getDefaultProvider()
        );
        const totalSupply = await contract.totalSupply();
        const allNFTsData = await Promise.all(
          Array.from({ length: totalSupply.toNumber() }, (_, index) =>
            contract.tokenURI(index)
          )
        );

        setAllNFTs(allNFTsData);
      } catch (error) {
        console.error("Error fetching all NFTs:", error.message);
      }
    };

    fetchAllNFTs();
  }, [address]);

  return (
    <div>
      <h1>All NFTs on Sale</h1>
      <ul>
        {allNFTs.map((nft, index) => (
          <li key={index}>
            <p>TokenURI: {nft}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AllNFTs;
