import React, { useState, useContext } from "react";
import { useForm } from "react-hook-form";
import { Button, Card, Container, Form } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { AuthApi } from '../Auth/Auth';
import Cookies from "js-cookie";
import qs from "qs";
import axios from "axios"

export function Login() {
  const { login: setAuth } = useContext(AuthApi);
  const [darkMode, setDarkMode] = useState(false);
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm();

const handleLogin = async (data) => {  // Cambia el nombre de handleSubmit a handleLogin
  setLoading(true);
  
  try {
    const response = await axios.post("/api/login", qs.stringify({
      username: data.username,
      password: data.password
    }), {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      }
    });

    Cookies.set("token", response.data.access_token);
    setAuth(response.data.access_token);
    navigate("/home");
    
  } catch (error) {
    setError(
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

  return (
    <div className={darkMode ? "bg-dark" : "bg-light"} style={{ minHeight: '100vh' }}>
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
        style={{ minHeight: '100vh' }}
      >
        <Card 
          className={`p-4 ${darkMode ? "bg-secondary text-white" : "bg-white text-dark"}`} 
          style={{ 
            width: '100%', 
            maxWidth: '400px',
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
          }}
        >
          <Form onSubmit={handleSubmit(handleLogin)}>
            <div className='p-2'>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h1 className="text-center w-100 m-0">Login</h1>
              </div>
              
              <Form.Group className='mb-3'>
                <Form.Label htmlFor="username">Username:</Form.Label>
                <Form.Control
                  type="text"
                  id="username"
                  className={darkMode ? "bg-dark text-white border-secondary" : ""}
                  isInvalid={!!errors.username}
                  {...register("username", { 
                    required: "Username es requerido",
                    minLength: {
                      value: 3,
                      message: "Mínimo 3 caracteres"
                    }
                  })}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.username?.message}
                </Form.Control.Feedback>
              </Form.Group>
              
              <Form.Group className='mb-3'>
                <Form.Label htmlFor="password">Password:</Form.Label>
                <Form.Control
                  type="password"
                  id="password"
                  className={darkMode ? "bg-dark text-white border-secondary" : ""}
                  isInvalid={!!errors.password}
                  {...register("password", { 
                    required: "Password es requerido",
                    minLength: {
                      value: 4,
                      message: "Mínimo 4 caracteres"
                    }
                  })}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.password?.message}
                </Form.Control.Feedback>
              </Form.Group>
              
              {error && (
                <div className="alert alert-danger">
                  {error}
                </div>
              )}
              
              <div className="d-grid gap-2 ">
                <Button 
                  variant={darkMode ? "light" : "primary"} 
                  className="mt-3"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? "Cargando..." : "SUBMIT"}
                </Button>
              </div>
            </div>
          </Form>
        </Card>
      </Container>
    </div>
  );
}