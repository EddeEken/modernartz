import React, { useState } from "react";
import { ethers } from "ethers";
import { NFTCollection } from "contracts/NFTMarketplace.sol";
import { initIPFS, addFile } from "./ipfs";

function MintNFT() {
  const [file, setFile] = useState(null);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleMint = async () => {
    if (!file) {
      alert("Please upload a file");
      return;
    }

    // Initialize IPFS
    const ipfs = await initIPFS();
    // Add file to IPFS and get the CID
    const cid = await addFile(file);
    // Construct the IPFS URL
    const metadataURI = `ipfs://${cid}`;
    // Get the contract instance
    const contract = new ethers.Contract(address, NFTCollection.abi, signer);
    // Mint the NFT with the IPFS URL as the tokenURI
    await contract.mint(to, tokenId, metadataURI);
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleMint}>Mint NFT</button>
    </div>
  );
}

export default MintNFT;
