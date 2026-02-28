import React, { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { Button, Card, Container, Form, Row, Col } from "react-bootstrap";
import { Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { Tooltip } from "react-tooltip";

// Importa tu Masonry
import Masonry from "../components/Masonry/Masonry";

export const Register = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const masonryContainerRef = useRef(null);

  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm();

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };


  const registerUser = async (data) => {
    setLoading(true);
    try {
      await axios.post("/api/register", data);
      toast.success("¡Usuario registrado de forma exitosa!");
    } catch (error) {
      toast.error("Hubo un error al registrar el usuario");
    } finally {
      setLoading(false);
    }
  };

  // Efecto para detectar mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Aplicar clase CSS para modo oscuro al body
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [darkMode]);

  return (
    <div
      style={{ 
        minHeight: "100vh", 
        position: "relative", 
        overflow: "hidden",
        backgroundColor: darkMode ? "#121212" : "#f8f9fa"
      }}
    >
      {/* Masonry - IMÁGENES COMPLETAMENTE VISIBLES */}
      <div 
        ref={masonryContainerRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: "100%",
          height: "100%",
          opacity: 1, // Máxima opacidad
          filter: "none", // SIN FILTRO
          pointerEvents: "none",
          zIndex: 1,
        }}
      >
        <Masonry />
      </div>

      {/* SOLO UN OVERLAY MUY SUAVE para mejorar contraste del formulario */}
      <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: darkMode 
          ? "rgba(0, 0, 0, 0.15)" // MÍNIMA opacidad (15%)
          : "rgba(255, 255, 255, 0.15)", // MÍNIMA opacidad (15%)
        zIndex: 2,
        pointerEvents: "none"
      }} />

      {/* Botón toggle dark mode */}
      <div style={{ 
        position: "absolute", 
        right: "20px", 
        top: "20px", 
        zIndex: 3,
      }} onClick={toggleDarkMode}>
        <Button
          variant={darkMode ? "light" : "dark"}
          size="sm"
          style={{
            boxShadow: "0 4px 15px rgba(0,0,0,0.3)",
            border: "none",
            backgroundColor: darkMode ? "#ffffff" : "#343a40",
            color: darkMode ? "#000000" : "#ffffff",
            fontWeight: "600"
          }}
        >
          {darkMode ? "☀️" : "🌙"}
        </Button>
      </div>

      <Container
        className="d-flex justify-content-center align-items-center"
        style={{ 
          minHeight: "100vh", 
          position: "relative", 
          zIndex: 3,
          padding: isMobile ? "20px" : "40px"
        }}
      >
        <Card
          style={{
            width: "100%",
            maxWidth: isMobile ? "100%" : "420px",
            boxShadow: "0 25px 50px rgba(0,0,0,0.5)",
            border: "none",
            backgroundColor: darkMode 
              ? "rgba(30, 30, 30, 0.85)" 
              : "rgba(255, 255, 255, 0.85)",
            borderRadius: isMobile ? "16px" : "20px",
            overflow: "hidden",
            borderWidth: "1px",
            borderStyle: "solid",
            borderColor: darkMode 
              ? "rgba(255,255,255,0.1)" 
              : "rgba(0,0,0,0.1)",
          }}
        >
          {/* Borde decorativo */}
          <div style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "4px",
            background: darkMode 
              ? "linear-gradient(90deg, #667eea, #764ba2)"
              : "linear-gradient(90deg, #007bff, #00d4ff)",
            zIndex: 1
          }} />

          <div style={{ position: "relative", zIndex: 2, padding: "1.5rem" }}>
            <Form onSubmit={handleSubmit(registerUser)}>
              <div className="p-2">
                <div className="d-flex justify-content-center align-items-center mb-4">
                  <h2 style={{
                    fontWeight: "700",
                    fontSize: isMobile ? "1.8rem" : "2.2rem",
                    color: darkMode ? "#ffffff" : "#333333",
                    margin: 0
                  }}>
                    {isMobile ? "Registro" : "Crear Cuenta"}
                  </h2>
                </div>
                
                <Row>
                  <Col xs={12} sm={6}>
                    <Form.Group className="mb-3">
                      <Form.Label style={{ 
                        fontWeight: "600",
                        color: darkMode ? "#ffffff" : "#333333",
                        fontSize: isMobile ? "0.95rem" : "1rem"
                      }}>
                        Nombre:
                      </Form.Label>
                      <Form.Control
                        type="text"
                        style={{
                          borderRadius: "10px",
                          border: darkMode 
                            ? "1px solid rgba(255,255,255,0.2)" 
                            : "1px solid rgba(0,0,0,0.2)",
                          padding: isMobile ? "12px" : "14px",
                          fontSize: isMobile ? "0.95rem" : "1rem",
                          backgroundColor: darkMode 
                            ? "rgba(255,255,255,0.1)" 
                            : "rgba(255,255,255,0.9)",
                          color: darkMode ? "#ffffff" : "#333333"
                        }}
                        {...register("name", {
                          required: "Nombre es requerido",
                          maxLength: {
                            value: 30,
                            message: "Máximo 30 caracteres",
                          },
                        })}
                      />
                      {errors.name && (
                        <div className="text-danger mt-1" style={{ fontSize: "0.85rem" }}>
                          {errors.name.message}
                        </div>
                      )}
                    </Form.Group>
                  </Col>
                  <Col xs={12} sm={6}>
                    <Form.Group className="mb-3">
                      <Form.Label style={{ 
                        fontWeight: "600",
                        color: darkMode ? "#ffffff" : "#333333",
                        fontSize: isMobile ? "0.95rem" : "1rem"
                      }}>
                        Apellido:
                      </Form.Label>
                      <Form.Control
                        type="text"
                        style={{
                          borderRadius: "10px",
                          border: darkMode 
                            ? "1px solid rgba(255,255,255,0.2)" 
                            : "1px solid rgba(0,0,0,0.2)",
                          padding: isMobile ? "12px" : "14px",
                          fontSize: isMobile ? "0.95rem" : "1rem",
                          backgroundColor: darkMode 
                            ? "rgba(255,255,255,0.1)" 
                            : "rgba(255,255,255,0.9)",
                          color: darkMode ? "#ffffff" : "#333333"
                        }}
                        {...register("surname", {
                          required: "Apellido es requerido",
                          maxLength: {
                            value: 30,
                            message: "Máximo 30 caracteres",
                          },
                        })}
                      />
                      {errors.surname && (
                        <div className="text-danger mt-1" style={{ fontSize: "0.85rem" }}>
                          {errors.surname.message}
                        </div>
                      )}
                    </Form.Group>
                  </Col>
                </Row>
                
                <Row>
                  <Col xs={12} sm={6}>
                    <Form.Group className="mb-3">
                      <Form.Label style={{ 
                        fontWeight: "600",
                        color: darkMode ? "#ffffff" : "#333333",
                        fontSize: isMobile ? "0.95rem" : "1rem"
                      }}>
                        Usuario:
                      </Form.Label>
                      <Form.Control
                        type="text"
                        style={{
                          borderRadius: "10px",
                          border: darkMode 
                            ? "1px solid rgba(255,255,255,0.2)" 
                            : "1px solid rgba(0,0,0,0.2)",
                          padding: isMobile ? "12px" : "14px",
                          fontSize: isMobile ? "0.95rem" : "1rem",
                          backgroundColor: darkMode 
                            ? "rgba(255,255,255,0.1)" 
                            : "rgba(255,255,255,0.9)",
                          color: darkMode ? "#ffffff" : "#333333"
                        }}
                        {...register("username", {
                          required: "Username es requerido",
                          maxLength: {
                            value: 20,
                            message: "Máximo 20 caracteres",
                          },
                        })}
                      />
                      {errors.username && (
                        <div className="text-danger mt-1" style={{ fontSize: "0.85rem" }}>
                          {errors.username.message}
                        </div>
                      )}
                    </Form.Group>
                  </Col>
                  <Col xs={12} sm={6}>
                    <Form.Group className="mb-3">
                      <Form.Label style={{ 
                        fontWeight: "600",
                        color: darkMode ? "#ffffff" : "#333333",
                        fontSize: isMobile ? "0.95rem" : "1rem"
                      }}>
                        Correo:
                      </Form.Label>
                      <Form.Control
                        type="email"
                        style={{
                          borderRadius: "10px",
                          border: darkMode 
                            ? "1px solid rgba(255,255,255,0.2)" 
                            : "1px solid rgba(0,0,0,0.2)",
                          padding: isMobile ? "12px" : "14px",
                          fontSize: isMobile ? "0.95rem" : "1rem",
                          backgroundColor: darkMode 
                            ? "rgba(255,255,255,0.1)" 
                            : "rgba(255,255,255,0.9)",
                          color: darkMode ? "#ffffff" : "#333333"
                        }}
                        {...register("email", {
                          required: "Correo electrónico es requerido",
                          pattern: {
                            value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                            message: "Formato de correo inválido (ejemplo: usuario@dominio.com)",
                          },
                          maxLength: {
                            value: 254,
                            message: "El correo no puede tener más de 254 caracteres",
                          },
                          minLength: {
                            value: 5,
                            message: "El correo debe tener al menos 5 caracteres",
                          },
                        })}
                      />
                      {errors.email && (
                        <div className="text-danger mt-1" style={{ fontSize: "0.85rem" }}>
                          {errors.email.message}
                        </div>
                      )}
                    </Form.Group>
                  </Col>
                </Row>
                
                <Form.Group className="mb-3">
                  <Form.Label style={{ 
                    fontWeight: "600",
                    color: darkMode ? "#ffffff" : "#333333",
                    fontSize: isMobile ? "0.95rem" : "1rem"
                  }}>
                    Contraseña:
                  </Form.Label>
                  <Form.Control
                    type="password"
                    style={{
                      borderRadius: "10px",
                      border: darkMode 
                        ? "1px solid rgba(255,255,255,0.2)" 
                        : "1px solid rgba(0,0,0,0.2)",
                      padding: isMobile ? "12px" : "14px",
                      fontSize: isMobile ? "0.95rem" : "1rem",
                      backgroundColor: darkMode 
                        ? "rgba(255,255,255,0.1)" 
                        : "rgba(255,255,255,0.9)",
                      color: darkMode ? "#ffffff" : "#333333"
                    }}
                    {...register("password", {
                      required: "Contraseña es requerida",
                      minLength: {
                        value: 8,
                        message: "Mínimo 8 caracteres",
                      },
                    })}
                  />
                  {errors.password && (
                    <div className="text-danger mt-1" style={{ fontSize: "0.85rem" }}>
                      {errors.password.message}
                    </div>
                  )}
                </Form.Group>
                
                <div className="d-grid gap-2">
                  <Button
                    type="submit"
                    disabled={loading}
                    style={{
                      borderRadius: "10px",
                      padding: isMobile ? "14px" : "16px",
                      fontWeight: "600",
                      fontSize: isMobile ? "1rem" : "1.1rem",
                      border: "none",
                      background: loading 
                        ? (darkMode ? "#555" : "#ccc")
                        : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      color: "white",
                      transition: "all 0.3s ease",
                      marginTop: "10px"
                    }}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        {isMobile ? "Cargando..." : "Procesando..."}
                      </>
                    ) : (
                      "REGISTRARSE"
                    )}
                  </Button>
                </div>

                {/* Enlace para ir a login */}
                <div className="text-center mt-3">
                  <Link 
                    to="/" 
                    style={{ 
                      textDecoration: 'none',
                      color: darkMode ? "#667eea" : "#007bff",
                      fontWeight: "500",
                      fontSize: isMobile ? "0.9rem" : "1rem",
                      transition: "all 0.3s ease"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.textDecoration = "underline";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.textDecoration = "none";
                    }}
                  >
                    ¿Ya tienes cuenta? Inicia sesión
                  </Link>
                </div>
              </div>
            </Form>
          </div>
        </Card>
      </Container>
    </div>
  );
};