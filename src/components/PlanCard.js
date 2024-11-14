// PlanCard.js
import React from "react";
import { Link } from "react-router-dom";
import { PencilFill, TrashFill } from "react-bootstrap-icons";
import "../styles/PlanCard.css";

const PlanCard = ({ plan, isAdmin, handleDelete }) => {
  return (
    <div className={`plan-card ${plan.prioridade ? "highlight" : ""}`}>
      {isAdmin && (
        <div className="admin-icons">
          <Link to={`/edit-plan/${plan.id}`} className="edit-icon">
            <PencilFill />
          </Link>
          <span className="delete-icon" onClick={() => handleDelete(plan.id)}>
            <TrashFill />
          </span>
        </div>
      )}
      <div className="icon-container">
        <i className="bi bi-check-circle icon"></i>
      </div>
      <h3 className="plan-title">{plan.tituloPlanoServico}</h3>
      <p className="description">{plan.descricaoPlano}</p>
      <ul className="features">
        {plan.funcionalidadesDisponiveis &&
        plan.funcionalidadesDisponiveis.length > 0 ? (
          plan.funcionalidadesDisponiveis.map((func, index) => (
            <li key={index}>
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
          plan.funcionalidadesNaoDisponiveis.map((func, index) => (
            <li key={index}>
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
      <button className="buy-button">Comprar Agora</button>
    </div>
  );
};

export default PlanCard;
