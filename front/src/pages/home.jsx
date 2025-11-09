import { useState, useEffect } from "react";
import '../styles/home.css'; 
import { useNavigate } from "react-router-dom";
// Quitamos el 'import Layout' que estaba en tu archivo, ya que App.jsx lo maneja.

const API_URL = 'http://localhost:3000/torneo';

function Home({ usuario }) { // Recibe 'usuario' de App.jsx
  const [torneo, setTorneo] = useState(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [editando, setEditando] = useState(false);
  const [formatoOriginalAlEditar, setFormatoOriginalAlEditar] = useState('');
  
  const initialFormData = {
    nombre: "", 
    fechaInicio: "", 
    fechaFin: "", 
    formato: "", 
    tipo: "", 
    cantidadEquipos: "",
  };
  
  const [formData, setFormData] = useState(initialFormData);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Helper para verificar roles (de tu archivo)
  const isAdmin = usuario?.rol === 'administrador';
  const isCapitan = usuario?.rol === 'capitan';
  const isJugador = usuario?.rol === 'jugador';

  useEffect(() => {
    cargarTorneo();
  }, []);

  // --- (Todas tus funciones: cargarTorneo, handleChange, handleSubmit, handleEdit, handleDelete... se mantienen EXACTAMENTE IGUAL) ---
  const cargarTorneo = async () => { /* ... (Tu lógica de fetch) ... */ try { const response = await fetch(API_URL, { method: 'GET', credentials: 'include' }); if (!response.ok) throw new Error('No autorizado o error al cargar torneos'); const data = await response.json(); if (data.length > 0) { const hoy = new Date(); hoy.setHours(0, 0, 0, 0); const torneoActivo = data.find(t => { const inicio = new Date(t.fecha_inicio); inicio.setHours(0, 0, 0, 0); const fin = new Date(t.fecha_fin); fin.setHours(23, 59, 59, 999); return hoy >= inicio && hoy <= fin; }); setTorneo(torneoActivo || null); } else { setTorneo(null); } } catch (error) { console.error('Error al cargar torneo:', error); setError(error.message); } };
  const handleChange = (e) => { /* ... (Tu lógica de handle change) ... */ const { name, value } = e.target; setFormData(prev => { const newState = { ...prev, [name]: value }; if (name === 'formato') { newState.cantidadEquipos = value === 'eliminatoria' ? (prev.cantidadEquipos || '16') : (value === 'liga' ? prev.cantidadEquipos || '' : ''); } return newState; }); };
  const handleSubmit = async (e) => { /* ... (Tu lógica de submit) ... */ e.preventDefault(); setError(""); let cantidadEquiposNum = parseInt(formData.cantidadEquipos, 10); if (formData.formato === 'eliminatoria' && (!cantidadEquiposNum || ![8, 16, 32].includes(cantidadEquiposNum))) { setError("Para Eliminatoria, equipos debe ser 8, 16 o 32."); return; } if (formData.formato === 'liga' && (!cantidadEquiposNum || cantidadEquiposNum < 4 || cantidadEquiposNum > 30)) { setError("Para Liga, equipos debe ser entre 4 y 30."); return; } if (!formData.formato) { setError("Debes seleccionar un formato."); return; } try { const dataToSend = { nombre_torneo: formData.nombre, fecha_inicio: formData.fechaInicio, fecha_fin: formData.fechaFin, tipo_torneo: formData.tipo, formato: formData.formato, ...( (formData.formato === 'eliminatoria' || formData.formato === 'liga') && formData.cantidadEquipos && { cantidad_equipos: cantidadEquiposNum }) }; const options = { method: editando ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(dataToSend) }; const url = editando ? `${API_URL}/${torneo.id_torneo}` : API_URL; const response = await fetch(url, options); if (!response.ok) { const errorData = await response.json().catch(() => ({ error: 'Error desconocido al guardar torneo' })); throw new Error(errorData.error || 'Error al guardar torneo'); } setMostrarForm(false); setEditando(false); setFormatoOriginalAlEditar(''); setFormData(initialFormData); cargarTorneo(); } catch (error) { console.error('Error al guardar torneo:', error); setError(error.message); } };
  const handleEdit = (e) => { /* ... (Tu lógica de edit) ... */ e.stopPropagation(); setFormatoOriginalAlEditar(torneo.formato || ''); setFormData({ nombre: torneo.nombre_torneo || "", fechaInicio: torneo.fecha_inicio ? torneo.fecha_inicio.split('T')[0] : "", fechaFin: torneo.fecha_fin ? torneo.fecha_fin.split('T')[0] : "", formato: torneo.formato || "", tipo: torneo.tipo_torneo || "", cantidadEquipos: torneo.cantidad_equipos?.toString() || "", }); setEditando(true); setMostrarForm(true); };
  const handleDelete = async (e) => { /* ... (Tu lógica de delete) ... */ e.stopPropagation(); if (window.confirm(`¿Seguro querés eliminar el torneo "${torneo.nombre_torneo}"?`)) { try { const response = await fetch(`${API_URL}/${torneo.id_torneo}`, { method: 'DELETE', credentials: 'include', }); if (!response.ok) { const errorData = await response.json().catch(() => ({ error: 'Error desconocido al eliminar torneo' })); throw new Error(errorData.error || 'Error al eliminar torneo'); } setTorneo(null); setError(""); } catch (error) { console.error('Error al eliminar torneo:', error); setError(error.message); } } };
  const handleCardClick = () => { /* ... (Tu lógica de card click) ... */ if (!torneo) return; if (torneo.formato === 'eliminatoria') { navigate(`/torneo/${torneo.id_torneo}/fixture`); } else if (torneo.formato === 'liga') { navigate(`/torneo/${torneo.id_torneo}/tabla`); } };
  // ---

  return (
    // <-- Añadimos un Fragment para envolver todo
    <> 
      {/* --- AÑADIDO: Contenedor del Video Hero --- */}
      <div className="video-hero-container fade-in-video">
        <video
          autoPlay muted loop playsInline
          className="video-hero"
        >
          {/* Asegúrate de tener este video en /front/public/intro.mp4 */}
          <source src="/intro.mp4" type="video/mp4" />
          Tu navegador no soporta el video.
        </video>
        
        {/* --- TÍTULO MOVIDO AQUÍ --- */}
        <h1 className="main-title fade-in-hero-title">Bienvenido</h1>
      </div>
      {/* --- FIN AÑADIDO --- */}


      {/* Tu código original de app-container (sin el h1) */}
      <div className="app-container fade-in-bg">
        {error && <p className="error-message" style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
    
        <div className="main-content-wrapper fade-in-main">
          
          {/* --- El H1 "Bienvenido" FUE MOVIDO ARRIBA --- */}
          
          {torneo && !mostrarForm && (
            <div className="torneo-card" onClick={handleCardClick} style={{ cursor: 'pointer' }} title={`Click para ver ${torneo.formato === 'liga' ? 'tabla' : 'fixture'}`}>
              <h2 className="torneo-name">{torneo.nombre_torneo}</h2>
              <div className="torneo-details">
                <p><span className="detail-label">Inicio:</span> {torneo.fecha_inicio_formato || torneo.fecha_inicio}</p>
                <p><span className="detail-label">Fin:</span> {torneo.fecha_fin_formato || torneo.fecha_fin}</p>
                <p><span className="detail-label">Tipo:</span> {torneo.tipo_torneo}</p>
                <p><span className="detail-label">Formato:</span> {torneo.formato}</p>
                {torneo.cantidad_equipos && <p><span className="detail-label">Equipos:</span> {torneo.cantidad_equipos}</p>}
              </div>
              {isAdmin && ( <div className="button-group"> <button onClick={handleEdit} className="btn btn-edit">✏️ Editar</button> <button onClick={handleDelete} className="btn btn-delete">🗑️ Eliminar</button> </div> )}
            </div>
          )}

          {!torneo && !mostrarForm && (
            <div className="torneo-card no-torneo-card">
              <p className="no-torneo-text"> Lo sentimos, por el momento no tenemos ningún torneo agendado. </p>
              {isAdmin && ( <button onClick={() => setMostrarForm(true)} className="btn btn-create"> ➕ Crear Nuevo Torneo </button> )}
            </div>
          )}

          {isAdmin && mostrarForm && (
            <form onSubmit={handleSubmit} className="form-card">
              <h2 className={`form-title ${editando ? "title-edit" : "title-create"}`}>
                {editando ? "✏️ Editar Torneo" : "➕ Crear Nuevo Torneo"}
              </h2>
              <div className="form-inputs-container">
                <input type="text" name="nombre" placeholder="Nombre del torneo" value={formData.nombre} onChange={handleChange} className="form-input-nombreTorneo" required />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}> <label style={{ fontSize: '0.9rem', fontWeight: '500' }}>Fecha de inicio</label> <input type="date" name="fechaInicio" value={formData.fechaInicio} onChange={handleChange} className="form-input" required /> </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}> <label style={{ fontSize: '0.9rem', fontWeight: '500' }}>Fecha de fin</label> <input type="date" name="fechaFin" value={formData.fechaFin} onChange={handleChange} className="form-input" required /> </div>
                <select name="tipo" value={formData.tipo} onChange={handleChange} className="form-input" required> <option value="">Seleccionar tipo</option> <option value="futbol_5">Fútbol 5</option> <option value="futbol_7">Fútbol 7</option> <option value="futbol_11">Fútbol 11</option> </select>
                <select name="formato" value={formData.formato} onChange={handleChange} className="form-input" required disabled={editando && formatoOriginalAlEditar === 'eliminatoria'} title={editando && formatoOriginalAlEditar === 'eliminatoria' ? "No se puede cambiar el formato" : "Seleccionar formato"} > <option value="">Seleccionar formato</option> <option value="liga">Liga</option> <option value="eliminatoria">Eliminatoria</option> </select>
                {formData.formato === 'eliminatoria' && ( <select name="cantidadEquipos" value={formData.cantidadEquipos} onChange={handleChange} className="form-input" required disabled={editando && formatoOriginalAlEditar === 'eliminatoria'} title={editando && formatoOriginalAlEditar === 'eliminatoria' ? "No se puede cambiar la cantidad" : "Seleccionar cantidad"} > <option value="" disabled={formData.cantidadEquipos !== ""}>Nº de equipos (Eliminatoria)</option> <option value="8">8 equipos</option> <option value="16">16 equipos</option> <option value="32">32 equipos</option> </select> )}
                {formData.formato === 'liga' && (
                      <input 
                          type="number" 
                          name="cantidadEquipos" 
                          placeholder="Nº de equipos (Liga, 4-30)"
                          value={formData.cantidadEquipos} 
                          onChange={handleChange} 
                          className="form-input" 
                          required
                          min="4" 
                          max="30"
                      />
                  )}
              </div>
              
              <div className="button-group-footer">
                  <button 
                      type="submit" 
                      className={`btn form-submit-btn ${editando ? "btn-edit-submit" : "btn-create-submit"}`}
                  >
                      {editando ? "Guardar Cambios" : "Crear Torneo"}
                  </button>
                  <button 
                      type="button" 
                      onClick={() => { 
                          setMostrarForm(false); 
                          setEditando(false); 
                          setFormatoOriginalAlEditar(''); 
                          setFormData(initialFormData); 
                          setError(""); 
                      }} 
                      className="btn btn-cancel"
                  >
                      Cancelar
                  </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </> // <-- Cierre del Fragment
  );
}

export default Home;