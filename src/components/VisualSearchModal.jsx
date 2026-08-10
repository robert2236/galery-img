/**
 * VisualSearchModal.jsx - Modal de búsqueda visual por imagen
 *
 * Permite al usuario seleccionar una imagen existente para encontrar
 * imágenes visualmente similares usando ChromaDB.
 */

import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { Modal } from "react-bootstrap";
import { FaSearch, FaTimes, FaImage, FaSpinner, FaExclamationTriangle } from "react-icons/fa";
import api from "../Auth/Api";
import { searchSimilarImages } from "../services/vectorSearch";

const VisualSearchModal = ({ show, onHide }) => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Cargar imágenes al abrir el modal
  useEffect(() => {
    if (show) {
      loadImages();
      setResults(null);
      setSelectedImage(null);
      setSearchTerm("");
    }
  }, [show]);

  const loadImages = async () => {
    setLoading(true);
    try {
      let allImages = [];
      let page = 1;
      let hasMore = true;

      while (hasMore && page <= 5) {
        const response = await api.get(
          `/api/images/search?q=${searchTerm}&page=${page}&limit=20`
        );
        const results = response.data.results || [];
        allImages = [...allImages, ...results];
        hasMore = response.data.has_next || results.length >= 20;
        page++;
      }

      setImages(allImages);
    } catch (error) {
      console.error("Error cargando imágenes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!selectedImage) return;

    setSearching(true);
    try {
      const data = await searchSimilarImages(selectedImage.image_id, 12);
      setResults(data);
    } catch (error) {
      console.error("Error en búsqueda visual:", error);
    } finally {
      setSearching(false);
    }
  };

  const handleImageSelect = (img) => {
    setSelectedImage(img);
    setResults(null);
  };

  const filteredImages = images.filter((img) => {
    if (!searchTerm) return true;
    const title = (img.title || "").toLowerCase();
    const category = (img.category || "").toLowerCase();
    return (
      title.includes(searchTerm.toLowerCase()) ||
      category.includes(searchTerm.toLowerCase())
    );
  });

  return (
    <StyledModal show={show} onHide={onHide} centered size="lg">
      <ModalHeader>
        <div className="d-flex align-items-center gap-2">
          <FaSearch style={{ color: "#00f2fe" }} />
          <ModalTitle>Búsqueda Visual</ModalTitle>
        </div>
        <CloseBtn onClick={onHide}>
          <FaTimes />
        </CloseBtn>
      </ModalHeader>

      <ModalBody>
        {!results ? (
          <>
            <Instructions>
              Selecciona una imagen para encontrar visualmente similares
            </Instructions>

            <SearchInputWrapper>
              <SearchIcon>
                <FaSearch />
              </SearchIcon>
              <SearchInput
                type="text"
                placeholder="Filtrar por título o categoría..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </SearchInputWrapper>

            {selectedImage && (
              <SelectedPreview>
                <PreviewImage
                  src={selectedImage.image_url}
                  alt={selectedImage.title}
                />
                <PreviewInfo>
                  <PreviewTitle>{selectedImage.title || "Sin título"}</PreviewTitle>
                  <PreviewCategory>{selectedImage.category}</PreviewCategory>
                </PreviewInfo>
                <SearchButton onClick={handleSearch} disabled={searching}>
                  {searching ? (
                    <>
                      <FaSpinner className="spin" /> Buscando...
                    </>
                  ) : (
                    <>
                      <FaSearch /> Buscar Similares
                    </>
                  )}
                </SearchButton>
              </SelectedPreview>
            )}

            {loading ? (
              <LoadingGrid>
                {[...Array(8)].map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </LoadingGrid>
            ) : (
              <ImageGrid>
                {filteredImages.slice(0, 20).map((img) => (
                  <ImageCard
                    key={img.image_id}
                    $isSelected={selectedImage?.image_id === img.image_id}
                    onClick={() => handleImageSelect(img)}
                  >
                    <CardImage src={img.image_url} alt={img.title} loading="lazy" />
                    <CardOverlay>
                      <CardTitle>{img.title || "Sin título"}</CardTitle>
                    </CardOverlay>
                    {selectedImage?.image_id === img.image_id && (
                      <SelectedBadge>Seleccionada</SelectedBadge>
                    )}
                  </ImageCard>
                ))}
              </ImageGrid>
            )}
          </>
        ) : (
          <ResultsContainer>
            {results.status === "warning" && (
              <WarningBanner>
                <FaExclamationTriangle />
                <div>
                  <strong>Búsqueda visual no disponible</strong>
                  <p>{results.message}</p>
                </div>
              </WarningBanner>
            )}

            <ResultsHeader>
              <h5>
                {results.status === "success" 
                  ? `Resultados para: ${results.original_image?.title || "Imagen"}`
                  : results.original_image?.title || "Imagen"
                }
              </h5>
              <span className="text-muted">
                {results.total_similar > 0 
                  ? `${results.total_similar} imágenes similares encontradas`
                  : results.total_embeddings > 0
                    ? `${results.total_embeddings} embeddings en la base de datos`
                    : "Sin resultados"
                }
              </span>
            </ResultsHeader>

            {results.similar_images?.length > 0 ? (
              <ResultsGrid>
                {results.similar_images.map((img) => (
                  <ResultCard key={img.image_id}>
                    <ResultImage src={img.image_url} alt={img.title} />
                    <ResultOverlay>
                      <ResultScore>
                        {Math.round((img.similarity_score || 0) * 100)}% similar
                      </ResultScore>
                    </ResultOverlay>
                    <ResultInfo>
                      <ResultTitle>{img.title || "Sin título"}</ResultTitle>
                      <ResultLikes>{img.likes || 0} likes</ResultLikes>
                    </ResultInfo>
                  </ResultCard>
                ))}
              </ResultsGrid>
            ) : (
              <NoResults>
                <FaImage style={{ fontSize: "3rem", opacity: 0.3 }} />
                {results.status === "warning" ? (
                  <>
                    <p>Embeddings no disponibles</p>
                    <small>{results.needs_migration ? "Reinicia el servidor para generar embeddings automáticamente" : "Ejecuta migrate_vectors.py para generar embeddings"}</small>
                  </>
                ) : (
                  <>
                    <p>No se encontraron imágenes similares</p>
                    <small>Intenta con otra imagen</small>
                  </>
                )}
              </NoResults>
            )}

            <BackButton onClick={() => setResults(null)}>
              ← Nueva búsqueda
            </BackButton>
          </ResultsContainer>
        )}
      </ModalBody>
    </StyledModal>
  );
};

export default VisualSearchModal;

/* ─── Styled Components ─── */

const StyledModal = styled(Modal)`
  .modal-content {
    background: rgba(20, 20, 20, 0.98);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 16px;
    color: white;
  }
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const ModalTitle = styled.h4`
  margin: 0;
  font-weight: 600;
  font-size: 1.2rem;
`;

const CloseBtn = styled.button`
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
`;

const ModalBody = styled.div`
  padding: 20px 24px;
  max-height: 70vh;
  overflow-y: auto;
`;

const Instructions = styled.p`
  text-align: center;
  color: #aaa;
  margin-bottom: 16px;
  font-size: 0.95rem;
`;

const SearchInputWrapper = styled.div`
  position: relative;
  margin-bottom: 16px;
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #aaa;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 10px 12px 10px 38px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  color: white;
  font-size: 0.95rem;

  &:focus {
    outline: none;
    border-color: rgba(0, 242, 254, 0.5);
    box-shadow: 0 0 0 2px rgba(0, 242, 254, 0.15);
  }

  &::placeholder {
    color: #aaa;
  }
`;

const SelectedPreview = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: rgba(0, 242, 254, 0.08);
  border: 1px solid rgba(0, 242, 254, 0.3);
  border-radius: 10px;
  margin-bottom: 16px;
`;

const PreviewImage = styled.img`
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 8px;
`;

const PreviewInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const PreviewTitle = styled.div`
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const PreviewCategory = styled.div`
  font-size: 0.85rem;
  color: #aaa;
`;

const SearchButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: linear-gradient(135deg, #00f2fe, #7250ff);
  border: none;
  border-radius: 8px;
  color: white;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;

  &:hover:not(:disabled) {
    transform: scale(1.03);
    box-shadow: 0 0 15px rgba(0, 242, 254, 0.4);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .spin {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`;

const LoadingGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;

  @media (max-width: 576px) {
    grid-template-columns: repeat(3, 1fr);
  }
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

const ImageGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;

  @media (max-width: 576px) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

const ImageCard = styled.div`
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 2px solid
    ${({ $isSelected }) =>
      $isSelected ? "rgba(0, 242, 254, 0.8)" : "transparent"};

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 0 15px rgba(0, 242, 254, 0.3);
  }
`;

const CardImage = styled.img`
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  display: block;
`;

const CardOverlay = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20px 6px 6px;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
`;

const CardTitle = styled.span`
  font-size: 0.7rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
`;

const SelectedBadge = styled.div`
  position: absolute;
  top: 6px;
  left: 6px;
  background: rgba(0, 242, 254, 0.9);
  color: #000;
  font-size: 0.65rem;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 4px;
`;

const ResultsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const ResultsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;

  h5 {
    margin: 0;
    font-weight: 600;
  }
`;

const ResultsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;

  @media (max-width: 576px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const ResultCard = styled.div`
  position: relative;
  border-radius: 10px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.05);
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 0 20px rgba(0, 242, 254, 0.3);
  }
`;

const ResultImage = styled.img`
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  display: block;
`;

const ResultOverlay = styled.div`
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.75);
  border-radius: 12px;
  padding: 3px 10px;
  backdrop-filter: blur(4px);
`;

const ResultScore = styled.span`
  font-size: 0.8rem;
  font-weight: 600;
  color: #00f2fe;
`;

const ResultInfo = styled.div`
  padding: 10px;
`;

const ResultTitle = styled.div`
  font-size: 0.85rem;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ResultLikes = styled.div`
  font-size: 0.75rem;
  color: #aaa;
  margin-top: 2px;
`;

const NoResults = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  text-align: center;
  color: #aaa;

  p {
    margin-top: 12px;
    font-size: 1rem;
  }
`;

const BackButton = styled.button`
  align-self: flex-start;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: white;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.15);
  }
`;

const WarningBanner = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 16px;
  background: rgba(255, 193, 7, 0.12);
  border: 1px solid rgba(255, 193, 7, 0.35);
  border-radius: 10px;
  margin-bottom: 16px;
  color: #ffc107;

  svg {
    margin-top: 3px;
    flex-shrink: 0;
  }

  div {
    flex: 1;

    strong {
      display: block;
      font-size: 0.95rem;
      margin-bottom: 4px;
      color: #ffca2c;
    }

    p {
      margin: 0;
      font-size: 0.85rem;
      color: #ccc;
      line-height: 1.4;
    }
  }
`;
