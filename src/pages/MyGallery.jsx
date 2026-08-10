import React, { useState, useEffect, useContext } from "react";
import { Row, Col, Button, Modal, Form } from "react-bootstrap";
import { FaImages, FaBookmark, FaUpload, FaCog } from "react-icons/fa";
import { toast } from "react-toastify";
import styled from "styled-components";
import api from "../Auth/Api";
import { ThemeContext } from "../App";
import GalleryCard from "../components/GalleryCard";

export const MyGallery = () => {
  const { theme } = useContext(ThemeContext);
  const [user, setUser] = useState(null);
  const [savedImages, setSavedImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadCategory, setUploadCategory] = useState("");
  const [uploading, setUploading] = useState(false);

  const isDark = theme === "dark";

  const fetchUserData = async () => {
    try {
      const response = await api.get("/api/users");
      setUser(response.data);
      return response.data;
    } catch (error) {
      toast.error("Error al cargar datos del usuario");
    }
  };

  const fetchSavedImages = async (userId) => {
    try {
      const response = await api.get(`/api/images/user/${userId}`);
      setSavedImages(response.data);
    } catch (error) {
      console.error("Error fetching saved images:", error);
      setSavedImages([]);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const userData = await fetchUserData();
      if (userData?.user_id) {
        await fetchSavedImages(userData.user_id);
      }
      setLoading(false);
    };
    loadData();
  }, []);

  const handleOpenModal = (imageId) => {
    setSelectedImage(imageId);
    setShowUploadModal(true);
  };

  const handleSaveImage = async () => {
    if (!selectedImage) return;
    
    setUploading(true);
    try {
      await api.put(`/api/images/${selectedImage}/save`);
      toast.success("Imagen guardada en tu galería");
      setShowUploadModal(false);
      setSelectedImage(null);
      if (user?.user_id) {
        await fetchSavedImages(user.user_id);
      }
    } catch (error) {
      toast.error("Error al guardar la imagen");
    } finally {
      setUploading(false);
    }
  };

  const handleUnsave = async (imageId) => {
    try {
      await api.delete(`/api/images/${imageId}/save`);
      toast.info("Imagen removida de tu galería");
      if (user?.user_id) {
        await fetchSavedImages(user.user_id);
      }
    } catch (error) {
      toast.error("Error al remover la imagen");
    }
  };

  const handleUploadNew = async () => {
    if (!uploadTitle.trim()) {
      toast.warning("Ingresa un título para la imagen");
      return;
    }

    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target.result;
        await api.post("/api/create_image", {
          title: uploadTitle,
          category: uploadCategory || "general",
          image_url: base64,
          user_id: user?.user_id,
        });
        toast.success("Imagen subida exitosamente");
        setShowUploadModal(false);
        setUploadTitle("");
        setUploadCategory("");
        if (user?.user_id) {
          await fetchSavedImages(user.user_id);
        }
      };
      reader.readAsDataURL(selectedImage);
    } catch (error) {
      toast.error("Error al subir la imagen");
    } finally {
      setUploading(false);
    }
  };

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

  return (
    <Container isDark={isDark}>
      {/* Profile Section */}
      <ProfileSection isDark={isDark}>
        <Row className="align-items-center">
          <Col xs={12} md={3} className="text-center mb-3 mb-md-0">
            <ProfileImage
              src={user?.image || "/static/user.png"}
              alt="Profile"
            />
          </Col>
          <Col xs={12} md={6}>
            <h2 className="mb-1">{user?.username}</h2>
            {user?.name && (
              <p className="text-muted mb-1">
                {user.name} {user.surname}
              </p>
            )}
            {user?.info && (
              <p className="mb-2">{user.info}</p>
            )}
            {user?.web && (
              <a
                href={user.web}
                target="_blank"
                rel="noopener noreferrer"
                className="text-info"
              >
                {user.web}
              </a>
            )}
          </Col>
          <Col xs={12} md={3} className="text-center text-md-end">
            <StatsContainer>
              <StatItem isDark={isDark}>
                <StatNumber>{savedImages.length}</StatNumber>
                <StatLabel>Imágenes</StatLabel>
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
            Mi Galería
          </h3>
        </div>

        {savedImages.length === 0 ? (
          <EmptyState isDark={isDark}>
            <FaBookmark size={48} className="mb-3 text-muted" />
            <h5>No hay imágenes guardadas</h5>
            <p className="text-muted">
              Las imágenes que guardes aparecerán aquí
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
                isSaved={true}
                rating={{}}
                qualification={image}
                onOpen={(id) => handleOpenModal(id)}
                onToggleFavorite={() => {}}
                onToggleSave={(imageId) => handleUnsave(imageId)}
              />
            ))}
          </ImageGrid>
        )}
      </GallerySection>

      {/* Save Image Modal */}
      <Modal
        show={showUploadModal}
        onHide={() => {
          setShowUploadModal(false);
          setSelectedImage(null);
          setUploadTitle("");
          setUploadCategory("");
        }}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <FaBookmark className="me-2" />
            Guardar imagen
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Título</Form.Label>
            <Form.Control
              type="text"
              placeholder="Título de la imagen"
              value={uploadTitle}
              onChange={(e) => setUploadTitle(e.target.value)}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Categoría</Form.Label>
            <Form.Control
              type="text"
              placeholder="Categoría"
              value={uploadCategory}
              onChange={(e) => setUploadCategory(e.target.value)}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => {
              setShowUploadModal(false);
              setSelectedImage(null);
              setUploadTitle("");
              setUploadCategory("");
            }}
          >
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleSaveImage}
            disabled={uploading || !selectedImage}
          >
            {uploading ? "Guardando..." : "Guardar"}
          </Button>
        </Modal.Footer>
      </Modal>
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

const ImageGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
`;
