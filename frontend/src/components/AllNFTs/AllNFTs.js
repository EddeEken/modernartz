import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { ABI } from "../../assets/NFTMarketplaceABI";
import "./AllNFTs.css";

const AllNFTs = ({ signer, address }) => {
  const [allNFTs, setAllNFTs] = useState([]);
  const contractAddress = "0x3F11ccCc461b5f115D921DaFC642E309D2eCcEBD";

  const cancelSale = async (tokenId) => {
    const contract = new ethers.Contract(contractAddress, ABI, signer);
    try {
      const tx = await contract.cancelSale(tokenId);
      await tx.wait();
    } catch (error) {
      console.error("Error cancelling sale:", error.message);
    }
  };

  useEffect(() => {
    const fetchAllNFTs = async () => {
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
