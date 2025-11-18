import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../firebaseConfig';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import html2canvas from 'html2canvas';

const Comida = () => {
  const [comidas, setComidas] = useState([]);
  const [formData, setFormData] = useState({
    nombre: '',
    congelado: false
  });
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const tableRef = useRef(null);

  useEffect(() => {
    cargarComidas();
  }, []);

  const cargarComidas = async () => {
    try {
      // Ordenar por congelado (descendente) para que los congelados aparezcan primero
      const q = query(collection(db, 'comida'), orderBy('congelado', 'desc'));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setComidas(data);
    } catch (error) {
      console.error('Error al cargar comidas:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateDoc(doc(db, 'comida', editingId), {
          nombre: formData.nombre,
          congelado: formData.congelado
        });
      } else {
        await addDoc(collection(db, 'comida'), {
          nombre: formData.nombre,
          congelado: formData.congelado
        });
      }
      setFormData({ nombre: '', congelado: false });
      setEditingId(null);
      setShowForm(false);
      cargarComidas();
    } catch (error) {
      console.error('Error al guardar comida:', error);
    }
  };

  const handleEdit = (comida) => {
    setFormData({
      nombre: comida.nombre,
      congelado: comida.congelado
    });
    setEditingId(comida.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de eliminar esta comida?')) {
      try {
        await deleteDoc(doc(db, 'comida', id));
        cargarComidas();
      } catch (error) {
        console.error('Error al eliminar comida:', error);
      }
    }
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text('Lista de Comida', 14, 15);
    doc.autoTable({
      startY: 25,
      head: [['Nombre del Alimento', 'Congelado']],
      body: comidas.map(c => [c.nombre, c.congelado ? 'Sí' : 'No']),
    });
    doc.save('comida.pdf');
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      comidas.map(c => ({
        'Nombre del Alimento': c.nombre,
        'Congelado': c.congelado ? 'Sí' : 'No'
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Comida');
    XLSX.writeFile(workbook, 'comida.xlsx');
  };

  const exportToPNG = async () => {
    if (tableRef.current) {
      const canvas = await html2canvas(tableRef.current);
      const link = document.createElement('a');
      link.download = 'comida.png';
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="container mt-4"
    >
      <div className="card shadow">
        <div className="card-header bg-success text-white">
          <h3 className="mb-0">Comida de Navidad</h3>
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
                setFormData({ nombre: '', congelado: false });
              }}
            >
              {showForm ? 'Cancelar' : 'Agregar Comida'}
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
                        placeholder="Nombre del alimento"
                        value={formData.nombre}
                        onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-4 mb-2">
                      <div className="form-check form-switch pt-2">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="congeladoSwitch"
                          checked={formData.congelado}
                          onChange={(e) => setFormData({ ...formData, congelado: e.target.checked })}
                        />
                        <label className="form-check-label" htmlFor="congeladoSwitch">
                          Congelado
                        </label>
                      </div>
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
              <thead className="table-success">
                <tr>
                  <th>Nombre del Alimento</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {comidas.map((comida, index) => (
                    <motion.tr
                      key={comida.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <td>{comida.nombre}</td>
                      <td>
                        {comida.congelado ? (
                          <span className="badge bg-info">Congelado</span>
                        ) : (
                          <span className="badge bg-warning text-dark">No Congelado</span>
                        )}
                      </td>
                      <td>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="btn btn-sm btn-warning me-2"
                          onClick={() => handleEdit(comida)}
                        >
                          Editar
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(comida.id)}
                        >
                          Eliminar
                        </motion.button>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
            {comidas.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center text-muted py-4"
              >
                No hay comidas registradas
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Comida;
