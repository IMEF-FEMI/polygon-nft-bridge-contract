
const hre = require("hardhat");

async function main() {

  const NFTBridge = await hre.ethers.getContractFactory("NFTBridge");
  const nftBridge = await NFTBridge.deploy("https://bafybeibmmqrnnzul2rzkc4bw45nmei7gpnu5hsumhehlbdup5nckc2dv7a.ipfs.nftstorage.link/");

  await nftBridge.deployed();

  console.log(
    `NFTBridge deployed to ${nftBridge.address}`
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
