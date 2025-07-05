import styled from "styled-components";
import React, { useState, useRef, useEffect } from "react";
import { Modal, Carousel } from "react-bootstrap";
import { FaStar, FaRegStar } from "react-icons/fa";
import { FaDownload, FaShareAlt } from "react-icons/fa";
import { toast } from "react-toastify";
import { FaExpand, FaEllipsisH, FaCompress } from "react-icons/fa";

export function Home() {
  const images = Object.values(
    import.meta.glob("../images/*.{png,jpg,jpeg,webp,gif}", {
      eager: true,
      as: "url",
    })
  );

  // Estado para almacenar las calificaciones de cada imagen
  const [ratings, setRatings] = useState(Array(images.length).fill({ stars: 0, count: 0 }));
  const [show, setShow] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showRating, setShowRating] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [zoomState, setZoomState] = useState({
    scale: 1,
    position: { x: 0, y: 0 },
    isDragging: false,
    startPos: { x: 0, y: 0 },
  });
  const imageRef = useRef(null);

  // Resetear el zoom cuando cambia la imagen o se cierra el modal
  useEffect(() => {
    if (!show) {
      setIsExpanded(false);
    }
    setZoomState({
      scale: 1,
      position: { x: 0, y: 0 },
      isDragging: false,
      startPos: { x: 0, y: 0 },
    });
  }, [selectedImageIndex, show]);

  const handleExpand = () => {
    setIsExpanded(!isExpanded);
    if (showRating) setShowRating(false);
    if (!isExpanded) {
      setZoomState((prev) => ({
        ...prev,
        scale: 1,
        position: { x: 0, y: 0 },
      }));
    }
  };

  const handleClose = () => {
    setShow(false);
    setShowRating(false);
    setIsExpanded(false);
  };

  const handleShow = (index) => {
    setSelectedImageIndex(index);
    setShow(true);
  };

  const handleDownload = async (imageUrl) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `image-${selectedImageIndex + 1}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error al descargar:", error);
    }
  };

  const handleShare = async (imageUrl) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: "Mira esta imagen",
          text: "¡Echa un vistazo a esta imagen!",
          url: imageUrl,
        });
      } else {
        await navigator.clipboard.writeText(imageUrl);
        toast.success("¡Enlace copiado al portapapeles!");
      }
    } catch (error) {
      console.error("Error al compartir:", error);
      toast.error("Error al compartir");
    }
  };

  const ImageControls = ({ onExpand, onToggleActions, isActionsVisible }) => {
    return (
      <ControlsContainer>
        <ControlButton onClick={onExpand}>{isExpanded ? <FaCompress /> : <FaExpand />}</ControlButton>
        <ControlButton onClick={onToggleActions} isActive={isActionsVisible}>
          <FaEllipsisH />
        </ControlButton>
      </ControlsContainer>
    );
  };

  const handleRating = (index, rating) => {
    const newRatings = [...ratings];
    const currentRating = newRatings[index];

    newRatings[index] = {
      stars: (currentRating.stars * currentRating.count + rating) / (currentRating.count + 1),
      count: currentRating.count + 1,
    };

    setRatings(newRatings);
    setShowRating(false);
  };

  const StarRating = ({ rating, onRate }) => {
    const stars = [];
    const fullStars = Math.round(rating);

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<FaStar key={i} onClick={() => onRate(i)} style={{ color: "#ffc107", cursor: "pointer", fontSize: "1.5rem" }} />);
      } else {
        stars.push(<FaRegStar key={i} onClick={() => onRate(i)} style={{ color: "#ffc107", cursor: "pointer", fontSize: "1.5rem" }} />);
      }
    }

    return <div style={{ display: "flex", gap: "5px" }}>{stars}</div>;
  };

  // Funciones para manejar el zoom y arrastre
  const handleWheel = (e) => {
    if (!isExpanded) return;

    e.preventDefault();
    const delta = -e.deltaY;
    const newScale = zoomState.scale + delta * 0.001;
    setZoomState((prev) => ({
      ...prev,
      scale: Math.max(1, Math.min(newScale, 3)), // Limita el zoom entre 1x y 3x
    }));
  };

  const handleMouseDown = (e) => {
    if (!isExpanded || zoomState.scale === 1) return;

    setZoomState((prev) => ({
      ...prev,
      isDragging: true,
      startPos: {
        x: e.clientX - prev.position.x,
        y: e.clientY - prev.position.y,
      },
    }));
  };

  const handleMouseMove = (e) => {
    if (!zoomState.isDragging || !isExpanded || zoomState.scale === 1) return;

    setZoomState((prev) => ({
      ...prev,
      position: {
        x: e.clientX - prev.startPos.x,
        y: e.clientY - prev.startPos.y,
      },
    }));
  };

  const handleMouseUp = () => {
    setZoomState((prev) => ({
      ...prev,
      isDragging: false,
    }));
  };

  const handleDoubleClick = () => {
    if (!isExpanded) return;

    setZoomState((prev) => ({
      ...prev,
      scale: prev.scale === 1 ? 2 : 1,
      position: { x: 0, y: 0 },
    }));
  };

  return (
    <Container className="mt-5">
      <GalleryGrid>
        {images.map((img, index) => (
          <GalleryItem key={index} onClick={() => handleShow(index)}>
            <img src={img} alt={`Imagen ${index + 1}`} loading="lazy" />
            <RatingOverlay>
              <StarRatingDisplay>
                <FaStar style={{ color: "#ffc107" }} />
                <RatingText>
                  {ratings[index].stars.toFixed(1)} ({ratings[index].count})
                </RatingText>
              </StarRatingDisplay>
            </RatingOverlay>
          </GalleryItem>
        ))}
      </GalleryGrid>

      <TransparentModal show={show} onHide={handleClose} centered size="xl">
        <ModalBackdrop onClick={handleClose} $isExpanded={isExpanded}>
          <CarouselContainer onClick={(e) => e.stopPropagation()} $isExpanded={isExpanded} onMouseLeave={handleMouseUp}>
            <StyledCarousel activeIndex={selectedImageIndex} onSelect={setSelectedImageIndex} interval={null}>
              {images.map((img, index) => (
                <Carousel.Item key={index}>
                  <ImageControls onExpand={handleExpand} onToggleActions={() => setShowRating(!showRating)} isActionsVisible={showRating} />
                  <CarouselImage
                    ref={imageRef}
                    src={img}
                    alt=""
                    $isExpanded={isExpanded}
                    style={{
                      transform: isExpanded ? `scale(${zoomState.scale}) translate(${zoomState.position.x}px, ${zoomState.position.y}px)` : "none",
                      cursor: isExpanded ? (zoomState.isDragging ? "grabbing" : zoomState.scale > 1 ? "grab" : "zoom-in") : "pointer",
                    }}
                    onWheel={handleWheel}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onDoubleClick={handleDoubleClick}
                  />
                  {showRating && (
                    <ModalRatingContainer>
                      <StarRating rating={ratings[index].stars} onRate={(rating) => handleRating(index, rating)} />
                      <RatingTextModal>
                        {ratings[index].stars.toFixed(1)} ({ratings[index].count} ratings)
                      </RatingTextModal>
                      <ActionButtons>
                        <ActionButton onClick={() => handleDownload(img)}>
                          <FaDownload /> Descargar
                        </ActionButton>
                        <ActionButton onClick={() => handleShare(img)}>
                          <FaShareAlt /> Compartir
                        </ActionButton>
                      </ActionButtons>
                    </ModalRatingContainer>
                  )}
                </Carousel.Item>
              ))}
            </StyledCarousel>
          </CarouselContainer>
        </ModalBackdrop>
      </TransparentModal>
    </Container>
  );
}

// Estilos (los mismos que antes con algunas modificaciones)
const Container = styled.div`
  padding: 20px;
  min-height: 100vh;
`;

const ControlsContainer = styled.div`
  position: absolute;
  top: 15px;
  left: 15px;
  display: flex;
  gap: 10px;
  z-index: 10;
`;

const ControlButton = styled.button`
  background: rgba(0, 0, 0, 0.5);
  border: none;
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    background: rgba(0, 0, 0, 0.8);
    transform: scale(1.1);
  }

  ${({ isActive }) =>
    isActive &&
    `
    background: rgba(255, 255, 255, 0.2);
    box-shadow: 0 0 0 2px white;
  `}
`;

const GalleryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  grid-auto-rows: minmax(200px, auto);
  gap: 16px;
  padding: 16px;

  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }
`;

const GalleryItem = styled.div`
  position: relative;
  overflow: hidden;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.3s;
  padding-bottom: 125%;

  img {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  &:hover {
    transform: scale(1.02);
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 10px;
`;

const ActionButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  padding: 5px 10px;
  border-radius: 5px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  transition: background 0.3s;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`;

const RatingOverlay = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.7);
  padding: 8px;
  color: white;
  display: flex;
  justify-content: right;
`;

const StarRatingDisplay = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const RatingText = styled.span`
  font-size: 0.9rem;
  margin-left: 4px;
`;

const ModalRatingContainer = styled.div`
  position: absolute;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.7);
  padding: 10px 20px;
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const RatingTextModal = styled(RatingText)`
  font-size: 1rem;
  margin-top: 5px;
`;

const TransparentModal = styled(Modal)`
  .modal-content {
    background: transparent;
    border: none;
    box-shadow: none;
    overflow: visible;
  }
  .modal-dialog {
    max-width: none;
    margin: 0;
  }
  .modal-body {
    padding: 0;
  }
`;

const ModalBackdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, ${({ $isExpanded }) => ($isExpanded ? 0.9 : 0.7)});
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1040;
  cursor: ${({ $isExpanded }) => ($isExpanded ? "zoom-out" : "default")};
`;

const CarouselContainer = styled.div`
  max-width: ${({ $isExpanded }) => ($isExpanded ? "95vw" : "90vw")};
  max-height: ${({ $isExpanded }) => ($isExpanded ? "95vh" : "90vh")};
  border-radius: ${({ $isExpanded }) => ($isExpanded ? "0" : "15px")};
  overflow: hidden;
  transition: all 0.3s ease;
`;

const StyledCarousel = styled(Carousel)`
  .carousel-inner {
    border-radius: 15px;
  }
`;

const CarouselImage = styled.img`
  max-width: 100%;
  max-height: ${({ $isExpanded }) => ($isExpanded ? "none" : "90vh")};
  height: ${({ $isExpanded }) => ($isExpanded ? "auto" : "90vh")};
  object-fit: contain;
  display: block;
  margin: 0 auto;
  transition: transform 0.1s ease;
  transform-origin: center center;
  user-select: none;
  -webkit-user-drag: none;
`;
