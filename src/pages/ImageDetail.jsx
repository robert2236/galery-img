import React, { useState, useEffect, useCallback, useContext, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import styled from "styled-components";
import { toast } from "react-toastify";
import {
  FaArrowLeft,
  FaHeart,
  FaRegHeart,
  FaBookmark,
  FaRegBookmark,
  FaDownload,
  FaShareAlt,
  FaStar,
  FaRegStar,
  FaImages,
} from "react-icons/fa";
import api from "../Auth/Api";
import { ThemeContext } from "../App";
import { imgSrc } from "../utils/imgSrc";
import { searchSimilarImages } from "../services/vectorSearch";
import LoadingSpinner from "../components/LoadingSpinner";

export const ImageDetail = () => {
  const { image_id } = useParams();
  const navigate = useNavigate();
  const { theme } = useContext(ThemeContext);
  const isDark = theme === "dark";

  const [image, setImage] = useState(null);
  const [profile, setProfile] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [commentText, setCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [similar, setSimilar] = useState([]);
  const [similarLoading, setSimilarLoading] = useState(true);
  const [userLoaded, setUserLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const viewCountedRef = useRef(false);
  const numericId = Number(image_id);

  const isLiked =
    !!currentUser &&
    (image?.liked_by || []).some((id) => String(id) === String(currentUser.user_id));

  const loadDetail = useCallback(async () => {
    if (!Number.isFinite(numericId)) {
      setError("Imagen no encontrada");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/api/images/${numericId}`);
      setImage(response.data);

      if (response.data?.user_id != null) {
        api
          .get(`/api/users/${response.data.user_id}/profile`)
          .then((res) => setProfile(res.data))
          .catch(() => setProfile(null));
      }
    } catch (err) {
      if (err.response?.status === 404) {
        setError("Imagen no encontrada");
      } else {
        setError("No se pudo cargar la imagen");
        console.error("Error al cargar la imagen:", err);
      }
    } finally {
      setLoading(false);
    }
  }, [numericId]);

  useEffect(() => {
    viewCountedRef.current = false;
    setSimilar([]);
    setSimilarLoading(true);
    setCommentText("");
    setUserRating(0);
    loadDetail();

    searchSimilarImages(numericId, 8)
      .then((data) => {
        setSimilar(data.similar_images || []);
        setSimilarLoading(false);
      })
      .catch((err) => {
        console.error("Error cargando similares:", err);
        setSimilar([]);
        setSimilarLoading(false);
      });

    api
      .get("/api/users")
      .then((res) => setCurrentUser(res.data))
      .catch(() => setCurrentUser(null))
      .finally(() => setUserLoaded(true));
  }, [numericId, loadDetail]);

  // Estado de guardado del usuario actual
  useEffect(() => {
    if (!currentUser?.user_id) return;
    api
      .get(`/api/users/${currentUser.user_id}/saved-images`)
      .then((res) => {
        const list = res.data.saved_images || [];
        setIsSaved(list.some((img) => String(img.image_id) === String(numericId)));
      })
      .catch(() => setIsSaved(false));
  }, [currentUser, numericId]);

  // Contabilizar la vista una sola vez por apertura
  useEffect(() => {
    if (!currentUser?.user_id || viewCountedRef.current || !image) return;
    viewCountedRef.current = true;
    api
      .put(`/api/images/${numericId}/interactions/${currentUser.user_id}`, {
        action: "views",
        increment: 1,
      })
      .then(() => setImage((prev) => prev && {
        ...prev,
        interactions: { ...prev.interactions, views: (prev.interactions?.views || 0) + 1 },
      }))
      .catch(() => {});
  }, [currentUser, image, numericId]);

  const requireAuth = () => {
    if (!userLoaded) return false;
    if (!currentUser) {
      toast.info("Tu sesión ha expirado, inicia sesión de nuevo");
      navigate("/");
      return false;
    }
    return true;
  };

  const handleToggleLike = async () => {
    if (!requireAuth() || !image) return;
    const liked = isLiked;
    setImage((prev) => {
      if (!prev) return prev;
      const likes = (prev.interactions?.likes || 0) + (liked ? -1 : 1);
      return {
        ...prev,
        interactions: { ...prev.interactions, likes: Math.max(0, likes) },
        liked_by: liked
          ? prev.liked_by.filter((id) => String(id) !== String(currentUser.user_id))
          : [...(prev.liked_by || []), currentUser.user_id],
      };
    });

    try {
      if (liked) {
        await api.delete(`/api/images/${numericId}/likes/${currentUser.user_id}`);
      } else {
        await api.put(`/api/images/${numericId}/interactions/${currentUser.user_id}`, {
          action: "likes",
          increment: 1,
        });
      }
    } catch (err) {
      console.error("Error al procesar tu like:", err);
      toast.error("Error al procesar tu like");
      loadDetail();
    }
  };

  const handleToggleSave = async () => {
    if (!requireAuth()) return;
    const saved = isSaved;
    setIsSaved(!saved);
    try {
      if (saved) {
        await api.delete(`/api/images/${numericId}/save`);
        toast.info("Imagen removida de tu galería");
      } else {
        await api.put(`/api/images/${numericId}/save`);
        toast.success("Imagen guardada en tu galería");
      }
    } catch (err) {
      console.error("Error al guardar imagen:", err);
      setIsSaved(saved);
      toast.error("Error al guardar imagen");
    }
  };

  const handleDownload = async () => {
    if (!image) return;
    try {
      const response = await fetch(imgSrc(image.image_url));
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `image-${numericId}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      if (currentUser) {
        api.put(`/api/images/${numericId}/interactions/${currentUser.user_id}`, {
          action: "downloads",
          increment: 1,
        });
        setImage((prev) => prev && {
          ...prev,
          interactions: { ...prev.interactions, downloads: (prev.interactions?.downloads || 0) + 1 },
        });
      }
      toast.success("Descarga iniciada");
    } catch (error) {
      console.error("Error al descargar:", error);
      toast.error("Error al descargar imagen");
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: image?.title || "Imagen", url });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("¡Enlace copiado al portapapeles!");
      }
    } catch (error) {
      if (error?.name !== "AbortError") {
        console.error("Error al compartir:", error);
        toast.error("Error al compartir");
      }
    }
  };

  const handleRate = async (value) => {
    if (!requireAuth()) return;
    setUserRating(value);
    try {
      await api.put(`/api/images/${numericId}/interactions/${currentUser.user_id}`, {
        action: "ratings",
        increment: 1,
        rating_value: value,
      });
      toast.success(`Calificaste con ${value} estrella${value > 1 ? "s" : ""}`);
    } catch (error) {
      console.error("Error al calificar:", error);
      toast.error("Error al calificar");
    }
  };

  const handleCommentSubmit = async () => {
    if (!commentText.trim() || submittingComment || !requireAuth()) return;
    setSubmittingComment(true);
    try {
      await api.put(`/api/images/${numericId}/comments`, {
        comment: commentText.trim(),
        parent_comment_id: null,
      });
      setCommentText("");
      const refreshed = await api.get(`/api/images/${numericId}`);
      setImage(refreshed.data);
    } catch (error) {
      console.error("Error al enviar comentario:", error);
      toast.error(error.response?.data?.detail || "Error al enviar comentario");
    } finally {
      setSubmittingComment(false);
    }
  };

  if (loading) {
    return (
      <Page $isDark={isDark}>
        <CenterBox>
          <LoadingSpinner label="Cargando imagen..." />
        </CenterBox>
      </Page>
    );
  }

  if (error || !image) {
    return (
      <Page $isDark={isDark}>
        <CenterBox>
          <FaImages size={48} className="mb-3 text-muted" />
          <h5>{error || "Imagen no encontrada"}</h5>
          <BackButton onClick={() => navigate(-1)}>
            <FaArrowLeft /> Volver
          </BackButton>
        </CenterBox>
      </Page>
    );
  }

  const interactions = image.interactions || {};
  const comments = image.comments || [];
  const qualification = image.qualification || 0;
  const avatar = profile?.image || "/static/user.png";

  return (
    <Page $isDark={isDark}>
      <TopBar>
        <BackButton onClick={() => navigate(-1)}>
          <FaArrowLeft /> Volver
        </BackButton>
      </TopBar>

      <Layout>
        <ImagePanel $isDark={isDark} onClick={() => window.open(imgSrc(image.image_url), "_blank")}>
          <DetailImage src={imgSrc(image.image_url)} alt={image.title || ""} loading="lazy" />
        </ImagePanel>

        <InfoPanel $isDark={isDark}>
          <Toolbar>
            <ToolGroup>
              <IconButton
                $active={isLiked}
                title="Me gusta"
                onClick={handleToggleLike}
                disabled={!userLoaded}
              >
                {isLiked ? <FaHeart style={{ color: "#ff4d6d" }} /> : <FaRegHeart />}
                <span>{interactions.likes || 0}</span>
              </IconButton>
              <IconButton
                $active={isSaved}
                title="Guardar"
                onClick={handleToggleSave}
                disabled={!userLoaded}
              >
                {isSaved ? <FaBookmark style={{ color: "#00f2fe" }} /> : <FaRegBookmark />}
                <span>{isSaved ? "Guardada" : "Guardar"}</span>
              </IconButton>
            </ToolGroup>
            <ToolGroup>
              <IconButton title="Descargar" onClick={handleDownload}>
                <FaDownload />
              </IconButton>
              <IconButton title="Compartir" onClick={handleShare}>
                <FaShareAlt />
              </IconButton>
            </ToolGroup>
          </Toolbar>

          <AuthorRow to={`/user/${image.user_id}`}>
            <AuthorAvatar src={imgSrc(avatar)} alt={image.username || ""} />
            <AuthorMeta>
              <AuthorName>{image.username || `Usuario ${image.user_id}`}</AuthorName>
              <AuthorDate>
                {image.upload_date
                  ? new Date(image.upload_date).toLocaleDateString()
                  : ""}
              </AuthorDate>
            </AuthorMeta>
          </AuthorRow>

          <DetailTitle>{image.title || "Sin título"}</DetailTitle>

          <MetaRow>
            {image.category && <Chip>{image.category}</Chip>}
            {(image.tags || []).map((tag) => (
              <Chip key={tag} $tag>
                {tag}
              </Chip>
            ))}
          </MetaRow>

          <StatsGrid>
            <Stat>
              <StatValue>{interactions.views || 0}</StatValue>
              <StatLabel>Vistas</StatLabel>
            </Stat>
            <Stat>
              <StatValue>{interactions.likes || 0}</StatValue>
              <StatLabel>Likes</StatLabel>
            </Stat>
            <Stat>
              <StatValue>{interactions.downloads || 0}</StatValue>
              <StatLabel>Descargas</StatLabel>
            </Stat>
            <Stat>
              <StatValue>{comments.length}</StatValue>
              <StatLabel>Comentarios</StatLabel>
            </Stat>
            <Stat>
              <StatValue>{qualification}/5</StatValue>
              <StatLabel>Calificación</StatLabel>
            </Stat>
          </StatsGrid>

          <RatingBox>
            <RatingLabel>Califica esta imagen</RatingLabel>
            <Stars>
              {[1, 2, 3, 4, 5].map((value) =>
                value <= (userRating || qualification) ? (
                  <FaStar key={value} onClick={() => handleRate(value)} />
                ) : (
                  <FaRegStar key={value} onClick={() => handleRate(value)} />
                )
              )}
            </Stars>
          </RatingBox>

          <CommentsSection>
            <SectionHeading>Comentarios ({comments.length})</SectionHeading>

            {comments.length > 0 ? (
              <CommentsList>
                {comments.map((comment) => (
                  <CommentItem key={comment.comment_id || comment._id}>
                    <CommentHead>
                      <CommentAvatar
                        src={imgSrc(comment.user_image || "/static/user.png")}
                        alt=""
                      />
                      <CommentAuthor to={`/user/${comment.user_id}`}>
                        {comment.username || `Usuario ${comment.user_id}`}
                      </CommentAuthor>
                      <CommentDate>
                        {comment.created_at
                          ? new Date(comment.created_at).toLocaleDateString()
                          : ""}
                      </CommentDate>
                    </CommentHead>
                    <CommentText>{comment.comment}</CommentText>
                  </CommentItem>
                ))}
              </CommentsList>
            ) : (
              <NoComments>No hay comentarios aún</NoComments>
            )}

            <CommentForm>
              <CommentInput
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Escribe un comentario..."
                maxLength={500}
                disabled={submittingComment}
              />
              <CommentCharCount>{commentText.length}/500</CommentCharCount>
              <CommentButton
                onClick={handleCommentSubmit}
                disabled={!commentText.trim() || submittingComment || !userLoaded}
              >
                {submittingComment ? "Enviando..." : "Comentar"}
              </CommentButton>
            </CommentForm>
          </CommentsSection>
        </InfoPanel>
      </Layout>

      <SimilarSection>
        <SectionHeading>Más como esto</SectionHeading>
        {similarLoading ? (
          <CenterBox>
            <LoadingSpinner label="Buscando similares..." />
          </CenterBox>
        ) : similar.length > 0 ? (
          <SimilarGrid>
            {similar.map((img, index) => (
              <SimilarCard
                key={img.image_id || index}
                onClick={() => {
                  navigate(`/image/${img.image_id}`);
                  window.scrollTo({ top: 0 });
                }}
              >
                <SimilarImage src={imgSrc(img.image_url)} alt={img.title || ""} loading="lazy" />
                <SimilarOverlay>
                  <SimilarScore>{Math.round((img.similarity_score || 0) * 100)}%</SimilarScore>
                </SimilarOverlay>
              </SimilarCard>
            ))}
          </SimilarGrid>
        ) : (
          <NoComments>No hay imágenes similares disponibles</NoComments>
        )}
      </SimilarSection>
    </Page>
  );
};

export default ImageDetail;

const Page = styled.div`
  min-height: calc(100vh - 56px);
  padding: 1.5rem 2rem 3rem;
  background: ${(props) =>
    props.$isDark ? "rgba(15,15,15,0.85)" : "rgba(255,255,255,0.85)"};
  color: ${(props) => (props.$isDark ? "#f5f5f5" : "#1a1a1a")};

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const TopBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const BackButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  border: none;
  background: rgba(128, 128, 128, 0.15);
  color: inherit;
  padding: 0.5rem 1rem;
  border-radius: 999px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(128, 128, 128, 0.3);
  }
`;

const CenterBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 4rem 1rem;
  text-align: center;
`;

const Layout = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(320px, 0.8fr);
  gap: 1.5rem;
  align-items: start;

  @media (max-width: 992px) {
    grid-template-columns: 1fr;
  }
`;

const ImagePanel = styled.div`
  background: ${(props) => (props.$isDark ? "#0f0f0f" : "#f0f0f0")};
  border-radius: 20px;
  padding: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: zoom-in;
  position: sticky;
  top: 1rem;
  max-height: calc(100vh - 8rem);
  overflow: hidden;

  @media (max-width: 992px) {
    position: static;
    max-height: 70vh;
  }
`;

const DetailImage = styled.img`
  max-width: 100%;
  max-height: calc(100vh - 10rem);
  object-fit: contain;
  border-radius: 12px;
  display: block;

  @media (max-width: 992px) {
    max-height: 65vh;
  }
`;

const InfoPanel = styled.div`
  background: ${(props) => (props.$isDark ? "rgba(30,30,30,0.8)" : "rgba(245,245,245,0.9)")};
  border: 1px solid
    ${(props) =>
      props.$isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"};
  border-radius: 20px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

const Toolbar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
`;

const ToolGroup = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const IconButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  border: 1px solid rgba(128, 128, 128, 0.35);
  background: transparent;
  color: inherit;
  padding: 0.5rem 0.9rem;
  border-radius: 999px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(128, 128, 128, 0.15);
  }

  ${(props) =>
    props.$active &&
    `
    border-color: #00f2fe;
    color: #00f2fe;
  `}

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
`;

const AuthorRow = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-decoration: none;
  color: inherit;

  &:hover {
    color: #00f2fe;
  }
`;

const AuthorAvatar = styled.img`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgba(0, 242, 254, 0.5);
`;

const AuthorMeta = styled.div`
  display: flex;
  flex-direction: column;
`;

const AuthorName = styled.span`
  font-weight: 600;
`;

const AuthorDate = styled.small`
  opacity: 0.7;
`;

const DetailTitle = styled.h1`
  font-size: 1.75rem;
  margin: 0;
  font-weight: 700;
  word-break: break-word;
`;

const MetaRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const Chip = styled.span`
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  font-size: 0.8rem;
  background: ${(props) => (props.$tag ? "rgba(0,242,254,0.15)" : "rgba(128,128,128,0.2)")};
  color: ${(props) => (props.$tag ? "#00f2fe" : "inherit")};
  border: 1px solid
    ${(props) => (props.$tag ? "rgba(0,242,254,0.4)" : "rgba(128,128,128,0.3)")};
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 0.5rem;

  @media (max-width: 576px) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

const Stat = styled.div`
  text-align: center;
  padding: 0.75rem 0.5rem;
  border-radius: 12px;
  background: rgba(128, 128, 128, 0.12);
`;

const StatValue = styled.div`
  font-size: 1.1rem;
  font-weight: 700;
  color: #00f2fe;
`;

const StatLabel = styled.small`
  opacity: 0.75;
  font-size: 0.75rem;
`;

const RatingBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
`;

const RatingLabel = styled.span`
  font-size: 0.9rem;
  opacity: 0.85;
`;

const Stars = styled.div`
  display: flex;
  gap: 0.35rem;
  font-size: 1.4rem;
  color: #ffc107;

  svg {
    cursor: pointer;
    transition: transform 0.15s;
  }

  svg:hover {
    transform: scale(1.15);
  }
`;

const CommentsSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  border-top: 1px solid rgba(128, 128, 128, 0.25);
  padding-top: 1rem;
`;

const SectionHeading = styled.h5`
  margin: 0;
  font-weight: 600;
`;

const CommentsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-height: 320px;
  overflow-y: auto;
  padding-right: 0.25rem;
`;

const CommentItem = styled.div`
  background: rgba(128, 128, 128, 0.1);
  border-radius: 12px;
  padding: 0.75rem;
`;

const CommentHead = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.35rem;
`;

const CommentAvatar = styled.img`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  object-fit: cover;
`;

const CommentAuthor = styled(Link)`
  font-weight: 600;
  font-size: 0.85rem;
  text-decoration: none;
  color: inherit;

  &:hover {
    color: #00f2fe;
  }
`;

const CommentDate = styled.small`
  margin-left: auto;
  opacity: 0.6;
  font-size: 0.75rem;
`;

const CommentText = styled.p`
  margin: 0;
  font-size: 0.9rem;
  word-break: break-word;
`;

const NoComments = styled.div`
  opacity: 0.6;
  font-size: 0.9rem;
`;

const CommentForm = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  position: relative;
`;

const CommentInput = styled.textarea`
  resize: none;
  border: 1px solid rgba(128, 128, 128, 0.35);
  background: rgba(128, 128, 128, 0.08);
  color: inherit;
  border-radius: 12px;
  padding: 0.75rem;
  font-size: 0.9rem;

  &:focus {
    outline: none;
    border-color: #00f2fe;
  }
`;

const CommentCharCount = styled.small`
  align-self: flex-end;
  opacity: 0.6;
`;

const CommentButton = styled.button`
  border: none;
  background: #00f2fe;
  color: #062b3d;
  font-weight: 600;
  border-radius: 12px;
  padding: 0.6rem;
  cursor: pointer;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const SimilarSection = styled.section`
  margin-top: 2.5rem;
`;

const SimilarGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 1rem;
  margin-top: 0.75rem;
`;

const SimilarCard = styled.div`
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  aspect-ratio: 1;
  background: rgba(128, 128, 128, 0.15);
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-3px);
  }
`;

const SimilarImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
`;

const SimilarOverlay = styled.div`
  position: absolute;
  inset: auto 0 0 0;
  padding: 0.35rem 0.6rem;
  background: rgba(0, 0, 0, 0.65);
  color: #fff;
  font-size: 0.8rem;
`;

const SimilarScore = styled.span`
  font-weight: 600;
`;
