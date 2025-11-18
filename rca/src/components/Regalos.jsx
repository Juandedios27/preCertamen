import React, { useEffect, useState, useRef } from 'react';
import { db } from '../firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import html2canvas from 'html2canvas';

const Regalos = () => {
  const [regalos, setRegalos] = useState([]);
  const [loading, setLoading] = useState(true);
  const tableRef = useRef(null);

  useEffect(() => {
    obtenerRegalos();
  }, []);

  const obtenerRegalos = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, 'regalos'), orderBy('prioridad', 'asc'));
      const querySnapshot = await getDocs(q);
      const datos = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setRegalos(datos);
    } catch (error) {
      console.error('Error al obtener regalos:', error);
      alert('Error al cargar los regalos. Verifica la configuración de Firebase.');
    } finally {
      setLoading(false);
    }
  };

  const exportarPDF = () => {
    const doc = new jsPDF();
    doc.text('Lista de Regalos', 14, 15);
    
    const tableData = regalos.map(regalo => [
      regalo.nombre,
      regalo.familiar,
      regalo.prioridad
    ]);

    autoTable(doc, {
      head: [['Nombre del Regalo', 'Familiar', 'Prioridad']],
      body: tableData,
      startY: 25
    });

    doc.save('regalos.pdf');
  };

  const exportarExcel = () => {
    const datos = regalos.map(regalo => ({
      'Nombre del Regalo': regalo.nombre,
      'Familiar': regalo.familiar,
      'Prioridad': regalo.prioridad
    }));

    const ws = XLSX.utils.json_to_sheet(datos);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Regalos');
    XLSX.writeFile(wb, 'regalos.xlsx');
  };

  const exportarPNG = async () => {
    if (tableRef.current) {
      try {
        const canvas = await html2canvas(tableRef.current);
        const link = document.createElement('a');
        link.download = 'regalos.png';
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
          <i className="bi bi-gift me-2"></i>Regalos
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
              <th className="border-0 fw-normal">Regalo</th>
              <th className="border-0 fw-normal">Familiar</th>
              <th className="border-0 fw-normal text-end">Prioridad</th>
            </tr>
          </thead>
          <tbody>
            {regalos.length === 0 ? (
              <tr>
                <td colSpan="3" className="text-center text-muted small py-4">
                  No hay regalos registrados
                </td>
              </tr>
            ) : (
              regalos.map(regalo => (
                <tr key={regalo.id}>
                  <td className="align-middle">{regalo.nombre}</td>
                  <td className="align-middle text-muted small">{regalo.familiar}</td>
                  <td className="align-middle text-end">
                    <span className={`badge rounded-pill ${
                      regalo.prioridad === 1 ? 'bg-danger' : 
                      regalo.prioridad === 2 ? 'bg-warning text-dark' : 
                      'bg-secondary'
                    }`}>
                      {regalo.prioridad}
                    </span>
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

export default Regalos;
