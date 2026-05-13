import React, { useEffect } from "react";
import "./confirmation.css";

const Confirmation = ({ isOpen, onClose, onConfirm, itemName }) => {
    // Prevent background scrolling when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    return (
        <div
            className={`modal-overlay ${isOpen ? "is-open" : ""}`}
            onClick={onClose}
        >
            <div
                className="modal-content"
                onClick={(e) => e.stopPropagation()} // Prevent clicking inside from closing it
            >
                <div className="modal-header">
                    <div className="modal-icon">
                        {/* Warning Icon */}
                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                            <line x1="12" y1="9" x2="12" y2="13"></line>
                            <line x1="12" y1="17" x2="12.01" y2="17"></line>
                        </svg>
                    </div>
                    <h3 className="modal-title">Confirm Deletion</h3>
                </div>

                <div className="modal-body">
                    <p>
                        Are you sure you want to delete{" "}
                        <strong>{itemName || "this item"}</strong>? This action
                        cannot be undone.
                    </p>
                </div>

                <div className="modal-actions">
                    <button className="btn-cancel" onClick={onClose}>
                        Cancel
                    </button>
                    <button className="btn-confirm" onClick={onConfirm}>
                        Yes, Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Confirmation;
