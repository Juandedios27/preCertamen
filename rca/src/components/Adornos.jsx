import React, { useEffect, useState, useRef } from 'react';
import { db } from '../firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import html2canvas from 'html2canvas';

const Adornos = () => {
  const [adornos, setAdornos] = useState([]);
  const [loading, setLoading] = useState(true);
  const tableRef = useRef(null);

  useEffect(() => {
    obtenerAdornos();
  }, []);

  const obtenerAdornos = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, 'adornos'), orderBy('cantidad', 'asc'));
      const querySnapshot = await getDocs(q);
      const datos = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAdornos(datos);
    } catch (error) {
      console.error('Error al obtener adornos:', error);
      alert('Error al cargar los adornos. Verifica la configuración de Firebase.');
    } finally {
      setLoading(false);
    }
  };

  const exportarPDF = () => {
    const doc = new jsPDF();
    doc.text('Lista de Adornos', 14, 15);
    
    const tableData = adornos.map(adorno => [
      adorno.nombre,
      adorno.cantidad
    ]);

    autoTable(doc, {
      head: [['Nombre del Adorno', 'Cantidad']],
      body: tableData,
      startY: 25
    });

    doc.save('adornos.pdf');
  };

  const exportarExcel = () => {
    const datos = adornos.map(adorno => ({
      'Nombre del Adorno': adorno.nombre,
      'Cantidad': adorno.cantidad
    }));

    const ws = XLSX.utils.json_to_sheet(datos);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Adornos');
    XLSX.writeFile(wb, 'adornos.xlsx');
  };

  const exportarPNG = async () => {
    if (tableRef.current) {
      try {
        const canvas = await html2canvas(tableRef.current);
        const link = document.createElement('a');
        link.download = 'adornos.png';
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
          <i className="bi bi-star me-2"></i>Adornos
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
              <th className="border-0 fw-normal">Adorno</th>
              <th className="border-0 fw-normal text-end">Cantidad</th>
            </tr>
          </thead>
          <tbody>
            {adornos.length === 0 ? (
              <tr>
                <td colSpan="2" className="text-center text-muted small py-4">
                  No hay adornos registrados
                </td>
              </tr>
            ) : (
              adornos.map(adorno => (
                <tr key={adorno.id}>
                  <td className="align-middle">{adorno.nombre}</td>
                  <td className="align-middle text-end">
                    <span className="badge rounded-pill bg-secondary">
                      {adorno.cantidad}
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

export default Adornos;
