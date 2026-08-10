import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Home } from "../pages/Home";
import { Upload } from "../pages/Upload";
import { Productos } from "../pages/Productos";
import { Diagramas } from "../pages/Diagramas";
import { Reportes } from "../pages/Reportes";
import { Login } from "../pages/Login";
import { Config } from "../pages/Config";
import { MyGallery } from "../pages/MyGallery";
import { PublicGallery } from "../pages/PublicGallery";

import { useAuth } from "../Auth/Auth";
import { useNavigate, Navigate } from "react-router-dom";
import { Register } from "../pages/Register";

const PrivateRoute = ({ children }) => {
  const { auth } = useAuth(); 
  const navigate = useNavigate();
  return auth ? children : <Navigate to="/" replace />;
};

export function MyRoutes() {
  return (
    <Routes>
      {/* Ruta pública */}
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/user/:user_id" element={<PublicGallery />} />

      {/* Rutas privadas */}
      <Route
        path="/debug"
        element={
          <PrivateRoute>
            <Productos />
          </PrivateRoute>
        }
      />

      <Route
        path="/upload"
        element={
          <PrivateRoute>
            <Upload />
          </PrivateRoute>
        }
      />

      <Route
        path="/health"
        element={
          <PrivateRoute>
            <Diagramas />
          </PrivateRoute>
        }
      />

      <Route
        path="/reportes"
        element={
          <PrivateRoute>
            <Reportes />
          </PrivateRoute>
        }
      />

      <Route
        path="/home"
        element={
          <PrivateRoute>
            <Home />
          </PrivateRoute>
        }
      />
      <Route
        path="/Config"
        element={
          <PrivateRoute>
            <Config />
          </PrivateRoute>
        }
      />
      <Route
        path="/my-gallery"
        element={
          <PrivateRoute>
            <MyGallery />
          </PrivateRoute>
        }
      />
    </Routes>
  );
}
