import { useState } from "react";
import '../styles/home.css'; 
import InscripcionEquipo from "../components/InscripcionEquipo";




function Home({ isAdmin }) {
  const [torneo, setTorneo] = useState(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [editando, setEditando] = useState(false);
  const [formData, setFormData] = useState({
    nombre: "", fechaInicio: "", fechaFin: "", formato: "", tipo: "", inscripcion: "", costo: "",
  });
  const [mostrarInscripcion, setMostrarInscripcion] = useState(false);
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
  
  return (
    <>
      {/* ===== NUEVO HEADER ===== */}
      <header className="app-header">
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
            <>
            <div className="torneo-card">
              <h2 className="torneo-name">{torneo.nombre}</h2>
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
  <div className="torneo-card no-torneo-card">
    <p className="no-torneo-text">
      Lo sentimos, por el momento no tenemos ningún torneo agendado. Mientras tanto podes mirar estadísticas y torneos!
    </p>
    {isAdmin && (
      <div className="torneo-card-buttons">
        <button onClick={() => setMostrarForm(true)} className="btn btn-create">
          ➕ Crear Nuevo Torneo
        </button>
        <button className="btn" onClick={() => setMostrarInscripcion(true)}>
          Inscripción a Torneo
        </button>
      </div>
    )}
  </div>
)}

          {/* --- FORMULARIO DE CREACIÓN/EDICIÓN --- */}
          {isAdmin && mostrarForm && (
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