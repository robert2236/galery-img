import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Home } from "../pages/Home";
import { Estadisticas } from "../pages/Estadisticas";
import { Productos } from "../pages/Productos";
import { Diagramas } from "../pages/Diagramas";
import { Reportes } from "../pages/Reportes";
import { Login } from "../pages/Login";
import  {useAuth} from "../Auth/Auth";
import { useNavigate, Navigate } from 'react-router-dom';


const PrivateRoute = ({ children }) => {
const { auth } = useAuth(); // Asegúrate que useAuth devuelva un objeto con propiedad auth
const navigate = useNavigate();
  return auth ? children : <Navigate to="/" replace />;
};

export function MyRoutes() {
  return (
   <Routes>
      {/* Ruta pública */}
      <Route path="/" element={<Login />} />
      
      {/* Rutas privadas */}
      <Route path="/productos" element={
        <PrivateRoute>
          <Productos />
        </PrivateRoute>
      } />
      
      <Route path="/estadisticas" element={
        <PrivateRoute>
          <Estadisticas />
        </PrivateRoute>
      } />
      
      <Route path="/diagramas" element={
        <PrivateRoute>
          <Diagramas />
        </PrivateRoute>
      } />
      
      <Route path="/reportes" element={
        <PrivateRoute>
          <Reportes />
        </PrivateRoute>
      } />
      
      <Route path="/home" element={
        <PrivateRoute>
          <Home />
        </PrivateRoute>
      } />
    </Routes>
  );
}