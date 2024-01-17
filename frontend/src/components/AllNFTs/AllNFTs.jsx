/* eslint-disable */
import React, { useEffect, useState, useCallback } from "react";
import { ethers } from "ethers";
import { ABI } from "../../assets/NFTMarketplaceABI";
import "./AllNFTs.css";

const AllNFTs = ({ contractAddress, signer, provider, userAddress }) => {
  const [nfts, setNFTs] = useState([]);
  const [errors, setErrors] = useState({});
  const [connected, setConnected] = useState(false);
  const [purchaseErrors, setPurchaseErrors] = useState({});
  const [currentTokenId, setCurrentTokenId] = useState(null);
  const [buySuccessMessage, setBuySuccessMessage] = useState(null);
  const [buyPrices, setBuyPrices] = useState({});

  const resolveIpfsUrl = (ipfsUrl) => {
    if (!ipfsUrl) {
      return "";
    }

    const isIpfsUri = ipfsUrl.startsWith("ipfs://");

    if (isIpfsUri) {
      const cid = ipfsUrl.replace("ipfs://", "");
      const gatewayUrl = "https://nftstorage.link/ipfs/";
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
      if (!provider || !provider.getSigner()) {
        setErrors({ general: "Not connected to a wallet" });
        return;
      }

      setConnected(true);

      const contract = new ethers.Contract(contractAddress, ABI, signer);

      const fetchedNFTs = [];

      const totalSupply = await contract.getNextTokenId();

      for (let i = 0; i < totalSupply; i++) {
        try {
          const metadataString = await contract.tokenURI(i);
          const metadataUrl = resolveIpfsUrl(metadataString);

          const response = await fetch(metadataUrl);
          const metadata = await response.json();

          const isForSale = await contract.isNFTForSale(i);

          if (isForSale) {
            const price = await contract.nftPrices(i);

            fetchedNFTs.push({
              id: i,
              tokenURI: {
                name: metadata.name || "Unknown Name",
                description: metadata.description || "Unknown Description",
                image: metadata.image || "default-image-url",
              },
              isForSale,
              price,
            });
          }
        } catch (error) {
          console.error(
            "Error fetching NFT data for token ID",
            i,
            ":",
            error.message
          );
        }
      }

      setNFTs(fetchedNFTs);
      setErrors({});
    } catch (error) {
      setErrors({ general: error.message });
    }
  }, [contractAddress, signer, provider, userAddress]);

  const buyNFT = async (tokenId) => {
    try {
      setCurrentTokenId(tokenId);

      const contract = new ethers.Contract(contractAddress, ABI, signer);

      const actualPrice = await contract.nftPrices(tokenId);

      if (ethers.BigNumber.from(actualPrice).eq(buyPrices?.[tokenId] || 0)) {
        setPurchaseErrors({
          [tokenId]: "Price mismatch. Please try again.",
        });
        return;
      }

      const sellerAddress = await contract.ownerOf(tokenId);
      if (sellerAddress.toLowerCase() === userAddress.toLowerCase()) {
        setPurchaseErrors({ [tokenId]: "You cannot buy your own NFT." });
        return;
      }

      const transaction = await contract.buyNFT(tokenId, {
        value: actualPrice,
      });

      setBuySuccessMessage(`NFT bought successfully!`);

      await transaction.wait();

      fetchData();
      setPurchaseErrors({});
    } catch (error) {
      console.error("Error buying NFT:", error.message);
      setPurchaseErrors({ [currentTokenId]: "Error buying NFT" });
    }
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (Object.keys(purchaseErrors).length > 0) {
      const timeout = setTimeout(() => {
        setPurchaseErrors({});
      }, 2500);
      return () => clearTimeout(timeout);
    }
  }, [purchaseErrors, currentTokenId]);

  useEffect(() => {
    if (buySuccessMessage) {
      const timeout = setTimeout(() => {
        setBuySuccessMessage(null);
      }, 2500);
      return () => clearTimeout(timeout);
    }
  }, [buySuccessMessage]);

  if (!connected) {
    return <div>Connect your wallet to see all NFTs for sale</div>;
  }

  return (
    <div>
      <h2>All NFTs for sale</h2>
      {nfts.map((nft) => (
        <div key={nft.id}>
          <img
            src={resolveIpfsUrl(nft.tokenURI.image)}
            alt={`My NFTs ${nft.id}`}
            className="allNFTImage"
          />
          <div>Name: {nft.tokenURI.name}</div>
          <div>Description: {nft.tokenURI.description}</div>
          <div>
            Price (ETH):{" "}
            {nft.price ? ethers.utils.formatEther(nft.price) : "Not available"}
          </div>
          <div>
            <button onClick={() => buyNFT(nft.id)}>Buy NFT</button>
          </div>
          {buySuccessMessage && <div>{buySuccessMessage}</div>}
          {purchaseErrors[nft.id] && (
            <div className="error-message">{purchaseErrors[nft.id]}</div>
          )}
        </div>
      ))}
    </div>
  );
};

export default AllNFTs;
