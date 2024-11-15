// src/components/CancellationConfirmationModal.js
import React from "react";
import { Modal, Button, Spinner, Alert } from "react-bootstrap";
import "../styles/CancellationConfirmationModal.css"; // Import styles file

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
        <Modal.Title>Confirm Cancellation</Modal.Title>
      </Modal.Header>
      <Modal.Body className="modal-body">
        {isProcessing && (
          <div className="processing-cancellation">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Processing...</span>
            </Spinner>
            <p>Processing the cancellation...</p>
          </div>
        )}
        {cancellationStatus === "failure" && (
          <Alert variant="danger">
            An error occurred while processing your cancellation. Please try
            again.
          </Alert>
        )}
        {!isProcessing && cancellationStatus !== "failure" && (
          <p>
            Are you sure you want to cancel your current plan? This action
            cannot be undone.
          </p>
        )}
      </Modal.Body>
      <Modal.Footer className="modal-footer">
        {!isProcessing && (
          <>
            <Button variant="secondary" onClick={onHide}>
              Cancel
            </Button>
            <Button variant="danger" onClick={onConfirm}>
              Cancel Plan
            </Button>
          </>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default CancellationConfirmationModal;
