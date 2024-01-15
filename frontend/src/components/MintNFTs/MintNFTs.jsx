import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { NFTStorage, Blob } from "nft.storage";
import { ABI } from "../../assets/NFTMarketplaceABI";
import "./MintNFTs.css";

async function saveToNftStorage(data) {
  const NFT_STORAGE_TOKEN =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweGZlOTZFMkMxMTgyOTJlOUE4ZDFkNjc3QWVGNWM1Y2RmMTc4YjU3M0QiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTcwMzAwMjA4NTg0NywibmFtZSI6IkVkdmluIEVrc3Ryw7ZtIn0.wIXeB8kmwAwwQ6rrcXHW23F-tzFTwsSCM3U53evqPpA";
  const client = new NFTStorage({ token: NFT_STORAGE_TOKEN });
  const ipfs = await client.storeBlob(new Blob([data]));
  return `ipfs://${ipfs}`;
}

const MintNFT = ({ signer, contractAddress, provider, userAddress }) => {
  const [file, setFile] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState(null);
  const [connected, setConnected] = useState(false);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleMint = async () => {
    if (!file || !name || !description) {
      setError("Please fill in all fields");
      return;
    }

    try {
      if (!provider) {
        setError("Provider is undefined. Connect your wallet to mint NFT.");
        return;
      }

      if (!provider.getSigner()) {
        setError("Not connected to a wallet. Connect your wallet to mint NFT.");
        return;
      }

      setConnected(true);

      const imageCID = await saveToNftStorage(file);

      const metadata = {
        name: name,
        description: description,
        image: imageCID,
      };

      const metadataCID = await saveToNftStorage(JSON.stringify(metadata));
      const metadataPath = `ipfs://${metadataCID.replace("ipfs://", "")}`;

      const contract = new ethers.Contract(contractAddress, ABI, signer);
      await contract.mint(metadataPath, userAddress);

      alert("NFT minted successfully!");
    } catch (error) {
      setError(`Error minting NFT: ${error.message}`);
      alert("Error minting NFT. Please try again.");
    }
  };

  useEffect(() => {
    if (provider && provider.getSigner()) {
      setConnected(true);
    }
  }, [provider]);

  return (
    <div>
      {!connected && <div>Connect your wallet to mint NFT</div>}
      {error && <div>Error: {error}</div>}
      {connected && (
        <>
          <h1>Mint NFT</h1>
          <label>
            Choose a file:
            <input type="file" onChange={handleFileChange} />
          </label>
          <label>
            Name:
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>
          <label className="mintDescription">
            Description:
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </label>
          <button
            className="mintButton"
            onClick={() => handleMint(userAddress)}
          >
            Mint NFT
          </button>
        </>
      )}
    </div>
  );
};

export default MintNFT;
