import React, { useEffect, useState } from "react";
import "./AllNFTs.css";

const AllNFTs = () => {
  // State to store all NFTs on sale
  const [allNFTs, setAllNFTs] = useState([]);

  // Fetch all NFTs on sale from your contract or API
  useEffect(() => {
    // Implement logic to fetch NFTs on sale
    // For example, call a function in your smart contract or API
    // Update the state with the fetched NFTs
  }, []);

  return (
    <div>
      <h1>All NFTs on Sale</h1>
      {/* Display the list of NFTs on sale */}
      <ul>
        {allNFTs.map((nft) => (
          <li key={nft.id}>
            {/* Display NFT information */}
            <p>{nft.name}</p>
            <p>{nft.description}</p>
            {/* Add more fields as needed */}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AllNFTs;
