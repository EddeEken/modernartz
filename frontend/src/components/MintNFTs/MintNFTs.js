import React, { useState } from "react";
import { ethers } from "ethers";
import { NFTStorage, Blob } from "nft.storage";
import { ABI } from "../../assets/NFTMarketplaceABI";
import "./MintNFTs.css";
// import dotenv from "dotenv";
// dotenv.config();

async function saveToNftStorage(data) {
  const NFT_STORAGE_TOKEN =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweGZlOTZFMkMxMTgyOTJlOUE4ZDFkNjc3QWVGNWM1Y2RmMTc4YjU3M0QiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTcwNDU1Nzc2MjcwOSwibmFtZSI6Im5mdCJ9.HYBoUs2SLdLdmtUmcr3TA4ng2dwfShkxgyM-kfu_A3E";
  const client = new NFTStorage({ token: NFT_STORAGE_TOKEN });

  console.log("Uploading to IPFS...");
  const ipfs = await client.storeBlob(new Blob([data]));
  console.log("File CID is:", ipfs);
  return `ipfs://${ipfs}`;
}

const MintNFT = ({ signer, contractAddress }) => {
  const [file, setFile] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleMint = async () => {
    if (!file || !name || !description) {
      console.error("Please fill in all fields");
      return;
    }

    try {
      // Upload image to IPFS
      const imageCID = await saveToNftStorage(file);

      // Create metadata object
      const metadata = {
        name: name,
        description: description,
        image: imageCID,
      };
      
      const metadataCID = await saveToNftStorage(JSON.stringify(metadata));
      console.log("Minting NFT with metadataCID:", metadataCID);
      const contract = new ethers.Contract(contractAddress, ABI, signer);
      
      const contract = new ethers.Contract(contractAddress, ABI, signer);
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
};

export default MintNFT;
