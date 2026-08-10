/**
 * SimilarImagesPanel.jsx - Panel lateral de imágenes similares
 *
 * Muestra imágenes visualmente similares usando ChromaDB.
 * Patrón similar a CommentsPanel en Home.jsx.
 */

import React from "react";
import styled from "styled-components";
import { FaTimes, FaImage, FaExclamationTriangle } from "react-icons/fa";

const SimilarImagesPanel = ({
  imageId,
  similarImages,
  loading,
  onClose,
  onImageSelect,
  embeddingStatus, // "ok" | "warning" | "migrating"
}) => {
  const renderContent = () => {
    if (loading) {
      return (
        <LoadingContainer>
          {[...Array(4)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </LoadingContainer>
      );
    }

    if (similarImages.length > 0) {
      return (
        <SimilarGrid>
          {similarImages.map((img, index) => (
            <SimilarCard
              key={img.image_id || index}
              onClick={() => onImageSelect(img)}
            >
              <SimilarImage
                src={img.image_url}
                alt={img.title || "Imagen similar"}
                loading="lazy"
              />
              <SimilarOverlay>
                <SimilarScore>
                  {Math.round((img.similarity_score || 0) * 100)}%
                </SimilarScore>
              </SimilarOverlay>
              {img.title && <SimilarTitle>{img.title}</SimilarTitle>}
            </SimilarCard>
          ))}
        </SimilarGrid>
      );
    }

    // Empty state
    return (
      <EmptyState>
        {embeddingStatus === "migrating" ? (
          <>
            <LoadingSpinner />
            <p>Generando embeddings...</p>
            <small>Procesando imágenes existentes en segundo plano</small>
          </>
        ) : embeddingStatus === "warning" ? (
          <>
            <FaExclamationTriangle
              style={{ fontSize: "2.5rem", color: "#ffc107", marginBottom: "10px" }}
            />
            <p>Sin embeddings disponibles</p>
            <small>Reinicia el servidor para generar automáticamente los embeddings de las imágenes</small>
          </>
        ) : (
          <>
            <FaImage
              style={{ fontSize: "2.5rem", opacity: 0.3, marginBottom: "10px" }}
            />
            <p>No hay imágenes similares</p>
            <small>Intenta con otra imagen</small>
          </>
        )}
      </EmptyState>
    );
  };

  return (
    <Panel $visible={true}>
      <PanelHeader>
        <div className="d-flex align-items-center gap-2">
          <FaImage style={{ fontSize: "1.1rem" }} />
          <h5 className="mb-0">Imágenes Similares</h5>
        </div>
        <CloseButton
          className="btn btn-sm btn-outline-light rounded-circle d-flex align-items-center justify-content-center p-1"
          style={{ width: 28, height: 28 }}
          onClick={onClose}
        >
          <FaTimes />
        </CloseButton>
      </PanelHeader>

      <PanelContent>{renderContent()}</PanelContent>
    </Panel>
  );
};

export default SimilarImagesPanel;

/* ─── Styled Components ─── */

const Panel = styled.div`
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 400px;
  background: rgba(0, 0, 0, 0.95);
  backdrop-filter: blur(10px);
  color: white;
  display: flex;
  flex-direction: column;
  z-index: 20;
  padding: 15px;
  overflow-y: auto;
  border-left: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;

  @media (max-width: 768px) {
    width: 100%;
    height: 50vh;
    top: auto;
    bottom: 0;
    right: 0;
    left: 0;
    border-left: none;
    border-top: 1px solid rgba(255, 255, 255, 0.2);
  }

  @media (max-width: 576px) {
    height: 60vh;
    padding: 12px;
  }
`;

const PanelHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
`;

const CloseButton = styled.button`
  &:hover {
    background: rgba(255, 255, 255, 0.2) !important;
  }
`;

const PanelContent = styled.div`
  flex: 1;
  overflow-y: auto;
`;

const LoadingContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
`;

const SkeletonCard = styled.div`
  aspect-ratio: 1;
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.05) 25%,
    rgba(255, 255, 255, 0.1) 50%,
    rgba(255, 255, 255, 0.05) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 8px;

  @keyframes shimmer {
    0% {
      background-position: -200% 0;
    }
    100% {
      background-position: 200% 0;
    }
  }
`;

const SimilarGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
`;

const SimilarCard = styled.div`
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s ease;
  background: rgba(255, 255, 255, 0.05);

  &:hover {
    transform: scale(1.03);
    box-shadow: 0 0 15px rgba(0, 242, 254, 0.3);
  }
`;

const SimilarImage = styled.img`
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  display: block;
`;

const SimilarOverlay = styled.div`
  position: absolute;
  top: 6px;
  right: 6px;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 12px;
  padding: 2px 8px;
  backdrop-filter: blur(4px);
`;

const SimilarScore = styled.span`
  font-size: 0.75rem;
  font-weight: 600;
  color: #00f2fe;
`;

const SimilarTitle = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20px 6px 6px;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
  font-size: 0.7rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  text-align: center;
  color: #aaa;

  p {
    margin: 0 0 5px;
    font-size: 0.95rem;
  }

  small {
    font-size: 0.8rem;
    opacity: 0.7;
  }
`;

const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255, 255, 255, 0.1);
  border-top-color: #00f2fe;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 12px;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;
