import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../firebaseConfig';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import html2canvas from 'html2canvas';

const Adornos = () => {
  const [adornos, setAdornos] = useState([]);
  const [formData, setFormData] = useState({
    nombre: '',
    cantidad: 0
  });
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const tableRef = useRef(null);

  useEffect(() => {
    cargarAdornos();
  }, []);

  const cargarAdornos = async () => {
    try {
      const q = query(collection(db, 'adornos'), orderBy('cantidad', 'asc'));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAdornos(data);
    } catch (error) {
      console.error('Error al cargar adornos:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateDoc(doc(db, 'adornos', editingId), {
          nombre: formData.nombre,
          cantidad: parseInt(formData.cantidad)
        });
      } else {
        await addDoc(collection(db, 'adornos'), {
          nombre: formData.nombre,
          cantidad: parseInt(formData.cantidad)
        });
      }
      setFormData({ nombre: '', cantidad: 0 });
      setEditingId(null);
      setShowForm(false);
      cargarAdornos();
    } catch (error) {
      console.error('Error al guardar adorno:', error);
    }
  };

  const handleEdit = (adorno) => {
    setFormData({
      nombre: adorno.nombre,
      cantidad: adorno.cantidad
    });
    setEditingId(adorno.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de eliminar este adorno?')) {
      try {
        await deleteDoc(doc(db, 'adornos', id));
        cargarAdornos();
      } catch (error) {
        console.error('Error al eliminar adorno:', error);
      }
    }
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text('Lista de Adornos', 14, 15);
    doc.autoTable({
      startY: 25,
      head: [['Nombre del Adorno', 'Cantidad']],
      body: adornos.map(a => [a.nombre, a.cantidad]),
    });
    doc.save('adornos.pdf');
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      adornos.map(a => ({
        'Nombre del Adorno': a.nombre,
        'Cantidad': a.cantidad
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Adornos');
    XLSX.writeFile(workbook, 'adornos.xlsx');
  };

  const exportToPNG = async () => {
    if (tableRef.current) {
      const canvas = await html2canvas(tableRef.current);
      const link = document.createElement('a');
      link.download = 'adornos.png';
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="container mt-4"
    >
      <div className="card shadow">
        <div className="card-header bg-warning text-dark">
          <h3 className="mb-0">Adornos de Navidad</h3>
        </div>
        <div className="card-body">
          <div className="mb-3 d-flex gap-2 flex-wrap">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn btn-primary"
              onClick={() => {
                setShowForm(!showForm);
                setEditingId(null);
                setFormData({ nombre: '', cantidad: 0 });
              }}
            >
              {showForm ? 'Cancelar' : 'Agregar Adorno'}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn btn-danger"
              onClick={exportToPDF}
            >
              Exportar PDF
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn btn-success"
              onClick={exportToExcel}
            >
              Exportar Excel
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn btn-info"
              onClick={exportToPNG}
            >
              Exportar PNG
            </motion.button>
          </div>

          <AnimatePresence>
            {showForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <form onSubmit={handleSubmit} className="mb-4 p-3 border rounded bg-light">
                  <div className="row">
                    <div className="col-md-6 mb-2">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Nombre del adorno"
                        value={formData.nombre}
                        onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-4 mb-2">
                      <input
                        type="number"
                        className="form-control"
                        placeholder="Cantidad"
                        min="0"
                        value={formData.cantidad}
                        onChange={(e) => setFormData({ ...formData, cantidad: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-2 mb-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        type="submit"
                        className="btn btn-success w-100"
                      >
                        {editingId ? 'Actualizar' : 'Guardar'}
                      </motion.button>
                    </div>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={tableRef} className="table-responsive">
            <table className="table table-striped table-hover">
              <thead className="table-warning">
                <tr>
                  <th>Nombre del Adorno</th>
                  <th>Cantidad</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {adornos.map((adorno, index) => (
                    <motion.tr
                      key={adorno.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <td>{adorno.nombre}</td>
                      <td>
                        <span className={`badge bg-${adorno.cantidad < 5 ? 'danger' : adorno.cantidad < 10 ? 'warning' : 'success'}`}>
                          {adorno.cantidad} unidades
                        </span>
                      </td>
                      <td>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="btn btn-sm btn-warning me-2"
                          onClick={() => handleEdit(adorno)}
                        >
                          Editar
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(adorno.id)}
                        >
                          Eliminar
                        </motion.button>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
            {adornos.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center text-muted py-4"
              >
                No hay adornos registrados
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Adornos;
