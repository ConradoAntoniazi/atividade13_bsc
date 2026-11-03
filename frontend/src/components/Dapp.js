import React from "react";
import { ethers } from "ethers";

import TokenArtifact from "../contracts/Token.json";
import contractAddress from "../contracts/contract-address.json";
import { ConnectWallet } from "./ConnectWallet";
import { Loading } from "./Loading";
import { NoTokensMessage } from "./NoTokensMessage";
import { NoWalletDetected } from "./NoWalletDetected";
import { Ranking } from "./Ranking";
import { StudentActionForm } from "./StudentActionForm";
import { TransactionErrorMessage } from "./TransactionErrorMessage";
import { Transfer } from "./Transfer";
import { WaitingForTransactionMessage } from "./WaitingForTransactionMessage";

const HARDHAT_NETWORK_ID = "31337";
const STUDENT_CODINAMES = ["nome1", "nome2", "nome3", "nome4", "nome5"];
const ALL_CODINAMES = ["roberta", ...STUDENT_CODINAMES];
const ADMIN_ERROR =
  "Apenas o dono do contrato ou a Roberta podem executar essa acao!";
const ERROR_CODE_TX_REJECTED_BY_USER = 4001;

export class Dapp extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedAddress: undefined,
      tokenData: undefined,
      balance: undefined,
      registeredCodename: undefined,
      isSuperuser: false,
      ranking: [],
      txBeingSent: undefined,
      transactionError: undefined,
      networkError: undefined,
    };
    this.initializationId = 0;
    this.handleAccountsChanged = this.handleAccountsChanged.bind(this);
    this.handleChainChanged = this.handleChainChanged.bind(this);
  }

  componentDidMount() {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", this.handleAccountsChanged);
      window.ethereum.on("chainChanged", this.handleChainChanged);
    }
  }

  componentWillUnmount() {
    this._stopPollingData();
    if (window.ethereum?.removeListener) {
      window.ethereum.removeListener(
        "accountsChanged",
        this.handleAccountsChanged
      );
      window.ethereum.removeListener("chainChanged", this.handleChainChanged);
    }
  }

  render() {
    if (!window.ethereum) {
      return <NoWalletDetected />;
    }

    if (!this.state.selectedAddress) {
      return (
        <ConnectWallet
          connectWallet={this._connectWallet}
          networkError={this.state.networkError}
          dismiss={this._dismissNetworkError}
        />
      );
    }

    if (!this.state.tokenData || !this.state.balance) {
      return this.state.networkError ? (
        <main className="container p-4">
          <div className="alert alert-danger" role="alert">
            {this.state.networkError}
          </div>
          <button
            className="btn btn-primary"
            type="button"
            onClick={() => this._initialize(this.state.selectedAddress)}
          >
            Tentar novamente
          </button>
        </main>
      ) : (
        <Loading />
      );
    }

    const voteCodinames = STUDENT_CODINAMES.filter(
      (codinome) => codinome !== this.state.registeredCodename
    );

    return (
      <main className="container p-4">
        <header>
          <h1>
            {this.state.tokenData.name} ({this.state.tokenData.symbol})
          </h1>
          <p>
            Carteira: <b>{this.state.selectedAddress}</b>
          </p>
          <p>
            Perfil:{" "}
            <b>
              {this.state.isSuperuser
                ? "Superusuário"
                : this.state.registeredCodename
                  ? `Usuário registrado (${this.state.registeredCodename})`
                  : "Carteira não cadastrada"}
            </b>
          </p>
          <p>
            Seu saldo:{" "}
            <b>
              {this.state.balance.toString()} {this.state.tokenData.symbol}
            </b>
          </p>
        </header>

        {this.state.networkError && (
          <div className="alert alert-warning" role="alert">
            {this.state.networkError}
            <button
              type="button"
              className="close"
              aria-label="Fechar"
              onClick={this._dismissNetworkError}
            >
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
        )}

        {this.state.txBeingSent && (
          <WaitingForTransactionMessage txHash={this.state.txBeingSent} />
        )}
        {this.state.transactionError && (
          <TransactionErrorMessage
            message={this._getRpcErrorMessage(this.state.transactionError)}
            dismiss={this._dismissTransactionError}
          />
        )}

        {this.state.registeredCodename && voteCodinames.length > 0 && (
          <section className="card card-body mb-4">
            <h2>Votar</h2>
            <p>
              Escolha um aluno e atribua de 1 a 2 Turings. Não é permitido votar
              em si mesmo nem votar duas vezes no mesmo aluno.
            </p>
            <StudentActionForm
              actionLabel="vote"
              codinomes={voteCodinames}
              maxAmount="2"
              onSubmit={this._vote}
              submitLabel="Enviar voto"
              tokenSymbol={this.state.tokenData.symbol}
            />
          </section>
        )}

        {this.state.isSuperuser && (
          <section className="card card-body mb-4">
            <h2>Emitir Turings</h2>
            <p>
              Esta ação administrativa emite tokens diretamente para o aluno
              selecionado.
            </p>
            <StudentActionForm
              actionLabel="issue"
              codinomes={STUDENT_CODINAMES}
              onSubmit={this._issueTokens}
              submitLabel="Emitir tokens"
              tokenSymbol={this.state.tokenData.symbol}
            />
          </section>
        )}

        <Ranking
          entries={this.state.ranking}
          tokenSymbol={this.state.tokenData.symbol}
        />

        <hr />
        <section>
          <h2>Transferir tokens</h2>
          {this.state.balance.isZero() ? (
            <NoTokensMessage selectedAddress={this.state.selectedAddress} />
          ) : (
            <Transfer
              transferTokens={this._transferTokens}
              tokenSymbol={this.state.tokenData.symbol}
            />
          )}
        </section>
      </main>
    );
  }

  _connectWallet = async () => {
    try {
      const [selectedAddress] = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      if (!selectedAddress) {
        throw new Error("Nenhuma conta foi disponibilizada pela carteira.");
      }

      const chainId = await window.ethereum.request({ method: "eth_chainId" });
      if (parseInt(chainId, 16).toString() !== HARDHAT_NETWORK_ID) {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0x7a69" }],
        });
      }

      await this._initialize(selectedAddress);
    } catch (error) {
      if (error.code === ERROR_CODE_TX_REJECTED_BY_USER) return;
      console.error(error);
      this.setState({
        networkError:
          error.code === 4902
            ? "Adicione a rede local Hardhat (Chain ID 31337) à sua carteira."
            : this._getRpcErrorMessage(error),
      });
    }
  };

  handleAccountsChanged(accounts) {
    if (!accounts.length) {
      this._resetState();
      return;
    }
    this._initialize(accounts[0]);
  }

  handleChainChanged(chainId) {
    if (parseInt(chainId, 16).toString() !== HARDHAT_NETWORK_ID) {
      this.initializationId += 1;
      this._stopPollingData();
      this.setState({
        selectedAddress: undefined,
        tokenData: undefined,
        balance: undefined,
        registeredCodename: undefined,
        isSuperuser: false,
        ranking: [],
        networkError: "Conecte a carteira à rede local Hardhat (Chain ID 31337).",
      });
      return;
    }

    if (this.state.selectedAddress) {
      this._initialize(this.state.selectedAddress);
    }
  }

  async _initialize(userAddress) {
    const initializationId = ++this.initializationId;
    this._stopPollingData();
    this._provider = new ethers.providers.Web3Provider(window.ethereum);
    this._token = new ethers.Contract(
      contractAddress.Token,
      TokenArtifact.abi,
      this._provider.getSigner()
    );
    this.setState({
      selectedAddress: userAddress,
      tokenData: undefined,
      balance: undefined,
      registeredCodename: undefined,
      isSuperuser: false,
      ranking: [],
      networkError: undefined,
    });

    try {
      const [name, symbol, registeredUsers, isSuperuser] = await Promise.all([
        this._token.name(),
        this._token.symbol(),
        Promise.all(
          ALL_CODINAMES.map(async (codinome) => ({
            codinome,
            address: await this._token.users(codinome),
          }))
        ),
        this._hasSuperuserAccess(),
      ]);

      if (initializationId !== this.initializationId) return;

      const normalizedAddress = userAddress.toLowerCase();
      const registeredCodename = registeredUsers.find(
        ({ address }) => address.toLowerCase() === normalizedAddress
      )?.codinome;
      this.setState({
        tokenData: { name, symbol },
        registeredCodename,
        isSuperuser,
      });

      await this._updateBalances(userAddress, initializationId);
      if (initializationId === this.initializationId) {
        this._startPollingData();
      }
    } catch (error) {
      if (initializationId !== this.initializationId) return;
      console.error(error);
      this.setState({ networkError: this._getRpcErrorMessage(error) });
    }
  }

  async _hasSuperuserAccess() {
    try {
      await this._token.callStatic.votingOn();
      return true;
    } catch (error) {
      const message = error?.error?.message || error?.message || "";
      if (message.includes(ADMIN_ERROR)) return false;
      throw error;
    }
  }

  _startPollingData() {
    this._pollDataInterval = setInterval(() => {
      this._updateBalances().catch((error) => {
        console.error(error);
        this.setState({ networkError: this._getRpcErrorMessage(error) });
      });
    }, 5000);
  }

  _stopPollingData() {
    clearInterval(this._pollDataInterval);
    this._pollDataInterval = undefined;
  }

  async _updateBalances(
    userAddress = this.state.selectedAddress,
    initializationId = this.initializationId
  ) {
    if (!userAddress || !this._token) return;

    const [balance, entries] = await Promise.all([
      this._token.balanceOf(userAddress),
      Promise.all(
        STUDENT_CODINAMES.map(async (codinome) => {
          const address = await this._token.users(codinome);
          const studentBalance = await this._token.balanceOf(address);
          return { codinome, balance: studentBalance };
        })
      ),
    ]);

    if (initializationId !== this.initializationId) return;

    entries.sort((left, right) => {
      if (left.balance.eq(right.balance)) {
        return left.codinome.localeCompare(right.codinome);
      }
      return left.balance.gt(right.balance) ? -1 : 1;
    });
    this.setState({ balance, ranking: entries, networkError: undefined });
  }

  _transferTokens = (to, amount) =>
    this._sendTransaction(() => this._token.transfer(to, amount));

  _vote = (codinome, amount) =>
    this._sendTransaction(() => this._token.vote(codinome, amount));

  _issueTokens = (codinome, amount) =>
    this._sendTransaction(() => this._token.issueToken(codinome, amount));

  async _sendTransaction(sendTransaction) {
    try {
      this._dismissTransactionError();
      const transaction = await sendTransaction();
      this.setState({ txBeingSent: transaction.hash });
      const receipt = await transaction.wait();
      if (receipt.status === 0) {
        throw new Error("A transação foi rejeitada pela rede.");
      }
      await this._updateBalances();
    } catch (error) {
      if (error.code === ERROR_CODE_TX_REJECTED_BY_USER) return;
      console.error(error);
      this.setState({ transactionError: error });
    } finally {
      this.setState({ txBeingSent: undefined });
    }
  }

  _dismissTransactionError = () =>
    this.setState({ transactionError: undefined });

  _dismissNetworkError = () => this.setState({ networkError: undefined });

  _getRpcErrorMessage(error) {
    return (
      error?.data?.message ||
      error?.error?.message ||
      error?.reason ||
      error?.message ||
      "Ocorreu um erro inesperado."
    );
  }

  _resetState() {
    this.initializationId += 1;
    this._stopPollingData();
    this.setState({
      selectedAddress: undefined,
      tokenData: undefined,
      balance: undefined,
      registeredCodename: undefined,
      isSuperuser: false,
      ranking: [],
      txBeingSent: undefined,
      transactionError: undefined,
      networkError: undefined,
    });
  }
}
