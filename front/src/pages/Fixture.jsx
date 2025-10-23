import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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

// --- Componente Partido (NUEVO) ---
// Extraemos la lógica de renderizar un partido a un componente reutilizable
function MatchBox({ partido, isAdmin, onEditClick, onDeleteClick }) {
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
            {isAdmin && (
                <button
                    onClick={(e) => { e.stopPropagation(); onDeleteClick(partido); }}
                    className="btn-eliminar-bracket"
                    title="Eliminar partido"
                >🗑️</button>
            )}
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

  useEffect(() => {
    cargarPartidos();
  }, [idTorneo]);

  const cargarPartidos = async () => {
    // ... (Sin cambios en cargarPartidos)
    setLoading(true); setError(null); try { const response = await fetch(`http://localhost:3000/partidos/${idTorneo}`, { credentials: 'include' }); if (!response.ok) { const errorData = await response.json().catch(() => ({})); throw new Error(errorData.error || `Error ${response.status}: No se pudo cargar el fixture`); } const data = await response.json(); setPartidos(data); } catch (err) { console.error("Error detallado:", err); setError(err.message); } finally { setLoading(false); }
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

  // --- Lógica para dividir partidos en TODAS las rondas ---
  // Asumiendo que el backend devuelve los 15 partidos en orden: 8 octavos, 4 cuartos, 2 semis, 1 final
  const round1Left = partidos.slice(0, 4);        // Octavos Izquierda
  const round1Right = partidos.slice(4, 8);       // Octavos Derecha
  const quarterFinalsLeft = partidos.slice(8, 10); // Cuartos Izquierda
  const quarterFinalsRight = partidos.slice(10, 12);// Cuartos Derecha
  const semiFinalsLeft = partidos.slice(12, 13);  // Semifinal Izquierda (1 partido)
  const semiFinalsRight = partidos.slice(13, 14); // Semifinal Derecha (1 partido)
  const finalMatch = partidos.slice(14, 15);      // Final (1 partido)
  // --- Fin Lógica Rondas ---


  if (loading) return <div className="fixture-container"><p>Cargando fixture...</p></div>;
  if (error) return ( /* ... (Sin cambios en manejo de error) ... */ <div className="fixture-container"> <button onClick={() => navigate('/')} className="btn-volver">← Volver</button> <p className="error-message">Error: {error}</p> <button onClick={cargarPartidos}>Reintentar Carga</button> </div> );

  // Helper para renderizar una columna de partidos
  const renderMatchColumn = (matches) => (
      matches.map(partido => (
          <MatchBox
              key={partido.id_partido}
              partido={partido}
              isAdmin={isAdmin}
              onEditClick={handleOpenEditModal}
              onDeleteClick={handleDelete}
          />
      ))
  );

  return (
    <div className="fixture-container">
      <button onClick={() => navigate('/')} className="btn-volver">← Volver</button>
      <h2>Cuadro del Torneo</h2>

      {partidos.length < 15 ? ( // Verificamos si tenemos todos los partidos esperados
        <p>Fixture incompleto o no generado correctamente (se esperan 15 partidos).</p>
      ) : (
        // --- INICIO NUEVA ESTRUCTURA BRACKET ---
        <div className="bracket">

          {/* Columna Octavos Izquierda */}
          <div className="round round-1 round-left">
            {renderMatchColumn(round1Left)}
          </div>

          {/* Columna Cuartos Izquierda */}
          <div className="round round-2 round-left">
            {renderMatchColumn(quarterFinalsLeft)}
          </div>

          {/* Columna Semifinal Izquierda */}
          <div className="round round-3 round-left">
             {renderMatchColumn(semiFinalsLeft)}
          </div>

          {/* Columna Final */}
          <div className="round round-final">
             <div className="final-match-placeholder">
                <div className="final-trophy">🏆</div>
                {/* Renderizamos el partido final usando el componente */}
                {finalMatch.length > 0 && renderMatchColumn(finalMatch)}
             </div>
          </div>

          {/* Columna Semifinal Derecha */}
           <div className="round round-3 round-right">
             {renderMatchColumn(semiFinalsRight)}
          </div>

          {/* Columna Cuartos Derecha */}
          <div className="round round-2 round-right">
             {renderMatchColumn(quarterFinalsRight)}
          </div>

          {/* Columna Octavos Derecha */}
          <div className="round round-1 round-right">
            {renderMatchColumn(round1Right)}
          </div>

        </div>
        // --- FIN NUEVA ESTRUCTURA BRACKET ---
      )}

      {/* --- Modal (sin cambios) --- */}
      {showEditModal && selectedPartido && (
        <EditMatchModal partido={selectedPartido} onClose={handleCloseEditModal} onSave={handleSaveChanges} isAdmin={isAdmin} />
      )}
    </div>
  );
}