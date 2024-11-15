// PaymentConfirmationModal.js
import React from "react";
import { Modal, Button } from "react-bootstrap";
import "../styles/PaymentConfirmationModal.css"; // Importar o arquivo de estilos

const PaymentConfirmationModal = ({ show, onHide, onConfirm, plan }) => {
  if (!plan) return null;

  return (
    <Modal show={show} onHide={onHide} centered dialogClassName="custom-modal">
      <Modal.Header closeButton className="modal-header">
        <Modal.Title>Confirmar Compra</Modal.Title>
      </Modal.Header>
      <Modal.Body className="modal-body">
        Tem certeza de que deseja adquirir o plano "{plan.tituloPlanoServico}" por R$
        {parseFloat(plan.precoPlanoServico).toFixed(2)}?
      </Modal.Body>
      <Modal.Footer className="modal-footer">
        <Button variant="secondary" onClick={onHide}>
          Cancelar
        </Button>
        <Button variant="success" onClick={onConfirm}>
          Confirmar Compra
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default PaymentConfirmationModal;
