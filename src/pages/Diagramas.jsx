import { MdHealthAndSafety } from "react-icons/md";
import React, { useState, useEffect } from "react";
import { Row, Col, Spinner } from "react-bootstrap";
import styled from "styled-components";
import axios from "axios";
import { toast } from "react-toastify";

// Importar iconos disponibles de react-icons/md
import {
  MdImage,
  MdCollections,
  MdTouchApp,
  MdTrendingUp,
  MdShowChart,
  MdInfo,
  MdStorage,
  MdSchema,
  MdVisibility
} from "react-icons/md";

export function Diagramas() {
  const [config, setConfig] = useState({});
  const [health, setHealth] = useState({});
  const [loadingHealth, setLoadingHealth] = useState(true);
  const [loadingConfig, setLoadingConfig] = useState(true);

  useEffect(() => {
    const getStatus = async () => {
      try {
        setLoadingConfig(true);
        const response = await axios.get("/system-status");
        setConfig(response.data);
      } catch (err) {
        toast.error(
          err.response?.data?.detail || "Error al obtener el estado del sistema"
        );
        throw err;
      } finally {
        setLoadingConfig(false);
      }
    };
    getStatus();
  }, []);

  useEffect(() => {
    const getHealth = async () => {
      try {
        setLoadingHealth(true);
        const response = await axios.get("/health");
        setHealth(response.data);
      } catch (err) {
        toast.error(
          err.response?.data?.detail || "Error al obtener el estado de salud"
        );
        throw err;
      } finally {
        setLoadingHealth(false);
      }
    };
    getHealth();
  }, []);

  const getIconForKey = (key) => {
    const iconMap = {
      total_images: <MdImage size={20} className="me-2 text-primary" />,
      images_with_features: (
        <MdCollections size={20} className="me-2 text-info" />
      ),
      images_with_interactions: (
        <MdTouchApp size={20} className="me-2 text-success" />
      ),
      feature_coverage: (
        <MdTrendingUp size={20} className="me-2 text-warning" />
      ),
      interaction_coverage: (
        <MdShowChart size={20} className="me-2 text-danger" />
      ),
      default: <MdInfo size={20} className="me-2 text-muted" />,
    };

    return iconMap[key] || iconMap.default;
  };


  const getHealthIconForKey = (key) => {
    const iconMap = {
      status: <MdHealthAndSafety size={20} className="me-2 text-primary" />,
      database: <MdStorage size={20} className="me-2 text-info" />,
      graph_nodes: <MdSchema size={20} className="me-2 text-success" />,
      graph_recommender: <MdSchema size={20} className="me-2 text-warning" />,
      visual_recommender: <MdVisibility size={20} className="me-2 text-danger" />,
      total_images: <MdImage size={20} className="me-2 text-primary" />,
      default: <MdInfo size={20} className="me-2 text-muted" />,
    };

    return iconMap[key] || iconMap.default;
  };


  const formatKeyName = (key) => {
    const names = {
      total_images: "Total de imágenes",
      images_with_features: "Imágenes con características",
      images_with_interactions: "Imágenes con interacciones",
      feature_coverage: "Cobertura de características",
      interaction_coverage: "Cobertura de interacciones",
    };

    return (
      names[key] ||
      key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
    );
  };


  const formatHealthKeyName = (key) => {
    const names = {
      status: "Estado del sistema",
      database: "Base de datos",
      graph_nodes: "Nodos del grafo",
      graph_recommender: "Recomendador de grafos",
      visual_recommender: "Recomendador visual",
      total_images: "Total de imágenes",
    };

    return (
      names[key] ||
      key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
    );
  };

  // Función para formatear el valor según su tipo
  const formatValue = (key, value) => {
    if (typeof value === 'boolean') {
      return value ? "Activado" : "Desactivado";
    }
    return value;
  };

  const getValueClass = (key, value) => {
    if (typeof value === 'boolean') {
      return value ? "text-success" : "text-danger";
    }
    if (typeof value === 'string') {
      if (value === 'healthy' || value === 'connected' || value === 'ready') {
        return "text-success";
      }
      return "text-danger";
    }
    return "";
  };

  return (
    <Container className="m-4 m-sm-5">
      <div>
        <div className="d-flex align-items-center mt-5 mb-2">
          <MdHealthAndSafety size={25} className="me-2" />
          <h3 className="mb-0">Estatus del sistema</h3>
        </div>
        <p>
          Se puede visualizar el estatus general del sistema y parámetros de los
          algoritmos utilizados.
        </p>
      </div>
      <hr className="mb-5" />
      <Row className="gap-sm-5 d-flex justify-content-center">
        <Col
          sm={5} xs={12}
          className="mb-4 mb-sm-0"
          style={{ borderRadius: "15px", border: "2px solid #808080" }}
        >
          {!loadingConfig && Object.keys(config).length > 0 ? (
            <div className="p-3 rounded shadow-sm">
              <h5 className="mb-3">Estado Actual del Sistema</h5>
              {Object.entries(config).map(([key, value], index, array) => (
                <React.Fragment key={index}>
                  <div className="d-flex align-items-center mb-2 p-2">
                    {getIconForKey(key)}
                    <div className="d-flex justify-content-between w-100">
                      <span className="fw-medium">{formatKeyName(key)}:</span>
                      <span className={`fw-bold ${getValueClass(key, value)}`}>
                        {formatValue(key, value)}
                      </span>
                    </div>
                  </div>
                  {index < array.length - 1 && <hr className="my-2" />}
                </React.Fragment>
              ))}
            </div>
          ) : (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '300px' }}>
              <Spinner animation="border" role="status" className="m-5" />
            </div>
          )}
        </Col>
        

        <Col
          sm={5} xs={12}
          style={{ borderRadius: "15px", border: "2px solid #808080" }}
        >
          {!loadingHealth && Object.keys(health).length > 0 ? (
            <div className="p-3 rounded shadow-sm">
              <h5 className="mb-3">Estado de Salud del Sistema</h5>
              {Object.entries(health).map(([key, value], index, array) => (
                <React.Fragment key={index}>
                  <div className="d-flex align-items-center mb-2 p-2">
                    {getHealthIconForKey(key)}
                    <div className="d-flex justify-content-between w-100">
                      <span className="fw-medium">{formatHealthKeyName(key)}:</span>
                      <span className={`fw-bold ${getValueClass(key, value)}`}>
                        {formatValue(key, value)}
                      </span>
                    </div>
                  </div>
                  {index < array.length - 1 && <hr className="my-2" />}
                </React.Fragment>
              ))}
            </div>
          ) : (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '300px' }}>
              <Spinner animation="border" role="status" className="m-5" />
            </div>
          )}
        </Col>
      </Row>
    </Container>
  );
}

const Container = styled.div`
  height: 100%;
`;