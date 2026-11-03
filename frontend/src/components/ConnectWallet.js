import React from "react";

import { NetworkErrorMessage } from "./NetworkErrorMessage";

export function ConnectWallet({ connectWallet, networkError, dismiss }) {
  return (
    <main className="app-shell connect-shell">
      <header className="topbar">
        <span className="brand">
          <span className="brand-mark">T</span>
          <span className="brand-name">turing<span>.</span></span>
        </span>
        <div className="topbar-network">
          <span className="network-indicator" />
          Rede local
        </div>
      </header>
      <section className="connect-card">
        <div className="connect-art" aria-hidden="true">
          <span className="connect-token token-a">T</span>
          <span className="connect-token token-b">✦</span>
          <span className="connect-token token-c">+</span>
          <span className="connect-art-ring" />
        </div>
        <span className="eyebrow">BEM-VINDO AO TURING</span>
        <h1>Reconhecimento<br />que <span>circula.</span></h1>
        <p>
          Conecte sua carteira para participar da comunidade, votar e acompanhar
          o ranking dos alunos.
        </p>
        {networkError && (
          <NetworkErrorMessage message={networkError} dismiss={dismiss} />
        )}
        <button
          className="btn btn-primary action-submit connect-button"
          type="button"
          onClick={connectWallet}
        >
          <span aria-hidden="true">⌁</span> Conectar carteira
        </button>
        <div className="connect-footnote">
          <span className="network-indicator" />
          Compatível com MetaMask · Hardhat local
        </div>
      </section>
      <footer className="connect-footer">TURING · UMA COMUNIDADE EM MOVIMENTO</footer>
    </main>
  );
}
