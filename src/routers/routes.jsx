import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Home } from "../pages/Home";
import { Estadisticas } from "../pages/Estadisticas";
import { Productos } from "../pages/Productos";
import {Diagramas} from "../pages/Diagramas";
import {Reportes} from "../pages/Reportes";
import {Login} from "../pages/Login";
export function MyRoutes() {
  return (
   
     
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/productos" element={<Productos />} />
        <Route path="/estadisticas" element={<Estadisticas />} />
        <Route path="/diagramas" element={<Diagramas />} />
        <Route path="/reportes" element={<Reportes />} />
        <Route path="/reportes" element={<Reportes />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    
  );
}
