import React from 'react';
import '../styles/Popup.css';

const Popup = ({
  title,
  content,
  onClose,
  onConfirm,
  confirmButtonText = "OK",  // Default text for confirm button
  cancelButtonText,          // Optional prop for cancel button text
}) => {
  return (
    <div className="popup-overlay">
      <div className="popup">
        <h2>{title}</h2>
        <div className="popup-content">
          {/* Render your content here */}
          {content}
        </div>
        <div className="popup-buttons">
          {/* Only show the cancel button if cancelButtonText is provided */}
          {cancelButtonText && (
            <button className="popup-close-btn" onClick={onClose}>
              {cancelButtonText}
            </button>
          )}
          <button className="popup-confirm-btn" onClick={onConfirm}>
            {confirmButtonText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Popup;
