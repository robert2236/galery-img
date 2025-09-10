import styled from "styled-components";
import React, { useState, useRef, useEffect } from "react";
import { Row, Col, Form } from "react-bootstrap";
import { FaCloudUploadAlt } from "react-icons/fa";
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
    <Container className="m-4 m-sm-5">
      <div className="d-flex align-items-center mt-5">
        <FaCloudUploadAlt size={28} className="me-2" />
        <h3>Subir imagen</h3>
      </div>
      <hr className="mb-5" />
      <Row
        className="p-sm-5 p-2 mb-3 d-flex justify-content-center gap-lg-5"
        style={{ borderRadius: "15px", border: "2px solid #808080" }}
      >
        <Col xs={12} lg={6}>
          <form onSubmit={handleSubmit(uploadFile)}>
            <div>
              <Form.Group className="mb-3">
                <Form.Label>Título</Form.Label>
                <Form.Control {...register("title")} type="text" />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Categoria</Form.Label>
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
                      color: "#0000",
                      border: "2px solid #0000",
                      "&:hover": {
                        borderColor: "#0000",
                      },
                    }),
                  }}
                />
              </Form.Group>
            </div>

            <div className="d-flex flex-row gap-4 justify-content-center mt-4">
              <button
                style={{
                  padding: "8px 15px",
                  backgroundColor: "#198754",
                  color: "white",
                  border: "none",
                  borderRadius: "20px",
                  cursor: "pointer",
                  fontSize: "12px",
                }}
                type="submit"
              >
                <FaCloudUploadAlt size={20} className="me-2" />
                Subir imagen
              </button>
              <button
                type="button" 
                onClick={clearFile}
                style={{
                  padding: "8px 15px",
                  backgroundColor: "#dc3545",
                  color: "white",
                  border: "none",
                  borderRadius: "20px",
                  cursor: "pointer",
                  fontSize: "12px",
                }}
              >
                🗑️ Limpiar
              </button>
            </div>
          </form>

          {base64String && (
            <div
              style={{
                marginTop: "20px",
                padding: "15px",
                backgroundColor: "#f8f9fa",
                borderRadius: "10px",
                border: "1px solid #e9ecef",
              }}
            >
              <h4 style={{ margin: "0 0 10px 0", color: "#495057" }}>
                📊 Información del archivo:
              </h4>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: "10px",
                }}
              >
                <div>
                  <strong>Nombre:</strong> {fileName}
                </div>
                <div>
                  <strong>Tipo:</strong> {fileType || "Desconocido"}
                </div>
                <div>
                  <strong>Tamaño :</strong>{" "}
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
                  ? "2px dashed #007bff"
                  : base64String
                  ? "2px solid #28a745"
                  : "2px dashed #808080",
                height: "auto",
                display: "flex",
                width: "100%",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: isDragging
                  ? "#f0f8ff"
                  : base64String
                  ? "#f8f9fa"
                  : "#f9f9f9",
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
                        backgroundColor: "#f5f5f5",
                        borderRadius: "10px",
                        textAlign: "left",
                      }}
                    >
                      <pre
                        style={{
                          margin: 0,
                          whiteSpace: "pre-wrap",
                          wordBreak: "break-word",
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
                      color: "#6c757d",
                    }}
                  >
                    <img
                      style={{ width: "80px", height: "80px" }}
                      src={upload}
                      alt=""
                    />
                  </div>
                  <p
                    style={{
                      fontSize: "18px",
                      color: "#666",
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
    </Container>
  );
}
const Container = styled.div`
  height: auto;
`;
