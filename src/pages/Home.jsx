import styled from "styled-components";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../Auth/Api";
import { useSearch } from "../App";
import GalleryCard from "../components/GalleryCard";
import SkeletonGrid from "../components/SkeletonGrid";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";

const USE_LOCAL_IMAGES = false; 
const PAGE_SIZE = 40;

export function Home() {
  const navigate = useNavigate();
  const [images, setImages] = useState([]);
  const [isLoading, setIsLoading] = useState(!USE_LOCAL_IMAGES);
  const [error, setError] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [qualifications, setQualifications] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [showRecommendedSection, setShowRecommendedSection] = useState(true);
  const [recommendedImages, setRecommendedImages] = useState([]);
  const { search } = useSearch();
  const [recommendedLikedStatus, setRecommendedLikedStatus] = useState({});
  const [savedMap, setSavedMap] = useState({});
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const sentinelRef = useRef(null);
  const currentUserRef = useRef(null);

  const openDetail = (imageId) => {
    if (imageId != null) navigate(`/image/${imageId}`);
  };

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

  const fetchSavedStatus = async (userId) => {
    try {
      const response = await api.get(`/api/users/${userId}/saved-images`);
      const list = Array.isArray(response.data)
        ? response.data
        : response.data.saved_images || [];
      const savedIds = {};
      list.forEach((img) => {
        savedIds[img.image_id] = true;
      });
      setSavedMap(savedIds);
    } catch (err) {
      console.error("Error fetching saved status:", err);
    }
  };

  const handleToggleSave = async (imageId) => {
    try {
      if (savedMap[imageId]) {
        await api.delete(`/api/images/${imageId}/save`);
        setSavedMap((prev) => {
          const next = { ...prev };
          delete next[imageId];
          return next;
        });
        toast.info("Imagen removida de tu galería");
      } else {
        await api.put(`/api/images/${imageId}/save`);
        setSavedMap((prev) => ({ ...prev, [imageId]: true }));
        toast.success("Imagen guardada en tu galería");
      }
    } catch (err) {
      toast.error("Error al guardar imagen");
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

  const mapResults = (results) => ({
    imgs: results.map((img) => ({
      url: img.image_url,
      id: img.image_id || img._id || Math.random().toString(36).substr(2, 9),
      image_id: img.image_id,
      liked_by: img.liked_by || [],
      comments: (img.comments || []).map((comment) => ({
        id: comment.comment_id,
        userId: comment.user_id,
        userName: comment.username || String(comment.user_id),
        userImage: comment.user_image || "/static/user.png",
        text: comment.comment,
        createdAt: comment.created_at,
        parentCommentId: comment.parent_comment_id,
        likes: comment.likes,
        replies: comment.replies || [],
      })),
    })),
    quals: results.map((img) => ({
      qualification:
        typeof img.qualification === "number"
          ? img.qualification
          : (img.qualification && img.qualification.qualification) || 0,
      likes: img.interactions?.likes || 0,
      views: img.interactions?.views || 0,
    })),
  });

  const fetchPage = async (pageNo, append) => {
    const response = await api.get(
      `/api/images/search?q=${search}&page=${pageNo}&limit=${PAGE_SIZE}`
    );
    const results = response.data.results || [];
    const { imgs, quals } = mapResults(results);
    const user = currentUserRef.current;
    const favs = imgs.map((img) =>
      user && user.user_id
        ? img.liked_by.some((id) => String(id) === String(user.user_id))
        : false
    );

    if (append) {
      setImages((prev) => [...prev, ...imgs]);
      setQualifications((prev) => [...prev, ...quals]);
      setFavorites((prev) => [...prev, ...favs]);
    } else {
      setImages(imgs);
      setQualifications(quals);
      setFavorites(favs);
    }

    setHasMore(Boolean(response.data.has_next));
    setPage(pageNo);
    return results.length;
  };

  const loadImages = async () => {
    setIsLoading(true);
    setError(null);

    try {
      currentUserRef.current = await getCurrentUser();
      await fetchPage(1, false);
    } catch (err) {
      setError(err.message);
      toast.error("Error loading images");
    } finally {
      setIsLoading(false);
    }
  };

  const loadMoreImages = async () => {
    if (isLoadingMore || !hasMore || isLoading) return;
    setIsLoadingMore(true);
    try {
      await fetchPage(page + 1, true);
    } catch (err) {
      console.error("Error loading more images:", err);
    } finally {
      setIsLoadingMore(false);
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
      setQualifications(Array(localImages.length).fill(null));
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

  // Scroll infinito: cargar la siguiente página cuando se ve el sentinel
  useEffect(() => {
    if (USE_LOCAL_IMAGES) return;
    const sentinel = sentinelRef.current;
    if (!sentinel || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMoreImages();
      },
      { rootMargin: "800px 0px" }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, isLoadingMore, isLoading, page, search]);

  // Cargar usuario al iniciar
  useEffect(() => {
    const initUser = async () => {
      const userData = await getCurrentUser();
      if (userData?.user_id) {
        fetchSavedStatus(userData.user_id);
      }
    };
    initUser();
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
          <MasonryGrid>
            {recommendedImages.map((img, index) => {
              const mainIndex = images.findIndex(i => i.image_id === img.image_id);
              const isFav = mainIndex !== -1
                ? favorites[mainIndex]
                : (recommendedLikedStatus[img.image_id] || false);
              const recQualification = mainIndex !== -1
                ? qualifications[mainIndex]
                : null;

              return (
                <div className="col" key={`recommended-${img.id}-${index}`}>
                  <GalleryCard
                    img={img}
                    index={index}
                    isFavorite={isFav}
                    isSaved={savedMap[img.image_id]}
                    qualification={recQualification}
                    onOpen={() => openDetail(img.image_id)}
                    onToggleFavorite={() => {
                      if (mainIndex !== -1) {
                        sendInteraction(img.id, mainIndex);
                      } else {
                        sendRecommendedInteraction(img);
                      }
                    }}
                    onToggleSave={handleToggleSave}
                  />
                </div>
              );
            })}
          </MasonryGrid>
        </section>
      )}

      {images.length > 0 && (
        <section className="mb-5">
          {!search && <SectionTitle className="neon-section-title text-center neon-glow-text fw-semibold mb-4 pb-2">Todas las imágenes</SectionTitle>}
          <MasonryGrid>
            {images.map((img, index) => (
              <div key={img.id || img.image_id || index}>
                <GalleryCard
                  img={img}
                  index={index}
                  isFavorite={favorites[index]}
                  isSaved={savedMap[img.image_id]}
                  qualification={qualifications[index]}
                  onOpen={(id) => openDetail(id)}
                  onToggleFavorite={sendInteraction}
                  onToggleSave={handleToggleSave}
                />
              </div>
            ))}
          </MasonryGrid>
        </section>
      )}

      {hasMore && (
        <div ref={sentinelRef} className="d-flex justify-content-center py-4">
          {isLoadingMore && <LoadingSpinner />}
        </div>
      )}

    </div>
  );
}

const SectionTitle = styled.h2`
  font-size: 1.5rem;
`;

const MasonryGrid = styled.div`
  columns: 4;
  column-gap: 1rem;

  @media (max-width: 992px) {
    columns: 3;
  }
  @media (max-width: 768px) {
    columns: 2;
  }

  & > div {
    break-inside: avoid;
    margin-bottom: 1rem;
  }
`;



