import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../firebaseConfig';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import html2canvas from 'html2canvas';

const Regalos = () => {
  const [regalos, setRegalos] = useState([]);
  const [formData, setFormData] = useState({
    nombre: '',
    familiar: '',
    prioridad: 1
  });
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const tableRef = useRef(null);

  useEffect(() => {
    cargarRegalos();
  }, []);

  const cargarRegalos = async () => {
    try {
      const q = query(collection(db, 'regalos'), orderBy('prioridad', 'asc'));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setRegalos(data);
    } catch (error) {
      console.error('Error al cargar regalos:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateDoc(doc(db, 'regalos', editingId), {
          nombre: formData.nombre,
          familiar: formData.familiar,
          prioridad: parseInt(formData.prioridad)
        });
      } else {
        await addDoc(collection(db, 'regalos'), {
          nombre: formData.nombre,
          familiar: formData.familiar,
          prioridad: parseInt(formData.prioridad)
        });
      }
      setFormData({ nombre: '', familiar: '', prioridad: 1 });
      setEditingId(null);
      setShowForm(false);
      cargarRegalos();
    } catch (error) {
      console.error('Error al guardar regalo:', error);
    }
  };

  const handleEdit = (regalo) => {
    setFormData({
      nombre: regalo.nombre,
      familiar: regalo.familiar,
      prioridad: regalo.prioridad
    });
    setEditingId(regalo.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de eliminar este regalo?')) {
      try {
        await deleteDoc(doc(db, 'regalos', id));
        cargarRegalos();
      } catch (error) {
        console.error('Error al eliminar regalo:', error);
      }
    }
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text('Lista de Regalos', 14, 15);
    doc.autoTable({
      startY: 25,
      head: [['Nombre del Regalo', 'Familiar', 'Prioridad']],
      body: regalos.map(r => [r.nombre, r.familiar, r.prioridad]),
    });
    doc.save('regalos.pdf');
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      regalos.map(r => ({
        'Nombre del Regalo': r.nombre,
        'Familiar': r.familiar,
        'Prioridad': r.prioridad
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Regalos');
    XLSX.writeFile(workbook, 'regalos.xlsx');
  };

  const exportToPNG = async () => {
    if (tableRef.current) {
      const canvas = await html2canvas(tableRef.current);
      const link = document.createElement('a');
      link.download = 'regalos.png';
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mt-4"
    >
      <div className="card shadow">
        <div className="card-header bg-danger text-white">
          <h3 className="mb-0">Regalos de Navidad</h3>
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
                setFormData({ nombre: '', familiar: '', prioridad: 1 });
              }}
            >
              {showForm ? 'Cancelar' : 'Agregar Regalo'}
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
                    <div className="col-md-4 mb-2">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Nombre del regalo"
                        value={formData.nombre}
                        onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-4 mb-2">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Nombre del familiar"
                        value={formData.familiar}
                        onChange={(e) => setFormData({ ...formData, familiar: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-2 mb-2">
                      <select
                        className="form-control"
                        value={formData.prioridad}
                        onChange={(e) => setFormData({ ...formData, prioridad: e.target.value })}
                        required
                      >
                        <option value={1}>Prioridad 1</option>
                        <option value={2}>Prioridad 2</option>
                        <option value={3}>Prioridad 3</option>
                      </select>
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
              <thead className="table-danger">
                <tr>
                  <th>Nombre del Regalo</th>
                  <th>Familiar</th>
                  <th>Prioridad</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {regalos.map((regalo, index) => (
                    <motion.tr
                      key={regalo.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <td>{regalo.nombre}</td>
                      <td>{regalo.familiar}</td>
                      <td>
                        <span className={`badge bg-${regalo.prioridad === 1 ? 'danger' : regalo.prioridad === 2 ? 'warning' : 'secondary'}`}>
                          Prioridad {regalo.prioridad}
                        </span>
                      </td>
                      <td>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="btn btn-sm btn-warning me-2"
                          onClick={() => handleEdit(regalo)}
                        >
                          Editar
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(regalo.id)}
                        >
                          Eliminar
                        </motion.button>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
            {regalos.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center text-muted py-4"
              >
                No hay regalos registrados
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Regalos;
