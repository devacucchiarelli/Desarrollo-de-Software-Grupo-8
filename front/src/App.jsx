import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/home.jsx";

function App() {
  const [count, setCount] = useState(0)

  const isAdmin = true; //hardcodeado por ahora

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home isAdmin={isAdmin} />} />
      </Routes>
    </BrowserRouter>
  );

}



export default App
