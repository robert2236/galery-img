import React, { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import { Row, Col } from "react-bootstrap";
import { FaImages, FaLock, FaExternalLinkAlt } from "react-icons/fa";
import { toast } from "react-toastify";
import styled from "styled-components";
import api from "../Auth/Api";
import { ThemeContext } from "../App";
import GalleryCard from "../components/GalleryCard";

export const PublicGallery = () => {
  const { user_id } = useParams();
  const { theme } = useContext(ThemeContext);
  const [profile, setProfile] = useState(null);
  const [savedImages, setSavedImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isPrivate, setIsPrivate] = useState(false);

  const isDark = theme === "dark";

  useEffect(() => {
    const loadPublicProfile = async () => {
      setLoading(true);
      try {
        // Fetch public profile (no auth required)
        const profileRes = await api.get(`/api/users/${user_id}/profile`);
        setProfile(profileRes.data);

        // Check if profile is public
        if (!profileRes.data.profile_public) {
          setIsPrivate(true);
          setLoading(false);
          return;
        }

        // Fetch saved images (no auth required for public profiles)
        try {
          const imagesRes = await api.get(`/api/users/${user_id}/saved-images/public`);
          setSavedImages(imagesRes.data.saved_images || []);
        } catch (err) {
          console.error("Error fetching saved images:", err);
          setSavedImages([]);
        }
      } catch (error) {
        console.error("Error loading public profile:", error);
        toast.error("Error al cargar el perfil");
      } finally {
        setLoading(false);
      }
    };

    if (user_id) {
      loadPublicProfile();
    }
  }, [user_id]);

  if (loading) {
    return (
      <Container isDark={isDark}>
        <div className="text-center py-5">
          <div className="spinner-border text-info" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      </Container>
    );
  }

  if (isPrivate) {
    return (
      <Container isDark={isDark}>
        <PrivateState isDark={isDark}>
          <FaLock size={48} className="mb-3 text-muted" />
          <h4>Perfil privado</h4>
          <p className="text-muted">
            Este perfil es privado. Solo el propietario puede ver esta galería.
          </p>
        </PrivateState>
      </Container>
    );
  }

  return (
    <Container isDark={isDark}>
      {/* Profile Section */}
      <ProfileSection isDark={isDark}>
        <Row className="align-items-center">
          <Col xs={12} md={3} className="text-center mb-3 mb-md-0">
            <ProfileImage
              src={profile?.image || "/static/user.png"}
              alt="Profile"
            />
          </Col>
          <Col xs={12} md={6}>
            <h2 className="mb-1">{profile?.username}</h2>
            {profile?.name && (
              <p className="text-muted mb-1">
                {profile.name} {profile.surname}
              </p>
            )}
            {profile?.info && (
              <p className="mb-2">{profile.info}</p>
            )}
            {profile?.web && (
              <a
                href={profile.web}
                target="_blank"
                rel="noopener noreferrer"
                className="text-info"
              >
                <FaExternalLinkAlt className="me-1" />
                {profile.web}
              </a>
            )}
          </Col>
          <Col xs={12} md={3} className="text-center text-md-end">
            <StatsContainer>
              <StatItem isDark={isDark}>
                <StatNumber>{savedImages.length}</StatNumber>
                <StatLabel>Imágenes guardadas</StatLabel>
              </StatItem>
            </StatsContainer>
          </Col>
        </Row>
      </ProfileSection>

      {/* Gallery Section */}
      <GallerySection>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3 className="mb-0">
            <FaImages className="me-2" />
            Galería pública
          </h3>
        </div>

        {savedImages.length === 0 ? (
          <EmptyState isDark={isDark}>
            <FaImages size={48} className="mb-3 text-muted" />
            <h5>No hay imágenes guardadas</h5>
            <p className="text-muted">
              Este usuario no ha guardado imágenes aún
            </p>
          </EmptyState>
        ) : (
          <ImageGrid>
            {savedImages.map((image, index) => (
              <GalleryCard
                key={image.image_id || index}
                img={{ url: image.image_url, id: image.image_id }}
                index={index}
                isFavorite={false}
                rating={{}}
                qualification={image}
                onOpen={() => {}}
                onToggleFavorite={() => {}}
              />
            ))}
          </ImageGrid>
        )}
      </GallerySection>
    </Container>
  );
};

const Container = styled.div`
  padding: 2rem;
  min-height: calc(100vh - 56px);
  background: ${(props) =>
    props.isDark ? "rgba(15,15,15,0.85)" : "rgba(255,255,255,0.85)"};
`;

const ProfileSection = styled.div`
  padding: 2rem;
  margin-bottom: 2rem;
  border-radius: 16px;
  background: ${(props) =>
    props.isDark ? "rgba(30,30,30,0.8)" : "rgba(245,245,245,0.9)"};
  border: 1px solid
    ${(props) =>
      props.isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"};
`;

const ProfileImage = styled.img`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid rgba(0, 242, 254, 0.5);
`;

const StatsContainer = styled.div`
  display: flex;
  gap: 1.5rem;
  justify-content: center;
`;

const StatItem = styled.div`
  text-align: center;
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  background: ${(props) =>
    props.isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)"};
`;

const StatNumber = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  color: #00f2fe;
`;

const StatLabel = styled.div`
  font-size: 0.85rem;
  color: #888;
`;

const GallerySection = styled.div`
  padding: 0 1rem;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  border-radius: 16px;
  background: ${(props) =>
    props.isDark ? "rgba(30,30,30,0.5)" : "rgba(245,245,245,0.7)"};
`;

const PrivateState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  border-radius: 16px;
  background: ${(props) =>
    props.isDark ? "rgba(30,30,30,0.5)" : "rgba(245,245,245,0.7)"};
`;

const ImageGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
`;
