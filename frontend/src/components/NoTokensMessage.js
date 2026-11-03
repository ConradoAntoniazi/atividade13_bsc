import React from "react";

export function NoTokensMessage({ selectedAddress }) {
  return (
    <div className="no-tokens-copy">
      <p>Você ainda não tem tokens para transferir.</p>
      <p>
        Para receber tokens na rede local, execute o faucet no terminal:
      </p>
      <code>npx hardhat --network localhost faucet {selectedAddress}</code>
    </div>
  );
}
