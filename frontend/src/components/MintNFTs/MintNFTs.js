import React, { useState } from "react";
import { ethers } from "ethers";
import { client } from "nft.storage";
import NFTMarketplaceABI from "../../assets/NFTMarketplaceABI.json";
import "./MintNFTs.css";

const nftStorageClient = client({
  token:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweGZlOTZFMkMxMTgyOTJlOUE4ZDFkNjc3QWVGNWM1Y2RmMTc4YjU3M0QiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTcwMzAwMjA4NTg0NywibmFtZSI6IkVkdmluIEVrc3Ryw7ZtIn0.wIXeB8kmwAwwQ6rrcXHW23F-tzFTwsSCM3U53evqPpA",
});

async function saveToNftStorage(metadata) {
  try {
    const cid = await nftStorageClient.store([
      new File([JSON.stringify(metadata)], "metadata.json"),
    ]);
    return `ipfs://${cid}`;
  } catch (error) {
    console.error("Error uploading to nft.storage:", error.message);
    throw error;
  }
}

function MintNFT({ signer, address }) {
  const [file, setFile] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleMint = async () => {
    if (!file || !name || !description) {
      alert("Please fill in all fields");
      return;
    }

    try {
      const imageCID = await saveToNftStorage(file);

      const metadata = {
        name: name,
        description: description,
        image: imageCID,
      };

      const metadataCID = await saveToNftStorage(metadata);
      const contract = new ethers.Contract(address, NFTMarketplaceABI, signer);

      await contract.mint(`ipfs://${metadataCID}`);

      alert("NFT minted successfully!");
    } catch (error) {
      console.error("Error minting NFT:", error.message);
      alert("Error minting NFT. Please try again.");
    }
  };

  return (
    <div>
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
      <label>
        Description:
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </label>
      <button onClick={handleMint}>Mint NFT</button>
    </div>
  );
}

export default MintNFT;
