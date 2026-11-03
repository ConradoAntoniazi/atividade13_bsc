import React from "react";

export function StudentActionForm({
  actionLabel,
  codinomes,
  maxAmount,
  onSubmit,
  submitLabel,
  tokenSymbol,
}) {
  function handleSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    onSubmit(formData.get("codinome"), formData.get("amount"));
    event.currentTarget.reset();
  }

  return (
    <form className="action-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor={`${actionLabel}-codinome`}>Aluno</label>
        <select
          className="form-control form-control-custom"
          id={`${actionLabel}-codinome`}
          name="codinome"
          required
        >
          <option value="">Selecione um aluno</option>
          {codinomes.map((codinome) => (
            <option key={codinome} value={codinome}>
              {codinome}
            </option>
          ))}
        </select>
      </div>
      <div className="form-group">
        <label htmlFor={`${actionLabel}-amount`}>
          Quantidade de {tokenSymbol}
        </label>
        <input
          className="form-control form-control-custom"
          id={`${actionLabel}-amount`}
          type="number"
          name="amount"
          min="1"
          max={maxAmount}
          step="1"
          required
        />
        {maxAmount && (
          <small className="form-text text-muted">
            Para votar, a quantidade deve ser de 1 a {maxAmount}.
          </small>
        )}
      </div>
      <button className="btn btn-primary action-submit" type="submit">
        {submitLabel}
      </button>
    </form>
  );
}
