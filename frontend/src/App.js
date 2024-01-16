/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { ethers } from "ethers";
import AllNFTs from "./components/AllNFTs/AllNFTs.jsx";
import MyNFTs from "./components/MyNFTs/MyNFTs.jsx";
import MintNFTs from "./components/MintNFTs/MintNFTs.jsx";
import modernartzLogo from "./assets/modernartz.png";
import "./App.css";

const App = () => {
  const [signer, setSigner] = useState(null);
  const [userAddress, setUserAddress] = useState(null);
  const [contractAddress, setContractAddress] = useState(
    "0x879D7912002345C3AA15ad488717554341aF01Cc"
  );
  const [provider, setProvider] = useState(null);
  const [allNFTs, setAllNFTs] = useState([]);

  const loadWeb3 = async () => {
    try {
      if (window.ethereum) {
        await window.ethereum.request({ method: "eth_requestAccounts" });

        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const address = await signer.getAddress();

        setSigner(signer);
        setUserAddress(address);
        setProvider(provider);
      } else {
        console.error("MetaMask not detected. Please install MetaMask.");
      }
    } catch (error) {
      console.error("Error loading Web3:", error.message);
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
                  signer={signer}
                  userAddress={userAddress}
                  contractAddress={contractAddress}
                  provider={provider}
                  allNFTs={allNFTs}
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
                  provider={provider}
                  setAllNFTs={setAllNFTs}
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
                  provider={provider}
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
