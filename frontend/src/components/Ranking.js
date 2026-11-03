import React from "react";

export function Ranking({ entries, tokenSymbol }) {
  return (
    <section className="mt-4" aria-labelledby="ranking-title">
      <h2 id="ranking-title">Ranking dos alunos</h2>
      {entries.length === 0 ? (
        <p>Nenhum aluno cadastrado para exibir.</p>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped">
            <thead>
              <tr>
                <th scope="col">Posição</th>
                <th scope="col">Codinome</th>
                <th scope="col">Saldo de {tokenSymbol}</th>
              </tr>
            </thead>
            <tbody>
              {entries.map(({ codinome, balance }, index) => (
                <tr key={codinome}>
                  <th scope="row">{index + 1}</th>
                  <td>{codinome}</td>
                  <td>{balance.toString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
