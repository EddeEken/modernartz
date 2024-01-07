import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { ABI } from "../../assets/NFTMarketplaceABI";
import "./AllNFTs.css";

const AllNFTs = ({ contractAddress }) => {
  const [allNFTs, setAllNFTs] = useState([]);
  const [totalSupply, setTotalSupply] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const contract = new ethers.Contract(
          contractAddress,
          ABI,
          ethers.getDefaultProvider()
        );

        let currentTokenID = 0;
        const allNFTsData = [];

        while (true) {
          try {
            const tokenURI = await contract.tokenURI(currentTokenID);
            const isForSale = await contract.nftsForSale(currentTokenID);
            allNFTsData.push({ id: currentTokenID, tokenURI, isForSale });
            currentTokenID++;
          } catch (error) {
            break;
          }
        }

        const supply = await contract.nextTokenId();
        setTotalSupply(supply.toNumber());

        const nftsData = [];
        for (let i = 0; i < totalSupply; i++) {
          const tokenURI = await contract.tokenURI(i);
          nftsData.push(tokenURI);
        }

        setAllNFTs(nftsData);
      } catch (error) {
        console.error("Error fetching NFT data:", error.message);
      }
    };

    fetchData();
  }, [contractAddress, totalSupply]);

  return (
    <div>
      <h1>All NFTs on Sale</h1>
      <ul>
        {allNFTs.map((nft) => (
          <li key={nft.id}>
            <p>TokenURI: {nft.tokenURI}</p>
            {nft.isForSale && (
              <button onClick={() => cancelSale(nft.id)}>Cancel Sale</button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AllNFTs;
