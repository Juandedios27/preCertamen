import React from 'react';
import { motion } from 'framer-motion';
import Regalos from './components/Regalos';
import Comida from './components/Comida';
import Adornos from './components/Adornos';
import './css/bootstrap.min.css';

function App() {
  return (
    <div className="App" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh', paddingBottom: '3rem' }}>
      <motion.header
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-primary text-white py-4 mb-4"
      >
        <div className="container">
          <motion.h1
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="display-4 text-center fw-bold"
          >
            Sistema de Gestión Navideña
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-center lead mb-0"
          >
            Organiza tu Navidad con estilo
          </motion.p>
        </div>
      </motion.header>

      <div className="container-fluid px-4">
        <Regalos />
        <Comida />
        <Adornos />
      </div>

      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="text-center text-muted py-4 mt-5"
      >
        <div className="container">
          <p className="mb-0">
            Sistema de Gestión Navideña - Desarrollado con React y Firebase
          </p>
        </div>
      </motion.footer>
    </div>
  );
}

export default App;
