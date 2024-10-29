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
        {plan.funcDisponibilizadas.split(",").map((feature, index) => (
          <li key={index}>
            <i className="bi bi-play-fill feature-icon"></i> {feature}
          </li>
        ))}
      </ul>
      <ul className="features unavailable">
        {plan.funcNaoDisponibilizadas.split(",").map((feature, index) => (
          <li key={index}>
            <i className="bi bi-x-circle-fill feature-icon"></i> {feature}
          </li>
        ))}
      </ul>
      <div className="price">
        ${plan.precoPlanoServico.toFixed(2)}/{plan.prazoPagamentos}
      </div>
      <button className="buy-button">Buy Now</button>
    </div>
  );
};

export default PlanCard;
