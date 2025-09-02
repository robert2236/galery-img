import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Button, Card, Container, Form, Row, Col } from "react-bootstrap";
import { Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { Tooltip } from "react-tooltip";

export const Register = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(false);

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

  return (
    <div
      className={darkMode ? "bg-dark" : "bg-light"}
      style={{ minHeight: "100vh" }}
    >
      <div style={{ position: "absolute", right: "20px", top: "20px" }}>
        <Button
          variant={darkMode ? "light" : "dark"}
          onClick={toggleDarkMode}
          size="sm"
        >
          {darkMode ? "☀️" : "🌙"}
        </Button>
      </div>
      <Container
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "100vh" }}
      >
        <Card
          className={`p-4 ${
            darkMode ? "bg-secondary text-white" : "bg-white text-dark"
          }`}
          style={{
            width: "100%",
            maxWidth: "400px",
            boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
          }}
        >
          <Form onSubmit={handleSubmit(registerUser)}>
            <div className="p-2">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="text-center w-100 m-0">Registrarse</h2>
              </div>
              <Row>
                <Col>
                  <Form.Group className="mb-3">
                    <Form.Label>Nombre:</Form.Label>
                    <Form.Control
                      type="text"
                      className={
                        darkMode ? "bg-dark text-white border-secondary" : ""
                      }
                      {...register("name", {
                        required: "Nombre es requerido",
                        maxLength: {
                          value: 30,
                          message: "Máximo 30 caracteres",
                        },
                      })}
                    />
                    {errors.name && (
                      <Form.Text className="text-danger">
                        {errors.name.message}
                      </Form.Text>
                    )}
                  </Form.Group>
                </Col>
                <Col>
                  <Form.Group className="mb-3">
                    <Form.Label>Apellido:</Form.Label>
                    <Form.Control
                      type="text"
                      className={
                        darkMode ? "bg-dark text-white border-secondary" : ""
                      }
                      {...register("surname", {
                        required: "Apellido es requerido",
                        maxLength: {
                          value: 30,
                          message: "Máximo 30 caracteres",
                        },
                      })}
                    />
                    {errors.surname && (
                      <Form.Text className="text-danger">
                        {errors.surname.message}
                      </Form.Text>
                    )}
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col>
                  <Form.Group className="mb-3">
                    <Form.Label>Usuario:</Form.Label>
                    <Form.Control
                      type="text"
                      className={
                        darkMode ? "bg-dark text-white border-secondary" : ""
                      }
                      {...register("username", {
                        required: "Username es requerido",
                        maxLength: {
                          value: 20,
                          message: "Máximo 20 caracteres",
                        },
                      })}
                    />
                    {errors.username && (
                      <Form.Text className="text-danger">
                        {errors.username.message}
                      </Form.Text>
                    )}
                  </Form.Group>
                </Col>
                <Col>
                  <Form.Group className="mb-3">
                    <Form.Label>Correo:</Form.Label>
                    <Form.Control
                      type="email"
                      className={
                        darkMode ? "bg-dark text-white border-secondary" : ""
                      }
                      {...register("email", {
                        required: "Correo electrónico es requerido",
                        pattern: {
                          value:
                            /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                          message:
                            "Formato de correo inválido (ejemplo: usuario@dominio.com)",
                        },
                        maxLength: {
                          value: 254,
                          message:
                            "El correo no puede tener más de 254 caracteres",
                        },
                        minLength: {
                          value: 5,
                          message: "El correo debe tener al menos 5 caracteres",
                        },
                      })}
                    />
                    {errors.email && (
                      <Form.Text className="text-danger">
                        {errors.email.message}
                      </Form.Text>
                    )}
                  </Form.Group>
                </Col>
              </Row>
              <Form.Group className="mb-3">
                <Form.Label htmlFor="password">Contraseña:</Form.Label>
                <Form.Control
                  type="password"
                  className={
                    darkMode ? "bg-dark text-white border-secondary" : ""
                  }
                  {...register("password", {
                    required: "Contraseña es requerida",
                    minLength: {
                      value: 8,
                      message: "Mínimo 8 caracteres",
                    },
                  })}
                />
                {errors.password && (
                  <Form.Text className="text-danger">
                    {errors.password.message}
                  </Form.Text>
                )}
              </Form.Group>
              <div className="d-grid gap-2 ">
                <Button
                  variant={darkMode ? "light" : "primary"}
                  className="mt-3"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? "Cargando..." : "REGISTRARSE"}
                </Button>
              </div>
              
              {/* Enlace para ir a login */}
              <div className="text-center mt-3">
                <Link 
                  to="/" 
                  className={darkMode ? "text-light" : "text-dark"}
                  style={{ textDecoration: 'none' }}
                >
                  ¿Ya tienes cuenta? Inicia sesión
                </Link>
              </div>
            </div>
          </Form>
        </Card>
      </Container>
    </div>
  );
};