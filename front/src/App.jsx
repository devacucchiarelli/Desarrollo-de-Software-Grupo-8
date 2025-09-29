import './App.css'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/home.jsx";
import Registro from './Registro.jsx'
import ListaUsuarios from './ListaUsuarios.jsx'
import Equipo from "./pages/equipo.jsx";

import React, { useState } from 'react';

function App() {

  const [count, setCount] = useState(0)

  const isAdmin = true; //hardcodeado por ahora

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home isAdmin={isAdmin} />} />
        <Route path="/registro" element={<Registro isAdmin={isAdmin} />} />
        <Route path="/usuarios" element={<ListaUsuarios isAdmin={isAdmin} />} />
        <Route path="/equipo" element={<Equipo isAdmin={isAdmin} />} />
      </Routes>
    </BrowserRouter>
  );

}



export default App
