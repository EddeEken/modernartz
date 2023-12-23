const { NFTStorage, Blob } = require("nft.storage");

// Initialize nft.storage client
const initIPFS = () => {
  // Use your nft.storage API key here
  const NFT_STORAGE_TOKEN = "your-nft.storage-api-key";
  return new NFTStorage({ token: NFT_STORAGE_TOKEN });
};

// Function to add a file to nft.storage
const addFile = async (file) => {
  const client = initIPFS();

  // Read the file content
  const content = await file.arrayBuffer();

  // Create a Blob from the file content
  const blob = new Blob([content]);

  // Store the file on nft.storage
  const result = await client.storeBlob(blob);

  // Return the CID (Content ID) of the stored file
  return result.cid;
};

module.exports = { initIPFS, addFile };
