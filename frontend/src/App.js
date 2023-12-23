import React from "react";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import AllNFTs from "./components/AllNFTs/AllNFTs";
import MyNFTs from "./components/MyNFTs/MyNFTs";
import MintNFTs from "./components/MintNFTs/MintNFTs";
import "./App.css";

const App = () => {
  const loadWeb3 = () => {
    // Implement your web3 connection logic
  };

  return (
    <Router>
      <div>
        <header>
          <img src="assets/modernartz.png" alt="ModernArtz Logo" />
          <button onClick={loadWeb3}>Connect Metamask</button>
          <main>
            <nav>
              <ul>
                <li>
                  <Link to="/" className="nav-button">
                    All NFTs on Sale
                  </Link>
                </li>
                <li>
                  <Link to="/my-nfts" className="nav-button">
                    My NFTs
                  </Link>
                </li>
                <li>
                  <Link to="/mint-nft" className="nav-button">
                    Mint NFT
                  </Link>
                </li>
              </ul>
            </nav>

            <Route path="/" exact component={AllNFTs} />
            <Route path="/my-nfts" component={MyNFTs} />
            <Route path="/mint-nfts" component={MintNFTs} />
          </main>
        </header>
      </div>
    </Router>
  );
};

export default App;
