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
  const [buySuccessMessage, setBuySuccessMessage] = useState(null);

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

      const price = await contract.nftPrices(tokenId);

      console.log("Provided Price:", ethers.utils.formatEther(buyPrice));
      console.log("Actual Price:", ethers.utils.formatEther(price));

      if (!price || isNaN(price)) {
        setPurchaseError("Error fetching sale price");
        return;
      }

      setBuyPrice(price);

      const sellerAddress = await contract.ownerOf(tokenId);

      if (sellerAddress === userAddress) {
        setPurchaseError("You cannot buy your own NFT.");
        return;
      }

      if (price.eq(ethers.utils.parseEther(buyPrice.toString()))) {
        const transaction = await contract.buyNFT({
          to: sellerAddress,
          value: price,
          gasLimit: 20000,
        });

        await transaction.wait();

        setBuySuccessMessage("NFT bought successfully!");
        setPurchaseError(null);
        fetchData();
        console.log("NFT bought successfully!");
      } else {
        setPurchaseError("The provided price doesn't match the actual price.");
        console.log("Provided Price:", buyPrice.toString());
        console.log("Actual Price:", price.toString());
      }
    } catch (error) {
      console.error("Error buying NFT:", error.message);
      setPurchaseError("Error buying NFT");
    }
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (purchaseError) {
      const timeout = setTimeout(() => {
        setPurchaseError(null);
      }, 4000);
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
