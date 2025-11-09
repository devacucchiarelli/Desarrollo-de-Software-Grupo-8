import './App.css'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/home.jsx";
import Registro from './Registro.jsx'
import ListaUsuarios from './pages/ListaUsuarios.jsx'
import Equipo from "./pages/equipo.jsx";
import Torneos from "./pages/torneo.jsx";
import LoginRegister from "./LoginRegister.jsx"
import Fixture from "./pages/Fixture.jsx";
import EstadisticasTorneo from './pages/EstadisticasTorneo.jsx';
import TablaPosiciones from "./pages/TablaPosiciones.jsx";
import Layout from './pages/layout';
import PerfilUsuario from "./pages/PerfilUsuario";
import ListaTorneos from './pages/ListaTorneos.jsx'

import React, { useState, useEffect } from 'react';

function App() {
  const [loading, setLoading] = useState(true);
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    verificarAuth();
  }, []);

  const verificarAuth = async () => {
    try {
      const response = await fetch('http://localhost:3000/usuarios/me', {
        method: 'GET',
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        console.log('🔵 Usuario desde /usuarios/me:', data);
        setUsuario(data);
      } else {
        setUsuario(null);
      }
    } catch (error) {
      console.error('Error al verificar autenticación:', error);
      setUsuario(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSuccess = () => {
    verificarAuth();
  };

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:3000/usuarios/logout', {
        method: 'POST',
        credentials: 'include',
      });
      setUsuario(null);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  if (loading) {
    return <div>Cargando...</div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta sin Layout */}
        <Route path="/login" element={<LoginRegister onLoginSuccess={handleLoginSuccess} usuario={usuario} />} />

        {/* Rutas con Layout */}
        <Route element={<Layout usuario={usuario} onLogout={handleLogout} />}>
          <Route path="/" element={<Home usuario={usuario} />} />
          <Route path="/registro" element={<Registro usuario={usuario} />} />
          <Route path="/usuarios" element={<ListaUsuarios usuario={usuario} />} />
          <Route path="/equipo" element={<Equipo usuario={usuario} />} />
          <Route path="/torneo" element={<Torneos usuario={usuario} />} />
          <Route path="/torneo/:idTorneo/fixture" element={<Fixture usuario={usuario} />} />
          <Route path="/torneo/:idTorneo/tabla" element={<TablaPosiciones usuario={usuario} />} />
          <Route path="/perfil" element={<PerfilUsuario />} />
          <Route path="/torneos" element={<ListaTorneos usuario={usuario} />} />
          <Route path="/estadisticas/:id_torneo" element={<EstadisticasTorneo usuario={usuario} />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App
