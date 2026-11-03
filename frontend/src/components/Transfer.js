import React from "react";

export function Transfer({ transferTokens, tokenSymbol }) {
  return (
    <div>
      <form
        className="transfer-form"
        onSubmit={(event) => {
          // This function just calls the transferTokens callback with the
          // form's data.
          event.preventDefault();

          const formData = new FormData(event.target);
          const to = formData.get("to");
          const amount = formData.get("amount");

          if (to && amount) {
            transferTokens(to, amount);
          }
        }}
      >
        <div className="form-group">
          <label htmlFor="transfer-amount">Quantidade de {tokenSymbol}</label>
          <input
            className="form-control form-control-custom"
            id="transfer-amount"
            type="number"
            step="1"
            name="amount"
            placeholder="1"
            min="1"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="transfer-recipient">Endereço de destino</label>
          <input
            className="form-control form-control-custom"
            id="transfer-recipient"
            type="text"
            name="to"
            placeholder="0x..."
            required
          />
        </div>
        <div className="form-group">
          <button className="btn btn-primary action-submit" type="submit">
            Transferir tokens
          </button>
        </div>
      </form>
    </div>
  );
}
