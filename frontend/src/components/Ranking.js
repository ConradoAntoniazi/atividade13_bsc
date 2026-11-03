import React from "react";

export function Ranking({ entries, tokenSymbol }) {
  return (
    <section className="ranking-content" aria-labelledby="ranking-title">
      <div className="ranking-heading">
        <div>
          <span className="eyebrow">PLACAR AO VIVO</span>
          <h2 id="ranking-title">Ranking dos alunos</h2>
        </div>
        <span className="live-indicator"><i /> Atualizado automaticamente</span>
      </div>
      {entries.length === 0 ? (
        <p className="empty-ranking">Nenhum aluno cadastrado para exibir.</p>
      ) : (
        <div className="table-responsive">
          <table className="table ranking-table">
            <thead>
              <tr>
                <th scope="col">#</th>
                <th scope="col">ALUNO</th>
                <th scope="col" className="text-right">TURINGS</th>
              </tr>
            </thead>
            <tbody>
              {entries.map(({ codinome, balance }, index) => (
                <tr key={codinome} className={index === 0 ? "rank-first" : ""}>
                  <th scope="row">
                    <span className={`rank-position rank-position-${index + 1}`}>
                      {index + 1}
                    </span>
                  </th>
                  <td>
                    <span className="student-avatar">
                      {codinome.charAt(0).toUpperCase()}
                    </span>
                    <span className="student-name">{codinome}</span>
                    {index === 0 && <span className="leader-label">LÍDER</span>}
                  </td>
                  <td className="rank-balance">
                    <strong>{balance.toString()}</strong>
                    <span>{tokenSymbol}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
