/**
 * vectorSearch.js - Servicio para búsqueda visual por vectores
 *
 * Encapsula las llamadas API al endpoint de ChromaDB
 * para buscar imágenes visualmente similares.
 */

import api from "../Auth/Api";

/**
 * Busca imágenes visualmente similares a una imagen dada.
 * @param {number} imageId - ID numérico de la imagen de referencia
 * @param {number} limit - Número de resultados (1-50, default: 8)
 * @returns {Promise<Object>} Respuesta con imagen original y similares
 */
export const searchSimilarImages = async (imageId, limit = 8) => {
  try {
    const response = await api.get(
      `/api/v1/recommendations/visual-similar/${imageId}?limit=${limit}`
    );
    return response.data;
  } catch (error) {
    console.error("Error en búsqueda visual:", error);
    throw error;
  }
};

/**
 * Verifica si una imagen tiene embedding vectorial.
 * @param {number} imageId - ID numérico de la imagen
 * @returns {Promise<Object>} Estado del embedding
 */
export const checkEmbedding = async (imageId) => {
  try {
    const response = await api.get(
      `/api/v1/recommendations/check-embedding/${imageId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error verificando embedding:", error);
    throw error;
  }
};

/**
 * Obtiene estadísticas del sistema vectorial.
 * @returns {Promise<Object>} Estadísticas de ChromaDB
 */
export const getVectorStats = async () => {
  try {
    const response = await api.get("/api/v1/recommendations/vector-stats");
    return response.data;
  } catch (error) {
    console.error("Error obteniendo estadísticas vectoriales:", error);
    throw error;
  }
};
