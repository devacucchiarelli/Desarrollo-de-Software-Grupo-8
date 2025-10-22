import { useState, useEffect } from "react";
import '../styles/home.css';
import { useNavigate } from "react-router-dom";

const API_URL = 'http://localhost:3000/torneo';

function Home({ isAdmin }) {
  const [torneo, setTorneo] = useState(null); // El torneo activo cargado
  const [mostrarForm, setMostrarForm] = useState(false);
  const [editando, setEditando] = useState(false);
  // Guardamos el formato original al empezar a editar, para saber si deshabilitar
  const [formatoOriginalAlEditar, setFormatoOriginalAlEditar] = useState('');
  const initialFormData = {
    nombre: "", fechaInicio: "", fechaFin: "", formato: "", tipo: "", cantidadEquipos: "16",
  };
  const [formData, setFormData] = useState(initialFormData);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    cargarTorneo();
  }, []);

  const cargarTorneo = async () => {
    // ... (Sin cambios aquí)
    try { const response = await fetch(API_URL, { method: 'GET', credentials: 'include', }); if (!response.ok) throw new Error('No autorizado o error al cargar torneos'); const data = await response.json(); if (data.length > 0) { const hoy = new Date(); hoy.setHours(0, 0, 0, 0); const torneoActivo = data.find(t => { const inicio = new Date(t.fecha_inicio); inicio.setHours(0, 0, 0, 0); const fin = new Date(t.fecha_fin); fin.setHours(23, 59, 59, 999); return hoy >= inicio && hoy <= fin; }); setTorneo(torneoActivo || null); } else { setTorneo(null); } } catch (error) { console.error('Error al cargar torneo:', error); setError(error.message); }
  };

  const handleChange = (e) => {
    // ... (Sin cambios aquí, la lógica anterior funciona)
    const { name, value } = e.target; setFormData(prev => { const newState = { ...prev, [name]: value }; if (name === 'formato') { newState.cantidadEquipos = value === 'eliminatoria' ? (prev.cantidadEquipos || '16') : ''; } return newState; });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // La validación de cantidad de equipos solo aplica si estamos CREANDO una eliminatoria
    if (!editando && formData.formato === 'eliminatoria' && !['8', '16', '32'].includes(formData.cantidadEquipos)) {
        setError("Para formato Eliminatoria, la cantidad de equipos debe ser 8, 16 o 32.");
        return;
    }

    try {
      // Al enviar, si estamos editando y era eliminatoria, nos aseguramos de no enviar cambios
      // en formato o cantidad (aunque el backend también lo ignora).
      // Si estamos creando, enviamos todo como estaba.
      const dataToSend = {
          nombre_torneo: formData.nombre,
          fecha_inicio: formData.fechaInicio,
          fecha_fin: formData.fechaFin,
          tipo_torneo: formData.tipo,
          formato: formData.formato, // Lo enviamos siempre, el backend decide si lo ignora
           // Enviamos cantidad solo si el formato ES eliminatoria (nuevo o editado sin cambiar)
          ...(formData.formato === 'eliminatoria' && { cantidad_equipos: parseInt(formData.cantidadEquipos, 10) })
      };

      const options = { /* ... (Sin cambios en method, headers, credentials) ... */ method: editando ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(dataToSend) };
      const url = editando ? `${API_URL}/${torneo.id_torneo}` : API_URL;
      const response = await fetch(url, options);
      if (!response.ok) { /* ... (Manejo de error sin cambios) ... */ const errorData = await response.json().catch(() => ({ error: 'Error desconocido al guardar torneo' })); throw new Error(errorData.error || 'Error al guardar torneo'); }

      setMostrarForm(false);
      setEditando(false);
      setFormatoOriginalAlEditar(''); // Limpiamos el formato original guardado
      setFormData(initialFormData);
      cargarTorneo();
    } catch (error) { console.error('Error al guardar torneo:', error); setError(error.message); }
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    // --- GUARDAMOS EL FORMATO ORIGINAL ---
    setFormatoOriginalAlEditar(torneo.formato || '');
    // --- FIN ---
    setFormData({
      nombre: torneo.nombre_torneo || "",
      fechaInicio: torneo.fecha_inicio ? torneo.fecha_inicio.split('T')[0] : "",
      fechaFin: torneo.fecha_fin ? torneo.fecha_fin.split('T')[0] : "",
      formato: torneo.formato || "",
      tipo: torneo.tipo_torneo || "",
      cantidadEquipos: torneo.formato === 'eliminatoria' ? (torneo.cantidad_equipos?.toString() || "16") : "",
    });
    setEditando(true);
    setMostrarForm(true);
  };

  const handleDelete = async (e) => {
    // ... (Sin cambios en handleDelete)
    e.stopPropagation(); if (window.confirm(`¿Seguro querés eliminar el torneo "${torneo.nombre_torneo}"?`)) { try { const response = await fetch(`${API_URL}/${torneo.id_torneo}`, { method: 'DELETE', credentials: 'include', }); if (!response.ok) { const errorData = await response.json().catch(() => ({ error: 'Error desconocido al eliminar torneo' })); throw new Error(errorData.error || 'Error al eliminar torneo'); } setTorneo(null); setError(""); } catch (error) { console.error('Error al eliminar torneo:', error); setError(error.message); } }
  };


  return (
    <>
      <header className="app-header">
         {/* ... (Header sin cambios) ... */}
         <div className="header-logo"><a href="/">TORNEO</a></div><nav className="header-nav"><a href="/torneo" className="btn">Torneos</a><a href="/equipo" className="btn">Equipo</a><a href="#" className="btn">Estadísticas</a><a href="/usuarios" className="btn">Usuarios</a><a href="/login" className="btn btn-login">Login</a></nav>
      </header>

      <div className="app-container">
        {error && <p className="error-message">{error}</p>}

        <div className="main-content-wrapper">
          <h1 className="main-title">Bienvenido</h1>

          {torneo && !mostrarForm && (
              // ... (Tarjeta del torneo sin cambios) ...
              <div className="torneo-card" onClick={() => navigate(`/torneo/${torneo.id_torneo}/fixture`)} style={{ cursor: 'pointer' }} title="Click para ver el fixture"> <h2 className="torneo-name">{torneo.nombre_torneo}</h2> <div className="torneo-details"> <p><span className="detail-label">Inicio:</span> {torneo.fecha_inicio_formato || torneo.fecha_inicio}</p> <p><span className="detail-label">Fin:</span> {torneo.fecha_fin_formato || torneo.fecha_fin}</p> <p><span className="detail-label">Tipo:</span> {torneo.tipo_torneo}</p> <p><span className="detail-label">Formato:</span> {torneo.formato}</p> {/* Mostramos cantidad si existe */} {torneo.cantidad_equipos && <p><span className="detail-label">Equipos:</span> {torneo.cantidad_equipos}</p>} </div> {isAdmin && ( <div className="button-group"> <button onClick={handleEdit} className="btn btn-edit">✏️ Editar</button> <button onClick={handleDelete} className="btn btn-delete">🗑️ Eliminar</button> </div> )} </div>
          )}

          {!torneo && !mostrarForm && (
              // ... (Tarjeta "sin torneo" sin cambios) ...
             <div className="torneo-card no-torneo-card"> <p className="no-torneo-text"> Lo sentimos, por el momento no tenemos ningún torneo agendado. </p> {isAdmin && ( <button onClick={() => setMostrarForm(true)} className="btn btn-create"> ➕ Crear Nuevo Torneo </button> )} </div>
          )}

          {isAdmin && mostrarForm && (
            <form onSubmit={handleSubmit} className="form-card">
              <h2 className={`form-title ${editando ? "title-edit" : "title-create"}`}>
                {editando ? "✏️ Editar Torneo" : "➕ Crear Nuevo Torneo"}
              </h2>
              <div className="form-inputs-container">
                  <input type="text" name="nombre" placeholder="Nombre del torneo" value={formData.nombre} onChange={handleChange} className="form-input-nombreTorneo" required />
                  {/* Inputs Fecha Inicio/Fin y Tipo (sin cambios) */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}> <label style={{ fontSize: '0.9rem', fontWeight: '500' }}>Fecha de inicio</label> <input type="date" name="fechaInicio" value={formData.fechaInicio} onChange={handleChange} className="form-input" required /> </div> <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}> <label style={{ fontSize: '0.9rem', fontWeight: '500' }}>Fecha de fin</label> <input type="date" name="fechaFin" value={formData.fechaFin} onChange={handleChange} className="form-input" required /> </div> <select name="tipo" value={formData.tipo} onChange={handleChange} className="form-input" required> <option value="">Seleccionar tipo</option> <option value="futbol_5">Fútbol 5</option> <option value="futbol_7">Fútbol 7</option> <option value="futbol_11">Fútbol 11</option> </select>

                  {/* --- Select de Formato (AHORA CON DISABLED) --- */}
                  <select
                      name="formato"
                      value={formData.formato}
                      onChange={handleChange}
                      className="form-input"
                      required
                      // Se deshabilita si estamos editando Y el formato original era eliminatoria
                      disabled={editando && formatoOriginalAlEditar === 'eliminatoria'}
                      title={editando && formatoOriginalAlEditar === 'eliminatoria' ? "No se puede cambiar el formato una vez creado como Eliminatoria" : "Seleccionar formato"}
                  >
                    <option value="">Seleccionar formato</option>
                    <option value="liga">Liga</option>
                    <option value="eliminatoria">Eliminatoria</option>
                  </select>

                  {/* --- Select Condicional Cantidad Equipos (AHORA CON DISABLED) --- */}
                  {/* Aparece si el formato seleccionado es eliminatoria */}
                  {formData.formato === 'eliminatoria' && (
                      <select
                          name="cantidadEquipos"
                          value={formData.cantidadEquipos}
                          onChange={handleChange}
                          className="form-input"
                          required
                           // Se deshabilita si estamos editando Y el formato original era eliminatoria
                          disabled={editando && formatoOriginalAlEditar === 'eliminatoria'}
                          title={editando && formatoOriginalAlEditar === 'eliminatoria' ? "No se puede cambiar la cantidad de equipos una vez creado el torneo" : "Seleccionar cantidad de equipos"}
                      >
                          <option value="" disabled={formData.cantidadEquipos !== ""}>Nº de equipos (Eliminatoria)</option>
                          <option value="8">8 equipos</option>
                          <option value="16">16 equipos</option>
                          <option value="32">32 equipos</option>
                      </select>
                  )}

              </div>
              <div className="button-group-footer">
                  <button type="submit" className={`btn form-submit-btn ${editando ? "btn-edit-submit" : "btn-create-submit"}`}>
                    {editando ? "Guardar Cambios" : "Crear Torneo"}
                  </button>
                  <button type="button" onClick={() => { setMostrarForm(false); setEditando(false); setFormatoOriginalAlEditar(''); setFormData(initialFormData); setError(""); }} className="btn btn-cancel">
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