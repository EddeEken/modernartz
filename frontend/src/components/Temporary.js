import React from "react";
import "./Temporary.css";
// import { useEffect, useState } from "react";
// import { ethers } from "ethers";
// import NFTMarketplace from "./NFTMarketplace.sol";
// import NFTCollection from "./artifacts/contracts/NFTCollection.sol/NFTCollection.json";

const Marketplace = () => {
  //   const [marketplace, setMarketplace] = useState(null);
  //   const [collection, setCollection] = useState(null);
  //   const [account, setAccount] = useState("");
  //   useEffect(() => {
  //     loadBlockchainData();
  //   }, []);
  //   async function loadBlockchainData() {
  //     const web3 = window.ethereum;
  //     const accounts = await web3.request({ method: "eth_accounts" });
  //     setAccount(accounts[0]);
  //     const networkId = await web3.request({ method: "net_version" });
  //     const marketplaceNetworkData = NFTMarketplace.networks[networkId];
  //     const collectionNetworkData = NFTCollection.networks[networkId];
  //     if (marketplaceNetworkData && collectionNetworkData) {
  //       const marketplace = new ethers.Contract(
  //         marketplaceNetworkData.address,
  //         NFTMarketplace.abi,
  //         web3.currentProvider
  //       );
  //       const collection = new ethers.Contract(
  //         collectionNetworkData.address,
  //         NFTCollection.abi,
  //         web3.currentProvider
  //       );
  //       setMarketplace(marketplace);
  //       setCollection(collection);
  //     }
  //   }
  return (
    <div>
      <button className="button">Here</button>
    </div>
  );
};
export default Marketplace;
