/* eslint-disable */
import React, { useEffect, useState, useCallback } from "react";
import { ethers } from "ethers";
import { ABI } from "../../assets/NFTMarketplaceABI";
import "./AllNFTs.css";

const AllNFTs = ({ contractAddress, signer, provider, userAddress }) => {
  const [allNFTs, setAllNFTs] = useState([]);
  const [error, setError] = useState(null);
  const [connected, setConnected] = useState(false);

  const resolveIpfsUrl = (ipfsUrl) => {
    if (!ipfsUrl) {
      return "";
    }

    const isIpfsUri = ipfsUrl.startsWith("ipfs://");

    if (isIpfsUri) {
      const cid = ipfsUrl.replace("ipfs://", "");
      const gatewayUrl = "https://ipfs.io/ipfs/";
      return `${gatewayUrl}${cid}`;
    } else {
      return ipfsUrl;
    }
  };

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
          const metadataString = await contract.tokenURI(i);
          const metadataUrl = resolveIpfsUrl(metadataString);

          const response = await fetch(metadataUrl);
          const metadata = await response.json();
          nfts.push({
            id: i,
            tokenURI: {
              name: metadata.name || "Unknown Name",
              description: metadata.description || "Unknown Description",
              image: metadata.image || "default-image-url",
            },
          });
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

  const buyNFT = async (tokenId) => {
    try {
      const contract = new ethers.Contract(contractAddress, ABI, signer);
      await contract.buyNFT(tokenId);
      fetchData();
    } catch (error) {
      console.error("Error buying NFT:", error.message);
    }
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (!connected) {
    return <div>Connect your wallet to see all NFTs for sale</div>;
  }

  return (
    <div>
      <h2>All NFTs for sale</h2>
      {allNFTs.map((nft) => (
        <div key={nft.id}>
          <img
            src={resolveIpfsUrl(nft.tokenURI.image)}
            alt={`My NFTs ${nft.id}`}
            loading="lazy"
          />
          <div>Name: {nft.tokenURI.name}</div>
          <div>Description: {nft.tokenURI.description}</div>
          <div>
            <button onClick={() => buyNFT(nft.id)}>Buy NFT</button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AllNFTs;
