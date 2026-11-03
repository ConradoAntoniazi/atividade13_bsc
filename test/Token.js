const { expect } = require("chai");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

describe("Turing contract", function () {
  async function deployTokenFixture() {
    const Turing = await ethers.getContractFactory("Turing");
    const [owner, nome1, nome2] = await ethers.getSigners();
    const token = await Turing.deploy();
    await token.deployed();

    return { token, owner, nome1, nome2 };
  }

  describe("Deployment", function () {
    it("sets the token name, symbol, and zero-decimal precision", async function () {
      const { token } = await loadFixture(deployTokenFixture);

      expect(await token.name()).to.equal("Turing");
      expect(await token.symbol()).to.equal("TCAS");
      expect(await token.decimals()).to.equal(0);
    });

    it("allows only the deployer to issue tokens", async function () {
      const { token, owner, nome1, nome2 } = await loadFixture(deployTokenFixture);

      await expect(token.issueToken("nome1", 10))
        .to.emit(token, "Transfer")
        .withArgs(ethers.constants.AddressZero, nome1.address, 10);
      expect(await token.balanceOf(nome1.address)).to.equal(10);

      await expect(token.connect(nome2).issueToken("nome1", 1)).to.be.revertedWith(
        "Apenas o dono do contrato ou a Roberta podem executar essa acao!"
      );
      expect(await token.balanceOf(owner.address)).to.equal(0);
    });
  });

  describe("Voting", function () {
    it("issues tokens for a valid vote and prevents voting twice for the same user", async function () {
      const { token, nome1, nome2 } = await loadFixture(deployTokenFixture);

      await expect(token.connect(nome1).vote("nome2", 2))
        .to.emit(token, "Transfer")
        .withArgs(ethers.constants.AddressZero, nome2.address, 2);
      expect(await token.balanceOf(nome2.address)).to.equal(2);
      await expect(token.connect(nome1).vote("nome2", 1)).to.be.revertedWith(
        "Um mesmo usuario so pode votar uma vez em um mesmo codinome."
      );
      expect(await token.balanceOf(nome2.address)).to.equal(2);
    });

    it("rejects self-voting and votes while voting is disabled", async function () {
      const { token, nome1 } = await loadFixture(deployTokenFixture);

      await expect(token.connect(nome1).vote("nome1", 1)).to.be.revertedWith(
        "Um usuario NAO pode votar em si mesmo."
      );
      await token.votingOff();
      await expect(token.connect(nome1).vote("nome2", 1)).to.be.revertedWith(
        "A votacao deve estar ativa!"
      );
    });
  });

  describe("Transfers", function () {
    it("transfers issued tokens between users", async function () {
      const { token, owner, nome1, nome2 } = await loadFixture(deployTokenFixture);

      await token.issueToken("nome1", 10);
      await expect(token.connect(nome1).transfer(nome2.address, 4))
        .to.changeTokenBalances(token, [nome1, nome2], [-4, 4]);
      expect(await token.totalSupply()).to.equal(10);
      expect(await token.balanceOf(owner.address)).to.equal(0);
    });
  });
});
