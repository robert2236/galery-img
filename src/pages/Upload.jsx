import React, { useState, useRef, useEffect } from "react";
import { Row, Col, Form } from "react-bootstrap";
import { FaCloudUploadAlt, FaTrashAlt } from "react-icons/fa";
import AsyncSelect from "react-select/async";
import axios from "axios";
import upload from "../images/upload.svg";
import { useForm } from "react-hook-form";
import api from "../Auth/Api";
import { toast } from "react-toastify";


export function Upload() {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [base64String, setBase64String] = useState("");
  const [fileName, setFileName] = useState("");
  const [fileType, setFileType] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [user, setUsers] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm();

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);

    const files = event.dataTransfer.files;
    if (files.length > 0) {
      processFile(files[0]);
    }
  };

  const processFile = (file) => {
    setFileName(file.name);
    setFileType(file.type);

    const reader = new FileReader();

    reader.onload = (e) => {
      const base64 = e.target.result;
      setBase64String(base64);
    };

    reader.onerror = (error) => {
      console.error("Error converting file to Base64:", error);
    };

    reader.readAsDataURL(file);
  };

  const handleContainerClick = () => {
    if (!base64String) {
      fileInputRef.current?.click();
    }
  };

  const clearFile = () => {
    setBase64String("");
    reset();
    selectedCategory(null);
    setFileName("");
    setFileType("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const getUsers = async () => {
    try {
      const response = await api.get("/api/users");
      setUsers(response.data);
      return response.data;
    } catch (err) {
      toast.error(err.response?.data?.detail || "Error al obtener usuarios");
      throw err;
    } finally {
    }
  };

  useEffect(() => {
    getUsers();
  }, []);

  const loadOptions = async (inputValue) => {
    try {
      const response = await axios.get(
        `/api/categories/autocomplete?q=${encodeURIComponent(
          inputValue
        )}&limit=20`
      );

      const categoryNames = response.data;

      return categoryNames.map((name) => ({
        value: name,
        label: name.charAt(0).toUpperCase() + name.slice(1),
      }));
    } catch (error) {
      console.error("Error loading categories:", error);
      return [];
    }
  };

  const handleChange = (selectedOption) => {
    setSelectedCategory(selectedOption);
  };

  const isImage = fileType.startsWith("image/");

  const uploadFile = (data) => {
    setLoading(true);
    data.category = selectedCategory?.value;
    data.image_url = base64String;
    data.user_id = user?.user_id;
    

    if (!data.category) {
      toast.warning("Debes de seleccionar una categoria");
      return;
    }

    if (!data.image_url) {
      toast.warning("Debes de seleccionar una imagen");
      return;
    }

    if (!data.title) {
      toast.warning("Debes de colocar un título");
      return;
    }

    try {
      const response = axios.post("/api/create_image", data);
      if (response){
      toast.success("¡Imagen cargada de forma exitosa!");
      }
      reset();
      setSelectedCategory(null);
      setBase64String("");
    } catch (error) {
      toast.error("Hubo un error al subir la imagen");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-bg text-light" style={{ margin: '-1rem -2rem', padding: '1.5rem 2rem 80px', minHeight: 'calc(100vh - 30px)' }}>
      <div className="m-4 m-sm-5">
        <div className="d-flex align-items-center mt-5 w-100">
          <FaCloudUploadAlt size={28} className="me-2 text-info" />
          <h3 className="text-light fw-light mb-0" style={{ letterSpacing: '1px' }}>Subir imagen</h3>
        </div>
        <hr className="mb-5" style={{ borderColor: 'rgba(0,242,254,0.12)', opacity: 0.3 }} />
      <Row
        className="p-sm-5 p-2 mb-3 d-flex justify-content-center gap-lg-5"
        style={{ borderRadius: '15px', border: '1px solid rgba(0,242,254,0.12)', background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(8px)' }}
      >
        <Col xs={12} lg={6}>
          <form onSubmit={handleSubmit(uploadFile)}>
            <div>
              <Form.Group className="mb-3">
                <Form.Label className="text-light fw-semibold small">T&iacute;tulo</Form.Label>
                <Form.Control {...register("title")} type="text" className="bg-dark text-light border-secondary" style={{ borderColor: 'rgba(0,242,254,0.15) !important' }} />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label className="text-light fw-semibold small">Categoria</Form.Label>
                <AsyncSelect
                  cacheOptions
                  defaultOptions
                  loadOptions={loadOptions}
                  onChange={handleChange}
                  value={selectedCategory}
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
                      "&:hover": {
                        borderColor: "rgba(0,242,254,0.3)",
                      },
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
                      "&:hover": {
                        backgroundColor: "rgba(0,242,254,0.15)",
                      },
                    }),
                    singleValue: (base) => ({
                      ...base,
                      color: "#fff",
                    }),
                    input: (base) => ({
                      ...base,
                      color: "#fff",
                    }),
                    placeholder: (base) => ({
                      ...base,
                      color: "rgba(255,255,255,0.4)",
                    }),
                  }}
                />
              </Form.Group>
            </div>

            <div className="d-flex flex-row gap-3 justify-content-center mt-4">
              <button className="btn btn-outline-info rounded-pill px-4 d-flex align-items-center gap-1" type="submit">
                <FaCloudUploadAlt size={18} />
                Subir imagen
              </button>
              <button
                className="btn btn-outline-secondary rounded-pill px-4 d-flex align-items-center gap-1"
                type="button" 
                onClick={clearFile}
              >
                <FaTrashAlt size={14} />
                Limpiar
              </button>
            </div>
          </form>

          {base64String && (
            <div
              style={{
                marginTop: "20px",
                padding: "15px",
                background: "rgba(255,255,255,0.03)",
                borderRadius: "12px",
                border: "1px solid rgba(255,255,255,0.06)",
                backdropFilter: "blur(8px)",
              }}
            >
              <h4 style={{ margin: "0 0 10px 0", color: "#00f2fe", fontSize: "1rem", fontWeight: 600 }}>
                Informaci&oacute;n del archivo:
              </h4>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: "10px",
                  color: "#c0c0c0",
                }}
              >
                <div>
                  <strong style={{ color: "#e0e0e0" }}>Nombre:</strong> {fileName}
                </div>
                <div>
                  <strong style={{ color: "#e0e0e0" }}>Tipo:</strong> {fileType || "Desconocido"}
                </div>
                <div>
                  <strong style={{ color: "#e0e0e0" }}>Tama&ntilde;o:</strong>{" "}
                  {Math.round(base64String.length / 1024)} KB
                </div>
              </div>
            </div>
          )}
        </Col>
        <Col xs={12} lg={5} className="ps-4 pe-4">
          <div className="mt-4 mb-4 mt-lg-0 mb-lg-0" style={{ width: "100%", margin: "0 auto" }}>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              style={{ display: "none" }}
              accept="*/*"
            />

            <div
              style={{
                borderRadius: "15px",
                border: isDragging
                  ? "2px dashed #00f2fe"
                  : base64String
                  ? "2px solid #6bcf7f"
                  : "2px dashed rgba(0,242,254,0.2)",
                height: "auto",
                display: "flex",
                width: "100%",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: isDragging
                  ? "rgba(0,242,254,0.05)"
                  : base64String
                  ? "rgba(255,255,255,0.03)"
                  : "rgba(255,255,255,0.02)",
                cursor: base64String ? "default" : "pointer",
                transition: "all 0.3s ease",
                textAlign: "center",
                overflow: "hidden",
                position: "relative",
              }}
              onClick={handleContainerClick}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {base64String ? (
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {/* Preview según el tipo de archivo */}
                  {isImage ? (
                    <img
                      src={base64String}
                      alt="Preview"
                      style={{
                        width: "100%", // Ocupa todo el ancho
                        height: "100%", // Ocupa toda la altura
                        objectFit: "cover", // Cubre todo el contenedor (puede recortarse)
                        // objectFit: "contain"  // Alternativa: muestra imagen completa sin recortar
                        borderRadius: "10px",
                      }}
                    />
                  ) : (
                      <div
                        style={{
                          width: "100%",
                          height: "100%",
                          overflow: "auto",
                          backgroundColor: "#0a0a0a",
                          borderRadius: "10px",
                          textAlign: "left",
                        }}
                      >
                        <pre
                          style={{
                            margin: 0,
                            whiteSpace: "pre-wrap",
                            wordBreak: "break-word",
                            color: "#c0c0c0",
                          }}
                      >
                        {atob(base64String.split(",")[1]).substring(0, 1000)}
                        {atob(base64String.split(",")[1]).length > 1000 &&
                          "..."}
                      </pre>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <div
                    style={{
                      fontSize: "64px",
                      marginBottom: "20px",
                      color: "rgba(255,255,255,0.15)",
                    }}
                  >
                    <img
                      style={{ width: "80px", height: "80px", opacity: 0.5 }}
                      src={upload}
                      alt=""
                    />
                  </div>
                  <p
                    style={{
                      fontSize: "18px",
                      color: "rgba(255,255,255,0.4)",
                      marginBottom: "10px",
                      padding: "20px",
                      fontWeight: "bold",
                    }}
                  >
                    {isDragging
                      ? "¡Suelta el archivo aquí!"
                      : "Haz clic o arrastra un archivo"}
                  </p>
                </>
              )}
            </div>
          </div>
        </Col>
      </Row>
      </div>
    </div>
  );
}
