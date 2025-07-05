import React, { useState } from 'react';
import { Button, Card, Container } from "react-bootstrap";

export function Login() {
  const [darkMode, setDarkMode] = useState(false);

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
          <div className='p-2'>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h1 className="text-center w-100 m-0">Login</h1>
            </div>
            <div className='d-flex flex-column mb-3'>
              <label className='mb-2' htmlFor="username">Username:</label>
              <input 
                type="text" 
                id="username"
                className={`form-control ${darkMode ? "bg-dark text-white border-secondary" : ""}`}
              />
            </div>
            <div className='d-flex flex-column mb-3'>
              <label className='mb-2' htmlFor="password">Password:</label>
              <input 
                type="password" 
                id="password"
                className={`form-control ${darkMode ? "bg-dark text-white border-secondary" : ""}`}
              />
            </div>
            <div className="d-grid gap-2">
              <Button variant={darkMode ? "light" : "primary"} className="mt-3">
                SUBMIT
              </Button>
            </div>
          </div>
        </Card>
      </Container>
    </div>
  );
}