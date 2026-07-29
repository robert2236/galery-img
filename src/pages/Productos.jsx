import { MdHealthAndSafety, MdAssessment } from "react-icons/md";
import React, { useState, useEffect } from "react";
import { Row, Col, Button, Card, Accordion } from "react-bootstrap";
import axios from "axios";
import { toast } from "react-toastify";
import api from "../Auth/Api";
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
      nodes: <MdSchema size={20} className="me-2 text-info" />,
      edges: <MdLink size={20} className="me-2 text-info" />,
      user_nodes: <MdPeople size={20} className="me-2 text-info" />,
      image_nodes: <MdImage size={20} className="me-2 text-info" />,
      default: <MdInfo size={20} className="me-2 text-secondary" />,
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
      return value ? "S\u00ed" : "No";
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

  const ListAccordion = ({ title, items, icon }) => (
    <Accordion className="mt-3">
      <Accordion.Item eventKey="0" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(0,242,254,0.1)' }}>
        <Accordion.Header style={{ background: 'rgba(0,242,254,0.04)' }}>
          {icon} <span className="text-light ms-1">{title}</span> ({items.length})
        </Accordion.Header>
        <Accordion.Body style={{ background: 'rgba(255,255,255,0.02)' }}>
          <div className="d-flex flex-wrap">
            {items.map((item, idx) => (
              <span key={idx} className="badge me-2 mb-2 text-light" style={{ background: 'rgba(0,242,254,0.1)', border: '1px solid rgba(0,242,254,0.15)' }}>
                {item}
              </span>
            ))}
          </div>
        </Accordion.Body>
      </Accordion.Item>
    </Accordion>
  );

  return (
    <div className="dashboard-bg text-light" style={{ margin: '-1rem -2rem', padding: '1.5rem 2rem 80px', minHeight: 'calc(100vh - 30px)' }}>
      <div className="m-4 m-sm-5">
        <div className="d-flex align-items-center mt-5 mb-2 w-100">
          <MdHealthAndSafety size={25} className="me-2 text-info" />
          <h3 className="text-light mb-0 fw-light" style={{ letterSpacing: '1px' }}>Debugging del Sistema</h3>
        </div>
        <p className="text-secondary" style={{ opacity: 0.7 }}>
          Probar algoritmo y debugging
        </p>
      </div>
      <hr className="mb-5 mx-4 mx-sm-5" style={{ borderColor: 'rgba(0,242,254,0.12)', opacity: 0.3 }} />
      <Row className="gap-sm-5 mx-3 mx-sm-5">
        {/* Estadísticas del grafo */}
        <Col
           sm={5} xs={12}
          className="mb-4 p-0"
        >
          {!loadingGraph && Object.keys(graphStats).length > 0 ? (
            <div className="p-3 rounded shadow-sm" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(0,242,254,0.12)', borderRadius: '12px', backdropFilter: 'blur(8px)' }}>
              <h5 className="mb-3 text-light">Estad&iacute;sticas del Grafo</h5>
              {Object.entries(graphStats).map(([key, value], index, array) => (
                <React.Fragment key={index}>
                  <div className="d-flex align-items-center mb-2 p-2">
                    {getGraphIconForKey(key)}
                    <div className="d-flex justify-content-between w-100">
                      <span className="fw-medium text-light">{formatGraphKeyName(key)}:</span>
                      <span className="fw-bold text-light">
                        {value}
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

        {/* Debug de usuario */}
        <Col
          sm={5} xs={12}
        >
          <div className="p-3 rounded shadow-sm" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(0,242,254,0.12)', borderRadius: '12px', backdropFilter: 'blur(8px)' }}>
            <h5 className="mb-3 text-light">Debug de Usuario</h5>
            
            {currentUser ? (
              <>
                <div className="mb-3 text-light">
                  <span className="fw-medium">Usuario actual: </span>
                  <span className="fw-bold">{currentUser.user_id}</span>
                </div>
                
                <div className="d-flex gap-2 mb-3">
                  <Button 
                    variant="outline-info" 
                    onClick={handleDebugUser}
                    disabled={loadingDebug}
                  >
                    {loadingDebug ? "Cargando..." : <><MdHealthAndSafety className="me-1" /> Debug User</>}
                  </Button>
                  
                  <Button 
                    variant="outline-info" 
                    onClick={handleEvaluateUser}
                    disabled={loadingEval}
                  >
                    {loadingEval ? "Cargando..." : <><MdAssessment className="me-1" /> Evaluar</>}
                  </Button>
                </div>
              </>
            ) : (
              <LoadingSpinner label="Cargando información del usuario..." size="sm" inline />
            )}
            
            {userDebug && (
              <Card className="mt-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(0,242,254,0.12)', backdropFilter: 'blur(8px)' }}>
                <Card.Header style={{ background: 'rgba(0,242,254,0.05)', borderBottom: '1px solid rgba(0,242,254,0.1)' }}>
                  <strong className="text-light">Informaci&oacute;n de Debug</strong>
                </Card.Header>
                <Card.Body style={{ background: 'transparent' }}>
                  <div className="d-flex align-items-center mb-2 text-light">
                    <MdPeople className="me-2 text-primary" />
                    <span className="fw-medium">User ID: </span>
                    <span className="ms-2 fw-bold">{userDebug.user_id}</span>
                  </div>
                  
                  <div className="d-flex align-items-center mb-2 text-light">
                    <MdThumbUp className="me-2 text-success" />
                    <span className="fw-medium">Usuario existe: </span>
                    <span className={`ms-2 fw-bold ${getValueClass('', userDebug.user_exists)}`}>
                      {formatValue('', userDebug.user_exists)}
                    </span>
                  </div>
                  
                  <div className="d-flex align-items-center mb-2 text-light">
                    <MdImage className="me-2 text-info" />
                    <span className="fw-medium">Total de im&aacute;genes likeadas: </span>
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
              <Card className="mt-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(0,242,254,0.12)', backdropFilter: 'blur(8px)' }}>
                <Card.Header style={{ background: 'rgba(0,242,254,0.05)', borderBottom: '1px solid rgba(0,242,254,0.1)' }}>
                  <strong className="text-light">Evaluaci&oacute;n del Usuario</strong>
                </Card.Header>
                <Card.Body style={{ background: 'transparent' }}>
                  <div className="d-flex align-items-center mb-2 text-light">
                    <MdPeople className="me-2 text-primary" />
                    <span className="fw-medium">User ID: </span>
                    <span className="ms-2 fw-bold">{userEvaluation.user_id}</span>
                  </div>
                  
                  {[
                    { label: 'Precisión', value: userEvaluation.precision.toFixed(2) },
                    { label: 'Recall', value: userEvaluation.recall.toFixed(2) },
                    { label: 'F1 Score', value: userEvaluation.f1_score.toFixed(2) },
                    { label: 'Hits', value: userEvaluation.hits },
                    { label: 'Total recomendaciones', value: userEvaluation.total_recommendations },
                    { label: 'Total positivos', value: userEvaluation.total_positives },
                    { label: 'Fuente de datos', value: userEvaluation.data_source },
                  ].map((item, i) => (
                    <div key={i} className="d-flex justify-content-between mb-2 text-light">
                      <span className="fw-medium">{item.label}:</span>
                      <span className="fw-bold">{item.value}</span>
                    </div>
                  ))}
                  
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
    </div>
  );
}