const { expect } = require("chai");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

describe("Turing contract", function () {
  async function deployTokenFixture() {
    const Turing = await ethers.getContractFactory("Turing");
    const [owner, nome1, nome2, nome3, nome4, nome5, outsider, replacement] =
      await ethers.getSigners();
    const token = await Turing.deploy();
    await token.deployed();

    return {
      token,
      owner,
      nome1,
      nome2,
      nome3,
      nome4,
      nome5,
      outsider,
      replacement,
    };
  }

  describe("Deployment", function () {
    it("sets the token name, symbol, and zero-decimal precision", async function () {
      const { token } = await loadFixture(deployTokenFixture);

      expect(await token.name()).to.equal("Turing");
      expect(await token.symbol()).to.equal("TCAS");
      expect(await token.decimals()).to.equal(0);
    });

    it("allows the deployer to issue tokens and rejects non-admin users", async function () {
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

    it("rejects issuing tokens to an unknown codename", async function () {
      const { token } = await loadFixture(deployTokenFixture);

      await expect(token.issueToken("unknown", 10)).to.be.revertedWith(
        "Erro: codinome invalido!"
      );
    });

    it("allows an administrator to replace a student's address", async function () {
      const { token, nome1, nome2, replacement } =
        await loadFixture(deployTokenFixture);

      await token.updateUser("nome1", replacement.address);
      expect(await token.users("nome1")).to.equal(replacement.address);

      await expect(token.connect(nome1).vote("nome2", 1)).to.be.revertedWith(
        "Apenas usuarios pre-autorizado podem executa-la!"
      );
      await expect(token.connect(replacement).vote("nome2", 1))
        .to.emit(token, "Transfer")
        .withArgs(ethers.constants.AddressZero, nome2.address, 1);
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

    it("rejects votes from unregistered users, unknown codenames, and invalid amounts", async function () {
      const { token, nome1, outsider } = await loadFixture(deployTokenFixture);

      await expect(token.connect(outsider).vote("nome2", 1)).to.be.revertedWith(
        "Apenas usuarios pre-autorizado podem executa-la!"
      );
      await expect(token.connect(nome1).vote("unknown", 1)).to.be.revertedWith(
        "Erro: codinome invalido!"
      );
      await expect(token.connect(nome1).vote("nome2", 0)).to.be.revertedWith(
        "qtde_de_Turings deve ser maior que 0, e menor ou igual a 2."
      );
      await expect(token.connect(nome1).vote("nome2", 3)).to.be.revertedWith(
        "qtde_de_Turings deve ser maior que 0, e menor ou igual a 2."
      );
    });

    it("allows a user to vote once for each different student", async function () {
      const { token, nome1, nome2, nome3 } =
        await loadFixture(deployTokenFixture);

      await token.connect(nome1).vote("nome2", 1);
      await token.connect(nome1).vote("nome3", 2);

      expect(await token.balanceOf(nome2.address)).to.equal(1);
      expect(await token.balanceOf(nome3.address)).to.equal(2);
    });

    it("allows only an administrator to change voting status", async function () {
      const { token, nome1, nome2 } = await loadFixture(deployTokenFixture);

      expect(await token.isVotingOpen()).to.equal(true);
      await expect(token.connect(nome1).votingOff()).to.be.revertedWith(
        "Apenas o dono do contrato ou a Roberta podem executar essa acao!"
      );
      await token.votingOff();
      expect(await token.isVotingOpen()).to.equal(false);
      await token.votingOn();
      expect(await token.isVotingOpen()).to.equal(true);
      await expect(token.connect(nome2).vote("nome1", 1))
        .to.emit(token, "Transfer")
        .withArgs(ethers.constants.AddressZero, nome1.address, 1);
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

    it("rejects transfers above the sender's balance", async function () {
      const { token, nome1, nome2 } = await loadFixture(deployTokenFixture);

      await token.issueToken("nome1", 3);
      await expect(
        token.connect(nome1).transfer(nome2.address, 4)
      ).to.be.revertedWithCustomError(token, "ERC20InsufficientBalance");
      expect(await token.balanceOf(nome1.address)).to.equal(3);
      expect(await token.balanceOf(nome2.address)).to.equal(0);
    });
  });
});
