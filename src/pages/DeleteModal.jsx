import React from "react";
import { AlertCircle } from "lucide-react";

const DeleteModal = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;
  // console.log(onConfirm);
  console.log(onClose);

  return (
    <div className="modal d-block bg-dark bg-opacity-50" tabIndex="-1">
      <div className="modal-dialog modal-sm modal-dialog-centered">
        <div className="modal-content border-0 shadow">
          <div className="modal-body text-center p-4">
            <div className="text-danger mb-3">
              <AlertCircle size={48} />
            </div>

            <h5>{title || "Confirm Action"}</h5>

            <p className="text-muted small">
              {message || "This action cannot be undone."}
            </p>

            <div className="d-flex gap-2 justify-content-center mt-4">
              <button className="btn btn-light flex-grow-1" onClick={onClose}>
                Cancel
              </button>
              <button
                className="btn btn-danger flex-grow-1"
                onClick={onConfirm}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;
