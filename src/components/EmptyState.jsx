import React, { memo } from "react";
import { useNavigate } from "react-router-dom";

const GalleryIcon = () => (
  <svg viewBox="0 0 24 24" width="80" height="80" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
  </svg>
);

const SearchIcon = () => (
  <svg viewBox="0 0 24 24" width="80" height="80" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
  </svg>
);

const EmptyState = memo(({ title, subtitle, ctaLabel, ctaPath, isSearch }) => {
  const navigate = useNavigate();

  return (
    <div className="d-flex flex-column align-items-center justify-content-center text-center py-5 min-vh-100">
      <div className="opacity-50 mb-4" style={{ color: "#00f2fe" }}>
        {isSearch ? <SearchIcon /> : <GalleryIcon />}
      </div>
      <h2 className="fw-semibold mb-2" style={{ color: "inherit" }}>
        {title || (isSearch ? "Sin resultados" : "No hay imágenes aún")}
      </h2>
      <p className="text-muted mb-4" style={{ maxWidth: 400, lineHeight: 1.5 }}>
        {subtitle || (isSearch
          ? "Intenta con otros términos de búsqueda"
          : "Comienza subiendo tu primera imagen para empezar a explorar")}
      </p>
      {ctaPath && !isSearch && (
        <button
          className="btn btn-primary rounded-pill px-4 py-2 fw-medium"
          onClick={() => navigate(ctaPath)}
        >
          {ctaLabel || "Subir imagen"}
        </button>
      )}
    </div>
  );
});

EmptyState.displayName = "EmptyState";

export default EmptyState;
