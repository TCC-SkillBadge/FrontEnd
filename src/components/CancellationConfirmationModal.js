// src/components/CancellationConfirmationModal.js
import React from "react";
import { Modal, Button, Spinner, Alert } from "react-bootstrap";
import "../styles/CancellationConfirmationModal.css"; // Importar o arquivo de estilos

const CancellationConfirmationModal = ({
  show,
  onHide,
  onConfirm,
  isProcessing,
  cancellationStatus, // 'success', 'failure', 'processing'
}) => {
  return (
    <Modal show={show} onHide={onHide} centered dialogClassName="custom-modal">
      <Modal.Header closeButton className="modal-header">
        <Modal.Title>Confirmar Cancelamento</Modal.Title>
      </Modal.Header>
      <Modal.Body className="modal-body">
        {isProcessing && (
          <div className="processing-cancellation">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Processando...</span>
            </Spinner>
            <p>Processando o cancelamento...</p>
          </div>
        )}
        {cancellationStatus === "failure" && (
          <Alert variant="danger">
            Ocorreu um erro ao processar seu cancelamento. Por favor, tente
            novamente.
          </Alert>
        )}
        {!isProcessing && cancellationStatus !== "failure" && (
          <p>
            Tem certeza de que deseja cancelar seu plano atual? Essa ação não
            pode ser desfeita.
          </p>
        )}
      </Modal.Body>
      <Modal.Footer className="modal-footer">
        {!isProcessing && (
          <>
            <Button variant="secondary" onClick={onHide}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={onConfirm}>
              Cancelar Plano
            </Button>
          </>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default CancellationConfirmationModal;
