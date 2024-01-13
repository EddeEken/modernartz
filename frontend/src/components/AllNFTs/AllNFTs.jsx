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

      const nfts = [];

      let i = 0;
      while (true) {
        try {
          const metadataString = await contract.tokenURI(i);
          const metadataUrl = resolveIpfsUrl(metadataString);

          const response = await fetch(metadataUrl);
          const metadata = await response.json();

          const isForSale = await contract.isNFTForSale(i);

          if (isForSale) {
            const price = await contract.nftPrices(i);

            nfts.push({
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

          i++;
        } catch (error) {
          break;
        }
      }

      console.log("Retrieved NFTs for sale:", nfts);
      console.log("Setting All NFTs...");
      setNFTs(nfts);
    } catch (error) {
      setError(error.message);
    }
  }, [contractAddress, signer, provider, userAddress]);

  const buyNFT = async (tokenId, price) => {
    try {
      if (!buyPrice || isNaN(buyPrice)) {
        setError("Please enter a valid price for the NFT.");
        return;
      }

      const contract = new ethers.Contract(contractAddress, ABI, signer);

      if (price.eq(ethers.utils.parseEther(buyPrice.toString()))) {
        const sellerAddress = await contract.ownerOf(tokenId);

        const sellerContract = new ethers.Contract(
          contractAddress,
          ABI,
          signer
        );

        const transaction = await signer.sendTransaction({
          to: sellerAddress,
          value: ethers.utils.parseEther(buyPrice.toString()),
          gasLimit: 21000,
        });

        await transaction.wait();

        await sellerContract.transferFrom(userAddress, sellerAddress, tokenId);

        fetchData();
      } else {
        setError("The provided price doesn't match the actual price.");
      }
    } catch (error) {
      console.error("Error buying NFT:", error.message);
      setError(error.message);
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
      {nfts.map((nft) => (
        <div key={nft.id}>
          <img
            src={resolveIpfsUrl(nft.tokenURI.image)}
            alt={`My NFTs ${nft.id}`}
            loading="lazy"
          />
          <div>Name: {nft.tokenURI.name}</div>
          <div>Description: {nft.tokenURI.description}</div>
          <div>
            <button onClick={() => buyNFT(nft.id, nft.price)}>Buy NFT</button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AllNFTs;
