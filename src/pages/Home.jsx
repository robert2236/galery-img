import styled from "styled-components";
import React, { useState, useRef, useEffect } from "react";
import { Modal, Carousel } from "react-bootstrap";
import {
  FaStar,
  FaRegStar,
  FaHeart,
  FaRegHeart,
  FaComment,
} from "react-icons/fa";
import { FaDownload, FaShareAlt } from "react-icons/fa";
import { toast } from "react-toastify";
import { FaExpand, FaEllipsisH, FaCompress, FaTimes } from "react-icons/fa";
import axios from "axios";
import api from "../Auth/Api";

const USE_LOCAL_IMAGES = false; // true para imágenes locales, false para endpoint API

export function Home() {
  const [images, setImages] = useState([]);
  const [isLoading, setIsLoading] = useState(!USE_LOCAL_IMAGES);
  const [error, setError] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [show, setShow] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showRating, setShowRating] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [imageComments, setImageComments] = useState({});
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [currentUsername, setCurrentUsername] = useState(null);
  console.log(images);

  const [zoomState, setZoomState] = useState({
    scale: 1,
    position: { x: 0, y: 0 },
    isDragging: false,
    startPos: { x: 0, y: 0 },
  });
  const imageRef = useRef(null);
  const [viewedImages, setViewedImages] = useState(new Set());

  const getCurrentUsername = async () => {
    try {
      const userResponse = await api.get("/api/users");
      return userResponse.data.username;
    } catch (error) {
      toast.error("Error al obtener el usuario actual:", error);
      return null;
    }
  };

  const sendInteraction = async (imageId, action, index) => {
    const isCurrentlyFavorite = favorites[index];

    try {
      if (!USE_LOCAL_IMAGES && action == "likes") {
        if (isCurrentlyFavorite) {
          await api.delete(`/api/images/${imageId}/likes`);
        } else {
          await api.put(
            `/api/images/${imageId}/interactions`,
            {
              action: "likes",
              increment: 1,
            },
            {
              headers: {
                "Content-Type": "application/json",
              },
            }
          );
        }
      }

      // Actualizar estado local inmediatamente
      const newFavorites = [...favorites];
      newFavorites[index] = !isCurrentlyFavorite;
      setFavorites(newFavorites);
    } catch (error) {
      toast.error("Error al procesar tu like");
    }
  };

  // Cargar imágenes según la configuración
  const initializeData = async () => {
    if (USE_LOCAL_IMAGES) {
      const localImages = Object.values(
        import.meta.glob("../images/*.{png,jpg,jpeg,webp,gif}", {
          eager: true,
          as: "url",
        })
      );
      setImages(localImages);
      setRatings(Array(localImages.length).fill({ stars: 0, count: 0 }));
      setFavorites(Array(localImages.length).fill(false));
    } else {
      try {
        // Obtener usuario actual primero
        const username = await getCurrentUsername();
        setCurrentUsername(username);

        // Luego cargar imágenes
        const response = await axios.get("/api/images");
        const imageData = response.data.map((img) => ({
          url: img.image_url,
          id:
            img.image_id || img._id || Math.random().toString(36).substr(2, 9),
          liked_by: img.liked_by || [],
          comments: (img.comments || []).map((comment) => ({
            id: comment.comment_id,
            userId: comment.user_id,
            text: comment.comment,
            createdAt: comment.created_at,
            parentCommentId: comment.parent_comment_id,
            likes: comment.likes,
            replies: comment.replies || [],
          })),
        }));

        setImages(imageData);
        setRatings(Array(imageData.length).fill({ stars: 0, count: 0 }));

        // Inicializar favoritos basado en si el usuario actual ha dado like
        const initialFavorites = imageData.map(
          (img) => username && img.liked_by.includes(username)
        );
        setFavorites(initialFavorites);
      } catch (err) {
        setError(err.message);
        toast.error("Error loading images");
      } finally {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    initializeData();
  }, []);

  // Enviar evento de vista cuando se abre el modal
  useEffect(() => {
    if (show && !USE_LOCAL_IMAGES) {
      const imageId = images[selectedImageIndex]?.id;
      if (imageId && !viewedImages.has(imageId)) {
        sendInteraction(imageId, "views", 1);
        setViewedImages((prev) => new Set(prev).add(imageId));
      }
    }
  }, [show, selectedImageIndex, images, viewedImages]);

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

  // Función para cargar comentarios de una imagen
  const fetchComments = async (imageId) => {
    if (USE_LOCAL_IMAGES) return;

    try {
      setTimeout(() => {
        setImageComments((prev) => ({
          ...prev,
          [imageId]: [
            {
              comment_id: 1,
              user_id: "usuario1",
              comment: "¡Qué imagen tan increíble! Me encanta la composición.",
              created_at: new Date(Date.now() - 86400000).toISOString(),
              parent_comment_id: null,
              likes: 3,
              replies: [],
            },
            {
              comment_id: 2,
              user_id: "usuario2",
              comment:
                "Los colores son realmente vibrantes. ¿Qué cámara usaste?",
              created_at: new Date(Date.now() - 43200000).toISOString(),
              parent_comment_id: null,
              likes: 1,
              replies: [],
            },
          ],
        }));
      }, 500);
    } catch (error) {
      console.error("Error al cargar comentarios:", error);
    }
  };

  // Cargar comentarios cuando se abre el modal y se selecciona una imagen
  useEffect(() => {
    if (show && !USE_LOCAL_IMAGES) {
      const imageId = images[selectedImageIndex]?.id;
      if (imageId) {
        fetchComments(imageId);
      }
    }
  }, [show, selectedImageIndex, images]);

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
    setShowComments(false);
  };

  const handleShow = (index) => {
    setSelectedImageIndex(index);
    setShow(true);
  };

  const handleCommentSubmit = async () => {
    if (!commentText.trim() || isSubmittingComment) return;

    const imageId = images[selectedImageIndex]?.id;
    if (!imageId) return;

    setIsSubmittingComment(true);

    try {
      // Enviar comentario
      const response = await api.put(`/api/images/${imageId}/comments`, {
        comment: commentText.trim(),
        parent_comment_id: null,
      });

      setCommentText("");

      // Actualizar estado local inmediatamente
      const newComment = {
        id: response.data.comment_id,
        userId: currentUsername,
        text: commentText.trim(),
        createdAt: new Date().toISOString(),
        parentCommentId: null,
        likes: 0,
        replies: [],
      };

      // Actualizar los comentarios de la imagen actual
      setImages((prevImages) =>
        prevImages.map((img, index) =>
          index === selectedImageIndex
            ? {
                ...img,
                comments: [...(img.comments || []), newComment],
              }
            : img
        )
      );

      setImageComments((prev) => ({
        ...prev,
        [imageId]: [...(prev[imageId] || []), newComment],
      }));
    } catch (error) {
      console.error("Error al enviar comentario:", error);
      if (error.response?.status === 400) {
        toast.error(error.response.data.detail || "Error al enviar comentario");
      } else {
        toast.error("Error al enviar comentario");
      }
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleDownload = async (imageUrl, index) => {
    try {
      if (USE_LOCAL_IMAGES) {
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `image-${index + 1}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } else {
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `image-${index + 1}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        const imageId = images[index]?.id;
        if (imageId) {
          await sendInteraction(imageId, "downloads", 1);
        }
      }
      toast.success("Descarga iniciada");
    } catch (error) {
      console.error("Error al descargar:", error);
      toast.error("Error downloading image");
    }
  };

  const handleShare = async (imageUrl, index) => {
    try {
      if (USE_LOCAL_IMAGES) {
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
      } else {
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const file = new File([blob], "image.jpg", { type: blob.type });

        if (navigator.share && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: "Mira esta imagen",
            text: "¡Echa un vistazo a esta imagen!",
            files: [file],
          });
        } else {
          const reader = new FileReader();
          reader.onload = (e) => {
            const base64 = e.target.result;
            navigator.clipboard.writeText(base64);
            toast.success("¡Imagen copiada al portapapeles!");
          };
          reader.readAsDataURL(blob);
        }

        const imageId = images[index]?.id;
        if (imageId) {
          await sendInteraction(imageId, "shares", 1);
        }
      }
    } catch (error) {
      console.error("Error al compartir:", error);
      toast.error("Error al compartir");
    }
  };

  const handleRating = (index, rating) => {
    const newRatings = [...ratings];
    const currentRating = newRatings[index];

    newRatings[index] = {
      stars:
        (currentRating.stars * currentRating.count + rating) /
        (currentRating.count + 1),
      count: currentRating.count + 1,
    };

    setRatings(newRatings);
    setShowRating(false);

    // Enviar interacción de rating
    const imageId = images[index]?.id;
    if (imageId && !USE_LOCAL_IMAGES) {
      sendInteraction(imageId, "ratings", 1);
    }
  };

  const StarRating = ({ rating, onRate }) => {
    const stars = [];
    const fullStars = Math.round(rating);

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(
          <FaStar
            key={i}
            onClick={() => onRate(i)}
            style={{ color: "#ffc107", cursor: "pointer", fontSize: "1.5rem" }}
          />
        );
      } else {
        stars.push(
          <FaRegStar
            key={i}
            onClick={() => onRate(i)}
            style={{ color: "#ffc107", cursor: "pointer", fontSize: "1.5rem" }}
          />
        );
      }
    }

    return <div style={{ display: "flex", gap: "5px" }}>{stars}</div>;
  };

  const handleWheel = (e) => {
    if (!isExpanded) return;

    e.preventDefault();
    const delta = -e.deltaY;
    const newScale = zoomState.scale + delta * 0.001;
    setZoomState((prev) => ({
      ...prev,
      scale: Math.max(1, Math.min(newScale, 3)),
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

  if (!USE_LOCAL_IMAGES && isLoading) {
    return <LoadingContainer>Loading images...</LoadingContainer>;
  }

  if (!USE_LOCAL_IMAGES && error) {
    return <ErrorContainer>Error: {error}</ErrorContainer>;
  }

  if (images.length === 0) {
    return <EmptyContainer>No images found</EmptyContainer>;
  }

  return (
    <Container className="mt-3">
      <GalleryGrid>
        {images.map((img, index) => (
          <GalleryItem
            className="mb-3"
            key={index}
            onClick={() => handleShow(index)}
          >
            <img
              src={img.url || img}
              alt={`Imagen ${index + 1}`}
              loading="lazy"
            />
            <RatingOverlay>
              <LeftSection>
                <FavoriteIcon
                  onClick={(e) => {
                    e.stopPropagation();
                    sendInteraction(img.id, "likes", index);
                  }}
                >
                  {favorites[index] ? (
                    <FaHeart style={{ color: "#ff4d6d", fontSize: "1.2rem" }} />
                  ) : (
                    <FaRegHeart style={{ color: "#fff", fontSize: "1.2rem" }} />
                  )}
                </FavoriteIcon>
              </LeftSection>

              <RightSection>
                <StarRatingDisplay>
                  <FaStar style={{ color: "#ffc107" }} />
                  <RatingText>
                    {ratings[index]?.stars?.toFixed(1) || "0.0"} (
                    {ratings[index]?.count || 0})
                  </RatingText>
                </StarRatingDisplay>
              </RightSection>
            </RatingOverlay>
          </GalleryItem>
        ))}
      </GalleryGrid>

      <TransparentModal show={show} onHide={handleClose} centered size="xl">
        <ModalBackdrop onClick={handleClose} $isExpanded={isExpanded}>
          <ModalContentWrapper
            $showComments={showComments}
            $isExpanded={isExpanded}
          >
            <CarouselContainer
            className="modal-carousel"
              onClick={(e) => e.stopPropagation()}
              $isExpanded={isExpanded}
              $showComments={showComments}
              onMouseLeave={handleMouseUp}
            >
              <StyledCarousel
                activeIndex={selectedImageIndex}
                onSelect={setSelectedImageIndex}
                interval={null}
                
              >
                {images.map((img, index) => (
                  <Carousel.Item key={index}>
                    <ModalControlsContainer>
                      <ControlsContainer>
                        <ControlButton onClick={handleExpand}>
                          {isExpanded ? <FaCompress /> : <FaExpand />}
                        </ControlButton>
                        <ControlButton
                          onClick={() => setShowRating(!showRating)}
                          isActive={showRating}
                        >
                          <FaEllipsisH />
                        </ControlButton>
                        <ControlButton
                          onClick={() => setShowComments(!showComments)}
                          isActive={showComments}
                        >
                          <FaComment />
                        </ControlButton>
                        <ControlButton
                          onClick={() => handleDownload(img.url || img, index)}
                        >
                          <FaDownload />
                        </ControlButton>
                      </ControlsContainer>
                      <FavoriteButton
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          sendInteraction(img.id, "likes", index);
                        }}
                      >
                        {favorites[index] ? (
                          <FaHeart
                            style={{ color: "#ff4d6d", fontSize: "1.2rem" }}
                          />
                        ) : (
                          <FaRegHeart
                            style={{ color: "#fff", fontSize: "1.2rem" }}
                          />
                        )}
                      </FavoriteButton>
                    </ModalControlsContainer>

                    <CarouselImage
                      ref={imageRef}
                      src={img.url || img}
                      alt=""
                      $isExpanded={isExpanded}
                      $showComments={showComments}
                      style={{
                        transform: isExpanded
                          ? `scale(${zoomState.scale}) translate(${zoomState.position.x}px, ${zoomState.position.y}px)`
                          : "none",
                        cursor: isExpanded
                          ? zoomState.isDragging
                            ? "grabbing"
                            : zoomState.scale > 1
                            ? "grab"
                            : "zoom-in"
                          : "pointer",
                      }}
                      onWheel={handleWheel}
                      onMouseDown={handleMouseDown}
                      onMouseMove={handleMouseMove}
                      onMouseUp={handleMouseUp}
                      onDoubleClick={handleDoubleClick}
                    />

                    {showRating && (
                      <ModalRatingContainer>
                        <StarRating
                          rating={ratings[index]?.stars || 0}
                          onRate={(rating) => handleRating(index, rating)}
                        />
                        <RatingTextModal>
                          {ratings[index]?.stars?.toFixed(1) || "0.0"} (
                          {ratings[index]?.count || 0} ratings)
                        </RatingTextModal>
                        <ActionButtons>
                          <ActionButton
                            onClick={() =>
                              handleDownload(img.url || img, index)
                            }
                          >
                            <FaDownload /> Descargar
                          </ActionButton>
                          <ActionButton
                            onClick={() => handleShare(img.url || img, index)}
                          >
                            <FaShareAlt /> Compartir
                          </ActionButton>
                        </ActionButtons>
                      </ModalRatingContainer>
                    )}
                  </Carousel.Item>
                ))}
              </StyledCarousel>
            </CarouselContainer>
          </ModalContentWrapper>
          {/* Panel de comentarios fuera de la imagen */}
          {showComments && (
            <CommentsPanel $showComments={showComments}>
              <CommentsHeader>
                <h5>Comentarios</h5>
                <CloseButton onClick={() => setShowComments(false)}>
                  <FaTimes />
                </CloseButton>
              </CommentsHeader>

              <CommentsList>
                {images[selectedImageIndex]?.comments?.length > 0 ? (
                  images[selectedImageIndex].comments.map((comment) => (
                    <CommentItem key={comment.id}>
                      <CommentAuthor>{comment.userId}</CommentAuthor>
                      <CommentText>{comment.text}</CommentText>
                      <CommentDate>
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </CommentDate>
                    </CommentItem>
                  ))
                ) : (
                  <NoComments>No hay comentarios aún</NoComments>
                )}
              </CommentsList>
              <CommentForm>
                <CommentInput
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Escribe un comentario..."
                  maxLength={500}
                  disabled={isSubmittingComment}
                />
                <CommentCharCount>{commentText.length}/500</CommentCharCount>
                <CommentButton
                  onClick={handleCommentSubmit}
                  disabled={!commentText.trim() || isSubmittingComment}
                >
                  {isSubmittingComment ? "Enviando..." : "Comentar"}
                </CommentButton>
              </CommentForm>
            </CommentsPanel>
          )}
        </ModalBackdrop>
      </TransparentModal>
    </Container>
  );
}

// Estilos para el sistema de comentarios
// Estilos para el sistema de comentarios - ACTUALIZADO para versión móvil
const CommentsPanel = styled.div`
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

  /* Para desktop: se muestra a la derecha */
  ${({ $showComments }) =>
    $showComments &&
    `
    right: 0;
  `}

  @media (max-width: 768px) {
    /* Para móviles: se muestra debajo ocupando todo el ancho */
    width: 100%;
    height: 50vh;
    top: auto;
    bottom: 0;
    right: 0;
    left: 0;
    border-left: none;
    border-top: 1px solid rgba(255, 255, 255, 0.2);
    transform: translateY(100%);

    ${({ $showComments }) =>
      $showComments &&
      `
      transform: translateY(0);
    `}
  }

  @media (max-width: 576px) {
    height: 60vh;
    padding: 12px;
  }
`;

const ModalContentWrapper = styled.div`
  position: relative;
  display: flex;
  max-width: ${({ $isExpanded, $showComments }) =>
    $showComments
      ? `calc(${$isExpanded ? "95vw" : "90vw"} + 400px)`
      : $isExpanded
      ? "95vw"
      : "90vw"};
  max-height: ${({ $isExpanded }) => ($isExpanded ? "95vh" : "90vh")};
  transition: all 0.3s ease;

  @media (max-width: 768px) {
    max-width: ${({ $isExpanded }) => ($isExpanded ? "95vw" : "90vw")};
    max-height: ${({ $showComments }) => ($showComments ? "50vh" : "90vh")};
  }
`;

const CarouselContainer = styled.div`
  max-width: ${({ $isExpanded, $showComments }) =>
    $showComments
      ? `calc(${$isExpanded ? "95vw" : "90vw"} - 400px)`
      : $isExpanded
      ? "95vw"
      : "90vw"};
  max-height: ${({ $isExpanded }) => ($isExpanded ? "95vh" : "90vh")};
  border-radius: ${({ $isExpanded }) => ($isExpanded ? "0" : "15px")};
  overflow: hidden;
  transition: all 0.3s ease;

  @media (max-width: 768px) {
    max-width: ${({ $isExpanded }) => ($isExpanded ? "95vw" : "90vw")};
    max-height: ${({ $showComments }) => ($showComments ? "50vh" : "90vh")};
  }
`;

const CarouselImage = styled.img`
  max-width: 100%;
  max-height: ${({ $isExpanded }) => ($isExpanded ? "none" : "90vh")};
  height: ${({ $isExpanded }) => ($isExpanded ? "auto" : "90vh")};
  object-fit: contain;
  display: block;
  margin: 0 auto;
  border-radius: 15px;
  transition: transform 0.1s ease;
  transform-origin: center center;
  user-select: none;
  -webkit-user-drag: none;

  @media (max-width: 768px) {
    max-height: ${({ $isExpanded, $showComments }) =>
      $showComments ? "90vh" : $isExpanded ? "90vh" : "90vh"};
    height: ${({ $isExpanded, $showComments }) =>
      $showComments ? "100%" : $isExpanded ? "100%" : "100%"};
    border-radius: 15px;
  }
`;

// El resto de los estilos se mantienen igual...
const CommentsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  font-size: 1.2rem;

  &:hover {
    color: #ccc;
  }
`;

const CommentsList = styled.div`
  flex: 1;
  overflow-y: auto;
  margin-bottom: 15px;
`;

const CommentItem = styled.div`
  padding: 10px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const CommentAuthor = styled.div`
  font-weight: bold;
  font-size: 0.9rem;
  margin-bottom: 5px;
`;

const CommentText = styled.p`
  margin: 0;
  font-size: 0.95rem;
  line-height: 1.4;
`;

const CommentDate = styled.div`
  font-size: 0.8rem;
  color: #aaa;
  margin-top: 5px;
`;

const NoComments = styled.div`
  text-align: center;
  color: #aaa;
  padding: 20px 0;
`;

const CommentForm = styled.div`
  margin-top: auto;
`;

const CommentInput = styled.textarea`
  width: 100%;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  color: white;
  padding: 10px;
  resize: vertical;
  min-height: 80px;
  margin-bottom: 5px;

  &:focus {
    outline: none;
    border-color: rgba(255, 255, 255, 0.4);
  }

  &:disabled {
    opacity: 0.6;
  }
`;

const CommentCharCount = styled.div`
  font-size: 0.8rem;
  text-align: right;
  color: #aaa;
  margin-bottom: 10px;
`;

const CommentButton = styled.button`
  width: 100%;
  background: ${(props) => (props.disabled ? "#555" : "#4267B2")};
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 12px;
  cursor: ${(props) => (props.disabled ? "not-allowed" : "pointer")};

  &:hover {
    background: ${(props) => (props.disabled ? "#555" : "#365899")};
  }
`;

// Estilos existentes (se mantienen igual)
const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  font-size: 1.5rem;
`;

const ErrorContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  font-size: 1.5rem;
  color: red;
`;

const EmptyContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  font-size: 1.5rem;
`;

const FavoriteIcon = styled.div`
  position: absolute;
  top: 4px;
  left: 8px;
  bottom: 8px;
  cursor: pointer;
  z-index: 2;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: rgba(0, 0, 0, 0.7);
    transform: scale(1.1);
  }
`;

const FavoriteButton = styled.button`
  position: absolute;
  right: 15px;
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
  z-index: 10;
  transition: all 0.3s;

  &:hover {
    background: rgba(0, 0, 0, 0.8);
    transform: scale(1.1);
  }
`;

const ModalControlsContainer = styled.div`
  position: absolute;
  top: 15px;
  left: 15px;
  right: 15px;
  display: flex;
  justify-content: space-between;
  z-index: 10;
`;

const Container = styled.div`
  min-height: 100vh;
`;

const ControlsContainer = styled.div`
  display: flex;
  gap: 10px;
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
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
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

const LeftSection = styled.div`
  display: flex;
  align-items: center;
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
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
  justify-content: space-between;
  align-items: center;
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
  background-color: rgba(
    0,
    0,
    0,
    ${({ $isExpanded }) => ($isExpanded ? 0.9 : 0.7)}
  );
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1040;
  cursor: ${({ $isExpanded }) => ($isExpanded ? "zoom-out" : "default")};
`;

const StyledCarousel = styled(Carousel)`
  .carousel-inner {
    border-radius: 15px;
  }
`;
