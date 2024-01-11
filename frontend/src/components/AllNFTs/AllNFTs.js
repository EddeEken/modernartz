/* eslint-disable */
import React, { useEffect, useState, useCallback } from "react";
import { ethers } from "ethers";
import { ABI } from "../../assets/NFTMarketplaceABI";
import "./AllNFTs.css";

const AllNFTs = ({ contractAddress, signer, provider, userAddress }) => {
  const [allNFTs, setAllNFTs] = useState([]);
  const [error, setError] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const checkConnected = async () => {
      try {
        if (provider && provider.getSigner()) {
          setConnected(true);
        }
      } catch (error) {
        console.error("Error checking connection:", error.message);
      }
    };

    checkConnected();
  }, [provider]);

  const fetchData = useCallback(async () => {
    try {
      if (!provider) {
        setError("Provider is undefined");
        return;
      }

      if (!provider.getSigner()) {
        setError("Not connected to a wallet");
        return;
      }

      setConnected(true);

      const contract = new ethers.Contract(contractAddress, ABI, signer);

      const totalSupply = await contract.getTotalSupply();
      const nfts = [];

      for (let i = 0; i < totalSupply; i++) {
        try {
          console.log(`Fetching token URI for token ID ${i}...`);
          const tokenURI = await contract.tokenURI(i);
          nfts.push({ id: i, tokenURI: tokenURI });
        } catch (error) {
          console.error(
            "Error fetching token data for token ID",
            i,
            ":",
            error.message
          );
        }
      }

      console.log("Setting All NFTs...");
      setAllNFTs(nfts);
    } catch (error) {
      setError(error.message);
    }
  }, [contractAddress, signer, provider, userAddress]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const resolveIpfsUrl = (ipfsUrl) => {
    const baseUrl = "https://nft.storage/ipfs/";
    const cid = ipfsUrl.replace("ipfs://", "");
    return `${baseUrl}${cid}`;
  };

  if (!connected) {
    return <div>Connect your wallet to see all NFTs for sale</div>;
  }

  return (
    <div>
      <h2>All NFTs for sale</h2>
      {allNFTs.map((nft) => (
        <div key={nft.id}>
          <img src={resolveIpfsUrl(nft.tokenURI)} alt={`NFT ${nft.id}`} />
        </div>
      ))}
    </div>
  );
};

export default AllNFTs;
