import React, { useState, useRef, useEffect } from "react";
import { Row, Col, Form, Button } from "react-bootstrap";
import { FaCog } from "react-icons/fa";
import styled from "styled-components";
import { useForm } from "react-hook-form";
import api from "../Auth/Api";
import { toast } from "react-toastify";
import { Tooltip } from "react-tooltip";

export const Config = () => {
  const [user, setUsers] = useState("");
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [profilePicFile, setProfilePicFile] = useState(null);
  const [uploadingProfilePic, setUploadingProfilePic] = useState(false);
  const [profilePublic, setProfilePublic] = useState(true);
  const profilePicInputRef = useRef(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
    setValue,
  } = useForm();

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const getUsers = async () => {
    try {
      const response = await api.get("/api/users");
      setUsers(response.data);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.detail || "Error al obtener usuarios");
      throw err;
    } finally {
    }
  };

  useEffect(() => {
    getUsers();
  }, []);

  useEffect(() => {
    if (user) {
      // Precargar todos los campos del formulario
      setValue("name", user.name || "");
      setValue("surname", user.surname || "");
      setValue("info", user.info || "");
      setValue("username", user.username || "");
      setValue("email", user.email || "");
      setValue("web", user.web || "");
      setProfilePublic(user.profile_public !== false);
    }
  }, [user, setValue]);

  const configuration = (data) => {
    try {
      api.put("/api/profile", data);
      toast.success("¡Configuración actualizada forma exitosa!");
    } catch (error) {
      toast.error("Hubo un error al actualizar");
    } finally {
      setLoading(false);
    }
  };

  const handleProfilePicUpload = async () => {
    if (!profilePicFile) {
      toast.warning("Selecciona una imagen");
      return;
    }
    
    setUploadingProfilePic(true);
    try {
      const formData = new FormData();
      formData.append("file", profilePicFile);
      
      await api.post("/api/users/profile-picture", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      
      toast.success("Foto de perfil actualizada");
      setProfilePicFile(null);
      getUsers();
    } catch (error) {
      toast.error("Error al subir la imagen");
    } finally {
      setUploadingProfilePic(false);
    }
  };

  const handleToggleVisibility = async () => {
    try {
      const newValue = !profilePublic;
      await api.put(`/api/users/profile-visibility?profile_public=${newValue}`);
      setProfilePublic(newValue);
      toast.success(newValue ? "Perfil ahora es público" : "Perfil ahora es privado");
    } catch (error) {
      toast.error("Error al cambiar visibilidad");
    }
  };

  return (
    <Container className="m-4 m-sm-5">
      <div>
        <div className="d-flex  align-items-center mt-5 mb-2">
          <FaCog size={25} className="me-2" />
          <h3 className="mb-0">Configuración</h3>
        </div>
        <p>
          La información proporcionada en este formulario se mostrará
          públicamente en el perfil del usuario.
        </p>
      </div>
      <hr className="mb-5" />

      <Row>
        <Col
          xs={12}
          className="p-sm-5 p-4 mb-3 d-flex  justify-content-center
      "
          style={{ borderRadius: "15px", border: "2px solid #808080" }}
        >
          <form onSubmit={handleSubmit(configuration)}>
            <div className="d-flex flex-row mb-3 justify-content-between align-items-center">
              <div className="d-flex flex-column">
                <span>Foto de perfil</span>
                <div className="position-relative">
                  <img
                    src={profilePicFile ? URL.createObjectURL(profilePicFile) : (user?.image || "/static/user.png")}
                    alt="Profile"
                    className="rounded-circle me-2"
                    style={{ width: "68px", height: "68px", objectFit: "cover" }}
                  />
                </div>
                <input
                  type="file"
                  ref={profilePicInputRef}
                  onChange={(e) => setProfilePicFile(e.target.files[0])}
                  style={{ display: "none" }}
                  accept="image/jpeg,image/png,image/gif,image/webp"
                />
                <div className="d-flex gap-2 mt-2">
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => profilePicInputRef.current?.click()}
                  >
                    Seleccionar
                  </Button>
                  {profilePicFile && (
                    <Button
                      variant="success"
                      size="sm"
                      onClick={handleProfilePicUpload}
                      disabled={uploadingProfilePic}
                    >
                      {uploadingProfilePic ? "Subiendo..." : "Guardar"}
                    </Button>
                  )}
                </div>
              </div>
              <div style={{width:"30px", height:"30px"}}>
                <Button
                  variant={darkMode ? "light" : "dark"}
                  onClick={toggleDarkMode}
                  size="sm"
                  data-tooltip-id="change-theme"
                  data-tooltip-content="Cambiar tema"
                >
                  {darkMode ? "☀️" : "🌙"}
                </Button>
              </div>
              <Tooltip id="change-theme" />
            </div>
            <div className="d-flex align-items-center justify-content-between mb-3 p-3 rounded" style={{ background: "rgba(0,242,254,0.05)", border: "1px solid rgba(0,242,254,0.15)" }}>
              <div>
                <div className="fw-semibold">Perfil público</div>
                <small className="text-muted">
                  {profilePublic ? "Cualquiera puede ver tu galería" : "Solo tú puedes ver tu galería"}
                </small>
              </div>
              <Form.Check
                type="switch"
                id="profile-public-switch"
                checked={profilePublic}
                onChange={handleToggleVisibility}
                style={{ cursor: "pointer" }}
              />
            </div>
            <Row>
              <Col xs={12} lg={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Nombre</Form.Label>
                  <Form.Control
                    {...register("name", { required: true, maxLength: 20 })}
                    type="text"
                  />
                </Form.Group>
              </Col>
              <Col xs={12} lg={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Apellido</Form.Label>
                  <Form.Control
                    {...register("surname", { required: true, maxLength: 20 })}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col xs={12} lg={12}>
                <Form.Group className="mb-3">
                  <Form.Label>Acerca</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    {...register("info", { maxLength: 200 })}
                    type="text"
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col xs={12} className="mb-3">
                <Form.Label>Nombre de usuario</Form.Label>
                <Form.Control
                  type="text"
                  {...register("username", { required: true, maxLength: 20 })}
                />
              </Col>
            </Row>
            <Row>
              <Col xs={12} className="mb-3">
                <Form.Label>Correo</Form.Label>
                <Form.Control
                  type="text"
                  {...register("email", { required: true })}
                />
              </Col>
            </Row>
            <Row>
              <Col xs={12} className="mb-3">
                <Form.Label>Sitio web</Form.Label>
                <Form.Control type="text" {...register("web")} />
              </Col>
            </Row>
            <Button type="submit" className="w-100 mt-3">
              <b>Guardar cambios</b>
            </Button>
          </form>
        </Col>
      </Row>
    </Container>
  );
};

const Container = styled.div`
  height: auto;
`;
