import React from "react";
import { Modal, Button } from "react-bootstrap";
import "../styles/ConfirmationModal.css";

const ConfirmationModal = ({
  show,
  onHide,
  onConfirm,
  title,
  body,
  confirmButtonText = "Confirm",
  cancelButtonText = "Cancel",
  showButtons = true, // Add a prop to control button visibility
}) => {
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton className="modal-header-custom">
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body className="modal-body-custom">{body}</Modal.Body>
      {showButtons && ( // Conditionally render buttons based on the showButtons prop
        <Modal.Footer className="modal-footer-custom">
          <Button
            variant="secondary"
            onClick={onHide}
            className="modal-button-custom"
          >
            {cancelButtonText}
          </Button>
          <Button
            variant="danger"
            onClick={onConfirm}
            className="modal-button-custom"
          >
            {confirmButtonText}
          </Button>
        </Modal.Footer>
      )}
    </Modal>
  );
};

export default ConfirmationModal;
