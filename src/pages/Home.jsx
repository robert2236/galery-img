import styled from "styled-components";
import React, { useState, useRef, useEffect, useContext, useCallback, useMemo } from "react";
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
import { useSearch } from "../App";
import { ThemeContext } from "../App";
import GalleryCard from "../components/GalleryCard";
import SkeletonGrid from "../components/SkeletonGrid";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";

const USE_LOCAL_IMAGES = false; 

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
  const [currentUser, setCurrentUser] = useState(null);
  const [showRecommendedSection, setShowRecommendedSection] = useState(true);
  const [recommendedImages, setRecommendedImages] = useState([]);
  const { search } = useSearch();
  const [recommendedLikedStatus, setRecommendedLikedStatus] = useState({});

// Agrega esta función después de getCurrentUser()
const handleRecommendedShow = async (img, index) => {
  // Primero intenta encontrar en imágenes principales
  const mainIndex = images.findIndex(i => i.image_id === img.image_id);
  
  if (mainIndex !== -1) {
    // Si está en las imágenes principales, usa ese índice
    handleShow(mainIndex);
  } else {
    // Si NO está en las principales, agrega la imagen recomendada al array principal
    // temporalmente para mostrarla en el modal
    
    try {
      // Cargar datos completos de la imagen recomendada desde el backend
      const response = await api.get(`/api/images/${img.image_id}`);
      const fullImageData = {
        ...response.data,
        url: img.url || response.data.image_url,
        id: img.image_id,
        image_id: img.image_id,
        liked_by: response.data.liked_by || [],
        comments: response.data.comments || [],
        is_recommended: true
      };
      
      // Crear un array temporal con la imagen recomendada
      const tempImages = [fullImageData];
      
      // Usar el índice 0 (ya que es la única imagen en el array temporal)
      setSelectedImageIndex(0);
      setShow(true);
      
      // Opcional: Actualizar el estado de imágenes temporalmente
      // Esto permitirá que el modal funcione con todos los datos necesarios
      setImages(prev => [...prev, fullImageData]);
      setRatings(prev => [...prev, { stars: 0, count: 0 }]);
      setFavorites(prev => [...prev, false]);
      
    } catch (error) {
      console.error("Error al cargar imagen recomendada:", error);
      
      // Si falla la carga, crear una imagen básica con los datos disponibles
      const basicImageData = {
        url: img.url || img,
        id: img.image_id || img.id,
        image_id: img.image_id,
        liked_by: [],
        comments: [],
        is_recommended: true
      };
      
      const tempImages = [basicImageData];
      setSelectedImageIndex(0);
      setShow(true);
      
      // Actualizar estados
      setImages(prev => [...prev, basicImageData]);
      setRatings(prev => [...prev, { stars: 0, count: 0 }]);
      setFavorites(prev => [...prev, false]);
    }
  }
};



  const [zoomState, setZoomState] = useState({
    scale: 1,
    position: { x: 0, y: 0 },
    isDragging: false,
    startPos: { x: 0, y: 0 },
  });
  const imageRef = useRef(null);
  const [viewedImages, setViewedImages] = useState(new Set());

  const getCurrentUser = async () => {
    try {
      const userResponse = await api.get("/api/users");
      setCurrentUser(userResponse.data);
      return userResponse.data;
    } catch (error) {
      console.error("Error al obtener el usuario actual:", error);
      return null;
    }
  };

  const favoritesRef = useRef(favorites);
  favoritesRef.current = favorites;

  const sendInteraction = useCallback(async (imageId, index) => {
    const isCurrentlyFavorite = favoritesRef.current[index];

    try {
      if (!USE_LOCAL_IMAGES) {
        if (isCurrentlyFavorite) {
          await api.delete(`/api/images/${imageId}/likes/${currentUser.user_id}`);
        } else {
          await api.put(
            `/api/images/${imageId}/interactions/${currentUser.user_id}`,
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

      setFavorites(prev => {
        const updated = [...prev];
        updated[index] = !prev[index];
        return updated;
      });
    } catch (error) {
      console.error("Error al procesar tu like:", error);
      toast.error("Error al procesar tu like");
    }
  }, [currentUser]);

  const recommendedLikedRef = useRef(recommendedLikedStatus);
  recommendedLikedRef.current = recommendedLikedStatus;

  const sendRecommendedInteraction = useCallback(async (img) => {
    const isCurrentlyFavorite = recommendedLikedRef.current[img.image_id] || false;

    try {
      if (!USE_LOCAL_IMAGES) {
        if (isCurrentlyFavorite) {
          await api.delete(`/api/images/${img.id}/likes/${currentUser?.user_id}`);
        } else {
          await api.put(
            `/api/images/${img.id}/interactions/${currentUser?.user_id}`,
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

      setRecommendedLikedStatus((prev) => ({
        ...prev,
        [img.image_id]: !prev[img.image_id],
      }));
    } catch (error) {
      console.error("Error al procesar tu like en recomendada:", error);
      toast.error("Error al procesar tu like");
    }
  }, [currentUser]);

  const loadImages = async () => {
    setIsLoading(true);

    try {
      let allImages = [];
      let page = 1;
      let hasMore = true;

      while (hasMore) {
        const response = await api.get(
          `/api/images/search?q=${search}&page=${page}&limit=100`
        );
        const results = response.data.results || [];
        const imageData = results.map((img) => ({
          url: img.image_url,
          id: img.image_id || img._id || Math.random().toString(36).substr(2, 9),
          image_id: img.image_id,
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

        allImages = [...allImages, ...imageData];
        hasMore = response.data.has_next || results.length >= 100;
        page++;
      }

      setImages(allImages);
      setRatings(Array(allImages.length).fill({ stars: 0, count: 0 }));

      const userData = await getCurrentUser();
      const initialFavorites = allImages.map(
         (img) => userData && userData.user_id ? img.liked_by.some((id) => String(id) === String(userData.user_id)) : false
      );
      setFavorites(initialFavorites);
    } catch (err) {
      setError(err.message);
      toast.error("Error loading images");
    } finally {
      setIsLoading(false);
    }
  };
  const loadRecommendedImages = async () => {
    try {
      const userData = await getCurrentUser();

      if (userData && userData.user_id) {
        const recommendationsResponse = await api.get(
          `/api/recommend/${userData.user_id}?page=1&limit=10`
        );

        // Verificar la estructura de la respuesta
        let recommendations = [];
        
        if (recommendationsResponse.data.recommendations) {
          // Éxito: recomendaciones personalizadas
          recommendations = recommendationsResponse.data.recommendations;
        } else if (recommendationsResponse.data.fallback_recommendations) {
          // Fallback: imágenes populares
          recommendations = recommendationsResponse.data.fallback_recommendations;
        }

        if (recommendations.length > 0) {
          // Mapear las recomendaciones para que tengan la misma estructura que las imágenes
          const formattedRecommendations = recommendations.map((rec) => ({
            url: rec.image_url,
            id: rec.image_id || Math.random().toString(36).substr(2, 9),
            image_id: rec.image_id,
            is_recommended: true, // Marcar como recomendada
            liked_by: rec.liked_by || [],
          }));

          const initialRecLikedStatus = {};
          formattedRecommendations.forEach((rec) => {
            initialRecLikedStatus[rec.image_id] = userData && userData.user_id ? rec.liked_by.some((id) => String(id) === String(userData.user_id)) : false;
          });

          setRecommendedImages(formattedRecommendations);
          setRecommendedLikedStatus(initialRecLikedStatus);

          formattedRecommendations.forEach(async (rec) => {
            try {
              if (userData && userData.user_id) {
                const detailResponse = await api.get(`/api/images/${rec.image_id}`);
                const fullLikedBy = detailResponse.data.liked_by || [];
                const isLiked = fullLikedBy.some((id) => String(id) === String(userData.user_id));
                if (isLiked) {
                  setRecommendedLikedStatus((prev) => ({
                    ...prev,
                    [rec.image_id]: true
                  }));
                }
              }
            } catch (error) {
              console.log("Error loading detail for recommended image:", error);
            }
          });

          setShowRecommendedSection(true);
        } else {
          setShowRecommendedSection(false);
        }
      }
    } catch (recommendationError) {
      console.log("No hay recomendaciones disponibles:", recommendationError);
      setShowRecommendedSection(false);
    }
  };

  // Cargar datos iniciales
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
      await loadImages();
      await loadRecommendedImages();
    }
  };

  // Cargar datos cuando cambia la búsqueda
  useEffect(() => {
    initializeData();
  }, [search]);

  // Cargar usuario al iniciar
  useEffect(() => {
    getCurrentUser();
  }, []);

  // Enviar evento de vista cuando se abre el modal
  useEffect(() => {
    if (show && !USE_LOCAL_IMAGES) {
      const imageId = images[selectedImageIndex]?.id;
      if (imageId && !viewedImages.has(imageId)) {
        api.put(`/api/images/${imageId}/interactions/${currentUser.user_id}`, {
          action: "views",
          increment: 1,
        });
        setViewedImages((prev) => new Set(prev).add(imageId));
      }
    }
  }, [show, selectedImageIndex, images, viewedImages, currentUser]);

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
  const fetchComments = async (imageId, signal) => {
    if (USE_LOCAL_IMAGES) return;

    try {
      const response = await api.get(`/api/images/${imageId}/comments`, { signal });
      if (signal?.aborted) return;
      setImageComments((prev) => ({
        ...prev,
        [imageId]: response.data,
      }));
    } catch (error) {
      if (error.name !== "CanceledError" && error.name !== "AbortError") {
        console.error("Error al cargar comentarios:", error);
      }
    }
  };

  // Cargar comentarios cuando se abre el modal y se selecciona una imagen
  useEffect(() => {
    if (!show || USE_LOCAL_IMAGES) return;

    const abortController = new AbortController();

    const imageId = images[selectedImageIndex]?.id;
    if (imageId) {
      fetchComments(imageId, abortController.signal);
    }

    return () => abortController.abort();
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

  const handleClose = useCallback(() => {
    setShow(false);
    setShowRating(false);
    setIsExpanded(false);
    setShowComments(false);
  }, []);

  const handleShow = useCallback((_imageId, index) => {
    setSelectedImageIndex(index);
    setShow(true);
  }, []);

  const handleCommentSubmit = async () => {
    if (!commentText.trim() || isSubmittingComment) return;

    const imageId = images[selectedImageIndex]?.id;
    if (!imageId) return;

    setIsSubmittingComment(true);

    try {
      const response = await api.put(`/api/images/${imageId}/comments`, {
        comment: commentText.trim(),
        parent_comment_id: null,
      });

      setCommentText("");

      // Actualizar estado local inmediatamente
      const newComment = {
        id: response.data.comment_id,
        userId: currentUser.user_id,
        text: commentText.trim(),
        createdAt: new Date().toISOString(),
        parentCommentId: null,
        likes: 0,
        replies: [],
      };

      setImages((prevImages) =>
        prevImages.map((img, idx) =>
          idx === selectedImageIndex
            ? {
                ...img,
                comments: [...(img.comments || []), newComment],
              }
            : img
        )
      );

      // También actualizar los comentarios en el estado imageComments
      setImageComments((prev) => ({
        ...prev,
        [imageId]: [...(prev[imageId] || []), newComment],
      }));

      toast.success("Comentario enviado correctamente");
    } catch (error) {
      console.error("Error al enviar comentario:", error);
      if (error.response?.status === 400) {
        toast.error(error.response.data.detail || "Error al enviar comentario");
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
        if (imageId && currentUser) {
          await api.put(`/api/images/${imageId}/interactions/${currentUser.user_id}`, {
            action: "downloads",
            increment: 1,
          });
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
        if (imageId && currentUser) {
          await api.put(`/api/images/${imageId}/interactions/${currentUser.user_id}`, {
            action: "shares",
            increment: 1,
          });
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
    if (imageId && !USE_LOCAL_IMAGES && currentUser) {
      api.put(`/api/images/${imageId}/interactions/${currentUser.user_id}`, {
        action: "ratings",
        increment: 1,
        rating_value: rating,
      });
    }
  };

  const isDraggingRef = useRef(false);
  const zoomStateRef = useRef(zoomState);
  zoomStateRef.current = zoomState;

  const handleWheel = useCallback((e) => {
    e.preventDefault();
    const delta = -e.deltaY;
    const newScale = zoomStateRef.current.scale + delta * 0.001;
    setZoomState((prev) => ({
      ...prev,
      scale: Math.max(1, Math.min(newScale, 3)),
    }));
  }, []);

  const handleMouseDown = useCallback((e) => {
    setZoomState((prev) => {
      if (prev.scale === 1) return prev;
      isDraggingRef.current = true;
      return {
        ...prev,
        isDragging: true,
        startPos: {
          x: e.clientX - prev.position.x,
          y: e.clientY - prev.position.y,
        },
      };
    });
  }, []);

  useEffect(() => {
    if (!isExpanded) {
      isDraggingRef.current = false;
      return;
    }

    const handleMouseMove = (e) => {
      if (!isDraggingRef.current) return;
      setZoomState((prev) => {
        if (!prev.isDragging) return prev;
        return {
          ...prev,
          position: {
            x: e.clientX - prev.startPos.x,
            y: e.clientY - prev.startPos.y,
          },
        };
      });
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
      setZoomState((prev) => ({
        ...prev,
        isDragging: false,
      }));
    };

    const handleWheelDoc = (e) => {
      handleWheel(e);
    };

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsExpanded(false);
      }
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("wheel", handleWheelDoc, { passive: false });
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("wheel", handleWheelDoc);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isExpanded, handleWheel]);

  const handleDoubleClick = useCallback(() => {
    setZoomState((prev) => ({
      ...prev,
      scale: prev.scale === 1 ? 2 : 1,
      position: { x: 0, y: 0 },
    }));
  }, []);

  if (!USE_LOCAL_IMAGES && isLoading) {
    return <SkeletonGrid count={8} />;
  }

  if (!USE_LOCAL_IMAGES && error) {
    return <ErrorState message={error} onRetry={loadImages} />;
  }

  if (images.length === 0) {
    return <EmptyState ctaPath="/upload" ctaLabel="Subir imagen" isSearch={!!search} />;
  }

  return (
    <div className="px-3 py-4" style={{ minHeight: "100vh" }}>
      {!search && showRecommendedSection && recommendedImages.length > 0 && (
        <section className="mb-5">
          <SectionTitle className="neon-section-title text-center neon-glow-text fw-semibold mb-4 pb-2">Quizás te interese</SectionTitle>
          <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
            {recommendedImages.map((img, index) => {
              const mainIndex = images.findIndex(i => i.image_id === img.image_id);
              const isFav = mainIndex !== -1
                ? favorites[mainIndex]
                : (recommendedLikedStatus[img.image_id] || false);
              const recRating = mainIndex !== -1
                ? ratings[mainIndex]
                : { stars: 0, count: 0 };

              return (
                <div className="col" key={`recommended-${img.id}-${index}`}>
                  <GalleryCard
                    img={img}
                    index={index}
                    isFavorite={isFav}
                    rating={recRating}
                    onOpen={() => handleRecommendedShow(img, index)}
                    onToggleFavorite={() => {
                      if (mainIndex !== -1) {
                        sendInteraction(img.id, mainIndex);
                      } else {
                        sendRecommendedInteraction(img);
                      }
                    }}
                  />
                </div>
              );
            })}
          </div>
        </section>
      )}

      {images.length > 0 && (
        <section className="mb-5">
          {!search && <SectionTitle className="neon-section-title text-center neon-glow-text fw-semibold mb-4 pb-2">Todas las imágenes</SectionTitle>}
          <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
            {images.map((img, index) => (
              <div className="col" key={img.id || img.image_id || index}>
                <GalleryCard
                  img={img}
                  index={index}
                  isFavorite={favorites[index]}
                  rating={ratings[index]}
                  onOpen={handleShow}
                  onToggleFavorite={sendInteraction}
                />
              </div>
            ))}
          </div>
        </section>
      )}

      <TransparentModal show={show} onHide={handleClose} centered size="xl">
        <ModalBackdrop
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              handleClose();
            }
          }}
          $isExpanded={isExpanded}
        >
          <ModalContentWrapper
            $showComments={showComments}
            $isExpanded={isExpanded}
          >
              <CarouselContainer
                className="modal-carousel"
                onClick={(e) => e.stopPropagation()}
                $isExpanded={isExpanded}
                $showComments={showComments}
              >
              <StyledCarousel
                activeIndex={selectedImageIndex}
                onSelect={setSelectedImageIndex}
                interval={null}
              >
                {images.map((img, index) => (
                  <Carousel.Item key={index}>
                    <div className="d-flex justify-content-between align-items-center mb-3 position-relative z-3">
                      <div className="d-flex gap-2">
                        <button
                          className="btn btn-dark rounded-circle p-2 d-flex align-items-center justify-content-center"
                          style={{ width: 36, height: 36 }}
                          onClick={handleExpand}
                        >
                          {isExpanded ? <FaCompress /> : <FaExpand />}
                        </button>
                        <button
                          className={`btn rounded-circle p-2 d-flex align-items-center justify-content-center ${showRating ? "btn-light" : "btn-dark"}`}
                          style={{ width: 36, height: 36 }}
                          onClick={() => setShowRating(!showRating)}
                        >
                          <FaEllipsisH />
                        </button>
                        <button
                          className={`btn rounded-circle p-2 d-flex align-items-center justify-content-center ${showComments ? "btn-light" : "btn-dark"}`}
                          style={{ width: 36, height: 36 }}
                          onClick={() => setShowComments(!showComments)}
                        >
                          <FaComment />
                        </button>
                        <button
                          className="btn btn-dark rounded-circle p-2 d-flex align-items-center justify-content-center"
                          style={{ width: 36, height: 36 }}
                          onClick={() => handleDownload(img.url || img, index)}
                        >
                          <FaDownload />
                        </button>
                      </div>
                      <button
                        className="btn btn-dark rounded-circle p-2 d-flex align-items-center justify-content-center position-absolute"
                        style={{ right: 0, width: 36, height: 36 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          sendInteraction(img.id, index);
                        }}
                      >
                        {favorites[index] ? (
                          <FaHeart style={{ color: "#ff4d6d", fontSize: "1.2rem" }} />
                        ) : (
                          <FaRegHeart style={{ color: "#fff", fontSize: "1.2rem" }} />
                        )}
                      </button>
                    </div>

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
                      onMouseDown={handleMouseDown}
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
                        <div className="d-flex gap-2 mt-2">
                          <button
                            className="btn btn-outline-light btn-sm d-flex align-items-center gap-1 rounded-pill px-3"
                            onClick={() => handleDownload(img.url || img, index)}
                          >
                            <FaDownload className="me-1" /> Descargar
                          </button>
                          <button
                            className="btn btn-outline-light btn-sm d-flex align-items-center gap-1 rounded-pill px-3"
                            onClick={() => handleShare(img.url || img, index)}
                          >
                            <FaShareAlt className="me-1" /> Compartir
                          </button>
                        </div>
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
                <button
                  className="btn btn-sm btn-outline-light rounded-circle d-flex align-items-center justify-content-center p-1"
                  style={{ width: 28, height: 28 }}
                  onClick={() => setShowComments(false)}
                >
                  <FaTimes />
                </button>
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
                <button
                  className="btn btn-primary w-100 rounded-3 fw-medium"
                  onClick={handleCommentSubmit}
                  disabled={!commentText.trim() || isSubmittingComment}
                >
                  {isSubmittingComment ? "Enviando..." : "Comentar"}
                </button>
              </CommentForm>
            </CommentsPanel>
          )}
        </ModalBackdrop>
      </TransparentModal>
    </div>
  );
}

const SectionTitle = styled.h2`
  font-size: 1.5rem;
`;

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


