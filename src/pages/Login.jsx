import React, { useState, useContext, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { Button, Card, Container, Form } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { AuthApi } from "../Auth/Auth";
import Cookies from "js-cookie";
import qs from "qs";
import axios from "axios";
import { FaUserPlus } from "react-icons/fa";
import { Tooltip } from "react-tooltip";
import { toast } from "react-toastify";


// Importa tu Masonry
import Masonry from "../components/Masonry/Masonry";

export function Login() {
  const { login: setAuth } = useContext(AuthApi);
  const [darkMode, setDarkMode] = useState(false);
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const masonryContainerRef = useRef(null);

  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm();

  const handleLogin = async (data) => {
    setLoading(true);

    try {
      const response = await axios.post(
        "/api/login",
        qs.stringify({
          username: data.username,
          password: data.password,
        }),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      Cookies.set("token", response.data.access_token);
      setAuth(response.data.access_token);
      navigate("/home");
    } catch (error) {
      toast.error(
        error.response?.status === 401
          ? "Credenciales inválidas"
          : "Error en el servidor"
      );
    } finally {
      setLoading(false);
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);

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
            <Form onSubmit={handleSubmit(handleLogin)}>
              {/* Botón registro */}
              <div className="d-flex justify-content-end mb-3">
                <Link
                  to="/register"
                  data-tooltip-id="user-add-tooltip"
                  data-tooltip-content="Registrar usuario"
                  className="tooltip-link"
                  style={{
                    textDecoration: "none",
                    transition: "all 0.3s ease",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    backgroundColor: darkMode 
                      ? "rgba(255,255,255,0.1)" 
                      : "rgba(0,0,0,0.1)",
                    color: darkMode ? "#ffffff" : "#333333"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "scale(1.1)";
                    e.currentTarget.style.backgroundColor = darkMode 
                      ? "rgba(255,255,255,0.2)" 
                      : "rgba(0,0,0,0.2)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "scale(1)";
                    e.currentTarget.style.backgroundColor = darkMode 
                      ? "rgba(255,255,255,0.1)" 
                      : "rgba(0,0,0,0.1)";
                  }}
                >
                  <FaUserPlus size={22} />
                </Link>
              </div>

              <Tooltip id="user-add-tooltip" />

              <div>
                <div className="d-flex justify-content-center align-items-center mb-4">
                  <h1 style={{
                    fontWeight: "700",
                    fontSize: isMobile ? "1.8rem" : "2.2rem",
                    color: darkMode ? "#ffffff" : "#333333",
                    margin: 0
                  }}>
                    {isMobile ? "Login" : "Iniciar Sesión"}
                  </h1>
                </div>

                <Form.Group className="mb-3">
                  <Form.Label style={{ 
                    fontWeight: "600",
                    color: darkMode ? "#ffffff" : "#333333",
                    fontSize: isMobile ? "0.95rem" : "1rem"
                  }}>
                    Username
                  </Form.Label>
                  <Form.Control
                    type="text"
                    isInvalid={!!errors.username}
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
                      minLength: {
                        value: 3,
                        message: "Mínimo 3 caracteres",
                      },
                    })}
                  />
                  <Form.Control.Feedback type="invalid" style={{ fontSize: "0.85rem" }}>
                    {errors.username?.message}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label style={{ 
                    fontWeight: "600",
                    color: darkMode ? "#ffffff" : "#333333",
                    fontSize: isMobile ? "0.95rem" : "1rem"
                  }}>
                    Password
                  </Form.Label>
                  <Form.Control
                    type="password"
                    isInvalid={!!errors.password}
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
                      required: "Contraseña es requerido",
                      minLength: {
                        value: 4,
                        message: "Mínimo 4 caracteres",
                      },
                    })}
                  />
                  <Form.Control.Feedback type="invalid" style={{ fontSize: "0.85rem" }}>
                    {errors.password?.message}
                  </Form.Control.Feedback>
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
                      "INGRESAR"
                    )}
                  </Button>
                </div>
              </div>
            </Form>
          </div>
        </Card>
      </Container>
    </div>
  );
}