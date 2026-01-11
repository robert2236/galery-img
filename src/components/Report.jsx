import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import ReactMarkdown from 'react-markdown';
import styled from 'styled-components';
import api from "../Auth/Api";

const ReportContainer = styled.div`
  font-family: 'Arial', sans-serif;
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background: white;
  
  h1 { color: #2c3e50; }
  h2 { color: #34495e; border-bottom: 2px solid #eee; }
  h3 { color: #7f8c8d; }
  
  table {
    border-collapse: collapse;
    width: 100%;
    margin: 20px 0;
  }
  
  th {
    background-color: #f8f9fa;
    color: #2c3e50;
    font-weight: bold;
    padding: 10px;
    text-align: left;
    border: 1px solid #dee2e6;
  }
  
  td {
    padding: 10px;
    border: 1px solid #dee2e6;
  }
  
  .score-good { color: #27ae60; font-weight: bold; }
  .score-medium { color: #f39c12; font-weight: bold; }
  .score-poor { color: #e74c3c; font-weight: bold; }
  
  .recommendation {
    background-color: #f8f9fa;
    padding: 15px;
    border-left: 4px solid #3498db;
    margin: 15px 0;
  }
  
  .alert {
    background-color: #fff3cd;
    border: 1px solid #ffeaa7;
    color: #856404;
    padding: 15px;
    border-radius: 5px;
    margin: 15px 0;
  }
`;

const ExportReportComponent = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);

  const fetchReport = async () => {
    setLoading(true);
    try {
      // Si api es axios, usa response.data
      const response = await api.get('api/metrics/export/report');
      console.log('Respuesta de API:', response); // Para depuración
      setReport(response.data);
    } catch (error) {
      console.error('Error al obtener reporte:', error);
      alert('Error al obtener el reporte. Verifica la consola para más detalles.');
    } finally {
      setLoading(false);
    }
  };

  const exportToPDF = async () => {
    if (!report) {
      alert('Primero genera el reporte');
      return;
    }
    
    setPdfLoading(true);
    try {
      const element = document.getElementById('report-content');
      
      if (!element) {
        console.error('Elemento report-content no encontrado');
        alert('Error: No se encontró el contenido del reporte');
        return;
      }
      
      console.log('Generando PDF...');
      
      // Opciones optimizadas para html2canvas
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: true, // Para depuración
        allowTaint: true,
        imageTimeout: 15000,
      });
      
      console.log('Canvas generado:', canvas);
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png', 1.0);
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      // Si el contenido es muy largo, dividirlo en múltiples páginas
      let heightLeft = pdfHeight;
      let position = 0;
      
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
      heightLeft -= pdf.internal.pageSize.getHeight();
      
      while (heightLeft >= 0) {
        position = heightLeft - pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
        heightLeft -= pdf.internal.pageSize.getHeight();
      }
      
      const fileName = `reporte_rendimiento_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      
      console.log('PDF guardado exitosamente');
      
    } catch (error) {
      console.error('Error al generar PDF:', error);
      alert(`Error al generar PDF: ${error.message}`);
    } finally {
      setPdfLoading(false);
    }
  };

  // Función alternativa si html2canvas falla
  const exportToPDFAlternative = () => {
    if (!report) {
      alert('Primero genera el reporte');
      return;
    }
    
    const pdf = new jsPDF('p', 'pt', 'a4');
    
    // Crear contenido simple si html2canvas falla
    pdf.setFontSize(20);
    pdf.text('Reporte de Rendimiento - Sistema IA', 40, 40);
    
    pdf.setFontSize(12);
    pdf.text(`Fecha de generación: ${new Date().toLocaleDateString()}`, 40, 80);
    
    if (report.report) {
      pdf.setFontSize(10);
      const lines = pdf.splitTextToSize(report.report, 500);
      pdf.text(lines, 40, 120);
    }
    
    pdf.save(`reporte_simple_${Date.now()}.pdf`);
  };

  return (
    <div>
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        <button 
          onClick={fetchReport}
          disabled={loading || pdfLoading}
          style={{
            padding: '10px 20px',
            backgroundColor: '#3498db',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            opacity: (loading || pdfLoading) ? 0.6 : 1
          }}
        >
          {loading ? 'Cargando...' : 'Generar Reporte'}
        </button>
        
        {report && (
          <>
            <button 
              onClick={exportToPDF}
              disabled={pdfLoading || loading}
              style={{
                padding: '10px 20px',
                backgroundColor: '#27ae60',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                opacity: (pdfLoading || loading) ? 0.6 : 1
              }}
            >
              {pdfLoading ? 'Generando PDF...' : 'Descargar PDF (HTML)'}
            </button>
            
            <button 
              onClick={exportToPDFAlternative}
              disabled={pdfLoading || loading}
              style={{
                padding: '10px 20px',
                backgroundColor: '#e67e22',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                opacity: (pdfLoading || loading) ? 0.6 : 1
              }}
            >
              Descargar PDF (Simple)
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ExportReportComponent;