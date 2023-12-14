const { ethers } = require("hardhat");

async function main() {
  const accounts = await ethers.getSigners();
  const account = accounts[0];
  const amount = ethers.utils.parseEther("100");

  await account.sendTransaction({
    to: account.address,
    value: amount,
  });

  console.log(
    `Sent ${ethers.utils.formatEther(amount)} Ether to ${account.address}`
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
