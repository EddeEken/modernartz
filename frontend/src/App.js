import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Web3 from "web3";
import AllNFTs from "./components/AllNFTs/AllNFTs";
import MyNFTs from "./components/MyNFTs/MyNFTs";
import MintNFTs from "./components/MintNFTs/MintNFTs";
import modernartzLogo from "./assets/modernartz.png";
import "./App.css";

const App = () => {
  const loadWeb3 = async () => {
    if (window.ethereum) {
      // Modern dapp browsers
      window.web3 = new Web3(window.ethereum);
      try {
        // Request account access
        await window.ethereum.request({ method: "eth_requestAccounts" });
      } catch (error) {
        console.error("User denied account access");
      }
    } else if (window.web3) {
      // Legacy dapp browsers
      window.web3 = new Web3(window.web3.currentProvider);
    } else {
      // Non-dapp browsers
      console.error("No web3 detected. You should consider trying MetaMask!");
    }
  };

  useEffect(() => {
    loadWeb3();
  }, []);

  return (
    <Router>
      <div>
        <header>
          <div className="logo-container">
            <Link to="/" className="logo-link">
              <img src={modernartzLogo} alt="ModernArtz Logo" />
            </Link>
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
            <button className="metamask-button" onClick={loadWeb3}>
              Connect MetaMask
            </button>
          </div>
        </header>
        <div className="current-route-display">
          <Routes>
            <Route path="/" element={<AllNFTs />} />
            <Route path="/my-nfts" element={<MyNFTs />} />
            <Route path="/mint-nfts" element={<MintNFTs />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;
