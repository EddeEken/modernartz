import React, { useState } from "react";
import { ethers } from "ethers";
import { initIPFS, addFile } from "../../assets/ipfs.js";
import NFTMarketplaceABI from "../../assets/NFTMarketplaceABI.json";
import "./MintNFTs.css";

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
      // Initialize IPFS
      const ipfs = await initIPFS();

      // Add image file to IPFS and get the CID
      const imageCID = await addFile(file);
      const imageUrl = `ipfs://${imageCID}`;

      // Construct the metadata
      const metadata = {
        name: name,
        description: description,
        image: imageUrl,
        attributes: [], // Add attributes as needed
      };

      // Add metadata to IPFS and get the CID
      const metadataCID = await addFile(JSON.stringify(metadata));
      const metadataURI = `ipfs://${metadataCID}`;

      // Get the contract instance
      const contract = new ethers.Contract(address, NFTMarketplaceABI, signer);

      // Mint the NFT with the IPFS URL as the tokenURI
      await contract.mint(metadataURI);

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
