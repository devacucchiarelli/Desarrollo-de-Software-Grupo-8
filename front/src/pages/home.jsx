import { useState, useEffect } from "react";
import '../styles/home.css'; 
import { useNavigate } from "react-router-dom"; // <-- AÑADIR ESTA LÍNEA
import { Link } from "react-router-dom";

const API_URL = 'http://localhost:3000/torneo';

function Home({ isAdmin }) {
  const [torneo, setTorneo] = useState(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [editando, setEditando] = useState(false);
  const [formData, setFormData] = useState({
    nombre: "", fechaInicio: "", fechaFin: "", formato: "", tipo: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate(); // <-- AÑADIR ESTA LÍNEA

  // Cargar torneo al iniciar
  useEffect(() => {
    cargarTorneo();
  }, []);

  const cargarTorneo = async () => {
    // ... (sin cambios aquí)
    try {
      const response = await fetch(API_URL, {
        method: 'GET',
        credentials: 'include', 
      });
      if (!response.ok) throw new Error('No autorizado o error al cargar torneos');
      const data = await response.json();
      if (data.length > 0) {
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        const torneoActivo = data.find(t => {
          const inicio = new Date(t.fecha_inicio);
          inicio.setHours(0, 0, 0, 0);
          const fin = new Date(t.fecha_fin);
          fin.setHours(23, 59, 59, 999);
          return hoy >= inicio && hoy <= fin;
        });
        setTorneo(torneoActivo || null);
      } else {
        setTorneo(null);
      }
    } catch (error) {
      console.error('Error al cargar torneo:', error);
      setError(error.message);
    }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  
  const handleSubmit = async (e) => {
    // ... (sin cambios aquí)
    e.preventDefault();
    try {
      const options = {
        method: editando ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          nombre_torneo: formData.nombre,
          fecha_inicio: formData.fechaInicio,
          fecha_fin: formData.fechaFin,
          tipo_torneo: formData.tipo,
          formato: formData.formato
        }),
      };
      const url = editando ? `${API_URL}/${torneo.id_torneo}` : API_URL;
      const response = await fetch(url, options);
      if (!response.ok) throw new Error('Error al guardar torneo');
      const torneoGuardado = await response.json();
      setTorneo(torneoGuardado);
      setMostrarForm(false);
      setEditando(false);
      setFormData({ nombre: "", fechaInicio: "", fechaFin: "", formato: "", tipo: "" });
      cargarTorneo();
    } catch (error) {
      console.error('Error al guardar torneo:', error);
      setError(error.message);
    }
  };

  const handleEdit = (e) => {
    // --- INICIO CAMBIO ---
    // Detenemos la propagación para que no navegue a la página de fixture
    e.stopPropagation(); 
    // --- FIN CAMBIO ---
    setFormData({
      nombre: torneo.nombre_torneo || "",
      fechaInicio: torneo.fecha_inicio || "",
      fechaFin: torneo.fecha_fin || "",
      formato: torneo.formato || "",
      tipo: torneo.tipo_torneo || "",
    });
    setEditando(true);
    setMostrarForm(true);
  };

  const handleDelete = async (e) => {
    // --- INICIO CAMBIO ---
    e.stopPropagation(); // Detenemos la propagación
    // --- FIN CAMBIO ---
    try {
      const response = await fetch(`${API_URL}/${torneo.id_torneo}`, {
        method: 'DELETE',
        credentials: 'include', 
      });
      if (!response.ok) throw new Error('Error al eliminar torneo');
      setTorneo(null);
    } catch (error) {
      console.error('Error al eliminar torneo:', error);
      setError(error.message);
    }
  };
  
  return (
    <>
      <header className="app-header">
        {/* ... (sin cambios en el header) ... */}
        <div className="header-logo">
          <a href="/">TORNEO</a>
        </div>
        <nav className="header-nav">
          <a href="torneo" className="btn">Torneos</a>
          <a href="equipo" className="btn">Equipo</a>
          <Link to="/estadisticas" className="btn">Estadísticas</Link>
          <a href="usuarios" className="btn">Usuarios</a>
          <Link to="/login" className="btn btn-login">Login</Link>
        </nav>
      </header>

      <div className="app-container">
        {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
        <div className="main-content-wrapper">
          <h1 className="main-title">Bienvenido</h1>

          {torneo && !mostrarForm && (
            // --- INICIO CAMBIO ---
            // Hacemos la tarjeta clickeable y le damos estilo
            <div 
              className="torneo-card" 
              onClick={() => navigate(`/torneo/${torneo.id_torneo}/fixture`)}
              style={{ cursor: 'pointer' }}
              title="Click para ver el fixture"
            >
            {/* --- FIN CAMBIO --- */}
              <h2 className="torneo-name">{torneo.nombre_torneo}</h2>
              <div className="torneo-details">
                <p><span className="detail-label">Inicio:</span> {torneo.fecha_inicio_formato}</p>
                <p><span className="detail-label">Fin:</span> {torneo.fecha_fin_formato}</p>
                <p><span className="detail-label">Tipo:</span> {torneo.tipo_torneo}</p>
                <p><span className="detail-label">Formato:</span> {torneo.formato}</p>
              </div>
              {isAdmin && (
                <div className="button-group">
                  <button onClick={handleEdit} className="btn btn-edit">✏️ Editar</button>
                  <button onClick={handleDelete} className="btn btn-delete">🗑️ Eliminar</button>
                </div>
              )}
            </div>
          )}

          {!torneo && !mostrarForm && (
            // ... (sin cambios aquí)
            <div className="torneo-card no-torneo-card">
              <p className="no-torneo-text">
                Lo sentimos, por el momento no tenemos ningún torneo agendado.
              </p>
              {isAdmin && (
                <button onClick={() => setMostrarForm(true)} className="btn btn-create">
                  ➕ Crear Nuevo Torneo
                </button>
              )}
            </div>
          )}

          {isAdmin && mostrarForm && (
            // ... (sin cambios aquí)
            <form onSubmit={handleSubmit} className="form-card">
              <h2 className={`form-title ${editando ? "title-edit" : "title-create"}`}>
                {editando ? "✏️ Editar Torneo" : "➕ Crear Nuevo Torneo"}
              </h2>
              <div className="form-inputs-container">
                <input type="text" name="nombre" placeholder="Nombre del torneo" value={formData.nombre} onChange={handleChange} className="form-input-nombreTorneo" required />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.9rem', fontWeight: '500' }}>Fecha de inicio</label>
                  <input type="date" name="fechaInicio" value={formData.fechaInicio} onChange={handleChange} className="form-input" required />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.9rem', fontWeight: '500' }}>Fecha de fin</label>
                  <input type="date" name="fechaFin" value={formData.fechaFin} onChange={handleChange} className="form-input" required />
                </div>
                <select name="tipo" value={formData.tipo} onChange={handleChange} className="form-input" required>
                  <option value="">Seleccionar tipo</option>
                  <option value="futbol_5">Fútbol 5</option>
                  <option value="futbol_7">Fútbol 7</option>
                  <option value="futbol_11">Fútbol 11</option>
                </select>
                <select name="formato" value={formData.formato} onChange={handleChange} className="form-input" required>
                  <option value="">Seleccionar formato</option>
                  <option value="liga">Liga</option>
                  <option value="eliminatoria">Eliminatoria</option>
                </select>
              </div>
              <div className="button-group-footer">
                <button type="submit" className={`btn form-submit-btn ${editando ? "btn-edit-submit" : "btn-create-submit"}`}>
                  {editando ? "Guardar Cambios" : "Crear Torneo"}
                </button>
                <button type="button" onClick={() => { setMostrarForm(false); setEditando(false); }} className="btn btn-cancel">
                  Cancelar
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
}

export default Home;