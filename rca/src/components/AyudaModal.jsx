import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const AyudaModal = () => {
  const [showHelp, setShowHelp] = useState(false);

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setShowHelp(true)}
        className="btn btn-info position-fixed"
        style={{ bottom: '20px', right: '20px', borderRadius: '50%', width: '60px', height: '60px', fontSize: '24px', zIndex: 1000 }}
        title="Ayuda"
      >
        ❓
      </motion.button>

      <AnimatePresence>
        {showHelp && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="position-fixed w-100 h-100 bg-dark"
              style={{ top: 0, left: 0, zIndex: 1050 }}
              onClick={() => setShowHelp(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="position-fixed bg-white rounded shadow-lg p-4"
              style={{
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                maxWidth: '600px',
                maxHeight: '80vh',
                overflowY: 'auto',
                zIndex: 1060
              }}
            >
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h3 className="mb-0">📖 Guía Rápida</h3>
                <button
                  className="btn btn-close"
                  onClick={() => setShowHelp(false)}
                  aria-label="Cerrar"
                />
              </div>

              <div className="mb-4">
                <h5 className="text-primary">🎁 Gestión de Regalos</h5>
                <ul className="small">
                  <li><strong>Agregar:</strong> Click en "Agregar Regalo", llena el formulario y guarda</li>
                  <li><strong>Editar:</strong> Click en ✏️ de la fila que deseas modificar</li>
                  <li><strong>Eliminar:</strong> Click en 🗑️ y confirma la eliminación</li>
                  <li><strong>Orden:</strong> Los regalos se ordenan por prioridad (1=Alta, 3=Baja)</li>
                </ul>
              </div>

              <div className="mb-4">
                <h5 className="text-success">🍽️ Gestión de Comida</h5>
                <ul className="small">
                  <li><strong>Agregar:</strong> Click en "Agregar Comida", ingresa el nombre y marca si está congelado</li>
                  <li><strong>Orden:</strong> Los alimentos congelados aparecen primero</li>
                  <li><strong>Switch:</strong> Usa el interruptor para marcar como congelado/no congelado</li>
                </ul>
              </div>

              <div className="mb-4">
                <h5 className="text-warning">✨ Gestión de Adornos</h5>
                <ul className="small">
                  <li><strong>Agregar:</strong> Click en "Agregar Adorno", ingresa nombre y cantidad</li>
                  <li><strong>Orden:</strong> Los adornos se ordenan por cantidad (menor a mayor)</li>
                  <li><strong>Cantidad:</strong> Puedes ingresar cualquier número entero positivo</li>
                </ul>
              </div>

              <div className="mb-4">
                <h5 className="text-info">📊 Exportación de Datos</h5>
                <p className="small mb-2">Cada tabla tiene tres opciones de exportación:</p>
                <ul className="small">
                  <li><strong>📄 PDF:</strong> Genera un documento PDF con todos los datos</li>
                  <li><strong>📊 Excel:</strong> Descarga un archivo .xlsx para editar en Excel</li>
                  <li><strong>🖼️ PNG:</strong> Captura una imagen de la tabla actual</li>
                </ul>
              </div>

              <div className="mb-4">
                <h5 className="text-danger">🎨 Animaciones</h5>
                <p className="small">La aplicación incluye animaciones suaves:</p>
                <ul className="small">
                  <li>Entrada progresiva de componentes</li>
                  <li>Efectos hover en botones</li>
                  <li>Transiciones al agregar/eliminar elementos</li>
                  <li>Formularios con animaciones de apertura/cierre</li>
                </ul>
              </div>

              <div className="alert alert-info small mb-3">
                <strong>💡 Consejo:</strong> Los cambios se guardan automáticamente en Firebase y se reflejan en tiempo real en todas las vistas.
              </div>

              <div className="alert alert-warning small">
                <strong>⚠️ Nota:</strong> Asegúrate de tener una conexión a internet activa para que los datos se sincronicen correctamente con Firebase.
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn btn-primary w-100"
                onClick={() => setShowHelp(false)}
              >
                Entendido
              </motion.button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default AyudaModal;
