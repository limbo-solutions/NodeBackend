// modal.jsx
import React from 'react';
import './main.css';

const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  const handleClose = () => {
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal">
        <div className="modal-content">
          {children}
          <button onClick={handleClose} className="modal-button">
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
