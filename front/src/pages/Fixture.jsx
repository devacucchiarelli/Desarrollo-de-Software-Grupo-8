import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import '../styles/css/fixture.css';

function EditMatchModal({ partido, onClose, onSave, isAdmin, idTorneo }) {
  const [equipos, setEquipos] = useState([]);
  const [jugadoresLocal, setJugadoresLocal] = useState([]);
  const [jugadoresVisitante, setJugadoresVisitante] = useState([]);
  const [estadisticasJugadores, setEstadisticasJugadores] = useState({});
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    fecha_partido: partido.fecha_partido
      ? new Date(partido.fecha_partido).toISOString().slice(0, 16)
      : '',
    equipo_local: partido.id_equipo_local || '',
    equipo_visitante: partido.id_equipo_visitante || '',
    resultado_local: partido.resultado_local ?? 0,
    resultado_visitante: partido.resultado_visitante ?? 0,
  });

  useEffect(() => {
    const inicializar = async () => {
      await cargarEquipos();
      if (partido.id_equipo_local) {
        await cargarJugadores(partido.id_equipo_local, 'local');
      }
      if (partido.id_equipo_visitante) {
        await cargarJugadores(partido.id_equipo_visitante, 'visitante');
      }
      setLoading(false);
    };
    inicializar();
  }, []);

  useEffect(() => {
    if (formData.equipo_local && formData.equipo_local !== partido.id_equipo_local) {
      cargarJugadores(formData.equipo_local, 'local');
    }
  }, [formData.equipo_local]);

  useEffect(() => {
    if (formData.equipo_visitante && formData.equipo_visitante !== partido.id_equipo_visitante) {
      cargarJugadores(formData.equipo_visitante, 'visitante');
    }
  }, [formData.equipo_visitante]);

  const cargarEquipos = async () => {
    try {
      const responseInscripciones = await fetch('http://localhost:3000/inscripciones', {
        credentials: 'include'
      });

      if (!responseInscripciones.ok) return;

      const inscripciones = await responseInscripciones.json();
      const inscripcionesTorneo = inscripciones.filter(
        ins => {
          const torneoId = ins.id_torneo || ins.torneoId;
          return torneoId === parseInt(idTorneo);
        }
      );

      const idsEquiposInscritos = inscripcionesTorneo.map(
        ins => ins.id_equipo || ins.equipoId
      );

      if (idsEquiposInscritos.length === 0) {
        setEquipos([]);
        return;
      }

      const responseEquipos = await fetch('http://localhost:3000/equipos', {
        credentials: 'include'
      });

      if (responseEquipos.ok) {
        const todosEquipos = await responseEquipos.json();
        const equiposInscritos = todosEquipos.filter(
          equipo => idsEquiposInscritos.includes(equipo.id_equipo)
        );
        setEquipos(equiposInscritos);
      }
    } catch (err) {
      console.error('Error al cargar equipos:', err);
    }
  };

  const cargarJugadores = async (idEquipo, tipo) => {
    try {
      const response = await fetch(`http://localhost:3000/equipos/jugadores/${idEquipo}`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        if (tipo === 'local') {
          setJugadoresLocal(data);
        } else {
          setJugadoresVisitante(data);
        }
      }
    } catch (err) {
      console.error(`Error al cargar jugadores ${tipo}:`, err);
    }
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value, 10) || 0 : value,
    }));
  };

  const getPlayerKey = (idJugador, equipo) => `${equipo}_${idJugador}`;

  const toggleGol = (idJugador, equipo) => {
    const key = getPlayerKey(idJugador, equipo);
    setEstadisticasJugadores(prev => {
      const current = prev[key] || { id_usuario: idJugador, equipo, goles: 0, amarillas: 0, rojas: 0 };
      return {
        ...prev,
        [key]: { ...current, goles: current.goles + 1 }
      };
    });
  };

  const decrementarGol = (idJugador, equipo) => {
    const key = getPlayerKey(idJugador, equipo);
    setEstadisticasJugadores(prev => {
      const current = prev[key] || { id_usuario: idJugador, equipo, goles: 0, amarillas: 0, rojas: 0 };
      if (current.goles > 0) {
        return {
          ...prev,
          [key]: { ...current, goles: current.goles - 1 }
        };
      }
      return prev;
    });
  };

  const toggleAmarilla = (idJugador, equipo) => {
    const key = getPlayerKey(idJugador, equipo);
    setEstadisticasJugadores(prev => {
      const current = prev[key] || { id_usuario: idJugador, equipo, goles: 0, amarillas: 0, rojas: 0 };
      return {
        ...prev,
        [key]: { ...current, amarillas: current.amarillas === 0 ? 1 : 0 }
      };
    });
  };

  const toggleRoja = (idJugador, equipo) => {
    const key = getPlayerKey(idJugador, equipo);
    setEstadisticasJugadores(prev => {
      const current = prev[key] || { id_usuario: idJugador, equipo, goles: 0, amarillas: 0, rojas: 0 };
      return {
        ...prev,
        [key]: { ...current, rojas: current.rojas === 0 ? 1 : 0 }
      };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const equipoLocalSeleccionado = equipos.find(eq => eq.id_equipo === Number(formData.equipo_local));
    const equipoVisitanteSeleccionado = equipos.find(eq => eq.id_equipo === Number(formData.equipo_visitante));

    const goleadores = [];
    const amarillas = [];
    const rojas = [];

    Object.entries(estadisticasJugadores).forEach(([key, stats]) => {
      const idJugador = stats.id_usuario;
      if (stats.goles > 0) {
        for (let i = 0; i < stats.goles; i++) {
          goleadores.push(idJugador);
        }
      }
      if (stats.amarillas > 0) amarillas.push(idJugador);
      if (stats.rojas > 0) rojas.push(idJugador);
    });

    const dataToSend = {
      fecha_partido: new Date(formData.fecha_partido).toISOString(),
      equipo_local: equipoLocalSeleccionado?.nombre_equipo || '',
      equipo_visitante: equipoVisitanteSeleccionado?.nombre_equipo || '',
      id_equipo_local: Number(formData.equipo_local),
      id_equipo_visitante: Number(formData.equipo_visitante),
      resultado_local: Number(formData.resultado_local),
      resultado_visitante: Number(formData.resultado_visitante),
      goleadores,
      amarillas,
      rojas,
    };

    onSave(partido.id_partido, dataToSend);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3>{isAdmin ? 'Editar' : 'Ver'} Partido #{partido.id_partido}</h3>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <p>Cargando datos del partido...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
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
              <select
                name="equipo_local"
                value={formData.equipo_local}
                onChange={handleChange}
                required
                disabled={!isAdmin}
              >
                <option value="">Seleccionar equipo</option>
                {equipos.map(equipo => (
                  <option key={equipo.id_equipo} value={equipo.id_equipo}>
                    {equipo.nombre_equipo}
                  </option>
                ))}
              </select>
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
              <select
                name="equipo_visitante"
                value={formData.equipo_visitante}
                onChange={handleChange}
                required
                disabled={!isAdmin}
              >
                <option value="">Seleccionar equipo</option>
                {equipos.map(equipo => (
                  <option key={equipo.id_equipo} value={equipo.id_equipo}>
                    {equipo.nombre_equipo}
                  </option>
                ))}
              </select>
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

            {/* Estadísticas de Jugadores */}
            {(jugadoresLocal.length > 0 || jugadoresVisitante.length > 0) && (
              <div className="stats-section">
                <h4>Estadísticas de Jugadores</h4>

                {/* Jugadores Equipo Local */}
                {jugadoresLocal.length > 0 && (
                  <div className="team-stats-group">
                    <h5 style={{ color: '#3498db' }}>
                      {equipos.find(e => e.id_equipo === Number(formData.equipo_local))?.nombre_equipo || 'Equipo Local'}
                    </h5>
                    {jugadoresLocal.map(jugador => {
                      const key = getPlayerKey(jugador.id_usuario, 'local');
                      const stats = estadisticasJugadores[key] || { goles: 0, amarillas: 0, rojas: 0 };
                      return (
                        <div key={key} className="player-stats-row">
                          <span className="player-name">{jugador.nombre || jugador.email}</span>

                          <div className="stat-control">
                            <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); decrementarGol(jugador.id_usuario, 'local'); }} disabled={!isAdmin || stats.goles === 0}>-</button>
                            <span className={`stat-display goals ${stats.goles > 0 ? 'active' : ''}`}>⚽ {stats.goles}</span>
                            <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleGol(jugador.id_usuario, 'local'); }} disabled={!isAdmin}>+</button>
                          </div>

                          <button type="button" className={`stat-button yellow ${stats.amarillas > 0 ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleAmarilla(jugador.id_usuario, 'local'); }} disabled={!isAdmin}>🟨</button>
                          <button type="button" className={`stat-button red ${stats.rojas > 0 ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleRoja(jugador.id_usuario, 'local'); }} disabled={!isAdmin}>🟥</button>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Jugadores Equipo Visitante */}
                {jugadoresVisitante.length > 0 && (
                  <div className="team-stats-group">
                    <h5 style={{ color: '#e74c3c' }}>
                      {equipos.find(e => e.id_equipo === Number(formData.equipo_visitante))?.nombre_equipo || 'Equipo Visitante'}
                    </h5>
                    {jugadoresVisitante.map(jugador => {
                      const key = getPlayerKey(jugador.id_usuario, 'visitante');
                      const stats = estadisticasJugadores[key] || { goles: 0, amarillas: 0, rojas: 0 };
                      return (
                        <div key={key} className="player-stats-row">
                          <span className="player-name">{jugador.nombre || jugador.email}</span>

                          <div className="stat-control">
                            <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); decrementarGol(jugador.id_usuario, 'visitante'); }} disabled={!isAdmin || stats.goles === 0}>-</button>
                            <span className={`stat-display goals ${stats.goles > 0 ? 'active' : ''}`}>⚽ {stats.goles}</span>
                            <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleGol(jugador.id_usuario, 'visitante'); }} disabled={!isAdmin}>+</button>
                          </div>

                          <button type="button" className={`stat-button yellow ${stats.amarillas > 0 ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleAmarilla(jugador.id_usuario, 'visitante'); }} disabled={!isAdmin}>🟨</button>
                          <button type="button" className={`stat-button red ${stats.rojas > 0 ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleRoja(jugador.id_usuario, 'visitante'); }} disabled={!isAdmin}>🟥</button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            <div className="modal-actions">
              <button type="button" onClick={onClose} className="btn-cancelar">Cerrar</button>
              {isAdmin && <button type="submit" className="btn-guardar">Guardar Cambios</button>}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function MatchBox({ partido, isAdmin, onEditClick }) {
  const handleClick = () => {
    // Cualquiera puede ver, solo admin puede editar
    onEditClick(partido);
  };

  return (
    <div
      key={partido.id_partido}
      className="partido-item clickable bracket-match"
      onClick={handleClick}
      title={isAdmin ? "Click para editar" : "Click para ver detalles"}
      style={{ cursor: 'pointer' }}
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
    </div>
  );
}

export default function Fixture({ usuario }) {
  const [partidos, setPartidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { idTorneo } = useParams();
  const navigate = useNavigate();
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPartido, setSelectedPartido] = useState(null);
  const [bracketSize, setBracketSize] = useState(0);

  // Helper de roles
  const isAdmin = usuario?.rol === 'administrador';

  useEffect(() => { cargarPartidos(); }, [idTorneo]);

  const cargarPartidos = async () => {
    setLoading(true);
    setError(null);
    setBracketSize(0);
    try {
      const response = await fetch(`http://localhost:3000/partidos/${idTorneo}`, { credentials: 'include' });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Error ${response.status}: No se pudo cargar el fixture`);
      }
      const data = await response.json();
      setPartidos(data);
      if (data.length === 7) setBracketSize(8);
      else if (data.length === 15) setBracketSize(16);
      else if (data.length === 31) setBracketSize(32);
      else if (data.length > 0) setError("Número inesperado de partidos recibidos.");
    } catch (err) {
      console.error("Error detallado:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEditModal = (partido) => {
    setSelectedPartido(partido);
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setSelectedPartido(null);
  };

  const handleSaveChanges = async (idPartido, updatedData) => {
    try {
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

      const jugadoresStatsMap = {};

      updatedData.goleadores.forEach((id_jugador) => {
        if (!jugadoresStatsMap[id_jugador]) {
          jugadoresStatsMap[id_jugador] = { id_jugador, goles: 0, amarillas: 0, rojas: 0 };
        }
        jugadoresStatsMap[id_jugador].goles += 1;
      });

      updatedData.amarillas.forEach((id_jugador) => {
        if (!jugadoresStatsMap[id_jugador]) {
          jugadoresStatsMap[id_jugador] = { id_jugador, goles: 0, amarillas: 0, rojas: 0 };
        }
        jugadoresStatsMap[id_jugador].amarillas = 1;
      });

      updatedData.rojas.forEach((id_jugador) => {
        if (!jugadoresStatsMap[id_jugador]) {
          jugadoresStatsMap[id_jugador] = { id_jugador, goles: 0, amarillas: 0, rojas: 0 };
        }
        jugadoresStatsMap[id_jugador].rojas = 1;
      });

      const jugadoresStats = Object.values(jugadoresStatsMap);
      const jugadoresValidos = jugadoresStats.filter(j => j.id_jugador);

      if (jugadoresValidos.length > 0) {
        const statsResponse = await fetch(`http://localhost:3000/api/estadisticas/jugadores`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            id_partido: idPartido,
            jugadoresStats: jugadoresValidos
          }),
        });

        if (statsResponse.ok) {
          alert('✅ Partido y estadísticas guardados correctamente');
        } else {
          alert('⚠️ Partido guardado pero hubo un error al guardar las estadísticas');
        }
      } else {
        alert('✅ Partido guardado correctamente');
      }

      handleCloseEditModal();
      cargarPartidos();

    } catch (err) {
      console.error("Error al guardar:", err);
      alert(`Error al guardar: ${err.message}`);
    }
  };

  let rounds = {};
  if (bracketSize === 32) {
    rounds.r32Left = partidos.slice(0, 8);
    rounds.r32Right = partidos.slice(8, 16);
    rounds.r16Left = partidos.slice(16, 20);
    rounds.r16Right = partidos.slice(20, 24);
    rounds.qfLeft = partidos.slice(24, 26);
    rounds.qfRight = partidos.slice(26, 28);
    rounds.sfLeft = partidos.slice(28, 29);
    rounds.sfRight = partidos.slice(29, 30);
    rounds.final = partidos.slice(30, 31);
  }
  else if (bracketSize === 16) {
    rounds.r16Left = partidos.slice(0, 4);
    rounds.r16Right = partidos.slice(4, 8);
    rounds.qfLeft = partidos.slice(8, 10);
    rounds.qfRight = partidos.slice(10, 12);
    rounds.sfLeft = partidos.slice(12, 13);
    rounds.sfRight = partidos.slice(13, 14);
    rounds.final = partidos.slice(14, 15);
  }
  else if (bracketSize === 8) {
    rounds.qfLeft = partidos.slice(0, 2);
    rounds.qfRight = partidos.slice(2, 4);
    rounds.sfLeft = partidos.slice(4, 5);
    rounds.sfRight = partidos.slice(5, 6);
    rounds.final = partidos.slice(6, 7);
  }

  if (loading) return <div className="fixture-container"><p>Cargando fixture...</p></div>;
  if (error) return (
    <div className="fixture-container">
      <button onClick={() => navigate('/')} className="btn-volver">← Volver</button>
      <p className="error-message">Error: {error}</p>
      <button onClick={cargarPartidos}>Reintentar Carga</button>
    </div>
  );

  const renderMatchColumn = (matches) => (
    matches.map(partido => (
      <MatchBox
        key={partido.id_partido}
        partido={partido}
        isAdmin={isAdmin}
        onEditClick={handleOpenEditModal}
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
          {bracketSize === 32 && <div className="round round-5 round-left">{renderMatchColumn(rounds.r32Left)}</div>}
          {bracketSize >= 16 && <div className="round round-4 round-left">{renderMatchColumn(rounds.r16Left)}</div>}
          <div className="round round-3 round-left">{renderMatchColumn(rounds.qfLeft)}</div>
          <div className="round round-2 round-left">{renderMatchColumn(rounds.sfLeft)}</div>
          <div className="round round-final">
            <div className="final-match-placeholder">
              <div className="final-trophy">🏆</div>
              {rounds.final && renderMatchColumn(rounds.final)}
            </div>
          </div>
          <div className="round round-2 round-right">{renderMatchColumn(rounds.sfRight)}</div>
          <div className="round round-3 round-right">{renderMatchColumn(rounds.qfRight)}</div>
          {bracketSize >= 16 && <div className="round round-4 round-right">{renderMatchColumn(rounds.r16Right)}</div>}
          {bracketSize === 32 && <div className="round round-5 round-right">{renderMatchColumn(rounds.r32Right)}</div>}
        </div>
      ) : null}

      {showEditModal && selectedPartido && (
        <EditMatchModal
          partido={selectedPartido}
          idTorneo={idTorneo}
          onClose={handleCloseEditModal}
          onSave={handleSaveChanges}
          isAdmin={isAdmin}
        />
      )}
    </div>
  );
}