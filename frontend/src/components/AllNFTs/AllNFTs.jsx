/* eslint-disable */
import React, { useEffect, useState, useCallback } from "react";
import { ethers } from "ethers";
import { ABI } from "../../assets/NFTMarketplaceABI";
import "./AllNFTs.css";

const AllNFTs = ({ contractAddress, signer, provider, userAddress }) => {
  const [nfts, setNFTs] = useState([]);
  const [error, setError] = useState(null);
  const [connected, setConnected] = useState(false);
  const [buyPrice, setBuyPrice] = useState(0);
  const [purchaseError, setPurchaseError] = useState(null);
  const [isFetchingPrice, setIsFetchingPrice] = useState(false);
  const [buySuccessMessage, setBuySuccessMessage] = useState(null);

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
    console.log(
      "buyPrice state has changed:",
      ethers.utils.formatEther(buyPrice)
    );
  }, [buyPrice]);

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
    } catch (error) {
      setError(error.message);
    }
  }, [contractAddress, signer, provider, userAddress]);

  const buyNFT = async (tokenId) => {
    try {
      const contract = new ethers.Contract(contractAddress, ABI, signer);

      const actualPrice = await contract.nftPrices(tokenId);

      setBuyPrice(actualPrice);

      console.log("Provided Price:", ethers.utils.formatEther(buyPrice));
      console.log("Actual Price:", ethers.utils.formatEther(actualPrice));

      if (!ethers.BigNumber.from(buyPrice).eq(actualPrice)) {
        setIsFetchingPrice(true);
        console.log("Provided Price:", ethers.utils.formatEther(buyPrice));
        console.log("Actual Price:", ethers.utils.formatEther(actualPrice));
        return;
      }

      const sellerAddress = await contract.ownerOf(tokenId);
      if (sellerAddress.toLowerCase() === userAddress.toLowerCase()) {
        setIsFetchingPrice(false);
        setPurchaseError("You cannot buy your own NFT.");
        return;
      }

      const transaction = await contract.buyNFT(tokenId, {
        value: actualPrice,
      });

      await transaction.wait();

      fetchData();
      setBuySuccessMessage("NFT bought successfully!");
      setPurchaseError(null);
      setIsFetchingPrice(false);
      console.log("NFT bought successfully!");
    } catch (error) {
      console.error("Error buying NFT:", error.message);
      setPurchaseError("Error buying NFT");
      setIsFetchingPrice(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (purchaseError) {
      const timeout = setTimeout(() => {
        setPurchaseError(null);
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [purchaseError]);

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
            {isFetchingPrice && <p>Fetching price...</p>}
          </div>
          {buySuccessMessage && <div>{buySuccessMessage}</div>}
          {purchaseError && (
            <div className="error-message">{purchaseError}</div>
          )}
        </div>
      ))}
    </div>
  );
};

export default AllNFTs;
