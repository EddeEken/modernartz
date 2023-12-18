import React, { useState, useEffect } from "react";
import Web3 from "web3";
import { NFTCollection, NFTMarketplace } from "contracts/NFTMarketplace.sol";

const App = () => {
  const [account, setAccount] = useState("");
  const [nfts, setNfts] = useState([]);
  const [myNfts, setMyNfts] = useState([]);

  const loadWeb3 = async () => {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      await window.ethereum.enable();
    } else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider);
    } else {
      window.alert(
        "Non-Ethereum browser detected. You should consider trying MetaMask!"
      );
    }
  };

  const loadBlockchainData = async () => {
    const web3 = window.web3;
    const accounts = await web3.eth.getAccounts();
    setAccount(accounts[0]);
    // Load NFTs and myNfts here
  };

  useEffect(() => {
    loadWeb3();
    loadBlockchainData();
  }, []);

  return (
    <div>
      <header>
        <img src="/path/to/modernartz-logo.png" alt="Modernartz Logo" />
        <button onClick={loadWeb3}>Connect Metamask</button>
      </header>
      <main>
        <section>
          <h1>All NFTs on Sale</h1>
          {/* Display all NFTs on sale here */}
        </section>
        <section>
          <h1>My NFTs</h1>
          {/* Display and sell my NFTs here */}
        </section>
        <section>
          <h1>Mint NFT</h1>
          {/* Mint NFT here */}
        </section>
      </main>
    </div>
  );
};

export default App;
