import { useState } from "react";
import '../styles/home.css'; 
import { useNavigate } from "react-router-dom"; // <-- AÑADIR ESTA LÍNEA

function Home({ isAdmin }) {
  const [torneo, setTorneo] = useState(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [editando, setEditando] = useState(false);
  const [formData, setFormData] = useState({
    nombre: "", fechaInicio: "", fechaFin: "", formato: "", tipo: "", inscripcion: "", costo: "",
  });
<<<<<<< Updated upstream
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleSubmit = (e) => {
    e.preventDefault();
    setTorneo(formData);
    setMostrarForm(false);
    setEditando(false);
    setFormData({ nombre: "", fechaInicio: "", fechaFin: "", formato: "", tipo: "", inscripcion: "", costo: "" });
  };
  const handleEdit = () => {
    setFormData(torneo);
    setEditando(true);
    setMostrarForm(true);
  };
  const handleDelete = () => setTorneo(null);
=======
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
>>>>>>> Stashed changes
  
  return (
    <>
      {/* ===== NUEVO HEADER ===== */}
      <header className="app-header">
        {/* ... (sin cambios en el header) ... */}
        <div className="header-logo">
          <a href="/">TORNEO</a>
        </div>
        <nav className="header-nav">
          <a href="#" className="btn">Torneos</a>
          <a href="#" className="btn">Estadísticas</a>
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
<<<<<<< Updated upstream
            <>
            <div className="torneo-card">
              <h2 className="torneo-name">{torneo.nombre}</h2>
=======
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
>>>>>>> Stashed changes
              <div className="torneo-details">
                  <p><span className="detail-label">Inicio:</span> {torneo.fechaInicio}</p>
                  <p><span className="detail-label">Fin:</span> {torneo.fechaFin}</p>
                  <p><span className="detail-label">Tipo:</span> {torneo.tipo}</p>
                  <p><span className="detail-label">Formato:</span> {torneo.formato}</p>
                  <p><span className="detail-label">Limite de inscripción:</span> {torneo.inscripcion}</p>
                  <p><span className="detail-label">Inscripcion por equipo:</span> {torneo.costo}</p>
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
<<<<<<< Updated upstream
            <>
=======
            // ... (sin cambios aquí)
>>>>>>> Stashed changes
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
            // ... (sin cambios aquí)
            <form onSubmit={handleSubmit} className="form-card">
              <h2 className={`form-title ${editando ? "title-edit" : "title-create"}`}>
                {editando ? "✏️ Editar Torneo" : "➕ Crear Nuevo Torneo"}
              </h2>
              <div className="form-inputs-container">
                  <input type="text" name="nombre" placeholder="Nombre del torneo" value={formData.nombre} onChange={handleChange} className="form-input-nombreTorneo" required />
                  <input type="date" name="fechaInicio" title="Fecha de inicio" value={formData.fechaInicio} onChange={handleChange} className="form-input" required />
                  <input type="date" name="fechaFin" title="Fecha de fin" value={formData.fechaFin} onChange={handleChange} className="form-input" required />
                  <input type="text" name="tipo" placeholder="Ej: Fútbol 7, Fútbol 5" value={formData.tipo} onChange={handleChange} className="form-input" required />
                  <input type="text" name="formato" placeholder="Ej: Liga, Eliminación Directa" value={formData.formato} onChange={handleChange} className="form-input" required />
                  <input type="text" name="inscripcion" placeholder="Limite de inscripción" value={formData.inscripcion} onChange={handleChange} className="form-input" required />
                  <input type="text" name="costo" placeholder="Costo por equipo" value={formData.costo} onChange={handleChange} className="form-input" required />
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