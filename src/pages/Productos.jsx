import { MdHealthAndSafety, MdAssessment } from "react-icons/md";
import React, { useState, useEffect, useContext } from "react";
import { Row, Col, Spinner, Button, Card, Accordion } from "react-bootstrap";
import styled from "styled-components";
import axios from "axios";
import { toast } from "react-toastify";
import api from "../Auth/Api";
import { ThemeContext } from "../App";

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
  MdVisibility,
  MdPeople,
  MdLink,
  MdThumbUp,
  MdList
} from "react-icons/md";


export function Productos() {
  const [graphStats, setGraphStats] = useState({});
  const [userDebug, setUserDebug] = useState(null);
  const [userEvaluation, setUserEvaluation] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loadingGraph, setLoadingGraph] = useState(false);
  const [loadingDebug, setLoadingDebug] = useState(false);
  const [loadingEval, setLoadingEval] = useState(false);
  const { setTheme, theme } = useContext(ThemeContext);

  // Obtener usuario actual
  const getCurrentUser = async () => {
    try {
      const userResponse = await api.get("/api/users");
      setCurrentUser(userResponse.data);
      return userResponse.data;
    } catch (error) {
      console.error("Error al obtener el usuario actual:", error);
      return null;
    }
  };

  useEffect(() => {
    getCurrentUser();
  }, []);

 
  useEffect(() => {
    const getGraphStats = async () => {
      try {
        setLoadingGraph(true);
        const response = await axios.get("/graph-stats");
        setGraphStats(response.data);
      } catch (err) {
        toast.error(
          err.response?.data?.detail || "Error al obtener estadísticas del grafo"
        );
        throw err;
      } finally {
        setLoadingGraph(false);
      }
    };
    getGraphStats();
  }, []);

  const handleDebugUser = async () => {
    setLoadingDebug(true);
    if (!currentUser || !currentUser.user_id) {
      toast.error("No se pudo obtener el ID del usuario actual");
      return;
    }
    try {
      
      const response = await axios.get(`/debug-user/${currentUser.user_id}`);
      setUserDebug(response.data);
    } catch (err) {
      toast.error(
        err.response?.data?.detail || "Error al obtener información de debug"
      );
      throw err;
    } finally {
      setLoadingDebug(false);
    }
  };

  const handleEvaluateUser = async () => {
    setLoadingEval(true);
    if (!currentUser || !currentUser.user_id) {
      toast.error("No se pudo obtener el ID del usuario actual");
      return;
    }

    try {
      const response = await axios.get(`/simple-evaluate/${currentUser.user_id}`);
      setUserEvaluation(response.data);
    } catch (err) {
      toast.error(
        err.response?.data?.detail || "Error al evaluar al usuario"
      );
      throw err;
    } finally {
      setLoadingEval(false);
    }
  };

  const getGraphIconForKey = (key) => {
    const iconMap = {
      nodes: <MdSchema size={20} className="me-2 text-primary" />,
      edges: <MdLink size={20} className="me-2 text-info" />,
      user_nodes: <MdPeople size={20} className="me-2 text-success" />,
      image_nodes: <MdImage size={20} className="me-2 text-warning" />,
      default: <MdInfo size={20} className="me-2 text-muted" />,
    };

    return iconMap[key] || iconMap.default;
  };

  const formatGraphKeyName = (key) => {
    const names = {
      nodes: "Total de nodos",
      edges: "Total de aristas",
      user_nodes: "Nodos de usuario",
      image_nodes: "Nodos de imagen",
    };

    return (
      names[key] ||
      key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
    );
  };

  const formatValue = (key, value) => {
    if (typeof value === 'boolean') {
      return value ? "Sí" : "No";
    }
    return value;
  };

  const getValueClass = (key, value) => {
    if (typeof value === 'boolean') {
      return value ? "text-success" : "text-danger";
    }
    if (typeof value === 'string') {
      if (value === 'healthy' || value === 'connected' || value === 'ready' || value === 'success') {
        return "text-success";
      }
      return "text-danger";
    }
    return "";
  };

  // Función para obtener las clases CSS según el tema
  const getThemeClasses = () => {
    switch(theme) {
      case 'dark':
        return {
          accordionHeader: 'bg-dark text-light',
          accordionBody: 'bg-dark text-light',
          cardHeader: 'bg-dark text-light border-secondary',
          cardBody: 'bg-dark text-light',
          textClass: 'text-light',
          badge: 'bg-secondary',
          border: 'border-secondary'
        };
      case 'light':
        return {
          accordionHeader: 'bg-light text-dark',
          accordionBody: 'bg-white text-dark',
          cardHeader: 'bg-light text-dark border-light',
          cardBody: 'bg-white text-dark',
          textClass: 'text-dark',
          badge: 'bg-primary',
          border: 'border-light'
        };
      default:
        return {
          accordionHeader: 'bg-light text-dark',
          accordionBody: 'bg-white text-dark',
          cardHeader: 'bg-light text-dark border-light',
          cardBody: 'bg-white text-dark',
          textClass: 'text-dark',
          badge: 'bg-primary',
          border: 'border-light'
        };
    }
  };

  const themeClasses = getThemeClasses();

  const ListAccordion = ({ title, items, icon }) => (
    <Accordion className="mt-3">
      <Accordion.Item eventKey="0" className={themeClasses.border}>
        <Accordion.Header className={themeClasses.accordionHeader}>
          {icon} <span className={themeClasses.textClass}>{title}</span> ({items.length})
        </Accordion.Header>
        <Accordion.Body className={themeClasses.accordionBody}>
          <div className="d-flex flex-wrap">
            {items.map((item, idx) => (
              <span key={idx} className={`badge me-2 mb-2 ${themeClasses.badge} ${themeClasses.textClass}`}>
                {item}
              </span>
            ))}
          </div>
        </Accordion.Body>
      </Accordion.Item>
    </Accordion>
  );

  return (
    <Container className="m-4 m-sm-5">
      <div>
        <div className="d-flex align-items-center mt-5 mb-2">
          <MdHealthAndSafety size={25} className="me-2" />
          <h3 className="mb-0">Debugging del Sistema</h3>
        </div>
        <p>
          Probar algoritmo y debugging
        </p>
      </div>
      <hr className="mb-5" />
      <Row className="gap-sm-5">
        {/* Estadísticas del grafo */}
        <Col
           sm={5} xs={12}
          className="mb-4"
          style={{ borderRadius: "15px", border: "2px solid #808080" }}
        >
          {!loadingGraph && Object.keys(graphStats).length > 0 ? (
            <div className={`p-3 rounded shadow-sm ${themeClasses.cardBody}`}>
              <h5 className={`mb-3 ${themeClasses.textClass}`}>Estadísticas del Grafo</h5>
              {Object.entries(graphStats).map(([key, value], index, array) => (
                <React.Fragment key={index}>
                  <div className="d-flex align-items-center mb-2 p-2">
                    {getGraphIconForKey(key)}
                    <div className="d-flex justify-content-between w-100">
                      <span className={`fw-medium ${themeClasses.textClass}`}>{formatGraphKeyName(key)}:</span>
                      <span className={`fw-bold ${themeClasses.textClass}`}>
                        {value}
                      </span>
                    </div>
                  </div>
                  {index < array.length - 1 && <hr className="my-2" />}
                </React.Fragment>
              ))}
            </div>
          ) : (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
              <Spinner animation="border" role="status" className="m-5" />
            </div>
          )}
        </Col>

        {/* Debug de usuario */}
        <Col
          sm={5} xs={12}
          style={{ borderRadius: "15px", border: "2px solid #808080" }}
        >
          <div className={`p-3 rounded shadow-sm ${themeClasses.cardBody}`}>
            <h5 className={`mb-3 ${themeClasses.textClass}`}>Debug de Usuario</h5>
            
            {currentUser ? (
              <>
                <div className={`mb-3 ${themeClasses.textClass}`}>
                  <span className="fw-medium">Usuario actual: </span>
                  <span className="fw-bold">{currentUser.user_id}</span>
                </div>
                
                <div className="d-flex gap-2 mb-3">
                  <Button 
                    variant="primary" 
                    onClick={handleDebugUser}
                    disabled={loadingDebug}
                  >
                    {loadingDebug ? <Spinner animation="border" size="sm" /> : ""}
                    Debug User
                  </Button>
                  
                  <Button 
                    variant="success" 
                    onClick={handleEvaluateUser}
                    disabled={loadingEval}
                  >
                    {loadingEval ? <Spinner animation="border" size="sm" /> : <MdAssessment className="me-1" />}
                    Evaluar
                  </Button>
                </div>
              </>
            ) : (
              <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50px' }}>
                <Spinner animation="border" role="status" size="sm" className="me-2" />
                <span>Cargando información del usuario...</span>
              </div>
            )}
            
            {userDebug && (
              <Card className={`mt-3 ${themeClasses.border}`}>
                <Card.Header className={themeClasses.cardHeader}>
                  <strong className={themeClasses.textClass}>Información de Debug</strong>
                </Card.Header>
                <Card.Body className={themeClasses.cardBody}>
                  <div className={`d-flex align-items-center mb-2 ${themeClasses.textClass}`}>
                    <MdPeople className="me-2 text-primary" />
                    <span className="fw-medium">User ID: </span>
                    <span className="ms-2 fw-bold">{userDebug.user_id}</span>
                  </div>
                  
                  <div className={`d-flex align-items-center mb-2 ${themeClasses.textClass}`}>
                    <MdThumbUp className="me-2 text-success" />
                    <span className="fw-medium">Usuario existe: </span>
                    <span className={`ms-2 fw-bold ${getValueClass('', userDebug.user_exists)}`}>
                      {formatValue('', userDebug.user_exists)}
                    </span>
                  </div>
                  
                  <div className={`d-flex align-items-center mb-2 ${themeClasses.textClass}`}>
                    <MdImage className="me-2 text-info" />
                    <span className="fw-medium">Total de imágenes likeadas: </span>
                    <span className="ms-2 fw-bold">{userDebug.total_liked_images}</span>
                  </div>
                  
                  {userDebug.liked_images_sample && userDebug.liked_images_sample.length > 0 && (
                    <ListAccordion 
                      title="Muestra de imágenes likeadas" 
                      items={userDebug.liked_images_sample} 
                      icon={<MdList className="me-1" />}
                    />
                  )}
                  
                  {userDebug.image_fields && userDebug.image_fields.length > 0 && (
                    <ListAccordion 
                      title="Campos de imagen" 
                      items={userDebug.image_fields} 
                      icon={<MdList className="me-1" />}
                    />
                  )}
                </Card.Body>
              </Card>
            )}
            
            {userEvaluation && (
              <Card className={`mt-3 ${themeClasses.border}`}>
                <Card.Header className={themeClasses.cardHeader}>
                  <strong className={themeClasses.textClass}>Evaluación del Usuario</strong>
                </Card.Header>
                <Card.Body className={themeClasses.cardBody}>
                  <div className={`d-flex align-items-center mb-2 ${themeClasses.textClass}`}>
                    <MdPeople className="me-2 text-primary" />
                    <span className="fw-medium">User ID: </span>
                    <span className="ms-2 fw-bold">{userEvaluation.user_id}</span>
                  </div>
                  
                  <div className={`d-flex justify-content-between mb-2 ${themeClasses.textClass}`}>
                    <span className="fw-medium">Precisión:</span>
                    <span className="fw-bold">{userEvaluation.precision.toFixed(2)}</span>
                  </div>
                  
                  <div className={`d-flex justify-content-between mb-2 ${themeClasses.textClass}`}>
                    <span className="fw-medium">Recall:</span>
                    <span className="fw-bold">{userEvaluation.recall.toFixed(2)}</span>
                  </div>
                  
                  <div className={`d-flex justify-content-between mb-2 ${themeClasses.textClass}`}>
                    <span className="fw-medium">F1 Score:</span>
                    <span className="fw-bold">{userEvaluation.f1_score.toFixed(2)}</span>
                  </div>
                  
                  <div className={`d-flex justify-content-between mb-2 ${themeClasses.textClass}`}>
                    <span className="fw-medium">Hits:</span>
                    <span className="fw-bold">{userEvaluation.hits}</span>
                  </div>
                  
                  <div className={`d-flex justify-content-between mb-2 ${themeClasses.textClass}`}>
                    <span className="fw-medium">Total recomendaciones:</span>
                    <span className="fw-bold">{userEvaluation.total_recommendations}</span>
                  </div>
                  
                  <div className={`d-flex justify-content-between mb-2 ${themeClasses.textClass}`}>
                    <span className="fw-medium">Total positivos:</span>
                    <span className="fw-bold">{userEvaluation.total_positives}</span>
                  </div>
                  
                  <div className={`d-flex justify-content-between mb-2 ${themeClasses.textClass}`}>
                    <span className="fw-medium">Fuente de datos:</span>
                    <span className="fw-bold">{userEvaluation.data_source}</span>
                  </div>
                  
                  {userEvaluation.recommendations && userEvaluation.recommendations.length > 0 && (
                    <ListAccordion 
                      title="Recomendaciones" 
                      items={userEvaluation.recommendations} 
                      icon={<MdList className="me-1" />}
                    />
                  )}
                  
                  {userEvaluation.actual_likes && userEvaluation.actual_likes.length > 0 && (
                    <ListAccordion 
                      title="Likes reales" 
                      items={userEvaluation.actual_likes} 
                      icon={<MdThumbUp className="me-1" />}
                    />
                  )}
                </Card.Body>
              </Card>
            )}
          </div>
        </Col>
      </Row>
    </Container>
  );
}

const Container = styled.div`
  height: 100%;
  padding-bottom: 2rem;
`;