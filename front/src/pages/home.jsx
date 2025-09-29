import { useState, useEffect } from "react";
import '../styles/home.css'; 

const API_URL = 'http://localhost:3000/torneo';

function Home({ isAdmin }) {
  const [torneo, setTorneo] = useState(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [editando, setEditando] = useState(false);
  const [formData, setFormData] = useState({
    nombre: "", fechaInicio: "", fechaFin: "", formato: "", tipo: "",
  });

  // Cargar torneo al iniciar
  useEffect(() => {
    cargarTorneo();
  }, []);

  const cargarTorneo = async () => {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      
      if (data.length > 0) {
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        
        // Buscar torneo activo (donde hoy esté entre fecha_inicio y fecha_fin)
        const torneoActivo = data.find(t => {
          const inicio = new Date(t.fecha_inicio);
          inicio.setHours(0, 0, 0, 0);
          const fin = new Date(t.fecha_fin);
          fin.setHours(23, 59, 59, 999);
          
          return hoy >= inicio && hoy <= fin;
        });
        
        // Solo mostrar si hay torneo activo
        setTorneo(torneoActivo || null);
      }
    } catch (error) {
      console.error('Error al cargar torneo:', error);
    }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editando) {
        // Editar torneo existente
        const response = await fetch(`${API_URL}/${torneo.id_torneo}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            nombre_torneo: formData.nombre,
            fecha_inicio: formData.fechaInicio,
            fecha_fin: formData.fechaFin,
            tipo_torneo: formData.tipo,
            formato: formData.formato
          }),
        });
        
        const torneoActualizado = await response.json();
        setTorneo(torneoActualizado);
      } else {
        // Crear nuevo torneo
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            nombre_torneo: formData.nombre,
            fecha_inicio: formData.fechaInicio,
            fecha_fin: formData.fechaFin,
            tipo_torneo: formData.tipo,
            formato: formData.formato
          }),
        });
        
        const nuevoTorneo = await response.json();
        setTorneo(nuevoTorneo);
      }
      
      setMostrarForm(false);
      setEditando(false);
      setFormData({ nombre: "", fechaInicio: "", fechaFin: "", formato: "", tipo: "" });
      cargarTorneo();
    } catch (error) {
      console.error('Error al guardar torneo:', error);
    }
  };

  const handleEdit = () => {
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

  const handleDelete = async () => {
    try {
      await fetch(`http://localhost:3000/torneo/torneos/${torneo.id_torneo}`, {
        method: 'DELETE',
      });
      setTorneo(null);
    } catch (error) {
      console.error('Error al eliminar torneo:', error);
    }
  };
  
  return (
    <>
      {/* ===== NUEVO HEADER ===== */}
      <header className="app-header">
        <div className="header-logo">
          <a href="/">TORNEO</a>
        </div>
        <nav className="header-nav">
          <a href="#" className="btn">Torneos</a>
          <a href="equipo" className="btn">Equipo</a>
          <a href="#" className="btn">Estadísticas</a>
          <a href="usuarios" className="btn">Usuarios</a>
          <a href="#" className="btn btn-login">Login</a>
        </nav>
      </header>

      <div className="app-container">
        <div className="main-content-wrapper">
          <h1 className="main-title">
            Bienvenido
          </h1>

          {/* --- VISTA DEL TORNEO ACTIVO --- */}
          {torneo && !mostrarForm && (
            <>
            <div className="torneo-card">
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
            </>
          )}

          {/* --- VISTA CUANDO NO HAY TORNEO --- */}
          {!torneo && !mostrarForm && (
            <>
            <div className="torneo-card no-torneo-card">
              <p className="no-torneo-text">Lo sentimos, por el momento no tenemos ningún torneo agendado. Mientras tanto podes mirar estadísticas y torneos!</p>
              {isAdmin && (
                <button onClick={() => setMostrarForm(true)} className="btn btn-create">
                  ➕ Crear Nuevo Torneo
                </button>
              )}
            </div>
            </>
          )}

          {/* --- FORMULARIO DE CREACIÓN/EDICIÓN --- */}
          {isAdmin && mostrarForm && (
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