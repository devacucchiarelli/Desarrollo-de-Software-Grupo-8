import { Link } from 'react-router-dom'
import './App.css'

function App() {
  return (
    <div style={{ padding: 20 }}>
      <h1>Frontend de Torneos funcionando ⚽🚀</h1>
      <p>
        <Link to="/registro">Ir al Registro</Link>
      </p>
      <p>
        <Link to="/usuarios">Ver usuarios registrados</Link>
      </p>
    </div>
  )
}

export default App
