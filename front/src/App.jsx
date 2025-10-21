import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/home.jsx";
<<<<<<< Updated upstream
=======
import Registro from './Registro.jsx'
import ListaUsuarios from './pages/ListaUsuarios.jsx'
import Equipo from "./pages/equipo.jsx";
import Torneos from "./pages/torneo.jsx";
import LoginRegister from "./pages/LoginRegister.jsx"
import Fixture from "./pages/Fixture.jsx"; // <-- AÑADIR ESTA LÍNEA

import React, { useState } from 'react';
>>>>>>> Stashed changes

function App() {
  const [count, setCount] = useState(0)

  const isAdmin = true; //hardcodeado por ahora

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home isAdmin={isAdmin} />} />
<<<<<<< Updated upstream
=======
        <Route path="/registro" element={<Registro isAdmin={isAdmin} />} />
        <Route path="/usuarios" element={<ListaUsuarios isAdmin={isAdmin} />} />
        <Route path="/equipo" element={<Equipo isAdmin={isAdmin} />} />
        <Route path="/torneo" element={<Torneos isAdmin={isAdmin} />} />
        <Route path="/login" element={<LoginRegister isAdmin={isAdmin} />} />
        {/* --- AÑADIR ESTA RUTA --- */}
        <Route path="/torneo/:idTorneo/fixture" element={<Fixture isAdmin={isAdmin} />} />
>>>>>>> Stashed changes
      </Routes>
    </BrowserRouter>
  );
}

export default App