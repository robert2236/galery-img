import React, { memo } from "react";

const WarningIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="80" height="80">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
  </svg>
);

const ErrorState = memo(({ message, onRetry }) => {
  return (
    <div className="d-flex flex-column align-items-center justify-content-center text-center py-5 min-vh-100">
      <div className="text-danger opacity-75 mb-4">
        <WarningIcon />
      </div>
      <h2 className="fw-semibold mb-2" style={{ color: "inherit" }}>
        Algo salió mal
      </h2>
      <p className="text-muted mb-4" style={{ maxWidth: 500, lineHeight: 1.5 }}>
        {message || "No pudimos cargar las imágenes. Intenta de nuevo."}
      </p>
      {onRetry && (
        <button
          className="btn btn-outline-primary rounded-pill px-4 py-2 fw-medium"
          onClick={onRetry}
        >
          Reintentar
        </button>
      )}
    </div>
  );
});

ErrorState.displayName = "ErrorState";

export default ErrorState;
