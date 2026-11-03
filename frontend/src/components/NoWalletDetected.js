import React from "react";

export function NoWalletDetected() {
  return (
    <main className="app-shell connect-shell">
      <header className="topbar">
        <span className="brand">
          <span className="brand-mark">T</span>
          <span className="brand-name">turing<span>.</span></span>
        </span>
        <div className="topbar-network">
          <span className="network-indicator network-indicator-offline" />
          Carteira desconectada
        </div>
      </header>
      <section className="connect-card">
        <div className="connect-art" aria-hidden="true">
          <span className="connect-token token-a">T</span>
          <span className="connect-token token-b">✦</span>
          <span className="connect-token token-c">+</span>
          <span className="connect-art-ring" />
        </div>
        <span className="eyebrow">SUA COMUNIDADE COMEÇA AQUI</span>
        <h1>Uma carteira.<br /><span>Muitas ideias.</span></h1>
        <p>
          Para entrar no Turing, instale uma carteira Ethereum como{" "}
          <a
            href="https://www.coinbase.com/wallet"
            target="_blank"
            rel="noopener noreferrer"
          >
            Coinbase Wallet
          </a>{" "}
          ou{" "}
          <a
            href="https://metamask.io"
            target="_blank"
            rel="noopener noreferrer"
          >
            MetaMask
          </a>
          .
        </p>
        <div className="connect-footnote">
          <span className="network-indicator network-indicator-offline" />
          Sua carteira será usada para assinar transações
        </div>
      </section>
      <footer className="connect-footer">TURING · UMA COMUNIDADE EM MOVIMENTO</footer>
    </main>
  );
}
