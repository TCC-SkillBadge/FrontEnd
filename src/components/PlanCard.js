// PlanCard.js
import React from "react";
import { Link } from "react-router-dom";
import { PencilFill, TrashFill } from "react-bootstrap-icons";
import "../styles/PlanCard.css";

const PlanCard = ({
  plan,
  isAdmin,
  isEnterpriseUser,
  handleDelete,
  handlePayment,
  isCurrent, // Indicates if this is the current plan
  isDimmed, // Indicates if the card should be dimmed
}) => {
  return (
    <div
      className={`plan-card ${plan.prioridade ? "highlight" : ""} ${
        isCurrent ? "current-plan" : ""
      } ${isDimmed ? "dimmed" : ""}`}
    >
      {isAdmin && (
        <div className="admin-icons">
          <Link
            to={`/edit-plan/${plan.id}`}
            className="edit-icon"
            title="Editar Plano"
          >
            <PencilFill />
          </Link>
          <span
            className="delete-icon"
            onClick={() => handleDelete(plan.id)}
            title="Deletar Plano"
          >
            <TrashFill />
          </span>
        </div>
      )}

      {isCurrent && <div className="current-plan-badge">Seu Plano Atual</div>}

      <div className="icon-container">
        <i className="bi bi-check-circle icon"></i>
      </div>
      <h3 className="plan-title">{plan.tituloPlanoServico}</h3>
      <p className="description">{plan.descricaoPlano}</p>
      <ul className="features">
        {plan.funcionalidadesDisponiveis &&
        plan.funcionalidadesDisponiveis.length > 0 ? (
          plan.funcionalidadesDisponiveis.map((func) => (
            <li key={func.id}>
              <i className="bi bi-play-fill feature-icon"></i>{" "}
              {func.nomeFuncionalidade}
            </li>
          ))
        ) : (
          <li>Nenhuma funcionalidade disponível.</li>
        )}
      </ul>
      <ul className="features unavailable">
        {plan.funcionalidadesNaoDisponiveis &&
        plan.funcionalidadesNaoDisponiveis.length > 0 ? (
          plan.funcionalidadesNaoDisponiveis.map((func) => (
            <li key={func.id}>
              <i className="bi bi-x-circle-fill feature-icon"></i>{" "}
              {func.nomeFuncionalidade}
            </li>
          ))
        ) : (
          <li>Nenhuma funcionalidade indisponível.</li>
        )}
      </ul>
      <div className="price">
        R${parseFloat(plan.precoPlanoServico).toFixed(2)}/{plan.prazoPagamentos}
      </div>
      {/* Exibir botão de compra apenas para usuários empresariais e se não for o plano atual */}
      {!isAdmin && isEnterpriseUser && !isCurrent && (
        <button className="buy-button" onClick={() => handlePayment(plan.id)}>
          Comprar Agora
        </button>
      )}
      {/* Informar que é o plano atual para o usuário */}
      {!isAdmin && isEnterpriseUser && isCurrent && (
        <div className="current-plan-info">Este é o seu plano atual.</div>
      )}
    </div>
  );
};

export default PlanCard;
