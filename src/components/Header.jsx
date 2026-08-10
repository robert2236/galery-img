import React, { useContext, useState, useEffect, useRef } from "react";
import styled from "styled-components";
import { Form, Button, Modal } from "react-bootstrap";
import { IoIosArrowDown, IoMdCheckmarkCircle } from "react-icons/io";
import { FaBell, FaTimes, FaCamera, FaUpload } from "react-icons/fa";
import NavDropdown from "react-bootstrap/NavDropdown";
import api from "../Auth/Api";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "../Auth/Auth";
import { useSearch, ThemeContext } from "../App";
import { MdOutlineSearch } from "react-icons/md";
import VisualSearchModal from "./VisualSearchModal";
import AsyncSelect from "react-select/async";

export function Header() {
  const { setTheme, theme } = useContext(ThemeContext);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [user, setUsers] = useState("");
  const { setSearch } = useSearch();
  const [darkMode, setDarkMode] = useState(false);
  const { close } = useAuth();
  const [showVisualSearch, setShowVisualSearch] = useState(false);
  const mobileInputRef = useRef(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadCategory, setUploadCategory] = useState(null);
  const [uploading, setUploading] = useState(false);
  const uploadFileInputRef = useRef(null);
  const [showProfilePicModal, setShowProfilePicModal] = useState(false);
  const [profilePicFile, setProfilePicFile] = useState(null);
  const [profilePicUploading, setProfilePicUploading] = useState(false);
  const profilePicInputRef = useRef(null);

  const handleLogout = () => close();

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    changeTheme();
  };

  const getUsers = async () => {
    const response = await api.get("/api/users");
    setUsers(response.data);
  };

  useEffect(() => {
    getUsers();
  }, []);

  useEffect(() => {
    if (user?.theme) {
      setTheme("dark");
    } else {
      setTheme("light");
    }
  }, [user]);

  const changeTheme = async () => {
    try {
      await api.put("/api/change-theme", { theme: darkMode });
      getUsers();
    } catch (error) {
      toast.error("No se pudo cambiar el tema");
    }
  };

  const loadCategoryOptions = async (inputValue) => {
    try {
      const response = await axios.get(
        `/api/categories/autocomplete?q=${encodeURIComponent(inputValue)}&limit=20`
      );
      return response.data.map((name) => ({
        value: name,
        label: name.charAt(0).toUpperCase() + name.slice(1),
      }));
    } catch (error) {
      return [];
    }
  };

  const handleUploadSelectFile = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadFile(file);
      if (!uploadTitle) {
        setUploadTitle(file.name.replace(/\.[^/.]+$/, ""));
      }
    }
  };

  const handleUploadSubmit = async () => {
    if (!uploadFile) {
      toast.warning("Selecciona una imagen");
      return;
    }
    if (!uploadTitle.trim()) {
      toast.warning("Coloca un título");
      return;
    }

    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target.result;
        const payload = {
          title: uploadTitle.trim(),
          category: uploadCategory?.value || "",
          image_url: base64,
          user_id: user?.user_id,
        };
        try {
          await axios.post("/api/create_image", payload);
          toast.success("Imagen subida exitosamente");
          setShowUploadModal(false);
          setUploadFile(null);
          setUploadTitle("");
          setUploadCategory(null);
        } catch (err) {
          toast.error("Error al subir la imagen");
        } finally {
          setUploading(false);
        }
      };
      reader.readAsDataURL(uploadFile);
    } catch (error) {
      toast.error("Error al procesar la imagen");
      setUploading(false);
    }
  };

  const handleCloseUploadModal = () => {
    setShowUploadModal(false);
    setUploadFile(null);
    setUploadTitle("");
    setUploadCategory(null);
  };

  const handleProfilePicUpload = async () => {
    if (!profilePicFile) {
      toast.warning("Selecciona una imagen");
      return;
    }
    
    setProfilePicUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", profilePicFile);
      
      await api.post("/api/users/profile-picture", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      
      toast.success("Foto de perfil actualizada");
      setShowProfilePicModal(false);
      setProfilePicFile(null);
      getUsers();
    } catch (error) {
      toast.error("Error al subir la imagen");
    } finally {
      setProfilePicUploading(false);
    }
  };

  useEffect(() => {
    if (showMobileSearch && mobileInputRef.current) {
      mobileInputRef.current.focus();
    }
  }, [showMobileSearch]);

  const isDark = theme === "dark";
  const headerBg = isDark ? "rgba(15,15,15,0.85)" : "rgba(255,255,255,0.85)";
  const borderColor = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";

  return (
    <HeaderWrapper
      className="navbar border-bottom fixed-top"
      style={{
        backdropFilter: "blur(10px)",
        zIndex: 100,
        marginLeft: "60px",
        backgroundColor: headerBg,
        borderColor: borderColor,
      }}
    >
      {/* DESKTOP SEARCH BAR */}
      <DesktopRow className="d-none d-md-flex justify-content-between align-items-center w-100 px-3">
     
        <div className="d-flex align-items-center flex-grow-1 justify-content-center mx-4" style={{ maxWidth: "100%" }}>
          <div className="position-relative w-100">
            <SearchIcon isDark={isDark}>
              <MdOutlineSearch />
            </SearchIcon>
            <StyledInput
              isDark={isDark}
              type="text"
              placeholder="Buscar..."
              onChange={(e) => setSearch(e.target.value)}
              className="rounded-pill"
              style={{ paddingLeft: "2.5rem", height: "40px" }}
            />
          </div>
        </div>

        <div className="d-flex align-items-center gap-3">
          <IconBtn isDark={isDark} onClick={() => setShowUploadModal(true)}>
            <FaUpload style={{ fontSize: "1.1rem", cursor: "pointer" }} />
          </IconBtn>
          <IconBtn isDark={isDark} onClick={() => setShowVisualSearch(true)}>
            <FaCamera style={{ fontSize: "1.2rem", cursor: "pointer" }} />
          </IconBtn>
          <IconBtn isDark={isDark}>
            <FaBell style={{ fontSize: "1.2rem", cursor: "pointer" }} />
          </IconBtn>
          <NavDropdown
            title={
              <div className="d-flex align-items-center gap-1">
                <img
                  src={user?.image || "/static/user.png"}
                  alt="Profile"
                  className="rounded-circle"
                  style={{ width: "34px", height: "34px", objectFit: "cover", cursor: "pointer" }}
                  onClick={(e) => { e.stopPropagation(); setShowProfilePicModal(true); }}
                />
                <IconBtn isDark={isDark}>
                  <IoIosArrowDown />
                </IconBtn>
              </div>
            }
            align="end"
            menuVariant={isDark ? "dark" : "light"}
          >
            <NavDropdown.Item href="/Config">
              <div className="d-flex align-items-center gap-3">
                <img
                  src={user?.image || "/static/user.png"}
                  alt="Profile"
                  className="rounded-circle"
                  style={{ width: "68px", height: "68px", objectFit: "cover", cursor: "pointer" }}
                  onClick={(e) => { e.stopPropagation(); setShowProfilePicModal(true); }}
                />
                <div className="d-flex flex-column">
                  <span className="fw-semibold">Personal</span>
                  <span className="text-muted small">{user?.username}</span>
                  <span className="text-muted small">{user?.email}</span>
                </div>
                <IoMdCheckmarkCircle size={20} color="#9fef00" />
              </div>
              <hr />
            </NavDropdown.Item>
            <NavDropdown.Item href="/my-gallery">Mi Galer&iacute;a</NavDropdown.Item>
            <NavDropdown.Item href="/config">Configuraci&oacute;n</NavDropdown.Item>
            <NavDropdown.Item onClick={toggleDarkMode} className="d-flex align-items-center justify-content-between">
              Cambiar tema
              <Button variant={darkMode ? "dark" : "light"} size="sm">
                {darkMode ? "\u{1F319}" : "\u{2600}\u{FE0F}"}
              </Button>
            </NavDropdown.Item>
            <hr />
            <NavDropdown.Item onClick={handleLogout}>Cerrar sesi&oacute;n</NavDropdown.Item>
          </NavDropdown>
        </div>
      </DesktopRow>

      {/* MOBILE SEARCH BAR */}
      <MobileRow className="d-flex d-md-none justify-content-between align-items-center w-100 px-2">
        {!showMobileSearch ? (
          <>
            <div className="d-flex align-items-center" style={{ minWidth: 0 }}>
              <img src="/horizontal_logo.png" alt="Logo" style={{ width: '100%', height: 'auto', maxWidth: '160px', objectFit: 'contain', flexShrink: 0 }} />
            </div>
            <div className="d-flex align-items-center gap-3">
              <IconBtn isDark={isDark} onClick={() => setShowUploadModal(true)}>
                <FaUpload style={{ fontSize: "1.1rem", cursor: "pointer" }} />
              </IconBtn>
              <IconBtn isDark={isDark}>
                <MdOutlineSearch
                  style={{ fontSize: "1.4rem", cursor: "pointer" }}
                  onClick={() => setShowMobileSearch(true)}
                />
              </IconBtn>
              <IconBtn isDark={isDark}>
                <FaBell style={{ fontSize: "1.15rem", cursor: "pointer" }} />
              </IconBtn>
              <NavDropdown
                title={
                  <img
                    src={user?.image || "/static/user.png"}
                    alt="Profile"
                    className="rounded-circle"
                    style={{ width: "30px", height: "30px", objectFit: "cover", cursor: "pointer" }}
                    onClick={(e) => { e.stopPropagation(); setShowProfilePicModal(true); }}
                  />
                }
                align="end"
                menuVariant={isDark ? "dark" : "light"}
              >
                <NavDropdown.Item href="/Config">
                  <div className="d-flex align-items-center gap-3">
                    <img
                      src={user?.image || "/static/user.png"}
                      alt="Profile"
                      className="rounded-circle"
                      style={{ width: "68px", height: "68px", objectFit: "cover", cursor: "pointer" }}
                      onClick={(e) => { e.stopPropagation(); setShowProfilePicModal(true); }}
                    />
                    <div className="d-flex flex-column">
                      <span className="fw-semibold">Personal</span>
                      <span className="text-muted small">{user?.username}</span>
                      <span className="text-muted small">{user?.email}</span>
                    </div>
                    <IoMdCheckmarkCircle size={20} color="#9fef00" />
                  </div>
                  <hr />
                </NavDropdown.Item>
                <NavDropdown.Item href="/my-gallery">Mi Galer&iacute;a</NavDropdown.Item>
                <NavDropdown.Item href="/config">Configuraci&oacute;n</NavDropdown.Item>
                <NavDropdown.Item onClick={toggleDarkMode} className="d-flex align-items-center justify-content-between">
                  Cambiar tema
                  <Button variant={darkMode ? "dark" : "light"} size="sm">
                    {darkMode ? "\u{1F319}" : "\u{2600}\u{FE0F}"}
                  </Button>
                </NavDropdown.Item>
                <hr />
                <NavDropdown.Item onClick={handleLogout}>Cerrar sesi&oacute;n</NavDropdown.Item>
              </NavDropdown>
            </div>
          </>
        ) : (
          <div className="d-flex align-items-center w-100 gap-2">
            <div className="position-relative flex-grow-1">
              <SearchIcon isDark={isDark}>
                <MdOutlineSearch />
              </SearchIcon>
              <StyledInput
                ref={mobileInputRef}
                isDark={isDark}
                type="text"
                placeholder="Buscar..."
                onChange={(e) => setSearch(e.target.value)}
                className="rounded-pill"
                style={{ paddingLeft: "2.3rem", height: "36px", width: "100%" }}
              />
            </div>
            <IconBtn isDark={isDark}>
              <FaTimes
                style={{ fontSize: "1.15rem", cursor: "pointer" }}
                onClick={() => {
                  setShowMobileSearch(false);
                  setSearch("");
                }}
              />
            </IconBtn>
          </div>
        )}
      </MobileRow>
      <VisualSearchModal
        show={showVisualSearch}
        onHide={() => setShowVisualSearch(false)}
      />

      <Modal show={showUploadModal} onHide={handleCloseUploadModal} centered size="md">
        <Modal.Header closeButton closeVariant="white" style={{ background: "#1a1d27", borderBottom: "1px solid rgba(0,242,254,0.15)" }}>
          <Modal.Title className="text-light d-flex align-items-center gap-2" style={{ fontSize: "1rem" }}>
            <FaUpload /> Subir imagen
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ background: "#1a1d27" }}>
          <Form.Group className="mb-3">
            <Form.Label className="text-light small fw-semibold">Imagen</Form.Label>
            <input
              type="file"
              ref={uploadFileInputRef}
              onChange={handleUploadSelectFile}
              style={{ display: "none" }}
              accept="image/*"
            />
            <div
              onClick={() => uploadFileInputRef.current?.click()}
              style={{
                border: "2px dashed rgba(0,242,254,0.25)",
                borderRadius: "10px",
                padding: "20px",
                textAlign: "center",
                cursor: "pointer",
                background: uploadFile ? "rgba(0,242,254,0.05)" : "rgba(255,255,255,0.02)",
                borderColor: uploadFile ? "#6bcf7f" : undefined,
              }}
            >
              {uploadFile ? (
                <div className="text-light small">
                  <img
                    src={URL.createObjectURL(uploadFile)}
                    alt="Preview"
                    style={{ maxWidth: "100%", maxHeight: "150px", borderRadius: "8px", marginBottom: "8px" }}
                  />
                  <div style={{ color: "#ccc" }}>{uploadFile.name}</div>
                </div>
              ) : (
                <div className="text-muted small">Haz clic para seleccionar una imagen</div>
              )}
            </div>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label className="text-light small fw-semibold">Título</Form.Label>
            <Form.Control
              type="text"
              placeholder="Título de la imagen"
              value={uploadTitle}
              onChange={(e) => setUploadTitle(e.target.value)}
              style={{
                background: "#2a2d35",
                color: "#e0e0e0",
                border: "1px solid #444",
              }}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label className="text-light small fw-semibold">Categoría</Form.Label>
            <AsyncSelect
              cacheOptions
              defaultOptions
              loadOptions={loadCategoryOptions}
              onChange={setUploadCategory}
              value={uploadCategory}
              placeholder="Buscar categoría..."
              noOptionsMessage={() => "No se encontraron categorías"}
              loadingMessage={() => "Buscando..."}
              isClearable
              isSearchable
              styles={{
                control: (base) => ({
                  ...base,
                  borderRadius: "8px",
                  backgroundColor: "#1a1d27",
                  borderColor: "rgba(0,242,254,0.15)",
                  color: "#fff",
                }),
                menu: (base) => ({
                  ...base,
                  backgroundColor: "#1a1d27",
                  border: "1px solid rgba(0,242,254,0.12)",
                }),
                option: (base, state) => ({
                  ...base,
                  backgroundColor: state.isFocused ? "rgba(0,242,254,0.1)" : "transparent",
                  color: "#fff",
                  "&:hover": { backgroundColor: "rgba(0,242,254,0.15)" },
                }),
                singleValue: (base) => ({ ...base, color: "#fff" }),
                input: (base) => ({ ...base, color: "#fff" }),
                placeholder: (base) => ({ ...base, color: "rgba(255,255,255,0.4)" }),
              }}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer style={{ background: "#1a1d27", borderTop: "1px solid rgba(0,242,254,0.15)" }}>
          <Button variant="secondary" onClick={handleCloseUploadModal} style={{ borderRadius: "20px" }}>
            Cancelar
          </Button>
          <Button
            variant="info"
            onClick={handleUploadSubmit}
            disabled={uploading}
            className="d-flex align-items-center gap-2"
            style={{ borderRadius: "20px", color: "#fff" }}
          >
            <FaUpload />
            {uploading ? "Subiendo..." : "Subir"}
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showProfilePicModal} onHide={() => { setShowProfilePicModal(false); setProfilePicFile(null); }} centered size="sm">
        <Modal.Header closeButton closeVariant="white" style={{ background: "#1a1d27", borderBottom: "1px solid rgba(0,242,254,0.15)" }}>
          <Modal.Title className="text-light" style={{ fontSize: "1rem" }}>
            Cambiar foto de perfil
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ background: "#1a1d27", textAlign: "center" }}>
          <div className="mb-3">
            <img
              src={profilePicFile ? URL.createObjectURL(profilePicFile) : (user?.image || "/static/user.png")}
              alt="Profile"
              className="rounded-circle"
              style={{ width: "120px", height: "120px", objectFit: "cover" }}
            />
          </div>
          <input
            type="file"
            ref={profilePicInputRef}
            onChange={(e) => setProfilePicFile(e.target.files[0])}
            style={{ display: "none" }}
            accept="image/jpeg,image/png,image/gif,image/webp"
          />
          <Button
            variant="outline-info"
            onClick={() => profilePicInputRef.current?.click()}
            style={{ borderRadius: "20px" }}
          >
            Seleccionar imagen
          </Button>
          {profilePicFile && (
            <div className="text-muted small mt-2">{profilePicFile.name}</div>
          )}
        </Modal.Body>
        <Modal.Footer style={{ background: "#1a1d27", borderTop: "1px solid rgba(0,242,254,0.15)" }}>
          <Button variant="secondary" onClick={() => { setShowProfilePicModal(false); setProfilePicFile(null); }} style={{ borderRadius: "20px" }}>
            Cancelar
          </Button>
          <Button
            variant="info"
            onClick={handleProfilePicUpload}
            disabled={!profilePicFile || profilePicUploading}
            className="d-flex align-items-center gap-2"
            style={{ borderRadius: "20px", color: "#fff" }}
          >
            <FaUpload />
            {profilePicUploading ? "Subiendo..." : "Guardar"}
          </Button>
        </Modal.Footer>
      </Modal>
    </HeaderWrapper>
  );
}

const HeaderWrapper = styled.nav`
  backdrop-filter: blur(10px);
  padding-top: 0.5rem !important;
  padding-bottom: 0.5rem !important;
  min-height: 56px;

  @media (max-width: 576px) {
    margin-left: 0 !important;
  }
`;

const DesktopRow = styled.div``;

const MobileRow = styled.div``;

const TitleSpan = styled.span`
  font-weight: bold;
  color: ${({ isDark }) => (isDark ? "#fff" : "#202020")};
`;

const IconBtn = styled.span`
  color: ${({ isDark }) => (isDark ? "#bbb" : "#555")};
  transition: color 0.2s;
  display: inline-flex;
  align-items: center;
  &:hover {
    color: ${({ isDark }) => (isDark ? "#fff" : "#000")};
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 5;
  color: ${({ isDark }) => (isDark ? "#aaa" : "#777")};
  font-size: 1.1rem;
  pointer-events: none;
`;

const StyledInput = styled(Form.Control)`
  background-color: ${({ isDark }) => (isDark ? "#2a2d35" : "rgb(245,245,245)")} !important;
  color: ${({ isDark }) => (isDark ? "#e0e0e0" : "#202020")} !important;
  border: 1px solid ${({ isDark }) => (isDark ? "#444" : "rgb(220,220,220)")} !important;
  &:focus {
    background-color: ${({ isDark }) => (isDark ? "#2a2d35" : "#fff")} !important;
    color: ${({ isDark }) => (isDark ? "#e0e0e0" : "#202020")} !important;
    border-color: ${({ isDark }) => (isDark ? "#00f2fe" : "#7250FF")} !important;
    box-shadow: 0 0 0 0.2rem ${({ isDark }) => (isDark ? "rgba(0,242,254,.15)" : "rgba(114,80,255,.25)")} !important;
  }
  &::placeholder {
    color: ${({ isDark }) => (isDark ? "#aaa" : "#999")} !important;
    opacity: 1;
  }
  transition: none;
`;
