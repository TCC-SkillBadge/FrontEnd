import React from "react";
import { Modal, Button } from "react-bootstrap";
import "../styles/ApproveModal.css";

const ApproveModal = ({
  show,
  onHide,
  onApprove,
  onReprove,
  title,
  body,
  approveButtonText = "Approve",
  reproveButtonText = "Reprove",
  showButtons = true, 
}) => {
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton className="modal-header-custom">
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body className="modal-body-custom">{body}</Modal.Body>
      {showButtons && ( 
        <Modal.Footer className="modal-footer-custom">
          <Button
            variant="danger"
            onClick={onReprove}
            className="modal-button-custom"
          >
            {reproveButtonText}
          </Button>
          <Button
            variant="success"
            onClick={onApprove}
            className="modal-button-custom"
          >
            {approveButtonText}
          </Button>
        </Modal.Footer>
      )}
    </Modal>
  );
};

export default ApproveModal;
