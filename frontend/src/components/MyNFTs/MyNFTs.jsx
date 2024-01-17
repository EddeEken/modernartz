/* eslint-disable */
import React, { useEffect, useState, useCallback } from "react";
import { ethers } from "ethers";
import { ABI } from "../../assets/NFTMarketplaceABI";
import "./MyNFTs.css";

const MyNFTs = ({
  contractAddress,
  signer,
  provider,
  userAddress,
  setAllNFTs,
}) => {
  const [myNFTs, setMyNFTs] = useState([]);
  const [errors, setErrors] = useState({});
  const [connected, setConnected] = useState(false);
  const [sellPrices, setSellPrices] = useState({});
  const [selectedNFTForSale, setSelectedNFTForSale] = useState(null);
  const [successMessages, setSuccessMessages] = useState({});

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
      if (!provider) {
        setErrors({ general: "Provider is undefined" });
        return;
      }

      if (!provider.getSigner()) {
        setErrors({ general: "Not connected to a wallet" });
        return;
      }

      setConnected(true);

      const contract = new ethers.Contract(contractAddress, ABI, signer);

      const totalSupply = await contract.getNextTokenId();
      const nfts = [...myNFTs];
      const allNfts = [];

      for (let i = 0; i < totalSupply; i++) {
        try {
          const metadataString = await contract.tokenURI(i);
          const metadataUrl = resolveIpfsUrl(metadataString);

          const response = await fetch(metadataUrl);
          const metadata = await response.json();

          const isForSale = await contract.isNFTForSale(i);
          const price = isForSale ? await contract.nftPrices(i) : undefined;

          const owner = await contract.ownerOf(i);

          nfts.push({
            id: i,
            tokenURI: {
              name: metadata.name || "Unknown Name",
              description: metadata.description || "Unknown Description",
              image: metadata.image || "default-image-url",
            },
            isForSale,
            price,
            owner,
          });

          allNfts.push({
            id: i,
            tokenURI: {
              name: metadata.name || "Unknown Name",
              description: metadata.description || "Unknown Description",
              image: metadata.image || "default-image-url",
              price,
            },
            isForSale,
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
      setAllNFTs(allNfts);
      setErrors({});
    } catch (error) {
      console.error("Error fetching data:", error.message);
      setErrors({ general: error.message });
    }
  }, [contractAddress, signer, provider, userAddress, setAllNFTs]);

  const listNFTForSale = async (tokenId) => {
    try {
      if (
        !sellPrices[tokenId] ||
        isNaN(sellPrices[tokenId]) ||
        sellPrices[tokenId] <= 0
      ) {
        setErrors({
          [tokenId]: "Please enter a valid price greater than 0 for the NFT.",
        });
        return;
      }

      const contract = new ethers.Contract(contractAddress, ABI, signer);
      await contract.listNFT(
        tokenId,
        ethers.utils.parseEther(sellPrices[tokenId].toString())
      );

      setSelectedNFTForSale(null);
      fetchData();
      setSuccessMessages({ [tokenId]: "NFT listed for sale successfully!" });
    } catch (error) {
      console.error("Error listing NFT for sale:", error.message);
      setErrors({ [tokenId]: error.message });
    }
  };

  const cancelSale = async (tokenId) => {
    try {
      const contract = new ethers.Contract(contractAddress, ABI, signer);
      await contract.cancelSale(tokenId);
      fetchData();
      setSuccessMessages({ [tokenId]: "NFT sale canceled successfully!" });
    } catch (error) {
      console.error("Error canceling NFT sale:", error.message);
      setErrors({ [tokenId]: error.message });
    }
  };

  const handleInputChange = (e, tokenId) => {
    const inputValue = e.target.value;

    setSellPrices((prevSellPrices) => ({
      ...prevSellPrices,
      [tokenId]: inputValue,
    }));
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (Object.keys(successMessages).length > 0) {
      const timeout = setTimeout(() => {
        setSuccessMessages({});
      }, 4000);
      return () => clearTimeout(timeout);
    }
  }, [successMessages]);

  if (!connected) {
    return <div>Connect your wallet to see your NFTs</div>;
  }

  return (
    <div>
      <h2>My NFTs</h2>
      {myNFTs
        .filter((nft) => nft.owner.toLowerCase() === userAddress.toLowerCase())
        .map((nft) => (
          <div key={nft.id}>
            <img
              src={resolveIpfsUrl(nft.tokenURI.image)}
              alt={`My NFTs ${nft.id}`}
              className="myNFTImage"
            />
            <div>Name: {nft.tokenURI.name}</div>
            <div>Description: {nft.tokenURI.description}</div>
            {nft.isForSale ? (
              <div>
                <div>
                  Price (ETH):{" "}
                  {nft.price
                    ? ethers.utils.formatEther(nft.price)
                    : "Not available"}
                </div>
                <button onClick={() => cancelSale(nft.id)}>Cancel Sale</button>
                {errors[nft.id] && (
                  <div className="error">{errors[nft.id]}</div>
                )}
              </div>
            ) : (
              <div>
                <input
                  type="number"
                  placeholder="Enter price in ETH"
                  value={sellPrices[nft.id] || ""}
                  onChange={(e) => handleInputChange(e, nft.id)}
                />
                <button onClick={() => listNFTForSale(nft.id)}>Sell NFT</button>
                {errors[nft.id] && (
                  <div className="error">{errors[nft.id]}</div>
                )}
              </div>
            )}
            {successMessages[nft.id] && (
              <div className="success-message">{successMessages[nft.id]}</div>
            )}
          </div>
        ))}
    </div>
  );
};

export default MyNFTs;
