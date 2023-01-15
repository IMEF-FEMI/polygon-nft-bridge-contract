import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import BN from "bn.js"

describe("NFTBridge", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deploymentFixture() {
    // Contracts are deployed using the first signer/account by default
    const accounts = await ethers.getSigners();

    const Bridge = await ethers.getContractFactory("NFTBridge");
    const bridge = await Bridge.deploy("https://bafybeibmmqrnnzul2rzkc4bw45nmei7gpnu5hsumhehlbdup5nckc2dv7a.ipfs.nftstorage.link/");

    return { accounts, bridge };
  }

  describe("Deployment", function () {
    it("Should get proper metadata", async function () {
      const { bridge } = await loadFixture(deploymentFixture);


      expect(await bridge.lastMintedId()).to.equal(new BN(0))
      expect(await bridge.uri(5)).to.equal("https://bafybeibmmqrnnzul2rzkc4bw45nmei7gpnu5hsumhehlbdup5nckc2dv7a.ipfs.nftstorage.link/5.json");
    });
  });


  describe("Bridge", function () {

    it("Should mint nft", async function () {
      const { bridge, accounts } = await loadFixture(deploymentFixture);
      const lastMintedId = await bridge.lastMintedId();
      await bridge.connect(accounts[0]).mint(lastMintedId.toNumber() + 1);
      const tokensOwned = await bridge.connect(accounts[0]).getTokensOwned()

      // new BN(3).add(new BN(1))
      expect(tokensOwned.length).to.equal(1)
      expect(await bridge.lastMintedId()).to.equal(new BN(1))

      // console.log(await bridge.connect(accounts[0]).balanceOf(accounts[0]));
    });

    const idOfTokenSelectedToLock = 1;
    let tokenIndex: number;

    it("Should lock the nft ", async function () {

      const { bridge, accounts } = await loadFixture(deploymentFixture);
      //mint
      await bridge.connect(accounts[1]).mint(1);
      let tokensOwned = await bridge.connect(accounts[1]).getTokensOwned()


      //get index of token being locked

      for (let i = 0; i < tokensOwned.length; i++) {
        const _tokenId = tokensOwned[i].toNumber();
        if (_tokenId === idOfTokenSelectedToLock) {
          tokenIndex = i;
          break
        }
      }


      if (tokenIndex !== undefined) {
        //approve admin
        await bridge.connect(accounts[1]).setApprovalForAll(accounts[0].address, true)
        //lock
        await bridge.connect(accounts[0]).lockNft(idOfTokenSelectedToLock, tokenIndex, accounts[1].address)
      }
      tokensOwned = await bridge.connect(accounts[1]).getTokensOwned();
      expect(tokensOwned.length).to.equal(0)

      expect(await await bridge.isTokenLocked(idOfTokenSelectedToLock)).to.equal(true)
    });

    it("Should unlock nft", async function () {
      const { bridge, accounts } = await loadFixture(deploymentFixture);
      //mint
      await bridge.connect(accounts[1]).mint(1);

      //approve admin
      await bridge.connect(accounts[1]).setApprovalForAll(accounts[0].address, true)
      //lock
      await bridge.connect(accounts[0]).lockNft(idOfTokenSelectedToLock, tokenIndex, accounts[1].address)


      //unlock
      await bridge.connect(accounts[0]).unLockNft(idOfTokenSelectedToLock, accounts[1].address)
      const tokensOwned = await bridge.connect(accounts[1]).getTokensOwned();
      expect(tokensOwned.length).to.equal(1)
      expect(await await bridge.isTokenLocked(1)).to.equal(false)
    });

    it('should unlock nft not previously locked', async () => {
      const { bridge, accounts } = await loadFixture(deploymentFixture);

      //lock
      await bridge.connect(accounts[0]).unLockNft(1, accounts[3].address)
      const tokensOwned = await bridge.connect(accounts[3]).getTokensOwned();
      console.log(tokensOwned);

      // expect(await  bridge.isTokenLocked(1)).to.equal(true)

    })
  });
});
