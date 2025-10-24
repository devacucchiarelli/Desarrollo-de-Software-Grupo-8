import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
// Asegúrate que la ruta al CSS sea correcta. Si creaste TablaPosiciones.css,
// quizás este debería ser fixture.css o un nombre similar.
import '../styles/css/fixture.css';

function EditMatchModal({ partido, onClose, onSave, isAdmin }) {
  const [formData, setFormData] = useState({
    fecha_partido: partido.fecha_partido
      ? new Date(partido.fecha_partido).toISOString().slice(0, 16)
      : '',
    equipo_local: partido.equipo_local || '',
    equipo_visitante: partido.equipo_visitante || '',
    resultado_local: partido.resultado_local ?? 0,
    resultado_visitante: partido.resultado_visitante ?? 0,
    goleadores: partido.goleadores?.join(', ') || '',
    amarillas: partido.amarillas?.join(', ') || '',
    rojas: partido.rojas?.join(', ') || '',
  });

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value, 10) || 0 : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const dataToSend = {
      ...formData,
      fecha_partido: new Date(formData.fecha_partido).toISOString(),
      resultado_local: Number(formData.resultado_local),
      resultado_visitante: Number(formData.resultado_visitante),
      goleadores: formData.goleadores
        ? formData.goleadores
            .split(',')
            .map((id) => Number(id.trim()))
            .filter(Boolean)
        : [],
      amarillas: formData.amarillas
        ? formData.amarillas
            .split(',')
            .map((id) => Number(id.trim()))
            .filter(Boolean)
        : [],
      rojas: formData.rojas
        ? formData.rojas
            .split(',')
            .map((id) => Number(id.trim()))
            .filter(Boolean)
        : [],
    };

    onSave(partido.id_partido, dataToSend);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3>Editar Partido #{partido.id_partido}</h3>

        <form onSubmit={handleSubmit}>
          {/* Fecha y Equipos */}
          <div className="form-group">
            <label>Fecha y Hora:</label>
            <input
              type="datetime-local"
              name="fecha_partido"
              value={formData.fecha_partido}
              onChange={handleChange}
              required
              disabled={!isAdmin}
            />
          </div>

          <div className="form-group">
            <label>Equipo Local:</label>
            <input
              type="text"
              name="equipo_local"
              value={formData.equipo_local}
              onChange={handleChange}
              required
              disabled={!isAdmin}
            />
          </div>

          <div className="form-group">
            <label>Resultado Local:</label>
            <input
              type="number"
              name="resultado_local"
              value={formData.resultado_local}
              onChange={handleChange}
              min="0"
              disabled={!isAdmin}
            />
          </div>

          <div className="form-group">
            <label>Equipo Visitante:</label>
            <input
              type="text"
              name="equipo_visitante"
              value={formData.equipo_visitante}
              onChange={handleChange}
              required
              disabled={!isAdmin}
            />
          </div>

          <div className="form-group">
            <label>Resultado Visitante:</label>
            <input
              type="number"
              name="resultado_visitante"
              value={formData.resultado_visitante}
              onChange={handleChange}
              min="0"
              disabled={!isAdmin}
            />
          </div>

          {/* --- NUEVOS CAMPOS DE ESTADÍSTICAS --- */}
          <div className="form-group">
            <label>Goleadores (IDs separados por coma):</label>
            <input
              type="text"
              name="goleadores"
              value={formData.goleadores}
              onChange={handleChange}
              placeholder="Ej: 3, 7, 12"
              disabled={!isAdmin}
            />
          </div>

          <div className="form-group">
            <label>Tarjetas Amarillas (IDs separados por coma):</label>
            <input
              type="text"
              name="amarillas"
              value={formData.amarillas}
              onChange={handleChange}
              placeholder="Ej: 4, 8"
              disabled={!isAdmin}
            />
          </div>

          <div className="form-group">
            <label>Tarjetas Rojas (IDs separados por coma):</label>
            <input
              type="text"
              name="rojas"
              value={formData.rojas}
              onChange={handleChange}
              placeholder="Ej: 10"
              disabled={!isAdmin}
            />
          </div>
          {/* --- FIN CAMPOS DE ESTADÍSTICAS --- */}

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-cancelar">
              Cancelar
            </button>
            {isAdmin && (
              <button type="submit" className="btn-guardar">
                Guardar Cambios
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

// --- Fin Componente Modal ---

// --- Componente Partido (MODIFICADO: Sin botón eliminar) ---
function MatchBox({ partido, isAdmin, onEditClick }) { // Quitamos onDeleteClick de props
    return (
        <div
            key={partido.id_partido}
            className="partido-item clickable bracket-match"
            onClick={() => onEditClick(partido)}
            title="Click para editar"
        >
            <div className="partido-info">
                <span className="partido-fecha-bracket">{partido.fecha_formato?.split(' ')[0] || '-'}</span>
                <div className="equipo bracket-equipo">
                    <span>{partido.equipo_local || 'Por definir'}</span>
                    <span className="resultado">{partido.resultado_local ?? '-'}</span>
                </div>
                <div className="equipo bracket-equipo">
                    <span>{partido.equipo_visitante || 'Por definir'}</span>
                    <span className="resultado">{partido.resultado_visitante ?? '-'}</span>
                </div>
            </div>
            {/* --- SE ELIMINÓ EL BOTÓN DE BORRAR --- */}
        </div>
    );
}
// --- Fin Componente Partido ---


export default function Fixture({ isAdmin }) {
  const [partidos, setPartidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { idTorneo } = useParams();
  const navigate = useNavigate();
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPartido, setSelectedPartido] = useState(null);
  const [bracketSize, setBracketSize] = useState(0);

  useEffect(() => { cargarPartidos(); }, [idTorneo]);

  const cargarPartidos = async () => {
    // ... (Sin cambios aquí)
    setLoading(true); setError(null); setBracketSize(0); try { const response = await fetch(`http://localhost:3000/partidos/${idTorneo}`, { credentials: 'include' }); if (!response.ok) { const errorData = await response.json().catch(() => ({})); throw new Error(errorData.error || `Error ${response.status}: No se pudo cargar el fixture`); } const data = await response.json(); setPartidos(data); if (data.length === 7) setBracketSize(8); else if (data.length === 15) setBracketSize(16); else if (data.length === 31) setBracketSize(32); else if (data.length > 0) setError("Número inesperado de partidos recibidos."); } catch (err) { console.error("Error detallado:", err); setError(err.message); } finally { setLoading(false); }
  };

  const handleOpenEditModal = (partido) => { /* ... (Sin cambios) ... */ setSelectedPartido(partido); setShowEditModal(true); };
  const handleCloseEditModal = () => { /* ... (Sin cambios) ... */ setShowEditModal(false); setSelectedPartido(null); };
  const handleSaveChanges = async (idPartido, updatedData) => {
  try {
    // Actualizar partido
    const response = await fetch(`http://localhost:3000/partidos/${idPartido}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(updatedData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Error ${response.status}: No se pudo guardar`);
    }

    // Registrar estadísticas de jugadores
    const jugadoresStats = [];

    updatedData.goleadores.forEach((id_jugador) => {
      jugadoresStats.push({ id_jugador, goles: 1, amarillas: 0, rojas: 0 });
    });

    updatedData.amarillas.forEach((id_jugador) => {
      const existing = jugadoresStats.find(j => j.id_jugador === id_jugador);
      if (existing) existing.amarillas = 1;
      else jugadoresStats.push({ id_jugador, goles: 0, amarillas: 1, rojas: 0 });
    });

    updatedData.rojas.forEach((id_jugador) => {
      const existing = jugadoresStats.find(j => j.id_jugador === id_jugador);
      if (existing) existing.rojas = 1;
      else jugadoresStats.push({ id_jugador, goles: 0, amarillas: 0, rojas: 1 });
    });

    if (jugadoresStats.length > 0) {
      await fetch(`http://localhost:3000/estadisticas/jugadores`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_partido: idPartido, jugadoresStats }),
      });
    }

    // Cerrar modal y recargar fixture
    handleCloseEditModal();
    cargarPartidos();

  } catch (err) {
    console.error("Error al guardar:", err);
    alert(`Error al guardar: ${err.message}`);
  }
};

  const handleDelete = async (partido) => { /* ... (Sin cambios) ... */ if (window.confirm(`¿Seguro que querés eliminar el partido ${partido.equipo_local || '?'} vs ${partido.equipo_visitante || '?'}?`)) { try { const response = await fetch(`http://localhost:3000/partidos/${partido.id_partido}`, { method: 'DELETE', credentials: 'include' }); if (!response.ok) { const errorData = await response.json().catch(() => ({})); throw new Error(errorData.error || `Error ${response.status}: No tenés permiso`); } cargarPartidos(); } catch (err) { alert(`Error al eliminar: ${err.message}`); } } };

  // --- SE ELIMINÓ LA FUNCIÓN handleDelete ---

  // --- Lógica de slicing (Sin cambios) ---
  let rounds = {};
  if (bracketSize === 32) { rounds.r32Left = partidos.slice(0, 8); rounds.r32Right = partidos.slice(8, 16); rounds.r16Left = partidos.slice(16, 20); rounds.r16Right = partidos.slice(20, 24); rounds.qfLeft = partidos.slice(24, 26); rounds.qfRight = partidos.slice(26, 28); rounds.sfLeft = partidos.slice(28, 29); rounds.sfRight = partidos.slice(29, 30); rounds.final = partidos.slice(30, 31); }
  else if (bracketSize === 16) { rounds.r16Left = partidos.slice(0, 4); rounds.r16Right = partidos.slice(4, 8); rounds.qfLeft = partidos.slice(8, 10); rounds.qfRight = partidos.slice(10, 12); rounds.sfLeft = partidos.slice(12, 13); rounds.sfRight = partidos.slice(13, 14); rounds.final = partidos.slice(14, 15); }
  else if (bracketSize === 8) { rounds.qfLeft = partidos.slice(0, 2); rounds.qfRight = partidos.slice(2, 4); rounds.sfLeft = partidos.slice(4, 5); rounds.sfRight = partidos.slice(5, 6); rounds.final = partidos.slice(6, 7); }
  // --- Fin Lógica Slicing ---

  if (loading) return <div className="fixture-container"><p>Cargando fixture...</p></div>;
  if (error) return ( <div className="fixture-container"> <button onClick={() => navigate('/')} className="btn-volver">← Volver</button> <p className="error-message">Error: {error}</p> <button onClick={cargarPartidos}>Reintentar Carga</button> </div> );

  // Helper renderizar columna (MODIFICADO: ya no pasa onDeleteClick)
  const renderMatchColumn = (matches) => (
      matches.map(partido => (
          <MatchBox
              key={partido.id_partido}
              partido={partido}
              isAdmin={isAdmin}
              onEditClick={handleOpenEditModal}
              // onDeleteClick ya no se pasa
          />
      ))
  );

  return (
    <div className={`fixture-container bracket-${bracketSize || 'unknown'}`}>
      <button onClick={() => navigate('/')} className="btn-volver">← Volver</button>
      <h2>Cuadro del Torneo ({bracketSize} Equipos)</h2>

      {partidos.length === 0 && !loading ? (
        <p>No hay partidos generados para este torneo.</p>
      ) : bracketSize > 0 ? (
        <div className="bracket">
          {/* Renderizado Condicional de Rondas (SIN CAMBIOS EN JSX) */}
          {bracketSize === 32 && <div className="round round-5 round-left">{renderMatchColumn(rounds.r32Left)}</div>}
          {bracketSize >= 16 && <div className="round round-4 round-left">{renderMatchColumn(rounds.r16Left)}</div>}
          <div className="round round-3 round-left">{renderMatchColumn(rounds.qfLeft)}</div>
          <div className="round round-2 round-left">{renderMatchColumn(rounds.sfLeft)}</div>
          <div className="round round-final"> <div className="final-match-placeholder"> <div className="final-trophy">🏆</div> {rounds.final && renderMatchColumn(rounds.final)} </div> </div>
          <div className="round round-2 round-right">{renderMatchColumn(rounds.sfRight)}</div>
          <div className="round round-3 round-right">{renderMatchColumn(rounds.qfRight)}</div>
          {bracketSize >= 16 && <div className="round round-4 round-right">{renderMatchColumn(rounds.r16Right)}</div>}
          {bracketSize === 32 && <div className="round round-5 round-right">{renderMatchColumn(rounds.r32Right)}</div>}
        </div>
      ) : null }

      {showEditModal && selectedPartido && (
        <EditMatchModal partido={selectedPartido} onClose={handleCloseEditModal} onSave={handleSaveChanges} isAdmin={isAdmin} />
      )}
    </div>
  );
}