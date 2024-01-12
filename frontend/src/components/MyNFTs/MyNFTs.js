/* eslint-disable */
import React, { useEffect, useState, useCallback } from "react";
import { ethers } from "ethers";
import { ABI } from "../../assets/NFTMarketplaceABI";
import "./MyNFTs.css";

const MyNFTs = ({ contractAddress, signer, provider, userAddress }) => {
  const [myNFTs, setMyNFTs] = useState([]);
  const [error, setError] = useState(null);
  const [connected, setConnected] = useState(false);
  const [sellPrice, setSellPrice] = useState(0);
  const [selectedNFTForSale, setSelectedNFTForSale] = useState(null);

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

      const totalSupply = await contract.balanceOf(userAddress);
      const nfts = [];

      for (let i = 0; i < totalSupply; i++) {
        try {
          const metadataString = await contract.tokenURI(i);
          const metadataUrl = resolveIpfsUrl(metadataString);

          const response = await fetch(metadataUrl);
          const metadata = await response.json();

          const isForSale = await contract.isNFTForSale(i);

          nfts.push({
            id: i,
            tokenURI: {
              name: metadata.name || "Unknown Name",
              description: metadata.description || "Unknown Description",
              image: metadata.image || "default-image-url",
            },
            isForSale: isForSale,
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

      setMyNFTs(nfts);
    } catch (error) {
      setError(error.message);
    }
  }, [contractAddress, signer, provider, userAddress]);

  const listNFTForSale = async (tokenId) => {
    try {
      if (!sellPrice || isNaN(sellPrice)) {
        setError("Please enter a valid price for the NFT.");
        return;
      }

      const contract = new ethers.Contract(contractAddress, ABI, signer);
      await contract.listNFT(
        tokenId,
        ethers.utils.parseEther(sellPrice.toString())
      );
      fetchData();
    } catch (error) {
      console.error("Error listing NFT for sale:", error.message);
      setError(error.message);
    }
  };

  const cancelSale = async (tokenId) => {
    try {
      const contract = new ethers.Contract(contractAddress, ABI, signer);
      await contract.cancelSale(tokenId);
      fetchData();
    } catch (error) {
      console.error("Error canceling NFT sale:", error.message);
    }
  };

  const handleInputChange = (e) => {
    setSellPrice(e.target.value);
  };

  const handleSellClick = (tokenId) => {
    if (selectedNFTForSale === tokenId) {
      cancelSale(tokenId);
      setSelectedNFTForSale(null);
    } else {
      setSelectedNFTForSale(tokenId);
    }
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (!connected) {
    return <div>Connect your wallet to see your NFTs</div>;
  }

  return (
    <div>
      <h2>My NFTs</h2>
      {myNFTs.map((nft) => (
        <div key={nft.id}>
          <img
            src={resolveIpfsUrl(nft.tokenURI.image)}
            alt={`My NFTs ${nft.id}`}
            loading="lazy"
          />
          <div>Name: {nft.tokenURI.name}</div>
          <div>Description: {nft.tokenURI.description}</div>
          {nft.isForSale ? (
            <div>
              <div>
                Price (ETH): {ethers.utils.formatEther(nft.tokenURI.price)}
              </div>
              <button onClick={() => handleSellClick(nft.id)}>
                Cancel Sale
              </button>
            </div>
          ) : (
            <div>
              <input
                type="number"
                placeholder="Enter price in ETH"
                value={sellPrice}
                onChange={handleInputChange}
              />
              <button onClick={() => listNFTForSale(nft.id)}>Sell NFT</button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default MyNFTs;
