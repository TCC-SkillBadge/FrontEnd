// src/components/PaymentConfirmationModal.js
import React from "react";
import { Modal, Button, Spinner, Alert } from "react-bootstrap";
import "../styles/PaymentConfirmationModal.css"; // Importar o arquivo de estilos

const PaymentConfirmationModal = ({
  show,
  onHide,
  onConfirm,
  plan,
  isProcessing,
  paymentStatus, // 'success', 'failure', 'processing'
}) => {
  if (!plan) return null;

  return (
    <Modal show={show} onHide={onHide} centered dialogClassName="custom-modal">
      <Modal.Header closeButton className="modal-header">
        <Modal.Title>Confirmar Compra</Modal.Title>
      </Modal.Header>
      <Modal.Body className="modal-body">
        {isProcessing && (
          <div className="processing-payment">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Processando...</span>
            </Spinner>
            <p>Processando seu pagamento...</p>
          </div>
        )}
        {paymentStatus === "failure" && (
          <Alert variant="danger">
            Ocorreu um erro ao processar seu pagamento. Por favor, tente
            novamente.
          </Alert>
        )}
        {!isProcessing && paymentStatus !== "failure" && (
          <p>
            Tem certeza de que deseja adquirir o plano "
            {plan.tituloPlanoServico}" por R$
            {parseFloat(plan.precoPlanoServico).toFixed(2)}?
          </p>
        )}
      </Modal.Body>
      <Modal.Footer className="modal-footer">
        {!isProcessing && (
          <>
            <Button variant="secondary" onClick={onHide}>
              Cancelar
            </Button>
            <Button variant="success" onClick={onConfirm}>
              Confirmar Compra
            </Button>
          </>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default PaymentConfirmationModal;
