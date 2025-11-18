import React, { useEffect, useState, useRef } from 'react';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import html2canvas from 'html2canvas';

const Comida = () => {
  const [comidas, setComidas] = useState([]);
  const [loading, setLoading] = useState(true);
  const tableRef = useRef(null);

  useEffect(() => {
    obtenerComidas();
  }, []);

  const obtenerComidas = async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, 'comida'));
      const datos = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      const datosOrdenados = datos.sort((a, b) => {
        if (a.congelado === b.congelado) return 0;
        return a.congelado ? -1 : 1;
      });
      
      setComidas(datosOrdenados);
    } catch (error) {
      console.error('Error al obtener comida:', error);
      alert('Error al cargar la comida. Verifica la configuración de Firebase.');
    } finally {
      setLoading(false);
    }
  };

  const exportarPDF = () => {
    const doc = new jsPDF();
    doc.text('Lista de Comida', 14, 15);
    
    const tableData = comidas.map(comida => [
      comida.nombre,
      comida.congelado ? 'Sí' : 'No'
    ]);

    autoTable(doc, {
      head: [['Nombre del Alimento', 'Congelado']],
      body: tableData,
      startY: 25
    });

    doc.save('comida.pdf');
  };

  const exportarExcel = () => {
    const datos = comidas.map(comida => ({
      'Nombre del Alimento': comida.nombre,
      'Congelado': comida.congelado ? 'Sí' : 'No'
    }));

    const ws = XLSX.utils.json_to_sheet(datos);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Comida');
    XLSX.writeFile(wb, 'comida.xlsx');
  };

  const exportarPNG = async () => {
    if (tableRef.current) {
      try {
        const canvas = await html2canvas(tableRef.current);
        const link = document.createElement('a');
        link.download = 'comida.png';
        link.href = canvas.toDataURL();
        link.click();
      } catch (error) {
        console.error('Error al exportar PNG:', error);
        alert('Error al generar la imagen PNG');
      }
    }
  };

  if (loading) {
    return (
      <div className="text-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="border rounded-3 bg-white shadow-sm">
      <div className="d-flex justify-content-between align-items-center px-3 py-2 border-bottom">
        <h6 className="mb-0 text-dark fw-normal">
          <i className="bi bi-egg-fried me-2"></i>Comida
        </h6>
        <div className="btn-group btn-group-sm" role="group">
          <button className="btn btn-outline-danger" onClick={exportarPDF} title="Exportar PDF">
            <i className="bi bi-file-pdf"></i>
          </button>
          <button className="btn btn-outline-success" onClick={exportarExcel} title="Exportar Excel">
            <i className="bi bi-file-excel"></i>
          </button>
          <button className="btn btn-outline-primary" onClick={exportarPNG} title="Exportar PNG">
            <i className="bi bi-image"></i>
          </button>
        </div>
      </div>

      <div className="p-3" ref={tableRef}>
        <table className="table table-sm table-hover mb-0">
          <thead>
            <tr className="text-muted small">
              <th className="border-0 fw-normal">Alimento</th>
              <th className="border-0 fw-normal text-end">Estado</th>
            </tr>
          </thead>
          <tbody>
            {comidas.length === 0 ? (
              <tr>
                <td colSpan="2" className="text-center text-muted small py-4">
                  No hay comida registrada
                </td>
              </tr>
            ) : (
              comidas.map(comida => (
                <tr key={comida.id}>
                  <td className="align-middle">{comida.nombre}</td>
                  <td className="align-middle text-end">
                    {comida.congelado ? (
                      <span className="badge rounded-pill bg-primary">
                        <i className="bi bi-snow"></i> Congelado
                      </span>
                    ) : (
                      <span className="badge rounded-pill bg-light text-dark">
                        <i className="bi bi-thermometer-half"></i> Normal
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Comida;
