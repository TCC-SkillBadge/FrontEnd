// src/components/PaymentConfirmationModal.js
import React from "react";
import { Modal, Button, Spinner, Alert } from "react-bootstrap";
import "../styles/PaymentConfirmationModal.css"; // Import styles file

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
        <Modal.Title>Confirm Purchase</Modal.Title>
      </Modal.Header>
      <Modal.Body className="modal-body">
        {isProcessing && (
          <div className="processing-payment">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Processing...</span>
            </Spinner>
            <p>Processing your payment...</p>
          </div>
        )}
        {paymentStatus === "failure" && (
          <Alert variant="danger">
            An error occurred while processing your payment. Please try again.
          </Alert>
        )}
        {!isProcessing && paymentStatus !== "failure" && (
          <p>
            Are you sure you want to purchase the "{plan.tituloPlanoServico}"
            plan for ${parseFloat(plan.precoPlanoServico).toFixed(2)}?
          </p>
        )}
      </Modal.Body>
      <Modal.Footer className="modal-footer">
        {!isProcessing && (
          <>
            <Button variant="secondary" onClick={onHide}>
              Cancel
            </Button>
            <Button variant="success" onClick={onConfirm}>
              Confirm Purchase
            </Button>
          </>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default PaymentConfirmationModal;
