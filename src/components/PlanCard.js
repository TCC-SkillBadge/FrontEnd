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
  handleCancel, // New prop for canceling the plan
  isCurrent,
  isDisabled,
}) => {
  return (
    <div
      className={`plan-card ${plan.prioridade ? "highlight" : ""} ${isCurrent ? "current-plan" : ""
        }`}
    >
      {isAdmin && (
        <div className="admin-icons">
          <Link
            to={`/edit-plan/${plan.id}`}
            className="edit-icon"
            title="Edit Plan"
          >
            <PencilFill />
          </Link>
          <span
            className="delete-icon"
            onClick={() => handleDelete(plan.id)}
            title="Delete Plan"
          >
            <TrashFill />
          </span>
        </div>
      )}

      {isCurrent && <div className="current-plan-badge">Your Current Plan</div>}

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
          <li>No available features.</li>
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
          <li>No unavailable features.</li>
        )}
      </ul>
      <div className="price">
        ${parseFloat(plan.precoPlanoServico).toFixed(2)}/{plan.prazoPagamentos}
      </div>

      {/* Show buy button only for enterprise users and if it's not the current plan */}
      {!isAdmin && isEnterpriseUser && !isCurrent && (
        <button
          className="buy-button"
          onClick={() => handlePayment(plan.id)}
          disabled={isDisabled} // Disables the button if isDisabled is true
        >
          Buy Now
        </button>
      )}

      {/* Show cancel button only if it's the current plan */}
      {!isAdmin && isEnterpriseUser && isCurrent && (
        <button className="cancel-button-pc" onClick={() => handleCancel(plan.id)}>
          Cancel Plan
        </button>
      )}

      {!isAdmin && isEnterpriseUser && isCurrent && (
        <div className="current-plan-info">This is your current plan.</div>
      )}
    </div>
  );
};

export default PlanCard;
