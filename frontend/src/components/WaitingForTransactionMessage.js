import React from "react";

export function WaitingForTransactionMessage({ txHash }) {
  return (
    <div className="transaction-banner" role="status">
      <span className="transaction-spinner" />
      <span>
        Aguardando confirmação da transação
        <strong className="transaction-hash">{txHash}</strong>
      </span>
    </div>
  );
}
