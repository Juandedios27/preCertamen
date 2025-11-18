import React from 'react';
import Regalos from './components/Regalos';
import Comida from './components/Comida';
import Adornos from './components/Adornos';
import './css/bootstrap.min.css';

function App() {
  return (
    <div className="App" style={{ backgroundColor: '#ffffff', minHeight: '100vh' }}>
      <div className="container py-4">
        <header className="mb-4 pb-3 border-bottom text-center">
          <h1 className="h4 mb-1 text-dark fw-normal">Sistema de Gestión</h1>
        </header>

        <div className="row g-3">
          <div className="col-12">
            <Regalos />
          </div>
          <div className="col-12">
            <Comida />
          </div>
          <div className="col-12">
            <Adornos />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
