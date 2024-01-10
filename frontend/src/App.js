/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Web3 from "web3";
import { ethers } from "ethers";
import AllNFTs from "./components/AllNFTs/AllNFTs.js";
import MyNFTs from "./components/MyNFTs/MyNFTs.js";
import MintNFTs from "./components/MintNFTs/MintNFTs.js";
import modernartzLogo from "./assets/modernartz.png";
import "./App.css";

const App = () => {
  const [signer, setSigner] = useState(null);
  const [userAddress, setUserAddress] = useState(null);
  const [contractAddress, setContractAddress] = useState(
    "0xD088299Efc909878137fc69CD65D88B8DdB164c9"
  );

  const loadWeb3 = async () => {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      try {
        await window.ethereum.request({ method: "eth_requestAccounts" });
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const address = await signer.getAddress();
        setSigner(signer);
        setUserAddress(address);
      } catch (error) {
        console.error("User denied account access");
      }
    } else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider);
    } else {
      console.error("No web3 detected. You should consider trying MetaMask!");
    }
  };

  return (
    <Router>
      <div>
        <header>
          <div className="logo-container">
            <img src={modernartzLogo} alt="ModernArtz Logo" />
          </div>
          <nav>
            <ul>
              <li className="nav-button">
                <Link to="/" className="nav-link">
                  All NFTs on Sale
                </Link>
              </li>
              <li className="nav-button">
                <Link to="/my-nfts" className="nav-link">
                  My NFTs
                </Link>
              </li>
              <li className="nav-button">
                <Link to="/mint-nfts" className="nav-link">
                  Mint NFT
                </Link>
              </li>
            </ul>
          </nav>
          <div className="metamask-button-container">
            <button className="metamask-button" onClick={() => loadWeb3()}>
              Connect MetaMask
            </button>
          </div>
        </header>
        <div className="current-route-display">
          <Routes>
            <Route
              path="/"
              element={
                <AllNFTs
                  userAddress={userAddress}
                  contractAddress={contractAddress}
                />
              }
            />
            <Route
              path="/my-nfts"
              element={
                <MyNFTs
                  signer={signer}
                  userAddress={userAddress}
                  contractAddress={contractAddress}
                />
              }
            />
            <Route
              path="/mint-nfts"
              element={
                <MintNFTs
                  signer={signer}
                  userAddress={userAddress}
                  contractAddress={contractAddress}
                />
              }
            />
          </Routes>
        </div>
      </div>
    </Router>
  );
};
export default App;
