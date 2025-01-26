import React from "react";
import "../styles/Popup.css";

const Popup = ({ title, content, onClose, onConfirm, closeButtonText = "Cancel", confirmButtonText = "Confirm" }) => {
  return (
    <>
      <div className="popup-overlay" onClick={onClose}></div>
      <div className="popup">
        <h2>{title}</h2>
        <div className="popup-content">{content}</div>
        <div className="popup-actions">
          <button onClick={onClose} className="close-btn">{closeButtonText}</button>
          {onConfirm && (
            <button onClick={onConfirm} className="confirm-btn">
              {confirmButtonText}
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default Popup;
