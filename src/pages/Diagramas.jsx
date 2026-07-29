import { MdHealthAndSafety } from "react-icons/md";
import React, { useState, useEffect } from "react";
import { Row, Col } from "react-bootstrap";
import axios from "axios";
import { toast } from "react-toastify";
import LoadingSpinner from "../components/LoadingSpinner";

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
      total_images: <MdImage size={20} className="me-2 text-info" />,
      images_with_features: (
        <MdCollections size={20} className="me-2 text-info" />
      ),
      images_with_interactions: (
        <MdTouchApp size={20} className="me-2 text-info" />
      ),
      feature_coverage: (
        <MdTrendingUp size={20} className="me-2 text-info" />
      ),
      interaction_coverage: (
        <MdShowChart size={20} className="me-2 text-info" />
      ),
      default: <MdInfo size={20} className="me-2 text-secondary" />,
    };

    return iconMap[key] || iconMap.default;
  };


  const getHealthIconForKey = (key) => {
    const iconMap = {
      status: <MdHealthAndSafety size={20} className="me-2 text-info" />,
      database: <MdStorage size={20} className="me-2 text-info" />,
      graph_nodes: <MdSchema size={20} className="me-2 text-info" />,
      graph_recommender: <MdSchema size={20} className="me-2 text-info" />,
      visual_recommender: <MdVisibility size={20} className="me-2 text-info" />,
      total_images: <MdImage size={20} className="me-2 text-info" />,
      default: <MdInfo size={20} className="me-2 text-secondary" />,
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
    <div className="dashboard-bg text-light" style={{ margin: '-1rem -2rem', padding: '1.5rem 2rem 80px', minHeight: 'calc(100vh - 30px)' }}>
      <div className="m-4 m-sm-5">
        <div className="d-flex align-items-center mt-5 mb-2 w-100">
          <MdHealthAndSafety size={25} className="me-2 text-info" />
          <h3 className="text-light mb-0 fw-light" style={{ letterSpacing: '1px' }}>Estatus del sistema</h3>
        </div>
        <p className="text-secondary" style={{ opacity: 0.7 }}>
          Se puede visualizar el estatus general del sistema y par&aacute;metros de los
          algoritmos utilizados.
        </p>
      </div>
      <hr className="mb-5 mx-4 mx-sm-5" style={{ borderColor: 'rgba(0,242,254,0.12)', opacity: 0.3 }} />
      <Row className="gap-sm-5 d-flex justify-content-center mx-3 mx-sm-5">
        <Col
          sm={5} xs={12}
          className="mb-4 mb-sm-0 p-4 dashboard-chart-card"
        >
          {!loadingConfig && Object.keys(config).length > 0 ? (
            <div className="p-3 rounded shadow-sm" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(0,242,254,0.12)', borderRadius: '12px', backdropFilter: 'blur(8px)' }}>
              <h5 className="mb-3 text-light" style={{ fontSize: '0.95rem', fontWeight: 600 }}>Estado Actual del Sistema</h5>
              {Object.entries(config).map(([key, value], index, array) => (
                <React.Fragment key={index}>
                  <div className="d-flex align-items-center mb-2 p-2">
                    {getIconForKey(key)}
                    <div className="d-flex justify-content-between w-100">
                      <span className="fw-medium text-light">{formatKeyName(key)}:</span>
                      <span className={`fw-bold ${getValueClass(key, value)}`}>
                        {formatValue(key, value)}
                      </span>
                    </div>
                  </div>
                  {index < array.length - 1 && <hr className="my-2" style={{ borderColor: 'rgba(255,255,255,0.06)' }} />}
                </React.Fragment>
              ))}
            </div>
          ) : (
            <LoadingSpinner />
          )}
        </Col>

        <Col
          sm={5} xs={12}
          className="mb-4 mb-sm-0 p-4 dashboard-chart-card"
        >
          {!loadingHealth && Object.keys(health).length > 0 ? (
            <div className="p-3 rounded shadow-sm" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(0,242,254,0.12)', borderRadius: '12px', backdropFilter: 'blur(8px)' }}>
              <h5 className="mb-3 text-light" style={{ fontSize: '0.95rem', fontWeight: 600 }}>Estado de Salud del Sistema</h5>
              {Object.entries(health).map(([key, value], index, array) => (
                <React.Fragment key={index}>
                  <div className="d-flex align-items-center mb-2 p-2">
                    {getHealthIconForKey(key)}
                    <div className="d-flex justify-content-between w-100">
                      <span className="fw-medium text-light">{formatHealthKeyName(key)}:</span>
                      <span className={`fw-bold ${getValueClass(key, value)}`}>
                        {formatValue(key, value)}
                      </span>
                    </div>
                  </div>
                  {index < array.length - 1 && <hr className="my-2" style={{ borderColor: 'rgba(255,255,255,0.06)' }} />}
                </React.Fragment>
              ))}
            </div>
          ) : (
            <LoadingSpinner />
          )}
        </Col>
      </Row>
    </div>
  );
}