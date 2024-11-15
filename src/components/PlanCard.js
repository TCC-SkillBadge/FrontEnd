// src/components/PlanCard.js
import React from "react";
import { Button, Spinner } from "react-bootstrap";
import "../styles/PlanCard.css";

const PlanCard = ({
  plan,
  isAdmin,
  isEnterpriseUser,
  handleDelete,
  handlePayment,
  isCurrent,
  isDimmed,
  isProcessingPayment,
  handleCancel, // Nova prop para cancelar o plano
}) => {
  return (
    <div
      className={`plan-card ${plan.prioridade ? "highlight" : ""} ${
        isDimmed ? "dimmed" : ""
      }`}
    >
      {isCurrent && <div className="current-plan-badge">Plano Atual</div>}
      <div className="icon-container">
        {/* Você pode substituir por um ícone representativo do plano */}
        <span className="icon">⭐</span>
      </div>
      <h3 className="plan-title">{plan.tituloPlanoServico}</h3>
      <p className="description">{plan.descricaoPlano}</p>
      <ul className={`features ${isCurrent ? "current-plan" : ""}`}>
        {plan.funcionalidadesDisponiveis.map((feature) => (
          <li key={feature.id}>
            <span className="feature-icon">✔️</span>
            {feature.nomeFuncionalidade}
          </li>
        ))}
        {plan.funcionalidadesNaoDisponiveis.map((feature) => (
          <li key={feature.id} className="unavailable">
            <span className="feature-icon">❌</span>
            {feature.nomeFuncionalidade}
          </li>
        ))}
      </ul>
      <div className="price">R$ {plan.precoPlanoServico.toFixed(2)}</div>
      <div className="plan-actions">
        {isEnterpriseUser && (
          <Button
            variant="primary"
            onClick={() => handlePayment(plan.id)}
            disabled={isProcessingPayment || isCurrent}
          >
            {isProcessingPayment && isCurrent ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                />{" "}
                Processando...
              </>
            ) : isCurrent ? (
              "Plano Atual"
            ) : (
              "Comprar"
            )}
          </Button>
        )}
        {isAdmin && (
          <Button
            variant="danger"
            onClick={() => handleDelete(plan.id)}
            disabled={isProcessingPayment}
          >
            Deletar
          </Button>
        )}
        {isCurrent && (
          <Button
            variant="outline-warning"
            onClick={() => handleCancel(plan.id)}
            disabled={isProcessingPayment}
          >
            {isProcessingPayment ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                />{" "}
                Cancelando...
              </>
            ) : (
              "Cancelar Plano"
            )}
          </Button>
        )}
      </div>
    </div>
  );
};

export default PlanCard;
